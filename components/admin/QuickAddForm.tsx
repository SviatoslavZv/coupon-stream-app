"use client";

import { useActionState, useState } from "react";
import { quickAdd } from "@/lib/actions/quick-add";

/** "Paste anything" box: an Amazon link or ASIN, or a product page of one of our stores. */
export default function QuickAddForm() {
    const [state, formAction, isPending] = useActionState(quickAdd, null);
    // Controlled, so the pasted link stays in the box when the server answers with an error
    const [value, setValue] = useState("");

    return (
        <form action={formAction} className="rounded-2xl border border-line bg-white p-4">
            <label htmlFor="quick-add" className="mb-1 block text-sm font-semibold text-ink">
                Quick add
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    id="quick-add"
                    name="q"
                    type="text"
                    required
                    autoComplete="off"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Paste a product link from Amazon or any of our stores, or an ASIN"
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="shrink-0 rounded-full bg-coupon-dark px-5 py-2 text-sm font-bold text-white transition hover:bg-coupon disabled:opacity-50"
                >
                    {isPending ? "Opening…" : "Add →"}
                </button>
            </div>
            {state?.error && <p className="mt-2 text-xs text-coupon">{state.error}</p>}
        </form>
    );
}