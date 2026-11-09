"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Film,
  Flame,
  Heart,
  LockKeyhole,
  Menu,
  Play,
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
type Tag = { id?: number; name: string; slug: string; video_count?: number };
type CatalogResponse = {
  total?: number;
  count?: number;
  pages?: number;
  next_page?: number | null;
  next?: string | null;
  results?: Record<string, unknown>[];
};
type SortMode = "popular" | "newest";

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
      : String((categories[0] as { name?: unknown } | undefined)?.name ?? categories[0] ?? "Featured");
  return {
    id,
    title: String(item.title ?? "Untitled Video"),
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
    quality: typeof item.resolution === "string" && item.resolution ? item.resolution : "HD",
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

function VideoCard({ video }: { video: AdultVideo }) {
  return (
    <article className="adult-video-card group">
      <Link
        href={`/adult/video/${encodeURIComponent(video.id)}`}
        className="adult-thumbnail"
        aria-label={`Watch ${video.title}`}
      >
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 94vw, (max-width: 1024px) 46vw, 30vw"
            className="adult-thumbnail-image"
          />
        ) : (
          <span className="adult-thumbnail-fallback">
            <Film size={32} />
          </span>
        )}
        <span className="adult-thumbnail-shade" />
        <span className="adult-play">
          <span className="adult-play-inner">
            <Play size={24} fill="currentColor" />
          </span>
        </span>
        <span className="adult-duration">
          <Clock3 size={11} />
          {video.duration}
        </span>
        <span className="adult-card-category">{video.category}</span>
      </Link>
      <div className="adult-card-copy">
        <Link
          href={`/adult/video/${encodeURIComponent(video.id)}`}
          className="adult-card-title"
          title={video.title}
        >
          {video.title}
        </Link>
        <div className="adult-card-meta">
          <span>
            <Eye size={13} />
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<SortMode>("popular");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [serverPages, setServerPages] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        const params = new URLSearchParams({
          per_page: "24",
          page: String(page),
          sort,
          period: "week",
        });
        if (query.trim()) params.set("query", query.trim());
        if (category) params.set("categories", category);
        if (tag) params.set("tags", tag);

        const endpoint = sort === "popular" ? "/api/v1/adult/videos/trending" : "/api/v1/adult/videos";
        const response = await fetch(`${endpoint}?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Catalogue request failed");
        const payload = (await response.json()) as CatalogResponse;
        const normalizedVideos = (payload.results ?? [])
          .map(toVideo)
          .filter((item): item is AdultVideo => item !== null);
        setVideos(normalizedVideos);

        const totalCount = Number(payload.total ?? payload.count ?? 0);
        setTotal(totalCount);

        const pagesCount =
          typeof payload.pages === "number" && payload.pages > 0 ? payload.pages : null;
        setServerPages(pagesCount);

        const nextExists =
          payload.next_page != null ? Number(payload.next_page) > page : Boolean(payload.next);
        setHasNext(nextExists);
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
  }, [isVerified, query, category, tag, sort, page, reloadToken]);

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
    fetch("/api/v1/adult/tags", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((payload) => setTags(Array.isArray(payload?.results) ? payload.results : []))
      .catch(() => {
        if (!controller.signal.aborted) setTags([]);
      });
    return () => controller.abort();
  }, [isVerified]);

  const pageCount = useMemo(() => {
    if (serverPages && serverPages > 0) {
      return Math.min(serverPages, 500);
    }
    if (total > 0) {
      return Math.min(Math.ceil(total / 24), 500);
    }
    if (hasNext) {
      return Math.max(50, page + 1);
    }
    return Math.max(1, page);
  }, [serverPages, total, hasNext, page]);

  const visibleStories = useMemo(() => INITIAL_ADULT_STORIES.slice(0, 3), []);

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1 || (pageCount > 0 && newPage > pageCount) || loading) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      {/* Netflix-style Top Sticky Navigation */}
      <header className="adult-nav">
        <div className="adult-nav-inner">
          <Link href="/adult" className="adult-logo" aria-label="Onuvuti adult streaming home">
            <span className="adult-logo-brand">ONUVUTI</span>
            <span className="adult-logo-badge">STREAM</span>
          </Link>
          <nav
            className={`adult-nav-links ${menuOpen ? "is-open" : ""}`}
            aria-label="Main Navigation"
          >
            <a href="#discover" onClick={() => setMenuOpen(false)}>
              Videos
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
        {/* Top Ad Unit */}
        <div className="adult-ad-top">
          <AdBanner468x60 />
          <AdBanner320x50 />
        </div>

        {/* Search and catalogue controls */}
        <div className="adult-browse-header" id="discover">
          <div className="adult-browse-topline">
            <div className="adult-search-bar">
              <Search size={18} className="adult-search-icon" />
              <input
                type="text"
                maxLength={100}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search videos, titles, categories..."
                aria-label="Search videos"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  aria-label="Clear search query"
                  className="adult-search-clear"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="adult-sort-pills" aria-label="Sort videos">
              <button
                type="button"
                className={`adult-sort-pill ${sort === "popular" ? "is-active" : ""}`}
                onClick={() => {
                  setSort("popular");
                  setPage(1);
                }}
              >
                <Flame size={14} />
                <span>Trending</span>
              </button>
              <button
                type="button"
                className={`adult-sort-pill ${sort === "newest" ? "is-active" : ""}`}
                onClick={() => {
                  setSort("newest");
                  setPage(1);
                }}
              >
                <Sparkles size={14} />
                <span>Newest</span>
              </button>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="adult-genre-bar" aria-label="Categories">
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setTag("");
                setPage(1);
              }}
              className={`adult-genre-pill ${!category && !tag ? "is-active" : ""}`}
            >
              All Videos
            </button>
            {categories.slice(0, 16).map((item) => (
              <button
                type="button"
                key={item.slug}
                onClick={() => {
                  setCategory(category === item.slug ? "" : item.slug);
                  setTag("");
                  setPage(1);
                }}
                className={`adult-genre-pill ${category === item.slug ? "is-active" : ""}`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Popular Tags Row (if tags available) */}
          {tags.length > 0 && (
            <div className="adult-tag-bar" aria-label="Popular tags">
              <span className="adult-tag-bar-label">Tags:</span>
              {tags.slice(0, 12).map((item) => (
                <button
                  type="button"
                  key={item.slug}
                  onClick={() => {
                    setTag(tag === item.slug ? "" : item.slug);
                    setCategory("");
                    setPage(1);
                  }}
                  className={`adult-tag-pill ${tag === item.slug ? "is-active" : ""}`}
                >
                  #{item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Grid & Sidebar Layout */}
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
                  <Film size={32} />
                  <h3>Unable to Load Videos</h3>
                  <p>{error}</p>
                  <button
                    className="adult-primary-button"
                    type="button"
                    onClick={() => setReloadToken((value) => value + 1)}
                  >
                    Try Again <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {!loading && !error && videos.length === 0 && (
                <div className="adult-empty">
                  <Search size={32} />
                  <h3>No Videos Found</h3>
                  <p>Try searching with different keywords or clear your active filters.</p>
                  <button
                    className="adult-outline-button"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("");
                      setTag("");
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
                      <VideoCard video={item} />
                      {index === 5 && videos.length > 6 && (
                        <div className="adult-ad-card-wrapper">
                          <AdBanner300x250 />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Always Visible Numbered Pagination */}
            {videos.length > 0 && (pageCount > 1 || hasNext || page > 1) && (
              <nav className="adult-pagination" aria-label="Pagination">
                <div className="adult-pagination-info">
                  {total > 0 ? (
                    <>
                      Page <strong>{page}</strong> of <strong>{pageCount}</strong>{" "}
                      <span className="adult-pagination-total">
                        ({formatCount(total)} videos available)
                      </span>
                    </>
                  ) : (
                    <>
                      Page <strong>{page}</strong> of <strong>{pageCount}</strong>
                    </>
                  )}
                </div>
                <div className="adult-pagination-nav">
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
                    disabled={(!hasNext && page >= pageCount) || loading}
                    onClick={() => handlePageChange(page + 1)}
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </nav>
            )}
          </div>

          {/* Desktop Right Sidebar Advertisement */}
          <aside className="adult-sidebar-ad">
            <AdBanner160x300 />
          </aside>
        </div>

        {/* Stories Section */}
        <section className="adult-story-section" id="stories">
          <div className="adult-section-heading">
            <div>
              <span className="adult-section-kicker">CURATED READS</span>
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

        {/* Native Ad Container */}
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
        <Link href="/adult" className="adult-logo">
          <span className="adult-logo-brand">ONUVUTI</span>
          <span className="adult-logo-badge">STREAM</span>
        </Link>
        <span>© 2026 Onuvuti · Streaming Discovery Platform</span>
        <a href="#top">Back to Top ↑</a>
      </footer>
      <AdAdditional />

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
