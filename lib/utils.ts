// lib/utils.ts

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractDomain(url: string): string | null {
  try {
    const withProtocol = url.startsWith("http") ? url : `https://${url}`;
    return new URL(withProtocol).hostname;
  } catch {
    return null;
  }
}

export function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}


export function isCouponExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt).getTime();
  return !isNaN(expiryDate) && expiryDate < Date.now();
}