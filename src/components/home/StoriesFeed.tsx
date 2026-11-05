"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Bookmark,
  Shuffle,
  PenLine,
  Heart,
  Eye,
  Calendar,
  Clock,
  ArrowRight,
  Pin,
  ShieldCheck,
  UserCheck,
  EyeOff,
} from "lucide-react";
import { BLOG_CATEGORIES, BlogPost } from "@/data/blogData";
import { renderFormattedInline } from "@/lib/formatText";

interface StoriesFeedProps {
  posts: BlogPost[];
  filteredPosts: BlogPost[];
  paginatedPosts: BlogPost[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  showSavedOnly: boolean;
  setShowSavedOnly: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  safePage: number;
  bookmarkedCount: number;
  likedIds: Record<string, boolean>;
  bookmarkedIds: Record<string, boolean>;
  toggleLike: (e: React.MouseEvent, id: string) => void;
  toggleBookmark: (e: React.MouseEvent, id: string) => void;
  onSurpriseRandom: () => void;
  onOpenSubmit: () => void;
}

export default function StoriesFeed({
  posts,
  filteredPosts,
  paginatedPosts,
  activeCategory,
  setActiveCategory,
  showSavedOnly,
  setShowSavedOnly,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  totalPages,
  safePage,
  bookmarkedCount,
  likedIds,
  bookmarkedIds,
  toggleLike,
  toggleBookmark,
  onSurpriseRandom,
  onOpenSubmit,
}: StoriesFeedProps) {
  return (
    <section id="stories-feed" className="space-y-6 pt-2">
      {/* Category Filter Pills & Search Bar Row */}
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
                    ? "bg-[#7E151E] text-white shadow-xs"
                    : "bg-white dark:bg-[#111827] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-[#7E151E]/40 dark:hover:border-rose-400/40"
                }`}
              >
                {cat}
              </button>
            );
          })}

          {/* Saved / Bookmarked Stories Filter Button */}
          <button
            type="button"
            onClick={() => {
              setShowSavedOnly((prev) => !prev);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
              showSavedOnly
                ? "bg-[#7E151E] text-white shadow-xs"
                : "bg-[#FAF4E6] dark:bg-[#1E293B] text-[#7E151E] dark:text-rose-300 border border-[#C59B27]/50 dark:border-[#C59B27]/30 hover:bg-[#f3e8ce] dark:hover:bg-[#253348]"
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                showSavedOnly ? "fill-white" : "fill-[#7E151E]/20"
              }`}
            />
            <span>সংরক্ষিত লেখা ({bookmarkedCount})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="গল্প বা কনফেশন খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-[#142230] dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-[#7E151E]"
            />
          </div>

          {/* Random Surprise Story Button */}
          <button
            type="button"
            onClick={onSurpriseRandom}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 hover:border-[#7E151E]/50 dark:hover:border-rose-400/50 text-xs sm:text-sm font-bold text-[#7E151E] dark:text-rose-400 inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition shadow-2xs"
            title="যেকোনো একটি গল্প পড়ুন"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>যেকোনো একটি গল্প পড়ুন</span>
          </button>
        </div>
      </div>

      {/* Empty State when Stories list has 0 items */}
      {paginatedPosts.length === 0 && (
        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-10 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#7E151E] dark:text-rose-400 mx-auto flex items-center justify-center">
            <PenLine className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white">
              {showSavedOnly
                ? "আপনার প্রিয় তালিকায় এখনো কোনো গল্প সংরক্ষণ করা হয়নি।"
                : searchQuery.trim()
                ? `"${searchQuery}" দিয়ে কোনো লেখা খুঁজে পাওয়া যায়নি।`
                : activeCategory !== "সকল গল্প"
                ? `"${activeCategory}" ক্যাটাগরিতে এখনো কোনো লেখা নেই।`
                : "অনুভূতিতে আপনাকে স্বাগতম। এখনো কোনো গল্প প্রকাশিত হয়নি।"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              {showSavedOnly
                ? "যেকোনো গল্পের কার্ডের কোণায় থাকা বুকমার্ক আইকনে ক্লিক করে পরে পড়ার জন্য সংরক্ষণ করতে পারবেন।"
                : searchQuery.trim()
                ? "অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন বা ফিল্টার ক্লিয়ার করুন।"
                : "আপনার মনের না বলা কোনো গল্প বা অনুভূতি আমাদের পাঠাতে পারেন। অনুমোদিত হলে তা হোমপেজে প্রকাশিত হবে।"}
            </p>
          </div>
          {!showSavedOnly && !searchQuery.trim() && (
            <button
              type="button"
              onClick={onOpenSubmit}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7E151E] hover:bg-[#680f18] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition"
            >
              <PenLine className="w-4 h-4" />
              <span>আপনার গল্প বা অনুভূতি পাঠান</span>
            </button>
          )}
        </div>
      )}

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {paginatedPosts.map((post) => {
          const isLiked = Boolean(likedIds[post.id]);
          const isBookmarked = Boolean(bookmarkedIds[post.id]);
          const totalReaders = post.viewsCount || post.likesCount * 6;

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 hover:border-[#7E151E]/50 dark:hover:border-rose-500/50 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              {/* Optional Post Image */}
              {post.imageUrl && (
                <div className="w-full h-44 overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 dark:bg-[#111827]/90 text-[#7E151E] dark:text-rose-400 backdrop-blur-xs shadow-xs">
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs">
                  {!post.imageUrl && (
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#FAF4E6] dark:bg-[#1E293B] text-[#7E151E] dark:text-rose-300 border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[11px]">
                      {post.category}
                    </span>
                  )}
                  {post.imageUrl && <div />}

                  <div className="flex items-center gap-1.5">
                    {post.featured && (
                      <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" title="পিন করা পোস্ট">
                        <Pin className="w-3 h-3 fill-amber-500" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(e, post.id)}
                      className={`p-1 rounded-md transition cursor-pointer ${
                        isBookmarked
                          ? "bg-rose-50 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-400 border border-rose-200"
                          : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                      title="সংরক্ষণ করুন"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          isBookmarked ? "fill-[#7E151E]" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition leading-snug line-clamp-2">
                    {renderFormattedInline(post.title)}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {renderFormattedInline(post.excerpt)}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-stone-200/60 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300 truncate">
                    — {post.author}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 shrink-0">
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
                          ? "bg-rose-100 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-[#7E151E] dark:hover:text-rose-400"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked ? "fill-[#7E151E] text-[#7E151E]" : ""
                        }`}
                      />
                      <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
                    </button>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      <span>{totalReaders.toLocaleString()} পাঠক</span>
                    </span>
                  </div>

                  <span className="text-xs text-[#7E151E] dark:text-rose-400 font-bold inline-flex items-center gap-1">
                    পুরোটা পড়ুন <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {filteredPosts.length > 0 && totalPages > 1 && (
        <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
            মোট <strong className="text-[#7E151E] dark:text-rose-400">{filteredPosts.length}টি</strong> লেখার মধ্যে পৃষ্ঠা{" "}
            <strong>{safePage}</strong> / <strong>{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
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
                      ? "bg-[#7E151E] text-white shadow-xs"
                      : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#7E151E]/40 dark:hover:border-rose-400/40"
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
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
            >
              পরের পৃষ্ঠা »
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

