// lib/actions/coupons.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { firstErrorMessage } from "@/lib/schemas/common";
import { CouponSchema, type CouponInput } from "@/lib/schemas/coupons";
import {
  ADMIN_ROUTES,
  RETURN_TO_PARAM,
  safeAdminReturnTo,
  withNotice,
} from "@/lib/constants/admin";
import type { FormState } from "@/types";

function toRow(input: CouponInput) {
  return {
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
    image_url: input.imageUrl,
  };
}

export async function createCoupon(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const supabase = await requireAdmin();

  const parsed = CouponSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { error } = await supabase.from("coupons").insert(toRow(parsed.data));
  if (error) {
    return {
      error:
        "Could not create the coupon. Please check the fields and try again.",
    };
  }

  revalidatePath(ADMIN_ROUTES.dashboard, "layout");
  redirect(withNotice(ADMIN_ROUTES.coupons, "created"));
}

export async function updateCoupon(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Coupon not found." };
  }

  const parsed = CouponSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("coupons")
    .update(toRow(parsed.data))
    .eq("id", id.data);
  if (error) {
    return {
      error: "Could not save changes. Please check the fields and try again.",
    };
  }

  revalidatePath(ADMIN_ROUTES.dashboard, "layout");
  const returnTo = safeAdminReturnTo(
    formData.get(RETURN_TO_PARAM),
    ADMIN_ROUTES.coupons,
  );
  redirect(withNotice(returnTo, "saved"));
}

export async function deleteCoupon(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    throw new Error("Coupon not found.");
  }

  const { error } = await supabase.from("coupons").delete().eq("id", id.data);
  if (error) {
    throw new Error(`Failed to delete coupon: ${error.message}`);
  }

  revalidatePath(ADMIN_ROUTES.dashboard, "layout");
}

export async function markCouponVerified(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    throw new Error("Coupon not found.");
  }

  const { error } = await supabase
    .from("coupons")
    .update({ last_verified_at: new Date().toISOString() })
    .eq("id", id.data);
  if (error) {
    throw new Error(`Failed to verify coupon: ${error.message}`);
  }

  revalidatePath(ADMIN_ROUTES.dashboard, "layout");
}
