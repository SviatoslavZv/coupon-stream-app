import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-line bg-paper">
            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Верхняя секция: Юридическое уведомление (Affiliate Disclaimer) */}
                <p className="text-xs leading-relaxed text-ink/70">
                    CouponCreek may earn a commission when you buy through links on our
                    site. This does not affect the price you pay. All promo codes and deals are 100% free for users.
                </p>

                {/* Средняя секция: Навигация и Копирайт */}
                <div className="mt-3 flex flex-col gap-4 border-t border-line/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs sm:text-sm text-ink/70 order-2 sm:order-1">
                        © {new Date().getFullYear()} CouponCreek. All rights reserved.
                    </p>

                    <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-ink/70 order-1 sm:order-2">
                        <Link href="/disclaimer" className="hover:text-ink transition py-1">
                            Disclaimer
                        </Link>
                        <Link href="/privacy-policy" className="hover:text-ink transition py-1">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-of-use" className="hover:text-ink transition py-1">
                            Terms of Use
                        </Link>
                        <Link href="/cookie-policy" className="hover:text-ink transition py-1">
                            Cookie Policy
                        </Link>
                        <a
                            href="mailto:couponcreek@gmail.com"
                            className="font-medium text-ink/80 hover:text-coupon transition py-1"
                        >
                            Contact Us
                        </a>
                    </nav>
                </div>

                {/* Нижняя секция: Кросс-промо блок */}
                <div className="mt-3 border-t border-line/30 pt-2">
                    <a
                        href="https://mybiostack.vercel.app?utm_source=couponcreek&utm_medium=footer&utm_campaign=cross_promo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-wrap items-center gap-1.5 text-xs text-ink/70 hover:text-ink transition"
                    >
                        <span>Also building:</span>
                        <span className="font-semibold text-coupon-dark hover:underline">BioStack</span>
                        <span>— build your perfect supplement stack</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}