"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Share2,
  Check,
  MessageCircle,
  Send,
  EyeOff,
  UserCheck,
  Sparkles,
  Users,
  Download,
} from "lucide-react";
import { sanitizeText } from "@/lib/security";
import { GO_API_BASE_URL } from "@/lib/goApi";
import StoryCardCustomizerModal from "@/components/StoryCardCustomizerModal";

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  timeBn: string;
  createdAt?: string;
}

interface StoryInteractionsProps {
  storyId: string;
  storyTitle: string;
  storyExcerpt?: string;
  storyCategory?: string;
  storyAuthor?: string;
  confessionIdBn?: string;
  initialLikes: number;
  initialReactions?: {
    love: number;
    touched: number;
    relatable: number;
  };
  initialComments?: CommentItem[];
}

export default function StoryInteractions({
  storyId,
  storyTitle,
  storyExcerpt = "",
  storyCategory = "অনুভূতি",
  storyAuthor = "নাম প্রকাশে অনিচ্ছুক",
  confessionIdBn,
  initialLikes,
  initialReactions,
  initialComments = [],
}: StoryInteractionsProps) {
  const [activeReaction, setActiveReaction] = useState<
    "love" | "touched" | "relatable" | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const [reactions, setReactions] = useState<{
    love: number;
    touched: number;
    relatable: number;
  }>({
    love: initialReactions?.love ?? (initialLikes || 1),
    touched: initialReactions?.touched ?? 0,
    relatable: initialReactions?.relatable ?? 0,
  });

  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [isAnonComment, setIsAnonComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [lastCommentAt, setLastCommentAt] = useState(0);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedReaction = localStorage.getItem(`onuvuti_reacted_${storyId}`);
      if (
        savedReaction === "love" ||
        savedReaction === "touched" ||
        savedReaction === "relatable"
      ) {
        setActiveReaction(savedReaction);
      }
    }
  }, [storyId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = `${storyTitle} — পড়ুন অনুভূতি-তে: ${url}`;
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const handleFacebookShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);
    setCommentSuccess(false);

    if (honeypot.trim().length > 0) return;

    const now = Date.now();
    if (now - lastCommentAt < 6_000) {
      setCommentError("অনুগ্রহ করে ৬ সেকেন্ড অপেক্ষা করে পরবর্তী মন্তব্য করুন।");
      return;
    }

    const cleanText = sanitizeText(commentText, 800);
    const cleanAuthor = sanitizeText(commentAuthor, 60);

    if (!cleanText || cleanText.length < 2) {
      setCommentError("মন্তব্যটি খুব ছোট। অনুগ্রহ করে মনের অনুভূতি প্রকাশ করুন।");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/stories/${encodeURIComponent(storyId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: cleanAuthor,
            isAnonymous: isAnonComment,
            text: cleanText,
            websiteUrl: honeypot,
          }),
        }
      );

      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentText("");
        setLastCommentAt(now);
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 4000);
      } else {
        const errMsg =
          data?.error ||
          "মন্তব্য সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
        setCommentError(errMsg);
      }
    } catch {
      // Offline fallback
      const fallbackComment: CommentItem = {
        id: `c-${now}`,
        author: isAnonComment
          ? "নাম প্রকাশে অনিচ্ছুক"
          : cleanAuthor || "পাঠক",
        text: cleanText,
        timeBn: "এইমাত্র",
      };
      setComments((prev) => [fallbackComment, ...prev]);
      setCommentText("");
      setLastCommentAt(now);
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleReaction = async (type: "love" | "touched" | "relatable") => {
    if (activeReaction === type) return;

    const prevType = activeReaction;
    setActiveReaction(type);

    setReactions((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
      ...(prevType ? { [prevType]: Math.max(0, (prev[prevType] || 0) - 1) } : {}),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem(`onuvuti_reacted_${storyId}`, type);
    }

    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/stories/${encodeURIComponent(storyId)}/react`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data.reactions) {
          setReactions(data.reactions);
        }
      }
    } catch {
      // optimistic count retained
    }
  };

  return (
    <div className="space-y-8 pt-6 border-t border-stone-200 dark:border-stone-800">
      {/* 3 Emotional Reactions, 1-Click Story Poster Generator & Social Share Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleReaction("love")}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition cursor-pointer ${
                activeReaction === "love"
                  ? "bg-[#80131E] text-white shadow-sm"
                  : "bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 border border-[#C59B27]/40 dark:border-[#C59B27]/30 hover:bg-[#f3e7cb] dark:hover:bg-[#253348]"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  activeReaction === "love" ? "fill-white" : ""
                }`}
              />
              <span>ভালোবাসা ({reactions.love})</span>
            </button>

            <button
              type="button"
              onClick={() => toggleReaction("touched")}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition cursor-pointer ${
                activeReaction === "touched"
                  ? "bg-[#80131E] text-white shadow-sm"
                  : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#80131E]/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>মন ছুঁয়েছে ({reactions.touched})</span>
            </button>

            <button
              type="button"
              onClick={() => toggleReaction("relatable")}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition cursor-pointer ${
                activeReaction === "relatable"
                  ? "bg-[#80131E] text-white shadow-sm"
                  : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#80131E]/40"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>আমারও গল্প ({reactions.relatable})</span>
            </button>
          </div>

          {/* 1-Click Story Poster Download + Share Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#80131E] text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#630d16] transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্টোরি কার্ড তৈরি (v2)</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
            >
              WhatsApp
            </button>

            <button
              type="button"
              onClick={handleFacebookShare}
              className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
            >
              Facebook
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs inline-flex items-center gap-1 hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>লিংক কপি</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reader Comments / Sympathy Box */}
      <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
            <span>পাঠকের অনুভূতি ও সহমর্মিতা ({comments.length})</span>
          </h3>
        </div>

        {/* Write Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <input
            type="text"
            name="website_url"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            {!isAnonComment ? (
              <input
                type="text"
                maxLength={60}
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-[#80131E]"
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80131E] dark:text-rose-300 bg-[#FAF4E6] dark:bg-[#1E293B] px-3 py-1.5 rounded-lg border border-[#C59B27]/30">
                <EyeOff className="w-3.5 h-3.5" />
                নাম গোপন থাকবে (নাম প্রকাশে অনিচ্ছুক)
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsAnonComment((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-[#80131E] dark:hover:text-rose-400 cursor-pointer"
            >
              {isAnonComment ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>নিজের নাম দিন</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>নাম গোপন রাখুন</span>
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              required
              maxLength={800}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="এই গল্পটি পড়ে আপনার অনুভূতি বা সহমর্মিতা লিখুন..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-[#80131E] focus:bg-white dark:focus:bg-[#1A2234]"
            />
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 hover:bg-[#630d16] disabled:opacity-60 transition cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingComment ? "পাঠানো হচ্ছে..." : "পাঠান"}</span>
            </button>
          </div>

          {commentSuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>আপনার মন্তব্যটি সফলভাবে যুক্ত হয়েছে!</span>
            </p>
          )}

          {commentError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{commentError}</p>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <div className="rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 p-6 text-center space-y-1.5">
              <MessageCircle className="w-8 h-8 text-[#80131E]/40 dark:text-rose-400/40 mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                এই গল্পটিতে এখনো কোনো মন্তব্য করা হয়নি।
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                লেখাটি পড়ে আপনার অনুভূতি বা সহমর্মিতা প্রথম প্রকাশ করুন।
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 p-4 space-y-1 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#80131E] dark:text-rose-400">{c.author}</span>
                  <span className="text-stone-400 dark:text-stone-500">{c.timeBn || "এইমাত্র"}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Story Card Poster Generator v2 Modal */}
      <StoryCardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        storyId={storyId}
        storyTitle={storyTitle}
        storyExcerpt={storyExcerpt}
        storyCategory={storyCategory}
        storyAuthor={storyAuthor}
        confessionIdBn={confessionIdBn}
      />
    </div>
  );
}
