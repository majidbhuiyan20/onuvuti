/**
 * Go Backend API Client Helper
 * Connects Next.js Frontend to the Onuvuti Go Backend (default: http://localhost:8081/api/v1)
 */

export const GO_API_BASE_URL =
  process.env.NEXT_PUBLIC_GO_API_URL || "http://localhost:8081/api/v1";

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
