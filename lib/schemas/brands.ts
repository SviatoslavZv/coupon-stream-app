// lib/schemas/brands.ts

import { z } from "zod";
import { slugify } from "@/lib/utils";

// Same rule as the check on brands.slug in the database
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const NewBrandSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, "Enter a brand name.")
      .max(60, "The brand name is too long."),
  })
  .transform(({ label }) => ({ label, slug: slugify(label) }))
  .refine((brand) => SLUG_PATTERN.test(brand.slug), {
    message: "The brand name needs at least one Latin letter or digit.",
  });

export type NewBrandInput = z.infer<typeof NewBrandSchema>;
