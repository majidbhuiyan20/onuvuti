"use client";

import React from "react";
import Link from "next/link";
import { X, LogOut, PenLine, ArrowRight } from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { AppUser } from "@/lib/goApi";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  userStories: Array<BlogPost & { status?: string; adminNote?: string; submittedAt?: string }>;
  onLogout: () => void;
  onOpenSubmit: () => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  userStories,
  onLogout,
  onOpenSubmit,
}: ProfileModalProps) {
  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7E151E] dark:text-rose-400">
              ব্যবহারকারী প্রোফাইল
            </span>
            <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
              আমার অনুভূতি অ্যাকাউন্ট
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

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* User Header Info Card */}
          <div className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#7E151E] text-white flex items-center justify-center text-lg font-extrabold uppercase shrink-0 shadow-xs">
                {currentUser.name ? currentUser.name.slice(0, 1) : "ইউ"}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#142230] dark:text-white">
                  {currentUser.name}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  {currentUser.provider === "google"
                    ? "Google ভেরিফাইড"
                    : "নিবন্ধিত সদস্য"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-900 text-stone-600 dark:text-stone-300 hover:text-rose-700 dark:hover:text-rose-400 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>

          {/* My Submitted Stories Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-extrabold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                আমার পাঠানো লেখা ও কনফেশন ({userStories.length})
              </h5>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSubmit();
                }}
                className="text-xs font-extrabold text-[#7E151E] dark:text-rose-400 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>নতুন লেখা পাঠান</span>
              </button>
            </div>

            {userStories.length === 0 ? (
              <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-dashed border-stone-300 dark:border-stone-700 p-6 text-center space-y-2">
                <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                  আপনার অ্যাকাউন্ট থেকে এখনো কোনো গল্প বা কনফেশন পাঠানো হয়নি।
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  আপনার মনের না বলা কথা, ক্রাশ কনফেশন বা ভালোবাসার গল্প লিখে পাঠিয়ে দিন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSubmit();
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#7E151E] text-white text-xs font-bold cursor-pointer hover:bg-[#630d16]"
                >
                  লেখা জমা দিন
                </button>
              </div>
            ) : (
              userStories.map((story) => (
                <div
                  key={story.id}
                  className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#7E151E] dark:text-rose-400">
                      #{story.id} • {story.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        story.status === "pending"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                          : story.status === "deleted"
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {story.status === "pending"
                        ? "অপেক্ষমাণ (রিভিউ চলছে)"
                        : story.status === "deleted"
                        ? "মুছে ফেলা হয়েছে"
                        : "প্রকাশিত"}
                    </span>
                  </div>

                  <h5 className="text-sm font-extrabold text-[#142230] dark:text-white">
                    {story.title}
                  </h5>

                  {story.adminNote && (
                    <div className="rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 p-2.5 text-xs text-stone-700 dark:text-stone-300">
                      <strong className="text-[#7E151E] dark:text-rose-400 block mb-0.5">
                        অনুভূতি টিমের উত্তর:
                      </strong>
                      {story.adminNote}
                    </div>
                  )}

                  {story.status === "published" && story.slug && (
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-stone-500 dark:text-stone-400">
                        লাইক: {story.likesCount || 0}
                      </span>
                      <Link
                        href={`/blog/${story.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 font-extrabold text-[#7E151E] dark:text-rose-400 hover:underline"
                      >
                        <span>সম্পূর্ণ পড়ুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
