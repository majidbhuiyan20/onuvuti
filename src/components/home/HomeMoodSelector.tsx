"use client";

import React, { useState } from "react";
import {
  Heart,
  HeartPulse,
  Sparkles,
  Flame,
  Compass,
  Quote,
  X,
  ArrowRight,
} from "lucide-react";

export interface MoodItem {
  id: string;
  labelBn: string;
  category: string;
  icon: React.ReactNode;
  bgLight: string;
  bgDark: string;
  textColor: string;
  borderColor: string;
  quote: string;
  author: string;
}

const MOODS: MoodItem[] = [
  {
    id: "love",
    labelBn: "প্রেম ও ভালোবাসা",
    category: "রোমান্টিক গল্প",
    icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />,
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-rose-950/40",
    textColor: "text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-200 dark:border-rose-900",
    quote: "“কিছু প্রেম নীরবে এসে দাঁড়ায়, সারাজীবন থেকে যায় মনের গভীরে।”",
    author: "অনুভূতির ডায়রি",
  },
  {
    id: "pain",
    labelBn: "অভিমান ও বিরহ",
    category: "বিচ্ছেদ ও প্রাক্তন",
    icon: <HeartPulse className="w-4 h-4 text-purple-500" />,
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-950/40",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-900",
    quote: "“যে বিচ্ছেদ তোমাকে ভেঙে দেয়, সে বিচ্ছেদই তোমাকে নতুন করে গড়ে তোলে।”",
    author: "স্পর্শের ব্যাকরণ",
  },
  {
    id: "confession",
    labelBn: "ক্রাশ ও না বলা কথা",
    category: "ক্রাশ ও কনফেশন",
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-amber-950/40",
    textColor: "text-amber-800 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-900",
    quote: "“সব অনুভূতির উচ্চারণ থাকে না, কিছু ভালোবাসা চোখের ভাষাতেই অমূল্য।”",
    author: "একজন বেনামী পাঠক",
  },
  {
    id: "motivation",
    labelBn: "অনুপ্রেরণা ও আত্মবিশ্বাস",
    category: "অনুপ্রেরণামূলক গল্প",
    icon: <Flame className="w-4 h-4 text-orange-500" />,
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-950/40",
    textColor: "text-orange-800 dark:text-orange-300",
    borderColor: "border-orange-200 dark:border-orange-900",
    quote: "“ঝড় থামার পর যখন আকাশ হাসে, তখন বোঝা যায় ধৈর্যের চেয়ে সুন্দর কিছু নেই।”",
    author: "জীবন দর্শন",
  },
  {
    id: "solitude",
    labelBn: "একাকীত্ব ও স্মৃতি",
    category: "জীবনের গল্প",
    icon: <Compass className="w-4 h-4 text-sky-500" />,
    bgLight: "bg-sky-50",
    bgDark: "dark:bg-sky-950/40",
    textColor: "text-sky-800 dark:text-sky-300",
    borderColor: "border-sky-200 dark:border-sky-900",
    quote: "“একাকীত্ব কোনো সাজা নয়, নিজেকে নতুন করে আবিষ্কারের এক শান্ত প্রহর।”",
    author: "অনুভূতি সম্পাদনা পর্ষদ",
  },
];

interface HomeMoodSelectorProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function HomeMoodSelector({
  activeCategory,
  onSelectCategory,
}: HomeMoodSelectorProps) {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const selectedMood = MOODS.find((m) => m.id === selectedMoodId);

  const handleMoodClick = (mood: MoodItem) => {
    if (selectedMoodId === mood.id) {
      setSelectedMoodId(null);
      onSelectCategory("সকল গল্প");
    } else {
      setSelectedMoodId(mood.id);
      onSelectCategory(mood.category);
      document
        .getElementById("stories-feed")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setSelectedMoodId(null);
    onSelectCategory("সকল গল্প");
  };

  return (
    <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#142230] dark:text-white flex items-center gap-2">
            <Quote className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
            <span>আজকে আপনার অনুভূতি কেমন?</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            আপনার বর্তমান মেজাজ বেছে নিন—সেই অনুভূতির সেরা গল্প ও শান্তিদায়ক বার্তা খুঁজে পাবেন।
          </p>
        </div>

        {selectedMoodId && (
          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-auto text-xs font-bold text-[#80131E] dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>সব গল্পে ফিরুন</span>
          </button>
        )}
      </div>

      {/* Mood Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5">
        {MOODS.map((mood) => {
          const isSelected = selectedMoodId === mood.id;

          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => handleMoodClick(mood)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? `bg-[#80131E] text-white border-[#80131E] shadow-sm scale-102`
                  : `${mood.bgLight} ${mood.bgDark} ${mood.borderColor} hover:border-[#80131E]/40`
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`p-1.5 rounded-xl ${
                    isSelected ? "bg-white/20 text-white" : "bg-white dark:bg-stone-900"
                  }`}
                >
                  {mood.icon}
                </span>
                {isSelected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-[#80131E] font-extrabold">
                    সক্রিয়
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-bold ${
                  isSelected ? "text-white" : "text-stone-800 dark:text-stone-200"
                }`}
              >
                {mood.labelBn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empathetic Quote Reveal Bubble */}
      {selectedMood && (
        <div className="rounded-2xl bg-gradient-to-r from-[#FAF4E6] to-[#FDF8F2] dark:from-[#1E293B] dark:to-[#0B0F17] border border-[#C59B27]/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#80131E] dark:text-rose-400">
              আপনার অনুভূতির প্রতিচ্ছবি:
            </span>
            <p className="text-sm font-serif font-bold text-stone-900 dark:text-white leading-relaxed">
              {selectedMood.quote}
            </p>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              — {selectedMood.author}
            </span>
          </div>

          <a
            href="#stories-feed"
            className="shrink-0 px-3.5 py-2 rounded-xl bg-[#80131E] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#680f18] transition shadow-xs"
          >
            <span>{selectedMood.labelBn} গল্পগুলো দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </section>
  );
}

