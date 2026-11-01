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
  Sparkles,
  Users,
  Download,
} from "lucide-react";
import { sanitizeText } from "@/lib/security";
import { GO_API_BASE_URL } from "@/lib/goApi";

interface CommentItem {
  id: string;
  author: string;
  text: string;
  timeBn: string;
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
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
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
}: StoryInteractionsProps) {
  const [activeReaction, setActiveReaction] = useState<
    "love" | "touched" | "relatable" | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  const baseLove = initialReactions?.love ?? initialLikes;
  const baseTouched =
    initialReactions?.touched ?? Math.round(initialLikes * 0.45);
  const baseRelatable =
    initialReactions?.relatable ?? Math.round(initialLikes * 0.3);

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
  const [honeypot, setHoneypot] = useState("");
  const [lastCommentAt, setLastCommentAt] = useState(0);
  const [commentError, setCommentError] = useState<string | null>(null);

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

  // 1-Click Shareable Quote Card / Story Poster Generator (1080x1350 Portrait)
  const handleDownloadStoryCard = async () => {
    if (typeof window === "undefined") return;
    setDownloadingCard(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Warm Cream Editorial Background
      ctx.fillStyle = "#FDF8F2";
      ctx.fillRect(0, 0, 1080, 1350);

      // 2. Outer Crimson & Inner Gold Frame
      ctx.strokeStyle = "#80131E";
      ctx.lineWidth = 6;
      ctx.strokeRect(48, 48, 984, 1254);

      ctx.strokeStyle = "#C59B27";
      ctx.lineWidth = 2;
      ctx.strokeRect(64, 64, 952, 1222);

      // 3. Top Category Pill
      const badgeText = confessionIdBn
        ? `${storyCategory} • ${confessionIdBn}`
        : storyCategory;
      ctx.fillStyle = "#FAF4E6";
      ctx.fillRect(110, 115, 420, 56);
      ctx.strokeStyle = "#C59B27";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(110, 115, 420, 56);

      ctx.fillStyle = "#80131E";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(badgeText, 136, 152);

      // 4. Story Title
      ctx.fillStyle = "#142230";
      ctx.font = "bold 46px sans-serif";
      const titleLines = wrapCanvasText(ctx, storyTitle, 840).slice(0, 3);
      let cursorY = 260;
      for (const line of titleLines) {
        ctx.fillText(line, 110, cursorY);
        cursorY += 64;
      }

      // 5. Divider Line
      cursorY += 20;
      ctx.fillStyle = "#C59B27";
      ctx.fillRect(110, cursorY, 140, 5);
      cursorY += 75;

      // 6. Quote / Excerpt Body
      const quoteBody = `“${storyExcerpt || storyTitle}”`;
      ctx.fillStyle = "#334155";
      ctx.font = "36px sans-serif";
      const quoteLines = wrapCanvasText(ctx, quoteBody, 840).slice(0, 7);
      for (const line of quoteLines) {
        ctx.fillText(line, 110, cursorY);
        cursorY += 56;
      }

      // 7. Author Name
      cursorY += 35;
      ctx.fillStyle = "#80131E";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(`— ${storyAuthor}`, 110, cursorY);

      // 8. Footer Bar with Logo & Website Domain
      ctx.fillStyle = "#FAF4E6";
      ctx.fillRect(66, 1140, 948, 144);

      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => resolve();
          logoImg.src = "/images/Onuvuti-Publications-Logo.png";
        });
        if (logoImg.width > 0) {
          const targetH = 84;
          const targetW = (logoImg.width / logoImg.height) * targetH;
          ctx.drawImage(logoImg, 110, 1170, targetW, targetH);
        }
      } catch {
        // Ignore logo load error
      }

      ctx.fillStyle = "#80131E";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("পড়ুন: www.onuvuti.site", 965, 1205);
      ctx.fillStyle = "#57534E";
      ctx.font = "22px sans-serif";
      ctx.fillText("রোমান্টিক গল্প, ক্রাশ কনফেশন ও না বলা কথা", 965, 1242);
      ctx.textAlign = "left";

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Onuvuti-Story-Card-${storyId}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloadingCard(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (honeypot.trim().length > 0) return;

    const now = Date.now();
    if (now - lastCommentAt < 10_000) {
      setCommentError("অনুগ্রহ করে ১০ সেকেন্ড অপেক্ষা করে পরবর্তী মন্তব্য করুন।");
      return;
    }

    const cleanText = sanitizeText(commentText, 800);
    const cleanAuthor = sanitizeText(commentAuthor, 60);

    if (!cleanText || cleanText.length < 2) return;

    const newComment: CommentItem = {
      id: `c-${now}`,
      author: isAnonComment
        ? "নাম প্রকাশে অনিচ্ছুক"
        : cleanAuthor || "পাঠক",
      text: cleanText,
      timeBn: "এইমাত্র",
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
    setLastCommentAt(now);

    fetch(
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
    ).catch(() => {});
  };

  const toggleReaction = (type: "love" | "touched" | "relatable") => {
    setActiveReaction((prev) => {
      const next = prev === type ? null : type;
      if (next) {
        fetch(
          `${GO_API_BASE_URL}/stories/${encodeURIComponent(storyId)}/react`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type }),
          }
        ).catch(() => {});
      }
      return next;
    });
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
              <span>
                ভালোবাসা ({baseLove + (activeReaction === "love" ? 1 : 0)})
              </span>
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
              <span>
                মন ছুঁয়েছে (
                {baseTouched + (activeReaction === "touched" ? 1 : 0)})
              </span>
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
              <span>
                আমারও গল্প (
                {baseRelatable + (activeReaction === "relatable" ? 1 : 0)})
              </span>
            </button>
          </div>

          {/* 1-Click Story Poster Download + Share Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={downloadingCard}
              onClick={handleDownloadStoryCard}
              className="px-3.5 py-2 rounded-xl bg-[#80131E] text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-[#630d16] transition cursor-pointer shadow-xs disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadingCard
                  ? "কার্ড তৈরি হচ্ছে..."
                  : "স্টোরি কার্ড ডাউনলোড"}
              </span>
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
              className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 hover:bg-[#630d16] transition cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>পাঠান</span>
            </button>
          </div>

          {commentError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{commentError}</p>
          )}
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 p-4 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#80131E] dark:text-rose-400">{c.author}</span>
                <span className="text-stone-400 dark:text-stone-500">{c.timeBn}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
