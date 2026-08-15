import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getBrandsWithCoupons } from "@/lib/coupons";
import Link from "next/link";

export const metadata: Metadata = {
    title: "All Brands & Promo Codes",
    description:
        "Browse top fashion and lifestyle brands with active promo codes, exclusive discounts, and verified coupon deals.",
    alternates: {
        canonical: "/brands",
    },
};

export default async function BrandsPage() {
    const brands = await getBrandsWithCoupons();

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Brands" },
                ]}
            />

            <h1 className="font-display text-2xl sm:text-3xl font-black text-ink">
                All Brands
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-ink/60">
                Discover verified promo codes and sales for leading fashion brands.
            </p>

            {/* Сетка брендов: 2 колонки на мобилках */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {brands.map((brand) => (
                    <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-3.5 sm:p-5 transition-all hover:border-coupon hover:shadow-md active:scale-[0.98]"
                    >
                        <div>
                            <h2 className="font-display text-base sm:text-lg font-bold text-ink transition group-hover:text-coupon">
                                {brand.label}
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-ink/50">
                                {brand.count} active {brand.count === 1 ? "offer" : "offers"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}