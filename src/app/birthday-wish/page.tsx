"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  BIRTHDAY_TEMPLATES,
  WISH_THEMES,
  BirthdayTemplate,
  WishTheme,
} from "@/data/birthdayTemplates";
import {
  Sparkles,
  Heart,
  Send,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Share2,
  RefreshCw,
  Gift,
} from "lucide-react";

export default function BirthdayWishCreatorPage() {
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [relationship, setRelationship] = useState("ভালোবাসা");
  const [message, setMessage] = useState(BIRTHDAY_TEMPLATES[0].fullMessage);
  const [selectedThemeId, setSelectedThemeId] = useState("rose");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedWish, setGeneratedWish] = useState<{
    id: string;
    shareUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedTheme: WishTheme =
    WISH_THEMES.find((t) => t.id === selectedThemeId) || WISH_THEMES[0];

  const handleSelectTemplate = (tmpl: BirthdayTemplate) => {
    setMessage(tmpl.fullMessage);
  };

  const handleCreateWish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!recipientName.trim()) {
      setErrorMsg("যার জন্মদিন তার নাম লিখুন");
      return;
    }
    if (!senderName.trim()) {
      setErrorMsg("আপনার নাম লিখুন");
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg("চিঠির বার্তা অন্তত ৫ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          senderName: senderName.trim(),
          relationship: relationship.trim(),
          message: message.trim(),
          theme: selectedThemeId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "চিঠি তৈরি করতে সমস্যা হয়েছে");
      }

      setGeneratedWish({
        id: data.id,
        shareUrl: data.shareUrl,
      });

      // Scroll up to view the result
      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFullShareUrl = () => {
    if (typeof window === "undefined" || !generatedWish) return "";
    return `${window.location.origin}${generatedWish.shareUrl}`;
  };

  const handleCopyLink = () => {
    const fullUrl = getFullShareUrl();
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getWhatsAppShareUrl = () => {
    const fullUrl = getFullShareUrl();
    const text = `🎂 প্রিয় ${recipientName}, তোমার জন্য ভালোবাসায় মোড়ানো একটি বিশেষ জন্মদিনের চিঠি এসেছে! খামটি খুলে দেখতে এই লিঙ্কে ক্লিক করো: ${fullUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6] dark:bg-[#0B0F17] text-stone-800 dark:text-stone-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FAF7F2]/95 dark:bg-[#0B0F17]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 transition"
            >
              হোমপেজ
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold mb-3 border border-rose-200 dark:border-rose-800 shadow-xs">
            <Gift className="w-3.5 h-3.5" />
            <span>জাদুকরী ডিজিটাল জন্মদিনের চিঠি</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
            প্রিয় মানুষের জন্য তৈরি করুন জন্মদিনের চিঠি
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-2">
            মাত্র ১ মিনিটে তৈরি করুন আবেগভরা ত্রিমাত্রিক মোড়ানো খাম ও কবিতার চিঠি।
            লিঙ্ক পাঠালেই প্রিয়জনের ফোনে খুলবে জাদুকরী কনফেটি ও কেকের মোমবাতি নিভানোর উৎসব!
          </p>
        </div>

        {/* Success Card if wish is created */}
        {generatedWish && (
          <div className="mb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-stone-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in-up">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                আপনার জাদুকরী চিঠি প্রস্তুত! 🎉
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 mb-6">
                নিচের লিঙ্কটি কপি করে প্রিয়জনকে পাঠিয়ে দিন। সে লিঙ্কে ঢুকলেই মোমের সিল ভেঙে চিঠিটি খুলে পড়বে।
              </p>

              {/* Share URL Box */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-inner mb-5">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl()}
                  className="flex-1 bg-transparent px-3 text-xs sm:text-sm font-mono text-stone-700 dark:text-stone-200 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 px-4 py-2 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Share Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে পাঠান</span>
                </a>

                <Link
                  href={generatedWish.shareUrl}
                  target="_blank"
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>👀 নিজে একবার খুলে দেখুন</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setGeneratedWish(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>আরেকটি নতুন চিঠি তৈরি করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* Creator Form & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Left Side */}
          <form
            onSubmit={handleCreateWish}
            className="lg:col-span-7 bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Step 1 & 2: Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  কার জন্মদিন? (Recipient Name) *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="যেমন: অনন্যা / প্রিয় অর্ক"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7E151E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  আপনার নাম (Sender Name) *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="যেমন: রাতুল / তোমারই একজন"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7E151E]"
                />
              </div>
            </div>

            {/* Step 3: Relationship Pills */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                সম্পর্কের ধরন (Relationship)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "ভালোবাসা", emoji: "❤️" },
                  { label: "প্রিয় বন্ধু", emoji: "🤝" },
                  { label: "গোপন ক্রাশ", emoji: "💌" },
                  { label: "ভাই-বোন", emoji: "🎁" },
                  { label: "বিশেষ কেউ", emoji: "✨" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setRelationship(item.label)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
                      relationship === item.label
                        ? "bg-[#7E151E] text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Quick Emotional Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  আবেগভরা রেডিমেড কবিতা ও চিঠি (১ ক্লিকে বেছে নিন)
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BIRTHDAY_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="p-2.5 rounded-2xl border text-left transition hover:border-[#7E151E] dark:hover:border-rose-400 bg-stone-50/70 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 cursor-pointer border-stone-200 dark:border-stone-700"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span>{tmpl.emoji}</span>
                      <span className="truncate">{tmpl.title}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                      {tmpl.preview}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Custom Message Box */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                আপনার জন্মদিনের চিঠি ও শুভেচ্ছা বার্তা *
              </label>
              <textarea
                required
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="এখানে আপনার মনের অনুভূতি, কবিতা বা জন্মদিনের শুভেচ্ছা লিখুন..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm leading-relaxed text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7E151E]"
              />
              <span className="text-[11px] text-stone-400 block text-right mt-1">
                {message.length} টি অক্ষর
              </span>
            </div>

            {/* Step 6: Theme Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                খামের ডিজাইন ও থিম নির্বাচন
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {WISH_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      selectedThemeId === t.id
                        ? "border-[#7E151E] dark:border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-[#7E151E]/20"
                        : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: t.envelopeColor }}
                    >
                      {t.sealText}
                    </div>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {t.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-[#7E151E] to-rose-600 hover:opacity-95 text-white font-bold text-sm shadow-xl transition transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>জাদুকরী চিঠি তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>✨ জাদুকরী চিঠি তৈরি করুন</span>
                </>
              )}
            </button>
          </form>

          {/* Right Side: Live Interactive Envelope Mini Preview */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl border border-stone-800 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-3">
                লাইভ প্রিভিউ (Live Preview)
              </span>

              {/* The Envelope Preview */}
              <div
                className="w-full aspect-[16/11] rounded-2xl relative shadow-2xl border flex flex-col items-center justify-center p-4 transition-all duration-300"
                style={{
                  backgroundColor: selectedTheme.envelopeColor,
                  borderColor: selectedTheme.envelopeBorder,
                }}
              >
                {/* Flap fold shape */}
                <div
                  className="absolute top-0 left-0 w-full h-full border-b border-white/20"
                  style={{
                    clipPath: "polygon(0 0, 50% 55%, 100% 0)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                />

                <span className="text-[10px] uppercase tracking-wider text-white/60 block">
                  To:
                </span>
                <p className="text-base font-bold text-white drop-shadow">
                  {recipientName.trim() || "প্রিয় মানুষের নাম"}
                </p>
                <p className="text-xs text-white/70 mt-0.5">
                  From: {senderName.trim() || "আপনার নাম"}
                </p>

                {/* Wax seal preview */}
                <div
                  className="absolute bottom-3 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-amber-300/60 ring-2 ring-black/20"
                  style={{ backgroundColor: selectedTheme.sealColor }}
                >
                  {selectedTheme.sealText}
                </div>
              </div>

              <div className="mt-4 text-xs text-stone-400 leading-relaxed">
                <p>
                  💡 <span className="text-stone-300 font-semibold">{recipientName || "প্রিয়জন"}</span> লিঙ্কে ক্লিক করলেই এই খামটি জীবন্ত হয়ে উঠবে এবং তার ফোনে কনফেটি ও মোমবাতি নিভানোর সুন্দর অ্যানিমেশন চলবে।
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-100 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>চিঠির বিশেষ সুবিধাসমূহ:</span>
              </div>
              <p>• ত্রিমাত্রিক মোমের সিল ও খাম খোলার অ্যানিমেশন</p>
              <p>• জীবন্ত রঙিন কনফেটি ও বেলুনের বিস্ফোরণ</p>
              <p>• ইচ্ছা মনে রেখে জন্মদিনের মোমবাতিতে ফুঁ দেওয়ার সুযোগ</p>
              <p>• সম্পূর্ণ নিরাপদ ও আজীবন সংরক্ষিত লিংক</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

