// lib/actions/coupons.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCoupon(formData: FormData) {
  const storeId = formData.get("storeId") as string;
  const type = formData.get("type") as string;
  const discountLabel = formData.get("discountLabel") as string;
  const title = formData.get("title") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const expiresAt = formData.get("expiresAt") as string;

  const supabase = await createClient();

  const { error } = await supabase.from("coupons").insert({
    store_id: storeId,
    type,
    discount_label: discountLabel,
    title,
    code: code || null,
    description,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Failed to create coupon: ${error.message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}