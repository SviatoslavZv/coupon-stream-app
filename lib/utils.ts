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

  // Дата хранится без времени, поэтому по умолчанию JS интерпретирует её
  // как начало суток (00:00 UTC). Купон должен оставаться действующим
  // весь указанный день — переключаем точку отсчёта на конец суток
  // (23:59:59.999 UTC), а не на начало.
  const expiryDate = new Date(expiresAt);
  if (isNaN(expiryDate.getTime())) return false;

  expiryDate.setUTCHours(23, 59, 59, 999);
  return expiryDate.getTime() < Date.now();
}