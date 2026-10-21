// Meathead 2's save files, the way Meathead 1's work (src/m1/game/save/files.ts): three of them, one blob each
// (meathead2-save-1..3: their own names, never Meathead 1's), JSON with a version number, through the same storage
// interface (m1 save/storage.ts: localStorage in a browser, real files on disk in the desktop build). A file holds
// what's progress: the lands he's cleared (their bosses' weapons, the hour of the day and the hub all follow from that),
// what each cleared land keeps for its revisits (store.ts keepForRevisits); and how long it's been played and when it
// last was. It's saved at the safe points only, as Meathead 1's is: a land cleared (its boss down), and onto the hub
// (App.tsx). Never in the middle of a land. Playing with NO SAVE (or the cheats build) there's no file in use and
// nothing's written. Anything missing, corrupt or from a newer version reads as an empty slot: no crash.

import { storage, readJson, writeJson } from '../m1/game/save/storage';
import { clearedLands, allKept, allBossDeaths, subscribeProgress, type BossDeath } from './store';
import { LANDS } from './hub/lands';

export const SLOTS = [1, 2, 3] as const;
export type Slot = typeof SLOTS[number];
const VERSION = 1;
const keyOf = (slot: Slot) => `meathead2-save-${slot}`;

/** What a run's progress is. */
export interface Progress {
  /** The lands cleared (lands.ts ids), in the order he cleared them. */
  cleared: string[];
  /** What the cleared lands keep for their revisits (store.ts keptForRevisits), by key. */
  kept: Record<string, string>;
  /** How each cleared land's boss died (store.ts bossDeath), by land. Missing in older files: read as the normal death. */
  deaths: Record<string, BossDeath>;
}

export interface SaveFile extends Progress {
  version: number;
  /** How long it's been played (milliseconds). */
  playTimeMs: number;
  /** When it was last played (ms since 1970). */
  lastPlayed: number;
}

const LAND_IDS = LANDS.map(l => l.id);
const num = (v: unknown, d = 0) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : d);

/** A file read back in, kept to what makes sense (null if it isn't one). */
const clean = (raw: unknown): SaveFile | null => {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  // (a file from a newer build than this one: not ours to read; it shows as empty)
  if (typeof o.version !== 'number' || o.version < 1 || o.version > VERSION) return null;
  const cleared = Array.isArray(o.cleared) ? o.cleared.filter((id, i, all): id is string => typeof id === 'string' && LAND_IDS.includes(id) && all.indexOf(id) === i) : [];
  const kept: Record<string, string> = {};
  if (o.kept && typeof o.kept === 'object') for (const [k, v] of Object.entries(o.kept as Record<string, unknown>)) if (typeof v === 'string') kept[k] = v;
  const deaths: Record<string, BossDeath> = {};
  if (o.deaths && typeof o.deaths === 'object') for (const [k, v] of Object.entries(o.deaths as Record<string, unknown>)) if (LAND_IDS.includes(k) && (v === 'normal' || v === 'weakness')) deaths[k] = v;
  return { version: VERSION, cleared, kept, deaths, playTimeMs: num(o.playTimeMs), lastPlayed: num(o.lastPlayed) };
};

// ---- who's listening (the title's CONTINUE, the file select's cards)
let version = 0;
const listeners = new Set<() => void>();
const changed = () => { version++; listeners.forEach(f => f()); };
export const subscribeFiles = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const filesVersion = () => version;

/** What's in a slot (null: empty, or nothing that can be read). */
export const readFile = (slot: Slot): SaveFile | null => clean(readJson(keyOf(slot)));

/** Any file at all to continue. */
export const anyFile = () => SLOTS.some(s => readFile(s));

/** The file played most recently (null: there's none). */
export const latestSlot = (): Slot | null => {
  let best: Slot | null = null, at = -1;
  for (const s of SLOTS) { const f = readFile(s); if (f && f.lastPlayed > at) { best = s; at = f.lastPlayed; } }
  return best;
};

export const deleteFile = (slot: Slot) => {
  storage().remove(keyOf(slot));
  if (active === slot) active = null;
  changed();
};

// ---- the file in use, and its clock
let active: Slot | null = null;
/** Play time on the file before this session's, and this session's so far (counted while the page can be seen). */
let baseMs = 0, sessionMs = 0, runningFrom: number | null = null;
const tick = () => { if (runningFrom !== null) { const now = Date.now(); sessionMs += Math.max(0, now - runningFrom); runningFrom = now; } };
const visible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';
const startClock = () => { runningFrom = visible() ? Date.now() : null; };
const playTime = () => Math.round(baseMs + sessionMs);

/** The file being played (null: none, or NO SAVE). */
export const activeSlot = () => active;

/** Plays on this file (null: NO SAVE, nothing written) from where it's got to: its play time carries on from what's
 *  on it (none, for a new one). */
export const playOnFile = (slot: Slot | null, playTimeMs = 0) => {
  active = slot;
  baseMs = playTimeMs; sessionMs = 0;
  startClock();
};

/** Saves the run's progress (store.ts's, as it is now) to the file in use (nothing, playing with NO SAVE). */
export const saveProgress = () => {
  if (active === null) return;
  tick();
  const file: SaveFile = { cleared: clearedLands(), kept: allKept(), deaths: allBossDeaths(), version: VERSION, playTimeMs: playTime(), lastPlayed: Date.now() };
  if (writeJson(keyOf(active), file)) changed();
};

/** The time played since the last save, put on the file in use (nothing else: what's on it is what was there at the
 *  last safe point). */
const putTimeOn = () => {
  if (active === null) return;
  tick();
  const f = readFile(active);
  if (f && writeJson(keyOf(active), { ...f, playTimeMs: playTime(), lastPlayed: Date.now() })) changed();
};

/** Done with the file in use (quit to the title, to the desktop): its time played goes on it, and the clock stops. */
export const closeFile = () => {
  putTimeOn();
  active = null; runningFrom = null;
};

// (the clock stops while the page is out of sight; the page closing puts the time played on the file, as quitting does)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (active === null) return;
    if (visible()) startClock(); else { putTimeOn(); runningFrom = null; }
  });
  window.addEventListener('pagehide', putTimeOn);
}

// (a land cleared, its boss down: a safe point, as a boss down is in Meathead 1. Loading a file puts its lands back
// through the same store, which saves what was just read: harmless)
subscribeProgress(() => saveProgress());

/** Play time as the file select shows it: hours and minutes (H:MM). */
export const formatPlayTime = (ms: number) => {
  const mins = Math.floor(ms / 60000);
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
/** When it was last played: OCT 14, 2026 9:42 PM. */
export const formatLastPlayed = (at: number) => {
  if (!at) return '--';
  const d = new Date(at), h = d.getHours();
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
