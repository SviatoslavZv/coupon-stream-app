// app/api/cron/amazon-recheck/route.ts

import { NextResponse } from "next/server";
import { runAmazonRecheck } from "@/lib/amazon-recheck";
import { isAuthorizedCronRequest } from "@/lib/cron";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await runAmazonRecheck();
    console.log("Amazon recheck finished:", report);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Amazon recheck failed:", error);
    return NextResponse.json({ error: "Recheck failed" }, { status: 500 });
  }
}
