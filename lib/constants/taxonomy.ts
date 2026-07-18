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
  "Nike",
  "Adidas",
  "New Balance",
  "Skechers",
  "Converse",
  "Vans",
  "Puma",
  "Under Armour",
  "Reebok",
  "Levi's",
  "Calvin Klein",
  "Tommy Hilfiger",
  "Ralph Lauren",
  "The North Face",
  "Champion",
  "Columbia",
  "Coach",
  "Michael Kors",
  "Kate Spade",
  "Fossil",
  "Guess",
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export type GenderSlug = (typeof GENDERS)[number]["slug"];
export type Brand = (typeof BRANDS)[number];

export function getSubcategories(categorySlug: string) {
  return CATEGORIES.find((c) => c.slug === categorySlug)?.subcategories ?? [];
}