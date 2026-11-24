import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, initDatabase } from './server/db.ts';
import { sendEnquiryNotifications } from './server/email.ts';
import { seedDatabase } from './server/seed.ts';
import { ensureDefaultCataloguePdf, storageAdapter } from './server/storage.ts';
import {
  AuthedRequest,
  rateLimit,
  requireAdminAuth,
  signAdminToken,
} from './server/auth.ts';
import {
  adminAuthSchema,
  b2bEnquirySchema,
  catalogueLeadSchema,
  categoryUpsertSchema,
  enquiryStatusSchema,
  productUpsertSchema,
  testimonialUpsertSchema,
  visitEnquirySchema,
} from './server/validators.ts';

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

// Serve uploaded assets from /public/uploads and static /public files
const publicDir = path.resolve(process.cwd(), 'public');
const uploadsDir = path.resolve(publicDir, 'uploads');
if (!process.env.VERCEL) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
}

let initialization: Promise<void> | undefined;
app.use(async (_req, _res, next) => {
  if (!_req.path.startsWith('/api/') && _req.path !== '/sitemap.xml') {
    next();
    return;
  }

  try {
    initialization ??= (async () => {
      await initDatabase();
      await seedDatabase();
      if (!process.env.VERCEL) ensureDefaultCataloguePdf();
    })();
    await initialization;
    next();
  } catch (error) {
    next(error);
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (process.env.VERCEL ? 4 : 15) * 1024 * 1024 },
});

async function hydrateProducts(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return [];
  const productIds = rows.map((r) => Number(r.id));
  const placeholders = productIds.map(() => '?').join(',');
  const variants = (await db
    .prepare(`SELECT * FROM product_variants WHERE product_id IN (${placeholders}) ORDER BY id ASC`)
    .all(...productIds)) as Array<Record<string, unknown>>;
  const images = (await db
    .prepare(`SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`)
    .all(...productIds)) as Array<Record<string, unknown>>;

  const variantsByProduct = new Map<number, Array<Record<string, unknown>>>();
  for (const v of variants) {
    const pid = Number(v.product_id);
    if (!variantsByProduct.has(pid)) variantsByProduct.set(pid, []);
    variantsByProduct.get(pid)!.push({
      id: Number(v.id),
      colourName: String(v.colour_name),
      colourHex: String(v.colour_hex),
      stockStatus: String(v.stock_status),
    });
  }

  const imagesByProduct = new Map<number, Array<Record<string, unknown>>>();
  for (const img of images) {
    const pid = Number(img.product_id);
    if (!imagesByProduct.has(pid)) imagesByProduct.set(pid, []);
    imagesByProduct.get(pid)!.push({
      id: Number(img.id),
      variantId: img.variant_id ? Number(img.variant_id) : null,
      url: String(img.url),
      type: String(img.type),
      sortOrder: Number(img.sort_order),
    });
  }

  return rows.map((r) => {
    let occasion: string[] = [];
    try {
      occasion = JSON.parse(String(r.occasion || '[]'));
    } catch {
      occasion = [];
    }
    return {
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      categoryId: Number(r.category_id),
      categoryName: r.category_name ? String(r.category_name) : '',
      categorySlug: r.category_slug ? String(r.category_slug) : '',
      description: String(r.description),
      fabric: String(r.fabric),
      work: String(r.work),
      lining: String(r.lining),
      buttons: String(r.buttons),
      sizes: String(r.sizes),
      moq: Number(r.moq),
      occasion,
      priceNote: String(r.price_note || 'On request'),
      startingPrice: String(r.starting_price || ''),
      isNew: Boolean(r.is_new),
      isBestSeller: Boolean(r.is_best_seller),
      isActive: Boolean(r.is_active),
      createdAt: String(r.created_at),
      variants: variantsByProduct.get(Number(r.id)) || [],
      images: imagesByProduct.get(Number(r.id)) || [],
    };
  });
}

async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = (await db.prepare('SELECT key, value FROM settings').all()) as Array<{
    key: string;
    value: string;
  }>;
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

function csvSafeCell(val: unknown): string {
  const str = String(val ?? '');
  const sanitized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

// ---------- PUBLIC API ROUTES ----------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/bootstrap', async (_req, res) => {
  const categories = (await db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
       FROM categories c ORDER BY c.sort_order ASC, c.id ASC`
    )
    .all()) as Array<Record<string, unknown>>;

  const testimonials = (await db
    .prepare('SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC')
    .all()) as Array<Record<string, unknown>>;

  const settings = await getSettingsMap();

  res.json({
    categories: categories.map((c) => ({
      id: Number(c.id),
      name: String(c.name),
      slug: String(c.slug),
      description: String(c.description),
      image: String(c.image),
      sortOrder: Number(c.sort_order),
      productCount: Number(c.product_count || 0),
    })),
    testimonials: testimonials.map((t) => ({
      id: Number(t.id),
      retailerName: String(t.retailer_name),
      shop: String(t.shop),
      city: String(t.city),
      quote: String(t.quote),
      image: String(t.image),
      sortOrder: Number(t.sort_order),
    })),
    settings,
  });
});

app.get('/api/products', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const colour = typeof req.query.colour === 'string' ? req.query.colour.trim() : '';
  const fabric = typeof req.query.fabric === 'string' ? req.query.fabric.trim() : '';
  const occasion = typeof req.query.occasion === 'string' ? req.query.occasion.trim() : '';
  const priceRange = typeof req.query.priceRange === 'string' ? req.query.priceRange.trim() : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'newest';
  const isNew = req.query.isNew === 'true';
  const isBestSeller = req.query.isBestSeller === 'true';
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 24)));

  const where: string[] = ['p.is_active = 1'];
  const params: unknown[] = [];

  if (category && category !== 'all') {
    where.push('c.slug = ?');
    params.push(category);
  }
  if (fabric && fabric !== 'all') {
    where.push('LOWER(p.fabric) LIKE ?');
    params.push(`%${fabric.toLowerCase()}%`);
  }
  if (occasion && occasion !== 'all') {
    where.push('LOWER(p.occasion) LIKE ?');
    params.push(`%${occasion.toLowerCase()}%`);
  }
  if (colour && colour !== 'all') {
    where.push(
      'EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND LOWER(pv.colour_name) LIKE ?)'
    );
    params.push(`%${colour.toLowerCase()}%`);
  }
  if (priceRange && priceRange !== 'all') {
    if (priceRange === 'budget') {
      where.push('(p.moq >= 10)');
    } else if (priceRange === 'mid') {
      where.push('(p.moq >= 6 AND p.moq < 10)');
    } else if (priceRange === 'premium') {
      where.push('(p.moq < 6)');
    }
  }
  if (isNew) {
    where.push('p.is_new = 1');
  }
  if (isBestSeller) {
    where.push('p.is_best_seller = 1');
  }
  if (search) {
    const q = `%${search.toLowerCase()}%`;
    where.push(
      '(LOWER(p.name) LIKE ? OR LOWER(p.fabric) LIKE ? OR LOWER(p.work) LIKE ? OR LOWER(c.name) LIKE ?)'
    );
    params.push(q, q, q, q);
  }

  const orderBy =
    sort === 'best_selling'
      ? 'p.is_best_seller DESC, p.created_at DESC, p.id DESC'
      : 'p.is_new DESC, p.created_at DESC, p.id DESC';

  const whereSql = where.join(' AND ');
  const totalRow = (await db
    .prepare(
      `SELECT COUNT(*) as count FROM products p JOIN categories c ON c.id = p.category_id WHERE ${whereSql}`
    )
    .get(...params)) as { count: number };

  const offset = (page - 1) * limit;
  const rows = (await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset)) as Array<Record<string, unknown>>;

  res.json({
    products: await hydrateProducts(rows),
    total: Number(totalRow.count),
    page,
    limit,
  });
});

app.get('/api/products/:slug', async (req, res) => {
  const row = (await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.is_active = 1`
    )
    .get(req.params.slug)) as Record<string, unknown> | undefined;

  if (!row) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const [product] = await hydrateProducts([row]);
  const relatedRows = (await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1 AND p.id != ?
       ORDER BY (p.category_id = ?) DESC, p.is_best_seller DESC
       LIMIT 4`
    )
    .all(product.id, product.categoryId)) as Array<Record<string, unknown>>;

  res.json({
    product,
    related: await hydrateProducts(relatedRows),
  });
});

app.post('/api/enquiries', rateLimit('enquiry', 20, 15 * 60 * 1000), async (req, res) => {
  const parsed = b2bEnquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      issues: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const data = parsed.data;

  // Optional Turnstile verification when TURNSTILE_SECRET_KEY is configured
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken) {
      res.status(400).json({ error: 'Bot verification required' });
      return;
    }
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: data.turnstileToken,
        }),
      });
      const verifyJson = (await verifyRes.json()) as { success?: boolean };
      if (!verifyJson.success) {
        res.status(400).json({ error: 'Verification check failed. Please retry.' });
        return;
      }
    } catch {
      res.status(502).json({ error: 'Verification service unreachable' });
      return;
    }
  }

  const referenceCode = `MT-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;

  const enquiryId = await db.transaction(async (tx) => {
    const info = await tx
      .prepare(
        `INSERT INTO enquiries (
          reference_code, type, shop_name, contact_person, phone, email,
          city, state, gst_number, total_quantity, custom_label, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`
      )
      .run(
        referenceCode,
        data.type,
        data.shopName,
        data.contactPerson,
        data.phone,
        data.email,
        data.city,
        data.state,
        data.gstNumber.toUpperCase(),
        data.totalQuantity,
        data.customLabel ? 1 : 0,
        data.notes
      );

    const enquiryId = Number(info.lastInsertRowid);
    const insertItem = tx.prepare(
      `INSERT INTO enquiry_items (enquiry_id, product_id, product_name, colour, size_split, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const item of data.items) {
      await insertItem.run(
        enquiryId,
        item.productId ?? null,
        item.productName,
        item.colour,
        JSON.stringify(item.sizeSplit),
        item.quantity
      );
    }
    return enquiryId;
  });

  sendEnquiryNotifications({
    referenceCode,
    type: data.type,
    shopName: data.shopName,
    contactPerson: data.contactPerson,
    phone: data.phone,
    email: data.email,
    city: data.city,
    state: data.state,
    gstNumber: data.gstNumber,
    totalQuantity: data.totalQuantity,
    customLabel: data.customLabel,
    notes: data.notes,
    items: data.items,
  }).catch((err) => console.error('Email dispatch error:', err));

  res.status(201).json({
    id: enquiryId,
    referenceCode,
    expectedResponse: 'Within 4 business hours (Mon–Sat, 10:00 AM – 7:30 PM IST)',
  });
});

app.post('/api/visit-request', rateLimit('visit', 15, 15 * 60 * 1000), async (req, res) => {
  const parsed = visitEnquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors });
    return;
  }
  const d = parsed.data;
  const referenceCode = `MT-V-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const notes = `${d.visitMode} | Preferred slot: ${d.preferredDate}${d.notes ? ` | ${d.notes}` : ''}`;

  await db.prepare(
    `INSERT INTO enquiries (
      reference_code, type, shop_name, contact_person, phone, email,
      city, state, gst_number, total_quantity, custom_label, notes, status
    ) VALUES (?, 'visit', ?, ?, ?, '', ?, '', '', 0, 0, ?, 'New')`
  ).run(referenceCode, d.shopName, d.contactPerson, d.phone, d.city, notes);

  sendEnquiryNotifications({
    referenceCode,
    type: 'visit',
    shopName: d.shopName,
    contactPerson: d.contactPerson,
    phone: d.phone,
    city: d.city,
    state: 'India',
    totalQuantity: 0,
    customLabel: false,
    notes,
    items: [],
  }).catch(() => {});

  res.status(201).json({ referenceCode });
});

app.post('/api/catalogue-lead', rateLimit('catalogue', 20, 15 * 60 * 1000), async (req, res) => {
  const parsed = catalogueLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors });
    return;
  }
  const d = parsed.data;
  const referenceCode = `MT-C-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  await db.prepare(
    `INSERT INTO enquiries (
      reference_code, type, shop_name, contact_person, phone, email,
      city, state, gst_number, total_quantity, custom_label, notes, status
    ) VALUES (?, 'catalogue', ?, ?, ?, '', ?, '', '', 0, 0, 'PDF Catalogue Download Lead', 'New')`
  ).run(referenceCode, d.shopName, d.name, d.phone, d.city);

  res.status(201).json({
    referenceCode,
    downloadUrl: '/api/catalogue/download',
  });
});

app.get('/api/catalogue/download', async (_req, res) => {
  const settings = await getSettingsMap();
  const customUrl = settings.catalogue_url;
  if (customUrl && /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(customUrl)) {
    res.redirect(customUrl);
    return;
  }
  if (customUrl && customUrl.startsWith('/uploads/')) {
    const safePath = path.resolve(publicDir, customUrl.replace(/^\//, ''));
    if (safePath.startsWith(uploadsDir + path.sep) && fs.existsSync(safePath)) {
      res.download(safePath, 'MAGESTIC-THREADs-Wholesale-Catalogue.pdf');
      return;
    }
  }
  const fallbackPdf = ensureDefaultCataloguePdf();
  res.download(fallbackPdf, 'MAGESTIC-THREADs-Wholesale-Catalogue.pdf');
});

// ---------- ADMIN AUTH ROUTES ----------

app.get('/api/admin/bootstrap-status', async (_req, res) => {
  const envConfigured = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
  const adminRow = (await db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'")
    .get()) as { count: number };

  res.json({
    needsBootstrap: !envConfigured && Number(adminRow.count) === 0,
    envConfigured,
  });
});

app.post('/api/admin/bootstrap', rateLimit('admin-bootstrap', 10, 15 * 60 * 1000), async (req, res) => {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    res.status(403).json({ error: 'Admin account is managed via environment secrets.' });
    return;
  }
  const existing = (await db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'")
    .get()) as { count: number };
  if (existing.count > 0) {
    res.status(403).json({ error: 'Admin account already claimed. Please sign in.' });
    return;
  }

  const parsed = adminAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid email and password (8+ chars) required.' });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const hash = bcrypt.hashSync(parsed.data.password, 12);
  await db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'ADMIN')").run(
    email,
    hash
  );

  const token = signAdminToken(email);
  res.status(201).json({ token, email, role: 'ADMIN' });
});

app.post('/api/admin/login', rateLimit('admin-login', 15, 15 * 60 * 1000), async (req, res) => {
  const parsed = adminAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid email and password required.' });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  // Env-configured admin overrides DB when present
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const envEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD;
    const emailMatch = email === envEmail;
    const passBuf = Buffer.from(password);
    const envBuf = Buffer.from(envPass);
    const passMatch =
      passBuf.length === envBuf.length && crypto.timingSafeEqual(passBuf, envBuf);
    if (emailMatch && passMatch) {
      res.json({ token: signAdminToken(email), email, role: 'ADMIN' });
      return;
    }
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const user = (await db
    .prepare("SELECT * FROM users WHERE email = ? AND role = 'ADMIN'")
    .get(email)) as { email: string; password_hash: string; role: string } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  res.json({ token: signAdminToken(user.email), email: user.email, role: 'ADMIN' });
});

app.get('/api/admin/me', requireAdminAuth, (req: AuthedRequest, res) => {
  res.json({ email: req.adminUser?.sub, role: req.adminUser?.role });
});

// ---------- PROTECTED ADMIN CRUD ROUTES ----------

app.get('/api/admin/overview', requireAdminAuth, async (_req, res) => {
  const productsCount = ((await db.prepare('SELECT COUNT(*) as c FROM products').get()) as { c: number }).c;
  const activeProductsCount = (
    (await db.prepare('SELECT COUNT(*) as c FROM products WHERE is_active = 1').get()) as { c: number }
  ).c;
  const enquiriesCount = ((await db.prepare('SELECT COUNT(*) as c FROM enquiries').get()) as { c: number }).c;
  const newEnquiriesCount = (
    (await db.prepare("SELECT COUNT(*) as c FROM enquiries WHERE status = 'New'").get()) as { c: number }
  ).c;
  const categoriesCount = ((await db.prepare('SELECT COUNT(*) as c FROM categories').get()) as { c: number }).c;

  res.json({
    productsCount,
    activeProductsCount,
    enquiriesCount,
    newEnquiriesCount,
    categoriesCount,
  });
});

app.get('/api/admin/products', requireAdminAuth, async (_req, res) => {
  const rows = (await db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.id DESC`
    )
    .all()) as Array<Record<string, unknown>>;
  res.json({ products: await hydrateProducts(rows) });
});

app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
  const parsed = productUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors });
    return;
  }
  const p = parsed.data;

  const existingSlug = await db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug);
  if (existingSlug) {
    res.status(409).json({ error: 'A product with this slug already exists.' });
    return;
  }

  const id = await db.transaction(async (tx) => {
    const info = await tx
      .prepare(
        `INSERT INTO products (
          name, slug, category_id, description, fabric, work, lining, buttons,
          sizes, moq, occasion, price_note, starting_price, is_new, is_best_seller, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        p.name,
        p.slug,
        p.categoryId,
        p.description,
        p.fabric,
        p.work,
        p.lining,
        p.buttons,
        p.sizes,
        p.moq,
        JSON.stringify(p.occasion),
        p.priceNote,
        p.startingPrice,
        p.isNew ? 1 : 0,
        p.isBestSeller ? 1 : 0,
        p.isActive ? 1 : 0
      );
    const productId = Number(info.lastInsertRowid);
    const insVar = tx.prepare(
      'INSERT INTO product_variants (product_id, colour_name, colour_hex, stock_status) VALUES (?, ?, ?, ?)'
    );
    for (const v of p.variants) {
      await insVar.run(productId, v.colourName, v.colourHex, v.stockStatus);
    }
    const insImg = tx.prepare(
      'INSERT INTO product_images (product_id, variant_id, url, type, sort_order) VALUES (?, NULL, ?, ?, ?)'
    );
    for (const [idx, img] of p.images.entries()) {
      await insImg.run(productId, img.url, img.type, img.sortOrder ?? idx + 1);
    }
    return productId;
  });

  res.status(201).json({ id });
});

app.put('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid product ID' });
    return;
  }
  const parsed = productUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors });
    return;
  }
  const p = parsed.data;

  await db.transaction(async (tx) => {
    await tx.prepare(
      `UPDATE products SET
        name = ?, slug = ?, category_id = ?, description = ?, fabric = ?, work = ?,
        lining = ?, buttons = ?, sizes = ?, moq = ?, occasion = ?, price_note = ?,
        starting_price = ?, is_new = ?, is_best_seller = ?, is_active = ?
       WHERE id = ?`
    ).run(
      p.name,
      p.slug,
      p.categoryId,
      p.description,
      p.fabric,
      p.work,
      p.lining,
      p.buttons,
      p.sizes,
      p.moq,
      JSON.stringify(p.occasion),
      p.priceNote,
      p.startingPrice,
      p.isNew ? 1 : 0,
      p.isBestSeller ? 1 : 0,
      p.isActive ? 1 : 0,
      id
    );

    await tx.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
    await tx.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);

    const insVar = tx.prepare(
      'INSERT INTO product_variants (product_id, colour_name, colour_hex, stock_status) VALUES (?, ?, ?, ?)'
    );
    for (const v of p.variants) {
      await insVar.run(id, v.colourName, v.colourHex, v.stockStatus);
    }
    const insImg = tx.prepare(
      'INSERT INTO product_images (product_id, variant_id, url, type, sort_order) VALUES (?, NULL, ?, ?, ?)'
    );
    for (const [idx, img] of p.images.entries()) {
      await insImg.run(id, img.url, img.type, img.sortOrder ?? idx + 1);
    }
  });

  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.post('/api/admin/categories', requireAdminAuth, async (req, res) => {
  const parsed = categoryUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }
  const c = parsed.data;
  const info = await db
    .prepare('INSERT INTO categories (name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?)')
    .run(c.name, c.slug, c.description, c.image, c.sortOrder);
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/admin/categories/:id', requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.get('/api/admin/enquiries', requireAdminAuth, async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const where: string[] = ['1=1'];
  const params: unknown[] = [];

  if (status && status !== 'all') {
    where.push('status = ?');
    params.push(status);
  }
  if (search) {
    const q = `%${search.toLowerCase()}%`;
    where.push(
      '(LOWER(shop_name) LIKE ? OR LOWER(contact_person) LIKE ? OR LOWER(city) LIKE ? OR LOWER(reference_code) LIKE ? OR LOWER(phone) LIKE ?)'
    );
    params.push(q, q, q, q, q);
  }

  const rows = (await db
    .prepare(`SELECT * FROM enquiries WHERE ${where.join(' AND ')} ORDER BY id DESC`)
    .all(...params)) as Array<Record<string, unknown>>;

  const items = (await db.prepare('SELECT * FROM enquiry_items ORDER BY id ASC').all()) as Array<
    Record<string, unknown>
  >;
  const itemsByEnquiry = new Map<number, Array<Record<string, unknown>>>();
  for (const item of items) {
    const eid = Number(item.enquiry_id);
    if (!itemsByEnquiry.has(eid)) itemsByEnquiry.set(eid, []);
    let sizeSplit: Record<string, number> = {};
    try {
      sizeSplit = JSON.parse(String(item.size_split || '{}'));
    } catch {
      sizeSplit = {};
    }
    itemsByEnquiry.get(eid)!.push({
      id: Number(item.id),
      productId: item.product_id ? Number(item.product_id) : null,
      productName: String(item.product_name),
      colour: String(item.colour),
      sizeSplit,
      quantity: Number(item.quantity),
    });
  }

  res.json({
    enquiries: rows.map((e) => ({
      id: Number(e.id),
      referenceCode: String(e.reference_code),
      type: String(e.type),
      shopName: String(e.shop_name),
      contactPerson: String(e.contact_person),
      phone: String(e.phone),
      email: String(e.email),
      city: String(e.city),
      state: String(e.state),
      gstNumber: String(e.gst_number),
      totalQuantity: Number(e.total_quantity),
      customLabel: Boolean(e.custom_label),
      notes: String(e.notes),
      status: String(e.status),
      createdAt: String(e.created_at),
      items: itemsByEnquiry.get(Number(e.id)) || [],
    })),
  });
});

app.patch('/api/admin/enquiries/:id/status', requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = enquiryStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  await db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(parsed.data.status, id);
  res.json({ ok: true });
});

app.get('/api/admin/enquiries/export', requireAdminAuth, async (_req, res) => {
  const rows = (await db.prepare('SELECT * FROM enquiries ORDER BY id DESC').all()) as Array<
    Record<string, unknown>
  >;
  const headers = [
    'Reference',
    'Type',
    'Status',
    'Shop Name',
    'Contact Person',
    'Phone',
    'Email',
    'City',
    'State',
    'GSTIN',
    'Total Quantity',
    'Private Label',
    'Notes',
    'Created At',
  ];
  const lines = [headers.map(csvSafeCell).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.reference_code,
        r.type,
        r.status,
        r.shop_name,
        r.contact_person,
        r.phone,
        r.email,
        r.city,
        r.state,
        r.gst_number,
        r.total_quantity,
        r.custom_label ? 'Yes' : 'No',
        r.notes,
        r.created_at,
      ]
        .map(csvSafeCell)
        .join(',')
    );
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="magestic-threads-enquiries.csv"');
  res.send(lines.join('\n'));
});

app.post('/api/admin/testimonials', requireAdminAuth, async (req, res) => {
  const parsed = testimonialUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed' });
    return;
  }
  const t = parsed.data;
  const info = await db
    .prepare(
      'INSERT INTO testimonials (retailer_name, shop, city, quote, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(t.retailerName, t.shop, t.city, t.quote, t.image, t.sortOrder);
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/admin/testimonials/:id', requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.put('/api/admin/settings', requireAdminAuth, async (req, res) => {
  const body = req.body as Record<string, unknown>;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Invalid settings payload' });
    return;
  }
  await db.transaction(async (tx) => {
    for (const [k, v] of Object.entries(body)) {
      if (typeof k === 'string' && /^[a-z0-9_]+$/.test(k) && typeof v === 'string') {
        await tx.prepare(
          'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
        ).run(k, v.slice(0, 2000));
      }
    }
  });
  res.json({ settings: await getSettingsMap() });
});

app.post('/api/admin/upload', requireAdminAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const folder = typeof req.body.folder === 'string' ? req.body.folder : 'products';
  try {
    const url = await storageAdapter.saveFile(req.file.buffer, req.file.originalname, folder);
    if (folder === 'catalogue' && req.file.originalname.toLowerCase().endsWith('.pdf')) {
      await db.prepare(
        "INSERT INTO settings (key, value) VALUES ('catalogue_url', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      ).run(url);
    }
    res.status(201).json({ url });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' });
  }
});

// ---------- SEO ROUTES (sitemap.xml & robots.txt) ----------

app.get('/sitemap.xml', async (req, res) => {
  const baseUrl =
    process.env.VITE_SITE_URL ||
    process.env.APP_URL ||
    `${req.protocol}://${req.get('host')}`;
  const cleanBase = baseUrl.replace(/\/$/, '');

  const staticPaths = [
    '/',
    '/collections',
    '/new-arrivals',
    '/best-sellers',
    '/how-wholesale-works',
    '/about',
    '/catalogue',
    '/policies',
    '/contact',
    '/enquiry',
    '/enquiry/submit',
  ];

  const categories = (await db.prepare('SELECT slug FROM categories').all()) as Array<{ slug: string }>;
  const products = (await db
    .prepare('SELECT slug, created_at FROM products WHERE is_active = 1')
    .all()) as Array<{ slug: string; created_at: string }>;

  const urls = [
    ...staticPaths.map((p) => `<url><loc>${cleanBase}${p}</loc><changefreq>weekly</changefreq></url>`),
    ...categories.map(
      (c) => `<url><loc>${cleanBase}/collections/${c.slug}</loc><changefreq>weekly</changefreq></url>`
    ),
    ...products.map(
      (p) => `<url><loc>${cleanBase}/product/${p.slug}</loc><changefreq>weekly</changefreq></url>`
    ),
  ];

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  );
});

app.get('/robots.txt', (req, res) => {
  const baseUrl =
    process.env.VITE_SITE_URL ||
    process.env.APP_URL ||
    `${req.protocol}://${req.get('host')}`;
  const cleanBase = baseUrl.replace(/\/$/, '');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${cleanBase}/sitemap.xml\n`
  );
});

// ---------- VITE / STATIC SPA ENTRYPOINT ----------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`MAGESTIC THREADs server listening on http://localhost:${port}`);
  });
}

if (process.env.VERCEL) {
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.resolve(publicDir, 'index.html'));
  });
} else {
  void startServer();
}

app.use((error: Error & { status?: number; statusCode?: number }, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Request failed:', error);
  if (res.headersSent) {
    next(error);
    return;
  }
  const requestedStatus = error.statusCode ?? error.status ?? 500;
  const status = requestedStatus >= 400 && requestedStatus < 600 ? requestedStatus : 500;
  res.status(status).json({ error: status < 500 ? error.message : 'Internal server error' });
});

export default app;
