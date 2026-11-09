"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clock3,
  Eye,
  Film,
  Heart,
  LockKeyhole,
  Menu,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { AdultStory, AdultVideo, INITIAL_ADULT_STORIES } from "@/data/adultContent";
import {
  AdAdditional,
  AdBanner160x300,
  AdBanner300x250,
  AdBanner320x50,
  AdBanner468x60,
  AdNative,
} from "@/components/adult/AdUnits";
import "./adult.css";

type Category = { id?: number; name: string; slug: string; video_count?: number };
type CatalogResponse = {
  total?: number;
  count?: number;
  pages?: number;
  next_page?: number | null;
  next?: string | null;
  results?: Record<string, unknown>[];
};
type SortMode = "newest" | "popular";

function toVideo(item: Record<string, unknown>): AdultVideo | null {
  if (typeof item.id !== "number" && typeof item.id !== "string") return null;
  const id = String(item.id);
  const tags = Array.isArray(item.tags)
    ? item.tags
        .map((tag) =>
          typeof tag === "string" ? tag : String((tag as { name?: unknown })?.name ?? "")
        )
        .filter(Boolean)
    : [];
  const categories = Array.isArray(item.categories) ? item.categories : [];
  const category =
    typeof item.category === "string"
      ? item.category
      : String((categories[0] as { name?: unknown } | undefined)?.name ?? categories[0] ?? "Video");
  return {
    id,
    title: String(item.title ?? "Untitled"),
    description: String(item.description ?? ""),
    duration: String(item.duration ?? "Unknown"),
    category,
    views: Number(
      (item.stats as { views?: number } | undefined)?.views ?? item.views ?? item.view_count ?? 0
    ),
    likes: Number(
      (item.stats as { likes?: number } | undefined)?.likes ?? item.likes ?? item.like_count ?? 0
    ),
    embedUrl: `https://adultembed.com/player/embed/${encodeURIComponent(id)}/`,
    thumbnailUrl: typeof item.thumbnail === "string" ? item.thumbnail : undefined,
    quality: typeof item.resolution === "string" && item.resolution ? item.resolution : undefined,
    tags,
    createdAt: String(item.published_at ?? ""),
  };
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value > 9999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function generatePaginationItems(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

function VideoCard({ video, onPlay }: { video: AdultVideo; onPlay: () => void }) {
  return (
    <article className="adult-video-card group">
      <button
        type="button"
        onClick={onPlay}
        className="adult-thumbnail"
        aria-label={`Watch ${video.title}`}
      >
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 94vw, (max-width: 1024px) 46vw, 30vw"
            className="adult-thumbnail-image"
          />
        ) : (
          <span className="adult-thumbnail-fallback">
            <Film size={30} />
          </span>
        )}
        <span className="adult-thumbnail-shade" />
        <span className="adult-preview-note">
          <LockKeyhole size={13} /> PREVIEW HIDDEN
        </span>
        <span className="adult-play">
          <CirclePlay size={46} strokeWidth={1.25} />
        </span>
        <span className="adult-duration">
          <Clock3 size={13} />
          {video.duration}
        </span>
        <span className="adult-card-category">{video.category}</span>
      </button>
      <div className="adult-card-copy">
        <button type="button" onClick={onPlay} className="adult-card-title">
          {video.title}
        </button>
        <p className="adult-card-description">{video.description || ""}</p>
        <div className="adult-card-meta">
          <span>
            <Eye size={14} />
            {formatCount(video.views)} views
          </span>
          {video.quality && <span className="adult-quality">{video.quality}</span>}
        </div>
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
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [readerFont, setReaderFont] = useState<"small" | "normal" | "large">("normal");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setIsVerified(localStorage.getItem("onuvuti_adult_verified") === "true");
      } catch {
        setIsVerified(false);
      }
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
        const response = await fetch(`/api/v1/adult/videos?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("catalogue request failed");
        const payload = (await response.json()) as CatalogResponse;
        setVideos(
          (payload.results ?? []).map(toVideo).filter((item): item is AdultVideo => item !== null)
        );
        setTotal(Number(payload.total ?? payload.count ?? 0));
        setHasNext(
          payload.next_page != null ? Number(payload.next_page) > page : Boolean(payload.next)
        );
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load video catalogue right now. Please try again shortly.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 250 : 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isVerified, query, category, sort, page, reloadToken]);

  useEffect(() => {
    if (isVerified !== true) return;
    const controller = new AbortController();
    fetch("/api/v1/adult/categories", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((payload) => setCategories(Array.isArray(payload?.results) ? payload.results : []))
      .catch(() => {
        if (!controller.signal.aborted) setCategories([]);
      });
    return () => controller.abort();
  }, [isVerified]);

  const pageCount = Math.max(1, Math.ceil(total / 24));
  const visibleStories = useMemo(() => INITIAL_ADULT_STORIES.slice(0, 3), []);

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1 || newPage > pageCount || loading) return;
    setPage(newPage);
    document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
  };

  const verify = () => {
    try {
      localStorage.setItem("onuvuti_adult_verified", "true");
    } catch {}
    setIsVerified(true);
  };

  const decline = () => {
    try {
      localStorage.removeItem("onuvuti_adult_verified");
    } catch {}
    router.push("/");
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  if (isVerified === null) {
    return (
      <main className="adult-shell adult-loading">
        <span className="adult-spinner" aria-label="Loading" />
      </main>
    );
  }

  if (!isVerified) {
    return (
      <main className="adult-shell adult-gate-wrap">
        <section className="adult-gate">
          <div className="adult-brand-mark">
            <Sparkles size={24} />
          </div>
          <span className="adult-eyebrow">
            <LockKeyhole size={13} /> RESTRICTED ACCESS
          </span>
          <h1>
            Are you <em>18 or older</em>?
          </h1>
          <p>
            This section contains adult and age-restricted material. You must be at least 18 years
            of age or the age of majority in your jurisdiction to enter.
          </p>
          <div className="adult-gate-actions">
            <button type="button" className="adult-primary-button" onClick={verify}>
              <Check size={17} /> I am 18 or older — Enter
            </button>
            <button type="button" className="adult-quiet-button" onClick={decline}>
              <ArrowLeft size={15} /> Exit to Main Site
            </button>
          </div>
          <small>
            <ShieldCheck size={14} /> Your selection is stored locally in this browser.
          </small>
        </section>
      </main>
    );
  }

  const paginationItems = generatePaginationItems(page, pageCount);

  return (
    <main className="adult-shell" id="top">
      {/* Top Header */}
      <header className="adult-nav">
        <div className="adult-nav-inner">
          <Link href="/adult" className="adult-logo" aria-label="Onuvuti 18+ home">
            <span className="adult-logo-icon">
              <Sparkles size={18} />
            </span>
            <span>
              onuvuti<span className="adult-logo-dot">.</span>
              <small>AFTER HOURS</small>
            </span>
          </Link>
          <nav
            className={`adult-nav-links ${menuOpen ? "is-open" : ""}`}
            aria-label="Main Navigation"
          >
            <a href="#discover" onClick={() => setMenuOpen(false)}>
              Discover
            </a>
            <a href="#categories" onClick={() => setMenuOpen(false)}>
              Categories
            </a>
            <a href="#stories" onClick={() => setMenuOpen(false)}>
              Stories
            </a>
          </nav>
          <div className="adult-nav-actions">
            <button type="button" onClick={share} className="adult-share-button">
              <Share2 size={15} />
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
            <Link className="adult-main-link" href="/">
              Main Site <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              className="adult-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <div className="adult-content">
        <div className="adult-ad-top">
          <AdBanner468x60 />
          <AdBanner320x50 />
        </div>
        {/* Hero Section */}
        <section className="adult-hero">
          <div className="adult-hero-copy">
            <div className="adult-hero-kicker">
              <span className="adult-live-dot" /> ONUVUTI · PRIVATE COLLECTION
            </div>
            <h1>
              PRIVATE<br />MOMENTS,<em>AFTER HOURS</em>
            </h1>
            <p>
              Curated cinematic moments, immersive stories, and an exclusive private collection for
              adults. Explore at your own pace.
            </p>
            <div className="adult-hero-actions">
              <a href="#discover" className="adult-primary-button">
                Explore Collection <ArrowDown size={16} />
              </a>
              <span>
                <LockKeyhole size={14} /> 18+ Adults Only
              </span>
            </div>
          </div>
          <div className="adult-hero-art" aria-hidden="true">
            <div className="adult-orbit orbit-one" />
            <div className="adult-orbit orbit-two" />
            <div className="adult-moon" />
            <div className="adult-art-glass">
              <span>
                AFTER<br />HOURS
              </span>
              <i />
              <small>EST. 2026</small>
            </div>
            <div className="adult-art-caption">
              A QUIETER KIND<br />OF ESCAPE
            </div>
          </div>
          <div className="adult-hero-bottom">
            <span>CURATED FOR YOUR PRIVATE MOMENTS</span>
            <span>
              SCROLL TO EXPLORE <ArrowDown size={13} />
            </span>
          </div>
        </section>

        {/* Discovery & Catalogue */}
        <section className="adult-discovery" id="discover">
          <div className="adult-section-heading">
            <div>
              <span className="adult-section-kicker">THE COLLECTION</span>
              <h2>
                Explore The <em>Catalogue</em>
              </h2>
              <p>Handpicked video catalogue, updated continuously.</p>
            </div>
            <div className="adult-total-count">
              <strong>{formatCount(total)}</strong>
              <span>videos</span>
            </div>
          </div>

          <div className="adult-toolbar">
            <div className="adult-search">
              <Search size={17} />
              <input
                maxLength={100}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, performer or tag..."
                aria-label="Search videos"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search query"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div className="adult-sort" aria-label="Sort videos">
              <button
                className={sort === "popular" ? "active" : ""}
                onClick={() => {
                  setSort("popular");
                  setPage(1);
                }}
              >
                Popular
              </button>
              <button
                className={sort === "newest" ? "active" : ""}
                onClick={() => {
                  setSort("newest");
                  setPage(1);
                }}
              >
                Newest
              </button>
            </div>
          </div>

          {/* Categories Pill Row */}
          <div className="adult-category-row" id="categories">
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className={`adult-category-pill ${!category ? "selected" : ""}`}
            >
              All Videos
            </button>
            {categories.slice(0, 12).map((item) => (
              <button
                type="button"
                key={item.slug}
                onClick={() => {
                  setCategory(item.slug);
                  setPage(1);
                }}
                className={`adult-category-pill ${category === item.slug ? "selected" : ""}`}
              >
                {item.name}
                {item.video_count ? <small>{formatCount(item.video_count)}</small> : null}
              </button>
            ))}
          </div>

          {/* Video Grid */}
          <div className="adult-catalog-layout">
          <div className="adult-catalog-main">
          <div className="adult-grid-wrap" aria-live="polite">
            {loading && (
              <div className="adult-video-grid">
                {Array.from({ length: 6 }, (_, index) => (
                  <div className="adult-skeleton" key={index}>
                    <span />
                    <i />
                    <b />
                  </div>
                ))}
              </div>
            )}
            {!loading && error && (
              <div className="adult-empty">
                <Film size={28} />
                <h3>Unable to Connect to Catalogue</h3>
                <p>{error}</p>
                <button
                  className="adult-outline-button"
                  type="button"
                  onClick={() => setReloadToken((value) => value + 1)}
                >
                  Try Again <ArrowRight size={14} />
                </button>
              </div>
            )}
            {!loading && !error && videos.length === 0 && (
              <div className="adult-empty">
                <Search size={28} />
                <h3>No Videos Found</h3>
                <p>Try searching with different keywords or clearing category filters.</p>
                <button
                  className="adult-outline-button"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("");
                  }}
                >
                  Clear Filters <X size={14} />
                </button>
              </div>
            )}
            {!loading && !error && videos.length > 0 && (
              <div className="adult-video-grid">
                {videos.map((item, index) => (
                  <Fragment key={item.id}>
                    <VideoCard video={item} onPlay={() => setVideo(item)} />
                    {index === 5 && videos.length > 6 && <AdBanner300x250 />}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
          </div>
          <aside className="adult-sidebar-ad">
            <AdBanner160x300 />
          </aside>
          </div>

          {/* Full Rich Pagination Component */}
          {videos.length > 0 && pageCount > 1 && (
            <div className="adult-pagination">
              <div className="adult-pagination-info">
                Showing Page {page} of {pageCount} ({formatCount(total)} videos available)
              </div>
              <div className="adult-pagination-nav" aria-label="Pagination Navigation">
                <button
                  type="button"
                  className="adult-page-btn is-nav"
                  disabled={page <= 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                {paginationItems.map((item, index) => {
                  if (item === "...") {
                    return (
                      <span key={`ellipsis-${index}`} className="adult-page-ellipsis">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = item === page;
                  return (
                    <button
                      key={`page-${item}`}
                      type="button"
                      disabled={loading}
                      className={`adult-page-btn ${isCurrent ? "is-active" : ""}`}
                      onClick={() => handlePageChange(item)}
                      aria-current={isCurrent ? "page" : undefined}
                      aria-label={`Go to page ${item}`}
                    >
                      {item}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="adult-page-btn is-nav"
                  disabled={!hasNext || page >= pageCount || loading}
                  onClick={() => handlePageChange(page + 1)}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Stories Section */}
        <section className="adult-story-section" id="stories">
          <div className="adult-section-heading">
            <div>
              <span className="adult-section-kicker">WORDS & FEELINGS</span>
              <h2>
                Stories & <em>Reflections</em>
              </h2>
              <p>Sensual narratives and intimate midnight stories.</p>
            </div>
            <button
              type="button"
              className="adult-text-link"
              onClick={() => setShowStories(!showStories)}
            >
              {showStories ? "Show Less" : "View All Stories"} <ArrowRight size={14} />
            </button>
          </div>
          <div className="adult-story-grid">
            {(showStories ? INITIAL_ADULT_STORIES : visibleStories).map((item, index) => (
              <article className="adult-story-card" key={item.id}>
                <div className="adult-story-number">
                  0{index + 1}
                  <BookOpen size={17} />
                </div>
                <span className="adult-story-category">{item.category}</span>
                <button
                  type="button"
                  className="adult-story-title"
                  onClick={() => setStory(item)}
                >
                  {item.title}
                </button>
                <p>{item.excerpt}</p>
                <div className="adult-story-footer">
                  <span>
                    <Clock3 size={13} /> {item.readTime}
                  </span>
                  <div className="adult-story-actions">
                    <button
                      type="button"
                      className={likedStories[item.id] ? "is-liked" : ""}
                      aria-label="Like story"
                      onClick={() =>
                        setLikedStories((current) => ({
                          ...current,
                          [item.id]: !current[item.id],
                        }))
                      }
                    >
                      <Heart
                        size={14}
                        fill={likedStories[item.id] ? "currentColor" : "none"}
                      />
                      {formatCount(item.likes + (likedStories[item.id] ? 1 : 0))}
                    </button>
                    <button type="button" onClick={() => setStory(item)}>
                      Read <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <AdNative />

        {/* Disclaimer Note */}
        <section className="adult-note">
          <div className="adult-note-icon">
            <ShieldCheck size={21} />
          </div>
          <div>
            <strong>Private, discreet, and strictly 18+.</strong>
            <p>
              This section is reserved exclusively for adults. Please comply with your local laws
              and regulations regarding age-restricted adult content.
            </p>
          </div>
          <span>
            18<span>+</span>
          </span>
        </section>
      </div>

      {/* Footer */}
      <footer className="adult-footer">
        <Link href="/" className="adult-logo">
          <span className="adult-logo-icon">
            <Sparkles size={16} />
          </span>
          <span>
            onuvuti<span className="adult-logo-dot">.</span>
            <small>AFTER HOURS</small>
          </span>
        </Link>
        <span>© 2026 Onuvuti · Private Curated Collection</span>
        <a href="#top">Back to Top ↑</a>
      </footer>
      <AdAdditional />

      {/* Video Player Modal */}
      {video && (
        <div
          className="adult-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setVideo(null);
          }}
        >
          <section
            className="adult-player-modal"
            role="dialog"
            aria-modal="true"
            aria-label={video.title}
          >
            <header>
              <div>
                <span>NOW PLAYING</span>
                <h2>{video.title}</h2>
              </div>
              <button type="button" onClick={() => setVideo(null)} aria-label="Close">
                <X size={19} />
              </button>
            </header>
            <div className="adult-player-frame">
              <iframe
                src={video.embedUrl}
                title={video.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="adult-player-meta">
              <span>{video.category}</span>
              <span>{video.duration}</span>
              <span>
                <Eye size={14} /> {formatCount(video.views)} views
              </span>
            </div>
            <p>{video.description}</p>
          </section>
        </div>
      )}

      {/* Story Reader Modal */}
      {story && (
        <div
          className="adult-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setStory(null);
          }}
        >
          <section
            className="adult-reader-modal"
            role="dialog"
            aria-modal="true"
            aria-label={story.title}
          >
            <header>
              <span>{story.category}</span>
              <div className="adult-reader-tools">
                <div className="adult-font-tools" aria-label="Text Size">
                  <button
                    type="button"
                    onClick={() => setReaderFont("small")}
                    aria-pressed={readerFont === "small"}
                  >
                    A−
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFont("normal")}
                    aria-pressed={readerFont === "normal"}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderFont("large")}
                    aria-pressed={readerFont === "large"}
                  >
                    A+
                  </button>
                </div>
                <button type="button" onClick={() => setStory(null)} aria-label="Close">
                  <X size={19} />
                </button>
              </div>
            </header>
            <h2>{story.title}</h2>
            <div className="adult-reader-byline">
              {story.author} <i /> {story.readTime}
            </div>
            <div className={`adult-reader-content reader-${readerFont}`}>
              {story.content.map((paragraph, index) => (
                <p key={`${story.id}-${index}`}>{paragraph}</p>
              ))}
            </div>
            <div className="adult-reader-bottom">
              <button
                type="button"
                className={`adult-like-button ${likedStories[story.id] ? "is-liked" : ""}`}
                onClick={() =>
                  setLikedStories((current) => ({
                    ...current,
                    [story.id]: !current[story.id],
                  }))
                }
              >
                <Heart
                  size={15}
                  fill={likedStories[story.id] ? "currentColor" : "none"}
                />{" "}
                Liked · {formatCount(story.likes + (likedStories[story.id] ? 1 : 0))}
              </button>
              <button
                type="button"
                className="adult-outline-button"
                onClick={() => setStory(null)}
              >
                Close <X size={14} />
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
