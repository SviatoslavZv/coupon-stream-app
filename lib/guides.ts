// lib/guides.ts

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { SHOP_LINK_COUPON_FRESH_DAYS } from "@/lib/constants/shop-links";
import { daysSince, isCouponExpired } from "@/lib/utils";
import type {
  Coupon,
  Guide,
  GuideItem,
  GuideLinkCoupon,
  GuideStore,
  GuideSummary,
} from "@/types";

interface StoreRef {
  name: string;
  slug: string;
}

interface ShopLinkRow {
  id: string;
  kind: "product" | "section";
  title: string;
  url: string;
  brand: string | null;
  asin: string | null;
  image_url: string | null;
  coupon_percent: number | null;
  last_checked_at: string | null;
  stores: StoreRef | null;
}

interface CouponRow {
  id: string;
  type: string;
  discount_label: string;
  title: string;
  code: string | null;
  description: string;
  expires_at: string;
  image_url: string | null;
  stores: StoreRef | null;
}

interface GuideItemRow {
  id: string;
  sort_order: number;
  comment: string;
  shop_links: ShopLinkRow | null;
  coupons: CouponRow | null;
}

interface GuideRow {
  id: string;
  slug: string;
  title: string;
  intro: string;
  meta_description: string | null;
  category: string | null;
  gender: string | null;
  event_slug: string | null;
  published_at: string | null;
  updated_at: string;
  guide_items: GuideItemRow[];
}

const GUIDE_SELECT = `
  id, slug, title, intro, meta_description, category, gender, event_slug,
  published_at, updated_at,
  guide_items (
    id, sort_order, comment,
    shop_links (
      id, kind, title, url, brand, asin, image_url, coupon_percent, last_checked_at,
      stores ( name, slug )
    ),
    coupons (
      id, type, discount_label, title, code, description, expires_at, image_url,
      stores ( name, slug )
    )
  )
`;

function mapStore(store: StoreRef): GuideStore {
  return { name: store.name, slug: store.slug };
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

function mapGuideItem(row: GuideItemRow): GuideItem | null {
  const base = { id: row.id, sortOrder: row.sort_order, comment: row.comment };

  const link = row.shop_links;
  if (link?.stores) {
    return {
      ...base,
      source: "shop_link",
      link: {
        id: link.id,
        kind: link.kind,
        title: link.title,
        url: link.url,
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
        type: coupon.type as Coupon["type"],
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
  const items = row.guide_items
    .map(mapGuideItem)
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

    return data ? mapGuide(data as unknown as GuideRow) : null;
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

interface AdminGuideDbRow {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  updated_at: string;
  guide_items: { count: number }[];
}

export async function getGuidesForAdmin(): Promise<AdminGuideRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guides")
    .select("id, slug, title, is_published, updated_at, guide_items(count)")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch guides: ${error.message}`);
  }

  return (data as unknown as AdminGuideDbRow[]).map((row) => ({
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

interface GuideFormDbRow {
  id: string;
  title: string;
  slug: string;
  intro: string;
  meta_description: string | null;
  category: string | null;
  gender: string | null;
  event_slug: string | null;
  is_published: boolean;
}

export async function getGuideForEdit(
  id: string,
): Promise<GuideFormValues | null> {
  const supabase = await createClient();

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

  const row = data as GuideFormDbRow;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    intro: row.intro,
    metaDescription: row.meta_description,
    category: row.category,
    gender: row.gender,
    eventSlug: row.event_slug,
    isPublished: row.is_published,
  };
}

export interface AdminGuideItem {
  id: string;
  sortOrder: number;
  comment: string;
  source: "shop_link" | "coupon";
  targetId: string | null;
  title: string;
  storeName: string;
  detail: string;
  isVisible: boolean;
}

interface AdminGuideItemDbRow {
  id: string;
  sort_order: number;
  comment: string;
  shop_links: {
    id: string;
    title: string;
    is_active: boolean;
    stores: { name: string } | null;
  } | null;
  coupons: {
    id: string;
    title: string;
    discount_label: string;
    expires_at: string;
    stores: { name: string } | null;
  } | null;
}

function mapAdminGuideItem(row: AdminGuideItemDbRow): AdminGuideItem {
  const base = { id: row.id, sortOrder: row.sort_order, comment: row.comment };

  if (row.shop_links) {
    return {
      ...base,
      source: "shop_link",
      targetId: row.shop_links.id,
      title: row.shop_links.title,
      storeName: row.shop_links.stores?.name ?? "Unknown store",
      detail: row.shop_links.is_active
        ? ""
        : "Hidden link — not shown on the site",
      isVisible: row.shop_links.is_active,
    };
  }

  const coupon = row.coupons;
  const isExpired = isCouponExpired(coupon?.expires_at);
  return {
    ...base,
    source: "coupon",
    targetId: coupon?.id ?? null,
    title: coupon
      ? `${coupon.discount_label} · ${coupon.title}`
      : "Missing coupon",
    storeName: coupon?.stores?.name ?? "Unknown store",
    detail: isExpired ? "Expired coupon — not shown on the site" : "",
    isVisible: Boolean(coupon) && !isExpired,
  };
}

export async function getGuideItemsForAdmin(
  guideId: string,
): Promise<AdminGuideItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guide_items")
    .select(
      "id, sort_order, comment, shop_links(id, title, is_active, stores(name)), coupons(id, title, discount_label, expires_at, stores(name))",
    )
    .eq("guide_id", guideId)
    .order("sort_order");

  if (error) {
    throw new Error(`Failed to fetch guide items: ${error.message}`);
  }

  return (data as unknown as AdminGuideItemDbRow[]).map(mapAdminGuideItem);
}

interface GuideSummaryRow {
  slug: string;
  title: string;
  intro: string;
  meta_description: string | null;
  updated_at: string;
}

export async function getPublishedGuides(): Promise<GuideSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guides")
    .select("slug, title, intro, meta_description, updated_at")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch guides: ${error.message}`);
  }

  return (data as GuideSummaryRow[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    intro: row.intro,
    metaDescription: row.meta_description,
    updatedAt: row.updated_at,
  }));
}
