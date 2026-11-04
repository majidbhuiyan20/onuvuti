"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BLOG_CATEGORIES,
  BlogPost,
  StoryCategory,
} from "@/data/blogData";
import { validateImageUpload } from "@/lib/security";
import { compressImageToDataUrl } from "@/lib/imageCompression";
import {
  GO_API_BASE_URL,
  AppUser,
  BackendPoll,
  BackendQuote,
} from "@/lib/goApi";
import { HomeLeftSidebar, HomeRightSidebar } from "@/components/home/HomeSidebars";
import DailyWellnessCard from "@/components/DailyWellnessCard";

// Modular Feature-First Components
import HomeNavbar from "@/components/home/HomeNavbar";
import HomeHero from "@/components/home/HomeHero";
import EditorsPickCard from "@/components/home/EditorsPickCard";
import HomeFeatureRow from "@/components/home/HomeFeatureRow";
import CategoryGrid from "@/components/home/CategoryGrid";
import StoriesFeed from "@/components/home/StoriesFeed";
import CallToActionBanner from "@/components/home/CallToActionBanner";
import HomeFooter from "@/components/home/HomeFooter";

// Modals
import SubmitStoryModal from "@/components/modals/SubmitStoryModal";
import StoryTrackerModal from "@/components/modals/StoryTrackerModal";
import AuthModal from "@/components/modals/AuthModal";
import ProfileModal from "@/components/modals/ProfileModal";

export default function OnuvutiBlogHomePage() {
  const router = useRouter();

  // Stories & Filtering State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState("সকল গল্প");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  // 100% Backend-Controlled Dynamic Poll & Daily Quote ("আজকের প্রশ্ন" এবং "আজকের না বলা কথা")
  const [activePoll, setActivePoll] = useState<BackendPoll | null>(null);
  const [activeQuote, setActiveQuote] = useState<BackendQuote | null>(null);

  // Navigation State
  const [showNavSearch, setShowNavSearch] = useState(false);

  // My Submissions & Tracking Code State
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
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [storyCategory, setStoryCategory] =
    useState<StoryCategory>("ক্রাশ ও কনফেশন");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [storyImageDataUrl, setStoryImageDataUrl] = useState<string | undefined>(
    undefined
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // 100% Dynamic Data Loading from Go Backend & PostgreSQL
  useEffect(() => {
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

    // Fetch published stories from Go Backend
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
    // Fetch active Reader Poll from Go Backend
    async function loadActivePollFromGo() {
      try {
        const res = await fetch(`${GO_API_BASE_URL}/polls/active`);
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && data.poll) {
            setActivePoll(data.poll);
            return;
          }
        }
        setActivePoll(null);
      } catch {
        setActivePoll(null);
      }
    }

    // Fetch active Daily Quote / Unspoken words from Go Backend
    async function loadActiveQuoteFromGo() {
      try {
        const res = await fetch(`${GO_API_BASE_URL}/quotes/active`);
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && data.quote) {
            setActiveQuote(data.quote);
            return;
          }
        }
        setActiveQuote(null);
      } catch {
        setActiveQuote(null);
      }
    }

    loadStoriesFromGo();
    loadActivePollFromGo();
    loadActiveQuoteFromGo();
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

  // Dynamic Filtering & Pagination
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

  // Top 3 Trending / Most Read Stories from Backend
  const trendingPosts = [...posts]
    .sort(
      (a, b) =>
        (b.viewsCount || b.likesCount * 5) - (a.viewsCount || a.likesCount * 5)
    )
    .slice(0, 3);

  // Top Confessions / Untold Stories for Desktop Right Sidebar
  const confessionPosts = posts
    .filter(
      (p) =>
        p.category === "ক্রাশ ও কনফেশন" ||
        p.category === "না বলা কথা"
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

  const handleSurpriseRandomStory = () => {
    if (posts.length === 0) return;
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    router.push(`/blog/${randomPost.slug}`);
  };

  const handlePollVote = async (optionId: string) => {
    if (!activePoll) return;
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/polls/${encodeURIComponent(activePoll.id)}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data.poll) {
          setActivePoll(data.poll);
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  const handleQuoteReact = async () => {
    if (!activeQuote) return;
    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/quotes/${encodeURIComponent(activeQuote.id)}/react`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && typeof data.reactCount === "number") {
          setActiveQuote((prev) =>
            prev ? { ...prev, reactCount: data.reactCount } : null
          );
        }
      }
    } catch {
      // Ignore network errors
    }
  };

  const handleWriterImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const compressed = await compressImageToDataUrl(file, 1280, 0.82);
      setStoryImageDataUrl(compressed);
    } catch {
      setImageError("ছবিটি প্রসেস করা সম্ভব হয়নি। অন্য ছবি চেষ্টা করুন।");
    } finally {
      e.target.value = "";
    }
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
      imageUrl: storyImageDataUrl,
      websiteUrl,
      userId: currentUser?.id || "",
    };

    try {
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

      if (currentUser && data.story) {
        setUserStories((prev) => [data.story, ...prev]);
      }

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
    if (mySubmittedIds.length === 0) return;

    try {
      const fetchedMap: Record<
        string,
        BlogPost & { status?: string; viewsCount?: number; adminNote?: string }
      > = {};

      await Promise.all(
        mySubmittedIds.map(async (item) => {
          try {
            const res = await fetch(
              `${GO_API_BASE_URL}/stories/${encodeURIComponent(item.id)}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.ok && data.story) {
                fetchedMap[item.id] = data.story;
              }
            } else if (res.status === 404) {
              fetchedMap[item.id] = {
                id: item.id,
                title: item.title,
                category: item.category as StoryCategory,
                slug: "",
                excerpt: "",
                readTimeBn: "",
                dateBn: "",
                author: "",
                likesCount: 0,
                content: [],
                status: "deleted",
              };
            }
          } catch {
            // ignore
          }
        })
      );

      setTrackedStoriesMap((prev) => ({ ...prev, ...fetchedMap }));
    } catch {
      // ignore
    }
  };

  const handleManualTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualTrackError(null);
    setManualTrackedResult(null);

    const cleanCode = manualTrackCode.replace("#", "").trim();
    if (!cleanCode) {
      setManualTrackError("অনুগ্রহ করে একটি সঠিক ট্র্যাকিং কোড দিন।");
      return;
    }

    try {
      const res = await fetch(
        `${GO_API_BASE_URL}/stories/${encodeURIComponent(cleanCode)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.story) {
          setManualTrackedResult(data.story);
          return;
        }
      }
      setManualTrackError(
        `#${cleanCode} কোডের কোনো লেখা পাওয়া যায়নি। কোডটি পুনরায় চেক করুন।`
      );
    } catch {
      setManualTrackError("সার্ভার থেকে তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।");
    }
  };

  const resetModal = () => {
    setSubmittedSuccess(false);
    setSubmitError(null);
    setLastSubmittedTrackingId(null);
    setStoryTitle("");
    setStoryBody("");
    setStoryImageDataUrl(undefined);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] flex flex-col transition-colors duration-200">
      {/* Feature-First Smart Navbar with Previous Original Brand Logo */}
      <HomeNavbar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={setShowSavedOnly}
        setCurrentPage={setCurrentPage}
        mySubmittedCount={mySubmittedIds.length}
        bookmarkedCount={bookmarkedCount}
        currentUser={currentUser}
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
        onOpenTracker={openTrackerModal}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => {
          setAuthMode("login");
          setAuthError(null);
          setIsAuthModalOpen(true);
        }}
        showNavSearch={showNavSearch}
        setShowNavSearch={setShowNavSearch}
      />

      <main className="flex-1 max-w-7xl 2xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Lake Sunset Hero Section */}
        <HomeHero onOpenSubmit={() => setIsSubmitModalOpen(true)} />

        {/* 100% Dynamic Editor's Pick Card (Backend-Driven, Zero Dummy Data) */}
        <EditorsPickCard
          posts={posts}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setShowSavedOnly(false);
            setCurrentPage(1);
          }}
        />

        {/* 3-Column Desktop Content Layout (Sidebars eliminate blank margins on wide screens) */}
        <div className="flex flex-col xl:flex-row items-start justify-center gap-6 xl:gap-8">
          {/* Left Desktop Sticky Sidebar (Chithi Box, Birthday Wish Card, Interactive Poll) */}
          <div className="hidden xl:block">
            <HomeLeftSidebar
              activePoll={activePoll}
              onVotePoll={handlePollVote}
            />
          </div>

          {/* Center Column: Feed, Features, Categories & Stories */}
          <div className="flex-1 min-w-0 max-w-full xl:max-w-[760px] 2xl:max-w-[820px] w-full space-y-8">
            {/* 3-Column Feature Row (Dynamic Quote, Poll, Backend Trending Stories) */}
            <HomeFeatureRow
              posts={posts}
              trendingPosts={trendingPosts}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setShowSavedOnly(false);
                setCurrentPage(1);
              }}
              activePoll={activePoll}
              onVotePoll={handlePollVote}
              activeQuote={activeQuote}
              onReactQuote={handleQuoteReact}
              onOpenSubmit={() => setIsSubmitModalOpen(true)}
            />

            {/* 8 Categories Grid */}
            <CategoryGrid
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setShowSavedOnly(false);
                setCurrentPage(1);
              }}
            />

            {/* Main Stories Feed with Search, Filter Pills & Pagination */}
            <StoriesFeed
              posts={posts}
              filteredPosts={filteredPosts}
              paginatedPosts={paginatedPosts}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              showSavedOnly={showSavedOnly}
              setShowSavedOnly={setShowSavedOnly}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              safePage={safePage}
              bookmarkedCount={bookmarkedCount}
              likedIds={likedIds}
              bookmarkedIds={bookmarkedIds}
              toggleLike={toggleLike}
              toggleBookmark={toggleBookmark}
              onSurpriseRandom={handleSurpriseRandomStory}
              onOpenSubmit={() => setIsSubmitModalOpen(true)}
            />

            {/* Daily Wellness Hub (100% Backend Controlled via Go API & PostgreSQL) */}
            <section id="wellness-hub">
              <DailyWellnessCard />
            </section>

            {/* Call to Action Banner */}
            <CallToActionBanner onOpenSubmit={() => setIsSubmitModalOpen(true)} />
          </div>

          {/* Right Desktop Sticky Sidebar (Confessions, Sporsher Byakoron eBook, Wellness, Categories) */}
          <div className="hidden xl:block">
            <HomeRightSidebar
              confessions={
                confessionPosts.length > 0
                  ? confessionPosts
                  : trendingPosts.slice(0, 3)
              }
              onOpenSubmit={() => setIsSubmitModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* 4-Column Footer with Original Brand Logo & Newsletter */}
      <HomeFooter
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setShowSavedOnly(false);
          setCurrentPage(1);
        }}
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
      />

      {/* Modals */}
      <SubmitStoryModal
        isOpen={isSubmitModalOpen}
        onClose={resetModal}
        currentUser={currentUser}
        senderName={senderName}
        setSenderName={setSenderName}
        isAnonymous={isAnonymous}
        setIsAnonymous={setIsAnonymous}
        storyCategory={storyCategory}
        setStoryCategory={setStoryCategory}
        storyTitle={storyTitle}
        setStoryTitle={setStoryTitle}
        storyBody={storyBody}
        setStoryBody={setStoryBody}
        storyImageDataUrl={storyImageDataUrl}
        setStoryImageDataUrl={setStoryImageDataUrl}
        imageError={imageError}
        websiteUrl={websiteUrl}
        setWebsiteUrl={setWebsiteUrl}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submittedSuccess={submittedSuccess}
        lastSubmittedTrackingId={lastSubmittedTrackingId}
        onSubmit={handleStorySubmit}
        onOpenTracker={openTrackerModal}
        onOpenAuth={() => {
          setIsSubmitModalOpen(false);
          setAuthMode("login");
          setAuthError(null);
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => {
          setIsSubmitModalOpen(false);
          setIsProfileModalOpen(true);
        }}
        onImageChange={handleWriterImageChange}
      />

      <StoryTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        manualTrackCode={manualTrackCode}
        setManualTrackCode={setManualTrackCode}
        manualTrackError={manualTrackError}
        manualTrackedResult={manualTrackedResult}
        onManualTrackSearch={handleManualTrackSearch}
        mySubmittedIds={mySubmittedIds}
        trackedStoriesMap={trackedStoriesMap}
        posts={posts}
        onRemoveSubmission={removeSavedSubmission}
        onClearDeletedSubmissions={clearDeletedSubmissions}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authName={authName}
        setAuthName={setAuthName}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authError={authError}
        setAuthError={setAuthError}
        isAuthLoading={isAuthLoading}
        showGoogleQuickInput={showGoogleQuickInput}
        setShowGoogleQuickInput={setShowGoogleQuickInput}
        googleEmailInput={googleEmailInput}
        setGoogleEmailInput={setGoogleEmailInput}
        googleNameInput={googleNameInput}
        setGoogleNameInput={setGoogleNameInput}
        onManualAuth={handleManualAuth}
        onGoogleAuth={handleGoogleAuth}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        userStories={userStories}
        onLogout={handleLogout}
        onOpenSubmit={() => {
          setIsProfileModalOpen(false);
          setIsSubmitModalOpen(true);
        }}
      />
    </div>
  );
}
