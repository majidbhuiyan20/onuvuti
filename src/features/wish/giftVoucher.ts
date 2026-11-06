export interface GiftVoucherData {
  title: string;
  amount: string;
  note: string;
  token?: string;
}

export function parseGiftVoucher(text: string): { cleanMessage: string; voucher: GiftVoucherData | null } {
  if (!text) return { cleanMessage: "", voucher: null };

  const match = text.match(
    /\[GIFT_VOUCHER:\s*title=([^|]+)\s*\|\s*amount=([^|]+)\s*\|\s*note=([^|]+)(?:\s*\|\s*token=([^\]]+))?\]/i
  );
  if (!match) return { cleanMessage: text, voucher: null };

  const cleanMessage = text.replace(match[0], "").trim();
  const voucher: GiftVoucherData = {
    title: match[1]?.trim() || "শুভেচ্ছা উপহার",
    amount: match[2]?.trim() || "",
    note: match[3]?.trim() || "",
    token: match[4]?.trim() || undefined,
  };

  return { cleanMessage, voucher };
}

export function formatGiftVoucherTag(voucher: GiftVoucherData): string {
  if (!voucher.title && !voucher.amount) return "";
  return `\n\n[GIFT_VOUCHER: title=${voucher.title.trim()} | amount=${voucher.amount.trim()} | note=${(voucher.note || "").trim()}${
    voucher.token ? ` | token=${voucher.token.trim()}` : ""
  }]`;
}

