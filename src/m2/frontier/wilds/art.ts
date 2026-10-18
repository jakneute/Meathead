// The frontier wilds, drawn (the prototype first pass: crude but readable, flat colors, a lit and a shaded tone, ink
// outlines, the silhouettes you'd know). It's the PARK's wilderness, and it shows: the mountains are painted flats, the
// boulders are fiberglass (bolts, seams, a STAFF hatch in one), there are bear-proof trash cans and a speaker in a fake
// rock playing birdsong. Behind: the sky by the hour and the painted ranges (kit.ts frontierSky), a far pine forest; in
// the world: the ground (dirt, the grass lip lit: standable reads standable), the ravine, the fake boulders and shelves,
// the hive's tree, the props, the signs, the railroad tracks at the end.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { box, mix, hash, onScreen, frontierSign, frontierSky, INK, type Ctx } from '../kit';
import { GROUND, LEDGES, BOULDERS, SIGNS, HIVES, X, Y, groundH } from './layout';
import { drawShelf } from './hazards';

const DIRT = '#6B4A2A', DIRT_D = '#4A321C', GRASS = '#6E9A42', GRASS_L = '#A8C86A';

// ---------------------------------------------------------------------------------------------------------------
// The backdrop

export const drawWildsBackdrop = (c: Ctx, state: GameState) => {
  frontierSky(c, state);
  // (a far pine forest along the bottom of the painted ranges, scrolling a little faster)
  const off = -((state.camera.x * 0.22) % 48);
  c.fillStyle = '#2A4A30';
  for (let x = off - 48; x < CANVAS_WIDTH + 48; x += 24) {
    const h = 30 + hash(Math.floor((x - off + state.camera.x * 0.22) / 24)) * 26;
    c.beginPath(); c.moveTo(x, 452); c.lineTo(x + 12, 452 - h); c.lineTo(x + 24, 452); c.closePath(); c.fill();
  }
  box(c, 0, 450, CANVAS_WIDTH, 150, '#24402A');
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

const groundRun = (c: Ctx, a: number, b: number, h1: number, h2: number) => {
  const xa = X(a), xb = X(b), ya = Y(h1), yb = Y(h2);
  c.fillStyle = DIRT; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.lineTo(xb, GY + 420); c.lineTo(xa, GY + 420); c.closePath(); c.fill();
  // (strata down the dirt, stones in it)
  for (let k = 1; k < 4; k++) { c.fillStyle = mix(DIRT, DIRT_D, k / 4); c.beginPath(); c.moveTo(xa, ya + k * 30); c.lineTo(xb, yb + k * 30); c.lineTo(xb, yb + k * 30 + 14); c.lineTo(xa, ya + k * 30 + 14); c.closePath(); c.fill(); }
  for (let x = Math.ceil(xa / 40) * 40; x < xb; x += 40) { const t = (x - xa) / Math.max(1, xb - xa), y = ya + (yb - ya) * t; box(c, x + hash(x) * 20, y + 14 + hash(x * 1.3) * 40, 8, 5, '#8A7A60'); }
  // (the grass lip: an ink line, the green, its lit top; tufts)
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
  c.strokeStyle = GRASS; c.lineWidth = 6; c.beginPath(); c.moveTo(xa, ya + 3); c.lineTo(xb, yb + 3); c.stroke();
  c.strokeStyle = GRASS_L; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, ya + 1); c.lineTo(xb, yb + 1); c.stroke();
  for (let x = Math.ceil(xa / 26) * 26; x < xb; x += 26) { const t = (x - xa) / Math.max(1, xb - xa), y = ya + (yb - ya) * t; if (hash(x * 0.7) > 0.5) { box(c, x, y - 4, 2, 4, GRASS); box(c, x + 3, y - 6, 2, 6, GRASS_L); box(c, x + 6, y - 3, 2, 3, GRASS); } }
};

/** A fiberglass boulder: rounded, its seams and bolts, a lit top (standable), a STAFF ONLY hatch in its face. */
const boulder = (c: Ctx, a: number, b: number, h: number) => {
  const xa = X(a), xb = X(b), top = Y(h);
  c.fillStyle = INK; c.beginPath(); c.roundRect(xa - 2, top - 2, xb - xa + 4, GY - top + 6, [26, 26, 0, 0]); c.fill();
  c.fillStyle = '#8E8676'; c.beginPath(); c.roundRect(xa, top, xb - xa, GY - top + 4, [24, 24, 0, 0]); c.fill();
  box(c, xa + (xb - xa) * 0.66, top + 10, (xb - xa) * 0.34 - 4, GY - top - 6, '#6E6858');
  box(c, xa + 8, top + 4, (xb - xa) - 16, 4, '#D8CCAA');
  // (the panel seams, the bolts along them)
  for (const sx of [0.33, 0.66]) { box(c, xa + (xb - xa) * sx, top + 14, 2, GY - top - 14, '#5A5446'); for (let y = top + 30; y < GY; y += 50) box(c, xa + (xb - xa) * sx - 2, y, 6, 6, '#52525B'); }
  box(c, xa + 10, top + 80, xb - xa - 20, 2, '#5A5446');
  // (the hatch: STAFF ONLY on a tiny plate)
  const hx = xa + (xb - xa) * 0.4;
  box(c, hx, GY - 70, 44, 70, '#5A5446'); box(c, hx + 2, GY - 68, 40, 68, '#7A7262'); box(c, hx + 34, GY - 36, 4, 4, '#C8A040');
  box(c, hx + 6, GY - 60, 32, 8, '#A3A3A3'); for (let i = 0; i < 6; i++) box(c, hx + 9 + i * 5, GY - 58, 3, 4, '#3F3F46');
};

/** The ravine: a dark drop between the bluff and the far side (no bottom). Its back wall's top runs from the near
 *  rim to the far rim (each at its own height: nothing of it hangs up in the air over the lower side), and its two
 *  faces go straight down from the rims. */
const ravine = (c: Ctx, a: number, b: number, hA: number, hB: number) => {
  const xa = X(a), xb = X(b), ya = Y(hA), yb = Y(hB), bot = GY + 420;
  // (the back wall, banded darker going down, under the line from rim to rim)
  for (let k = 0; k < 7; k++) {
    const t0 = k * 70, t1 = (k + 1) * 70 + 1;
    c.fillStyle = mix('#3A2C1E', '#050403', k / 6);
    c.beginPath(); c.moveTo(xa, Math.min(bot, ya + t0)); c.lineTo(xb, Math.min(bot, yb + t0)); c.lineTo(xb, Math.min(bot, yb + t1)); c.lineTo(xa, Math.min(bot, ya + t1)); c.closePath(); c.fill();
  }
  // (a few rock ledges on the back wall, following its slope)
  for (let k = 1; k < 4; k++) { const t = k / 4, x = xa + (xb - xa) * t, y = ya + (yb - ya) * t; box(c, x - 30, y + 24 + k * 30, 46, 4, '#4A3A28'); }
  // (its faces, straight down from each rim)
  box(c, xa, ya, 10, bot - ya, '#4A3420'); box(c, xb - 10, yb, 10, bot - yb, '#4A3420');
};

/** A bear-proof trash can (the park's: PACK IT IN, PACK IT OUT, in burned letters on a little plate). */
const trashCan = (c: Ctx, x: number, y: number) => {
  box(c, x - 13, y - 40, 26, 40, INK); box(c, x - 12, y - 39, 24, 39, '#3F5A3A'); box(c, x - 12, y - 39, 5, 39, '#56724E');
  box(c, x - 14, y - 44, 28, 6, '#2A3A28'); box(c, x - 6, y - 42, 12, 2, '#A3A3A3');
  box(c, x - 9, y - 28, 18, 8, '#A0703C'); for (let i = 0; i < 5; i++) box(c, x - 7 + i * 3, y - 26, 2, 4, '#3A2410');
};
/** A fake rock with a speaker grille in it (birdsong, piped in). */
const speakerRock = (c: Ctx, x: number, y: number, f: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 24, 18, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#8E8676'; c.beginPath(); c.ellipse(x, y, 22, 16, 0, Math.PI, 0); c.fill();
  box(c, x - 8, y - 12, 16, 8, '#3F3F46'); for (let i = 0; i < 4; i++) box(c, x - 7 + i * 4, y - 11, 2, 6, '#18181B');
  // (the notes coming out of it)
  if (f % 120 < 60) { box(c, x + 12 + (f % 60) * 0.3, y - 22 - (f % 60) * 0.3, 3, 3, '#F8FAFC'); box(c, x + 15 + (f % 60) * 0.3, y - 30 - (f % 60) * 0.3, 1, 8, '#F8FAFC'); }
};
/** A painted mountain flat stood up close behind: the peak painted on plywood, its brace and sandbag behind it. */
const flat = (c: Ctx, x: number, y: number) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 2, y); c.lineTo(x + 90, y - 190); c.lineTo(x + 182, y); c.closePath(); c.fill();
  c.fillStyle = '#6A7A98'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 90, y - 186); c.lineTo(x + 180, y); c.closePath(); c.fill();
  c.fillStyle = '#F1F5F9'; c.beginPath(); c.moveTo(x + 64, y - 132); c.lineTo(x + 90, y - 186); c.lineTo(x + 116, y - 132); c.lineTo(x + 100, y - 140); c.lineTo(x + 90, y - 128); c.lineTo(x + 78, y - 140); c.closePath(); c.fill();
  // (its raw edge, the brace behind, a sandbag)
  c.strokeStyle = '#C8A070'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 180, y); c.lineTo(x + 90, y - 186); c.stroke();
  c.strokeStyle = '#8A6A40'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 140, y - 80); c.lineTo(x + 196, y); c.stroke();
  box(c, x + 186, y - 10, 22, 10, '#A89070');
};
/** The hive's tree: a big oak-ish trunk with a branch out over the hive's spot. */
const hiveTree = (c: Ctx, hx: number, hy: number, groundY: number) => {
  box(c, hx - 92, hy - 160, 26, groundY - hy + 160, INK); box(c, hx - 90, hy - 160, 22, groundY - hy + 160, '#5A3A1E'); box(c, hx - 90, hy - 160, 6, groundY - hy + 160, '#7A5430');
  c.strokeStyle = INK; c.lineWidth = 12; c.beginPath(); c.moveTo(hx - 80, hy - 70); c.quadraticCurveTo(hx - 30, hy - 40, hx + 20, hy - 30); c.stroke();
  c.strokeStyle = '#5A3A1E'; c.lineWidth = 8; c.stroke();
  for (const [dx, dy, r] of [[-80, -190, 60], [-20, -150, 46], [-130, -150, 44], [20, -60, 30]] as const) { c.fillStyle = INK; c.beginPath(); c.arc(hx + dx, hy + dy, r + 2, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2F5A2A'; c.beginPath(); c.arc(hx + dx, hy + dy, r, 0, Math.PI * 2); c.fill(); c.fillStyle = '#4A7A3A'; c.beginPath(); c.arc(hx + dx - r * 0.3, hy + dy - r * 0.3, r * 0.5, 0, Math.PI * 2); c.fill(); }
};
/** The long river's overhangs: a shelf of fake rock out over the water on its steel strut. */
const overhang = (c: Ctx, a: number, b: number, h: number) => {
  drawShelf(c, X(a), X(b), Y(h), false);
  box(c, X(a) + 10, Y(h) + 16, 6, h + 40, '#52525B'); box(c, X(a) + 10, Y(h) + 16, 2, h + 40, '#A1A1AA');
};
/** The railroad tracks (from the last mile on): ties and two rails, set in the dirt. */
const tracks = (c: Ctx, xa: number, xb: number, y: number) => {
  for (let x = Math.ceil(xa / 24) * 24; x < xb; x += 24) box(c, x, y - 3, 14, 5, '#5A3A1E');
  box(c, xa, y - 6, xb - xa, 3, '#71717A'); box(c, xa, y - 6, xb - xa, 1, '#D4D4D8');
};

/** Props of the park's, along the way: [x, what]. */
const PROPS: [number, 'trash' | 'speaker' | 'flat'][] = [
  [380, 'trash'], [880, 'flat'], [1300, 'speaker'], [3950, 'trash'], [4300, 'flat'], [6000, 'speaker'],
  [9350, 'trash'], [12950, 'speaker'], [13100, 'flat'], [14060, 'trash'], [17850, 'trash'], [18200, 'flat'],
];

export const drawWildsBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // (the painted flats, stood back, first: everything else in front)
  for (const [rx, k] of PROPS) if (k === 'flat' && onScreen(state, X(rx) - 20, X(rx) + 220)) flat(c, X(rx), GY - 4);
  // (the hives' trees)
  for (const [rx, h] of HIVES) if (rx < 10000 && onScreen(state, X(rx) - 220, X(rx) + 120)) hiveTree(c, X(rx), Y(h), GY);
  // (the ground)
  for (const [a, b, h1, h2] of GROUND) { if (h1 < 0 && h2 < 0) continue; if (!onScreen(state, X(a), X(b))) continue; groundRun(c, a, b, h1, h2); }
  if (onScreen(state, X(8500), X(9100))) ravine(c, 8500, 9100, groundH(X(8500)) ?? 300, groundH(X(9100)) ?? 260);
  for (const [a, b, h] of BOULDERS) if (onScreen(state, X(a), X(b))) boulder(c, a, b, h);
  for (const [a, b, h] of LEDGES) {
    if (!onScreen(state, X(a), X(b))) continue;
    if (a >= 15900 && a <= 17000) overhang(c, a, b, h); else drawShelf(c, X(a), X(b), Y(h), false);
  }
  for (const [rx, k] of PROPS) {
    if (k === 'flat' || !onScreen(state, X(rx) - 40, X(rx) + 40)) continue;
    if (k === 'trash') trashCan(c, X(rx), GY); else speakerRock(c, X(rx), GY, f);
  }
  // (the tracks, from the last mile on to the station)
  if (onScreen(state, X(18700), X(21200))) tracks(c, Math.max(X(18700), state.camera.x - 40), Math.min(X(19440), state.camera.x + 840), GY);
  // (the signs)
  for (const [rx, h, words, warn] of SIGNS) if (onScreen(state, X(rx) - 140, X(rx) + 140)) frontierSign(c, X(rx), Y(h), words, { warn, seed: rx, tall: warn ? 80 : 92 });
};
