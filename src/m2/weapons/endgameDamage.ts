// THE WATER PARK BOSSES' DAMAGE TABLE (the endgame: ZORZARBLAX, MEHPHISTO and BRATHAZAR, GUPPLAX, Ned). The owner's,
// 2026-11-05: "adjust it so that during a 15 second window all special weapons do close to the same percentage of
// health damage to boss 1 and all are a clearly better weapon to use than the ray gun", and "it's kinda a new damage
// table, not a flat 35 or 25 percent". So on these bosses a special's hit isn't a share of what it'd do to anybody
// else: it's its own number, out of this table, by weapon and by move.
//
// How it's used: the boss still has his breather after a hit (BOSS_IFRAMES, 75 frames), so what counts is what one hit
// that gets through is worth. Each weapon marks its hit on him with the move it was (tagHit); his fight's hit takes the
// biggest move marked that frame and looks it up here (endgameHit). A hit nothing marked (something odd) goes in as
// before: 35% of it. The crossbow's hurl (its sick bar run out) is its own burst, past the breather (crossbow.ts).
// The ray gun (25) and his plain moves are left as they are; the bulk-up's moves are the spellbook's, so they're here.
// The land bosses and everybody else never come through here: their numbers are their own, unchanged.
//
// Measured on ZORZARBLAX (a headless 15 s of each, god mode, unlimited ammo, used as a decent player would): the ray
// gun lands 10 to 12 hits in 15 s (25-30% of his 999). These numbers put each special at about 35-45% (the mallet's
// tap about 34%, the owner's "about the same"; its tornado less, on purpose).

import type { Enemy, Player, WeaponType } from '../../m1/types';
import type { GameState } from '../../m1/game/core/state';
import { bossMelee } from '../upgrades/bossMelee';

/** What one hit that gets through his breather takes off him, by weapon and move (tune here). */
export const ENDGAME_DAMAGE = {
  /** (the ray gun: BULLET_DAMAGE, as ever; here for comparing, not read) */
  GUN: { bolt: 25 },
  /** By what came out of the bag: the light ones less, the heavy ones more (about 36 on average, it's a lucky dip). */
  SOUVENIR: { eiffel: 26, opera: 24, redeemer: 28, pisa: 31, taj: 33, bigben: 36, colosseum: 39, pyramid: 43, moai: 48 },
  /** The drain (held on him: his blood into the bag), and the bag sprayed back over him. */
  SOUL_SUCKER: { drain: 36, spray: 44 },
  /** One ball (no headshot on a boss): the slowest to land (hold, the click, can't turn round), so the biggest. */
  FLINTLOCK: { ball: 66 },
  /** ELEMENTAL STORM's three (no burn after the meteor on these: a trickle only eats his breather); BULK UP: any of his
   *  moves while he's bulked. */
  SPELLBOOK: { meteor: 46, comet: 42, bolt: 38, bulk: 70 },
  /** The car (the stuntman out through the windshield into him, or the car itself), and the fireball. */
  STUNT_CAR: { car: 45, blast: 41 },
  /** The owner's: "pancake smash should do the most. tap command should be about the same", and "tornado damage
   *  should probably be less than a standard bonk". The tap's the swing (X); launch (Y tap), the air smash (Y in the
   *  air), the pancake smash (Y held), the tornado (X held). */
  MALLET: { swing: 34, launch: 36, pound: 42, smash: 56, spin: 24 },
  /** Every goblin's bite (a swarm of them on him: a hit every breather). */
  SPAWNER: { bite: 34 },
  /** A dart (a hit every breather), and the hurl: the sick bar run out, past his breather (crossbow.ts; the puke itself
   *  and its puddles don't hurt these: trickles only eat his breather). */
  CROSSBOW: { dart: 26, hurl: 85 },
} satisfies Partial<Record<WeaponType, Record<string, number>>>;

type Table = typeof ENDGAME_DAMAGE;
export type EndgameMove<W extends keyof Table> = keyof Table[W] & string;

/** The water park's bosses (their kinds): only they're marked. */
const KINDS = new Set<string>();
export const endgameBoss = (...kinds: string[]) => { for (const k of kinds) KINDS.add(k); };
export const isEndgameBoss = (e: Enemy) => !!e.kind && KINDS.has(e.kind);

const tags = new WeakMap<Enemy, { v: number; frame: number }>();
/** A special's hit landed on him (one of the water park's bosses: nobody else is marked): which move it was. The
 *  biggest of a frame's kept. */
export const tagHit = <W extends keyof Table>(state: GameState, e: Enemy, w: W, move: EndgameMove<W>) => {
  if (!isEndgameBoss(e)) return;
  const v = (ENDGAME_DAMAGE[w] as Record<string, number>)[move];
  if (v === undefined) return;
  const t = tags.get(e);
  if (t && t.frame >= state.frame - 1 && t.v >= v) return;
  tags.set(e, { v, frame: state.frame });
};

/** His fight's hit from a special weapon: the table's number for the move marked on him (this frame or the last),
 *  or, nothing marked, 35% of what it did (the old rule). Read every hit: it's taken. */
export const endgameHit = (state: GameState, e: Enemy, dealt: number) => {
  const t = tags.get(e);
  tags.delete(e);
  if (t && t.frame >= state.frame - 2) return t.v;
  return Math.max(1, dealt * 0.35);
};

/** Bulked up (the spellbook's BULK UP on: spellbook.ts says so). */
let bulked = false;
export const setBulked = (on: boolean) => { bulked = on; };
/** One of his moves on him: bulked up, the spellbook's number; otherwise his plain move's, as on any boss. */
export const endgameMelee = (p: Player) => (bulked ? ENDGAME_DAMAGE.SPELLBOOK.bulk : bossMelee(p));
