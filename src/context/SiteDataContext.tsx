import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Category, SiteSettings, Testimonial } from '../types';

interface SiteDataContextValue {
  categories: Category[];
  testimonials: Testimonial[];
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  whatsapp_number: import.meta.env.VITE_WHATSAPP_NUMBER || '919161876789',
  phone: '+91 91618 76789',
  email: 'wholesale@magesticthreads.in',
  instagram_url: 'https://www.instagram.com/magesticthreads?knvt=bGdsc253YmZwa2Zo',
  address: 'Plot 14, Main Garment Market, Seelampur, Delhi - 110053',
  gst_note: 'GSTIN: 07AABCM0000A1Z5 (Full GST B2B Invoicing)',
  show_starting_prices: 'false',
  hero_headline: "Factory-Direct Men's Ethnic Wear for Retailers",
  hero_subline: 'Manufacturer | B2B Wholesale Only | Pan-India Delivery | Seelampur, Delhi',
};

const SiteDataContext = createContext<SiteDataContextValue>({
  categories: [],
  testimonials: [],
  settings: defaultSettings,
  loading: true,
  refresh: async () => {},
});

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories || []);
      setTestimonials(data.testimonials || []);
      setSettings((prev) => ({ ...prev, ...(data.settings || {}) }));
    } catch (err) {
      console.error('Bootstrap fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SiteDataContext.Provider value={{ categories, testimonials, settings, loading, refresh }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}
