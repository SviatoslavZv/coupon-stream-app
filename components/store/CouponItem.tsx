"use client";

import { useEffect, useState } from "react";
import type { Coupon } from "@/types";
import ShareButton from "@/components/ui/ShareButton";

export default function CouponItem({
    coupon,
    storeSlug,
}: {
    coupon: Coupon;
    storeSlug: string;
}) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);

    const anchorId = `coupon-${coupon.id}`;

    useEffect(() => {
        if (window.location.hash === `#${anchorId}`) {
            const revealTimer = setTimeout(() => setIsHighlighted(true), 0);
            const hideTimer = setTimeout(() => setIsHighlighted(false), 2000);

            return () => {
                clearTimeout(revealTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [anchorId]);

    const handleShowCode = async () => {
        setIsRevealed(true);

        if (coupon.code) {
            try {
                await navigator.clipboard.writeText(coupon.code);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 900);
            } catch {
                // Clipboard write failed — the code is still visible on the button,
                // so the user can copy it manually.
            }
        }

        setTimeout(() => {
            window.open(`/api/go/${storeSlug}`, "_blank");
        }, 1800);
    };

    return (
        <div
            id={anchorId}
            className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-700 ${isHighlighted ? "border-coupon bg-coupon/5" : "border-line"
                }`}
        >
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
                        <a
                            href={`/api/go/${storeSlug}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                        >
                            Get Deal
                        </a>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-line px-5 py-2">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-left text-xs font-medium text-ink/50 hover:text-ink"
                >
                    {showDetails ? "Hide Details −" : "See Details +"}
                </button>

                <ShareButton
                    path={`/store/${storeSlug}#${anchorId}`}
                    title={`${coupon.title} — CouponCreek`}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-coupon hover:text-coupon"
                >
                    {coupon.type === "code" ? "Share Code" : "Share Deal"}
                </ShareButton>
            </div>

            {
                showDetails && (
                    <div className="border-t border-line bg-paper px-5 py-3 text-sm text-ink/70">
                        <p>{coupon.description}</p>
                        <p className="mt-1 text-xs text-ink/40">
                            Expires {coupon.expiresAt}
                        </p>
                    </div>
                )
            }
        </div >
    );
}