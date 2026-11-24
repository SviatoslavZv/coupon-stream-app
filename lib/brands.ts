// lib/brands.ts

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

/** A brand as the site uses it: the page address and the name people see. */
export type Brand = Pick<Tables<"brands">, "slug" | "label">;

/** All brands, A to Z. cache(): several parts of one page may ask, the database is asked once. */
export const getBrands = cache(async (): Promise<Brand[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("slug, label")
    .order("label");

  if (error) {
    throw new Error(`Failed to fetch brands: ${error.message}`);
  }

  return data;
});

/** One brand by its page address, or null when there is no such brand. */
export const getBrandBySlug = cache(
  async (slug: string): Promise<Brand | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("brands")
      .select("slug, label")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch brand: ${error.message}`);
    }

    return data;
  },
);
