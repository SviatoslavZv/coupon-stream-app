// app/api/go/[store]/route.ts

import { after, NextResponse, type NextRequest } from "next/server";
import { getStoreRedirectUrl, recordClick } from "@/lib/redirect";

const NO_CACHE =
  "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/go/[store]">,
) {
  const { store: slug } = await params;
  const couponId = request.nextUrl.searchParams.get("coupon") ?? undefined;

  const redirectInfo = await getStoreRedirectUrl(slug, couponId);

  if (!redirectInfo) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.set("Cache-Control", NO_CACHE);
    return response;
  }

  after(() => recordClick(redirectInfo.storeId, couponId));

  const response = NextResponse.redirect(redirectInfo.url, { status: 307 });
  response.headers.set("Cache-Control", NO_CACHE);
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}
