import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';

export function AccountStubPage() {
  return (
    <SiteLayout>
      <PageMeta
        title="Retailer Portal (Coming Soon) | MAGESTIC THREADs"
        description="Retailer account portal for quick re-ordering and GST invoice history — coming in Phase 2."
      />

      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-[6px] border border-[#C9A24B]/30 bg-[#121216] p-10">
          <Lock className="mx-auto h-10 w-10 text-[#C9A24B]" aria-hidden="true" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-[#F7F1E6]">
            Retailer Login Coming Soon
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#F3EDE2]/75">
            Self-serve retailer accounts with past order history, GST invoice downloads, and
            one-click seasonal re-ordering are launching soon. Until then, build and submit bulk
            requests directly via your Enquiry List.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/collections"
              className="inline-flex min-h-[44px] items-center rounded-full bg-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#0B0B0D]"
            >
              Browse Collections
            </Link>
            <Link
              to="/enquiry"
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#C9A24B]"
            >
              Go to Enquiry List
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
