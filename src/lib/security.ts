/**
 * Security, Rate Limiting & Input Sanitization Utilities
 * Protects Onuvuti from spam bots, XSS, brute-force, and malicious uploads.
 */

interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leaks
function cleanupRateLimitStore(now: number) {
  if (rateLimitStore.size > 5000) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (
        (!entry.blockedUntil || entry.blockedUntil < now) &&
        entry.timestamps.every((t) => now - t > 3600_000)
      ) {
        rateLimitStore.delete(key);
      }
    }
  }
}

export interface RateLimitConfig {
  /** Unique bucket name (e.g., 'story_submit', 'admin_login', 'api_general') */
  bucket: string;
  /** Client identifier (IP address or session key) */
  identifier: string;
  /** Maximum allowed requests within windowMs */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Optional lockout duration in ms if limit is exceeded */
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Sliding-window rate limiter with optional temporary IP lockout for brute-force defense.
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanupRateLimitStore(now);

  const key = `${config.bucket}:${config.identifier}`;
  const entry: RateLimitEntry = rateLimitStore.get(key) || { timestamps: [] };

  // Check if currently locked out
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Filter timestamps within current sliding window
  const windowStart = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.maxRequests) {
    const blockMs = config.blockDurationMs ?? config.windowMs;
    entry.blockedUntil = now + blockMs;
    rateLimitStore.set(key, entry);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(blockMs / 1000),
    };
  }

  entry.timestamps.push(now);
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - entry.timestamps.length),
    retryAfterSeconds: 0,
  };
}

/**
 * Extract client IP safely from request headers (supports Nginx X-Forwarded-For / Cloudflare).
 */
export function getClientIp(headers: Headers): string {
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Sanitize user-submitted text to strip XSS payloads, HTML tags, script injections,
 * and dangerous protocols while preserving Bengali Unicode text and normal punctuation.
 * If maxLength is omitted or <= 0, no truncation is applied (unlimited length).
 */
export function sanitizeText(input: string, maxLength?: number): string {
  if (!input || typeof input !== "string") return "";

  const sanitized = input
    // Remove <script>, <iframe>, <object>, <embed>, <style> blocks completely
    .replace(/<(script|iframe|object|embed|style|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, "")
    // Strip any remaining HTML tags
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Remove dangerous inline protocols
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:\s*text\/html/gi, "")
    // Remove event handlers like onerror=, onload=, onclick=
    .replace(/\bon\w+\s*=/gi, "")
    // Normalize excessive null bytes or control chars (keep newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();

  if (typeof maxLength === "number" && maxLength > 0) {
    return sanitized.slice(0, maxLength);
  }
  return sanitized;
}

/**
 * Validate optional user/admin uploaded image (Client & Server safe).
 * Blocks SVG (which can embed XSS scripts), executable files, and files > 2MB.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB allowed before client compression

export function validateImageUpload(file: {
  type: string;
  size: number;
  name: string;
}): { valid: boolean; errorBn?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      errorBn:
        "শুধুমাত্র JPG, PNG অথবা WEBP ফরম্যাটের ছবি আপলোড করা যাবে (SVG বা অন্য ফাইল গ্রহণযোগ্য নয়)।",
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return {
      valid: false,
      errorBn: "ছবির ফাইল এক্সটেনশন অবশ্যই .jpg, .png বা .webp হতে হবে।",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      errorBn: "ছবির সাইজ সর্বোচ্চ ১৫ মেগাবাইট (15 MB) হতে পারবে।",
    };
  }

  return { valid: true };
}

/**
 * Validate base64 data URL image if sent in JSON payload.
 */
export function isValidImageDataUrl(dataUrl?: string): boolean {
  if (!dataUrl) return true; // Optional!
  if (dataUrl.startsWith("/images/")) return true; // Local public asset
  const match = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=\r\n]+$/i.test(
    dataUrl.trim()
  );
  return match && dataUrl.length <= 10_000_000;
}

