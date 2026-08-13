import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getCategoriesWithCoupons } from "@/lib/coupons";
import Link from "next/link";

export const metadata: Metadata = {
    title: "All Coupon Categories",
    description:
        "Explore promo codes and discounts by category. Find verified deals on fashion, shoes, accessories, and more.",
    alternates: {
        canonical: "/categories",
    },
};

export default async function CategoriesPage() {
    const categories = await getCategoriesWithCoupons();

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Categories" },
                ]}
            />

            <h1 className="font-display text-3xl font-black text-ink">
                All Categories
            </h1>
            <p className="mt-2 text-ink/60">
                Browse verified promo codes and deals by product category.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="group rounded-xl border border-ink/10 bg-white p-5 transition-all hover:border-accent hover:shadow-md"
                    >
                        <h2 className="font-display text-lg font-bold text-ink group-hover:text-accent">
                            {category.label}
                        </h2>
                        <p className="mt-1 text-sm text-ink/60">
                            {category.count} active deals
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}