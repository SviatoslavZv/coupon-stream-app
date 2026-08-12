import { ImageResponse } from "next/og";
import { getStoreWithCoupons } from "@/lib/coupons";

export const runtime = "edge";
export const alt = "Store Promo Codes — CouponCreek";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const result = await getStoreWithCoupons(slug);

    const storeName = result?.store.name ?? "Store";
    const offerCount = result?.coupons.length ?? 0;
    const bestOffer = result?.coupons[0]?.discountLabel;

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#FBFAF7",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 32,
                        fontWeight: 900,
                    }}
                >
                    <span style={{ color: "#1B1F3B" }}>Coupon</span>
                    <span style={{ color: "#E23E2F" }}>Creek</span>
                </div>

                <div
                    style={{
                        display: "flex",
                        marginTop: 32,
                        fontSize: 88,
                        fontWeight: 900,
                        color: "#1B1F3B",
                        textAlign: "center",
                    }}
                >
                    {storeName} Promo Codes
                </div>

                <div
                    style={{
                        display: "flex",
                        marginTop: 20,
                        fontSize: 36,
                        color: "#1B1F3B",
                        opacity: 0.7,
                    }}
                >
                    {offerCount > 0
                        ? `${offerCount} verified ${offerCount === 1 ? "offer" : "offers"}`
                        : "New deals coming soon"}
                </div>

                {bestOffer && (
                    <div
                        style={{
                            marginTop: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#E23E2F",
                            color: "#FBFAF7",
                            fontSize: 44,
                            fontWeight: 900,
                            padding: "16px 40px",
                            borderRadius: 999,
                        }}
                    >
                        {bestOffer}
                    </div>
                )}
            </div>
        ),
        {
            ...size,
        }
    );
}