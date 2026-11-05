"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  X,
  Palette,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import {
  STORY_THEMES,
  renderStickerCardToCanvas,
  downloadStickerImage,
  shareStickerImage,
} from "./storyGenerator";
import { StoryThemeId } from "./types";

interface StoryStickerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
  promptText?: string;
  initialTheme?: StoryThemeId;
}

export default function StoryStickerCardModal({
  isOpen,
  onClose,
  username,
  displayName,
  promptText = "আমাকে যেকোনো মনের কথা বা না বলা গোপন অনুভূতি লিখে পাঠাও... (লিঙ্ক বায়োতে)",
  initialTheme = "crimson",
}: StoryStickerCardModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<StoryThemeId>(initialTheme);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/m/${username}`
      : `https://onuvuti.site/m/${username}`;

  // Re-render canvas whenever theme or modal opens
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (canvasRef.current) {
        renderStickerCardToCanvas({
          canvas: canvasRef.current,
          displayName,
          username,
          promptText,
          themeId: selectedTheme,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, selectedTheme, displayName, username, promptText]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    try {
      await downloadStickerImage(canvasRef.current, username);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    setIsSharing(true);
    try {
      await shareStickerImage(canvasRef.current, username);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/70 text-[#7E151E] dark:text-rose-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#142230] dark:text-white">
                ইনস্টাগ্রাম ও ফেসবুক স্টোরি স্টিকার
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                স্টোরিতে শেয়ার করতে 1080×1920 HD স্টিকার কার্ড ডাউনলোড করুন
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main 2-column Layout: Left Canvas Preview, Right Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Left: 9:16 Canvas Live Preview */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[240px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border-2 border-stone-300 dark:border-stone-700 bg-stone-900 relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover block"
                />
              </div>
              <span className="text-[10px] text-stone-400 font-medium mt-2">
                1080×1920 HD Story Format
              </span>
            </div>

            {/* Right: Controls & Options */}
            <div className="sm:col-span-7 space-y-4">
              {/* Theme Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                  <span>কালার ও ব্যাকগ্রাউন্ড থিম বেছে নিন:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(STORY_THEMES) as StoryThemeId[]).map((tId) => {
                    const theme = STORY_THEMES[tId];
                    const isSelected = selectedTheme === tId;
                    return (
                      <button
                        key={tId}
                        type="button"
                        onClick={() => setSelectedTheme(tId)}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "border-[#7E151E] dark:border-rose-400 bg-rose-50/70 dark:bg-rose-950/40 text-[#7E151E] dark:text-rose-300 shadow-xs"
                            : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{
                            background: `linear-gradient(135deg, ${theme.bgGradient[0]}, ${theme.bgGradient[1]})`,
                          }}
                        />
                        <span className="truncate text-[11px]">{theme.nameBn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Public Link Copy Bar */}
              <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block">
                  স্টোরির লিঙ্ক স্টিকারে দেওয়ার জন্য আপনার লিঙ্ক:
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={fullShareUrl}
                    className="flex-1 bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-stone-800 dark:text-stone-100 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  >
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? "কপি হয়েছে" : "কপি"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7E151E] via-[#941924] to-rose-700 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isDownloading ? "ডাউনলোড হচ্ছে..." : "স্টোরি স্টিকার কার্ড ডাউনলোড করুন"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-stone-200 dark:border-stone-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                  <span>সরাসরি স্টোরিতে শেয়ার করুন (মোবাইল)</span>
                </button>
              </div>

              {/* Tutorial Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTutorial(!showTutorial)}
                  className="text-[11px] font-bold text-stone-500 hover:text-[#7E151E] dark:hover:text-rose-400 inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>কীভাবে ইনস্টাগ্রাম বা ফেসবুক স্টোরিতে দেবেন? (টিউটোরিয়াল)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tutorial Step-by-Step Box */}
          {showTutorial && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-2 animate-in fade-in duration-150">
              <span className="font-bold text-stone-800 dark:text-stone-100 block">
                স্টোরি পোস্ট করার সহজ ৩টি ধাপ:
              </span>
              <p className="text-stone-600 dark:text-stone-300">
                <strong>১.</strong> উপরের &ldquo;স্টোরি স্টিকার কার্ড ডাউনলোড&rdquo; বাটনে ট্যাপ করে ছবিটি গ্যালারিতে সেভ করুন।
              </p>
              <p className="text-stone-600 dark:text-stone-300">
                <strong>২.</strong> Instagram বা Facebook অ্যাপে গিয়ে স্টোরিতে এই ছবিটি আপলোড করুন।
              </p>
              <p className="text-stone-600 dark:text-stone-300">
                <strong>৩.</strong> স্টোরি এডিটরে স্টিকার আইকনে (স্মাইলি/স্টিকার) ট্যাপ করে <strong>&ldquo;Link&rdquo;</strong> স্টিকার বেছে নিন এবং আপনার কপি করা লিঙ্কটি পেস্ট করুন। ব্যস, বন্ধুরা স্টোরির লিঙ্কে ক্লিক করলেই আপনাকে গোপনে বার্তা পাঠাতে পারবে!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
