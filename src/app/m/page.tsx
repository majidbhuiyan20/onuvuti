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
  QrCode,
  Eye,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { createSecretInbox } from "@/features/secret/api";
import {
  getMySavedInboxes,
  saveMyInbox,
  removeMySavedInbox,
} from "@/features/secret/storage";
import {
  CreateInboxResponse,
  SavedInboxMeta,
  StoryThemeId,
} from "@/features/secret/types";
import { STORY_THEMES } from "@/features/secret/storyGenerator";
import LiveStoryShowcase from "@/features/secret/LiveStoryShowcase";
import StoryStickerCardModal from "@/features/secret/StoryStickerCardModal";
import QRCodeCardModal from "@/features/secret/QRCodeCardModal";
import SecretFooter from "@/features/secret/SecretFooter";

interface PromptCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompts: string[];
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "all",
    label: "সব প্রম্পট",
    icon: Sparkles,
    prompts: [
      "আমাকে যা বলতে চাও কিন্তু সামনাসামনি বলতে পারোনি...",
      "আজ আমার জন্মদিন! জন্মদিনের শুভেচ্ছা ও মনের না বলা কথা জানিয়ে যাও",
      "তোমার মনে কি আমার জন্য কখনো কোনো অনুভূতি ছিল?",
      "আমার জন্মদিনে এমন কোনো স্মৃতি বা কথা যা কখনো শেয়ার করোনি...",
      "আমার সম্পর্কে একটা সত্য কথা বলো যা কখনো বলোনি...",
      "আমার কোন অভ্যাসটা তোমার সবচেয়ে বেশি পছন্দ বা অপছন্দ?",
      "যদি একদিনের জন্য যা ইচ্ছা বলতে পারতে, কী বলতে?",
      "আমাকে নিয়ে তোমার মনে কোনো না বলা গল্প আছে?",
      "আমাকে প্রথম দেখার অনুভূতি বা স্মৃতিটা কেমন ছিল?",
      "কোনো এক বৃষ্টির দিনে আমরা একসাথে চা খেলে কেমন হতো?",
    ],
  },
  {
    id: "romance",
    label: "ক্রাশ ও অনুভূতি",
    icon: Heart,
    prompts: [
      "তোমার মনে কি আমার জন্য কখনো কোনো অনুভূতি ছিল?",
      "আমাকে যা বলতে চাও কিন্তু সামনাসামনি বলতে পারোনি...",
      "আমাকে প্রথম দেখার অনুভূতি বা স্মৃতিটা কেমন ছিল?",
      "কোনো এক বৃষ্টির দিনে আমরা একসাথে চা খেলে কেমন হতো?",
      "যদি কোনোদিন সাহস করে আমাকে মনের কথা বলতে পারতে...",
    ],
  },
  {
    id: "birthday",
    label: "জন্মদিনের চিঠি",
    icon: Cake,
    prompts: [
      "আজ আমার জন্মদিন! জন্মদিনের শুভেচ্ছা ও মনের না বলা কথা জানিয়ে যাও",
      "আমার জন্মদিনে এমন কোনো স্মৃতি বা কথা যা কখনো শেয়ার করোনি...",
      "জন্মদিনে তোমার দেওয়া সবচেয়ে প্রিয় উপহার বা অনুভূতি কী হতে পারে?",
    ],
  },
  {
    id: "friends",
    label: "বন্ধুত্ব ও আড্ডা",
    icon: MessageSquareHeart,
    prompts: [
      "আমার কোন অভ্যাসটা তোমার সবচেয়ে বেশি পছন্দ বা অপছন্দ?",
      "আমার সাথে কাটানো তোমার সেরা বা সবচেয়ে হাসির স্মৃতি কোনটা?",
      "আমাকে প্রথম দেখে তোমার মনের ভাবনা কী ছিল?",
    ],
  },
  {
    id: "secret",
    label: "সত্য ও সাহস",
    icon: Lock,
    prompts: [
      "আমার সম্পর্কে একটা সত্য কথা বলো যা কখনো বলোনি...",
      "যদি একদিনের জন্য যা ইচ্ছা বলতে পারতে, কী বলতে?",
      "আমাকে নিয়ে তোমার মনে কোনো না বলা গল্প বা আক্ষেপ আছে?",
    ],
  },
];

export default function CreateSecretInboxPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPrompt, setSelectedPrompt] = useState(
    PROMPT_CATEGORIES[0].prompts[0]
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<StoryThemeId>("crimson");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdData, setCreatedData] = useState<CreateInboxResponse | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInbox, setCopiedInbox] = useState(false);

  const [myInboxes, setMyInboxes] = useState<SavedInboxMeta[]>([]);
  const [isStickerModalOpen, setIsStickerModalOpen] = useState(false);
  const [activeStickerInbox, setActiveStickerInbox] = useState<{
    username: string;
    displayName: string;
    promptText?: string;
    theme?: StoryThemeId;
  } | null>(null);

  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [activeQRCodeInbox, setActiveQRCodeInbox] = useState<{
    username: string;
    displayName: string;
  } | null>(null);

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
      ? customPrompt.trim() || PROMPT_CATEGORIES[0].prompts[0]
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

  const handleWhatsAppShare = () => {
    if (!fullShareUrl) return;
    const shareText = `আমাকে যেকোনো মনের কথা বা না বলা গোপন অনুভূতি লিখে পাঠাও: ${fullShareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  };

  const handleWebShare = async () => {
    if (!fullShareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "গোপন অনুভূতি • বেনামী বার্তা",
          text: `আমাকে যেকোনো মনের কথা বা গোপন অনুভূতি লিখে পাঠাও:`,
          url: fullShareUrl,
        });
      } catch {}
    } else {
      handleCopy(fullShareUrl, false);
    }
  };

  const currentCategoryObj =
    PROMPT_CATEGORIES.find((c) => c.id === activeCategory) || PROMPT_CATEGORIES[0];
  const activeThemeObj = STORY_THEMES[selectedTheme] || STORY_THEMES.crimson;
  const currentPromptText = useCustomPrompt
    ? customPrompt.trim() || "আপনার প্রশ্ন বা অনুভূতি এখানে দেখা যাবে..."
    : selectedPrompt;

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800 text-xs font-extrabold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NGL স্টাইল বেনামী বার্তা ও স্টোরি রিপ্লাই</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#142230] dark:text-white tracking-tight">
            আমাকে যা বলতে চাও, <span className="text-[#7E151E] dark:text-rose-400">গোপনে বলো...</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-600 dark:text-stone-300 font-medium max-w-xl mx-auto leading-relaxed">
            আপনার নিজস্ব সিক্রেট লিংক বানিয়ে ফেসবুক ও ইনস্টাগ্রাম স্টোরিতে শেয়ার করুন। বন্ধুরা ১০০% পরিচয়হীনভাবে মনের কথা পাঠাবে, আর আপনি এক ক্লিকে আকর্ষণীয় স্টোরি কার্ড বানিয়ে শেয়ার করতে পারবেন!
          </p>
        </div>

        {/* 1. Returning User Quick-Access Banner (Welcome Back Hero) */}
        {myInboxes.length > 0 && !createdData && (
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-amber-950/40 rounded-3xl border-2 border-amber-300/80 dark:border-amber-700/60 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] font-black border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>আপনার সক্রিয় ইনবক্স</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
                  <span>স্বাগতম, {myInboxes[0].displayName}!</span>
                  <span className="text-xs font-mono font-bold text-stone-400">
                    (@{myInboxes[0].username})
                  </span>
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  বন্ধুদের পাঠানো গোপন চিঠিগুলো পড়তে সরাসরি আপনার ইনবক্সে যান, বা নতুন স্টোরি স্টিকার নামিয়ে নিন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                <Link
                  href={`/m/${myInboxes[0].username}/inbox?key=${encodeURIComponent(
                    myInboxes[0].manageKey
                  )}`}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7E151E] to-rose-700 hover:opacity-95 text-white text-xs font-extrabold shadow-sm transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquareHeart className="w-4 h-4" />
                  <span>ইনবক্স খুলুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStickerInbox({
                      username: myInboxes[0].username,
                      displayName: myInboxes[0].displayName,
                    });
                    setIsStickerModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-stone-800 text-rose-800 dark:text-rose-200 text-xs font-bold hover:bg-rose-50 transition inline-flex items-center gap-1.5 cursor-pointer"
                  title="স্টোরি স্টিকার কার্ড ডাউনলোড"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                  <span>স্টোরি স্টিকার</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveQRCodeInbox({
                      username: myInboxes[0].username,
                      displayName: myInboxes[0].displayName,
                    });
                    setIsQRCodeModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 transition inline-flex items-center gap-1.5 cursor-pointer"
                  title="কিউআর কার্ড ডাউনলোড"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">কিউআর</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. 3-Step Visual Guide (How It Works 1-2-3) */}
        {!createdData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white dark:bg-[#111827] p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-[#7E151E] dark:text-rose-400 flex items-center justify-center font-black text-xs">
                ১
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white">
                লিংক ও স্টিকার বানান
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                আপনার নাম ও পছন্দের রঙের থিম দিয়ে ৩০ সেকেন্ডে নিজস্ব বেনামী ইনবক্স তৈরি করুন।
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black text-xs">
                ২
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white">
                ইনস্টাগ্রাম বা ফেসবুকে দিন
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                রেডিমেড এইচডি স্টিকার কার্ড নামিয়ে স্টোরিতে দিন অথবা বায়োতে গোপন লিংকটি শেয়ার করুন।
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] p-4.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                ৩
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white">
                সিল ভেঙে উত্তর দিন
              </h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                বন্ধুরা গোপনে চিঠি পাঠাবে; মোমের সিল ভেঙে পড়ুন এবং ১ ক্লিকে স্টোরি কার্ড বানিয়ে উত্তর দিন।
              </p>
            </div>
          </div>
        )}

        {/* 3. Created Success Screen */}
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

            {/* Quick 1-Click Social Sharing Actions Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>হোয়াটসঅ্যাপ</span>
              </button>
              <button
                type="button"
                onClick={handleWebShare}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>সোশ্যাল শেয়ার</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveStickerInbox({
                    username: createdData.inbox.username,
                    displayName: createdData.inbox.displayName,
                    promptText: createdData.inbox.promptText,
                    theme: (createdData.inbox.theme as StoryThemeId) || selectedTheme,
                  });
                  setIsStickerModalOpen(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>স্টোরি স্টিকার</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveQRCodeInbox({
                    username: createdData.inbox.username,
                    displayName: createdData.inbox.displayName,
                  });
                  setIsQRCodeModalOpen(true);
                }}
                className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>কিউআর কার্ড</span>
              </button>
            </div>

            {/* Story Sticker Promo Card */}
            <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 dark:from-rose-950/40 dark:via-amber-950/20 dark:to-rose-950/40 rounded-2xl p-4 sm:p-5 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 text-[11px] font-black">
                  <Sparkles className="w-3 h-3" />
                  <span>NGL স্টাইল স্টোরি স্টিকার</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white">
                  ইনস্টাগ্রাম ও ফেসবুক স্টোরি স্টিকার কার্ড রেডি!
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  রেডিমেড 1080×1920 HD স্টিকার ডাউনলোড করে স্টোরিতে দিন, বন্ধুরা দ্রুত লিংক পেয়ে বার্তা পাঠাবে।
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveQRCodeInbox({
                      username: createdData.inbox.username,
                      displayName: createdData.inbox.displayName,
                    });
                    setIsQRCodeModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-[#7E151E] hover:text-[#7E151E] font-bold text-xs sm:text-sm shadow-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                  <span>কিউআর কার্ড</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStickerInbox({
                      username: createdData.inbox.username,
                      displayName: createdData.inbox.displayName,
                      promptText: createdData.inbox.promptText,
                      theme: (createdData.inbox.theme as StoryThemeId) || selectedTheme,
                    });
                    setIsStickerModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7E151E] to-rose-700 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>স্টোরি স্টিকার কার্ড ডাউনলোড</span>
                </button>
              </div>
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
          /* 4. Split Creation Workspace (Form on Left / Live Sticker Preview on Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form (7 Columns) */}
            <div className="lg:col-span-7">
              <form
                id="create-inbox-form"
                onSubmit={handleCreate}
                className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-7 shadow-sm space-y-6"
              >
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                  <h3 className="text-base sm:text-lg font-black text-[#142230] dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
                    <span>আপনার নিজস্ব বেনামী লিংক তৈরি করুন</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    সহজ ৩টি ধাপে তৈরি করুন আপনার ব্যক্তিগত গোপনীয় চিঠি বক্স
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 1: Username & Name */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      আপনার ইউজারনেম (ইংরেজি ছোট অক্ষর ও সংখ্যা) *
                    </label>
                    <div className="flex items-center rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 px-3 py-2 text-xs sm:text-sm focus-within:border-[#7E151E] focus-within:ring-1 focus-within:ring-[#7E151E] transition">
                      <span className="text-stone-400 font-mono select-none">
                        onuvuti.site/m/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="yourname"
                        value={username}
                        onChange={handleUsernameChange}
                        className="flex-1 bg-transparent font-bold font-mono text-stone-800 dark:text-stone-100 outline-none ml-1"
                      />
                    </div>
                    {/* Live Username Status */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      {username.trim().length >= 3 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>onuvuti.site/m/{username.trim().toLowerCase()} প্রযোজ্য</span>
                        </span>
                      ) : username.trim().length > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          অনূন্য ৩টি অক্ষর লিখুন
                        </span>
                      ) : (
                        <span className="text-stone-400 font-mono">
                          উদাহরণ: rahim, tania, secret_lover
                        </span>
                      )}
                    </div>
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
                    <p className="text-[11px] text-stone-400">এই নামটি আপনার লিংকে ও স্টিকারে দেখাবে</p>
                  </div>
                </div>

                {/* Step 2: Prompt Categories & Selection */}
                <div className="space-y-3 pt-1 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      বন্ধুদের জন্য প্রশ্ন বা প্রম্পট বেছে নিন
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCustomPrompt((prev) => !prev)}
                      className="text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      {useCustomPrompt ? "তৈরি করা প্রম্পট তালিকা" : "নিজের মতো লিখুন"}
                    </button>
                  </div>

                  {!useCustomPrompt ? (
                    <div className="space-y-2.5">
                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {PROMPT_CATEGORIES.map((cat) => {
                          const isCatActive = activeCategory === cat.id;
                          const CatIcon = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setActiveCategory(cat.id)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                isCatActive
                                  ? "bg-[#7E151E] text-white shadow-xs"
                                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                              }`}
                            >
                              <CatIcon className="w-3 h-3" />
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Prompts Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentCategoryObj.prompts.map((p) => {
                          const isSelected = !useCustomPrompt && selectedPrompt === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setSelectedPrompt(p);
                                setUseCustomPrompt(false);
                              }}
                              className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer leading-relaxed ${
                                isSelected
                                  ? "bg-rose-50 dark:bg-rose-950/60 border-[#7E151E] text-[#7E151E] dark:text-rose-300 shadow-xs"
                                  : "bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <input
                        type="text"
                        placeholder="যেমন: আমার এমন একটি কথা বলো যা আজ পর্যন্ত কাউকে বলোনি..."
                        value={customPrompt}
                        maxLength={120}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 outline-none focus:border-[#7E151E]"
                      />
                      <p className="text-[11px] text-stone-400 text-right">
                        {customPrompt.length}/১২০ অক্ষর
                      </p>
                    </div>
                  )}
                </div>

                {/* Step 3: Card Theme Style */}
                <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
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
                              : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:bg-stone-50"
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

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-[#7E151E] hover:bg-[#680f18] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? "তৈরি হচ্ছে..." : "আমার বেনামী লিংক তৈরি করুন"}</span>
                </button>
              </form>
            </div>

            {/* Right Sticky Column: Real-time Live Sticker Card Preview (5 Columns) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 border-b border-stone-100 dark:border-stone-800 pb-2.5">
                  <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Eye className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                    <span>লাইভ স্টিকার প্রিভিউ</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">১০৮০×১৯২০ HD স্টিকার</span>
                </div>

                {/* Simulated Phone Story Card */}
                <div
                  className="rounded-2xl p-5 text-center text-white shadow-xl space-y-4 relative overflow-hidden transition-all duration-300 min-h-[250px] flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(145deg, ${activeThemeObj.bgGradient[0]}, ${activeThemeObj.bgGradient[1]})`,
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-[11px] opacity-85">
                    <span className="font-mono tracking-tight font-bold">onuvuti.site</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-[10px] font-bold">
                      @{username.trim() ? username.trim().toLowerCase() : "yourname"}
                    </span>
                  </div>

                  {/* NGL Floating Question Card */}
                  <div className="bg-white/95 text-stone-900 rounded-2xl p-4 shadow-2xl space-y-2 border border-white/60">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-[#7E151E] text-[10px] font-black tracking-wide uppercase">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>
                        {displayName.trim() ||
                          (username.trim() ? `@${username.trim().toLowerCase()}` : "আপনার নাম")}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-black text-stone-800 leading-snug">
                      &ldquo;{currentPromptText}&rdquo;
                    </p>

                    <div className="text-[10px] font-bold text-stone-500 pt-1.5 border-t border-stone-100 flex items-center justify-center gap-1">
                      <Send className="w-2.5 h-2.5 text-[#7E151E]" />
                      <span>১০০% পরিচয়হীন বেনামী উত্তর পাঠান</span>
                    </div>
                  </div>

                  {/* Card Footer Tag */}
                  <div className="text-[10px] text-white/90 font-bold bg-black/25 backdrop-blur-xs py-1 px-3 rounded-full border border-white/10 mx-auto">
                    ইনস্টাগ্রাম ও ফেসবুক স্টোরি রেডি
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-stone-500 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>লিংক তৈরির সাথে সাথে HD স্টিকার ইমেজ ডাউনলোড হবে</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>প্রিন্ট ও শেয়ারের জন্য সরাসরি কিউআর কোড পোস্টার সুবিধা</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Live Story Preview Showcase (Inspiration Showroom) */}
        {!createdData && (
          <div className="pt-4">
            <LiveStoryShowcase onSelectTheme={(t) => setSelectedTheme(t)} />
          </div>
        )}

        {/* 6. Saved Inboxes Section */}
        {myInboxes.length > 0 && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-extrabold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
                <span>আপনার পূর্বে তৈরি করা লিংকসমূহ ({myInboxes.length})</span>
              </h3>
              <span className="text-[11px] text-stone-400">এই ডিভাইসে সংরক্ষিত</span>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {myInboxes.map((item) => (
                <div
                  key={item.username}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
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

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQRCodeInbox({
                          username: item.username,
                          displayName: item.displayName,
                        });
                        setIsQRCodeModalOpen(true);
                      }}
                      title="কিউআর কোড কার্ড ডাউনলোড"
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-amber-300 hover:text-amber-700 font-bold transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                      <span className="hidden sm:inline">কিউআর</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStickerInbox({
                          username: item.username,
                          displayName: item.displayName,
                        });
                        setIsStickerModalOpen(true);
                      }}
                      title="স্টোরি স্টিকার কার্ড ডাউনলোড"
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:border-rose-300 hover:text-[#7E151E] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                      <span className="hidden sm:inline">স্টোরি কার্ড</span>
                    </button>
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

      {/* NGL-Style Instagram/Facebook Story Sticker Modal */}
      {isStickerModalOpen && activeStickerInbox && (
        <StoryStickerCardModal
          isOpen={isStickerModalOpen}
          onClose={() => setIsStickerModalOpen(false)}
          username={activeStickerInbox.username}
          displayName={activeStickerInbox.displayName}
          promptText={activeStickerInbox.promptText}
          initialTheme={activeStickerInbox.theme || "crimson"}
        />
      )}

      {/* Shareable QR Code Card Modal */}
      {isQRCodeModalOpen && activeQRCodeInbox && (
        <QRCodeCardModal
          isOpen={isQRCodeModalOpen}
          onClose={() => setIsQRCodeModalOpen(false)}
          username={activeQRCodeInbox.username}
          displayName={activeQRCodeInbox.displayName}
        />
      )}

      <SecretFooter />
    </div>
  );
}
