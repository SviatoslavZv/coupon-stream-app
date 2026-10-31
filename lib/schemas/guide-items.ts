// lib/schemas/guide-items.ts

import { z } from "zod";
import {
  GUIDE_ITEM_MOVE_DIRECTIONS,
  GUIDE_ITEM_SOURCES,
} from "@/lib/constants/guides";
import { requiredText } from "@/lib/schemas/common";

const comment = requiredText("Comment is required").transform((value) =>
  value.replace(/\r\n?/g, "\n"),
);

export const AddGuideItemSchema = z.object({
  guideId: z.uuid("Guide not found"),
  source: z.enum(GUIDE_ITEM_SOURCES, "Choose an item type"),
  itemId: z.uuid("Choose a link or coupon"),
  comment,
});

export const UpdateGuideItemSchema = z.object({
  id: z.uuid("Item not found"),
  comment,
});

export const MoveGuideItemSchema = z.object({
  id: z.uuid("Item not found"),
  direction: z.enum(GUIDE_ITEM_MOVE_DIRECTIONS),
});
