"use client";

import React from "react";
import { Sparkles, PenLine, ArrowRight } from "lucide-react";

interface HomeHeroProps {
  onOpenSubmit: () => void;
}

export default function HomeHero({ onOpenSubmit }: HomeHeroProps) {
  return (
    <section className="rounded-3xl bg-[#FAF6EE] dark:bg-[#121927] border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-xs relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        {/* Left Content Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF0DC] dark:bg-[#1E293B] border border-[#C59B27]/40 text-[#7E151E] dark:text-rose-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>যেখানে প্রতিটি অনুভূতির একটি গল্প আছে</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#142230] dark:text-white leading-[1.25] tracking-tight font-serif">
            কিছু কথা বলা হয় না, <br />
            <span className="text-[#7E151E] dark:text-rose-400 font-serif">
              শুধু অনুভব করা যায়।
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium max-w-lg">
            তোমার ভালোবাসা, অভিমান, স্মৃতি কিংবা না বলা কথাগুলো জায়গা পাক অনুভূতির পাতায়।
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onOpenSubmit}
              className="px-6 py-3 rounded-full bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>নিজের গল্প লিখুন</span>
            </button>

            <a
              href="#stories-feed"
              className="px-6 py-3 rounded-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-[#142230] dark:text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 hover:border-[#7E151E] hover:text-[#7E151E] dark:hover:text-rose-400 transition cursor-pointer shadow-2xs"
            >
              <span>গল্প পড়ুন</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Slider Dots */}
          <div className="flex items-center gap-2 pt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7E151E] dark:bg-rose-400" />
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>
        </div>

        {/* Right Sunset Contemplation Visual Column */}
        <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full min-h-[320px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            alt="সূর্যাস্তের অনুভূতি"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#FAF6EE] via-transparent to-transparent dark:from-[#121927] opacity-80 lg:opacity-60" />
        </div>
      </div>
    </section>
  );
}
