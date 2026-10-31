import { NextRequest, NextResponse } from "next/server";
import {
  createOrderRecord,
  findOrder,
  getBookPriceBdt,
  markOrderAsPaid,
  verifyAndConfirmZiniPayTrx,
} from "@/lib/zinipay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transactionId = String(body?.transactionId || "").trim().toUpperCase();
    const cusName = String(body?.cusName || "পাঠক").trim();
    const cusPhone = String(body?.cusPhone || "").trim();
    const cusEmail = String(body?.cusEmail || "").trim();

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

    const paidOrder = markOrderAsPaid(newOrder.orderId, {
      transactionId,
      paymentMethod: trxCheck.provider || "ZiniPay TrxID",
    });

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

