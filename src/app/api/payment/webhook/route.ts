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

async function processWebhook(req: NextRequest) {
  try {
    let payload: Record<string, any> = {};
    const method = req.method.toUpperCase();

    if (method === "GET") {
      const params = req.nextUrl.searchParams;
      payload = {
        invoice_id: params.get("invoice_id") || params.get("invoiceId") || params.get("val_id"),
        status: params.get("status"),
        transaction_id: params.get("transaction_id") || params.get("trx") || params.get("trx_id"),
        amount: params.get("amount") || params.get("charged_amount"),
        cus_name: params.get("cus_name") || params.get("name"),
        cus_email: params.get("cus_email") || params.get("email"),
        cus_phone: params.get("senderNumber") || params.get("cus_phone") || params.get("phone"),
        payment_method: params.get("payment_method") || params.get("provider"),
      };
    } else {
      const rawBody = await req.text();
      const webhookSecret = (process.env.ZINIPAY_WEBHOOK_SECRET || "").trim();

      // If webhook secret is configured, verify HMAC signature
      if (webhookSecret && webhookSecret.length >= 16) {
        const incomingSig =
          req.headers.get("x-zinipay-signature") ||
          req.headers.get("x-webhook-signature") ||
          "";

        if (incomingSig) {
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
      }

      try {
        payload = JSON.parse(rawBody || "{}");
      } catch {
        const params = req.nextUrl.searchParams;
        payload = {
          invoice_id: params.get("invoice_id") || params.get("invoiceId"),
          status: params.get("status"),
          transaction_id: params.get("transaction_id") || params.get("trx"),
          amount: params.get("amount"),
        };
      }
    }

    const invoiceId = String(
      payload?.invoice_id ||
        payload?.invoiceId ||
        payload?.data?.invoice_id ||
        payload?.val_id ||
        ""
    ).trim();

    const rawStatus = String(
      payload?.status ||
        payload?.data?.status ||
        ""
    ).trim().toUpperCase();

    const transactionId = String(
      payload?.transaction_id ||
        payload?.trx ||
        payload?.trx_id ||
        payload?.data?.transaction_id ||
        ""
    ).trim().toUpperCase();

    const isCompleted =
      rawStatus === "COMPLETED" ||
      rawStatus === "SUCCESS" ||
      rawStatus === "PAID" ||
      rawStatus === "TRUE";

    if (!invoiceId && !transactionId) {
      return NextResponse.json(
        { ok: false, error: "Missing invoice_id or transaction_id in webhook" },
        { status: 400 }
      );
    }

    // Look up order associated with this invoice ID or transaction ID
    let existingOrder = await findOrder({
      invoiceId: invoiceId || undefined,
      transactionId: transactionId || undefined,
    });

    // Idempotency check: If order is already fulfilled/PAID, return 200 OK immediately
    if (existingOrder && existingOrder.status === "PAID") {
      return NextResponse.json({
        ok: true,
        message: "Order already fulfilled (idempotent)",
        orderId: existingOrder.orderId,
      });
    }

    const expectedAmount = existingOrder?.amount || getBookPriceBdt();
    const payloadAmount = Number(payload?.amount || payload?.charged_amount || expectedAmount);

    if (payloadAmount < expectedAmount) {
      return NextResponse.json(
        {
          ok: false,
          error: `Payment amount mismatch: expected ৳${expectedAmount}, got ৳${payloadAmount}`,
        },
        { status: 400 }
      );
    }

    // Check double-spending
    if (transactionId && (await isTransactionIdAlreadyUsed(transactionId, existingOrder?.orderId))) {
      return NextResponse.json(
        { ok: false, error: "Transaction ID already used on another order" },
        { status: 409 }
      );
    }

    // If order was created on ZiniPay hosted product checkout, synthesize order record
    if (!existingOrder) {
      existingOrder = await createOrderRecord({
        cusName: payload?.cus_name || payload?.name || "সম্মানিত পাঠক",
        cusEmail: payload?.cus_email || payload?.email || "",
        cusPhone: payload?.cus_phone || payload?.phone || payload?.senderNumber || "",
        amount: payloadAmount,
        invoiceId,
      });
    }

    if (isCompleted && existingOrder.status !== "PAID") {
      const markResult = await markOrderAsPaid(existingOrder.orderId, {
        invoiceId,
        transactionId,
        paymentMethod: payload?.payment_method || payload?.provider || "ZiniPay Webhook",
        cusName: payload?.cus_name || payload?.name,
        cusEmail: payload?.cus_email || payload?.email,
        cusPhone: payload?.cus_phone || payload?.phone || payload?.senderNumber,
      });

      if (!markResult.ok || !markResult.order) {
        return NextResponse.json(
          { ok: false, error: markResult.error || "Failed to update order status" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Order successfully processed via webhook",
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

export async function GET(req: NextRequest) {
  return processWebhook(req);
}

export async function POST(req: NextRequest) {
  return processWebhook(req);
}
