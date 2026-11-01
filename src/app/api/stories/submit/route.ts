import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isValidImageDataUrl,
  sanitizeText,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req.headers);

    // Rate limit: Max 3 story/confession submissions per 10 minutes per IP
    const rate = checkRateLimit({
      bucket: "story_submit",
      identifier: clientIp,
      maxRequests: 3,
      windowMs: 10 * 60_000,
      blockDurationMs: 15 * 60_000,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `স্প্যাম প্রতিরোধের জন্য প্রতি ১০ মিনিটে সর্বোচ্চ ৩টি লেখা পাঠানো যায়। অনুগ্রহ করে ${Math.ceil(
            rate.retryAfterSeconds / 60
          )} মিনিট পর আবার চেষ্টা করুন।`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Anti-bot Honeypot check (bots fill hidden fields)
    if (body?.websiteUrl && String(body.websiteUrl).trim().length > 0) {
      return NextResponse.json(
        { ok: false, error: "বট বা স্প্যাম রিকোয়েস্ট শনাক্ত হয়েছে।" },
        { status: 400 }
      );
    }

    const title = sanitizeText(String(body?.title || ""), 180);
    const content = sanitizeText(String(body?.content || ""), 8000);
    const category = sanitizeText(String(body?.category || "না বলা কথা"), 60);
    const isAnonymous = Boolean(body?.isAnonymous);
    const author = isAnonymous
      ? "নাম প্রকাশে অনিচ্ছুক"
      : sanitizeText(String(body?.author || "নাম প্রকাশে অনিচ্ছুক"), 80);

    // Optional image: ONLY keep if user explicitly uploaded a valid image
    const rawImageUrl =
      typeof body?.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : undefined;

    if (!title || title.length < 4) {
      return NextResponse.json(
        {
          ok: false,
          error: "অনুগ্রহ করে অন্তত ৪ অক্ষরের একটি সুন্দর শিরোনাম লিখুন।",
        },
        { status: 400 }
      );
    }

    if (!content || content.length < 20) {
      return NextResponse.json(
        {
          ok: false,
          error: "অনুগ্রহ করে আপনার গল্প বা কনফেশনটি আরেকটু বিস্তারিত লিখুন (অন্তত ২০ অক্ষর)।",
        },
        { status: 400 }
      );
    }

    if (rawImageUrl && !isValidImageDataUrl(rawImageUrl)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "ছবিটি বৈধ নয় বা ২ মেগাবাইটের বেশি। অনুগ্রহ করে JPG, PNG বা WEBP ছবি দিন।",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      remainingQuota: rate.remaining,
      story: {
        id: `p-${Date.now()}`,
        title,
        content,
        category,
        author,
        isAnonymous,
        imageUrl: rawImageUrl, // undefined if writer didn't add an image
        submittedAt: "এইমাত্র",
      },
    });
  } catch (err) {
    console.error("POST /api/stories/submit error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "আপনার লেখাটি পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}

