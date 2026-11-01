import { NextRequest, NextResponse } from "next/server";
import { getGoApiBaseUrl, getInternalAuthHeaders } from "@/lib/goApi";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const goBaseUrl = getGoApiBaseUrl();

  try {
    const authHeader = req.headers.get("authorization") || "";
    const headers: Record<string, string> = {
      ...getInternalAuthHeaders(),
      ...(authHeader ? { Authorization: authHeader } : {}),
    };

    const goRes = await fetch(
      `${goBaseUrl}/admin/analytics?${searchParams.toString()}`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (goRes.ok) {
      const data = await goRes.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn("Could not fetch analytics from Go Backend:", err);
  }

  // Fallback: Real 0 data (no fake seeded numbers)
  const now = new Date();
  const period = (searchParams.get("period") || "7d").toLowerCase();
  const todayStr = now.toISOString().slice(0, 10);

  return NextResponse.json({
    ok: true,
    analytics: {
      period,
      startDate: todayStr,
      endDate: todayStr,
      totalViews: 0,
      uniqueVisits: 0,
      storyReads: 0,
      bookPageViews: 0,
      totalOrders: 0,
      totalRevenue: 0,
      timeline: [],
      topStories: [],
    },
  });
}
