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
            validThrough: coupon.expiresAt,
            url: siteUrl,
            category: coupon.type === "code" ? "Promo Code" : "Sale",
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}