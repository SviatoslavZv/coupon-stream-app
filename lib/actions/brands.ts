// lib/actions/brands.ts

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { Brand } from "@/lib/brands";
import { firstErrorMessage } from "@/lib/schemas/common";
import { NewBrandSchema } from "@/lib/schemas/brands";

const UNIQUE_VIOLATION = "23505";

export type CreateBrandResult =
  | { ok: true; brand: Brand }
  | { ok: false; error: string };

/** Adds a brand to the brands table, so forms can use it right away. */
export async function createBrand(
  rawLabel: string,
): Promise<CreateBrandResult> {
  const supabase = await requireAdmin();

  const parsed = NewBrandSchema.safeParse({ label: rawLabel });
  if (!parsed.success) {
    return { ok: false, error: firstErrorMessage(parsed.error) };
  }

  const { data, error } = await supabase
    .from("brands")
    .insert(parsed.data)
    .select("slug, label")
    .single();

  if (error) {
    return {
      ok: false,
      error:
        error.code === UNIQUE_VIOLATION
          ? "This brand is already in the list."
          : "Could not add the brand. Please try again.",
    };
  }

  // A new brand changes the public brand list and the sitemap
  revalidatePath("/brands");
  revalidatePath("/sitemap.xml");

  return { ok: true, brand: data };
}
