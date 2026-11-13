import { NextRequest, NextResponse } from "next/server";
import {
  findOrder,
  createOrderRecord,
  markOrderAsPaid,
  verifyZiniPayInvoice,
  verifyAndConfirmZiniPayTrx,
  isTransactionIdAlreadyUsed,
  verifyDownloadToken,
  signDownloadToken,
  getBookPriceBdt,
} from "@/lib/zinipay";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { GO_API_BASE_URL, getInternalAuthHeaders } from "@/lib/goApi";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting per IP to prevent invoice guessing & verification brute-force
    const clientIp = getClientIp(req.headers);
    const rate = checkRateLimit({
      bucket: "payment_verify",
      identifier: clientIp,
      maxRequests: 20,
      windowMs: 5 * 60_000,
      blockDurationMs: 15 * 60_000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `অতিরিক্ত ভেরিফিকেশন রিকোয়েস্ট। অনুগ্রহ করে ${rate.retryAfterSeconds} সেকেন্ড পর চেষ্টা করুন।`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "").trim();
    const invoiceId = String(body?.invoiceId || "").trim();
    const token = String(body?.token || "").trim();
    const transactionId = String(body?.transactionId || "").trim().toUpperCase();
    const rawStatus = String(body?.status || "").trim().toUpperCase();
    const isCompleted =
      rawStatus === "COMPLETED" ||
      rawStatus === "SUCCESS" ||
      rawStatus === "PAID" ||
      rawStatus === "TRUE";

    // 2. If a valid, non-expired download token is already provided, verify it directly
    if (token) {
      const tokenCheck = verifyDownloadToken(token);
      if (tokenCheck.valid && tokenCheck.orderId) {
        const existingPaidOrder = await findOrder({ orderId: tokenCheck.orderId });
        if (existingPaidOrder && existingPaidOrder.status === "PAID") {
          return NextResponse.json({
            ok: true,
            order: existingPaidOrder,
            downloadUrl: `/api/download?token=${encodeURIComponent(token)}`,
          });
        }
      }
    }

    // 3. Look up order by orderId, invoiceId, or transactionId
    if (!orderId && !invoiceId && !transactionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "পেমেন্ট যাচাইয়ের জন্য অর্ডার আইডি, ইনভয়েস আইডি বা ট্রানজেকশন আইডি প্রদান আবশ্যক।",
        },
        { status: 400 }
      );
    }

    let existingOrder = await findOrder({
      orderId: orderId || undefined,
      invoiceId: invoiceId || undefined,
      transactionId: transactionId || undefined,
    });

    // If order was completed on ZiniPay hosted checkout and redirected back:
    if (isCompleted && (transactionId || invoiceId)) {
      const expectedAmount = getBookPriceBdt();
      if (!existingOrder) {
        if (!transactionId || !(await isTransactionIdAlreadyUsed(transactionId))) {
          existingOrder = await createOrderRecord({
            cusName: body?.cusName || "সম্মানিত পাঠক",
            cusPhone: body?.cusPhone || "",
            cusEmail: body?.cusEmail || "reader@onuvuti.site",
            amount: expectedAmount,
            invoiceId: invoiceId || undefined,
            orderId: orderId || undefined,
          });
        }
      }

      if (existingOrder && existingOrder.status !== "PAID") {
        const markResult = await markOrderAsPaid(existingOrder.orderId, {
          invoiceId: invoiceId || existingOrder.invoiceId,
          transactionId: transactionId || existingOrder.transactionId,
          paymentMethod: body?.paymentMethod || "bKash (ZiniPay)",
          cusName: body?.cusName || existingOrder.cusName,
          cusPhone: body?.cusPhone || existingOrder.cusPhone,
          cusEmail: body?.cusEmail || existingOrder.cusEmail,
        });

        if (markResult.ok && markResult.order && markResult.order.downloadToken) {
          return NextResponse.json({
            ok: true,
            order: markResult.order,
            downloadUrl: `/api/download?token=${encodeURIComponent(markResult.order.downloadToken)}`,
          });
        }
      }
    }

    // Support static product link or direct TrxID checkout:
    if (!existingOrder) {
      if (transactionId) {
        const expectedAmount = getBookPriceBdt();
        const trxCheck = await verifyAndConfirmZiniPayTrx({
          transactionId,
          amount: expectedAmount,
        });

        if (!trxCheck.verified) {
          return NextResponse.json(
            {
              ok: false,
              error: trxCheck.message || "এই Transaction ID যাচাই করা সম্ভব হয়নি।",
            },
            { status: 400 }
          );
        }

        existingOrder = await createOrderRecord({
          cusName: "সম্মানিত পাঠক",
          cusPhone: trxCheck.sender || "",
          cusEmail: "reader@onuvuti.site",
          amount: expectedAmount,
        });

        const markResult = await markOrderAsPaid(existingOrder.orderId, {
          transactionId,
          paymentMethod: trxCheck.provider || "ZiniPay TrxID",
        });

        if (markResult.ok && markResult.order && markResult.order.downloadToken) {
          return NextResponse.json({
            ok: true,
            order: markResult.order,
            downloadUrl: `/api/download?token=${encodeURIComponent(markResult.order.downloadToken)}`,
          });
        }
      } else if (!invoiceId) {
        return NextResponse.json(
          {
            ok: false,
            error: "সিস্টেমে এই অর্ডারের কোনো প্রাথমিক তথ্য পাওয়া যায়নি। অর্ডারবিহীন পেমেন্ট গ্রহণযোগ্য নয়।",
          },
          { status: 404 }
        );
      } else {
        const directVerification = await verifyZiniPayInvoice(invoiceId);
        if (!directVerification.verified || directVerification.status !== "COMPLETED") {
          return NextResponse.json(
            {
              ok: false,
              status: directVerification.status || "PENDING",
              error:
                directVerification.message ||
                "সিস্টেমে এই অর্ডারের কোনো প্রাথমিক তথ্য পাওয়া যায়নি অথবা পেমেন্ট এখনো সম্পন্ন হয়নি।",
            },
            { status: 404 }
          );
        }

        const expectedAmount = getBookPriceBdt();
        if (
          typeof directVerification.amount === "number" &&
          directVerification.amount < expectedAmount
        ) {
          return NextResponse.json(
            {
              ok: false,
              error: `টাকার পরিমাণ সঠিক নয়। আবশ্যক: ৳${expectedAmount}, পরিশোধিত: ৳${directVerification.amount}।`,
            },
            { status: 400 }
          );
        }

        const directTrx = (directVerification.transactionId || "").trim().toUpperCase();
        if (directTrx && (await isTransactionIdAlreadyUsed(directTrx))) {
          return NextResponse.json(
            {
              ok: false,
              error: "এই ট্রানজেকশন আইডি ইতোমধ্যে অন্য অর্ডারে ব্যবহৃত হয়েছে। ডুপ্লিকেট পেমেন্ট নিষিদ্ধ।",
            },
            { status: 409 }
          );
        }

        // Synthesize order record for the verified hosted checkout payment
        existingOrder = await createOrderRecord({
          cusName: directVerification.cusName || "সম্মানিত পাঠক",
          cusEmail: directVerification.cusEmail || "",
          cusPhone: directVerification.cusPhone || "",
          amount: directVerification.amount || expectedAmount,
          invoiceId,
        });
      }
    }

    // CRITICAL SECURITY CHECK: Prevent cross-order invoice hijacking
    // If order already has an associated invoiceId and client passed an invoiceId, they MUST match
    if (
      existingOrder.invoiceId &&
      invoiceId &&
      existingOrder.invoiceId.toLowerCase() !== invoiceId.toLowerCase()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "ইনভয়েস আইডি এই অর্ডারের সাথে সামঞ্জস্যপূর্ণ নয়।",
        },
        { status: 403 }
      );
    }

    // 4. If order is already PAID, return idempotent success with active token
    if (existingOrder.status === "PAID" && existingOrder.downloadToken) {
      const activeCheck = verifyDownloadToken(existingOrder.downloadToken);
      let validToken = existingOrder.downloadToken;

      // If existing token expired, refresh it for the legitimate customer
      if (!activeCheck.valid || activeCheck.expired) {
        validToken = signDownloadToken({
          orderId: existingOrder.orderId,
          cusEmail: existingOrder.cusEmail,
          cusPhone: existingOrder.cusPhone,
        });
      }

      return NextResponse.json({
        ok: true,
        order: existingOrder,
        downloadUrl: `/api/download?token=${encodeURIComponent(validToken)}`,
      });
    }

    // 5. Must have an invoice ID to query provider API
    const targetInvoiceId = invoiceId || existingOrder.invoiceId;
    if (!targetInvoiceId) {
      return NextResponse.json(
        {
          ok: false,
          error: "এই অর্ডারের জন্য কোনো ZiniPay ইনভয়েস আইডি পাওয়া যায়নি।",
        },
        { status: 400 }
      );
    }

    // 6. Query ZiniPay server-to-server authoritative verification API
    const verification = await verifyZiniPayInvoice(targetInvoiceId);

    // Reject incomplete / pending / failed payments
    if (!verification.verified || verification.status !== "COMPLETED") {
      return NextResponse.json(
        {
          ok: false,
          status: verification.status || "PENDING",
          error:
            verification.message ||
            "পেমেন্ট এখনো সম্পন্ন হয়নি। গেটওয়েতে পেমেন্ট সম্পন্ন করে আবার চেষ্টা করুন।",
        },
        { status: 402 }
      );
    }

    // 7. Validate exact payment amount against expected book price (৳199)
    const expectedAmount = existingOrder.amount || getBookPriceBdt();
    if (typeof verification.amount === "number" && verification.amount > 0) {
      if (verification.amount < expectedAmount) {
        return NextResponse.json(
          {
            ok: false,
            error: `টাকার পরিমাণ সঠিক নয়। আবশ্যক: ৳${expectedAmount}, পরিশোধিত: ৳${verification.amount}।`,
          },
          { status: 400 }
        );
      }
    }

    // 8. Prevent duplicate transaction reuse (double-spending protection)
    const cleanTrx = (verification.transactionId || "").trim().toUpperCase();
    if (cleanTrx && (await isTransactionIdAlreadyUsed(cleanTrx, existingOrder.orderId))) {
      return NextResponse.json(
        {
          ok: false,
          error: "এই ট্রানজেকশন আইডি ইতোমধ্যে অন্য অর্ডারে ব্যবহৃত হয়েছে। ডুপ্লিকেট পেমেন্ট নিষিদ্ধ।",
        },
        { status: 409 }
      );
    }

    // 9. Transition order to PAID safely and atomically in PostgreSQL
    const markResult = await markOrderAsPaid(existingOrder.orderId, {
      invoiceId: targetInvoiceId,
      transactionId: cleanTrx,
      paymentMethod: verification.paymentMethod || "ZiniPay",
      cusName: verification.cusName,
      cusEmail: verification.cusEmail,
      cusPhone: verification.cusPhone,
    });

    if (!markResult.ok || !markResult.order || !markResult.order.downloadToken) {
      return NextResponse.json(
        {
          ok: false,
          error: markResult.error || "পেমেন্ট আপডেট সম্পন্ন করা যায়নি।",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      order: markResult.order,
      downloadUrl: `/api/download?token=${encodeURIComponent(markResult.order.downloadToken)}`,
    });
  } catch (err) {
    console.error("POST /api/payment/verify error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "পেমেন্ট যাচাইয়ের সময় একটি অপ্রত্যাশিত ত্রুটি হয়েছে।",
      },
      { status: 500 }
    );
  }
}
