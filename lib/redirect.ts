// lib/redirect.ts

import { createClient } from "@/lib/supabase/server";

interface StoreRedirectRow {
  id: string;
  affiliate_link: string | null;
  website_url: string | null;
}

export async function getStoreRedirectUrl(
  slug: string,
  couponId?: string
): Promise<{ storeId: string; url: string } | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("id, affiliate_link, website_url")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch redirect info: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const row = data as StoreRedirectRow;

  // Приоритет — собственная ссылка конкретного купона, если она указана
  if (couponId) {
    const { data: couponData, error: couponError } = await supabase
      .from("coupons")
      .select("affiliate_link")
      .eq("id", couponId)
      .maybeSingle();

    if (couponError) {
      console.error(`Failed to fetch coupon affiliate link: ${couponError.message}`);
    } else if (couponData?.affiliate_link) {
      return { storeId: row.id, url: couponData.affiliate_link };
    }
  }

  const url = row.affiliate_link ?? row.website_url;

  if (!url) {
    return null;
  }

  return { storeId: row.id, url };
}

export async function recordClick(storeId: string, couponId?: string): Promise<void> {
  if (!couponId) return;

  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_coupon_click", {
    coupon_id_input: couponId,
  });

  if (error) {
    console.error(`Failed to record click: ${error.message}`);
  }
}