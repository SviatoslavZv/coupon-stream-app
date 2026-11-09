// lib/constants/shop-links.ts

export const SHOP_LINK_KINDS = ["product", "section"] as const;

export type ShopLinkKind = (typeof SHOP_LINK_KINDS)[number];

export const SHOP_LINK_KIND_LABELS: Record<ShopLinkKind, string> = {
  product: "Product",
  section: "Store section",
};

export const SHOP_LINK_COUPON_FRESH_DAYS = 3;

export const SHOP_LINK_CHECK_STATUSES = [
  "ok",
  "out_of_stock",
  "no_commission",
  "not_found",
] as const;

export type ShopLinkCheckStatus = (typeof SHOP_LINK_CHECK_STATUSES)[number];

export const HIDDEN_CHECK_STATUSES: readonly ShopLinkCheckStatus[] = [
  "out_of_stock",
  "no_commission",
];
