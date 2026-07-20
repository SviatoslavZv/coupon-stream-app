"use client";

import { useActionState } from "react";
import type { StoreFormState } from "@/lib/actions/stores";

interface StoreFormValues {
    id?: string;
    slug?: string;
    name?: string;
    logoUrl?: string;
    websiteUrl?: string | null;
    affiliateLink?: string | null;
}

export default function StoreForm({
    action,
    initialValues,
}: {
    action: (
        prevState: StoreFormState | null,
        formData: FormData
    ) => Promise<StoreFormState>;
    initialValues?: StoreFormValues;
}) {
    const [state, formAction, isPending] = useActionState(action, null);

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {initialValues?.id && (
                <input type="hidden" name="id" value={initialValues.id} />
            )}

            {state?.error && (
                <div className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {state.error}
                </div>
            )}

            <div>
                <label htmlFor="slug" className="mb-1 block text-sm font-medium text-ink">
                    Slug
                </label>
                <input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    placeholder="nike"
                    defaultValue={initialValues?.slug}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
                    Name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Nike"
                    defaultValue={initialValues?.name}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div>
                <label htmlFor="logoUrl" className="mb-1 block text-sm font-medium text-ink">
                    Logo URL
                </label>
                <input
                    id="logoUrl"
                    name="logoUrl"
                    type="text"
                    required
                    placeholder="https://..."
                    defaultValue={initialValues?.logoUrl}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div>
                <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium text-ink">
                    Website URL (fallback if no affiliate link yet)
                </label>
                <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="text"
                    placeholder="https://www.nike.com"
                    defaultValue={initialValues?.websiteUrl ?? ""}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div>
                <label htmlFor="affiliateLink" className="mb-1 block text-sm font-medium text-ink">
                    Affiliate Link (leave empty until approved)
                </label>
                <input
                    id="affiliateLink"
                    name="affiliateLink"
                    type="text"
                    placeholder="https://www.awin1.com/..."
                    defaultValue={initialValues?.affiliateLink ?? ""}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90 disabled:opacity-50"
            >
                {isPending ? "Saving…" : initialValues?.id ? "Save Changes" : "Create Store"}
            </button>
        </form>
    );
}