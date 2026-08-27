// lib/actions/stores.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface StoreFormState {
  error?: string;
}

export async function createStore(
  prevState: StoreFormState | null,
  formData: FormData
): Promise<StoreFormState> {
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim();
  const affiliateLink = (formData.get("affiliateLink") as string)?.trim();
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim();
  const bannerUrl = (formData.get("bannerUrl") as string)?.trim();
  const bannerLink = (formData.get("bannerLink") as string)?.trim();

  // Простая проверка обязательных полей
  if (!slug || !name) {
    return { error: "Name and Slug are required fields." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("stores").insert({
    slug,
    name,
    logo_url: logoUrl || null,
    affiliate_link: affiliateLink || null,
    website_url: websiteUrl || null,
    banner_url: bannerUrl || null,
    banner_link: bannerLink || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A store with this slug already exists. Please choose a different one." };
    }
    return { error: "Could not create the store. Please check the fields and try again." };
  }

  // 💡 Сбрасываем кэш не только админки, но и публичных страниц!
  revalidatePath("/admin");
  revalidatePath("/stores");
  revalidatePath(`/store/${slug}`);
  revalidatePath("/sitemap.xml");

  redirect("/admin");
}

export async function updateStore(
  prevState: StoreFormState | null,
  formData: FormData
): Promise<StoreFormState> {
  const id = formData.get("id") as string;
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim();
  const affiliateLink = (formData.get("affiliateLink") as string)?.trim();
  const websiteUrl = (formData.get("websiteUrl") as string)?.trim();
  const bannerUrl = (formData.get("bannerUrl") as string)?.trim();
  const bannerLink = (formData.get("bannerLink") as string)?.trim();

  if (!id || !slug || !name) {
    return { error: "Store ID, Name and Slug are required fields." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("stores")
    .update({
      slug,
      name,
      logo_url: logoUrl || null,
      affiliate_link: affiliateLink || null,
      website_url: websiteUrl || null,
      banner_url: bannerUrl || null,
      banner_link: bannerLink || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A store with this slug already exists. Please choose a different one." };
    }
    return { error: "Could not save changes. Please check the fields and try again." };
  }

  // 💡 Инвалидация кэша для публичных страниц при обновлении
  revalidatePath("/admin");
  revalidatePath("/stores");
  revalidatePath(`/store/${slug}`);
  revalidatePath("/sitemap.xml");

  redirect("/admin");
}

export async function deleteStore(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) return;

  const supabase = await createClient();

  const { error } = await supabase.from("stores").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete store: ${error.message}`);
  }

  // 💡 Инвалидируем кэш после удаления
  revalidatePath("/admin");
  revalidatePath("/stores");
  revalidatePath("/sitemap.xml");
}