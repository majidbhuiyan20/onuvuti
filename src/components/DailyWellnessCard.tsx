"use client";

import React, { useState } from "react";
import {
  HeartPulse,
  Sparkles,
  RefreshCw,
  Check,
  Share2,
  BookOpen,
  X,
  ArrowRight,
  ShieldCheck,
  Brain,
  Moon,
  Users2,
  Activity,
  Flame,
} from "lucide-react";

export interface WellnessGuide {
  id: string;
  category: "মানসিক স্বাস্থ্য" | "সম্পর্কের যত্ন" | "শারীরিক সুস্থতা" | "ঘুম ও মানসিক প্রশান্তি";
  title: string;
  summary: string;
  readTime: string;
  symptoms: string;
  whyItHappens: string;
  actionSteps: string[];
  psychologicalInsight: string;
  dailyHabit: string;
  expertAdvice: string;
}

const WELLNESS_GUIDES: WellnessGuide[] = [
  {
    id: "guide-1",
    category: "মানসিক স্বাস্থ্য",
    title: "উদ্বেগ, অতিরিক্ত চিন্তা (Overthinking) ও প্যানিক দূর করার বিজ্ঞানসম্মত উপায়",
    summary:
      "যখন মন অহেতুক নানা চিন্তায় অস্থির হয়ে ওঠে এবং বুকের ভেতর অজানা চাপ অনুভূত হয়, তখন '৫-৪-৩-২-১' গ্রাউন্ডিং টেকনিক মস্তিষ্ককে তাৎক্ষণিক প্রশান্তি দেয়।",
    readTime: "৩ মিনিট পাঠ",
    symptoms:
      "মাথায় অবিরাম ভবিষ্যতের ভয়, অতীত ভুলের অনুশোচনা, বুক ধড়ফড় করা এবং কোনো কাজেই মনোযোগ ধরে রাখতে না পারা।",
    whyItHappens:
      "মস্তিষ্কের ইমোশনাল সেন্টার 'অ্যামিগডালা' কাল্পনিক বিপদকে বাস্তব ভেবে অতিরিক্ত সতর্ক হয়ে ওঠে। এর ফলে স্ট্রেস হরমোন কর্টিসল ও অ্যাড্রেনালিন বেড়ে যায়।",
    actionSteps: [
      "৫টি জিনিস দেখুন: চোখের সামনে থাকা যেকোনো ৫টি বস্তুর দিকে একদৃষ্টে তাকান।",
      "৪টি জিনিস স্পর্শ করুন: আপনার পোশাক, টেবিল বা হাতের তালু স্পর্শ করে তার অনুভূতি টের পান।",
      "৩টি শব্দ শুনুন: দূরবর্তী কোনো পাখির ডাক, ফ্যানের আওয়াজ বা নিজের শ্বাস-প্রশ্বাসের শব্দ শুনুন।",
      "২টি গন্ধ অনুভব করুন: রুমের সুবাস বা যেকোনো গন্ধ গভীর মনোযোগ দিয়ে নিন।",
      "১টি গভীর শ্বাস ছাড়ুন: বুক ভরে শ্বাস নিয়ে ধীরে ধীরে ৮ সেকেন্ড ধরে মুখ দিয়ে ছাড়ুন।",
    ],
    psychologicalInsight:
      "মানুষের মন কখনো একই সাথে গভীর ইন্দ্রিয়গ্রাহ্য মনোযোগ এবং কাল্পনিক উদ্বেগ বজায় রাখতে পারে না। গ্রাউন্ডিং টেকনিক মস্তিষ্ককে 'সারভাইভাল মোড' থেকে বর্তমান বাস্তবে ফিরিয়ে আনে।",
    dailyHabit:
      "ঘুমানোর আগে ১০ মিনিট ডায়েরির পাতায় মাথার সমস্ত দুশ্চিন্তা লিখে ফেলুন (Brain Dump)। কাগজটি ভাঁজ করে রাখলে মস্তিষ্ক সংকেত পায় যে চিন্তাগুলো সাময়িকভাবে সমাপ্ত।",
    expertAdvice:
      "উদ্বেগ আপনার পরিচয়ের অংশ নয়, এটি কেবল একটি সাময়িক অনুভূতি। নিজের মনের সাথে যুদ্ধ না করে বন্ধুসুলভ দৃষ্টিতে নিজের চিন্তাকে পর্যবেক্ষণ করতে শিখুন।",
  },
  {
    id: "guide-2",
    category: "সম্পর্কের যত্ন",
    title: "সম্পর্কে মানসিক দূরত্ব ও ইগো সমাধানের কার্যকরী কৌশল",
    summary:
      "সম্পর্কে জিতে যাওয়ার চেয়ে প্রিয় মানুষটাকে ধরে রাখা অনেক বড় সাফল্য। ইগো বা না বলা অভিমান জমতে না দিয়ে কীভাবে গভীর যোগাযোগ পুনঃস্থাপন করবেন?",
    readTime: "৪ মিনিট পাঠ",
    symptoms:
      "কথাবার্তা কমে যাওয়া, প্রতিটি সাধারণ বিষয়ে তর্ক বা খোঁচা দিয়ে কথা বলা, মনের কথা শেয়ার করার ইচ্ছে হারিয়ে ফেলা।",
    whyItHappens:
      "দীর্ঘদিন ধরে ছোট ছোট অভিমান প্রকাশ না করে মনের ভেতর চেপে রাখলে মনের ভেতর অদৃশ্য দেয়াল তৈরি হয়। মানুষ যখন নিজেকে অবমূল্যায়িত মনে করে, তখন দূরত্ব বাড়ে।",
    actionSteps: [
      "'I' স্টেটমেন্ট ব্যবহার করুন: 'তুমি সব সময় এমন করো' না বলে বলুন—'তোমার এমন আচরণে আমি কষ্ট পেয়েছি'। এতে অপরজন আত্মরক্ষামূলক না হয়ে আপনার অনুভূতি বুঝবে।",
      "ডিজিটাল ডিটক্স টক: প্রতিদিন অন্তত ১৫ মিনিট সব ফোন বা ল্যাপটপ দূরে রেখে একে অপরের চোখের দিকে তাকিয়ে কথা বলুন।",
      "অতীত ভুলের অস্ত্র না বানানো: বর্তমান সমস্যা নিয়ে কথা বলার সময় ৩ মাস আগের পুরোনো ভুলকে টেনে আনবেন না।",
      "ছোট ছোট ধন্যবাদ ও প্রশংসা: সঙ্গীর ক্ষুদ্রতম ভালো কাজেরও মুখে উচ্চারণ করে প্রশংসা করুন।",
    ],
    psychologicalInsight:
      "মানুষ সেখানেই সবচেয়ে বেশি নিজেকে সঁপে দেয়, যেখানে সে বিচারহীনভাবে নিরাপদ ও গৃহীত বোধ করে। সম্মান যেখানে থাকে, প্রেম সেখানে অনন্তকাল টিকে থাকে।",
    dailyHabit:
      "দিন শেষে সঙ্গীকে একটি সুন্দর বার্তা পাঠান বা সরাসরি বলুন: 'আজকের দিনে তোমার পাশে থাকতে পেরে আমি কৃতজ্ঞ।' এটি মানসিক বন্ধন সুদৃঢ় রাখে।",
    expertAdvice:
      "যেকোনো তর্কের সময় নিজেকে প্রশ্ন করুন: 'আমি কি তর্কে জিততে চাই, নাকি সম্পর্ককে বাঁচাতে চাই?' ইগো জিতলে সম্পর্ক হেরে যায়।",
  },
  {
    id: "guide-3",
    category: "ঘুম ও মানসিক প্রশান্তি",
    title: "গভীর ঘুম ও ইনসমনিয়া থেকে মুক্তির কার্যকরী স্লিপ রুটিন",
    summary:
      "রাতে বিছানায় যাওয়ার পর দীর্ঘক্ষণ এপাশ-ওপাশ করা এবং ক্লান্ত সকালে ঘুম ভাঙা বন্ধ করতে বৈজ্ঞানিক স্লিপ হাইজিন চর্চা করুন।",
    readTime: "৩ মিনিট পাঠ",
    symptoms:
      "বিছানায় যাওয়ার ১-২ ঘণ্টা পরেও ঘুম না আসা, মধ্যরাতে বারবার ঘুম ভেঙে যাওয়া, সকালে উঠেও শরীর ক্লান্ত থাকা।",
    whyItHappens:
      "মোবাইল ও ল্যাপটপের কৃত্রিম নীল আলো (Blue Light) মস্তিষ্কের পিনিয়াল গ্ল্যান্ড থেকে স্লিপ হরমোন মেলাটোনিন নিঃসরণ আটকে দেয়। এছাড়া ঘুমানোর আগে বেশি চিন্তা মেজাজ সজাগ রাখে।",
    actionSteps: [
      "৪৫ মিনিট পূর্বে নো-স্ক্রিন রুল: ঘুমানোর অন্তত ৪৫ মিনিট পূর্বে মোবাইল চার্জে দিয়ে বিছানা থেকে দূরে রাখুন।",
      "রুমের তাপমাত্রা ও আলো: শোবার ঘরটি যথাসম্ভব অন্ধকার ও ঠান্ডা রাখুন। মৃদু হলুদ আলো মস্তিষ্কে ঘুমের সংকেত পাঠায়।",
      "৪-৭-৮ শ্বাসচর্চা: ৪ সেকেন্ড নাক দিয়ে শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন, ৮ সেকেন্ড মুখ দিয়ে ধীরে ধীরে ছাড়ুন। ৪ বার এটি করুন।",
      "বিছানাকে শুধু ঘুমের স্থান রাখুন: বিছানায় বসে ল্যাপটপে কাজ করা বা খাওয়া পরিহার করুন।",
    ],
    psychologicalInsight:
      "ভালো ঘুম মানুষের মস্তিষ্কের গ্লিম্ফ্যাটিক সিস্টেম সচল করে দিনের স্মৃতি গুছিয়ে রাখে এবং টক্সিন পরিষ্কার করে। সুনিদ্রা বিষণ্ণতা ৫০% কমিয়ে আনে।",
    dailyHabit:
      "প্রতিদিন সকালে ঘুম থেকে ওঠার পর অন্তত ১০ মিনিট ভোরের রোদে দাঁড়ান। এটি শরীরের প্রাকৃতিক সার্কাডিয়ান রিদম (দেহঘড়ি) ঠিক রাখে।",
    expertAdvice:
      "বিছানায় শোয়ার পর ২০ মিনিটের বেশি ঘুম না আসলে জোর করবেন না। উঠে হালকা আলোয় একটি পছন্দের বই ৫-১০ মিনিট পড়ুন, ঘুম চলে আসবে।",
  },
  {
    id: "guide-4",
    category: "মানসিক স্বাস্থ্য",
    title: "চাপা কষ্ট ও কান্না আটকে না রাখার মনস্তত্ত্ব: অনুভূতির সুস্থ প্রকাশ",
    summary:
      "কষ্টের কথা মনের ভেতর আটকে রাখলে শরীর বিষাক্ত হয়ে ওঠে। কান্না কোনো দুর্বলতা নয়, বরং মনের ক্ষত নিরাময়ের প্রাকৃতিক থেরাপি।",
    readTime: "৩ মিনিট পাঠ",
    symptoms:
      "বুকের ভেতর ভারী পাথর চাপা দিয়ে রাখার মতো অস্বস্তি, কোনো কারণ ছাড়াই মেজাজ খিটখিটে হওয়া, কাউকে মনের কথা বলতে সংকোচ বোধ।",
    whyItHappens:
      "আমাদের সমাজে শেখানো হয় কষ্ট চেপে হাসিমুখে থাকতে হয়। কিন্তু অনুভূতিকে অস্বীকার করলে তা নিঃশেষ হয় না, বরং অবচেতন মনে তীব্র বিষাদে রূপ নেয়।",
    actionSteps: [
      "কান্না চেপে রাখবেন না: যখন কান্না আসবে, কোনো নিরিবিলি ঘরে গিয়ে মন খুলে কাঁদতে দিন। কান্না শেষ হলে গভীর স্বস্তি অনুভব করবেন।",
      "কাগজে লিখে জ্বালিয়ে দেওয়া: যে কথা কাউকে বলা যায় না, তা বিস্তারিত লিখে ছিঁড়ে ফেলুন বা পুড়িয়ে ফেলুন। এটি ব্রেনকে রিলিজ ফিলিং দেয়।",
      "শারীরিক অনুভূতির দিকে নজর দিন: বুকের চাপ কোথায় অনুভূত হচ্ছে লক্ষ্য করে সেখানে হাত রাখুন এবং শান্ত থাকুন।",
    ],
    psychologicalInsight:
      "বিজ্ঞান প্রমাণ করেছে যে আবেগজনিত কান্নার অশ্রুতে কর্টিসল (স্ট্রেস হরমোন) এবং প্রোল্যাকটিন থাকে। কান্না শরীর থেকে সরাসরি বিষাক্ত স্ট্রেস রাসায়নিক বের করে দেয়।",
    dailyHabit:
      "প্রতিদিন সন্ধ্যায় অন্তত ৫ মিনিট একা বসুন। নিজের মনকে জিজ্ঞেস করুন: 'আজ আমি কেমন বোধ করছি?' নিজের প্রতি সহানুভূতিশীল হোন।",
    expertAdvice:
      "আপনি মানুষ, রোবট নন। আপনার মন খারাপ হওয়া, দুর্বল লাগা অত্যন্ত স্বাভাবিক। নিজের অনুভূতিকে সম্মান জানানোই সুস্থ মানসিকতার ভিত্তি।",
  },
  {
    id: "guide-5",
    category: "শারীরিক সুস্থতা",
    title: "ডিজিটাল ক্লান্তি দূর ও ডোপামিন রিবুট: সারাদিন চনমনে থাকার ফর্মুলা",
    summary:
      "সারাদিন ফোন স্ক্রলিং শেষে অদ্ভুত এক মানসিক ক্লান্তি ও শূন্যতা লাগে? জেনে নিন মস্তিষ্ককে কীভাবে পুনরুজ্জীবিত করবেন।",
    readTime: "৪ মিনিট পাঠ",
    symptoms:
      "চোখে জ্বালাপোড়া, মাথা ভারী হওয়া, কোনো কাজে ধৈর্য না থাকা এবং ফোনে নোটিফিকেশন না থাকলেও বারবার হাত দেওয়া।",
    whyItHappens:
      "শর্ট-ভিডিও ও সোশ্যাল মিডিয়া ব্রেইনকে হাইপার-ডোপামিন ডোজে অভ্যস্ত করে। এতে সাধারণ জীবনের সুন্দর মুহূর্তগুলো তখন পানসে ও বোরিং মনে হতে থাকে।",
    actionSteps: [
      "সকালের প্রথম ৬০ মিনিট ফোনমুক্ত: ঘুম থেকে উঠেই সোশ্যাল মিডিয়া চেক করবেন না। পানি পান করুন, নরম রোদে হাঁটুন।",
      "২০-২০-২০ রুল: স্ক্রিনে কাজের প্রতি ২০ মিনিট পর ২০ ফুট দূরে ২০ সেকেন্ডের জন্য তাকিয়ে থাকুন। চোখের ক্লান্তি কাটবে।",
      "প্রকৃতির সান্নিধ্য: বিকেলে অন্তত ১৫ মিনিট সবুজ গাছপালা বা খোলা আকাশের নিচে হাঁটাহাঁটি করুন।",
      "পর্যাপ্ত পানি পান: মস্তিষ্কের ৭৫% পানি। সামান্য পানিশূন্যতা মেজাজ খিটখিটে ও মনোযোগ নষ্ট করার প্রধান কারণ।",
    ],
    psychologicalInsight:
      "প্রকৃতির মাঝে সময় কাটালে প্যারা-সিম্প্যাথেটিক নার্ভাস সিস্টেম উদ্দীপিত হয়, যা হার্ট রেট স্বাভাবিক রাখে এবং গভীর ফোকাস ফিরিয়ে আনে।",
    dailyHabit:
      "খাবারের টেবিলে বা বন্ধুদের সাথে আড্ডার সময় ফোন পকেটে অথবা উল্টো করে রাখুন। উপস্থিত মুহূর্তের পূর্ণ স্বাদ নিন।",
    expertAdvice:
      "স্ক্রিনের বাইরেও একটা বিশাল ভালোবাসার জগৎ রয়েছে। ভার্চুয়াল লাইকের চেয়ে বাস্তব মানুষের হাসি ও সান্নিধ্যকে গুরুত্ব দিন।",
  },
];

export default function DailyWellnessCard() {
  const [selectedCategory, setSelectedCategory] = useState<string>("সকল গাইড");
  const [activeGuideIdx, setActiveGuideIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const categories = [
    "সকল গাইড",
    "মানসিক স্বাস্থ্য",
    "সম্পর্কের যত্ন",
    "ঘুম ও মানসিক প্রশান্তি",
    "শারীরিক সুস্থতা",
  ];

  const filteredGuides =
    selectedCategory === "সকল গাইড"
      ? WELLNESS_GUIDES
      : WELLNESS_GUIDES.filter((g) => g.category === selectedCategory);

  const current =
    filteredGuides[activeGuideIdx % filteredGuides.length] || WELLNESS_GUIDES[0];

  const handleNext = () => {
    setActiveGuideIdx((prev) => (prev + 1) % filteredGuides.length);
    setCopied(false);
  };

  const handleCopyGuide = (guide: WellnessGuide) => {
    if (typeof window !== "undefined") {
      const text = `🌿 ${guide.title}\n(${guide.category})\n\n“${guide.summary}”\n\n💡 করণীয় ৫টি ধাপ:\n${guide.actionSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n🧠 মনস্তাত্ত্বিক দিক: ${guide.psychologicalInsight}\n\nপড়ুন অনুভূতি-তে: https://www.onuvuti.site`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openDetailsModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {/* ================= MAIN WELLNESS HUB CARD ================= */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FAF4E6] via-white to-[#FDF8F2] dark:from-[#131C2E] dark:via-[#0F172A] dark:to-[#0B0F17] border border-[#C59B27]/40 dark:border-[#C59B27]/30 p-5 sm:p-7 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#80131E]/5 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#C59B27]/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-5">
          {/* Top Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#80131E] dark:bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#80131E] dark:text-rose-400">
                  অনুভূতি হেলথ, মাইন্ড ও ওয়েলনেস
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <span>দৈনিক সুস্থতা ও মনস্তত্ত্ব পরামর্শ</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#80131E]/10 dark:bg-rose-500/20 text-[#80131E] dark:text-rose-300">
                    বিশেষজ্ঞ গাইড
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={openDetailsModal}
                className="px-3.5 py-2 rounded-xl bg-[#80131E] text-white hover:bg-[#630d16] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>বিস্তারিত গাইড পড়ুন</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills inside Wellness Card */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveGuideIdx(0);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                    active
                      ? "bg-[#80131E] text-white shadow-2xs"
                      : "bg-white/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:text-[#80131E] dark:hover:text-rose-400"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Featured Active Guide Presentation */}
          <div className="rounded-2xl bg-white/90 dark:bg-[#111827]/90 border border-stone-200/90 dark:border-stone-800 p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-stone-700 text-[#80131E] dark:text-rose-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {current.category}
              </span>

              <span className="text-xs text-stone-400 dark:text-stone-500 font-semibold">
                {current.readTime}
              </span>
            </div>

            <h4
              onClick={openDetailsModal}
              className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white hover:text-[#80131E] dark:hover:text-rose-400 transition cursor-pointer leading-snug"
            >
              {current.title}
            </h4>

            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
              {current.summary}
            </p>

            {/* Quick 2 Action Highlights */}
            <div className="grid sm:grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex items-start gap-2">
                <Activity className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block">
                    তাৎক্ষণিক করণীয়:
                  </span>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px] line-clamp-1">
                    {current.actionSteps[0]}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 flex items-start gap-2">
                <Brain className="w-3.5 h-3.5 text-[#C59B27] dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block">
                    মনস্তাত্ত্বিক দিক:
                  </span>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px] line-clamp-1">
                    {current.psychologicalInsight}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls & Next Shuffle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold hover:bg-[#80131E] hover:text-white hover:border-[#80131E] transition cursor-pointer text-xs shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>পরের টিপস দেখুন</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyGuide(current)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-[#80131E] dark:hover:text-rose-400 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-700 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>টিপস কপি করুন</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={openDetailsModal}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#80131E] dark:text-rose-400 hover:underline cursor-pointer"
              >
                <span>সম্পূর্ণ গাইড</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FULL DETAILS WELLNESS MODAL ================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="px-6 py-5 bg-[#FAF4E6] dark:bg-[#1A2234] border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#80131E] text-white flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#80131E] dark:text-rose-400">
                    {current.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white">
                    সুস্থতা ও মানসিক যত্ন পূর্ণাঙ্গ গাইড
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Title & Summary */}
              <div className="space-y-2 border-b border-stone-200/80 dark:border-stone-800 pb-4">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span>পড়ার সময়: {current.readTime}</span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    বিজ্ঞানসম্মত পরামর্শ
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#142230] dark:text-white leading-snug">
                  {current.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                  {current.summary}
                </p>
              </div>

              {/* Section 1: Why it happens & Symptoms */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-[#80131E] dark:text-rose-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                  <span>কেন এটি ঘটে এবং শারীরিক/মানসিক লক্ষণসমূহ</span>
                </h4>
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-2 text-xs sm:text-sm">
                  <p className="text-stone-700 dark:text-stone-300">
                    <strong className="text-stone-900 dark:text-white">লক্ষণসমূহ: </strong>
                    {current.symptoms}
                  </p>
                  <p className="text-stone-700 dark:text-stone-300">
                    <strong className="text-stone-900 dark:text-white">কারণ: </strong>
                    {current.whyItHappens}
                  </p>
                </div>
              </div>

              {/* Section 2: Step-by-Step Action Plan */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-[#80131E] dark:text-rose-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>ধাপে ধাপে সমাধানের কার্যকরী পদক্ষেপসমূহ</span>
                </h4>
                <div className="space-y-2">
                  {current.actionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FAF4E6]/60 dark:bg-[#1E293B]/60 border border-[#C59B27]/30 dark:border-stone-700 flex items-start gap-2.5 text-xs sm:text-sm"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#80131E] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Psychological Insight & Daily Habit */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                    🧠 মনস্তাত্ত্বিক ব্যাখ্যা
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {current.psychologicalInsight}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
                    🌿 নিয়মিত জীবনচর্চা (Daily Routine)
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {current.dailyHabit}
                  </p>
                </div>
              </div>

              {/* Section 4: Doctor / Expert Advice */}
              <div className="p-4 rounded-2xl bg-[#FAF4E6] dark:bg-[#161E2E] border border-[#C59B27]/40 dark:border-[#C59B27]/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#80131E] dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-[#80131E] dark:text-rose-300">
                    বিশেষজ্ঞের শেষ কথা
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 italic leading-relaxed">
                    “{current.expertAdvice}”
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-stone-50 dark:bg-[#1A2234] border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleCopyGuide(current)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-stone-100 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">
                      গাইডটি কপি হয়েছে!
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>পূর্ণাঙ্গ গাইড কপি করুন</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#80131E] hover:bg-[#630d16] text-white text-xs font-bold transition cursor-pointer"
              >
                পড়া সম্পন্ন হয়েছে
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
