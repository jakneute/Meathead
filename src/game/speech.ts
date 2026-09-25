// Thin wrapper around the browser's speech synthesis, plus the voice for each character.

export interface Voice {
  pitch: number;
  rate: number;
}

export const DEFAULT_VOICE: Voice = { pitch: 1.0, rate: 1.0 };

export const BOSS_VOICES: Record<string, Voice> = {
  'Artie Avalanche': { pitch: 1.6, rate: 0.85 },
  'Victor Volcano': { pitch: 0.7, rate: 0.85 },
  'Ernie Earthquake': { pitch: 0.1, rate: 0.55 },
  'Hector Hurricane': { pitch: 1.2, rate: 1.5 },
  'Drug Trade Dale': { pitch: 1.8, rate: 1.1 },
  'Toxic Tommy': { pitch: 0.4, rate: 0.8 },
  'Blackout Barry': { pitch: 0.9, rate: 1.4 },
  'Oily Oscar': { pitch: 1.3, rate: 0.9 },
};

export const getBossVoice = (bossId: string | null): Voice =>
  (bossId && BOSS_VOICES[bossId]) || DEFAULT_VOICE;

export const MEATHEAD_VOICE: Voice = { pitch: 0.1, rate: 1.2 };
export const MEATHEAD_INTRO_VOICE: Voice = { pitch: 0.1, rate: 1.0 };
export const MEATHEAD_MENU_VOICE: Voice = { pitch: 0.1, rate: 1.1 };

/**
 * Every spoken line goes on its own cooldown so the same line can't repeat in
 * quick succession. If every line in a pool is still cooling down, nothing plays.
 */
export const LINE_REPEAT_COOLDOWN_MS = 45_000;
const lastSaidAt = new Map<string, number>();

const isFresh = (line: string, now: number) => now - (lastSaidAt.get(line) ?? -Infinity) >= LINE_REPEAT_COOLDOWN_MS;

/** Picks a random line that hasn't been said recently and marks it as said. Null if none are available. */
export const takeFreshLine = (lines: readonly string[]): string | null => {
  const now = Date.now();
  const fresh = lines.filter(l => isFresh(l, now));
  if (fresh.length === 0) return null;
  const line = fresh[Math.floor(Math.random() * fresh.length)];
  lastSaidAt.set(line, now);
  return line;
};

/** Forget which lines were said recently (on death, respawn and starting a stage). */
export const resetLineCooldowns = () => lastSaidAt.clear();

/** Claims one specific line. False if it was said too recently. */
export const claimLine = (line: string): boolean => takeFreshLine([line]) !== null;

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export const isSpeaking = () => canSpeak() && window.speechSynthesis.speaking;

export const cancelSpeech = () => {
  if (canSpeak()) window.speechSynthesis.cancel();
};

interface SpeakOptions {
  onStart?: () => void;
  /** Called when the line finishes or fails. */
  onDone?: () => void;
}

export const speak = (text: string, voice: Voice, { onStart, onDone }: SpeakOptions = {}) => {
  if (!canSpeak()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = voice.pitch;
  utterance.rate = voice.rate;
  utterance.volume = 1.0;
  if (onStart) utterance.onstart = onStart;
  if (onDone) {
    utterance.onend = onDone;
    utterance.onerror = onDone;
  }
  window.speechSynthesis.speak(utterance);
};
