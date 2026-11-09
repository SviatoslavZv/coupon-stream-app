// lib/amazon-recheck.ts

import "server-only";
import { AMAZON_STORE_SLUG } from "@/lib/constants/amazon";
import type { ShopLinkCheckStatus } from "@/lib/constants/shop-links";
import {
  MAX_PAGE_SIZE,
  searchAmazonProducts,
  type AmazonProduct,
} from "@/lib/partnerboost";
import { createAdminClient } from "@/lib/supabase/admin";

interface StoreIdRow {
  id: string;
}

interface LinkToCheck {
  id: string;
  asin: string;
}

interface CheckUpdate {
  check_status: ShopLinkCheckStatus;
  coupon_percent?: number | null;
  last_checked_at?: string;
}

export type RecheckReport = Record<ShopLinkCheckStatus | "failed", number> & {
  total: number;
};

function validCouponPercent(value: number | null): number | null {
  return value !== null && value > 0 && value < 100 ? value : null;
}

/** Чистая функция: по ответу PartnerBoost решает, что записать в ссылку. */
export function decideCheck(
  product: AmazonProduct | undefined,
  checkedAt: string,
): CheckUpdate {
  if (!product) {
    return { check_status: "not_found" };
  }
  if (!product.inStock) {
    return { check_status: "out_of_stock", last_checked_at: checkedAt };
  }
  if (product.commissionPercent === null) {
    return { check_status: "no_commission", last_checked_at: checkedAt };
  }
  return {
    check_status: "ok",
    coupon_percent: validCouponPercent(product.couponPercent),
    last_checked_at: checkedAt,
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function runAmazonRecheck(): Promise<RecheckReport> {
  const supabase = createAdminClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", AMAZON_STORE_SLUG)
    .maybeSingle();
  if (storeError) {
    throw new Error(`Failed to load Amazon store: ${storeError.message}`);
  }
  if (!store) {
    throw new Error(`Store "${AMAZON_STORE_SLUG}" not found`);
  }

  const { data, error } = await supabase
    .from("shop_links")
    .select("id, asin")
    .eq("store_id", (store as StoreIdRow).id)
    .eq("kind", "product")
    .eq("is_active", true)
    .not("asin", "is", null);
  if (error) {
    throw new Error(`Failed to load Amazon links: ${error.message}`);
  }

  const links = data as LinkToCheck[];
  const report: RecheckReport = {
    total: links.length,
    ok: 0,
    out_of_stock: 0,
    no_commission: 0,
    not_found: 0,
    failed: 0,
  };

  for (const batch of chunk(links, MAX_PAGE_SIZE)) {
    let products: Map<string, AmazonProduct>;
    try {
      const page = await searchAmazonProducts({
        asins: batch.map((link) => link.asin),
        limit: batch.length,
      });
      products = new Map(
        page.products.map((product) => [product.asin, product]),
      );
    } catch (err) {
      console.error("PartnerBoost recheck request failed:", err);
      report.failed += batch.length;
      continue;
    }

    const checkedAt = new Date().toISOString();
    for (const link of batch) {
      const update = decideCheck(products.get(link.asin), checkedAt);
      const { error: updateError } = await supabase
        .from("shop_links")
        .update(update)
        .eq("id", link.id);

      if (updateError) {
        console.error(`Failed to update link ${link.id}:`, updateError.message);
        report.failed++;
      } else {
        report[update.check_status]++;
      }
    }
  }

  return report;
}
