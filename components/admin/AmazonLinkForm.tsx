"use client";

import { useActionState, useState } from "react";
import { BRANDS_BY_LABEL } from "@/lib/constants/taxonomy";
import type { CouponFormState } from "@/lib/actions/coupons";

interface GuideOption {
    id: string;
    title: string;
    isPublished: boolean;
}

const FIELD_CLASS =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";

export default function AmazonLinkForm({
    action,
    guideOptions,
    initialValues,
    hiddenFields,
}: {
    action: (prevState: CouponFormState | null, formData: FormData) => Promise<CouponFormState>;
    guideOptions: GuideOption[];
    initialValues: { title: string; brand: string | null };
    hiddenFields: Record<string, string>;
}) {
    const [state, formAction, isPending] = useActionState(action, null);
    const [title, setTitle] = useState(initialValues.title);
    const [guideId, setGuideId] = useState("");
    const [comment, setComment] = useState("");

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {Object.entries(hiddenFields).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
            ))}

            {state?.error && (
                <div className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {state.error}
                </div>
            )}

            <div>
                <label htmlFor="title" className={LABEL_CLASS}>
                    Title
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={FIELD_CLASS}
                />
            </div>

            <div>
                <label htmlFor="brand" className={LABEL_CLASS}>
                    Brand
                </label>
                <select id="brand" name="brand" defaultValue={initialValues.brand ?? ""} className={FIELD_CLASS}>
                    <option value="">None</option>
                    {BRANDS_BY_LABEL.map((brand) => (
                        <option key={brand.slug} value={brand.label}>
                            {brand.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="guideId" className={LABEL_CLASS}>
                    Add to guide
                </label>
                <select
                    id="guideId"
                    name="guideId"
                    value={guideId}
                    onChange={(e) => setGuideId(e.target.value)}
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
                    <label htmlFor="comment" className={LABEL_CLASS}>
                        Comment in the guide
                    </label>
                    <textarea
                        id="comment"
                        name="comment"
                        required
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
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