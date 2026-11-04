"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  BookOpen,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { BOOK_INFO } from "@/data/bookData";
import ThemeToggle from "@/components/ThemeToggle";

interface VerifiedOrder {
  orderId: string;
  transactionId?: string;
  paymentMethod?: string;
  amount?: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId =
    searchParams.get("order_id") || searchParams.get("orderId") || "";
  const invoiceId =
    searchParams.get("invoice_id") || searchParams.get("invoiceId") || searchParams.get("val_id") || "";
  const tokenParam = searchParams.get("token") || "";
  const transactionId =
    searchParams.get("transaction_id") ||
    searchParams.get("trx") ||
    searchParams.get("trx_id") ||
    searchParams.get("txId") ||
    "";
  const status =
    searchParams.get("status") || "";
  const cusName =
    searchParams.get("cus_name") || searchParams.get("name") || "";
  const cusPhone =
    searchParams.get("senderNumber") || searchParams.get("cus_phone") || searchParams.get("phone") || "";
  const cusEmail =
    searchParams.get("cus_email") || searchParams.get("email") || "";
  const paymentMethod =
    searchParams.get("payment_method") || searchParams.get("provider") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [order, setOrder] = useState<VerifiedOrder | null>(null);

  useEffect(() => {
    // If no order reference, invoice, transaction ID, or token was provided at all, deny access immediately.
    // Never show success without payment verification!
    if (!orderId && !invoiceId && !tokenParam && !transactionId) {
      setLoading(false);
      setError("কোনো পেমেন্ট তথ্য পাওয়া যায়নি। অনুগ্রহ করে বই কেনার প্রক্রিয়াটি সম্পন্ন করুন।");
      return;
    }

    async function verifyPayment() {
      try {
        setLoading(true);
        setError("");
        setIsPending(false);

        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            invoiceId,
            token: tokenParam,
            transactionId,
            status,
            cusName,
            cusPhone,
            cusEmail,
            paymentMethod,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setOrder(data.order || null);
        } else {
          // If status is still PENDING at provider
          if (data?.status === "PENDING") {
            setIsPending(true);
          }
          setError(
            data?.error ||
              "পেমেন্ট যাচাই অসম্পূর্ণ। আপনার ব্যাংক বা বিকাশ থেকে টাকা কেটে থাকলে কিছুক্ষণ পর আবার চেষ্টা করুন।"
          );
        }
      } catch {
        setError("পেমেন্ট যাচাই সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [orderId, invoiceId, tokenParam, transactionId, status]);

  return (
    <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-xl p-6 sm:p-8 text-center">
        {loading ? (
          <div className="py-10 space-y-3">
            <Loader2 className="w-10 h-10 text-[#80131E] dark:text-rose-400 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-[#142230] dark:text-white">
              পেমেন্ট যাচাই করা হচ্ছে...
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              অনুগ্রহ করে অপেক্ষা করুন, ZiniPay গেটওয়ে থেকে পেমেন্ট নিশ্চিত করা হচ্ছে।
            </p>
          </div>
        ) : error || !downloadUrl ? (
          <div className="space-y-4 py-4">
            {isPending ? (
              <Clock className="w-12 h-12 text-amber-500 mx-auto" />
            ) : (
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            )}

            <h2 className="text-xl font-bold text-[#142230] dark:text-white">
              {isPending ? "পেমেন্ট প্রসেসিংয়ে আছে" : "পেমেন্ট যাচাই অসম্পূর্ণ"}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {error}
            </p>

            {isPending && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-sm transition"
              >
                আবার যাচাই করুন
              </button>
            )}

            <div className="pt-2">
              <Link
                href="/sporsher-byakoron#checkout"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs hover:bg-[#630d16] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>বইয়ের পেজে ফিরে যান</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase">
                পেমেন্ট সফল ও ভেরিফাইড
              </span>
              <h1 className="text-2xl font-extrabold text-[#142230] dark:text-white mt-2">
                অভিনন্দন! আপনার বই প্রস্তুত
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
                “{BOOK_INFO.titleBn}” সম্পূর্ণ প্রিমিয়াম ই-বুকটি (PDF) নিচে ক্লিক করে সংগ্রহ করুন।
              </p>
            </div>

            {order && (
              <div className="rounded-xl bg-[#FDF8F2] dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-3.5 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">অর্ডার নম্বর:</span>
                  <span className="font-mono font-bold text-[#80131E] dark:text-rose-400">
                    {order.orderId}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-stone-500 dark:text-stone-400">ট্রানজেকশন আইডি:</span>
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                      {order.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">পরিশোধিত মূল্য:</span>
                  <span className="font-bold text-stone-900 dark:text-white">
                    ৳{order.amount || BOOK_INFO.offerPriceBn}
                  </span>
                </div>
              </div>
            )}

            {/* ONLY DISPLAYED WHEN SERVER RETURNS A VALID DOWNLOAD TOKEN URL */}
            <a
              href={downloadUrl}
              download="Sporsher-Byakoron-Onuvuti-Publications.pdf"
              className="w-full py-4 px-5 rounded-2xl bg-[#80131E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#80131E]/20 hover:bg-[#630d16] transition cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>ই-বুক ডাউনলোড করুন (PDF)</span>
            </a>

            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              * আপনার ডাউনলোড টোকেনটি আগামী ২৪ ঘণ্টা পর্যন্ত সক্রিয় থাকবে।
            </p>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-center gap-4 text-xs text-stone-500 dark:text-stone-400">
              <Link
                href="/sporsher-byakoron"
                className="inline-flex items-center gap-1 text-[#80131E] dark:text-rose-400 font-bold hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>বইয়ের সূচিপত্র</span>
              </Link>
              <Link href="/" className="hover:underline">
                অনুভূতি হোমপেজ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDF8F2] text-[#142230] flex items-center justify-center">
          লোড হচ্ছে...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
