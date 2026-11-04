"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { compressImage } from "../media";

interface PhotoPickerProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

export default function PhotoPicker({ value, onChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await compressImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "ছবি যোগ করা যায়নি");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="নির্বাচিত ছবি"
            className="h-28 w-auto rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="ছবি সরান"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full sm:w-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-xs font-bold text-stone-600 dark:text-stone-300 hover:border-[#7E151E] hover:text-[#7E151E] transition cursor-pointer disabled:opacity-50"
        >
          <ImagePlus className="w-4 h-4" />
          <span>{busy ? "ছবি প্রস্তুত হচ্ছে..." : "একটি স্মৃতির ছবি যোগ করুন"}</span>
        </button>
      )}
      {error && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

