// lib/admin-filters.ts

import type { AdminCouponRow } from "@/lib/coupons";
import type { AdminCouponFilters } from "@/lib/schemas/admin-filters";
import { isCouponExpired } from "@/lib/utils";

/** Case-insensitive "contains" over several text fields. */
function matchesText(
  query: string | undefined,
  fields: readonly (string | undefined)[],
): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

/** Coupons that pass the search box, the store and the status filters. Pure function. */
export function filterAdminCoupons(
  coupons: readonly AdminCouponRow[],
  { q, store, status }: AdminCouponFilters,
): AdminCouponRow[] {
  return coupons.filter((coupon) => {
    if (store && coupon.storeId !== store) return false;

    const expired = isCouponExpired(coupon.expiresAt);
    if (status === "active" && expired) return false;
    if (status === "expired" && !expired) return false;

    return matchesText(q, [
      coupon.title,
      coupon.discountLabel,
      coupon.code,
      coupon.storeName,
    ]);
  });
}
