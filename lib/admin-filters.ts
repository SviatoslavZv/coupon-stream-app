// lib/admin-filters.ts

import type { AdminCouponRow } from "@/lib/coupons";
import type { AdminShopLink } from "@/lib/shop-links";
import type {
  AdminCouponFilters,
  AdminLinkFilters,
} from "@/lib/schemas/admin-filters";
import { isCouponExpired } from "@/lib/utils";

/** Case-insensitive "contains" over several text fields. */
function matchesText(
  query: string | undefined,
  fields: readonly (string | null | undefined)[],
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

/** Links that pass the search box, the store and the active/hidden filters. Pure function. */
export function filterAdminShopLinks(
  links: readonly AdminShopLink[],
  { q, store, status }: AdminLinkFilters,
): AdminShopLink[] {
  return links.filter((link) => {
    if (store && link.storeId !== store) return false;
    if (status === "active" && !link.isActive) return false;
    if (status === "hidden" && link.isActive) return false;

    return matchesText(q, [link.title, link.brand, link.asin, link.storeName]);
  });
}

/** Filters that are actually set, as address parameters. "all" is the default, so it is left out. */
export function activeFilterParams({
  q,
  store,
  status,
}: AdminCouponFilters | AdminLinkFilters): Record<string, string> {
  return {
    ...(q ? { q } : {}),
    ...(store ? { store } : {}),
    ...(status !== "all" ? { status } : {}),
  };
}
