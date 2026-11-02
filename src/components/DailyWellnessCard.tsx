"use client";

import React, { useState } from "react";
import { HeartPulse, Sparkles, RefreshCw, Check, Share2 } from "lucide-react";

interface WellnessTip {
  category: "মানসিক স্বাস্থ্য" | "সম্পর্কের যত্ন" | "শারীরিক সুস্থতা";
  title: string;
  tip: string;
  actionNote: string;
}

const WELLNESS_TIPS: WellnessTip[] = [
  {
    category: "মানসিক স্বাস্থ্য",
    title: "উদ্বেগ ও মন খারাপের অ্যান্টিডোট",
    tip: "কখনো অতিরিক্ত মানসিক চাপ অনুভব করলে '৪-৭-৮' শ্বাস-প্রশ্বাস চর্চা করুন: ৪ সেকেন্ড নাক দিয়ে বুক ভরে শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন এবং ৮ সেকেন্ডে ধীরে ধীরে মুখ দিয়ে শ্বাস ছাড়ুন।",
    actionNote: "এটি মস্তিষ্কের প্যারাসিম্প্যাথেটিক নার্ভাস সিস্টেম সচল করে তাৎক্ষণিক প্রশান্তি দেয়।",
  },
  {
    category: "সম্পর্কের যত্ন",
    title: "ডিজিটাল ডিটক্স ও গভীর যোগাযোগ",
    tip: "প্রিয় মানুষটির সাথে দূরত্ব কমাতে প্রতিদিন অন্তত ১৫-২০ মিনিট সব ধরনের ফোন বা ল্যাপটপ দূরে রেখে একে অপরের চোখের দিকে তাকিয়ে কথা বলুন।",
    actionNote: "শারীরিক উপস্থিতির চেয়েও মানসিক মনোযোগ সম্পর্ককে গভীর ও চিরস্থায়ী করে।",
  },
  {
    category: "শারীরিক সুস্থতা",
    title: "গভীর ঘুম ও মেজাজ নিয়ন্ত্রণ",
    tip: "ঘুমানোর অন্তত ৪৫ মিনিট আগে মোবাইল স্ক্রিন বন্ধ রাখুন। নীল আলো (Blue Light) মস্তিষ্কে মেলাটোনিন হরমোন উৎপাদনে বাধা দেয়, যা ক্লান্তি ও মেজাজ খিটখিটে হওয়ার প্রধান কারণ।",
    actionNote: "ভালো ঘুম বিষণ্ণতা ও মানসিক অবসাদ ৫০% পর্যন্ত কমিয়ে আনে।",
  },
  {
    category: "মানসিক স্বাস্থ্য",
    title: "অনুভূতির মুক্তি ও আত্ম-ভালোবাসা",
    tip: "কষ্টের অনুভূতি বা কান্না জোর করে বুকের ভেতর আটকে রাখবেন না। কান্না কোনো দুর্বলতা নয়; কান্নার মাধ্যমে শরীর কর্টিসল (মানসিক চাপের হরমোন) শরীর থেকে বের করে দেয়।",
    actionNote: "নিজের ভেতরের দুর্বলতাকে স্বীকার করতে পারাটাই প্রকৃত মানসিক শক্তির লক্ষণ।",
  },
  {
    category: "সম্পর্কের যত্ন",
    title: "মানসিক নিরাপত্তা তৈরি",
    tip: "সঙ্গীর ব্যক্তিগত দুর্বলতা বা গোপন কথা কখনোই রাগের মুহূর্তে অস্ত্র হিসেবে ব্যবহার করবেন না। সুস্থ সম্পর্কে ক্ষমা ও সম্মানের স্থান সবার উপরে।",
    actionNote: "মানুষ সেখানেই নিজেকে সঁপে দেয়, যেখানে সে বিচারহীনভাবে নিরাপদ অনুভব করে।",
  },
  {
    category: "শারীরিক সুস্থতা",
    title: "সকালের রোদ ও ইতিবাচক শক্তি",
    tip: "প্রতিদিন সকালে অন্তত ১০ মিনিট ভোরের নরম রোদে দাঁড়িয়ে হালকা হাঁটাহাঁটি করুন। ভিটামিন ডি ও প্রাকৃতিক আলো মস্তিষ্কে সেরোটোনিন হরমোন ক্ষরণ বাড়ায়।",
    actionNote: "দিনটি ইতিবাচক ও মন শান্ত রাখার সবচেয়ে সহজ ও প্রাকৃতিক উপায় এটি।",
  },
];

export default function DailyWellnessCard() {
  const [tipIndex, setTipIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = WELLNESS_TIPS[tipIndex];

  const handleNext = () => {
    setTipIndex((prev) => (prev + 1) % WELLNESS_TIPS.length);
    setCopied(false);
  };

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      const text = `${current.title} (${current.category})\n\n“${current.tip}”\n— ${current.actionNote}\n\nপড়ুন অনুভূতি-তে: https://www.onuvuti.site`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#FAF4E6] to-[#FDF8F2] dark:from-[#131C2E] dark:to-[#0F172A] border border-[#C59B27]/40 dark:border-[#C59B27]/30 p-5 sm:p-6 space-y-4 shadow-xs relative overflow-hidden transition-all">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#80131E]/5 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/60 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#80131E] dark:bg-rose-600 text-white flex items-center justify-center shadow-2xs">
            <HeartPulse className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#80131E] dark:text-rose-400">
              অনুভূতি হেলথ ও ওয়েলনেস
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white flex items-center gap-1.5">
              <span>দৈনিক সুস্থতা ও মনস্তত্ত্ব টিপস</span>
            </h3>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-stone-700 text-[#80131E] dark:text-rose-300">
          {current.category}
        </span>
      </div>

      {/* Tip Content */}
      <div className="space-y-2">
        <h4 className="text-sm sm:text-base font-extrabold text-[#80131E] dark:text-rose-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{current.title}</span>
        </h4>
        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
          “{current.tip}”
        </p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
          💡 বিশেষ তথ্য: {current.actionNote}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 text-xs">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold hover:bg-[#80131E] hover:text-white hover:border-[#80131E] transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>পরবর্তী টিপস</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500 hover:text-[#80131E] dark:text-stone-400 dark:hover:text-rose-400 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3" />
              <span>টিপস শেয়ার</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
