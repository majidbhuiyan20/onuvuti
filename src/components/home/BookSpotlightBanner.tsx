"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { BOOK_INFO } from "@/data/bookData";

export default function BookSpotlightBanner() {
  return (
    <section
      aria-label="স্পর্শের ব্যাকরণ বই শোকেস"
      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF4E6] via-white to-[#F9EFE2] dark:from-[#131B2A] dark:via-[#111827] dark:to-[#1A1F2C] border border-[#C59B27]/40 dark:border-stone-800 p-6 sm:p-8 shadow-sm transition-all"
    >
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#C59B27]/10 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-12 items-center gap-6 sm:gap-8">
        {/* Book Visual Mockup (Left Column on Desktop) */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-[#80131E] rounded-2xl opacity-20 group-hover:opacity-35 blur-lg transition duration-500" />

            <div className="relative w-44 sm:w-48 rounded-xl overflow-hidden shadow-2xl border border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-900 transform group-hover:-translate-y-1 transition duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BOOK_INFO.coverImage}
                alt="স্পর্শের ব্যাকরণ - বইয়ের প্রচ্ছদ"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Book Details & Call to Action (Right Column on Desktop) */}
        <div className="md:col-span-8 space-y-4 text-center md:text-left">
          {/* Bestseller Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0DC] dark:bg-[#1E293B] border border-[#C59B27]/50 text-[#80131E] dark:text-rose-300 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>বেস্টসেলার ই-বুক • অনুভূতি পাবলিকেশন্স</span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-[#142230] dark:text-white font-serif tracking-tight">
              স্পর্শের ব্যাকরণ
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
              সম্পর্কের মনস্তত্ত্ব, ভালোবাসার না বলা ভাষা ও আত্মিক উপলব্ধির এক গভীর সাহিত্য-সংকলন। হাজারো পাঠকের হৃদয়ে আলোড়ন তোলা বইটি এখন সরাসরি আপনার ফোনে।
            </p>
          </div>

          {/* Social Proof & Stars */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              ))}
              <span className="font-black ml-1 text-stone-800 dark:text-stone-200">
                ৫.০
              </span>
            </div>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 dark:text-stone-400 font-semibold">
              ১,২০০+ পাঠকের হৃদয়স্পর্শী রিভিউ
            </span>
          </div>

          {/* Price & Purchase Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#80131E] dark:text-rose-400">
                ৳{BOOK_INFO.offerPriceBn}
              </span>
              <span className="text-xs text-stone-400 line-through">
                ৳{BOOK_INFO.regularPriceBn}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {BOOK_INFO.discountPercentBn}
              </span>
            </div>

            <Link
              href="/sporsher-byakoron"
              className="px-6 py-3 rounded-full bg-[#80131E] hover:bg-[#680f18] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-102 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>বইটি সংগ্রহ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>বিকাশ ও নগদে তাৎক্ষণিক ডাউনলোড</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ফোন ও ল্যাপটপে পড়ার উপযোগী হাই-কোয়ালিটি PDF</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

