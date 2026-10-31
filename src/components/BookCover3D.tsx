"use client";

import React, { useState } from "react";
import { RotateCw } from "lucide-react";

export default function BookCover3D() {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="relative mx-auto select-none max-w-[300px] sm:max-w-[340px]">
      {/* Warm Soft Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-[#8B0000]/10 blur-2xl pointer-events-none" />

      {/* 3D Book Mockup */}
      <div className="relative flex items-stretch transition-transform duration-500 hover:-translate-y-1.5">
        {/* Spine */}
        <div className="w-3.5 sm:w-4 rounded-l-md bg-gradient-to-r from-[#5a0b14] via-[#80131e] to-[#630d16] shadow-inner" />

        {/* Cover Image (Front or Back) */}
        <div className="relative flex-1 aspect-[148/210] rounded-r-xl overflow-hidden bg-[#FDF8F2] shadow-[0_22px_50px_rgba(110,26,44,0.22)] border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showBack ? "/images/book-back.png" : "/images/book-cover.png"}
            alt={
              showBack
                ? "স্পর্শের ব্যাকরণ — শেষ প্রচ্ছদ"
                : "স্পর্শের ব্যাকরণ — প্রচ্ছদ"
            }
            className="w-full h-full object-cover block"
          />
        </div>

        {/* Page Edges */}
        <div className="w-2 my-1.5 rounded-r bg-gradient-to-r from-[#e6dfd3] via-[#faf4e6] to-[#cfc6b6] border-y border-r border-stone-300 shadow" />
      </div>

      {/* Flip Cover Button */}
      <div className="mt-3.5 flex justify-center">
        <button
          type="button"
          onClick={() => setShowBack((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-[#6E1A2C] shadow-sm hover:bg-[#FAF4E6] transition cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{showBack ? "সামনের প্রচ্ছদ দেখুন" : "পেছনের প্রচ্ছদ দেখুন"}</span>
        </button>
      </div>
    </div>
  );
}
