"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import type { CouponFormState } from "@/lib/actions/coupons";
import { BRANDS_BY_LABEL } from "@/lib/constants/taxonomy";
import type { StoreOption } from "@/lib/stores";

interface GuideOption {
    id: string;
    title: string;
    isPublished: boolean;
}

const FIELD_CLASS =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";
const HINT_CLASS = "mt-1 text-xs text-ink/50";

const EMPTY_VALUES = {
    storeId: "",
    productUrl: "",
    title: "",
    brand: "",
    imageUrl: "",
    guideId: "",
    comment: "",
};

type FieldChange = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export default function StoreProductForm({
    action,
    storeOptions,
    guideOptions,
}: {
    action: (prevState: CouponFormState | null, formData: FormData) => Promise<CouponFormState>;
    storeOptions: StoreOption[];
    guideOptions: GuideOption[];
}) {
    const [state, formAction, isPending] = useActionState(action, null);
    // Controlled fields keep what you typed when the server returns an error
    const [values, setValues] = useState(EMPTY_VALUES);

    function handleChange(event: FieldChange) {
        const { name, value } = event.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    }

    const { imageUrl, guideId } = values;
    const showPreview = imageUrl.trim().startsWith("https://");

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {state?.error && (
                <div className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {state.error}
                </div>
            )}

            <div>
                <label htmlFor="storeId" className={LABEL_CLASS}>Store</label>
                <select id="storeId" name="storeId" required value={values.storeId} onChange={handleChange} className={FIELD_CLASS}>
                    <option value="" disabled>Choose a store…</option>
                    {storeOptions.map((store) => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
                <p className={HINT_CLASS}>Only stores that support deep links are listed.</p>
            </div>

            <div>
                <label htmlFor="productUrl" className={LABEL_CLASS}>Product URL</label>
                <input
                    id="productUrl"
                    name="productUrl"
                    type="url"
                    required
                    value={values.productUrl}
                    onChange={handleChange}
                    placeholder="https://www.store.com/product/…"
                    className={FIELD_CLASS}
                />
                <p className={HINT_CLASS}>Copy it from the address bar of the store&apos;s product page.</p>
            </div>

            <div>
                <label htmlFor="title" className={LABEL_CLASS}>Title</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={values.title}
                    onChange={handleChange}
                    className={FIELD_CLASS}
                />
            </div>

            <div>
                <label htmlFor="brand" className={LABEL_CLASS}>Brand</label>
                <select id="brand" name="brand" value={values.brand} onChange={handleChange} className={FIELD_CLASS}>
                    <option value="">None</option>
                    {BRANDS_BY_LABEL.map((brand) => (
                        <option key={brand.slug} value={brand.label}>
                            {brand.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="imageUrl" className={LABEL_CLASS}>Image URL (optional)</label>
                <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={handleChange}
                    placeholder="https://…"
                    className={FIELD_CLASS}
                />
                {showPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={imageUrl.trim()}
                        alt="Product preview"
                        className="mt-2 h-24 w-24 rounded-lg border border-line object-contain"
                    />
                )}
            </div>

            <div>
                <label htmlFor="guideId" className={LABEL_CLASS}>Add to guide</label>
                <select
                    id="guideId"
                    name="guideId"
                    value={guideId}
                    onChange={handleChange}
                    className={FIELD_CLASS}
                >
                    <option value="">Catalog only (no guide)</option>
                    {guideOptions.map((guide) => (
                        <option key={guide.id} value={guide.id}>
                            {guide.title}
                            {guide.isPublished ? "" : " (draft)"}
                        </option>
                    ))}
                </select>
            </div>

            {guideId && (
                <div>
                    <label htmlFor="comment" className={LABEL_CLASS}>Comment in the guide</label>
                    <textarea
                        id="comment"
                        name="comment"
                        required
                        rows={3}
                        value={values.comment}
                        onChange={handleChange}
                        placeholder="Why this product is worth a look, in one or two sentences."
                        className={FIELD_CLASS}
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="self-start rounded-full bg-coupon-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coupon disabled:opacity-50"
            >
                {isPending ? "Saving…" : guideId ? "Add to guide" : "Add to catalog"}
            </button>
        </form>
    );
}