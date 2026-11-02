"use client";

import { useActionState, useState } from "react";
import { moveGuideItem, removeGuideItem, updateGuideItemComment } from "@/lib/actions/guide-items";
import { GUIDE_ITEM_SOURCE_LABELS } from "@/lib/constants/guides";
import type { AdminGuideItem } from "@/lib/guides";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

const SMALL_BUTTON_CLASS =
    "text-xs font-medium text-ink/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30";

export default function GuideItemRow({
    item,
    position,
    isFirst,
    isLast,
}: {
    item: AdminGuideItem;
    position: number;
    isFirst: boolean;
    isLast: boolean;
}) {
    const [state, formAction, isPending] = useActionState(updateGuideItemComment, null);
    const [comment, setComment] = useState(item.comment);
    const isChanged = comment !== item.comment;

    return (
        <li className={`rounded-2xl border bg-white p-4 ${item.isVisible ? "border-line" : "border-coupon/40"}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-ink/60">
                        {position}. {item.storeName} · {GUIDE_ITEM_SOURCE_LABELS[item.source]}
                    </p>
                    <p className="mt-0.5 font-medium text-ink">{item.title}</p>
                    {item.detail && <p className="mt-0.5 text-xs text-coupon">{item.detail}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <form action={moveGuideItem} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" name="direction" value="up" disabled={isFirst} aria-label="Move up" className={SMALL_BUTTON_CLASS}>
                            ↑
                        </button>
                        <button type="submit" name="direction" value="down" disabled={isLast} aria-label="Move down" className={SMALL_BUTTON_CLASS}>
                            ↓
                        </button>
                    </form>
                    <form action={removeGuideItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmitButton
                            message="Remove this item from the guide? The link or coupon itself stays."
                            className="text-xs font-medium text-coupon hover:text-coupon/70"
                        >
                            Remove
                        </ConfirmSubmitButton>
                    </form>
                </div>
            </div>

            <form action={formAction} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="id" value={item.id} />
                <textarea
                    name="comment"
                    required
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    aria-label="Comment"
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={!isChanged || isPending}
                        className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink transition hover:border-coupon hover:text-coupon disabled:opacity-40"
                    >
                        {isPending ? "Saving…" : "Save comment"}
                    </button>
                    {state?.error && <span className="text-xs text-coupon">{state.error}</span>}
                    {state?.success && !isChanged && <span className="text-xs text-green-700">Saved</span>}
                </div>
            </form>
        </li>
    );
}