// Noises written into a line: "*CRUNCH*. THE DUNGEON." The words between asterisks are shown as they're written, but
// never said: the voice recordings leave them out (tools/voices/voicelib.py strip_cues; a line's sentence that's only a
// noise is recorded as a stretch of quiet that long), and here, as the line's said, each one plays as a real sound at
// its place in the line, through the same chain as the voice saying it (Donnie's *GULP* comes out of the PA horns).

import { getAudioContext } from './audio';
import { playSfx } from './sfx';
import { voiceSfxOut } from './voiceclips';

/** A noise in a line: asterisks round words, not inside a word (so a bleeped "SH*T" isn't one). Same as voicelib.py's. */
export const CUE_RE = /(?<![A-Za-z0-9])\*([A-Za-z][A-Za-z !'-]*)\*(?![A-Za-z0-9])/g;

/** What each noise sounds like: a sound, its volume, its pitch (semitones). A noise not here is still never said (it's
 *  just quiet). */
const SOUNDS: Record<string, { snd: string; vol: number; pitch?: number }> = {
  CRUNCH: { snd: 'bite', vol: 1 },
  CHOMP: { snd: 'bite', vol: 1, pitch: -2 },
  MUNCH: { snd: 'chew', vol: 1 },
  'CHEW CHEW': { snd: 'chew', vol: 1 },
  CHEW: { snd: 'chew', vol: 0.9 },
  SLURP: { snd: 'slurp', vol: 1 },
  GULP: { snd: 'gulp', vol: 1 },
  BURP: { snd: 'burp', vol: 0.8 },
  COUGH: { snd: 'cough', vol: 1 },
};

export const hasCues = (text: string) => { CUE_RE.lastIndex = 0; return CUE_RE.test(text); };

/** Plays one noise, through `voice`'s chain. */
const play = (voice: string, word: string) => {
  const s = SOUNDS[word.trim().toUpperCase()];
  if (!s) return;
  try {
    const c = getAudioContext();
    if (c.state !== 'running') return;
    playSfx(c, s.snd, s.vol, s.pitch ?? 0, voiceSfxOut(c, voice));
  } catch { /* best-effort */ }
};

/**
 * A line's noises, played as it's said: `sentences` the line's sentences as shown, `starts` when each after the first
 * comes in (ms from the start). A noise plays at its sentence's start, and as far into it as it's written. `live()`:
 * still being said (a line cut off plays nothing more); `held()`: the game's paused (it waits).
 */
export const playCues = (voice: string, sentences: string[], starts: number[], live: () => boolean, held: () => boolean) => {
  const at = [0, ...starts];
  sentences.forEach((s, i) => {
    const next = i + 1 < at.length ? at[i + 1] : at[i] + 700 + s.length * 55;
    // (a noise on its own is its sentence's whole time; mixed in with words, it's as far in as it's written)
    const words = s.replace(CUE_RE, '').replace(/[^A-Za-z0-9]/g, '');
    CUE_RE.lastIndex = 0;
    for (let m = CUE_RE.exec(s); m; m = CUE_RE.exec(s)) {
      const k = words.length ? m.index / Math.max(1, s.length) : 0;
      const ms = at[i] + k * (next - at[i]), word = m[1];
      const go = () => { if (!live()) return; if (held()) { setTimeout(go, 100); return; } play(voice, word); };
      if (ms <= 0) go(); else setTimeout(go, ms);
    }
  });
};
