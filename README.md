# CouponCreek 🛍️

**Live site:** [couponcreek.com](https://couponcreek.com)

CouponCreek is a coupon & deal aggregator for the US fashion/apparel market, built with Next.js and Supabase. It surfaces verified promo codes for popular online stores and monetizes through affiliate partnerships (CJ Affiliate, Rakuten Advertising).

This is a solo-built, production-deployed project — not a tutorial clone. It's live, indexed by Google, and actively maintained.

---

## Features

- **Store, category & brand pages** with dynamic filtering (by subcategory, gender, brand) and shareable, SEO-friendly URLs
- **Two-tier affiliate link resolution** — coupon-level link takes priority when present, with automatic fallback to the store-level link, so every coupon always resolves to a working destination
- **Automated coupon lifecycle** — active and recently-expired coupons are separated in the UI for trust/SEO; expired coupons are automatically purged after 60 days via a scheduled `pg_cron` job
- **Full SEO infrastructure**: per-page metadata, JSON-LD structured data (`Organization`, `BreadcrumbList`, `CollectionPage`, `FAQPage`), dynamic Open Graph images, and an XML sitemap with accurate `lastmod` values driven by Postgres triggers on `updated_at`
- **Admin dashboard** (auth-protected via Supabase Auth) for creating, editing, and retiring coupons, with taxonomy-driven forms (categories, subcategories, brands) and autocomplete presets for common discount copy
- **Click tracking** — coupon interactions are logged (GA4 events + internal `clicks` table) to power usage counts shown to visitors and internal reporting
- **Copy-to-clipboard UX** built around a readonly `<input>` + dedicated copy button, avoiding layout shift and working reliably across browsers
- **100% Lighthouse accessibility score** on reviewed pages
- **Multi-channel sharing** (Telegram, WhatsApp, Viber, Facebook, X, Pinterest) via a custom portal-based share popover, plus native Web Share on mobile

## Tech Stack

- **Framework:** Next.js (App Router, Turbopack, Server Components & Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Hosting:** Vercel
- **Analytics:** Google Analytics 4, Vercel Analytics, Vercel Speed Insights, Microsoft Clarity

## Architecture Highlights

A few decisions worth calling out for anyone reading the code:

- **SEO-accurate sitemaps without manual upkeep.** Postgres triggers automatically stamp `created_at` / `updated_at` on the `stores` and `coupons` tables. `app/sitemap.ts` reads these timestamps directly, so every store/category/brand page reports a real, trustworthy `lastmod` to search engines — no cron job or manual sitemap regeneration required.
- **Affiliate link resolution with graceful fallback.** Each coupon can optionally carry its own tracking link (for merchants that require code-specific attribution); when absent, the resolver falls back to the store's default affiliate link. This is resolved server-side before redirect, so there's no client-side flicker or broken links.
- **Self-cleaning content.** A scheduled `pg_cron` job removes coupons more than 60 days past expiration, keeping the database — and the pages built from it — free of stale content without manual moderation.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is enough for local development)

### Setup

```bash
git clone https://github.com/SviatoslavZv/coupon-stream-app.git
cd coupon-stream-app
npm install
```

Create a `.env.local` file in the project root with your own Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CRON_SECRET=any_random_string_for_local_dev
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. You'll need to set up the corresponding tables (`stores`, `coupons`, `clicks`) in your own Supabase project's schema for the app to have data to display.

## Project Structure

```
app/                # App Router pages, layouts, and route handlers
components/
  admin/            # Admin dashboard forms and auth
  store/            # Store & coupon UI components
  layout/           # Header, search, navigation
  ui/               # Shared, reusable UI primitives
lib/                # Data-access layer (Supabase queries) and utilities
```

## Security

This repository is public by design, as part of the author's portfolio. No secrets, API keys, or credentials are or have ever been committed — all sensitive values are supplied via environment variables, and authentication relies entirely on Supabase's managed auth (no custom credential handling).

## Author

Built and maintained by [Sviatoslav Zvonyk](mailto:sviatoslav.frontend@gmail.com).
