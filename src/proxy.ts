import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security";

const BLOCKED_PATH_PATTERNS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpmyadmin/i,
  /\/xmlrpc\.php/i,
  /\/cgi-bin/i,
  /\.\.\//,
];

const BLOCKED_USER_AGENTS =
  /(sqlmap|nikto|acunetix|nmap|masscan|dirbuster|gobuster|nuclei|nessus|zgrab)/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get("user-agent") || "";

  // 1. Block vulnerability scanners and path traversal attempts immediately
  if (
    BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(pathname)) ||
    BLOCKED_USER_AGENTS.test(ua)
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Intercept ZiniPay IPN/Webhook or Redirect sent directly to root '/'
  if (pathname === "/") {
    const rawStatus = (request.nextUrl.searchParams.get("status") || "").toUpperCase();
    const invoiceId =
      request.nextUrl.searchParams.get("invoice_id") ||
      request.nextUrl.searchParams.get("invoiceId") ||
      request.nextUrl.searchParams.get("val_id");
    const trx =
      request.nextUrl.searchParams.get("transaction_id") ||
      request.nextUrl.searchParams.get("trx") ||
      request.nextUrl.searchParams.get("trx_id");

    const isCompleted =
      rawStatus === "COMPLETED" ||
      rawStatus === "SUCCESS" ||
      rawStatus === "PAID" ||
      rawStatus === "TRUE";

    if (isCompleted && (invoiceId || trx)) {
      const isApiCaller =
        ua.toLowerCase().includes("axios") ||
        ua.toLowerCase().includes("curl") ||
        ua.toLowerCase().includes("postman") ||
        ua.toLowerCase().includes("zinipay");

      if (isApiCaller) {
        const webhookUrl = new URL("/api/payment/webhook", request.url);
        webhookUrl.search = request.nextUrl.searchParams.toString();
        return NextResponse.rewrite(webhookUrl);
      } else {
        const downloadUrl = new URL("/api/download", request.url);
        const params = new URLSearchParams(request.nextUrl.searchParams);
        params.set("direct", "1");
        downloadUrl.search = params.toString();
        return NextResponse.redirect(downloadUrl);
      }
    }
  }

  // 2. Global API flood protection (60 req / minute per IP across /api/*)
  if (pathname.startsWith("/api/")) {
    const clientIp = getClientIp(request.headers);
    const rate = checkRateLimit({
      bucket: "global_api",
      identifier: clientIp,
      maxRequests: 60,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          status: false,
          message: `অতিরিক্ত রিকোয়েস্ট পাঠানো হয়েছে। অনুগ্রহ করে ${rate.retryAfterSeconds} সেকেন্ড পর আবার চেষ্টা করুন।`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfterSeconds),
          },
        }
      );
    }
  }

  // 3. Attach security headers
  const response = NextResponse.next();
  const isEbookAdminRoute = pathname.startsWith("/api/admin/ebook");

  if (isEbookAdminRoute) {
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'self'; base-uri 'self'; object-src 'self';"
    );
  } else {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none';"
    );
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts/|images/).*)",
  ],
};

