import Link from "next/link";
import type { ReactNode } from "react";
import { ATTENTION_LIST_LIMIT } from "@/lib/constants/admin";

export interface AttentionRow {
    id: string;
    title: string;
    detail: string;
    href: string;
}

/** One "Needs attention" block: up to ATTENTION_LIST_LIMIT rows, or a calm "all good" line. */
export default function AttentionList({
    title,
    hint,
    rows,
    emptyText,
    moreHref,
}: {
    title: string;
    hint: ReactNode;
    rows: readonly AttentionRow[];
    emptyText: string;
    moreHref?: string;
}) {
    const visible = rows.slice(0, ATTENTION_LIST_LIMIT);
    const hiddenCount = rows.length - visible.length;

    return (
        <section aria-label={title} className="rounded-2xl border border-line bg-white p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-base font-black text-ink">
                    {title}
                    <span className={`ml-2 font-mono text-sm font-normal ${rows.length > 0 ? "text-coupon" : "text-ink/40"}`}>
                        {rows.length}
                    </span>
                </h3>
                <p className="text-xs text-ink/50">{hint}</p>
            </div>

            {rows.length === 0 ? (
                <p className="text-sm text-green-700">✓ {emptyText}</p>
            ) : (
                <ul className="divide-y divide-line">
                    {visible.map((row) => (
                        <li key={row.id}>
                            <Link
                                href={row.href}
                                className="flex items-center justify-between gap-3 py-2 text-sm transition hover:text-coupon-dark"
                            >
                                <span className="truncate text-ink">{row.title}</span>
                                <span className="shrink-0 text-xs text-ink/60">{row.detail}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {hiddenCount > 0 && moreHref && (
                <Link href={moreHref} className="mt-2 inline-block text-xs font-medium text-coupon-dark hover:underline">
                    +{hiddenCount} more →
                </Link>
            )}
        </section>
    );
}