import { notFound } from "next/navigation";
import { getShopLinkById } from "@/lib/shop-links";
import { getStoreOptions } from "@/lib/stores";
import { updateShopLink } from "@/lib/actions/shop-links";
import ShopLinkForm from "@/components/admin/ShopLinkForm";

export default async function EditShopLinkPage(props: PageProps<"/admin/shop-links/[id]/edit">) {
    const { id } = await props.params;

    const [shopLink, storeOptions] = await Promise.all([getShopLinkById(id), getStoreOptions()]);

    if (!shopLink) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">Edit Shop Link</h1>
            <ShopLinkForm action={updateShopLink} storeOptions={storeOptions} initialValues={shopLink} />
        </div>
    );
}