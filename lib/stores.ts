// lib/stores.ts

import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/types";

interface StoreRow {
  slug: string;
  name: string;
  logo_url: string;
  coupons: { discount_label: string }[];
}

function mapStoreFromDb(row: StoreRow): Store {
  return {
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
    .select("slug, name, logo_url, coupons(discount_label)");

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