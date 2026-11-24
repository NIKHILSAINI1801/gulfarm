import assert from 'node:assert/strict';
import { b2bEnquirySchema, catalogueLeadSchema, visitEnquirySchema } from '../server/validators.ts';

// Minimal localStorage shim for Node test execution of persisted Zustand store
const memStorage = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => memStorage.get(k) ?? null,
  setItem: (k: string, v: string) => {
    memStorage.set(k, v);
  },
  removeItem: (k: string) => {
    memStorage.delete(k);
  },
  clear: () => memStorage.clear(),
  key: (i: number) => Array.from(memStorage.keys())[i] ?? null,
  get length() {
    return memStorage.size;
  },
};

async function runTests() {
  // 1. Zod validator tests
  const validEnquiry = b2bEnquirySchema.safeParse({
    shopName: 'Royal Dulha Emporium',
    contactPerson: 'Vikram Jain',
    phone: '+91 9811223344',
    email: 'vikram@royaldulha.in',
    city: 'Jaipur',
    state: 'Rajasthan',
    gstNumber: '08AABCU9603R1ZM',
    totalQuantity: 18,
    customLabel: true,
    notes: 'Need urgent wedding season dispatch.',
    honeypot: '',
    items: [
      {
        productId: 1,
        productName: 'Nizam Zardozi Jodhpuri Shrug Suit',
        colour: 'Midnight Navy',
        sizeSplit: { '38': 2, '40': 4, '42': 4, '44': 2 },
        quantity: 12,
      },
    ],
  });
  assert.equal(validEnquiry.success, true, 'Valid B2B enquiry should pass Zod validation');

  const invalidPhone = b2bEnquirySchema.safeParse({
    shopName: 'Test Shop',
    contactPerson: 'Buyer',
    phone: '123',
    city: 'Delhi',
    state: 'Delhi',
    totalQuantity: 6,
  });
  assert.equal(invalidPhone.success, false, 'Short invalid phone number must fail validation');

  const invalidGst = b2bEnquirySchema.safeParse({
    shopName: 'Test Shop',
    contactPerson: 'Buyer',
    phone: '9811223344',
    city: 'Delhi',
    state: 'Delhi',
    gstNumber: 'INVALIDGST',
    totalQuantity: 6,
  });
  assert.equal(invalidGst.success, false, 'Malformed GSTIN must fail validation');

  const validLead = catalogueLeadSchema.safeParse({
    name: 'Ankit Sharma',
    phone: '9876543210',
    shopName: 'Sharma Ethnic',
    city: 'Indore',
    consent: true,
  });
  assert.equal(validLead.success, true, 'Valid catalogue lead should pass');

  const validVisit = visitEnquirySchema.safeParse({
    shopName: 'Nawab Studio',
    contactPerson: 'Imran',
    phone: '9810011223',
    city: 'Lucknow',
    visitMode: 'Video Call Stock Viewing',
    preferredDate: 'Friday 4 PM',
  });
  assert.equal(validVisit.success, true, 'Valid visit request should pass');

  // 2. Zustand Enquiry Store tests
  const { useEnquiryStore } = await import('../src/store/enquiryStore.ts');
  useEnquiryStore.getState().clearItems();
  assert.equal(useEnquiryStore.getState().items.length, 0);

  useEnquiryStore.getState().addItem({
    productId: 1,
    slug: 'nizam-zardozi-jodhpuri-shrug-suit',
    name: 'Nizam Zardozi Embroidered Jodhpuri Shrug Suit',
    categoryName: 'Jodhpuri',
    image: '/src/assets/images/hero_jodhpuri_royal_1795480640095.jpg',
    colour: 'Midnight Navy',
    moq: 6,
    sizeSplit: { '38': 1, '40': 2, '42': 2, '44': 1 },
    quantity: 6,
  });

  assert.equal(useEnquiryStore.getState().items.length, 1, 'Item should be added to store');
  assert.equal(useEnquiryStore.getState().items[0].quantity, 6);

  // Adding same product + colour increments quantity
  useEnquiryStore.getState().addItem({
    productId: 1,
    slug: 'nizam-zardozi-jodhpuri-shrug-suit',
    name: 'Nizam Zardozi Embroidered Jodhpuri Shrug Suit',
    categoryName: 'Jodhpuri',
    image: '/src/assets/images/hero_jodhpuri_royal_1795480640095.jpg',
    colour: 'Midnight Navy',
    moq: 6,
    sizeSplit: { '38': 1, '40': 2, '42': 2, '44': 1 },
    quantity: 6,
  });
  assert.equal(useEnquiryStore.getState().items.length, 1);
  assert.equal(useEnquiryStore.getState().items[0].quantity, 12);

  useEnquiryStore.getState().updateItemQuantity('1-midnight navy', 18);
  assert.equal(useEnquiryStore.getState().items[0].quantity, 18);

  useEnquiryStore.getState().removeItem('1-midnight navy');
  assert.equal(useEnquiryStore.getState().items.length, 0);

  console.log('All validator and Zustand store unit tests passed!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
