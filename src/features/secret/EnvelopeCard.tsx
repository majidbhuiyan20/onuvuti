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
  CheckCircle2,
} from "lucide-react";

export type EnvelopeThemeKey =
  | "crimson"
  | "midnight"
  | "vintage"
  | "emerald"
  | "aurora"
  | "obsidian"
  | "rose_quartz"
  | "royal_ivory";

export interface EnvelopeThemeConfig {
  id: EnvelopeThemeKey;
  nameBn: string;
  tagBn: string;
  gradientBg: string;
  flapBg: string;
  innerPatternBg: string;
  foilBorder: string;
  foilCorner: string;
  ribbonGradient: string;
  ribbonStitch: string;
  sealBg: string;
  sealBorder: string;
  sealGlow: string;
  sealText: string;
  textColor: string;
  subTextColor: string;
  stampBorder: string;
  stampBg: string;
  postmarkColor: string;
  dotBg: string;
}

export const ENVELOPE_THEMES: Record<EnvelopeThemeKey, EnvelopeThemeConfig> = {
  crimson: {
    id: "crimson",
    nameBn: "রয়েল ক্রিমসন ভেলভেট",
    tagBn: "স্বর্ণালী ফয়েল ও রুবি সিল",
    gradientBg:
      "bg-gradient-to-br from-[#800f1a] via-[#610a12] to-[#40050b]",
    flapBg:
      "bg-gradient-to-b from-[#800f1a] via-[#660b14] to-[#45050c]",
    innerPatternBg: "bg-[#300307]",
    foilBorder: "border-[#E5B54F]/50",
    foilCorner: "text-[#E5B54F]",
    ribbonGradient:
      "bg-gradient-to-r from-[#941120]/80 via-[#D4AF37]/50 to-[#941120]/80",
    ribbonStitch: "border-[#E5B54F]/40",
    sealBg:
      "bg-gradient-to-br from-[#B31D2C] via-[#85121D] to-[#54080F]",
    sealBorder: "border-[#F3CE72]",
    sealGlow: "shadow-[0_0_20px_rgba(243,206,114,0.5)]",
    sealText: "text-amber-100",
    textColor: "text-amber-100",
    subTextColor: "text-amber-200/70",
    stampBorder: "border-[#E5B54F]/60",
    stampBg: "bg-black/30",
    postmarkColor: "text-amber-200/40",
    dotBg: "bg-[#800f1a]",
  },
  midnight: {
    id: "midnight",
    nameBn: "মিডনাইট স্টারডাস্ট",
    tagBn: "গ্যালাক্সি নেভি ও সিলভার ফয়েল",
    gradientBg:
      "bg-gradient-to-br from-[#0e1d38] via-[#091326] to-[#040812]",
    flapBg:
      "bg-gradient-to-b from-[#112447] via-[#0d1a33] to-[#060c19]",
    innerPatternBg: "bg-[#03060c]",
    foilBorder: "border-sky-300/40",
    foilCorner: "text-sky-300",
    ribbonGradient:
      "bg-gradient-to-r from-[#17305c]/80 via-sky-300/40 to-[#17305c]/80",
    ribbonStitch: "border-sky-300/40",
    sealBg:
      "bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#0F172A]",
    sealBorder: "border-sky-300",
    sealGlow: "shadow-[0_0_20px_rgba(147,197,253,0.5)]",
    sealText: "text-sky-100",
    textColor: "text-sky-100",
    subTextColor: "text-sky-200/70",
    stampBorder: "border-sky-300/60",
    stampBg: "bg-black/30",
    postmarkColor: "text-sky-200/40",
    dotBg: "bg-[#0e1d38]",
  },
  vintage: {
    id: "vintage",
    nameBn: "প্রাচীন পার্চমেন্ট",
    tagBn: "হস্তনির্মিত কাগজ ও টেরাকোটা",
    gradientBg:
      "bg-gradient-to-br from-[#A77242] via-[#85552B] to-[#5C3717]",
    flapBg:
      "bg-gradient-to-b from-[#A77242] via-[#8B592D] to-[#633C1A]",
    innerPatternBg: "bg-[#42240E]",
    foilBorder: "border-[#FDE68A]/50",
    foilCorner: "text-[#FDE68A]",
    ribbonGradient:
      "bg-gradient-to-r from-[#6E421F]/80 via-[#FDE68A]/40 to-[#6E421F]/80",
    ribbonStitch: "border-[#FDE68A]/40",
    sealBg:
      "bg-gradient-to-br from-[#92400E] via-[#78350F] to-[#451A03]",
    sealBorder: "border-[#FDE68A]",
    sealGlow: "shadow-[0_0_20px_rgba(253,230,138,0.5)]",
    sealText: "text-amber-100",
    textColor: "text-amber-50",
    subTextColor: "text-amber-200/70",
    stampBorder: "border-[#FDE68A]/60",
    stampBg: "bg-black/30",
    postmarkColor: "text-amber-200/40",
    dotBg: "bg-[#85552B]",
  },
  emerald: {
    id: "emerald",
    nameBn: "ইম্পেরিয়াল পান্না",
    tagBn: "স্বর্ণলতা ও রাজকীয় পান্না",
    gradientBg:
      "bg-gradient-to-br from-[#0c3e2b] via-[#082b1e] to-[#041710]",
    flapBg:
      "bg-gradient-to-b from-[#0f4a34] via-[#0b3827] to-[#061e15]",
    innerPatternBg: "bg-[#030f0a]",
    foilBorder: "border-emerald-300/40",
    foilCorner: "text-emerald-300",
    ribbonGradient:
      "bg-gradient-to-r from-[#0d4f37]/80 via-emerald-300/40 to-[#0d4f37]/80",
    ribbonStitch: "border-emerald-300/40",
    sealBg:
      "bg-gradient-to-br from-[#047857] via-[#065F46] to-[#022c22]",
    sealBorder: "border-emerald-300",
    sealGlow: "shadow-[0_0_20px_rgba(110,231,183,0.5)]",
    sealText: "text-emerald-100",
    textColor: "text-emerald-100",
    subTextColor: "text-emerald-200/70",
    stampBorder: "border-emerald-300/60",
    stampBg: "bg-black/30",
    postmarkColor: "text-emerald-200/40",
    dotBg: "bg-[#0c3e2b]",
  },
  aurora: {
    id: "aurora",
    nameBn: "অ্যামেথিস্ট সিল্ক",
    tagBn: "রাজকীয় বেগুনি ও মুক্তা",
    gradientBg:
      "bg-gradient-to-br from-[#45127d] via-[#310c59] to-[#1c0633]",
    flapBg:
      "bg-gradient-to-b from-[#501791] via-[#380e66] to-[#22073d]",
    innerPatternBg: "bg-[#140324]",
    foilBorder: "border-purple-300/40",
    foilCorner: "text-purple-300",
    ribbonGradient:
      "bg-gradient-to-r from-[#501791]/80 via-purple-300/40 to-[#501791]/80",
    ribbonStitch: "border-purple-300/40",
    sealBg:
      "bg-gradient-to-br from-[#7E22CE] via-[#6B21A8] to-[#3B0764]",
    sealBorder: "border-purple-300",
    sealGlow: "shadow-[0_0_20px_rgba(216,180,254,0.5)]",
    sealText: "text-purple-100",
    textColor: "text-purple-100",
    subTextColor: "text-purple-200/70",
    stampBorder: "border-purple-300/60",
    stampBg: "bg-black/30",
    postmarkColor: "text-purple-200/40",
    dotBg: "bg-[#45127d]",
  },
  obsidian: {
    id: "obsidian",
    nameBn: "ব্ল্যাক অবসিডিয়ান",
    tagBn: "ম্যাট ব্ল্যাক ও খাঁটি সোনা",
    gradientBg:
      "bg-gradient-to-br from-[#212124] via-[#141416] to-[#09090a]",
    flapBg:
      "bg-gradient-to-b from-[#28282b] via-[#19191c] to-[#0c0c0d]",
    innerPatternBg: "bg-[#050505]",
    foilBorder: "border-[#F59E0B]/55",
    foilCorner: "text-[#F59E0B]",
    ribbonGradient:
      "bg-gradient-to-r from-[#28282b]/90 via-[#F59E0B]/50 to-[#28282b]/90",
    ribbonStitch: "border-[#F59E0B]/40",
    sealBg:
      "bg-gradient-to-br from-[#2D2D30] via-[#1A1A1C] to-[#0A0A0B]",
    sealBorder: "border-[#F59E0B]",
    sealGlow: "shadow-[0_0_22px_rgba(245,158,11,0.55)]",
    sealText: "text-amber-200",
    textColor: "text-amber-100",
    subTextColor: "text-stone-300",
    stampBorder: "border-[#F59E0B]/70",
    stampBg: "bg-black/50",
    postmarkColor: "text-amber-200/40",
    dotBg: "bg-[#141416]",
  },
  rose_quartz: {
    id: "rose_quartz",
    nameBn: "রোজ কোয়ার্টজ",
    tagBn: "রোমান্টিক গোলাপি ও শ্যাম্পেন",
    gradientBg:
      "bg-gradient-to-br from-[#7d1c44] via-[#5c1130] to-[#38081c]",
    flapBg:
      "bg-gradient-to-b from-[#8c224e] via-[#661537] to-[#3d0a20]",
    innerPatternBg: "bg-[#290514]",
    foilBorder: "border-rose-300/45",
    foilCorner: "text-rose-300",
    ribbonGradient:
      "bg-gradient-to-r from-[#8c224e]/80 via-rose-300/40 to-[#8c224e]/80",
    ribbonStitch: "border-rose-300/40",
    sealBg:
      "bg-gradient-to-br from-[#BE185D] via-[#9D174D] to-[#500724]",
    sealBorder: "border-rose-300",
    sealGlow: "shadow-[0_0_20px_rgba(244,114,182,0.5)]",
    sealText: "text-rose-100",
    textColor: "text-rose-100",
    subTextColor: "text-rose-200/70",
    stampBorder: "border-rose-300/60",
    stampBg: "bg-black/30",
    postmarkColor: "text-rose-200/40",
    dotBg: "bg-[#7d1c44]",
  },
  royal_ivory: {
    id: "royal_ivory",
    nameBn: "রয়্যাল আইভরি",
    tagBn: "কাশ্মীরি নকশা ও ব্রোঞ্জ",
    gradientBg:
      "bg-gradient-to-br from-[#694e33] via-[#4d3620] to-[#332111]",
    flapBg:
      "bg-gradient-to-b from-[#785b3d] via-[#573f27] to-[#3b2716]",
    innerPatternBg: "bg-[#24160a]",
    foilBorder: "border-[#FDE68A]/50",
    foilCorner: "text-[#FDE68A]",
    ribbonGradient:
      "bg-gradient-to-r from-[#785b3d]/80 via-[#FDE68A]/45 to-[#785b3d]/80",
    ribbonStitch: "border-[#FDE68A]/40",
    sealBg:
      "bg-gradient-to-br from-[#854D0E] via-[#713F12] to-[#3F2207]",
    sealBorder: "border-[#FDE68A]",
    sealGlow: "shadow-[0_0_20px_rgba(253,230,138,0.5)]",
    sealText: "text-amber-100",
    textColor: "text-amber-50",
    subTextColor: "text-amber-200/70",
    stampBorder: "border-[#FDE68A]/60",
    stampBg: "bg-black/30",
    postmarkColor: "text-amber-200/40",
    dotBg: "bg-[#694e33]",
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
  bold: { label: "সাহসী অনুভূতি", icon: Flame },
  birthday: { label: "বার্থডে উইশ", icon: Cake },
};

/** Victorian Ornate Corner Filigree SVG */
function CornerFiligree({
  className = "",
  position = "tl",
}: {
  className?: string;
  position?: "tl" | "tr" | "bl" | "br";
}) {
  const rotationClass = {
    tl: "rotate-0",
    tr: "rotate-90",
    br: "rotate-180",
    bl: "-rotate-90",
  }[position];

  return (
    <svg
      viewBox="0 0 28 28"
      className={`w-4 h-4 sm:w-5 sm:h-5 ${rotationClass} ${className} pointer-events-none drop-shadow-xs`}
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M3 3h12C9 3 3 9 3 15V3z"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M3 3l9 9" strokeWidth="1" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path
        d="M3 18c3-2 6-2 9 0"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M18 3c-2 3-2 6 0 9"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Circular Vintage Postal Cancellation Ink Stamp */
function PostmarkStamp({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-11 h-11 rounded-full border border-current opacity-40 flex flex-col items-center justify-center p-0.5 pointer-events-none select-none rotate-[-12deg] ${className}`}
    >
      <div className="w-full h-full rounded-full border border-dashed border-current flex flex-col items-center justify-center text-[7px] font-mono leading-none tracking-tighter">
        <span>AIRMAIL</span>
        <div className="w-5 h-[1px] bg-current my-0.5 opacity-60" />
        <span>ঢাকা জিপিও</span>
      </div>
    </div>
  );
}

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
    md: "w-80 sm:w-92 h-50 sm:h-56",
    lg: "w-full max-w-md h-58 sm:h-66",
  }[size];

  return (
    <div
      className={`relative select-none ${sizeClasses} ${className} transition-all duration-300`}
      style={{ perspective: "1200px" }}
    >
      {/* Outer Envelope Shadow with Ambient Colored Underglow */}
      <div
        className={`absolute inset-0 rounded-2xl shadow-2xl shadow-black/50 ${config.sealGlow} opacity-30`}
      />

      {/* Envelope Main Body */}
      <div
        className={`absolute inset-0 rounded-2xl ${config.gradientBg} border border-white/20 overflow-hidden flex flex-col justify-between p-3.5 sm:p-4.5 shadow-inner`}
      >
        {/* Subtle Fine Linen / Papyrus Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 20px), repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 20px)",
          }}
        />

        {/* Diagonal Fold Seams for Authentic Physical Envelope Appearance */}
        {/* Left triangular side flap shadow */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right bottom, rgba(0,0,0,0.5) 0%, transparent 50%)",
            clipPath: "polygon(0 0, 50% 50%, 0 100%)",
          }}
        />
        {/* Right triangular side flap shadow */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left bottom, rgba(0,0,0,0.5) 0%, transparent 50%)",
            clipPath: "polygon(100% 0, 50% 50%, 100% 100%)",
          }}
        />
        {/* Bottom triangular fold seam */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
            clipPath: "polygon(0 100%, 50% 48%, 100% 100%)",
          }}
        />

        {/* Inset Gold/Silver Metallic Foil Border Frame */}
        <div
          className={`absolute inset-2 sm:inset-2.5 rounded-xl border ${config.foilBorder} pointer-events-none z-10`}
        />
        <div
          className={`absolute inset-2.5 sm:inset-3 rounded-lg border border-dashed ${config.foilBorder} opacity-40 pointer-events-none z-10`}
        />

        {/* 4 Victorian Corner Filigree Ornaments */}
        <div className={`absolute top-2.5 left-2.5 z-10 ${config.foilCorner}`}>
          <CornerFiligree position="tl" />
        </div>
        <div className={`absolute top-2.5 right-2.5 z-10 ${config.foilCorner}`}>
          <CornerFiligree position="tr" />
        </div>
        <div className={`absolute bottom-2.5 left-2.5 z-10 ${config.foilCorner}`}>
          <CornerFiligree position="bl" />
        </div>
        <div className={`absolute bottom-2.5 right-2.5 z-10 ${config.foilCorner}`}>
          <CornerFiligree position="br" />
        </div>

        {/* Vertical Luxury Satin Ribbon Band */}
        <div
          className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 ${config.ribbonGradient} border-x ${config.ribbonStitch} shadow-md pointer-events-none z-10`}
        >
          {/* Subtle satin center sheen */}
          <div className="absolute inset-y-0 inset-x-1 bg-white/10 blur-[1px]" />
        </div>

        {/* Top Header: Vintage Post Stamp & Confidential Mark */}
        <div className="flex items-start justify-between relative z-20">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/35 backdrop-blur-xs border border-white/20 text-[9px] sm:text-[10px] font-bold text-white/95 uppercase tracking-wider shadow-xs">
              <Mail className="w-2.5 h-2.5 text-amber-300" />
              <span>গোপন চিঠির বাক্স</span>
            </div>
            <div className="text-[9px] text-white/60 font-mono tracking-widest pl-1">
              № 2026-CONFIDENTIAL
            </div>
          </div>

          {/* Postal Markings (Cancellation Ring & Perforated Stamp) */}
          <div className="flex items-center gap-1.5">
            <PostmarkStamp className={config.postmarkColor} />

            {/* Perforated Postage Stamp */}
            <div
              className={`w-9 sm:w-10 h-11 sm:h-12 rounded-sm border-2 border-dashed ${config.stampBorder} ${config.stampBg} backdrop-blur-xs flex flex-col items-center justify-center p-1 rotate-2 shadow-sm`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white/90" />
              <span className="text-[7.5px] font-mono text-white/90 tracking-tighter mt-0.5 uppercase">
                ১০০% গোপন
              </span>
            </div>
          </div>
        </div>

        {/* Center: Recipient Address Calligraphy Tablet */}
        <div className="text-center space-y-0.5 relative z-20 my-auto py-1">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/65 font-medium flex items-center justify-center gap-1.5">
            <span className="w-5 h-[1px] bg-white/30" />
            <span>প্রাপকের ঠিকানা</span>
            <span className="w-5 h-[1px] bg-white/30" />
          </div>
          <div
            className={`text-base sm:text-lg font-serif font-bold ${config.textColor} drop-shadow-md line-clamp-1`}
          >
            {recipientDisplayName || "প্রিয় অনুভূতি"}
          </div>
          {recipientUsername && (
            <div
              className={`text-[10px] sm:text-[11px] font-mono ${config.subTextColor}`}
            >
              @{recipientUsername}
            </div>
          )}
        </div>

        {/* Bottom Details Footer */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-white/60 relative z-20 pt-1.5 border-t border-white/10">
          <span className="font-serif italic">অনুভূতি প্রকাশনা • ঢাকা</span>
          <div className="flex items-center gap-1 font-medium">
            <SealIcon className="w-3 h-3 text-amber-300" />
            <span>{seal.label}</span>
          </div>
        </div>
      </div>

      {/* Top Folding Flap (3D Flip Animation) */}
      <div
        className={`absolute top-0 inset-x-0 h-1/2 origin-top transition-transform duration-700 ease-out z-30 ${
          isOpened || isOpening ? "-rotate-x-180 pointer-events-none" : "rotate-x-0"
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Flap Outer Surface with Diagonal Foil Piping & Real Drop Shadow */}
        <div
          className={`w-full h-full ${config.flapBg} flex items-end justify-center pb-2 relative`}
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.45))",
          }}
        >
          {/* Flap Texture */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 15px)",
            }}
          />

          {/* Diagonal Gold/Silver Foil Piping Along the V-Edge */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L50,100 L100,0"
              fill="none"
              stroke="rgba(243, 206, 114, 0.45)"
              strokeWidth="2"
            />
            <path
              d="M3,0 L50,96 L97,0"
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          </svg>
        </div>
      </div>

      {/* Sculpted 3D Wax Seal Stamp (Centered on Flap Edge) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center">
        <button
          type="button"
          onClick={onSealClick}
          disabled={isOpened || isOpening}
          title={isOpened ? "খোলা হয়েছে" : "চিঠিটি খুলতে মোমের সিলে স্পর্শ করুন"}
          className={`relative group cursor-pointer transition-all duration-300 ${
            isOpening ? "scale-125 opacity-0 duration-500" : ""
          } ${
            isOpened
              ? "opacity-0 pointer-events-none"
              : "hover:scale-105 active:scale-95"
          }`}
        >
          {/* Molten Wax Droplets Ring (Organic Imperfect Melting Edges) */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${config.sealBg} ${config.sealGlow} border-2 ${config.sealBorder} flex items-center justify-center relative shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_5px_rgba(0,0,0,0.6)]`}
          >
            {/* Specular Highlight Sheen Arc */}
            <div className="absolute top-1 left-2 right-2 h-3.5 rounded-t-full bg-white/25 blur-[1px] pointer-events-none" />

            {/* Concentric Engraved Coin Rim */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-amber-300/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] bg-black/15 flex items-center justify-center">
              <SealIcon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${config.sealText} drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:scale-110 transition`} />
            </div>

            {/* Metallic Gold Powder Accent Dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-300 text-stone-900 flex items-center justify-center shadow-sm border border-white/60">
              <Sparkles className="w-2 h-2" />
            </div>
          </div>
        </button>

        {showClickHint && !isOpened && !isOpening && (
          <div className="mt-2.5 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-[10px] font-bold text-amber-200 border border-amber-400/30 shadow-xl tracking-wide whitespace-nowrap animate-bounce flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>খুলতে মোমের সিলে স্পর্শ করুন</span>
          </div>
        )}
      </div>
    </div>
  );
}
