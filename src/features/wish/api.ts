import type {
  CreatedWish,
  CreateWishPayload,
  WishContent,
  WishPublic,
  WishReply,
} from "./types";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; status: number };

const GENERIC_ERROR =
  "সার্ভার থেকে সঠিক তথ্য পাওয়া যায়নি। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।";

/** Never throws: network failures and non-JSON bodies (e.g. proxy HTML) become typed errors. */
async function request<T>(
  url: string,
  init?: RequestInit,
  pick?: (body: Record<string, unknown>) => T
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, { cache: "no-store", ...init });
    const text = await res.text();

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text);
    } catch {
      return { ok: false, error: GENERIC_ERROR, status: res.status };
    }

    if (!res.ok || body.ok === false) {
      return {
        ok: false,
        error: (body.error as string) || GENERIC_ERROR,
        code: body.code as string | undefined,
        status: res.status,
      };
    }
    return { ok: true, data: pick ? pick(body) : (body as unknown as T) };
  } catch {
    return { ok: false, error: GENERIC_ERROR, status: 0 };
  }
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const enc = encodeURIComponent;

export const wishApi = {
  create: (payload: CreateWishPayload) =>
    request<CreatedWish>("/api/v1/wishes", json(payload), (b) => ({
      id: b.id as string,
      shareUrl: b.shareUrl as string,
      manageKey: b.manageKey as string,
    })),

  getPublic: (id: string) =>
    request<WishPublic>(`/api/v1/wishes/${enc(id)}`, undefined, (b) => b.wish as WishPublic),

  open: (id: string, passcode?: string) =>
    request<WishContent>(
      `/api/v1/wishes/${enc(id)}/open`,
      json({ passcode: passcode ?? "" }),
      (b) => b.content as WishContent
    ),

  react: (id: string, emoji: string, text: string) =>
    request<void>(`/api/v1/wishes/${enc(id)}/replies`, json({ emoji, text }), () => undefined),

  replies: (id: string, key: string) =>
    request<{ wish: WishPublic; replies: WishReply[] }>(
      `/api/v1/wishes/${enc(id)}/replies?key=${enc(key)}`,
      undefined,
      (b) => ({ wish: b.wish as WishPublic, replies: b.replies as WishReply[] })
    ),
};

