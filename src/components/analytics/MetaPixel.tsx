"use client";

import { useEffect, Suspense, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, isDeveloperOrAdmin } from "@/lib/metaPixel";
import { GO_API_BASE_URL } from "@/lib/goApi";

function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Completely silence tracking for admin paths or developer / admin sessions
    if (pathname.startsWith("/admin") || isDeveloperOrAdmin()) {
      return;
    }

    // Prevent double firing on initial mount since script initialization tracks first pageview
    if (isFirstMount.current) {
      isFirstMount.current = false;
      trackPageView(pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""));
      return;
    }

    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(fullPath);
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  useEffect(() => {
    // If the visitor is an admin/developer, revoke consent to guarantee no automated beacons are sent
    if (isDeveloperOrAdmin()) {
      if (typeof window !== "undefined" && window.fbq) {
        try {
          window.fbq("consent", "revoke");
        } catch {}
      }
      return;
    }

    // Optionally check if tracking is disabled in backend config
    async function checkBackendConfig() {
      try {
        const res = await fetch(`${GO_API_BASE_URL}/meta/config`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok) {
            if (data.isEnabled === false || data.browserTrackingEnabled === false) {
              if (typeof window !== "undefined" && window.fbq) {
                // If disabled by admin, disable consent
                try {
                  window.fbq("consent", "revoke");
                } catch {}
              }
            }
          }
        }
      } catch {
        // Fallback to active
      }
    }

    checkBackendConfig();
  }, []);

  return (
    <Suspense fallback={null}>
      <RouteTracker />
    </Suspense>
  );
}

