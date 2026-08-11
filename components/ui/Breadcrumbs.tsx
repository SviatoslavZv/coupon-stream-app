import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href && { item: `${siteUrl}${item.href}` }),
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink/50">
                <ol className="flex flex-wrap items-center gap-1">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center gap-1">
                            {index > 0 && <span className="text-ink/30">/</span>}
                            {item.href ? (
                                <Link href={item.href} className="hover:text-ink hover:underline">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-ink/70">{item.label}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}