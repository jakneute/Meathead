// Spooky Land's critters (the real ones: bats, crows, rats, a mangy cat) and the clock tower's wooden figures (the
// cuckoo, the bell-ringer), drawn the way the jungle's animals are: an ink line round every part, each material in
// steps, fur ticked in, glints in the eyes; frames for what they're doing (flapping, running, winding up, attacking),
// hurt (eyes screwed shut) and dead (crossed out, tongue out). Each frame's painted once into a stamp.
// Facing right, from a point at the feet.

import type { Enemy } from '../../m1/types';
import { stamp } from '../../m1/game/render/stamp';
import { INK, dk, lt, part, partTop, flat, px, dither, limb, ball, moodOf, reaction, type Mood } from './costume';

/** Held, flung or a body: it struggles (the frames it has for going flat out). */
const struggling = (e: Enemy) => { const r = reaction(e); return !!r && r.pose !== 'limp' && r.pose !== 'stun'; };

type Ctx = CanvasRenderingContext2D;

const put = (c: Ctx, key: string, box: [number, number, number, number], paint: (g: Ctx) => void) => stamp(c, `spkc-${key}`, box[0], box[1], box[2], box[3], paint);

/** Fur ticked in over a box: short strokes, a step darker and a step lighter. */
const tickFur = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const s = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = s - Math.floor(s), s2 = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = s2 - Math.floor(s2);
    px(g, x + k * w, y + k2 * h, 1, 2, k2 < 0.5 ? dk(col, 0.3) : lt(col, 0.22));
  }
};
const eyeGlint = (g: Ctx, x: number, y: number, r: number, col: string, md: Mood) => {
  if (md === 'dead') { g.strokeStyle = INK; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x + r, y + r); g.moveTo(x + r, y - r); g.lineTo(x - r, y + r); g.stroke(); return; }
  if (md === 'hurt') { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x - r, y - r); g.lineTo(x + r, y); g.lineTo(x - r, y + r); g.stroke(); return; }
  ball(g, x, y, r, col, 0.7); px(g, x - r * 0.5, y - r * 0.6, 1, 1, '#FFFFFF');
};
const tongue = (g: Ctx, x: number, y: number) => { flat(g, () => g.ellipse(x, y + 2, 1.4, 2.4, 0.2, 0, Math.PI * 2), '#E87A90', 0.7); };

// ---------------------------------------------------------------------------------------------------------------
// The bat: fur body, big ears, membrane wings on finger bones, scalloped; red eyes, fangs

const paintBat = (g: Ctx, fr: number, swoop: boolean, md: Mood) => {
  const FUR = '#45333A', WING = '#2E2229';
  const lift = swoop ? 0 : [-14, -5, 5, -5][fr];
  for (const s of [-1, 1]) {
    const col = s < 0 ? dk(WING, 0.15) : WING;
    const sh = [s * 4, -12], el = swoop ? [s * 12 - 6, -20] : [s * 13, -14 + lift * 0.5], tip = swoop ? [s * 18 - 14, -24] : [s * 30, -10 + lift];
    const wing = () => { g.moveTo(sh[0], sh[1]); g.lineTo(el[0], el[1]); g.lineTo(tip[0], tip[1]); g.quadraticCurveTo(tip[0] - s * 3, tip[1] + 6, tip[0] - s * 7, tip[1] + 7); g.quadraticCurveTo(tip[0] - s * 10, tip[1] + 4, tip[0] - s * 14, tip[1] + 8); g.quadraticCurveTo(el[0] - s * 2, -4, s * 3, -6); g.closePath(); };
    part(g, wing, col, Math.min(sh[0], tip[0]) - 2, Math.min(el[1], tip[1]) - 2, Math.abs(tip[0] - sh[0]) + 4, 22, 1.1);
    g.strokeStyle = lt(col, 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(el[0], el[1]); g.lineTo(tip[0] - s * 7, tip[1] + 6); g.moveTo(el[0], el[1]); g.lineTo(tip[0] - s * 14, tip[1] + 7); g.stroke();
    limb(g, sh[0], sh[1], el[0], el[1], 2, lt(col, 0.15)); limb(g, el[0], el[1], tip[0], tip[1], 1.6, lt(col, 0.15));
  }
  part(g, () => g.ellipse(0, -10, 6.5, 7.5, 0, 0, Math.PI * 2), FUR, -6.5, -17.5, 13, 15);
  tickFur(g, -5, -15, 10, 10, FUR, 10, 3);
  // (the head: ears, the snout, red eyes, the fangs)
  for (const s of [-1, 1]) { part(g, () => { g.moveTo(s * 2, -17); g.lineTo(s * 6, -26); g.lineTo(s * 7, -15); g.closePath(); }, FUR, s < 0 ? -7 : 2, -26, 5, 11, 1); flat(g, () => { g.moveTo(s * 3.5, -17); g.lineTo(s * 5.5, -23); g.lineTo(s * 6, -17); g.closePath(); }, '#B07484', 0); }
  part(g, () => g.ellipse(1, -16, 5.5, 4.5, 0, 0, Math.PI * 2), FUR, -4.5, -20.5, 11, 9, 1);
  eyeGlint(g, -1, -17, 1.3, '#EF4444', md); eyeGlint(g, 3.5, -17, 1.3, '#EF4444', md);
  px(g, 4, -15, 2, 1.5, '#6B4A52');
  px(g, -0.5, -12.5, 1, 2.5, '#F5F5F4'); px(g, 2.5, -12.5, 1, 2.5, '#F5F5F4');
  if (md === 'dead') tongue(g, 1.5, -12);
  // (the feet, tucked)
  px(g, -3, -3, 2, 2, '#1E1418'); px(g, 1, -3, 2, 2, '#1E1418');
};
export const drawBatArt = (c: Ctx, e: Enemy, f: number, size = 1) => {
  const md = moodOf(e), swoop = !struggling(e) && (e.aiState === 'swoop' || e.aiState === 'dive');
  const fr = Math.floor((f + (e.initialX ?? e.homeX ?? 0)) / 4) % 4;
  c.save(); if (size !== 1) c.scale(size, size);
  put(c, `bat-${swoop ? 's' : fr}-${md}`, [-36, -30, 72, 34], g => paintBat(g, fr, swoop, md));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The crow: glossy black (a blue sheen), a horn beak; perched (bobbing), cawing (beak wide, head out), flying

const paintCrow = (g: Ctx, pose: 'sit' | 'caw' | 'fly', fr: number, md: Mood) => {
  const B = '#1E1F2A', SHEEN = '#3C4A78', BEAK = '#8E8462';
  const sat = pose !== 'fly';
  if (sat) for (const lx of [-3, 3]) { limb(g, lx, -7, lx, -1, 1.6, '#3F3A33'); px(g, lx - 2, -1, 5, 1, '#3F3A33'); }
  // (the tail)
  part(g, () => { g.moveTo(-9, -14); g.lineTo(-23, -18 + (sat ? 4 : 0)); g.lineTo(-24, -12 + (sat ? 6 : 0)); g.lineTo(-9, -8); g.closePath(); }, dk(B, 0.1), -24, -18, 15, 12, 1);
  part(g, () => g.ellipse(-1, -13, 12, 7, sat ? -0.15 : 0, 0, Math.PI * 2), B, -13, -20, 24, 14);
  px(g, -6, -18, 8, 1, SHEEN); px(g, -3, -17, 6, 1, lt(SHEEN, 0.2));
  // (the head: out further cawing)
  const hx = pose === 'caw' ? 12 : 9, hy = pose === 'caw' ? -18 : -20;
  part(g, () => g.arc(hx, hy, 6, 0, Math.PI * 2), B, hx - 6, hy - 6, 12, 12);
  px(g, hx - 3, hy - 5, 4, 1, SHEEN);
  const open = pose === 'caw' || md === 'hurt';
  flat(g, () => { g.moveTo(hx + 4, hy - 2.5); g.lineTo(hx + 14, hy + (open ? -2 : 0)); g.lineTo(hx + 4, hy + 0.5); g.closePath(); }, BEAK, 1);
  flat(g, () => { g.moveTo(hx + 4, hy + 0.5); g.lineTo(hx + 12, hy + (open ? 5 : 1)); g.lineTo(hx + 4, hy + 2); g.closePath(); }, dk(BEAK, 0.2), 1);
  if (open) px(g, hx + 5, hy + 0.5, 4, 1, '#7F1D1D');
  eyeGlint(g, hx + 1.5, hy - 1.5, 1.3, '#E8C76A', md);
  if (md === 'dead') tongue(g, hx + 7, hy + 2);
  // (the wing: folded, or out flapping)
  if (sat) {
    part(g, () => { g.moveTo(-9, -17); g.quadraticCurveTo(2, -20, 8, -14); g.lineTo(-4, -8); g.lineTo(-14, -11); g.closePath(); }, dk(B, 0.05), -14, -20, 22, 12, 1);
    for (let k = 0; k < 3; k++) px(g, -10 + k * 4, -11 + (k % 2), 3, 1, SHEEN);
    if (pose === 'caw') for (let k = 0; k < 3; k++) flat(g, () => { const x = -6 + k * 5; g.moveTo(x, -19); g.lineTo(x + 1, -23); g.lineTo(x + 3, -19); g.closePath(); }, B, 0.7);
  } else {
    const up = [-22, -8, 6, -8][fr];
    part(g, () => { g.moveTo(-6, -15); g.lineTo(2, -15); g.lineTo(-2 + up * 0.2, -15 + up); g.lineTo(-10 + up * 0.15, -14 + up * 0.85); g.closePath(); }, dk(B, 0.05), -12, Math.min(-15, -15 + up), 16, Math.abs(up) + 4, 1);
    for (let k = 0; k < 3; k++) px(g, -8 + k * 3, -15 + up * (0.4 + k * 0.15), 1, 3, SHEEN);
  }
};
export const drawCrowArt = (c: Ctx, e: Enemy, f: number) => {
  const md = moodOf(e);
  const sat = !struggling(e) && (e.aiState === 'idle' || e.aiState === 'caw' || !e.aiState);
  const pose = sat && e.aiState === 'caw' ? 'caw' : sat ? 'sit' : 'fly';
  const fr = pose === 'fly' ? Math.floor(f / 3) % 4 : 0;
  // (perched: a bob of the head now and then, a step up and down)
  const bob = pose === 'sit' && Math.floor((f + (e.initialX ?? 0)) / 30) % 3 === 0 ? -1 : 0;
  c.save(); c.translate(0, bob);
  put(c, `crow-${pose}-${fr}-${md}`, [-28, -40, 58, 42], g => paintCrow(g, pose, fr, md));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The rat: gray-brown, ticked, pink ears and feet and the tail, whiskers, a red eye; scurrying, rushing (stretched)

const paintRat = (g: Ctx, fr: number, rush: boolean, md: Mood) => {
  const FUR = '#6E6660', PINK = '#E9A6B4';
  const st = rush ? 1.15 : 1;
  g.lineCap = 'round';
  for (const [col, w] of [[INK, 3.6], [PINK, 2], [lt(PINK, 0.3), 0.8]] as [string, number][]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(-12 * st, -6); g.quadraticCurveTo(-24, -2 + [0, 2, 0, -2][fr], -32, -6 + [1, -1, 1, -1][fr]); g.stroke(); }
  g.lineCap = 'butt';
  const legs = [[-8, 2], [-4, -2], [5, -2], [9, 2]];
  for (let i = 0; i < 4; i++) { const sw = [2, -2][(i + fr) % 2] * (rush ? 1.6 : 1); flat(g, () => g.ellipse(legs[i][0] * st + sw, -1.2, 2.4, 1.3, 0, 0, Math.PI * 2), i % 2 ? PINK : dk(PINK, 0.2), 0.7); }
  part(g, () => g.ellipse(-1, -7, 13 * st, 6.2, 0, 0, Math.PI * 2), FUR, -14 * st, -13, 26 * st, 12.4);
  tickFur(g, -12 * st, -12, 22 * st, 8, FUR, 18, 5);
  dither(g, -8, -4, 14, 2, lt(FUR, 0.3));
  // (the head: the snout to a pink nose, the ear, the red eye, whiskers)
  const hx = 11 * st;
  part(g, () => { g.moveTo(hx - 5, -12); g.quadraticCurveTo(hx + 4, -11, hx + 10, -6); g.lineTo(hx + 9, -4); g.quadraticCurveTo(hx + 2, -2, hx - 5, -3); g.closePath(); }, FUR, hx - 5, -12, 15, 10);
  ball(g, hx + 10, -5.5, 1.6, PINK, 0.7);
  part(g, () => g.ellipse(hx - 2, -12, 3.2, 3.6, 0, 0, Math.PI * 2), PINK, hx - 5.2, -15.6, 6.4, 7.2, 1);
  eyeGlint(g, hx + 2.5, -8.5, 1.2, '#DC2626', md);
  g.strokeStyle = '#D6D3D1'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(hx + 8, -5); g.lineTo(hx + 14, -7); g.moveTo(hx + 8, -4.5); g.lineTo(hx + 14, -3); g.stroke();
  px(g, hx + 7, -3, 1, 2, '#F5F5F4');
  if (md === 'dead') tongue(g, hx + 8, -3);
};
export const drawRatArt = (c: Ctx, e: Enemy, f: number) => {
  const md = moodOf(e), wild = struggling(e), rush = e.aiState === 'rush' || wild;
  const fr = Math.abs(e.vel.x) > 0.3 || wild ? Math.floor(f / (rush ? 2 : 4)) % 4 : 0;
  put(c, `rat-${rush ? 1 : 0}-${fr}-${md}`, [-36, -18, 72, 20], g => paintRat(g, fr, rush, md));
};

// ---------------------------------------------------------------------------------------------------------------
// The cat: black, mangy (bald patches), yellow eyes; prowling, arched hissing (fur up, the tail bushed), pouncing

const paintCat = (g: Ctx, pose: 'walk' | 'hiss' | 'pounce', fr: number, md: Mood) => {
  const FUR = '#1F1D26', BALD = '#6E5F63';
  const arch = pose === 'hiss', leap = pose === 'pounce';
  // (legs: four, stepping; tucked back and out leaping)
  const lx = [-12, -6, 6, 12];
  for (let i = 0; i < 4; i++) {
    const sw = pose === 'walk' ? [2, -2][(i + fr) % 2] : 0, back = i < 2;
    const top = leap ? -14 : arch ? -16 : -10;
    const foot = leap ? (back ? [lx[i] - 10, -6] : [lx[i] + 10, -10]) : [lx[i] + sw + (back ? -1 : 1), 0];
    const knee = [(lx[i] + foot[0]) / 2 + (back ? -2.5 : 1.5), (top + foot[1]) / 2];
    const col = i % 2 ? FUR : dk(FUR, 0.2);
    limb(g, lx[i], top, knee[0], knee[1], 3.2, col); limb(g, knee[0], knee[1], foot[0], foot[1] - 1, 2, col);
    flat(g, () => g.ellipse(foot[0] + 1, foot[1] - 1, 2.2, 1.2, 0, 0, Math.PI * 2), col, 0.8);
  }
  // (the tail: straight up and bushed out hissing; out behind otherwise)
  if (arch) {
    // (bushed out: a fat tail, straight up, its fur standing in tufts)
    part(g, () => { g.moveTo(-15, -18); g.quadraticCurveTo(-20, -30, -18, -44); for (let k = 0; k <= 6; k++) { const y = -44 + k * 4.4; g.lineTo(-18 + (k % 2 ? -3.5 : 0) + k * 0.2, y); } for (let k = 6; k >= 0; k--) { const y = -44 + k * 4.4; g.lineTo(-12 + (k % 2 ? 3.5 : 0) + k * 0.4, y + 2); } g.lineTo(-9, -18); g.closePath(); }, FUR, -22, -46, 16, 30, 1);
  }
  else limb(g, -14, -14, -26, leap ? -18 : -22 + [0, 1, 0, -1][fr], 3, FUR);
  const body = arch ? () => { g.moveTo(-15, -14); g.quadraticCurveTo(-12, -32, -2, -32); g.quadraticCurveTo(10, -32, 13, -14); g.closePath(); } : () => g.ellipse(-1, leap ? -16 : -13, leap ? 17 : 15, 6, leap ? -0.1 : 0, 0, Math.PI * 2);
  part(g, body, FUR, -16, arch ? -32 : -20, 32, arch ? 18 : 13);
  if (arch) for (let k = 0; k < 6; k++) flat(g, () => { const x = -11 + k * 4; g.moveTo(x, -30 + Math.abs(k - 2.5) * 0.8); g.lineTo(x + 1.5, -35 + Math.abs(k - 2.5)); g.lineTo(x + 3, -30 + Math.abs(k - 2.5) * 0.8); g.closePath(); }, FUR, 0.7);
  // (mangy: bald patches, a step lighter)
  dither(g, -7, arch ? -27 : -17, 5, 4, BALD); dither(g, 3, arch ? -22 : -14, 4, 3, BALD, 1);
  // (the head: ears, yellow eyes slit, the mouth open hissing, its fangs)
  const hx = leap ? 17 : 14, hy = arch ? -22 : leap ? -21 : -19;
  for (const ex of [hx - 4, hx + 2]) part(g, () => { g.moveTo(ex - 2, hy - 4); g.lineTo(ex, hy - 11); g.lineTo(ex + 3, hy - 4); g.closePath(); }, FUR, ex - 2, hy - 11, 5, 7, 1);
  part(g, () => g.ellipse(hx, hy, 7, 6, 0, 0, Math.PI * 2), FUR, hx - 7, hy - 6, 14, 12);
  for (const ex of [hx - 1, hx + 4]) { if (md !== 'ok') eyeGlint(g, ex, hy - 1, 1.4, '#FACC15', md); else { ball(g, ex, hy - 1, 1.7, '#FACC15', 0.6); px(g, ex - 0.3, hy - 2.5, 0.8, 3, INK); } }
  if (arch || leap || md === 'hurt') { flat(g, () => g.ellipse(hx + 4, hy + 3, 2.6, 1.8, 0, 0, Math.PI * 2), '#7F1D1D', 0.8); px(g, hx + 2.5, hy + 1.5, 1, 2, '#FFFFFF'); px(g, hx + 5, hy + 1.5, 1, 2, '#FFFFFF'); }
  if (md === 'dead') tongue(g, hx + 4, hy + 2);
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(hx + 6, hy + 1); g.lineTo(hx + 12, hy); g.moveTo(hx + 6, hy + 2); g.lineTo(hx + 12, hy + 3); g.stroke();
};
export const drawCatArt = (c: Ctx, e: Enemy, f: number) => {
  const md = moodOf(e);
  const pose = struggling(e) || e.aiState === 'pounce' ? 'pounce' : e.aiState === 'hiss' ? 'hiss' : 'walk';
  const fr = pose === 'walk' && Math.abs(e.vel.x) > 0.3 ? Math.floor(f / 5) % 4 : 0;
  // (hissing: a shiver)
  const shake = pose === 'hiss' && f % 4 < 2 ? 1 : 0;
  c.save(); c.translate(shake, 0);
  put(c, `cat-${pose}-${fr}-${md}`, [-30, -46, 62, 48], g => paintCat(g, pose, fr, md));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The cuckoo: a carved wooden bird out of its clock, painted, on its spring

/** `out`: how far out of its door it is on its spring (px; the door's middle that far back behind it): the spring's
 *  drawn from there to the bird, as long as that and no longer (none sat home in its door, none flying). */
const paintCuckoo = (g: Ctx, out: number, fr: number, md: Mood) => {
  const WOOD = '#9A5B2A', PAINT = '#E9D9B0';
  if (out >= 2) {
    const n = Math.max(2, Math.round(out / 3));
    g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); for (let i = 0; i <= n; i++) g.lineTo(-out + (out * i) / n, -11 + (i % 2 ? 3 : -3)); g.stroke(); g.strokeStyle = '#B8BCC6'; g.lineWidth = 1.2; g.stroke();
  }
  part(g, () => { g.moveTo(-10, -9); g.lineTo(-18, -4); g.lineTo(-17, -1); g.lineTo(-8, -5); g.closePath(); }, dk(WOOD, 0.15), -18, -9, 10, 8, 1);
  part(g, () => g.ellipse(0, -11, 11, 7, 0, 0, Math.PI * 2), WOOD, -11, -18, 22, 14);
  // (the painted breast: cream chevrons)
  for (let k = 0; k < 3; k++) { g.strokeStyle = PAINT; g.lineWidth = 1; g.beginPath(); g.moveTo(1 + k * 2.5, -12 + k * 2); g.lineTo(4 + k * 2.5, -9 + k * 2); g.lineTo(7 + k * 2.5, -12 + k * 2); g.stroke(); }
  part(g, () => g.arc(8, -15, 5, 0, Math.PI * 2), WOOD, 3, -20, 10, 10);
  flat(g, () => { g.moveTo(12, -17); g.lineTo(19, -15 + (md !== 'ok' ? -1 : 0)); g.lineTo(12, -13); g.closePath(); }, '#F59E0B', 1);
  if (md === 'ok') { ball(g, 9, -16, 1.8, '#FAFAFA', 0.7); px(g, 9.5, -16.5, 1, 1.4, INK); } else eyeGlint(g, 9, -16, 1.4, '#FAFAFA', md);
  // (the wing: a carved flap)
  const up = [-6, 2, 4, 2][fr];
  part(g, () => { g.moveTo(-7, -13); g.lineTo(5, -12 + up * 0.5); g.lineTo(-3, -18 + up); g.closePath(); }, lt(WOOD, 0.08), -7, -18, 12, 8, 1);
  // (the grain, and the peg it's turned on)
  px(g, -6, -8, 8, 1, dk(WOOD, 0.25)); ball(g, -2, -11, 1, '#C9A227', 0.5);
};
export const drawCuckooArt = (c: Ctx, e: Enemy, f: number) => {
  const md = moodOf(e), flying = e.aiState === 'dart' || e.aiState === 'back' || struggling(e);
  const fr = flying ? Math.floor(f / 3) % 4 : 2;
  // (on its spring only while it's popping out of the door: alive, not grabbed, as far out as it is)
  const out = e.aiState === 'pop' && e.health > 0 && !struggling(e) ? Math.min(28, Math.round(Math.abs(e.pos.x - (e.homeX ?? e.pos.x)) / 2) * 2) : 0;
  put(c, `cuckoo-${out}-${fr}-${md}`, [-40, -24, 62, 26], g => paintCuckoo(g, out, fr, md));
};

// ---------------------------------------------------------------------------------------------------------------
// The bell-ringer: a big wooden clockwork figure on its track (the carriage, stiff legs, a blue coat with brass
// buttons, a painted face and rosy cheeks, a tall red hat), the key in its back turning, the hammer ratcheting up

const paintRinger = (g: Ctx, step: number, a: number, key: number, smash: boolean) => {
  const WOOD = '#9A4A1C', COAT = '#2549B8', GOLD = '#C99A2E', FACE = '#F2CFA6';
  // (the carriage on its track, its wheels)
  part(g, () => g.rect(-24, -10, 48, 10), '#4A4540', -24, -10, 48, 10, 1.4);
  for (const wx of [-15, 15]) { ball(g, wx, -2, 4, '#27272A', 1); px(g, wx - 0.5, -4, 1, 4, '#71717A'); }
  for (const s of [-1, 1]) part(g, () => g.rect(s * 8 - 5 + s * step, -40, 10, 31), WOOD, s * 8 - 5 + s * step, -40, 10, 31, 1.2);
  // (the coat: a trapezoid, brass buttons down the front, gold piping)
  part(g, () => { g.moveTo(-22, -38); g.lineTo(22, -38); g.lineTo(18, -92); g.lineTo(-18, -92); g.closePath(); }, COAT, -22, -92, 44, 54, 1.4);
  px(g, -2, -90, 4, 50, GOLD); for (let y = -86; y < -44; y += 10) ball(g, 0, y, 2, '#FDE68A', 0.7);
  px(g, -21, -42, 42, 2, GOLD);
  // (the head: painted on, rosy cheeks, the joint at the jaw; the hat)
  part(g, () => g.roundRect(-13, -116, 26, 24, 3), FACE, -13, -116, 26, 24, 1.4);
  px(g, -13, -97, 26, 1, dk(FACE, 0.3));
  ball(g, -4, -106, 1.8, INK, 0); ball(g, 5, -106, 1.8, INK, 0); px(g, -4.5, -107, 1, 1, '#FFFFFF'); px(g, 4.5, -107, 1, 1, '#FFFFFF');
  dither(g, -11, -103, 5, 3, '#E86A6A'); dither(g, 7, -103, 5, 3, '#E86A6A');
  px(g, -4, smash ? -96 : -98, 9, smash ? 3 : 2, '#7F1D1D');
  part(g, () => g.rect(-16, -124, 32, 6), '#8F1D1D', -16, -124, 32, 6, 1.2);
  partTop(g, () => g.rect(-11, -142, 22, 18), '#8F1D1D', -11, -142, 22, 18, 1.2);
  px(g, -11, -129, 22, 3, GOLD);
  // (the key in its back, turning)
  part(g, () => g.rect(-28, -72, 6, 4), GOLD, -28, -72, 6, 4, 1);
  part(g, () => g.roundRect(-36, -78 - key / 2, 10, 14 + key, 3), GOLD, -36, -78 - key / 2, 10, 14 + key, 1);
  // (the hammer: carried, wound up over its head, brought down in front)
  g.save(); g.translate(12, -80); g.rotate(a);
  limb(g, 0, 0, 56, 0, 6, '#7C4A1E');
  part(g, () => g.rect(52, -17, 24, 34), '#5E5A58', 52, -17, 24, 34, 1.4);
  px(g, 52, -17, 24, 3, '#A8A29E'); px(g, 52, 14, 24, 3, '#3F3B39');
  g.restore();
  part(g, () => g.rect(7, -86, 11, 11), WOOD, 7, -86, 11, 11, 1.2);
};
export const drawRingerArt = (c: Ctx, e: Enemy, f: number) => {
  const st = e.aiState, moving = Math.abs(e.vel.x) > 0.2;
  const step = moving ? [2, 0, -2, 0][Math.floor(f / 8) % 4] : 0;
  const t = Math.min(1, (e.aiTimer || 0) / 46);
  const q = st === 'raise' ? Math.round(t * 6) : 0;
  const a = st === 'raise' ? -0.4 - (q / 6) * 2.4 : st === 'strike' ? 0.9 : st === 'recover' ? 0.8 : -0.2;
  const key = [-6, -2, 3, 6, 3, -2][Math.floor(f / 6) % 6];
  put(c, `ringer-${step}-${st === 'raise' ? q : st === 'strike' ? 's' : st === 'recover' ? 'r' : 'i'}-${key}`, [-84, -176, 176, 180], g => paintRinger(g, step, a, key, st === 'strike'));
};
