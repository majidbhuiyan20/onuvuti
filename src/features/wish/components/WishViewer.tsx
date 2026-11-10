"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { WISH_THEMES, WishTheme } from "@/data/birthdayTemplates";
import { Flame, RotateCcw, Send, Volume2, VolumeX, Sparkles, Crown, HeartHandshake } from "lucide-react";
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
import BirthdayCakeCeremony from "./BirthdayCakeCeremony";
import WeddingInteractiveCard from "./WeddingInteractiveCard";
import LoveProposalInteractiveCard from "./LoveProposalInteractiveCard";
import StoryExportModal from "./StoryExportModal";
import { detectOccasion } from "../occasionHelper";
import { AdsterraBanner300x250, AdsterraPopunder } from "@/components/ads/AdsterraUnits";

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
  const [showStoryModal, setShowStoryModal] = useState(false);

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
    burstConfetti(confettiRef.current, 130);
    floatBalloons(balloonRef.current, 12);
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

    const occasion = detectOccasion(wish, content?.message);

    return (
      <div className="w-full max-w-xl animate-fade-in-up flex flex-col items-center">
        {wish.selfDestruct && (
          <div className="mb-4 w-full rounded-2xl bg-rose-500/15 border border-rose-400/40 p-3 text-center text-xs font-semibold text-rose-200 flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 text-amber-300 shrink-0" />
            <span>এটি একটি গোপন চিঠি—পেজ রিফ্রেশ করলে বা বন্ধ করলে আর কখনো দেখা যাবে না। এখনই পড়ে নিন!</span>
          </div>
        )}

        <LetterCard
          wish={wish}
          content={content}
          theme={theme}
          isMusicPlaying={soundEnabled && wish.music !== "none"}
        />

        {/* Ad directly after Letter Card */}
        <div className="w-full max-w-md my-6 flex justify-center">
          <AdsterraBanner300x250 />
        </div>

        {/* Occasion Interactive Ceremony Card */}
        {occasion.isWedding ? (
          <div className="mt-8 w-full max-w-xl">
            <WeddingInteractiveCard
              wishId={wish.id}
              senderName={wish.senderName}
              recipientName={wish.recipientName}
              message={content.message}
              blessed={candleBlown}
              onBless={handleBlowCandle}
            />
          </div>
        ) : occasion.isAnniversary ? (
          <div className="mt-8 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 text-center shadow-xl">
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
        ) : occasion.isLove ? (
          <div className="mt-8 w-full max-w-md">
            <LoveProposalInteractiveCard
              recipientName={wish.recipientName}
              senderName={wish.senderName}
              isProposal={occasion.isProposal}
              accepted={candleBlown}
              onAccept={handleBlowCandle}
              onScrollToReply={() => {
                const el = document.getElementById("reaction-box-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        ) : (
          <div className="mt-8 w-full max-w-md">
            <BirthdayCakeCeremony
              recipientName={wish.recipientName}
              isBlown={candleBlown}
              onBlow={handleBlowCandle}
              onRelight={() => setCandleBlown(false)}
            />
          </div>
        )}

        {/* Dedicated 1080x1920 Instagram & Facebook Story Keepsake Card */}
        {!wish.selfDestruct && (
          <div className="mt-6 w-full max-w-md bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 backdrop-blur-md border border-amber-300/30 rounded-3xl p-5 shadow-xl text-center animate-fade-in">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>সোশ্যাল মিডিয়া স্টোরি ও স্মৃতি</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              ফেসবুক ও ইনস্টাগ্রাম স্টোরি কার্ড
            </h3>
            <p className="text-xs text-stone-300 mb-4 max-w-xs mx-auto">
              আপনার এই সুন্দর চিঠি ও স্মৃতি দিয়ে ১ ক্লিকেই তৈরি করুন ১০৮০x১৯২০ সাইজের হাই-রেজুলিউশন স্টোরি ইমেজ!
            </p>
            <button
              type="button"
              onClick={() => setShowStoryModal(true)}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>১০৮০x১৯২০ স্টোরি কার্ড প্রিভিউ ও সেভ করুন</span>
            </button>
          </div>
        )}

        <div id="reaction-box-section" className="w-full max-w-md">
          {!occasion.isWedding && <ReactionBox wishId={wish.id} senderName={wish.senderName} />}
        </div>

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
            className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>পুনরায় খাম বন্ধ করুন</span>
          </button>
        </div>

        <div className="mt-8 w-full max-w-md bg-gradient-to-r from-rose-900/40 via-purple-900/40 to-amber-900/40 border border-white/20 rounded-3xl p-5 text-center shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">{occasion.ctaTitle}</h3>
          <p className="text-xs text-stone-300 mb-4">{occasion.ctaSubtitle}</p>
          <Link
            href="/birthday-wish"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl transition transform hover:scale-102"
          >
            <Send className="w-4 h-4" />
            <span>নিজের জন্য এমন একটি চিঠি তৈরি করুন →</span>
          </Link>
        </div>

        <AdsterraBanner300x250 className="mt-6" />

        {/* 1080x1920 Story Export Modal */}
        {showStoryModal && content && (
          <StoryExportModal
            isOpen={showStoryModal}
            onClose={() => setShowStoryModal(false)}
            input={{
              theme,
              recipient: wish.recipientName,
              sender: wish.senderName,
              message: content.message,
              font: wish.fontStyle,
              photoUrl: content.photoUrl,
              relationship: wish.relationship,
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-b ${theme.bgGradient} text-white flex flex-col justify-between selection:bg-rose-500 selection:text-white`}
    >
      <AdsterraPopunder />
      <canvas ref={balloonRef} className="fixed inset-0 pointer-events-none z-40 w-full h-full" />
      <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

      {/* Floating Ambient Stardust and Light Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-rose-500/25 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/25 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      <header className="relative z-20 max-w-4xl mx-auto w-full px-4 pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-stone-200 transition"
        >
          <span className="text-amber-300/90 font-medium">← অনুভূতি হোম</span>
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
