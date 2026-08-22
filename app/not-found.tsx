import Link from "next/link";

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
            <span className="font-display text-6xl font-black text-coupon-dark">404</span>
            <h1 className="mt-4 font-display text-2xl font-black text-ink">
                Looks like this deal expired
            </h1>
            <p className="mt-2 text-ink/70">
                We couldn&apos;t find the page you were looking for. It may have
                moved, or the offer may no longer be available.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                    href="/"
                    className="rounded-full bg-coupon-dark px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon"
                >
                    Back to Homepage
                </Link>
                <Link
                    href="/stores"
                    className="rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                >
                    Browse All Stores
                </Link>
            </div>
        </div>
    );
}