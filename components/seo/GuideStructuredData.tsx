import type { Guide } from "@/types";
import { SITE_URL } from "@/lib/constants/site";

function safeJsonLd(data: object): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function GuideStructuredData({ guide }: { guide: Guide }) {
    const baseUrl = SITE_URL;
    const guideUrl = `${baseUrl}/guides/${guide.slug}`;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: guide.title,
        url: guideUrl,
        numberOfItems: guide.items.length,
        itemListElement: guide.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.source === "shop_link" ? item.link.title : item.coupon.title,
            url: `${guideUrl}#item-${item.id}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
        />
    );
}