// components/guides/RelatedGuides.tsx

import GuideSummaryCard from "@/components/guides/GuideSummaryCard";
import type { GuideSummary } from "@/types";

interface RelatedGuidesProps {
    guides: GuideSummary[];
}

export default function RelatedGuides({ guides }: RelatedGuidesProps) {
    if (guides.length === 0) return null;

    return (
        <section aria-labelledby="related-guides-heading" className="mt-12">
            <h2
                id="related-guides-heading"
                className="font-display text-xl font-black text-ink"
            >
                More shopping guides
            </h2>
            <ul className="mt-4 flex flex-col gap-4">
                {guides.map((guide) => (
                    <li key={guide.slug}>
                        <GuideSummaryCard guide={guide} headingLevel="h3" />
                    </li>
                ))}
            </ul>
        </section>
    );
}