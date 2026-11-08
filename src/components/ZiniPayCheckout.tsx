"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Download,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  HelpCircle,
  FileText,
} from "lucide-react";
import { BOOK_INFO } from "@/data/bookData";
import { trackInitiateCheckout } from "@/lib/metaPixel";

export default function ZiniPayCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryId, setRecoveryId] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [verifiedData, setVerifiedData] = useState<{
    downloadUrl: string;
    orderId: string;
    transactionId?: string;
  } | null>(null);

  // 1-Click Buy Now: Creates order on server and redirects directly to ZiniPay Hosted Checkout
  const handleBuyNow = async () => {
    setError("");
    setLoading(true);

    // Track Meta Pixel InitiateCheckout
    trackInitiateCheckout({
      content_name: BOOK_INFO.titleBn,
      content_ids: ["sporsher-byakoron"],
      content_type: "product",
      value: BOOK_INFO.offerPriceBdt || 99,
      currency: "BDT",
    });

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok || !data.paymentUrl) {
        setError(
          data?.error || "ZiniPay গেটওয়ে চালু করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
        );
        setLoading(false);
        return;
      }

      // Seamless redirect to ZiniPay Hosted Checkout
      window.location.href = data.paymentUrl;
    } catch {
      setError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করুন।");
      setLoading(false);
    }
  };

  // Order Recovery for customers who already paid and want to download their eBook
  const handleRecoverOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");

    const cleanId = recoveryId.trim();
    if (!cleanId) {
      setRecoveryError("অনুগ্রহ করে আপনার অর্ডার আইডি বা ZiniPay ইনভয়েস আইডি লিখুন।");
      return;
    }

    try {
      setRecovering(true);
      const isInvoice = cleanId.startsWith("ZP_") || cleanId.length > 20;
      const isOrder = cleanId.startsWith("ONV-");

      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: isOrder ? cleanId : undefined,
          invoiceId: isInvoice ? cleanId : undefined,
          transactionId: !isOrder && !isInvoice ? cleanId : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok && data.downloadUrl) {
        setVerifiedData({
          downloadUrl: data.downloadUrl,
          orderId: data.order?.orderId || cleanId,
          transactionId: data.order?.transactionId,
        });
        setRecovering(false);
        return;
      }

      // If not found yet and looks like a Transaction ID, try direct Trx verification
      if (!isOrder && !isInvoice) {
        const trxRes = await fetch("/api/payment/verify-trx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: cleanId }),
        });
        const trxData = await trxRes.json().catch(() => ({}));
        if (trxRes.ok && trxData.ok && trxData.downloadUrl) {
          setVerifiedData({
            downloadUrl: trxData.downloadUrl,
            orderId: trxData.order?.orderId || cleanId,
            transactionId: trxData.order?.transactionId || cleanId,
          });
          setRecovering(false);
          return;
        }
      }

      setRecoveryError(
        data?.error || "এই আইডির জন্য কোনো পরিশোধিত অর্ডার পাওয়া যায়নি।"
      );
      setRecovering(false);
    } catch {
      setRecoveryError("ভেরিফিকেশন সার্ভারের সাথে সংযোগ করা যায়নি।");
      setRecovering(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 shadow-xl overflow-hidden text-[#142230] dark:text-white">
      {/* Top Price Header */}
      <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-5 border-b border-[#C59B27]/30 dark:border-[#C59B27]/20 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#80131E] dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>ই-বুক চেকআউট (অফিশিয়াল PDF)</span>
          </span>
          <h3 className="text-xl font-extrabold text-[#142230] dark:text-white mt-0.5">
            {BOOK_INFO.titleBn}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
            অনভূতি পাবলিকেশন্স • ১৮টি অধ্যায় ও ৪টি পরিশিষ্ট
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#80131E]/10 dark:bg-rose-950/60 text-[#80131E] dark:text-rose-300 text-xs font-extrabold mb-1">
            {BOOK_INFO.discountPercentBn}
          </span>
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-xs text-stone-400 line-through">
              ৳{BOOK_INFO.regularPriceBn}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#80131E] dark:text-rose-400">
              ৳{BOOK_INFO.offerPriceBn}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {verifiedData ? (
          /* Download Ready State */
          <div className="space-y-4 text-center py-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 p-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto">
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
              className="w-full py-4 px-6 rounded-2xl bg-[#80131E] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#80131E]/25 hover:bg-[#630d16] transition cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>ই-বুক PDF ডাউনলোড করুন</span>
            </a>

            <button
              type="button"
              onClick={() => setVerifiedData(null)}
              className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              আরেকটি কপি কিনুন
            </button>
          </div>
        ) : (
          /* Frictionless Hosted Checkout Experience */
          <div className="space-y-5">
            {/* Key Value Propositions */}
            <div className="space-y-2.5 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-2.5 bg-stone-50 rounded-xl p-3 border border-stone-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>কোনো অতিরিক্ত ফরম নেই:</strong> নাম, ইমেইল ও বিকাশ/নগদ নম্বর সরাসরি ZiniPay-এর সিকিউর চেকআউট পেইজে দিন।
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-stone-50 rounded-xl p-3 border border-stone-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>তাত্ক্ষণিক ডাউনলোড:</strong> পেমেন্ট সফল হওয়ামাত্রই স্বয়ংক্রিয়ভাবে সম্পূর্ণ বইটির হাই-কোয়ালিটি PDF ফাইল পেয়ে যাবেন।
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl p-3 border border-stone-200/60 dark:border-stone-700/60 text-stone-700 dark:text-stone-300">
                <ShieldCheck className="w-4 h-4 text-[#80131E] dark:text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>পেমেন্ট পার্টনার:</strong> ZiniPay গেটওয়ে (bKash, Nagad, Rocket ও Upay সাপোর্টেড)।
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3.5 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Buy Now Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleBuyNow}
              className="w-full py-4 px-6 rounded-2xl bg-[#80131E] text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-[#80131E]/20 hover:bg-[#680e18] active:scale-[0.99] transition cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ZiniPay চেকআউটে নিয়ে যাওয়া হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>এখনই কিনুন — ৳{BOOK_INFO.offerPriceBn}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Trust Footer Badges */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                SSL এনক্রিপ্টেড ১০০% নিরাপদ
              </span>
              <span className="flex items-center gap-1 font-mono">
                bKash • Nagad • Rocket
              </span>
            </div>

            {/* Existing Buyer Order Recovery Accordion */}
            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => setShowRecovery(!showRecovery)}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-[#80131E] dark:hover:text-rose-400 transition inline-flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>ইতোমধ্যে পেমেন্ট করেছেন? এখান থেকে ডাউনলোড করুন</span>
              </button>

              {showRecovery && (
                <form
                  onSubmit={handleRecoverOrder}
                  className="mt-3.5 p-4 rounded-2xl bg-[#FAF4E6]/70 dark:bg-[#1A2234] border border-[#C59B27]/30 dark:border-stone-700 text-left space-y-3"
                >
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    আপনার অর্ডার আইডি বা ZiniPay ইনভয়েস আইডি দিন:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={recoveryId}
                      onChange={(e) => setRecoveryId(e.target.value)}
                      placeholder="যেমন: ONV-105045 বা ZP_..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-[#142230] dark:text-white font-mono focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500"
                    />
                    <button
                      type="submit"
                      disabled={recovering}
                      className="px-4 py-2 rounded-xl bg-[#80131E] text-white text-xs font-bold hover:bg-[#630d16] transition cursor-pointer disabled:opacity-60 flex items-center gap-1"
                    >
                      {recovering ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      <span>খুঁজুন</span>
                    </button>
                  </div>

                  {recoveryError && (
                    <p className="text-xs text-red-600 font-medium">
                      {recoveryError}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
