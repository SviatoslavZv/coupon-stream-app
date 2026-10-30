// lib/network-links.ts

const CJ_CLICK_PATTERN = /\/click-\d+-(\d+)/;
const RAKUTEN_HOST = "click.linksynergy.com";
const RAKUTEN_OFFER_PARAM = "offerid";

export function extractNetworkLinkId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const cjMatch = parsed.pathname.match(CJ_CLICK_PATTERN);
  if (cjMatch) {
    return cjMatch[1];
  }

  if (parsed.hostname === RAKUTEN_HOST) {
    return parsed.searchParams.get(RAKUTEN_OFFER_PARAM);
  }

  return null;
}
