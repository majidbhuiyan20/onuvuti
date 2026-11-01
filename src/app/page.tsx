"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  Search,
  Sparkles,
  Heart,
  PenLine,
  Send,
  X,
  CheckCircle2,
  UserCheck,
  EyeOff,
  ImagePlus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Pin,
  TrendingUp,
  MessageSquareHeart,
  Bookmark,
  Shuffle,
  Eye,
  Copy,
  Check,
  Quote,
  BarChart2,
} from "lucide-react";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  BlogPost,
  StoryCategory,
  DAILY_QUOTES_BN,
  HOME_POLL_QUESTION,
  INITIAL_POLL_OPTIONS,
  PollOptionItem,
} from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import { validateImageUpload } from "@/lib/security";
import { GO_API_BASE_URL } from "@/lib/goApi";

export default function OnuvutiBlogHomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [activeCategory, setActiveCategory] = useState("সকল গল্প");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {}
  );

  // Daily Quote State
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteCopied, setQuoteCopied] = useState(false);

  // 1-Click Reader Poll State
  const [pollOptions, setPollOptions] =
    useState<PollOptionItem[]>(INITIAL_POLL_OPTIONS);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  // My Submissions & Tracking Code State (No Account Required)
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [mySubmittedIds, setMySubmittedIds] = useState<
    Array<{ id: string; title: string; category: string }>
  >([]);
  const [trackedStoriesMap, setTrackedStoriesMap] = useState<
    Record<
      string,
      BlogPost & { status?: string; viewsCount?: number; adminNote?: string }
    >
  >({});
  const [manualTrackCode, setManualTrackCode] = useState("");
  const [manualTrackedResult, setManualTrackedResult] = useState<
    | (BlogPost & { status?: string; viewsCount?: number; adminNote?: string })
    | null
  >(null);
  const [manualTrackError, setManualTrackError] = useState<string | null>(null);
  const [lastSubmittedTrackingId, setLastSubmittedTrackingId] = useState<
    string | null
  >(null);

  // Story Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [storyCategory, setStoryCategory] =
    useState<StoryCategory>("ক্রাশ ও কনফেশন");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  // Optional Image State (Only added if writer chooses to upload!)
  const [storyImageDataUrl, setStoryImageDataUrl] = useState<string | undefined>(
    undefined
  );
  const [imageError, setImageError] = useState<string | null>(null);
  // Anti-bot honeypot field
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Fetch published stories from Go Backend (with fallback to local storage/seed)
  useEffect(() => {
    // Select daily quote based on day of month
    const dayIdx = new Date().getDate() % DAILY_QUOTES_BN.length;
    setQuoteIdx(dayIdx);

    // Load saved bookmarks & poll vote from localStorage
    try {
      const savedBookmarks = localStorage.getItem("onuvuti_bookmarked_ids");
      if (savedBookmarks) {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      }

      const savedMySubs = localStorage.getItem("onuvuti_my_submissions");
      if (savedMySubs) {
        const parsedSubs = JSON.parse(savedMySubs);
        if (Array.isArray(parsedSubs)) {
          setMySubmittedIds(parsedSubs);
        }
      }

      const savedVote = localStorage.getItem("onuvuti_home_poll_vote");
      const savedPollCounts = localStorage.getItem("onuvuti_home_poll_counts");
      if (savedVote) {
        setSelectedPollId(savedVote);
      }
      if (savedPollCounts) {
        const parsedCounts = JSON.parse(savedPollCounts);
        if (Array.isArray(parsedCounts) && parsedCounts.length > 0) {
          setPollOptions(parsedCounts);
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Track homepage visit in Go Analytics
    fetch(`${GO_API_BASE_URL}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/" }),
    }).catch(() => {});

    async function loadStoriesFromGo() {
      try {
        const res = await fetch(`${GO_API_BASE_URL}/stories?page=1&limit=50`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.stories) && data.stories.length > 0) {
            setPosts(data.stories);
            return;
          }
        }
      } catch {
        // Fallback to localStorage if Go server is offline
      }

      try {
        const savedPublished = localStorage.getItem("onuvuti_published_stories");
        if (savedPublished) {
          const parsed = JSON.parse(savedPublished) as BlogPost[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
          }
        }
      } catch {
        // Ignore storage errors
      }
    }
    loadStoriesFromGo();
  }, []);

  const bookmarkedCount = Object.values(bookmarkedIds).filter(Boolean).length;

  const filteredPosts = posts
    .filter((post) => {
      if (showSavedOnly && !bookmarkedIds[post.id]) {
        return false;
      }
      const matchCat =
        activeCategory === "সকল গল্প" || post.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  // Top 3 Trending / Most Read Stories ("সপ্তাহের সেরা ও সবচেয়ে বেশি পড়া লেখা")
  const trendingPosts = [...posts]
    .sort(
      (a, b) =>
        (b.viewsCount || b.likesCount * 5) - (a.viewsCount || a.likesCount * 5)
    )
    .slice(0, 3);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const alreadyLiked = Boolean(likedIds[id]);
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!alreadyLiked) {
      fetch(`${GO_API_BASE_URL}/stories/${encodeURIComponent(id)}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "love" }),
      }).catch(() => {});
    }
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("onuvuti_bookmarked_ids", JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  const handleCopyDailyQuote = async () => {
    const quoteText = `“${DAILY_QUOTES_BN[quoteIdx]}” — অনুভূতি (onuvuti.site)`;
    try {
      await navigator.clipboard.writeText(quoteText);
      setQuoteCopied(true);
      setTimeout(() => setQuoteCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  const handleSurpriseRandomStory = () => {
    if (posts.length === 0) return;
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    router.push(`/blog/${randomPost.slug}`);
  };

  const handlePollVote = (optionId: string) => {
    if (selectedPollId) return;
    const updated = pollOptions.map((opt) =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    setSelectedPollId(optionId);
    setPollOptions(updated);
    try {
      localStorage.setItem("onuvuti_home_poll_vote", optionId);
      localStorage.setItem("onuvuti_home_poll_counts", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const totalPollVotes = pollOptions.reduce((sum, item) => sum + item.votes, 0);

  const handleWriterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateImageUpload(file);
    if (!check.valid) {
      setImageError(check.errorBn || "ছবিটি গ্রহণযোগ্য নয়।");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setStoryImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const payload = {
      title: storyTitle,
      content: storyBody,
      category: storyCategory,
      author: senderName,
      isAnonymous,
      imageUrl: storyImageDataUrl, // undefined if writer didn't upload an image
      websiteUrl, // Honeypot
    };

    try {
      // Submit directly to Go Backend first (fallback to Next.js API if Go is unreachable)
      let res: Response;
      try {
        res = await fetch(`${GO_API_BASE_URL}/stories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        res = await fetch("/api/stories/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSubmitError(
          data.error || "আপনার লেখাটি পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
        );
        setIsSubmitting(false);
        return;
      }

      // Also sync to localStorage fallback & My Submissions Tracker
      if (data.story?.id) {
        setLastSubmittedTrackingId(data.story.id);
        const newSubEntry = {
          id: data.story.id,
          title: data.story.title || storyTitle,
          category: data.story.category || storyCategory,
        };
        setMySubmittedIds((prev) => {
          const next = [
            newSubEntry,
            ...prev.filter((item) => item.id !== newSubEntry.id),
          ];
          try {
            localStorage.setItem(
              "onuvuti_my_submissions",
              JSON.stringify(next)
            );
          } catch {
            // Ignore quota errors
          }
          return next;
        });
      }

      try {
        const existingPendingRaw = localStorage.getItem(
          "onuvuti_pending_stories"
        );
        const existingPending = existingPendingRaw
          ? JSON.parse(existingPendingRaw)
          : [];
        localStorage.setItem(
          "onuvuti_pending_stories",
          JSON.stringify([data.story, ...existingPending])
        );
      } catch {
        // Ignore storage quota errors
      }

      setSubmittedSuccess(true);
    } catch {
      setSubmitError("নেটওয়ার্ক ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTrackerModal = async () => {
    setIsTrackerModalOpen(true);
    setManualTrackError(null);

    const updatedMap: Record<
      string,
      BlogPost & { status?: string; viewsCount?: number; adminNote?: string }
    > = {};

    for (const sub of mySubmittedIds) {
      const matchedPublished = posts.find((p) => p.id === sub.id);
      if (matchedPublished) {
        updatedMap[sub.id] = { ...matchedPublished, status: "published" };
        continue;
      }

      try {
        const res = await fetch(
          `${GO_API_BASE_URL}/stories/track/${encodeURIComponent(sub.id)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.story) {
            updatedMap[sub.id] = data.story;
          }
        }
      } catch {
        // Fallback if offline
      }
    }

    setTrackedStoriesMap(updatedMap);
  };

  const handleManualTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualTrackError(null);
    setManualTrackedResult(null);

    const cleanCode = manualTrackCode.trim().replace(/^#/, "");
    if (!cleanCode) return;

    const matchedLocal = posts.find(
      (p) =>
        p.id.toLowerCase() === cleanCode.toLowerCase() ||
        p.slug.toLowerCase() === cleanCode.toLowerCase()
    );
    if (matchedLocal) {
      setManualTrackedResult({ ...matchedLocal, status: "published" });
      return;
    }

    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/stories/track/${encodeURIComponent(cleanCode)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.story) {
          setManualTrackedResult(data.story);
          return;
        }
      }
    } catch {
      // Ignore network error
    }

    setManualTrackError(
      "এই ট্র্যাকিং কোডে কোনো লেখা পাওয়া যায়নি। কোডটি আবার যাচাই করুন।"
    );
  };

  const resetModal = () => {
    setSubmittedSuccess(false);
    setSubmitError(null);
    setImageError(null);
    setStoryTitle("");
    setStoryBody("");
    setStoryImageDataUrl(undefined);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#142230] flex flex-col">
      {/* Clean Light Mode Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply"
            />
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#FAF4E6] border border-[#C59B27]/50 text-[#80131E] font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 hover:bg-[#f3e8ce] transition cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>গল্প / কনফেশন পাঠান</span>
            </button>

            <Link
              href="/sporsher-byakoron"
              className="px-4 py-2 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm hover:bg-[#630d16] transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>‘স্পর্শের ব্যাকরণ’ ই-বুক</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Hero Welcome: Romantic Stories, Crush & Confession, Life Stories & Unspoken Words */}
        <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E6] text-[#80131E] text-xs font-bold">
              রোমান্টিক গল্প • ক্রাশ ও কনফেশন • না বলা কথা
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142230] leading-snug">
              ভালোবাসার গল্প, গোপন ক্রাশ, জীবনের গল্প ও মনের না বলা কথা
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              এখানে মানুষ শেয়ার করে তাদের ভালোবাসার গল্প, গোপন কনফেশন, জীবনের অভিমান ও চাপা থাকা অনুভূতি। আপনিও নিজের নামে বা নাম গোপন রেখে আপনার গল্প পাঠাতে পারেন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openTrackerModal}
              className="px-4 py-3.5 rounded-2xl bg-[#FAF4E6] border border-[#C59B27]/50 text-[#80131E] font-bold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#f3e8ce] transition cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>আমার পাঠানো লেখা ({mySubmittedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:bg-[#630d16] transition cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>গল্প / কনফেশন পাঠান</span>
            </button>
          </div>
        </div>

        {/* FEATURE 2: Daily One-Line Quote Bar ("আজকের অনুভূতি") */}
        <div className="rounded-2xl bg-[#FAF4E6] border border-[#C59B27]/45 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 text-xs sm:text-sm text-[#142230]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#80131E] text-white text-[11px] font-extrabold shrink-0">
              <Quote className="w-3 h-3" />
              আজকের অনুভূতি
            </span>
            <p className="font-semibold italic text-stone-800 leading-relaxed">
              “{DAILY_QUOTES_BN[quoteIdx]}”
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setQuoteIdx((prev) => (prev + 1) % DAILY_QUOTES_BN.length)
              }
              className="px-2.5 py-1 rounded-lg bg-white/80 border border-stone-200 text-[11px] font-bold text-stone-600 hover:text-[#80131E] cursor-pointer transition"
            >
              পরের উক্তি
            </button>
            <button
              type="button"
              onClick={handleCopyDailyQuote}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-stone-200 text-xs font-bold text-[#80131E] hover:bg-stone-50 cursor-pointer transition"
            >
              {quoteCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>উক্তিটি কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Trending / Most Read Stories Section ("সপ্তাহের সেরা ও পাঠকপ্রিয় লেখা") */}
        {trendingPosts.length > 0 && !searchQuery.trim() && !showSavedOnly && (
          <div className="rounded-3xl bg-white border border-stone-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#142230]">
                <TrendingUp className="w-4 h-4 text-[#80131E]" />
                <span>সপ্তাহের সেরা ও পাঠকপ্রিয় লেখা</span>
              </div>
              <span className="text-xs font-bold text-[#80131E]">
                সর্বাধিক পঠিত
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {trendingPosts.map((tp, idx) => (
                <Link
                  key={tp.id}
                  href={`/blog/${tp.slug}`}
                  className="group rounded-2xl bg-[#FDF8F2] border border-stone-200/80 p-4 hover:border-[#80131E]/50 transition flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#80131E]">
                        #{idx + 1} • {tp.category}
                      </span>
                      <span className="text-stone-400 font-semibold inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(tp.viewsCount || tp.likesCount * 5).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#142230] group-hover:text-[#80131E] line-clamp-2 leading-snug">
                      {tp.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 truncate">
                    — {tp.author}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter, Bookmarks Filter, Search & Random Story Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {BLOG_CATEGORIES.map((cat) => {
              const active = !showSavedOnly && activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setShowSavedOnly(false);
                    setActiveCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                    active
                      ? "bg-[#80131E] text-white shadow-xs"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-[#80131E]/40"
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            {/* FEATURE 1: Saved / Bookmarked Stories Filter Button */}
            <button
              type="button"
              onClick={() => {
                setShowSavedOnly((prev) => !prev);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                showSavedOnly
                  ? "bg-[#80131E] text-white shadow-xs"
                  : "bg-[#FAF4E6] text-[#80131E] border border-[#C59B27]/50 hover:bg-[#f3e8ce]"
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  showSavedOnly ? "fill-white" : "fill-[#80131E]/20"
                }`}
              />
              <span>সংরক্ষিত লেখা ({bookmarkedCount})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="গল্প বা কনফেশন খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-[#142230] placeholder:text-stone-400 focus:outline-none focus:border-[#80131E]"
              />
            </div>

            {/* FEATURE 3: Surprise Me / Random Story Button */}
            <button
              type="button"
              onClick={handleSurpriseRandomStory}
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#80131E]/50 text-xs sm:text-sm font-bold text-[#80131E] inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition shadow-2xs"
              title="যেকোনো একটি র‍্যান্ডম গল্প বা কনফেশন পড়ুন"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>যেকোনো একটি গল্প পড়ুন</span>
            </button>
          </div>
        </div>

        {/* Empty State when Saved Stories filter has 0 items */}
        {paginatedPosts.length === 0 && (
          <div className="rounded-3xl bg-white border border-stone-200 p-10 text-center space-y-2">
            <p className="text-sm font-extrabold text-[#142230]">
              {showSavedOnly
                ? "আপনার প্রিয় তালিকায় এখনো কোনো গল্প সংরক্ষণ করা হয়নি।"
                : "এই ক্যাটাগরিতে বা সার্চে কোনো লেখা পাওয়া যায়নি।"}
            </p>
            <p className="text-xs text-stone-500">
              {showSavedOnly
                ? "যেকোনো গল্পের কার্ডের কোণায় থাকা বুকমার্ক আইকনে ক্লিক করে পরে পড়ার জন্য সংরক্ষণ করতে পারবেন।"
                : "অন্য কোনো ক্যাটাগরি নির্বাচন করুন।"}
            </p>
          </div>
        )}

        {/* Stories, Confessions & Unspoken Letters Grid (Paginated) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPosts.map((post) => {
            const isLiked = Boolean(likedIds[post.id]);
            const isBookmarked = Boolean(bookmarkedIds[post.id]);
            const isUnspoken = post.category === "না বলা কথা";
            const isConfession = post.category === "ক্রাশ ও কনফেশন";
            const totalReaders = post.viewsCount || post.likesCount * 6;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group rounded-2xl border overflow-hidden flex flex-col justify-between transition shadow-xs hover:shadow-md ${
                  isUnspoken || isConfession
                    ? "bg-[#FAF4E6]/75 border-[#C59B27]/45 hover:border-[#80131E]/60"
                    : "bg-white border-stone-200/90 hover:border-[#80131E]/50"
                }`}
              >
                <div>
                  {/* ONLY render image if writer or admin actually added one */}
                  {post.imageUrl && (
                    <div className="w-full h-44 overflow-hidden bg-stone-100 border-b border-stone-200/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold ${
                            isUnspoken || isConfession
                              ? "bg-[#80131E] text-white"
                              : "bg-[#FAF4E6] text-[#80131E]"
                          }`}
                        >
                          {post.category}
                        </span>

                        {post.confessionIdBn && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-[#80131E] text-[11px] font-extrabold">
                            {post.confessionIdBn}
                          </span>
                        )}

                        {post.isAdminPost && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                            সম্পাদকের কলমে
                          </span>
                        )}

                        {post.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-stone-900 text-white text-[11px] font-bold inline-flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" />
                            <span>পিন করা</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTimeBn}
                        </span>

                        {/* FEATURE 1: Bookmark Icon on Story Card */}
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(e, post.id)}
                          title={
                            isBookmarked
                              ? "সংরক্ষিত তালিকা থেকে সরান"
                              : "পরে পড়ার জন্য সংরক্ষণ করুন"
                          }
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isBookmarked
                              ? "bg-[#80131E] border-[#80131E] text-white"
                              : "bg-white border-stone-200 text-stone-500 hover:text-[#80131E]"
                          }`}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isBookmarked ? "fill-white" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold text-[#142230] group-hover:text-[#80131E] transition leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                      “{post.excerpt}”
                    </p>

                    {post.adminNote && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#80131E] bg-[#FAF4E6] border border-[#C59B27]/40 px-2.5 py-0.5 rounded-lg">
                          <MessageSquareHeart className="w-3 h-3" />
                          <span>অনুভূতি টিমের পরামর্শ যুক্ত</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-stone-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-stone-700 truncate">
                      — {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 shrink-0">
                      <Calendar className="w-3 h-3 text-[#C59B27]" />
                      {post.dateBn}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleLike(e, post.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          isLiked
                            ? "bg-rose-100 text-[#80131E]"
                            : "bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-[#80131E]"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isLiked ? "fill-[#80131E] text-[#80131E]" : ""
                          }`}
                        />
                        <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
                      </button>

                      {/* FEATURE 5: Total Readers (Views Count) on Story Card */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                        <Eye className="w-3.5 h-3.5 text-stone-400" />
                        <span>{totalReaders.toLocaleString()} পাঠক</span>
                      </span>
                    </div>

                    <span className="text-xs text-[#80131E] font-bold inline-flex items-center gap-1">
                      পুরোটা পড়ুন <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {filteredPosts.length > 0 && (
          <div className="rounded-2xl bg-white border border-stone-200/90 px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <span className="text-xs text-stone-500 font-semibold">
              মোট <strong className="text-[#80131E]">{filteredPosts.length}টি</strong> লেখার মধ্যে পৃষ্ঠা{" "}
              <strong>{safePage}</strong> / <strong>{totalPages}</strong> দেখানো হচ্ছে
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              >
                « আগের পৃষ্ঠা
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      pageNum === safePage
                        ? "bg-[#80131E] text-white shadow-xs"
                        : "bg-stone-50 text-stone-700 border border-stone-200 hover:border-[#80131E]/40"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              >
                পরের পৃষ্ঠা »
              </button>
            </div>
          </div>
        )}

        {/* FEATURE 4: 1-Click Reader Poll ("পাঠক জরিপ / আজকের প্রশ্ন") */}
        <div className="rounded-3xl bg-white border border-stone-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#80131E]">
              <BarChart2 className="w-4 h-4" />
              <span>পাঠক জরিপ • আজকের প্রশ্ন</span>
            </div>
            <span className="text-xs text-stone-500 font-semibold">
              মোট মতামত দিয়েছেন: {totalPollVotes.toLocaleString()} জন পাঠক
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-[#142230]">
            {HOME_POLL_QUESTION}
          </h3>

          <div className="grid sm:grid-cols-3 gap-3">
            {pollOptions.map((opt) => {
              const percent =
                totalPollVotes > 0
                  ? Math.round((opt.votes / totalPollVotes) * 100)
                  : 0;
              const isChosen = selectedPollId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePollVote(opt.id)}
                  className={`relative overflow-hidden text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                    isChosen
                      ? "border-[#80131E] bg-[#FAF4E6]"
                      : "border-stone-200 bg-stone-50/70 hover:border-[#80131E]/50"
                  }`}
                >
                  {selectedPollId && (
                    <div
                      style={{ width: `${percent}%` }}
                      className="absolute inset-y-0 left-0 bg-[#80131E]/10 transition-all duration-500"
                    />
                  )}
                  <div className="relative flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#142230]">
                      {opt.label}
                    </span>
                    {selectedPollId && (
                      <span className="text-xs font-extrabold text-[#80131E] shrink-0">
                        {percent}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPollId && (
            <p className="text-xs text-emerald-700 font-semibold">
              আপনার মতামতের জন্য ধন্যবাদ! পাঠকদের সম্মিলিত ফলাফল ওপরে দেখানো হচ্ছে।
            </p>
          )}
        </div>

        {/* Minimal Book Banner */}
        <div className="rounded-2xl bg-[#FAF4E6] border border-[#C59B27]/45 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#80131E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>আমাদের প্রকাশিত ই-বুক</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#142230]">
              {BOOK_INFO.titleBn}: {BOOK_INFO.subtitleBn}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              ১০০+ পৃষ্ঠার প্রিমিয়াম গাইড • রেগুলার মূল্য{" "}
              <span className="line-through text-stone-400">
                ৳{BOOK_INFO.regularPriceBn}
              </span>{" "}
              •{" "}
              <strong>
                {BOOK_INFO.discountPercentBn}ে মাত্র ৳{BOOK_INFO.offerPriceBn}
              </strong>
            </p>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 hover:bg-[#630d16] transition"
          >
            <span>বইটি দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* STORY / CONFESSION SUBMISSION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#FAF4E6] px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#80131E]">
                  অনুভূতির চিঠির বাক্স
                </span>
                <h3 className="text-lg font-extrabold text-[#142230]">
                  আপনার গল্প, ক্রাশ কনফেশন বা না বলা কথা পাঠান
                </h3>
              </div>
              <button
                type="button"
                onClick={resetModal}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {submittedSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#142230]">
                    ধন্যবাদ! আপনার লেখাটি নিরাপদে জমা হয়েছে
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
                    অ্যাডমিন আপনার লেখাটি রিভিউ করে অনুমোদন দিলেই ওয়েবসাইটে প্রকাশিত হবে। আপনার ব্রাউজারে এটি স্বয়ংক্রিয়ভাবে সেভ হয়ে আছে।
                  </p>

                  {lastSubmittedTrackingId && (
                    <div className="rounded-2xl bg-[#FAF4E6] border border-[#C59B27]/50 p-3.5 max-w-xs mx-auto space-y-1">
                      <span className="text-[11px] font-bold text-stone-500 block">
                        আপনার লেখার গোপন ট্র্যাকিং কোড:
                      </span>
                      <code className="text-base font-extrabold text-[#80131E] block">
                        #{lastSubmittedTrackingId}
                      </code>
                      <span className="text-[11px] text-stone-500 block">
                        অন্য যেকোনো ডিভাইস থেকেও এই কোড দিয়ে লেখার অবস্থা ও টিমের উত্তর দেখতে পারবেন।
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetModal();
                        openTrackerModal();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#FAF4E6] border border-[#C59B27]/50 text-[#80131E] font-bold text-xs sm:text-sm cursor-pointer"
                    >
                      আমার লেখা ট্র্যাক করুন
                    </button>
                    <button
                      type="button"
                      onClick={resetModal}
                      className="px-6 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm cursor-pointer"
                    >
                      ঠিক আছে
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleStorySubmit} className="space-y-4">
                  {/* Hidden Honeypot Input for Anti-Bot Protection */}
                  <input
                    type="text"
                    name="website_url"
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="hidden"
                  />

                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Anonymous Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#142230]">
                      {isAnonymous ? (
                        <EyeOff className="w-4 h-4 text-[#80131E]" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>
                        {isAnonymous
                          ? "নাম গোপন থাকবে (নাম প্রকাশে অনিচ্ছুক)"
                          : "নিজের বা ছদ্মনামে প্রকাশ করুন"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous((prev) => !prev)}
                      className="text-xs font-bold text-[#80131E] underline cursor-pointer"
                    >
                      {isAnonymous ? "নাম দিতে চাই" : "নাম গোপন রাখুন"}
                    </button>
                  </div>

                  {!isAnonymous && (
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        আপনার নাম ও শহর
                      </label>
                      <input
                        type="text"
                        required={!isAnonymous}
                        maxLength={80}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="যেমন: নীলাঞ্জনা, ঢাকা"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      লেখার ধরন নির্বাচন করুন
                    </label>
                    <select
                      value={storyCategory}
                      onChange={(e) =>
                        setStoryCategory(e.target.value as StoryCategory)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
                    >
                      <option value="ক্রাশ ও কনফেশন">ক্রাশ ও কনফেশন</option>
                      <option value="না বলা কথা">না বলা কথা</option>
                      <option value="রোমান্টিক গল্প">রোমান্টিক গল্প</option>
                      <option value="জীবনের গল্প">জীবনের গল্প</option>
                      <option value="বিচ্ছেদ ও প্রাক্তন">বিচ্ছেদ ও প্রাক্তন</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={180}
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      placeholder="আপনার গল্প বা কনফেশনের একটি সুন্দর শিরোনাম দিন"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      আপনার মূল গল্প / কনফেশন *
                    </label>
                    <textarea
                      rows={5}
                      required
                      maxLength={8000}
                      value={storyBody}
                      onChange={(e) => setStoryBody(e.target.value)}
                      placeholder="এখানে আপনার মনের কথা, ক্রাশ কনফেশন বা গল্পটি বিস্তারিত লিখুন..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
                    />
                  </div>

                  {/* Optional Image Upload: Only added if writer chooses to! */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-700">
                      ছবি যুক্ত করুন (ঐচ্ছিক — না দিলেও কোনো সমস্যা নেই)
                    </label>

                    {!storyImageDataUrl ? (
                      <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-600 cursor-pointer transition">
                        <ImagePlus className="w-4 h-4 text-[#80131E]" />
                        <span>চাইলে একটি ছবি যোগ করুন (JPG/PNG/WEBP, সর্বোচ্চ 2MB)</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleWriterImageChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50 p-2 flex items-center justify-between gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={storyImageDataUrl}
                          alt="Preview"
                          className="h-16 w-24 object-cover rounded-lg border border-stone-200"
                        />
                        <span className="text-xs font-bold text-emerald-700 flex-1">
                          ছবি যুক্ত হয়েছে
                        </span>
                        <button
                          type="button"
                          onClick={() => setStoryImageDataUrl(undefined)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold inline-flex items-center gap-1 hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ছবি বাদ দিন</span>
                        </button>
                      </div>
                    )}

                    {imageError && (
                      <p className="text-xs text-rose-600 font-semibold">
                        {imageError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      স্প্যাম ও হ্যাকার প্রতিরোধে স্বয়ংক্রিয় Rate-Limit ও সিকিউরিটি ফিল্টার সক্রিয়।
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#80131E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#630d16] disabled:opacity-60 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting ? "পাঠানো হচ্ছে..." : "লেখাটি পাঠিয়ে দিন"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MY SUBMISSIONS & LIVE STATUS TRACKER MODAL (NO LOGIN REQUIRED) */}
      {isTrackerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#FAF4E6] px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#80131E]">
                  অ্যাকাউন্ট ছাড়াই লাইভ ট্র্যাকার
                </span>
                <h3 className="text-lg font-extrabold text-[#142230]">
                  আমার পাঠানো লেখা ও অনুভূতি টিমের উত্তর
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackerModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Manual Tracking Code Lookup (For Any Device) */}
              <form
                onSubmit={handleManualTrackSearch}
                className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5 space-y-2"
              >
                <label className="block text-xs font-bold text-stone-700">
                  ট্র্যাকিং কোড দিয়ে লেখার অবস্থা জানুন (অন্য ফোন বা ব্রাউজার থেকেও)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualTrackCode}
                    onChange={(e) => setManualTrackCode(e.target.value)}
                    placeholder="যেমন: #p-101 বা 3"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#80131E]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#80131E] text-white text-xs font-bold cursor-pointer hover:bg-[#630d16] shrink-0"
                  >
                    খুঁজুন
                  </button>
                </div>

                {manualTrackError && (
                  <p className="text-xs text-rose-600 font-semibold">
                    {manualTrackError}
                  </p>
                )}

                {manualTrackedResult && (
                  <div className="mt-2 rounded-xl bg-white border border-[#C59B27]/50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#80131E]">
                        কোড: #{manualTrackedResult.id} •{" "}
                        {manualTrackedResult.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                          manualTrackedResult.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {manualTrackedResult.status === "pending"
                          ? "অপেক্ষমাণ (রিভিউ চলছে)"
                          : "প্রকাশিত হয়েছে"}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[#142230]">
                      {manualTrackedResult.title}
                    </h4>
                    {manualTrackedResult.adminNote && (
                      <div className="rounded-lg bg-[#FAF4E6] border border-[#C59B27]/40 p-2.5 text-xs text-stone-700">
                        <strong className="text-[#80131E] block mb-0.5">
                          অনুভূতি টিমের পরামর্শ:
                        </strong>
                        {manualTrackedResult.adminNote}
                      </div>
                    )}
                    {manualTrackedResult.status !== "pending" &&
                      manualTrackedResult.slug && (
                        <Link
                          href={`/blog/${manualTrackedResult.slug}`}
                          onClick={() => setIsTrackerModalOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#80131E] hover:underline"
                        >
                          <span>প্রকাশিত লেখাটি পড়ুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                  </div>
                )}
              </form>

              {/* Automatically Saved Submissions in This Browser */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
                  এই ব্রাউজার থেকে আপনার পাঠানো লেখা ({mySubmittedIds.length})
                </h4>

                {mySubmittedIds.length === 0 ? (
                  <div className="rounded-2xl bg-[#FDF8F2] border border-stone-200 p-6 text-center space-y-2">
                    <p className="text-xs sm:text-sm font-bold text-stone-700">
                      আপনি এখনো এই ব্রাউজার থেকে কোনো গল্প বা কনফেশন পাঠাননি।
                    </p>
                    <p className="text-xs text-stone-500">
                      গল্প পাঠালে কোনো লগইন ছাড়াই এখানে স্বয়ংক্রিয়ভাবে ট্র্যাক করতে পারবেন।
                    </p>
                  </div>
                ) : (
                  mySubmittedIds.map((sub) => {
                    const liveItem =
                      trackedStoriesMap[sub.id] ||
                      posts.find((p) => p.id === sub.id);
                    const isPublished =
                      Boolean(posts.find((p) => p.id === sub.id)) ||
                      (liveItem && liveItem.status === "published");

                    return (
                      <div
                        key={sub.id}
                        className="rounded-2xl bg-[#FDF8F2] border border-stone-200 p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#80131E]">
                            কোড: #{sub.id} • {sub.category}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              isPublished
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {isPublished
                              ? "প্রকাশিত হয়েছে"
                              : "অপেক্ষমাণ (রিভিউ চলছে)"}
                          </span>
                        </div>

                        <h5 className="text-sm font-extrabold text-[#142230]">
                          {liveItem?.title || sub.title}
                        </h5>

                        {liveItem?.adminNote && (
                          <div className="rounded-xl bg-[#FAF4E6] border border-[#C59B27]/45 p-3 text-xs text-stone-700">
                            <strong className="text-[#80131E] block mb-0.5">
                              অনুভূতি টিমের পরামর্শ:
                            </strong>
                            {liveItem.adminNote}
                          </div>
                        )}

                        {isPublished && liveItem?.slug && (
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="text-stone-500 font-semibold">
                              পছন্দ: {liveItem.likesCount || 1} • পাঠক:{" "}
                              {(liveItem.viewsCount || 12).toLocaleString()}
                            </span>
                            <Link
                              href={`/blog/${liveItem.slug}`}
                              onClick={() => setIsTrackerModalOpen(false)}
                              className="inline-flex items-center gap-1 font-extrabold text-[#80131E] hover:underline"
                            >
                              <span>লেখাটি দেখুন</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-9 w-auto object-contain mix-blend-multiply"
            />
            <span>© ২০২৬ অনুভূতি (Onuvuti.site)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="hover:text-[#80131E] font-semibold cursor-pointer"
            >
              গল্প / কনফেশন পাঠান
            </button>
            <Link
              href="/sporsher-byakoron"
              className="text-[#80131E] font-bold hover:underline"
            >
              স্পর্শের ব্যাকরণ ই-বুক
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
