export type StoryCategory =
  | "ক্রাশ ও কনফেশন"
  | "রোমান্টিক গল্প"
  | "জীবনের গল্প"
  | "না বলা কথা"
  | "বিচ্ছেদ ও প্রাক্তন"
  | "সম্পর্ক ও মনস্তত্ত্ব"
  | "স্বাস্থ্য ও সুস্থতা"
  | "নিজেকে জানুন"
  | "খোলা চিঠি";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: StoryCategory;
  readTimeBn: string;
  dateBn: string;
  author: string;
  isAnonymous?: boolean;
  isAdminPost?: boolean;
  confessionIdBn?: string;
  /**
   * Optional image URL or base64 data URL.
   * ONLY rendered if the writer or admin explicitly adds an image.
   * No default/placeholder image is shown when omitted.
   */
  imageUrl?: string;
  /**
   * Optional editorial advice/reply from Admin ("অনুভূতি টিমের পরামর্শ / উত্তর").
   */
  adminNote?: string;
  viewsCount?: number;
  likesCount: number;
  reactions?: {
    love: number;
    touched: number;
    relatable: number;
  };
  featured?: boolean;
  content: string[];
}

export const BLOG_CATEGORIES: string[] = [
  "সকল গল্প",
  "ক্রাশ ও কনফেশন",
  "রোমান্টিক গল্প",
  "জীবনের গল্প",
  "না বলা কথা",
  "বিচ্ছেদ ও প্রাক্তন",
  "সম্পর্ক ও মনস্তত্ত্ব",
  "স্বাস্থ্য ও সুস্থতা",
  "নিজেকে জানুন",
  "খোলা চিঠি",
];

// In production, no hardcoded dummy stories exist.
// Stories are loaded 100% dynamically from PostgreSQL and managed via Admin dashboard.
export const BLOG_POSTS: BlogPost[] = [];

export const DAILY_QUOTES_BN: string[] = [
  "তোমাকে ভুলে যাওয়ার চেষ্টা করতে করতে, তোমাকেই আরও বেশি মনে পড়ে।",
  "কিছু মানুষ মুখে ভালোবাসি বলে না, কিন্তু সারাদিনের ক্লান্তি শেষে চুপচাপ পাশে এসে বসে—সেটাই সবচেয়ে গভীর ভালোবাসা।",
  "সম্পর্কে জিতে যাওয়ার চেয়ে প্রিয় মানুষটাকে ধরে রাখা অনেক বেশি জরুরি; ইগো জিতলে ভালোবাসা হেরে যায়।",
  "মানুষের সবচেয়ে বড় একাকীত্ব হলো মনের কথাগুলো প্রিয় মানুষটির সামনে বসেও বলতে না পারা।",
  "যাকে সত্যিকারের ভালোবাসা যায়, তার হাজারটা অভিমানও বুকের ভেতর যত্ন করে আগলে রাখা যায়।",
];

export interface PollOptionItem {
  id: string;
  label: string;
  votes: number;
}

export const HOME_POLL_QUESTION =
  "তুমি কি কখনো কাউকে না জানিয়েই ভালোবেসেছ?";

export const INITIAL_POLL_OPTIONS: PollOptionItem[] = [
  { id: "opt-1", label: "হ্যাঁ, এখনো বাসি", votes: 412 },
  { id: "opt-2", label: "একসময় বাসতাম", votes: 285 },
  { id: "opt-3", label: "কখনো এমন হয়নি", votes: 76 },
];
