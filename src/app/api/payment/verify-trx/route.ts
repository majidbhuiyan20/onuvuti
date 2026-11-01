import { NextRequest, NextResponse } from "next/server";
import {
  createOrderRecord,
  findOrder,
  getBookPriceBdt,
  markOrderAsPaid,
  verifyAndConfirmZiniPayTrx,
} from "@/lib/zinipay";
import { checkRateLimit, getClientIp, sanitizeText } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers);
    const rate = checkRateLimit({
      bucket: "payment_verify_trx",
      identifier: clientIp,
      maxRequests: 8,
      windowMs: 5 * 60_000,
      blockDurationMs: 10 * 60_000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `অতিরিক্তবার ভুল TrxID দেওয়ার কারণে সাময়িকভাবে ব্লক করা হয়েছে। অনুগ্রহ করে ${rate.retryAfterSeconds} সেকেন্ড পর চেষ্টা করুন।`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const transactionId = sanitizeText(
      String(body?.transactionId || ""),
      40
    ).toUpperCase();
    const cusName = sanitizeText(String(body?.cusName || "পাঠক"), 100);
    const cusPhone = sanitizeText(String(body?.cusPhone || ""), 30);
    const cusEmail = sanitizeText(String(body?.cusEmail || ""), 120);

    if (!transactionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "অনুগ্রহ করে আপনার বিকাশ/নগদ/রকেট Transaction ID (TrxID) প্রদান করুন।",
        },
        { status: 400 }
      );
    }

    // Check if this transactionId or orderId was already verified previously (allows order recovery!)
    const existingOrder = findOrder({
      transactionId,
      orderId: transactionId.startsWith("ONV-") ? transactionId : undefined,
    });

    if (existingOrder && existingOrder.status === "PAID" && existingOrder.downloadToken) {
      return NextResponse.json({
        ok: true,
        recovered: true,
        order: existingOrder,
        downloadUrl: `/api/download?token=${encodeURIComponent(
          existingOrder.downloadToken
        )}`,
      });
    }

    const amount = getBookPriceBdt();
    const trxCheck = await verifyAndConfirmZiniPayTrx({
      transactionId,
      amount,
    });

    if (!trxCheck.verified) {
      return NextResponse.json(
        {
          ok: false,
          error:
            trxCheck.message ||
            "এই Transaction ID পাওয়া যায়নি অথবা টাকার পরিমাণ সঠিক নয়।",
        },
        { status: 400 }
      );
    }

    const newOrder = createOrderRecord({
      cusName: cusName || "সম্মানিত পাঠক",
      cusPhone: cusPhone || trxCheck.sender || "01700000000",
      cusEmail: cusEmail || "reader@onuvuti.site",
      amount,
    });

    const markResult = markOrderAsPaid(newOrder.orderId, {
      transactionId,
      paymentMethod: trxCheck.provider || "ZiniPay TrxID",
    });

    if (!markResult.ok || !markResult.order) {
      return NextResponse.json(
        {
          ok: false,
          error: markResult.error || "অর্ডার সম্পন্ন করা সম্ভব হয়নি।",
        },
        { status: 500 }
      );
    }

    const paidOrder = markResult.order;

    return NextResponse.json({
      ok: true,
      order: paidOrder,
      downloadUrl: `/api/download?token=${encodeURIComponent(
        paidOrder.downloadToken!
      )}`,
    });
  } catch (err) {
    console.error("POST /api/payment/verify-trx error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "ট্রানজেকশন ভেরিফিকেশনের সময় সার্ভারে ত্রুটি হয়েছে।",
      },
      { status: 500 }
    );
  }
}

