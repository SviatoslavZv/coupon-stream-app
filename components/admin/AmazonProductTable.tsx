import Link from "next/link";
import { getSubcategories, CATEGORIES } from "@/lib/constants/taxonomy";
import { amazonProductUrl } from "@/lib/constants/amazon";
import { buildImportHref, type AmazonModel } from "@/lib/amazon-import";
import { suggestTaxonomy, type TaxonomySuggestion } from "@/lib/amazon-taxonomy";
import type { AmazonImportFilters } from "@/lib/schemas/amazon-import";
import type { ImportedAsins } from "@/lib/amazon-imported";
import AdminTableFrame from "@/components/admin/AdminTableFrame";

const CELL_CLASS = "px-3 py-3 align-top";
const HEAD_CLASS = "px-3 py-3 font-medium text-ink/60";

function formatTaxonomy(suggestion: TaxonomySuggestion): string {
    const category = CATEGORIES.find((item) => item.slug === suggestion.category);
    const subcategory = getSubcategories(suggestion.category ?? "").find(
        (item) => item.slug === suggestion.subcategory,
    );
    return `${category?.label ?? "—"} / ${subcategory?.label ?? "—"}`;
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


                        return (
                            <tr key={product.parentAsin} className="border-b border-line last:border-0">
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
                                        <Link href={brandHref} prefetch={false} className="underline hover:text-coupon-dark">
                                            {product.brandName}
                                        </Link>{" "}
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
                                    {(hasCoupon || hasLink) && (
                                        <p className="mt-1 flex flex-wrap gap-1">
                                            {hasCoupon && (
                                                <span className="rounded-full bg-coupon/10 px-2 py-0.5 text-xs font-semibold text-coupon-dark">
                                                    Coupon added
                                                </span>
                                            )}
                                            {hasLink && (
                                                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink/70">
                                                    Product link added
                                                </span>
                                            )}
                                        </p>
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
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </AdminTableFrame>
    );
}