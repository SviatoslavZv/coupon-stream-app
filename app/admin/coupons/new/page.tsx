import { getStoreOptions } from "@/lib/stores";
import { createCoupon } from "@/lib/actions/coupons";
import CouponForm from "@/components/admin/CouponForm";

export default async function NewCouponPage() {
    const storeOptions = await getStoreOptions();

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">
                Add Coupon
            </h1>

            <CouponForm action={createCoupon} storeOptions={storeOptions} />
        </div>
    );
}