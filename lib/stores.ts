// lib/stores.ts

import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/types";

interface StoreRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  coupons: { discount_label: string }[];
}

function mapStoreFromDb(row: StoreRow): Store {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    offerCount: row.coupons.length,
    bestOffer: row.coupons[0]?.discount_label ?? "No offers yet",
  };
}

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id, slug, name, logo_url, coupons(discount_label)");

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
}

interface StoreByIdDbRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string;
  affiliate_link: string | null;
  website_url: string | null;
}

export async function getStoreById(id: string): Promise<AdminStoreRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id, slug, name, logo_url, affiliate_link, website_url")
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
  };
}