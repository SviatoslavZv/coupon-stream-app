import type { Store, Coupon } from "@/types";

export default function StoreStructuredData({
    store,
    coupons,
    siteUrl,
}: {
    store: Pick<Store, "name" | "logoUrl">;
    coupons: Coupon[];
    siteUrl: string;
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: store.name,
        logo: store.logoUrl,
        makesOffer: coupons.map((coupon) => ({
            "@type": "Offer",
            name: coupon.title,
            description: coupon.description,
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            validThrough: coupon.expiresAt ?? undefined,
            url: siteUrl,
            category: coupon.type === "code" ? "Promo Code" : "Sale",
            seller: {
                "@type": "Organization",
                name: store.name,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}