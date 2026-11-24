// lib/guides.ts

import { cache } from "react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  isHiddenByCheck,
  SHOP_LINK_COUPON_FRESH_DAYS,
  toShopLinkCheckStatus,
  toShopLinkKind,
} from "@/lib/constants/shop-links";
import { toCouponType } from "@/lib/constants/coupons";
import { daysSince, formatShortDate, isCouponExpired } from "@/lib/utils";
import { amazonProductUrl } from "@/lib/constants/amazon";
import { RELATED_GUIDES_LIMIT } from "@/lib/constants/guides";
import {
  extractDestinationUrl,
  guideTrackingId,
  withTrackingId,
} from "@/lib/network-links";

import type { Tables } from "@/types/supabase";
import type {
  Guide,
  GuideItem,
  GuideLinkCoupon,
  GuideStore,
  GuideSummary,
} from "@/types";

// Row types of the public guide query, built from the generated tables so they follow the database

type StoreRef = Pick<Tables<"stores">, "name" | "slug" | "logo_url">;

type ShopLinkRow = Pick<
  Tables<"shop_links">,
  | "id"
  | "kind"
  | "title"
  | "url"
  | "brand"
  | "asin"
  | "image_url"
  | "coupon_percent"
  | "last_checked_at"
  | "check_status"
> & { stores: StoreRef | null };

type CouponRow = Pick<
  Tables<"coupons">,
  | "id"
  | "type"
  | "discount_label"
  | "title"
  | "code"
  | "description"
  | "expires_at"
  | "image_url"
> & { stores: StoreRef | null };

type GuideItemRow = Pick<
  Tables<"guide_items">,
  "id" | "sort_order" | "comment"
> & {
  shop_links: ShopLinkRow | null;
  coupons: CouponRow | null;
};

type GuideRow = Pick<
  Tables<"guides">,
  | "id"
  | "slug"
  | "title"
  | "intro"
  | "meta_description"
  | "category"
  | "gender"
  | "event_slug"
  | "published_at"
  | "updated_at"
> & { guide_items: GuideItemRow[] };

const GUIDE_SELECT = `
  id, slug, title, intro, meta_description, category, gender, event_slug,
  published_at, updated_at,
  guide_items (
    id, sort_order, comment,
    shop_links (
      id, kind, title, url, brand, asin, image_url, coupon_percent, last_checked_at, check_status,
       stores ( name, slug, logo_url )
    ),
    coupons (
      id, type, discount_label, title, code, description, expires_at, image_url,
       stores ( name, slug, logo_url )
    )
  )
` as const;

function mapStore(store: StoreRef): GuideStore {
  return { name: store.name, slug: store.slug, logoUrl: store.logo_url };
}

function mapLinkCoupon(link: ShopLinkRow): GuideLinkCoupon | null {
  if (link.coupon_percent === null || link.last_checked_at === null) {
    return null;
  }
  if (daysSince(link.last_checked_at) > SHOP_LINK_COUPON_FRESH_DAYS) {
    return null;
  }
  return { percent: link.coupon_percent, checkedAt: link.last_checked_at };
}

function mapGuideItem(row: GuideItemRow, trackingId: string): GuideItem | null {
  const base = { id: row.id, sortOrder: row.sort_order, comment: row.comment };

  const link = row.shop_links;
  if (link?.stores) {
    if (isHiddenByCheck(toShopLinkCheckStatus(link.check_status))) {
      return null;
    }
    return {
      ...base,
      source: "shop_link",
      link: {
        id: link.id,
        kind: toShopLinkKind(link.kind),
        title: link.title,
        url: withTrackingId(link.url, trackingId),
        brand: link.brand,
        asin: link.asin,
        imageUrl: link.image_url,
        coupon: mapLinkCoupon(link),
        store: mapStore(link.stores),
      },
    };
  }

  const coupon = row.coupons;
  if (coupon?.stores && !isCouponExpired(coupon.expires_at)) {
    return {
      ...base,
      source: "coupon",
      coupon: {
        id: coupon.id,
        type: toCouponType(coupon.type),
        discountLabel: coupon.discount_label,
        title: coupon.title,
        code: coupon.code,
        description: coupon.description,
        expiresAt: coupon.expires_at,
        imageUrl: coupon.image_url,
        store: mapStore(coupon.stores),
      },
    };
  }

  return null;
}

function mapGuide(row: GuideRow): Guide {
  const trackingId = guideTrackingId(row.slug);
  const items = row.guide_items
    .map((item) => mapGuideItem(item, trackingId))
    .filter((item): item is GuideItem => item !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    intro: row.intro,
    metaDescription: row.meta_description,
    category: row.category,
    gender: row.gender,
    eventSlug: row.event_slug,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    items,
  };
}

export const getPublishedGuide = cache(
  async (slug: string): Promise<Guide | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("guides")
      .select(GUIDE_SELECT)
      .eq("slug", slug.toLowerCase())
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch guide: ${error.message}`);
    }

    return data ? mapGuide(data) : null;
  },
);

export interface AdminGuideRow {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  itemCount: number;
  updatedAt: string;
}

export async function getGuidesForAdmin(): Promise<AdminGuideRow[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("guides")
    .select("id, slug, title, is_published, updated_at, guide_items(count)")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch guides: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    isPublished: row.is_published,
    itemCount: row.guide_items[0]?.count ?? 0,
    updatedAt: row.updated_at,
  }));
}

export interface GuideFormValues {
  id: string;
  title: string;
  slug: string;
  intro: string;
  metaDescription: string | null;
  category: string | null;
  gender: string | null;
  eventSlug: string | null;
  isPublished: boolean;
}

export async function getGuideForEdit(
  id: string,
): Promise<GuideFormValues | null> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("guides")
    .select(
      "id, title, slug, intro, meta_description, category, gender, event_slug, is_published",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch guide: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    intro: data.intro,
    metaDescription: data.meta_description,
    category: data.category,
    gender: data.gender,
    eventSlug: data.event_slug,
    isPublished: data.is_published,
  };
}

export type AdminDetailTone = "success" | "warning" | "danger";

export interface AdminItemDetail {
  text: string;
  tone: AdminDetailTone;
}

export interface AdminCheckLink {
  href: string;
  label: string;
}

export interface AdminGuideItem {
  id: string;
  sortOrder: number;
  comment: string;
  source: "shop_link" | "coupon";
  targetId: string | null;
  title: string;
  storeName: string;
  detail: AdminItemDetail | null;
  checkLinks: AdminCheckLink[];
  isVisible: boolean;
}

// Row types of the admin guide items query

type AdminStoreRef = Pick<Tables<"stores">, "name" | "slug" | "website_url">;

type AdminShopLinkDbRow = Pick<
  Tables<"shop_links">,
  | "id"
  | "title"
  | "url"
  | "asin"
  | "is_active"
  | "check_status"
  | "last_checked_at"
> & { stores: AdminStoreRef | null };

type AdminCouponDbRow = Pick<
  Tables<"coupons">,
  "id" | "title" | "discount_label" | "expires_at" | "affiliate_link" | "asin"
> & { stores: AdminStoreRef | null };

type AdminGuideItemDbRow = Pick<
  Tables<"guide_items">,
  "id" | "sort_order" | "comment"
> & {
  shop_links: AdminShopLinkDbRow | null;
  coupons: AdminCouponDbRow | null;
};

function shopLinkDetail(
  link: AdminShopLinkDbRow,
  storeName: string,
): AdminItemDetail | null {
  if (!link.is_active) {
    return { text: "Hidden link — not shown on the site", tone: "danger" };
  }

  const checked = link.last_checked_at
    ? formatShortDate(link.last_checked_at)
    : null;
  const checkedNote = checked ? ` (checked ${checked})` : "";

  switch (link.check_status) {
    case "out_of_stock":
      return {
        text: `Out of stock at ${storeName}${checkedNote} — hidden on the site`,
        tone: "danger",
      };
    case "no_commission":
      return {
        text: `No commission${checkedNote} — hidden on the site`,
        tone: "danger",
      };
    case "not_found":
      return {
        text: checked
          ? `Not returned by PartnerBoost — last confirmed ${checked}. Check the product page.`
          : "Not returned by PartnerBoost. Check the product page.",
        tone: "warning",
      };
    case "ok":
      return checked ? { text: `✓ Checked ${checked}`, tone: "success" } : null;
    default:
      return null;
  }
}

/** A direct link for checking the product: never an affiliate one. */
function directCheckLink(
  affiliateUrl: string | null,
  asin: string | null,
  store: AdminStoreRef | null,
): AdminCheckLink | null {
  const storeName = store?.name ?? "store";

  if (asin) {
    return { href: amazonProductUrl(asin), label: `Check at ${storeName} ↗` };
  }

  const destination = affiliateUrl ? extractDestinationUrl(affiliateUrl) : null;
  if (destination) {
    return { href: destination, label: `Check at ${storeName} ↗` };
  }

  if (store?.website_url) {
    return { href: store.website_url, label: `${storeName} website ↗` };
  }

  return null;
}

function mapAdminGuideItem(row: AdminGuideItemDbRow): AdminGuideItem {
  const base = { id: row.id, sortOrder: row.sort_order, comment: row.comment };

  const link = row.shop_links;
  if (link) {
    const storeName = link.stores?.name ?? "Unknown store";
    const direct = directCheckLink(link.url, link.asin, link.stores);
    return {
      ...base,
      source: "shop_link",
      targetId: link.id,
      title: link.title,
      storeName,
      detail: shopLinkDetail(link, storeName),
      checkLinks: direct ? [direct] : [],
      isVisible:
        link.is_active &&
        !isHiddenByCheck(toShopLinkCheckStatus(link.check_status)),
    };
  }

  const coupon = row.coupons;
  const isExpired = isCouponExpired(coupon?.expires_at);
  const checkLinks: AdminCheckLink[] = [];
  if (coupon?.stores) {
    checkLinks.push({
      href: `/store/${coupon.stores.slug}#coupon-${coupon.id}`,
      label: "View on store page ↗",
    });
  }
  const direct = coupon
    ? directCheckLink(coupon.affiliate_link, coupon.asin, coupon.stores)
    : null;
  if (direct) {
    checkLinks.push(direct);
  }

  return {
    ...base,
    source: "coupon",
    targetId: coupon?.id ?? null,
    title: coupon
      ? `${coupon.discount_label} · ${coupon.title}`
      : "Missing coupon",
    storeName: coupon?.stores?.name ?? "Unknown store",
    detail: isExpired
      ? { text: "Expired coupon — not shown on the site", tone: "danger" }
      : null,
    checkLinks,
    isVisible: Boolean(coupon) && !isExpired,
  };
}

const ADMIN_STORE_SELECT = "stores(name, slug, website_url)";

// "as const" keeps the exact text of the select, so Supabase can read the columns from it
const ADMIN_GUIDE_ITEMS_SELECT = `id, sort_order, comment,
       shop_links(id, title, url, asin, is_active, check_status, last_checked_at, ${ADMIN_STORE_SELECT}),
       coupons(id, title, discount_label, expires_at, affiliate_link, asin, ${ADMIN_STORE_SELECT})` as const;

export async function getGuideItemsForAdmin(
  guideId: string,
): Promise<AdminGuideItem[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("guide_items")
    .select(ADMIN_GUIDE_ITEMS_SELECT)
    .eq("guide_id", guideId)
    .order("sort_order");

  if (error) {
    throw new Error(`Failed to fetch guide items: ${error.message}`);
  }

  return data.map(mapAdminGuideItem);
}

export async function getPublishedGuides(): Promise<GuideSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guides")
    .select("slug, title, intro, meta_description, event_slug, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch guides: ${error.message}`);
  }

  return data.map((row) => ({
    slug: row.slug,
    title: row.title,
    intro: row.intro,
    metaDescription: row.meta_description,
    eventSlug: row.event_slug,
    updatedAt: row.updated_at,
  }));
}

/** Other guides: the same event first, then the rest, up to the limit. */
export function pickRelatedGuides(
  guides: GuideSummary[],
  current: Pick<Guide, "slug" | "eventSlug">,
  limit: number = RELATED_GUIDES_LIMIT,
): GuideSummary[] {
  const others = guides.filter((guide) => guide.slug !== current.slug);
  const sameEvent = others.filter(
    (guide) =>
      current.eventSlug !== null && guide.eventSlug === current.eventSlug,
  );
  const rest = others.filter((guide) => !sameEvent.includes(guide));

  return [...sameEvent, ...rest].slice(0, limit);
}
