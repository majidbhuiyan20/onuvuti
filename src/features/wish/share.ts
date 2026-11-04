import type { WishTheme } from "@/data/birthdayTemplates";
import type { WishFont } from "./types";

export const absoluteWishUrl = (id: string) =>
  `${window.location.origin}/wish/${id}`;

export const manageUrl = (id: string, key: string) =>
  `${window.location.origin}/wish/${id}/replies?key=${encodeURIComponent(key)}`;

export const inviteText = (recipient: string) =>
  `🎂 প্রিয় ${recipient}, তোমার জন্য ভালোবাসায় মোড়ানো একটি বিশেষ জন্মদিনের চিঠি এসেছে! খামটি খুলে দেখতে এই লিঙ্কে ক্লিক করো:`;

export const shareLinks = {
  whatsapp: (url: string, text: string) =>
    `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
  telegram: (url: string, text: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
};

export async function nativeShare(url: string, text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    await navigator.share({ title: "জন্মদিনের চিঠি | অনুভূতি", text, url });
    return true;
  } catch {
    return false;
  }
}

export const HANDWRITING_FONT = "'Atma','Hind Siliguri','Noto Sans Bengali',cursive";
const CLASSIC_FONT = "'Hind Siliguri','Noto Sans Bengali','Kohinoor Bangla',sans-serif";

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

interface LetterImageInput {
  theme: WishTheme;
  recipient: string;
  sender: string;
  message: string;
  font: WishFont;
  photoUrl?: string;
}

/** Renders the opened letter to a PNG and triggers a download. */
export async function downloadLetterPng(input: LetterImageInput): Promise<void> {
  const { theme, recipient, sender, message, font, photoUrl } = input;
  const W = 1080;
  const pad = 90;
  const family = font === "handwritten" ? HANDWRITING_FONT : CLASSIC_FONT;

  if (document.fonts?.load) {
    await Promise.allSettled([document.fonts.load(`34px ${family}`), document.fonts.ready]);
  }

  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `38px ${family}`;
  const lines = wrapLines(measure, message, W - pad * 2);

  let photo: HTMLImageElement | null = null;
  if (photoUrl) {
    photo = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = photoUrl;
    });
  }
  const photoH = photo ? Math.min(560, ((W - pad * 2) * photo.height) / photo.width) : 0;

  const lineH = 66;
  const H = 360 + (photo ? photoH + 50 : 0) + lines.length * lineH + 260;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = theme.letterBg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = theme.accentColor;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.fillStyle = theme.accentColor;
  ctx.font = `bold 78px ${family}`;
  ctx.fillText("শুভ জন্মদিন 🎂", W / 2, 170);

  ctx.textAlign = "left";
  ctx.fillStyle = theme.textColor;
  ctx.font = `bold 46px ${family}`;
  ctx.fillText(`প্রিয় ${recipient},`, pad, 290);

  let y = 350;
  if (photo) {
    const x = pad;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, W - pad * 2, photoH, 28);
    ctx.clip();
    ctx.drawImage(photo, x, y, W - pad * 2, photoH);
    ctx.restore();
    y += photoH + 50;
  }

  ctx.font = `38px ${family}`;
  ctx.fillStyle = theme.textColor;
  y += 20;
  for (const line of lines) {
    ctx.fillText(line, pad, y);
    y += lineH;
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#78716c";
  ctx.font = `30px ${family}`;
  ctx.fillText("ভালোবাসা ও শুভকামনায়,", W - pad, H - 150);
  ctx.fillStyle = theme.accentColor;
  ctx.font = `bold 48px ${family}`;
  ctx.fillText(`— ${sender}`, W - pad, H - 90);
  ctx.textAlign = "center";
  ctx.fillStyle = "#a8a29e";
  ctx.font = `24px ${family}`;
  ctx.fillText("onuvuti.site", W / 2, H - 46);

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) throw new Error("ছবি তৈরি করা যায়নি");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `birthday-letter-${recipient}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
