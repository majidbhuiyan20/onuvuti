"use client";

import React, { useState } from "react";
import { Sparkles, Flame, Wind, RotateCcw } from "lucide-react";

interface BirthdayCakeCeremonyProps {
  recipientName: string;
  isBlown: boolean;
  onBlow: () => void;
  onRelight?: () => void;
}

export default function BirthdayCakeCeremony({
  recipientName,
  isBlown,
  onBlow,
  onRelight,
}: BirthdayCakeCeremonyProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="w-full max-w-md bg-white/10 dark:bg-stone-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full transition-all duration-700 blur-3xl ${
            !isBlown ? "bg-amber-500/25 animate-pulse" : "bg-purple-500/15"
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Occasion Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-bold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>জাদুকরী বার্থডে কেক ও মোমবাতি</span>
        </div>

        {/* 3D Cake & Candle Interactive Container */}
        <div
          onClick={!isBlown ? onBlow : undefined}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className={`cursor-pointer group flex flex-col items-center mb-5 transition-transform duration-300 select-none ${
            !isBlown ? "hover:scale-105 active:scale-95" : ""
          }`}
          title={!isBlown ? "মোমবাতিতে ফুঁ দিতে ট্যাপ করুন" : undefined}
        >
          {/* Flame & Candle Wick */}
          <div className="relative flex flex-col items-center mb-1">
            {!isBlown ? (
              <div className="relative flex flex-col items-center">
                {/* Outer Flame Glow */}
                <div className="w-6 h-9 rounded-full bg-gradient-to-t from-amber-600 via-orange-400 to-yellow-200 animate-pulse shadow-[0_0_25px_rgba(251,191,36,0.9)] flex items-center justify-center">
                  {/* Inner Flame Core */}
                  <div className="w-2.5 h-5 bg-white/90 rounded-full blur-[1px] -mt-1" />
                </div>
                {/* Floating flame sparks */}
                <div className="absolute -top-1 w-1 h-1 bg-yellow-200 rounded-full animate-ping" />
              </div>
            ) : (
              /* Smoke Puff Animation */
              <div className="flex flex-col items-center justify-center h-9 animate-fade-in text-stone-300">
                <Wind className="w-5 h-5 text-stone-300 animate-pulse" />
                <span className="text-[10px] text-stone-400 italic">ধোঁয়া বাতাসে মিলিয়ে যাচ্ছে...</span>
              </div>
            )}

            {/* Candle Wick */}
            <div className="w-0.5 h-2.5 bg-stone-800" />

            {/* Striped Celebration Candle */}
            <div
              className="w-3.5 h-10 rounded-t-xs shadow-md border-x border-white/20 flex flex-col justify-around overflow-hidden"
              style={{
                background: "repeating-linear-gradient(45deg, #f43f5e, #f43f5e 4px, #ffffff 4px, #ffffff 8px)",
              }}
            />
          </div>

          {/* Tier 3 (Top Tier) */}
          <div className="w-24 h-7 bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400 rounded-t-xl border-t border-x border-rose-200 flex items-center justify-around px-2 shadow-md relative">
            {/* Frosting Swirls */}
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-amber-200 shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-amber-200 shadow-xs" />
          </div>

          {/* Tier 2 (Middle Tier) */}
          <div className="w-36 h-8 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border-t-2 border-rose-400 border-x border-amber-300 flex items-center justify-around px-3 shadow-md relative">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-xs" />
          </div>

          {/* Tier 1 (Bottom Base Tier) */}
          <div className="w-48 h-9 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 rounded-b-xl border-t-2 border-amber-300 border-x border-pink-600 flex items-center justify-around px-4 shadow-lg relative">
            <span className="w-3 h-3 rounded-full bg-amber-200 shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-yellow-300 shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-amber-200 shadow-xs" />
          </div>

          {/* Platter Stand */}
          <div className="w-56 h-3 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 rounded-full shadow-xl -mt-0.5 border-t border-white/60" />
        </div>

        {/* Ceremony Actions & Congratulatory Message */}
        {!isBlown ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onBlow}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-900 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 hover:from-amber-200 hover:to-yellow-300 px-6 py-2.5 rounded-full shadow-lg shadow-amber-400/30 transition transform hover:scale-103 active:scale-97 cursor-pointer border border-amber-200"
            >
              <Flame className="w-4 h-4 text-amber-600 fill-current animate-pulse" />
              <span>মোমবাতিতে ফুঁ দিন (ট্যাপ করুন)</span>
            </button>
            <p className="text-xs text-stone-300 max-w-xs mx-auto">
              একটি সুন্দর ইচ্ছা মনে রেখে মোমবাতিতে চাপ দিন, বাতাস ভরে উঠবে উৎসবের আনন্দে
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in-up">
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-300/30">
              <p className="text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>শুভ জন্মদিন, {recipientName}!</span>
              </p>
              <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                আপনার মনের সব সুপ্ত ইচ্ছা পূর্ণ হোক, আগামী প্রতিটি দিন ভরে উঠুক অফুরন্ত হাসি ও ভালোবাসায়!
              </p>
            </div>

            {onRelight && (
              <button
                type="button"
                onClick={onRelight}
                className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>পুনরায় মোমবাতি জ্বালান</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

