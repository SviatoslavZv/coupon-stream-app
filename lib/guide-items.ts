// lib/guide-items.ts

import "server-only";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SORT_ORDER_STEP, type GuideItemSource } from "@/lib/constants/guides";

export const UNIQUE_VIOLATION = "23505";

export async function revalidateGuidePages(
  supabase: SupabaseClient,
  guideId: string,
) {
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

export async function appendGuideItem(
  supabase: SupabaseClient,
  item: {
    guideId: string;
    source: GuideItemSource;
    itemId: string;
    comment: string;
  },
): Promise<string | null> {
  const { data: last } = await supabase
    .from("guide_items")
    .select("sort_order")
    .eq("guide_id", item.guideId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("guide_items").insert({
    guide_id: item.guideId,
    shop_link_id: item.source === "shop_link" ? item.itemId : null,
    coupon_id: item.source === "coupon" ? item.itemId : null,
    sort_order: (last?.sort_order ?? -SORT_ORDER_STEP) + SORT_ORDER_STEP,
    comment: item.comment,
  });

  if (!error) return null;
  if (error.code === UNIQUE_VIOLATION)
    return "This item is already in the guide.";
  return "Could not add the item to the guide. Please try again.";
}
