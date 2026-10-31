// lib/constants/guides.ts

export const INTRO_RECOMMENDED_WORDS = { min: 100, max: 200 } as const;

export const META_DESCRIPTION_MAX = 160;

export const GUIDE_ITEM_SOURCES = ["shop_link", "coupon"] as const;

export type GuideItemSource = (typeof GUIDE_ITEM_SOURCES)[number];

export const GUIDE_ITEM_SOURCE_LABELS: Record<GuideItemSource, string> = {
  shop_link: "Shop link",
  coupon: "Coupon",
};

export const GUIDE_ITEM_MOVE_DIRECTIONS = ["up", "down"] as const;

export const SORT_ORDER_STEP = 10;
