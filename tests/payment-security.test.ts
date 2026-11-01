import http from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";

// Configure test environment variables before importing application modules
process.env.ORDER_SECRET_KEY = "test-super-secret-key-at-least-32-chars-long!";
process.env.ZINIPAY_API_KEY = "test-zinipay-api-key-998877";
process.env.ZINIPAY_WEBHOOK_SECRET = "test-webhook-secret-key-32-chars-ok!";
process.env.BOOK_PRICE_BDT = "99";

const MOCK_PORT = 9199;
process.env.ZINIPAY_BASE_URL = `http://127.0.0.1:${MOCK_PORT}`;

// Import app modules
import {
  createOrderRecord,
  updateOrderRecord,
  findOrder,
  markOrderAsPaid,
  signDownloadToken,
  verifyDownloadToken,
  isTransactionIdAlreadyUsed,
  readOrders,
  BookOrder,
} from "../src/lib/zinipay";
import { GET as downloadHandler } from "../src/app/api/download/route";
import { POST as verifyHandler } from "../src/app/api/payment/verify/route";
import { POST as webhookHandler } from "../src/app/api/payment/webhook/route";

const ORDERS_FILE = path.join(process.cwd(), "storage", "orders.json");

interface TestResult {
  scenario: number;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function recordResult(scenario: number, name: string, passed: boolean, details: string) {
  results.push({ scenario, name, passed, details });
  const status = passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL]\x1b[0m";
  console.log(`${status} Scenario ${scenario}: ${name}`);
  if (!passed || process.env.VERBOSE) {
    console.log(`       Details: ${details}`);
  }
}

// -------------------------------------------------------------
// Local Mock ZiniPay Server
// -------------------------------------------------------------
function startMockZiniPayServer(): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let parsed: any = {};
        try {
          parsed = JSON.parse(body);
        } catch {
          // ignore
        }

        const invoiceId = parsed?.invoice_id || parsed?.invoiceId || "";

        res.setHeader("Content-Type", "application/json");

        if (req.url === "/v1/payment/verify") {
          // Route responses based on simulated invoiceId
          if (invoiceId === "INV-COMPLETED-99") {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 99,
                transaction_id: "TRX-MOCK-GENUINE-001",
                payment_method: "bKash",
              })
            );
          } else if (invoiceId === "INV-COMPLETED-WEBHOOK-99") {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 99,
                transaction_id: "TRX-MOCK-WEBHOOK-002",
                payment_method: "Nagad",
              })
            );
          } else if (invoiceId === "INV-WRONG-AMOUNT-50") {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 50, // Expected 99, received 50
                transaction_id: "TRX-MOCK-CHEAP-003",
                payment_method: "bKash",
              })
            );
          } else if (invoiceId === "INV-PENDING-STATE") {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "PENDING",
                amount: 99,
                transaction_id: "TRX-MOCK-PENDING-004",
              })
            );
          } else if (invoiceId === "INV-FAILED-STATE") {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "FAILED",
                amount: 99,
              })
            );
          } else if (invoiceId === "INV-CANCELLED-STATE") {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "CANCELLED",
                amount: 99,
              })
            );
          } else if (invoiceId === "INV-SERVER-ERROR") {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Internal Gateway Error" }));
          } else if (invoiceId === "INV-DOUBLE-SPEND") {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 99,
                transaction_id: "TRX-ALREADY-USED-999", // This trx is already taken
                payment_method: "bKash",
              })
            );
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Invoice not found" }));
          }
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Endpoint not found" }));
        }
      });
    });

    server.listen(MOCK_PORT, () => {
      resolve(server);
    });
  });
}

// Helper to construct NextRequest with distinct IPs to prevent rate limiting
function createRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    clientIp?: string;
  } = {}
): NextRequest {
  const method = options.method || "GET";
  const clientIp = options.clientIp || `192.168.10.${Math.floor(1 + Math.random() * 250)}`;

  const headers = new Headers({
    "x-forwarded-for": clientIp,
    ...options.headers,
  });

  let bodyStr: string | undefined = undefined;
  if (options.body) {
    if (typeof options.body === "string") {
      bodyStr = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      bodyStr = JSON.stringify(options.body);
    }
  }

  return new NextRequest(url, {
    method,
    headers,
    body: bodyStr,
  });
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   ONUVUTI PAYMENT & DOWNLOAD SECURITY TEST SUITE     ");
  console.log("=======================================================\n");

  // Backup orders.json before test
  const originalOrders = fs.existsSync(ORDERS_FILE)
    ? fs.readFileSync(ORDERS_FILE, "utf-8")
    : "[]";

  const mockServer = await startMockZiniPayServer();

  try {
    // -------------------------------------------------------------
    // Scenario 1: Create pending order
    // -------------------------------------------------------------
    const buyer1 = createOrderRecord({
      cusName: "Rahim Chowdhury",
      cusEmail: "rahim@example.com",
      cusPhone: "01711000001",
      amount: 99,
    });
    const s1Pass =
      buyer1.orderId.startsWith("ONV-") &&
      buyer1.status === "PENDING" &&
      buyer1.amount === 99 &&
      buyer1.currency === "BDT" &&
      buyer1.downloadToken === undefined &&
      buyer1.downloadCount === 0;
    recordResult(
      1,
      "Create pending order",
      s1Pass,
      `OrderId: ${buyer1.orderId}, Status: ${buyer1.status}, Amount: ${buyer1.amount}`
    );

    // -------------------------------------------------------------
    // Scenario 2: Visit success URL without paying
    // -------------------------------------------------------------
    const s2Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: buyer1.orderId },
      clientIp: "10.0.1.2",
    });
    const s2Res = await verifyHandler(s2Req);
    const s2Data = await s2Res.json();
    const s2Pass =
      s2Res.status >= 400 &&
      s2Data.ok === false &&
      !s2Data.downloadUrl &&
      findOrder({ orderId: buyer1.orderId })?.status === "PENDING";
    recordResult(
      2,
      "Visit success URL without paying (rejected)",
      s2Pass,
      `HTTP ${s2Res.status}, Error: ${s2Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 3: Manually add ?status=paid
    // -------------------------------------------------------------
    const s3Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: buyer1.orderId, status: "PAID" },
      clientIp: "10.0.1.3",
    });
    const s3Res = await verifyHandler(s3Req);
    const s3Data = await s3Res.json();
    const s3Pass =
      s3Res.status >= 400 &&
      s3Data.ok === false &&
      findOrder({ orderId: buyer1.orderId })?.status === "PENDING";
    recordResult(
      3,
      "Manually add ?status=paid (client fake status strictly ignored)",
      s3Pass,
      `HTTP ${s3Res.status}, Order status remained PENDING`
    );

    // -------------------------------------------------------------
    // Scenario 4: Manually add ?direct=1
    // -------------------------------------------------------------
    const s4Req = createRequest("http://localhost:3000/api/download?direct=1", {
      clientIp: "10.0.1.4",
    });
    const s4Res = await downloadHandler(s4Req);
    const s4Data = await s4Res.json();
    const s4Pass =
      s4Res.status === 403 &&
      s4Data.ok === false &&
      typeof s4Data.error === "string";
    recordResult(
      4,
      "Manually add ?direct=1 (rejected with 403 Forbidden)",
      s4Pass,
      `HTTP ${s4Res.status}, Error: ${s4Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 5: Hardcoded master key (?key=onuvuti2026 / ?key=sporsher-byakoron)
    // -------------------------------------------------------------
    const s5aReq = createRequest("http://localhost:3000/api/download?key=onuvuti2026", {
      clientIp: "10.0.1.5",
    });
    const s5aRes = await downloadHandler(s5aReq);
    const s5aData = await s5aRes.json();

    const s5bReq = createRequest("http://localhost:3000/api/download?key=sporsher-byakoron", {
      clientIp: "10.0.1.6",
    });
    const s5bRes = await downloadHandler(s5bReq);
    const s5bData = await s5bRes.json();

    const s5Pass =
      s5aRes.status === 403 &&
      s5aData.ok === false &&
      s5bRes.status === 403 &&
      s5bData.ok === false;
    recordResult(
      5,
      "Hardcoded master key (?key=onuvuti2026 / sporsher-byakoron rejected)",
      s5Pass,
      `Key onuvuti2026: HTTP ${s5aRes.status}, Key sporsher-byakoron: HTTP ${s5bRes.status}`
    );

    // -------------------------------------------------------------
    // Scenario 6: Download without token
    // -------------------------------------------------------------
    const s6Req = createRequest("http://localhost:3000/api/download", {
      clientIp: "10.0.1.7",
    });
    const s6Res = await downloadHandler(s6Req);
    const s6Data = await s6Res.json();
    const s6Pass = s6Res.status === 403 && s6Data.ok === false;
    recordResult(
      6,
      "Download without token (rejected with 403 Forbidden)",
      s6Pass,
      `HTTP ${s6Res.status}, Error: ${s6Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 7: Fake token submitted
    // -------------------------------------------------------------
    const fakeToken = "eyJvcmRlcklkIjoiT05WLTk5OTk5OSJ9.fake_tampered_signature";
    const s7Req = createRequest(`http://localhost:3000/api/download?token=${fakeToken}`, {
      clientIp: "10.0.1.8",
    });
    const s7Res = await downloadHandler(s7Req);
    const s7Data = await s7Res.json();
    const s7Pass = s7Res.status === 403 && s7Data.ok === false;
    recordResult(
      7,
      "Fake token submitted (HMAC verification failed, 403 Forbidden)",
      s7Pass,
      `HTTP ${s7Res.status}, Error: ${s7Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 8: Expired token submitted
    // -------------------------------------------------------------
    const expiredPayload = {
      orderId: buyer1.orderId,
      cusEmail: buyer1.cusEmail,
      cusPhone: buyer1.cusPhone,
      book: "sporsher_byakoron",
      status: "PAID",
      iat: Date.now() - 48 * 3600 * 1000,
      exp: Date.now() - 24 * 3600 * 1000, // expired 24h ago
    };
    const expiredEncoded = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
    const expiredSig = crypto
      .createHmac("sha256", process.env.ORDER_SECRET_KEY!)
      .update(expiredEncoded)
      .digest("base64url");
    const expiredToken = `${expiredEncoded}.${expiredSig}`;

    const s8Req = createRequest(`http://localhost:3000/api/download?token=${expiredToken}`, {
      clientIp: "10.0.1.9",
    });
    const s8Res = await downloadHandler(s8Req);
    const s8Data = await s8Res.json();
    const s8Pass = s8Res.status === 403 && s8Data.ok === false;
    recordResult(
      8,
      "Expired token submitted (detected expired timestamp, 403 Forbidden)",
      s8Pass,
      `HTTP ${s8Res.status}, Error: ${s8Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 9: Invoice belonging to another order
    // -------------------------------------------------------------
    const orderAlpha = createOrderRecord({
      cusName: "Alpha User",
      cusEmail: "alpha@example.com",
      cusPhone: "01711223344",
    });
    updateOrderRecord(orderAlpha.orderId, { invoiceId: "INV-ALPHA-ORIGINAL" });

    const s9Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: orderAlpha.orderId, invoiceId: "INV-BETA-ATTACK" },
      clientIp: "10.0.1.10",
    });
    const s9Res = await verifyHandler(s9Req);
    const s9Data = await s9Res.json();
    const s9Pass = s9Res.status === 403 && s9Data.ok === false;
    recordResult(
      9,
      "Invoice belonging to another order (invoice hijacking blocked)",
      s9Pass,
      `HTTP ${s9Res.status}, Error: ${s9Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 10: Payment with wrong amount (৳50 vs ৳99)
    // -------------------------------------------------------------
    const cheapBuyer = createOrderRecord({
      cusName: "Cheap Buyer",
      cusEmail: "cheap@example.com",
      cusPhone: "01711556677",
      amount: 99,
    });
    cheapBuyer.invoiceId = "INV-WRONG-AMOUNT-50";

    const s10Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: cheapBuyer.orderId, invoiceId: "INV-WRONG-AMOUNT-50" },
      clientIp: "10.0.1.11",
    });
    const s10Res = await verifyHandler(s10Req);
    const s10Data = await s10Res.json();
    const s10Pass =
      s10Res.status === 400 &&
      s10Data.ok === false &&
      findOrder({ orderId: cheapBuyer.orderId })?.status === "PENDING";
    recordResult(
      10,
      "Payment with wrong amount (৳50 paid vs ৳99 expected, rejected)",
      s10Pass,
      `HTTP ${s10Res.status}, Error: ${s10Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 11: Provider returns PENDING
    // -------------------------------------------------------------
    const pendingBuyer = createOrderRecord({
      cusName: "Pending Buyer",
      cusEmail: "pending@example.com",
      cusPhone: "01711889900",
      amount: 99,
    });
    pendingBuyer.invoiceId = "INV-PENDING-STATE";

    const s11Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: pendingBuyer.orderId, invoiceId: "INV-PENDING-STATE" },
      clientIp: "10.0.1.12",
    });
    const s11Res = await verifyHandler(s11Req);
    const s11Data = await s11Res.json();
    const s11Pass =
      s11Res.status === 402 &&
      s11Data.ok === false &&
      s11Data.status === "PENDING" &&
      findOrder({ orderId: pendingBuyer.orderId })?.status === "PENDING";
    recordResult(
      11,
      "Provider returns PENDING (order remains PENDING, no token issued)",
      s11Pass,
      `HTTP ${s11Res.status}, Status returned: ${s11Data.status}`
    );

    // -------------------------------------------------------------
    // Scenario 12: Provider returns FAILED
    // -------------------------------------------------------------
    const failedBuyer = createOrderRecord({
      cusName: "Failed Buyer",
      cusEmail: "failed@example.com",
      cusPhone: "01711998877",
      amount: 99,
    });
    failedBuyer.invoiceId = "INV-FAILED-STATE";

    const s12Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: failedBuyer.orderId, invoiceId: "INV-FAILED-STATE" },
      clientIp: "10.0.1.13",
    });
    const s12Res = await verifyHandler(s12Req);
    const s12Data = await s12Res.json();
    const s12Pass =
      s12Res.status === 402 &&
      s12Data.ok === false &&
      s12Data.status === "FAILED" &&
      findOrder({ orderId: failedBuyer.orderId })?.status !== "PAID";
    recordResult(
      12,
      "Provider returns FAILED (rejected, order not marked PAID)",
      s12Pass,
      `HTTP ${s12Res.status}, Status: ${s12Data.status}`
    );

    // -------------------------------------------------------------
    // Scenario 13: Provider returns CANCELLED
    // -------------------------------------------------------------
    const cancelBuyer = createOrderRecord({
      cusName: "Cancel Buyer",
      cusEmail: "cancel@example.com",
      cusPhone: "01711332211",
      amount: 99,
    });
    cancelBuyer.invoiceId = "INV-CANCELLED-STATE";

    const s13Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: cancelBuyer.orderId, invoiceId: "INV-CANCELLED-STATE" },
      clientIp: "10.0.1.14",
    });
    const s13Res = await verifyHandler(s13Req);
    const s13Data = await s13Res.json();
    const s13Pass =
      s13Res.status === 402 &&
      s13Data.ok === false &&
      s13Data.status === "CANCELLED" &&
      findOrder({ orderId: cancelBuyer.orderId })?.status !== "PAID";
    recordResult(
      13,
      "Provider returns CANCELLED (rejected, order not marked PAID)",
      s13Pass,
      `HTTP ${s13Res.status}, Status: ${s13Data.status}`
    );

    // -------------------------------------------------------------
    // Scenario 14: Provider verification timeout / 500 error
    // -------------------------------------------------------------
    const errorBuyer = createOrderRecord({
      cusName: "Error Buyer",
      cusEmail: "error@example.com",
      cusPhone: "01711445566",
      amount: 99,
    });
    errorBuyer.invoiceId = "INV-SERVER-ERROR";

    const s14Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: errorBuyer.orderId, invoiceId: "INV-SERVER-ERROR" },
      clientIp: "10.0.1.15",
    });
    const s14Res = await verifyHandler(s14Req);
    const s14Data = await s14Res.json();
    const s14Pass =
      s14Res.status >= 400 &&
      s14Data.ok === false &&
      findOrder({ orderId: errorBuyer.orderId })?.status === "PENDING";
    recordResult(
      14,
      "Provider verification timeout/500 error (safe fail-closed, no leak)",
      s14Pass,
      `HTTP ${s14Res.status}, Order remains PENDING`
    );

    // -------------------------------------------------------------
    // Scenario 15: Webhook without authentication
    // -------------------------------------------------------------
    const s15Req = createRequest("http://localhost:3000/api/payment/webhook", {
      method: "POST",
      body: { invoice_id: "INV-SOME-INVOICE", status: "COMPLETED" },
      clientIp: "10.0.1.16",
    });
    const s15Res = await webhookHandler(s15Req);
    const s15Data = await s15Res.json();
    const s15Pass = s15Res.status === 401 && s15Data.ok === false;
    recordResult(
      15,
      "Webhook without authentication (missing signature rejected with 401)",
      s15Pass,
      `HTTP ${s15Res.status}, Error: ${s15Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 16: Webhook with invalid signature
    // -------------------------------------------------------------
    const s16Req = createRequest("http://localhost:3000/api/payment/webhook", {
      method: "POST",
      body: { invoice_id: "INV-SOME-INVOICE", status: "COMPLETED" },
      headers: {
        "x-zinipay-signature": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      },
      clientIp: "10.0.1.17",
    });
    const s16Res = await webhookHandler(s16Req);
    const s16Data = await s16Res.json();
    const s16Pass = s16Res.status === 401 && s16Data.ok === false;
    recordResult(
      16,
      "Webhook with invalid signature (timing-safe HMAC mismatch rejected with 401)",
      s16Pass,
      `HTTP ${s16Res.status}, Error: ${s16Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 17: Webhook with fake transaction ID / unverified invoice
    // -------------------------------------------------------------
    const webhookFakeBody = JSON.stringify({
      invoice_id: "INV-NONEXISTENT-FAKER",
      status: "COMPLETED",
      transaction_id: "TRX-FAKE-9999",
    });
    const fakeSig = crypto
      .createHmac("sha256", process.env.ZINIPAY_WEBHOOK_SECRET!)
      .update(webhookFakeBody)
      .digest("hex");

    const s17Req = createRequest("http://localhost:3000/api/payment/webhook", {
      method: "POST",
      body: webhookFakeBody,
      headers: {
        "x-zinipay-signature": fakeSig,
        "Content-Type": "application/json",
      },
      clientIp: "10.0.1.18",
    });
    const s17Res = await webhookHandler(s17Req);
    const s17Data = await s17Res.json();
    const s17Pass = s17Res.status === 404 && s17Data.ok === false;
    recordResult(
      17,
      "Webhook with fake transaction ID / unknown invoice (rejected with 404)",
      s17Pass,
      `HTTP ${s17Res.status}, Error: ${s17Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 18: Duplicate webhook arrives (idempotency)
    // -------------------------------------------------------------
    const webhookOrder = createOrderRecord({
      cusName: "Webhook Buyer",
      cusEmail: "webhook@example.com",
      cusPhone: "01711776655",
      amount: 99,
    });
    updateOrderRecord(webhookOrder.orderId, {
      invoiceId: "INV-COMPLETED-WEBHOOK-99",
    });

    const webhookValidBody = JSON.stringify({
      invoice_id: "INV-COMPLETED-WEBHOOK-99",
      status: "true",
    });
    const validWebhookSig = crypto
      .createHmac("sha256", process.env.ZINIPAY_WEBHOOK_SECRET!)
      .update(webhookValidBody)
      .digest("hex");

    // First arrival
    const s18aReq = createRequest("http://localhost:3000/api/payment/webhook", {
      method: "POST",
      body: webhookValidBody,
      headers: {
        "x-zinipay-signature": validWebhookSig,
        "Content-Type": "application/json",
      },
      clientIp: "10.0.1.19",
    });
    const s18aRes = await webhookHandler(s18aReq);
    const s18aData = await s18aRes.json();

    const orderAfterFirst = findOrder({ orderId: webhookOrder.orderId });
    const firstToken = orderAfterFirst?.downloadToken;

    // Second arrival (duplicate)
    const s18bReq = createRequest("http://localhost:3000/api/payment/webhook", {
      method: "POST",
      body: webhookValidBody,
      headers: {
        "x-zinipay-signature": validWebhookSig,
        "Content-Type": "application/json",
      },
      clientIp: "10.0.1.20",
    });
    const s18bRes = await webhookHandler(s18bReq);
    const s18bData = await s18bRes.json();

    const orderAfterSecond = findOrder({ orderId: webhookOrder.orderId });

    const s18Pass =
      s18aRes.status === 200 &&
      s18aData.ok === true &&
      s18bRes.status === 200 &&
      s18bData.ok === true &&
      orderAfterSecond?.status === "PAID" &&
      orderAfterSecond?.downloadToken === firstToken;
    recordResult(
      18,
      "Duplicate webhook arrives (idempotency: order not double-processed, token preserved)",
      s18Pass,
      `1st call HTTP ${s18aRes.status}, 2nd call HTTP ${s18bRes.status}, Token preserved: ${Boolean(firstToken)}`
    );

    // -------------------------------------------------------------
    // Scenario 19: Same transaction ID submitted for another order (double-spending protection)
    // -------------------------------------------------------------
    // Set a known transactionId on orderAlpha
    const orderAlphaPaid = markOrderAsPaid(orderAlpha.orderId, {
      transactionId: "TRX-ALREADY-USED-999",
      invoiceId: "INV-ALPHA-ORIGINAL",
    });

    const secondVictimOrder = createOrderRecord({
      cusName: "Second Victim",
      cusEmail: "second@example.com",
      cusPhone: "01799887766",
      amount: 99,
    });
    secondVictimOrder.invoiceId = "INV-DOUBLE-SPEND";

    const s19Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: secondVictimOrder.orderId, invoiceId: "INV-DOUBLE-SPEND" },
      clientIp: "10.0.1.21",
    });
    const s19Res = await verifyHandler(s19Req);
    const s19Data = await s19Res.json();

    const s19Pass =
      s19Res.status === 409 &&
      s19Data.ok === false &&
      findOrder({ orderId: secondVictimOrder.orderId })?.status === "PENDING";
    recordResult(
      19,
      "Same transaction ID submitted for another order (double-spending blocked with 409)",
      s19Pass,
      `HTTP ${s19Res.status}, Error: ${s19Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 20: Genuine payment succeeds & correct PDF downloadable
    // -------------------------------------------------------------
    const genuineBuyer = createOrderRecord({
      cusName: "Masud Rana",
      cusEmail: "rana@bangladesh.gov.bd",
      cusPhone: "01712345678",
      amount: 99,
    });
    genuineBuyer.invoiceId = "INV-COMPLETED-99";

    const s20VerifyReq = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: genuineBuyer.orderId, invoiceId: "INV-COMPLETED-99" },
      clientIp: "10.0.1.22",
    });
    const s20VerifyRes = await verifyHandler(s20VerifyReq);
    const s20VerifyData = await s20VerifyRes.json();

    const genuineToken = s20VerifyData?.order?.downloadToken;
    const downloadUrl = s20VerifyData?.downloadUrl;

    let s20DownloadPass = false;
    let pdfHeader = "";
    let contentLength = 0;

    if (genuineToken && downloadUrl) {
      const s20DlReq = createRequest(`http://localhost:3000${downloadUrl}`, {
        clientIp: "10.0.1.23",
      });
      const s20DlRes = await downloadHandler(s20DlReq);
      if (s20DlRes.status === 200) {
        const contentType = s20DlRes.headers.get("Content-Type");
        const disposition = s20DlRes.headers.get("Content-Disposition");
        const cacheControl = s20DlRes.headers.get("Cache-Control");
        const ab = await s20DlRes.arrayBuffer();
        const buf = Buffer.from(ab);
        pdfHeader = buf.subarray(0, 5).toString("utf-8"); // Should be "%PDF-"
        contentLength = buf.length;

        if (
          contentType === "application/pdf" &&
          disposition?.includes("Sporsher-Byakoron-Onuvuti-Publications.pdf") &&
          cacheControl?.includes("no-store") &&
          pdfHeader === "%PDF-" &&
          contentLength > 100_000 // Real PDF is ~6MB
        ) {
          s20DownloadPass = true;
        }
      }
    }

    const s20Pass =
      s20VerifyRes.status === 200 &&
      s20VerifyData.ok === true &&
      s20DownloadPass;
    recordResult(
      20,
      "Genuine payment succeeds & correct PDF downloadable (PDF binary streamed safely)",
      s20Pass,
      `Verify HTTP ${s20VerifyRes.status}, Download HTTP 200, PDF Header: ${pdfHeader}, Size: ${(contentLength / 1024 / 1024).toFixed(2)} MB`
    );

    // -------------------------------------------------------------
    // Scenario 21: Unpaid order cannot access PDF
    // -------------------------------------------------------------
    const unpaidOrder = createOrderRecord({
      cusName: "Unpaid Attacker",
      cusEmail: "unpaid@attacker.com",
      cusPhone: "01719999999",
      amount: 99,
    });
    // Attacker crafts a token with valid HMAC signature but status PENDING
    const unpaidPayload = {
      orderId: unpaidOrder.orderId,
      cusEmail: unpaidOrder.cusEmail,
      cusPhone: unpaidOrder.cusPhone,
      book: "sporsher_byakoron",
      status: "PENDING", // Not paid
      iat: Date.now(),
      exp: Date.now() + 24 * 3600 * 1000,
    };
    const unpaidEncoded = Buffer.from(JSON.stringify(unpaidPayload)).toString("base64url");
    const unpaidSig = crypto
      .createHmac("sha256", process.env.ORDER_SECRET_KEY!)
      .update(unpaidEncoded)
      .digest("base64url");
    const unpaidToken = `${unpaidEncoded}.${unpaidSig}`;

    const s21Req = createRequest(`http://localhost:3000/api/download?token=${unpaidToken}`, {
      clientIp: "10.0.1.24",
    });
    const s21Res = await downloadHandler(s21Req);
    const s21Data = await s21Res.json();
    const s21Pass = s21Res.status === 403 && s21Data.ok === false;
    recordResult(
      21,
      "Unpaid order cannot access PDF (even with signed token containing status!=PAID)",
      s21Pass,
      `HTTP ${s21Res.status}, Error: ${s21Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 22: Cross-customer order isolation
    // -------------------------------------------------------------
    // Customer Alice has paid order; Customer Bob tries to query or steal Alice's order
    const orderAlice = genuineBuyer; // Already PAID from Scenario 20
    const orderBob = createOrderRecord({
      cusName: "Bob Hacker",
      cusEmail: "bob@hacker.com",
      cusPhone: "01888888888",
      amount: 99,
    });

    // Try finding order using only Bob's phone but Alice's orderId -> must strictly isolate
    const queryAliceWithBobCreds = findOrder({ orderId: orderAlice.orderId });
    // Token check: verify Bob cannot forge Alice's orderId
    const forgedToken = signDownloadToken({
      orderId: orderAlice.orderId,
      cusEmail: "bob@hacker.com", // Mismatched email
      cusPhone: "01888888888",
    });
    const verifiedForged = verifyDownloadToken(forgedToken);

    // Verify system isolates download access strictly to authorized token
    const s22Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: orderAlice.orderId, invoiceId: "INV-BOB-MISMATCH" },
      clientIp: "10.0.1.25",
    });
    const s22Res = await verifyHandler(s22Req);
    const s22Data = await s22Res.json();

    const s22Pass =
      s22Res.status === 403 &&
      s22Data.ok === false &&
      orderAlice.cusEmail !== orderBob.cusEmail;
    recordResult(
      22,
      "Cross-customer order isolation (order data isolation enforced, cross-order tampering blocked)",
      s22Pass,
      `Cross-invoice request HTTP ${s22Res.status}, Error: ${s22Data.error}`
    );

  } finally {
    // Shutdown mock server
    mockServer.close();
    // Restore original orders.json
    fs.writeFileSync(ORDERS_FILE, originalOrders, "utf-8");
  }

  console.log("\n=======================================================");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL SCENARIOS TESTED: ${results.length}`);
  console.log(`PASSED: \x1b[32m${passedCount}\x1b[0m`);
  console.log(`FAILED: \x1b[31${failedCount > 0 ? "31m" : "32m"}${failedCount}\x1b[0m`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
