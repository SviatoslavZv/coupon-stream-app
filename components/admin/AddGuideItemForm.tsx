"use client";

import { useActionState, useState } from "react";
import { addGuideItem } from "@/lib/actions/guide-items";
import {
    GUIDE_ITEM_SOURCES,
    GUIDE_ITEM_SOURCE_LABELS,
    GUIDE_PICKER_RESULTS_LIMIT,
    type GuideItemSource,
} from "@/lib/constants/guides";
import { matchesAllWords } from "@/lib/utils";
import type { FormState } from "@/types";

/** One catalog entry that can go into the guide: a shop link or a coupon. */
export interface GuideItemOption {
    id: string;
    source: GuideItemSource;
    storeName: string;
    title: string;
    /** Coupon: the discount label. Shop link: the brand, if known. */
    detail: string | null;
    isHidden: boolean;
}

type SourceFilter = GuideItemSource | "all";

const INPUT_CLASS =
    "w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";
const CHIP_CLASS = "rounded-full border px-3 py-1 text-xs font-semibold transition";

function searchText(option: GuideItemOption): string {
    return `${option.storeName} ${option.title} ${option.detail ?? ""}`;
}

function OptionSummary({ option }: { option: GuideItemOption }) {
    return (
        <>
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
                {option.storeName} · {GUIDE_ITEM_SOURCE_LABELS[option.source]}
                {option.isHidden && <span className="ml-1 text-coupon">· hidden</span>}
            </span>
            <span className="block text-sm text-ink">
                {option.detail && <span className="font-semibold">{option.detail} · </span>}
                {option.title}
            </span>
        </>
    );
}

export default function AddGuideItemForm({ guideId, options }: { guideId: string; options: GuideItemOption[] }) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<SourceFilter>("all");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    // Controlled, so the comment survives a server error (React resets uncontrolled fields after every submit)
    const [comment, setComment] = useState("");

    // After a successful add, start over: empty search, no choice, empty comment
    async function submit(prevState: FormState | null, formData: FormData): Promise<FormState> {
        const result = await addGuideItem(prevState, formData);
        if (result.success) {
            setSelectedId(null);
            setQuery("");
            setComment("");
        }
        return result;
    }
    const [state, formAction, isPending] = useActionState(submit, null);

    // The chosen entry disappears from the list once it is in the guide, so look it up every render
    const selected = options.find((option) => option.id === selectedId) ?? null;

    const matches = options.filter(
        (option) => (filter === "all" || option.source === filter) && matchesAllWords(searchText(option), query),
    );
    const shown = matches.slice(0, GUIDE_PICKER_RESULTS_LIMIT);

    return (
        <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
            <h3 className="font-display text-base font-bold text-ink">Add item</h3>
            <input type="hidden" name="guideId" value={guideId} />

            {state?.error && <p className="text-sm text-coupon">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-700">Item added.</p>}

            {selected ? (
                <div className="flex items-start justify-between gap-3 rounded-lg border border-coupon bg-coupon/5 px-3 py-2">
                    <div>
                        <OptionSummary option={selected} />
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="shrink-0 text-xs font-medium text-ink/60 hover:text-ink"
                    >
                        Change
                    </button>
                    <input type="hidden" name="source" value={selected.source} />
                    <input type="hidden" name="itemId" value={selected.id} />
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <label htmlFor="itemSearch" className={LABEL_CLASS}>Find in the catalog</label>
                    <input
                        id="itemSearch"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Store, product or discount, e.g. zulily sneaker"
                        autoComplete="off"
                        className={INPUT_CLASS}
                    />

                    <div className="flex flex-wrap gap-2">
                        {(["all", ...GUIDE_ITEM_SOURCES] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                aria-pressed={filter === value}
                                className={`${CHIP_CLASS} ${filter === value
                                    ? "border-ink bg-ink text-white"
                                    : "border-line text-ink/70 hover:border-ink"
                                    }`}
                            >
                                {value === "all" ? "All" : GUIDE_ITEM_SOURCE_LABELS[value]}
                            </button>
                        ))}
                    </div>

                    {shown.length > 0 ? (
                        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
                            {shown.map((option) => (
                                <li key={option.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedId(option.id)}
                                        className="w-full px-3 py-2 text-left transition hover:bg-paper"
                                    >
                                        <OptionSummary option={option} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-ink/60">
                            {options.length > 0 ? "Nothing matches. Try fewer words." : "Nothing available to add."}
                        </p>
                    )}

                    {matches.length > shown.length && (
                        <p className="text-xs text-ink/50">
                            Showing {shown.length} of {matches.length}. Type more words to narrow down.
                        </p>
                    )}
                </div>
            )}

            <div>
                <label htmlFor="comment" className={LABEL_CLASS}>Comment</label>
                <textarea
                    id="comment"
                    name="comment"
                    required
                    rows={3}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Who it suits and how it differs from the other picks"
                    className={INPUT_CLASS}
                />
            </div>

            <button
                type="submit"
                disabled={isPending || !selected}
                className="self-start rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50"
            >
                {isPending ? "Adding…" : "Add to guide"}
            </button>
        </form>
    );
}