/**
 * Tiny Web Audio synthesizer — no audio files, no network. All tunes are public-domain or original.
 */
import type { WishMusic } from "./types";

type AudioCtor = typeof AudioContext;

let sharedCtx: AudioContext | null = null;

/**
 * Must be called synchronously inside a user gesture (click) so mobile browsers allow sound
 * for everything that happens after an `await`.
 */
export function primeAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor: AudioCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx || sharedCtx.state === "closed") sharedCtx = new Ctor();
  if (sharedCtx.state === "suspended") void sharedCtx.resume();
  return sharedCtx;
}

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

interface Note {
  at: number; // beats from loop start
  midi: number;
  len: number; // beats
}

interface Tune {
  bpm: number;
  wave: OscillatorType;
  volume: number;
  loopBeats: number;
  notes: Note[];
}

/** Builds a monophonic melody from [midi, beats] pairs. */
function melody(pairs: [number, number][]): { notes: Note[]; total: number } {
  let at = 0;
  const notes: Note[] = [];
  for (const [midi, len] of pairs) {
    if (midi > 0) notes.push({ at, midi, len });
    at += len;
  }
  return { notes, total: at };
}

/** Repeating arpeggio over a chord progression. */
function arpeggio(chords: number[][], perChord: number, step: number) {
  const notes: Note[] = [];
  let at = 0;
  for (const chord of chords) {
    for (let i = 0; i < perChord / step; i++) {
      notes.push({ at, midi: chord[i % chord.length], len: step * 1.8 });
      at += step;
    }
  }
  return { notes, total: at };
}

const HAPPY = melody([
  [60, 0.75], [60, 0.25], [62, 1], [60, 1], [65, 1], [64, 2],
  [60, 0.75], [60, 0.25], [62, 1], [60, 1], [67, 1], [65, 2],
  [60, 0.75], [60, 0.25], [72, 1], [69, 1], [65, 1], [64, 1], [62, 1],
  [70, 0.75], [70, 0.25], [69, 1], [65, 1], [67, 1], [65, 2],
  [0, 2],
]);

const ROMANTIC = arpeggio(
  [
    [57, 60, 64, 69], // Am
    [53, 57, 60, 65], // F
    [48, 55, 60, 64], // C
    [55, 59, 62, 67], // G
  ],
  4,
  0.5
);

const LULLABY = arpeggio(
  [
    [60, 64, 67, 72],
    [57, 62, 65, 69],
    [59, 62, 67, 71],
    [60, 64, 67, 72],
  ],
  4,
  0.5
);

const TUNES: Record<Exclude<WishMusic, "none">, Tune> = {
  happy_birthday: { bpm: 112, wave: "triangle", volume: 0.2, loopBeats: HAPPY.total, notes: HAPPY.notes },
  romantic: { bpm: 84, wave: "sine", volume: 0.16, loopBeats: ROMANTIC.total, notes: ROMANTIC.notes },
  lullaby: { bpm: 66, wave: "sine", volume: 0.14, loopBeats: LULLABY.total, notes: LULLABY.notes },
};

export interface MusicHandle {
  stop: () => void;
}

/** Starts a looping tune. Returns a handle to stop it (fades out smoothly). */
export function startMusic(kind: WishMusic): MusicHandle | null {
  if (kind === "none") return null;
  const ctx = primeAudio();
  if (!ctx) return null;

  const tune = TUNES[kind];
  const beat = 60 / tune.bpm;
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  const playLoop = () => {
    if (stopped) return;
    const t0 = ctx.currentTime + 0.08;
    for (const n of tune.notes) {
      const start = t0 + n.at * beat;
      const end = start + n.len * beat;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = tune.wave;
      osc.frequency.value = midiToFreq(n.midi);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(tune.volume, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(end + 0.05);
    }
    timer = setTimeout(playLoop, tune.loopBeats * beat * 1000);
  };
  playLoop();

  return {
    stop: () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.35);
      setTimeout(() => master.disconnect(), 500);
    },
  };
}

/** Short celebratory chime for opening the envelope / blowing the candle. */
export function playChime(type: "open" | "blow") {
  const ctx = primeAudio();
  if (!ctx) return;

  const freqs =
    type === "open" ? [523.25, 659.25, 783.99, 987.77, 1046.5] : [587.33, 739.99, 880.0, 1174.66];
  const gap = type === "open" ? 0.12 : 0.08;
  const wave: OscillatorType = type === "open" ? "sine" : "triangle";
  const peak = type === "open" ? 0.25 : 0.22;
  const decay = type === "open" ? 0.8 : 1.2;

  freqs.forEach((freq, i) => {
    const start = ctx.currentTime + i * gap;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + decay);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + decay + 0.05);
  });
}

