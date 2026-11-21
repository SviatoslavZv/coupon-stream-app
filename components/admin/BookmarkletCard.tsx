import { bookmarkletHref } from "@/lib/bookmarklet";

/**
 * React refuses to render javascript: links (they are a common attack),
 * so this one link is written as plain HTML. Its code is our own constant, never user input.
 */
export default function BookmarkletCard() {
    const link = `<a href="${bookmarkletHref()}" class="inline-block cursor-grab rounded-full bg-coupon-dark px-4 py-2 text-sm font-bold text-white">＋ Send to CouponCreek</a>`;

    return (
        <details className="rounded-2xl border border-line bg-white p-4 text-sm text-ink">
            <summary className="cursor-pointer font-semibold">Browser button: send a product page here in one click</summary>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-ink/70">
                <li>Show the bookmarks bar: Ctrl+Shift+B.</li>
                <li>Drag this button onto the bookmarks bar:</li>
            </ol>
            <div className="my-3" dangerouslySetInnerHTML={{ __html: link }} />
            <p className="text-ink/70">
                Then, on a product page of any of our stores or Amazon, click the bookmark. This admin opens in a new
                tab with the store, the address, the title and the picture already filled in.
            </p>
        </details>
    );
}