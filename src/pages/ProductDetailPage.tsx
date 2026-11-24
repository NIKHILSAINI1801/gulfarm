import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardPlus,
  MessageCircle,
  ZoomIn,
  X,
} from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { ProductCard } from '../components/product/ProductCard';
import { PageMeta } from '../components/ui/PageMeta';
import { ProductImageFrame } from '../components/ui/ProductImageFrame';
import { useSiteData } from '../context/SiteDataContext';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { STANDARD_SIZES, useEnquiryStore } from '../store/enquiryStore';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteData();
  const addItem = useEnquiryStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const [sizeSplit, setSizeSplit] = useState<Record<string, number>>({
    '36': 1,
    '38': 1,
    '40': 2,
    '42': 1,
    '44': 1,
    '46': 0,
  });
  const [quantity, setQuantity] = useState(6);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/products/${slug}`)
      .then(async (r) => {
        if (!r.ok) {
          if (alive) setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!alive || !data) return;
        setProduct(data.product);
        setRelated(data.related || []);
        setQuantity(data.product.moq || 6);
        setSelectedVariantIdx(0);
        setSelectedImageIdx(0);
      })
      .catch(() => {
        if (alive) setNotFound(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const handleSizeChange = (size: string, val: number) => {
    const cleanVal = Math.max(0, Math.min(500, Math.round(val || 0)));
    const next = { ...sizeSplit, [size]: cleanVal };
    setSizeSplit(next);
    const sum = Object.values(next).reduce((acc, n) => acc + n, 0);
    if (sum > 0) setQuantity(sum);
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="aspect-[4/5] animate-pulse rounded-[6px] bg-[#16161B] lg:col-span-6" />
            <div className="space-y-4 lg:col-span-6">
              <div className="h-8 w-3/4 animate-pulse rounded bg-[#1E1E24]" />
              <div className="h-24 w-full animate-pulse rounded bg-[#16161B]" />
              <div className="h-64 w-full animate-pulse rounded bg-[#16161B]" />
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (notFound || !product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#F7F1E6]">Design Not Found</h1>
          <p className="mt-3 text-sm text-[#F3EDE2]/75">
            This wholesale SKU may have been archived or updated. Browse our active collections
            below.
          </p>
          <Link
            to="/collections"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#0B0B0D]"
          >
            Browse All Collections
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const activeVariant = product.variants[selectedVariantIdx] || product.variants[0];
  const activeImage = product.images[selectedImageIdx] || product.images[0];
  const showStartingPrice = settings.show_starting_prices === 'true' && product.startingPrice;

  const angleLabels: Record<string, string> = {
    front: 'Front & Full Look',
    back: 'Back / Colour Sheet',
    closeup: 'Embroidery Close-Up',
    fabric: 'Fabric & Weave Detail',
  };

  const getImageCaption = (img: (typeof product.images)[number]) => {
    if (img.variantId) {
      const matchedVariant = product.variants.find((v) => v.id === img.variantId);
      if (matchedVariant) return matchedVariant.colourName;
    }
    return angleLabels[img.type] || img.type;
  };

  const handleVariantSelect = (idx: number) => {
    setSelectedVariantIdx(idx);
    const v = product.variants[idx];
    if (v?.id) {
      const matchImgIdx = product.images.findIndex((i) => i.variantId === v.id);
      if (matchImgIdx >= 0) setSelectedImageIdx(matchImgIdx);
    }
  };

  const handleAddToEnquiry = () => {
    const selectedVariantImg = activeVariant?.id
      ? product.images.find((i) => i.variantId === activeVariant.id)?.url
      : undefined;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      categoryName: product.categoryName,
      image: selectedVariantImg || product.images[0]?.url || '',
      colour: activeVariant?.colourName || 'Standard',
      moq: product.moq,
      sizeSplit,
      quantity: Math.max(1, quantity),
    });
  };

  const productWaUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello MAGESTIC THREADs, I need wholesale price slabs & availability for "${product.name}" (Colour: ${activeVariant?.colourName || 'All'}, Qty: ${quantity} pcs).`
  );

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.categoryName,
    brand: { '@type': 'Brand', name: 'MAGESTIC THREADs' },
    image: product.images.map((i) => `${window.location.origin}${i.url}`),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      businessFunction: 'http://purl.org/goodrelations/v1#Sell',
    },
  };

  return (
    <SiteLayout
      whatsappContext={`Hello MAGESTIC THREADs, I am viewing "${product.name}" (${activeVariant?.colourName || ''}) and need wholesale pricing.`}
    >
      <PageMeta
        title={`${product.name} | Wholesale ${product.categoryName} | MAGESTIC THREADs`}
        description={`${product.name} wholesale supplier Delhi. Fabric: ${product.fabric}. Work: ${product.work}. MOQ: ${product.moq} pcs. Sizes: ${product.sizes}.`}
        jsonLd={productJsonLd}
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
              <Link to={`/collections/${product.categorySlug}`} className="hover:text-[#C9A24B]">
                {product.categoryName}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[#C9A24B]">{product.name}</li>
          </ol>
        </nav>

        {/* Main Product 2-Column Split */}
        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          {/* Left: Gallery */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-[6px] border border-[#C9A24B]/25 bg-[#121216]">
              <ProductImageFrame
                src={activeImage?.url}
                alt={`${product.name} - ${getImageCaption(activeImage || { url: '', type: 'front', sortOrder: 1 })}`}
                angleType={activeImage?.type}
                aspectClass="aspect-[3/4]"
              />
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                aria-label="Zoom image"
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A24B]/40 bg-[#0B0B0D]/80 text-[#F7F1E6] hover:border-[#C9A24B]"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              {activeImage && (
                <span className="absolute bottom-3 left-3 rounded-[4px] bg-[#0B0B0D]/85 px-3 py-1 text-xs font-medium text-[#C9A24B]">
                  {getImageCaption(activeImage)}
                </span>
              )}
            </div>

            {/* Thumbnail Strip across all colourways & detail angles */}
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((img, idx) => (
                <button
                  key={`${img.url}-${img.type}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedImageIdx(idx);
                    if (img.variantId) {
                      const vIdx = product.variants.findIndex((v) => v.id === img.variantId);
                      if (vIdx >= 0) setSelectedVariantIdx(vIdx);
                    }
                  }}
                  className={`overflow-hidden rounded-[6px] border transition-all ${
                    idx === selectedImageIdx
                      ? 'border-[#C9A24B] ring-2 ring-[#C9A24B]/40'
                      : 'border-[#C9A24B]/20 opacity-75 hover:opacity-100'
                  }`}
                >
                  <ProductImageFrame
                    src={img.url}
                    alt={`${product.name} ${getImageCaption(img)}`}
                    angleType={img.type}
                    aspectClass="aspect-[3/4]"
                  />
                  <span className="block truncate bg-[#121216] px-1 py-1 text-center text-[11px] text-[#F3EDE2]/85">
                    {getImageCaption(img)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Specs & Enquiry Module */}
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#C9A24B]">
              <span>{product.categoryName}</span>
              {product.isNew && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>New Arrival</span>
                </>
              )}
              {product.isBestSeller && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Best Seller</span>
                </>
              )}
            </div>

            <h1 className="mt-2 font-serif text-[28px] font-bold leading-tight text-[#F7F1E6] sm:text-[36px]">
              {product.name}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[#F3EDE2]/85">
              {product.description}
            </p>

            {/* Colour Swatches */}
            {product.variants.length > 0 && (
              <div className="mt-6 border-t border-[#C9A24B]/20 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#F7F1E6]">
                    Colourway: <span className="text-[#C9A24B]">{activeVariant?.colourName}</span>
                  </span>
                  <span className="text-xs font-medium text-[#1F7A4D]">
                    {activeVariant?.stockStatus}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.colourName}
                      type="button"
                      onClick={() => handleVariantSelect(idx)}
                      className={`inline-flex min-h-[40px] items-center gap-2 rounded-[6px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                        idx === selectedVariantIdx
                          ? 'border-[#C9A24B] bg-[#C9A24B]/15 text-[#F7F1E6]'
                          : 'border-[#C9A24B]/25 bg-[#121216] text-[#F3EDE2]/80 hover:border-[#C9A24B]/60'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/30"
                        style={{ backgroundColor: v.colourHex }}
                      />
                      <span>{v.colourName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ivory Specification Table */}
            <div className="mt-6 overflow-hidden rounded-[6px] border border-[#C9A24B]/30 bg-[#F7F1E6] text-[#1E1B18]">
              <div className="border-b border-[#1E1B18]/10 bg-[#EDE4D3] px-4 py-2.5">
                <h2 className="font-serif text-sm font-bold text-[#1E1B18]">
                  Wholesale Garment Specifications
                </h2>
              </div>
              <dl className="divide-y divide-[#1E1B18]/10 text-sm">
                {[
                  ['Fabric', product.fabric],
                  ['Embroidery & Work', product.work],
                  ['Inner Lining', product.lining],
                  ['Buttons & Hardware', product.buttons],
                  ['Sizes Available', product.sizes],
                  ['Minimum Order Quantity (MOQ)', `${product.moq} pieces per design set`],
                  [
                    'Wholesale Rate',
                    showStartingPrice ? `${product.startingPrice} (Volume slabs on enquiry)` : product.priceNote,
                  ],
                ].map(([label, val]) => (
                  <div key={label} className="grid grid-cols-5 gap-2 px-4 py-2.5">
                    <dt className="col-span-2 font-semibold text-[#1E1B18]/80">{label}</dt>
                    <dd className="col-span-3 text-[#1E1B18] tabular-nums">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Size Split & Quantity Inputs */}
            <div className="mt-6 rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#F7F1E6]">
                  Specify Size Split &amp; Quantity
                </h3>
                <span className="text-xs text-[#C9A24B] tabular-nums">
                  Recommended MOQ: {product.moq} pcs
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {STANDARD_SIZES.map((sz) => (
                  <div key={sz}>
                    <label
                      htmlFor={`size-${sz}`}
                      className="block text-center text-xs font-medium text-[#F3EDE2]/75"
                    >
                      Size {sz}
                    </label>
                    <input
                      id={`size-${sz}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={sizeSplit[sz] ?? 0}
                      onChange={(e) => handleSizeChange(sz, Number(e.target.value))}
                      className="mt-1 min-h-[40px] w-full rounded-[6px] border border-[#C9A24B]/30 bg-[#0B0B0D] px-2 text-center text-sm text-[#F7F1E6] tabular-nums focus:border-[#C9A24B] focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <label htmlFor="total-qty-input" className="text-sm font-medium text-[#F7F1E6]">
                    Total Pieces:
                  </label>
                  <input
                    id="total-qty-input"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="min-h-[44px] w-24 rounded-[6px] border border-[#C9A24B]/40 bg-[#0B0B0D] px-3 text-center text-sm font-semibold text-[#F7F1E6] tabular-nums focus:border-[#C9A24B] focus:outline-none"
                  />
                </div>
                {quantity < product.moq && (
                  <p className="text-xs text-[#C9A24B]">
                    Note: Below standard MOQ ({product.moq} pcs) — sample rates may apply.
                  </p>
                )}
              </div>

              {/* Primary CTAs */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddToEnquiry}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[#C9A24B] px-6 py-3 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#B68F38]"
                >
                  <ClipboardPlus className="h-4 w-4" aria-hidden="true" />
                  <span>Add to Enquiry / Request Wholesale Price</span>
                </button>
                <a
                  href={productWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#1F7A4D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#19633e] whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>WhatsApp for This Design</span>
                </a>
              </div>
            </div>

            {/* Policy Snippets */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-[#F3EDE2]/80">
              {[
                'Sample piece available (adjustable against bulk)',
                '50% advance / 50% prior to dispatch + GST invoice',
                '4–10 days dispatch via Pan-India transport',
                '7-day manufacturing defect replacement guarantee',
              ].map((snippet) => (
                <div
                  key={snippet}
                  className="flex items-start gap-2 rounded-[6px] border border-[#C9A24B]/15 bg-[#121216] p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A24B]" />
                  <span>{snippet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related & Complete-the-Set */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-[#C9A24B]/20 pt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
                  COMPLETE YOUR SHOWROOM ASSORTMENT
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#F7F1E6] sm:text-3xl">
                  Related Designs &amp; Layering Sets
                </h2>
              </div>
              <Link to="/collections" className="text-sm font-semibold text-[#C9A24B] hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Zoom Lightbox */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed garment view"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
            className="absolute right-4 top-4 rounded-full border border-[#C9A24B]/50 bg-[#0B0B0D] p-2 text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={activeImage?.url}
            alt={product.name}
            className="max-h-[90vh] max-w-full rounded-[6px] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </SiteLayout>
  );
}
