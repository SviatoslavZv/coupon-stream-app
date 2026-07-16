import { notFound } from "next/navigation";
import { getCouponById } from "@/lib/coupons";
import { getStoreOptions } from "@/lib/stores";
import { updateCoupon } from "@/lib/actions/coupons";

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

            <form action={updateCoupon} className="flex flex-col gap-4">
                <input type="hidden" name="id" value={coupon.id} />

                <div>
                    <label htmlFor="storeId" className="mb-1 block text-sm font-medium text-ink">
                        Store
                    </label>
                    <select
                        id="storeId"
                        name="storeId"
                        required
                        defaultValue={coupon.store_id}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    >
                        {storeOptions.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="type" className="mb-1 block text-sm font-medium text-ink">
                        Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        required
                        defaultValue={coupon.type}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    >
                        <option value="code">Code</option>
                        <option value="sale">Sale</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="discountLabel" className="mb-1 block text-sm font-medium text-ink">
                        Discount Label
                    </label>
                    <input
                        id="discountLabel"
                        name="discountLabel"
                        type="text"
                        required
                        defaultValue={coupon.discount_label}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink">
                        Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        defaultValue={coupon.title}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink">
                        Code (leave empty for Sale type)
                    </label>
                    <input
                        id="code"
                        name="code"
                        type="text"
                        defaultValue={coupon.code ?? ""}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={3}
                        defaultValue={coupon.description}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="expiresAt" className="mb-1 block text-sm font-medium text-ink">
                        Expires At
                    </label>
                    <input
                        id="expiresAt"
                        name="expiresAt"
                        type="date"
                        required
                        defaultValue={coupon.expires_at}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}