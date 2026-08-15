import type { Store, Coupon } from "@/types";

interface StoreStructuredDataProps {
    store: Pick<Store, "slug" | "name" | "logoUrl">;
    coupons: Coupon[];
}

function safeJsonLd(data: object): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function StoreStructuredData({
    store,
    coupons,
}: StoreStructuredDataProps) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://couponcreek.com";
    const storeUrl = `${baseUrl}/store/${store.slug}`;

    // 1. Список промокодов (ItemList из Offer)
    const couponsSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${store.name} Promo Codes & Discounts`,
        description: `Active verified coupon codes and promo deals for ${store.name}.`,
        url: storeUrl,
        numberOfItems: coupons.length,
        itemListElement: coupons.map((coupon, index) => {
            const offerData: Record<string, unknown> = {
                "@type": "Offer",
                position: index + 1,
                name: coupon.title,
                description: coupon.description || coupon.title,
                url: `${storeUrl}#coupon-${coupon.id}`,
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
            };

            if (coupon.code) {
                offerData.couponCode = coupon.code;
            }

            if (coupon.expiresAt) {
                try {
                    offerData.validThrough = new Date(coupon.expiresAt).toISOString();
                } catch {
                    // Игнорируем некорректную дату
                }
            }

            return offerData;
        }),
    };

    // 2. Организация / Бренд (Organization)
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: store.name,
        url: storeUrl,
        logo: store.logoUrl || undefined,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonLd(couponsSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema) }}
            />
        </>
    );
}