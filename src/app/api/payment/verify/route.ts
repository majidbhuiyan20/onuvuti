import { NextRequest, NextResponse } from "next/server";
import {
  findOrder,
  markOrderAsPaid,
  verifyZiniPayInvoice,
} from "@/lib/zinipay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body?.orderId || "").trim();
    const invoiceId = String(body?.invoiceId || "").trim();
    const phoneOrEmail = String(body?.phoneOrEmail || "").trim();

    // Check existing local order first
    const existing = findOrder({
      orderId: orderId || undefined,
      invoiceId: invoiceId || undefined,
      phoneOrEmail: phoneOrEmail || undefined,
    });

    if (existing && existing.status === "PAID" && existing.downloadToken) {
      return NextResponse.json({
        ok: true,
        order: existing,
        downloadUrl: `/api/download?token=${encodeURIComponent(existing.downloadToken)}`,
      });
    }

    const targetInvoiceId = invoiceId || existing?.invoiceId;
    if (!targetInvoiceId) {
      return NextResponse.json(
        {
          ok: false,
          error: "কোনো বৈধ ইনভয়েস বা পেমেন্ট রেকর্ড পাওয়া যায়নি।",
        },
        { status: 404 }
      );
    }

    const verification = await verifyZiniPayInvoice(targetInvoiceId);
    if (!verification.verified) {
      return NextResponse.json(
        {
          ok: false,
          error:
            verification.message ||
            "পেমেন্ট এখনো ভেরিফাই হয়নি। অনুগ্রহ করে পেমেন্ট সম্পন্ন করে আবার চেষ্টা করুন।",
        },
        { status: 400 }
      );
    }

    const resolvedOrderId =
      existing?.orderId ||
      verification.orderIdFromMeta ||
      orderId ||
      `ONV-${Date.now().toString().slice(-6)}`;

    const paidOrder = markOrderAsPaid(resolvedOrderId, {
      invoiceId: targetInvoiceId,
      transactionId: verification.transactionId,
      paymentMethod: verification.paymentMethod,
    });

    return NextResponse.json({
      ok: true,
      order: paidOrder,
      downloadUrl: `/api/download?token=${encodeURIComponent(paidOrder.downloadToken!)}`,
    });
  } catch (err) {
    console.error("POST /api/payment/verify error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "পেমেন্ট যাচাই করার সময় ত্রুটি হয়েছে।",
      },
      { status: 500 }
    );
  }
}

