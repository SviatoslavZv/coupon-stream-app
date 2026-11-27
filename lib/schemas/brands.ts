// lib/schemas/brands.ts

import { z } from "zod";
import { slugify } from "@/lib/utils";
import { SLUG_PATTERN } from "@/lib/schemas/common";

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
