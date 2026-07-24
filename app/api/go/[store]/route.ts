// app/api/go/[store]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getStoreRedirectUrl, recordClick } from "@/lib/redirect";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ store: string }> }
) {
  const { store: slug } = await params;
  const couponId = request.nextUrl.searchParams.get("coupon");

  const redirectInfo = await getStoreRedirectUrl(slug);

  if (!redirectInfo) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await recordClick(redirectInfo.storeId, couponId ?? undefined);

  return NextResponse.redirect(redirectInfo.url);
}