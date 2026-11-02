"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Apply theme classes and attributes immediately to both <html> and <body>
  const applyTheme = useCallback((t: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const body = document.body;

    if (t === "dark") {
      root.classList.add("dark");
      body?.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      body?.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      body?.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      body?.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }

    try {
      window.dispatchEvent(
        new CustomEvent("onuvuti-theme-change", { detail: t })
      );
    } catch {
      // ignore
    }
  }, []);

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      applyTheme(t);
      try {
        localStorage.setItem("onuvuti_theme", t);
      } catch {
        // ignore storage errors
      }
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    // Determine current theme by checking DOM state and active React state
    let isCurrentlyDark = false;
    if (typeof document !== "undefined") {
      isCurrentlyDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
    } else {
      isCurrentlyDark = theme === "dark";
    }

    const nextTheme: Theme = isCurrentlyDark ? "light" : "dark";
    setTheme(nextTheme);
  }, [setTheme, theme]);

  useEffect(() => {
    // 1. Initial resolution on mount
    let initial: Theme = "light";
    try {
      const saved = localStorage.getItem("onuvuti_theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        initial = saved;
      } else {
        const hasDarkClass =
          document.documentElement.classList.contains("dark");
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        initial = hasDarkClass || prefersDark ? "dark" : "light";
      }
    } catch {
      initial = "light";
    }

    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);

    // 2. Listen to system preference changes if user hasn't explicitly set localStorage
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem("onuvuti_theme");
        if (!saved) {
          const sysTheme: Theme = e.matches ? "dark" : "light";
          setThemeState(sysTheme);
          applyTheme(sysTheme);
        }
      } catch {
        // ignore
      }
    };

    // 3. Sync theme across multiple tabs via storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "onuvuti_theme" && e.newValue) {
        const newTheme = e.newValue === "dark" ? "dark" : "light";
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
