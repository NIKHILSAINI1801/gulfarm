import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, MessageCircle, Trash2 } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';
import { ProductImageFrame } from '../components/ui/ProductImageFrame';
import { useSiteData } from '../context/SiteDataContext';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { STANDARD_SIZES, useEnquiryStore } from '../store/enquiryStore';

export function EnquiryListPage() {
  const { items, updateItemQuantity, updateItemSizeSplit, removeItem, clearItems } =
    useEnquiryStore();
  const { settings } = useSiteData();

  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);

  const waSummary = buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello MAGESTIC THREADs, I shortlisted ${items.length} design(s) (${totalPieces} pcs total): ${items
      .map((i) => `${i.name} (${i.colour}, ${i.quantity} pcs)`)
      .join('; ')}. Please share wholesale slab pricing.`
  );

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, I am reviewing my Wholesale Enquiry List.">
      <PageMeta
        title="Enquiry List | MAGESTIC THREADs B2B Wholesale"
        description="Review your shortlisted wholesale Sherwanis, Jodhpuri suits, and Nehru jackets before requesting factory-direct slab quotes."
      />

      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#C9A24B]/20 pb-6">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
              WHOLESALE QUOTE BUILDER
            </p>
            <h1 className="mt-2 font-serif text-[30px] font-bold text-[#F7F1E6] sm:text-[40px]">
              Your Enquiry List
            </h1>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearItems}
              className="text-xs font-medium text-[#F3EDE2]/70 underline underline-offset-4 hover:text-[#C9A24B]"
            >
              Clear All Designs
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-10 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-[#C9A24B]" aria-hidden="true" />
            <h2 className="mt-4 font-serif text-2xl font-bold text-[#F7F1E6]">
              Your Wholesale Enquiry List is Empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#F3EDE2]/75">
              Browse our Sherwani, Jodhpuri, Indo-Western, Blazer, and Nehru Jacket collections and
              click &ldquo;Add to Enquiry&rdquo; on any design to build a combined wholesale quote.
            </p>
            <Link
              to="/collections"
              className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#C9A24B] px-7 py-3 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38]"
            >
              <span>Browse Wholesale Collections</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Left: Selected Designs */}
            <div className="space-y-4 lg:col-span-8">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-4 rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-4 sm:flex-row"
                >
                  <Link to={`/product/${item.slug}`} className="w-24 shrink-0 sm:w-28">
                    <ProductImageFrame
                      src={item.image}
                      alt={item.name}
                      aspectClass="aspect-[4/5]"
                      className="rounded-[4px]"
                    />
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#C9A24B]">{item.categoryName}</p>
                        <Link
                          to={`/product/${item.slug}`}
                          className="font-serif text-lg font-bold text-[#F7F1E6] hover:text-[#C9A24B]"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-[#F3EDE2]/75">
                          Colourway: <strong className="text-[#F7F1E6]">{item.colour}</strong> · MOQ{' '}
                          {item.moq} pcs
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="rounded p-2 text-[#F3EDE2]/60 hover:bg-[#5A0F1F]/40 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Editable Size Split */}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-[#F3EDE2]/70">
                        Size Breakdown (36–46):
                      </p>
                      <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {STANDARD_SIZES.map((sz) => (
                          <div key={sz}>
                            <label
                              htmlFor={`${item.key}-${sz}`}
                              className="block text-center text-[11px] text-[#F3EDE2]/60"
                            >
                              {sz}
                            </label>
                            <input
                              id={`${item.key}-${sz}`}
                              type="number"
                              min={0}
                              inputMode="numeric"
                              value={item.sizeSplit[sz] ?? 0}
                              onChange={(e) =>
                                updateItemSizeSplit(item.key, {
                                  ...item.sizeSplit,
                                  [sz]: Math.max(0, Number(e.target.value) || 0),
                                })
                              }
                              className="mt-0.5 min-h-[36px] w-full rounded-[4px] border border-[#C9A24B]/25 bg-[#0B0B0D] px-1 text-center text-xs text-[#F7F1E6] tabular-nums"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#C9A24B]/15 pt-3">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`${item.key}-qty`}
                          className="text-xs font-medium text-[#F3EDE2]/80"
                        >
                          Total Qty:
                        </label>
                        <input
                          id={`${item.key}-qty`}
                          type="number"
                          min={1}
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(item.key, Math.max(1, Number(e.target.value) || 1))
                          }
                          className="min-h-[38px] w-20 rounded-[4px] border border-[#C9A24B]/30 bg-[#0B0B0D] px-2 text-center text-sm font-semibold text-[#F7F1E6] tabular-nums"
                        />
                        <span className="text-xs text-[#F3EDE2]/65">pcs</span>
                      </div>
                      <span className="text-xs font-medium text-[#C9A24B]">
                        Wholesale quote on submission
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Sticky Summary */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 rounded-[6px] border border-[#C9A24B]/35 bg-[#121216] p-6">
                <h2 className="font-serif text-xl font-bold text-[#F7F1E6]">Enquiry Summary</h2>
                <dl className="mt-4 space-y-3 border-y border-[#C9A24B]/20 py-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#F3EDE2]/75">Shortlisted Designs</dt>
                    <dd className="font-semibold text-[#F7F1E6] tabular-nums">{items.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#F3EDE2]/75">Total Estimated Pieces</dt>
                    <dd className="font-semibold text-[#C9A24B] tabular-nums">
                      {totalPieces} pcs
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#F3EDE2]/75">Wholesale Pricing</dt>
                    <dd className="font-medium text-[#F7F1E6]">Slab quote on request</dd>
                  </div>
                </dl>

                <p className="mt-4 text-xs leading-relaxed text-[#F3EDE2]/70">
                  No payment is taken online. Submitting your enquiry routes your design list to our
                  Seelampur wholesale desk for exact slab pricing, ready-stock confirmation, and GST
                  proforma billing.
                </p>

                <div className="mt-6 space-y-3">
                  <Link
                    to="/enquiry/submit"
                    className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#C9A24B] px-6 py-3 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38]"
                  >
                    <span>Continue to Enquiry Form</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <a
                    href={waSummary}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#1F7A4D] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#19633e]"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Send This List on WhatsApp</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
