import Link from "next/link";
import { getStores } from "@/lib/stores";
import { getAllCouponsForAdmin } from "@/lib/coupons";
import { deleteCoupon } from "@/lib/actions/coupons";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminDashboard() {
    const [stores, coupons] = await Promise.all([
        getStores(),
        getAllCouponsForAdmin(),
    ]);

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="font-display text-2xl font-black text-ink">
                    Dashboard
                </h1>
                <LogoutButton />
            </div>

            <div className="mb-10 overflow-hidden rounded-2xl border border-line bg-white">
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

            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-black text-ink">Coupons</h2>
                <Link
                    href="/admin/coupons/new"
                    className="rounded-full bg-coupon px-4 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    + Add Coupon
                </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-paper">
                        <tr>
                            <th className="px-5 py-3 font-medium text-ink/60">Store</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Title</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Expires</th>
                            <th className="px-5 py-3 font-medium text-ink/60"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="border-b border-line last:border-0">
                                <td className="px-5 py-3 font-medium text-ink">
                                    {coupon.storeName}
                                </td>
                                <td className="px-5 py-3 text-ink/80">{coupon.title}</td>
                                <td className="px-5 py-3 font-mono text-ink/60">
                                    {coupon.expiresAt}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/admin/coupons/${coupon.id}/edit`}
                                            className="text-xs font-medium text-ink/60 hover:text-ink"
                                        >
                                            Edit
                                        </Link>
                                        <form action={deleteCoupon}>
                                            <input type="hidden" name="id" value={coupon.id} />
                                            <button
                                                type="submit"
                                                className="text-xs font-medium text-coupon hover:text-coupon/70"
                                            >
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}