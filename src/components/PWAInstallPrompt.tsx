"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Registration successful
        })
        .catch(() => {
          // SW registration ignored in local development if needed
        });
    }

    // 2. Check if already running in standalone mode (installed app)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Check dismiss cooldown from localStorage (don't show for 5 days after dismiss)
    const dismissedUntil = localStorage.getItem("onuvuti_pwa_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // 4. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|crios|fxios|edgios|opr\//.test(userAgent);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
      // Show prompt after 3 seconds on iOS Safari
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    // 5. Android / Chrome / Edge BeforeInstallPrompt Handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 2.5 seconds after page load before displaying smooth install prompt
      setTimeout(() => {
        setIsVisible(true);
      }, 2500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 6. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // 7. Listen for explicit user clicks on "Install App" buttons across the site
    const handleTriggerInstall = () => {
      setIsVisible(true);
      if (isIosDevice && isSafari) {
        setShowIOSInstructions(true);
      }
    };
    window.addEventListener("trigger-pwa-install", handleTriggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("trigger-pwa-install", handleTriggerInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } catch {
      // Ignore prompt errors
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss for 5 days
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "onuvuti_pwa_dismissed_until",
      String(Date.now() + fiveDaysMs)
    );
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="মোবাইল অ্যাপ ইনস্টল করুন"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-fadeIn"
    >
      <div className="rounded-3xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-[#C59B27]/40 dark:border-stone-800 p-4 sm:p-5 shadow-2xl space-y-3.5 transition-all">
        {/* Top Header Row with Icon and Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF4E6] dark:bg-[#1E293B] border border-stone-200 dark:border-stone-700 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192.png"
                alt="Onuvuti App"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0DC] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-400 mb-0.5">
                <Smartphone className="w-3 h-3 text-[#C59B27]" />
                <span>মোবাইল অ্যাপ</span>
              </div>
              <h3 className="text-sm font-extrabold text-[#142230] dark:text-white leading-tight">
                অনুভূতি অ্যাপ ইনস্টল করুন
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition cursor-pointer"
            title="পরে ইনস্টল করুন"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description or iOS step-by-step guidance */}
        {showIOSInstructions ? (
          <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/80 p-3 space-y-2 text-xs border border-stone-200 dark:border-stone-700">
            <p className="font-bold text-[#80131E] dark:text-rose-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>আইফোনে হোমস্ক্রিনে যুক্ত করার নিয়ম:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300">
              <li>
                নিচে Safari ব্রাউজারের{" "}
                <strong className="text-stone-900 dark:text-white inline-flex items-center gap-1">
                  <Share className="w-3 h-3 inline text-blue-500" /> Share
                </strong>{" "}
                আইকনে চাপুন।
              </li>
              <li>
                মেনুটি স্ক্রল করে{" "}
                <strong className="text-stone-900 dark:text-white inline-flex items-center gap-1">
                  <PlusSquare className="w-3 h-3 inline text-stone-700 dark:text-stone-200" /> Add to Home Screen
                </strong>{" "}
                নির্বাচন করুন।
              </li>
              <li>উপরে ডানপাশে “Add” বাটনে ট্যাপ করলেই অ্যাপ সেভ হয়ে যাবে।</li>
            </ol>
          </div>
        ) : (
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            প্লে-স্টোর ছাড়াই আপনার ফোনের হোম স্ক্রিনে সেভ করে ব্রাউজার ছাড়াই সরাসরি দ্রুত গল্প ও চিঠি উপভোগ করুন।
          </p>
        )}

        {/* Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#80131E] hover:bg-[#680f18] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? "কীভাবে ইনস্টল করবেন?" : "এখনই ইনস্টল করুন"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-2.5 px-3.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition cursor-pointer"
          >
            <span>পরে</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
