"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface CategoryGridProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function CategoryGrid({
  activeCategory,
  onSelectCategory,
}: CategoryGridProps) {
  const categoriesList = [
    {
      icon: "❤️",
      title: "ক্রাশ ও কনফেশন",
      subtitle: "গোপন ভালো লাগা, প্রথম প্রেম",
      cat: "ক্রাশ ও কনফেশন",
    },
    {
      icon: "💔",
      title: "বিচ্ছেদ ও প্রাক্তন",
      subtitle: "Breakup, স্মৃতি, ফিরে পাওয়া",
      cat: "বিচ্ছেদ ও প্রাক্তন",
    },
    {
      icon: "📖",
      title: "রোমান্টিক গল্প",
      subtitle: "প্রেমের নানা গল্প",
      cat: "রোমান্টিক গল্প",
    },
    {
      icon: "⛅",
      title: "জীবনের গল্প",
      subtitle: "পরিবার, বন্ধুত্ব, অভিজ্ঞতা",
      cat: "জীবনের গল্প",
    },
    {
      icon: "✉️",
      title: "না বলা কথা",
      subtitle: "Anonymous চিঠি",
      cat: "না বলা কথা",
    },
    {
      icon: "🧠",
      title: "সম্পর্ক ও মনস্তত্ত্ব",
      subtitle: "Psychology, Healing",
      cat: "সম্পর্ক ও মনস্তত্ত্ব",
    },
    {
      icon: "🌱",
      title: "নিজেকে জানুন",
      subtitle: "Self-growth ও প্রশান্তি",
      cat: "নিজেকে জানুন",
    },
    {
      icon: "✏️",
      title: "খোলা চিঠি",
      subtitle: "কাউকে উদ্দেশ্য করে",
      cat: "খোলা চিঠি",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
          <span>বিষয়ভিত্তিক গল্পগুলো</span>
        </h2>
        <button
          type="button"
          onClick={() => {
            onSelectCategory("সকল গল্প");
            document
              .getElementById("stories-feed")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline cursor-pointer"
        >
          সব বিভাগ দেখুন →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {categoriesList.map((catItem) => {
          const isSelected = activeCategory === catItem.cat;
          return (
            <div
              key={catItem.title}
              onClick={() => {
                onSelectCategory(catItem.cat);
                document
                  .getElementById("stories-feed")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 group hover:shadow-xs ${
                isSelected
                  ? "border-[#7E151E] bg-[#FAF4E6] dark:bg-[#1E293B]"
                  : "border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#111827] hover:border-[#7E151E]/40"
              }`}
            >
              <span className="text-2xl shrink-0 group-hover:scale-110 transition duration-200">
                {catItem.icon}
              </span>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition leading-snug">
                  {catItem.title}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-tight">
                  {catItem.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
