"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Gift,
  BarChart2,
  MessageSquareHeart,
  BookOpen,
  HeartPulse,
  Sparkles,
  Check,
  ArrowRight,
  Feather,
  CheckCircle2,
} from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import { BackendPoll } from "@/lib/goApi";

interface HomeSidebarsProps {
  activePoll: BackendPoll | null;
  onVotePoll: (optionId: string) => Promise<void>;
  confessions: BlogPost[];
  onOpenSubmit: () => void;
}

export function HomeLeftSidebar({
  activePoll,
  onVotePoll,
}: Pick<HomeSidebarsProps, "activePoll" | "onVotePoll">) {
  // Poll choice state
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [hasVotedTodayPoll, setHasVotedTodayPoll] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (activePoll) {
      try {
        const votedOption = localStorage.getItem(
          "onuvuti_voted_poll_" + activePoll.id
        );
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

  const handleVoteSubmit = async () => {
    if (!selectedOptionId || hasVotedTodayPoll || isVoting || !activePoll)
      return;
    setIsVoting(true);
    try {
      await onVotePoll(selectedOptionId);
      setHasVotedTodayPoll(true);
      try {
        localStorage.setItem(
          "onuvuti_voted_poll_" + activePoll.id,
          selectedOptionId
        );
      } catch {}
    } finally {
      setIsVoting(false);
    }
  };

  const totalPollVotes =
    activePoll?.options.reduce((sum, opt) => sum + opt.votes, 0) || 0;

  return (
    <aside className="w-72 2xl:w-80 shrink-0 space-y-6 sticky top-24">
      {/* 1. গোপন চিঠির বাক্স (Secret Anonymous Message Card) */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3.5 relative overflow-hidden group">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-400 text-xs font-bold border border-rose-200/80 dark:border-rose-900/60">
          <Mail className="w-3.5 h-3.5" />
          <span>অনুভূতির চিঠির বাক্স</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base text-[#142230] dark:text-white leading-snug">
            কাউকে না বলা অনুভূতি পাঠাবেন?
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            আপনার নিজের নামে একটি গোপন লিংক বানিয়ে ইনস্টাগ্রাম বা ফেসবুকে ডে
            দিন। বন্ধুরা পরিচয় প্রকাশ ছাড়াই মনের কথা পাঠাতে পারবে।
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-dashed border-stone-300 dark:border-stone-700 text-[11px] font-mono text-stone-500 truncate">
          onuvuti.site/m/আপনার-নাম
        </div>

        <Link
          href="/m"
          className="w-full py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>নিজের চিঠির লিংক তৈরি করুন</span>
        </Link>
      </div>

      {/* 2. জন্মদিনের শুভেচ্ছা কার্ড (Birthday Wish Surprise Card) */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3.5 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-[#C59B27] text-xs font-bold border border-[#C59B27]/40">
          <Gift className="w-3.5 h-3.5" />
          <span>জন্মদিনের ডিজিটাল উপহার</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base text-[#142230] dark:text-white leading-snug">
            প্রিয়জনের জন্য জন্মদিনের শুভেচ্ছা
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            ভার্চুয়াল কেক কাটিং, সারপ্রাইজ অ্যানিমেশন ও নরম ব্যাকগ্রাউন্ড মিউজিক
            সহ চমৎকার উইশ চিঠি পাঠান।
          </p>
        </div>

        <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ইন্টারেক্টিভ কেক কাটিং ও মোমবাতি</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>নরম অ্যাকোস্টিক বার্থডে সুর</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>পাসকোড অথবা মিডনাইট আনলক</span>
          </li>
        </ul>

        <Link
          href="/birthday-wish"
          className="w-full py-2.5 rounded-xl bg-[#C59B27] hover:bg-[#b0881e] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>উইশ কার্ড তৈরি করুন</span>
        </Link>
      </div>

      {/* 3. আজকের প্রশ্ন ও পোল (Live Interactive Poll) */}
      {activePoll && (
        <div className="rounded-3xl p-5 bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E151E] dark:text-rose-400">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>আজকের প্রশ্ন</span>
            </div>
            <span className="text-[11px] text-stone-400">
              {totalPollVotes} ভোট
            </span>
          </div>

          <h4 className="font-extrabold text-xs sm:text-sm text-[#142230] dark:text-white leading-snug">
            {activePoll.question}
          </h4>

          <div className="space-y-2">
            {activePoll.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const percent =
                totalPollVotes > 0
                  ? Math.round((opt.votes / totalPollVotes) * 100)
                  : 0;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!hasVotedTodayPoll) setSelectedOptionId(opt.id);
                  }}
                  className={`p-2.5 rounded-xl border text-xs transition relative overflow-hidden ${
                    hasVotedTodayPoll
                      ? isSelected
                        ? "border-[#7E151E]/60 dark:border-rose-500/60 bg-rose-50/50 dark:bg-rose-950/20"
                        : "border-stone-200/70 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/20"
                      : isSelected
                      ? "border-[#7E151E] bg-rose-50/70 dark:bg-rose-950/30 cursor-pointer"
                      : "border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/50 hover:border-stone-300 cursor-pointer"
                  }`}
                >
                  {hasVotedTodayPoll && (
                    <div
                      className="absolute inset-y-0 left-0 bg-[#7E151E]/10 dark:bg-rose-500/10 -z-0 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {opt.label}
                    </span>
                    {hasVotedTodayPoll && (
                      <span className="font-bold text-[#7E151E] dark:text-rose-400">
                        {percent}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!hasVotedTodayPoll ? (
            <button
              type="button"
              onClick={handleVoteSubmit}
              disabled={isVoting || !selectedOptionId}
              className="w-full py-2 rounded-xl bg-[#7E151E] hover:bg-[#630d16] disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>{isVoting ? "ভোট দেওয়া হচ্ছে..." : "ভোট দিন"}</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>আপনার ভোট গ্রহণ করা হয়েছে</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export function HomeRightSidebar({
  confessions,
  onOpenSubmit,
}: Pick<HomeSidebarsProps, "confessions" | "onOpenSubmit">) {
  return (
    <aside className="w-72 2xl:w-80 shrink-0 space-y-6 sticky top-24">
      {/* 1. আলোচিত ক্রাশ ও কনফেশন (Trending Confessions) */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E151E] dark:text-rose-400">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>গোপন ক্রাশ ও কনফেশন</span>
          </div>
          <Link
            href="/?category=ক্রাশ ও কনফেশন"
            className="text-[11px] font-bold text-stone-400 hover:text-[#7E151E] dark:hover:text-rose-400 transition"
          >
            সব দেখুন
          </Link>
        </div>

        {confessions.length > 0 ? (
          <div className="space-y-3">
            {confessions.map((c) => (
              <Link
                key={c.id}
                href={`/blog/${c.slug}`}
                className="block p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 transition border border-stone-200/80 dark:border-stone-700/80 space-y-1 group"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-[#7E151E] dark:text-rose-400">
                    {c.confessionIdBn || "#কনফেশন"}
                  </span>
                  <span className="text-stone-400">{c.dateBn}</span>
                </div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-2 group-hover:text-[#7E151E] dark:group-hover:text-rose-400 transition leading-snug">
                  {c.title}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  — {c.author}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-500 text-center">
            কোনো কনফেশন থাকলে এখানে দেখাবে
          </div>
        )}

        <button
          type="button"
          onClick={onOpenSubmit}
          className="w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-[#7E151E] hover:text-white text-stone-700 dark:text-stone-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Feather className="w-3.5 h-3.5" />
          <span>নিজের কনফেশন লিখুন</span>
        </button>
      </div>

      {/* 2. ‘স্পর্শের ব্যাকরণ’ বেস্টসেলার শোকেস */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C59B27]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>বেস্টসেলার ই-বুক</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700 shadow-xs bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/book-cover.png"
              alt={BOOK_INFO.titleBn}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-[#142230] dark:text-white leading-snug">
              {BOOK_INFO.titleBn}
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
              {BOOK_INFO.subtitleBn}
            </p>
            <div className="text-xs font-bold text-[#7E151E] dark:text-rose-400 pt-1">
              মাত্র ৳{BOOK_INFO.offerPriceBn}
            </div>
          </div>
        </div>

        <Link
          href="/sporsher-byakoron"
          className="w-full py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>ই-বুকটি সংগ্রহ করুন</span>
        </Link>
      </div>

      {/* 3. মানসিক প্রশান্তি ও স্বস্তি টিপস */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>মানসিক স্বাস্থ্য ও প্রশান্তি</span>
        </div>
        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
          অতিরিক্ত চিন্তা, সম্পর্ক ও মানসিক জটিলতায় প্রশান্তি পাওয়ার বৈজ্ঞানিক
          উপায়গুলো পড়ুন।
        </p>
        <Link
          href="/tips"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline pt-1"
        >
          <span>গাইডসমূহ দেখুন</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 4. ক্যাটাগরি এক্সপ্লোরার */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="text-xs font-bold text-stone-500 dark:text-stone-400">
          জনপ্রিয় ক্যাটাগরি
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            "রোমান্টিক গল্প",
            "না বলা কথা",
            "ক্রাশ ও কনফেশন",
            "সম্পর্ক ও মনস্তত্ত্ব",
            "বিচ্ছেদ ও প্রাক্তন",
          ].map((cat) => (
            <Link
              key={cat}
              href={`/?category=${encodeURIComponent(cat)}`}
              className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-[#7E151E] hover:text-white text-stone-600 dark:text-stone-300 text-xs font-semibold transition"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
