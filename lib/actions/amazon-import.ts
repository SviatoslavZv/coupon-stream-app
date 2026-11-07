// lib/actions/amazon-import.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { firstErrorMessage } from "@/lib/schemas/common";
import { isCouponExpired } from "@/lib/utils";
import type { CouponFormState } from "@/lib/actions/coupons";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateAmazonLinks } from "@/lib/partnerboost";
import { getStoreIdBySlug } from "@/lib/stores";
import {
  appendGuideItem,
  revalidateGuidePages,
  UNIQUE_VIOLATION,
} from "@/lib/guide-items";
import {
  AmazonCouponSchema,
  AmazonLinkSchema,
} from "@/lib/schemas/amazon-import";
import {
  AMAZON_PICKS_SID,
  AMAZON_SID_MAX_LENGTH,
  AMAZON_STORE_SLUG,
} from "@/lib/constants/amazon";

interface ExistingCouponRow {
  expires_at: string;
}

export async function importAmazonCoupon(
  _prevState: CouponFormState | null,
  formData: FormData,
): Promise<CouponFormState> {
  const supabase = await requireAdmin();

  const parsed = AmazonCouponSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }
  const input = parsed.data;

  // Защита от дублей: активный купон на этот ASIN уже есть?
  const { data: existing, error: lookupError } = await supabase
    .from("coupons")
    .select("expires_at")
    .eq("asin", input.asin);

  if (lookupError) {
    return { error: "Could not check existing coupons. Please try again." };
  }
  if (
    (existing as ExistingCouponRow[]).some(
      (row) => !isCouponExpired(row.expires_at),
    )
  ) {
    return { error: "An active coupon for this product already exists." };
  }

  const { error } = await supabase.from("coupons").insert({
    store_id: input.storeId,
    type: input.type,
    discount_label: input.discountLabel,
    title: input.title,
    code: input.code,
    description: input.description,
    expires_at: input.expiresAt,
    category: input.category,
    subcategory: input.subcategory,
    gender: input.gender,
    brand: input.brand,
    affiliate_link: input.affiliateLink,
    asin: input.asin,
    image_url: input.imageUrl,
  });

  if (error) {
    return {
      error:
        "Could not save the coupon. Please check the fields and try again.",
    };
  }

  revalidatePath("/admin");
  redirect(input.returnTo);
}

async function buildLinkSid(
  supabase: SupabaseClient,
  guideId: string | null,
): Promise<string> {
  if (!guideId) return AMAZON_PICKS_SID;

  const { data } = await supabase
    .from("guides")
    .select("slug")
    .eq("id", guideId)
    .maybeSingle();
  const slug = (data as { slug: string } | null)?.slug;
  return slug
    ? `guide-${slug}`.slice(0, AMAZON_SID_MAX_LENGTH)
    : AMAZON_PICKS_SID;
}

export async function importAmazonProductLink(
  _prevState: CouponFormState | null,
  formData: FormData,
): Promise<CouponFormState> {
  const supabase = await requireAdmin();

  const parsed = AmazonLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }
  const input = parsed.data;

  const storeId = await getStoreIdBySlug(AMAZON_STORE_SLUG);
  if (!storeId) {
    return {
      error: `Create the store with slug "${AMAZON_STORE_SLUG}" first.`,
    };
  }

  // Товар уже в каталоге? Тогда новую ссылку не создаём
  const { data: existing, error: lookupError } = await supabase
    .from("shop_links")
    .select("id")
    .eq("store_id", storeId)
    .eq("asin", input.asin)
    .maybeSingle();

  if (lookupError) {
    return { error: "Could not check the catalog. Please try again." };
  }

  let shopLinkId = (existing as { id: string } | null)?.id ?? null;

  if (!shopLinkId) {
    const sid = await buildLinkSid(supabase, input.guideId);

    let url: string | undefined;
    try {
      url = (await generateAmazonLinks([input.asin], sid)).get(input.asin);
    } catch {
      return { error: "PartnerBoost is not responding. Please try again." };
    }
    if (!url) {
      return { error: "PartnerBoost did not return a link for this product." };
    }

    const { data: created, error: insertError } = await supabase
      .from("shop_links")
      .insert({
        store_id: storeId,
        kind: "product",
        title: input.title,
        url,
        brand: input.brand,
        asin: input.asin,
        image_url: input.imageUrl,
        network_link_id: null,
        commission_rate: input.commissionRate,
        coupon_percent: input.couponPercent,
        last_checked_at: new Date().toISOString(),
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) {
      return {
        error:
          insertError.code === UNIQUE_VIOLATION
            ? "This product is already in the catalog."
            : "Could not save the product link. Please try again.",
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
  }

  revalidatePath("/admin");
  redirect(input.returnTo);
}
