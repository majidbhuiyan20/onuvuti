"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ExternalLink, Sparkles } from "lucide-react";
import { GO_API_BASE_URL } from "@/lib/goApi";

interface AdItem {
  slot: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

const DEFAULT_LEFT_AD: AdItem = {
  slot: "left_sidebar",
  title: "স্পর্শের ব্যাকরণ - অনুভূতি পাবলিকেশন্স",
  imageUrl: "/images/book-cover.png",
  linkUrl: "/sporsher-byakoron",
  isActive: true,
};

const DEFAULT_RIGHT_AD: AdItem = {
  slot: "right_sidebar",
  title: "স্পর্শের ব্যাকরণ - আজই সংগ্রহ করুন",
  imageUrl: "/images/book-back.png",
  linkUrl: "/sporsher-byakoron",
  isActive: true,
};

export default function SidebarBanners() {
  const [leftAd, setLeftAd] = useState<AdItem | null>(DEFAULT_LEFT_AD);
  const [rightAd, setRightAd] = useState<AdItem | null>(DEFAULT_RIGHT_AD);
  const [leftDismissed, setLeftDismissed] = useState(false);
  const [rightDismissed, setRightDismissed] = useState(false);

  useEffect(() => {
    // Check session dismiss
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("onuvuti_dismiss_ad_left")) {
        setLeftDismissed(true);
      }
      if (sessionStorage.getItem("onuvuti_dismiss_ad_right")) {
        setRightDismissed(true);
      }
    }

    // Fetch active ads from Go backend
    fetch(`${GO_API_BASE_URL}/ads`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && Array.isArray(data.ads)) {
          const l = data.ads.find((a: AdItem) => a.slot === "left_sidebar");
          const r = data.ads.find((a: AdItem) => a.slot === "right_sidebar");
          setLeftAd(l && l.isActive ? l : null);
          setRightAd(r && r.isActive ? r : null);
        }
      })
      .catch(() => {
        // Retain default book promotions
      });
  }, []);

  const handleDismissLeft = () => {
    setLeftDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onuvuti_dismiss_ad_left", "true");
    }
  };

  const handleDismissRight = () => {
    setRightDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onuvuti_dismiss_ad_right", "true");
    }
  };

  const isExternal = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://");

  return (
    <>
      {/* Left Sidebar Banner (Desktop 2xl & wide screens) */}
      {leftAd && leftAd.isActive && !leftDismissed && (
        <aside
          aria-label="বিজ্ঞাপন বা প্রমোশন"
          className="fixed left-3 2xl:left-8 top-28 z-30 hidden xl:flex flex-col w-44 2xl:w-52 transition-all duration-300 animate-fadeIn"
        >
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#111827] border border-[#C59B27]/40 dark:border-stone-800 shadow-md group">
            {/* Top Tag & Close Button */}
            <div className="bg-[#FAF4E6] dark:bg-[#1A2234] px-2.5 py-1.5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#80131E] dark:text-rose-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                বিজ্ঞাপন
              </span>
              <button
                type="button"
                onClick={handleDismissLeft}
                title="বিজ্ঞাপনটি বন্ধ করুন"
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Clickable Banner Content */}
            {isExternal(leftAd.linkUrl) ? (
              <a
                href={leftAd.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 text-center space-y-2 cursor-pointer"
              >
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leftAd.imageUrl}
                    alt={leftAd.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="px-1">
                  <h4 className="text-xs font-bold text-[#142230] dark:text-white line-clamp-2 leading-snug group-hover:text-[#80131E] dark:group-hover:text-rose-400 transition">
                    {leftAd.title}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#80131E] dark:text-rose-400 mt-1">
                    <span>দেখুন</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>
            ) : (
              <Link
                href={leftAd.linkUrl || "/sporsher-byakoron"}
                className="block p-2 text-center space-y-2 cursor-pointer"
              >
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leftAd.imageUrl}
                    alt={leftAd.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="px-1">
                  <h4 className="text-xs font-bold text-[#142230] dark:text-white line-clamp-2 leading-snug group-hover:text-[#80131E] dark:group-hover:text-rose-400 transition">
                    {leftAd.title}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#80131E] dark:text-rose-400 mt-1">
                    <span>বইটি দেখুন</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </aside>
      )}

      {/* Right Sidebar Banner (Desktop 2xl & wide screens) */}
      {rightAd && rightAd.isActive && !rightDismissed && (
        <aside
          aria-label="বিজ্ঞাপন বা প্রমোশন"
          className="fixed right-3 2xl:right-8 top-28 z-30 hidden xl:flex flex-col w-44 2xl:w-52 transition-all duration-300 animate-fadeIn"
        >
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#111827] border border-[#C59B27]/40 dark:border-stone-800 shadow-md group">
            {/* Top Tag & Close Button */}
            <div className="bg-[#FAF4E6] dark:bg-[#1A2234] px-2.5 py-1.5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#80131E] dark:text-rose-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                স্পন্সর
              </span>
              <button
                type="button"
                onClick={handleDismissRight}
                title="বিজ্ঞাপনটি বন্ধ করুন"
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Clickable Banner Content */}
            {isExternal(rightAd.linkUrl) ? (
              <a
                href={rightAd.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 text-center space-y-2 cursor-pointer"
              >
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rightAd.imageUrl}
                    alt={rightAd.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="px-1">
                  <h4 className="text-xs font-bold text-[#142230] dark:text-white line-clamp-2 leading-snug group-hover:text-[#80131E] dark:group-hover:text-rose-400 transition">
                    {rightAd.title}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#80131E] dark:text-rose-400 mt-1">
                    <span>সংগ্রহ করুন</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </a>
            ) : (
              <Link
                href={rightAd.linkUrl || "/sporsher-byakoron"}
                className="block p-2 text-center space-y-2 cursor-pointer"
              >
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rightAd.imageUrl}
                    alt={rightAd.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="px-1">
                  <h4 className="text-xs font-bold text-[#142230] dark:text-white line-clamp-2 leading-snug group-hover:text-[#80131E] dark:group-hover:text-rose-400 transition">
                    {rightAd.title}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#80131E] dark:text-rose-400 mt-1">
                    <span>ই-বুক পড়ুন</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </aside>
      )}
    </>
  );
}

