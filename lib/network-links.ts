// lib/network-links.ts

const CJ_CLICK_PATTERN = /\/click-\d+-(\d+)/;
const CJ_DEEP_LINK_PARAM = "url";
const RAKUTEN_HOST = "click.linksynergy.com";
const RAKUTEN_OFFER_PARAM = "offerid";
const AMAZON_HOST_SUFFIX = "amazon.com";
const AMAZON_ASIN_PATTERN = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/;

function parseUrl(value: string): URL | null {
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
}

export function extractNetworkLinkId(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const cjMatch = parsed.pathname.match(CJ_CLICK_PATTERN);
  if (cjMatch) {
    // Глубокая ссылка: AID общий для всех товаров, ID конкретной ссылки нет
    if (parsed.searchParams.has(CJ_DEEP_LINK_PARAM)) return null;
    return cjMatch[1];
  }

  if (parsed.hostname === RAKUTEN_HOST) {
    return parsed.searchParams.get(RAKUTEN_OFFER_PARAM);
  }

  return null;
}

export function extractAmazonAsin(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  // У глубокой ссылки CJ настоящий адрес лежит в параметре url=
  const target = parsed.searchParams.get(CJ_DEEP_LINK_PARAM);
  const page = target ? parseUrl(target) : parsed;
  if (!page || !page.hostname.endsWith(AMAZON_HOST_SUFFIX)) return null;

  return page.pathname.match(AMAZON_ASIN_PATTERN)?.[1] ?? null;
}
