"use client";

import React, { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

interface CountdownScreenProps {
  unlockAtMs: number;
  /** serverNow - clientNow, so a wrong device clock can't unlock early or late. */
  clockOffsetMs: number;
  recipientName: string;
  senderName: string;
  onDone: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function CountdownScreen({
  unlockAtMs,
  clockOffsetMs,
  recipientName,
  senderName,
  onDone,
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

  return (
    <div className="flex flex-col items-center text-center w-full max-w-lg animate-fade-in">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-medium mb-5">
        <CalendarClock className="w-3.5 h-3.5" />
        <span>চিঠিটি এখনো বন্ধ আছে</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">প্রিয় {recipientName},</h1>
      <p className="text-sm text-stone-300 mb-8 max-w-sm">
        <span className="font-semibold text-amber-300">{senderName}</span> তোমার জন্য একটি বিশেষ চিঠি তৈরি
        করে রেখেছেন। নির্ধারিত সময় হলেই খামটি খুলতে পারবে ✨
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

      <p className="mt-8 text-xs text-stone-400">
        ⏰ {new Date(unlockAtMs).toLocaleString("bn-BD", { dateStyle: "full", timeStyle: "short" })} এ খুলবে
      </p>
    </div>
  );
}

