"use client";

import React, { useState, useEffect } from "react";
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
  Eye,
  RotateCcw,
} from "lucide-react";
import { SecretMessage, SecretInboxPublic } from "@/features/secret/types";
import EnvelopeCard, { WAX_SEAL_ICONS } from "./EnvelopeCard";
import { letterSound } from "@/lib/letterSound";

interface LetterRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: SecretMessage | null;
  inbox: SecretInboxPublic | null;
  onOpenReply: (msg: SecretMessage) => void;
  onDeleteMessage?: (msgId: string) => void;
  isInitialUnopened?: boolean;
}

export default function LetterRevealModal({
  isOpen,
  onClose,
  message,
  inbox,
  onOpenReply,
  onDeleteMessage,
  isInitialUnopened = false,
}: LetterRevealModalProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [isLetterRevealed, setIsLetterRevealed] = useState(!isInitialUnopened);

  // Sync state when new message is opened
  useEffect(() => {
    if (isOpen) {
      if (isInitialUnopened) {
        setIsLetterRevealed(false);
        setIsOpening(false);
      } else {
        setIsLetterRevealed(true);
        setIsOpening(false);
      }
    }
  }, [isOpen, isInitialUnopened, message?.id]);

  if (!isOpen || !message || !inbox) return null;

  const handleBreakSeal = () => {
    if (isOpening || isLetterRevealed) return;
    setIsOpening(true);
    letterSound.playSealBreak();

    setTimeout(() => {
      setIsLetterRevealed(true);
      setIsOpening(false);
    }, 700);
  };

  const handleReplayEnvelope = () => {
    setIsLetterRevealed(false);
    setIsOpening(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Close Button on Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. SEALED ENVELOPE STAGE (Before breaking seal) */}
        {!isLetterRevealed && (
          <div className="flex flex-col items-center space-y-6 w-full animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>সিলমোহরকৃত গোপন চিঠি</span>
              </span>
              <h3 className="text-xl font-black text-white pt-1">
                আপনার নামে একটি বেনামী চিঠি এসেছে
              </h3>
              <p className="text-xs text-stone-300 max-w-xs mx-auto">
                চিঠিটি পড়তে এবং ভেতরে কী লেখা আছে দেখতে মোমের সিলমোহরে স্পর্শ করুন।
              </p>
            </div>

            {/* Interactive Envelope with Seal */}
            <EnvelopeCard
              theme={message.cardTheme || "crimson"}
              sealCategory={message.moodEmoji || "crush"}
              recipientUsername={inbox.username}
              recipientDisplayName={inbox.displayName}
              isOpening={isOpening}
              isOpened={false}
              onSealClick={handleBreakSeal}
              showClickHint={!isOpening}
              size="lg"
            />

            {/* Action Trigger Button */}
            <button
              type="button"
              onClick={handleBreakSeal}
              disabled={isOpening}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-900 font-extrabold text-sm shadow-xl transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-stone-900" />
              <span>{isOpening ? "সিলমোহর খোলা হচ্ছে..." : "সিলমোহর ভেঙে চিঠিটি পড়ুন"}</span>
            </button>
          </div>
        )}

        {/* 2. REVEALED PARCHMENT LETTER STAGE */}
        {isLetterRevealed && (
          <div className="w-full bg-[#FAF5E8] dark:bg-[#1C1814] text-stone-800 dark:text-stone-100 rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl p-6 sm:p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
            {/* Subtle vintage letter paper texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 28px)",
              }}
            />

            {/* Letter Header */}
            <div className="flex items-center justify-between border-b border-stone-300/80 dark:border-stone-800 pb-3 relative z-10">
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

              <div className="text-right text-[11px] text-stone-500 dark:text-stone-400">
                <div className="font-semibold">{formatExactTime(message.createdAt)}</div>
                <div className="text-[10px]">{formatExactDate(message.createdAt)}</div>
              </div>
            </div>

            {/* Letter Salutation */}
            <div className="space-y-3 relative z-10">
              <div className="font-serif italic text-base sm:text-lg text-[#7E151E] dark:text-amber-200 font-bold">
                প্রিয় {inbox.displayName},
              </div>

              {/* Letter Body (Parchment Styled with Ruled Lines) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800 shadow-inner">
                <p className="text-sm sm:text-base font-serif leading-relaxed text-stone-800 dark:text-stone-100 whitespace-pre-wrap font-medium">
                  &ldquo;{message.content}&rdquo;
                </p>
              </div>

              <div className="text-right font-serif italic text-xs text-stone-500 dark:text-stone-400 pt-1">
                — একজন শুভাকাঙ্ক্ষী (পরিচয় গোপন)
              </div>
            </div>

            {/* Sender Hints & Curiosity Meter */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-1.5 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 dark:text-amber-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>প্রেরকের সংকেত (Clues):</span>
                </span>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                  ১০০% বেনামী
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>পাঠানোর সময়: {formatExactTime(message.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3 h-3 text-stone-400" />
                  <span>মাধ্যম: মোবাইল ব্রাউজার</span>
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

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 relative z-10">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReply(message);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#7E151E] to-rose-700 hover:from-[#650e16] hover:to-rose-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {message.replyText
                    ? "স্টোরি কার্ড এডিট করুন"
                    : "উত্তর দিন ও স্টোরি কার্ড বানান"}
                </span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReplayEnvelope}
                  className="p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 text-stone-600 dark:text-stone-300 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
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
                    className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
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
