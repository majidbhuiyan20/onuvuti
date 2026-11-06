"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Send, Feather, ShieldCheck } from "lucide-react";
import EnvelopeCard, {
  EnvelopeThemeKey,
  ENVELOPE_THEMES,
  WAX_SEAL_ICONS,
} from "./EnvelopeCard";
import { letterSound } from "@/lib/letterSound";

interface LetterDispatchAnimationProps {
  theme: EnvelopeThemeKey;
  sealCategory: string;
  content: string;
  recipientDisplayName: string;
  recipientUsername: string;
  onComplete: () => void;
}

export default function LetterDispatchAnimation({
  theme,
  sealCategory,
  content,
  recipientDisplayName,
  recipientUsername,
  onComplete,
}: LetterDispatchAnimationProps) {
  // Animation phases: 'folding' (0-700ms) -> 'sealing' (700-1200ms) -> 'flying' (1200-1900ms)
  const [phase, setPhase] = useState<"folding" | "sealing" | "flying">("folding");

  const config =
    theme in ENVELOPE_THEMES ? ENVELOPE_THEMES[theme] : ENVELOPE_THEMES.crimson;
  const seal =
    sealCategory in WAX_SEAL_ICONS
      ? WAX_SEAL_ICONS[sealCategory]
      : WAX_SEAL_ICONS.crush;
  const SealIcon = seal.icon;

  useEffect(() => {
    // 1. Play ascending 3-note chime and paper wind sound
    letterSound.playLetterSent();

    // 2. Timeline
    const sealTimer = setTimeout(() => {
      setPhase("sealing");
    }, 700);

    const flyTimer = setTimeout(() => {
      setPhase("flying");
    }, 1300);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2050);

    return () => {
      clearTimeout(sealTimer);
      clearTimeout(flyTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-hidden select-none">
      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-amber-300 animate-ping opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-rose-300 animate-ping delay-200 opacity-60" />
        <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping delay-500 opacity-60" />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Status indicator banner */}
        <div className="mb-6 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-lg flex items-center gap-2 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {phase === "folding" && "চিঠিটি ভাঁজ হয়ে খামের ভেতরে যাচ্ছে..."}
            {phase === "sealing" && "খামে মোমের সিলমোহর বসানো হচ্ছে..."}
            {phase === "flying" && "চিঠিটি খামে ভরে উড়ে যাচ্ছে..."}
          </span>
        </div>

        {/* Envelope and Letter Stage */}
        <div
          className={`relative w-80 sm:w-92 h-54 flex items-center justify-center transition-all duration-700 ease-in-out ${
            phase === "flying"
              ? "-translate-y-80 -rotate-12 scale-75 opacity-0 duration-800"
              : "translate-y-0 rotate-0 scale-100 opacity-100"
          }`}
          style={{ perspective: "1000px" }}
        >
          {/* THE PARCHMENT LETTER (Slides down into the envelope during 'folding' phase) */}
          <div
            className={`absolute top-0 w-72 h-44 rounded-2xl bg-[#FAF5E8] border-2 border-[#D4AF37]/60 shadow-lg p-4 space-y-2 z-10 transition-all duration-700 ease-in-out ${
              phase === "folding"
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-12 scale-90 opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-1.5 text-[10px] font-serif italic text-[#7E151E]">
              <span className="flex items-center gap-1 font-bold">
                <Feather className="w-3 h-3" />
                <span>প্রিয় {recipientDisplayName},</span>
              </span>
              <span className="font-mono text-stone-400">গোপন চিঠি</span>
            </div>
            <p className="text-xs font-serif text-stone-800 line-clamp-3 leading-relaxed italic">
              &ldquo;{content}&rdquo;
            </p>
          </div>

          {/* THE 3D ENVELOPE */}
          <div
            className={`relative w-full h-full rounded-2xl ${config.gradientBg} border border-white/20 shadow-2xl overflow-hidden p-4 sm:p-5 flex flex-col justify-between z-20 transition-all duration-500`}
          >
            {/* Inset Metallic Foil Border Frame */}
            <div
              className={`absolute inset-2 sm:inset-2.5 rounded-xl border ${config.foilBorder} pointer-events-none z-10`}
            />

            {/* Vertical Luxury Satin Ribbon Band */}
            <div
              className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 ${config.ribbonGradient} border-x ${config.ribbonStitch} shadow-md pointer-events-none z-10`}
            />

            {/* Top header on envelope */}
            <div className="flex items-start justify-between relative z-20">
              <span className="text-[9px] uppercase font-bold text-white/75 font-mono tracking-widest px-2 py-0.5 rounded-full bg-black/30 border border-white/15">
                গোপন ডাক • 2026
              </span>
              <div
                className={`w-8 h-10 border border-dashed ${config.stampBorder} ${config.stampBg} rounded-sm flex items-center justify-center p-1 rotate-2 shadow-xs`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white/90" />
              </div>
            </div>

            {/* Recipient info on envelope front */}
            <div className="text-center my-auto space-y-0.5 relative z-20">
              <div className="text-[9px] uppercase tracking-widest text-white/65">
                প্রাপকের ঠিকানা
              </div>
              <div
                className={`text-base font-serif font-bold ${config.textColor} drop-shadow-md line-clamp-1`}
              >
                {recipientDisplayName}
              </div>
              <div className={`text-[10px] font-mono ${config.subTextColor}`}>
                @{recipientUsername}
              </div>
            </div>

            {/* Bottom tag */}
            <div className="flex items-center justify-between text-[9px] text-white/60 relative z-20 border-t border-white/10 pt-1.5">
              <span className="font-serif italic">অনুভূতি প্রকাশনা</span>
              <span>{seal.label}</span>
            </div>

            {/* Top Folding Flap (Rotates closed in sealing phase) */}
            <div
              className={`absolute top-0 inset-x-0 h-1/2 origin-top transition-transform duration-500 ease-out z-30 ${
                phase === "folding" ? "-rotate-x-180" : "rotate-x-0"
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className={`w-full h-full ${config.flapBg} border-b border-black/30 shadow-md flex items-end justify-center pb-2`}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.45))",
                }}
              />
            </div>

            {/* Wax Seal Stamp (Pops on when sealed) */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-500 ${
                phase === "folding"
                  ? "scale-0 opacity-0"
                  : "scale-100 opacity-100 animate-in zoom-in-50 duration-300"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full ${config.sealBg} border-2 ${config.sealBorder} ${config.sealGlow} flex items-center justify-center text-amber-200 shadow-2xl relative`}
              >
                <div className="w-10 h-10 rounded-full border border-amber-300/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] bg-black/15 flex items-center justify-center">
                  <SealIcon className={`w-5 h-5 ${config.sealText} drop-shadow-md`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

