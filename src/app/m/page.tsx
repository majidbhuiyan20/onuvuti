"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Lock,
  ArrowRight,
  Share2,
  Trash2,
  MessageSquareHeart,
  ChevronRight,
  Heart,
  Cake,
  AlertCircle,
} from "lucide-react";
import { createSecretInbox } from "@/features/secret/api";
import { getMySavedInboxes, saveMyInbox, removeMySavedInbox } from "@/features/secret/storage";
import { CreateInboxResponse, SavedInboxMeta, StoryThemeId } from "@/features/secret/types";
import { STORY_THEMES } from "@/features/secret/storyGenerator";
import LiveStoryShowcase from "@/features/secret/LiveStoryShowcase";
import HomeNavbar from "@/components/home/HomeNavbar";
import SecretFooter from "@/features/secret/SecretFooter";

const PRESET_PROMPTS = [
  "আমাকে যা বলতে চাও কিন্তু সামনাসামনি বলতে পারোনি...",
  "আজ আমার জন্মদিন! জন্মদিনের শুভেচ্ছা ও মনের না বলা কথা জানিয়ে যাও",
  "তোমার মনে কি আমার জন্য কখনো কোনো অনুভূতি ছিল?",
  "আমার জন্মদিনে এমন কোনো স্মৃতি বা কথা যা কখনো শেয়ার করোনি...",
  "আমার সম্পর্কে একটা সত্য কথা বলো যা কখনো বলোনি...",
  "আমার কোন অভ্যাসটা তোমার সবচেয়ে বেশি পছন্দ বা অপছন্দ?",
  "যদি একদিনের জন্য যা ইচ্ছা বলতে পারতে, কী বলতে?",
  "আমাকে নিয়ে তোমার মনে কোনো না বলা গল্প আছে?",
];

export default function CreateSecretInboxPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(PRESET_PROMPTS[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<StoryThemeId>("crimson");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdData, setCreatedData] = useState<CreateInboxResponse | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInbox, setCopiedInbox] = useState(false);

  const [myInboxes, setMyInboxes] = useState<SavedInboxMeta[]>([]);

  useEffect(() => {
    setMyInboxes(getMySavedInboxes());
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(val);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    if (cleanUser.length < 3 || cleanUser.length > 30) {
      setError("ইউজারনেম ৩ থেকে ৩০ অক্ষরের মধ্যে হতে হবে");
      return;
    }

    const cleanDisplay = displayName.trim() || cleanUser;
    const finalPrompt = useCustomPrompt
      ? customPrompt.trim() || PRESET_PROMPTS[0]
      : selectedPrompt;

    setLoading(true);
    try {
      const res = await createSecretInbox({
        username: cleanUser,
        displayName: cleanDisplay,
        promptText: finalPrompt,
        theme: selectedTheme,
      });

      setCreatedData(res);
      saveMyInbox({
        username: res.inbox.username,
        displayName: res.inbox.displayName,
        manageKey: res.manageKey,
      });
      setMyInboxes(getMySavedInboxes());
    } catch (err) {
      setError((err as Error).message || "লিংক তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, isInbox = false) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (isInbox) {
        setCopiedInbox(true);
        setTimeout(() => setCopiedInbox(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleDeleteSavedInbox = (user: string) => {
    if (confirm(`আপনি কি "${user}" লিংকটি তালিকা থেকে মুছে ফেলতে চান?`)) {
      removeMySavedInbox(user);
      setMyInboxes(getMySavedInboxes());
    }
  };

  const fullShareUrl = createdData
    ? typeof window !== "undefined"
      ? `${window.location.origin}/m/${createdData.inbox.username}`
      : `https://onuvuti.site/m/${createdData.inbox.username}`
    : "";

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF7F2]/95 dark:bg-[#0B0F17]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-[#7E151E] dark:text-rose-400">
              গোপন অনুভূতি
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-[#7E151E] px-3 py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              হোমপেজ
            </Link>
            <Link
              href="/birthday-wish"
              className="text-xs font-bold text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1.5"
            >
              <Cake className="w-3.5 h-3.5" />
              <span>জন্মদিনের চিঠি</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800 text-xs font-extrabold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NGL স্টাইল বেনামী বার্তা ও স্টোরি রিপ্লাই</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#142230] dark:text-white tracking-tight">
            আমাকে যা বলতে চাও, <span className="text-[#7E151E] dark:text-rose-400">গোপনে বলো...</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium max-w-xl mx-auto leading-relaxed">
            আপনার নিজস্ব সিক্রেট লিংক বানিয়ে ফেসবুক ও ইনস্টাগ্রাম স্টোরিতে শেয়ার করুন। বন্ধুরা ১০০% পরিচয়হীনভাবে মনের কথা পাঠাবে, আর আপনি এক ক্লিকে আকর্ষণীয় স্টোরি কার্ড বানিয়ে শেয়ার করতে পারবেন!
          </p>
        </div>

        {/* Live Story Preview Showcase */}
        {!createdData && (
          <LiveStoryShowcase onSelectTheme={(t) => setSelectedTheme(t)} />
        )}

        {/* Created Success Screen */}
        {createdData ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/70 text-[#7E151E] dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-[#142230] dark:text-white">
                আপনার বেনামী লিংক রেডি!
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                নিচের লিংকটি কপি করে আপনার ফেসবুক/ইনস্টাগ্রাম স্টোরিতে স্টিকার হিসেবে দিন।
              </p>
            </div>

            {/* Public Link Box */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200/80 dark:border-rose-800/60 space-y-2">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>বন্ধুদের পাঠানোর পাবলিক লিংক:</span>
                </span>
                <span className="text-[10px] bg-rose-200 dark:bg-rose-900 px-2 py-0.5 rounded-full font-bold">
                  স্টোরিতে দিন
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullShareUrl}
                  className="flex-1 bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-stone-800 dark:text-stone-100 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(fullShareUrl, false)}
                  className="px-4 py-2 bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "কপি হয়েছে!" : "কপি করুন"}</span>
                </button>
              </div>
            </div>

            {/* Private Inbox Access Box */}
            <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                <span>আপনার গোপন ইনবক্স লিংক (শুধু আপনার জন্য):</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={createdData.inboxUrl}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7E151E] to-rose-700 text-white font-bold text-xs sm:text-sm text-center shadow-md hover:opacity-95 transition inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquareHeart className="w-4 h-4" />
                  <span>এখনই ইনবক্সে যান ও রিপ্লাই দিন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `${window.location.origin}${createdData.inboxUrl}`,
                      true
                    )
                  }
                  className="px-4 py-2.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedInbox ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInbox ? "কপি হয়েছে" : "ইনবক্স লিংক কপি"}</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-400">
                <span className="font-semibold text-rose-700 dark:text-rose-400">টিপ:</span> ইনবক্স লিংকটি আপনার এই ব্রাউজারে স্বয়ংক্রিয়ভাবে সেভ হয়ে গেছে। নিচের তালিকা থেকেও যেকোনো সময় ঢুকতে পারবেন।
              </p>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedData(null);
                  setUsername("");
                }}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
              >
                + আরেকটি নতুন লিংক তৈরি করুন
              </button>
            </div>
          </div>
        ) : (
          /* Create Form */
          <form
            id="create-inbox-form"
            onSubmit={handleCreate}
            className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-6"
          >
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Username & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  আপনার ইউজারনেম (ইংরেজি ছোট অক্ষর ও সংখ্যা) *
                </label>
                <div className="flex items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 px-3 py-2 text-xs sm:text-sm focus-within:border-[#7E151E] focus-within:ring-1 focus-within:ring-[#7E151E] transition">
                  <span className="text-stone-400 font-mono select-none">onuvuti.site/m/</span>
                  <input
                    type="text"
                    required
                    placeholder="yourname"
                    value={username}
                    onChange={handleUsernameChange}
                    className="flex-1 bg-transparent font-bold font-mono text-stone-800 dark:text-stone-100 outline-none ml-1"
                  />
                </div>
                <p className="text-[11px] text-stone-400">উদাহরণ: rahim, tania, secret_lover</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  আপনার ডিসপ্লে নাম বা ডাকনাম
                </label>
                <input
                  type="text"
                  placeholder="যেমন: রাহিম আহমেদ"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 outline-none focus:border-[#7E151E] focus:ring-1 focus:ring-[#7E151E] transition"
                />
                <p className="text-[11px] text-stone-400">এই নামটি আপনার লিংকে দেখাবে</p>
              </div>
            </div>

            {/* Step 2: Prompt Selection */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                বন্ধুদের জন্য আপনার প্রম্পট / প্রশ্ন বেছে নিন
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_PROMPTS.map((p) => {
                  const isSelected = !useCustomPrompt && selectedPrompt === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setSelectedPrompt(p);
                        setUseCustomPrompt(false);
                      }}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        isSelected
                          ? "bg-rose-50 dark:bg-rose-950/60 border-[#7E151E] text-[#7E151E] dark:text-rose-300 shadow-xs"
                          : "bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setUseCustomPrompt((prev) => !prev)}
                  className="text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline cursor-pointer"
                >
                  {useCustomPrompt ? "তৈরি করা প্রম্পট তালিকা ব্যবহার করুন" : "অথবা নিজের মতো প্রম্পট লিখুন"}
                </button>
                {useCustomPrompt && (
                  <input
                    type="text"
                    placeholder="নিজের মতো কোনো প্রশ্ন লিখুন..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 px-3.5 py-2 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 outline-none focus:border-[#7E151E]"
                  />
                )}
              </div>
            </div>

            {/* Step 3: Theme selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                কার্ডের থিম স্টাইল
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STORY_THEMES) as StoryThemeId[]).map((tid) => {
                  const t = STORY_THEMES[tid];
                  const isSelected = selectedTheme === tid;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => setSelectedTheme(tid)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? "border-[#7E151E] bg-rose-50 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 shadow-xs"
                          : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs shrink-0"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#7E151E] hover:bg-[#680f18] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "তৈরি হচ্ছে..." : "আমার বেনামী লিংক তৈরি করুন"}</span>
            </button>
          </form>
        )}

        {/* Saved Inboxes Section */}
        {myInboxes.length > 0 && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
                <span>আপনার পূর্বে তৈরি করা লিংকসমূহ ({myInboxes.length})</span>
              </h3>
              <span className="text-[11px] text-stone-400">ডিভাইসে সংরক্ষিত</span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {myInboxes.map((item) => (
                <div
                  key={item.username}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                      <span>{item.displayName}</span>
                      <span className="text-stone-400 font-mono text-[11px]">
                        (@{item.username})
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      onuvuti.site/m/{item.username}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/m/${item.username}/inbox?key=${encodeURIComponent(
                        item.manageKey
                      )}`}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 font-bold hover:bg-rose-100 transition inline-flex items-center gap-1"
                    >
                      <span>ইনবক্স দেখুন</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedInbox(item.username)}
                      title="তালিকা থেকে সরান"
                      className="p-1.5 text-stone-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <SecretFooter />
    </div>
  );
}
