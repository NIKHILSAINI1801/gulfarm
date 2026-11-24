import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { put } from '@vercel/blob';

export interface StorageAdapter {
  saveFile(buffer: Buffer, originalName: string, folder?: string): Promise<string>;
}

const UPLOADS_ROOT = path.resolve(process.cwd(), 'public', 'uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export class LocalDiskStorageAdapter implements StorageAdapter {
  async saveFile(buffer: Buffer, originalName: string, folder = 'general'): Promise<string> {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const targetDir = path.resolve(UPLOADS_ROOT, safeFolder);
    if (!targetDir.startsWith(UPLOADS_ROOT + path.sep) && targetDir !== UPLOADS_ROOT) {
      throw new Error('Invalid upload folder');
    }
    ensureDir(targetDir);

    const ext = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.pdf']);
    if (!allowedExts.has(ext)) {
      throw new Error('Unsupported file extension');
    }

    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const resolvedFile = path.resolve(targetDir, uniqueName);
    if (!resolvedFile.startsWith(targetDir + path.sep)) {
      throw new Error('Path traversal rejected');
    }

    fs.writeFileSync(resolvedFile, buffer);
    return `/uploads/${safeFolder}/${uniqueName}`;
  }
}

export class VercelBlobStorageAdapter implements StorageAdapter {
  async saveFile(buffer: Buffer, originalName: string, folder = 'general'): Promise<string> {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required for uploads on Vercel.');
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const ext = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.pdf']);
    if (!allowedExts.has(ext)) {
      throw new Error('Unsupported file extension');
    }

    const blob = await put(`${safeFolder}/${crypto.randomBytes(16).toString('hex')}${ext}`, buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: ext === '.pdf' ? 'application/pdf' : undefined,
    });
    return blob.url;
  }
}

export const storageAdapter: StorageAdapter = process.env.VERCEL
  ? new VercelBlobStorageAdapter()
  : new LocalDiskStorageAdapter();

/**
 * Ensures a real, valid, non-empty PDF exists at /public/catalogue.pdf
 * until the admin uploads a custom seasonal lookbook PDF.
 */
export function ensureDefaultCataloguePdf(): string {
  const publicDir = process.env.VERCEL ? os.tmpdir() : path.resolve(process.cwd(), 'public');
  ensureDir(publicDir);
  const pdfPath = path.resolve(publicDir, 'catalogue.pdf');
  if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 200) {
    return pdfPath;
  }

  // Minimal valid single-page PDF describing MAGESTIC THREADs wholesale lookbook
  const lines = [
    'MAGESTIC THREADs - B2B WHOLESALE LOOKBOOK (2026-27)',
    'Manufacturer | B2B Wholesale Only | Pan-India Delivery',
    'Factory & Showroom: Seelampur, Delhi - 110053',
    '----------------------------------------------------------------',
    'COLLECTIONS:',
    '1. Bridal & Royal Velvet Sherwanis (MOQ: 4-6 pcs | Sizes: 36-46+)',
    '2. Embroidered Jodhpuri Bandhgala & Shrug Suits (MOQ: 6 pcs)',
    '3. Draped Indo-Western Achkan Sets (MOQ: 6 pcs)',
    '4. Ethnic Velvet & Imported Wedding Blazers (MOQ: 8 pcs)',
    '5. Jacquard & Silk Nehru Jackets / Sadri (MOQ: 10 pcs)',
    '6. Classic Collection Waistcoats & Kurta Sets (MOQ: 10 pcs)',
    '----------------------------------------------------------------',
    'WHOLESALE TERMS SUMMARY:',
    '- Direct factory pricing shared via formal quote on enquiry',
    '- Size sets: 36, 38, 40, 42, 44, 46 (48-52 on bulk order)',
    '- GST billing, UPI, NEFT/RTGS, Pan-India transport dispatch',
    '- Video-call stock inspection & Seelampur factory visits available',
    'Request wholesale prices at /collections or WhatsApp.',
  ];

  const streamContent =
    'BT\n/F1 12 Tf\n50 750 Td\n16 TL\n' +
    lines.map((l, idx) => `${idx === 0 ? '' : 'T* '}(${l.replace(/[()\\]/g, '')}) Tj`).join('\n') +
    '\nET';

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n'
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}\nendstream\nendobj\n`
  );
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  fs.writeFileSync(pdfPath, pdf, 'utf8');
  return pdfPath;
}
