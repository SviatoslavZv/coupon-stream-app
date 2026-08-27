import { NextRequest, NextResponse } from "next/server";
import { getStoreRedirectUrl, recordClick } from "@/lib/redirect";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ store: string }> }
) {
  const { store: slug } = await params;
  const couponId = request.nextUrl.searchParams.get("coupon");

  const redirectInfo = await getStoreRedirectUrl(slug, couponId ?? undefined);

  // 1. Если магазин не найден — редирект на главную (тоже без кэширования)
  if (!redirectInfo) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  // 2. Логируем клик асинхронно, не заставляя пользователя ждать ответа БД
  // (Вам не нужно ставить await перед recordClick)
  recordClick(redirectInfo.storeId, couponId ?? undefined).catch((err) => {
    console.error("Failed to record click:", err);
  });

  // 3. Формируем редирект с полным запретом кэширования и защиты от индексации ботами
  const response = NextResponse.redirect(redirectInfo.url, { status: 307 });

  // Гарантия, что браузер Будет обращаться к серверу ПРИ КАЖДОМ клике:
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  
  // Запрещаем поисковым ботам индексировать редиректные ссылки:
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  return response;
}