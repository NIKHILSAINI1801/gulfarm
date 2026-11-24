import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Factory,
  Layers,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Truck,
} from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { ProductCard } from '../components/product/ProductCard';
import { PageMeta } from '../components/ui/PageMeta';
import { ProductImageFrame } from '../components/ui/ProductImageFrame';
import { SkeletonGrid } from '../components/ui/SkeletonGrid';
import { useSiteData } from '../context/SiteDataContext';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import type { Product } from '../types';

export function HomePage() {
  const { categories, testimonials, settings } = useSiteData();
  const [activeTab, setActiveTab] = useState<'best_sellers' | 'new_arrivals'>('best_sellers');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadingProducts(true);
    const param = activeTab === 'best_sellers' ? 'isBestSeller=true' : 'isNew=true';
    fetch(`/api/products?${param}&limit=8`)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setProducts(data.products || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingProducts(false);
      });
    return () => {
      active = false;
    };
  }, [activeTab]);

  const fiveCollections = categories.slice(0, 5);
  const activeTestimonial = testimonials[testimonialIdx] || testimonials[0];
  const heroWa = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello MAGESTIC THREADs, I visited your B2B website and want wholesale rates & catalogue details.'
  );

  const orgJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'MAGESTIC THREADs',
      description:
        "Factory-direct B2B wholesale manufacturer of men's ethnic wear based in Seelampur, Delhi.",
      url: window.location.origin,
      telephone: settings.phone,
      email: settings.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.address,
        addressLocality: 'Seelampur, Delhi',
        addressRegion: 'Delhi',
        postalCode: '110053',
        addressCountry: 'IN',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'MAGESTIC THREADs Wholesale Factory & Showroom',
      image: `${window.location.origin}/src/assets/images/hero_jodhpuri_royal_1795480640095.jpg`,
      telephone: settings.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.address,
        addressLocality: 'Delhi',
        postalCode: '110053',
        addressCountry: 'IN',
      },
      openingHours: 'Mo-Sa 10:00-19:30',
    },
  ];

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, I am on the Home page and would like wholesale pricing for my shop.">
      <PageMeta
        title="MAGESTIC THREADs | Wholesale Sherwani Delhi, Jodhpuri Wholesale & Nehru Jacket Manufacturer"
        description="Factory-direct men's ethnic wear for retailers and boutiques. Wholesale Sherwanis, Jodhpuri suits, Indo-Western sets, blazers & Nehru jackets from Seelampur, Delhi."
        jsonLd={orgJsonLd}
      />

      {/* 1. Full-Width Dark Hero */}
      <section className="relative overflow-hidden border-b border-[#C9A24B]/20 bg-gradient-to-br from-[#5A0F1F]/65 via-[#0F1B33]/85 to-[#0B0B0D]">
        <div className="mx-auto grid max-w-[1280px] items-stretch gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-20">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
              {settings.hero_subline}
            </p>
            <h1 className="mt-4 font-serif text-[36px] font-bold leading-[1.15] text-[#F7F1E6] sm:text-[48px] lg:text-[56px]">
              {settings.hero_headline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#F3EDE2]/85">
              Supplying bridal showrooms, multi-brand ethnic outlets, and wedding boutiques across
              India with consistent 36–46+ sizing, transparent MOQs, GST billing, and ready-stock
              dispatch straight from our Seelampur manufacturing unit.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/collections"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#C9A24B] px-7 py-3 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#B68F38] whitespace-nowrap"
              >
                <span>Request Wholesale Price</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/catalogue"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#C9A24B] px-6 py-3 text-sm font-semibold text-[#C9A24B] transition-colors hover:bg-[#C9A24B]/10 whitespace-nowrap"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Catalogue</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#C9A24B]/20 pt-6 text-xs text-[#F3EDE2]/75">
              <span>MOQ from 4–10 pcs per design</span>
              <span aria-hidden="true">·</span>
              <span>Sizes 36 to 46+</span>
              <span aria-hidden="true">·</span>
              <span>Private Labelling Available</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative mx-auto h-full max-h-[580px] overflow-hidden rounded-[6px] border border-[#C9A24B]/30 shadow-2xl">
              <img
                src="/assets/aistudio/846430292_18108414230110401_7559350944540047496_n._46a65b9c.webp"
                alt="MAGESTIC THREADs multi-colourway embroidered Jodhpuri bandhgala wholesale collection"
                className="h-full w-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0B0D]/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 rounded-[6px] border border-[#C9A24B]/30 bg-[#0B0B0D]/90 px-4 py-3 backdrop-blur-sm">
                <div>
                  <p className="text-xs font-medium text-[#C9A24B]">7-Colourway Showroom Pack</p>
                  <p className="font-serif text-sm font-semibold text-[#F7F1E6]">
                    Royal Tonal-Hem Jodhpuri Shrug Collection
                  </p>
                </div>
                <Link
                  to="/product/royal-tonal-hem-embroidered-jodhpuri-shrug"
                  className="shrink-0 text-xs font-semibold text-[#C9A24B] underline underline-offset-4 hover:text-[#F7F1E6]"
                >
                  Inspect 7 Colours
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Five Large Collection Tiles */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
              WHOLESALE CATEGORIES
            </p>
            <h2 className="mt-2 font-serif text-[28px] font-bold text-[#F7F1E6] sm:text-[40px]">
              Core Ethnic Wear Lines
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A24B] hover:underline whitespace-nowrap"
          >
            <span>Explore all 6 collections including Classic Sadri</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {fiveCollections.map((cat) => (
            <Link
              key={cat.slug}
              to={`/collections/${cat.slug}`}
              className="group relative overflow-hidden rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] transition-transform duration-200 hover:-translate-y-1 hover:border-[#C9A24B]/60"
            >
              <ProductImageFrame
                src={cat.image}
                alt={`${cat.name} wholesale supplier Delhi`}
                aspectClass="aspect-[3/4]"
                imgClassName="group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-lg font-bold text-[#F7F1E6] group-hover:text-[#C9A24B]">
                  {cat.name}
                </h3>
                <p className="mt-0.5 text-xs text-[#F3EDE2]/75">
                  {cat.productCount ? `${cat.productCount} wholesale styles` : 'Browse wholesale'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Why Buy From Us (Ivory Light Contrast Band for Rhythm) */}
      <section className="border-y border-[#C9A24B]/20 bg-[#F7F1E6] text-[#1E1B18]">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-[#5A0F1F]">
              BUILT FOR RETAILERS &amp; BOUTIQUES
            </p>
            <h2 className="mt-2 font-serif text-[28px] font-bold text-[#1E1B18] sm:text-[40px]">
              Why Wedding-Wear Retailers Source Direct From Us
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Factory,
                title: 'Direct Manufacturer Pricing',
                desc: 'Cut out Chandni Chowk & Surat middlemen margins. Factory-floor rate slabs starting at accessible MOQs.',
              },
              {
                icon: PackageCheck,
                title: 'Ready Stock Availability',
                desc: 'High-velocity Jodhpuri suits, blazers, and Nehru jackets stocked in 36–46 sets for rapid seasonal replenishment.',
              },
              {
                icon: Layers,
                title: '3-Stage Quality Control',
                desc: 'Every zardozi panel, Bemberg lining, and button finish is inspected at our Seelampur unit before packing.',
              },
              {
                icon: Truck,
                title: 'Pan-India Transport & GST',
                desc: 'Reliable dispatch via VRL, Safexpress, Delhivery B2B, and Delhi transport agencies with 100% GST invoicing.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[6px] border border-[#1E1B18]/15 bg-white/80 p-6 shadow-sm"
              >
                <item.icon className="h-6 w-6 text-[#5A0F1F]" aria-hidden="true" />
                <h3 className="mt-4 font-serif text-xl font-bold text-[#1E1B18]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1E1B18]/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best Sellers & New Arrivals Tabbed Gallery */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
              CURATED WHOLESALE GALLERY
            </p>
            <h2 className="mt-2 font-serif text-[28px] font-bold text-[#F7F1E6] sm:text-[40px]">
              Showroom Fast-Movers
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Gallery view selector"
            className="inline-flex rounded-full border border-[#C9A24B]/30 bg-[#121216] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'best_sellers'}
              onClick={() => setActiveTab('best_sellers')}
              className={`min-h-[40px] rounded-full px-5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'best_sellers'
                  ? 'bg-[#C9A24B] text-[#0B0B0D]'
                  : 'text-[#F3EDE2]/80 hover:text-[#F7F1E6]'
              }`}
            >
              Best Sellers
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'new_arrivals'}
              onClick={() => setActiveTab('new_arrivals')}
              className={`min-h-[40px] rounded-full px-5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'new_arrivals'
                  ? 'bg-[#C9A24B] text-[#0B0B0D]'
                  : 'text-[#F3EDE2]/80 hover:text-[#F7F1E6]'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        <div className="mt-8">
          {loadingProducts ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to={activeTab === 'best_sellers' ? '/best-sellers' : '/new-arrivals'}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#C9A24B] transition-colors hover:bg-[#C9A24B]/10"
          >
            <span>
              View All {activeTab === 'best_sellers' ? 'Best Sellers' : 'New Arrivals'}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 5. How Wholesale Works in 4 Steps */}
      <section className="border-y border-[#C9A24B]/20 bg-[#0F1B33]">
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
                TRANSPARENT B2B ORDERING
              </p>
              <h2 className="mt-2 font-serif text-[28px] font-bold text-[#F7F1E6] sm:text-[40px]">
                How Wholesale Works
              </h2>
            </div>
            <Link
              to="/how-wholesale-works"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A24B] hover:underline whitespace-nowrap"
            >
              <span>Read full MOQ, slabs &amp; GST terms</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                num: '01',
                title: 'Browse Designs',
                desc: 'Filter by category, fabric, colourway, and wedding occasion. Inspect 36–46 size specs and MOQ.',
              },
              {
                num: '02',
                title: 'Add to Enquiry',
                desc: 'Shortlist multiple designs and colourways into your Enquiry List with preferred size splits.',
              },
              {
                num: '03',
                title: 'Get Wholesale Quote',
                desc: 'Receive volume price slabs, sample options, and live stock video confirmation within 4 business hours.',
              },
              {
                num: '04',
                title: 'Order & Pan-India Ship',
                desc: 'Confirm with GST billing via UPI/NEFT and receive tracked transport dispatch across India.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="rounded-[6px] border border-[#C9A24B]/25 bg-[#0B0B0D]/60 p-6"
              >
                <span className="font-serif text-3xl font-bold text-[#C9A24B] tabular-nums">
                  {step.num}
                </span>
                <h3 className="mt-3 font-serif text-xl font-semibold text-[#F7F1E6]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F3EDE2]/75">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials Carousel */}
      {activeTestimonial && (
        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-[6px] border border-[#C9A24B]/30">
                <ProductImageFrame
                  src={activeTestimonial.image || '/src/assets/images/about_atelier_showroom_1795480642607.jpg'}
                  alt={`${activeTestimonial.shop} wholesale partner`}
                  aspectClass="aspect-[4/3]"
                />
              </div>
            </div>
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
                VERIFIED RETAIL PARTNERS
              </p>
              <h2 className="mt-2 font-serif text-[28px] font-bold text-[#F7F1E6] sm:text-[36px]">
                Trusted by Showrooms Across India
              </h2>
              <blockquote className="mt-6 font-serif text-xl leading-relaxed text-[#F7F1E6] sm:text-2xl">
                &ldquo;{activeTestimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#C9A24B]/20 pt-6">
                <div>
                  <p className="text-base font-semibold text-[#F7F1E6]">
                    {activeTestimonial.retailerName}
                  </p>
                  <p className="text-sm text-[#C9A24B]">
                    {activeTestimonial.shop} · {activeTestimonial.city}
                  </p>
                </div>
                {testimonials.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous testimonial"
                      onClick={() =>
                        setTestimonialIdx(
                          (idx) => (idx - 1 + testimonials.length) % testimonials.length
                        )
                      }
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A24B]/40 text-[#F7F1E6] hover:border-[#C9A24B]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next testimonial"
                      onClick={() =>
                        setTestimonialIdx((idx) => (idx + 1) % testimonials.length)
                      }
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A24B]/40 text-[#F7F1E6] hover:border-[#C9A24B]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. Enquiry Footer Band */}
      <section className="border-t border-[#C9A24B]/30 bg-gradient-to-r from-[#5A0F1F] via-[#3A0B17] to-[#0F1B33]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="font-serif text-[28px] font-bold text-[#F7F1E6] sm:text-[36px]">
              Ready to Stock Wedding &amp; Festive Ethnic Wear?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#F3EDE2]/85 sm:text-base">
              Talk directly with our Seelampur wholesale desk on WhatsApp, schedule a live video-call
              stock walkthrough, or submit your selected designs for slab pricing.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#F3EDE2]/85">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#C9A24B]" aria-hidden="true" />
                {settings.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-[#C9A24B]" aria-hidden="true" />
                {settings.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#C9A24B]" aria-hidden="true" />
                GST Billing &amp; Pan-India Transport
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={heroWa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#1F7A4D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#19633e] whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>WhatsApp Wholesale Desk</span>
            </a>
            <Link
              to="/enquiry/submit"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#C9A24B] px-6 py-3 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#B68F38] whitespace-nowrap"
            >
              <span>Submit Bulk Enquiry</span>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
