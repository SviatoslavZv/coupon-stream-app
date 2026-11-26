// lib/schemas/amazon-import.ts

import { z } from "zod";
import { COUPON_TYPES } from "@/lib/constants/coupons";
import {
  AMAZON_CATEGORIES,
  AMAZON_IMPORT_SORTS,
  AMAZON_IMPORT_PATH,
  ASIN_PATTERN,
} from "@/lib/constants/amazon";
import {
  requiredText,
  optionalText,
  httpsUrl,
  optionalHttpsUrl,
  optionalOneOf,
  emptyToNull,
  blankToUndefined,
  flattenSearchParams,
  type RawSearchParams,
} from "@/lib/schemas/common";
import {
  CATEGORIES,
  GENDERS,
  getSubcategories,
} from "@/lib/constants/taxonomy";
import { parseAsinList } from "@/lib/amazon-import";

const AmazonImportParamsSchema = z.object({
  category: z.enum(AMAZON_CATEGORIES).catch(AMAZON_CATEGORIES[0]),
  // ASINs or Amazon links, any separators; turned into a clean ASIN list
  asins: z.string().max(5000).catch("").transform(parseAsinList),
  // Guide that new products go to by default
  guide: z.preprocess(blankToUndefined, z.uuid().optional()).catch(undefined),
  brand: z
    .preprocess(blankToUndefined, z.coerce.number().int().positive().optional())
    .catch(undefined),
  sub: z
    .preprocess(blankToUndefined, z.string().trim().max(60).optional())
    .catch(undefined),
  coupon: z.preprocess((value) => value === "1", z.boolean()),
  minReviews: z
    .preprocess(blankToUndefined, z.coerce.number().int().min(0).optional())
    .catch(undefined),
  sort: z.enum(AMAZON_IMPORT_SORTS).catch("reviews"),
  cursor: z
    .preprocess(blankToUndefined, z.string().max(500).optional())
    .catch(undefined),
});

export type AmazonImportFilters = z.infer<typeof AmazonImportParamsSchema>;

export function parseAmazonImportParams(
  raw: RawSearchParams,
): AmazonImportFilters {
  return AmazonImportParamsSchema.parse(flattenSearchParams(raw));
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const AmazonCouponSchema = z
  .object({
    storeId: z.uuid("Choose a store."),
    type: z.enum(COUPON_TYPES),
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
    affiliateLink: httpsUrl("An https affiliate link is required."),
    asin: z.string().trim().toUpperCase().regex(ASIN_PATTERN, "Invalid ASIN."),
    imageUrl: optionalHttpsUrl("Image URL must start with https://"),
    returnTo: z
      .string()
      .startsWith(AMAZON_IMPORT_PATH)
      .catch(AMAZON_IMPORT_PATH),
  })
  .refine(
    (input) =>
      input.subcategory === null ||
      getSubcategories(input.category ?? "").some(
        (item) => item.slug === input.subcategory,
      ),
    {
      message: "Subcategory does not match the category.",
      path: ["subcategory"],
    },
  );

export type AmazonCouponInput = z.infer<typeof AmazonCouponSchema>;

export const AmazonLinkSchema = z
  .object({
    title: requiredText("Title is required."),
    // Any text here; the database accepts only names from the brands table (foreign key)
    brand: optionalText,
    asin: z.string().trim().toUpperCase().regex(ASIN_PATTERN, "Invalid ASIN."),
    imageUrl: optionalHttpsUrl("Image URL must start with https://"),
    commissionRate: z.preprocess(
      emptyToNull,
      z.coerce.number().min(0).max(100).nullable(),
    ),
    couponPercent: z.preprocess(
      emptyToNull,
      z.coerce.number().gt(0).lt(100).nullable(),
    ),
    guideId: z.preprocess(emptyToNull, z.uuid().nullable()),
    comment: optionalText,
    returnTo: z
      .string()
      .startsWith(AMAZON_IMPORT_PATH)
      .catch(AMAZON_IMPORT_PATH),
  })
  .refine((input) => input.guideId === null || input.comment !== null, {
    message: "Write a comment for the guide.",
    path: ["comment"],
  });

export type AmazonLinkInput = z.infer<typeof AmazonLinkSchema>;
