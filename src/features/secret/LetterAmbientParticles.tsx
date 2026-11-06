"use client";

import React, { useMemo } from "react";

interface Particle {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  duration: number; // sec
  delay: number; // sec
  opacity: number;
}

interface LetterAmbientParticlesProps {
  moodCategory?: string;
}

export default function LetterAmbientParticles({
  moodCategory = "crush",
}: LetterAmbientParticlesProps) {
  // Generate consistent randomized particles
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.floor(Math.random() * 96) + 2,
      y: Math.floor(Math.random() * 92) + 4,
      size: Math.floor(Math.random() * 5) + 3,
      duration: Math.floor(Math.random() * 4) + 3, // 3s - 7s
      delay: parseFloat((Math.random() * 3).toFixed(2)),
      opacity: parseFloat((Math.random() * 0.4 + 0.3).toFixed(2)),
    }));
  }, []);

  const moodColors: Record<string, { bg: string; glow: string }> = {
    crush: {
      bg: "bg-rose-400",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.7)]",
    },
    secret: {
      bg: "bg-indigo-300",
      glow: "shadow-[0_0_12px_rgba(129,140,248,0.7)]",
    },
    confession: {
      bg: "bg-amber-300",
      glow: "shadow-[0_0_12px_rgba(252,211,77,0.7)]",
    },
    appreciation: {
      bg: "bg-emerald-300",
      glow: "shadow-[0_0_12px_rgba(110,231,183,0.7)]",
    },
    bold: {
      bg: "bg-orange-400",
      glow: "shadow-[0_0_12px_rgba(251,146,60,0.7)]",
    },
    birthday: {
      bg: "bg-amber-400",
      glow: "shadow-[0_0_12px_rgba(251,191,36,0.7)]",
    },
  };

  const currentTheme = moodColors[moodCategory] || moodColors.crush;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft atmospheric gradient glow in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-transparent blur-3xl" />

      {/* Floating Stardust Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full ${currentTheme.bg} ${currentTheme.glow} animate-pulse`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

