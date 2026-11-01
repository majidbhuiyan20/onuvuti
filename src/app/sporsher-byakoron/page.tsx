"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { BOOK_INFO, BOOK_PARTS, APPENDICES } from "@/data/bookData";
import BookCover3D from "@/components/BookCover3D";
import ZiniPayCheckout from "@/components/ZiniPayCheckout";

export default function SporsherByakoronLandingPage() {
  const [openPartId, setOpenPartId] = useState<string | null>("part-1");

  const scrollToCheckout = () => {
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#142230] pb-20 sm:pb-0">
      {/* Minimal Header with Navigation Menu */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply"
              />
            </Link>
            <span className="text-stone-300 hidden sm:inline">/</span>
            <span className="text-sm sm:text-base font-extrabold text-[#80131E] hidden sm:inline">
              {BOOK_INFO.titleBn}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-2 text-xs font-extrabold text-stone-600">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] hover:text-[#80131E] transition"
            >
              হোমপেজ (গল্প ও কনফেশন)
            </Link>
            <a
              href="#toc"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] hover:text-[#80131E] transition"
            >
              সূচিপত্র
            </a>
            <a
              href="#checkout"
              className="px-3 py-1.5 rounded-xl hover:bg-[#FAF4E6] hover:text-[#80131E] transition"
            >
              পেমেন্ট ও ডাউনলোড
            </a>
          </nav>

          <a
            href={BOOK_INFO.zinipayProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm hover:bg-[#630d16] transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>কিনুন • ৳{BOOK_INFO.offerPriceBn}</span>
          </a>
        </div>
      </header>

      {/* MINIMAL HERO SECTION (BOOK COVER AT THE TOP) */}
      <section className="py-10 sm:py-14 border-b border-stone-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* 1. Book Cover Right at the Top */}
          <BookCover3D />

          {/* 2. Title & Tagline */}
          <div className="space-y-2 pt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white border border-stone-200 text-[#80131E] text-xs font-bold shadow-xs">
              অনুভূতি পাবলিকেশন্স • প্রিমিয়াম ই-বুক (PDF)
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#80131E] leading-tight pt-1">
              {BOOK_INFO.titleBn}
            </h1>
            <p className="text-lg sm:text-xl font-bold text-[#142230]">
              {BOOK_INFO.subtitleBn}
            </p>
            <p className="text-sm sm:text-base font-bold text-[#80131E]/90 italic">
              “{BOOK_INFO.taglineBn}”
            </p>
          </div>

          {/* 3. Price & Primary Buy CTA right below Title */}
          <div className="flex flex-col items-center gap-3 pt-1">
            <div className="text-xs sm:text-sm text-stone-600 font-medium flex items-center gap-2">
              <span>
                রেগুলার মূল্য{" "}
                <span className="line-through text-stone-400 font-semibold">
                  ৳{BOOK_INFO.regularPriceBn}
                </span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#80131E]/10 text-[#80131E] font-extrabold text-xs">
                {BOOK_INFO.discountPercentBn}
              </span>
            </div>

            <a
              href={BOOK_INFO.zinipayProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl bg-[#80131E] text-white font-bold text-base sm:text-lg inline-flex items-center gap-2.5 shadow-lg shadow-[#80131E]/20 hover:bg-[#630d16] transition cursor-pointer"
            >
              <span>এখনই ই-বুকটি নিন — ৳{BOOK_INFO.offerPriceBn}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* 4. Short Description & 5 Highlights Card */}
          <div className="max-w-2xl mx-auto text-left rounded-2xl bg-white border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed text-center">
              {BOOK_INFO.descriptionBn}
            </p>

            <div className="pt-2 border-t border-stone-100">
              <div className="text-xs font-extrabold text-[#80131E] uppercase tracking-wider mb-2.5 text-center">
                বইটিতে যা থাকছে:
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {BOOK_INFO.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm text-[#142230] font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#80131E] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPACT TABLE OF CONTENTS (ACCORDION) */}
      <section id="toc" className="py-12 sm:py-16 bg-white border-b border-stone-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80131E]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>একনজরে সূচিপত্র</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142230]">
              ৪টি অংশ, ১৮টি অধ্যায় ও ৪টি পরিশিষ্ট
            </h2>
          </div>

          <div className="space-y-3">
            {BOOK_PARTS.map((part) => {
              const isOpen = openPartId === part.id;
              return (
                <div
                  key={part.id}
                  className="rounded-2xl bg-[#FDF8F2] border border-stone-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenPartId(isOpen ? null : part.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF4E6]/60 transition"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#80131E] block">
                        {part.partNumberBn}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-[#142230]">
                        {part.title}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-2 border-t border-stone-200/70 space-y-2 bg-white">
                      {part.chapters.map((ch) => (
                        <div
                          key={ch.numberEn}
                          className="text-xs sm:text-sm text-stone-700 flex items-start gap-2 py-1"
                        >
                          <span className="font-bold text-[#80131E] shrink-0">
                            অধ্যায় {ch.numberBn}:
                          </span>
                          <span>{ch.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 4 Appendices Summary */}
            <div className="rounded-2xl bg-[#FDF8F2] border border-stone-200 p-5 space-y-2">
              <div className="text-xs font-bold text-[#80131E]">
                বিশেষ সংযোজন (পরিশিষ্টসমূহ)
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-stone-700 font-medium">
                {APPENDICES.map((app, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#80131E] font-bold">✦</span>
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECT CHECKOUT SECTION */}
      <section id="checkout" className="py-12 sm:py-20 bg-[#FDF8F2]">
        <div className="max-w-lg mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142230]">
              পেমেন্ট ও ইনস্ট্যান্ট ডাউনলোড
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              ZiniPay (বিকাশ, নগদ, রকেট বা উপায়) দিয়ে পেমেন্ট করলেই সাথে সাথে PDF ডাউনলোড হবে।
            </p>
          </div>

          <ZiniPayCheckout />
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-stone-200 py-8 text-xs text-stone-500 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-10 w-auto object-contain mix-blend-multiply"
            />
            <span>© ২০২৬ অনুভূতি পাবলিকেশন্স (Onuvuti.site)</span>
          </div>
          <span className="flex items-center gap-1.5 text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>পেমেন্ট পার্টনার: ZiniPay</span>
          </span>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 line-through">
            ৳{BOOK_INFO.regularPriceBn}
          </span>
          <span className="text-lg font-extrabold text-[#80131E]">
            ৳{BOOK_INFO.offerPriceBn}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#80131E]/10 text-[#80131E] font-bold text-[10px]">
            {BOOK_INFO.discountPercentBn}
          </span>
        </div>
        <a
          href={BOOK_INFO.zinipayProductUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>এখনই কিনুন</span>
        </a>
      </div>
    </div>
  );
}
