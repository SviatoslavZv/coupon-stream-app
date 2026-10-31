// lib/actions/guides.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { firstErrorMessage } from "@/lib/schemas/common";
import { GuideSchema, type GuideInput } from "@/lib/schemas/guides";

export interface GuideFormState {
  error?: string;
}

const UNIQUE_VIOLATION = "23505";

function toRow(input: GuideInput) {
  return {
    title: input.title,
    slug: input.slug,
    intro: input.intro,
    meta_description: input.metaDescription,
    category: input.category,
    gender: input.gender,
    event_slug: input.eventSlug,
    is_published: input.isPublished,
  };
}

function saveErrorMessage(code: string | undefined): string {
  if (code === UNIQUE_VIOLATION) {
    return "A guide with this slug already exists. Please choose a different one.";
  }
  return "Could not save the guide. Please check the fields and try again.";
}

function revalidateGuide(slug: string) {
  revalidatePath("/admin");
  revalidatePath(`/guides/${slug}`);
}

export async function createGuide(
  _prevState: GuideFormState | null,
  formData: FormData,
): Promise<GuideFormState> {
  const supabase = await requireAdmin();

  const parsed = GuideSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { data, error } = await supabase
    .from("guides")
    .insert({
      ...toRow(parsed.data),
      published_at: parsed.data.isPublished ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: saveErrorMessage(error.code) };
  }

  revalidateGuide(parsed.data.slug);
  redirect(`/admin/guides/${data.id}/edit`);
}

export async function updateGuide(
  _prevState: GuideFormState | null,
  formData: FormData,
): Promise<GuideFormState> {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return { error: "Guide not found." };
  }

  const parsed = GuideSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { data: current, error: readError } = await supabase
    .from("guides")
    .select("slug, published_at")
    .eq("id", id.data)
    .maybeSingle();

  if (readError || !current) {
    return { error: "Guide not found." };
  }

  const publishedAt =
    parsed.data.isPublished && current.published_at === null
      ? new Date().toISOString()
      : current.published_at;

  const { error } = await supabase
    .from("guides")
    .update({ ...toRow(parsed.data), published_at: publishedAt })
    .eq("id", id.data);

  if (error) {
    return { error: saveErrorMessage(error.code) };
  }

  revalidateGuide(current.slug);
  if (current.slug !== parsed.data.slug) {
    revalidateGuide(parsed.data.slug);
  }
  redirect("/admin");
}

export async function deleteGuide(formData: FormData) {
  const supabase = await requireAdmin();

  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) {
    return;
  }

  const { error } = await supabase.from("guides").delete().eq("id", id.data);
  if (error) {
    throw new Error(`Failed to delete guide: ${error.message}`);
  }

  revalidatePath("/admin");
}
