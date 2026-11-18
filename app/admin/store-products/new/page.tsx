import { requireAdmin } from "@/lib/auth";
import { addStoreProduct } from "@/lib/actions/store-products";
import { getGuidesForAdmin } from "@/lib/guides";
import { getDeepLinkStoreOptions } from "@/lib/stores";
import StoreProductForm from "@/components/admin/StoreProductForm";

export default async function NewStoreProductPage() {
    await requireAdmin();

    const [storeOptions, guides] = await Promise.all([
        getDeepLinkStoreOptions(),
        getGuidesForAdmin(),
    ]);
    const guideOptions = guides.map(({ id, title, isPublished }) => ({ id, title, isPublished }));

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-2 font-display text-2xl font-black text-ink">Add Product from Store</h1>
            <p className="mb-6 text-sm text-ink/60">
                Open the product on the store&apos;s own site, check the price and stock, then paste its address here.
                The affiliate deep link is built automatically.
            </p>
            <StoreProductForm
                action={addStoreProduct}
                storeOptions={storeOptions}
                guideOptions={guideOptions}
            />
        </div>
    );
}