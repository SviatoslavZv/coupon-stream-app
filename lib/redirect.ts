// lib/redirect.ts

import { createClient } from "@/lib/supabase/server";

export async function getStoreRedirectUrl(
  slug: string,
  couponId?: string,
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

  // A coupon's own link wins over the store link
  if (couponId) {
    const { data: couponData, error: couponError } = await supabase
      .from("coupons")
      .select("affiliate_link")
      .eq("id", couponId)
      .maybeSingle();

    if (couponError) {
      console.error(
        `Failed to fetch coupon affiliate link: ${couponError.message}`,
      );
    } else if (couponData?.affiliate_link) {
      return { storeId: data.id, url: couponData.affiliate_link };
    }
  }

  const url = data.affiliate_link ?? data.website_url;

  if (!url) {
    return null;
  }

  return { storeId: data.id, url };
}

export async function recordClick(
  storeId: string,
  couponId?: string,
): Promise<void> {
  if (!couponId) return;

  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_coupon_click", {
    coupon_id_input: couponId,
  });

  if (error) {
    console.error(`Failed to record click: ${error.message}`);
  }
}
