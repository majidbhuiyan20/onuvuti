"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { WISH_THEMES, WishTheme } from "@/data/birthdayTemplates";
import { Flame, RotateCcw, Send, Volume2, VolumeX, Wind, Sparkles, Crown, HeartHandshake } from "lucide-react";
import { wishApi } from "../api";
import { burstConfetti, floatBalloons } from "../confetti";
import { playChime, primeAudio, startMusic, type MusicHandle } from "../music";
import { downloadLetterPng, inviteText } from "../share";
import type { WishContent, WishPublic } from "../types";
import useGoogleFont from "../useGoogleFont";
import CountdownScreen from "./CountdownScreen";
import EnvelopeStage from "./EnvelopeStage";
import LetterCard from "./LetterCard";
import PasscodeForm from "./PasscodeForm";
import ReactionBox from "./ReactionBox";
import ShareBar from "./ShareBar";

export default function WishViewer({ initialWish }: { initialWish: WishPublic }) {
  const [wish, setWish] = useState(initialWish);
  const [content, setContent] = useState<WishContent | null>(null);
  const [showLetter, setShowLetter] = useState(false);
  const [opening, setOpening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [askCode, setAskCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [openError, setOpenError] = useState("");
  const [candleBlown, setCandleBlown] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const balloonRef = useRef<HTMLCanvasElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const theme: WishTheme = WISH_THEMES.find((t) => t.id === wish.theme) || WISH_THEMES[0];
  useGoogleFont(wish.fontStyle === "handwritten");

  const unlockAtMs = useMemo(
    () => (wish.unlockAt ? new Date(wish.unlockAt).getTime() : 0),
    [wish.unlockAt]
  );

  useEffect(() => {
    setIsClient(true);
    if (initialWish.serverNow) {
      setClockOffsetMs(new Date(initialWish.serverNow).getTime() - Date.now());
    }
  }, [initialWish.serverNow]);

  // Background music only while the letter is visible and sound is on.
  useEffect(() => {
    if (!showLetter || !soundEnabled || wish.music === "none") return;
    const handle: MusicHandle | null = startMusic(wish.music);
    return () => handle?.stop();
  }, [showLetter, soundEnabled, wish.music]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // The page may come from a cache: resync lock state & server clock once on mount.
  useEffect(() => {
    let cancelled = false;
    wishApi.getPublic(initialWish.id).then((res) => {
      if (cancelled || !res.ok) return;
      setWish(res.data);
      setClockOffsetMs(new Date(res.data.serverNow).getTime() - Date.now());
    });
    return () => {
      cancelled = true;
    };
  }, [initialWish.id]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  /** Re-sync with the server (also refreshes the clock offset). */
  const refreshPublic = async () => {
    const res = await wishApi.getPublic(wish.id);
    if (res.ok) {
      setWish(res.data);
      setClockOffsetMs(new Date(res.data.serverNow).getTime() - Date.now());
    }
  };

  const playOpenAnimation = () => {
    setOpening(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([40, 25, 50]);
      } catch {}
    }
    if (soundEnabled) playChime("open");
    later(() => burstConfetti(confettiRef.current, 100), 400);
    later(() => {
      setShowLetter(true);
      setOpening(false);
      burstConfetti(confettiRef.current, 70);
      floatBalloons(balloonRef.current, 14);
    }, 1100);
  };

  const handleOpen = async (passcode?: string) => {
    if (opening || busy) return;
    primeAudio(); // must run inside the click gesture so later sounds are allowed

    if (content) return playOpenAnimation(); // already fetched (e.g. closed envelope again)

    if (wish.hasPasscode && passcode === undefined) {
      setAskCode(true);
      return;
    }

    setBusy(true);
    setOpenError("");
    setCodeError("");
    const res = await wishApi.open(wish.id, passcode);
    setBusy(false);

    if (!res.ok) {
      if (res.code === "bad_passcode" || res.code === "too_many_attempts") return setCodeError(res.error);
      if (res.code === "destroyed") return setWish((w) => ({ ...w, destroyed: true }));
      if (res.code === "locked") {
        await refreshPublic();
        return setOpenError(res.error);
      }
      return setOpenError(res.error);
    }

    setContent(res.data);
    setAskCode(false);
    playOpenAnimation();
  };

  const handleBlowCandle = () => {
    if (candleBlown) return;
    setCandleBlown(true);
    if (soundEnabled) playChime("blow");
    burstConfetti(confettiRef.current, 120);
    floatBalloons(balloonRef.current, 10);
  };

  const closeEnvelope = () => {
    setShowLetter(false);
    setCandleBlown(false);
  };

  const shareUrl = typeof window === "undefined" ? "" : window.location.href.split("?")[0];
  const locked =
    wish.locked && (!isClient || (unlockAtMs > 0 && unlockAtMs > Date.now() + clockOffsetMs));

  const renderStage = () => {
    if (wish.destroyed && !content) {
      return (
        <div className="flex flex-col items-center text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-rose-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">চিঠিটি আর নেই</h1>
          <p className="text-sm text-stone-300">
            এটি একটি গোপন চিঠি ছিল—একবার পড়ার পর প্রেরকের নিয়ম অনুযায়ী চিরতরে মুছে ফেলা হয়েছে।
          </p>
        </div>
      );
    }

    if (locked) {
      return (
        <CountdownScreen
          unlockAtMs={unlockAtMs}
          clockOffsetMs={clockOffsetMs}
          recipientName={wish.recipientName}
          senderName={wish.senderName}
          onDone={() => setWish((w) => ({ ...w, locked: false }))}
          themeId={wish.theme}
          relationship={wish.relationship}
        />
      );
    }

    if (!showLetter || !content) {
      return (
        <div className="flex flex-col items-center w-full">
          <EnvelopeStage
            recipientName={wish.recipientName}
            senderName={wish.senderName}
            theme={theme}
            opening={opening}
            busy={busy}
            onOpen={() => handleOpen()}
          />
          {openError && (
            <p role="alert" className="mt-4 text-xs font-semibold text-rose-300 text-center max-w-sm">
              {openError}
            </p>
          )}
          {askCode && !content && (
            <PasscodeForm
              busy={busy}
              error={codeError}
              onSubmit={(code) => handleOpen(code)}
              onCancel={() => {
                setAskCode(false);
                setCodeError("");
              }}
            />
          )}
        </div>
      );
    }

    const isWedding =
      wish.relationship?.includes("বিবাহ") ||
      wish.theme === "wedding_royal" ||
      (content?.message?.includes("শুভ বিবাহ") ?? false) ||
      (content?.message?.includes("পাত্র:") ?? false);
    const isAnniv =
      wish.relationship?.includes("বার্ষিকী") ||
      wish.theme === "anniversary_gold" ||
      (content?.message?.includes("বিবাহবার্ষিকী") ?? false);

    return (
      <div className="w-full max-w-xl animate-fade-in-up flex flex-col items-center">
        {wish.selfDestruct && (
          <div className="mb-4 w-full rounded-2xl bg-rose-500/15 border border-rose-400/40 p-3 text-center text-xs font-semibold text-rose-200 flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 text-amber-300 shrink-0" />
            <span>এটি একটি গোপন চিঠি—পেজ রিফ্রেশ করলে বা বন্ধ করলে আর কখনো দেখা যাবে না। এখনই পড়ে নিন!</span>
          </div>
        )}

        <LetterCard wish={wish} content={content} theme={theme} />

        {/* Occasion Interactive Card */}
        {isWedding ? (
          <div className="mt-8 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-3 text-amber-300">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">নবদম্পতির নতুন জীবনের সূচনা</h3>
            <p className="text-xs text-stone-300 mb-4 max-w-xs mx-auto">
              বরের ও কনের ভবিষ্যৎ দিনগুলো যেন অপার বরকত ও আনন্দে ভরে ওঠে—আপনার আন্তরিক দোয়া ও শুভেচ্ছা জানান।
            </p>
            {!candleBlown ? (
              <button
                type="button"
                onClick={handleBlowCandle}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-[#7E151E] hover:opacity-95 px-5 py-2.5 rounded-full border border-amber-400/30 cursor-pointer shadow-lg animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>দোয়া ও শুভাশিস বর্ষণ করুন</span>
              </button>
            ) : (
              <div className="animate-fade-in-up py-1">
                <p className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>বারাকাল্লাহু লাকুমা ওয়া বারাকা আলাইকুমা!</span>
                </p>
                <p className="text-xs text-stone-300 mt-1">আপনার হৃদয়নিংড়ানো শুভকামনা নবদম্পতির কাছে পৌঁছে গেছে।</p>
              </div>
            )}
          </div>
        ) : isAnniv ? (
          <div className="mt-8 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center mx-auto mb-3 text-rose-300">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">চিরন্তন বন্ধনের অটুট জয়গান</h3>
            <p className="text-xs text-stone-300 mb-4 max-w-xs mx-auto">
              বিবাহবার্ষিকীর এই পবিত্র লগ্নে প্রিয় দম্পতির জন্য ভালোবাসার শুভেচ্ছা ও দোয়া বর্ষণ করুন।
            </p>
            {!candleBlown ? (
              <button
                type="button"
                onClick={handleBlowCandle}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 px-5 py-2.5 rounded-full border border-amber-400/30 cursor-pointer shadow-lg animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>ভালোবাসা ও শুভকামনা জানান</span>
              </button>
            ) : (
              <div className="animate-fade-in-up py-1">
                <p className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>শুভ বিবাহবার্ষিকী! বন্ধন থাকুক চির অটুট!</span>
                </p>
                <p className="text-xs text-stone-300 mt-1">আপনাদের ভালোবাসার প্রতিটি প্রহর চিরনবীন থাকুক।</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 text-center shadow-xl">
            <div
              onClick={handleBlowCandle}
              className="cursor-pointer group inline-flex flex-col items-center mb-3 transition transform hover:scale-105 active:scale-95"
            >
              <div className="relative flex flex-col items-center">
                {!candleBlown ? (
                  <div className="relative mb-1">
                    <div className="w-4 h-6 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 animate-pulse shadow-lg shadow-amber-400/80" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-white rounded-full opacity-80" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center mb-1 text-stone-300 animate-fade-in">
                    <Wind className="w-5 h-5" />
                  </div>
                )}
                <div className="w-2.5 h-7 bg-gradient-to-r from-pink-300 via-white to-pink-300 rounded-xs shadow-xs" />
              </div>
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

            {!candleBlown ? (
              <div>
                <button
                  type="button"
                  onClick={handleBlowCandle}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition bg-amber-500/20 hover:bg-amber-500/30 px-4 py-1.5 rounded-full border border-amber-400/40 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>একটি ইচ্ছা মনে রেখে মোমবাতিতে ফুঁ দিন (ট্যাপ করুন)</span>
                </button>
                <p className="text-[11px] text-stone-300 mt-1.5">
                  মোমবাতিতে চাপ দিলে আপনার অনুভূতি বাতাসে ছড়িয়ে পড়বে
                </p>
              </div>
            ) : (
              <div className="animate-fade-in-up">
                <p className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>আপনার মনের সব ইচ্ছা পূরণ হোক!</span>
                </p>
                <p className="text-xs text-stone-300 mt-1">প্রতিটি ক্ষণ ভরে উঠুক অনাবিল আনন্দে ও ভালোবাসায়।</p>
              </div>
            )}
          </div>
        )}

        <ReactionBox wishId={wish.id} senderName={wish.senderName} />

        {!wish.selfDestruct && (
          <div className="mt-6 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white text-center mb-3">এই চিঠিটি শেয়ার বা সংরক্ষণ করো</h3>
            <ShareBar
              tone="dark"
              url={shareUrl}
              text={inviteText(wish.recipientName)}
              onSaveImage={() =>
                downloadLetterPng({
                  theme,
                  recipient: wish.recipientName,
                  sender: wish.senderName,
                  message: content.message,
                  font: wish.fontStyle,
                  photoUrl: content.photoUrl,
                })
              }
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={closeEnvelope}
            className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>পুনরায় খাম বন্ধ করুন</span>
          </button>
        </div>

        <div className="mt-8 w-full max-w-md bg-gradient-to-r from-rose-900/40 via-purple-900/40 to-amber-900/40 border border-white/20 rounded-3xl p-5 text-center shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">আপনিও কি প্রিয়জনকে এমন জন্মদিনের চিঠি পাঠাতে চান?</h3>
          <p className="text-xs text-stone-300 mb-4">
            খুব সহজেই তৈরি করুন এমন সুন্দর জাদুকরী খাম ও আবেগভরা চিঠি—১ ক্লিকে লিঙ্ক পাঠিয়ে চমকে দিন প্রিয়জনকে!
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
    );
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-b ${theme.bgGradient} text-white flex flex-col justify-between selection:bg-rose-500 selection:text-white`}
    >
      <canvas ref={balloonRef} className="fixed inset-0 pointer-events-none z-40 w-full h-full" />
      <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl" />
      </div>

      <header className="relative z-20 max-w-4xl mx-auto w-full px-4 pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-stone-200 transition"
        >
          <span>← অনুভূতি হোম</span>
        </Link>

        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          aria-label="সাউন্ড অন/অফ"
          className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 hover:text-white transition cursor-pointer"
          title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
        </button>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full">
        {renderStage()}
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-stone-400 border-t border-white/10">
        <p>© {new Date().getFullYear()} অনূভুতি (Onuvuti) • প্রতিটি অনুভূতির একটি গল্প আছে</p>
      </footer>
    </div>
  );
}
