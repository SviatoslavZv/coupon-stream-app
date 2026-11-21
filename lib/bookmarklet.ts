// lib/bookmarklet.ts

import { ADMIN_ROUTES } from "@/lib/constants/admin";
import { STORE_PRODUCT_PREFILL_PARAMS as PARAMS } from "@/lib/schemas/store-products";
import { SITE_URL } from "@/lib/constants/site";

/**
 * Code of the "Send to CouponCreek" bookmark. It runs on the product page you are viewing,
 * reads the address, og:title and og:image there, and opens our Quick add page in a new tab.
 * Your browser reads the page, so stores have nothing to block.
 */
export function bookmarkletHref(): string {
  const target = `${SITE_URL}${ADMIN_ROUTES.quickAdd}`;

  // No // comments inside the code below: it becomes one line, and // would cut off everything after it.
  // Image: same rule as lib/product-meta.ts, prefer og:image:secure_url and upgrade http to https.
  const code = `(() => {
    const meta = (key) =>
      document.querySelector('meta[property="' + key + '"], meta[name="' + key + '"]')?.content?.trim() || "";
    const rawImage = meta("og:image:secure_url") || meta("og:image") || meta("twitter:image");
    const image = rawImage ? new URL(rawImage, location.href) : null;
    if (image && image.protocol === "http:") image.protocol = "https:";
    const params = new URLSearchParams({
      ${PARAMS.url}: location.href,
      ${PARAMS.title}: meta("og:title") || document.title,
      ${PARAMS.image}: image && image.protocol === "https:" ? image.href : "",
    });
    window.open(${JSON.stringify(target)} + "?" + params.toString(), "_blank");
  })();`;

  // One line, so the browser keeps the whole code in the bookmark address
  return `javascript:${encodeURIComponent(code.replace(/\s+/g, " "))}`;
}
