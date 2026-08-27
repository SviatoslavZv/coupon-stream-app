// lib/actions/coupons.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface CouponFormState {
  error?: string;
}

export async function createCoupon(
  prevState: CouponFormState | null,
  formData: FormData
): Promise<CouponFormState> {
  const storeId = formData.get("storeId") as string;
  const type = formData.get("type") as string;
  const discountLabel = formData.get("discountLabel") as string;
  const title = formData.get("title") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const expiresAt = formData.get("expiresAt") as string;
  const category = formData.get("category") as string;
  const subcategory = formData.get("subcategory") as string;
  const gender = formData.get("gender") as string;
    const brand = formData.get("brand") as string;
  const affiliateLink = formData.get("affiliateLink") as string;

  const supabase = await createClient();

  const { error } = await supabase.from("coupons").insert({
    store_id: storeId,
    type,
    discount_label: discountLabel,
    title,
    code: code || null,
    description,
    expires_at: expiresAt,
    category: category || null,
    subcategory: subcategory || null,
    gender: gender || null,
    brand: brand || null,
    affiliate_link: affiliateLink || null,
  });

  if (error) {
    return { error: "Could not create the coupon. Please check the fields and try again." };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateCoupon(
  prevState: CouponFormState | null,
  formData: FormData
): Promise<CouponFormState> {
  const id = formData.get("id") as string;
  const storeId = formData.get("storeId") as string;
  const type = formData.get("type") as string;
  const discountLabel = formData.get("discountLabel") as string;
  const title = formData.get("title") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const expiresAt = formData.get("expiresAt") as string;
  const category = formData.get("category") as string;
  const subcategory = formData.get("subcategory") as string;
  const gender = formData.get("gender") as string;
    const brand = formData.get("brand") as string;
  const affiliateLink = formData.get("affiliateLink") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("coupons")
    .update({
      store_id: storeId,
      type,
      discount_label: discountLabel,
      title,
      code: code || null,
      description,
      expires_at: expiresAt,
      category: category || null,
      subcategory: subcategory || null,
      gender: gender || null,
      brand: brand || null,
      affiliate_link: affiliateLink || null,
    })
    .eq("id", id);

  if (error) {
    return { error: "Could not save changes. Please check the fields and try again." };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteCoupon(formData: FormData) {
  const id = formData.get("id") as string;

  const supabase = await createClient();

  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete coupon: ${error.message}`);
  }

  revalidatePath("/admin");
}


export async function markCouponVerified(formData: FormData) {
  const id = formData.get("id") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("coupons")
    .update({ last_verified_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to verify coupon: ${error.message}`);
  }

  revalidatePath("/admin");
}