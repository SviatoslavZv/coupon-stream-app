// app/guides/page.tsx

import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GuideSummaryCard from "@/components/guides/GuideSummaryCard";
import { getPublishedGuides } from "@/lib/guides";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
    title: "Shopping Guides: Curated Deals by Season and Style",
    description:
        "Hand-picked guides to current sales, coupons and products from stores we work with, checked on each store's page and updated as new deals appear.",
    path: "/guides",
});

export default async function GuidesPage() {
    const guides = await getPublishedGuides();

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10 animate-fade-in-up">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Guides" },
                ]}
            />

            <h1 className="font-display text-2xl sm:text-3xl font-black text-ink">
                Shopping Guides
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-ink/70">
                Curated picks of current deals, sorted by occasion and style. Every offer is
                checked on the store&apos;s own page before it goes live.
            </p>

            {guides.length === 0 ? (
                <p className="mt-8 text-sm text-ink/70">
                    Our first guides are on the way. Check back soon.
                </p>
            ) : (
                <ul className="mt-6 sm:mt-8 flex flex-col gap-4">
                    {guides.map((guide) => (
                        <li key={guide.slug}>
                            <GuideSummaryCard guide={guide} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}