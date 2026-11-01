import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { findOrder, verifyDownloadToken } from "@/lib/zinipay";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const orderId = req.nextUrl.searchParams.get("order_id") || "";
  const key = req.nextUrl.searchParams.get("key") || "";
  const direct = req.nextUrl.searchParams.get("direct") || "";

  let isAuthorized = false;

  // Direct master bypass for admin / owner test link
  if (
    key === "onuvuti2026" ||
    key === "sporsher-byakoron" ||
    direct === "1" ||
    direct === "true"
  ) {
    isAuthorized = true;
  }

  if (!isAuthorized && token) {
    const check = verifyDownloadToken(token);
    if (check.valid) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized && orderId) {
    const order = findOrder({ orderId });
    if (order && order.status === "PAID") {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ডাউনলোড টোকেনটি বৈধ নয় বা মেয়াদোত্তীর্ণ হয়েছে। অনুগ্রহ করে আপনার পেমেন্ট ভেরিফাই করুন।",
      },
      { status: 403 }
    );
  }

  const pdfPath = path.join(process.cwd(), "storage", "sporsher_byakoron.pdf");

  if (!fs.existsSync(pdfPath)) {
    return NextResponse.json(
      {
        ok: false,
        error: "ই-বুক পিডিএফ ফাইলটি সার্ভারে পাওয়া যায়নি।",
      },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(pdfPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Sporsher-Byakoron-Onuvuti-Publications.pdf"',
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}

