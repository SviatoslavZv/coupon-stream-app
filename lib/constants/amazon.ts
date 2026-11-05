// lib/constants/amazon.ts

// Категории Amazon, в которых мы ищем товары (совпадают с разделами нашего сайта)
export const AMAZON_CATEGORIES = [
  "Clothing, Shoes & Jewelry",
  "Beauty & Personal Care",
  "Home & Kitchen",
] as const;

export type AmazonCategory = (typeof AMAZON_CATEGORIES)[number];

export const AMAZON_IMPORT_SORTS = ["reviews", "coupon", "commission"] as const;

export type AmazonImportSort = (typeof AMAZON_IMPORT_SORTS)[number];

export const AMAZON_IMPORT_SORT_LABELS: Record<AmazonImportSort, string> = {
  reviews: "Most reviews",
  coupon: "Biggest coupon",
  commission: "Highest commission",
};

export function amazonProductUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}`;
}
