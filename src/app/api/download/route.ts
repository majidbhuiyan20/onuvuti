import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  findOrder,
  createOrderRecord,
  markOrderAsPaid,
  verifyDownloadToken,
  recordDownload,
  MAX_DOWNLOAD_LIMIT,
  getBookPriceBdt,
  resolveSiteOrigin,
} from "@/lib/zinipay";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function GET(req: NextRequest) {
  // 1. Enforce rate limiting per client IP to prevent brute-forcing
  const clientIp = getClientIp(req.headers);
  const rate = checkRateLimit({
    bucket: "pdf_download",
    identifier: clientIp,
    maxRequests: 30,
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

  const token = req.nextUrl.searchParams.get("token") || "";
  const siteOrigin = resolveSiteOrigin(req);

  // 2. Direct Payment Gateway Redirect Handler (e.g. ZiniPay redirecting right after Send Money / Payment)
  if (!token) {
    const rawStatus = (req.nextUrl.searchParams.get("status") || "").trim().toUpperCase();
    const invoiceId = (
      req.nextUrl.searchParams.get("invoice_id") ||
      req.nextUrl.searchParams.get("invoiceId") ||
      req.nextUrl.searchParams.get("val_id") ||
      ""
    ).trim();
    const orderId = (
      req.nextUrl.searchParams.get("order_id") ||
      req.nextUrl.searchParams.get("orderId") ||
      ""
    ).trim();
    const trx = (
      req.nextUrl.searchParams.get("transaction_id") ||
      req.nextUrl.searchParams.get("trx") ||
      req.nextUrl.searchParams.get("trx_id") ||
      req.nextUrl.searchParams.get("txId") ||
      ""
    ).trim().toUpperCase();

    const isCompleted =
      rawStatus === "COMPLETED" ||
      rawStatus === "SUCCESS" ||
      rawStatus === "PAID" ||
      rawStatus === "TRUE";

    // If customer completed payment on ZiniPay and arrived here with COMPLETED status + transaction ID:
    if (isCompleted && (trx || invoiceId)) {
      const amount = Number(
        req.nextUrl.searchParams.get("amount") ||
        req.nextUrl.searchParams.get("charged_amount") ||
        "199"
      );
      const cusName = (
        req.nextUrl.searchParams.get("cus_name") ||
        req.nextUrl.searchParams.get("name") ||
        "সম্মানিত পাঠক"
      ).trim();
      const cusEmail = (
        req.nextUrl.searchParams.get("cus_email") ||
        req.nextUrl.searchParams.get("email") ||
        ""
      ).trim();
      const cusPhone = (
        req.nextUrl.searchParams.get("senderNumber") ||
        req.nextUrl.searchParams.get("cus_phone") ||
        req.nextUrl.searchParams.get("phone") ||
        ""
      ).trim();
      const paymentMethod = (
        req.nextUrl.searchParams.get("payment_method") ||
        req.nextUrl.searchParams.get("provider") ||
        "bKash (ZiniPay)"
      ).trim();

      // Check if order exists in PostgreSQL
      let order = await findOrder({
        orderId: orderId || undefined,
        transactionId: trx || undefined,
        invoiceId: invoiceId || undefined,
      });

      if (!order) {
        order = await createOrderRecord({
          cusName,
          cusEmail,
          cusPhone,
          amount: amount >= 99 ? amount : getBookPriceBdt(),
          invoiceId,
          orderId: orderId || undefined,
        });
      }

      // Transition order to PAID in PostgreSQL
      if (order.status !== "PAID") {
        const markRes = await markOrderAsPaid(order.orderId, {
          invoiceId,
          transactionId: trx,
          paymentMethod,
          cusName,
          cusEmail,
          cusPhone,
        });
        if (markRes.ok && markRes.order) {
          order = markRes.order;
        }
      }

      // Ensure PDF file exists
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

      // Increment download count atomically
      await recordDownload(order.orderId);

      // Stream the PDF directly to the buyer's browser
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

    // If gateway parameters are present but not completed (or status unknown), redirect to success page using canonical origin
    if (invoiceId || orderId || trx) {
      const targetParams = new URLSearchParams();
      if (invoiceId) targetParams.set("invoice_id", invoiceId);
      if (orderId) targetParams.set("order_id", orderId);
      if (trx) targetParams.set("transaction_id", trx);
      if (rawStatus) targetParams.set("status", rawStatus);
      return NextResponse.redirect(
        new URL(`/payment/success?${targetParams.toString()}`, siteOrigin)
      );
    }

    // If accessed via a browser directly without token, redirect to recovery page
    const accept = req.headers.get("accept") || "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(
        new URL("/sporsher-byakoron#recovery", siteOrigin)
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

  // 3. Cryptographic signature and expiration verification for token
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

  // 4. Database Verification: Order must exist and have status 'PAID'
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

  // 5. Enforce Maximum Download Limit
  const currentDownloads = order.downloadCount || 0;
  if (currentDownloads >= MAX_DOWNLOAD_LIMIT) {
    return NextResponse.json(
      {
        ok: false,
        error: `ডাউনলোড সীমা (সর্বোচ্চ ${MAX_DOWNLOAD_LIMIT} বার) অতিক্রম করেছে। অতিরিক্ত ডাউনলোডের জন্য অনুভূতি সাপোর্টে যোগাযোগ করুন।`,
      },
      { status: 403 }
    );
  }

  // 6. Secure file resolution
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
