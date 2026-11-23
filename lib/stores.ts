// lib/stores.ts

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildDeepLink } from "@/lib/network-links";
import { isCouponExpired } from "@/lib/utils";
import type { Store } from "@/types";
import type { Tables } from "@/types/supabase";

/** One row of the getStores query: the store columns it selects plus its coupons. */
type StoreRow = Pick<
  Tables<"stores">,
  "id" | "slug" | "name" | "logo_url" | "created_at" | "updated_at"
> & {
  coupons: Pick<
    Tables<"coupons">,
    "discount_label" | "expires_at" | "updated_at" | "created_at"
  >[];
};

function mapStoreFromDb(row: StoreRow): Store {
  const storeDate = row.updated_at ?? row.created_at;

  const latestCouponDate = row.coupons.reduce<string | undefined>(
    (latest, coupon) => {
      const couponDate = coupon.updated_at ?? coupon.created_at;
      if (!couponDate) return latest;
      if (!latest || new Date(couponDate) > new Date(latest)) return couponDate;
      return latest;
    },
    undefined,
  );

  const lastModified =
    storeDate && latestCouponDate
      ? new Date(storeDate) > new Date(latestCouponDate)
        ? storeDate
        : latestCouponDate
      : (storeDate ?? latestCouponDate);

  const activeCoupons = row.coupons.filter(
    (c) => !isCouponExpired(c.expires_at),
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    offerCount: activeCoupons.length,
    bestOffer: activeCoupons[0]?.discount_label ?? "No offers yet",
    lastModified,
  };
}

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, slug, name, logo_url, created_at, updated_at, coupons(discount_label, expires_at, updated_at, created_at)",
    );
  if (error) {
    throw new Error(`Failed to fetch stores: ${error.message}`);
  }

  return data.map(mapStoreFromDb);
}

export async function getTopStores(limit: number): Promise<Store[]> {
  const stores = await getStores();

  return [...stores]
    .sort((a, b) => b.offerCount - a.offerCount)
    .slice(0, limit);
}

export interface StoreOption {
  id: string;
  name: string;
}

export async function getStoreOptions(): Promise<StoreOption[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch store options: ${error.message}`);
  }

  return data;
}

export interface AdminStoreRow {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  affiliateLink: string | null;
  websiteUrl: string | null;
  bannerUrl: string | null;
  bannerLink: string | null;
}

export async function getStoreById(id: string): Promise<AdminStoreRow | null> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, slug, name, logo_url, affiliate_link, website_url, banner_url, banner_link",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch store: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    logoUrl: data.logo_url,
    affiliateLink: data.affiliate_link,
    websiteUrl: data.website_url,
    bannerUrl: data.banner_url,
    bannerLink: data.banner_link,
  };
}

export async function getStoreIdBySlug(slug: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch store: ${error.message}`);
  }

  return data?.id ?? null;
}

export interface DeepLinkStore extends StoreOption {
  websiteUrl: string;
}

/** Stores whose affiliate link can be turned into a product deep link, with their sites. */
export async function getDeepLinkStores(): Promise<DeepLinkStore[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name, affiliate_link, website_url")
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch store options: ${error.message}`);
  }

  // The homepage is a page of the store too: if it works, any product page will
  return data.flatMap(({ id, name, affiliate_link, website_url }) =>
    website_url !== null &&
    buildDeepLink(affiliate_link, website_url, website_url).ok
      ? [{ id, name, websiteUrl: website_url }]
      : [],
  );
}

/** The same stores for a dropdown: id and name only. */
export async function getDeepLinkStoreOptions(): Promise<StoreOption[]> {
  return (await getDeepLinkStores()).map(({ id, name }) => ({ id, name }));
}
