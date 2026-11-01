"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-7 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto">
          <XCircle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-xl font-extrabold text-[#142230] dark:text-white">
          পেমেন্ট বাতিল হয়েছে
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          আপনার পেমেন্ট সম্পন্ন হয়নি। আপনি যেকোনো সময় পুনরায় পেমেন্ট করে ই-বুকটি ডাউনলোড করতে পারবেন।
        </p>

        <div className="pt-2 space-y-2">
          <Link
            href="/sporsher-byakoron#checkout"
            className="w-full py-3 px-5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 hover:bg-[#630d16] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>পুনরায় চেষ্টা করুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
