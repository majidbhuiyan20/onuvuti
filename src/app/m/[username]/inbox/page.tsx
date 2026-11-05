"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";


import {
  Inbox,
  Lock,
  Sparkles,
  Share2,
  Copy,
  Check,
  Trash2,
  MessageCircle,
  Download,
  Send,
  X,
  Palette,
  Eye,
  AlertCircle,
  Clock,
  ArrowLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import {
  getPrivateInbox,
  replySecretMessage,
  deleteSecretMessage,
} from "@/features/secret/api";
import { getMySavedInboxes } from "@/features/secret/storage";
import {
  PrivateInboxView,
  SecretInboxPublic,
  SecretMessage,
  StoryThemeId,
} from "@/features/secret/types";
import {
  STORY_THEMES,
  renderStoryToCanvas,
  downloadStoryImage,
  shareStoryImage,
} from "@/features/secret/storyGenerator";
import EnvelopeCard, { WAX_SEAL_ICONS } from "@/features/secret/EnvelopeCard";
import LetterRevealModal from "@/features/secret/LetterRevealModal";
import SecretFooter from "@/features/secret/SecretFooter";

function PrivateInboxContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername).toLowerCase() : "";

  const queryKey = searchParams?.get("key") || "";
  const [manageKey, setManageKey] = useState(queryKey);
  const [manualKeyInput, setManualKeyInput] = useState("");

  const [inboxView, setInboxView] = useState<PrivateInboxView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Story Reply Modal State
  const [activeMessage, setActiveMessage] = useState<SecretMessage | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<StoryThemeId>("crimson");
  const [savingReply, setSavingReply] = useState(false);
  const [sharingStory, setSharingStory] = useState(false);

  // Letter Reveal Modal State (Interactive Tap-to-Break Wax Seal)
  const [revealModalMessage, setRevealModalMessage] = useState<SecretMessage | null>(null);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isInitialUnopened, setIsInitialUnopened] = useState(false);
  const [openedMessageIds, setOpenedMessageIds] = useState<Record<string, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load opened message tracking state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && username) {
      try {
        const stored = localStorage.getItem(`onuvuti_opened_msgs_${username}`);
        if (stored) {
          setOpenedMessageIds(JSON.parse(stored));
        }
      } catch {}
    }
  }, [username]);

  // If no key in URL, look up in localStorage
  useEffect(() => {
    if (!manageKey && username) {
      const savedList = getMySavedInboxes();
      const found = savedList.find(
        (item) => item.username.toLowerCase() === username.toLowerCase()
      );
      if (found?.manageKey) {
        setManageKey(found.manageKey);
      }
    }
  }, [username, manageKey]);

  const handleOpenLetterModal = (msg: SecretMessage, isUnopened = false) => {
    setRevealModalMessage(msg);
    setIsInitialUnopened(isUnopened);
    setIsRevealModalOpen(true);

    if (isUnopened) {
      setOpenedMessageIds((prev) => {
        const next = { ...prev, [msg.id]: true };
        try {
          localStorage.setItem(`onuvuti_opened_msgs_${username}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  // Load inbox data
  const loadInbox = async (key: string) => {
    if (!username || !key) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getPrivateInbox(username, key);
      setInboxView(data);
    } catch (err) {
      setError((err as Error).message || "ইনবক্স লোড করতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (manageKey) {
      loadInbox(manageKey);
    } else {
      setLoading(false);
    }
  }, [username, manageKey]);

  // Re-render canvas whenever reply text, active message or theme changes
  useEffect(() => {
    if (!activeMessage || !canvasRef.current || !inboxView) return;

    renderStoryToCanvas({
      canvas: canvasRef.current,
      displayName: inboxView.inbox.displayName,
      username: inboxView.inbox.username,
      questionContent: activeMessage.content,
      moodEmoji: activeMessage.moodEmoji,
      replyText: replyInput,
      themeId: selectedTheme,
    });
  }, [activeMessage, replyInput, selectedTheme, inboxView]);

  const handleOpenReplyModal = (msg: SecretMessage) => {
    setActiveMessage(msg);
    setReplyInput(msg.replyText || "");
    setSelectedTheme(
      (msg.cardTheme as StoryThemeId) in STORY_THEMES
        ? (msg.cardTheme as StoryThemeId)
        : "crimson"
    );
  };

  const handleSaveReplyOnly = async () => {
    if (!activeMessage || !manageKey) return;
    setSavingReply(true);
    try {
      await replySecretMessage(
        username,
        activeMessage.id,
        manageKey,
        replyInput.trim()
      );
      // Update local state
      setInboxView((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === activeMessage.id
              ? { ...m, replyText: replyInput.trim(), isRead: true }
              : m
          ),
        };
      });
      alert("উত্তর সংরক্ষিত হয়েছে!");
    } catch (err) {
      alert((err as Error).message || "উত্তর সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSavingReply(false);
    }
  };

  const handleDownloadStory = async () => {
    if (!canvasRef.current) return;
    // Auto-save reply if not saved
    if (activeMessage && manageKey && replyInput.trim()) {
      replySecretMessage(
        username,
        activeMessage.id,
        manageKey,
        replyInput.trim()
      ).catch(() => {});
    }
    await downloadStoryImage(
      canvasRef.current,
      `onuvuti-${username}-story-${Date.now()}.png`
    );
  };

  const handleShareStory = async () => {
    if (!canvasRef.current) return;
    setSharingStory(true);
    try {
      if (activeMessage && manageKey && replyInput.trim()) {
        await replySecretMessage(
          username,
          activeMessage.id,
          manageKey,
          replyInput.trim()
        ).catch(() => {});
      }
      await shareStoryImage(canvasRef.current, username);
    } finally {
      setSharingStory(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই বার্তাটি মুছে ফেলতে চান?")) return;
    if (!manageKey) return;

    try {
      await deleteSecretMessage(username, msgId, manageKey);
      setInboxView((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== msgId),
        };
      });
    } catch (err) {
      alert((err as Error).message || "মুছে ফেলা সম্ভব হয়নি");
    }
  };

  const handleCopyShareLink = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/m/${username}`
        : `https://onuvuti.site/m/${username}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffSec = Math.floor(
        (Date.now() - new Date(isoString).getTime()) / 1000
      );
      if (diffSec < 60) return "এইমাত্র";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} মিনিট আগে`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} ঘণ্টা আগে`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays} দিন আগে`;
    } catch {
      return "কিছুক্ষণ আগে";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FAF7F2]/95 dark:bg-[#0B0F17]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/m"
              className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-[#7E151E] dark:text-rose-400">
                গোপন ইনবক্স
              </span>
              <span className="text-xs text-stone-400 font-mono">
                (@{username})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3.5 py-1.5 rounded-full bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "কপি হয়েছে" : "পাবলিক লিংক কপি"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Missing Key Gate */}
        {!manageKey ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-sm max-w-md mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-[#142230] dark:text-white">
              ইনবক্সের সিক্রেট কী দিন
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              আপনার লিংক তৈরির সময় যে সিক্রেট কী (Key) দেওয়া হয়েছিল তা লিখুন:
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualKeyInput.trim()) setManageKey(manualKeyInput.trim());
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                placeholder="ম্যানেজ কী লিখুন..."
                value={manualKeyInput}
                onChange={(e) => setManualKeyInput(e.target.value)}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-3.5 py-2.5 text-xs font-mono font-bold text-center outline-none focus:border-[#7E151E]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#7E151E] text-white font-bold text-xs shadow-xs hover:bg-[#680f18] transition cursor-pointer"
              >
                ইনবক্স খুলুন
              </button>
            </form>
          </div>
        ) : loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-500">ইনবক্সের বার্তা লোড হচ্ছে...</p>
          </div>
        ) : error || !inboxView ? (
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 text-center border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-stone-800 dark:text-stone-100">
              ইনবক্স অ্যাক্সেস ব্যর্থ
            </h2>
            <p className="text-xs text-stone-500">{error}</p>
            <button
              type="button"
              onClick={() => setManageKey("")}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-200"
            >
              অন্য কী দিয়ে চেষ্টা করুন
            </button>
          </div>
        ) : (
          /* Inbox View */
          <div className="space-y-6">
            {/* Header Summary Banner */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-[#142230] dark:text-white">
                    {inboxView.inbox.displayName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold">
                    {inboxView.messages.length}টি বার্তা
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  প্রম্পট: &ldquo;{inboxView.inbox.promptText}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-100"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>স্টোরি লিংক শেয়ার</span>
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            {inboxView.messages.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950 text-[#7E151E] dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-100">
                  এখনো কোনো বেনামী বার্তা আসেনি
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  আপনার ফেসবুক বা ইনস্টাগ্রাম স্টোরিতে লিংকটি শেয়ার করুন। বন্ধুরা যখনই গোপনে বার্তা পাঠাবে, তা সরাসরি এখানে জমা হবে!
                </p>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-5 py-2.5 rounded-full bg-[#7E151E] text-white text-xs font-bold shadow-md hover:bg-[#680f18] transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>লিংক কপি করে স্টোরিতে দিন</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-stone-500 uppercase tracking-wider">
                    আগত চিঠিসমূহ ({inboxView.messages.length})
                  </h2>
                  <span className="text-[11px] text-stone-400">
                    খুলতে মোমের সিলে স্পর্শ করুন
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {inboxView.messages.map((msg) => {
                    const isOpened = Boolean(
                      openedMessageIds[msg.id] || msg.isRead || msg.replyText
                    );
                    const seal =
                      msg.moodEmoji in WAX_SEAL_ICONS
                        ? WAX_SEAL_ICONS[msg.moodEmoji]
                        : WAX_SEAL_ICONS.crush;
                    const SealIcon = seal.icon;

                    if (!isOpened) {
                      /* 1. Unopened Sealed Vintage Envelope Card */
                      return (
                        <div
                          key={msg.id}
                          className="rounded-3xl border-2 border-amber-500/40 dark:border-amber-500/20 bg-gradient-to-br from-[#FFFBF2] via-white to-[#FFF5E6] dark:from-[#1C1710] dark:via-[#111827] dark:to-[#18130C] p-5 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>সিলমোহরকৃত নতুন চিঠি</span>
                            </span>

                            <span className="text-[11px] text-stone-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(msg.createdAt)}</span>
                            </span>
                          </div>

                          {/* Interactive Envelope Preview */}
                          <div
                            onClick={() => handleOpenLetterModal(msg, true)}
                            className="py-2 flex justify-center cursor-pointer group"
                            title="চিঠিটি খুলতে স্পর্শ করুন"
                          >
                            <EnvelopeCard
                              theme={msg.cardTheme || "crimson"}
                              sealCategory={msg.moodEmoji || "crush"}
                              recipientUsername={inboxView.inbox.username}
                              recipientDisplayName={inboxView.inbox.displayName}
                              isOpened={false}
                              showClickHint={false}
                              size="sm"
                              className="group-hover:scale-102 transition duration-200"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-stone-200/70 dark:border-stone-800">
                            <button
                              type="button"
                              onClick={() => handleOpenLetterModal(msg, true)}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-stone-900" />
                              <span>মোমের সিল ভেঙে পড়ুন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="চিঠি মুছে ফেলুন"
                              className="p-2.5 text-stone-400 hover:text-red-600 transition cursor-pointer rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    /* 2. Opened Letter Parchment Card */
                    return (
                      <div
                        key={msg.id}
                        className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                                <SealIcon className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                                <span>{seal.label}</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                খোলা হয়েছে
                              </span>
                            </div>

                            <span className="text-[11px] text-stone-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(msg.createdAt)}</span>
                            </span>
                          </div>

                          {/* Letter Content Preview (Clickable to reveal full modal) */}
                          <div
                            onClick={() => handleOpenLetterModal(msg, false)}
                            className="p-4 rounded-2xl bg-[#FAF5E8]/60 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 cursor-pointer hover:border-[#D4AF37] transition group"
                            title="সম্পূর্ণ চিঠিটি পড়ুন"
                          >
                            <p className="text-sm font-serif font-medium text-stone-800 dark:text-stone-100 leading-relaxed whitespace-pre-wrap line-clamp-3">
                              &ldquo;{msg.content}&rdquo;
                            </p>
                            <span className="text-[11px] text-[#7E151E] dark:text-rose-400 font-bold block pt-2 group-hover:underline">
                              সম্পূর্ণ চিঠি খুলুন →
                            </span>
                          </div>

                          {/* Existing Reply if any */}
                          {msg.replyText && (
                            <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/60 space-y-1">
                              <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>আপনার উত্তর:</span>
                              </div>
                              <p className="text-xs font-medium text-stone-700 dark:text-stone-200 leading-relaxed">
                                {msg.replyText}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenLetterModal(msg, false)}
                            className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>চিঠি পড়ুন</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReplyModal(msg)}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#7E151E] to-rose-700 hover:from-[#680f18] hover:to-rose-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              {msg.replyText
                                ? "স্টোরি এডিট"
                                : "উত্তর ও স্টোরি কার্ড"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="বার্তা মুছে ফেলুন"
                            className="p-2 text-stone-400 hover:text-red-600 transition cursor-pointer rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Story Studio Modal (1080x1920 Story Generator) */}
        {activeMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#142230] dark:text-white">
                      ইনস্টাগ্রাম / ফেসবুক স্টোরি কার্ড স্টুডিও
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      ১০৮০x১৯২০ ফুল এইচডি স্টোরি কার্ড
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveMessage(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Question Preview */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                <span className="font-bold text-stone-500">প্রশ্ন / বার্তা:</span>
                <p className="mt-1 font-bold text-stone-800 dark:text-stone-100">
                  {activeMessage.moodEmoji} &ldquo;{activeMessage.content}&rdquo;
                </p>
              </div>

              {/* Reply Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  আপনার উত্তর লিখুন:
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="আপনার মজার বা রোমান্টিক উত্তর এখানে লিখুন..."
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900 p-3.5 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 outline-none focus:border-[#7E151E] focus:ring-1 focus:ring-[#7E151E] transition resize-none leading-relaxed"
                />
              </div>

              {/* Theme Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                  <span>স্টোরি থিম নির্বাচন করুন:</span>
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

              {/* Live Canvas Preview (scaled down smoothly to fit preview) */}
              <div className="space-y-1.5 text-center">
                <div className="text-[11px] font-bold text-stone-400">
                  লাইভ স্টোরি প্রিভিউ (১০৮০ × ১৯২০)
                </div>
                <div className="bg-stone-900/90 rounded-2xl p-3 inline-block max-h-72 overflow-hidden shadow-inner border border-stone-800">
                  <canvas
                    ref={canvasRef}
                    className="h-64 w-auto rounded-lg shadow-lg mx-auto object-contain"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleShareStory}
                  disabled={sharingStory}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#7E151E] to-rose-700 hover:opacity-95 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  <span>
                    {sharingStory
                      ? "প্রস্তুত হচ্ছে..."
                      : "ইনস্টাগ্রাম / ফেসবুক স্টোরিতে দিন"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadStory}
                  className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>HD স্টোরি ছবি ডাউনলোড (PNG)</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={handleSaveReplyOnly}
                  disabled={savingReply}
                  className="text-stone-500 hover:text-[#7E151E] font-bold underline cursor-pointer"
                >
                  {savingReply ? "সংরক্ষণ হচ্ছে..." : "শুধু উত্তর সেভ করুন (ছবি ছাড়া)"}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMessage(null)}
                  className="text-stone-400 hover:text-stone-600 font-bold cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Interactive Letter Reveal Modal (Tap-to-Break Wax Seal) */}
        <LetterRevealModal
          isOpen={isRevealModalOpen}
          onClose={() => setIsRevealModalOpen(false)}
          message={revealModalMessage}
          inbox={inboxView?.inbox || null}
          onOpenReply={(msg) => handleOpenReplyModal(msg)}
          onDeleteMessage={(id) => handleDeleteMessage(id)}
          isInitialUnopened={isInitialUnopened}
        />
      </main>

      <SecretFooter />
    </div>
  );
}

export default function PrivateInboxPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PrivateInboxContent />
    </Suspense>
  );
}
