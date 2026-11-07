// lib/schemas/amazon-import.ts

import { z } from "zod";
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
} from "@/lib/schemas/common";
import {
  BRANDS,
  CATEGORIES,
  GENDERS,
  getSubcategories,
} from "@/lib/constants/taxonomy";

type RawSearchParams = Record<string, string | string[] | undefined>;

function blankToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

const AmazonImportParamsSchema = z.object({
  category: z.enum(AMAZON_CATEGORIES).catch(AMAZON_CATEGORIES[0]),
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
  const flat = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  return AmazonImportParamsSchema.parse(flat);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const AmazonCouponSchema = z
  .object({
    storeId: z.uuid("Choose a store."),
    type: z.enum(["code", "sale"]),
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
    brand: optionalOneOf(
      BRANDS.map((item) => item.label),
      "Unknown brand.",
    ),
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
    brand: optionalOneOf(
      BRANDS.map((item) => item.label),
      "Unknown brand.",
    ),
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
