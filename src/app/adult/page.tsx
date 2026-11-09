"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldAlert,
  Lock,
  Play,
  Film,
  BookOpen,
  Heart,
  Share2,
  X,
  Clock,
  ArrowLeft,
  Eye,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";
import {
  AdultVideo,
  AdultStory,
  INITIAL_ADULT_STORIES,
} from "@/data/adultContent";

export default function AdultPage() {
  const router = useRouter();
  // Age Verification Gate State
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "videos" | "stories">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [catalogVideos, setCatalogVideos] = useState<AdultVideo[]>([]);

  // Active Media Modals
  const [activeVideo, setActiveVideo] = useState<AdultVideo | null>(null);
  const [activeStory, setActiveStory] = useState<AdultStory | null>(null);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  // Likes Tracking (stored in state & local storage)
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

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
      setCatalogLoading(true);
      setCatalogError("");
      try {
        const params = new URLSearchParams({ per_page: "24", page: "1", sort: "newest" });
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        const response = await fetch(`/api/v1/adult/videos?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("catalogue unavailable");
        const payload = await response.json();
        const results = Array.isArray(payload?.results) ? payload.results : [];
        const videos: AdultVideo[] = results
          .filter((item: Record<string, unknown>) => item && (typeof item.id === "number" || typeof item.id === "string"))
          .map((item: Record<string, unknown>) => {
            const id = String(item.id);
            const tags = Array.isArray(item.tags)
              ? item.tags.map((tag: unknown) => typeof tag === "string" ? tag : String((tag as { name?: unknown })?.name ?? "")).filter(Boolean)
              : [];
            const categories = Array.isArray(item.categories) ? item.categories : [];
            const category = typeof item.category === "string"
              ? item.category
              : String((categories[0] as { name?: unknown } | undefined)?.name ?? categories[0] ?? "ভিডিও");
            return {
              id, title: String(item.title ?? "শিরোনাম নেই"), description: String(item.description ?? ""),
              duration: String(item.duration ?? "সময় অজানা"), category,
              views: Number(item.views ?? item.view_count ?? 0), likes: Number(item.likes ?? item.like_count ?? 0),
              embedUrl: `https://adultembed.com/player/embed/${encodeURIComponent(id)}/`,
              thumbnailUrl: typeof item.thumbnail === "string" ? item.thumbnail : undefined,
              tags, createdAt: String(item.published_at ?? ""),
            };
          });
        setCatalogVideos(videos);
      } catch {
        if (!controller.signal.aborted) setCatalogError("ভিডিও তালিকা লোড করা যায়নি। পরে আবার চেষ্টা করুন।");
      } finally {
        if (!controller.signal.aborted) setCatalogLoading(false);
      }
    }, searchQuery ? 300 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isVerified, searchQuery]);

  const handleVerifyAge = () => {
    try {
      localStorage.setItem("onuvuti_adult_verified", "true");
    } catch {}
    setIsVerified(true);
  };

  const handleDeclineAge = () => {
    try {
      localStorage.removeItem("onuvuti_adult_verified");
    } catch {}
    router.push("/");
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPageLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Filter Videos & Stories
  const filteredVideos = catalogVideos.filter((v) => {
    if (activeTab === "stories") return false;
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const filteredStories = INITIAL_ADULT_STORIES.filter((s) => {
    if (activeTab === "videos") return false;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // 1. AGE VERIFICATION GATE MODAL
  if (isVerified === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A0F]/95 backdrop-blur-xl p-4 sm:p-6 text-center">
        <div className="max-w-md w-full bg-[#111622] border-2 border-[#80131E]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#80131E]/15 border border-[#80131E]/40 flex items-center justify-center mx-auto text-[#80131E]">
            <ShieldAlert className="w-9 h-9 text-rose-500" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 text-[11px] font-extrabold uppercase tracking-widest inline-block">
              ১৮+ বয়স যাচাইকরণ
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              প্রাপ্তবয়স্কদের জন্য সংরক্ষিত এলাকা
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              এই সেকশনটিতে শুধুমাত্র ১৮ বছর বা তদূর্ধ্ব প্রাপ্তবয়স্ক পাঠকদের জন্য নির্ধারিত অন্তরঙ্গ মনস্তত্ত্ব, বিশেষ ভিজ্যুয়াল ও গভীর অনুভূতির কনটেন্ট রয়েছে।
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#161D2B] border border-stone-800 text-xs text-stone-300 text-left space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-400">
              <Lock className="w-4 h-4" />
              <span>গোপনীয়তার নিশ্চয়তা:</span>
            </div>
            <p className="text-[11px] text-stone-400">
              আপনার পরিচয় ও ব্রাউজিং তথ্য সম্পূর্ণ ব্যক্তিগত ও সুরক্ষিত। এটি মূল ওয়েবসাইটের সাথে যুক্ত নয়।
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleVerifyAge}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#80131E] hover:bg-[#680f18] text-white font-black text-sm shadow-lg shadow-[#80131E]/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>আমার বয়স ১৮ বা তদূর্ধ্ব — প্রবেশ করুন</span>
            </button>

            <button
              type="button"
              onClick={handleDeclineAge}
              className="w-full py-3 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>আমি ১৮ বছরের নিচে — মূল সাইটে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while checking localStorage
  if (isVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-stone-100 flex flex-col">
      {/* Top Navigation Bar (Isolated / Independent) */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-stone-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#80131E] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg text-white tracking-wide">
                  অনুভূতি ১৮+
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800 text-rose-400 text-[10px] font-bold">
                  হিডেন কর্নার
                </span>
              </div>
              <p className="text-[10px] text-stone-400 hidden sm:block">
                অন্তরঙ্গ মনস্তত্ত্ব ও বিশেষ ভিজ্যুয়াল সাহিত্য
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyPageLink}
              className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="এই পেইজের গোপন লিংক কপি করুন"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {copiedLink ? "লিংক কপি হয়েছে!" : "লিংক কপি"}
              </span>
            </button>

            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল সাইট</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Discreet Notice & Filter Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#151B28] to-[#120F16] border border-stone-800 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>ব্যক্তিগত সংরক্ষিত কর্নার • কোনো পাবলিক ট্র্যাক নেই</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              অন্তরঙ্গ মনস্তত্ত্ব, বিশেষ ভিজ্যুয়াল ও গভীর অনুভূতির গল্প
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              এখানে নিয়মিতভাবে প্রাপ্তবয়স্ক গল্প, মনস্তাত্ত্বিক অনুচ্ছেদ এবং বিশেষ ভিডিও কনটেন্ট যুক্ত করা হয়। নিচের ট্যাবগুলো থেকে পছন্দসই মাধ্যম বেছে নিন।
            </p>
          </div>

          {/* Search & Tabs */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0B0F17] border border-stone-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "all"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <span>সবগুলো ({catalogVideos.length + INITIAL_ADULT_STORIES.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("videos")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "videos"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>ভিডিও ({catalogVideos.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stories")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "stories"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>গল্প ({INITIAL_ADULT_STORIES.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="গল্প বা ভিডিও খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F17] border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-rose-700 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 1: VIDEOS GALLERY */}
        {(activeTab === "all" || activeTab === "videos") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">ভিডিও গ্যালারি</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold">
                  {filteredVideos.length}টি কনটেন্ট
                </span>
              </div>
            </div>

            {catalogLoading && <p className="text-sm text-stone-400">ভিডিও লোড হচ্ছে…</p>}
            {catalogError && <p role="status" className="text-sm text-rose-300">{catalogError}</p>}
            {!catalogLoading && !catalogError && filteredVideos.length === 0 && <p className="text-sm text-stone-400">কোনো ভিডিও পাওয়া যায়নি।</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVideos.map((video) => {
                const isLiked = likedIds[video.id];
                return (
                  <div
                    key={video.id}
                    className="group rounded-2xl bg-[#121722] border border-stone-800/90 overflow-hidden hover:border-rose-900/60 transition shadow-lg flex flex-col"
                  >
                    {/* Thumbnail & Play Action */}
                    <div
                      onClick={() => setActiveVideo(video)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setActiveVideo(video); }}
                      className="relative aspect-video bg-gradient-to-tr from-stone-900 via-rose-950/20 to-stone-900 flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      {video.thumbnailUrl && <Image src={video.thumbnailUrl} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover opacity-80 transition group-hover:scale-[1.02]" />}
                      {/* Play Button Overlay */}
                      <div className="w-14 h-14 rounded-full bg-[#80131E]/90 group-hover:bg-[#80131E] group-hover:scale-110 text-white flex items-center justify-center transition shadow-xl z-10">
                        <Play className="w-6 h-6 ml-0.5" />
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-stone-200 text-[10px] font-mono font-bold flex items-center gap-1 z-10">
                        <Clock className="w-3 h-3" />
                        <span>{video.duration}</span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-800/60 text-rose-300 text-[10px] font-bold z-10">
                        {video.category}
                      </div>
                    </div>

                    {/* Meta & Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h4
                          onClick={() => setActiveVideo(video)}
                          className="text-sm font-bold text-white hover:text-rose-400 transition cursor-pointer line-clamp-2"
                        >
                          {video.title}
                        </h4>
                        <p className="text-xs text-stone-400 line-clamp-2">
                          {video.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{video.views}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleLike(video.id)}
                            className={`flex items-center gap-1 transition cursor-pointer ${
                              isLiked ? "text-rose-400 font-bold" : "hover:text-stone-200"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500" : ""}`} />
                            <span>{video.likes + (isLiked ? 1 : 0)}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveVideo(video)}
                          className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          দেখুন
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 2: ADULT STORIES / CHOTI / CONFESSIONS */}
        {(activeTab === "all" || activeTab === "stories") && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">গল্প ও অন্তরঙ্গ আখ্যান</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold">
                  {filteredStories.length}টি গল্প
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStories.map((story) => {
                const isLiked = likedIds[story.id];
                return (
                  <div
                    key={story.id}
                    className="rounded-2xl bg-[#121722] border border-stone-800/90 p-5 hover:border-rose-900/60 transition shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-300 text-[10px] font-bold">
                          {story.category}
                        </span>
                        <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{story.readTime}</span>
                        </span>
                      </div>

                      <h4
                        onClick={() => setActiveStory(story)}
                        className="text-base font-bold text-white hover:text-rose-400 transition cursor-pointer"
                      >
                        {story.title}
                      </h4>

                      <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                        {story.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                      <span className="text-[11px] text-stone-500">
                        লেখক: {story.author}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleLike(story.id)}
                          className={`p-1.5 rounded-lg hover:bg-stone-800 transition cursor-pointer ${
                            isLiked ? "text-rose-400" : "text-stone-400"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveStory(story)}
                          className="px-3 py-1 rounded-xl bg-stone-800 hover:bg-[#80131E] hover:text-white text-stone-300 text-xs font-bold transition cursor-pointer"
                        >
                          সম্পূর্ণ পড়ুন
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Content Management Note (Helper for Admin/User) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111622] border border-stone-800 text-xs text-stone-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-stone-200 block">
              কনটেন্ট যুক্ত বা এডিট করবেন কীভাবে?
            </span>
            <p className="text-[11px] text-stone-400">
              আপনি আপনার নিজস্ব ভিডিও বা গল্পের লেখা সরাসরি <code className="text-rose-400 bg-black/40 px-1 py-0.5 rounded">src/data/adultContent.ts</code> ফাইলে যুক্ত করতে পারেন।
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-rose-400 hover:underline font-bold shrink-0 cursor-pointer"
          >
            মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </main>

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6">
          <div className="max-w-3xl w-full bg-[#111622] border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-[#0B0F17]">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {activeVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activeVideo.videoUrl ? (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : activeVideo.embedUrl ? (
                <iframe
                  src={activeVideo.embedUrl}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="p-8 text-center space-y-2 max-w-md">
                  <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-400">
                    <Film className="w-6 h-6 text-rose-500" />
                  </div>
                  <h5 className="text-sm font-bold text-white">
                    ভিডিও ফাইল প্রস্তুত হচ্ছে
                  </h5>
                  <p className="text-xs text-stone-400">
                    এই ভিডিওটির ডিরেক্ট লিংক এখনও যুক্ত করা হয়নি। <code className="text-rose-400">src/data/adultContent.ts</code> ফাইলে আপনার ভিডিওর URL বা Embed লিংক বসালেই এখানে প্লে হবে।
                  </p>
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="p-5 space-y-2 bg-[#111622] overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 font-bold">
                  {activeVideo.category}
                </span>
                <span className="font-mono">{activeVideo.duration}</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {activeVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STORY READER MODAL */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6">
          <div className="max-w-2xl w-full bg-[#111622] border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
            {/* Header with Font Controls */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-[#0B0F17]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-stone-300">
                  {activeStory.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Font Size Selector */}
                <div className="flex items-center rounded-xl bg-stone-900 border border-stone-800 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFontSize("sm")}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      fontSize === "sm" ? "bg-rose-950 text-rose-300" : "text-stone-400"
                    }`}
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("base")}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      fontSize === "base" ? "bg-rose-950 text-rose-300" : "text-stone-400"
                    }`}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("lg")}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      fontSize === "lg" ? "bg-rose-950 text-rose-300" : "text-stone-400"
                    }`}
                  >
                    A+
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStory(null)}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Story Content Reader */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 bg-[#111622]">
              <div className="space-y-1 pb-3 border-b border-stone-800/80">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeStory.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>লেখক: {activeStory.author}</span>
                  <span>•</span>
                  <span>{activeStory.readTime}</span>
                </div>
              </div>

              <div
                className={`space-y-4 text-stone-200 leading-relaxed font-serif ${
                  fontSize === "sm"
                    ? "text-xs sm:text-sm"
                    : fontSize === "lg"
                    ? "text-base sm:text-lg"
                    : "text-sm sm:text-base"
                }`}
              >
                {activeStory.content.map((paragraph, idx) => (
                  <p key={idx} className="indent-4 text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-stone-800 bg-[#0B0F17] flex items-center justify-between text-xs text-stone-400">
              <button
                type="button"
                onClick={() => toggleLike(activeStory.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-rose-400 font-bold transition cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${likedIds[activeStory.id] ? "fill-rose-500" : ""}`} />
                <span>পছন্দ হয়েছে ({activeStory.likes + (likedIds[activeStory.id] ? 1 : 0)})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
