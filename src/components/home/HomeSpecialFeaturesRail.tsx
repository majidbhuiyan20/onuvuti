"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Gift,
  BookOpen,
  ArrowRight,
  MessageSquareHeart,
  Cake,
  Heart,
  Clock,
} from "lucide-react";

export default function HomeSpecialFeaturesRail() {
  return (
    <section
      aria-label="অনুভূতির বিশেষ ফিচারসমূহ"
      className="w-full space-y-3"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7E151E] dark:bg-rose-400 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
            বিশেষ ফিচার ও উপহার
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-[#7E151E] dark:text-rose-400">
          নতুন ও ট্রেন্ডিং
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: গোপন অনুভূতি ও বেনামী বার্তা (/m) */}
        <div className="group rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-rose-50/90 via-white to-amber-50/60 dark:from-[#1E1418] dark:via-[#131926] dark:to-[#17121C] border border-rose-200/80 dark:border-rose-900/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 dark:bg-rose-950/70 text-[#7E151E] dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-extrabold shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#7E151E] dark:text-rose-400" />
                <span>NGL স্টাইল বেনামী বার্তা</span>
              </span>
              <span className="text-[10px] font-mono text-rose-700/80 dark:text-rose-400 font-bold">
                ১০০% গোপন
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-[#142230] dark:text-white leading-snug group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition">
                আমাকে যা বলতে চাও, গোপনে বলো...
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                আপনার নিজস্ব সিক্রেট লিঙ্ক বানিয়ে ফেসবুক ও ইনস্টাগ্রাম স্টোরিতে দিন। এইচডি স্টোরি স্টিকার ডাউনলোড করুন।
              </p>
            </div>
          </div>

          <div className="pt-1 relative z-10">
            <Link
              href="/m"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7E151E] to-rose-700 hover:opacity-95 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
            >
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>নিজের বেনামী লিংক বানান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: ডিজিটাল চিঠি ও কাউন্টডাউন নিমন্ত্রণ কার্ড (/birthday-wish) */}
        <div className="group rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 dark:from-[#1F1910] dark:via-[#131926] dark:to-[#181512] border border-amber-200/80 dark:border-amber-900/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-[11px] font-extrabold shadow-2xs">
                <Gift className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>ডিজিটাল উপহার ও চিঠি</span>
              </span>
              <span className="text-[10px] font-mono text-amber-800/80 dark:text-amber-300 font-bold">
                মিডনাইট আনলক
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-[#142230] dark:text-white leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                প্রিয়জনের জন্য সারপ্রাইজ চিঠি
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                ভার্চুয়াল কেক কাটিং, মোমের সিল, অডিও ভয়েস বার্তা ও কাউন্টডাউন টাইমার সহ জন্মদিন ও বিবাহবার্ষিকীর চিঠি।
              </p>
            </div>
          </div>

          <div className="pt-1 relative z-10">
            <Link
              href="/birthday-wish"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B48421] to-[#C59B27] hover:opacity-95 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
            >
              <Cake className="w-3.5 h-3.5" />
              <span>সারপ্রাইজ চিঠি তৈরি করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: স্পর্শের ব্যাকরণ ই-বুক (/sporsher-byakoron) */}
        <div className="group rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/50 dark:from-[#101C17] dark:via-[#131926] dark:to-[#161D15] border border-emerald-200/70 dark:border-emerald-900/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold shadow-2xs">
                <BookOpen className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                <span>বেস্টসেলার ই-বুক</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7E151E] text-white font-bold">
                ১৯০৳
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black text-[#142230] dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                স্পর্শের ব্যাকরণ (অনলাইন এডিশন)
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                ভালোবাসা, মনস্তত্ত্ব ও না বলা অনুভূতির গভীর পাঠ। মোবাইল বা ল্যাপটপে যেকোনো সময় সরাসরি পড়তে পারবেন।
              </p>
            </div>
          </div>

          <div className="pt-1 relative z-10">
            <Link
              href="/sporsher-byakoron"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-[#124b37] hover:opacity-95 text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>বইয়ের বিস্তারিত ও পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
