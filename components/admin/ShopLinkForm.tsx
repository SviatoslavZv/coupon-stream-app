"use client";

import { useActionState } from "react";
import type { ShopLinkFormState } from "@/lib/actions/shop-links";
import { SHOP_LINK_KINDS, SHOP_LINK_KIND_LABELS } from "@/lib/constants/shop-links";
import type { AdminShopLink } from "@/lib/shop-links";
import type { StoreOption } from "@/lib/stores";

const INPUT_CLASS =
    "w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";

export default function ShopLinkForm({
    action,
    storeOptions,
    initialValues,
}: {
    action: (prevState: ShopLinkFormState | null, formData: FormData) => Promise<ShopLinkFormState>;
    storeOptions: StoreOption[];
    initialValues?: AdminShopLink;
}) {
    const [state, formAction, isPending] = useActionState(action, null);

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {initialValues && <input type="hidden" name="id" value={initialValues.id} />}

            {state?.error && (
                <div className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {state.error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="storeId" className={LABEL_CLASS}>Store</label>
                    <select
                        id="storeId"
                        name="storeId"
                        required
                        defaultValue={initialValues?.storeId ?? ""}
                        className={INPUT_CLASS}
                    >
                        <option value="" disabled>Choose a store…</option>
                        {storeOptions.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="kind" className={LABEL_CLASS}>Type</label>
                    <select
                        id="kind"
                        name="kind"
                        required
                        defaultValue={initialValues?.kind ?? "section"}
                        className={INPUT_CLASS}
                    >
                        {SHOP_LINK_KINDS.map((kind) => (
                            <option key={kind} value={kind}>
                                {SHOP_LINK_KIND_LABELS[kind]}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="title" className={LABEL_CLASS}>Title</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    placeholder="Women's Boots Sale"
                    defaultValue={initialValues?.title}
                    className={INPUT_CLASS}
                />
            </div>

            <div>
                <label htmlFor="url" className={LABEL_CLASS}>Tracking link</label>
                <input
                    id="url"
                    name="url"
                    type="url"
                    required
                    placeholder="https://click.linksynergy.com/deeplink?…"
                    defaultValue={initialValues?.url}
                    className={INPUT_CLASS}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="brand" className={LABEL_CLASS}>Brand (optional)</label>
                    <input
                        id="brand"
                        name="brand"
                        type="text"
                        defaultValue={initialValues?.brand ?? ""}
                        className={INPUT_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="asin" className={LABEL_CLASS}>ASIN (Amazon products only)</label>
                    <input
                        id="asin"
                        name="asin"
                        type="text"
                        maxLength={10}
                        placeholder="B0CXXXXXXX"
                        defaultValue={initialValues?.asin ?? ""}
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="imageUrl" className={LABEL_CLASS}>Image URL (optional)</label>
                <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://…"
                    defaultValue={initialValues?.imageUrl ?? ""}
                    className={INPUT_CLASS}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="networkLinkId" className={LABEL_CLASS}>Network link ID (optional)</label>
                    <input
                        id="networkLinkId"
                        name="networkLinkId"
                        type="text"
                        defaultValue={initialValues?.networkLinkId ?? ""}
                        className={INPUT_CLASS}
                    />
                </div>

                <div>
                    <label htmlFor="commissionRate" className={LABEL_CLASS}>Commission % (private)</label>
                    <input
                        id="commissionRate"
                        name="commissionRate"
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        defaultValue={initialValues?.commissionRate ?? ""}
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
                <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={initialValues?.isActive ?? true}
                    className="h-4 w-4 accent-coupon"
                />
                Active (shown on the site)
            </label>

            <button
                type="submit"
                disabled={isPending}
                className="self-start rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90 disabled:opacity-50"
            >
                {isPending ? "Saving…" : initialValues ? "Save Changes" : "Create Link"}
            </button>
        </form>
    );
}