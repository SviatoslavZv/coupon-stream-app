// lib/amazon-import.ts

import type { AmazonProduct } from "@/lib/partnerboost";
import type { AmazonImportSort } from "@/lib/constants/amazon";
import type { AmazonImportFilters } from "@/lib/schemas/amazon-import";

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

  return `/admin/amazon-import?${params.toString()}`;
}
