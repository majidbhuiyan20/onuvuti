"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Clock,
  Share2,
  Trash2,
  Check,
  Feather,
  Mail,
  ShieldCheck,
  Smartphone,
  RotateCcw,
  Download,
  Type,
  Volume2,
  VolumeX,
  FastForward,
  Star,
} from "lucide-react";
import { SecretMessage, SecretInboxPublic } from "@/features/secret/types";
import EnvelopeCard, { WAX_SEAL_ICONS } from "./EnvelopeCard";
import { letterSound } from "@/lib/letterSound";
import { renderFormattedInline } from "@/lib/formatText";
import {
  renderPostcardToCanvas,
  downloadPostcardImage,
} from "./postcardGenerator";
import LetterAmbientParticles from "./LetterAmbientParticles";

interface LetterRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: SecretMessage | null;
  inbox: SecretInboxPublic | null;
  onOpenReply: (msg: SecretMessage) => void;
  onDeleteMessage?: (msgId: string) => void;
  isInitialUnopened?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (msgId: string) => void;
}

type RevealStage = "sealed" | "opening" | "unfolding" | "revealed";

export default function LetterRevealModal({
  isOpen,
  onClose,
  message,
  inbox,
  onOpenReply,
  onDeleteMessage,
  isInitialUnopened = false,
  isFavorite = false,
  onToggleFavorite,
}: LetterRevealModalProps) {
  const [stage, setStage] = useState<RevealStage>(
    isInitialUnopened ? "sealed" : "revealed"
  );
  const [typedLength, setTypedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Preference Controls
  const [fontStyle, setFontStyle] = useState<"handwritten" | "classic">(
    "handwritten"
  );
  const [isLargeText, setIsLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDownloadingPostcard, setIsDownloadingPostcard] = useState(false);
  const [postcardSaved, setPostcardSaved] = useState(false);

  const postcardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parse custom sender clue if present
  const parsed = React.useMemo(() => {
    if (!message?.content) return { cleanText: "", clue: undefined };
    const match = message.content.match(/^([\s\S]*?)(?:\n\n\[সংকেত:\s*(.+?)\])?$/);
    if (match && match[2]) {
      return { cleanText: match[1].trim(), clue: match[2].trim() };
    }
    return { cleanText: message.content, clue: undefined };
  }, [message?.content]);

  // Sync state when new message is loaded
  useEffect(() => {
    if (isOpen && message) {
      if (isInitialUnopened) {
        setStage("sealed");
        setTypedLength(0);
        setIsTyping(false);
      } else {
        setStage("revealed");
        setTypedLength(parsed.cleanText.length);
        setIsTyping(false);
      }
    }
  }, [isOpen, isInitialUnopened, message?.id, parsed.cleanText.length]);

  // Typewriter Engine
  useEffect(() => {
    if (stage !== "revealed" || !parsed.cleanText) return;

    if (typedLength >= parsed.cleanText.length) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const char = parsed.cleanText[typedLength] || "";
    // Variable natural typing speed
    const delay = char === " " ? 20 : char === "\n" ? 70 : 26;

    const timer = setTimeout(() => {
      setTypedLength((prev) => {
        const next = prev + 1;
        if (soundEnabled && next % 3 === 0) {
          letterSound.playPenScratch();
        }
        if (next >= parsed.cleanText.length) {
          setIsTyping(false);
          if (soundEnabled) {
            letterSound.playLetterCompleteChime();
          }
        }
        return next;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [stage, typedLength, parsed.cleanText, soundEnabled]);

  if (!isOpen || !message || !inbox) return null;

  const handleBreakSeal = () => {
    if (stage !== "sealed") return;

    // Step 1: Break Seal
    setStage("opening");
    if (soundEnabled) {
      letterSound.playSealBreak();
    }
    letterSound.triggerHaptic([40, 25, 55]);

    // Step 2: Unfold Letter Paper
    setTimeout(() => {
      setStage("unfolding");
      if (soundEnabled) {
        letterSound.playPaperRustle(0.22);
      }
      letterSound.triggerHaptic([20, 20]);
    }, 450);

    // Step 3: Full Reading View & Typewriter Start
    setTimeout(() => {
      setStage("revealed");
      setTypedLength(0);
      setIsTyping(true);
    }, 1100);
  };

  const handleSkipTyping = () => {
    setTypedLength(parsed.cleanText.length);
    setIsTyping(false);
  };

  const handleReplayEnvelope = () => {
    setStage("sealed");
    setTypedLength(0);
    setIsTyping(false);
  };

  const handleSavePostcard = async () => {
    if (!postcardCanvasRef.current || !message || !inbox) return;
    setIsDownloadingPostcard(true);
    try {
      await renderPostcardToCanvas({
        canvas: postcardCanvasRef.current,
        recipientDisplayName: inbox.displayName,
        recipientUsername: inbox.username,
        messageContent: parsed.cleanText,
        sealLabel: seal.label,
        createdAt: message.createdAt,
      });

      await downloadPostcardImage(
        postcardCanvasRef.current,
        inbox.username,
        message.id
      );

      setPostcardSaved(true);
      setTimeout(() => setPostcardSaved(false), 2500);
    } finally {
      setIsDownloadingPostcard(false);
    }
  };

  const formatExactTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "কিছুক্ষণ আগে";
    }
  };

  const formatExactDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const seal =
    message.moodEmoji in WAX_SEAL_ICONS
      ? WAX_SEAL_ICONS[message.moodEmoji]
      : WAX_SEAL_ICONS.crush;
  const SealIcon = seal.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Floating Ambient Stardust Particles based on message mood */}
      <LetterAmbientParticles moodCategory={message.moodEmoji || "crush"} />

      {/* Hidden Canvas for Postcard Keepsake Export */}
      <canvas ref={postcardCanvasRef} className="hidden" />

      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center z-10 my-auto py-6">
        {/* Close Button on Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 sm:-top-12 right-1 sm:right-0 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer z-50 shadow-md"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. SEALED & OPENING STAGES */}
        {stage !== "revealed" && (
          <div className="flex flex-col items-center space-y-6 w-full animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>সিলমোহরকৃত গোপন চিঠি</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
                আপনার নামে একটি বেনামী চিঠি এসেছে
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xs mx-auto">
                চিঠির ভেতরের গোপন অনুভূতি দেখতে মোমের সিলমোহরে স্পর্শ করুন।
              </p>
            </div>

            {/* Interactive Envelope & 3D Folding Stage */}
            <div className="relative w-full flex justify-center">
              <EnvelopeCard
                theme={message.cardTheme || "crimson"}
                sealCategory={message.moodEmoji || "crush"}
                recipientUsername={inbox.username}
                recipientDisplayName={inbox.displayName}
                isOpening={stage === "opening" || stage === "unfolding"}
                isOpened={stage === "unfolding"}
                onSealClick={handleBreakSeal}
                showClickHint={stage === "sealed"}
                size="lg"
              />

              {/* 3D Paper Sliding Up & Unfolding */}
              {stage === "unfolding" && (
                <div
                  className="absolute -top-8 w-11/12 max-w-md bg-[#FAF5E8] dark:bg-[#1E1915] rounded-2xl border-2 border-amber-400/80 shadow-2xl p-6 z-40 animate-in slide-in-from-bottom-16 duration-700 overflow-hidden"
                  style={{ perspective: "1000px" }}
                >
                  <div className="text-center space-y-2 py-4">
                    <Feather className="w-8 h-8 text-[#7E151E] dark:text-amber-300 mx-auto animate-pulse" />
                    <span className="text-xs font-black text-[#7E151E] dark:text-amber-200 uppercase tracking-widest block">
                      চিঠির ভাঁজ খোলা হচ্ছে...
                    </span>
                    <div className="w-32 h-1.5 bg-amber-200/50 rounded-full mx-auto overflow-hidden">
                      <div className="w-full h-full bg-[#7E151E] animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Trigger Button */}
            {stage === "sealed" && (
              <button
                type="button"
                onClick={handleBreakSeal}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-900 font-black text-sm shadow-xl transition flex items-center gap-2 cursor-pointer active:scale-95 transform hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-stone-900" />
                <span>সিলমোহর ভেঙে চিঠিটি পড়ুন</span>
              </button>
            )}
          </div>
        )}

        {/* 2. REVEALED PARCHMENT LETTER STAGE */}
        {stage === "revealed" && (
          <div className="w-full bg-[#FAF5E8] dark:bg-[#1A1612] text-stone-800 dark:text-stone-100 rounded-3xl border-2 border-[#D4AF37]/60 shadow-2xl p-5 sm:p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
            {/* Subtle vintage lined notebook texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 28px)",
              }}
            />

            {/* Top Toolbar: Seal Info (Left) & Controls (Right) */}
            <div className="flex items-center justify-between border-b border-stone-300/80 dark:border-stone-800 pb-3 relative z-10 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#7E151E] text-amber-200 flex items-center justify-center shadow-xs">
                  <SealIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#7E151E] dark:text-rose-400">
                    {seal.label}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                    গোপন অনুভূতি
                  </div>
                </div>
              </div>

              {/* Reader Controls: Font Style, Font Size, Audio */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setFontStyle((prev) =>
                      prev === "handwritten" ? "classic" : "handwritten"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="ফন্ট স্টাইল পরিবর্তন (হস্তাক্ষর / মুদ্রিত)"
                >
                  <Type className="w-3 h-3 text-[#7E151E] dark:text-rose-400" />
                  <span className="hidden sm:inline">
                    {fontStyle === "handwritten" ? "হস্তাক্ষর" : "মুদ্রিত"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLargeText((prev) => !prev)}
                  className="px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 text-[11px] font-bold transition cursor-pointer"
                  title="লেখার আকার ছোট/বড় করুন"
                >
                  {isLargeText ? "A-" : "A+"}
                </button>

                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 transition cursor-pointer"
                  title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  )}
                </button>

                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(message.id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isFavorite
                        ? "bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-300"
                        : "bg-white/70 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-400 hover:text-amber-500"
                    }`}
                    title={isFavorite ? "পছন্দের তালিকা থেকে সরান" : "পছন্দের তালিকায় যুক্ত করুন"}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFavorite ? "fill-amber-500 text-amber-500" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Letter Salutation */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="font-serif italic text-base sm:text-lg text-[#7E151E] dark:text-amber-200 font-bold">
                  প্রিয় {inbox.displayName},
                </div>
                <div className="text-right text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
                  <span>{formatExactTime(message.createdAt)}</span> •{" "}
                  <span>{formatExactDate(message.createdAt)}</span>
                </div>
              </div>

              {/* Letter Body (Parchment Styled with Ruled Lines & Typewriter Animation) */}
              <div
                className={`p-4 sm:p-6 rounded-2xl bg-white/75 dark:bg-stone-900/70 border border-stone-200/90 dark:border-stone-800 shadow-inner relative transition-all ${
                  isLargeText
                    ? "text-base sm:text-lg leading-relaxed sm:leading-loose"
                    : "text-sm sm:text-base leading-relaxed sm:leading-loose"
                } ${
                  fontStyle === "handwritten"
                    ? "font-serif italic font-medium tracking-wide"
                    : "font-sans font-medium"
                }`}
              >
                <div className="text-stone-800 dark:text-stone-100 whitespace-pre-wrap select-text">
                  &ldquo;
                  {renderFormattedInline(
                    parsed.cleanText.slice(0, typedLength)
                  )}
                  &rdquo;
                  {/* Blinking calligraphy quill / pen cursor */}
                  {isTyping && (
                    <span className="inline-flex items-center ml-1 text-[#7E151E] dark:text-rose-400 animate-pulse">
                      <Feather className="w-3.5 h-3.5 inline align-middle -rotate-45" />
                    </span>
                  )}
                </div>

                {/* Fast Forward / Skip Typewriter Button */}
                {isTyping && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSkipTyping}
                      className="text-[11px] font-bold text-stone-400 hover:text-[#7E151E] dark:hover:text-rose-400 underline cursor-pointer inline-flex items-center gap-1 transition"
                    >
                      <FastForward className="w-3 h-3" />
                      <span>একবারে সম্পূর্ণ পড়ুন</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="text-right font-serif italic text-xs text-stone-500 dark:text-stone-400 pt-1">
                — একজন শুভাকাঙ্ক্ষী (পরিচয় গোপন)
              </div>
            </div>

            {/* Sender Hints & Curiosity Meter */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 space-y-2 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>প্রেরকের সংকেত (Clues):</span>
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                  ১০০% গোপন ও ব্যক্তিগত
                </span>
              </div>

              {/* Detective Clue Drop from Sender */}
              {parsed.clue && (
                <div className="p-2.5 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300/80 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block text-amber-800 dark:text-amber-400 font-mono">
                      প্রেরকের বিশেষ ক্লু / সংকেত:
                    </span>
                    <span className="font-serif italic font-bold text-xs sm:text-sm">
                      &ldquo;{parsed.clue}&rdquo;
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>পাঠানোর সময়: {formatExactTime(message.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-stone-400" />
                  <span>মাধ্যম: অনলাইন মোবাইল ব্রাউজার</span>
                </div>
              </div>
            </div>

            {/* Existing Reply if already answered */}
            {message.replyText && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 space-y-1 relative z-10">
                <div className="text-xs font-bold text-[#7E151E] dark:text-rose-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>আপনার দেওয়া উত্তর:</span>
                </div>
                <p className="text-xs font-medium text-stone-700 dark:text-stone-200 leading-relaxed">
                  {message.replyText}
                </p>
              </div>
            )}

            {/* Action Buttons Toolbar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 relative z-10">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReply(message);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#7E151E] via-[#941924] to-rose-700 hover:opacity-95 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {message.replyText
                    ? "স্টোরি কার্ড এডিট করুন"
                    : "উত্তর দিন ও স্টোরি কার্ড বানান"}
                </span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Save Keepsake Postcard Button */}
                <button
                  type="button"
                  onClick={handleSavePostcard}
                  disabled={isDownloadingPostcard}
                  className="flex-1 sm:flex-initial px-3.5 py-3 rounded-xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="ভিন্টেজ পোস্টকার্ড হিসেবে সেভ করুন"
                >
                  <Download className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  <span>
                    {isDownloadingPostcard
                      ? "সেভ হচ্ছে..."
                      : postcardSaved
                      ? "সেভ হয়েছে!"
                      : "পোস্টকার্ড সেভ"}
                  </span>
                </button>

                {/* Replay Wax Seal & Unfolding */}
                <button
                  type="button"
                  onClick={handleReplayEnvelope}
                  className="p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 text-stone-600 dark:text-stone-300 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                  title="পুনরায় খামসহ দেখুন"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {onDeleteMessage && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteMessage(message.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    title="চিঠি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
