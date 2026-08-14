// lib/redirect.ts

import { createClient } from "@/lib/supabase/server";

interface StoreRedirectRow {
  id: string;
  affiliate_link: string | null;
  website_url: string | null;
}

export async function getStoreRedirectUrl(
  slug: string
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
  const url = row.affiliate_link ?? row.website_url;

  if (!url) {
    return null;
  }

  return { storeId: row.id, url };
}

export async function recordClick(
  storeId: string,
  couponId?: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("clicks").insert({
    store_id: storeId,
    coupon_id: couponId ?? null,
  });

  if (error) {
    console.error(`Failed to record click: ${error.message}`);
  }
}