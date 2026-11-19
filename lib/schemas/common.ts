// lib/schemas/common.ts

import { z } from "zod";

/** Query string values as Next.js passes them to a page. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Keeps the first value of a repeated parameter (?q=a&q=b → "a"). */
export function flattenSearchParams(
  raw: RawSearchParams,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export function blankToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export function emptyToNull(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

export const requiredText = (message: string) =>
  z.string().trim().min(1, message);

export const optionalText = z.preprocess(
  emptyToNull,
  z.string().trim().nullable(),
);

export const httpsUrl = (message: string) =>
  z.string().trim().startsWith("https://", message);

export const optionalHttpsUrl = (message: string) =>
  z.preprocess(emptyToNull, httpsUrl(message).nullable());

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function optionalOneOf(values: readonly string[], message: string) {
  const allowed = new Set(values);
  return optionalText.refine((value) => value === null || allowed.has(value), {
    message,
  });
}

export const checkbox = z.preprocess((value) => value === "on", z.boolean());

export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the fields and try again.";
}
