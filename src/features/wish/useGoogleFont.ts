"use client";

import { useEffect } from "react";

const HREF =
  "https://fonts.googleapis.com/css2?family=Atma:wght@400;600&family=Hind+Siliguri:wght@400;500;700&display=swap";
const LINK_ID = "onuvuti-wish-fonts";

/** Loads the Bengali handwriting font on demand (only when a letter uses it). */
export default function useGoogleFont(enabled: boolean) {
  useEffect(() => {
    if (!enabled || document.getElementById(LINK_ID)) return;
    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.href = HREF;
    document.head.appendChild(link);
  }, [enabled]);
}

