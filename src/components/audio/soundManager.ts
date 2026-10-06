/** Original UI tones, never game audio. Replace a cue's src centrally later. */
export type SoundCue = "region-hover" | "navigate" | "animal-open" | "grid-hover" | "grid-select";
type Cue = { frequency: number; end: number; duration: number; volume: number; src?: string };
export const SOUND_CUES: Record<SoundCue, Cue> = {
  "region-hover": { frequency: 440, end: 520, duration: 0.055, volume: 0.018 },
  navigate: { frequency: 330, end: 660, duration: 0.11, volume: 0.035 },
  "animal-open": { frequency: 520, end: 780, duration: 0.13, volume: 0.03 },
  "grid-hover": { frequency: 560, end: 560, duration: 0.035, volume: 0.012 },
  "grid-select": { frequency: 660, end: 880, duration: 0.085, volume: 0.025 },
};

const STORAGE_KEY = "disco-zoo:sound-enabled";
let enabled = false;
let interacted = false;
let context: AudioContext | undefined;
let master: GainNode | undefined;
let generation = 0;
let lastPlayed = -Infinity;
const listeners = new Set<() => void>();
const buffers = new Map<string, Promise<AudioBuffer>>();
const emit = () => listeners.forEach((listener) => listener());

function setEnabled(value: boolean, persist = true) {
  enabled = value;
  generation++;
  if (master && context) master.gain.setValueAtTime(value ? 1 : 0, context.currentTime);
  if (!value) pause();
  if (persist) { try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* Storage is optional. */ } }
  emit();
}

async function unlock() {
  // Called only by trusted interaction handlers, never on mount or preference restore.
  interacted = true;
  if (!enabled || typeof window === "undefined" || document.hidden) return;
  try {
    if (!context) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = enabled ? 1 : 0;
      master.connect(context.destination);
    }
    if (context.state === "suspended") await context.resume();
  } catch { /* Unsupported audio must not affect navigation. */ }
}

async function play(cue: SoundCue) {
  if (!enabled || !interacted || !context || !master || context.state !== "running" || document.hidden) return;
  const now = performance.now();
  if (now - lastPlayed < 65) return;
  lastPlayed = now;
  const spec = SOUND_CUES[cue];
  const audioContext = context;
  const output = master;
  const requestGeneration = generation;
  try {
    if (spec.src) {
      let buffer = buffers.get(spec.src);
      if (!buffer) {
        buffer = fetch(spec.src).then((response) => {
          if (!response.ok) throw new Error("Sound unavailable");
          return response.arrayBuffer();
        }).then((data) => audioContext.decodeAudioData(data));
        buffers.set(spec.src, buffer);
      }
      const decoded = await buffer;
      if (!enabled || document.hidden || generation !== requestGeneration || audioContext.state !== "running") return;
      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      source.buffer = decoded;
      gain.gain.value = spec.volume;
      source.connect(gain).connect(output);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start();
      source.stop(audioContext.currentTime + Math.min(decoded.duration, 0.5));
      return;
    }
    const start = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(spec.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(spec.end, start + spec.duration);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(spec.volume, start + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + spec.duration);
    oscillator.connect(envelope).connect(output);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(start);
    oscillator.stop(start + spec.duration + 0.01);
  } catch { /* Missing files or device failures remain silent. */ }
}

function restorePreference() {
  try { setEnabled(localStorage.getItem(STORAGE_KEY) === "true", false); } catch { setEnabled(false, false); }
}

function pause() {
  generation++;
  if (context && context.state === "running") void context.suspend().catch(() => {});
}

export const audio = {
  play, unlock, setEnabled, restorePreference, pause,
  getSnapshot: () => enabled,
  getServerSnapshot: () => false,
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
};
