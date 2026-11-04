import { NextRequest, NextResponse } from "next/server";
import { getGoApiBaseUrl } from "@/lib/goApi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const baseUrl = getGoApiBaseUrl();

    const goRes = await fetch(`${baseUrl}/wishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await goRes.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "ডাটাবেজ থেকে সঠিক তথ্য পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: goRes.status });
  } catch (err: unknown) {
    console.error("POST /api/v1/wishes error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "সার্ভারে সংযোগ স্থাপন করা সম্ভব হয়নি। ডাটাবেজ ব্যাকএন্ড সাময়িকভাবে অনুপলব্ধ।",
      },
      { status: 500 }
    );
  }
}

