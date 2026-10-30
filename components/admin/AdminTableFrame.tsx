import type { ReactNode } from "react";

export default function AdminTableFrame({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`max-h-[60vh] overflow-y-auto rounded-2xl border border-line bg-white [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:shadow-[0_1px_0_var(--color-line)] ${className}`}
        >
            {children}
        </div>
    );
}