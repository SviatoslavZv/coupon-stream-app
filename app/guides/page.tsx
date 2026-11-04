import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getPublishedGuides } from "@/lib/guides";
import { buildPageMetadata } from "@/lib/metadata";
import { formatLongDate, truncateAtWord } from "@/lib/utils";

const EXCERPT_LENGTH = 180;

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
                            <Link
                                href={`/guides/${guide.slug}`}
                                className="group block rounded-2xl border border-line bg-white p-4 sm:p-5 transition-all hover:border-coupon hover:shadow-md active:scale-[0.99]"
                            >
                                <h2 className="font-display text-lg font-bold leading-snug text-ink transition group-hover:text-coupon">
                                    {guide.title}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                                    {guide.metaDescription ?? truncateAtWord(guide.intro, EXCERPT_LENGTH)}
                                </p>
                                <p className="mt-3 text-xs text-ink/60">
                                    Updated{" "}
                                    <time dateTime={guide.updatedAt}>{formatLongDate(guide.updatedAt)}</time>
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}