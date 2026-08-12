import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BRANDS } from "@/lib/constants/taxonomy";
import { getCouponsByBrand, extractCategoryOptions } from "@/lib/coupons";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buildPageMetadata, notFoundMetadata } from "@/lib/metadata";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const brand = BRANDS.find((b) => b.slug === slug);

    if (!brand) {
        return notFoundMetadata("Brand Not Found");
    }

    const coupons = await getCouponsByBrand(brand.label, {});
    const monthYear = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return buildPageMetadata({
        title: `${brand.label} Coupons & Promo Codes at Department Stores — ${monthYear}`,
        description: `${coupons.length} verified ${brand.label} deals across top department stores for ${monthYear}. Compare ${brand.label} offers in one place on CouponCreek.`,
        path: `/brand/${slug}`,
    });
}



function buildFilterUrl(
    brandSlug: string,
    currentCategory: string | undefined,
    value: string
) {
    const params = new URLSearchParams();

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

    const brand = BRANDS.find((b) => b.slug === slug);

    if (!brand) {
        notFound();
    }

    const coupons = await getCouponsByBrand(brand.label, { category });
    const categoryOptions = extractCategoryOptions(coupons);

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">

            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Brands", href: "/brands" },
                    { label: brand.label },
                ]}
            />

            <h1 className="font-display text-3xl font-black text-ink">
                {brand.label} Deals
            </h1>
            <p className="mt-2 text-ink/60">
                {coupons.length} {coupons.length === 1 ? "offer" : "offers"} across
                department stores
            </p>

            {categoryOptions.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase text-ink/40">
                        Category
                    </span>
                    {categoryOptions.map(({ value, count }) => (
                        <Link
                            key={value}
                            href={buildFilterUrl(slug, category, value)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${category === value
                                ? "border-coupon bg-coupon text-white"
                                : "border-line text-ink/70 hover:border-ink"
                                }`}
                        >
                            {value} ({count})
                        </Link>
                    ))}
                </div>
            )}

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
                    <p className="text-ink/50">No offers found for this brand yet.</p>
                )}
            </div>
        </div>
    );
}