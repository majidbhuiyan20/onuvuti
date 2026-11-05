"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone, ArrowRight, ExternalLink, X } from "lucide-react";
import { GO_API_BASE_URL } from "@/lib/goApi";

interface AdBannerItem {
  slot: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

const DEFAULT_TOP_NOTICE: AdBannerItem = {
  slot: "top_notice",
  title: "অনুভূতি পাবলিকেশন্স — ‘স্পর্শের ব্যাকরণ’ বেস্টসেলার ই-বুক এখন মাত্র ১৯০ টাকায় সংগ্রহ করুন!",
  imageUrl: "",
  linkUrl: "/sporsher-byakoron",
  isActive: true,
};

export default function TopNoticeBanner() {
  const [notice, setNotice] = useState<AdBannerItem | null>(DEFAULT_TOP_NOTICE);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("onuvuti_dismiss_top_notice");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }

    // Fetch active notices from Go backend
    fetch(`${GO_API_BASE_URL}/ads`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && Array.isArray(data.ads)) {
          const topAd = data.ads.find(
            (a: AdBannerItem) => a.slot === "top_notice"
          );
          if (topAd && topAd.isActive && topAd.title) {
            setNotice(topAd);
          } else {
            setNotice(null);
          }
        }
      })
      .catch(() => {
        // Retain default notice if Go server is temporarily unreachable
      });
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onuvuti_dismiss_top_notice", "true");
    }
  };

  if (isDismissed || !notice || !notice.isActive || !notice.title) {
    return null;
  }

  const isExternal =
    notice.linkUrl?.startsWith("http://") ||
    notice.linkUrl?.startsWith("https://");

  return (
    <aside
      aria-label="জরুরি নোটিশ ব্যানার"
      className="relative z-50 bg-[#80131E] text-white border-b border-[#A01826]/60 transition-all duration-200"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-center sm:justify-start">
          <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/15 text-amber-200">
            <Megaphone className="w-3.5 h-3.5" />
          </span>
          <p className="truncate font-medium text-stone-100 text-xs sm:text-[13px]">
            {notice.title}
          </p>
          {notice.linkUrl && (
            isExternal ? (
              <a
                href={notice.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF4E6] text-[#80131E] font-bold text-[11px] sm:text-xs hover:bg-white transition"
              >
                <span>দেখুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <Link
                href={notice.linkUrl}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF4E6] text-[#80131E] font-bold text-[11px] sm:text-xs hover:bg-white transition"
              >
                <span>সংগ্রহ করুন</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="নোটিশ বন্ধ করুন"
          aria-label="নোটিশ বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
