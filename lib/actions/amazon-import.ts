// lib/actions/amazon-import.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { firstErrorMessage } from "@/lib/schemas/common";
import { AmazonCouponSchema } from "@/lib/schemas/amazon-import";
import { isCouponExpired } from "@/lib/utils";
import type { CouponFormState } from "@/lib/actions/coupons";

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
