"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { ADMIN_NAV, ADMIN_ROUTES, type AdminNavItem } from "@/lib/constants/admin";

const SITE_HOME = "/";

function isActive(pathname: string, { href, exact }: AdminNavItem): boolean {
    return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
                <Link
                    href={ADMIN_ROUTES.dashboard}
                    className="shrink-0 font-display text-lg font-black tracking-tight"
                >
                    <span className="text-ink">Coupon</span>
                    <span className="text-coupon">Creek</span>
                    <span className="ml-1.5 rounded bg-ink px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-white">
                        Admin
                    </span>
                </Link>

                <nav aria-label="Admin" className="flex flex-1 gap-1 overflow-x-auto">
                    {ADMIN_NAV.map((item) => {
                        const active = isActive(pathname, item);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${active ? "bg-ink text-white" : "text-ink/70 hover:bg-paper hover:text-ink"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex shrink-0 items-center gap-2">
                    <a
                        href={SITE_HOME}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden text-sm text-ink/60 transition hover:text-coupon-dark sm:inline"
                    >
                        View site ↗
                    </a>
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}