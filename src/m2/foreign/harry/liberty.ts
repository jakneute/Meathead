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

import { LIB, sy, FIST_W, FIST_H } from './arena';
import { signText } from '../../signLetters';

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
}

const fl = (c: Ctx, col: string, path: () => void, line = 2) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); if (line > 0) { c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); } };
const r = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

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
  r(c, x + 220, top - 20, 80, 300, PAT[4]);
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
  // (the neckline: the robe gathered round the base of her neck)
  fl(c, PAT[3], () => { c.moveTo(x - 70, top - 10); c.quadraticCurveTo(x, top + 26, x + 70, top - 10); c.lineTo(x + 56, top - 16); c.quadraticCurveTo(x, top + 12, x - 56, top - 16); c.closePath(); }, 2);
  c.restore();
  void f;
};

/** Her hair: heavy waves either side of the face, down onto her neck. */
const hair = (c: Ctx, hx: number, hy: number) => {
  for (const s of [-1, 1]) {
    fl(c, PAT[2], () => { c.moveTo(hx + s * 40, hy - 64); c.quadraticCurveTo(hx + s * 86, hy - 40, hx + s * 80, hy + 10); c.quadraticCurveTo(hx + s * 88, hy + 50, hx + s * 64, hy + 84); c.lineTo(hx + s * 44, hy + 70); c.quadraticCurveTo(hx + s * 58, hy + 20, hx + s * 46, hy - 20); c.closePath(); }, 2.5);
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
  // (the face: an oval, the far side shaded, the cheekbones lit)
  const puffed = m === 'gag' ? 1 : 0;
  fl(c, PAT[3], () => c.ellipse(hx, hy + 6, 54 + puffed * 6, 72, 0, 0, Math.PI * 2), 3);
  c.save(); c.beginPath(); c.ellipse(hx, hy + 6, 54 + puffed * 6, 72, 0, 0, Math.PI * 2); c.clip();
  r(c, hx - 60, hy - 70, 16, 150, PAT[2]); r(c, hx - 60, hy - 70, 7, 150, PAT[1]);
  r(c, hx + 30, hy - 40, 16, 70, PAT[4]); r(c, hx + 38, hy - 20, 8, 30, PAT[5]);
  r(c, hx - 50, hy + 60, 100, 20, PAT[2]);
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
  }
  // (the nose: long and straight, its lit side and its shadow)
  fl(c, PAT[4], () => { c.moveTo(hx - 3, hy - 16); c.lineTo(hx - 9, hy + 22); c.quadraticCurveTo(hx, hy + 28, hx + 9, hy + 22); c.lineTo(hx + 3, hy - 16); c.closePath(); }, 2);
  r(c, hx - 7, hy + 4, 4, 16, PAT[2]); r(c, hx + 2, hy - 10, 3, 26, PAT[5]);
  if (m === 'disgust') { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 12, hy + 8); c.lineTo(hx - 6, hy + 4); c.moveTo(hx + 12, hy + 8); c.lineTo(hx + 6, hy + 4); c.stroke(); }
  // (the mouth: by her mood)
  const my = hy + 44;
  if (m === 'puke') {
    fl(c, '#0B1512', () => c.ellipse(hx, my + 4, 22, 18, 0, 0, Math.PI * 2), 3);
    r(c, hx - 14, my - 10, 28, 4, CONC[3]);
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

/** The crown: the band of windows over her brow (the middle window a hole Harry stands in), and its seven rays. */
const crown = (c: Ctx, L: LibLook, hx: number, hy: number) => {
  const broken = L.broken > 0;
  // (the rays, fanned out over her head, off the top of the shot)
  const rays = [-72, -48, -24, 0, 24, 48, 72];
  for (const deg of rays) {
    if (broken && deg <= -24) continue;
    const a = (deg * Math.PI) / 180, bx = hx + Math.sin(a) * 70, by = hy - 70 - Math.cos(a) * 14;
    const len = deg === 0 ? 170 : 150, tx = bx + Math.sin(a) * len, ty = by - Math.cos(a) * len;
    const nx = Math.cos(a) * 11, ny = Math.sin(a) * 11;
    fl(c, PAT[3], () => { c.moveTo(bx - nx, by - ny); c.lineTo(tx, ty); c.lineTo(bx + nx, by + ny); c.closePath(); }, 2.5);
    fl(c, PAT[4], () => { c.moveTo(bx, by); c.lineTo(tx, ty); c.lineTo(bx + nx, by + ny); c.closePath(); }, 0);
    c.strokeStyle = PAT[5]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx + nx * 0.4, by + ny * 0.4); c.lineTo(tx, ty); c.stroke();
  }
  // (the band: a shallow arch over the brow)
  const y0 = hy - 82, y1 = hy - 34;
  fl(c, PAT[3], () => { c.moveTo(hx - 86, y1 + 10); c.quadraticCurveTo(hx, y0 - 16, hx + 86, y1 + 10); c.lineTo(hx + 82, y1 + 20); c.quadraticCurveTo(hx, y1 - 4, hx - 82, y1 + 20); c.closePath(); }, 3);
  r(c, hx - 70, y0 + 4, 140, 3, PAT[5]);
  // (the windows: a row of little dark ones, the middle one big: a room in her crown)
  for (let k = -3; k <= 3; k++) {
    if (k === 0) continue;
    const wx = hx + k * 22, wy = y0 + 18 + Math.abs(k) * 4;
    fl(c, '#0B1512', () => c.roundRect(wx - 6, wy, 12, 14, 4), 1.5);
    r(c, wx - 4, wy + 2, 3, 3, '#1E3A36');
  }
  const W = { x0: hx - 28, x1: hx + 28, y0: hy - 78, y1: hy - 38 };
  fl(c, '#0B1512', () => c.roundRect(W.x0, W.y0, W.x1 - W.x0, W.y1 - W.y0, 10), 2.5);
  // (the light inside, from the room's other windows)
  r(c, W.x0 + 4, W.y0 + 4, W.x1 - W.x0 - 8, 6, '#183A34');
  if (L.crown) { c.save(); c.beginPath(); c.roundRect(W.x0 + 2, W.y0 + 2, W.x1 - W.x0 - 4, W.y1 - W.y0 - 4, 9); c.clip(); L.crown(c); c.restore(); }
  // (the sill under it, lit)
  r(c, W.x0 - 2, W.y1 - 3, W.x1 - W.x0 + 4, 4, PAT[5]);
};

/** The tablet in her left arm: a great slab, tilted, its inscription. */
const tablet = (c: Ctx) => {
  c.save(); c.translate(LIB.x + 190, sy(392)); c.rotate(-0.22);
  fl(c, PAT[3], () => c.rect(-56, -96, 112, 196), 3);
  r(c, -56, -96, 112, 6, PAT[5]); r(c, -56, -96, 6, 196, PAT[4]); r(c, 46, -90, 10, 190, PAT[2]);
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
  fl(c, PAT[3], () => c.rect(32, -22, 100, 16), 2.5);
  r(c, 34, -20, 96, 4, PAT[5]); r(c, 120, -28, 8, 6, PAT[3]);
  fl(c, PAT[2], () => { c.moveTo(-14, -24); c.lineTo(-24, -36); c.lineTo(-16, -38); c.lineTo(-6, -24); c.closePath(); }, 2);
  if (flash) for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#FDE047' : '#F97316'; c.beginPath(); c.arc(140 + i * 14, -14 + (i % 2 ? 8 : -8), 26 - i * 5, 0, Math.PI * 2); c.fill(); }
  c.restore();
  void f;
};

/** The hole the shot blew out of her head (screen left, the far side from the gun): hollow, rebar, chips. */
const hole = (c: Ctx, hx: number, hy: number, f: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, rr = 46 + ((i * 37) % 11) * 2 - (i % 2) * 10; pts.push([hx - 44 + Math.cos(a) * rr, hy - 34 + Math.sin(a) * rr]); }
  fl(c, CONC[1], () => { pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); }, 3);
  // (the hollow inside: darker in, the broken shell's rim lit)
  fl(c, CONC[0], () => c.ellipse(hx - 40, hy - 30, 28, 24, 0, 0, Math.PI * 2), 0);
  c.strokeStyle = CONC[4]; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x + 2, y + 2) : c.moveTo(x + 2, y + 2))); c.closePath(); c.stroke();
  // (rebar sticking out, rusty)
  c.strokeStyle = '#7C2D12'; c.lineWidth = 3;
  for (const [a, l] of [[3.4, 40], [2.6, 30], [4.2, 34]] as const) { c.beginPath(); c.moveTo(hx - 40, hy - 30); c.lineTo(hx - 40 + Math.cos(a) * (60 + l), hy - 30 + Math.sin(a) * (60 + l)); c.stroke(); }
  // (dust still coming off it)
  for (let k = 0; k < 4; k++) { const t = ((f * 0.8 + k * 25) % 100) / 100; c.globalAlpha = 0.5 * (1 - t); c.fillStyle = CONC[4]; c.beginPath(); c.arc(hx - 70 - t * 40, hy - 40 - t * 60, 10 + t * 20, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
};

/** Everything of her but her right arm (and, toppling, that too: `arm` draws it in her frame). */
export const drawLibertyBody = (c: Ctx, L: LibLook, arm?: (c: Ctx) => void) => {
  c.save();
  frame(c, L);
  const hx = LIB.head.x, hy = LIB.head.y;
  robe(c, L.f);
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
  limbStone(c, sh.x, sh.y, ex, ey, 74, true);
  limbStone(c, ex, ey, hx2, hy2, 56, false);
  fl(c, PAT[3], () => c.ellipse(hx2, hy2, 34, 30, 0, 0, Math.PI * 2), 3);
  r(c, hx2 - 22, hy2 - 20, 20, 6, PAT[5]);
  if (L.gun) revolver(c, hx2 - 10, hy2 - 10, Math.PI + 0.08, L.f, L.broken > 0 && L.broken < 5);
  hair(c, hx, hy);
  face(c, L, hx, hy);
  crown(c, L, hx, hy);
  // (his puke on her)
  for (const s of L.stains) {
    fl(c, PUKE[1], () => c.ellipse(hx + s.x, hy + s.y, s.r, s.r * 0.7, 0, 0, Math.PI * 2), 1.5);
    r(c, hx + s.x - s.r * 0.4, hy + s.y - s.r * 0.3, s.r * 0.5, 3, PUKE[3]);
    r(c, hx + s.x - 2, hy + s.y + s.r * 0.5, 4, s.r * 1.3, PUKE[0]);
  }
  if (L.broken > 0) hole(c, hx, hy, L.f);
  if (arm) arm(c);
  c.restore();
};

/** A stone limb: fat, inked, lit along its top; `sleeve`: the robe hanging off it in folds. */
const limbStone = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, sleeve: boolean) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = PAT[3]; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
  const up = ny < 0 ? 1 : -1;
  c.strokeStyle = PAT[5]; c.lineWidth = w * 0.18; c.beginPath(); c.moveTo(x0 + nx * up * w * 0.3, y0 + ny * up * w * 0.3); c.lineTo(x1 + nx * up * w * 0.3, y1 + ny * up * w * 0.3); c.stroke();
  c.strokeStyle = PAT[1]; c.lineWidth = w * 0.16; c.beginPath(); c.moveTo(x0 - nx * up * w * 0.34, y0 - ny * up * w * 0.34); c.lineTo(x1 - nx * up * w * 0.34, y1 - ny * up * w * 0.34); c.stroke();
  if (sleeve) {
    // (the sleeve's folds: hanging straight down off the arm, its hem)
    for (let k = 1; k < 5; k++) {
      const t = k / 5, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t + w * 0.35;
      c.strokeStyle = PAT[2]; c.lineWidth = 4; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 2, py + 26 - k * 3); c.stroke();
    }
  }
};

/** Her right arm: from her shoulder (sunk `dy`) to the fist at (fx, fy) (world), the torch held upright in it.
 *  `glow` (0..1): the windup's tell, the fist going hot. */
export const drawArm = (c: Ctx, L: LibLook, fx: number, fy: number, opts: { torch: boolean; glow?: number; stuck?: number; away?: { x: number; y: number } }) => {
  c.save();
  if (L.shake) c.translate(Math.sin(L.f * 1.7) * L.shake, 0);
  const S = { x: LIB.shR.x, y: LIB.shR.y + L.dy };
  let dx = fx - S.x, dy = fy - S.y, d = Math.hypot(dx, dy) || 1;
  const reach = LIB.upper + LIB.fore - 2;
  if (d > reach) { const k = reach / d; dx *= k; dy *= k; d = reach; }
  const base = Math.atan2(dy, dx), off = Math.acos(Math.max(-1, Math.min(1, (d * d) / (2 * LIB.upper * d))));
  const e1 = base - off, e2 = base + off;
  const E1 = { x: S.x + Math.cos(e1) * LIB.upper, y: S.y + Math.sin(e1) * LIB.upper }, E2 = { x: S.x + Math.cos(e2) * LIB.upper, y: S.y + Math.sin(e2) * LIB.upper };
  // (raised: the elbow out to her side; down: the elbow up over the line; rearing over him: the elbow kept off her face,
  // so the crown's window stays in sight)
  const far = (p: { x: number; y: number }) => (opts.away ? Math.hypot(p.x - opts.away.x, p.y - opts.away.y) : 0);
  const E = opts.away ? (far(E1) > far(E2) ? E1 : E2) : fy < S.y ? (E1.x < E2.x ? E1 : E2) : (E1.y < E2.y ? E1 : E2);
  const hx = S.x + dx, hy = S.y + dy;
  // (the torch: upright in her fist, behind it; the cup and the gold flame over the top)
  if (opts.torch) {
    const top = hy - FIST_H / 2 - 150;
    fl(c, PAT[3], () => c.rect(hx - 14, top + 40, 28, 150), 2.5);
    r(c, hx - 12, top + 40, 6, 150, PAT[5]); r(c, hx + 6, top + 40, 6, 150, PAT[1]);
    for (let k = 0; k < 4; k++) r(c, hx - 14, top + 60 + k * 30, 28, 3, PAT[2]);
    // (the balcony round the cup)
    fl(c, PAT[3], () => { c.moveTo(hx - 44, top + 34); c.lineTo(hx + 44, top + 34); c.lineTo(hx + 30, top + 50); c.lineTo(hx - 30, top + 50); c.closePath(); }, 2.5);
    for (let k = -3; k <= 3; k++) r(c, hx + k * 11 - 1, top + 22, 3, 12, PAT[2]);
    r(c, hx - 44, top + 20, 88, 3, PAT[4]);
    // (the flame: gold leaf, stepped)
    fl(c, GOLD[2], () => { c.moveTo(hx - 30, top + 20); c.quadraticCurveTo(hx - 34, top - 20, hx - 6, top - 46); c.quadraticCurveTo(hx - 10, top - 20, hx + 4, top - 10); c.quadraticCurveTo(hx + 8, top - 40, hx + 22, top - 60); c.quadraticCurveTo(hx + 40, top - 20, hx + 30, top + 20); c.closePath(); }, 2.5);
    fl(c, GOLD[3], () => { c.moveTo(hx - 16, top + 16); c.quadraticCurveTo(hx - 18, top - 6, hx - 4, top - 24); c.quadraticCurveTo(hx + 2, top - 4, hx + 12, top + 16); c.closePath(); }, 0);
    r(c, hx - 6, top - 2, 6, 10, GOLD[4]);
  }
  limbStone(c, S.x, S.y, E.x, E.y, 76, true);
  limbStone(c, E.x, E.y, hx, hy, 60, false);
  // (the fist: a great knuckled block, upright; hot in the windup)
  const fw = FIST_W, fh = FIST_H, x0 = hx - fw / 2, y0 = hy - fh / 2;
  fl(c, PAT[3], () => c.roundRect(x0, y0, fw, fh, 16), 3);
  r(c, x0 + 6, y0 + 6, fw - 12, 8, PAT[5]);
  r(c, x0 + fw - 18, y0 + 10, 12, fh - 18, PAT[2]);
  for (let k = 0; k < 4; k++) {
    const kx = x0 + 14 + k * 24;
    fl(c, PAT[4], () => c.roundRect(kx, y0 + 4, 20, 18, 7), 2);
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(kx + 10, y0 + 22); c.lineTo(kx + 10, y0 + fh - 18); c.stroke();
  }
  // (the thumb across the front)
  fl(c, PAT[4], () => c.roundRect(x0 + 10, y0 + fh - 30, 58, 20, 9), 2);
  r(c, x0 + 14, y0 + fh - 28, 40, 4, PAT[6]);
  if (opts.glow && opts.glow > 0) {
    c.globalAlpha = Math.min(1, opts.glow) * (0.5 + 0.3 * Math.sin(L.f * 0.6));
    c.fillStyle = '#F97316'; c.beginPath(); c.roundRect(x0 - 4, y0 - 4, fw + 8, fh + 8, 18); c.fill();
    c.globalAlpha = 1;
  }
  // (stuck: the lit lip along its top (somewhere to stand), and straining: cracks up the forearm)
  if (opts.stuck !== undefined) {
    r(c, x0 + 4, y0 - 2, fw - 8, 3, '#F2D79A'); r(c, x0 + 4, y0 - 2, fw - 8, 1, '#FFF6D8');
    if (opts.stuck > 0) { c.strokeStyle = INK; c.lineWidth = 2; const k = opts.stuck; c.beginPath(); c.moveTo(hx, hy - fh / 2); c.lineTo(hx - 8 * k, hy - fh / 2 - 30 * k); c.lineTo(hx + 4 * k, hy - fh / 2 - 50 * k); c.stroke(); }
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// After: what's left of her on the floor (the end of the fight, and revisits)

/** The rubble on the floor (concrete chunks and her green shell, a crown ray, a broken nose), around x. */
export const drawRubble = (c: Ctx, x: number, gy: number, f: number) => {
  const chunks: [number, number, number, string][] = [[-150, 22, 16, CONC[3]], [-110, 30, 22, PAT[3]], [-60, 18, 14, CONC[4]], [-20, 26, 20, PAT[2]], [30, 20, 18, CONC[3]], [80, 34, 26, PAT[3]], [140, 16, 12, CONC[4]], [190, 24, 18, PAT[4]]];
  for (const [dx, w, h, col] of chunks) fl(c, col, () => { c.moveTo(x + dx - w, gy); c.lineTo(x + dx - w * 0.6, gy - h); c.lineTo(x + dx + w * 0.3, gy - h * 1.1); c.lineTo(x + dx + w, gy); c.closePath(); }, 2);
  // (a crown ray, broken off, lying)
  fl(c, PAT[3], () => { c.moveTo(x - 40, gy - 2); c.lineTo(x + 70, gy - 12); c.lineTo(x - 40, gy - 22); c.closePath(); }, 2);
  r(c, x - 36, gy - 14, 100, 2, PAT[5]);
  // (her nose)
  fl(c, PAT[4], () => { c.moveTo(x + 110, gy); c.lineTo(x + 116, gy - 30); c.lineTo(x + 128, gy); c.closePath(); }, 2);
  void f;
};
/** The revolver at (x, y) (its grip), turned `a` (0: lying, barrel to the right). */
export const drawRevolverAt = (c: Ctx, x: number, y: number, a: number) => revolver(c, x, y, a, 0, false);
/** Her torch at (x, y) (the cup), turned `a` (0: upright; -PI/2 lying, the flame to the left). Its flame's out. */
export const drawTorchAt = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  fl(c, PAT[3], () => c.rect(-14, 0, 28, 150), 2.5);
  r(c, -12, 0, 6, 150, PAT[5]);
  fl(c, PAT[3], () => { c.moveTo(-44, -6); c.lineTo(44, -6); c.lineTo(30, 10); c.lineTo(-30, 10); c.closePath(); }, 2.5);
  fl(c, GOLD[1], () => { c.moveTo(-30, -6); c.quadraticCurveTo(-34, -40, -6, -60); c.quadraticCurveTo(10, -50, 22, -66); c.quadraticCurveTo(40, -30, 30, -6); c.closePath(); }, 2.5);
  r(c, -10, -30, 8, 12, GOLD[2]);
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
  c.restore();
};
export { CONC, PUKE };
