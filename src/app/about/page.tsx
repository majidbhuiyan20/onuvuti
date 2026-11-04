import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Heart, Feather, Sparkles, ShieldCheck, Mail, ArrowRight, Users2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে (About Us) — অনুভূতি পাবলিকেশন্স",
  description:
    "অনুভূতি (Onuvuti) — মনের না বলা কথা, সম্পর্ক, মনস্তত্ত্ব, জীবনদর্শন এবং স্পর্শের ব্যাকরণ প্রকাশনার গল্প।",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FCFAF6] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-[#111827]/80 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-300 hover:text-[#7E151E] dark:hover:text-rose-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </Link>

          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="অনুভূতি"
              className="h-8 w-auto object-contain"
            />
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4 border-b border-stone-200 dark:border-stone-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[#7E151E] dark:text-rose-300 text-xs font-bold">
            <Feather className="w-3.5 h-3.5" />
            <span>অনুভূতি পাবলিকেশন্স (Onuvuti Publications)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#142230] dark:text-white tracking-tight leading-tight">
            মনের না বলা কথা ও সাহিত্যের একটি নিরাপদ উন্মুক্ত ঠিকানা
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-3xl">
            অনুভূতি হলো এমন এক মুক্ত প্রাঙ্গণ, যেখানে মানুষ তার জমে থাকা অব্যক্ত অনুভূতি, ভালোবাসা, গোপন ক্রাশ কনফেশন এবং জীবনের বাস্তব উপলব্ধিগুলো কোনো সংকোচ ছাড়া প্রকাশ করতে পারে।
          </p>
        </div>

        {/* Section: Who We Are & Mission */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#7E151E]/10 dark:bg-rose-950/60 flex items-center justify-center text-[#7E151E] dark:text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#142230] dark:text-white">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              আজকের ব্যস্ত ও যান্ত্রিক জীবনে আমাদের অনেকেরই মনের কথা শোনার মতো বিশ্বস্ত কেউ থাকে না। অনুভূতি সেই নীরব জায়গাটি পূরণ করতে চায়—যেখানে প্রতিটি আবেগ মূল্য পায় এবং মানুষ পড়ার মাধ্যমে নিজের ভেতরের শান্তি খুঁজে পায়।
            </p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#C59B27]/10 dark:bg-amber-950/60 flex items-center justify-center text-[#C59B27]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#142230] dark:text-white">স্পর্শের ব্যাকরণ ও প্রকাশনা</h2>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              অনুভূতি পাবলিকেশন্স আধুনিক বাংলা সাহিত্য, মানবিক মনস্তত্ত্ব ও সম্পর্কের গভীর বিষয়গুলো নিয়ে নিয়মিত কাজ করছে। আমাদের প্রকাশিত বেস্টসেলার ই-বুক &apos;স্পর্শের ব্যাকরণ&apos; হাজারো পাঠকের হৃদয়ে স্থান করে নিয়েছে।
            </p>
          </div>
        </section>

        {/* Section: Core Pillars */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-xl font-black text-[#142230] dark:text-white">আমাদের মূল স্তম্ভসমূহ</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="space-y-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
              <div className="font-bold text-sm text-[#142230] dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>সম্পূর্ণ গোপনীয়তা</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                বেনামে গল্প পাঠানো ও গোপন বার্তা আদান-প্রদানে প্রেরকের পরিচয় শতভাগ সুরক্ষিত থাকে।
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
              <div className="font-bold text-sm text-[#142230] dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C59B27]" />
                <span>মৌলিক সাহিত্য</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                প্রতিটি লেখা মানুষের বাস্তব জীবনের খাঁটি অভিজ্ঞতা ও সৃজনশীল মনের প্রকাশ।
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80">
              <div className="font-bold text-sm text-[#142230] dark:text-white flex items-center gap-2">
                <Users2 className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
                <span>সহমর্মী কমিউনিটি</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                পাঠকদের মতামত, অনুভূতি প্রকাশ ও একে অপরের প্রতি মানসিক সহমর্মিতার বন্ধন।
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-3xl bg-gradient-to-br from-[#FAF4E6] to-[#F5ECE0] dark:from-[#1E293B] dark:to-[#0F172A] border border-[#C59B27]/40 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-[#142230] dark:text-white">
              আপনার গল্পটিও পৌঁছে দিন হাজারো পাঠকের কাছে
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              নাম প্রকাশে অনিচ্ছুক হয়েও আপনার মনের কথাগুলো আজই লিখে পাঠাতে পারেন।
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition shadow-xs shrink-0"
          >
            <span>গল্প পড়ুন বা লিখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
