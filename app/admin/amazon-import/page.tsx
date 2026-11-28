import Form from "next/form";
import { requireAdmin } from "@/lib/auth";
import { parseAmazonImportParams } from "@/lib/schemas/amazon-import";
import {
    searchAmazonProducts,
    partnerBoostPortalUrl,
    type AmazonProductPage,
} from "@/lib/partnerboost";
import {
    groupByModel,
    filterModels,
    sortModels,
    buildImportHref,
    countSubcategories,
    HIDDEN_REASONS,
    type AmazonModel,
    type HiddenReason,
} from "@/lib/amazon-import";
import { GENDERS } from "@/lib/constants/taxonomy";
import { pluralize } from "@/lib/utils";
import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/constants/admin";
import { getImportedAsins } from "@/lib/amazon-imported";
import { getBrands } from "@/lib/brands";
import { getGuidesForAdmin } from "@/lib/guides";
import type { AmazonImportFilters } from "@/lib/schemas/amazon-import";
import AmazonProductTable from "@/components/admin/AmazonProductTable";

import {
    MAX_ASINS_PER_SEARCH,
    AMAZON_CATEGORIES,
    AMAZON_IMPORT_SORTS,
    AMAZON_IMPORT_SORT_LABELS,
    AMAZON_SUBCATEGORY_HINTS,
} from "@/lib/constants/amazon";

const FIELD_CLASS =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";
const SUBCATEGORY_LIST_ID = "subcategory-hints";

const HIDDEN_REASON_LABELS: Record<HiddenReason, string> = {
    reviews: "hidden by min reviews",
    rating: "hidden by min rating",
    gender: "hidden by gender",
    title: "hidden by title",
    imported: "already imported",
};

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
    const foundAsins = new Set(result?.ok ? result.page.products.map((product) => product.asin) : []);
    const missingAsins = byAsin && result?.ok ? filters.asins.filter((asin) => !foundAsins.has(asin)) : [];
    // Imported products are checked before filtering: "Hide imported" needs them
    const [imported, brands, guides] = await Promise.all([
        getImportedAsins(allModels.flatMap((model) => model.variantAsins)),
        getBrands(),
        getGuidesForAdmin(),
    ]);
    const isImported = (model: AmazonModel) =>
        model.variantAsins.some((asin) => imported.links.has(asin) || imported.coupons.has(asin));
    // An ASIN search shows exactly what we asked for, so our filters are off
    const { visible, hidden } = filterModels(
        allModels,
        byAsin
            ? { minReviews: 0, minRating: 0, hideImported: false, isImported }
            : {
                minReviews: filters.minReviews,
                minRating: filters.minRating,
                gender: filters.gender,
                titleQuery: filters.q,
                hideImported: filters.hideImported,
                isImported,
            },
    );
    const models = sortModels(visible, filters.sort);
    const hiddenSummary = HIDDEN_REASONS.filter((reason) => hidden[reason] > 0)
        .map((reason) => `${hidden[reason]} ${HIDDEN_REASON_LABELS[reason]}`)
        .join(" · ");
    const brandLabels = brands.map((brand) => brand.label);
    const nextHref =
        result?.ok && result.page.nextCursor
            ? buildImportHref(filters, { cursor: result.page.nextCursor })
            : null;
    const pageSubcategories = result?.ok ? countSubcategories(result.page.products) : [];
    // Real names from this page first, then the short starter words
    const subcategoryOptions = [
        ...new Set([
            ...pageSubcategories.map((subcategory) => subcategory.name),
            ...AMAZON_SUBCATEGORY_HINTS[filters.category],
        ]),
    ];
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
                        list={SUBCATEGORY_LIST_ID}
                        placeholder="Boots, Sneakers…"
                        defaultValue={filters.sub ?? ""}
                        className={FIELD_CLASS}
                    />
                    <datalist id={SUBCATEGORY_LIST_ID}>
                        {subcategoryOptions.map((option) => (
                            <option key={option} value={option} />
                        ))}
                    </datalist>
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
                        Min reviews <span className="font-normal text-ink/50">(0 = any)</span>
                    </label>
                    <input
                        id="minReviews"
                        name="minReviews"
                        type="number"
                        min={0}
                        defaultValue={filters.minReviews}
                        className={FIELD_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="minRating" className={LABEL_CLASS}>
                        Min rating <span className="font-normal text-ink/50">(0 = any)</span>
                    </label>
                    <input
                        id="minRating"
                        name="minRating"
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        defaultValue={filters.minRating}
                        className={FIELD_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="gender" className={LABEL_CLASS}>
                        Gender
                    </label>
                    <select id="gender" name="gender" defaultValue={filters.gender ?? ""} className={FIELD_CLASS}>
                        <option value="">Any</option>
                        {GENDERS.map((gender) => (
                            <option key={gender.slug} value={gender.slug}>
                                {gender.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="q" className={LABEL_CLASS}>
                        Title contains
                    </label>
                    <input
                        id="q"
                        name="q"
                        type="text"
                        placeholder="leather, running…"
                        defaultValue={filters.q ?? ""}
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
                    <label className="flex items-center gap-2 text-sm text-ink">
                        <input
                            type="checkbox"
                            name="hideImported"
                            value="1"
                            defaultChecked={filters.hideImported}
                        />
                        Hide imported
                    </label>
                </div>

                <div>
                    <label htmlFor="guide" className={LABEL_CLASS}>
                        Target guide
                    </label>
                    <select id="guide" name="guide" defaultValue={filters.guide ?? ""} className={FIELD_CLASS}>
                        <option value="">No guide (catalog only)</option>
                        {guides.map((guide) => (
                            <option key={guide.id} value={guide.id}>
                                {guide.title}
                                {guide.isPublished ? "" : " (draft)"}
                            </option>
                        ))}
                    </select>
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
                        {pluralize(models.length, "model")} from{" "}
                        {pluralize(result.page.products.length, "variant")} on this page
                        {hiddenSummary && ` · ${hiddenSummary}`}
                        {result.page.skipped > 0 && ` · ${result.page.skipped} skipped (invalid data)`}
                    </p>
                    {pageSubcategories.length > 0 && (
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-ink/70">Subcategories on this page:</span>
                            {pageSubcategories.map((subcategory) => (
                                <Link
                                    key={subcategory.name}
                                    href={buildImportHref(filters, {
                                        asins: [],
                                        sub: subcategory.name,
                                        cursor: undefined,
                                    })}
                                    prefetch={false}
                                    className={
                                        subcategory.name === filters.sub
                                            ? "rounded-full bg-coupon-dark px-3 py-1 text-xs font-semibold text-white"
                                            : "rounded-full border border-line px-3 py-1 text-xs text-ink transition hover:border-coupon"
                                    }
                                >
                                    {subcategory.name} · {subcategory.count}
                                </Link>
                            ))}
                        </div>
                    )}

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