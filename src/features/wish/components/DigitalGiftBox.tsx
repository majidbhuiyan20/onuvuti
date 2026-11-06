"use client";

import React, { useState } from "react";
import { Gift, Sparkles, Coins, Copy, Check, RotateCcw } from "lucide-react";
import type { GiftVoucherData } from "../giftVoucher";
import { playChime } from "../music";

interface DigitalGiftBoxProps {
  voucher: GiftVoucherData;
  senderName: string;
  accentColor?: string;
  onOpenConfetti?: () => void;
}

export default function DigitalGiftBox({
  voucher,
  senderName,
  accentColor = "#c59b27",
  onOpenConfetti,
}: DigitalGiftBoxProps) {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    if (opened) return;
    try {
      playChime("open");
    } catch {}
    if (onOpenConfetti) onOpenConfetti();
    setOpened(true);
  };

  const handleCopy = async () => {
    if (!voucher.token) return;
    try {
      await navigator.clipboard.writeText(voucher.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full my-6 max-w-sm mx-auto select-none">
      {!opened ? (
        /* Closed 3D Gift Box */
        <div
          onClick={handleOpen}
          className="group relative cursor-pointer rounded-3xl p-6 text-center border transition-all duration-500 hover:scale-[1.03] active:scale-[0.98] overflow-hidden shadow-xl"
          style={{
            backgroundColor: `${accentColor}12`,
            borderColor: `${accentColor}40`,
            boxShadow: `0 15px 35px -10px ${accentColor}25`,
          }}
          title="উপহারের খামটি খুলতে ট্যাপ করুন"
        >
          {/* Animated Ambient Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"
            style={{ backgroundColor: accentColor }}
          />

          {/* 3D Gift Icon Vessel */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border mb-3 transition-transform duration-500 group-hover:rotate-6"
              style={{
                backgroundColor: accentColor,
                borderColor: "rgba(255,255,255,0.4)",
                color: "#ffffff",
              }}
            >
              <Gift className="w-8 h-8 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1.5 border"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}50`,
                color: accentColor,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{voucher.title || "একটি বিশেষ সারপ্রাইজ উপহার"}</span>
            </div>

            <h4 className="text-sm sm:text-base font-black text-stone-900 dark:text-white mt-1">
              {senderName} আপনার জন্য একটি উপহার পাঠিয়েছেন!
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              ফিতা খুলে উপহারটি দেখতে এখানে ট্যাপ করুন
            </p>
          </div>
        </div>
      ) : (
        /* Opened Luxury Gift Voucher */
        <div
          className="relative rounded-3xl p-6 sm:p-7 text-center border animate-fade-in-up shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            borderColor: `${accentColor}50`,
            boxShadow: `0 20px 40px -12px ${accentColor}30`,
          }}
        >
          {/* Inner Dashed Inlay */}
          <div
            className="absolute inset-2.5 rounded-2xl pointer-events-none border border-dashed opacity-35"
            style={{ borderColor: accentColor }}
          />

          <div className="relative z-10 space-y-3">
            {/* Ribbon Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: accentColor }}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{voucher.title || "ডিজিটাল সালামি ও শুভেচ্ছা উপহার"}</span>
            </div>

            {/* Big Amount / Gift Value */}
            {voucher.amount && (
              <div className="py-2">
                <span
                  className="text-2xl sm:text-3xl font-black block tracking-wide"
                  style={{ color: accentColor }}
                >
                  {voucher.amount}
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest block mt-0.5">
                  GIFT REWARD
                </span>
              </div>
            )}

            {/* Sender Note */}
            {voucher.note && (
              <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-800 leading-relaxed italic px-2">
                “{voucher.note}”
              </p>
            )}

            {/* Optional Token / Payment Code / bKash */}
            {voucher.token && (
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-800 select-all">
                  <span className="truncate text-left font-bold">{voucher.token}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-white font-sans text-[11px] font-bold flex items-center gap-1 shadow-xs transition hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "কপি হয়েছে!" : "কপি করুন"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Small Footer sign-off */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
              <span>উপহারদাতা: {senderName}</span>
              <button
                type="button"
                onClick={() => setOpened(false)}
                className="hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>পুনরায় বন্ধ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
