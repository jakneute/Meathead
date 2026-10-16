// The helicopter: HELICOPTER RIDES ACROSS THE WORLD's tour chopper (white, a red and a blue stripe, a peace sign on the
// tail, a glass bubble nose), drawn round him sat in it, and, once he's jacked it, flown by him (the user's controls):
//   free 4-way flight on one fixed screen, always facing right;
//   X: the chin machine gun (held: a hose of rounds);
//   Y: up to three homing rockets, on a cooldown (the charges by the bottom-left corner);
//   B: the rotor tilted that way and a BOOST, shredding any jetpacker it hits: plain or right + B forward (nose down),
//      left + B bent back and backward, up + B straight up (rotor screaming), down + B flipped upside down and down
//      (the rotor blending what's under it), rightside up after.
// The engine's own rounds (machine-gun rounds: they hit the goons the engine's way); his rockets and the boost are this
// file's own.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { POWER_CELLS } from '../../../m1/constants';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { hazardVictims, hazardKill, hazardHit } from '../../hazardHit';
import { meatheadSays } from '../section';
import { heliOf, type Heli } from './state';
import { CAMX, CY, FLY_SPEED, FLY_ACCEL, FEET_X0, FEET_X1, FEET_Y0, FEET_Y1 } from './geo';
import { mechAim, hitMech, hitMinions, type Rect } from './mechs';
import { MH_SHRED } from './lines';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** The gun: frames between rounds, a round's speed and damage (to the goons: the engine's; to a landmark: mechs.ts). */
const GUN_CD = 4, ROUND_V = 21, ROUND_DMG = 22;
/** Rockets: how long one takes to come back, top speed, turn, life, blast. */
const ROCKET_BACK = 150, ROCKET_V = 11, ROCKET_TURN = 0.13, ROCKET_LIFE = 200, ROCKET_R = 64, ROCKET_MECH = 70;
/** The boost: frames, speed, cooldown; how far past the helicopter its blades reach. Its own recharge, not his power
 *  cells (the user: more often than he can charge on land: on foot a charge every 60 frames at best (the 30-frame
 *  charge, a cell back every 30); up here one every 30). */
const BOOST_T = 16, BOOST_V = 15, BOOST_CD = 14, BLADE = 70;

const feet = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height });
/** The helicopter's box (world), round him in it (the cabin and the boom). */
export const heliBox = (state: GameState, h: Heli): Rect => { const f = feet(state); return { x: f.x - h.seat - 70, y: f.y - 84, w: 150, h: 96 }; };

/** Where the chin gun is (world): the nose, tilted with it. */
const muzzle = (state: GameState, h: Heli) => {
  const f = feet(state), a = h.tilt + h.flip * Math.PI, dx = 76 - h.seat, dy = -12;
  return { x: f.x + Math.cos(a) * dx - Math.sin(a) * dy, y: f.y + Math.sin(a) * dx + Math.cos(a) * dy };
};

// ---------------------------------------------------------------------------------------------------------------
// Flying

/** Each frame he's flying it: the stick, the boost, the gun, the rockets. */
export const flyCopter = (ctx: FrameContext, controls: Controls) => {
  const { state } = ctx, h = heliOf(state), p = state.player;
  p.carried = true; p.cartSeat = true; p.isGrounded = false; p.facing = 1; p.isDucking = false; p.noSpecials = true;
  // (his own power cells aren't the boost's: kept full, so the HUD's don't read as spent)
  p.power = POWER_CELLS;
  const dead = p.health <= 0;
  // (knocked: off the way he was hit, easing off)
  if ((p.pushbackTimer ?? 0) > h.pb) { h.vx = Math.max(-8, Math.min(8, p.vel.x)); h.vy = Math.max(-8, Math.min(8, p.vel.y)); h.boost = null; }
  h.pb = p.pushbackTimer ?? 0;
  if (h.boostCd > 0) h.boostCd--;
  // The boost (B: special or the charge key), its way from what's held
  const bNow = !!controls.special || !!controls.charge;
  if (bNow && !h.wasB && !dead && !h.boost && h.boostCd <= 0 && h.pb <= 0) {
    const dir = controls.down ? [0, 1] : controls.up ? [0, -1] : controls.left ? [-1, 0] : [1, 0];
    h.boost = { dx: dir[0], dy: dir[1], t: BOOST_T };
    playSound('whoosh', 1, dir[1] > 0 ? -10 : 4); playSound('grind', 0.5, 6);
  }
  h.wasB = bNow;
  if (dead) { h.vy = Math.min(9, h.vy + 0.3); h.vx *= 0.97; h.tilt += 0.08; h.boost = null; }
  else if (h.boost) {
    const b = h.boost;
    h.vx = b.dx * BOOST_V; h.vy = b.dy * BOOST_V;
    if (--b.t <= 0) { h.boost = null; h.boostCd = BOOST_CD; h.vx *= 0.35; h.vy *= 0.35; }
  } else if (h.pb > 0) { h.vx *= 0.9; h.vy *= 0.9; }
  else {
    const ix = (controls.right ? 1 : 0) - (controls.left ? 1 : 0), iy = (controls.down ? 1 : 0) - (controls.up ? 1 : 0);
    const n = ix && iy ? Math.SQRT1_2 : 1;
    h.vx += (ix * n * FLY_SPEED - h.vx) * FLY_ACCEL;
    h.vy += (iy * n * FLY_SPEED - h.vy) * FLY_ACCEL;
  }
  p.pos.x += h.vx; p.pos.y += h.vy;
  // (kept on the screen: the helicopter's tail and rotor too)
  if (!dead) {
    const fx = p.pos.x + p.width / 2, fy = p.pos.y + p.height;
    const nx = Math.max(CAMX + FEET_X0, Math.min(CAMX + FEET_X1, fx)), ny = Math.max(CY + FEET_Y0, Math.min(CY + FEET_Y1, fy));
    if (nx !== fx) { p.pos.x += nx - fx; h.vx = 0; }
    if (ny !== fy) { p.pos.y += ny - fy; h.vy = 0; }
  }
  p.vel.x = 0; p.vel.y = 0;
  // The look: nose down going forward, back going back; flipped for a down boost (and back over after)
  const b = h.boost;
  const want = dead ? h.tilt : b ? (b.dx > 0 ? 0.42 : b.dx < 0 ? -0.55 : 0) : Math.max(-0.25, Math.min(0.25, h.vx * 0.04));
  if (!dead) h.tilt += (want - h.tilt) * 0.25;
  h.flip += ((b && b.dy > 0 ? 1 : 0) - h.flip) * (b && b.dy > 0 ? 0.35 : 0.14);
  if (h.flip < 0.01) h.flip = 0;
  h.rotor += b ? 1.2 : 0.7;
  p.spriteRot = h.tilt + h.flip * Math.PI;
  if (dead) return;
  if (b) shred(ctx, h);
  // The gun (X: held)
  if (h.gunCd > 0) h.gunCd--;
  if (controls.shoot && h.gunCd <= 0 && !p.inCutscene) {
    h.gunCd = GUN_CD;
    const m = muzzle(state, h), a = h.tilt + h.flip * Math.PI + (Math.random() - 0.5) * 0.07;
    // (upside down it still fires forward: the gun's on a swivel. Who knew.)
    const ang = h.flip > 0.5 ? (Math.random() - 0.5) * 0.07 : a;
    state.projectiles.push({
      id: `hmg-${state.frame}-${Math.random()}`, pos: { x: m.x - 8, y: m.y - 3 }, vel: { x: Math.cos(ang) * ROUND_V, y: Math.sin(ang) * ROUND_V },
      width: 16, height: 6, health: 1, maxHealth: 1, type: 'projectile', damage: ROUND_DMG, owner: 'player', pierce: 1, hitIds: [], isLmg: true,
    });
    state.particles.push({ pos: { x: m.x + 4, y: m.y }, vel: { x: 3, y: (Math.random() - 0.5) * 2 }, life: 4, color: '#FDE047', size: 7 + Math.random() * 4 });
    state.particles.push({ pos: { x: m.x - 18, y: m.y + 4 }, vel: { x: -1 - Math.random(), y: 1 + Math.random() * 2 }, life: 30, color: '#CA8A04', size: 2 });
    ctx.fx.playGunSound('lmg');
  }
  // The rockets (Y: a press each; three at most, coming back one at a time)
  h.charges = Math.min(3, h.charges + 1 / ROCKET_BACK);
  const yNow = !!controls.secondary;
  if (yNow && !h.wasY && h.charges >= 1 && !p.inCutscene) {
    h.charges -= 1;
    const f = feet(state);
    h.rockets.push({ x: f.x - h.seat + 10, y: f.y + 8, vx: 5 + h.vx * 0.5, vy: 2.5, t: 0 });
    playSound('whoosh', 0.8, 8); playSound('ignite', 0.6, 4);
  } else if (yNow && !h.wasY && h.charges < 1) playSound('click', 0.6, 4);
  h.wasY = yNow;
};

/** The boost's blades: whoever's in them, shredded; a landmark in them, a big hit and he bounces off it. */
const shred = (ctx: FrameContext, h: Heli) => {
  const { state } = ctx, b = h.boost!, r = heliBox(state, h);
  const z = { x: r.x + Math.min(0, b.dx) * BLADE, y: r.y + Math.min(0, b.dy) * BLADE, w: r.w + Math.abs(b.dx) * BLADE, h: r.h + Math.abs(b.dy) * BLADE };
  let shredded = 0;
  for (const e of hazardVictims(state)) {
    if (e.pos.x > z.x + z.w || e.pos.x + e.width < z.x || e.pos.y > z.y + z.h || e.pos.y + e.height < z.y) continue;
    blend(ctx, e, r.x + r.w / 2 - b.dx * 200); shredded++;
  }
  if (hitMinions(ctx, z, 999)) shredded++;
  if (shredded && Math.random() < 0.3) meatheadSays(state, pickLine(MH_SHRED), false);
  // (a landmark: a good hit, and he's knocked back off it: no hurt for it)
  if (hitMech(ctx, z, 60, r.x + r.w / 2, r.y + r.h / 2, 'boost')) {
    const p = state.player;
    h.boost = null; h.boostCd = BOOST_CD;
    h.vx = -b.dx * 9 - (b.dx === 0 ? 4 : 0); h.vy = -b.dy * 9;
    p.invincibilityTimer = Math.max(p.invincibilityTimer, 24);
    playSound('clang', 1, -6); shakeScreen(state, 6, 3);
    for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: r.x + r.w / 2 + b.dx * 80, y: r.y + r.h / 2 + b.dy * 60 }, vel: { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 }, life: 14, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 3 });
  }
};

/** Through the blades: a red mist, bits. */
const blend = (ctx: FrameContext, e: Enemy, fromX: number) => {
  const { state } = ctx, cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  hazardKill(ctx, e, fromX, 'SHREDDED!', { color: '#DC2626', fling: { x: (cx - fromX > 0 ? 1 : -1) * 14, y: -9 } });
  for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 30, y: cy + (Math.random() - 0.5) * 40 }, vel: { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.7) * 10 }, life: 30 + Math.random() * 20, color: i % 3 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 4 });
  playSound('splat', 1, -4); playSound('crunch', 0.8, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// Rockets

export const updateRockets = (ctx: FrameContext) => {
  const { state } = ctx, h = heliOf(state);
  for (const k of h.rockets) {
    k.t++;
    // (homing: the nearest goon or minion ahead-ish, else the landmark)
    const tgt = rocketTarget(state, k);
    if (tgt && k.t > 6) {
      const want = Math.atan2(tgt.y - k.y, tgt.x - k.x), cur = Math.atan2(k.vy, k.vx);
      let d = want - cur; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
      const a = cur + Math.max(-ROCKET_TURN, Math.min(ROCKET_TURN, d));
      const sp = Math.min(ROCKET_V, Math.hypot(k.vx, k.vy) + 0.5);
      k.vx = Math.cos(a) * sp; k.vy = Math.sin(a) * sp;
    } else { k.vx = Math.min(ROCKET_V, k.vx + 0.4); k.vy *= 0.95; }
    k.x += k.vx; k.y += k.vy;
    if (k.t % 2 === 0) state.particles.push({ pos: { x: k.x - k.vx, y: k.y - k.vy }, vel: { x: (Math.random() - 0.5), y: (Math.random() - 0.5) }, life: 20, color: k.t % 4 ? '#D4D4D8' : '#F97316', size: 3 + Math.random() * 3 });
    const box: Rect = { x: k.x - 8, y: k.y - 8, w: 16, h: 16 };
    let hit = false;
    for (const e of hazardVictims(state)) if (e.pos.x < box.x + box.w && e.pos.x + e.width > box.x && e.pos.y < box.y + box.h && e.pos.y + e.height > box.y) { hit = true; break; }
    if (!hit && hitMinions(ctx, box, 0, true)) hit = true;
    if (!hit && hitMech(ctx, box, 0, k.x, k.y, 'probe')) hit = true;
    if (hit || k.t > ROCKET_LIFE || k.x > CAMX + 900 || k.x < CAMX - 100 || k.y < CY - 100 || k.y > CY + 700) { k.dead = true; if (hit) rocketBlows(ctx, k.x, k.y); }
  }
  h.rockets = h.rockets.filter(k => !k.dead);
  for (const b of h.booms) b.t++;
  h.booms = h.booms.filter(b => b.t < (b.big ? 40 : 24));
};
const rocketTarget = (state: GameState, k: { x: number; y: number }) => {
  let best: { x: number; y: number } | null = null, bd = Infinity;
  for (const e of hazardVictims(state)) {
    const m = { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 };
    if (m.x < CAMX - 20 || m.x > CAMX + 820) continue;
    const d = Math.hypot(m.x - k.x, m.y - k.y) + (m.x < k.x ? 300 : 0);
    if (d < bd) { bd = d; best = m; }
  }
  for (const n of heliOf(state).minions) {
    if (n.dead) continue;
    const d = Math.hypot(n.x - k.x, n.y - k.y) + (n.x < k.x ? 300 : 0);
    if (d < bd) { bd = d; best = { x: n.x, y: n.y }; }
  }
  return best ?? mechAim(state);
};
export const rocketBlows = (ctx: FrameContext, x: number, y: number) => {
  const { state } = ctx, h = heliOf(state);
  h.booms.push({ x, y, r: ROCKET_R, t: 0, big: false });
  playSound('boom', 0.8, 2); shakeScreen(state, 5, 3);
  for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 5; state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * s, y: Math.sin(a) * s }, life: 16 + Math.random() * 14, color: i % 3 === 0 ? '#FDE047' : i % 3 === 1 ? '#F97316' : '#FFFFFF', size: 3 + Math.random() * 4 }); }
  for (const e of hazardVictims(state)) {
    const m = { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 };
    if (Math.hypot(m.x - x, m.y - y) < ROCKET_R + Math.max(e.width, e.height) / 2) hazardHit(ctx, e, 140, x, 'KABOOM!');
  }
  hitMinions(ctx, { x: x - ROCKET_R, y: y - ROCKET_R, w: ROCKET_R * 2, h: ROCKET_R * 2 }, 120);
  hitMech(ctx, { x: x - ROCKET_R * 0.7, y: y - ROCKET_R * 0.7, w: ROCKET_R * 1.4, h: ROCKET_R * 1.4 }, ROCKET_MECH, x, y, 'rocket');
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The helicopter round him: `part` 'back' (behind him: the boom, the shell, the seats, the inside) or 'front' (in
 *  front of him: the glass, the pillar, the skids, the rotor). `px, py` his feet (the pivot it turns about). */
export const drawCopter = (c: Ctx, part: 'back' | 'front', px: number, py: number, h: { seat: number; tilt: number; flip: number; rotor: number }, f: number, o: { flash?: boolean; burning?: boolean; harryDoor?: boolean; ghost?: boolean } = {}) => {
  c.save();
  c.translate(Math.round(px), Math.round(py));
  c.rotate(h.tilt + h.flip * Math.PI);
  c.translate(-h.seat, 0);
  if (o.ghost) c.globalAlpha = 0.5;
  const fl = (col: string, path: () => void, line = 1.6) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); };
  const r = (x: number, y: number, w: number, hh: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, hh); };
  if (part === 'back') {
    // The tail boom, tapering, its stripe; the fin; the tail rotor spinning
    fl('#E5E7EB', () => { c.moveTo(-50, -54); c.lineTo(-196, -48); c.lineTo(-196, -40); c.lineTo(-50, -32); c.closePath(); });
    r(-190, -46, 140, 3, '#DC2626'); r(-190, -42, 140, 2, '#1D4ED8');
    fl('#F8FAFC', () => { c.moveTo(-184, -46); c.lineTo(-206, -76); c.lineTo(-196, -76); c.lineTo(-176, -46); c.closePath(); });
    fl('#F8FAFC', () => { c.moveTo(-190, -42); c.lineTo(-206, -26); c.lineTo(-198, -26); c.lineTo(-182, -42); c.closePath(); });
    // (the peace sign on the fin)
    c.strokeStyle = '#16A34A'; c.lineWidth = 1.4; c.beginPath(); c.arc(-196, -62, 5, 0, Math.PI * 2); c.moveTo(-196, -67); c.lineTo(-196, -57); c.moveTo(-196, -62); c.lineTo(-199.5, -58.5); c.moveTo(-196, -62); c.lineTo(-192.5, -58.5); c.stroke();
    const tr = Math.cos(h.rotor * 2.3) * 16;
    c.strokeStyle = 'rgba(30,30,30,0.35)'; c.lineWidth = 2; c.beginPath(); c.arc(-198, -46, 16, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-198, -46 - tr); c.lineTo(-198, -46 + tr); c.stroke();
    // The cabin's shell: the back half solid, the inside dark; the seats
    fl(o.flash ? '#FFFFFF' : '#F8FAFC', () => { c.moveTo(-62, -60); c.quadraticCurveTo(-64, -84, -30, -86); c.lineTo(30, -86); c.quadraticCurveTo(58, -84, 72, -52); c.quadraticCurveTo(80, -24, 66, 2); c.lineTo(-56, 4); c.quadraticCurveTo(-66, -20, -62, -60); c.closePath(); });
    fl('#334155', () => { c.moveTo(-48, -70); c.lineTo(52, -74); c.quadraticCurveTo(66, -50, 62, -6); c.lineTo(-48, -4); c.closePath(); }, 1);
    r(-48, -16, 110, 12, '#1E293B');
    for (const sx of [-26, 28]) { fl('#7F1D1D', () => c.roundRect(sx - 18, -50, 10, 46, 3), 1.2); fl('#991B1B', () => c.roundRect(sx - 14, -10, 26, 8, 2), 1.2); }
    // (the instrument panel up front, a cup holder, a dashboard hula girl? no: a dashboard peace-sign bobblehead)
    fl('#18181B', () => { c.moveTo(48, -30); c.lineTo(66, -36); c.lineTo(66, -16); c.lineTo(50, -14); c.closePath(); }, 1);
    for (let i = 0; i < 3; i++) r(54 + (i % 2) * 6, -32 + i * 5, 4, 3, i === 1 ? '#22C55E' : '#FDE047');
    // (the stripes along its belly, the ride's name on the side)
    r(-56, -12, 124, 4, '#DC2626'); r(-56, -7, 124, 3, '#1D4ED8');
    c.font = '5px "Press Start 2P"'; c.fillStyle = '#1D4ED8'; c.fillText('HELICOPTER RIDES', -54, -20);
  } else {
    // The pillar between the seats, the door frame, the glass bubble (the light on it), the skids, the mast, the rotor
    r(1, -84, 5, 86, '#CBD5E1'); c.strokeStyle = INK; c.lineWidth = 1.2; c.strokeRect(1, -84, 5, 86);
    c.fillStyle = 'rgba(186, 230, 253, 0.22)';
    c.beginPath(); c.moveTo(6, -86); c.lineTo(30, -86); c.quadraticCurveTo(58, -84, 72, -52); c.quadraticCurveTo(80, -24, 66, 2); c.lineTo(52, 2); c.quadraticCurveTo(60, -40, 6, -78); c.closePath(); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(30, -86); c.quadraticCurveTo(58, -84, 72, -52); c.quadraticCurveTo(80, -24, 66, 2); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(38, -80); c.quadraticCurveTo(58, -74, 64, -56); c.stroke();
    c.beginPath(); c.moveTo(68, -40); c.lineTo(69, -30); c.stroke();
    // (the door: open on Harry's side when he's shoved out)
    if (o.harryDoor) { fl('#F8FAFC', () => { c.moveTo(66, -70); c.lineTo(96, -64); c.lineTo(94, -14); c.lineTo(66, -10); c.closePath(); }, 1.2); }
    // (the chin gun)
    fl('#3F3F46', () => c.rect(56, -16, 22, 6), 1.2);
    // skids
    c.strokeStyle = INK; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-36, 2); c.lineTo(-40, 18); c.moveTo(40, 2); c.lineTo(44, 18); c.stroke();
    c.lineWidth = 4; c.beginPath(); c.moveTo(-60, 18); c.lineTo(60, 18); c.quadraticCurveTo(72, 18, 74, 10); c.stroke();
    c.strokeStyle = '#9CA3AF'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-58, 17); c.lineTo(58, 17); c.stroke();
    // (the mast)
    fl('#52525B', () => c.rect(-4, -98, 10, 14), 1.2);
    // (the rotor: its disc a blur, two blades foreshortened as it turns)
    c.fillStyle = 'rgba(40, 40, 40, 0.16)'; c.beginPath(); c.ellipse(1, -99, 160, 7, 0, 0, Math.PI * 2); c.fill();
    for (const k of [0, Math.PI / 2]) {
      const L = Math.cos(h.rotor + k) * 160;
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(1 - L, -99); c.lineTo(1 + L, -99); c.stroke();
      c.strokeStyle = '#71717A'; c.lineWidth = 2; c.beginPath(); c.moveTo(1 - L, -99.5); c.lineTo(1 + L, -99.5); c.stroke();
    }
    fl('#A1A1AA', () => c.arc(1, -99, 5, 0, Math.PI * 2), 1.2);
    // (hit: smoking, sparking; dying: on fire)
    if (o.burning) for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#F97316' : '#FDE047'; c.beginPath(); c.arc(-40 + i * 9 + Math.sin(f * 0.5 + i) * 3, -80 - ((f * 3 + i * 7) % 26), 7 - (i % 3), 0, Math.PI * 2); c.fill(); }
  }
  c.restore();
};

/** His rockets, the charges by the corner (screen), the blasts. */
export const drawRockets = (c: Ctx, state: GameState) => {
  const h = heliOf(state);
  for (const k of h.rockets) {
    c.save(); c.translate(k.x, k.y); c.rotate(Math.atan2(k.vy, k.vx));
    c.fillStyle = INK; c.fillRect(-12, -4, 22, 8);
    c.fillStyle = '#E5E7EB'; c.fillRect(-11, -3, 18, 6); c.fillStyle = '#DC2626'; c.fillRect(5, -3, 5, 6);
    c.fillStyle = '#9CA3AF'; c.fillRect(-11, 1, 18, 2);
    c.fillStyle = '#3F3F46'; c.beginPath(); c.moveTo(-12, -4); c.lineTo(-16, -8); c.lineTo(-8, -4); c.moveTo(-12, 4); c.lineTo(-16, 8); c.lineTo(-8, 4); c.fill();
    c.fillStyle = (k.t >> 1) % 2 ? '#FDE047' : '#F97316'; c.beginPath(); c.moveTo(-12, -3); c.lineTo(-22 - (k.t % 3) * 3, 0); c.lineTo(-12, 3); c.fill();
    c.restore();
  }
  for (const b of h.booms) {
    const n = b.t / (b.big ? 40 : 24), r = b.r * (0.4 + n * 0.8), fire = 1 - n;
    c.globalAlpha = n < 0.55 ? 1 : n < 0.8 ? 0.6 : 0.3;
    for (const [k, col] of [[1, '#57534E'], [0.85 * fire + 0.1, '#EA580C'], [0.65 * fire, '#F97316'], [0.45 * fire, '#FDE047'], [0.22 * fire * fire, '#FFFFFF']] as const) {
      if (r * k < 1) continue; c.fillStyle = col; c.beginPath(); c.arc(b.x, b.y, r * k, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
};
/** Screen: the rockets' charges (three little rockets, bottom left; the one coming back filling in), and the rotor
 *  boost's own meter beside them (empty while it's boosting, filling over its cooldown, lit when it's ready). */
export const drawCharges = (c: Ctx, state: GameState) => {
  const h = heliOf(state);
  c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(12, 562, 172, 28);
  {
    const k = h.boost ? 0 : 1 - Math.max(0, h.boostCd) / BOOST_CD, x = 124, y = 578;
    c.font = '6px "Press Start 2P"'; c.fillStyle = k >= 1 ? '#86EFAC' : '#A1A1AA'; c.fillText('BOOST', 126, 572);
    c.fillStyle = '#27272A'; c.fillRect(x, y, 54, 8);
    c.fillStyle = k >= 1 ? ((state.frame >> 3) % 4 ? '#4ADE80' : '#BBF7D0') : '#15803D'; c.fillRect(x + 1, y + 1, 52 * k, 6);
  }
  c.font = '6px "Press Start 2P"'; c.fillStyle = '#FDE68A'; c.fillText('ROCKETS', 18, 572);
  for (let i = 0; i < 3; i++) {
    const k = Math.max(0, Math.min(1, h.charges - i)), x = 18 + i * 34, y = 578;
    c.fillStyle = '#27272A'; c.fillRect(x, y, 28, 8);
    c.fillStyle = k >= 1 ? '#E5E7EB' : '#71717A'; c.fillRect(x + 1, y + 1, 26 * k, 6);
    if (k >= 1) { c.fillStyle = '#DC2626'; c.fillRect(x + 22, y + 1, 5, 6); }
  }
};
