// lib/constants/shop-links.ts

export const SHOP_LINK_KINDS = ["product", "section"] as const;

export type ShopLinkKind = (typeof SHOP_LINK_KINDS)[number];

export const SHOP_LINK_KIND_LABELS: Record<ShopLinkKind, string> = {
  product: "Product",
  section: "Store section",
};
