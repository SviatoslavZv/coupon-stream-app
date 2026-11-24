// lib/coupons.ts

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { CATEGORIES } from "@/lib/constants/taxonomy";
import { getBrands } from "@/lib/brands";
import { toCouponType } from "@/lib/constants/coupons";
import { isCouponExpired } from "@/lib/utils";
import type { Store, Coupon } from "@/types";
import type { Tables } from "@/types/supabase";

/** The coupon columns the store page selects. */
type CouponRow = Pick<
  Tables<"coupons">,
  | "id"
  | "type"
  | "discount_label"
  | "title"
  | "code"
  | "description"
  | "expires_at"
  | "last_verified_at"
  | "affiliate_link"
  | "image_url"
>;

function mapCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    type: toCouponType(row.type),
    discountLabel: row.discount_label,
    title: row.title,
    code: row.code ?? undefined,
    description: row.description,
    expiresAt: row.expires_at,
    lastVerifiedAt: row.last_verified_at,
    affiliateLink: row.affiliate_link,
    imageUrl: row.image_url,
  };
}

// cache(): generateMetadata and the page ask for the same store, the database is asked once
export const getStoreWithCoupons = cache(
  async (
    slug: string,
  ): Promise<{
    store: Pick<
      Store,
      "slug" | "name" | "logoUrl" | "bannerUrl" | "bannerLink"
    >;
    coupons: Coupon[];
  } | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("stores")
      .select(
        "slug, name, logo_url, banner_url, banner_link, coupons(id, type, discount_label, title, code, description, expires_at, last_verified_at, affiliate_link, image_url)",
      )
      .eq("slug", slug.toLowerCase())
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch store: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      store: {
        slug: data.slug,
        name: data.name,
        logoUrl: data.logo_url,
        bannerUrl: data.banner_url,
        bannerLink: data.banner_link,
      },
      coupons: data.coupons.map(mapCoupon),
    };
  },
);

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

export async function getAllCouponsForAdmin(): Promise<AdminCouponRow[]> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, type, discount_label, title, code, description, expires_at, store_id, stores(name)",
    )
    .order("expires_at");

  if (error) {
    throw new Error(`Failed to fetch coupons: ${error.message}`);
  }

  return data.map((row) => ({
    id: row.id,
    type: toCouponType(row.type),
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
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, store_id, type, discount_label, title, code, description, expires_at, category, subcategory, gender, brand, affiliate_link",
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

export const getCouponsByCategory = cache(
  async (
    category: string,
    filters: { subcategory?: string; gender?: string; brand?: string },
  ): Promise<CategoryCoupon[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("coupons")
      .select(
        "id, discount_label, title, subcategory, gender, brand, expires_at, stores(name, slug), brands(slug)",
      )
      .eq("category", category.toLowerCase());

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

    return data
      .filter((row) => !isCouponExpired(row.expires_at))
      .map((row) => ({
        id: row.id,
        discountLabel: row.discount_label,
        title: row.title,
        storeName: row.stores?.name ?? "Unknown store",
        storeSlug: row.stores?.slug ?? "",
        subcategory: row.subcategory,
        gender: row.gender,
        brand: row.brand,
        // coupons.brand points at brands.label, so the brand page address comes with the coupon
        brandSlug: row.brands?.slug ?? null,
      }));
  },
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
        (subcategoryCounts.get(coupon.subcategory) ?? 0) + 1,
      );
    }
    if (coupon.gender) {
      genderCounts.set(
        coupon.gender,
        (genderCounts.get(coupon.gender) ?? 0) + 1,
      );
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

export const getCouponsByBrand = cache(
  async (
    brand: string,
    filters: { category?: string },
  ): Promise<BrandCoupon[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("coupons")
      .select(
        "id, discount_label, title, category, expires_at, stores(name, slug)",
      )
      .eq("brand", brand);

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch brand coupons: ${error.message}`);
    }

    return data
      .filter((row) => !isCouponExpired(row.expires_at))
      .map((row) => ({
        id: row.id,
        discountLabel: row.discount_label,
        title: row.title,
        storeName: row.stores?.name ?? "Unknown store",
        storeSlug: row.stores?.slug ?? "",
        category: row.category,
      }));
  },
);
export function extractCategoryOptions(
  coupons: { category: string | null }[],
): FilterOption[] {
  const categoryCounts = new Map<string, number>();

  for (const coupon of coupons) {
    if (coupon.category) {
      categoryCounts.set(
        coupon.category,
        (categoryCounts.get(coupon.category) ?? 0) + 1,
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

  const [{ data, error }, brands] = await Promise.all([
    supabase
      .from("coupons")
      .select("brand, expires_at, updated_at, created_at")
      .not("brand", "is", null),
    getBrands(),
  ]);

  if (error) {
    throw new Error(`Failed to fetch brands: ${error.message}`);
  }

  const brandMeta = new Map<string, { count: number; lastModified?: string }>();

  for (const row of data) {
    // The query skips rows without a brand, but the type cannot know that: the check narrows it to string
    if (!row.brand || isCouponExpired(row.expires_at)) continue;

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

  return brands
    .filter((b) => brandMeta.has(b.label))
    .map((b) => ({
      slug: b.slug,
      label: b.label,
      count: brandMeta.get(b.label)?.count ?? 0,
      lastModified: brandMeta.get(b.label)?.lastModified,
    }));
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
    .select("category, expires_at, updated_at, created_at")
    .not("category", "is", null);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categoryMeta = new Map<
    string,
    { count: number; lastModified?: string }
  >();

  for (const row of data) {
    // Same as for brands: the check tells TypeScript that category is a string here
    if (!row.category || isCouponExpired(row.expires_at)) continue;

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
