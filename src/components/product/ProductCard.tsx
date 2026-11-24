import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '../../types';
import { useEnquiryStore } from '../../store/enquiryStore';
import { useSiteData } from '../../context/SiteDataContext';
import { ProductImageFrame } from '../ui/ProductImageFrame';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useEnquiryStore((s) => s.addItem);
  const { settings } = useSiteData();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [userLockedVariant, setUserLockedVariant] = useState(false);
  const [hovered, setHovered] = useState(false);

  const activeVariant = product.variants[selectedVariantIdx] || product.variants[0];
  const frontImg = product.images.find((i) => i.type === 'front')?.url || product.images[0]?.url;
  const variantImg =
    activeVariant?.id
      ? product.images.find((i) => i.variantId === activeVariant.id)?.url
      : undefined;
  const alternateImg =
    product.images.find((i) => i.url !== (variantImg || frontImg))?.url ||
    product.images.find((i) => i.type === 'back')?.url ||
    frontImg;

  const displayImg = hovered && !userLockedVariant ? alternateImg : variantImg || frontImg;
  const showStartingPrice = settings.show_starting_prices === 'true' && product.startingPrice;

  const statusLabel = product.isNew
    ? 'New Arrival'
    : product.isBestSeller
      ? 'Best Seller'
      : null;

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      categoryName: product.categoryName,
      image: variantImg || frontImg || '',
      colour: activeVariant?.colourName || 'Standard',
      moq: product.moq,
      sizeSplit: { '38': 1, '40': 2, '42': 2, '44': 1 },
      quantity: product.moq,
    });
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-[6px] border border-[#C9A24B]/20 bg-[#121216] transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#C9A24B]/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B]"
      >
        <ProductImageFrame
          src={displayImg}
          alt={`${product.name} - ${activeVariant?.colourName || product.categoryName}`}
          aspectClass="aspect-[3/4]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-[#F3EDE2]/65">
          <span className="truncate">{product.categoryName}</span>
          {statusLabel && (
            <span className="shrink-0 font-medium text-[#C9A24B]">{statusLabel}</span>
          )}
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="mt-1.5 line-clamp-2 font-serif text-base font-semibold leading-snug text-[#F7F1E6] transition-colors hover:text-[#C9A24B]"
        >
          {product.name}
        </Link>

        {/* Interactive multi-colourway swatches */}
        {product.variants.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Available colourways">
            {product.variants.slice(0, 7).map((v, idx) => (
              <button
                key={v.colourName}
                type="button"
                title={v.colourName}
                aria-label={`Select ${v.colourName} colourway`}
                onClick={() => {
                  setSelectedVariantIdx(idx);
                  setUserLockedVariant(true);
                }}
                className={`h-5 w-5 rounded-full border transition-transform ${
                  idx === selectedVariantIdx
                    ? 'scale-110 border-[#C9A24B] ring-2 ring-[#C9A24B]/50'
                    : 'border-white/30 hover:scale-105'
                }`}
                style={{ backgroundColor: v.colourHex }}
              />
            ))}
            {activeVariant && (
              <span className="ml-1 truncate text-xs text-[#F3EDE2]/75">
                {activeVariant.colourName}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between gap-2 border-t border-[#C9A24B]/10 pt-3 text-xs text-[#F3EDE2]/75">
            <span className="tabular-nums font-medium text-[#F7F1E6]">
              MOQ: {product.moq} pcs
            </span>
            <span className="truncate text-[#C9A24B]">
              {showStartingPrice ? product.startingPrice : 'Price on request'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="mt-3.5 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full bg-[#C9A24B] px-4 py-2 text-xs font-semibold text-[#0B0B0D] transition-colors duration-200 hover:bg-[#B68F38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121216] whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Add to Enquiry</span>
          </button>
        </div>
      </div>
    </article>
  );
}
