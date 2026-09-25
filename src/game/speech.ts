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
