"use client";

import React from "react";
import Link from "next/link";
import { X, Trash2, ArrowRight } from "lucide-react";
import { BlogPost } from "@/data/blogData";

interface StoryTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualTrackCode: string;
  setManualTrackCode: (val: string) => void;
  manualTrackError: string | null;
  manualTrackedResult:
    | (BlogPost & { status?: string; viewsCount?: number; adminNote?: string })
    | null;
  onManualTrackSearch: (e: React.FormEvent) => void;
  mySubmittedIds: Array<{ id: string; title: string; category: string }>;
  trackedStoriesMap: Record<
    string,
    BlogPost & { status?: string; viewsCount?: number; adminNote?: string }
  >;
  posts: BlogPost[];
  onRemoveSubmission: (id: string) => void;
  onClearDeletedSubmissions: () => void;
}

export default function StoryTrackerModal({
  isOpen,
  onClose,
  manualTrackCode,
  setManualTrackCode,
  manualTrackError,
  manualTrackedResult,
  onManualTrackSearch,
  mySubmittedIds,
  trackedStoriesMap,
  posts,
  onRemoveSubmission,
  onClearDeletedSubmissions,
}: StoryTrackerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7E151E] dark:text-rose-400">
              অ্যাকাউন্ট ছাড়াই লাইভ ট্র্যাকার
            </span>
            <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
              আমার পাঠানো লেখা ও অনুভূতি টিমের উত্তর
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Manual Tracking Code Lookup */}
          <form
            onSubmit={onManualTrackSearch}
            className="rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-3.5 space-y-2"
          >
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              ট্র্যাকিং কোড দিয়ে লেখার অবস্থা জানুন (অন্য ফোন বা ব্রাউজার থেকেও)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualTrackCode}
                onChange={(e) => setManualTrackCode(e.target.value)}
                placeholder="যেমন: #p-101 বা 3"
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#7E151E] text-white text-xs font-bold cursor-pointer hover:bg-[#630d16] shrink-0"
              >
                খুঁজুন
              </button>
            </div>

            {manualTrackError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                {manualTrackError}
              </p>
            )}

            {manualTrackedResult && (
              <div className="mt-2 rounded-xl bg-white dark:bg-stone-800 border border-[#C59B27]/50 dark:border-[#C59B27]/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#7E151E] dark:text-rose-400">
                    কোড: #{manualTrackedResult.id} • {manualTrackedResult.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                      manualTrackedResult.status === "pending"
                        ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {manualTrackedResult.status === "pending"
                      ? "অপেক্ষমাণ (রিভিউ চলছে)"
                      : "প্রকাশিত হয়েছে"}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-[#142230] dark:text-white">
                  {manualTrackedResult.title}
                </h4>
                {manualTrackedResult.adminNote && (
                  <div className="rounded-lg bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 p-2.5 text-xs text-stone-700 dark:text-stone-300">
                    <strong className="text-[#7E151E] dark:text-rose-400 block mb-0.5">
                      অনুভূতি টিমের পরামর্শ:
                    </strong>
                    {manualTrackedResult.adminNote}
                  </div>
                )}
                {manualTrackedResult.status !== "pending" &&
                  manualTrackedResult.slug && (
                    <Link
                      href={`/blog/${manualTrackedResult.slug}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#7E151E] dark:text-rose-400 hover:underline"
                    >
                      <span>প্রকাশিত লেখাটি পড়ুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
              </div>
            )}
          </form>

          {/* Saved Submissions in This Browser */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                এই ব্রাউজার থেকে আপনার পাঠানো লেখা ({mySubmittedIds.length})
              </h4>
              {mySubmittedIds.some(
                (s) => trackedStoriesMap[s.id]?.status === "deleted"
              ) && (
                <button
                  type="button"
                  onClick={onClearDeletedSubmissions}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  বাতিলগুলো মুছুন
                </button>
              )}
            </div>

            {mySubmittedIds.length === 0 ? (
              <div className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 p-6 text-center space-y-2">
                <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                  আপনি এখনো এই ব্রাউজার থেকে কোনো গল্প বা কনফেশন পাঠাননি।
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  গল্প পাঠালে কোনো লগইন ছাড়াই এখানে স্বয়ংক্রিয়ভাবে ট্র্যাক করতে পারবেন।
                </p>
              </div>
            ) : (
              mySubmittedIds.map((sub) => {
                const liveItem =
                  trackedStoriesMap[sub.id] ||
                  posts.find((p) => p.id === sub.id);
                const isDeleted = liveItem?.status === "deleted";
                const isPublished =
                  Boolean(posts.find((p) => p.id === sub.id)) ||
                  (liveItem && liveItem.status === "published");

                return (
                  <div
                    key={sub.id}
                    className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#7E151E] dark:text-rose-400">
                        কোড: #{sub.id} • {sub.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            isPublished
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              : isDeleted
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                          }`}
                        >
                          {isPublished
                            ? "প্রকাশিত হয়েছে"
                            : isDeleted
                            ? "বাতিল / মুছে ফেলা হয়েছে"
                            : "অপেক্ষমাণ (রিভিউ চলছে)"}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveSubmission(sub.id)}
                          title="তালিকা থেকে সরান"
                          className="p-1 rounded-md text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h5 className="text-sm font-extrabold text-[#142230] dark:text-white">
                      {liveItem?.title || sub.title}
                    </h5>

                    {isDeleted && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                        এই লেখাটি কর্তৃপক্ষ দ্বারা বাতিল অথবা ডাটাবেস থেকে মুছে ফেলা হয়েছে।
                      </p>
                    )}

                    {liveItem?.adminNote && (
                      <div className="rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/45 dark:border-[#C59B27]/30 p-3 text-xs text-stone-700 dark:text-stone-300">
                        <strong className="text-[#7E151E] dark:text-rose-400 block mb-0.5">
                          অনুভূতি টিমের পরামর্শ:
                        </strong>
                        {liveItem.adminNote}
                      </div>
                    )}

                    {isPublished && liveItem?.slug && (
                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-stone-500 dark:text-stone-400 font-semibold">
                          পছন্দ: {liveItem.likesCount || 1} • পাঠক:{" "}
                          {(liveItem.viewsCount || 12).toLocaleString()}
                        </span>
                        <Link
                          href={`/blog/${liveItem.slug}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 font-extrabold text-[#7E151E] dark:text-rose-400 hover:underline"
                        >
                          <span>লেখাটি দেখুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
