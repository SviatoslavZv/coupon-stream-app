import { notFound } from "next/navigation";
import { getStoreWithCoupons } from "@/lib/coupons";
import CouponItem from "@/components/store/CouponItem";
import Image from "next/image";

export default async function StorePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const result = await getStoreWithCoupons(slug);

    if (!result) {
        notFound();
    }

    const { store, coupons } = result;

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper">
                    <Image
                        src={store.logoUrl}
                        alt={`${store.name} logo`}
                        width={40}
                        height={40}
                        className="h-10 w-10 object-contain"
                    />
                </div>
                <div>
                    <h1 className="font-display text-2xl font-black text-ink">
                        {store.name} Promo Codes
                    </h1>
                    <p className="text-sm text-ink/60">
                        {coupons.length} verified offers
                    </p>
                </div>
            </div>

            {coupons.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {coupons.map((coupon) => (
                        <CouponItem key={coupon.id} coupon={coupon} storeSlug={slug} />
                    ))}
                </div>
            ) : (
                <p className="text-ink/50">
                    No active offers for {store.name} right now. Check back soon.
                </p>
            )}
        </div>
    );
}