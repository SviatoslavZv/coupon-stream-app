
export interface Store {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  offerCount: number;
  bestOffer: string;
  createdAt?: string; // Добавляем опциональную дату создания
  updatedAt?: string; // Добавляем опциональную дату обновления
  lastModified?: string;
}

export interface Coupon {
  id: string;
  type: "code" | "sale";
  discountLabel: string;
  title: string;
  code?: string;
  description: string;
  expiresAt: string;
  lastVerifiedAt?: string | null;
  usageCount?: number;
  affiliateLink?: string | null;
}