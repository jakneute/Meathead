// Meathead 2's own enemies, registered with the engine in one go: what one is (its size, health, contact damage, mass),
// how it behaves (its AI), how it's made (a flyer? a shield?), how it's drawn, where its head is (for the flintlock's
// headshots and the like), whether it's a man, a woman or an animal (for what's said over it), and whether it's a
// machine (scrap, not gore). Kinds are named `m2:...`.

import type { Enemy, EnemyKind } from '../m1/types';
import type { FrameContext } from '../m1/game/core/context';
import type { GameState } from '../m1/game/core/state';
import { registerKind, type KindStats } from '../m1/game/enemies/kinds';
import { registerKindDrawer, KIND_HEAD } from '../m1/game/render/enemies';
import { BOSS_DIALOGUE } from '../m1/content/dialogue';
import { DEATH_LINES } from '../m1/content/deaths';

export interface M2Kind {
  kind: `m2:${string}`;
  /** w, h (its box), hp, contact (damage touching him), mass (200 a grown man), air (it flies). */
  stats: KindStats;
  /** Each frame it's alive: decide where it goes and what it does; return true if it moved itself (no gravity etc.). */
  ai?: (ctx: FrameContext, e: Enemy) => boolean;
  /** How one's made from the base (e.g. `{ ...b, enemyType: 'flyer', initialY: b.pos.y }`). */
  make?: (base: Enemy) => Enemy;
  /** Drawn standing at the origin (feet), facing right; the engine turns it round. `f` a frame count. */
  draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, state: GameState) => void;
  /** Its head, from its feet, facing right. */
  head?: { x: number; y: number; r: number };
  /** 'm' a man, 'f' a woman, 'n' an animal (an it), or decided per enemy. */
  gender?: 'm' | 'f' | 'n' | ((e: Enemy) => 'm' | 'f' | 'n');
  /** A machine: scrap and sparks, not blood and guts (see adventure/dino). */
  robot?: boolean;
}

const defs = new Map<string, M2Kind>();
export const registerM2Kind = (d: M2Kind) => {
  defs.set(d.kind, d);
  registerKind(d.kind as EnemyKind, { stats: d.stats, ai: d.ai, make: d.make });
  registerKindDrawer(d.kind as EnemyKind, d.draw);
  if (d.head) (KIND_HEAD as Record<string, { x: number; y: number; r: number }>)[d.kind] = d.head;
};
export const m2Kind = (kind?: string) => (kind ? defs.get(kind) : undefined);
/** He, she or it, for one of Meathead 2's own (null: not one of them). */
export const m2KindGender = (e: Enemy): 'm' | 'f' | 'n' | null => {
  const d = m2Kind(e.kind);
  if (!d?.gender) return null;
  return typeof d.gender === 'function' ? d.gender(e) : d.gender;
};
/** Is it a machine? */
export const isRobot = (e?: Enemy | null) => !!(e && m2Kind(e.kind)?.robot);

/**
 * What Meathead says when `source` hurts him (an enemy's kind for its bite or bump, `kind_shot` for what it throws or
 * spits), and the death screen when it's what killed him. Every new way to hurt him gets both. (Their text goes in
 * the section's VOICE_LINES too, under 'meathead' and 'death', so they're recorded.)
 */
export const registerHurtLines = (source: string, hurt: string[], death: string[]) => {
  (BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT as Record<string, string[]>)[source] = hurt;
  DEATH_LINES[source] = death;
};
