"use client";

import React from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  UserCheck,
  ImagePlus,
  Trash2,
  ShieldCheck,
  Send,
} from "lucide-react";
import { StoryCategory } from "@/data/blogData";
import { AppUser } from "@/lib/goApi";

interface SubmitStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  senderName: string;
  setSenderName: (val: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: React.Dispatch<React.SetStateAction<boolean>>;
  storyCategory: StoryCategory;
  setStoryCategory: (val: StoryCategory) => void;
  storyTitle: string;
  setStoryTitle: (val: string) => void;
  storyBody: string;
  setStoryBody: (val: string) => void;
  storyImageDataUrl?: string;
  setStoryImageDataUrl: (val: string | undefined) => void;
  imageError: string | null;
  websiteUrl: string;
  setWebsiteUrl: (val: string) => void;
  isSubmitting: boolean;
  submitError: string | null;
  submittedSuccess: boolean;
  lastSubmittedTrackingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onOpenTracker: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SubmitStoryModal({
  isOpen,
  onClose,
  currentUser,
  senderName,
  setSenderName,
  isAnonymous,
  setIsAnonymous,
  storyCategory,
  setStoryCategory,
  storyTitle,
  setStoryTitle,
  storyBody,
  setStoryBody,
  storyImageDataUrl,
  setStoryImageDataUrl,
  imageError,
  websiteUrl,
  setWebsiteUrl,
  isSubmitting,
  submitError,
  submittedSuccess,
  lastSubmittedTrackingId,
  onSubmit,
  onOpenTracker,
  onOpenAuth,
  onOpenProfile,
  onImageChange,
}: SubmitStoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7E151E] dark:text-rose-400">
              অনুভূতির চিঠির বাক্স
            </span>
            <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
              আপনার গল্প, ক্রাশ কনফেশন বা না বলা কথা পাঠান
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

        <div className="p-6">
          {submittedSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-xl font-extrabold text-[#142230] dark:text-white">
                ধন্যবাদ! আপনার লেখাটি নিরাপদে জমা হয়েছে
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto">
                অ্যাডমিন আপনার লেখাটি রিভিউ করে অনুমোদন দিলেই ওয়েবসাইটে প্রকাশিত হবে। আপনার ব্রাউজারে এটি স্বয়ংক্রিয়ভাবে সেভ হয়ে আছে।
              </p>

              {lastSubmittedTrackingId && (
                <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/50 dark:border-[#C59B27]/40 p-3.5 max-w-xs mx-auto space-y-1">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                    আপনার লেখার গোপন ট্র্যাকিং কোড:
                  </span>
                  <code className="text-base font-extrabold text-[#7E151E] dark:text-rose-400 block">
                    #{lastSubmittedTrackingId}
                  </code>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                    অন্য যেকোনো ডিভাইস থেকেও এই কোড দিয়ে লেখার অবস্থা ও টিমের উত্তর দেখতে পারবেন।
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTracker();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/50 dark:border-[#C59B27]/40 text-[#7E151E] dark:text-rose-300 font-bold text-xs sm:text-sm cursor-pointer hover:bg-[#f3e8ce] dark:hover:bg-[#253348]"
                >
                  আমার লেখা ট্র্যাক করুন
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs sm:text-sm cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Hidden Honeypot Input for Anti-Bot Protection */}
              <input
                type="text"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="hidden"
              />

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Optional User Account Banner */}
              {currentUser ? (
                <div className="p-3 rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/45 dark:border-[#C59B27]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#7E151E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {currentUser.name ? currentUser.name.slice(0, 1) : "ইউ"}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-[#142230] dark:text-white">
                        লগইন আছেন:{" "}
                        <span className="text-[#7E151E] dark:text-rose-400">
                          {currentUser.name}
                        </span>
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        গল্পটি আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে সেভ থাকবে।
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenProfile();
                    }}
                    className="text-xs font-extrabold text-[#7E151E] dark:text-rose-400 hover:underline cursor-pointer shrink-0"
                  >
                    প্রোফাইল
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
                  <div className="text-xs text-stone-600 dark:text-stone-300">
                    <span className="font-bold text-stone-800 dark:text-white">
                      💡 অ্যাকাউন্ট ছাড়াও সরাসরি গল্প পাঠানো যাবে
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      সব লেখা এক অ্যাকাউন্টে সেভ রাখতে চাইলে লগইন করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#7E151E] dark:text-rose-300 text-xs font-bold hover:bg-[#f3e8ce] dark:hover:bg-[#253348] cursor-pointer shrink-0"
                  >
                    লগইন
                  </button>
                </div>
              )}

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#142230] dark:text-white">
                  {isAnonymous ? (
                    <EyeOff className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>
                    {isAnonymous
                      ? "নাম গোপন থাকবে (নাম প্রকাশে অনিচ্ছুক)"
                      : "নিজের বা ছদ্মনামে প্রকাশ করুন"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous((prev) => !prev)}
                  className="text-xs font-bold text-[#7E151E] dark:text-rose-400 underline cursor-pointer"
                >
                  {isAnonymous ? "নাম দিতে চাই" : "নাম গোপন রাখুন"}
                </button>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    আপনার নাম ও শহর
                  </label>
                  <input
                    type="text"
                    required={!isAnonymous}
                    maxLength={80}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="যেমন: নীলাঞ্জনা, ঢাকা"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  লেখার ধরন নির্বাচন করুন
                </label>
                <select
                  value={storyCategory}
                  onChange={(e) =>
                    setStoryCategory(e.target.value as StoryCategory)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                >
                  <option value="ক্রাশ ও কনফেশন">ক্রাশ ও কনফেশন</option>
                  <option value="না বলা কথা">না বলা কথা</option>
                  <option value="রোমান্টিক গল্প">রোমান্টিক গল্প</option>
                  <option value="জীবনের গল্প">জীবনের গল্প</option>
                  <option value="বিচ্ছেদ ও প্রাক্তন">বিচ্ছেদ ও প্রাক্তন</option>
                  <option value="সম্পর্ক ও মনস্তত্ত্ব">সম্পর্ক ও মনস্তত্ত্ব</option>
                  <option value="নিজেকে জানুন">নিজেকে জানুন</option>
                  <option value="খোলা চিঠি">খোলা চিঠি</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="আপনার গল্প বা কনফেশনের একটি সুন্দর শিরোনাম দিন"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    আপনার মূল গল্প / কনফেশন *
                  </label>
                  {storyBody.length > 0 && (
                    <span className="text-[11px] text-stone-400 font-medium">
                      {storyBody.length.toLocaleString("bn-BD")} অক্ষর (কোনো সীমা নেই)
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  required
                  value={storyBody}
                  onChange={(e) => setStoryBody(e.target.value)}
                  placeholder="এখানে আপনার মনের কথা, ক্রাশ কনফেশন বা গল্পটি কোনো অক্ষরের সীমাবদ্ধতা ছাড়া সম্পূর্ণ বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                />
              </div>

              {/* Optional Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  ছবি যুক্ত করুন (ঐচ্ছিক — না দিলেও কোনো সমস্যা নেই)
                </label>

                {!storyImageDataUrl ? (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer transition">
                    <ImagePlus className="w-4 h-4 text-[#7E151E] dark:text-rose-400" />
                    <span>চাইলে একটি ছবি যোগ করুন (JPG/PNG/WEBP, সর্বোচ্চ 2MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={onImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 flex items-center justify-between gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={storyImageDataUrl}
                      alt="Preview"
                      className="h-16 w-24 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                    />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex-1">
                      ছবি যুক্ত হয়েছে
                    </span>
                    <button
                      type="button"
                      onClick={() => setStoryImageDataUrl(undefined)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold inline-flex items-center gap-1 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ছবি বাদ দিন</span>
                    </button>
                  </div>
                )}

                {imageError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {imageError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  স্প্যাম প্রতিরোধে স্বয়ংক্রিয় Rate-Limit ও সিকিউরিটি ফিল্টার সক্রিয়।
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#7E151E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#680f18] disabled:opacity-60 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting ? "পাঠানো হচ্ছে..." : "লেখাটি পাঠিয়ে দিন"}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

