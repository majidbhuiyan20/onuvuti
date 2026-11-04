"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("সাধারণ জিজ্ঞাসা");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("অনুগ্রহ করে সব তথ্য পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 800);
  };

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
        {/* Header Hero */}
        <div className="space-y-3 border-b border-stone-200 dark:border-stone-800 pb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-[#7E151E] dark:text-rose-300 text-xs font-bold">
            <Mail className="w-3.5 h-3.5" />
            <span>সাপোর্ট ও যোগাযোগ কেন্দ্র</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142230] dark:text-white tracking-tight">
            আমাদের সাথে যোগাযোগ করুন (Contact Us)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl">
            আপনার যেকোনো মতামত, লেখা প্রকাশ সংক্রান্ত প্রশ্ন, ই-বুক ডাউনলোড সংক্রান্ত সহায়তা বা পরামর্শের জন্য আমাদের সরাসরি বার্তা পাঠান।
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#7E151E]/10 dark:bg-rose-950/60 flex items-center justify-center text-[#7E151E] dark:text-rose-400">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#142230] dark:text-white">ইমেইল ঠিকানা</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 font-mono">
              contact@onuvuti.site
            </p>
            <p className="text-[11px] text-stone-400">যে কোনো সময় ইমেইল করুন</p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#C59B27]/10 dark:bg-amber-950/60 flex items-center justify-center text-[#C59B27]">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#142230] dark:text-white">রেসপন্স সময়</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              ২৪ থেকে ৪৮ ঘণ্টার মধ্যে
            </p>
            <p className="text-[11px] text-stone-400">ছুটির দিনসহ নিয়মিত পর্যবেক্ষণ</p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#142230] dark:text-white">ই-বুক সহায়তা</h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              পেমেন্ট বা ডাউনলোড ইস্যু
            </p>
            <p className="text-[11px] text-stone-400">অর্ডার নম্বরসহ যোগাযোগ করুন</p>
          </div>
        </div>

        {/* Contact Form & FAQ Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-[#142230] dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#7E151E] dark:text-rose-400" />
                <span>বার্তা পাঠান</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                নিচের ফর্মটি পূরণ করে পাঠান, আমাদের টিম দ্রুত উত্তর দেবে।
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="font-extrabold text-base text-emerald-900 dark:text-emerald-200">
                  আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  অনুভূতির সাথে যোগাযোগের জন্য ধন্যবাদ। আমাদের প্রতিনিধি আপনার ইমেইলে দ্রুত উত্তর জানাবেন।
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700 transition"
                >
                  আরেকটি বার্তা পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    আপনার নাম
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: রাফিদ হাসান"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white outline-none focus:border-[#7E151E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    আপনার ইমেইল ঠিকানা
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white outline-none focus:border-[#7E151E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    বিষয়
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white outline-none focus:border-[#7E151E]"
                  >
                    <option value="সাধারণ জিজ্ঞাসা">সাধারণ জিজ্ঞাসা</option>
                    <option value="লেখা বা গল্প প্রকাশ">লেখা বা গল্প প্রকাশ সংক্রান্ত</option>
                    <option value="ই-বুক ডাউনলোড সমস্যা">ই-বুক ডাউনলোড সমস্যা</option>
                    <option value="বিজ্ঞাপন ও পার্টনারশিপ">বিজ্ঞাপন বা স্পনসরশিপ</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    বার্তা বা বিস্তারিত
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white outline-none focus:border-[#7E151E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#7E151E] hover:bg-[#630d16] text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "বার্তা পাঠানো হচ্ছে..." : "বার্তা পাঠান"}</span>
                </button>
              </form>
            )}
          </div>

          {/* FAQ Sidebar */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-extrabold text-base text-[#142230] dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#C59B27]" />
              <span>সাধারণ প্রশ্নোত্তর (FAQ)</span>
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
                <h4 className="font-bold text-stone-900 dark:text-white">
                  লেখা পাঠালে কতদিনের মধ্যে প্রকাশিত হয়?
                </h4>
                <p>
                  আমাদের সম্পাদনা পর্ষদ ২৪ ঘণ্টার মধ্যে প্রতিটি লেখা যাচাই করে প্রকাশ করে।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
                <h4 className="font-bold text-stone-900 dark:text-white">
                  ই-বুক পেমেন্টের পর ডাউনলোড না হলে কী করব?
                </h4>
                <p>
                  পেমেন্ট সম্পন্ন হওয়ার ট্রানজ্যাকশন আইডি (TrxID) দিয়ে আমাদের ইমেইল করুন অথবা সরাসরি এই ফর্মের মাধ্যমে পাঠান।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
                <h4 className="font-bold text-stone-900 dark:text-white">
                  আমার প্রেরিত গল্প কি বেনামে রাখা সম্ভব?
                </h4>
                <p>
                  হ্যাঁ, গল্প সাবমিট করার সময় &apos;নাম প্রকাশে অনিচ্ছুক&apos; বক্সে টিক দিলে আপনার পরিচয় সম্পূর্ণ গোপন থাকবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
