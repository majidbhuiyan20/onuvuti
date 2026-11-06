"use client";

import React, { useState } from "react";
import { Heart, Sparkles, MessageCircleHeart, CheckCircle2 } from "lucide-react";

interface LoveProposalInteractiveCardProps {
  recipientName: string;
  senderName: string;
  isProposal?: boolean;
  accepted: boolean;
  onAccept: () => void;
  onScrollToReply?: () => void;
}

export default function LoveProposalInteractiveCard({
  recipientName,
  senderName,
  isProposal = false,
  accepted,
  onAccept,
  onScrollToReply,
}: LoveProposalInteractiveCardProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="w-full max-w-md bg-white/10 dark:bg-stone-900/60 backdrop-blur-xl border border-rose-300/30 dark:border-rose-900/40 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden transition-all duration-500">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full transition-all duration-700 blur-3xl ${
            accepted ? "bg-rose-500/25" : "bg-rose-500/15 animate-pulse"
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Occasion Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-bold mb-4 shadow-xs">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-current animate-pulse" />
          <span>{isProposal ? "প্রেমের প্রস্তাব ও অনুভূতি" : "পবিত্র ভালোবাসার নিবেদন"}</span>
        </div>

        {/* 3D Animated Heart Vessel */}
        <div
          onClick={!accepted ? onAccept : undefined}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className={`cursor-pointer group flex flex-col items-center mb-4 transition-transform duration-300 select-none ${
            !accepted ? "hover:scale-110 active:scale-95" : ""
          }`}
          title={!accepted ? (isProposal ? "প্রস্তাব গ্রহণ করতে ট্যাপ করুন" : "ভালোবাসা গ্রহণ করতে ট্যাপ করুন") : undefined}
        >
          <div className="relative flex items-center justify-center">
            {/* Outer pulsating ring */}
            <div
              className={`absolute w-20 h-20 rounded-full border border-rose-400/30 transition-all duration-700 ${
                !accepted ? "animate-ping opacity-30" : "scale-110 opacity-50"
              }`}
            />
            {/* Core Heart Tile */}
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl border ${
                accepted
                  ? "bg-gradient-to-tr from-rose-600 to-amber-500 border-amber-300/40 shadow-rose-500/30 scale-105"
                  : "bg-rose-500/20 border-rose-400/50 shadow-rose-500/20"
              }`}
            >
              <Heart
                className={`w-9 h-9 transition-all duration-500 ${
                  accepted ? "text-white fill-current animate-pulse" : "text-rose-300 fill-current"
                }`}
              />
            </div>
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            </div>
          </div>
        </div>

        {/* Dynamic Titles */}
        {!accepted ? (
          <>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
              {isProposal ? "হৃদয়ের একটি না-বলা প্রেমের প্রস্তাব" : "এক টুকরো স্নিগ্ধ অনুভূতির উপহার"}
            </h3>
            <p className="text-xs text-stone-300 mb-5 max-w-xs mx-auto leading-relaxed">
              <span className="text-amber-300 font-semibold">{senderName}</span> মনের গভীরের আবেগ ও অনুভূতির কথা আপনার সামনে সমর্পণ করেছেন।
            </p>

            <button
              type="button"
              onClick={onAccept}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xl transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-rose-400/30 animate-pulse"
            >
              <Heart className="w-4 h-4 fill-current text-white" />
              <span>{isProposal ? "প্রস্তাব ও ভালোবাসা গ্রহণ করুন" : "ভালোবাসা ও শুভকামনা গ্রহণ করুন"}</span>
            </button>
          </>
        ) : (
          <div className="animate-fade-in-up space-y-3 py-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>অনুভূতিটি ভালোবাসায় হৃদয়ে ধারণ করা হলো</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-amber-300">
              {isProposal ? "ভালোবাসার প্রস্তাব সফলভাবে গৃহীত হয়েছে!" : "চির অমলিন থাকুক এই অনুভূতি!"}
            </h3>
            <p className="text-xs text-stone-200 max-w-xs mx-auto leading-relaxed">
              {recipientName}, আপনার ও {senderName}-এর পথচলা হোক পবিত্র, নির্মল ও স্বর্গীয় ভালোবাসায় পূর্ণ।
            </p>

            {onScrollToReply && (
              <button
                type="button"
                onClick={onScrollToReply}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-white px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition border border-white/15 cursor-pointer"
              >
                <MessageCircleHeart className="w-4 h-4 text-rose-400" />
                <span>{senderName}-কে একটি মিষ্টি উত্তর লিখুন</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
