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

// The wear (the user: "the statue gets more cracked the more often it does it"): each smash shows more of it. Cracks
// running over her copper (inked, a lit edge), chips knocked out of her (the shell gone, her concrete core showing), the
// patina flaking off to bare copper. Laid out once (seeded), shown a share at a time.

const wh = (n: number) => { const s = Math.sin(n * 91.7 + 13.1) * 43758.5; return s - Math.floor(s); };
const AREAS = [
  { x: LIB.head.x, y: LIB.head.y, rx: 70, ry: 80 }, { x: LIB.x - 180, y: sy(380), rx: 90, ry: 60 },
  { x: LIB.x + 170, y: sy(370), rx: 90, ry: 60 }, { x: LIB.x, y: sy(420), rx: 150, ry: 70 }, { x: LIB.head.x, y: LIB.head.y - 95, rx: 110, ry: 30 },
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
  hair(c, hx, hy);
  face(c, L, hx, hy);
  crown(c, L, hx, hy);
  if (L.gun) { leftArm(); revolver(c, hx2 - 10, hy2 - 10, Math.PI + 0.08, L.f, L.broken > 0 && L.broken < 5); }
  // (his puke on her)
  for (const s of L.stains) {
    fl(c, PUKE[1], () => c.ellipse(hx + s.x, hy + s.y, s.r, s.r * 0.7, 0, 0, Math.PI * 2), 1.5);
    r(c, hx + s.x - s.r * 0.4, hy + s.y - s.r * 0.3, s.r * 0.5, 3, PUKE[3]);
    r(c, hx + s.x - 2, hy + s.y + s.r * 0.5, 4, s.r * 1.3, PUKE[0]);
  }
  if (L.wear) wearMarks(c, L.wear);
  if (L.broken > 0) hole(c, hx, hy, L.f);
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
  fl(c, GOLD[2], flame(0.78), 0);
  fl(c, GOLD[3], flame(0.52), 0);
  if (lit) fl(c, GOLD[4], flame(0.28), 0);
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
/**
 * Her right arm, the torch arm: from her shoulder (sunk `dy`) to (fx, fy) (world): her hand, the torch upright in it;
 * or, smashing (`smash` 0..1; the user: "slams it down with the bottom of the torch sticking in the ground"), the
 * torch's BUTT there: driven down handle first like a stake, it stands up out of the floor (`floor`: anything of it
 * under that's hidden), the flame on top, leaning a little back toward her, her fist round the handle above the floor.
 * `glow` (0..1): the windup's tell.
 */
export const drawArm = (c: Ctx, L: LibLook, fx: number, fy: number, opts: { torch: boolean; glow?: number; stuck?: number; away?: { x: number; y: number }; straight?: boolean; smash?: number; floor?: number }) => {
  c.save();
  // (she's at the back: past the arena's end walls she's behind them, never painted over them)
  c.beginPath(); c.rect(ARENA_L, -100000, ARENA_R - ARENA_L, 200000); c.clip();
  const jx = L.shake ? Math.sin(L.f * 1.7) * L.shake : 0;
  if (jx) c.translate(jx, 0);
  const S = { x: LIB.shR.x, y: LIB.shR.y + L.dy };
  let dx = fx - S.x, dy = fy - S.y;
  const d0 = Math.hypot(dx, dy) || 1, reachMax = LIB.upper + LIB.fore - 2;
  if (d0 > reachMax) { const k = reachMax / d0; dx *= k; dy *= k; }
  const T = { x: S.x + dx, y: S.y + dy };
  // (the torch's way: upright, held up; staked in the floor, leaning back toward her shoulder a little)
  const w = opts.torch ? Math.max(0, Math.min(1, opts.smash ?? 0)) : 0;
  const upA = -Math.PI / 2;
  let lean = Math.atan2(S.y - T.y, S.x - T.x) - upA; while (lean > Math.PI) lean -= Math.PI * 2; while (lean < -Math.PI) lean += Math.PI * 2;
  const ta = upA + Math.max(-0.55, Math.min(0.55, lean * 0.35)) * w;
  // (her hand: there, or up the handle from the butt)
  const full = GRIP + HEAD;
  const H = { x: T.x + Math.cos(ta) * BUTT * w, y: T.y + Math.sin(ta) * BUTT * w };
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
  // (the torch first (its handle runs on back behind the fist), then the arm, then her hand round the handle)
  const rot = ta + Math.PI / 2;
  if (opts.torch) {
    c.save();
    // (the butt in the floor: what's under it hidden)
    if (opts.floor !== undefined && w > 0) { c.beginPath(); c.rect(-100000, -100000, 200000, opts.floor + 100000); c.clip(); }
    c.translate(H.x, H.y); c.rotate(rot); c.translate(0, -GRIP); torchArt(c, TORCH_H, true, L.f); c.restore();
    torchFlame = { x: H.x + jx + Math.cos(ta) * full, y: H.y + Math.sin(ta) * full, f: L.f };
  }
  sculptedArm(c, S, E, H, 70);
  c.save(); c.translate(H.x, H.y); c.rotate(rot); fistOnHandle(c, (opts.glow ?? 0) * (0.5 + 0.3 * Math.sin(L.f * 0.6))); c.restore();
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
  c.restore();
};
export { CONC, PUKE };
