"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  BIRTHDAY_TEMPLATES,
  WISH_THEMES,
  OCCASIONS,
  type OccasionType,
  type BirthdayTemplate,
  type WishTheme,
} from "@/data/birthdayTemplates";
import {
  Sparkles,
  RefreshCw,
  Gift,
  Crown,
  HeartHandshake,
  Heart,
  Camera,
  Mic,
  Music,
  Clock,
  Key,
  Flame,
  Check,
  Mail,
  Sliders,
  FileText,
} from "lucide-react";
import { wishApi } from "@/features/wish/api";
import { localInputToIso } from "@/features/wish/media";
import { HANDWRITING_FONT } from "@/features/wish/share";
import type { CreatedWish, WishFont, WishMusic } from "@/features/wish/types";
import { formatGiftVoucherTag } from "@/features/wish/giftVoucher";
import CreatedCard from "@/features/wish/components/CreatedCard";
import MusicPicker from "@/features/wish/components/MusicPicker";
import PhotoPicker from "@/features/wish/components/PhotoPicker";
import SpecialOptions, { SpecialOptionsValue } from "@/features/wish/components/SpecialOptions";
import VoiceRecorder from "@/features/wish/components/VoiceRecorder";
import useGoogleFont from "@/features/wish/useGoogleFont";
import { AdsterraResponsiveBanner, AdsterraPopunder } from "@/components/ads/AdsterraUnits";

const FONT_CHOICES: { id: WishFont; label: string }[] = [
  { id: "classic", label: "ক্লাসিক ফন্ট" },
  { id: "handwritten", label: "হাতের লেখা" },
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
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionType>("birthday");
  const currentOccasion = OCCASIONS.find((o) => o.id === selectedOccasion) || OCCASIONS[0];

  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [relationship, setRelationship] = useState(currentOccasion.relations[0]);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState("all");
  const [previewTab, setPreviewTab] = useState<"envelope" | "letter">("envelope");
  const [message, setMessage] = useState(
    BIRTHDAY_TEMPLATES.find((t) => t.occasion === "birthday")?.fullMessage || BIRTHDAY_TEMPLATES[0].fullMessage
  );
  const [selectedThemeId, setSelectedThemeId] = useState("gold");
  const [fontStyle, setFontStyle] = useState<WishFont>("classic");
  const [music, setMusic] = useState<WishMusic>("happy_birthday");
  const [photoUrl, setPhotoUrl] = useState("");
  const [voiceUrl, setVoiceUrl] = useState("");
  const [special, setSpecial] = useState<SpecialOptionsValue>(EMPTY_SPECIAL);

  // Digital Salami & Gift Voucher State
  const [includeGift, setIncludeGift] = useState(false);
  const [giftTitle, setGiftTitle] = useState("");
  const [giftAmount, setGiftAmount] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [giftToken, setGiftToken] = useState("");

  // Quick Wedding Details Helper State
  const [showWeddingHelper, setShowWeddingHelper] = useState(false);
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingTime, setWeddingTime] = useState("");
  const [weddingVenue, setWeddingVenue] = useState("");
  const [weddingContact, setWeddingContact] = useState("");

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("onuvuti_my_wishes");
      if (raw) setMyWishes(JSON.parse(raw));
    } catch {}
  }, []);

  const handleOccasionChange = (occId: OccasionType) => {
    setSelectedOccasion(occId);
    setSelectedTemplateCategory("all");
    const occ = OCCASIONS.find((o) => o.id === occId);
    if (!occ) return;

    setRelationship(occ.relations[0]);
    setSelectedThemeId(occ.defaultTheme);
    setMusic(occ.defaultMusic);

    const matchingTemplate = BIRTHDAY_TEMPLATES.find((t) => t.occasion === occId);
    if (matchingTemplate) {
      setMessage(matchingTemplate.fullMessage);
    }
  };

  const selectedTheme: WishTheme =
    WISH_THEMES.find((t) => t.id === selectedThemeId) || WISH_THEMES[0];

  const handleSelectTemplate = (tmpl: BirthdayTemplate) => setMessage(tmpl.fullMessage);

  const occasionTemplates = BIRTHDAY_TEMPLATES.filter(
    (t) => !t.occasion || t.occasion === selectedOccasion
  );

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    occasionTemplates.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [occasionTemplates]);

  const displayedTemplates = occasionTemplates.filter(
    (t) => selectedTemplateCategory === "all" || t.category === selectedTemplateCategory
  );

  const handleApplyWeddingHelper = () => {
    const g = groomName.trim() || "[বরের নাম]";
    const b = brideName.trim() || "[কনের নাম]";
    const d = weddingDate.trim() || "[তারিখ লিখুন]";
    const t = weddingTime.trim() || "সন্ধ্যা ৭:০০ ঘটিকা";
    const v = weddingVenue.trim() || "[ভেন্যুর নাম ও পূর্ণাঙ্গ ঠিকানা]";
    const c = weddingContact.trim();

    const generated = `পরম করুণাময় সৃষ্টিকর্তার অশেষ কৃপায়—
আমাদের পারিবারিক জীবনে শুরু হতে যাচ্ছে এক পবিত্র ও আনন্দঘন নতুন অধ্যায়। 

পাত্র: ${g}
ও
পাত্রী: ${b}

শুভ বিবাহ ও প্রীতিভোজ অনুষ্ঠান:
তারিখ: ${d}
সময়: ${t}
ভেন্যু: ${v}

এই আনন্দঘন শুভলগ্নে আপনার ও আপনার পরিবারের সাদর উপস্থিতি এবং নবদম্পতির আগামীর সুন্দর জীবনের জন্য দোয়া ও আশীর্বাদ আমাদের একান্ত কাম্য।

বিনীত ও নিমন্ত্রণকারী—
${senderName.trim() || "[পরিবারের নাম]"}
${c ? `মোবাইল: ${c}` : ""}`.trim();

    setMessage(generated);
    setShowWeddingHelper(false);
  };

  const handleCreateWish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!recipientName.trim()) {
      return setErrorMsg(`${currentOccasion.recipientLabel.split("(")[0].trim()} লিখুন`);
    }
    if (!senderName.trim()) {
      return setErrorMsg(`${currentOccasion.senderLabel.split("(")[0].trim()} লিখুন`);
    }
    if (message.trim().length < 5) {
      return setErrorMsg("চিঠির বার্তা অন্তত ৫ অক্ষরের হতে হবে");
    }

    const passcode = special.passcode.trim();
    if (passcode && (passcode.length < 4 || passcode.length > 20)) {
      return setErrorMsg("সিক্রেট কোড ৪ থেকে ২০ অক্ষরের হতে হবে");
    }

    const unlockAt = special.scheduleOn ? localInputToIso(special.unlockLocal) : undefined;
    if (special.scheduleOn && (!unlockAt || new Date(unlockAt) <= new Date())) {
      return setErrorMsg("চিঠি খোলার সময় ভবিষ্যতের হতে হবে");
    }

    let finalMessage = message.trim();
    if (includeGift && (giftTitle.trim() || giftAmount.trim())) {
      finalMessage += formatGiftVoucherTag({
        title:
          giftTitle.trim() ||
          (selectedOccasion === "wedding"
            ? "বিয়ের প্রীতি উপহার"
            : selectedOccasion === "love"
            ? "ভালোবাসার উপহার"
            : "মিষ্টি সালামি"),
        amount: giftAmount.trim(),
        note: giftNote.trim(),
        token: giftToken.trim() || undefined,
      });
    }

    setLoading(true);
    const result = await wishApi.create({
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
      relationship: relationship.trim(),
      message: finalMessage,
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

  const occasionIcon = (id: OccasionType) => {
    switch (id) {
      case "birthday":
        return <Gift className="w-4 h-4" />;
      case "wedding":
        return <Crown className="w-4 h-4" />;
      case "anniversary":
        return <HeartHandshake className="w-4 h-4" />;
      case "love":
        return <Heart className="w-4 h-4" />;
    }
  };

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

      <AdsterraPopunder />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold mb-3 border border-rose-200 dark:border-rose-800 shadow-xs">
            {occasionIcon(selectedOccasion)}
            <span>{currentOccasion.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
            {currentOccasion.headerTitle}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mt-2">
            {currentOccasion.description}
          </p>
        </div>

        {/* 4 Occasion Tabs Selector */}
        <div className="mb-8 p-1.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 grid grid-cols-2 sm:grid-cols-4 gap-1.5 shadow-inner">
          {OCCASIONS.map((occ) => {
            const isActive = selectedOccasion === occ.id;
            return (
              <button
                key={occ.id}
                type="button"
                onClick={() => handleOccasionChange(occ.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#111827] text-[#7E151E] dark:text-rose-400 shadow-sm border border-stone-200/80 dark:border-stone-700 scale-[1.01]"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-700/60"
                }`}
              >
                {occasionIcon(occ.id)}
                <span>{occ.label}</span>
              </button>
            );
          })}
        </div>

        {myWishes.length > 0 && !created && (
          <div className="mb-8 p-4 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                <span>আপনার তৈরি করা কার্ড ও চিঠিসমূহ</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px]">
                  {myWishes.length}টি
                </span>
              </span>
              <span className="text-[11px] text-stone-400 hidden sm:inline">প্রাপকের প্রতিক্রিয়া দেখতে ক্লিক করুন</span>
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
                    <span>মেহমান ও উত্তর দেখুন</span>
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
                <label className={labelCls}>{currentOccasion.recipientLabel} *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={currentOccasion.recipientPlaceholder}
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>{currentOccasion.senderLabel} *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder={currentOccasion.senderPlaceholder}
                  className={fieldCls}
                />
              </div>
            </div>

            {/* Relationship / Category */}
            <div>
              <label className={`${labelCls} mb-2`}>শ্রেণি ও সম্বোধন</label>
              <div className="flex flex-wrap gap-2">
                {currentOccasion.relations.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRelationship(item)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer ${
                      relationship === item
                        ? "bg-[#7E151E] text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ready-made Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  রেডিমেড বয়ান ও চিঠি (১ ক্লিকে বেছে নিন)
                </label>
                <span className="text-[11px] text-stone-400">
                  {displayedTemplates.length}টি টেমপ্লেট
                </span>
              </div>

              {/* Category Filter Chips */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplateCategory("all")}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                      selectedTemplateCategory === "all"
                        ? "bg-[#7E151E] text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    সব ({occasionTemplates.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTemplateCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                        selectedTemplateCategory === cat
                          ? "bg-[#7E151E] text-white shadow-xs"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayedTemplates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="p-2.5 rounded-2xl border text-left transition hover:border-[#7E151E] dark:hover:border-rose-400 bg-stone-50/70 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-800 cursor-pointer border-stone-200 dark:border-stone-700"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                      <FileText className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400 shrink-0" />
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
              {selectedOccasion === "wedding" && (
                <div className="mb-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        সহজে বিয়ের কার্ড সাজান (কুইক ফিল্ডার)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWeddingHelper((v) => !v)}
                      className="text-[11px] font-bold text-[#7E151E] dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      {showWeddingHelper ? "ফর্ম লুকান" : "তথ্য পূরণ করুন"}
                    </button>
                  </div>

                  {showWeddingHelper && (
                    <div className="space-y-3 pt-2 text-xs animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">পাত্রের নাম (Groom)</label>
                          <input
                            type="text"
                            value={groomName}
                            onChange={(e) => setGroomName(e.target.value)}
                            placeholder="যেমন: তানভীর আহমেদ"
                            className={fieldCls}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">পাত্রীর নাম (Bride)</label>
                          <input
                            type="text"
                            value={brideName}
                            onChange={(e) => setBrideName(e.target.value)}
                            placeholder="যেমন: সুমাইয়া রহমান"
                            className={fieldCls}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">তারিখ (Date)</label>
                          <input
                            type="text"
                            value={weddingDate}
                            onChange={(e) => setWeddingDate(e.target.value)}
                            placeholder="যেমন: ২৫শে ডিসেম্বর, ২০২৬"
                            className={fieldCls}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">সময় (Time)</label>
                          <input
                            type="text"
                            value={weddingTime}
                            onChange={(e) => setWeddingTime(e.target.value)}
                            placeholder="যেমন: সন্ধ্যা ৭:০০ ঘটিকা"
                            className={fieldCls}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">ভেন্যুর নাম ও ঠিকানা (Venue)</label>
                        <input
                          type="text"
                          value={weddingVenue}
                          onChange={(e) => setWeddingVenue(e.target.value)}
                          placeholder="যেমন: সেনাকুঞ্জ কনভেনশন সেন্টার, ঢাকা সেনানিবাস"
                          className={fieldCls}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">যোগাযোগের নম্বর (Phone)</label>
                        <input
                          type="text"
                          value={weddingContact}
                          onChange={(e) => setWeddingContact(e.target.value)}
                          placeholder="যেমন: 017XXXXXXXX"
                          className={fieldCls}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyWeddingHelper}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-[#7E151E] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>কার্ডের বয়ান স্বয়ংক্রিয়ভাবে সাজিয়ে নিন</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {selectedOccasion === "wedding"
                    ? "বিবাহ নিমন্ত্রণপত্র ও শুভকামনার বিস্তারিত বিবরণ *"
                    : selectedOccasion === "anniversary"
                    ? "বিবাহবার্ষিকীর স্মৃতিচারণ ও ভালোবাসার বার্তা *"
                    : selectedOccasion === "love"
                    ? "আপনার অনুভূতির কথা ও চিঠি *"
                    : "আপনার জন্মদিনের চিঠি ও শুভেচ্ছা বার্তা *"}
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
                placeholder="এখানে আপনার মনের অনুভূতি, কবিতা বা নিমন্ত্রণপত্রের বিস্তারিত বিবরণ লিখুন..."
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
                <label className={`${labelCls} mb-2 flex items-center gap-1.5`}>
                  <Camera className="w-3.5 h-3.5 text-stone-500" />
                  <span>স্মৃতির ছবি (ঐচ্ছিক)</span>
                </label>
                <PhotoPicker value={photoUrl} onChange={setPhotoUrl} />
              </div>
              <div>
                <label className={`${labelCls} mb-2 flex items-center gap-1.5`}>
                  <Mic className="w-3.5 h-3.5 text-stone-500" />
                  <span>কণ্ঠস্বর বা ভয়েস মেসেজ (ঐচ্ছিক)</span>
                </label>
                <VoiceRecorder value={voiceUrl} onChange={setVoiceUrl} />
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className={`${labelCls} mb-2`}>খামের ডিজাইন ও রাজকীয় সিলমোহর</label>
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
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white shadow-xs shrink-0 font-bold"
                      style={{ backgroundColor: t.envelopeColor }}
                    >
                      {t.sealText.slice(0, 3)}
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
              <label className={`${labelCls} mb-2 flex items-center gap-1.5`}>
                <Music className="w-3.5 h-3.5 text-stone-500" />
                <span>চিঠি খুললে ব্যাকগ্রাউন্ড সুর</span>
              </label>
              <MusicPicker value={music} onChange={setMusic} />
            </div>

            {/* Special options */}
            <div>
              <label className={`${labelCls} mb-2 flex items-center gap-1.5`}>
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                <span>নিরাপত্তা ও বিশেষ সেটিংস</span>
              </label>
              <SpecialOptions value={special} onChange={setSpecial} occasion={selectedOccasion} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-[#7E151E] to-rose-600 hover:opacity-95 text-white font-bold text-sm shadow-xl transition transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ডিজিটাল কার্ড তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>
                    {selectedOccasion === "wedding"
                      ? "শুভ বিবাহ নিমন্ত্রণপত্র তৈরি করুন"
                      : selectedOccasion === "anniversary"
                      ? "বিবাহবার্ষিকীর চিঠি তৈরি করুন"
                      : selectedOccasion === "love"
                      ? "ভালোবাসার বিশেষ চিঠি তৈরি করুন"
                      : "জাদুকরী জন্মদিনের চিঠি তৈরি করুন"}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Live Preview Envelope & Letter */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl border border-stone-800 text-center">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  লাইভ প্রিভিউ (Live Preview)
                </span>
                <div className="inline-flex rounded-full bg-stone-800 p-0.5 border border-stone-700">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("envelope")}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      previewTab === "envelope"
                        ? "bg-amber-400 text-stone-900 shadow-xs"
                        : "text-stone-300 hover:text-white"
                    }`}
                  >
                    খাম (Envelope)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("letter")}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      previewTab === "letter"
                        ? "bg-amber-400 text-stone-900 shadow-xs"
                        : "text-stone-300 hover:text-white"
                    }`}
                  >
                    চিঠি (Letter)
                  </button>
                </div>
              </div>

              {previewTab === "envelope" ? (
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
                    {recipientName.trim() || currentOccasion.recipientPlaceholder.replace("যেমন: ", "")}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    From: {senderName.trim() || currentOccasion.senderPlaceholder.replace("যেমন: ", "")}
                  </p>

                  <div
                    className="absolute bottom-3 w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-amber-300/60 ring-2 ring-black/20 text-center px-1"
                    style={{ backgroundColor: selectedTheme.sealColor }}
                  >
                    {selectedTheme.sealText}
                  </div>
                </div>
              ) : (
                <div
                  className="w-full aspect-[16/11] rounded-2xl relative shadow-2xl border p-4 text-left flex flex-col justify-between overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: selectedTheme.letterBg,
                    color: selectedTheme.textColor,
                    borderColor: `${selectedTheme.accentColor}40`,
                    fontFamily: previewFont,
                    backgroundImage:
                      fontStyle === "handwritten"
                        ? `repeating-linear-gradient(to bottom, transparent, transparent 23px, ${selectedTheme.accentColor}15 23px, ${selectedTheme.accentColor}15 24px)`
                        : undefined,
                  }}
                >
                  {/* Inner dashed inlay */}
                  <div
                    className="absolute inset-2 rounded-xl pointer-events-none border border-dashed opacity-25"
                    style={{ borderColor: selectedTheme.accentColor }}
                  />

                  <div>
                    <div className="flex items-center justify-between border-b border-stone-200/60 pb-1.5 mb-2 relative z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-75" style={{ color: selectedTheme.accentColor }}>
                        {currentOccasion.headerTitle}
                      </span>
                      {selectedOccasion === "wedding" ? (
                        <Crown className="w-3.5 h-3.5 opacity-80" style={{ color: selectedTheme.accentColor }} />
                      ) : selectedOccasion === "anniversary" ? (
                        <HeartHandshake className="w-3.5 h-3.5 opacity-80" style={{ color: selectedTheme.accentColor }} />
                      ) : (
                        <Heart className="w-3 h-3 fill-current opacity-60" style={{ color: selectedTheme.accentColor }} />
                      )}
                    </div>
                    {selectedOccasion === "wedding" && (
                      <p className="font-serif text-[10px] text-center tracking-widest opacity-85 mb-1 select-none" style={{ color: selectedTheme.accentColor }}>
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                    )}
                    <p className="text-xs font-bold mb-1 relative z-10">
                      {selectedOccasion === "wedding"
                        ? `সম্মানিত ${recipientName.trim() || "অতিথি"},`
                        : `প্রিয় ${recipientName.trim() || "অনন্যা"},`}
                    </p>
                    <p className="text-[11px] leading-relaxed line-clamp-3 opacity-90 relative z-10">
                      <span className="text-xs font-serif opacity-30 mr-1 font-bold">“</span>
                      {message.trim() || "আপনার ভালোবাসার চিঠি ও শুভেচ্ছার কথা..."}
                      <span className="text-xs font-serif opacity-30 ml-1 font-bold">”</span>
                    </p>
                  </div>

                  <div className="border-t border-stone-200/60 pt-1 flex items-center justify-between mt-2 relative z-10">
                    <div
                      className="w-7 h-7 rounded-full border border-dashed flex items-center justify-center text-[6px] font-bold uppercase rotate-[-6deg]"
                      style={{
                        borderColor: `${selectedTheme.accentColor}50`,
                        color: selectedTheme.accentColor,
                        backgroundColor: `${selectedTheme.accentColor}12`,
                      }}
                    >
                      SEALED
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] opacity-60 block">ভালোবাসা ও শুভকামনায়,</span>
                      <span className="text-[11px] font-bold" style={{ color: selectedTheme.accentColor }}>
                        — {senderName.trim() || "আপনার নাম"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[10px] font-bold">
                {photoUrl && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-amber-300" />
                    <span>ছবি যুক্ত</span>
                  </span>
                )}
                {voiceUrl && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
                    <Mic className="w-3 h-3 text-emerald-300" />
                    <span>ভয়েস যুক্ত</span>
                  </span>
                )}
                {music !== "none" && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
                    <Music className="w-3 h-3 text-purple-300" />
                    <span>মিউজিক চালু</span>
                  </span>
                )}
                {special.scheduleOn && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-300" />
                    <span>টাইমার সেট</span>
                  </span>
                )}
                {special.passcode.trim() && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
                    <Key className="w-3 h-3 text-yellow-300" />
                    <span>পাসকোড লক</span>
                  </span>
                )}
                {special.selfDestruct && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-300" />
                    <span>একবার পাঠ্য</span>
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start gap-2 text-xs text-stone-400 leading-relaxed text-left">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-300 font-semibold">{recipientName || "প্রাপক"}</strong> লিঙ্কে
                  ক্লিক করলেই এই খামটি জীবন্ত হয়ে উঠবে এবং মোমের সিল ভেঙে সুর ও অ্যানিমেশনের সাথে কার্ডটি উন্মুক্ত হবে।
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-100 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ডিজিটাল কার্ডের বিশেষ সুবিধাসমূহ:</span>
              </div>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>মোমের সিল, খাম খোলার অ্যানিমেশন, কনফেটি ও উৎসবের অনুভূতি</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>সানাই ও মেলোডিক সুর, স্মৃতির ছবি ও নিজস্ব কণ্ঠে অডিও মেসেজ</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>নির্দিষ্ট ক্ষণে খোলার কাউন্টডাউন টাইমার ও সিক্রেট পাসকোড লক</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>প্রাপকের অনুভূতি ও রিঅ্যাকশন দেখার গোপন লিংক</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>সরাসরি WhatsApp/Telegram-এ পাঠানো বা কার্ড হিসেবে ডাউনলোড</span>
              </p>
            </div>
          </div>
        </div>

        <AdsterraResponsiveBanner className="mt-12" />
      </main>
    </div>
  );
}
