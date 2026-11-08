import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Admin Access
    const cookieAdmin = req.cookies.get("onuvuti_is_admin")?.value === "true";
    const referer = req.headers.get("referer") || "";
    const isFromAdmin = referer.includes("/admin");
    const authHeader = req.headers.get("authorization") || "";
    const tokenQuery = req.nextUrl.searchParams.get("token") || "";
    const adminPassword = (process.env.ADMIN_SECRET_PASSWORD || "").trim();

    const isAuthed =
      cookieAdmin ||
      isFromAdmin ||
      authHeader.length > 10 ||
      (adminPassword && tokenQuery === adminPassword);

    if (!isAuthed && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে অ্যাডমিন হিসেবে লগইন করুন।" },
        { status: 401 }
      );
    }

    // 2. Locate storage/sporsher_byakoron.pdf
    const pdfPath = path.resolve(process.cwd(), "storage", "sporsher_byakoron.pdf");
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { ok: false, error: "ই-বুক পিডিএফ ফাইলটি storage ফোল্ডারে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const stat = fs.statSync(pdfPath);
    const isDownload = req.nextUrl.searchParams.get("download") === "1";
    const isStats = req.nextUrl.searchParams.get("stats") === "1";

    if (isStats) {
      return NextResponse.json({
        ok: true,
        fileName: "sporsher_byakoron.pdf",
        sizeBytes: stat.size,
        sizeMb: (stat.size / (1024 * 1024)).toFixed(2),
        modifiedAt: stat.mtime.toISOString(),
      });
    }

    const fileBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isDownload
          ? 'attachment; filename="Sporsher-Byakoron-Admin-Copy.pdf"'
          : 'inline; filename="sporsher_byakoron.pdf"',
        "Content-Length": String(stat.size),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("GET /api/admin/ebook error:", err);
    return NextResponse.json(
      { ok: false, error: "পিডিএফ রিডার লোড করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

