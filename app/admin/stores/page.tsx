import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getStores } from "@/lib/stores";
import { deleteStore } from "@/lib/actions/stores";
import { ADMIN_ROUTES } from "@/lib/constants/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import DeleteStoreButton from "@/components/admin/DeleteStoreButton";

export const metadata: Metadata = {
    title: "Stores",
};

export default async function AdminStoresPage() {
    await requireAdmin();

    const stores = [...(await getStores())].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <AdminPageHeader title="Stores" count={stores.length}>
                <Link
                    href={ADMIN_ROUTES.storeNew}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                    + Add Store
                </Link>
            </AdminPageHeader>

            <AdminTableFrame>
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
                                <td className="px-5 py-3 font-mono text-ink/60">{store.offerCount}</td>
                                <td className="px-5 py-3 text-coupon">{store.bestOffer}</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={ADMIN_ROUTES.storeEdit(store.id)}
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
        </div>
    );
}