"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { CATEGORIES_DATA } from "@/data/categoryData";

interface CategoryGridProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function CategoryGrid({
  activeCategory,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
          <span>বিষয়ভিত্তিক গল্পগুলো</span>
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/tips"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            🌿 ওয়েলনেস টিপস
          </Link>
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
            সব গল্প দেখুন →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {CATEGORIES_DATA.map((catItem) => {
          const isSelected = activeCategory === catItem.nameBn;
          return (
            <Link
              key={catItem.slug}
              href={`/category/${catItem.slug}`}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-2 group hover:shadow-sm ${
                isSelected
                  ? "border-[#7E151E] bg-[#FAF4E6] dark:bg-[#1E293B]"
                  : "border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#111827] hover:border-[#7E151E]/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 group-hover:scale-110 transition duration-200">
                  {catItem.icon}
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition leading-snug">
                    {catItem.nameBn}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-tight line-clamp-1">
                    {catItem.badgeBn}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#7E151E] dark:text-stone-600 dark:group-hover:text-rose-400 shrink-0 transition" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
