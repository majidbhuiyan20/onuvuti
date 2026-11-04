"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  WISH_THEMES,
  WishTheme,
} from "@/data/birthdayTemplates";
import {
  Sparkles,
  Share2,
  Check,
  Send,
  Heart,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

interface WishData {
  id: string;
  recipientName: string;
  senderName: string;
  relationship: string;
  message: string;
  theme?: string;
  viewsCount?: number;
  createdAt?: string;
}

interface WishViewerClientProps {
  initialWish: WishData;
}

// Lightweight Web Audio API synthesizer for chimes & celebration (no external MP3 file dependency)
function playMelodicChime(type: "open" | "blow") {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    if (type === "open") {
      // Gentle celebratory arpeggio chime: C5, E5, G5, B5, C6
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.85);
      });
    } else {
      // Candle blow puff + happy high chord
      const freqs = [587.33, 739.99, 880.0, 1174.66];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 1.25);
      });
    }
  } catch {
    // Audio context not allowed or failed silently
  }
}

export default function WishViewerClient({ initialWish }: WishViewerClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [candleBlown, setCandleBlown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const theme: WishTheme =
    WISH_THEMES.find((t) => t.id === initialWish.theme) || WISH_THEMES[0];

  // Particle confetti burst on opening or candle blow
  const triggerConfetti = (burstCount = 80) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#FF5252",
      "#FF4081",
      "#E040FB",
      "#7C4DFF",
      "#536DFE",
      "#FFD700",
      "#FF6E40",
      "#69F0AE",
      "#ffffff",
    ];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotSpeed: number;
      shape: "rect" | "circle" | "heart";
      opacity: number;
    }

    const particles: Particle[] = [];
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.6;

    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.4 ? "rect" : Math.random() > 0.5 ? "circle" : "heart",
        opacity: 1,
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      for (const p of particles) {
        if (p.opacity <= 0.02) continue;
        alive++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.98; // friction
        p.rotation += p.rotSpeed;
        p.opacity -= 0.008;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // cute small heart
          ctx.font = `${p.size * 1.5}px serif`;
          ctx.fillText("♥", -p.size / 2, p.size / 2);
        }

        ctx.restore();
      }

      if (alive > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  };

  const handleOpenEnvelope = () => {
    if (isOpen || isOpening) return;
    setIsOpening(true);

    if (soundEnabled) {
      playMelodicChime("open");
    }

    // Step 1: Wax seal crack
    setTimeout(() => {
      // Step 2: Flap opening
      triggerConfetti(100);
    }, 400);

    setTimeout(() => {
      // Step 3: Letter slides out
      setIsOpen(true);
      setIsOpening(false);
      triggerConfetti(70);
    }, 1100);
  };

  const handleBlowCandle = () => {
    if (candleBlown) return;
    setCandleBlown(true);
    if (soundEnabled) {
      playMelodicChime("blow");
    }
    triggerConfetti(120);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-b ${theme.bgGradient} text-white flex flex-col justify-between selection:bg-rose-500 selection:text-white`}
    >
      {/* Confetti Animation Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Ambient Starry Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl" />
      </div>

      {/* Top Header / Sound Toggle */}
      <header className="relative z-20 max-w-4xl mx-auto w-full px-4 pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-stone-200 transition"
        >
          <span>← অনূভুতি হোম</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label="সাউন্ড অন/অফ"
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 hover:text-white transition cursor-pointer"
            title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-stone-200 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>লিঙ্ক শেয়ার</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Experience Arena */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
        {!isOpen ? (
          /* =========================================================================
             PHASE 1: THE SEALED ENVELOPE (Tap Wax Seal to Open)
             ========================================================================= */
          <div className="flex flex-col items-center text-center animate-fade-in w-full max-w-lg">
            {/* Ambient Tagline */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-medium mb-4 shadow-lg animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>একটি বিশেষ অনুভূতির উপহার</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-wide drop-shadow-md">
              প্রিয় {initialWish.recipientName},
            </h1>
            <p className="text-sm text-stone-300 mb-8 max-w-sm">
              <span className="font-semibold text-amber-300">
                {initialWish.senderName}
              </span>{" "}
              তোমার জন্য একটি বিশেষ অনুভূতির চিঠি পাঠিয়েছেন। খামটি খুলে দেখতে নিচের সিলটিতে ট্যাপ করো।
            </p>

            {/* 3D Realistic Envelope */}
            <div
              onClick={handleOpenEnvelope}
              className={`relative cursor-pointer transition-all duration-700 transform ${
                isOpening ? "scale-105" : "hover:scale-103"
              } w-72 sm:w-88 h-48 sm:h-56 rounded-2xl shadow-2xl border flex items-center justify-center select-none`}
              style={{
                backgroundColor: theme.envelopeColor,
                borderColor: theme.envelopeBorder,
                boxShadow: `0 25px 50px -12px rgba(0,0,0,0.7), 0 0 40px ${theme.sealColor}33`,
              }}
            >
              {/* Envelope Flap Triangles Pattern */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 0%, white 0%, transparent 70%)",
                }}
              />

              {/* Envelope Interior Fold Lines */}
              <div
                className="absolute top-0 left-0 w-full h-full border-b-2 border-white/15"
                style={{
                  clipPath: "polygon(0 0, 50% 55%, 100% 0)",
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
              />

              {/* Recipient calligraphy label */}
              <div className="relative z-10 text-center px-4">
                <span className="text-[10px] uppercase tracking-widest text-white/60 block mb-0.5">
                  বিশেষ বার্তা
                </span>
                <p className="text-base sm:text-lg font-bold text-white/95">
                  To: {initialWish.recipientName}
                </p>
                <p className="text-xs text-white/70 mt-1">
                  From: {initialWish.senderName}
                </p>
              </div>

              {/* Pulsing Wax Seal at center */}
              <div
                className={`absolute bottom-3 sm:bottom-4 z-20 flex flex-col items-center justify-center transition-all duration-500 ${
                  isOpening ? "scale-125 opacity-0 rotate-45" : "animate-pulse"
                }`}
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-xl border-2 border-amber-300/60 ring-4 ring-black/20"
                  style={{
                    backgroundColor: theme.sealColor,
                    boxShadow: `0 0 20px ${theme.sealColor}`,
                  }}
                >
                  <span className="drop-shadow">{theme.sealText}</span>
                </div>
              </div>
            </div>

            {/* Instruction button */}
            <button
              type="button"
              onClick={handleOpenEnvelope}
              className="mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
              <span>খামটি খুলতে ট্যাপ করুন ✦</span>
            </button>
          </div>
        ) : (
          /* =========================================================================
             PHASE 2 & 3: THE UNFOLDED LETTER & CELEBRATION
             ========================================================================= */
          <div className="w-full max-w-xl animate-fade-in-up flex flex-col items-center">
            {/* The Vintage Letter Paper */}
            <article
              className="w-full rounded-3xl p-6 sm:p-10 shadow-2xl relative border overflow-hidden transition-all duration-500"
              style={{
                backgroundColor: theme.letterBg,
                color: theme.textColor,
                borderColor: `${theme.accentColor}33`,
                boxShadow: `0 25px 60px -15px rgba(0,0,0,0.6), 0 0 30px ${theme.accentColor}22`,
              }}
            >
              {/* Vintage Ornamental Border Corners */}
              <div
                className="absolute top-2 left-2 text-xs opacity-30 select-none font-serif"
                style={{ color: theme.accentColor }}
              >
                ❦
              </div>
              <div
                className="absolute top-2 right-2 text-xs opacity-30 select-none font-serif"
                style={{ color: theme.accentColor }}
              >
                ❦
              </div>
              <div
                className="absolute bottom-2 left-2 text-xs opacity-30 select-none font-serif"
                style={{ color: theme.accentColor }}
              >
                ❦
              </div>
              <div
                className="absolute bottom-2 right-2 text-xs opacity-30 select-none font-serif"
                style={{ color: theme.accentColor }}
              >
                ❦
              </div>

              {/* Letter Header */}
              <div className="text-center pb-5 mb-6 border-b border-stone-200/80">
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
                  style={{
                    backgroundColor: `${theme.accentColor}18`,
                    color: theme.accentColor,
                  }}
                >
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <h2
                  className="text-xl sm:text-2xl font-black tracking-wide"
                  style={{ color: theme.accentColor }}
                >
                  শুভ জন্মদিন
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {initialWish.relationship
                    ? `(${initialWish.relationship} এর জন্য বিশেষ চিঠি)`
                    : "একটি পবিত্র অনুভূতির উপহার"}
                </p>
              </div>

              {/* Salutation */}
              <p className="text-lg font-bold mb-4">
                প্রিয় {initialWish.recipientName},
              </p>

              {/* Heartfelt Letter Body */}
              <div className="text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-line font-medium opacity-90 my-4 pl-1">
                {initialWish.message}
              </div>

              {/* Sign-off */}
              <div className="mt-8 pt-4 border-t border-stone-200/80 text-right">
                <span className="text-xs text-stone-500 block">
                  ভালোবাসা ও শুভকামনায়,
                </span>
                <span
                  className="text-lg font-bold block mt-1"
                  style={{ color: theme.accentColor }}
                >
                  — {initialWish.senderName}
                </span>
              </div>
            </article>

            {/* ===================================================================
                INTERACTIVE BIRTHDAY CAKE & CANDLE SECTION
                =================================================================== */}
            <div className="mt-8 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 text-center shadow-xl">
              <div className="relative inline-block mb-3">
                {/* Birthday Cake Drawing with Animated Flame */}
                <div
                  onClick={handleBlowCandle}
                  className="cursor-pointer group flex flex-col items-center transition transform hover:scale-105 active:scale-95"
                >
                  {/* Candle Stick & Flame */}
                  <div className="relative flex flex-col items-center">
                    {!candleBlown ? (
                      /* Flickering Flame */
                      <div className="relative mb-1">
                        <div className="w-4 h-6 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 animate-pulse shadow-lg shadow-amber-400/80" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-white rounded-full opacity-80" />
                      </div>
                    ) : (
                      /* Smoke Puff after candle is blown */
                      <div className="text-xl animate-fade-in mb-1">💨</div>
                    )}
                    {/* Candle body */}
                    <div className="w-2.5 h-7 bg-gradient-to-r from-pink-300 via-white to-pink-300 rounded-xs shadow-xs" />
                  </div>

                  {/* Cake Layers */}
                  <div className="w-24 h-6 bg-pink-400 rounded-t-lg border-b-2 border-pink-500 flex items-center justify-around px-2 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                  </div>
                  <div className="w-32 h-8 bg-amber-100 rounded-b-xl border-t border-pink-300 flex items-center justify-around px-2 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Candle Prompt or Blown Blessing */}
              {!candleBlown ? (
                <div>
                  <button
                    type="button"
                    onClick={handleBlowCandle}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition bg-amber-500/20 hover:bg-amber-500/30 px-4 py-1.5 rounded-full border border-amber-400/40 cursor-pointer animate-pulse"
                  >
                    <span>🎂 একটি ইচ্ছা মনে রেখে মোমবাতিতে ফুঁ দিন (ট্যাপ করুন)</span>
                  </button>
                  <p className="text-[11px] text-stone-300 mt-1.5">
                    মোমবাতিতে চাপ দিলে তোমার আজকের জন্মদিনের শুভেচ্ছা বাতাসে ছড়িয়ে পড়বে
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  <p className="text-sm font-bold text-amber-300">
                    🎉 তোমার মনের সব স্বপ্ন সত্যি হোক! শুভ জন্মদিন! 🎈
                  </p>
                  <p className="text-xs text-stone-300 mt-1">
                    আজকের প্রতিটি ক্ষণ ভরে উঠুক আনন্দে ও ভালোবাসায়।
                  </p>
                </div>
              )}
            </div>

            {/* Replay Opening Button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setCandleBlown(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>পুনরায় খাম বন্ধ করুন</span>
              </button>
            </div>

            {/* ===================================================================
                VIRAL LOOP: CREATE YOUR OWN BIRTHDAY WISH
                =================================================================== */}
            <div className="mt-8 w-full max-w-md bg-gradient-to-r from-rose-900/40 via-purple-900/40 to-amber-900/40 border border-white/20 rounded-3xl p-5 text-center shadow-xl">
              <h3 className="text-base font-bold text-white mb-1">
                আপনিও কি প্রিয়জনকে এমন জন্মদিনের চিঠি পাঠাতে চান?
              </h3>
              <p className="text-xs text-stone-300 mb-4">
                খুব সহজেই তৈরি করুন এমন সুন্দর জাদুকরী খাম ও আবেগভরা চিঠি—১ ক্লিকে লিঙ্ক পাঠিয়ে চমকে দিন প্রিয়জনকে!
              </p>
              <Link
                href="/birthday-wish"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl transition transform hover:scale-102"
              >
                <Send className="w-4 h-4" />
                <span>নিজের জন্য এমন একটি চিঠি তৈরি করুন →</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-stone-400 border-t border-white/10">
        <p>© {new Date().getFullYear()} অনূভুতি (Onuvuti) • প্রতিটি অনুভূতির একটি গল্প আছে</p>
      </footer>
    </div>
  );
}

