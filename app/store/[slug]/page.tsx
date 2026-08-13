import { notFound } from "next/navigation";
import Link from "next/link";
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

    return buildPageMetadata({
        title: `${store.name} Promo Codes & Coupons — ${monthYear}`,
        description: `${coupons.length} verified ${store.name} promo codes and deals for ${monthYear}. Save with the latest ${store.name} coupons, updated daily on CouponCreek.`,
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
    const faqItems = getStoreFaq(store.name, coupons.length);

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
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
                siteUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/store/${slug}`}
            />

            <FaqStructuredData items={faqItems} />

            <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper">
                        <Image
                            src={store.logoUrl}
                            alt={`${store.name} logo`}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-black text-ink">
                            {store.name} Promo Codes
                        </h1>
                        <p className="text-sm text-ink/60">
                            {coupons.length > 0
                                ? `${coupons.length} verified ${coupons.length === 1 ? "offer" : "offers"}`
                                : "No offers yet"}
                        </p>
                    </div>
                </div>

                <ShareButton
                    path={`/store/${slug}`}
                    title={`${store.name} Promo Codes — CouponCreek`}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                />
            </div>

            {coupons.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {coupons.map((coupon) => (
                        <CouponItem key={coupon.id} coupon={coupon} storeSlug={slug} />
                    ))}
                </div>
            ) : (
                <div className="text-ink/50">
                    <p>No active offers for {store.name} right now. Check back soon.</p>
                    <Link href="/stores" className="mt-2 inline-block text-coupon hover:underline">
                        Browse other stores
                    </Link>
                </div>
            )}

            <FaqSection
                title={`Frequently Asked Questions about ${store.name} Promo Codes`}
                items={faqItems}
            />
        </div>
    );
}