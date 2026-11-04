"use client";

import React, { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

interface PasscodeFormProps {
  busy: boolean;
  error: string;
  onSubmit: (passcode: string) => void;
  onCancel: () => void;
}

export default function PasscodeForm({ busy, error, onSubmit, onCancel }: PasscodeFormProps) {
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) onSubmit(code.trim());
      }}
      className="w-full max-w-sm mt-6 p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-fade-in-up"
    >
      <div className="flex items-center justify-center gap-2 text-amber-300 text-sm font-bold mb-1">
        <KeyRound className="w-4 h-4" />
        <span>এই চিঠিতে তালা দেওয়া আছে</span>
      </div>
      <p className="text-xs text-stone-300 mb-3">
        প্রেরকের কাছ থেকে পাওয়া সিক্রেট কোডটি লিখুন
      </p>
      <input
        autoFocus
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="সিক্রেট কোড"
        className="w-full px-4 py-2.5 rounded-2xl bg-black/30 border border-white/20 text-white text-center text-sm tracking-widest outline-none focus:ring-2 focus:ring-amber-400"
      />
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-rose-300">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold transition cursor-pointer"
        >
          বাতিল
        </button>
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>খুলুন</span>
        </button>
      </div>
    </form>
  );
}

