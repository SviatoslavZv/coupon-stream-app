import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CouponCreek — Promo Codes & Deals for Top Fashion Stores";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default function Image() {
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
                        gap: 8,
                        fontSize: 96,
                        fontWeight: 900,
                    }}
                >
                    <span style={{ color: "#1B1F3B" }}>Coupon</span>
                    <span style={{ color: "#E23E2F" }}>Creek</span>
                </div>
                <div
                    style={{
                        marginTop: 24,
                        fontSize: 36,
                        color: "#1B1F3B",
                        opacity: 0.7,
                    }}
                >
                    Promo Codes & Deals for Top Fashion Stores
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}