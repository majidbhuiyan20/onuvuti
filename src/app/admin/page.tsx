"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
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
  Megaphone,
  ExternalLink,
  HeartPulse,
  BarChart2,
  MessageSquareHeart,
  Gift,
  Copy,
  Check,
  Loader2,
  Search,
  Phone,
  Mail,
  RefreshCw,
  DollarSign,
  Key,
  Flame,
  Camera,
  Mic,
  Music,
  Heart,
  Menu,
  X,
  ChevronRight,
  Download,
} from "lucide-react";
import { BLOG_POSTS, BlogPost, StoryCategory } from "@/data/blogData";
import { BOOK_INFO, BOOK_COVER_IMAGE, BOOK_BACK_IMAGE } from "@/data/bookData";
import { sanitizeText, validateImageUpload } from "@/lib/security";
import { compressImageToDataUrl } from "@/lib/imageCompression";
import {
  GO_API_BASE_URL,
  getAdminAuthHeaders,
  BackendPoll,
  BackendQuote,
  BackendWish,
  BackendWishStats,
  BackendBookOrder,
  AdminUserSummary,
} from "@/lib/goApi";
import ThemeToggle from "@/components/ThemeToggle";
import MetaPixelAdminSection from "@/components/admin/MetaPixelAdminSection";

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

interface AdminAdBanner {
  slot: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  updatedAt?: string;
}

interface AdminWellnessTip {
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
  isActive: boolean;
  createdAt?: string;
}

const INITIAL_PENDING: PendingStory[] = [];

export default function AdminDashboardPage() {
  // Security Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<
    | "analytics"
    | "orders"
    | "ebook"
    | "users"
    | "meta-pixel"
    | "pending"
    | "published"
    | "comments"
    | "create"
    | "ads"
    | "wellness"
    | "polls"
    | "quotes"
    | "wishes"
  >("analytics");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Book Orders & Customers Management State (PostgreSQL Controlled)
  const [adminOrders, setAdminOrders] = useState<BackendBookOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [copiedDownloadOrder, setCopiedDownloadOrder] = useState<string | null>(null);

  // Registered Users Management State (PostgreSQL Controlled)
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Birthday Wishes Management State (PostgreSQL Controlled)
  const [adminWishes, setAdminWishes] = useState<BackendWish[]>([]);
  const [wishStats, setWishStats] = useState<BackendWishStats | null>(null);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const [wishSearch, setWishSearch] = useState("");
  const [wishActionMsg, setWishActionMsg] = useState("");
  const [copiedWishId, setCopiedWishId] = useState<string | null>(null);

  // Polls Management State (PostgreSQL Controlled)
  const [adminPolls, setAdminPolls] = useState<BackendPoll[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptionsText, setNewPollOptionsText] = useState("হ্যাঁ, এখনো বাসি\nএকসময় বাসতাম\nকখনো এমন হয়নি");
  const [isSavingPoll, setIsSavingPoll] = useState(false);
  const [pollStatusMsg, setPollStatusMsg] = useState("");

  // Quotes Management State (PostgreSQL Controlled)
  const [adminQuotes, setAdminQuotes] = useState<BackendQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("একজন অজ্ঞাত পাঠক");
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [quoteStatusMsg, setQuoteStatusMsg] = useState("");

  // Wellness Tips Management State (PostgreSQL Controlled)
  const [wellnessTips, setWellnessTips] = useState<AdminWellnessTip[]>([]);
  const [isLoadingWellness, setIsLoadingWellness] = useState(false);
  const [editingTipId, setEditingTipId] = useState<string | null>(null);
  const [wellnessSaveStatus, setWellnessSaveStatus] = useState<string>("");
  const [isSavingWellness, setIsSavingWellness] = useState(false);

  // Wellness Form Inputs
  const [tipCategory, setTipCategory] = useState("মানসিক স্বাস্থ্য");
  const [tipTitle, setTipTitle] = useState("");
  const [tipSummary, setTipSummary] = useState("");
  const [tipReadTime, setTipReadTime] = useState("৩ মিনিট পাঠ");
  const [tipSymptoms, setTipSymptoms] = useState("");
  const [tipWhyItHappens, setTipWhyItHappens] = useState("");
  const [tipActionStepsText, setTipActionStepsText] = useState("");
  const [tipPsychInsight, setTipPsychInsight] = useState("");
  const [tipDailyHabit, setTipDailyHabit] = useState("");
  const [tipExpertAdvice, setTipExpertAdvice] = useState("");
  const [tipIsActive, setTipIsActive] = useState(true);

  // Ads & Banners Management State
  const [adsList, setAdsList] = useState<AdminAdBanner[]>([
    {
      slot: "left_sidebar",
      title: "স্পর্শের ব্যাকরণ - অনুভূতি পাবলিকেশন্স",
      imageUrl: BOOK_COVER_IMAGE,
      linkUrl: "/sporsher-byakoron",
      isActive: true,
    },
    {
      slot: "right_sidebar",
      title: "স্পর্শের ব্যাকরণ - ই-বুক সংগ্রহ করুন",
      imageUrl: BOOK_BACK_IMAGE,
      linkUrl: "/sporsher-byakoron",
      isActive: true,
    },
    {
      slot: "top_notice",
      title: `অনুভূতি পাবলিকেশন্স — ‘${BOOK_INFO.titleBn}’ বেস্টসেলার ই-বুক এখন মাত্র ${BOOK_INFO.offerPriceBn} টাকায় সংগ্রহ করুন!`,
      imageUrl: "",
      linkUrl: "/sporsher-byakoron",
      isActive: true,
    },
  ]);
  const [adSaveStatus, setAdSaveStatus] = useState<Record<string, string>>({});
  const [isSavingAd, setIsSavingAd] = useState<Record<string, boolean>>({});

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
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

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

  const fetchOrdersFromGo = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/orders`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.orders)) {
          setAdminOrders(data.orders);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  const fetchUsersFromGo = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/users`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.users)) {
          setAdminUsers(data.users);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchAdsFromGo = useCallback(async () => {
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/ads`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.ads) && data.ads.length > 0) {
          setAdsList(data.ads);
        }
      }
    } catch {
      // Ignore if offline
    }
  }, []);

  const handleUpdateAd = async (slot: string) => {
    const targetAd = adsList.find((a) => a.slot === slot);
    if (!targetAd) return;

    setIsSavingAd((prev) => ({ ...prev, [slot]: true }));
    setAdSaveStatus((prev) => ({ ...prev, [slot]: "" }));

    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/admin/ads/${encodeURIComponent(slot)}`,
        {
          method: "PUT",
          headers: {
            ...getAdminAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: targetAd.title,
            imageUrl: targetAd.imageUrl,
            linkUrl: targetAd.linkUrl,
            isActive: targetAd.isActive,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data?.ok) {
        setAdSaveStatus((prev) => ({
          ...prev,
          [slot]: "✅ বিজ্ঞাপন সফলভাবে আপডেট ও সংরক্ষণ করা হয়েছে!",
        }));
        await fetchAdsFromGo();
      } else {
        setAdSaveStatus((prev) => ({
          ...prev,
          [slot]: `❌ ${data?.error || "বিজ্ঞাপন আপডেট করা যায়নি"}`,
        }));
      }
    } catch {
      setAdSaveStatus((prev) => ({
        ...prev,
        [slot]: "❌ সার্ভার সংযোগে সমস্যা হয়েছে! আবার চেষ্টা করুন।",
      }));
    } finally {
      setIsSavingAd((prev) => ({ ...prev, [slot]: false }));
      setTimeout(() => {
        setAdSaveStatus((prev) => ({ ...prev, [slot]: "" }));
      }, 5000);
    }
  };

  const handleAdFieldChange = (
    slot: string,
    field: "title" | "imageUrl" | "linkUrl" | "isActive",
    value: string | boolean
  ) => {
    setAdsList((prev) =>
      prev.map((ad) => (ad.slot === slot ? { ...ad, [field]: value } : ad))
    );
  };

  const fetchWellnessFromGo = useCallback(async () => {
    setIsLoadingWellness(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/wellness`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.tips)) {
          setWellnessTips(data.tips);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingWellness(false);
    }
  }, []);

  const handleResetWellnessForm = () => {
    setEditingTipId(null);
    setTipCategory("মানসিক স্বাস্থ্য");
    setTipTitle("");
    setTipSummary("");
    setTipReadTime("৩ মিনিট পাঠ");
    setTipSymptoms("");
    setTipWhyItHappens("");
    setTipActionStepsText("");
    setTipPsychInsight("");
    setTipDailyHabit("");
    setTipExpertAdvice("");
    setTipIsActive(true);
  };

  const handleEditWellnessClick = (tip: AdminWellnessTip) => {
    setEditingTipId(tip.id);
    setTipCategory(tip.category);
    setTipTitle(tip.title);
    setTipSummary(tip.summary);
    setTipReadTime(tip.readTime || "৩ মিনিট পাঠ");
    setTipSymptoms(tip.symptoms || "");
    setTipWhyItHappens(tip.whyItHappens || "");
    setTipActionStepsText(
      Array.isArray(tip.actionSteps) ? tip.actionSteps.join("\n") : ""
    );
    setTipPsychInsight(tip.psychologicalInsight || "");
    setTipDailyHabit(tip.dailyHabit || "");
    setTipExpertAdvice(tip.expertAdvice || "");
    setTipIsActive(tip.isActive);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const handleSaveWellness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipTitle.trim() || !tipSummary.trim()) {
      setWellnessSaveStatus("❌ শিরোনাম এবং সারসংক্ষেপ অবশ্যই পূরণ করতে হবে।");
      return;
    }

    setIsSavingWellness(true);
    setWellnessSaveStatus("");

    const actionSteps = tipActionStepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      category: tipCategory,
      title: tipTitle.trim(),
      summary: tipSummary.trim(),
      readTime: tipReadTime.trim(),
      symptoms: tipSymptoms.trim(),
      whyItHappens: tipWhyItHappens.trim(),
      actionSteps,
      psychologicalInsight: tipPsychInsight.trim(),
      dailyHabit: tipDailyHabit.trim(),
      expertAdvice: tipExpertAdvice.trim(),
      isActive: tipIsActive,
    };

    try {
      let res: Response;
      if (editingTipId) {
        res = await fetch(
          `${GO_API_BASE_URL}/admin/wellness/${encodeURIComponent(editingTipId)}`,
          {
            method: "PUT",
            headers: {
              ...getAdminAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`${GO_API_BASE_URL}/admin/wellness`, {
          method: "POST",
          headers: {
            ...getAdminAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data?.ok) {
        setWellnessSaveStatus(
          editingTipId
            ? "✅ সুস্থতা গাইড সফলভাবে আপডেট করা হয়েছে!"
            : "✅ নতুন সুস্থতা গাইড সফলভাবে তৈরি করা হয়েছে!"
        );
        handleResetWellnessForm();
        await fetchWellnessFromGo();
      } else {
        setWellnessSaveStatus(`❌ ${data?.error || "সংরক্ষণ করা যায়নি"}`);
      }
    } catch {
      setWellnessSaveStatus("❌ সার্ভার সংযোগ ত্রুটি! আবার চেষ্টা করুন।");
    } finally {
      setIsSavingWellness(false);
      setTimeout(() => setWellnessSaveStatus(""), 4000);
    }
  };

  const handleToggleWellnessActive = async (tip: AdminWellnessTip) => {
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/admin/wellness/${encodeURIComponent(tip.id)}`,
        {
          method: "PUT",
          headers: {
            ...getAdminAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !tip.isActive }),
        }
      );
      if (res.ok) {
        await fetchWellnessFromGo();
      }
    } catch {
      // offline
    }
  };

  const handleDeleteWellness = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই সুস্থতা গাইডটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/admin/wellness/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: getAdminAuthHeaders(),
        }
      );
      if (res.ok) {
        await fetchWellnessFromGo();
      }
    } catch {
      // offline
    }
  };

  const fetchPollsFromGo = useCallback(async () => {
    setIsLoadingPolls(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/polls`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.polls)) {
          setAdminPolls(data.polls);
        }
      }
    } catch {
      // offline
    } finally {
      setIsLoadingPolls(false);
    }
  }, []);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;
    const opts = newPollOptionsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (opts.length < 2) {
      setPollStatusMsg("কমপক্ষে ২টি উত্তরের অপশন দিন");
      return;
    }

    setIsSavingPoll(true);
    setPollStatusMsg("");
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/polls`, {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ question: newPollQuestion, options: opts, isActive: true }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setPollStatusMsg("জরিপ প্রশ্ন সফলভাবে তৈরি হয়েছে!");
        setNewPollQuestion("");
        await fetchPollsFromGo();
      } else {
        setPollStatusMsg(data.error || "সংরক্ষণ করা যায়নি");
      }
    } catch {
      setPollStatusMsg("সার্ভার ত্রুটি হয়েছে");
    } finally {
      setIsSavingPoll(false);
    }
  };

  const handleTogglePollActive = async (poll: BackendPoll) => {
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/polls/${encodeURIComponent(poll.id)}`, {
        method: "PUT",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ isActive: !poll.isActive }),
      });
      if (res.ok) {
        await fetchPollsFromGo();
      }
    } catch {
      // offline
    }
  };

  const handleDeletePoll = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই জরিপ প্রশ্নটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/polls/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        await fetchPollsFromGo();
      }
    } catch {
      // offline
    }
  };

  const fetchQuotesFromGo = useCallback(async () => {
    setIsLoadingQuotes(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/quotes`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.quotes)) {
          setAdminQuotes(data.quotes);
        }
      }
    } catch {
      // offline
    } finally {
      setIsLoadingQuotes(false);
    }
  }, []);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;
    setIsSavingQuote(true);
    setQuoteStatusMsg("");
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/quotes`, {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ quote: newQuoteText, author: newQuoteAuthor, isActive: true }),
      });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setQuoteStatusMsg("না বলা কথা সফলভাবে তৈরি হয়েছে!");
        setNewQuoteText("");
        await fetchQuotesFromGo();
      } else {
        setQuoteStatusMsg(data.error || "সংরক্ষণ করা যায়নি");
      }
    } catch {
      setQuoteStatusMsg("সার্ভার ত্রুটি হয়েছে");
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleToggleQuoteActive = async (quote: BackendQuote) => {
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/quotes/${encodeURIComponent(quote.id)}`, {
        method: "PUT",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ isActive: !quote.isActive }),
      });
      if (res.ok) {
        await fetchQuotesFromGo();
      }
    } catch {
      // offline
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই না বলা কথাটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/quotes/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        await fetchQuotesFromGo();
      }
    } catch {
      // offline
    }
  };

  const fetchWishesFromGo = async () => {
    try {
      setIsLoadingWishes(true);
      const res = await fetch(`${GO_API_BASE_URL}/admin/wishes`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && Array.isArray(data.wishes)) {
          setAdminWishes(data.wishes);
          setWishStats(data.stats ?? null);
        }
      }
    } catch {
      // offline
    } finally {
      setIsLoadingWishes(false);
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই জন্মদিনের চিঠিটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/wishes/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        setWishActionMsg("চিঠিটি সফলভাবে মুছে ফেলা হয়েছে");
        setTimeout(() => setWishActionMsg(""), 3000);
        await fetchWishesFromGo();
      }
    } catch {
      // offline
    }
  };

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
        // Persist admin flags to prevent developer session tracking across tabs
        localStorage.setItem("onuvuti_is_admin", "true");
        document.cookie = "onuvuti_is_admin=true; path=/; max-age=31536000; SameSite=Lax";
        fetchDashboardFromGo();
        fetchAnalytics("7d");
        fetchAdsFromGo();
        fetchWellnessFromGo();
        fetchPollsFromGo();
        fetchQuotesFromGo();
        fetchWishesFromGo();
        fetchOrdersFromGo();
        fetchUsersFromGo();
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
  }, [
    fetchDashboardFromGo,
    fetchAnalytics,
    fetchAdsFromGo,
    fetchWellnessFromGo,
    fetchPollsFromGo,
    fetchQuotesFromGo,
    fetchOrdersFromGo,
    fetchUsersFromGo,
  ]);

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
      // Mark as admin across the browser to mute Meta Pixel & analytics
      localStorage.setItem("onuvuti_is_admin", "true");
      document.cookie = "onuvuti_is_admin=true; path=/; max-age=31536000; SameSite=Lax";
      setIsAuthenticated(true);
      setPasswordInput("");
      await fetchDashboardFromGo();
      await fetchAnalytics("7d");
      await fetchAdsFromGo();
      await fetchWellnessFromGo();
      await fetchPollsFromGo();
      await fetchQuotesFromGo();
      await fetchOrdersFromGo();
      await fetchUsersFromGo();
    } catch {
      setAuthError("সার্ভারের সাথে সংযোগ করা যায়নি।");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleImageFileSelect = async (
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

    try {
      setIsCompressingImage(true);
      const compressed = await compressImageToDataUrl(file, 1280, 0.82);
      onValidDataUrl(compressed);
    } catch (err: unknown) {
      console.error("Image compression error:", err);
      setImageError("ছবিটি প্রসেস করা সম্ভব হয়নি। অনুগ্রহ করে অন্য ছবি নির্বাচন করুন।");
    } finally {
      setIsCompressingImage(false);
      e.target.value = "";
    }
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
      isEditingThis ? editPendingContent : item.content
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
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || data?.message || "অনুমোদন করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("সার্ভারের সাথে সংযোগ করা যায়নি।");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই পেন্ডিং লেখাটি বাতিল করতে চান?")) return;
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/admin/stories/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: getAdminAuthHeaders(),
        }
      );
      if (res.ok) {
        await fetchDashboardFromGo();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || data?.message || "বাতিল করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভারের সাথে সংযোগ করা যায়নি।");
    }
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
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || data?.message || "পিন স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।");
      }
    } catch {
      alert("সার্ভারের সাথে সংযোগ করা যায়নি।");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("আপনি কি এই মন্তব্যটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/admin/comments/${encodeURIComponent(commentId)}`,
        {
          method: "DELETE",
          headers: getAdminAuthHeaders(),
        }
      );
      if (res.ok) {
        setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "মন্তব্যটি মুছতে সমস্যা হয়েছে।");
      }
    } catch {
      alert("সার্ভারের সাথে সংযোগ করা যায়নি।");
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingStory) return;

    const cleanTitle = sanitizeText(newTitle, 180);
    const cleanContent = sanitizeText(newContent);
    const cleanAuthor = sanitizeText(newAuthor, 80) || "অনুভূতি সম্পাদনা পর্ষদ";
    const cleanAdminNote = sanitizeText(newAdminNote, 1200);

    if (!cleanTitle || !cleanContent) {
      alert("অনুগ্রহ করে শিরোনাম ও মূল লেখা লিখুন।");
      return;
    }

    setIsSubmittingStory(true);
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

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const errMsg =
          data?.error ||
          data?.message ||
          `পোস্টটি সংরক্ষণ করা সম্ভব হয়নি (স্ট্যাটাস: ${res.status})।`;
        alert(errMsg);
        return;
      }

      // Success: reload single source of truth from PostgreSQL via Go backend
      await fetchDashboardFromGo();
      setNewTitle("");
      setNewContent("");
      setNewAdminNote("");
      setNewImageDataUrl(undefined);
      setActiveTab("published");
      alert("লেখাটি সফলভাবে পোস্ট করা হয়েছে এবং ডাটাবেজে সংরক্ষিত হয়েছে।");
    } catch (err) {
      console.error("Story creation error:", err);
      alert("সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingStory(false);
    }
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
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="bg-white px-2 py-0.5 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/Onuvuti-Publications-Logo.png"
                  alt="Onuvuti Publications"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-300 text-xs font-extrabold">
                অ্যাডমিন স্টুডিও
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>সিস্টেম লাইভ</span>
            </div>

            <ThemeToggle />

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 dark:text-stone-400 hover:text-[#80131E] dark:hover:text-rose-400 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">মূল সাইট</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("onuvuti_admin_authed");
                sessionStorage.removeItem("onuvuti_admin_token");
                localStorage.removeItem("onuvuti_is_admin");
                document.cookie = "onuvuti_is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                setIsAuthenticated(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Left Sidebar + Right Content */}
      <div className="flex min-h-[calc(100vh-4rem)] relative">
        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR (Sticky on desktop, Slide-over on mobile) */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-[#111827] border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between z-30 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
            isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 space-y-6">
            {/* GROUP 1: OVERVIEW & SALES */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                ওভারভিউ ও সেলস
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("analytics");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "analytics"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>ট্রাফিক ও অ্যানালিটিক্স</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("orders");
                  fetchOrdersFromGo();
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "orders"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>বই ক্রেতা ও অর্ডার</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "orders"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {adminOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("ebook");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "ebook"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>স্পর্শের ব্যাকরণ (PDF পড়ুন)</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "ebook"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300"
                }`}>
                  লাইভ ই-বুক
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("users");
                  fetchUsersFromGo();
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "users"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>নিবন্ধিত ব্যবহারকারী</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "users"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {adminUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("meta-pixel");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "meta-pixel"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>মেটা পিক্সেল ও ট্র্যাকিং</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "meta-pixel"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                }`}>
                  Live
                </span>
              </button>
            </div>

            {/* GROUP 2: CONTENT & COMMUNITY */}
            <div className="space-y-1 pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                কনটেন্ট ও মডারেশন
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("pending");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "pending"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>পাঠকদের পাঠানো লেখা</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  pendingStories.length > 0
                    ? "bg-rose-500 text-white animate-pulse"
                    : activeTab === "pending"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {pendingStories.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("published");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "published"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>প্রকাশিত লেখাসমূহ</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "published"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {publishedList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("comments");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "comments"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>কমেন্ট মডারেশন</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "comments"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {commentsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("create");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "create"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>নতুন লেখা প্রকাশ</span>
              </button>
            </div>

            {/* GROUP 3: ENGAGEMENT & CONTROLS */}
            <div className="space-y-1 pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                ইন্টারেক্টিভ ও কন্ট্রোল
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("wishes");
                  fetchWishesFromGo();
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "wishes"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 shrink-0" />
                  <span>জন্মদিনের চিঠি</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "wishes"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {adminWishes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("polls");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "polls"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span>আজকের প্রশ্ন</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "polls"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {adminPolls.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("quotes");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "quotes"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquareHeart className="w-4 h-4 shrink-0" />
                  <span>না বলা কথা</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "quotes"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {adminQuotes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("wellness");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "wellness"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HeartPulse className="w-4 h-4 shrink-0" />
                  <span>সুস্থতা গাইড কন্ট্রোল</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "wellness"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                }`}>
                  {wellnessTips.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("ads");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition cursor-pointer text-left ${
                  activeTab === "ads"
                    ? "bg-[#80131E] text-white shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#161E2E]"
                }`}
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                <span>বিজ্ঞাপন ও ব্যানার কন্ট্রোল</span>
              </button>
            </div>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-400 space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span>Onuvuti Engine</span>
              <span className="font-mono text-[11px] text-stone-500">v2.4 Pro</span>
            </div>
            <p className="text-[10px] text-stone-400">PostgreSQL Cloud Database</p>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Quick Mobile Horizontal Tab Navigation */}
          <div className="flex lg:hidden overflow-x-auto pb-2 gap-2 scrollbar-none">
            {[
              { id: "analytics", label: "ট্রাফিক", icon: BarChart3 },
              { id: "orders", label: `অর্ডার (${adminOrders.length})`, icon: ShoppingBag, onClick: fetchOrdersFromGo },
              { id: "ebook", label: "PDF পড়ুন", icon: BookOpen },
              { id: "users", label: `ইউজার (${adminUsers.length})`, icon: Users, onClick: fetchUsersFromGo },
              { id: "meta-pixel", label: "মেটা পিক্সেল", icon: Activity },
              { id: "pending", label: `পাঠক (${pendingStories.length})`, icon: Clock },
              { id: "published", label: `প্রকাশিত (${publishedList.length})`, icon: FileText },
              { id: "comments", label: `কমেন্ট (${commentsList.length})`, icon: MessageSquare },
              { id: "create", label: "নতুন লেখা", icon: PlusCircle },
              { id: "wishes", label: `চিঠি (${adminWishes.length})`, icon: Gift, onClick: fetchWishesFromGo },
              { id: "polls", label: `প্রশ্ন (${adminPolls.length})`, icon: BarChart2 },
              { id: "quotes", label: `উক্তি (${adminQuotes.length})`, icon: MessageSquareHeart },
              { id: "wellness", label: `সুস্থতা (${wellnessTips.length})`, icon: HeartPulse },
              { id: "ads", label: "বিজ্ঞাপন", icon: Megaphone },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.onClick) tab.onClick();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition ${
                    isActive
                      ? "bg-[#80131E] text-white shadow-xs"
                      : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
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
                  প্রতি কপি ৳{BOOK_INFO.offerPriceBn} ({BOOK_INFO.discountPercentBn})
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

        {/* TAB: BOOK ORDERS CRM (PostgreSQL Controlled) */}
        {activeTab === "orders" && (() => {
          const paidOrders = adminOrders.filter((o) => o.status === "PAID");
          const pendingOrdersList = adminOrders.filter((o) => o.status === "PENDING");
          const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.amount || 0), 0);
          const filteredOrders = adminOrders.filter((o) => {
            if (orderFilter !== "ALL" && o.status !== orderFilter) return false;
            if (!orderSearch.trim()) return true;
            const q = orderSearch.toLowerCase();
            return (
              (o.cusName && o.cusName.toLowerCase().includes(q)) ||
              (o.cusPhone && o.cusPhone.toLowerCase().includes(q)) ||
              (o.cusEmail && o.cusEmail.toLowerCase().includes(q)) ||
              (o.orderId && o.orderId.toLowerCase().includes(q)) ||
              (o.transactionId && o.transactionId.toLowerCase().includes(q))
            );
          });

          return (
            <div className="space-y-6">
              {/* Header & Stats Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                    <span>বই ক্রেতা ও অর্ডার ম্যানেজমেন্ট (CRM)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                      মোট: {adminOrders.length}টি
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    ‘স্পর্শের ব্যাকরণ’ বইটির সমস্ত অনলাইন ক্রেতাদের ডাটাবেজ, পেমেন্ট ট্রানজেকশন ও ই-বুক ডাউনলোড ট্র্যাকিং।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ebook")}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#80131E]/10 dark:bg-rose-950/60 hover:bg-[#80131E]/20 text-[#80131E] dark:text-rose-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>পিডিএফটি পড়ুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={fetchOrdersFromGo}
                    disabled={isLoadingOrders}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 cursor-pointer transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin" : ""}`} />
                    <span>রিফ্রেশ</span>
                  </button>
                  <Link
                    href="/sporsher-byakoron"
                    target="_blank"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#80131E] hover:bg-[#680f18] text-white transition flex items-center gap-1.5 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>বইয়ের পেজ দেখুন</span>
                  </Link>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">মোট অর্ডার</span>
                    <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-[#80131E] dark:text-rose-400">
                      <ShoppingBag className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#142230] dark:text-white">{adminOrders.length}</div>
                  <p className="text-[11px] text-stone-400 mt-1">সর্বমোট প্রাপ্ত বুকিং</p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">সফল পেইড অর্ডার</span>
                    <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{paidOrders.length}</div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {adminOrders.length > 0
                      ? `${Math.round((paidOrders.length / adminOrders.length) * 100)}% কনভার্সন রেট`
                      : "০% কনভার্সন"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">মোট সংগৃহীত রেভিনিউ</span>
                    <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#80131E] dark:text-rose-400">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#142230] dark:text-white">৳{totalRevenue.toLocaleString("bn-BD")}</div>
                  <p className="text-[11px] text-stone-400 mt-1">শুধুমাত্র ভেরিফাইড সেলস</p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">অপেক্ষমাণ / পেন্ডিং</span>
                    <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendingOrdersList.length}</div>
                  <p className="text-[11px] text-stone-400 mt-1">পেমেন্ট প্রক্রিয়াদিন</p>
                </div>
              </div>

              {/* Search & Status Filters */}
              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="নাম, ফোন নম্বর, ইমেইল, ট্রানজেকশন আইডি বা অর্ডার আইডি..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#80131E]"
                  />
                  {orderSearch && (
                    <button
                      type="button"
                      onClick={() => setOrderSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setOrderFilter("ALL")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      orderFilter === "ALL"
                        ? "bg-[#80131E] text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    সব ({adminOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderFilter("PAID")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      orderFilter === "PAID"
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    পরিশোধিত ({paidOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderFilter("PENDING")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      orderFilter === "PENDING"
                        ? "bg-amber-600 text-white"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    অপেক্ষমাণ ({pendingOrdersList.length})
                  </button>
                </div>
              </div>

              {/* Orders List */}
              {isLoadingOrders ? (
                <div className="py-16 text-center text-xs text-stone-500 dark:text-stone-400">
                  ডাটাবেজ থেকে অর্ডার লোড হচ্ছে...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-16 text-center text-stone-500 dark:text-stone-400 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-8">
                  <ShoppingBag className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    কোনো অর্ডার পাওয়া যায়নি
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    সার্চ ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => {
                    const isPaid = ord.status === "PAID";
                    const isCopied = copiedDownloadOrder === ord.orderId;
                    const downloadUrl = typeof window !== "undefined"
                      ? `${window.location.origin}/api/download?token=${ord.downloadToken || ""}`
                      : `/api/download?token=${ord.downloadToken || ""}`;

                    return (
                      <div
                        key={ord.orderId}
                        className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs hover:border-[#80131E]/40 transition space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                              #{ord.orderId}
                            </span>
                            {ord.invoiceId && (
                              <span className="text-[11px] font-mono text-stone-400">
                                Inv: {ord.invoiceId}
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isPaid
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                  : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              }`}
                            >
                              {isPaid ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>পরিশোধিত (PAID)</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>পেন্ডিং (PENDING)</span>
                                </>
                              )}
                            </span>
                          </div>

                          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                            {ord.createdAt
                              ? new Date(ord.createdAt).toLocaleString("bn-BD", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "তারিখ অনুপস্থিত"}
                          </span>
                        </div>

                        {/* Order Body Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                          {/* Customer Info */}
                          <div className="space-y-1">
                            <div className="font-extrabold text-[#142230] dark:text-white text-sm">
                              {ord.cusName || "অজ্ঞাত গ্রাহক"}
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                              <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                              <a href={`tel:${ord.cusPhone}`} className="hover:underline font-mono">
                                {ord.cusPhone || "ফোন নম্বর নেই"}
                              </a>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                              <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                              <a href={`mailto:${ord.cusEmail}`} className="hover:underline truncate">
                                {ord.cusEmail || "ইমেইল নেই"}
                              </a>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="space-y-1">
                            <div className="text-stone-500 dark:text-stone-400 font-medium">
                              পেমেন্ট বিবরণ:
                            </div>
                            <div className="text-sm font-black text-[#80131E] dark:text-rose-400">
                              ৳{ord.amount} {ord.currency || "BDT"}
                            </div>
                            <div className="text-[11px] text-stone-600 dark:text-stone-300 font-mono">
                              মেথড: {ord.paymentMethod || "bKash"}
                            </div>
                            {ord.transactionId && (
                              <div className="text-[11px] text-stone-600 dark:text-stone-300 font-mono truncate">
                                TrxID: {ord.transactionId}
                              </div>
                            )}
                          </div>

                          {/* Download Link & Token Controls */}
                          <div className="space-y-2 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
                            <div>
                              <div className="text-stone-500 dark:text-stone-400 font-medium">
                                ডাউনলোড পরিসংখ্যান:
                              </div>
                              <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                {ord.downloadCount} / ১০ বার ডাউনলোড সম্পন্ন
                              </div>
                            </div>

                            {ord.downloadToken ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(downloadUrl);
                                    setCopiedDownloadOrder(ord.orderId);
                                    setTimeout(() => setCopiedDownloadOrder(null), 2000);
                                  }}
                                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    isCopied
                                      ? "bg-emerald-600 text-white"
                                      : "bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 hover:bg-[#F3E7CA]"
                                  }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>কপি হয়েছে!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>ডাউনলোড লিংক কপি</span>
                                    </>
                                  )}
                                </button>
                                <a
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 transition"
                                  title="ডাউনলোড পেজ খুলুন"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-[11px] text-stone-400 italic">
                                পেমেন্ট সম্পন্ন হলে ডাউনলোড লিংক তৈরি হবে
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB: EBOOK READER & FILE INSPECTOR */}
        {activeTab === "ebook" && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                  <span>স্পর্শের ব্যাকরণ (অনলাইন পিডিএফ রিডার)</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                    সক্রিয় ফাইল
                  </span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  সার্ভারে সংরক্ষিত সর্বশেষ সংস্করণের সম্পূর্ণ ই-বুক PDF আলাদা উইন্ডোতে বা এখানে সরাসরি পড়ুন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/api/admin/ebook?token=session_authed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#80131E] hover:bg-[#680f18] text-white transition flex items-center gap-2 shadow-md active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>আলাদা ট্যাবে সম্পূর্ণ বইটি পড়ুন</span>
                </a>
                <a
                  href="/api/admin/ebook?download=1&token=session_authed"
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF ডাউনলোড</span>
                </a>
              </div>
            </div>

            {/* Standalone Action Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 dark:from-stone-900 dark:to-[#1a1215] border border-amber-200 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-base font-extrabold text-[#80131E] dark:text-rose-400">
                  ব্রাউজারে আলাদা ট্যাবে নিরবচ্ছিন্নভাবে পড়তে চান?
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  নিচের বাটনে চাপ দিলে কোনো বাধা ছাড়াই আলাদা ব্রাউজার ট্যাবে পুরো পিডিএফ লোড হবে।
                </p>
              </div>
              <a
                href="/api/admin/ebook?token=session_authed"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[#80131E] hover:bg-[#680f18] text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>এখানে চাপুন — আলাদা উইন্ডোতে পড়ুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* File Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">বইয়ের নাম</span>
                <span className="text-xs font-bold text-[#142230] dark:text-white truncate block">
                  স্পর্শের ব্যাকরণ
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">ফাইল সাইজ</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  ~৭.৩ মেগাবাইট (PDF)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">সার্ভার লোকেশন</span>
                <span className="text-xs font-mono text-stone-600 dark:text-stone-300 truncate block">
                  storage/sporsher_byakoron.pdf
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">ক্রেতা ডেলিভারি</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                  স্বয়ংক্রিয় ডাউনলোড সচল
                </span>
              </div>
            </div>

            {/* Embedded Native PDF Viewer Frame */}
            <div className="rounded-2xl border-2 border-stone-200/90 dark:border-stone-800 overflow-hidden shadow-lg bg-stone-100 dark:bg-stone-900 relative min-h-[500px]">
              <iframe
                src="/api/admin/ebook?token=session_authed#toolbar=1&navpanes=1"
                className="w-full h-[78vh] sm:h-[82vh] border-0 block"
                title="স্পর্শের ব্যাকরণ সম্পূর্ণ ই-বুক রিডার"
              />
            </div>
          </div>
        )}

        {/* TAB: REGISTERED USERS MANAGEMENT (PostgreSQL Controlled) */}
        {activeTab === "users" && (() => {
          const googleUsers = adminUsers.filter((u) => u.provider === "google");
          const manualUsers = adminUsers.filter((u) => u.provider !== "google");
          const filteredUsers = adminUsers.filter((u) => {
            if (!userSearch.trim()) return true;
            const q = userSearch.toLowerCase();
            return (
              (u.name && u.name.toLowerCase().includes(q)) ||
              (u.email && u.email.toLowerCase().includes(q)) ||
              (u.provider && u.provider.toLowerCase().includes(q))
            );
          });

          return (
            <div className="space-y-6">
              {/* Header & Stats Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                    <span>নিবন্ধিত ব্যবহারকারীদের প্রোফাইল ও অ্যাকাউন্ট</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                      মোট: {adminUsers.length} জন
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    অনুভূতি প্ল্যাটফর্মের সকল নিবন্ধিত ইউজার এবং তাদের সাইন-ইন মাধ্যম (Google / Email)।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchUsersFromGo}
                    disabled={isLoadingUsers}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 cursor-pointer transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                    <span>রিফ্রেশ</span>
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">সর্বমোট সদস্য</span>
                    <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#80131E] dark:text-rose-400">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#142230] dark:text-white">{adminUsers.length}</div>
                  <p className="text-[11px] text-stone-400 mt-1">সক্রিয় ইউজার অ্যাকাউন্ট</p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">গুগল সাইন-ইন</span>
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{googleUsers.length}</div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {adminUsers.length > 0
                      ? `${Math.round((googleUsers.length / adminUsers.length) * 100)}% ইউজার`
                      : "০%"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">ম্যানুয়াল ইমেইল</span>
                    <span className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      <Lock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#142230] dark:text-white">{manualUsers.length}</div>
                  <p className="text-[11px] text-stone-400 mt-1">ইমেইল ও পাসওয়ার্ড</p>
                </div>
              </div>

              {/* Search Box */}
              <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ব্যবহারকারীর নাম বা ইমেইল দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#80131E]"
                  />
                  {userSearch && (
                    <button
                      type="button"
                      onClick={() => setUserSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>
              </div>

              {/* Users List */}
              {isLoadingUsers ? (
                <div className="py-16 text-center text-xs text-stone-500 dark:text-stone-400">
                  ডাটাবেজ থেকে ব্যবহারকারীদের তালিকা লোড হচ্ছে...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-stone-500 dark:text-stone-400 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-8">
                  <Users className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                    কোনো নিবন্ধিত ব্যবহারকারী পাওয়া যায়নি
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    সার্চ ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredUsers.map((usr) => {
                    const isGoogle = usr.provider === "google";
                    const initialLetter = usr.name ? usr.name.charAt(0).toUpperCase() : "U";

                    return (
                      <div
                        key={usr.id}
                        className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs hover:border-[#80131E]/40 transition space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          {usr.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={usr.avatarUrl}
                              alt={usr.name}
                              className="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#80131E] to-[#FAF4E6] text-white font-black flex items-center justify-center text-base shadow-xs shrink-0">
                              {initialLetter}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-[#142230] dark:text-white truncate">
                              {usr.name || "নামহীন ইউজার"}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                              {usr.email}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                              isGoogle
                                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                            }`}
                          >
                            {isGoogle ? (
                              <>
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>Google সাইন-ইন</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-stone-500" />
                                <span>ইমেইল অ্যাকাউন্ট</span>
                              </>
                            )}
                          </span>

                          <span className="text-stone-400">
                            {usr.createdAt
                              ? new Date(usr.createdAt).toLocaleDateString("bn-BD", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB: META PIXEL & CONVERSIONS API MANAGEMENT & ANALYTICS */}
        {activeTab === "meta-pixel" && <MetaPixelAdminSection />}

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
                        if (!confirm("আপনি কি নিশ্চিত যে এই লেখাটি মুছে ফেলতে চান?"))
                          return;
                        try {
                          const res = await fetch(
                            `${GO_API_BASE_URL}/admin/stories/${encodeURIComponent(
                              post.id
                            )}`,
                            {
                              method: "DELETE",
                              headers: getAdminAuthHeaders(),
                            }
                          );
                          if (res.ok) {
                            await fetchDashboardFromGo();
                            return;
                          } else {
                            const data = await res.json().catch(() => null);
                            alert(data?.error || "লেখাটি মুছতে ব্যর্থ হয়েছে।");
                          }
                        } catch {
                          alert("সার্ভারের সাথে সংযোগ করা যায়নি।");
                        }
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
                rows={8}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="এখানে কোনো অক্ষরের সীমাবদ্ধতা ছাড়া সম্পূর্ণ গল্প বা আর্টিকেলটি লিখুন..."
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
                  <span>চাইলে ছবি আপলোড করুন (JPG/PNG/WEBP, সর্বোচ্চ 15MB — স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হবে)</span>
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
              disabled={isSubmittingStory || isCompressingImage}
              className="px-6 py-3 rounded-xl bg-[#80131E] text-white font-bold text-sm hover:bg-[#630d16] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmittingStory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>পোস্ট হচ্ছে...</span>
                </>
              ) : isCompressingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ছবি অপ্টিমাইজ হচ্ছে...</span>
                </>
              ) : (
                <span>লেখাটি প্রকাশ করুন</span>
              )}
            </button>
          </form>
        )}

        {/* TAB 5: ADS & BANNER MANAGEMENT (Controlled from PostgreSQL & Go API) */}
        {activeTab === "ads" && (
          <div className="space-y-6">
            {/* Intro & Overview Banner */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-400 text-xs font-bold">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>সাইডবার ব্যানার ও স্পনসর কন্ট্রোল</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#142230] dark:text-white">
                  ওয়েবসাইটের বাম ও ডান পাশের বিজ্ঞাপন ও প্রমোশন ম্যানেজমেন্ট
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl">
                  ডেস্কটপ ও ল্যাপটপে হোমপেজ ও গল্পের পাতার বাম এবং ডান পাশের খালি জায়গায় এই ব্যানার দুটি স্বয়ংক্রিয়ভাবে ভেসে থাকে। আপনি যেকোনো সময় ব্যানার অন/অফ করতে পারবেন, নতুন ব্যানার ছবি ও ক্লিক করার লিংক যুক্ত করতে পারবেন।
                </p>
              </div>

              <button
                type="button"
                onClick={fetchAdsFromGo}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>রিফ্রেশ ডেটা</span>
              </button>
            </div>

            {/* Ads Grid (Top Notice Strip, Left Banner & Right Banner) */}
            <div className="grid lg:grid-cols-2 gap-6">
              {[
                {
                  slot: "top_notice",
                  titleBn: "শীর্ষ নোটিশ / জরুরি ঘোষণা ব্যানার (Top Notice Strip)",
                  subtitleBn: "ওয়েবসাইটের একদম উপরে সকল পেজে জরুরি বিজ্ঞপ্তি হিসেবে প্রদর্শিত হবে",
                  isNotice: true,
                },
                {
                  slot: "left_sidebar",
                  titleBn: "বাম পাশের ব্যানার (Left Sidebar)",
                  subtitleBn: "ডেস্কটপ স্ক্রিনের বাম মার্জিনে ভেসে থাকবে",
                  isNotice: false,
                },
                {
                  slot: "right_sidebar",
                  titleBn: "ডান পাশের ব্যানার (Right Sidebar)",
                  subtitleBn: "ডেস্কটপ স্ক্রিনের ডান মার্জিনে ভেসে থাকবে",
                  isNotice: false,
                },
              ].map((meta) => {
                const ad =
                  adsList.find((a) => a.slot === meta.slot) || {
                    slot: meta.slot,
                    title: "",
                    imageUrl: "",
                    linkUrl: "",
                    isActive: false,
                  };
                const statusMsg = adSaveStatus[meta.slot];
                const isSaving = Boolean(isSavingAd[meta.slot]);

                return (
                  <div
                    key={meta.slot}
                    className={`rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-5 shadow-xs flex flex-col justify-between ${
                      meta.isNotice ? "lg:col-span-2 border-[#C59B27]/40 dark:border-[#C59B27]/30" : ""
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Slot Header & Active Status Switch */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                        <div>
                          <h3 className="text-base font-extrabold text-[#142230] dark:text-white">
                            {meta.titleBn}
                          </h3>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            {meta.subtitleBn}
                          </p>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={ad.isActive}
                            onChange={(e) =>
                              handleAdFieldChange(
                                meta.slot,
                                "isActive",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-[#80131E] rounded focus:ring-rose-500 cursor-pointer"
                          />
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              ad.isActive
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                            }`}
                          >
                            {ad.isActive ? "সক্রিয় (Active)" : "নিষ্ক্রিয় (Off)"}
                          </span>
                        </label>
                      </div>

                      {/* Title Input */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          {meta.isNotice
                            ? "নোটিশের মূল বক্তব্য / বার্তা"
                            : "বিজ্ঞাপনের শিরোনাম / অল্টার টেক্সট"}
                        </label>
                        <input
                          type="text"
                          maxLength={180}
                          value={ad.title}
                          onChange={(e) =>
                            handleAdFieldChange(
                              meta.slot,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder={
                            meta.isNotice
                              ? `যেমন: স্পর্শের ব্যাকরণ বেস্টসেলার ই-বুক এখন মাত্র ${BOOK_INFO.offerPriceBn} টাকায় সংগ্রহ করুন!`
                              : "যেমন: স্পর্শের ব্যাকরণ - অনুভূতি পাবলিকেশন্স"
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#80131E]"
                        />
                      </div>

                      {/* Image URL Input */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          ব্যানারের ছবির লিংক (Image URL){" "}
                          {meta.isNotice && (
                            <span className="font-normal text-stone-400">
                              (ঐচ্ছিক)
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={ad.imageUrl}
                          onChange={(e) =>
                            handleAdFieldChange(
                              meta.slot,
                              "imageUrl",
                              e.target.value
                            )
                          }
                          placeholder="যেমন: /images/book-cover.png বা https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#80131E]"
                        />
                      </div>

                      {/* Link URL Input */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                          ক্লিক করার লিংক (Destination URL)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={ad.linkUrl}
                            onChange={(e) =>
                              handleAdFieldChange(
                                meta.slot,
                                "linkUrl",
                                e.target.value
                              )
                            }
                            placeholder="যেমন: /sporsher-byakoron বা https://..."
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#80131E]"
                          />
                          {ad.linkUrl && (
                            <a
                              href={ad.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition"
                              title="লিংক ওপেন করে দেখুন"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Live Preview Box */}
                      <div>
                        <span className="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                          লাইভ প্রিভিউ (পাঠক যেমন দেখবে)
                        </span>
                        <div className="p-3 bg-[#FDF8F2] dark:bg-[#0B0F17] rounded-2xl border border-stone-200 dark:border-stone-800 flex justify-center">
                          {meta.isNotice ? (
                            <div className="w-full bg-[#80131E] text-white p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-amber-200 shrink-0">
                                  <Megaphone className="w-3.5 h-3.5" />
                                </span>
                                <span className="truncate font-medium text-stone-100">
                                  {ad.title || "জরুরি নোটিশের শিরোনাম এখানে লিখুন..."}
                                </span>
                              </div>
                              <span className="shrink-0 px-3 py-1 rounded-full bg-[#FAF4E6] text-[#80131E] font-bold text-[11px]">
                                দেখুন
                              </span>
                            </div>
                          ) : (
                            <div className="w-44 rounded-xl overflow-hidden bg-white dark:bg-[#111827] border border-[#C59B27]/40 dark:border-stone-700 shadow-sm text-center">
                              <div className="bg-[#FAF4E6] dark:bg-[#1A2234] px-2 py-1 border-b border-stone-200/80 dark:border-stone-800 text-[9px] font-bold text-[#80131E] dark:text-rose-400">
                                বিজ্ঞাপন
                              </div>
                              <div className="p-2.5 space-y-2">
                                {ad.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={ad.imageUrl}
                                    alt={ad.title || "Ad Preview"}
                                    className="w-full h-32 object-contain rounded-lg bg-stone-50 dark:bg-stone-800/40"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center text-xs text-stone-400">
                                    ছবির লিংক দিন
                                  </div>
                                )}
                                <p className="text-xs font-bold text-[#142230] dark:text-white line-clamp-2">
                                  {ad.title || "বিজ্ঞাপনের শিরোনাম"}
                                </p>
                                <span className="inline-block w-full py-1.5 rounded-lg bg-[#80131E] text-white text-[11px] font-bold">
                                  বিস্তারিত দেখুন
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions & Status */}
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                      {statusMsg && (
                        <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          {statusMsg}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => handleUpdateAd(meta.slot)}
                        disabled={isSaving}
                        className="w-full py-2.5 rounded-xl bg-[#80131E] hover:bg-[#630d16] disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer transition shadow-xs flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>সংরক্ষণ করা হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>এই ব্যানারের পরিবর্তন সেভ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: WELLNESS & HEALTH GUIDES MANAGEMENT (PostgreSQL Go API Single Source) */}
        {activeTab === "wellness" && (
          <div className="space-y-6">
            {/* Header / Intro Card */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-400 text-xs font-bold">
                  <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                  <span>দৈনিক সুস্থতা ও মনস্তত্ত্ব গাইড সেন্টার</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#142230] dark:text-white">
                  ওয়েবসাইটে প্রদর্শিত স্বাস্থ্য ও মানসিক প্রশান্তি গাইডসমূহ পরিচালনা
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl">
                  এখানে আপনি নতুন স্বাস্থ্য ও মানসিক সুস্থতার গাইড তৈরি করতে পারবেন, পূর্বের গাইড এডিট করতে পারবেন, অথবা সাময়িকভাবে নিষ্ক্রিয় করে রাখতে পারবেন। এগুলো সরাসরি হোমপেজের বিশেষ মডিউল এবং রিডিং মডালে লাইভ শো করবে।
                </p>
              </div>

              <button
                type="button"
                onClick={fetchWellnessFromGo}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>রিফ্রেশ ডেটা</span>
              </button>
            </div>

            {/* CREATE / EDIT FORM */}
            <form
              onSubmit={handleSaveWellness}
              className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-6 space-y-5 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <h3 className="text-base font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                  <span>
                    {editingTipId
                      ? "সুস্থতা গাইড সম্পাদনা করুন"
                      : "নতুন সুস্থতা গাইড যুক্ত করুন"}
                  </span>
                </h3>

                {editingTipId && (
                  <button
                    type="button"
                    onClick={handleResetWellnessForm}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition"
                  >
                    সম্পাদনা বাতিল করুন
                  </button>
                )}
              </div>

              {/* Form Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={tipCategory}
                    onChange={(e) => setTipCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                  >
                    <option value="মানসিক স্বাস্থ্য">মানসিক স্বাস্থ্য</option>
                    <option value="সম্পর্কের যত্ন">সম্পর্কের যত্ন</option>
                    <option value="ঘুম ও মানসিক প্রশান্তি">
                      ঘুম ও মানসিক প্রশান্তি
                    </option>
                    <option value="শারীরিক সুস্থতা">শারীরিক সুস্থতা</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    পড়ার সময় (Read Time)
                  </label>
                  <input
                    type="text"
                    value={tipReadTime}
                    onChange={(e) => setTipReadTime(e.target.value)}
                    placeholder="যেমন: ৩ মিনিট পাঠ"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  গাইডের মূল শিরোনাম
                </label>
                <input
                  type="text"
                  value={tipTitle}
                  onChange={(e) => setTipTitle(e.target.value)}
                  placeholder="যেমন: উদ্বেগ, অতিরিক্ত চিন্তা (Overthinking) ও প্যানিক দূর করার বিজ্ঞানসম্মত উপায়"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  সংক্ষিপ্ত সারসংক্ষেপ (Summary / Punchline)
                </label>
                <textarea
                  rows={2}
                  value={tipSummary}
                  onChange={(e) => setTipSummary(e.target.value)}
                  placeholder="হোমপেজে কার্ডে প্রদর্শিত হবে এমন ২-৩ লাইনের সংক্ষিপ্ত সারসংক্ষেপ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    লক্ষণসমূহ (Symptoms)
                  </label>
                  <textarea
                    rows={2}
                    value={tipSymptoms}
                    onChange={(e) => setTipSymptoms(e.target.value)}
                    placeholder="কী কী শারীরিক বা মানসিক লক্ষণ অনুভূত হয়..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    কেন এটি ঘটে (Why it happens)
                  </label>
                  <textarea
                    rows={2}
                    value={tipWhyItHappens}
                    onChange={(e) => setTipWhyItHappens(e.target.value)}
                    placeholder="মস্তিষ্ক, হরমোন বা অভ্যাসের বৈজ্ঞানিক কারণ..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ধাপে ধাপে সমাধানের পদক্ষেপ (Action Steps — প্রতি লাইনে ১টি করে লিখুন)
                </label>
                <textarea
                  rows={4}
                  value={tipActionStepsText}
                  onChange={(e) => setTipActionStepsText(e.target.value)}
                  placeholder={"৫টি জিনিস দেখুন...\n৪টি জিনিস স্পর্শ করুন...\n৩টি শব্দ শুনুন..."}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white font-mono"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    মনস্তাত্ত্বিক ব্যাখ্যা
                  </label>
                  <textarea
                    rows={2}
                    value={tipPsychInsight}
                    onChange={(e) => setTipPsychInsight(e.target.value)}
                    placeholder="মনস্তাত্ত্বিক গভীর তথ্য..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    নিয়মিত জীবনচর্চা (Daily Routine)
                  </label>
                  <textarea
                    rows={2}
                    value={tipDailyHabit}
                    onChange={(e) => setTipDailyHabit(e.target.value)}
                    placeholder="প্রতিদিন পালনের সহজ অভ্যাস..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    বিশেষজ্ঞ চিকিৎসকের পরামর্শ
                  </label>
                  <textarea
                    rows={2}
                    value={tipExpertAdvice}
                    onChange={(e) => setTipExpertAdvice(e.target.value)}
                    placeholder="ডাক্তার বা সাইকোলজিস্টের মতামত..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tipIsActive}
                    onChange={(e) => setTipIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#80131E] rounded focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    ওয়েবসাইটে সক্রিয় রাখুন (Active on site)
                  </span>
                </label>

                {wellnessSaveStatus && (
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {wellnessSaveStatus}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingWellness}
                className="w-full py-3 rounded-xl bg-[#80131E] hover:bg-[#630d16] disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer transition shadow-xs flex items-center justify-center gap-2"
              >
                {isSavingWellness ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {editingTipId
                        ? "সম্পাদিত গাইড সেভ করুন"
                        : "নতুন গাইড ডাটাবেজে যুক্ত করুন"}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* LIST OF GUIDES FROM POSTGRESQL */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-[#142230] dark:text-white">
                ডাটাবেজে সংরক্ষিত স্বাস্থ্য ও মানসিক গাইডসমূহ ({wellnessTips.length})
              </h3>

              {wellnessTips.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                  কোনো গাইড পাওয়া যায়নি। উপরের ফর্ম পূরণ করে নতুন গাইড তৈরি করুন।
                </div>
              ) : (
                <div className="space-y-3">
                  {wellnessTips.map((tip) => (
                    <div
                      key={tip.id}
                      className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs hover:border-[#80131E]/40 transition"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300">
                            {tip.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tip.isActive
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                            }`}
                          >
                            {tip.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                          <span className="text-xs text-stone-400">
                            {tip.readTime}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                          {tip.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleWellnessActive(tip)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 cursor-pointer transition"
                        >
                          {tip.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditWellnessClick(tip)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#80131E] text-white hover:bg-[#630d16] cursor-pointer transition"
                        >
                          সম্পাদনা
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteWellness(tip.id)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: DAILY POLLS / QUESTIONS */}
        {activeTab === "polls" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                  <span>আজকের প্রশ্ন ও পাঠক জরিপ কন্ট্রোল (Polls)</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  এখানে সক্রিয় প্রশ্নটি হোমপেজের 'আজকের প্রশ্ন' কার্ডে তাৎক্ষণিক প্রদর্শিত হবে। কোনো প্রশ্ন সক্রিয় না থাকলে হোমপেজে স্বয়ংক্রিয়ভাবে খালি (Empty) স্টেট প্রদর্শিত হবে।
                </p>
              </div>

              {/* Form to Create New Poll */}
              <form onSubmit={handleCreatePoll} className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    আজকের প্রশ্ন / জরিপ বিষয়
                  </label>
                  <input
                    type="text"
                    required
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    placeholder="যেমন: তুমি কি কখনো কাউকে না জানিয়েই ভালোবেসেছ?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    উত্তরের অপশনসমূহ (প্রতি লাইনে ১টি করে লিখুন)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newPollOptionsText}
                    onChange={(e) => setNewPollOptionsText(e.target.value)}
                    placeholder={"হ্যাঁ, এখনো বাসি\nএকসময় বাসতাম\nকখনো এমন হয়নি"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white font-mono"
                  />
                </div>

                {pollStatusMsg && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {pollStatusMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingPoll}
                  className="px-5 py-2.5 rounded-xl bg-[#80131E] hover:bg-[#630d16] disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer transition shadow-xs"
                >
                  {isSavingPoll ? "সংরক্ষণ করা হচ্ছে..." : "নতুন প্রশ্ন প্রকাশ করুন"}
                </button>
              </form>
            </div>

            {/* List of Polls in PostgreSQL */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-[#142230] dark:text-white">
                ডাটাবেজে সংরক্ষিত প্রশ্নসমূহ ({adminPolls.length})
              </h3>

              {adminPolls.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                  কোনো জরিপ প্রশ্ন পাওয়া যায়নি। হোমপেজে খালি স্টেট প্রদর্শিত হচ্ছে।
                </div>
              ) : (
                <div className="space-y-3">
                  {adminPolls.map((poll) => {
                    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                    return (
                      <div
                        key={poll.id}
                        className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                poll.isActive
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                  : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                              }`}
                            >
                              {poll.isActive ? "হোমপেজে সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                            </span>
                            <span className="text-xs text-stone-400 font-medium">
                              মোট ভোট: {totalVotes}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-extrabold text-[#142230] dark:text-white">
                            {poll.question}
                          </h4>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {poll.options.map((opt) => (
                              <span
                                key={opt.id}
                                className="px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 font-medium"
                              >
                                {opt.label} ({opt.votes})
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePollActive(poll)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 cursor-pointer transition"
                          >
                            {poll.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePoll(poll.id)}
                            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: DAILY UN SPOKEN WORDS / QUOTES */}
        {activeTab === "quotes" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white flex items-center gap-2">
                  <MessageSquareHeart className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                  <span>আজকের না বলা কথা কন্ট্রোল (Daily Quotes)</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  এখানে সক্রিয় না বলা কথাটি হোমপেজের 'আজকের না বলা কথা' কার্ডে সরাসরি প্রদর্শিত হবে। কোনো উদ্ধৃতি সক্রিয় না থাকলে হোমপেজে স্বয়ংক্রিয়ভাবে খালি (Empty) স্টেট প্রদর্শিত হবে।
                </p>
              </div>

              {/* Form to Create New Quote */}
              <form onSubmit={handleCreateQuote} className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    না বলা কথার মূল উক্তি বা অনুভূতি
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newQuoteText}
                    onChange={(e) => setNewQuoteText(e.target.value)}
                    placeholder="যেমন: তোমাকে ভুলে যাওয়ার চেষ্টা করতে করতে, তোমাকেই আরও বেশি মনে পড়ে..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    লেখকের নাম / পরিচয়
                  </label>
                  <input
                    type="text"
                    value={newQuoteAuthor}
                    onChange={(e) => setNewQuoteAuthor(e.target.value)}
                    placeholder="যেমন: একজন অজ্ঞাত পাঠক"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white font-medium"
                  />
                </div>

                {quoteStatusMsg && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {quoteStatusMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingQuote}
                  className="px-5 py-2.5 rounded-xl bg-[#80131E] hover:bg-[#630d16] disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer transition shadow-xs"
                >
                  {isSavingQuote ? "সংরক্ষণ করা হচ্ছে..." : "নতুন না বলা কথা প্রকাশ করুন"}
                </button>
              </form>
            </div>

            {/* List of Quotes in PostgreSQL */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-[#142230] dark:text-white">
                ডাটাবেজে সংরক্ষিত না বলা কথাগুলো ({adminQuotes.length})
              </h3>

              {adminQuotes.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                  কোনো না বলা কথা পাওয়া যায়নি। হোমপেজে খালি স্টেট প্রদর্শিত হচ্ছে।
                </div>
              ) : (
                <div className="space-y-3">
                  {adminQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              q.isActive
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                            }`}
                          >
                            {q.isActive ? "হোমপেজে সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-rose-500 font-bold">
                            <Heart className="w-3.5 h-3.5 fill-rose-500" />
                            <span>{q.reactCount} জন পাঠক</span>
                          </span>
                        </div>

                        <p className="text-sm sm:text-base font-bold text-[#142230] dark:text-stone-100 font-serif">
                          “{q.quote}”
                        </p>
                        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium block">
                          — {q.author}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleQuoteActive(q)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 cursor-pointer transition"
                        >
                          {q.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(q.id)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: BIRTHDAY WISHES MANAGEMENT (PostgreSQL 100% Single Source of Truth) */}
        {activeTab === "wishes" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="text-xl font-black text-[#142230] dark:text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                  <span>জন্মদিনের চিঠি ও খাম ব্যবস্থাপনা</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                    মোট: {adminWishes.length}টি
                  </span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  পাঠকদের তৈরি করা সমস্ত চিঠি ও খাম ডাটাবেজ (PostgreSQL) থেকে সরাসরি প্রদর্শিত হচ্ছে।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchWishesFromGo}
                  disabled={isLoadingWishes}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 cursor-pointer transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWishes ? "animate-spin" : ""}`} />
                  <span>রিফ্রেশ</span>
                </button>
                <Link
                  href="/birthday-wish"
                  target="_blank"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#80131E] hover:bg-[#680f18] text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>নতুন চিঠি তৈরি করুন</span>
                </Link>
              </div>
            </div>

            {wishActionMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                {wishActionMsg}
              </div>
            )}

            {wishStats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "মোট চিঠি", value: wishStats.total, icon: <Gift className="w-5 h-5 mx-auto text-[#80131E] dark:text-rose-400" /> },
                  { label: "মোট ভিউ", value: wishStats.totalViews, icon: <Eye className="w-5 h-5 mx-auto text-blue-500" /> },
                  { label: "রিঅ্যাকশন", value: wishStats.totalReplies, icon: <Heart className="w-5 h-5 mx-auto text-rose-500" /> },
                  { label: "টাইমার সেট", value: wishStats.scheduled, icon: <Clock className="w-5 h-5 mx-auto text-amber-500" /> },
                  { label: "সিক্রেট কোড", value: wishStats.protected, icon: <Key className="w-5 h-5 mx-auto text-indigo-500" /> },
                  { label: "গোপন চিঠি", value: wishStats.selfDestruct, icon: <Flame className="w-5 h-5 mx-auto text-rose-600" /> },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-3.5 text-center shadow-xs"
                  >
                    <div className="mb-1">{stat.icon}</div>
                    <div className="text-xl font-black text-[#142230] dark:text-white">{stat.value}</div>
                    <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Search Box */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={wishSearch}
                onChange={(e) => setWishSearch(e.target.value)}
                placeholder="প্রাপক, প্রেরক, বা চিঠির আইডি দিয়ে খুঁজুন..."
                className="w-full max-w-md px-4 py-2 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#80131E]"
              />
              {wishSearch && (
                <button
                  type="button"
                  onClick={() => setWishSearch("")}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            {/* Wishes Grid */}
            {isLoadingWishes ? (
              <div className="py-16 text-center text-xs text-stone-500 dark:text-stone-400">
                ডাটাবেজ থেকে চিঠিসমূহ লোড হচ্ছে...
              </div>
            ) : adminWishes.length === 0 ? (
              <div className="py-16 text-center text-stone-500 dark:text-stone-400 rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-8">
                <Gift className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                  এখনো কোনো জন্মদিনের চিঠি তৈরি হয়নি
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  পাঠকরা /birthday-wish পেজ থেকে চিঠি তৈরি করলে এখানে প্রদর্শিত হবে।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminWishes
                  .filter((w) => {
                    if (!wishSearch.trim()) return true;
                    const q = wishSearch.toLowerCase();
                    return (
                      w.recipientName.toLowerCase().includes(q) ||
                      w.senderName.toLowerCase().includes(q) ||
                      w.relationship.toLowerCase().includes(q) ||
                      w.id.toLowerCase().includes(q)
                    );
                  })
                  .map((w) => (
                    <div
                      key={w.id}
                      className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold text-stone-400 dark:text-stone-500">
                            #{w.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            {w.relationship || "বিশেষ কেউ"}
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-black text-[#142230] dark:text-white">
                            To: {w.recipientName}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                            From: {w.senderName}
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-700/60 font-serif">
                          “{w.message}”
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                          {w.unlockAt && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(w.unlockAt).toLocaleString("bn-BD", { dateStyle: "medium", timeStyle: "short" })}</span>
                            </span>
                          )}
                          {w.hasPasscode && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                              <Key className="w-3 h-3" />
                              <span>কোড</span>
                            </span>
                          )}
                          {w.selfDestruct && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                              <Flame className="w-3 h-3" />
                              <span>{w.destroyed ? "মুছে গেছে" : "গোপন"}</span>
                            </span>
                          )}
                          {w.hasPhoto && (
                            <span className="inline-flex items-center p-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300" title="ছবি যুক্ত আছে">
                              <Camera className="w-3 h-3" />
                            </span>
                          )}
                          {w.hasVoice && (
                            <span className="inline-flex items-center p-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300" title="ভয়েস রেকর্ড যুক্ত আছে">
                              <Mic className="w-3 h-3" />
                            </span>
                          )}
                          {w.music && w.music !== "none" && (
                            <span className="inline-flex items-center p-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300" title="ব্যাকগ্রাউন্ড সুর যুক্ত আছে">
                              <Music className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{w.viewsCount || 0} বার খোলা হয়েছে</span>
                            {(w.replyCount ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5 ml-1 text-rose-500">
                                • <Heart className="w-3 h-3 fill-rose-500" /> {w.replyCount}
                              </span>
                            )}
                          </span>
                          <span>
                            {w.createdAt
                              ? new Date(w.createdAt).toLocaleDateString("bn-BD")
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {w.selfDestruct && !w.destroyed ? (
                            <span
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 inline-flex items-center gap-1"
                              title="খুললে চিঠিটি চিরতরে মুছে যাবে"
                            >
                              <Flame className="w-3 h-3" />
                              <span>গোপন চিঠি</span>
                            </span>
                          ) : (
                            <Link
                              href={`/wish/${w.id}`}
                              target="_blank"
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF4E6] dark:bg-[#1E293B] hover:bg-[#F2E8D2] text-[#80131E] dark:text-rose-300 transition flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>চিঠি দেখুন</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const fullUrl = `${window.location.origin}/wish/${w.id}`;
                              navigator.clipboard.writeText(fullUrl);
                              setCopiedWishId(w.id);
                              setTimeout(() => setCopiedWishId(null), 2000);
                            }}
                            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition"
                            title="লিংক কপি করুন"
                          >
                            {copiedWishId === w.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteWish(w.id)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
