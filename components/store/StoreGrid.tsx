import StoreCard from "@/components/store/StoreCard";
import type { Store } from "@/types";

export default function StoreGrid({ stores }: { stores: Store[] }) {
    return (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
                <StoreCard key={store.slug} store={store} />
            ))}
        </div>
    );
}