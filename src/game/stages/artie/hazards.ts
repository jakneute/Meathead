// Artie's trail hazards.
//
//   icicles:   hang under rock overhangs. Walk under one and it shakes loose,
//              then drops: it hurts you, and anything else it lands on.
//   crumbling: ledges of ice. Stand on one and it cracks, shakes, and gives way
//              (it freezes back over a few seconds later).
//   wind:      shoves you back, harder in the air. Some of it comes in gusts
//              (a flag and snow streaks show when it's blowing).
//   snowballs: roll down the trail at you from chutes. Jump them, shoot them,
//              or smash them with a special move. They bowl over enemies too.

import type { Block } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { rectsOverlap, boundsOf, isOnScreen } from '../../core/utils';
import { hurtPlayer } from '../../bosses/shared';
import { floorTopAt, groundLineAt } from '../../core/terrain';
import { GRAVITY } from '../../../constants';
import { COURSE, WindZone, SnowballChute } from './course';

export interface StageIcicle { x: number; y: number; state: 'hang' | 'shake' | 'fall' | 'gone'; t: number; fy: number; vy: number }
export interface Crumble { tag: string; block: Block; state: 'solid' | 'shake' | 'gone'; t: number }
export interface Snowball { x: number; y: number; r: number; vx: number; vy: number; rot: number; big: boolean }
export interface Hazards {
  icicles: StageIcicle[];
  crumbles: Crumble[];
  snowballs: Snowball[];
  chuteTimers: number[];
}

const ICICLE_TRIGGER = 70;     // how close (horizontally) you get before it shakes loose
const ICICLE_SHAKE = 26;
const ICICLE_W = 14, ICICLE_H = 40;
const ICICLE_DAMAGE = 12;
const CRUMBLE_SHAKE = 34;
const CRUMBLE_REFREEZE = 210;

export const createHazards = (state: GameState): Hazards => ({
  icicles: COURSE.icicles.map(i => ({ x: i.x, y: i.y, state: 'hang', t: 0, fy: i.y, vy: 0 })),
  crumbles: state.blocks.filter(b => b.tag?.startsWith('crumble-')).map(b => {
    b.hidden = true; // drawn here, cracking and shaking
    return { tag: b.tag!, block: b, state: 'solid', t: 0 };
  }),
  snowballs: [],
  // (the first one's telegraphed too: nothing rolls the moment you come in range)
  chuteTimers: COURSE.chutes.map(() => CHUTE_WARN_FRAMES),
});

export const windBlowing = (w: WindZone, frame: number) => !w.gust || frame % (w.gust.on + w.gust.off) < w.gust.on;

export const updateHazards = (ctx: FrameContext, hz: Hazards) => {
  updateIcicles(ctx, hz);
  updateCrumbles(ctx, hz);
  updateWind(ctx);
  updateSnowballs(ctx, hz);
};

// ---------------------------------------------------------------------------

const updateIcicles = (ctx: FrameContext, hz: Hazards) => {
  const { state, fx } = ctx;
  const { player } = state;
  const pcx = player.pos.x + player.width / 2;
  for (const ic of hz.icicles) {
    if (ic.state === 'gone') continue;
    ic.t++;
    if (ic.state === 'hang') {
      if (Math.abs(pcx - ic.x) < ICICLE_TRIGGER && player.pos.y > ic.y) { ic.state = 'shake'; ic.t = 0; }
    } else if (ic.state === 'shake') {
      if (ic.t % 6 === 0) state.particles.push({ pos: { x: ic.x + (Math.random() - 0.5) * 16, y: ic.y + 2 }, vel: { x: 0, y: 1 + Math.random() }, life: 20, color: '#E0F2FE', size: 2 + Math.random() * 2 });
      if (ic.t >= ICICLE_SHAKE) { ic.state = 'fall'; ic.t = 0; }
    } else {
      ic.vy = Math.min(16, ic.vy + GRAVITY * 0.9);
      ic.fy += ic.vy;
      const box = { x: ic.x - ICICLE_W / 2, y: ic.fy, w: ICICLE_W, h: ICICLE_H };
      if (player.invincibilityTimer <= 0 && rectsOverlap(box, boundsOf(player))) {
        hurtPlayer(ctx, ICICLE_DAMAGE, 'icicle', { x: pcx < ic.x ? -4 : 4, y: -4 });
        shatter(ctx, ic.x, ic.fy + ICICLE_H);
        ic.state = 'gone';
        continue;
      }
      // It spears enemies too
      for (const e of state.enemies) {
        if (e.type === 'boss' || e.health <= 0 || e.isBlownAway || !isOnScreen(state.camera, e) || !rectsOverlap(box, boundsOf(e))) continue;
        e.health -= 60;
        fx.spawnDamageNumber(e.pos, 60, true);
        if (e.health <= 0) { fx.blowAwayEnemy(e, { x: 0, y: -8 }, 'charge_kill'); fx.spawnKillCallout(e, 'shatter'); }
        shatter(ctx, ic.x, ic.fy + ICICLE_H);
        ic.state = 'gone';
        break;
      }
      if (ic.state === 'gone') continue;
      const floor = floorTopAt(state.blocks, ic.x, ic.fy + ICICLE_H, 0);
      if (floor !== null && ic.fy + ICICLE_H >= floor) { shatter(ctx, ic.x, floor); ic.state = 'gone'; }
      else if (ic.fy > state.camera.y + 1200) ic.state = 'gone';
    }
  }
};

const shatter = (ctx: FrameContext, x: number, y: number) => {
  for (let i = 0; i < 12; i++) {
    ctx.state.particles.push({
      pos: { x, y: y - 6 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 5 },
      life: 22 + Math.random() * 16, color: i % 3 ? '#E0F2FE' : '#FFFFFF', size: 2 + Math.random() * 4, isGlass: i % 2 === 0,
    });
  }
  ctx.fx.playGunSound('ice');
};

// ---------------------------------------------------------------------------

const updateCrumbles = (ctx: FrameContext, hz: Hazards) => {
  const { state } = ctx;
  const { player } = state;
  for (const c of hz.crumbles) {
    const b = c.block;
    c.t++;
    if (c.state === 'solid') {
      const standing = player.pos.y + player.height >= b.y - 2 && player.pos.y + player.height <= b.y + 4
        && player.pos.x + player.width > b.x && player.pos.x < b.x + b.w && player.vel.y >= 0;
      if (standing) { c.state = 'shake'; c.t = 0; }
    } else if (c.state === 'shake') {
      if (c.t % 5 === 0) state.particles.push({ pos: { x: b.x + Math.random() * b.w, y: b.y + b.h }, vel: { x: 0, y: 1.5 }, life: 18, color: '#DBEAFE', size: 2 + Math.random() * 3 });
      if (c.t >= CRUMBLE_SHAKE) {
        c.state = 'gone'; c.t = 0;
        state.blocks = state.blocks.filter(x => x !== b);
        for (let i = 0; i < 10; i++) {
          state.particles.push({ pos: { x: b.x + (i / 10) * b.w, y: b.y + 6 }, vel: { x: (Math.random() - 0.5) * 3, y: 1 + Math.random() * 3 }, life: 40, color: i % 2 ? '#BFDBFE' : '#E0F2FE', size: 5 + Math.random() * 6, isGlass: true });
        }
        ctx.fx.playGunSound('ice');
      }
    } else if (c.t >= CRUMBLE_REFREEZE && !rectsOverlap({ x: b.x - 10, y: b.y - 70, w: b.w + 20, h: 90 }, boundsOf(player))) {
      // Freezes back over (as long as you're not in the way)
      c.state = 'solid'; c.t = 0;
      state.blocks.push(b);
    }
  }
};

// ---------------------------------------------------------------------------

const updateWind = (ctx: FrameContext) => {
  const { state } = ctx;
  const { player } = state;
  const pcx = player.pos.x + player.width / 2;
  for (const w of COURSE.winds) {
    if (pcx < w.x1 || pcx > w.x2 || !windBlowing(w, state.frame)) continue;
    // A shove, not a current: harder in the air, and nothing while you're mid-special
    if (player.isCharging || player.isDivekicking || player.isUppercutting) continue;
    state.windPushX = (state.windPushX || 0) + w.push * (player.isGrounded ? 1 : 1.35);
  }
};

// ---------------------------------------------------------------------------

/** Chutes only roll while you're this close. */
export const CHUTE_RANGE = 1100;
/** How long a snowball rattles in the chute mouth before it drops out. */
export const CHUTE_WARN_FRAMES = 55;

/** Is this chute rolling snowballs at him? (He's near it, and past the last crevasse before it.) */
export const chuteLive = (ch: SnowballChute, playerX: number) => Math.abs(playerX - ch.x) <= CHUTE_RANGE && playerX >= ch.from;

const updateSnowballs = (ctx: FrameContext, hz: Hazards) => {
  const { state, fx } = ctx;
  const { player } = state;
  const pcx = player.pos.x + player.width / 2;
  // Chutes only roll while you're nearby
  COURSE.chutes.forEach((ch, i) => {
    if (!chuteLive(ch, pcx)) return;
    if (--hz.chuteTimers[i] > 0) {
      // Rattling in the chute mouth before it goes: snow shaken loose
      if (hz.chuteTimers[i] <= CHUTE_WARN_FRAMES && hz.chuteTimers[i] % 4 === 0) {
        state.particles.push({ pos: { x: ch.x + Math.random() * 30, y: ch.y - ch.size - 20 }, vel: { x: -Math.random(), y: 0.5 + Math.random() }, life: 20, color: '#F8FAFC', size: 2 + Math.random() * 2 });
      }
      return;
    }
    hz.chuteTimers[i] = ch.every;
    const r = ch.size / 2;
    hz.snowballs.push({ x: ch.x, y: ch.y - r, r, vx: -ch.speed, vy: 0, rot: 0, big: ch.size > 40 });
  });

  hz.snowballs = hz.snowballs.filter(s => {
    const ground = groundLineAt(state.groundRuns, s.x);
    if (s.y + s.r < ground - 1 || ground === Infinity) {
      // Airborne (off a ledge, or down a crevasse)
      s.vy += GRAVITY;
      s.y += s.vy;
      if (ground !== Infinity && s.y + s.r >= ground) { s.y = ground - s.r; s.vy = 0; }
    } else {
      // Rolling: picks up speed downhill (it's all downhill toward you)
      const ahead = groundLineAt(state.groundRuns, s.x + Math.sign(s.vx) * 10);
      const slope = ahead === Infinity ? 0 : (ahead - ground) / 10;
      s.vx += Math.sign(s.vx) * Math.max(0, slope) * 0.25;
      s.vx = Math.max(-9, Math.min(9, s.vx));
      s.y = ground - s.r;
    }
    s.x += s.vx;
    s.rot += s.vx / s.r;
    const box = { x: s.x - s.r * 0.8, y: s.y - s.r * 0.8, w: s.r * 1.6, h: s.r * 1.6 };
    // Shot, or smashed by a special move: bursts
    const shot = state.projectiles.find(p => p.owner === 'player' && !p.isSludge && rectsOverlap(boundsOf(p), box));
    const smashed = (player.isCharging || player.isUppercutting || player.isDivekicking) && rectsOverlap(boundsOf(player), box);
    if (shot || smashed) {
      if (shot && !shot.isBoulder && !shot.isTsunami) shot.health = 0;
      burst(ctx, s);
      return false;
    }
    if (player.invincibilityTimer <= 0 && rectsOverlap(box, boundsOf(player))) {
      hurtPlayer(ctx, s.big ? 18 : 10, 'snowball', { x: s.vx * 1.4, y: s.big ? -8 : -5 });
      burst(ctx, s);
      return false;
    }
    // Bowls over enemies in its path (and keeps rolling if it's a big one)
    for (const e of state.enemies) {
      if (e.type === 'boss' || e.health <= 0 || e.isBlownAway || e.kind === 'eagle' || !isOnScreen(state.camera, e) || !rectsOverlap(box, boundsOf(e))) continue;
      e.health -= s.big ? 60 : 30;
      fx.spawnDamageNumber(e.pos, s.big ? 60 : 30);
      if (e.health <= 0) { fx.blowAwayEnemy(e, { x: s.vx * 1.5, y: -9 }, 'charge_kill'); fx.spawnKillCallout(e, 'crush'); }
      else { e.vel.x = s.vx * 1.2; e.pauseTimer = 30; }
      if (!s.big) { burst(ctx, s); return false; }
    }
    return s.x > state.camera.x - 600 && s.y < state.camera.y + 1200;
  });
};

const burst = (ctx: FrameContext, s: Snowball) => {
  for (let i = 0; i < (s.big ? 18 : 10); i++) {
    ctx.state.particles.push({
      pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 8 + s.vx * 0.3, y: -Math.random() * 6 },
      life: 25 + Math.random() * 20, color: i % 3 ? '#FFFFFF' : '#DBEAFE', size: 4 + Math.random() * 6,
    });
  }
};
