import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  findOrder,
  verifyDownloadToken,
  recordDownload,
  MAX_DOWNLOAD_LIMIT,
} from "@/lib/zinipay";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  // 1. Enforce strict rate limiting per client IP to prevent token brute-forcing / DDoS
  const clientIp = getClientIp(req.headers);
  const rate = checkRateLimit({
    bucket: "pdf_download",
    identifier: clientIp,
    maxRequests: 15,
    windowMs: 5 * 60_000,
    blockDurationMs: 15 * 60_000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `অতিরিক্ত ডাউনলোড রিকোয়েস্ট। অনুগ্রহ করে ${rate.retryAfterSeconds} সেকেন্ড পর চেষ্টা করুন।`,
      },
      { status: 429 }
    );
  }

  // 2. Extract ONLY the cryptographically signed download token.
  // ALL master keys, URL bypasses, and unauthenticated order_ids are strictly removed.
  const token = req.nextUrl.searchParams.get("token") || "";

  if (!token) {
    // Check if the request arrived here from a payment gateway redirect (e.g. ZiniPay redirecting directly to /api/download)
    const invoiceId =
      req.nextUrl.searchParams.get("invoice_id") ||
      req.nextUrl.searchParams.get("invoiceId") ||
      "";
    const orderId =
      req.nextUrl.searchParams.get("order_id") ||
      req.nextUrl.searchParams.get("orderId") ||
      "";
    const trx =
      req.nextUrl.searchParams.get("transaction_id") ||
      req.nextUrl.searchParams.get("trx") ||
      req.nextUrl.searchParams.get("trx_id") ||
      "";

    if (invoiceId || orderId || trx) {
      // Gateway redirected directly to /api/download! Auto-redirect to /payment/success to complete verification and token signing!
      const targetParams = new URLSearchParams();
      if (invoiceId) targetParams.set("invoice_id", invoiceId);
      if (orderId) targetParams.set("order_id", orderId);
      if (trx) targetParams.set("transaction_id", trx);
      return NextResponse.redirect(
        new URL(`/payment/success?${targetParams.toString()}`, req.url)
      );
    }

    // If accessed via a browser directly without token, redirect to eBook recovery page instead of showing raw JSON error
    const accept = req.headers.get("accept") || "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(
        new URL("/sporsher-byakoron#recovery", req.url)
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "ডাউনলোড টোকেন অনুপস্থিত। সঠিক টোকেন ছাড়া বই ডাউনলোড করা সম্ভব নয়।",
      },
      { status: 403 }
    );
  }

  // 3. Cryptographic signature and expiration verification (constant-time timingSafeEqual)
  const tokenCheck = verifyDownloadToken(token);
  if (!tokenCheck.valid || !tokenCheck.orderId) {
    return NextResponse.json(
      {
        ok: false,
        error: tokenCheck.error || "ডাউনলোড টোকেনটি অবৈধ বা মেয়াদোত্তীর্ণ হয়েছে।",
      },
      { status: 403 }
    );
  }

  // 4. Authoritative Database Verification: Order must exist and have status 'PAID'
  const order = await findOrder({ orderId: tokenCheck.orderId });
  if (!order || order.status !== "PAID") {
    return NextResponse.json(
      {
        ok: false,
        error: "এই অর্ডারের জন্য কোনো পরিশোধিত পেমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।",
      },
      { status: 403 }
    );
  }

  // 5. Enforce Maximum Download Limit (prevents unlimited link sharing/leaks)
  const currentDownloads = order.downloadCount || 0;
  if (currentDownloads >= MAX_DOWNLOAD_LIMIT) {
    return NextResponse.json(
      {
        ok: false,
        error: `ডাউনলোড সীমা (সর্বোচ্চ ${MAX_DOWNLOAD_LIMIT} বার) অতিক্রম করেছে। অতিরিক্ত ডাউনলোডের জন্য অনভূতি সাপোর্টে যোগাযোগ করুন।`,
      },
      { status: 403 }
    );
  }

  // 6. Secure file resolution (prevents path traversal)
  const pdfPath = path.resolve(process.cwd(), "storage", "sporsher_byakoron.pdf");

  if (!fs.existsSync(pdfPath)) {
    return NextResponse.json(
      {
        ok: false,
        error: "ই-বুক পিডিএফ ফাইলটি সার্ভারে পাওয়া যায়নি। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
      },
      { status: 404 }
    );
  }

  // 7. Increment download count atomically in PostgreSQL
  const recordRes = await recordDownload(order.orderId);
  if (!recordRes.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          recordRes.error ||
          `ডাউনলোড সীমা (সর্বোচ্চ ${MAX_DOWNLOAD_LIMIT} বার) অতিক্রম করেছে।`,
      },
      { status: 403 }
    );
  }

  // 8. Stream the PDF safely with hardened headers
  const fileBuffer = fs.readFileSync(pdfPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Sporsher-Byakoron-Onuvuti-Publications.pdf"',
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Download-Options": "noopen",
    },
  });
}
