/**
 * Web Audio Synthesizer for Interactive Letter & Wax Seal Experience
 * Zero network assets, zero latency, purely client-side synthesized.
 */

class LetterSoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx || this.ctx.state === "closed") {
        const AudioCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtor) return null;
        this.ctx = new AudioCtor();
      }
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Wax Seal Breaking: Crisp snap followed by a gentle warm harmonic resonance.
   */
  public playSealBreak() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Initial wax snap / click (brief low-freq burst)
      const oscSnap = ctx.createOscillator();
      const gainSnap = ctx.createGain();
      oscSnap.type = "triangle";
      oscSnap.frequency.setValueAtTime(220, now);
      oscSnap.frequency.exponentialRampToValueAtTime(60, now + 0.05);

      gainSnap.gain.setValueAtTime(0.35, now);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      oscSnap.connect(gainSnap);
      gainSnap.connect(ctx.destination);
      oscSnap.start(now);
      oscSnap.stop(now + 0.07);

      // 2. Sweet crystalline chime harmonic
      const oscChime = ctx.createOscillator();
      const gainChime = ctx.createGain();
      oscChime.type = "sine";
      oscChime.frequency.setValueAtTime(880, now + 0.02); // A5
      oscChime.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6

      gainChime.gain.setValueAtTime(0.001, now);
      gainChime.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gainChime.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      oscChime.connect(gainChime);
      gainChime.connect(ctx.destination);
      oscChime.start(now + 0.02);
      oscChime.stop(now + 0.48);

      // 3. Followed by subtle paper unfolding
      setTimeout(() => this.playPaperRustle(0.12), 60);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Paper Rustle: Soft filtered noise simulating sliding stationery paper.
   */
  public playPaperRustle(volume = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.35;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate brownian/pink noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.3;
        data[i] = (b0 + b1 + b2) * 0.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter for papery crinkle texture
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Letter Sent Dispatch: Ascending joyful 3-note chime with a subtle airy swoosh.
   */
  public playLetterSent() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 triad

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.2, noteStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.5);
      });

      // Soft paper swoosh
      this.playPaperRustle(0.18);
    } catch {
      // Audio fallback
    }
  }

  private lastPenSoundTime = 0;

  /**
   * Subtle soft pen scratch / typewriter tick during letter writing.
   * Throttled to max once every 90ms.
   */
  public playPenScratch() {
    const ctx = this.getContext();
    if (!ctx) return;

    const nowMs = Date.now();
    if (nowMs - this.lastPenSoundTime < 85) return;
    this.lastPenSoundTime = nowMs;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Fallback
    }
  }

  /**
   * Gentle celebration chime when letter finishes writing.
   */
  public playLetterCompleteChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 880, 1046.5]; // E5, A5, C6
      notes.forEach((freq, i) => {
        const t = now + i * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.65);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Mobile haptic vibration helper.
   */
  public triggerHaptic(pattern: number | number[] = [35, 25, 50]) {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored if not permitted by user agent
      }
    }
  }
}

export const letterSound = new LetterSoundManager();

