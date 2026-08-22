"use client";

import type { FaqItem } from "@/lib/constants/faq";

interface FaqSectionProps {
    title?: string;
    items: FaqItem[];
}

export default function FaqSection({
    title = "Frequently Asked Questions",
    items,
}: FaqSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <section className="mt-12 rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">
                {title}
            </h2>

            <div className="mt-6 flex flex-col gap-4">
                {items.map((item, index) => (
                    <details
                        key={index}
                        className="group rounded-xl border border-line/60 bg-white p-4 transition-all open:border-coupon-dark/40 open:bg-coupon-dark/5"
                    >
                        <summary className="flex cursor-pointer items-center justify-between font-display font-bold text-ink hover:text-coupon-dark focus:outline-none select-none">
                            <span className="pr-4 text-base sm:text-lg">{item.question}</span>
                            <span className="shrink-0 transition-transform duration-200 group-open:rotate-180 text-ink/40 group-open:text-coupon-dark">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </span>
                        </summary>

                        <p className="mt-3 text-sm sm:text-base leading-relaxed text-ink/70 border-t border-line/40 pt-3">
                            {item.answer}
                        </p>
                    </details>
                ))}
            </div>
        </section>
    );
}