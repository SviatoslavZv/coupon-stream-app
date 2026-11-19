// lib/admin-dashboard.ts

import type { AdminCouponRow } from "@/lib/coupons";
import type { AdminGuideRow } from "@/lib/guides";
import type { AdminShopLink } from "@/lib/shop-links";
import type { Store } from "@/types";
import { EXPIRING_SOON_DAYS } from "@/lib/constants/admin";
import { isCouponExpired } from "@/lib/utils";

export interface DashboardCounts {
  stores: number;
  activeCoupons: number;
  expiredCoupons: number;
  activeLinks: number;
  publishedGuides: number;
}

export interface DashboardSummary {
  counts: DashboardCounts;
  /** Active coupons whose last day is today or within EXPIRING_SOON_DAYS, soonest first. */
  expiringCoupons: AdminCouponRow[];
  /** Active links the nightly check marked as not found, out of stock or without commission. */
  problemLinks: AdminShopLink[];
  draftGuides: AdminGuideRow[];
}

/** YYYY-MM-DD of the day `days` after `now`, in UTC: the same format as expires_at. */
function isoDayAfter(now: Date, days: number): string {
  const day = new Date(now);
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
}

/** Everything the dashboard shows, computed from the admin lists. Pure function. */
export function buildDashboardSummary(
  data: {
    stores: readonly Store[];
    coupons: readonly AdminCouponRow[];
    links: readonly AdminShopLink[];
    guides: readonly AdminGuideRow[];
  },
  now: Date = new Date(),
): DashboardSummary {
  const activeCoupons = data.coupons.filter(
    (coupon) => !isCouponExpired(coupon.expiresAt),
  );
  const lastSoonDay = isoDayAfter(now, EXPIRING_SOON_DAYS);
  const draftGuides = data.guides.filter((guide) => !guide.isPublished);

  return {
    counts: {
      stores: data.stores.length,
      activeCoupons: activeCoupons.length,
      expiredCoupons: data.coupons.length - activeCoupons.length,
      activeLinks: data.links.filter((link) => link.isActive).length,
      publishedGuides: data.guides.length - draftGuides.length,
    },
    // Dates are YYYY-MM-DD strings, so comparing them as text compares them as dates.
    // A coupon without a date never expires, so it is never "soon".
    expiringCoupons: activeCoupons
      .filter(
        (coupon) =>
          Boolean(coupon.expiresAt) && coupon.expiresAt <= lastSoonDay,
      )
      .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt)),
    problemLinks: data.links.filter(
      (link) =>
        link.isActive && link.checkStatus !== null && link.checkStatus !== "ok",
    ),
    draftGuides,
  };
}
