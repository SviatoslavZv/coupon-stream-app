import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedGuide } from "@/lib/guides";
import { buildPageMetadata, notFoundMetadata } from "@/lib/metadata";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GuideItemCard from "@/components/guides/GuideItemCard";
import GuideStructuredData from "@/components/seo/GuideStructuredData";
import { truncateAtWord, formatLongDate } from "@/lib/utils";
import { META_DESCRIPTION_MAX } from "@/lib/constants/guides";


export async function generateMetadata(props: PageProps<"/guides/[slug]">): Promise<Metadata> {
    const { slug } = await props.params;
    const guide = await getPublishedGuide(slug);

    if (!guide) {
        return notFoundMetadata("Guide Not Found");
    }

    return buildPageMetadata({
        title: guide.title,
        description: guide.metaDescription ?? truncateAtWord(guide.intro, META_DESCRIPTION_MAX - 5),
        path: `/guides/${guide.slug}`,
    });
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
    const { slug } = await props.params;
    const guide = await getPublishedGuide(slug);

    if (!guide) {
        notFound();
    }

    const paragraphs = guide.intro.split(/\r?\n\s*\r?\n/).filter((p) => p.trim() !== "");

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10 animate-fade-in-up">
            <Breadcrumbs
                items={[
                    { label: "Home", href: "/" },
                    { label: "Guides", href: "/guides" },
                    { label: guide.title },
                ]}
            />

            <GuideStructuredData guide={guide} />

            <p className="mb-4 rounded-xl bg-paper px-4 py-2 text-xs text-ink/70">
                We may earn a commission when you buy through links on this page. This does not
                change the price you pay.
            </p>

            <header className="mb-8">
                <h1 className="font-display text-2xl font-black text-ink sm:text-3xl">{guide.title}</h1>
                <p className="mt-2 text-xs text-ink/60">
                    Updated <time dateTime={guide.updatedAt}>{formatLongDate(guide.updatedAt)}</time>
                </p>
                <div className="mt-4 flex flex-col gap-3 text-base leading-relaxed text-ink/80">
                    {paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </header>

            <section className="flex flex-col gap-4">
                {guide.items.map((item, index) => (
                    <GuideItemCard key={item.id} item={item} index={index} />
                ))}
            </section>
        </div>
    );
}