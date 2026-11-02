"use client";

import { useActionState, useState } from "react";
import { addGuideItem } from "@/lib/actions/guide-items";
import {
    GUIDE_ITEM_SOURCES,
    GUIDE_ITEM_SOURCE_LABELS,
    type GuideItemSource,
} from "@/lib/constants/guides";

export interface GuideItemOption {
    id: string;
    label: string;
}

const INPUT_CLASS =
    "w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";

export default function AddGuideItemForm({
    guideId,
    options,
}: {
    guideId: string;
    options: Record<GuideItemSource, GuideItemOption[]>;
}) {
    const [state, formAction, isPending] = useActionState(addGuideItem, null);
    const [source, setSource] = useState<GuideItemSource>("shop_link");

    const currentOptions = options[source];

    return (
        <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
            <h3 className="font-display text-base font-bold text-ink">Add item</h3>
            <input type="hidden" name="guideId" value={guideId} />

            {state?.error && <p className="text-sm text-coupon">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-700">Item added.</p>}

            <div className="grid grid-cols-[10rem_1fr] gap-3">
                <div>
                    <label htmlFor="source" className={LABEL_CLASS}>Type</label>
                    <select
                        id="source"
                        name="source"
                        value={source}
                        onChange={(e) => setSource(e.target.value as GuideItemSource)}
                        className={INPUT_CLASS}
                    >
                        {GUIDE_ITEM_SOURCES.map((option) => (
                            <option key={option} value={option}>
                                {GUIDE_ITEM_SOURCE_LABELS[option]}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="itemId" className={LABEL_CLASS}>{GUIDE_ITEM_SOURCE_LABELS[source]}</label>
                    <select key={source} id="itemId" name="itemId" required defaultValue="" className={INPUT_CLASS}>
                        <option value="" disabled>
                            {currentOptions.length > 0 ? "Choose…" : "Nothing available to add"}
                        </option>
                        {currentOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="comment" className={LABEL_CLASS}>Comment</label>
                <textarea
                    id="comment"
                    name="comment"
                    required
                    rows={3}
                    placeholder="Who it suits and how it differs from the other picks"
                    className={INPUT_CLASS}
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="self-start rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50"
            >
                {isPending ? "Adding…" : "Add to guide"}
            </button>
        </form>
    );
}