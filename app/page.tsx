import StoreGrid from "@/components/store/StoreGrid";
import { getTopStores } from "@/lib/stores";

export default async function Home() {
  const stores = await getTopStores(6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-black text-ink">
        Top Stores
      </h1>
      <p className="mt-2 text-ink/60">
        Verified promo codes and deals, updated daily.
      </p>

      <StoreGrid stores={stores} />
    </div>
  );
}