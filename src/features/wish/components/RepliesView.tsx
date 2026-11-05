"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { wishApi } from "../api";
import type { WishPublic, WishReply } from "../types";

export default function RepliesView({ id, manageKey }: { id: string; manageKey: string }) {
  const [wish, setWish] = useState<WishPublic | null>(null);
  const [replies, setReplies] = useState<WishReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#FCFAF6] dark:bg-[#0B0F17] text-stone-800 dark:text-stone-100">
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/birthday-wish" className="text-xs font-bold text-[#7E151E] dark:text-rose-300 hover:underline">
            ← নতুন চিঠি তৈরি করুন
          </Link>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            রিফ্রেশ
          </button>
        </div>

        {loading && !wish ? (
          <div className="py-20 text-center text-xs text-stone-500 inline-flex w-full items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে...
          </div>
        ) : error ? (
          <div role="alert" className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-sm font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        ) : (
          wish && (
            <>
              <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                <h1 className="text-xl font-black text-stone-900 dark:text-white">
                  {wish.recipientName}-এর জন্য তোমার চিঠি
                </h1>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Stat label="বার খোলা হয়েছে" value={wish.viewsCount} />
                  <Stat label="রিঅ্যাকশন" value={replies.length} />
                  <Stat label="অবস্থা" value={wish.destroyed ? "মুছে গেছে" : wish.locked ? "বন্ধ" : "সক্রিয়"} />
                </div>
                <Link href={`/wish/${wish.id}`} className="inline-block mt-4 text-xs font-bold text-[#7E151E] dark:text-rose-300 hover:underline">
                  চিঠির লিঙ্ক →
                </Link>
              </div>

              {replies.length === 0 ? (
                <p className="py-10 text-center text-sm text-stone-500 dark:text-stone-400">
                  এখনো কোনো রিঅ্যাকশন আসেনি। প্রাপক চিঠি খুলে রিঅ্যাকশন দিলে এখানে দেখতে পাবেন।
                </p>
              ) : (
                <ul className="space-y-3">
                  {replies.map((r) => (
                    <li key={r.id} className="flex gap-3 items-start rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4">
                      <span className="text-3xl">{r.emoji}</span>
                      <div className="min-w-0">
                        {r.text && <p className="text-sm whitespace-pre-line break-words">{r.text}</p>}
                        <span className="block text-[11px] text-stone-400 mt-1">
                          {new Date(r.createdAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </div>
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

