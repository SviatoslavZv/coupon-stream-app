// lib/mock-stores.ts

import type { Store } from "@/types";

export const mockStores: Store[] = [
  {
    slug: "nike",
    name: "Nike",
    logoUrl: "https://placehold.co/64x64/1B1F3B/FFFFFF.png?text=N",
    offerCount: 12,
    bestOffer: "Up to 30% off",
  },
  {
    slug: "macys",
    name: "Macy's",
    logoUrl: "https://placehold.co/64x64/E23E2F/FFFFFF.png?text=M",
    offerCount: 19,
    bestOffer: "25% off with sign up",
  },
  {
    slug: "old-navy",
    name: "Old Navy",
    logoUrl: "https://placehold.co/64x64/F0A202/FFFFFF.png?text=ON",
    offerCount: 8,
    bestOffer: "40% off sitewide",
  },
  {
    slug: "adidas",
    name: "Adidas",
    logoUrl: "https://placehold.co/64x64/1B1F3B/FFFFFF.png?text=A",
    offerCount: 6,
    bestOffer: "Free shipping",
  },
];