import { notFound } from "next/navigation";
import { getStoreById } from "@/lib/stores";
import { updateStore } from "@/lib/actions/stores";
import StoreForm from "@/components/admin/StoreForm";

export default async function EditStorePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const store = await getStoreById(id);

    if (!store) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-4 font-display text-2xl font-black text-ink">
                Edit Store
            </h1>

            <StoreForm
                action={updateStore}
                initialValues={{
                    id: store.id,
                    slug: store.slug,
                    name: store.name,
                    logoUrl: store.logoUrl,
                    websiteUrl: store.websiteUrl,
                    affiliateLink: store.affiliateLink,
                }}
            />
        </div>
    );
}