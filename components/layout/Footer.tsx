
export default function Footer() {
    return (
        <footer className="border-t border-line bg-paper">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink/60">
                    © 2026 CouponStream. All rights reserved.
                </p>

                <a
                    href="https://mybiostack.vercel.app?utm_source=couponstream&utm_medium=footer&utm_campaign=cross_promo"
                    target="_blank"
                    rel="noopener"
                    className="text-sm text-ink/60 hover:text-ink"
                >
                    Also building:{" "}
                    <span className="font-medium text-coupon">BioStack</span> — build
                    your perfect supplement stack
                    <span className="sr-only"> (opens in a new tab)</span>
                </a>
            </div>
        </footer>
    );
}