import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, CheckCircle2, AlertTriangle, ShieldCheck, Mail, Scale } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্তাবলী (Terms & Conditions) — অনুভূতি",
  description:
    "অনুভূতি (Onuvuti) প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী, সম্পাদকীয় নীতি, কপিরাইট ও আইনগত নির্দেশিকা।",
};

export default function TermsPage() {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Header Hero */}
        <div className="space-y-3 border-b border-stone-200 dark:border-stone-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>আইনগত ও সম্পাদকীয় নিয়মাবলী</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#142230] dark:text-white tracking-tight">
            ব্যবহারের শর্তাবলী (Terms and Conditions)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬ | অনুভূতি পাবলিকেশন্স (Onuvuti Publications)
          </p>
        </div>

        {/* Section 1: Acceptance */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
            <span>১. শর্তাবলীর স্বীকৃতি (Acceptance of Terms)</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            অনুভূতি (onuvuti.site) ওয়েবসাইটটি ব্যবহার বা ব্রাউজ করার মাধ্যমে আপনি এই ব্যবহারের শর্তাবলী এবং আমাদের গোপনীয়তা নীতিতে বর্ণিত যাবতীয় নিয়ম মেনে নিতে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে একমত না হন, তবে অনুগ্রহ করে সাইটটি ব্যবহার করা থেকে বিরত থাকুন।
          </p>
        </section>

        {/* Section 2: Platform Purpose & User Conduct */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>২. প্ল্যাটফর্মের ব্যবহার ও কমিউনিটি গাইডলাইন</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            অনুভূতি হলো সাহিত্য, মনস্তত্ত্ব, না বলা কথা ও সুস্থ মানসিক অনুভূতির একটি নিরাপদ উন্মুক্ত মাধ্যম। প্ল্যাটফর্মে কোনো লেখা সাবমিট করার সময় নিম্নলিখিত নিয়ম কঠোরভাবে মেনে চলা আবশ্যক:
          </p>
          <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300 list-disc pl-5">
            <li>কারো প্রতি কোনো প্রকার ঘৃণা, বিদ্বেষমূলক বক্তব্য, বা ব্যক্তিগত আক্রমণ প্রকাশ করা যাবে না।</li>
            <li>কারো অনুমতি ছাড়া ব্যক্তিগত ফোন নম্বর, ঠিকানা বা স্পর্শকাতর গোপন তথ্য প্রচার করা সম্পূর্ণ নিষিদ্ধ।</li>
            <li>কোনো প্রকার অশ্লীল, বেআইনি, বা কপিরাইট লঙ্ঘিত কনটেন্ট আপলোড করা যাবে না।</li>
            <li>অনুভূতি সম্পাদনা পর্ষদ যেকোনো অনুপযুক্ত বা ক্ষতিকর লেখা বাতিল বা মুছে ফেলার পূর্ণ অধিকার সংরক্ষণ করে।</li>
          </ul>
        </section>

        {/* Section 3: Intellectual Property & Copyright */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
            <span>৩. মেধা স্বত্ব ও কপিরাইট (Intellectual Property)</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            অনুভূতি সাইটে প্রকাশিত &apos;স্পর্শের ব্যাকরণ&apos; ই-বুক, অফিশিয়াল নিবন্ধ, গ্রাফিক্স ও লোগো অনুভূতি পাবলিকেশন্সের নিজস্ব সম্পত্তি। অনুমতি ছাড়া এই ই-বুকটি পুনঃবিক্রয়, অননুমোদিত সাইটে আপলোড বা বাণিজ্যিক উদ্দেশ্যে ব্যবহার করা আইনত দণ্ডনীয়।
          </p>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            লেখকরা তাদের নিজ নিজ পাঠানো গল্পের স্বত্বাধিকারী। তবে গল্পটি অনুভূতিতে জমা দেওয়ার মাধ্যমে লেখক অনুভূতিকে এটি প্রকাশ ও পাঠকদের মাঝে প্রচার করার অবাণিজ্যিক লাইসেন্স প্রদান করেন।
          </p>
        </section>

        {/* Section 4: Disclaimer */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>৪. সাধারণ দাবিত্যাগ (Disclaimer)</span>
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            অনুভূতি প্ল্যাটফর্মের বিভিন্ন লেখা, জীবনের গল্প ও মনস্তাত্ত্বিক পরামর্শ সাধারণ সাহিত্যিক ও প্রেরণাদায়ক উদ্দেশ্যে প্রকাশিত। এটি কোনো পেশাদার চিকিৎসা, মনস্তাত্ত্বিক থেরাপি বা আইনি পরামর্শের বিকল্প নয়। জটিল মানসিক সমস্যায় সর্বদা সার্টিফায়েড বিশেষজ্ঞ বা চিকিৎসকের শরণাপন্ন হওয়া বাঞ্ছনীয়।
          </p>
        </section>

        {/* Section 5: Governing Law */}
        <section className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white">
            ৫. শর্তাবলীর পরিবর্তন
          </h2>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
            আমরা যেকোনো সময় এই ব্যবহারের শর্তাবলীতে প্রয়োজনীয় সংযোজন বা পরিবর্তন আনার অধিকার রাখি। নীতিমালার যেকোনো বড় পরিবর্তনের ক্ষেত্রে এই পাতায় হালনাগাদ তারিখ প্রকাশ করা হবে।
          </p>
        </section>

        {/* Contact box */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-3">
          <h3 className="font-bold text-sm text-[#142230] dark:text-white">আইনি বা নিয়মাবলী সংক্রান্ত যোগাযোগ</h3>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            শর্তাবলী বিষয়ে আপনার কোনো আইনি বা কপিরাইট সংক্রান্ত নোটিশ থাকলে আমাদের সাথে সরাসরি যোগাযোগ করুন।
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>যোগাযোগ করুন</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
