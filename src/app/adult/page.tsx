"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, CirclePlay, Clock3, Eye, Film, LockKeyhole, Menu, Search, Share2, ShieldCheck, Sparkles, X } from "lucide-react";
import { AdultStory, AdultVideo, INITIAL_ADULT_STORIES } from "@/data/adultContent";
import "./adult.css";

type Category = { id?: number; name: string; slug: string; video_count?: number };
type CatalogResponse = { total?: number; count?: number; pages?: number; next_page?: number | null; next?: string | null; results?: Record<string, unknown>[] };
type SortMode = "newest" | "popular";

function toVideo(item: Record<string, unknown>): AdultVideo | null {
  if (typeof item.id !== "number" && typeof item.id !== "string") return null;
  const id = String(item.id);
  const tags = Array.isArray(item.tags)
    ? item.tags.map((tag) => typeof tag === "string" ? tag : String((tag as { name?: unknown })?.name ?? "")).filter(Boolean)
    : [];
  const categories = Array.isArray(item.categories) ? item.categories : [];
  const category = typeof item.category === "string"
    ? item.category
    : String((categories[0] as { name?: unknown } | undefined)?.name ?? categories[0] ?? "ভিডিও");
  return {
    id,
    title: String(item.title ?? "শিরোনাম নেই"),
    description: String(item.description ?? ""),
    duration: String(item.duration ?? "সময় অজানা"),
    category,
    views: Number((item.stats as { views?: number } | undefined)?.views ?? item.views ?? item.view_count ?? 0),
    likes: Number((item.stats as { likes?: number } | undefined)?.likes ?? item.likes ?? item.like_count ?? 0),
    embedUrl: `https://adultembed.com/player/embed/${encodeURIComponent(id)}/`,
    thumbnailUrl: typeof item.thumbnail === "string" ? item.thumbnail : undefined,
    quality: typeof item.resolution === "string" && item.resolution ? item.resolution : undefined,
    tags,
    createdAt: String(item.published_at ?? ""),
  };
}

function formatCount(value: number) {
  return new Intl.NumberFormat("bn-BD", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value || 0);
}

function VideoCard({ video, onPlay }: { video: AdultVideo; onPlay: () => void }) {
  return (
    <article className="adult-video-card group">
      <button type="button" onClick={onPlay} className="adult-thumbnail" aria-label={`${video.title} দেখুন`}>
        {video.thumbnailUrl ? <Image src={video.thumbnailUrl} alt="" fill unoptimized sizes="(max-width: 640px) 94vw, (max-width: 1024px) 46vw, 30vw" className="adult-thumbnail-image" /> : <span className="adult-thumbnail-fallback"><Film size={30} /></span>}
        <span className="adult-thumbnail-shade" />
        <span className="adult-preview-note"><LockKeyhole size={13} /> প্রিভিউ আড়াল করা</span>
        <span className="adult-play"><CirclePlay size={46} strokeWidth={1.25} /></span>
        <span className="adult-duration"><Clock3 size={13} />{video.duration}</span>
        <span className="adult-card-category">{video.category}</span>
      </button>
      <div className="adult-card-copy">
        <button type="button" onClick={onPlay} className="adult-card-title">{video.title}</button>
        <p className="adult-card-description">{video.description || ""}</p>
        <div className="adult-card-meta"><span><Eye size={14} />{formatCount(video.views)} ভিউ</span>{video.quality && <span className="adult-quality">{video.quality}</span>}</div>
      </div>
    </article>
  );
}

export default function AdultPage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [videos, setVideos] = useState<AdultVideo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortMode>("popular");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [video, setVideo] = useState<AdultVideo | null>(null);
  const [story, setStory] = useState<AdultStory | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStories, setShowStories] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setIsVerified(localStorage.getItem("onuvuti_adult_verified") === "true"); }
      catch { setIsVerified(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVerified !== true) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ per_page: "24", page: String(page), sort });
        if (query.trim()) params.set("query", query.trim());
        if (category) params.set("categories", category);
        const response = await fetch(`/api/v1/adult/videos?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("catalogue request failed");
        const payload = await response.json() as CatalogResponse;
        setVideos((payload.results ?? []).map(toVideo).filter((item): item is AdultVideo => item !== null));
        setTotal(Number(payload.total ?? payload.count ?? 0));
        setHasNext(payload.next_page != null ? Number(payload.next_page) > page : Boolean(payload.next));
      } catch {
        if (!controller.signal.aborted) setError("ভিডিও তালিকা এখন পাওয়া যাচ্ছে না। একটু পর আবার চেষ্টা করুন।");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 250 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isVerified, query, category, sort, page, reloadToken]);

  useEffect(() => {
    if (isVerified !== true) return;
    const controller = new AbortController();
    fetch("/api/v1/adult/categories", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((payload) => setCategories(Array.isArray(payload?.results) ? payload.results : []))
      .catch(() => { if (!controller.signal.aborted) setCategories([]); });
    return () => controller.abort();
  }, [isVerified]);

  const pageCount = Math.max(1, Math.ceil(total / 24));
  const visibleStories = useMemo(() => INITIAL_ADULT_STORIES.slice(0, 3), []);
  const verify = () => {
    try { localStorage.setItem("onuvuti_adult_verified", "true"); } catch { /* storage can be disabled */ }
    setIsVerified(true);
  };
  const decline = () => {
    try { localStorage.removeItem("onuvuti_adult_verified"); } catch { /* storage can be disabled */ }
    router.push("/");
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { setCopied(false); }
  };

  if (isVerified === null) return <main className="adult-shell adult-loading"><span className="adult-spinner" aria-label="লোড হচ্ছে" /></main>;

  if (!isVerified) return (
    <main className="adult-shell adult-gate-wrap">
      <section className="adult-gate">
        <div className="adult-brand-mark"><Sparkles size={24} /></div>
        <span className="adult-eyebrow"><LockKeyhole size={13} /> সীমিত প্রবেশ</span>
        <h1>আপনি কি <em>১৮+</em>?</h1>
        <p>এই সংরক্ষিত অংশে প্রবেশ করতে আপনার বয়স ১৮ বছর বা তার বেশি হতে হবে। প্রবেশ করলে আপনি এই বয়সসীমায় সম্মতি দিচ্ছেন।</p>
        <div className="adult-gate-actions">
          <button type="button" className="adult-primary-button" onClick={verify}><Check size={17} /> হ্যাঁ, আমার বয়স ১৮+</button>
          <button type="button" className="adult-quiet-button" onClick={decline}><ArrowLeft size={15} /> মূল সাইটে ফিরে যান</button>
        </div>
        <small><ShieldCheck size={14} /> এই নির্বাচন শুধু এই ব্রাউজারে সংরক্ষিত হয়।</small>
      </section>
    </main>
  );

  return (
    <main className="adult-shell" id="top">
      <header className="adult-nav">
        <div className="adult-nav-inner">
          <Link href="/adult" className="adult-logo" aria-label="Onuvuti 18+ home"><span className="adult-logo-icon"><Sparkles size={18} /></span><span>onuvuti<span className="adult-logo-dot">.</span><small>AFTER HOURS</small></span></Link>
          <nav className={`adult-nav-links ${menuOpen ? "is-open" : ""}`} aria-label="প্রধান নেভিগেশন">
            <a href="#discover" onClick={() => setMenuOpen(false)}>আবিষ্কার</a><a href="#categories" onClick={() => setMenuOpen(false)}>ক্যাটাগরি</a><a href="#stories" onClick={() => setMenuOpen(false)}>গল্প</a>
          </nav>
          <div className="adult-nav-actions"><button type="button" onClick={share} className="adult-share-button"><Share2 size={15} /><span>{copied ? "কপি হয়েছে" : "শেয়ার"}</span></button><Link className="adult-main-link" href="/">মূল সাইট <ArrowRight size={14} /></Link><button type="button" className="adult-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="মেনু">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
        </div>
      </header>

      <div className="adult-content">
        <section className="adult-hero">
          <div className="adult-hero-copy">
            <div className="adult-hero-kicker"><span className="adult-live-dot" /> ON U V U T I <i /> PRIVATE COLLECTION</div>
            <h1>একটু <em>নিজের</em><br />জন্য সময়।</h1>
            <p>মননশীল গল্প, মুডি সিনেমাটিক মুহূর্ত আর প্রাপ্তবয়স্কদের জন্য একটি ব্যক্তিগত সংগ্রহ। নিজের গতিতে আবিষ্কার করুন।</p>
            <div className="adult-hero-actions"><a href="#discover" className="adult-primary-button">সংগ্রহ দেখুন <ArrowDown size={16} /></a><span><LockKeyhole size={14} /> ১৮+ প্রাপ্তবয়স্কদের জন্য</span></div>
          </div>
          <div className="adult-hero-art" aria-hidden="true"><div className="adult-orbit orbit-one" /><div className="adult-orbit orbit-two" /><div className="adult-moon" /><div className="adult-art-glass"><span>AFTER<br />HOURS</span><i /><small>EST. 2026</small></div><div className="adult-art-caption">A QUIETER KIND<br />OF ESCAPE</div></div>
          <div className="adult-hero-bottom"><span>CURATED FOR YOUR PRIVATE MOMENTS</span><span>SCROLL TO EXPLORE <ArrowDown size={13} /></span></div>
        </section>

        <section className="adult-discovery" id="discover">
          <div className="adult-section-heading"><div><span className="adult-section-kicker">THE COLLECTION</span><h2>আপনার পরের <em>আবিষ্কার</em></h2><p>নির্বাচিত ভিডিওর সংগ্রহ, নিয়মিত হালনাগাদ হয়।</p></div><div className="adult-total-count"><strong>{formatCount(total)}</strong><span>টি ভিডিও</span></div></div>

          <div className="adult-toolbar">
            <div className="adult-search"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="শিরোনাম বা বিষয় দিয়ে খুঁজুন" aria-label="ভিডিও খুঁজুন" />{query && <button type="button" onClick={() => setQuery("")} aria-label="সার্চ মুছুন"><X size={15} /></button>}</div>
            <div className="adult-sort" aria-label="ভিডিও সাজান"><button className={sort === "popular" ? "active" : ""} onClick={() => { setSort("popular"); setPage(1); }}>জনপ্রিয়</button><button className={sort === "newest" ? "active" : ""} onClick={() => { setSort("newest"); setPage(1); }}>নতুন</button></div>
          </div>

          <div className="adult-category-row" id="categories"><button type="button" onClick={() => { setCategory(""); setPage(1); }} className={`adult-category-pill ${!category ? "selected" : ""}`}>সব ভিডিও</button>{categories.slice(0, 9).map((item) => <button type="button" key={item.slug} onClick={() => { setCategory(item.slug); setPage(1); }} className={`adult-category-pill ${category === item.slug ? "selected" : ""}`}>{item.name}{item.video_count ? <small>{formatCount(item.video_count)}</small> : null}</button>)}</div>

          <div className="adult-grid-wrap" aria-live="polite">
            {loading && <div className="adult-video-grid">{Array.from({ length: 6 }, (_, index) => <div className="adult-skeleton" key={index}><span /><i /><b /></div>)}</div>}
            {!loading && error && <div className="adult-empty"><Film size={28} /><h3>সংগ্রহে সংযোগ করা যাচ্ছে না</h3><p>{error}</p><button className="adult-outline-button" type="button" onClick={() => setReloadToken((value) => value + 1)}>আবার চেষ্টা করুন <ArrowRight size={14} /></button></div>}
            {!loading && !error && videos.length === 0 && <div className="adult-empty"><Search size={28} /><h3>কোনো ফল পাওয়া যায়নি</h3><p>অন্য শব্দ বা ক্যাটাগরি দিয়ে খুঁজে দেখুন।</p><button className="adult-outline-button" type="button" onClick={() => { setQuery(""); setCategory(""); }}>ফিল্টার মুছুন <X size={14} /></button></div>}
            {!loading && !error && videos.length > 0 && <div className="adult-video-grid">{videos.map((item) => <VideoCard key={item.id} video={item} onPlay={() => setVideo(item)} />)}</div>}
          </div>
          {videos.length > 0 && <div className="adult-pagination"><span>পৃষ্ঠা {formatCount(page)} / {formatCount(pageCount)}</span><div><button type="button" disabled={page <= 1 || loading} onClick={() => { setPage((value) => Math.max(1, value - 1)); document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="আগের পৃষ্ঠা"><ChevronLeft size={18} /></button><button type="button" disabled={!hasNext || loading} onClick={() => { setPage((value) => value + 1); document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" }); }} aria-label="পরের পৃষ্ঠা"><ChevronRight size={18} /></button></div></div>}
        </section>

        <section className="adult-story-section" id="stories"><div className="adult-section-heading"><div><span className="adult-section-kicker">WORDS & FEELINGS</span><h2>নীরবতার <em>গল্পগুলো</em></h2><p>কিছু অনুভূতি পড়ার জন্য, কিছু শুধু অনুভব করার জন্য।</p></div><button type="button" className="adult-text-link" onClick={() => setShowStories(!showStories)}>{showStories ? "কম দেখুন" : "সব গল্প দেখুন"} <ArrowRight size={14} /></button></div><div className="adult-story-grid">{(showStories ? INITIAL_ADULT_STORIES : visibleStories).map((item, index) => <article className="adult-story-card" key={item.id}><div className="adult-story-number">0{index + 1}<BookOpen size={17} /></div><span className="adult-story-category">{item.category}</span><button type="button" className="adult-story-title" onClick={() => setStory(item)}>{item.title}</button><p>{item.excerpt}</p><div className="adult-story-footer"><span><Clock3 size={13} /> {item.readTime}</span><button type="button" onClick={() => setStory(item)}>গল্পটি পড়ুন <ArrowRight size={13} /></button></div></article>)}</div></section>

        <section className="adult-note"><div className="adult-note-icon"><ShieldCheck size={21} /></div><div><strong>ব্যক্তিগত, সংযত, আপনার মতো করে।</strong><p>এই অংশটি শুধুমাত্র প্রাপ্তবয়স্কদের জন্য। কনটেন্ট দেখতে আপনার স্থানীয় নিয়ম ও ১৮+ বয়সসীমা মেনে চলুন।</p></div><span>18<span>+</span></span></section>
      </div>

      <footer className="adult-footer"><Link href="/" className="adult-logo"><span className="adult-logo-icon"><Sparkles size={16} /></span><span>onuvuti<span className="adult-logo-dot">.</span><small>AFTER HOURS</small></span></Link><span>© 2026 Onuvuti · একটি ব্যক্তিগত সংগ্রহ</span><a href="#top">উপরে ফিরুন ↑</a></footer>

      {video && <div className="adult-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVideo(null); }}><section className="adult-player-modal" role="dialog" aria-modal="true" aria-label={video.title}><header><div><span>NOW PLAYING</span><h2>{video.title}</h2></div><button type="button" onClick={() => setVideo(null)} aria-label="বন্ধ করুন"><X size={19} /></button></header><div className="adult-player-frame"><iframe src={video.embedUrl} title={video.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div><div className="adult-player-meta"><span>{video.category}</span><span>{video.duration}</span><span><Eye size={14} /> {formatCount(video.views)} ভিউ</span></div><p>{video.description}</p></section></div>}
      {story && <div className="adult-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setStory(null); }}><section className="adult-reader-modal" role="dialog" aria-modal="true" aria-label={story.title}><header><span>{story.category}</span><button type="button" onClick={() => setStory(null)} aria-label="বন্ধ করুন"><X size={19} /></button></header><h2>{story.title}</h2><div className="adult-reader-byline">{story.author} <i /> {story.readTime}</div><div className="adult-reader-content">{story.content.map((paragraph, index) => <p key={`${story.id}-${index}`}>{paragraph}</p>)}</div><button type="button" className="adult-outline-button" onClick={() => setStory(null)}>বন্ধ করুন <X size={14} /></button></section></div>}
    </main>
  );
}
