"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import type { Brand } from "@/lib/brands";
import { createBrand } from "@/lib/actions/brands";

const SMALL_BUTTON_CLASS =
    "rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-coupon disabled:opacity-50";

/**
 * Brand dropdown with "+ Add brand": a missing brand is added to the database
 * and selected at once, without leaving the form.
 * Works on its own (defaultValue) or driven by the parent form (value + onChange).
 */
export default function BrandSelect({
    brands,
    className,
    emptyLabel = "None",
    defaultValue = "",
    value,
    onChange,
}: {
    /** All brands A to Z, from the database */
    brands: Brand[];
    className: string;
    emptyLabel?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (label: string) => void;
}) {
    const [options, setOptions] = useState(brands);
    const [ownValue, setOwnValue] = useState(defaultValue);
    const selected = value ?? ownValue;

    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function select(label: string) {
        setOwnValue(label);
        onChange?.(label);
    }

    function closeAdding() {
        setIsAdding(false);
        setNewLabel("");
        setError(null);
    }

    function handleAdd() {
        setError(null);
        startTransition(async () => {
            const result = await createBrand(newLabel);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            setOptions((current) =>
                [...current, result.brand].sort((a, b) =>
                    a.label.localeCompare(b.label),
                ),
            );
            select(result.brand.label);
            closeAdding();
        });
    }

    // Enter here must add the brand, not submit the whole form
    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleAdd();
        }
    }

    return (
        <div>
            <div className="flex gap-2">
                <select
                    id="brand"
                    name="brand"
                    value={selected}
                    onChange={(event) => select(event.target.value)}
                    className={className}
                >
                    <option value="">{emptyLabel}</option>
                    {options.map((brand) => (
                        <option key={brand.slug} value={brand.label}>
                            {brand.label}
                        </option>
                    ))}
                </select>
                {!isAdding && (
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className={`${SMALL_BUTTON_CLASS} shrink-0 whitespace-nowrap`}
                    >
                        + Add brand
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                        type="text"
                        value={newLabel}
                        onChange={(event) => setNewLabel(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="New brand name, e.g. HEYDUDE"
                        aria-label="New brand name"
                        autoFocus
                        className={`${className} flex-1`}
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={isPending || newLabel.trim() === ""}
                        className={SMALL_BUTTON_CLASS}
                    >
                        {isPending ? "Adding…" : "Add"}
                    </button>
                    <button
                        type="button"
                        onClick={closeAdding}
                        className={SMALL_BUTTON_CLASS}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-coupon">{error}</p>}
        </div>
    );
}