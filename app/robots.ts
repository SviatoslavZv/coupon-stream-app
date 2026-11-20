import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
