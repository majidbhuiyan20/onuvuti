import crypto from "crypto";
import fs from "fs";
import path from "path";
import { BOOK_INFO } from "@/data/bookData";

export interface BookOrder {
  orderId: string;
  invoiceId?: string;
  transactionId?: string;
  cusName: string;
  cusEmail: string;
  cusPhone: string;
  amount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  paymentMethod?: string;
  downloadToken?: string;
  createdAt: string;
  verifiedAt?: string;
}

const ORDERS_FILE = path.join(process.cwd(), "storage", "orders.json");

function getSecretKey(): string {
  return process.env.ORDER_SECRET_KEY || "onuvuti-sporsher-byakoron-secret-2026-hmac";
}

export function getZiniPayApiKey(): string {
  return (process.env.ZINIPAY_API_KEY || "").trim();
}

export function isZiniPayLiveConfigured(): boolean {
  const key = getZiniPayApiKey();
  return Boolean(key && key !== "YOUR_ZINIPAY_API_KEY" && key !== "demo");
}

export function getZiniPayBaseUrl(): string {
  return (process.env.ZINIPAY_BASE_URL || "https://api.zinipay.com").replace(/\/+$/, "");
}

export function getBookPriceBdt(): number {
  const envPrice = Number(process.env.BOOK_PRICE_BDT);
  return Number.isFinite(envPrice) && envPrice > 0 ? envPrice : BOOK_INFO.offerPriceBdt;
}

function readOrders(): BookOrder[] {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: BookOrder[]): void {
  try {
    const dir = path.dirname(ORDERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write orders.json:", err);
  }
}

export function signDownloadToken(payload: {
  orderId: string;
  cusEmail: string;
  cusPhone: string;
}): string {
  const data = JSON.stringify({
    ...payload,
    book: "sporsher_byakoron",
    status: "PAID",
    iat: Date.now(),
  });
  const encoded = Buffer.from(data, "utf-8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecretKey())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyDownloadToken(token: string): {
  valid: boolean;
  orderId?: string;
  cusEmail?: string;
  cusPhone?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSecretKey())
      .update(encoded)
      .digest("base64url");
    if (sig !== expectedSig) return { valid: false };
    const decoded = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    if (decoded.status !== "PAID" || decoded.book !== "sporsher_byakoron") {
      return { valid: false };
    }
    return {
      valid: true,
      orderId: decoded.orderId,
      cusEmail: decoded.cusEmail,
      cusPhone: decoded.cusPhone,
    };
  } catch {
    return { valid: false };
  }
}

export function createOrderRecord(params: {
  cusName: string;
  cusEmail: string;
  cusPhone: string;
  amount?: number;
}): BookOrder {
  const orders = readOrders();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = `ONV-${randomSuffix}`;
  const newOrder: BookOrder = {
    orderId,
    cusName: params.cusName.trim(),
    cusEmail: params.cusEmail.trim(),
    cusPhone: params.cusPhone.trim(),
    amount: params.amount ?? getBookPriceBdt(),
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  writeOrders(orders.slice(0, 1000));
  return newOrder;
}

export function updateOrderRecord(
  orderId: string,
  updates: Partial<BookOrder>
): BookOrder | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...updates };
  writeOrders(orders);
  return orders[idx];
}

export function findOrder(query: {
  orderId?: string;
  invoiceId?: string;
  transactionId?: string;
  phoneOrEmail?: string;
}): BookOrder | null {
  const orders = readOrders();
  if (query.orderId) {
    const found = orders.find(
      (o) => o.orderId.toLowerCase() === query.orderId!.trim().toLowerCase()
    );
    if (found) return found;
  }
  if (query.invoiceId) {
    const found = orders.find(
      (o) => o.invoiceId && o.invoiceId.toLowerCase() === query.invoiceId!.trim().toLowerCase()
    );
    if (found) return found;
  }
  if (query.transactionId) {
    const found = orders.find(
      (o) =>
        o.transactionId &&
        o.transactionId.toLowerCase() === query.transactionId!.trim().toLowerCase()
    );
    if (found) return found;
  }
  if (query.phoneOrEmail) {
    const target = query.phoneOrEmail.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.status === "PAID" &&
        (o.cusPhone.toLowerCase() === target || o.cusEmail.toLowerCase() === target)
    );
    if (found) return found;
  }
  return null;
}

export function markOrderAsPaid(
  orderId: string,
  extra: {
    invoiceId?: string;
    transactionId?: string;
    paymentMethod?: string;
  } = {}
): BookOrder {
  const existing = findOrder({ orderId });
  const cusEmail = existing?.cusEmail || "reader@onuvuti.site";
  const cusPhone = existing?.cusPhone || "01700000000";
  const token = signDownloadToken({
    orderId,
    cusEmail,
    cusPhone,
  });

  if (existing) {
    const updated = updateOrderRecord(orderId, {
      status: "PAID",
      invoiceId: extra.invoiceId || existing.invoiceId,
      transactionId: extra.transactionId || existing.transactionId,
      paymentMethod: extra.paymentMethod || existing.paymentMethod || "ZiniPay",
      downloadToken: token,
      verifiedAt: new Date().toISOString(),
    });
    return updated!;
  }

  const fallbackOrder: BookOrder = {
    orderId,
    cusName: "পাঠক",
    cusEmail,
    cusPhone,
    amount: getBookPriceBdt(),
    status: "PAID",
    invoiceId: extra.invoiceId,
    transactionId: extra.transactionId,
    paymentMethod: extra.paymentMethod || "ZiniPay",
    downloadToken: token,
    createdAt: new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
  };
  const orders = readOrders();
  orders.unshift(fallbackOrder);
  writeOrders(orders);
  return fallbackOrder;
}

/**
 * Initiates a ZiniPay Hosted Checkout session via POST /v1/payment/create
 */
export async function createZiniPayInvoice(
  order: BookOrder,
  originUrl: string
): Promise<{
  ok: boolean;
  paymentUrl?: string;
  invoiceId?: string;
  isSandbox?: boolean;
  error?: string;
}> {
  if (!isZiniPayLiveConfigured()) {
    const sandboxInvoiceId = `ZP_DEMO_${order.orderId.replace("ONV-", "")}`;
    updateOrderRecord(order.orderId, { invoiceId: sandboxInvoiceId });
    return {
      ok: true,
      isSandbox: true,
      invoiceId: sandboxInvoiceId,
      paymentUrl: `${originUrl}/payment/sandbox?order_id=${encodeURIComponent(
        order.orderId
      )}&invoice_id=${encodeURIComponent(sandboxInvoiceId)}`,
    };
  }

  const apiKey = getZiniPayApiKey();
  const baseUrl = getZiniPayBaseUrl();
  const endpoint = `${baseUrl}/v1/payment/create`;

  const payload = {
    amount: order.amount,
    cus_name: order.cusName,
    cus_email: order.cusEmail,
    cus_phone: order.cusPhone,
    redirect_url: `${originUrl}/payment/success?order_id=${encodeURIComponent(order.orderId)}`,
    cancel_url: `${originUrl}/payment/cancel?order_id=${encodeURIComponent(order.orderId)}`,
    webhook_url: `${originUrl}/api/payment/webhook`,
    metadata: {
      order_id: order.orderId,
      book_title: BOOK_INFO.titleBn,
      cus_phone: order.cusPhone,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": apiKey,
        "zinipay-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    const paymentUrl =
      data?.payment_url ||
      data?.checkout_url ||
      data?.url ||
      data?.data?.payment_url ||
      data?.data?.checkout_url ||
      data?.data?.url;

    const invoiceId =
      data?.invoice_id ||
      data?.invoiceId ||
      data?.data?.invoice_id ||
      data?.data?.invoiceId;

    if (response.ok && paymentUrl) {
      if (invoiceId) {
        updateOrderRecord(order.orderId, { invoiceId });
      }
      return {
        ok: true,
        paymentUrl,
        invoiceId,
      };
    }

    return {
      ok: false,
      error:
        data?.message ||
        data?.error ||
        "ZiniPay পেমেন্ট সেশন তৈরি করা যায়নি। অনুগ্রহ করে আপনার API Key অথবা সরাসরি TrxID ভেরিফিকেশন চেক করুন।",
    };
  } catch (err) {
    console.error("ZiniPay create payment error:", err);
    return {
      ok: false,
      error: "ZiniPay সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।",
    };
  }
}

/**
 * Verifies a ZiniPay Invoice via POST /v1/payment/verify
 */
export async function verifyZiniPayInvoice(invoiceId: string): Promise<{
  verified: boolean;
  transactionId?: string;
  paymentMethod?: string;
  amount?: number;
  orderIdFromMeta?: string;
  message?: string;
}> {
  if (invoiceId.startsWith("ZP_DEMO_") && !isZiniPayLiveConfigured()) {
    return {
      verified: true,
      transactionId: `TRX${invoiceId.replace("ZP_DEMO_", "")}`,
      paymentMethod: "bKash (ZiniPay Demo)",
      amount: getBookPriceBdt(),
    };
  }

  const apiKey = getZiniPayApiKey();
  const baseUrl = getZiniPayBaseUrl();
  const endpoint = `${baseUrl}/v1/payment/verify`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zini-api-key": apiKey,
        "zinipay-api-key": apiKey,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    const data = await response.json().catch(() => ({}));
    const statusStr = String(
      data?.status || data?.payment_status || data?.data?.status || ""
    ).toUpperCase();

    const isPaid =
      statusStr === "COMPLETED" ||
      statusStr === "PAID" ||
      statusStr === "SUCCESS" ||
      data?.verified === true;

    if (response.ok && isPaid) {
      return {
        verified: true,
        transactionId:
          data?.transaction_id ||
          data?.transactionId ||
          data?.trx_id ||
          data?.data?.transaction_id,
        paymentMethod:
          data?.payment_method ||
          data?.provider ||
          data?.data?.payment_method ||
          "ZiniPay",
        amount: Number(data?.amount || data?.data?.amount || getBookPriceBdt()),
        orderIdFromMeta:
          data?.metadata?.order_id || data?.data?.metadata?.order_id,
      };
    }

    return {
      verified: false,
      message: data?.message || "পেমেন্ট এখনো সম্পন্ন বা ভেরিফাই হয়নি।",
    };
  } catch (err) {
    console.error("ZiniPay verify invoice error:", err);
    return {
      verified: false,
      message: "ZiniPay ভেরিফিকেশন সার্ভারে সংযোগ করা যায়নি।",
    };
  }
}

/**
 * Verifies & Confirms a Transaction ID using ZiniPay Two-Step API:
 * Step 1: POST /v1/trx/verify
 * Step 2: POST /v1/trx/confirm
 */
export async function verifyAndConfirmZiniPayTrx(params: {
  transactionId: string;
  amount: number;
}): Promise<{
  verified: boolean;
  provider?: string;
  sender?: string;
  message?: string;
}> {
  const cleanTrx = params.transactionId.trim().toUpperCase();

  // Support Demo TrxID when live key is not yet set
  if (
    !isZiniPayLiveConfigured() &&
    (cleanTrx === "DEMO123456" || cleanTrx === "ZINITEST" || cleanTrx.startsWith("DEMO"))
  ) {
    return {
      verified: true,
      provider: "bKash (ZiniPay Demo)",
      sender: "017******99",
    };
  }

  if (!isZiniPayLiveConfigured()) {
    return {
      verified: false,
      message:
        "ডেমো মোডে টেস্ট করার জন্য ট্রানজেকশন আইডি হিসেবে DEMO123456 ব্যবহার করুন (অথবা .env.local ফাইলে আপনার আসল ZINIPAY_API_KEY যুক্ত করুন)।",
    };
  }

  const apiKey = getZiniPayApiKey();
  const baseUrl = getZiniPayBaseUrl();

  try {
    // Step 1: Verify transaction
    const verifyRes = await fetch(`${baseUrl}/v1/trx/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "zinipay-api-key": apiKey,
        "zini-api-key": apiKey,
      },
      body: JSON.stringify({
        amount: params.amount,
        transactionId: cleanTrx,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    const internalId =
      verifyData?.id || verifyData?.data?.id || verifyData?.trx_id;

    if (!verifyRes.ok || (!internalId && verifyData?.status !== "success" && verifyData?.ok !== true)) {
      return {
        verified: false,
        message:
          verifyData?.message ||
          verifyData?.error ||
          "ট্রানজেকশন আইডি বা টাকার পরিমাণ সঠিক নয় অথবা ইতোমধ্যে ব্যবহৃত হয়েছে।",
      };
    }

    // Step 2: Confirm transaction permanently
    if (internalId) {
      const confirmRes = await fetch(`${baseUrl}/v1/trx/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "zinipay-api-key": apiKey,
          "zini-api-key": apiKey,
        },
        body: JSON.stringify({
          id: internalId,
          transactionId: cleanTrx,
          amount: params.amount,
        }),
      });

      const confirmData = await confirmRes.json().catch(() => ({}));
      if (!confirmRes.ok && confirmData?.status === "error") {
        return {
          verified: false,
          message:
            confirmData?.message || "ট্রানজেকশন কনফার্ম করা সম্ভব হয়নি।",
        };
      }
    }

    return {
      verified: true,
      provider:
        verifyData?.provider ||
        verifyData?.data?.provider ||
        "ZiniPay Automated Trx",
      sender: verifyData?.sender || verifyData?.data?.sender,
    };
  } catch (err) {
    console.error("ZiniPay Two-Step Trx Verify Error:", err);
    return {
      verified: false,
      message: "ZiniPay সার্ভারে ট্রানজেকশন যাচাই করার সময় ত্রুটি হয়েছে।",
    };
  }
}

