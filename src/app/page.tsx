"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  Clock,
  Calendar,
  Search,
  Sparkles,
  Heart,
  PenLine,
  Send,
  X,
  CheckCircle2,
  UserCheck,
  EyeOff,
  ImagePlus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Pin,
  TrendingUp,
  MessageSquareHeart,
  Bookmark,
  Shuffle,
  Eye,
  Copy,
  Check,
  Quote,
  BarChart2,
  Menu,
  User,
  LogIn,
  LogOut,
  Lock,
  Mail,
} from "lucide-react";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  BlogPost,
  StoryCategory,
  DAILY_QUOTES_BN,
  HOME_POLL_QUESTION,
  INITIAL_POLL_OPTIONS,
  PollOptionItem,
} from "@/data/blogData";
import { BOOK_INFO } from "@/data/bookData";
import { validateImageUpload } from "@/lib/security";
import { GO_API_BASE_URL, AppUser } from "@/lib/goApi";
import ThemeToggle from "@/components/ThemeToggle";
import SidebarBanners from "@/components/SidebarBanners";
import DailyWellnessCard from "@/components/DailyWellnessCard";

export default function OnuvutiBlogHomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState("সকল গল্প");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {}
  );

  // Daily Quote State
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteCopied, setQuoteCopied] = useState(false);

  // 1-Click Reader Poll State
  const [pollOptions, setPollOptions] =
    useState<PollOptionItem[]>(INITIAL_POLL_OPTIONS);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  // My Submissions & Tracking Code State (No Account Required)
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [mySubmittedIds, setMySubmittedIds] = useState<
    Array<{ id: string; title: string; category: string }>
  >([]);
  const [trackedStoriesMap, setTrackedStoriesMap] = useState<
    Record<
      string,
      BlogPost & { status?: string; viewsCount?: number; adminNote?: string }
    >
  >({});
  const [manualTrackCode, setManualTrackCode] = useState("");
  const [manualTrackedResult, setManualTrackedResult] = useState<
    | (BlogPost & { status?: string; viewsCount?: number; adminNote?: string })
    | null
  >(null);
  const [manualTrackError, setManualTrackError] = useState<string | null>(null);
  const [lastSubmittedTrackingId, setLastSubmittedTrackingId] = useState<
    string | null
  >(null);

  // User Authentication & Profile State (PostgreSQL User Accounts)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userStories, setUserStories] = useState<
    Array<BlogPost & { status?: string; adminNote?: string; submittedAt?: string }>
  >([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showGoogleQuickInput, setShowGoogleQuickInput] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");

  // Story Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [storyCategory, setStoryCategory] =
    useState<StoryCategory>("ক্রাশ ও কনফেশন");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  // Optional Image State (Only added if writer chooses to upload!)
  const [storyImageDataUrl, setStoryImageDataUrl] = useState<string | undefined>(
    undefined
  );
  const [imageError, setImageError] = useState<string | null>(null);
  // Anti-bot honeypot field
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Fetch published stories from Go Backend (with fallback to local storage/seed)
  useEffect(() => {
    // Select daily quote based on day of month
    const dayIdx = new Date().getDate() % DAILY_QUOTES_BN.length;
    setQuoteIdx(dayIdx);

    // Check if URL has ?category=... query param
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("category");
      if (catParam && BLOG_CATEGORIES.includes(catParam)) {
        setActiveCategory(catParam);
      }
    } catch {
      // Ignore URL parsing errors
    }

    // Load saved bookmarks & poll vote from localStorage
    try {
      const savedBookmarks = localStorage.getItem("onuvuti_bookmarked_ids");
      if (savedBookmarks) {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      }

      const savedMySubs = localStorage.getItem("onuvuti_my_submissions");
      if (savedMySubs) {
        const parsedSubs = JSON.parse(savedMySubs);
        if (Array.isArray(parsedSubs)) {
          setMySubmittedIds(parsedSubs);
        }
      }

      const savedVote = localStorage.getItem("onuvuti_home_poll_vote");
      const savedPollCounts = localStorage.getItem("onuvuti_home_poll_counts");
      if (savedVote) {
        setSelectedPollId(savedVote);
      }
      if (savedPollCounts) {
        const parsedCounts = JSON.parse(savedPollCounts);
        if (Array.isArray(parsedCounts) && parsedCounts.length > 0) {
          setPollOptions(parsedCounts);
        }
      }

      // Restore user login session from PostgreSQL token
      const savedUserToken = localStorage.getItem("onuvuti_user_token");
      const savedUserData = localStorage.getItem("onuvuti_user_data");
      if (savedUserData) {
        try {
          const parsedUser = JSON.parse(savedUserData);
          setCurrentUser(parsedUser);
          if (parsedUser.name) {
            setSenderName(parsedUser.name);
          }
        } catch {
          // Ignore parse errors
        }
      }
      if (savedUserToken) {
        refreshUserStories(savedUserToken);
      }
    } catch {
      // Ignore storage errors
    }

    // Track homepage visit in Go Analytics
    fetch(`${GO_API_BASE_URL}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/" }),
    }).catch(() => {});

    async function loadStoriesFromGo() {
      try {
        const res = await fetch(`${GO_API_BASE_URL}/stories?page=1&limit=50`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.stories)) {
            setPosts(data.stories);
          }
        }
      } catch {
        // Offline / network failure
      }
    }
    loadStoriesFromGo();
  }, []);

  const refreshUserStories = async (token?: string) => {
    const t =
      token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("onuvuti_user_token")
        : null);
    if (!t) return;
    try {
      const res = await fetch(`${GO_API_BASE_URL}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem(
              "onuvuti_user_data",
              JSON.stringify(data.user)
            );
          }
          if (Array.isArray(data.stories)) {
            setUserStories(data.stories);
          }
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        authMode === "login"
          ? { email: authEmail.trim(), password: authPassword }
          : {
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            };

      const res = await fetch(`${GO_API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(
          data.error || "লগইন করা যায়নি। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।"
        );
        setIsAuthLoading(false);
        return;
      }

      localStorage.setItem("onuvuti_user_token", data.token);
      localStorage.setItem("onuvuti_user_data", JSON.stringify(data.user));
      setCurrentUser(data.user);
      if (!senderName) {
        setSenderName(data.user.name);
      }
      setIsAuthModalOpen(false);
      setAuthPassword("");
      await refreshUserStories(data.token);
    } catch {
      setAuthError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। একটু পর আবার চেষ্টা করুন।");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleAuth = async (
    emailParam?: string,
    nameParam?: string
  ) => {
    setAuthError(null);
    setIsAuthLoading(true);

    const email = (emailParam || googleEmailInput).trim();
    const name = (nameParam || googleNameInput || email.split("@")[0]).trim();

    if (!email) {
      setAuthError("অনুগ্রহ করে আপনার গুগল ইমেইল দিন।");
      setIsAuthLoading(false);
      return;
    }

    try {
      const res = await fetch(`${GO_API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&background=80131E&color=fff`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || "গুগল সাইন-ইন সম্পন্ন করা যায়নি।");
        setIsAuthLoading(false);
        return;
      }

      localStorage.setItem("onuvuti_user_token", data.token);
      localStorage.setItem("onuvuti_user_data", JSON.stringify(data.user));
      setCurrentUser(data.user);
      if (!senderName) {
        setSenderName(data.user.name);
      }
      setShowGoogleQuickInput(false);
      setIsAuthModalOpen(false);
      await refreshUserStories(data.token);
    } catch {
      setAuthError("গুগল সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("onuvuti_user_token");
    localStorage.removeItem("onuvuti_user_data");
    setCurrentUser(null);
    setUserStories([]);
    setIsProfileModalOpen(false);
  };

  const bookmarkedCount = Object.values(bookmarkedIds).filter(Boolean).length;

  const filteredPosts = posts
    .filter((post) => {
      if (showSavedOnly && !bookmarkedIds[post.id]) {
        return false;
      }
      const matchCat =
        activeCategory === "সকল গল্প" || post.category === activeCategory;
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  // Top 3 Trending / Most Read Stories ("সপ্তাহের সেরা ও সবচেয়ে বেশি পড়া লেখা")
  const trendingPosts = [...posts]
    .sort(
      (a, b) =>
        (b.viewsCount || b.likesCount * 5) - (a.viewsCount || a.likesCount * 5)
    )
    .slice(0, 3);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const alreadyLiked = Boolean(likedIds[id]);
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!alreadyLiked) {
      fetch(`${GO_API_BASE_URL}/stories/${encodeURIComponent(id)}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "love" }),
      }).catch(() => {});
    }
  };

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("onuvuti_bookmarked_ids", JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  const handleCopyDailyQuote = async () => {
    const quoteText = `“${DAILY_QUOTES_BN[quoteIdx]}” — অনুভূতি (onuvuti.site)`;
    try {
      await navigator.clipboard.writeText(quoteText);
      setQuoteCopied(true);
      setTimeout(() => setQuoteCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  const handleSurpriseRandomStory = () => {
    if (posts.length === 0) return;
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    router.push(`/blog/${randomPost.slug}`);
  };

  const handlePollVote = (optionId: string) => {
    if (selectedPollId) return;
    const updated = pollOptions.map((opt) =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    setSelectedPollId(optionId);
    setPollOptions(updated);
    try {
      localStorage.setItem("onuvuti_home_poll_vote", optionId);
      localStorage.setItem("onuvuti_home_poll_counts", JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const totalPollVotes = pollOptions.reduce((sum, item) => sum + item.votes, 0);

  const handleWriterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setStoryImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const effectiveAuthor = isAnonymous
      ? "নাম প্রকাশে অনিচ্ছুক"
      : senderName.trim() || currentUser?.name || "লেখক";

    const payload = {
      title: storyTitle,
      content: storyBody,
      category: storyCategory,
      author: effectiveAuthor,
      isAnonymous,
      imageUrl: storyImageDataUrl, // undefined if writer didn't upload an image
      websiteUrl, // Honeypot
      userId: currentUser?.id || "",
    };

    try {
      // Submit directly to Go Backend first (fallback to Next.js API if Go is unreachable)
      let res: Response;
      try {
        res = await fetch(`${GO_API_BASE_URL}/stories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        res = await fetch("/api/stories/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setSubmitError(
          data.error || "আপনার লেখাটি পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
        );
        setIsSubmitting(false);
        return;
      }

      // If user is logged in, attach new story to their profile list
      if (currentUser && data.story) {
        setUserStories((prev) => [data.story, ...prev]);
      }

      // Also sync to localStorage fallback & My Submissions Tracker
      if (data.story?.id) {
        setLastSubmittedTrackingId(data.story.id);
        const newSubEntry = {
          id: data.story.id,
          title: data.story.title || storyTitle,
          category: data.story.category || storyCategory,
        };
        setMySubmittedIds((prev) => {
          const next = [
            newSubEntry,
            ...prev.filter((item) => item.id !== newSubEntry.id),
          ];
          try {
            localStorage.setItem(
              "onuvuti_my_submissions",
              JSON.stringify(next)
            );
          } catch {
            // Ignore quota errors
          }
          return next;
        });
      }

      try {
        const existingPendingRaw = localStorage.getItem(
          "onuvuti_pending_stories"
        );
        const existingPending = existingPendingRaw
          ? JSON.parse(existingPendingRaw)
          : [];
        localStorage.setItem(
          "onuvuti_pending_stories",
          JSON.stringify([data.story, ...existingPending])
        );
      } catch {
        // Ignore storage quota errors
      }

      setSubmittedSuccess(true);
    } catch {
      setSubmitError("নেটওয়ার্ক ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSavedSubmission = (id: string) => {
    setMySubmittedIds((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("onuvuti_my_submissions", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearDeletedSubmissions = () => {
    setMySubmittedIds((prev) => {
      const updated = prev.filter((item) => {
        const itemStatus = trackedStoriesMap[item.id]?.status;
        return itemStatus !== "deleted";
      });
      try {
        localStorage.setItem("onuvuti_my_submissions", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const openTrackerModal = async () => {
    setIsTrackerModalOpen(true);
    setManualTrackError(null);

    const updatedMap: Record<
      string,
      BlogPost & { status?: string; viewsCount?: number; adminNote?: string }
    > = {};

    for (const sub of mySubmittedIds) {
      const matchedPublished = posts.find((p) => p.id === sub.id);
      if (matchedPublished) {
        updatedMap[sub.id] = { ...matchedPublished, status: "published" };
        continue;
      }

      try {
        const res = await fetch(
          `${GO_API_BASE_URL}/stories/track/${encodeURIComponent(sub.id)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.story) {
            updatedMap[sub.id] = data.story;
          }
        } else if (res.status === 404) {
          // Admin deleted or rejected this submission
          updatedMap[sub.id] = {
            id: sub.id,
            title: sub.title,
            category: sub.category,
            status: "deleted",
          } as any;
        }
      } catch {
        // Fallback if offline
      }
    }

    setTrackedStoriesMap(updatedMap);
  };

  const handleManualTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualTrackError(null);
    setManualTrackedResult(null);

    const cleanCode = manualTrackCode.trim().replace(/^#/, "");
    if (!cleanCode) return;

    const matchedLocal = posts.find(
      (p) =>
        p.id.toLowerCase() === cleanCode.toLowerCase() ||
        p.slug.toLowerCase() === cleanCode.toLowerCase()
    );
    if (matchedLocal) {
      setManualTrackedResult({ ...matchedLocal, status: "published" });
      return;
    }

    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/stories/track/${encodeURIComponent(cleanCode)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.story) {
          setManualTrackedResult(data.story);
          return;
        }
      }
    } catch {
      // Ignore network error
    }

    setManualTrackError(
      "এই ট্র্যাকিং কোডে কোনো লেখা পাওয়া যায়নি। কোডটি আবার যাচাই করুন।"
    );
  };

  const resetModal = () => {
    setSubmittedSuccess(false);
    setSubmitError(null);
    setImageError(null);
    setStoryTitle("");
    setStoryBody("");
    setStoryImageDataUrl(undefined);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] flex flex-col transition-colors duration-200">
      {/* Sticky Left and Right Desktop Sidebar Banners (Controlled by Backend) */}
      <SidebarBanners />

      {/* Clean Light/Dark Header with Full Desktop & Mobile Navigation Menu */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-[#111827]/95 border-b border-stone-200/80 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          <Link
            href="/"
            onClick={() => {
              setShowSavedOnly(false);
              setActiveCategory("সকল গল্প");
              setCurrentPage(1);
            }}
            className="flex items-center gap-3 shrink-0"
          >
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              "সকল গল্প",
              "ক্রাশ ও কনফেশন",
              "রোমান্টিক গল্প",
              "না বলা কথা",
              "সম্পর্ক ও মনস্তত্ত্ব",
            ].map((navCat) => {
              const isNavActive = !showSavedOnly && activeCategory === navCat;
              return (
                <button
                  key={navCat}
                  type="button"
                  onClick={() => {
                    setShowSavedOnly(false);
                    setActiveCategory(navCat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    isNavActive
                      ? "bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300"
                      : "text-stone-600 dark:text-stone-300 hover:text-[#80131E] dark:hover:text-rose-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                  }`}
                >
                  {navCat === "সকল গল্প" ? "হোমপেজ" : navCat}
                </button>
              );
            })}

            <button
              type="button"
              onClick={openTrackerModal}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-stone-600 dark:text-stone-300 hover:text-[#80131E] dark:hover:text-rose-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer inline-flex items-center gap-1"
            >
              <span>আমার লেখা</span>
              {mySubmittedIds.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#80131E] text-white text-[10px]">
                  {mySubmittedIds.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/50 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-300 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 hover:bg-[#f3e8ce] dark:hover:bg-[#253348] transition cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">গল্প / কনফেশন পাঠান</span>
              <span className="sm:hidden">লেখা পাঠান</span>
            </button>

            <Link
              href="/sporsher-byakoron"
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm hover:bg-[#630d16] transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ই-বুক</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>

            {/* User Account / Profile Button */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                title={`${currentUser.name} (প্রোফাইল দেখুন)`}
              >
                <div className="w-6 h-6 rounded-full bg-[#80131E] text-white flex items-center justify-center text-[11px] font-extrabold uppercase shrink-0">
                  {currentUser.name ? currentUser.name.slice(0, 1) : "ইউ"}
                </div>
                <span className="hidden md:inline max-w-[85px] truncate">
                  {currentUser.name}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
              >
                <User className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
                <span className="hidden sm:inline">লগইন</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="মেনু খুলুন"
              className="lg:hidden p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-[#142230] dark:text-white hover:text-[#80131E] dark:hover:text-rose-400 cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111827] px-4 py-4 space-y-3 shadow-md">
            <div className="grid grid-cols-2 gap-2">
              {BLOG_CATEGORIES.map((cat) => {
                const isCatActive = !showSavedOnly && activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setShowSavedOnly(false);
                      setActiveCategory(cat);
                      setCurrentPage(1);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-bold transition cursor-pointer ${
                      isCatActive
                        ? "bg-[#80131E] text-white"
                        : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                    }`}
                  >
                    {cat === "সকল গল্প" ? "হোমপেজ (সকল গল্প)" : cat}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSavedOnly(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>সংরক্ষিত লেখা ({bookmarkedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openTrackerModal();
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#142230] dark:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#80131E] dark:text-rose-400" />
                <span>আমার পাঠানো লেখা ({mySubmittedIds.length})</span>
              </button>
            </div>

            {/* Mobile User Session Action */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold inline-flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#80131E] text-white flex items-center justify-center text-[11px] font-bold">
                      {currentUser.name.slice(0, 1)}
                    </div>
                    <span>{currentUser.name} (প্রোফাইল)</span>
                  </div>
                  <span className="text-[#80131E] text-[11px] font-extrabold">
                    লেখা: {userStories.length}টি
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAuthMode("login");
                    setAuthError(null);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-300 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer hover:bg-[#f3e8ce] dark:hover:bg-[#253348]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>অ্যাকাউন্টে লগইন / সাইন-আপ করুন</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* Unified Editorial Hero & Daily Vibe Header */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 text-xs font-bold">
                ✨ অনুভূতির সাহিত্য, না বলা কথা ও জীবনের স্পন্দন
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142230] dark:text-white leading-snug">
                ভালোবাসার গল্প, গোপন ক্রাশ, জীবনের অভিজ্ঞতা ও মনের না বলা কথা
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                এখানে মানুষ শেয়ার করে তাদের ভালোবাসার না বলা গল্প, গোপন কনফেশন, জীবনের অভিমান ও আবেগঘন স্মৃতি। আপনিও নিজের পরিচয় প্রকাশ করে বা সম্পূর্ণ নাম গোপন রেখে আপনার লেখা পাঠাতে পারেন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={openTrackerModal}
                className="px-4 py-3 rounded-2xl bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/50 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-300 font-bold text-xs sm:text-sm inline-flex items-center gap-2 hover:bg-[#f3e8ce] dark:hover:bg-[#253348] transition cursor-pointer shadow-2xs"
              >
                <Clock className="w-4 h-4" />
                <span>আমার পাঠানো লেখা ({mySubmittedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm hover:bg-[#630d16] transition cursor-pointer"
              >
                <PenLine className="w-4 h-4" />
                <span>গল্প / কনফেশন পাঠান</span>
              </button>
            </div>
          </div>

          {/* Integrated Daily Quote Bar ("আজকের অনুভূতি") */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FAF4E6]/50 dark:bg-[#161E2E]/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 sm:px-8 py-3.5 rounded-b-3xl">
            <div className="flex items-start sm:items-center gap-2.5 text-xs sm:text-sm text-[#142230] dark:text-stone-200">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#80131E] text-white text-[11px] font-extrabold shrink-0">
                <Quote className="w-3 h-3" />
                আজকের অনুভূতি
              </span>
              <p className="font-semibold italic text-stone-800 dark:text-stone-200 leading-relaxed text-xs sm:text-sm">
                “{DAILY_QUOTES_BN[quoteIdx]}”
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setQuoteIdx((prev) => (prev + 1) % DAILY_QUOTES_BN.length)
                }
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] font-bold text-stone-600 dark:text-stone-300 hover:text-[#80131E] dark:hover:text-rose-400 cursor-pointer transition shadow-2xs"
              >
                পরের উক্তি
              </button>
              <button
                type="button"
                onClick={handleCopyDailyQuote}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-[#80131E] dark:text-rose-400 hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition shadow-2xs"
              >
                {quoteCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>উক্তিটি কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FEATURE: Interactive Daily Mental & Physical Health Wellness Hub */}
        {!searchQuery.trim() && !showSavedOnly && (
          <DailyWellnessCard />
        )}

        {/* Trending / Most Read Stories Section ("সপ্তাহের সেরা ও পাঠকপ্রিয় লেখা") */}
        {trendingPosts.length > 0 && !searchQuery.trim() && !showSavedOnly && (
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-[#142230] dark:text-white">
                <TrendingUp className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                <span>সপ্তাহের সেরা ও পাঠকপ্রিয় লেখা</span>
              </div>
              <span className="text-xs font-bold text-[#80131E] dark:text-rose-400">
                সর্বাধিক পঠিত
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {trendingPosts.map((tp, idx) => (
                <Link
                  key={tp.id}
                  href={`/blog/${tp.slug}`}
                  className="group rounded-2xl bg-[#FDF8F2] dark:bg-[#161E2E] border border-stone-200/80 dark:border-stone-800 p-4 hover:border-[#80131E]/50 dark:hover:border-rose-500/50 transition flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#80131E] dark:text-rose-400">
                        #{idx + 1} • {tp.category}
                      </span>
                      <span className="text-stone-400 dark:text-stone-500 font-semibold inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(tp.viewsCount || tp.likesCount * 5).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#142230] dark:text-white group-hover:text-[#80131E] dark:group-hover:text-rose-400 line-clamp-2 leading-snug">
                      {tp.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                    — {tp.author}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter, Bookmarks Filter, Search & Random Story Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {BLOG_CATEGORIES.map((cat) => {
              const active = !showSavedOnly && activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setShowSavedOnly(false);
                    setActiveCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                    active
                      ? "bg-[#80131E] text-white shadow-xs"
                      : "bg-white dark:bg-[#111827] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-[#80131E]/40 dark:hover:border-rose-400/40"
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            {/* FEATURE 1: Saved / Bookmarked Stories Filter Button */}
            <button
              type="button"
              onClick={() => {
                setShowSavedOnly((prev) => !prev);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                showSavedOnly
                  ? "bg-[#80131E] text-white shadow-xs"
                  : "bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300 border border-[#C59B27]/50 dark:border-[#C59B27]/30 hover:bg-[#f3e8ce] dark:hover:bg-[#253348]"
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  showSavedOnly ? "fill-white" : "fill-[#80131E]/20"
                }`}
              />
              <span>সংরক্ষিত লেখা ({bookmarkedCount})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="গল্প বা কনফেশন খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-[#142230] dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-[#80131E]"
              />
            </div>

            {/* FEATURE 3: Surprise Me / Random Story Button */}
            <button
              type="button"
              onClick={handleSurpriseRandomStory}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 hover:border-[#80131E]/50 dark:hover:border-rose-400/50 text-xs sm:text-sm font-bold text-[#80131E] dark:text-rose-400 inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition shadow-2xs"
              title="যেকোনো একটি র‍্যান্ডম গল্প বা কনফেশন পড়ুন"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>যেকোনো একটি গল্প পড়ুন</span>
            </button>
          </div>
        </div>

        {/* Empty State when Stories list has 0 items */}
        {paginatedPosts.length === 0 && (
          <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-10 sm:p-14 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-400 mx-auto flex items-center justify-center">
              <PenLine className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white">
                {showSavedOnly
                  ? "আপনার প্রিয় তালিকায় এখনো কোনো গল্প সংরক্ষণ করা হয়নি।"
                  : searchQuery.trim()
                  ? `"${searchQuery}" দিয়ে কোনো লেখা খুঁজে পাওয়া যায়নি।`
                  : activeCategory === "স্বাস্থ্য ও সুস্থতা"
                  ? "স্বাস্থ্য ও মানসিক সুস্থতা বিষয়ক পূর্ণাঙ্গ গাইড উপরের কার্ডে রয়েছে।"
                  : activeCategory !== "সকল গল্প"
                  ? `"${activeCategory}" ক্যাটাগরিতে এখনো কোনো লেখা নেই।`
                  : "অনুভূতিতে আপনাকে স্বাগতম। এখনো কোনো গল্প প্রকাশিত হয়নি।"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                {showSavedOnly
                  ? "যেকোনো গল্পের কার্ডের কোণায় থাকা বুকমার্ক আইকনে ক্লিক করে পরে পড়ার জন্য সংরক্ষণ করতে পারবেন।"
                  : searchQuery.trim()
                  ? "অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন বা ফিল্টার ক্লিয়ার করুন।"
                  : activeCategory === "স্বাস্থ্য ও সুস্থতা"
                  ? "উদ্বেগ দূর করা, গভীর ঘুম, সম্পর্কের যত্ন ও মানসিক প্রশান্তির পূর্ণাঙ্গ গাইড উপরের মডিউল থেকে বিস্তারিত পড়তে পারেন। এছাড়া আপনার স্বাস্থ্য অভিজ্ঞতাও আমাদের পাঠাতে পারেন।"
                  : activeCategory !== "সকল গল্প"
                  ? "অন্য কোনো ক্যাটাগরি নির্বাচন করুন অথবা এই ক্যাটাগরিতে আপনার লেখা পাঠান।"
                  : "আপনার মনের না বলা কোনো গল্প বা অনুভূতি আমাদের পাঠাতে পারেন। অনুমোদিত হলে তা হোমপেজে প্রকাশিত হবে।"}
              </p>
            </div>
            {!showSavedOnly && !searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#80131E] hover:bg-[#680f18] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition"
              >
                <PenLine className="w-4 h-4" />
                <span>আপনার গল্প বা অনুভূতি পাঠান</span>
              </button>
            )}
          </div>
        )}

        {/* Stories, Confessions & Unspoken Letters Grid (Paginated) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPosts.map((post) => {
            const isLiked = Boolean(likedIds[post.id]);
            const isBookmarked = Boolean(bookmarkedIds[post.id]);
            const isUnspoken = post.category === "না বলা কথা";
            const isConfession = post.category === "ক্রাশ ও কনফেশন";
            const totalReaders = post.viewsCount || post.likesCount * 6;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group rounded-2xl border overflow-hidden flex flex-col justify-between transition shadow-xs hover:shadow-md ${
                  isUnspoken || isConfession
                    ? "bg-[#FAF4E6]/75 dark:bg-[#161E2E] border-[#C59B27]/45 dark:border-[#C59B27]/30 hover:border-[#80131E]/60 dark:hover:border-rose-500/60"
                    : "bg-white dark:bg-[#111827] border-stone-200/90 dark:border-stone-800 hover:border-[#80131E]/50 dark:hover:border-rose-500/50"
                }`}
              >
                <div>
                  {/* ONLY render image if writer or admin actually added one */}
                  {post.imageUrl && (
                    <div className="w-full h-44 overflow-hidden bg-stone-100 dark:bg-stone-800 border-b border-stone-200/60 dark:border-stone-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold ${
                            isUnspoken || isConfession
                              ? "bg-[#80131E] text-white"
                              : "bg-[#FAF4E6] dark:bg-[#1E293B] text-[#80131E] dark:text-rose-300"
                          }`}
                        >
                          {post.category}
                        </span>

                        {post.confessionIdBn && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[#80131E] dark:text-rose-300 text-[11px] font-extrabold border border-rose-200 dark:border-rose-900/60">
                            {post.confessionIdBn}
                          </span>
                        )}

                        {post.isAdminPost && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-extrabold border border-amber-200 dark:border-amber-900/60">
                            সম্পাদকের কলমে
                          </span>
                        )}

                        {post.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-stone-900 dark:bg-stone-800 text-white text-[11px] font-bold inline-flex items-center gap-1 border border-stone-700">
                            <Pin className="w-2.5 h-2.5" />
                            <span>পিন করা</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 dark:text-stone-500 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTimeBn}
                        </span>

                        {/* FEATURE 1: Bookmark Icon on Story Card */}
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(e, post.id)}
                          title={
                            isBookmarked
                              ? "সংরক্ষিত তালিকা থেকে সরান"
                              : "পরে পড়ার জন্য সংরক্ষণ করুন"
                          }
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isBookmarked
                              ? "bg-[#80131E] border-[#80131E] text-white"
                              : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-[#80131E] dark:hover:text-rose-400"
                          }`}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isBookmarked ? "fill-white" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white group-hover:text-[#80131E] dark:group-hover:text-rose-400 transition leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      “{post.excerpt}”
                    </p>

                    {post.adminNote && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#80131E] dark:text-rose-300 bg-[#FAF4E6] dark:bg-[#1E293B] border border-[#C59B27]/40 dark:border-[#C59B27]/30 px-2.5 py-0.5 rounded-lg">
                          <MessageSquareHeart className="w-3 h-3" />
                          <span>অনুভূতি টিমের পরামর্শ যুক্ত</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-stone-200/60 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-700 dark:text-stone-300 truncate">
                      — {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500 shrink-0">
                      <Calendar className="w-3 h-3 text-[#C59B27]" />
                      {post.dateBn}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleLike(e, post.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          isLiked
                            ? "bg-rose-100 dark:bg-rose-950/60 text-[#80131E] dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-[#80131E] dark:hover:text-rose-400"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isLiked ? "fill-[#80131E] text-[#80131E]" : ""
                          }`}
                        />
                        <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
                      </button>

                      {/* FEATURE 5: Total Readers (Views Count) on Story Card */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                        <Eye className="w-3.5 h-3.5 text-stone-400" />
                        <span>{totalReaders.toLocaleString()} পাঠক</span>
                      </span>
                    </div>

                    <span className="text-xs text-[#80131E] font-bold inline-flex items-center gap-1">
                      পুরোটা পড়ুন <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {filteredPosts.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
              মোট <strong className="text-[#80131E] dark:text-rose-400">{filteredPosts.length}টি</strong> লেখার মধ্যে পৃষ্ঠা{" "}
              <strong>{safePage}</strong> / <strong>{totalPages}</strong> দেখানো হচ্ছে
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              >
                « আগের পৃষ্ঠা
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      pageNum === safePage
                        ? "bg-[#80131E] text-white shadow-xs"
                        : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-[#80131E]/40 dark:hover:border-rose-400/40"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
              >
                পরের পৃষ্ঠা »
              </button>
            </div>
          </div>
        )}

        {/* FEATURE 4: 1-Click Reader Poll ("পাঠক জরিপ / আজকের প্রশ্ন") */}
        <div className="rounded-3xl bg-white dark:bg-[#111827] border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#80131E] dark:text-rose-400">
              <BarChart2 className="w-4 h-4" />
              <span>পাঠক জরিপ • আজকের প্রশ্ন</span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
              মোট মতামত দিয়েছেন: {totalPollVotes.toLocaleString()} জন পাঠক
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-[#142230] dark:text-white">
            {HOME_POLL_QUESTION}
          </h3>

          <div className="grid sm:grid-cols-3 gap-3">
            {pollOptions.map((opt) => {
              const percent =
                totalPollVotes > 0
                  ? Math.round((opt.votes / totalPollVotes) * 100)
                  : 0;
              const isChosen = selectedPollId === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePollVote(opt.id)}
                  className={`relative overflow-hidden text-left p-3.5 rounded-2xl border transition cursor-pointer ${
                    isChosen
                      ? "border-[#80131E] dark:border-rose-500 bg-[#FAF4E6] dark:bg-[#1E293B]"
                      : "border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/50 hover:border-[#80131E]/50 dark:hover:border-rose-400/50"
                  }`}
                >
                  {selectedPollId && (
                    <div
                      style={{ width: `${percent}%` }}
                      className="absolute inset-y-0 left-0 bg-[#80131E]/10 dark:bg-rose-500/20 transition-all duration-500"
                    />
                  )}
                  <div className="relative flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#142230] dark:text-stone-200">
                      {opt.label}
                    </span>
                    {selectedPollId && (
                      <span className="text-xs font-extrabold text-[#80131E] dark:text-rose-400 shrink-0">
                        {percent}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedPollId && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              আপনার মতামতের জন্য ধন্যবাদ! পাঠকদের সম্মিলিত ফলাফল ওপরে দেখানো হচ্ছে।
            </p>
          )}
        </div>

        {/* Minimal Book Banner */}
        <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#161E2E] border border-[#C59B27]/45 dark:border-[#C59B27]/30 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#80131E] dark:text-rose-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>আমাদের প্রকাশিত ই-বুক</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#142230] dark:text-white">
              {BOOK_INFO.titleBn}: {BOOK_INFO.subtitleBn}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              ১০০+ পৃষ্ঠার প্রিমিয়াম গাইড • রেগুলার মূল্য{" "}
              <span className="line-through text-stone-400 dark:text-stone-500">
                ৳{BOOK_INFO.regularPriceBn}
              </span>{" "}
              •{" "}
              <strong>
                {BOOK_INFO.discountPercentBn}ে মাত্র ৳{BOOK_INFO.offerPriceBn}
              </strong>
            </p>
          </div>

          <Link
            href="/sporsher-byakoron"
            className="px-5 py-2.5 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 hover:bg-[#630d16] transition"
          >
            <span>বইটি দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* STORY / CONFESSION SUBMISSION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#80131E] dark:text-rose-400">
                  অনুভূতির চিঠির বাক্স
                </span>
                <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
                  আপনার গল্প, ক্রাশ কনফেশন বা না বলা কথা পাঠান
                </h3>
              </div>
              <button
                type="button"
                onClick={resetModal}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {submittedSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#142230] dark:text-white">
                    ধন্যবাদ! আপনার লেখাটি নিরাপদে জমা হয়েছে
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto">
                    অ্যাডমিন আপনার লেখাটি রিভিউ করে অনুমোদন দিলেই ওয়েবসাইটে প্রকাশিত হবে। আপনার ব্রাউজারে এটি স্বয়ংক্রিয়ভাবে সেভ হয়ে আছে।
                  </p>

                  {lastSubmittedTrackingId && (
                    <div className="rounded-2xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/50 dark:border-[#C59B27]/40 p-3.5 max-w-xs mx-auto space-y-1">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                        আপনার লেখার গোপন ট্র্যাকিং কোড:
                      </span>
                      <code className="text-base font-extrabold text-[#80131E] dark:text-rose-400 block">
                        #{lastSubmittedTrackingId}
                      </code>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                        অন্য যেকোনো ডিভাইস থেকেও এই কোড দিয়ে লেখার অবস্থা ও টিমের উত্তর দেখতে পারবেন।
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        resetModal();
                        openTrackerModal();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/50 dark:border-[#C59B27]/40 text-[#80131E] dark:text-rose-300 font-bold text-xs sm:text-sm cursor-pointer hover:bg-[#f3e8ce] dark:hover:bg-[#253348]"
                    >
                      আমার লেখা ট্র্যাক করুন
                    </button>
                    <button
                      type="button"
                      onClick={resetModal}
                      className="px-6 py-2.5 rounded-xl bg-[#80131E] hover:bg-[#680f18] text-white font-bold text-xs sm:text-sm cursor-pointer"
                    >
                      ঠিক আছে
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleStorySubmit} className="space-y-4">
                  {/* Hidden Honeypot Input for Anti-Bot Protection */}
                  <input
                    type="text"
                    name="website_url"
                    tabIndex={-1}
                    autoComplete="off"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="hidden"
                  />

                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Optional User Account Banner */}
                  {currentUser ? (
                    <div className="p-3 rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/45 dark:border-[#C59B27]/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#80131E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {currentUser.name
                            ? currentUser.name.slice(0, 1)
                            : "ইউ"}
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-[#142230] dark:text-white">
                            লগইন আছেন:{" "}
                            <span className="text-[#80131E] dark:text-rose-400">
                              {currentUser.name}
                            </span>
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            গল্পটি আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে সেভ থাকবে।
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitModalOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="text-xs font-extrabold text-[#80131E] dark:text-rose-400 hover:underline cursor-pointer shrink-0"
                      >
                        প্রোফাইল
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
                      <div className="text-xs text-stone-600 dark:text-stone-300">
                        <span className="font-bold text-stone-800 dark:text-white">
                          💡 অ্যাকাউন্ট ছাড়াও সরাসরি গল্প পাঠানো যাবে
                        </span>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          সব লেখা এক অ্যাকাউন্টে সেভ রাখতে চাইলে লগইন করুন।
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitModalOpen(false);
                          setAuthMode("login");
                          setAuthError(null);
                          setIsAuthModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-[#80131E] dark:text-rose-300 text-xs font-bold hover:bg-[#f3e8ce] dark:hover:bg-[#253348] cursor-pointer shrink-0"
                      >
                        লগইন
                      </button>
                    </div>
                  )}

                  {/* Anonymous Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#142230] dark:text-white">
                      {isAnonymous ? (
                        <EyeOff className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>
                        {isAnonymous
                          ? "নাম গোপন থাকবে (নাম প্রকাশে অনিচ্ছুক)"
                          : "নিজের বা ছদ্মনামে প্রকাশ করুন"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous((prev) => !prev)}
                      className="text-xs font-bold text-[#80131E] dark:text-rose-400 underline cursor-pointer"
                    >
                      {isAnonymous ? "নাম দিতে চাই" : "নাম গোপন রাখুন"}
                    </button>
                  </div>

                  {!isAnonymous && (
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        আপনার নাম ও শহর
                      </label>
                      <input
                        type="text"
                        required={!isAnonymous}
                        maxLength={80}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="যেমন: নীলাঞ্জনা, ঢাকা"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      লেখার ধরন নির্বাচন করুন
                    </label>
                    <select
                      value={storyCategory}
                      onChange={(e) =>
                        setStoryCategory(e.target.value as StoryCategory)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                    >
                      <option value="ক্রাশ ও কনফেশন">ক্রাশ ও কনফেশন</option>
                      <option value="না বলা কথা">না বলা কথা</option>
                      <option value="রোমান্টিক গল্প">রোমান্টিক গল্প</option>
                      <option value="জীবনের গল্প">জীবনের গল্প</option>
                      <option value="বিচ্ছেদ ও প্রাক্তন">বিচ্ছেদ ও প্রাক্তন</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={180}
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      placeholder="আপনার গল্প বা কনফেশনের একটি সুন্দর শিরোনাম দিন"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      আপনার মূল গল্প / কনফেশন *
                    </label>
                    <textarea
                      rows={5}
                      required
                      maxLength={8000}
                      value={storyBody}
                      onChange={(e) => setStoryBody(e.target.value)}
                      placeholder="এখানে আপনার মনের কথা, ক্রাশ কনফেশন বা গল্পটি বিস্তারিত লিখুন..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                    />
                  </div>

                  {/* Optional Image Upload: Only added if writer chooses to! */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      ছবি যুক্ত করুন (ঐচ্ছিক — না দিলেও কোনো সমস্যা নেই)
                    </label>

                    {!storyImageDataUrl ? (
                      <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold text-stone-600 dark:text-stone-300 cursor-pointer transition">
                        <ImagePlus className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                        <span>চাইলে একটি ছবি যোগ করুন (JPG/PNG/WEBP, সর্বোচ্চ 2MB)</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleWriterImageChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-2 flex items-center justify-between gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={storyImageDataUrl}
                          alt="Preview"
                          className="h-16 w-24 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
                        />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex-1">
                          ছবি যুক্ত হয়েছে
                        </span>
                        <button
                          type="button"
                          onClick={() => setStoryImageDataUrl(undefined)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold inline-flex items-center gap-1 hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ছবি বাদ দিন</span>
                        </button>
                      </div>
                    )}

                    {imageError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                        {imageError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      স্প্যাম ও হ্যাকার প্রতিরোধে স্বয়ংক্রিয় Rate-Limit ও সিকিউরিটি ফিল্টার সক্রিয়।
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#80131E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#630d16] disabled:opacity-60 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting ? "পাঠানো হচ্ছে..." : "লেখাটি পাঠিয়ে দিন"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MY SUBMISSIONS & LIVE STATUS TRACKER MODAL (NO LOGIN REQUIRED) */}
      {isTrackerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#80131E] dark:text-rose-400">
                  অ্যাকাউন্ট ছাড়াই লাইভ ট্র্যাকার
                </span>
                <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
                  আমার পাঠানো লেখা ও অনুভূতি টিমের উত্তর
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackerModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Manual Tracking Code Lookup (For Any Device) */}
              <form
                onSubmit={handleManualTrackSearch}
                className="rounded-2xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-3.5 space-y-2"
              >
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  ট্র্যাকিং কোড দিয়ে লেখার অবস্থা জানুন (অন্য ফোন বা ব্রাউজার থেকেও)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualTrackCode}
                    onChange={(e) => setManualTrackCode(e.target.value)}
                    placeholder="যেমন: #p-101 বা 3"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#80131E] text-white text-xs font-bold cursor-pointer hover:bg-[#630d16] shrink-0"
                  >
                    খুঁজুন
                  </button>
                </div>

                {manualTrackError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {manualTrackError}
                  </p>
                )}

                {manualTrackedResult && (
                  <div className="mt-2 rounded-xl bg-white dark:bg-stone-800 border border-[#C59B27]/50 dark:border-[#C59B27]/30 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#80131E] dark:text-rose-400">
                        কোড: #{manualTrackedResult.id} •{" "}
                        {manualTrackedResult.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                          manualTrackedResult.status === "pending"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                        }`}
                      >
                        {manualTrackedResult.status === "pending"
                          ? "অপেক্ষমাণ (রিভিউ চলছে)"
                          : "প্রকাশিত হয়েছে"}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-[#142230] dark:text-white">
                      {manualTrackedResult.title}
                    </h4>
                    {manualTrackedResult.adminNote && (
                      <div className="rounded-lg bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 p-2.5 text-xs text-stone-700 dark:text-stone-300">
                        <strong className="text-[#80131E] dark:text-rose-400 block mb-0.5">
                          অনুভূতি টিমের পরামর্শ:
                        </strong>
                        {manualTrackedResult.adminNote}
                      </div>
                    )}
                    {manualTrackedResult.status !== "pending" &&
                      manualTrackedResult.slug && (
                        <Link
                          href={`/blog/${manualTrackedResult.slug}`}
                          onClick={() => setIsTrackerModalOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#80131E] dark:text-rose-400 hover:underline"
                        >
                          <span>প্রকাশিত লেখাটি পড়ুন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                  </div>
                )}
              </form>

              {/* Automatically Saved Submissions in This Browser */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    এই ব্রাউজার থেকে আপনার পাঠানো লেখা ({mySubmittedIds.length})
                  </h4>
                  {mySubmittedIds.some(
                    (s) => trackedStoriesMap[s.id]?.status === "deleted"
                  ) && (
                    <button
                      type="button"
                      onClick={clearDeletedSubmissions}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      বাতিলগুলো মুছুন
                    </button>
                  )}
                </div>

                {mySubmittedIds.length === 0 ? (
                  <div className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 p-6 text-center space-y-2">
                    <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                      আপনি এখনো এই ব্রাউজার থেকে কোনো গল্প বা কনফেশন পাঠাননি।
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      গল্প পাঠালে কোনো লগইন ছাড়াই এখানে স্বয়ংক্রিয়ভাবে ট্র্যাক করতে পারবেন।
                    </p>
                  </div>
                ) : (
                  mySubmittedIds.map((sub) => {
                    const liveItem =
                      trackedStoriesMap[sub.id] ||
                      posts.find((p) => p.id === sub.id);
                    const isDeleted = liveItem?.status === "deleted";
                    const isPublished =
                      Boolean(posts.find((p) => p.id === sub.id)) ||
                      (liveItem && liveItem.status === "published");

                    return (
                      <div
                        key={sub.id}
                        className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#80131E] dark:text-rose-400">
                            কোড: #{sub.id} • {sub.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                isPublished
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                  : isDeleted
                                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                              }`}
                            >
                              {isPublished
                                ? "প্রকাশিত হয়েছে"
                                : isDeleted
                                ? "বাতিল / মুছে ফেলা হয়েছে"
                                : "অপেক্ষমাণ (রিভিউ চলছে)"}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSavedSubmission(sub.id)}
                              title="তালিকা থেকে সরান"
                              className="p-1 rounded-md text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h5 className="text-sm font-extrabold text-[#142230] dark:text-white">
                          {liveItem?.title || sub.title}
                        </h5>

                        {isDeleted && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                            এই লেখাটি কর্তৃপক্ষ দ্বারা বাতিল অথবা ডাটাবেস থেকে মুছে ফেলা হয়েছে।
                          </p>
                        )}

                        {liveItem?.adminNote && (
                          <div className="rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/45 dark:border-[#C59B27]/30 p-3 text-xs text-stone-700 dark:text-stone-300">
                            <strong className="text-[#80131E] dark:text-rose-400 block mb-0.5">
                              অনুভূতি টিমের পরামর্শ:
                            </strong>
                            {liveItem.adminNote}
                          </div>
                        )}

                        {isPublished && liveItem?.slug && (
                          <div className="pt-1 flex items-center justify-between text-xs">
                            <span className="text-stone-500 dark:text-stone-400 font-semibold">
                              পছন্দ: {liveItem.likesCount || 1} • পাঠক:{" "}
                              {(liveItem.viewsCount || 12).toLocaleString()}
                            </span>
                            <Link
                              href={`/blog/${liveItem.slug}`}
                              onClick={() => setIsTrackerModalOpen(false)}
                              className="inline-flex items-center gap-1 font-extrabold text-[#80131E] dark:text-rose-400 hover:underline"
                            >
                              <span>লেখাটি দেখুন</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER AUTH MODAL (GOOGLE + MANUAL REGISTER / LOGIN) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#80131E] dark:text-rose-400">
                  অনুভূতি কমিউনিটি
                </span>
                <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
                  {authMode === "login"
                    ? "আপনার অ্যাকাউন্টে লগইন করুন"
                    : "নতুন অ্যাকাউন্ট তৈরি করুন"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setAuthError(null);
                  setShowGoogleQuickInput(false);
                }}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* 1-Click Sign in with Google */}
              <div className="space-y-2">
                {!showGoogleQuickInput ? (
                  <button
                    type="button"
                    onClick={() => setShowGoogleQuickInput(true)}
                    disabled={isAuthLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google দিয়ে চালিয়ে যান</span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300">
                        গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGoogleQuickInput(false)}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
                      >
                        বাতিল
                      </button>
                    </div>
                    <input
                      type="email"
                      value={googleEmailInput}
                      onChange={(e) => setGoogleEmailInput(e.target.value)}
                      placeholder="আপনার Gmail ঠিকানা (যেমন: name@gmail.com)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500"
                    />
                    <input
                      type="text"
                      value={googleNameInput}
                      onChange={(e) => setGoogleNameInput(e.target.value)}
                      placeholder="আপনার নাম (ঐচ্ছিক)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500"
                    />
                    <button
                      type="button"
                      disabled={isAuthLoading || !googleEmailInput.trim()}
                      onClick={() => handleGoogleAuth()}
                      className="w-full py-2 rounded-xl bg-[#80131E] text-white font-bold text-xs hover:bg-[#630d16] disabled:opacity-50 cursor-pointer"
                    >
                      {isAuthLoading ? "সংযোগ হচ্ছে..." : "Google দিয়ে নিশ্চিত করুন"}
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
                <span className="bg-white dark:bg-[#111827] px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider absolute">
                  বা ইমেইল দিয়ে
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    authMode === "login"
                      ? "bg-white dark:bg-[#111827] text-[#80131E] dark:text-rose-400 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  লগইন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    authMode === "register"
                      ? "bg-white dark:bg-[#111827] text-[#80131E] dark:text-rose-400 shadow-2xs"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  নতুন অ্যাকাউন্ট (রেজিস্টার)
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleManualAuth} className="space-y-3 pt-1">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      আপনার পুরো নাম *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ইমেইল ঠিকানা *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="আপনার ইমেইল (যেমন: you@example.com)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    পাসওয়ার্ড *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder={
                        authMode === "register"
                          ? "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                          : "আপনার পাসওয়ার্ড দিন"
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#80131E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3 rounded-xl bg-[#80131E] text-white font-bold text-xs sm:text-sm hover:bg-[#630d16] disabled:opacity-50 transition cursor-pointer shadow-sm"
                >
                  {isAuthLoading
                    ? "যাচাই করা হচ্ছে..."
                    : authMode === "login"
                    ? "লগইন করুন"
                    : "অ্যাকাউন্ট তৈরি করুন"}
                </button>
              </form>

              <div className="p-3 rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/40 dark:border-[#C59B27]/30 text-center">
                <p className="text-[11px] text-stone-600 dark:text-stone-300">
                  💡 কোনো অ্যাকাউন্ট ছাড়াও আপনি সরাসরি গল্প পড়তে ও পাঠাতে পারেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER PROFILE & MY DASHBOARD MODAL */}
      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
            <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#80131E] dark:text-rose-400">
                  ব্যবহারকারী প্রোফাইল
                </span>
                <h3 className="text-lg font-extrabold text-[#142230] dark:text-white">
                  আমার অনুভূতি অ্যাকাউন্ট
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* User Header Info Card */}
              <div className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#80131E] text-white flex items-center justify-center text-lg font-extrabold uppercase shrink-0 shadow-xs">
                    {currentUser.name ? currentUser.name.slice(0, 1) : "ইউ"}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#142230] dark:text-white">
                      {currentUser.name}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      {currentUser.provider === "google"
                        ? "Google ভেরিফাইড"
                        : "নিবন্ধিত সদস্য"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-900 text-stone-600 dark:text-stone-300 hover:text-rose-700 dark:hover:text-rose-400 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </div>

              {/* My Submitted Stories Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                    আমার পাঠানো লেখা ও কনফেশন ({userStories.length})
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setIsSubmitModalOpen(true);
                    }}
                    className="text-xs font-extrabold text-[#80131E] dark:text-rose-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>নতুন লেখা পাঠান</span>
                  </button>
                </div>

                {userStories.length === 0 ? (
                  <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-dashed border-stone-300 dark:border-stone-700 p-6 text-center space-y-2">
                    <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                      আপনার অ্যাকাউন্ট থেকে এখনো কোনো গল্প বা কনফেশন পাঠানো হয়নি।
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      আপনার মনের না বলা কথা, ক্রাশ কনফেশন বা ভালোবাসার গল্প লিখে পাঠিয়ে দিন।
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        setIsSubmitModalOpen(true);
                      }}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#80131E] text-white text-xs font-bold cursor-pointer hover:bg-[#630d16]"
                    >
                      লেখা শুরু করুন
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userStories.map((story) => {
                      const isPublished = story.status === "published";
                      return (
                        <div
                          key={story.id}
                          className="rounded-2xl bg-[#FDF8F2] dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-4 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-[#80131E] dark:text-rose-400">
                              #{story.id} • {story.category}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                                isPublished
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                              }`}
                            >
                              {isPublished
                                ? "প্রকাশিত হয়েছে"
                                : "অপেক্ষমাণ (রিভিউ চলছে)"}
                            </span>
                          </div>

                          <h6 className="text-sm font-extrabold text-[#142230] dark:text-white">
                            {story.title}
                          </h6>

                          {story.adminNote && (
                            <div className="rounded-xl bg-[#FAF4E6] dark:bg-[#1A2234] border border-[#C59B27]/45 dark:border-[#C59B27]/30 p-3 text-xs text-stone-700 dark:text-stone-300">
                              <strong className="text-[#80131E] dark:text-rose-400 block mb-0.5">
                                অনুভূতি টিমের পরামর্শ:
                              </strong>
                              {story.adminNote}
                            </div>
                          )}

                          {isPublished && story.slug && (
                            <div className="pt-1 flex items-center justify-between text-xs">
                              <span className="text-stone-500 dark:text-stone-400 font-semibold">
                                পছন্দ: {story.likesCount || 1} • পাঠক:{" "}
                                {(story.viewsCount || 10).toLocaleString()}
                              </span>
                              <Link
                                href={`/blog/${story.slug}`}
                                onClick={() => setIsProfileModalOpen(false)}
                                className="inline-flex items-center gap-1 font-extrabold text-[#80131E] dark:text-rose-400 hover:underline"
                              >
                                <span>লেখাটি দেখুন</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111827] py-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2 py-0.5 rounded-lg shadow-2xs border border-stone-200/80 dark:border-white/20 inline-flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Onuvuti-Publications-Logo.png"
                alt="Onuvuti Publications"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
            <span>© ২০২৬ অনুভূতি (Onuvuti.site)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="hover:text-[#80131E] dark:hover:text-rose-400 font-semibold cursor-pointer"
            >
              গল্প / কনফেশন পাঠান
            </button>
            <Link
              href="/sporsher-byakoron"
              className="text-[#80131E] dark:text-rose-400 font-bold hover:underline"
            >
              স্পর্শের ব্যাকরণ ই-বুক
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
