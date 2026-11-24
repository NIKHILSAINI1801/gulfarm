import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ClipboardList,
  Factory,
  FileCheck2,
  Menu,
  MessageCircle,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { useSiteData } from '../../context/SiteDataContext';
import { useEnquiryStore } from '../../store/enquiryStore';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { ToastBanner } from '../ui/ToastBanner';

interface SiteLayoutProps {
  children: React.ReactNode;
  whatsappContext?: string;
}

export function SiteLayout({ children, whatsappContext }: SiteLayoutProps) {
  const { categories, settings } = useSiteData();
  const enquiryItems = useEnquiryStore((s) => s.items);
  const enquiryCount = enquiryItems.length;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const defaultWaText =
    whatsappContext ||
    `Hello MAGESTIC THREADs team, I am browsing ${location.pathname} and would like wholesale pricing & MOQ details.`;
  const waHref = buildWhatsAppUrl(settings.whatsapp_number, defaultWaText);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 py-1.5 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-[#C9A24B] text-[#F7F1E6]'
        : 'border-transparent text-[#F3EDE2]/80 hover:text-[#C9A24B]'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0B0B0D] text-[#F3EDE2]">
      {/* Slim Top Announcement Strip */}
      <div className="border-b border-[#C9A24B]/20 bg-[#5A0F1F] px-4 py-1.5 text-center text-xs font-medium tracking-wide text-[#F7F1E6]">
        Manufacturer | B2B Wholesale Only | Pan-India Delivery
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[#C9A24B]/25 bg-[#0B0B0D]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="whitespace-nowrap shrink-0 font-serif text-lg font-bold tracking-tight text-[#F7F1E6] sm:text-xl"
          >
            MAGESTIC <span className="text-[#C9A24B]">THREADs</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main wholesale navigation"
            className="hidden items-center gap-5 lg:flex xl:gap-6"
          >
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                aria-expanded={collectionsOpen}
                onClick={() => setCollectionsOpen((v) => !v)}
                className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 border-b-2 py-1.5 text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/collections')
                    ? 'border-[#C9A24B] text-[#F7F1E6]'
                    : 'border-transparent text-[#F3EDE2]/80 hover:text-[#C9A24B]'
                }`}
              >
                <span>Collections</span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {collectionsOpen && (
                <div className="absolute left-0 top-full z-50 w-60 rounded-[6px] border border-[#C9A24B]/30 bg-[#121216] p-2 shadow-2xl">
                  <Link
                    to="/collections"
                    onClick={() => setCollectionsOpen(false)}
                    className="block rounded-[4px] px-3 py-2 text-sm font-semibold text-[#C9A24B] hover:bg-[#1E1B18]"
                  >
                    All Wholesale Collections
                  </Link>
                  <div className="my-1 border-t border-[#C9A24B]/15" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/collections/${cat.slug}`}
                      onClick={() => setCollectionsOpen(false)}
                      className="block rounded-[4px] px-3 py-2 text-sm text-[#F3EDE2]/85 hover:bg-[#1E1B18] hover:text-[#C9A24B]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/new-arrivals" className={navLinkClass}>
              New Arrivals
            </NavLink>
            <NavLink to="/how-wholesale-works" className={navLinkClass}>
              How Wholesale Works
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/catalogue" className={navLinkClass}>
              Catalogue
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/enquiry"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#C9A24B]/50 px-3.5 py-1.5 text-xs font-semibold text-[#F7F1E6] transition-colors hover:border-[#C9A24B] hover:bg-[#C9A24B]/10 whitespace-nowrap shrink-0"
              aria-label={`Enquiry List with ${enquiryCount} designs`}
            >
              <ClipboardList className="h-4 w-4 text-[#C9A24B]" aria-hidden="true" />
              <span className="hidden sm:inline">Enquiry List</span>
              <span className="tabular-nums rounded-full bg-[#C9A24B] px-1.5 py-0.5 text-[11px] font-bold text-[#0B0B0D]">
                {enquiryCount}
              </span>
            </Link>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-[40px] items-center gap-1.5 rounded-full bg-[#1F7A4D] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#19633e] sm:inline-flex whitespace-nowrap shrink-0"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#C9A24B]/30 text-[#F7F1E6] lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Full Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#C9A24B]/20 bg-[#0B0B0D] px-4 py-5 lg:hidden">
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/collections', label: 'All Collections' },
                { to: '/new-arrivals', label: 'New Arrivals' },
                { to: '/best-sellers', label: 'Best Sellers' },
                { to: '/how-wholesale-works', label: 'How Wholesale Works' },
                { to: '/about', label: 'About & Factory' },
                { to: '/catalogue', label: 'Download Catalogue' },
                { to: '/policies', label: 'Wholesale Policies' },
                { to: '/contact', label: 'Contact & Visit' },
                { to: '/enquiry', label: `Enquiry List (${enquiryCount})` },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center rounded-[6px] px-3 text-base font-medium text-[#F7F1E6] hover:bg-[#1E1B18]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 border-t border-[#C9A24B]/15 pt-3">
                <p className="px-3 pb-2 text-xs font-semibold text-[#C9A24B]">Categories</p>
                <div className="grid grid-cols-2 gap-1.5 px-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/collections/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-[6px] border border-[#C9A24B]/20 bg-[#121216] px-3 py-2.5 text-xs font-medium text-[#F3EDE2]"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#1F7A4D] px-5 py-3 text-sm font-semibold text-white"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                <span>Chat on WhatsApp for Wholesale</span>
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Trust Strip on Every Page */}
      <section
        aria-label="Wholesale buyer assurances"
        className="border-t border-[#C9A24B]/20 bg-[#0F1B33]"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Factory className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A24B]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#F7F1E6]">Direct Manufacturer</p>
              <p className="mt-0.5 text-xs text-[#F3EDE2]/75">
                In-house Seelampur, Delhi production with zero middlemen
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A24B]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#F7F1E6]">Pan-India Delivery</p>
              <p className="mt-0.5 text-xs text-[#F3EDE2]/75">
                Tracked transport & courier dispatch across 28 states
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A24B]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#F7F1E6]">Secure B2B Enquiry</p>
              <p className="mt-0.5 text-xs text-[#F3EDE2]/75">
                Private price slabs & full GST billing for verified retailers
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[#C9A24B]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[#F7F1E6]">Clear Wholesale Policies</p>
              <p className="mt-0.5 text-xs text-[#F3EDE2]/75">
                Transparent MOQ, sample, payment & defect replacement terms
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Footer */}
      <footer className="border-t border-[#C9A24B]/20 bg-[#0B0B0D]">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
          {/* Column 1: Brand & Address */}
          <div>
            <Link to="/" className="font-serif text-xl font-bold text-[#F7F1E6]">
              MAGESTIC <span className="text-[#C9A24B]">THREADs</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#F3EDE2]/75">
              Manufacturer and B2B wholesale house for men&apos;s wedding and festive ethnic wear.
              Supplying boutiques, dulha showrooms, and multi-brand retailers across India.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-[#F3EDE2]/65">
              Factory & Wholesale Desk: {settings.address}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#C9A24B]">Collections</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#F3EDE2]/80">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      to={`/collections/${cat.slug}`}
                      className="transition-colors hover:text-[#C9A24B]"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-sm font-semibold text-[#C9A24B]">Wholesale Info</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#F3EDE2]/80">
                <li>
                  <Link to="/how-wholesale-works" className="hover:text-[#C9A24B]">
                    How Wholesale Works
                  </Link>
                </li>
                <li>
                  <Link to="/policies" className="hover:text-[#C9A24B]">
                    Policies & Terms
                  </Link>
                </li>
                <li>
                  <Link to="/catalogue" className="hover:text-[#C9A24B]">
                    PDF Catalogue
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#C9A24B]">
                    About & Factory
                  </Link>
                </li>
                <li>
                  <Link to="/enquiry" className="hover:text-[#C9A24B]">
                    Enquiry List
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-[#C9A24B]">
                    Staff Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="font-serif text-sm font-semibold text-[#C9A24B]">Direct Wholesale Desk</h3>
            <div className="mt-3 space-y-2.5 text-sm text-[#F3EDE2]/80">
              <p>Phone: {settings.phone}</p>
              <p>Email: {settings.email}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#1F7A4D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#19633e]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>WhatsApp Desk</span>
                </a>
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center rounded-full border border-[#C9A24B]/50 px-4 py-2 text-xs font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
                >
                  Instagram DM
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C9A24B]/15 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 text-xs text-[#F3EDE2]/60 sm:flex-row">
            <p>© {new Date().getFullYear()} MAGESTIC THREADs · Made by Gulfam. All rights reserved.</p>
            <p>{settings.gst_note}</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button Bottom-Right */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message MAGESTIC THREADs on WhatsApp"
        className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1F7A4D] text-white shadow-xl ring-2 ring-[#C9A24B]/40 transition-transform duration-200 hover:scale-105 hover:bg-[#19633e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] sm:bottom-6 sm:right-6 sm:h-14 sm:w-auto sm:gap-2 sm:px-5"
      >
        <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="hidden text-xs font-semibold sm:inline whitespace-nowrap">
          WhatsApp Enquiry
        </span>
      </a>

      <ToastBanner />
    </div>
  );
}
