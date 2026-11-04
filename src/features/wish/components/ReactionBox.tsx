"use client";

import React, { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { wishApi } from "../api";
import { REACTION_EMOJIS } from "../types";

export default function ReactionBox({ wishId, senderName }: { wishId: string; senderName: string }) {
  const [emoji, setEmoji] = useState<string>(REACTION_EMOJIS[0]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setBusy(true);
    setError("");
    const res = await wishApi.react(wishId, emoji, text.trim());
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error);
  };

  if (sent) {
    return (
      <div className="mt-6 w-full max-w-md rounded-3xl bg-emerald-500/15 border border-emerald-400/40 p-5 text-center animate-fade-in-up">
        <Check className="w-6 h-6 text-emerald-300 mx-auto mb-1" />
        <p className="text-sm font-bold text-emerald-200">তোমার রিঅ্যাকশন {senderName}-এর কাছে পৌঁছে গেছে 💌</p>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-5 shadow-xl">
      <h3 className="text-sm font-bold text-white text-center">{senderName}-কে কিছু বলতে চাও?</h3>
      <div className="flex justify-center gap-2 my-3">
        {REACTION_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            aria-label={`রিঅ্যাকশন ${e}`}
            className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition cursor-pointer ${
              emoji === e ? "bg-amber-400/30 ring-2 ring-amber-300 scale-110" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        maxLength={300}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ধন্যবাদ জানাও বা দুটো কথা লেখো (ঐচ্ছিক)..."
        className="w-full px-3.5 py-2.5 rounded-2xl bg-black/30 border border-white/15 text-sm text-white placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400"
      />
      {error && <p className="mt-2 text-xs font-semibold text-rose-300">{error}</p>}
      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="mt-3 w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        <span>পাঠিয়ে দাও</span>
      </button>
    </div>
  );
}

