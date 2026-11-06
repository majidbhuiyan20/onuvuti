"use client";

import React from "react";
import Link from "next/link";
import {
  Feather,
  Heart,
  Sparkles,
  Lock,
  ArrowRight,
  Mail,
  Clock,
} from "lucide-react";

interface ChithiSnippet {
  id: string;
  category: string;
  text: string;
  timeAgo: string;
  moodColor: string;
}

const FEATURED_CHITHI_SNIPPETS: ChithiSnippet[] = [
  {
    id: "chithi-1",
    category: "গোপন অনুভূতি",
    text: "কিছু কথা সামনাসামনি বলা যায় না, তাই এখানে লিখে রেখে গেলাম। তুমি হয়তো জানবেও না, কার হাসিতে কার পৃথিবী ভালো হয়ে যেত।",
    timeAgo: "১০ মিনিট আগে",
    moodColor: "rose",
  },
  {
    id: "chithi-2",
    category: "না বলা কথা",
    text: "প্রতিটা শহরের একটা করে গল্প থাকে, আর আমার প্রতিটা অসমাপ্ত গল্পের শেষ লাইনে তুমি ছিলে।",
    timeAgo: "৩৫ মিনিট আগে",
    moodColor: "amber",
  },
  {
    id: "chithi-3",
    category: "ভালোবাসার স্মৃতি",
    text: "আজও বৃষ্টি নামলে সেই বারান্দা আর তোমার বলা কথাগুলো খুব মনে পড়ে। অনুভূতিগুলো এখনো অমলিন।",
    timeAgo: "১ ঘণ্টা আগে",
    moodColor: "indigo",
  },
  {
    id: "chithi-4",
    category: "ক্রাশ ও ভালোলাগা",
    text: "তোমাকে প্রতিদিন দূর থেকে দেখি, কিন্তু কোনোদিন কাছে গিয়ে বলার সাহস হলো না। ভালো থেকো তুমি।",
    timeAgo: "২ ঘণ্টা আগে",
    moodColor: "emerald",
  },
];

export default function HomeChithiWall() {
  return (
    <section
      aria-label="অনুভূতির চিরকুট দেয়াল"
      className="w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FAF5E8] via-[#FAF6EE] to-[#F3EAD8] dark:from-[#18130E] dark:via-[#111827] dark:to-[#17130F] border-2 border-[#D4AF37]/40 dark:border-[#D4AF37]/20 shadow-sm relative overflow-hidden space-y-6"
    >
      {/* Subtle vintage lined notebook texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 24px)",
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7E151E]/10 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 text-xs font-bold border border-[#7E151E]/20">
            <Feather className="w-3.5 h-3.5 text-[#7E151E] dark:text-rose-400" />
            <span>বেনামী চিরকুট দেয়াল</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#142230] dark:text-white font-serif tracking-tight">
            হৃদয়ের না বলা অনুভূতির চিরকুট
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium max-w-lg">
            পাঠকদের পাঠানো কিছু না বলা গোপন অনুভূতি ও মিষ্টি স্মৃতি—যেখানে পরিচয় গোপন, কিন্তু অনুভূতিগুলো ১০০% খাঁটি।
          </p>
        </div>

        <Link
          href="/m"
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#7E151E] hover:bg-[#680f18] text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>নিজের চিরকুট লিখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Chithi Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {FEATURED_CHITHI_SNIPPETS.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white/90 dark:bg-stone-900/80 backdrop-blur-sm border border-amber-300/60 dark:border-amber-900/40 p-4 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3 relative group"
          >
            {/* Top Pin / Wax Badge */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-[#7E151E] dark:text-rose-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C59B27]" />
                <span>{item.category}</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{item.timeAgo}</span>
              </span>
            </div>

            {/* Note Snippet */}
            <p className="text-xs sm:text-[13px] font-serif leading-relaxed text-stone-800 dark:text-stone-100 italic select-text">
              &ldquo;{item.text}&rdquo;
            </p>

            {/* Footer Sign-off */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-serif">
              <span className="italic">— একজন শুভাকাঙ্ক্ষী</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-sans font-bold inline-flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span>বেনামী</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
