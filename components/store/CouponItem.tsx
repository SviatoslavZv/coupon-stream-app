"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { useEffect, useState } from "react";
import type { Coupon } from "@/types";
import ShareButton from "@/components/ui/ShareButton";

// 1. Проверка на истечение срока действия
function isCouponExpired(expiresAt?: string | null): boolean {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt).getTime();
    return !isNaN(expiryDate) && expiryDate < Date.now();
}

// 2. Форматирование метки верификации и статуса
function formatVerifiedLabel(isoDate?: string | null, expiresAt?: string | null): {
    text: string;
    isExpired: boolean;
} {
    if (isCouponExpired(expiresAt)) {
        return { text: "Expired", isExpired: true };
    }

    if (!isoDate) return { text: "Verified", isExpired: false };

    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) return { text: "Verified today", isExpired: false };
    if (diffDays === 1) return { text: "Verified yesterday", isExpired: false };
    if (diffDays <= 3) return { text: `Verified ${diffDays} days ago`, isExpired: false };

    return { text: "Verified", isExpired: false };
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

        sendGAEvent("event", "coupon_click", {
            event_category: "Coupon",
            event_label: coupon.title,
            store_slug: storeSlug,
            coupon_id: coupon.id,
            coupon_type: "code",
        });

        if (codeText && typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard
                .writeText(codeText)
                .then(() => setIsCopied(true))
                .catch((err) => {
                    console.error("Clipboard access denied:", err);
                });
        }

        setIsRevealed(true);

        const newTab = window.open(affiliateUrl, "_blank");
        if (newTab) {
            newTab.opener = null;
        }
    };

    const isExpired = isCouponExpired(coupon.expiresAt);
    const status = formatVerifiedLabel(coupon.lastVerifiedAt, coupon.expiresAt);
    const hasValidCode = Boolean(coupon.code && coupon.code.trim().length > 0);

    // Купон считается кодом, только если он не просрочен и код физически существует
    const isCodeType = (coupon.type === "code" || hasValidCode) && !isExpired;

    return (
        <div
            id={anchorId}
            className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-700 ${isExpired
                ? "border-line opacity-75"
                : isHighlighted
                    ? "border-coupon bg-coupon/5"
                    : "border-line"
                }`}
        >
            {/* Основной блок */}
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                {/* Скидка + мобильные метки */}
                <div className="flex items-center justify-between sm:w-28 sm:shrink-0 sm:flex-col sm:justify-center text-left sm:text-center">
                    <span className={`font-display text-2xl font-black leading-none sm:text-3xl ${isExpired ? "text-ink/40" : "text-coupon"}`}>
                        {coupon.discountLabel}
                    </span>

                    <div className="flex items-center gap-1.5 sm:hidden">
                        <span className="font-mono text-[11px] uppercase tracking-wide text-ink/40">
                            {isCodeType ? "Code" : "Sale"}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.isExpired ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"
                            }`}>
                            {!status.isExpired && <span>✓</span>} {status.text}
                        </span>
                    </div>
                </div>

                {/* Заголовок купона + десктопные метки */}
                <div className="flex-1">
                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="font-mono text-xs uppercase tracking-wide text-ink/40">
                            {isCodeType ? "Code" : "Sale"}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.isExpired ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"
                            }`}>
                            {!status.isExpired && <span>✓</span>} {status.text}
                        </span>
                    </div>

                    <h4 className="mt-1 font-medium text-ink text-base sm:text-lg leading-snug">
                        {coupon.title}
                    </h4>
                </div>

                {/* Кнопка действия */}
                <div className="w-full shrink-0 sm:w-auto">
                    {isCodeType ? (
                        <button
                            type="button"
                            onClick={handleShowCode}
                            className="inline-flex w-full items-center justify-center rounded-full bg-coupon px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-coupon/90 active:scale-95 cursor-pointer whitespace-nowrap sm:w-auto sm:min-w-30 sm:py-2.5"
                        >
                            {isRevealed ? (
                                isCopied ? (
                                    <span className="flex flex-col items-center leading-tight">
                                        <span className="flex items-center gap-1 text-[10px] font-medium ">
                                            <span>✓</span> Copied to clipboard
                                        </span>
                                        <span>{coupon.code}</span>
                                    </span>
                                ) : (
                                    coupon.code || "Get Deal"
                                )
                            ) : (
                                "Show Code"
                            )}
                        </button>
                    ) : (
                        <a
                            href={affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                sendGAEvent("event", "coupon_click", {
                                    event_category: "Coupon",
                                    event_label: coupon.title,
                                    store_slug: storeSlug,
                                    coupon_id: coupon.id,
                                    coupon_type: "deal",
                                });
                            }}
                            className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition active:scale-95 whitespace-nowrap sm:w-auto sm:min-w-30 sm:py-2.5 ${isExpired ? "bg-ink/40 hover:bg-ink/50" : "bg-coupon hover:bg-coupon/90"
                                }`}
                        >
                            {isExpired ? "Expired Deal" : "Get Deal"}
                        </a>
                    )}
                </div>
            </div>

            {/* Нижняя панель */}
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

            {/* Аккордеон деталей */}
            {
                showDetails && (
                    <div className="border-t border-line bg-paper px-4 py-3.5 sm:px-5 text-sm text-ink/70">
                        <p className="leading-relaxed">{coupon.description}</p>
                        {coupon.expiresAt && (
                            <p className={`mt-1.5 text-xs ${isExpired ? "font-semibold text-red-600" : "text-ink/40"}`}>
                                {isExpired ? `Expired on ${coupon.expiresAt}` : `Expires ${coupon.expiresAt}`}
                            </p>
                        )}
                        {!!coupon.usageCount && coupon.usageCount > 0 && (
                            <p className="mt-1 text-xs text-ink/40">
                                Used {coupon.usageCount}{" "}
                                {coupon.usageCount === 1 ? "time" : "times"}
                            </p>
                        )}
                    </div>
                )
            }
        </div >
    );
}