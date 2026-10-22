// The giant atom's rigs, running: the thrusters, the swinging meteors and the shower, the airlocks and the air cannon,
// the lasers. Each frame each one does what it does to whoever's in its way (him, and anybody else: hazardHit.ts) and
// marks where it's dangerous (nobody walks into one on their own). A rig whose stagehand is dead stops (crewed()).
//
// Laid out (and timed) in layout.ts; painted in art.ts.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { heard, heardSpan } from '../../bossQuiet';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { getEnemyMass } from '../../../m1/game/combat/knockback';
import { getSpecialForm, interruptSpecialWithHurt } from '../../../m1/game/player/player';
import { registerHurtLines } from '../../kinds';
import { GY } from '../geometry';
import {
  THRUSTERS, thrustAt, flameBox, SWINGS, swingBall, SHOWER, showerAt, AIRLOCKS, AIRLOCK_TOP, airlockAt, AIRLOCK_POST,
  type Airlock, CANNON, cannonAt, FLOOR_LASER, floorLaserAt, SWEEP_LASER, sweepSpot, sweepState, LASER_POST, deadPosts,
} from './layout';
import { ATOM } from './kinds';
import {
  HURT_THRUSTER, DEATH_THRUSTER, HURT_METEOR, DEATH_METEOR, HURT_AIRLOCK, DEATH_AIRLOCK, HURT_LASER, DEATH_LASER,
} from './lines';

registerHurtLines('atom_thruster', HURT_THRUSTER, DEATH_THRUSTER);
registerHurtLines('atom_meteor', HURT_METEOR, DEATH_METEOR);
registerHurtLines('atom_airlock', HURT_AIRLOCK, DEATH_AIRLOCK);
registerHurtLines('atom_laser', HURT_LASER, DEATH_LASER);

type Box = { x: number; y: number; w: number; h: number };
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const pBox = (state: GameState): Box => {
  const p = state.player, low = p.isDucking || p.isSliding ? 28 : 0;
  return { x: p.pos.x + 4, y: p.pos.y + low, w: p.width - 8, h: p.height - low };
};
const canHurt = (state: GameState) => state.player.invincibilityTimer <= 0 && state.player.health > 0 && !state.player.inCutscene;

/** Is a post's stagehand still at it (alive, not flung, and not dead in an earlier life)? */
export const crewed = (state: GameState, post: number) => !deadPosts(state).has(post)
  && state.enemies.some(e => e.kind === ATOM.hand && e.variant === post && e.health > 0 && !e.isBlownAway);

/** The rigs' own solid bits (the airlock doors, shut; the shower's meteors, sat on the floor): made once, moved about. */
export interface RigBlocks { doors: Block[]; rocks: Block[] }
const AWAY = -99999;
export const buildRigBlocks = (state: GameState): RigBlocks => {
  const mk = (w: number, h: number): Block => { const b = { x: AWAY, y: AWAY, w, h, type: 'wall', hidden: true } as Block; state.blocks.push(b); return b; };
  return { doors: AIRLOCKS.map(d => mk(d.w, GY - AIRLOCK_TOP)), rocks: SHOWER.xs.map(() => mk(SHOWER.r * 2 - 8, SHOWER.r * 2 - 6)) };
};

/** Whoever's in a box: him (hurt `dmg`, by `source`, knocked away from `fromX`), and anybody else (`call`). */
const hitBox = (ctx: FrameContext, box: Box, dmg: number, source: string, fromX: number, call: string, edmg: number, had?: Set<object>) => {
  const { state } = ctx;
  if (canHurt(state) && overlap(pBox(state), box)) {
    const away = state.player.pos.x + state.player.width / 2 < fromX ? -1 : 1;
    hurtPlayer(ctx, dmg, source, { x: away * 7, y: -6 });
  }
  for (const e of hazardVictims(state)) {
    if (had?.has(e) || !boxHits(e, box.x, box.y, box.w, box.h)) continue;
    had?.add(e);
    hazardHit(ctx, e, edmg, fromX, call, { knock: 9 });
  }
};

/** Which side of door `i` to put him out on: `want`, unless something solid's there (a wall, the next door shut), then
 *  the other (both blocked: `want` anyway, never inside the slab). */
const sideFor = (state: GameState, d: Airlock, blk: Block, want: -1 | 1): -1 | 1 => {
  const p = state.player;
  const clear = (side: -1 | 1) => {
    const bx = side < 0 ? d.x - p.width - 2 : d.x + d.w + 2;
    return !state.blocks.some(b => b !== blk && !b.oneWay && b.x > AWAY / 2
      && bx < b.x + b.w && bx + p.width > b.x && p.pos.y < b.y + b.h && p.pos.y + p.height - 2 > b.y);
  };
  return clear(want) ? want : clear(-want as -1 | 1) ? -want as -1 | 1 : want;
};

/** A door's hit: heavy (32 before M2's ×0.65, about 21 off him). */
const AIRLOCK_DMG = 32;
/**
 * Caught by a door coming down: never popped up on top of it. A heavy hit (if he can be hurt), out of its way back
 * the way he came, knocked hard that way and stunned a moment. Whatever he was in the middle of (a charge, a slide,
 * an uppercut, a dive kick: the moves nothing usually shoves) is over; this shoves him regardless.
 */
const slamBack = (ctx: FrameContext, d: Airlock, blk: Block) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2;
  // (the way he came: against the way he was going, the move's way if he was in one; standing, the nearer side)
  const form = getSpecialForm(p);
  const going = form === 'charge' || form === 'slide' ? (p.chargeFace || p.facing) : Math.abs(p.vel.x) > 1 ? Math.sign(p.vel.x) : 0;
  const want: -1 | 1 = going ? (going > 0 ? -1 : 1) : px < d.x + d.w / 2 ? -1 : 1;
  const side = sideFor(state, d, blk, want);
  if (form) interruptSpecialWithHurt(ctx, form);
  if (canHurt(state)) hurtPlayer(ctx, AIRLOCK_DMG, 'atom_airlock');
  p.pos.x = side < 0 ? d.x - p.width - 2 : d.x + d.w + 2;
  // (always: through any armor, i-frames or not)
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
  p.recoiling = false; p.lockTimer = 0;
  p.vel = { x: side * 10, y: -5 };
  p.pushbackTimer = Math.max(p.pushbackTimer, 26);
  p.isHarmlessPushback = false;
  shakeScreen(state, 12, 6);
};

/** Each one's own: who's been had already (a swing has someone once a pass, not every frame of it). */
const swingHad = SWINGS.map(() => new Set<object>());
let lastSwingSide = SWINGS.map(() => 0);

export const runRigs = (ctx: FrameContext, blocks: RigBlocks) => {
  const { state } = ctx, f = state.frame, p = state.player, px = p.pos.x + p.width / 2;
  const zones: Zone[] = [];
  const near = (x: number, r = 900) => Math.abs(x - px) < r;
  // (heard only from on the screen or just off it: bossQuiet.ts)
  const hear = (x: number) => heard(state, x);

  // THE THRUSTERS
  for (const t of THRUSTERS) {
    if (!crewed(state, t.post) || !near(t.x, 1100)) continue;
    const s = thrustAt(t, f), fb = flameBox(t);
    if (s.tell > 0) {
      if (Math.floor(s.tell * 44) % 11 === 0 && hear(t.x)) playSound('click', 0.4, -6);
      if (Math.random() < 0.4) state.particles.push({ pos: { x: t.x + (t.dir === 'left' ? -4 : (Math.random() - 0.5) * 20), y: t.y + (t.dir === 'down' ? 4 : (Math.random() - 0.5) * 10) }, vel: { x: t.dir === 'left' ? -1 - Math.random() * 2 : (Math.random() - 0.5) * 2, y: t.dir === 'down' ? 1 + Math.random() * 2 : -Math.random() }, life: 16, color: Math.random() < 0.5 ? '#FDE047' : '#FB923C', size: 2 });
    }
    if (s.fire) {
      const c = ((f + t.phase) % t.cycle + t.cycle) % t.cycle;
      if (c === t.cycle - t.on && hear(t.x)) { playSound('flame', 1, -10); playSound('rumble', 0.8, 4); shakeScreen(state, 5, 3); }
      if (f % 9 === 0 && hear(t.x)) playSound('flame', 0.5, -12);
      hitBox(ctx, fb, 16, 'atom_thruster', t.dir === 'left' ? t.x + 40 : t.x, 'TORCHED!', 60);
    }
    if (s.fire || s.tell > 0.3) zones.push({ x0: fb.x - 30, x1: fb.x + fb.w + 30, y0: fb.y, y1: fb.y + fb.h });
  }

  // THE METEORS: on their chains (nobody runs these: they just swing)
  SWINGS.forEach((s, i) => {
    if (!near(s.x, 1100)) return;
    const b = swingBall(s, f);
    // (a pass: each one had once, till it swings back the other way)
    const side = Math.sign(Math.cos(((f + s.phase) / s.period) * Math.PI * 2));
    if (side !== lastSwingSide[i]) { lastSwingSide[i] = side; swingHad[i].clear(); if (Math.abs(b.a) < 0.2 && hear(b.x)) playSound('whoosh', 0.35, -14); }
    const box = { x: b.x - s.r, y: b.y - s.r, w: s.r * 2, h: s.r * 2 };
    hitBox(ctx, box, 18, 'atom_meteor', s.x + Math.sin(b.a - 0.4) * s.len * 2, 'METEORED!', 80, swingHad[i]);
    zones.push({ x0: b.x - s.r - 60, x1: b.x + s.r + 60, y0: b.y - s.r, y1: b.y + s.r });
  });
  // the shower: dropped in turn (the winch's stagehand: post 3); sat on the floor, they're in the way
  const winched = crewed(state, SHOWER.post);
  SHOWER.xs.forEach((x, k) => {
    const blk = blocks.rocks[k];
    if (!winched) { blk.x = AWAY; return; }
    const s = showerAt(k, f);
    if (s.tell > 0 && hear(x) && Math.floor(s.tell * 30) % 6 === 0) playSound('clink', 0.35, 4);
    if (s.down) { blk.x = x - SHOWER.r + 4; blk.y = GY - SHOWER.r * 2 + 6; } else blk.x = AWAY;
    if (s.falling) {
      const box = { x: x - SHOWER.r, y: s.y - SHOWER.r * 2, w: SHOWER.r * 2, h: SHOWER.r * 2 };
      hitBox(ctx, box, 18, 'atom_meteor', x, 'METEORED!', 120);
      if (s.y >= GY - 1 && hear(x)) { playSound('thud', 1, -10); playSound('crumble', 0.4, -4); shakeScreen(state, 6, 3); }
    }
    if (s.tell > 0 || s.falling) zones.push({ x0: x - SHOWER.r - 20, x1: x + SHOWER.r + 20, y0: AIRLOCK_TOP, y1: GY });
  });

  // THE AIRLOCKS: the doors slam, and the air cannon blows him back into them
  const locked = crewed(state, AIRLOCK_POST);
  AIRLOCKS.forEach((d, i) => {
    const s = airlockAt(d, f, locked), blk = blocks.doors[i];
    const bottom = AIRLOCK_TOP + (GY - AIRLOCK_TOP) * s.down;
    if (s.down > 0.92) { blk.x = d.x; blk.y = AIRLOCK_TOP; blk.h = GY - AIRLOCK_TOP; } else blk.x = AWAY;
    if (!near(d.x, 1000)) return;
    if (s.warn > 0 && s.warn < 0.05 && hear(d.x)) playSound('alarm', 0.35, 6);
    // (the whole slab, the ceiling down to its foot: whoever's anywhere in it as it comes down (or the frame it lands)
    //  is hit, however fast its foot moved past them; never left inside it for the wall to pop up on top)
    if (s.down > 0) {
      const coming = s.down > airlockAt(d, f - 1, locked).down;
      const slab = { x: d.x, y: AIRLOCK_TOP, w: d.w, h: bottom - AIRLOCK_TOP };
      if (!p.inCutscene && p.health > 0 && overlap({ x: p.pos.x, y: p.pos.y, w: p.width, h: p.height }, slab)) {
        if (coming) slamBack(ctx, d, blk);
        // (in it while it's up and solid, some other way: out, the nearer side, nothing more)
        else if (s.down > 0.92) p.pos.x = sideFor(state, d, blk, px < d.x + d.w / 2 ? -1 : 1) < 0 ? d.x - p.width - 2 : d.x + d.w + 2;
      }
      if (coming) for (const e of hazardVictims(state)) {
        if (!boxHits(e, slab.x, slab.y, slab.w, slab.h)) continue;
        // (anybody else the same: a heavy hit, out of its way the side they were on, knocked back)
        const side = e.pos.x + e.width / 2 < d.x + d.w / 2 ? -1 : 1;
        e.pos.x = side < 0 ? d.x - e.width - 2 : d.x + d.w + 2;
        hazardHit(ctx, e, 150, side < 0 ? d.x + d.w : d.x, 'SLAMMED!', { knock: 14 });
      }
    }
    if (s.down > 0.9 && s.down <= 1 && s.warn === 1 && !s.slamming && airlockAt(d, f - 1, locked).slamming && hear(d.x)) { playSound('slam', 1, -8); playSound('clang', 0.8, -12); shakeScreen(state, 8, 4); }
    if (s.warn > 0 || s.down > 0) zones.push({ x0: d.x - 12, x1: d.x + d.w + 12, y0: AIRLOCK_TOP, y1: GY });
  });
  {
    const c = cannonAt(f, locked);
    if (c.tell > 0 && hear(CANNON.x) && f % 12 === 0) playSound('rumble', 0.3, 10);
    if (c.blow > 0 && near(CANNON.x, 1400)) {
      if (c.blow >= 1 && f % 16 === 0 && heardSpan(state, CANNON.from, CANNON.x)) playSound('whoosh', 0.7, -16);
      // (him: blown back down the room, his feet or not)
      if (px > CANNON.from && px < CANNON.x && p.pos.y + p.height > AIRLOCK_TOP && !p.inCutscene) p.pos.x -= CANNON.push * c.blow * (p.isGrounded ? 1 : 1.3);
      // (anybody else: the lighter, the further)
      for (const e of state.enemies) {
        if (e.health <= 0 || e.type === 'boss') continue;
        const ex = e.pos.x + e.width / 2;
        if (ex > CANNON.from && ex < CANNON.x && e.pos.y + e.height > AIRLOCK_TOP) e.pos.x -= CANNON.push * c.blow * Math.min(2, 200 / Math.max(40, getEnemyMass(e)));
      }
      if (Math.random() < 0.6) state.particles.push({ pos: { x: CANNON.x - 30, y: GY - 20 - Math.random() * 120 }, vel: { x: -12 - Math.random() * 6, y: (Math.random() - 0.5) * 0.6 }, life: 50, color: 'rgba(226, 232, 240, 0.5)', size: 2 });
    }
  }

  // THE LASER SHOW
  const lit = crewed(state, LASER_POST);
  {
    const s = floorLaserAt(f, lit), L = FLOOR_LASER;
    const y = s.high ? L.high : L.low;
    if (s.tell > 0 && s.tell < 0.03 && hear(L.x)) playSound('beep', 0.4, s.high ? 8 : -4);
    if (s.on) {
      if (heardSpan(state, L.from, L.x) && f % 20 === 0) playSound('egun', 0.25, 12);
      hitBox(ctx, { x: L.from, y: y - 3, w: L.x - L.from, h: 6 }, 10, 'atom_laser', L.x, 'LASERED!', 50);
    }
    if (s.on || s.tell > 0) zones.push({ x0: L.from - 20, x1: L.x, y0: y - 6, y1: y + 6 });
  }
  const sw = sweepState(f);
  if (lit && near(SWEEP_LASER.x, 1100)) {
    const sx = sweepSpot(f);
    // (on the blink: dead, nobody's hurt; it sputters before it comes back on, then it's live)
    if (!sw.live) { if (sw.sputter && f % 4 === 0 && hear(sx)) playSound('egun', 0.12, 20); zones.push({ x0: sx - 50, x1: sx + 50, y0: SWEEP_LASER.y, y1: GY }); }
    else {
    // (down the beam, from the ceiling to the spot on the floor: whoever it passes through)
    for (let k = 0; k <= 14; k++) {
      const u = 0.45 + (k / 14) * 0.55, bx = SWEEP_LASER.x + (sx - SWEEP_LASER.x) * u, by = SWEEP_LASER.y + (GY - SWEEP_LASER.y) * u;
      hitBox(ctx, { x: bx - 3, y: by - 3, w: 6, h: 6 }, 10, 'atom_laser', bx + 30, 'LASERED!', 50);
    }
    if (f % 30 === 0 && hear(sx)) playSound('egun', 0.2, 16);
    zones.push({ x0: sx - 50, x1: sx + 50, y0: SWEEP_LASER.y, y1: GY });
    }
  }

  setHazardZones(state, 'atom', zones);
};
