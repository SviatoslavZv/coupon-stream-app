// lib/constants/taxonomy.ts

export const CATEGORIES = [
  {
    slug: "shoes",
    label: "Shoes",
    subcategories: [
      { slug: "sneakers", label: "Sneakers" },
      { slug: "boots", label: "Boots" },
      { slug: "sandals", label: "Sandals" },
      { slug: "dress-shoes", label: "Dress Shoes" },
    ],
  },
  {
    slug: "clothing",
    label: "Clothing",
    subcategories: [
      { slug: "tops", label: "Tops" },
      { slug: "bottoms", label: "Bottoms" },
      { slug: "outerwear", label: "Outerwear" },
      { slug: "dresses", label: "Dresses" },
    ],
  },
  {
    slug: "accessories",
    label: "Accessories",
    subcategories: [
      { slug: "bags", label: "Bags" },
      { slug: "jewelry", label: "Jewelry" },
      { slug: "watches", label: "Watches" },
      { slug: "belts", label: "Belts" },
    ],
  },
  {
    slug: "beauty",
    label: "Beauty",
    subcategories: [
      { slug: "skincare", label: "Skincare" },
      { slug: "makeup", label: "Makeup" },
      { slug: "fragrance", label: "Fragrance" },
    ],
  },
  {
    slug: "home",
    label: "Home",
    subcategories: [],
  },
] as const;

export const GENDERS = [
  { slug: "men", label: "Men" },
  { slug: "women", label: "Women" },
  { slug: "kids", label: "Kids" },
  { slug: "unisex", label: "Unisex" },
] as const;

export const BRANDS = [
  { slug: "nike", label: "Nike" },
  { slug: "adidas", label: "Adidas" },
  { slug: "new-balance", label: "New Balance" },
  { slug: "skechers", label: "Skechers" },
  { slug: "converse", label: "Converse" },
  { slug: "vans", label: "Vans" },
  { slug: "puma", label: "Puma" },
  { slug: "under-armour", label: "Under Armour" },
  { slug: "reebok", label: "Reebok" },
  { slug: "levis", label: "Levi's" },
  { slug: "calvin-klein", label: "Calvin Klein" },
  { slug: "tommy-hilfiger", label: "Tommy Hilfiger" },
  { slug: "ralph-lauren", label: "Ralph Lauren" },
  { slug: "the-north-face", label: "The North Face" },
  { slug: "champion", label: "Champion" },
  { slug: "columbia", label: "Columbia" },
  { slug: "coach", label: "Coach" },
  { slug: "michael-kors", label: "Michael Kors" },
  { slug: "kate-spade", label: "Kate Spade" },
  { slug: "fossil", label: "Fossil" },
  { slug: "guess", label: "Guess" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export type GenderSlug = (typeof GENDERS)[number]["slug"];
export type BrandSlug = (typeof BRANDS)[number]["slug"];

export function getSubcategories(categorySlug: string) {
  return CATEGORIES.find((c) => c.slug === categorySlug)?.subcategories ?? [];
}