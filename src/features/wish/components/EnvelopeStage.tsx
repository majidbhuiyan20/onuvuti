"use client";

import React from "react";
import { Sparkles } from "lucide-react";
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
  return (
    <div className="flex flex-col items-center text-center animate-fade-in w-full max-w-lg">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-medium mb-4 shadow-lg animate-bounce">
        <Sparkles className="w-3.5 h-3.5" />
        <span>একটি বিশেষ অনুভূতির উপহার</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-wide drop-shadow-md">
        প্রিয় {recipientName},
      </h1>
      <p className="text-sm text-stone-300 mb-8 max-w-sm">
        <span className="font-semibold text-amber-300">{senderName}</span> তোমার জন্য একটি বিশেষ অনুভূতির
        চিঠি পাঠিয়েছেন। খামটি খুলে দেখতে নিচের সিলটিতে ট্যাপ করো।
      </p>

      <div
        onClick={onOpen}
        className={`relative cursor-pointer transition-all duration-700 transform ${
          opening ? "scale-105" : "hover:scale-103"
        } w-72 sm:w-88 h-48 sm:h-56 rounded-2xl shadow-2xl border flex items-center justify-center select-none`}
        style={{
          backgroundColor: theme.envelopeColor,
          borderColor: theme.envelopeBorder,
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.7), 0 0 40px ${theme.sealColor}33`,
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 50% 0%, white 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full border-b-2 border-white/15"
          style={{ clipPath: "polygon(0 0, 50% 55%, 100% 0)", backgroundColor: "rgba(255,255,255,0.06)" }}
        />

        <div className="relative z-10 text-center px-4">
          <span className="text-[10px] uppercase tracking-widest text-white/60 block mb-0.5">বিশেষ বার্তা</span>
          <p className="text-base sm:text-lg font-bold text-white/95">To: {recipientName}</p>
          <p className="text-xs text-white/70 mt-1">From: {senderName}</p>
        </div>

        <div
          className={`absolute bottom-3 sm:bottom-4 z-20 flex flex-col items-center justify-center transition-all duration-500 ${
            opening ? "scale-125 opacity-0 rotate-45" : "animate-pulse"
          }`}
        >
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-xl border-2 border-amber-300/60 ring-4 ring-black/20"
            style={{ backgroundColor: theme.sealColor, boxShadow: `0 0 20px ${theme.sealColor}` }}
          >
            <span className="drop-shadow">{theme.sealText}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        disabled={busy}
        className="mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2 disabled:opacity-60"
      >
        <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
        <span>খামটি খুলতে ট্যাপ করুন ✦</span>
      </button>
    </div>
  );
}

