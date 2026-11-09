import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAuthorizedCronRequest } from "@/lib/cron";

export async function GET(request: Request) {
  // Проверяем авторизацию запроса от Vercel Cron (для защиты от спама)
  if (!isAuthorizedCronRequest(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Простейший быстрый запрос для "пробуждения" БД
    const { error } = await supabase.from("stores").select("id").limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "ok",
      message: "Database pinged successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message: errorMessage },
      { status: 500 },
    );
  }
}
