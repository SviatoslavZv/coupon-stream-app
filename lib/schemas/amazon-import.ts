// lib/schemas/amazon-import.ts

import { z } from "zod";
import { AMAZON_CATEGORIES, AMAZON_IMPORT_SORTS } from "@/lib/constants/amazon";

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
