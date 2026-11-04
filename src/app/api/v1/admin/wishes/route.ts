import { NextRequest, NextResponse } from "next/server";
import { getGoApiBaseUrl } from "@/lib/goApi";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const baseUrl = getGoApiBaseUrl();

    const goRes = await fetch(`${baseUrl}/admin/wishes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    const text = await goRes.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: "ডাটাবেজ থেকে তথ্য পাওয়া যায়নি।" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: goRes.status });
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error("GET /api/v1/admin/wishes error:", err);
    return NextResponse.json(
      { ok: false, error: "সার্ভারে সংযোগ ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}
