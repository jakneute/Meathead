// An easter egg down in the lab: the test subjects are on something already. Overdose one (the needles, as many as
// it takes to put anybody else on the floor) and it doesn't go down: it goes into HYPERMODE. Twice as fast as it
// was, nothing touches it (it's a mid-boss now as far as the weapons are concerned, and a mid-boss that takes
// nothing), and if it gets to him it picks him up and tears him in half, the top half one way, the legs the other.
// It can't last: give it long enough and its heart gives out.

import type { Enemy, Projectile } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { GROUND_Y, NEEDLE_OVERDOSE_THRESHOLD } from '../../../constants';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { stickNeedle, ENEMY_NEEDLE } from '../../combat/needles';
import { killPlayer } from '../../player/player';
import { playSound } from '../../platform/audio';
import { say, MEATHEAD_VOICE } from '../../platform/speech';
import { drawKindEnemy } from '../../render/enemies';
import { drawFlung, drawTorsoHalf, drawLegsHalf } from '../../render/player/moves';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

/** How fast it goes after him, how high it leaps for him, how long before its heart gives out. */
const HYPER_SPEED = 9.5, HYPER_LEAP = -13.5, HYPER_BURN = 660;
/** Torn in half: held up and pulled at; the tear; how long the halves fly before the death screen. */
export const RIP_TEAR = 26, RIP_END = 120;

/** One of his halves, flying: where, how fast, its spin, and whether it's down on the floor. */
export interface Half { x: number; y: number; vx: number; vy: number; spin: number; rate: number; down: boolean }
export interface Rip { t: number; x: number; y: number; dir: 1 | -1; halves?: Half[] }

/** What the death screen says: what he did wrong. */
const RIP_LINES = [
  "DON'T OVERDOSE THE TEST SUBJECTS",
  'FOUR NEEDLES IN A MUTANT WAS THREE TOO MANY',
  'YOU GAVE THE LAB EXPERIMENT SUPER STRENGTH',
  'NEVER DOPE A SCIENCE PROJECT',
];

/** A dart (or anything else) into a test subject. Returns true if it's dealt with here. */
export const hitSubject = (ctx: FrameContext, e: Enemy, p: Projectile): boolean | undefined => {
  const { state, fx } = ctx;
  // On hypermode: nothing gets through
  if (e.hyper) {
    if (state.frame % 6 === 0) fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 20 }, 'NO EFFECT!', false, '#A3E635');
    if (p.isDart) stickNeedle(e, p, ENEMY_NEEDLE);
    return true;
  }
  // The dart that'd overdose anybody else: HYPERMODE
  if (p.isDart && (e.needleCount || 0) + 1 >= NEEDLE_OVERDOSE_THRESHOLD) {
    stickNeedle(e, p, ENEMY_NEEDLE);
    goHyper(ctx, e);
    return true;
  }
  return undefined;
};

const goHyper = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx;
  e.hyper = 1;
  // (nothing it's got in it's going to finish it now)
  e.needleCount = 0;
  e.health = e.maxHealth = 1e6;
  e.pauseTimer = 0; e.frozenTimer = 0; e.isTased = false; e.sludgeTimer = 0; e.isOiled = false; e.fireTimer = 0;
  e.hitFlash = 20;
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 40 }, 'HYPERMODE!', true, '#EF4444');
  fx.spawnExplosion({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 }, '#84CC16', 26, 0, 14);
  shakeScreen(state, 20, 8);
  playSound('slam'); playSound('crunch', 0.8, -8);
  say('UH OH. THAT ONE WAS ONE TOO MANY.', MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = 'UH OH. THAT ONE WAS ONE TOO MANY.'; state.playerVulgarityTimer = 150; },
    onHide: () => { state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
};

/** A frame of a hyped-up test subject: after him, flat out, leaping for him; the grab; or its heart going. */
export const updateHyper = (ctx: FrameContext, e: Enemy, rip: Rip | null, startRip: (r: Rip) => void): boolean => {
  const { state, fx } = ctx;
  const p = state.player;
  if (rip) return true;
  e.hyper!++;
  e.health = e.maxHealth;
  // Its heart gives out
  if (e.hyper! > HYPER_BURN) {
    e.hyper = 0;
    e.health = 0;
    fx.blowAwayEnemy(e, { x: 0, y: -14 }, 'dart_kill');
    e.overdosed = true;
    fx.spawnKillCallout(e, 'overdose');
    fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 40 }, 'HEART ATTACK!', true, '#EF4444');
    return true;
  }
  // After him
  const dx = p.pos.x + p.width / 2 - (e.pos.x + e.width / 2);
  const dir = dx < 0 ? -1 : 1;
  e.facing = dir;
  e.vel.x += (dir * HYPER_SPEED - e.vel.x) * 0.25;
  const grounded = e.vel.y === 0;
  if (grounded && p.pos.y + p.height < e.pos.y + e.height - 30 && Math.abs(dx) < 180) { e.vel.y = HYPER_LEAP; playSound('jump', 0.8, -6); }
  e.vel.y += 0.8;
  const nx = e.pos.x + e.vel.x;
  const into = state.blocks.some(b => b.type === 'wall' && rectsOverlap({ x: nx, y: e.pos.y, w: e.width, h: e.height - 4 }, b));
  if (into) e.vel.x = 0; else e.pos.x = nx;
  const feet = e.pos.y + e.height, nfeet = feet + e.vel.y;
  let floor = Y;
  if (e.vel.y > 0) for (const b of state.blocks) if (b.type === 'platform' && e.pos.x + e.width > b.x && e.pos.x < b.x + b.w && feet <= b.y + 1 && nfeet >= b.y) floor = Math.min(floor, b.y);
  if (nfeet >= floor) { e.pos.y = floor - e.height; e.vel.y = 0; } else e.pos.y += e.vel.y;
  // (steaming, veins lit, footsteps like dropped safes)
  if (state.frame % 3 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * 30 }, vel: { x: -e.vel.x * 0.2, y: -1 - Math.random() * 2 }, life: 24, color: Math.random() < 0.5 ? 'rgba(132, 204, 22, 0.7)' : 'rgba(248, 113, 113, 0.6)', size: 4 + Math.random() * 4 });
  if (grounded && state.frame % 9 === 0) { playSound('thud', 0.5, -6); shakeScreen(state, 3, 2); }
  // Got him
  if (state.deathTimer <= 0 && !ctx.cheats.invincible && rectsOverlap(boundsOf(e), boundsOf(p))) {
    e.vel = { x: 0, y: 0 };
    startRip({ t: 0, x: e.pos.x + e.width / 2, y: e.pos.y - 10, dir: dir as 1 | -1 });
    p.hidden = true;
    state.deathScene = { t: 0, len: RIP_END, voiced: false };
    killPlayer(ctx, RIP_LINES[Math.floor(Math.random() * RIP_LINES.length)], false);
    shakeScreen(state, 14, 6);
    playSound('punch');
  }
  return true;
};

/** Each frame of it (the stage's death scene): the strain, the tear, the halves landing. */
export const tickRip = (ctx: FrameContext, rip: Rip) => {
  const { state, fx } = ctx;
  rip.t++;
  const t = rip.t;
  if (t < RIP_TEAR && t % 8 === 0) playSound('crunch', 0.5, -4);
  if (t === RIP_TEAR) {
    // (the top half one way, the legs the other)
    const d = rip.dir;
    rip.halves = [
      { x: rip.x, y: rip.y - 34, vx: d * 6.5, vy: -11, spin: 0, rate: 0.3 * d, down: false },
      { x: rip.x, y: rip.y - 4, vx: -d * 5.5, vy: -8, spin: 0, rate: -0.35 * d, down: false },
    ];
    playSound('splat'); playSound('crunch'); playSound('crack');
    shakeScreen(state, 24, 10);
    fx.spawnDeathShower({ x: rip.x, y: rip.y - 30 }, 0, 4);
    fx.spawnDamageNumber({ x: rip.x - 30, y: rip.y - 90 }, 'MAKE A WISH!', true, '#EF4444');
  }
  if (rip.halves) for (const h of rip.halves) flyHalf(ctx, h);
  // (blood off both halves as they go)
  if (t > RIP_TEAR && t < RIP_TEAR + 50) for (const h of rip.halves ?? []) state.particles.push({ pos: { x: h.x, y: h.y }, vel: { x: (Math.random() - 0.5) * 2, y: Math.random() * 2 }, life: 40, color: Math.random() < 0.5 ? '#991B1B' : '#DC2626', size: 2 + Math.random() * 3 });
};

/** How far each half reaches from its middle (for the walls), the floor they come down on, and gravity. */
const HALF_R = 16, HALF_FLOOR = Y - 12, HALF_G = 0.45;

/** Solid to a flying half: a wall, or the side of anything solid it's going into (not a ledge you jump up through). */
const solidAt = (state: GameState, x: number, y: number) =>
  state.blocks.find(b => (b.type === 'wall' || b.type === 'ground' || (b.type === 'platform' && !b.oneWay)) && x + HALF_R > b.x && x - HALF_R < b.x + b.w && y + HALF_R * 0.5 > b.y && y - HALF_R < b.y + b.h);

/**
 * A half in flight: up and over, spinning; into a wall, it doesn't go through it: it smacks off it and back (a smear
 * left on it, a thud); into a ceiling, it drops off it; down on the floor, a bounce, a skid, and still.
 */
const flyHalf = (ctx: FrameContext, h: Half) => {
  const { state, fx } = ctx;
  if (h.down) { h.x += h.vx; h.vx *= 0.8; if (Math.abs(h.vx) < 0.1) h.vx = 0; if (solidAt(state, h.x, h.y - HALF_R)) { h.x -= h.vx; h.vx = 0; } return; }
  h.vy += HALF_G;
  // (sideways: into a wall, and off it)
  const nx = h.x + h.vx;
  if (solidAt(state, nx, h.y)) {
    fx.spawnExplosion({ x: h.x + Math.sign(h.vx) * HALF_R, y: h.y }, '#991B1B', 8, -Math.sign(h.vx) * 3, 6);
    playSound('thud', 0.7);
    h.vx = -h.vx * 0.45; h.rate = -h.rate * 0.6;
  } else h.x = nx;
  // (up into a ceiling: down off it)
  const ny = h.y + h.vy;
  if (h.vy < 0 && solidAt(state, h.x, ny)) h.vy = Math.abs(h.vy) * 0.3;
  else h.y = ny;
  h.spin += h.rate;
  // (down on the floor: a little bounce if it came down hard, then it lies there, skidding to a stop)
  if (h.y >= HALF_FLOOR) {
    h.y = HALF_FLOOR;
    if (h.vy > 6) { h.vy = -h.vy * 0.25; h.vx *= 0.6; playSound('thud', 0.8); return; }
    h.vy = 0; h.down = true; h.vx *= 0.5;
    h.spin = Math.round(h.spin / Math.PI) * Math.PI + Math.PI / 2;
    playSound('thud');
  }
};

/** The halves, in the world (and him held up whole before that). */
export const drawRip = (ctx: Ctx, state: GameState, rip: Rip) => {
  const t = rip.t;
  if (t < RIP_TEAR) {
    // Held up over its head by the top and the legs, pulled at, shaking
    const shake = (Math.random() - 0.5) * (1 + t / 8);
    ctx.save(); ctx.translate(rip.x + shake, rip.y - 30); ctx.rotate(Math.PI / 2 * rip.dir); ctx.scale(1, 1 + t / RIP_TEAR * 0.12);
    drawFlung(ctx, state.frame);
    ctx.restore();
    return;
  }
  if (!rip.halves) return;
  const [top, bottom] = rip.halves;
  ctx.save(); ctx.translate(top.x, top.y); ctx.rotate(top.spin); drawTorsoHalf(ctx, state.frame); ctx.restore();
  ctx.save(); ctx.translate(bottom.x, bottom.y); ctx.rotate(bottom.spin); drawLegsHalf(ctx, state.frame); ctx.restore();
};

/** A test subject on hypermode: glowing, steaming, a red haze off it, ghosts of itself behind it. */
export const drawHyper = (ctx: Ctx, e: Enemy, state: GameState) => {
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  const pulse = 0.5 + Math.sin(state.frame * 0.5) * 0.5;
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 70);
  g.addColorStop(0, `rgba(239, 68, 68, ${0.35 + pulse * 0.2})`); g.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = g; ctx.fillRect(cx - 70, cy - 70, 140, 140);
  // (afterimages)
  for (let k = 3; k >= 1; k--) {
    ctx.save(); ctx.globalAlpha = 0.15 / k; ctx.translate(-e.vel.x * k * 2, 0); ctx.filter = 'hue-rotate(250deg) saturate(3)';
    drawKindEnemy(ctx, e, state); ctx.restore();
  }
  ctx.save(); ctx.filter = `saturate(${2 + pulse}) brightness(${1 + pulse * 0.25})`; drawKindEnemy(ctx, e, state); ctx.restore();
};
