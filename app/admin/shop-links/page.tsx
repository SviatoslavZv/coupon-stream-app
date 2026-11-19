import type { Metadata } from "next";
import Link from "next/link";
import { getShopLinksForAdmin } from "@/lib/shop-links";
import { getStoreOptions } from "@/lib/stores";
import { filterAdminShopLinks } from "@/lib/admin-filters";
import {
    LINK_STATUS_FILTERS,
    LINK_STATUS_LABELS,
    parseAdminLinkFilters,
} from "@/lib/schemas/admin-filters";
import { SHOP_LINK_KIND_LABELS } from "@/lib/constants/shop-links";
import { ADMIN_ROUTES } from "@/lib/constants/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import DeleteShopLinkButton from "@/components/admin/DeleteShopLinkButton";

export const metadata: Metadata = {
    title: "Links",
};

const STATUS_OPTIONS = LINK_STATUS_FILTERS.map((value) => ({
    value,
    label: LINK_STATUS_LABELS[value],
}));

export default async function AdminShopLinksPage(props: PageProps<"/admin/shop-links">) {
    const filters = parseAdminLinkFilters(await props.searchParams);
    const [allLinks, storeOptions] = await Promise.all([getShopLinksForAdmin(), getStoreOptions()]);
    const shopLinks = filterAdminShopLinks(allLinks, filters);

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <AdminPageHeader title="Links" count={allLinks.length}>
                <Link
                    href={ADMIN_ROUTES.storeProductNew}
                    className="rounded-full bg-coupon-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-coupon"
                >
                    + Add from store
                </Link>
                <Link
                    href={ADMIN_ROUTES.shopLinkNew}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                    + Add Link
                </Link>
            </AdminPageHeader>


            <AdminFilterBar
                action={ADMIN_ROUTES.shopLinks}
                query={filters.q}
                queryPlaceholder="Title, brand or ASIN…"
                stores={storeOptions}
                store={filters.store}
                select={{ name: "status", label: "Status", value: filters.status, options: STATUS_OPTIONS }}
                shown={shopLinks.length}
                total={allLinks.length}
            />

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
                                            href={ADMIN_ROUTES.shopLinkEdit(link.id)}
                                            className="text-xs font-medium text-ink/60 hover:text-ink"
                                        >
                                            Edit
                                        </Link>
                                        <DeleteShopLinkButton id={link.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {shopLinks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-ink/60">
                                    No links match these filters.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </AdminTableFrame>
        </div>
    );
}