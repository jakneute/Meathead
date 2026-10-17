// The streets' cast: every pavilion's cast members are obviously American college kids in costume (name tags:
// BRAYDEN, MADISON, TYLER, KAYLEE; HOMETOWN: OHIO), who know nothing about the place they're "from" and attack him
// anyway. One person underneath every one of them (Spooky Land's costume drawer, spooky/costume.ts: who they are is by
// seed, a man or a woman, every skin, build and hair), the pavilion's cheap costume over them, and always the NAME TAG
// (a white tag on the chest, a red HELLO band across it).
//
// One way of fighting under every kind (castKind): they mill about their patch of promenade till they see him, then
// close to the range their trick wants (and keep it: a thrower backs off, a slapper closes in), wind up (the tell: the
// pose, a beat to react), do it (strike: whatever the kind does, a throw, a blast, a slap, a lunge), recover, again.
// A bark now and then (in their own voice: a man's or a woman's; clean, shat or naked pools). Each kind's own hurt
// lines are its pavilion's (lines.ts HURT, registered by its kinds.ts). Walkers path round what's in the way
// (pathing.ts: on for humanoids, kinds.ts does it).

import type { Enemy, EnemyKind } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { KindStats } from '../../m1/game/enemies/kinds';
import { holdingOff, mid, safeAhead, makeKindEnemy } from '../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../m1/game/bosses/shared';
import { isShat, isNude } from '../../m1/game/player/gut';
import { registerM2Kind } from '../kinds';
import { lookOf } from '../adventure/temple/people';
import {
  type Pose, type Body, type Frame, type Shoe, INK, dk, lt, px, part, partTop, ball, limb,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, moodOf, reaction,
} from '../spooky/costume';
import { bark } from './state';
import type { ByPants } from './talk';

export type Ctx = CanvasRenderingContext2D;
export { INK, dk, lt, px, part, partTop, ball, limb, type Body, type Frame };

export { allOf, type ByPants } from './talk';
/** Clean, shat or naked: the pool for the state of him. */
export const byPants = (state: GameState, r: ByPants) => (isNude(state) ? r.nude : isShat(state) ? r.shitty : r.clean);

// ---------------------------------------------------------------------------------------------------------------
// Who's in the costume

export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
export const womanOf = (e: Enemy, forced?: boolean) => forced ?? lookOf(seedOf(e)).woman;
export const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
export const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
export const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};

// ---------------------------------------------------------------------------------------------------------------
// The costume over them

export interface Costume {
  /** For the stamps (one per kind). */
  id: string;
  /** The top (a shirt, a jacket, a tunic) and its sleeves; the legs and the shoes. */
  top: string | ((seed: number) => string);
  sleeve?: string | ((seed: number) => string);
  /** How far down the arm the sleeve comes (1 to the wrist; under 1, bare forearms). */
  sleeveLen?: number;
  legs: string | ((seed: number) => string);
  shoe: Shoe; shoeCol: string;
  bareBelow?: boolean; stripe?: string;
  /** Behind them (a cape, a tuba's bell over the shoulder, a dragon's tail). */
  back?: (g: Ctx, B: Body, F: Frame) => void;
  /** Over the torso (a vest, an apron, a sash, a poncho). */
  over?: (g: Ctx, B: Body, F: Frame) => void;
  /** On the head (over their own hair): a hat, a helmet, a wig, a mask. `hairToo`: their own hair shows under it. */
  hat?: (g: Ctx, B: Body, F: Frame) => void;
  hairToo?: boolean;
  /** In the near hand (at (x, y)): a trumpet, an axe, a stein. Drawn over the near arm. */
  hold?: (g: Ctx, B: Body, F: Frame, x: number, y: number) => void;
  /** In the far hand (behind the body). */
  holdFar?: (g: Ctx, B: Body, F: Frame, x: number, y: number) => void;
  /** Where the hands go in each pose (far, near); left out: the cast's usual. */
  hands?: (B: Body, F: Frame) => [[number, number], [number, number]] | null;
  /** Their face's eyes and mouth as they go at him. */
  eyes?: 'open' | 'angry' | 'wide' | 'tired' | 'smug'; mouth?: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk';
  /** Over the face (a mask, a blindfold, sunglasses): after it. */
  face?: (g: Ctx, B: Body, F: Frame) => void;
}

const val = (v: string | ((seed: number) => string), seed: number) => (typeof v === 'function' ? v(seed) : v);

/** The cast's usual hands: at the sides standing, swinging walking, the near one back for the tell, out for the strike. */
const usualHands = (B: Body, F: Frame): [[number, number], [number, number]] => {
  const sw = F.pose === 'walk' ? Math.sin((F.fr / 6) * Math.PI * 2) * 5 : 0;
  if (F.pose === 'tell') return [[-B.w / 2 - 4, B.shY + 12], [-B.w / 2 + 2, B.shY - 10]];
  if (F.pose === 'strike') return [[-B.w / 2 - 2, B.shY + 16], [B.w / 2 + 16, B.shY + 4]];
  if (F.pose === 'after') return [[-B.w / 2 - 2, -30], [B.w / 2 + 10, B.shY + 14]];
  return [[-B.w / 2 - 2 - sw, -30], [B.w / 2 + 3 + sw, B.shY + 16]];
};

/** The name tag: a white tag on the chest, a red HELLO band across its top, a scrawl for a name. */
export const nameTag = (g: Ctx, B: Body) => {
  const x = Math.round(B.w / 2 - 11 + B.lean), y = Math.round(B.shY + 6);
  // (inked, a white card stepped (lit top-left, a shaded foot), the red HELLO band (its letters a dotted white), the
  // name in blue marker, the pin's glint; a shadow under it on the costume)
  px(g, x, y + 6, 9, 1, 'rgba(26, 11, 6, 0.35)');
  px(g, x - 1, y - 1, 10, 7, INK); px(g, x, y, 8, 5, '#F4F4F5'); px(g, x, y + 4, 8, 1, '#C8C8CC'); px(g, x, y, 1, 4, '#FFFFFF');
  px(g, x, y, 8, 2, '#DC2626'); px(g, x, y, 8, 1, '#F05252');
  px(g, x + 1, y + 1, 1, 1, '#FECACA'); px(g, x + 3, y + 1, 1, 1, '#FECACA'); px(g, x + 5, y + 1, 1, 1, '#FECACA');
  px(g, x + 1, y + 3, 2, 1, '#1E3A8A'); px(g, x + 4, y + 3, 3, 1, '#1E3A8A'); px(g, x + 3, y + 2, 1, 1, '#2B4BA8');
  px(g, x + 7, y, 1, 1, '#E5E7EB');
};

/** One of them, painted (feet at the origin, facing right). */
export const paintCast = (g: Ctx, F: Frame, C: Costume, woman?: boolean) => {
  const B = bodyOf(F.seed, F.pose, F.fr, woman), L = B.L;
  const top = val(C.top, F.seed), sleeve = C.sleeve ? val(C.sleeve, F.seed) : top, legCol = val(C.legs, F.seed);
  C.back?.(g, B, F);
  legs(g, B, { col: legCol, shoe: C.shoe, shoeCol: C.shoeCol, bareBelow: C.bareBelow, stripe: C.stripe });
  const hs = flailHands(B, F.fr) ?? C.hands?.(B, F) ?? usualHands(B, F);
  const [far, near] = hs;
  C.holdFar?.(g, B, F, far[0], far[1]);
  arm(g, B, -1, far[0], far[1], { sleeve, hand: L.skin, len: C.sleeveLen ?? 1 });
  torso(g, B, top);
  C.over?.(g, B, F);
  nameTag(g, B);
  hairBack(g, B, L.hair, L.long ? 16 : 10);
  headShape(g, B, L.skin);
  const md = F.md;
  faceOn(g, B, { skin: L.skin, eyes: md === 'ok' ? C.eyes ?? 'angry' : undefined, mouth: md === 'ok' ? C.mouth ?? 'teeth' : undefined, md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  if (!C.hat || C.hairToo) hairTop(g, B, L.hair);
  C.face?.(g, B, F);
  C.hat?.(g, B, F);
  arm(g, B, 1, near[0], near[1], { sleeve, hand: L.skin, len: C.sleeveLen ?? 1 });
  C.hold?.(g, B, F, near[0], near[1]);
};

const BOX: [number, number, number, number] = [-64, -132, 140, 136];
/** Put one down: the pose from its state (its own tell/strike states), knocked about as it's knocked about. */
export const drawCast = (c: Ctx, e: Enemy, f: number, C: Costume, woman?: boolean, poseFor?: (e: Enemy) => Pose | null, v = '') => {
  const r = reaction(e);
  const own = poseFor?.(e) ?? null;
  const st = e.aiState ?? '';
  const pose: Pose = own ?? (st === 'tell' ? 'tell' : st === 'strike' ? 'strike' : st === 'after' ? 'after' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand');
  const F = frameOf(seedOf(e), f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, womanOf(e, woman), v);
  putFrame(c, `fl-${C.id}`, F, BOX, g => paintCast(g, F, C, womanOf(e, woman)));
};

// ---------------------------------------------------------------------------------------------------------------
// How they fight

export interface CastDef {
  kind: `m2:fl_${string}`;
  costume: Costume;
  /** Always a woman (true) or a man (false); left out: by seed (both). */
  woman?: boolean;
  stats: KindStats;
  head?: { x: number; y: number; r: number };
  /** Their voices (a man's, a woman's), and what they bark (by his pants). */
  voice: { m: string; f: string };
  pool: ByPants;
  /** Walking speed. */
  speed: number;
  /** The distance from him its trick wants (it closes to it, and backs off to it). */
  range: [number, number];
  /** How far up or down he can be and it still goes for it. */
  reachY?: number;
  /** The tell (frames), the strike (frames), the recovery after (frames), the wait before the next (frames). */
  tell: number; strikeFor?: number; after: number; cooldown: number;
  /** The moment of the strike (frame 1 of it): throw, blast, slap. */
  strike: (ctx: FrameContext, e: Enemy) => void;
  /** Every frame of the strike (a lunge, a flurry). */
  striking?: (ctx: FrameContext, e: Enemy) => void;
  /** Its own business each frame, before the usual (return true: it's handled this frame). */
  own?: (ctx: FrameContext, e: Enemy) => boolean;
  /** Turns round to him only after this many frames (a shield-holder: get behind it). */
  turn?: number;
  shield?: boolean;
  pointy?: { source: string; label?: string; damage?: number };
  spiky?: { source: string; label?: string; damage?: number };
  /** The pose for its own states. */
  poseFor?: (e: Enemy) => Pose | null;
  /** A drawing variant from its state (for the stamp: 'up' and the like). */
  variantOf?: (e: Enemy) => string;
  /** Doesn't path (keeps to its own way of getting about). */
  pathing?: boolean;
  grab?: 'body' | 'critter' | 'none';
  drawExtra?: (c: Ctx, e: Enemy, f: number) => void;
}

const TURNING = new WeakMap<Enemy, number>();
export const faceTo = (e: Enemy, x: number, turn = 0) => {
  const want = dirTo(e, x);
  if (!turn || e.facing === undefined) { e.facing = want; return; }
  if (want === e.facing) { TURNING.set(e, 0); return; }
  const n = (TURNING.get(e) ?? 0) + 1;
  TURNING.set(e, n);
  if (n >= turn) { e.facing = want; TURNING.set(e, 0); }
};

/** A melee hit in front of it (within `reach` ahead, `up` up and down): him hurt, knocked away. */
export const meleeHit = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, src: string, knock = 8, up = 60) => {
  const pl = ctx.state.player, p = mid(pl), m = mid(e), ahead = (p.x - m.x) * (e.facing ?? 1);
  if (ahead > -12 && ahead < reach && Math.abs(p.y - m.y) < up && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.carried && !pl.inCutscene) {
    hurtPlayer(ctx, dmg, src, { x: (e.facing ?? 1) * knock, y: -5 }, 18);
    return true;
  }
  return false;
};

/** Where he'll be standing in a moment (for a lob): his feet, led a little the way he's going. */
export const leadOf = (state: GameState, t: number) => {
  const p = state.player;
  return { x: p.pos.x + p.width / 2 + p.vel.x * t * 0.5, y: p.pos.y + p.height - 20 };
};

const castAI = (d: CastDef) => (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  e.aiTimer = (e.aiTimer || 0) + 1;
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  if (d.own?.(ctx, e)) return false;
  const voice = womanOf(e, d.woman) ? d.voice.f : d.voice.m;
  switch (e.aiState) {
    case 'tell':
      e.vel.x = 0; faceTo(e, p.x, d.turn);
      if (e.aiTimer >= d.tell) { setState(e, 'strike'); d.strike(ctx, e); }
      break;
    case 'strike':
      if (d.striking) d.striking(ctx, e); else e.vel.x = 0;
      if (e.aiTimer >= (d.strikeFor ?? 10)) setState(e, 'after');
      break;
    case 'after':
      e.vel.x *= 0.8;
      if (e.aiTimer >= d.after) { setState(e, 'approach'); e.leapCd = d.cooldown; }
      break;
    case 'approach': {
      faceTo(e, p.x, d.turn);
      const ad = Math.abs(dx), [lo, hi] = d.range;
      const inY = Math.abs(dy) < (d.reachY ?? 90);
      if (!holdingOff(state) && !pl.inCutscene && (e.leapCd ?? 0) <= 0 && inY && ad >= lo * 0.7 && ad <= hi) { setState(e, 'tell'); e.vel.x = 0; break; }
      // (keeping to its range: in to it, or back off to it)
      let dir = 0;
      if (ad > hi * 0.85) dir = Math.sign(dx);
      else if (ad < lo) dir = -Math.sign(dx);
      const ok = dir !== 0 && safeAhead(ctx, e, dir as 1 | -1);
      e.vel.x = ok ? dir * d.speed * (ad > 400 ? 1.6 : 1) : 0;
      if (!sees(state, e, 820, 360)) setState(e, 'idle');
      if (e.aiTimer % 170 === 85) bark(state, e, voice, byPants(state, d.pool), 0.3);
      break;
    }
    default: {
      // (milling about their patch, looking out for him)
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 40 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.45;
      if (e.aiTimer > 10 && sees(state, e, 560, 260)) { setState(e, 'approach'); bark(state, e, voice, byPants(state, d.pool), 0.6); }
    }
  }
  if (d.shield) e.isShieldActive = e.aiState !== 'strike' && e.aiState !== 'after';
  return false;
};

export const castKind = (d: CastDef) => {
  registerM2Kind({
    kind: d.kind, stats: d.stats, humanoid: true, head: d.head ?? { x: 1, y: -66, r: 10 },
    gender: d.woman === undefined ? (e => (womanOf(e) ? 'f' : 'm')) : d.woman ? 'f' : 'm',
    pointy: d.pointy, spiky: d.spiky, pathing: d.pathing, grab: d.grab,
    make: d.shield ? b => ({ ...b, enemyType: 'shield', isShieldActive: true }) : undefined,
    ai: castAI(d),
    draw: (c, e, f) => { drawCast(c, e, f, d.costume, d.woman, d.poseFor, d.variantOf?.(e) ?? ''); d.drawExtra?.(c, e, f); },
  });
};

/** Puts the cast down: [kind, x, height of what it stands on] at world x(rx), feet y(h). */
export const spawnCast = (state: GameState, list: [string, number, number][], X: (rx: number) => number, Y: (h: number) => number) => {
  list.forEach(([kind, rx, h], i) => {
    const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
    e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
    e.variant = (i * 7 + Math.round(rx)) % 13;
    state.enemies.push(e);
  });
};
