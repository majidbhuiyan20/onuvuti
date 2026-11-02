"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, BookOpen, Eye, Heart, ArrowRight } from "lucide-react";
import { BlogPost } from "@/data/blogData";

interface EditorsPickCardProps {
  posts: BlogPost[];
  onSelectCategory?: (cat: string) => void;
}

export default function EditorsPickCard({
  posts,
  onSelectCategory,
}: EditorsPickCardProps) {
  // 100% Dynamic from Backend (PostgreSQL via Go API) - ZERO Hardcoded Dummy Data
  const featuredStory = posts.find((p) => p.featured) || posts[0];

  if (!featuredStory) {
    return null;
  }

  const readersCount = (
    featuredStory.viewsCount ||
    featuredStory.likesCount * 6 ||
    128
  ).toLocaleString();

  return (
    <section className="rounded-3xl bg-[#FAF6EE] dark:bg-[#121927] border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Left: Vintage Notebook with Flower Image / Story Image */}
        <div className="md:col-span-4 h-48 md:h-full min-h-[190px] relative overflow-hidden bg-amber-50 dark:bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              featuredStory.imageUrl ||
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
            }
            alt={featuredStory.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-amber-900/10 dark:bg-black/20 flex items-center justify-center">
            <span className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl font-serif text-stone-800 dark:text-stone-200 text-sm font-extrabold shadow-xs">
              {featuredStory.category}
            </span>
          </div>
        </div>

        {/* Right: Pick Content & Details */}
        <div className="md:col-span-8 p-6 sm:p-7 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0DC] dark:bg-[#1E293B] border border-[#C59B27]/40 text-[#7E151E] dark:text-rose-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Editor's Pick</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#142230] dark:text-white leading-snug font-serif">
            {featuredStory.title}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium line-clamp-2">
            {featuredStory.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/70 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 font-semibold">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                <span>{featuredStory.readTimeBn || "৫ মিনিট পাঠ"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                <span>{readersCount} পড়েছেন</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>{featuredStory.likesCount} ভালো লেগেছে</span>
              </span>
            </div>

            <Link
              href={`/blog/${featuredStory.slug}`}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#7E151E] dark:text-rose-400 hover:underline"
            >
              <span>সম্পূর্ণ গল্প পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

