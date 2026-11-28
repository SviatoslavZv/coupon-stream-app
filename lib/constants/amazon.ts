// lib/constants/amazon.ts

// Категории Amazon, в которых мы ищем товары (совпадают с разделами нашего сайта)
export const AMAZON_CATEGORIES = [
  "Clothing, Shoes & Jewelry",
  "Beauty & Personal Care",
  "Home & Kitchen",
] as const;

export type AmazonCategory = (typeof AMAZON_CATEGORIES)[number];

// Short words for the Subcategory field: PartnerBoost matches part of the name,
// so "Boots" also finds "Ankle Boots" and "Snow Boots"
export const AMAZON_SUBCATEGORY_HINTS: Record<
  AmazonCategory,
  readonly string[]
> = {
  "Clothing, Shoes & Jewelry": [
    "Shoes",
    "Boots",
    "Sneakers",
    "Sandals",
    "Slippers",
    "Watches",
    "Jewelry",
    "Handbags",
    "Wallets",
    "Sunglasses",
    "Dresses",
    "Jackets",
    "Sweaters",
    "Jeans",
    "Socks",
  ],
  "Beauty & Personal Care": [
    "Makeup",
    "Skin Care",
    "Hair Care",
    "Fragrance",
    "Nail",
  ],
  "Home & Kitchen": ["Storage", "Bedding", "Bath"],
};

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
// Default quality bar for search results; 0 in the form turns a filter off
export const AMAZON_DEFAULT_MIN_REVIEWS = 100;
export const AMAZON_DEFAULT_MIN_RATING = 4.3;

export const ASIN_PATTERN = /^[A-Z0-9]{10}$/;

// PartnerBoost API accepts at most 50 ASINs in one request
export const MAX_ASINS_PER_SEARCH = 50;

// PartnerBoost portal: keyword search lives there, the API has none
export const PARTNERBOOST_PORTAL_URL =
  "https://cj.partnerboost.com/partner/offers";

// CJ advertiser ID of "PartnerBoost - Amazon Marketplace"
export const PARTNERBOOST_CJ_AID = "15841657";

// SID для ссылок, добавленных в каталог без гайда
export const AMAZON_PICKS_SID = "amazon-picks";
