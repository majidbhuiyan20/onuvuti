"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Check,
  Flame,
} from "lucide-react";
import { STORY_THEMES } from "./storyGenerator";
import { StoryThemeId } from "./types";

interface ShowcaseStory {
  id: string;
  themeId: StoryThemeId;
  displayName: string;
  username: string;
  question: string;
  moodEmoji: string;
  reply: string;
  tag: string;
  accent: string;
}

const SAMPLE_STORIES: ShowcaseStory[] = [
  {
    id: "story-1",
    themeId: "crimson",
    displayName: "রাহিম আহমেদ",
    username: "rahim",
    question: "ক্যাম্পাসের প্রথম দিন থেকেই আমি তোমার দিকে তাকিয়ে থাকতাম... তুমি কি কখনো বুঝতে পেরেছো? ❤️",
    moodEmoji: "❤️",
    reply: "সত্যি? তাহলে তো একদিন সামনাসামনি এসে কফি খাওয়ার অফার দিতেই পারো! দেখা যাক কে তুমি ☕",
    tag: "ক্রাশ কনফেশন",
    accent: "from-rose-500 to-red-600",
  },
  {
    id: "story-2",
    themeId: "midnight",
    displayName: "তানিয়া ইসলাম",
    username: "tania",
    question: "তোমার হাসির মাঝেও এক অদ্ভুত মায়াবী দুঃখ লুকিয়ে থাকে, কেন বলো তো? 🥺",
    moodEmoji: "🥺",
    reply: "কিছু গল্প কখনো বলা হয় না, বুকের ভেতরেই গোপন গোলাপ হয়ে ফুটে থাকে... 🌹",
    tag: "গোপন অনুভূতি",
    accent: "from-indigo-500 to-purple-600",
  },
  {
    id: "story-3",
    themeId: "sunset",
    displayName: "সায়ান খান",
    username: "sayankhan",
    question: "তোমার এই অতিরিক্ত মুড সুইং সহ্য করার মতো মানুষ পৃথিবীতে শুধু একজনই আছে! 🔥",
    moodEmoji: "🔥",
    reply: "হাহাহা তাহলে সেই ধৈর্যশীল মানুষটি কে? সাহস থাকলে ইনবক্সে এসে বলো! 😂",
    tag: "মজার আড্ডা",
    accent: "from-amber-500 to-orange-600",
  },
  {
    id: "story-4",
    themeId: "vintage",
    displayName: "আদিবা চৌধুরী",
    username: "adiba",
    question: "আজ অনেক বছর পর তোমাকে মনে পড়ল... এখনো কি বৃষ্টির দিনে জানালার পাশে বসে পুরনো গান শোনো? 💌",
    moodEmoji: "💌",
    reply: "অভ্যাসগুলো কখনো বদলায় না, শুধু সাথে থাকা মানুষগুলো বদলে যায়... 🍂",
    tag: "স্মৃতি ও নস্টালজিয়া",
    accent: "from-amber-700 to-yellow-800",
  },
  {
    id: "story-5",
    themeId: "emerald",
    displayName: "ফাহিম রেজা",
    username: "fahim",
    question: "তুমি যখন কথা বলো, মনে হয় সময়টা একটু আস্তে চললে খুব ভালো হতো... 💫",
    moodEmoji: "💫",
    reply: "এমন মিষ্টি প্রশংসার পর তো কথা বলার ভাষাটাই হারিয়ে গেল! অনেক ধন্যবাদ অচেনা বন্ধু ✨",
    tag: "মিষ্টি প্রশংসা",
    accent: "from-emerald-500 to-teal-700",
  },
];

interface LiveStoryShowcaseProps {
  onSelectTheme?: (themeId: StoryThemeId) => void;
}

export default function LiveStoryShowcase({ onSelectTheme }: LiveStoryShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = SAMPLE_STORIES[currentIndex];
  const theme = STORY_THEMES[current.themeId];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SAMPLE_STORIES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === SAMPLE_STORIES.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#7E151E] dark:text-rose-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>লাইভ স্টোরি প্রিভিউ শোরুম</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#142230] dark:text-white mt-0.5">
            দেখুন ফেসবুক ও ইনস্টাগ্রাম ডে-তে কেমন দেখাবে!
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            বন্ধুদের প্রশ্ন ও আপনার উত্তর দিয়ে স্বয়ংক্রিয়ভাবে এমন আকর্ষণীয় ফুল এইচডি স্টোরি তৈরি হবে
          </p>
        </div>

        {/* Story Selector Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {SAMPLE_STORIES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                currentIndex === idx
                  ? "bg-[#7E151E] text-white shadow-xs"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              {s.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Smartphone Story Frame Mockup (9:16 Aspect) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-[290px] sm:w-[320px] aspect-[9/16] rounded-[42px] p-3 shadow-2xl bg-[#142230] border-4 border-stone-800 dark:border-stone-700 ring-1 ring-white/10 select-none">
            {/* Dynamic Island / Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-900 ml-auto mr-2" />
            </div>

            {/* Screen Container */}
            <div
              className="w-full h-full rounded-[32px] overflow-hidden relative flex flex-col justify-between p-4 sm:p-5 text-white transition-all duration-300"
              style={{
                background: `linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 50%, ${theme.bgGradient[2]} 100%)`,
              }}
            >
              {/* Instagram Story Top Progress Bars */}
              <div className="relative z-20 space-y-2 pt-2">
                <div className="flex items-center gap-1">
                  {SAMPLE_STORIES.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
                    >
                      <div
                        className={`h-full bg-white transition-all duration-300 ${
                          i < currentIndex
                            ? "w-full"
                            : i === currentIndex
                            ? "w-full animate-pulse"
                            : "w-0"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Profile Header Bar */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[11px] font-black">
                        {current.displayName.slice(0, 1)}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-[11px] leading-tight flex items-center gap-1">
                        <span>{current.displayName}</span>
                        <span className="text-white/60 font-normal">2h</span>
                      </div>
                      <div className="text-[9px] text-white/70 font-mono">
                        @{current.username}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-[9px] font-bold tracking-wider backdrop-blur-xs">
                    ANONYMOUS
                  </span>
                </div>
              </div>

              {/* Center Cards: Question & Answer */}
              <div className="relative z-20 my-auto space-y-3 py-2 animate-in fade-in zoom-in-95 duration-200 key={current.id}">
                {/* Question Box */}
                <div
                  className="rounded-2xl p-3 sm:p-3.5 shadow-lg border-2 transition-all"
                  style={{
                    backgroundColor: theme.questionBg,
                    borderColor: theme.questionBorder,
                    color: theme.questionText,
                  }}
                >
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1.5 shadow-xs"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                    }}
                  >
                    <span>🤫 বেনামী বার্তা {current.moodEmoji}</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-bold leading-snug">
                    &ldquo;{current.question}&rdquo;
                  </p>
                </div>

                {/* Answer Box */}
                <div
                  className="rounded-2xl p-3 sm:p-3.5 shadow-lg border-2 transition-all"
                  style={{
                    backgroundColor: theme.answerBg,
                    borderColor: theme.answerBorder,
                    color: theme.answerText,
                  }}
                >
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1.5 shadow-xs"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                    }}
                  >
                    <span>✍️ {current.displayName}-এর উত্তর</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-extrabold leading-snug">
                    {current.reply}
                  </p>
                </div>
              </div>

              {/* Bottom Watermark Footer */}
              <div className="relative z-20 pt-2 text-center space-y-1">
                <div className="inline-block px-3 py-1 rounded-full bg-white/95 text-[#7E151E] font-mono font-bold text-[10px] shadow-md border border-white">
                  🔗 onuvuti.site/m/{current.username}
                </div>
                <div
                  className="text-[9px] font-bold opacity-80"
                  style={{ color: theme.footerColor }}
                >
                  তুমিও তোমার মনের কথা জানতে লিংক বানাও
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Story Details & Navigation */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800">
              <span>{current.moodEmoji}</span>
              <span>স্টাইল: {theme.nameBn}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#142230] dark:text-white">
              {current.tag}: &ldquo;{current.question.slice(0, 38)}...&rdquo;
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
              আপনার বন্ধুরা যখন এই লিংকে বেনামী চিঠি পাঠাবে, আপনি ইনবক্স থেকে সরাসরি নিজের উত্তর লিখে ১-ক্লিকেই এমন <strong>১০৮০x১৯২০ সাইজের হাই-রেজুলিউশন স্টোরি</strong> নামিয়ে নিতে পারবেন অথবা সরাসরি ফেসবুক/ইনস্টাগ্রাম ডে-তে পোস্ট করতে পারবেন।
            </p>
          </div>

          {/* Theme Palette Bar */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              ৫টি নান্দনিক থিম সিলেক্ট করার সুবিধা:
            </span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STORY_THEMES) as StoryThemeId[]).map((tid) => {
                const t = STORY_THEMES[tid];
                const isActive = current.themeId === tid;
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => {
                      const foundIdx = SAMPLE_STORIES.findIndex((s) => s.themeId === tid);
                      if (foundIdx !== -1) setCurrentIndex(foundIdx);
                      if (onSelectTheme) onSelectTheme(tid);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "border-[#7E151E] bg-rose-50 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 shadow-xs"
                        : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shadow-xs"
                      style={{
                        background: `linear-gradient(135deg, ${t.bgGradient[0]}, ${t.bgGradient[1]})`,
                      }}
                    />
                    <span>{t.nameBn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carousel Next/Prev Controls */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:text-[#7E151E] hover:border-[#7E151E] transition cursor-pointer shadow-xs"
              aria-label="পূর্ববর্তী স্টোরি"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:text-[#7E151E] hover:border-[#7E151E] transition cursor-pointer shadow-xs"
              aria-label="পরবর্তী স্টোরি"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                document.getElementById("create-inbox-form")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#7E151E] hover:bg-[#680f18] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>আমার জন্য এরকম একটি লিংক তৈরি করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
