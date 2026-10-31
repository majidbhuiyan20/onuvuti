"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#142230] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-white border border-stone-200 p-7 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
          <XCircle className="w-7 h-7 text-amber-600" />
        </div>

        <h1 className="text-xl font-extrabold text-[#142230]">
          পেমেন্ট বাতিল হয়েছে
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
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
