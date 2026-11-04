import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WISH_THEMES } from "@/data/birthdayTemplates";
import { getGoApiBaseUrl } from "@/lib/goApi";

export const alt = "জন্মদিনের জাদুকরী চিঠি | অনুভূতি";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = readFile(join(process.cwd(), "src/features/wish/assets/HindSiliguri-Bold.ttf"));

/** Shared preview card: only public metadata (names + theme), never the letter itself. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let recipient = "প্রিয়জন";
  let sender = "একজন শুভাকাঙ্ক্ষী";
  let themeId = "rose";
  try {
    const res = await fetch(`${getGoApiBaseUrl()}/wishes/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await res.json();
    if (data?.ok && data.wish) {
      recipient = data.wish.recipientName;
      sender = data.wish.senderName;
      themeId = data.wish.theme;
    }
  } catch {
    /* fall back to the generic card */
  }

  const theme = WISH_THEMES.find((t) => t.id === themeId) || WISH_THEMES[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, #12060a 0%, ${theme.envelopeColor} 100%)`,
          color: "white",
          fontFamily: "HindSiliguri",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 760,
            height: 380,
            borderRadius: 36,
            background: theme.envelopeColor,
            border: `4px solid ${theme.envelopeBorder}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 34, opacity: 0.75, display: "flex" }}>তোমার জন্য একটি বিশেষ চিঠি</div>
          <div style={{ fontSize: 76, marginTop: 8, display: "flex" }}>প্রিয় {recipient}</div>
          <div style={{ fontSize: 34, marginTop: 10, opacity: 0.85, display: "flex" }}>— {sender}</div>
          <div
            style={{
              position: "absolute",
              bottom: -44,
              width: 96,
              height: 96,
              borderRadius: 48,
              background: theme.sealColor,
              border: "4px solid #fcd34d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
            }}
          >
            ♥
          </div>
        </div>
        <div style={{ marginTop: 84, fontSize: 34, color: "#fcd34d", display: "flex" }}>
          খামটি খুলতে ট্যাপ করো • onuvuti.site
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "HindSiliguri", data: await font, style: "normal", weight: 700 }],
    }
  );
}

