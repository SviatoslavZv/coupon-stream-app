"use client";

import { useState } from "react";
import Link from "next/link";
import ShareButton from "@/components/ui/ShareButton";
import StoreSearch from "@/components/layout/StoreSearch";
import type { Store } from "@/types";

interface HeaderClientProps {
    stores: Store[];
}

export default function HeaderClient({ stores }: HeaderClientProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-line/40 bg-paper/90 backdrop-blur-md transition-all">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="shrink-0 font-display text-2xl font-black tracking-tight transition hover:opacity-90"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <span className="text-ink">Coupon</span>
                        <span className="text-coupon">Creek</span>
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden flex-1 max-w-md sm:block">
                        <StoreSearch stores={stores} />
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden items-center gap-6 text-sm font-medium text-ink lg:flex">
                        <Link href="/stores" className="transition hover:text-coupon">
                            Stores
                        </Link>
                        <Link href="/categories" className="transition hover:text-coupon">
                            Categories
                        </Link>
                        <Link href="/brands" className="transition hover:text-coupon">
                            Brands
                        </Link>
                        <Link href="/sales-calendar" className="transition hover:text-coupon">
                            Calendar
                        </Link>
                        <ShareButton
                            path="/"
                            title="CouponCreek — Promo Codes & Deals for Top Fashion Stores"
                            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                        />
                    </nav>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-2 sm:hidden">
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition active:scale-95"
                            aria-label="Open search"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition active:scale-95"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMenuOpen && (
                    <div className="border-t border-line/50 bg-paper px-4 py-6 sm:hidden">
                        <nav className="flex flex-col gap-4 text-base font-semibold text-ink">
                            <Link
                                href="/stores"
                                className="rounded-lg p-2 transition hover:bg-line/20 hover:text-coupon"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Stores
                            </Link>
                            <Link
                                href="/categories"
                                className="rounded-lg p-2 transition hover:bg-line/20 hover:text-coupon"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Categories
                            </Link>
                            <Link
                                href="/brands"
                                className="rounded-lg p-2 transition hover:bg-line/20 hover:text-coupon"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Brands
                            </Link>
                            <Link
                                href="/sales-calendar"
                                className="rounded-lg p-2 transition hover:bg-line/20 hover:text-coupon"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Calendar
                            </Link>

                            <div className="mt-2 border-t border-line/40 pt-4">
                                <ShareButton
                                    path="/"
                                    title="CouponCreek — Promo Codes & Deals for Top Fashion Stores"
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                                />
                            </div>
                        </nav>
                    </div>
                )}

                {/* Bottom Border Decorative Pattern */}
                <div
                    className="h-1.5 w-full opacity-60"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 6px 6px, transparent 6px, var(--color-line) 6px)",
                        backgroundSize: "12px 12px",
                        backgroundPosition: "top",
                    }}
                    aria-hidden="true"
                />
            </header>

            {/* Mobile Search Fullscreen Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-paper p-4 sm:hidden">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="font-display font-bold text-lg text-ink">Search Stores</span>
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(false)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-line/30 text-ink font-bold text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    <StoreSearch
                        stores={stores}
                        isMobileOverlay={true}
                        onCloseMobile={() => setIsSearchOpen(false)}
                    />
                </div>
            )}
        </>
    );
}