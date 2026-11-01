import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  findOrder,
  createOrderRecord,
  markOrderAsPaid,
  verifyZiniPayInvoice,
  isTransactionIdAlreadyUsed,
  getBookPriceBdt,
} from "@/lib/zinipay";
import { GO_API_BASE_URL, getInternalAuthHeaders } from "@/lib/goApi";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = (process.env.ZINIPAY_WEBHOOK_SECRET || "").trim();
    const incomingSig =
      req.headers.get("x-zinipay-signature") ||
      req.headers.get("x-webhook-signature") ||
      "";

    // 1. If webhook secret is configured in environment, strictly enforce HMAC authentication
    if (webhookSecret) {
      if (!incomingSig) {
        return NextResponse.json(
          { ok: false, error: "Missing webhook signature" },
          { status: 401 }
        );
      }

      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      const inBuf = Buffer.from(incomingSig, "utf-8");
      const expBuf = Buffer.from(expectedSig, "utf-8");

      if (
        inBuf.length !== expBuf.length ||
        !crypto.timingSafeEqual(inBuf, expBuf)
      ) {
        return NextResponse.json(
          { ok: false, error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    // 2. Parse payload safely (supports JSON body or URL-encoded query parameters)
    let payload: Record<string, any> = {};
    try {
      payload = JSON.parse(rawBody || "{}");
    } catch {
      // Fallback to URL search params if ZiniPay sent query-parameter format
      const params = req.nextUrl.searchParams;
      payload = {
        invoice_id: params.get("invoice_id") || params.get("invoiceId"),
        status: params.get("status"),
      };
    }

    const invoiceId = String(
      payload?.invoice_id ||
        payload?.invoiceId ||
        payload?.data?.invoice_id ||
        ""
    ).trim();

    if (!invoiceId) {
      return NextResponse.json(
        { ok: false, error: "Missing invoice_id in webhook" },
        { status: 400 }
      );
    }

    // 3. Look up order associated with this invoice ID
    let existingOrder = findOrder({ invoiceId });

    // 4. Idempotency check: If order is already fulfilled/PAID, return 200 OK immediately
    if (existingOrder && existingOrder.status === "PAID") {
      return NextResponse.json({
        ok: true,
        message: "Order already fulfilled (idempotent)",
      });
    }

    // 5. CRITICAL OFFICIAL REQUIREMENT:
    // Never trust the webhook body alone! Never default missing status to COMPLETED!
    // Always call ZiniPay's official server-to-server verify API to confirm payment!
    const verification = await verifyZiniPayInvoice(invoiceId);

    if (!verification.verified || verification.status !== "COMPLETED") {
      return NextResponse.json(
        {
          ok: false,
          error: `Payment is not completed at provider (status: ${verification.status || "UNKNOWN"})`,
        },
        { status: 400 }
      );
    }

    // If order was created directly on ZiniPay hosted product checkout, synthesize order record
    if (!existingOrder) {
      existingOrder = createOrderRecord({
        cusName: verification.cusName || "সম্মানিত পাঠক",
        cusEmail: verification.cusEmail || "",
        cusPhone: verification.cusPhone || "",
        amount: verification.amount || getBookPriceBdt(),
        invoiceId,
      });
    }

    // 6. Validate exact amount against expected price (৳99)
    const expectedAmount = existingOrder.amount || getBookPriceBdt();
    if (typeof verification.amount === "number" && verification.amount > 0) {
      if (verification.amount < expectedAmount) {
        return NextResponse.json(
          {
            ok: false,
            error: `Payment amount mismatch: expected ৳${expectedAmount}, got ৳${verification.amount}`,
          },
          { status: 400 }
        );
      }
    }

    // 7. Validate transaction ID uniqueness (double-spending protection)
    const cleanTrx = (verification.transactionId || "").trim().toUpperCase();
    if (cleanTrx && isTransactionIdAlreadyUsed(cleanTrx, existingOrder.orderId)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Transaction ID already used on another order",
        },
        { status: 409 }
      );
    }

    // 8. Safely and idempotently mark the order as PAID
    const markResult = markOrderAsPaid(existingOrder.orderId, {
      invoiceId,
      transactionId: cleanTrx,
      paymentMethod: verification.paymentMethod || "ZiniPay Webhook Verified",
      cusName: verification.cusName,
      cusEmail: verification.cusEmail,
      cusPhone: verification.cusPhone,
    });

    if (!markResult.ok || !markResult.order) {
      return NextResponse.json(
        { ok: false, error: markResult.error || "Failed to update order status" },
        { status: 500 }
      );
    }

    // Authoritative Go backend PostgreSQL sync
    try {
      fetch(`${GO_API_BASE_URL}/orders/${encodeURIComponent(existingOrder.orderId)}/paid`, {
        method: "PATCH",
        headers: getInternalAuthHeaders(),
        body: JSON.stringify({
          invoiceId,
          transactionId: cleanTrx,
          paymentMethod: verification.paymentMethod || "ZiniPay Webhook Verified",
          downloadToken: markResult.order.downloadToken,
        }),
      }).catch(() => {});
    } catch {
      // Non-blocking telemetry
    }

    return NextResponse.json({
      ok: true,
      message: "Order successfully verified and fulfilled via webhook",
      orderId: existingOrder.orderId,
    });
  } catch (err) {
    console.error("ZiniPay webhook processing error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}
