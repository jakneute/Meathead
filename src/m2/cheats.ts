// Meathead 2's cheats (the pause menu's CHEATS panel, mouse only): god mode, unlimited ammo, every weapon, his pants,
// the hour. For the session, in memory. FOR NOW: they come out before it ships.

import type { WeaponType } from '../m1/types';
import type { GameState } from '../m1/game/core/state';
import { M2_WEAPONS } from './weapons';
import { ownsWeapon, subscribeProgress } from './store';
import { setTimeOfDayOverride, timeOfDayOverride } from './timeOfDay';
import { clearSkyCache } from './intro/art/sky';
import { M2_PUBLIC } from './build';
import { stepSoundTest, setSoundTest, soundTestLabel } from './music/soundTest';

export interface M2Cheats { god: boolean; ammo: boolean; allWeapons: boolean; skip: boolean }
let cheats: M2Cheats = { god: false, ammo: false, allWeapons: false, skip: false };
const listeners = new Set<() => void>();
/** (a fresh copy each time, so whatever's showing them redraws: the pants and the hour too) */
const ping = () => { cheats = { ...cheats }; listeners.forEach(l => l()); };
export const getCheats = () => cheats;
export const setCheat = (k: keyof M2Cheats, on: boolean) => { if (cheats[k] === on) return; cheats = { ...cheats, [k]: on }; listeners.forEach(l => l()); };
export const subscribeCheats = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** What he can pick from: what he's got this playthrough (store.ts), or the lot (the cheat). In arsenal order. */
let avail: WeaponType[] = ['GUN'];
export const availableWeapons = () => {
  const next = cheats.allWeapons ? M2_WEAPONS : M2_WEAPONS.filter(ownsWeapon);
  if (next.length !== avail.length || next.some((w, i) => avail[i] !== w)) avail = next;
  return avail;
};
/** (re-asked when a land's cleared or the cheat's flipped) */
export const subscribeArsenal = (l: () => void) => { const a = subscribeCheats(l), b = subscribeProgress(l); return () => { a(); b(); }; };

// His pants, set by hand: on the one GameState the game keeps all session (GameCanvas hands it over)
let live: GameState | null = null;
export const setLiveState = (s: GameState) => { live = s; };
export type Pants = 'normal' | 'shitty' | 'naked';
export const pantsNow = (): Pants => { const st = live?.player.gut?.stage ?? 0; return st === 3 ? 'naked' : st === 2 ? 'shitty' : 'normal'; };
/** Straight into that state (no grumble, no callout): clean, shitty (the stain, the stink), or blown off (naked, and
 *  still shitty: not washed off). The gut system takes it from there (gut.ts), lines and all. */
export const setPants = (p: Pants) => {
  if (!live) return;
  const pl = live.player;
  const stage = p === 'naked' ? 3 : p === 'shitty' ? 2 : 0;
  const was = pl.gut;
  pl.gut = { t: 0, stage, at: was?.at ?? { x: pl.pos.x + pl.width / 2, y: pl.pos.y + pl.height }, rearmed: false, washed: false, stains: was?.stains, globs: was?.globs };
  ping();
};

/** The hour: lands cleared (0..9), or null to follow the real progress. */
export const setTod = (n: number | null) => { setTimeOfDayOverride(n); clearSkyCache(); ping(); };
export const todNow = () => { const v = timeOfDayOverride(); return v === null ? null : Math.round(v); };

/**
 * The cheat panel, up over the pause menu (X on the pad, or a click on CHEATS): nothing behind it answers till it's shut
 * (backing out of it is back to the weapon select). On the pad, a cursor: up/down a row, left/right along it, confirm to
 * set what it's on.
 */
let panelOpen = false;
/** The panel's rows, in order, and what's along each. */
export const CHEAT_ROWS = ['god', 'ammo', 'allWeapons', 'skip', 'pants', 'tod', 'music', 'done'] as const;
export type CheatRow = typeof CHEAT_ROWS[number];
const rowLength = (r: CheatRow) => (r === 'pants' ? 3 : r === 'tod' ? 11 : r === 'music' ? 3 : r === 'done' ? 1 : 2);

/** The sound test (music/soundTest.ts): back a song, on a song, or off. */
export const stepMusic = (d: number) => { stepSoundTest(d); ping(); };
export const stopMusicTest = () => { setSoundTest(null); ping(); };
export { soundTestLabel };
let cursor = { row: 0, col: 0 };
export const cheatPanelOpen = () => panelOpen;
export const cheatCursor = () => cursor;
export const setCheatPanelOpen = (open: boolean) => {
  // (the standard build has no cheats)
  if (M2_PUBLIC) open = false;
  if (open === panelOpen) return;
  panelOpen = open;
  // (shut, the sound test's off: back to the game's own music)
  if (!open) setSoundTest(null);
  // (opened on the pad: the cursor on the first row, on what's set)
  if (open) cursor = { row: 0, col: cheats.god ? 0 : 1 };
  ping();
};
/** What's set in a row, as its column (so moving onto a row puts the cursor on its current choice). */
const colOf = (r: CheatRow) =>
  r === 'god' ? (cheats.god ? 0 : 1) : r === 'ammo' ? (cheats.ammo ? 0 : 1) : r === 'allWeapons' ? (cheats.allWeapons ? 0 : 1) : r === 'skip' ? (cheats.skip ? 0 : 1)
    : r === 'pants' ? ['normal', 'shitty', 'naked'].indexOf(pantsNow()) : r === 'tod' ? (todNow() === null ? 0 : todNow()! + 1) : 0;
export const moveCheatCursor = (dx: number, dy: number) => {
  if (dy) { const row = (cursor.row + dy + CHEAT_ROWS.length) % CHEAT_ROWS.length; cursor = { row, col: colOf(CHEAT_ROWS[row]) }; }
  if (dx) { const n = rowLength(CHEAT_ROWS[cursor.row]); cursor = { row: cursor.row, col: (cursor.col + dx + n) % n }; }
  ping();
};
/** Confirm: set what the cursor's on (DONE: shut the panel). */
export const activateCheat = () => {
  const r = CHEAT_ROWS[cursor.row], c = cursor.col;
  if (r === 'god' || r === 'ammo' || r === 'allWeapons' || r === 'skip') setCheat(r, c === 0);
  else if (r === 'pants') setPants((['normal', 'shitty', 'naked'] as Pants[])[c]);
  else if (r === 'tod') setTod(c === 0 ? null : c - 1);
  else if (r === 'music') { if (c === 2) setSoundTest(null); else stepSoundTest(c === 0 ? -1 : 1); }
  else setCheatPanelOpen(false);
  ping();
};
