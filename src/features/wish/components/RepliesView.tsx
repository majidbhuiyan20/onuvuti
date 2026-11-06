"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  RefreshCw,
  Users,
  Check,
  Crown,
  HeartHandshake,
  Copy,
  ExternalLink,
  Mail,
  Eye,
} from "lucide-react";
import { wishApi } from "../api";
import type { WishPublic, WishReply } from "../types";

interface ParsedGuest {
  id: string;
  name: string;
  status: string;
  isAttending: boolean;
  isDeclined: boolean;
  count: number;
  countLabel: string;
  blessing?: string;
  rawText: string;
  createdAt: string;
}

function parseReply(reply: WishReply, defaultRecipient: string): ParsedGuest {
  const text = reply.text || "";
  const isRsvp = text.includes("[RSVP");

  if (!isRsvp) {
    return {
      id: reply.id,
      name: defaultRecipient,
      status: "শুভেচ্ছা বার্তা",
      isAttending: true,
      isDeclined: false,
      count: 1,
      countLabel: "১ জন",
      blessing: text,
      rawText: text,
      createdAt: reply.createdAt,
    };
  }

  // Pattern: [RSVP...]: (optional name) | (status) | মেহমান: (count)
  let name = defaultRecipient;
  let status = "উপস্থিত থাকব";
  let countLabel = "১ জন";
  let count = 1;

  const lines = text.split("\n");
  const mainLine = lines[0];
  const blessingLines = lines.slice(1).join("\n").replace(/^দোয়া ও বার্তা:\s*[“"']?|[”"']?$/g, "").trim();

  const cleaned = mainLine.replace(/^\[RSVP[^\]]*\][:：]?\s*/i, "");
  const parts = cleaned.split("|").map((p) => p.trim());

  if (parts.length >= 3) {
    name = parts[0] || defaultRecipient;
    status = parts[1];
    countLabel = parts[2].replace(/^মেহমান[:：]\s*/i, "");
  } else if (parts.length === 2) {
    status = parts[0];
    countLabel = parts[1].replace(/^মেহমান[:：]\s*/i, "");
  }

  const isDeclined = status.includes("থাকতে পারছি না");
  const isAttending = !isDeclined && (status.includes("উপস্থিত") || status.includes("আসব"));

  if (isDeclined) {
    count = 0;
  } else if (countLabel.includes("সপরিবারে")) {
    count = 4;
  } else if (countLabel.includes("৪")) {
    count = 4;
  } else if (countLabel.includes("৩")) {
    count = 3;
  } else if (countLabel.includes("২")) {
    count = 2;
  } else {
    count = 1;
  }

  return {
    id: reply.id,
    name: name.replace(/^ জনাব\s*|^ প্রিয়\s*/i, ""),
    status,
    isAttending,
    isDeclined,
    count,
    countLabel,
    blessing: blessingLines || undefined,
    rawText: text,
    createdAt: reply.createdAt,
  };
}

export default function RepliesView({ id, manageKey }: { id: string; manageKey: string }) {
  const [wish, setWish] = useState<WishPublic | null>(null);
  const [replies, setReplies] = useState<WishReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "attending" | "declined">("all");
  const [copiedSummary, setCopiedSummary] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await wishApi.replies(id, manageKey);
    if (res.ok) {
      setWish(res.data.wish);
      setReplies(res.data.replies);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [id, manageKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const isWedding = useMemo(() => {
    return (
      wish?.relationship?.includes("বিবাহ") ||
      wish?.theme === "wedding_royal" ||
      replies.some((r) => r.text?.includes("[RSVP") || r.text?.includes("মেহমান:"))
    );
  }, [wish, replies]);

  const parsedGuests = useMemo(() => {
    const defaultName = wish?.recipientName || "মেহমান";
    return replies.map((r) => parseReply(r, defaultName));
  }, [replies, wish?.recipientName]);

  const attendingGuests = useMemo(() => parsedGuests.filter((g) => g.isAttending), [parsedGuests]);
  const declinedGuests = useMemo(() => parsedGuests.filter((g) => g.isDeclined), [parsedGuests]);

  const totalHeadcount = useMemo(() => {
    return attendingGuests.reduce((acc, curr) => acc + curr.count, 0);
  }, [attendingGuests]);

  const familyHeadcount = useMemo(() => {
    return attendingGuests.filter((g) => g.countLabel.includes("সপরিবারে") || g.status.includes("সপরিবারে")).length;
  }, [attendingGuests]);

  const displayedList = useMemo(() => {
    if (filterTab === "attending") return attendingGuests;
    if (filterTab === "declined") return declinedGuests;
    return parsedGuests;
  }, [filterTab, attendingGuests, declinedGuests, parsedGuests]);

  const handleCopySummary = async () => {
    if (!wish) return;

    let text = `শুভ বিবাহ নিমন্ত্রণপত্র - মেহমান উপস্থিতি ও RSVP তালিকা\n`;
    text += `বর-কনে / পরিবার: ${wish.senderName}\n`;
    text += `মোট নিশ্চিত মেহমান: ${totalHeadcount} জন\n`;
    text += `সপরিবারে উপস্থিত: ${familyHeadcount} টি পরিবার\n\n`;

    if (attendingGuests.length > 0) {
      text += `--- উপস্থিত থাকবেন (${attendingGuests.length} জন / পরিবার) ---\n`;
      attendingGuests.forEach((g, idx) => {
        text += `${idx + 1}. ${g.name} (${g.countLabel})${g.blessing ? ` - “${g.blessing}”` : ""}\n`;
      });
      text += `\n`;
    }

    if (declinedGuests.length > 0) {
      text += `--- উপস্থিত থাকতে পারছেন না (${declinedGuests.length} জন) ---\n`;
      declinedGuests.forEach((g, idx) => {
        text += `${idx + 1}. ${g.name}${g.blessing ? ` - “${g.blessing}”` : ""}\n`;
      });
    }

    await navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6] dark:bg-[#0B0F17] text-stone-800 dark:text-stone-100">
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/birthday-wish"
            className="text-xs font-bold text-[#7E151E] dark:text-rose-400 hover:underline"
          >
            ← নিমন্ত্রণপত্র তৈরি পেজ
          </Link>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {loading && !wish ? (
          <div className="py-20 text-center text-xs text-stone-500 inline-flex w-full items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>তথ্য লোড হচ্ছে...</span>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-sm font-semibold text-rose-700 dark:text-rose-300"
          >
            {error}
          </div>
        ) : (
          wish && (
            <>
              {/* Header Box */}
              <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-7 shadow-lg space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-200 dark:border-amber-800">
                      {isWedding ? <Crown className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      <span>{isWedding ? "শুভ বিবাহ নিমন্ত্রণ ও মেহমান ট্র্যাকার" : "চিঠির রিঅ্যাকশন ও রিপ্লাই"}</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
                      {wish.recipientName}-এর জন্য নিমন্ত্রণপত্র
                    </h1>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      প্রেরক: <strong className="text-stone-800 dark:text-stone-200">{wish.senderName}</strong>
                    </p>
                  </div>

                  <Link
                    href={`/wish/${wish.id}`}
                    target="_blank"
                    className="shrink-0 p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-bold transition flex items-center gap-1.5"
                    title="মূল চিঠি দেখুন"
                  >
                    <span>চিঠি খুলুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Wedding RSVP Headcount & Attendance Stats */}
                {isWedding ? (
                  <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                        <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 mb-1">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200">
                          {totalHeadcount} জন
                        </div>
                        <div className="text-[10px] font-bold text-amber-700/80 dark:text-amber-300/80">
                          মোট নিশ্চিত মেহমান
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200">
                          {attendingGuests.length} টি
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700/80 dark:text-emerald-300/80">
                          উপস্থিত থাকবেন (সাড়া)
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                        <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 mb-1">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-200">
                          {familyHeadcount} টি
                        </div>
                        <div className="text-[10px] font-bold text-rose-700/80 dark:text-rose-300/80">
                          সপরিবারে আসছেন
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                        <div className="flex items-center justify-center gap-1 text-stone-500 dark:text-stone-400 mb-1">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-stone-800 dark:text-stone-200">
                          {wish.viewsCount} বার
                        </div>
                        <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                          খাম খোলা হয়েছে
                        </div>
                      </div>
                    </div>

                    {/* Copy Summary Button */}
                    {replies.length > 0 && (
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="w-full py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-stone-200/80 dark:border-stone-700"
                      >
                        {copiedSummary ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">মেহমান তালিকা কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
                            <span>মেহমানদের তালিকা কপি করুন (হোয়াটসঅ্যাপ বা ক্যাটারিংয়ের জন্য)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <Stat label="বার খোলা হয়েছে" value={wish.viewsCount} />
                    <Stat label="রিঅ্যাকশন" value={replies.length} />
                    <Stat label="অবস্থা" value={wish.destroyed ? "মুছে গেছে" : wish.locked ? "বন্ধ" : "সক্রিয়"} />
                  </div>
                )}
              </div>

              {/* Filter Tabs for Wedding */}
              {isWedding && replies.length > 0 && (
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80">
                  <button
                    type="button"
                    onClick={() => setFilterTab("all")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filterTab === "all"
                        ? "bg-white dark:bg-[#111827] text-[#7E151E] dark:text-rose-400 shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    সব মেহমান ({parsedGuests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("attending")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filterTab === "attending"
                        ? "bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    উপস্থিত থাকবেন ({attendingGuests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("declined")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filterTab === "declined"
                        ? "bg-white dark:bg-[#111827] text-stone-700 dark:text-stone-300 shadow-xs"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
                    }`}
                  >
                    আসতে পারছেন না ({declinedGuests.length})
                  </button>
                </div>
              )}

              {/* Guests List */}
              {replies.length === 0 ? (
                <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-8 text-center space-y-2">
                  <HeartHandshake className="w-8 h-8 text-stone-400 mx-auto opacity-70" />
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
                    {isWedding
                      ? "এখনো কোনো মেহমান RSVP নিশ্চিত করেননি"
                      : "এখনো কোনো রিঅ্যাকশন আসেনি"}
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {isWedding
                      ? "আমন্ত্রিত মেহমানরা চিঠি খুলে তাদের উপস্থিতি নিশ্চিত করলে এখানে বিস্তারিত সংখ্যা ও তালিকা দেখা যাবে।"
                      : "প্রাপক চিঠি খুলে রিঅ্যাকশন বা বার্তা পাঠালে এখানে তা সংরক্ষিত হবে।"}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {displayedList.map((g) => (
                    <li
                      key={g.id}
                      className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs space-y-2.5 transition hover:border-amber-300 dark:hover:border-amber-700"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {g.name.slice(0, 1)}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                              {g.name}
                            </h4>
                            <span className="text-[10px] text-stone-400 block">
                              {new Date(g.createdAt).toLocaleString("bn-BD", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isWedding ? (
                          <div className="flex items-center gap-1.5">
                            {g.isAttending ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/60 inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{g.status}</span>
                                <span className="opacity-70">({g.countLabel})</span>
                              </span>
                            ) : g.isDeclined ? (
                              <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[11px] font-bold border border-stone-200 dark:border-stone-700 inline-flex items-center gap-1">
                                <span>আসতে পারছেন না</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                                <span>শুভেচ্ছা</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-stone-500">{g.countLabel}</span>
                        )}
                      </div>

                      {/* Personal Blessing Note if any */}
                      {g.blessing && (
                        <div className="pl-3 border-l-2 border-amber-400 dark:border-amber-600 py-0.5">
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                            {g.blessing}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 py-3">
      <div className="text-base font-black">{value}</div>
      <div className="text-[10px] text-stone-500 dark:text-stone-400">{label}</div>
    </div>
  );
}
