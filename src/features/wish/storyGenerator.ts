import type { WishTheme } from "@/data/birthdayTemplates";
import type { WishFont } from "./types";
import { stripMarkdown } from "@/lib/formatText";

export const HANDWRITING_FONT = "'Atma','Hind Siliguri','Noto Sans Bengali',cursive";
export const CLASSIC_FONT = "'Hind Siliguri','Noto Sans Bengali','Kohinoor Bangla',sans-serif";

export interface StoryCardInput {
  theme: WishTheme;
  recipient: string;
  sender: string;
  message: string;
  font: WishFont;
  photoUrl?: string;
  relationship?: string;
}

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

/** Draws a stylized 4-point sparkle star on canvas */
function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Draws an aesthetic 3-tier birthday cake illustration onto canvas */
function drawCake(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();

  // Platter
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 90, 160, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tier 1 (bottom)
  ctx.fillStyle = "#f43f5e"; // rose-500
  ctx.beginPath();
  ctx.roundRect(cx - 130, cy + 10, 260, 75, 12);
  ctx.fill();

  // Tier 1 frosting scallop
  ctx.fillStyle = "#fff1f2";
  for (let x = cx - 120; x <= cx + 120; x += 30) {
    ctx.beginPath();
    ctx.arc(x, cy + 22, 10, 0, Math.PI);
    ctx.fill();
  }

  // Tier 2 (middle)
  ctx.fillStyle = "#fbbf24"; // amber-400
  ctx.beginPath();
  ctx.roundRect(cx - 95, cy - 50, 190, 65, 10);
  ctx.fill();

  // Tier 2 frosting scallop
  ctx.fillStyle = "#fffbeb";
  for (let x = cx - 85; x <= cx + 85; x += 26) {
    ctx.beginPath();
    ctx.arc(x, cy - 40, 8, 0, Math.PI);
    ctx.fill();
  }

  // Tier 3 (top)
  ctx.fillStyle = "#ec4899"; // pink-500
  ctx.beginPath();
  ctx.roundRect(cx - 65, cy - 105, 130, 58, 8);
  ctx.fill();

  // Cream swirls
  ctx.fillStyle = "#ffffff";
  for (let x = cx - 50; x <= cx + 50; x += 25) {
    ctx.beginPath();
    ctx.arc(x, cy - 105, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Candle
  ctx.fillStyle = "#fef08a"; // yellow-200
  ctx.beginPath();
  ctx.roundRect(cx - 5, cy - 150, 10, 46, 3);
  ctx.fill();

  // Candle wick
  ctx.fillStyle = "#78350f";
  ctx.fillRect(cx - 1.5, cy - 162, 3, 12);

  // Flame glow
  ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 175, 10, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner flame core
  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 173, 5, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draws a heart crest on canvas for romantic/wedding/anniversary */
function drawHeartCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;

  ctx.beginPath();
  const topY = cy - 40;
  ctx.moveTo(cx, topY + 30);
  ctx.bezierCurveTo(cx, topY, cx - 60, topY, cx - 60, topY + 35);
  ctx.bezierCurveTo(cx - 60, topY + 70, cx, topY + 105, cx, topY + 125);
  ctx.bezierCurveTo(cx, topY + 105, cx + 60, topY + 70, cx + 60, topY + 35);
  ctx.bezierCurveTo(cx + 60, topY, cx, topY, cx, topY + 30);
  ctx.fill();
  ctx.restore();
}

/**
 * Generates an HD 1080x1920 Instagram/Facebook Story Canvas
 */
export async function generateStoryCanvas(input: StoryCardInput): Promise<HTMLCanvasElement> {
  const { theme, recipient, sender, message, font, photoUrl, relationship } = input;
  const W = 1080;
  const H = 1920;
  const family = font === "handwritten" ? HANDWRITING_FONT : CLASSIC_FONT;

  if (document.fonts?.load) {
    await Promise.allSettled([
      document.fonts.load(`bold 72px ${family}`),
      document.fonts.load(`36px ${family}`),
      document.fonts.ready,
    ]);
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 1. Theme-aware Deep Atmospheric Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  if (theme.id === "wedding_royal") {
    bgGrad.addColorStop(0, "#4a0815");
    bgGrad.addColorStop(0.5, "#25030b");
    bgGrad.addColorStop(1, "#110105");
  } else if (theme.id === "anniversary_gold" || theme.id === "gold" || theme.id === "vintage") {
    bgGrad.addColorStop(0, "#3d2208");
    bgGrad.addColorStop(0.5, "#1f1103");
    bgGrad.addColorStop(1, "#0f0701");
  } else if (theme.id === "rose" || theme.id === "blossom") {
    bgGrad.addColorStop(0, "#500e28");
    bgGrad.addColorStop(0.5, "#280514");
    bgGrad.addColorStop(1, "#120209");
  } else if (theme.id === "midnight") {
    bgGrad.addColorStop(0, "#162058");
    bgGrad.addColorStop(0.5, "#0b1030");
    bgGrad.addColorStop(1, "#040616");
  } else {
    bgGrad.addColorStop(0, "#2d0b17");
    bgGrad.addColorStop(0.5, "#17050b");
    bgGrad.addColorStop(1, "#0a0204");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Ambient Soft Glow Orbs
  const drawGlow = (gx: number, gy: number, r: number, color: string) => {
    const radial = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
    radial.addColorStop(0, color);
    radial.addColorStop(1, "transparent");
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(gx, gy, r, 0, Math.PI * 2);
    ctx.fill();
  };

  drawGlow(180, 240, 360, "rgba(245, 158, 11, 0.15)");
  drawGlow(900, 480, 380, "rgba(244, 63, 94, 0.15)");
  drawGlow(540, 1400, 420, "rgba(217, 119, 6, 0.12)");

  // 3. Stardust & Sparkle Accents
  const sparkles = [
    { x: 120, y: 180, s: 12 },
    { x: 960, y: 190, s: 14 },
    { x: 160, y: 520, s: 8 },
    { x: 920, y: 640, s: 10 },
    { x: 100, y: 1200, s: 11 },
    { x: 980, y: 1350, s: 12 },
    { x: 140, y: 1650, s: 9 },
    { x: 940, y: 1720, s: 13 },
  ];
  sparkles.forEach((sp) => {
    drawSparkle(ctx, sp.x, sp.y, sp.s, "rgba(253, 230, 138, 0.85)");
  });

  // 4. Elegant Outer & Inner Border Frame with Corner Flourishes
  const m = 44;
  ctx.save();
  ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(m, m, W - m * 2, H - m * 2, 32);
  ctx.stroke();

  // Inner thin frame
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(m + 14, m + 14, W - (m + 14) * 2, H - (m + 14) * 2, 24);
  ctx.stroke();
  ctx.restore();

  // 5. Header Section
  const isWedding = theme.id === "wedding_royal" || relationship?.includes("বিবাহ");
  const isAnniv = theme.id === "anniversary_gold" || relationship?.includes("বার্ষিকী");
  const isLove = theme.id === "rose" || relationship?.includes("ভালোবাসা");

  const storyTag = isWedding
    ? "শুভ বিবাহ নিমন্ত্রণ"
    : isAnniv
    ? "শুভ বিবাহবার্ষিকী"
    : isLove
    ? "এক টুকরো গোপন অনুভূতি"
    : "জন্মদিনের বিশেষ উপহার";

  const storyTitle = isWedding
    ? "শুভ বিবাহ নিমন্ত্রণপত্র"
    : isAnniv
    ? "চিরন্তন বন্ধনের শুভেচ্ছা"
    : isLove
    ? "হৃদয়ের না বলা অনুভূতি"
    : "শুভ জন্মদিন!";

  // Top Pill
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
  ctx.lineWidth = 1.5;
  const pillW = 440;
  const pillH = 50;
  const pillX = (W - pillW) / 2;
  const pillY = 120;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 25);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#fef08a";
  ctx.font = `bold 22px ${family}`;
  ctx.fillText(`•  ${storyTag}  •`, W / 2, pillY + 33);
  ctx.restore();

  // Main Title
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 72px ${family}`;
  ctx.shadowColor = "rgba(251, 191, 36, 0.6)";
  ctx.shadowBlur = 20;
  ctx.fillText(storyTitle, W / 2, 245);
  ctx.restore();

  // Recipient Greeting
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#fde047";
  ctx.font = `bold 46px ${family}`;
  const salutation = isWedding
    ? recipient.startsWith("জনাব") || recipient.startsWith("প্রিয়")
      ? `${recipient}`
      : `সম্মানিত ${recipient}`
    : `প্রিয় ${recipient},`;
  ctx.fillText(salutation, W / 2, 330);
  ctx.restore();

  // 6. Optional Photo Loading
  let photo: HTMLImageElement | null = null;
  if (photoUrl) {
    photo = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = photoUrl;
    });
  }

  // 7. Render Middle Content: Photo or Cake/Heart Crest
  let messageBoxTop = 420;
  let messageBoxHeight = 1100;

  if (photo) {
    // Polaroid Frame with Washi Tape
    const polaroidW = 680;
    const polaroidH = 510;
    const polaroidX = (W - polaroidW) / 2;
    const polaroidY = 385;

    ctx.save();
    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 15;

    // White polaroid background
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(polaroidX, polaroidY, polaroidW, polaroidH, 18);
    ctx.fill();
    ctx.restore();

    // Washi Tape on top
    ctx.save();
    ctx.translate(W / 2, polaroidY);
    ctx.rotate(-0.03);
    ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-80, -18, 160, 36, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Photo inside Polaroid (clipped)
    const padP = 22;
    const photoBoxW = polaroidW - padP * 2;
    const photoBoxH = polaroidH - 110;
    const photoBoxX = polaroidX + padP;
    const photoBoxY = polaroidY + padP;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH, 10);
    ctx.clip();

    // Aspect-ratio cover calculation
    const imgRatio = photo.width / photo.height;
    const boxRatio = photoBoxW / photoBoxH;
    let sw = photo.width;
    let sh = photo.height;
    let sx = 0;
    let sy = 0;
    if (imgRatio > boxRatio) {
      sw = photo.height * boxRatio;
      sx = (photo.width - sw) / 2;
    } else {
      sh = photo.width / boxRatio;
      sy = (photo.height - sh) / 2;
    }
    ctx.drawImage(photo, sx, sy, sw, sh, photoBoxX, photoBoxY, photoBoxW, photoBoxH);
    ctx.restore();

    // Polaroid Handwritten Caption
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#57534e";
    ctx.font = `bold 24px ${HANDWRITING_FONT}`;
    ctx.fillText("স্মৃতির একটি অমূল্য মুহূর্ত...", W / 2, polaroidY + polaroidH - 35);
    ctx.restore();

    messageBoxTop = 935;
    messageBoxHeight = 630;
  } else {
    // No photo: draw festive cake or heart crest
    if (isWedding || isAnniv || isLove) {
      drawHeartCrest(ctx, W / 2, 480, "#f43f5e");
      messageBoxTop = 640;
      messageBoxHeight = 920;
    } else {
      drawCake(ctx, W / 2, 530);
      messageBoxTop = 720;
      messageBoxHeight = 840;
    }
  }

  // 8. Frosted Parchment Message Card
  const boxW = 920;
  const boxX = (W - boxW) / 2;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.roundRect(boxX, messageBoxTop, boxW, messageBoxHeight, 26);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 9. Render Wrapped Message
  const cleanMsg = stripMarkdown(message);
  const msgFontSize = photo ? 32 : 36;
  const lineH = photo ? 52 : 58;
  ctx.font = `${msgFontSize}px ${family}`;
  const textPad = 50;
  const maxTextW = boxW - textPad * 2;
  const lines = wrapLines(ctx, cleanMsg, maxTextW);

  // Maximum lines to show nicely in story without overflow
  const maxLines = photo ? 8 : 12;
  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    displayLines[maxLines - 1] = displayLines[maxLines - 1] + "...";
  }

  const totalTextH = displayLines.length * lineH;
  let startY = messageBoxTop + (messageBoxHeight - totalTextH) / 2 + 10;
  if (startY < messageBoxTop + 60) startY = messageBoxTop + 60;

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `${msgFontSize}px ${family}`;
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 8;

  displayLines.forEach((ln, idx) => {
    ctx.fillText(ln, W / 2, startY + idx * lineH);
  });
  ctx.restore();

  // 10. Bottom Signature Section
  const footerY = 1660;

  // Gold divider
  ctx.save();
  ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(340, footerY);
  ctx.lineTo(740, footerY);
  ctx.stroke();

  // Center diamond on divider
  drawSparkle(ctx, W / 2, footerY, 6, "#fef08a");

  // Sender text
  ctx.textAlign = "center";
  ctx.fillStyle = "#e7e5e4";
  ctx.font = `26px ${family}`;
  ctx.fillText("ভালোবাসা ও শুভকামনায়,", W / 2, footerY + 50);

  ctx.fillStyle = "#fde047";
  ctx.font = `bold 44px ${family}`;
  ctx.shadowColor = "rgba(251, 191, 36, 0.5)";
  ctx.shadowBlur = 12;
  ctx.fillText(`— ${sender}`, W / 2, footerY + 110);
  ctx.restore();

  // 11. Watermark Stamp
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = `20px ${CLASSIC_FONT}`;
  ctx.fillText("onuvuti.site/birthday-wish • অনুভূতি", W / 2, 1850);
  ctx.restore();

  return canvas;
}

/**
 * Downloads the 1080x1920 Story Card as a PNG
 */
export async function downloadStoryCardPng(input: StoryCardInput): Promise<void> {
  const canvas = await generateStoryCanvas(input);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("স্টোরি কার্ড তৈরি করা যায়নি");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `story-wish-${input.recipient}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

/**
 * Shares the 1080x1920 Story Card directly using Web Share API (native IG/FB story picker on mobile)
 */
export async function shareStoryCardFile(input: StoryCardInput): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false;

  const canvas = await generateStoryCanvas(input);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return false;

  const file = new File([blob], `story-wish-${input.recipient}.png`, { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `জন্মদিনের স্টোরি কার্ড - ${input.recipient}`,
        text: `প্রিয় ${input.recipient}-এর জন্য জন্মদিনের বিশেষ অনুভূতির চিঠি!`,
      });
      return true;
    } catch {
      return false;
    }
  }

  // Fallback to downloading
  await downloadStoryCardPng(input);
  return true;
}
