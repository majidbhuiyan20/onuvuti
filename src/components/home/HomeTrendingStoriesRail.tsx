"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { renderFormattedInline } from "@/lib/formatText";

interface HomeTrendingStoriesRailProps {
  posts: BlogPost[];
}

export default function HomeTrendingStoriesRail({
  posts,
}: HomeTrendingStoriesRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Take the most popular / liked / viewed stories
  const trendingList = [...posts]
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, 8);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (trendingList.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#80131E] dark:text-rose-400">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#142230] dark:text-white">
              আজকের আলোচিত গল্পসমূহ
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              পাঠকদের সবচেয়ে বেশি ভালোবাসা ও রিঅ্যাকশন পাওয়া অনুভূতিগুলো
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-2 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition shadow-2xs"
            aria-label="পূর্ববর্তী গল্প"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-2 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition shadow-2xs"
            aria-label="পরবর্তী গল্প"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Rail */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
      >
        {trendingList.map((post, idx) => {
          const hasImage = Boolean(post.imageUrl);

          return (
            <Link
              key={post.id || post.slug}
              href={`/blog/${post.slug}`}
              className="group w-72 sm:w-80 shrink-0 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 hover:border-[#80131E]/40 dark:hover:border-rose-500/40 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Image Banner if available */}
                {hasImage && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#80131E] backdrop-blur-xs">
                      #{idx + 1} ট্রেন্ডিং
                    </span>
                  </div>
                )}

                {/* Badges Row */}
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 font-bold border border-[#C59B27]/30">
                    {post.category}
                  </span>

                  <span className="flex items-center gap-1 text-stone-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTimeBn || "৩ মিনিট"}</span>
                  </span>
                </div>

                {/* Title & Excerpt */}
                <h3 className="font-serif font-black text-sm sm:text-base text-[#142230] dark:text-white group-hover:text-[#80131E] dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                  {renderFormattedInline(post.title)}
                </h3>

                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                  {renderFormattedInline(post.excerpt)}
                </p>
              </div>

              {/* Footer Author & Reaction */}
              <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="font-medium text-stone-500 dark:text-stone-400 truncate max-w-[130px]">
                  {post.author || "লেখক"}
                </span>

                <div className="flex items-center gap-2 text-stone-500 shrink-0">
                  <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{post.likesCount || 0}</span>
                  </span>

                  <span className="text-stone-400 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

