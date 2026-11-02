"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronDown,
  Search,
  PenLine,
  User,
  X,
  Menu,
  Bookmark,
  Clock,
} from "lucide-react";
import { BLOG_CATEGORIES } from "@/data/blogData";
import { AppUser } from "@/lib/goApi";
import ThemeToggle from "@/components/ThemeToggle";

interface HomeNavbarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  showSavedOnly: boolean;
  setShowSavedOnly: (saved: boolean) => void;
  setCurrentPage: (page: number) => void;
  mySubmittedCount: number;
  bookmarkedCount: number;
  currentUser: AppUser | null;
  onOpenSubmit: () => void;
  onOpenTracker: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  showNavSearch: boolean;
  setShowNavSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HomeNavbar({
  activeCategory,
  setActiveCategory,
  showSavedOnly,
  setShowSavedOnly,
  setCurrentPage,
  mySubmittedCount,
  bookmarkedCount,
  currentUser,
  onOpenSubmit,
  onOpenTracker,
  onOpenProfile,
  onOpenAuth,
  showNavSearch,
  setShowNavSearch,
}: HomeNavbarProps) {
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setShowSavedOnly(false);
    setCurrentPage(1);
    setActiveNavDropdown(null);
    setIsMobileMenuOpen(false);
    document
      .getElementById("stories-feed")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF7F2]/95 dark:bg-[#0B0F17]/95 border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Previous Original Brand Logo in White Card */}
        <Link
          href="/"
          onClick={() => {
            setShowSavedOnly(false);
            setActiveCategory("সকল গল্প");
            setCurrentPage(1);
          }}
          className="flex items-center gap-3 shrink-0"
        >
          <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-1.5 relative">
          {/* Active Home Pill */}
          <button
            type="button"
            onClick={() => {
              setShowSavedOnly(false);
              setActiveCategory("সকল গল্প");
              setCurrentPage(1);
              setActiveNavDropdown(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeCategory === "সকল গল্প" && !showSavedOnly
                ? "bg-[#7E151E] text-white"
                : "text-stone-600 dark:text-stone-300 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-800"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </button>

          {/* গল্প Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveNavDropdown((prev) =>
                  prev === "story" ? null : "story"
                )
              }
              className="px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>গল্প</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
            {activeNavDropdown === "story" && (
              <div className="absolute top-full left-0 mt-1 w-44 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 text-xs">
                {[
                  "রোমান্টিক গল্প",
                  "জীবনের গল্প",
                  "ক্রাশ ও কনফেশন",
                  "বিচ্ছেদ ও প্রাক্তন",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCategorySelect(c)}
                    className="w-full text-left px-3.5 py-2 font-medium hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-300 cursor-pointer transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* চিঠি Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveNavDropdown((prev) =>
                  prev === "letter" ? null : "letter"
                )
              }
              className="px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>চিঠি</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
            {activeNavDropdown === "letter" && (
              <div className="absolute top-full left-0 mt-1 w-44 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 text-xs">
                {["না বলা কথা", "খোলা চিঠি"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCategorySelect(c)}
                    className="w-full text-left px-3.5 py-2 font-medium hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-300 cursor-pointer transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* কনফেশন Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveNavDropdown((prev) =>
                  prev === "confession" ? null : "confession"
                )
              }
              className="px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>কনফেশন</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
            {activeNavDropdown === "confession" && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 text-xs">
                {["ক্রাশ ও কনফেশন", "না বলা কথা"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCategorySelect(c)}
                    className="w-full text-left px-3.5 py-2 font-medium hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-300 cursor-pointer transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* বই Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveNavDropdown((prev) =>
                  prev === "book" ? null : "book"
                )
              }
              className="px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>বই</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
            {activeNavDropdown === "book" && (
              <div className="absolute top-full left-0 mt-1 w-52 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 text-xs">
                <Link
                  href="/sporsher-byakoron"
                  onClick={() => setActiveNavDropdown(null)}
                  className="block px-3.5 py-2 font-medium hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-300 transition"
                >
                  স্পর্শের ব্যাকরণ (ই-বুক)
                </Link>
              </div>
            )}
          </div>

          {/* মনস্তত্ত্ব Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveNavDropdown((prev) =>
                  prev === "psy" ? null : "psy"
                )
              }
              className="px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>মনস্তত্ত্ব</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
            {activeNavDropdown === "psy" && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 text-xs">
                {["সম্পর্ক ও মনস্তত্ত্ব", "নিজেকে জানুন", "স্বাস্থ্য ও সুস্থতা"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setActiveCategory(c);
                      setShowSavedOnly(false);
                      setCurrentPage(1);
                      setActiveNavDropdown(null);
                      document
                        .getElementById("wellness-hub")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full text-left px-3.5 py-2 font-medium hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-300 cursor-pointer transition"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* আরও Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveNavDropdown((prev) =>
                  prev === "more" ? null : "more"
                )
              }
              className="px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-100/70 dark:hover:bg-stone-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>আরও</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
            {activeNavDropdown === "more" && (
              <div className="absolute top-full right-0 mt-1 w-52 rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveNavDropdown(null);
                    document
                      .getElementById("home-poll-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left px-3.5 py-2 font-medium hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-300 cursor-pointer transition"
                >
                  📊 আজকের পাঠক জরিপ ও ভোট
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNavDropdown(null);
                    onOpenTracker();
                  }}
                  className="w-full text-left px-3.5 py-2 font-medium hover:bg-[#FAF4E6] dark:hover:bg-[#1E293B] text-stone-700 dark:text-stone-200 hover:text-[#7E151E] dark:hover:text-rose-300 cursor-pointer transition"
                >
                  🕒 আমার পাঠানো লেখা ট্র্যাক করুন
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Circular Dark / Light Mode Toggle */}
          <ThemeToggle />

          {/* Search Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setShowNavSearch((prev) => !prev);
              document
                .getElementById("stories-feed")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label="গল্প খুঁজুন"
            className="w-9 h-9 rounded-full border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-[#7E151E] dark:hover:text-rose-400 hover:bg-stone-50 transition cursor-pointer flex items-center justify-center shadow-xs"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Pill [ ✎ লিখুন ] */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="px-3.5 sm:px-4 py-2 rounded-full bg-[#7E151E] hover:bg-[#680f18] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>লিখুন</span>
          </button>

          {/* User Account Button */}
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-full bg-[#7E151E] text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 transition"
              title={`${currentUser.name} (প্রোফাইল)`}
            >
              {currentUser.name ? currentUser.name.slice(0, 1) : "ইউ"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-9 h-9 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:text-[#7E151E] hover:border-[#7E151E] dark:hover:text-rose-400 cursor-pointer shadow-xs transition"
              title="লগইন করুন"
            >
              <User className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="মেনু খুলুন"
            className="lg:hidden p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-[#142230] dark:text-white hover:text-[#7E151E] dark:hover:text-rose-400 cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111827] px-4 py-4 space-y-3 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            {BLOG_CATEGORIES.map((cat) => {
              const isCatActive = !showSavedOnly && activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                    isCatActive
                      ? "bg-[#7E151E] text-white"
                      : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                  }`}
                >
                  {cat === "সকল গল্প" ? "হোমপেজ (সকল গল্প)" : cat}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowSavedOnly(true);
                setIsMobileMenuOpen(false);
                document
                  .getElementById("stories-feed")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-[#FAF4E6] dark:bg-[#1E293B] text-[#7E151E] dark:text-rose-300 border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>সংরক্ষিত লেখা ({bookmarkedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTracker();
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#142230] dark:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
              <span>আমার পাঠানো লেখা ({mySubmittedCount})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

