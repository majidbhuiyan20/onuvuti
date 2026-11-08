import { StoryTheme, StoryThemeId } from "./types";

export const STORY_THEMES: Record<StoryThemeId, StoryTheme> = {
  crimson: {
    id: "crimson",
    nameBn: "রয়্যাল মোমের সিল",
    tagBn: "রাজকীয় ভেলভেট ও ৩D মোমের সিল",
    category: "royal",
    styleType: "royal_seal",
    bgGradient: ["#2B060B", "#6E1019", "#3A080F"],
    questionBg: "rgba(255, 255, 255, 0.96)",
    questionBorder: "#D4AF37",
    questionText: "#1F2937",
    answerBg: "rgba(255, 246, 240, 0.97)",
    answerBorder: "#E5B54F",
    answerText: "#7E151E",
    badgeBg: "#7E151E",
    badgeText: "#FFFFFF",
    footerColor: "#FDE68A",
    accentColor: "#D4AF37",
    foilBorder: "#D4AF37",
  },
  obsidian_gold: {
    id: "obsidian_gold",
    nameBn: "ব্ল্যাক অবসিডিয়ান ও সোনা",
    tagBn: "২৪K সোনা ও কার্বন ব্ল্যাক",
    category: "royal",
    styleType: "obsidian_gold",
    bgGradient: ["#09090B", "#18181B", "#050505"],
    questionBg: "rgba(24, 24, 27, 0.94)",
    questionBorder: "#F59E0B",
    questionText: "#FDF8F0",
    answerBg: "rgba(10, 10, 12, 0.96)",
    answerBorder: "#D97706",
    answerText: "#FEF3C7",
    badgeBg: "#B45309",
    badgeText: "#FFFBEB",
    footerColor: "#FDE68A",
    accentColor: "#F59E0B",
    foilBorder: "#F59E0B",
  },
  cyber_neon: {
    id: "cyber_neon",
    nameBn: "নিয়ন সাইবার গ্লাস",
    tagBn: "ফ্রস্টেড গ্লাস ও সায়ান নিয়ন",
    category: "modern",
    styleType: "cyber_neon",
    bgGradient: ["#020617", "#0B132B", "#030712"],
    questionBg: "rgba(15, 23, 42, 0.88)",
    questionBorder: "#00F5D4",
    questionText: "#F0FDFA",
    answerBg: "rgba(22, 17, 44, 0.92)",
    answerBorder: "#D946EF",
    answerText: "#FAF5FF",
    badgeBg: "#00F5D4",
    badgeText: "#022C22",
    footerColor: "#5EEAD4",
    accentColor: "#00F5D4",
    foilBorder: "#00F5D4",
  },
  rose_quartz: {
    id: "rose_quartz",
    nameBn: "রোজ কোয়ার্টজ ও শ্যাম্পেন",
    tagBn: "রোমান্টিক গোলাপি ও মুক্তা",
    category: "royal",
    styleType: "rose_quartz",
    bgGradient: ["#4A051E", "#701A38", "#2E0213"],
    questionBg: "rgba(255, 245, 248, 0.96)",
    questionBorder: "#F472B6",
    questionText: "#831843",
    answerBg: "rgba(253, 242, 248, 0.96)",
    answerBorder: "#FB7185",
    answerText: "#9F1239",
    badgeBg: "#BE185D",
    badgeText: "#FFFFFF",
    footerColor: "#FBCFE8",
    accentColor: "#F472B6",
    foilBorder: "#F472B6",
  },
  midnight: {
    id: "midnight",
    nameBn: "মিডনাইট স্টারডাস্ট",
    tagBn: "গ্যালাক্সি নেভি ও সিলভার ফয়েল",
    category: "modern",
    styleType: "midnight_stars",
    bgGradient: ["#090D16", "#141C33", "#080B13"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#93C5FD",
    questionText: "#0F172A",
    answerBg: "rgba(238, 242, 255, 0.96)",
    answerBorder: "#818CF8",
    answerText: "#1E1B4B",
    badgeBg: "#2563EB",
    badgeText: "#FFFFFF",
    footerColor: "#BFDBFE",
    accentColor: "#93C5FD",
    foilBorder: "#93C5FD",
  },
  polaroid: {
    id: "polaroid",
    nameBn: "ভিন্টেজ পোলারয়েড ও টেপ",
    tagBn: "রেট্রো পোলারয়েড স্ন্যাপশট ও টেপ",
    category: "vintage",
    styleType: "polaroid_tape",
    bgGradient: ["#1C1917", "#3B332F", "#171412"],
    questionBg: "#FFFDF9",
    questionBorder: "#E7E5E4",
    questionText: "#292524",
    answerBg: "#FAF6EF",
    answerBorder: "#D6D3D1",
    answerText: "#1C1917",
    badgeBg: "#57534E",
    badgeText: "#FFFFFF",
    footerColor: "#E7E5E4",
    accentColor: "#D6D3D1",
    foilBorder: "#A8A29E",
  },
  dark_academia: {
    id: "dark_academia",
    nameBn: "ডার্ক অ্যাকাডেমিয়া",
    tagBn: "নক্ষত্রমালা ও মহাজাগতিক নীল",
    category: "modern",
    styleType: "dark_academia",
    bgGradient: ["#030712", "#0F172A", "#020617"],
    questionBg: "rgba(30, 41, 59, 0.92)",
    questionBorder: "#38BDF8",
    questionText: "#F8FAFC",
    answerBg: "rgba(15, 23, 42, 0.94)",
    answerBorder: "#7DD3FC",
    answerText: "#E0F2FE",
    badgeBg: "#0284C7",
    badgeText: "#FFFFFF",
    footerColor: "#BAE6FD",
    accentColor: "#38BDF8",
    foilBorder: "#38BDF8",
  },
  vintage: {
    id: "vintage",
    nameBn: "প্রাচীন পার্চমেন্ট ও ডাকটিকিট",
    tagBn: "হস্তনির্মিত কাগজ ও পোস্টমার্ক সিল",
    category: "vintage",
    styleType: "vintage_papyrus",
    bgGradient: ["#82542B", "#A46F3D", "#663D18"],
    questionBg: "rgba(255, 252, 245, 0.96)",
    questionBorder: "#D7C0A6",
    questionText: "#2C1810",
    answerBg: "rgba(247, 240, 226, 0.97)",
    answerBorder: "#BFA07C",
    answerText: "#4A2711",
    badgeBg: "#633B1E",
    badgeText: "#F5EBE0",
    footerColor: "#FDE68A",
    accentColor: "#BFA07C",
    foilBorder: "#D7C0A6",
  },
  emerald: {
    id: "emerald",
    nameBn: "ইম্পেরিয়াল পান্না",
    tagBn: "স্বর্ণলতা ও রাজকীয় পান্না",
    category: "royal",
    styleType: "emerald_botanical",
    bgGradient: ["#022C22", "#0A4835", "#031E17"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#A7F3D0",
    questionText: "#064E3B",
    answerBg: "rgba(236, 253, 245, 0.96)",
    answerBorder: "#34D399",
    answerText: "#064E3B",
    badgeBg: "#059669",
    badgeText: "#FFFFFF",
    footerColor: "#A7F3D0",
    accentColor: "#34D399",
    foilBorder: "#34D399",
  },
  aurora: {
    id: "aurora",
    nameBn: "অরোরা ভায়োলেট গ্লাস",
    tagBn: "রাজকীয় বেগুনি ও মুক্তার আভা",
    category: "modern",
    styleType: "aurora_glass",
    bgGradient: ["#2E0854", "#4A0E80", "#1E0438"],
    questionBg: "rgba(24, 12, 44, 0.90)",
    questionBorder: "#C084FC",
    questionText: "#FAF5FF",
    answerBg: "rgba(40, 16, 75, 0.92)",
    answerBorder: "#E879F9",
    answerText: "#FDF4FF",
    badgeBg: "#9333EA",
    badgeText: "#FFFFFF",
    footerColor: "#E9D5FF",
    accentColor: "#C084FC",
    foilBorder: "#C084FC",
  },
  sunset: {
    id: "sunset",
    nameBn: "গোধূলি আভা ও কোরাল",
    tagBn: "উষ্ণ গোধূলি ও গোল্ডেন আভা",
    category: "vintage",
    styleType: "sunset_glow",
    bgGradient: ["#4C0519", "#9F1239", "#6B21A8"],
    questionBg: "rgba(255, 255, 255, 0.95)",
    questionBorder: "#FED7AA",
    questionText: "#18181B",
    answerBg: "rgba(255, 247, 237, 0.96)",
    answerBorder: "#FDBA74",
    answerText: "#9A3412",
    badgeBg: "#EA580C",
    badgeText: "#FFFFFF",
    footerColor: "#FED7AA",
    accentColor: "#F97316",
    foilBorder: "#FDBA74",
  },
  birthday_royal: {
    id: "birthday_royal",
    nameBn: "রয়্যাল গোল্ড বার্থডে",
    tagBn: "স্বর্ণালী কনফেটি ও রাজকীয় উৎসব",
    category: "festive",
    styleType: "birthday_confetti",
    bgGradient: ["#0F0C20", "#241945", "#0A0814"],
    questionBg: "rgba(255, 255, 255, 0.96)",
    questionBorder: "#FDE68A",
    questionText: "#1E1B4B",
    answerBg: "rgba(254, 243, 199, 0.97)",
    answerBorder: "#F59E0B",
    answerText: "#78350F",
    badgeBg: "#B45309",
    badgeText: "#FFFFFF",
    footerColor: "#FDE68A",
    accentColor: "#F59E0B",
    foilBorder: "#FDE68A",
  },
  birthday_cake: {
    id: "birthday_cake",
    nameBn: "বার্থডে কনফেটি ও বেলুন",
    tagBn: "রঙিন বার্থডে সেলিব্রেশন",
    category: "festive",
    styleType: "birthday_confetti",
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
    accentColor: "#E879F9",
    foilBorder: "#F5D0FE",
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
 * Strips unicode emojis from text for 100% strict adherence to NO EMOJIS rule.
 */
function cleanTextOfEmojis(text: string): string {
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu,
      ""
    )
    .trim();
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
  const clean = cleanTextOfEmojis(text);
  const words = clean.split(/\s+/);
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
 * Draws scattered sparkling 4-point star glyphs and glowing stardust particles.
 */
function drawStarsAndSparkles(
  ctx: CanvasRenderingContext2D,
  count: number,
  width: number,
  height: number,
  color = "#FFFFFF",
  alpha = 0.35
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Predictable pseudo-random distribution
  const seeds = [
    [0.12, 0.08, 6, 0.4],
    [0.85, 0.12, 10, 0.6],
    [0.92, 0.28, 5, 0.3],
    [0.08, 0.42, 8, 0.5],
    [0.94, 0.58, 7, 0.4],
    [0.15, 0.72, 9, 0.55],
    [0.88, 0.85, 11, 0.65],
    [0.06, 0.91, 5, 0.3],
    [0.5, 0.05, 7, 0.4],
    [0.35, 0.95, 6, 0.35],
    [0.78, 0.45, 8, 0.5],
    [0.22, 0.26, 4, 0.25],
  ];

  for (let i = 0; i < Math.min(count, seeds.length); i++) {
    const [rx, ry, size, a] = seeds[i];
    const cx = rx * width;
    const cy = ry * height;

    ctx.globalAlpha = a * alpha;
    // Draw 4-point sparkle star
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx, cy + size);
    ctx.moveTo(cx - size, cy);
    ctx.lineTo(cx + size, cy);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center bright dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws Victorian/Mughal corner filigree in gold or silver.
 */
function drawCornerFlourish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.4, size * 0.1, size * 0.6, size * 0.6);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(size * 0.6, size * 0.6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws realistic translucent Washi Tape strip across the top of a card.
 */
function drawWashiTape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angleDeg = -2,
  color = "rgba(255, 245, 225, 0.65)"
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  // Soft shadow under tape
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1;

  // Tape body with slightly irregular ends
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  // Subtle tape fibers
  ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 10, 0);
  ctx.lineTo(w / 2 - 10, 0);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws realistic 3D Wax Seal Stamp medallion on the card corner.
 */
function drawWaxSealStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sealBg: string,
  rimBorder: string,
  emblemColor: string
) {
  ctx.save();

  // 1. Deep natural drop shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 10;

  // 2. Outer molten wax droplet ring
  ctx.fillStyle = sealBg;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "transparent";

  // 3. Specular upper highlight
  const highlightGrad = ctx.createLinearGradient(
    cx,
    cy - radius,
    cx,
    cy + radius
  );
  highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  highlightGrad.addColorStop(0.5, "transparent");
  highlightGrad.addColorStop(1, "rgba(0, 0, 0, 0.35)");
  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 4. Concentric engraved coin rim
  ctx.strokeStyle = rimBorder;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  // 5. Debossed inner coin basin
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // 6. 3D Embossed Seal Emblem (Heart)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = emblemColor;
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  const s = radius * 0.35;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.8);
  ctx.bezierCurveTo(-s, -s * 0.2, -s, -s * 0.8, 0, -s * 0.4);
  ctx.bezierCurveTo(s, -s * 0.8, s, -s * 0.2, 0, s * 0.8);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Draws futuristic Glowing Cyber Corner Brackets.
 */
function drawCyberCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(x + size, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(x + w - size, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + size);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(x, y + h - size);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + size, y + h);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(x + w - size, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - size);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws vintage postage stamp with postmark cancellation lines.
 */
function drawVintageStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  stampBorder: string,
  postmarkColor: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((3 * Math.PI) / 180);

  // Stamp paper
  ctx.fillStyle = "rgba(255, 252, 240, 0.9)";
  ctx.strokeStyle = stampBorder;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  roundRect(ctx, 0, 0, w, h, 6, true, true);
  ctx.setLineDash([]);

  // Stamp caption
  ctx.font = "bold 18px 'Hind Siliguri', sans-serif";
  ctx.fillStyle = "#8C5922";
  ctx.textAlign = "center";
  ctx.fillText("গোপন ডাক", w / 2, h / 2 - 4);
  ctx.font = "bold 14px monospace";
  ctx.fillText("2026", w / 2, h / 2 + 18);

  // Circular postmark cancellation
  ctx.strokeStyle = postmarkColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w * 0.9, h * 0.5, 38, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w * 0.9, h * 0.5, 30, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
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
  const style = theme.styleType || "royal_seal";

  // 1. Draw Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(0.5, theme.bgGradient[1]);
  bgGrad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Theme-Specific Background Art & Ornaments
  if (style === "royal_seal" || style === "obsidian_gold") {
    // Elegant Outer Gold Foil Inlay Frame
    ctx.save();
    ctx.strokeStyle =
      style === "obsidian_gold"
        ? "rgba(245, 158, 11, 0.45)"
        : "rgba(212, 175, 55, 0.45)";
    ctx.lineWidth = 3;
    roundRect(ctx, 40, 40, width - 80, height - 80, 40, false, true);

    ctx.strokeStyle =
      style === "obsidian_gold"
        ? "rgba(245, 158, 11, 0.25)"
        : "rgba(212, 175, 55, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    roundRect(ctx, 54, 54, width - 108, height - 108, 30, false, true);
    ctx.setLineDash([]);

    // 4 Corner Flourishes
    const cornerCol =
      style === "obsidian_gold" ? "#F59E0B" : "#D4AF37";
    drawCornerFlourish(ctx, 70, 70, 50, 0, cornerCol);
    drawCornerFlourish(ctx, width - 70, 70, 50, 90, cornerCol);
    drawCornerFlourish(ctx, width - 70, height - 70, 50, 180, cornerCol);
    drawCornerFlourish(ctx, 70, height - 70, 50, 270, cornerCol);
    ctx.restore();

    drawStarsAndSparkles(ctx, 10, width, height, "#FFD700", 0.4);
  } else if (style === "cyber_neon") {
    // Cyber Grid lines in background
    ctx.save();
    ctx.strokeStyle = "rgba(0, 245, 212, 0.08)";
    ctx.lineWidth = 1;
    for (let y = 100; y < height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    drawStarsAndSparkles(ctx, 12, width, height, "#00F5D4", 0.6);
    ctx.restore();
  } else if (style === "dark_academia" || style === "midnight_stars") {
    // Deep Constellation Stars & Stardust
    drawStarsAndSparkles(ctx, 12, width, height, "#93C5FD", 0.6);
  } else if (style === "rose_quartz") {
    // Shimmering Rose Gold Diamond Sparkles
    drawStarsAndSparkles(ctx, 12, width, height, "#FBCFE8", 0.5);
  } else if (style === "birthday_confetti") {
    // Festive floating confetti
    ctx.save();
    const confettiColors = ["#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#FDE047"];
    for (let i = 0; i < 35; i++) {
      const cx = (i * 137) % width;
      const cy = (i * 241) % height;
      ctx.fillStyle = confettiColors[i % confettiColors.length];
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, (i % 4) + 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Top Header Badge Pill
  ctx.save();
  ctx.textAlign = "center";
  const headerPillW = 540;
  const headerPillH = 72;
  const headerPillX = (width - headerPillW) / 2;
  const headerPillY = 150;

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.strokeStyle =
    theme.foilBorder || theme.accentColor || "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2.5;
  roundRect(ctx, headerPillX, headerPillY, headerPillW, headerPillH, 36, true, true);

  ctx.font = "bold 28px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("ONUVUTI • গোপন চিঠি ও উত্তর", width / 2, headerPillY + 45);

  // Subtitle
  ctx.font = "600 36px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.fillText(
    `${cleanTextOfEmojis(displayName)}-এর কাছে পাঠানো বেনামী চিঠি`,
    width / 2,
    headerPillY + 120
  );
  ctx.restore();

  // 4. Question Box (Anonymous Message)
  const cardW = 900;
  const cardX = (width - cardW) / 2;
  let currentY = 370;

  // Prepare question text
  ctx.font = "bold 44px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  const cleanQ = cleanTextOfEmojis(questionContent);
  const questionLines = wrapText(ctx, cleanQ, cardW - 130);
  const qLineHeight = 62;
  const qBoxPadding = 56;
  const qBadgeHeight = 56;
  const qBoxH =
    qBoxPadding * 2 + qBadgeHeight + 32 + questionLines.length * qLineHeight;

  // Deep Shadow for question card
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 22;

  ctx.fillStyle = theme.questionBg;
  ctx.strokeStyle = theme.questionBorder;
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, currentY, cardW, qBoxH, 44, true, true);
  ctx.restore();

  // Draw Unique Style Extras for Question Card
  if (style === "royal_seal") {
    // 3D Wax Seal Stamp Medallion on Top-Right Corner
    drawWaxSealStamp(
      ctx,
      cardX + cardW - 70,
      currentY + 54,
      38,
      "#800f1a",
      "#D4AF37",
      "#FDE68A"
    );
  } else if (style === "polaroid_tape") {
    // Translucent Washi Tape at Top-Center
    drawWashiTape(ctx, cardX + cardW / 2 - 100, currentY - 22, 200, 44, -3);
  } else if (style === "cyber_neon") {
    // Glowing Cyber Corner Brackets
    drawCyberCornerBrackets(ctx, cardX, currentY, cardW, qBoxH, 32, "#00F5D4");
  } else if (style === "vintage_papyrus") {
    // Vintage Stamp in Top-Right
    drawVintageStamp(ctx, cardX + cardW - 130, currentY + 20, 95, 75, "#BFA07C", "rgba(100, 50, 20, 0.4)");
  }

  // Question Badge Pill
  ctx.save();
  const qBadgeW = 390;
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
  let textY = qBadgeY + qBadgeHeight + 66;
  for (const line of questionLines) {
    ctx.fillText(line, cardX + 60, textY);
    textY += qLineHeight;
  }
  ctx.restore();

  currentY += qBoxH + 54;

  // 5. Answer Box (User's Reply)
  const rawReply = replyText.trim() || "ধন্যবাদ আপনার সুন্দর বার্তার জন্য!";
  const safeReply = cleanTextOfEmojis(rawReply);
  ctx.font = "bold 46px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  const answerLines = wrapText(ctx, safeReply, cardW - 130);
  const aLineHeight = 64;
  const aBoxPadding = 56;
  const aBadgeHeight = 56;
  const aBoxH =
    aBoxPadding * 2 + aBadgeHeight + 32 + answerLines.length * aLineHeight;

  // Shadow for answer card
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 22;

  ctx.fillStyle = theme.answerBg;
  ctx.strokeStyle = theme.answerBorder;
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, currentY, cardW, aBoxH, 44, true, true);
  ctx.restore();

  // Style Extra for Answer Card
  if (style === "cyber_neon") {
    drawCyberCornerBrackets(ctx, cardX, currentY, cardW, aBoxH, 32, "#D946EF");
  } else if (style === "polaroid_tape") {
    drawWashiTape(ctx, cardX + 50, currentY - 20, 150, 40, 2);
  }

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
    `${cleanTextOfEmojis(displayName)}-এর উত্তর`,
    aBadgeX + aBadgeW / 2,
    aBadgeY + 36
  );

  // Render answer text
  ctx.font = "bold 46px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.answerText;
  ctx.textAlign = "left";
  let ansY = aBadgeY + aBadgeHeight + 68;
  for (const line of answerLines) {
    ctx.fillText(line, cardX + 60, ansY);
    ansY += aLineHeight;
  }
  ctx.restore();

  // 6. Bottom Branding & Instagram Link Sticker
  ctx.save();
  const footerY = height - 210;

  // Subtle separator line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 100, footerY);
  ctx.lineTo(cardX + cardW - 100, footerY);
  ctx.stroke();

  // Instagram Official-style Link Sticker Mock
  const linkPillW = 620;
  const linkPillH = 78;
  const linkPillX = (width - linkPillW) / 2;
  const linkPillY = footerY + 28;

  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, linkPillX, linkPillY, linkPillW, linkPillH, 39, true, false);

  // Link chain icon symbol
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "#7E151E";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(linkPillX + 54, linkPillY + 39, 12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = "bold 34px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "#7E151E";
  ctx.textAlign = "center";
  ctx.fillText(`onuvuti.site/m/${username}`, width / 2 + 16, linkPillY + 50);

  // Footer Caption
  ctx.font = "600 30px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.footerColor;
  ctx.fillText(
    "তুমিও তোমার মনের কথা জানতে নিজের লিংক তৈরি করো!",
    width / 2,
    linkPillY + 126
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

export interface StickerCardRenderOptions {
  canvas: HTMLCanvasElement;
  displayName: string;
  username: string;
  promptText?: string;
  themeId?: StoryThemeId;
}

/**
 * Renders high-resolution 1080x1920 NGL-Style Instagram/Facebook Story Sticker Card.
 */
export async function renderStickerCardToCanvas(
  options: StickerCardRenderOptions
) {
  const {
    canvas,
    displayName,
    username,
    promptText = "আমাকে যেকোনো মনের কথা বা না বলা গোপন অনুভূতি লিখে পাঠাও...",
    themeId = "crimson",
  } = options;

  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const theme = STORY_THEMES[themeId] || STORY_THEMES.crimson;
  const style = theme.styleType || "royal_seal";

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(0.5, theme.bgGradient[1]);
  bgGrad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Theme-Specific Background Accents
  if (style === "royal_seal" || style === "obsidian_gold") {
    ctx.save();
    ctx.strokeStyle =
      style === "obsidian_gold"
        ? "rgba(245, 158, 11, 0.4)"
        : "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 3;
    roundRect(ctx, 40, 40, width - 80, height - 80, 40, false, true);

    const cornerCol =
      style === "obsidian_gold" ? "#F59E0B" : "#D4AF37";
    drawCornerFlourish(ctx, 70, 70, 50, 0, cornerCol);
    drawCornerFlourish(ctx, width - 70, 70, 50, 90, cornerCol);
    drawCornerFlourish(ctx, width - 70, height - 70, 50, 180, cornerCol);
    drawCornerFlourish(ctx, 70, height - 70, 50, 270, cornerCol);
    ctx.restore();

    drawStarsAndSparkles(ctx, 10, width, height, "#FFD700", 0.4);
  } else if (style === "cyber_neon") {
    drawStarsAndSparkles(ctx, 12, width, height, "#00F5D4", 0.55);
  } else if (style === "dark_academia" || style === "midnight_stars") {
    drawStarsAndSparkles(ctx, 12, width, height, "#93C5FD", 0.55);
  } else if (style === "rose_quartz") {
    drawStarsAndSparkles(ctx, 12, width, height, "#FBCFE8", 0.45);
  }

  // 3. Top Header Glass Pill
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
  ctx.strokeStyle =
    theme.foilBorder || theme.accentColor || "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2.5;
  const headerPillW = 540;
  const headerPillH = 74;
  const headerPillX = (width - headerPillW) / 2;
  const headerPillY = 160;
  roundRect(ctx, headerPillX, headerPillY, headerPillW, headerPillH, 37, true, true);

  ctx.font = "bold 30px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("ONUVUTI • গোপন বার্তা", width / 2, headerPillY + 47);

  // Subtitle
  ctx.font = "600 38px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fillText("আমাকে যা বলতে চাও, গোপনে বলো...", width / 2, headerPillY + 124);
  ctx.restore();

  // 4. Central NGL-Style Story Sticker Card
  const cardW = 920;
  const cardX = (width - cardW) / 2;
  const cardY = 440;

  ctx.font = "bold 50px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  const cleanPrompt = cleanTextOfEmojis(promptText);
  const promptLines = wrapText(ctx, cleanPrompt, cardW - 140);
  const pLineHeight = 68;
  const pBadgeH = 88;
  const mockTapH = 92;
  const cardPaddingTop = 40;
  const cardPaddingBottom = 45;
  const cardH =
    cardPaddingTop +
    pBadgeH +
    50 +
    promptLines.length * pLineHeight +
    50 +
    mockTapH +
    cardPaddingBottom;

  // Deep Soft Shadow for 3D Floating Sticker look
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;

  ctx.fillStyle = theme.questionBg;
  ctx.strokeStyle = theme.questionBorder;
  ctx.lineWidth = 4;
  roundRect(ctx, cardX, cardY, cardW, cardH, 52, true, true);
  ctx.restore();

  // Extra Details per Style
  if (style === "royal_seal") {
    drawWaxSealStamp(
      ctx,
      cardX + cardW - 75,
      cardY + 54,
      42,
      "#800f1a",
      "#D4AF37",
      "#FDE68A"
    );
  } else if (style === "polaroid_tape") {
    drawWashiTape(ctx, cardX + cardW / 2 - 110, cardY - 22, 220, 44, -2.5);
  } else if (style === "cyber_neon") {
    drawCyberCornerBrackets(ctx, cardX, cardY, cardW, cardH, 36, "#00F5D4");
  }

  // Top Sticker Header Pill (User avatar + badge)
  ctx.save();
  const topBadgeW = cardW - 80;
  const topBadgeH = 88;
  const topBadgeX = cardX + 40;
  const topBadgeY = cardY + cardPaddingTop;
  ctx.fillStyle = theme.badgeBg;
  ctx.strokeStyle = "transparent";
  roundRect(ctx, topBadgeX, topBadgeY, topBadgeW, topBadgeH, 32, true, false);

  // User handle inside badge
  ctx.font = "bold 34px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.badgeText;
  ctx.textAlign = "center";
  ctx.fillText(
    `@${username} • SEND ANONYMOUS MESSAGE`,
    topBadgeX + topBadgeW / 2,
    topBadgeY + 54
  );

  // Sticker Message / Prompt Text
  ctx.font = "bold 52px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.questionText;
  ctx.textAlign = "center";
  let lineY = topBadgeY + topBadgeH + 74;
  for (const line of promptLines) {
    ctx.fillText(line, width / 2, lineY);
    lineY += pLineHeight;
  }

  // Mock Interactive Tap / Link Button inside sticker
  const tapW = cardW - 120;
  const tapH = 88;
  const tapX = cardX + 60;
  const tapY = lineY + 16;
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.lineWidth = 2;
  roundRect(ctx, tapX, tapY, tapW, tapH, 44, true, true);

  ctx.font = "bold 34px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.questionText;
  ctx.textAlign = "center";
  ctx.fillText("লিংক বায়োতে / স্টোরি লিংকে ট্যাপ করুন", width / 2, tapY + 55);
  ctx.restore();

  // 5. Instruction & Link Guide Box below the sticker
  const guideY = cardY + cardH + 60;
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2.5;
  const guideW = 860;
  const guideH = 190;
  const guideX = (width - guideW) / 2;
  roundRect(ctx, guideX, guideY, guideW, guideH, 36, true, true);

  ctx.textAlign = "center";
  ctx.font = "600 30px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillText(
    "স্টোরিতে ছবিটি দিয়ে নিচের লিংকটি Link স্টিকারে দিন:",
    width / 2,
    guideY + 64
  );

  ctx.font = "bold 38px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`onuvuti.site/m/${username}`, width / 2, guideY + 134);
  ctx.restore();

  // 6. Bottom Brand Footer
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "600 32px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = theme.footerColor;
  ctx.fillText("অনুভূতি • ১০০% গোপন ও নিরাপদ চিঠি", width / 2, height - 120);

  ctx.font = "normal 24px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillText("onuvuti.site/m", width / 2, height - 76);
  ctx.restore();
}

/**
 * Downloads NGL-style Sticker Card directly to device.
 */
export async function downloadStickerImage(
  canvas: HTMLCanvasElement,
  username: string
) {
  const blob = await exportStoryAsBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `onuvuti-sticker-${username}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Shares NGL-style Sticker Card via native mobile share sheet.
 */
export async function shareStickerImage(
  canvas: HTMLCanvasElement,
  username: string
): Promise<boolean> {
  try {
    const blob = await exportStoryAsBlob(canvas);
    const file = new File([blob], `onuvuti-sticker-${username}.png`, {
      type: "image/png",
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "আমার বেনামী বার্তার স্টোরি স্টিকার",
        text: `আমাকে যেকোনো মনের কথা বা না বলা গোপন অনুভূতি লিখে পাঠাও... https://onuvuti.site/m/${username}`,
        files: [file],
      });
      return true;
    }

    if (navigator.share) {
      await navigator.share({
        title: "আমার বেনামী বার্তার স্টোরি স্টিকার",
        text: `আমাকে যেকোনো মনের কথা বা না বলা গোপন অনুভূতি লিখে পাঠাও... https://onuvuti.site/m/${username}`,
        url: `https://onuvuti.site/m/${username}`,
      });
      return true;
    }

    await downloadStickerImage(canvas, username);
    return false;
  } catch (err) {
    if ((err as Error).name !== "AbortError") {
      await downloadStickerImage(canvas, username);
    }
    return false;
  }
}
