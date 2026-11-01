"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Trash2,
  PlusCircle,
  ArrowLeft,
  Clock,
  FileText,
  Sparkles,
  Lock,
  ShieldCheck,
  ImagePlus,
  Edit3,
  LogOut,
  AlertCircle,
  BarChart3,
  Users,
  Eye,
  BookOpen,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Pin,
  MessageSquare,
} from "lucide-react";
import { BLOG_POSTS, BlogPost, StoryCategory } from "@/data/blogData";
import { sanitizeText, validateImageUpload } from "@/lib/security";
import { GO_API_BASE_URL, getAdminAuthHeaders } from "@/lib/goApi";
import ThemeToggle from "@/components/ThemeToggle";

interface PendingStory {
  id: string;
  title: string;
  author: string;
  category: StoryCategory;
  content: string;
  imageUrl?: string;
  submittedAt: string;
}

interface AdminCommentItem {
  id: string;
  storySlug: string;
  storyTitle?: string;
  author: string;
  text: string;
  timeBn: string;
}

interface DailyTrafficStat {
  date: string;
  labelBn: string;
  pageViews: number;
  uniqueVisits: number;
  storyReads: number;
  bookPageViews: number;
  bookOrders: number;
  revenueBdt: number;
}

interface TopStoryStat {
  id: string;
  slug: string;
  title: string;
  category: string;
  viewsCount: number;
  likesCount: number;
}

interface AnalyticsSummary {
  period: string;
  startDate: string;
  endDate: string;
  totalViews: number;
  uniqueVisits: number;
  storyReads: number;
  bookPageViews: number;
  totalOrders: number;
  totalRevenue: number;
  timeline: DailyTrafficStat[];
  topStories: TopStoryStat[];
}

const INITIAL_PENDING: PendingStory[] = [];

export default function AdminDashboardPage() {
  // Security Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "analytics" | "pending" | "published" | "comments" | "create"
  >("analytics");

  // Analytics State (Daily, 7 Days, Monthly, Yearly, Custom Date Range)
  const [analyticsPeriod, setAnalyticsPeriod] = useState<
    "daily" | "7d" | "monthly" | "yearly" | "custom"
  >("7d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(
    null
  );
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [pendingStories, setPendingStories] =
    useState<PendingStory[]>(INITIAL_PENDING);
  const [publishedList, setPublishedList] = useState<BlogPost[]>([]);
  const [commentsList, setCommentsList] = useState<AdminCommentItem[]>([]);

  // Admin Advice / Editorial Reply per Pending Story
  const [pendingAdminNotes, setPendingAdminNotes] = useState<
    Record<string, string>
  >({});

  // Editing Pending Story State
  const [editingPendingId, setEditingPendingId] = useState<string | null>(null);
  const [editPendingTitle, setEditPendingTitle] = useState("");
  const [editPendingContent, setEditPendingContent] = useState("");
  const [editPendingCategory, setEditPendingCategory] =
    useState<StoryCategory>("ক্রাশ ও কনফেশন");
  const [editPendingImage, setEditPendingImage] = useState<string | undefined>(
    undefined
  );

  // Create New Story Form State (Admin Writing)
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("অনুভূতি সম্পাদনা পর্ষদ");
  const [newCategory, setNewCategory] =
    useState<StoryCategory>("সম্পর্ক ও মনস্তত্ত্ব");
  const [newContent, setNewContent] = useState("");
  const [newAdminNote, setNewAdminNote] = useState("");
  const [isAdminBadge, setIsAdminBadge] = useState(true);
  const [newImageDataUrl, setNewImageDataUrl] = useState<string | undefined>(
    undefined
  );
  const [imageError, setImageError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (
      period: "daily" | "7d" | "monthly" | "yearly" | "custom",
      start = "",
      end = ""
    ) => {
      setIsLoadingAnalytics(true);
      const query = new URLSearchParams({
        period,
        ...(start ? { startDate: start } : {}),
        ...(end ? { endDate: end } : {}),
      }).toString();

      try {
        const res = await fetch(`${GO_API_BASE_URL}/admin/analytics?${query}`, {
          headers: getAdminAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.analytics) {
            setAnalyticsData(data.analytics);
            setIsLoadingAnalytics(false);
            return;
          }
        }
      } catch {
        // Fallback to Next.js API if Go server is offline
      }

      try {
        const fallbackRes = await fetch(`/api/admin/analytics?${query}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.ok && fallbackData.analytics) {
            setAnalyticsData(fallbackData.analytics);
          }
        }
      } catch {
        // Ignore error
      } finally {
        setIsLoadingAnalytics(false);
      }
    },
    []
  );

  const fetchDashboardFromGo = useCallback(async () => {
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/dashboard`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          if (Array.isArray(data.pendingStories)) {
            setPendingStories(
              data.pendingStories.map(
                (
                  st: BlogPost & { rawContent?: string; submittedAt?: string }
                ) => ({
                  id: st.id,
                  title: st.title,
                  author: st.author,
                  category: st.category,
                  content:
                    st.rawContent ||
                    (Array.isArray(st.content) ? st.content.join("\n\n") : ""),
                  imageUrl: st.imageUrl,
                  submittedAt: st.submittedAt || "এইমাত্র",
                })
              )
            );
          }
          if (Array.isArray(data.publishedStories)) {
            setPublishedList(data.publishedStories);
          }
          if (Array.isArray(data.comments)) {
            setCommentsList(data.comments);
          }
          if (data.analytics) {
            setAnalyticsData(data.analytics);
          }
          return;
        }
      }
    } catch {
      // Fallback to localStorage if Go server is unreachable
    }
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgoDate = new Date();
    weekAgoDate.setDate(weekAgoDate.getDate() - 6);
    setCustomStartDate(weekAgoDate.toISOString().slice(0, 10));
    setCustomEndDate(today);

    try {
      const savedAuth = sessionStorage.getItem("onuvuti_admin_authed");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
        fetchDashboardFromGo();
        fetchAnalytics("7d");
      }

      const savedPending = localStorage.getItem("onuvuti_pending_stories");
      if (savedPending) {
        const parsed = JSON.parse(savedPending) as PendingStory[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPendingStories([...parsed, ...INITIAL_PENDING]);
        }
      }

    } catch {
      // Ignore storage errors
    }
  }, [fetchDashboardFromGo, fetchAnalytics]);

  const handlePeriodSwitch = (
    p: "daily" | "7d" | "monthly" | "yearly" | "custom"
  ) => {
    setAnalyticsPeriod(p);
    if (p !== "custom") {
      fetchAnalytics(p);
    } else {
      fetchAnalytics("custom", customStartDate, customEndDate);
    }
  };

  const syncPublishedToStorage = (updated: BlogPost[]) => {
    setPublishedList(updated);
    try {
      localStorage.setItem(
        "onuvuti_published_stories",
        JSON.stringify(updated)
      );
    } catch {
      // Ignore storage errors
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      let res: Response;
      try {
        res = await fetch(`${GO_API_BASE_URL}/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        });
      } catch {
        res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordInput }),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || "অ্যাডমিন পাসওয়ার্ড সঠিক নয়।");
        setIsLoggingIn(false);
        return;
      }

      if (data.token) {
        sessionStorage.setItem("onuvuti_admin_token", data.token);
      }
      sessionStorage.setItem("onuvuti_admin_authed", "true");
      setIsAuthenticated(true);
      setPasswordInput("");
      await fetchDashboardFromGo();
      await fetchAnalytics("7d");
    } catch {
      setAuthError("সার্ভারের সাথে সংযোগ করা যায়নি।");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleImageFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    onValidDataUrl: (url: string) => void
  ) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateImageUpload(file);
    if (!check.valid) {
      setImageError(check.errorBn || "ছবিটি গ্রহণযোগ্য নয়।");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onValidDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startEditingPending = (item: PendingStory) => {
    setEditingPendingId(item.id);
    setEditPendingTitle(item.title);
    setEditPendingContent(item.content);
    setEditPendingCategory(item.category);
    setEditPendingImage(item.imageUrl);
  };

  const handleApprove = async (item: PendingStory) => {
    const isEditingThis = editingPendingId === item.id;
    const finalTitle = sanitizeText(
      isEditingThis ? editPendingTitle : item.title,
      180
    );
    const finalContent = sanitizeText(
      isEditingThis ? editPendingContent : item.content,
      8000
    );
    const finalCategory = isEditingThis ? editPendingCategory : item.category;
    const finalImage = isEditingThis ? editPendingImage : item.imageUrl;
    const finalAdminNote = sanitizeText(pendingAdminNotes[item.id] || "", 1200);

    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/admin/stories/${encodeURIComponent(
          item.id
        )}/approve`,
        {
          method: "PATCH",
          headers: getAdminAuthHeaders(),
          body: JSON.stringify({
            title: finalTitle,
            content: finalContent,
            category: finalCategory,
            author: item.author,
            imageUrl: finalImage || "",
            adminNote: finalAdminNote,
          }),
        }
      );

      if (res.ok) {
        await fetchDashboardFromGo();
        setEditingPendingId(null);
        return;
      }
    } catch {
      // Fallback to local state if Go server is offline
    }

    const confessionNum =
      finalCategory === "ক্রাশ ও কনফেশন"
        ? `#কনফেশন_${105 + publishedList.length}`
        : undefined;

    const newPost: BlogPost = {
      id: String(Date.now()),
      slug: `story-${Date.now()}`,
      title: finalTitle,
      excerpt: finalContent.slice(0, 125) + "...",
      category: finalCategory,
      confessionIdBn: confessionNum,
      imageUrl: finalImage || undefined,
      adminNote: finalAdminNote || undefined,
      readTimeBn: "৩ মিনিট পাঠ",
      dateBn: "আজ",
      author: item.author,
      likesCount: 1,
      reactions: { love: 1, touched: 0, relatable: 0 },
      content: finalContent.split(/\n+/).filter(Boolean),
    };

    const nextPublished = [newPost, ...publishedList];
    syncPublishedToStorage(nextPublished);
    setPendingStories((prev) => prev.filter((p) => p.id !== item.id));
    setEditingPendingId(null);
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(
        `${GO_API_BASE_URL}/admin/stories/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: getAdminAuthHeaders(),
        }
      );
    } catch {
      // Ignore if Go server offline
    }
    setPendingStories((prev) => prev.filter((p) => p.id !== id));
  };

  const handleTogglePin = async (post: BlogPost) => {
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/admin/stories/${encodeURIComponent(post.id)}/pin`,
        {
          method: "PATCH",
          headers: getAdminAuthHeaders(),
        }
      );
      if (res.ok) {
        await fetchDashboardFromGo();
        return;
      }
    } catch {
      // Fallback to local state
    }

    const updated = publishedList.map((p) =>
      p.id === post.id ? { ...p, featured: !p.featured } : p
    );
    syncPublishedToStorage(updated);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch(
        `${GO_API_BASE_URL}/admin/comments/${encodeURIComponent(commentId)}`,
        {
          method: "DELETE",
          headers: getAdminAuthHeaders(),
        }
      );
    } catch {
      // Ignore if offline
    }
    setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newTitle, 180);
    const cleanContent = sanitizeText(newContent, 10000);
    const cleanAuthor = sanitizeText(newAuthor, 80) || "অনুভূতি সম্পাদনা পর্ষদ";
    const cleanAdminNote = sanitizeText(newAdminNote, 1200);

    if (!cleanTitle || !cleanContent) return;

    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/stories`, {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          title: cleanTitle,
          content: cleanContent,
          category: newCategory,
          author: cleanAuthor,
          isAdminPost: isAdminBadge,
          imageUrl: newImageDataUrl || "",
          adminNote: cleanAdminNote,
        }),
      });

      if (res.ok) {
        await fetchDashboardFromGo();
        setNewTitle("");
        setNewContent("");
        setNewAdminNote("");
        setNewImageDataUrl(undefined);
        setActiveTab("published");
        return;
      }
    } catch {
      // Fallback to local state if Go server is offline
    }

    const confessionNum =
      newCategory === "ক্রাশ ও কনফেশন"
        ? `#কনফেশন_${105 + publishedList.length}`
        : undefined;

    const created: BlogPost = {
      id: String(Date.now()),
      slug: `story-${Date.now()}`,
      title: cleanTitle,
      excerpt: cleanContent.slice(0, 125) + "...",
      category: newCategory,
      confessionIdBn: confessionNum,
      isAdminPost: isAdminBadge,
      imageUrl: newImageDataUrl || undefined,
      adminNote: cleanAdminNote || undefined,
      readTimeBn: "৪ মিনিট পাঠ",
      dateBn: "আজ",
      author: cleanAuthor,
      likesCount: 1,
      reactions: { love: 1, touched: 0, relatable: 0 },
      content: cleanContent.split(/\n+/).filter(Boolean),
    };

    const nextPublished = [created, ...publishedList];
    syncPublishedToStorage(nextPublished);
    setNewTitle("");
    setNewContent("");
    setNewAdminNote("");
    setNewImageDataUrl(undefined);
    setActiveTab("published");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 text-xs font-extrabold border border-[#C59B27]/40 dark:border-[#C59B27]/30">
                <Lock className="w-3.5 h-3.5" />
                সুরক্ষিত অ্যাডমিন
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-[#142230] dark:text-white">
              অ্যাডমিন প্যানেলে প্রবেশ করুন
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              হ্যাকার ও ব্রুট-ফোর্স প্রতিরোধে ৫ বার ভুল পাসওয়ার্ড দিলে আইপি ৩০ মিনিটের জন্য ব্লক হয়ে যাবে।
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                অ্যাডমিন পাসওয়ার্ড
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500"
              />
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                ডেমো পাসওয়ার্ড (`.env`-এ পরিবর্তনযোগ্য):{" "}
                <code className="text-[#80131E] dark:text-rose-400 font-bold">
                  onuvuti-admin-2026
                </code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#80131E] text-white font-bold text-sm hover:bg-[#630d16] transition cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? "যাচাই করা হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Rate-Limit Active
            </span>
            <Link href="/" className="font-bold hover:text-[#80131E] dark:hover:text-rose-400">
              ← মূল ওয়েবসাইটে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Max views in current timeline for proportional bar chart height
  const chartDays = analyticsData?.timeline
    ? analyticsData.timeline.slice(-14)
    : [];
  const maxDayViews = Math.max(
    1,
    ...chartDays.map((d) => d.pageViews || 1)
  );

  return (
    <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] transition-colors duration-200">
      {/* Top Admin Header */}
      <header className="bg-white dark:bg-[#111827] border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-300 text-xs font-extrabold">
              অ্যাডমিন ও অ্যানালিটিক্স ড্যাশবোর্ড
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 hover:text-[#80131E] dark:hover:text-rose-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>মূল ওয়েবসাইট</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("onuvuti_admin_authed");
                sessionStorage.removeItem("onuvuti_admin_token");
                setIsAuthenticated(false);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Main Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "analytics"
                ? "bg-[#80131E] text-white"
                : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ট্রাফিক ও অ্যানালিটিক্স</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "pending"
                ? "bg-[#80131E] text-white"
                : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>পাঠকদের পাঠানো লেখা ({pendingStories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("published")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "published"
                ? "bg-[#80131E] text-white"
                : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>প্রকাশিত লেখাসমূহ ({publishedList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "comments"
                ? "bg-[#80131E] text-white"
                : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>কমেন্ট মডারেশন ({commentsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
              activeTab === "create"
                ? "bg-[#80131E] text-white"
                : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>অ্যাডমিন নতুন লেখা প্রকাশ করুন</span>
          </button>
        </div>

        {/* TAB 0: COMPLETE TRAFFIC & ANALYTICS (Daily, 7 Days, Monthly, Yearly, Custom) */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Period Filter Bar */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                  <span>ওয়েবসাইট ভিজিটর, ট্রাফিক ও বই বিক্রির রিপোর্ট</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  সময়কাল:{" "}
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    {analyticsData?.startDate} থেকে {analyticsData?.endDate}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "daily", label: "আজকের (Daily)" },
                  { id: "7d", label: "গত ৭ দিন (7 Days)" },
                  { id: "monthly", label: "মাসিক (Monthly)" },
                  { id: "yearly", label: "বাৎসরিক (Yearly)" },
                  { id: "custom", label: "কাস্টম তারিখ (Custom)" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() =>
                      handlePeriodSwitch(
                        btn.id as
                          | "daily"
                          | "7d"
                          | "monthly"
                          | "yearly"
                          | "custom"
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      analyticsPeriod === btn.id
                        ? "bg-[#80131E] text-white shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {analyticsPeriod === "custom" && (
              <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 p-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    শুরুর তারিখ (Start Date)
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-[#142230] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    শেষ তারিখ (End Date)
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-[#142230] dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    fetchAnalytics("custom", customStartDate, customEndDate)
                  }
                  className="px-4 py-2 rounded-xl bg-[#80131E] text-white text-xs font-bold cursor-pointer hover:bg-[#630d16]"
                >
                  রিপোর্ট দেখুন
                </button>
              </div>
            )}

            {/* 6 Core Analytics Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold">
                  <span>মোট পেজ ভিউ (Page Views)</span>
                  <Eye className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#142230] dark:text-white">
                  {isLoadingAnalytics
                    ? "..."
                    : (analyticsData?.totalViews ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  সম্পূর্ণ ওয়েবসাইটের মোট ভিজিট
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold">
                  <span>ইউনিক ভিজিটর (Unique Visitors)</span>
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#142230] dark:text-white">
                  {isLoadingAnalytics
                    ? "..."
                    : (analyticsData?.uniqueVisits ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  আলাদা পাঠক ও ব্রাউজার সংখ্যা
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold">
                  <span>গল্প ও কনফেশন পড়া হয়েছে</span>
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#142230] dark:text-white">
                  {isLoadingAnalytics
                    ? "..."
                    : (analyticsData?.storyReads ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  গল্প, চিঠি ও কনফেশন রিডস
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold">
                  <span>‘স্পর্শের ব্যাকরণ’ বই পেজ ভিজিট</span>
                  <BookOpen className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#142230] dark:text-white">
                  {isLoadingAnalytics
                    ? "..."
                    : (analyticsData?.bookPageViews ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  বইয়ের ল্যান্ডিং পেজে আগ্রহী পাঠক
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-bold">
                  <span>মোট ই-বুক বিক্রি (Orders)</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#142230] dark:text-white">
                  {isLoadingAnalytics
                    ? "..."
                    : (analyticsData?.totalOrders ?? 0).toLocaleString()}{" "}
                  কপি
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  প্রতি কপি ৳৯৯ (৫৫% ছাড়)
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/50 dark:border-[#C59B27]/40 p-4 sm:p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#80131E] dark:text-rose-400 font-bold">
                  <span>মোট বই বিক্রির আয় (Revenue)</span>
                  <Sparkles className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#80131E] dark:text-rose-400">
                  ৳
                  {isLoadingAnalytics
                    ? "..."
                    : (analyticsData?.totalRevenue ?? 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  নির্বাচিত সময়ের সর্বমোট আয়
                </p>
              </div>
            </div>

            {/* Visual Daily Traffic Bar Graph */}
            <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                  <span>দৈনিক ট্রাফিক গ্রাফ (সর্বশেষ দিনগুলোর তুলনা)</span>
                </h3>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  বার হোভার করলে বিস্তারিত দেখা যাবে
                </span>
              </div>

              <div className="h-48 pt-6 pb-2 px-2 flex items-end gap-2 sm:gap-3 border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
                {chartDays.map((day) => {
                  const heightPercent = Math.max(
                    12,
                    Math.round((day.pageViews / maxDayViews) * 100)
                  );
                  return (
                    <div
                      key={day.date}
                      className="flex-1 min-w-[38px] flex flex-col items-center gap-1.5 group"
                      title={`${day.date}: মোট ভিউ ${day.pageViews}, ইউনিক ${day.uniqueVisits}, বই বিক্রি ${day.bookOrders}টি`}
                    >
                      <span className="text-[10px] font-bold text-[#80131E] dark:text-rose-400 opacity-85 group-hover:opacity-100">
                        {day.pageViews}
                      </span>
                      <div className="w-full h-32 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[30px] rounded-t-lg bg-[#80131E]/85 dark:bg-rose-600/85 group-hover:bg-[#80131E] dark:group-hover:bg-rose-500 transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 truncate">
                        {day.labelBn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performing Stories & Detailed Daily Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Stories */}
              <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
                <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                  <span>সবচেয়ে বেশি পড়া গল্প ও কনফেশন</span>
                </h3>
                <div className="space-y-3">
                  {(analyticsData?.topStories ?? []).map((st, idx) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#80131E] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white truncate">
                            {st.title}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {st.category} • পছন্দ: {st.likesCount}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-extrabold text-[#80131E] dark:text-rose-400 shrink-0">
                        {st.viewsCount.toLocaleString()} ভিউ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date-by-Date Table */}
              <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
                <h3 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                  <span>তারিখ অনুযায়ী বিস্তারিত ট্রাফিক লগ</span>
                </h3>
                <div className="max-h-72 overflow-y-auto pr-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400">
                        <th className="py-2 font-bold">তারিখ</th>
                        <th className="py-2 font-bold">মোট ভিউ</th>
                        <th className="py-2 font-bold">ইউনিক</th>
                        <th className="py-2 font-bold">বই পেজ</th>
                        <th className="py-2 font-bold">অর্ডার</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {(analyticsData?.timeline ?? [])
                        .slice()
                        .reverse()
                        .slice(0, 30)
                        .map((row) => (
                          <tr key={row.date} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                            <td className="py-2.5 font-bold text-[#142230] dark:text-white">
                              {row.date}
                            </td>
                            <td className="py-2.5 font-extrabold text-[#80131E] dark:text-rose-400">
                              {row.pageViews}
                            </td>
                            <td className="py-2.5 text-stone-600 dark:text-stone-300">
                              {row.uniqueVisits}
                            </td>
                            <td className="py-2.5 text-stone-600 dark:text-stone-300">
                              {row.bookPageViews}
                            </td>
                            <td className="py-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                              {row.bookOrders}টি (৳{row.revenueBdt})
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Pending User Stories */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingStories.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-10 text-center text-sm text-stone-500 dark:text-stone-400">
                এই মুহূর্তে অপেক্ষমাণ কোনো গল্প বা কনফেশন নেই।
              </div>
            ) : (
              pendingStories.map((item) => {
                const isEditing = editingPendingId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-xs font-bold">
                        {item.category}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        পাঠিয়েছেন: {item.author} • {item.submittedAt}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 bg-stone-50 dark:bg-stone-800/80 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editPendingTitle}
                            onChange={(e) => setEditPendingTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm font-bold text-[#142230] dark:text-white"
                          />
                          <select
                            value={editPendingCategory}
                            onChange={(e) =>
                              setEditPendingCategory(
                                e.target.value as StoryCategory
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white"
                          >
                            <option value="ক্রাশ ও কনফেশন">ক্রাশ ও কনফেশন</option>
                            <option value="রোমান্টিক গল্প">রোমান্টিক গল্প</option>
                            <option value="জীবনের গল্প">জীবনের গল্প</option>
                            <option value="না বলা কথা">না বলা কথা</option>
                            <option value="বিচ্ছেদ ও প্রাক্তন">বিচ্ছেদ ও প্রাক্তন</option>
                            <option value="সম্পর্ক ও মনস্তত্ত্ব">
                              সম্পর্ক ও মনস্তত্ত্ব
                            </option>
                          </select>
                        </div>

                        <textarea
                          rows={4}
                          value={editPendingContent}
                          onChange={(e) => setEditPendingContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white"
                        />

                        <div className="flex flex-wrap items-center gap-3">
                          {editPendingImage ? (
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={editPendingImage}
                                alt="Attached"
                                className="h-14 w-20 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                              />
                              <button
                                type="button"
                                onClick={() => setEditPendingImage(undefined)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer"
                              >
                                ছবি সরিয়ে ফেলুন
                              </button>
                            </div>
                          ) : (
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer">
                              <ImagePlus className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
                              <span>চাইলে ছবি যুক্ত করুন (ঐচ্ছিক)</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) =>
                                  handleImageFileSelect(e, (url) =>
                                    setEditPendingImage(url)
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                          {item.content}
                        </p>
                        {item.imageUrl && (
                          <div className="pt-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-36 w-auto rounded-xl border border-stone-200 dark:border-stone-700 object-cover"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Admin Advice / Editorial Reply Input Box */}
                    <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 p-3.5 space-y-2">
                      <label className="block text-xs font-extrabold text-[#80131E] dark:text-rose-400">
                        সম্পাদকের কথা / অনুভূতি টিমের পরামর্শ (ঐচ্ছিক — গল্পের নিচে আলাদা বক্সে দেখাবে)
                      </label>
                      <textarea
                        rows={2}
                        maxLength={1200}
                        value={pendingAdminNotes[item.id] || ""}
                        onChange={(e) =>
                          setPendingAdminNotes((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="পাঠকের এই গল্প বা সমস্যার নিচে ২–৩ লাইনের সহমর্মিতা বা পরামর্শ লিখুন..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500"
                      />
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(item)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>অনুমোদন ও প্রকাশ করুন</span>
                      </button>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditingPending(item)}
                          className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>এডিট / ছবি যোগ বা পরিবর্তন</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleReject(item.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs inline-flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>মুছে ফেলুন</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Published Stories */}
        {activeTab === "published" && (
          <div className="space-y-3">
            {publishedList.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-10 text-center text-sm text-stone-500 dark:text-stone-400">
                এই মুহূর্তে কোনো প্রকাশিত গল্প নেই। নতুন লেখা প্রকাশ করতে "নতুন লেখা লিখুন" ট্যাবে ক্লিক করুন।
              </div>
            ) : (
              publishedList.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-2xl bg-white dark:bg-[#111827] border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    post.featured
                      ? "border-[#80131E]/50 dark:border-rose-500/50 ring-1 ring-[#80131E]/15"
                      : "border-stone-200 dark:border-stone-800"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {post.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-16 h-14 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {post.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#80131E] text-white text-[10px] font-extrabold">
                            <Pin className="w-2.5 h-2.5" />
                            পিন করা (Featured)
                          </span>
                        )}
                        <span className="font-bold text-[#80131E] dark:text-rose-400">
                          {post.category}
                        </span>
                        {post.confessionIdBn && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#80131E] dark:text-rose-300 text-[10px] font-bold">
                            {post.confessionIdBn}
                          </span>
                        )}
                        {post.isAdminPost && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                            সম্পাদকের কলমে
                          </span>
                        )}
                        {post.adminNote && (
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold">
                            পরামর্শ যুক্ত
                          </span>
                        )}
                        <span className="text-stone-400 dark:text-stone-500">• {post.author}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#142230] dark:text-white">
                        {post.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(post)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition ${
                        post.featured
                          ? "bg-[#80131E] text-white"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#FAF4E6] dark:hover:bg-stone-700 hover:text-[#80131E] dark:hover:text-rose-400"
                      }`}
                      title="হোমপেজের ওপরে পিন করে রাখুন"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{post.featured ? "পিন সরান" : "পিন করুন"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch(
                            `${GO_API_BASE_URL}/admin/stories/${encodeURIComponent(
                              post.id
                            )}`,
                            {
                              method: "DELETE",
                              headers: getAdminAuthHeaders(),
                            }
                          );
                        } catch {
                          // Ignore if offline
                        }
                        syncPublishedToStorage(
                          publishedList.filter((p) => p.id !== post.id)
                        );
                      }}
                      className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Comments Moderation */}
        {activeTab === "comments" && (
          <div className="space-y-3">
            {commentsList.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-10 text-center text-sm text-stone-500 dark:text-stone-400">
                এই মুহূর্তে কোনো পাঠকের মতামত বা কমেন্ট নেই।
              </div>
            ) : (
              commentsList.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-extrabold text-[#142230] dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-stone-400 dark:text-stone-500">• {comment.timeBn}</span>
                      {comment.storyTitle && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 font-bold border border-[#C59B27]/40 dark:border-[#C59B27]/30">
                          গল্প: {comment.storyTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>কমেন্ট মুছুন</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Create New Story (Admin Writing + Optional Image) */}
        {activeTab === "create" && (
          <form
            onSubmit={handleCreateStory}
            className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 space-y-4 max-w-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#80131E] dark:text-rose-400">
                <Sparkles className="w-4 h-4" />
                <span>অ্যাডমিন থেকে নতুন গল্প, কনফেশন বা আর্টিকেল লিখুন</span>
              </div>

              <label className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-3 py-1 rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAdminBadge}
                  onChange={(e) => setIsAdminBadge(e.target.checked)}
                  className="accent-[#80131E]"
                />
                <span>‘সম্পাদকের কলমে’ ব্যাজ</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  লেখকের নাম / ছদ্মনাম
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as StoryCategory)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white"
                >
                  <option value="সম্পর্ক ও মনস্তত্ত্ব">
                    সম্পর্ক ও মনস্তত্ত্ব
                  </option>
                  <option value="ক্রাশ ও কনফেশন">ক্রাশ ও কনফেশন</option>
                  <option value="রোমান্টিক গল্প">রোমান্টিক গল্প</option>
                  <option value="জীবনের গল্প">জীবনের গল্প</option>
                  <option value="না বলা কথা">না বলা কথা</option>
                  <option value="বিচ্ছেদ ও প্রাক্তন">বিচ্ছেদ ও প্রাক্তন</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                লেখার শিরোনাম *
              </label>
              <input
                type="text"
                required
                maxLength={180}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="শিরোনাম লিখুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                সম্পূর্ণ লেখা *
              </label>
              <textarea
                rows={7}
                required
                maxLength={10000}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="এখানে সম্পূর্ণ গল্প বা আর্টিকেলটি লিখুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#80131E] dark:text-rose-400 mb-1">
                সম্পাদকের কথা / অনুভূতি টিমের পরামর্শ (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                maxLength={1200}
                value={newAdminNote}
                onChange={(e) => setNewAdminNote(e.target.value)}
                placeholder="চাইলে লেখার নিচে পাঠকদের উদ্দেশ্যে ২–৩ লাইনের পরামর্শ বা নোট যুক্ত করুন..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-sm text-[#142230] dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                ছবি যুক্ত করুন (ঐচ্ছিক — আপনি ছবি দিলে তবেই দেখাবে, না দিলে দেখাবে না)
              </label>

              {!newImageDataUrl ? (
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer transition">
                  <ImagePlus className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                  <span>চাইলে ছবি আপলোড করুন (JPG/PNG/WEBP, সর্বোচ্চ 2MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleImageFileSelect(e, (url) => setNewImageDataUrl(url))
                    }
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2.5 flex items-center justify-between gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={newImageDataUrl}
                    alt="Admin Upload Preview"
                    className="h-16 w-24 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                  />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex-1">
                    কভার ছবি যুক্ত হয়েছে
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewImageDataUrl(undefined)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold cursor-pointer"
                  >
                    ছবি বাদ দিন
                  </button>
                </div>
              )}

              {imageError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  {imageError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#80131E] text-white font-bold text-sm hover:bg-[#630d16] transition cursor-pointer"
            >
              লেখাটি প্রকাশ করুন
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
