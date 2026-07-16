// lib/actions/stores.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createStore(formData: FormData) {
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
    throw new Error(`Failed to create store: ${error.message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateStore(formData: FormData) {
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
    throw new Error(`Failed to update store: ${error.message}`);
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