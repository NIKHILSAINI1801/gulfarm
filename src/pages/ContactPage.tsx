import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, CheckCircle2, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';
import { useSiteData } from '../context/SiteDataContext';
import { visitFormSchema, type VisitFormValues } from '../lib/validators';
import { buildWhatsAppUrl } from '../lib/whatsapp';

export function ContactPage() {
  const { settings } = useSiteData();
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      shopName: '',
      contactPerson: '',
      phone: '',
      city: '',
      visitMode: 'Video Call Stock Viewing',
      preferredDate: '',
      notes: '',
    },
  });

  const onSubmit = async (values: VisitFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/visit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Could not schedule request.');
        return;
      }
      setSubmittedRef(data.referenceCode);
      reset();
    } catch {
      setServerError('Network error. Please message us directly on WhatsApp.');
    }
  };

  const waHref = buildWhatsAppUrl(
    settings.whatsapp_number,
    'Hello MAGESTIC THREADs, I want to book a live video-call stock viewing or Seelampur factory visit.'
  );

  const inputClass =
    'mt-1.5 min-h-[44px] w-full rounded-[6px] border border-[#1E1B18]/20 bg-[#F7F1E6] px-3.5 text-sm text-[#1E1B18] focus:border-[#C9A24B] focus:outline-none';

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, I am on the Contact page and want to arrange a video-call viewing.">
      <PageMeta
        title="Contact & Book Seelampur Factory Visit | MAGESTIC THREADs Delhi"
        description="Contact MAGESTIC THREADs Seelampur, Delhi wholesale desk via WhatsApp, phone, or Instagram DM. Book a live video-call stock walkthrough or factory visit."
      />

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:py-20">
        <header className="border-b border-[#C9A24B]/20 pb-8">
          <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
            SEELAMPUR, DELHI WHOLESALE DESK
          </p>
          <h1 className="mt-2 font-serif text-[32px] font-bold text-[#F7F1E6] sm:text-[44px]">
            Contact &amp; Video-Call Stock Viewing
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#F3EDE2]/80">
            Reach our wholesale team directly or schedule a live WhatsApp video walkthrough of ready
            stock at our Seelampur unit.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Left: Direct Channels & Map */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-6 space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#F7F1E6]">Direct Channels</h2>

              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A24B]" />
                <div>
                  <p className="font-semibold text-[#F7F1E6]">Factory &amp; Showroom Address</p>
                  <p className="mt-0.5 text-[#F3EDE2]/75">{settings.address}</p>
                  <p className="mt-1 text-xs text-[#C9A24B]">Mon–Sat · 10:00 AM – 7:30 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A24B]" />
                <div>
                  <p className="font-semibold text-[#F7F1E6]">Wholesale Desk Phone</p>
                  <p className="mt-0.5 text-[#F3EDE2]/75">{settings.phone}</p>
                  <p className="mt-0.5 text-xs text-[#F3EDE2]/65">{settings.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#1F7A4D] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#19633e]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Now</span>
                </a>
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#C9A24B]/50 px-5 py-2.5 text-xs font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram DM</span>
                </a>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="overflow-hidden rounded-[6px] border border-[#C9A24B]/25 bg-[#121216]">
              <iframe
                title="MAGESTIC THREADs Seelampur Delhi Location Map"
                src="https://www.google.com/maps?q=Seelampur,Delhi,110053&output=embed"
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: Video Call / Factory Visit Form */}
          <div className="lg:col-span-7">
            <div className="rounded-[6px] border border-[#C9A24B]/30 bg-[#121216] p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[#C9A24B]">
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Book a Slot
                </span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-[#F7F1E6]">
                Request Video-Call Stock Viewing or Factory Visit
              </h2>
              <p className="mt-1.5 text-sm text-[#F3EDE2]/75">
                See real-time ready stock on WhatsApp video call or reserve a buyer slot in
                Seelampur.
              </p>

              {submittedRef ? (
                <div className="mt-6 rounded-[6px] border border-[#1F7A4D] bg-[#1F7A4D]/15 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#1F7A4D]" />
                  <h3 className="mt-3 font-serif text-xl font-bold text-[#F7F1E6]">
                    Appointment Request Received
                  </h3>
                  <p className="mt-1 text-sm text-[#F3EDE2]/80">
                    Reference: <strong className="text-[#C9A24B]">{submittedRef}</strong>. Our
                    showroom coordinator will confirm your time slot on WhatsApp shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedRef(null)}
                    className="mt-4 text-xs font-semibold text-[#C9A24B] underline"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                  {serverError && (
                    <p className="flex items-center gap-2 text-xs text-[#E57373]">
                      <AlertCircle className="h-4 w-4" />
                      {serverError}
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="v-shop" className="block text-xs font-semibold text-[#F7F1E6]">
                        Shop / Showroom Name *
                      </label>
                      <input
                        id="v-shop"
                        type="text"
                        placeholder="e.g. Sethi Menswear"
                        className={inputClass}
                        {...register('shopName')}
                      />
                      {errors.shopName && (
                        <p className="mt-1 text-xs text-[#E57373]">{errors.shopName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="v-person" className="block text-xs font-semibold text-[#F7F1E6]">
                        Buyer Name *
                      </label>
                      <input
                        id="v-person"
                        type="text"
                        placeholder="Your name"
                        className={inputClass}
                        {...register('contactPerson')}
                      />
                      {errors.contactPerson && (
                        <p className="mt-1 text-xs text-[#E57373]">
                          {errors.contactPerson.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="v-phone" className="block text-xs font-semibold text-[#F7F1E6]">
                        WhatsApp / Mobile *
                      </label>
                      <input
                        id="v-phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="+91 98XXXXXXXX"
                        className={inputClass}
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-[#E57373]">{errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="v-city" className="block text-xs font-semibold text-[#F7F1E6]">
                        City *
                      </label>
                      <input
                        id="v-city"
                        type="text"
                        placeholder="e.g. Indore"
                        className={inputClass}
                        {...register('city')}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-[#E57373]">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="v-mode" className="block text-xs font-semibold text-[#F7F1E6]">
                        Session Type *
                      </label>
                      <select id="v-mode" className={inputClass} {...register('visitMode')}>
                        <option value="Video Call Stock Viewing">Video Call Stock Viewing</option>
                        <option value="Seelampur Factory Visit">Seelampur Factory Visit</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="v-date" className="block text-xs font-semibold text-[#F7F1E6]">
                        Preferred Date &amp; Time *
                      </label>
                      <input
                        id="v-date"
                        type="text"
                        placeholder="e.g. Tomorrow 3:00 PM"
                        className={inputClass}
                        {...register('preferredDate')}
                      />
                      {errors.preferredDate && (
                        <p className="mt-1 text-xs text-[#E57373]">
                          {errors.preferredDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="v-notes" className="block text-xs font-semibold text-[#F7F1E6]">
                      Categories of Interest
                    </label>
                    <textarea
                      id="v-notes"
                      rows={3}
                      placeholder="e.g. Bridal Sherwanis and Jodhpuri Shrug sets in 36–46..."
                      className="mt-1.5 w-full rounded-[6px] border border-[#1E1B18]/20 bg-[#F7F1E6] p-3.5 text-sm text-[#1E1B18] focus:border-[#C9A24B] focus:outline-none"
                      {...register('notes')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-[#C9A24B] px-6 py-3 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38] disabled:opacity-60"
                  >
                    {isSubmitting ? 'Booking Slot...' : 'Confirm Viewing Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
