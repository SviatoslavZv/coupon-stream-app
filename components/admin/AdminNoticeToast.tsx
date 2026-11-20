"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ADMIN_NOTICES, NOTICE_PARAM, NOTICE_VISIBLE_MS, isAdminNotice } from "@/lib/constants/admin";

/**
 * Shows "Saved ✓" when the address has ?notice=saved, then removes the parameter.
 * window.history.replaceState updates the address without asking the server again,
 * and Next.js passes the change to useSearchParams, so the toast simply disappears.
 */
export default function AdminNoticeToast() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const notice = searchParams.get(NOTICE_PARAM);
    const message = isAdminNotice(notice) ? ADMIN_NOTICES[notice] : null;

    useEffect(() => {
        if (!message) return;

        const timer = window.setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete(NOTICE_PARAM);
            const query = params.toString();
            window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
        }, NOTICE_VISIBLE_MS);

        return () => window.clearTimeout(timer);
    }, [message, pathname, searchParams]);

    if (!message) return null;

    return (
        <div
            role="status"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
            {message}
        </div>
    );
}