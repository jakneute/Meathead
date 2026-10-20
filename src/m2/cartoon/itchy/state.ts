// PUNCHY & KICKY's own state (in Cartoon Land's, under 'itchy'): the towers as they sway; every hazard as it goes
// (hazards.ts says what each phase means); what the cast throw (cleavers, dynamite, folded portable holes) and the holes
// they lay; who's barking what; where he last stood safe (the canyon and the floor of holes put him back there); a bear
// trap's hold on him. Rebuilt with the stage on every death; what the run's set off for good (the safe, the piano, the
// sprung bear traps, the anvils the host called down) is kept in state.stageMemo (ITCHY_FIRED: checkpoints restore the
// world as the run left it); what he's said outlives a death for the rest of the visit (keyed by landVisit()).

import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import type { Said } from '../section';
import type { Tower } from '../sway';
import { cartoonState, landVisit } from '../section';
import type { HammerDef, FuseDef } from './layout';

/** An anvil: a trapdoor's (on its cycle: falls, sits, is winched back up) or one the host called down on him (falls
 *  where he was, and stays where it lands). `y` is its bottom; `land` where it'll stop (null: over the canyon, gone). */
export interface Anvil {
  x: number; y: number; vy: number;
  phase: 'wait' | 'tell' | 'fall' | 'down' | 'lift' | 'gone';
  t: number; land: number | null;
  /** A trapdoor's: its offset in the cycle, where it is in it now (-1: waiting its first turn); the host's: following
   *  him till it locks on. */
  door?: number; cyc?: number; host?: boolean; lock?: number;
  /** Down: the block it is (a step, lit along its top). */
  b?: Block;
}
/** A giant animatronic's hammer: its swing angle (0 straight down from the shoulder, + out over the path) and phase. */
export interface Hammer { d: HammerDef; ang: number; phase: 'idle' | 'wind' | 'slam' | 'down' | 'lift'; t: number; on: boolean; b?: Block }
/** A rake: up (the handle swung up into a face) for `t` frames. */
export interface Rake { x: number; dir: -1 | 1; up: number; who: 'him' | Enemy | null }
/** A bear trap: open, or sprung (on him: holding him; on one of the cast). */
export interface Trap { x: number; sprung: boolean; t: number }
/** A GENERIC-CO crate's glove: which way it's out, how far (0..1), the phase. */
export interface Glove { i: number; dir: -1 | 1; ext: number; phase: 'shut' | 'rattle' | 'out' | 'hold' | 'back'; t: number; cool: number }
/** Something dropped from a rope (the safe, the piano): hanging, fraying, falling, down for good. */
export interface Drop { id: 'safe' | 'piano'; x: number; w: number; h: number; y: number; vy: number; phase: 'hang' | 'fray' | 'fall' | 'down'; t: number }
/** A cannon (the row's, or the canyon's on its lift): its phase, its shots so far (low, high, in turn), the lift's
 *  height (the canyon's), where it's aiming its next ball. */
export interface Cannon { x: number; muzzle: number; phase: 'wait' | 'aim' | 'tell' | 'fire'; t: number; n: number; lift: number; aim: number; range: number; recoil: number }
/** A cannonball in flight: its middle, its speed, low or high. */
export interface Ball { x: number; y: number; vx: number; t: number; dead?: boolean }
/** A fuse: lit, burning along its line (`s`: how far the spark's got, px), gone up, being reset. */
export interface Fuse { d: FuseDef; phase: 'wait' | 'strike' | 'burn' | 'boom' | 'reset'; t: number; s: number; len: number }
/** A portable hole on the floor (a stagehand's: it spreads out, lies there a while, peels back up), or the one up in
 *  the air he drops out of. */
export interface Hole { x: number; y: number; w: number; t: number; life: number; sky?: boolean }

/** Something the cast threw: a cleaver (spinning, then stuck in the floor), a stick of dynamite (its fuse burning from
 *  the moment it's lit: `fuse` frames left), a folded portable hole (spinning down to the floor, where it spreads). */
export interface Throw {
  kind: 'cleaver' | 'dynamite' | 'hole';
  x: number; y: number; vx: number; vy: number; t: number;
  from: Enemy; dead?: boolean; down?: boolean; fuse?: number;
}
/** A blast (the TNT, a stick of dynamite): its middle, how big, how far through. */
export interface Blast { x: number; y: number; r: number; t: number }

export interface Itchy {
  towers: Tower[];
  anvils: Anvil[]; hammers: Hammer[]; rakes: Rake[]; traps: Trap[]; gloves: Glove[]; drops: Drop[];
  cannon: Cannon; lift: Cannon; balls: Ball[]; fuses: Fuse[]; holes: Hole[];
  throws: Throw[]; blasts: Blast[];
  /** Hazard hits on the cast: frame each was last hit (no hitting one every frame). */
  hazHit: WeakMap<Enemy, number>;
  barks: Map<Enemy, Said>; barkAt: number;
  /** His feet's last safe spot (on the ground or a ledge, never a tower, never by a pit or on a hole). */
  safe: { x: number; y: number };
  /** Frames left of a bear trap's hold on him; dropped out of a portable hole (hurt when he lands). */
  trapped: number; holeDrop: boolean;
  /** Where he was last frame. */
  lastX: number;
}

const cannon = (x: number, muzzle: number, range: number): Cannon => ({ x, muzzle, phase: 'wait', t: 60, n: 0, lift: 0, aim: 0, range, recoil: 0 });
export const itchyOf = (state: GameState) => cartoonState<Itchy>(state, 'itchy', () => ({
  towers: [], anvils: [], hammers: [], rakes: [], traps: [], gloves: [], drops: [],
  cannon: cannon(0, 0, 0), lift: cannon(0, 0, 0), balls: [], fuses: [], holes: [],
  throws: [], blasts: [], hazHit: new WeakMap(), barks: new Map(), barkAt: -999,
  safe: { x: 0, y: 0 }, trapped: 0, holeDrop: false, lastX: 0,
}));
export const makeCannon = cannon;

// ---------------------------------------------------------------------------------------------------------------
// What the run's set off for good (state.stageMemo, kept through deaths: the checkpoints put the world back the way
// the run left it)

/** Fired for good: 'safe', 'piano', 'trap<i>' (sprung), and the host's anvils where they landed ('a<x>'). */
export const ITCHY_FIRED = 'ct-itchy-fired';
/** Been out the far end (a later visit's the revisit). */
export const ITCHY_DONE = 'ct-itchy-done';
export const firedList = (state: GameState) => (state.stageMemo[ITCHY_FIRED] ?? '').split(',').filter(Boolean);
export const isFired = (state: GameState, id: string) => firedList(state).includes(id);
export const fire = (state: GameState, id: string) => {
  const l = firedList(state);
  if (!l.includes(id)) state.stageMemo[ITCHY_FIRED] = [...l, id].join(',');
};
/** The host's anvils that stay (the last few: the oldest go back up into the rig). */
export const MAX_HOST_ANVILS = 6;
export const keepHostAnvil = (state: GameState, x: number) => {
  const l = firedList(state), anv = l.filter(s => s.startsWith('a'));
  const drop = anv.length >= MAX_HOST_ANVILS ? anv[0] : null;
  state.stageMemo[ITCHY_FIRED] = [...l.filter(s => s !== drop), `a${Math.round(x)}`].join(',');
  return drop ? +drop.slice(1) : null;
};

/** What he's said this visit (once each a visit: a death doesn't make him say it again). */
let saidVisit = -1;
const said = new Set<string>();
export const saidOnce = (k: string) => {
  if (saidVisit !== landVisit()) { saidVisit = landVisit(); said.clear(); }
  if (said.has(k)) return false;
  said.add(k);
  return true;
};
