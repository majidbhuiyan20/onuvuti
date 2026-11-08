export interface SecretInboxPublic {
  username: string;
  displayName: string;
  promptText: string;
  theme: string;
  messagesCount: number;
  createdAt: string;
}

export interface SecretMessage {
  id: string;
  inboxId: string;
  content: string;
  moodEmoji: string;
  cardTheme: string;
  replyText: string;
  isRead: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface CreateInboxRequest {
  username: string;
  displayName: string;
  promptText?: string;
  theme?: string;
}

export interface CreateInboxResponse {
  ok: boolean;
  inbox: SecretInboxPublic;
  manageKey: string;
  publicUrl: string;
  inboxUrl: string;
  msg: string;
}

export interface SendMessageRequest {
  content: string;
  moodEmoji?: string;
  cardTheme?: string;
}

export interface PrivateInboxView {
  ok: boolean;
  inbox: SecretInboxPublic;
  messages: SecretMessage[];
}

export interface SavedInboxMeta {
  username: string;
  displayName: string;
  manageKey: string;
  createdAt: string;
}

export type StoryThemeId =
  | "crimson"
  | "obsidian_gold"
  | "cyber_neon"
  | "rose_quartz"
  | "midnight"
  | "polaroid"
  | "dark_academia"
  | "vintage"
  | "emerald"
  | "birthday_cake"
  | "birthday_royal"
  | "aurora"
  | "sunset";

export interface StoryTheme {
  id: StoryThemeId;
  nameBn: string;
  tagBn?: string;
  category?: "royal" | "modern" | "vintage" | "festive";
  styleType?:
    | "royal_seal"
    | "obsidian_gold"
    | "cyber_neon"
    | "rose_quartz"
    | "midnight_stars"
    | "polaroid_tape"
    | "dark_academia"
    | "vintage_papyrus"
    | "emerald_botanical"
    | "aurora_glass"
    | "sunset_glow"
    | "birthday_confetti";
  bgGradient: string[];
  questionBg: string;
  questionBorder: string;
  questionText: string;
  answerBg: string;
  answerBorder: string;
  answerText: string;
  badgeBg: string;
  badgeText: string;
  footerColor: string;
  accentColor?: string;
  foilBorder?: string;
}

