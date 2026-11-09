import { Suspense } from "react";
import type { Metadata } from "next";
import { getGoApiBaseUrl } from "@/lib/goApi";
import AdultVideoClient from "./AdultVideoClient";

type VideoPayload = { video?: { title?: string; description?: string; thumbnail?: string } } & { title?: string; description?: string; thumbnail?: string };

async function getVideo(id: string): Promise<VideoPayload | null> {
  if (!/^\d+$/.test(id)) return null;
  try {
    const response = await fetch(`${getGoApiBaseUrl()}/adult/videos/${encodeURIComponent(id)}`, { next: { revalidate: 600 } });
    if (!response.ok) return null;
    return await response.json() as VideoPayload;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const payload = await getVideo(id);
  const video = payload?.video ?? payload;
  const title = video?.title?.trim();
  if (!title) return { title: "18+ Video | Onuvuti After Hours", robots: { index: false, follow: true }, other: { rating: "adult" } };
  const description = (video?.description || `Watch ${title} in Onuvuti’s age-restricted 18+ collection.`).replace(/\s+/g, " ").slice(0, 160);
  const path = `/adult/video/${encodeURIComponent(id)}`;
  return {
    title: `${title} | Onuvuti After Hours`, description,
    alternates: { canonical: path },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    other: { rating: "adult" },
    openGraph: { title, description, url: path, type: "video.other", ...(video?.thumbnail ? { images: [video.thumbnail] } : {}) },
  };
}

async function AdultVideoPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdultVideoClient id={id} />;
}

export default function AdultVideoPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<main className="adult-shell adult-detail-loading"><span className="adult-spinner" aria-label="Loading video" /></main>}><AdultVideoPageContent params={params} /></Suspense>;
}
