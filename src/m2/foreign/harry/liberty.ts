// THE STATUE OF LIBERTY, drawn in full (the land boss's companion): risen out of the AMERICA pavilion's dig behind the
// arena, only her head and upper body in the shot (the berm hides the rest), huge. Copper gone green (the patina's
// stepped ramp), the seven-rayed crown with its row of windows (Harry stands in the middle one), the classical face
// (blank statue eyes, the long nose, the strong chin) that moves more than a statue's should: stern, straining at her
// stuck arm, disgusted, gagging, puking her concrete guts, sad, sobbing. The stola's folds over her left shoulder, her
// tablet (JULY IV / MDCCLXXVI) in her left arm (screen right). Her right arm (the torch arm, screen left) is drawn on
// its own (drawArm): a two-bone arm from her shoulder to wherever her fist is (raised with the torch over her head off
// the top of the shot, rearing back, down on the floor and stuck there), the torch held upright in it, the gold flame.
// And the end: the statue-sized revolver (patina green: hers), the blown-out head (hollow concrete, rebar: no gore),
// the topple, the rubble.
//
// World space: LIB's spots (arena.ts) are where she is risen; `dy` sinks her, `tilt` topples her about her base.

import { LIB, sy, ARENA_L, ARENA_R } from './arena';
import { signText } from '../../signLetters';
import { dith } from '../heli/harryArt';
import { stamp } from '../../../m1/game/render/stamp';
import { gooDrip, gooRun, ageOf, PUKE_GOO, CONC_GOO } from './goo';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A1F1B';
/** The patina: deepest shadow .. highlight. */
export const PAT = ['#0B2E28', '#134A40', '#1E6B5C', '#2E8A78', '#4FAE98', '#86D1BD', '#C4EDE2'];
const GOLD = ['#7C4A03', '#B7791F', '#D69E2E', '#F6E05E', '#FEFCBF'];
const CONC = ['#292524', '#44403C', '#57534E', '#78716C', '#A8A29E', '#D6D3D1'];
const PUKE = ['#3F6212', '#65A30D', '#84CC16', '#BEF264'];

export type Face = 'stern' | 'strain' | 'disgust' | 'gag' | 'puke' | 'sad' | 'sob' | 'dread';
export interface Stain { x: number; y: number; r: number }
export interface LibLook {
  f: number;
  /** Sunk this far into the dig (world px), toppled this far (radians, + to the left), shaking this much (px). */
  dy: number; tilt: number; shake: number;
  face: Face;
  /** Harry's puke on her (from her head's middle). */
  stains: Stain[];
  /** A concrete tear down her cheek (0..1). */
  tear: number;
  /** Shot: the side of her head blown out (frames since). */
  broken: number;
  /** Her left hand (world, risen: dy's added): on the tablet, or up at her temple with the gun. */
  hand: { x: number; y: number };
  tablet: boolean; gun: boolean;
  /** Who's in the crown (drawn clipped to its middle window), if anybody. */
  crown?: (c: Ctx) => void;
  /** How worn she is by her smashes (0 whole .. 1 about to go; past 1 while she crumbles): cracks, chips, flaking. */
  wear?: number;
}

const fl = (c: Ctx, col: string, path: () => void, line = 2) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); if (line > 0) { c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); } };
const r = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A dithered strip (the seam between two of her patina's steps). */
const dr = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = dith(c, col); c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A seam between two of her copper sheets: a dark line, its lit lip, rivets along it (each a dark dot with a glint). */
const seam = (c: Ctx, pts: [number, number][], every = 14) => {
  c.strokeStyle = PAT[1]; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  c.strokeStyle = PAT[5]; c.lineWidth = 1; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x + 1, y + 1.5) : c.moveTo(x + 1, y + 1.5))); c.stroke();
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / every));
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; r(c, x - 1.5, y - 4, 3, 3, PAT[0]); r(c, x - 1.5, y - 4, 1, 1, PAT[6]); }
  }
};
/** Verdigris run down her copper from a fold or a seam: a pale dithered streak, a brighter head. */
const run = (c: Ctx, x: number, y: number, len: number) => { dr(c, x, y, 3, len, PAT[5]); r(c, x, y, 3, 3, PAT[5]); dr(c, x + 1, y + len, 1, len * 0.3, PAT[5]); };

/** Her base (the pivot she topples about, far under the berm). */
const BASE = { x: LIB.x, y: sy(900) };

/** Into her frame: sunk, toppled, shaking. */
const frame = (c: Ctx, L: LibLook) => {
  const jx = L.shake ? Math.sin(L.f * 1.7) * L.shake : 0, jy = L.shake ? Math.cos(L.f * 2.3) * L.shake * 0.5 : 0;
  c.translate(jx, L.dy + jy);
  if (L.tilt) { c.translate(BASE.x, BASE.y); c.rotate(-L.tilt); c.translate(-BASE.x, -BASE.y); }
};

// ---------------------------------------------------------------------------------------------------------------
// The body: shoulders, the stola, the neck, the left arm and tablet (or the gun), the head, the crown

const robe = (c: Ctx, f: number) => {
  const x = LIB.x, top = sy(318);
  // (the shoulders and chest: one great mass of drapery, out to past her shoulders, down under the berm)
  fl(c, PAT[3], () => { c.moveTo(x - 300, sy(560)); c.lineTo(x - 290, top + 40); c.quadraticCurveTo(x - 270, top - 6, x - 200, top - 10); c.lineTo(x + 200, top - 10); c.quadraticCurveTo(x + 270, top - 6, x + 290, top + 40); c.lineTo(x + 300, sy(560)); c.closePath(); }, 3);
  // (the shade down her right side, the lit left)
  c.save(); c.beginPath(); c.moveTo(x - 300, sy(560)); c.lineTo(x - 290, top + 40); c.quadraticCurveTo(x - 270, top - 6, x - 200, top - 10); c.lineTo(x + 200, top - 10); c.quadraticCurveTo(x + 270, top - 6, x + 290, top + 40); c.lineTo(x + 300, sy(560)); c.closePath(); c.clip();
  r(c, x - 300, top - 20, 70, 300, PAT[2]); r(c, x - 300, top - 20, 30, 300, PAT[1]);
  dr(c, x - 230, top - 20, 8, 300, PAT[2]); dr(c, x - 270, top - 20, 6, 300, PAT[1]);
  r(c, x + 220, top - 20, 80, 300, PAT[4]); dr(c, x + 212, top - 20, 8, 300, PAT[4]); r(c, x + 262, top - 20, 40, 300, PAT[5]); dr(c, x + 254, top - 20, 8, 300, PAT[5]);
  // (the stola: a sash of heavier cloth from her left shoulder across her chest to her right hip, its folds)
  fl(c, PAT[4], () => { c.moveTo(x + 150, top - 10); c.lineTo(x + 230, top - 4); c.lineTo(x - 120, sy(560)); c.lineTo(x - 250, sy(560)); c.closePath(); }, 2.5);
  for (let k = 0; k < 6; k++) {
    const t = k / 6, ax = x + 165 + t * 50, bx = x - 235 + t * 110;
    c.strokeStyle = PAT[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, top - 6); c.lineTo(bx, sy(560)); c.stroke();
    c.strokeStyle = PAT[5]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ax + 5, top - 6); c.lineTo(bx + 5, sy(560)); c.stroke();
  }
  // (the robe's own folds under it: long, falling straight, stepped)
  for (let k = 0; k < 9; k++) {
    const fx = x - 200 + k * 50 + Math.sin(k * 1.7) * 10;
    r(c, fx, top + 30 + (k % 3) * 14, 4, 260, PAT[2]); r(c, fx + 4, top + 30 + (k % 3) * 14, 2, 260, PAT[5]);
  }
  // (her copper sheets' seams across her, riveted; the verdigris run down from them and the folds)
  seam(c, [[x - 296, top + 120], [x - 150, top + 104], [x, top + 112], [x + 150, top + 100], [x + 296, top + 116]], 22);
  seam(c, [[x - 90, top + 26], [x - 96, top + 120]], 16); seam(c, [[x + 110, top + 20], [x + 118, top + 100]], 16);
  for (const [rx, ry, l] of [[-260, 60, 70], [-180, 126, 50], [-60, 116, 80], [40, 124, 60], [130, 108, 70], [240, 70, 90], [-20, 30, 40]] as const) run(c, x + rx, top + ry, l);
  // (the neckline: the robe gathered round the base of her neck)
  fl(c, PAT[3], () => { c.moveTo(x - 70, top - 10); c.quadraticCurveTo(x, top + 26, x + 70, top - 10); c.lineTo(x + 56, top - 16); c.quadraticCurveTo(x, top + 12, x - 56, top - 16); c.closePath(); }, 2);
  c.restore();
  void f;
};

/** Her hair: heavy waves either side of the face, down onto her neck. */
const hair = (c: Ctx, hx: number, hy: number) => {
  for (const s of [-1, 1]) {
    fl(c, PAT[2], () => { c.moveTo(hx + s * 40, hy - 64); c.quadraticCurveTo(hx + s * 86, hy - 40, hx + s * 80, hy + 10); c.quadraticCurveTo(hx + s * 88, hy + 50, hx + s * 64, hy + 84); c.lineTo(hx + s * 44, hy + 70); c.quadraticCurveTo(hx + s * 58, hy + 20, hx + s * 46, hy - 20); c.closePath(); }, 2.5);
    // (stepped: the far side of the lock in shade, a dithered seam; its outer edge lit (her left) or dark (her right))
    c.save(); c.beginPath(); c.moveTo(hx + s * 40, hy - 64); c.quadraticCurveTo(hx + s * 86, hy - 40, hx + s * 80, hy + 10); c.quadraticCurveTo(hx + s * 88, hy + 50, hx + s * 64, hy + 84); c.lineTo(hx + s * 44, hy + 70); c.quadraticCurveTo(hx + s * 58, hy + 20, hx + s * 46, hy - 20); c.closePath(); c.clip();
    const ox = s < 0 ? hx - 92 : hx + 72;
    r(c, ox, hy - 70, 20, 160, s < 0 ? PAT[1] : PAT[4]); dr(c, s < 0 ? ox + 20 : ox - 6, hy - 70, 6, 160, s < 0 ? PAT[1] : PAT[4]);
    c.restore();
    // (the waves: stepped bands)
    for (let k = 0; k < 6; k++) {
      const yy = hy - 44 + k * 22, xx = hx + s * (66 + Math.sin(k * 1.4) * 6);
      c.strokeStyle = s < 0 ? PAT[1] : PAT[4]; c.lineWidth = 3;
      c.beginPath(); c.moveTo(xx - s * 14, yy); c.quadraticCurveTo(xx, yy + 8, xx + s * 10, yy - 2); c.stroke();
      c.strokeStyle = PAT[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(xx - s * 12, yy - 3); c.quadraticCurveTo(xx, yy + 4, xx + s * 8, yy - 5); c.stroke();
    }
  }
};

const face = (c: Ctx, L: LibLook, hx: number, hy: number) => {
  const f = L.f, m = L.face;
  // (the neck: a column, shaded down its right)
  fl(c, PAT[3], () => { c.moveTo(hx - 40, hy + 50); c.lineTo(hx - 44, sy(330)); c.lineTo(hx + 44, sy(330)); c.lineTo(hx + 40, hy + 50); c.closePath(); }, 2.5);
  r(c, hx - 42, hy + 60, 14, 80, PAT[2]); r(c, hx + 26, hy + 60, 10, 80, PAT[4]);
  // (her jaw's shadow down the neck under it)
  r(c, hx - 38, hy + 66, 76, 8, PAT[2]); dr(c, hx - 38, hy + 74, 76, 6, PAT[2]);
  // (the face: an oval, the far side shaded, the cheekbones lit)
  const puffed = m === 'gag' ? 1 : 0;
  fl(c, PAT[3], () => c.ellipse(hx, hy + 6, 54 + puffed * 6, 72, 0, 0, Math.PI * 2), 3);
  c.save(); c.beginPath(); c.ellipse(hx, hy + 6, 54 + puffed * 6, 72, 0, 0, Math.PI * 2); c.clip();
  r(c, hx - 60, hy - 70, 16, 150, PAT[2]); r(c, hx - 60, hy - 70, 7, 150, PAT[1]);
  dr(c, hx - 44, hy - 70, 6, 150, PAT[2]); dr(c, hx - 53, hy - 70, 4, 150, PAT[1]);
  r(c, hx + 30, hy - 40, 16, 70, PAT[4]); r(c, hx + 38, hy - 20, 8, 30, PAT[5]); dr(c, hx + 24, hy - 40, 6, 70, PAT[4]); dr(c, hx + 34, hy - 20, 4, 30, PAT[5]);
  r(c, hx - 50, hy + 60, 100, 20, PAT[2]); dr(c, hx - 50, hy + 54, 100, 6, PAT[2]);
  // (the brow's ridge lit, the sockets in shade under it, the cheeks' planes)
  r(c, hx - 36, hy - 34, 72, 3, PAT[4]); dr(c, hx - 36, hy - 21, 72, 6, PAT[2]);
  dr(c, hx - 40, hy + 14, 22, 18, PAT[4]); dr(c, hx + 18, hy + 14, 20, 18, PAT[2]);
  // (the sockets: deep under the brow, the shade stepped in; the nose's bridge lit between them)
  for (const s of [-1, 1]) { r(c, hx + s * 22 - 16, hy - 20, 32, 5, s < 0 ? PAT[2] : PAT[1]); dr(c, hx + s * 22 - 16, hy - 15, 32, 3, s < 0 ? PAT[2] : PAT[1]); }
  r(c, hx - 3, hy - 22, 6, 8, PAT[4]); r(c, hx - 1, hy - 22, 2, 6, PAT[5]);
  // (the planes down from the nose's wings to the mouth's corners, the shade under the lower lip, the chin's cleft)
  dr(c, hx - 24, hy + 22, 5, 18, PAT[2]); r(c, hx + 18, hy + 22, 5, 18, PAT[2]); dr(c, hx + 23, hy + 22, 3, 18, PAT[2]);
  r(c, hx - 12, hy + 54, 24, 3, PAT[2]); dr(c, hx - 12, hy + 57, 24, 3, PAT[2]); r(c, hx - 1, hy + 62, 2, 6, PAT[2]);
  // (the verdigris run down her face from under the band: pale streaks, the old ones fainter)
  for (const [ox, oy, l] of [[-14, -30, 14], [30, -26, 20], [-44, -4, 34], [40, 20, 28]] as const) { dr(c, hx + ox, hy + oy, 2, l, PAT[5]); r(c, hx + ox, hy + oy, 2, 2, PAT[5]); }
  c.restore();
  // (the gag: her cheeks blown out round)
  if (puffed) for (const s of [-1, 1]) { fl(c, PAT[4], () => c.ellipse(hx + s * 34, hy + 38, 20, 16, 0, 0, Math.PI * 2), 2); r(c, hx + s * 34 - 6, hy + 30, 8, 4, PAT[5]); }
  // (the brows: by her mood)
  const brow = (s: number, inner: number, outer: number) => {
    c.strokeStyle = INK; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(hx + s * 8, hy - 24 + inner); c.quadraticCurveTo(hx + s * 22, hy - 30 + (inner + outer) / 2, hx + s * 38, hy - 22 + outer); c.stroke();
    c.strokeStyle = PAT[5]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + s * 10, hy - 28 + inner); c.quadraticCurveTo(hx + s * 22, hy - 34 + (inner + outer) / 2, hx + s * 36, hy - 26 + outer); c.stroke();
  };
  const B: Record<Face, [number, number]> = { stern: [3, 0], strain: [8, -4], disgust: [6, 2], gag: [6, -2], puke: [-6, -2], sad: [-9, 4], sob: [-11, 5], dread: [-8, 3] };
  const [bi, bo] = B[m];
  brow(-1, bi + (m === 'disgust' ? -10 : 0), bo + (m === 'disgust' ? -6 : 0)); brow(1, bi, bo);
  // (the eyes: blank, almond, heavy lids; squeezed shut gagging, puking and at the end)
  for (const s of [-1, 1]) {
    const ex = hx + s * 22, ey = hy - 10;
    if (m === 'gag' || m === 'puke' || m === 'dread' || m === 'strain') {
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 12, ey + (m === 'strain' ? 0 : 2)); c.quadraticCurveTo(ex, ey - 4, ex + 12, ey + (m === 'strain' ? 0 : 2)); c.stroke();
      continue;
    }
    fl(c, PAT[5], () => { c.moveTo(ex - 14, ey); c.quadraticCurveTo(ex, ey - 10, ex + 14, ey); c.quadraticCurveTo(ex, ey + 8, ex - 14, ey); c.closePath(); }, 2);
    // (the heavy upper lid, lower for sad)
    const lid = m === 'sad' || m === 'sob' ? 5 : 2;
    fl(c, PAT[2], () => { c.moveTo(ex - 14, ey); c.quadraticCurveTo(ex, ey - 10, ex + 14, ey); c.quadraticCurveTo(ex, ey - 10 + lid * 1.6, ex - 14, ey); c.closePath(); }, 1.5);
    r(c, ex - 4, ey - 1, 5, 3, PAT[6]);
    // (the lid's crease over it, the lower lid's edge under it)
    c.strokeStyle = PAT[1]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ex - 13, ey - 4); c.quadraticCurveTo(ex, ey - 14, ex + 13, ey - 4); c.stroke();
    c.strokeStyle = PAT[2]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ex - 11, ey + 4); c.quadraticCurveTo(ex, ey + 9, ex + 11, ey + 4); c.stroke();
  }
  // (the nose: long and straight, its lit side and its shadow)
  fl(c, PAT[4], () => { c.moveTo(hx - 3, hy - 16); c.lineTo(hx - 9, hy + 22); c.quadraticCurveTo(hx, hy + 28, hx + 9, hy + 22); c.lineTo(hx + 3, hy - 16); c.closePath(); }, 2);
  r(c, hx - 7, hy + 4, 4, 16, PAT[2]); r(c, hx + 2, hy - 10, 3, 26, PAT[5]);
  // (its wings and nostrils, the shade under it, the groove down to the lip)
  for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(hx + s * 10, hy + 16); c.quadraticCurveTo(hx + s * 13, hy + 22, hx + s * 6, hy + 25); c.stroke(); r(c, hx + s * 5 - 2, hy + 23, 4, 2, PAT[0]); }
  dr(c, hx - 9, hy + 27, 18, 3, PAT[1]); r(c, hx - 2, hy + 30, 4, 8, PAT[2]); r(c, hx - 2, hy + 30, 1, 8, PAT[4]);
  if (m === 'disgust') { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 12, hy + 8); c.lineTo(hx - 6, hy + 4); c.moveTo(hx + 12, hy + 8); c.lineTo(hx + 6, hy + 4); c.stroke(); }
  // (the mouth: by her mood)
  const my = hy + 44;
  if (m === 'puke') {
    fl(c, '#0B1512', () => c.ellipse(hx, my + 4, 22, 18, 0, 0, Math.PI * 2), 3);
    // (her concrete welling up in it, heaving, lumpy; slopping out over her lip and down her chin in gloopy drips)
    const G = CONC_GOO, R = G.R, heave = Math.sin(L.f * 0.18) * 2;
    c.save(); c.beginPath(); c.ellipse(hx, my + 4, 21, 17, 0, 0, Math.PI * 2); c.clip();
    const surf = () => { c.beginPath(); c.moveTo(hx - 24, my + 30); for (let i = 0; i <= 8; i++) { const x = hx - 24 + i * 6; c.lineTo(x, my - 6 + heave + Math.sin(i * 1.9 + L.f * 0.12) * 2.5); } c.lineTo(hx + 24, my + 30); c.closePath(); };
    surf(); c.fillStyle = R[3]; c.fill();
    c.translate(0, 3); surf(); c.fillStyle = R[2]; c.fill(); c.translate(0, 5); surf(); c.fillStyle = dith(c, R[1]) as unknown as string; c.fill();
    c.restore();
    for (const [ox, oy] of [[-10, -1], [6, 1], [-2, 6], [12, 7]] as const) { r(c, hx + ox, my + oy + heave, 3, 2, G.bits[(ox + 20) % 5]); r(c, hx + ox, my + oy + heave + 2, 3, 1, G.ink); }
    // (over the lip: a tongue of it, inked, lit, to the stream)
    fl(c, R[2], () => { c.moveTo(hx - 17, my + 10); c.quadraticCurveTo(hx - 20, my + 26, hx - 12, my + 30); c.lineTo(hx + 12, my + 30); c.quadraticCurveTo(hx + 20, my + 26, hx + 17, my + 10); c.closePath(); }, 2);
    r(c, hx - 15, my + 12, 4, 14, R[3]); r(c, hx - 14, my + 13, 1, 6, R[4]); dr(c, hx + 8, my + 12, 6, 16, R[1]);
    // (drips off the corners of her mouth, stretching and snapping)
    gooDrip(c, hx - 19, my + 16, 26, 6, G, (L.f / 130) % 1);
    gooDrip(c, hx + 18, my + 14, 20, 5, G, (L.f / 105 + 0.45) % 1);
  } else if (m === 'strain') {
    fl(c, PAT[1], () => c.rect(hx - 20, my - 5, 40, 11), 2.5);
    r(c, hx - 18, my - 4, 36, 4, PAT[6]); r(c, hx - 18, my + 2, 36, 3, PAT[5]);
    for (let k = -2; k <= 2; k++) r(c, hx + k * 7, my - 4, 1, 9, INK);
  } else if (m === 'gag') {
    c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.moveTo(hx - 12, my); c.lineTo(hx + 12, my); c.stroke();
  } else if (m === 'sob') {
    const w = 3 + Math.sin(f * 0.6) * 2;
    fl(c, '#0B1512', () => { c.moveTo(hx - 18, my + 6); c.quadraticCurveTo(hx, my - 8 - w, hx + 18, my + 6); c.quadraticCurveTo(hx, my + 2, hx - 18, my + 6); c.closePath(); }, 2.5);
  } else {
    // (the lips: full; the corners down for sad, disgust and dread, a set line for stern)
    const dn = m === 'sad' || m === 'dread' ? 6 : m === 'disgust' ? 4 : 0;
    fl(c, PAT[2], () => { c.moveTo(hx - 20, my + dn); c.quadraticCurveTo(hx - 8, my - 6, hx, my - 3); c.quadraticCurveTo(hx + 8, my - 6, hx + 20, my + dn + (m === 'disgust' ? -6 : 0)); c.quadraticCurveTo(hx, my + 10, hx - 20, my + dn); c.closePath(); }, 2);
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 18, my + dn); c.quadraticCurveTo(hx, my + 1, hx + 18, my + dn + (m === 'disgust' ? -6 : 0)); c.stroke();
    r(c, hx - 6, my + 4, 12, 2, PAT[4]);
  }
  // (the chin's lit knob)
  r(c, hx - 8, hy + 66, 16, 4, PAT[4]);
  // (a concrete tear)
  if (L.tear > 0) {
    const ty = hy - 2 + L.tear * 50;
    fl(c, CONC[4], () => c.ellipse(hx - 26, ty, 4, 6, 0, 0, Math.PI * 2), 1.5);
    r(c, hx - 27, hy - 2, 2, ty - hy - 2, CONC[3]);
  }
};

// The crown, laid out round her head (the user: "the statue of liberty is missing some detail in the crown area"): the
// diadem a deep band wrapped round her brow (seen from the front: an arch, its ends turning away round the sides of her
// head, foreshortened), its row of 25 windows (the middle one the room Harry stands in), the crown's dark inside showing
// over its top between the rays, and the seven rays socketed into its top edge (no gap: they grow out of it), each a
// faceted spike: a lit face and a shadow face either side of its ridge.
/** The band's half width, how far round her head it's seen (radians), its top and bottom edges over her head's middle
 *  at the front and at its ends. */
const BAND = { rx: 92, th: 1.25, top: 86, topEnd: 58, bot: 33, botEnd: 12 };
const bandS = (u: number) => (1 - Math.cos(u * BAND.th)) / (1 - Math.cos(BAND.th));
/** Along the band (u -1 .. 1, left end to right end): its x, its top and bottom edges. */
const bandAt = (hx: number, hy: number, u: number) => {
  const s = bandS(u);
  return { x: hx + BAND.rx * Math.sin(u * BAND.th), t: hy - BAND.top + (BAND.top - BAND.topEnd) * s, b: hy - BAND.bot + (BAND.bot - BAND.botEnd) * s };
};
/** The band's u at screen x (the front half). */
const bandU = (hx: number, x: number) => Math.asin(Math.max(-1, Math.min(1, (x - hx) / BAND.rx))) / BAND.th;
/** The middle window (the room in her crown: Harry's; arena.ts's WINDOW). */
const WIN = (hx: number, hy: number) => ({ x0: hx - 28, x1: hx + 28, y0: hy - 78, y1: hy - 38 });

/** One ray: from its socket on the band's top edge (bx, by) out along `a` (0 straight up), `len` long, `w` its half
 *  width at the socket; `stub` (shot): broken off that far along, jagged, the concrete backing in the break. */
const ray = (c: Ctx, bx: number, by: number, a: number, len: number, w: number, stub = 0) => {
  const dx = Math.sin(a), dy = -Math.cos(a), nx = Math.cos(a), ny = Math.sin(a);
  // (which face the light's on (from the upper left): +n or -n)
  const lit = -0.6 * nx - 0.8 * ny > 0 ? 1 : -1;
  const L = stub || len, tx = bx + dx * L, ty = by + dy * L;
  // (a stub's end: the break across it, jagged; else the point)
  const tipW = stub ? w * (1 - stub / len) : 0;
  const end: [number, number][] = stub
    ? [-1, -0.5, -0.1, 0.35, 0.7, 1].map((k, i) => [tx + nx * tipW * k + dx * (i % 2 ? 5 : -3), ty + ny * tipW * k + dy * (i % 2 ? 5 : -3)])
    : [[tx, ty]];
  const outline = () => { c.moveTo(bx - nx * w, by - ny * w); end.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(bx + nx * w, by + ny * w); c.closePath(); };
  /** A sliver of one face: between k0 and k1 of its half width (0 the ridge .. 1 its edge), on side s. */
  const face = (s: number, k0: number, k1: number, col: string | CanvasPattern) => {
    c.beginPath();
    c.moveTo(bx + nx * w * k0 * s, by + ny * w * k0 * s); c.lineTo(tx + nx * tipW * k0 * s, ty + ny * tipW * k0 * s);
    c.lineTo(tx + nx * tipW * k1 * s, ty + ny * tipW * k1 * s); c.lineTo(bx + nx * w * k1 * s, by + ny * w * k1 * s);
    c.closePath(); c.fillStyle = col; c.fill();
  };
  fl(c, PAT[3], outline, 0);
  c.save(); c.beginPath(); outline(); c.clip();
  // (the lit face: the ridge's edge brightest, stepping down out to its edge; the shadow face: dark, its edge darker)
  face(lit, 0, 1.1, PAT[4]); face(lit, 0, 0.32, PAT[5]); face(lit, 0.32, 0.46, dith(c, PAT[5])); face(lit, 0.8, 1.1, dith(c, PAT[3]));
  face(-lit, 0, 1.1, PAT[2]); face(-lit, 0.55, 1.1, dith(c, PAT[1])); face(-lit, 0.78, 1.1, PAT[1]);
  // (the verdigris run down its shadow face from its point, pale; shade down by the socket where the band's over it)
  c.fillStyle = dith(c, PAT[5]); c.beginPath(); c.moveTo(bx + nx * w * -lit * 0.3 + dx * L * 0.15, by + ny * w * -lit * 0.3 + dy * L * 0.15);
  c.lineTo(bx + nx * w * -lit * 0.42 + dx * L * 0.15, by + ny * w * -lit * 0.42 + dy * L * 0.15); c.lineTo(tx + dx * -L * 0.25, ty + dy * -L * 0.25); c.closePath(); c.fill();
  c.fillStyle = dith(c, PAT[1]); c.fillRect(bx - w - 2, by - 12, w * 2 + 4, 14);
  c.restore();
  // (the ridge: a hard glint on its lit side, the crease dark)
  c.strokeStyle = PAT[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by); c.lineTo(stub ? tx : tx, stub ? ty : ty); c.stroke();
  c.strokeStyle = PAT[6]; c.lineWidth = 1; c.beginPath(); c.moveTo(bx + nx * lit * 1.5 + dx * 10, by + ny * lit * 1.5 + dy * 10); c.lineTo(bx + dx * L * 0.92 + nx * lit * 0.5, by + dy * L * 0.92 + ny * lit * 0.5); c.stroke();
  // (the break: the copper's lip, the concrete backing in it)
  if (stub) {
    c.strokeStyle = CONC[2]; c.lineWidth = 4; c.lineJoin = 'miter'; c.beginPath(); end.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.strokeStyle = CONC[4]; c.lineWidth = 1.5; c.beginPath(); end.forEach(([x, y], i) => (i ? c.lineTo(x - dx * 1.5, y - dy * 1.5) : c.moveTo(x - dx * 1.5, y - dy * 1.5))); c.stroke();
  }
  // (inked)
  c.beginPath(); outline(); c.strokeStyle = INK; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke();
  // (its socket on the band: a riveted collar)
  const cw = w + 3;
  fl(c, PAT[3], () => { c.moveTo(bx - nx * cw, by - ny * cw); c.lineTo(bx - nx * cw + dx * 9, by - ny * cw + dy * 9); c.lineTo(bx + nx * cw + dx * 9, by + ny * cw + dy * 9); c.lineTo(bx + nx * cw, by + ny * cw); c.closePath(); }, 2);
  c.strokeStyle = PAT[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(bx - nx * cw + dx * 8, by - ny * cw + dy * 8); c.lineTo(bx + nx * cw + dx * 8, by + ny * cw + dy * 8); c.stroke();
  for (const k of [-0.6, 0, 0.6]) { const x = bx + nx * cw * k + dx * 4, y = by + ny * cw * k + dy * 4; r(c, x - 1.5, y - 1.5, 3, 3, PAT[0]); r(c, x - 1.5, y - 1.5, 1, 1, PAT[6]); }
};

/** The forehead's hair: parted in the middle under the band, swept out to her temples in heavy waves. */
const foreLocks = (c: Ctx, hx: number, hy: number) => {
  for (const s of [-1, 1]) {
    const lock = () => { c.moveTo(hx, hy - 38); c.quadraticCurveTo(hx + s * 30, hy - 44, hx + s * 50, hy - 34); c.quadraticCurveTo(hx + s * 64, hy - 20, hx + s * 58, hy + 4); c.lineTo(hx + s * 48, hy - 4); c.quadraticCurveTo(hx + s * 46, hy - 24, hx + s * 26, hy - 30); c.quadraticCurveTo(hx + s * 10, hy - 33, hx, hy - 38); c.closePath(); };
    fl(c, s < 0 ? PAT[2] : PAT[3], lock, 2);
    c.save(); c.beginPath(); lock(); c.clip();
    // (stepped: lit along the top of each wave, shaded under)
    for (let k = 0; k < 3; k++) {
      const yy = hy - 30 + k * 11, xx = hx + s * (40 + k * 6);
      c.strokeStyle = s < 0 ? PAT[1] : PAT[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(xx - s * 16, yy - 2); c.quadraticCurveTo(xx, yy + 6, xx + s * 14, yy); c.stroke();
      c.strokeStyle = s < 0 ? PAT[4] : PAT[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(xx - s * 14, yy - 5); c.quadraticCurveTo(xx, yy + 2, xx + s * 12, yy - 3); c.stroke();
    }
    c.restore();
  }
};

/** The crown's still parts (painted once: a stamp): its dark inside over the band, the rays in their sockets, the band
 *  and its windows (all but the middle one), the hair under it. `broken`: the rays on the shot side snapped off. */
const crownStill = (c: Ctx, hx: number, hy: number, broken: boolean) => {
  const N = 24, at = (u: number) => bandAt(hx, hy, u);
  // (the crown's inside, dark, seen over the band's top edge: its far rim)
  fl(c, PAT[1], () => {
    for (let i = 0; i <= N; i++) { const u = -1 + (2 * i) / N, p = at(u); const y = p.t - 12 + 8 * bandS(u); if (i) c.lineTo(p.x, y); else c.moveTo(p.x, y); }
    for (let i = N; i >= 0; i--) { const p = at(-1 + (2 * i) / N); c.lineTo(p.x, p.t + 4); }
    c.closePath();
  }, 2);
  for (let i = 0; i < N; i++) { const u = -1 + (2 * i + 1) / N, p = at(u); dr(c, p.x - 4, p.t - 8 + 8 * bandS(u), 8, 4, PAT[0]); }
  // (the rays: the outer ones first, the middle one over them all)
  for (const deg of [-72, 72, -48, 48, -24, 24, 0]) {
    const a = (deg * Math.PI) / 180, u = bandU(hx, hx + BAND.rx * 0.8 * Math.sin(a)), p = at(u);
    const len = 170 - Math.abs(deg) * 0.42, w = 13 - Math.abs(deg) * 0.03;
    ray(c, p.x, p.t + 4, a * 1.08, len, w, broken && deg <= -24 ? 30 + (deg + 72) * 0.5 : 0);
  }
  // (the band: its front face in steps (lit to the upper left, turning away into shade at its ends), its top lip lit,
  // its bottom rim a moulding)
  const band = () => {
    for (let i = 0; i <= N; i++) { const p = at(-1 + (2 * i) / N); if (i) c.lineTo(p.x, p.t); else c.moveTo(p.x, p.t); }
    for (let i = N; i >= 0; i--) { const p = at(-1 + (2 * i) / N); c.lineTo(p.x, p.b); }
    c.closePath();
  };
  fl(c, PAT[3], band, 3);
  c.save(); c.beginPath(); band(); c.clip();
  const strip = (u0: number, u1: number, col: string | CanvasPattern) => { const p0 = at(u0), p1 = at(u1); c.fillStyle = col; c.fillRect(Math.round(p0.x), hy - 120, Math.round(p1.x - p0.x), 140); };
  strip(-1, -0.7, PAT[4]); strip(-0.7, -0.62, dith(c, PAT[4])); strip(0.45, 0.55, dith(c, PAT[2])); strip(0.55, 0.86, PAT[2]); strip(0.86, 0.92, dith(c, PAT[1])); strip(0.92, 1, PAT[1]);
  // (the top lip, lit; the moulding along the bottom: a groove, a lit bead, its underside dark)
  for (let i = 0; i < N; i++) {
    const u0 = -1 + (2 * i) / N, u1 = u0 + 2 / N, p = at(u0), q = at(u1), lit = u0 < 0.5;
    c.strokeStyle = lit ? PAT[5] : PAT[4]; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x, p.t + 2); c.lineTo(q.x, q.t + 2); c.stroke();
    c.strokeStyle = PAT[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.b - 9); c.lineTo(q.x, q.b - 9); c.stroke();
    c.strokeStyle = lit ? PAT[5] : PAT[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.b - 6); c.lineTo(q.x, q.b - 6); c.stroke();
    c.strokeStyle = PAT[1]; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x, p.b - 1); c.lineTo(q.x, q.b - 1); c.stroke();
  }
  // (the windows: 12 a side of the middle one (25 in all), little, foreshortened round her head; a couple lit up from
  // the room inside)
  const W = WIN(hx, hy), uIn = bandU(hx, W.x1 + 6), PER = 12;
  for (const s of [-1, 1]) for (let k = 0; k < PER; k++) {
    const u0 = uIn + ((1 - uIn - 0.04) * k) / PER, u1 = uIn + ((1 - uIn - 0.04) * (k + 1)) / PER;
    const p0 = at(s * u0), p1 = at(s * u1), x0 = Math.min(p0.x, p1.x), ww = Math.abs(p1.x - p0.x);
    const mt = (p0.t + p1.t) / 2, mb = (p0.b + p1.b) / 2, top = Math.round(mt + (mb - mt) * 0.34), bot = Math.round(mt + (mb - mt) * 0.6), wx = x0 + ww * 0.14, w = Math.max(1, ww * 0.72);
    const lit = (s < 0 && k === 3) || (s > 0 && k === 6);
    r(c, wx - 1, top - 2, w + 2, 1, PAT[1]);
    r(c, wx, top, w, bot - top, lit ? '#B7791F' : '#0B1512');
    if (lit) { r(c, wx, top, w, (bot - top) * 0.5, '#F6E05E'); dr(c, wx, top + (bot - top) * 0.5, w, 2, '#F6E05E'); }
    else r(c, wx, top, Math.max(1, w * 0.4), 2, '#1E3A36');
    r(c, wx - 1, bot, w + 2, 1, s < 0 || k < 2 ? PAT[5] : PAT[4]);
    // (the pier between it and the next: a lit edge)
    if (s < 0 && ww > 3) r(c, wx + w, top, 1, bot - top, PAT[2]);
  }
  // (rivets along the top lip, the verdigris run down the band from them)
  for (let i = 1; i < N; i += 2) { const p = at(-1 + (2 * i) / N); r(c, p.x - 1.5, p.t + 5, 3, 3, PAT[0]); r(c, p.x - 1.5, p.t + 5, 1, 1, PAT[6]); }
  for (const u of [-0.82, -0.5, 0.6, 0.86]) { const p = at(u); run(c, p.x, p.t + 9, p.b - p.t - 16); }
  // (shot: cracks across the band on the broken side)
  if (broken) {
    c.strokeStyle = INK; c.lineWidth = 2; c.lineJoin = 'miter';
    for (const u of [-0.75, -0.45]) { const p = at(u); c.beginPath(); c.moveTo(p.x - 4, p.t); c.lineTo(p.x + 3, p.t + 14); c.lineTo(p.x - 2, p.t + 24); c.lineTo(p.x + 4, p.b); c.stroke(); }
  }
  c.restore();
  // (its shadow on her forehead and down the hair under it)
  for (let i = 0; i < N; i++) { const u = -1 + (2 * i + 1) / N, p = at(u), w = (BAND.rx * 2 * Math.PI * Math.cos(u * BAND.th) * BAND.th) / (N * Math.PI) + 2; if (Math.abs(p.x - hx) < 58) dr(c, p.x - w / 2, p.b + 1, w, 4, PAT[1]); }
  // (the middle window's frame: a deep reveal round it, lit along its top)
  const F = { x0: W.x0 - 5, y0: W.y0 - 5, w: W.x1 - W.x0 + 10, h: W.y1 - W.y0 + 9 };
  fl(c, PAT[2], () => c.roundRect(F.x0, F.y0, F.w, F.h, 13), 2.5);
  r(c, F.x0 + 6, F.y0 + 1, F.w - 12, 2, PAT[5]); r(c, F.x0 + 1, F.y0 + 8, 2, F.h - 16, PAT[4]); r(c, F.x0 + F.w - 3, F.y0 + 8, 2, F.h - 16, PAT[1]);
};

/** The crown: the band of windows over her brow (the middle window a hole Harry stands in), and its seven rays. */
const crown = (c: Ctx, L: LibLook, hx: number, hy: number) => {
  const broken = L.broken > 0;
  // (the still parts painted once (a stamp: the band, its windows, the rays, the hair under it); the room live)
  stamp(c, `liberty-crown-${broken ? 'shot' : 'whole'}`, hx - 280, hy - 300, 560, 330, g => { foreLocks(g, hx, hy); crownStill(g, hx, hy, broken); });
  const W = WIN(hx, hy);
  fl(c, '#0B1512', () => c.roundRect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0, 10), 2.5);
  // (the light inside, from the room's other windows)
  r(c, W.x0 + 4, W.y0 + 4, W.x1 - W.x0 - 8, 6, '#183A34'); dr(c, W.x0 + 4, W.y0 + 10, W.x1 - W.x0 - 8, 6, '#183A34');
  // (the room's back wall: its iron ribs, the little windows across it letting the sky in)
  for (let k = 0; k < 4; k++) r(c, W.x0 + 8 + k * 13, W.y0 + 6, 2, W.y1 - W.y0 - 10, '#132E29');
  for (let k = 0; k < 3; k++) r(c, W.x0 + 12 + k * 13, W.y0 + 12, 5, 4, '#2E5A52');
  if (L.crown) { c.save(); c.beginPath(); c.roundRect(W.x0 + 2, W.y0 + 2, W.x1 - W.x0 - 4, W.y1 - W.y0 - 4, 9); c.clip(); L.crown(c); c.restore(); }
  // (the sill under it, lit)
  r(c, W.x0 - 2, W.y1 - 3, W.x1 - W.x0 + 4, 4, PAT[5]); r(c, W.x0 - 2, W.y1 + 1, W.x1 - W.x0 + 4, 2, PAT[1]);
  c.strokeStyle = PAT[6]; c.lineWidth = 1; c.beginPath(); c.roundRect(W.x0 + 1, W.y0 + 1, W.x1 - W.x0 - 2, W.y1 - W.y0 - 2, 9); c.stroke();
};

/** The tablet in her left arm: a great slab, tilted, its inscription. */
const tablet = (c: Ctx) => {
  c.save(); c.translate(LIB.x + 190, sy(392)); c.rotate(-0.22);
  fl(c, PAT[3], () => c.rect(-56, -96, 112, 196), 3);
  r(c, -56, -96, 112, 6, PAT[5]); r(c, -56, -96, 6, 196, PAT[4]); r(c, 46, -90, 10, 190, PAT[2]);
  dr(c, -50, -90, 6, 190, PAT[4]); dr(c, 40, -90, 6, 190, PAT[2]); r(c, -56, 94, 112, 6, PAT[1]);
  // (its carved border, bevelled: a groove, a lit lip; rivets at its corners; the verdigris run down it)
  c.strokeStyle = PAT[1]; c.lineWidth = 2; c.strokeRect(-46, -86, 92, 176); c.strokeStyle = PAT[5]; c.lineWidth = 1; c.strokeRect(-45, -85, 92, 176);
  for (const [x, y] of [[-48, -88], [44, -88], [-48, 86], [44, 86]] as const) { r(c, x, y, 4, 4, PAT[0]); r(c, x, y, 1.5, 1.5, PAT[6]); }
  run(c, -20, 2, 60); run(c, 24, -10, 44);
  signText(c, 'JULY IV', 0, -54, { sx: 2, sy: 3, fill: PAT[1], lip: PAT[5], serif: true, gap: 2 });
  signText(c, 'MDCCLXXVI', 0, -26, { sx: 2, sy: 3, fill: PAT[1], lip: PAT[5], serif: true, gap: 2 });
  c.restore();
};

/** The statue-sized revolver (hers: patina green too), at her hand, its barrel pointing `a`. */
const revolver = (c: Ctx, x: number, y: number, a: number, f: number, flash: boolean) => {
  c.save(); c.translate(x, y); c.rotate(a);
  // (the grip down out of her fist, the frame, the cylinder, the long barrel, the hammer back)
  fl(c, PAT[2], () => { c.moveTo(-30, 0); c.lineTo(-10, -4); c.lineTo(-18, 46); c.lineTo(-40, 42); c.closePath(); }, 2.5);
  fl(c, PAT[3], () => c.rect(-14, -24, 46, 26), 2.5);
  fl(c, PAT[4], () => c.roundRect(2, -30, 34, 34, 8), 2.5);
  for (let k = 0; k < 3; k++) r(c, 8 + k * 9, -24, 4, 22, PAT[2]);
  r(c, 4, -28, 4, 30, PAT[5]); dr(c, 28, -28, 6, 30, PAT[2]);
  fl(c, PAT[3], () => c.rect(32, -22, 100, 16), 2.5);
  r(c, 34, -20, 96, 4, PAT[5]); dr(c, 34, -12, 96, 4, PAT[2]); r(c, 34, -9, 96, 2, PAT[1]); fl(c, PAT[4], () => c.rect(118, -30, 10, 8), 2);
  // (the ejector rod under the barrel, the trigger and its guard, the grip's checkering and its rivet)
  fl(c, PAT[3], () => c.rect(34, -6, 54, 6), 2); r(c, 36, -5, 50, 1.5, PAT[5]);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-6, 2); c.quadraticCurveTo(6, 22, 16, 2); c.stroke(); c.strokeStyle = PAT[4]; c.lineWidth = 1.5; c.stroke();
  fl(c, PAT[2], () => { c.moveTo(2, 2); c.lineTo(6, 2); c.lineTo(4, 12); c.closePath(); }, 1.5);
  dr(c, -30, 8, 13, 26, PAT[1]); r(c, -26, 18, 5, 5, PAT[0]); r(c, -26, 18, 2, 2, PAT[6]);
  fl(c, PAT[2], () => { c.moveTo(-14, -24); c.lineTo(-24, -36); c.lineTo(-16, -38); c.lineTo(-6, -24); c.closePath(); }, 2);
  // (the flash: at the barrel's tip, pressed to her temple, blowing back out the near side round it)
  if (flash) for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#FDE047' : '#F97316'; c.beginPath(); c.arc(MUZZLE.x - i * 9, MUZZLE.y + (i % 2 ? 9 : -9), 24 - i * 5, 0, Math.PI * 2); c.fill(); }
  c.restore();
  void f;
};

/** The revolver's muzzle in its own frame (the barrel's tip, its middle), and how it's held to her head. */
const MUZZLE = { x: 132, y: -14 }, GUN_A = Math.PI + 0.08;
/** Her gun hand, reached for `hand` (her frame): where her left arm actually gets to (as drawn). */
const gunHand = (hand: Pt) => {
  const sh = LIB.shL, dx = hand.x - sh.x, dy = hand.y - sh.y, d = Math.min(LIB.upper + LIB.fore - 2, Math.hypot(dx, dy) || 1), base = Math.atan2(dy, dx);
  return { x: sh.x + Math.cos(base) * d, y: sh.y + Math.sin(base) * d };
};
/** Her head as drawn (her frame): its middle and radii. */
const HEAD_E = () => ({ x: LIB.head.x, y: LIB.head.y + 6, rx: 54, ry: 72 });
/**
 * The shot's line (her frame, as drawn for `hand`): the muzzle at her temple, the way it points, and where it comes out
 * of her head (the far side, on the line through it: the exit wound and the burst). Toppling, it all goes over with her.
 */
export const gunLine = (hand: Pt) => {
  const h = gunHand(hand), ox = h.x - 10, oy = h.y - 10, ca = Math.cos(GUN_A), sa = Math.sin(GUN_A);
  const m = { x: ox + MUZZLE.x * ca - MUZZLE.y * sa, y: oy + MUZZLE.x * sa + MUZZLE.y * ca }, d = { x: ca, y: sa };
  // (out the far side: the ray's far crossing of her head's outline)
  const E = HEAD_E(), px = (m.x - E.x) / E.rx, py = (m.y - E.y) / E.ry, qx = d.x / E.rx, qy = d.y / E.ry;
  const A = qx * qx + qy * qy, B = 2 * (px * qx + py * qy), C = px * px + py * py - 1, disc = B * B - 4 * A * C;
  const t = disc >= 0 ? (-B + Math.sqrt(disc)) / (2 * A) : 0;
  const exit = t > 0 ? { x: m.x + d.x * t, y: m.y + d.y * t } : { x: E.x - E.rx, y: m.y };
  return { muzzle: m, dir: d, exit };
};

/** The hole the shot blew out of her head: on the far side, where the shot came out (on its line from the muzzle),
 *  jagged, hollow, rebar sticking out along the shot's way, chips; dust still coming off it. */
const hole = (c: Ctx, hand: Pt, f: number) => {
  const g = gunLine(hand), d = g.dir, cx = g.exit.x - d.x * 8, cy = g.exit.y - d.y * 8;
  const qa = Math.round(Math.atan2(d.y, d.x) * 16) / 16;
  // (the wound's still part, stamped (by the way the shot went): the petals, the shell's thickness, the core, the rebar)
  c.save(); c.translate(cx, cy);
  stamp(c, `liberty-wound-${qa}`, -150, -150, 300, 300, gg => woundStill(gg, qa));
  c.restore();
  const rimAt = (a: number) => { const rr = woundR(a, qa); return { x: cx + Math.cos(a) * rr * 0.9, y: cy + Math.sin(a) * rr }; };
  // (wires out of it: the old floodlights' cables, dangling, swaying, frayed copper at the ends)
  for (const [ao, len, col, ph] of [[1.0, 44, '#B91C1C', 0], [-1.3, 34, '#CA8A04', 2], [1.6, 26, '#1D4ED8', 4]] as const) {
    const p = rimAt(qa + ao), sw = Math.sin(f * 0.045 + ph) * 7, ex = p.x + d.x * 10 + sw, ey = p.y + len;
    const mx = p.x + d.x * 16 + sw * 0.4, my = p.y + len * 0.4;
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 3.2; c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    c.strokeStyle = col; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = '#FFFFFF'; c.globalAlpha = 0.35; c.lineWidth = 0.6; c.stroke(); c.globalAlpha = 1;
    r(c, ex - 2, ey, 1, 3, '#F59E0B'); r(c, ex, ey + 1, 1, 3, '#FBBF24'); r(c, ex + 1, ey, 1, 2, '#D97706');
  }
  // (her concrete still dribbling out of the bottom of it, gloopy)
  const lo = rimAt(Math.PI / 2 - 0.2);
  gooDrip(c, lo.x, lo.y - 3, 22, 6, CONC_GOO, (f / 170) % 1);
  // (chips and grit still falling out of it, tumbling)
  for (let k = 0; k < 5; k++) {
    const p = (f * 0.011 + k * 0.2) % 1, s = rimAt(qa + (k - 2) * 0.5), x = s.x + d.x * 26 * p, y = s.y + p * p * 170, sz = 2 + (k % 3);
    const spin = Math.floor(f * 0.3 + k) % 2;
    r(c, x - 0.6, y - 0.6, (spin ? sz : sz * 0.6) + 1.2, (spin ? sz * 0.6 : sz) + 1.2, INK);
    r(c, x, y, spin ? sz : sz * 0.6, spin ? sz * 0.6 : sz, k % 2 ? PAT[3] : CONC[3]); r(c, x, y, 1, 1, k % 2 ? PAT[5] : CONC[5]);
  }
  // (dust still coming off it, out along the shot's way and up)
  for (let k = 0; k < 4; k++) { const t = ((f * 0.8 + k * 25) % 100) / 100; c.globalAlpha = 0.5 * (1 - t); c.fillStyle = CONC[4]; c.beginPath(); c.arc(g.exit.x + d.x * (20 + t * 40), g.exit.y + d.y * (20 + t * 40) - t * 60, 10 + t * 20, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
};
const wj = (n: number) => { const s = Math.sin(n * 91.73 + 17.1) * 43758.5453; return s - Math.floor(s); };
/** The wound's rim's radius at angle a (blown out wider the way the shot went), jagged. */
const woundR = (a: number, da: number) => {
  const i = Math.round(((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2) * 22) % 22;
  return (36 + wj(i) * 14 - (i % 2) * 8) * (1 + 0.28 * Math.max(0, Math.cos(a - da)));
};
/** Oxidized copper (the inside of her shell: brown, the cut edge bright). */
const COP = ['#2A1206', '#4E2410', '#7A3E1C', '#A85E2C', '#D88A4E'];
const RUST = ['#3B1606', '#7C2D12', '#A4441A', '#D2692E', '#F59E5B'];
/** The exit wound (origin its middle; `da` the way the shot went): her copper torn and peeled back in petals (green
 *  outside, the oxidized brown underside curling up), the shell's thickness round the ragged hole, the crumbled
 *  concrete core with its aggregate, the dark inside stepped back, cracks running off over her, rebar bent out the way
 *  the shot went (ribbed, rusty, some snapped bright, one curled), rust bleeding down from it. */
const woundStill = (g: Ctx, da: number) => {
  const rim: [number, number][] = [];
  for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2, rr = woundR(a, da); rim.push([Math.cos(a) * rr * 0.9, Math.sin(a) * rr]); }
  const poly = (k: number, jit = 0, ox = 0, oy = 0) => { g.beginPath(); rim.forEach(([x, y], i) => { const q = k * (1 + (jit ? (wj(i * 3 + jit) - 0.5) * jit * 0.01 : 0)); i ? g.lineTo(ox + x * q, oy + y * q) : g.moveTo(ox + x * q, oy + y * q); }); g.closePath(); };
  // (cracks running off over her from the rim: inked zigzags, a lit lip)
  for (let k = 0; k < 6; k++) {
    const a = da + Math.PI * 0.3 + k * 1.05 + wj(k) * 0.5, r0 = woundR(a, da), pts: [number, number][] = [];
    for (let s = 0; s < 4; s++) { const rr = r0 + s * 14, aa = a + (s % 2 ? 0.12 : -0.1) * (1 + wj(k + s)); pts.push([Math.cos(aa) * rr * 0.9, Math.sin(aa) * rr]); }
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.strokeStyle = PAT[5]; g.lineWidth = 1; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + 1, y + 1.5) : g.moveTo(x + 1, y + 1.5))); g.stroke();
  }
  // (the petals: her copper torn and peeled back out of it, more of them and longer the way the shot went)
  for (let k = 0; k < 9; k++) {
    const a = da + (k / 9) * Math.PI * 2 + (wj(k + 40) - 0.5) * 0.3, out = Math.max(0, Math.cos(a - da));
    const rr = woundR(a, da), len = 10 + out * 26 + wj(k + 7) * 8, hw = 0.16 + wj(k + 9) * 0.08;
    const b1: [number, number] = [Math.cos(a - hw) * rr * 0.86, Math.sin(a - hw) * rr * 0.96], b2: [number, number] = [Math.cos(a + hw) * rr * 0.86, Math.sin(a + hw) * rr * 0.96];
    const tip: [number, number] = [Math.cos(a + 0.1) * (rr + len) * 0.9, Math.sin(a + 0.1) * (rr + len)];
    const curl: [number, number] = [Math.cos(a + 0.04) * (rr + len * 0.62) * 0.9, Math.sin(a + 0.04) * (rr + len * 0.62)];
    // (its shadow on her, its outer face, the lit edge; the underside curling up at the tip: oxidized copper)
    g.fillStyle = dith(g, PAT[0]) as unknown as string; g.beginPath(); g.moveTo(b1[0] + 2, b1[1] + 3); g.lineTo(tip[0] + 3, tip[1] + 4); g.lineTo(b2[0] + 2, b2[1] + 3); g.closePath(); g.fill();
    fl(g, out > 0.3 ? PAT[3] : PAT[2], () => { g.moveTo(b1[0], b1[1]); g.quadraticCurveTo(curl[0] - Math.sin(a) * 4, curl[1] + Math.cos(a) * 4, tip[0], tip[1]); g.lineTo(b2[0], b2[1]); g.closePath(); }, 2);
    g.strokeStyle = PAT[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(b1[0], b1[1]); g.quadraticCurveTo(curl[0] - Math.sin(a) * 3, curl[1] + Math.cos(a) * 3, tip[0], tip[1]); g.stroke();
    fl(g, COP[3], () => { g.moveTo(curl[0], curl[1]); g.lineTo(tip[0], tip[1]); g.lineTo(curl[0] + Math.cos(a + 1.6) * 5, curl[1] + Math.sin(a + 1.6) * 5); g.closePath(); }, 1.5);
    r(g, tip[0] - 1, tip[1] - 1, 2, 1, COP[4]);
  }
  // (the hole: the shell's thickness round it (green lip, the copper's cut, its brown inside face), the concrete core)
  g.fillStyle = INK; poly(1.06); g.fill();
  g.fillStyle = PAT[2]; poly(1); g.fill();
  g.fillStyle = COP[3]; poly(0.92, 6); g.fill();
  g.fillStyle = COP[1]; poly(0.86, 9); g.fill();
  g.strokeStyle = PAT[5]; g.lineWidth = 1; g.beginPath(); rim.slice(8, 17).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.fillStyle = CONC[3]; poly(0.8, 22); g.fill();
  g.fillStyle = dith(g, CONC[2]) as unknown as string; poly(0.74, 26); g.fill();
  g.fillStyle = CONC[2]; poly(0.68, 30, -Math.cos(da) * 2, -Math.sin(da) * 2); g.fill();
  // (the aggregate in the broken core: gravel, lit, a dark under)
  for (let i = 0; i < 34; i++) {
    const a = wj(i + 60) * Math.PI * 2, rr = woundR(a, da) * (0.6 + wj(i + 90) * 0.18), x = Math.cos(a) * rr * 0.9, y = Math.sin(a) * rr, s = 1.5 + wj(i + 120) * 2.2;
    r(g, x - s / 2, y - s / 2 + s, s, 1, CONC[0]); r(g, x - s / 2, y - s / 2, s, s, i % 3 ? CONC[4] : CONC[1]); r(g, x - s / 2, y - s / 2, 1, 1, CONC[5]);
  }
  // (the dark inside, stepped back in, the far wall's lit sliver)
  const bx = -Math.cos(da) * 6, by = -Math.sin(da) * 6;
  g.fillStyle = CONC[0]; poly(0.56, 40, bx * 0.5, by * 0.5); g.fill();
  g.fillStyle = dith(g, '#0C0A09') as unknown as string; poly(0.48, 44, bx, by); g.fill();
  g.fillStyle = '#0C0A09'; poly(0.38, 48, bx * 1.4, by * 1.4); g.fill();
  g.strokeStyle = CONC[3]; g.lineWidth = 2; g.beginPath(); g.arc(bx, by, 14, 0.1, 1.3); g.stroke();
  // (the rebar: out of the core, bent the way the shot went; ribbed, rusty; snapped bright, or curled over)
  for (const [ao, l, kind] of [[0.3, 46, 'snap'], [-0.45, 36, 'bend'], [0.85, 30, 'curl'], [-1.1, 22, 'snap'], [1.5, 18, 'bend'], [-0.1, 56, 'snap']] as const) {
    const a0 = da + ao, r0 = 14, x0 = Math.cos(a0) * r0, y0 = Math.sin(a0) * r0;
    const a1 = da + ao * 0.55, x1 = x0 + Math.cos(a1) * l * 0.55, y1 = y0 + Math.sin(a1) * l * 0.55;
    const a2 = kind === 'bend' ? a1 + 0.7 * Math.sign(ao || 1) : a1 + 0.15, x2 = x1 + Math.cos(a2) * l * 0.45, y2 = y1 + Math.sin(a2) * l * 0.45;
    const pts: number[] = [x0, y0, x1, y1, x2, y2];
    if (kind === 'curl') for (let s = 1; s <= 6; s++) { const aa = a2 + s * 0.55, rr = 7 - s * 0.5; pts.push(x2 + Math.cos(a2) * 4 + Math.cos(aa - Math.PI / 2) * rr, y2 + Math.sin(a2) * 4 + Math.sin(aa - Math.PI / 2) * rr); }
    // (rust run down her from where it comes out of her)
    const rx = Math.cos(a0) * woundR(a0, da) * 0.9, ry = Math.sin(a0) * woundR(a0, da);
    g.fillStyle = dith(g, RUST[2]) as unknown as string; g.fillRect(Math.round(rx), Math.round(ry), 2, 10 + l * 0.3); r(g, rx, ry, 2, 3, RUST[2]);
    const pl = (w: number, col: string, ox = 0, oy = 0) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? g.lineTo(pts[i] + ox, pts[i + 1] + oy) : g.moveTo(pts[i] + ox, pts[i + 1] + oy)); g.stroke(); };
    pl(6, INK); pl(4, RUST[1]); pl(2, RUST[2], 0.4, 0.4); pl(1, RUST[3], -0.9, -0.9);
    // (the ribs along it)
    for (let i = 0; i < pts.length - 2; i += 2) {
      const sx = pts[i], sy0 = pts[i + 1], ex = pts[i + 2], ey = pts[i + 3], len = Math.hypot(ex - sx, ey - sy0), nx = -(ey - sy0) / (len || 1), ny = (ex - sx) / (len || 1);
      for (let t = 2; t < len; t += 4) { const px = sx + ((ex - sx) * t) / len, py = sy0 + ((ey - sy0) * t) / len; g.strokeStyle = RUST[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(px - nx * 2.4 + (ex - sx) / len, py - ny * 2.4 + (ey - sy0) / len); g.lineTo(px + nx * 2.4, py + ny * 2.4); g.stroke(); r(g, px - nx * 2, py - ny * 2, 1, 1, RUST[4]); }
    }
    // (snapped: the bright cut end, a burr)
    if (kind === 'snap') { g.fillStyle = INK; g.beginPath(); g.ellipse(x2, y2, 3.2, 3.2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#A8A29E'; g.beginPath(); g.ellipse(x2, y2, 2.2, 2.2, 0, 0, Math.PI * 2); g.fill(); r(g, x2 - 1, y2 - 1, 1, 1, '#F5F5F4'); r(g, x2 + 1.5, y2 - 3, 2, 1, RUST[3]); }
    else r(g, x2 - 1, y2 - 1, 2, 2, RUST[3]);
  }
};

// The wear (the user: "the statue gets more cracked the more often it does it"): each smash shows more of it. Cracks
// running over her copper (inked, a lit edge), chips knocked out of her (the shell gone, her concrete core showing), the
// patina flaking off to bare copper. Laid out once (seeded), shown a share at a time.

const wh = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5; return s - Math.floor(s); };
const AREAS = [
  { x: LIB.head.x, y: LIB.head.y, rx: 70, ry: 80 }, { x: LIB.x - 180, y: sy(380), rx: 90, ry: 60 },
  { x: LIB.x + 170, y: sy(370), rx: 90, ry: 60 }, { x: LIB.x, y: sy(420), rx: 150, ry: 70 }, { x: LIB.head.x, y: LIB.head.y - 56, rx: 66, ry: 10 },
];
const spot = (n: number) => { const a = AREAS[n % AREAS.length], t = wh(n * 3.1) * Math.PI * 2, k = Math.sqrt(wh(n * 7.7)); return { x: a.x + Math.cos(t) * a.rx * k, y: a.y + Math.sin(t) * a.ry * k }; };
const CRACKS = Array.from({ length: 26 }, (_, i) => {
  const p = spot(i + 1), pts = [p];
  let a = Math.PI / 2 + (wh(i * 5.3) - 0.5) * 2.2;
  for (let s = 0; s < 6; s++) { a += (wh(i * 11 + s) - 0.5) * 1.2; const q = pts[pts.length - 1], l = 12 + wh(i * 17 + s) * 16; pts.push({ x: q.x + Math.cos(a) * l, y: q.y + Math.sin(a) * l }); }
  return pts;
});
const CHIPS = Array.from({ length: 12 }, (_, i) => ({ ...spot(i * 3 + 40), r: 8 + wh(i * 2.9) * 12, seed: i }));
const FLAKES = Array.from({ length: 44 }, (_, i) => ({ ...spot(i * 5 + 90), w: 3 + wh(i * 1.3) * 6 }));
const wearMarks = (c: Ctx, wear: number) => {
  // (the patina flaking: bare copper showing)
  for (let i = 0; i < Math.min(FLAKES.length, Math.floor(wear * 34)); i++) { const p = FLAKES[i]; r(c, p.x, p.y, p.w, p.w * 0.6, i % 3 ? '#B87333' : '#8C5A2B'); r(c, p.x, p.y, p.w * 0.5, 1, '#E3A869'); }
  // (chips knocked out: a hole in the shell, the concrete in it, a broken lit rim)
  for (let i = 0; i < Math.min(CHIPS.length, Math.floor(wear * 9)); i++) {
    const ch = CHIPS[i];
    c.beginPath();
    for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2, rr = ch.r * (0.7 + wh(ch.seed * 13 + k) * 0.5); if (k) c.lineTo(ch.x + Math.cos(a) * rr, ch.y + Math.sin(a) * rr * 0.8); else c.moveTo(ch.x + Math.cos(a) * rr, ch.y + Math.sin(a) * rr * 0.8); }
    c.closePath(); c.fillStyle = CONC[2]; c.fill(); c.strokeStyle = PAT[0]; c.lineWidth = 2; c.stroke();
    r(c, ch.x - ch.r * 0.5, ch.y - ch.r * 0.4, ch.r * 0.6, 2, CONC[4]);
  }
  // (the cracks: more of them, and each longer, the worse she is)
  const n = Math.min(CRACKS.length, Math.ceil(wear * 18));
  for (let i = 0; i < n; i++) {
    const pts = CRACKS[i], len = Math.min(pts.length, 2 + Math.floor(wear * 6));
    c.strokeStyle = INK; c.lineWidth = 2.5; c.lineJoin = 'miter'; c.beginPath(); pts.slice(0, len).forEach((p, k) => (k ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
    c.strokeStyle = PAT[5]; c.lineWidth = 1; c.beginPath(); pts.slice(0, len).forEach((p, k) => (k ? c.lineTo(p.x + 1.5, p.y + 1.5) : c.moveTo(p.x + 1.5, p.y + 1.5))); c.stroke();
  }
};

/** Everything of her but her right arm (and, toppling, that too: `arm` draws it in her frame). */
export const drawLibertyBody = (c: Ctx, L: LibLook, arm?: (c: Ctx) => void) => {
  c.save();
  frame(c, L);
  const hx = LIB.head.x, hy = LIB.head.y;
  stamp(c, 'liberty-robe', LIB.x - 310, sy(318) - 40, 620, sy(560) - sy(318) + 60, g => robe(g, L.f));
  // (her left arm: down her side to the tablet, or up with the gun at her temple)
  const sh = LIB.shL, hd = L.hand;
  const dx = hd.x - sh.x, dy2 = hd.y - sh.y, d = Math.min(LIB.upper + LIB.fore - 2, Math.hypot(dx, dy2) || 1);
  const base = Math.atan2(dy2, dx), off = Math.acos(Math.max(-1, Math.min(1, d / (2 * LIB.upper))));
  // (the elbow out to her side, away from her body)
  const e1 = base - off, e2 = base + off;
  const ea = Math.cos(e1) > Math.cos(e2) ? e1 : e2;
  const ex = sh.x + Math.cos(ea) * LIB.upper, ey = sh.y + Math.sin(ea) * LIB.upper;
  const hx2 = sh.x + Math.cos(base) * d, hy2 = sh.y + Math.sin(base) * d;
  if (L.tablet) tablet(c);
  const leftArm = () => {
    // (a sculpted arm, the sleeve over it; the elbow's bend kept gentle, a statue's)
    const ln = Math.hypot(hx2 - sh.x, hy2 - sh.y) || 1, mx = (sh.x + hx2) / 2, my = (sh.y + hy2) / 2, el = Math.hypot(ex - mx, ey - my) || 1;
    const sag = Math.min(0.2, el / ln) * ln;
    sculptedArm(c, sh, { x: mx + ((ex - mx) / el) * sag, y: my + ((ey - my) / el) * sag }, { x: hx2, y: hy2 }, 70);
    handOpen(c, hx2, hy2);
  };
  // (holding the gun to her head: the arm and the revolver IN FRONT of her head, its muzzle on her temple on our side
  // (the user: "make sure the gun can be seen"); otherwise the arm's behind, at her side)
  if (!L.gun) leftArm();
  stamp(c, 'liberty-hair', hx - 100, hy - 80, 200, 180, g => hair(g, hx, hy));
  face(c, L, hx, hy);
  crown(c, L, hx, hy);
  if (L.gun) { leftArm(); revolver(c, hx2 - 10, hy2 - 10, GUN_A, L.f, L.broken > 0 && L.broken < 5); }
  // (his puke on her)
  // (goo.ts: a splat stuck to her, chunks in it, a run creeping down off it, globs dropping off the end)
  L.stains.forEach((s, i) => gooRun(c, hx + s.x, hy + s.y, s.r, PUKE_GOO, 20 + i, ageOf(s, L.f), L.f));
  if (L.wear) wearMarks(c, L.wear);
  if (L.broken > 0) hole(c, L.hand, L.f);
  if (arm) arm(c);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Her arms (the user: "bend more naturally ... natural for a statue"): the sculpted classical arm of a copper statue,
// not flesh and not blocks. Smooth tapered volumes, lit in the patina's steps from the upper left; the heavy robe
// sleeve carved over the upper arm, hanging off its underside as one solid mass, its folds cut deep, a seam of rivets
// where two copper sheets meet; the elbow a gentle sculpted bend hidden in the sleeve's mouth; the hand closed round
// the torch's handle (or laid on the tablet). It moves like a heavy statue: stiff, the sleeve going with it.

type Pt = { x: number; y: number };
/** The lit side of a limb going from a to b: its normal toward the upper left. */
const litN = (a: Pt, b: Pt) => {
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
  return nx * -0.6 + ny * -0.8 >= 0 ? { x: nx, y: ny } : { x: -nx, y: -ny };
};
/** A tapered sculpted volume from a (width w0) to b (w1), its ends rounded: inked, then the patina in steps (the
 *  shadow side, the body, the lit side, a hard highlight). */
const volume = (c: Ctx, a: Pt, b: Pt, w0: number, w1: number) => {
  const n = litN(a, b), an = Math.atan2(n.y, n.x);
  const whole = () => {
    c.beginPath();
    c.moveTo(a.x + n.x * w0 / 2, a.y + n.y * w0 / 2);
    c.lineTo(b.x + n.x * w1 / 2, b.y + n.y * w1 / 2);
    // (round over the far end, then the near end, outward each time)
    const ux = b.x - a.x, uy = b.y - a.y, ccw = n.x * uy - n.y * ux < 0;
    c.arc(b.x, b.y, w1 / 2, an, an + Math.PI, ccw);
    c.lineTo(a.x - n.x * w0 / 2, a.y - n.y * w0 / 2);
    c.arc(a.x, a.y, w0 / 2, an + Math.PI, an, ccw);
    c.closePath();
  };
  /** The band between o0 and o1 of the half width (-1 the shadow side .. 1 the lit side). */
  const band = (o0: number, o1: number, col: string) => {
    c.beginPath();
    c.moveTo(a.x + n.x * w0 / 2 * o1, a.y + n.y * w0 / 2 * o1); c.lineTo(b.x + n.x * w1 / 2 * o1, b.y + n.y * w1 / 2 * o1);
    c.lineTo(b.x + n.x * w1 / 2 * o0, b.y + n.y * w1 / 2 * o0); c.lineTo(a.x + n.x * w0 / 2 * o0, a.y + n.y * w0 / 2 * o0);
    c.closePath(); c.fillStyle = col; c.fill();
  };
  whole(); c.fillStyle = PAT[3]; c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
  c.save(); whole(); c.clip();
  band(-1.6, -0.45, PAT[2]); band(-1.6, -0.8, PAT[1]); band(0.3, 1.6, PAT[4]); band(0.6, 0.76, PAT[5]);
  c.restore();
};
/** The robe's sleeve over the upper arm, shoulder `a` to elbow `b`: one heavy carved mass, close over the top of the
 *  arm and hanging off its underside in a bell to its mouth past the elbow; deep folds; a riveted seam. */
const sleeve = (c: Ctx, a: Pt, b: Pt, w: number) => {
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1, ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, nx = -uy, ny = ux;
  // (how far each side hangs out: whichever faces down hangs heavier, smoothly as the arm turns: no flip)
  const hang = (s: number) => 14 + 50 * Math.max(0, Math.min(1, (s * ny + 0.35) / 1.35));
  const off = (s: number, t: number) => w / 2 + 6 + Math.pow(t, 1.6) * hang(s);
  const END = 1.12, N = 10;
  const at = (s: number, t: number, k = 1) => ({ x: a.x + ux * L * t + nx * s * off(s, t) * k, y: a.y + uy * L * t + ny * s * off(s, t) * k });
  const m1 = at(1, END), m2 = at(-1, END);
  const outline = () => {
    c.beginPath();
    for (let i = 0; i <= N; i++) { const p = at(1, (i / N) * END); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }
    // (the hem across the mouth, rounded)
    c.quadraticCurveTo((m1.x + m2.x) / 2 + ux * 16, (m1.y + m2.y) / 2 + uy * 16, m2.x, m2.y);
    for (let i = N; i >= 0; i--) { const p = at(-1, (i / N) * END); c.lineTo(p.x, p.y); }
    // (round over the shoulder end)
    c.quadraticCurveTo(a.x - ux * w * 0.5, a.y - uy * w * 0.5, at(1, 0).x, at(1, 0).y);
    c.closePath();
  };
  outline(); c.fillStyle = PAT[3]; c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
  c.save(); outline(); c.clip();
  // (stepped: the side away from the light dark, its far edge darker; the lit side a step up)
  const n = litN(a, b), lit = n.x * nx + n.y * ny > 0 ? 1 : -1;
  const strip = (s: number, k0: number, k1: number, col: string) => {
    c.beginPath();
    for (let i = 0; i <= N; i++) { const p = at(s, (i / N) * END, k0); if (i) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }
    for (let i = N; i >= 0; i--) { const p = at(s, (i / N) * END, k1); c.lineTo(p.x, p.y); }
    c.closePath(); c.fillStyle = col; c.fill();
  };
  strip(-lit, 0.45, 1.3, PAT[2]); strip(-lit, 0.8, 1.3, PAT[1]); strip(lit, 0.25, 0.8, PAT[4]);
  // (the folds: grooves cut from up by the shoulder fanning out to the mouth, a lit lip along each)
  for (const k of [-0.75, -0.4, 0.1, 0.5]) {
    const s = k < 0 ? -1 : 1, kk = Math.abs(k), p0 = at(s, 0.2, kk), p1 = at(s, END - 0.03, kk);
    const cx = (p0.x + p1.x) / 2 + nx * s * 8, cy = (p0.y + p1.y) / 2 + ny * s * 8;
    c.strokeStyle = PAT[1]; c.lineWidth = 4; c.beginPath(); c.moveTo(p0.x, p0.y); c.quadraticCurveTo(cx, cy, p1.x, p1.y); c.stroke();
    c.strokeStyle = PAT[5]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p0.x + n.x * 4, p0.y + n.y * 4); c.quadraticCurveTo(cx + n.x * 4, cy + n.y * 4, p1.x + n.x * 4, p1.y + n.y * 4); c.stroke();
  }
  // (a seam between two of her copper sheets, riveted)
  const s0 = at(lit, 0.55), s1 = at(-lit, 0.62);
  c.strokeStyle = PAT[1]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(s0.x, s0.y); c.lineTo(s1.x, s1.y); c.stroke();
  for (let k = 1; k < 6; k++) { const t = k / 6, x = s0.x + (s1.x - s0.x) * t, y = s0.y + (s1.y - s0.y) * t; r(c, x - 1.5, y - 4, 3, 3, PAT[1]); c.fillStyle = PAT[6]; c.fillRect(Math.round(x - 1.5), Math.round(y - 4), 1, 1); }
  c.restore();
  // (the mouth's hollow: dark inside, where the forearm comes out)
  c.fillStyle = PAT[0]; c.beginPath(); c.ellipse((m1.x + m2.x) / 2 + ux * 4, (m1.y + m2.y) / 2 + uy * 4, Math.hypot(m1.x - m2.x, m1.y - m2.y) * 0.32, 8, Math.atan2(m1.y - m2.y, m1.x - m2.x), 0, Math.PI * 2); c.fill();
};
/** A sculpted arm: shoulder S, elbow E, wrist W; the sleeve over the upper arm last (the elbow hidden in its mouth). */
const sculptedArm = (c: Ctx, S: Pt, E: Pt, W: Pt, w: number) => {
  volume(c, E, W, w * 0.78, w * 0.58);
  volume(c, S, E, w, w * 0.8);
  sleeve(c, S, E, w);
};

/** Her torch (local: the cup's foot at the origin, the flame up -y, the handle down +y `H` long): the ornate handle in
 *  carved rings, the cup with its carved leaves, the balcony and its railing, the gold leaf flame in steps (`lit`: its
 *  glow). */
const torchArt = (c: Ctx, H: number, lit: boolean, f: number) => {
  // (the handle: tapering, carved rings, a knob on its end)
  fl(c, PAT[3], () => { c.moveTo(-12, 0); c.lineTo(12, 0); c.lineTo(9, H); c.lineTo(-9, H); c.closePath(); }, 2.5);
  r(c, -10, 2, 5, H - 4, PAT[5]); r(c, 4, 2, 5, H - 4, PAT[1]);
  for (let y = 18; y < H - 8; y += 26) { r(c, -12, y, 24, 4, PAT[2]); r(c, -12, y, 24, 1.5, PAT[5]); }
  fl(c, PAT[3], () => c.ellipse(0, H + 4, 14, 9, 0, 0, Math.PI * 2), 2.5); r(c, -8, H, 6, 3, PAT[5]);
  // (the cup: flaring up, carved leaves round it)
  fl(c, PAT[3], () => { c.moveTo(-14, 2); c.lineTo(14, 2); c.lineTo(28, -30); c.lineTo(-28, -30); c.closePath(); }, 2.5);
  r(c, -22, -26, 9, 22, PAT[4]); r(c, 13, -26, 9, 22, PAT[2]);
  for (let k = -2; k <= 2; k++) { c.strokeStyle = PAT[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(k * 5, 0); c.lineTo(k * 10, -26); c.stroke(); }
  // (the balcony round the top: its floor, the railing's posts, the top rail)
  fl(c, PAT[4], () => c.ellipse(0, -32, 46, 8, 0, 0, Math.PI * 2), 2.5);
  r(c, -44, -34, 88, 2, PAT[6]);
  for (let k = -4; k <= 4; k++) r(c, k * 10 - 1.5, -50, 3, 16, k < 0 ? PAT[4] : PAT[2]);
  fl(c, PAT[3], () => c.roundRect(-46, -54, 92, 6, 3), 2);
  // (the flame: gold leaf, lobed, in steps in to its hot heart)
  const sh = Math.sin(f * 0.15) * 2;
  const flame = (k: number) => () => {
    const y0 = -54, j = (v: number) => y0 + v * k;
    c.moveTo(-34 * k, y0); c.quadraticCurveTo(-46 * k, j(-46), -12 * k + sh, j(-80));
    c.quadraticCurveTo(-14 * k, j(-54), -2 * k, j(-48));
    c.quadraticCurveTo(4 * k + sh, j(-78), 22 * k + sh, j(-100));
    c.quadraticCurveTo(48 * k, j(-46), 34 * k, y0); c.closePath();
  };
  if (lit) { const g = c.createRadialGradient(0, -96, 8, 0, -96, 110); g.addColorStop(0, 'rgba(254, 240, 138, 0.4)'); g.addColorStop(1, 'rgba(254, 240, 138, 0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -96, 110, 0, Math.PI * 2); c.fill(); }
  fl(c, GOLD[1], flame(1), 2.5);
  fl(c, dith(c, GOLD[2]) as unknown as string, flame(0.86), 0);
  fl(c, GOLD[2], flame(0.78), 0);
  fl(c, dith(c, GOLD[3]) as unknown as string, flame(0.6), 0);
  fl(c, GOLD[3], flame(0.52), 0);
  if (lit) { fl(c, dith(c, GOLD[4]) as unknown as string, flame(0.36), 0); fl(c, GOLD[4], flame(0.28), 0); }
  // (the gold leaf's seams: the sheets it's laid in, a glint running over them)
  c.strokeStyle = GOLD[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(-24, -60); c.quadraticCurveTo(-18, -84, -8, -96); c.moveTo(14, -58); c.quadraticCurveTo(20, -80, 18, -104); c.stroke();
  if (lit) { const gy = -60 - ((f * 0.6) % 60); r(c, -4, gy, 3, 3, '#FFFFFF'); }
  r(c, -20, -98, 4, 20, GOLD[4]); r(c, 8, -120, 3, 14, GOLD[3]);
};
/** Her hand closed round the torch's handle (local: the torch's frame, the grip at the origin): the fingers wrapped
 *  across the front in sculpted rolls, the thumb over them, lit in steps; `glow` the windup's heat. */
const fistOnHandle = (c: Ctx, glow: number) => {
  fl(c, PAT[3], () => c.roundRect(-34, -30, 68, 60, 22), 3);
  r(c, -28, -24, 12, 46, PAT[4]); r(c, 18, -22, 12, 44, PAT[2]);
  for (let k = 0; k < 4; k++) {
    const y = -22 + k * 12;
    fl(c, k % 2 ? PAT[3] : PAT[4], () => c.roundRect(-30, y, 60, 13, 6), 2);
    r(c, -24, y + 2, 30, 2, PAT[5]);
  }
  // (the thumb, round over the first fingers)
  fl(c, PAT[4], () => { c.moveTo(-34, -28); c.quadraticCurveTo(-8, -40, 14, -22); c.quadraticCurveTo(6, -12, -14, -14); c.quadraticCurveTo(-30, -16, -34, -28); c.closePath(); }, 2.5);
  r(c, -22, -30, 18, 2, PAT[6]);
  if (glow > 0) { c.globalAlpha = Math.min(1, glow); c.fillStyle = '#F97316'; c.beginPath(); c.roundRect(-38, -34, 76, 68, 24); c.fill(); c.globalAlpha = 1; }
};
/** Her left hand laid on the tablet (or round the gun): a sculpted hand, the fingers over the edge. */
const handOpen = (c: Ctx, x: number, y: number) => {
  fl(c, PAT[3], () => c.ellipse(x, y, 32, 28, -0.3, 0, Math.PI * 2), 3);
  r(c, x - 22, y - 18, 18, 6, PAT[5]);
  for (let k = 0; k < 4; k++) fl(c, PAT[4], () => c.roundRect(x - 26 + k * 13, y + 10, 12, 26 - Math.abs(k - 1.5) * 4, 6), 2);
};

/** Where her elbow is between its two sides (-1 .. 1), and how bent it is, eased frame to frame (never a pop). */
let elbowS = 1, bendK = 0.15;
/** The torch's flame (world), last drawn: for the lighting (the section's lamps). */
export let torchFlame: { x: number; y: number; f: number } | null = null;
/** The grip to the cup's foot along the torch, the cup's foot to the flame's middle, the handle's length; the grip to
 *  the handle's butt (the knob's end). */
const GRIP = 76, HEAD = 96, TORCH_H = 132, BUTT = TORCH_H + 13 - GRIP;
/** Staked: how much further down through her grip the torch is driven (its handle's bottom third in the slab), and
 *  how far it's slanted, rammed in. */
const DEEP = 56, RAM = 0.14, RISE = 26;
/** Flame first into the floor: how far her fist's punched in after the torch (its middle under the floor's line). */
const FIST_SINK = 6;
/**
 * Her right arm, the torch arm: from her shoulder (sunk `dy`) to (fx, fy) (world): her hand, the torch upright in it;
 * or, smashing (`smash` 0..1; the user: "slams it down with the bottom of the torch sticking in the ground"), the
 * torch's BUTT there: driven down handle first like a stake, it stands up out of the floor (`floor`: anything of it
 * under that's hidden), the flame on top, leaning a little back toward her, her fist round the handle above the floor.
 * `glow` (0..1): the windup's tell.
 */
export const drawArm = (c: Ctx, L: LibLook, fx: number, fy: number, opts: { torch: boolean; glow?: number; stuck?: number; away?: { x: number; y: number }; straight?: boolean; smash?: number; floor?: number; tug?: number }) => {
  c.save();
  // (she's at the back: past the arena's end walls she's behind them, never painted over them)
  c.beginPath(); c.rect(ARENA_L, -100000, ARENA_R - ARENA_L, 200000); c.clip();
  const jx = L.shake ? Math.sin(L.f * 1.7) * L.shake : 0;
  if (jx) c.translate(jx, 0);
  const S = { x: LIB.shR.x, y: LIB.shR.y + L.dy };
  let dx = fx - S.x, dy = fy - S.y;
  const d0 = Math.hypot(dx, dy) || 1, reachMax = LIB.upper + LIB.fore - 2;
  if (d0 > reachMax) { const k = reachMax / d0; dx *= k; dy *= k; }
  // (the torch's way: upright, held up; staked in the floor, leaning back toward her shoulder a little. Staked, its butt
  // stays where it went in, however close under her or far off that is: the arm reaches down to her grip on it)
  const w = opts.torch ? Math.max(0, Math.min(1, opts.smash ?? 0)) : 0;
  const T = w > 0 ? { x: S.x + (fx - S.x) * w + dx * (1 - w), y: S.y + (fy - S.y) * w + dy * (1 - w) } : { x: S.x + dx, y: S.y + dy };
  const upA = -Math.PI / 2;
  let lean = Math.atan2(S.y - T.y, S.x - T.x) - upA; while (lean > Math.PI) lean -= Math.PI * 2; while (lean < -Math.PI) lean += Math.PI * 2;
  // (smashing onto the floor (the user: "you can see her fist in the ground, like the whole torch went in"): she turns
  // it over in her fist as it comes down, flame first like an ice pick, and drives the whole torch into the slab, her
  // fist punched in after it up to the knuckles. Anywhere else, staked butt first: rammed in at a slant, back toward her)
  const pick = opts.torch && opts.floor !== undefined && w > 0;
  const turn = T.x < S.x ? -1 : 1;
  const ta = pick ? upA + turn * Math.PI * w : upA + Math.max(-0.62, Math.min(0.62, lean * 0.35 + (lean >= 0 ? RAM : -RAM))) * w;
  // (her hand: there (sunk into the floor once it's in), or up the handle from the butt)
  const full = GRIP + HEAD;
  const H = pick ? { x: T.x, y: Math.min(T.y, opts.floor! + FIST_SINK) } : { x: T.x + Math.cos(ta) * (BUTT + RISE) * w, y: T.y + Math.sin(ta) * (BUTT + RISE) * w };
  // (the elbow: a gentle sculpted bend: out to her side raised, up over the line lowered, away from her face rearing)
  const hdx = H.x - S.x, hdy = H.y - S.y, hd = Math.hypot(hdx, hdy) || 1, nx = -hdy / hd, ny = hdx / hd;
  const mid = { x: S.x + hdx * 0.5, y: S.y + hdy * 0.5 };
  const E1 = { x: mid.x + nx * hd * 0.2, y: mid.y + ny * hd * 0.2 }, E2 = { x: mid.x - nx * hd * 0.2, y: mid.y - ny * hd * 0.2 };
  const far = (p: Pt) => (opts.away ? Math.hypot(p.x - opts.away.x, p.y - opts.away.y) : 0);
  let want = opts.away ? (far(E1) > far(E2) ? 1 : -1) : H.y < S.y ? (E1.x < E2.x ? 1 : -1) : (E1.y < E2.y ? 1 : -1);
  // (never out past the arena's left wall)
  const inside = (p: Pt) => p.x > ARENA_L + 24;
  if (!inside(want > 0 ? E1 : E2) && inside(want > 0 ? E2 : E1)) want = -want;
  elbowS += (want - elbowS) * 0.1;
  bendK += ((opts.straight ? 0.05 : 0.15) - bendK) * 0.15;
  const E = { x: mid.x + nx * hd * bendK * elbowS, y: mid.y + ny * hd * bendK * elbowS };
  // (held up: the torch first (its handle runs on back behind the fist), then the arm, then her hand round the handle.
  // Coming down and staked: the arm first, the torch in front of it (it leans back along her forearm: drawn under the
  // arm it was lost behind it), then her hand)
  const rot = ta + Math.PI / 2, torchFront = w > 0.3;
  // (staked, the torch's driven on down through her grip: the bottom third of its handle's in the slab, her fist up on
  // the top of the handle; each silent tug lifts it a hair, then it drops back)
  const deep = pick ? 0 : DEEP * w, lift = (opts.tug ?? 0) * 2;
  const torch = () => {
    if (!opts.torch) return;
    c.save();
    // (what's in the floor: nothing of it below the floor's line)
    if (opts.floor !== undefined && w > 0) { c.beginPath(); c.rect(-100000, -100000, 200000, opts.floor + 100000); c.clip(); }
    c.translate(H.x, H.y - lift); c.rotate(rot); c.translate(0, -GRIP + deep); torchArt(c, TORCH_H, true, L.f); c.restore();
    const flx = H.x + jx + Math.cos(ta) * (full - deep), fly = H.y - lift + Math.sin(ta) * (full - deep);
    // (its flame buried in the slab: no light off it)
    torchFlame = opts.floor !== undefined && fly > opts.floor + 10 ? null : { x: flx, y: fly, f: L.f };
  };
  // (where it went in: on the torch's line, at the floor)
  const staked = opts.torch && opts.floor !== undefined && w > 0.6 && T.y > opts.floor - 4;
  const gy = opts.floor ?? 0, k = staked ? (w - 0.6) / 0.4 : 0, s0 = (gy - H.y) / (Math.sin(ta) || -1), ex = H.x + Math.cos(ta) * s0;
  // (behind it: the hole, dark, its far rim; the cracks running off along the slab)
  if (staked) {
    c.fillStyle = '#3A2E22'; c.beginPath(); c.ellipse(ex, gy, 40 * k, 8 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0E0A08'; c.beginPath(); c.ellipse(ex, gy + 1, 24 * k, 5 * k, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = INK; c.lineWidth = 2;
    for (const [a, l] of [[0.1, 70], [0.5, 46], [2.7, 64], [3.1, 80], [-0.25, 38], [3.4, 40]] as const) { c.beginPath(); c.moveTo(ex + Math.cos(a) * 30 * k, gy + Math.sin(a) * 4); c.lineTo(ex + Math.cos(a) * (30 + l * 0.5) * k, gy + Math.sin(a) * 6 - 1); c.lineTo(ex + Math.cos(a) * (30 + l) * k, gy + Math.sin(a) * 7); c.stroke(); }
  }
  if (!torchFront || pick) torch();
  sculptedArm(c, S, E, H, 70);
  if (torchFront && !pick) torch();
  // (in front of it: the broken slab heaped up round the shaft, overlapping the handle, the near rim; dust on a tug;
  // punched in, over the foot of her fist)
  const rubble = () => {
    if (!staked) return;
    for (const [ox, sz, h, col] of [[-34, 13, 10, '#8A8378'], [-20, 11, 15, '#A8A29E'], [-8, 9, 12, '#6B5B45'], [6, 10, 16, '#A8A29E'], [18, 12, 11, '#8A8378'], [32, 10, 8, '#6B5B45'], [-2, 14, 7, '#78716C']] as const) {
      const sw = sz * k, sh = h * k;
      fl(c, col, () => { c.moveTo(ex + ox - sw, gy + 3); c.lineTo(ex + ox - sw * 0.5, gy - sh); c.lineTo(ex + ox + sw * 0.4, gy - sh * 0.8); c.lineTo(ex + ox + sw, gy + 3); c.closePath(); }, 1.5);
    }
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.ellipse(ex, gy + 2, 40 * k, 7 * k, 0, 0.15, Math.PI - 0.15); c.stroke();
    if (lift > 0) { c.fillStyle = 'rgba(214, 211, 209, 0.6)'; for (const ox of [-26, -8, 12, 28]) { c.beginPath(); c.arc(ex + ox, gy - 10, 7, 0, Math.PI * 2); c.fill(); } }
  };
  if (!pick) rubble();
  // (her fist round the handle; flame first, it's upright with the torch down out of the bottom of it, and what's in
  // the floor of it hidden)
  c.save();
  if (pick) { c.beginPath(); c.rect(-100000, -100000, 200000, gy + 1 + 100000); c.clip(); }
  c.translate(H.x, H.y - lift); c.rotate(pick ? 0 : rot); fistOnHandle(c, (opts.glow ?? 0) * (0.5 + 0.3 * Math.sin(L.f * 0.6))); c.restore();
  if (pick) rubble();
  // (stuck: cracks up the forearm from her grip)
  if (opts.stuck !== undefined && opts.stuck > 0) {
    const sk = opts.stuck, el = Math.hypot(E.x - H.x, E.y - H.y) || 1, ux = (E.x - H.x) / el, uy = (E.y - H.y) / el;
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
    c.moveTo(H.x + ux * 36, H.y + uy * 36);
    c.lineTo(H.x + ux * (36 + 40 * sk) - uy * 8 * sk, H.y + uy * (36 + 40 * sk) + ux * 8 * sk);
    c.lineTo(H.x + ux * (36 + 70 * sk) + uy * 4 * sk, H.y + uy * (36 + 70 * sk) - ux * 4 * sk);
    c.stroke();
  }
  c.restore();
};


// ---------------------------------------------------------------------------------------------------------------
// After: what's left of her on the floor (the end of the fight, and revisits)

/** The rubble on the floor (concrete chunks and her green shell, a crown ray, a broken nose), around x. */
export const drawRubble = (c: Ctx, x: number, gy: number, f: number) => {
  // (still: painted once into a stamp)
  stamp(c, `liberty-rubble-${Math.round(x)}-${Math.round(gy)}`, x - 230, gy - 64, 470, 70, g => rubbleStill(g, x, gy));
  void f;
};
const rubbleStill = (c: Ctx, x: number, gy: number) => {
  const chunks: [number, number, number, string][] = [[-150, 22, 16, CONC[3]], [-110, 30, 22, PAT[3]], [-60, 18, 14, CONC[4]], [-20, 26, 20, PAT[2]], [30, 20, 18, CONC[3]], [80, 34, 26, PAT[3]], [140, 16, 12, CONC[4]], [190, 24, 18, PAT[4]]];
  for (const [i, [dx, w, h, col]] of chunks.entries()) {
    const green = col.startsWith('#') && PAT.includes(col);
    const path = () => { c.moveTo(x + dx - w, gy); c.lineTo(x + dx - w * 0.6, gy - h); c.lineTo(x + dx + w * 0.3, gy - h * 1.1); c.lineTo(x + dx + w, gy); c.closePath(); };
    fl(c, col, path, 2);
    // (lit along its top faces, its far face in shade; the green shell's broken edge showing the concrete; rebar)
    c.save(); c.beginPath(); path(); c.clip();
    c.fillStyle = green ? PAT[5] : CONC[5]; c.beginPath(); c.moveTo(x + dx - w, gy); c.lineTo(x + dx - w * 0.6, gy - h); c.lineTo(x + dx - w * 0.3, gy - h); c.lineTo(x + dx - w * 0.7, gy); c.closePath(); c.fill();
    dr(c, x + dx + w * 0.2, gy - h * 1.2, w, h * 1.2, green ? PAT[1] : CONC[2]);
    if (green) { r(c, x + dx - w * 0.6, gy - h + 2, w * 0.9, 4, CONC[3]); r(c, x + dx - w * 0.6, gy - h + 2, w * 0.9, 1, CONC[5]); }
    c.restore();
    if (i % 3 === 1) { c.strokeStyle = '#7C2D12'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x + dx, gy - h * 0.6); c.lineTo(x + dx + 8, gy - h - 14); c.lineTo(x + dx + 14, gy - h - 16); c.stroke(); c.strokeStyle = '#C2410C'; c.lineWidth = 1; c.stroke(); }
  }
  // (a crown ray, broken off, lying)
  // (faceted like the ones still on her: the lit face above its ridge, the shadow face under, stepped and dithered; a
  // glint; the riveted collar; the snapped end jagged with the concrete in the break)
  fl(c, PAT[3], () => { c.moveTo(x - 40, gy - 2); c.lineTo(x + 70, gy - 12); c.lineTo(x - 40, gy - 22); c.closePath(); }, 2);
  c.save(); c.beginPath(); c.moveTo(x - 40, gy - 2); c.lineTo(x + 70, gy - 12); c.lineTo(x - 40, gy - 22); c.closePath(); c.clip();
  r(c, x - 40, gy - 24, 112, 11, PAT[4]); dr(c, x - 40, gy - 22, 112, 3, PAT[5]); r(c, x - 40, gy - 12, 112, 12, PAT[2]); dr(c, x - 40, gy - 7, 112, 3, PAT[1]);
  r(c, x - 36, gy - 13, 104, 1, PAT[6]); r(c, x - 36, gy - 12, 104, 1, PAT[1]);
  r(c, x - 12, gy - 18, 8, 1, PAT[6]); run(c, x + 10, gy - 16, 4);
  c.restore();
  fl(c, PAT[2], () => c.rect(x - 46, gy - 24, 10, 24), 2); r(c, x - 45, gy - 23, 2, 22, PAT[4]);
  for (const ry of [gy - 19, gy - 12, gy - 5]) { r(c, x - 42, ry, 2, 2, PAT[0]); r(c, x - 42, ry, 1, 1, PAT[6]); }
  fl(c, CONC[3], () => { c.moveTo(x - 46, gy - 24); c.lineTo(x - 52, gy - 19); c.lineTo(x - 48, gy - 13); c.lineTo(x - 54, gy - 7); c.lineTo(x - 46, gy); c.closePath(); }, 1.5);
  r(c, x - 51, gy - 18, 3, 1, CONC[5]);
  // (her nose, snapped off: the bridge lit, the far side in shade, a nostril, the concrete showing where it broke)
  fl(c, PAT[4], () => { c.moveTo(x + 110, gy); c.lineTo(x + 116, gy - 30); c.lineTo(x + 128, gy); c.closePath(); }, 2);
  c.save(); c.beginPath(); c.moveTo(x + 110, gy); c.lineTo(x + 116, gy - 30); c.lineTo(x + 128, gy); c.closePath(); c.clip();
  r(c, x + 108, gy - 32, 7, 32, PAT[5]); r(c, x + 115, gy - 32, 2, 32, PAT[6]); r(c, x + 120, gy - 32, 10, 32, PAT[2]); dr(c, x + 118, gy - 32, 2, 32, PAT[2]);
  r(c, x + 116, gy - 5, 6, 3, PAT[0]);
  c.restore();
  fl(c, CONC[3], () => { c.moveTo(x + 113, gy - 16); c.lineTo(x + 116, gy - 30); c.lineTo(x + 120, gy - 18); c.closePath(); }, 1.2);
  r(c, x + 115, gy - 25, 1, 3, CONC[5]);
};
/** The revolver at (x, y) (its grip), turned `a` (0: lying, barrel to the right). */
export const drawRevolverAt = (c: Ctx, x: number, y: number, a: number) => revolver(c, x, y, a, 0, false);
/** Her torch at (x, y) (the cup), turned `a` (0: upright; -PI/2 lying, the flame to the left). Its flame's out. */
export const drawTorchAt = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  torchArt(c, TORCH_H, false, 0);
  c.restore();
};
/** The revolver dropped (lying on the floor), and the torch, lying. */
export const drawDropped = (c: Ctx, gx: number, tx: number, gy: number, f: number) => {
  drawRevolverAt(c, gx, gy - 46, 0.04);
  drawTorchAt(c, tx, gy - 40, -Math.PI / 2 + 0.06);
  void f;
};
/** A chunk of her flying (the shot, the topple). */
export const drawChunk = (c: Ctx, x: number, y: number, s: number, a: number, green: boolean) => {
  c.save(); c.translate(x, y); c.rotate(a);
  fl(c, green ? PAT[3] : CONC[3], () => { c.moveTo(-s, -s * 0.6); c.lineTo(s * 0.8, -s); c.lineTo(s, s * 0.5); c.lineTo(-s * 0.4, s); c.closePath(); }, 1.5);
  // (its lit edge, its shade, the concrete under her green shell)
  c.strokeStyle = green ? PAT[5] : CONC[5]; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-s * 0.8, -s * 0.5); c.lineTo(s * 0.7, -s * 0.85); c.stroke();
  c.strokeStyle = green ? PAT[1] : CONC[1]; c.beginPath(); c.moveTo(s * 0.9, s * 0.4); c.lineTo(-s * 0.3, s * 0.85); c.stroke();
  if (green && s > 6) r(c, -s * 0.2, -s * 0.2, s * 0.6, s * 0.4, CONC[3]);
  c.restore();
};
export { CONC, PUKE };
