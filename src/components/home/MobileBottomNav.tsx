"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, PenLine, MessageSquareHeart, User, LogIn } from "lucide-react";
import { AppUser } from "@/lib/goApi";

interface MobileBottomNavProps {
  onOpenSubmit: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  currentUser: AppUser | null;
  bookmarkedCount?: number;
}

export default function MobileBottomNav({
  onOpenSubmit,
  onOpenProfile,
  onOpenAuth,
  currentUser,
}: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isWish = pathname === "/birthday-wish" || pathname.startsWith("/wish");
  const isSecret = pathname === "/m" || pathname.startsWith("/m");

  const handleProfileClick = () => {
    if (currentUser) {
      onOpenProfile();
    } else {
      onOpenAuth();
    }
  };

  return (
    <nav
      aria-label="মোবাইল অ্যাপ নেভিগেশন"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-stone-200/90 dark:border-stone-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] transition-all duration-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {/* 1. Home Tab */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            isHome
              ? "text-[#80131E] dark:text-rose-400 font-extrabold"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium"
          }`}
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#80131E] dark:bg-rose-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">হোম</span>
        </Link>

        {/* 2. Birthday Wish & Letters Tab */}
        <Link
          href="/birthday-wish"
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            isWish
              ? "text-[#80131E] dark:text-rose-400 font-extrabold"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium"
          }`}
        >
          <div className="relative">
            <Gift className="w-5 h-5" />
            {isWish && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#80131E] dark:bg-rose-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">চিঠি ও খাম</span>
        </Link>

        {/* 3. Center Floating Elevated Action Button (Write Story / Confession) */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            type="button"
            onClick={onOpenSubmit}
            aria-label="গল্প বা কনফেশন লিখুন"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#680f18] via-[#80131E] to-[#A01826] text-white shadow-lg shadow-[#80131E]/30 border-4 border-white dark:border-[#111827] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <PenLine className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 mt-1">
            লিখুন
          </span>
        </div>

        {/* 4. Benami Barta (Anonymous Q&A / Secret Messages) Tab */}
        <Link
          href="/m"
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            isSecret
              ? "text-[#80131E] dark:text-rose-400 font-extrabold"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium"
          }`}
        >
          <div className="relative">
            <MessageSquareHeart className="w-5 h-5" />
            {isSecret && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#80131E] dark:bg-rose-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">বেনামী বার্তা</span>
        </Link>

        {/* 5. User Profile / Account Tab */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex flex-col items-center justify-center py-1 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium transition-colors cursor-pointer"
        >
          <div className="relative">
            {currentUser ? (
              <User className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
            {currentUser ? (currentUser.name ? currentUser.name.split(" ")[0] : "প্রোফাইল") : "লগইন"}
          </span>
        </button>
      </div>
    </nav>
  );
}

