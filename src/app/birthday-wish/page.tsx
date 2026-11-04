"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  BIRTHDAY_TEMPLATES,
  WISH_THEMES,
  BirthdayTemplate,
  WishTheme,
} from "@/data/birthdayTemplates";
import { Sparkles, RefreshCw, Gift } from "lucide-react";
import { wishApi } from "@/features/wish/api";
import { localInputToIso } from "@/features/wish/media";
import { HANDWRITING_FONT } from "@/features/wish/share";
import type { CreatedWish, WishFont, WishMusic } from "@/features/wish/types";
import CreatedCard from "@/features/wish/components/CreatedCard";
import MusicPicker from "@/features/wish/components/MusicPicker";
import PhotoPicker from "@/features/wish/components/PhotoPicker";
import SpecialOptions, { SpecialOptionsValue } from "@/features/wish/components/SpecialOptions";
import VoiceRecorder from "@/features/wish/components/VoiceRecorder";
import useGoogleFont from "@/features/wish/useGoogleFont";

const RELATIONS = [
  { label: "ভালোবাসা", emoji: "❤️" },
  { label: "প্রিয় বন্ধু", emoji: "🤝" },
  { label: "গোপন ক্রাশ", emoji: "💌" },
  { label: "ভাই-বোন", emoji: "🎁" },
  { label: "বিশেষ কেউ", emoji: "✨" },
];

const FONT_CHOICES: { id: WishFont; label: string }[] = [
  { id: "classic", label: "ক্লাসিক লেখা" },
  { id: "handwritten", label: "✍️ হাতের লেখা" },
];

const fieldCls =
  "w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7E151E]";
const labelCls = "block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5";

const EMPTY_SPECIAL: SpecialOptionsValue = {
  scheduleOn: false,
  unlockLocal: "",
  passcode: "",
  selfDestruct: false,
};

interface MyWishItem {
  id: string;
  recipientName: string;
  manageKey: string;
  createdAt: string;
}

export default function BirthdayWishCreatorPage() {
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [relationship, setRelationship] = useState("ভালোবাসা");
  const [message, setMessage] = useState(BIRTHDAY_TEMPLATES[0].fullMessage);
  const [selectedThemeId, setSelectedThemeId] = useState("rose");
  const [fontStyle, setFontStyle] = useState<WishFont>("classic");
  const [music, setMusic] = useState<WishMusic>("happy_birthday");
  const [photoUrl, setPhotoUrl] = useState("");
  const [voiceUrl, setVoiceUrl] = useState("");
  const [special, setSpecial] = useState<SpecialOptionsValue>(EMPTY_SPECIAL);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [myWishes, setMyWishes] = useState<MyWishItem[]>([]);
  const [created, setCreated] = useState<{
    wish: CreatedWish;
    recipient: string;
    selfDestruct: boolean;
    hasPasscode: boolean;
    scheduledLabel?: string;
  } | null>(null);

  useGoogleFont(fontStyle === "handwritten");

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("onuvuti_my_wishes");
      if (raw) setMyWishes(JSON.parse(raw));
    } catch {}
  }, []);

  const selectedTheme: WishTheme =
    WISH_THEMES.find((t) => t.id === selectedThemeId) || WISH_THEMES[0];

  const handleSelectTemplate = (tmpl: BirthdayTemplate) => setMessage(tmpl.fullMessage);

  const handleCreateWish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!recipientName.trim()) return setErrorMsg("যার জন্মদিন তার নাম লিখুন");
    if (!senderName.trim()) return setErrorMsg("আপনার নাম লিখুন");
    if (message.trim().length < 5) return setErrorMsg("চিঠির বার্তা অন্তত ৫ অক্ষরের হতে হবে");

    const passcode = special.passcode.trim();
    if (passcode && (passcode.length < 4 || passcode.length > 20)) {
      return setErrorMsg("সিক্রেট কোড ৪ থেকে ২০ অক্ষরের হতে হবে");
    }

    const unlockAt = special.scheduleOn ? localInputToIso(special.unlockLocal) : undefined;
    if (special.scheduleOn && (!unlockAt || new Date(unlockAt) <= new Date())) {
      return setErrorMsg("চিঠি খোলার সময় ভবিষ্যতের হতে হবে");
    }

    setLoading(true);
    const result = await wishApi.create({
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
      relationship: relationship.trim(),
      message: message.trim(),
      theme: selectedThemeId,
      fontStyle,
      music,
      photoUrl: photoUrl || undefined,
      voiceUrl: voiceUrl || undefined,
      unlockAt,
      passcode: passcode || undefined,
      selfDestruct: special.selfDestruct,
    });
    setLoading(false);

    if (!result.ok) return setErrorMsg(result.error);

    try {
      const item: MyWishItem = {
        id: result.data.id,
        recipientName: recipientName.trim(),
        manageKey: result.data.manageKey,
        createdAt: new Date().toISOString(),
      };
      const next = [item, ...myWishes.filter((w) => w.id !== item.id)].slice(0, 20);
      setMyWishes(next);
      localStorage.setItem("onuvuti_my_wishes", JSON.stringify(next));
    } catch {}

    setCreated({
      wish: result.data,
      recipient: recipientName.trim(),
      selfDestruct: special.selfDestruct,
      hasPasscode: !!passcode,
      scheduledLabel: unlockAt
        ? new Date(unlockAt).toLocaleString("bn-BD", { dateStyle: "long", timeStyle: "short" })
        : undefined,
    });
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const previewFont = fontStyle === "handwritten" ? HANDWRITING_FONT : undefined;

  return (
    <div className="min-h-screen bg-[#FCFAF6] dark:bg-[#0B0F17] text-stone-800 dark:text-stone-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FAF7F2]/95 dark:bg-[#0B0F17]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 transition"
            >
              হোমপেজ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold mb-3 border border-rose-200 dark:border-rose-800 shadow-xs">
            <Gift className="w-3.5 h-3.5" />
            <span>জাদুকরী ডিজিটাল জন্মদিনের চিঠি</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
            প্রিয় মানুষের জন্য তৈরি করুন জন্মদিনের চিঠি
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-2">
            ছবি, ভয়েস, মিউজিক আর কনফেটি-বেলুনে সাজানো জাদুকরী খাম। চাইলে জন্মদিনের রাত ১২টায় খুলবে,
            সিক্রেট কোডে তালা দেওয়া থাকবে অথবা একবার পড়ার পর মুছে যাবে!
          </p>
        </div>

        {myWishes.length > 0 && !created && (
          <div className="mb-8 p-4 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <span>💌 আপনার পাঠানো চিঠিসমূহ</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px]">
                  {myWishes.length}টি
                </span>
              </span>
              <span className="text-[11px] text-stone-400 hidden sm:inline">প্রাপকের রিঅ্যাকশন দেখতে ক্লিক করুন</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {myWishes.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      To: {w.recipientName}
                    </p>
                    <span className="text-[10px] text-stone-400">
                      #{w.id}
                    </span>
                  </div>
                  <Link
                    href={`/wish/${w.id}/replies?key=${encodeURIComponent(w.manageKey)}`}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-white font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <span>রিঅ্যাকশন দেখুন →</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {created && (
          <CreatedCard
            wish={created.wish}
            recipientName={created.recipient}
            selfDestruct={created.selfDestruct}
            hasPasscode={created.hasPasscode}
            scheduledLabel={created.scheduledLabel}
            onReset={() => setCreated(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleCreateWish}
            className="lg:col-span-7 bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6"
          >
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold"
              >
                {errorMsg}
              </div>
            )}

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>কার জন্মদিন? (Recipient Name) *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="যেমন: অনন্যা / প্রিয় অর্ক"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>আপনার নাম (Sender Name) *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="যেমন: রাতুল / তোমারই একজন"
                  className={fieldCls}
                />
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label className={`${labelCls} mb-2`}>সম্পর্কের ধরন (Relationship)</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setRelationship(item.label)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
                      relationship === item.label
                        ? "bg-[#7E151E] text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div>
              <label className={`${labelCls} mb-2`}>
                আবেগভরা রেডিমেড কবিতা ও চিঠি (১ ক্লিকে বেছে নিন)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BIRTHDAY_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="p-2.5 rounded-2xl border text-left transition hover:border-[#7E151E] dark:hover:border-rose-400 bg-stone-50/70 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 cursor-pointer border-stone-200 dark:border-stone-700"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span>{tmpl.emoji}</span>
                      <span className="truncate">{tmpl.title}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                      {tmpl.preview}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message + writing style */}
            <div>
              <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  আপনার জন্মদিনের চিঠি ও শুভেচ্ছা বার্তা *
                </label>
                <div className="inline-flex rounded-full bg-stone-100 dark:bg-stone-800 p-0.5">
                  {FONT_CHOICES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontStyle(f.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                        fontStyle === f.id
                          ? "bg-[#7E151E] text-white"
                          : "text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={7}
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="এখানে আপনার মনের অনুভূতি, কবিতা বা জন্মদিনের শুভেচ্ছা লিখুন..."
                style={{ fontFamily: previewFont }}
                className={`${fieldCls} py-3 leading-relaxed`}
              />
              <span className="text-[11px] text-stone-400 block text-right mt-1">
                {message.length} টি অক্ষর
              </span>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <div>
                <label className={`${labelCls} mb-2`}>📸 স্মৃতির ছবি (ঐচ্ছিক)</label>
                <PhotoPicker value={photoUrl} onChange={setPhotoUrl} />
              </div>
              <div>
                <label className={`${labelCls} mb-2`}>🎙️ ভয়েস মেসেজ (ঐচ্ছিক)</label>
                <VoiceRecorder value={voiceUrl} onChange={setVoiceUrl} />
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className={`${labelCls} mb-2`}>খামের ডিজাইন ও থিম নির্বাচন</label>
              <div className="grid grid-cols-2 gap-2.5">
                {WISH_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedThemeId(t.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      selectedThemeId === t.id
                        ? "border-[#7E151E] dark:border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-[#7E151E]/20"
                        : "border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: t.envelopeColor }}
                    >
                      {t.sealText}
                    </div>
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {t.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Music */}
            <div>
              <label className={`${labelCls} mb-2`}>🎵 চিঠি খুললে ব্যাকগ্রাউন্ড মিউজিক</label>
              <MusicPicker value={music} onChange={setMusic} />
            </div>

            {/* Special options */}
            <div>
              <label className={`${labelCls} mb-2`}>✨ বিশেষ সেটিংস</label>
              <SpecialOptions value={special} onChange={setSpecial} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-[#7E151E] to-rose-600 hover:opacity-95 text-white font-bold text-sm shadow-xl transition transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>জাদুকরী চিঠি তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>✨ জাদুকরী চিঠি তৈরি করুন</span>
                </>
              )}
            </button>
          </form>

          {/* Live Preview */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl border border-stone-800 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-3">
                লাইভ প্রিভিউ (Live Preview)
              </span>

              <div
                className="w-full aspect-[16/11] rounded-2xl relative shadow-2xl border flex flex-col items-center justify-center p-4 transition-all duration-300"
                style={{
                  backgroundColor: selectedTheme.envelopeColor,
                  borderColor: selectedTheme.envelopeBorder,
                }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-full border-b border-white/20"
                  style={{
                    clipPath: "polygon(0 0, 50% 55%, 100% 0)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                />
                <span className="text-[10px] uppercase tracking-wider text-white/60 block">To:</span>
                <p className="text-base font-bold text-white drop-shadow">
                  {recipientName.trim() || "প্রিয় মানুষের নাম"}
                </p>
                <p className="text-xs text-white/70 mt-0.5">From: {senderName.trim() || "আপনার নাম"}</p>

                <div
                  className="absolute bottom-3 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-amber-300/60 ring-2 ring-black/20"
                  style={{ backgroundColor: selectedTheme.sealColor }}
                >
                  {selectedTheme.sealText}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[10px] font-bold">
                {photoUrl && <span className="px-2 py-0.5 rounded-full bg-white/10">📸 ছবি</span>}
                {voiceUrl && <span className="px-2 py-0.5 rounded-full bg-white/10">🎙️ ভয়েস</span>}
                {music !== "none" && <span className="px-2 py-0.5 rounded-full bg-white/10">🎵 মিউজিক</span>}
                {special.scheduleOn && <span className="px-2 py-0.5 rounded-full bg-white/10">⏰ টাইমার</span>}
                {special.passcode.trim() && <span className="px-2 py-0.5 rounded-full bg-white/10">🔑 কোড</span>}
                {special.selfDestruct && <span className="px-2 py-0.5 rounded-full bg-white/10">🔥 গোপন</span>}
              </div>

              <p className="mt-3 text-xs text-stone-400 leading-relaxed">
                💡{" "}
                <span className="text-stone-300 font-semibold">{recipientName || "প্রিয়জন"}</span> লিঙ্কে
                ক্লিক করলেই এই খামটি জীবন্ত হয়ে উঠবে এবং কনফেটি, বেলুন ও মোমবাতি নিভানোর অ্যানিমেশন চলবে।
              </p>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-100 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>চিঠির বিশেষ সুবিধাসমূহ:</span>
              </div>
              <p>• মোমের সিল, খাম খোলার অ্যানিমেশন, কনফেটি ও ভেসে ওঠা বেলুন</p>
              <p>• ছবি, ভয়েস মেসেজ ও ব্যাকগ্রাউন্ড মিউজিক</p>
              <p>• জন্মদিনের সময়ে খোলার কাউন্টডাউন ও সিক্রেট কোড</p>
              <p>• প্রাপকের রিঅ্যাকশন আপনি গোপন লিঙ্কে দেখতে পাবেন</p>
              <p>• QR কোড, WhatsApp/Telegram শেয়ার ও ছবি হিসেবে সেভ</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
