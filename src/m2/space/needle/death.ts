// Decompression (Space Needle 2's big window, gone, with no suit on): sucked out into space with everybody else, his
// own death. A kill cam (screen space, over everything; drawn by the section's drawHud while it plays): from outside,
// the needle's saucer hanging over the Earth on its impossible stalk, the air jetting out of the hole in it, the
// passengers tumbling out, and him; then in close on him: he swells up, his eyes bulge out of his head, the vacuum
// pulls a string of turds out of his jeans that freeze in a line behind him, the frost takes him, stiff; then he drifts
// down toward the Earth, shrinking, and burns up coming in like a cheap meteor. Undignified.
//
// The same outside shot (him in the suit, fine) is the section's way out to the orbit: drawExterior / drawFloat.

import type { GameState } from '../../../m1/game/core/state';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import type { DeathFace } from '../../../m1/game/render/player/deathFace';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { playSound } from '../../../m1/game/platform/audio';
import { registerHurtLines } from '../../kinds';
import { stamp } from '../../intro/art/kit';
import type { Guest } from '../../adventure/queue/crowd';
import { drawOrbitBack, smoothstep, c01, hash } from './sky';
import { HURT_VACUUM, DEATH_VACUUM } from './lines';

type Ctx = CanvasRenderingContext2D;
export const VACUUM = 'needle_vacuum';
export const DECOMP = 'own:decompressed' as const;
export const DECOMP_FRAMES = 420;
/** When the kill cam cuts in close on him. */
const CLOSE = 100;

registerHurtLines(VACUUM, HURT_VACUUM, DEATH_VACUUM);
registerDeathKind(VACUUM, DECOMP);
registerDeathAnim(DECOMP, {
  frames: DECOMP_FRAMES, airOk: true,
  tick: (_ctx, _d, t) => {
    if (t === 1) playSound('whoosh', 1, -6);
    // (in close, out in the vacuum: no sound at all, but for what comes out of him, and the ice, and the burn)
    if (t === 168) playSound('fart', 0.35, -6);
    if (t === 236) playSound('ice', 0.4, -4);
    if (t === 330) playSound('ignite', 0.5, 4);
    if (t === 398) playSound('boom', 0.3, 8);
  },
});
// (in the world: nothing; it's all the kill cam, over everything)
registerDeathDraw(DECOMP, () => { /* drawn in screen space: drawDecompCam */ });

/** Who went out of the window with him (the section hands them over as it goes): tumbling out in the outside shot. */
let outGuests: Guest[] = [];
export const setOutGuests = (gs: Guest[]) => { outGuests = gs; };

// ---------------------------------------------------------------------------------------------------------------
// Him, as a puppet: drawn into a canvas of his own (so he can be tinted, the frost, without a filter), turned,
// scaled, swollen, then put down

const PUP = 360;
let pup: HTMLCanvasElement | null = null;
interface Pose {
  /** His middle on screen, how far he's turned, how big. */
  x: number; y: number; rot: number; s: number;
  /** Swollen (1 as he is). */
  bloat?: number; face?: DeathFace; facing?: 1 | -1;
  /** How far his eyes are out of his head (0..1); turds out of him so far (0..6); frost over him (0..1). */
  eyes?: number; turds?: number; frost?: number;
  /** In the suit. */
  suit?: boolean;
}
export const drawPuppet = (c: Ctx, state: GameState, P: Pose) => {
  if (typeof document === 'undefined') return;
  const R = 2;
  pup ??= document.createElement('canvas');
  if (pup.width !== PUP * R) { pup.width = PUP * R; pup.height = PUP * R; }
  const g = pup.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, pup.width, pup.height);
  g.setTransform(R, 0, 0, R, 0, 0);
  g.translate(PUP / 2, PUP / 2); g.rotate(P.rot);
  const b = P.bloat ?? 1, wob = b > 1 ? Math.sin(state.frame * 0.3) * 0.03 * (b - 1) * 10 : 0;
  g.scale(P.s * (b + wob), P.s * (b - wob * 0.6));
  const facing = P.facing ?? 1;
  const d = { kind: DECOMP, x: 0, y: 32, facing } as unknown as MeatheadDeath;
  // (the string of turds, frozen in a line out behind him, coming out of the seat of his jeans)
  const n = Math.floor(P.turds ?? 0);
  for (let k = n - 1; k >= 0; k--) {
    const tx = -facing * (10 + k * 9), ty = 4 + k * 7 + Math.sin(k * 1.7) * 2;
    const frozen = c01((n - k - 1) / 3);
    g.fillStyle = '#1A0B06'; g.beginPath(); g.ellipse(tx, ty, 5.5, 4, k * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = frozen > 0.5 ? '#8A7360' : '#6B4423'; g.beginPath(); g.ellipse(tx, ty, 4.5, 3, k * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = frozen > 0.5 ? '#E0F2FE' : '#8B5A2B'; g.fillRect(tx - 2, ty - 2, 2, 1);
  }
  body(g, state, d, state.player.currentWeapon, { deathFace: P.face ?? 'dead', kickPose: 0, isGrounded: false, vel: { x: 0, y: -1 }, spaceSuit: P.suit ? (state.player.spaceSuit ?? {}) : undefined });
  // (his eyes, out of his head on their stalks: white, veined, the pupils gone small)
  const e = P.eyes ?? 0;
  if (e > 0 && !P.suit) for (const ex of [1, 7]) {
    const x = facing * ex, y = -24, r = 2 + e * 4.5;
    g.fillStyle = '#B91C1C'; g.fillRect(x - 0.5, y, 1, 2);
    g.fillStyle = '#1A0B06'; g.beginPath(); g.arc(x + facing * e * 2, y - e * 1.5, r + 0.8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FEF2F2'; g.beginPath(); g.arc(x + facing * e * 2, y - e * 1.5, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#DC2626'; g.lineWidth = 0.5;
    for (let k = 0; k < 4; k++) { const a = k * 1.6 + ex; g.beginPath(); g.moveTo(x + facing * e * 2 + Math.cos(a) * r, y - e * 1.5 + Math.sin(a) * r); g.lineTo(x + facing * e * 2 + Math.cos(a) * r * 0.4, y - e * 1.5 + Math.sin(a) * r * 0.4); g.stroke(); }
    g.fillStyle = '#1A0B06'; g.fillRect(x + facing * (e * 2 + r * 0.3) - 0.8, y - e * 1.5 - 0.8, 1.6, 1.6);
  }
  // (the frost: blue-white over all of him, the crystals on it)
  const fr = P.frost ?? 0;
  if (fr > 0) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = `rgba(191, 230, 255, ${(0.62 * fr).toFixed(3)})`; g.fillRect(0, 0, pup.width, pup.height);
    g.globalCompositeOperation = 'source-over';
  }
  c.save(); c.imageSmoothingEnabled = false;
  c.drawImage(pup, Math.round(P.x - PUP / 2), Math.round(P.y - PUP / 2), PUP, PUP);
  c.restore();
  if (fr > 0.3) for (let k = 0; k < 18; k++) if (hash(k * 7) < fr) {
    const a = hash(k) * Math.PI * 2, r = hash(k + 3) * 34 * P.s;
    c.fillStyle = k % 3 ? '#F0F9FF' : '#7DD3FC';
    c.fillRect(Math.round(P.x + Math.cos(a) * r * 0.6), Math.round(P.y + Math.sin(a) * r), 2, 2);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The outside shot: the saucer on its stalk, the hole, the air going, the people

/** Where the saucer sits, and the hole in it (screen). */
export const SAUCER = { x: 300, y: 250 }, HOLE = { x: 482, y: 252 };
const INK = '#0A0F1A';
const paintSaucer = (c: Ctx) => {
  const { x, y } = SAUCER;
  // the spire, its beacon
  c.fillStyle = INK; c.fillRect(x - 3, y - 150, 6, 110);
  c.fillStyle = '#CDD6E2'; c.fillRect(x - 2, y - 150, 2, 110); c.fillStyle = '#74859C'; c.fillRect(x, y - 150, 2, 110);
  // the top: a teal dome, banded, chrome ribs
  for (const [r, col] of [[96, INK], [94, '#0D4F5D'], [84, '#126775'], [66, '#1A808C'], [42, '#2A9AA3']] as const) {
    c.fillStyle = col; c.beginPath(); c.ellipse(x - (94 - r) * 0.3, y - 22, r, r * 0.42, 0, Math.PI, 0); c.fill();
  }
  // the halo ring: chrome, the windows round it lit warm
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 186, 30, 0, 0, Math.PI * 2); c.fill();
  const ring = ['#2E3A4D', '#4A5A70', '#74859C', '#A3B1C4', '#CDD6E2', '#EEF2F7'];
  for (let i = 0; i < ring.length; i++) { c.fillStyle = ring[ring.length - 1 - i]; c.beginPath(); c.ellipse(x, y - 4 + i * 1.6, 184 - i * 2, 26 - i * 3, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#1B2432'; c.fillRect(x - 176, y - 6, 352, 12);
  for (let k = -16; k <= 16; k++) {
    const wx = x + k * 10.5, wy = y - 3 + Math.abs(k) * 0.1;
    c.fillStyle = Math.abs(k) > 13 ? '#B45309' : '#FDE68A'; c.fillRect(Math.round(wx - 3), Math.round(wy), 6, 7);
  }
  // the underside: teal, darker toward its bottom, the stalk's collar
  for (const [r, col] of [[160, INK], [158, '#0D4F5D'], [130, '#083B47'], [90, '#052A33']] as const) {
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y + 12, r, r * 0.22, 0, 0, Math.PI); c.fill();
  }
  c.fillStyle = '#A3B1C4'; c.fillRect(x - 22, y + 30, 44, 8); c.fillStyle = INK; c.fillRect(x - 22, y + 38, 44, 2);
};
/** The stalk: down from the saucer to the Earth, tapering, banded, lost in the atmosphere. */
const stalk = (c: Ctx, limb: number) => {
  const { x, y } = SAUCER, top = y + 40, bot = 620;
  const at = (yy: number) => 16 - ((yy - top) / (bot - top)) * 9;
  for (let yy = top; yy < bot; yy += 4) {
    const w = at(yy);
    c.fillStyle = INK; c.fillRect(Math.round(x - w - 1), yy, Math.round(w * 2 + 2), 4);
    c.fillStyle = '#A3B1C4'; c.fillRect(Math.round(x - w), yy, Math.round(w * 0.7), 4);
    c.fillStyle = '#4A5A70'; c.fillRect(Math.round(x - w * 0.3), yy, Math.round(w * 1.3), 4);
    if ((yy - top) % 40 === 0) { c.fillStyle = '#F07A2E'; c.fillRect(Math.round(x - w), yy, Math.round(w * 2), 2); }
  }
  // (the air near the limb hazing it out)
  for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(165, 216, 245, ${0.12 + k * 0.08})`; c.fillRect(x - 20, limb - 30 + k * 10, 40, 10); }
};
/** The hole the window was, blown out of the halo ring, jagged. */
const hole = (c: Ctx) => {
  c.fillStyle = INK; c.beginPath();
  c.moveTo(HOLE.x - 8, HOLE.y - 10); c.lineTo(HOLE.x - 2, HOLE.y - 14); c.lineTo(HOLE.x + 4, HOLE.y - 8); c.lineTo(HOLE.x + 7, HOLE.y + 4);
  c.lineTo(HOLE.x + 2, HOLE.y + 12); c.lineTo(HOLE.x - 6, HOLE.y + 9); c.lineTo(HOLE.x - 10, HOLE.y); c.closePath(); c.fill();
  c.fillStyle = '#FDE68A'; c.fillRect(HOLE.x - 5, HOLE.y - 4, 4, 5);
};
/** The air and the junk going out of the hole, `jet` how hard (0..1), `t` frames into it. */
const jetOut = (c: Ctx, t: number, jet: number) => {
  if (jet <= 0) return;
  for (let k = 0; k < 28; k++) {
    const a = (t * 1.1 + k * 6.3) % 64, sp = 3.4 + hash(k) * 2.4;
    const x = HOLE.x + a * sp, y = HOLE.y + (hash(k + 5) - 0.5) * a * 1.4 - a * 0.25;
    const r = 3 + a * 0.22;
    // (the air's puffs thin out in steps, not a smooth fade; a lit cap on each)
    const left = (1 - a / 64) * jet, q = left > 0.66 ? 0.5 : left > 0.33 ? 0.32 : 0.15;
    c.fillStyle = `rgba(226, 232, 240, ${q})`;
    c.beginPath(); c.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(255, 255, 255, ${(q * 0.8).toFixed(2)})`;
    c.beginPath(); c.arc(Math.round(x - r * 0.3), Math.round(y - r * 0.3), r * 0.5, 0, Math.PI * 2); c.fill();
  }
  // (the junk: brochures, a hot dog, somebody's hat, the gift cart's ice cream)
  const JUNK = ['#F8FAFC', '#D2551A', '#CDD6E2', '#7E22CE', '#FDE68A', '#16A34A'];
  for (let k = 0; k < 14; k++) {
    const u = t - k * 5;
    if (u <= 0) continue;
    const x = HOLE.x + u * (2.6 + hash(k + 9) * 2), y = HOLE.y + (hash(k + 2) - 0.5) * u * 1.2;
    if (x > 900) continue;
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(u * 0.12 * (k % 2 ? 1 : -1));
    c.fillStyle = INK; c.fillRect(-4, -3, 8, 6); c.fillStyle = JUNK[k % JUNK.length]; c.fillRect(-3, -2, 6, 4);
    c.restore();
  }
};
/** The passengers going out of the hole, tumbling, spreading, going away. */
const peopleOut = (c: Ctx, state: GameState, t: number) => {
  outGuests.forEach((g, i) => {
    const u = t - 6 - i * 9;
    if (u <= 0) return;
    const x = HOLE.x + u * (1.7 + (i % 3) * 0.7), y = HOLE.y + ((i % 5) - 2) * u * 0.45 - u * 0.15;
    if (x > 900 || y < -60 || y > 660) return;
    const s = 0.3 * Math.max(0.35, 1 - u / 500);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(u * 0.07 * (i % 2 ? 1 : -1)); c.scale(s * (i % 2 ? 1 : -1), s); c.translate(0, 40);
    g.who.draw(c, state.frame + g.seed, false);
    c.restore();
  });
};

/**
 * The outside shot, `t` frames in: the stars, the sun and the Earth; the needle's saucer on its stalk with the hole in
 * it, the air and the junk jetting out, the passengers; and him (`him`: his pose; left out: not drawn).
 */
export const drawExterior = (c: Ctx, state: GameState, t: number, him?: (c: Ctx) => void) => {
  const L = 480;
  drawOrbitBack(c, state, t * 0.3, L);
  stalk(c, L);
  stamp(c, 'n2-saucer', SAUCER.x - 200, SAUCER.y - 160, 400, 210, paintSaucer);
  hole(c);
  jetOut(c, t, 1 - smoothstep(120, 320, t));
  peopleOut(c, state, t);
  him?.(c);
};
/** Him coming out of the hole and tumbling toward the camera (the first CLOSE frames of either version). */
const tumbleOut = (state: GameState, t: number, suit: boolean) => (c: Ctx) => {
  const k = smoothstep(4, CLOSE, t);
  drawPuppet(c, state, { x: HOLE.x + 10 + (420 - HOLE.x) * k, y: HOLE.y + (330 - HOLE.y) * k, rot: t * 0.16, s: 0.3 + k * 0.9, face: suit ? 'shock' : 'scream', suit });
};
/** A white flash on a cut. */
const flash = (c: Ctx, t: number, at: number) => {
  const u = t - at;
  if (u < 0 || u > 6) return;
  c.fillStyle = `rgba(255, 255, 255, ${(0.8 * (1 - u / 6)).toFixed(3)})`; c.fillRect(0, 0, 800, 600);
};

/** The kill cam (no suit), t frames into his death. */
export const drawDecompCam = (c: Ctx, state: GameState, t: number) => {
  if (t < CLOSE) { drawExterior(c, state, t, tumbleOut(state, t, false)); return; }
  const u = t - CLOSE;
  // in close: just him, the stars, the Earth far below
  drawOrbitBack(c, state, 200 + u * 0.25, 540);
  const away = smoothstep(200, 300, u);
  const bloat = 1 + smoothstep(30, 120, u) * 0.38;
  const s = 2.3 * (1 - away * 0.94);
  const x = 400 + Math.sin(u * 0.02) * 20 + away * 30, y = 280 + away * 250;
  const face: DeathFace = u < 30 ? 'scream' : u < 130 ? 'agony' : 'frozen';
  // (coming in: the burn round him, a streak back the way he came)
  const burn = smoothstep(220, 290, u) * (1 - smoothstep(296, 300, u));
  if (burn > 0) {
    for (let k = 0; k < 6; k++) { c.fillStyle = `rgba(253, ${180 - k * 20}, ${80 - k * 10}, ${(0.18 * burn).toFixed(3)})`; c.beginPath(); c.arc(x - k * 6, y - k * 14, Math.max(2, 30 * s + 10 - k * 3), 0, Math.PI * 2); c.fill(); }
  }
  if (u < 298) drawPuppet(c, state, { x, y, rot: 0.6 + u * (u < 130 ? 0.03 : 0.008), s, bloat, face, eyes: smoothstep(40, 110, u), turds: Math.min(6, Math.max(0, (u - 66) / 12)), frost: smoothstep(120, 160, u) });
  if (burn > 0) { c.fillStyle = `rgba(255, 250, 220, ${(0.7 * burn).toFixed(3)})`; c.beginPath(); c.arc(x, y, Math.max(2, 6 + 18 * s), 0, Math.PI * 2); c.fill(); }
  // (and that's him: a twinkle down there on the limb)
  if (u >= 296 && u < 320) { const q = (u - 296) / 24; c.fillStyle = `rgba(255, 255, 255, ${(1 - q).toFixed(3)})`; c.fillRect(x - 12 * (1 - q), y - 1, 24 * (1 - q), 2); c.fillRect(x - 1, y - 12 * (1 - q), 2, 24 * (1 - q)); }
  flash(c, t, CLOSE);
};

/** The way out with the suit on, t frames in: out of the hole, tumbling, then in close, steadying, floating there fine,
 *  the frozen passengers drifting past. */
export const drawFloat = (c: Ctx, state: GameState, t: number) => {
  if (t < CLOSE) { drawExterior(c, state, t, tumbleOut(state, t, true)); return; }
  const u = t - CLOSE;
  drawOrbitBack(c, state, 200 + u * 0.25, 540);
  // (the passengers drifting past behind him, stiff)
  outGuests.slice(0, 5).forEach((g, i) => {
    const x = 900 - ((u * (0.9 + i * 0.25) + i * 170) % 1100), y = 120 + i * 80 + Math.sin(u * 0.01 + i) * 10;
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(u * 0.01 * (i % 2 ? 1 : -1) + i); c.scale(0.7 * (i % 2 ? 1 : -1), 0.7); c.translate(0, 40);
    g.who.draw(c, 0, false);
    c.restore();
  });
  const steady = smoothstep(0, 90, u);
  const rot = (1 - steady) * (CLOSE * 0.16 + u * 0.05) % (Math.PI * 2) * (1 - steady) + Math.sin(u * 0.03) * 0.08;
  drawPuppet(c, state, { x: 400, y: 300 + Math.sin(u * 0.025) * 8, rot, s: 2.1, face: 'shock', suit: true });
  flash(c, t, CLOSE);
};
