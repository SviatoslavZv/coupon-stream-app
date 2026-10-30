// lib/actions/shop-links.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { extractNetworkLinkId } from "@/lib/network-links";
import { firstErrorMessage } from "@/lib/schemas/common";
import { ShopLinkSchema, type ShopLinkInput } from "@/lib/schemas/shop-links";

export interface ShopLinkFormState {
  error?: string;
}

const UNIQUE_VIOLATION = "23505";

function toRow(input: ShopLinkInput) {
  return {
    store_id: input.storeId,
    kind: input.kind,
    title: input.title,
    url: input.url,
    brand: input.brand,
    asin: input.asin,
    image_url: input.imageUrl,
    network_link_id: input.networkLinkId ?? extractNetworkLinkId(input.url),
    commission_rate: input.commissionRate,
    is_active: input.isActive,
  };
}

function saveErrorMessage(code: string | undefined): string {
  if (code === UNIQUE_VIOLATION) {
    return "This network link ID is already used for this store.";
  }
  return "Could not save the link. Please check the fields and try again.";
}

export async function createShopLink(
  _prevState: ShopLinkFormState | null,
  formData: FormData,
): Promise<ShopLinkFormState> {
  const supabase = await requireAdmin();

  const parsed = ShopLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("shop_links")
    .insert(toRow(parsed.data));
  if (error) {
    return { error: saveErrorMessage(error.code) };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateShopLink(
  _prevState: ShopLinkFormState | null,
  formData: FormData,
): Promise<ShopLinkFormState> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Link not found." };
  }

  const parsed = ShopLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("shop_links")
    .update(toRow(parsed.data))
    .eq("id", id.data);
  if (error) {
    return { error: saveErrorMessage(error.code) };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

const FOREIGN_KEY_VIOLATION = "23503";

export async function deleteShopLink(
  _prevState: ShopLinkFormState | null,
  formData: FormData,
): Promise<ShopLinkFormState> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Link not found." };
  }

  const { error } = await supabase
    .from("shop_links")
    .delete()
    .eq("id", id.data);
  if (error) {
    if (error.code === FOREIGN_KEY_VIOLATION) {
      return {
        error:
          "Used in a guide. Remove it from the guide first, or hide it instead.",
      };
    }
    return { error: "Could not delete the link. Please try again." };
  }

  revalidatePath("/admin");
  return {};
}
