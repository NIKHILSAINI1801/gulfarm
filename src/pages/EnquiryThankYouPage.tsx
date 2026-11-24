import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';
import { useSiteData } from '../context/SiteDataContext';
import { buildWhatsAppUrl } from '../lib/whatsapp';

interface ThankYouState {
  referenceCode?: string;
  expectedResponse?: string;
  shopName?: string;
  totalQuantity?: number;
}

export function EnquiryThankYouPage() {
  const location = useLocation();
  const state = (location.state || {}) as ThankYouState;
  const { settings } = useSiteData();

  const refCode = state.referenceCode || 'MT-CONFIRMED';
  const waHref = buildWhatsAppUrl(
    settings.whatsapp_number,
    `Hello MAGESTIC THREADs, I just submitted wholesale enquiry ${refCode}${
      state.shopName ? ` for ${state.shopName}` : ''
    }. Please share slab rates.`
  );

  return (
    <SiteLayout>
      <PageMeta
        title="Enquiry Received | MAGESTIC THREADs Wholesale"
        description="Your B2B wholesale enquiry has been received by MAGESTIC THREADs Seelampur, Delhi."
      />

      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <div className="rounded-[6px] border border-[#C9A24B]/35 bg-[#121216] p-8 sm:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#1F7A4D]" aria-hidden="true" />
          <p className="mt-4 text-xs font-semibold tracking-wider text-[#C9A24B]">
            ENQUIRY SUBMITTED SUCCESSFULLY
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[#F7F1E6] sm:text-4xl">
            Thank You{state.shopName ? `, ${state.shopName}` : ''}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#F3EDE2]/80">
            Your bulk wholesale enquiry has been logged with our Seelampur factory desk.
          </p>

          <div className="mt-6 rounded-[6px] border border-[#C9A24B]/25 bg-[#0B0B0D] p-4 text-sm">
            <p className="text-xs text-[#F3EDE2]/65">Reference Number</p>
            <p className="mt-1 font-mono text-lg font-bold text-[#C9A24B] tabular-nums">
              {refCode}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#F3EDE2]/80">
              <Clock className="h-4 w-4 text-[#C9A24B]" aria-hidden="true" />
              <span>
                {state.expectedResponse ||
                  'Expected response within 4 business hours (Mon–Sat, 10 AM – 7:30 PM IST)'}
              </span>
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#1F7A4D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#19633e]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Fast-Track on WhatsApp</span>
            </a>
            <Link
              to="/collections"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#C9A24B] px-6 py-3 text-sm font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
