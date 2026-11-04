import { StoryTheme, StoryThemeId } from "./types";

export const STORY_THEMES: Record<StoryThemeId, StoryTheme> = {
  crimson: {
    id: "crimson",
    nameBn: "রোমান্টিক মারুন",
    bgGradient: ["#2B060B", "#7E151E", "#3A080F"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#FFE4E6",
    questionText: "#1F2937",
    answerBg: "rgba(255, 241, 242, 0.96)",
    answerBorder: "#FDA4AF",
    answerText: "#7E151E",
    badgeBg: "#7E151E",
    badgeText: "#FFFFFF",
    footerColor: "#FECDD3",
  },
  midnight: {
    id: "midnight",
    nameBn: "রাতের রহস্য",
    bgGradient: ["#0B0F1A", "#1E1B4B", "#0D1122"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#C7D2FE",
    questionText: "#0F172A",
    answerBg: "rgba(238, 242, 255, 0.96)",
    answerBorder: "#818CF8",
    answerText: "#312E81",
    badgeBg: "#4338CA",
    badgeText: "#FFFFFF",
    footerColor: "#C7D2FE",
  },
  sunset: {
    id: "sunset",
    nameBn: "গোধূলি আভা",
    bgGradient: ["#4C0519", "#BE123C", "#7C2D12"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#FED7AA",
    questionText: "#18181B",
    answerBg: "rgba(255, 247, 237, 0.96)",
    answerBorder: "#FDBA74",
    answerText: "#9A3412",
    badgeBg: "#EA580C",
    badgeText: "#FFFFFF",
    footerColor: "#FED7AA",
  },
  vintage: {
    id: "vintage",
    nameBn: "ভিন্টেজ পার্চমেন্ট",
    bgGradient: ["#D4B996", "#E8D5BC", "#C7AA84"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#D7C0A6",
    questionText: "#2C1810",
    answerBg: "rgba(250, 246, 238, 0.96)",
    answerBorder: "#BFA07C",
    answerText: "#4A2711",
    badgeBg: "#633B1E",
    badgeText: "#F5EBE0",
    footerColor: "#3D2413",
  },
  emerald: {
    id: "emerald",
    nameBn: "অভিজাত সবুজ",
    bgGradient: ["#022C22", "#065F46", "#042F24"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#A7F3D0",
    questionText: "#064E3B",
    answerBg: "rgba(236, 253, 245, 0.96)",
    answerBorder: "#34D399",
    answerText: "#064E3B",
    badgeBg: "#059669",
    badgeText: "#FFFFFF",
    footerColor: "#A7F3D0",
  },
  birthday_cake: {
    id: "birthday_cake",
    nameBn: "বার্থডে সেলিব্রেশন",
    bgGradient: ["#4A044E", "#86198F", "#C026D3"],
    questionBg: "rgba(255, 255, 255, 0.96)",
    questionBorder: "#F5D0FE",
    questionText: "#701A75",
    answerBg: "rgba(254, 240, 138, 0.96)",
    answerBorder: "#FACC15",
    answerText: "#713F12",
    badgeBg: "#A21CAF",
    badgeText: "#FFFFFF",
    footerColor: "#F5D0FE",
  },
  birthday_royal: {
    id: "birthday_royal",
    nameBn: "রয়্যাল গোল্ড বার্থডে",
    bgGradient: ["#0F0C20", "#1E1536", "#0A0814"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#FDE68A",
    questionText: "#1E1B4B",
    answerBg: "rgba(254, 243, 199, 0.96)",
    answerBorder: "#F59E0B",
    answerText: "#78350F",
    badgeBg: "#B45309",
    badgeText: "#FFFFFF",
    footerColor: "#FDE68A",
  },
  aurora: {
    id: "aurora",
    nameBn: "নিয়ন অরোরা",
    bgGradient: ["#030712", "#064E3B", "#1E1B4B"],
    questionBg: "rgba(15, 23, 42, 0.92)",
    questionBorder: "#2DD4BF",
    questionText: "#F0FDFA",
    answerBg: "rgba(30, 27, 75, 0.92)",
    answerBorder: "#818CF8",
    answerText: "#EEF2FF",
    badgeBg: "#0D9488",
    badgeText: "#FFFFFF",
    footerColor: "#5EEAD4",
  },
  polaroid: {
    id: "polaroid",
    nameBn: "পোলারয়েড রেট্রো",
    bgGradient: ["#292524", "#44403C", "#1C1917"],
    questionBg: "#FFFDF9",
    questionBorder: "#E7E5E4",
    questionText: "#292524",
    answerBg: "#FAF7F2",
    answerBorder: "#D6D3D1",
    answerText: "#1C1917",
    badgeBg: "#57534E",
    badgeText: "#FFFFFF",
    footerColor: "#D6D3D1",
  },
};

export interface StoryRenderOptions {
  canvas: HTMLCanvasElement;
  displayName: string;
  username: string;
  questionContent: string;
  moodEmoji: string;
  replyText: string;
  themeId: StoryThemeId;
}

/**
 * Draws rounded rectangle with optional fill and stroke.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill = true,
  stroke = true
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Wraps text onto multiple lines and calculates rendered height.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
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
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Renders high-resolution 1080x1920 Story Card directly to Canvas.
 */
export async function renderStoryToCanvas(options: StoryRenderOptions) {
  const {
    canvas,
    displayName,
    username,
    questionContent,
    moodEmoji,
    replyText,
    themeId,
  } = options;

  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const theme = STORY_THEMES[themeId] || STORY_THEMES.crimson;

  // 1. Draw Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(0.5, theme.bgGradient[1]);
  bgGrad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient decorative circles
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.15, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.75, 400, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Top Header Badge
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  const headerPillW = 520;
  const headerPillH = 68;
  const headerPillX = (width - headerPillW) / 2;
  const headerPillY = 160;
  roundRect(
    ctx,
    headerPillX,
    headerPillY,
    headerPillW,
    headerPillH,
    34,
    true,
    true
  );

  ctx.font = "bold 28px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("ONUVUTI • গোপন অনুভূতি", width / 2, headerPillY + 44);

  // Subtitle
  ctx.font = "600 36px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(
    `${displayName}-এর কাছে পাঠানো বেনামী চিঠি`,
    width / 2,
    headerPillY + 120
  );
  ctx.restore();

  // 4. Question Box (Anonymous Message)
  const cardW = 900;
  const cardX = (width - cardW) / 2;
  let currentY = 380;

  // Prepare question text
  ctx.font = "bold 44px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  const questionLines = wrapText(ctx, questionContent, cardW - 120);
  const qLineHeight = 60;
  const qBoxPadding = 60;
  const qBadgeHeight = 56;
  const qBoxH =
    qBoxPadding * 2 + qBadgeHeight + 30 + questionLines.length * qLineHeight;

  // Shadow for question card
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;

  ctx.fillStyle = theme.questionBg;
  ctx.strokeStyle = theme.questionBorder;
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, currentY, cardW, qBoxH, 44, true, true);
  ctx.restore();

  // Question Badge Pill
  ctx.save();
  const qBadgeW = 420;
  const qBadgeX = cardX + 60;
  const qBadgeY = currentY + 48;
  ctx.fillStyle = theme.badgeBg;
  ctx.strokeStyle = "transparent";
  roundRect(ctx, qBadgeX, qBadgeY, qBadgeW, qBadgeHeight, 28, true, false);

  ctx.font = "bold 26px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.badgeText;
  ctx.textAlign = "center";
  ctx.fillText(
    "বেনামী বার্তা • ANONYMOUS",
    qBadgeX + qBadgeW / 2,
    qBadgeY + 36
  );

  // Render question text
  ctx.font = "bold 44px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.questionText;
  ctx.textAlign = "left";
  let textY = qBadgeY + qBadgeHeight + 64;
  for (const line of questionLines) {
    ctx.fillText(line, cardX + 60, textY);
    textY += qLineHeight;
  }
  ctx.restore();

  currentY += qBoxH + 60;

  // 5. Answer Box (User's Reply)
  const safeReply = replyText.trim() || "ধন্যবাদ আপনার বেনামী বার্তার জন্য!";
  ctx.font = "bold 46px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  const answerLines = wrapText(ctx, safeReply, cardW - 120);
  const aLineHeight = 64;
  const aBoxPadding = 60;
  const aBadgeHeight = 56;
  const aBoxH =
    aBoxPadding * 2 + aBadgeHeight + 30 + answerLines.length * aLineHeight;

  // Shadow for answer card
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;

  ctx.fillStyle = theme.answerBg;
  ctx.strokeStyle = theme.answerBorder;
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, currentY, cardW, aBoxH, 44, true, true);
  ctx.restore();

  // Answer Badge Pill
  ctx.save();
  const aBadgeW = 380;
  const aBadgeX = cardX + 60;
  const aBadgeY = currentY + 48;
  ctx.fillStyle = theme.badgeBg;
  roundRect(ctx, aBadgeX, aBadgeY, aBadgeW, aBadgeHeight, 28, true, false);

  ctx.font = "bold 26px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.badgeText;
  ctx.textAlign = "center";
  ctx.fillText(
    `${displayName}-এর উত্তর`,
    aBadgeX + aBadgeW / 2,
    aBadgeY + 36
  );

  // Render answer text
  ctx.font = "bold 46px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.answerText;
  ctx.textAlign = "left";
  let ansY = aBadgeY + aBadgeHeight + 66;
  for (const line of answerLines) {
    ctx.fillText(line, cardX + 60, ansY);
    ansY += aLineHeight;
  }
  ctx.restore();

  // 6. Bottom Branding & Call to Action Footer
  ctx.save();
  const footerY = height - 200;

  // Subtle separator line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 100, footerY);
  ctx.lineTo(cardX + cardW - 100, footerY);
  ctx.stroke();

  // Link Pill
  const linkPillW = 600;
  const linkPillH = 74;
  const linkPillX = (width - linkPillW) / 2;
  const linkPillY = footerY + 30;

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, linkPillX, linkPillY, linkPillW, linkPillH, 37, true, false);

  ctx.shadowColor = "transparent";
  ctx.font = "bold 34px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "#7E151E";
  ctx.textAlign = "center";
  ctx.fillText(`onuvuti.site/m/${username}`, width / 2, linkPillY + 48);

  // Footer Caption
  ctx.font = "600 30px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.footerColor;
  ctx.fillText(
    "তুমিও তোমার মনের কথা জানতে নিজের লিংক তৈরি করো!",
    width / 2,
    linkPillY + 120
  );
  ctx.restore();
}

/**
 * Exports canvas to PNG blob for sharing or download.
 */
export function exportStoryAsBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export canvas blob"));
    }, "image/png");
  });
}

/**
 * Downloads image directly to device.
 */
export async function downloadStoryImage(
  canvas: HTMLCanvasElement,
  filename = "onuvuti-secret-story.png"
) {
  const blob = await exportStoryAsBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Shares via Web Share API with attached PNG file if supported.
 */
export async function shareStoryImage(
  canvas: HTMLCanvasElement,
  username: string
): Promise<boolean> {
  try {
    const blob = await exportStoryAsBlob(canvas);
    const file = new File([blob], `onuvuti-${username}-reply.png`, {
      type: "image/png",
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "আমার বেনামী বার্তার উত্তর",
        text: `আমাকে যা বলতে চাও কিন্তু বলতে পারোনি, গোপনে বলো: https://onuvuti.site/m/${username}`,
        files: [file],
      });
      return true;
    }

    if (navigator.share) {
      await navigator.share({
        title: "আমার বেনামী বার্তার উত্তর",
        text: `আমাকে যা বলতে চাও কিন্তু বলতে পারোনি, গোপনে বলো: https://onuvuti.site/m/${username}`,
        url: `https://onuvuti.site/m/${username}`,
      });
      return true;
    }

    // Fallback: download
    await downloadStoryImage(canvas, `onuvuti-${username}-reply.png`);
    return false;
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      console.warn("Share failed, falling back to download:", err);
      await downloadStoryImage(canvas, `onuvuti-${username}-reply.png`);
    }
    return false;
  }
}

