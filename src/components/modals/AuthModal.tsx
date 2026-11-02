"use client";

import React from "react";
import { X, AlertCircle, User, Mail, Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
  authName: string;
  setAuthName: (val: string) => void;
  authEmail: string;
  setAuthEmail: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isAuthLoading: boolean;
  showGoogleQuickInput: boolean;
  setShowGoogleQuickInput: (show: boolean) => void;
  googleEmailInput: string;
  setGoogleEmailInput: (val: string) => void;
  googleNameInput: string;
  setGoogleNameInput: (val: string) => void;
  onManualAuth: (e: React.FormEvent) => void;
  onGoogleAuth: (emailParam?: string, nameParam?: string) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  isAuthLoading,
  showGoogleQuickInput,
  setShowGoogleQuickInput,
  googleEmailInput,
  setGoogleEmailInput,
  googleNameInput,
  setGoogleNameInput,
  onManualAuth,
  onGoogleAuth,
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#111827] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        <div className="bg-[#FAF4E6] dark:bg-[#161E2E] px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7E151E] dark:text-rose-400">
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
              onClose();
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
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500"
                />
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="আপনার নাম (ঐচ্ছিক)"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500"
                />
                <button
                  type="button"
                  disabled={isAuthLoading || !googleEmailInput.trim()}
                  onClick={() => onGoogleAuth()}
                  className="w-full py-2 rounded-xl bg-[#7E151E] text-white font-bold text-xs hover:bg-[#630d16] disabled:opacity-50 cursor-pointer"
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
                  ? "bg-white dark:bg-[#111827] text-[#7E151E] dark:text-rose-400 shadow-2xs"
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
                  ? "bg-white dark:bg-[#111827] text-[#7E151E] dark:text-rose-400 shadow-2xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
              }`}
            >
              নতুন অ্যাকাউন্ট (রেজিস্টার)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onManualAuth} className="space-y-3 pt-1">
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-[#142230] dark:text-white focus:outline-none focus:border-[#7E151E] dark:focus:border-rose-500 focus:bg-white dark:focus:bg-stone-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3 rounded-xl bg-[#7E151E] text-white font-bold text-xs sm:text-sm hover:bg-[#630d16] disabled:opacity-50 transition cursor-pointer shadow-sm"
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
  );
}
