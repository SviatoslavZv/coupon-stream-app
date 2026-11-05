import Form from "next/form";
import { requireAdmin } from "@/lib/auth";
import { parseAmazonImportParams } from "@/lib/schemas/amazon-import";
import { searchAmazonProducts, type AmazonProductPage } from "@/lib/partnerboost";
import { groupByModel, filterByMinReviews, sortModels, buildImportHref } from "@/lib/amazon-import";
import Link from "next/link";
import { getImportedAsins } from "@/lib/amazon-imported";
import { BRANDS } from "@/lib/constants/taxonomy";
import type { AmazonImportFilters } from "@/lib/schemas/amazon-import";
import AmazonProductTable from "@/components/admin/AmazonProductTable";
import {
    AMAZON_CATEGORIES,
    AMAZON_IMPORT_SORTS,
    AMAZON_IMPORT_SORT_LABELS,
} from "@/lib/constants/amazon";

const FIELD_CLASS =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";

const brandLabels = BRANDS.map((brand) => brand.label);

type SearchResult =
    | { ok: true; page: AmazonProductPage }
    | { ok: false; message: string };

async function runSearch(filters: AmazonImportFilters): Promise<SearchResult> {
    try {
        const page = await searchAmazonProducts({
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
    const canSearch = filters.brand !== undefined || filters.sub !== undefined;
    const result = canSearch ? await runSearch(filters) : null;
    const allModels = result?.ok ? groupByModel(result.page.products) : [];
    const models = sortModels(filterByMinReviews(allModels, filters.minReviews), filters.sort);
    const imported = await getImportedAsins(models.flatMap((model) => model.variantAsins));
    const nextHref =
        result?.ok && result.page.nextCursor
            ? buildImportHref(filters, { cursor: result.page.nextCursor })
            : null;
    const firstPageHref = filters.cursor ? buildImportHref(filters, { cursor: undefined }) : null;

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">Amazon Import</h1>

            <Form
                action="/admin/amazon-import"
                className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3"
            >
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
                        placeholder="137088"
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

                <div className="col-span-2 sm:col-span-3">
                    <button
                        type="submit"
                        className="rounded-full bg-coupon-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coupon"
                    >
                        Search
                    </button>
                </div>
            </Form>

            {!canSearch && (
                <p className="mt-6 text-sm text-ink/70">
                    Enter a subcategory or a brand ID to search. Searching a whole category is slow,
                    so at least one of them is required.
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