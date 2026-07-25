// lib/constants/sales-calendar.ts

export interface SalesEvent {
  slug: string;
  name: string;
  period: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}

export const SALES_CALENDAR: SalesEvent[] = [
  {
    slug: "new-year",
    name: "New Year Sales",
    period: "Early January",
    description:
      "Retailers clear out winter inventory with steep discounts right after the holidays.",
    linkHref: "/category/clothing",
    linkLabel: "Shop Clothing Deals",
  },
  {
    slug: "presidents-day",
    name: "Presidents' Day Sale",
    period: "Third Monday of February",
    description:
      "One of the biggest February sale events, especially for home goods and mattresses.",
    linkHref: "/category/home",
    linkLabel: "Shop Home Deals",
  },
  {
    slug: "memorial-day",
    name: "Memorial Day Sale",
    period: "Last Monday of May",
    description:
      "The unofficial start of summer brings deals on outdoor wear and warm-weather clothing.",
    linkHref: "/category/clothing",
    linkLabel: "Shop Clothing Deals",
  },
  {
    slug: "independence-day",
    name: "Independence Day Sale",
    period: "Early July",
    description:
      "Fourth of July weekend deals, often on shoes and summer accessories.",
    linkHref: "/category/shoes",
    linkLabel: "Shop Shoe Deals",
  },
  {
    slug: "back-to-school",
    name: "Back to School",
    period: "Late July – August",
    description:
      "One of the biggest shopping seasons of the year for clothing, shoes, and accessories.",
    linkHref: "/category/shoes",
    linkLabel: "Shop Shoe Deals",
  },
  {
    slug: "labor-day",
    name: "Labor Day Sale",
    period: "First Monday of September",
    description:
      "The unofficial end of summer, with deals across nearly every category.",
    linkHref: "/brands",
    linkLabel: "Shop by Brand",
  },
  {
    slug: "halloween",
    name: "Halloween Sale",
    period: "Late October",
    description:
      "Costume and accessory deals, along with early-bird pricing on fall fashion.",
    linkHref: "/category/accessories",
    linkLabel: "Shop Accessory Deals",
  },
  {
    slug: "black-friday",
    name: "Black Friday",
    period: "Day after Thanksgiving (late November)",
    description:
      "The single biggest shopping day of the year, with the deepest discounts at every major department store.",
    linkHref: "/stores",
    linkLabel: "Shop All Stores",
  },
  {
    slug: "cyber-monday",
    name: "Cyber Monday",
    period: "Monday after Black Friday",
    description:
      "Black Friday's online-focused sequel, often with the best deals on apparel and accessories.",
    linkHref: "/stores",
    linkLabel: "Shop All Stores",
  },
  {
    slug: "christmas",
    name: "Christmas & Boxing Day Sale",
    period: "Late December",
    description:
      "Post-holiday clearance sales with some of the year's lowest prices on winter wear.",
    linkHref: "/category/clothing",
    linkLabel: "Shop Clothing Deals",
  },
];