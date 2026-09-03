import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { status: "ok", service: "job-copilot-web" },
    { headers: { "Cache-Control": "no-store" } },
  );
}