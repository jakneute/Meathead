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
import { ledge, meatheadSays, box } from '../section';
import { GY } from '../geometry';
import { POOLS, LAVA_DROP, CRUMBLES, JETS, SHAFT_L, SHAFT_R } from './layout';
import { hellOf, type Hell } from './state';
import { hazardVictims, hazardKill, hazardHit, setHazardZones, boxHits, type Zone } from '../../hazardHit';
import { overLava, IMP_FIRE } from './kinds';
import { HURT_LAVA, DEATH_LAVA, HURT_JET, DEATH_JET, HURT_CAR, DEATH_CAR, MH_CAR } from './lines';

type Ctx = CanvasRenderingContext2D;
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
// Drawing (crude: boxes), world space

/** A wrecked elevator car (the ride's: an elevator cab, red and gold, ELEVATOR TO HELL on a plate over its doors),
 *  crumpled, its doors burst, at (x, the ground), tipped `tilt`. */
export const drawWreckedCar = (c: Ctx, x: number, y: number, tilt: number, f: number, standable = false) => {
  c.save(); c.translate(x, y); c.rotate(tilt);
  box(c, -58, -126, 116, 126, '#0C0303');
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
  // (stood on: its roof's lit lip)
  if (standable) { box(c, -56, -124, 112, 3, '#FB923C'); }
  c.restore();
};

/** The lava pools: a glow up off them, a crust drifting on them, bubbles popping (no lip: not something to stand on). */
export const drawLava = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [a, b] of POOLS) {
    if (b < state.camera.x - 100 || a > state.camera.x + CANVAS_WIDTH + 100) continue;
    const top = GY + LAVA_DROP;
    // (the glow, up off it, over the banks' walls)
    c.fillStyle = 'rgba(249, 115, 22, 0.16)'; c.fillRect(a, top - 40, b - a, 40);
    c.fillStyle = 'rgba(249, 115, 22, 0.12)'; c.fillRect(a, top - 70, b - a, 30);
    box(c, a, top, b - a, 400, '#7C2D12');
    box(c, a, top + 10, b - a, 14, '#C2410C');
    box(c, a, top, b - a, 10, '#F97316');
    box(c, a, top, b - a, 3, '#FDE047');
    // (crust: dark plates drifting on it)
    for (let i = 0; i < Math.floor((b - a) / 90); i++) {
      const px = a + ((i * 97 + f * 0.25 * (i % 2 ? 1 : -1)) % (b - a - 40) + (b - a - 40)) % (b - a - 40);
      box(c, px, top + 1, 26 + (i % 3) * 8, 4, '#3B1408'); box(c, px + 4, top, 14, 2, '#57260A');
    }
    for (let i = 0; i < 3; i++) {
      const bx = a + 20 + ((i * 137 + Math.floor(f / 40) * 59) % Math.max(1, b - a - 40)), ph = (f + i * 13) % 40;
      if (ph < 20) { c.fillStyle = '#FDE047'; c.beginPath(); c.arc(bx, top + 2, 2 + ph * 0.3, Math.PI, 0); c.fill(); }
      else if (ph < 24) box(c, bx - 1, top - 6 - (ph - 20) * 3, 3, 3, '#FB923C');
    }
    // (the banks: rock walls down into it, outlined)
    box(c, a - 6, GY, 6, LAVA_DROP + 4, '#170804'); box(c, b, GY, 6, LAVA_DROP + 4, '#170804');
  }
};

export const drawHazards = (c: Ctx, state: GameState) => {
  const h = hellOf(state), f = state.frame;
  // The crumbling rocks: paler, cracked right through, outlined; shaking (and shedding) when he's on them
  for (const r of h.crumbles) {
    if (r.gone > 0 || !near(state, r.x)) continue;
    const sh = r.shake > 0 ? Math.sin(r.shake * 1.9) * 2 : 0, x = r.x + sh, y = r.y, w = r.w;
    box(c, x - 2, y - 1, w + 4, 20, '#0C0303');
    box(c, x, y, w, 18, '#6B4A3A'); box(c, x + w * 0.6, y + 4, w * 0.4, 14, '#55392C');
    c.fillStyle = '#0C0303'; c.beginPath(); c.moveTo(x + 4, y + 18); c.lineTo(x + w / 2, y + 34); c.lineTo(x + w - 4, y + 18); c.fill();
    c.fillStyle = '#55392C'; c.beginPath(); c.moveTo(x + 8, y + 18); c.lineTo(x + w / 2, y + 30); c.lineTo(x + w - 8, y + 18); c.fill();
    box(c, x, y, w, 3, r.shake > 0 && r.shake % 8 < 4 ? '#FDE047' : '#FDBA74');
    c.strokeStyle = '#0C0303'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x + w * 0.3, y + 3); c.lineTo(x + w * 0.42, y + 12); c.lineTo(x + w * 0.36, y + 22); c.stroke();
    c.beginPath(); c.moveTo(x + w * 0.72, y + 3); c.lineTo(x + w * 0.62, y + 15); c.stroke();
  }
  // The fire jets: a little chimney of rock with a glowing throat; its warning (the glow building, smoke, sparks
  // spitting out of it), then the column of fire, tongues licking off the top of it
  for (const [x, base, off] of JETS) {
    if (!near(state, x)) continue;
    const ph = jetPhase(f, off);
    c.fillStyle = '#0C0303'; c.beginPath(); c.moveTo(x - 24, base); c.lineTo(x - 12, base - 18); c.lineTo(x + 12, base - 18); c.lineTo(x + 24, base); c.fill();
    c.fillStyle = '#3B1408'; c.beginPath(); c.moveTo(x - 21, base); c.lineTo(x - 10, base - 16); c.lineTo(x + 10, base - 16); c.lineTo(x + 21, base); c.fill();
    box(c, x - 8, base - 17, 16, 4, ph > WARN ? '#FDE047' : ph > WARN - 20 ? '#F97316' : '#7C2D12');
    if (ph > WARN && ph < BLAST) {
      const k = (ph - WARN) / (BLAST - WARN);
      c.fillStyle = `rgba(249, 115, 22, ${0.15 + k * 0.4})`; c.beginPath(); c.ellipse(x, base - 18, 14 + k * 12, 6 + k * 6, 0, 0, Math.PI * 2); c.fill();
      if (ph % 6 < 3) { box(c, x - 2 + Math.sin(ph) * 6, base - 26 - k * 30, 4, 4, '#FDE047'); box(c, x + 3 - Math.sin(ph) * 5, base - 22 - k * 20, 3, 3, '#FB923C'); }
    }
    if (ph >= BLAST) {
      const k = Math.min(1, (ph - BLAST) / 5) * (ph > CYCLE - 8 ? (CYCLE - ph) / 8 : 1), hgt = JET_H * k, top = base - 16 - hgt;
      for (let i = 0; i < 5; i++) {
        const w = 36 - i * 6, wob = Math.sin(f * 0.8 + i) * 3;
        box(c, x - w / 2 + wob, top + i * 6, w, hgt - i * 6, ['#B91C1C', '#EA580C', '#F97316', '#FDBA74', '#FEF9C3'][i]);
      }
      for (let i = 0; i < 3; i++) { const tx = x - 12 + i * 12 + Math.sin(f * 0.9 + i * 2) * 4, th = 14 + Math.sin(f * 0.7 + i) * 8; c.fillStyle = i === 1 ? '#FDE047' : '#F97316'; c.beginPath(); c.moveTo(tx - 6, top + 4); c.lineTo(tx, top - th); c.lineTo(tx + 6, top + 4); c.fill(); }
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
