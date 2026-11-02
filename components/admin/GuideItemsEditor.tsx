import { getGuideItemsForAdmin } from "@/lib/guides";
import { getShopLinksForAdmin } from "@/lib/shop-links";
import { getAllCouponsForAdmin } from "@/lib/coupons";
import { isCouponExpired } from "@/lib/utils";
import GuideItemRow from "@/components/admin/GuideItemRow";
import AddGuideItemForm, { type GuideItemOption } from "@/components/admin/AddGuideItemForm";

export default async function GuideItemsEditor({ guideId }: { guideId: string }) {
    const [items, shopLinks, coupons] = await Promise.all([
        getGuideItemsForAdmin(guideId),
        getShopLinksForAdmin(),
        getAllCouponsForAdmin(),
    ]);

    const usedIds = new Set(items.map((item) => item.targetId));

    const shopLinkOptions: GuideItemOption[] = shopLinks
        .filter((link) => !usedIds.has(link.id))
        .sort((a, b) => a.storeName.localeCompare(b.storeName) || a.title.localeCompare(b.title))
        .map((link) => ({
            id: link.id,
            label: `${link.storeName} — ${link.title}${link.isActive ? "" : " (hidden)"}`,
        }));

    const couponOptions: GuideItemOption[] = coupons
        .filter((coupon) => !usedIds.has(coupon.id) && !isCouponExpired(coupon.expiresAt))
        .sort((a, b) => a.storeName.localeCompare(b.storeName) || a.title.localeCompare(b.title))
        .map((coupon) => ({
            id: coupon.id,
            label: `${coupon.storeName} — ${coupon.discountLabel} · ${coupon.title}`,
        }));

    return (
        <section className="mt-12 border-t border-line pt-8">
            <h2 className="mb-4 font-display text-xl font-black text-ink">
                Items <span className="font-mono text-sm font-normal text-ink/50">({items.length})</span>
            </h2>

            {items.length > 0 ? (
                <ol className="mb-6 flex flex-col gap-3">
                    {items.map((item, index) => (
                        <GuideItemRow
                            key={item.id}
                            item={item}
                            position={index + 1}
                            isFirst={index === 0}
                            isLast={index === items.length - 1}
                        />
                    ))}
                </ol>
            ) : (
                <p className="mb-6 text-sm text-ink/60">No items yet. Add the first one below.</p>
            )}

            <AddGuideItemForm
                guideId={guideId}
                options={{ shop_link: shopLinkOptions, coupon: couponOptions }}
            />
        </section>
    );
}