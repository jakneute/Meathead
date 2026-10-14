// Meathead 1's save files: three of them, one blob each (meathead-save-1..3, JSON with a version number), through the
// storage interface (./storage) so the Steam build can keep them as real files. A file holds everything that's progress:
// which set he's on and who's dead in it, how each of them died, the guns he's earned, the garage (souvenirs, and the
// difficulties each boss has been cleared on), whether he's ever shit himself (the D.C. file notices), whether he's
// seen THE END; and how long it's been played and when it last was. It's saved at the safe points only (App: a boss
// down, onto the map, into and out of the garage), never in the middle of a stage. Playing with NO SAVE, there's no
// file in use and nothing's written. Anything missing, corrupt or from a newer version reads as an empty slot: no crash.

import { storage, readJson, writeJson } from './storage';
import { cleanGarageState, type GarageState } from '../garage/store';
import { ALL_WEAPONS, STAGES_SET_0, STAGES_SET_1 } from '../../content/roster';
import type { WeaponType } from '../../types';

export const SLOTS = [1, 2, 3] as const;
export type Slot = typeof SLOTS[number];
const VERSION = 1;
const keyOf = (slot: Slot) => `meathead-save-${slot}`;

/** What a run's progress is (App hands it over to be saved, and gets it back to load). */
export interface Progress {
  /** Which set of four he's on (0 the first, 1 the second). */
  rank: number;
  /** Who's dead in the set he's on. */
  defeated: string[];
  /** How each boss died: the weakness weapon that wrecked his corpse, or null for a plain kill. */
  killRecords: Record<string, WeaponType | null>;
  /** Which of them he killed with his pants full. */
  shatKills: Record<string, boolean>;
  /** The guns he's earned (not the cheat's). */
  weapons: WeaponType[];
  garage: GarageState;
  /** He's shit himself, for real, at some point on this file. */
  everShat: boolean;
  /** He's killed the alien: THE END's been seen on this file. */
  beaten: boolean;
}

export interface SaveFile extends Progress {
  version: number;
  /** How long it's been played (milliseconds). */
  playTimeMs: number;
  /** When it was last played (ms since 1970). */
  lastPlayed: number;
}

const BOSSES = [...STAGES_SET_0, ...STAGES_SET_1].map(s => s.id);
const isBoss = (id: unknown): id is string => typeof id === 'string' && BOSSES.includes(id);
const isWeapon = (w: unknown): w is WeaponType => typeof w === 'string' && (ALL_WEAPONS as string[]).includes(w);
const num = (v: unknown, d = 0) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : d);

/** A file read back in, kept to what makes sense (null if it isn't one). */
const clean = (raw: unknown): SaveFile | null => {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  // (a file from a newer build than this one: not ours to read; it shows as empty)
  if (typeof o.version !== 'number' || o.version < 1 || o.version > VERSION) return null;
  const rank = o.rank === 1 ? 1 : 0;
  const set = (rank === 0 ? STAGES_SET_0 : STAGES_SET_1).map(s => s.id);
  const defeated = Array.isArray(o.defeated) ? o.defeated.filter((id, i, all): id is string => typeof id === 'string' && set.includes(id) && all.indexOf(id) === i) : [];
  const killRecords: Record<string, WeaponType | null> = {};
  const shatKills: Record<string, boolean> = {};
  if (o.killRecords && typeof o.killRecords === 'object') {
    for (const [id, w] of Object.entries(o.killRecords as Record<string, unknown>)) if (isBoss(id)) killRecords[id] = isWeapon(w) ? w : null;
  }
  if (o.shatKills && typeof o.shatKills === 'object') {
    for (const [id, s] of Object.entries(o.shatKills as Record<string, unknown>)) if (isBoss(id)) shatKills[id] = s === true;
  }
  return {
    version: VERSION, rank, defeated, killRecords, shatKills,
    weapons: Array.isArray(o.weapons) ? o.weapons.filter(isWeapon) : [],
    garage: cleanGarageState(o.garage),
    everShat: o.everShat === true,
    beaten: o.beaten === true,
    playTimeMs: num(o.playTimeMs),
    lastPlayed: num(o.lastPlayed),
  };
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

/**
 * Plays on this file (null: NO SAVE, nothing written) from where it's got to: its play time carries on from what's
 * on it (none, for a new one).
 */
export const playOnFile = (slot: Slot | null, playTimeMs = 0) => {
  active = slot;
  baseMs = playTimeMs; sessionMs = 0;
  startClock();
};

/** Saves the run's progress to the file in use (nothing, playing with NO SAVE). */
export const saveProgress = (p: Progress) => {
  if (active === null) return;
  tick();
  const file: SaveFile = { ...p, version: VERSION, playTimeMs: playTime(), lastPlayed: Date.now() };
  if (writeJson(keyOf(active), file)) changed();
};

/** The time played since the last save, put on the file in use (nothing else: what's on it is what was there at the last safe point). */
const putTimeOn = () => {
  if (active === null) return;
  tick();
  const f = readFile(active);
  if (f && writeJson(keyOf(active), { ...f, playTimeMs: playTime(), lastPlayed: Date.now() })) changed();
};

/** Done with the file in use (quit to the title, THE END): its time played goes on it, and the clock stops. */
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

// (what earlier builds left in the browser for the garage: never read any more)
storage().remove('meathead-garage');
storage().remove('meathead-clears');

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

/** How many of the eight are dead on a file. */
export const bossesBeaten = (f: Progress) => (f.rank >= 1 ? STAGES_SET_0.length : 0) + f.defeated.length;
/** Is this one dead on a file. */
export const bossBeaten = (f: Progress, id: string) => (STAGES_SET_0.some(s => s.id === id) ? f.rank >= 1 || f.defeated.includes(id) : f.rank >= 1 && f.defeated.includes(id));
