// lib/cron.ts

import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Пускает только запросы от Vercel Cron: заголовок Authorization: Bearer <CRON_SECRET>.
 * Если CRON_SECRET не задан — не пускает никого.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
