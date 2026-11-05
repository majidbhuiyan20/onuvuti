"use client";

import React, { useEffect, useState } from "react";
import { CalendarClock, Clock, Sparkles } from "lucide-react";

interface CountdownScreenProps {
  unlockAtMs: number;
  /** serverNow - clientNow, so a wrong device clock can't unlock early or late. */
  clockOffsetMs: number;
  recipientName: string;
  senderName: string;
  onDone: () => void;
  themeId?: string;
  relationship?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function CountdownScreen({
  unlockAtMs,
  clockOffsetMs,
  recipientName,
  senderName,
  onDone,
  themeId = "",
  relationship = "",
}: CountdownScreenProps) {
  const remaining = () => unlockAtMs - (Date.now() + clockOffsetMs);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    setLeft(remaining());
    const id = setInterval(() => {
      const r = remaining();
      setLeft(r);
      if (r <= 0) {
        clearInterval(id);
        onDone();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockAtMs, clockOffsetMs]);

  const total = Math.max(0, Math.floor(left / 1000));
  const units = [
    { label: "দিন", value: Math.floor(total / 86400) },
    { label: "ঘণ্টা", value: Math.floor((total % 86400) / 3600) },
    { label: "মিনিট", value: Math.floor((total % 3600) / 60) },
    { label: "সেকেন্ড", value: total % 60 },
  ];

  const isWedding =
    themeId === "wedding_royal" ||
    relationship.includes("বিবাহ") ||
    relationship.includes("নিমন্ত্রণ");
  const isAnniv =
    themeId === "anniversary_gold" ||
    relationship.includes("বার্ষিকী") ||
    relationship.includes("দম্পতি");

  const badgeText = isWedding
    ? "শুভ পরিণয়ের শুভ লগ্নের অপেক্ষা"
    : isAnniv
    ? "বিবাহবার্ষিকীর বিশেষ মুহূর্তের অপেক্ষা"
    : "চিঠিটি এখনো বন্ধ আছে";

  const greeting = isWedding
    ? recipientName.startsWith("জনাব") || recipientName.startsWith("প্রিয়")
      ? recipientName
      : `সম্মানিত ${recipientName}`
    : `প্রিয় ${recipientName}`;

  const messageLead = isWedding ? (
    <>
      <span className="font-semibold text-amber-300">{senderName}</span> পরিবার আপনাদের জন্য শুভ পরিণয়ের নিমন্ত্রণপত্র সাজিয়ে রেখেছেন। নির্ধারিত মুহূর্ত উপস্থিত হলেই কার্ডটি উন্মুক্ত হবে।
    </>
  ) : isAnniv ? (
    <>
      <span className="font-semibold text-amber-300">{senderName}</span> আপনার জন্য ভালোবাসায় মোড়ানো বিবাহবার্ষিকীর চিঠি তৈরি করে রেখেছেন। বিশেষ ক্ষণ উপস্থিত হলেই খামটি খুলতে পারবেন।
    </>
  ) : (
    <>
      <span className="font-semibold text-amber-300">{senderName}</span> আপনার জন্য একটি বিশেষ চিঠি তৈরি করে রেখেছেন। নির্ধারিত সময় হলেই খামটি খুলতে পারবেন।
    </>
  );

  return (
    <div className="flex flex-col items-center text-center w-full max-w-lg animate-fade-in">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-medium mb-5">
        <CalendarClock className="w-3.5 h-3.5" />
        <span>{badgeText}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{greeting},</h1>
      <p className="text-sm text-stone-300 mb-8 max-w-sm">
        {messageLead}
      </p>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {units.map((u) => (
          <div
            key={u.label}
            className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 py-4 shadow-xl"
          >
            <div className="text-2xl sm:text-4xl font-black text-white tabular-nums">{pad(u.value)}</div>
            <div className="text-[10px] sm:text-xs text-amber-200 mt-1">{u.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 inline-flex items-center gap-1.5 text-xs text-stone-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
        <Clock className="w-3.5 h-3.5 text-amber-300" />
        <span>{new Date(unlockAtMs).toLocaleString("bn-BD", { dateStyle: "full", timeStyle: "short" })} এ খুলবে</span>
      </div>
    </div>
  );
}

