"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ImageDown,
  MessageCircle,
  QrCode,
  Send,
  Share2,
} from "lucide-react";
import { nativeShare, shareLinks } from "../share";

interface ShareBarProps {
  url: string;
  text: string;
  tone?: "light" | "dark";
  /** When provided, shows a "save as image" button. */
  onSaveImage?: () => Promise<void>;
}

export default function ShareBar({ url, text, tone = "light", onSaveImage }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qr, setQr] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!showQr || qr) return;
    let cancelled = false;
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#3b0a14", light: "#ffffff" } }).then(
        (data) => !cancelled && setQr(data)
      )
    );
    return () => {
      cancelled = true;
    };
  }, [showQr, qr, url]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const saveImage = async () => {
    if (!onSaveImage) return;
    setSaving(true);
    try {
      await onSaveImage();
    } finally {
      setSaving(false);
    }
  };

  const base =
    "inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer";
  const neutral =
    tone === "dark"
      ? "bg-white/10 hover:bg-white/20 text-stone-100 border border-white/15"
      : "bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <a
          href={shareLinks.whatsapp(url, text)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-emerald-600 hover:bg-emerald-700 text-white`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
        <a
          href={shareLinks.telegram(url, text)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-sky-600 hover:bg-sky-700 text-white`}
        >
          <Send className="w-4 h-4" />
          <span>Telegram</span>
        </a>
        <a
          href={shareLinks.facebook(url)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-blue-600 hover:bg-blue-700 text-white`}
        >
          <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-white/25 text-[11px] font-black leading-none">f</span>
          <span>Facebook</span>
        </a>
        <button type="button" onClick={copy} className={`${base} ${neutral}`}>
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span>কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>লিঙ্ক কপি</span>
            </>
          )}
        </button>
        <button type="button" onClick={() => setShowQr((v) => !v)} className={`${base} ${neutral}`}>
          <QrCode className="w-4 h-4" />
          <span>QR কোড</span>
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={() => nativeShare(url, text)}
            className={`${base} ${neutral}`}
          >
            <Share2 className="w-4 h-4" />
            <span>অন্যান্য অ্যাপ</span>
          </button>
        )}
        {onSaveImage && (
          <button
            type="button"
            onClick={saveImage}
            disabled={saving}
            className={`${base} ${neutral} disabled:opacity-50`}
          >
            <ImageDown className="w-4 h-4" />
            <span>{saving ? "তৈরি হচ্ছে..." : "ছবি হিসেবে সেভ"}</span>
          </button>
        )}
      </div>

      {showQr && (
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-stone-200">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="চিঠির QR কোড" className="w-44 h-44" />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-400">
              QR তৈরি হচ্ছে...
            </div>
          )}
          {qr && (
            <a
              href={qr}
              download="birthday-letter-qr.png"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E151E] hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              QR ডাউনলোড করুন
            </a>
          )}
          <p className="text-[11px] text-stone-500">স্ক্যান করলেই চিঠির খাম খুলবে</p>
        </div>
      )}
    </div>
  );
}
