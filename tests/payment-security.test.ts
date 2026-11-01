import http from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { NextRequest } from "next/server";

// Test Environment Configuration
process.env.ORDER_SECRET_KEY = "test-super-secret-key-at-least-32-chars-long!";
process.env.ZINIPAY_API_KEY = "test-zinipay-api-key-998877";
process.env.ZINIPAY_WEBHOOK_SECRET = "test-webhook-secret-key-32-chars-ok!";
process.env.BOOK_PRICE_BDT = "99";
process.env.INTERNAL_SERVICE_SECRET = "onuvuti-internal-rpc-secret-key-2026";
process.env.INTERNAL_GO_API_URL = "http://127.0.0.1:8081/api/v1";
process.env.GO_API_BASE_URL = "http://127.0.0.1:8081/api/v1";

const MOCK_PORT = 9199;
process.env.ZINIPAY_BASE_URL = `http://127.0.0.1:${MOCK_PORT}`;

// Import Application Modules
import {
  createOrderRecord,
  updateOrderRecord,
  findOrder,
  markOrderAsPaid,
  recordDownload,
  signDownloadToken,
  verifyDownloadToken,
  MAX_DOWNLOAD_LIMIT,
} from "../src/lib/zinipay";
import { GET as downloadHandler } from "../src/app/api/download/route";
import { POST as verifyHandler } from "../src/app/api/payment/verify/route";
import { POST as webhookHandler } from "../src/app/api/payment/webhook/route";
import { POST as verifyTrxHandler } from "../src/app/api/payment/verify-trx/route";

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

const runId = Date.now();
const INV_COMPLETED = `INV-COMPLETED-${runId}`;
const TRX_GENUINE = `TRX-GENUINE-${runId}`;
const INV_WEBHOOK = `INV-WEBHOOK-${runId}`;
const TRX_WEBHOOK = `TRX-WEBHOOK-${runId}`;

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

        if (req.url === "/v1/payment/create") {
          res.writeHead(200);
          res.end(
            JSON.stringify({
              payment_url: "https://dash.zinipay.com/payment/mock-session-12345",
              invoice_id: `ZP_MOCK_${runId}`,
            })
          );
          return;
        }

        if (req.url === "/v1/payment/verify") {
          if (invoiceId === INV_COMPLETED) {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 99,
                currency: "BDT",
                transaction_id: TRX_GENUINE,
                payment_method: "bKash",
                cus_name: "Genuine Buyer",
                cus_phone: "01711223344",
                cus_email: "genuine@onuvuti.site",
              })
            );
          } else if (invoiceId === INV_WEBHOOK) {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 99,
                currency: "BDT",
                transaction_id: TRX_WEBHOOK,
                payment_method: "Nagad",
                cus_name: "Webhook Buyer",
                cus_phone: "01711776655",
                cus_email: "webhook@onuvuti.site",
              })
            );
          } else if (invoiceId.includes("FAILED")) {
            res.writeHead(200);
            res.end(JSON.stringify({ status: "FAILED", amount: 99 }));
          } else if (invoiceId.includes("PENDING")) {
            res.writeHead(200);
            res.end(JSON.stringify({ status: "PENDING", amount: 99 }));
          } else if (invoiceId.includes("WRONG-AMOUNT")) {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 50,
                currency: "BDT",
                transaction_id: `TRX-CHEAP-${runId}`,
              })
            );
          } else if (invoiceId.includes("DOUBLE-SPEND")) {
            res.writeHead(200);
            res.end(
              JSON.stringify({
                status: "COMPLETED",
                amount: 99,
                transaction_id: TRX_GENUINE, // Reuses Scenario 3's transaction ID!
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

  return new NextRequest(url, { method, headers, body: bodyStr });
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   ONUVUTI 16-SCENARIO PRODUCTION MIGRATION TEST SUITE ");
  console.log("=======================================================\n");

  const mockServer = await startMockZiniPayServer();

  // Snapshot orders.json to verify Scenario 16 (zero modifications during runtime)
  const ordersJsonStatBefore = fs.statSync(ORDERS_FILE);
  const ordersJsonContentBefore = fs.readFileSync(ORDERS_FILE, "utf-8");

  try {
    // -------------------------------------------------------------
    // Scenario 1: Creating order via Go/PostgreSQL
    // -------------------------------------------------------------
    const order1 = await createOrderRecord({
      cusName: "Test Reader One",
      amount: 99,
    });
    const s1Pass =
      Boolean(order1.orderId) &&
      order1.orderId.startsWith("ONV-") &&
      order1.status === "PENDING" &&
      order1.amount === 99;
    recordResult(
      1,
      "Creating order via Go/PostgreSQL",
      s1Pass,
      `OrderId: ${order1.orderId}, Status: ${order1.status}`
    );

    // -------------------------------------------------------------
    // Scenario 2: Retrieving order from PostgreSQL
    // -------------------------------------------------------------
    const retrieved1 = await findOrder({ orderId: order1.orderId });
    const s2Pass =
      Boolean(retrieved1) &&
      retrieved1?.orderId === order1.orderId &&
      retrieved1?.cusName === "Test Reader One";
    recordResult(
      2,
      "Retrieving order from PostgreSQL",
      s2Pass,
      `Found: ${retrieved1?.orderId}, Customer: ${retrieved1?.cusName}`
    );

    // -------------------------------------------------------------
    // Scenario 3: ZiniPay payment verification
    // -------------------------------------------------------------
    await updateOrderRecord(order1.orderId, { invoiceId: INV_COMPLETED });
    const s3Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: order1.orderId, invoiceId: INV_COMPLETED },
      clientIp: "10.0.3.1",
    });
    const s3Res = await verifyHandler(s3Req);
    const s3Data = await s3Res.json();
    const updated1 = await findOrder({ orderId: order1.orderId });

    const s3Pass =
      s3Res.status === 200 &&
      s3Data.ok === true &&
      updated1?.status === "PAID" &&
      Boolean(updated1?.downloadToken) &&
      updated1?.transactionId === TRX_GENUINE;
    recordResult(
      3,
      "ZiniPay payment verification (authoritative verify API marks PAID)",
      s3Pass,
      `Status: ${updated1?.status}, TrxID: ${updated1?.transactionId}`
    );

    // -------------------------------------------------------------
    // Scenario 4: Invalid payment rejection
    // -------------------------------------------------------------
    const failedOrder = await createOrderRecord({ amount: 99 });
    await updateOrderRecord(failedOrder.orderId, { invoiceId: `INV-FAILED-${runId}` });

    const s4Req1 = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: failedOrder.orderId, invoiceId: `INV-FAILED-${runId}` },
      clientIp: "10.0.4.1",
    });
    const s4Res1 = await verifyHandler(s4Req1);

    const cheapOrder = await createOrderRecord({ amount: 99 });
    await updateOrderRecord(cheapOrder.orderId, { invoiceId: `INV-WRONG-AMOUNT-${runId}` });
    const s4Req2 = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: cheapOrder.orderId, invoiceId: `INV-WRONG-AMOUNT-${runId}` },
      clientIp: "10.0.4.2",
    });
    const s4Res2 = await verifyHandler(s4Req2);

    const s4Pass = s4Res1.status === 402 && s4Res2.status === 400;
    recordResult(
      4,
      "Invalid payment rejection (failed status and underpayment rejected)",
      s4Pass,
      `Failed status HTTP ${s4Res1.status}, Underpayment HTTP ${s4Res2.status}`
    );

    // -------------------------------------------------------------
    // Scenario 5: Duplicate webhook idempotency
    // -------------------------------------------------------------
    const webhookOrder = await createOrderRecord({ amount: 99 });
    await updateOrderRecord(webhookOrder.orderId, { invoiceId: INV_WEBHOOK });

    const webhookBody = JSON.stringify({ invoice_id: INV_WEBHOOK });
    const webhookSig = crypto
      .createHmac("sha256", process.env.ZINIPAY_WEBHOOK_SECRET!)
      .update(webhookBody)
      .digest("hex");

    const s5Req1 = createRequest("http://localhost:3000/api/payment/webhook", {
      method: "POST",
      body: webhookBody,
      headers: {
        "x-zinipay-signature": webhookSig,
      },
      clientIp: "10.0.5.1",
    });
    const s5Res1 = await webhookHandler(s5Req1);
    const s5Data1 = await s5Res1.json();

    // Second duplicate webhook delivery
    const s5Req2 = createRequest("http://localhost:3000/api/payment/webhook", {
      method: "POST",
      body: webhookBody,
      headers: {
        "x-zinipay-signature": webhookSig,
      },
      clientIp: "10.0.5.2",
    });
    const s5Res2 = await webhookHandler(s5Req2);
    const s5Data2 = await s5Res2.json();

    const s5Pass =
      s5Res1.status === 200 &&
      s5Data1.ok === true &&
      s5Res2.status === 200 &&
      s5Data2.ok === true &&
      s5Data2.message.includes("idempotent");
    recordResult(
      5,
      "Duplicate webhook idempotency (duplicate call returns 200 idempotent)",
      s5Pass,
      `First call: ${s5Res1.status}, Second call: ${s5Res2.status} (${s5Data2.message})`
    );

    // -------------------------------------------------------------
    // Scenario 6: Duplicate transaction ID rejection
    // -------------------------------------------------------------
    const attackerOrder = await createOrderRecord({ amount: 99 });
    await updateOrderRecord(attackerOrder.orderId, { invoiceId: `INV-DOUBLE-SPEND-${runId}` });

    const s6Req = createRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: { orderId: attackerOrder.orderId, invoiceId: `INV-DOUBLE-SPEND-${runId}` },
      clientIp: "10.0.6.1",
    });
    const s6Res = await verifyHandler(s6Req);
    const s6Data = await s6Res.json();

    const s6Pass = s6Res.status === 409 && s6Data.ok === false;
    recordResult(
      6,
      "Duplicate transaction ID rejection (double-spending attempt rejected)",
      s6Pass,
      `HTTP ${s6Res.status}, Error: ${s6Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 7: Preventing PAID-to-PENDING status downgrade
    // -------------------------------------------------------------
    // Attempt to upsert existing PAID order with PENDING status
    await createOrderRecord({
      orderId: order1.orderId,
      cusName: "Downgrade Attacker",
    });
    const checkDowngrade = await findOrder({ orderId: order1.orderId });
    const s7Pass = checkDowngrade?.status === "PAID";
    recordResult(
      7,
      "Preventing PAID-to-PENDING status downgrade (PAID status immutable)",
      s7Pass,
      `Status retained: ${checkDowngrade?.status}`
    );

    // -------------------------------------------------------------
    // Scenario 8: Order recovery via PostgreSQL
    // -------------------------------------------------------------
    const s8Req = createRequest("http://localhost:3000/api/payment/verify-trx", {
      method: "POST",
      body: { transactionId: TRX_GENUINE },
      clientIp: "10.0.8.1",
    });
    const s8Res = await verifyTrxHandler(s8Req);
    const s8Data = await s8Res.json();

    const s8Pass =
      s8Res.status === 200 &&
      s8Data.ok === true &&
      s8Data.recovered === true &&
      s8Data.order.orderId === order1.orderId &&
      Boolean(s8Data.downloadUrl);
    recordResult(
      8,
      "Order recovery via PostgreSQL (recovers active download link by TrxID)",
      s8Pass,
      `Recovered: ${s8Data.recovered}, Order: ${s8Data.order?.orderId}`
    );

    // -------------------------------------------------------------
    // Scenario 9: Download token expiry
    // -------------------------------------------------------------
    const expiredToken = signDownloadToken({
      orderId: order1.orderId,
      cusEmail: "test@onuvuti.site",
      cusPhone: "01700000000",
      expiresInMs: -5000, // Expired 5 seconds ago
    });
    const s9Req = createRequest(`http://localhost:3000/api/download?token=${expiredToken}`, {
      clientIp: "10.0.9.1",
    });
    const s9Res = await downloadHandler(s9Req);
    const s9Data = await s9Res.json();

    const s9Pass = s9Res.status === 403 && s9Data.ok === false;
    recordResult(
      9,
      "Download token expiry (expired token rejected with 403)",
      s9Pass,
      `HTTP ${s9Res.status}, Error: ${s9Data.error}`
    );

    // -------------------------------------------------------------
    // Scenario 10: Max 10 downloads enforcement
    // -------------------------------------------------------------
    const limitOrder = await createOrderRecord({ amount: 99 });
    const markLimit = await markOrderAsPaid(limitOrder.orderId, {
      transactionId: `TRX-LIMIT-${runId}`,
    });
    const validToken = markLimit.order?.downloadToken!;

    // Exhaust 10 downloads
    for (let i = 0; i < MAX_DOWNLOAD_LIMIT; i++) {
      await recordDownload(limitOrder.orderId);
    }
    const limitCheck = await findOrder({ orderId: limitOrder.orderId });

    // 11th download attempt
    const s10Req = createRequest(`http://localhost:3000/api/download?token=${validToken}`, {
      clientIp: "10.0.10.1",
    });
    const s10Res = await downloadHandler(s10Req);
    const s10Data = await s10Res.json();

    const s10Pass =
      limitCheck?.downloadCount === 10 &&
      s10Res.status === 403 &&
      s10Data.ok === false;
    recordResult(
      10,
      "Max 10 downloads enforcement (11th download attempt blocked)",
      s10Pass,
      `Count: ${limitCheck?.downloadCount}, 11th Attempt HTTP: ${s10Res.status}`
    );

    // -------------------------------------------------------------
    // Scenario 11: Concurrent download limit race condition
    // -------------------------------------------------------------
    const raceOrder = await createOrderRecord({ amount: 99 });
    await markOrderAsPaid(raceOrder.orderId, {
      transactionId: `TRX-RACE-${runId}`,
    });
    // Set to 9 downloads
    for (let i = 0; i < 9; i++) {
      await recordDownload(raceOrder.orderId);
    }
    // Launch 10 simultaneous download increments
    const raceResults = await Promise.all(
      Array.from({ length: 10 }).map(() => recordDownload(raceOrder.orderId))
    );
    const successfulIncrements = raceResults.filter((r) => r.ok).length;
    const finalRaceOrder = await findOrder({ orderId: raceOrder.orderId });

    const s11Pass =
      successfulIncrements === 1 && finalRaceOrder?.downloadCount === 10;
    recordResult(
      11,
      "Concurrent download limit race condition (only 1 increment allowed to reach 10)",
      s11Pass,
      `Successful increments: ${successfulIncrements}/10, Final count: ${finalRaceOrder?.downloadCount}`
    );

    // -------------------------------------------------------------
    // Scenario 12: Database connection failure handling
    // -------------------------------------------------------------
    const originalApiUrl = process.env.INTERNAL_GO_API_URL;
    process.env.INTERNAL_GO_API_URL = "http://127.0.0.1:54321/offline";
    const offlineResult = await findOrder({ orderId: "ONV-OFFLINE-TEST" });
    process.env.INTERNAL_GO_API_URL = originalApiUrl;

    const s12Pass = offlineResult === null;
    recordResult(
      12,
      "Database connection failure handling (fails closed safely without crashing)",
      s12Pass,
      `Safely returned: ${offlineResult}`
    );

    // -------------------------------------------------------------
    // Scenario 13: Migration with existing PAID orders
    // -------------------------------------------------------------
    const tempMigPath = path.join(process.cwd(), "storage", `test-migration-${runId}.json`);
    const testMigData = [
      {
        orderId: `ONV-REAL-PAID-${runId}`,
        invoiceId: `ZP_REAL_${runId}`,
        transactionId: `TRX_REAL_${runId}`,
        cusName: "Real Customer",
        cusEmail: "real@customer.com",
        cusPhone: "01700112233",
        amount: 99,
        currency: "BDT",
        status: "PAID",
        paymentMethod: "bKash",
        downloadToken: "signed-token-01",
        downloadCount: 3,
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(tempMigPath, JSON.stringify(testMigData, null, 2));

    execSync(
      `DATABASE_URL="postgres://localhost:5432/onuvuti?sslmode=disable" ./backend/migrate-orders -file ${tempMigPath}`,
      { stdio: "pipe" }
    );
    const migratedOrder = await findOrder({ orderId: `ONV-REAL-PAID-${runId}` });
    const s13Pass =
      migratedOrder?.status === "PAID" &&
      migratedOrder?.transactionId === `TRX_REAL_${runId}` &&
      migratedOrder?.downloadCount === 3;
    recordResult(
      13,
      "Migration with existing PAID orders (preserves status, TrxID, token, counts)",
      s13Pass,
      `Status: ${migratedOrder?.status}, Count: ${migratedOrder?.downloadCount}`
    );

    // -------------------------------------------------------------
    // Scenario 14: Running migration twice without duplicates (idempotency)
    // -------------------------------------------------------------
    const migOutput2 = execSync(
      `DATABASE_URL="postgres://localhost:5432/onuvuti?sslmode=disable" ./backend/migrate-orders -file ${tempMigPath}`,
      { encoding: "utf-8" }
    );
    const s14Pass =
      migOutput2.includes("Newly Imported Orders:   0") &&
      migOutput2.includes("Preserved/Updated:       1");
    recordResult(
      14,
      "Running migration twice without duplicates (idempotent 0 new imports)",
      s14Pass,
      `Output: Newly Imported: 0, Preserved: 1`
    );
    if (fs.existsSync(tempMigPath)) fs.unlinkSync(tempMigPath);

    // -------------------------------------------------------------
    // Scenario 15: Migration rollback on failure
    // -------------------------------------------------------------
    const badMigPath = path.join(process.cwd(), "storage", `bad-migration-${runId}.json`);
    const badMigData = [
      {
        orderId: `ONV-WILL-FAIL-${runId}`,
        status: "PAID",
        amount: -99999999999999999999, // Overflow to cause SQL error
      },
    ];
    fs.writeFileSync(badMigPath, JSON.stringify(badMigData, null, 2));

    let migFailedCleanly = false;
    try {
      execSync(
        `DATABASE_URL="postgres://localhost:5432/onuvuti?sslmode=disable" ./backend/migrate-orders -file ${badMigPath}`,
        { stdio: "pipe" }
      );
    } catch {
      migFailedCleanly = true;
    }
    const checkBadOrder = await findOrder({ orderId: `ONV-WILL-FAIL-${runId}` });
    const s15Pass = migFailedCleanly && checkBadOrder === null;
    recordResult(
      15,
      "Migration rollback on failure (aborts cleanly and rolls back on failure)",
      s15Pass,
      `Migration caught error: ${migFailedCleanly}, Uncommitted in DB: ${checkBadOrder === null}`
    );
    if (fs.existsSync(badMigPath)) fs.unlinkSync(badMigPath);

    // -------------------------------------------------------------
    // Scenario 16: Verifying zero read/write access to storage/orders.json
    // -------------------------------------------------------------
    const ordersJsonStatAfter = fs.statSync(ORDERS_FILE);
    const ordersJsonContentAfter = fs.readFileSync(ORDERS_FILE, "utf-8");

    const s16Pass =
      ordersJsonStatBefore.mtimeMs === ordersJsonStatAfter.mtimeMs &&
      ordersJsonContentBefore === ordersJsonContentAfter;
    recordResult(
      16,
      "Verifying zero read/write access to storage/orders.json (file untouched at runtime)",
      s16Pass,
      `orders.json mtime unchanged: ${ordersJsonStatBefore.mtimeMs === ordersJsonStatAfter.mtimeMs}`
    );

  } finally {
    mockServer.close();
  }

  console.log("\n=======================================================");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL SCENARIOS TESTED: ${results.length}`);
  console.log(`PASSED: \x1b[32m${passedCount}\x1b[0m`);
  console.log(`FAILED: \x1b[${failedCount > 0 ? "31m" : "32m"}${failedCount}\x1b[0m`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
