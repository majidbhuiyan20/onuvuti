export type WishMusic = "none" | "happy_birthday" | "lullaby" | "romantic" | "shehnai";
export type WishFont = "classic" | "handwritten";

/** What anyone holding the link sees before the letter is opened (no protected content). */
export interface WishPublic {
  id: string;
  recipientName: string;
  senderName: string;
  relationship: string;
  theme: string;
  fontStyle: WishFont;
  music: WishMusic;
  unlockAt?: string;
  locked: boolean;
  hasPasscode: boolean;
  selfDestruct: boolean;
  destroyed: boolean;
  hasPhoto: boolean;
  hasVoice: boolean;
  viewsCount: number;
  createdAt: string;
  serverNow: string;
}

/** Protected payload released by a successful "open". */
export interface WishContent {
  message: string;
  photoUrl?: string;
  voiceUrl?: string;
}

export interface CreateWishPayload {
  recipientName: string;
  senderName: string;
  relationship: string;
  message: string;
  theme: string;
  fontStyle: WishFont;
  music: WishMusic;
  photoUrl?: string;
  voiceUrl?: string;
  unlockAt?: string;
  passcode?: string;
  selfDestruct?: boolean;
}

export interface CreatedWish {
  id: string;
  shareUrl: string;
  manageKey: string;
}

export interface WishReply {
  id: string;
  emoji: string;
  text: string;
  createdAt: string;
}

export const REACTION_EMOJIS = ["❤️", "😍", "🥹", "🎉", "🥳", "🙏"] as const;

export const MUSIC_OPTIONS: { id: WishMusic; label: string; tag: string }[] = [
  { id: "none", label: "সুর ছাড়া (নিঃশব্দ)", tag: "Silent" },
  { id: "shehnai", label: "শুভ পরিণয় সানাইয়ের সুর", tag: "Wedding" },
  { id: "romantic", label: "রোমান্টিক অ্যাকোস্টিক সুর", tag: "Romantic" },
  { id: "happy_birthday", label: "হ্যাপি বার্থডে মেলোডি", tag: "Birthday" },
  { id: "lullaby", label: "শান্ত পিয়ানো সুর", tag: "Peaceful" },
];

