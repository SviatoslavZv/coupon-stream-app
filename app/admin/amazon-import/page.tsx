import Form from "next/form";
import { requireAdmin } from "@/lib/auth";
import { parseAmazonImportParams } from "@/lib/schemas/amazon-import";
import {
    searchAmazonProducts,
    partnerBoostPortalUrl,
    type AmazonProductPage,
} from "@/lib/partnerboost";
import { groupByModel, filterByMinReviews, sortModels, buildImportHref } from "@/lib/amazon-import";
import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/constants/admin";
import { getImportedAsins } from "@/lib/amazon-imported";
import { getBrands } from "@/lib/brands";
import type { AmazonImportFilters } from "@/lib/schemas/amazon-import";
import AmazonProductTable from "@/components/admin/AmazonProductTable";

import {
    MAX_ASINS_PER_SEARCH,
    AMAZON_CATEGORIES,
    AMAZON_IMPORT_SORTS,
    AMAZON_IMPORT_SORT_LABELS,
} from "@/lib/constants/amazon";

const FIELD_CLASS =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";

type SearchResult =
    | { ok: true; page: AmazonProductPage }
    | { ok: false; message: string };

async function runSearch(filters: AmazonImportFilters): Promise<SearchResult> {
    try {
        // ASIN search ignores the other filters: we already know what we want
        const page =
            filters.asins.length > 0
                ? await searchAmazonProducts({ asins: filters.asins })
                : await searchAmazonProducts({
                    category: filters.category,
                    subcategory: filters.sub,
                    brandId: filters.brand,
                    onlyWithCoupon: filters.coupon,
                    cursor: filters.cursor,
                });
        return { ok: true, page };
    } catch (error) {
        return {
            ok: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export default async function AmazonImportPage(props: PageProps<"/admin/amazon-import">) {
    await requireAdmin();

    const filters = parseAmazonImportParams(await props.searchParams);
    const byAsin = filters.asins.length > 0;
    const canSearch = byAsin || filters.brand !== undefined || filters.sub !== undefined;
    const result = canSearch ? await runSearch(filters) : null;
    const allModels = result?.ok ? groupByModel(result.page.products) : [];
    // An ASIN we asked for is shown even with few reviews
    const minReviews = byAsin ? undefined : filters.minReviews;
    const models = sortModels(filterByMinReviews(allModels, minReviews), filters.sort);
    const foundAsins = new Set(result?.ok ? result.page.products.map((product) => product.asin) : []);
    const missingAsins = byAsin && result?.ok ? filters.asins.filter((asin) => !foundAsins.has(asin)) : [];
    const [imported, brands] = await Promise.all([
        getImportedAsins(models.flatMap((model) => model.variantAsins)),
        getBrands(),
    ]);
    const brandLabels = brands.map((brand) => brand.label);
    const nextHref =
        result?.ok && result.page.nextCursor
            ? buildImportHref(filters, { cursor: result.page.nextCursor })
            : null;
    const firstPageHref = filters.cursor ? buildImportHref(filters, { cursor: undefined }) : null;

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">

            <h1 className="mb-6 font-display text-2xl font-black text-ink">Amazon Import</h1>

            <Form
                key={buildImportHref(filters)}
                action={ADMIN_ROUTES.amazonImport}
                className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3"
            >
                <div className="col-span-2 sm:col-span-3">
                    <label htmlFor="asins" className={LABEL_CLASS}>
                        ASIN or Amazon link
                    </label>
                    <input
                        id="asins"
                        name="asins"
                        type="text"
                        placeholder="B07F2V9BQ2, B0BYSPKMZ7 or https://www.amazon.com/dp/…"
                        defaultValue={filters.asins.join(", ")}
                        className={FIELD_CLASS}
                    />
                    <p className="mt-1 text-xs text-ink/60">
                        Up to {MAX_ASINS_PER_SEARCH} at once. When filled, the other filters are ignored.
                    </p>
                </div>

                <div>
                    <label htmlFor="category" className={LABEL_CLASS}>
                        Amazon category
                    </label>
                    <select id="category" name="category" defaultValue={filters.category} className={FIELD_CLASS}>
                        {AMAZON_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="sub" className={LABEL_CLASS}>
                        Subcategory
                    </label>
                    <input
                        id="sub"
                        name="sub"
                        type="text"
                        placeholder="Boots, Sneakers…"
                        defaultValue={filters.sub ?? ""}
                        className={FIELD_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="brand" className={LABEL_CLASS}>
                        Brand ID
                    </label>
                    <input
                        id="brand"
                        name="brand"
                        type="number"
                        min={1}
                        placeholder="Click a brand in the results"
                        defaultValue={filters.brand ?? ""}
                        className={FIELD_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="minReviews" className={LABEL_CLASS}>
                        Min reviews
                    </label>
                    <input
                        id="minReviews"
                        name="minReviews"
                        type="number"
                        min={0}
                        placeholder="100"
                        defaultValue={filters.minReviews ?? ""}
                        className={FIELD_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="sort" className={LABEL_CLASS}>
                        Sort by
                    </label>
                    <select id="sort" name="sort" defaultValue={filters.sort} className={FIELD_CLASS}>
                        {AMAZON_IMPORT_SORTS.map((sort) => (
                            <option key={sort} value={sort}>
                                {AMAZON_IMPORT_SORT_LABELS[sort]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" name="coupon" value="1" defaultChecked={filters.coupon} />
                        Only with coupon
                    </label>
                </div>

                <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-3">
                    <button
                        type="submit"
                        className="rounded-full bg-coupon-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coupon"
                    >
                        Search
                    </button>
                    <a
                        href={partnerBoostPortalUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-coupon"
                    >
                        Search by keyword in PartnerBoost ↗
                    </a>
                </div>
            </Form>

            {!canSearch && (
                <p className="mt-6 text-sm text-ink/70">
                    Enter ASINs, a subcategory or a brand ID to search. Searching a whole category is
                    slow, so at least one of them is required.
                </p>
            )}

            {result && !result.ok && (
                <p className="mt-6 rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    Could not load products: {result.message}
                </p>
            )}

            {result?.ok && (
                <div className="mt-6">
                    <p className="mb-3 text-sm text-ink/70">
                        {models.length} models from {result.page.products.length} variants on this page
                        {allModels.length > models.length &&
                            ` · ${allModels.length - models.length} hidden by min reviews`}
                        {result.page.skipped > 0 && ` · ${result.page.skipped} skipped (invalid data)`}
                    </p>
                    {missingAsins.length > 0 && (
                        <p className="mb-3 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink/80">
                            Not available in PartnerBoost: {missingAsins.join(", ")}
                        </p>
                    )}
                    {models.length > 0 ? (
                        <AmazonProductTable
                            models={models}
                            filters={filters}
                            brandLabels={brandLabels}
                            imported={imported}
                        />
                    ) : (
                        <p className="text-sm text-ink/70">No products match these filters on this page.</p>
                    )}

                    {(nextHref || firstPageHref) && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {firstPageHref && (
                                <Link
                                    href={firstPageHref}
                                    prefetch={false}
                                    className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-coupon"
                                >
                                    ← First page
                                </Link>
                            )}
                            {nextHref && (
                                <Link
                                    href={nextHref}
                                    prefetch={false}
                                    className="rounded-full bg-coupon-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coupon"
                                >
                                    Show more →
                                </Link>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}