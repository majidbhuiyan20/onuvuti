"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন"}
      title={isDark ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন"}
      className={`relative inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer text-xs font-bold ${
        isDark
          ? "bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-stone-700 shadow-inner"
          : "bg-white hover:bg-stone-100 text-stone-700 border-stone-200 shadow-xs"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-stone-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {isDark ? "লাইট মোড" : "ডার্ক মোড"}
        </span>
      )}
    </button>
  );
}
