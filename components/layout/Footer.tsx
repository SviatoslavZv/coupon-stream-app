import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-line bg-paper">
            <div className="mx-auto max-w-6xl px-4 py-6">
                <p className="text-xs text-ink/50">
                    CouponCreek may earn a commission when you buy through links on our
                    site. This does not affect the price you pay.
                </p>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-ink/60">
                        © 2026 CouponCreek. All rights reserved.
                    </p>

                    <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink/60">
                        <Link href="/disclaimer" className="hover:text-ink">
                            Disclaimer
                        </Link>
                        <Link href="/privacy-policy" className="hover:text-ink">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-of-use" className="hover:text-ink">
                            Terms of Use
                        </Link>
                        <Link href="/cookie-policy" className="hover:text-ink">
                            Cookie Policy
                        </Link>
                        <a
                            href="mailto:couponcreek@gmail.com"
                            className="hover:text-ink"
                        >
                            Contact
                        </a>
                    </nav>


                </div>
                <a
                    href="https://mybiostack.vercel.app?utm_source=couponcreek&utm_medium=footer&utm_campaign=cross_promo"
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