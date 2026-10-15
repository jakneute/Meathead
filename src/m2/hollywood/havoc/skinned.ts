// SKINNED BY THE WIND: Meathead's death when the tornado's what gets him (its plain kill, not the fling). It has him
// up off the street and round in the funnel, spinning, screaming, and the wind takes him apart from the windward side
// in: the skin (and the clothes with it) peeled off in strips, him raw red underneath; then the meat stripped off the
// bones in chunks, flying off round it; and it spits out what's left, his skeleton, tumbling, onto the street, where it
// clatters down into a pile of bones (a last bit of meat on them). His underpants come down out of the sky after it
// and land on top. The tornado doesn't stop for any of it: on down its war path (chase.ts tornadoRoams).
//
// Drawn in front of the tornado (art.ts calls drawSkinned after it), so he reads in there.

import type { GameState } from '../../../m1/game/core/state';
import type { WeaponType } from '../../../m1/types';
import { registerDeathAnim, registerDeathKind, type MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { PARTICLE_PALETTES } from '../../../m1/constants';
import { Y, R, groundH } from './layout';
import { hvOf } from './state';
import { tornadoBase, tornadoRoams } from './chase';

type Ctx = CanvasRenderingContext2D;
const SKINNED = 'own:skinned' as const;
const GORE = PARTICLE_PALETTES.GORE;

/** The beats: up into it; the skin going (from, to); the meat going (from, to); spat out; how long it all plays. */
const SKIN0 = 8, SKIN1 = 42, MEAT0 = 34, MEAT1 = 74, RELEASE = 80, LEN = 210;
const BONE = '#E7E2D3', BONE_SH = '#B4AD99', BONE_HI = '#FFFBEB', INK = '#1C1917';
const SKIN = ['#F2C4A0', '#E0A882', '#C98B66'];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The skeleton once it's spat out: where its feet are, how it's going, its turn; when it hit (-1 not yet); the
 *  underpants' fall (-1 not yet). Per death (set up at its first frame). */
const sk = { x: 0, feet: 0, vx: 0, vy: 0, rot: 0, floor: 0, landed: -1, pantsY: -1, pantsVy: 0, shat: false, nude: false };

const floorAt = (x: number) => Y(groundH(R(x)) ?? 0);

/** Where he is, held up in it (t frames in, before it spits him out): his feet, his tumble, his turn about upright (its
 *  cos: the turning round in the wind). */
const heldAt = (state: GameState, d: MeatheadDeath, t: number) => {
  const tn = hvOf(state).tornado, tx = tn.on ? tn.x : d.x;
  const ang = t * 0.28, r = 22 + Math.min(26, t * 0.5), k = clamp01(t / 10);
  const up = Math.min(130, t * 2.2);
  const ox = tx + Math.sin(ang) * r, oy = Y(tornadoBase(tx)) - up;
  return { x: d.x + (ox - d.x) * k, feet: d.y + (oy - d.y) * k, rot: Math.sin(t * 0.17) * 0.5 + t * 0.06, turn: Math.cos(ang * 1.3) };
};

registerDeathKind('m2:hwh_tornado', SKINNED);
registerDeathAnim(SKINNED, {
  frames: LEN, airOk: true,
  tick: (ctx, d, t) => {
    const { state } = ctx, P = state.particles;
    tornadoRoams(state);
    if (t === 1) {
      Object.assign(sk, { landed: -1, pantsY: -1, pantsVy: 0, shat: isShat(state), nude: isNude(state) });
      playSound('hurt', 1, 2); playSound('whirl', 1, -6); playSound('screams', 0.4, 6);
    }
    if (t < RELEASE) {
      const h = heldAt(state, d, t), mid = h.feet - 34, tv = hvOf(state).tornado.v;
      // (the skin and the clothes off him in strips, round and away on the wind)
      if (t >= SKIN0 && t < SKIN1 + 6) for (let i = 0; i < 2; i++) {
        const a = rnd(0, Math.PI * 2);
        P.push({ pos: { x: h.x + rnd(-14, 14), y: mid + rnd(-28, 28) }, vel: { x: Math.cos(a) * rnd(3, 8) + tv, y: rnd(-6, -1) }, life: rnd(30, 55), color: i ? SKIN[(t + i) % 3] : (t % 3 ? '#3B5B8C' : '#F8FAFC'), size: rnd(3, 7) });
      }
      // (then the meat off the bones in chunks, and the blood with it)
      if (t >= MEAT0 && t < MEAT1 + 4) for (let i = 0; i < 3; i++) {
        const a = rnd(0, Math.PI * 2);
        P.push({ pos: { x: h.x + rnd(-12, 12), y: mid + rnd(-26, 26) }, vel: { x: Math.cos(a) * rnd(3, 10) + tv, y: rnd(-7, -1) }, life: rnd(40, 80), color: GORE[(t + i) % GORE.length], size: i === 0 ? rnd(6, 10) : rnd(3, 6), grav: 0.12 });
      }
      if (t >= SKIN0 && t < MEAT1 && t % 5 === 0) playSound(t % 10 ? 'squish' : 'splat', 0.5, rnd(-2, 6));
      if (t === SKIN0 + 4) playSound('gush', 0.8, 2);
      if (t === MEAT0 + 6) { playSound('gush', 1, -4); playSound('hurt', 0.9, 8); }
      if (t === RELEASE - 1) {
        // Spat out the back of it (it's going on, right): what's left of him, tumbling
        Object.assign(sk, { x: h.x, feet: h.feet, vx: -rnd(2.5, 3.5), vy: -rnd(3, 5), rot: h.rot, floor: floorAt(h.x) });
        playSound('whoosh', 0.9, -2);
      }
      return;
    }
    // The bones, down onto the street
    if (sk.landed < 0) {
      sk.vy += 0.55; sk.x += sk.vx; sk.feet += sk.vy; sk.rot += 0.24;
      sk.floor = floorAt(sk.x);
      if (sk.feet >= sk.floor) {
        sk.feet = sk.floor; sk.landed = t;
        playSound('clink', 1, -2); playSound('crunch', 0.6, 8); playSound('thud', 0.5, 8); shakeScreen(state, 6, 3);
        for (let i = 0; i < 8; i++) P.push({ pos: { x: sk.x + rnd(-16, 16), y: sk.floor - 4 }, vel: { x: rnd(-3, 3), y: rnd(-3, -1) }, life: 30, color: 'rgba(168, 162, 158, 0.7)', size: rnd(4, 8) });
      }
    } else {
      const u = t - sk.landed;
      if (u === 4 || u === 8 || u === 13 || u === 19) playSound('clink', 0.7 - u * 0.02, 4 + u * 0.4);
      if (u === 26) playSound('clink', 0.35, 14);
      // (the underpants, out of the sky after him)
      if (u === 20 && !sk.nude) { sk.pantsY = state.camera.y - 20; sk.pantsVy = 0; }
      if (sk.pantsY >= 0) { sk.pantsVy = Math.min(1.6, sk.pantsVy + 0.04); sk.pantsY = Math.min(sk.floor - 22, sk.pantsY + sk.pantsVy); }
    }
  },
});
// (drawn in front of the tornado instead: drawSkinned)
registerDeathDraw(SKINNED, () => {});

// ---------------------------------------------------------------------------------------------------------------
// The bones

type Seg = [number, number, number, number, number];
/** His skeleton stood up (feet at 0, facing +x): its long bones [x1, y1, x2, y2, thickness]. */
const LIMBS: Seg[] = [
  // the back arm, the back leg
  [-10, -43, -13, -30, 3], [-13, -30, -12, -19, 2.5],
  [-5, -20, -6, -10, 3.5], [-6, -10, -7, -1, 3],
  // the spine
  [1, -46, 0, -22, 3],
  // the near leg, the near arm
  [5, -20, 6, -10, 3.5], [6, -10, 7, -1, 3],
  [11, -43, 14, -30, 3], [14, -30, 16, -19, 2.5],
];

const boneLine = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = BONE_SH; c.lineWidth = w; c.stroke();
  c.strokeStyle = BONE; c.lineWidth = Math.max(1, w - 1.5); c.beginPath(); c.moveTo(x1 - 0.5, y1 - 0.5); c.lineTo(x2 - 0.5, y2 - 0.5); c.stroke();
  // (the knobs at the joints)
  for (const [x, y] of [[x1, y1], [x2, y2]]) { c.fillStyle = INK; c.beginPath(); c.arc(x, y, w * 0.75 + 1, 0, Math.PI * 2); c.fill(); c.fillStyle = BONE; c.beginPath(); c.arc(x, y, w * 0.75, 0, Math.PI * 2); c.fill(); }
  c.lineCap = 'butt';
};
/** The skull, its middle at (x, y), grinning (jaw open by `jaw`). */
const skull = (c: Ctx, x: number, y: number, jaw = 0) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 9.5, 9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE_SH; c.beginPath(); c.ellipse(x, y, 8.5, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE; c.beginPath(); c.ellipse(x - 1, y - 1, 7.5, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE_HI; c.fillRect(x - 5, y - 6, 4, 2);
  // (the sockets, the nose, the teeth, the jaw)
  c.fillStyle = INK; c.fillRect(x - 1, y - 2, 4, 4); c.fillRect(x + 4, y - 2, 3, 4); c.fillRect(x + 3, y + 3, 2, 2);
  c.fillStyle = INK; c.fillRect(x - 2, y + 6, 10, 4 + jaw);
  c.fillStyle = BONE; for (let i = 0; i < 4; i++) { c.fillRect(x - 1 + i * 2.4, y + 6, 1.6, 1.6); c.fillRect(x - 1 + i * 2.4, y + 8 + jaw, 1.6, 1.6); }
};
/** The ribs: the cage round the spine (x the spine, from top down). */
const ribs = (c: Ctx, x: number, top: number) => {
  for (let i = 0; i < 5; i++) {
    const y = top + i * 4, w = 11 - Math.abs(i - 1.5) * 1.2;
    c.strokeStyle = INK; c.lineWidth = 3.2; c.beginPath(); c.moveTo(x - w, y + 2); c.quadraticCurveTo(x, y - 3, x + w, y + 2); c.stroke();
    c.strokeStyle = i % 2 ? BONE_SH : BONE; c.lineWidth = 1.6; c.stroke();
  }
};
const pelvis = (c: Ctx, x: number, y: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 11, 5.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE_SH; c.beginPath(); c.ellipse(x, y, 10, 4.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BONE; c.beginPath(); c.ellipse(x, y - 1, 8, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y + 1, 3, 2, 0, 0, Math.PI * 2); c.fill();
};
/** The whole skeleton stood up, local (feet at 0, facing +x); bits of meat still on it (`meat` 0..1). */
const skeleton = (c: Ctx, meat: number, f: number) => {
  for (const [x1, y1, x2, y2, w] of LIMBS.slice(0, 4)) boneLine(c, x1, y1, x2, y2, w);
  boneLine(c, ...LIMBS[4]);
  ribs(c, 1, -42);
  pelvis(c, 0, -20);
  for (const [x1, y1, x2, y2, w] of LIMBS.slice(5)) boneLine(c, x1, y1, x2, y2, w);
  skull(c, 4, -54, (f >> 2) % 2);
  // (what the wind hasn't got off yet: red strings on the joints)
  if (meat > 0) {
    c.fillStyle = '#991B1B';
    for (const [x, y] of [[-13, -30], [6, -10], [-6, -10], [14, -30], [0, -22], [-8, -40]] as const) if (hash(x * 3 + y) < meat) c.fillRect(x - 2, y - 1, 4, 3);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him in it, coming apart (drawn into a buffer: the raw red over the skin, then the meat cut away cell by cell)

let buf: HTMLCanvasElement | null = null;
const VW = 160, VH = 130, VS = 2, CELL = 3;

const stripped = (c: Ctx, state: GameState, d: MeatheadDeath, weapon: WeaponType, t: number, f: number) => {
  const skinK = clamp01((t - SKIN0) / (SKIN1 - SKIN0)), meatK = clamp01((t - MEAT0) / (MEAT1 - MEAT0));
  const ox = d.x - VW / 2, oy = d.y - VH + 12;
  buf ??= document.createElement('canvas');
  if (buf.width < VW * VS || buf.height < VH * VS) { buf.width = VW * VS; buf.height = VH * VS; }
  const g = buf.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.clearRect(0, 0, VW * VS, VH * VS);
  g.setTransform(VS, 0, 0, VS, -ox * VS, -oy * VS);
  body(g, state, d, weapon, { isGrounded: false, deathFace: t < SKIN1 ? 'scream' : 'agony' });
  // (the wind's side first: from the back of him, the way it's turning)
  // (the whole of him and what he's holding: nothing left hanging in the air once the meat's gone)
  const BW = 120, x0 = d.x - BW / 2, y0 = d.y - 100, along = (cx: number) => clamp01(d.facing > 0 ? (cx - x0) / BW : 1 - (cx - x0) / BW);
  if (skinK > 0) {
    g.globalCompositeOperation = 'source-atop';
    const MUSCLE = ['#991B1B', '#B91C1C', '#DC2626', '#7F1D1D'];
    for (let cy = y0; cy < d.y; cy += CELL) for (let cx = x0; cx < x0 + BW; cx += CELL) {
      const u = along(cx) * 0.55 + hash(cx * 0.37 + cy * 1.31) * 0.45;
      if (u > skinK * 1.05) continue;
      // (striated: the muscle's grain runs down him; a fleck of yellow fat here and there)
      const h = hash(cx * 1.7 + cy * 0.3);
      g.fillStyle = h > 0.93 ? '#FDE68A' : MUSCLE[(Math.floor((cx - x0) / CELL) + Math.floor((cy - y0) / 9)) % 4];
      g.fillRect(cx, cy, CELL, CELL);
    }
    // (the raw edge: torn skin curling up, pale)
    if (skinK < 1) for (let cy = y0; cy < d.y; cy += CELL) for (let cx = x0; cx < x0 + BW; cx += CELL) {
      const u = along(cx) * 0.55 + hash(cx * 0.37 + cy * 1.31) * 0.45;
      if (u > skinK * 1.05 && u < skinK * 1.05 + 0.06) { g.fillStyle = '#FBE3D0'; g.fillRect(cx, cy, CELL, CELL); }
    }
  }
  if (meatK > 0) {
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
    for (let cy = y0; cy < d.y; cy += CELL) for (let cx = x0; cx < x0 + BW; cx += CELL) {
      const u = along(cx) * 0.4 + hash(cx * 2.91 + cy * 0.77) * 0.6;
      if (u < meatK * 1.08) g.fillRect(cx, cy, CELL, CELL);
    }
  }
  g.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { meatK };
};

/** Him and his bones, in front of the tornado: art.ts calls it after drawing it. */
export const drawSkinned = (c: Ctx, state: GameState) => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== SKINNED || state.deathTimer <= 0 || typeof document === 'undefined') return;
  const t = Math.min(state.deathScene?.t ?? 9999, LEN), f = state.frame;
  const weapon = state.player.currentWeapon;
  c.save();
  if (t < RELEASE) {
    // Held up in it, turning round and round, coming apart
    const h = heldAt(state, d, Math.max(1, t)), turn = Math.max(0.18, Math.abs(h.turn)) * Math.sign(h.turn || 1);
    const { meatK } = stripped(c, state, d, weapon, t, f);
    c.translate(h.x, h.feet - 34); c.rotate(h.rot); c.scale(turn, 1); c.translate(0, 34);
    // (the bones showing through as the meat goes)
    if (meatK > 0) { c.save(); c.scale(d.facing, 1); skeleton(c, 1 - meatK * 0.5, f); c.restore(); }
    c.drawImage(buf!, 0, 0, VW * VS, VH * VS, -VW / 2, -VH + 12, VW, VH);
    c.restore();
    return;
  }
  if (sk.landed < 0) {
    // Spat out: the skeleton, tumbling down onto the street
    c.translate(sk.x, sk.feet - 34); c.rotate(sk.rot); c.translate(0, 34); c.scale(d.facing, 1);
    skeleton(c, 0.5, f);
    c.restore();
    return;
  }
  // Down: it comes apart in a heap (each bone from where it was to where it lies, a hop on the way), the skull rolling
  // to a stop on top; a smear of blood under it; the underpants come down on it
  const u = t - sk.landed, k = clamp01(u / 14), hop = Math.sin(k * Math.PI) * 10;
  const x = sk.x, y = sk.floor, F = d.facing;
  drawBloodPool(c, Math.round(x), Math.round(y), Math.round(8 + Math.min(16, u * 0.4)), 913);
  const PILE: Seg[] = [
    [-30, -3, -12, -5, 3.5], [-8, -2, 12, -6, 3.5], [14, -3, 30, -2, 3], [-24, -8, -6, -3, 3],
    [2, -10, 24, -4, 3], [-16, -12, 0, -6, 2.5], [6, -2, 20, -9, 2.5], [-36, -2, -20, -6, 3], [-4, -8, 8, -14, 3],
  ];
  const ca = Math.cos(sk.rot), sa = Math.sin(sk.rot);
  const stood = ([x1, y1, x2, y2, w]: Seg): Seg => {
    const tr = (px: number, py: number): [number, number] => { const lx = px * F, ly = py + 34; return [x + lx * ca - ly * sa, y - 34 + lx * sa + ly * ca]; };
    const a = tr(x1, y1), b = tr(x2, y2);
    return [a[0], a[1], b[0], b[1], w];
  };
  LIMBS.forEach((seg, i) => {
    const s = stood(seg), p = PILE[i];
    const L = (a: number, b: number) => a + (b - a) * k;
    const bx1 = L(s[0], x + p[0] * F), by1 = L(s[1], y + p[1]) - hop * (1 - i / 12), bx2 = L(s[2], x + p[2] * F), by2 = L(s[3], y + p[3]) - hop * (1 - i / 12);
    boneLine(c, bx1, by1, bx2, by2, s[4]);
  });
  // (the ribcage on its back, the pelvis)
  c.save(); c.translate(x - 6 * F, y - 6 - hop * 0.6); c.rotate(F * 0.3 * k); ribs(c, 0, -8); c.restore();
  pelvis(c, x + 10 * F, y - 4 - hop * 0.4);
  // (the skull: off the top of the heap, a roll, and still, grinning)
  const roll = Math.min(1, u / 22), sx = x + F * (4 + roll * 14), sy = y - 14 + Math.abs(Math.sin(roll * Math.PI)) * -8 + 4 * roll;
  c.save(); c.translate(sx, sy); c.rotate(F * roll * 2.2); c.scale(F, 1); skull(c, 0, 0, 1); c.restore();
  // (meat still on it in places)
  c.fillStyle = '#991B1B'; c.fillRect(Math.round(x - 14 * F), Math.round(y - 6), 4, 2); c.fillRect(Math.round(x + 8 * F), Math.round(y - 9), 3, 2);
  // (a last wisp off it)
  if (u < 60) { c.fillStyle = `rgba(214, 211, 209, ${(0.4 * (1 - u / 60)).toFixed(2)})`; c.beginPath(); c.arc(x, y - 10 - u * 0.4, 6 + u * 0.15, 0, Math.PI * 2); c.fill(); }
  // The underpants: tighty-whities, fluttering down out of the sky; (shat) the stain on them
  if (sk.pantsY >= 0) {
    const down = sk.pantsY >= y - 22, sway = down ? 0 : Math.sin(f * 0.09) * 18, tilt = down ? 0.15 : Math.sin(f * 0.09 + 1) * 0.5;
    c.save(); c.translate(x + sway - 2 * F, down ? y - 20 + 6 : sk.pantsY); c.rotate(tilt);
    c.fillStyle = INK; c.beginPath(); c.moveTo(-11, -5); c.lineTo(11, -5); c.lineTo(9, 3); c.lineTo(2, 7); c.lineTo(-2, 7); c.lineTo(-9, 3); c.closePath(); c.fill();
    c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(-10, -4); c.lineTo(10, -4); c.lineTo(8, 2.5); c.lineTo(1.5, 6); c.lineTo(-1.5, 6); c.lineTo(-8, 2.5); c.closePath(); c.fill();
    c.fillStyle = '#CBD5E1'; c.fillRect(-10, -4, 20, 2);
    if (sk.shat) { c.fillStyle = 'rgba(92, 58, 22, 0.85)'; c.beginPath(); c.ellipse(0, 3, 4, 3, 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  c.restore();
};
