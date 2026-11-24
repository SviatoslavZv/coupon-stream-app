import { getStoreOptions } from "@/lib/stores";
import { getBrands } from "@/lib/brands";
import { createShopLink } from "@/lib/actions/shop-links";
import ShopLinkForm from "@/components/admin/ShopLinkForm";

export default async function NewShopLinkPage() {
    const [storeOptions, brands] = await Promise.all([getStoreOptions(), getBrands()]);

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">Add Shop Link</h1>
            <ShopLinkForm action={createShopLink} brands={brands} storeOptions={storeOptions} />
        </div>
    );
}