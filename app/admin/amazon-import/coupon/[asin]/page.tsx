import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
    searchAmazonProducts,
    generateAmazonLinks,
    type AmazonProduct,
} from "@/lib/partnerboost";
import { suggestTaxonomy } from "@/lib/amazon-taxonomy";
import {
    buildAmazonCouponDraft,
    safeImportReturnTo,
    type AmazonCouponDraft,
} from "@/lib/amazon-import";
import { getStoreIdBySlug, getStoreOptions } from "@/lib/stores";
import { importAmazonCoupon } from "@/lib/actions/amazon-import";
import {
    AMAZON_STORE_SLUG,
    AMAZON_STORE_SID,
    ASIN_PATTERN,
    amazonProductUrl,
} from "@/lib/constants/amazon";
import { BRANDS } from "@/lib/constants/taxonomy";
import CouponForm from "@/components/admin/CouponForm";

const brandLabels = BRANDS.map((brand) => brand.label);

type Preparation =
    | { ok: true; product: AmazonProduct; draft: AmazonCouponDraft }
    | { ok: false; product: AmazonProduct | null; message: string };

async function prepareCoupon(asin: string): Promise<Preparation> {
    try {
        const storeId = await getStoreIdBySlug(AMAZON_STORE_SLUG);
        if (!storeId) {
            return { ok: false, product: null, message: `Create the store with slug "${AMAZON_STORE_SLUG}" first.` };
        }

        const page = await searchAmazonProducts({ asins: [asin] });
        const product = page.products.find((item) => item.asin === asin) ?? null;
        if (!product) {
            return { ok: false, product: null, message: "This product is no longer available in PartnerBoost." };
        }
        if (product.couponPercent === null) {
            return { ok: false, product, message: "This product has no Amazon coupon right now." };
        }
        if (product.commissionPercent === null) {
            return { ok: false, product, message: "This product pays no commission. Skip it." };
        }

        const links = await generateAmazonLinks([asin], AMAZON_STORE_SID);
        const affiliateLink = links.get(asin);
        if (!affiliateLink) {
            return { ok: false, product, message: "PartnerBoost did not return a link for this product. Try another variant." };
        }

        const draft = buildAmazonCouponDraft({
            product,
            suggestion: suggestTaxonomy(product, brandLabels),
            storeId,
            affiliateLink,
        });
        if (!draft) {
            return { ok: false, product, message: "This product has no Amazon coupon right now." };
        }

        return { ok: true, product, draft };
    } catch (error) {
        return {
            ok: false,
            product: null,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export default async function ImportAmazonCouponPage(
    props: PageProps<"/admin/amazon-import/coupon/[asin]">,
) {
    await requireAdmin();

    const { asin: rawAsin } = await props.params;
    const asin = rawAsin.toUpperCase();
    if (!ASIN_PATTERN.test(asin)) {
        notFound();
    }

    const { returnTo: rawReturnTo } = await props.searchParams;
    const returnTo = safeImportReturnTo(Array.isArray(rawReturnTo) ? rawReturnTo[0] : rawReturnTo);

    const [preparation, storeOptions] = await Promise.all([
        prepareCoupon(asin),
        getStoreOptions(),
    ]);
    const { product } = preparation;

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <Link
                href={returnTo}
                prefetch={false}
                className="mb-4 inline-block text-sm text-ink/60 hover:text-coupon-dark"
            >
                ← Back to import
            </Link>

            <h1 className="mb-2 font-display text-2xl font-black text-ink">Add Store Coupon</h1>
            <p className="mb-6 text-sm text-ink/70">
                Adds a separate coupon to the Amazon store page. To feature this product in a guide, go back and use
                “Add product” instead.
            </p>

            {product && (
                <div className="mb-6 flex gap-4 rounded-2xl border border-line bg-white p-4">
                    {product.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-24 w-24 shrink-0 rounded-lg object-contain"
                        />
                    )}
                    <div className="text-sm">
                        <p className="font-medium leading-snug text-ink">{product.name}</p>
                        <p className="mt-1 text-xs text-ink/60">
                            {product.asin} · coupon {product.couponPercent ?? 0}% · commission{" "}
                            {product.commissionPercent ?? 0}%
                        </p>
                        <a
                            href={amazonProductUrl(product.asin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-semibold text-coupon-dark underline"
                        >
                            Check the coupon on Amazon ↗
                        </a>
                    </div>
                </div>
            )}

            {preparation.ok ? (
                <>
                    <p className="mb-4 rounded-lg bg-paper px-3 py-2 text-xs text-ink/70">
                        Open the product on Amazon and make sure the coupon is visible before saving.
                        All fields below are suggestions, edit anything that looks wrong.
                    </p>
                    <CouponForm
                        action={importAmazonCoupon}
                        storeOptions={storeOptions}
                        initialValues={preparation.draft}
                        hiddenFields={{
                            asin,
                            returnTo,
                            ...(preparation.product.imageUrl ? { imageUrl: preparation.product.imageUrl } : {}),
                        }}
                    />
                </>
            ) : (
                <p className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {preparation.message}
                </p>
            )}
        </div>
    );
}