import {
  CreateInboxRequest,
  CreateInboxResponse,
  PrivateInboxView,
  SecretInboxPublic,
  SendMessageRequest,
} from "./types";

const BASE_PATH = "/api/v1/secret";

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    const errorMsg = json?.error || "সার্ভার থেকে সঠিক তথ্য পাওয়া যায়নি";
    throw new Error(errorMsg);
  }
  return json as T;
}

export async function createSecretInbox(
  req: CreateInboxRequest
): Promise<CreateInboxResponse> {
  const res = await fetch(`${BASE_PATH}/inboxes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return parseResponse<CreateInboxResponse>(res);
}

export async function getPublicInbox(
  username: string
): Promise<SecretInboxPublic> {
  const res = await fetch(
    `${BASE_PATH}/inboxes/${encodeURIComponent(username.toLowerCase())}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  const data = await parseResponse<{ ok: boolean; inbox: SecretInboxPublic }>(
    res
  );
  return data.inbox;
}

export async function sendSecretMessage(
  username: string,
  req: SendMessageRequest
): Promise<{ ok: boolean; msg: string; id: string }> {
  const res = await fetch(
    `${BASE_PATH}/inboxes/${encodeURIComponent(username.toLowerCase())}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }
  );
  return parseResponse<{ ok: boolean; msg: string; id: string }>(res);
}

export async function getPrivateInbox(
  username: string,
  key: string
): Promise<PrivateInboxView> {
  const res = await fetch(
    `${BASE_PATH}/inboxes/${encodeURIComponent(
      username.toLowerCase()
    )}/inbox?key=${encodeURIComponent(key)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  return parseResponse<PrivateInboxView>(res);
}

export async function replySecretMessage(
  username: string,
  msgId: string,
  key: string,
  replyText: string
): Promise<{ ok: boolean; msg: string }> {
  const res = await fetch(
    `${BASE_PATH}/inboxes/${encodeURIComponent(
      username.toLowerCase()
    )}/messages/${encodeURIComponent(msgId)}/reply?key=${encodeURIComponent(
      key
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyText }),
    }
  );
  return parseResponse<{ ok: boolean; msg: string }>(res);
}

export async function deleteSecretMessage(
  username: string,
  msgId: string,
  key: string
): Promise<{ ok: boolean; msg: string }> {
  const res = await fetch(
    `${BASE_PATH}/inboxes/${encodeURIComponent(
      username.toLowerCase()
    )}/messages/${encodeURIComponent(msgId)}?key=${encodeURIComponent(key)}`,
    {
      method: "DELETE",
    }
  );
  return parseResponse<{ ok: boolean; msg: string }>(res);
}

