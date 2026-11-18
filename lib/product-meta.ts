// lib/product-meta.ts

import "server-only";

export interface ProductMeta {
  title: string | null;
  imageUrl: string | null;
}

export type ProductMetaResult =
  | ({ ok: true } & ProductMeta)
  | { ok: false; error: string };

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_LENGTH = 500_000;
const HTML_CONTENT_TYPE = "text/html";
const USER_AGENT = "CouponCreekBot/1.0 (+https://www.couponcreek.com)";

// Meta tags we read, best first: Open Graph, then Twitter cards
const TITLE_KEYS = ["og:title", "twitter:title"] as const;
const IMAGE_KEYS = [
  "og:image:secure_url",
  "og:image",
  "twitter:image",
] as const;

const META_TAG_PATTERN = /<meta\s[^>]*>/gi;
const ATTRIBUTE_PATTERN = /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const TITLE_TAG_PATTERN = /<title[^>]*>([^<]*)<\/title>/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
};

/** Turns &amp;, &#39; and &#x27; back into normal characters. */
function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (match, code: string) => {
      if (code[0] === "#") {
        const isHex = code[1].toLowerCase() === "x";
        const value = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        return Number.isNaN(value) ? match : String.fromCodePoint(value);
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    },
  );
}

function cleanText(text: string): string | null {
  const clean = decodeEntities(text).replace(/\s+/g, " ").trim();
  return clean === "" ? null : clean;
}

/** All <meta> tags as key → content. The key is property or name, lowercased. */
function readMetaTags(html: string): Map<string, string> {
  const tags = new Map<string, string>();

  for (const tag of html.match(META_TAG_PATTERN) ?? []) {
    const attributes = new Map<string, string>();
    for (const [, name, doubleQuoted, singleQuoted] of tag.matchAll(
      ATTRIBUTE_PATTERN,
    )) {
      attributes.set(name.toLowerCase(), doubleQuoted ?? singleQuoted ?? "");
    }

    const key = (
      attributes.get("property") ?? attributes.get("name")
    )?.toLowerCase();
    const content = attributes.get("content");
    // The first tag wins: pages sometimes repeat og:image for extra sizes
    if (key && content !== undefined && !tags.has(key)) {
      tags.set(key, content);
    }
  }

  return tags;
}

function firstValue(
  tags: Map<string, string>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = tags.get(key);
    const clean = value ? cleanText(value) : null;
    if (clean) return clean;
  }
  return null;
}

/** Image address as absolute https, or null: relative paths are resolved against the page. */
function toHttpsUrl(value: string | null, pageUrl: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, pageUrl);
    if (url.protocol === "http:") url.protocol = "https:";
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Reads the product title and image from the page HTML. Pure function, no network. */
export function parseProductMeta(html: string, pageUrl: string): ProductMeta {
  const tags = readMetaTags(html);
  const fallbackTitle = html.match(TITLE_TAG_PATTERN)?.[1] ?? null;

  return {
    title:
      firstValue(tags, TITLE_KEYS) ??
      (fallbackTitle ? cleanText(fallbackTitle) : null),
    imageUrl: toHttpsUrl(firstValue(tags, IMAGE_KEYS), pageUrl),
  };
}

/**
 * Downloads the product page and reads its title and image.
 * The caller must check first that the address belongs to the store.
 */
export async function fetchProductMeta(
  pageUrl: string,
  isAllowedUrl: (url: string) => boolean,
): Promise<ProductMetaResult> {
  let response: Response;
  try {
    response = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: HTML_CONTENT_TYPE },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      error: "The store did not respond. Fill in the fields by hand.",
    };
  }

  // After redirects the page must still be on the store's site
  if (!isAllowedUrl(response.url)) {
    return {
      ok: false,
      error: "The page redirected to another site. Fill in the fields by hand.",
    };
  }
  if (!response.ok) {
    return {
      ok: false,
      error: `The store blocked the request (HTTP ${response.status}). Fill in the fields by hand.`,
    };
  }
  if (!response.headers.get("content-type")?.includes(HTML_CONTENT_TYPE)) {
    return { ok: false, error: "This address is not a web page." };
  }

  const html = (await response.text()).slice(0, MAX_HTML_LENGTH);
  const meta = parseProductMeta(html, response.url);
  if (!meta.title && !meta.imageUrl) {
    return {
      ok: false,
      error: "No title or image found on the page. Fill in the fields by hand.",
    };
  }

  return { ok: true, ...meta };
}
