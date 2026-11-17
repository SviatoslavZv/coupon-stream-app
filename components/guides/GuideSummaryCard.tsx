// components/guides/GuideSummaryCard.tsx

import Link from "next/link";
import { GUIDE_EXCERPT_LENGTH } from "@/lib/constants/guides";
import { formatLongDate, truncateAtWord } from "@/lib/utils";
import type { GuideSummary } from "@/types";

interface GuideSummaryCardProps {
    guide: GuideSummary;
    headingLevel?: "h2" | "h3";
}

export default function GuideSummaryCard({
    guide,
    headingLevel: Heading = "h2",
}: GuideSummaryCardProps) {
    return (
        <Link
            href={`/guides/${guide.slug}`}
            className="group block rounded-2xl border border-line bg-white p-4 sm:p-5 transition-all hover:border-coupon hover:shadow-md active:scale-[0.99]"
        >
            <Heading className="font-display text-lg font-bold leading-snug text-ink transition group-hover:text-coupon">
                {guide.title}
            </Heading>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">
                {guide.metaDescription ?? truncateAtWord(guide.intro, GUIDE_EXCERPT_LENGTH)}
            </p>
            <p className="mt-3 text-xs text-ink/60">
                Updated{" "}
                <time dateTime={guide.updatedAt}>{formatLongDate(guide.updatedAt)}</time>
            </p>
        </Link>
    );
}