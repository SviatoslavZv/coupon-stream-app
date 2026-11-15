// lib/guides.ts

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  isHiddenByCheck,
  SHOP_LINK_COUPON_FRESH_DAYS,
  type ShopLinkCheckStatus,
} from "@/lib/constants/shop-links";
import { daysSince, formatShortDate, isCouponExpired } from "@/lib/utils";
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
  check_status: ShopLinkCheckStatus | null;
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
      id, kind, title, url, brand, asin, image_url, coupon_percent, last_checked_at, check_status,
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
    if (isHiddenByCheck(link.check_status)) {
      return null;
    }
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

export type AdminDetailTone = "success" | "warning" | "danger";

export interface AdminItemDetail {
  text: string;
  tone: AdminDetailTone;
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
  isVisible: boolean;
}

interface AdminShopLinkDbRow {
  id: string;
  title: string;
  is_active: boolean;
  check_status: ShopLinkCheckStatus | null;
  last_checked_at: string | null;
  stores: { name: string } | null;
}

interface AdminGuideItemDbRow {
  id: string;
  sort_order: number;
  comment: string;
  shop_links: AdminShopLinkDbRow | null;
  coupons: {
    id: string;
    title: string;
    discount_label: string;
    expires_at: string;
    stores: { name: string } | null;
  } | null;
}

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

function mapAdminGuideItem(row: AdminGuideItemDbRow): AdminGuideItem {
  const base = { id: row.id, sortOrder: row.sort_order, comment: row.comment };

  const link = row.shop_links;
  if (link) {
    const storeName = link.stores?.name ?? "Unknown store";
    return {
      ...base,
      source: "shop_link",
      targetId: link.id,
      title: link.title,
      storeName,
      detail: shopLinkDetail(link, storeName),
      isVisible: link.is_active && !isHiddenByCheck(link.check_status),
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
    detail: isExpired
      ? { text: "Expired coupon — not shown on the site", tone: "danger" }
      : null,
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
      "id, sort_order, comment, shop_links(id, title, is_active, check_status, last_checked_at, stores(name)), coupons(id, title, discount_label, expires_at, stores(name))",
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
