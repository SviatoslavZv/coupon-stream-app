"use client";

import { useActionState, useState } from "react";
import { CATEGORIES, GENDERS, BRANDS, getSubcategories } from "@/lib/constants/taxonomy";
import type { CouponFormState } from "@/lib/actions/coupons";
import { DISCOUNT_LABEL_PRESETS, DESCRIPTION_PRESETS, buildTitleSuggestions } from "@/lib/constants/coupon-presets";

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
    affiliateLink?: string | null;
}





export default function CouponForm({
    action,
    storeOptions,
    initialValues,
}: {
    action: (
        prevState: CouponFormState | null,
        formData: FormData
    ) => Promise<CouponFormState>;
    storeOptions: StoreOption[];
    initialValues?: CouponFormValues;
}) {
    const [selectedCategory, setSelectedCategory] = useState(
        initialValues?.category ?? ""
    );

    const [discountLabel, setDiscountLabel] = useState(initialValues?.discountLabel ?? "");

    const [code, setCode] = useState(initialValues?.code ?? "");

    const [description, setDescription] = useState(initialValues?.description ?? "");

    const [state, formAction, isPending] = useActionState(action, null);

    const subcategories = getSubcategories(selectedCategory);

    const titleSuggestions = buildTitleSuggestions(discountLabel);

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {initialValues?.id && (
                <input type="hidden" name="id" value={initialValues.id} />
            )}

            {state?.error && (
                <div className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {state.error}
                </div>
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
                        list="discount-label-options"
                        autoComplete="off"
                        value={discountLabel}
                        onChange={(e) => setDiscountLabel(e.target.value)}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                    <datalist id="discount-label-options">
                        {DISCOUNT_LABEL_PRESETS.map((preset) => (
                            <option key={preset} value={preset} />
                        ))}
                    </datalist>
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
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
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
                        list="title-options"
                        autoComplete="off"
                        defaultValue={initialValues?.title}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                    <datalist id="title-options">
                        {titleSuggestions.map((suggestion) => (
                            <option key={suggestion} value={suggestion} />
                        ))}
                    </datalist>
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                    <div className="mt-1 flex flex-wrap gap-1">
                        {DESCRIPTION_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setDescription(preset)}
                                className="rounded-full border border-line px-2 py-0.5 text-xs text-ink/80 transition hover:border-coupon hover:text-coupon"
                            >
                                {preset.length > 30 ? `${preset.slice(0, 30)}…` : preset}
                            </button>
                        ))}
                    </div>
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

                <div className="col-span-2">
                    <label htmlFor="affiliateLink" className="mb-1 block text-sm font-medium text-ink">
                        Affiliate Link (optional — overrides store`s default link)
                    </label>
                    <input
                        id="affiliateLink"
                        name="affiliateLink"
                        type="text"
                        placeholder="https://www.example.com/click-..."
                        defaultValue={initialValues?.affiliateLink ?? ""}
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
                            {[...BRANDS].sort((a, b) => a.label.localeCompare(b.label)).map((b) => (
                                <option key={b.slug} value={b.label}>
                                    {b.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90 disabled:opacity-50"
            >
                {isPending ? "Saving…" : initialValues?.id ? "Save Changes" : "Create Coupon"}
            </button>
        </form>
    );
}