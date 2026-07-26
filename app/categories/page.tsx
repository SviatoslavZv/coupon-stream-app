import Link from "next/link";
import { getCategoriesWithCoupons } from "@/lib/coupons";

export default async function CategoriesPage() {
    const categories = await getCategoriesWithCoupons();

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="font-display text-3xl font-black text-ink">
                Categories
            </h1>
            <p className="mt-2 text-ink/60">
                Browse deals by category across every store.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/category/${category.slug}`}
                            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                        >
                            {category.label}{" "}
                            <span className="text-ink/40">({category.count})</span>
                        </Link>
                    ))
                ) : (
                    <p className="text-ink/50">No category deals available yet.</p>
                )}
            </div>
        </div>
    );
}