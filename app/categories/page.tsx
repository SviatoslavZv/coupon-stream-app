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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Categories" },
                ]}
            />

            <h1 className="font-display text-2xl sm:text-3xl font-black text-ink">
                All Categories
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-ink/60">
                Browse verified promo codes and deals by product category.
            </p>

            {/* Мобильная адаптивная сетка: 2 колонки на смартфонах, 3 на планшетах/десктопе */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {categories.map((category) => (
                    <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-3.5 sm:p-5 transition-all hover:border-coupon hover:shadow-md active:scale-[0.98]"
                    >
                        <div>
                            <h2 className="font-display text-base sm:text-lg font-bold text-ink transition group-hover:text-coupon">
                                {category.label}
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-ink/50">
                                {category.count} active {category.count === 1 ? "deal" : "deals"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}