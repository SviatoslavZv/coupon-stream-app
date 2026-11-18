// lib/schemas/store-products.ts

import { z } from "zod";
import { BRANDS } from "@/lib/constants/taxonomy";
import {
  emptyToNull,
  httpsUrl,
  optionalHttpsUrl,
  optionalOneOf,
  optionalText,
  requiredText,
} from "@/lib/schemas/common";

export const StoreProductSchema = z
  .object({
    storeId: z.uuid("Choose a store."),
    productUrl: httpsUrl("Product URL must start with https://"),
    title: requiredText("Title is required."),
    brand: optionalOneOf(
      BRANDS.map((item) => item.label),
      "Unknown brand.",
    ),
    imageUrl: optionalHttpsUrl("Image URL must start with https://"),
    guideId: z.preprocess(emptyToNull, z.uuid().nullable()),
    comment: optionalText,
  })
  .refine((input) => input.guideId === null || input.comment !== null, {
    message: "Write a comment for the guide.",
    path: ["comment"],
  });

export type StoreProductInput = z.infer<typeof StoreProductSchema>;

export const StoreProductLookupSchema = z.object({
  storeId: z.uuid("Choose a store first."),
  productUrl: httpsUrl("Paste a product URL that starts with https://"),
});
