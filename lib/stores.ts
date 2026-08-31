// lib/stores.ts

import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/types";

interface StoreRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  created_at?: string;
  updated_at?: string;
  coupons: { discount_label: string; updated_at?: string; created_at?: string }[];
}

function mapStoreFromDb(row: StoreRow): Store {
  const storeDate = row.updated_at ?? row.created_at;

  const latestCouponDate = row.coupons.reduce<string | undefined>((latest, coupon) => {
    const couponDate = coupon.updated_at ?? coupon.created_at;
    if (!couponDate) return latest;
    if (!latest || new Date(couponDate) > new Date(latest)) return couponDate;
    return latest;
  }, undefined);

  const lastModified =
    storeDate && latestCouponDate
      ? new Date(storeDate) > new Date(latestCouponDate)
        ? storeDate
        : latestCouponDate
      : storeDate ?? latestCouponDate;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    offerCount: row.coupons.length,
    bestOffer: row.coupons[0]?.discount_label ?? "No offers yet",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastModified,
  };
}

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, slug, name, logo_url, created_at, updated_at, coupons(discount_label, updated_at, created_at)"
    );

  if (error) {
    throw new Error(`Failed to fetch stores: ${error.message}`);
  }

  return (data as StoreRow[]).map(mapStoreFromDb);
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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(`Failed to fetch store options: ${error.message}`);
  }

  return data as StoreOption[];
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

interface StoreByIdDbRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  affiliate_link: string | null;
  website_url: string | null;
  banner_url: string | null;
  banner_link: string | null;
}

export async function getStoreById(id: string): Promise<AdminStoreRow | null> {
  const supabase = await createClient();

    const { data, error } = await supabase
    .from("stores")
    .select("id, slug, name, logo_url, affiliate_link, website_url, banner_url, banner_link")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch store: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as StoreByIdDbRow;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    affiliateLink: row.affiliate_link,
    websiteUrl: row.website_url,
    bannerUrl: row.banner_url,
    bannerLink: row.banner_link,
  };
}