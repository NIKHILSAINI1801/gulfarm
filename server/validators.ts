import { z } from 'zod';

export const enquiryItemInputSchema = z.object({
  productId: z.number().int().positive().nullable().optional(),
  productName: z.string().trim().min(1).max(200),
  colour: z.string().trim().max(80).default('Standard'),
  sizeSplit: z.record(z.string(), z.number().int().min(0).max(5000)).default({}),
  quantity: z.number().int().min(1).max(100000),
});

export const b2bEnquirySchema = z.object({
  type: z.enum(['enquiry', 'visit', 'catalogue']).default('enquiry'),
  shopName: z.string().trim().min(2, 'Shop or business name is required').max(150),
  contactPerson: z.string().trim().min(2, 'Contact person name is required').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, 'Enter a valid WhatsApp or phone number'),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')).default(''),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
  gstNumber: z
    .string()
    .trim()
    .max(20)
    .refine(
      (val) => val === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(val),
      'Enter a valid 15-character GSTIN or leave blank'
    )
    .default(''),
  totalQuantity: z.coerce.number().int().min(1, 'Estimated quantity must be at least 1').max(100000),
  customLabel: z.boolean().default(false),
  notes: z.string().trim().max(2000).default(''),
  honeypot: z.string().max(0, 'Invalid submission').optional().default(''),
  turnstileToken: z.string().optional().default(''),
  items: z.array(enquiryItemInputSchema).max(100).default([]),
});

export const catalogueLeadSchema = z.object({
  name: z.string().trim().min(2, 'Your name is required').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, 'Enter a valid phone number'),
  shopName: z.string().trim().min(2, 'Shop name is required').max(150),
  city: z.string().trim().max(100).default(''),
  consent: z.boolean().refine((val) => val === true, 'Please confirm consent to download'),
});

export const visitEnquirySchema = z.object({
  shopName: z.string().trim().min(2, 'Shop name is required').max(150),
  contactPerson: z.string().trim().min(2, 'Your name is required').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, 'Enter a valid phone / WhatsApp number'),
  city: z.string().trim().min(2, 'City is required').max(100),
  visitMode: z.enum(['Video Call Stock Viewing', 'Seelampur Factory Visit']),
  preferredDate: z.string().trim().min(2, 'Select a preferred date or window').max(100),
  notes: z.string().trim().max(1000).default(''),
});

export const adminAuthSchema = z.object({
  email: z.string().trim().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const productUpsertSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9-]+$/),
  categoryId: z.coerce.number().int().positive(),
  description: z.string().trim().min(5).max(3000),
  fabric: z.string().trim().min(2).max(120),
  work: z.string().trim().min(2).max(160),
  lining: z.string().trim().min(2).max(120),
  buttons: z.string().trim().min(2).max(120),
  sizes: z.string().trim().min(2).max(160),
  moq: z.coerce.number().int().min(1).max(1000),
  occasion: z.array(z.string().trim().min(1)).default(['Wedding']),
  priceNote: z.string().trim().max(120).default('On request'),
  startingPrice: z.string().trim().max(80).default(''),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  variants: z
    .array(
      z.object({
        colourName: z.string().trim().min(1).max(60),
        colourHex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
        stockStatus: z.enum(['Ready Stock', 'Made to Order', 'Low Stock']).default('Ready Stock'),
      })
    )
    .min(1),
  images: z
    .array(
      z.object({
        url: z.string().trim().min(1),
        type: z.enum(['front', 'back', 'closeup', 'fabric']).default('front'),
        sortOrder: z.number().int().min(0).default(0),
      })
    )
    .min(1),
});

export const categoryUpsertSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(500).default(''),
  image: z.string().trim().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const testimonialUpsertSchema = z.object({
  retailerName: z.string().trim().min(2).max(120),
  shop: z.string().trim().min(2).max(150),
  city: z.string().trim().min(2).max(100),
  quote: z.string().trim().min(10).max(600),
  image: z.string().trim().default(''),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(['New', 'Contacted', 'Quoted', 'Won', 'Lost']),
});
