// app/stores/page.tsx

import StoreCard from "@/components/store/StoreCard";
import { getStores } from "@/lib/stores";

export default async function StoresPage() {
    const stores = await getStores();

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="font-display text-3xl font-black text-ink">
                All Stores
            </h1>
            <p className="mt-2 text-ink/60">
                Browse every store with active promo codes and deals.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                    <StoreCard key={store.slug} store={store} />
                ))}
            </div>
        </div>
    );
}