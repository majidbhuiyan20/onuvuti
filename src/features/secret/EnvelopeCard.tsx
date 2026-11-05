"use client";

import React from "react";
import {
  Heart,
  Lock,
  Feather,
  Sparkles,
  Flame,
  Cake,
  Mail,
  ShieldCheck,
} from "lucide-react";

export type EnvelopeThemeKey =
  | "crimson"
  | "midnight"
  | "vintage"
  | "emerald"
  | "aurora";

export interface EnvelopeThemeConfig {
  id: EnvelopeThemeKey;
  nameBn: string;
  envelopeBg: string;
  flapBg: string;
  innerBg: string;
  sealBg: string;
  sealBorder: string;
  sealGlow: string;
  textColor: string;
  stampBorder: string;
}

export const ENVELOPE_THEMES: Record<EnvelopeThemeKey, EnvelopeThemeConfig> = {
  crimson: {
    id: "crimson",
    nameBn: "রয়েল ক্রিমসন",
    envelopeBg: "bg-[#7E151E]",
    flapBg: "bg-[#6A0F17]",
    innerBg: "bg-[#540910]",
    sealBg: "bg-[#9E1B27]",
    sealBorder: "border-[#D68C45]",
    sealGlow: "shadow-[0_0_15px_rgba(214,140,69,0.4)]",
    textColor: "text-amber-100",
    stampBorder: "border-amber-200/50",
  },
  midnight: {
    id: "midnight",
    nameBn: "মিডনাইট নেভি",
    envelopeBg: "bg-[#0F1E36]",
    flapBg: "bg-[#0B172A]",
    innerBg: "bg-[#070F1C]",
    sealBg: "bg-[#1E3A8A]",
    sealBorder: "border-[#60A5FA]",
    sealGlow: "shadow-[0_0_15px_rgba(96,165,250,0.4)]",
    textColor: "text-sky-100",
    stampBorder: "border-sky-300/50",
  },
  vintage: {
    id: "vintage",
    nameBn: "ভিন্টেজ পার্চমেন্ট",
    envelopeBg: "bg-[#B07D4F]",
    flapBg: "bg-[#96663A]",
    innerBg: "bg-[#7A4E26]",
    sealBg: "bg-[#78350F]",
    sealBorder: "border-[#FDE68A]",
    sealGlow: "shadow-[0_0_15px_rgba(253,230,138,0.4)]",
    textColor: "text-amber-50",
    stampBorder: "border-amber-100/50",
  },
  emerald: {
    id: "emerald",
    nameBn: "ফরেস্ট এমেরাল্ড",
    envelopeBg: "bg-[#114B37]",
    flapBg: "bg-[#0D3B2B]",
    innerBg: "bg-[#092B1F]",
    sealBg: "bg-[#065F46]",
    sealBorder: "border-[#6EE7B7]",
    sealGlow: "shadow-[0_0_15px_rgba(110,231,183,0.4)]",
    textColor: "text-emerald-100",
    stampBorder: "border-emerald-200/50",
  },
  aurora: {
    id: "aurora",
    nameBn: "পার্পল অরোরা",
    envelopeBg: "bg-[#4C1D95]",
    flapBg: "bg-[#3B1277]",
    innerBg: "bg-[#2C0A5E]",
    sealBg: "bg-[#6D28D9]",
    sealBorder: "border-[#C4B5FD]",
    sealGlow: "shadow-[0_0_15px_rgba(196,181,253,0.4)]",
    textColor: "text-purple-100",
    stampBorder: "border-purple-200/50",
  },
};

export const WAX_SEAL_ICONS: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  crush: { label: "ক্রাশ ও প্রেম", icon: Heart },
  secret: { label: "গোপন কথা", icon: Lock },
  confession: { label: "হৃদয়ের কথা", icon: Feather },
  appreciation: { label: "শ্রদ্ধা ও প্রশংসা", icon: Sparkles },
  bold: { label: "সাহসী স্বীকারোক্তি", icon: Flame },
  birthday: { label: "বার্থডে উইশ", icon: Cake },
};

interface EnvelopeCardProps {
  theme?: string;
  sealCategory?: string;
  recipientUsername?: string;
  recipientDisplayName?: string;
  isOpened?: boolean;
  isOpening?: boolean;
  onSealClick?: () => void;
  showClickHint?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function EnvelopeCard({
  theme = "crimson",
  sealCategory = "crush",
  recipientUsername = "",
  recipientDisplayName = "",
  isOpened = false,
  isOpening = false,
  onSealClick,
  showClickHint = true,
  size = "md",
  className = "",
}: EnvelopeCardProps) {
  const config =
    (theme as EnvelopeThemeKey) in ENVELOPE_THEMES
      ? ENVELOPE_THEMES[theme as EnvelopeThemeKey]
      : ENVELOPE_THEMES.crimson;

  const seal =
    sealCategory in WAX_SEAL_ICONS
      ? WAX_SEAL_ICONS[sealCategory]
      : WAX_SEAL_ICONS.crush;
  const SealIcon = seal.icon;

  const sizeClasses = {
    sm: "w-64 h-40",
    md: "w-80 sm:w-92 h-48 sm:h-54",
    lg: "w-full max-w-md h-56 sm:h-64",
  }[size];

  return (
    <div
      className={`relative select-none ${sizeClasses} ${className} transition-all duration-300`}
      style={{ perspective: "1000px" }}
    >
      {/* Outer Envelope Shadow */}
      <div className="absolute inset-0 rounded-2xl shadow-xl shadow-black/25 dark:shadow-black/50" />

      {/* Envelope Main Body */}
      <div
        className={`absolute inset-0 rounded-2xl ${config.envelopeBg} border border-white/15 overflow-hidden flex flex-col justify-between p-4 sm:p-5`}
      >
        {/* Subtle Paper Fiber Texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 40px)",
          }}
        />

        {/* Top Header: Vintage Post Stamp & Confidential Mark */}
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-xs border border-white/20 text-[10px] font-bold text-white/90 uppercase tracking-widest">
              <Mail className="w-2.5 h-2.5" />
              <span>অনলাইন চিঠির বাক্স</span>
            </div>
            <div className="text-[10px] text-white/60 font-mono tracking-wider">
              CONFIDENTIAL • 2026
            </div>
          </div>

          {/* Postal Stamp Badge */}
          <div
            className={`w-10 h-12 rounded-sm border-2 border-dashed ${config.stampBorder} bg-black/10 flex flex-col items-center justify-center p-1 rotate-3 shadow-xs`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[8px] font-mono text-white/80 tracking-tighter mt-0.5">
              100% PRIVATE
            </span>
          </div>
        </div>

        {/* Center: Recipient Address */}
        <div className="text-center space-y-1 relative z-10 my-auto">
          <div className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
            প্রাপকের ঠিকানা
          </div>
          <div
            className={`text-base sm:text-lg font-serif font-bold ${config.textColor} drop-shadow-sm line-clamp-1`}
          >
            {recipientDisplayName || "প্রিয় অনুভূতি"}
          </div>
          {recipientUsername && (
            <div className="text-[11px] font-mono text-white/70">
              @{recipientUsername}
            </div>
          )}
        </div>

        {/* Bottom Fold Lines & Details */}
        <div className="flex items-center justify-between text-[10px] text-white/50 relative z-10 pt-2 border-t border-white/10">
          <span>অনুভূতি পাবলিকেশন্স</span>
          <span>{seal.label}</span>
        </div>
      </div>

      {/* Top Folding Flap (3D Flip Animation) */}
      <div
        className={`absolute top-0 inset-x-0 h-1/2 origin-top transition-transform duration-700 ease-out z-20 ${
          isOpened || isOpening ? "-rotate-x-180 pointer-events-none" : "rotate-x-0"
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className={`w-full h-full ${config.flapBg} border-b border-black/20 shadow-md flex items-end justify-center pb-2`}
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
      </div>

      {/* Wax Seal Stamp (Centered on Flap Edge) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
        <button
          type="button"
          onClick={onSealClick}
          disabled={isOpened || isOpening}
          title={isOpened ? "খোলা হয়েছে" : "চিঠিটি খুলতে ট্যাপ করুন"}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${
            config.sealBg
          } border-2 ${config.sealBorder} ${
            config.sealGlow
          } flex items-center justify-center text-amber-200 transition-all duration-300 relative group cursor-pointer ${
            isOpening ? "scale-125 opacity-0 duration-500" : ""
          } ${
            isOpened
              ? "opacity-0 pointer-events-none"
              : "hover:scale-105 active:scale-95 animate-pulse"
          }`}
        >
          {/* Outer Ring Inset */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-amber-300/50 flex items-center justify-center shadow-inner">
            <SealIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100 drop-shadow-md group-hover:scale-110 transition" />
          </div>

          {/* Sparkle highlight */}
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-300 text-[#7E151E] flex items-center justify-center shadow-xs">
            <Sparkles className="w-2 h-2" />
          </div>
        </button>

        {showClickHint && !isOpened && !isOpening && (
          <div className="mt-2.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 shadow-lg tracking-wide whitespace-nowrap animate-bounce">
            খুলতে মোমের সিলে স্পর্শ করুন
          </div>
        )}
      </div>
    </div>
  );
}

