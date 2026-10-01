import { hasClip, playClip, voicesLoaded, sentenceTimes, ClipHandle } from './voiceclips';
// Who's talking, and when: every line goes through here. A line that's been recorded (voiceclips.ts: every character
// has their own voice) plays that; anything that hasn't falls back to the browser's own speech.

export interface Voice {
  /** Who it is (the recorded lines are filed under this: see voiceclips.ts). */
  id: string;
  /** For the browser's own speech, when a line hasn't been recorded. */
  pitch: number;
  rate: number;
}

export const DEFAULT_VOICE: Voice = { id: 'default', pitch: 1.0, rate: 1.0 };

export const BOSS_VOICES: Record<string, Voice> = {
  'Artie Avalanche': { id: 'boss.artie', pitch: 1.6, rate: 0.85 },
  'Victor Volcano': { id: 'boss.victor', pitch: 0.7, rate: 0.85 },
  'Ernie Earthquake': { id: 'boss.ernie', pitch: 0.1, rate: 0.55 },
  'Hector Hurricane': { id: 'boss.hector', pitch: 1.2, rate: 1.5 },
  'Drug Trade Dale': { id: 'boss.dale', pitch: 1.8, rate: 1.1 },
  'Toxic Tommy': { id: 'boss.tommy', pitch: 0.4, rate: 0.8 },
  'Blackout Barry': { id: 'boss.barry', pitch: 0.9, rate: 1.4 },
  'Oily Oscar': { id: 'boss.oscar', pitch: 1.3, rate: 0.9 },
};

export const getBossVoice = (bossId: string | null): Voice =>
  (bossId && BOSS_VOICES[bossId]) || DEFAULT_VOICE;

export const MEATHEAD_VOICE: Voice = { id: 'meathead', pitch: 0.1, rate: 1.2 };
export const MEATHEAD_INTRO_VOICE: Voice = { id: 'meathead', pitch: 0.1, rate: 1.0 };
export const MEATHEAD_MENU_VOICE: Voice = { id: 'meathead', pitch: 0.1, rate: 1.1 };

/**
 * Every spoken line goes on its own cooldown so the same line can't repeat in
 * quick succession. If every line in a pool is still cooling down, nothing plays.
 */
export const LINE_REPEAT_COOLDOWN_MS = 45_000;
const lastSaidAt = new Map<string, number>();

const isFresh = (line: string, now: number) => now - (lastSaidAt.get(line) ?? -Infinity) >= LINE_REPEAT_COOLDOWN_MS;

/** Picks a random line that hasn't been said recently (without claiming it). Null if none are available. */
export const pickFreshLine = (lines: readonly string[]): string | null => {
  const now = Date.now();
  const fresh = lines.filter(l => isFresh(l, now));
  return fresh.length ? fresh[Math.floor(Math.random() * fresh.length)] : null;
};

/** Picks a random line that hasn't been said recently and marks it as said. Null if none are available. */
export const takeFreshLine = (lines: readonly string[]): string | null => {
  const line = pickFreshLine(lines);
  if (line) lastSaidAt.set(line, Date.now());
  return line;
};

// ---------------------------------------------------------------------------
// The words over their heads, a sentence at a time: a line of several sentences shows the one being said, and
// changes when the next one starts (from the recording's own timing; with no recording, a reading pace).
// ---------------------------------------------------------------------------

/** A line's sentences (a bit of punctuation on its own, "...", stays with its neighbor). */
export const splitSentences = (text: string): string[] => {
  const out: string[] = [];
  for (const p of text.trim().split(/(?<=[.!?])\s+/)) {
    if (out.length && (!/[A-Za-z0-9]/.test(p) || !/[A-Za-z0-9]/.test(out[out.length - 1]))) out[out.length - 1] += ' ' + p;
    else out.push(p);
  }
  return out;
};
/** When each line was last started, and when its sentences after the first come in (ms from the start). */
const timings = new Map<string, { at: number; starts: number[] }>();
const readingStarts = (parts: string[]) => {
  const out: number[] = [];
  let t = 0;
  for (let i = 0; i < parts.length - 1; i++) { t += 700 + parts[i].length * 55; out.push(t); }
  return out;
};
const noteStart = (voice: Voice, text: string, spoken: boolean) => {
  const parts = splitSentences(text);
  if (parts.length < 2) return;
  const starts = spoken ? sentenceTimes(voice.id, text) : [];
  timings.set(text, { at: Date.now(), starts: starts.length === parts.length - 1 ? starts : readingStarts(parts) });
};
/** What to show over someone's head for this line right now: the sentence being said. */
export const sentenceShown = (text: string): string => {
  if (!text) return text;
  const parts = splitSentences(text);
  if (parts.length < 2) return text;
  const rec = timings.get(text);
  if (!rec) return parts[0];
  const el = Date.now() - rec.at;
  let i = 0;
  while (i < rec.starts.length && el >= rec.starts[i]) i++;
  return parts[i];
};

/** Forget which lines were said recently (on death, respawn and starting a stage). */
export const resetLineCooldowns = () => lastSaidAt.clear();

/** The browser's own speech is there (the fallback). */
const synthOK = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
/** Anything can be said out loud: the recordings, or the browser's speech. */
export const canSpeak = () => voicesLoaded() || synthOK();

/** Lines asked for that haven't been recorded (for finding gaps: `window.__voiceMisses`). */
const misses = new Set<string>();
const noteMiss = (voice: Voice, text: string) => {
  const k = `${voice.id}|${text.trim()}`;
  if (misses.has(k)) return;
  misses.add(k);
  if (typeof window !== 'undefined') (window as unknown as { __voiceMisses?: string[] }).__voiceMisses = [...misses];
};

/** Is anyone talking? (Also clears out a line whose end the browser never reported, so nobody's muted for good.) */
export const isSpeaking = () => busy();

/** Recorded lines playing outside the dialogue queue (the menus, the cutscenes' radio). */
let outside = 0;
/** One of those over: whoever was waiting on it goes. */
const afterOutside = () => { if (outside === 0 && !current) playNext(); };
/**
 * For a cutscene run on a frame clock: at one of its `holds` (frames), it doesn't go on till whoever's talking has
 * finished, and a breath after (so nobody talks over anybody, unless the scene means them to). Returns whether the
 * clock can tick. `quiet` is the scene's own count of frames it's been quiet for.
 */
export const holdForSpeech = (t: number, holds: ReadonlySet<number>, quiet: { n: number }, breath = 12) => {
  quiet.n = isTalking() ? 0 : quiet.n + 1;
  return !holds.has(t) || quiet.n >= breath;
};

/** Is anyone talking, or waiting their turn to? */
export const isTalking = () => busy() || queue.length > 0 || outside > 0;

// ---------------------------------------------------------------------------
// In-game dialogue: one voice at a time, and the text over a character's head
// only ever shows the line that's actually being spoken.
// ---------------------------------------------------------------------------

/**
 * - 'urgent': cuts off whatever's playing (Meathead dying).
 * - 'queue': waits its turn if someone's talking (boss health callouts, big moments).
 * - 'casual': dropped if someone's talking (weapon taunts, hurt and kill lines).
 */
export type SpeechPriority = 'urgent' | 'queue' | 'casual';

export interface LineHooks {
  /** The line started. `spoken` is false when there's no speech (show the text for a fixed time). */
  onShow: (spoken: boolean) => void;
  /** The line finished or was cut off: take the text down. */
  onHide: () => void;
  /** Called once the line is over or cut off (not for queued lines that went stale unsaid). */
  onDone?: () => void;
  /** Said however recently it was last said (a scene's own line, every time the scene plays). */
  always?: boolean;
}

interface Line extends LineHooks { text: string; voice: Voice; queuedAt: number; casual?: boolean }
interface Playing extends Line {
  startedAt: number;
  started: boolean;
  /** Held on to: Chrome can garbage-collect an utterance mid-line and never report its end. */
  utterance?: SpeechSynthesisUtterance;
  /** A recorded line playing. */
  clip?: ClipHandle | null;
  /** When to give up waiting for the browser to say it's finished. */
  deadline: number;
}

const MAX_QUEUE = 3;
const STALE_MS = 6000;       // a queued line this old isn't worth saying any more
const NO_START_MS = 1500;    // speech that hasn't started by now isn't going to
const WATCHDOG_MS = 15000;   // a line can't hold the floor longer than this
/** Roughly how long a line takes to say, plus slack: past this, its end event was lost. */
const expectedMs = (line: Line) => Math.min(WATCHDOG_MS, 4000 + (line.text.length * 110) / Math.max(0.3, line.voice.rate));
/** The browser's speech engine claiming to be busy with nothing of ours playing: stuck, after this long. */
const ENGINE_STUCK_MS = 12000;
let engineBusySince = 0;

let current: Playing | null = null;
/** When Meathead and the announcer last finished a line: each gives the other a moment's space after (KILL_VOICE_GAP_MS). */
let meatheadDoneAt = -Infinity, announcerDoneAt = -Infinity;
const KILL_VOICE_GAP_MS = 1200;
/** Recorded lines playing outside the queue (so they can be cut). */
const outsideClips = new Set<ClipHandle>();
/** A boss going down: whatever he was in the middle of saying (or waiting to say) is cut off. */
export const cutBossLines = () => cutVoice('boss.');

/** Someone killed mid-sentence (voices whose id starts `prefix`): what they were saying, and had waiting, is cut off. */
export const cutVoice = (prefix: string) => {
  queue = queue.filter(l => !l.voice.id.startsWith(prefix));
  if (current && current.voice.id.startsWith(prefix)) {
    const c = current;
    current = null;
    c.clip?.stop();
    if (synthOK() && c.utterance) window.speechSynthesis.cancel();
    c.onHide(); c.onDone?.();
    playNext();
  }
};
/** Everybody quiet, now: the line on, anything waiting, anything playing outside the queue (not the death announcer). */
export const silenceAll = () => {
  cancelSpeech();
  for (const c of [...outsideClips]) c.stop();
  outsideClips.clear();
  if (synthOK()) window.speechSynthesis.cancel();
};
/** Has the announcer only just stopped (so Meathead holds off a moment)? */
export const announcerJustSpoke = () => Date.now() - announcerDoneAt < KILL_VOICE_GAP_MS;
let queue: Line[] = [];

const finish = (line: Playing) => {
  if (current !== line) return;
  current = null;
  if (line.voice.id === 'meathead') meatheadDoneAt = Date.now();
  line.onHide();
  line.onDone?.();
  playNext();
};

const playNext = () => {
  while (queue.length > 0) {
    const line = queue.shift()!;
    if (Date.now() - line.queuedAt > STALE_MS) continue;
    start(line);
    return;
  }
};

const start = (line: Line) => {
  lastSaidAt.set(line.text, Date.now());
  // Recorded: play that
  if (hasClip(line.voice.id, line.text)) {
    const playing: Playing = { ...line, startedAt: Date.now(), started: false, deadline: Date.now() + WATCHDOG_MS };
    current = playing;
    playing.clip = playClip(line.voice.id, line.text, {
      onStart: ms => {
        if (current !== playing) return;
        playing.started = true;
        playing.deadline = Date.now() + ms + 1500;
        noteStart(line.voice, line.text, true);
        line.onShow(true);
      },
      onEnd: () => {
        if (current !== playing) return;
        // (never got going: the words go up for their usual time instead)
        if (!playing.started) { current = null; line.onShow(false); line.onDone?.(); playNext(); return; }
        finish(playing);
      },
    });
    return;
  }
  noteMiss(line.voice, line.text);
  noteStart(line.voice, line.text, false);
  if (!synthOK()) {
    // No speech available: just show the text for its usual time
    line.onShow(false);
    line.onDone?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(line.text);
  const playing: Playing = { ...line, startedAt: Date.now(), started: false, utterance, deadline: Date.now() + expectedMs(line) };
  current = playing;
  utterance.pitch = line.voice.pitch;
  utterance.rate = line.voice.rate;
  utterance.volume = 1.0;
  utterance.onstart = () => {
    if (current !== playing) return;
    playing.started = true;
    line.onShow(true);
  };
  utterance.onend = () => finish(playing);
  utterance.onerror = () => finish(playing);
  window.speechSynthesis.speak(utterance);
  // Speech that never starts (no voices, blocked audio): fall back to timed text and move on
  setTimeout(() => {
    if (current !== playing || playing.started) return;
    current = null;
    window.speechSynthesis.cancel();
    line.onShow(false);
    line.onDone?.();
    playNext();
  }, NO_START_MS);
};

const busy = () => {
  const now = Date.now();
  if (current && now > current.deadline) {
    // Its end never came (a lost event): call it done, and make sure the engine's really quiet
    const stale = current;
    stale.clip?.stop();
    if (synthOK()) window.speechSynthesis.cancel();
    finish(stale);
  }
  if (current) { engineBusySince = 0; return true; }
  if (!synthOK() || !window.speechSynthesis.speaking) { engineBusySince = 0; return false; }
  // The engine says it's talking but nothing of ours is: a menu line, or it's wedged
  if (!engineBusySince) engineBusySince = now;
  if (now - engineBusySince > ENGINE_STUCK_MS) { window.speechSynthesis.cancel(); engineBusySince = 0; return false; }
  return true;
};

/**
 * Says a line if the rules allow it. Returns false if it was dropped (someone's
 * talking, or it was said too recently), in which case nothing is shown either.
 */
export const say = (text: string, voice: Voice, priority: SpeechPriority, hooks: LineHooks): boolean => {
  if (!hooks.always && !isFresh(text, Date.now())) return false;
  const line: Line = { text, voice, queuedAt: Date.now(), casual: priority === 'casual', ...hooks };
  if (priority === 'urgent') {
    cancelSpeech();
    start(line);
    return true;
  }
  // (a recorded line playing outside the queue, the announcer or a radio, has the floor too: nobody starts over it)
  if (!busy() && queue.length === 0 && outside === 0) {
    start(line);
    return true;
  }
  if (priority === 'queue' && queue.length < MAX_QUEUE && !queue.some(q => q.text === text)) {
    queue.push(line);
    return true;
  }
  return false;
};

/** Stops all dialogue: the current line (its text comes down) and anything queued. */
export const cancelSpeech = () => {
  const playing = current;
  current = null;
  queue = [];
  playing?.clip?.stop();
  if (synthOK()) window.speechSynthesis.cancel();
  if (playing) {
    playing.onHide();
    playing.onDone?.();
  }
};

interface SpeakOptions {
  onStart?: () => void;
  /** Called when the line finishes or fails. */
  onDone?: () => void;
}

/** Plays a line directly, outside the dialogue rules (menus). */
export const speak = (text: string, voice: Voice, { onStart, onDone }: SpeakOptions = {}) => {
  outside++;
  let out = false;
  const done = () => { if (!out) { out = true; outside--; afterOutside(); } };
  noteStart(voice, text, false);
  const clip = playClip(voice.id, text, { onStart: () => { noteStart(voice, text, true); onStart?.(); }, onEnd: () => { outsideClips.delete(clip!); done(); onDone?.(); } });
  if (clip) { outsideClips.add(clip); return; }
  done();
  noteMiss(voice, text);
  if (!synthOK()) return;
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

/**
 * A line said through a voice modulator: each sentence at a slightly different pitch and speed, so it steps and
 * wobbles like a scrambled radio voice (sentences run whole, so it never stops mid-sentence; the only breaks are
 * where a sentence would end anyway). Calls onDone when it's all out (or fails). Returns a cancel.
 */
export const sayModulated = (text: string, voice: Voice, onDone: () => void): (() => void) => {
  cancelSpeech();
  // Recorded: through the radio
  let finished = false;
  outside++;
  let out = false;
  const done = () => { if (!out) { out = true; outside--; afterOutside(); } };
  const clip = playClip(voice.id, text, { radio: true, onEnd: () => { done(); if (!finished) { finished = true; onDone(); } } });
  if (clip) return () => { finished = true; clip.stop(); done(); };
  done();
  noteMiss(voice, text);
  if (!synthOK()) { onDone(); return () => {}; }
  const chunks = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const WOBBLE = [0, -0.18, 0.12, -0.08, 0.2, -0.14];
  let cancelled = false, left = chunks.length;
  chunks.forEach((c, k) => speak(c, { id: voice.id, pitch: Math.max(0.05, voice.pitch + WOBBLE[k % WOBBLE.length]), rate: voice.rate * (1 + ((k % 3) - 1) * 0.08) }, {
    onDone: () => { left--; if (left === 0 && !cancelled) onDone(); },
  }));
  return () => { cancelled = true; if (synthOK()) window.speechSynthesis.cancel(); };
};

// ---------------------------------------------------------------------------
// The announcer: a big, booming, fighting-game voice calling out the kill callouts (SPLAT! CHIN CHECKED!) now and
// then. Never over anybody's dialogue; it does get to cut in on a kill quip of Meathead's that's only just started
// (the two of them never both go at once).
// ---------------------------------------------------------------------------

export const ANNOUNCER_VOICE: Voice = { id: 'announcer', pitch: 0.5, rate: 0.9 };
/** How often (a chance per callout, unless it's been handed the kill), and never again within this long. */
const ANNOUNCE_CHANCE = 0.35, ANNOUNCE_GAP_MS = 5000;
let lastAnnounced = -Infinity;

/** Maybe calls out a callout. Returns whether it did. */
export const announce = (text: string, chance = ANNOUNCE_CHANCE, always = false): boolean => {
  const now = Date.now();
  if (!always && (Math.random() > chance || now - lastAnnounced < ANNOUNCE_GAP_MS)) return false;
  if (!hasClip(ANNOUNCER_VOICE.id, text)) return false;
  // (never over anybody: if someone's talking, or Meathead's only just finished, it just doesn't happen)
  if (isTalking() || (!always && now - meatheadDoneAt < KILL_VOICE_GAP_MS)) return false;
  lastAnnounced = now;
  announcerDoneAt = now + 3000; // (till it says it's done)
  speak(text, ANNOUNCER_VOICE, { onDone: () => { announcerDoneAt = Date.now(); } });
  return true;
};

// ---------------------------------------------------------------------------
// The death announcer: when Meathead dies, a deep voice out of the dark reads out what's on the death screen, and a
// vast hall throws it back. Skipping the death screen cuts it off (so it's never over the next try); sit it out and
// it plays out (the screen waits for it).
// ---------------------------------------------------------------------------

export const DEATH_VOICE: Voice = { id: 'death', pitch: 0.3, rate: 0.75 };
/** How long its echoes ring on after the words (ms): the death screen waits that out too. */
const DEATH_TAIL_MS = 1400;
let death: { clip: ClipHandle | null; over: number } | null = null;

/** Reads out the death screen (cutting off whoever was talking). */
export const announceDeath = (text: string) => {
  cancelSpeech();
  stopDeathAnnouncer();
  if (!hasClip(DEATH_VOICE.id, text)) return;
  const me: { clip: ClipHandle | null; over: number } = { clip: null, over: Infinity };
  death = me;
  me.clip = playClip(DEATH_VOICE.id, text, { onEnd: () => { if (death === me) me.over = Date.now() + DEATH_TAIL_MS; } });
  if (!me.clip) death = null;
};

/** Still reading it out (or its echoes still going)? */
export const deathAnnouncing = () => !!death && Date.now() < death.over;

/** Cut it off (the death screen skipped). */
export const stopDeathAnnouncer = () => {
  const d = death;
  death = null;
  d?.clip?.stop();
};
