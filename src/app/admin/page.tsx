"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Trash2,
  PlusCircle,
  ArrowLeft,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { BLOG_POSTS, BlogPost } from "@/data/blogData";

interface PendingStory {
  id: string;
  title: string;
  author: string;
  category: BlogPost["category"];
  content: string;
  submittedAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "published" | "create">(
    "pending"
  );

  const [pendingStories, setPendingStories] = useState<PendingStory[]>([
    {
      id: "p-101",
      title: "বাসের জানালার পাশের সেই মেয়েটি ও একটি অসমাপ্ত গল্প",
      author: "রাফসান কবির, ঢাকা",
      category: "রোমান্টিক গল্প",
      content:
        "প্রতিদিন অফিস যাওয়ার পথে শাহবাগ মোড়ে বাসে উঠত মেয়েটা। হাতে সবসময় একটা বই থাকত। একদিন সাহস করে কথা বলব ভেবেছিলাম, কিন্তু পরদিন থেকে তাকে আর দেখিনি...",
      submittedAt: "১০ মিনিট আগে",
    },
    {
      id: "p-102",
      title: "মা হওয়ার পর নিজের স্বপ্নগুলো যখন আলমারির কোণে জমে থাকে",
      author: "নাম প্রকাশে অনিচ্ছুক",
      category: "না বলা কথা",
      content:
        "সংসার আর সন্তানের মুখের দিকে তাকিয়ে সব কষ্ট ভুলে যাই ঠিকই, কিন্তু মাঝে মাঝে মধ্যরাতে নিজের পুরোনো সার্টিফিকেটগুলো ছুঁয়ে দেখতে ইচ্ছা করে...",
      submittedAt: "১ ঘণ্টা আগে",
    },
  ]);

  const [publishedList, setPublishedList] = useState<BlogPost[]>(BLOG_POSTS);

  // Create New Story Form State
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("অনুভূতি ডেস্ক");
  const [newCategory, setNewCategory] =
    useState<BlogPost["category"]>("রোমান্টিক গল্প");
  const [newContent, setNewContent] = useState("");

  const handleApprove = (item: PendingStory) => {
    const newPost: BlogPost = {
      id: String(Date.now()),
      slug: `story-${Date.now()}`,
      title: item.title,
      excerpt: item.content.slice(0, 120) + "...",
      category: item.category,
      readTimeBn: "৩ মিনিট পাঠ",
      dateBn: "আজ",
      author: item.author,
      likesCount: 1,
      content: item.content.split("\n\n"),
    };
    setPublishedList((prev) => [newPost, ...prev]);
    setPendingStories((prev) => prev.filter((p) => p.id !== item.id));
  };

  const handleReject = (id: string) => {
    setPendingStories((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: BlogPost = {
      id: String(Date.now()),
      slug: `story-${Date.now()}`,
      title: newTitle.trim(),
      excerpt: newContent.trim().slice(0, 120) + "...",
      category: newCategory,
      readTimeBn: "৪ মিনিট পাঠ",
      dateBn: "আজ",
      author: newAuthor.trim() || "অনুভূতি ডেস্ক",
      likesCount: 1,
      content: newContent.trim().split("\n\n"),
    };

    setPublishedList((prev) => [created, ...prev]);
    setNewTitle("");
    setNewContent("");
    setActiveTab("published");
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#142230]">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Onuvuti-Publications-Logo.png"
              alt="Onuvuti Publications"
              className="h-11 w-auto object-contain mix-blend-multiply"
            />
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E6] border border-[#C59B27]/40 text-[#80131E] text-xs font-extrabold">
              অ্যাডমিন প্যানেল
            </span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-[#80131E]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল ওয়েবসাইটে যান</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "pending"
                ? "bg-[#80131E] text-white"
                : "bg-white border border-stone-200 text-stone-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>পাঠকদের পাঠানো গল্প ({pendingStories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("published")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "published"
                ? "bg-[#80131E] text-white"
                : "bg-white border border-stone-200 text-stone-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>প্রকাশিত গল্পসমূহ ({publishedList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "create"
                ? "bg-[#80131E] text-white"
                : "bg-white border border-stone-200 text-stone-700"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন গল্প যোগ করুন</span>
          </button>
        </div>

        {/* Tab 1: Pending User Stories */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingStories.length === 0 ? (
              <div className="rounded-2xl bg-white border border-stone-200 p-10 text-center text-sm text-stone-500">
                এই মুহূর্তে অপেক্ষমাণ কোনো গল্প নেই।
              </div>
            ) : (
              pendingStories.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 space-y-3 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E6] text-[#80131E] text-xs font-bold">
                      {item.category}
                    </span>
                    <span className="text-xs text-stone-400">
                      পাঠিয়েছেন: {item.author} • {item.submittedAt}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#142230]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>অনুমোদন ও প্রকাশ করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(item.id)}
                      className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>মুছে ফেলুন</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Published Stories */}
        {activeTab === "published" && (
          <div className="space-y-3">
            {publishedList.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#80131E]">
                      {post.category}
                    </span>
                    <span className="text-stone-400">• {post.author}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-[#142230]">
                    {post.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setPublishedList((prev) =>
                        prev.filter((p) => p.id !== post.id)
                      )
                    }
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Create New Story */}
        {activeTab === "create" && (
          <form
            onSubmit={handleCreateStory}
            className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 space-y-4 max-w-2xl"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#80131E]">
              <Sparkles className="w-4 h-4" />
              <span>নতুন গল্প বা না বলা কথা প্রকাশ করুন</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  লেখকের নাম / ছদ্মনাম
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as BlogPost["category"])
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm"
                >
                  <option value="রোমান্টিক গল্প">রোমান্টিক গল্প</option>
                  <option value="জীবনের গল্প">জীবনের গল্প</option>
                  <option value="না বলা কথা">না বলা কথা</option>
                  <option value="সম্পর্ক ও মনস্তত্ত্ব">সম্পর্ক ও মনস্তত্ত্ব</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                গল্পের শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="শিরোনাম লিখুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                সম্পূর্ণ গল্প *
              </label>
              <textarea
                rows={7}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="এখানে সম্পূর্ণ গল্পটি লিখুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#80131E] text-white font-bold text-sm hover:bg-[#630d16] transition cursor-pointer"
            >
              গল্পটি প্রকাশ করুন
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

