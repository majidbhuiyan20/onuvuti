import { NextRequest, NextResponse } from "next/server";
import {
  createOrderRecord,
  createZiniPayInvoice,
  getBookPriceBdt,
} from "@/lib/zinipay";
import { checkRateLimit, getClientIp, sanitizeText } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers);
    const rate = checkRateLimit({
      bucket: "payment_create",
      identifier: clientIp,
      maxRequests: 10,
      windowMs: 5 * 60_000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `অতিরিক্ত পেমেন্ট রিকোয়েস্ট। অনুগ্রহ করে ${rate.retryAfterSeconds} সেকেন্ড পর আবার চেষ্টা করুন।`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const cusName = sanitizeText(String(body?.cusName || ""), 100);
    const cusEmail = sanitizeText(String(body?.cusEmail || ""), 120);
    const cusPhone = sanitizeText(String(body?.cusPhone || ""), 30);

    // Creates the pending order (1-click checkout: customer enters full details on ZiniPay hosted page)
    const order = createOrderRecord({
      cusName: cusName || "সম্মানিত পাঠক",
      cusEmail,
      cusPhone,
      amount: getBookPriceBdt(),
    });

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const result = await createZiniPayInvoice(order, origin);

    if (!result.ok || !result.paymentUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || "পেমেন্ট গেটওয়ে চালু করা যায়নি।",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      invoiceId: result.invoiceId,
      paymentUrl: result.paymentUrl,
      isSandbox: Boolean(result.isSandbox),
    });
  } catch (err) {
    console.error("POST /api/payment/create error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "সার্ভারে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}

