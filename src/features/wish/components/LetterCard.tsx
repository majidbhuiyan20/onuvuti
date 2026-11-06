"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Mic,
  FastForward,
  Sparkles,
  Maximize2,
  X,
  Crown,
  Music,
  Feather,
  HeartHandshake,
} from "lucide-react";
import type { WishTheme } from "@/data/birthdayTemplates";
import { renderFormattedInline } from "@/lib/formatText";
import { HANDWRITING_FONT } from "../share";
import type { WishContent, WishPublic } from "../types";

interface LetterCardProps {
  wish: WishPublic;
  content: WishContent;
  theme: WishTheme;
  isMusicPlaying?: boolean;
}

function CornerFiligree({
  className,
  color,
}: {
  className: string;
  color: string;
}) {
  return (
    <div className={`absolute pointer-events-none select-none opacity-30 ${className}`} style={{ color }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor">
        <path d="M3 29V9a6 6 0 0 1 6-6h20" strokeWidth="1.5" />
        <path d="M7 29V12a5 5 0 0 1 5-5h17" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="5" cy="5" r="2" fill="currentColor" />
        <path d="M12 3 C17 5 21 9 23 14" strokeWidth="1" />
      </svg>
    </div>
  );
}

function OccasionWatermark({
  isWedding,
  isAnniversary,
  isLove,
  color,
}: {
  isWedding: boolean;
  isAnniversary: boolean;
  isLove: boolean;
  color: string;
}) {
  if (isWedding) {
    return (
      <svg
        className="w-72 h-72 sm:w-80 sm:h-80 opacity-[0.045] pointer-events-none select-none"
        viewBox="0 0 200 200"
        fill="currentColor"
        style={{ color }}
      >
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="100" cy="100" r="76" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <path
          d="M100 20 C125 50 150 75 180 100 C150 125 125 150 100 180 C75 150 50 125 20 100 C50 75 75 50 100 20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="85" cy="100" r="22" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="115" cy="100" r="22" stroke="currentColor" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  if (isAnniversary) {
    return (
      <svg
        className="w-72 h-72 sm:w-80 sm:h-80 opacity-[0.05] pointer-events-none select-none"
        viewBox="0 0 200 200"
        fill="currentColor"
        style={{ color }}
      >
        <circle cx="75" cy="100" r="42" stroke="currentColor" strokeWidth="3" fill="none" />
        <circle cx="125" cy="100" r="42" stroke="currentColor" strokeWidth="3" fill="none" />
        <path
          d="M100 70 C108 55 120 48 132 58 C144 70 132 85 100 110 C68 85 56 70 68 58 C80 48 92 55 100 70 Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (isLove) {
    return (
      <svg
        className="w-72 h-72 sm:w-80 sm:h-80 opacity-[0.05] pointer-events-none select-none"
        viewBox="0 0 200 200"
        fill="currentColor"
        style={{ color }}
      >
        <path d="M100 170 C50 125 20 95 20 60 C20 30 45 10 75 10 C90 10 100 20 100 20 C100 20 110 10 125 10 C155 10 180 30 180 60 C180 95 150 125 100 170 Z" />
      </svg>
    );
  }

  // Birthday default
  return (
    <svg
      className="w-72 h-72 sm:w-80 sm:h-80 opacity-[0.045] pointer-events-none select-none"
      viewBox="0 0 200 200"
      fill="currentColor"
      style={{ color }}
    >
      <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      <path d="M100 15 L108 75 L168 83 L118 112 L138 170 L100 132 L62 170 L82 112 L32 83 L92 75 Z" />
    </svg>
  );
}

export default function LetterCard({ wish, content, theme, isMusicPlaying = false }: LetterCardProps) {
  const handwritten = wish.fontStyle === "handwritten";
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
          borderColor: `${theme.accentColor}38`,
          boxShadow: `0 25px 60px -15px rgba(0,0,0,0.65), 0 0 35px ${theme.accentColor}25`,
          fontFamily: handwritten ? HANDWRITING_FONT : undefined,
        }}
      >
        {/* Subtle Occasion Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <OccasionWatermark
            isWedding={isWedding}
            isAnniversary={isAnniversary}
            isLove={isLove}
            color={theme.accentColor}
          />
        </div>

        {/* Inner Dashed Border Inlay */}
        <div
          className="absolute inset-2.5 sm:inset-3.5 rounded-2xl pointer-events-none border border-dashed opacity-25"
          style={{ borderColor: theme.accentColor }}
        />

        {/* 4 Corner Filigree Ornaments */}
        <CornerFiligree className="top-2.5 left-2.5" color={theme.accentColor} />
        <CornerFiligree className="top-2.5 right-2.5 rotate-90" color={theme.accentColor} />
        <CornerFiligree className="bottom-2.5 right-2.5 rotate-180" color={theme.accentColor} />
        <CornerFiligree className="bottom-2.5 left-2.5 -rotate-90" color={theme.accentColor} />

        {/* Header Crest & Divider */}
        <div className="text-center pb-5 mb-6 relative">
          {isWedding && (
            <div className="mb-3 animate-fade-in">
              <p
                className="font-serif text-lg sm:text-2xl tracking-widest opacity-90 select-none drop-shadow-xs"
                style={{ color: theme.accentColor }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <span className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold block mt-1">
                পরম করুণাময় সৃষ্টিকর্তার অশেষ কৃপায়
              </span>
            </div>
          )}

          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2.5 shadow-md border"
            style={{
              backgroundColor: `${theme.accentColor}18`,
              borderColor: `${theme.accentColor}40`,
              color: theme.accentColor,
            }}
          >
            {isWedding ? (
              <Crown className="w-6 h-6" />
            ) : isAnniversary ? (
              <HeartHandshake className="w-6 h-6" />
            ) : isLove ? (
              <Heart className="w-6 h-6 fill-current" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-wide" style={{ color: theme.accentColor }}>
            {cardTitle}
          </h2>

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
            {cardSubtitle}
          </p>

          {/* Ornate Filigree Divider */}
          <div className="flex items-center justify-center gap-3 mt-4 opacity-40" style={{ color: theme.accentColor }}>
            <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-current" />
            <div className="w-1.5 h-1.5 rotate-45 border border-current" />
            <div className="w-2 h-2 rotate-45 bg-current" />
            <div className="w-1.5 h-1.5 rotate-45 border border-current" />
            <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-current" />
          </div>
        </div>

        {/* Live Ambient Music Wave Bar */}
        {isMusicPlaying && (
          <div
            className="flex items-center justify-center gap-2 py-1.5 px-4 rounded-full border mx-auto w-fit mb-5 text-xs font-semibold select-none shadow-xs animate-fade-in"
            style={{
              borderColor: `${theme.accentColor}33`,
              backgroundColor: `${theme.accentColor}0f`,
              color: theme.accentColor,
            }}
          >
            <Music className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <div className="flex items-end gap-0.5 h-3.5 shrink-0">
              <span className="w-1 bg-current rounded-full animate-soundwave-1" />
              <span className="w-1 bg-current rounded-full animate-soundwave-2" />
              <span className="w-1 bg-current rounded-full animate-soundwave-3" />
              <span className="w-1 bg-current rounded-full animate-soundwave-4" />
            </div>
            <span className="text-[11px] font-medium tracking-wide">আবহ সঙ্গীত বাজছে</span>
          </div>
        )}

        {/* Salutation with feather quill */}
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs shadow-xs shrink-0"
            style={{ backgroundColor: `${theme.accentColor}18`, color: theme.accentColor }}
          >
            <Feather className="w-3.5 h-3.5" />
          </span>
          <p className="text-lg sm:text-xl font-bold tracking-wide">
            {isWedding
              ? wish.recipientName.startsWith("জনাব") || wish.recipientName.startsWith("প্রিয়")
                ? wish.recipientName
                : `সম্মানিত ${wish.recipientName},`
              : `প্রিয় ${wish.recipientName},`}
          </p>
        </div>

        {/* Tactile Vintage Polaroid Frame */}
        {content.photoUrl && (
          <div className="my-7 mx-auto max-w-sm flex flex-col items-center relative z-10">
            {/* Metallic Gold Paper Clip */}
            <div className="absolute -top-3.5 left-7 z-20 w-6 h-10 pointer-events-none drop-shadow-md">
              <svg viewBox="0 0 24 48" fill="none" className="w-full h-full text-amber-500 filter drop-shadow">
                <path
                  d="M6 16V36C6 40.4 9.6 44 14 44C18.4 44 22 40.4 22 36V10C22 5.6 18.4 2 14 2C9.6 2 6 5.6 6 10V32C6 34.2 7.8 36 10 36C12.2 36 14 34.2 14 32V14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Washi Tape Accent */}
            <div className="w-28 h-6 -mb-3 z-10 relative bg-amber-200/80 dark:bg-amber-900/50 backdrop-blur-xs border border-amber-300/50 shadow-xs rotate-[-2deg] rounded-xs" />

            <figure
              onClick={() => setShowPhotoZoom(true)}
              className="w-full rotate-[-1deg] hover:rotate-0 transition-transform duration-300 bg-white dark:bg-stone-900 p-3 pb-7 rounded-xl shadow-2xl border border-stone-200/90 dark:border-stone-800 cursor-pointer group relative"
            >
              <div className="relative overflow-hidden rounded-md bg-stone-100 dark:bg-stone-800">
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
              <figcaption className="text-center text-[11px] text-stone-500 dark:text-stone-400 mt-3 font-serif italic flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>স্মৃতির একটি প্রিয় মুহূর্ত • বড় করে দেখতে ক্লিক করুন</span>
              </figcaption>
            </figure>
          </div>
        )}

        {/* Typewriter message body with diary ruling */}
        <div
          onClick={handleSkipTyping}
          className="relative text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-line font-medium opacity-95 my-5 px-2 sm:px-3 py-2 rounded-xl transition-all select-text cursor-pointer z-10"
          style={
            handwritten
              ? {
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 31px, ${theme.accentColor}18 31px, ${theme.accentColor}18 32px)`,
                  lineHeight: "32px",
                }
              : undefined
          }
          title={isTyping ? "সম্পূর্ণ পড়তে ক্লিক করুন" : undefined}
        >
          <span
            className="text-4xl sm:text-5xl font-serif leading-none select-none opacity-20 float-left mr-2 -mt-1 font-black"
            style={{ color: theme.accentColor }}
          >
            “
          </span>

          {renderFormattedInline(content.message.slice(0, displayedLength))}

          {!isTyping && (
            <span
              className="text-4xl sm:text-5xl font-serif leading-none select-none opacity-20 inline-block ml-1 font-black align-bottom"
              style={{ color: theme.accentColor }}
            >
              ”
            </span>
          )}

          {isTyping && (
            <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse align-middle" />
          )}
        </div>

        {/* Fast-forward Button */}
        {isTyping && (
          <div className="flex justify-end pt-1 relative z-10">
            <button
              type="button"
              onClick={handleSkipTyping}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-stone-300/40 dark:border-stone-700/40 shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition"
              style={{ color: theme.accentColor }}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>একবারে সম্পূর্ণ পড়ুন</span>
            </button>
          </div>
        )}

        {/* Audio Message */}
        {content.voiceUrl && (
          <div
            className="mt-6 p-4 rounded-2xl border relative z-10"
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

        {/* Signature & Monogram Stamp */}
        <div className="mt-8 pt-5 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-4 relative z-10">
          {/* Wax Monogram Seal Stamp */}
          <div
            className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed shadow-md rotate-[-8deg] select-none transition-transform hover:rotate-0 shrink-0"
            style={{
              borderColor: `${theme.accentColor}66`,
              backgroundColor: `${theme.accentColor}14`,
              color: theme.accentColor,
            }}
            title="অনূভুতি ভেরিফাইড চিঠি"
          >
            <div className="text-center">
              <div className="flex justify-center mb-0.5">
                {isWedding ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>
              <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase block leading-none">
                অনূভুতি
              </span>
              <span className="text-[7px] font-medium opacity-75 block mt-0.5 leading-none">
                SEALED
              </span>
            </div>
          </div>

          {/* Sender signature */}
          <div className="text-right">
            <span className="text-xs text-stone-500 dark:text-stone-400 block font-serif">
              {isWedding ? "আমন্ত্রণকারী পরিবার," : isAnniversary ? "আন্তরিক শুভকামনায়," : "ভালোবাসা ও শুভকামনায়,"}
            </span>
            <span
              className="text-lg sm:text-xl font-black block mt-1 tracking-wide"
              style={{
                color: theme.accentColor,
                fontFamily: handwritten ? HANDWRITING_FONT : undefined,
              }}
            >
              — {wish.senderName}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
              পবিত্র অনুভূতিতে সংরক্ষিত
            </span>
          </div>
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
