// lib/constants/admin.ts

import { AMAZON_IMPORT_PATH } from "@/lib/constants/amazon";

const ADMIN_ROOT = "/admin";

/** Dashboard: a coupon "expires soon" when its last day is within this many days. */
export const EXPIRING_SOON_DAYS = 3;
/** Dashboard: how many rows each "Needs attention" list shows before "+N more". */
export const ATTENTION_LIST_LIMIT = 8;

/** Every admin address in one place: pages, redirects and revalidation use these. */
export const ADMIN_ROUTES = {
  dashboard: ADMIN_ROOT,
  amazonImport: AMAZON_IMPORT_PATH,
  amazonLink: (asin: string) => `${AMAZON_IMPORT_PATH}/link/${asin}`,
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
  guides: `${ADMIN_ROOT}/guides`,
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
  { label: "Guides", href: ADMIN_ROUTES.guides },
  { label: "Amazon Import", href: ADMIN_ROUTES.amazonImport },
  { label: "Add from store", href: ADMIN_ROUTES.storeProductNew },
];

/** Admin list address with filters: withQuery(ADMIN_ROUTES.coupons, { status: "expired" }). */
export function withQuery(
  path: string,
  params: Record<string, string>,
): string {
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

/** Short confirmations shown after a save. The key travels in the address: ?notice=saved */
export const ADMIN_NOTICES = {
  saved: "Saved ✓",
  created: "Created ✓",
  added: "Added ✓",
} as const;

export type AdminNotice = keyof typeof ADMIN_NOTICES;

export const NOTICE_PARAM = "notice";
export const NOTICE_VISIBLE_MS = 3000;

export function isAdminNotice(value: string | null): value is AdminNotice {
  return value !== null && Object.hasOwn(ADMIN_NOTICES, value);
}

/** Adds ?notice=… to an address that may already have filters: /admin/coupons?status=active&notice=saved */
export function withNotice(path: string, notice: AdminNotice): string {
  const [base, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(NOTICE_PARAM, notice);
  return `${base}?${params.toString()}`;
}

/** Hidden field and query parameter that carry "where to go back" after a save. */
export const RETURN_TO_PARAM = "returnTo";

/**
 * The list address to go back to, only if it is that list (with or without filters).
 * Anything else, such as another site or another section, falls back to the plain list.
 */
export function safeAdminReturnTo(value: unknown, listPath: string): string {
  return typeof value === "string" &&
    (value === listPath || value.startsWith(`${listPath}?`))
    ? value
    : listPath;
}
