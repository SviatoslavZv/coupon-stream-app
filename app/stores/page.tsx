import type { Metadata } from "next";
import StoreGrid from "@/components/store/StoreGrid";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getStores } from "@/lib/stores";

export const metadata: Metadata = {
    title: "All Stores & Promo Codes",
    description:
        "Browse our complete directory of stores offering verified promo codes, discount coupons, and daily deals.",
    alternates: {
        canonical: "/stores",
    },
};

export default async function StoresPage() {
    const stores = await getStores();

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 animate-fade-in-up">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Stores" },
                ]}
            />

            <h1 className="font-display text-3xl font-black text-ink">
                All Stores
            </h1>
            <p className="mt-2 text-ink/70">
                Browse every store with active promo codes and deals.
            </p>

            <StoreGrid stores={stores} />
        </div>
    );
}