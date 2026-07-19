import Link from "next/link";
import { getBrandsWithCoupons } from "@/lib/coupons";

export default async function BrandsPage() {
    const brands = await getBrandsWithCoupons();

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="font-display text-3xl font-black text-ink">Brands</h1>
            <p className="mt-2 text-ink/60">
                Browse deals by brand across every department store.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
                {brands.length > 0 ? (
                    brands.map((brand) => (
                        <Link
                            key={brand.slug}
                            href={`/brand/${brand.slug}`}
                            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                        >
                            {brand.label}{" "}
                            <span className="text-ink/40">({brand.count})</span>
                        </Link>
                    ))
                ) : (
                    <p className="text-ink/50">No brand deals available yet.</p>
                )}
            </div>
        </div>
    );
}