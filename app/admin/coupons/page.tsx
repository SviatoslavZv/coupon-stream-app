import type { Metadata } from "next";
import Link from "next/link";
import { getAllCouponsForAdmin } from "@/lib/coupons";
import { deleteCoupon, markCouponVerified } from "@/lib/actions/coupons";
import { ADMIN_ROUTES } from "@/lib/constants/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export const metadata: Metadata = {
    title: "Coupons",
};

export default async function AdminCouponsPage() {
    const coupons = [...(await getAllCouponsForAdmin())].sort((a, b) => {
        const storeCompare = a.storeName.localeCompare(b.storeName);
        if (storeCompare !== 0) return storeCompare;
        return a.title.localeCompare(b.title);
    });

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <AdminPageHeader title="Coupons" count={coupons.length}>
                <Link
                    href={ADMIN_ROUTES.couponNew}
                    className="rounded-full bg-coupon px-4 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    + Add Coupon
                </Link>
            </AdminPageHeader>

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
                                <td className="px-5 py-3 font-mono text-ink/60">{coupon.expiresAt}</td>
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
                                            href={ADMIN_ROUTES.couponEdit(coupon.id)}
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
                    </tbody>
                </table>
            </AdminTableFrame>
        </div>
    );
}