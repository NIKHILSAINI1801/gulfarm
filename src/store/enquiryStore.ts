import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EnquiryCartItem {
  key: string; // productId + colour
  productId: number;
  slug: string;
  name: string;
  categoryName: string;
  image: string;
  colour: string;
  moq: number;
  sizeSplit: Record<string, number>;
  quantity: number;
}

interface ToastMessage {
  id: number;
  title: string;
  subtitle?: string;
}

interface EnquiryStoreState {
  items: EnquiryCartItem[];
  toast: ToastMessage | null;
  addItem: (item: Omit<EnquiryCartItem, 'key'>) => void;
  updateItemQuantity: (key: string, quantity: number) => void;
  updateItemSizeSplit: (key: string, sizeSplit: Record<string, number>) => void;
  removeItem: (key: string) => void;
  clearItems: () => void;
  showToast: (title: string, subtitle?: string) => void;
  dismissToast: () => void;
}

export const STANDARD_SIZES = ['36', '38', '40', '42', '44', '46'] as const;

export const useEnquiryStore = create<EnquiryStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      toast: null,
      addItem: (newItem) => {
        const key = `${newItem.productId}-${newItem.colour.toLowerCase()}`;
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key
                ? {
                    ...i,
                    quantity: i.quantity + newItem.quantity,
                    sizeSplit: Object.keys(newItem.sizeSplit).length > 0 ? newItem.sizeSplit : i.sizeSplit,
                  }
                : i
            ),
            toast: {
              id: Date.now(),
              title: `Updated in Enquiry List`,
              subtitle: `${newItem.name} (${newItem.colour})`,
            },
          });
        } else {
          set({
            items: [...get().items, { ...newItem, key }],
            toast: {
              id: Date.now(),
              title: `Added to Enquiry List`,
              subtitle: `${newItem.name} · MOQ ${newItem.moq} pcs`,
            },
          });
        }
      },
      updateItemQuantity: (key, quantity) => {
        const cleanQty = Math.max(1, Math.round(quantity));
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity: cleanQty } : i)),
        });
      },
      updateItemSizeSplit: (key, sizeSplit) => {
        const total = Object.values(sizeSplit).reduce((acc, n) => acc + (Number(n) || 0), 0);
        set({
          items: get().items.map((i) =>
            i.key === key
              ? {
                  ...i,
                  sizeSplit,
                  quantity: total > 0 ? total : i.quantity,
                }
              : i
          ),
        });
      },
      removeItem: (key) => {
        set({
          items: get().items.filter((i) => i.key !== key),
        });
      },
      clearItems: () => set({ items: [] }),
      showToast: (title, subtitle) => set({ toast: { id: Date.now(), title, subtitle } }),
      dismissToast: () => set({ toast: null }),
    }),
    {
      name: 'magestic-enquiry-list',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
