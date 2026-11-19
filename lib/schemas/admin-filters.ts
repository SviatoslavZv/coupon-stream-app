// lib/schemas/admin-filters.ts

import { z } from "zod";
import {
  blankToUndefined,
  flattenSearchParams,
  type RawSearchParams,
} from "@/lib/schemas/common";

const SEARCH_MAX_LENGTH = 100;

export const COUPON_STATUS_FILTERS = ["all", "active", "expired"] as const;
export type CouponStatusFilter = (typeof COUPON_STATUS_FILTERS)[number];

export const COUPON_STATUS_LABELS: Record<CouponStatusFilter, string> = {
  all: "All coupons",
  active: "Active",
  expired: "Expired",
};

// .catch(): a broken or hand-edited address falls back to "no filter" instead of an error page
const searchText = z
  .preprocess(
    blankToUndefined,
    z.string().trim().max(SEARCH_MAX_LENGTH).optional(),
  )
  .catch(undefined);
const storeId = z
  .preprocess(blankToUndefined, z.uuid().optional())
  .catch(undefined);

const AdminCouponFiltersSchema = z.object({
  q: searchText,
  store: storeId,
  status: z.enum(COUPON_STATUS_FILTERS).catch("all"),
});

export type AdminCouponFilters = z.infer<typeof AdminCouponFiltersSchema>;

export function parseAdminCouponFilters(
  raw: RawSearchParams,
): AdminCouponFilters {
  return AdminCouponFiltersSchema.parse(flattenSearchParams(raw));
}
