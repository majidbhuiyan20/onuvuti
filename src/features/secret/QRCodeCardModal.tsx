"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Copy,
  Check,
  QrCode,
  Share2,
  Sparkles,
} from "lucide-react";

interface QRCodeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
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

export default function QRCodeCardModal({
  isOpen,
  onClose,
  username,
  displayName,
}: QRCodeCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/m/${username}`
      : `https://onuvuti.site/m/${username}`;

  useEffect(() => {
    if (!isOpen || !username) return;

    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load QRCode dynamically
    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(fullUrl, {
        margin: 2,
        width: 520,
        color: {
          dark: "#7E151E",
          light: "#FFFFFF",
        },
      }).then((qrDataUrl) => {
        if (!isMounted || !canvas) return;

        const width = 1080;
        const height = 1350;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Background Parchment Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, "#FCF7EB");
        bgGrad.addColorStop(0.5, "#F7EED8");
        bgGrad.addColorStop(1, "#EFE0C3");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Borders
        ctx.save();
        ctx.strokeStyle = "#7E151E";
        ctx.lineWidth = 4;
        roundRect(ctx, 45, 45, width - 90, height - 90, 28, false, true);

        ctx.strokeStyle = "#C5A059";
        ctx.lineWidth = 1.5;
        roundRect(ctx, 58, 58, width - 116, height - 116, 20, false, true);

        // Corner dots
        const corners = [
          [72, 72],
          [width - 72, 72],
          [72, height - 72],
          [width - 72, height - 72],
        ];
        ctx.fillStyle = "#7E151E";
        corners.forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // 3. Header Top Pill
        ctx.save();
        ctx.textAlign = "center";
        const pillW = 460;
        const pillH = 68;
        const pillX = (width - pillW) / 2;
        const pillY = 120;
        ctx.fillStyle = "#7E151E";
        roundRect(ctx, pillX, pillY, pillW, pillH, 34, true, false);

        ctx.font = "bold 26px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("ONUVUTI • গোপন চিঠি", width / 2, pillY + 44);

        // Subtitle
        ctx.font = "bold 44px 'Kalpurush', 'Hind Siliguri', serif";
        ctx.fillStyle = "#142230";
        ctx.fillText("আমাকে যা বলতে চাও, গোপনে বলো...", width / 2, 260);

        ctx.font = "500 28px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
        ctx.fillStyle = "#7E151E";
        ctx.fillText(`@${username} • ${displayName}`, width / 2, 315);
        ctx.restore();

        // 4. Center QR Code Card
        const cardW = 680;
        const cardH = 680;
        const cardX = (width - cardW) / 2;
        const cardY = 380;

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 35;
        ctx.shadowOffsetY = 16;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = "#C5A059";
        ctx.lineWidth = 3;
        roundRect(ctx, cardX, cardY, cardW, cardH, 36, true, true);
        ctx.restore();

        // Draw QR Image inside card
        const img = new Image();
        img.onload = () => {
          if (!isMounted) return;
          const qrSize = 560;
          const qrX = (width - qrSize) / 2;
          const qrY = cardY + (cardH - qrSize) / 2;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

          // 5. Bottom Instructions Box
          ctx.save();
          ctx.textAlign = "center";
          ctx.font = "bold 30px 'Hind Siliguri', 'SolaimanLipi', sans-serif";
          ctx.fillStyle = "#1F2937";
          ctx.fillText(
            "ক্যামেরা দিয়ে স্ক্যান করলেই গোপনে চিঠি পাঠানো যাবে",
            width / 2,
            1130
          );

          ctx.font = "bold 34px monospace";
          ctx.fillStyle = "#7E151E";
          ctx.fillText(`onuvuti.site/m/${username}`, width / 2, 1185);

          ctx.font = "normal 22px 'Hind Siliguri', sans-serif";
          ctx.fillStyle = "rgba(100, 75, 55, 0.75)";
          ctx.fillText("অনুভূতি • ১০০% গোপন ও নিরাপদ চিঠি", width / 2, 1255);
          ctx.restore();
        };
        img.src = qrDataUrl;
      });
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, username, displayName, fullUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);
    try {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `onuvuti-qr-${username}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }, "image/png");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSharing(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `onuvuti-qr-${username}.png`, {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "আমার বেনামী ইনবক্সের কিউআর কোড",
            text: `আমাকে যেকোনো মনের কথা বা না বলা গোপন অনুভূতি লিখে পাঠাও: ${fullUrl}`,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({
            title: "আমার বেনামী ইনবক্সের কিউআর কোড",
            text: `আমাকে যেকোনো মনের কথা বা না বলা গোপন অনুভূতি লিখে পাঠাও: ${fullUrl}`,
            url: fullUrl,
          });
        } else {
          handleDownload();
        }
      }, "image/png");
    } catch {
      handleDownload();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/70 text-[#7E151E] dark:text-rose-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#142230] dark:text-white">
                ইনবক্সের কিউআর কোড কার্ড
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                বন্ধুদের সাথে শেয়ার বা স্টোরিতে দিতে কিউআর কার্ড ডাউনলোড করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 flex flex-col items-center">
          {/* Canvas Live Preview */}
          <div className="w-full max-w-[260px] aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border-2 border-stone-300 dark:border-stone-700 bg-stone-900 relative">
            <canvas ref={canvasRef} className="w-full h-full object-cover block" />
          </div>

          <span className="text-[10px] text-stone-400 font-medium">
            1080×1350 HD Printable & Shareable Format
          </span>

          {/* Public Link Bar */}
          <div className="w-full p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 truncate">
              {fullUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1 bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold rounded-lg shadow-xs transition inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "কপি হয়েছে" : "কপি"}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7E151E] via-[#941924] to-rose-700 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isDownloading ? "ডাউনলোড হচ্ছে..." : "কিউআর কার্ড ডাউনলোড করুন (HD)"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-stone-200 dark:border-stone-700"
            >
              <Share2 className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
              <span>সোশ্যাল মিডিয়া বা স্টোরিতে শেয়ার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

