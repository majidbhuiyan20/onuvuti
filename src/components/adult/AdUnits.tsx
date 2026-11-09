"use client";

import { useEffect, useId, useRef, useState } from "react";

type BannerConfig = { key: string; width: number; height: number; enabled: boolean };

// Keep network units and rollout switches in one place. Popunder waits for a
// visitor gesture because it can open a new browsing context; afders is unverified.
export const adultAdConfig = {
  enabled: true,
  banner468x60: { key: "5f726f0112bc8d3436e060b63c912f0c", width: 468, height: 60, enabled: true },
  banner160x300: { key: "0dac6adadcf4123fb0921998382486ad", width: 160, height: 300, enabled: true },
  banner320x50: { key: "0b2a60152acedb9457eb08525cb44ffe", width: 320, height: 50, enabled: true },
  banner300x250: { key: "ae7e679dbe72e0bb8df14559cd0be972", width: 300, height: 250, enabled: true },
  native: { key: "4c546bc31ba15c03f52c27ba8582ac4c", enabled: true },
  popunder: { src: "https://bicea.org/14/dc50dad050a291ae7e903256828161a6", enabled: true },
  afders: { src: "https://afders.org/1/f6b1a3ea8d959aacd0fb180e925eba2a", enabled: false },
} as const;

type BannerTask = { id: string; target: HTMLDivElement; config: BannerConfig; done: (ok: boolean) => void };
type AdWindow = Window & { atOptions?: { key: string; format: string; height: number; width: number; params: Record<string, never> }; __adultAdQueue?: BannerTask[]; __adultAdQueueRunning?: boolean; __adultLoadedScripts?: Set<string> };

function enqueueBanner(task: BannerTask) {
  const globalWindow = window as AdWindow;
  globalWindow.__adultAdQueue ??= [];
  globalWindow.__adultAdQueue.push(task);
  if (globalWindow.__adultAdQueueRunning) return;
  globalWindow.__adultAdQueueRunning = true;

  const processNext = () => {
    const next = globalWindow.__adultAdQueue?.shift();
    if (!next) {
      globalWindow.__adultAdQueueRunning = false;
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
    const timeout = window.setTimeout(() => { script.remove(); finish(false); }, 10_000);
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    next.target.appendChild(script);
  };
  processNext();
}

function useNearViewport<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));
  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);
  return { ref, visible };
}

function AdBanner({ config, className = "" }: { config: BannerConfig; className?: string }) {
  const id = useId().replace(/:/g, "");
  const { ref, visible } = useNearViewport<HTMLDivElement>(adultAdConfig.enabled && config.enabled);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!visible || !target || failed) return;
    let mounted = true;
    // The short delay lets React Strict Mode's development-only setup/cleanup
    // pass finish before the non-idempotent third-party code is requested.
    const timer = window.setTimeout(() => enqueueBanner({
      id,
      target,
      config,
      done: (ok) => { if (mounted && !ok) setFailed(true); },
    }), 80);
    return () => { mounted = false; window.clearTimeout(timer); };
  }, [visible, config, failed, id, ref]);

  if (!adultAdConfig.enabled || !config.enabled || failed) return null;
  return <section className={`adult-ad-placement ${className}`} aria-label="Advertisement">
    <span className="adult-ad-label">Advertisement</span>
    <div className="adult-ad-slot" style={{ width: config.width, minHeight: config.height }} ref={ref} />
  </section>;
}

export function AdBanner468x60({ className = "" }: { className?: string }) { return <AdBanner config={adultAdConfig.banner468x60} className={`adult-ad-468 ${className}`} />; }
export function AdBanner160x300({ className = "" }: { className?: string }) { return <AdBanner config={adultAdConfig.banner160x300} className={`adult-ad-160 ${className}`} />; }
export function AdBanner320x50({ className = "" }: { className?: string }) { return <AdBanner config={adultAdConfig.banner320x50} className={`adult-ad-320 ${className}`} />; }
export function AdBanner300x250({ className = "" }: { className?: string }) { return <AdBanner config={adultAdConfig.banner300x250} className={`adult-ad-300 ${className}`} />; }

export function AdNative() {
  const containerId = `container-${adultAdConfig.native.key}`;
  const { ref, visible } = useNearViewport<HTMLElement>(adultAdConfig.enabled && adultAdConfig.native.enabled);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const target = ref.current;
    if (!visible || !target || failed) return;
    let mounted = true;
    const timer = window.setTimeout(() => {
      const src = `https://bicea.org/21/${adultAdConfig.native.key}`;
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.onload = () => { if (mounted) target.dataset.loaded = "true"; };
      script.onerror = () => {
        if (mounted) setFailed(true);
      };
      target.insertBefore(script, target.querySelector(`#${containerId}`));
    }, 80);
    return () => { mounted = false; window.clearTimeout(timer); };
  }, [visible, failed, ref, containerId]);
  if (!adultAdConfig.enabled || !adultAdConfig.native.enabled || failed) return null;
  return <section className="adult-native-ad" aria-label="Advertisement" ref={ref}><span className="adult-ad-label">Advertisement</span><div id={containerId} /></section>;
}

export function AdAdditional() {
  useEffect(() => {
    if (!adultAdConfig.enabled) return;
    const globalWindow = window as AdWindow;
    const loadedScripts = globalWindow.__adultLoadedScripts ??= new Set<string>();

    const loadScript = (item: { src: string; enabled: boolean }) => {
      if (!item.enabled) return;
      if (loadedScripts.has(item.src)) return;
      loadedScripts.add(item.src);
      const script = document.createElement("script");
      script.src = item.src;
      script.async = false;
      script.setAttribute("data-cfasync", "false");
      script.onerror = () => loadedScripts.delete(item.src);
      document.head.appendChild(script);
    };

    const popunderKey = "onuvuti-adult-popunder-loaded";
    const onFirstGesture = () => {
      try {
        if (sessionStorage.getItem(popunderKey)) return;
        sessionStorage.setItem(popunderKey, "1");
      } catch { return; }
      loadScript(adultAdConfig.popunder);
    };
    document.addEventListener("pointerdown", onFirstGesture, { once: true, passive: true });
    document.addEventListener("keydown", onFirstGesture, { once: true });
    return () => {
      document.removeEventListener("pointerdown", onFirstGesture);
      document.removeEventListener("keydown", onFirstGesture);
    };
  }, []);
  return null;
}
