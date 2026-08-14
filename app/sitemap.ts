import type { MetadataRoute } from "next";
import { getStores } from "@/lib/stores";
import { getCategoriesWithCoupons, getBrandsWithCoupons } from "@/lib/coupons";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponcreek.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/stores`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/brands`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/sales-calendar`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms-of-use`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cookie-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [stores, categories, brands] = await Promise.all([
    getStores(),
    getCategoriesWithCoupons(),
    getBrandsWithCoupons(),
  ]);

  const storePages: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${siteUrl}/store/${store.slug}`,
    ...(store.lastModified ? { lastModified: new Date(store.lastModified) } : {}),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    ...(category.lastModified ? { lastModified: new Date(category.lastModified) } : {}),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${siteUrl}/brand/${brand.slug}`,
    ...(brand.lastModified ? { lastModified: new Date(brand.lastModified) } : {}),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...storePages, ...categoryPages, ...brandPages];
}