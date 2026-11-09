import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { searchAmazonProducts, type AmazonProduct } from "@/lib/partnerboost";
import { suggestTaxonomy } from "@/lib/amazon-taxonomy";
import { buildProductTitle, safeImportReturnTo } from "@/lib/amazon-import";
import { getImportedAsins } from "@/lib/amazon-imported";
import { getGuidesForAdmin } from "@/lib/guides";
import { importAmazonProductLink } from "@/lib/actions/amazon-import";
import { ASIN_PATTERN, amazonProductUrl } from "@/lib/constants/amazon";
import { BRANDS } from "@/lib/constants/taxonomy";
import AmazonLinkForm from "@/components/admin/AmazonLinkForm";

const brandLabels = BRANDS.map((brand) => brand.label);

type Preparation =
    | { ok: true; product: AmazonProduct; title: string; brand: string | null }
    | { ok: false; product: AmazonProduct | null; message: string };

async function prepareLink(asin: string): Promise<Preparation> {
    try {
        const page = await searchAmazonProducts({ asins: [asin] });
        const product = page.products.find((item) => item.asin === asin) ?? null;
        if (!product) {
            return { ok: false, product: null, message: "This product is no longer available in PartnerBoost." };
        }
        if (product.commissionPercent === null) {
            return { ok: false, product, message: "This product pays no commission. Skip it." };
        }
        if (!product.inStock) {
            return { ok: false, product, message: "This product is out of stock." };
        }

        const suggestion = suggestTaxonomy(product, brandLabels);
        return {
            ok: true,
            product,
            title: buildProductTitle(product, suggestion),
            brand: suggestion.brand,
        };
    } catch (error) {
        return {
            ok: false,
            product: null,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export default async function ImportAmazonLinkPage(props: PageProps<"/admin/amazon-import/link/[asin]">) {
    await requireAdmin();

    const { asin: rawAsin } = await props.params;
    const asin = rawAsin.toUpperCase();
    if (!ASIN_PATTERN.test(asin)) {
        notFound();
    }

    const { returnTo: rawReturnTo } = await props.searchParams;
    const returnTo = safeImportReturnTo(Array.isArray(rawReturnTo) ? rawReturnTo[0] : rawReturnTo);

    const [preparation, guides, imported] = await Promise.all([
        prepareLink(asin),
        getGuidesForAdmin(),
        getImportedAsins([asin]),
    ]);
    const { product } = preparation;
    const inCatalog = imported.links.has(asin);
    const guideOptions = guides.map(({ id, title, isPublished }) => ({ id, title, isPublished }));

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <Link
                href={returnTo}
                prefetch={false}
                className="mb-4 inline-block text-sm text-ink/60 hover:text-coupon-dark"
            >
                ← Back to import
            </Link>

            <h1 className="mb-6 font-display text-2xl font-black text-ink">Add Amazon Product</h1>

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
                            {product.asin} · commission {product.commissionPercent ?? 0}% ·{" "}
                            {product.couponPercent ? `coupon ${product.couponPercent}%` : "no coupon"} · ★{" "}
                            {product.rating ?? "—"} ({product.reviews.toLocaleString("en-US")})
                        </p>
                        <a
                            href={amazonProductUrl(product.asin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block text-xs font-semibold text-coupon-dark underline"
                        >
                            Check on Amazon ↗
                        </a>
                    </div>
                </div>
            )}

            {inCatalog && (
                <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
                    This product is already in the catalog. Saving will only add it to the selected guide.
                </p>
            )}

            {preparation.ok ? (
                <AmazonLinkForm
                    action={importAmazonProductLink}
                    guideOptions={guideOptions}
                    initialValues={{ title: preparation.title, brand: preparation.brand }}
                    hiddenFields={{
                        asin,
                        returnTo,
                        commissionRate: String(preparation.product.commissionPercent ?? ""),
                        ...(preparation.product.couponPercent
                            ? { couponPercent: String(preparation.product.couponPercent) }
                            : {}),
                        ...(preparation.product.imageUrl ? { imageUrl: preparation.product.imageUrl } : {}),
                    }}
                />
            ) : (
                <p className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {preparation.message}
                </p>
            )}
        </div>
    );
}