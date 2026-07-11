// lib/mock-coupons.ts

import type { Coupon } from "@/types";

export const mockCoupons: Record<string, Coupon[]> = {
  nike: [
    {
      id: "1",
      type: "code",
      discountLabel: "20% OFF",
      title: "20% Off Your Next Order",
      code: "NIKE20",
      description: "Valid on full-price items only. Cannot be combined with other offers.",
      expiresAt: "2026-08-01",
    },
    {
      id: "2",
      type: "sale",
      discountLabel: "UP TO 40%",
      title: "End of Season Sale",
      description: "Discount applied automatically at checkout on sale items.",
      expiresAt: "2026-07-31",
    },
  ],
  macys: [
    {
      id: "3",
      type: "code",
      discountLabel: "25% OFF",
      title: "25% Off With Text Sign Up",
      code: "MACYSTEXT",
      description: "Sign up for text alerts to receive this discount at checkout.",
      expiresAt: "2026-08-15",
    },
  ],
};