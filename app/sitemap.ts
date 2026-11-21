import type { MetadataRoute } from "next";
import { LEGAL_PAGES_UPDATED, SITE_URL } from "@/lib/constants/site";
import { getStores } from "@/lib/stores";
import { getCategoriesWithCoupons, getBrandsWithCoupons } from "@/lib/coupons";
import { getPublishedGuides } from "@/lib/guides";

type SitemapEntry = MetadataRoute.Sitemap[number];

/** The newest of the given dates, or undefined when none is known. */
function latestDate(
  dates: readonly (string | undefined)[],
): string | undefined {
  return dates.reduce<string | undefined>(
    (latest, date) =>
      date && (!latest || new Date(date) > new Date(latest)) ? date : latest,
    undefined,
  );
}

/**
 * A sitemap entry with lastModified only when we really know it.
 * Google trusts lastmod only while it matches real changes, so an unknown date is left out, never replaced with "now".
 */
function entry(path: string, lastModified: string | undefined): SitemapEntry {
  return {
    url: `${SITE_URL}${path}`,
    ...(lastModified ? { lastModified } : {}),
  };
}

const LEGAL_PATHS = [
  "/privacy-policy",
  "/terms-of-use",
  "/cookie-policy",
  "/disclaimer",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stores, categories, brands, guides] = await Promise.all([
    getStores(),
    getCategoriesWithCoupons(),
    getBrandsWithCoupons(),
    getPublishedGuides(),
  ]);

  const storesUpdated = latestDate(stores.map((store) => store.lastModified));
  const categoriesUpdated = latestDate(
    categories.map((category) => category.lastModified),
  );
  const brandsUpdated = latestDate(brands.map((brand) => brand.lastModified));
  const guidesUpdated = latestDate(guides.map((guide) => guide.updatedAt));

  return [
    // Hub pages change when anything they list changes
    entry("", latestDate([storesUpdated, guidesUpdated])),
    entry("/stores", storesUpdated),
    entry("/categories", categoriesUpdated),
    entry("/brands", brandsUpdated),
    entry("/guides", guidesUpdated),
    // The calendar is edited by hand and has no recorded date, so it gets none
    entry("/sales-calendar", undefined),
    ...LEGAL_PATHS.map((path) => entry(path, LEGAL_PAGES_UPDATED)),

    ...stores.map((store) =>
      entry(`/store/${store.slug.toLowerCase()}`, store.lastModified),
    ),
    ...guides.map((guide) => entry(`/guides/${guide.slug}`, guide.updatedAt)),
    ...categories.map((category) =>
      entry(`/category/${category.slug.toLowerCase()}`, category.lastModified),
    ),
    ...brands.map((brand) =>
      entry(`/brand/${brand.slug.toLowerCase()}`, brand.lastModified),
    ),
  ];
}
