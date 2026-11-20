// lib/quick-add.ts

import { ASIN_PATTERN } from "@/lib/constants/amazon";
import { extractAmazonAsin, isPageOfSite } from "@/lib/network-links";
import type { DeepLinkStore } from "@/lib/stores";

const AMAZON_DOMAIN = "amazon.com";
const AMAZON_SHORT_DOMAIN = "amzn.to";
const WEB_PROTOCOLS = new Set(["https:", "http:"]);
const HAS_PROTOCOL = /^[a-z][a-z0-9+.-]*:/i;

export type QuickAddTarget =
  | { kind: "amazon"; asin: string }
  | { kind: "store"; store: DeepLinkStore; productUrl: string }
  | { kind: "error"; message: string };

/** Accepts "zulily.com/p/…" too: an address without https:// gets it added. */
function parseWebUrl(value: string): URL | null {
  try {
    const url = new URL(HAS_PROTOCOL.test(value) ? value : `https://${value}`);
    // A real site has a dot in its name: "boots" alone is a word, not an address
    return WEB_PROTOCOLS.has(url.protocol) && url.hostname.includes(".")
      ? url
      : null;
  } catch {
    return null;
  }
}

function siteHostLength(websiteUrl: string): number {
  return parseWebUrl(websiteUrl)?.hostname.length ?? 0;
}

function isAmazonHost(hostname: string): boolean {
  return hostname === AMAZON_DOMAIN || hostname.endsWith(`.${AMAZON_DOMAIN}`);
}

/**
 * Decides where a pasted value should go: an ASIN or an Amazon link → Amazon import,
 * a product page of one of our stores → "Add from store" with that store picked. Pure function.
 */
export function resolveQuickAdd(
  input: string,
  stores: readonly DeepLinkStore[],
): QuickAddTarget {
  const value = input.trim();
  if (value === "") {
    return {
      kind: "error",
      message: "Paste a product link or an Amazon ASIN.",
    };
  }

  const asin = value.toUpperCase();
  if (ASIN_PATTERN.test(asin)) {
    return { kind: "amazon", asin };
  }

  const url = parseWebUrl(value);
  if (!url) {
    return {
      kind: "error",
      message:
        "Paste a full address that starts with https://, or a 10-character ASIN.",
    };
  }

  if (url.hostname === AMAZON_SHORT_DOMAIN) {
    return {
      kind: "error",
      message:
        "Short amzn.to links hide the product. Open it and copy the full address.",
    };
  }

  if (isAmazonHost(url.hostname)) {
    const linkAsin = extractAmazonAsin(url.toString());
    return linkAsin
      ? { kind: "amazon", asin: linkAsin }
      : {
          kind: "error",
          message:
            "This Amazon address has no product code. Open the product page and copy its address.",
        };
  }

  // Store pages are linked over https only, like buildDeepLink requires
  url.protocol = "https:";

  // The most specific site wins: shop.example.com before example.com
  const store = [...stores]
    .sort((a, b) => siteHostLength(b.websiteUrl) - siteHostLength(a.websiteUrl))
    .find((candidate) => isPageOfSite(url.toString(), candidate.websiteUrl));

  return store
    ? { kind: "store", store, productUrl: url.toString() }
    : {
        kind: "error",
        message: `${url.hostname} is not one of our stores with deep links. Add the store first.`,
      };
}
