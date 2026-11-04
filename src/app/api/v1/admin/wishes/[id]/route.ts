import { NextRequest, NextResponse } from "next/server";
import { getGoApiBaseUrl } from "@/lib/goApi";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization") || "";
    const baseUrl = getGoApiBaseUrl();

    const goRes = await fetch(`${baseUrl}/admin/wishes/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const text = await goRes.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: "ডাটাবেজে অপারেশন সম্পন্ন হয়নি।" },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: goRes.status });
  } catch (err) {
    console.error("DELETE /api/v1/admin/wishes/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "সার্ভারে সংযোগ ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}

