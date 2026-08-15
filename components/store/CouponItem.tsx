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

    const handleShowCode = () => {
        const codeText = coupon.code?.trim() || "";

        setIsRevealed(true);

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

        setTimeout(() => {
            window.open(affiliateUrl, "_blank", "noopener,noreferrer");
        }, 300);
    };

    const isCodeType = coupon.type === "code" || Boolean(coupon.code);

    return (
        <div
            id={anchorId}
            className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-700 ${isHighlighted ? "border-coupon bg-coupon/5" : "border-line"
                }`}
        >
            {/* Основной блок купона */}
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                {/* Верхняя панель на мобилках / Левый блок скидки на десктопе */}
                <div className="flex items-center justify-between sm:w-28 sm:shrink-0 sm:flex-col sm:justify-center text-left sm:text-center">
                    <span className="font-display text-2xl font-black leading-none text-coupon sm:text-3xl">
                        {coupon.discountLabel}
                    </span>

                    {/* Метки (Code/Sale и Verified) только для мобильной строки */}
                    <div className="flex items-center gap-1.5 sm:hidden">
                        <span className="font-mono text-[11px] uppercase tracking-wide text-ink/40">
                            {isCodeType ? "Code" : "Sale"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            <span>✓</span> {formatVerifiedLabel(coupon.lastVerifiedAt)}
                        </span>
                    </div>
                </div>

                {/* Основное содержимое */}
                <div className="flex-1">
                    {/* Метки для десктопа */}
                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="font-mono text-xs uppercase tracking-wide text-ink/40">
                            {isCodeType ? "Code" : "Sale"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                            <span>✓</span> {formatVerifiedLabel(coupon.lastVerifiedAt)}
                        </span>
                    </div>

                    <h4 className="mt-1 font-medium text-ink text-base sm:text-lg leading-snug">
                        {coupon.title}
                    </h4>
                </div>

                {/* Кнопка действия: растягивается во всю ширину на мобилке */}
                <div className="w-full shrink-0 sm:w-auto">
                    {isCodeType ? (
                        <button
                            type="button"
                            onClick={handleShowCode}
                            className="inline-flex w-full items-center justify-center rounded-full bg-coupon px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-coupon/90 active:scale-95 cursor-pointer whitespace-nowrap sm:w-auto sm:min-w-30 sm:py-2.5"
                        >
                            {isCopied ? "Copied!" : isRevealed ? (coupon.code || "REVEALED") : "Show Code"}
                        </button>
                    ) : (
                        <a
                            href={affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center rounded-full bg-coupon px-5 py-3 text-sm font-semibold text-white transition hover:bg-coupon/90 active:scale-95 whitespace-nowrap sm:w-auto sm:min-w-30 sm:py-2.5"
                        >
                            Get Deal
                        </a>
                    )}
                </div>
            </div>

            {/* Нижнаяя панель управления */}
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 sm:px-5">
                <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-left text-xs font-medium text-ink/50 hover:text-ink cursor-pointer transition"
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

            {/* Аккордеон с описанием */}
            {showDetails && (
                <div className="border-t border-line bg-paper px-4 py-3.5 sm:px-5 text-sm text-ink/70">
                    <p className="leading-relaxed">{coupon.description}</p>
                    {coupon.expiresAt && (
                        <p className="mt-1.5 text-xs text-ink/40">
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