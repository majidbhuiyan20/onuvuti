import crypto from "crypto";
import fs from "fs";
import path from "path";
import { BOOK_INFO } from "@/data/bookData";
import { GO_API_BASE_URL } from "@/lib/goApi";

export interface BookOrder {
  orderId: string;
  invoiceId?: string;
  transactionId?: string;
  cusName: string;
  cusEmail: string;
  cusPhone: string;
  amount: number;
  currency?: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  paymentMethod?: string;
  downloadToken?: string;
  downloadCount?: number;
  createdAt: string;
  verifiedAt?: string;
}

const ORDERS_FILE = path.join(process.cwd(), "storage", "orders.json");

// Download token lifetime: 24 hours (86,400,000 ms)
export const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns the secret key for HMAC token generation.
 * Fails closed in production if secret is missing or insecure.
 */
export function getSecretKey(): string {
  const secret = (process.env.ORDER_SECRET_KEY || "").trim();
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "production";

  if (isProd) {
    if (!secret || secret.length < 32) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: ORDER_SECRET_KEY must be set with at least 32 characters in production."
      );
    }
    return secret;
  }

  // Development / Test fallback only (strictly disallowed in production)
  return secret || "onuvuti-dev-testing-hmac-secret-key-32chars!";
}

export function getZiniPayApiKey(): string {
  return (process.env.ZINIPAY_API_KEY || "").trim();
}

export function isZiniPayLiveConfigured(): boolean {
  const key = getZiniPayApiKey();
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "production";

  if (!key || key === "YOUR_ZINIPAY_API_KEY") {
    return false;
  }

  if (isProd && key === "demo") {
    return false;
  }

  return true;
}

export function getZiniPayBaseUrl(): string {
  return (
    process.env.ZINIPAY_BASE_URL || "https://api.zinipay.com"
  ).replace(/\/+$/, "");
}

export function getBookPriceBdt(): number {
  const envPrice = Number(process.env.BOOK_PRICE_BDT);
  return Number.isFinite(envPrice) && envPrice > 0
    ? envPrice
    : BOOK_INFO.offerPriceBdt;
}

/**
 * Internal order file reader (JSON fallback & cache)
 */
export function readOrders(): BookOrder[] {
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

/**
 * Internal order file writer (JSON fallback & cache)
 */
export function writeOrders(orders: BookOrder[]): void {
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

/**
 * Syncs an order with Go Backend PostgreSQL database
 */
async function syncOrderToPostgres(order: BookOrder): Promise<void> {
  try {
    await fetch(`${GO_API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
  } catch {
    // Non-blocking: local JSON backup remains authoritative if backend is starting up
  }
}

/**
 * Cryptographically signs a download token using HMAC-SHA256 with timestamp & expiration.
 */
export function signDownloadToken(payload: {
  orderId: string;
  cusEmail: string;
  cusPhone: string;
  expiresInMs?: number;
}): string {
  const now = Date.now();
  const exp = now + (payload.expiresInMs ?? TOKEN_EXPIRY_MS);

  const data = JSON.stringify({
    orderId: payload.orderId,
    cusEmail: payload.cusEmail,
    cusPhone: payload.cusPhone,
    book: "sporsher_byakoron",
    status: "PAID",
    iat: now,
    exp,
  });

  const encoded = Buffer.from(data, "utf-8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecretKey())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${sig}`;
}

/**
 * Verifies a download token with constant-time comparison and expiration validation.
 */
export function verifyDownloadToken(token: string): {
  valid: boolean;
  expired?: boolean;
  orderId?: string;
  cusEmail?: string;
  cusPhone?: string;
  error?: string;
} {
  try {
    if (!token || typeof token !== "string") {
      return { valid: false, error: "টোকেন পাওয়া যায়নি।" };
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      return { valid: false, error: "টোকেনের ফরম্যাট সঠিক নয়।" };
    }

    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSecretKey())
      .update(encoded)
      .digest("base64url");

    const sigBuf = Buffer.from(sig, "utf-8");
    const expSigBuf = Buffer.from(expectedSig, "utf-8");

    // Constant-time comparison to prevent timing attacks
    if (
      sigBuf.length !== expSigBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expSigBuf)
    ) {
      return { valid: false, error: "টোকেনের সিগনেচার অবৈধ।" };
    }

    const decodedStr = Buffer.from(encoded, "base64url").toString("utf-8");
    const decoded = JSON.parse(decodedStr);

    if (decoded.status !== "PAID" || decoded.book !== "sporsher_byakoron") {
      return { valid: false, error: "অননুমোদিত ই-বুক রিকোয়েস্ট।" };
    }

    // Check expiration timestamp
    if (typeof decoded.exp === "number" && Date.now() > decoded.exp) {
      return {
        valid: false,
        expired: true,
        orderId: decoded.orderId,
        error: "ডাউনলোড টোকেনের মেয়াদ শেষ হয়ে গেছে।",
      };
    }

    return {
      valid: true,
      orderId: decoded.orderId,
      cusEmail: decoded.cusEmail,
      cusPhone: decoded.cusPhone,
    };
  } catch {
    return { valid: false, error: "টোকেন যাচাই ব্যর্থ হয়েছে।" };
  }
}

/**
 * Creates a unique pending book order in the database.
 */
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
    currency: "BDT",
    status: "PENDING",
    downloadCount: 0,
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  writeOrders(orders.slice(0, 1000));
  syncOrderToPostgres(newOrder);

  return newOrder;
}

/**
 * Updates an order record safely.
 */
export function updateOrderRecord(
  orderId: string,
  updates: Partial<BookOrder>
): BookOrder | null {
  const orders = readOrders();
  const idx = orders.findIndex(
    (o) => o.orderId.toLowerCase() === orderId.trim().toLowerCase()
  );
  if (idx === -1) return null;

  orders[idx] = { ...orders[idx], ...updates };
  writeOrders(orders);
  syncOrderToPostgres(orders[idx]);

  return orders[idx];
}

/**
 * Searches for an order strictly by orderId, invoiceId, or transactionId.
 * Does NOT permit querying by arbitrary phone/email to avoid customer data leakage.
 */
export function findOrder(query: {
  orderId?: string;
  invoiceId?: string;
  transactionId?: string;
}): BookOrder | null {
  const orders = readOrders();

  if (query.orderId) {
    const target = query.orderId.trim().toLowerCase();
    const found = orders.find((o) => o.orderId.toLowerCase() === target);
    if (found) return found;
  }

  if (query.invoiceId) {
    const target = query.invoiceId.trim().toLowerCase();
    const found = orders.find(
      (o) => o.invoiceId && o.invoiceId.toLowerCase() === target
    );
    if (found) return found;
  }

  if (query.transactionId) {
    const target = query.transactionId.trim().toUpperCase();
    const found = orders.find(
      (o) => o.transactionId && o.transactionId.toUpperCase() === target
    );
    if (found) return found;
  }

  return null;
}

/**
 * Checks if a transaction ID is already attached to any other paid order (prevents double-spending).
 */
export function isTransactionIdAlreadyUsed(
  transactionId: string,
  currentOrderId?: string
): boolean {
  const cleanTrx = transactionId.trim().toUpperCase();
  if (!cleanTrx) return false;

  const orders = readOrders();
  return orders.some(
    (o) =>
      o.transactionId &&
      o.transactionId.toUpperCase() === cleanTrx &&
      (!currentOrderId ||
        o.orderId.toLowerCase() !== currentOrderId.toLowerCase())
  );
}

/**
 * Transitions an EXISTING pending order to PAID.
 * Fails safely if the order does not exist or if transactionId is already used.
 */
export function markOrderAsPaid(
  orderId: string,
  extra: {
    invoiceId?: string;
    transactionId?: string;
    paymentMethod?: string;
  } = {}
): { ok: boolean; order?: BookOrder; error?: string } {
  const existing = findOrder({ orderId });

  if (!existing) {
    return {
      ok: false,
      error: `অর্ডার ${orderId} সিস্টেমে পাওয়া যায়নি। কোনো অর্ডারের অস্তিত্ব ছাড়া পেমেন্ট অনুমোদন সম্ভব নয়।`,
    };
  }

  const cleanTrx = (extra.transactionId || "").trim().toUpperCase();
  if (cleanTrx && isTransactionIdAlreadyUsed(cleanTrx, orderId)) {
    return {
      ok: false,
      error: `ট্রানজেকশন আইডি ${cleanTrx} ইতোমধ্যে অন্য অর্ডারে ব্যবহৃত হয়েছে। ডুপ্লিকেট পেমেন্ট নিষিদ্ধ।`,
    };
  }

  // Idempotent check: if already paid, return existing token
  if (existing.status === "PAID" && existing.downloadToken) {
    return { ok: true, order: existing };
  }

  const token = signDownloadToken({
    orderId: existing.orderId,
    cusEmail: existing.cusEmail,
    cusPhone: existing.cusPhone,
  });

  const updated = updateOrderRecord(existing.orderId, {
    status: "PAID",
    invoiceId: extra.invoiceId || existing.invoiceId,
    transactionId: cleanTrx || existing.transactionId,
    paymentMethod:
      extra.paymentMethod || existing.paymentMethod || "ZiniPay Official",
    downloadToken: token,
    verifiedAt: new Date().toISOString(),
  });

  if (!updated) {
    return { ok: false, error: "অর্ডার আপডেট করা সম্ভব হয়নি।" };
  }

  return { ok: true, order: updated };
}

/**
 * Initiates an official ZiniPay hosted checkout session via POST /v1/payment/create
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
    return {
      ok: false,
      error:
        "ZiniPay API Key কনফিগার করা হয়নি। অনুগ্রহ করে পরিবেশ ভ্যারিয়েবলে ZINIPAY_API_KEY সেট করুন।",
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
    redirect_url: `${originUrl}/payment/success?order_id=${encodeURIComponent(
      order.orderId
    )}`,
    cancel_url: `${originUrl}/payment/cancel?order_id=${encodeURIComponent(
      order.orderId
    )}`,
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
      data?.data?.payment_url;

    const invoiceId =
      data?.invoice_id ||
      data?.invoiceId ||
      data?.data?.invoice_id;

    if (response.ok && paymentUrl) {
      if (invoiceId) {
        updateOrderRecord(order.orderId, { invoiceId });
      }
      return {
        ok: true,
        paymentUrl,
        invoiceId,
        isSandbox: apiKey.startsWith("sandbox_"),
      };
    }

    return {
      ok: false,
      error:
        data?.message ||
        data?.error ||
        "ZiniPay পেমেন্ট ইনভয়েস তৈরি করা যায়নি। অনুগ্রহ করে আপনার API Key চেক করুন।",
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
 * Authoritatively verifies a ZiniPay invoice via POST /v1/payment/verify
 */
export async function verifyZiniPayInvoice(invoiceId: string): Promise<{
  verified: boolean;
  status?: string;
  transactionId?: string;
  paymentMethod?: string;
  amount?: number;
  message?: string;
}> {
  if (!invoiceId || typeof invoiceId !== "string") {
    return {
      verified: false,
      message: "ইনভয়েস আইডি পাওয়া যায়নি।",
    };
  }

  if (!isZiniPayLiveConfigured()) {
    return {
      verified: false,
      message: "ZiniPay API Key সার্ভারে কনফিগার করা নেই।",
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
      body: JSON.stringify({ invoice_id: invoiceId.trim() }),
    });

    const data = await response.json().catch(() => ({}));

    const statusStr = String(
      data?.status || data?.payment_status || data?.data?.status || ""
    ).toUpperCase();

    const amount = Number(
      data?.amount ?? data?.data?.amount ?? 0
    );

    const transactionId = String(
      data?.transaction_id ||
        data?.transactionId ||
        data?.trx_id ||
        data?.data?.transaction_id ||
        ""
    ).trim();

    const paymentMethod = String(
      data?.payment_method ||
        data?.provider ||
        data?.data?.payment_method ||
        "ZiniPay Gateway"
    );

    if (response.ok && statusStr === "COMPLETED") {
      return {
        verified: true,
        status: "COMPLETED",
        transactionId,
        paymentMethod,
        amount,
      };
    }

    return {
      verified: false,
      status: statusStr || "PENDING",
      message:
        data?.message ||
        data?.error ||
        `পেমেন্ট এখনো সম্পন্ন হয়নি (স্ট্যাটাস: ${statusStr || "অপেক্ষমাণ"})।`,
    };
  } catch (err) {
    console.error("ZiniPay verify invoice error:", err);
    return {
      verified: false,
      message: "ZiniPay ভেরিফিকেশন সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি।",
    };
  }
}

/**
 * Verifies & Confirms a Manual Transaction ID using ZiniPay's Trx API.
 * In production, demo bypass is strictly prohibited.
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
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.APP_ENV === "production";

  // Prevent double-spending: check if this TrxID is already used
  if (isTransactionIdAlreadyUsed(cleanTrx)) {
    return {
      verified: false,
      message: "এই Transaction ID ইতোমধ্যে সিস্টেমে ব্যবহৃত হয়েছে। একই ট্রানজেকশন একাধিকবার ব্যবহার করা যাবে না।",
    };
  }

  // Development/Test only: DEMO mock (STRICTLY FORBIDDEN IN PRODUCTION)
  if (
    !isProd &&
    (!isZiniPayLiveConfigured() || getZiniPayApiKey() === "demo") &&
    (cleanTrx === "DEMO123456" || cleanTrx === "ZINITEST" || cleanTrx.startsWith("DEMO"))
  ) {
    return {
      verified: true,
      provider: "bKash (ZiniPay Dev Demo)",
      sender: "017******99",
    };
  }

  if (!isZiniPayLiveConfigured()) {
    return {
      verified: false,
      message: isProd
        ? "পেমেন্ট গেটওয়ে কনফিগার করা হয়নি। অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।"
        : "ডেমো মোডে টেস্ট করার জন্য TrxID হিসেবে DEMO123456 ব্যবহার করুন (অথবা .env.local ফাইলে ZINIPAY_API_KEY সেট করুন)।",
    };
  }

  const apiKey = getZiniPayApiKey();
  const baseUrl = getZiniPayBaseUrl();

  try {
    // Step 1: Verify transaction with provider
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

    if (
      !verifyRes.ok ||
      (!internalId && verifyData?.status !== "success" && verifyData?.ok !== true)
    ) {
      return {
        verified: false,
        message:
          verifyData?.message ||
          verifyData?.error ||
          "ট্রানজেকশন আইডি বা টাকার পরিমাণ সঠিক নয় অথবা ইতোমধ্যে ব্যবহৃত হয়েছে।",
      };
    }

    // Step 2: Confirm transaction permanently with provider
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
