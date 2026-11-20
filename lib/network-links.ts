// lib/network-links.ts

const CJ_CLICK_PATTERN = /\/click-\d+-(\d+)/;
const CJ_DEEP_LINK_PARAM = "url";
const RAKUTEN_HOST = "click.linksynergy.com";
const RAKUTEN_OFFER_PARAM = "offerid";
const IMPACT_CLICK_PATTERN = /^\/c\/\d+\/\d+\/\d+\/?$/;
const IMPACT_DEEP_LINK_PARAM = "u";
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

// Параметр, в котором сеть передаёт конечный адрес: CJ, Rakuten, Impact, Awin, ShareASale
const DESTINATION_PARAMS = ["url", "murl", "u", "ued", "urllink"] as const;
const WEB_PROTOCOLS = new Set(["https:", "http:"]);

/** Конечный адрес внутри партнёрской глубокой ссылки, без перехода по ней. */
export function extractDestinationUrl(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  for (const param of DESTINATION_PARAMS) {
    const target = parsed.searchParams.get(param);
    const page = target ? parseUrl(target) : null;
    if (page && WEB_PROTOCOLS.has(page.protocol)) {
      return page.toString();
    }
  }

  return null;
}

// Tracking parameter for network reports: CJ — sid, Rakuten — u1, Impact — subId1
const CJ_TRACKING_PARAM = "sid";
const RAKUTEN_TRACKING_PARAM = "u1";
const IMPACT_TRACKING_PARAM = "subId1";
const TRACKING_ID_MAX_LENGTH = 50;

/** Метка гайда для отчётов сетей: guide-<slug>, в пределах лимита длины. */
export function guideTrackingId(slug: string): string {
  return `guide-${slug}`.slice(0, TRACKING_ID_MAX_LENGTH);
}

/** Adds the tracking label to CJ, Rakuten and Impact links. Other links are returned as is. */
export function withTrackingId(url: string, trackingId: string): string {
  const parsed = parseUrl(url);
  if (!parsed) return url;

  if (CJ_CLICK_PATTERN.test(parsed.pathname)) {
    parsed.searchParams.set(CJ_TRACKING_PARAM, trackingId);
  } else if (parsed.hostname === RAKUTEN_HOST) {
    parsed.searchParams.set(RAKUTEN_TRACKING_PARAM, trackingId);
  } else if (IMPACT_CLICK_PATTERN.test(parsed.pathname)) {
    parsed.searchParams.set(IMPACT_TRACKING_PARAM, trackingId);
  } else {
    return url;
  }

  return parsed.toString();
}

// Rakuten deep link: click.linksynergy.com/deeplink?id=…&mid=…&murl=…
const RAKUTEN_DEEP_LINK_PATH = "/deeplink";
const RAKUTEN_PUBLISHER_PARAM = "id";
const RAKUTEN_MERCHANT_PARAM = "mid";
const RAKUTEN_DESTINATION_PARAM = "murl";
const MARKETING_PARAM_PREFIX = "utm_";

export type DeepLinkResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function bareHost(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

/** Same site or its subdomain: shop.example.com belongs to example.com. */
function belongsToSite(page: URL, website: URL): boolean {
  const pageHost = bareHost(page.hostname);
  const siteHost = bareHost(website.hostname);
  return pageHost === siteHost || pageHost.endsWith(`.${siteHost}`);
}
/** True when the page address is on the store's site, for example to find the store of a pasted link. */
export function isPageOfSite(pageUrl: string, websiteUrl: string): boolean {
  const page = parseUrl(pageUrl);
  const website = parseUrl(websiteUrl);
  return page !== null && website !== null && belongsToSite(page, website);
}

/** Drops the #anchor and utm_* tags: the network adds its own tracking. */
function cleanProductUrl(page: URL): string {
  const clean = new URL(page);
  clean.hash = "";
  for (const key of [...clean.searchParams.keys()]) {
    if (key.startsWith(MARKETING_PARAM_PREFIX)) clean.searchParams.delete(key);
  }
  return clean.toString();
}

/**
 * Builds a deep link to one product page from the store's affiliate link.
 * CJ: click link + ?url=. Impact: /c/ link + ?u=. Rakuten: deeplink with id and mid + &murl=.
 */
export function buildDeepLink(
  storeAffiliateLink: string | null,
  storeWebsiteUrl: string | null,
  productUrl: string,
): DeepLinkResult {
  const page = parseUrl(productUrl);
  if (!page || page.protocol !== "https:") {
    return { ok: false, error: "Product URL must start with https://" };
  }

  const website = storeWebsiteUrl ? parseUrl(storeWebsiteUrl) : null;
  if (!website) {
    return { ok: false, error: "Set the store's website URL first." };
  }
  if (!belongsToSite(page, website)) {
    return {
      ok: false,
      error: `This page is not on ${bareHost(website.hostname)}. Check the store.`,
    };
  }

  const base = storeAffiliateLink ? parseUrl(storeAffiliateLink) : null;
  if (!base) {
    return { ok: false, error: "The store has no affiliate link." };
  }

  const target = cleanProductUrl(page);

  if (CJ_CLICK_PATTERN.test(base.pathname)) {
    base.search = "";
    base.searchParams.set(CJ_DEEP_LINK_PARAM, target);
    return { ok: true, url: base.toString() };
  }

  if (IMPACT_CLICK_PATTERN.test(base.pathname)) {
    base.search = "";
    base.searchParams.set(IMPACT_DEEP_LINK_PARAM, target);
    return { ok: true, url: base.toString() };
  }

  const publisherId = base.searchParams.get(RAKUTEN_PUBLISHER_PARAM);
  const merchantId = base.searchParams.get(RAKUTEN_MERCHANT_PARAM);
  if (
    base.hostname === RAKUTEN_HOST &&
    base.pathname === RAKUTEN_DEEP_LINK_PATH &&
    publisherId &&
    merchantId
  ) {
    base.search = "";
    base.searchParams.set(RAKUTEN_PUBLISHER_PARAM, publisherId);
    base.searchParams.set(RAKUTEN_MERCHANT_PARAM, merchantId);
    base.searchParams.set(RAKUTEN_DESTINATION_PARAM, target);
    return { ok: true, url: base.toString() };
  }

  return {
    ok: false,
    error:
      "The store's affiliate link can't make deep links. Use a full CJ click link, a Rakuten deeplink with mid= or an Impact /c/ link.",
  };
}
