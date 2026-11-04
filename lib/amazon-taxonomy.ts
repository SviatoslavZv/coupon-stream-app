// lib/amazon-taxonomy.ts

import {
  CATEGORIES,
  type CategorySlug,
  type GenderSlug,
} from "@/lib/constants/taxonomy";
import type { AmazonProduct } from "@/lib/partnerboost";

type SubcategorySlug =
  (typeof CATEGORIES)[number]["subcategories"][number]["slug"];

interface SubcategoryRule {
  category: CategorySlug;
  subcategory: SubcategorySlug;
  keywords: readonly string[];
}

// Порядок важен: правила проверяются сверху вниз, побеждает первое совпадение
const SUBCATEGORY_RULES: readonly SubcategoryRule[] = [
  // Shoes
  {
    category: "shoes",
    subcategory: "boots-booties",
    keywords: ["boot", "bootie"],
  },
  { category: "shoes", subcategory: "slippers", keywords: ["slipper"] },
  {
    category: "shoes",
    subcategory: "dress-shoes-oxfords",
    keywords: ["oxford", "dress shoe", "derby", "brogue"],
  },
  {
    category: "shoes",
    subcategory: "sneakers-athletic",
    keywords: [
      "sneaker",
      "running",
      "walking shoe",
      "tennis",
      "hiking shoe",
      "trail",
      "athletic shoe",
      "soccer",
      "cleat",
    ],
  },
  {
    category: "shoes",
    subcategory: "sandals-flip-flops",
    keywords: ["sandal", "flip-flop", "flip flop", "slide"],
  },
  {
    category: "shoes",
    subcategory: "heels",
    keywords: ["heel", "pump", "stiletto"],
  },
  {
    category: "shoes",
    subcategory: "flats-loafers",
    keywords: ["flat", "loafer", "moccasin", "mule", "mary jane", "ballet"],
  },
  // Clothing
  {
    category: "clothing",
    subcategory: "activewear",
    keywords: [
      "active",
      "workout",
      "yoga",
      "legging",
      "tracksuit",
      "sports bra",
    ],
  },
  {
    category: "clothing",
    subcategory: "swimwear",
    keywords: ["swim", "bikini"],
  },
  {
    category: "clothing",
    subcategory: "sleepwear-loungewear",
    keywords: ["pajama", "sleep", "lounge", "robe", "nightgown"],
  },
  {
    category: "clothing",
    subcategory: "sweatshirts-hoodies",
    keywords: ["sweatshirt", "hoodie"],
  },
  {
    category: "clothing",
    subcategory: "sweaters",
    keywords: ["sweater", "cardigan", "pullover"],
  },
  {
    category: "clothing",
    subcategory: "coats-jackets",
    keywords: ["coat", "jacket", "parka", "puffer", "vest"],
  },
  {
    category: "clothing",
    subcategory: "suits-blazers",
    keywords: ["suit", "blazer"],
  },
  { category: "clothing", subcategory: "dresses", keywords: ["dress"] },
  {
    category: "clothing",
    subcategory: "jeans-pants",
    keywords: ["jean", "pant", "trouser", "capri", "short"],
  },
  {
    category: "clothing",
    subcategory: "tops-tshirts",
    keywords: ["top", "t-shirt", "tee", "blouse", "tank", "cami", "shirt"],
  },
  // Accessories
  { category: "accessories", subcategory: "watches", keywords: ["watch"] },
  {
    category: "accessories",
    subcategory: "jewelry",
    keywords: [
      "jewelry",
      "jewellery",
      "ring",
      "necklace",
      "earring",
      "bracelet",
      "anklet",
      "pendant",
      "bridal set",
      "wedding band",
    ],
  },
  {
    category: "accessories",
    subcategory: "handbags-wallets-backpacks",
    keywords: [
      "handbag",
      "wallet",
      "backpack",
      "purse",
      "tote",
      "crossbody",
      "clutch",
    ],
  },
  {
    category: "accessories",
    subcategory: "luggage-travel",
    keywords: ["luggage", "suitcase"],
  },
  { category: "accessories", subcategory: "belts", keywords: ["belt"] },
  {
    category: "accessories",
    subcategory: "sunglasses",
    keywords: ["sunglass"],
  },
  {
    category: "accessories",
    subcategory: "hats-gloves-scarves",
    keywords: ["hat", "beanie", "glove", "scarf", "scarves", "mitten"],
  },
];

const KIDS_PATTERN = /\b(girls?|boys?|kids?|toddlers?|baby|infants?|youth)\b/i;
const WOMEN_PATTERN = /\b(women['’]?s?|ladies)\b/i;
const MEN_PATTERN = /\bmen['’]?s?\b/i;
const UNISEX_PATTERN = /\bunisex\b/i;
// Если в названии явно обувь — правила одежды и аксессуаров не применяем
const FOOTWEAR_PATTERN =
  /\b(shoes?|sneakers?|boots?|booties|sandals?|heels|pumps|loafers?|flats|slippers?|cleats?|oxfords?)\b/i;

const MAX_BRAND_WORDS = 4;

export type AmazonProductInfo = Pick<
  AmazonProduct,
  "name" | "subcategory" | "brandName"
>;

export interface TaxonomySuggestion {
  category: CategorySlug | null;
  subcategory: SubcategorySlug | null;
  gender: GenderSlug | null;
  brand: string | null;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesKeyword(text: string, keyword: string): boolean {
  return new RegExp(`\\b${escapeRegExp(keyword)}`, "i").test(text);
}

function findSubcategoryRule(
  text: string | null,
  onlyCategory: CategorySlug | null,
): SubcategoryRule | null {
  if (!text) return null;
  return (
    SUBCATEGORY_RULES.find(
      (rule) =>
        (onlyCategory === null || rule.category === onlyCategory) &&
        rule.keywords.some((keyword) => matchesKeyword(text, keyword)),
    ) ?? null
  );
}

function suggestGender(name: string): GenderSlug | null {
  if (UNISEX_PATTERN.test(name)) return "unisex";
  if (KIDS_PATTERN.test(name)) return "kids";

  const isWomen = WOMEN_PATTERN.test(name);
  const isMen = MEN_PATTERN.test(name);

  if (isWomen && isMen) return "unisex";
  if (isWomen) return "women";
  if (isMen) return "men";
  return null;
}

function normalizeBrand(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function suggestBrand(
  productName: string,
  sellerBrand: string,
  brandLabels: readonly string[],
): string | null {
  const byNormalized = new Map(
    brandLabels.map((label) => [normalizeBrand(label), label]),
  );

  // Сначала бренд из начала названия: самый длинный вариант побеждает
  const words = productName.trim().split(/\s+/);
  for (
    let count = Math.min(MAX_BRAND_WORDS, words.length);
    count > 0;
    count--
  ) {
    const match = byNormalized.get(
      normalizeBrand(words.slice(0, count).join("")),
    );
    if (match) return match;
  }

  // Потом бренд продавца из API — только если он упомянут в названии товара
  const seller = normalizeBrand(sellerBrand);
  if (seller && normalizeBrand(productName).includes(seller)) {
    return byNormalized.get(seller) ?? null;
  }
  return null;
}

export function suggestTaxonomy(
  product: AmazonProductInfo,
  brandLabels: readonly string[],
): TaxonomySuggestion {
  const footwearCategory: CategorySlug | null = FOOTWEAR_PATTERN.test(
    product.name,
  )
    ? "shoes"
    : null;

  const rule =
    findSubcategoryRule(product.subcategory, footwearCategory) ??
    findSubcategoryRule(product.name, footwearCategory);

  return {
    category: rule?.category ?? footwearCategory,
    subcategory: rule?.subcategory ?? null,
    gender: suggestGender(product.name),
    brand: suggestBrand(product.name, product.brandName, brandLabels),
  };
}
