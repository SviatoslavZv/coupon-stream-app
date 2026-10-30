"use client";

import { useActionState } from "react";
import { deleteShopLink } from "@/lib/actions/shop-links";

export default function DeleteShopLinkButton({ id }: { id: string }) {
    const [state, formAction, isPending] = useActionState(deleteShopLink, null);

    return (
        <form action={formAction} className="flex flex-col items-end">
            <input type="hidden" name="id" value={id} />
            <button
                type="submit"
                disabled={isPending}
                onClick={(e) => {
                    if (!confirm("Delete this shop link?")) {
                        e.preventDefault();
                    }
                }}
                className="text-xs font-medium text-coupon hover:text-coupon/70 disabled:opacity-50"
            >
                {isPending ? "Deleting…" : "Delete"}
            </button>
            {state?.error && (
                <p role="alert" className="mt-1 max-w-48 text-right text-[11px] leading-snug text-coupon">
                    {state.error}
                </p>
            )}
        </form>
    );
}