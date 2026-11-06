"use client";

import React, { useEffect, useState } from "react";
import { Download, Share2, X, RefreshCw, Sparkles, Check } from "lucide-react";
import {
  generateStoryCanvas,
  downloadStoryCardPng,
  shareStoryCardFile,
  type StoryCardInput,
} from "../storyGenerator";

interface StoryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: StoryCardInput;
}

export default function StoryExportModal({ isOpen, onClose, input }: StoryExportModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setGenerating(true);

    generateStoryCanvas(input)
      .then((canvas) => {
        if (!active) return;
        setPreviewUrl(canvas.toDataURL("image/png"));
      })
      .catch((err) => {
        console.error("Story canvas generation failed:", err);
      })
      .finally(() => {
        if (active) setGenerating(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, input]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadStoryCardPng(input);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const ok = await shareStoryCardFile(input);
      if (ok) {
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-white shadow-2xl flex flex-col items-center max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ইনস্টাগ্রাম ও ফেসবুক স্টোরি কার্ড</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            ১০৮০x১৯২০ ফুল HD স্টোরি প্রিসেট
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            এক ক্লিকেই আপনার ডে বা স্টোরিতে শেয়ার করার জন্য রেডি!
          </p>
        </div>

        {/* Story Phone Mockup Preview */}
        <div className="relative aspect-[9/16] w-60 sm:w-68 rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-700 bg-stone-950 flex items-center justify-center my-2">
          {generating ? (
            <div className="flex flex-col items-center gap-2 text-stone-400 p-4 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">HD স্টোরি কার্ড তৈরি হচ্ছে...</span>
            </div>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Story Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-stone-400">প্রিভিউ লোড করা যায়নি</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-5 space-y-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || generating}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#7E151E] to-rose-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xl transition transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ডাউনলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>HD স্টোরি ইমেজ ডাউনলোড করুন (1080x1920)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={sharing || generating}
            className="w-full py-2.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-2 border border-white/15 cursor-pointer disabled:opacity-50"
          >
            {sharing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>শেয়ার হচ্ছে...</span>
              </>
            ) : shared ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">শেয়ার সম্পন্ন হয়েছে!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-300" />
                <span>সরাসরি স্টোরিতে শেয়ার করুন (Instagram / Facebook)</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-stone-400 text-center mt-3 max-w-sm">
          টিপস: ছবিটি আপনার ফোনে সেভ করে সরাসরি Instagram Story বা Facebook Day-তে মিউজিক স্টিকার যুক্ত করে পোস্ট করতে পারেন।
        </p>
      </div>
    </div>
  );
}
