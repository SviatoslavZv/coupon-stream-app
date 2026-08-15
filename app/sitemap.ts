import type { MetadataRoute } from "next";
import { getStores } from "@/lib/stores";
import { getCategoriesWithCoupons, getBrandsWithCoupons } from "@/lib/coupons";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponcreek.com";
  const now = new Date();

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/stores`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/brands`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/sales-calendar`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms-of-use`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Параллельный запрос ко всем динамическим сущностям
  const [stores, categories, brands] = await Promise.all([
    getStores(),
    getCategoriesWithCoupons(),
    getBrandsWithCoupons(),
  ]);

  // Страницы магазинов (самый высокий приоритет среди внутренних)
  const storePages: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${siteUrl}/store/${store.slug.toLowerCase()}`,
    ...(store.lastModified ? { lastModified: new Date(store.lastModified) } : { lastModified: now }),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // Страницы категорий
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug.toLowerCase()}`,
    ...(category.lastModified ? { lastModified: new Date(category.lastModified) } : { lastModified: now }),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Страницы брендов
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${siteUrl}/brand/${brand.slug.toLowerCase()}`,
    ...(brand.lastModified ? { lastModified: new Date(brand.lastModified) } : { lastModified: now }),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...storePages, ...categoryPages, ...brandPages];
}