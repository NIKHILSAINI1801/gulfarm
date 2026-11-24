import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Filter, MessageCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { ProductCard } from '../components/product/ProductCard';
import { PageMeta } from '../components/ui/PageMeta';
import { SkeletonGrid } from '../components/ui/SkeletonGrid';
import { useSiteData } from '../context/SiteDataContext';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import type { Product } from '../types';

const COLOUR_OPTIONS = [
  { label: 'All Colours', value: 'all' },
  { label: 'Midnight Navy', value: 'navy' },
  { label: 'Royal Maroon', value: 'maroon' },
  { label: 'Jet Black', value: 'black' },
  { label: 'Ivory / White', value: 'ivory' },
  { label: 'Antique Gold', value: 'gold' },
  { label: 'Brown / Taupe', value: 'brown' },
];

const FABRIC_OPTIONS = [
  { label: 'All Fabrics', value: 'all' },
  { label: 'Velvet', value: 'velvet' },
  { label: 'Jute Silk', value: 'jute' },
  { label: 'Raw Silk', value: 'raw silk' },
  { label: 'Jacquard / Brocade', value: 'jacquard' },
  { label: 'Imported Suiting', value: 'imported' },
];

const OCCASION_OPTIONS = [
  { label: 'All Occasions', value: 'all' },
  { label: 'Wedding', value: 'Wedding' },
  { label: 'Sangeet', value: 'Sangeet' },
  { label: 'Festive', value: 'Festive' },
  { label: 'Reception', value: 'Reception' },
];

const PRICE_RANGE_OPTIONS = [
  { label: 'All MOQ & Price Slabs', value: 'all' },
  { label: 'High-Volume Value (MOQ 10+ pcs)', value: 'budget' },
  { label: 'Mid-Range Showroom (MOQ 6–9 pcs)', value: 'mid' },
  { label: 'Bridal Couture (MOQ 4–5 pcs)', value: 'premium' },
];

export function CollectionsPage() {
  const { category: routeCategory } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, settings } = useSiteData();

  const activeCategory = routeCategory || searchParams.get('category') || 'all';
  const activeColour = searchParams.get('colour') || 'all';
  const activeFabric = searchParams.get('fabric') || 'all';
  const activeOccasion = searchParams.get('occasion') || 'all';
  const activePriceRange = searchParams.get('priceRange') || 'all';
  const activeSort = searchParams.get('sort') || 'newest';
  const activeSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(activeSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (activeColour !== 'all') params.set('colour', activeColour);
    if (activeFabric !== 'all') params.set('fabric', activeFabric);
    if (activeOccasion !== 'all') params.set('occasion', activeOccasion);
    if (activePriceRange !== 'all') params.set('priceRange', activePriceRange);
    if (activeSort) params.set('sort', activeSort);
    if (activeSearch) params.set('search', activeSearch);
    params.set('limit', String(limit));

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (alive) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [
    activeCategory,
    activeColour,
    activeFabric,
    activeOccasion,
    activePriceRange,
    activeSort,
    activeSearch,
    limit,
  ]);

  const currentCategoryObj = useMemo(
    () => categories.find((c) => c.slug === activeCategory),
    [categories, activeCategory]
  );

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all' || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const pageTitle = currentCategoryObj
    ? `${currentCategoryObj.name} Wholesale`
    : 'All Wholesale Collections';

  const suggestions = ['Jodhpuri Shrug', 'Velvet Sherwani', 'Nehru Jacket', 'Indo-Western', 'Blazer'];

  const filterPanel = (
    <div className="space-y-6">
      {!routeCategory && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C9A24B]">
            Category
          </h3>
          <div className="mt-2.5 space-y-1">
            <button
              type="button"
              onClick={() => updateParam('category', 'all')}
              className={`block w-full rounded-[4px] px-2.5 py-2 text-left text-sm transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#5A0F1F] font-semibold text-[#F7F1E6]'
                  : 'text-[#F3EDE2]/80 hover:bg-[#1E1B18]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => updateParam('category', cat.slug)}
                className={`block w-full rounded-[4px] px-2.5 py-2 text-left text-sm transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-[#5A0F1F] font-semibold text-[#F7F1E6]'
                    : 'text-[#F3EDE2]/80 hover:bg-[#1E1B18]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C9A24B]">Colour</h3>
        <select
          aria-label="Filter by colour"
          value={activeColour}
          onChange={(e) => updateParam('colour', e.target.value)}
          className="mt-2 w-full rounded-[6px] border border-[#C9A24B]/30 bg-[#141418] px-3 py-2.5 text-sm text-[#F7F1E6] focus:border-[#C9A24B] focus:outline-none"
        >
          {COLOUR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C9A24B]">Fabric</h3>
        <select
          aria-label="Filter by fabric"
          value={activeFabric}
          onChange={(e) => updateParam('fabric', e.target.value)}
          className="mt-2 w-full rounded-[6px] border border-[#C9A24B]/30 bg-[#141418] px-3 py-2.5 text-sm text-[#F7F1E6] focus:border-[#C9A24B] focus:outline-none"
        >
          {FABRIC_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C9A24B]">Occasion</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {OCCASION_OPTIONS.map((occ) => (
            <button
              key={occ.value}
              type="button"
              onClick={() => updateParam('occasion', occ.value)}
              className={`rounded-[6px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeOccasion === occ.value
                  ? 'border-[#C9A24B] bg-[#C9A24B] text-[#0B0B0D]'
                  : 'border-[#C9A24B]/25 text-[#F3EDE2]/80 hover:border-[#C9A24B]'
              }`}
            >
              {occ.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C9A24B]">
          MOQ &amp; Slab Tier
        </h3>
        <select
          aria-label="Filter by wholesale slab tier"
          value={activePriceRange}
          onChange={(e) => updateParam('priceRange', e.target.value)}
          className="mt-2 w-full rounded-[6px] border border-[#C9A24B]/30 bg-[#141418] px-3 py-2.5 text-sm text-[#F7F1E6] focus:border-[#C9A24B] focus:outline-none"
        >
          {PRICE_RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="w-full rounded-full border border-[#C9A24B]/40 py-2 text-xs font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <SiteLayout
      whatsappContext={`Hello MAGESTIC THREADs, I am browsing ${pageTitle} and want wholesale rates.`}
    >
      <PageMeta
        title={`${pageTitle} | MAGESTIC THREADs Wholesale Delhi`}
        description={
          currentCategoryObj?.description ||
          'Browse wholesale Sherwanis, Jodhpuri suits, Indo-Western sets, ethnic blazers, and Nehru jackets manufactured in Seelampur, Delhi.'
        }
      />

      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#F3EDE2]/65">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-[#C9A24B]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/collections" className="hover:text-[#C9A24B]">
                Collections
              </Link>
            </li>
            {currentCategoryObj && (
              <>
                <li aria-hidden="true">/</li>
                <li className="text-[#C9A24B]">{currentCategoryObj.name}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Header & Search */}
        <div className="mt-4 border-b border-[#C9A24B]/20 pb-6">
          <h1 className="font-serif text-[28px] font-bold text-[#F7F1E6] sm:text-[40px]">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F3EDE2]/80">
            {currentCategoryObj?.description ||
              'Factory-direct B2B wholesale designs ready for bulk showroom orders. Select designs and add to your Enquiry List for slab quotes.'}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A24B]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search design, fabric (velvet, jute silk), category..."
                className="min-h-[44px] w-full rounded-[6px] border border-[#C9A24B]/30 bg-[#141418] pl-10 pr-20 text-sm text-[#F7F1E6] placeholder:text-[#F3EDE2]/45 focus:border-[#C9A24B] focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[4px] bg-[#C9A24B] px-3 py-1.5 text-xs font-semibold text-[#0B0B0D] hover:bg-[#B68F38]"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-[6px] border border-[#C9A24B]/40 bg-[#121216] px-4 text-xs font-semibold text-[#F7F1E6] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#C9A24B]" aria-hidden="true" />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs text-[#F3EDE2]/70">
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={activeSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="min-h-[44px] rounded-[6px] border border-[#C9A24B]/30 bg-[#141418] px-3 text-xs font-medium text-[#F7F1E6] focus:border-[#C9A24B] focus:outline-none"
                >
                  <option value="newest">Newest Designs</option>
                  <option value="best_selling">Best Selling</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick search suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#F3EDE2]/65">
            <span>Popular searches:</span>
            {suggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchInput(term);
                  updateParam('search', term);
                }}
                className="underline decoration-[#C9A24B]/40 underline-offset-4 hover:text-[#C9A24B]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 rounded-[6px] border border-[#C9A24B]/20 bg-[#121216] p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-[#C9A24B]/15 pb-3">
                <Filter className="h-4 w-4 text-[#C9A24B]" aria-hidden="true" />
                <h2 className="font-serif text-base font-semibold text-[#F7F1E6]">
                  Filter Catalogue
                </h2>
              </div>
              {filterPanel}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="mb-4 flex items-center justify-between text-xs text-[#F3EDE2]/70">
              <span className="tabular-nums">
                Showing {products.length} of {total} wholesale designs
              </span>
              {routeCategory && (
                <Link to="/collections" className="text-[#C9A24B] hover:underline">
                  View all categories
                </Link>
              )}
            </div>

            {loading ? (
              <SkeletonGrid count={6} />
            ) : products.length === 0 ? (
              <div className="rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-8 text-center">
                <h2 className="font-serif text-2xl font-bold text-[#F7F1E6]">
                  No designs matched those filters
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#F3EDE2]/75">
                  Looking for a specific fabric, custom colourway, or lower MOQ? Message our
                  Seelampur desk on WhatsApp for ready-stock photos not yet listed online.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-[44px] rounded-full border border-[#C9A24B] px-5 py-2 text-xs font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
                  >
                    Clear Filters
                  </button>
                  <a
                    href={buildWhatsAppUrl(
                      settings.whatsapp_number,
                      `Hello MAGESTIC THREADs, I searched for "${activeSearch || activeCategory}" on your catalogue and need wholesale options.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#1F7A4D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#19633e]"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Ask on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {products.length < total && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setLimit((l) => l + 12)}
                      className="min-h-[44px] rounded-full border border-[#C9A24B] px-8 py-2.5 text-sm font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
                    >
                      Load More Designs ({total - products.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/75 lg:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl border-t border-[#C9A24B]/40 bg-[#121216] p-6">
            <div className="mb-4 flex items-center justify-between border-b border-[#C9A24B]/20 pb-3">
              <h2 className="font-serif text-lg font-bold text-[#F7F1E6]">Filter Wholesale Designs</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="rounded p-2 text-[#F3EDE2]/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 min-h-[48px] w-full rounded-full bg-[#C9A24B] text-sm font-semibold text-[#0B0B0D]"
            >
              Show {total} Designs
            </button>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
