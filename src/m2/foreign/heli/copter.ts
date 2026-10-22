// The helicopter: HELICOPTER RIDES ACROSS THE WORLD's tour chopper (white, a red and a blue stripe, a peace sign on the
// tail, a glass bubble nose), drawn round him sat in it, and, once he's jacked it, flown by him (the user's controls):
//   free 4-way flight on one fixed screen, always facing right;
//   X: the chin machine gun (held: a hose of rounds);
//   Y: up to three homing rockets, on a cooldown (the charges by the bottom-left corner);
//   B: the rotor turned that way and a BOOST, shredding any jetpacker it hits: plain or right + B a quarter over nose
//      down (the rotor out in front), left + B a quarter over backward, up + B straight up (rotor screaming), down + B flipped upside down and down
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
import { hazardVictims, hazardHit } from '../../hazardHit';
import { meatheadSays } from '../section';
import { heliOf, type Heli } from './state';
import { CAMX, CY, W, H, FLY_SPEED, FLY_ACCEL, FEET_X0, FEET_X1, FEET_Y0, FEET_Y1 } from './geo';
import { drawBoom } from './mechArt';
import { checker } from '../../intro/art/kit';
import { mechAim, hitMech, hitMinions, chopLions, type Rect } from './mechs';
import { MH_SHRED } from './lines';
import { shredGoon, tickShred, drawShred, drawRotorSmear, drawShieldSplat } from './shred';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

/** The homing rockets (Y) on or not (the user: "remove the rocket attack for now or dummy it out"): off, Y does nothing
 *  up here, the charges aren't shown, the controls card leaves Y out, the BOOST meter takes the rockets' corner. All the
 *  rest of it's kept: set this true to have them back. (Harry's launcher at the end is his, not this.) */
export const ROCKETS_ON = true;

/** The gun: frames between rounds, a round's speed and damage (to the goons: the engine's; to a landmark: mechs.ts). */
const GUN_CD = 4, ROUND_V = 21, ROUND_DMG = 22;
/** Rockets: how long one takes to come back, top speed, turn, life, blast. */
const ROCKET_BACK = 225, ROCKET_V = 11, ROCKET_TURN = 0.13, ROCKET_LIFE = 200, ROCKET_R = 64;
/** A rocket on a landmark: its own cut (the user: "a fair amount less damage to monuments"), not the lackeys' (still
 *  140 / 120: one shot each). Was 70; now 70 x 0.62 = 43 (x1.6 HP_SCALE: 112 -> 69 off a landmark's bar). */
const ROCKET_MECH_K = 0.62, ROCKET_MECH = Math.round(70 * ROCKET_MECH_K);
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
  // (the user's: a sideways boost turns it a quarter over that way, the rotor disc out in front, blades first, as the
  // down boost turns it upside down; snappy into it and back out)
  const want = dead ? h.tilt : b ? (b.dx > 0 ? Math.PI / 2 : b.dx < 0 ? -Math.PI / 2 : 0) : Math.max(-0.25, Math.min(0.25, h.vx * 0.04));
  if (!dead) h.tilt += (want - h.tilt) * (b ? 0.5 : 0.32);
  h.flip += ((b && b.dy > 0 ? 1 : 0) - h.flip) * (b && b.dy > 0 ? 0.35 : 0.14);
  if (h.flip < 0.01) h.flip = 0;
  h.rotor += b ? 1.2 : 0.7;
  p.spriteRot = h.tilt + h.flip * Math.PI;
  if (dead) return;
  if (b) shred(ctx, h);
  rotorChops(ctx, h);
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
  if (yNow && !h.wasY && h.charges >= 1 && !p.inCutscene && ROCKETS_ON) {
    h.charges -= 1;
    const f = feet(state);
    h.rockets.push({ x: f.x - h.seat + 10, y: f.y + 8, vx: 5 + h.vx * 0.5, vy: 2.5, t: 0 });
    playSound('whoosh', 0.8, 8); playSound('ignite', 0.6, 4);
  } else if (yNow && !h.wasY && h.charges < 1 && ROCKETS_ON) playSound('click', 0.6, 4);
  h.wasY = yNow;
};

/** The boost's blades: whoever's in them, shredded; a landmark in them, a big hit and he bounces off it. */
const shred = (ctx: FrameContext, h: Heli) => {
  const { state } = ctx, b = h.boost!, r = heliBox(state, h);
  const z = { x: r.x + Math.min(0, b.dx) * BLADE, y: r.y + Math.min(0, b.dy) * BLADE, w: r.w + Math.abs(b.dx) * BLADE, h: r.h + Math.abs(b.dy) * BLADE };
  let shredded = 0;
  for (const e of hazardVictims(state)) {
    if (e.pos.x > z.x + z.w || e.pos.x + e.width < z.x || e.pos.y > z.y + z.h || e.pos.y + e.height < z.y) continue;
    blend(ctx, e, rotorDisc(state, h)); shredded++;
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

/** The rotor's blades always chop (the user: "any human enemies that come into contact with your blades get chopped
 *  up, whether you charge or not"): any of them touching the disc is shredded, the boost's own kill. The disc's never
 *  a hurt to him (it's his). Its line: the rotor's (1, -99) out 160 either way in the helicopter's frame, tilted and
 *  flipped with it. */
const ROTOR_R = 160, ROTOR_REACH = 14;
/** The rotor disc's line (world): its hub, its two blade ends, its axis. */
const rotorDisc = (state: GameState, h: Heli) => {
  const f = feet(state), a = h.tilt + h.flip * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
  const lx = 1 - h.seat, ly = -99;
  const cx = f.x + ca * lx - sa * ly, cy = f.y + sa * lx + ca * ly;
  return { cx, cy, ca, sa, ax: cx - ca * ROTOR_R, ay: cy - sa * ROTOR_R, bx: cx + ca * ROTOR_R, by: cy + sa * ROTOR_R };
};
type Disc = ReturnType<typeof rotorDisc>;
const rotorChops = (ctx: FrameContext, h: Heli) => {
  const { state } = ctx, d0 = rotorDisc(state, h), { ax, ay, bx, by } = d0;
  tickShred(ctx, { x: ax, y: ay }, { x: bx, y: by });
  chopLions(ctx, ax, ay, bx, by, ROTOR_REACH);
  let chopped = 0;
  for (const e of hazardVictims(state)) {
    const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
    const dx = bx - ax, dy = by - ay, k = Math.max(0, Math.min(1, ((ex - ax) * dx + (ey - ay) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot(ex - ax - k * dx, ey - ay - k * dy);
    if (d > Math.min(e.width, e.height) / 2 + ROTOR_REACH) continue;
    blend(ctx, e, d0); chopped++;
  }
  if (chopped && Math.random() < 0.3) meatheadSays(state, pickLine(MH_SHRED), false);
};

/** Through the blades: no body, paste (shred.ts). Where the blade met him (the nearest point on the disc to him, toward
 *  him), thrown out along the blade, away from the hub on his side. */
const blend = (ctx: FrameContext, e: Enemy, d: Disc) => {
  const ex = e.pos.x + e.width / 2, ey = e.pos.y + e.height / 2;
  const along = (ex - d.cx) * d.ca + (ey - d.cy) * d.sa, k = Math.max(-ROTOR_R, Math.min(ROTOR_R, along));
  const x = (d.cx + d.ca * k + ex) / 2, y = (d.cy + d.sa * k + ey) / 2, sg = along < 0 ? -1 : 1;
  shredGoon(ctx, e, x, y, d.ca * sg, d.sa * sg);
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
    if (hit || k.t > ROCKET_LIFE || k.x > CAMX + W + 100 || k.x < CAMX - 100 || k.y < CY - 100 || k.y > CY + H + 100) { k.dead = true; if (hit) rocketBlows(ctx, k.x, k.y); }
  }
  h.rockets = h.rockets.filter(k => !k.dead);
  for (const b of h.booms) b.t++;
  h.booms = h.booms.filter(b => b.t < (b.big ? 40 : 24));
};
const rocketTarget = (state: GameState, k: { x: number; y: number }) => {
  let best: { x: number; y: number } | null = null, bd = Infinity;
  // (the jetpack lackeys first, the nearest on screen, whichever side (the user: "rockets prioritize them"); then the
  // minions; the landmark only when there's nobody else up)
  for (const e of hazardVictims(state)) {
    const m = { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 };
    if (m.x < CAMX - 20 || m.x > CAMX + W + 20 || m.y < CY - 20 || m.y > CY + H + 20) continue;
    const d = Math.hypot(m.x - k.x, m.y - k.y);
    if (d < bd) { bd = d; best = m; }
  }
  if (best) return best;
  for (const n of heliOf(state).minions) {
    if (n.dead) continue;
    const d = Math.hypot(n.x - k.x, n.y - k.y) + (n.x < k.x ? 300 : 0) - (n.kind === 'lion' ? 400 : 0);
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
  const dot = (x: number, y: number, rr: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill(); };
  /** Its white paint, in steps (highlight .. the underside), lit from the upper left. */
  const WH = o.flash ? ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'] : ['#FFFFFF', '#F2F4F8', '#D6DCE6', '#AAB4C4', '#7C889C'];
  if (part === 'back') {
    // The tail boom, tapering: lit along its top, shaded down to its belly in steps (dithered between), the stripes
    // (lit along their tops), its rivets; the fin and the stabilizer, the tail skid; the tail rotor's blurred disc
    const boom = () => { c.moveTo(-50, -54); c.lineTo(-196, -48); c.lineTo(-196, -40); c.lineTo(-50, -32); c.closePath(); };
    fl(WH[1], boom);
    c.save(); c.beginPath(); boom(); c.clip();
    r(-200, -56, 152, 4, WH[0]); r(-200, -40, 152, 10, WH[2]); checker(c, -200, -42, 152, 2, WH[2], 0, 1); r(-200, -36, 152, 6, WH[3]);
    r(-196, -47, 146, 3, '#DC2626'); r(-196, -47, 146, 1, '#F87171'); r(-196, -43, 146, 2, '#1D4ED8'); r(-196, -43, 146, 1, '#60A5FA');
    for (let x = -186; x < -56; x += 12) r(x, -51 + (x + 186) * 0.03, 1, 1, WH[3]);
    c.restore();
    c.beginPath(); boom(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke();
    const fin = () => { c.moveTo(-184, -46); c.lineTo(-206, -76); c.lineTo(-196, -76); c.lineTo(-176, -46); c.closePath(); };
    fl(WH[1], fin); c.save(); c.beginPath(); fin(); c.clip(); r(-210, -78, 12, 34, WH[0]); r(-192, -78, 20, 34, WH[2]); r(-200, -78, 8, 3, '#DC2626'); c.restore(); c.beginPath(); fin(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke();
    fl(WH[2], () => { c.moveTo(-190, -42); c.lineTo(-206, -26); c.lineTo(-198, -26); c.lineTo(-182, -42); c.closePath(); });
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-196, -27); c.lineTo(-200, -20); c.lineTo(-188, -20); c.stroke();
    // (the peace sign on the fin: green on a white roundel)
    dot(-196, -62, 6.5, '#FFFFFF');
    c.strokeStyle = '#16A34A'; c.lineWidth = 1.6; c.beginPath(); c.arc(-196, -62, 5, 0, Math.PI * 2); c.moveTo(-196, -67); c.lineTo(-196, -57); c.moveTo(-196, -62); c.lineTo(-199.5, -58.5); c.moveTo(-196, -62); c.lineTo(-192.5, -58.5); c.stroke();
    // (the tail rotor: its blur in two stepped rings, the blade, the hub)
    const tr = Math.cos(h.rotor * 2.3) * 16;
    c.fillStyle = 'rgba(40,40,48,0.12)'; c.beginPath(); c.arc(-198, -46, 17, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(40,40,48,0.14)'; c.beginPath(); c.arc(-198, -46, 11, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; c.beginPath(); c.arc(-198, -46, 16, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-198, -46 - tr); c.lineTo(-198, -46 + tr); c.stroke();
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 1; c.beginPath(); c.moveTo(-198.5, -46 - tr); c.lineTo(-198.5, -46 + tr); c.stroke();
    dot(-198, -46, 3, '#52525B'); r(-199, -47, 1, 1, '#D4D4D8');
    // The cabin's shell: white in steps (a lit band over the top, a lit edge up its left, shaded along its belly and
    // darker under it, each seam dithered), the panel lines and rivets, the door and its handle
    const shell = () => { c.moveTo(-62, -60); c.quadraticCurveTo(-64, -84, -30, -86); c.lineTo(30, -86); c.quadraticCurveTo(58, -84, 72, -52); c.quadraticCurveTo(80, -24, 66, 2); c.lineTo(-56, 4); c.quadraticCurveTo(-66, -20, -62, -60); c.closePath(); };
    fl(WH[1], shell);
    if (!o.flash) {
      c.save(); c.beginPath(); shell(); c.clip();
      r(-70, -86, 160, 6, WH[0]); checker(c, -70, -80, 160, 2, WH[0], 0, 1);
      r(-64, -86, 8, 90, WH[0]); checker(c, -56, -86, 2, 90, WH[0], 0, 1);
      r(-70, -24, 160, 30, WH[2]); checker(c, -70, -26, 160, 2, WH[2], 1, 1);
      r(-70, -6, 160, 12, WH[3]); checker(c, -70, -8, 160, 2, WH[3], 0, 1);
      r(-70, 0, 160, 6, WH[4]);
      c.restore();
      c.beginPath(); shell(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke();
    }
    // (the engine cowling on its roof: stepped, its intake grille, the exhaust and its heat; the panel lines and rivets)
    fl(WH[1], () => c.roundRect(-44, -96, 66, 12, 4), 1.4);
    r(-40, -94, 58, 2, WH[0]); r(-40, -88, 58, 3, WH[3]); r(-40, -90, 58, 2, WH[2]);
    for (let x = 4; x < 18; x += 3) r(x, -93, 1, 5, '#475569');
    fl('#3F3F46', () => c.rect(-52, -94, 10, 7), 1.2); r(-51, -93, 8, 2, '#71717A'); r(-51, -89, 8, 1, '#18181B');
    for (let k = 0; k < 3; k++) { const ph = ((f * 0.8 + k * 10) % 30) / 30; c.globalAlpha = 0.35 * (1 - ph); dot(-56 - ph * 26, -91 - ph * 6 + Math.sin(f * 0.3 + k) * 2, 3 + ph * 6, '#A1A1AA'); }
    c.globalAlpha = 1;
    c.strokeStyle = 'rgba(30,41,59,0.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-40, -84); c.lineTo(-40, 2); c.moveTo(-14, -86); c.lineTo(-14, 3); c.moveTo(-60, -40); c.lineTo(-40, -40); c.stroke();
    for (let x = -54; x < 60; x += 8) { r(x, -26, 1.5, 1.5, '#64748B'); r(x, -27, 1, 1, '#FFFFFF'); }
    for (let y = -78; y < 0; y += 10) r(-39, y, 1.5, 1.5, '#64748B');
    // (inside: dark in steps, the bulkhead, the seats (red vinyl: lit on top, their seams), the belts)
    fl('#334155', () => { c.moveTo(-48, -70); c.lineTo(52, -74); c.quadraticCurveTo(66, -50, 62, -6); c.lineTo(-48, -4); c.closePath(); }, 1);
    r(-46, -68, 96, 6, '#475569'); r(-48, -30, 110, 14, '#273449');
    r(-48, -16, 110, 12, '#1E293B');
    for (const sx of [-26, 28]) {
      fl('#7F1D1D', () => c.roundRect(sx - 18, -50, 10, 46, 3), 1.2); r(sx - 17, -49, 3, 42, '#B91C1C'); r(sx - 17, -49, 8, 2, '#DC2626'); r(sx - 13, -30, 4, 1, '#450A0A');
      fl('#991B1B', () => c.roundRect(sx - 14, -10, 26, 8, 2), 1.2); r(sx - 13, -9, 24, 2, '#DC2626'); r(sx - 13, -4, 24, 1, '#450A0A');
      r(sx - 9, -46, 1.5, 38, '#18181B'); r(sx - 9, -24, 3, 3, '#A1A1AA');
    }
    // (the instrument panel up front: its gauges, the screen glowing, warning lamps; a dashboard peace-sign bobblehead)
    fl('#18181B', () => { c.moveTo(48, -30); c.lineTo(66, -36); c.lineTo(66, -16); c.lineTo(50, -14); c.closePath(); }, 1);
    r(49, -29, 16, 1, '#3F3F46');
    for (const [gx, gy] of [[54, -27], [61, -29]]) { dot(gx, gy, 2.6, '#F8FAFC'); dot(gx, gy, 1.8, '#1E293B'); r(gx, gy - 2, 1, 2, '#F97316'); }
    r(52, -22, 9, 5, '#14532D'); r(53, -21, 7, 3, (f >> 4) % 2 ? '#22C55E' : '#16A34A'); r(53, -21, 2, 1, '#BBF7D0');
    for (let i = 0; i < 3; i++) r(62, -24 + i * 3, 2, 2, i === 1 && (f >> 3) % 2 ? '#EF4444' : i === 1 ? '#7F1D1D' : '#FDE047');
    { const bob = Math.sin(f * 0.3) * 1.5; c.strokeStyle = '#A1A1AA'; c.lineWidth = 1; c.beginPath(); c.moveTo(58, -36); c.lineTo(58 + bob, -40); c.stroke(); dot(58 + bob, -42, 3, '#16A34A'); dot(57.5 + bob, -42.5, 1.8, '#4ADE80'); r(57.5 + bob, -44, 1, 4, '#F8FAFC'); }
    // (the stripes along its belly (lit along their tops), the ride's name on the side)
    r(-56, -12, 124, 4, '#DC2626'); r(-56, -12, 124, 1, '#F87171'); r(-56, -9, 124, 1, '#991B1B');
    r(-56, -7, 124, 3, '#1D4ED8'); r(-56, -7, 124, 1, '#60A5FA'); r(-56, -5, 124, 1, '#1E3A8A');
    c.font = '5px "Press Start 2P"'; c.fillStyle = '#1E3A8A'; c.fillText('HELICOPTER RIDES', -53, -19); c.fillStyle = '#2563EB'; c.fillText('HELICOPTER RIDES', -54, -20);
  } else {
    // The pillar between the seats (stepped), the glass bubble (the sky in it in bands, its glints, the frame), the
    // door, the chin gun, the skids, the mast and its swashplate, the rotor
    r(1, -84, 5, 86, WH[2]); r(1, -84, 2, 86, WH[1]); r(5, -84, 1, 86, WH[3]); c.strokeStyle = INK; c.lineWidth = 1.2; c.strokeRect(1, -84, 5, 86);
    const glass = () => { c.moveTo(6, -86); c.lineTo(30, -86); c.quadraticCurveTo(58, -84, 72, -52); c.quadraticCurveTo(80, -24, 66, 2); c.lineTo(52, 2); c.quadraticCurveTo(60, -40, 6, -78); c.closePath(); };
    c.fillStyle = 'rgba(186, 230, 253, 0.2)'; c.beginPath(); glass(); c.fill();
    c.save(); c.beginPath(); glass(); c.clip();
    c.fillStyle = 'rgba(224, 242, 254, 0.32)'; c.fillRect(0, -90, 90, 16);
    c.fillStyle = 'rgba(186, 230, 253, 0.16)'; c.fillRect(0, -74, 90, 14);
    c.fillStyle = 'rgba(30, 58, 95, 0.18)'; c.fillRect(0, -18, 90, 22);
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(30, -86); c.quadraticCurveTo(58, -84, 72, -52); c.quadraticCurveTo(80, -24, 66, 2); c.stroke();
    c.strokeStyle = WH[2]; c.lineWidth = 1; c.beginPath(); c.moveTo(29, -85); c.quadraticCurveTo(56, -83, 70, -52); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(38, -80); c.quadraticCurveTo(58, -74, 64, -56); c.stroke();
    c.lineWidth = 1; c.beginPath(); c.moveTo(42, -76); c.quadraticCurveTo(56, -70, 60, -58); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.moveTo(68, -40); c.lineTo(69, -30); c.stroke();
    r(66, -38, 2, 2, '#FFFFFF');
    // (the door: open on Harry's side when he's shoved out)
    if (o.harryDoor) { fl(WH[1], () => { c.moveTo(66, -70); c.lineTo(96, -64); c.lineTo(94, -14); c.lineTo(66, -10); c.closePath(); }, 1.2); r(68, -62, 24, 30, 'rgba(186,230,253,0.35)'); r(88, -40, 4, 2, '#52525B'); r(68, -24, 24, 6, WH[3]); }
    // (the chin gun: the barrel in steps, its muzzle, the ammo box)
    fl('#3F3F46', () => c.rect(56, -16, 22, 6), 1.2); r(57, -15, 20, 2, '#71717A'); r(57, -12, 20, 1, '#18181B');
    fl('#27272A', () => c.rect(76, -17, 4, 8), 1); fl('#4D5B2A', () => c.rect(52, -12, 8, 7), 1); r(53, -11, 6, 2, '#6B7E3A');
    // skids: the struts (lit up their front), the skid tubes (lit along the top, dark under), the front curl
    c.strokeStyle = INK; c.lineWidth = 3.4;
    c.beginPath(); c.moveTo(-36, 2); c.lineTo(-40, 18); c.moveTo(40, 2); c.lineTo(44, 18); c.stroke();
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 1; c.beginPath(); c.moveTo(-37, 3); c.lineTo(-41, 17); c.moveTo(39, 3); c.lineTo(43, 17); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(-60, 18); c.lineTo(60, 18); c.quadraticCurveTo(72, 18, 74, 10); c.stroke();
    c.strokeStyle = '#71717A'; c.lineWidth = 2.5; c.stroke();
    c.strokeStyle = '#D4D4D8'; c.lineWidth = 1; c.beginPath(); c.moveTo(-58, 17); c.lineTo(58, 17); c.quadraticCurveTo(70, 17, 72, 11); c.stroke();
    // (the mast: stepped, the swashplate, its links)
    fl('#52525B', () => c.rect(-4, -98, 10, 14), 1.2); r(-3, -97, 3, 12, '#A1A1AA'); r(4, -97, 1, 12, '#27272A');
    fl('#71717A', () => c.ellipse(1, -90, 9, 2.5, 0, 0, Math.PI * 2), 1); r(-6, -91, 6, 1, '#D4D4D8');
    // (the rotor: its blur banded in three stepped rings (no smooth fade), the tip path's rim catching the light, the
    // two blades foreshortened as it turns (dark, a lit edge, the yellow tip caps))
    c.fillStyle = 'rgba(40, 40, 48, 0.09)'; c.beginPath(); c.ellipse(1, -99, 162, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(40, 40, 48, 0.1)'; c.beginPath(); c.ellipse(1, -99, 128, 6.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(40, 40, 48, 0.12)'; c.beginPath(); c.ellipse(1, -99, 86, 4.5, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255, 255, 255, 0.28)'; c.lineWidth = 1; c.beginPath(); c.ellipse(1, -99, 161, 7.5, 0, Math.PI, Math.PI * 1.9); c.stroke();
    c.strokeStyle = 'rgba(250, 204, 21, 0.3)'; c.lineWidth = 1; c.beginPath(); c.ellipse(1, -99, 158, 7.2, 0, 0.1, Math.PI - 0.1); c.stroke();
    for (const k of [0, Math.PI / 2]) {
      const L = Math.cos(h.rotor + k) * 160;
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(1 - L, -99); c.lineTo(1 + L, -99); c.stroke();
      c.strokeStyle = '#52525B'; c.lineWidth = 2; c.beginPath(); c.moveTo(1 - L, -99.5); c.lineTo(1 + L, -99.5); c.stroke();
      c.strokeStyle = '#A1A1AA'; c.lineWidth = 1; c.beginPath(); c.moveTo(1 - L, -100.5); c.lineTo(1 + L, -100.5); c.stroke();
      // (the tip caps: the last 8 px of each blade's end, yellow)
      if (Math.abs(L) > 20) for (const s of [-1, 1]) { const e = 1 + s * L; c.fillStyle = '#FACC15'; c.fillRect(Math.round(Math.min(e, e - Math.sign(s * L) * 8)), -101, 8, 3); }
    }
    // (red off the last one through it, and the splatter on the glass)
    drawRotorSmear(c, f, h.rotor);
    drawShieldSplat(c, f, h.tilt + h.flip * Math.PI);
    fl('#A1A1AA', () => c.arc(1, -99, 5, 0, Math.PI * 2), 1.2); dot(0, -100, 2, '#E4E4E7');
    // (its lights: a red one under the tail, a green one on the nose, a white strobe on the roof, blinking; each in its
    // stepped glow)
    const lamp = (x: number, y: number, col: string, glow: string) => { c.globalAlpha = 0.2; dot(x, y, 9, glow); c.globalAlpha = 0.4; dot(x, y, 5.5, glow); c.globalAlpha = 1; dot(x, y, 3, col); r(x - 1, y - 2, 1, 1, '#FFFFFF'); };
    if ((f >> 3) % 4 === 0) lamp(-60, 6, '#EF4444', '#F87171');
    if ((f >> 3) % 4 === 2) lamp(70, 0, '#4ADE80', '#86EFAC');
    if (f % 40 < 3) { c.globalAlpha = 0.3; dot(-10, -100, 14, '#FFFFFF'); c.globalAlpha = 0.85; dot(-10, -100, 6, '#FFFFFF'); c.globalAlpha = 1; }
    // (hit: smoking, sparking; dying: on fire (banded tongues, the smoke rolling off it))
    if (o.burning) {
      for (let i = 0; i < 4; i++) { const ph = ((f * 1.5 + i * 22) % 60) / 60; c.globalAlpha = 0.5 * (1 - ph); dot(-30 + i * 12 - ph * 30, -90 - ph * 40, 6 + ph * 12, i % 2 ? '#3F3F46' : '#52525B'); }
      c.globalAlpha = 1;
      for (let i = 0; i < 5; i++) { const x = -40 + i * 9 + Math.sin(f * 0.5 + i) * 3, y = -80 - ((f * 3 + i * 7) % 26), rr = 7 - (i % 3); dot(x, y, rr + 1.5, '#B91C1C'); dot(x, y, rr, i % 2 ? '#F97316' : '#FDE047'); dot(x - 1, y - 1, rr * 0.4, '#FFFBEB'); }
    }
  }
  c.restore();
};

/** His rockets, the charges by the corner (screen), the blasts. */
export const drawRockets = (c: Ctx, state: GameState) => {
  const h = heliOf(state);
  for (const k of h.rockets) {
    // (the rocket: its body in steps (lit along the top, shaded under), a red nose cone, the band, the fins; its
    // exhaust banded (white-hot at the nozzle, yellow, orange), flickering)
    c.save(); c.translate(k.x, k.y); c.rotate(Math.atan2(k.vy, k.vx));
    const fx = -22 - (k.t % 3) * 3;
    c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(-12, -4); c.lineTo(fx - 4, 0); c.lineTo(-12, 4); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(-12, -2.5); c.lineTo(fx + 3, 0); c.lineTo(-12, 2.5); c.fill();
    c.fillStyle = '#FFFBEB'; c.fillRect(-14, -1, 3, 2);
    c.fillStyle = INK; c.fillRect(-12, -4, 22, 8); c.beginPath(); c.moveTo(9, -4); c.lineTo(15, 0); c.lineTo(9, 4); c.fill();
    c.fillStyle = '#D4D4D8'; c.fillRect(-11, -3, 18, 6); c.fillStyle = '#F4F4F5'; c.fillRect(-11, -3, 18, 2); c.fillStyle = '#9CA3AF'; c.fillRect(-11, 1, 18, 2);
    c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(7, -3); c.lineTo(13, 0); c.lineTo(7, 3); c.fill(); c.fillStyle = '#F87171'; c.fillRect(7, -3, 3, 1);
    c.fillStyle = '#1D4ED8'; c.fillRect(-2, -3, 2, 6);
    c.fillStyle = INK; c.beginPath(); c.moveTo(-13, -4); c.lineTo(-17, -9); c.lineTo(-7, -4); c.moveTo(-13, 4); c.lineTo(-17, 9); c.lineTo(-7, 4); c.fill();
    c.fillStyle = '#52525B'; c.beginPath(); c.moveTo(-12, -4); c.lineTo(-15, -7.5); c.lineTo(-8, -4); c.moveTo(-12, 4); c.lineTo(-15, 7.5); c.lineTo(-8, 4); c.fill();
    c.restore();
  }
  for (const b of h.booms) drawBoom(c, b);
  drawShred(c, state);
};
/** For the main HUD (App.tsx: the PWR row): the rotor boost's charge (0 while it's boosting, filling over its
 *  cooldown, 1 ready) and the rockets' charges (0..3), stepped so the HUD isn't redrawn every frame. */
export const heliMeters = (h: Heli) => {
  const q = (v: number) => Math.round(v * 20) / 20;
  return { boost: q(h.boost ? 0 : 1 - Math.max(0, h.boostCd) / BOOST_CD), rockets: q(Math.max(0, Math.min(3, h.charges))) };
};
