"use client";

import React, { useRef, useState, useMemo } from "react";
import { ImagePlus, X, Camera, Plus } from "lucide-react";
import { compressImage } from "../media";

interface PhotoPickerProps {
  value: string;
  onChange: (dataUrl: string) => void;
  maxPhotos?: number;
}

export function parsePhotoList(val?: string): string[] {
  if (!val || typeof val !== "string") return [];
  const trimmed = val.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && !!item);
    } catch {}
  }
  if (trimmed.includes("|||")) {
    return trimmed.split("|||").filter(Boolean);
  }
  return [trimmed];
}

export function serializePhotoList(list: string[]): string {
  if (!list || list.length === 0) return "";
  if (list.length === 1) return list[0];
  return JSON.stringify(list);
}

export default function PhotoPicker({ value, onChange, maxPhotos = 5 }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const photos = useMemo(() => parsePhotoList(value), [value]);

  const handleFiles = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setBusy(true);

    try {
      const remainingSlots = maxPhotos - photos.length;
      if (remainingSlots <= 0) {
        setError(`সর্বোচ্চ ${maxPhotos}টি ছবি যোগ করা যাবে`);
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newCompressed: string[] = [];

      for (const file of filesToProcess) {
        try {
          const comp = await compressImage(file, 900);
          newCompressed.push(comp);
        } catch (e) {
          setError(e instanceof Error ? e.message : "ছবি প্রসেস করা যায়নি");
        }
      }

      if (newCompressed.length > 0) {
        const updated = [...photos, ...newCompressed];
        onChange(serializePhotoList(updated));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ছবি যোগ করা যায়নি");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(serializePhotoList(updated));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {photos.length > 0 ? (
        <div className="space-y-2">
          {/* Photos Grid Thumbnails */}
          <div className="flex flex-wrap items-center gap-3">
            {photos.map((url, idx) => (
              <div key={idx} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`স্মৃতির ছবি ${idx + 1}`}
                  className="h-24 w-24 object-cover rounded-2xl border-2 border-stone-200 dark:border-stone-700 shadow-sm transition group-hover:scale-102"
                />
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  aria-label={`ছবি ${idx + 1} সরান`}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md cursor-pointer transition transform hover:scale-110"
                  title="এই ছবিটি মুছে ফেলুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add More Button if slots available */}
            {photos.length < maxPhotos && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="h-24 w-24 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 hover:border-[#7E151E] dark:hover:border-rose-400 text-stone-500 dark:text-stone-400 hover:text-[#7E151E] dark:hover:text-rose-300 flex flex-col items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                title="আরও ছবি যুক্ত করুন"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">আরও ছবি</span>
                <span className="text-[9px] opacity-60">({photos.length}/{maxPhotos})</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            মোট {photos.length}টি স্মৃতির ছবি যুক্ত হয়েছে। প্রাপক এগুলো পোলারয়েড স্লাইডার হিসেবে দেখতে পাবেন।
          </p>
        </div>
      ) : (
        /* Empty State Button */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full sm:w-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-xs font-bold text-stone-700 dark:text-stone-200 hover:border-[#7E151E] hover:text-[#7E151E] dark:hover:border-rose-400 dark:hover:text-rose-300 transition cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ImagePlus className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block font-bold">
              {busy ? "ছবি প্রসেস হচ্ছে..." : "স্মৃতির ছবি যুক্ত করুন (১ থেকে ৫টি)"}
            </span>
            <span className="text-[10px] text-stone-400 block font-normal">
              পোলারয়েড স্টাইলের ফটো অ্যালবামে ফুটে উঠবে
            </span>
          </div>
        </button>
      )}

      {error && <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
