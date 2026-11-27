import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/coupons";
import { getStoreOptions } from "@/lib/stores";
import { getBrands } from "@/lib/brands";
import { updateCoupon } from "@/lib/actions/coupons";
import { ADMIN_ROUTES, RETURN_TO_PARAM, safeAdminReturnTo } from "@/lib/constants/admin";
import CouponForm from "@/components/admin/CouponForm";

export default async function EditCouponPage(props: PageProps<"/admin/coupons/[id]/edit">) {
    const { id } = await props.params;
    const returnTo = safeAdminReturnTo((await props.searchParams)[RETURN_TO_PARAM], ADMIN_ROUTES.coupons);

    const [coupon, storeOptions, brands] = await Promise.all([
        getCouponById(id),
        getStoreOptions(),
        getBrands(),
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
                brands={brands}
                storeOptions={storeOptions}
                hiddenFields={{ [RETURN_TO_PARAM]: returnTo }}
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
                    affiliateLink: coupon.affiliate_link,
                    imageUrl: coupon.image_url,
                }}
            />
        </div>
    );
}