// lib/schemas/shop-links.ts

import { z } from "zod";
import { SHOP_LINK_KINDS } from "@/lib/constants/shop-links";
import { BRANDS } from "@/lib/constants/taxonomy";
import {
  checkbox,
  emptyToNull,
  httpsUrl,
  optionalHttpsUrl,
  optionalOneOf,
  optionalText,
  requiredText,
} from "@/lib/schemas/common";

export const ShopLinkSchema = z
  .object({
    storeId: z.uuid("Choose a store"),
    kind: z.enum(SHOP_LINK_KINDS, "Choose a link type"),
    title: requiredText("Title is required"),
    url: httpsUrl("Tracking link must start with https://"),
    brand: optionalOneOf(
      BRANDS.map((brand) => brand.label),
      "Choose a brand from the list",
    ),
    asin: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z0-9]{10}$/, "ASIN must be 10 letters or digits")
        .nullable(),
    ),
    imageUrl: optionalHttpsUrl("Image URL must start with https://"),
    networkLinkId: optionalText,
    commissionRate: z.preprocess(
      emptyToNull,
      z.coerce
        .number("Commission must be a number")
        .min(0, "Commission can't be negative")
        .max(100, "Commission can't exceed 100%")
        .nullable(),
    ),
    isActive: checkbox,
  })
  .refine((data) => data.asin === null || data.kind === "product", {
    message: "ASIN can only be set for a product",
    path: ["asin"],
  });

export type ShopLinkInput = z.infer<typeof ShopLinkSchema>;
