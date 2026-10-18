// Sawdust Gulch and the mines, drawn (the prototype first pass: crude but readable: flat colors with a lit and a shaded
// tone, an ink edge, recognizable silhouettes). The PARK's frontier town: plywood false fronts on 2x4 braces (you can
// see the bracing from the side), painted-on windows, fake gold in the assay office's window, a GENERAL STORE that's a
// gift shop, a WILD WEST SHOW sign, guests; then the mill and its pond, the lumber yard, the Mother Lode Mine (a
// fiberglass mountain with its bolts showing outside, real dark inside, lantern-lit: never black) and the log ride's
// queue.
//
// Standable reads standable: every ledge, roof, deck and landing has its lit top lip; the awnings and the painted-on
// balconies of the far fronts are dimmed (they're not to stand on). Impassable reads impassable: the barred saloon
// door and its shutters, the showdown's gates (SHOW IN PROGRESS), the mill's works stacked solid under its deck.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawPerson } from '../../adventure/temple/people';
import { signText } from '../../signLetters';
import { GY } from '../geometry';
import { box, mix, INK, frontierSky, frontierSign, onScreen, hash, burned, painted, type Ctx } from '../kit';
import { townOf } from './state';
import {
  GROUND, LEDGES, SOLIDS, COVER, WATERS, SIGNS, LANTERNS, CANARIES, GAS, SALOON, SQUARE, LADDER, CART_RUN,
  FY, CEIL_Y, X, Y, inMine, inSaloon,
} from './layout';

const LIP = '#E8C890';
const DIRT = '#7A5A38', DIRT_LIP = '#B8935A';
const ROCK = '#3A2A1E', ROCK_LIT = '#5A4430';

// ---------------------------------------------------------------------------------------------------------------
// Little helpers

/** A board with burned letters on it, hung or nailed at its middle (x, y). */
export const board = (c: Ctx, x: number, y: number, lines: string[], col = '#A0703C', big = 2) => {
  const looks = lines.map((_, i) => burned(i ? 1 : big, i));
  const w = Math.max(...lines.map((l, i) => l.length * (i ? 6 : 6 * big) + 16)), h = lines.length > 1 ? 11 + 7 * big + (lines.length - 1) * 12 : 10 + 7 * big;
  box(c, x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, INK); box(c, x - w / 2, y - h / 2, w, h, col); box(c, x - w / 2, y - h / 2, w, 2, mix(col, '#FFFFFF', 0.3));
  let yy = y - h / 2 + 5 + 7 * big;
  lines.forEach((l, i) => { signText(c, l, x, yy, looks[i]); yy += 12; });
};
/** A plank sign painted on (white letters, a dark board). */
const painty = (c: Ctx, x: number, y: number, text: string, col = '#7F1D1D', ink = '#FEF3C7', cell = 1) => {
  const w = text.length * 6 * cell + 14, h = 7 * cell + 10;
  box(c, x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, INK); box(c, x - w / 2, y - h / 2, w, h, col);
  signText(c, text, x, y + (7 * cell) / 2, painted(cell, ink));
};
const ledgeArt = (c: Ctx, x: number, y: number, w: number, col = '#7A5230') => { box(c, x, y, w, 14, INK); box(c, x + 1, y + 1, w - 2, 12, col); box(c, x + 1, y, w - 2, 3, LIP); };
const groundRun = (c: Ctx, a: number, b: number, y: number, under = false) => {
  box(c, a, y, b - a, 1500, under ? ROCK : DIRT);
  box(c, a, y, b - a, 4, under ? ROCK_LIT : DIRT_LIP);
  if (!under) for (let x = a + 30; x < b; x += 70) box(c, x + hash(x) * 20, y + 10 + hash(x * 3) * 12, 18, 3, mix(DIRT, '#000000', 0.15));
};

/** A false front: a plywood store front on 2x4 braces (its sign up top, painted windows, a door, a dimmed awning). */
const falseFront = (c: Ctx, x: number, w: number, h: number, col: string, name: string[], opts: { awning?: string; door?: boolean; win?: number } = {}) => {
  const top = GY - h;
  // (the bracing showing past its edge)
  c.strokeStyle = '#5A4028'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w - 4, top + 20); c.lineTo(x + w + 26, GY); c.stroke();
  box(c, x - 1, top - 1, w + 2, h + 1, INK); box(c, x, top, w, h, col);
  for (let y = top + 6; y < GY; y += 10) box(c, x, y, w, 1, mix(col, '#000000', 0.12));
  // (the stepped parapet up top)
  box(c, x + 8, top - 18, w - 16, 18, INK); box(c, x + 9, top - 17, w - 18, 17, col); box(c, x + 9, top - 17, w - 18, 2, mix(col, '#FFFFFF', 0.25));
  board(c, x + w / 2, top + 14, name, '#E7D8B0', name[0].length > 10 ? 1 : 2);
  const n = opts.win ?? 2;
  for (let i = 0; i < n; i++) { const wx = x + 14 + i * ((w - 28) / n) + 6, wy = top + 40; box(c, wx - 1, wy - 1, 30, 38, INK); box(c, wx, wy, 28, 36, '#2A3A4A'); box(c, wx + 13, wy, 2, 36, INK); box(c, wx, wy + 17, 28, 2, INK); box(c, wx + 2, wy + 2, 8, 2, '#8AA8C0'); }
  if (opts.door !== false) { box(c, x + w / 2 - 15, GY - 62, 30, 62, INK); box(c, x + w / 2 - 14, GY - 61, 28, 61, mix(col, '#000000', 0.45)); box(c, x + w / 2 + 8, GY - 32, 3, 3, '#CA8A04'); }
  if (opts.awning) {
    // (an awning: dimmed, sloped, fringed: not a platform)
    c.globalAlpha = 0.6;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 6, GY - 92); c.lineTo(x + w + 6, GY - 92); c.lineTo(x + w + 14, GY - 76); c.lineTo(x - 14, GY - 76); c.closePath(); c.fill();
    for (let k = 0; k < (w + 28) / 14; k++) { c.fillStyle = k % 2 ? opts.awning : '#E7E5E4'; c.fillRect(x - 13 + k * 14, GY - 90, 14, 13); }
    c.globalAlpha = 1;
  }
  // (the boardwalk in front)
  box(c, x - 6, GY - 6, w + 12, 6, '#7A5230'); for (let k = x - 6; k < x + w + 6; k += 16) box(c, k, GY - 6, 1, 6, INK);
};

/** A guest (a decoration: in a background crowd), feet at (x, y). */
const guest = (c: Ctx, x: number, y: number, seed: number, f: number, pose: 'stand' | 'cheer' | 'photo' | 'point' = 'stand', mood: 'shocked' | 'happy' | 'bored' | 'scared' = 'bored', facing = 1, outfit: 'guest' | 'operator' | 'maint' = 'guest') => {
  c.save(); c.translate(Math.round(x), Math.round(y)); if (facing < 0) c.scale(-1, 1);
  drawPerson(c, { seed, outfit, f, pose, mood });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The backdrop

export const drawTownBackdrop = (c: Ctx, state: GameState) => {
  const cx = state.camera.x + CANVAS_WIDTH / 2, cy = state.camera.y + CANVAS_HEIGHT / 2;
  if (inMine(cx, cy) && cy > GY + 160) { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#140D08'); return true; }
  return frontierSky(c, state);
};

// ---------------------------------------------------------------------------------------------------------------
// The world, behind everything that moves

export const drawTownBack = (c: Ctx, state: GameState, wreck: boolean) => {
  const f = state.frame;
  const on = (a: number, b: number) => onScreen(state, X(a), X(b));
  // ---- the far fronts along the street (behind the ground's lip)
  if (on(-200, 900)) drawEndOfLine(c, state, wreck);
  if (on(500, 2600)) {
    falseFront(c, X(560), 150, 170, '#A0603A', ['GENERAL STORE', 'SOUVENIRS'], { awning: '#B91C1C' });
    // (the window: plush cowboy hats, a SALE tag)
    falseFront(c, X(900), 130, 150, '#5A7A8A', ['ASSAY', 'OFFICE'], { awning: '#1D4ED8' });
    box(c, X(925), GY - 108, 28, 10, '#EAB308'); box(c, X(927), GY - 110, 10, 4, '#FDE047'); painty(c, X(965), GY - 116, 'GOLD! (FAKE)', '#1C1917', '#FDE047');
    falseFront(c, X(1260), 160, 160, '#7A5A8A', ['BANK OF', 'SAWDUST GULCH']);
    falseFront(c, X(1700), 120, 130, '#8A6A3A', ['FUDGE']);
    falseFront(c, X(2030), 140, 150, '#E7E5E4', ['BARBER']);
    // (the barber pole)
    box(c, X(2160), GY - 110, 12, 50, INK); for (let k = 0; k < 5; k++) box(c, X(2161), GY - 109 + ((k * 10 + f * 0.5) % 50), 10, 5, k % 2 ? '#DC2626' : '#1D4ED8');
    falseFront(c, X(2340), 140, 170, '#3F3F46', ['UNDERTAKER', 'COFFINS'], { win: 1 });
    drawCoffin(c, X(2370), GY - 60);
    drawWaterTower(c, X(1910));
    drawWagon(c, X(1550), f);
  }
  // ---- the saloon (outside its front, or opened up while he's in it)
  if (on(2450, 3350)) drawSaloon(c, state);
  // ---- the rooftops' stores
  if (on(3280, 3920)) {
    store(c, X(3300), X(3480), Y(160), '#8A4A3A', 'HOTEL');
    store(c, X(3540), X(3700), Y(200), '#4A6A5A', 'OPERA HOUSE');
    store(c, X(3760), X(3880), Y(150), '#9A7A4A', 'POST');
  }
  // ---- the showdown's street
  if (on(3880, 4720)) drawSquare(c, state);
  // ---- the livery and the smithy
  if (on(4680, 5320)) drawLivery(c, state);
  // ---- the mill pond's banks, the mill, the lumber yard
  if (on(6500, 8100)) drawMill(c, state);
  if (on(7800, 8320)) drawYard(c, state);
  // ---- the mine (outside: the mountain and the entrance; inside: the tunnel's walls)
  if (on(8000, 10700)) drawMine(c, state);
  if (on(10550, 11100)) drawQueue(c, state);
  // ---- the ground
  for (const [a, b, h1] of GROUND) if (on(a, b)) groundRun(c, X(a), X(b), Y(h1), h1 < -100);
  // ---- the water's body (under the logs and him)
  for (const w of WATERS) if (onScreen(state, w.a, w.b)) drawWaterBack(c, w);
  // (the rock dipping into the flooded shaft's water: swim under it)
  if (on(10080, 10250)) {
    box(c, X(10100) - 1, CEIL_Y, X(10230) - X(10100) + 2, FY + 100 - CEIL_Y + 1, INK); box(c, X(10100), CEIL_Y, X(10230) - X(10100), FY + 100 - CEIL_Y, ROCK_LIT);
    for (let y = CEIL_Y + 20; y < FY + 90; y += 30) box(c, X(10110) + hash(y) * 60, y, 30, 6, ROCK);
  }
  // ---- ledges and the solids he stands on
  for (const [a, b, h] of LEDGES) if (on(a - 20, b + 20)) ledgeArt(c, X(a), Y(h), X(b) - X(a), h < 0 ? '#5A3A1E' : '#7A5230');
  for (const s of SOLIDS) drawSolid(c, state, s);
  for (const [a, b, h] of COVER) if (on(a, b)) drawCover(c, X(a), X(b), Y(h));
  // ---- signs
  for (const [rx, h, words, warn] of SIGNS) if (words.length && on(rx - 120, rx + 120)) frontierSign(c, X(rx), Y(h), words, { warn, seed: rx, tall: h < -100 ? 62 : 92 });
  // ---- the canaries in their cages
  for (const [rx, alive] of CANARIES) if (on(rx - 30, rx + 30)) drawCanary(c, X(rx), CEIL_Y + 50, f, alive && townOf(state).gasGone >= 0);
};

// ---------------------------------------------------------------------------------------------------------------
// The pieces

const drawSolid = (c: Ctx, state: GameState, [a, b, h, h2]: [number, number, number, number?]) => {
  const xa = X(a), xb = X(b), top = Y(h), bot = Y(h2 ?? 0);
  if (!onScreen(state, xa, xb)) return;
  // (the mountain, the saloon's walls and roof, the stores, the mill's works: drawn with their own pieces; the bar only
  // from inside)
  if (h >= 330 || h <= -200 || [6800, 3290, 3300, 3540, 3760].includes(a)) return;
  if (a === 2760 && !inSaloon(state.player.pos.x + state.player.width / 2, state.player.pos.y + state.player.height)) return;
  box(c, xa - 1, top - 1, xb - xa + 2, bot - top + 1, INK);
  const col = a === 1480 ? '#6B4423' : a === 4740 ? '#D9B45A' : a === 2760 ? '#5A2A1A' : '#8A6A40';
  box(c, xa, top, xb - xa, bot - top, col);
  box(c, xa, top, xb - xa, 3, LIP);
  if (a === 4740) for (let y = top + 8; y < bot; y += 8) box(c, xa + 2, y, xb - xa - 4, 1, '#B08A3A');
  if (a === 1790) { c.strokeStyle = '#5A3A1E'; c.lineWidth = 2; c.beginPath(); c.moveTo(xa + 2, top + 2); c.lineTo(xb - 2, bot - 2); c.moveTo(xb - 2, top + 2); c.lineTo(xa + 2, bot - 2); c.stroke(); }
};

const drawCover = (c: Ctx, xa: number, xb: number, top: number) => {
  if (xb - xa > 50) {
    // (a water trough)
    box(c, xa - 1, top - 1, xb - xa + 2, GY - top + 1, INK); box(c, xa, top, xb - xa, GY - top, '#6B4423'); box(c, xa, top, xb - xa, 3, LIP);
    box(c, xa + 4, top + 4, xb - xa - 8, 6, '#3A7CA8');
  } else {
    // (barrels)
    box(c, xa - 1, top - 1, xb - xa + 2, GY - top + 1, INK); box(c, xa, top, xb - xa, GY - top, '#8A5A30'); box(c, xa, top, xb - xa, 3, LIP);
    for (const y of [top + 8, GY - 10]) box(c, xa, y, xb - xa, 3, '#52525B');
  }
};

const store = (c: Ctx, xa: number, xb: number, top: number, col: string, name: string) => {
  box(c, xa - 1, top - 1, xb - xa + 2, GY - top + 1, INK); box(c, xa, top, xb - xa, GY - top, col);
  for (let y = top + 8; y < GY; y += 10) box(c, xa, y, xb - xa, 1, mix(col, '#000000', 0.15));
  // (the roof: tar paper, its lit edge: stand on it)
  box(c, xa - 4, top - 4, xb - xa + 8, 6, '#3F3F46'); box(c, xa - 4, top - 4, xb - xa + 8, 2, LIP);
  board(c, (xa + xb) / 2, top + 26, [name], '#E7D8B0', name.length > 8 ? 1 : 2);
  for (let i = 0; i < 2; i++) { const wx = xa + 20 + i * ((xb - xa - 40) / 2), wy = top + 50; if (wy + 30 < GY - 70) { box(c, wx, wy, 26, 30, INK); box(c, wx + 1, wy + 1, 24, 28, '#2A3A4A'); } }
  box(c, (xa + xb) / 2 - 14, GY - 60, 28, 60, INK); box(c, (xa + xb) / 2 - 13, GY - 59, 26, 59, mix(col, '#000000', 0.45));
};

/** The end of the line: the buffer stop (smashed, the engine nosed into it steaming; or rebuilt), the depot, the gawkers. */
const drawEndOfLine = (c: Ctx, state: GameState, wreck: boolean) => {
  const f = state.frame, tw = townOf(state);
  // (the rails, ending)
  box(c, X(-200), GY - 4, 340, 3, '#71717A');
  for (let x = X(-200); x < X(140); x += 22) box(c, x, GY - 2, 12, 3, '#5A3A1E');
  // (the depot behind)
  falseFront(c, X(330), 150, 140, '#7A6A4A', ['SAWDUST GULCH', 'DEPOT'], { door: true });
  // (FIRST AID: the park's own shack, a red cross)
  box(c, X(470), GY - 100, 90, 100, INK); box(c, X(471), GY - 99, 88, 99, '#E7E5E4');
  box(c, X(507), GY - 92, 16, 6, '#DC2626'); box(c, X(512), GY - 97, 6, 16, '#DC2626');
  box(c, X(495), GY - 70, 40, 70, INK); box(c, X(496), GY - 69, 38, 69, wreck && tw.stretcherT > 0 && tw.stretcherT < 320 ? '#1C1917' : '#A8A29E');
  painty(c, X(515), GY - 78, 'FIRST AID', '#DC2626', '#FFFFFF');
  if (wreck) {
    // (the buffer stop, smashed flat; the engine's nose in it: the cowcatcher crumpled, the boiler front stove in, steam)
    const bx = X(130);
    box(c, bx - 10, GY - 30, 24, 30, INK); box(c, bx - 9, GY - 18, 22, 18, '#7F1D1D');
    for (let k = 0; k < 5; k++) box(c, bx + 10 + k * 14, GY - 6 - (k % 2) * 6, 12, 4, '#8A5A30');
    box(c, X(-200), GY - 120, X(110) - X(-200), 84, INK); box(c, X(-200), GY - 118, X(108) - X(-200), 80, '#1C1917');
    box(c, X(-200), GY - 118, X(108) - X(-200), 6, '#3F3F46');
    c.fillStyle = '#27272A'; c.beginPath(); c.moveTo(X(108), GY - 118); c.lineTo(X(124), GY - 104); c.lineTo(X(114), GY - 70); c.lineTo(X(126), GY - 52); c.lineTo(X(108), GY - 38); c.closePath(); c.fill();
    box(c, X(70), GY - 150, 30, 32, INK); box(c, X(72), GY - 148, 26, 30, '#3F3F46');
    c.fillStyle = '#52525B'; c.beginPath(); c.moveTo(X(60), GY - 36); c.lineTo(X(118), GY - 30); c.lineTo(X(96), GY - 4); c.lineTo(X(66), GY - 10); c.closePath(); c.fill();
    box(c, X(108), GY - 100, 10, 10, '#FDE68A');
    for (let k = 0; k < 6; k++) {
      const t = ((f * 0.6 + k * 30) % 180) / 180;
      c.globalAlpha = 0.45 * (1 - t); c.fillStyle = '#E4E4E7';
      c.beginPath(); c.arc(X(80) + k * 9 + t * 30, GY - 150 - t * 160, 14 + t * 30, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    // (the gawkers: guests and staff at the tape)
    box(c, X(170), GY - 50, 260, 2, '#FDE047');
    for (let k = 0; k < 13; k++) box(c, X(172) + k * 20, GY - 50, 10, 2, '#18181B');
    const crowd: [number, number, 'stand' | 'photo' | 'point', 'shocked' | 'scared' | 'happy'][] = [[200, 11, 'photo', 'shocked'], [236, 29, 'point', 'shocked'], [268, 47, 'stand', 'scared'], [300, 63, 'photo', 'happy'], [410, 81, 'stand', 'shocked']];
    for (const [rx, seed, pose, mood] of crowd) guest(c, X(rx), GY - 4, seed, f, pose, mood, -1);
    // (the stretcher, carried off to FIRST AID under a sheet: a conductor's cap on it, two shoes poking out)
    const t = tw.stretcherT;
    if (t > 0 && t < 300) {
      const sx = X(150) + Math.min(t, 280) * 1.2;
      guest(c, sx - 44, GY, 7, f, 'stand', 'bored', 1, 'operator');
      guest(c, sx + 44, GY, 18, f, 'stand', 'bored', 1, 'operator');
      box(c, sx - 40, GY - 42, 80, 6, INK); box(c, sx - 39, GY - 41, 78, 4, '#8A6A40');
      c.fillStyle = INK; c.beginPath(); c.ellipse(sx, GY - 46, 38, 10, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#F5F5F4'; c.beginPath(); c.ellipse(sx, GY - 46, 36, 9, 0, Math.PI, 0); c.fill();
      box(c, sx + 30, GY - 54, 4, 8, '#1C1917'); box(c, sx + 34, GY - 52, 4, 6, '#1C1917');
      box(c, sx - 36, GY - 58, 14, 5, '#1E3A5F'); box(c, sx - 38, GY - 54, 18, 2, '#0F172A');
      for (let k = 0; k < 3; k++) box(c, sx - 10 + k * 9, GY - 50 + (k % 2), 3, 3, '#B91C1C');
    }
  } else {
    // (rebuilt: fresh lumber, a sawhorse, the bill)
    const bx = X(130);
    box(c, bx - 12, GY - 40, 26, 40, INK); box(c, bx - 11, GY - 39, 24, 39, '#D9B45A'); box(c, bx - 11, GY - 26, 24, 6, '#DC2626');
    box(c, X(160), GY - 30, 50, 4, '#FDE047'); box(c, X(164), GY - 26, 4, 26, '#8A5A30'); box(c, X(202), GY - 26, 4, 26, '#8A5A30');
    painty(c, X(185), GY - 46, 'REPAIRS BILLED TO: YOU KNOW WHO', '#1C1917', '#FDE047');
  }
};

/** The undertaker's window: an empty pine coffin, its lid off, a card on it: RESERVED: TUCKER. */
const drawCoffin = (c: Ctx, x: number, top: number) => {
  box(c, x - 4, top - 34, 98, 40, INK); box(c, x - 3, top - 33, 96, 38, '#1C1917');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + 6, top - 4); c.lineTo(x + 20, top - 22); c.lineTo(x + 70, top - 22); c.lineTo(x + 86, top - 4); c.closePath(); c.fill();
  c.fillStyle = '#8A5A30'; c.beginPath(); c.moveTo(x + 8, top - 5); c.lineTo(x + 21, top - 20); c.lineTo(x + 69, top - 20); c.lineTo(x + 84, top - 5); c.closePath(); c.fill();
  box(c, x + 22, top - 18, 46, 10, '#3A2A1A');
  box(c, x + 30, top - 32, 32, 10, '#F5F0DC'); signText(c, 'TUCKER', x + 46, top - 24, painted(1, '#7F1D1D'));
};

const drawWaterTower = (c: Ctx, x: number) => {
  // (legs, X-braced; the tank up top; the catwalk is a ledge (lit))
  for (const lx of [x - 56, x + 56]) { box(c, lx - 4, GY - 150, 8, 150, INK); box(c, lx - 3, GY - 150, 6, 150, '#6B4423'); }
  c.strokeStyle = '#5A3A1E'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 56, GY - 140); c.lineTo(x + 56, GY - 20); c.moveTo(x + 56, GY - 140); c.lineTo(x - 56, GY - 20); c.stroke();
  box(c, x - 52, GY - 280, 104, 128, INK); box(c, x - 50, GY - 278, 100, 124, '#8A5A30');
  for (let y = GY - 270; y < GY - 160; y += 26) box(c, x - 50, y, 100, 3, '#52525B');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 58, GY - 278); c.lineTo(x, GY - 310); c.lineTo(x + 58, GY - 278); c.closePath(); c.fill();
  c.fillStyle = '#5A3A1E'; c.beginPath(); c.moveTo(x - 54, GY - 280); c.lineTo(x, GY - 306); c.lineTo(x + 54, GY - 280); c.closePath(); c.fill();
  signText(c, 'SAWDUST GULCH', x, GY - 210, painted(1, '#F5F0DC'));
};

const drawWagon = (c: Ctx, x: number, f: number) => {
  // (the snake-oil wagon: the bed is a solid; a painted canopy over it (dimmed), DR. PEABODY'S on its side)
  c.globalAlpha = 0.7;
  c.fillStyle = INK; c.beginPath(); c.moveTo(X(1482), GY - 64); c.quadraticCurveTo(x, GY - 190, X(1618), GY - 64); c.closePath(); c.fill();
  c.fillStyle = '#E7D8B0'; c.beginPath(); c.moveTo(X(1486), GY - 66); c.quadraticCurveTo(x, GY - 184, X(1614), GY - 66); c.closePath(); c.fill();
  c.globalAlpha = 1;
  board(c, x, GY - 110, ["DR. PEABODY'S", 'MIRACLE TONIC'], '#7F1D1D', 1);
  for (const wx of [X(1500), X(1600)]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 16, 16, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#A0703C'; c.lineWidth = 2; c.beginPath(); c.arc(wx, GY - 16, 13, 0, Math.PI * 2); c.stroke(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + f * 0; c.beginPath(); c.moveTo(wx, GY - 16); c.lineTo(wx + Math.cos(a) * 13, GY - 16 + Math.sin(a) * 13); c.stroke(); } }
};

/** The saloon: from outside, its front (SALOON up top, batwing doors, the balcony painted on); in it, opened up. */
const drawSaloon = (c: Ctx, state: GameState) => {
  const tw = townOf(state), p = state.player, f = state.frame;
  const inside = inSaloon(p.pos.x + p.width / 2, p.pos.y + p.height);
  const a = SALOON.a, b = SALOON.b, top = Y(346);
  if (!inside) {
    box(c, a - 1, top - 40, b - a + 2, GY - top + 40, INK); box(c, a, top - 38, b - a, GY - top + 38, '#8A4A2A');
    for (let y = top - 30; y < GY; y += 12) box(c, a, y, b - a, 1, '#6A3A1E');
    board(c, (a + b) / 2, top - 6, ['SALOON'], '#E7D8B0', 3);
    for (let i = 0; i < 6; i++) { const wx = a + 60 + i * 120, wy = Y(270); box(c, wx, wy, 40, 50, INK); box(c, wx + 1, wy + 1, 38, 48, '#F2C46A'); box(c, wx + 19, wy, 2, 50, INK); }
    for (let i = 0; i < 6; i++) { const wx = a + 60 + i * 120, wy = Y(120); box(c, wx, wy, 40, 46, INK); box(c, wx + 1, wy + 1, 38, 44, '#F2C46A'); }
    // (the batwing doors at its left end, the upstairs window at its right)
    box(c, a - 2, Y(110), 18, 110, INK); box(c, a, Y(84), 14, 52, '#5A2A1A');
    box(c, b - 12, Y(250), 14, 90, INK); box(c, b - 11, Y(248), 12, 86, tw.saloon.state === 'on' ? '#5A2A1A' : '#F2C46A');
    painty(c, a + 120, Y(150), 'WHISKEY · CARDS · CAN-CAN', '#1C1917', '#FDE047');
  } else {
    // (the room: wallpaper, the bar and its mirror, bottles, the stage's curtain, the piano, lamps; the balcony's rail)
    box(c, a, top, b - a, GY - top, '#5A2A2A');
    for (let x = a + 8; x < b; x += 24) for (let y = top + 20; y < GY - 20; y += 30) box(c, x, y + ((x / 24) % 2) * 15, 3, 6, '#7A3A3A');
    box(c, a + 40, Y(150), 180, 120, INK); box(c, a + 42, Y(148), 176, 116, '#7F1D1D');
    for (let k = 0; k < 6; k++) box(c, a + 44 + k * 29, Y(148), 4, 116, '#991B1B');
    box(c, X(2770), Y(150), 100, 60, INK); box(c, X(2772), Y(148), 96, 56, '#9AB0C0');
    for (let k = 0; k < 9; k++) box(c, X(2774) + k * 10, Y(94), 6, 16, k % 3 ? '#8A5A20' : '#3E7A3A');
    box(c, X(3150), Y(60), 90, 60, INK); box(c, X(3152), Y(58), 86, 46, '#1C1917');
    for (let k = 0; k < 10; k++) box(c, X(3156) + k * 8, Y(40), 6, 10, k % 2 ? '#F5F5F4' : '#1C1917');
    for (const lx of [X(2650), X(2950), X(3200)]) { box(c, lx - 1, top + 16, 2, 30, INK); box(c, lx - 10, top + 46, 20, 10, '#CA8A04'); box(c, lx - 6, top + 48, 12, 6, '#FEF08A'); }
    // (the balcony's rail)
    for (let x = X(3082); x < X(3288); x += 14) box(c, x, Y(194), 3, 34, '#5A2A1A');
    box(c, X(3080), Y(196), X(3290) - X(3080), 4, '#7A3A1E');
    // (the walls and ceiling's edges)
    box(c, a - 8, top, 16, Y(110) - top, '#3A1A10');
    box(c, b - 10, top, 10, Y(250) - top, '#3A1A10'); box(c, b - 10, Y(160), 10, GY - Y(160), '#3A1A10');
    box(c, a, top, b - a, 16, '#3A1A10');
    // (barred: the door's plank across it, the window's shutters)
    if (tw.saloon.state === 'on') {
      box(c, a - 10, Y(110), 20, 110, '#5A2A1A'); for (const y of [Y(90), Y(40)]) { box(c, a - 16, y, 32, 10, INK); box(c, a - 15, y + 1, 30, 8, '#8A5A30'); }
      box(c, b - 14, Y(250), 14, 90, INK); box(c, b - 13, Y(249), 12, 88, '#6B4423'); for (let y = Y(245); y < Y(160); y += 10) box(c, b - 13, y, 12, 2, '#3F2A14');
    } else box(c, b - 10, Y(250), 10, 90, mix('#BFE0F8', '#F2C46A', 0.3));
    void f;
  }
};

const drawSquare = (c: Ctx, state: GameState) => {
  const f = state.frame, tw = townOf(state);
  // (the bleachers behind, packed with guests; the speakers on a pole)
  const bx = X(4280), bw = 220;
  for (let k = 0; k < 4; k++) { box(c, bx + k * 8, GY - 40 - k * 26, bw - k * 16, 8, '#6B4423'); box(c, bx + k * 8, GY - 40 - k * 26, bw - k * 16, 2, '#8A5A30'); }
  box(c, bx, GY - 40, 4, 40, '#3F2A14'); box(c, bx + bw - 4, GY - 40, 4, 40, '#3F2A14');
  const cheer = tw.showdown.state !== 'wait';
  for (let k = 0; k < 4; k++) for (let i = 0; i < 6 - k; i++) {
    const gx = bx + 22 + k * 8 + i * ((bw - k * 16 - 30) / (6 - k)), gy = GY - 40 - k * 26;
    c.save(); c.translate(gx, gy); c.scale(0.7, 0.7);
    drawPerson(c, { seed: k * 13 + i * 7 + 3, outfit: 'guest', f, pose: cheer && (i + k + Math.floor(f / 30)) % 3 === 0 ? 'cheer' : 'stand', mood: cheer ? 'happy' : 'bored' });
    c.restore();
  }
  box(c, X(4400), Y(300), 4, 300 - 160, '#52525B'); box(c, X(4392), Y(300), 20, 14, '#27272A'); box(c, X(4394), Y(298), 6, 10, '#71717A');
  // (the bank and the jail either side, their balconies' rails)
  falseFront(c, X(4100), 180, 190, '#6A5A7A', ['BANK'], { win: 2 });
  falseFront(c, X(4520), 180, 190, '#7A6A5A', ['JAIL', 'SHERIFF'], { win: 2 });
  for (const [a, b] of [[4120, 4260], [4540, 4680]]) for (let x = X(a); x < X(b); x += 14) box(c, x, Y(150), 3, 30, '#5A3A1E');
  board(c, X(4300), Y(330), ['THE SHOWDOWN', 'DAILY. NOBODY GETS HURT.'], '#A0703C', 2);
  // (the gates at the ends: shut while it's on)
  for (const gx of [SQUARE.a - 14, SQUARE.b + 2]) {
    const shut = tw.showdown.state === 'on';
    box(c, gx - 4, GY - 140, 6, 140, '#3F2A14'); box(c, gx + 12, GY - 140, 6, 140, '#3F2A14');
    if (shut) {
      box(c, gx - 6, GY - 140, 26, 140, INK); box(c, gx - 5, GY - 139, 24, 138, '#7A5230');
      for (let y = GY - 130; y < GY; y += 22) box(c, gx - 5, y, 24, 4, '#5A3A1E');
      c.save(); c.translate(gx + 7, GY - 90); c.rotate(-Math.PI / 2); signText(c, 'SHOW IN PROGRESS', 0, 3, painted(1, '#FDE047')); c.restore();
    }
  }
};

const drawLivery = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // (the livery barn: red, the loft door, a horse's rump in a stall (a fiberglass one))
  box(c, X(4720), Y(240), 260, 240, INK); box(c, X(4722), Y(238), 256, 238, '#8A2A1E');
  c.fillStyle = INK; c.beginPath(); c.moveTo(X(4710), Y(240)); c.lineTo(X(4850), Y(300)); c.lineTo(X(4990), Y(240)); c.closePath(); c.fill();
  c.fillStyle = '#6A1E14'; c.beginPath(); c.moveTo(X(4716), Y(242)); c.lineTo(X(4850), Y(296)); c.lineTo(X(4984), Y(242)); c.closePath(); c.fill();
  board(c, X(4850), Y(215), ['LIVERY'], '#E7D8B0', 2);
  box(c, X(4800), Y(110), 100, 110, '#3A1A10');
  box(c, X(4810), Y(70), 50, 34, '#E7E5E4'); box(c, X(4806), Y(62), 8, 30, '#D6D3D1');
  // (the smithy: the forge glowing, the anvil, the chimney)
  box(c, X(5000), Y(170), 180, 170, INK); box(c, X(5002), Y(168), 176, 168, '#5A4A3A');
  board(c, X(5090), Y(148), ['SMITHY'], '#E7D8B0', 2);
  box(c, X(5120), Y(70), 50, 70, '#3F3F46'); box(c, X(5126), Y(40), 38, 20, f % 10 < 5 ? '#F97316' : '#FDBA74');
  box(c, X(5140), Y(250), 18, 80, '#3F3F46');
  box(c, X(5030), Y(36), 40, 12, INK); box(c, X(5032), Y(34), 36, 8, '#52525B'); box(c, X(5044), Y(26), 12, 26, '#3F3F46');
};

const drawMill = (c: Ctx, state: GameState) => {
  const tw = townOf(state);
  // (the mill house: its back wall, its roof (high over the deck), the jack ladder's opening)
  const a = X(6780), b = X(7800), top = Y(470);
  box(c, a, top, b - a, Y(220) - top, '#5A4630');
  for (let x = a; x < b; x += 20) box(c, x, top, 2, Y(220) - top, '#4A3826');
  for (let k = 0; k < 4; k++) { const wx = a + 120 + k * 230; box(c, wx, Y(400), 60, 50, INK); box(c, wx + 1, Y(399), 58, 48, '#8AA8C0'); }
  box(c, a - 20, top - 10, b - a + 40, 14, INK); box(c, a - 18, top - 8, b - a + 36, 10, '#3F3F46');
  board(c, (a + b) / 2, top + 30, ['SAWDUST GULCH', 'LUMBER MILL'], '#E7D8B0', 2);
  board(c, a + 110, Y(320), ['JACK LADDER', 'LOGS UP. PEOPLE NOT ALLOWED.'], '#FDE047', 1);
  // (the works under the deck: stacked lumber, gears, a wall of it: solid)
  const wa = X(6800), wb = X(7780), wt = Y(220);
  box(c, wa - 1, wt, wb - wa + 2, GY - wt, INK); box(c, wa, wt + 1, wb - wa, GY - wt - 1, '#6B4A2A');
  for (let y = wt + 12; y < GY; y += 16) for (let x = wa + ((y / 16) % 2) * 30; x < wb; x += 60) { box(c, x, y, 56, 12, '#8A6A40'); box(c, x, y, 56, 2, '#A88A5A'); }
  for (const gx of [wa + 200, wa + 620]) { c.fillStyle = INK; c.beginPath(); c.arc(gx, wt + 100, 40, 0, Math.PI * 2); c.fill(); c.fillStyle = '#52525B'; c.beginPath(); c.arc(gx, wt + 100, 36, 0, Math.PI * 2); c.fill(); c.save(); c.translate(gx, wt + 100); c.rotate(state.frame * 0.02); for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); box(c, -4, -42, 8, 10, '#52525B'); } c.restore(); }
  // (the deck's lit edge)
  box(c, wa, wt - 2, wb - wa, 3, LIP);
  void tw;
};

const drawYard = (c: Ctx, state: GameState) => {
  void state;
  for (const [rx, n] of [[7880, 4], [8120, 3]] as const) for (let k = 0; k < n; k++) { const y = GY - 16 - k * 16; box(c, X(rx) - 50 + k * 6, y, 100 - k * 12, 16, INK); box(c, X(rx) - 49 + k * 6, y + 1, 98 - k * 12, 14, '#A0703C'); box(c, X(rx) - 49 + k * 6, y + 1, 98 - k * 12, 2, '#C8A070'); }
};

const drawMine = (c: Ctx, state: GameState) => {
  const f = state.frame, tw = townOf(state);
  // (the mountain: fiberglass, its seams and bolts outside; the paint stopping at its back)
  const ma = X(8600), mb = X(10330), mt = Y(420);
  c.fillStyle = INK; c.beginPath(); c.moveTo(ma - 20, GY); c.lineTo(ma - 20, mt + 60); c.lineTo(ma + 200, mt); c.lineTo(ma + 700, mt - 60); c.lineTo(ma + 1200, mt + 10); c.lineTo(mb + 20, mt + 80); c.lineTo(mb + 20, GY); c.closePath(); c.fill();
  c.fillStyle = '#8A6A4A'; c.beginPath(); c.moveTo(ma - 16, GY); c.lineTo(ma - 16, mt + 62); c.lineTo(ma + 200, mt + 4); c.lineTo(ma + 700, mt - 56); c.lineTo(ma + 1200, mt + 14); c.lineTo(mb + 16, mt + 82); c.lineTo(mb + 16, GY); c.closePath(); c.fill();
  for (let x = ma + 60; x < mb; x += 180) { box(c, x, mt + 70 + hash(x) * 60, 2, 140, '#6A4A30'); for (let y = mt + 90; y < GY - 20; y += 50) box(c, x - 3, y, 3, 3, '#A1A1AA'); }
  // (the rock under the ground line, the tunnels cut in it)
  box(c, X(8300), GY + 4, X(10600) - X(8300), 1500, ROCK);
  for (let x = X(8300); x < X(10600); x += 64) for (let y = GY + 20; y < FY + 400; y += 48) box(c, x + hash(x + y) * 30, y + hash(y) * 20, 20, 8, '#2E2016');
  // (the shafts, the tunnel: its back wall, timber sets, the lanterns)
  const cut = (a: number, b: number, y0: number, y1: number) => { box(c, a, y0, b - a, y1 - y0, '#24180F'); for (let x = a + 30; x < b; x += 90) box(c, x + hash(x) * 20, y0 + 20 + hash(x * 7) * (y1 - y0 - 40), 30, 10, '#2C1F14'); };
  cut(X(8300), X(8600), GY - 2, FY);
  cut(X(8600), X(10330), CEIL_Y, FY + 300);
  cut(X(10330), X(10600), GY - 2, FY);
  for (let x = X(8650); x < X(10300); x += 160) {
    if (x > X(10080) && x < X(10250)) continue;
    box(c, x - 6, CEIL_Y, 10, FY - CEIL_Y, '#4A3020'); box(c, x - 30, CEIL_Y, 60, 10, '#5A3A24'); box(c, x - 30, CEIL_Y, 60, 2, '#7A5230');
  }
  // (a side adit at the top of the cart track: where the runaways come from)
  box(c, CART_RUN.b + 10, FY - 90, 60, 90, '#0A0604'); box(c, CART_RUN.b + 6, FY - 96, 68, 8, '#5A3A24');
  for (const [lx, lh] of LANTERNS) {
    const x = X(lx), y = Y(lh);
    if (!onScreen(state, x - 20, x + 20)) continue;
    box(c, x - 1, y - 16, 2, 10, INK); box(c, x - 5, y - 6, 10, 12, INK); box(c, x - 4, y - 5, 8, 10, f % 30 < 2 ? '#FDE68A' : '#FBBF24');
  }
  // (the gas: a sickly haze in the pocket, while it's there)
  if (tw.gasGone === 0) {
    for (let k = 0; k < 9; k++) { c.globalAlpha = 0.16 + 0.05 * Math.sin(f * 0.03 + k); c.fillStyle = k % 2 ? '#BEF264' : '#A3E635'; c.beginPath(); c.ellipse(GAS.a + 20 + k * ((GAS.b - GAS.a - 40) / 8), FY - 70 + Math.sin(f * 0.02 + k * 2) * 20, 40, 60, 0, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  } else if (tw.gasGone > 360) { c.globalAlpha = 0.3; box(c, GAS.a, CEIL_Y, GAS.b - GAS.a, FY - CEIL_Y, '#1C1917'); c.globalAlpha = 1; }
  // (the entrance up top: a timber headframe over the shaft, the tour's sign)
  const ha = X(8300), hb = X(8600);
  box(c, ha - 4, GY - 220, 8, 220, '#5A3A24'); box(c, hb - 4, GY - 220, 8, 220, '#5A3A24');
  c.strokeStyle = '#5A3A24'; c.lineWidth = 4; c.beginPath(); c.moveTo(ha, GY - 220); c.lineTo((ha + hb) / 2, GY - 280); c.lineTo(hb, GY - 220); c.moveTo(ha, GY - 120); c.lineTo(hb, GY - 220); c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc((ha + hb) / 2, GY - 270, 18, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.arc((ha + hb) / 2, GY - 270, 14, 0, Math.PI * 2); c.stroke();
  board(c, (ha + hb) / 2, GY - 190, ['MOTHER LODE MINE'], '#E7D8B0', 2);
  box(c, X(8150), GY - 100, 140, 100, INK); box(c, X(8152), GY - 98, 136, 98, '#6A5A3A'); painty(c, X(8220), GY - 70, 'TOURS: WAIT HERE', '#1C1917', '#FDE047');
};

/** The log ride's queue: switchback rails, guests waiting, the station building's front, the ride's sign. */
const drawQueue = (c: Ctx, state: GameState) => {
  const f = state.frame;
  box(c, X(10820), Y(260), 240, 260, INK); box(c, X(10822), Y(258), 236, 258, '#6B4A2A');
  c.fillStyle = INK; c.beginPath(); c.moveTo(X(10800), Y(260)); c.lineTo(X(10940), Y(330)); c.lineTo(X(11080), Y(260)); c.closePath(); c.fill();
  c.fillStyle = '#4A6A3A'; c.beginPath(); c.moveTo(X(10806), Y(262)); c.lineTo(X(10940), Y(326)); c.lineTo(X(11074), Y(262)); c.closePath(); c.fill();
  board(c, X(10940), Y(230), ['TIMBER TUMBLE'], '#E7D8B0', 2);
  box(c, X(10900), GY - 110, 80, 110, '#1C1917');
  for (const y of [GY - 30, GY - 60]) box(c, X(10620), y, 190, 4, '#A1A1AA');
  for (let x = X(10620); x < X(10810); x += 38) box(c, x, GY - 64, 4, 64, '#71717A');
  painty(c, X(10720), GY - 90, 'WAIT FROM HERE: 90 MIN', '#1C1917', '#FDE047');
  for (let k = 0; k < 6; k++) guest(c, X(10640) + k * 30, GY - 4, 101 + k * 17, f, k % 3 === 1 ? 'point' : 'stand', k % 3 === 1 ? 'shocked' : 'bored', k % 3 === 1 ? -1 : 1);
};

const drawCanary = (c: Ctx, x: number, y: number, f: number, alive: boolean) => {
  box(c, x - 1, CEIL_Y, 2, y - CEIL_Y - 20, INK);
  c.strokeStyle = '#CA8A04'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(x, y - 12, 12, Math.PI, 0); c.stroke();
  for (let k = -10; k <= 10; k += 5) { c.beginPath(); c.moveTo(x + k, y - 12 - Math.sqrt(Math.max(0, 144 - k * k)) + 2); c.lineTo(x + k, y + 6); c.stroke(); }
  box(c, x - 13, y + 6, 26, 3, '#CA8A04');
  if (alive) {
    const hop = f % 40 < 6 ? -2 : 0;
    box(c, x - 5, y - 4 + hop, 9, 7, INK); box(c, x - 4, y - 3 + hop, 7, 5, '#FDE047'); box(c, x + 3, y - 2 + hop, 3, 2, '#F97316');
    if (f % 90 < 30) { box(c, x + 10, y - 22 - (f % 90) / 3, 3, 4, '#FDE047'); box(c, x + 12, y - 26 - (f % 90) / 3, 1, 4, '#FDE047'); }
  } else {
    // (feet up on the cage floor, X eyes)
    box(c, x - 5, y + 1, 9, 5, INK); box(c, x - 4, y + 2, 7, 3, '#FDE047');
    box(c, x - 2, y - 2, 1, 3, '#F97316'); box(c, x + 1, y - 2, 1, 3, '#F97316');
  }
};

const drawWaterBack = (c: Ctx, w: { a: number; b: number; surface: number; bed: number; mine?: boolean }) => {
  const col = w.mine ? '#1E3A4A' : '#3A6A88', deep = w.mine ? '#0A1A24' : '#1E3F56';
  if (!w.mine) { box(c, w.a, GY, w.b - w.a, w.surface - GY, '#5A3E24'); box(c, w.a, GY, w.b - w.a, 2, '#7A9A4A'); }
  const bands = [col, mix(col, deep, 0.35), mix(col, deep, 0.7), deep];
  for (let i = 0; i < bands.length; i++) box(c, w.a, w.surface + (i * (w.bed - w.surface)) / bands.length, w.b - w.a, (w.bed - w.surface) / bands.length + 1, bands[i]);
  box(c, w.a, w.bed, w.b - w.a, 300, '#2A2018');
  // (the steps out: lit lips)
  for (const sx of [w.a, w.b - 50]) { box(c, sx, w.surface + 26, 50, 6, '#6B5A3A'); box(c, sx, w.surface + 26, 50, 2, '#A89060'); }
  // (a sunk ore cart in the sump; a sunk log in the pond)
  if (w.mine) { box(c, w.a + 60, w.bed - 30, 60, 30, '#3F3F46'); box(c, w.a + 60, w.bed - 30, 60, 3, '#71717A'); }
};

/** Over whoever's in it: the water's front, see-through, its lit surface rippling. */
export const drawWaterFront = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    const col = w.mine ? '#1E3A4A' : '#3A6A88';
    const xa = Math.max(w.a, state.camera.x - 40), xb = Math.min(w.b, state.camera.x + 840);
    c.globalAlpha = w.mine ? 0.7 : 0.55;
    box(c, xa, w.surface + 6, xb - xa, w.bed - w.surface - 6, mix(col, '#0A1A24', 0.4));
    c.globalAlpha = 1;
    for (let x = Math.floor((xa - w.a) / 6) * 6 + w.a; x < xb; x += 6) {
      const y = Math.round(w.surface - Math.sin(f * 0.07 + x * 0.04) * 1.5);
      box(c, x, y, 6, 3, mix(col, '#FFFFFF', 0.4)); box(c, x, y + 3, 6, 2, mix(col, '#FFFFFF', 0.15));
    }
  }
};

/** The lit things for the lighting system: the mine's lanterns, the saloon's lamps, the street's, after dark. */
export const townLamps = (state: GameState) => {
  const out = LANTERNS.map(([lx, lh]) => ({ x: X(lx), y: Y(lh), r: 190, a: 0.85, color: '#FFC870' }));
  out.push({ x: X(2650), y: Y(290), r: 220, a: 0.7, color: '#FFD08A' }, { x: X(2950), y: Y(290), r: 220, a: 0.7, color: '#FFD08A' }, { x: X(3200), y: Y(290), r: 220, a: 0.7, color: '#FFD08A' });
  out.push({ x: LADDER.foot, y: Y(120), r: 160, a: 0.5, color: '#FFD08A' });
  return out.filter(l => onScreen(state, l.x - l.r, l.x + l.r));
};
