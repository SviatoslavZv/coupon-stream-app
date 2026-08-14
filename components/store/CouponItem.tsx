"use client";

import { useEffect, useState } from "react";
import type { Coupon } from "@/types";
import ShareButton from "@/components/ui/ShareButton";

function formatVerifiedLabel(isoDate?: string | null): string {
    if (!isoDate) return "Verified";

    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) return "Verified today";
    if (diffDays === 1) return "Verified yesterday";
    if (diffDays <= 3) return `Verified ${diffDays} days ago`;

    return "Verified";
}

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
    const affiliateUrl = `/api/go/${storeSlug}?coupon=${coupon.id}`;

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

    // ⚡️ НАДЁЖНЫЙ ОБРАБОТЧИК КЛИКА (без падений Clipboard API)
    const handleShowCode = () => {
        const codeText = coupon.code?.trim() || "";

        // 1. Мгновенно обновляем UI, чтобы пользователь увидел изменение кнопки
        setIsRevealed(true);

        // 2. Работа с буфером
        if (codeText && typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard
                .writeText(codeText)
                .then(() => {
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2500);
                })
                .catch((err) => {
                    console.error("Clipboard access denied:", err);
                });
        }

        // 3. ОТКРЫВАЕМ ВКЛАДКУ С ЗАДЕРЖКОЙ
        // Это "секретный ингредиент": 150мс достаточно, чтобы отрисовать 
        // изменение текста, но достаточно быстро, чтобы не раздражать пользователя.
        setTimeout(() => {
            window.open(affiliateUrl, "_blank", "noopener,noreferrer");
        }, 300);
    };

    // Определение типа: код это или акция
    const isCodeType = coupon.type === "code" || Boolean(coupon.code);

    return (
        <div
            id={anchorId}
            className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-700 ${isHighlighted ? "border-coupon bg-coupon/5" : "border-line"
                }`}
        >
            <div className="flex items-center gap-4 p-5">
                {/* Discount Label */}
                <div className="w-24 shrink-0 text-center">
                    <span className="font-display text-xl font-black leading-none text-coupon">
                        {coupon.discountLabel}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs uppercase tracking-wide text-ink/40">
                            {isCodeType ? "Code" : "Sale"}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                            <span>✓</span> {formatVerifiedLabel(coupon.lastVerifiedAt)}
                        </span>
                    </div>
                    <h4 className="font-medium text-ink mt-0.5">{coupon.title}</h4>
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                    {isCodeType ? (
                        <button
                            type="button"
                            onClick={handleShowCode}
                            className="inline-flex items-center justify-center min-w-[120px] rounded-full bg-coupon px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coupon/90 active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                            {isCopied ? "Copied!" : isRevealed ? (coupon.code || "REVEALED") : "Show Code"}
                        </button>
                    ) : (
                        <a
                            href={affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center min-w-[120px] rounded-full bg-coupon px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coupon/90 active:scale-95 whitespace-nowrap"
                        >
                            Get Deal
                        </a>
                    )}
                </div>
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between border-t border-line px-5 py-2">
                <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-left text-xs font-medium text-ink/50 hover:text-ink cursor-pointer"
                >
                    {showDetails ? "Hide Details −" : "See Details +"}
                </button>

                <ShareButton
                    path={`/store/${storeSlug}#${anchorId}`}
                    title={`${coupon.title} — CouponCreek`}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-coupon hover:text-coupon"
                >
                    {isCodeType ? "Share Code" : "Share Deal"}
                </ShareButton>
            </div>

            {/* Details Accordion */}
            {showDetails && (
                <div className="border-t border-line bg-paper px-5 py-3 text-sm text-ink/70">
                    <p>{coupon.description}</p>
                    {coupon.expiresAt && (
                        <p className="mt-1 text-xs text-ink/40">
                            Expires {coupon.expiresAt}
                        </p>
                    )}
                    {!!coupon.usageCount && coupon.usageCount > 0 && (
                        <p className="mt-1 text-xs text-ink/40">
                            Used {coupon.usageCount}{" "}
                            {coupon.usageCount === 1 ? "time" : "times"}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}