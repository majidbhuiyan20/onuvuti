"use client";

import React, { useState, useEffect } from "react";
import { Heart, Mic, FastForward, Sparkles, Maximize2, X } from "lucide-react";
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
  const [showPhotoZoom, setShowPhotoZoom] = useState(false);

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
    <>
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
        {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
          <div key={pos} className={`${corner} ${pos}`} style={{ color: theme.accentColor }}>
            <Sparkles className="w-3.5 h-3.5 opacity-60" />
          </div>
        ))}

        {/* Header Crest */}
        <div className="text-center pb-5 mb-6 border-b border-stone-200/80">
          <div
            className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-2 shadow-xs"
            style={{ backgroundColor: `${theme.accentColor}18`, color: theme.accentColor }}
          >
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide" style={{ color: theme.accentColor }}>
            {cardTitle}
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {cardSubtitle}
          </p>
        </div>

        {/* Salutation */}
        <p className="text-lg sm:text-xl font-bold mb-4">
          {isWedding
            ? wish.recipientName.startsWith("জনাব") || wish.recipientName.startsWith("প্রিয়")
              ? wish.recipientName
              : `সম্মানিত ${wish.recipientName},`
            : `প্রিয় ${wish.recipientName},`}
        </p>

        {/* Tactile Vintage Polaroid Frame */}
        {content.photoUrl && (
          <div className="my-6 mx-auto max-w-sm flex flex-col items-center">
            {/* Washi Tape Accent */}
            <div className="w-24 h-6 -mb-3 z-10 relative bg-amber-100/85 backdrop-blur-xs border border-amber-300/40 shadow-xs rotate-[-2deg] rounded-xs" />

            <figure
              onClick={() => setShowPhotoZoom(true)}
              className="w-full rotate-[-1deg] hover:rotate-0 transition-transform duration-300 bg-white p-3 pb-8 rounded-xl shadow-xl border border-stone-200 cursor-pointer group relative"
            >
              <div className="relative overflow-hidden rounded-md bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.photoUrl}
                  alt="স্মৃতির ছবি"
                  className="w-full h-auto object-cover max-h-80 group-hover:scale-102 transition duration-500"
                />
                <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition shadow">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <figcaption className="text-center text-[11px] text-stone-500 mt-3 font-serif italic">
                স্মৃতির একটি প্রিয় মুহূর্ত • বড় করে দেখতে ক্লিক করুন
              </figcaption>
            </figure>
          </div>
        )}

        {/* Typewriter message body */}
        <div
          onClick={handleSkipTyping}
          className="text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-line font-medium opacity-90 my-5 pl-1 cursor-pointer select-text"
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

        {/* Audio Message */}
        {content.voiceUrl && (
          <div
            className="mt-6 p-4 rounded-2xl border"
            style={{
              borderColor: `${theme.accentColor}33`,
              backgroundColor: `${theme.accentColor}0d`,
            }}
          >
            <span
              className="text-xs font-bold mb-2 flex items-center gap-1.5"
              style={{ color: theme.accentColor }}
            >
              <Mic className="w-4 h-4" />
              <span>{wish.senderName}-এর কণ্ঠে একটি বিশেষ বার্তা</span>
            </span>
            <audio src={content.voiceUrl} controls className="w-full h-10" />
          </div>
        )}

        {/* Signature */}
        <div className="mt-8 pt-4 border-t border-stone-200/80 text-right">
          <span className="text-xs text-stone-500 block">ভালোবাসা ও শুভকামনায়,</span>
          <span className="text-lg font-bold block mt-1" style={{ color: theme.accentColor }}>
            — {wish.senderName}
          </span>
        </div>
      </article>

      {/* Lightbox Photo Zoom Modal */}
      {showPhotoZoom && content.photoUrl && (
        <div
          onClick={() => setShowPhotoZoom(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setShowPhotoZoom(false)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.photoUrl}
              alt="স্মৃতির ছবি পূর্ণরূপ"
              className="w-auto h-auto max-h-[85vh] max-w-full rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </>
  );
}
