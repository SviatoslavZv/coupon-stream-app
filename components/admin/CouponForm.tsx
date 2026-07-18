// components/admin/CouponForm.tsx

"use client";

import { useState } from "react";
import { CATEGORIES, GENDERS, BRANDS, getSubcategories } from "@/lib/constants/taxonomy";

interface StoreOption {
    id: string;
    name: string;
}

interface CouponFormValues {
    id?: string;
    storeId?: string;
    type?: string;
    discountLabel?: string;
    title?: string;
    code?: string;
    description?: string;
    expiresAt?: string;
    category?: string | null;
    subcategory?: string | null;
    gender?: string | null;
    brand?: string | null;
}

export default function CouponForm({
    action,
    storeOptions,
    initialValues,
}: {
    action: (formData: FormData) => void;
    storeOptions: StoreOption[];
    initialValues?: CouponFormValues;
}) {
    const [selectedCategory, setSelectedCategory] = useState(
        initialValues?.category ?? ""
    );

    const subcategories = getSubcategories(selectedCategory);

    return (
        <form action={action} className="flex flex-col gap-4">
            {initialValues?.id && (
                <input type="hidden" name="id" value={initialValues.id} />
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="storeId" className="mb-1 block text-sm font-medium text-ink">
                        Store
                    </label>
                    <select
                        id="storeId"
                        name="storeId"
                        required
                        defaultValue={initialValues?.storeId}
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
                        defaultValue={initialValues?.type ?? "code"}
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
                        defaultValue={initialValues?.discountLabel}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink">
                        Code (optional)
                    </label>
                    <input
                        id="code"
                        name="code"
                        type="text"
                        placeholder="NIKE20"
                        defaultValue={initialValues?.code}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink">
                        Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        placeholder="25% Off Your Next Order"
                        defaultValue={initialValues?.title}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div className="col-span-2">
                    <label htmlFor="description" className="mb-1 block text-sm font-medium text-ink">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={2}
                        defaultValue={initialValues?.description}
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
                        defaultValue={initialValues?.expiresAt}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>
            </div>

            <div className="border-t border-line pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/40">
                    Filters (optional)
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="mb-1 block text-sm font-medium text-ink">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                        >
                            <option value="">None</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat.slug} value={cat.slug}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="subcategory" className="mb-1 block text-sm font-medium text-ink">
                            Subcategory
                        </label>
                        <select
                            id="subcategory"
                            name="subcategory"
                            defaultValue={initialValues?.subcategory ?? ""}
                            disabled={subcategories.length === 0}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none disabled:bg-paper disabled:text-ink/30"
                        >
                            <option value="">None</option>
                            {subcategories.map((sub) => (
                                <option key={sub.slug} value={sub.slug}>
                                    {sub.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="gender" className="mb-1 block text-sm font-medium text-ink">
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            defaultValue={initialValues?.gender ?? ""}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                        >
                            <option value="">None</option>
                            {GENDERS.map((g) => (
                                <option key={g.slug} value={g.slug}>
                                    {g.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="brand" className="mb-1 block text-sm font-medium text-ink">
                            Brand
                        </label>
                        <select
                            id="brand"
                            name="brand"
                            defaultValue={initialValues?.brand ?? ""}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                        >
                            <option value="">None</option>
                            {BRANDS.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
            >
                {initialValues?.id ? "Save Changes" : "Create Coupon"}
            </button>
        </form>
    );
}