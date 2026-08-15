import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getStoreWithCoupons } from "@/lib/coupons";
import CouponItem from "@/components/store/CouponItem";
import ShareButton from "@/components/ui/ShareButton";
import StoreStructuredData from "@/components/store/StoreStructuredData";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import FaqSection from "@/components/ui/FaqSection";
import FaqStructuredData from "@/components/seo/FaqStructuredData";
import { getStoreFaq } from "@/lib/constants/faq";
import { buildPageMetadata, notFoundMetadata } from "@/lib/metadata";

// Вспомогательная функция проверки на истечение срока
function isCouponExpired(expiresAt?: string | null): boolean {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt).getTime();
    return !isNaN(expiryDate) && expiryDate < Date.now();
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const result = await getStoreWithCoupons(slug);

    if (!result) {
        return notFoundMetadata("Store Not Found");
    }

    const { store, coupons } = result;
    const monthYear = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const activeCoupons = coupons.filter((c) => !isCouponExpired(c.expiresAt));
    const activeCount = activeCoupons.length;
    const countBadge = activeCount > 0 ? `(${activeCount} Active) ` : "";

    return buildPageMetadata({
        title: `${store.name} Promo Codes & Coupons ${countBadge}— ${monthYear}`,
        description: `${activeCount} verified ${store.name} promo codes and deals for ${monthYear}. Save with the latest ${store.name} coupons, updated daily on CouponCreek.`,
        path: `/store/${slug}`,
    });
}

export default async function StorePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const result = await getStoreWithCoupons(slug);

    if (!result) {
        notFound();
    }

    const { store, coupons } = result;

    // Разделяем купоны на активные и просроченные
    const activeCoupons = coupons.filter((c) => !isCouponExpired(c.expiresAt));
    const expiredCoupons = coupons.filter((c) => isCouponExpired(c.expiresAt));

    const faqItems = getStoreFaq(store.name, activeCoupons.length);

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Stores", href: "/stores" },
                    { label: store.name },
                ]}
            />

            <StoreStructuredData
                store={store}
                coupons={coupons}
            />

            <FaqStructuredData items={faqItems} />

            {/* Шапка магазина */}
            <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white border border-line/60 p-2 shadow-xs">
                        <Image
                            src={store.logoUrl}
                            alt={`${store.name} logo`}
                            width={48}
                            height={48}
                            className="h-10 w-10 object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="font-display text-xl sm:text-2xl font-black text-ink">
                            {store.name} Promo Codes
                        </h1>
                        <p className="text-xs sm:text-sm text-ink/60">
                            {activeCoupons.length > 0
                                ? `${activeCoupons.length} verified ${activeCoupons.length === 1 ? "offer" : "offers"} available`
                                : "No active offers currently"}
                        </p>
                    </div>
                </div>

                <ShareButton
                    path={`/store/${slug}`}
                    title={`${store.name} Promo Codes — CouponCreek`}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                />
            </div>

            {/* Список купонов */}
            <div className="flex flex-col gap-8">
                {/* 1. СЕКЦИЯ: Активные купоны */}
                <section className="flex flex-col gap-4">
                    {activeCoupons.length > 0 ? (
                        activeCoupons.map((coupon) => (
                            <CouponItem key={coupon.id} coupon={coupon} storeSlug={slug} />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-line bg-paper p-6 text-center text-sm text-ink/60">
                            <p>No active promo codes for {store.name} right now.</p>
                            <p className="mt-1 text-xs">Try expired codes below, as some of them might still work!</p>
                        </div>
                    )}
                </section>

                {/* 2. СЕКЦИЯ: Архив просроченных купонов (SEO & Trust) */}
                {expiredCoupons.length > 0 && (
                    <section className="mt-4 flex flex-col gap-4 border-t border-line/60 pt-6">
                        <div>
                            <h2 className="font-display text-lg font-bold text-ink/80">
                                Recently Expired {store.name} Promo Codes
                            </h2>
                            <p className="mt-0.5 text-xs text-ink/50">
                                These offers have ended, but store promotional periods sometimes get extended.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {expiredCoupons.map((coupon) => (
                                <CouponItem key={coupon.id} coupon={coupon} storeSlug={slug} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* FAQ Секция */}
            <div className="mt-10 sm:mt-12">
                <FaqSection
                    title={`Frequently Asked Questions about ${store.name} Promo Codes`}
                    items={faqItems}
                />
            </div>
        </div>
    );
}