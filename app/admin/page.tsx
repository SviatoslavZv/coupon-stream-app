import Link from "next/link";
import { ADMIN_NAV, ADMIN_ROUTES } from "@/lib/constants/admin";

// Temporary start page: links to every section. Step 5 turns it into the control panel.
export default function AdminDashboard() {
    const sections = ADMIN_NAV.filter((item) => item.href !== ADMIN_ROUTES.dashboard);

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="mb-8 font-display text-2xl font-black text-ink">Dashboard</h1>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="rounded-2xl border border-line bg-white px-5 py-4 font-medium text-ink transition hover:border-coupon hover:text-coupon-dark"
                    >
                        {section.label} →
                    </Link>
                ))}
            </div>
        </div>
    );
}