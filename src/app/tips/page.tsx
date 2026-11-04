"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Brain,
  Moon,
  Users2,
  Activity,
  Flame,
  Sparkles,
  Search,
  Check,
  Share2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Clock,
  ExternalLink,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { GO_API_BASE_URL } from "@/lib/goApi";
import { BOOK_INFO } from "@/data/bookData";

export interface WellnessGuide {
  id: string;
  category: string;
  title: string;
  summary: string;
  readTime: string;
  symptoms: string;
  whyItHappens: string;
  actionSteps: string[];
  psychologicalInsight: string;
  dailyHabit: string;
  expertAdvice: string;
  isActive?: boolean;
}

const DEFAULT_GUIDES: WellnessGuide[] = [
  {
    id: "tip-1",
    category: "মানসিক স্বাস্থ্য",
    title: "উদ্বেগ, অতিরিক্ত চিন্তা (Overthinking) ও প্যানিক দূর করার বিজ্ঞানসম্মত উপায়",
    summary:
      "যখন মন অহেতুক নানা চিন্তায় অস্থির হয়ে ওঠে এবং বুকের ভেতর অজানা চাপ অনুভূত হয়, তখন '৫-৪-৩-২-১' গ্রাউন্ডিং টেকনিক মস্তিষ্ককে তাৎক্ষণিক প্রশান্তি দেয়।",
    readTime: "৩ মিনিট পাঠ",
    symptoms:
      "মাথায় অবিরাম ভবিষ্যতের ভয়, অতীত ভুলের অনুশোচনা, বুক ধড়ফড় করা এবং কাজে মনোযোগ ধরে রাখতে না পারা।",
    whyItHappens:
      "মস্তিষ্কের ইমোশনাল সেন্টার 'অ্যামিগডালা' কাল্পনিক বিপদকে বাস্তব ভেবে অতিরিক্ত স্ট্রেস হরমোন কর্টিসল নিঃসরণ করে।",
    actionSteps: [
      "৫টি জিনিস দেখুন: চোখের সামনে থাকা যেকোনো ৫টি বস্তুর দিকে একদৃষ্টে তাকান।",
      "৪টি জিনিস স্পর্শ করুন: আপনার পোশাক বা টেবিল স্পর্শ করে অনুভূতি টের পান।",
      "৩টি শব্দ শুনুন: দূরবর্তী ফ্যানের বা পাখির আওয়াজ শুনুন।",
      "২টি গন্ধ অনুভব করুন: রুমের সুবাস বা যেকোনো গন্ধ নিন।",
      "১টি গভীর শ্বাস ছাড়ুন: বুক ভরে শ্বাস নিয়ে ধীরে ধীরে ৮ সেকেন্ডে ছাড়ুন।",
    ],
    psychologicalInsight:
      "মানুষের মন কখনো একই সাথে গভীর ইন্দ্রিয়গ্রাহ্য মনোযোগ এবং কাল্পনিক উদ্বেগ বজায় রাখতে পারে না। এটি মস্তিষ্ককে বর্তমানে ফিরিয়ে আনে।",
    dailyHabit:
      "ঘুমানোর আগে ১০ মিনিট ডায়েরির পাতায় সমস্ত দুশ্চিন্তা লিখে ফেলুন (Brain Dump)।",
    expertAdvice:
      "উদ্বেগ আপনার পরিচয় নয়, এটি সাময়িক অনুভূতি। মনের সাথে যুদ্ধ না করে বন্ধুসুলভ দৃষ্টিতে পর্যবেক্ষণ করুন।",
  },
  {
    id: "tip-2",
    category: "সম্পর্কের যত্ন",
    title: "সম্পর্কে মানসিক দূরত্ব ও ইগো সমাধানের কার্যকরী কৌশল",
    summary:
      "সম্পর্কে জিতে যাওয়ার চেয়ে প্রিয় মানুষটাকে ধরে রাখা অনেক বড় সাফল্য। ইগো বা না বলা অভিমান জমতে না দিয়ে কীভাবে গভীর যোগাযোগ পুনঃস্থাপন করবেন?",
    readTime: "৪ মিনিট পাঠ",
    symptoms:
      "কথাবার্তা কমে যাওয়া, প্রতিটি বিষয়ে তর্ক বা খোঁচা দেওয়া, মনের কথা শেয়ার করার ইচ্ছে হারিয়ে ফেলা।",
    whyItHappens:
      "দীর্ঘদিন ধরে ছোট ছোট অভিমান প্রকাশ না করে চেপে রাখলে মনের ভেতর অদৃশ্য দেয়াল তৈরি হয়।",
    actionSteps: [
      "I স্টেটমেন্ট ব্যবহার করুন: 'তুমি সবসময় এমন করো' না বলে বলুন—'তোমার এমন আচরণে আমি কষ্ট পেয়েছি'।",
      "ডিজিটাল ডিটক্স টক: প্রতিদিন অন্তত ১৫ মিনিট সব ফোন দূরে রেখে একে অপরের চোখের দিকে তাকিয়ে কথা বলুন।",
      "অতীত ভুলের অস্ত্র না বানানো: বর্তমান সমস্যা নিয়ে কথা বলার সময় পুরোনো ভুল টেনে আনবেন না।",
      "ছোট ছোট ধন্যবাদ ও প্রশংসা: সঙ্গীর ক্ষুদ্রতম ভালো কাজেরও মুখে উচ্চারণ করে প্রশংসা করুন।",
    ],
    psychologicalInsight:
      "মানুষ সেখানেই নিজেকে সঁপে দেয়, যেখানে সে বিচারহীনভাবে নিরাপদ ও গৃহীত বোধ করে। সম্মান যেখানে থাকে, প্রেম সেখানে অনন্তকাল টিকে থাকে।",
    dailyHabit:
      "দিন শেষে সঙ্গীকে একটি সুন্দর বার্তা পাঠান বা বলুন: 'আজকের দিনে তোমার পাশে থাকতে পেরে আমি কৃতজ্ঞ।'",
    expertAdvice:
      "যেকোনো তর্কের সময় ভাবুন: 'আমি কি তর্কে জিততে চাই, নাকি সম্পর্ককে বাঁচাতে চাই?' ইগো জিতলে সম্পর্ক হেরে যায়।",
  },
  {
    id: "tip-3",
    category: "ঘুম ও মানসিক প্রশান্তি",
    title: "গভীর ঘুম ও ইনসমনিয়া থেকে মুক্তির কার্যকরী স্লিপ রুটিন",
    summary:
      "রাতে বিছানায় যাওয়ার পর দীর্ঘক্ষণ এপাশ-ওপাশ করা এবং ক্লান্ত সকালে ঘুম ভাঙা বন্ধ করতে বৈজ্ঞানিক স্লিপ হাইজিন চর্চা করুন।",
    readTime: "৩ মিনিট পাঠ",
    symptoms:
      "বিছানায় যাওয়ার ১-২ ঘণ্টা পরেও ঘুম না আসা, মধ্যরাতে বারবার ঘুম ভেঙে যাওয়া, সকালে শরীর ক্লান্ত থাকা।",
    whyItHappens:
      "মোবাইল ও ল্যাপটপের কৃত্রিম নীল আলো স্লিপ হরমোন মেলাটোনিন নিঃসরণ আটকে দেয়।",
    actionSteps: [
      "৪৫ মিনিট পূর্বে নো-স্ক্রিন রুল: ঘুমানোর অন্তত ৪৫ মিনিট পূর্বে মোবাইল চার্জে দিয়ে বিছানা থেকে দূরে রাখুন।",
      "রুমের তাপমাত্রা ও আলো: শোবার ঘরটি অন্ধকার ও ঠান্ডা রাখুন। মৃদু হলুদ আলো ঘুমে সাহায্য করে।",
      "৪-৭-৮ শ্বাসচর্চা: ৪ সেকেন্ড শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন, ৮ সেকেন্ড মুখ দিয়ে ধীরে ছাড়ুন।",
      "বিছানাকে শুধু ঘুমের স্থান রাখুন: বিছানায় বসে ল্যাপটপে কাজ করা বা খাওয়া পরিহার করুন।",
    ],
    psychologicalInsight:
      "ভালো ঘুম মস্তিষ্কের গ্লিম্ফ্যাটিক সিস্টেম সচল করে স্মৃতি গুছিয়ে রাখে ও বিষণ্ণতা ৫০% কমিয়ে আনে।",
    dailyHabit:
      "প্রতিদিন সকালে ঘুম থেকে ওঠার পর অন্তত ১০ মিনিট ভোরের রোদে দাঁড়ান।",
    expertAdvice:
      "বিছানায় শোয়ার পর ২০ মিনিটের বেশি ঘুম না আসলে জোর করবেন না। উঠে হালকা আলোয় ৫ মিনিট বই পড়ুন।",
  },
  {
    id: "tip-4",
    category: "শারীরিক সুস্থতা",
    title: "ডিজিটাল ক্লান্তি দূর ও ডোপামিন রিবুট: সারাদিন চনমনে থাকার ফর্মুলা",
    summary:
      "সারাদিন ফোন স্ক্রলিং শেষে অদ্ভুত এক মানসিক ক্লান্তি ও শূন্যতা লাগে? জেনে নিন মস্তিষ্ককে কীভাবে পুনরুজ্জীবিত করবেন।",
    readTime: "৪ মিনিট পাঠ",
    symptoms:
      "চোখে জ্বালাপোড়া, মাথা ভারী হওয়া, কোনো কাজে ধৈর্য না থাকা এবং ফোনে নোটিফিকেশন না থাকলেও বারবার হাত দেওয়া।",
    whyItHappens:
      "শর্ট-ভিডিও ও সোশ্যাল মিডিয়া ব্রেইনকে হাইপার-ডোপামিন ডোজে অভ্যস্ত করে বাস্তব জীবন পানসে মনে করায়।",
    actionSteps: [
      "সকালের প্রথম ৬০ মিনিট ফোনমুক্ত: ঘুম থেকে উঠেই সোশ্যাল মিডিয়া চেক করবেন না।",
      "২০-২০-২০ রুল: প্রতি ২০ মিনিট পর ২০ ফুট দূরে ২০ সেকেন্ডের জন্য তাকিয়ে থাকুন।",
      "প্রকৃতির সান্নিধ্য: বিকেলে অন্তত ১৫ মিনিট সবুজ গাছপালা বা খোলা আকাশের নিচে হাঁটুন।",
      "পর্যাপ্ত পানি পান: মস্তিষ্কের ৭৫% পানি। সামান্য পানিশূন্যতা মেজাজ খিটখিটে করার প্রধান কারণ।",
    ],
    psychologicalInsight:
      "প্রকৃতির মাঝে সময় কাটালে প্যারাসিম্প্যাথেটিক নার্ভাস সিস্টেম উদ্দীপিত হয় যা হার্ট রেট স্বাভাবিক রাখে।",
    dailyHabit:
      "খাবারের টেবিলে বা প্রিয়জনের সাথে থাকার সময় ফোন পকেটে অথবা উল্টো করে রাখুন।",
    expertAdvice:
      "স্ক্রিনের বাইরেও একটা বিশাল ভালোবাসার জগৎ রয়েছে। ভার্চুয়াল লাইকের চেয়ে বাস্তব মানুষের হাসি দামি।",
  },
];

const CATEGORIES = [
  "সকল গাইড",
  "মানসিক স্বাস্থ্য",
  "সম্পর্কের যত্ন",
  "শারীরিক সুস্থতা",
  "ঘুম ও মানসিক প্রশান্তি",
];

export default function WellnessTipsPage() {
  const [tips, setTips] = useState<WellnessGuide[]>(DEFAULT_GUIDES);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("সকল গাইড");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("tip-1");
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch live tips from Go Backend
  useEffect(() => {
    fetch(`${GO_API_BASE_URL}/wellness`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && Array.isArray(data.tips) && data.tips.length > 0) {
          setTips(data.tips);
          if (data.tips[0]?.id) {
            setExpandedId(data.tips[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn("Tips fetch fallback:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtered tips
  const filteredTips = useMemo(() => {
    return tips.filter((tip) => {
      const matchCat =
        activeCategory === "সকল গাইড" || tip.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        tip.title.toLowerCase().includes(q) ||
        tip.summary.toLowerCase().includes(q) ||
        tip.symptoms.toLowerCase().includes(q) ||
        tip.whyItHappens.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [tips, activeCategory, searchQuery]);

  const toggleCheck = (stepKey: string) => {
    setCheckedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const handleCopy = (tip: WellnessGuide) => {
    const text = `🌿 ${tip.title}\n\n${tip.summary}\n\n🔍 লক্ষণ:\n${tip.symptoms}\n\n⚡ তাৎক্ষণিক পদক্ষেপ:\n${tip.actionSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n💡 বিশেষজ্ঞের পরামর্শ: ${tip.expertAdvice}\n\n🔗 আরও জানুন: onuvuti.site/tips`;
    navigator.clipboard.writeText(text);
    setCopiedId(tip.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "মানসিক স্বাস্থ্য":
        return <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "সম্পর্কের যত্ন":
        return <Users2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "ঘুম ও মানসিক প্রশান্তি":
        return <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "শারীরিক সুস্থতা":
        return <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0B0F17] text-[#142230] dark:text-white transition-colors selection:bg-[#7E151E] selection:text-white pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#FAF7F2]/95 dark:bg-[#0B0F17]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-[#7E151E] dark:hover:text-rose-400 px-3 py-1.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>হোমপেইজে ফিরুন</span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500">
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#7E151E] dark:text-rose-400 font-bold">
                ওয়েলনেস ও হেলথ গাইড
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/sporsher-byakoron"
              className="px-3.5 py-1.5 rounded-full bg-[#7E151E] hover:bg-[#630d16] text-white text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>বইটি কিনুন (৳{BOOK_INFO.offerPriceBn})</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-10 pb-8 sm:pt-14 sm:pb-12 border-b border-stone-200/70 dark:border-stone-800/80 bg-gradient-to-b from-[#FAF4E6]/70 via-[#FAF7F2] to-[#FAF7F2] dark:from-[#131B2B]/60 dark:via-[#0B0F17] dark:to-[#0B0F17]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>দৈনিক মন ও সম্পর্কের যত্ন • সায়েন্টিফিক গাইড</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#142230] dark:text-white tracking-tight">
            মন, ঘুম ও সম্পর্কের সুস্থতার{" "}
            <span className="text-[#7E151E] dark:text-rose-400">
              বিজ্ঞানসম্মত পাঠ
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
            অতিরিক্ত চিন্তা (Overthinking), দাম্পত্যের নীরব দূরত্ব কিংবা রাতের অনিদ্রা—প্রতিটি মানসিক ও আবেগীয় জটিলতার পেছনে রয়েছে নিউরোসায়েন্স ও মনস্তাত্ত্বিক কারণ। নিচে প্রতিটি বিষয়ের সহজ সমাধান ও স্টেপ-বাই-স্টেপ গাইড দেওয়া হলো।
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সমস্যা দিয়ে খুঁজুন (যেমন: ঘুম, স্ট্রেস, তর্ক, একা লাগা)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-[#142230] dark:text-white placeholder-stone-400 focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat
                  ? "bg-[#7E151E] text-white shadow-md shadow-[#7E151E]/20"
                  : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-[#7E151E]/50"
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Tips Feed */}
        {filteredTips.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
            <HeartPulse className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-stone-700 dark:text-stone-200">
              কোনো গাইড খুঁজে পাওয়া যায়নি
            </h3>
            <p className="text-xs text-stone-500">
              অন্য কোনো কিওয়ার্ড দিয়ে খুঁজুন অথবা &quot;সকল গাইড&quot; বাটনে ক্লিক করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("সকল গাইড");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-[#7E151E] hover:text-white transition"
            >
              সবগুলো রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTips.map((tip) => {
              const isExpanded = expandedId === tip.id;

              return (
                <article
                  key={tip.id}
                  className={`rounded-3xl bg-white dark:bg-stone-900 border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "border-[#7E151E]/40 dark:border-rose-900/60 shadow-lg ring-1 ring-[#7E151E]/10"
                      : "border-stone-200/90 dark:border-stone-800/90 hover:border-stone-300 shadow-sm"
                  }`}
                >
                  {/* Card Header (Click to toggle) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : tip.id)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-bold">
                          {getCategoryIcon(tip.category)}
                          <span>{tip.category}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{tip.readTime}</span>
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-black text-[#142230] dark:text-white hover:text-[#7E151E] dark:hover:text-rose-400 transition">
                        {tip.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
                        {tip.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(tip);
                        }}
                        title="টিপস কপি করুন"
                        className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-[#7E151E] dark:hover:text-rose-400 transition"
                      >
                        {copiedId === tip.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-[#FAF4E6] dark:bg-stone-800 text-xs font-bold text-[#7E151E] dark:text-rose-300 hover:bg-[#7E151E] hover:text-white transition flex items-center gap-1"
                      >
                        <span>{isExpanded ? "সংক্ষিপ্ত করুন" : "পূর্ণাঙ্গ গাইড"}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detailed Scientific Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 dark:border-stone-800/80 p-5 sm:p-7 bg-[#FAF7F2]/50 dark:bg-[#0E1420]/50 space-y-6">
                      {/* Grid: Symptoms & Why it happens */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                          <h4 className="text-xs font-black uppercase text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>১. সাধারণ লক্ষণ ও অনুভূতি (Symptoms)</span>
                          </h4>
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                            {tip.symptoms}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-2">
                          <h4 className="text-xs font-black uppercase text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>২. কেন এমন হয়? (নিউরোসায়েন্স ও মনস্তত্ত্ব)</span>
                          </h4>
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                            {tip.whyItHappens}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Step-by-Step Action Checklist */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#7E151E] dark:text-rose-400 flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>তাৎক্ষণিক করণীয় পদক্ষেপ (Action Steps — ট্রাই করুন)</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-2.5">
                          {tip.actionSteps.map((step, idx) => {
                            const stepKey = `${tip.id}-step-${idx}`;
                            const isDone = Boolean(checkedSteps[stepKey]);

                            return (
                              <div
                                key={stepKey}
                                onClick={() => toggleCheck(stepKey)}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                                  isDone
                                    ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                                    : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 text-stone-700 dark:text-stone-200"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                                    isDone
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                                  }`}
                                >
                                  {isDone && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <span className={`text-xs sm:text-sm font-medium ${isDone ? "line-through opacity-80" : ""}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Insight, Habit & Expert Advice */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                        <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-1.5">
                          <span className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-500" />
                            <span>মনস্তাত্ত্বিক অন্তর্দৃষ্টি</span>
                          </span>
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                            {tip.psychologicalInsight}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-1.5">
                          <span className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>দৈনিক ছোট্ট অভ্যাস</span>
                          </span>
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                            {tip.dailyHabit}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-1.5">
                          <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#7E151E] dark:text-rose-400" />
                            <span>বিশেষজ্ঞের বার্তা</span>
                          </span>
                          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                            {tip.expertAdvice}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Promotional Callout for Sporsher Byakoron eBook */}
        <section className="mt-12 rounded-3xl bg-gradient-to-br from-[#FAF4E6] to-[#F5ECE0] dark:from-[#161E2E] dark:to-[#0F1622] border border-[#C59B27]/40 dark:border-stone-700 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-[#7E151E]/10 dark:bg-rose-950/60 text-[#7E151E] dark:text-rose-300 text-xs font-extrabold uppercase tracking-wider">
              অফিশিয়াল প্রকাশনা • ই-বুক
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#142230] dark:text-white">
              ভালোবাসা, মনস্তত্ত্ব ও অন্তরঙ্গতার আরও গভীর পাঠ চান?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl">
              সম্পর্কের জটিলতা দূর করা, পারস্পরিক শ্রদ্ধা তৈরি এবং ভালোবাসাকে আজীবন জীবন্ত রাখার বৈজ্ঞানিক উপায় জানতে পড়ুন <strong>&ldquo;স্পর্শের ব্যাকরণ&rdquo;</strong>।
            </p>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-[#7E151E] hover:bg-[#630d16] text-white font-extrabold text-sm shadow-xl shadow-[#7E151E]/20 transition flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>ই-বুকটি সংগ্রহ করুন — ৳{BOOK_INFO.offerPriceBn}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

