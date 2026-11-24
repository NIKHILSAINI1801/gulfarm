# Architecture & Implementation Decisions (`MAGESTIC THREADs`)

1. **Runtime Stack Adaptation (React + Vite + Express + SQLite)**
   - The Google AI Studio runtime environment is configured for a full-stack Node/Express + Vite + React 19 SPA (`server.ts`) rather than Next.js App Router.
   - Accordingly, all 15+ routes (`/`, `/collections`, `/collections/:category`, `/product/:slug`, `/new-arrivals`, `/best-sellers`, `/how-wholesale-works`, `/about`, `/catalogue`, `/enquiry`, `/enquiry/submit`, `/enquiry/thank-you`, `/policies`, `/contact`, `/account`, `/admin`, and 404) are implemented via `react-router-dom`, backed by REST APIs in `server.ts`, dynamic `/sitemap.xml` and `/robots.txt`, and per-route `PageMeta` + JSON-LD structured data.
   - Database persistence uses `better-sqlite3` (`magestic.db`) with the exact normalized tables requested (`categories`, `products`, `product_variants`, `product_images`, `enquiries`, `enquiry_items`, `testimonials`, `users`, `settings`), allowing straightforward migration to PostgreSQL if desired.

2. **Typography Pair**
   - Headings use `Playfair Display` (600, 700) and body/UI uses `Plus Jakarta Sans` (400, 500, 600, 700) with `tabular-nums` for quantities, MOQs, and size breakdowns.

3. **Admin Authentication & First-Run Claim Flow**
   - If `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables are configured in Secrets, `/admin` authenticates against them.
   - If they are unset and no admin user exists in SQLite yet, `/admin` renders a one-time **Claim Initial Admin Account** form (`POST /api/admin/bootstrap`) that hashes the owner's password with `bcryptjs` and locks bootstrap immediately afterward.
   - Admin session tokens use HMAC-SHA256 signed `Authorization: Bearer` tokens stored strictly in React state memory (never in `localStorage`/`sessionStorage`).

4. **Placeholder Business Data (`TODO` markers)**
   - Sample MOQs (4–12 pcs), placeholder Seelampur street plot number, phone (`+91 98110 00000`), GSTIN placeholder, and optional starting prices are marked with `TODO` in `server/seed.ts` and can be edited live inside `/admin` -> **Catalogue & Settings** without code edits.
