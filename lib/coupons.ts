// lib/coupons.ts

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { BRANDS, CATEGORIES } from "@/lib/constants/taxonomy";
import type { Store, Coupon } from "@/types";

interface CouponRow {
  id: string;
  type: string;
  discount_label: string;
  title: string;
  code: string | null;
  description: string;
  expires_at: string;
  last_verified_at: string | null;
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
    lastVerifiedAt: row.last_verified_at,
  };
}



// Оборачиваем функцию в cache
export const getStoreWithCoupons = cache(async (slug: string): Promise<{
  store: Pick<Store, "slug" | "name" | "logoUrl">;
  coupons: Coupon[];
} | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "slug, name, logo_url, coupons(id, type, discount_label, title, code, description, expires_at, last_verified_at)"
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
  const couponIds = row.coupons.map((c) => c.id);
  const clickCounts = await getClickCounts(couponIds);

  return {
    store: { slug: row.slug, name: row.name, logoUrl: row.logo_url },
    coupons: row.coupons.map((c) => ({
      ...mapCoupon(c),
      usageCount: clickCounts.get(c.id) ?? 0,
    })),
  };
});

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
  brandSlug: string | null;
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

export const getCouponsByCategory = cache(
  async (
    category: string,
    filters: { subcategory?: string; gender?: string; brand?: string }
  ): Promise<CategoryCoupon[]> => {
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
      brandSlug: row.brand
        ? BRANDS.find((b) => b.label === row.brand)?.slug ?? null
        : null,
    }));
  }
);


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


export interface BrandCoupon {
  id: string;
  discountLabel: string;
  title: string;
  storeName: string;
  storeSlug: string;
  category: string | null;
}

interface BrandCouponDbRow {
  id: string;
  discount_label: string;
  title: string;
  category: string | null;
  stores: { name: string; slug: string } | null;
}

export const getCouponsByBrand = cache(
  async (
    brand: string,
    filters: { category?: string }
  ): Promise<BrandCoupon[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("coupons")
      .select("id, discount_label, title, category, stores(name, slug)")
      .eq("brand", brand);

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch brand coupons: ${error.message}`);
    }

    return (data as unknown as BrandCouponDbRow[]).map((row) => ({
      id: row.id,
      discountLabel: row.discount_label,
      title: row.title,
      storeName: row.stores?.name ?? "Unknown store",
      storeSlug: row.stores?.slug ?? "",
      category: row.category,
    }));
  }
);

export function extractCategoryOptions(
  coupons: { category: string | null }[]
): FilterOption[] {
  const categoryCounts = new Map<string, number>();

  for (const coupon of coupons) {
    if (coupon.category) {
      categoryCounts.set(
        coupon.category,
        (categoryCounts.get(coupon.category) ?? 0) + 1
      );
    }
  }

  return [...categoryCounts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}


export interface BrandSummary {
  slug: string;
  label: string;
  count: number;
  lastModified?: string;
}

export async function getBrandsWithCoupons(): Promise<BrandSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("brand, updated_at, created_at")
    .not("brand", "is", null);

  if (error) {
    throw new Error(`Failed to fetch brands: ${error.message}`);
  }

  const brandMeta = new Map<string, { count: number; lastModified?: string }>();

  for (const row of data as { brand: string; updated_at?: string; created_at?: string }[]) {
    const existing = brandMeta.get(row.brand);
    const rowDate = row.updated_at || row.created_at;

    let latestDate = existing?.lastModified;
    if (rowDate) {
      if (!latestDate || new Date(rowDate) > new Date(latestDate)) {
        latestDate = rowDate;
      }
    }

    brandMeta.set(row.brand, {
      count: (existing?.count ?? 0) + 1,
      lastModified: latestDate,
    });
  }

  return BRANDS.filter((b) => brandMeta.has(b.label)).map((b) => ({
    slug: b.slug,
    label: b.label,
    count: brandMeta.get(b.label)?.count ?? 0,
    lastModified: brandMeta.get(b.label)?.lastModified,
  }));
}


export async function getClickCounts(
  couponIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (couponIds.length === 0) {
    return counts;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clicks")
    .select("coupon_id")
    .in("coupon_id", couponIds);

  if (error) {
    throw new Error(`Failed to fetch click counts: ${error.message}`);
  }

  for (const row of data as { coupon_id: string }[]) {
    counts.set(row.coupon_id, (counts.get(row.coupon_id) ?? 0) + 1);
  }

  return counts;
}


export interface CategorySummary {
  slug: string;
  label: string;
  count: number;
  lastModified?: string;
}

export async function getCategoriesWithCoupons(): Promise<CategorySummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("category, updated_at, created_at")
    .not("category", "is", null);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categoryMeta = new Map<string, { count: number; lastModified?: string }>();

  for (const row of data as { category: string; updated_at?: string; created_at?: string }[]) {
    const existing = categoryMeta.get(row.category);
    const rowDate = row.updated_at || row.created_at;

    let latestDate = existing?.lastModified;
    if (rowDate) {
      if (!latestDate || new Date(rowDate) > new Date(latestDate)) {
        latestDate = rowDate;
      }
    }

    categoryMeta.set(row.category, {
      count: (existing?.count ?? 0) + 1,
      lastModified: latestDate,
    });
  }

  return CATEGORIES.filter((c) => categoryMeta.has(c.slug)).map((c) => ({
    slug: c.slug,
    label: c.label,
    count: categoryMeta.get(c.slug)?.count ?? 0,
    lastModified: categoryMeta.get(c.slug)?.lastModified,
  }));
}