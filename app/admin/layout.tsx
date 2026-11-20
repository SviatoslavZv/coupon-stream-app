import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNoticeToast from "@/components/admin/AdminNoticeToast";

export const metadata: Metadata = {
    title: { default: "Admin", template: "%s · Admin" },
    robots: { index: false, follow: false },
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Sends visitors who are not admins to the login page.
    // This is a convenience, not the protection: pages, data functions and actions check on their own.
    await requireAdmin();

    return (
        <div className="flex min-h-screen flex-col bg-paper">
            <AdminHeader />
            <main className="flex-1">{children}</main>
            <Suspense fallback={null}>
                <AdminNoticeToast />
            </Suspense>
        </div>
    );
}