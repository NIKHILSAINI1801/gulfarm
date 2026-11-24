import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Factory, MapPin } from 'lucide-react';
import { SiteLayout } from '../components/layout/SiteLayout';
import { PageMeta } from '../components/ui/PageMeta';
import { useSiteData } from '../context/SiteDataContext';

export function AboutPage() {
  const { settings } = useSiteData();

  return (
    <SiteLayout whatsappContext="Hello MAGESTIC THREADs, I would like to learn about your Seelampur factory & bulk collaborations.">
      <PageMeta
        title="About & Seelampur Factory | MAGESTIC THREADs Wholesale Delhi"
        description="Inside MAGESTIC THREADs: factory-direct men's ethnic wear manufacturer in Seelampur, Delhi supplying retailers across India with zardozi sherwanis, Jodhpuri suits, and Nehru jackets."
      />

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-wider text-[#C9A24B]">
              CRAFTED IN SEELAMPUR, DELHI
            </p>
            <h1 className="mt-2 font-serif text-[32px] font-bold leading-tight text-[#F7F1E6] sm:text-[44px]">
              A Dedicated Factory-Direct Wholesale House
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#F3EDE2]/85">
              Made by Gulfam in Seelampur, Delhi, MAGESTIC THREADs manufactures wedding and festive
              menswear in-house at our dedicated garment workshop. Instead of selling single pieces
              at retail markups, we partner exclusively with showrooms, dulha boutiques, and
              multi-brand apparel stores across India.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#F3EDE2]/75">
              From pattern grading across sizes 36 to 46+ to adda zardozi embroidery, Bemberg satin
              lining, and final steam pressing, every stage is controlled under one roof so your
              customers get consistent showroom fit season after season.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/collections"
                className="inline-flex min-h-[44px] items-center rounded-full bg-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#B68F38]"
              >
                Explore Wholesale Range
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-[44px] items-center rounded-full border border-[#C9A24B] px-6 py-2.5 text-sm font-semibold text-[#C9A24B] hover:bg-[#C9A24B]/10"
              >
                Schedule Factory Visit
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-[6px] border border-[#C9A24B]/30">
              <img
                src={
                  settings.atelier_image ||
                  '/src/assets/images/about_atelier_showroom_1795480642607.jpg'
                }
                alt="MAGESTIC THREADs Seelampur tailoring workshop and wholesale showroom racks"
                className="aspect-[16/10] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Quality Control & Production Pillars */}
        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Factory,
              title: 'In-House Master Tailoring',
              desc: 'Dedicated cutting masters and karigars specializing in bandhgala shoulder structure, sherwani flare drape, and symmetrical collar embroidery.',
            },
            {
              icon: CheckCircle2,
              title: '3-Stage Quality Inspection',
              desc: 'Fabric shrinkage checks before cutting, embroidery tension inspection on adda frames, and button/seam strength verification prior to poly-bagging.',
            },
            {
              icon: Award,
              title: 'Retailer Collaborations',
              desc: 'Private-label neck tags, custom showroom colour runs, and seasonal stock replenishment plans for multi-city wedding retailers.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[6px] border border-[#C9A24B]/20 bg-[#121216] p-6"
            >
              <item.icon className="h-6 w-6 text-[#C9A24B]" aria-hidden="true" />
              <h2 className="mt-4 font-serif text-xl font-bold text-[#F7F1E6]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#F3EDE2]/75">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Seelampur Location Card */}
        <section className="mt-14 rounded-[6px] border border-[#C9A24B]/25 bg-[#F7F1E6] p-8 text-[#1E1B18]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5A0F1F]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Seelampur Manufacturing Hub
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-[#1E1B18]">
                Visit Our Delhi Showroom &amp; Stock Floor
              </h2>
              <p className="mt-2 text-sm text-[#1E1B18]/80">{settings.address}</p>
              <p className="mt-1 text-xs text-[#1E1B18]/70">
                Open Monday – Saturday, 10:00 AM – 7:30 PM IST · 10 mins from Seelampur Metro
                Station
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[#5A0F1F] px-6 py-3 text-sm font-semibold text-[#F7F1E6] hover:bg-[#460B18]"
            >
              Book Visit or Video Call
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
