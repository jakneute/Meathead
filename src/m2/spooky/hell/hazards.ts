// Real hell's hazards: the lava (HOT FOOT: hurt and bounced back up out of it; killed in it, he goes under), the rocks
// that crumble under him (and come back a while later), the fire jets (a glow and a hiss, then a column of fire: a
// rhythm to learn), the imps' fireballs, and the elevator cars still coming down the shaft into the pit (a shadow and
// a creak first). Plus anything that isn't flying that ends up in the lava: cooked.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Rect } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { rectsOverlap, boundsOf } from '../../../m1/game/core/utils';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { ledge, meatheadSays, box } from '../section';
import { GY } from '../geometry';
import { POOLS, LAVA_DROP, CRUMBLES, JETS, SHAFT_L, SHAFT_R } from './layout';
import { hellOf, type Hell } from './state';
import { overLava, IMP_FIRE } from './kinds';
import { HURT_LAVA, DEATH_LAVA, HURT_JET, DEATH_JET, HURT_CAR, DEATH_CAR, MH_CAR } from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export const LAVA = 'm2:hell_lava', JET = 'm2:hell_jet', CAR = 'm2:hell_car';
const LAVA_DMG = 16, LAVA_LAUNCH = 13, JET_DMG = 18, FIREBALL_DMG = 12, CAR_DMG = 30;
/** A jet's cycle: quiet, then the warning (WARN..BLAST), then the fire (BLAST..CYCLE). */
const CYCLE = 160, WARN = 70, BLAST = 112, JET_H = 170;
/** A crumbling rock: shaking this long before it goes; back this long after. */
const SHAKE = 32, BACK = 210;
const CAR_W = 120, CAR_H = 110;

const near = (state: GameState, x: number, m = 200) => x > state.camera.x - m && x < state.camera.x + CANVAS_WIDTH + m;
const hurtbox = (state: GameState): Rect => {
  const p = state.player;
  return p.isDucking ? { x: p.pos.x + 2, y: p.pos.y + (p.height - 26), w: p.width - 4, h: 26 } : boundsOf(p);
};

/** The crumbling rocks, as ledges (in build). */
export const buildHazards = (state: GameState, h: Hell) => {
  h.crumbles = CRUMBLES.map(([x, y, w]) => ({ b: ledge(state, x, y, w, { hidden: true, tag: 'hell-crumble' }), x, y, w, shake: 0, gone: 0 }));
};

const jetPhase = (f: number, off: number) => (f + off) % CYCLE;

export const updateHazards = (ctx: FrameContext, h: Hell) => {
  const { state } = ctx, p = state.player, f = state.frame;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const alive = p.health > 0 && state.deathTimer <= 0;
  // The lava: HOT FOOT, straight back up out of it (killed in it: he goes under, see the 'lava' death)
  if (alive && overLava(cx) && feet >= GY + LAVA_DROP - 2) {
    if (p.invincibilityTimer <= 0) {
      hurtPlayer(ctx, LAVA_DMG, LAVA, { x: p.vel.x * 0.5, y: -LAVA_LAUNCH });
      if (p.health > 0) ctx.fx.spawnDamageNumber({ x: cx - 30, y: p.pos.y - 20 }, 'HOT FOOT!', true, '#F97316');
    }
    if (p.health > 0) { p.vel.y = -LAVA_LAUNCH; p.isGrounded = false; p.isCharging = false; p.isSliding = false; }
    for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: cx, y: GY + LAVA_DROP }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 6 }, life: 26, color: i % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 4 });
    playSound('ignite');
  }
  // Anything else in it cooks (not what flies)
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway || e.enemyType === 'flyer' || e.type === 'boss' || !e.kind?.startsWith('m2:')) continue;
    const ex = e.pos.x + e.width / 2;
    if (overLava(ex) && e.pos.y + e.height >= GY + LAVA_DROP - 2) { e.health = 0; ctx.fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'cooked'); }
  }
  // The crumbling rocks
  for (const c of h.crumbles) {
    if (c.gone > 0) {
      c.gone++;
      const over = rectsOverlap(boundsOf(p), { x: c.x, y: c.y - 4, w: c.w, h: 20 });
      if (c.gone > BACK && !over) { c.gone = 0; c.shake = 0; c.b.x = c.x; if (near(state, c.x)) playSound('crunch', 0.3, 6); }
    } else if (c.shake > 0) {
      c.shake++;
      if (c.shake % 6 === 0 && near(state, c.x)) state.particles.push({ pos: { x: c.x + Math.random() * c.w, y: c.y + 14 }, vel: { x: 0, y: 1 }, life: 30, color: '#57534E', size: 3, grav: 0.3 });
      if (c.shake > SHAKE) {
        c.gone = 1; c.b.x = -1e7;
        playSound('crunch', 0.8, -4); playSound('crack', 0.5);
        for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: c.x + Math.random() * c.w, y: c.y + Math.random() * 12 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 40, color: i % 2 ? '#44403C' : '#292524', size: 4 + Math.random() * 5, grav: 0.35, chunk: true });
      }
    } else if (p.isGrounded && Math.abs(feet - c.y) < 4 && cx > c.x - 4 && cx < c.x + c.w + 4) { c.shake = 1; playSound('crack', 0.6, 4); }
  }
  // The fire jets
  for (const [x, base, off] of JETS) {
    const ph = jetPhase(f, off);
    if (!near(state, x, 300)) continue;
    if (ph === WARN) playSound('rumble', 0.25, 6);
    if (ph > WARN && ph < BLAST && ph % 6 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 16, y: base - 4 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1.2 - Math.random() }, life: 30, color: 'rgba(87, 83, 78, 0.6)', size: 5 + Math.random() * 4 });
    if (ph === BLAST) { playSound('flame', 0.7); playSound('ignite', 0.6, -4); }
    if (ph >= BLAST && alive && p.invincibilityTimer <= 0 && rectsOverlap(hurtbox(state), { x: x - 18, y: base - JET_H, w: 36, h: JET_H })) {
      const dir = Math.sign(cx - x) || -p.facing;
      hurtPlayer(ctx, JET_DMG, JET, { x: dir * 7, y: -9 });
    }
  }
  // The imps' fireballs
  h.shots = h.shots.filter(s => {
    s.vy += 0.25; s.x += s.vx; s.y += s.vy; s.life--;
    if (s.life % 3 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: 0, y: -0.6 }, life: 14, color: s.life % 2 ? '#F97316' : '#FDE047', size: 3 + Math.random() * 2 });
    if (alive && p.invincibilityTimer <= 0 && rectsOverlap(hurtbox(state), { x: s.x - 7, y: s.y - 7, w: 14, h: 14 })) {
      hurtPlayer(ctx, FIREBALL_DMG, IMP_FIRE, { x: Math.sign(s.vx || 1) * 5, y: -6 });
      burst(state, s.x, s.y);
      return false;
    }
    const floor = floorTopAt(state.blocks, s.x, s.y, 0);
    if ((floor !== null && s.y >= floor) || s.y > GY + LAVA_DROP || s.life <= 0) { burst(state, s.x, Math.min(s.y, floor ?? s.y)); return false; }
    return true;
  });
  updateCars(ctx, h);
};

const burst = (state: GameState, x: number, y: number) => {
  if (near(state, x)) playSound('ignite', 0.4, 4);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? '#F97316' : '#FDE047', size: 2 + Math.random() * 3 });
};

/** The cars still coming down the shaft while he's in the pit: a shadow and a creak, then the crash. */
const updateCars = (ctx: FrameContext, h: Hell) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  const inPit = cx < SHAFT_R + 300 && p.health > 0 && !p.inCutscene;
  if (!h.car) {
    if (inPit && --h.carIn <= 0) {
      h.car = { x: Math.max(SHAFT_L + 90, Math.min(SHAFT_R - 90, cx + (Math.random() - 0.5) * 160)), y: GY - 1400, vy: 0, warn: 90 };
      playSound('grind', 0.6, -10);
    }
    return;
  }
  const car = h.car;
  if (car.warn > 0) {
    car.warn--;
    if (car.warn % 8 === 0) state.particles.push({ pos: { x: car.x + (Math.random() - 0.5) * CAR_W, y: state.camera.y - 10 }, vel: { x: 0, y: 3 + Math.random() * 3 }, life: 120, color: '#57534E', size: 2 + Math.random() * 3 });
    if (car.warn === 40) playSound('grind', 0.8, -6);
    return;
  }
  car.vy = Math.min(32, car.vy + 1.3); car.y += car.vy;
  // (keeping just above the screen till it's coming in, so it's not falling forever out of sight)
  car.y = Math.max(car.y, state.camera.y - 300);
  if (car.y < GY) return;
  // The crash
  car.y = GY;
  playSound('crash', 1, -6); playSound('clang', 0.9, -8); playSound('splat', 0.8, -4); shakeScreen(state, 22, 9);
  for (let i = 0; i < 30; i++) state.particles.push({ pos: { x: car.x + (Math.random() - 0.5) * CAR_W, y: GY - Math.random() * 60 }, vel: { x: (Math.random() - 0.5) * 12, y: -3 - Math.random() * 8 }, life: 40 + Math.random() * 30, color: i % 3 === 0 ? '#71717A' : i % 3 === 1 ? '#991B1B' : '#7F1D1D', size: 3 + Math.random() * 5, grav: 0.4, chunk: i % 3 === 0 });
  const feet = p.pos.y + p.height;
  if (p.health > 0 && Math.abs(cx - car.x) < CAR_W / 2 + 16 && feet > GY - CAR_H - 10 && p.invincibilityTimer <= 0) {
    hurtPlayer(ctx, CAR_DMG, CAR, { x: (Math.sign(cx - car.x) || 1) * 9, y: -8 });
  } else if (p.health > 0 && !h.carSaid) { h.carSaid = true; meatheadSays(state, pick(MH_CAR), false); }
  h.piled.push(car.x);
  if (h.piled.length > 4) h.piled.shift();
  h.car = null; h.carIn = 1100 + Math.random() * 500;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: boxes), world space

/** A wrecked elevator car (the ride's: an elevator cab, red and gold, ELEVATOR TO HELL on a plate over its doors),
 *  crumpled, its doors burst, at (x, the ground), tipped `tilt`. */
export const drawWreckedCar = (c: Ctx, x: number, y: number, tilt: number, f: number) => {
  c.save(); c.translate(x, y); c.rotate(tilt);
  // (the cab, its roof caved in on one side)
  box(c, -56, -124, 112, 124, '#7F1D1D'); box(c, -56, -124, 112, 5, '#B91C1C'); box(c, -56, -6, 112, 6, '#450A0A');
  c.fillStyle = '#450A0A'; c.beginPath(); c.moveTo(10, -124); c.lineTo(56, -124); c.lineTo(56, -92); c.lineTo(30, -108); c.closePath(); c.fill();
  box(c, -56, -116, 4, 110, '#CA8A04'); box(c, 52, -116, 4, 110, '#CA8A04');
  // (inside, dark; the doors burst out, one hanging)
  box(c, -40, -100, 80, 94, '#0C0A09');
  box(c, -40, -100, 30, 94, '#71717A'); box(c, -38, -98, 2, 90, '#A1A1AA');
  c.fillStyle = '#52525B'; c.beginPath(); c.moveTo(14, -100); c.lineTo(48, -92); c.lineTo(44, 0); c.lineTo(14, -6); c.closePath(); c.fill();
  // (the lap bar, bent; somebody's arm still over it)
  box(c, -10, -52, 26, 5, '#CA8A04'); box(c, 0, -60, 22, 7, '#9333EA'); box(c, 20, -60, 7, 7, '#F1C27D');
  // (the plate over the doors; the floor-number dial stuck on the H)
  box(c, -50, -122, 100, 14, '#18181B');
  c.font = '6px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#FDE68A'; c.fillText('ELEVATOR TO HELL', 0, -112); c.textAlign = 'left';
  box(c, -8, -138, 16, 14, '#CA8A04'); box(c, -5, -135, 10, 8, '#18181B');
  c.font = '6px "Press Start 2P"'; c.fillStyle = f % 60 < 30 ? '#EF4444' : '#7F1D1D'; c.fillText('H', -3, -128);
  // (blood down its front)
  box(c, -30, -8, 40, 8, '#991B1B'); box(c, -24, -40, 5, 34, '#991B1B'); box(c, 4, -30, 4, 24, '#7F1D1D');
  c.restore();
};

/** The lava pools: glowing, bubbling, banded (no lip: not something to stand on). */
export const drawLava = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [a, b] of POOLS) {
    if (b < state.camera.x - 100 || a > state.camera.x + CANVAS_WIDTH + 100) continue;
    const top = GY + LAVA_DROP;
    box(c, a, top, b - a, 400, '#7C2D12');
    box(c, a, top, b - a, 22, '#C2410C');
    box(c, a, top, b - a, 8, '#F97316');
    for (let x = a + ((f >> 2) % 24); x < b - 8; x += 24) box(c, x, top + 1, 10, 3, '#FDE047');
    for (let i = 0; i < 3; i++) {
      const bx = a + 20 + ((i * 137 + Math.floor(f / 40) * 59) % Math.max(1, b - a - 40)), ph = (f + i * 13) % 40;
      if (ph < 20) { c.fillStyle = '#FB923C'; c.beginPath(); c.arc(bx, top + 2, 2 + ph * 0.25, Math.PI, 0); c.fill(); }
    }
    // (the walls of the pool: rock down to it)
    box(c, a - 4, GY, 4, LAVA_DROP, '#292524'); box(c, b, GY, 4, LAVA_DROP, '#292524');
  }
};

export const drawHazards = (c: Ctx, state: GameState) => {
  const h = hellOf(state), f = state.frame;
  // The crumbling rocks: cracked, shaking when he's on them
  for (const r of h.crumbles) {
    if (r.gone > 0 || !near(state, r.x)) continue;
    const sh = r.shake > 0 ? Math.sin(r.shake * 1.9) * 2 : 0;
    box(c, r.x + sh, r.y, r.w, 18, '#44403C'); box(c, r.x + sh, r.y, r.w, 3, '#FB923C');
    box(c, r.x + sh + 6, r.y + 18, r.w - 12, 8, '#292524');
    c.strokeStyle = '#1C1917'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(r.x + sh + r.w * 0.3, r.y + 3); c.lineTo(r.x + sh + r.w * 0.4, r.y + 12); c.lineTo(r.x + sh + r.w * 0.35, r.y + 18); c.stroke();
    c.beginPath(); c.moveTo(r.x + sh + r.w * 0.7, r.y + 3); c.lineTo(r.x + sh + r.w * 0.62, r.y + 14); c.stroke();
  }
  // The fire jets: the vent, its warning glow and smoke, the column of fire
  for (const [x, base, off] of JETS) {
    if (!near(state, x)) continue;
    const ph = jetPhase(f, off);
    box(c, x - 16, base - 6, 32, 6, '#1C1917'); box(c, x - 10, base - 4, 20, 3, ph > WARN ? '#F97316' : '#7C2D12');
    if (ph > WARN && ph < BLAST) {
      const k = (ph - WARN) / (BLAST - WARN);
      c.fillStyle = `rgba(249, 115, 22, ${0.15 + k * 0.35})`; c.beginPath(); c.ellipse(x, base - 3, 18 + k * 10, 6 + k * 4, 0, 0, Math.PI * 2); c.fill();
      if (ph % 8 < 4) box(c, x - 3, base - 10 - k * 14, 6, 8, '#FDE047');
    }
    if (ph >= BLAST) {
      const k = Math.min(1, (ph - BLAST) / 6), hgt = JET_H * k;
      for (let i = 0; i < 5; i++) {
        const w = 34 - i * 6, wob = Math.sin(f * 0.8 + i) * 3;
        box(c, x - w / 2 + wob, base - hgt + i * 6, w, hgt - i * 6, ['#B91C1C', '#EA580C', '#F97316', '#FDBA74', '#FEF9C3'][i]);
      }
    }
  }
  // Wrecks piled up from the cars that have come down since
  h.piled.forEach((x, i) => drawWreckedCar(c, x, GY, (i % 2 ? 0.12 : -0.1), f));
};

/** Over everything: the fireballs, the car coming down (and its shadow). */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const h = hellOf(state);
  for (const s of h.shots) {
    c.fillStyle = 'rgba(249, 115, 22, 0.35)'; c.beginPath(); c.arc(s.x, s.y, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F97316'; c.beginPath(); c.arc(s.x, s.y, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FEF08A'; c.beginPath(); c.arc(s.x, s.y, 3, 0, Math.PI * 2); c.fill();
  }
  const car = h.car;
  if (car) {
    // (the shadow on the floor, darker and wider the nearer it is)
    const k = car.warn > 0 ? 0.3 + (1 - car.warn / 90) * 0.3 : 0.6 + Math.min(0.4, car.vy / 80);
    c.fillStyle = `rgba(0, 0, 0, ${k})`; c.beginPath(); c.ellipse(car.x, GY - 2, CAR_W / 2 * (0.5 + k * 0.6), 6, 0, 0, Math.PI * 2); c.fill();
    if (car.warn <= 0) drawWreckedCar(c, car.x, car.y, 0, state.frame);
  }
};

registerHurtLines(LAVA, HURT_LAVA, DEATH_LAVA);
registerDeathKind(LAVA, 'lava');
registerHurtLines(JET, HURT_JET, DEATH_JET);
registerDeathKind(JET, 'burnt');
registerHurtLines(CAR, HURT_CAR, DEATH_CAR);
registerDeathKind(CAR, 'flattened');
