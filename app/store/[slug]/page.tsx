import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getStoreWithCoupons } from "@/lib/coupons";
import CouponItem from "@/components/store/CouponItem";
import ShareButton from "@/components/ui/ShareButton";
import StoreStructuredData from "@/components/store/StoreStructuredData";
import Breadcrumbs from "@/components/ui/Breadcrumbs";



export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const result = await getStoreWithCoupons(slug);

    if (!result) {
        return {
            title: "Store Not Found — CouponCreek",
            robots: { index: false, follow: false }, // 👈 Не индексируем несуществующие страницы
        };
    }

    const { store, coupons } = result;
    const monthYear = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const title = `${store.name} Promo Codes & Coupons — ${monthYear} | CouponCreek`;
    const description = `${coupons.length} verified ${store.name} promo codes and deals for ${monthYear}. Save with the latest ${store.name} coupons, updated daily on CouponCreek.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/store/${slug}`,
        },
        openGraph: {
            title,
            description,
            url: `/store/${slug}`,
            type: "website",
            images: store.logoUrl // 👈 Картинка логотипа для красивых карточек в соцсетях
                ? [
                    {
                        url: store.logoUrl,
                        alt: `${store.name} Logo`,
                    },
                ]
                : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: store.logoUrl ? [store.logoUrl] : [], // 👈 Превью для Twitter
        },
    };
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
                            {coupons.length} verified offers
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
                <p className="text-ink/50">
                    No active offers for {store.name} right now. Check back soon.
                </p>
            )}
        </div>
    );
}