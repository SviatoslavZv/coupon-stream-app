// lib/constants/site.ts

export const SITE_NAME = "CouponCreek";

export const SITE_TITLE = `${SITE_NAME} — Promo Codes & Deals for Top Fashion Stores`;

export const SITE_DESCRIPTION =
  "Hand-picked promo codes, sales and shopping guides for top fashion, shoe and apparel stores.";

const PRODUCTION_URL = "https://www.couponcreek.com";

/** The site address without a trailing slash. Set NEXT_PUBLIC_SITE_URL to http://localhost:3000 for local work. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_URL
).replace(/\/+$/, "");
