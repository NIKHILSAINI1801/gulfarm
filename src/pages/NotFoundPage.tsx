import { Link } from 'react-router-dom';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';

export function NotFoundPage() {
  return (
    <SiteLayout>
      <PageMeta
        title="Page Not Found | MAGESTIC THREADs Wholesale"
        description="The requested page could not be found. Return to MAGESTIC THREADs wholesale collections."
      />

      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-serif text-5xl font-bold text-[#C9A24B]">404</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-[#F7F1E6]">Page Not Found</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#F3EDE2]/75">
          The wholesale page or design URL you followed is unavailable. Return to the Home page or
          explore our full ethnic wear catalogue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center rounded-full bg-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38]"
          >
            Back to Home
          </Link>
          <Link
            to="/collections"
            className="inline-flex min-h-[44px] items-center rounded-full border border-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
