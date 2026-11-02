"use client";

import React from "react";
import { Feather, ArrowRight } from "lucide-react";

interface CallToActionBannerProps {
  onOpenSubmit: () => void;
}

export default function CallToActionBanner({
  onOpenSubmit,
}: CallToActionBannerProps) {
  return (
    <section className="rounded-3xl bg-[#7E151E] text-white p-6 sm:p-8 relative overflow-hidden shadow-md">
      {/* Subtle floral leaf watermark background */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -left-6 -top-6 w-36 h-36 rounded-full bg-black/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-amber-200 shrink-0">
            <Feather className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black font-serif">
              তোমারও কি কিছু বলার আছে?
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 font-medium">
              তোমার গল্প, চিঠি কিংবা কনফেশন পাঠিয়ে দাও অনুভূতির কাছে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={onOpenSubmit}
            className="px-6 py-3 rounded-full bg-white text-[#7E151E] font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-stone-100 transition shadow-sm cursor-pointer"
          >
            <span>গল্প জমা দিন</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Stacked books illustration */}
          <div className="hidden lg:flex flex-col items-center opacity-85">
            <div className="w-12 h-2.5 bg-amber-100/90 rounded-xs -mb-0.5" />
            <div className="w-14 h-3 bg-amber-200/90 rounded-xs -mb-0.5" />
            <div className="w-16 h-3.5 bg-amber-300/90 rounded-xs" />
          </div>
        </div>
      </div>
    </section>
  );
}

