"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock3, Eye, Film, Play, ShieldCheck } from "lucide-react";
import type { AdultVideo } from "@/data/adultContent";
import { AdBanner300x250, AdBanner320x50, AdBanner468x60, AdNative } from "@/components/adult/AdUnits";
import "../../adult.css";

type Payload = { results?: Record<string, unknown>[]; video?: Record<string, unknown> } & Record<string, unknown>;

function normalizeVideo(value: Record<string, unknown>): AdultVideo | null {
  if (typeof value.id !== "number" && typeof value.id !== "string") return null;
  const cats = Array.isArray(value.categories) ? value.categories : [];
  const category = typeof value.category === "string"
    ? value.category
    : String((cats[0] as { name?: unknown } | undefined)?.name ?? cats[0] ?? "Video");
  const tags = Array.isArray(value.tags) ? value.tags.map((tag) => typeof tag === "string" ? tag : String((tag as { name?: unknown }).name ?? "")).filter(Boolean) : [];
  return {
    id: String(value.id),
    title: String(value.title ?? "Video"),
    description: String(value.description ?? ""),
    duration: String(value.duration ?? ""),
    category,
    views: Number(value.view_count ?? value.views ?? 0),
    likes: Number(value.like_count ?? value.likes ?? 0),
    embedUrl: `https://adultembed.com/player/embed/${encodeURIComponent(String(value.id))}/`,
    thumbnailUrl: typeof value.thumbnail === "string" ? value.thumbnail : undefined,
    quality: typeof value.resolution === "string" ? value.resolution : undefined,
    tags,
    createdAt: String(value.published_at ?? ""),
  };
}

function count(value: number) {
  return new Intl.NumberFormat("en", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value || 0);
}

export default function AdultVideoClient({ id }: { id: string }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [video, setVideo] = useState<AdultVideo | null>(null);
  const [related, setRelated] = useState<AdultVideo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setVerified(localStorage.getItem("onuvuti_adult_verified") === "true"); }
      catch { setVerified(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (verified !== true || !/^\d+$/.test(id)) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const [videoResponse, relatedResponse] = await Promise.all([
          fetch(`/api/v1/adult/videos/${encodeURIComponent(id)}`, { signal: controller.signal }),
          fetch(`/api/v1/adult/videos/${encodeURIComponent(id)}/related?limit=12`, { signal: controller.signal }),
        ]);
        if (!videoResponse.ok) throw new Error("This video is unavailable.");
        const detail = (await videoResponse.json()) as Payload;
        const normalized = normalizeVideo((detail.video ?? detail) as Record<string, unknown>);
        if (!normalized) throw new Error("The video response was invalid.");
        setVideo(normalized);
        if (relatedResponse.ok) {
          const data = (await relatedResponse.json()) as Payload;
          setRelated((data.results ?? []).map(normalizeVideo).filter((item): item is AdultVideo => item !== null));
        }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load this video.");
      }
    };
    void load();
    return () => controller.abort();
  }, [id, verified]);

  if (verified === null) return <main className="adult-shell adult-loading"><span className="adult-spinner" aria-label="Loading" /></main>;
  if (!verified) return <main className="adult-shell adult-gate-wrap"><section className="adult-gate"><div className="adult-brand-mark"><ShieldCheck /></div><span className="adult-eyebrow">18+ · AGE RESTRICTED</span><h1>Adults <em>Only</em></h1><p>Please confirm that you are at least 18 years old to view this section.</p><div className="adult-gate-actions"><button className="adult-primary-button" onClick={() => { localStorage.setItem("onuvuti_adult_verified", "true"); setVerified(true); }}>I am 18 or older</button><Link className="adult-quiet-button" href="/">Exit to Main Site</Link></div></section></main>;

  return (
    <main className="adult-shell adult-detail-page">
      <header className="adult-nav">
        <div className="adult-nav-inner">
          <Link href="/adult" className="adult-logo" aria-label="Onuvuti adult streaming home">
            <span className="adult-logo-brand">ONUVUTI</span>
            <span className="adult-logo-badge">STREAM</span>
          </Link>
          <Link href="/adult" className="adult-back-link">
            <ArrowLeft size={15} /> Back to Browse
          </Link>
        </div>
      </header>
      <div className="adult-content">
        <div className="adult-detail-top-ad"><AdBanner468x60 /><AdBanner320x50 /></div>
        {error ? <section className="adult-empty"><Film size={28} /><h1>Video unavailable</h1><p>{error}</p><Link className="adult-outline-button" href="/adult">Return to collection</Link></section> : !video ? <div className="adult-detail-loading"><span className="adult-spinner" aria-label="Loading video" /></div> : (
          <>
            <div className="adult-detail-layout">
              <div className="adult-detail-main">
                <div className="adult-detail-player"><iframe src={video.embedUrl} title={video.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
                <div className="adult-detail-copy">
                  <span className="adult-section-kicker">NOW PLAYING · {video.category}</span>
                  <h1>{video.title}</h1>
                  <div className="adult-detail-meta"><span><Clock3 size={14} /> {video.duration || "Duration unavailable"}</span><span><Eye size={14} /> {count(video.views)} views</span></div>
                  {video.description && <p>{video.description}</p>}
                  {video.tags.length > 0 && <div className="adult-detail-tags">{video.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                </div>
                <AdBanner300x250 />
              </div>
              <aside className="adult-detail-sidebar"><AdBanner300x250 /></aside>
            </div>
            <section className="adult-related-section">
              <div className="adult-section-heading"><div><span className="adult-section-kicker">KEEP EXPLORING</span><h2>Related <em>videos</em></h2><p>More from the collection, selected by AdultEmbed.</p></div></div>
              {related.length ? (
                <div className="adult-video-grid">
                  {related.map((item) => (
                    <Link
                      className="adult-video-card adult-related-card"
                      href={`/adult/video/${encodeURIComponent(item.id)}`}
                      key={item.id}
                    >
                      <span className="adult-thumbnail">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.title}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 94vw, 30vw"
                            className="adult-thumbnail-image"
                          />
                        ) : (
                          <span className="adult-thumbnail-fallback">
                            <Play size={32} />
                          </span>
                        )}
                        <span className="adult-thumbnail-shade" />
                        <span className="adult-play">
                          <span className="adult-play-inner">
                            <Play size={20} fill="currentColor" />
                          </span>
                        </span>
                        <span className="adult-duration">{item.duration}</span>
                      </span>
                      <span className="adult-card-copy">
                        <span className="adult-card-title">{item.title}</span>
                        <span className="adult-card-meta">{count(item.views)} views</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="adult-related-empty">Related videos are unavailable right now.</p>
              )}
              <AdNative />
              <Link className="adult-outline-button adult-return-button" href="/adult">
                <ArrowLeft size={14} /> Back to Browse
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
