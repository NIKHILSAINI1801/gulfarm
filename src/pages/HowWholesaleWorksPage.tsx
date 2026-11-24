import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';

const WHOLESALE_FAQS = [
  {
    q: 'Minimum Order Quantity (MOQ) & Size Sets',
    a: 'TODO: Confirm exact per-category MOQ with owner. Standard showroom MOQ is 4–6 pieces per design for Bridal Sherwanis and Jodhpuri Suits, and 10–12 pieces for Nehru Jackets / Sadri sets. Each standard set covers sizes 36, 38, 40, 42, 44, and 46. Extended sizes (48, 50, 52) are produced on bulk confirmation.',
  },
  {
    q: 'Wholesale Price Slabs & Margin Structure',
    a: 'We operate strictly B2B without public retail prices so our partner showrooms protect their local retail margins. We quote 3 transparent slabs: Trial Set (MOQ), Showroom Pack (20–50 pcs mixed), and Season Volume Order (50+ pcs).',
  },
  {
    q: 'Sample Piece Policy',
    a: 'First-time retailers may order 1–2 sample pieces at sample wholesale rate prior to bulk booking. Sample charges are adjusted against your first confirmed bulk order above 20 pieces.',
  },
  {
    q: 'Payment Terms & 100% GST Billing',
    a: 'All orders are billed with compliant B2B GST invoices. Ready-stock orders require 50% booking advance and 50% prior to transport dispatch via UPI, NEFT, or RTGS. Made-to-order production requires 50% advance to initiate cutting & embroidery.',
  },
  {
    q: 'Delivery Timelines & Pan-India Shipping',
    a: 'Ready-stock orders ship within 48 hours of balance confirmation. Made-to-order and custom colourway runs dispatch in 7–12 business days. We ship Pan-India via VRL Logistics, Safexpress, Delhivery B2B, and Delhi-station transport agencies (bilty shared immediately).',
  },
  {
    q: 'Private Labelling & Customisation',
    a: 'For orders of 25+ pieces across a category, we offer woven neck-label stitching, custom showroom garment bags, and tailored colourway dye runs.',
  },
  {
    q: 'Replacement & Defect Policy',
    a: 'Every piece clears 3-stage QC in Seelampur. Any transit damage or stitching/embroidery defect reported within 7 days of delivery with unboxing video is replaced or credited immediately.',
  },
  {
    q: 'Video-Call Stock Viewing & Seelampur Factory Visit',
    a: 'Cannot travel to Delhi right now? Book a 20-minute live WhatsApp video-call walkthrough directly from our showroom racks, or visit our Seelampur unit Monday–Saturday (10:00 AM – 7:30 PM).',
  },
];

export function HowWholesaleWorksPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, I have a question about MOQ, slabs, and GST wholesale terms.">
      <PageMeta
        title="How Wholesale Works | MOQ, Price Slabs, GST & Shipping | MAGESTIC THREADs"
        description="Complete B2B wholesale guide for retailers: MOQ, size sets 36-46+, sample policy, GST billing, Pan-India transport, and factory visits in Seelampur, Delhi."
      />

      <div className="mx-auto max-w-[1040px] px-4 py-12 sm:px-6 lg:py-20">
        <header className="border-b border-[#C9A24B]/20 pb-8">
          <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
            B2B ORDERING PLAYBOOK
          </p>
          <h1 className="mt-2 font-serif text-[32px] font-bold text-[#F7F1E6] sm:text-[44px]">
            How Wholesale Works
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#F3EDE2]/80 sm:text-base">
            Clear answers to every question retailers ask before placing their first bulk order with
            our Seelampur, Delhi manufacturing unit.
          </p>
        </header>

        {/* Vertical Stepper with Gold Numerals */}
        <section className="mt-12 space-y-6">
          {[
            {
              num: '01',
              title: 'Shortlist Designs & Colourways',
              detail:
                'Browse Sherwanis, Jodhpuri Shrugs, Indo-Western Sets, Blazers, and Nehru Jackets. Add preferred designs and size splits (36–46+) to your Enquiry List.',
            },
            {
              num: '02',
              title: 'Receive Formal Wholesale Quote & Slabs',
              detail:
                'Submit your shop details. Within 4 business hours, our wholesale desk shares slab-wise pricing, ready-stock status, and fabric close-ups via WhatsApp or email.',
            },
            {
              num: '03',
              title: 'Inspect Live Stock (Video Call or Sample)',
              detail:
                'Verify embroidery finish, fabric weight, and lining over a live WhatsApp video call from our Seelampur showroom—or order a sample set before bulk commitment.',
            },
            {
              num: '04',
              title: 'GST Billing, Packing & Pan-India Dispatch',
              detail:
                'Approve your proforma invoice, pay via UPI/NEFT/RTGS, and receive dispatch bilty / courier tracking within 48 hours for ready stock.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="flex gap-5 rounded-[6px] border border-[#C9A24B]/25 bg-[#121216] p-6"
            >
              <span className="shrink-0 font-serif text-3xl font-bold text-[#C9A24B] tabular-nums">
                {step.num}
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#F7F1E6]">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#F3EDE2]/80">{step.detail}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Expandable Wholesale Terms */}
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-bold text-[#F7F1E6] sm:text-3xl">
            MOQ, Payment, Shipping &amp; Sample Policies
          </h2>
          <div className="mt-6 divide-y divide-[#C9A24B]/20 rounded-[6px] border border-[#C9A24B]/25 bg-[#121216]">
            {WHOLESALE_FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 px-6 py-4 text-left text-base font-semibold text-[#F7F1E6] hover:text-[#C9A24B]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#C9A24B] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm leading-relaxed text-[#F3EDE2]/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[6px] border border-[#C9A24B]/30 bg-[#5A0F1F]/35 p-6 sm:p-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#F7F1E6]">
              Ready to Request Wholesale Rates?
            </h2>
            <p className="mt-1 text-sm text-[#F3EDE2]/80">
              Start building your Enquiry List or schedule a Seelampur factory walkthrough.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/collections"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38]"
            >
              <span>Browse Collections</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-[44px] items-center rounded-full border border-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
            >
              Book Video-Call Viewing
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
