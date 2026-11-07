// lib/amazon-import.ts

import type { AmazonProduct } from "@/lib/partnerboost";
import type { AmazonImportFilters } from "@/lib/schemas/amazon-import";
import type { TaxonomySuggestion } from "@/lib/amazon-taxonomy";
import { escapeRegExp, isoDateInDays } from "@/lib/utils";
import {
  AmazonImportSort,
  AMAZON_COUPON_TTL_DAYS,
  AMAZON_TITLE_MAX_WORDS,
  AMAZON_IMPORT_PATH,
} from "@/lib/constants/amazon";

export interface AmazonModel {
  product: AmazonProduct;
  variantAsins: string[];
}

// Лучший вариант модели: больше купон → в наличии → больше отзывов
function isBetterVariant(
  candidate: AmazonProduct,
  current: AmazonProduct,
): boolean {
  const candidateCoupon = candidate.couponPercent ?? 0;
  const currentCoupon = current.couponPercent ?? 0;
  if (candidateCoupon !== currentCoupon) return candidateCoupon > currentCoupon;
  if (candidate.inStock !== current.inStock) return candidate.inStock;
  return candidate.reviews > current.reviews;
}

export function groupByModel(products: AmazonProduct[]): AmazonModel[] {
  const models = new Map<string, AmazonModel>();

  for (const product of products) {
    const existing = models.get(product.parentAsin);
    if (!existing) {
      models.set(product.parentAsin, { product, variantAsins: [product.asin] });
      continue;
    }
    existing.variantAsins.push(product.asin);
    if (isBetterVariant(product, existing.product)) {
      existing.product = product;
    }
  }

  return [...models.values()];
}

export function filterByMinReviews(
  models: AmazonModel[],
  minReviews: number | undefined,
): AmazonModel[] {
  if (minReviews === undefined) return models;
  return models.filter((model) => model.product.reviews >= minReviews);
}

const SORT_VALUE: Record<AmazonImportSort, (product: AmazonProduct) => number> =
  {
    reviews: (product) => product.reviews,
    coupon: (product) => product.couponPercent ?? 0,
    commission: (product) => product.commissionPercent ?? 0,
  };

export function sortModels(
  models: AmazonModel[],
  sort: AmazonImportSort,
): AmazonModel[] {
  const value = SORT_VALUE[sort];
  return [...models].sort(
    (a, b) =>
      value(b.product) - value(a.product) ||
      b.product.reviews - a.product.reviews,
  );
}

export function buildImportHref(
  filters: AmazonImportFilters,
  overrides: Partial<AmazonImportFilters> = {},
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  params.set("category", merged.category);
  if (merged.sub) params.set("sub", merged.sub);
  if (merged.brand !== undefined) params.set("brand", String(merged.brand));
  if (merged.coupon) params.set("coupon", "1");
  if (merged.minReviews !== undefined)
    params.set("minReviews", String(merged.minReviews));
  params.set("sort", merged.sort);
  if (merged.cursor) params.set("cursor", merged.cursor);

  return `${AMAZON_IMPORT_PATH}?${params.toString()}`;
}

// Слова о поле убираем из заголовка: пол уже указан в фильтрах купона
const GENDER_WORDS =
  /(?:\bfor\s+)?\b(?:women['’]?s?|men['’]?s?|ladies|unisex|girls['’]?|boys['’]?|kids['’]?|toddlers?)(?=\s|$)/gi;

export function shortProductName(
  name: string,
  brandNames: readonly string[],
): string {
  // Всё после первой запятой, скобки или черты — обычно размер, цвет или перечень свойств
  let text = name.split(/[,|(]/)[0] ?? name;

  for (const brand of brandNames) {
    text = text.replace(new RegExp(`^\\s*${escapeRegExp(brand)}\\s+`, "i"), "");
  }

  const words = text
    .replace(GENDER_WORDS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  const short = words.slice(0, AMAZON_TITLE_MAX_WORDS).join(" ");
  return short || name.trim();
}

export function buildProductTitle(
  product: AmazonProduct,
  suggestion: TaxonomySuggestion,
): string {
  const brandNames = [suggestion.brand, product.brandName].filter(
    (brand): brand is string => Boolean(brand),
  );
  const name = shortProductName(product.name, brandNames);
  return [suggestion.brand, name].filter(Boolean).join(" ");
}

export interface AmazonCouponDraft {
  storeId: string;
  type: "sale";
  discountLabel: string;
  title: string;
  description: string;
  expiresAt: string;
  category: string | null;
  subcategory: string | null;
  gender: string | null;
  brand: string | null;
  affiliateLink: string;
}

export function buildAmazonCouponDraft({
  product,
  suggestion,
  storeId,
  affiliateLink,
}: {
  product: AmazonProduct;
  suggestion: TaxonomySuggestion;
  storeId: string;
  affiliateLink: string;
}): AmazonCouponDraft | null {
  const percent = product.couponPercent;
  if (percent === null) return null;

  const title = buildProductTitle(product, suggestion);

  return {
    storeId,
    type: "sale",
    discountLabel: `${percent}% OFF`,
    title: `${title}: Extra ${percent}% Off with Amazon Coupon`,
    description: `Clip the ${percent}% coupon on the Amazon product page before adding to cart, and the discount is applied at checkout. Colors and sizes vary.`,
    expiresAt: isoDateInDays(AMAZON_COUPON_TTL_DAYS),
    category: suggestion.category,
    subcategory: suggestion.subcategory,
    gender: suggestion.gender,
    brand: suggestion.brand,
    affiliateLink,
  };
}

export function safeImportReturnTo(value: unknown): string {
  return typeof value === "string" && value.startsWith(AMAZON_IMPORT_PATH)
    ? value
    : AMAZON_IMPORT_PATH;
}
