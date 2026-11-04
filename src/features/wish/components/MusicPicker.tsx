"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { startMusic, type MusicHandle } from "../music";
import { MUSIC_OPTIONS, type WishMusic } from "../types";

interface MusicPickerProps {
  value: WishMusic;
  onChange: (music: WishMusic) => void;
}

export default function MusicPicker({ value, onChange }: MusicPickerProps) {
  const [previewing, setPreviewing] = useState<WishMusic | null>(null);
  const handleRef = useRef<MusicHandle | null>(null);

  const stopPreview = () => {
    handleRef.current?.stop();
    handleRef.current = null;
    setPreviewing(null);
  };

  useEffect(() => stopPreview, []);

  const select = (id: WishMusic) => {
    stopPreview();
    onChange(id);
  };

  const togglePreview = (id: WishMusic) => {
    if (previewing === id) return stopPreview();
    stopPreview();
    handleRef.current = startMusic(id);
    if (handleRef.current) setPreviewing(id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {MUSIC_OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <div
            key={opt.id}
            className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border transition ${
              active
                ? "border-[#7E151E] dark:border-rose-400 bg-rose-50/60 dark:bg-rose-950/30 ring-2 ring-[#7E151E]/15"
                : "border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40"
            }`}
          >
            <button
              type="button"
              onClick={() => select(opt.id)}
              className="flex-1 flex items-center gap-2 text-left text-xs font-semibold text-stone-800 dark:text-stone-200 cursor-pointer"
            >
              <span className="text-base">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
            {opt.id !== "none" && (
              <button
                type="button"
                onClick={() => togglePreview(opt.id)}
                aria-label={`${opt.label} শুনে দেখুন`}
                className="w-8 h-8 shrink-0 rounded-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center text-[#7E151E] dark:text-rose-300 cursor-pointer"
              >
                {previewing === opt.id ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

