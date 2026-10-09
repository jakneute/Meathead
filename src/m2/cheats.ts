// Meathead 2's cheats (the pause menu's CHEATS panel, mouse only): god mode, unlimited ammo, every weapon, his pants,
// the hour. For the session, in memory. FOR NOW: they come out before it ships.

import type { WeaponType } from '../m1/types';
import type { GameState } from '../m1/game/core/state';
import { M2_WEAPONS } from './weapons';
import { ownsWeapon, subscribeProgress } from './store';
import { setTimeOfDayOverride, timeOfDayOverride } from './timeOfDay';
import { clearSkyCache } from './intro/art/sky';

export interface M2Cheats { god: boolean; ammo: boolean; allWeapons: boolean }
let cheats: M2Cheats = { god: false, ammo: false, allWeapons: false };
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
