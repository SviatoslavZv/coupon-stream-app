// lib/constants/admin.ts

import { AMAZON_IMPORT_PATH } from "@/lib/constants/amazon";

const ADMIN_ROOT = "/admin";

/** Every admin address in one place: pages, redirects and revalidation use these. */
export const ADMIN_ROUTES = {
  dashboard: ADMIN_ROOT,
  amazonImport: AMAZON_IMPORT_PATH,
  storeProductNew: `${ADMIN_ROOT}/store-products/new`,
  stores: `${ADMIN_ROOT}/stores`,
  storeNew: `${ADMIN_ROOT}/stores/new`,
  storeEdit: (id: string) => `${ADMIN_ROOT}/stores/${id}/edit`,
  coupons: `${ADMIN_ROOT}/coupons`,
  couponNew: `${ADMIN_ROOT}/coupons/new`,
  couponEdit: (id: string) => `${ADMIN_ROOT}/coupons/${id}/edit`,
  shopLinks: `${ADMIN_ROOT}/shop-links`,
  shopLinkNew: `${ADMIN_ROOT}/shop-links/new`,
  shopLinkEdit: (id: string) => `${ADMIN_ROOT}/shop-links/${id}/edit`,
  guideNew: `${ADMIN_ROOT}/guides/new`,
  guideEdit: (id: string) => `${ADMIN_ROOT}/guides/${id}/edit`,
} as const;
export interface AdminNavItem {
  label: string;
  href: string;
  /** Dashboard is active only on its own page, other items on their sub-pages too. */
  exact?: boolean;
}

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { label: "Dashboard", href: ADMIN_ROUTES.dashboard, exact: true },
  { label: "Stores", href: ADMIN_ROUTES.stores },
  { label: "Coupons", href: ADMIN_ROUTES.coupons },
  { label: "Links", href: ADMIN_ROUTES.shopLinks },
  { label: "Amazon Import", href: ADMIN_ROUTES.amazonImport },
  { label: "Add from store", href: ADMIN_ROUTES.storeProductNew },
];
