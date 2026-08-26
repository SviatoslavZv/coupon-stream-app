import type { Metadata } from "next";
import Link from "next/link";
import StoreGrid from "@/components/store/StoreGrid";
import { getTopStores } from "@/lib/stores";



export const metadata: Metadata = {
  title: "CouponCreek — Verified Promo Codes & Discounts for Top Stores",
  description:
    "Discover daily updated promo codes, discount coupons, and exclusive sales for your favorite fashion and retail stores on CouponCreek.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const stores = await getTopStores(6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-fade-in-up">
      <h1 className="font-display text-3xl font-black text-ink">
        Top Stores
      </h1>
      <p className="mt-2 text-ink/70">
        Verified promo codes and deals, updated daily.
      </p>

      <StoreGrid stores={stores} />

      <div className="mt-8 text-center">
        <Link
          href="/stores"
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition hover:border-coupon-dark hover:text-coupon-dark"
        >
          View All Stores
          <span aria-hidden="true">→</span>
        </Link>
      </div>

    </div>
  );
}