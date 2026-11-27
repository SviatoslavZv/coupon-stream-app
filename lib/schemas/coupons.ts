// lib/schemas/coupons.ts

import { z } from "zod";
import { COUPON_TYPES } from "@/lib/constants/coupons";
import {
  CATEGORIES,
  GENDERS,
  getSubcategories,
} from "@/lib/constants/taxonomy";
import {
  optionalHttpsUrl,
  optionalOneOf,
  optionalText,
  requiredText,
} from "@/lib/schemas/common";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const CouponFieldsSchema = z.object({
  storeId: z.uuid("Choose a store."),
  type: z.enum(COUPON_TYPES, "Choose a coupon type."),
  discountLabel: requiredText("Discount label is required."),
  title: requiredText("Title is required."),
  code: optionalText,
  description: requiredText("Description is required."),
  expiresAt: z.string().regex(DATE_PATTERN, "Choose an expiry date."),
  category: optionalOneOf(
    CATEGORIES.map((item) => item.slug),
    "Unknown category.",
  ),
  subcategory: optionalText,
  gender: optionalOneOf(
    GENDERS.map((item) => item.slug),
    "Unknown gender.",
  ),
  // Any text here; the database accepts only names from the brands table (foreign key)
  brand: optionalText,
  affiliateLink: optionalHttpsUrl("Affiliate link must start with https://"),
  imageUrl: optionalHttpsUrl("Image URL must start with https://"),
});

export const CouponSchema = CouponFieldsSchema.refine(
  (input) =>
    input.subcategory === null ||
    getSubcategories(input.category ?? "").some(
      (item) => item.slug === input.subcategory,
    ),
  {
    message: "Subcategory does not match the category.",
    path: ["subcategory"],
  },
).refine((input) => input.type !== "code" || input.code !== null, {
  message: "Enter the coupon code.",
  path: ["code"],
});

export type CouponInput = z.infer<typeof CouponSchema>;
