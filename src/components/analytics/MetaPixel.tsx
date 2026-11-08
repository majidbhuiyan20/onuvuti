"use client";

import { useEffect, Suspense, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { DEFAULT_META_PIXEL_ID, trackPageView } from "@/lib/metaPixel";
import { GO_API_BASE_URL } from "@/lib/goApi";

function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  useEffect(() => {
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
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID;

  useEffect(() => {
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
    <>
      {/* Official Meta Pixel base code */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (!window._fbq_initialized) {
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              window._fbq_initialized = true;
            }
          `,
        }}
      />
      <Suspense fallback={null}>
        <RouteTracker />
      </Suspense>
    </>
  );
}
