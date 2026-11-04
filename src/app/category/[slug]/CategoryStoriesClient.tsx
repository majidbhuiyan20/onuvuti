"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Search,
  Clock,
  Calendar,
  Heart,
  Eye,
  MessageCircle,
  Share2,
  ChevronRight,
  PenLine,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bookmark,
} from "lucide-react";
import { CategoryInfo, CATEGORIES_DATA } from "@/data/categoryData";
import { BlogPost, StoryCategory } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import { GO_API_BASE_URL, AppUser } from "@/lib/goApi";
import { validateImageUpload } from "@/lib/security";
import ThemeToggle from "@/components/ThemeToggle";
import SubmitStoryModal from "@/components/modals/SubmitStoryModal";

interface Props {
  category: CategoryInfo;
}

export default function CategoryStoriesClient({ category }: Props) {
  const [stories, setStories] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "views">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Submit modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [storyCategory, setStoryCategory] = useState<StoryCategory>(category.nameBn);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [storyImageDataUrl, setStoryImageDataUrl] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [lastSubmittedTrackingId, setLastSubmittedTrackingId] = useState<string | null>(null);

  // Bookmarks & Likes
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const savedLikes = JSON.parse(localStorage.getItem("onuvuti_liked_stories") || "{}");
      setLikedIds(savedLikes);
      const savedBookmarks = JSON.parse(localStorage.getItem("onuvuti_saved_bookmarks") || "{}");
      setBookmarkedIds(savedBookmarks);
      const storedUser = localStorage.getItem("onuvuti_user_profile");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("onuvuti_saved_bookmarks", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const toggleLike = async (story: BlogPost, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyLiked = Boolean(likedIds[story.id]);
    const nextState = !isCurrentlyLiked;

    setLikedIds((prev) => {
      const updated = { ...prev, [story.id]: nextState };
      try {
        localStorage.setItem("onuvuti_liked_stories", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setStories((prev) =>
      prev.map((s) =>
        s.id === story.id
          ? { ...s, likesCount: Math.max(0, s.likesCount + (nextState ? 1 : -1)) }
          : s
      )
    );

    try {
      await fetch(`${GO_API_BASE_URL}/stories/${encodeURIComponent(story.id)}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "love" }),
      });
    } catch {
      // silent
    }
  };

  // Fetch stories from Go backend for this specific category
  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/stories?category=${encodeURIComponent(category.nameBn)}&limit=50`
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.stories)) {
          setStories(data.stories);
        } else {
          setStories([]);
        }
      }
    } catch (err) {
      console.warn("Failed to load category stories:", err);
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [category.nameBn]);

  useEffect(() => {
    loadStories();
    setStoryCategory(category.nameBn);
  }, [loadStories, category.nameBn]);

  // Filter and sort
  const filteredStories = useMemo(() => {
    let result = stories.slice();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.excerpt.toLowerCase().includes(q) ||
          (s.author && s.author.toLowerCase().includes(q))
      );
    }

    if (sortBy === "popular") {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortBy === "views") {
      result.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    return result;
  }, [stories, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredStories.length / ITEMS_PER_PAGE) || 1;
  const paginatedStories = filteredStories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

    const effectiveAuthor = isAnonymous
      ? "নাম প্রকাশে অনিচ্ছুক"
      : senderName.trim() || currentUser?.name || "লেখক";

    const payload = {
      title: storyTitle,
      content: storyBody,
      category: storyCategory,
      author: effectiveAuthor,
      isAnonymous,
      imageUrl: storyImageDataUrl,
      websiteUrl,
      userId: currentUser?.id || "",
    };

    try {
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setSubmitError(
          data.error || "আপনার লেখাটি পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
        );
        setIsSubmitting(false);
        return;
      }

      setSubmittedSuccess(true);
      setLastSubmittedTrackingId(data.trackingId || data.story?.id || "SUBMITTED");
      setStoryTitle("");
      setStoryBody("");
      setStoryImageDataUrl(undefined);
      setIsSubmitting(false);
    } catch {
      setSubmitError("সার্ভার সংযোগে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।");
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsSubmitModalOpen(false);
    setSubmittedSuccess(false);
    setSubmitError(null);
    setImageError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] text-[#142230] dark:text-white transition-colors selection:bg-[#7E151E] selection:text-white pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF7F2]/95 dark:bg-[#0B0F17]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-[#7E151E] dark:hover:text-rose-400 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেইজ</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-400">
              <ChevronRight className="w-3.5 h-3.5" />
              <span>বিষয়ভিত্তিক গল্প</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#7E151E] dark:text-rose-400 font-bold">
                {category.nameBn}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setStoryCategory(category.nameBn);
                setSubmittedSuccess(false);
                setSubmitError(null);
                setIsSubmitModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>গল্প লিখুন</span>
            </button>
            <Link
              href="/tips"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
            >
              <span>🌿 ওয়েলনেস টিপস</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Dedicated Category Hero Banner */}
      <section className="relative overflow-hidden pt-10 pb-10 sm:pt-14 sm:pb-12 border-b border-stone-200/70 dark:border-stone-800/80 bg-gradient-to-b from-[#FAF4E6]/80 via-[#FAF7F2] to-[#FAF7F2] dark:from-[#151D2D]/60 dark:via-[#0B0F17] dark:to-[#0B0F17]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs text-xs font-extrabold">
            <span className="text-base">{category.icon}</span>
            <span className="text-[#7E151E] dark:text-rose-400">{category.badgeBn}</span>
            <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="text-stone-500 font-medium">
              মোট {stories.length}টি প্রকাশনা
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#142230] dark:text-white tracking-tight">
            {category.nameBn}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium max-w-2xl mx-auto leading-relaxed">
            {category.descriptionBn}
          </p>

          {/* Action CTAs & Search */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`${category.nameBn}-এর গল্পগুলো খুঁজুন...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-[#142230] dark:text-white placeholder-stone-400 focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-400 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStoryCategory(category.nameBn);
                setSubmittedSuccess(false);
                setSubmitError(null);
                setIsSubmitModalOpen(true);
              }}
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-2xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#7E151E]/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>আপনার গল্প লিখুন</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Layout: Stories Feed & Sidebar */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-200/70 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <span>সর্টিং:</span>
            <div className="inline-flex rounded-xl bg-white dark:bg-stone-900 p-1 border border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setSortBy("latest")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sortBy === "latest"
                    ? "bg-[#7E151E] text-white"
                    : "text-stone-600 dark:text-stone-300 hover:text-[#7E151E]"
                }`}
              >
                সবচেয়ে নতুন
              </button>
              <button
                type="button"
                onClick={() => setSortBy("popular")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sortBy === "popular"
                    ? "bg-[#7E151E] text-white"
                    : "text-stone-600 dark:text-stone-300 hover:text-[#7E151E]"
                }`}
              >
                জনপ্রিয়
              </button>
              <button
                type="button"
                onClick={() => setSortBy("views")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  sortBy === "views"
                    ? "bg-[#7E151E] text-white"
                    : "text-stone-600 dark:text-stone-300 hover:text-[#7E151E]"
                }`}
              >
                বেশি পঠিত
              </button>
            </div>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            দেখাচ্ছে: {paginatedStories.length} / {filteredStories.length}টি গল্প
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Stories Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
                <Loader2 className="w-8 h-8 text-[#7E151E] animate-spin mx-auto" />
                <p className="text-xs text-stone-500">
                  {category.nameBn}-এর গল্পগুলো লোড করা হচ্ছে...
                </p>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-2xl">
                  {category.icon}
                </div>
                <h3 className="text-base font-bold text-stone-700 dark:text-stone-200">
                  {searchQuery ? "কোনো গল্প পাওয়া যায়নি" : `এখনও কোনো গল্প প্রকাশিত হয়নি`}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {searchQuery
                    ? "ভিন্ন কোনো কিওয়ার্ড দিয়ে সার্চ করুন।"
                    : `এই ক্যাটাগরিতে প্রথম গল্পটি হতে পারে আপনারই! আপনার জীবনের গল্প বা অভিজ্ঞতা নিঃসংকোচে শেয়ার করুন।`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStoryCategory(category.nameBn);
                    setSubmittedSuccess(false);
                    setSubmitError(null);
                    setIsSubmitModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <PenLine className="w-4 h-4" />
                  <span>প্রথম গল্পটি লিখুন</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {paginatedStories.map((post) => {
                  const isLiked = Boolean(likedIds[post.id]);
                  const isSaved = Boolean(bookmarkedIds[post.id]);

                  return (
                    <article
                      key={post.id}
                      className="group flex flex-col justify-between rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800/90 hover:border-[#7E151E]/40 dark:hover:border-rose-900/60 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Optional Image Header */}
                      {post.imageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          {/* Metadata row */}
                          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                            <span className="font-medium text-[#7E151E] dark:text-rose-400">
                              {post.author || "নাম প্রকাশে অনিচ্ছুক"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{post.readTimeBn}</span>
                            </span>
                          </div>

                          {/* Title */}
                          <Link href={`/blog/${post.slug}`}>
                            <h3 className="text-base sm:text-lg font-black text-[#142230] dark:text-white group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition leading-snug line-clamp-2">
                              {post.title}
                            </h3>
                          </Link>

                          {/* Excerpt */}
                          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-500">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => toggleLike(post, e)}
                              className={`flex items-center gap-1 transition cursor-pointer ${
                                isLiked
                                  ? "text-rose-600 font-bold"
                                  : "hover:text-rose-600"
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isLiked ? "fill-current text-rose-600" : ""
                                }`}
                              />
                              <span>{post.likesCount || 0}</span>
                            </button>

                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-stone-400" />
                              <span>{post.viewsCount || 1}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => toggleBookmark(post.id, e)}
                              title={isSaved ? "বুকমার্ক সরানো" : "পরে পড়ার জন্য রাখুন"}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isSaved
                                  ? "text-[#7E151E] bg-rose-50 dark:bg-rose-950/40"
                                  : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                              }`}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${
                                  isSaved ? "fill-current text-[#7E151E]" : ""
                                }`}
                              />
                            </button>

                            <Link
                              href={`/blog/${post.slug}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7E151E] dark:text-rose-400 hover:underline pl-2"
                            >
                              <span>পড়ুন</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  পূর্ববর্তী
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      currentPage === idx + 1
                        ? "bg-[#7E151E] text-white"
                        : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  পরবর্তী
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Book Promo Box */}
            <div className="rounded-3xl bg-gradient-to-br from-[#FAF4E6] to-[#F5ECE0] dark:from-[#161E2E] dark:to-[#0F1622] border border-[#C59B27]/40 dark:border-stone-700 p-6 space-y-4 shadow-sm">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#7E151E]/10 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                বেস্টসেলার ই-বুক
              </span>
              <h4 className="text-lg font-black text-[#142230] dark:text-white leading-snug">
                {BOOK_INFO.titleBn}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                {BOOK_INFO.subtitleBn}। ১৮টি অধ্যায় ও ৪টি মনস্তাত্ত্বিক পরিশিষ্ট নিয়ে এক পূর্ণাঙ্গ মাস্টারক্লাস।
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-stone-400 line-through">
                  ৳{BOOK_INFO.regularPriceBn}
                </span>
                <span className="text-xl font-black text-[#7E151E] dark:text-rose-400">
                  ৳{BOOK_INFO.offerPriceBn}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {BOOK_INFO.discountPercentBn}
                </span>
              </div>
              <Link
                href="/sporsher-byakoron"
                className="w-full py-3 px-4 rounded-2xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#7E151E]/20 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>বইটি সংগ্রহ করুন</span>
              </Link>
            </div>

            {/* Wellness Tips Promo Card */}
            <div className="rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  দৈনিক মন ও সম্পর্কের যত্ন
                </h4>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                অতিরিক্ত চিন্তা, ঘুমের সমস্যা বা সম্পর্কের দূরত্ব দূর করতে বৈজ্ঞানিক হেলথ গাইডগুলো পড়ুন।
              </p>
              <Link
                href="/tips"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                <span>সকল ওয়েলনেস টিপস দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Other Categories Links */}
            <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                অন্যান্য বিষয়ভিত্তিক ক্যাটাগরি
              </h4>
              <div className="space-y-1">
                {CATEGORIES_DATA.filter((c) => c.slug !== category.slug).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] hover:text-[#7E151E] dark:hover:text-rose-300 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span>{c.nameBn}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Story Submission Modal */}
      <SubmitStoryModal
        isOpen={isSubmitModalOpen}
        onClose={resetModal}
        currentUser={currentUser}
        senderName={senderName}
        setSenderName={setSenderName}
        isAnonymous={isAnonymous}
        setIsAnonymous={setIsAnonymous}
        storyCategory={storyCategory}
        setStoryCategory={setStoryCategory}
        storyTitle={storyTitle}
        setStoryTitle={setStoryTitle}
        storyBody={storyBody}
        setStoryBody={setStoryBody}
        storyImageDataUrl={storyImageDataUrl}
        setStoryImageDataUrl={setStoryImageDataUrl}
        imageError={imageError}
        websiteUrl={websiteUrl}
        setWebsiteUrl={setWebsiteUrl}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submittedSuccess={submittedSuccess}
        lastSubmittedTrackingId={lastSubmittedTrackingId}
        onSubmit={handleStorySubmit}
        onOpenTracker={() => {}}
        onOpenAuth={() => {}}
        onOpenProfile={() => {}}
        onImageChange={handleWriterImageChange}
      />
    </div>
  );
}
