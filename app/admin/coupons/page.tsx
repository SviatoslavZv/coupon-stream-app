import type { Metadata } from "next";
import Link from "next/link";
import { getAllCouponsForAdmin } from "@/lib/coupons";
import { getStoreOptions } from "@/lib/stores";
import { activeFilterParams, filterAdminCoupons } from "@/lib/admin-filters";
import {
    COUPON_STATUS_FILTERS,
    COUPON_STATUS_LABELS,
    parseAdminCouponFilters,
} from "@/lib/schemas/admin-filters";
import { isCouponExpired } from "@/lib/utils";
import { deleteCoupon, markCouponVerified } from "@/lib/actions/coupons";
import { ADMIN_ROUTES, RETURN_TO_PARAM, withQuery } from "@/lib/constants/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export const metadata: Metadata = {
    title: "Coupons",
};

const STATUS_OPTIONS = COUPON_STATUS_FILTERS.map((value) => ({
    value,
    label: COUPON_STATUS_LABELS[value],
}));

export default async function AdminCouponsPage(props: PageProps<"/admin/coupons">) {
    const filters = parseAdminCouponFilters(await props.searchParams);
    const [allCoupons, storeOptions] = await Promise.all([getAllCouponsForAdmin(), getStoreOptions()]);

    // Edit links remember this filtered list, so a save brings you back to it
    const backParams = activeFilterParams(filters);
    const backTo = withQuery(ADMIN_ROUTES.coupons, backParams);
    const editHref = (id: string) =>
        Object.keys(backParams).length > 0
            ? withQuery(ADMIN_ROUTES.couponEdit(id), { [RETURN_TO_PARAM]: backTo })
            : ADMIN_ROUTES.couponEdit(id);

    const coupons = filterAdminCoupons(allCoupons, filters).sort((a, b) => {
        const storeCompare = a.storeName.localeCompare(b.storeName);
        if (storeCompare !== 0) return storeCompare;
        return a.title.localeCompare(b.title);
    });

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <AdminPageHeader title="Coupons" count={allCoupons.length}>
                <Link
                    href={ADMIN_ROUTES.couponNew}
                    className="rounded-full bg-coupon px-4 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    + Add Coupon
                </Link>
            </AdminPageHeader>

            <AdminFilterBar
                action={ADMIN_ROUTES.coupons}
                query={filters.q}
                queryPlaceholder="Title, code or discount…"
                stores={storeOptions}
                store={filters.store}
                select={{ name: "status", label: "Status", value: filters.status, options: STATUS_OPTIONS }}
                shown={coupons.length}
                total={allCoupons.length}
            />

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
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="border-b border-line last:border-0">
                                <td className="px-5 py-3 font-medium text-ink">{coupon.storeName}</td>
                                <td className="px-5 py-3 text-ink/80">{coupon.title}</td>
                                <td className="px-5 py-3 font-mono text-ink/60">
                                    {coupon.expiresAt}
                                    {isCouponExpired(coupon.expiresAt) && (
                                        <span className="ml-2 font-sans text-xs font-medium text-coupon">Expired</span>
                                    )}
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
                                            href={editHref(coupon.id)}
                                            className="text-xs font-medium text-ink/60 hover:text-ink"
                                        >
                                            Edit
                                        </Link>
                                        <form action={deleteCoupon}>
                                            <input type="hidden" name="id" value={coupon.id} />
                                            <ConfirmSubmitButton
                                                message={`Delete the coupon "${coupon.title}"? This cannot be undone.`}
                                                className="text-xs font-medium text-coupon hover:text-coupon/70"
                                            >
                                                Delete
                                            </ConfirmSubmitButton>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-5 py-8 text-center text-ink/60">
                                    No coupons match these filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </AdminTableFrame>
        </div>
    );
}