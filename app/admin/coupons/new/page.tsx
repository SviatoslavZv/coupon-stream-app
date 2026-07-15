import { getStoreOptions } from "@/lib/stores";
import { createCoupon } from "@/lib/actions/coupons";

export default async function NewCouponPage() {
    const storeOptions = await getStoreOptions();

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">
                Add Coupon
            </h1>

            <form action={createCoupon} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="storeId" className="mb-1 block text-sm font-medium text-ink">
                        Store
                    </label>
                    <select
                        id="storeId"
                        name="storeId"
                        required
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
                        placeholder="25% OFF"
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
                        placeholder="25% Off Your Next Order"
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
                        placeholder="NIKE20"
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
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    Create Coupon
                </button>
            </form>
        </div>
    );
}