"use client";

import React from "react";
import { Sparkles, Crown, Heart, Mail } from "lucide-react";
import type { WishTheme } from "@/data/birthdayTemplates";

interface EnvelopeStageProps {
  recipientName: string;
  senderName: string;
  theme: WishTheme;
  opening: boolean;
  busy: boolean;
  onOpen: () => void;
}

export default function EnvelopeStage({
  recipientName,
  senderName,
  theme,
  opening,
  busy,
  onOpen,
}: EnvelopeStageProps) {
  const isWedding = theme.id === "wedding_royal" || theme.sealText === "শুভ বিবাহ";
  const isAnniv = theme.id === "anniversary_gold" || theme.sealText === "চিরন্তন";
  const isLove = theme.id === "rose" || theme.sealText === "ভালোবাসা";

  const badgeText = isWedding
    ? "রাজকীয় শুভ বিবাহ নিমন্ত্রণপত্র"
    : isAnniv
    ? "বিবাহবার্ষিকীর বিশেষ চিঠি"
    : isLove
    ? "এক টুকরো গোপন অনুভূতি"
    : "একটি বিশেষ অনুভূতির উপহার";

  const greeting = isWedding
    ? recipientName.startsWith("জনাব") || recipientName.startsWith("প্রিয়")
      ? recipientName
      : `সম্মানিত ${recipientName}`
    : `প্রিয় ${recipientName}`;

  const messageLead = isWedding ? (
    <>
      <span className="font-semibold text-amber-300">{senderName}</span> পরিবার আপনাকে শুভ পরিণয় ও প্রীতিভোজ অনুষ্ঠানে সাদর আমন্ত্রণ জানিয়েছেন। খামটি খুলতে নিচের রাজকীয় সিলমোহরে ট্যাপ করুন।
    </>
  ) : isAnniv ? (
    <>
      <span className="font-semibold text-amber-300">{senderName}</span> আপনার জন্য একরাশ ভালোবাসা ও শ্রদ্ধার বিবাহবার্ষিকীর চিঠি পাঠিয়েছেন। খামটি খুলতে নিচের সিলটিতে ট্যাপ করুন।
    </>
  ) : (
    <>
      <span className="font-semibold text-amber-300">{senderName}</span> আপনার জন্য একটি বিশেষ অনুভূতির চিঠি পাঠিয়েছেন। খামটি খুলে দেখতে নিচের সিলটিতে ট্যাপ করুন।
    </>
  );

  return (
    <div className="flex flex-col items-center text-center animate-fade-in w-full max-w-lg">
      {/* Arabic Bismillah Calligraphy for Wedding */}
      {isWedding && (
        <div className="mb-3 animate-fade-in">
          <p className="font-serif text-amber-200 text-xl sm:text-2xl tracking-widest drop-shadow select-none">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <span className="text-[10px] uppercase tracking-widest text-amber-300/70 font-semibold block mt-0.5">
            পরম করুণাময় ও অসীম দয়ালু সৃষ্টিকর্তার অশেষ কৃপায়
          </span>
        </div>
      )}

      {/* Occasion Badge */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3 shadow-lg">
        {isWedding ? (
          <Crown className="w-3.5 h-3.5 text-amber-300" />
        ) : isLove ? (
          <Heart className="w-3.5 h-3.5 text-rose-300 fill-current" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        )}
        <span>{badgeText}</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-wide drop-shadow-md">
        {greeting},
      </h1>
      <p className="text-xs sm:text-sm text-stone-200/90 mb-7 max-w-md leading-relaxed px-2">
        {messageLead}
      </p>

      {/* 3D Tactile Royal Envelope */}
      <div
        onClick={onOpen}
        className={`relative cursor-pointer transition-all duration-700 select-none group ${
          opening ? "scale-105 opacity-80" : "hover:scale-[1.03] active:scale-[0.98]"
        } w-80 sm:w-96 h-52 sm:h-64 rounded-2xl shadow-2xl flex items-center justify-center`}
        style={{
          backgroundColor: theme.envelopeColor,
          boxShadow: `0 30px 60px -15px rgba(0,0,0,0.85), 0 0 50px ${theme.sealColor}40`,
        }}
      >
        {/* Outer Metallic Gold Inlay Border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none border-2"
          style={{ borderColor: `${theme.envelopeBorder}88` }}
        />

        {/* Inner Thin Gold Inlay Frame */}
        <div
          className="absolute inset-2 sm:inset-2.5 rounded-xl pointer-events-none border"
          style={{ borderColor: "rgba(251, 191, 36, 0.35)" }}
        />

        {/* 4 Corner Golden Flourishes */}
        <div className="absolute top-3 left-3 text-amber-300/60 pointer-events-none">
          <Sparkles className="w-3 h-3" />
        </div>
        <div className="absolute top-3 right-3 text-amber-300/60 pointer-events-none">
          <Sparkles className="w-3 h-3" />
        </div>
        <div className="absolute bottom-3 left-3 text-amber-300/60 pointer-events-none">
          <Sparkles className="w-3 h-3" />
        </div>
        <div className="absolute bottom-3 right-3 text-amber-300/60 pointer-events-none">
          <Sparkles className="w-3 h-3" />
        </div>

        {/* Vertical Gold Satin Ribbon Running Through Envelope */}
        <div className="absolute top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-amber-500/25 via-yellow-200/35 to-amber-500/25 border-x border-amber-300/30 pointer-events-none shadow-xs" />

        {/* Ambient Top Light Glow */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 50% 10%, white 0%, transparent 65%)" }}
        />

        {/* Triangular Envelope Flap with Gold Piping */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none border-b-2"
          style={{
            clipPath: "polygon(0 0, 50% 56%, 100% 0)",
            backgroundColor: "rgba(255,255,255,0.07)",
            borderColor: "rgba(251, 191, 36, 0.4)",
          }}
        />

        {/* Envelope Center Typography & Crest */}
        <div className="relative z-10 text-center px-4 max-w-xs">
          {/* Royal Crest Monogram Icon */}
          <div className="w-9 h-9 rounded-full bg-black/40 border border-amber-300/50 flex items-center justify-center mx-auto mb-2 text-amber-300 shadow-md">
            {isWedding ? (
              <Crown className="w-4 h-4" />
            ) : isLove ? (
              <Heart className="w-4 h-4 fill-current text-rose-300" />
            ) : (
              <Mail className="w-4 h-4 text-amber-200" />
            )}
          </div>

          <span className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold block mb-0.5">
            {isWedding ? "সাদর নিমন্ত্রণ" : "বিশেষ চিঠি"}
          </span>
          <p className="text-base sm:text-lg font-black text-white drop-shadow truncate">
            To: {recipientName}
          </p>
          <p className="text-xs text-amber-100/80 mt-1 font-medium truncate">
            From: {senderName}
          </p>
        </div>

        {/* Embossed Royal Wax Seal Stamp */}
        <div
          className={`absolute bottom-3 sm:bottom-4 z-20 flex flex-col items-center justify-center transition-all duration-700 ${
            opening ? "scale-150 opacity-0 rotate-45" : "animate-pulse"
          }`}
        >
          {/* Outer Organic Wax Ring */}
          <div
            className="w-15 h-15 sm:w-17 sm:h-17 rounded-full flex items-center justify-center text-white shadow-2xl border-2 ring-4 ring-black/40 text-center cursor-pointer p-1"
            style={{
              backgroundColor: theme.sealColor,
              borderColor: "rgba(254, 240, 138, 0.7)",
              boxShadow: `0 12px 30px rgba(0,0,0,0.7), 0 0 30px ${theme.sealColor}`,
            }}
          >
            {/* Inner Embossed Ring with Text & Crest */}
            <div className="w-full h-full rounded-full border border-amber-200/50 flex flex-col items-center justify-center">
              {isWedding && <Crown className="w-3.5 h-3.5 text-amber-200 mb-0.5" />}
              <span className="text-[11px] sm:text-xs font-black tracking-wide drop-shadow leading-none text-amber-100">
                {theme.sealText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          disabled={busy}
          className="px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-[#7E151E] to-rose-600 hover:from-amber-300 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2 disabled:opacity-60 border border-amber-300/40"
        >
          <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
          <span>{isWedding ? "সিলমোহর ভেঙে নিমন্ত্রণপত্র খুলুন" : "সিলমোহর ভেঙে খামটি খুলুন"}</span>
        </button>
        <p className="text-[11px] text-stone-300/80">
          সিলমোহরে অথবা বাটনে ট্যাপ করলেই সুর ও উৎসবের সাথে খামটি উন্মুক্ত হবে
        </p>
      </div>
    </div>
  );
}
