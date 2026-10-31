import { NextRequest, NextResponse } from "next/server";
import {
  createOrderRecord,
  createZiniPayInvoice,
  getBookPriceBdt,
} from "@/lib/zinipay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cusName = String(body?.cusName || "").trim();
    const cusEmail = String(body?.cusEmail || "").trim();
    const cusPhone = String(body?.cusPhone || "").trim();

    if (!cusName || !cusPhone) {
      return NextResponse.json(
        {
          ok: false,
          error: "অনুগ্রহ করে আপনার নাম এবং মোবাইল নম্বর প্রদান করুন।",
        },
        { status: 400 }
      );
    }

    const order = createOrderRecord({
      cusName,
      cusEmail: cusEmail || `${cusPhone.replace(/\D/g, "")}@onuvuti.site`,
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

