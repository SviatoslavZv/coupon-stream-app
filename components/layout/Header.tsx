import Link from "next/link";
import ShareButton from "@/components/ui/ShareButton";

export default function Header() {
    return (
        <header className="bg-paper">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
                <Link href="/" className="shrink-0 font-display text-2xl font-black tracking-tight">
                    <span className="text-ink">Coupon</span>
                    <span className="text-coupon">Creek</span>
                </Link>

                <div className="hidden flex-1 sm:block">
                    <input
                        type="text"
                        placeholder="Search stores…"
                        className="w-full max-w-md rounded-full border border-line bg-white px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-coupon focus:outline-none"
                    />
                </div>

                <nav className="hidden items-center gap-6 text-sm font-medium text-ink sm:flex">
                    <Link href="/stores" className="hover:text-coupon">
                        Stores
                    </Link>
                    <Link href="/categories" className="hover:text-coupon">
                        Categories
                    </Link>
                    <Link href="/brands" className="hover:text-coupon">
                        Brands
                    </Link>
                    <ShareButton
                        path="/"
                        title="CouponCreek — Promo Codes & Deals for Top Fashion Stores"
                        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                    />
                </nav>
            </div>

            <div
                className="h-2 w-full"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 6px 6px, transparent 6px, var(--color-line) 6px)",
                    backgroundSize: "12px 12px",
                    backgroundPosition: "top",
                }}
                aria-hidden="true"
            />
        </header>
    );
}