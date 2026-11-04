"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";


import {
  Send,
  Lock,
  Sparkles,
  Heart,
  Check,
  ShieldCheck,
  ArrowRight,
  Smile,
  AlertCircle,
} from "lucide-react";
import { getPublicInbox, sendSecretMessage } from "@/features/secret/api";
import { SecretInboxPublic } from "@/features/secret/types";
import SecretFooter from "@/features/secret/SecretFooter";

const MOOD_EMOJIS = [
  { emoji: "❤️", label: "ক্রাশ" },
  { emoji: "🥺", label: "গোপন কথা" },
  { emoji: "🤫", label: "চরম সত্য" },
  { emoji: "🔥", label: "সাহসী" },
  { emoji: "🌹", label: "ভালোবাসা" },
  { emoji: "💌", label: "চিঠি" },
  { emoji: "💫", label: "অনুভূতি" },
];

function PublicSecretMessageContent() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername).toLowerCase() : "";

  const [inbox, setInbox] = useState<SecretInboxPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (!username) return;
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    getPublicInbox(username)
      .then((data) => {
        if (isMounted) setInbox(data);
      })
      .catch((err) => {
        if (isMounted)
          setLoadError(
            err.message || "এই নামের কোনো বেনামী ইনবক্স পাওয়া যায়নি"
          );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setSubmitError("অনুগ্রহ করে আপনার বার্তাটি লিখুন");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await sendSecretMessage(username, {
        content: content.trim(),
        moodEmoji: selectedEmoji,
        cardTheme: inbox?.theme || "crimson",
      });
      setSentSuccess(true);
      setContent("");
    } catch (err) {
      setSubmitError(
        (err as Error).message || "বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#FAF7F2] to-[#FAF7F2] dark:from-[#1C0D12] dark:via-[#0B0F17] dark:to-[#0B0F17] text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors">
      {/* Minimal Top Brand Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-[#0B0F17]/80 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white px-2 py-0.5 rounded-lg border border-stone-200 dark:border-white/20 shadow-xs inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-7 w-auto object-contain"
              />
            </div>
            <span className="font-extrabold text-xs text-[#7E151E] dark:text-rose-400">
              গোপন অনুভূতি
            </span>
          </Link>
          <Link
            href="/m"
            className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-800 transition"
          >
            + নিজের লিংক তৈরি করুন
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-500">ইনবক্স লোড হচ্ছে...</p>
          </div>
        ) : loadError || !inbox ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 text-center border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-stone-800 dark:text-stone-100">
              ইনবক্স পাওয়া যায়নি
            </h2>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {loadError || "এই ইউজারনেমে কোনো সক্রিয় ইনবক্স নেই। ইউজারনেমটি সঠিক কিনা দেখে নিন।"}
            </p>
            <Link
              href="/m"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#7E151E] text-white font-bold text-xs shadow-md"
            >
              <span>নতুন একটি লিংক তৈরি করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : sentSuccess ? (
          /* Sent Success Screen */
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 text-center border-2 border-rose-200 dark:border-rose-900 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
              💌
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-[#142230] dark:text-white">
                আপনার বেনামী বার্তা পৌঁছে গেছে!
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {inbox.displayName} এটি তার ইনবক্সে দেখতে পাবেন এবং উত্তর দিলে স্টোরিতে দেখতে পাবেন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>তুমিও কি নিজের জন্য লিংক বানাতে চাও?</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                বন্ধুরা তোমাকে গোপনে কী বলতে চায় জানতে মাত্র ২ ক্লিকেই তোমার নিজস্ব লিংক তৈরি করো ও স্টোরিতে দাও!
              </p>
              <Link
                href="/m"
                className="w-full mt-2 py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs text-center shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🚀 আমার নিজস্ব লিংক তৈরি করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setSentSuccess(false)}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
            >
              + আরেকটি বার্তা পাঠান
            </button>
          </div>
        ) : (
          /* Sending Form */
          <div className="space-y-4">
            {/* Recipient Profile Card */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7E151E] to-rose-500 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md border-2 border-white dark:border-stone-900">
                {inbox.displayName.slice(0, 1)}
              </div>

              <h2 className="mt-2 text-lg font-black text-[#142230] dark:text-white">
                {inbox.displayName}
              </h2>
              <p className="text-[11px] font-mono text-stone-400">
                @{inbox.username}
              </p>

              {/* Prompt Bubble */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-rose-100/60 to-rose-50 dark:from-rose-950/50 dark:via-rose-900/40 dark:to-rose-950/50 border border-rose-200 dark:border-rose-800/80 shadow-inner">
                <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200 leading-snug">
                  &ldquo;{inbox.promptText}&rdquo;
                </p>
              </div>
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-4"
            >
              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold">
                  ⚠️ {submitError}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <span>আপনার বেনামী বার্তা লিখুন:</span>
                  </label>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {content.length}/600
                  </span>
                </div>

                <textarea
                  required
                  rows={4}
                  maxLength={600}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="মনের কথা, প্রশ্ন, ক্রাশ কনফেশন বা অভিযোগ লিখুন... (আপনার পরিচয় কখনো প্রকাশ করা হবে না 🤫)"
                  className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 p-4 text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-100 outline-none focus:border-[#7E151E] focus:ring-1 focus:ring-[#7E151E] transition resize-none leading-relaxed"
                />
              </div>

              {/* Mood Emoji Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5" />
                  <span>বার্তার অনুভূতি / ইমোজি নির্বাচন করুন:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_EMOJIS.map((m) => {
                    const isSelected = selectedEmoji === m.emoji;
                    return (
                      <button
                        key={m.emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(m.emoji)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-rose-50 dark:bg-rose-950/70 border-[#7E151E] text-[#7E151E] dark:text-rose-300 shadow-xs"
                            : "bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-[#7E151E] hover:bg-[#680f18] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "পাঠানো হচ্ছে..." : "গোপনে বার্তা পাঠান 🚀"}</span>
              </button>

              {/* Privacy Guarantee Footer */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>১০০% পরিচয়হীন ও গোপনীয় • কোনো তথ্য সংরক্ষিত হয় না</span>
              </div>
            </form>
          </div>
        )}
      </main>

      <SecretFooter />
    </div>
  );
}

export default function PublicSecretMessagePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PublicSecretMessageContent />
    </Suspense>
  );
}
