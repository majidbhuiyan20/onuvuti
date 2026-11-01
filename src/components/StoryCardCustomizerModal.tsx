"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Download,
  Check,
  Smartphone,
  Square,
  Sparkles,
  Type,
  RotateCcw,
} from "lucide-react";

export type CardTheme = "classic" | "midnight" | "vintage";
export type CardFormat = "story" | "feed"; // "story" = 9:16 (1080x1920), "feed" = 4:5 (1080x1350)

interface StoryCardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  storyExcerpt?: string;
  storyCategory?: string;
  storyAuthor?: string;
  confessionIdBn?: string;
}

interface ThemeConfig {
  nameBn: string;
  descBn: string;
  icon: string;
  bgFill: string;
  outerBorder: string;
  innerBorder: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  titleColor: string;
  dividerColor: string;
  quoteColor: string;
  authorColor: string;
  footerBg: string;
  footerBorder: string;
  domainColor: string;
  taglineColor: string;
}

const THEMES: Record<CardTheme, ThemeConfig> = {
  classic: {
    nameBn: "ক্ল্যাসিক ক্রিম",
    descBn: "সম্পাদকীয় ক্রিম ও সোনালী ফ্রেম",
    icon: "📜",
    bgFill: "#FDF8F2",
    outerBorder: "#80131E",
    innerBorder: "#C59B27",
    badgeBg: "#FAF4E6",
    badgeBorder: "#C59B27",
    badgeText: "#80131E",
    titleColor: "#142230",
    dividerColor: "#C59B27",
    quoteColor: "#334155",
    authorColor: "#80131E",
    footerBg: "#FAF4E6",
    footerBorder: "#C59B27",
    domainColor: "#80131E",
    taglineColor: "#57534E",
  },
  midnight: {
    nameBn: "রেইনি মিডনাইট",
    descBn: "ডার্ক মোড, গভীর রজনী ও রোমান্টিক আভা",
    icon: "🌧️",
    bgFill: "#0A0F1D",
    outerBorder: "#E11D48",
    innerBorder: "#FBBF24",
    badgeBg: "rgba(225, 29, 72, 0.18)",
    badgeBorder: "#E11D48",
    badgeText: "#FDA4AF",
    titleColor: "#FFFFFF",
    dividerColor: "#F43F5E",
    quoteColor: "#E2E8F0",
    authorColor: "#FDA4AF",
    footerBg: "#0F172A",
    footerBorder: "#334155",
    domainColor: "#FDA4AF",
    taglineColor: "#94A3B8",
  },
  vintage: {
    nameBn: "ভিন্টেজ পেপার",
    descBn: "পুরনো চিঠির অনুভূতি ও প্রাচীন সেপিয়া",
    icon: "✉️",
    bgFill: "#F4EBD9",
    outerBorder: "#5C2C16",
    innerBorder: "#B48220",
    badgeBg: "#E8DAC2",
    badgeBorder: "#B48220",
    badgeText: "#5C2C16",
    titleColor: "#26140D",
    dividerColor: "#B48220",
    quoteColor: "#42281D",
    authorColor: "#781D22",
    footerBg: "#E8DAC2",
    footerBorder: "#B48220",
    domainColor: "#5C2C16",
    taglineColor: "#6B5344",
  },
};

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
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

export default function StoryCardCustomizerModal({
  isOpen,
  onClose,
  storyId,
  storyTitle,
  storyExcerpt = "",
  storyCategory = "অনুভূতি",
  storyAuthor = "নাম প্রকাশে অনিচ্ছুক",
  confessionIdBn,
}: StoryCardCustomizerModalProps) {
  const [theme, setTheme] = useState<CardTheme>("classic");
  const [format, setFormat] = useState<CardFormat>("story");
  const initialQuote = storyExcerpt || storyTitle;
  const [quoteText, setQuoteText] = useState(initialQuote);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render canvas based on current state
  const renderCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (typeof window === "undefined") return null;

    // Ensure fonts are ready
    if (document.fonts) {
      await document.fonts.ready;
    }

    const canvas = canvasRef.current || document.createElement("canvas");
    const isStory = format === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1350;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const t = THEMES[theme];

    // 1. Background Fill
    if (theme === "midnight") {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#0B1120");
      grad.addColorStop(0.5, "#070C18");
      grad.addColorStop(1, "#02040A");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric starry dust
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      for (let i = 0; i < 45; i++) {
        const x = (i * 97) % width;
        const y = (i * 123) % height;
        const radius = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = t.bgFill;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Double Decorative Frames
    const padOuter = 44;
    ctx.strokeStyle = t.outerBorder;
    ctx.lineWidth = 6;
    ctx.strokeRect(padOuter, padOuter, width - padOuter * 2, height - padOuter * 2);

    const padInner = 60;
    ctx.strokeStyle = t.innerBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(padInner, padInner, width - padInner * 2, height - padInner * 2);

    // 3. Top Category Pill
    const badgeText = confessionIdBn
      ? `${storyCategory} • ${confessionIdBn}`
      : storyCategory;

    const topY = isStory ? 200 : 110;
    const badgeH = isStory ? 60 : 54;
    const badgeW = 440;

    ctx.fillStyle = t.badgeBg;
    ctx.fillRect(110, topY, badgeW, badgeH);
    ctx.strokeStyle = t.badgeBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(110, topY, badgeW, badgeH);

    ctx.fillStyle = t.badgeText;
    ctx.font = "bold 26px Kalpurush, sans-serif";
    ctx.fillText(badgeText, 136, topY + (isStory ? 40 : 36));

    // 4. Story Title
    let cursorY = topY + (isStory ? 140 : 115);
    ctx.fillStyle = t.titleColor;
    ctx.font = "bold 44px Kalpurush, sans-serif";
    const titleLines = wrapCanvasText(ctx, storyTitle, 860).slice(0, 3);
    for (const line of titleLines) {
      ctx.fillText(line, 110, cursorY);
      cursorY += 62;
    }

    // 5. Decorative Divider Line
    cursorY += 15;
    ctx.fillStyle = t.dividerColor;
    ctx.fillRect(110, cursorY, 150, 5);
    cursorY += isStory ? 80 : 65;

    // 6. Quote / Excerpt Body
    const cleanQuote = quoteText.trim() ? `“${quoteText.trim()}”` : `“${storyTitle}”`;
    ctx.fillStyle = t.quoteColor;
    ctx.font = isStory ? "36px Kalpurush, sans-serif" : "34px Kalpurush, sans-serif";
    const maxQuoteLines = isStory ? 13 : 7;
    const quoteLines = wrapCanvasText(ctx, cleanQuote, 860).slice(0, maxQuoteLines);
    const lineHeight = isStory ? 58 : 52;
    for (const line of quoteLines) {
      ctx.fillText(line, 110, cursorY);
      cursorY += lineHeight;
    }

    // 7. Author Name
    cursorY += isStory ? 40 : 30;
    ctx.fillStyle = t.authorColor;
    ctx.font = "bold 30px Kalpurush, sans-serif";
    ctx.fillText(`— ${storyAuthor}`, 110, cursorY);

    // 8. Footer Bar with Logo & Website URL
    const footerH = isStory ? 160 : 140;
    const footerY = isStory ? 1670 : 1150;
    ctx.fillStyle = t.footerBg;
    ctx.fillRect(62, footerY, width - 124, footerH);
    ctx.strokeStyle = t.footerBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, footerY, width - 124, footerH);

    // Render White Logo Badge inside Footer
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => resolve();
        logoImg.src = "/images/Onuvuti-Publications-Logo.png";
      });

      if (logoImg.width > 0) {
        // Draw white badge behind logo
        const badgeBoxX = 96;
        const badgeBoxY = footerY + (isStory ? 38 : 28);
        const logoTargetH = isStory ? 84 : 80;
        const logoTargetW = (logoImg.width / logoImg.height) * logoTargetH;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(badgeBoxX - 12, badgeBoxY - 8, logoTargetW + 24, logoTargetH + 16, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.drawImage(logoImg, badgeBoxX, badgeBoxY, logoTargetW, logoTargetH);
      }
    } catch {
      // ignore logo error
    }

    // Footer Text
    ctx.fillStyle = t.domainColor;
    ctx.font = "bold 28px Kalpurush, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("পড়ুন: www.onuvuti.site", width - 100, footerY + (isStory ? 70 : 60));

    ctx.fillStyle = t.taglineColor;
    ctx.font = "22px Kalpurush, sans-serif";
    ctx.fillText(
      "রোমান্টিক গল্প, ক্রাশ কনফেশন ও না বলা কথা",
      width - 100,
      footerY + (isStory ? 112 : 98)
    );
    ctx.textAlign = "left";

    return canvas;
  }, [format, theme, quoteText, storyTitle, storyCategory, confessionIdBn, storyAuthor]);

  // Update live preview whenever settings change
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    renderCanvas().then((canvas) => {
      if (!isCancelled && canvas) {
        setPreviewUrl(canvas.toDataURL("image/png"));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, renderCanvas]);

  // Handle Download Action
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const canvas = await renderCanvas();
      if (!canvas) return;

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const cleanFormat = format === "story" ? "Instagram-Story-9x16" : "Feed-Post-4x5";
      link.download = `Onuvuti-${cleanFormat}-${theme}-${storyId}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="max-w-4xl w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-4">
        {/* Header Bar */}
        <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#80131E] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white">
                স্টোরি কার্ড কাস্টমাইজার (Story Poster v2)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                ইনস্টাগ্রাম ও ফেসবুক স্টোরি বা স্ট্যাটাসে দেওয়ার জন্য নিখুঁত সাইজের পোস্টার তৈরি করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Preview, Right Controls */}
        <div className="p-5 sm:p-7 grid md:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Live Visual Card Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-stone-100 dark:bg-[#0B0F17] rounded-2xl p-4 border border-stone-200 dark:border-stone-800/80">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mb-2">
              লাইভ প্রিভিউ ({format === "story" ? "৯:১৬ স্টোরি" : "৪:৫ পোস্ট"})
            </span>

            <div className="w-full flex items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Story Card Preview"
                  className={`rounded-xl shadow-lg border border-black/10 dark:border-white/10 object-contain max-h-[460px] ${
                    format === "story" ? "aspect-[9/16]" : "aspect-[4/5]"
                  }`}
                />
              ) : (
                <div className="w-48 h-80 rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center text-xs text-stone-400 font-bold">
                  কার্ড লোড হচ্ছে...
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customizer Controls */}
          <div className="md:col-span-7 space-y-5">
            {/* 1. Aspect Ratio / Format Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                সাইজ ও ফরম্যাট নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormat("story")}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    format === "story"
                      ? "border-[#80131E] dark:border-rose-500 bg-[#80131E]/5 dark:bg-rose-950/20 text-[#80131E] dark:text-rose-300 font-extrabold shadow-xs"
                      : "border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1A2234] text-stone-600 dark:text-stone-300 font-medium hover:border-stone-300"
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">৯:১৬ স্টোরি সাইজ</div>
                    <div className="text-[10px] opacity-80">ইনস্টাগ্রাম, ফেসবুক ও স্ট্যাটাস</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("feed")}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    format === "feed"
                      ? "border-[#80131E] dark:border-rose-500 bg-[#80131E]/5 dark:bg-rose-950/20 text-[#80131E] dark:text-rose-300 font-extrabold shadow-xs"
                      : "border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1A2234] text-stone-600 dark:text-stone-300 font-medium hover:border-stone-300"
                  }`}
                >
                  <Square className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">৪:৫ ফিড পোস্ট</div>
                    <div className="text-[10px] opacity-80">টাইমলাইন ও ফটো পোস্ট</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                ব্যাকগ্রাউন্ড থিম নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(THEMES) as CardTheme[]).map((tKey) => {
                  const t = THEMES[tKey];
                  const isActive = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setTheme(tKey)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                        isActive
                          ? "border-[#80131E] dark:border-rose-500 bg-[#80131E]/10 dark:bg-rose-950/30 text-[#80131E] dark:text-rose-300 font-extrabold shadow-xs"
                          : "border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1A2234] text-stone-700 dark:text-stone-300 hover:border-stone-300"
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span className="text-xs font-bold leading-tight">{t.nameBn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Quote / Excerpt Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
                  <span>পোস্টারের লেখা পরিবর্তন করুন (ঐচ্ছিক):</span>
                </label>
                {quoteText !== initialQuote && (
                  <button
                    type="button"
                    onClick={() => setQuoteText(initialQuote)}
                    className="text-[11px] font-bold text-[#80131E] dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>রিসেট</span>
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                maxLength={450}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="গল্পের যে অংশটি বা কোটটি পোস্টারে রাখতে চান তা লিখুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#1A2234] border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 leading-relaxed"
              />
              <p className="text-[11px] text-stone-400 dark:text-stone-500">
                পরামর্শ: ৪-৬ লাইনের সুন্দর ও আবেগঘন অংশ পোস্টারে সবচেয়ে ভালো দেখায়।
              </p>
            </div>

            {/* Download Button + Branding Note */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownload}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#80131E] hover:bg-[#630d16] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md disabled:opacity-60 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloading
                    ? "পোস্টার তৈরি হচ্ছে..."
                    : `এইচডি পোস্টার ডাউনলোড (${format === "story" ? "৯:১৬" : "৪:৫"})`}
                </span>
              </button>

              {downloadSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
                  <Check className="w-4 h-4" />
                  <span>পোস্টারটি সফলভাবে আপনার ডিভাইসে ডাউনলোড হয়েছে!</span>
                </div>
              )}

              <p className="text-center text-[11px] text-stone-500 dark:text-stone-400">
                ✨ পোস্টারের নিচে অনুভূতি পাবলিকেশন্সের লোগো ও ওয়েবসাইটের নাম যুক্ত থাকবে।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
