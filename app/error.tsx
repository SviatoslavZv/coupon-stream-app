"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
            <span className="font-display text-6xl font-black text-coupon">Oops</span>
            <h1 className="mt-4 font-display text-2xl font-black text-ink">
                Something went wrong on our end
            </h1>
            <p className="mt-2 text-ink/70">
                We&apos;re working on it. Please try again in a moment, or head back
                to the homepage.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    Try Again
                </button>
                <Link
                    href="/"
                    className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                >
                    Back to Homepage
                </Link>
            </div>
        </div>
    );
}