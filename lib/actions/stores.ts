// lib/actions/stores.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { firstErrorMessage } from "@/lib/schemas/common";
import { StoreSchema, type StoreInput } from "@/lib/schemas/stores";
import { ADMIN_ROUTES, withNotice } from "@/lib/constants/admin";
import type { FormState } from "@/types";

const UNIQUE_VIOLATION = "23505";

function toRow(input: StoreInput) {
  return {
    slug: input.slug,
    name: input.name,
    logo_url: input.logoUrl,
    affiliate_link: input.affiliateLink,
    website_url: input.websiteUrl,
    banner_url: input.bannerUrl,
    banner_link: input.bannerLink,
  };
}

function saveErrorMessage(code: string | undefined): string {
  if (code === UNIQUE_VIOLATION) {
    return "A store with this slug already exists. Please choose a different one.";
  }
  return "Could not save the store. Please check the fields and try again.";
}

function revalidateStorePages(slug?: string): void {
  revalidatePath(ADMIN_ROUTES.dashboard, "layout");
  revalidatePath("/stores");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/store/${slug}`);
  }
}

export async function createStore(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const supabase = await requireAdmin();

  const parsed = StoreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { error } = await supabase.from("stores").insert(toRow(parsed.data));
  if (error) {
    return { error: saveErrorMessage(error.code) };
  }

  revalidateStorePages(parsed.data.slug);
  redirect(withNotice(ADMIN_ROUTES.stores, "created"));
}

export async function updateStore(
  _prevState: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Store not found." };
  }

  const parsed = StoreSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { error } = await supabase
    .from("stores")
    .update(toRow(parsed.data))
    .eq("id", id.data);
  if (error) {
    return { error: saveErrorMessage(error.code) };
  }

  revalidateStorePages(parsed.data.slug);
  redirect(withNotice(ADMIN_ROUTES.stores, "saved"));
}

export async function deleteStore(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    throw new Error("Store not found.");
  }

  const { error } = await supabase.from("stores").delete().eq("id", id.data);
  if (error) {
    throw new Error(`Failed to delete store: ${error.message}`);
  }

  revalidateStorePages();
}
