// lib/schemas/common.ts

import { z } from "zod";

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

export const checkbox = z.preprocess((value) => value === "on", z.boolean());

export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the fields and try again.";
}
