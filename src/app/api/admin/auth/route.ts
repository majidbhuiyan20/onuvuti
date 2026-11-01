import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers);

    // Strict Brute-Force Protection: Max 5 attempts per 15 minutes per IP
    const rate = checkRateLimit({
      bucket: "admin_login",
      identifier: clientIp,
      maxRequests: 5,
      windowMs: 15 * 60_000,
      blockDurationMs: 30 * 60_000, // 30-min lockout after 5 attempts
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `অতিরিক্তবার ভুল পাসওয়ার্ড দেওয়ার কারণে আপনার আইপি সাময়িকভাবে লক করা হয়েছে। ${Math.ceil(
            rate.retryAfterSeconds / 60
          )} মিনিট পর চেষ্টা করুন।`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const password = String(body?.password || "");

    const expectedPassword =
      process.env.ADMIN_SECRET_PASSWORD || "onuvuti-admin-2026";

    // Constant-time comparison to prevent timing attacks
    const inputHash = crypto.createHash("sha256").update(password).digest();
    const expectedHash = crypto
      .createHash("sha256")
      .update(expectedPassword)
      .digest();

    const isValid = crypto.timingSafeEqual(inputHash, expectedHash);

    if (!isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: `ভুল অ্যাডমিন পাসওয়ার্ড! (বাকি চেষ্টা: ${rate.remaining} বার)`,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "অ্যাডমিন প্যানেলে স্বাগতম!",
    });
  } catch (err) {
    console.error("POST /api/admin/auth error:", err);
    return NextResponse.json(
      { ok: false, error: "সার্ভারে ত্রুটি হয়েছে।" },
      { status: 500 }
    );
  }
}

