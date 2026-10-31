import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { findOrder, markOrderAsPaid } from "@/lib/zinipay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = (process.env.ZINIPAY_WEBHOOK_SECRET || "").trim();
    const incomingSig = req.headers.get("x-zinipay-signature") || "";

    if (webhookSecret && incomingSig) {
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");
      if (incomingSig !== expectedSig) {
        return NextResponse.json(
          { ok: false, error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    const statusStr = String(
      payload?.status || payload?.payment_status || "COMPLETED"
    ).toUpperCase();

    if (
      statusStr === "COMPLETED" ||
      statusStr === "PAID" ||
      statusStr === "SUCCESS" ||
      payload?.transactionId
    ) {
      const orderId =
        payload?.metadata?.order_id ||
        payload?.order_id ||
        findOrder({ invoiceId: payload?.invoice_id })?.orderId;

      if (orderId) {
        markOrderAsPaid(orderId, {
          invoiceId: payload?.invoice_id,
          transactionId: payload?.transactionId || payload?.transaction_id,
          paymentMethod: payload?.provider || payload?.payment_method || "ZiniPay Webhook",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ZiniPay webhook error:", err);
    return NextResponse.json(
      { ok: false, error: "Webhook processing error" },
      { status: 500 }
    );
  }
}

