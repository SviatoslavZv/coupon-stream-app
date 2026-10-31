// lib/schemas/guides.ts

import { z } from "zod";
import { CATEGORIES, GENDERS } from "@/lib/constants/taxonomy";
import { SALES_CALENDAR } from "@/lib/constants/sales-calendar";
import { slugify } from "@/lib/utils";
import {
  SLUG_PATTERN,
  checkbox,
  optionalOneOf,
  optionalText,
  requiredText,
} from "@/lib/schemas/common";

export const META_DESCRIPTION_MAX = 160;

export const GuideSchema = z
  .object({
    title: requiredText("Title is required"),
    slug: optionalText,
    intro: requiredText("Intro is required"),
    metaDescription: optionalText.refine(
      (value) => value === null || value.length <= META_DESCRIPTION_MAX,
      {
        message: `Meta description must be ${META_DESCRIPTION_MAX} characters or less`,
      },
    ),
    category: optionalOneOf(
      CATEGORIES.map((category) => category.slug),
      "Choose a category from the list",
    ),
    gender: optionalOneOf(
      GENDERS.map((gender) => gender.slug),
      "Choose a gender from the list",
    ),
    eventSlug: optionalOneOf(
      SALES_CALENDAR.map((event) => event.slug),
      "Choose an event from the list",
    ),
    isPublished: checkbox,
  })
  .transform((data) => ({ ...data, slug: data.slug ?? slugify(data.title) }))
  .refine((data) => SLUG_PATTERN.test(data.slug), {
    message:
      "Slug can only contain lowercase letters, digits and single hyphens",
    path: ["slug"],
  });

export type GuideInput = z.infer<typeof GuideSchema>;
