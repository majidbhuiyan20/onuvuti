import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2, Mail, ExternalLink } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি (Privacy Policy) — অনুভূতি",
  description:
    "অনুভূতি (Onuvuti) প্ল্যাটফর্মের গোপনীয়তা নীতি, তথ্য সুরক্ষা, গুগল অ্যাডসেন্স ও কুকি ব্যবহারের বিস্তারিত নির্দেশিকা।",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCFAF6] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] transition-colors">
      {/* Top Navigation */}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Header Hero */}
        <div className="space-y-3 border-b border-stone-200 dark:border-stone-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[#7E151E] dark:text-rose-300 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>ব্যবহারকারীর তথ্য সুরক্ষা ও গোপনীয়তা</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#142230] dark:text-white tracking-tight">
            গোপনীয়তা নীতি (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬ | অনুভূতি পাবলিকেশন্স (Onuvuti Publications)
          </p>
        </div>

        {/* Introduction */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
            <span>১. ভূমিকা ও প্রতিশ্রুতি</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            অনুভূতি (onuvuti.site)-তে আপনার গোপনীয়তা রক্ষা করা আমাদের অন্যতম প্রধান অগ্রাধিকার। এই নীতিমালায় ব্যাখ্যা করা হয়েছে যে কীভাবে আমরা আপনার তথ্য সংগ্রহ, সংরক্ষণ, এবং সুরক্ষিত রাখি যখন আপনি আমাদের সাইটটি ভিজিট করেন বা আমাদের কোনো সেবা (গল্প পাঠ, কনফেশন শেয়ার, গোপন বার্তা প্রেরণ, অথবা বিশেষ শুভেচ্ছা তৈরি) ব্যবহার করেন।
          </p>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            আমাদের প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি এই গোপনীয়তা নীতিতে উল্লেখিত শর্তাবলী ও তথ্য ব্যবস্থাপনায় আপনার সম্মতি প্রদান করছেন।
          </p>
        </section>

        {/* Information We Collect */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
            <span>২. আমরা কী ধরনের তথ্য সংগ্রহ করি</span>
          </h2>
          <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
              <h3 className="font-bold text-stone-900 dark:text-white">ক. লগ ফাইল ও প্রযুক্তিগত তথ্য</h3>
              <p>
                অন্যান্য সাধারণ ওয়েবসাইটের মতো আমরাও লগ ফাইল ব্যবহার করি। এর মধ্যে অন্তর্ভুক্ত থাকতে পারে আপনার আইপি অ্যাড্রেস (IP Address), ব্রাউজারের ধরন, ইন্টারনেট সার্ভিস প্রোভাইডার (ISP), তারিখ ও সময়ের স্ট্যাম্প, এবং রেফারিং পেজ। এই তথ্য কোনো ব্যক্তিগত তথ্যের সাথে সংযুক্ত করা হয় না এবং শুধুমাত্র সাইট বিশ্লেষণ ও স্প্যাম প্রতিরোধে ব্যবহৃত হয়।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
              <h3 className="font-bold text-stone-900 dark:text-white">খ. বেনামী কনফেশন ও গোপন চিঠিপত্র</h3>
              <p>
                আপনি যখন কোনো লেখা বা বার্তা বেনামে পাঠাতে পছন্দ করেন, অনুভূতি আপনার নাম, পরিচয় বা ব্যক্তিগত প্রোফাইল কখনোই প্রকাশ করে না। আমাদের মেসেজিং সিস্টেমে প্রেরকের পরিচয় সম্পূর্ণ গোপন থাকে।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
              <h3 className="font-bold text-stone-900 dark:text-white">গ. ই-বুক অর্ডার ও পেমেন্ট তথ্য</h3>
              <p>
                ই-বুক ক্রয়ের সময় পেমেন্ট প্রসেসিং সরাসরি আমাদের অনুমোদিত গেটওয়ে (ZiniPay)-এর মাধ্যমে সম্পন্ন হয়। আপনার কার্ড বা মোবাইল ব্যাংকিংয়ের পিন/পাসওয়ার্ড আমাদের সার্ভারে কখনোই সংরক্ষণ করা হয় না।
              </p>
            </div>
          </div>
        </section>

        {/* Google AdSense and DoubleClick Cookie */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
            <span>৩. গুগল অ্যাডসেন্স ও ডাবলক্লিক ডার্ট কুকি (Google AdSense & Cookies)</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            গুগল (Google) আমাদের সাইটের একজন থার্ড-পার্টি ভেন্ডর হিসেবে বিজ্ঞাপন প্রদর্শনের উদ্দেশ্যে কুকি (Cookie) ব্যবহার করে।
          </p>
          <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300 list-disc pl-5">
            <li>
              গুগল ডার্ট (DART) কুকি ব্যবহারের মাধ্যমে অনুভূতি (onuvuti.site) এবং ইন্টারনেটের অন্যান্য সাইট পরিদর্শনের ওপর ভিত্তি করে প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শন করতে পারে।
            </li>
            <li>
              ব্যবহারকারীরা চাইলে গুগলের বিজ্ঞাপন ও কনটেন্ট নেটওয়ার্ক গোপনীয়তা নীতিতে গিয়ে ডার্ট কুকি ব্যবহার প্রত্যাখ্যান করতে পারেন। বিস্তারিত জানার জন্য ভিজিট করুন:{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7E151E] dark:text-rose-400 font-semibold underline inline-flex items-center gap-1"
              >
                <span>Google Ads Privacy Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>৪. ডেটা সিকিউরিটি ও নিরাপত্তা ব্যবস্থা</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            অনুভূতি সাইটটি শিল্পমানসম্পন্ন এসএসএল (SSL/TLS) এনক্রিপশন, ফায়ারওয়াল এবং রেট লিমিটিং দ্বারা সুরক্ষিত। আমরা কোনো তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত ইমেইল বা যোগাযোগের তথ্য বিক্রি, ভাড়া বা বাণিজ্যিক উদ্দেশ্যে হস্তান্তর করি না।
          </p>
        </section>

        {/* Children's Information */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white">
            ৫. শিশুদের গোপনীয়তা (Children&apos;s Information)
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            আমরা ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে কোনো ব্যক্তিগত শনাক্তকরণযোগ্য তথ্য ইচ্ছাকৃতভাবে সংগ্রহ করি না। যদি আপনার মনে হয় আপনার সন্তান আমাদের সাইটে এ ধরনের তথ্য প্রদান করেছে, তবে অবিলম্বে আমাদের সাথে যোগাযোগ করুন; আমরা অবিলম্বে সেই তথ্য মুছে ফেলার ব্যবস্থা গ্রহণ করব।
          </p>
        </section>

        {/* Contact Us */}
        <section className="rounded-3xl bg-gradient-to-br from-[#FAF4E6] to-[#F5ECE0] dark:from-[#1E293B] dark:to-[#0F172A] border border-[#C59B27]/40 p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-black text-[#142230] dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
            <span>৬. যোগাযোগ ও মতামত</span>
          </h2>
          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            এই গোপনীয়তা নীতি সম্পর্কে আপনার কোনো প্রশ্ন, পরামর্শ বা অভিযোগ থাকলে অনুগ্রহ করে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন:
          </p>
          <div className="pt-1">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs sm:text-sm font-bold transition shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>যোগাযোগ পাতায় যান</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

