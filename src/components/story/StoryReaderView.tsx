"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Minimize2,
  Share2,
  Check,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import StoryInteractions, { CommentItem } from "@/components/StoryInteractions";
import ThemeToggle from "@/components/ThemeToggle";
import { ambientSound } from "@/lib/ambientSound";

export type ReaderTheme = "default" | "sepia" | "night" | "paper";
export type FontSize = "sm" | "md" | "lg" | "xl";

interface StoryReaderViewProps {
  post: BlogPost;
  comments: CommentItem[];
  relatedPosts: BlogPost[];
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
}

export default function StoryReaderView({
  post,
  comments,
  relatedPosts,
  prevPost,
  nextPost,
}: StoryReaderViewProps) {
  // Reading state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("default");
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(100);
        return;
      }
      const currentScroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cleanup ambient sound on unmount
  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      ambientSound.stop();
      setIsAmbientPlaying(false);
    } else {
      const started = ambientSound.playRain(0.12);
      if (started) {
        setIsAmbientPlaying(true);
      }
    }
  };

  const handleShareLink = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // ignore
    }
  };

  // Font size styles
  const fontClasses: Record<FontSize, string> = {
    sm: "text-sm sm:text-base leading-relaxed sm:leading-loose",
    md: "text-base sm:text-lg leading-relaxed sm:leading-[1.9]",
    lg: "text-lg sm:text-xl leading-relaxed sm:leading-[1.95]",
    xl: "text-xl sm:text-2xl leading-loose sm:leading-[2]",
  };

  // Theme styles
  const themeClasses: Record<ReaderTheme, { pageBg: string; cardBg: string; text: string; border: string }> = {
    default: {
      pageBg: "bg-[#FCFAF6] dark:bg-[#0B0F17]",
      cardBg: "bg-white dark:bg-[#111827]",
      text: "text-[#142230] dark:text-[#E2E8F0]",
      border: "border-stone-200 dark:border-stone-800",
    },
    sepia: {
      pageBg: "bg-[#F4ECD8]",
      cardBg: "bg-[#FAF4E6]",
      text: "text-[#3D2E1E]",
      border: "border-[#E2D2B8]",
    },
    night: {
      pageBg: "bg-[#0B0F17]",
      cardBg: "bg-[#111827]",
      text: "text-[#E2E8F0]",
      border: "border-stone-800",
    },
    paper: {
      pageBg: "bg-[#F9F9FB]",
      cardBg: "bg-white",
      text: "text-[#111827]",
      border: "border-stone-200",
    },
  };

  const currentTheme = themeClasses[readerTheme];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${currentTheme.pageBg} ${currentTheme.text}`}>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200/40 dark:bg-stone-800/40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#7E151E] via-[#C59B27] to-[#7E151E] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Header */}
      {!isFocusMode && (
        <header className={`sticky top-0 z-40 backdrop-blur-md ${currentTheme.cardBg}/95 border-b ${currentTheme.border} transition-colors`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-500 hover:text-[#7E151E] dark:text-stone-400 dark:hover:text-rose-400 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>সব গল্প</span>
              </Link>

              <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 hidden sm:block" />

              <span className="hidden sm:inline-block text-xs font-semibold text-stone-500 dark:text-stone-400 truncate max-w-xs">
                {post.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />

              <button
                type="button"
                onClick={handleShareLink}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition cursor-pointer"
                title="গল্পটি শেয়ার করুন"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsFocusMode(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 transition cursor-pointer"
                title="ডিস্ট্র্যাকশন-মুক্ত ফোকাস মোড"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>ফোকাস মোড</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Floating Exit Focus Mode Button */}
      {isFocusMode && (
        <div className="fixed top-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/80 dark:bg-white/90 text-white dark:text-black text-xs font-bold shadow-lg backdrop-blur-md hover:scale-105 transition cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>ফোকাস বন্ধ করুন</span>
          </button>
        </div>
      )}

      {/* Main Reading Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Story Metadata & Title Header */}
        <div className="space-y-4 pb-6 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60 text-[#7E151E] dark:text-rose-300 text-xs font-bold">
              {post.category}
            </span>

            {post.confessionIdBn && (
              <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-bold">
                {post.confessionIdBn}
              </span>
            )}

            {post.isAdminPost && (
              <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700">
                সম্পাদকের কলমে
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight leading-snug sm:leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
            <span className="font-bold text-stone-800 dark:text-stone-200">
              লেখক: {post.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
              {post.dateBn}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
              {post.readTimeBn}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
              {Math.round(scrollProgress)}% পড়া হয়েছে
            </span>
          </div>
        </div>

        {/* Reader Customization Toolbar (Font Size, Paper Themes, Ambient Rain) */}
        <div className={`rounded-2xl ${currentTheme.cardBg} border ${currentTheme.border} p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs`}>
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-stone-500 dark:text-stone-400 mr-1 hidden sm:inline">পড়ার থিম:</span>
            <button
              type="button"
              onClick={() => setReaderTheme("default")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                readerTheme === "default"
                  ? "bg-[#7E151E] text-white shadow-2xs"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
              }`}
            >
              স্বাভাবিক
            </button>
            <button
              type="button"
              onClick={() => setReaderTheme("sepia")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                readerTheme === "sepia"
                  ? "bg-[#3D2E1E] text-[#F4ECD8] shadow-2xs"
                  : "bg-[#F4ECD8] text-[#3D2E1E] border border-[#E2D2B8]"
              }`}
              title="উষ্ণ সেপিয়া বইয়ের পৃষ্ঠা"
            >
              সেপিয়া (বই)
            </button>
            <button
              type="button"
              onClick={() => setReaderTheme("night")}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                readerTheme === "night"
                  ? "bg-stone-800 text-white shadow-2xs"
                  : "bg-stone-900 text-stone-200 border border-stone-800"
              }`}
            >
              ডার্ক
            </button>
          </div>

          {/* Font Size & Ambient Sound Controls */}
          <div className="flex items-center gap-2">
            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
              <span className="px-1 text-stone-400">
                <Type className="w-3.5 h-3.5" />
              </span>
              {(["sm", "md", "lg", "xl"] as FontSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    fontSize === size
                      ? "bg-white dark:bg-stone-700 text-[#7E151E] dark:text-rose-300 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                  }`}
                >
                  {size === "sm" ? "ছোট" : size === "md" ? "মাঝারি" : size === "lg" ? "বড়" : "বিশাল"}
                </button>
              ))}
            </div>

            {/* Ambient Sound Toggle */}
            <button
              type="button"
              onClick={toggleAmbientSound}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isAmbientPlaying
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              }`}
              title={isAmbientPlaying ? "বৃষ্টির মৃদু শব্দ বন্ধ করুন" : "পড়ার সাথে বৃষ্টির মৃদু শব্দ চালু করুন"}
            >
              {isAmbientPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isAmbientPlaying ? "বৃষ্টি বাজছে" : "বৃষ্টির শব্দ"}</span>
            </button>
          </div>
        </div>

        {/* Featured Story Image (if provided) */}
        {post.imageUrl && (
          <div className={`rounded-3xl overflow-hidden border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* Story Article Text */}
        <article
          className={`rounded-3xl p-6 sm:p-10 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-6 ${fontClasses[fontSize]}`}
        >
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="font-normal text-justify sm:text-left">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Admin Editorial Reply Note (if available) */}
        {post.adminNote && (
          <div className="rounded-3xl bg-[#FAF4E6] dark:bg-[#1A2234] border-2 border-[#C59B27]/50 dark:border-[#C59B27]/40 p-6 sm:p-7 space-y-2.5 shadow-xs">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#7E151E] dark:text-rose-400">
              <MessageSquareHeart className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
              <span>অনুভূতি সম্পাদনা পর্ষদের মন্তব্য ও সহমর্মিতা</span>
            </div>
            <p className="text-sm sm:text-base text-[#142230] dark:text-stone-200 leading-relaxed font-medium">
              {post.adminNote}
            </p>
          </div>
        )}

        {/* Emotional Reactions, 1-Click Story Card & Reader Comments */}
        <div className={`rounded-3xl p-6 sm:p-8 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs`}>
          <StoryInteractions
            storyId={post.id}
            storyTitle={post.title}
            storyExcerpt={post.excerpt}
            storyCategory={post.category}
            storyAuthor={post.author}
            confessionIdBn={post.confessionIdBn}
            initialLikes={post.likesCount}
            initialReactions={post.reactions}
            initialComments={comments}
          />
        </div>

        {/* Previous & Next Story Navigation */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className={`rounded-2xl p-4 sm:p-5 border ${currentTheme.border} ${currentTheme.cardBg} hover:border-[#7E151E]/50 dark:hover:border-rose-400/50 transition group space-y-1.5 shadow-xs flex flex-col justify-between`}
            >
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী লেখা</span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white line-clamp-2">
                {prevPost.title}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">— {prevPost.author}</p>
            </Link>
          ) : (
            <div className={`rounded-2xl p-4 sm:p-5 border border-dashed border-stone-200 dark:border-stone-800 text-xs text-stone-400 flex items-center justify-center`}>
              <span>এটিই প্রথম লেখা</span>
            </div>
          )}

          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className={`rounded-2xl p-4 sm:p-5 border ${currentTheme.border} ${currentTheme.cardBg} hover:border-[#7E151E]/50 dark:hover:border-rose-400/50 transition group space-y-1.5 shadow-xs flex flex-col justify-between text-right`}
            >
              <div className="inline-flex items-center justify-end gap-1.5 text-xs font-bold text-stone-500 group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition">
                <span>পরবর্তী লেখা</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white line-clamp-2">
                {nextPost.title}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">— {nextPost.author}</p>
            </Link>
          ) : (
            <div className={`rounded-2xl p-4 sm:p-5 border border-dashed border-stone-200 dark:border-stone-800 text-xs text-stone-400 flex items-center justify-center`}>
              <span>আর কোনো নতুন লেখা নেই</span>
            </div>
          )}
        </div>

        {/* Minimal Book Callout */}
        <div className="rounded-3xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="text-xs text-[#7E151E] dark:text-rose-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>অনুভূতি পাবলিকেশন্সের বিশেষ ই-বুক</span>
            </div>
            <h3 className="text-lg font-black text-[#142230] dark:text-white">
              {BOOK_INFO.titleBn}: {BOOK_INFO.subtitleBn}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              রেগুলার মূল্য <span className="line-through">৳{BOOK_INFO.regularPriceBn}</span> •{" "}
              <strong>{BOOK_INFO.discountPercentBn}ে মাত্র ৳{BOOK_INFO.offerPriceBn}</strong>
            </p>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="px-5 py-2.5 rounded-xl bg-[#7E151E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 hover:bg-[#630d16] transition shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>ই-বুকটি সংগ্রহ করুন</span>
          </Link>
        </div>

        {/* More Stories Recommendation */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black text-[#142230] dark:text-white">
              আরও কিছু অনুভূতির গল্প
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/${rp.slug}`}
                  className={`rounded-2xl p-4.5 border ${currentTheme.border} ${currentTheme.cardBg} hover:border-[#7E151E]/50 dark:hover:border-rose-400/50 transition space-y-1.5 shadow-xs`}
                >
                  <span className="text-xs font-bold text-[#7E151E] dark:text-rose-400">
                    {rp.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white line-clamp-2">
                    {rp.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">— {rp.author}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
