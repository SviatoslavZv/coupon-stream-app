// lib/coupons.ts

import { createClient } from "@/lib/supabase/server";
import type { Store, Coupon } from "@/types";

interface CouponRow {
  id: string;
  type: string;
  discount_label: string;
  title: string;
  code: string | null;
  description: string;
  expires_at: string;
}

interface StoreWithCouponsRow {
  slug: string;
  name: string;
  logo_url: string;
  coupons: CouponRow[];
}

function mapCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    type: row.type as Coupon["type"],
    discountLabel: row.discount_label,
    title: row.title,
    code: row.code ?? undefined,
    description: row.description,
    expiresAt: row.expires_at,
  };
}

export async function getStoreWithCoupons(slug: string): Promise<{
  store: Pick<Store, "slug" | "name" | "logoUrl">;
  coupons: Coupon[];
} | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "slug, name, logo_url, coupons(id, type, discount_label, title, code, description, expires_at)"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch store: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as StoreWithCouponsRow;

  return {
    store: { slug: row.slug, name: row.name, logoUrl: row.logo_url },
    coupons: row.coupons.map(mapCoupon),
  };
}


export interface AdminCouponRow {
  id: string;
  type: Coupon["type"];
  discountLabel: string;
  title: string;
  code?: string;
  description: string;
  expiresAt: string;
  storeId: string;
  storeName: string;
}

interface AdminCouponDbRow {
  id: string;
  type: string;
  discount_label: string;
  title: string;
  code: string | null;
  description: string;
  expires_at: string;
  store_id: string;
  stores: { name: string } | null;
}

export async function getAllCouponsForAdmin(): Promise<AdminCouponRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, type, discount_label, title, code, description, expires_at, store_id, stores(name)"
    )
    .order("expires_at");

  if (error) {
    throw new Error(`Failed to fetch coupons: ${error.message}`);
  }

  return (data as unknown as AdminCouponDbRow[]).map((row) => ({
    id: row.id,
    type: row.type as Coupon["type"],
    discountLabel: row.discount_label,
    title: row.title,
    code: row.code ?? undefined,
    description: row.description,
    expiresAt: row.expires_at,
    storeId: row.store_id,
    storeName: row.stores?.name ?? "Unknown store",
  }));
}

export async function getCouponById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, store_id, type, discount_label, title, code, description, expires_at, category, subcategory, gender, brand"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch coupon: ${error.message}`);
  }

  return data;
}


export interface CategoryCoupon {
  id: string;
  discountLabel: string;
  title: string;
  storeName: string;
  storeSlug: string;
  subcategory: string | null;
  gender: string | null;
  brand: string | null;
}

interface CategoryCouponDbRow {
  id: string;
  discount_label: string;
  title: string;
  subcategory: string | null;
  gender: string | null;
  brand: string | null;
  stores: { name: string; slug: string } | null;
}

export async function getCouponsByCategory(
  category: string,
  filters: { subcategory?: string; gender?: string; brand?: string }
): Promise<CategoryCoupon[]> {
  const supabase = await createClient();

  let query = supabase
    .from("coupons")
    .select(
      "id, discount_label, title, subcategory, gender, brand, stores(name, slug)"
    )
    .eq("category", category);

  if (filters.subcategory) {
    query = query.eq("subcategory", filters.subcategory);
  }
  if (filters.gender) {
    query = query.eq("gender", filters.gender);
  }
  if (filters.brand) {
    query = query.eq("brand", filters.brand);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch category coupons: ${error.message}`);
  }

  return (data as unknown as CategoryCouponDbRow[]).map((row) => ({
    id: row.id,
    discountLabel: row.discount_label,
    title: row.title,
    storeName: row.stores?.name ?? "Unknown store",
    storeSlug: row.stores?.slug ?? "",
    subcategory: row.subcategory,
    gender: row.gender,
    brand: row.brand,
  }));
}


export interface FilterOption {
  value: string;
  count: number;
}

export function extractFilterOptions(coupons: CategoryCoupon[]) {
  const subcategoryCounts = new Map<string, number>();
  const genderCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();

  for (const coupon of coupons) {
    if (coupon.subcategory) {
      subcategoryCounts.set(
        coupon.subcategory,
        (subcategoryCounts.get(coupon.subcategory) ?? 0) + 1
      );
    }
    if (coupon.gender) {
      genderCounts.set(coupon.gender, (genderCounts.get(coupon.gender) ?? 0) + 1);
    }
    if (coupon.brand) {
      brandCounts.set(coupon.brand, (brandCounts.get(coupon.brand) ?? 0) + 1);
    }
  }

  const toSortedOptions = (counts: Map<string, number>): FilterOption[] =>
    [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

  return {
    subcategories: toSortedOptions(subcategoryCounts),
    genders: toSortedOptions(genderCounts),
    brands: toSortedOptions(brandCounts),
  };
}