// lib/constants/coupon-presets.ts

export const DISCOUNT_LABEL_PRESETS = [
  "10% OFF",
  "15% OFF",
  "20% OFF",
  "25% OFF",
  "30% OFF",
  "40% OFF",
  "50% OFF",
  "60% OFF",
  "70% OFF",
  "Up to 30% OFF",
  "Up to 40% OFF",
  "Up to 50% OFF",
  "Up to 60% OFF",
  "Up to 70% OFF",
  "Up to 80% OFF",
  "Up to 90% OFF",
  "Free Shipping",
  "BOGO 50% Off",
  "$10 OFF",
  "$25 OFF",
  "$50 OFF",
];

export const DESCRIPTION_PRESETS = [
  "Valid on full-price items only. Cannot be combined with other offers.",
  "Discount applied automatically at checkout on sale items.",
  "Exclusions may apply. See site for details.",
  "Valid for new customers only.",
  "Free shipping on orders over $50.",
  "Minimum purchase required. See site for details.",
];

export function buildTitleSuggestions(discountLabel: string): string[] {
  if (!discountLabel.trim()) return [];

  return [
    `${discountLabel} Sitewide`,
    `${discountLabel} Your Next Order`,
    `${discountLabel} Select Items`,
    `${discountLabel} With Code`,
  ];
}