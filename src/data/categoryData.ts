import { StoryCategory } from "./blogData";

export interface CategoryInfo {
  slug: string;
  nameBn: StoryCategory;
  icon: string;
  taglineBn: string;
  descriptionBn: string;
  badgeBn: string;
  accentBgLight: string;
  accentBgDark: string;
  accentBorder: string;
  accentText: string;
}

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    slug: "romantic-golpo",
    nameBn: "রোমান্টিক গল্প",
    icon: "📖",
    taglineBn: "ভালোবাসা, প্রেম ও মিষ্টি স্মৃতির মধুর কথকতা",
    descriptionBn:
      "মনের কোণে জমে থাকা মিষ্টি অনুভূতির গল্প, গভীর সম্পর্কের আবেগ আর ভালোবাসার প্রতিটি মুহূর্তের অনন্য রূপ।",
    badgeBn: "রোমান্স ও প্রেম",
    accentBgLight: "bg-rose-50",
    accentBgDark: "dark:bg-rose-950/30",
    accentBorder: "border-rose-200 dark:border-rose-900/60",
    accentText: "text-rose-700 dark:text-rose-300",
  },
  {
    slug: "jiboner-golpo",
    nameBn: "জীবনের গল্প",
    icon: "⛅",
    taglineBn: "বাস্তব জীবন, পরিবার ও অভিজ্ঞতার চালচিত্র",
    descriptionBn:
      "বাস্তব জীবনের চড়াই-উতরাই, পারিবারিক টানাপোড়েন, বন্ধন এবং নীরব লড়াইয়ের সত্য ঘটনাগুলো নিয়ে সাজানো এই অধ্যায়।",
    badgeBn: "বাস্তব জীবন",
    accentBgLight: "bg-amber-50",
    accentBgDark: "dark:bg-amber-950/30",
    accentBorder: "border-amber-200 dark:border-amber-900/60",
    accentText: "text-amber-800 dark:text-amber-300",
  },
  {
    slug: "crush-confession",
    nameBn: "ক্রাশ ও কনফেশন",
    icon: "❤️",
    taglineBn: "গোপন ভালো লাগা, প্রথম প্রেম ও মনের অব্যক্ত কথা",
    descriptionBn:
      "কাউকে দূর থেকে ভালো লাগা, বুকের ভেতর লুকানো অনুভূতির প্রকাশ আর মিষ্টি প্রথম প্রেমের রঙিন কনফেশন।",
    badgeBn: "গোপন অনুভূতি",
    accentBgLight: "bg-red-50",
    accentBgDark: "dark:bg-red-950/30",
    accentBorder: "border-red-200 dark:border-red-900/60",
    accentText: "text-red-700 dark:text-red-300",
  },
  {
    slug: "na-bola-kotha",
    nameBn: "না বলা কথা",
    icon: "✉️",
    taglineBn: "যে কথাগুলো মুখ ফুটে বলা হয়নি কখনো",
    descriptionBn:
      "হাজারো মানুষের না বলা দীর্ঘশ্বাস, বুকের গভীরে চেপে রাখা অনুভূতি আর বেনামী চিঠির এক নিঃশব্দ আশ্রয়।",
    badgeBn: "অব্যক্ত দীর্ঘশ্বাস",
    accentBgLight: "bg-indigo-50",
    accentBgDark: "dark:bg-indigo-950/30",
    accentBorder: "border-indigo-200 dark:border-indigo-900/60",
    accentText: "text-indigo-700 dark:text-indigo-300",
  },
  {
    slug: "breakup-ex",
    nameBn: "বিচ্ছেদ ও প্রাক্তন",
    icon: "💔",
    taglineBn: "স্মৃতি, অভিমান ও বিচ্ছেদের ক্ষত মোছার গল্প",
    descriptionBn:
      "ভাঙা হৃদয়কে সান্ত্বনা দেওয়ার, ফেলে আসা স্মৃতি থেকে নিজেকে মুক্ত করার এবং নতুন করে বেঁচে ওঠার অনুপ্রেরণা।",
    badgeBn: "হৃদয়ভঙ্গ ও নিরাময়",
    accentBgLight: "bg-stone-100",
    accentBgDark: "dark:bg-stone-900/40",
    accentBorder: "border-stone-300 dark:border-stone-700",
    accentText: "text-stone-700 dark:text-stone-300",
  },
  {
    slug: "relationship-psychology",
    nameBn: "সম্পর্ক ও মনস্তত্ত্ব",
    icon: "🧠",
    taglineBn: "দাম্পত্য, মনের বিজ্ঞান ও গভীর আবেগীয় সংযোগ",
    descriptionBn:
      "সম্পর্কের ভেতর মনস্তাত্ত্বিক বোঝাপড়া, আস্থা, স্পর্শ এবং দীর্ঘস্থায়ী সুখী বন্ধন তৈরির বিজ্ঞানভিত্তিক মনস্তত্ত্ব।",
    badgeBn: "মনস্তত্ত্ব ও দাম্পত্য",
    accentBgLight: "bg-purple-50",
    accentBgDark: "dark:bg-purple-950/30",
    accentBorder: "border-purple-200 dark:border-purple-900/60",
    accentText: "text-purple-700 dark:text-purple-300",
  },
  {
    slug: "health-wellness",
    nameBn: "স্বাস্থ্য ও সুস্থতা",
    icon: "🌱",
    taglineBn: "মন ও শরীরের সুস্থতার বিজ্ঞানসম্মত টিপস ও যত্ন",
    descriptionBn:
      "উদ্বেগমুক্তি, মানসিক প্রশান্তি, স্ট্রেস রিলিফ এবং প্রতিদিনের শারীরিক ও মনস্তাত্ত্বিক সুস্থতার নির্দেশিকা।",
    badgeBn: "হেলথ ও ওয়েলনেস",
    accentBgLight: "bg-emerald-50",
    accentBgDark: "dark:bg-emerald-950/30",
    accentBorder: "border-emerald-200 dark:border-emerald-900/60",
    accentText: "text-emerald-700 dark:text-emerald-300",
  },
  {
    slug: "self-growth",
    nameBn: "নিজেকে জানুন",
    icon: "✨",
    taglineBn: "আত্মউন্নয়ন, ভেতরের শক্তি ও মানসিক শান্তি",
    descriptionBn:
      "নিজেকে নতুন করে আবিষ্কার করা, আত্মবিশ্বাস বাড়ানো ও জীবনের অর্থ খুঁজে পাওয়ার আত্মিক অনুপ্রেরণা।",
    badgeBn: "আত্মউন্নয়ন",
    accentBgLight: "bg-teal-50",
    accentBgDark: "dark:bg-teal-950/30",
    accentBorder: "border-teal-200 dark:border-teal-900/60",
    accentText: "text-teal-700 dark:text-teal-300",
  },
  {
    slug: "open-letter",
    nameBn: "খোলা চিঠি",
    icon: "✏️",
    taglineBn: "কাউকে উদ্দেশ্য করে মন খুলে লেখা একান্ত চিঠি",
    descriptionBn:
      "হারিয়ে যাওয়া বন্ধু, মনের মানুষ কিংবা নিজের ফেলে আসা অতীতের কাছে পাঠানো একগুচ্ছ আবেগমাখা খোলা চিঠি।",
    badgeBn: "খোলা চিঠি",
    accentBgLight: "bg-sky-50",
    accentBgDark: "dark:bg-sky-950/30",
    accentBorder: "border-sky-200 dark:border-sky-900/60",
    accentText: "text-sky-700 dark:text-sky-300",
  },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  const clean = String(slug || "").toLowerCase().trim();
  return CATEGORIES_DATA.find((c) => c.slug === clean);
}

export function getCategoryByName(nameBn: string): CategoryInfo | undefined {
  const clean = String(nameBn || "").trim();
  return CATEGORIES_DATA.find((c) => c.nameBn === clean);
}

export function getSlugByCategory(nameBn: string): string {
  const found = getCategoryByName(nameBn);
  return found ? found.slug : "crush-confession";
}

