import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function SecretFooter() {
  return (
    <footer className="mt-12 border-t border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-[#0B0F17]/60 backdrop-blur-sm py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="bg-white px-2 py-0.5 rounded-lg border border-stone-200 dark:border-white/20 shadow-xs inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-6 w-auto object-contain"
            />
          </div>
          <span className="font-black text-sm text-[#7E151E] dark:text-rose-400">
            অনুভূতি • বেনামী বার্তা
          </span>
        </div>

        <p className="text-xs text-stone-500 font-medium max-w-md mx-auto">
          হৃদয়ের গভীর না বলা অনুভূতি ও গল্পের উন্মুক্ত বাংলা প্ল্যাটফর্ম।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-stone-600 dark:text-stone-400 pt-1">
          <Link href="/" className="hover:text-[#7E151E] transition">
            হোমপেজ
          </Link>
          <Link href="/m" className="hover:text-[#7E151E] transition">
            বেনামী বার্তা
          </Link>
          <Link href="/birthday-wish" className="hover:text-[#7E151E] transition">
            জন্মদিনের চিঠি
          </Link>
          <Link href="/sporsher-byakoron" className="hover:text-[#7E151E] transition">
            স্পর্শের ব্যাকরণ
          </Link>
          <Link href="/tips" className="hover:text-[#7E151E] transition">
            ওয়েলনেস টিপস
          </Link>
        </div>

        <div className="pt-2 text-[11px] text-stone-400 flex items-center justify-center gap-1">
          <span>অনানুভূতি প্রকাশনা © 2026 • সর্বস্বত্ব সংরক্ষিত</span>
        </div>
      </div>
    </footer>
  );
}
