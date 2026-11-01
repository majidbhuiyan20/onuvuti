import { NextRequest, NextResponse } from "next/server";
import { BLOG_POSTS } from "@/data/blogData";

const BN_MONTHS = [
  "জানু",
  "ফেব্রু",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টে",
  "অক্টো",
  "নভে",
  "ডিসে",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") || "7d").toLowerCase();
  const customStart = searchParams.get("startDate") || "";
  const customEnd = searchParams.get("endDate") || "";

  const now = new Date();
  let daysCount = 7;
  if (period === "daily") daysCount = 1;
  else if (period === "monthly") daysCount = 30;
  else if (period === "yearly") daysCount = 365;

  const timeline = [];
  let totalViews = 0;
  let uniqueVisits = 0;
  let storyReads = 0;
  let bookPageViews = 0;
  let totalOrders = 0;
  let totalRevenue = 0;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    if (period === "custom") {
      if (customStart && dateStr < customStart) continue;
      if (customEnd && dateStr > customEnd) continue;
    }

    const seed = (d.getDate() * 17 + d.getDay() * 31 + i * 7) % 180;
    const views = 340 + seed;
    const unique = Math.round(views * 0.68);
    const reads = Math.round(views * 0.74);
    const bookViews = Math.round(views * 0.26);
    const orders = (seed % 5) + 1;
    const revenue = orders * 99;

    totalViews += views;
    uniqueVisits += unique;
    storyReads += reads;
    bookPageViews += bookViews;
    totalOrders += orders;
    totalRevenue += revenue;

    timeline.push({
      date: dateStr,
      labelBn: `${d.getDate()} ${BN_MONTHS[d.getMonth()]}`,
      pageViews: views,
      uniqueVisits: unique,
      storyReads: reads,
      bookPageViews: bookViews,
      bookOrders: orders,
      revenueBdt: revenue,
    });
  }

  const topStories = BLOG_POSTS.map((st, idx) => ({
    id: st.id,
    slug: st.slug,
    title: st.title,
    category: st.category,
    viewsCount: st.likesCount * 5 + (6 - idx) * 110,
    likesCount: st.likesCount,
  })).sort((a, b) => b.viewsCount - a.viewsCount);

  return NextResponse.json({
    ok: true,
    analytics: {
      period,
      startDate: timeline[0]?.date || now.toISOString().slice(0, 10),
      endDate:
        timeline[timeline.length - 1]?.date || now.toISOString().slice(0, 10),
      totalViews,
      uniqueVisits,
      storyReads,
      bookPageViews,
      totalOrders,
      totalRevenue,
      timeline,
      topStories,
    },
  });
}

