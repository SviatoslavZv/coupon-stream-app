import type { NextConfig } from "next";
import { RENAMED_STORE_SLUGS } from "./lib/constants/redirects";

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(RENAMED_STORE_SLUGS).flatMap(([from, to]) => [
      // The store page and everything under it (the share image)
      {
        source: `/store/${from}/:path*`,
        destination: `/store/${to}/:path*`,
        permanent: true,
      },
      // Coupon buttons: /api/go/<slug>?coupon=… (the query string is passed on as is)
      {
        source: `/api/go/${from}`,
        destination: `/api/go/${to}`,
        permanent: true,
      },
    ]);
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },
};

export default nextConfig;
