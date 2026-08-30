import StoreCard from "@/components/store/StoreCard";
import type { Store } from "@/types";

export default function StoreGrid({ stores }: { stores: Store[] }) {
    return (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
                <div key={store.slug} className="animate-fade-in-up">
                    <StoreCard store={store} />
                </div>
            ))}
        </div>
    );
}