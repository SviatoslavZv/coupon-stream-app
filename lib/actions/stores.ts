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
  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const affiliateLink = formData.get("affiliateLink") as string;
  const websiteUrl = formData.get("websiteUrl") as string;

  const supabase = await createClient();

  const { error } = await supabase.from("stores").insert({
    slug,
    name,
    logo_url: logoUrl,
    affiliate_link: affiliateLink || null,
    website_url: websiteUrl || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A store with this slug already exists. Please choose a different one." };
    }
    return { error: "Could not create the store. Please check the fields and try again." };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateStore(
  prevState: StoreFormState | null,
  formData: FormData
): Promise<StoreFormState> {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const affiliateLink = formData.get("affiliateLink") as string;
  const websiteUrl = formData.get("websiteUrl") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("stores")
    .update({
      slug,
      name,
      logo_url: logoUrl,
      affiliate_link: affiliateLink || null,
      website_url: websiteUrl || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A store with this slug already exists. Please choose a different one." };
    }
    return { error: "Could not save changes. Please check the fields and try again." };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteStore(formData: FormData) {
  const id = formData.get("id") as string;

  const supabase = await createClient();

  const { error } = await supabase.from("stores").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete store: ${error.message}`);
  }

  revalidatePath("/admin");
}