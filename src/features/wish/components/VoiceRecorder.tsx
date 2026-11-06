"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, X, Play, Pause, Upload, RotateCcw, Volume2 } from "lucide-react";
import { blobToDataUrl } from "../media";

const MAX_SECONDS = 60;
const PREFERRED_TYPES = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"];

interface VoiceRecorderProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

export default function VoiceRecorder({ value, onChange }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [tempAudioUrl, setTempAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"record" | "upload">("record");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stop = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    setRecording(false);
  };

  const start = async () => {
    setError("");
    setTempAudioUrl(null);
    setIsPlaying(false);

    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("আপনার ব্রাউজারে ভয়েস রেকর্ডিং সুবিধা সমর্থিত নয়");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = PREFERRED_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, {
        audioBitsPerSecond: 28_000,
        ...(mimeType ? { mimeType } : {}),
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
        try {
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl.length > 1_600_000) {
            throw new Error("রেকর্ডিং সাইজ অনেক বড় হয়ে গেছে, দয়া করে ছোট রেকর্ডিং করুন");
          }
          setTempAudioUrl(dataUrl);
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
        if (elapsed >= MAX_SECONDS) {
          stop();
        }
      }, 1000);
    } catch {
      setError("মাইক্রোফোনের অনুমতি পাওয়া যায়নি। ব্রাউজার সেটিংসে মাইক্রোফোন অ্যালাউ করুন।");
    }
  };

  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("audio/")) {
      setError("শুধু অডিও ফাইল (MP3, M4A, WAV, WebM) নির্বাচন করুন");
      return;
    }
    if (file.size > 1_500_000) {
      setError("অডিও ফাইলটি ১.৫ মেগাবাইটের চেয়ে ছোট হতে হবে");
      return;
    }
    try {
      const dataUrl = await blobToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("অডিও ফাইলটি প্রসেস করা যায়নি");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTogglePlay = () => {
    if (!audioPreviewRef.current) return;
    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode switch pills if no audio yet */}
      {!value && !recording && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800/80 w-fit text-xs font-semibold select-none border border-stone-200 dark:border-stone-700/60">
          <button
            type="button"
            onClick={() => setMode("record")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              mode === "record"
                ? "bg-white dark:bg-[#111827] text-[#7E151E] dark:text-rose-400 shadow-xs font-bold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>মাইক্রোফোনে রেকর্ড</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              mode === "upload"
                ? "bg-white dark:bg-[#111827] text-[#7E151E] dark:text-rose-400 shadow-xs font-bold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>অডিও ফাইল আপলোড</span>
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files?.[0])}
      />

      {/* When audio is present */}
      {value ? (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/40 dark:border-amber-600/30 flex items-center justify-between gap-3 shadow-xs">
          <audio
            ref={audioPreviewRef}
            src={value}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-[#7E151E] text-white flex items-center justify-center shrink-0 shadow-md hover:opacity-95 transition cursor-pointer"
              title={isPlaying ? "বিরতি দিন" : "শুনুন"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="min-w-0">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                <span>আপনার কণ্ঠের বার্তা সফলভাবে যুক্ত হয়েছে</span>
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block truncate">
                চিঠি পড়ার সময় প্রাপক আপনার আসল কণ্ঠ শুনতে পাবেন
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onChange("");
              setTempAudioUrl(null);
            }}
            aria-label="ভয়েস মেসেজ সরান"
            className="w-8 h-8 shrink-0 rounded-full bg-stone-200 dark:bg-stone-700 hover:bg-rose-600 hover:text-white text-stone-600 dark:text-stone-300 flex items-center justify-center transition cursor-pointer"
            title="মুছে নতুন করে রেকর্ড করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : recording ? (
        /* While recording */
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-between gap-3 animate-fade-in shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center animate-pulse">
                <Mic className="w-5 h-5" />
              </div>
              <div className="absolute w-12 h-12 rounded-full border border-rose-500 animate-ping opacity-75" />
            </div>

            <div>
              <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>রেকর্ড হচ্ছে... {seconds} / {MAX_SECONDS} সেকেন্ড</span>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">
                কথা বলা শেষ হলে ডানপাশের বাটনে ট্যাপ করুন
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>থামুন</span>
          </button>
        </div>
      ) : mode === "record" ? (
        /* Initial record button */
        <button
          type="button"
          onClick={start}
          className="w-full sm:w-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-xs font-bold text-stone-700 dark:text-stone-200 hover:border-[#7E151E] hover:text-[#7E151E] dark:hover:border-rose-400 dark:hover:text-rose-300 transition cursor-pointer shadow-xs"
        >
          <div className="w-7 h-7 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block font-bold">নিজের কণ্ঠে ভয়েস বার্তা রেকর্ড করুন</span>
            <span className="text-[10px] text-stone-400 block font-normal">সর্বোচ্চ ৬০ সেকেন্ড • লাইভ ব্রাউজার অডিও</span>
          </div>
        </button>
      ) : (
        /* File upload button */
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-xs font-bold text-stone-700 dark:text-stone-200 hover:border-[#7E151E] hover:text-[#7E151E] dark:hover:border-rose-400 dark:hover:text-rose-300 transition cursor-pointer shadow-xs"
        >
          <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block font-bold">ডিভাইস থেকে অডিও ফাইল সিলেক্ট করুন</span>
            <span className="text-[10px] text-stone-400 block font-normal">MP3, M4A, WAV বা WebM (সর্বোচ্চ ১.৫ MB)</span>
          </div>
        </button>
      )}

      {error && <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
