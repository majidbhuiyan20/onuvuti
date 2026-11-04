export type WishMusic = "none" | "happy_birthday" | "lullaby" | "romantic";
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

export const MUSIC_OPTIONS: { id: WishMusic; label: string; emoji: string }[] = [
  { id: "none", label: "কোনো মিউজিক নয়", emoji: "🔇" },
  { id: "happy_birthday", label: "হ্যাপি বার্থডে", emoji: "🎂" },
  { id: "romantic", label: "রোমান্টিক সুর", emoji: "💞" },
  { id: "lullaby", label: "শান্ত সুর", emoji: "🌙" },
];

