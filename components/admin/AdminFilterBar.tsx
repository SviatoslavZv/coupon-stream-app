import Form from "next/form";
import Link from "next/link";
import type { StoreOption } from "@/lib/stores";

const FIELD_CLASS =
    "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-xs font-medium text-ink/60";

export interface FilterSelect {
    name: string;
    label: string;
    value: string;
    options: readonly { value: string; label: string }[];
}

/**
 * Search box, store picker and one extra select for an admin list.
 * A plain GET form: the filters live in the address, so a filtered list can be bookmarked.
 */
export default function AdminFilterBar({
    action,
    query,
    queryPlaceholder,
    stores,
    store,
    select,
    shown,
    total,
}: {
    action: string;
    query: string | undefined;
    queryPlaceholder: string;
    stores: readonly StoreOption[];
    store: string | undefined;
    select: FilterSelect;
    shown: number;
    total: number;
}) {
    const isFiltered = shown !== total;

    return (
        <div className="mb-4">
            <Form
                // A new key resets the fields when the address changes (Back button, Reset link)
                key={`${query ?? ""}|${store ?? ""}|${select.value}`}
                action={action}
                className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[2fr_1.5fr_1fr_auto] sm:items-end"
            >
                <div>
                    <label htmlFor="q" className={LABEL_CLASS}>Search</label>
                    <input
                        id="q"
                        name="q"
                        type="search"
                        defaultValue={query ?? ""}
                        placeholder={queryPlaceholder}
                        className={FIELD_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="store" className={LABEL_CLASS}>Store</label>
                    <select id="store" name="store" defaultValue={store ?? ""} className={FIELD_CLASS}>
                        <option value="">All stores</option>
                        {stores.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={select.name} className={LABEL_CLASS}>{select.label}</label>
                    <select id={select.name} name={select.name} defaultValue={select.value} className={FIELD_CLASS}>
                        {select.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                    Filter
                </button>
            </Form>

            <p className="mt-2 text-xs text-ink/60">
                {isFiltered ? `Showing ${shown} of ${total}` : `${total} in total`}
                {isFiltered && (
                    <>
                        {" · "}
                        <Link href={action} className="font-medium text-coupon-dark hover:underline">
                            Reset filters
                        </Link>
                    </>
                )}
            </p>
        </div>
    );
}