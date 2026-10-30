// lib/shop-links.ts

import { createClient } from "@/lib/supabase/server";
import type { ShopLinkKind } from "@/lib/constants/shop-links";

export interface AdminShopLink {
  id: string;
  storeId: string;
  storeName: string;
  kind: ShopLinkKind;
  title: string;
  url: string;
  brand: string | null;
  asin: string | null;
  imageUrl: string | null;
  networkLinkId: string | null;
  commissionRate: number | null;
  isActive: boolean;
}

interface AdminShopLinkRow {
  id: string;
  store_id: string;
  kind: ShopLinkKind;
  title: string;
  url: string;
  brand: string | null;
  asin: string | null;
  image_url: string | null;
  network_link_id: string | null;
  commission_rate: number | null;
  is_active: boolean;
  stores: { name: string } | null;
}

const ADMIN_SHOP_LINK_SELECT =
  "id, store_id, kind, title, url, brand, asin, image_url, network_link_id, commission_rate, is_active, stores(name)";

function mapAdminShopLink(row: AdminShopLinkRow): AdminShopLink {
  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.stores?.name ?? "Unknown store",
    kind: row.kind,
    title: row.title,
    url: row.url,
    brand: row.brand,
    asin: row.asin,
    imageUrl: row.image_url,
    networkLinkId: row.network_link_id,
    commissionRate:
      row.commission_rate === null ? null : Number(row.commission_rate),
    isActive: row.is_active,
  };
}

export async function getShopLinksForAdmin(): Promise<AdminShopLink[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shop_links")
    .select(ADMIN_SHOP_LINK_SELECT)
    .order("title");

  if (error) {
    throw new Error(`Failed to fetch shop links: ${error.message}`);
  }

  return (data as unknown as AdminShopLinkRow[]).map(mapAdminShopLink);
}

export async function getShopLinkById(
  id: string,
): Promise<AdminShopLink | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shop_links")
    .select(ADMIN_SHOP_LINK_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch shop link: ${error.message}`);
  }

  return data ? mapAdminShopLink(data as unknown as AdminShopLinkRow) : null;
}
