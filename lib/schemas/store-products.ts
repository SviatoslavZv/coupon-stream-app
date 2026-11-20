// lib/schemas/store-products.ts

import { z } from "zod";
import { BRANDS } from "@/lib/constants/taxonomy";
import {
  emptyToNull,
  flattenSearchParams,
  type RawSearchParams,
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

/** Address parameters that open "Add from store" already filled in: ?store=<id>&url=<product page> */
export const STORE_PRODUCT_PREFILL_PARAMS = {
  store: "store",
  url: "url",
} as const;

const StoreProductPrefillSchema = z.object({
  [STORE_PRODUCT_PREFILL_PARAMS.store]: z.uuid().optional().catch(undefined),
  [STORE_PRODUCT_PREFILL_PARAMS.url]: z
    .url({ protocol: /^https$/ })
    .optional()
    .catch(undefined),
});

export type StoreProductPrefill = z.infer<typeof StoreProductPrefillSchema>;

export function parseStoreProductPrefill(
  raw: RawSearchParams,
): StoreProductPrefill {
  return StoreProductPrefillSchema.parse(flattenSearchParams(raw));
}
