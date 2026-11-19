import Link from "next/link";
import { getStores } from "@/lib/stores";
import { getAllCouponsForAdmin } from "@/lib/coupons";
import { getShopLinksForAdmin } from "@/lib/shop-links";
import { getGuidesForAdmin } from "@/lib/guides";
import { buildDashboardSummary } from "@/lib/admin-dashboard";
import { ADMIN_ROUTES, EXPIRING_SOON_DAYS, withQuery } from "@/lib/constants/admin";
import { SHOP_LINK_CHECK_STATUS_LABELS } from "@/lib/constants/shop-links";
import { formatShortDate } from "@/lib/utils";
import AttentionList, { type AttentionRow } from "@/components/admin/AttentionList";

const QUICK_ACTIONS = [
    { label: "Amazon Import", href: ADMIN_ROUTES.amazonImport },
    { label: "+ Add from store", href: ADMIN_ROUTES.storeProductNew },
    { label: "+ Coupon", href: ADMIN_ROUTES.couponNew },
    { label: "+ Guide", href: ADMIN_ROUTES.guideNew },
] as const;

export default async function AdminDashboard() {
    // Each admin data function checks the admin rights itself; getStores is public data
    const [stores, coupons, links, guides] = await Promise.all([
        getStores(),
        getAllCouponsForAdmin(),
        getShopLinksForAdmin(),
        getGuidesForAdmin(),
    ]);
    const { counts, expiringCoupons, problemLinks, draftGuides } = buildDashboardSummary({
        stores,
        coupons,
        links,
        guides,
    });

    const stats = [
        { label: "Stores", value: counts.stores, href: ADMIN_ROUTES.stores },
        { label: "Active coupons", value: counts.activeCoupons, href: withQuery(ADMIN_ROUTES.coupons, { status: "active" }) },
        { label: "Expired coupons", value: counts.expiredCoupons, href: withQuery(ADMIN_ROUTES.coupons, { status: "expired" }) },
        { label: "Active links", value: counts.activeLinks, href: withQuery(ADMIN_ROUTES.shopLinks, { status: "active" }) },
        { label: "Published guides", value: counts.publishedGuides, href: ADMIN_ROUTES.guides },
    ];

    const expiringRows: AttentionRow[] = expiringCoupons.map((coupon) => ({
        id: coupon.id,
        title: `${coupon.storeName}: ${coupon.title}`,
        detail: `ends ${formatShortDate(coupon.expiresAt)}`,
        href: ADMIN_ROUTES.couponEdit(coupon.id),
    }));
    const problemRows: AttentionRow[] = problemLinks.map((link) => ({
        id: link.id,
        title: `${link.storeName}: ${link.title}`,
        detail: link.checkStatus ? SHOP_LINK_CHECK_STATUS_LABELS[link.checkStatus] : "",
        href: ADMIN_ROUTES.shopLinkEdit(link.id),
    }));
    const draftRows: AttentionRow[] = draftGuides.map((guide) => ({
        id: guide.id,
        title: guide.title,
        detail: `${guide.itemCount} items`,
        href: ADMIN_ROUTES.guideEdit(guide.id),
    }));

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">Dashboard</h1>

            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="rounded-2xl border border-line bg-white px-4 py-3 transition hover:border-coupon"
                    >
                        <span className="block font-display text-2xl font-black text-ink">{stat.value}</span>
                        <span className="text-xs text-ink/60">{stat.label}</span>
                    </Link>
                ))}
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-coupon hover:text-coupon-dark"
                    >
                        {action.label}
                    </Link>
                ))}
            </div>

            <h2 className="mb-3 font-display text-xl font-black text-ink">Needs attention</h2>
            <div className="grid gap-4 lg:grid-cols-3">
                <AttentionList
                    title="Coupons ending soon"
                    hint={`last day within ${EXPIRING_SOON_DAYS} days`}
                    rows={expiringRows}
                    emptyText="Nothing ends in the next days."
                    moreHref={withQuery(ADMIN_ROUTES.coupons, { status: "active" })}
                />
                <AttentionList
                    title="Links with problems"
                    hint="from the nightly check"
                    rows={problemRows}
                    emptyText="All checked links are fine."
                    moreHref={ADMIN_ROUTES.shopLinks}
                />
                <AttentionList
                    title="Draft guides"
                    hint="not visible on the site"
                    rows={draftRows}
                    emptyText="No drafts waiting."
                    moreHref={ADMIN_ROUTES.guides}
                />
            </div>
        </div>
    );
}