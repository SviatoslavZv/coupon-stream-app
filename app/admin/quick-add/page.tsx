import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { quickAddHref, resolveQuickAdd } from "@/lib/quick-add";
import { parseStoreProductPrefill } from "@/lib/schemas/store-products";
import { getDeepLinkStores } from "@/lib/stores";
import { ADMIN_ROUTES } from "@/lib/constants/admin";

export const metadata: Metadata = {
    title: "Quick add",
};

/**
 * The bookmarklet opens this page: ?url=<page you are on>&title=…&image=…
 * It only decides where to go and opens the right form; nothing is saved here.
 */
export default async function QuickAddPage(props: PageProps<"/admin/quick-add">) {
    await requireAdmin();

    const { url, title, image } = parseStoreProductPrefill(await props.searchParams);
    const target = resolveQuickAdd(url ?? "", await getDeepLinkStores());

    if (target.kind !== "error") {
        redirect(quickAddHref(target, { title, image }));
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-4 font-display text-2xl font-black text-ink">Quick add</h1>
            <p className="rounded-lg border border-coupon bg-coupon/5 px-4 py-3 text-sm text-coupon">
                {target.message}
            </p>
            {url && <p className="mt-3 break-all text-xs text-ink/60">{url}</p>}
            <div className="mt-6 flex gap-3">
                <Link
                    href={ADMIN_ROUTES.storeNew}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                    + Add Store
                </Link>
                <Link
                    href={ADMIN_ROUTES.dashboard}
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-coupon"
                >
                    Dashboard
                </Link>
            </div>
        </div>
    );
}