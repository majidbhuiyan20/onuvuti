"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BarChart3, Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import type { CreatedWish } from "../types";
import { absoluteWishUrl, inviteText, manageUrl } from "../share";
import ShareBar from "./ShareBar";

interface CreatedCardProps {
  wish: CreatedWish;
  recipientName: string;
  selfDestruct: boolean;
  hasPasscode: boolean;
  scheduledLabel?: string;
  onReset: () => void;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-1">{label}</span>
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-inner">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 bg-transparent px-2 text-xs font-mono text-stone-700 dark:text-stone-200 outline-none truncate"
        />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "কপি হয়েছে!" : "কপি"}</span>
        </button>
      </div>
    </div>
  );
}

export default function CreatedCard({
  wish,
  recipientName,
  selfDestruct,
  hasPasscode,
  scheduledLabel,
  onReset,
}: CreatedCardProps) {
  const shareUrl = absoluteWishUrl(wish.id);
  const reactionsUrl = manageUrl(wish.id, wish.manageKey);

  return (
    <div className="mb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-stone-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in-up">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
            আপনার জাদুকরী চিঠি প্রস্তুত! 🎉
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
            লিঙ্কটি প্রিয়জনকে পাঠিয়ে দিন। সে লিঙ্কে ঢুকলেই মোমের সিল ভেঙে চিঠিটি খুলে পড়বে।
          </p>
        </div>

        {(scheduledLabel || hasPasscode || selfDestruct) && (
          <ul className="text-[11px] font-semibold text-stone-700 dark:text-stone-200 space-y-1 p-3 rounded-2xl bg-white/70 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            {scheduledLabel && <li>⏰ চিঠি খুলবে: {scheduledLabel}</li>}
            {hasPasscode && <li>🔑 সিক্রেট কোড দিতে হবে — কোডটি প্রাপককে আলাদা করে জানান</li>}
            {selfDestruct && <li>🔥 একবার খুললেই চিঠি চিরতরে মুছে যাবে (আপনি নিজে খুললেও!)</li>}
          </ul>
        )}

        <CopyField label="চিঠির লিঙ্ক (প্রাপককে পাঠান)" value={shareUrl} />
        <ShareBar url={shareUrl} text={inviteText(recipientName)} />

        <div className="pt-1 space-y-3">
          <CopyField label="🔒 শুধু আপনার জন্য: রিঅ্যাকশন দেখার গোপন লিঙ্ক (সংরক্ষণ করে রাখুন)" value={reactionsUrl} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/wish/${wish.id}/replies?key=${encodeURIComponent(wish.manageKey)}`}
              target="_blank"
              className="py-3 px-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 font-bold text-xs flex items-center justify-center gap-2 hover:border-[#7E151E] transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>রিঅ্যাকশন দেখুন</span>
            </Link>
            {!selfDestruct && !hasPasscode && !scheduledLabel && (
              <Link
                href={wish.shareUrl}
                target="_blank"
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>👀 নিজে একবার খুলে দেখুন</span>
              </Link>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>আরেকটি নতুন চিঠি তৈরি করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}

