// lib/coupons.ts

import { supabase } from "@/lib/supabase";
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