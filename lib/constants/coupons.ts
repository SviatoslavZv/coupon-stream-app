// lib/constants/coupons.ts

import { isOneOf } from "@/lib/utils";

/** Coupon kinds: a code to copy, or a sale that needs no code. Add a new kind here only. */
export const COUPON_TYPES = ["code", "sale"] as const;

export type CouponType = (typeof COUPON_TYPES)[number];

/**
 * coupons.type is plain text in the database. An unknown value is shown as a sale:
 * the visitor still gets the deal link, and a page never breaks because of one bad row.
 */
export function toCouponType(value: string): CouponType {
  return isOneOf(COUPON_TYPES, value) ? value : "sale";
}
