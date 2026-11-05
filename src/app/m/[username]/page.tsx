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
  AlertCircle,
  MessageSquare,
  Flame,
  Cake,
  Mail,
  Tag,
  Feather,
  Palette,
  RotateCcw,
} from "lucide-react";
import { getPublicInbox, sendSecretMessage } from "@/features/secret/api";
import { SecretInboxPublic } from "@/features/secret/types";
import LiveStoryShowcase from "@/features/secret/LiveStoryShowcase";
import SecretFooter from "@/features/secret/SecretFooter";
import EnvelopeCard, {
  ENVELOPE_THEMES,
  WAX_SEAL_ICONS,
  EnvelopeThemeKey,
} from "@/features/secret/EnvelopeCard";
import { letterSound } from "@/lib/letterSound";

const WAX_SEALS = [
  { id: "crush", label: "ক্রাশ ও প্রেম", icon: Heart },
  { id: "secret", label: "গোপন কথা", icon: Lock },
  { id: "confession", label: "হৃদয়ের কথা", icon: Feather },
  { id: "appreciation", label: "প্রশংসা ও শ্রদ্ধা", icon: Sparkles },
  { id: "bold", label: "সাহসী অনুভূতি", icon: Flame },
  { id: "birthday", label: "বার্থডে উইশ", icon: Cake },
];

const ENVELOPE_PALETTES: Array<{
  id: EnvelopeThemeKey;
  label: string;
  dotBg: string;
}> = [
  { id: "crimson", label: "রয়েল ক্রিমসন", dotBg: "bg-[#7E151E]" },
  { id: "midnight", label: "মিডনাইট নেভি", dotBg: "bg-[#0F1E36]" },
  { id: "vintage", label: "ভিন্টেজ পার্চমেন্ট", dotBg: "bg-[#B07D4F]" },
  { id: "emerald", label: "ফরেস্ট এমেরাল্ড", dotBg: "bg-[#114B37]" },
  { id: "aurora", label: "পার্পল অরোরা", dotBg: "bg-[#4C1D95]" },
];

function PublicSecretMessageContent() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername).toLowerCase() : "";

  const [inbox, setInbox] = useState<SecretInboxPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("crush");
  const [selectedTheme, setSelectedTheme] = useState<EnvelopeThemeKey>("crimson");

  const [submitting, setSubmitting] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (!username) return;
    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    getPublicInbox(username)
      .then((data) => {
        if (isMounted) {
          setInbox(data);
          if (data.theme && data.theme in ENVELOPE_THEMES) {
            setSelectedTheme(data.theme as EnvelopeThemeKey);
          }
        }
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
      setSubmitError("অনুগ্রহ করে আপনার চিঠিটি লিখুন");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setIsDispatching(true);

    // Play synthesized letter dispatch chime & swoosh
    letterSound.playLetterSent();

    try {
      await sendSecretMessage(username, {
        content: content.trim(),
        moodEmoji: selectedCategory,
        cardTheme: selectedTheme,
      });

      // Allow 800ms for smooth dispatch animation before showing success screen
      setTimeout(() => {
        setSentSuccess(true);
        setIsDispatching(false);
        setContent("");
      }, 850);
    } catch (err) {
      setIsDispatching(false);
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
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 text-center border-2 border-rose-200 dark:border-rose-900 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Delivered Sealed Envelope Showcase */}
            <div className="flex justify-center py-2">
              <EnvelopeCard
                theme={selectedTheme}
                sealCategory={selectedCategory}
                recipientUsername={inbox.username}
                recipientDisplayName={inbox.displayName}
                isOpened={false}
                showClickHint={false}
                size="sm"
              />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>চিঠিটি সিলমোহর করে পাঠানো হয়েছে</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#142230] dark:text-white">
                আপনার চিঠিটি পৌঁছে গেছে!
              </h2>
              <p className="text-xs text-stone-500 font-medium max-w-sm mx-auto">
                {inbox.displayName} তার ইনবক্সে এই সিলমোহরকৃত খামটি দেখতে পাবেন এবং মোমের সিল ভেঙে পড়তে পারবেন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>তুমিও কি বন্ধুদের গোপন চিঠি পেতে চাও?</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                মাত্র ৩০ সেকেন্ডেই তোমার নিজস্ব বেনামী চিঠির বাক্স বানিয়ে ফেসবুক বা ইনস্টাগ্রাম স্টোরিতে দিয়ে দাও!
              </p>
              <Link
                href="/m"
                className="w-full mt-2 py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs text-center shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>নিজের চিঠির লিংক তৈরি করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setSentSuccess(false)}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
            >
              + আরেকটি চিঠি পাঠান
            </button>
          </div>
        ) : (
          /* Sending Form with Stationery Letterpad & Envelope Customizer */
          <div className="space-y-5">
            {/* Recipient Profile Card */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs text-center relative overflow-hidden">
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
              <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-rose-100/60 to-rose-50 dark:from-rose-950/50 dark:via-rose-900/40 dark:to-rose-950/50 border border-rose-200 dark:border-rose-800/80 shadow-inner">
                <p className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200 leading-snug">
                  &ldquo;{inbox.promptText}&rdquo;
                </p>
              </div>
            </div>

            {/* Step 2: Vintage Stationery Letterpad Form */}
            <form
              onSubmit={handleSubmit}
              className={`space-y-5 transition-all duration-700 ${
                isDispatching
                  ? "scale-90 opacity-40 -translate-y-8 pointer-events-none"
                  : "scale-100 opacity-100"
              }`}
            >
              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Stationery Lined Letterpad */}
              <div className="rounded-3xl bg-[#FAF5E8] dark:bg-[#1A1613] border-2 border-[#D4AF37]/50 shadow-md p-5 sm:p-6 space-y-3 relative overflow-hidden">
                {/* Vintage Letterhead Top Bar */}
                <div className="flex items-center justify-between border-b border-[#D4AF37]/40 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-serif italic font-bold text-[#7E151E] dark:text-amber-200">
                    <Feather className="w-4 h-4 text-[#7E151E] dark:text-amber-300" />
                    <span>প্রিয় {inbox.displayName},</span>
                  </div>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                    {content.length}/600 বর্ণ
                  </span>
                </div>

                {/* Ruled Paper Guidelines Background for Textarea */}
                <div className="relative">
                  <textarea
                    required
                    rows={6}
                    maxLength={600}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="মনের না বলা কোনো কথা, ভালোলাগা, অনুভূতি কিংবা প্রশ্ন লিখে ফেলুন... (আপনার পরিচয় ১০০% গোপন থাকবে)"
                    className="w-full bg-transparent border-0 p-1 text-xs sm:text-sm font-serif leading-[28px] text-stone-800 dark:text-stone-100 outline-none resize-none placeholder:text-stone-400/90 dark:placeholder:text-stone-500"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(transparent, transparent 27px, rgba(212,175,55,0.2) 27px, rgba(212,175,55,0.2) 28px)",
                    }}
                  />
                </div>

                {/* Letter Signature Footnote */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/30 text-[10px] text-stone-400 dark:text-stone-500 font-serif italic">
                  <span>অনুভূতির গোপন চিঠি</span>
                  <span>— এক অদৃশ্য শুভাকাঙ্ক্ষী</span>
                </div>
              </div>

              {/* Customizer 1: খামের রঙ নির্বাচন (Envelope Color Palette) */}
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                    <span>খামের রঙ নির্বাচন করুন:</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#7E151E] dark:text-rose-400">
                    {ENVELOPE_THEMES[selectedTheme].nameBn}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ENVELOPE_PALETTES.map((pal) => {
                    const isSelected = selectedTheme === pal.id;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setSelectedTheme(pal.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "border-[#7E151E] bg-rose-50/80 dark:bg-rose-950/40 text-[#7E151E] dark:text-rose-300 shadow-2xs"
                            : "border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full ${pal.dotBg} shrink-0 shadow-xs border border-white/50`}
                        />
                        <span className="text-[11px] truncate">{pal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customizer 2: মোমের সিলমোহর ও অনুভূতির ধরন (Wax Seal & Category) */}
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                    <span>মোমের সিলমোহর ও অনুভূতি:</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WAX_SEALS.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const IconComponent = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "border-[#7E151E] bg-rose-50/80 dark:bg-rose-950/40 text-[#7E151E] dark:text-rose-300 shadow-2xs"
                            : "border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Sealed Envelope Preview Before Sending */}
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3 text-center">
                <div className="text-xs font-bold text-stone-500 flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                  <span>প্রাপক চিঠিটি এই খামের ভেতরে সিলমোহরকৃত পাবে:</span>
                </div>

                <div className="flex justify-center py-2">
                  <EnvelopeCard
                    theme={selectedTheme}
                    sealCategory={selectedCategory}
                    recipientUsername={inbox.username}
                    recipientDisplayName={inbox.displayName}
                    isOpened={false}
                    showClickHint={false}
                    size="sm"
                  />
                </div>
              </div>

              {/* Step 3: Interactive Submit & Dispatch Button */}
              <button
                type="submit"
                disabled={submitting || isDispatching}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7E151E] to-rose-700 hover:from-[#650e16] hover:to-rose-800 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isDispatching
                    ? "খামে ভরে পাঠানো হচ্ছে..."
                    : "চিঠিটি খামে ভরে পাঠান"}
                </span>
              </button>

              {/* 100% Privacy Guarantee */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>১০০% পরিচয়হীন ও গোপনীয় • কোনো তথ্য সংরক্ষিত হয় না</span>
              </div>
            </form>
          </div>
        )}

        {/* Live Story Previews Showcase */}
        {!loading && !loadError && (
          <div className="mt-8">
            <LiveStoryShowcase />
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

