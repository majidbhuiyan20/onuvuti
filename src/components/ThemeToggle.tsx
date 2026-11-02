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

  // When not yet mounted, read directly from DOM if available to prevent flash
  const isDark = mounted
    ? theme === "dark"
    : typeof document !== "undefined"
    ? document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark"
    : false;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      aria-label={isDark ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন"}
      title={isDark ? "লাইট মোড চালু করুন" : "ডার্ক মোড চালু করুন"}
      className={`relative inline-flex items-center justify-center gap-1.5 w-9 h-9 rounded-full border transition-all duration-200 cursor-pointer text-xs font-bold ${
        isDark
          ? "bg-[#111827] hover:bg-stone-800 text-amber-300 border-stone-700 shadow-inner"
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
