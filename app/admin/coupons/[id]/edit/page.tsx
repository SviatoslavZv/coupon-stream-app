import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/coupons";
import { getStoreOptions } from "@/lib/stores";
import { updateCoupon } from "@/lib/actions/coupons";
import CouponForm from "@/components/admin/CouponForm";

export default async function EditCouponPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [coupon, storeOptions] = await Promise.all([
        getCouponById(id),
        getStoreOptions(),
    ]);

    if (!coupon) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">
                Edit Coupon
            </h1>

            <CouponForm
                action={updateCoupon}
                storeOptions={storeOptions}
                initialValues={{
                    id: coupon.id,
                    storeId: coupon.store_id,
                    type: coupon.type,
                    discountLabel: coupon.discount_label,
                    title: coupon.title,
                    code: coupon.code ?? undefined,
                    description: coupon.description,
                    expiresAt: coupon.expires_at,
                    category: coupon.category,
                    subcategory: coupon.subcategory,
                    gender: coupon.gender,
                    brand: coupon.brand,
                }}
            />
        </div>
    );
}