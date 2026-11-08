"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Sliders,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Send,
  Lock,
  Globe,
  Server,
  Key,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Eye,
  Zap,
  Check,
  Search,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  GO_API_BASE_URL,
  getAdminAuthHeaders,
  MetaPixelConfig,
  MetaEventSummary,
  MetaEventLog,
  MetaPurchaseAnalytics,
} from "@/lib/goApi";

export default function MetaPixelAdminSection() {
  const [subSection, setSubSection] = useState<"config" | "dashboard" | "analytics">("config");

  // Configuration State
  const [config, setConfig] = useState<MetaPixelConfig | null>(null);
  const [pixelIdInput, setPixelIdInput] = useState("4121296221505373");
  const [isEnabled, setIsEnabled] = useState(true);
  const [browserTrackingEnabled, setBrowserTrackingEnabled] = useState(true);
  const [capiEnabled, setCapiEnabled] = useState(true);
  const [testCodeInput, setTestCodeInput] = useState("");
  const [accessTokenInput, setAccessTokenInput] = useState("");
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");

  // Test CAPI State
  const [isTestingCapi, setIsTestingCapi] = useState(false);
  const [testCapiResult, setTestCapiResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Event Monitoring Dashboard State
  const [eventSummaries, setEventSummaries] = useState<MetaEventSummary[]>([]);
  const [eventLogs, setEventLogs] = useState<MetaEventLog[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [logFilterEvent, setLogFilterEvent] = useState<string>("ALL");

  // Purchase Analytics State
  const [purchaseAnalytics, setPurchaseAnalytics] = useState<MetaPurchaseAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // 1. Fetch Configuration
  const fetchConfig = useCallback(async () => {
    setIsLoadingConfig(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/meta/config`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && data.config) {
          setConfig(data.config);
          setPixelIdInput(data.config.pixelId || "4121296221505373");
          setIsEnabled(data.config.isEnabled);
          setBrowserTrackingEnabled(data.config.browserTrackingEnabled);
          setCapiEnabled(data.config.capiEnabled);
          setTestCodeInput(data.config.testEventCode || "");
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  // 2. Fetch Events Dashboard Data
  const fetchEventsDashboard = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/meta/events`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          if (Array.isArray(data.summaries)) {
            setEventSummaries(data.summaries);
          }
          if (Array.isArray(data.logs)) {
            setEventLogs(data.logs);
          }
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // 3. Fetch Purchase Analytics
  const fetchPurchaseAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/meta/analytics`, {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && data.analytics) {
          setPurchaseAnalytics(data.analytics);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConfig();
    fetchEventsDashboard();
    fetchPurchaseAnalytics();
  }, [fetchConfig, fetchEventsDashboard, fetchPurchaseAnalytics]);

  // Handle Save Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setSaveSuccessMsg("");
    setSaveErrorMsg("");

    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/meta/config`, {
        method: "PUT",
        headers: {
          ...getAdminAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pixelId: pixelIdInput.trim() || "4121296221505373",
          isEnabled,
          browserTrackingEnabled,
          capiEnabled,
          testEventCode: testCodeInput.trim(),
          accessToken: accessTokenInput.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data && data.ok) {
        setSaveSuccessMsg("মেটা পিক্সেল ও CAPI কনফিগারেশন সফলভাবে আপডেট হয়েছে।");
        setAccessTokenInput("");
        await fetchConfig();
        setTimeout(() => setSaveSuccessMsg(""), 4000);
      } else {
        setSaveErrorMsg(data?.error || "কনফিগারেশন সংরক্ষণ ব্যর্থ হয়েছে।");
      }
    } catch {
      setSaveErrorMsg("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Handle Test CAPI Event Dispatch
  const handleSendTestCapi = async () => {
    setIsTestingCapi(true);
    setTestCapiResult(null);

    try {
      const res = await fetch(`${GO_API_BASE_URL}/admin/meta/test-capi`, {
        method: "POST",
        headers: {
          ...getAdminAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testEventCode: testCodeInput.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data && data.ok) {
        setTestCapiResult({
          ok: true,
          message: "Meta Events Manager-এ সফলভাবে টেস্ট Purchase ইভেন্ট পাঠানো হয়েছে!",
        });
        await fetchEventsDashboard();
      } else {
        setTestCapiResult({
          ok: false,
          message: data?.error || "টেস্ট ইভেন্ট পাঠানো ব্যর্থ হয়েছে। আপনার Access Token সঠিক কি না যাচাই করুন।",
        });
      }
    } catch {
      setTestCapiResult({
        ok: false,
        message: "সার্ভারের সাথে যোগাযোগ করা যায়নি।",
      });
    } finally {
      setIsTestingCapi(false);
    }
  };

  const currentPixelId = config?.pixelId || pixelIdInput || "4121296221505373";
  const eventsManagerUrl = `https://business.facebook.com/events_manager2/list/dataset/${encodeURIComponent(currentPixelId)}/overview`;
  const testEventsUrl = `https://business.facebook.com/events_manager2/list/dataset/${encodeURIComponent(currentPixelId)}/test_events`;

  // Filter internal event logs
  const filteredLogs = eventLogs.filter((l) => {
    if (logFilterEvent !== "ALL" && l.eventName !== logFilterEvent) return false;
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      l.eventName.toLowerCase().includes(q) ||
      (l.orderId && l.orderId.toLowerCase().includes(q)) ||
      (l.eventId && l.eventId.toLowerCase().includes(q)) ||
      (l.source && l.source.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Breadcrumbs */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
              <span>অ্যাডমিন প্যানেল</span>
              <span>/</span>
              <span>সেটিংস</span>
              <span>/</span>
              <span>মার্কেটিং ও ট্র্যাকিং</span>
              <span>/</span>
              <span className="text-[#80131E] dark:text-rose-400 font-bold">মেটা পিক্সেল</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#142230] dark:text-white flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-[#80131E] dark:text-rose-400" />
              <span>মেটা পিক্সেল ও কনভার্সন ট্র্যাকিং</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              অফিসিয়াল মেটা পিক্সেল ব্রাউজার ইভেন্ট এবং Go ব্যাকএন্ড Conversions API (CAPI) কন্ট্রোল ও রিয়েল-টাইম অ্যানালিটিক্স।
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchConfig();
                fetchEventsDashboard();
                fetchPurchaseAnalytics();
              }}
              disabled={isLoadingConfig || isLoadingEvents || isLoadingAnalytics}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingConfig || isLoadingEvents || isLoadingAnalytics ? "animate-spin" : ""}`} />
              <span>রিফ্রেশ</span>
            </button>

            <a
              href={testEventsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 transition inline-flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>টেস্ট ইভেন্টস পেজ</span>
            </a>

            <a
              href={eventsManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#80131E] hover:bg-[#680f18] text-white transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Meta Events Manager</span>
            </a>
          </div>
        </div>

        {/* Integration Status Badges */}
        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>Dataset: <strong>Onuvuti - Digital Products</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
            <span className="font-mono">ID: {currentPixelId}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold ${
            config?.isEnabled
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
              : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
          }`}>
            <span className={`w-2 h-2 rounded-full ${config?.isEnabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span>{config?.isEnabled ? "পিক্সেল সক্রিয়" : "পিক্সেল নিষ্ক্রিয়"}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>ব্রাউজার ট্র্যাকিং: {config?.browserTrackingEnabled ? "চালু" : "বন্ধ"}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900 font-medium">
            <Server className="w-3.5 h-3.5" />
            <span>Go CAPI সার্ভার: {config?.capiEnabled ? "চালু" : "বন্ধ"}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium" title="আপনার অ্যাডমিন সেশন ও ডেভেলপার আইপি থেকে ভিজিট বা ইভেন্ট ফিল্টার করা হচ্ছে">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ডেভেলপার ফিল্টার: সুরক্ষিত</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Section Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubSection("config")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
            subSection === "config"
              ? "bg-[#80131E] text-white shadow-xs"
              : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>ক. পিক্সেল কনফিগারেশন</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubSection("dashboard");
            fetchEventsDashboard();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
            subSection === "dashboard"
              ? "bg-[#80131E] text-white shadow-xs"
              : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>খ. ইভেন্ট মনিটরিং ড্যাশবোর্ড ({eventSummaries.reduce((a, b) => a + b.count, 0)})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSubSection("analytics");
            fetchPurchaseAnalytics();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition ${
            subSection === "analytics"
              ? "bg-[#80131E] text-white shadow-xs"
              : "bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>গ. পারচেজ অ্যানালিটিক্স ({purchaseAnalytics?.totalVerifiedPurchases || 0})</span>
        </button>
      </div>

      {/* SUB-SECTION A: PIXEL CONFIGURATION */}
      {subSection === "config" && (
        <div className="space-y-6">
          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {saveErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{saveErrorMsg}</span>
            </div>
          )}

          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-[#142230] dark:text-white mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
              <span>পিক্সেল সেটিংস ও Conversions API কনফিগারেশন</span>
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              {/* Pixel ID */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                  মেটা পিক্সেল আইডি (Meta Pixel ID)
                </label>
                <input
                  type="text"
                  value={pixelIdInput}
                  onChange={(e) => setPixelIdInput(e.target.value)}
                  placeholder="4121296221505373"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#161E2E] text-stone-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#80131E]"
                  required
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  আপনার মেটা ডেটাসেট (Onuvuti - Digital Products)-এর পিক্সেল আইডি।
                </p>
              </div>

              {/* Master & Feature Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {/* Master Toggle */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#161E2E]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">মেটা পিক্সেল মাস্টার সুইচ</span>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#80131E] rounded cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    সম্পূর্ণ মেটা পিক্সেল ও ট্র্যাকিং সিস্টেম চালু বা বন্ধ করুন।
                  </p>
                </div>

                {/* Browser Tracking */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#161E2E]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">ব্রাউজার ইভেন্ট ট্র্যাকিং</span>
                    <input
                      type="checkbox"
                      checked={browserTrackingEnabled}
                      onChange={(e) => setBrowserTrackingEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#80131E] rounded cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    ক্লায়েন্ট-সাইড পেজভিউ ও ইন্টার‍্যাকশন মেটা পিক্সেলে পাঠায়।
                  </p>
                </div>

                {/* Server CAPI */}
                <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#161E2E]/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">সার্ভার-সাইড CAPI (Go)</span>
                    <input
                      type="checkbox"
                      checked={capiEnabled}
                      onChange={(e) => setCapiEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#80131E] rounded cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    সফল ZiniPay পেমেন্টের পর Go ব্যাকএন্ড থেকে সরাসরি মেটায় পাঠায়।
                  </p>
                </div>
              </div>

              {/* Server Access Token */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-stone-500" />
                    <span>Conversions API Access Token (সার্ভার এক্সেস টোকেন)</span>
                  </label>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    config?.hasAccessToken
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  }`}>
                    {config?.hasAccessToken ? "টোকেন সংরক্ষিত আছে" : "টোকেন নেই"}
                  </span>
                </div>
                <input
                  type="password"
                  value={accessTokenInput}
                  onChange={(e) => setAccessTokenInput(e.target.value)}
                  placeholder={config?.hasAccessToken ? "•••••••••••••••••••••••• (নতুন টোকেন দিয়ে পরিবর্তন করতে লিখুন)" : "EAA..."}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#161E2E] text-stone-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#80131E]"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  নিরাপত্তা নির্দেশিকা: এই টোকেনটি সার্ভার-সাইড ব্যাকএন্ডে সংরক্ষিত থাকে এবং কখনোই ফ্রন্টএন্ড জাভাস্ক্রিপ্ট বা ব্রাউজারে উন্মুক্ত করা হয় না।
                </p>
              </div>

              {/* Test Event Code */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Meta Test Event Code (ঐচ্ছিক টেস্ট কোড)</span>
                </label>
                <input
                  type="text"
                  value={testCodeInput}
                  onChange={(e) => setTestCodeInput(e.target.value)}
                  placeholder="TEST12345"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#161E2E] text-stone-900 dark:text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-[#80131E]"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Meta Events Manager-এর &apos;Test Events&apos; ট্যাবে যে কোডটি দেখায়, তা এখানে দিলে প্রতিটি CAPI টেস্ট ইভেন্ট রিয়েল-টাইমে মনিটর করা যাবে।
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#80131E] hover:bg-[#680f18] text-white transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSavingConfig ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendTestCapi}
                  disabled={isTestingCapi}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isTestingCapi ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>টেস্ট CAPI ইভেন্ট পাঠান</span>
                </button>
              </div>

              {testCapiResult && (
                <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 border ${
                  testCapiResult.ok
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                }`}>
                  {testCapiResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testCapiResult.message}</span>
                </div>
              )}
            </form>
          </div>

          {/* Architecture & Deduplication Info Card */}
          <div className="rounded-2xl bg-stone-50 dark:bg-[#161E2E] border border-stone-200 dark:border-stone-800 p-5 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#142230] dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ডিডুপ্লিকেশান ও ডাটা প্রাইভেসি সুরক্ষা গ্যারান্টি</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800">
                <span className="font-bold text-stone-800 dark:text-stone-100 block mb-1">
                  ইভেন্ট ডিডুপ্লিকেশান (Deduplication):
                </span>
                ব্রাউজার ও Go CAPI সার্ভার একই deterministic <code>event_id</code> (যেমন: <code>purchase_ONV-12345</code>) ব্যবহার করে। ফলে মেটা কখনোই একটি কেনাকাটাকে দুইবার গণনা করবে না।
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800">
                <span className="font-bold text-stone-800 dark:text-stone-100 block mb-1">
                  SHA-256 ডাটা সিকিউরিটি:
                </span>
                ক্রেতার স্পর্শকাতর তথ্য মেটায় সরাসরি পাঠানো হয় না। ইমেইল ও ফোন নম্বর SHA-256 অ্যালগরিদম দিয়ে হ্যাশ করে নিরাপদে মেটা CAPI-তে প্রেরণ করা হয়।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION B: EVENT MONITORING DASHBOARD */}
      {subSection === "dashboard" && (
        <div className="space-y-6">
          {/* 6 Key Standard Event Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {eventSummaries.map((evt) => (
              <div
                key={evt.eventName}
                className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-[#80131E] dark:text-rose-400">
                      {evt.eventName}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#142230] dark:text-white">
                      {evt.description}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      evt.status === "active"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                        : evt.status === "error"
                        ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {evt.status === "active" ? "সক্রিয়" : evt.status === "error" ? "ত্রুটি" : "স্ট্যান্ডবাই"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-3xl font-black text-[#142230] dark:text-white">
                    {evt.count.toLocaleString("bn-BD")}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    সর্বমোট ইভেন্ট কাউন্ট
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] space-y-1 text-stone-500 dark:text-stone-400">
                  <div className="flex items-center justify-between">
                    <span>ট্র্যাকিং সোর্স:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-200">
                      {evt.source}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>সর্বশেষ ট্রিগার:</span>
                    <span className="font-semibold text-stone-700 dark:text-stone-200">
                      {evt.lastTriggeredAt
                        ? new Date(evt.lastTriggeredAt).toLocaleTimeString("bn-BD", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "এখনো হয়নি"}
                    </span>
                  </div>
                  {evt.recentRef && (
                    <div className="flex items-center justify-between">
                      <span>রেফারেন্স:</span>
                      <span className="font-mono text-stone-600 dark:text-stone-300 truncate max-w-[140px]">
                        {evt.recentRef}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Internal Event Log Stream Table */}
          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#142230] dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#80131E] dark:text-rose-400" />
                  <span>ইন্টারনাল মেটা ইভেন্ট লগ (PostgreSQL Event Logs)</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  সরাসরি ডাটাবেজে রেকর্ডকৃত সর্বশেষ ৫০টি ইভেন্টের রিয়েল-টাইম লগ।
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={logFilterEvent}
                  onChange={(e) => setLogFilterEvent(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#161E2E] text-stone-800 dark:text-stone-200"
                >
                  <option value="ALL">সকল ইভেন্ট</option>
                  <option value="PageView">PageView</option>
                  <option value="ViewContent">ViewContent</option>
                  <option value="InitiateCheckout">InitiateCheckout</option>
                  <option value="Purchase">Purchase</option>
                  <option value="CompleteRegistration">CompleteRegistration</option>
                  <option value="Lead">Lead</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="অর্ডার বা ইভেন্ট আইডি খুঁজুন..."
                    className="pl-8 pr-3 py-1.5 rounded-xl text-xs border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#161E2E] text-stone-800 dark:text-stone-200"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-[#161E2E] text-stone-600 dark:text-stone-400 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="px-4 py-3">ইভেন্ট</th>
                    <th className="px-4 py-3">সোর্স</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3">রেফারেন্স / অর্ডার</th>
                    <th className="px-4 py-3">মূল্য</th>
                    <th className="px-4 py-3">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                        কোনো ইভেন্ট লগ পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-[#161E2E]/50">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-stone-900 dark:text-white">
                            {log.eventName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.source === "server"
                              ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                              : "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                          }`}>
                            {log.source === "server" ? "Go CAPI" : "Browser"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === "sent"
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : log.status === "failed"
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-600 dark:text-stone-400">
                          {log.orderId || log.eventId || "—"}
                        </td>
                        <td className="px-4 py-3 font-bold text-stone-800 dark:text-stone-200">
                          {log.valueBdt > 0 ? `৳${log.valueBdt}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString("bn-BD")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION C: PURCHASE ANALYTICS */}
      {subSection === "analytics" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">ভেরিফাইড পারচেজ</span>
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {(purchaseAnalytics?.totalVerifiedPurchases || 0).toLocaleString("bn-BD")}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">শুধুমাত্র সফলভাবে পেইড ও ভেরিফাইড</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">মোট পারচেজ রেভিনিউ</span>
                <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#80131E] dark:text-rose-400">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-[#142230] dark:text-white">
                ৳{(purchaseAnalytics?.totalRevenueBdt || 0).toLocaleString("bn-BD")}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">মুদ্রা: BDT (বাংলাদেশী টাকা)</p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">মেটা CAPI ডেলিভারি</span>
                <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Server className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {(purchaseAnalytics?.deliveryStatus?.serverSentCount || 0).toLocaleString("bn-BD")}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                {purchaseAnalytics?.deliveryStatus?.deliveryPercentage?.toFixed(0) || 0}% ডেলিভারি রেট
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">ডিডুপ্লিকেটেড পারচেজ</span>
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {(purchaseAnalytics?.deliveryStatus?.deduplicatedCount || 0).toLocaleString("bn-BD")}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">ব্রাউজার ও সার্ভার উভয় সূত্রে নিশ্চিত</p>
            </div>
          </div>

          {/* eBook-wise Sales & Meta Delivery Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* eBook-wise Sales Breakdown */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-[#142230] dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                <span>ই-বুক অনুযায়ী বিক্রয় (eBook-wise Sales)</span>
              </h3>
              <div className="space-y-3">
                {purchaseAnalytics?.ebookSales?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-stone-50 dark:bg-[#161E2E] border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        বিক্রিত কপি: <strong>{item.unitsSold.toLocaleString("bn-BD")} কপি</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-[#80131E] dark:text-rose-400">
                        ৳{item.revenueBdt.toLocaleString("bn-BD")}
                      </div>
                      <span className="text-[10px] text-stone-400">মোট বিক্রয়মূল্য</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Delivery Summary Progress */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-[#142230] dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>মেটা পারচেজ ডেলিভারি স্ট্যাটাস</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-300">সার্ভার CAPI ডেলিভারি রেট</span>
                  <span className="font-bold text-stone-900 dark:text-white">
                    {purchaseAnalytics?.deliveryStatus?.deliveryPercentage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#80131E] to-purple-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        purchaseAnalytics?.deliveryStatus?.deliveryPercentage || 0
                      )}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#161E2E] border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 block text-[11px]">সার্ভার ডেলিভারি</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {purchaseAnalytics?.deliveryStatus?.serverSentCount || 0} টি
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#161E2E] border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 block text-[11px]">ব্রাউজার পিক্সেল</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {purchaseAnalytics?.deliveryStatus?.browserSentCount || 0} টি
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily & Monthly Sales Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Sales (Last 14 Days) */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-[#142230] dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>দৈনিক বিক্রয় সামারি (বিগত ১৪ দিন)</span>
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {(!purchaseAnalytics?.dailySales || purchaseAnalytics.dailySales.length === 0) ? (
                  <p className="text-xs text-stone-400 py-4 text-center">কোনো দৈনিক ডাটা নেই।</p>
                ) : (
                  purchaseAnalytics.dailySales.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-[#161E2E] text-xs"
                    >
                      <span className="font-mono text-stone-700 dark:text-stone-300">{d.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500 font-semibold">{d.purchasesCount} অর্ডার</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{d.revenueBdt.toLocaleString("bn-BD")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Monthly Sales (Last 12 Months) */}
            <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-[#142230] dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
                <span>মাসিক বিক্রয় সামারি (বিগত ১২ মাস)</span>
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {(!purchaseAnalytics?.monthlySales || purchaseAnalytics.monthlySales.length === 0) ? (
                  <p className="text-xs text-stone-400 py-4 text-center">কোনো মাসিক ডাটা নেই।</p>
                ) : (
                  purchaseAnalytics.monthlySales.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-[#161E2E] text-xs"
                    >
                      <span className="font-mono text-stone-700 dark:text-stone-300">{m.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500 font-semibold">{m.purchasesCount} অর্ডার</span>
                        <span className="font-bold text-[#80131E] dark:text-rose-400">
                          ৳{m.revenueBdt.toLocaleString("bn-BD")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Purchases with Meta CAPI Delivery Status Table */}
          <div className="rounded-2xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-[#142230] dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#80131E] dark:text-rose-400" />
              <span>সাম্প্রতিক ভেরিফাইড অর্ডার ও মেটা পারচেজ ডেলিভারি হিস্টোরি</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-[#161E2E] text-stone-600 dark:text-stone-400 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="px-4 py-3">অর্ডার আইডি</th>
                    <th className="px-4 py-3">ক্রেতার নাম</th>
                    <th className="px-4 py-3">মূল্য</th>
                    <th className="px-4 py-3">ব্রাউজার পিক্সেল</th>
                    <th className="px-4 py-3">Go CAPI সার্ভার</th>
                    <th className="px-4 py-3">ভেরিফিকেশনের সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {(!purchaseAnalytics?.recentPurchases || purchaseAnalytics.recentPurchases.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                        কোনো ভেরিফাইড পারচেজ রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    purchaseAnalytics.recentPurchases.map((p) => (
                      <tr key={p.orderId} className="hover:bg-stone-50/50 dark:hover:bg-[#161E2E]/50">
                        <td className="px-4 py-3 font-mono font-bold text-stone-900 dark:text-white">
                          {p.orderId}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                          {p.customerName || "সম্মানিত পাঠক"}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{p.amountBdt}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.browserSent
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                          }`}>
                            {p.browserSent ? "ট্র্যাকড (Sent)" : "পেন্ডিং"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.serverSent || p.serverStatus === "sent"
                              ? "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                              : p.serverStatus === "failed"
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                          }`}>
                            {p.serverSent || p.serverStatus === "sent"
                              ? "ডেলিভার্ড (Sent)"
                              : p.serverStatus === "failed"
                              ? "ব্যর্থ (Failed)"
                              : "পেন্ডিং (Pending)"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                          {new Date(p.verifiedAt).toLocaleString("bn-BD")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
