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
} from "lucide-react";
import { BOOK_INFO } from "@/data/bookData";

interface VerifiedOrder {
  orderId: string;
  transactionId?: string;
  paymentMethod?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const invoiceId =
    searchParams.get("invoice_id") || searchParams.get("invoiceId") || "";
  const tokenParam = searchParams.get("token") || "";
  const statusParam = (searchParams.get("status") || "").toLowerCase();
  const directParam = searchParams.get("direct") || "";

  // If redirected directly from ZiniPay product checkout or with success status
  const isDirectSuccess =
    directParam === "1" ||
    statusParam === "completed" ||
    statusParam === "true" ||
    statusParam === "paid" ||
    (!orderId && !invoiceId && !tokenParam);

  const [loading, setLoading] = useState(
    Boolean(!tokenParam && !isDirectSuccess && (orderId || invoiceId))
  );
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(
    tokenParam
      ? `/api/download?token=${encodeURIComponent(tokenParam)}`
      : `/api/download?direct=1`
  );
  const [order, setOrder] = useState<VerifiedOrder | null>(null);

  useEffect(() => {
    if (tokenParam || isDirectSuccess) {
      setLoading(false);
      return;
    }

    if (!orderId && !invoiceId) {
      setLoading(false);
      return;
    }

    async function verifyOrder() {
      try {
        setLoading(true);
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, invoiceId }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          setOrder(data.order || null);
        } else {
          // Fallback to direct download so no paying customer is ever blocked
          setDownloadUrl("/api/download?direct=1");
        }
      } catch {
        setDownloadUrl("/api/download?direct=1");
      } finally {
        setLoading(false);
      }
    }

    verifyOrder();
  }, [orderId, invoiceId, tokenParam, isDirectSuccess]);

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#142230] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-white border border-stone-200 shadow-xl p-6 sm:p-8 text-center">
        {loading ? (
          <div className="py-10 space-y-3">
            <Loader2 className="w-10 h-10 text-[#80131E] animate-spin mx-auto" />
            <h2 className="text-lg font-bold">পেমেন্ট যাচাই করা হচ্ছে...</h2>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">পেমেন্ট যাচাই অসম্পূর্ণ</h2>
            <p className="text-xs sm:text-sm text-stone-600">{error}</p>
            <Link
              href="/sporsher-byakoron#checkout"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ফিরে যান</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-[#142230]">
                পেমেন্ট সফল হয়েছে!
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                “{BOOK_INFO.titleBn}” সম্পূর্ণ ই-বুকটি নিচে ক্লিক করে ডাউনলোড করুন।
              </p>
            </div>

            {order && (
              <div className="rounded-xl bg-[#FDF8F2] border border-stone-200 p-3.5 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">অর্ডার আইডি:</span>
                  <span className="font-mono font-bold text-[#80131E]">
                    {order.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">পরিশোধিত মূল্য:</span>
                  <span className="font-bold">৳{BOOK_INFO.offerPriceBn}</span>
                </div>
              </div>
            )}

            <a
              href={downloadUrl}
              download="Sporsher-Byakoron-Onuvuti-Publications.pdf"
              className="w-full py-4 px-5 rounded-2xl bg-[#80131E] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:bg-[#630d16] transition"
            >
              <Download className="w-5 h-5" />
              <span>ই-বুক ডাউনলোড করুন (PDF)</span>
            </a>

            <div className="pt-3 border-t border-stone-100 flex justify-center gap-4 text-xs text-stone-500">
              <Link
                href="/sporsher-byakoron"
                className="inline-flex items-center gap-1 text-[#80131E] font-bold hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>ল্যান্ডিং পেজ</span>
              </Link>
              <Link href="/" className="hover:underline">
                অনুভূতি ব্লগ
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
