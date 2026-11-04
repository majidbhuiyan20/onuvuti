import { NextRequest, NextResponse } from "next/server";
import {
  createOrderRecord,
  createZiniPayInvoice,
  getBookPriceBdt,
} from "@/lib/zinipay";
import { checkRateLimit, getClientIp, sanitizeText } from "@/lib/security";

function resolveSiteOrigin(req: NextRequest): string {
  // 1. If explicitly configured canonical site URL
  const envUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    ""
  ).trim();
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/+$/, "");
  }

  // 2. Check X-Forwarded-Host & X-Forwarded-Proto from Nginx / Cloudflare
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost && !forwardedHost.includes("localhost")) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/+$/, "");
  }

  // 3. Check browser request Origin header
  const reqOrigin = req.headers.get("origin");
  if (reqOrigin && !reqOrigin.includes("localhost")) {
    return reqOrigin.replace(/\/+$/, "");
  }

  // 4. Check Host header
  const host = req.headers.get("host");
  if (host && !host.includes("localhost")) {
    return `https://${host}`.replace(/\/+$/, "");
  }

  // 5. In production mode, always enforce authoritative live domain
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "production";
  if (isProd) {
    return "https://onuvuti.site";
  }

  // 6. Local development fallback
  return reqOrigin || envUrl || "http://localhost:3000";
}

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
    const order = await createOrderRecord({
      cusName: cusName || "সম্মানিত পাঠক",
      cusEmail,
      cusPhone,
      amount: getBookPriceBdt(),
    });

    const origin = resolveSiteOrigin(req);

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

