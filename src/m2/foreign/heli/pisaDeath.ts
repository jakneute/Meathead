// Flattened by the Leaning Tower of Pisa (the user's: "a funny special death animation if the leaning tower falls on
// you"). The tower comes the rest of the way down with the helicopter under it, and squashes it flat as a pancake, him
// in it (a squeezed-out fart for the seal); a beat; his arm pokes up out of the wreck and gives it the finger, then
// flops. Then the tower creaks back up, all the way, and stops dead PERFECTLY STRAIGHT for the first time in eight
// hundred years (hitting him fixed the lean): the helicopter pancake peels off its underside and slaps down onto the
// ground; a DING; a tourist's camera flash. About 2.9 s; no input (it's his death), the HUD down from the first frame
// (a kill cam, as far as the HUD's concerned), SKIP >> for the lot (the death scene's own).

import type { GameState } from '../../../m1/game/core/state';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { skinTone, skinShadow, skinHighlight } from '../../../m1/game/render/player/body';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { heliOf } from './state';
import { pisaPivot, PISA_DOWN, PISA_LEN, groundY } from './mechs';
import { LEG } from './geo';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

export const PISA_SOURCE = 'm2:fl_pisa_fall';
export const PANCAKE = 'own:pisa_pancake' as const;
/** The beats: the tower the rest of the way down (and the squash); his arm up, the finger, the flop; the tower back
 *  up (the pancake peeling off it), settled dead straight; the ding; the flash; the end. */
const CRUSH = 16, ARM_UP = 34, FLOP = 82, RISE = 92, RISE_LEN = 38, DING = RISE + RISE_LEN + 4, FLASH = DING + 8, LEN = 172;

/** What it worked out at the start: where along the tower he was, where the pancake ends up (under the tower, then on
 *  the ground), the tower's lean as it got him. */
interface Pan { lean0: number; x0: number; y0: number; x: number; yTower: number; yGround: number }
let pan: Pan | null = null;

const ease = (k: number) => k * k * (3 - 2 * k);
const c01 = (v: number) => Math.max(0, Math.min(1, v));
/** The tower's lean t frames in. */
const leanAt = (p: Pan, t: number) => {
  if (t <= CRUSH) { const k = t / CRUSH; return p.lean0 + (PISA_DOWN - p.lean0) * k * k; }
  if (t < RISE) return PISA_DOWN;
  // (back up, a little past, and settled: 0, not its 0.07; straight)
  const k = c01((t - RISE) / RISE_LEN);
  return k < 0.8 ? PISA_DOWN * (1 - ease(k / 0.8)) : -0.03 * Math.sin(((k - 0.8) / 0.2) * Math.PI);
};
/** Where the pancake's feet are, t frames in. */
const feetAt = (p: Pan, t: number) => {
  if (t <= CRUSH) { const k = (t / CRUSH) ** 2; return { x: p.x0 + (p.x - p.x0) * k, y: p.y0 + (p.yTower - p.y0) * k }; }
  const peel = RISE + 6;
  if (t <= peel) return { x: p.x, y: p.yTower };
  // (peeled off the tower's underside as it goes up: down onto the ground, like a dropped rug)
  const s = t - peel;
  return { x: p.x, y: Math.min(p.yGround, p.yTower + 0.5 * 0.9 * s * s) };
};

/** How flat the helicopter (and him in it) is (0: not, 1: a pancake), and where (its feet), while it's on; else null. */
export const pancakeOf = (state: GameState) => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== PANCAKE || state.deathTimer <= 0 || !pan) return null;
  const t = Math.min(state.deathScene?.t ?? LEN, LEN), k = c01((t - CRUSH + 1) / 3);
  return { k, sx: 1 + 0.45 * k, sy: 1 - 0.8 * k, t };
};

registerDeathKind(PISA_SOURCE, PANCAKE);
registerDeathAnim(PANCAKE, {
  frames: LEN, airOk: true, cam: true,
  tick: (ctx, d, t) => {
    const { state } = ctx, h = heliOf(state), m = h.mechs[h.cur], p = state.player;
    if (t === 1) {
      // (where along it he was: the pancake ends up there under it, lying)
      const piv = pisaPivot(), lean = m?.lean ?? 1, a = -Math.PI / 2 - lean;
      const ux = Math.cos(a), uy = Math.sin(a), fx = d.x, fy = d.y;
      const along = Math.max(140, Math.min(PISA_LEN - 60, (fx - piv.x) * ux + (fy - piv.y) * uy));
      const ad = -Math.PI / 2 - PISA_DOWN, x = piv.x + Math.cos(ad) * along, yTower = piv.y + Math.sin(ad) * along + 22;
      pan = { lean0: lean, x0: fx, y0: fy, x, yTower, yGround: Math.max(yTower, groundY(x)) };
      h.mech = null; h.harry = null; h.boost = null;
      playSound('crack', 1, -14); playSound('whoosh', 0.8, -10);
    }
    const P = pan;
    if (!P) return;
    if (m) m.lean = leanAt(P, t);
    // (the helicopter carried down with it, leveling out; the rotor winding down)
    const ft = feetAt(P, t);
    d.x = ft.x; d.y = ft.y;
    p.pos.x = ft.x - p.width / 2; p.pos.y = ft.y - p.height;
    h.tilt *= 0.7; h.flip *= 0.7;
    if (t < CRUSH) h.rotor += 0.7 * (1 - t / CRUSH);
    const piv = pisaPivot(), ad = -Math.PI / 2 - PISA_DOWN;
    if (t === CRUSH) {
      // (the slam: the crunch, the squeal of metal, the squeeze (out of him), the dust all along it)
      playSound('crash', 1, -12); playSound('crunch', 1, -6); playSound('boom', 0.8, -16); playSound('squish', 1, -4);
      shakeScreen(state, 20, 12);
      for (let i = 0; i < 40; i++) { const s = Math.random() * PISA_LEN; state.particles.push({ pos: { x: piv.x + Math.cos(ad) * s, y: piv.y + Math.sin(ad) * s + 10 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 40 + Math.random() * 30, color: i % 2 ? '#E7E5E4' : '#A8A29E', size: 4 + Math.random() * 6 }); }
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: ft.x + (Math.random() - 0.5) * 200, y: ft.y - 10 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 50, color: i % 3 ? '#D6DCE6' : '#52525B', size: 2 + Math.random() * 3 });
    }
    if (t === CRUSH + 5) playSound('fart', 0.9, -6);
    if (t === ARM_UP) playSound('boing', 0.5, 6);
    if (t === FLOP) playSound('thud', 0.4, 8);
    if (t > RISE && t < RISE + RISE_LEN && (t - RISE) % 10 === 0) playSound('crumble', 0.7, -8 + (t - RISE) * 0.2);
    if (t === RISE + 6) playSound('scratch', 0.6, -4);
    if (t > RISE + 6 && ft.y >= P.yGround && feetAt(P, t - 1).y < P.yGround) { playSound('splat', 0.8, -4); shakeScreen(state, 4, 2); }
    if (t === RISE + RISE_LEN) playSound('clang', 0.5, -10);
    if (t === DING) playSound('ding', 1, 0);
    if (t === FLASH) playSound('click', 1, 4);
  },
});

/** Him in it: as flat as the helicopter round him (the copter's own squash is index.ts's: pancakeOf). */
registerDeathDraw(PANCAKE, (c, state, d: MeatheadDeath, weapon, t) => {
  const q = pancakeOf(state);
  const sx = q?.sx ?? 1, sy = q?.sy ?? 1;
  c.save();
  c.translate(d.x, d.y); c.scale(sx, sy); c.translate(-d.x, -d.y);
  body(c, state, d, weapon, { isGrounded: true, deathFace: t < CRUSH ? 'scream' : 'dead' });
  c.restore();
});

/** Over the flattened helicopter (index.ts drawFront, after it): the rotor's blades bent down over it, his arm up out
 *  of it (the finger, then flopped over), the DING over the tower's top once it's straight. `seat`: his seat in it. */
export const drawPancakeFront = (c: Ctx, state: GameState, seat: number) => {
  const q = pancakeOf(state), d = state.meatheadDeath;
  if (!q || !d || q.k <= 0) return;
  const t = q.t, x = d.x, y = d.y, top = y - 96 * q.sy;
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  // The rotor: its mast squashed into the roof, its blades bent down over the sides, one kinked
  const hx = x - seat * q.sx;
  const blade = (dir: number, kink: number) => {
    c.beginPath(); c.moveTo(hx, top - 4);
    c.lineTo(hx + dir * 60, top - 10); c.lineTo(hx + dir * (110 + kink), top + 8 + kink * 0.3); c.lineTo(hx + dir * (150 + kink * 0.5), y + 14);
    c.strokeStyle = INK; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#71717A'; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#A1A1AA'; c.lineWidth = 1.5; c.stroke();
  };
  blade(-1, 0); blade(1, 18);
  c.fillStyle = INK; c.fillRect(Math.round(hx - 8), Math.round(top - 10), 16, 9); c.fillStyle = '#52525B'; c.fillRect(Math.round(hx - 6), Math.round(top - 9), 12, 6);
  // His arm up out of the wreck: shoots up, the finger, held, shaking; then over it flops
  if (t >= ARM_UP) {
    const ax = x + 24 * q.sx, ay = top + 6, up = ease(c01((t - ARM_UP) / 6));
    const flop = ease(c01((t - FLOP) / 8)), shake = t < FLOP ? Math.sin(t * 1.3) * 0.05 : 0;
    c.translate(ax, ay); c.rotate(shake + flop * 1.45);
    const L = 40 * up;
    // (the sleeve, then the forearm, the fist, the middle finger up)
    c.fillStyle = INK; c.fillRect(-6, -14, 12, 15); c.fillStyle = '#1E3A8A'; c.fillRect(-5, -13, 10, 13); c.fillStyle = '#3B5BB5'; c.fillRect(-5, -13, 3, 13);
    c.fillStyle = INK; c.fillRect(-5, -L - 2, 10, L - 10);
    c.fillStyle = skinTone; c.fillRect(-4, -L - 1, 8, L - 12); c.fillStyle = skinHighlight; c.fillRect(-4, -L - 1, 2, L - 12); c.fillStyle = skinShadow; c.fillRect(2, -L - 1, 2, L - 12);
    if (up > 0.6) {
      const fy = -L - 10;
      c.fillStyle = INK; c.fillRect(-8, fy - 1, 16, 12); c.fillStyle = skinTone; c.fillRect(-7, fy, 14, 10); c.fillStyle = skinShadow; c.fillRect(-7, fy + 7, 14, 3);
      c.fillStyle = INK; for (const kx of [-4, 0, 4]) c.fillRect(kx, fy + 2, 1, 5);
      // (the finger: up while it's held, curled back down as it flops)
      const fl = t < FLOP ? 13 : 13 * (1 - flop);
      if (fl > 1) { c.fillStyle = INK; c.fillRect(-2, fy - fl - 1, 6, fl + 1); c.fillStyle = skinTone; c.fillRect(-1, fy - fl, 4, fl); c.fillStyle = skinHighlight; c.fillRect(-1, fy - fl, 1, fl); }
    }
  }
  c.restore();
  // The DING: once it's straight, a sparkle at its top
  if (t >= DING) {
    const piv = pisaPivot(), tx = piv.x + 42, ty = piv.y - (PISA_LEN - LEG) - 40, k = c01((t - DING) / 6), fade = 1 - c01((t - DING - 30) / 14);
    if (fade > 0) {
      c.save(); c.globalAlpha = fade; c.translate(tx, ty); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
      const star = (r: number, col: string) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.3 : r; c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); };
      star(34, INK); star(28, '#FDE047'); star(14, '#FFFBEB');
      c.font = '16px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = INK; c.fillText('DING!', 2, -38); c.fillStyle = '#FDE047'; c.fillText('DING!', 0, -40); c.textAlign = 'left';
      c.restore();
    }
  }
};

/** The tourist's camera flash (screen space, index.ts drawHud): a white pop, gone in a few frames. */
export const pancakeFlash = (state: GameState) => {
  const q = pancakeOf(state);
  if (!q || q.t < FLASH) return 0;
  return Math.max(0, 0.85 - (q.t - FLASH) * 0.12);
};
