export interface Store {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  offerCount: number;
  bestOffer: string;
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
  affiliateLink?: string | null;
  /** Product picture, set for Amazon coupons; most store-wide offers have none. */
  imageUrl: string | null;
}

export interface GuideStore {
  name: string;
  slug: string;
  /** Shown in guide cards that have no product photo */
  logoUrl: string | null;
}

export interface GuideLinkCoupon {
  percent: number;
  checkedAt: string;
}

export interface GuideShopLink {
  id: string;
  kind: "product" | "section";
  title: string;
  url: string;
  brand: string | null;
  asin: string | null;
  imageUrl: string | null;
  coupon: GuideLinkCoupon | null;
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
  imageUrl: string | null;
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

export type GuideSummary = Pick<
  Guide,
  "slug" | "title" | "intro" | "metaDescription" | "eventSlug" | "updatedAt"
>;

/** What a server action sends back to its form: an error to show, or a success flag. */
export interface FormState {
  error?: string;
  success?: boolean;
}
