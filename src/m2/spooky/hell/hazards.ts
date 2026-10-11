// Real hell's hazards: the lava (HOT FOOT: hurt and bounced back up out of it; killed in it, he goes under), the rocks
// that crumble under him (and come back a while later), the fire jets (a glow and a hiss, then a column of fire: a
// rhythm to learn), the imps' fireballs, and the elevator cars still coming down the shaft into the pit (a shadow and
// a creak first). Plus anything that isn't flying that ends up in the lava: cooked.

import { pickLine } from '../../../m1/game/platform/speech';
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
import { ledge, meatheadSays } from '../section';
import { hazeBands } from '../../../m1/game/render/pixelArt';
import { type Ctx as PCtx, INK, box, checker, mix, stamp, BASALT, LAVA as LV, LIP, poly, inkPoly, lip } from './paint';
import { GY } from '../geometry';
import { POOLS, LAVA_DROP, CRUMBLES, JETS, SHAFT_L, SHAFT_R } from './layout';
import { hellOf, type Hell } from './state';
import { hazardVictims, hazardKill, hazardHit, setHazardZones, boxHits, type Zone } from '../../hazardHit';
import { overLava, IMP_FIRE } from './kinds';
import { HURT_LAVA, DEATH_LAVA, HURT_JET, DEATH_JET, HURT_CAR, DEATH_CAR, MH_CAR } from './lines';

type Ctx = PCtx;
const pick = pickLine;

export const LAVA = 'm2:hell_lava', JET = 'm2:hell_jet', CAR = 'm2:hell_car';
const LAVA_DMG = 16, LAVA_LAUNCH = 13, JET_DMG = 18, FIREBALL_DMG = 12, CAR_DMG = 30;
/** A jet's cycle: quiet, then the warning (WARN..BLAST), then the fire (BLAST..CYCLE). */
const CYCLE = 160, WARN = 70, BLAST = 112, JET_H = 150;
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
  // (where it's dangerous: the lava (to what walks), the jets' columns, a car's landing spot)
  const zones: Zone[] = POOLS.map(([a, b]) => ({ x0: a, x1: b, y0: GY - 10, y1: GY + LAVA_DROP + 60, ground: true }));
  for (const [x, base] of JETS) zones.push({ x0: x - 22, x1: x + 22, y0: base - 16 - JET_H, y1: base });
  if (h.car) zones.push({ x0: h.car.x - CAR_W / 2 - 16, x1: h.car.x + CAR_W / 2 + 16, y0: GY - 1400, y1: GY });
  setHazardZones(state, 'hell', zones);
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const alive = p.health > 0 && state.deathTimer <= 0;
  // The lava: HOT FOOT, straight back up out of it (killed in it: he goes under, see the 'lava' death)
  if (alive && overLava(cx) && feet >= GY + LAVA_DROP - 2) {
    // (popped back out toward the nearer bank, whatever he was doing: never bounced about in it till he's cooked)
    const pool = POOLS.find(([a, b]) => cx > a && cx < b)!;
    const bank = cx - pool[0] < pool[1] - cx ? -1 : 1, out = bank * Math.min(6, 2 + Math.min(cx - pool[0], pool[1] - cx) / 40);
    if (p.invincibilityTimer <= 0) {
      hurtPlayer(ctx, LAVA_DMG, LAVA, { x: out, y: -LAVA_LAUNCH });
      if (p.health > 0) ctx.fx.spawnDamageNumber({ x: cx - 30, y: p.pos.y - 20 }, 'HOT FOOT!', true, '#F97316');
    }
    if (p.health > 0) { p.vel.y = -LAVA_LAUNCH; if (p.pushbackTimer > 0 || Math.sign(p.vel.x) !== bank) p.vel.x = out; p.isGrounded = false; p.isCharging = false; p.isSliding = false; }
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
    // (one of them stood on it: it gives under them too)
    else if (hazardVictims(state, { flyers: false }).some(e => Math.abs(e.pos.y + e.height - c.y) < 4 && Math.abs(e.vel.y) < 0.5 && e.pos.x + e.width / 2 > c.x && e.pos.x + e.width / 2 < c.x + c.w)) { c.shake = 1; if (near(state, c.x)) playSound('crack', 0.6, 4); }
  }
  // The fire jets
  for (const [x, base, off] of JETS) {
    const ph = jetPhase(f, off);
    if (!near(state, x, 300)) continue;
    if (ph === WARN) playSound('rumble', 0.25, 6);
    if (ph > WARN && ph < BLAST && ph % 6 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 16, y: base - 4 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1.2 - Math.random() }, life: 30, color: 'rgba(87, 83, 78, 0.6)', size: 5 + Math.random() * 4 });
    if (ph === BLAST) { playSound('flame', 0.7); playSound('ignite', 0.6, -4); }
    // (anybody else in it: torched)
    if (ph >= BLAST) for (const e of hazardVictims(state)) if (boxHits(e, x - 18, base - 16 - JET_H, 36, JET_H + 16)) {
      if (hazardHit(ctx, e, 45, x, 'TORCHED!', { color: '#FDBA74', knock: 7 })) playSound('ignite', 0.7, -2);
    }
    if (ph >= BLAST && alive && p.invincibilityTimer <= 0 && rectsOverlap(hurtbox(state), { x: x - 18, y: base - 16 - JET_H, w: 36, h: JET_H + 16 })) {
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
      h.car = { x: Math.max(SHAFT_L + 420, Math.min(SHAFT_R - 90, cx + (Math.random() - 0.5) * 160)), y: GY - 1400, vy: 0, warn: 90 };
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
  // (whoever's under it: flat)
  for (const e of hazardVictims(state)) if (Math.abs(e.pos.x + e.width / 2 - car.x) < CAR_W / 2 + 10 && e.pos.y + e.height > GY - CAR_H - 10) hazardKill(ctx, e, car.x, 'FLATTENED!', { fling: { x: Math.sign(e.pos.x + e.width / 2 - car.x || 1) * 6, y: -4 }, sound: 'splat' });
  if (p.health > 0 && Math.abs(cx - car.x) < CAR_W / 2 + 16 && feet > GY - CAR_H - 10 && p.invincibilityTimer <= 0) {
    hurtPlayer(ctx, CAR_DMG, CAR, { x: (Math.sign(cx - car.x) || 1) * 9, y: -8 });
  } else if (p.health > 0 && !h.carSaid) { h.carSaid = true; meatheadSays(state, pick(MH_CAR), false); }
  h.piled.push(car.x);
  if (h.piled.length > 4) h.piled.shift();
  h.car = null; h.carIn = 1100 + Math.random() * 500;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing, world space (SNES: stepped ramps, dither, ink; the lava bright and plainly deadly, its light on things
// round it dim)

const CARP = ['#3A0606', '#5E0C0C', '#841414', '#A82020', '#C83A30'];
const GOLD = ['#5A3A06', '#8A6010', '#B8881C', '#DDB040', '#F6DC80'];
const STEEL = ['#2A2A30', '#4A4A54', '#6E6E7A', '#9696A2', '#C2C2CC'];

/** The car itself, unrotated, its feet at (0, 0) (painted once into a stamp, turned inside it). */
const paintCar = (g: Ctx, standable: boolean) => {
  // (the outline; the cab; its roof caved in on one side)
  box(g, -58, -126, 116, 126, INK);
  box(g, -56, -124, 112, 122, CARP[2]);
  box(g, -56, -124, 18, 122, CARP[3]); checker(g, -38, -124, 2, 122, CARP[3]);
  box(g, 40, -124, 16, 122, CARP[1]); checker(g, 38, -124, 2, 122, CARP[1], 1);
  box(g, -56, -10, 112, 8, CARP[0]);
  // (gold pilasters up its corners, a cornice along the top)
  for (const px of [-56, 50]) { box(g, px, -118, 6, 112, GOLD[2]); box(g, px, -118, 2, 112, GOLD[4]); box(g, px + 4, -118, 2, 112, GOLD[1]); }
  box(g, -56, -124, 112, 6, GOLD[2]); box(g, -56, -124, 112, 2, GOLD[4]); box(g, -56, -120, 112, 2, GOLD[1]);
  inkPoly(g, [[12, -126], [58, -126], [58, -90], [32, -106]], CARP[0], 2);
  box(g, 30, -112, 18, 2, CARP[1]);
  // (inside, dark; the back wall's plush; the doors burst out, one hanging)
  box(g, -42, -102, 84, 98, INK);
  box(g, -40, -100, 80, 94, '#160606');
  box(g, -36, -96, 72, 40, '#2E0A0E'); for (let x = -34; x < 36; x += 8) box(g, x, -96, 2, 40, '#3E1016');
  box(g, -40, -100, 30, 94, STEEL[2]); box(g, -40, -100, 4, 94, STEEL[3]); box(g, -38, -98, 1, 90, STEEL[4]); box(g, -14, -100, 4, 94, STEEL[1]);
  checker(g, -36, -100, 2, 94, STEEL[3]);
  inkPoly(g, [[14, -100], [48, -92], [44, 0], [14, -6]], STEEL[1], 2);
  poly(g, [[16, -97], [24, -95], [21, -8], [16, -8]], STEEL[2]);
  box(g, 30, -60, 6, 3, INK);
  // (the lap bar, bent)
  box(g, -11, -53, 28, 7, INK); box(g, -10, -52, 26, 5, GOLD[2]); box(g, -10, -52, 26, 1, GOLD[4]);
  // (the plate over the doors)
  box(g, -51, -117, 102, 14, INK); box(g, -50, -116, 100, 12, '#18181B'); box(g, -50, -116, 100, 1, '#3A3A42');
  g.font = '6px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = GOLD[4]; g.fillText('ELEVATOR TO HELL', 0, -107); g.textAlign = 'left';
  // (the floor dial on top: gold, its needle stuck on the H)
  box(g, -9, -139, 18, 14, INK); box(g, -8, -138, 16, 12, GOLD[2]); box(g, -8, -138, 16, 2, GOLD[4]); box(g, -5, -135, 10, 8, '#18181B');
  // (dents and scratches)
  for (const [x, y, w] of [[-30, -20, 14], [-48, -60, 8], [30, -30, 10]]) { box(g, x, y, w, 2, INK); box(g, x + 2, y + 2, w - 4, 1, CARP[4]); }
  // (blood down its front)
  box(g, -30, -8, 40, 8, '#7F1111'); box(g, -24, -40, 5, 34, '#9E1B1B'); box(g, -24, -40, 2, 34, '#C03030'); box(g, 4, -30, 4, 24, '#7F1111');
  // (stood on: its roof's lit lip)
  if (standable) { box(g, -56, -126, 112, 2, LIP[0]); box(g, -56, -124, 112, 2, LIP[1]); }
};

/** A wrecked elevator car (the ride's: an elevator cab, red and gold, ELEVATOR TO HELL on a plate over its doors),
 *  crumpled, its doors burst, at (x, the ground), tipped `tilt`. */
export const drawWreckedCar = (c: Ctx, x: number, y: number, tilt: number, f: number, standable = false) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `hell-car-${tilt.toFixed(3)}-${standable}`, -160, -160, 320, 320, g => { g.rotate(tilt); paintCar(g, standable); });
  // (the dial's H, blinking)
  c.rotate(tilt);
  c.font = '6px "Press Start 2P"'; c.fillStyle = f % 60 < 30 ? '#EF4444' : '#7F1D1D'; c.fillText('H', -3, -128);
  c.restore();
};

/** The lava pools: sunk in their trench (its back wall lit by it), banded, the swell moving along it, crust drifting,
 *  bubbles popping; a faint heat over it (no lip anywhere: nothing to stand on). */
export const drawLava = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [pa, pb] of POOLS) {
    if (pb < state.camera.x - 100 || pa > state.camera.x + CANVAS_WIDTH + 100) continue;
    const a = Math.max(pa, state.camera.x - 100), b = Math.min(pb, state.camera.x + CANVAS_WIDTH + 100), w = b - a;
    const top = GY + LAVA_DROP;
    // (the trench's back wall: dark up top, the lava's light on it lower down, in steps)
    const wall: [number, string][] = [[GY, mix(BASALT[2], '#160605', 0.3)], [GY + 12, mix(BASALT[3], LV[2], 0.2)], [GY + 24, mix(BASALT[3], LV[3], 0.35)], [GY + 32, mix(BASALT[4], LV[3], 0.5)]];
    wall.forEach(([y, col], i) => { box(c, a, y, w, top - y, col); if (i) checker(c, a, y - 2, w, 2, col); });
    for (let x = a - (a % 40) + 18; x < b; x += 40) box(c, x, GY + 4, 2, top - GY - 6, mix(BASALT[2], '#160605', 0.2));
    // (the heat over it: faint bands)
    hazeBands(c, a, top - 26, w, 26, LV[4], 0, 0.14, 4);
    // (the lava: in bands, white-hot at the top down to the dark red)
    const lb: [number, string][] = [[0, LV[6]], [3, LV[5]], [7, LV[4]], [13, LV[3]], [24, LV[2]], [44, LV[1]]];
    lb.forEach(([dy, col], i) => { box(c, a, top + dy, w, 400 - dy, col); if (i) checker(c, a, top + dy - 2, w, 2, col); });
    // (the swell: bright crests running along the surface)
    for (let x = a - (a % 16); x < b; x += 16) {
      const k = Math.sin(x * 0.045 + f * 0.06);
      if (k > 0.35) box(c, Math.max(a, x), top - 2, 10, 2, LV[7]);
      else if (k < -0.6) box(c, Math.max(a, x), top, 12, 2, LV[4]);
    }
    // (crust: dark plates drifting on it, glowing at their cracks)
    const n = Math.floor((pb - pa) / 90);
    for (let i = 0; i < n; i++) {
      const span = pb - pa - 40, px = Math.round(pa + ((i * 97 + f * 0.25 * (i % 2 ? 1 : -1)) % span + span) % span), pw = 26 + (i % 3) * 8;
      if (px + pw < a || px > b) continue;
      box(c, px - 1, top - 1, pw + 2, 6, LV[0]); box(c, px, top, pw, 4, '#2E0E06'); box(c, px + 2, top, pw - 6, 1, '#4E1C0A');
      box(c, px + Math.round(pw * 0.4), top, 2, 4, LV[5]);
    }
    // (bubbles, swelling and popping)
    for (let i = 0; i < 3; i++) {
      const bx = Math.round(pa + 20 + ((i * 137 + Math.floor(f / 40) * 59) % Math.max(1, pb - pa - 40))), ph = (f + i * 13) % 40;
      if (bx < a || bx > b) continue;
      if (ph < 18) { const r = 2 + Math.floor(ph / 4) * 2; box(c, bx - r, top - r + 1, r * 2, r, LV[5]); box(c, bx - r + 2, top - r + 1, r * 2 - 4, 2, LV[7]); }
      else if (ph < 26) { box(c, bx - 4, top - 4 - (ph - 18) * 2, 2, 2, LV[6]); box(c, bx + 3, top - 6 - (ph - 18) * 2, 2, 2, LV[5]); }
    }
    // (the banks: the floor's cut edge going down into it, inked, lit at the foot)
    for (const [ex, s] of [[pa, -1], [pb, 1]] as [number, number][]) {
      if (ex < a - 10 || ex > b + 10) continue;
      const x = s < 0 ? ex - 8 : ex;
      box(c, x, GY, 8, LAVA_DROP + 4, BASALT[3]); box(c, x, GY + LAVA_DROP - 10, 8, 10, mix(BASALT[4], LV[3], 0.5));
      box(c, s < 0 ? ex - 2 : ex, GY, 2, LAVA_DROP + 4, INK);
    }
  }
};

/** A crumbling rock, w wide (local, its top left at 0, 0): paler, cracked right through, bits hanging off it. */
const paintCrumble = (g: Ctx, w: number) => {
  const r = ['#2A1A14', '#3E2820', '#56392C', '#6E4C3A', '#8C664E', '#AE8664'];
  const pts: [number, number][] = [[0, 0], [w, 0], [w + 1, 14], [w - 6, 20], [w / 2 + 8, 26], [w / 2, 34], [w / 2 - 10, 26], [6, 20], [-1, 14]];
  g.save(); poly(g, pts, r[3]); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  box(g, 0, 0, w, 6, r[4]); checker(g, 0, 6, w, 2, r[4]);
  box(g, 0, 16, w, 20, r[2]); checker(g, 0, 14, w, 2, r[2]);
  box(g, w * 0.62, 4, w, 30, r[2]); checker(g, w * 0.62 - 2, 4, 2, 30, r[2]);
  // (pocked)
  for (let i = 0; i < w / 10; i++) box(g, 4 + ((i * 37) % (w - 8)), 8 + ((i * 13) % 14), 2, 2, r[1]);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
  // (cracks right through it, the lip broken where they come out)
  g.lineWidth = 2;
  for (const [cx, d] of [[0.3, 1], [0.72, -1]] as [number, number][]) {
    g.beginPath(); g.moveTo(w * cx, 0); g.lineTo(w * cx + d * 5, 9); g.lineTo(w * cx - d * 2, 16); g.lineTo(w * cx + d * 4, 26); g.stroke();
  }
  lip(g, 0, 0, w);
  for (const cx of [0.3, 0.72]) box(g, w * cx - 1, 0, 3, 4, INK);
  // (a bit hanging off by a thread)
  box(g, w * 0.2 - 1, 21, 8, 7, INK); box(g, w * 0.2, 22, 6, 5, r[3]); box(g, w * 0.2, 22, 6, 1, r[4]);
};

const JET_FIRE = [LV[2], LV[3], LV[5], LV[6], LV[7]];

export const drawHazards = (c: Ctx, state: GameState) => {
  const h = hellOf(state), f = state.frame;
  // The crumbling rocks: paler, cracked right through; shaking (and shedding) when he's on them, the lip flashing
  for (const r of h.crumbles) {
    if (r.gone > 0 || !near(state, r.x)) continue;
    const sh = r.shake > 0 ? Math.round(Math.sin(r.shake * 1.9) * 2) : 0, x = Math.round(r.x + sh), y = Math.round(r.y);
    c.save(); c.translate(x, y);
    stamp(c, `hell-crumble-${r.w}`, -4, -2, r.w + 8, 40, g => paintCrumble(g, r.w));
    c.restore();
    if (r.shake > 0 && r.shake % 8 < 4) { box(c, x, y, r.w, 2, LV[7]); box(c, x, y + 2, r.w, 2, LV[6]); }
  }
  // The fire jets: a chimney of rock with a glowing throat; its warning (the throat going white, sparks spitting out
  // of it), then the column of fire, tongues licking off the top of it
  for (const [x, base, off] of JETS) {
    if (!near(state, x)) continue;
    const ph = jetPhase(f, off);
    c.save(); c.translate(x, base);
    stamp(c, 'hell-jet', -28, -22, 56, 24, g => {
      inkPoly(g, [[-24, 0], [-12, -18], [12, -18], [24, 0]], BASALT[3], 2);
      poly(g, [[-21, -1], [-11, -16], [-6, -16], [-12, -1]], BASALT[5]);
      poly(g, [[12, -1], [8, -16], [11, -16], [21, -1]], BASALT[1]);
      box(g, -12, -19, 24, 3, INK);
    });
    c.restore();
    const throat = ph > WARN ? (ph % 4 < 2 ? LV[7] : LV[6]) : ph > WARN - 20 ? LV[4] : LV[1];
    box(c, x - 8, base - 18, 16, 3, throat); box(c, x - 5, base - 18, 10, 1, ph > WARN ? '#FFFFFF' : throat);
    if (ph > WARN && ph < BLAST) {
      const k = (ph - WARN) / (BLAST - WARN);
      // (the heat building over it: a short stepped plume, then sparks)
      for (let i = 0; i < 3; i++) box(c, x - 6 + i * 2, base - 22 - i * 4 - Math.round(k * 6), 12 - i * 4, 4, JET_FIRE[1 + i]);
      if (ph % 6 < 3) { box(c, Math.round(x - 2 + Math.sin(ph) * 6), Math.round(base - 26 - k * 30), 3, 3, LV[7]); box(c, Math.round(x + 3 - Math.sin(ph) * 5), Math.round(base - 22 - k * 20), 2, 2, LV[5]); }
    }
    if (ph >= BLAST) {
      const k = Math.min(1, (ph - BLAST) / 5) * (ph > CYCLE - 8 ? (CYCLE - ph) / 8 : 1), hgt = JET_H * k, top = base - 16 - hgt;
      // (the column: in rows, each layer's edge licking in and out, white-hot at its heart)
      for (let i = 0; i < JET_FIRE.length; i++) {
        const ww = 36 - i * 7;
        for (let y = top + i * 5; y < base - 16; y += 6) {
          const wob = Math.round(Math.sin(f * 0.8 + y * 0.12 + i) * 2.5);
          box(c, Math.round(x - ww / 2 + wob), Math.round(y), ww, 6, JET_FIRE[i]);
        }
      }
      for (let i = 0; i < 3; i++) {
        const tx = Math.round(x - 12 + i * 12 + Math.sin(f * 0.9 + i * 2) * 4), th = 14 + Math.round(Math.sin(f * 0.7 + i) * 8);
        c.fillStyle = i === 1 ? LV[6] : LV[4]; c.beginPath(); c.moveTo(tx - 6, top + 6); c.lineTo(tx, top - th); c.lineTo(tx + 6, top + 6); c.fill();
        c.fillStyle = LV[7]; c.beginPath(); c.moveTo(tx - 2, top + 6); c.lineTo(tx, top - th * 0.4); c.lineTo(tx + 2, top + 6); c.fill();
      }
    }
  }
  // Wrecks piled up from the cars that have come down since
  h.piled.forEach((x, i) => drawWreckedCar(c, x, GY, (i % 2 ? 0.12 : -0.1), f));
};

/** Over everything: the fireballs, the car coming down (and its shadow). */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const h = hellOf(state), f = state.frame;
  for (const s of h.shots) {
    const x = Math.round(s.x), y = Math.round(s.y), fl = (f >> 1) & 1;
    // (a stepped ball of fire, its tail streaming back off it)
    const bx = -Math.sign(s.vx || 1);
    box(c, x + bx * 8 - 2, y - 2 - fl, 4, 4, LV[4]); box(c, x + bx * 13 - 1, y - 1 + fl, 3, 3, LV[3]);
    c.fillStyle = INK; c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = LV[3]; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = LV[5]; c.beginPath(); c.arc(x - 1, y - 1, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = LV[7]; c.beginPath(); c.arc(x - 2, y - 2, 2, 0, Math.PI * 2); c.fill();
  }
  const car = h.car;
  if (car) {
    // (the shadow on the floor, darker and wider the nearer it is: in steps)
    const k = car.warn > 0 ? 0.3 + (1 - car.warn / 90) * 0.3 : 0.6 + Math.min(0.4, car.vy / 80);
    const rw = CAR_W / 2 * (0.5 + k * 0.6);
    c.fillStyle = `rgba(0, 0, 0, ${(k * 0.5).toFixed(2)})`;
    c.fillRect(Math.round(car.x - rw), GY - 4, Math.round(rw * 2), 6);
    c.fillRect(Math.round(car.x - rw * 0.7), GY - 5, Math.round(rw * 1.4), 8);
    if (car.warn <= 0) drawWreckedCar(c, car.x, car.y, 0, state.frame);
  }
};

registerHurtLines(LAVA, HURT_LAVA, DEATH_LAVA);
registerDeathKind(LAVA, 'lava');
registerHurtLines(JET, HURT_JET, DEATH_JET);
registerDeathKind(JET, 'burnt');
registerHurtLines(CAR, HURT_CAR, DEATH_CAR);
registerDeathKind(CAR, 'flattened');
