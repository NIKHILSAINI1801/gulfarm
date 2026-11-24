export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  productCount?: number;
}

export interface ProductVariant {
  id?: number;
  colourName: string;
  colourHex: string;
  stockStatus: 'Ready Stock' | 'Made to Order' | 'Low Stock' | string;
}

export interface ProductImage {
  id?: number;
  variantId?: number | null;
  url: string;
  type: 'front' | 'back' | 'closeup' | 'fabric' | string;
  sortOrder: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  categoryName: string;
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
  isNew: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface Testimonial {
  id: number;
  retailerName: string;
  shop: string;
  city: string;
  quote: string;
  image: string;
  sortOrder: number;
}

export interface EnquiryItemRecord {
  id?: number;
  productId: number | null;
  productName: string;
  colour: string;
  sizeSplit: Record<string, number>;
  quantity: number;
}

export interface EnquiryRecord {
  id: number;
  referenceCode: string;
  type: 'enquiry' | 'visit' | 'catalogue' | string;
  shopName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gstNumber: string;
  totalQuantity: number;
  customLabel: boolean;
  notes: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Won' | 'Lost';
  createdAt: string;
  items: EnquiryItemRecord[];
}

export type SiteSettings = Record<string, string>;
