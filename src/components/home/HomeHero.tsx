"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, PenLine, ArrowRight } from "lucide-react";

interface HomeHeroProps {
  onOpenSubmit: () => void;
}

const HERO_SLIDES = [
  {
    image: "/images/romantic1.png",
    alt: "অনুভূতির রোমান্টিক সন্ধ্যা",
    tagline: "যেখানে প্রতিটি অনুভূতির একটি গল্প আছে",
    headlinePart1: "কিছু কথা বলা হয় না,",
    headlinePart2: "শুধু অনুভব করা যায়।",
    subtext:
      "তোমার ভালোবাসা, অভিমান, স্মৃতি কিংবা না বলা কথাগুলো জায়গা পাক অনুভূতির পাতায়।",
  },
  {
    image: "/images/romantic2.png",
    alt: "অনুভূতির মায়াবী প্রহর",
    tagline: "হৃদয়ের না বলা কথার নিরাপদ আশ্রয়",
    headlinePart1: "ভালোবাসার প্রতিটি ক্ষণ,",
    headlinePart2: "এক অমলিন স্মৃতি।",
    subtext:
      "মনের গোপন অনুভূতি ও আবেগ প্রকাশ করুন মুক্ত মনে, হাজারো সহমর্মী পাঠকের সাথে।",
  },
];

export default function HomeHero({ onOpenSubmit }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="rounded-3xl bg-[#FAF6EE] dark:bg-[#121927] border border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-md relative min-h-[380px] sm:min-h-[420px] flex items-center">
      {/* Full-width Romantic Background Images with Smooth Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {HERO_SLIDES.map((item, idx) => (
          <div
            key={item.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === idx ? "opacity-100 scale-100" : "opacity-0 scale-105"
            } transform transition-transform duration-[6500ms]`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Ambient Gradient Masks to guarantee 100% text legibility in Light & Dark Mode */}
        {/* Left-to-right fade mask: solid on the left for text, transparent on the right for image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6EE]/95 via-[#FAF6EE]/85 to-[#FAF6EE]/30 dark:from-[#0B0F17]/95 dark:via-[#0B0F17]/85 dark:to-[#0B0F17]/40" />
        {/* Subtle bottom-up vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6EE] via-transparent to-transparent dark:from-[#0B0F17] dark:via-transparent opacity-60" />
      </div>

      {/* Hero Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center w-full">
        {/* Left Content Column */}
        <div className="lg:col-span-8 p-6 sm:p-10 lg:p-12 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF0DC]/90 dark:bg-[#1E293B]/90 backdrop-blur-md border border-[#C59B27]/50 text-[#7E151E] dark:text-rose-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{slide.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#142230] dark:text-white leading-[1.25] tracking-tight font-serif drop-shadow-xs">
            {slide.headlinePart1} <br />
            <span className="text-[#7E151E] dark:text-rose-400 font-serif">
              {slide.headlinePart2}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 leading-relaxed font-medium max-w-xl">
            {slide.subtext}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenSubmit}
              className="px-6 py-3 rounded-full bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-102 transition cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>নিজের গল্প লিখুন</span>
            </button>

            <a
              href="#stories-feed"
              className="px-6 py-3 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-md border border-stone-300 dark:border-stone-700 text-[#142230] dark:text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 hover:border-[#7E151E] hover:text-[#7E151E] dark:hover:text-rose-400 transition cursor-pointer shadow-xs"
            >
              <span>গল্প পড়ুন</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Interactive Romantic Slide Controls */}
          <div className="flex items-center gap-3 pt-3">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`স্লাইড ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx
                      ? "w-8 bg-[#7E151E] dark:bg-rose-400"
                      : "w-2.5 bg-stone-400/60 dark:bg-stone-600/60 hover:bg-stone-500"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              রোমান্টিক প্রহর {currentSlide + 1}/{HERO_SLIDES.length}
            </span>
          </div>
        </div>

        {/* Right Preview Accent Badge for Desktop */}
        <div className="hidden lg:flex lg:col-span-4 justify-end pr-8">
          <div className="bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-xl max-w-xs text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7E151E] dark:text-rose-300 block mb-1">
              অনুভূতির রোমান্টিক কর্নার
            </span>
            <p className="text-xs text-stone-700 dark:text-stone-200 font-serif leading-relaxed italic">
              “কিছু দৃশ্য চোখে নয়, মনের গভীরে ছবি হয়ে থেকে যায়।”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
