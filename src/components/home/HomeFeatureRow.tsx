"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquareHeart,
  BarChart2,
  Flame,
  Heart,
  Mail,
  BookOpen,
} from "lucide-react";
import { BlogPost, PollOptionItem, HOME_POLL_QUESTION } from "@/data/blogData";

interface HomeFeatureRowProps {
  posts: BlogPost[];
  trendingPosts: BlogPost[];
  onSelectCategory: (cat: string) => void;
  pollOptions: PollOptionItem[];
  onVotePoll: (optionId: string) => void;
  selectedPollId: string | null;
  totalPollVotes: number;
}

export default function HomeFeatureRow({
  posts,
  trendingPosts,
  onSelectCategory,
  pollOptions,
  onVotePoll,
  selectedPollId,
  totalPollVotes,
}: HomeFeatureRowProps) {
  // Quote reader reaction state
  const [quoteReactCount, setQuoteReactCount] = useState(128);
  const [isQuoteReacted, setIsQuoteReacted] = useState(false);

  // Poll Choice State
  const [pollRadioChoice, setPollRadioChoice] = useState<string>("হ্যাঁ, এখনো বাসি");
  const [hasVotedTodayPoll, setHasVotedTodayPoll] = useState(Boolean(selectedPollId));

  // 100% Dynamic Quote from Backend "না বলা কথা" or latest backend confession
  const unspokenStory =
    posts.find((p) => p.category === "না বলা কথা") ||
    posts.find((p) => p.category === "ক্রাশ ও কনফেশন") ||
    posts[0];

  const quoteText = unspokenStory
    ? unspokenStory.excerpt
    : "তোমাকে ভুলে যাওয়ার চেষ্টা করতে করতে, তোমাকেই আরও বেশি মনে পড়ে।";

  const quoteAuthor = unspokenStory
    ? unspokenStory.author
    : "একজন অজ্ঞাত পাঠক";

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: আজকের না বলা কথা */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-[#142230] dark:text-white">
              <MessageSquareHeart className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
              <span>আজকের না বলা কথা</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectCategory("না বলা কথা");
                document
                  .getElementById("stories-feed")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline cursor-pointer"
            >
              সব দেখুন →
            </button>
          </div>

          {/* Quote Container */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF6F3] dark:bg-[#1A1F2C] border border-[#FADCD5] dark:border-stone-800 relative">
            <span className="text-3xl sm:text-4xl font-serif text-[#7E151E]/40 dark:text-rose-400/30 leading-none select-none block">
              ❝
            </span>
            <p className="text-sm font-bold text-[#142230] dark:text-stone-200 leading-relaxed font-serif pt-1 line-clamp-3">
              “{quoteText}”
            </p>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block pt-3 truncate">
              — {quoteAuthor}
            </span>
          </div>
        </div>

        {/* Interactive Reader Reaction Button */}
        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsQuoteReacted((prev) => !prev);
              setQuoteReactCount((prev) =>
                isQuoteReacted ? prev - 1 : prev + 1
              );
            }}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer ${
              isQuoteReacted
                ? "bg-rose-100 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 border border-rose-300 dark:border-rose-900"
                : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-stone-200 dark:border-stone-700"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isQuoteReacted
                  ? "fill-[#7E151E] text-[#7E151E]"
                  : "text-stone-500"
              }`}
            />
            <span>{quoteReactCount} জন অনুভব করেছেন</span>
          </button>
        </div>
      </div>

      {/* Card 2: আজকের প্রশ্ন (Interactive Reader Poll) */}
      <div
        id="home-poll-section"
        className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-[#142230] dark:text-white">
              <BarChart2 className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
              <span>আজকের প্রশ্ন</span>
            </div>
            <span className="text-xs font-bold text-[#7E151E] dark:text-rose-400">
              জরিপ →
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white leading-snug">
            {HOME_POLL_QUESTION}
          </h3>

          {/* Radio Choices / Results */}
          <div className="space-y-2">
            {pollOptions.map((item) => {
              const percent =
                totalPollVotes > 0
                  ? Math.round((item.votes / totalPollVotes) * 100)
                  : 33;
              const isChecked = pollRadioChoice === item.label;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!hasVotedTodayPoll) {
                      setPollRadioChoice(item.label);
                    }
                  }}
                  className={`relative overflow-hidden p-2.5 rounded-xl border transition cursor-pointer text-xs font-bold flex items-center justify-between ${
                    isChecked
                      ? "border-[#7E151E] bg-[#FAF4E6] dark:bg-[#1E293B] text-[#7E151E] dark:text-rose-300"
                      : "border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {hasVotedTodayPoll && (
                    <div
                      style={{ width: `${percent}%` }}
                      className="absolute inset-y-0 left-0 bg-[#7E151E]/15 dark:bg-rose-500/20 transition-all duration-500 pointer-events-none"
                    />
                  )}
                  <div className="relative flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? "border-[#7E151E] bg-[#7E151E]"
                          : "border-stone-400 bg-white dark:bg-stone-900"
                      }`}
                    >
                      {isChecked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {hasVotedTodayPoll && (
                    <span className="relative text-xs font-black text-[#7E151E] dark:text-rose-400">
                      {percent}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Button and Flying Hearts Envelope Graphic */}
        <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            disabled={hasVotedTodayPoll}
            onClick={() => {
              const targetOpt = pollOptions.find(
                (o) => o.label === pollRadioChoice
              );
              if (targetOpt) {
                onVotePoll(targetOpt.id);
              }
              setHasVotedTodayPoll(true);
            }}
            className="px-4 py-2 rounded-full bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold disabled:opacity-50 cursor-pointer disabled:cursor-default transition"
          >
            {hasVotedTodayPoll ? "ভোট সম্পন্ন ✓" : "ভোট দিন →"}
          </button>

          {/* Romantic Envelope & Hearts Vector */}
          <div className="relative w-12 h-10 flex items-center justify-center">
            <span className="absolute -top-1 -right-1 text-xs animate-bounce">
              ❤️
            </span>
            <span className="absolute -top-2 left-1 text-[10px] animate-pulse">
              💕
            </span>
            <div className="w-10 h-7 rounded-sm bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-center justify-center shadow-2xs">
              <Mail className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: জনপ্রিয় গল্পসমূহ (100% Dynamic from Backend) */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-[#142230] dark:text-white">
              <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>জনপ্রিয় গল্পসমূহ</span>
            </div>
            <a
              href="#stories-feed"
              className="text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline"
            >
              সব দেখুন →
            </a>
          </div>

          {/* Real Stories from Backend Trending List */}
          <div className="space-y-3 pt-1">
            {trendingPosts.length > 0 ? (
              trendingPosts.slice(0, 3).map((story, idx) => (
                <Link
                  key={story.id}
                  href={`/blog/${story.slug}`}
                  className="flex items-center gap-3 p-2 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        story.imageUrl ||
                        (idx === 0
                          ? "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80"
                          : idx === 1
                          ? "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=400&q=80"
                          : "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=400&q=80")
                      }
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#142230] dark:text-white group-hover:text-[#7E151E] dark:group-hover:text-rose-400 line-clamp-1 leading-snug">
                      {story.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                      {story.readTimeBn || "৫ মিনিট পাঠ"} • {story.likesCount} প্রতিক্রিয়া
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-stone-500 dark:text-stone-400 space-y-2">
                <BookOpen className="w-6 h-6 text-stone-400 mx-auto" />
                <p>শীঘ্রই আরও নতুন গল্প যুক্ত হবে।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

