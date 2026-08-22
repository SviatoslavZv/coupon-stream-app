import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CouponCreek — Promo Codes & Deals for Top Fashion Stores",
    short_name: "CouponCreek",
    description:
      "Find verified promo codes and deals for your favorite fashion and apparel brands, updated daily.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFAF7",
    theme_color: "#B8291B",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}