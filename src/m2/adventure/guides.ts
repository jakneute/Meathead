// Safari Artie's junior guides (Adventure Land's own, out by the clearing): khaki, a whistle, a walking stick, and a
// pith helmet with spikes welded on top. Dive kick one and he lands on the spikes: they're the dive kick's counter, the
// way the cast members' spears are the shoulder charge's. They walk at him, wind up, and swing the stick.
// Men and women, every look, by seed.

import type { Enemy } from '../../m1/types';
import type { FrameContext } from '../../m1/game/core/context';
import { registerM2Kind, registerHurtLines } from '../kinds';
import { playSound } from '../../m1/game/platform/audio';
import { GRAVITY } from '../../m1/constants';
import { lookOf } from './temple/people';
import { drawGuide } from './clearing/guideArt';

/** What he says when a guide's stick gets him, and when he comes down on a spiked helmet; their death screens. */
export const HURT_GUIDE = ['HE HIT ME WITH A HIKING STICK!', 'QUIT WHACKING ME, BOY SCOUT!', 'IS THAT IN THE TOUR?!'];
export const DEATH_GUIDE = ['WALKING-STICKED TO DEATH', 'GUIDED TO THE AFTERLIFE', 'TOUR OVER'];
export const HURT_HAT_SPIKES = ['WHO PUTS SPIKES ON A HAT?!', 'I STOMPED A PINCUSHION!', 'MY FEET!', 'NOTE TO SELF: NOT THE POINTY HAT.'];
export const DEATH_HAT_SPIKES = ['STOMPED A SPIKED HAT', 'IMPALED FROM BELOW', 'HAT TRICK'];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...HURT_GUIDE, ...HURT_HAT_SPIKES],
  death: [...DEATH_GUIDE, ...DEATH_HAT_SPIKES],
};

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const seedOf = (e: Enemy) => Math.abs(Math.round(e.homeX || 0)) * 7 + (e.variant ?? 0) * 31 + 11;

/** The engine's pull on a jumping enemy, and what the air takes off its speed across each frame. */
const G = GRAVITY * 0.75, AIR = 0.97;
/** How high up a hop gets him (his feet), at most; how fast he walks. */
const MAX_RISE = 150, WALK = 2.1;

type Face = { top: number; gap: number; w: number; far: number };
/**
 * The nearest face of something he can't just walk up (a rock, a crate, a step) that way, within `reach` of his
 * leading edge: its top, how far off it is, how wide it is, where its far side is.
 */
const faceAhead = (state: FrameContext['state'], e: Enemy, dir: number, reach: number): Face | null => {
  const feet = e.pos.y + e.height, lead = dir > 0 ? e.pos.x + e.width : e.pos.x;
  let best: Face | null = null;
  for (const b of state.blocks) {
    if (b.oneWay || b.type === 'pit' || b.type === 'door') continue;
    // (a step he walks up; something over his head)
    if (b.y >= feet - 20 || b.y + b.h <= e.pos.y + 4) continue;
    const gap = dir > 0 ? b.x - lead : lead - (b.x + b.w);
    if (gap < -3 || gap > reach) continue;
    if (!best || gap < best.gap) best = { top: b.y, gap: Math.max(0, gap), w: b.w, far: dir > 0 ? b.x + b.w : b.x };
  }
  return best;
};

/** A hop's speeds to come down `dx` across and `rise` up (negative: down) from where he is, getting `over` above that. */
const arc = (dx: number, rise: number, over = 34) => {
  const up = Math.max(0, rise) + over;
  const vy = Math.sqrt(2 * G * up);
  const t = Math.max(8, vy / G + Math.sqrt(Math.max(0, 2 * (up - rise)) / G));
  // (the air slows him across as he goes: the speed that still gets him there in that time)
  const vx = (dx * (1 - AIR)) / (1 - Math.pow(AIR, t));
  return { vx: Math.max(-6, Math.min(6, vx)), vy };
};
/** On that hop, does he get his feet up over a face `gap` off and `rise` up before he gets to it? */
const clears = (gap: number, vx: number, vy: number, rise: number) => {
  let x = Math.abs(vx), y = 0, v = vy, s = Math.abs(vx);
  for (let t = 0; t < 120; t++) {
    if (x >= gap) return y >= rise - 12;
    x += s; y += v; v -= G; s *= AIR;
    if (v < 0 && y < 0) return false;
  }
  return false;
};
const hop = (e: Enemy, h: { vx: number; vy: number }) => {
  e.vel.y = -h.vy; e.vel.x = h.vx; e.aiTimer = 0;
  if (Math.abs(h.vx) > 0.2) e.facing = (h.vx < 0 ? -1 : 1);
  playSound('jump', 0.4, 2);
};
/** Too close under the face of it to clear it: a step back first, for a run at it. */
const stepBack = (e: Enemy, face: 1 | -1) => { e.aiState = 'back'; e.aiTimer = 0; e.vel.x = -face * WALK; };

/**
 * Getting to him: up onto whatever he's on (a hop aimed to land by him), up onto or over whatever's in the way (from
 * far enough back to clear it), down off whatever he's on to go after him below; nothing he can get up onto, he stands
 * his ground facing him (no pacing at a wall). On the ground (the engine only asks then).
 */
const approach = (state: FrameContext['state'], e: Enemy, dx: number, dy: number, face: 1 | -1) => {
  const adx = Math.abs(dx);
  e.facing = face;
  if (e.aiTimer < 10) { e.vel.x = adx > 60 ? face * WALK : 0; return; }
  // Him up on something, near: up there after him
  if (dy < -30 && adx < 280) {
    if (-dy > MAX_RISE) { e.vel.x = 0; return; }
    const h = arc(dx, -dy);
    const f = adx > 8 ? faceAhead(state, e, face, adx) : null;
    if (!f || clears(f.gap, h.vx, h.vy, e.pos.y + e.height - f.top)) { hop(e, h); return; }
    if (f.gap < 46) { stepBack(e, face); return; }
    e.vel.x = face * WALK;
    return;
  }
  // Something in the way, on the way to him: up onto it, or over it if it's narrow and he's past it
  const f = faceAhead(state, e, face, Math.min(adx, 56));
  if (f) {
    const rise = e.pos.y + e.height - f.top;
    if (rise > MAX_RISE) { e.vel.x = 0; return; }
    const mx = e.pos.x + e.width / 2;
    const past = face > 0 ? mx + dx > f.far + 20 : mx + dx < f.far - 20;
    const over = f.w < 100 && past && dy > -20;
    const land = over ? f.gap + f.w + e.width / 2 + 20 : f.gap + e.width / 2 + 22;
    const h = over ? arc(face * land, -Math.max(0, dy), rise + 30) : arc(face * land, rise);
    if (clears(f.gap, h.vx, h.vy, rise)) { hop(e, h); return; }
    if (f.gap < 46) { stepBack(e, face); return; }
  }
  // Him down below (off the edge of what he's on): on after him, right off it. Otherwise up to him
  e.vel.x = dy > 30 ? (adx > 4 ? face * WALK : 0) : adx > 60 ? face * WALK : 0;
};

const guideAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const face = (dx < 0 ? -1 : 1) as 1 | -1;
  switch (e.aiState) {
    case 'idle':
    default:
      e.vel.x = 0;
      if (adx < 500 && Math.abs(p.y - m.y) < 160 && state.player.health > 0) { e.aiState = 'walk'; e.aiTimer = 0; playSound('beep', 0.4, 8); }
      break;
    case 'walk': {
      const dy = state.player.pos.y + state.player.height - (e.pos.y + e.height);
      // (near enough, level enough, nothing between: the stick; otherwise on after him)
      if (adx < 90 && level && dy > -40 && !faceAhead(state, e, face, Math.max(0, adx - e.width / 2))) { e.aiState = 'windup'; e.aiTimer = 0; e.vel.x = 0; }
      else approach(state, e, dx, dy, face);
      break;
    }
    case 'back':
      // (a step back from the face of the thing in his way, for a run at it)
      e.vel.x = -face * WALK; e.facing = face;
      if (e.aiTimer > 14) { e.aiState = 'walk'; e.aiTimer = 10; }
      break;
    case 'windup':
      e.vel.x = 0; e.facing = face;
      if (e.aiTimer > 18) { e.aiState = 'swing'; e.aiTimer = 0; playSound('whoosh', 0.6, 0); }
      break;
    case 'swing':
      e.vel.x = e.facing! * (e.aiTimer < 7 ? 5.5 : 0);
      if (e.aiTimer > 14) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 30) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

registerM2Kind({
  kind: 'm2:guide', stats: { w: 38, h: 66, hp: 160, contact: 10, mass: 200 }, ai: guideAI, humanoid: true, grab: 'body',
  // (his own way of getting to him: approach(), above)
  pathing: false,
  // (the spikes on his helmet: don't dive kick him)
  spiky: { source: 'm2:guide_spikes', label: 'SPIKED!' },
  gender: e => (lookOf(seedOf(e)).woman ? 'f' : 'm'),
  head: { x: 1, y: -64, r: 9 },
  // (the uniform, the spiked helmet, the staff: clearing/guideArt.ts)
  draw: (c, e, f) => drawGuide(c, e, f, seedOf(e)),
});
registerHurtLines('m2:guide', HURT_GUIDE, DEATH_GUIDE);
registerHurtLines('m2:guide_spikes', HURT_HAT_SPIKES, DEATH_HAT_SPIKES);

export const GUIDE_KIND = 'm2:guide';
