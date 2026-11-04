export interface BirthdayTemplate {
  id: string;
  category: string;
  label: string;
  emoji: string;
  title: string;
  preview: string;
  fullMessage: string;
}

export interface WishTheme {
  id: string;
  name: string;
  bgGradient: string;
  envelopeColor: string;
  envelopeBorder: string;
  sealColor: string;
  sealText: string;
  letterBg: string;
  textColor: string;
  accentColor: string;
}

export const WISH_THEMES: WishTheme[] = [
  {
    id: "rose",
    name: "ভালোবাসার গোলাপ (Romantic Rose)",
    bgGradient: "from-rose-950 via-[#1a080d] to-stone-950",
    envelopeColor: "#8b1e3f",
    envelopeBorder: "#b03058",
    sealColor: "#c2185b",
    sealText: "❤",
    letterBg: "#fffbfa",
    textColor: "#3d101d",
    accentColor: "#9c1b48",
  },
  {
    id: "vintage",
    name: "ভিন্টেজ পার্চমেন্ট (Vintage Parchment)",
    bgGradient: "from-amber-950 via-[#17120a] to-stone-950",
    envelopeColor: "#614022",
    envelopeBorder: "#8d5d32",
    sealColor: "#b45309",
    sealText: "✦",
    letterBg: "#fef8ee",
    textColor: "#382313",
    accentColor: "#92400e",
  },
  {
    id: "midnight",
    name: "মিডনাইট স্টার (Midnight Galaxy)",
    bgGradient: "from-indigo-950 via-[#0a0f24] to-stone-950",
    envelopeColor: "#1e295d",
    envelopeBorder: "#34458f",
    sealColor: "#4f46e5",
    sealText: "★",
    letterBg: "#f8f9ff",
    textColor: "#131a38",
    accentColor: "#3730a3",
  },
  {
    id: "gold",
    name: "সোনালী উৎসব (Golden Festive)",
    bgGradient: "from-yellow-950 via-[#1a1405] to-stone-950",
    envelopeColor: "#785312",
    envelopeBorder: "#a1701b",
    sealColor: "#d97706",
    sealText: "🎂",
    letterBg: "#fffdf5",
    textColor: "#362404",
    accentColor: "#b45309",
  },
];

export const BIRTHDAY_TEMPLATES: BirthdayTemplate[] = [
  {
    id: "love-1",
    category: "ভালোবাসা",
    label: "ভালোবাসার মানুষ",
    emoji: "❤️",
    title: "তুমি আমার প্রতিটি প্রার্থনার নাম",
    preview: "আজকের দিনটা পৃথিবীর আর সবার কাছে সাধারণ হতে পারে...",
    fullMessage: `আজকের দিনটা পৃথিবীর আর সবার কাছে সাধারণ হতে পারে, কিন্তু আমার কাছে এটা পৃথিবীর সবচেয়ে সুন্দর দিন। কারণ ঠিক আজকের দিনেই তুমি পৃথিবীতে এসেছিলে আমার জীবনটাকে পূর্ণতা দিতে।

তোমার চোখের মায়ায় আমি শান্তি খুঁজে পাই, তোমার মিষ্টি হাসিতে আমার সারা দিনের ক্লান্তি মুছে যায়। ঈশ্বর তোমাকে আজীবন সুস্থ, হাসিখুশি এবং নিরাপদে রাখুন। জীবনের প্রতিটি বাঁকে আমি তোমার হাত ধরে এভাবেই পাশে থাকতে চাই।

শুভ জন্মদিন, আমার চাঁদের আলো! 🌹`,
  },
  {
    id: "love-2",
    category: "ভালোবাসা",
    label: "জীবনসঙ্গী / ক্রাশ",
    emoji: "💖",
    title: "এক সমুদ্র ভালোবাসা ও শুভকামনা",
    preview: "তুমি পাশে থাকলে বিষাদময় বিকেলটাও উৎসব হয়ে ওঠে...",
    fullMessage: `তুমি পাশে থাকলে বিষাদময় বিকেলটাও উৎসব হয়ে ওঠে। তোমার উপস্থিতি আমার সাধারণ দিনগুলোকে অসম্ভব মায়াময় করে তোলে। 

আজ তোমার জন্মদিনে একটাই চাওয়া—তুমি যেন কোনোদিন হাসতে ভুলে না যাও। পৃথিবীর সকল আনন্দ, সকল সুখ তোমার পদতলে এসে জমা হোক। 

শুভ জন্মদিন, আমার ভালো থাকার কারণ! ❤️✨`,
  },
  {
    id: "friend-1",
    category: "বন্ধু",
    label: "বেস্ট ফ্রেন্ড",
    emoji: "🤝",
    title: "অসময়ের সঙ্গী, পাগলামির দোসর",
    preview: "রক্তের সম্পর্ক না হয়েও যে মানুষটা সবচেয়ে কাছের...",
    fullMessage: `রক্তের সম্পর্ক না হয়েও যে মানুষটা আমার জীবনের সবচেয়ে কাছের, যার সাথে রাত ৩টার আড্ডাও ছোট মনে হয়—সেই মানুষটার আজ জন্মদিন!

জীবনের সবচেয়ে কঠিন দিনগুলোতে তুই যেমন বিনা দ্বিধায় পাশে দাঁড়িয়েছিলিস, সেই ঋণ কখনো শোধ করার নয়। তোর স্বপ্নগুলো সত্যি হোক, তোর ব্যাংক ব্যালেন্স বাড়ুক আর তোর এই পাগলামি আজীবন বেঁচে থাকুক!

শুভ জন্মদিন দোস্ত! আজকের মিষ্টি ও ট্রিট যেন বাকি না থাকে! 🍰🎉`,
  },
  {
    id: "crush-1",
    category: "ক্রাশ",
    label: "গোপন ক্রাশ",
    emoji: "💌",
    title: "দূরে থেকে তোমাকে ভালোবেসে",
    preview: "হয়তো সামনাসামনি গিয়ে কখনো বলতে পারব না...",
    fullMessage: `হয়তো সামনাসামনি গিয়ে কখনো সাহস করে বলা হবে না, হয়তো তুমি কোনোদিন জানবেও না দূর থেকে একজোড়া চোখ তোমার হাসির অপেক্ষা করে।

আজ তোমার জন্মদিনে সেই না-বলা মনের গভীর থেকে একরাশ নীল পদ্মের শুভেচ্ছা পাঠালাম। তোমার জীবনে কখনো দুঃখের ছায়া না পড়ুক, তোমার দিনগুলো ভরে উঠুক রাশি রাশি প্রাপ্তিতে।

শুভ জন্মদিন, দূর আকাশের তারা! 🌸💫`,
  },
  {
    id: "sibling-1",
    category: "ভাই-বোন",
    label: "ভাই বা বোন",
    emoji: "🎁",
    title: "সারাজীবনের খুনসুটি আর ভালোবাসা",
    preview: "সকাল-সন্ধ্যা ঝগড়া করলেও যার জন্য সবচেয়ে বেশি টান...",
    fullMessage: `সকাল-সন্ধ্যা যত খুনসুটি আর ঝগড়াই করি না কেন, মন খারাপ হলে কিন্তু তোকেই সবার আগে মনে পড়ে। তুই পাশে থাকলে দুনিয়ার কোনো ঝামেলাই বড় মনে হয় না।

আজকের এই বিশেষ দিনে দোয়া করি, তুই জীবনে অনেক বড় হ, যা চাস তা অর্জন কর। আর হ্যাঁ—আমার বার্থডে গিফট কিন্তু এখনো ডিউ আছে! 

শুভ জন্মদিন অনেক অনেক আদর ও ভালোবাসা সহ! 🎈🎂`,
  },
  {
    id: "special-1",
    category: "বিশেষ কেউ",
    label: "বিশেষ কেউ",
    emoji: "✨",
    title: "এক অমলিন শ্রদ্ধা ও শুভকামনা",
    preview: "কিছু মানুষের উপস্থিতি জীবনে আশীর্বাদের মতো...",
    fullMessage: `কিছু মানুষের উপস্থিতি জীবনে নীরব এক আশীর্বাদের মতো আসে। কোনো রকম প্রদর্শনী ছাড়াই যারা জীবনকে সুন্দর ভাবতে শেখায়। আপনি ঠিক তেমনই একজন বিশেষ মানুষ।

আপনার জন্মদিনের এই শুভলগ্নে জানাই হৃদয়ের গভীর থেকে আন্তরিক শুভকামনা। আগামী দিনগুলো আপনার জন্য বয়ে আনুক অফুরন্ত শান্তি, সমৃদ্ধি ও অনাবিল আনন্দ।

শুভ জন্মদিন! 🌟`,
  },
];
