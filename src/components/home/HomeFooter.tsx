"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface HomeFooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenSubmit: () => void;
}

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function HomeFooter({
  onSelectCategory,
  onOpenSubmit,
}: HomeFooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  return (
    <footer className="border-t border-stone-200/80 dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#0B0F17] py-12 text-stone-600 dark:text-stone-300 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Col 1: Original Brand Logo in White Card & Tagline */}
          <div className="lg:col-span-3 space-y-3">
            <Link href="/" className="inline-block">
              <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Onuvuti-Publications-Logo.png"
                  alt="Onuvuti Publications"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
              অনূভুতি হলো মনের না বলা কথা, ক্রাশ কনফেশন, সাহিত্য ও মানসিক প্রশান্তির একটি নিরাপদ উন্মুক্ত সাহিত্য প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Col 2: দ্রুত লিংক */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#142230] dark:text-white uppercase tracking-wider">
              দ্রুত লিংক
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("সকল গল্প");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 cursor-pointer"
                >
                  হোম
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("রোমান্টিক গল্প");
                    document
                      .getElementById("stories-feed")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 cursor-pointer"
                >
                  গল্প
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("না বলা কথা");
                    document
                      .getElementById("stories-feed")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 cursor-pointer"
                >
                  চিঠি
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("ক্রাশ ও কনফেশন");
                    document
                      .getElementById("stories-feed")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 cursor-pointer"
                >
                  কনফেশন
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: কোম্পানি */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#142230] dark:text-white uppercase tracking-wider">
              কোম্পানি
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 transition"
                >
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 transition"
                >
                  ব্যবহারের শর্তাবলী ও নীতি
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 transition"
                >
                  গোপনীয়তা নীতি (Privacy)
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#7E151E] dark:hover:text-rose-400 transition"
                >
                  যোগাযোগ (Contact)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: সামাজিক মাধ্যম */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#142230] dark:text-white uppercase tracking-wider">
              সামাজিক মাধ্যম
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center hover:bg-[#7E151E] hover:text-white transition shadow-2xs"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center hover:bg-[#7E151E] hover:text-white transition shadow-2xs"
                aria-label="YouTube"
              >
                <YoutubeIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center hover:bg-[#7E151E] hover:text-white transition shadow-2xs"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Col 5: নিউজলেটার সাবস্ক্রাইব */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-[#142230] dark:text-white uppercase tracking-wider">
              নিউজলেটার সাবস্ক্রাইব করুন
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              নতুন গল্প ও আপডেট পেতে ইমেইল দিন
            </p>
            {newsletterDone ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 shrink-0" />
                <span>ধন্যবাদ! আপনি সাবস্ক্রাইব করেছেন।</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail.trim()) {
                    setNewsletterDone(true);
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="আপনার ইমেইল লিখুন..."
                  required
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-[#142230] dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-[#7E151E]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold shrink-0 transition cursor-pointer shadow-xs"
                >
                  সাবস্ক্রাইব
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 dark:text-stone-400">
          <div>
            © 2026 Onuvuti. সর্বস্বত্ব সংরক্ষিত। | যেখানে প্রতিটি অনুভূতির একটি গল্প আছে ❤️
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">শর্তাবলী</span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">প্রাইভেসি পলিসি</span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">কনটেন্ট নীতি</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

