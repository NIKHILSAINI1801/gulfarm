import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';

const POLICY_SECTIONS = [
  {
    id: 'samples',
    title: '1. Sample Piece Policy',
    body: 'New retail partners may request 1 to 2 sample pieces per design to verify fabric GSM, hand embroidery density, and fitting before placing a bulk set order. Sample pricing is quoted at single-piece wholesale rate plus courier charges. Once your first bulk order of 20+ pieces is confirmed, the sample differential is credited on your GST invoice.',
  },
  {
    id: 'payment',
    title: '2. Payment Terms & GST Billing',
    body: 'MAGESTIC THREADs operates strictly on B2B wholesale billing with GST invoicing. For ready-stock dispatches: 50% booking advance and 50% balance prior to transport hand-off (confirmed via packing photos/video). For custom dye runs or made-to-order sets: 50% advance to start production and 50% upon readiness. Accepted modes: UPI, NEFT, RTGS, and Bank Transfer.',
  },
  {
    id: 'shipping',
    title: '3. Pan-India Shipping & Dispatch Timelines',
    body: 'Ready-stock orders dispatch within 48 hours of balance settlement. Made-to-order sets dispatch within 7–12 business days depending on hand-work load. We ship across India via VRL Logistics, Safexpress, Delhivery B2B, and buyer-nominated Delhi transport agencies. Transport bilty / AWB tracking is shared immediately on WhatsApp.',
  },
  {
    id: 'replacement',
    title: '4. Defect & Replacement Policy',
    body: 'Every garment passes a 3-stage quality check at our Seelampur unit. In the rare case of transit damage, wrong size-set dispatch, or a manufacturing defect, please share an unboxing video and clear photos within 7 days of delivery. Verified defects are replaced at zero extra freight or credited in full.',
  },
  {
    id: 'privacy',
    title: '5. B2B Buyer Privacy Policy',
    body: 'Shop names, buyer phone numbers, GSTIN details, and order histories submitted via our Enquiry Form or Catalogue Lead Form are used solely to prepare wholesale quotations, proforma invoices, and seasonal stock updates. We never sell or share retailer contact data with third-party marketers.',
  },
];

export function PoliciesPage() {
  const [openId, setOpenId] = useState<string | null>('samples');

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, I have a question regarding your wholesale policies.">
      <PageMeta
        title="Wholesale Policies: Samples, Payment, Shipping & Replacement | MAGESTIC THREADs"
        description="Read clear B2B wholesale policies for MAGESTIC THREADs Seelampur, Delhi: sample policy, GST payment terms, Pan-India shipping, replacement guarantee, and privacy."
      />

      <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:py-20">
        <header className="border-b border-[#C9A24B]/20 pb-8">
          <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
            CLEAR B2B TERMS
          </p>
          <h1 className="mt-2 font-serif text-[32px] font-bold text-[#F7F1E6] sm:text-[44px]">
            Wholesale Policies
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#F3EDE2]/80">
            Transparent terms covering samples, GST invoicing, Pan-India transport, and quality
            assurance.
          </p>
        </header>

        <div className="mt-8 divide-y divide-[#C9A24B]/20 rounded-[6px] border border-[#C9A24B]/25 bg-[#121216]">
          {POLICY_SECTIONS.map((sec) => {
            const isOpen = openId === sec.id;
            return (
              <div key={sec.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : sec.id)}
                  className="flex min-h-[56px] w-full items-center justify-between gap-4 px-6 py-4 text-left font-serif text-lg font-bold text-[#F7F1E6] hover:text-[#C9A24B]"
                >
                  <span>{sec.title}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#C9A24B] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm leading-relaxed text-[#F3EDE2]/80">
                    {sec.body}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/enquiry/submit"
            className="inline-flex min-h-[48px] items-center rounded-full bg-[#C9A24B] px-7 py-3 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38]"
          >
            Proceed to Wholesale Enquiry
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
