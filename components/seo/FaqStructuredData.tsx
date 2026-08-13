import type { FaqItem } from "@/lib/constants/faq";

interface FaqStructuredDataProps {
    items: FaqItem[];
}

export default function FaqStructuredData({ items }: FaqStructuredDataProps) {
    if (!items || items.length === 0) return null;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
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