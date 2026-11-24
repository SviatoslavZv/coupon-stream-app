import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBrandBySlug } from "@/lib/brands";
import { getCouponsByBrand, extractCategoryOptions } from "@/lib/coupons";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BrandStructuredData from "@/components/seo/BrandStructuredData";
import { buildPageMetadata, notFoundMetadata } from "@/lib/metadata";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const brand = await getBrandBySlug(slug);

    if (!brand) {
        return notFoundMetadata("Brand Not Found");
    }

    const allCoupons = await getCouponsByBrand(brand.label, {});
    const now = new Date();
    const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    // Short month in the title keeps it under ~60 characters with the " | CouponCreek" suffix
    const shortMonthYear = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    return buildPageMetadata({
        title: `${brand.label} Coupons & Deals ${shortMonthYear}`,
        description: `${allCoupons.length} active ${brand.label} deals across top department stores for ${monthYear}. Compare ${brand.label} offers in one place on CouponCreek.`,
        path: `/brand/${brand.slug}`,
    });
}

function buildFilterUrl(
    brandSlug: string,
    currentCategory: string | undefined,
    value: string
) {
    const params = new URLSearchParams();

    // A toggle: clicking the selected filter again clears it
    if (currentCategory !== value) {
        params.set("category", value);
    }

    const queryString = params.toString();
    return `/brand/${brandSlug}${queryString ? `?${queryString}` : ""}`;
}

export default async function BrandPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ category?: string }>;
}) {
    const { slug } = await params;
    const { category } = await searchParams;

    const brand = await getBrandBySlug(slug);

    if (!brand) {
        notFound();
    }

    const allBrandCoupons = await getCouponsByBrand(brand.label, {});
    const categoryOptions = extractCategoryOptions(allBrandCoupons);

    const hasActiveFilters = Boolean(category);

    const displayedCoupons = hasActiveFilters
        ? await getCouponsByBrand(brand.label, { category })
        : allBrandCoupons;

    return (
        <div className="mx-auto max-w-4xl px-4 py-10  animate-fade-in-up">
            <BrandStructuredData
                brandName={brand.label}
                brandSlug={slug}
                coupons={displayedCoupons}
            />

            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Brands", href: "/brands" },
                    { label: brand.label },
                ]}
            />

            <div className="flex items-baseline justify-between">
                <div>
                    <h1 className="font-display text-3xl font-black text-ink">
                        {brand.label} Deals
                    </h1>
                    <p className="mt-2 text-ink/70">
                        {displayedCoupons.length}{" "}
                        {displayedCoupons.length === 1 ? "offer" : "offers"} across department stores
                    </p>
                </div>

                {/* Clear the category filter */}
                {hasActiveFilters && (
                    <Link
                        href={`/brand/${slug}`}
                        className="text-xs font-semibold text-coupon-dark hover:underline transition"
                    >
                        ✕ Clear filter
                    </Link>
                )}
            </div>

            {/* Category filters */}
            {categoryOptions.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase text-ink/80">
                        Category
                    </span>
                    {categoryOptions.map(({ value, count }) => (
                        <Link
                            key={value}
                            href={buildFilterUrl(slug, category, value)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${category === value
                                ? "border-coupon-dark bg-coupon-dark text-white"
                                : "border-line text-ink/70 hover:border-ink"
                                }`}
                        >
                            {value} ({count})
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8 flex flex-col gap-3">
                {displayedCoupons.length > 0 ? (
                    displayedCoupons.map((coupon) => (
                        <Link
                            key={coupon.id}
                            href={`/store/${coupon.storeSlug}`}
                            className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 transition hover:shadow-md"
                        >
                            <div>
                                <span className="font-mono text-xs uppercase tracking-wide text-ink/80">
                                    {coupon.storeName}
                                </span>
                                <h2 className="font-medium text-ink">{coupon.title}</h2>
                            </div>
                            <span className="font-display text-lg font-black text-coupon-dark">
                                {coupon.discountLabel}
                            </span>
                        </Link>
                    ))
                ) : (
                    <div className="text-ink/60">
                        <p>No offers found for this category.</p>
                        <Link
                            href={`/brand/${slug}`}
                            className="mt-2 inline-block text-coupon-dark hover:underline"
                        >
                            Clear filters
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}