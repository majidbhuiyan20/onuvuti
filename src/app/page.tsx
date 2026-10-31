"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  Search,
  Sparkles,
} from "lucide-react";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";

export default function OnuvutiBlogHomePage() {
  const [activeCategory, setActiveCategory] = useState("সকল লেখা");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchCat =
      activeCategory === "সকল লেখা" || post.category === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-[#142230] flex flex-col">
      {/* Clean Light Mode Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply"
            />
          </Link>

          <Link
            href="/sporsher-byakoron"
            className="px-4 py-2 rounded-xl bg-[#6E1A2C] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm hover:bg-[#581322] transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>‘স্পর্শের ব্যাকরণ’ ই-বুক</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Minimal Book Banner on Blog Home */}
        <div className="rounded-2xl bg-[#FAF4E6] border border-[#C59B27]/45 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#6E1A2C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>আমাদের প্রকাশিত ই-বুক</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#142230]">
              {BOOK_INFO.titleBn}: {BOOK_INFO.subtitleBn}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              ১০০+ পৃষ্ঠার প্রিমিয়াম গাইড • রেগুলার মূল্য <span className="line-through text-stone-400">৳{BOOK_INFO.regularPriceBn}</span> • <strong>{BOOK_INFO.discountPercentBn}ে মাত্র ৳{BOOK_INFO.offerPriceBn}</strong>
            </p>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="px-5 py-2.5 rounded-xl bg-[#6E1A2C] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 hover:bg-[#581322] transition"
          >
            <span>ল্যান্ডিং পেজ দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Filter & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {BLOG_CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                    active
                      ? "bg-[#6E1A2C] text-white"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-[#6E1A2C]/40"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="লেখা খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-[#142230] placeholder:text-stone-400 focus:outline-none focus:border-[#6E1A2C]"
            />
          </div>
        </div>

        {/* Clean Blog Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl bg-white border border-stone-200/90 hover:border-[#6E1A2C]/50 p-5 flex flex-col justify-between transition shadow-sm hover:shadow-md"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E6] text-[#6E1A2C] font-bold">
                    {post.category}
                  </span>
                  <span className="text-stone-400 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTimeBn}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-[#142230] group-hover:text-[#6E1A2C] transition leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#C59B27]" />
                  {post.dateBn}
                </span>
                <span className="text-[#6E1A2C] font-bold inline-flex items-center gap-1">
                  পড়ুন <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

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
            <Link href="/" className="hover:text-[#6E1A2C]">
              ব্লগ হোম
            </Link>
            <Link
              href="/sporsher-byakoron"
              className="text-[#6E1A2C] font-bold hover:underline"
            >
              স্পর্শের ব্যাকরণ ই-বুক
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
