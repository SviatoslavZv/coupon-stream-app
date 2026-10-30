"use client";

import { useActionState, useState } from "react";
import type { ShopLinkFormState } from "@/lib/actions/shop-links";
import {
    SHOP_LINK_KINDS,
    SHOP_LINK_KIND_LABELS,
    type ShopLinkKind,
} from "@/lib/constants/shop-links";
import { BRANDS_BY_LABEL } from "@/lib/constants/taxonomy";
import { extractNetworkLinkId } from "@/lib/network-links";
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

    const [kind, setKind] = useState<ShopLinkKind>(initialValues?.kind ?? "section");
    const [networkLinkId, setNetworkLinkId] = useState(initialValues?.networkLinkId ?? "");
    const [detectedLinkId, setDetectedLinkId] = useState<string | null>(() =>
        extractNetworkLinkId(initialValues?.url ?? "")
    );

    const hasAdvancedValues = Boolean(
        initialValues?.imageUrl ||
        initialValues?.networkLinkId ||
        (initialValues?.commissionRate ?? null) !== null
    );

    function handleUrlChange(url: string) {
        const linkId = extractNetworkLinkId(url);
        const isAutoFilled = networkLinkId === "" || networkLinkId === detectedLinkId;
        setDetectedLinkId(linkId);
        if (isAutoFilled) {
            setNetworkLinkId(linkId ?? "");
        }
    }

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
                        value={kind}
                        onChange={(e) => setKind(e.target.value as ShopLinkKind)}
                        className={INPUT_CLASS}
                    >
                        {SHOP_LINK_KINDS.map((option) => (
                            <option key={option} value={option}>
                                {SHOP_LINK_KIND_LABELS[option]}
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
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={INPUT_CLASS}
                />
                {detectedLinkId && (
                    <p className="mt-1 text-xs text-green-700">
                        Network link ID detected: {detectedLinkId}
                    </p>
                )}
            </div>

            <div className={kind === "product" ? "grid grid-cols-2 gap-4" : undefined}>
                <div>
                    <label htmlFor="brand" className={LABEL_CLASS}>Brand (optional)</label>
                    <select
                        id="brand"
                        name="brand"
                        defaultValue={initialValues?.brand ?? ""}
                        className={INPUT_CLASS}
                    >
                        <option value="">No brand</option>
                        {BRANDS_BY_LABEL.map((brand) => (
                            <option key={brand.slug} value={brand.label}>
                                {brand.label}
                            </option>
                        ))}
                    </select>
                </div>

                {kind === "product" && (
                    <div>
                        <label htmlFor="asin" className={LABEL_CLASS}>ASIN (Amazon only)</label>
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
                )}
            </div>

            <details open={hasAdvancedValues} className="rounded-lg border border-line px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium text-ink/70">More options</summary>

                <div className="mt-3 flex flex-col gap-4">
                    <div>
                        <label htmlFor="imageUrl" className={LABEL_CLASS}>Image URL</label>
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
                            <label htmlFor="networkLinkId" className={LABEL_CLASS}>Network link ID</label>
                            <input
                                id="networkLinkId"
                                name="networkLinkId"
                                type="text"
                                value={networkLinkId}
                                onChange={(e) => setNetworkLinkId(e.target.value)}
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
                </div>
            </details>

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