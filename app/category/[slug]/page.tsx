import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/taxonomy";
import { getCouponsByCategory, extractFilterOptions } from "@/lib/coupons";

function buildFilterUrl(
    categorySlug: string,
    currentFilters: Record<string, string | undefined>,
    key: string,
    value: string
) {
    const params = new URLSearchParams();

    for (const [k, v] of Object.entries(currentFilters)) {
        if (v && k !== key) params.set(k, v);
    }

    if (currentFilters[key] !== value) {
        params.set(key, value);
    }

    const queryString = params.toString();
    return `/category/${categorySlug}${queryString ? `?${queryString}` : ""}`;
}

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ subcategory?: string; gender?: string; brand?: string }>;
}) {
    const { slug } = await params;
    const filters = await searchParams;

    const category = CATEGORIES.find((c) => c.slug === slug);

    if (!category) {
        notFound();
    }

    const coupons = await getCouponsByCategory(slug, filters);
    const filterOptions = extractFilterOptions(coupons);

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="font-display text-3xl font-black text-ink">
                {category.label} Deals
            </h1>
            <p className="mt-2 text-ink/60">
                {coupons.length} {coupons.length === 1 ? "offer" : "offers"} across all stores
            </p>

            <div className="mt-6 flex flex-col gap-3">
                {filterOptions.subcategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase text-ink/40">
                            Subcategory
                        </span>
                        {filterOptions.subcategories.map((sub) => (
                            <Link
                                key={sub}
                                href={buildFilterUrl(slug, filters, "subcategory", sub)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${filters.subcategory === sub
                                    ? "border-coupon bg-coupon text-white"
                                    : "border-line text-ink/70 hover:border-ink"
                                    }`}
                            >
                                {sub}
                            </Link>
                        ))}
                    </div>
                )}

                {filterOptions.genders.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase text-ink/40">
                            Gender
                        </span>
                        {filterOptions.genders.map((g) => (
                            <Link
                                key={g}
                                href={buildFilterUrl(slug, filters, "gender", g)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${filters.gender === g
                                    ? "border-coupon bg-coupon text-white"
                                    : "border-line text-ink/70 hover:border-ink"
                                    }`}
                            >
                                {g}
                            </Link>
                        ))}
                    </div>
                )}

                {filterOptions.brands.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium uppercase text-ink/40">
                            Brand
                        </span>
                        {filterOptions.brands.map((b) => (
                            <Link
                                key={b}
                                href={buildFilterUrl(slug, filters, "brand", b)}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${filters.brand === b
                                    ? "border-coupon bg-coupon text-white"
                                    : "border-line text-ink/70 hover:border-ink"
                                    }`}
                            >
                                {b}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-col gap-3">
                {coupons.length > 0 ? (
                    coupons.map((coupon) => (
                        <Link
                            key={coupon.id}
                            href={`/store/${coupon.storeSlug}`}
                            className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 transition hover:shadow-md"
                        >
                            <div>
                                <span className="font-mono text-xs uppercase tracking-wide text-ink/40">
                                    {coupon.storeName}
                                </span>
                                <h3 className="font-medium text-ink">{coupon.title}</h3>
                            </div>
                            <span className="font-display text-lg font-black text-coupon">
                                {coupon.discountLabel}
                            </span>
                        </Link>
                    ))
                ) : (
                    <p className="text-ink/50">No offers found for this filter.</p>
                )}
            </div>
        </div>
    );
}