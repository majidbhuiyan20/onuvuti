"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquareHeart,
  BarChart2,
  Flame,
  Heart,
  BookOpen,
  HelpCircle,
  PenLine,
} from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { BackendPoll, BackendQuote } from "@/lib/goApi";

interface HomeFeatureRowProps {
  posts: BlogPost[];
  trendingPosts: BlogPost[];
  onSelectCategory: (cat: string) => void;
  activePoll: BackendPoll | null;
  onVotePoll: (optionId: string) => Promise<void>;
  activeQuote: BackendQuote | null;
  onReactQuote: () => Promise<void>;
  onOpenSubmit: () => void;
}

export default function HomeFeatureRow({
  posts,
  trendingPosts,
  onSelectCategory,
  activePoll,
  onVotePoll,
  activeQuote,
  onReactQuote,
  onOpenSubmit,
}: HomeFeatureRowProps) {
  // Quote reader reaction state
  const [isQuoteReacted, setIsQuoteReacted] = useState(false);
  const [localReactCount, setLocalReactCount] = useState<number>(0);

  // Poll Choice State
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [hasVotedTodayPoll, setHasVotedTodayPoll] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Synchronize active quote state from backend
  useEffect(() => {
    if (activeQuote) {
      setLocalReactCount(activeQuote.reactCount);
      try {
        const saved = localStorage.getItem("onuvuti_reacted_quote_" + activeQuote.id);
        setIsQuoteReacted(Boolean(saved));
      } catch {
        // ignore
      }
    }
  }, [activeQuote]);

  // Synchronize active poll state from backend
  useEffect(() => {
    if (activePoll) {
      try {
        const votedOption = localStorage.getItem("onuvuti_voted_poll_" + activePoll.id);
        if (votedOption) {
          setHasVotedTodayPoll(true);
          setSelectedOptionId(votedOption);
        } else if (activePoll.options.length > 0) {
          setSelectedOptionId(activePoll.options[0].id);
        }
      } catch {
        if (activePoll.options.length > 0) {
          setSelectedOptionId(activePoll.options[0].id);
        }
      }
    }
  }, [activePoll]);

  const handleHeartReaction = async () => {
    if (isQuoteReacted || !activeQuote) return;
    setIsQuoteReacted(true);
    setLocalReactCount((prev) => prev + 1);
    try {
      localStorage.setItem("onuvuti_reacted_quote_" + activeQuote.id, "true");
    } catch {
      // ignore
    }
    await onReactQuote();
  };

  const handleVoteSubmit = async () => {
    if (hasVotedTodayPoll || !activePoll || !selectedOptionId || isVoting) return;
    setIsVoting(true);
    try {
      await onVotePoll(selectedOptionId);
      setHasVotedTodayPoll(true);
      try {
        localStorage.setItem("onuvuti_voted_poll_" + activePoll.id, selectedOptionId);
      } catch {
        // ignore
      }
    } finally {
      setIsVoting(false);
    }
  };

  const totalPollVotes =
    activePoll?.options.reduce((sum, item) => sum + item.votes, 0) || 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: আজকের না বলা কথা */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition min-h-[290px]">
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

          {/* If backend provides active quote */}
          {activeQuote ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF6F3] dark:bg-[#1A1F2C] border border-[#FADCD5] dark:border-stone-800 relative">
              <span className="text-3xl sm:text-4xl font-serif text-[#7E151E]/40 dark:text-rose-400/30 leading-none select-none block">
                ❝
              </span>
              <p className="text-sm font-bold text-[#142230] dark:text-stone-200 leading-relaxed font-serif pt-1 line-clamp-3">
                “{activeQuote.quote}”
              </p>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block pt-3 truncate">
                — {activeQuote.author}
              </span>
            </div>
          ) : (
            /* Clean Empty State when backend has not set any quote */
            <div className="py-7 text-center space-y-2 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl px-4 bg-stone-50/50 dark:bg-stone-900/30">
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                আজকের কোনো না বলা কথা এখনো প্রকাশিত হয়নি।
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                আপনার মনের অনুভূতি কিংবা না বলা কথা পাঠিয়ে দিন অনুভূতির পাতায়।
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          {activeQuote ? (
            <button
              type="button"
              onClick={handleHeartReaction}
              disabled={isQuoteReacted}
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
              <span>
                {localReactCount} জন অনুভব করেছেন
                {isQuoteReacted ? " ✓" : ""}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSubmit}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#7E151E]/10 hover:bg-[#7E151E]/20 text-[#7E151E] dark:text-rose-300 border border-[#7E151E]/30 inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>নিজের না বলা কথা লিখুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Card 2: আজকের প্রশ্ন (100% Backend-Driven Reader Poll) */}
      <div
        id="home-poll-section"
        className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition min-h-[290px]"
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

          {/* If backend provides active poll */}
          {activePoll ? (
            <>
              <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white leading-snug">
                {activePoll.question}
              </h3>

              {/* Radio Choices / Results */}
              <div className="space-y-2">
                {activePoll.options.map((item) => {
                  const percent =
                    totalPollVotes > 0
                      ? Math.round((item.votes / totalPollVotes) * 100)
                      : 0;
                  const isChecked = selectedOptionId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (!hasVotedTodayPoll) {
                          setSelectedOptionId(item.id);
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
                          {percent}% ({item.votes})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Clean Empty State when backend has not set any active poll */
            <div className="py-7 text-center space-y-2 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl px-4 bg-stone-50/50 dark:bg-stone-900/30">
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
                আজকের কোনো সক্রিয় জরিপ বা প্রশ্ন নেই।
              </p>
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                নতুন কোনো মতামত জরিপ শুরু হলে আপনি এখানে নিজের ভোট দিতে পারবেন।
              </p>
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          {activePoll ? (
            <>
              <button
                type="button"
                disabled={hasVotedTodayPoll || isVoting}
                onClick={handleVoteSubmit}
                className="px-4 py-2 rounded-full bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold disabled:opacity-50 cursor-pointer disabled:cursor-default transition"
              >
                {hasVotedTodayPoll
                  ? "ভোট সম্পন্ন ✓"
                  : isVoting
                  ? "ভোট হচ্ছে..."
                  : "ভোট দিন →"}
              </button>

              <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                মোট ভোট: {totalPollVotes}
              </div>
            </>
          ) : (
            <div className="w-full text-center text-[11px] text-stone-400 dark:text-stone-500">
              পরবর্তী পাঠক জরিপের জন্য সাথে থাকুন
            </div>
          )}
        </div>
      </div>

      {/* Card 3: জনপ্রিয় গল্পসমূহ (100% Dynamic from Backend) */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition min-h-[290px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-[#142230] dark:text-white">
              <Flame className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
              <span>জনপ্রিয় গল্পসমূহ</span>
            </div>
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
              সব দেখুন →
            </button>
          </div>

          <div className="space-y-3">
            {trendingPosts.length > 0 ? (
              trendingPosts.slice(0, 3).map((item) => {
                const totalReactions =
                  (item.reactions?.love || 0) +
                  (item.reactions?.touched || 0) +
                  (item.reactions?.relatable || 0) ||
                  item.likesCount ||
                  1;

                return (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="flex items-center gap-3 p-1.5 -mx-1.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/60 transition group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200/60 dark:border-stone-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="text-xs font-extrabold text-[#142230] dark:text-white truncate group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                        {item.readTimeBn || "৪ মিনিট পাঠ"} • {totalReactions} প্রতিক্রিয়া
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-stone-400">
                কোনো গল্প পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-right">
          <Link
            href="#stories-feed"
            className="text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline inline-flex items-center gap-1"
          >
            <span>সকল গল্প পড়ুন</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
