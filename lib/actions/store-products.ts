// lib/actions/store-products.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { CouponFormState } from "@/lib/actions/coupons";
import {
  appendGuideItem,
  revalidateGuidePages,
  UNIQUE_VIOLATION,
} from "@/lib/guide-items";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildDeepLink } from "@/lib/network-links";
import { fetchProductMeta, type ProductMetaResult } from "@/lib/product-meta";
import { firstErrorMessage } from "@/lib/schemas/common";
import {
  StoreProductLookupSchema,
  StoreProductSchema,
} from "@/lib/schemas/store-products";

interface StoreLinkRow {
  affiliate_link: string | null;
  website_url: string | null;
}

type StoreLinksResult =
  | { ok: true; store: StoreLinkRow }
  | { ok: false; error: string };

async function loadStoreLinks(
  supabase: SupabaseClient,
  storeId: string,
): Promise<StoreLinksResult> {
  const { data, error } = await supabase
    .from("stores")
    .select("affiliate_link, website_url")
    .eq("id", storeId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "Could not load the store. Please try again." };
  }
  if (!data) {
    return { ok: false, error: "Store not found." };
  }
  return { ok: true, store: data as StoreLinkRow };
}

/** Reads the title and image from a product page of the chosen store. */
export async function fetchStoreProductDetails(
  storeId: string,
  productUrl: string,
): Promise<ProductMetaResult> {
  const supabase = await requireAdmin();

  const parsed = StoreProductLookupSchema.safeParse({ storeId, productUrl });
  if (!parsed.success) {
    return { ok: false, error: firstErrorMessage(parsed.error) };
  }

  const loaded = await loadStoreLinks(supabase, parsed.data.storeId);
  if (!loaded.ok) {
    return loaded;
  }

  // Only pages of this store's own site: the server never fetches other addresses
  const { affiliate_link, website_url } = loaded.store;
  const check = buildDeepLink(
    affiliate_link,
    website_url,
    parsed.data.productUrl,
  );
  if (!check.ok) {
    return check;
  }

  return fetchProductMeta(
    parsed.data.productUrl,
    (url) => buildDeepLink(affiliate_link, website_url, url).ok,
  );
}

export async function addStoreProduct(
  _prevState: CouponFormState | null,
  formData: FormData,
): Promise<CouponFormState> {
  const supabase = await requireAdmin();

  const parsed = StoreProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }
  const input = parsed.data;

  const loaded = await loadStoreLinks(supabase, input.storeId);
  if (!loaded.ok) {
    return { error: loaded.error };
  }

  const { affiliate_link, website_url } = loaded.store;

  const deepLink = buildDeepLink(affiliate_link, website_url, input.productUrl);
  if (!deepLink.ok) {
    return { error: deepLink.error };
  }

  // Same page of the same store gives the same deep link: reuse it
  const { data: existing, error: lookupError } = await supabase
    .from("shop_links")
    .select("id")
    .eq("store_id", input.storeId)
    .eq("url", deepLink.url)
    .maybeSingle();

  if (lookupError) {
    return { error: "Could not check the catalog. Please try again." };
  }

  let shopLinkId = (existing as { id: string } | null)?.id ?? null;

  if (!shopLinkId) {
    const { data: created, error: insertError } = await supabase
      .from("shop_links")
      .insert({
        store_id: input.storeId,
        kind: "product",
        title: input.title,
        url: deepLink.url,
        brand: input.brand,
        asin: null,
        image_url: input.imageUrl,
        network_link_id: null,
        last_checked_at: new Date().toISOString(),
        check_status: "ok",
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) {
      return {
        error:
          insertError.code === UNIQUE_VIOLATION
            ? "This product is already in the catalog."
            : "Could not save the product. Please try again.",
      };
    }
    shopLinkId = (created as { id: string }).id;
  }

  if (input.guideId) {
    const guideError = await appendGuideItem(supabase, {
      guideId: input.guideId,
      source: "shop_link",
      itemId: shopLinkId,
      comment: input.comment ?? "",
    });
    if (guideError) {
      return { error: guideError };
    }
    await revalidateGuidePages(supabase, input.guideId);
    redirect(`/admin/guides/${input.guideId}/edit`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}
