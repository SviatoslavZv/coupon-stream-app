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

// Магазин, к которому привязываются все купоны и товары Amazon
export const AMAZON_STORE_SLUG = "amazon";

// Купоны Amazon пропадают без предупреждения — короткий срок и перепроверка
export const AMAZON_COUPON_TTL_DAYS = 14;

// Метка в отчётах CJ: откуда пришла продажа
export const AMAZON_STORE_SID = "store-amazon";

// Сколько слов названия товара оставлять в заголовке купона
export const AMAZON_TITLE_MAX_WORDS = 6;

export const AMAZON_IMPORT_PATH = "/admin/amazon-import";

export const ASIN_PATTERN = /^[A-Z0-9]{10}$/;

// SID для ссылок, добавленных в каталог без гайда
export const AMAZON_PICKS_SID = "amazon-picks";

// Ограничение длины SID: метка должна оставаться короткой
export const AMAZON_SID_MAX_LENGTH = 50;
