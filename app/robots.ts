import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // На продакшене используем канонический URL с www, а локально — localhost
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://www.couponcreek.com"
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}