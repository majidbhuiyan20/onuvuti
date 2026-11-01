import crypto from "crypto";
import fs from "fs";
import path from "path";
import { BOOK_INFO } from "@/data/bookData";
import { GO_API_BASE_URL, getInternalAuthHeaders } from "@/lib/goApi";

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

// Maximum allowed downloads per verified order (abuse & redistribution prevention)
export const MAX_DOWNLOAD_LIMIT = 10;

// ZiniPay static hosted product checkout fallback URL
export const ZINIPAY_HOSTED_PRODUCT_URL =
  process.env.ZINIPAY_PRODUCT_URL ||
  "https://dash.zinipay.com/onuvuti/product/ca434ea6-acda-4e47-9f80-be86c33c10cf";

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
 * @deprecated Legacy JSON file reader. All production orders are stored and queried in PostgreSQL.
 */
export function readOrders(): BookOrder[] {
  return [];
}

/**
 * @deprecated Legacy JSON file writer. All production orders are stored and queried in PostgreSQL.
 */
export function writeOrders(_orders: BookOrder[]): void {
  // No-op: PostgreSQL is the single source of truth for all orders.
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
 * Creates a unique pending book order in PostgreSQL.
 * Supports 1-click hosted checkout (customer details captured on ZiniPay).
 */
export async function createOrderRecord(params?: {
  cusName?: string;
  cusEmail?: string;
  cusPhone?: string;
  amount?: number;
  invoiceId?: string;
  orderId?: string;
}): Promise<BookOrder> {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = params?.orderId || `ONV-${randomSuffix}`;

  const cleanName = (params?.cusName || "সম্মানিত পাঠক").trim();
  const cleanEmail = (params?.cusEmail || "").trim();
  const cleanPhone = (params?.cusPhone || "").trim();

  const newOrder: BookOrder = {
    orderId,
    invoiceId: params?.invoiceId,
    cusName: cleanName,
    cusEmail: cleanEmail,
    cusPhone: cleanPhone,
    amount: params?.amount ?? getBookPriceBdt(),
    currency: "BDT",
    status: "PENDING",
    downloadCount: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${GO_API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getInternalAuthHeaders(),
      },
      body: JSON.stringify(newOrder),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.order) return data.order;
    }
  } catch (err) {
    console.error("Failed to persist order to Go Backend PostgreSQL:", err);
    if (process.env.NODE_ENV === "production") {
      throw new Error("অর্ডার ডাটাবেজে সংরক্ষণ করা সম্ভব হয়নি। ডাটাবেজ সাময়িকভাবে অনুপলব্ধ।");
    }
  }

  return newOrder;
}

/**
 * Updates an order record safely in PostgreSQL.
 */
export async function updateOrderRecord(
  orderId: string,
  updates: Partial<BookOrder>
): Promise<BookOrder | null> {
  const existing = await findOrder({ orderId });
  if (!existing) return null;

  const merged: BookOrder = { ...existing, ...updates };
  try {
    const res = await fetch(`${GO_API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getInternalAuthHeaders(),
      },
      body: JSON.stringify(merged),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.order || merged;
    }
  } catch (err) {
    console.error("updateOrderRecord error:", err);
  }
  return merged;
}

/**
 * Searches for an order strictly by orderId, invoiceId, or transactionId via PostgreSQL.
 * Does NOT permit querying by arbitrary phone/email to avoid customer data leakage.
 */
export async function findOrder(query: {
  orderId?: string;
  invoiceId?: string;
  transactionId?: string;
}): Promise<BookOrder | null> {
  const authHeaders = getInternalAuthHeaders();

  try {
    if (query.orderId) {
      const res = await fetch(
        `${GO_API_BASE_URL}/orders/${encodeURIComponent(query.orderId.trim())}`,
        { headers: authHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.order) return data.order;
      }
    }

    if (query.invoiceId) {
      const res = await fetch(
        `${GO_API_BASE_URL}/orders/${encodeURIComponent(query.invoiceId.trim())}`,
        { headers: authHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.order) return data.order;
      }
    }

    if (query.transactionId) {
      const res = await fetch(
        `${GO_API_BASE_URL}/orders/trx/${encodeURIComponent(query.transactionId.trim())}`,
        { headers: authHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.exists && data?.order) return data.order;
      }
    }
  } catch (err) {
    console.error("findOrder database lookup error:", err);
  }

  return null;
}

/**
 * Checks if a transaction ID is already attached to any other paid order (prevents double-spending).
 */
export async function isTransactionIdAlreadyUsed(
  transactionId: string,
  currentOrderId?: string
): Promise<boolean> {
  const cleanTrx = transactionId.trim().toUpperCase();
  if (!cleanTrx) return false;

  try {
    const res = await fetch(
      `${GO_API_BASE_URL}/orders/trx/${encodeURIComponent(cleanTrx)}`,
      { headers: getInternalAuthHeaders(), cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.exists && data?.order) {
        if (!currentOrderId || data.order.orderId.toLowerCase() !== currentOrderId.toLowerCase()) {
          return true;
        }
      }
    }
  } catch (err) {
    console.error("isTransactionIdAlreadyUsed error:", err);
  }
  return false;
}

/**
 * Transitions an EXISTING pending order to PAID atomically in PostgreSQL.
 * Fails safely if the order does not exist or if transactionId is already used.
 */
export async function markOrderAsPaid(
  orderId: string,
  extra: {
    invoiceId?: string;
    transactionId?: string;
    paymentMethod?: string;
    cusName?: string;
    cusEmail?: string;
    cusPhone?: string;
  } = {}
): Promise<{ ok: boolean; order?: BookOrder; error?: string }> {
  const existing = await findOrder({ orderId });

  if (!existing) {
    return {
      ok: false,
      error: `অর্ডার ${orderId} সিস্টেমে পাওয়া যায়নি। কোনো অর্ডারের অস্তিত্ব ছাড়া পেমেন্ট অনুমোদন সম্ভব নয়।`,
    };
  }

  const cleanTrx = (extra.transactionId || "").trim().toUpperCase();
  if (cleanTrx && (await isTransactionIdAlreadyUsed(cleanTrx, orderId))) {
    return {
      ok: false,
      error: `ট্রানজেকশন আইডি ${cleanTrx} ইতোমধ্যে অন্য অর্ডারে ব্যবহৃত হয়েছে। ডুপ্লিকেট পেমেন্ট নিষিদ্ধ।`,
    };
  }

  // Idempotent check: if already paid, return existing token
  if (existing.status === "PAID" && existing.downloadToken) {
    return { ok: true, order: existing };
  }

  const finalEmail = (extra.cusEmail || existing.cusEmail || "").trim();
  const finalPhone = (extra.cusPhone || existing.cusPhone || "").trim();
  const finalName = (extra.cusName || existing.cusName || "সম্মানিত পাঠক").trim();

  const token = signDownloadToken({
    orderId: existing.orderId,
    cusEmail: finalEmail,
    cusPhone: finalPhone,
  });

  try {
    const res = await fetch(
      `${GO_API_BASE_URL}/orders/${encodeURIComponent(existing.orderId)}/paid`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getInternalAuthHeaders(),
        },
        body: JSON.stringify({
          invoiceId: extra.invoiceId || existing.invoiceId || "",
          transactionId: cleanTrx || existing.transactionId || "",
          paymentMethod:
            extra.paymentMethod || existing.paymentMethod || "ZiniPay Official",
          downloadToken: token,
          cusName: finalName,
          cusEmail: finalEmail,
          cusPhone: finalPhone,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        error: data?.error || "অর্ডার স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।",
      };
    }

    return { ok: true, order: data.order };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || "ডাটাবেজ সংযোগে সমস্যা হয়েছে।",
    };
  }
}

/**
 * Atomically increments download count in PostgreSQL with max limit 10 enforcement.
 */
export async function recordDownload(
  orderId: string
): Promise<{ ok: boolean; downloadCount?: number; error?: string }> {
  try {
    const res = await fetch(
      `${GO_API_BASE_URL}/orders/${encodeURIComponent(orderId)}/download`,
      {
        method: "PATCH",
        headers: getInternalAuthHeaders(),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: data?.error || "ডাউনলোড সীমা অতিক্রম করেছে বা ডাটাবেজ ত্রুটি।",
      };
    }
    return { ok: true, downloadCount: data?.downloadCount };
  } catch (err: any) {
    return { ok: false, error: err?.message || "ডাটাবেজ সংযোগ ত্রুটি।" };
  }
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
    // Development or Static Hosted Product fallback
    return {
      ok: true,
      paymentUrl: ZINIPAY_HOSTED_PRODUCT_URL,
      invoiceId: `ZP_STATIC_${order.orderId}`,
      isSandbox: true,
    };
  }

  const apiKey = getZiniPayApiKey();
  const baseUrl = getZiniPayBaseUrl();
  const endpoint = `${baseUrl}/v1/payment/create`;

  const payload: Record<string, any> = {
    amount: order.amount,
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
    },
  };

  // Only pass customer details if available and non-placeholder,
  // allowing ZiniPay to collect full customer details on its hosted checkout page
  if (order.cusName && order.cusName !== "সম্মানিত পাঠক") {
    payload.cus_name = order.cusName;
  }
  if (order.cusEmail) {
    payload.cus_email = order.cusEmail;
  }
  if (order.cusPhone) {
    payload.cus_phone = order.cusPhone;
    payload.metadata.cus_phone = order.cusPhone;
  }

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
        await updateOrderRecord(order.orderId, { invoiceId });
      }
      return {
        ok: true,
        paymentUrl,
        invoiceId,
        isSandbox: apiKey.startsWith("sandbox_"),
      };
    }

    // If dynamic session creation is not allowed on merchant tier, fallback to static hosted link
    if (ZINIPAY_HOSTED_PRODUCT_URL) {
      return {
        ok: true,
        paymentUrl: ZINIPAY_HOSTED_PRODUCT_URL,
        invoiceId: invoiceId || `ZP_PROD_${order.orderId}`,
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
    // Graceful fallback to static hosted product checkout
    if (ZINIPAY_HOSTED_PRODUCT_URL) {
      return {
        ok: true,
        paymentUrl: ZINIPAY_HOSTED_PRODUCT_URL,
        invoiceId: `ZP_FALLBACK_${order.orderId}`,
      };
    }
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
  cusName?: string;
  cusEmail?: string;
  cusPhone?: string;
  orderIdFromMeta?: string;
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

    const cusName = String(
      data?.cus_name ||
        data?.customer_name ||
        data?.customer?.name ||
        data?.data?.cus_name ||
        ""
    ).trim();

    const cusEmail = String(
      data?.cus_email ||
        data?.customer_email ||
        data?.customer?.email ||
        data?.data?.cus_email ||
        ""
    ).trim();

    const cusPhone = String(
      data?.cus_phone ||
        data?.customer_phone ||
        data?.customer?.phone ||
        data?.data?.cus_phone ||
        ""
    ).trim();

    const orderIdFromMeta = String(
      data?.metadata?.order_id ||
        data?.metadata?.orderId ||
        data?.data?.metadata?.order_id ||
        ""
    ).trim();

    if (response.ok && statusStr === "COMPLETED") {
      return {
        verified: true,
        status: "COMPLETED",
        transactionId,
        paymentMethod,
        amount,
        cusName,
        cusEmail,
        cusPhone,
        orderIdFromMeta,
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
  if (await isTransactionIdAlreadyUsed(cleanTrx)) {
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
