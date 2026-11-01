"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Download,
  CheckCircle2,
  Loader2,
  User,
  Smartphone,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { BOOK_INFO } from "@/data/bookData";

export default function ZiniPayCheckout() {
  const [mode, setMode] = useState<"hosted" | "trx">("hosted");

  const [cusName, setCusName] = useState("");
  const [cusPhone, setCusPhone] = useState("");
  const [cusEmail, setCusEmail] = useState("");

  const [transactionId, setTransactionId] = useState("");
  const [trxPhone, setTrxPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedData, setVerifiedData] = useState<{
    downloadUrl: string;
    orderId: string;
    transactionId?: string;
  } | null>(null);

  const merchantNumber =
    process.env.NEXT_PUBLIC_MERCHANT_NUMBER || "01700-000000";

  const handleHostedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cusName.trim() || !cusPhone.trim()) {
      setError("অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর লিখুন।");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cusName, cusPhone, cusEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok || !data.paymentUrl) {
        setError(data?.error || "ZiniPay গেটওয়ে চালু করা যায়নি।");
        setLoading(false);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      setError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।");
      setLoading(false);
    }
  };

  const handleVerifyTrx = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!transactionId.trim()) {
      setError("অনুগ্রহ করে আপনার Transaction ID (TrxID) লিখুন।");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/payment/verify-trx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transactionId.trim(),
          cusName: cusName || "পাঠক",
          cusPhone: trxPhone || cusPhone,
          cusEmail,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok || !data.downloadUrl) {
        setError(data?.error || "Transaction ID ভেরিফাই করা যায়নি।");
        setLoading(false);
        return;
      }

      setVerifiedData({
        downloadUrl: data.downloadUrl,
        orderId: data.order?.orderId || "ONV-VERIFIED",
        transactionId: data.order?.transactionId || transactionId.toUpperCase(),
      });
      setLoading(false);
    } catch {
      setError("ভেরিফিকেশন সার্ভারে সংযোগ করা যায়নি।");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-stone-200/90 shadow-xl overflow-hidden text-[#142230]">
      {/* Top Price Header */}
      <div className="bg-[#FAF4E6] px-6 py-4 border-b border-[#C59B27]/30 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#6E1A2C] uppercase tracking-wider">
            ই-বুক চেকআউট (PDF)
          </span>
          <h3 className="text-lg font-extrabold text-[#142230]">
            {BOOK_INFO.titleBn}
          </h3>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-0.5 rounded-full bg-[#6E1A2C]/10 text-[#6E1A2C] text-[10px] font-extrabold mb-0.5">
            {BOOK_INFO.discountPercentBn}
          </span>
          <div>
            <span className="text-xs text-stone-400 line-through mr-1.5">
              ৳{BOOK_INFO.regularPriceBn}
            </span>
            <span className="text-2xl font-extrabold text-[#6E1A2C]">
              ৳{BOOK_INFO.offerPriceBn}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50">
        <button
          type="button"
          onClick={() => {
            setMode("hosted");
            setError("");
          }}
          className={`py-3 px-4 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 ${
            mode === "hosted"
              ? "border-[#6E1A2C] text-[#6E1A2C] bg-white"
              : "border-transparent text-stone-500 hover:text-[#142230]"
          }`}
        >
          ZiniPay পেমেন্ট
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("trx");
            setError("");
          }}
          className={`py-3 px-4 text-xs sm:text-sm font-bold transition cursor-pointer border-b-2 ${
            mode === "trx"
              ? "border-[#6E1A2C] text-[#6E1A2C] bg-white"
              : "border-transparent text-stone-500 hover:text-[#142230]"
          }`}
        >
          TrxID ভেরিফাই / ডাউনলোড
        </button>
      </div>

      <div className="p-6">
        {verifiedData ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#142230]">
                পেমেন্ট ভেরিফাই হয়েছে!
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                অর্ডার: <span className="font-mono font-bold">{verifiedData.orderId}</span>
              </p>
            </div>

            <a
              href={verifiedData.downloadUrl}
              download="Sporsher-Byakoron-Onuvuti-Publications.pdf"
              className="w-full py-3.5 px-6 rounded-xl bg-[#6E1A2C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#581322] transition"
            >
              <Download className="w-4 h-4" />
              <span>ই-বুক ডাউনলোড করুন (PDF)</span>
            </a>

            <button
              type="button"
              onClick={() => setVerifiedData(null)}
              className="text-xs text-stone-400 hover:text-stone-700 underline cursor-pointer"
            >
              নতুন অর্ডার করুন
            </button>
          </div>
        ) : mode === "hosted" ? (
          <div className="space-y-4">
            {/* Direct 1-Click ZiniPay Hosted Checkout Link */}
            <a
              href={BOOK_INFO.zinipayProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#80131E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#630d16] transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                ZiniPay সরাসরি গেটওয়েতে যান — ৳{BOOK_INFO.offerPriceBn}
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-stone-400 tracking-wider absolute">
                বা নাম ও নম্বর দিয়ে ইনভয়েস বানান
              </span>
            </div>

            <form onSubmit={handleHostedCheckout} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                আপনার নাম *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={cusName}
                  onChange={(e) => setCusName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[#142230] text-sm focus:outline-none focus:border-[#6E1A2C] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                মোবাইল নম্বর *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={cusPhone}
                  onChange={(e) => setCusPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[#142230] text-sm focus:outline-none focus:border-[#6E1A2C] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ইমেইল (ঐচ্ছিক)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={cusEmail}
                  onChange={(e) => setCusEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[#142230] text-sm focus:outline-none focus:border-[#6E1A2C] focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#6E1A2C] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#6E1A2C]/20 hover:bg-[#581322] transition cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ZiniPay দিয়ে ৳{BOOK_INFO.offerPriceBn} পেমেন্ট করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
        ) : (
          <form onSubmit={handleVerifyTrx} className="space-y-3.5">
            <div className="rounded-xl bg-[#FAF4E6] border border-[#C59B27]/40 p-3.5 text-xs text-stone-700 leading-relaxed">
              আমাদের নম্বরে (<strong className="font-mono">{merchantNumber}</strong>){" "}
              <strong>৳{BOOK_INFO.offerPriceBn}</strong> বিকাশ/নগদ করে আপনার{" "}
              <strong>Transaction ID</strong> নিচে দিন:
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Transaction ID (TrxID) / Order ID *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="যেমন: DEMO123456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[#142230] font-mono text-sm uppercase placeholder:normal-case focus:outline-none focus:border-[#6E1A2C] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={trxPhone}
                  onChange={(e) => setTrxPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[#142230] text-sm focus:outline-none focus:border-[#6E1A2C] focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#6E1A2C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-[#581322] transition cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>যাচাই হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ভেরিফাই ও ডাউনলোড করুন</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            bKash • Nagad • Rocket • Upay
          </span>
          <span>ইনস্ট্যান্ট PDF ডাউনলোড</span>
        </div>
      </div>
    </div>
  );
}
