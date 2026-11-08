"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Gift,
  BookOpen,
  PenLine,
  Users,
  Shuffle,
  Mail,
  ArrowRight,
} from "lucide-react";
import { BOOK_INFO } from "@/data/bookData";

interface HomeQuickActionsProps {
  onOpenSubmit: () => void;
  onSurpriseRandom: () => void;
}

export default function HomeQuickActions({
  onOpenSubmit,
  onSurpriseRandom,
}: HomeQuickActionsProps) {
  return (
    <section
      aria-label="দ্রুত অ্যাকশন বার"
      className="w-full rounded-2xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 p-2 sm:p-2.5 shadow-xs transition-all"
    >
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Write Confession / Story */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="px-3.5 py-2 rounded-xl bg-[#80131E] hover:bg-[#680f18] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs hover:shadow-md cursor-pointer shrink-0"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>গল্প বা কনফেশন লিখুন</span>
          </button>

          {/* Birthday Wish Letter */}
          <Link
            href="/birthday-wish"
            className="px-3.5 py-2 rounded-xl bg-[#FAF4E6] dark:bg-[#1E293B] hover:bg-[#F2E8D2] text-[#80131E] dark:text-rose-300 border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Gift className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>ডিজিটাল চিঠি ও নিমন্ত্রণ কার্ড</span>
          </Link>

          {/* Surprise Random Story */}
          <button
            type="button"
            onClick={onSurpriseRandom}
            className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
            title="যেকোনো একটি গল্প পড়ুন"
          >
            <Shuffle className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>এলোমেলো গল্প পড়ুন</span>
          </button>

          {/* Sporsher Byakoron eBook */}
          <Link
            href="/sporsher-byakoron"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 dark:from-stone-800 dark:to-rose-950/40 hover:from-amber-100 hover:to-rose-100 border border-amber-300/60 dark:border-stone-700 text-[#80131E] dark:text-rose-300 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>স্পর্শের ব্যাকরণ (ই-বুক)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#80131E] text-white font-black">
              {BOOK_INFO.offerPriceBn}৳
            </span>
          </Link>

          {/* Secret Anonymous Letter / Messaging */}
          <Link
            href="/m"
            className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shrink-0"
          >
            <Mail className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>বেনামী ইনবক্স</span>
          </Link>
        </div>

        {/* Live Reader Activity Indicator */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-stone-200 dark:border-stone-800 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
            <Users className="w-3 h-3 text-stone-400" />
            <span>৩ শতাধিক পাঠক এখন অনুভব করছেন</span>
          </div>
        </div>
      </div>
    </section>
  );
}

