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
  Mail,
  Gift,
  HeartPulse,
  Feather,
  ChevronRight,
  Heart,
  ExternalLink,
} from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import StoryInteractions, { CommentItem } from "@/components/StoryInteractions";
import ThemeToggle from "@/components/ThemeToggle";
import { ambientSound } from "@/lib/ambientSound";
import { renderStoryParagraph, renderFormattedInline } from "@/lib/formatText";

export type ReaderTheme = "default" | "sepia" | "night" | "paper";
export type FontSize = "sm" | "md" | "lg" | "xl";

interface StoryReaderViewProps {
  post: BlogPost;
  comments: CommentItem[];
  relatedPosts: BlogPost[];
  prevPost?: BlogPost | null;
  nextPost?: BlogPost | null;
  confessions?: BlogPost[];
}

export default function StoryReaderView({
  post,
  comments,
  relatedPosts,
  prevPost,
  nextPost,
  confessions = [],
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Onuvuti-Publications-Logo.png"
                  alt="অনুভূতি"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </Link>

              <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 hidden sm:block" />

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-500 hover:text-[#7E151E] dark:text-stone-400 dark:hover:text-rose-400 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>সব গল্প</span>
              </Link>
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

      {/* 3-Column Main Container */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col xl:flex-row items-start justify-center gap-8">
          
          {/* ========================================================
              LEFT SIDEBAR: গোপন চিঠি, জন্মদিনের শুভেচ্ছা ও টিপস
              ======================================================== */}
          {!isFocusMode && (
            <aside className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 sticky top-24 space-y-6">
              {/* 1. গোপন চিঠির বাক্স (Secret Message Card) */}
              <div className={`rounded-3xl p-5 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-3.5 relative overflow-hidden group`}>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-400 text-xs font-bold border border-rose-200/80 dark:border-rose-900/60">
                  <Mail className="w-3.5 h-3.5" />
                  <span>অনুভূতির চিঠির বাক্স</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#142230] dark:text-white leading-snug">
                    কাউকে না বলা অনুভূতি পাঠাবেন?
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    আপনার নিজের নামে একটি গোপন লিংক বানিয়ে ইনস্টাগ্রাম বা ফেসবুকে ডে দিন। বন্ধুরা পরিচয় প্রকাশ ছাড়াই মনের কথা পাঠাতে পারবে।
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-dashed border-stone-300 dark:border-stone-700 text-[11px] font-mono text-stone-500 truncate">
                  onuvuti.site/m/আপনার-নাম
                </div>

                <Link
                  href="/m"
                  className="w-full py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>নিজের চিঠির লিংক তৈরি করুন</span>
                </Link>
              </div>

              {/* 2. প্রিয়জনের জন্মদিনের শুভেচ্ছা (Birthday Wish Card) */}
              <div className={`rounded-3xl p-5 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-3.5 relative overflow-hidden`}>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-[#C59B27] text-xs font-bold border border-[#C59B27]/40">
                  <Gift className="w-3.5 h-3.5" />
                  <span>জন্মদিনের ডিজিটাল উপহার</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-[#142230] dark:text-white leading-snug">
                    প্রিয়জনের জন্য জন্মদিনের শুভেচ্ছা
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    ভার্চুয়াল কেক কাটিং, সারপ্রাইজ অ্যানিমেশন ও নরম ব্যাকগ্রাউন্ড মিউজিক সহ চমৎকার উইশ চিঠি পাঠান।
                  </p>
                </div>

                <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ইন্টারেক্টিভ কেক কাটিং ও মোমবাতি</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>নরম অ্যাকোস্টিক বার্থডে সুর</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>পাসকোড অথবা মিডনাইট আনলক</span>
                  </li>
                </ul>

                <Link
                  href="/birthday-wish"
                  className="w-full py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b0881e] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>উইশ কার্ড তৈরি করুন</span>
                </Link>
              </div>

              {/* 3. মানসিক প্রশান্তি ও স্বস্তি টিপস */}
              <div className={`rounded-3xl p-5 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-3`}>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>দৈনিক মানসিক প্রশান্তি</span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 italic leading-relaxed">
                  &ldquo;সম্পর্কে হেরে যাওয়ার চেয়ে প্রিয় মানুষটাকে ধরে রাখা অনেক বেশি সুন্দর; ইগো জিতলে ভালোবাসা নিঃশব্দে দূরে সরে যায়।&rdquo;
                </p>
                <Link
                  href="/tips"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline pt-1"
                >
                  <span>সম্পর্ক ও মানসিক স্বাস্থ্য গাইড</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </aside>
          )}

          {/* ========================================================
              CENTER COLUMN: মূল গল্প ও পড়ার নিয়ন্ত্রণ
              ======================================================== */}
          <main className="flex-1 max-w-3xl w-full mx-auto space-y-8">
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

              <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-black tracking-tight leading-snug sm:leading-tight">
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

            {/* Reader Customization Toolbar (Font Size, Themes, Rain Audio) */}
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

            {/* Featured Story Image */}
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

            {/* Story Article Body */}
            <article
              className={`rounded-3xl p-6 sm:p-10 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-5 ${fontClasses[fontSize]}`}
            >
              {post.content.map((paragraph, idx) => renderStoryParagraph(paragraph, idx))}
            </article>

            {/* Admin Editorial Reply Note */}
            {post.adminNote && (
              <div className="rounded-3xl bg-[#FAF4E6] dark:bg-[#1A2234] border-2 border-[#C59B27]/50 dark:border-[#C59B27]/40 p-6 sm:p-7 space-y-2.5 shadow-xs">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#7E151E] dark:text-rose-400">
                  <MessageSquareHeart className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
                  <span>অনুভূতি সম্পাদনা পর্ষদের মন্তব্য ও সহমর্মিতা</span>
                </div>
                <p className="text-sm sm:text-base text-[#142230] dark:text-stone-200 leading-relaxed font-medium">
                  {renderFormattedInline(post.adminNote)}
                </p>
              </div>
            )}

            {/* Emotional Reactions & Comments */}
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

          {/* ========================================================
              RIGHT SIDEBAR: ক্রাশ কনফেশন, স্পর্শের ব্যাকরণ ই-বুক ও ক্যাটাগরি
              ======================================================== */}
          {!isFocusMode && (
            <aside className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 sticky top-24 space-y-6">
              {/* 1. আলোচিত ক্রাশ ও কনফেশন (Trending Confessions) */}
              <div className={`rounded-3xl p-5 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-3.5`}>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E151E] dark:text-rose-400">
                    <MessageSquareHeart className="w-3.5 h-3.5" />
                    <span>গোপন ক্রাশ ও কনফেশন</span>
                  </div>
                  <Link
                    href="/?category=ক্রাশ ও কনফেশন"
                    className="text-[11px] font-bold text-stone-400 hover:text-[#7E151E] dark:hover:text-rose-400 transition"
                  >
                    সব দেখুন
                  </Link>
                </div>

                {confessions.length > 0 ? (
                  <div className="space-y-3">
                    {confessions.map((c) => (
                      <Link
                        key={c.id}
                        href={`/blog/${c.slug}`}
                        className="block p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 transition border border-stone-200/80 dark:border-stone-700/80 space-y-1 group"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-[#7E151E] dark:text-rose-400">
                            {c.confessionIdBn || "#কনফেশন"}
                          </span>
                          <span className="text-stone-400">{c.dateBn}</span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-2 group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition leading-snug">
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          — {c.author}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-500 text-center">
                    নতুন কনফেশন পড়া শুরু করুন
                  </div>
                )}

                <Link
                  href="/?submit=1"
                  className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#7E151E] hover:text-white text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>নিজের কনফেশন লিখুন</span>
                </Link>
              </div>

              {/* 2. ‘স্পর্শের ব্যাকরণ’ বেস্টসেলার ই-বুক */}
              <div className={`rounded-3xl p-5 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-3.5`}>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C59B27]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>বেস্টসেলার ই-বুক</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700 shadow-xs bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/book-cover.png"
                      alt={BOOK_INFO.titleBn}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-[#142230] dark:text-white leading-snug">
                      {BOOK_INFO.titleBn}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                      {BOOK_INFO.subtitleBn}
                    </p>
                    <div className="text-xs font-bold text-[#7E151E] dark:text-rose-400 pt-1">
                      মাত্র ৳{BOOK_INFO.offerPriceBn}
                    </div>
                  </div>
                </div>

                <Link
                  href="/sporsher-byakoron"
                  className="w-full py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>ই-বুকটি সংগ্রহ করুন</span>
                </Link>
              </div>

              {/* 3. ক্যাটাগরি এক্সপ্লোরার */}
              <div className={`rounded-3xl p-5 border ${currentTheme.border} ${currentTheme.cardBg} shadow-xs space-y-3`}>
                <div className="text-xs font-bold text-stone-500 dark:text-stone-400">
                  জনপ্রিয় ক্যাটাগরি
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "রোমান্টিক গল্প",
                    "না বলা কথা",
                    "ক্রাশ ও কনফেশন",
                    "সম্পর্ক ও মনস্তত্ত্ব",
                    "বিচ্ছেদ ও প্রাক্তন",
                  ].map((cat) => (
                    <Link
                      key={cat}
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#7E151E] hover:text-white text-stone-600 dark:text-stone-300 text-xs font-semibold transition"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}
