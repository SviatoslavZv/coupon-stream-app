// lib/shop-links.ts

import { requireAdmin } from "@/lib/auth";
import {
  toShopLinkCheckStatus,
  toShopLinkKind,
  type ShopLinkCheckStatus,
  type ShopLinkKind,
} from "@/lib/constants/shop-links";

import type { Tables } from "@/types/supabase";

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
  checkStatus: ShopLinkCheckStatus | null;
  lastCheckedAt: string | null;
}

/** One row of ADMIN_SHOP_LINK_SELECT: the link columns plus the store name. */
type AdminShopLinkRow = Pick<
  Tables<"shop_links">,
  | "id"
  | "store_id"
  | "kind"
  | "title"
  | "url"
  | "brand"
  | "asin"
  | "image_url"
  | "network_link_id"
  | "commission_rate"
  | "is_active"
  | "check_status"
  | "last_checked_at"
> & {
  stores: Pick<Tables<"stores">, "name"> | null;
};

const ADMIN_SHOP_LINK_SELECT =
  "id, store_id, kind, title, url, brand, asin, image_url, network_link_id, commission_rate, is_active, check_status, last_checked_at, stores(name)";

function mapAdminShopLink(row: AdminShopLinkRow): AdminShopLink {
  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.stores?.name ?? "Unknown store",
    kind: toShopLinkKind(row.kind),
    title: row.title,
    url: row.url,
    brand: row.brand,
    asin: row.asin,
    imageUrl: row.image_url,
    networkLinkId: row.network_link_id,
    commissionRate:
      row.commission_rate === null ? null : Number(row.commission_rate),
    isActive: row.is_active,
    checkStatus: toShopLinkCheckStatus(row.check_status),
    lastCheckedAt: row.last_checked_at,
  };
}

export async function getShopLinksForAdmin(): Promise<AdminShopLink[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("shop_links")
    .select(ADMIN_SHOP_LINK_SELECT)
    .order("title");

  if (error) {
    throw new Error(`Failed to fetch shop links: ${error.message}`);
  }

  return data.map(mapAdminShopLink);
}

export async function getShopLinkById(
  id: string,
): Promise<AdminShopLink | null> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("shop_links")
    .select(ADMIN_SHOP_LINK_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch shop link: ${error.message}`);
  }

  return data ? mapAdminShopLink(data) : null;
}
