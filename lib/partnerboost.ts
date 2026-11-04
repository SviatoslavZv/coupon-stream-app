// lib/partnerboost.ts

import "server-only";
import { z } from "zod";

// ── Настройки ───────────────────────────────────────────

const ConfigSchema = z.object({
  PARTNERBOOST_API_URL: z.url(),
  PARTNERBOOST_PID: z.string().regex(/^\d+$/),
  PARTNERBOOST_CID: z.string().regex(/^\d+$/),
});

type PartnerBoostConfig = z.infer<typeof ConfigSchema>;

function getConfig(): PartnerBoostConfig {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      "PartnerBoost is not configured. Check PARTNERBOOST_* environment variables.",
    );
  }
  return result.data;
}

const REQUEST_SOURCE = "cj";
const COUNTRY_CODE = "US";
// API не отдаёт больше 50 товаров за один запрос
const MAX_PAGE_SIZE = 50;
const REQUEST_TIMEOUT_MS = 20_000;

// Флаги фильтров API: 1 — «да», 2 — «не важно»
const FLAG_YES = 1;
const FLAG_ANY = 2;

// ── Формат ответов API ──────────────────────────────────

const ResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown(),
});

const ProductsDataSchema = z.object({
  list: z.array(z.unknown()),
  has_more: z.boolean(),
  cursor: z.string().nullable(),
});

const RawProductSchema = z.object({
  product_id: z.string(),
  asin: z.string().regex(/^[A-Z0-9]{10}$/),
  parent_asin: z.string().nullish(),
  product_name: z.string(),
  image: z.string().nullish(),
  brand_id: z.number(),
  brand_name: z.string(),
  category: z.string().nullish(),
  subcategory: z.string().nullish(),
  coupon: z.string().nullish(),
  discount: z.string().nullish(),
  commission: z.string().nullish(),
  original_price: z.string().nullish(),
  discount_price: z.string().nullish(),
  rating: z.string().nullish(),
  reviews: z.number().nullish(),
  availability: z.string().nullish(),
  update_time: z.string().nullish(),
});

type RawProduct = z.infer<typeof RawProductSchema>;

const LinksDataSchema = z.array(
  z.object({
    asin: z.string(),
    link: z.string(),
  }),
);

// ── Типы для остального приложения ──────────────────────

export interface AmazonProduct {
  productId: string;
  asin: string;
  parentAsin: string;
  name: string;
  imageUrl: string | null;
  brandId: number;
  brandName: string;
  category: string | null;
  subcategory: string | null;
  couponPercent: number | null;
  discountPercent: number | null;
  commissionPercent: number | null;
  currentPrice: string | null;
  listPrice: string | null;
  rating: number | null;
  reviews: number;
  inStock: boolean;
  updatedOn: string | null;
}

export interface AmazonProductSearch {
  brandId?: number;
  category?: string;
  subcategory?: string;
  asins?: string[];
  onlyWithCoupon?: boolean;
  cursor?: string;
  limit?: number;
}

export interface AmazonProductPage {
  products: AmazonProduct[];
  nextCursor: string | null;
  skipped: number;
}

// ── Помощники ───────────────────────────────────────────

function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parsePercent(value: string | null | undefined): number | null {
  const match = value?.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const percent = Number(match[1]);
  return percent > 0 ? percent : null;
}

function parseRating(value: string | null | undefined): number | null {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating : null;
}

function toHttps(url: string | null | undefined): string | null {
  if (!url) return null;
  const secure = url.trim().replace(/^http:\/\//i, "https://");
  return secure.startsWith("https://") ? secure : null;
}

function mapProduct(raw: RawProduct): AmazonProduct {
  return {
    productId: raw.product_id,
    asin: raw.asin,
    parentAsin: textOrNull(raw.parent_asin) ?? raw.asin,
    name: raw.product_name.trim(),
    imageUrl: toHttps(raw.image),
    brandId: raw.brand_id,
    brandName: raw.brand_name.trim(),
    category: textOrNull(raw.category),
    subcategory: textOrNull(raw.subcategory),
    couponPercent: parsePercent(raw.coupon),
    discountPercent: parsePercent(raw.discount),
    commissionPercent: parsePercent(raw.commission),
    currentPrice: textOrNull(raw.discount_price),
    listPrice: textOrNull(raw.original_price),
    rating: parseRating(raw.rating),
    reviews: raw.reviews ?? 0,
    inStock: raw.availability === "IN_STOCK",
    updatedOn: textOrNull(raw.update_time),
  };
}

// ── Запрос к API ────────────────────────────────────────

async function callApi(
  path: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const config = getConfig();

  const response = await fetch(`${config.PARTNERBOOST_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Request-Source": REQUEST_SOURCE,
    },
    body: JSON.stringify({
      ...body,
      pid: config.PARTNERBOOST_PID,
      cid: config.PARTNERBOOST_CID,
      country_code: COUNTRY_CODE,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`PartnerBoost HTTP ${response.status} on ${path}`);
  }

  const parsed = ResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error(`PartnerBoost returned an unexpected response on ${path}`);
  }

  if (parsed.data.code !== 0) {
    throw new Error(`PartnerBoost error on ${path}: ${parsed.data.message}`);
  }

  return parsed.data.data;
}

// ── Публичные функции ───────────────────────────────────

export async function searchAmazonProducts(
  search: AmazonProductSearch,
): Promise<AmazonProductPage> {
  const data = await callApi("/get_products", {
    cursor: search.cursor ?? "",
    limit: Math.min(search.limit ?? MAX_PAGE_SIZE, MAX_PAGE_SIZE),
    brand_id: search.brandId ?? 0,
    asins: search.asins?.join(",") ?? "",
    category: search.category ?? "",
    subcategory: search.subcategory ?? "",
    is_featured_product: FLAG_ANY,
    is_amazon_choice: FLAG_ANY,
    have_coupon: search.onlyWithCoupon ? FLAG_YES : FLAG_ANY,
    discount_min: 0,
  });

  const page = ProductsDataSchema.safeParse(data);
  if (!page.success) {
    throw new Error("PartnerBoost returned an unexpected product list");
  }

  const products: AmazonProduct[] = [];
  let skipped = 0;

  for (const item of page.data.list) {
    const raw = RawProductSchema.safeParse(item);
    if (raw.success) {
      products.push(mapProduct(raw.data));
    } else {
      skipped++;
    }
  }

  return {
    products,
    nextCursor: page.data.has_more ? page.data.cursor : null,
    skipped,
  };
}

export async function generateAmazonLinks(
  asins: string[],
  sid: string,
): Promise<Map<string, string>> {
  if (asins.length === 0) return new Map();

  const data = await callApi("/generate_product_link", {
    asins: asins.join(","),
    sid,
  });

  const links = LinksDataSchema.safeParse(data);
  if (!links.success) {
    throw new Error("PartnerBoost returned unexpected product links");
  }

  const result = new Map<string, string>();
  for (const { asin, link } of links.data) {
    const secure = toHttps(link);
    if (secure) result.set(asin, secure);
  }
  return result;
}
