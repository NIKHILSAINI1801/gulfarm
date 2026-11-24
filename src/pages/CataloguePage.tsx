import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Download, FileText } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';
import { catalogueLeadFormSchema, type CatalogueLeadFormValues } from '../lib/validators';

export function CataloguePage() {
  const [downloaded, setDownloaded] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CatalogueLeadFormValues>({
    resolver: zodResolver(catalogueLeadFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      shopName: '',
      city: '',
      consent: true,
    },
  });

  const triggerDownload = () => {
    const link = document.createElement('a');
    link.href = '/api/catalogue/download';
    link.download = 'MAGESTIC-THREADs-Wholesale-Catalogue.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const onSubmit = async (values: CatalogueLeadFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/catalogue-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const d = await res.json();
        setServerError(d.error || 'Could not verify details.');
        return;
      }
      setDownloaded(true);
      triggerDownload();
    } catch {
      setServerError('Network error while preparing download.');
    }
  };

  const inputClass =
    'mt-1.5 min-h-[44px] w-full rounded-[6px] border border-[#1E1B18]/20 bg-[#F7F1E6] px-3.5 text-sm text-[#1E1B18] focus:border-[#C9A24B] focus:outline-none';

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, please send your latest wholesale PDF catalogue on WhatsApp.">
      <PageMeta
        title="Download Wholesale PDF Catalogue | MAGESTIC THREADs"
        description="Download the latest MAGESTIC THREADs wholesale lookbook PDF featuring Sherwanis, Jodhpuri suits, Indo-Western sets, blazers, and Nehru jackets."
      />

      <div className="mx-auto max-w-[1140px] px-4 py-12 sm:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left: Lookbook Cover Preview */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-[6px] border border-[#C9A24B]/40 bg-gradient-to-br from-[#5A0F1F] via-[#1B1218] to-[#0B0B0D] p-8 shadow-2xl">
              <p className="text-xs font-semibold tracking-widest text-[#C9A24B]">
                B2B SEASONAL LOOKBOOK
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-[#F7F1E6]">
                MAGESTIC THREADs
              </h2>
              <p className="mt-1 text-xs text-[#F3EDE2]/75">
                Wholesale Wedding &amp; Festive Edition · Seelampur, Delhi
              </p>
              <div className="mt-6 overflow-hidden rounded-[4px] border border-[#C9A24B]/30">
                <img
                  src="/src/assets/images/cat_sherwani_maroon_1795480640420.jpg"
                  alt="MAGESTIC THREADs Wholesale Catalogue Cover"
                  className="aspect-[4/5] w-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-[#C9A24B]">
                <span>PDF Format</span>
                <span>Sizes 36–46+ · Full Spec Codes</span>
              </div>
            </div>
          </div>

          {/* Right: Benefits + Lead Form */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
              RETAILER RESOURCE
            </p>
            <h1 className="mt-2 font-serif text-[30px] font-bold text-[#F7F1E6] sm:text-[40px]">
              Download Wholesale PDF Catalogue
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#F3EDE2]/80">
              Share our printable design lookbook with your buying team or showroom partners offline.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-[#F3EDE2]/85">
              {[
                'Design SKU codes, fabric compositions, and embroidery work details',
                'Complete colourway swatches and MOQ requirements per collection',
                'Standard 36–46 sizing chart and GST dispatch guidelines',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A24B]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[6px] border border-[#C9A24B]/30 bg-[#121216] p-6">
              {downloaded ? (
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#1F7A4D]" />
                  <h2 className="font-serif text-xl font-bold text-[#F7F1E6]">
                    Catalogue Download Started
                  </h2>
                  <p className="text-sm text-[#F3EDE2]/75">
                    If your browser did not automatically save the PDF, click below.
                  </p>
                  <button
                    type="button"
                    onClick={triggerDownload}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#0B0B0D]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF Again</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <h2 className="font-serif text-lg font-bold text-[#F7F1E6]">
                    Enter Shop Details to Download
                  </h2>

                  {serverError && (
                    <p className="flex items-center gap-2 text-xs text-[#E57373]">
                      <AlertCircle className="h-4 w-4" />
                      {serverError}
                    </p>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cat-name" className="block text-xs font-semibold text-[#F7F1E6]">
                        Your Name *
                      </label>
                      <input
                        id="cat-name"
                        type="text"
                        placeholder="Full name"
                        className={inputClass}
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-[#E57373]">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="cat-phone" className="block text-xs font-semibold text-[#F7F1E6]">
                        WhatsApp / Mobile *
                      </label>
                      <input
                        id="cat-phone"
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
                      <label htmlFor="cat-shop" className="block text-xs font-semibold text-[#F7F1E6]">
                        Shop / Boutique Name *
                      </label>
                      <input
                        id="cat-shop"
                        type="text"
                        placeholder="Your showroom name"
                        className={inputClass}
                        {...register('shopName')}
                      />
                      {errors.shopName && (
                        <p className="mt-1 text-xs text-[#E57373]">{errors.shopName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="cat-city" className="block text-xs font-semibold text-[#F7F1E6]">
                        City
                      </label>
                      <input
                        id="cat-city"
                        type="text"
                        placeholder="e.g. Surat"
                        className={inputClass}
                        {...register('city')}
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#F3EDE2]/75">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[#C9A24B]"
                      {...register('consent')}
                    />
                    <span>
                      I confirm this is a B2B wholesale enquiry and consent to receiving seasonal
                      catalogue updates via WhatsApp/phone.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-xs text-[#E57373]">{errors.consent.message}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#C9A24B] px-7 py-3 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38] disabled:opacity-60"
                    >
                      <Download className="h-4 w-4" />
                      <span>{isSubmitting ? 'Preparing PDF...' : 'Download Wholesale PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={triggerDownload}
                      className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[#C9A24B] underline underline-offset-4 hover:text-[#F7F1E6]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Direct PDF Preview</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
