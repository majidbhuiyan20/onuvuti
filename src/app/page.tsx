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
  Heart,
  PenLine,
  Send,
  X,
  CheckCircle2,
  UserCheck,
  EyeOff,
} from "lucide-react";
import { BLOG_CATEGORIES, BLOG_POSTS } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";

export default function OnuvutiBlogHomePage() {
  const [activeCategory, setActiveCategory] = useState("সকল গল্প");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Story Submission Modal State (Ready for Backend API integration tomorrow!)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [storyCategory, setStoryCategory] = useState("না বলা কথা");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchCat =
      activeCategory === "সকল গল্প" || post.category === activeCategory;
    const matchSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Tomorrow: POST to your backend API here!
    setSubmittedSuccess(true);
  };

  const resetModal = () => {
    setSubmittedSuccess(false);
    setStoryTitle("");
    setStoryBody("");
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
              <span>গল্প পাঠান</span>
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
        {/* Hero Welcome: Romantic Stories, Life Stories & Unspoken Words */}
        <div className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E6] text-[#80131E] text-xs font-bold">
              💌 অনুভূতির খোলা চিঠি ও গল্পের আসর
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142230] leading-snug">
              রোমান্টিক গল্প, মানুষের জীবনের গল্প ও মনের না বলা কথা
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              এখানে মানুষ শেয়ার করে তাদের ভালোবাসার গল্প, জীবনের না বলা অভিমান ও চাপা থাকা অনুভূতি। আপনিও আপনার নিজের নাম বা ছদ্মনামে আপনার গল্প পাঠাতে পারেন।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-3.5 rounded-2xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shrink-0 shadow-md hover:bg-[#630d16] transition cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            <span>আপনার গল্প / না বলা কথা পাঠান</span>
          </button>
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
                      ? "bg-[#80131E] text-white shadow-xs"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-[#80131E]/40"
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
              placeholder="গল্প খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-[#142230] placeholder:text-stone-400 focus:outline-none focus:border-[#80131E]"
            />
          </div>
        </div>

        {/* Stories & Unspoken Letters Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => {
            const isLiked = Boolean(likedIds[post.id]);
            const isUnspoken = post.category === "না বলা কথা";

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group rounded-2xl border p-5 flex flex-col justify-between transition shadow-xs hover:shadow-md ${
                  isUnspoken
                    ? "bg-[#FAF4E6]/75 border-[#C59B27]/45 hover:border-[#80131E]/60"
                    : "bg-white border-stone-200/90 hover:border-[#80131E]/50"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold ${
                        isUnspoken
                          ? "bg-[#80131E] text-white"
                          : "bg-[#FAF4E6] text-[#80131E]"
                      }`}
                    >
                      {isUnspoken ? "💌 না বলা কথা" : post.category}
                    </span>
                    <span className="text-stone-400 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTimeBn}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-extrabold text-[#142230] group-hover:text-[#80131E] transition leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                    “{post.excerpt}”
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 space-y-2">
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

                    <span className="text-xs text-[#80131E] font-bold inline-flex items-center gap-1">
                      পুরো গল্প পড়ুন <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
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

      {/* STORY SUBMISSION MODAL ("আপনার গল্প পাঠান") */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden">
            <div className="bg-[#FAF4E6] px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#80131E]">
                  অনুভূতির চিঠির বাক্স
                </span>
                <h3 className="text-lg font-extrabold text-[#142230]">
                  আপনার গল্প বা না বলা কথা পাঠান
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
                    ধন্যবাদ! আপনার গল্পটি জমা হয়েছে
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
                    অনুভূতি টিম আপনার লেখাটি রিভিউ করে খুব শীঘ্রই ওয়েবসাইটে প্রকাশ করবে।
                  </p>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-6 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    ঠিক আছে
                  </button>
                </div>
              ) : (
                <form onSubmit={handleStorySubmit} className="space-y-4">
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
                      onChange={(e) => setStoryCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
                    >
                      <option value="না বলা কথা">💌 না বলা কথা</option>
                      <option value="রোমান্টিক গল্প">💕 রোমান্টিক গল্প</option>
                      <option value="জীবনের গল্প">🌿 জীবনের গল্প</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      গল্পের শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      placeholder="আপনার গল্পের একটি সুন্দর শিরোনাম দিন"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      আপনার মূল গল্প / মনের কথা *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={storyBody}
                      onChange={(e) => setStoryBody(e.target.value)}
                      placeholder="এখানে আপনার মনের কথা বা গল্পটি বিস্তারিত লিখুন..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-[#80131E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#630d16] transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>গল্পটি পাঠিয়ে দিন</span>
                  </button>
                </form>
              )}
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
              গল্প পাঠান
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
