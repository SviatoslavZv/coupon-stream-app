import type { BrandCoupon } from "@/lib/coupons";

interface BrandStructuredDataProps {
    brandName: string;
    brandSlug: string;
    coupons: BrandCoupon[];
}

export default function BrandStructuredData({
    brandName,
    brandSlug,
    coupons,
}: BrandStructuredDataProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${brandName} Promo Codes & Deals`,
        description: `Verified promo codes, discount codes, and special offers for ${brandName}.`,
        url: `${siteUrl}/brand/${brandSlug}`,
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: coupons.length,
            itemListElement: coupons.map((coupon, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                    "@type": "Offer",
                    name: coupon.title,
                    description: coupon.discountLabel,
                    offeredBy: {
                        "@type": "Organization",
                        name: coupon.storeName,
                    },
                },
            })),
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}