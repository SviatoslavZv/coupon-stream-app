import { requireAdmin } from "@/lib/auth";
import { addStoreProduct, fetchStoreProductDetails } from "@/lib/actions/store-products";
import { getGuidesForAdmin } from "@/lib/guides";
import { getDeepLinkStoreOptions } from "@/lib/stores";
import { getBrands } from "@/lib/brands";
import { parseStoreProductPrefill } from "@/lib/schemas/store-products";
import StoreProductForm, {
    type LookupMessage,
    type StoreProductValues,
} from "@/components/admin/StoreProductForm";

export default async function NewStoreProductPage(props: PageProps<"/admin/store-products/new">) {
    await requireAdmin();

    const [storeOptions, guides, brands, prefill] = await Promise.all([
        getDeepLinkStoreOptions(),
        getGuidesForAdmin(),
        getBrands(),
        props.searchParams.then(parseStoreProductPrefill),
    ]);
    const guideOptions = guides.map(({ id, title, isPublished }) => ({ id, title, isPublished }));

    // Quick add sends ?store=…&url=…: pick that store and read the product page right away
    const storeId = storeOptions.some((store) => store.id === prefill.store) ? prefill.store : undefined;
    let initialValues: Partial<StoreProductValues> | undefined;
    let initialLookup: LookupMessage | undefined;

    if (storeId && prefill.url && (prefill.title || prefill.image)) {
        // The bookmarklet already read the page in your browser: no request to the store at all
        initialValues = {
            storeId,
            productUrl: prefill.url,
            ...(prefill.title ? { title: prefill.title } : {}),
            ...(prefill.image ? { imageUrl: prefill.image } : {}),
        };
        initialLookup = { tone: "success", text: "Filled in from your browser. Check the title and the picture." };
    } else if (storeId && prefill.url) {
        const details = await fetchStoreProductDetails(storeId, prefill.url);
        initialValues = {
            storeId,
            productUrl: prefill.url,
            ...(details.ok && details.title ? { title: details.title } : {}),
            ...(details.ok && details.imageUrl ? { imageUrl: details.imageUrl } : {}),
        };
        initialLookup = details.ok
            ? { tone: "success", text: "Filled in from the store page. Check the title and the picture." }
            : { tone: "error", text: details.error };
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-2 font-display text-2xl font-black text-ink">Add Product from Store</h1>
            <p className="mb-6 text-sm text-ink/60">
                Open the product on the store&apos;s own site, check the price and stock, then paste its address here.
                The affiliate deep link is built automatically.
            </p>
            <StoreProductForm
                brands={brands}
                action={addStoreProduct}
                storeOptions={storeOptions}
                guideOptions={guideOptions}
                initialValues={initialValues}
                initialLookup={initialLookup}
            />
        </div>
    );
}