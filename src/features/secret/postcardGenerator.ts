/**
 * Vintage Keepsake Postcard Canvas Generator
 * Renders an authentic vintage postcard of a secret letter with wax seal, postal mark & stamps.
 */

export interface PostcardRenderOptions {
  canvas: HTMLCanvasElement;
  recipientDisplayName: string;
  recipientUsername: string;
  messageContent: string;
  sealLabel: string;
  createdAt: string;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  // Strip bold asterisks for canvas rendering if present
  const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1");
  const paragraphs = cleanText.split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  return lines;
}

export async function renderPostcardToCanvas(options: PostcardRenderOptions) {
  const {
    canvas,
    recipientDisplayName,
    recipientUsername,
    messageContent,
    sealLabel,
    createdAt,
  } = options;

  const width = 1080;
  const height = 1350; // 4:5 Portrait Postcard
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Vintage Aged Parchment Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#FCF7EB");
  bgGrad.addColorStop(0.5, "#F7EED8");
  bgGrad.addColorStop(1, "#EFE2C6");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain & vintage edge vignette
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.35,
    width / 2,
    height / 2,
    width * 0.75
  );
  vignette.addColorStop(0, "rgba(255, 255, 255, 0)");
  vignette.addColorStop(1, "rgba(126, 75, 34, 0.18)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // 2. Double Vintage Borders (Outer Maroon & Inner Gold)
  ctx.save();
  ctx.strokeStyle = "#7E151E";
  ctx.lineWidth = 4;
  roundRect(ctx, 40, 40, width - 80, height - 80, 24, false, true);

  ctx.strokeStyle = "#C5A059";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 52, 52, width - 104, height - 104, 18, false, true);

  // Corner ornamental flourishes (drawn geometric diamond points)
  const corners = [
    [64, 64],
    [width - 64, 64],
    [64, height - 64],
    [width - 64, height - 64],
  ];
  ctx.fillStyle = "#7E151E";
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 3. Top Header: Circular Postmark Stamp (Left) & Postage Stamp (Right)
  // --- Left: Circular Postmark Stamp ---
  ctx.save();
  const markX = 140;
  const markY = 145;
  ctx.strokeStyle = "rgba(126, 21, 30, 0.65)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(markX, markY, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(markX, markY, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(126, 21, 30, 0.8)";
  ctx.textAlign = "center";
  ctx.font = "bold 13px 'Hind Siliguri', 'Kalpurush', sans-serif";
  ctx.fillText("অনুভূতি ডাকবিভাগ", markX, markY - 20);

  ctx.font = "600 11px monospace";
  let dateText = "CONFIDENTIAL";
  try {
    const d = new Date(createdAt);
    dateText = d.toISOString().split("T")[0];
  } catch {}
  ctx.fillText(dateText, markX, markY + 4);

  ctx.font = "bold 11px 'Hind Siliguri', 'Kalpurush', sans-serif";
  ctx.fillText("গোপনীয় বার্তা", markX, markY + 24);
  ctx.restore();

  // --- Right: Vintage Postage Stamp ---
  ctx.save();
  const stampW = 120;
  const stampH = 145;
  const stampX = width - 80 - stampW;
  const stampY = 85;

  // Stamp body
  ctx.fillStyle = "#FFF9F0";
  ctx.strokeStyle = "#C5A059";
  ctx.lineWidth = 2;
  roundRect(ctx, stampX, stampY, stampW, stampH, 8, true, true);

  // Perforated edge effect
  ctx.strokeStyle = "rgba(126, 21, 30, 0.4)";
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(stampX + 6, stampY + 6, stampW - 12, stampH - 12);
  ctx.setLineDash([]);

  // Stamp badge interior
  ctx.fillStyle = "#7E151E";
  roundRect(ctx, stampX + 14, stampY + 14, stampW - 28, stampH - 52, 6, true, false);

  ctx.fillStyle = "#FDE68A";
  ctx.textAlign = "center";
  ctx.font = "bold 26px serif";
  ctx.fillText("ONUVUTI", stampX + stampW / 2, stampY + 54);

  ctx.fillStyle = "#7E151E";
  ctx.font = "bold 11px 'Hind Siliguri', 'Kalpurush', sans-serif";
  ctx.fillText("১০০% গোপন", stampX + stampW / 2, stampY + stampH - 22);
  ctx.font = "bold 10px monospace";
  ctx.fillText("2026 POST", stampX + stampW / 2, stampY + stampH - 10);
  ctx.restore();

  // 4. Center Title & Salutation
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 18px 'Hind Siliguri', 'Kalpurush', sans-serif";
  ctx.fillStyle = "#8C6D37";
  ctx.fillText("— একটি না বলা গোপন চিঠি —", width / 2, 230);

  ctx.font = "bold 34px 'Kalpurush', 'Hind Siliguri', serif";
  ctx.fillStyle = "#7E151E";
  ctx.textAlign = "left";
  ctx.fillText(`প্রিয় ${recipientDisplayName},`, 100, 310);
  ctx.restore();

  // 5. Letter Parchment Text Lines
  ctx.save();
  ctx.font = "normal 32px 'Kalpurush', 'Hind Siliguri', serif";
  ctx.fillStyle = "#2D1D16";
  ctx.textAlign = "left";
  const maxWidth = width - 200;
  const lines = wrapText(ctx, `“${messageContent}”`, maxWidth);
  const lineHeight = 52;
  const startY = 385;

  let currentY = startY;
  const maxDisplayLines = Math.min(lines.length, 12);

  // Faint ruled lines for notebook/stationery feel
  ctx.save();
  ctx.strokeStyle = "rgba(197, 160, 89, 0.22)";
  ctx.lineWidth = 1;
  for (let i = 0; i < maxDisplayLines + 2; i++) {
    const lineY = startY + i * lineHeight + 8;
    ctx.beginPath();
    ctx.moveTo(100, lineY);
    ctx.lineTo(width - 100, lineY);
    ctx.stroke();
  }
  ctx.restore();

  for (let i = 0; i < maxDisplayLines; i++) {
    ctx.fillText(lines[i], 100, currentY);
    currentY += lineHeight;
  }
  if (lines.length > 12) {
    ctx.fillText("...", 100, currentY);
    currentY += lineHeight;
  }

  // Sign-off
  currentY += 25;
  ctx.font = "italic bold 26px 'Kalpurush', 'Hind Siliguri', serif";
  ctx.fillStyle = "#7E151E";
  ctx.textAlign = "right";
  ctx.fillText("— একজন শুভাকাঙ্ক্ষী (পরিচয় গোপন)", width - 100, currentY);
  ctx.restore();

  // 6. Bottom Clues & Wax Seal Pill Box
  const boxY = height - 240;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.strokeStyle = "rgba(197, 160, 89, 0.45)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 100, boxY, width - 200, 105, 18, true, true);

  // Wax Seal Badge
  const sealCircleX = 155;
  const sealCircleY = boxY + 52;
  ctx.fillStyle = "#7E151E";
  ctx.beginPath();
  ctx.arc(sealCircleX, sealCircleY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#FDE68A";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#FDE68A";
  ctx.font = "bold 20px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SEAL", sealCircleX, sealCircleY);

  // Clues text
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#7E151E";
  ctx.font = "bold 22px 'Hind Siliguri', 'Kalpurush', sans-serif";
  ctx.fillText(`মুড / লক্ষণ: ${sealLabel}`, 210, boxY + 45);

  ctx.fillStyle = "#6B584C";
  ctx.font = "18px 'Hind Siliguri', 'Kalpurush', sans-serif";
  let formattedTime = "কিছুক্ষণ আগে";
  try {
    const d = new Date(createdAt);
    formattedTime = d.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {}
  ctx.fillText(`তারিখ ও সময়: ${formattedTime}`, 210, boxY + 78);
  ctx.restore();

  // 7. Footer Watermark
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 20px 'Hind Siliguri', 'Kalpurush', sans-serif";
  ctx.fillStyle = "#7E151E";
  ctx.fillText("অনুভূতি • গোপন চিঠি ও না বলা কথা", width / 2, height - 85);

  ctx.font = "normal 16px monospace";
  ctx.fillStyle = "rgba(100, 75, 55, 0.75)";
  ctx.fillText(`onuvuti.site/m/${recipientUsername}`, width / 2, height - 60);
  ctx.restore();
}

/**
 * Downloads high-resolution keepsake postcard image
 */
export async function downloadPostcardImage(
  canvas: HTMLCanvasElement,
  username: string,
  messageId: string
) {
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `onuvuti-letter-${username}-${messageId.slice(0, 6)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve();
    }, "image/png");
  });
}
