import { getStores } from "@/lib/stores";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminDashboard() {
    const stores = await getStores();

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="font-display text-2xl font-black text-ink">
                    Dashboard
                </h1>
                <LogoutButton />
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-paper">
                        <tr>
                            <th className="px-5 py-3 font-medium text-ink/60">Store</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Offers</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Best Offer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((store) => (
                            <tr key={store.slug} className="border-b border-line last:border-0">
                                <td className="px-5 py-3 font-medium text-ink">{store.name}</td>
                                <td className="px-5 py-3 font-mono text-ink/60">
                                    {store.offerCount}
                                </td>
                                <td className="px-5 py-3 text-coupon">{store.bestOffer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}