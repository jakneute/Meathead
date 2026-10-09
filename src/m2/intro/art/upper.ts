// Up top on the way in: the parking garage (the only thing indoors), the deck (the moving walkways under their canopy,
// the security checkpoint, its office, the metal detector), the long stairs down to America USA.
//
// Nearly all of it's still, so it's painted once into stamps (the garage, the deck, the checkpoint and the slab in
// 400-wide chunks, each parked car, the truck, each walkway's glass and steel, the stairs) and put down after with a
// drawImage apiece. What moves is drawn live over them: the walkways' treads, handrails and skirt lights, the one
// fluorescent tube that's on its way out, the office door, the metal detector's light, the camera's light, the flags.

import { X0, R, CEIL_Y, UPPER, STAIRS_END, WALKWAYS, WALKWAY_SPEED, OFFICE_X, DETECTOR_X, GARAGE_END, HALL_END, CHECK_END } from '../geometry';
import { GROUND_Y, CANVAS_HEIGHT } from '../../../m1/constants';
import {
  type Ctx, INK, RED, WHITE, BLUE, box, text, flag, sign, slab, pole, ball, shinyStar, star, eagle, bunting,
  rampOf, lite, dim, hash, checker, bandedGradient, steppedGlow, pixelBlob, tilePattern, brickPattern, stamp,
} from './kit';

/** How far down the floors fill (past the bottom of the screen, so nothing behind ever shows under them). */
const BOTTOM = CANVAS_HEIGHT + 120;
/** The floor's top face (seen from just above), then the slab's cut edge under it. */
const TB = 34, FACE = 24;
const GX0 = X0 - 400, GX1 = R(GARAGE_END);
const CH = 400;

/** The world x range on screen right now (from the camera transform). */
const view = (c: Ctx): [number, number] => {
  const m = c.getTransform(), s = Math.abs(m.a) || 1, l = -m.e / s;
  return [l, l + c.canvas.width / s];
};

/** A long still stretch, stamped in CH-wide chunks (only the ones on screen put down), each painted clipped to itself. */
const chunked = (c: Ctx, key: string, x0: number, x1: number, y: number, h: number, paint: (g: Ctx, a: number, b: number) => void) => {
  const [l, r] = view(c);
  for (let a = x0; a < x1; a += CH) {
    const b = Math.min(x1, a + CH);
    if (b < l - 20 || a > r + 20) continue;
    stamp(c, `${key}:${a}`, a, y, b - a, h, g => { g.save(); g.beginPath(); g.rect(a, y, b - a, h); g.clip(); paint(g, a, b); g.restore(); });
  }
};

/** Concrete aggregate: specks scattered (the same every time) over a box. */
const speckle = (g: Ctx, x: number, y: number, w: number, h: number, cols: string[], n: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const px = x + Math.floor(hash(seed * 0.0137 + i * 1.371) * w / 2) * 2, py = y + Math.floor(hash(seed * 0.0291 + i * 2.713 + 9.1) * h / 2) * 2;
    box(g, px, py, 2, 2, cols[i % cols.length]);
  }
};

/** Yellow-and-black hazard stripes (on a pillar's foot, a curb). */
const hazard = (g: Ctx, x: number, y: number, w: number, h: number) => {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  box(g, x, y, w, h, '#E8B400');
  g.fillStyle = '#1C1A1E';
  for (let s = x - h - 16; s < x + w; s += 16) { g.beginPath(); g.moveTo(s, y + h); g.lineTo(s + 8, y + h); g.lineTo(s + 8 + h, y); g.lineTo(s + h, y); g.closePath(); g.fill(); }
  box(g, x, y, w, 2, 'rgba(255, 255, 255, 0.28)'); box(g, x, y + h - 2, w, 2, 'rgba(0, 0, 0, 0.3)');
  g.restore();
};

/** A diagonal glint across glass (or paint): a slanted band leaning right as it goes up. */
const glint = (g: Ctx, x: number, yTop: number, yBot: number, w: number, col: string) => {
  const k = (yBot - yTop) * 0.5;
  g.fillStyle = col; g.beginPath(); g.moveTo(x, yBot); g.lineTo(x + w, yBot); g.lineTo(x + w + k, yTop); g.lineTo(x + k, yTop); g.closePath(); g.fill();
};

/** A half dome (a lamp's lens), lit upper left. */
const dome = (c: Ctx, x: number, y: number, r: number, col: string) => {
  const rp = rampOf(col);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, Math.PI, 0); c.fill();
  c.fillStyle = rp[1]; c.beginPath(); c.arc(x, y, r, Math.PI, 0); c.fill();
  c.fillStyle = rp[2]; c.beginPath(); c.arc(x - 1, y, r - 1.5, Math.PI, 0); c.fill();
  c.fillStyle = rp[3]; c.beginPath(); c.arc(x - 2, y - 1, r * 0.45, Math.PI, 0); c.fill();
  box(c, x - r * 0.55, y - r * 0.7, 2, 2, rp[4]);
};

// ---------------------------------------------------------------------------------------------------------------
// The garage

const PILLARS: number[] = []; for (let x = X0 - 300; x < GX1 - 60; x += 320) PILLARS.push(x);
const BEAMS: number[] = []; for (let x = GX0 + 30; x < GX1 - 60; x += 200) BEAMS.push(x);
/** The fluorescent fixtures (their left ends), one to a bay between the beams; one of them is on its way out. */
const TUBES = BEAMS.filter(bx => bx + 200 < GX1 - 30).map(bx => bx + 82);
const FLICKER = TUBES.reduce((best, t) => (Math.abs(t - R(700)) < Math.abs(best - R(700)) ? t : best), TUBES[0]);
const VENTS = [R(120), R(500), R(790), R(1380)];
const CARS: [number, string, number][] = [[R(560), '#64748B', 124], [R(820), '#7F1D1D', 112], [R(1240), '#334155', 124]];

const vent = (g: Ctx, x: number, y: number) => {
  checker(g, x + 6, y + 44, 64, 18, 'rgba(20, 16, 12, 0.3)'); box(g, x + 10, y + 44, 56, 6, 'rgba(20, 16, 12, 0.25)');
  slab(g, x, y, 76, 44, '#5E626A');
  box(g, x + 6, y + 6, 64, 32, '#0E1014');
  for (let j = 0; j < 8; j++) { box(g, x + 6, y + 7 + j * 4, 64, 2, '#4A4F57'); box(g, x + 6, y + 7 + j * 4, 64, 1, '#80868F'); }
  for (const [bx, by] of [[x + 3, y + 3], [x + 71, y + 3], [x + 3, y + 39], [x + 71, y + 39]]) { box(g, bx, by, 2, 2, '#2A2E34'); box(g, bx, by, 1, 1, '#A0A6AE'); }
};

const pillar = (g: Ctx, x: number, k: number) => {
  const w = 46, y0 = CEIL_Y - 16, h = UPPER - y0;
  // (its shadow on the wall behind, to the right)
  box(g, x + w, y0, 6, h, 'rgba(0, 0, 0, 0.32)'); checker(g, x + w + 6, y0, 8, h, 'rgba(0, 0, 0, 0.3)');
  box(g, x, y0, w, h, '#5C5C66');
  box(g, x, y0, 6, h, '#7C7C86'); box(g, x + 6, y0, 4, h, '#6C6C76'); checker(g, x + 10, y0, 2, h, '#6C6C76');
  box(g, x + w - 12, y0, 12, h, '#47474F'); box(g, x + w - 5, y0, 5, h, '#36363D'); checker(g, x + w - 14, y0, 2, h, '#47474F');
  box(g, x, y0, 1, h, '#9A9AA4');
  speckle(g, x + 2, y0, w - 4, h, ['#4A4A52', '#76767F', '#3E3E46'], 70, x);
  // (board-form lines, chipped corners, a scrape)
  for (let y = y0 + 14; y < UPPER - 46; y += 14) box(g, x + 1, y, w - 2, 1, 'rgba(0, 0, 0, 0.14)');
  box(g, x, y0 + 120, 3, 6, '#3E3E46'); box(g, x + w - 3, y0 + 64, 3, 5, '#2A2A30');
  checker(g, x + 4, UPPER - 72, 26, 4, 'rgba(180, 30, 30, 0.45)'); box(g, x + 8, UPPER - 71, 14, 1, 'rgba(200, 40, 40, 0.5)');
  // (the painted number: level 3, row A, B, C...)
  const py = y0 + 70;
  box(g, x, py, w, 26, '#E8E4DA'); box(g, x, py, w, 2, '#FFFFFF'); box(g, x + w - 10, py, 10, 26, '#C4C0B6'); checker(g, x + w - 12, py, 2, 26, '#C4C0B6');
  box(g, x, py + 3, w, 3, '#1E3A8A'); box(g, x, py + 20, w, 3, '#B91C1C');
  text(g, `3-${'ABCDEFGH'[k % 8]}`, x + w / 2 - 2, py + 17, '#1E3A8A', 7, 'center', null);
  // (the foot: yellow and black, scuffed by every bumper in the state)
  hazard(g, x, UPPER - 44, w, 44);
  box(g, x, UPPER - 44, 6, 44, 'rgba(255, 255, 255, 0.14)'); box(g, x + w - 10, UPPER - 44, 10, 44, 'rgba(0, 0, 0, 0.28)');
  for (let i = 0; i < 5; i++) box(g, x + 4 + Math.floor(hash(x + i) * 36), UPPER - 40 + Math.floor(hash(x * 2 + i) * 34), 4, 2, '#3E3E46');
  box(g, x - 1, y0, 1, h, INK); box(g, x + w, y0, 1, h, INK);
};

const stairDoor = (g: Ctx, x: number) => {
  const y = UPPER - 104;
  steppedGlow(g, x + 32, y - 22, 34, '#FF4433', 0.22, 0, 4);
  slab(g, x, y, 64, 104, '#6B6F76');
  slab(g, x + 6, y + 6, 52, 98, '#3E5C76');
  // (the wired glass)
  box(g, x + 32, y + 14, 16, 28, INK); box(g, x + 33, y + 15, 14, 26, '#2E4256'); box(g, x + 33, y + 15, 14, 9, '#47627E');
  for (let j = 0; j < 6; j++) box(g, x + 33, y + 17 + j * 4, 14, 1, 'rgba(200, 214, 228, 0.3)');
  for (let j = 0; j < 3; j++) box(g, x + 35 + j * 4, y + 15, 1, 26, 'rgba(200, 214, 228, 0.3)');
  glint(g, x + 34, y + 16, y + 40, 3, 'rgba(255, 255, 255, 0.35)');
  // (the push bar, the kick plate, the closer)
  box(g, x + 10, y + 56, 44, 6, INK); box(g, x + 11, y + 57, 42, 4, '#C8CCD2'); box(g, x + 11, y + 57, 42, 1, '#FFFFFF'); box(g, x + 11, y + 60, 42, 1, '#7A808A');
  box(g, x + 8, y + 86, 48, 16, '#8A9098'); box(g, x + 8, y + 86, 48, 1, '#C8CCD2'); checker(g, x + 8, y + 88, 48, 14, '#7A808A');
  box(g, x + 10, y + 8, 20, 4, '#2A2E34'); box(g, x + 10, y + 8, 20, 1, '#6A707A');
  text(g, 'STAIR B', x + 32, y - 4, '#E8B400', 6, 'center', '#141418');
  // (EXIT, lit)
  box(g, x + 13, y - 32, 38, 16, INK); box(g, x + 14, y - 31, 36, 14, '#2A0A08'); box(g, x + 14, y - 31, 36, 1, '#5A1A14');
  text(g, 'EXIT', x + 32, y - 20, '#FF5A48', 6, 'center', '#6A0E0A');
};

const elevator = (g: Ctx, x: number) => {
  const y = UPPER - 100;
  slab(g, x, y, 76, 100, '#7A7E86');
  for (const lx of [x + 6, x + 38]) {
    box(g, lx, y + 6, 32, 94, '#A8AEB6');
    for (let i = 0; i < 32; i += 2) box(g, lx + i, y + 6, 1, 94, i % 4 ? '#B8BEC6' : '#98A0A8');
    box(g, lx, y + 6, 32, 2, '#D0D6DE'); box(g, lx + 28, y + 6, 4, 94, '#868C96');
    glint(g, lx + 2, y + 10, y + 70, 4, 'rgba(255, 255, 255, 0.28)');
  }
  box(g, x + 37, y + 6, 2, 94, INK);
  box(g, x + 22, y - 16, 32, 12, INK); box(g, x + 23, y - 15, 30, 10, '#1A1008'); text(g, '3', x + 38, y - 6, '#F59E0B', 6, 'center', null);
  slab(g, x + 82, y + 40, 12, 26, '#8A9098'); ball(g, x + 88, y + 48, 2, '#E8E4DA'); ball(g, x + 88, y + 58, 2, '#E8E4DA');
  // (taped across it)
  box(g, x + 4, y + 30, 68, 26, INK); box(g, x + 5, y + 31, 66, 24, '#F4F0E4'); box(g, x + 5, y + 51, 66, 4, '#DCD6C6');
  text(g, 'OUT OF ORDER', x + 38, y + 41, '#B91C1C', 5, 'center', null); text(g, 'SINCE 1776', x + 38, y + 50, '#1A1A1E', 5, 'center', null);
  box(g, x + 2, y + 29, 8, 4, 'rgba(230, 220, 170, 0.8)'); box(g, x + 66, y + 29, 8, 4, 'rgba(230, 220, 170, 0.8)');
};

/** A sign hung off the ceiling on two rods. */
const hungSign = (g: Ctx, x: number, y: number, w: number, h: number, face: string, words: string, ink: string, size = 8) => {
  for (const rx of [x + 14, x + w - 18]) { pole(g, rx, CEIL_Y - 2, 4, y - CEIL_Y - 2, '#8A9098'); box(g, rx - 3, CEIL_Y - 2, 10, 3, INK); box(g, rx - 2, CEIL_Y - 2, 8, 2, '#6A6E76'); }
  sign(g, x, y, w, h, face, words, ink, size);
};

const paintGarage = (g: Ctx, a: number, b: number) => {
  const W = b - a, near = (x0: number, x1: number) => x1 > a - 4 && x0 < b + 4;
  // The ceiling: board-formed concrete, deeper and darker up into it, the boards' lines and ends
  bandedGradient(g, a, -80, W, CEIL_Y - 16 + 80, ['#0C0C10', '#16161B', '#202026', '#2C2C33', '#3A3A42'], 10);
  for (let y = -76, row = 0; y < CEIL_Y - 16; y += 8, row++) {
    box(g, a, y, W, 1, 'rgba(0, 0, 0, 0.32)'); box(g, a, y + 1, W, 1, 'rgba(255, 255, 255, 0.04)');
    for (let x = Math.floor(a / 96) * 96 + (row % 2) * 48; x < b; x += 96) box(g, x, y, 1, 8, 'rgba(0, 0, 0, 0.28)');
  }
  // (the conduit with its junction boxes, the sprinkler main with its heads, hung under it)
  box(g, a, CEIL_Y - 60, W, 3, '#555B64'); box(g, a, CEIL_Y - 60, W, 1, '#8A919C'); box(g, a, CEIL_Y - 57, W, 1, '#24282E');
  for (let x = Math.floor(a / 240) * 240 + 40; x < b; x += 240) slab(g, x, CEIL_Y - 64, 10, 10, '#6B7280');
  for (let x = Math.floor(a / 100) * 100; x < b + 10; x += 100) { box(g, x, CEIL_Y - 80, 1, 32, '#3A3F46'); box(g, x + 50, CEIL_Y - 44, 2, 5, '#9A7A30'); box(g, x + 47, CEIL_Y - 39, 8, 2, '#D8B04A'); box(g, x + 47, CEIL_Y - 39, 8, 1, '#F2D27A'); }
  box(g, a, CEIL_Y - 49, W, 6, '#9B1C1C'); box(g, a, CEIL_Y - 49, W, 1, '#E8705C'); box(g, a, CEIL_Y - 48, W, 1, '#C8352C'); box(g, a, CEIL_Y - 44, W, 1, '#5C0F0F');
  for (let x = Math.floor(a / 300) * 300 + 150; x < b; x += 300) { box(g, x, CEIL_Y - 50, 4, 8, '#7A1414'); box(g, x, CEIL_Y - 50, 1, 8, '#C8352C'); }
  // (the deep beams, end on, each throwing its shadow on the soffit)
  for (const bx of BEAMS) if (near(bx - 10, bx + 50)) {
    const y0 = -80, y1 = CEIL_Y - 16, bw = 36, h = y1 - y0;
    checker(g, bx + bw + 1, y0, 10, h, 'rgba(0, 0, 0, 0.35)');
    box(g, bx, y0, bw, h, '#45454E');
    box(g, bx, y0, 6, h, '#62626C'); checker(g, bx + 6, y0, 2, h, '#62626C');
    box(g, bx + bw - 8, y0, 8, h, '#2E2E35'); checker(g, bx + bw - 10, y0, 2, h, '#2E2E35');
    for (let y = y0 + 6; y < y1; y += 8) box(g, bx + 1, y, bw - 2, 1, 'rgba(0, 0, 0, 0.18)');
    for (let y = y0 + 24; y < y1; y += 40) { box(g, bx + 16, y, 2, 2, '#22222A'); box(g, bx + 16, y + 2, 2, 1, '#6A6A74'); }
    box(g, bx - 1, y0, 1, h, INK); box(g, bx + bw, y0, 1, h, INK);
    // (the light from the tubes catching its foot)
    box(g, bx, y1 - 6, bw, 2, '#5A5A64'); checker(g, bx, y1 - 8, bw, 2, '#5A5A64');
  }
  // (the fluorescent banks: their housings, the tubes, the light they throw)
  for (const tx of TUBES) if (near(tx - 80, tx + 144)) {
    steppedGlow(g, tx + 32, CEIL_Y - 30, 74, '#E6FFF2', 0.16, 0.0, 5);
    box(g, tx + 8, CEIL_Y - 62, 1, 26, '#3A3E44'); box(g, tx + 56, CEIL_Y - 62, 1, 26, '#3A3E44');
    box(g, tx - 2, CEIL_Y - 38, 68, 10, INK); box(g, tx, CEIL_Y - 37, 64, 8, '#3A3E44'); box(g, tx, CEIL_Y - 37, 64, 1, '#6A707A');
    box(g, tx + 2, CEIL_Y - 33, 60, 3, '#EEFFF4'); box(g, tx + 2, CEIL_Y - 33, 60, 1, '#FFFFFF'); box(g, tx + 2, CEIL_Y - 30, 60, 1, '#A8C8B8');
    box(g, tx + 1, CEIL_Y - 33, 2, 3, '#7A808A'); box(g, tx + 61, CEIL_Y - 33, 2, 3, '#7A808A');
  }
  // (the girder along the front, CLEARANCE stenciled on it)
  const gy = CEIL_Y - 16;
  box(g, a, gy, W, 16, '#4E4E57'); box(g, a, gy, W, 2, '#26262C'); box(g, a, gy + 2, W, 3, '#6E6E78'); checker(g, a, gy + 5, W, 2, '#6E6E78');
  box(g, a, gy + 12, W, 4, '#30303A'); checker(g, a, gy + 10, W, 2, '#30303A'); box(g, a, CEIL_Y - 1, W, 1, INK);
  for (let x = Math.floor((a - 200) / 640) * 640 + 200; x < b + 100; x += 640) text(g, 'CLEARANCE 6 FT 8 IN', x, gy + 11, '#E8B400', 5, 'center', '#22222A');

  // The back wall: board-formed concrete, its pours and form ties, water stains down from the ceiling, the level's stripe
  bandedGradient(g, a, CEIL_Y, W, UPPER - CEIL_Y, ['#1E1E24', '#32323A', '#42424B', '#4A4A53', '#46464F', '#383840'], 12);
  for (let y = CEIL_Y + 12; y < UPPER; y += 12) { box(g, a, y, W, 1, 'rgba(0, 0, 0, 0.16)'); box(g, a, y + 1, W, 1, 'rgba(255, 255, 255, 0.04)'); }
  for (let x = Math.floor(a / 240) * 240; x < b; x += 240) { box(g, x, CEIL_Y, 2, UPPER - CEIL_Y, '#24242A'); box(g, x + 2, CEIL_Y, 1, UPPER - CEIL_Y, '#5A5A64'); }
  for (let x = Math.floor(a / 60) * 60 + 30; x < b; x += 60) for (let y = CEIL_Y + 26; y < UPPER - 20; y += 44) { box(g, x, y, 2, 2, '#1C1C22'); box(g, x, y + 2, 2, 1, '#5E5E68'); }
  speckle(g, a, CEIL_Y, W, UPPER - CEIL_Y, ['#55555E', '#2C2C33', '#5E5E68'], Math.floor(W * 0.4), a);
  for (let x = Math.floor(a / 80) * 80; x < b; x += 80) {
    if (hash(x * 0.013) >= 0.45) continue;
    const len = 30 + Math.floor(hash(x * 0.7) * 90);
    box(g, x + 20, CEIL_Y, 8, 10, 'rgba(24, 18, 10, 0.3)'); checker(g, x + 20, CEIL_Y + 10, 8, len, 'rgba(24, 18, 10, 0.32)'); checker(g, x + 22, CEIL_Y, 2, len + 18, 'rgba(24, 18, 10, 0.3)', 1);
  }
  const sy = UPPER - 118;
  box(g, a, sy, W, 12, '#22408E'); box(g, a, sy, W, 2, '#3456A8'); box(g, a, sy + 10, W, 2, '#18306E');
  box(g, a, sy + 13, W, 3, '#D4D4CE'); box(g, a, sy + 17, W, 6, '#A81E1E'); box(g, a, sy + 17, W, 1, '#C8302A');
  for (let x = Math.floor(a / 36) * 36; x < b; x += 36) if (hash(x * 0.31) < 0.3) checker(g, x, sy, 10, 23, '#44444C');
  for (let x = Math.floor((a - 320) / 640) * 640 + 320; x < b + 60; x += 640) text(g, 'LEVEL 3', x, sy - 8, '#8A909C', 8, 'center', '#24242A');
  checker(g, a, UPPER - 24, W, 8, 'rgba(0, 0, 0, 0.2)'); box(g, a, UPPER - 16, W, 16, 'rgba(0, 0, 0, 0.26)'); checker(g, a, UPPER - 6, W, 6, 'rgba(0, 0, 0, 0.2)', 1);

  for (const vx of VENTS) if (near(vx, vx + 80)) vent(g, vx, CEIL_Y + 44);
  if (near(X0 - 250, X0 - 170)) stairDoor(g, X0 - 244);
  if (near(X0 - 150, X0 - 40)) elevator(g, X0 - 150);
  if (near(X0 - 380, X0 - 300)) text(g, '<- NO EXIT. THERE IS ONLY FORWARD.', X0 - 340, UPPER - 136, '#C8CCD2', 5, 'left', '#24242A');
  PILLARS.forEach((px, k) => { if (near(px - 20, px + 60)) pillar(g, px, k); });

  // The signs (hung, or on the wall)
  if (near(R(300), R(520))) hungSign(g, R(300), CEIL_Y + 20, 210, 30, BLUE, 'LEVEL 3: LIBERTY', WHITE);
  if (near(R(1000), R(1340))) hungSign(g, R(1000), CEIL_Y + 20, 330, 30, RED, 'AMERICA USA ->  THIS WAY, PATRIOT', WHITE);
  // (the pay station between the parked cars, its sign up on two posts over it)
  if (near(R(630), R(900))) {
    for (const px of [R(650), R(866)]) { box(g, px - 4, UPPER - 4, 12, 4, INK); pole(g, px, UPPER - 118, 4, 114, '#8A9098'); }
    sign(g, R(640), UPPER - 140, 240, 24, '#FEF3C7', "PARKING: $45. FREEDOM ISN'T FREE.", '#7F1D1D', 6);
    const kx = R(728);
    checker(g, kx + 40, UPPER - 74, 8, 74, 'rgba(0, 0, 0, 0.3)');
    slab(g, kx, UPPER - 78, 40, 78, '#2D4F8E');
    slab(g, kx + 6, UPPER - 70, 28, 18, '#1A2A3A'); box(g, kx + 8, UPPER - 68, 24, 6, '#5ADA8A'); text(g, '$45.00', kx + 20, UPPER - 63, '#0A3A1A', 5, 'center', null);
    box(g, kx + 8, UPPER - 46, 10, 3, INK); box(g, kx + 22, UPPER - 46, 10, 3, INK);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) box(g, kx + 9 + j * 6, UPPER - 38 + i * 5, 4, 3, '#C8CCD2');
    box(g, kx + 6, UPPER - 16, 28, 6, '#141820'); text(g, 'PAY HERE', kx + 20, UPPER - 82, WHITE, 5, 'center', INK);
  }

  // The way out: daylight pouring in at the far end, in steps, and the mouth's last column catching it
  if (near(GX1 - 320, GX1)) {
    for (let i = 0; i < 7; i++) {
      const x = GX1 - 300 + i * 40;
      box(g, x, -80, 40, UPPER + 80, `rgba(255, 236, 190, ${(0.03 + i * 0.035).toFixed(3)})`);
      checker(g, x, -80, 2, UPPER + 80, `rgba(255, 236, 190, ${(0.06 + i * 0.035).toFixed(3)})`);
    }
    const jx = GX1 - 28;
    box(g, jx, -80, 28, UPPER + 80, '#5C5C66');
    box(g, jx, -80, 8, UPPER + 80, '#45454E'); checker(g, jx + 8, -80, 2, UPPER + 80, '#45454E');
    box(g, jx + 18, -80, 10, UPPER + 80, '#B8B4A8'); box(g, jx + 24, -80, 4, UPPER + 80, '#E4DED0'); checker(g, jx + 16, -80, 2, UPPER + 80, '#B8B4A8');
    box(g, jx - 1, -80, 1, UPPER + 80, INK);
    speckle(g, jx, -80, 28, UPPER + 80, ['#4A4A52', '#76767F'], 60, jx);
    hazard(g, jx, UPPER - 44, 28, 44); box(g, jx + 18, UPPER - 44, 10, 44, 'rgba(255, 240, 200, 0.3)');
  }
};

/** A car's side, facing right: a sedan's outline (trunk, cabin, hood). */
const carPath = (g: Ctx, x: number, w: number, base: number) => {
  g.beginPath(); g.moveTo(x + 3, base - 10); g.lineTo(x, base - 22); g.lineTo(x + 3, base - 34); g.lineTo(x + w * 0.24, base - 37);
  g.lineTo(x + w * 0.33, base - 55); g.lineTo(x + w * 0.62, base - 56); g.lineTo(x + w * 0.76, base - 39); g.lineTo(x + w - 5, base - 35);
  g.lineTo(x + w, base - 24); g.lineTo(x + w - 2, base - 10); g.closePath();
};

const wheel = (g: Ctx, x: number, y: number, r: number, rim: string) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#18181C'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2C2C32'; g.beginPath(); g.arc(x - 1, y - 1, r - 2, Math.PI * 0.9, Math.PI * 1.6); g.lineTo(x - 1, y - 1); g.fill();
  for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2; box(g, x + Math.cos(t) * (r - 1.5) - 1, y + Math.sin(t) * (r - 1.5) - 1, 2, 2, '#0A0A0C'); }
  ball(g, x, y, r * 0.55, rim, true);
  for (let i = 0; i < 5; i++) { const t = -Math.PI / 2 + (i / 5) * Math.PI * 2; box(g, x + Math.cos(t) * r * 0.32 - 1, y + Math.sin(t) * r * 0.32 - 1, 2, 2, '#4A4F57'); }
};

const sedan = (g: Ctx, x: number, w: number, col: string) => {
  const r = rampOf(col), base = UPPER;
  checker(g, x - 2, base - 8, w + 4, 8, 'rgba(0, 0, 0, 0.5)'); box(g, x + 8, base - 5, w - 16, 5, 'rgba(0, 0, 0, 0.45)');
  g.save(); carPath(g, x, w, base); g.lineWidth = 4; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); g.fillStyle = col; g.fill(); g.clip();
  box(g, x, base - 60, w, 22, r[2]); box(g, x, base - 57, w, 2, r[4]);
  box(g, x, base - 39, w, 3, r[4]); box(g, x, base - 36, w, 4, r[3]); checker(g, x, base - 32, w, 2, r[3]);
  box(g, x, base - 25, w, 1, r[4]); box(g, x, base - 24, w, 2, r[3]);
  box(g, x, base - 20, w, 10, r[1]); checker(g, x, base - 22, w, 2, r[1]);
  box(g, x, base - 13, w, 4, r[0]); checker(g, x, base - 15, w, 2, r[0]);
  glint(g, x + w * 0.1, base - 38, base - 14, 5, lite(col, 0.3)); glint(g, x + w * 0.1 + 8, base - 38, base - 14, 2, lite(col, 0.45));
  g.restore();
  // (the glass: the greenhouse dark, lit toward its top, a glint or two, the pillar between)
  g.save(); g.beginPath(); g.moveTo(x + w * 0.35, base - 52); g.lineTo(x + w * 0.61, base - 53); g.lineTo(x + w * 0.73, base - 40); g.lineTo(x + w * 0.27, base - 40); g.closePath();
  g.fillStyle = '#22303F'; g.fill(); g.clip();
  box(g, x, base - 56, w, 7, '#4A6A8C'); box(g, x, base - 49, w, 3, '#34506C'); checker(g, x, base - 47, w, 2, '#34506C');
  glint(g, x + w * 0.38, base - 53, base - 40, 4, 'rgba(220, 238, 255, 0.55)'); glint(g, x + w * 0.44, base - 53, base - 40, 2, 'rgba(220, 238, 255, 0.4)');
  glint(g, x + w * 0.6, base - 53, base - 40, 3, 'rgba(220, 238, 255, 0.35)');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x + w * 0.35, base - 52); g.lineTo(x + w * 0.61, base - 53); g.lineTo(x + w * 0.73, base - 40); g.lineTo(x + w * 0.27, base - 40); g.closePath(); g.stroke();
  box(g, x + w * 0.5 - 1, base - 53, 3, 13, r[1]);
  // (door seams, handles, the chrome strip, the mirror, the lights, the bumpers)
  box(g, x + w * 0.5, base - 38, 1, 26, r[0]); box(g, x + w * 0.29, base - 38, 1, 24, r[0]); box(g, x + w * 0.72, base - 38, 1, 24, r[0]);
  for (const hx of [x + w * 0.38, x + w * 0.6]) { box(g, hx, base - 33, 7, 2, '#E4E8EE'); box(g, hx, base - 31, 7, 1, '#6A707A'); }
  box(g, x + 6, base - 27, w - 12, 1, '#E8ECF2');
  box(g, x + w * 0.72, base - 44, 6, 4, INK); box(g, x + w * 0.72 + 1, base - 43, 4, 2, r[3]);
  box(g, x + w - 7, base - 33, 6, 4, '#FFF6C8'); box(g, x + w - 7, base - 33, 6, 1, '#FFFFFF'); box(g, x + w - 4, base - 28, 3, 2, '#F59E0B');
  box(g, x + 1, base - 33, 4, 7, '#D01B28'); box(g, x + 1, base - 33, 4, 2, '#FF7A6A');
  for (const [bx, bw] of [[x - 2, 8], [x + w - 6, 8]] as [number, number][]) { box(g, bx, base - 22, bw, 7, INK); box(g, bx + 1, base - 21, bw - 2, 5, '#C8CCD2'); box(g, bx + 1, base - 21, bw - 2, 1, '#FFFFFF'); box(g, bx + 1, base - 17, bw - 2, 1, '#6A707A'); }
  box(g, x + w * 0.22, base - 66, 1, 28, '#3A3F46');
  // (the wheels in their arches)
  for (const wx of [x + w * 0.2, x + w * 0.8]) {
    g.fillStyle = INK; g.beginPath(); g.arc(wx, base - 11, 14, Math.PI, 0); g.fill();
    wheel(g, wx, base - 11, 11, '#B8BCC4');
  }
};

const truck = (g: Ctx) => {
  const tx = R(110);
  checker(g, tx - 22, UPPER - 8, 262, 8, 'rgba(0, 0, 0, 0.5)'); box(g, tx - 10, UPPER - 5, 240, 5, 'rgba(0, 0, 0, 0.45)');
  g.save(); g.translate(tx, UPPER - 6); g.rotate(-0.03);
  const r = ['#4A0A0A', '#7A1010', '#B91C1C', '#DC3A2E', '#F47A66', '#FFD6CC'];
  // (the lift: frame, the yellow coils)
  box(g, -8, -22, 232, 10, '#141418'); box(g, -8, -22, 232, 1, '#3A3A42');
  for (const wx of [30, 190]) for (let i = 0; i < 4; i++) box(g, wx - 5, -30 + i * 4, 10, 2, i % 2 ? '#A88A10' : '#E8C020');
  const body = () => {
    g.beginPath(); g.moveTo(-14, -20); g.lineTo(-14, -60); g.lineTo(110, -60); g.lineTo(112, -96); g.lineTo(118, -100); g.lineTo(158, -100);
    g.lineTo(178, -66); g.lineTo(222, -62); g.lineTo(230, -52); g.lineTo(230, -20); g.closePath();
  };
  g.save(); body(); g.lineWidth = 4; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); g.fillStyle = r[2]; g.fill(); g.clip();
  box(g, 108, -100, 60, 2, r[5]); box(g, 108, -98, 60, 2, r[4]);
  box(g, -20, -66, 260, 4, r[4]); box(g, -20, -62, 260, 2, r[5]);
  box(g, -20, -60, 260, 6, r[3]); checker(g, -20, -54, 260, 2, r[3]);
  box(g, -20, -36, 260, 1, r[5]); box(g, -20, -35, 260, 2, r[3]);
  box(g, -20, -31, 260, 7, r[1]); checker(g, -20, -33, 260, 2, r[1]);
  box(g, -20, -24, 260, 6, r[0]); checker(g, -20, -26, 260, 2, r[0]);
  // (the shine: long glints down the bed and the door)
  glint(g, 10, -58, -38, 8, r[4]); glint(g, 22, -58, -38, 3, r[5]); glint(g, 70, -58, -38, 4, r[4]);
  glint(g, 124, -64, -38, 6, r[4]); glint(g, 134, -64, -38, 2, r[5]); glint(g, 192, -62, -38, 5, r[4]);
  g.restore();
  // (bed rail cap, tailgate, lights)
  box(g, -15, -64, 126, 5, INK); box(g, -14, -63, 124, 3, '#2A2A30'); box(g, -14, -63, 124, 1, '#5A5A64');
  box(g, -8, -58, 1, 36, r[0]); box(g, -14, -56, 6, 15, '#D01B28'); box(g, -14, -56, 6, 3, '#FF8A78'); box(g, -14, -41, 6, 4, '#F4F4F0');
  box(g, 0, -47, 100, 1, r[1]); box(g, 0, -46, 100, 1, r[4]);
  // (the cab: its window, the door, the mirror)
  g.save(); g.beginPath(); g.moveTo(118, -94); g.lineTo(156, -94); g.lineTo(172, -68); g.lineTo(118, -68); g.closePath(); g.fillStyle = '#1E2C3A'; g.fill(); g.clip();
  box(g, 110, -96, 70, 8, '#4E7092'); box(g, 110, -88, 70, 4, '#36526E'); checker(g, 110, -84, 70, 2, '#36526E');
  glint(g, 124, -94, -68, 5, 'rgba(225, 240, 255, 0.6)'); glint(g, 134, -94, -68, 2, 'rgba(225, 240, 255, 0.45)'); glint(g, 152, -94, -68, 3, 'rgba(225, 240, 255, 0.35)');
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(118, -94); g.lineTo(156, -94); g.lineTo(172, -68); g.lineTo(118, -68); g.closePath(); g.stroke();
  box(g, 136, -94, 3, 26, r[1]);
  box(g, 117, -66, 1, 44, r[0]); box(g, 176, -64, 1, 42, r[0]); box(g, 126, -58, 9, 2, '#E8ECF2'); box(g, 126, -56, 9, 1, '#6A707A');
  box(g, 168, -82, 10, 14, INK); box(g, 169, -81, 8, 12, '#C8CCD2'); box(g, 169, -81, 8, 2, '#FFFFFF'); box(g, 170, -78, 6, 7, '#4E7092');
  eagle(g, 148, -42, 0.3);
  // (the hood scoop, the grille, the lights, the bumpers, the step bar, the exhaust)
  box(g, 190, -65, 22, 3, r[1]); box(g, 190, -65, 22, 1, r[0]);
  box(g, 224, -56, 9, 30, INK); box(g, 225, -55, 7, 28, '#C8CCD2'); for (let i = 0; i < 6; i++) box(g, 225, -52 + i * 4, 7, 2, '#3A3F46'); box(g, 225, -55, 7, 1, '#FFFFFF');
  box(g, 220, -60, 9, 6, '#FFF6C8'); box(g, 220, -60, 9, 2, '#FFFFFF'); box(g, 222, -42, 4, 4, '#F59E0B');
  box(g, -22, -28, 12, 12, INK); box(g, -21, -27, 10, 10, '#C8CCD2'); box(g, -21, -27, 10, 2, '#FFFFFF'); box(g, -21, -19, 10, 2, '#6A707A');
  box(g, 226, -28, 14, 12, INK); box(g, 227, -27, 12, 10, '#C8CCD2'); box(g, 227, -27, 12, 2, '#FFFFFF'); box(g, 227, -19, 12, 2, '#6A707A');
  box(g, 50, -22, 116, 6, INK); box(g, 51, -21, 114, 4, '#C8CCD2'); box(g, 51, -21, 114, 1, '#FFFFFF'); box(g, 51, -18, 114, 1, '#6A707A');
  box(g, -24, -16, 10, 4, INK); box(g, -23, -15, 8, 2, '#D8DCE2');
  // (the bumper stickers: a little flag, USA #1)
  box(g, -2, -34, 18, 11, INK); for (let i = 0; i < 5; i++) box(g, -1, -33 + i * 2, 16, 1, i % 2 ? '#F1EFEA' : '#C81E1E'); box(g, -1, -33, 7, 5, '#1E3A8A'); box(g, 1, -32, 1, 1, '#FFFFFF'); box(g, 3, -31, 1, 1, '#FFFFFF');
  box(g, 18, -34, 40, 11, INK); box(g, 19, -33, 38, 9, '#F4F2EC'); text(g, 'USA #1', 38, -25, '#B91C1C', 5, 'center', null);
  // (the antenna, a little flag on it)
  box(g, 172, -134, 1, 34, '#9AA0AA'); box(g, 173, -134, 11, 7, INK); box(g, 174, -133, 9, 5, '#C81E1E'); box(g, 174, -131, 9, 1, '#F1EFEA'); box(g, 174, -133, 4, 3, '#1E3A8A');
  // (the fender flares, the big wheels with chrome, a star on each hub)
  for (const wx of [30, 190]) {
    g.fillStyle = INK; g.beginPath(); g.arc(wx, -12, 23, Math.PI, 0); g.fill();
    g.strokeStyle = '#232328'; g.lineWidth = 4; g.beginPath(); g.arc(wx, -12, 24, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
    g.strokeStyle = '#4A4A54'; g.lineWidth = 1; g.beginPath(); g.arc(wx, -12, 26, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
    wheel(g, wx, -12, 17, '#D8DCE2');
    shinyStar(g, wx, -12, 3, WHITE);
  }
  // (specular pings)
  for (const [px, py] of [[2, -64], [150, -99], [204, -63], [-18, -26], [230, -26], [60, -21]]) { box(g, px, py, 2, 2, '#FFFFFF'); box(g, px - 2, py + 0.5, 6, 1, 'rgba(255, 255, 255, 0.6)'); }
  g.restore();
};

/** The truck now (see intro/index truckNow): dx from where it ends up, a bounce, frames since it hit (< 0: not yet). */
export interface TruckNow { dx: number; dy: number; crash: number; f: number; emerging: boolean }

/** What the pillar and the truck's front look like after: the pillar cratered and cracked, rebar showing; the hood
 * crumpled up like an accordion and popped, the grille stove in, a headlight smashed; steam coming off it, forever. */
const wreck = (c: Ctx, tr: TruckNow) => {
  const T = tr.crash, P = R(340);
  // (the pillar: the crater, the cracks running up it, the rebar)
  box(c, P - 1, UPPER - 74, 30, 44, INK); box(c, P, UPPER - 72, 28, 40, '#3A3A42'); checker(c, P, UPPER - 72, 28, 40, '#2A2A30');
  for (const [x, y, w] of [[P + 4, UPPER - 66, 8], [P + 14, UPPER - 58, 10], [P + 6, UPPER - 46, 12]]) { box(c, x, y, w, 4, '#5C5C66'); box(c, x, y, w, 1, '#7C7C86'); }
  box(c, P + 2, UPPER - 64, 26, 2, '#8A3A1A'); box(c, P + 4, UPPER - 50, 24, 2, '#7A2E14');
  c.strokeStyle = INK; c.lineWidth = 1;
  for (const [x1, y1, x2, y2, x3, y3] of [[P + 20, UPPER - 74, P + 26, UPPER - 104, P + 22, UPPER - 140], [P + 10, UPPER - 74, P + 4, UPPER - 96, P + 9, UPPER - 118], [P + 28, UPPER - 50, P + 40, UPPER - 62, P + 44, UPPER - 90]]) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.stroke();
  }
  // (the truck's front, crumpled: in its own coordinates, like the stamp)
  c.save(); c.translate(R(110) + Math.round(tr.dx), UPPER - 6 + Math.round(tr.dy)); c.rotate(-0.03);
  c.fillStyle = INK; c.beginPath(); c.moveTo(184, -64); c.lineTo(214, -80); c.lineTo(234, -64); c.closePath(); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(188, -64); c.lineTo(214, -77); c.lineTo(230, -64); c.closePath(); c.fill();
  box(c, 196, -72, 18, 2, '#F47A66');
  for (let i = 0; i < 4; i++) { const x = 206 + i * 6; box(c, x, -62, 2, 38, INK); box(c, x + 2, -62, 2, 38, '#DC3A2E'); box(c, x - 2, -62, 2, 38, '#7A1010'); }
  box(c, 224, -58, 12, 32, INK); box(c, 225, -56, 9, 28, '#3A3F46'); box(c, 226, -50, 6, 2, '#C8CCD2'); box(c, 228, -40, 5, 2, '#C8CCD2');
  box(c, 218, -61, 12, 8, INK); box(c, 219, -60, 10, 6, '#2A2E34'); box(c, 220, -59, 3, 2, '#FFF6C8'); box(c, 225, -57, 2, 2, '#FFFFFF');
  box(c, 222, -30, 18, 6, INK); box(c, 223, -29, 16, 4, '#9AA0A8');
  c.restore();
  // (steam off the radiator, rising; a lot at first, never quite stopping)
  const sx = R(330) + tr.dx, sy = UPPER - 78;
  const n = T < 200 ? 7 : 3;
  for (let k = 0; k < n; k++) {
    const age = (tr.f * 1.3 + k * (120 / n)) % 120;
    const a = (T < 200 ? 0.6 : 0.3) * (1 - age / 120);
    pixelBlob(c, sx + Math.sin((tr.f + k * 40) * 0.05) * 6 + age * 0.15, sy - age * 0.9, 5 + age * 0.12, 4 + age * 0.1, `rgba(232, 236, 240, ${a.toFixed(2)})`);
  }
  // (the bits: chunks of the pillar and glass, thrown out, come to rest on the floor)
  for (let k = 0; k < 10; k++) {
    const vx = -1.5 + hash(k) * 5, vy = -2 - hash(k * 3) * 4, g = 0.35, y0 = UPPER - 56;
    const land = (-vy + Math.sqrt(vy * vy + 2 * g * (UPPER - 3 - y0))) / g, tt = Math.min(Math.max(T, 0), land);
    const x = P + 20 + vx * tt, y = y0 + vy * tt + 0.5 * g * tt * tt;
    if (k < 6) { box(c, x - 1, y - 1, 5, 4, INK); box(c, x, y, 3, 2, '#7C7C86'); }
    else { box(c, x, y, 2, 2, '#BFE0FF'); box(c, x, y, 1, 1, '#FFFFFF'); }
  }
  // (a hubcap, off the front wheel, rolling away to the guard's feet, wobbling down flat there)
  const roll = Math.min(Math.max(T, 0), 70), hx = R(300) + 5 * roll - 0.036 * roll * roll, hy = UPPER - 9;
  if (T < 70) {
    const spin = roll * 0.4;
    c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#D8DCE2'; c.beginPath(); c.arc(hx, hy, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9AA0A8'; c.beginPath(); c.arc(hx, hy, 4, 0, Math.PI * 2); c.fill();
    for (let i = 0; i < 5; i++) { const an = spin + (i / 5) * Math.PI * 2; box(c, hx + Math.cos(an) * 6, hy + Math.sin(an) * 6, 2, 2, '#FFFFFF'); }
  } else {
    const w = Math.max(0, 1 - (T - 70) / 22), ry = 2 + 7 * w * Math.abs(Math.cos((T - 70) * 0.6));
    c.fillStyle = INK; c.beginPath(); c.ellipse(hx, UPPER - ry - 1, 9, ry + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#D8DCE2'; c.beginPath(); c.ellipse(hx, UPPER - ry - 1, 8, ry, 0, 0, Math.PI * 2); c.fill();
    box(c, hx - 4, UPPER - ry - 2, 8, 1, '#FFFFFF');
  }
};

/** In front of him while he climbs out of the window: the truck's door again (so it's in front of his legs). */
export const truckDoorFront = (c: Ctx, tr: TruckNow) => {
  c.save();
  c.beginPath(); c.rect(R(110) + 112, UPPER - 72, 72, 66); c.clip();
  c.translate(Math.round(tr.dx), Math.round(tr.dy));
  stamp(c, 'm2u-truck', R(110) - 40, UPPER - 150, 300, 152, truck);
  c.restore();
};

export const garage = (c: Ctx, vis: (a: number, b: number) => boolean, tr: TruckNow) => {
  chunked(c, 'm2u-gar', GX0, GX1, -80, UPPER + 80, paintGarage);
  for (const [x, col, w] of CARS) if (vis(x - 10, x + w + 10)) stamp(c, `m2u-car:${x}`, x - 8, UPPER - 72, w + 16, 74, g => sedan(g, x, w, col));
  if (vis(R(60) + tr.dx, R(380) + tr.dx)) {
    // (coming in: dust kicked up behind it, speed lines)
    if (tr.crash < 0) for (let k = 0; k < 6; k++) {
      const age = (tr.f * 2 + k * 7) % 28, x = R(70) + tr.dx - age * 3 - k * 6;
      pixelBlob(c, x, UPPER - 8 - age * 0.4, 6 + age * 0.3, 4 + age * 0.15, `rgba(150, 146, 140, ${(0.5 * (1 - age / 28)).toFixed(2)})`);
      box(c, R(40) + tr.dx - k * 30 - (tr.f * 9) % 30, UPPER - 30 - k * 14, 26, 2, 'rgba(255, 255, 255, 0.5)');
    }
    c.save(); c.translate(Math.round(tr.dx), Math.round(tr.dy));
    stamp(c, 'm2u-truck', R(110) - 40, UPPER - 150, 300, 152, truck);
    c.restore();
    if (tr.crash >= 0) wreck(c, tr);
  }
  // (the tube on its way out: off, on, off...)
  if (vis(FLICKER - 80, FLICKER + 144) && typeof performance !== 'undefined') {
    const now = performance.now(), t = Math.floor(now / 70);
    const off = hash(t * 0.37) < 0.3 || (Math.floor(now / 1700) % 3 === 0 && hash(t * 1.7) < 0.75);
    if (off) {
      steppedGlow(c, FLICKER + 32, CEIL_Y - 30, 74, '#0A0A0E', 0.14, 0.0, 5);
      box(c, FLICKER + 2, CEIL_Y - 33, 60, 3, '#4E5A54'); box(c, FLICKER + 2, CEIL_Y - 33, 60, 1, '#6A766E');
      box(c, FLICKER + 2, CEIL_Y - 33, 6, 3, '#E8A0B4'); box(c, FLICKER + 56, CEIL_Y - 33, 6, 3, '#C88094');
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The deck: the walkways' canopy and its ads; the checkpoint

const ADS: [string, string, string][] = [
  ['AMERICA USA', 'NOW 20% MORE AMERICA', BLUE],
  ['FREEDOM FRIES', 'TWO FOR $19.99', RED],
  ['HAPPY LAND', 'THE HAPPIEST LAND IN THE LAND', '#7C3AED'],
  ['EAGLE DOGS', '100% AMERICAN MEAT. PROBABLY.', '#B45309'],
  ['THE STAR-SPANGLED', 'SPLASH ZONE: OPENS 2031', '#0E7490'],
  ['BE A PATRIOT', 'BUY A SOUVENIR', RED],
];

/** An ad on a post: the I-beam post, the spot lamps on their arms, the steel frame (no lit top: nothing to stand on), the poster in its paper sheets. */
const billboard = (g: Ctx, x: number, y: number, t1: string, t2: string, col: string) => {
  const post = dim('#7A808A');
  pole(g, x + 102, y + 100, 14, UPPER - y - 100, post);
  box(g, x + 96, UPPER - 6, 26, 6, dim('#5A606A')); box(g, x + 96, UPPER - 6, 26, 1, dim('#8A909A'));
  for (const lx of [x + 40, x + 170]) {
    box(g, lx, y - 22, 2, 18, dim('#5A606A'));
    box(g, lx - 6, y - 26, 14, 7, INK); box(g, lx - 5, y - 25, 12, 5, dim('#8A909A')); box(g, lx - 4, y - 21, 10, 2, '#FFF4C8');
  }
  box(g, x - 7, y - 7, 234, 110, INK);
  box(g, x - 6, y - 6, 232, 108, dim('#3A3F48')); box(g, x - 6, y + 99, 232, 3, dim('#4A505A')); box(g, x - 6, y - 6, 2, 108, dim('#4A505A'));
  bandedGradient(g, x, y, 220, 96, [lite(col, 0.18), col, rampOf(col)[1]], 6);
  // (stripes top and bottom, stars, the words)
  box(g, x, y, 220, 8, '#C02020'); box(g, x, y, 220, 2, '#E4483A'); box(g, x, y + 6, 220, 2, '#8E1414');
  box(g, x, y + 88, 220, 8, '#1E3A8A'); box(g, x, y + 88, 220, 2, '#2D51B0'); box(g, x, y + 94, 220, 2, '#14205C');
  shinyStar(g, x + 20, y + 30, 9, WHITE); shinyStar(g, x + 200, y + 30, 9, WHITE);
  text(g, t1, x + 110, y + 42, WHITE, 10); text(g, t2, x + 110, y + 68, '#FEF9C3', 6);
  // (the paper: sheet seams, the sun on it, a corner peeling)
  for (let sx = x + 55; sx < x + 220; sx += 55) box(g, sx, y + 8, 1, 80, 'rgba(0, 0, 0, 0.12)');
  glint(g, x + 10, y + 8, y + 88, 10, 'rgba(255, 255, 255, 0.08)'); glint(g, x + 130, y + 8, y + 88, 6, 'rgba(255, 255, 255, 0.07)');
  g.fillStyle = '#E8E2D4'; g.beginPath(); g.moveTo(x + 220, y + 74); g.lineTo(x + 220, y + 88); g.lineTo(x + 206, y + 88); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0, 0, 0, 0.25)'; g.beginPath(); g.moveTo(x + 206, y + 88); g.lineTo(x + 220, y + 74); g.lineTo(x + 212, y + 88); g.closePath(); g.fill();
  // (a little haze over the lot: it's background, not a ledge)
  box(g, x - 7, y - 7, 234, 110, 'rgba(58, 74, 120, 0.1)');
};

const paintDeck = (g: Ctx, a: number, b: number) => {
  const A = GX1, B = R(HALL_END), W = b - a, near = (x0: number, x1: number) => x1 > a - 4 && x0 < b + 4;
  // The guard rail along the back (dimmed: it's the edge, not a ledge)
  for (let x = Math.floor(a / 60) * 60; x < b + 60; x += 60) if (x > A && x < B) pole(g, x, UPPER - 40, 4, 40, dim('#9AA2AC'), false);
  box(g, a, UPPER - 43, W, 4, dim('#A8B0BA')); box(g, a, UPPER - 43, W, 1, dim('#C8D0DA')); box(g, a, UPPER - 39, W, 1, dim('#4A525C'));
  box(g, a, UPPER - 22, W, 2, dim('#8A929C')); box(g, a, UPPER - 20, W, 1, dim('#4A525C'));
  // The canopy's posts
  for (let x = A + 100; x < B; x += 300) if (near(x - 20, x + 30)) {
    pole(g, x, CEIL_Y - 4, 8, UPPER - CEIL_Y + 4, dim('#8A9099'));
    box(g, x - 5, UPPER - 5, 18, 5, dim('#5A606A')); box(g, x - 5, UPPER - 5, 18, 1, dim('#9AA0AA'));
    g.fillStyle = dim('#5A606A'); g.beginPath(); g.moveTo(x - 14, CEIL_Y + 2); g.lineTo(x + 22, CEIL_Y + 2); g.lineTo(x + 4, CEIL_Y + 22); g.closePath(); g.fill();
  }
  // The ads on their posts
  ADS.forEach(([t1, t2, col], i) => { const x = A + 130 + i * 360; if (near(x - 10, x + 230)) billboard(g, x, CEIL_Y + 30, t1, t2, col); });
  // MIND YOUR STEP (on two little posts, at the first walkway)
  if (near(R(1550), R(1720))) {
    for (const px of [R(1566), R(1700)]) pole(g, px, UPPER - 90, 4, 90, dim('#9AA0AA'));
    sign(g, R(1560), UPPER - 110, 150, 22, '#FDE047', 'MIND YOUR STEP', INK, 7);
  }
  // The canopy: a long striped awning way up (dimmed: it's a shade), scalloped along its edge
  const top = CEIL_Y - 30;
  box(g, a, top - 3, W, 3, dim('#3A3F48'));
  for (let x = Math.floor((a - A) / 30) * 30 + A; x < b; x += 30) {
    const red = Math.floor((x - A) / 30) % 2 === 1, rp = rampOf(dim(red ? '#C03030' : '#ECE8DE'));
    box(g, x, top, 30, 24, rp[2]); box(g, x, top, 30, 4, rp[3]); checker(g, x, top + 4, 30, 2, rp[3]);
    box(g, x, top + 18, 30, 6, rp[1]); checker(g, x, top + 16, 30, 2, rp[1]); box(g, x, top, 1, 24, rp[0]);
    g.fillStyle = dim(INK); g.beginPath(); g.ellipse(x + 15, top + 24, 15, 10, 0, 0, Math.PI); g.fill();
    g.fillStyle = rp[1]; g.beginPath(); g.ellipse(x + 15, top + 24, 14, 8, 0, 0, Math.PI); g.fill();
    g.fillStyle = rp[2]; g.beginPath(); g.ellipse(x + 14, top + 24, 11, 5, 0, 0, Math.PI); g.fill();
  }
  box(g, a, top + 22, W, 2, dim('#2A2F38'));
};

const stanchion = (g: Ctx, x: number) => {
  box(g, x - 7, UPPER - 4, 16, 4, INK); box(g, x - 6, UPPER - 4, 14, 3, '#A8AEB6'); box(g, x - 6, UPPER - 4, 14, 1, '#E4E8EE');
  pole(g, x, UPPER - 38, 3, 34, '#C8CCD2');
  ball(g, x + 1.5, UPPER - 40, 3, '#D8DCE2');
};

const paintCheck = (g: Ctx) => {
  const A = R(HALL_END), T0 = A + 60, T1 = A + 660, PK = A + 360, EAVE = UPPER - 190, PEAK = UPPER - 232;
  // The guard rail goes on behind
  for (let x = Math.floor(A / 60) * 60 + 60; x < R(CHECK_END); x += 60) pole(g, x, UPPER - 40, 4, 40, dim('#9AA2AC'), false);
  box(g, A, UPPER - 43, R(CHECK_END) - A, 4, dim('#A8B0BA')); box(g, A, UPPER - 43, R(CHECK_END) - A, 1, dim('#C8D0DA'));
  box(g, A, UPPER - 22, R(CHECK_END) - A, 2, dim('#8A929C'));
  // The tent: the shade under it, the guy ropes, the poles in their sandbags, its rolled-up sides
  box(g, T0, EAVE + 14, T1 - T0, UPPER - EAVE - 14, 'rgba(16, 24, 52, 0.2)'); checker(g, T0, EAVE + 14, T1 - T0, 4, 'rgba(16, 24, 52, 0.2)');
  g.strokeStyle = '#D8D0B8'; g.lineWidth = 1;
  for (const [x0, x1] of [[T0 + 2, T0 - 54], [T0 + 2, T0 - 30]]) { g.beginPath(); g.moveTo(x0, EAVE + 6); g.lineTo(x1, UPPER - 2); g.stroke(); box(g, x1 - 2, UPPER - 6, 4, 6, '#8A6A3A'); }
  for (const px of [A + 70, PK - 2, A + 646]) {
    pole(g, px, EAVE + 14, 5, UPPER - EAVE - 14, '#C8CCD2');
    box(g, px - 8, UPPER - 10, 20, 10, INK); box(g, px - 7, UPPER - 9, 18, 9, '#8A7448'); box(g, px - 7, UPPER - 9, 18, 2, '#B09868'); box(g, px - 3, UPPER - 6, 10, 2, '#5A4A2A');
  }
  box(g, T0, EAVE + 14, T1 - T0, 10, INK); box(g, T0, EAVE + 15, T1 - T0, 8, '#E4E6EA'); box(g, T0, EAVE + 15, T1 - T0, 2, '#FFFFFF'); box(g, T0, EAVE + 21, T1 - T0, 2, '#B8BCC4');
  for (let x = T0 + 20; x < T1; x += 60) box(g, x, EAVE + 14, 3, 12, '#9A7A50');
  // (the roof: lit on the left slope, shaded on the right, seamed, a pennant on its peak)
  g.fillStyle = INK; g.beginPath(); g.moveTo(T0 - 8, EAVE + 2); g.lineTo(PK, PEAK - 2); g.lineTo(T1 + 8, EAVE + 2); g.closePath(); g.fill();
  g.fillStyle = '#F2F4F6'; g.beginPath(); g.moveTo(T0 - 6, EAVE); g.lineTo(PK, PEAK); g.lineTo(PK, EAVE); g.closePath(); g.fill();
  g.fillStyle = '#C8CDD4'; g.beginPath(); g.moveTo(PK, PEAK); g.lineTo(T1 + 6, EAVE); g.lineTo(PK, EAVE); g.closePath(); g.fill();
  checker(g, PK, PEAK + 4, 4, EAVE - PEAK - 4, '#F2F4F6');
  for (let i = 1; i < 6; i++) {
    g.strokeStyle = 'rgba(120, 128, 140, 0.55)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(PK, PEAK); g.lineTo(PK - (PK - T0 + 6) * (i / 6), EAVE); g.stroke();
    g.beginPath(); g.moveTo(PK, PEAK); g.lineTo(PK + (T1 + 6 - PK) * (i / 6), EAVE); g.stroke();
  }
  box(g, T0 - 6, EAVE - 4, T1 - T0 + 12, 4, 'rgba(120, 128, 140, 0.35)');
  // (the valance: red and white scallops)
  box(g, T0 - 6, EAVE, T1 - T0 + 12, 6, '#E4E6EA'); box(g, T0 - 6, EAVE, T1 - T0 + 12, 1, '#FFFFFF');
  for (let i = 0, x = T0 - 6; x < T1 + 6; x += 30, i++) {
    const rp = i % 2 ? ['#7A1010', '#A01818', '#C8281E', '#E05040'] : ['#9AA0A8', '#C8CCD2', '#ECEEF0', '#FFFFFF'];
    box(g, x, EAVE + 4, 30, 6, rp[2]); box(g, x, EAVE + 4, 30, 1, rp[3]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + 15, EAVE + 10, 15, 9, 0, 0, Math.PI); g.fill();
    g.fillStyle = rp[1]; g.beginPath(); g.ellipse(x + 15, EAVE + 10, 14, 8, 0, 0, Math.PI); g.fill();
    g.fillStyle = rp[2]; g.beginPath(); g.ellipse(x + 14, EAVE + 10, 11, 5, 0, 0, Math.PI); g.fill();
  }
  // (the signs: SECURITY CHECKPOINT on the ridge, ALL BAGS hung inside)
  for (const px of [A + 230, A + 490]) pole(g, px, UPPER - 236, 5, 26, '#8A9098');
  sign(g, A + 200, UPPER - 260, 320, 26, BLUE, 'SECURITY CHECKPOINT', WHITE, 9);
  shinyStar(g, A + 214, UPPER - 247, 6, '#F1EFEA'); shinyStar(g, A + 506, UPPER - 247, 6, '#F1EFEA');
  for (const px of [A + 220, A + 500]) box(g, px, EAVE + 24, 1, UPPER - 150 - EAVE - 28, '#6A707A');
  sign(g, A + 190, UPPER - 150, 340, 20, '#FEF3C7', 'ALL BAGS SUBJECT TO PATRIOTISM', '#7F1D1D', 7);
  bunting(g, T0 + 4, PK - 6, EAVE + 28, 12); bunting(g, PK + 6, T1 - 4, EAVE + 28, 12);
  // Stanchions, sagging blue belts between
  for (const sx of [A + 8, A + 34, A + 60, A + 86]) stanchion(g, sx);
  g.strokeStyle = INK; g.lineWidth = 4;
  for (const [x0, x1] of [[A + 9, A + 35], [A + 35, A + 61], [A + 61, A + 87]]) { g.beginPath(); g.moveTo(x0, UPPER - 34); g.quadraticCurveTo((x0 + x1) / 2, UPPER - 26, x1, UPPER - 34); g.stroke(); }
  g.strokeStyle = '#2D51B0'; g.lineWidth = 2;
  for (const [x0, x1] of [[A + 9, A + 35], [A + 35, A + 61], [A + 61, A + 87]]) { g.beginPath(); g.moveTo(x0, UPPER - 34); g.quadraticCurveTo((x0 + x1) / 2, UPPER - 26, x1, UPPER - 34); g.stroke(); }
  // The bag table: a star-spangled cloth, the gray bins (a shoe, a belt, a hot dog)
  const tb0 = A + 120, tb1 = A + 310;
  box(g, tb0, UPPER - 40, tb1 - tb0, 36, INK); box(g, tb0 + 1, UPPER - 39, tb1 - tb0 - 2, 35, '#1E3A8A');
  box(g, tb0 + 1, UPPER - 39, tb1 - tb0 - 2, 3, '#4570D0'); box(g, tb0 + 1, UPPER - 8, tb1 - tb0 - 2, 4, '#B91C1C'); box(g, tb0 + 1, UPPER - 8, tb1 - tb0 - 2, 1, '#E04A3A');
  for (let x = tb0 + 10, i = 0; x < tb1 - 6; x += 20, i++) star(g, x, UPPER - 26 + (i % 2) * 8, 3, '#DAD7D2');
  for (let x = tb0 + 18; x < tb1; x += 34) box(g, x, UPPER - 36, 2, 28, 'rgba(10, 18, 54, 0.35)');
  box(g, tb0, UPPER - 4, tb1 - tb0, 4, 'rgba(0, 0, 0, 0.35)');
  const bin = (x: number) => { box(g, x, UPPER - 54, 40, 15, INK); box(g, x + 1, UPPER - 53, 38, 13, '#9AA0A8'); box(g, x + 1, UPPER - 53, 38, 2, '#C8CCD2'); box(g, x + 3, UPPER - 51, 34, 3, '#4A4F57'); box(g, x + 1, UPPER - 43, 38, 2, '#7A808A'); };
  bin(tb0 + 8); bin(tb0 + 60); bin(tb0 + 120);
  box(g, tb0 + 14, UPPER - 58, 18, 6, INK); box(g, tb0 + 15, UPPER - 57, 16, 4, '#6A3A1A'); box(g, tb0 + 15, UPPER - 57, 10, 1, '#9A6A3A');
  box(g, tb0 + 66, UPPER - 56, 28, 3, '#3A2414'); box(g, tb0 + 84, UPPER - 57, 6, 5, '#E8B400');
  box(g, tb0 + 128, UPPER - 59, 24, 7, INK); box(g, tb0 + 129, UPPER - 58, 22, 5, '#D8A050'); box(g, tb0 + 131, UPPER - 58, 18, 3, '#B8402A'); box(g, tb0 + 131, UPPER - 58, 18, 1, '#E8C020');
  // The x-ray: the belt on its rollers, the tunnel with its lead curtain, the monitor
  const xr = A + 380;
  box(g, xr, UPPER - 46, 150, 8, INK); box(g, xr + 1, UPPER - 45, 148, 3, '#2A2A30'); box(g, xr + 1, UPPER - 45, 148, 1, '#5A5A64'); box(g, xr + 1, UPPER - 42, 148, 3, '#8A9098');
  for (let x = xr + 4; x < xr + 148; x += 10) ball(g, x, UPPER - 40, 1.5, '#B8BCC4', false);
  for (const lx of [xr + 8, xr + 138]) pole(g, lx, UPPER - 38, 4, 38, '#7A808A');
  slab(g, xr + 30, UPPER - 92, 92, 48, '#C8CCD2');
  box(g, xr + 30, UPPER - 72, 92, 6, '#1E3A8A'); box(g, xr + 30, UPPER - 66, 92, 2, '#B91C1C');
  box(g, xr + 34, UPPER - 62, 22, 16, '#14141A'); for (let i = 0; i < 5; i++) box(g, xr + 35 + i * 4, UPPER - 62, 3, 16, i % 2 ? '#3A3A44' : '#2A2A32');
  text(g, 'X-RAY', xr + 92, UPPER - 79, '#1E3A8A', 6, 'center', null);
  box(g, xr + 104, UPPER - 62, 12, 8, INK); box(g, xr + 105, UPPER - 61, 10, 6, '#E8B400'); box(g, xr + 109, UPPER - 59, 2, 2, INK);
  pole(g, xr + 140, UPPER - 96, 4, 50, '#7A808A');
  box(g, xr + 124, UPPER - 122, 40, 30, INK); box(g, xr + 125, UPPER - 121, 38, 28, '#3A3F46'); box(g, xr + 128, UPPER - 118, 32, 22, '#14306A');
  g.strokeStyle = '#7AE0F0'; g.lineWidth = 1; g.strokeRect(xr + 133.5, UPPER - 112.5, 22, 13);
  box(g, xr + 138, UPPER - 108, 12, 4, '#E8A040'); box(g, xr + 141, UPPER - 104, 6, 1, '#7AE0F0');
  box(g, xr + 128, UPPER - 118, 32, 1, 'rgba(255, 255, 255, 0.3)'); glint(g, xr + 130, UPPER - 117, UPPER - 97, 3, 'rgba(255, 255, 255, 0.15)');

  // The security office: a portable building on blocks, lap siding, a window with blinds (and somebody looking out), its door
  const ox = R(OFFICE_X), L = ox - 120, top = UPPER - 150;
  box(g, L - 6, UPPER - 4, 252, 4, 'rgba(0, 0, 0, 0.35)');
  for (let x = L + 4; x < L + 236; x += 26) { box(g, x, UPPER - 10, 20, 10, INK); box(g, x + 1, UPPER - 9, 18, 9, '#8A8A86'); box(g, x + 1, UPPER - 9, 18, 2, '#B4B4AE'); box(g, x + 6, UPPER - 6, 8, 4, '#4A4A48'); }
  box(g, L, UPPER - 10, 240, 2, 'rgba(0, 0, 0, 0.5)');
  g.fillStyle = tilePattern(g, 'm2u-siding', 8, 10, t => {
    t.fillStyle = '#D4CCBA'; t.fillRect(0, 0, 8, 10); t.fillStyle = '#E8E2D4'; t.fillRect(0, 0, 8, 2);
    t.fillStyle = '#BCB3A0'; t.fillRect(0, 6, 8, 3); t.fillStyle = '#867E6E'; t.fillRect(0, 9, 8, 1); t.fillStyle = '#C8C0AE'; t.fillRect(2, 3, 1, 1); t.fillRect(6, 4, 1, 1);
  });
  g.fillRect(L, top, 240, 140);
  box(g, L + 200, top, 40, 140, 'rgba(60, 44, 24, 0.12)'); box(g, L + 222, top, 18, 140, 'rgba(60, 44, 24, 0.14)'); checker(g, L + 198, top, 2, 140, 'rgba(60, 44, 24, 0.12)');
  box(g, L, top, 240, 10, 'rgba(40, 30, 20, 0.25)'); checker(g, L, top + 10, 240, 4, 'rgba(40, 30, 20, 0.2)');
  for (const cx of [L, L + 232]) { box(g, cx, top, 8, 140, '#3A4658'); box(g, cx, top, 2, 140, '#5A6A80'); box(g, cx + 6, top, 2, 140, '#24303E'); }
  g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(L + 1, top + 1, 238, 139);
  box(g, L - 6, top - 8, 252, 10, INK); box(g, L - 5, top - 7, 250, 7, '#4A5568'); box(g, L - 5, top - 7, 250, 1, '#3A4352'); box(g, L - 5, top - 2, 250, 1, '#2A3240');
  pole(g, L + 30, top - 30, 2, 22, '#8A9098', false); box(g, L + 26, top - 32, 10, 2, '#8A9098');
  // (the window)
  const wx = ox - 104, wy = UPPER - 120;
  box(g, wx - 4, wy - 4, 78, 58, INK); box(g, wx - 3, wy - 3, 76, 56, '#F0ECE2'); box(g, wx - 3, wy - 3, 76, 1, '#FFFFFF'); box(g, wx - 3, wy + 50, 76, 3, '#B8B0A0');
  box(g, wx, wy, 70, 50, '#2A3A50');
  for (let y = wy; y < wy + 50; y += 4) { if (y === wy + 20) continue; box(g, wx, y, 70, 3, '#E4DFD2'); box(g, wx, y + 2, 70, 1, '#A8A090'); }
  box(g, wx + 30, wy + 20, 20, 4, '#14181E'); box(g, wx + 34, wy + 21, 3, 2, '#FFFFFF'); box(g, wx + 43, wy + 21, 3, 2, '#FFFFFF'); box(g, wx + 35, wy + 22, 1, 1, INK); box(g, wx + 44, wy + 22, 1, 1, INK);
  box(g, wx + 34, wy + 19, 2, 2, '#A8A090'); box(g, wx + 44, wy + 19, 2, 2, '#A8A090');
  box(g, wx + 34, wy, 2, 50, '#F0ECE2'); box(g, wx + 66, wy, 1, 44, '#E8E2D4');
  glint(g, wx + 4, wy + 2, wy + 48, 5, 'rgba(255, 255, 255, 0.22)'); glint(g, wx + 14, wy + 2, wy + 48, 2, 'rgba(255, 255, 255, 0.18)');
  box(g, wx - 6, wy + 52, 82, 4, INK); box(g, wx - 5, wy + 52, 80, 3, '#E8E2D4');
  sign(g, ox - 30, UPPER - 142, 132, 18, RED, 'SECURITY OFFICE', WHITE, 6);
  // (the door's frame, the step up to it)
  box(g, ox - 28, UPPER - 106, 68, 100, INK); box(g, ox - 27, UPPER - 105, 66, 99, '#4A5568'); box(g, ox - 27, UPPER - 105, 66, 2, '#6A7890'); box(g, ox - 27, UPPER - 105, 2, 99, '#6A7890');
  box(g, ox - 34, UPPER - 8, 80, 8, INK); box(g, ox - 33, UPPER - 7, 78, 7, '#9AA0AA'); box(g, ox - 33, UPPER - 7, 78, 1, '#D8DCE2');
  for (let x = ox - 30; x < ox + 44; x += 6) box(g, x, UPPER - 5, 3, 1, '#6A707A');
  // (the air conditioner, its drip; a notice)
  slab(g, ox + 52, UPPER - 100, 56, 34, '#C8C4BA');
  for (let y = UPPER - 94; y < UPPER - 70; y += 3) box(g, ox + 58, y, 44, 1, '#7A766C');
  checker(g, ox + 74, UPPER - 66, 4, 52, 'rgba(40, 30, 20, 0.3)');
  box(g, ox + 50, UPPER - 56, 64, 26, INK); box(g, ox + 51, UPPER - 55, 62, 24, '#F4F2EC'); box(g, ox + 51, UPPER - 55, 62, 5, '#B91C1C');
  text(g, 'GUARDS', ox + 82, UPPER - 42, '#1A1A1E', 5, 'center', null); text(g, 'ONLY', ox + 82, UPPER - 34, '#1A1A1E', 5, 'center', null);

  // The metal detector's arch (its light is live)
  const dx = R(DETECTOR_X) - 40;
  for (const ux of [dx, dx + 70]) {
    box(g, ux - 4, UPPER - 6, 18, 6, INK); box(g, ux - 3, UPPER - 5, 16, 5, '#4A4F57'); box(g, ux - 3, UPPER - 5, 16, 1, '#8A9098');
    slab(g, ux, UPPER - 112, 10, 106, '#C4C8CE');
    for (let k = 0; k < 6; k++) { box(g, ux + 3, UPPER - 98 + k * 14, 4, 6, '#203020'); box(g, ux + 3, UPPER - 98 + k * 14, 4, 1, '#3A5A3A'); }
  }
  slab(g, dx - 4, UPPER - 122, 88, 14, '#9AA0AA');
  text(g, 'FREEDOM-SCAN', dx + 40, UPPER - 112, '#1E3A8A', 5, 'center', null);
  box(g, dx + 30, UPPER - 126, 20, 4, INK); box(g, dx + 31, UPPER - 125, 18, 3, '#3A3F46');
  for (const rx of [dx + 4, dx + 72]) pole(g, rx, UPPER - 136, 4, 15, '#8A9098');
  sign(g, dx - 20, UPPER - 150, 120, 16, '#FEF3C7', 'WALK THROUGH', '#7F1D1D', 6);

  // The camera on its pole (its light is live), the sign hung off it
  const px = R(CHECK_END) - 248;
  box(g, px - 6, UPPER - 4, 18, 4, INK); box(g, px - 5, UPPER - 4, 16, 3, '#6A707A');
  pole(g, px, UPPER - 252, 6, 248, '#8A9098');
  box(g, px, UPPER - 226, 200, 4, INK); box(g, px, UPPER - 225, 200, 2, dim('#9AA0AA'));
  // (hung off the arm on short chains)
  for (const cx of [px + 16, px + 196]) for (let y = UPPER - 222; y < UPPER - 210; y += 4) { box(g, cx - 1, y, 4, 3, INK); box(g, cx, y + 1, 2, 1, '#B8BCC4'); }
  sign(g, R(CHECK_END) - 240, UPPER - 210, 200, 22, '#FDE047', 'SMILE! YOU ARE ON CAMERA', INK, 6);
  box(g, px - 8, UPPER - 256, 14, 4, '#5A606A');
  slab(g, px - 42, UPPER - 266, 36, 7, '#C8CCD2');
  slab(g, px - 38, UPPER - 260, 30, 13, '#E8EAEE');
  box(g, px - 44, UPPER - 258, 6, 9, INK); ball(g, px - 43, UPPER - 254, 3, '#2A3A5A', false); box(g, px - 44, UPPER - 256, 1, 1, '#BFE0FF');
};

/** Out on the deck: the walkway's canopy and its ads on posts, the checkpoint's tents, its office, the metal detector. */
/** Where the camera's looking from (its middle, across and up): for the sides of things, going back from where he is. */
export interface Eye { x: number; y: number }

/**
 * The side of something standing out in the open, going back from its front (at x = e, from `top` down to `bottom`)
 * toward where he's looking: whichever side faces him, wider the further off to that side it is (the way the SNES
 * faked depth). `depth`: how far back it goes (how much smaller its far end is: 1 none, less, deeper). `paint` puts the
 * face's own detail on it, given where a point at (along, y) on it is drawn (along 0 at the front, 1 at the back).
 */
const sideFace = (c: Ctx, eye: Eye, e: number, side: 1 | -1, top: number, bottom: number, depth: number, col: string,
  paint?: (pt: (along: number, y: number) => [number, number]) => void) => {
  if ((eye.x - e) * side <= 2) return;
  const pt = (k: number, y: number): [number, number] => { const d = 1 - (1 - depth) * k; return [eye.x + (e - eye.x) * d, eye.y + (y - eye.y) * d]; };
  const [x1, t1] = pt(1, top), [, b1] = pt(1, bottom);
  const r = rampOf(col);
  c.fillStyle = r[1]; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.lineTo(e, bottom); c.closePath(); c.fill();
  // (in steps going back: darker the further)
  for (const [k0, k1, shade] of [[0.45, 0.75, 'rgba(10, 12, 30, 0.14)'], [0.75, 1, 'rgba(10, 12, 30, 0.26)']] as const) {
    const [xa, ta] = pt(k0, top), [, ba] = pt(k0, bottom), [xb, tb] = pt(k1, top), [, bb] = pt(k1, bottom);
    c.fillStyle = shade; c.beginPath(); c.moveTo(xa, ta); c.lineTo(xb, tb); c.lineTo(xb, bb); c.lineTo(xa, ba); c.closePath(); c.fill();
  }
  paint?.(pt);
  // (its edges: the near corner lit, the far one inked)
  box(c, e - (side > 0 ? 0 : 1), top, 1, bottom - top, r[3]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
};
const line = (c: Ctx, a: [number, number], b: [number, number], col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };

/** Out on the deck: the garage's end wall going back (its levels, their openings, the railings), and the security
 *  office's side (its siding, a little window), as he goes by them. Drawn first: everything else out there is in front. */
const outdoorSides = (c: Ctx, eye: Eye, vis: (a: number, b: number) => boolean) => {
  // The garage, from outside: a big concrete parking structure going a long way back, a level every 170
  if (vis(GX1 - 40, GX1 + 700)) sideFace(c, eye, GX1, 1, CEIL_Y - 520, UPPER + 160, 0.5, '#7C7C86', pt => {
    for (let lv = 0; lv < 4; lv++) {
      const slabY = UPPER - lv * 170 - (lv ? 0 : 0), openTop = slabY - 150;
      // (the opening of that level: dark, the parked cars' roofs showing in it, the railing along it)
      const p0 = pt(0.04, openTop), p1 = pt(0.96, openTop), p2 = pt(0.96, slabY - 22), p3 = pt(0.04, slabY - 22);
      c.fillStyle = '#1C1C22'; c.beginPath(); c.moveTo(...p0); c.lineTo(...p1); c.lineTo(...p2); c.lineTo(...p3); c.closePath(); c.fill();
      for (let k = 0.12; k < 0.95; k += 0.16) { const a = pt(k, slabY - 40), b = pt(k + 0.1, slabY - 40); line(c, a, b, '#3A3A44', 8); }
      line(c, pt(0.04, slabY - 26), pt(0.96, slabY - 26), '#A8A8B0', 2);
      for (let k = 0.04; k <= 0.96; k += 0.08) line(c, pt(k, slabY - 26), pt(k, slabY - 6), '#8A8A92', 1);
      // (the slab's edge, lit; the level's stripe and number)
      line(c, pt(0, slabY), pt(1, slabY), '#B4B4BC', 3);
      line(c, pt(0, slabY - 4), pt(0.35, slabY - 4), lv % 2 ? '#1E3A8A' : '#B91C1C', 2);
    }
    // (the columns at the corners going up it)
    for (const k of [0.02, 0.5, 0.98]) line(c, pt(k, CEIL_Y - 520), pt(k, UPPER + 160), '#5C5C66', 4);
  });
  // The security office's sides: tan siding, the courses running back along it, a little window, the roof's edge
  const ox = R(OFFICE_X), top = UPPER - 156;
  if (vis(ox - 400, ox + 400)) for (const [e, side] of [[ox - 120, -1], [ox + 120, 1]] as const) sideFace(c, eye, e, side, top, UPPER, 0.84, '#D4CCBA', pt => {
    for (let y = top + 14; y < UPPER - 4; y += 10) line(c, pt(0, y), pt(1, y), 'rgba(110, 100, 80, 0.45)');
    const w0 = pt(0.3, UPPER - 118), w1 = pt(0.7, UPPER - 118), w2 = pt(0.7, UPPER - 82), w3 = pt(0.3, UPPER - 82);
    c.fillStyle = INK; c.beginPath(); c.moveTo(...w0); c.lineTo(...w1); c.lineTo(...w2); c.lineTo(...w3); c.closePath(); c.fill();
    const g = 2; c.fillStyle = '#5E8CB8'; c.beginPath(); c.moveTo(w0[0] + side * -g, w0[1] + g); c.lineTo(w1[0] - side * -g, w1[1] + g); c.lineTo(w2[0] - side * -g, w2[1] - g); c.lineTo(w3[0] + side * -g, w3[1] - g); c.closePath(); c.fill();
    line(c, pt(0, top + 4), pt(1, top + 4), '#111827', 5);
    line(c, pt(0, UPPER - 8), pt(1, UPPER - 8), '#6A6A66', 4);
  });
};

export const deck = (c: Ctx, f: number, officeOpen: number, alarm: number, cool: number, vis: (a: number, b: number) => boolean, eye: Eye) => {
  outdoorSides(c, eye, vis);
  if (vis(R(GARAGE_END), R(HALL_END))) chunked(c, 'm2u-deck', GX1, R(HALL_END), CEIL_Y - 40, UPPER - CEIL_Y + 40, paintDeck);
  if (vis(R(HALL_END), R(STAIRS_END))) {
    chunked(c, 'm2u-chk', R(HALL_END), R(CHECK_END), UPPER - 300, 300, (g: Ctx) => paintCheck(g));
    // (the office door: dark inside, a lamp on in there; the door swinging out when a guard comes through)
    const ox = R(OFFICE_X), dy = UPPER - 100, dh = 94;
    const open = Math.min(1, officeOpen / 12);
    if (open > 0) {
      box(c, ox - 22, dy, 56, dh, '#0B0B0F');
      c.save(); c.beginPath(); c.rect(ox - 22, dy, 56, dh); c.clip();
      steppedGlow(c, ox + 10, dy + 10, 40, '#FFE9A8', 0.28, 0.04, 4);
      box(c, ox - 22, dy + 54, 56, 4, '#3A2A1A'); box(c, ox + 14, dy + 44, 12, 10, '#5A6A80'); box(c, ox + 16, dy + 46, 8, 6, '#9AD0F0');
      c.restore();
    }
    const dw = 56 * (1 - open * 0.85);
    box(c, ox - 22, dy, dw, dh, INK); box(c, ox - 21, dy + 1, dw - 2, dh - 2, '#5B6B7F');
    box(c, ox - 21, dy + 1, Math.max(1, dw - 2), 2, '#8A9AB0'); box(c, ox - 21, dy + 1, 2, dh - 2, '#7A8AA0');
    box(c, ox - 21 + dw - 6, dy + 1, 4, dh - 2, '#46566A');
    if (dw > 20) { box(c, ox - 21 + (dw - 2) * 0.2, dy + 12, (dw - 2) * 0.6, 24, '#2A3A50'); box(c, ox - 21 + (dw - 2) * 0.2, dy + 12, (dw - 2) * 0.6, 4, '#4E7092'); }
    box(c, ox - 22 + dw - 9, dy + 48, 5, 7, INK); box(c, ox - 22 + dw - 8, dy + 49, 3, 3, '#FACC15');
    if (open > 0) box(c, ox - 22 + dw, dy, 3, dh, '#2A3442');
    // (the metal detector's light: red, flashing, a red glow round it, going off; amber resetting; green, blinking, ready)
    const dx = R(DETECTOR_X) - 40, on = alarm > 0 && (alarm >> 3) % 2 === 0;
    if (alarm > 0) steppedGlow(c, dx + 40, UPPER - 110, on ? 150 : 120, '#EF4444', on ? 0.3 : 0.12, 0.03, 5);
    else if (cool > 0) steppedGlow(c, dx + 40, UPPER - 128, 22, '#F59E0B', 0.3, 0.05, 3);
    const lamp = alarm > 0 ? (on ? '#EF4444' : '#7F1D1D') : cool > 0 ? '#F59E0B' : ((f >> 5) % 2 ? '#22C55E' : '#15803D');
    dome(c, dx + 40, UPPER - 126, 7, lamp);
    if (alarm > 0 && on) { box(c, dx + 36, UPPER - 131, 3, 2, '#FFFFFF'); steppedGlow(c, dx + 40, UPPER - 128, 18, '#FFB0A0', 0.4, 0.1, 3); }
    if (alarm <= 0 && cool > 0) text(c, 'RESETTING...', dx + 40, UPPER - 170, '#F59E0B', 6);
    if (alarm > 0 && on) text(c, 'BEEP BEEP BEEP', dx + 40, UPPER - 170, '#EF4444', 8);
    // (the camera's light, blinking; the flag)
    const px = R(CHECK_END) - 248;
    if ((f >> 4) % 2) { box(c, px - 16, UPPER - 258, 3, 3, '#FF3030'); box(c, px - 17, UPPER - 259, 5, 5, 'rgba(255, 60, 60, 0.3)'); } else box(c, px - 16, UPPER - 258, 3, 3, '#5A1010');
    flag(c, R(CHECK_END) - 10, UPPER - 200, f, 34, 22, UPPER);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floors: the slab, the walkways, the stairs

const slabGarage = (g: Ctx, a: number, b: number) => {
  const W = b - a, y = UPPER;
  bandedGradient(g, a, y, W, TB, ['#8A8A94', '#74747E', '#64646E', '#55555F', '#4A4A53'], 6);
  speckle(g, a, y + 3, W, TB - 3, ['#9A9AA4', '#4A4A53', '#6E6E78'], Math.floor(W * 0.25), a + 7);
  for (let x = Math.floor(a / 240) * 240; x < b; x += 240) { box(g, x, y + 3, 1, TB - 3, '#3A3A42'); box(g, x + 1, y + 3, 1, TB - 3, '#9A9AA4'); }
  // (the stalls' lines, worn; arrows; EXIT stenciled)
  const s0 = R(60);
  for (let x = s0 + Math.floor((a - s0) / 70) * 70 - 70; x < b + 10; x += 70) {
    if (x < GX0 + 10 || x > GX1 - 300) continue;
    box(g, x, y + 4, 4, TB - 6, '#D4B43A'); box(g, x, y + 4, 1, TB - 6, '#F2D867'); box(g, x + 3, y + 4, 1, TB - 6, '#9A8228');
    checker(g, x, y + 16 + Math.floor(hash(x) * 8), 4, 6, '#64646E');
  }
  for (let x = Math.floor((a - GX0) / 560) * 560 + GX0 + 250; x < b + 50; x += 560) {
    const ac = '#D8D8DC';
    box(g, x, y + 16, 28, 4, ac); g.fillStyle = ac; g.beginPath(); g.moveTo(x + 28, y + 10); g.lineTo(x + 40, y + 18); g.lineTo(x + 28, y + 26); g.closePath(); g.fill();
    checker(g, x, y + 10, 40, 16, '#64646E', 1);
  }
  text(g, 'EXIT', GX1 - 380, y + 24, '#D8D8DC', 8, 'center', null); checker(g, GX1 - 400, y + 14, 40, 12, '#64646E');
  // (oil stains, tire marks)
  for (let x = Math.floor(a / 70) * 70; x < b + 40; x += 70) {
    const h = hash(x * 0.11);
    if (h < 0.55) {
      const cx = x + 35 + Math.floor(hash(x * 0.3) * 20) - 10, rw = 10 + Math.floor(h * 22);
      pixelBlob(g, cx, y + 20, rw, 5 + h * 4, 'rgba(14, 10, 8, 0.3)'); pixelBlob(g, cx - 2, y + 20, rw * 0.5, 3, 'rgba(8, 6, 4, 0.35)');
      box(g, cx - 4, y + 18, 4, 1, '#5A4E7A'); box(g, cx, y + 19, 3, 1, '#4E6A5A');
    }
    if (hash(x * 0.7) < 0.3) { const len = 40 + Math.floor(hash(x * 1.3) * 80); checker(g, x, y + 8, len, 2, 'rgba(10, 8, 6, 0.45)'); checker(g, x + 6, y + 26, len, 2, 'rgba(10, 8, 6, 0.4)', 1); }
  }
  // (the daylight from the way out, on the floor in steps)
  for (let i = 0; i < 6; i++) {
    const x = GX1 - 300 + i * 50;
    box(g, x, y, 50, TB + FACE, `rgba(255, 232, 180, ${(0.04 + i * 0.045).toFixed(3)})`);
    checker(g, x - 2, y, 2, TB + FACE, `rgba(255, 232, 180, ${(0.06 + i * 0.045).toFixed(3)})`);
  }
  box(g, a, y, W, 2, '#C8C8D0'); box(g, a, y + 2, W, 1, '#A0A0AA');
  // The slab's edge: its face, painted yellow bits
  const fy = y + TB;
  box(g, a, fy, W, FACE, '#44444C'); box(g, a, fy, W, 2, '#82828C'); box(g, a, fy + 2, W, 2, '#5C5C66');
  box(g, a, fy + FACE - 5, W, 5, '#2C2C33'); checker(g, a, fy + FACE - 7, W, 2, '#2C2C33');
  for (let x = Math.floor(a / 120) * 120; x < b; x += 120) { box(g, x, fy + 8, 60, 6, '#C9A227'); box(g, x, fy + 8, 60, 1, '#E8C84A'); checker(g, x + 40, fy + 8, 20, 6, '#44444C'); }
  // Level 2 under it, in the dark: its ceiling beam, dim tubes, pillars, parked shapes
  const y2 = fy + FACE;
  bandedGradient(g, a, y2, W, BOTTOM - y2, ['#1C1C22', '#16161B', '#111115', '#0C0C0F'], 6);
  box(g, a, y2, W, 10, '#26262C'); checker(g, a, y2 + 10, W, 2, '#26262C'); box(g, a, y2, W, 1, '#0A0A0C');
  for (let x = Math.floor(a / 200) * 200 + 100; x < b + 60; x += 200) {
    checker(g, x - 6, y2 + 18, 62, 4, 'rgba(184, 208, 192, 0.08)'); box(g, x - 2, y2 + 18, 54, 2, 'rgba(184, 208, 192, 0.07)');
    box(g, x, y2 + 14, 50, 4, '#202024'); box(g, x + 2, y2 + 15, 46, 2, '#8FA096');
  }
  for (const px of PILLARS) if (px + 50 > a && px < b) {
    box(g, px + 4, y2 + 10, 38, BOTTOM - y2, '#2A2A31'); box(g, px + 4, y2 + 10, 5, BOTTOM - y2, '#36363E'); box(g, px + 34, y2 + 10, 8, BOTTOM - y2, '#1E1E24');
    hazard(g, px + 4, y2 + 118, 38, 30); box(g, px + 4, y2 + 118, 38, 30, 'rgba(8, 8, 12, 0.6)');
  }
  for (let x = Math.floor(a / 260) * 260 + 60; x < b + 140; x += 260) {
    if (hash(x * 0.05) < 0.3) continue;
    const w = 110 + Math.floor(hash(x) * 20), base = y2 + 150;
    carPath(g, x, w, base); g.fillStyle = '#1E1E25'; g.fill();
    box(g, x + w * 0.35, base - 50, w * 0.34, 9, '#2A303A'); box(g, x + 1, base - 33, 4, 5, '#4A1414');
    for (const wx of [x + w * 0.2, x + w * 0.8]) { g.fillStyle = '#0A0A0D'; g.beginPath(); g.arc(wx, base - 10, 10, 0, Math.PI * 2); g.fill(); }
  }
  box(g, a, y2 + 150, W, 2, '#2A2A30'); box(g, a, y2 + 152, W, BOTTOM - y2 - 152, '#141418');
};

const slabDeck = (g: Ctx, a: number, b: number) => {
  const W = b - a, y = UPPER;
  bandedGradient(g, a, y, W, TB, ['#DCD6CA', '#CAC4B8', '#B8B2A6', '#A6A094', '#968F84'], 6);
  speckle(g, a, y + 3, W, TB - 3, ['#8A8478', '#E8E2D6', '#A49E92'], Math.floor(W * 0.2), a + 3);
  // (the pavers: two rows, staggered; a tar-filled expansion joint now and then; old gum)
  box(g, a, y + 18, W, 1, '#8A8478'); box(g, a, y + 19, W, 1, '#E2DCD0');
  for (let x = Math.floor(a / 40) * 40; x < b; x += 40) {
    box(g, x, y + 3, 1, 15, '#8A8478'); box(g, x + 1, y + 3, 1, 15, '#E8E2D6');
    box(g, x + 20, y + 20, 1, TB - 20, '#847E72'); box(g, x + 21, y + 20, 1, TB - 20, '#D8D2C6');
  }
  for (let x = Math.floor(a / 400) * 400 + 200; x < b; x += 400) { box(g, x, y + 2, 3, TB - 2, '#2A2622'); box(g, x + 3, y + 2, 1, TB - 2, '#6A645A'); }
  for (let x = Math.floor(a / 30) * 30; x < b; x += 30) if (hash(x * 0.21) < 0.25) box(g, x + Math.floor(hash(x) * 20), y + 6 + Math.floor(hash(x * 3) * 24), 3, 2, '#5A544A');
  // (the checkpoint's mat under the tent: navy, a red border, white stars)
  const m0 = Math.max(a, R(HALL_END) + 40), m1 = Math.min(b, R(HALL_END) + 600);
  if (m1 > m0) {
    box(g, m0, y + 4, m1 - m0, TB - 6, '#1E3A8A'); box(g, m0, y + 4, m1 - m0, 2, '#B91C1C'); box(g, m0, y + 6, m1 - m0, 2, '#2D51B0');
    box(g, m0, y + TB - 6, m1 - m0, 2, '#14205C'); box(g, m0, y + TB - 4, m1 - m0, 2, '#B91C1C');
    for (let x = Math.floor(m0 / 24) * 24 + 12; x < m1 - 4; x += 24) star(g, x, y + 14 + (Math.floor(x / 24) % 2) * 8, 3, '#DAD7D2');
  }
  // (the metal detector's mat: black rubber, yellow footprints)
  const dx = R(DETECTOR_X) - 40;
  if (dx + 90 > a && dx - 10 < b) {
    box(g, dx - 10, y + 4, 100, TB - 6, '#1C1C20'); box(g, dx - 10, y + 4, 100, 1, '#4A4A54');
    for (let yy = y + 7; yy < y + TB - 3; yy += 3) box(g, dx - 8, yy, 96, 1, '#2A2A30');
    for (let k = 0; k < 4; k++) pixelBlob(g, dx + 8 + k * 22, y + 14 + (k % 2) * 8, 5, 3, '#E8B400');
  }
  box(g, a, y, W, 2, '#F6F2EA'); box(g, a, y + 2, W, 1, '#E2DCD0');
  // The deck's edge: a precast fascia with a red, white and blue stripe
  const fy = y + TB;
  box(g, a, fy, W, 26, '#A49E92'); box(g, a, fy, W, 2, '#D6D0C4'); box(g, a, fy + 2, W, 2, '#B8B2A6');
  box(g, a, fy + 6, W, 5, '#1E3A8A'); box(g, a, fy + 6, W, 1, '#2D51B0'); box(g, a, fy + 11, W, 2, '#E8E4DC'); box(g, a, fy + 13, W, 5, '#B91C1C'); box(g, a, fy + 13, W, 1, '#D93A2E');
  box(g, a, fy + 21, W, 5, '#6E685C'); checker(g, a, fy + 19, W, 2, '#6E685C');
  for (let x = Math.floor(a / 200) * 200; x < b; x += 200) box(g, x, fy, 1, 26, '#5A544A');
  // Under the deck: block wall in the shade, steel braces, the columns holding it all up
  const y2 = fy + 26;
  g.fillStyle = brickPattern(g, 'm2u-underblk', 32, 16, ['#4A443C', '#433E37'], '#2E2A25'); g.fillRect(a, y2, W, BOTTOM - y2);
  for (let k = 0; k < 5; k++) box(g, a, y2 + k * 30, W, k === 4 ? BOTTOM - y2 - 120 : 30, `rgba(14, 10, 6, ${(0.2 + k * 0.1).toFixed(2)})`);
  for (let k = 1; k < 5; k++) checker(g, a, y2 + k * 30, W, 2, `rgba(14, 10, 6, ${(0.2 + k * 0.1).toFixed(2)})`);
  const c0 = GX1 + 90;
  g.lineWidth = 3;
  for (let x = c0 + Math.floor((a - c0) / 180) * 180 - 180; x < b + 180; x += 180) {
    g.strokeStyle = '#24282E'; g.beginPath(); g.moveTo(x + 26, y2 + 14); g.lineTo(x + 180, y2 + 130); g.moveTo(x + 180, y2 + 14); g.lineTo(x + 26, y2 + 130); g.stroke();
  }
  box(g, a, y2, W, 7, '#3A3F46'); box(g, a, y2, W, 1, '#6A707A'); box(g, a, y2 + 7, W, 6, 'rgba(10, 8, 6, 0.5)'); checker(g, a, y2 + 13, W, 4, 'rgba(10, 8, 6, 0.4)');
  for (let x = c0 + Math.floor((a - c0) / 180) * 180 - 180; x < b + 40; x += 180) {
    if (x > R(CHECK_END) - 30) continue;
    box(g, x - 1, y2 + 7, 28, BOTTOM - y2, INK);
    box(g, x, y2 + 7, 26, BOTTOM - y2, '#7E786C'); box(g, x, y2 + 7, 5, BOTTOM - y2, '#9C968A'); checker(g, x + 5, y2 + 7, 2, BOTTOM - y2, '#9C968A');
    box(g, x + 19, y2 + 7, 7, BOTTOM - y2, '#5E584E'); checker(g, x + 17, y2 + 7, 2, BOTTOM - y2, '#5E584E');
    box(g, x - 4, y2 + 7, 34, 7, '#8E887C'); box(g, x - 4, y2 + 7, 34, 1, '#B4AEA2'); box(g, x - 4, y2 + 12, 34, 2, '#5E584E');
    checker(g, x, y2 + 100, 26, BOTTOM - y2 - 100, 'rgba(14, 10, 6, 0.35)');
  }
};

const paintSlab = (g: Ctx, a: number, b: number) => {
  const ga = Math.max(a, GX0), gb = Math.min(b, GX1);
  if (gb > ga) slabGarage(g, ga, gb);
  const da = Math.max(a, GX1), db = Math.min(b, R(CHECK_END));
  if (db > da) slabDeck(g, da, db);
};

/** A moving walkway's still parts: the glass balustrade with its rounded ends, the steel base, the tread's ribs, the comb plates, the front skirt. */
const walkwayStill = (g: Ctx, a: number, b: number) => {
  const gt = UPPER - 80, gb = UPPER - 14, cy = UPPER - 46, rr = 36;
  // (the glass, with the newel ends rounded)
  g.save(); g.beginPath(); g.rect(a, gt, b - a, gb - gt); g.arc(a, cy, rr - 2, Math.PI / 2, Math.PI * 1.5); g.arc(b, cy, rr - 2, -Math.PI / 2, Math.PI / 2); g.clip();
  box(g, a - rr, gt - 4, b - a + rr * 2, gb - gt + 10, 'rgba(186, 228, 250, 0.2)');
  box(g, a - rr, gt, b - a + rr * 2, 3, 'rgba(140, 200, 190, 0.4)'); checker(g, a - rr, gb - 6, b - a + rr * 2, 6, 'rgba(140, 200, 190, 0.3)');
  for (let x = a - 20; x < b + 20; x += 100) {
    glint(g, x + (Math.floor(hash(x) * 30)), gt, gb, 10, 'rgba(255, 255, 255, 0.3)');
    glint(g, x + 16 + (Math.floor(hash(x) * 30)), gt, gb, 3, 'rgba(255, 255, 255, 0.25)');
  }
  g.restore();
  for (let x = a + 100; x < b; x += 100) { box(g, x - 1, gt, 3, gb - gt, 'rgba(200, 210, 220, 0.45)'); box(g, x - 3, gb - 8, 7, 8, '#9CA3AF'); box(g, x - 3, gb - 8, 7, 1, '#E4E8EE'); }
  // (the handrail: black rubber over the top and round each end)
  g.lineCap = 'butt';
  for (const [cx, a0, a1] of [[a, Math.PI / 2, Math.PI * 1.5], [b, -Math.PI / 2, Math.PI / 2]] as [number, number, number][]) {
    g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, rr, a0, a1); g.stroke();
    g.strokeStyle = '#1C1C20'; g.lineWidth = 7; g.beginPath(); g.arc(cx, cy, rr, a0, a1); g.stroke();
    g.strokeStyle = '#4A4A54'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, rr + 2, cx === a ? Math.PI * 1.05 : -Math.PI * 0.45, cx === a ? Math.PI * 1.45 : -Math.PI * 0.1); g.stroke();
  }
  box(g, a, UPPER - 87, b - a, 10, INK); box(g, a, UPPER - 86, b - a, 8, '#1C1C20'); box(g, a, UPPER - 86, b - a, 1, '#55555F'); box(g, a, UPPER - 85, b - a, 2, '#2E2E34'); box(g, a, UPPER - 79, b - a, 1, '#0A0A0C');
  // (the steel base under the glass, its little lights)
  box(g, a - rr + 4, gb - 1, b - a + rr * 2 - 8, 15, INK);
  box(g, a - rr + 5, gb, b - a + rr * 2 - 10, 14, '#9CA3AF'); box(g, a - rr + 5, gb, b - a + rr * 2 - 10, 3, '#E4E8EE'); box(g, a - rr + 5, gb + 3, b - a + rr * 2 - 10, 2, '#C4CAD2');
  box(g, a - rr + 5, gb + 10, b - a + rr * 2 - 10, 4, '#6B7280'); checker(g, a - rr + 5, gb + 8, b - a + rr * 2 - 10, 2, '#6B7280');
  for (let x = a; x < b; x += 40) { box(g, x, gb + 6, 6, 2, '#BFE3FF'); box(g, x - 1, gb + 5, 8, 4, 'rgba(150, 200, 255, 0.25)'); }
  // (the tread: ribbed aluminum, yellow lines along both edges)
  box(g, a, UPPER, b - a, TB, '#7D848E');
  for (let yy = UPPER + 4; yy < UPPER + TB - 3; yy += 3) { box(g, a, yy, b - a, 1, '#AAB2BC'); box(g, a, yy + 1, b - a, 1, '#4E555E'); }
  box(g, a, UPPER, b - a, 2, '#E0E6EE'); box(g, a, UPPER + 2, b - a, 2, '#E8C020'); box(g, a, UPPER + TB - 3, b - a, 2, '#E8C020'); box(g, a, UPPER + TB - 1, b - a, 1, '#3A4048');
  // (the comb plates: diamond plate, a yellow comb edge with its teeth into the tread)
  const diamond = tilePattern(g, 'm2u-diamond', 8, 8, t => {
    t.fillStyle = '#9AA0AA'; t.fillRect(0, 0, 8, 8);
    t.fillStyle = '#D0D6DE'; t.fillRect(1, 1, 3, 1); t.fillRect(5, 5, 3, 1);
    t.fillStyle = '#5E646E'; t.fillRect(2, 2, 3, 1); t.fillRect(6, 6, 2, 1); t.fillRect(0, 6, 1, 1);
  });
  for (const [x0, toRight] of [[a - 30, true], [b, false]] as [number, boolean][]) {
    box(g, x0, UPPER, 30, TB, '#9AA0AA'); g.fillStyle = diamond; g.fillRect(x0, UPPER + 2, 30, TB - 2);
    box(g, x0, UPPER, 30, 2, '#E8ECF2'); box(g, x0, UPPER + TB - 2, 30, 2, '#5E646E');
    const ex = toRight ? x0 + 24 : x0;
    box(g, ex, UPPER + 2, 6, TB - 2, '#F2C70F'); box(g, ex, UPPER + 2, 6, 1, '#FFE45A'); box(g, ex + (toRight ? 5 : 0), UPPER + 2, 1, TB - 2, '#A88A08');
    for (let yy = UPPER + 4; yy < UPPER + TB - 2; yy += 3) box(g, toRight ? x0 + 30 : x0 - 4, yy, 4, 2, '#D4AA0C');
    for (const sx of [x0 + 4, x0 + 18]) { box(g, sx, UPPER + 6, 2, 2, '#4A4F57'); box(g, sx, UPPER + 6, 1, 1, '#E4E8EE'); box(g, sx, UPPER + 26, 2, 2, '#4A4F57'); }
  }
  // (the skirt along the front, under the tread)
  box(g, a - 30, UPPER + TB, b - a + 60, 12, INK);
  box(g, a - 29, UPPER + TB, b - a + 58, 11, '#A8AEB6'); box(g, a - 29, UPPER + TB, b - a + 58, 2, '#DDE2E8'); box(g, a - 29, UPPER + TB + 8, b - a + 58, 3, '#6B7280');
  for (let x = a; x < b; x += 30) box(g, x - 1, UPPER + TB + 4, 8, 5, '#2A3038');
};

const walkway = (c: Ctx, a: number, b: number, f: number) => {
  stamp(c, `m2u-ww:${a}`, a - 50, UPPER - 92, b - a + 100, TB + 106, g => walkwayStill(g, a, b));
  // (the pallets going by, the handrail's marks going by with them, the skirt's lights chasing along: all at the walkway's speed)
  const run = f * WALKWAY_SPEED;
  const off = run % 24;
  for (let x = a + off; x < b - 2; x += 24) { box(c, x, UPPER + 4, 2, TB - 8, '#363C44'); box(c, x + 2, UPPER + 4, 1, TB - 8, '#CAD2DC'); }
  for (let x = a + (run % 60); x < b - 12; x += 60) { box(c, x, UPPER - 84, 12, 2, '#5A5A66'); box(c, x + 12, UPPER - 84, 2, 2, '#3A3A44'); }
  for (let x = a; x < b; x += 30) {
    const ph = (((x - a) - run) % 150 + 150) % 150;
    box(c, x, UPPER + TB + 5, 6, 3, ph < 30 ? '#E6F6FF' : ph < 60 ? '#8CC8F0' : '#3A6A90');
  }
};

/** The stairs down to America USA: 24 wide stone steps with lit nosings and a red runner, the stone cheek wall under them, brass rails on posts, the sign at the top. */
const stairsStill = (g: Ctx, a: number, b: number) => {
  const n = 24, h = (GROUND_Y - UPPER) / n, w = (b - a) / n, BAND = 30;
  const stepY = (i: number) => Math.round(UPPER + i * h);
  // (the cheek wall under the flight: coursed stone, darker the deeper it goes)
  g.save(); g.beginPath(); g.moveTo(a, BOTTOM);
  for (let i = 0; i < n; i++) { g.lineTo(a + i * w, stepY(i) + BAND); g.lineTo(a + (i + 1) * w, stepY(i) + BAND); }
  g.lineTo(b + 2, BOTTOM); g.closePath(); g.clip();
  g.fillStyle = brickPattern(g, 'm2u-stairstone', 36, 14, ['#7A7468', '#726C60'], '#4E4940'); g.fillRect(a, UPPER, b - a + 2, BOTTOM - UPPER);
  for (let x = Math.floor(a / 36) * 36; x < b; x += 36) for (let y = UPPER; y < BOTTOM; y += 14) if (hash(x * 0.3 + y) < 0.2) box(g, x + 4, y + 3, 8, 2, '#8E877A');
  // (shade deepening down the wall in steps, each step dithered into the next)
  for (let k = 0; k < 8; k++) {
    const y = UPPER + 30 + k * 30, al = (0.04 + k * 0.06).toFixed(2);
    box(g, a, y, b - a + 2, k === 7 ? BOTTOM - y : 30, `rgba(20, 14, 8, ${al})`); checker(g, a, y - 2, b - a + 2, 2, `rgba(20, 14, 8, ${al})`);
  }
  // (the shadow right under the steps, following them down)
  for (let i = 0; i < n; i++) { const y = stepY(i) + BAND; box(g, a + i * w, y, w + 1, 6, 'rgba(20, 14, 8, 0.45)'); checker(g, a + i * w, y + 6, w + 1, 4, 'rgba(20, 14, 8, 0.35)'); }
  g.restore();
  // (the steps: lit nosing, the tread's face in stone steps, the red runner with its brass rod, the shadow under each nosing)
  for (let i = 0; i < n; i++) {
    const x = Math.round(a + i * w), x1 = Math.round(a + (i + 1) * w), y = stepY(i), sw = x1 - x;
    box(g, x, y, sw + 1, BAND, '#C6BFB2');
    box(g, x, y, sw + 1, 2, '#FAF6EE'); box(g, x, y + 2, sw + 1, 2, '#E4DDD0'); checker(g, x, y + 4, sw + 1, 2, '#E4DDD0');
    box(g, x, y + BAND - 6, sw + 1, 6, '#A49D90'); checker(g, x, y + BAND - 8, sw + 1, 2, '#A49D90'); box(g, x, y + BAND - 1, sw + 1, 1, '#6E685C');
    box(g, x, y + 8, sw + 1, 14, '#B01E1E'); box(g, x, y + 8, sw + 1, 2, '#D84034'); box(g, x, y + 20, sw + 1, 2, '#7A1010');
    box(g, x, y + 7, sw + 1, 1, '#E8B400');
    box(g, x, y, 2, BAND, 'rgba(40, 30, 20, 0.35)'); box(g, x + sw - 1, y, 1, BAND, '#8E877A');
    // (the shadow its nosing throws on the next one down)
    checker(g, x1, y + Math.round(h), Math.min(8, sw), 6, 'rgba(30, 20, 10, 0.3)');
    if (hash(i * 7.3) < 0.3) box(g, x + 4 + Math.floor(hash(i) * 12), y + BAND - 10, 4, 1, '#8E877A');
  }
  // (the brass rails: a top rail and a lower one on brass posts; thicker newel posts top and bottom)
  const railY = (x: number) => UPPER + ((x - a) / (b - a)) * (GROUND_Y - UPPER);
  for (let i = 0; i <= 8; i++) {
    const x = Math.round(a + 6 + (b - a - 12) * (i / 8)), foot = stepY(Math.min(n - 1, Math.floor((x - a) / w)));
    const nw = i === 0 || i === 8 ? 5 : 3;
    pole(g, x - 1, Math.round(railY(x)) - 44, nw, foot - (Math.round(railY(x)) - 44), '#C9A227');
    ball(g, x + 0.5, Math.round(railY(x)) - 46, nw === 5 ? 5 : 2.5, '#E8B400');
  }
  for (let x = a + 4; x < b - 4; x += 2) {
    const yy = Math.round(railY(x)) - 44;
    box(g, x, yy - 2, 2, 1, INK); box(g, x, yy - 1, 2, 1, '#FFF1A8'); box(g, x, yy, 2, 2, '#E8B400'); box(g, x, yy + 2, 2, 1, '#A16207'); box(g, x, yy + 3, 2, 1, INK);
    const y2 = Math.round(railY(x)) - 20;
    box(g, x, y2 - 1, 2, 1, INK); box(g, x, y2, 2, 1, '#E8C040'); box(g, x, y2 + 1, 2, 1, '#8A5A08');
  }
  // (the sign at the top, on its posts)
  for (const px of [a + 34, a + 204]) { const foot = stepY(Math.floor((px - a) / w)); pole(g, px, UPPER - 112, 4, foot - (UPPER - 112), '#7A808A'); }
  sign(g, a + 20, UPPER - 130, 200, 18, BLUE, 'AMERICA USA: ALL THE WAY DOWN', WHITE, 6);
  shinyStar(g, a + 6, UPPER - 121, 6, '#F1EFEA');
};

const stairs = (c: Ctx, a: number, b: number, f: number) => {
  const [l, r] = view(c);
  if (b < l - 40 || a > r + 40) return;
  stamp(c, 'm2u-stairs', a - 16, UPPER - 140, b - a + 32, BOTTOM - (UPPER - 140), g => stairsStill(g, a, b));
  // (flags all the way down, waving)
  const n = 24, h = (GROUND_Y - UPPER) / n, w = (b - a) / n;
  for (let i = 1; i < 4; i++) {
    const x = a + (b - a) * (i / 4) + 20;
    flag(c, x, UPPER + (GROUND_Y - UPPER) * (i / 4) - 150, f + i * 37, 26, 16, Math.round(UPPER + Math.floor((x - a) / w) * h));
  }
};

/** The garage level's slab and the deck (its edge showing, the drop under it), the stairs down, the walkways. */
export const drawUpperFloor = (c: Ctx, f: number) => {
  chunked(c, 'm2u-slab', GX0, R(CHECK_END), UPPER, BOTTOM - UPPER, paintSlab);
  stairs(c, R(CHECK_END), R(STAIRS_END), f);
  const [l, r] = view(c);
  for (const [a, b] of WALKWAYS) if (R(b) + 60 > l && R(a) - 60 < r) walkway(c, R(a), R(b), f);
};
