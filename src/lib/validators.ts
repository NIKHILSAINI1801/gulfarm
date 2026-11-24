import { z } from 'zod';

export const enquiryFormSchema = z.object({
  shopName: z.string().trim().min(2, 'Enter your shop or showroom name'),
  contactPerson: z.string().trim().min(2, 'Enter contact person name'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, 'Enter a valid 10-digit WhatsApp or mobile number'),
  email: z.string().trim().email('Enter a valid email address').or(z.literal('')),
  city: z.string().trim().min(2, 'Enter your city'),
  state: z.string().trim().min(2, 'Enter your state'),
  gstNumber: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(val),
      'Enter a valid 15-character GSTIN or leave blank'
    ),
  totalQuantity: z.coerce.number().int().min(1, 'Enter estimated total pieces (min 1)'),
  customLabel: z.boolean(),
  notes: z.string().trim().max(2000),
  honeypot: z.string().max(0).optional(),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export const catalogueLeadFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, 'Enter a valid mobile or WhatsApp number'),
  shopName: z.string().trim().min(2, 'Enter your shop name'),
  city: z.string().trim(),
  consent: z.boolean().refine((val) => val === true, 'Please confirm to proceed'),
});

export type CatalogueLeadFormValues = z.infer<typeof catalogueLeadFormSchema>;

export const visitFormSchema = z.object({
  shopName: z.string().trim().min(2, 'Enter your shop name'),
  contactPerson: z.string().trim().min(2, 'Enter your name'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, 'Enter a valid phone / WhatsApp number'),
  city: z.string().trim().min(2, 'Enter your city'),
  visitMode: z.enum(['Video Call Stock Viewing', 'Seelampur Factory Visit']),
  preferredDate: z.string().trim().min(2, 'Enter preferred date or time window'),
  notes: z.string().trim().max(1000),
});

export type VisitFormValues = z.infer<typeof visitFormSchema>;
