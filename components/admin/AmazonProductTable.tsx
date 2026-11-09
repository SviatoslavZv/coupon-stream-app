import Link from "next/link";
import { getSubcategories, CATEGORIES } from "@/lib/constants/taxonomy";
import { buildImportHref, type AmazonModel } from "@/lib/amazon-import";
import { suggestTaxonomy, type TaxonomySuggestion } from "@/lib/amazon-taxonomy";
import type { AmazonImportFilters } from "@/lib/schemas/amazon-import";
import type { ImportedAsins } from "@/lib/amazon-imported";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import type { ReactNode } from "react";
import type { AmazonProduct } from "@/lib/partnerboost";
import { AMAZON_IMPORT_PATH, amazonProductUrl } from "@/lib/constants/amazon";

const CELL_CLASS = "px-3 py-3 align-top";
const HEAD_CLASS = "px-3 py-3 font-medium text-ink/60";

const IMPORT_LABELS = {
    addProduct: "Add product →",
    addToGuide: "Add to guide →",
    storeCoupon: "Store coupon →",
    storeCouponAdded: "✓ Store coupon added",
    productAdded: "✓ Product added",
} as const;

function formatTaxonomy(suggestion: TaxonomySuggestion): string {
    const category = CATEGORIES.find((item) => item.slug === suggestion.category);
    const subcategory = getSubcategories(suggestion.category ?? "").find(
        (item) => item.slug === suggestion.subcategory,
    );
    return `${category?.label ?? "—"} / ${subcategory?.label ?? "—"}`;
}

function importActions({
    product,
    hasCoupon,
    hasLink,
    couponHref,
    linkHref,
}: {
    product: AmazonProduct;
    hasCoupon: boolean;
    hasLink: boolean;
    couponHref: string;
    linkHref: string;
}): ReactNode {
    if (product.commissionPercent === null) {
        return <span className="text-xs font-semibold text-coupon">No commission</span>;
    }
    if (!product.inStock) {
        return <span className="text-xs font-semibold text-coupon">Out of stock</span>;
    }

    return (
        <div className="flex flex-col items-start gap-1.5">
            <Link
                href={linkHref}
                prefetch={false}
                className="inline-block whitespace-nowrap rounded-full bg-coupon-dark px-3 py-1.5 text-xs font-bold text-white transition hover:bg-coupon"
            >
                {hasLink ? IMPORT_LABELS.addToGuide : IMPORT_LABELS.addProduct}
            </Link>
            {hasCoupon ? (
                <span className="text-xs font-semibold text-green-700">{IMPORT_LABELS.storeCouponAdded}</span>
            ) : (
                product.couponPercent !== null && (
                    <Link
                        href={couponHref}
                        prefetch={false}
                        title="Adds a separate coupon to the Amazon store page, not to a guide"
                        className="whitespace-nowrap text-xs text-ink/60 underline hover:text-coupon-dark"
                    >
                        {IMPORT_LABELS.storeCoupon}
                    </Link>
                )
            )}
        </div>
    );
}

export default function AmazonProductTable({
    models,
    filters,
    brandLabels,
    imported,
}: {
    models: AmazonModel[];
    filters: AmazonImportFilters;
    brandLabels: readonly string[];
    imported: ImportedAsins;
}) {
    const currentHref = buildImportHref(filters);
    return (
        <AdminTableFrame>
            <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-paper">
                    <tr>
                        <th className={HEAD_CLASS}>Photo</th>
                        <th className={HEAD_CLASS}>Product</th>
                        <th className={HEAD_CLASS}>Coupon</th>
                        <th className={HEAD_CLASS}>Comm.</th>
                        <th className={HEAD_CLASS}>Rating</th>
                        <th className={HEAD_CLASS}>Price</th>
                        <th className={HEAD_CLASS}>Suggested</th>
                        <th className={HEAD_CLASS}>Import</th>
                    </tr>
                </thead>
                <tbody>
                    {models.map(({ product, variantAsins }) => {
                        const suggestion = suggestTaxonomy(product, brandLabels);
                        const brandHref = buildImportHref(filters, {
                            brand: product.brandId,
                            sub: undefined,
                            cursor: undefined,
                        });
                        const hasCoupon = variantAsins.some((asin) => imported.coupons.has(asin));
                        const hasLink = variantAsins.some((asin) => imported.links.has(asin));
                        const returnParam = `returnTo=${encodeURIComponent(currentHref)}`;
                        const couponHref = `${AMAZON_IMPORT_PATH}/coupon/${product.asin}?${returnParam}`;
                        const linkHref = `${AMAZON_IMPORT_PATH}/link/${product.asin}?${returnParam}`;

                        return (
                            <tr
                                key={product.parentAsin}
                                className={`border-b border-line last:border-0 ${hasCoupon || hasLink ? "bg-green-50" : ""}`}
                            >
                                <td className={CELL_CLASS}>
                                    {product.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            loading="lazy"
                                            className="h-16 w-16 rounded-lg object-contain"
                                        />
                                    ) : (
                                        <span className="text-xs text-ink/40">No photo</span>
                                    )}
                                </td>

                                <td className={`${CELL_CLASS} max-w-xs`}>
                                    <p className="font-medium leading-snug text-ink">{product.name}</p>
                                    <p className="mt-1 text-xs text-ink/60">
                                        {filters.brand === product.brandId ? (
                                            <span>{product.brandName}</span>
                                        ) : (
                                            <Link
                                                href={brandHref}
                                                prefetch={false}
                                                className="underline hover:text-coupon-dark"
                                            >
                                                {product.brandName}
                                            </Link>
                                        )}{" "}
                                        #{product.brandId} · {product.asin} · {variantAsins.length}{" "}
                                        {variantAsins.length === 1 ? "variant" : "variants"}
                                        {!product.inStock && (
                                            <span className="ml-1 font-semibold text-coupon">· out of stock</span>
                                        )}
                                    </p>
                                    <a
                                        href={amazonProductUrl(product.asin)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-block text-xs text-coupon-dark underline"
                                    >
                                        Check on Amazon ↗
                                    </a>
                                    {hasLink && (
                                        <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                                            {IMPORT_LABELS.productAdded}
                                        </span>
                                    )}
                                    {hasCoupon && (
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                            {IMPORT_LABELS.storeCouponAdded}
                                        </span>
                                    )}
                                </td>
                                <td className={`${CELL_CLASS} font-semibold text-coupon-dark`}>
                                    {product.couponPercent ? `${product.couponPercent}%` : "—"}
                                </td>

                                <td className={CELL_CLASS}>
                                    {product.commissionPercent ? `${product.commissionPercent}%` : "—"}
                                </td>

                                <td className={`${CELL_CLASS} whitespace-nowrap`}>
                                    {product.rating ? `★ ${product.rating}` : "—"}
                                    <span className="block text-xs text-ink/60">
                                        {product.reviews.toLocaleString("en-US")} reviews
                                    </span>
                                </td>

                                <td className={`${CELL_CLASS} whitespace-nowrap`}>
                                    {product.currentPrice ?? "—"}
                                    {product.listPrice && product.listPrice !== product.currentPrice && (
                                        <span className="block text-xs text-ink/50 line-through">
                                            {product.listPrice}
                                        </span>
                                    )}
                                </td>

                                <td className={`${CELL_CLASS} text-xs text-ink/70`}>
                                    {formatTaxonomy(suggestion)}
                                    <span className="block">
                                        {suggestion.gender ?? "—"} · {suggestion.brand ?? "no brand"}
                                    </span>
                                </td>

                                <td className={CELL_CLASS}>
                                    {importActions({ product, hasCoupon, hasLink, couponHref, linkHref })}
                                </td>

                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </AdminTableFrame>
    );
}