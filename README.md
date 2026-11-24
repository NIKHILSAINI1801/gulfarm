# MAGESTIC THREADs — Factory-Direct B2B Wholesale Website

Production full-stack B2B wholesale platform for **MAGESTIC THREADs** (Seelampur, Delhi), built for men's ethnic wear retailers, bridal showrooms, and boutique buyers across India.

## Key Capabilities

- **Zero Retail Checkout / Pure B2B Conversion**: No `Buy Now`, no online cart totals, and no public prices (defaults to `On request`, with an optional admin toggle). Every product supports `Add to Enquiry / Request Wholesale Price` and direct WhatsApp click-to-chat with prefilled design context.
- **Persistent Enquiry List**: Built with Zustand `persist` middleware (`localStorage`) supporting size-split breakdowns (`36–46`) and bulk quantities across page reloads.
- **Catalogue Filters & URL State**: Filter by category, colour, fabric, occasion (`Wedding`, `Sangeet`, `Festive`, `Reception`), MOQ/slab tier, search terms, and sort order—synced to URL query parameters.
- **Protected Admin Back Office (`/admin`)**:
  - First-run admin claim form (when `ADMIN_PASSWORD` env var is unset) or environment-managed credentials.
  - Full CRUD for products (with image upload to `/public/uploads`, colour variants, and specifications), categories, testimonials, site settings, PDF catalogue replacement, and enquiry status management (`New`, `Contacted`, `Quoted`, `Won`, `Lost`) with CSV export.

## Local Setup & Commands

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment** (copy `.env.example` to `.env` and fill in your values):
   - `VITE_WHATSAPP_NUMBER`: Business WhatsApp number (digits only, e.g. `919811000000`)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: Optional env-managed admin login (otherwise claim via `/admin` on first launch)
   - `RESEND_API_KEY` or `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`: Optional email notifications (defaults to server console logging)
3. **Run development server** (auto-initializes & seeds `magestic.db` and `public/catalogue.pdf` on boot):
   ```bash
   npm run dev
   ```
4. **Run unit tests, type-check, and production build**:
   ```bash
   npm test
   npm run lint
   npm run build
   npm start
   ```

## Deploy to GitHub and Vercel

The app's Express API is deployed with the Vite frontend. Production data and uploaded files must use managed storage because Vercel Functions have an ephemeral filesystem.

1. Push this project folder to the `NIKHILSAINI1801/gulfarm` GitHub repository and import that repository into Vercel. Set the Vercel project root to this app folder.
2. Create a Neon PostgreSQL database and a Vercel Blob store, then add these environment variables in the Vercel project settings (Production, Preview, and Development as needed):
   - `DATABASE_URL`: Neon PostgreSQL connection string; use the pooled connection string for serverless deployments.
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token.
   - `AUTH_SECRET`: stable random secret of at least 32 characters. Keep it private and unchanged so admin sessions remain valid across function instances.
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: optional environment-managed admin credentials. If omitted, claim the first admin account at `/admin`.
   - `VITE_WHATSAPP_NUMBER`: business WhatsApp number, digits only.
   - `APP_URL` and `VITE_SITE_URL`: deployed site URL, including `https://`.
   - Configure `RESEND_API_KEY` or SMTP variables if enquiry email notifications are required.
3. Deploy from Vercel. The database schema and initial catalogue are initialized on the first API request. Product images and PDF catalogue uploads are stored in Vercel Blob.

Never commit `.env` files, database files, or deployment secrets. Local development continues to use SQLite and local uploads.

## How the Owner Adds a Product in Admin

1. Visit `/admin` and sign in (or claim your owner account on first run).
2. Open the **Products** tab and click **Add New Product**.
3. Enter the design name, category, fabric, embroidery work, MOQ, and size range.
4. Click **Upload Image** to upload a portrait product photo directly from your phone or computer.
5. Toggle **New Arrival** or **Best Seller** if applicable and click **Save Product** — the design appears immediately on `/collections` and `/` Home.
