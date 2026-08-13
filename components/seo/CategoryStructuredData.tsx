import type { CategoryCoupon } from "@/lib/coupons";

interface CategoryStructuredDataProps {
    categoryName: string;
    categorySlug: string;
    coupons: CategoryCoupon[];
}

export default function CategoryStructuredData({
    categoryName,
    categorySlug,
    coupons,
}: CategoryStructuredDataProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${categoryName} Promo Codes & Deals`,
        description: `Verified promo codes, sales, and discounts for ${categoryName}.`,
        url: `${siteUrl}/category/${categorySlug}`,
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