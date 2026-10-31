"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Smartphone,
  Lock,
  ArrowRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { BOOK_INFO } from "@/data/bookData";

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "ONV-100001";
  const invoiceId = searchParams.get("invoice_id") || "ZP_DEMO_100001";

  const [selectedWallet, setSelectedWallet] = useState<string>("bKash");
  const [phone, setPhone] = useState<string>("01712345678");
  const [processing, setProcessing] = useState(false);

  const wallets = [
    { name: "bKash", tag: "বিকাশ" },
    { name: "Nagad", tag: "নগদ" },
    { name: "Rocket", tag: "রকেট" },
    { name: "Upay", tag: "উপায়" },
  ];

  const handleCompletePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      router.push(
        `/payment/success?order_id=${encodeURIComponent(
          orderId
        )}&invoice_id=${encodeURIComponent(invoiceId)}&provider=${encodeURIComponent(
          selectedWallet
        )}`
      );
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#142230] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-white border border-stone-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#FAF4E6] p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#80131E] uppercase">
              ZiniPay Checkout
            </div>
            <h1 className="text-lg font-extrabold text-[#142230]">
              {BOOK_INFO.titleBn}
            </h1>
            <p className="text-xs text-stone-500">অর্ডার: {orderId}</p>
          </div>
          <div className="text-right bg-white px-3.5 py-2 rounded-xl border border-stone-200">
            <div className="text-[11px] text-stone-500">প্রদেয়</div>
            <div className="text-xl font-extrabold text-[#80131E]">
              ৳{BOOK_INFO.offerPriceBn}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              পেমেন্ট মাধ্যম নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {wallets.map((w) => {
                const active = selectedWallet === w.name;
                return (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => setSelectedWallet(w.name)}
                    className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                      active
                        ? "border-[#80131E] bg-[#FAF4E6]"
                        : "border-stone-200 bg-stone-50 hover:bg-white"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[#142230]">
                        {w.name}
                      </div>
                      <div className="text-xs text-stone-500">{w.tag}</div>
                    </div>
                    {active && (
                      <CheckCircle2 className="w-4 h-4 text-[#80131E]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              আপনার {selectedWallet} নম্বর:
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#142230] focus:outline-none focus:border-[#80131E]"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={processing}
            onClick={handleCompletePayment}
            className="w-full py-3.5 px-5 rounded-xl bg-[#80131E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#630d16] transition cursor-pointer disabled:opacity-60"
          >
            <Lock className="w-4 h-4" />
            <span>
              {processing
                ? "ভেরিফাই হচ্ছে..."
                : `৳${BOOK_INFO.offerPriceBn} পেমেন্ট সম্পন্ন করুন`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(`/payment/cancel?order_id=${encodeURIComponent(orderId)}`)
            }
            className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>বাতিল করুন</span>
          </button>
        </div>

        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Secured by ZiniPay
          </span>
          <span>Instant Delivery</span>
        </div>
      </div>
    </div>
  );
}

export default function SandboxPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDF8F2] text-[#142230] flex items-center justify-center">
          লোড হচ্ছে...
        </div>
      }
    >
      <SandboxContent />
    </Suspense>
  );
}
