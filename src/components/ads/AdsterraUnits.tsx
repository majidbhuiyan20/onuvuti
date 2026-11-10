"use client";

import React, { useEffect, useId, useRef, useState } from "react";

type BannerConfig = { key: string; width: number; height: number };

export const ADSTERRA_CONFIG = {
  banner468x60: { key: "5f726f0112bc8d3436e060b63c912f0c", width: 468, height: 60 },
  banner160x300: { key: "0dac6adadcf4123fb0921998382486ad", width: 160, height: 300 },
  banner320x50: { key: "0b2a60152acedb9457eb08525cb44ffe", width: 320, height: 50 },
  banner300x250: { key: "ae7e679dbe72e0bb8df14559cd0be972", width: 300, height: 250 },
  native: { key: "4c546bc31ba15c03f52c27ba8582ac4c" },
} as const;

type BannerTask = {
  id: string;
  target: HTMLDivElement;
  config: BannerConfig;
  done: (ok: boolean) => void;
};

type AdWindow = Window & {
  atOptions?: {
    key: string;
    format: string;
    height: number;
    width: number;
    params: Record<string, never>;
  };
  __adsterraQueue?: BannerTask[];
  __adsterraQueueRunning?: boolean;
};

function enqueueBanner(task: BannerTask) {
  const globalWindow = window as AdWindow;
  globalWindow.__adsterraQueue ??= [];
  globalWindow.__adsterraQueue.push(task);
  if (globalWindow.__adsterraQueueRunning) return;
  globalWindow.__adsterraQueueRunning = true;

  const processNext = () => {
    const next = globalWindow.__adsterraQueue?.shift();
    if (!next) {
      globalWindow.__adsterraQueueRunning = false;
      return;
    }
    if (!next.target.isConnected) {
      next.done(false);
      processNext();
      return;
    }
    globalWindow.atOptions = {
      key: next.config.key,
      format: "iframe",
      height: next.config.height,
      width: next.config.width,
      params: {},
    };
    const script = document.createElement("script");
    script.src = `https://bicea.org/22/${next.config.key}`;
    script.async = false;
    script.dataset.adUnit = next.id;
    let complete = false;
    const finish = (ok: boolean) => {
      if (complete) return;
      complete = true;
      window.clearTimeout(timeout);
      next.done(ok);
      processNext();
    };
    const timeout = window.setTimeout(() => {
      script.remove();
      finish(false);
    }, 10_000);
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    next.target.appendChild(script);
  };
  processNext();
}

function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window)
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function AdsterraBanner({
  config,
  className = "",
}: {
  config: BannerConfig;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const { ref, visible } = useNearViewport<HTMLDivElement>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!visible || !target || failed) return;
    let mounted = true;
    const timer = window.setTimeout(() => {
      enqueueBanner({
        id,
        target,
        config,
        done: (ok) => {
          if (mounted && !ok) setFailed(true);
        },
      });
    }, 80);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [visible, config, failed, id, ref]);

  if (failed) return null;

  return (
    <div
      className={`my-4 flex flex-col items-center justify-center ${className}`}
      aria-label="বিজ্ঞাপন"
    >
      <span className="text-[10px] tracking-wider uppercase text-stone-400 dark:text-stone-500 font-mono mb-1 select-none">
        বিজ্ঞাপন
      </span>
      <div
        ref={ref}
        style={{ width: "100%", maxWidth: config.width, minHeight: config.height }}
        className="flex items-center justify-center overflow-hidden rounded-xl bg-stone-100/60 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800"
      />
    </div>
  );
}

export function AdsterraBanner300x250({ className = "" }: { className?: string }) {
  return (
    <AdsterraBanner
      config={ADSTERRA_CONFIG.banner300x250}
      className={`max-w-[300px] mx-auto ${className}`}
    />
  );
}

export function AdsterraBanner468x60({ className = "" }: { className?: string }) {
  return (
    <AdsterraBanner
      config={ADSTERRA_CONFIG.banner468x60}
      className={`max-w-[468px] mx-auto ${className}`}
    />
  );
}

export function AdsterraBanner320x50({ className = "" }: { className?: string }) {
  return (
    <AdsterraBanner
      config={ADSTERRA_CONFIG.banner320x50}
      className={`max-w-[320px] mx-auto ${className}`}
    />
  );
}

export function AdsterraResponsiveBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="hidden sm:block">
        <AdsterraBanner config={ADSTERRA_CONFIG.banner468x60} />
      </div>
      <div className="block sm:hidden">
        <AdsterraBanner config={ADSTERRA_CONFIG.banner320x50} />
      </div>
    </div>
  );
}

export function AdsterraPopunder({ enabled = true }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const scriptSrc = "https://bicea.org/14/dc50dad050a291ae7e903256828161a6";
    if (document.querySelector(`script[src="${scriptSrc}"]`)) return;

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.head.appendChild(script);
  }, [enabled]);

  return null;
}
