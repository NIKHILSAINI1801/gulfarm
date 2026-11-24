import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';
import { enquiryFormSchema, type EnquiryFormValues } from '../lib/validators';
import { useEnquiryStore } from '../store/enquiryStore';

export function EnquirySubmitPage() {
  const navigate = useNavigate();
  const items = useEnquiryStore((s) => s.items);
  const clearItems = useEnquiryStore((s) => s.clearItems);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultQty = items.reduce((sum, i) => sum + i.quantity, 0) || 12;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema) as never,
    defaultValues: {
      shopName: '',
      contactPerson: '',
      phone: '',
      email: '',
      city: '',
      state: '',
      gstNumber: '',
      totalQuantity: defaultQty,
      customLabel: false,
      notes: '',
      honeypot: '',
    },
  });

  useEffect(() => {
    if (items.length > 0) {
      setValue(
        'totalQuantity',
        items.reduce((sum, i) => sum + i.quantity, 0)
      );
    }
  }, [items, setValue]);

  const onSubmit = async (values: EnquiryFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'enquiry',
          ...values,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            colour: i.colour,
            sizeSplit: i.sizeSplit,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Could not submit enquiry. Please check your details.');
        return;
      }

      clearItems();
      navigate('/enquiry/thank-you', {
        state: {
          referenceCode: data.referenceCode,
          expectedResponse: data.expectedResponse,
          shopName: values.shopName,
          totalQuantity: values.totalQuantity,
        },
      });
    } catch {
      setServerError('Network error submitting enquiry. Please retry or use WhatsApp.');
    }
  };

  const inputClass =
    'mt-1.5 min-h-[44px] w-full rounded-[6px] border border-[#1E1B18]/20 bg-[#F7F1E6] px-3.5 text-sm text-[#1E1B18] placeholder:text-[#1E1B18]/45 focus:border-[#C9A24B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40';

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, I am filling out the B2B Wholesale Enquiry Form.">
      <PageMeta
        title="Submit B2B Wholesale Enquiry | MAGESTIC THREADs"
        description="Submit your shop details and shortlisted men's ethnic wear designs to receive wholesale price slabs and ready-stock confirmation."
      />

      <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-6 lg:py-16">
        <div className="border-b border-[#C9A24B]/20 pb-6">
          <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
            B2B WHOLESALE QUOTATION REQUEST
          </p>
          <h1 className="mt-2 font-serif text-[30px] font-bold text-[#F7F1E6] sm:text-[40px]">
            Submit Wholesale Enquiry
          </h1>
          <p className="mt-2 text-sm text-[#F3EDE2]/80">
            Provide your showroom or boutique details below. Our Seelampur wholesale desk shares
            tier-based price slabs and dispatch timelines within 4 business hours.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8" noValidate>
          {/* Honeypot anti-spam field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="company-website">Website</label>
            <input id="company-website" tabIndex={-1} autoComplete="off" {...register('honeypot')} />
          </div>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-[6px] border border-[#5A0F1F] bg-[#5A0F1F]/25 p-4 text-sm text-[#F7F1E6]"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A24B]" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Section 1: Shop Details */}
          <section className="rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-6">
            <h2 className="font-serif text-xl font-bold text-[#F7F1E6]">
              1. Shop &amp; Business Details
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="shopName" className="block text-xs font-semibold text-[#F7F1E6]">
                  Shop / Showroom Name *
                </label>
                <input
                  id="shopName"
                  type="text"
                  placeholder="e.g. Royal Dulha Ghar"
                  className={inputClass}
                  {...register('shopName')}
                />
                {errors.shopName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.shopName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contactPerson" className="block text-xs font-semibold text-[#F7F1E6]">
                  Contact Person Name *
                </label>
                <input
                  id="contactPerson"
                  type="text"
                  placeholder="Owner / Buyer Name"
                  className={inputClass}
                  {...register('contactPerson')}
                />
                {errors.contactPerson && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.contactPerson.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-[#F7F1E6]">
                  WhatsApp / Mobile Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="+91 98XXXXXXXX"
                  className={inputClass}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#F7F1E6]">
                  Email Address (for PDF Quote)
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="buyer@yourshop.in"
                  className={inputClass}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-[#F7F1E6]">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g. Jaipur"
                  className={inputClass}
                  {...register('city')}
                />
                {errors.city && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold text-[#F7F1E6]">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  placeholder="e.g. Rajasthan"
                  className={inputClass}
                  {...register('state')}
                />
                {errors.state && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="gstNumber" className="block text-xs font-semibold text-[#F7F1E6]">
                  GSTIN Number (Optional — required only at billing)
                </label>
                <input
                  id="gstNumber"
                  type="text"
                  placeholder="e.g. 08AABCU9603R1ZM"
                  className={inputClass}
                  {...register('gstNumber')}
                />
                {errors.gstNumber && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.gstNumber.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Requirements */}
          <section className="rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-6">
            <h2 className="font-serif text-xl font-bold text-[#F7F1E6]">
              2. Order &amp; Customisation Requirements
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="totalQuantity" className="block text-xs font-semibold text-[#F7F1E6]">
                  Estimated Total Quantity (pieces) *
                </label>
                <input
                  id="totalQuantity"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className={inputClass}
                  {...register('totalQuantity')}
                />
                {errors.totalQuantity && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#E57373]">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.totalQuantity.message}
                  </p>
                )}
              </div>

              <div className="flex items-center pt-5">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#F7F1E6]">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[#C9A24B] accent-[#C9A24B]"
                    {...register('customLabel')}
                  />
                  <span>Need private labelling / custom showroom neck tags</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-xs font-semibold text-[#F7F1E6]">
                  Additional Notes (plus sizes 48–52, urgent wedding date, sample request)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Share preferred dispatch timeline, transport agency name, or custom fabric/colour requests..."
                  className="mt-1.5 w-full rounded-[6px] border border-[#1E1B18]/20 bg-[#F7F1E6] p-3.5 text-sm text-[#1E1B18] placeholder:text-[#1E1B18]/45 focus:border-[#C9A24B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40"
                  {...register('notes')}
                />
              </div>
            </div>
          </section>

          {/* Section 3: Selected Designs Recap */}
          <section className="rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-xl font-bold text-[#F7F1E6]">
                3. Selected Designs Recap ({items.length})
              </h2>
              <Link to="/enquiry" className="text-xs font-semibold text-[#C9A24B] hover:underline">
                Edit List
              </Link>
            </div>

            {items.length === 0 ? (
              <p className="mt-3 text-sm text-[#F3EDE2]/75">
                No individual designs attached — submitting as a general wholesale catalogue &amp;
                price slab enquiry.{' '}
                <Link to="/collections" className="text-[#C9A24B] underline">
                  Add specific designs
                </Link>
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#C9A24B]/15 text-sm">
                {items.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-semibold text-[#F7F1E6]">{item.name}</p>
                      <p className="text-xs text-[#F3EDE2]/70">
                        Colour: {item.colour} · Size split:{' '}
                        {Object.entries(item.sizeSplit)
                          .filter(([, q]) => q > 0)
                          .map(([s, q]) => `${s}:${q}`)
                          .join(', ') || 'Assorted'}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-[#C9A24B] tabular-nums">
                      {item.quantity} pcs
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="inline-flex items-center gap-1.5 text-xs text-[#F3EDE2]/65">
              <Lock className="h-3.5 w-3.5 text-[#C9A24B]" aria-hidden="true" />
              Protected B2B enquiry · Shared exclusively with MAGESTIC THREADs sales desk
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#C9A24B] px-8 py-3 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#B68F38] disabled:opacity-60 sm:w-auto"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Submitting Enquiry...' : 'Request Wholesale Quote'}</span>
            </button>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
