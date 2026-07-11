"use client";

import { useState } from "react";
import type { Coupon } from "@/types";

export default function CouponItem({ coupon }: { coupon: Coupon }) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleShowCode = async () => {
        setIsRevealed(true);

        if (coupon.code) {
            try {
                await navigator.clipboard.writeText(coupon.code);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch {
                // Clipboard write failed (e.g. unsupported browser or permissions) —
                // the code is still visible on the button, so the user can copy it manually.
            }
        }

        // TODO: once real affiliate links exist (post-Supabase), also open
        // `/api/go/${storeSlug}` in a new tab here, so the click both copies
        // the code AND routes the user through our affiliate link.
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center gap-4 p-5">
                <div className="w-24 shrink-0 text-center">
                    <span className="font-display text-xl font-black leading-none text-coupon">
                        {coupon.discountLabel}
                    </span>
                </div>

                <div className="flex-1">
                    <span className="font-mono text-xs uppercase tracking-wide text-ink/40">
                        {coupon.type === "code" ? "Code" : "Sale"}
                    </span>
                    <h4 className="font-medium text-ink">{coupon.title}</h4>
                </div>

                <div className="shrink-0">
                    {coupon.type === "code" ? (
                        <button
                            onClick={handleShowCode}
                            className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                        >
                            {isCopied ? "Copied!" : isRevealed ? coupon.code : "Show Code"}
                        </button>
                    ) : (
                        <button className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90">
                            Get Deal
                        </button>
                    )}
                </div>
            </div>

            <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full border-t border-line px-5 py-2 text-left text-xs font-medium text-ink/50 hover:text-ink"
            >
                {showDetails ? "Hide Details −" : "See Details +"}
            </button>

            {showDetails && (
                <div className="border-t border-line bg-paper px-5 py-3 text-sm text-ink/70">
                    <p>{coupon.description}</p>
                    <p className="mt-1 text-xs text-ink/40">
                        Expires {coupon.expiresAt}
                    </p>
                </div>
            )}
        </div>
    );
}