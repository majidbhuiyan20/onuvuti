"use client";

import React, { useState, useMemo } from "react";
import {
  Crown,
  Sparkles,
  MapPin,
  Calendar,
  ExternalLink,
  Users,
  Check,
  Send,
  Loader2,
  HeartHandshake,
} from "lucide-react";
import { wishApi } from "../api";

interface WeddingInteractiveCardProps {
  wishId: string;
  senderName: string;
  recipientName: string;
  message: string;
  blessed: boolean;
  onBless: () => void;
}

export default function WeddingInteractiveCard({
  wishId,
  senderName,
  recipientName,
  message,
  blessed,
  onBless,
}: WeddingInteractiveCardProps) {
  // RSVP State
  const [attendance, setAttendance] = useState<string>("সপরিবারে উপস্থিত থাকব");
  const [guestCount, setGuestCount] = useState<string>("২ জন");
  const [blessingText, setBlessingText] = useState("");
  const [submittingRsvp, setSubmittingRsvp] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  // Parse Venue and Date from message text if available
  const parsedDetails = useMemo(() => {
    let venue = "";
    let dateStr = "";
    let timeStr = "";

    const lines = message.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^(ভেন্যু|স্থান|স্থান ও ঠিকানা|ভেন্যুর নাম)[:：]\s*(.+)$/i.test(trimmed)) {
        venue = trimmed.replace(/^(ভেন্যু|স্থান|স্থান ও ঠিকানা|ভেন্যুর নাম)[:：]\s*/i, "").trim();
      } else if (/^(তারিখ|শুভ পরিণয় লগ্ন|বিবাহ তারিখ)[:：]\s*(.+)$/i.test(trimmed)) {
        dateStr = trimmed.replace(/^(তারিখ|শুভ পরিণয় লগ্ন|বিবাহ তারিখ)[:：]\s*/i, "").trim();
      } else if (/^(সময়|লগ্নের সময়)[:：]\s*(.+)$/i.test(trimmed)) {
        timeStr = trimmed.replace(/^(সময়|লগ্নের সময়)[:：]\s*/i, "").trim();
      }
    }

    return {
      venue: venue || undefined,
      dateStr: dateStr || undefined,
      timeStr: timeStr || undefined,
    };
  }, [message]);

  const mapsUrl = parsedDetails.venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parsedDetails.venue)}`
    : undefined;

  const calendarUrl = useMemo(() => {
    const title = `শুভ বিবাহ: ${senderName}`;
    const details = `সাদর নিমন্ত্রণপত্র - প্রিয় ${recipientName},\n${message.slice(0, 300)}`;
    const location = parsedDetails.venue || "";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  }, [senderName, recipientName, message, parsedDetails.venue]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRsvp(true);
    setRsvpError("");

    const rsvpSummary = `[RSVP নিমন্ত্রণপত্র]: ${attendance} | মেহমান: ${guestCount}${
      blessingText.trim() ? `\nদোয়া ও বার্তা: “${blessingText.trim()}”` : ""
    }`;

    const res = await wishApi.react(wishId, "❤️", rsvpSummary);
    setSubmittingRsvp(false);

    if (res.ok) {
      setRsvpSubmitted(true);
    } else {
      setRsvpError(res.error || "RSVP পাঠাতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।");
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6 animate-fade-in-up">
      {/* 1. Islamic Royal Header & Blessing Box */}
      <div className="bg-gradient-to-b from-stone-900/90 to-stone-950/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Arabic Calligraphy Header */}
        <p className="font-serif text-amber-200 text-lg sm:text-2xl tracking-widest mb-1.5 opacity-90 select-none drop-shadow">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <span className="text-[11px] uppercase tracking-widest text-amber-300/70 font-semibold block mb-4">
          পরম করুণাময় ও অসীম দয়ালু সৃষ্টিকর্তার অশেষ কৃপায়
        </span>

        {/* Royal Crest Monogram */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 mx-auto mb-3 shadow-lg shadow-amber-500/20">
          <div className="w-full h-full rounded-full bg-[#3d0814] flex items-center justify-center text-amber-300">
            <Crown className="w-7 h-7" />
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-white tracking-wide mb-1">
          নবদম্পতির শুভ পরিণয় ও নতুন জীবনের সূচনা
        </h3>
        <p className="text-xs text-stone-300 max-w-md mx-auto mb-5 leading-relaxed">
          {senderName} পরিবার আপনাকে ও আপনার পরিবারকে এই আনন্দঘন মুহূর্তে পাশে পেতে চায়। নবদম্পতির আগামী দিনের জন্য আন্তরিক দোয়া ও শুভেচ্ছা জানান।
        </p>

        {/* Interactive Blessing Button */}
        {!blessed ? (
          <button
            type="button"
            onClick={onBless}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-950 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 hover:from-amber-200 hover:to-yellow-300 px-6 py-2.5 rounded-full shadow-lg shadow-amber-400/30 transition transform hover:scale-103 active:scale-97 cursor-pointer border border-amber-200 animate-pulse"
          >
            <Sparkles className="w-4 h-4 text-amber-700 fill-current" />
            <span>দোয়া ও শুভাশিস বর্ষণ করুন</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-300/40 text-center animate-fade-in-up space-y-1">
            <p className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>বারাকাল্লাহু লাকুমা ওয়া বারাকা আলাইকুমা!</span>
            </p>
            <p className="text-xs text-stone-200 font-serif italic">
              “আল্লাহ আপনাদের দাম্পত্যে অপার বরকত দান করুন এবং কল্যাণের সাথে আপনাদের একত্রিত রাখুন।”
            </p>
            <p className="text-[11px] text-amber-200/80 pt-1">
              আপনার হৃদয়নিংড়ানো শুভকামনা নবদম্পতির কাছে পৌঁছে গেছে।
            </p>
          </div>
        )}
      </div>

      {/* 2. Venue & Google Maps Navigation + Calendar Card (if detected) */}
      {(parsedDetails.venue || parsedDetails.dateStr) && (
        <div className="bg-white/10 dark:bg-stone-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>অনুষ্ঠানস্থল ও ক্যালেন্ডার শিডিউল</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {parsedDetails.dateStr && (
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">তারিখ ও সময়</span>
                  <p className="text-stone-100 font-semibold mt-0.5">
                    {parsedDetails.dateStr}
                    {parsedDetails.timeStr ? ` • ${parsedDetails.timeStr}` : ""}
                  </p>
                </div>
              </div>
            )}

            {parsedDetails.venue && (
              <div className="p-3.5 rounded-2xl bg-black/25 border border-white/10 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">ভেন্যু ও ঠিকানা</span>
                  <p className="text-stone-100 font-semibold mt-0.5 truncate" title={parsedDetails.venue}>
                    {parsedDetails.venue}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>গুগল ম্যাপে লোকেশন দেখুন</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs border border-white/15 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>গুগল ক্যালেন্ডারে সেভ করুন</span>
            </a>
          </div>
        </div>
      )}

      {/* 3. Dedicated Wedding RSVP Box (উপস্থিতি নিশ্চিতকরণ) */}
      <div className="bg-white/10 dark:bg-stone-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <HeartHandshake className="w-4 h-4 text-amber-300 shrink-0" />
          <h4 className="text-sm font-bold text-white">
            উপস্থিতি নিশ্চিতকরণ (RSVP) • মেহমান হিসেবে সাড়া দিন
          </h4>
        </div>

        {rsvpSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-center animate-fade-in-up space-y-1">
            <Check className="w-6 h-6 text-emerald-300 mx-auto" />
            <p className="text-sm font-bold text-emerald-200">
              আপনার উপস্থিতি ও দোয়ার বার্তা নিমন্ত্রণকারী পরিবারের কাছে পৌঁছে গেছে!
            </p>
            <p className="text-xs text-stone-300 mt-1">
              সাদর নিমন্ত্রণ গ্রহণ করার জন্য আন্তরিক ধন্যবাদ ও কৃতজ্ঞতা।
            </p>
          </div>
        ) : (
          <form onSubmit={handleRsvpSubmit} className="space-y-3.5">
            <p className="text-xs text-stone-300 leading-relaxed">
              অনুষ্ঠানে আপনার অংশগ্রহণ নিশ্চিত করে নিমন্ত্রণকারী পরিবারকে আয়োজনে সহায়তা করুন:
            </p>

            {/* Attendance Choice */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: "সপরিবারে আসব", value: "সপরিবারে উপস্থিত থাকব" },
                { label: "হ্যাঁ, উপস্থিত থাকব", value: "ইনশাআল্লাহ উপস্থিত থাকব" },
                { label: "আসতে পারছি না (দোয়া রইল)", value: "আন্তরিক শুভকামনা (উপস্থিত থাকতে পারছি না)" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setAttendance(item.value)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                    attendance === item.value
                      ? "bg-amber-500/25 border-amber-400 text-amber-200 ring-1 ring-amber-400/50"
                      : "bg-black/20 border-white/10 text-stone-300 hover:bg-black/40"
                  }`}
                >
                  <span className="block">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Guest Count Selection */}
            <div>
              <label className="text-[11px] font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>কতজন অতিথি উপস্থিত থাকবেন?</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {["১ জন", "২ জন", "৩ জন", "৪ জন", "সপরিবারে"].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setGuestCount(cnt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      guestCount === cnt
                        ? "bg-[#7E151E] text-white border border-rose-400 shadow-xs"
                        : "bg-black/20 border border-white/10 text-stone-300 hover:bg-black/40"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Personal Note */}
            <div>
              <textarea
                rows={2}
                maxLength={300}
                value={blessingText}
                onChange={(e) => setBlessingText(e.target.value)}
                placeholder="বর-কনের জন্য দোয়া বা শুভকামনার বার্তা লিখুন (ঐচ্ছিক)..."
                className="w-full px-3.5 py-2 rounded-2xl bg-black/30 border border-white/15 text-xs sm:text-sm text-white placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {rsvpError && <p className="text-xs text-rose-300 font-semibold">{rsvpError}</p>}

            <button
              type="submit"
              disabled={submittingRsvp}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {submittingRsvp ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>RSVP পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>RSVP নিশ্চিত করুন</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
