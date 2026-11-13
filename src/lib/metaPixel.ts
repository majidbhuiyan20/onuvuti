/**
 * Meta Pixel & Conversion Tracking Client Helper
 * Pixel ID: 1519039830282848 (Onuvuti - Digital Products)
 * Supports browser-side tracking with deduplication (eventID) for Meta Conversions API (CAPI).
 */

import { GO_API_BASE_URL } from "./goApi";

export const DEFAULT_META_PIXEL_ID = "1519039830282848";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
    _fbq_initialized?: boolean;
    _fbq_last_page?: string;
  }
}

/**
 * Checks whether the current visitor is an Admin or Developer.
 * When active, Meta Pixel events and Internal Analytics logging are completely silenced
 * so developer testing never distorts production analytics or Pixel data.
 */
export function isDeveloperOrAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Force override for testing Meta Pixel explicitly via query parameter: ?force_pixel_test=true
    if (window.location.search.includes("force_pixel_test=true")) {
      return false;
    }

    // 1. Current route is an Admin route
    if (window.location.pathname.startsWith("/admin")) {
      return true;
    }

    // 2. Active Admin Session Storage
    if (sessionStorage.getItem("onuvuti_admin_authed") === "true") {
      return true;
    }
    if (sessionStorage.getItem("onuvuti_admin_token")) {
      return true;
    }

    // 3. Persistent Admin / Developer Local Storage (active across all browser tabs)
    if (localStorage.getItem("onuvuti_is_admin") === "true") {
      return true;
    }

    // 4. Admin Cookie
    if (document.cookie.includes("onuvuti_is_admin=true")) {
      return true;
    }

    // 5. Developer mode query param override: ?dev_mode=true or ?exclude_analytics=true
    const search = window.location.search;
    if (search.includes("dev_mode=true") || search.includes("exclude_analytics=true")) {
      return true;
    }
  } catch {
    // Ignore storage errors safely
  }
  return false;
}

/**
 * Safely calls Meta Pixel fbq if available in browser
 */
export function callFbq(...args: any[]) {
  if (typeof window !== "undefined") {
    // Never send tracking events from the admin dashboard
    if (window.location.pathname.startsWith("/admin")) {
      return;
    }
    if (typeof window.fbq === "function") {
      try {
        window.fbq(...args);
      } catch (err) {
        console.warn("[Meta Pixel] fbq call error:", err);
      }
    }
  }
}

/**
 * Asynchronously logs tracked events to internal backend database
 * for the Admin Panel Event Monitoring Dashboard.
 */
async function logInternalEvent(data: {
  eventName: string;
  eventId?: string;
  orderId?: string;
  valueBdt?: number;
  currency?: string;
  payload?: Record<string, any>;
}) {
  if (typeof window === "undefined") return;
  if (isDeveloperOrAdmin()) {
    // Developer / Admin mode: silence internal event logging
    return;
  }
  try {
    fetch(`${GO_API_BASE_URL}/meta/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: data.eventName,
        eventId: data.eventId || "",
        orderId: data.orderId || "",
        valueBdt: data.valueBdt || 0,
        currency: data.currency || "BDT",
        payloadJson: JSON.stringify(data.payload || {}),
      }),
    }).catch(() => {});
  } catch {
    // Non-blocking background log
  }
}

/**
 * 1. Track PageView
 * Fired on route changes and initial page view. Avoids duplicate calls on identical path.
 */
export function trackPageView(path?: string) {
  if (typeof window === "undefined") return;
  const currentPath = path || window.location.pathname + window.location.search;
  if (currentPath.startsWith("/admin")) return;

  if (window._fbq_last_page === currentPath) {
    return;
  }
  window._fbq_last_page = currentPath;

  callFbq("track", "PageView");

  logInternalEvent({
    eventName: "PageView",
    payload: { path: currentPath },
  });
}

/**
 * 2. Track ViewContent
 * Fired when an eBook details or landing page is viewed.
 */
export function trackViewContent(params?: {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
}) {
  const contentName = params?.content_name || "স্পর্শের ব্যাকরণ (ই-বুক)";
  const contentIds = params?.content_ids || ["sporsher-byakoron"];
  const contentType = params?.content_type || "product";
  const value = params?.value ?? 199;
  const currency = params?.currency || "BDT";

  const eventData = {
    content_name: contentName,
    content_ids: contentIds,
    content_type: contentType,
    value: value,
    currency: currency,
  };

  callFbq("track", "ViewContent", eventData);

  logInternalEvent({
    eventName: "ViewContent",
    valueBdt: value,
    currency: currency,
    payload: eventData,
  });
}

/**
 * 3. Track InitiateCheckout
 * Fired when user clicks Buy Now or enters checkout modal.
 */
export function trackInitiateCheckout(params?: {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
}) {
  const contentName = params?.content_name || "স্পর্শের ব্যাকরণ (ই-বুক)";
  const contentIds = params?.content_ids || ["sporsher-byakoron"];
  const contentType = params?.content_type || "product";
  const value = params?.value ?? 199;
  const currency = params?.currency || "BDT";

  const eventData = {
    content_name: contentName,
    content_ids: contentIds,
    content_type: contentType,
    value: value,
    currency: currency,
  };

  callFbq("track", "InitiateCheckout", eventData);

  logInternalEvent({
    eventName: "InitiateCheckout",
    valueBdt: value,
    currency: currency,
    payload: eventData,
  });
}

/**
 * 4. Track Purchase
 * ONLY fired after the backend successfully verifies the ZiniPay payment!
 * Uses eventID = 'purchase_' + order_id for deduplication with Go backend CAPI.
 */
export function trackPurchase(params: {
  order_id: string;
  value: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
}) {
  const orderId = String(params.order_id).trim();
  if (!orderId) return;

  const eventID = "purchase_" + orderId;
  const value = Number(params.value) || 199;
  const currency = params.currency || "BDT";
  const contentName = params.content_name || "স্পর্শের ব্যাকরণ (ই-বুক)";
  const contentIds = params.content_ids || ["sporsher-byakoron"];

  const eventData = {
    content_name: contentName,
    content_ids: contentIds,
    content_type: "product",
    value: value,
    currency: currency,
    order_id: orderId,
  };

  // Official Meta Deduplication: pass eventID in third parameter options object
  callFbq("track", "Purchase", eventData, { eventID: eventID });

  logInternalEvent({
    eventName: "Purchase",
    eventId: eventID,
    orderId: orderId,
    valueBdt: value,
    currency: currency,
    payload: eventData,
  });
}

/**
 * 5. Track CompleteRegistration
 * Fired when an account is successfully registered.
 */
export function trackCompleteRegistration(params?: {
  method?: string;
  status?: string;
}) {
  const method = params?.method || "manual";

  const eventData = {
    content_name: "User Account Registration",
    status: params?.status || "complete",
    method: method,
  };

  callFbq("track", "CompleteRegistration", eventData);

  logInternalEvent({
    eventName: "CompleteRegistration",
    payload: eventData,
  });
}

/**
 * 6. Track Lead
 * Fired when a story/confession submission is successfully made.
 */
export function trackLead(params?: {
  content_name?: string;
  category?: string;
}) {
  const contentName = params?.content_name || "Story Submission";
  const category = params?.category || "general";

  const eventData = {
    content_name: contentName,
    content_category: category,
  };

  callFbq("track", "Lead", eventData);

  logInternalEvent({
    eventName: "Lead",
    payload: eventData,
  });
}

