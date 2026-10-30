import Link from "next/link";
import type { GuideItem } from "@/types";

const ACTION_LABEL = {
    product: "View product",
    section: "Shop now",
} as const;

export default function GuideItemCard({ item, index }: { item: GuideItem; index: number }) {
    const storeName = item.source === "shop_link" ? item.link.store.name : item.coupon.store.name;
    const title = item.source === "shop_link" ? item.link.title : item.coupon.title;

    return (
        <article
            id={`item-${item.id}`}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:p-5"
        >
            {item.source === "shop_link" && item.link.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={item.link.imageUrl}
                    alt={item.link.title}
                    loading="lazy"
                    className="h-32 w-full rounded-xl object-contain sm:h-28 sm:w-28 sm:shrink-0"
                />
            )}

            <div className="flex flex-1 flex-col gap-2">
                <p className="font-mono text-xs uppercase tracking-wide text-ink/70">
                    {index + 1}. {storeName}
                    {item.source === "coupon" && (
                        <span className="ml-2 text-coupon-dark">{item.coupon.discountLabel}</span>
                    )}
                </p>

                <h2 className="font-display text-lg font-bold leading-snug text-ink">{title}</h2>

                <p className="text-sm leading-relaxed text-ink/80">{item.comment}</p>

                <div className="mt-1">
                    {item.source === "shop_link" ? (
                        <a
                            href={item.link.url}
                            target="_blank"
                            rel="noopener noreferrer sponsored nofollow"
                            className="inline-flex items-center justify-center rounded-full bg-coupon-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coupon"
                        >
                            {ACTION_LABEL[item.link.kind]} at {storeName}
                        </a>
                    ) : (
                        <Link
                            href={`/store/${item.coupon.store.slug}#coupon-${item.coupon.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-coupon-dark px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coupon"
                        >
                            {item.coupon.type === "code" ? "Get code" : "Get deal"}
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}