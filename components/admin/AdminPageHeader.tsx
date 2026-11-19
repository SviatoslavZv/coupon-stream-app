import type { ReactNode } from "react";

/** Title row of an admin section: name, item count and action buttons on the right. */
export default function AdminPageHeader({
    title,
    count,
    children,
}: {
    title: string;
    count?: number;
    children?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-black text-ink">
                {title}
                {count !== undefined && (
                    <span className="ml-2 font-mono text-sm font-normal text-ink/50">({count})</span>
                )}
            </h1>
            {children && <div className="flex flex-wrap gap-2">{children}</div>}
        </div>
    );
}