/**
 * Go Backend API Client Helper
 * Connects Next.js Frontend and Server-Side routes to the Onuvuti Go Backend (:8081)
 */

export function getGoApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // In browser: use relative proxy path so requests go through Nginx to backend
    return process.env.NEXT_PUBLIC_GO_API_URL || "/api/v1";
  }
  // Server-side (Node.js runtime on AWS): use direct loopback
  return (
    process.env.INTERNAL_GO_API_URL ||
    process.env.GO_API_BASE_URL ||
    "http://127.0.0.1:8081/api/v1"
  );
}

export const GO_API_BASE_URL = getGoApiBaseUrl();

export function getInternalAuthHeaders(): Record<string, string> {
  const secret = (
    process.env.INTERNAL_SERVICE_SECRET ||
    "onuvuti-internal-rpc-secret-key-2026"
  ).trim();
  if (secret.length < 32) {
    throw new Error("INTERNAL_SERVICE_SECRET is missing or invalid.");
  }
  return {
    "Content-Type": "application/json",
    "X-Internal-Secret": secret,
  };
}

export function getAdminAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = sessionStorage.getItem("onuvuti_admin_token") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getUserAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("onuvuti_user_token") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "google" | "manual";
  createdAt?: string;
}

export interface BackendPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface BackendPoll {
  id: string;
  question: string;
  options: BackendPollOption[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendQuote {
  id: string;
  quote: string;
  author: string;
  reactCount: number;
  storyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendWish {
  id: string;
  recipientName: string;
  senderName: string;
  relationship: string;
  message: string;
  theme: string;
  viewsCount: number;
  createdAt: string;
}

