"use client";

import React, { useEffect, useState } from "react";
import { CalendarClock, Flame, KeyRound } from "lucide-react";
import { toLocalInputValue } from "../media";

export interface SpecialOptionsValue {
  scheduleOn: boolean;
  unlockLocal: string; // datetime-local value
  passcode: string;
  selfDestruct: boolean;
}

interface SpecialOptionsProps {
  value: SpecialOptionsValue;
  onChange: (next: SpecialOptionsValue) => void;
}

const inputCls =
  "w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7E151E]";

function quickTimes(): { label: string; date: Date }[] {
  const now = new Date();
  const tonight = new Date(now);
  tonight.setHours(24, 0, 0, 0); // next midnight
  const morning = new Date(now);
  morning.setDate(morning.getDate() + 1);
  morning.setHours(8, 0, 0, 0);
  const inHour = new Date(now.getTime() + 60 * 60 * 1000);
  return [
    { label: "১ ঘণ্টা পর", date: inHour },
    { label: "আজ রাত ১২:০০", date: tonight },
    { label: "আগামীকাল সকাল ৮টা", date: morning },
  ];
}

function Toggle({
  checked,
  onChange,
  icon,
  title,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-[#7E151E]"
      />
      <span>
        <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-100">
          {icon}
          {title}
        </span>
        <span className="block text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{hint}</span>
      </span>
    </label>
  );
}

export default function SpecialOptions({ value, onChange }: SpecialOptionsProps) {
  const set = (patch: Partial<SpecialOptionsValue>) => onChange({ ...value, ...patch });
  const [minLocal, setMinLocal] = useState("");

  useEffect(() => {
    setMinLocal(toLocalInputValue(new Date()));
  }, []);

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50">
      <div className="space-y-2.5">
        <Toggle
          checked={value.scheduleOn}
          onChange={(v) =>
            set({
              scheduleOn: v,
              unlockLocal: v && !value.unlockLocal ? toLocalInputValue(quickTimes()[1].date) : value.unlockLocal,
            })
          }
          icon={<CalendarClock className="w-3.5 h-3.5 text-amber-600" />}
          title="জন্মদিনের সময়ে খুলবে (কাউন্টডাউন সহ)"
          hint="সময় না হওয়া পর্যন্ত চিঠি বন্ধ থাকবে, প্রাপক শুধু কাউন্টডাউন দেখবে।"
        />
        {value.scheduleOn && (
          <div className="pl-7 space-y-2">
            <input
              type="datetime-local"
              min={minLocal}
              value={value.unlockLocal}
              onChange={(e) => set({ unlockLocal: e.target.value })}
              className={inputCls}
            />
            <div className="flex flex-wrap gap-1.5">
              {quickTimes().map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => set({ unlockLocal: toLocalInputValue(q.date) })}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:border-[#7E151E] cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-100">
          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
          সিক্রেট কোড (ঐচ্ছিক)
        </span>
        <input
          type="text"
          maxLength={20}
          value={value.passcode}
          onChange={(e) => set({ passcode: e.target.value })}
          placeholder="৪–২০ অক্ষর, যেমন: 1234 বা আমাদেরগল্প"
          className={inputCls}
        />
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          কোড না জানলে কেউ চিঠি খুলতে পারবে না। কোডটি প্রাপককে আলাদা করে জানিয়ে দিন।
        </p>
      </div>

      <Toggle
        checked={value.selfDestruct}
        onChange={(v) => set({ selfDestruct: v })}
        icon={<Flame className="w-3.5 h-3.5 text-rose-600" />}
        title="গোপন চিঠি — একবার পড়ার পর মুছে যাবে"
        hint="প্রাপক একবার খুললেই চিঠি, ছবি ও ভয়েস সার্ভার থেকে চিরতরে মুছে যাবে। নিজে খুলে দেখলেও মুছে যাবে!"
      />
    </div>
  );
}

