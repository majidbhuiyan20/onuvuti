import { SavedInboxMeta } from "./types";

const STORAGE_KEY = "onuvuti_secret_inboxes_v1";

export function getMySavedInboxes(): SavedInboxMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveMyInbox(inbox: {
  username: string;
  displayName: string;
  manageKey: string;
}): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getMySavedInboxes();
    const filtered = existing.filter(
      (item) => item.username.toLowerCase() !== inbox.username.toLowerCase()
    );
    filtered.unshift({
      username: inbox.username.toLowerCase(),
      displayName: inbox.displayName,
      manageKey: inbox.manageKey,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 15)));
  } catch (err) {
    console.error("Failed to save secret inbox:", err);
  }
}

export function removeMySavedInbox(username: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getMySavedInboxes();
    const filtered = existing.filter(
      (item) => item.username.toLowerCase() !== username.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to remove saved inbox:", err);
  }
}
