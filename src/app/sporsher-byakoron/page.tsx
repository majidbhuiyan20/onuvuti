"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Star,
  Sparkles,
  Lock,
  Download,
  HelpCircle,
  Users,
  Eye,
  Check,
  RotateCw,
  Flame,
  Zap,
  Gift,
  HeartHandshake,
  Heart,
  X,
  Compass,
  Smile,
  ShieldAlert,
} from "lucide-react";
import { BOOK_INFO, BOOK_PARTS, APPENDICES } from "@/data/bookData";
import BookCover3D from "@/components/BookCover3D";
import ZiniPayCheckout from "@/components/ZiniPayCheckout";
import ThemeToggle from "@/components/ThemeToggle";
import { trackViewContent } from "@/lib/metaPixel";

// Verified reader reviews for social proof
const READER_REVIEWS = [
  {
    name: "তানভীর হাসান",
    role: "দাম্পত্য জীবন: ৩ বছর (ঢাকা)",
    rating: 5,
    date: "২ দিন আগে",
    comment:
      "বইটি পড়ার পর আমাদের সম্পর্কের বোঝাপড়া একদম অন্য রূপ নিয়েছে। স্পর্শ ও মানসিক নিরাপত্তার যে সুন্দর বৈজ্ঞানিক ব্যাখ্যা লেখক দিয়েছেন, তা বাংলা বইয়ের ক্ষেত্রে আসলেই বিরল ও প্রশংসনীয়।",
  },
  {
    name: "নুসরাত জাহান",
    role: "গৃহিণী (চট্টগ্রাম)",
    rating: 5,
    date: "৪ দিন আগে",
    comment:
      "মেয়েদের অনুভূতি, মানসিক প্রত্যাশা আর যত্নের বিষয়গুলো এত চমৎকার ও মার্জিত ভাষায় প্রকাশ করা হয়েছে যে পড়ে মুগ্ধ হয়েছি। প্রতিটি বিবাহিত দম্পতির বইটি অবশ্যই পড়া উচিত।",
  },
  {
    name: "ডা. আরিফুল ইসলাম",
    role: "চিকিৎসক (রাজশাহী)",
    rating: 5,
    date: "১ সপ্তাহ আগে",
    comment:
      "অক্সিটসিন হরমোন ও স্নায়বিক সংযোগের সাথে ভালোবাসার মেলবন্ধনটা দারুণভাবে তুলে ধরা হয়েছে। কোনো অশ্লীলতা নেই, পুরোপুরি বিজ্ঞান ও সম্পর্কের মনোবিজ্ঞান। ৯৯ টাকায় এমন জ্ঞান অমূল্য।",
  },
  {
    name: "মাহমুদ ও সাবরিনা",
    role: "নবদম্পতি (সিলেট)",
    rating: 5,
    date: "গত সপ্তাহে",
    comment:
      "নতুন জীবনের শুরুতে আমরা অনেক দ্বিধায় ছিলাম। এই বইটি আমাদের বোঝাপড়া ও মনের দূরত্ব এক নিমিষেই দূর করে দিয়েছে। পেমেন্ট করার পর সাথে সাথে PDF ডাউনলোড পেয়ে গিয়েছিলাম।",
  },
];

// Rotating social proof sales notifications
const RECENT_SALES = [
  { name: "রাকিব হাসান", city: "মিরপুর, ঢাকা", time: "৩ মিনিট আগে" },
  { name: "মেহেরুন নিসা", city: "ধানমন্ডি, ঢাকা", time: "৫ মিনিট আগে" },
  { name: "তানজিম আহমেদ", city: "জিইসি, চট্টগ্রাম", time: "৮ মিনিট আগে" },
  { name: "সাকিব ও ফারিয়া", city: "উপশহর, সিলেট", time: "১২ মিনিট আগে" },
  { name: "সৌমেন বিশ্বাস", city: "খুলনা সদর", time: "১৫ মিনিট আগে" },
];

// Sample preview text for the Look-Inside modal
const SAMPLE_PREVIEW_TEXT = {
  title: "কাছাকাছি থেকেও কেন একা লাগে? — ভালোবাসার শুরু",
  part: "অংশ ১: মনের টান ও ভালোবাসার মূল কথা (অধ্যায় ০১)",
  paragraphs: [
    "ভালোবাসায় শারীরিক দূরত্ব কোনো বাধা নয়, কিন্তু মনের সূক্ষ্ম দূরত্ব এক ছাদের নিচে থেকেও মানুষকে ভীষণ অচেনা আর একা করে দেয়। অনেক সম্পর্কে দেখা যায়—দুজনেই পাশাপাশি বসে আছেন, কিন্তু কারো মনে কারো প্রবেশাধিকার নেই। একে অপরের দিকে তাকিয়েও মনে হয় বহুদূরের কোনো অচেনা যাত্রী।",
    "স্পর্শ কেবল চামড়ার সাথে চামড়ার ঘর্ষণ নয়। স্পর্শ হলো এক স্নায়বিক সংলাপ। যখন একজন মানুষ আরেকজনকে নিরাপদ মনে করে, তখন একটি মৃদু ছোঁয়াও মস্তিস্কে 'অক্সিটসিন' ও 'এন্ডরফিন' হরমোনের স্রোত বইয়ে দেয়। আর যেখানে মানসিক ভয়, দ্বিধা বা সংকোচ থাকে—সেখানে প্রবল শারীরিক নৈকট্যও কেবল ক্লান্তি তৈরি করে।",
    "কেন কিছু স্পর্শ শব্দের চেয়েও গভীর? কারণ মানুষ শব্দের আগে স্পর্শ চিনেছে। মাতৃগর্ভ থেকে পৃথিবীতে আসার প্রথম মুহূর্তটিতে মানুষ ভালোবাসার ভাষা শিখেছে স্পর্শের মাধ্যমে। বড় হয়ে ওঠার পর আমরা অজান্তেই সেই নিরাপদ ছোঁয়াটাই আমাদের সঙ্গীর মধ্যে খুঁজে বেড়াই।",
    "এই বইটিতে আমরা শরীর ও মনের সেই গোপন সমীকরণটি জানব—যেখানে শরীর কেবল বাসনার মাধ্যম নয়, বরং মনকে ছুঁয়ে ফেলার এক পরম পবিত্র সেতু।",
  ],
};

export default function SporsherByakoronLandingPage() {
  const [openPartId, setOpenPartId] = useState<string | null>("part-1");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [currentSaleIdx, setCurrentSaleIdx] = useState(0);
  const [showSaleToast, setShowSaleToast] = useState(true);

  useEffect(() => {
    // Track ViewContent for eBook details page
    trackViewContent({
      content_name: BOOK_INFO.titleBn,
      content_ids: ["sporsher-byakoron"],
      content_type: "product",
      value: BOOK_INFO.offerPriceBdt || 99,
      currency: "BDT",
    });

    // Rotate sales notification toast every 8 seconds
    const interval = setInterval(() => {
      setCurrentSaleIdx((prev) => (prev + 1) % RECENT_SALES.length);
      setShowSaleToast(true);
    }, 8500);

    return () => clearInterval(interval);
  }, []);

  const scrollToCheckout = () => {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
  };

  const currentSale = RECENT_SALES[currentSaleIdx];

  return (
    <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] pb-24 sm:pb-0 transition-colors duration-200">
      {/* Top Banner Notice */}
      <div className="bg-[#80131E] text-white text-xs sm:text-sm py-2 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>সীমিত সময়ের স্পেশাল ক্যাম্পেইন: ৫৫% ছাড়ে এখন মাত্র ৯৯ টাকায় সম্পূর্ণ ই-বুক!</span>
        <button
          onClick={scrollToCheckout}
          className="underline decoration-amber-300 decoration-2 font-black hover:text-amber-200 cursor-pointer hidden md:inline"
        >
          সংগ্রহ করুন
        </button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#111827]/95 border-b border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Onuvuti-Publications-Logo.png"
                  alt="Onuvuti Publications"
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </div>
            </Link>
            <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">/</span>
            <span className="text-sm sm:text-base font-extrabold text-[#80131E] dark:text-rose-400 hidden sm:inline">
              {BOOK_INFO.titleBn}
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-2 text-xs font-bold text-stone-600 dark:text-stone-300">
            <a
              href="#why-read"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              কাদের জন্য?
            </a>
            <a
              href="#highlights"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              বইয়ের বিষয়বস্তু
            </a>
            <a
              href="#toc"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              সূচিপত্র
            </a>
            <a
              href="#reviews"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              পাঠক রিভিউ
            </a>
            <a
              href="#faq"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] dark:hover:bg-stone-800 hover:text-[#80131E] dark:hover:text-rose-400 transition"
            >
              প্রশ্নোত্তর
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              type="button"
              onClick={scrollToCheckout}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#80131E] text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:bg-[#630d16] active:scale-95 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>কিনুন • ৳{BOOK_INFO.offerPriceBn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:py-16 border-b border-stone-200/80 dark:border-stone-800 bg-gradient-to-b from-[#FFFDF9] via-[#FAF4E6]/40 to-[#FDF8F2] dark:from-[#0B0F17] dark:via-[#111827]/60 dark:to-[#0B0F17]">
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#80131E]/5 dark:bg-rose-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Visual Book Cover & Action Badges */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[320px] sm:max-w-[360px]">
                <BookCover3D />
              </div>

              {/* Trust Badges under Cover */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 w-full max-w-[340px] text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                  <Download className="w-4 h-4 text-[#80131E] dark:text-rose-400 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    তাৎক্ষণিক PDF ডাউনলোড
                  </p>
                  <p className="text-[9px] text-stone-500">পেমেন্টের সাথে সাথেই পাবেন</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                    ১০০% সুরক্ষিত ZiniPay
                  </p>
                  <p className="text-[9px] text-stone-500">বিকাশ / নগদ / রকেট</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Content & Sales Trigger */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#80131E]/10 dark:bg-rose-950/70 border border-[#80131E]/20 text-[#80131E] dark:text-rose-300 text-xs font-black">
                  <Flame className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
                  বেস্টসেলার ই-বুক • ১৮+ সচেতন পাঠকদের জন্য
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ৪.৯ / ৫.০ (১,২৫০+ তৃপ্ত পাঠক)
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-black text-[#80131E] dark:text-rose-400 leading-tight">
                  {BOOK_INFO.titleBn}
                </h1>
                <p className="text-xl sm:text-2xl font-extrabold text-[#142230] dark:text-white">
                  {BOOK_INFO.subtitleBn}
                </p>
                <p className="text-base sm:text-lg font-bold text-[#80131E]/90 dark:text-rose-300 italic pt-1">
                  “{BOOK_INFO.taglineBn}”
                </p>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {BOOK_INFO.descriptionBn}
              </p>

              {/* Highlights Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-left">
                {BOOK_INFO.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm text-[#142230] dark:text-stone-200 font-bold bg-white/70 dark:bg-[#161E2E]/70 p-2 rounded-xl border border-stone-200/60 dark:border-stone-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#80131E] dark:text-rose-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Price & CTA Container */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-baseline justify-center lg:justify-start gap-3">
                  <span className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 line-through font-semibold">
                    নিয়মিত মূল্য ৳{BOOK_INFO.regularPriceBn}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-[#80131E] dark:text-rose-400">
                    ৳{BOOK_INFO.offerPriceBn}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                    {BOOK_INFO.discountPercentBn}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
                  <button
                    type="button"
                    onClick={scrollToCheckout}
                    className="px-8 py-4 rounded-2xl bg-[#80131E] text-white font-black text-base sm:text-lg inline-flex items-center justify-center gap-3 shadow-xl shadow-[#80131E]/25 hover:bg-[#630d16] active:scale-95 transition cursor-pointer"
                  >
                    <span>এখনই সংগ্রহ করুন — ৳{BOOK_INFO.offerPriceBn}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="px-5 py-4 rounded-2xl bg-white dark:bg-[#161E2E] border border-stone-300 dark:border-stone-700 text-[#80131E] dark:text-rose-400 font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2 hover:bg-[#FAF4E6] dark:hover:bg-stone-800 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>ফ্রি নমুনা পড়ুন (লুক-ইনসাইড)</span>
                  </button>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 pt-1">
                  পেমেন্ট সম্পন্ন হওয়ার পর স্ক্রিনেই ডাউনলোড বাটন আসবে এবং আপনার ইমেইলেও বই পাঠানো হবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WHO IS THIS FOR? */}
      <section id="why-read" className="py-14 sm:py-20 bg-white dark:bg-[#111827] border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-black text-[#80131E] dark:text-rose-400 uppercase tracking-widest inline-flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              আত্মোপলব্ধি ও সম্পর্কের গভীরতা
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142230] dark:text-white leading-snug">
              কাদের জন্য এই বইটি পড়া অত্যন্ত জরুরি?
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
              সম্পর্ক টিকিয়ে রাখা কঠিন নয়, যদি আপনি স্পর্শ, মনস্তত্ত্ব ও ভালোবাসার অন্তর্নিহিত ভাষা বুঝতে জানেন।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800/80 space-y-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-[#80131E]/10 dark:bg-rose-950/70 text-[#80131E] dark:text-rose-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#142230] dark:text-white">
                দাম্পত্যে দূরত্ব বা একঘেয়েমি অনুভব করছেন?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                বছর পেরোতেই কি কথা কমে গেছে? স্পর্শ কেবল অভ্যাসে পরিণত হয়েছে? বইটি আপনাকে শেখাবে কীভাবে স্পর্শের মাধ্যমে আবার হারিয়ে যাওয়া তীব্র আকর্ষণ ও মানসিক নৈকট্য ফিরিয়ে আনা যায়।
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800/80 space-y-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-[#80131E]/10 dark:bg-rose-950/70 text-[#80131E] dark:text-rose-400 flex items-center justify-center">
                <Smile className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#142230] dark:text-white">
                সঙ্গীর অব্যক্ত আবেগের ভাষা বুঝতে চান?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                সব কথা মুখে বলা যায় না। চোখের চাহনি, শরীরের নীরব ভাষা ও স্পর্শের ব্যাকরণ না জানলে সঙ্গীর মনের অভিমান ও আকাঙ্ক্ষা অজানাই থেকে যায়। সেই সূক্ষ্ম সঙ্কেতগুলো বোঝার এক নির্ভরযোগ্য দিশা।
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800/80 space-y-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-[#80131E]/10 dark:bg-rose-950/70 text-[#80131E] dark:text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#142230] dark:text-white">
                নতুন দাম্পত্যের প্রস্তুতি নিচ্ছেন?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                যাদের সদ্য বিয়ে হয়েছে বা হতে যাচ্ছে—ভয়, দ্বিধা ও সংকোচ কাটিয়ে প্রথম দিন থেকেই একটি সুস্থ, শ্রদ্ধাপূর্ণ ও নিবিড় দাম্পত্য গড়ে তোলার বিজ্ঞানসম্মত গাইডলাইন পাবেন।
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800/80 space-y-3 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-[#80131E]/10 dark:bg-rose-950/70 text-[#80131E] dark:text-rose-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#142230] dark:text-white">
                রোমান্সকে আজীবন জীবন্ত ও তরতাজা রাখতে চান?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                ভালোবাসা শুধু শারীরিক তৃপ্তি নয়, এটি শরীর ও মনের এক আত্মিক মিলন। মানসিক নিরাপত্তা, বিশ্বাস আর পারস্পরিক যত্নে রোমান্সকে কীভাবে দীর্ঘস্থায়ী করবেন—তা জানবেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 CORE VALUE PILLARS */}
      <section id="highlights" className="py-14 sm:py-20 bg-[#FDF8F2] dark:bg-[#0B0F17] border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-black text-[#80131E] dark:text-rose-400 uppercase tracking-widest inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              অনন্য দৃষ্টিভঙ্গি ও গবেষণা
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142230] dark:text-white leading-snug">
              বইটিতে আপনি কী কী বৈপ্লবিক বিষয় জানবেন?
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base">
              গতানুগতিক ধারণার বাইরে গিয়ে আধুনিক মনস্তত্ত্ব ও বৈজ্ঞানিক তথ্যের মেলবন্ধন।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                ১
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#142230] dark:text-white">
                স্পর্শের বিজ্ঞান ও হরমোন
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                জড়িয়ে ধরা ও গভীর স্পর্শে কীভাবে অক্সিটসিন হরমোন নিঃসরণ হয় এবং দুজনের ভেতর গভীর আত্মবিশ্বাস ও প্রশান্তি গড়ে তোলে।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#80131E]/10 text-[#80131E] dark:text-rose-400 flex items-center justify-center font-black">
                ২
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#142230] dark:text-white">
                মানসিক নিরাপত্তা ও ট্রাস্ট
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                ভয়, তাড়াহুড়ো বা দ্বিধা থাকলে কেন শারীরিক ঘনিষ্ঠতায় আনন্দ পাওয়া যায় না এবং কীভাবে খোলামেলা নিরাপদ পরিবেশ তৈরি করবেন।
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                ৩
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#142230] dark:text-white">
                ডিজিটাল আসক্তি থেকে মুক্তি
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                মোবাইলের অতিরিক্ত ব্যবহার ও পর্নের বিকৃত প্রভাব থেকে মুক্ত হয়ে কীভাবে বাস্তব সঙ্গীর স্পর্শে প্রকৃত সুখ খুঁজে পাবেন।
              </p>
            </div>
          </div>

          {/* Look inside teaser banner */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[#FAF4E6] to-[#FFFBF5] dark:from-[#161E2E] dark:to-[#111827] border border-[#80131E]/20 dark:border-rose-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-extrabold text-[#80131E] dark:text-rose-400">
                বইটি কেনার আগে কিছু পাতা পড়ে দেখতে চান?
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                ভূমিকা ও ১ম অধ্যায়ের কিছু অংশ এখনই সম্পূর্ণ বিনামূল্যে পড়ুন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-6 py-3 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:bg-[#630d16] transition cursor-pointer shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>নমুনা পড়ুন (Look Inside)</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: TABLE OF CONTENTS (ACCORDION) */}
      <section id="toc" className="py-14 sm:py-20 bg-white dark:bg-[#111827] border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-[#80131E] dark:text-rose-400 uppercase tracking-widest inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              সুনির্দিষ্ট সূচিপত্র
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142230] dark:text-white">
              ৪টি অংশ, ১৮টি অধ্যায় ও ৪টি বিশেষ পরিশিষ্ট
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm">
              প্রতিটি অধ্যায় লেখা হয়েছে বাস্তব জীবনের সমস্যা ও তার কার্যকর সমাধান নিয়ে।
            </p>
          </div>

          <div className="space-y-3.5">
            {BOOK_PARTS.map((part) => {
              const isOpen = openPartId === part.id;
              return (
                <div
                  key={part.id}
                  className="rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenPartId(isOpen ? null : part.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF4E6]/60 dark:hover:bg-stone-800/60 transition"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-[#80131E] dark:text-rose-400 block mb-0.5">
                        {part.partNumberBn}
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#142230] dark:text-white">
                        {part.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-stone-500 font-semibold hidden sm:inline">
                        {part.chapters.length}টি অধ্যায়
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-stone-500 dark:text-stone-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-3 border-t border-stone-200/70 dark:border-stone-800 space-y-2.5 bg-white dark:bg-[#111827]">
                      {part.chapters.map((ch) => (
                        <div
                          key={ch.numberEn}
                          className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex items-start gap-2.5 py-1.5 border-b border-stone-100 dark:border-stone-800/60 last:border-b-0"
                        >
                          <span className="font-bold text-[#80131E] dark:text-rose-400 shrink-0 bg-[#80131E]/5 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                            অধ্যায় {ch.numberBn}
                          </span>
                          <span className="leading-relaxed font-medium">{ch.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 4 Appendices Summary */}
            <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#161E2E] border border-amber-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm font-black text-[#80131E] dark:text-rose-400 inline-flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>বিশেষ বোনাস সংযোজন (৪টি প্র্যাকটিক্যাল পরিশিষ্ট)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                  বইয়ের সাথে অন্তর্ভুক্ত
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium pt-1">
                {APPENDICES.map((app, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-stone-200/70 dark:border-stone-800"
                  >
                    <Check className="w-4 h-4 text-[#80131E] dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: READER REVIEWS & SOCIAL PROOF */}
      <section id="reviews" className="py-14 sm:py-20 bg-[#FDF8F2] dark:bg-[#0B0F17] border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-black text-[#80131E] dark:text-rose-400 uppercase tracking-widest inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              পাঠকের ভালোবাসা ও মতামত
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142230] dark:text-white">
              যাঁরা বইটি পড়েছেন, তাঁরা কী বলছেন?
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm">
              আমাদের নিয়মিত পাঠকদের সতস্ফূর্ত প্রতিক্রিয়া ও অনুভূতির কিছু চিত্র।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {READER_REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 font-medium">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">
                  “{rev.comment}”
                </p>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white">
                      {rev.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">{rev.role}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    ভেরিফায়েড ক্রেতা
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="py-14 sm:py-16 bg-white dark:bg-[#111827] border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-black text-[#80131E] dark:text-rose-400 uppercase tracking-widest">
              অত্যন্ত সহজ প্রক্রিয়া
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#142230] dark:text-white">
              মাত্র ৩টি ধাপে এখনই বইটি সংগ্রহ করুন
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#80131E] text-white font-black mx-auto flex items-center justify-center text-sm">
                ১
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#142230] dark:text-white">
                তথ্য পূরণ করুন
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                নিচের ফর্মে আপনার নাম, ইমেইল ও মোবাইল নম্বর লিখুন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#80131E] text-white font-black mx-auto flex items-center justify-center text-sm">
                ২
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#142230] dark:text-white">
                ৯৯ টাকা পেমেন্ট করুন
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                বিকাশ, নগদ, রকেট বা উপায় দিয়ে স্বয়ংক্রিয়ভাবে পেমেন্ট করুন।
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black mx-auto flex items-center justify-center text-sm">
                ৩
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#142230] dark:text-white">
                তাৎক্ষণিক ডাউনলোড
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                পেমেন্ট শেষ হতেই স্ক্রিনে ১-ক্লিকে ফুল PDF পেয়ে যাবেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: DIRECT CHECKOUT SECTION */}
      <section id="checkout" className="py-14 sm:py-20 bg-[#FDF8F2] dark:bg-[#0B0F17] relative">
        <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#80131E]/10 dark:bg-rose-950/70 text-[#80131E] dark:text-rose-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>নিরাপদ ও সহজ পেমেন্ট গেটওয়ে</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142230] dark:text-white">
              পেমেন্ট ও ইনস্ট্যান্ট ডাউনলোড
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              বিকাশ, নগদ, রকেট বা যেকোনো মোবাইল ব্যাংকিং দিয়ে পেমেন্ট করুন।
            </p>
          </div>

          {/* Checkout Card Container */}
          <div className="rounded-3xl bg-white dark:bg-[#111827] border-2 border-[#80131E]/20 dark:border-rose-950 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Discount Badge Ribbon */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs">
              ৫৫% ছাড় চলছে
            </div>

            <div className="mb-6 space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                পণ্য: {BOOK_INFO.titleBn} (পিডিএফ ই-বুক)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#80131E] dark:text-rose-400">
                  ৳{BOOK_INFO.offerPriceBn}
                </span>
                <span className="text-sm text-stone-400 line-through">
                  ৳{BOOK_INFO.regularPriceBn}
                </span>
              </div>
            </div>

            <ZiniPayCheckout />
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ ACCORDION */}
      <section id="faq" className="py-14 sm:py-20 bg-white dark:bg-[#111827] border-t border-stone-200/80 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-[#80131E] dark:text-rose-400 uppercase tracking-widest inline-flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              সচরাচর জিজ্ঞাসিত প্রশ্ন
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#142230] dark:text-white">
              আপনার মনে কোনো প্রশ্ন আছে?
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "পেমেন্ট করার পর আমি বইটি কীভাবে পাব?",
                a: "পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই ব্রাউজারে একটি 'ডাউনলোড করুন' বাটন দেখতে পাবেন। সেখানে চাপ দিলেই আপনার ফোনে বা কম্পিউটারে সম্পূর্ণ PDF ফাইলটি সেভ হয়ে যাবে। একই সাথে আপনার দেওয়া ইমেইলেও ডাউনলোড লিঙ্ক পৌঁছে যাবে।",
              },
              {
                q: "মোবাইলে বা ট্যাবলেটে কি সহজে পড়া যাবে?",
                a: "হ্যাঁ, সম্পূর্ণ বইটি আধুনিক মোবাইল ফ্রেন্ডলি ও স্পষ্ট বাংলা ফন্টে লেআউট করা। যেকোনো স্মার্টফোন, ট্যাবলেট কিংবা ল্যাপটপে খুব সহজেই জুম করে কোনো সমস্যা ছাড়াই পড়তে পারবেন।",
              },
              {
                q: "পেমেন্ট পদ্ধতি কি শতভাগ নিরাপদ?",
                a: "অবশ্যই। আমাদের পেমেন্ট পার্টনার ZiniPay বাংলাদেশ ব্যাংক অনুমোদিত এনক্রিপ্টেড পেমেন্ট গেটওয়ে ব্যবহার করে। আপনার কোনো গোপন পিন বা পাসওয়ার্ড আমাদের কাছে জমা থাকে না।",
              },
              {
                q: "কোনো সমস্যা হলে সাহায্য পাওয়ার উপায় কী?",
                a: "পেমেন্ট বা ডাউনলোড সংক্রান্ত যেকোনো প্রয়োজনে অনুভূতি পাবলিকেশন্সের সাপোর্ট টিমের সাথে তাৎক্ষণিক যোগাযোগ করতে পারবেন। ওয়েবসাইটের যোগাযোগ অপশন অথবা আমাদের ফেসবুক পেজে ইনবক্স করলেই সাপোর্ট টিম সাহায্য করবে।",
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200 dark:border-stone-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF4E6]/60 dark:hover:bg-stone-800/60 transition"
                  >
                    <span className="font-bold text-sm sm:text-base text-[#142230] dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-500 shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-200/60 dark:border-stone-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-10 text-xs text-stone-500 dark:text-stone-400 bg-[#FDF8F2] dark:bg-[#0B0F17]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-10 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white/10 dark:p-1 dark:rounded-xl"
            />
            <div>
              <p className="font-bold text-[#142230] dark:text-white">
                অনুভূতি পাবলিকেশন্স (Onuvuti.site)
              </p>
              <p className="text-[11px] text-stone-500">
                মনস্তত্ত্ব, সম্পর্ক ও সুস্থ জীবনদর্শনের নির্ভরযোগ্য প্ল্যাটফর্ম।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>নিরাপদ পেমেন্ট পার্টনার: ZiniPay</span>
            </span>
            <span>•</span>
            <Link href="/" className="hover:text-[#80131E] transition">
              হোমপেজ
            </Link>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-[#80131E] dark:text-rose-400">
            ৳{BOOK_INFO.offerPriceBn}
          </span>
          <span className="text-xs text-stone-400 line-through">
            ৳{BOOK_INFO.regularPriceBn}
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px]">
            {BOOK_INFO.discountPercentBn}
          </span>
        </div>
        <button
          type="button"
          onClick={scrollToCheckout}
          className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>এখনই সংগ্রহ করুন</span>
        </button>
      </div>

      {/* FLOATING LIVE SOCIAL PROOF TOAST */}
      {showSaleToast && currentSale && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 max-w-[280px] sm:max-w-[320px] bg-white dark:bg-[#161E2E] border border-stone-200 dark:border-stone-700/80 rounded-2xl shadow-xl p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-9 h-9 rounded-full bg-[#80131E]/10 dark:bg-rose-950/70 text-[#80131E] dark:text-rose-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#142230] dark:text-white truncate">
              {currentSale.name} ({currentSale.city})
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              এইমাত্র বইটি সংগ্রহ করেছেন • {currentSale.time}
            </p>
          </div>
          <button
            onClick={() => setShowSaleToast(false)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 shrink-0 p-1"
            aria-label="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* LOOK-INSIDE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#111827] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-[#161E2E]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#142230] dark:text-white">
                    লুক-ইনসাইড (ফ্রি নমুনা পড়া)
                  </h3>
                  <p className="text-[11px] text-stone-500">{SAMPLE_PREVIEW_TEXT.part}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content (Reading Excerpt) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 font-serif text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200">
              <h4 className="text-lg sm:text-xl font-sans font-black text-[#80131E] dark:text-rose-400 mb-3 border-b border-stone-200 dark:border-stone-800 pb-2">
                {SAMPLE_PREVIEW_TEXT.title}
              </h4>
              {SAMPLE_PREVIEW_TEXT.paragraphs.map((p, idx) => (
                <p key={idx} className="indent-4 text-justify">
                  {p}
                </p>
              ))}

              <div className="mt-8 p-4 rounded-2xl bg-[#FAF4E6] dark:bg-[#161E2E] border border-amber-200 dark:border-stone-800 text-center space-y-2 font-sans">
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  এটি বইটির ১ম অধ্যায়ের সংক্ষিপ্ত একটি নমুনা। বাকি ১৭টি বৈপ্লবিক অধ্যায় ও ৪টি পরিশিষ্ট পড়তে এখনই সংগ্রহ করুন।
                </p>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 sm:p-5 border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#161E2E] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-[#80131E] dark:text-rose-400">
                  মাত্র ৳{BOOK_INFO.offerPriceBn}
                </span>
                <span className="text-xs text-stone-400 line-through">
                  ৳{BOOK_INFO.regularPriceBn}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  scrollToCheckout();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#80131E] text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-md hover:bg-[#630d16] transition cursor-pointer"
              >
                <span>পুরো বইটি এখনই নিন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
