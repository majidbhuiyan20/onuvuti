"use client";

import React, { useState, useEffect } from "react";
import { Heart, Mic, FastForward, Sparkles } from "lucide-react";
import type { WishTheme } from "@/data/birthdayTemplates";
import { renderFormattedInline } from "@/lib/formatText";
import { HANDWRITING_FONT } from "../share";
import type { WishContent, WishPublic } from "../types";

interface LetterCardProps {
  wish: WishPublic;
  content: WishContent;
  theme: WishTheme;
}

export default function LetterCard({ wish, content, theme }: LetterCardProps) {
  const handwritten = wish.fontStyle === "handwritten";
  const corner = "absolute text-xs opacity-30 select-none font-serif";

  const isWedding =
    wish.relationship?.includes("বিবাহ") ||
    wish.theme === "wedding_royal" ||
    content.message.includes("শুভ বিবাহ") ||
    content.message.includes("পাত্র:");
  const isAnniversary =
    wish.relationship?.includes("বার্ষিকী") ||
    wish.theme === "anniversary_gold" ||
    content.message.includes("বিবাহবার্ষিকী");
  const isLove =
    wish.relationship?.includes("ভালোবাসার চিঠি") ||
    wish.relationship?.includes("প্রস্তাব") ||
    wish.theme === "rose";

  const cardTitle = isWedding
    ? "শুভ বিবাহ নিমন্ত্রণপত্র"
    : isAnniversary
    ? "শুভ বিবাহবার্ষিকী"
    : isLove
    ? "এক টুকরো অনুভূতি"
    : "শুভ জন্মদিন";

  const cardSubtitle = isWedding
    ? "আপনার ও আপনার পরিবারের সাদর উপস্থিতি কাম্য"
    : isAnniversary
    ? "চিরন্তন ভালোবাসা ও অটুট বন্ধনের শুভেচ্ছা"
    : wish.relationship
    ? `(${wish.relationship} এর জন্য বিশেষ চিঠি)`
    : "একটি পবিত্র অনুভূতির উপহার";

  // Typewriter effect
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedLength(0);
    setIsTyping(true);
    let idx = 0;
    const msgLength = content.message.length;
    const timer = setInterval(() => {
      idx += 1;
      setDisplayedLength(idx);
      if (idx >= msgLength) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 28);
    return () => clearInterval(timer);
  }, [content.message]);

  const handleSkipTyping = () => {
    setDisplayedLength(content.message.length);
    setIsTyping(false);
  };

  return (
    <article
      className="w-full rounded-3xl p-6 sm:p-10 shadow-2xl relative border overflow-hidden transition-all duration-500"
      style={{
        backgroundColor: theme.letterBg,
        color: theme.textColor,
        borderColor: `${theme.accentColor}33`,
        boxShadow: `0 25px 60px -15px rgba(0,0,0,0.6), 0 0 30px ${theme.accentColor}22`,
        fontFamily: handwritten ? HANDWRITING_FONT : undefined,
      }}
    >
      {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
        <div key={pos} className={`${corner} ${pos}`} style={{ color: theme.accentColor }}>
          <Sparkles className="w-3 h-3 opacity-60" />
        </div>
      ))}

      <div className="text-center pb-5 mb-6 border-b border-stone-200/80">
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
          style={{ backgroundColor: `${theme.accentColor}18`, color: theme.accentColor }}
        >
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-wide" style={{ color: theme.accentColor }}>
          {cardTitle}
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          {cardSubtitle}
        </p>
      </div>

      <p className="text-lg font-bold mb-4">
        {isWedding
          ? wish.recipientName.startsWith("জনাব") || wish.recipientName.startsWith("প্রিয়")
            ? wish.recipientName
            : `সম্মানিত ${wish.recipientName},`
          : `প্রিয় ${wish.recipientName},`}
      </p>

      {content.photoUrl && (
        <figure className="my-5 mx-auto max-w-sm rotate-[-1.5deg] bg-white p-2.5 pb-7 rounded-md shadow-lg border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.photoUrl} alt="স্মৃতির ছবি" className="w-full h-auto rounded-sm" />
        </figure>
      )}

      {/* Typewriter message body */}
      <div
        onClick={handleSkipTyping}
        className="text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-line font-medium opacity-90 my-4 pl-1 cursor-pointer select-text"
        title={isTyping ? "সম্পূর্ণ পড়তে ক্লিক করুন" : undefined}
      >
        {renderFormattedInline(content.message.slice(0, displayedLength))}
        {isTyping && (
          <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse align-middle" />
        )}
      </div>

      {isTyping && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSkipTyping}
            className="text-[11px] font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 underline cursor-pointer inline-flex items-center gap-1"
          >
            <FastForward className="w-3 h-3" />
            <span>একবারে সম্পূর্ণ পড়ুন</span>
          </button>
        </div>
      )}

      {content.voiceUrl && (
        <div className="mt-5 p-3 rounded-2xl border" style={{ borderColor: `${theme.accentColor}33`, backgroundColor: `${theme.accentColor}0d` }}>
          <span className="block text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: theme.accentColor }}>
            <Mic className="w-3.5 h-3.5" />
            <span>{wish.senderName}-এর কণ্ঠে একটি বার্তা</span>
          </span>
          <audio src={content.voiceUrl} controls className="w-full h-10" />
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-stone-200/80 text-right">
        <span className="text-xs text-stone-500 block">ভালোবাসা ও শুভকামনায়,</span>
        <span className="text-lg font-bold block mt-1" style={{ color: theme.accentColor }}>
          — {wish.senderName}
        </span>
      </div>
    </article>
  );
}

