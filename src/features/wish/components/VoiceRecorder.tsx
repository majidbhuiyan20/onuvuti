"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";
import { blobToDataUrl } from "../media";

const MAX_SECONDS = 30;
const PREFERRED_TYPES = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"];

interface VoiceRecorderProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

export default function VoiceRecorder({ value, onChange }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    },
    []
  );

  const stop = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  };

  const start = async () => {
    setError("");
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("আপনার ব্রাউজারে ভয়েস রেকর্ডিং সাপোর্ট করে না");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 24_000, ...(mimeType ? { mimeType } : {}) });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
        try {
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl.length > 1_400_000) throw new Error("রেকর্ডিং অনেক বড় হয়ে গেছে");
          onChange(dataUrl);
        } catch (e) {
          setError(e instanceof Error ? e.message : "রেকর্ডিং সংরক্ষণ করা যায়নি");
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) stop();
      }, 1000);
    } catch {
      setError("মাইক্রোফোনের অনুমতি পাওয়া যায়নি");
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-2">
          <audio src={value} controls className="h-10 max-w-full" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="ভয়েস মেসেজ সরান"
            className="w-7 h-7 shrink-0 rounded-full bg-rose-600 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : recording ? (
        <button
          type="button"
          onClick={stop}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold animate-pulse cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>
            রেকর্ড হচ্ছে... {seconds}/{MAX_SECONDS} সেকেন্ড (থামাতে ট্যাপ করুন)
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-xs font-bold text-stone-600 dark:text-stone-300 hover:border-[#7E151E] hover:text-[#7E151E] transition cursor-pointer"
        >
          <Mic className="w-4 h-4" />
          <span>নিজের কণ্ঠে ভয়েস মেসেজ রেকর্ড করুন (৩০ সেকেন্ড)</span>
        </button>
      )}
      {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
