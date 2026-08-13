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
        <div className="mx-auto max-w-6xl px-4 py-10">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Brands" },
                ]}
            />

            <h1 className="font-display text-3xl font-black text-ink">
                All Brands
            </h1>
            <p className="mt-2 text-ink/60">
                Discover verified promo codes and sales for leading fashion brands.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 font-display">
                {brands.map((brand) => (
                    <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="group rounded-xl border border-ink/10 bg-white p-5 transition-all hover:border-accent hover:shadow-md"
                    >
                        <h2 className="text-lg font-bold text-ink group-hover:text-accent">
                            {brand.label}
                        </h2>
                        <p className="mt-1 text-sm text-ink/60 font-sans">
                            {brand.count} active offers
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}