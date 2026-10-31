// lib/actions/guide-items.ts

"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { SORT_ORDER_STEP } from "@/lib/constants/guides";
import { firstErrorMessage } from "@/lib/schemas/common";
import {
  AddGuideItemSchema,
  MoveGuideItemSchema,
  UpdateGuideItemSchema,
} from "@/lib/schemas/guide-items";

export interface GuideItemFormState {
  error?: string;
  success?: boolean;
}

const UNIQUE_VIOLATION = "23505";

async function revalidateGuidePages(supabase: SupabaseClient, guideId: string) {
  const { data } = await supabase
    .from("guides")
    .select("slug")
    .eq("id", guideId)
    .maybeSingle();

  revalidatePath("/admin");
  revalidatePath(`/admin/guides/${guideId}/edit`);
  if (data?.slug) {
    revalidatePath(`/guides/${data.slug}`);
  }
}

export async function addGuideItem(
  _prevState: GuideItemFormState | null,
  formData: FormData,
): Promise<GuideItemFormState> {
  const supabase = await requireAdmin();

  const parsed = AddGuideItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }
  const { guideId, source, itemId, comment } = parsed.data;

  const { data: last } = await supabase
    .from("guide_items")
    .select("sort_order")
    .eq("guide_id", guideId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("guide_items").insert({
    guide_id: guideId,
    shop_link_id: source === "shop_link" ? itemId : null,
    coupon_id: source === "coupon" ? itemId : null,
    sort_order: (last?.sort_order ?? -SORT_ORDER_STEP) + SORT_ORDER_STEP,
    comment,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: "This item is already in the guide." };
    }
    return { error: "Could not add the item. Please try again." };
  }

  await revalidateGuidePages(supabase, guideId);
  return { success: true };
}

export async function updateGuideItemComment(
  _prevState: GuideItemFormState | null,
  formData: FormData,
): Promise<GuideItemFormState> {
  const supabase = await requireAdmin();

  const parsed = UpdateGuideItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: firstErrorMessage(parsed.error) };
  }

  const { data, error } = await supabase
    .from("guide_items")
    .update({ comment: parsed.data.comment })
    .eq("id", parsed.data.id)
    .select("guide_id")
    .single();

  if (error) {
    return { error: "Could not save the comment. Please try again." };
  }

  await revalidateGuidePages(supabase, data.guide_id);
  return { success: true };
}

export async function moveGuideItem(formData: FormData) {
  const supabase = await requireAdmin();

  const parsed = MoveGuideItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return;
  }

  const { data: item } = await supabase
    .from("guide_items")
    .select("id, guide_id, sort_order")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!item) {
    return;
  }

  const isUp = parsed.data.direction === "up";
  const siblings = supabase
    .from("guide_items")
    .select("id, sort_order")
    .eq("guide_id", item.guide_id);

  const { data: neighbor } = await (
    isUp
      ? siblings
          .lt("sort_order", item.sort_order)
          .order("sort_order", { ascending: false })
      : siblings
          .gt("sort_order", item.sort_order)
          .order("sort_order", { ascending: true })
  )
    .limit(1)
    .maybeSingle();

  if (!neighbor) {
    return;
  }

  await supabase
    .from("guide_items")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", item.id);
  await supabase
    .from("guide_items")
    .update({ sort_order: item.sort_order })
    .eq("id", neighbor.id);

  await revalidateGuidePages(supabase, item.guide_id);
}

export async function removeGuideItem(formData: FormData) {
  const supabase = await requireAdmin();

  const parsed = UpdateGuideItemSchema.pick({ id: true }).safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return;
  }

  const { data, error } = await supabase
    .from("guide_items")
    .delete()
    .eq("id", parsed.data.id)
    .select("guide_id")
    .single();

  if (error) {
    throw new Error(`Failed to remove guide item: ${error.message}`);
  }

  await revalidateGuidePages(supabase, data.guide_id);
}
