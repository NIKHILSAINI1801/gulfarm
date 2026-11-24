import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../components/layout/SiteLayout';
import { ProductCard } from '../components/product/ProductCard';
import { PageMeta } from '../components/ui/PageMeta';
import { SkeletonGrid } from '../components/ui/SkeletonGrid';
import type { Product } from '../types';

interface CuratedCollectionPageProps {
  mode: 'new-arrivals' | 'best-sellers';
}

export function CuratedCollectionPage({ mode }: CuratedCollectionPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isNew = mode === 'new-arrivals';
  const title = isNew ? 'New Arrivals — Wedding Season 2026–27' : 'Wholesale Best Sellers';
  const subtitle = isNew
    ? 'Fresh factory-floor releases in Zardozi Jodhpuri shrugs, micro-velvet sherwanis, and brocade Nehru jackets ready for pre-season booking.'
    : 'Proven high-turnover silhouettes consistently reordered by bridal showrooms and menswear boutiques across India.';

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const query = isNew ? 'isNew=true' : 'isBestSeller=true';
    fetch(`/api/products?${query}&limit=24`)
      .then((r) => r.json())
      .then((data) => {
        if (alive) setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isNew]);

  return (
    <SiteLayout whatsappContext={`Hello MAGESTIC THREADs, I am viewing ${title} and need wholesale prices.`}>
      <PageMeta
        title={`${title} | MAGESTIC THREADs Delhi`}
        description={subtitle}
      />

      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-xs text-[#F3EDE2]/65">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-[#C9A24B]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-[#C9A24B]">{isNew ? 'New Arrivals' : 'Best Sellers'}</li>
          </ol>
        </nav>

        <header className="mt-4 border-b border-[#C9A24B]/20 pb-8">
          <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
            CURATED WHOLESALE EDIT
          </p>
          <h1 className="mt-2 font-serif text-[32px] font-bold text-[#F7F1E6] sm:text-[44px]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#F3EDE2]/80 sm:text-base">
            {subtitle}
          </p>
        </header>

        <div className="mt-8">
          {loading ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
