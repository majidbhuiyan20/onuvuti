"use client";

import React, { useState } from "react";
import {
  Heart,
  Share2,
  Check,
  MessageCircle,
  Send,
  EyeOff,
  UserCheck,
} from "lucide-react";

interface CommentItem {
  id: string;
  author: string;
  text: string;
  timeBn: string;
}

interface StoryInteractionsProps {
  storyId: string;
  storyTitle: string;
  initialLikes: number;
}

export default function StoryInteractions({
  storyTitle,
  initialLikes,
}: StoryInteractionsProps) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: "c1",
      author: "তাসনিম জাহান",
      text: "গল্পটা পড়ে মনটা ভীষণ ছুঁয়ে গেল। আমাদের সবার জীবনেই এমন কিছু না বলা অনুভূতি থাকে।",
      timeBn: "২ ঘণ্টা আগে",
    },
    {
      id: "c2",
      author: "নাম প্রকাশে অনিচ্ছুক",
      text: "একদম আমার জীবনের সাথে মিলে গেছে। লেখকের জন্য অনেক শুভকামনা ও ভালোবাসা রইল।",
      timeBn: "৫ ঘণ্টা আগে",
    },
  ]);

  const [commentAuthor, setCommentAuthor] = useState("");
  const [isAnonComment, setIsAnonComment] = useState(false);
  const [commentText, setCommentText] = useState("");

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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: isAnonComment
        ? "নাম প্রকাশে অনিচ্ছুক"
        : commentAuthor.trim() || "পাঠক",
      text: commentText.trim(),
      timeBn: "এইমাত্র",
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  return (
    <div className="space-y-8 pt-6 border-t border-stone-200">
      {/* Love Reaction & Social Share Bar */}
      <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLiked((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition cursor-pointer ${
              liked
                ? "bg-[#80131E] text-white shadow-sm"
                : "bg-[#FAF4E6] text-[#80131E] border border-[#C59B27]/40 hover:bg-[#f3e7cb]"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
            <span>ভালোবাসা জানান ({initialLikes + (liked ? 1 : 0)})</span>
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500 font-medium mr-1">
            প্রিয়জনকে শেয়ার করুন:
          </span>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer"
          >
            WhatsApp
          </button>

          <button
            type="button"
            onClick={handleFacebookShare}
            className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs hover:bg-blue-100 transition cursor-pointer"
          >
            Facebook
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs inline-flex items-center gap-1 hover:bg-stone-200 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>কপি হয়েছে!</span>
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

      {/* Reader Comments / Sympathy Box */}
      <div className="rounded-3xl bg-white border border-stone-200 p-5 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#142230] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#80131E]" />
            <span>পাঠকের অনুভূতি ও সহমর্মিতা ({comments.length})</span>
          </h3>
        </div>

        {/* Write Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!isAnonComment ? (
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="আপনার নাম লিখুন"
                className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#142230] focus:outline-none focus:border-[#80131E]"
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80131E] bg-[#FAF4E6] px-3 py-1.5 rounded-lg">
                <EyeOff className="w-3.5 h-3.5" />
                নাম গোপন থাকবে (নাম প্রকাশে অনিচ্ছুক)
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsAnonComment((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-[#80131E] cursor-pointer"
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
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="এই গল্পটি পড়ে আপনার অনুভূতি বা সহমর্মিতা লিখুন..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E] focus:bg-white"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 hover:bg-[#630d16] transition cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>পাঠান</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-[#FDF8F2] border border-stone-200/80 p-4 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#80131E]">{c.author}</span>
                <span className="text-stone-400">{c.timeBn}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

