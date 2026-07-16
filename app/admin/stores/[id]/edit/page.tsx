import { notFound } from "next/navigation";
import { getStoreById } from "@/lib/stores";
import { updateStore } from "@/lib/actions/stores";

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
            <h1 className="mb-6 font-display text-2xl font-black text-ink">
                Edit Store
            </h1>

            <form action={updateStore} className="flex flex-col gap-4">
                <input type="hidden" name="id" value={store.id} />

                <div>
                    <label htmlFor="slug" className="mb-1 block text-sm font-medium text-ink">
                        Slug
                    </label>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
                        required
                        defaultValue={store.slug}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        defaultValue={store.name}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="logoUrl" className="mb-1 block text-sm font-medium text-ink">
                        Logo URL
                    </label>
                    <input
                        id="logoUrl"
                        name="logoUrl"
                        type="text"
                        required
                        defaultValue={store.logoUrl}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium text-ink">
                        Website URL (fallback if no affiliate link yet)
                    </label>
                    <input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="text"
                        defaultValue={store.websiteUrl ?? ""}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="affiliateLink" className="mb-1 block text-sm font-medium text-ink">
                        Affiliate Link (leave empty until approved)
                    </label>
                    <input
                        id="affiliateLink"
                        name="affiliateLink"
                        type="text"
                        defaultValue={store.affiliateLink ?? ""}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}