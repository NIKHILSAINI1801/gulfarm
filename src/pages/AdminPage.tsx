import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileUp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import type { Category, EnquiryRecord, Product, Testimonial } from '../types';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'enquiries'
  | 'testimonials'
  | 'settings';

export function AdminPage() {
  const { refresh: refreshPublicData } = useSiteData();

  // Bearer token held strictly in React state memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Auth form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Admin panel state
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [overview, setOverview] = useState({
    productsCount: 0,
    activeProductsCount: 0,
    enquiriesCount: 0,
    newEnquiriesCount: 0,
    categoriesCount: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [enquiryFilterStatus, setEnquiryFilterStatus] = useState('all');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Product editor state
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [pForm, setPForm] = useState({
    name: '',
    slug: '',
    categoryId: 1,
    description: '',
    fabric: 'Micro Velvet',
    work: 'Hand Zardozi & Thread Work',
    lining: 'Bemberg Satin',
    buttons: 'Antique Brass Buttons',
    sizes: '36, 38, 40, 42, 44, 46',
    moq: 6,
    occasion: 'Wedding, Sangeet',
    priceNote: 'On request',
    startingPrice: '',
    isNew: true,
    isBestSeller: false,
    isActive: true,
    colourName: 'Midnight Navy',
    colourHex: '#0F1B33',
    stockStatus: 'Ready Stock',
    imageUrl: '/src/assets/images/cat_jodhpuri_navy_1795480640263.jpg',
  });

  // Category form state
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '/src/assets/images/cat_sherwani_maroon_1795480640420.jpg',
    sortOrder: 7,
  });

  // Testimonial form state
  const [tForm, setTForm] = useState({
    retailerName: '',
    shop: '',
    city: '',
    quote: '',
  });

  useEffect(() => {
    document.title = 'Admin Back Office | MAGESTIC THREADs';
    fetch('/api/admin/bootstrap-status')
      .then((r) => r.json())
      .then((d) => setNeedsBootstrap(Boolean(d.needsBootstrap)))
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, []);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const loadAdminData = async (activeToken = token) => {
    if (!activeToken) return;
    const headers = { Authorization: `Bearer ${activeToken}` };
    const [ovRes, prRes, enRes, bsRes] = await Promise.all([
      fetch('/api/admin/overview', { headers }),
      fetch('/api/admin/products', { headers }),
      fetch('/api/admin/enquiries', { headers }),
      fetch('/api/bootstrap'),
    ]);
    if (ovRes.ok) setOverview(await ovRes.json());
    if (prRes.ok) {
      const pd = await prRes.json();
      setProducts(pd.products || []);
    }
    if (enRes.ok) {
      const ed = await enRes.json();
      setEnquiries(ed.enquiries || []);
    }
    if (bsRes.ok) {
      const bd = await bsRes.json();
      setCategories(bd.categories || []);
      setTestimonials(bd.testimonials || []);
      setSettingsMap(bd.settings || {});
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData(token);
    }
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const endpoint = needsBootstrap ? '/api/admin/bootstrap' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }
      setToken(data.token);
      setAdminEmail(data.email);
      setNeedsBootstrap(false);
    } catch {
      setAuthError('Network error during sign-in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    folder: string,
    onSuccess: (url: string) => void
  ) => {
    if (!token) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (res.ok && data.url) {
      onSuccess(data.url);
      setFeedbackMsg(`Uploaded ${file.name} successfully.`);
    } else {
      setFeedbackMsg(data.error || 'Upload failed.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: pForm.name,
      slug:
        pForm.slug ||
        pForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      categoryId: Number(pForm.categoryId),
      description: pForm.description,
      fabric: pForm.fabric,
      work: pForm.work,
      lining: pForm.lining,
      buttons: pForm.buttons,
      sizes: pForm.sizes,
      moq: Number(pForm.moq),
      occasion: pForm.occasion
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      priceNote: pForm.priceNote || 'On request',
      startingPrice: pForm.startingPrice,
      isNew: pForm.isNew,
      isBestSeller: pForm.isBestSeller,
      isActive: pForm.isActive,
      variants: [
        {
          colourName: pForm.colourName,
          colourHex: pForm.colourHex,
          stockStatus: pForm.stockStatus,
        },
      ],
      images: [
        { url: pForm.imageUrl, type: 'front', sortOrder: 1 },
        { url: pForm.imageUrl, type: 'back', sortOrder: 2 },
      ],
    };

    const url = editingProductId
      ? `/api/admin/products/${editingProductId}`
      : '/api/admin/products';
    const method = editingProductId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowProductForm(false);
      setEditingProductId(null);
      setFeedbackMsg('Product saved and synced to live catalogue.');
      await loadAdminData();
      await refreshPublicData();
    } else {
      const d = await res.json();
      setFeedbackMsg(d.error || 'Could not save product.');
    }
  };

  const openEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setPForm({
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
      description: p.description,
      fabric: p.fabric,
      work: p.work,
      lining: p.lining,
      buttons: p.buttons,
      sizes: p.sizes,
      moq: p.moq,
      occasion: p.occasion.join(', '),
      priceNote: p.priceNote,
      startingPrice: p.startingPrice,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      isActive: p.isActive,
      colourName: p.variants[0]?.colourName || 'Midnight Navy',
      colourHex: p.variants[0]?.colourHex || '#0F1B33',
      stockStatus: p.variants[0]?.stockStatus || 'Ready Stock',
      imageUrl: p.images[0]?.url || '/src/assets/images/cat_jodhpuri_navy_1795480640263.jpg',
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      setFeedbackMsg('Product removed.');
      await loadAdminData();
    }
  };

  const handleUpdateEnquiryStatus = async (id: number, status: EnquiryRecord['status']) => {
    const res = await fetch(`/api/admin/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status });
      }
      await loadAdminData();
    }
  };

  const handleExportCsv = async () => {
    if (!token) return;
    const res = await fetch('/api/admin/enquiries/export', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'magestic-threads-enquiries.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(settingsMap),
    });
    if (res.ok) {
      setFeedbackMsg('Wholesale settings updated across the site.');
      await refreshPublicData();
    }
  };

  // ---------- LOGIN / FIRST-RUN BOOTSTRAP GATE ----------
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5A0F1F]">
              MAGESTIC THREADs Back Office
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-slate-900">
              {checkingStatus
                ? 'Checking Admin Setup...'
                : needsBootstrap
                  ? 'Claim Initial Admin Account'
                  : 'Staff Admin Sign In'}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {needsBootstrap
                ? 'No admin credentials are configured yet. Set the first owner email & password below.'
                : 'Sign in with your authorized wholesale manager credentials.'}
            </p>
          </div>

          {!checkingStatus && (
            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {authError && (
                <div className="rounded bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {authError}
                </div>
              )}

              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700">
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="owner@magesticthreads.in"
                  className="mt-1 min-h-[42px] w-full rounded border border-slate-300 px-3 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="admin-pass" className="block text-xs font-semibold text-slate-700">
                  Password (min 8 chars)
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  required
                  minLength={8}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 min-h-[42px] w-full rounded border border-slate-300 px-3 text-sm focus:border-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="min-h-[44px] w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {authLoading
                  ? 'Verifying...'
                  : needsBootstrap
                    ? 'Create Owner Account & Enter'
                    : 'Sign In to Admin'}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link to="/" className="text-xs font-medium text-slate-600 hover:text-slate-900">
              ← Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredEnquiries = enquiries.filter((e) => {
    const matchStatus = enquiryFilterStatus === 'all' || e.status === enquiryFilterStatus;
    const q = enquirySearch.trim().toLowerCase();
    const matchQuery =
      !q ||
      e.shopName.toLowerCase().includes(q) ||
      e.contactPerson.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.referenceCode.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'enquiries', label: 'Enquiries', icon: Package },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'settings', label: 'Catalogue & Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Light Functional Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="font-serif text-lg font-bold text-slate-900">MAGESTIC THREADs</p>
          <p className="text-xs text-slate-500">Wholesale Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex min-h-[42px] w-full items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 text-xs">
          <p className="truncate font-medium text-slate-700">{adminEmail}</p>
          <div className="mt-2 flex items-center justify-between">
            <Link to="/" className="text-slate-500 hover:text-slate-900">
              View Site
            </Link>
            <button
              type="button"
              onClick={() => setToken(null)}
              className="inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 overflow-x-hidden">
        {/* Mobile Tab Strip */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="font-serif text-base font-bold">MAGESTIC Admin</span>
          <div className="flex items-center gap-2">
            <select
              aria-label="Admin section"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as AdminTab)}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setToken(null)}
              className="rounded bg-slate-100 px-2 py-1 text-xs text-red-600"
            >
              Exit
            </button>
          </div>
        </div>

        <main className="mx-auto max-w-6xl p-4 sm:p-8">
          {feedbackMsg && (
            <div className="mb-6 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
              <span>{feedbackMsg}</span>
              <button
                type="button"
                onClick={() => setFeedbackMsg(null)}
                className="text-xs font-semibold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="font-serif text-2xl font-bold text-slate-900">Wholesale Overview</h1>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Active Products', val: overview.activeProductsCount },
                  { label: 'Total Categories', val: overview.categoriesCount },
                  { label: 'Total Enquiries', val: overview.enquiriesCount },
                  { label: 'New / Unread Leads', val: overview.newEnquiriesCount },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs"
                  >
                    <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
                    <p className="mt-2 font-serif text-3xl font-bold text-slate-900 tabular-nums">
                      {kpi.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-serif text-2xl font-bold">Wholesale Products ({products.length})</h1>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setShowProductForm((v) => !v);
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  <span>{showProductForm ? 'Close Form' : 'Add New Product'}</span>
                </button>
              </div>

              {showProductForm && (
                <form
                  onSubmit={handleSaveProduct}
                  className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
                >
                  <h2 className="text-base font-bold">
                    {editingProductId ? 'Edit Product' : 'Create Product'}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold">Design Name *</label>
                      <input
                        required
                        value={pForm.name}
                        onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">URL Slug (auto if blank)</label>
                      <input
                        value={pForm.slug}
                        onChange={(e) => setPForm({ ...pForm, slug: e.target.value })}
                        placeholder="nizam-zardozi-shrug"
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">Category *</label>
                      <select
                        value={pForm.categoryId}
                        onChange={(e) => setPForm({ ...pForm, categoryId: Number(e.target.value) })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">MOQ (pieces) *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={pForm.moq}
                        onChange={(e) => setPForm({ ...pForm, moq: Number(e.target.value) })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">Fabric *</label>
                      <input
                        required
                        value={pForm.fabric}
                        onChange={(e) => setPForm({ ...pForm, fabric: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">Embroidery &amp; Work *</label>
                      <input
                        required
                        value={pForm.work}
                        onChange={(e) => setPForm({ ...pForm, work: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">Colour Name</label>
                      <input
                        required
                        value={pForm.colourName}
                        onChange={(e) => setPForm({ ...pForm, colourName: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold">Starting Price (Optional)</label>
                      <input
                        value={pForm.startingPrice}
                        onChange={(e) => setPForm({ ...pForm, startingPrice: e.target.value })}
                        placeholder="e.g. ₹3,450 / pc"
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold">Product Image Upload</label>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <input
                          value={pForm.imageUrl}
                          onChange={(e) => setPForm({ ...pForm, imageUrl: e.target.value })}
                          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold hover:bg-slate-100">
                          <FileUp className="h-4 w-4" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, 'products', (url) => setPForm({ ...pForm, imageUrl: url }));
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold">Description *</label>
                      <textarea
                        rows={2}
                        required
                        value={pForm.description}
                        onChange={(e) => setPForm({ ...pForm, description: e.target.value })}
                        className="mt-1 w-full rounded border border-slate-300 p-2.5 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 text-xs font-medium">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pForm.isNew}
                        onChange={(e) => setPForm({ ...pForm, isNew: e.target.checked })}
                      />
                      New Arrival
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pForm.isBestSeller}
                        onChange={(e) => setPForm({ ...pForm, isBestSeller: e.target.checked })}
                      />
                      Best Seller
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={pForm.isActive}
                        onChange={(e) => setPForm({ ...pForm, isActive: e.target.checked })}
                      />
                      Active on Storefront
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Save Product
                  </button>
                </form>
              )}

              <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Design</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">MOQ</th>
                      <th className="px-4 py-3">Flags</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                        <td className="px-4 py-3 text-slate-600">{p.categoryName}</td>
                        <td className="px-4 py-3 tabular-nums">{p.moq} pcs</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {[p.isNew && 'New', p.isBestSeller && 'Best Seller', !p.isActive && 'Hidden']
                            .filter(Boolean)
                            .join(' · ') || 'Standard'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-3">
                          <button
                            type="button"
                            onClick={() => openEditProduct(p)}
                            className="text-xs font-semibold text-slate-700 underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl font-bold">Wholesale Categories</h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/categories', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(catForm),
                  });
                  if (res.ok) {
                    setCatForm({ ...catForm, name: '', slug: '', description: '' });
                    setFeedbackMsg('Category added.');
                    await loadAdminData();
                    await refreshPublicData();
                  }
                }}
                className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-3"
              >
                <input
                  required
                  placeholder="Category Name"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="slug-name"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Add Category
                </button>
              </form>

              <div className="grid gap-4 sm:grid-cols-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">/{c.slug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/admin/categories/${c.id}`, {
                          method: 'DELETE',
                          headers: authHeaders(),
                        });
                        await loadAdminData();
                      }}
                      aria-label={`Delete ${c.name}`}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENQUIRIES TAB */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-serif text-2xl font-bold">
                  B2B Enquiries ({filteredEnquiries.length})
                </h1>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <input
                  type="search"
                  placeholder="Search shop, buyer, city, reference..."
                  value={enquirySearch}
                  onChange={(e) => setEnquirySearch(e.target.value)}
                  className="min-h-[40px] flex-1 rounded border border-slate-300 bg-white px-3 text-sm"
                />
                <select
                  value={enquiryFilterStatus}
                  onChange={(e) => setEnquiryFilterStatus(e.target.value)}
                  className="min-h-[40px] rounded border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">All Statuses</option>
                  {['New', 'Contacted', 'Quoted', 'Won', 'Lost'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Ref</th>
                      <th className="px-4 py-3">Shop &amp; City</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnquiries.map((eq) => (
                      <tr key={eq.id}>
                        <td className="px-4 py-3 font-mono text-xs">{eq.referenceCode}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{eq.shopName}</p>
                          <p className="text-xs text-slate-500">
                            {eq.city} {eq.state ? `, ${eq.state}` : ''} · {eq.type}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p>{eq.contactPerson}</p>
                          <p className="text-slate-500">{eq.phone}</p>
                        </td>
                        <td className="px-4 py-3 tabular-nums">{eq.totalQuantity} pcs</td>
                        <td className="px-4 py-3">
                          <select
                            aria-label={`Status for ${eq.referenceCode}`}
                            value={eq.status}
                            onChange={(e) =>
                              handleUpdateEnquiryStatus(
                                eq.id,
                                e.target.value as EnquiryRecord['status']
                              )
                            }
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium"
                          >
                            {['New', 'Contacted', 'Quoted', 'Won', 'Lost'].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedEnquiry(eq)}
                            className="text-xs font-semibold text-slate-700 underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedEnquiry && (
                <div className="rounded-lg border border-slate-300 bg-white p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="font-serif text-lg font-bold">
                      {selectedEnquiry.referenceCode} — {selectedEnquiry.shopName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSelectedEnquiry(null)}
                      className="text-xs text-slate-500 underline"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                    <p>
                      <strong>Buyer:</strong> {selectedEnquiry.contactPerson}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedEnquiry.phone}
                    </p>
                    <p>
                      <strong>GSTIN:</strong> {selectedEnquiry.gstNumber || 'Not provided'}
                    </p>
                    <p>
                      <strong>Private Label:</strong> {selectedEnquiry.customLabel ? 'Yes' : 'No'}
                    </p>
                    <p className="sm:col-span-2">
                      <strong>Notes:</strong> {selectedEnquiry.notes || 'None'}
                    </p>
                  </div>
                  {selectedEnquiry.items.length > 0 && (
                    <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100 pt-2 text-xs">
                      {selectedEnquiry.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between py-2">
                          <span>
                            {item.productName} ({item.colour})
                          </span>
                          <span className="font-semibold tabular-nums">{item.quantity} pcs</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TESTIMONIALS TAB */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <h1 className="font-serif text-2xl font-bold">Retailer Testimonials</h1>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/testimonials', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(tForm),
                  });
                  if (res.ok) {
                    setTForm({ retailerName: '', shop: '', city: '', quote: '' });
                    setFeedbackMsg('Testimonial added.');
                    await loadAdminData();
                    await refreshPublicData();
                  }
                }}
                className="space-y-3 rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    required
                    placeholder="Retailer Name"
                    value={tForm.retailerName}
                    onChange={(e) => setTForm({ ...tForm, retailerName: e.target.value })}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    placeholder="Showroom Name"
                    value={tForm.shop}
                    onChange={(e) => setTForm({ ...tForm, shop: e.target.value })}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    placeholder="City"
                    value={tForm.city}
                    onChange={(e) => setTForm({ ...tForm, city: e.target.value })}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  required
                  rows={2}
                  placeholder="Retailer quote..."
                  value={tForm.quote}
                  onChange={(e) => setTForm({ ...tForm, quote: e.target.value })}
                  className="w-full rounded border border-slate-300 p-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Add Testimonial
                </button>
              </form>

              <div className="space-y-3">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {t.retailerName} — {t.shop} ({t.city})
                      </p>
                      <p className="mt-1 text-xs text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/admin/testimonials/${t.id}`, {
                          method: 'DELETE',
                          headers: authHeaders(),
                        });
                        await loadAdminData();
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS & CATALOGUE PDF TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h1 className="font-serif text-2xl font-bold">Catalogue PDF &amp; Site Settings</h1>

              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-base font-bold">Upload New Wholesale Catalogue PDF</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Uploading a PDF here replaces the file downloaded by retailers on /catalogue.
                </p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold hover:bg-slate-100">
                  <FileUp className="h-4 w-4" />
                  <span>Select PDF File</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        handleFileUpload(f, 'catalogue', (url) =>
                          setSettingsMap({ ...settingsMap, catalogue_url: url })
                        );
                    }}
                  />
                </label>
              </div>

              <form
                onSubmit={handleSaveSettings}
                className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
              >
                <h2 className="text-base font-bold">Business Contact &amp; Pricing Display</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['whatsapp_number', 'WhatsApp Number (digits only, e.g. 919811000000)'],
                    ['phone', 'Display Phone Number'],
                    ['email', 'Business Email'],
                    ['instagram_url', 'Instagram URL'],
                    ['address', 'Seelampur Factory Address'],
                    ['gst_note', 'GSTIN Footer Note'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-700">{label}</label>
                      <input
                        value={settingsMap[key] || ''}
                        onChange={(e) =>
                          setSettingsMap({ ...settingsMap, [key]: e.target.value })
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={settingsMap.show_starting_prices === 'true'}
                    onChange={(e) =>
                      setSettingsMap({
                        ...settingsMap,
                        show_starting_prices: e.target.checked ? 'true' : 'false',
                      })
                    }
                  />
                  Show optional &ldquo;Starting from&rdquo; wholesale rates on product cards
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
