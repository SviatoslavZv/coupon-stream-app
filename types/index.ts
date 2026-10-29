export interface Store {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  offerCount: number;
  bestOffer: string;
  createdAt?: string; // Добавляем опциональную дату создания
  updatedAt?: string; // Добавляем опциональную дату обновления
  lastModified?: string;
  bannerUrl?: string | null;
  bannerLink?: string | null;
}

export interface Coupon {
  id: string;
  type: "code" | "sale";
  discountLabel: string;
  title: string;
  code?: string;
  description: string;
  expiresAt: string;
  lastVerifiedAt?: string | null;
  usageCount?: number;
  affiliateLink?: string | null;
}

export interface GuideStore {
  name: string;
  slug: string;
}

export interface GuideShopLink {
  id: string;
  kind: "product" | "section";
  title: string;
  url: string;
  brand: string | null;
  asin: string | null;
  imageUrl: string | null;
  store: GuideStore;
}

export interface GuideCoupon {
  id: string;
  type: Coupon["type"];
  discountLabel: string;
  title: string;
  code: string | null;
  description: string;
  expiresAt: string;
  store: GuideStore;
}

interface GuideItemBase {
  id: string;
  sortOrder: number;
  comment: string;
}

export type GuideItem =
  | (GuideItemBase & { source: "shop_link"; link: GuideShopLink })
  | (GuideItemBase & { source: "coupon"; coupon: GuideCoupon });

export interface Guide {
  id: string;
  slug: string;
  title: string;
  intro: string;
  metaDescription: string | null;
  category: string | null;
  gender: string | null;
  eventSlug: string | null;
  publishedAt: string | null;
  updatedAt: string;
  items: GuideItem[];
}
