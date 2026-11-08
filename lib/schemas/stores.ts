// lib/schemas/stores.ts

import { z } from "zod";
import {
  optionalHttpsUrl,
  requiredText,
  SLUG_PATTERN,
} from "@/lib/schemas/common";

export const StoreSchema = z.object({
  name: requiredText("Name is required."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      SLUG_PATTERN,
      "Slug can contain only latin letters, digits and single hyphens.",
    ),
  logoUrl: optionalHttpsUrl("Logo URL must start with https://"),
  affiliateLink: optionalHttpsUrl("Affiliate link must start with https://"),
  websiteUrl: optionalHttpsUrl("Website URL must start with https://"),
  bannerUrl: optionalHttpsUrl("Banner URL must start with https://"),
  bannerLink: optionalHttpsUrl("Banner link must start with https://"),
});

export type StoreInput = z.infer<typeof StoreSchema>;
