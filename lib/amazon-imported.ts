// lib/amazon-imported.ts

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isCouponExpired } from "@/lib/utils";

export interface ImportedAsins {
  coupons: Set<string>;
  links: Set<string>;
}

interface CouponAsinRow {
  asin: string;
  expires_at: string;
}

interface LinkAsinRow {
  asin: string;
}

export async function getImportedAsins(
  asins: string[],
): Promise<ImportedAsins> {
  if (asins.length === 0) {
    return { coupons: new Set(), links: new Set() };
  }

  const supabase = await createClient();

  const [couponsResult, linksResult] = await Promise.all([
    supabase.from("coupons").select("asin, expires_at").in("asin", asins),
    supabase.from("shop_links").select("asin").in("asin", asins),
  ]);

  if (couponsResult.error) {
    throw new Error(
      `Failed to check imported coupons: ${couponsResult.error.message}`,
    );
  }
  if (linksResult.error) {
    throw new Error(
      `Failed to check imported links: ${linksResult.error.message}`,
    );
  }

  const coupons = new Set(
    (couponsResult.data as CouponAsinRow[])
      .filter((row) => !isCouponExpired(row.expires_at))
      .map((row) => row.asin),
  );
  const links = new Set(
    (linksResult.data as LinkAsinRow[]).map((row) => row.asin),
  );

  return { coupons, links };
}
