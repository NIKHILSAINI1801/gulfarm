import bcrypt from 'bcryptjs';
import { db } from './db.ts';

// Uploaded MAGESTIC THREADs studio product photos (grouped by outfit & colourways)
const IMG_GROUP_7COL = '/assets/aistudio/846430292_18108414230110401_7559350944540047496_n._46a65b9c.webp';
const IMG_TONAL_BLACK = '/assets/aistudio/846754709_18108414260110401_2266685980413646933_n._fd3069d9.webp';
const IMG_TONAL_ROSE = '/assets/aistudio/851078824_18108414368110401_4942053119233521728_n._b23f86e5.webp';

const IMG_FLORAL_BLACK = '/assets/aistudio/855541802_18108697841110401_8126178396728038815_n._de022105.webp';
const IMG_ART5121_4COL = '/assets/aistudio/851078819_18108697805110401_7945612744065337611_n._b74a5982.webp';

const IMG_JACQ_TEAL = '/assets/aistudio/892495459_18114023363110401_1206434096407421723_n._a6ffc21a.webp';
const IMG_JACQ_GREY = '/assets/aistudio/899545214_18114023297110401_6697321987170012654_n._bcb451f4.webp';
const IMG_JACQ_BLACK = '/assets/aistudio/896108018_18114023333110401_7566992689175844675_n._6f16a941.webp';
const IMG_JACQ_MINT = '/assets/aistudio/892579605_18114023279110401_2582388755643184324_n._97c8edb8.webp';

const IMG_CREST_CAMEL = '/assets/aistudio/901196442_18114047018110401_3940048213596652428_n._2e9275bb.webp';
const IMG_CREST_IVORY = '/assets/aistudio/900714738_18114047000110401_8652400370299647197_n._8b104399.webp';
const IMG_CREST_NAVY = '/assets/aistudio/892011357_18114046961110401_1255140286580924769_n._b170261b.webp';

const IMG_ARCH_BLACK = '/assets/aistudio/912568064_18116476013110401_4731052217129199386_n._118c16a4.webp';
const IMG_ARCH_IVORY = '/assets/aistudio/916490004_18116475962110401_6212357301710409860_n._1838d81b.webp';
const IMG_ARCH_TEAL = '/assets/aistudio/915527937_18116475971110401_2067173931927232155_n._d8346dcb.webp';
const IMG_ARCH_NAVY = '/assets/aistudio/919239187_18116475989110401_6614736598669694579_n._66427847.webp';

// Generated complementary studio assets for Sherwanis, Nehru Jackets & Atelier
const IMG_HERO = '/src/assets/images/hero_jodhpuri_royal_1795480640095.jpg';
const IMG_SHERWANI = '/src/assets/images/cat_sherwani_maroon_1795480640420.jpg';
const IMG_NEHRU = '/src/assets/images/cat_nehru_gold_1795480643083.jpg';
const IMG_ATELIER = '/src/assets/images/about_atelier_showroom_1795480642607.jpg';

const CATALOG_SEED_VERSION = 'v2_real_studio_multi_colour';

export async function seedDatabase() {
  const seedVersionRow = db
    .prepare("SELECT value FROM settings WHERE key = 'catalog_seed_version'")
    .get() as Promise<{ value: string } | undefined>;

  const resolvedSeedVersion = await seedVersionRow;
  const needsCatalogSync = !resolvedSeedVersion || resolvedSeedVersion.value !== CATALOG_SEED_VERSION;

  if (needsCatalogSync) {
    await db.transaction(async (tx) => {
      if (process.env.VERCEL) {
        await tx.prepare('SELECT pg_advisory_xact_lock(74261509)').get();
      }

      const currentVersion = (await tx
        .prepare("SELECT value FROM settings WHERE key = 'catalog_seed_version'")
        .get()) as { value: string } | undefined;
      if (currentVersion?.value === CATALOG_SEED_VERSION) return;
      if (currentVersion) {
        await tx.prepare(
          "UPDATE settings SET value = ? WHERE key = 'catalog_seed_version'"
        ).run(CATALOG_SEED_VERSION);
        return;
      }

      await tx.prepare('DELETE FROM product_images').run();
      await tx.prepare('DELETE FROM product_variants').run();
      await tx.prepare('DELETE FROM products').run();
      await tx.prepare('DELETE FROM categories').run();

      const insertCategory = tx.prepare(
        'INSERT INTO categories (name, slug, description, image, sort_order) VALUES (?, ?, ?, ?, ?)'
      );

      const categories = [
        [
          'Sherwanis',
          'sherwanis',
          'Bridal velvet, raw silk, and heavy zardozi groom sherwanis crafted in-house for high-margin showroom floors.',
          IMG_SHERWANI,
          1,
        ],
        [
          'Jodhpuri',
          'jodhpuri',
          'Signature embroidered Jodhpuri shrug suits and textured jacquard bandhgala sets in 4–7 colourway packs.',
          IMG_ARCH_NAVY,
          2,
        ],
        [
          'Indo-Western',
          'indo-western',
          'Article 5121 floral zardozi shrugs, Mughal arch ensembles, and reception outfits built for modern wedding retail.',
          IMG_ARCH_IVORY,
          3,
        ],
        [
          'Blazers',
          'blazers',
          'Heritage crest zardozi-collar bandhgala blazers and velvet reception coats in midnight navy, ivory, and camel.',
          IMG_CREST_NAVY,
          4,
        ],
        [
          'Nehru Jackets',
          'nehru-jackets',
          'High-turnover brocade, jute silk, and handloom Nehru jackets (Sadri) in bulk festive colourways.',
          IMG_NEHRU,
          5,
        ],
        [
          'Classic Collection',
          'classic-collection',
          'Timeless textured waistcoats, Sadri jackets, and versatile bandhgala essentials with steady year-round demand.',
          IMG_JACQ_GREY,
          6,
        ],
      ];

      for (const c of categories) {
        await insertCategory.run(...c);
      }

      const catMap = new Map<string, number>();
      const cats = (await tx.prepare('SELECT id, slug FROM categories').all()) as Array<{
        id: number;
        slug: string;
      }>;
      for (const c of cats) {
        catMap.set(c.slug, c.id);
      }

      const insertProduct = tx.prepare(`
        INSERT INTO products (
          name, slug, category_id, description, fabric, work, lining, buttons,
          sizes, moq, occasion, price_note, starting_price, is_new, is_best_seller, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertVariant = tx.prepare(
        'INSERT INTO product_variants (product_id, colour_name, colour_hex, stock_status) VALUES (?, ?, ?, ?)'
      );
      const insertImage = tx.prepare(
        'INSERT INTO product_images (product_id, variant_id, url, type, sort_order) VALUES (?, ?, ?, ?, ?)'
      );

      interface VariantSeed {
        colourName: string;
        colourHex: string;
        stockStatus: string;
        img: string;
      }

      interface ProductSeed {
        name: string;
        slug: string;
        categorySlug: string;
        description: string;
        fabric: string;
        work: string;
        lining: string;
        buttons: string;
        sizes: string;
        moq: number;
        occasion: string[];
        priceNote: string;
        startingPrice: string;
        isNew: number;
        isBestSeller: number;
        variants: VariantSeed[];
        extraImages: Array<{ url: string; type: 'front' | 'back' | 'closeup' | 'fabric' }>;
      }

      const productsData: ProductSeed[] = [
        {
          name: 'Mughal Arch Multi-Thread Jodhpuri Shrug Suit',
          slug: 'mughal-arch-multi-thread-jodhpuri-shrug',
          categorySlug: 'jodhpuri',
          description:
            '3-piece embroidered Jodhpuri shrug suit featuring full architectural Mughal-arch resham & antique zari work front and back, paired with matching inner waistcoat and tailored trousers.',
          fabric: 'Imported Italian Suiting & Velvet Finish',
          work: 'All-Over Mughal Arch Multi-Thread & Zari Embroidery',
          lining: 'Breathable Bemberg Satin Twill',
          buttons: 'Antique Crest Metal Hooks & Chain Brooch',
          sizes: '34, 36, 38, 40, 42, 44, 46',
          moq: 4, // TODO: Confirm MOQ with Gulfam
          occasion: ['Wedding', 'Sangeet', 'Reception'],
          priceNote: 'On request',
          startingPrice: '₹3,950 / pc',
          isNew: 1,
          isBestSeller: 1,
          variants: [
            { colourName: 'Midnight Navy', colourHex: '#13203E', stockStatus: 'Ready Stock', img: IMG_ARCH_NAVY },
            { colourName: 'Jet Black', colourHex: '#141418', stockStatus: 'Ready Stock', img: IMG_ARCH_BLACK },
            { colourName: 'Ivory Cream', colourHex: '#ECE4D5', stockStatus: 'Ready Stock', img: IMG_ARCH_IVORY },
            { colourName: 'Peacock Teal', colourHex: '#0F4D63', stockStatus: 'Ready Stock', img: IMG_ARCH_TEAL },
          ],
          extraImages: [
            { url: IMG_ARCH_NAVY, type: 'closeup' },
            { url: IMG_ARCH_BLACK, type: 'back' },
          ],
        },
        {
          name: 'Stitch of Brilliance Textured Jacquard Jodhpuri Shrug Suit',
          slug: 'stitch-of-brilliance-jacquard-jodhpuri-shrug',
          categorySlug: 'jodhpuri',
          description:
            'Sleek tone-on-tone woven jacquard 3-piece Jodhpuri shrug suit with clean mandarin collar, matching waistcoat, pocket chain brooch, and crisp flare-cut trouser. Includes front & back showroom finish.',
          fabric: 'Self-Woven Imported Floral Jacquard',
          work: 'Tonal Self-Jacquard Weave & Antique Brooch Trim',
          lining: 'Smooth Satin Viscose',
          buttons: 'Engraved Antique Metal Buttons',
          sizes: '36, 38, 40, 42, 44, 46',
          moq: 6,
          occasion: ['Reception', 'Sangeet', 'Wedding'],
          priceNote: 'On request',
          startingPrice: '₹3,250 / pc',
          isNew: 1,
          isBestSeller: 1,
          variants: [
            { colourName: 'Peacock Teal', colourHex: '#0F526D', stockStatus: 'Ready Stock', img: IMG_JACQ_TEAL },
            { colourName: 'Silver Stone Grey', colourHex: '#CBC7BE', stockStatus: 'Ready Stock', img: IMG_JACQ_GREY },
            { colourName: 'Jet Black', colourHex: '#16161A', stockStatus: 'Ready Stock', img: IMG_JACQ_BLACK },
            { colourName: 'Mint Sage', colourHex: '#A8C5B2', stockStatus: 'Ready Stock', img: IMG_JACQ_MINT },
          ],
          extraImages: [
            { url: IMG_JACQ_TEAL, type: 'closeup' },
            { url: IMG_JACQ_GREY, type: 'fabric' },
          ],
        },
        {
          name: 'Royal Tonal-Hem Embroidered Jodhpuri Shrug Set',
          slug: 'royal-tonal-hem-embroidered-jodhpuri-shrug',
          categorySlug: 'jodhpuri',
          description:
            'Bestselling 3-piece reception & wedding Jodhpuri set featuring delicate tonal floral embroidery along the lower hem and cuffs, finished with metallic buttons and chain brooch.',
          fabric: 'Imported Matte Suiting & Tonal Thread',
          work: 'Tonal Border & Sleeve Embroidery',
          lining: 'Breathable Bemberg Satin',
          buttons: 'Antique Gold Crest Buttons',
          sizes: '36, 38, 40, 42, 44, 46',
          moq: 6,
          occasion: ['Wedding', 'Sangeet', 'Festive'],
          priceNote: 'On request',
          startingPrice: '₹3,450 / pc',
          isNew: 1,
          isBestSeller: 1,
          variants: [
            { colourName: 'Jet Black', colourHex: '#151519', stockStatus: 'Ready Stock', img: IMG_TONAL_BLACK },
            { colourName: 'Dusty Rose', colourHex: '#B9848C', stockStatus: 'Ready Stock', img: IMG_TONAL_ROSE },
            { colourName: 'Cream Ivory', colourHex: '#EFE6D5', stockStatus: 'Ready Stock', img: IMG_GROUP_7COL },
            { colourName: 'Midnight Navy', colourHex: '#122244', stockStatus: 'Ready Stock', img: IMG_GROUP_7COL },
            { colourName: 'Sage Green', colourHex: '#7D9782', stockStatus: 'Ready Stock', img: IMG_GROUP_7COL },
            { colourName: 'Lavender', colourHex: '#B6A2BE', stockStatus: 'Made to Order', img: IMG_GROUP_7COL },
            { colourName: 'Powder Blue', colourHex: '#92B0C9', stockStatus: 'Made to Order', img: IMG_GROUP_7COL },
          ],
          extraImages: [
            { url: IMG_GROUP_7COL, type: 'back' },
            { url: IMG_TONAL_ROSE, type: 'closeup' },
          ],
        },
        {
          name: 'Article 5121 Floral Zari Jodhpuri Shrug Suit',
          slug: 'article-5121-floral-zari-jodhpuri-shrug',
          categorySlug: 'indo-western',
          description:
            'Article No. 5121 — Signature floral rose-gold & zari embroidered Jodhpuri shrug layered over a tailored bandhgala waistcoat and slim-flare formal trousers.',
          fabric: 'Imported Velvet & Silk-Blend Suiting',
          work: 'Floral Resham, Cut-Dana & Gold Zari Border',
          lining: 'Soft Viscose Twill',
          buttons: 'Antique Gold Bar Clasps',
          sizes: '34, 36, 38, 40 (42–46 on bulk order)',
          moq: 4,
          occasion: ['Wedding', 'Sangeet', 'Reception'],
          priceNote: 'On request',
          startingPrice: '₹3,650 / pc',
          isNew: 1,
          isBestSeller: 1,
          variants: [
            { colourName: 'Jet Black', colourHex: '#141418', stockStatus: 'Ready Stock', img: IMG_FLORAL_BLACK },
            { colourName: 'Midnight Navy', colourHex: '#101F3E', stockStatus: 'Ready Stock', img: IMG_ART5121_4COL },
            { colourName: 'Teal Blue', colourHex: '#0F4F66', stockStatus: 'Ready Stock', img: IMG_ART5121_4COL },
            { colourName: 'Ivory Cream', colourHex: '#EFE6D6', stockStatus: 'Ready Stock', img: IMG_ART5121_4COL },
          ],
          extraImages: [
            { url: IMG_ART5121_4COL, type: 'back' },
            { url: IMG_FLORAL_BLACK, type: 'closeup' },
          ],
        },
        {
          name: 'Heritage Crest Zardozi Collar Bandhgala Coat',
          slug: 'heritage-crest-zardozi-collar-bandhgala',
          categorySlug: 'blazers',
          description:
            'Tailored Bandhgala ethnic blazer coat featuring hand-embroidered zardozi mandarin collar and royal chest crest motif with antique gold dome buttons.',
          fabric: 'Heavy Imported Italian Wool-Blend Suiting',
          work: 'Hand Zardozi Collar & Chest Crest Motif',
          lining: 'Jacquard Bemberg Lining',
          buttons: 'Gold Crest Dome Shank Buttons',
          sizes: '36, 38, 40, 42, 44, 46',
          moq: 6,
          occasion: ['Wedding', 'Reception', 'Festive'],
          priceNote: 'On request',
          startingPrice: '₹2,850 / pc',
          isNew: 1,
          isBestSeller: 1,
          variants: [
            { colourName: 'Midnight Navy', colourHex: '#101C36', stockStatus: 'Ready Stock', img: IMG_CREST_NAVY },
            { colourName: 'Ivory White', colourHex: '#F3EFE6', stockStatus: 'Ready Stock', img: IMG_CREST_IVORY },
            { colourName: 'Camel Brown', colourHex: '#7A4924', stockStatus: 'Ready Stock', img: IMG_CREST_CAMEL },
          ],
          extraImages: [
            { url: IMG_CREST_IVORY, type: 'closeup' },
            { url: IMG_CREST_CAMEL, type: 'fabric' },
          ],
        },
        {
          name: 'Badshah Maroon Velvet Bridal Sherwani',
          slug: 'badshah-maroon-velvet-bridal-sherwani',
          categorySlug: 'sherwanis',
          description:
            'Rich royal maroon micro-velvet groom sherwani adorned with intricate dabka, resham, and cut-dana hand embroidery across the chest, cuffs, and flare hem.',
          fabric: '9000 Micro Velvet',
          work: 'Hand Dabka, Zardozi & Resham Thread Work',
          lining: 'Quilted Viscose Satin',
          buttons: 'Antique Polki Dome Buttons',
          sizes: '36, 38, 40, 42, 44, 46',
          moq: 4,
          occasion: ['Wedding'],
          priceNote: 'On request',
          startingPrice: '₹5,400 / pc',
          isNew: 1,
          isBestSeller: 1,
          variants: [
            { colourName: 'Royal Maroon', colourHex: '#5A0F1F', stockStatus: 'Ready Stock', img: IMG_SHERWANI },
            { colourName: 'Midnight Navy', colourHex: '#0F1B33', stockStatus: 'Ready Stock', img: IMG_HERO },
          ],
          extraImages: [
            { url: IMG_HERO, type: 'back' },
            { url: IMG_SHERWANI, type: 'closeup' },
          ],
        },
        {
          name: 'Nizam Zardozi Velvet Groom Sherwani & Stole Set',
          slug: 'nizam-zardozi-velvet-sherwani-stole',
          categorySlug: 'sherwanis',
          description:
            'Heritage midnight navy & maroon velvet bridal sherwani paired with zardozi-bordered velvet stole for Dulha showroom flagship displays.',
          fabric: 'Imported Velvet & Raw Silk',
          work: 'Heavy Adda Zardozi & Sequined Border',
          lining: 'Soft Cotton Mulmul',
          buttons: 'Gold Filigree Metal Buttons',
          sizes: '36, 38, 40, 42, 44, 46',
          moq: 4,
          occasion: ['Wedding', 'Reception'],
          priceNote: 'On request',
          startingPrice: '₹4,900 / pc',
          isNew: 0,
          isBestSeller: 1,
          variants: [
            { colourName: 'Midnight Navy & Maroon', colourHex: '#0F1B33', stockStatus: 'Ready Stock', img: IMG_HERO },
            { colourName: 'Royal Maroon', colourHex: '#5A0F1F', stockStatus: 'Ready Stock', img: IMG_SHERWANI },
          ],
          extraImages: [
            { url: IMG_SHERWANI, type: 'back' },
            { url: IMG_HERO, type: 'closeup' },
          ],
        },
        {
          name: 'Banarasi Brocade Antique Gold Nehru Jacket',
          slug: 'banarasi-brocade-gold-nehru-jacket',
          categorySlug: 'nehru-jackets',
          description:
            'High-margin woven brocade Nehru waistcoat with crisp stand collar and matching pocket square, supplied in full colour-assorted sets.',
          fabric: 'Banarasi Silk Jacquard',
          work: 'Woven Zari Motifs & Collar Piping',
          lining: 'Pure Cotton Poplin',
          buttons: 'Hammered Antique Brass Buttons',
          sizes: '36, 38, 40, 42, 44, 46',
          moq: 10,
          occasion: ['Festive', 'Wedding', 'Sangeet'],
          priceNote: 'On request',
          startingPrice: '₹950 / pc',
          isNew: 1,
          isBestSeller: 1,
          variants: [
            { colourName: 'Maroon Gold', colourHex: '#7A2E2E', stockStatus: 'Ready Stock', img: IMG_NEHRU },
            { colourName: 'Midnight Navy', colourHex: '#0F1B33', stockStatus: 'Ready Stock', img: IMG_CREST_NAVY },
          ],
          extraImages: [
            { url: IMG_NEHRU, type: 'closeup' },
            { url: IMG_CREST_NAVY, type: 'fabric' },
          ],
        },
        {
          name: 'Kesar Classic Jacquard Waistcoat & Trouser Set',
          slug: 'kesar-classic-jacquard-waistcoat-set',
          categorySlug: 'classic-collection',
          description:
            'Classic textured jacquard waistcoat and tailored coat set designed for steady year-round showroom turnover.',
          fabric: 'Self-Textured Jacquard & Raw Silk',
          work: 'Heritage Collar Piping & Pocket Chain',
          lining: 'Soft Cotton Lining',
          buttons: 'Antique Gold Dome Studs',
          sizes: '36, 38, 40, 42, 44, 46',
          moq: 8,
          occasion: ['Festive', 'Wedding'],
          priceNote: 'On request',
          startingPrice: '₹1,650 / set',
          isNew: 0,
          isBestSeller: 1,
          variants: [
            { colourName: 'Silver Stone Grey', colourHex: '#CBC7BE', stockStatus: 'Ready Stock', img: IMG_JACQ_GREY },
            { colourName: 'Mint Sage', colourHex: '#A8C5B2', stockStatus: 'Ready Stock', img: IMG_JACQ_MINT },
            { colourName: 'Maroon Gold', colourHex: '#7A2E2E', stockStatus: 'Ready Stock', img: IMG_NEHRU },
          ],
          extraImages: [
            { url: IMG_JACQ_MINT, type: 'back' },
            { url: IMG_NEHRU, type: 'fabric' },
          ],
        },
      ];

      for (const p of productsData) {
        const categoryId = catMap.get(p.categorySlug);
        if (!categoryId) continue;

        const res = await insertProduct.run(
          p.name,
          p.slug,
          categoryId,
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
          p.isNew,
          p.isBestSeller,
          1
        );
        const productId = Number(res.lastInsertRowid);

        for (const [idx, v] of p.variants.entries()) {
          const vRes = await insertVariant.run(productId, v.colourName, v.colourHex, v.stockStatus);
          const variantId = Number(vRes.lastInsertRowid);
          await insertImage.run(productId, variantId, v.img, idx === 0 ? 'front' : 'front', idx + 1);
        }

        for (const [idx, img] of p.extraImages.entries()) {
          await insertImage.run(
            productId,
            null,
            img.url,
            img.type,
            p.variants.length + idx + 1
          );
        }
      }

      await tx.prepare(
        "INSERT INTO settings (key, value) VALUES ('catalog_seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
      ).run(CATALOG_SEED_VERSION);
    });
  }

  const existingTestimonials = (await db.prepare('SELECT COUNT(*) as count FROM testimonials').get()) as {
    count: number;
  };
  if (Number(existingTestimonials.count) === 0) {
    const insertT = db.prepare(
      'INSERT INTO testimonials (retailer_name, shop, city, quote, image, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const items = [
      [
        'Rajesh Khandelwal',
        'Khandelwal Dulha Ghar',
        'Jaipur, Rajasthan',
        'We shifted 70% of our Jodhpuri and sherwani sourcing to MAGESTIC THREADs two wedding seasons ago. Sizing consistency across 36 to 46 saves us major alteration time.',
        IMG_ATELIER,
        1,
      ],
      [
        'Imran Siddiqui',
        'Nawab Men’s Ethnic Studio',
        'Lucknow, Uttar Pradesh',
        'Video-call stock checks from their Seelampur unit make reordering during peak November weddings effortless. Dispatch reaches Lucknow within 48 hours with full GST billing.',
        IMG_ARCH_NAVY,
        2,
      ],
      [
        'Harpreet Singh Arora',
        'Arora Wedding Emporium',
        'Ludhiana, Punjab',
        'Their embroidered Jodhpuri shrug sets and velvet blazers command strong retail margins in our showroom while maintaining dependable stitch quality.',
        IMG_GROUP_7COL,
        3,
      ],
    ];
    for (const t of items) {
      await insertT.run(...t);
    }
  }

  // Upsert confirmed contact & brand settings
  const confirmedSettings: Record<string, string> = {
    whatsapp_number: process.env.VITE_WHATSAPP_NUMBER || '919161876789',
    phone: '+91 91618 76789',
    email: 'wholesale@magesticthreads.in',
    instagram_url: 'https://www.instagram.com/magesticthreads?knvt=bGdsc253YmZwa2Zo',
    address: 'Plot 14, Main Garment Market, Seelampur, Delhi - 110053', // TODO: Confirm exact plot number
    gst_note: 'GSTIN: 07AABCM0000A1Z5 (Full GST B2B Invoicing)', // TODO: Confirm GSTIN
    show_starting_prices: 'false',
    hero_headline: "Factory-Direct Men's Ethnic Wear for Retailers",
    hero_subline: 'Manufacturer | B2B Wholesale Only | Pan-India Delivery | Seelampur, Delhi',
    atelier_image: IMG_ATELIER,
    hero_image: IMG_GROUP_7COL,
  };

  const upsertForce = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  // Ensure confirmed WhatsApp, phone, Instagram, and hero image are synced
  await upsertForce.run('whatsapp_number', confirmedSettings.whatsapp_number);
  await upsertForce.run('phone', confirmedSettings.phone);
  await upsertForce.run('instagram_url', confirmedSettings.instagram_url);
  await upsertForce.run('hero_image', confirmedSettings.hero_image);

  const insertIgnore = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING'
  );
  for (const [key, value] of Object.entries(confirmedSettings)) {
    await insertIgnore.run(key, value);
  }

  // Optional env-configured admin user
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);
    if (!existingAdmin) {
      await db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(
        email,
        hash,
        'ADMIN'
      );
    } else {
      await db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, email);
    }
  }
}
