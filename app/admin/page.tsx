import Link from "next/link";
import { getStores } from "@/lib/stores";
import { getAllCouponsForAdmin } from "@/lib/coupons";
import { getShopLinksForAdmin } from "@/lib/shop-links";
import { SHOP_LINK_KIND_LABELS } from "@/lib/constants/shop-links";
import { deleteCoupon, markCouponVerified } from "@/lib/actions/coupons";
import { deleteStore } from "@/lib/actions/stores";
import LogoutButton from "@/components/admin/LogoutButton";
import DeleteStoreButton from "@/components/admin/DeleteStoreButton";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import DeleteShopLinkButton from "@/components/admin/DeleteShopLinkButton";


export default async function AdminDashboard() {
    const [storesRaw, coupons, shopLinks] = await Promise.all([
        getStores(),
        getAllCouponsForAdmin(),
        getShopLinksForAdmin(),
    ]);

    const stores = [...storesRaw].sort((a, b) => a.name.localeCompare(b.name));

    const sortedCoupons = [...coupons].sort((a, b) => {
        const storeCompare = a.storeName.localeCompare(b.storeName);
        if (storeCompare !== 0) return storeCompare;
        return a.title.localeCompare(b.title);
    });

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="font-display text-2xl font-black text-ink">
                    Dashboard
                </h1>
                <LogoutButton />
            </div>

            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-black text-ink">
                    Stores <span className="font-mono text-sm font-normal text-ink/50">({stores.length})</span>
                </h2>
                <Link
                    href="/admin/stores/new"
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                    + Add Store
                </Link>
            </div>

            <AdminTableFrame className="mb-10">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-paper">
                        <tr>
                            <th className="px-5 py-3 font-medium text-ink/60">Store</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Offers</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Best Offer</th>
                            <th className="px-5 py-3 font-medium text-ink/60"></th>
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
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/admin/stores/${store.id}/edit`}
                                            className="text-xs font-medium text-ink/60 hover:text-ink"
                                        >
                                            Edit
                                        </Link>
                                        <form action={deleteStore}>
                                            <input type="hidden" name="id" value={store.id} />
                                            <DeleteStoreButton />
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminTableFrame>

            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-black text-ink">
                    Coupons <span className="font-mono text-sm font-normal text-ink/50">({sortedCoupons.length})</span>
                </h2>
                <Link
                    href="/admin/coupons/new"
                    className="rounded-full bg-coupon px-4 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    + Add Coupon
                </Link>
            </div>

            <AdminTableFrame>
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
                        {sortedCoupons.map((coupon) => (
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
                                        <form action={markCouponVerified}>
                                            <input type="hidden" name="id" value={coupon.id} />
                                            <button
                                                type="submit"
                                                className="text-xs font-medium text-green-600 hover:text-green-700"
                                            >
                                                Verify
                                            </button>
                                        </form>
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
            </AdminTableFrame>

            <div className="mb-4 mt-10 flex items-center justify-between">
                <h2 className="font-display text-xl font-black text-ink">
                    Shop Links <span className="font-mono text-sm font-normal text-ink/50">({shopLinks.length})</span>
                </h2>
                <Link
                    href="/admin/shop-links/new"
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                    + Add Link
                </Link>
            </div>

            <AdminTableFrame>
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-paper">
                        <tr>
                            <th className="px-5 py-3 font-medium text-ink/60">Store</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Title</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Type</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Status</th>
                            <th className="px-5 py-3 font-medium text-ink/60"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {shopLinks.map((link) => (
                            <tr key={link.id} className="border-b border-line last:border-0">
                                <td className="px-5 py-3 font-medium text-ink">{link.storeName}</td>
                                <td className="px-5 py-3 text-ink/80">{link.title}</td>
                                <td className="px-5 py-3 text-ink/60">{SHOP_LINK_KIND_LABELS[link.kind]}</td>
                                <td className={`px-5 py-3 text-xs font-medium ${link.isActive ? "text-green-600" : "text-ink/40"}`}>
                                    {link.isActive ? "Active" : "Hidden"}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-start justify-end gap-3">
                                        <Link
                                            href={`/admin/shop-links/${link.id}/edit`}
                                            className="text-xs font-medium text-ink/60 hover:text-ink"
                                        >
                                            Edit
                                        </Link>
                                        <DeleteShopLinkButton id={link.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminTableFrame>

        </div>
    );
}