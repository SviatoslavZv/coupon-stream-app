import type { Metadata } from "next";
import Link from "next/link";
import StoreGrid from "@/components/store/StoreGrid";
import { getTopStores } from "@/lib/stores";



export const metadata: Metadata = {
  title: "CouponCreek — Hand-Picked Promo Codes & Deals for Fashion Stores",
  description:
    "Discover hand-picked promo codes, sales and shopping guides for your favorite fashion, shoe and apparel stores on CouponCreek.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const stores = await getTopStores(9);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 pb-6 animate-fade-in-up">
      <h1 className="font-display text-3xl font-black text-ink">
        Top Stores
      </h1>
      <p className="mt-2 text-ink/70">
        Hand-picked promo codes and deals from top fashion stores.
      </p>

      <StoreGrid stores={stores} />

      <div className="mt-6 text-center">
        <Link
          href="/stores"
          className="inline-flex items-center gap-1.5 rounded-full bg-coupon-dark px-6 py-2 text-sm font-bold text-white transition hover:bg-coupon active:scale-95"
        >
          View All Stores
          <span aria-hidden="true">→</span>
        </Link>
      </div>

    </div>
  );
}