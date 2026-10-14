// The old spur, before the breaker (looks only: the sled's route and the rail it rides are layout.ts's, untouched).
// Just past the last laser band the finished track branches away, up and off into the dome (polished, its guide lights
// chasing: where the show goes), and the sled carries straight on, onto a stretch nobody ever finished: rail in red
// primer on timber ties, no girder (timber shoring and cribbing down to the floor instead), scaffold towers either side
// with the UNDER CONSTRUCTION banner hung between them, KEEP OUT on everything, work lights on the scaffold tops; the
// switch at the split set the wrong way, its lamp red. Then the breaker, across the doorway at the end of it.
//
//   drawSpurBack   behind the track: the finished branch (far, dimmed), the scaffolds, the shoring
//   drawSpurRail   over the play rail on the spur's stretch: primer and timber (the same line: it reads as the rail)
//   drawSpurFront  after the track: the switch, the signs and the banner (nothing over them), the work lights' heads
//   spurLights     the work lights' pools, the guide lights' glow (for rideLighting)

import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { INK, box, hash, mix, checker } from '../../intro/art/kit';
import { cyl, lamp, hazard } from '../atom/snes';
import { plate, plateBoxAt, cables, legs } from '../atom/signs';
import { R, trackY } from './layout';
import { GY } from '../geometry';

type Ctx = CanvasRenderingContext2D;

/** Where the finished track branches off (the switch), and where the spur's stretch of rail ends (past the breaker's
 *  doorway, into the warehouse). */
export const SPUR_X0 = R + 12620, SPUR_X1 = R + 13250;
/** The floor (every support's footing): the same as the track's. */
const FOOT_Y = GY + 380;
/** The scaffold towers: [x0, x1]; how high their tops stand over the rail. */
const SCAFFOLDS: [number, number][] = [[R + 12660, R + 12730], [R + 12900, R + 12965]];
const SCAF_UP = 206;
/** The finished branch: up and away from the switch, out of sight up into the dome. */
const BRANCH_LEN = 1200;
const branchY = (x: number) => (trackY(SPUR_X0) ?? GY) - 300 * ((x - SPUR_X0) / 800) ** 2;
const rail = (x: number) => trackY(x) ?? GY;
/** Lumber, darkest first. */
const WOOD = ['#2B1A0E', '#4A2E16', '#6B4423', '#8C5E33', '#AE7C47'];

const seen = (cam: number, a: number, b: number) => b > cam - 120 && a < cam + CANVAS_WIDTH + 120;

/** A timber (a 6x6, a plank): its grain, lit down its left. */
const timber = (c: Ctx, x: number, y: number, w: number, h: number, lit: boolean) => {
  const W = lit ? WOOD : WOOD.map(v => mix(v, '#0B0820', 0.45));
  box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, W[2]);
  if (h > w) { box(c, x, y, 1, h, W[3]); box(c, x + w - 1, y, 1, h, W[1]); } else { box(c, x, y, w, 1, W[3]); box(c, x, y + h - 1, w, 1, W[1]); }
};

export const drawSpurBack = (c: Ctx, cam: number, lit: boolean, f: number) => {
  if (!seen(cam, SPUR_X0 - 200, SPUR_X0 + BRANCH_LEN)) return;
  // THE FINISHED BRANCH: its columns down to their footings, its girder, its polished rail, the guide lights chasing
  // along it; far behind (knocked back, so it never reads as somewhere to land)
  const b0 = Math.max(SPUR_X0, cam - 120), b1 = Math.min(SPUR_X0 + BRANCH_LEN, cam + CANVAS_WIDTH + 120);
  if (b1 > b0) {
    for (let x = Math.ceil((SPUR_X0 + 100) / 150) * 150; x < b1; x += 150) if (x > b0 - 150) {
      const y = branchY(x) + 18;
      cyl(c, x - 3, y, 6, FOOT_Y - 12 - y, lit ? '#71717A' : '#1E293B', 'y');
      box(c, x - 10, FOOT_Y - 10, 20, 10, lit ? '#57534E' : '#0F172A');
    }
    const line = (w: number, col: string, dy: number) => {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath();
      for (let x = b0; x <= b1; x += 16) { const y = branchY(x) + dy; if (x === b0) c.moveTo(x, y); else c.lineTo(x, y); }
      c.stroke();
    };
    line(6, INK, 16); line(3, lit ? '#52525B' : '#1E293B', 16);
    line(9, INK, 3); line(5, lit ? '#A1A1AA' : '#475569', 3); line(1, lit ? '#F4F4F5' : '#C7D2FE', 0);
    for (let x = Math.ceil(b0 / 24) * 24; x < b1; x += 24) box(c, x - 1, branchY(x) + 7, 3, 2, ((x / 24 - (f >> 2)) % 6 + 6) % 6 === 0 ? '#67E8F9' : '#164E63');
    c.fillStyle = lit ? 'rgba(55, 60, 72, 0.35)' : 'rgba(3, 2, 10, 0.4)';
    c.beginPath(); c.moveTo(b0, branchY(b0) - 14); for (let x = b0; x <= b1; x += 16) c.lineTo(x, branchY(x) - 14); c.lineTo(b1, branchY(b1) + 26); for (let x = b1; x >= b0; x -= 16) c.lineTo(x, branchY(x) + 26); c.closePath(); c.fill();
  }
  // THE SCAFFOLDS: tube frames up from base plates on the floor, braced across, plank decks (dull: nothing to stand
  // on from the track), toe boards; a hard hat left on one, a radio on the other
  for (const [s0, s1] of SCAFFOLDS) {
    if (!seen(cam, s0, s1)) continue;
    const top = rail(s0) - SCAF_UP, tube = lit ? '#A1A1AA' : '#3F4A5E';
    for (const ux of [s0, s1]) { box(c, ux - 2, top, 5, FOOT_Y - top, INK); box(c, ux - 1, top, 3, FOOT_Y - top, tube); box(c, ux - 6, FOOT_Y - 4, 13, 4, INK); }
    c.strokeStyle = tube; c.lineWidth = 2; c.beginPath();
    for (let y = top; y < FOOT_Y - 90; y += 90) { c.moveTo(s0, y); c.lineTo(s1, y + 90); c.moveTo(s0, y + 90); c.lineTo(s1, y); }
    c.stroke();
    for (let y = top; y < FOOT_Y; y += 90) box(c, s0, y, s1 - s0, 3, tube);
    for (const dy of [0, 100]) {
      const py = top + dy;
      timber(c, s0 - 6, py - 6, s1 - s0 + 12, 6, lit);
      box(c, s0 - 6, py - 14, s1 - s0 + 12, 8, lit ? '#A16207' : '#3B2A10');
    }
    if (s0 === SCAFFOLDS[0][0]) { c.fillStyle = INK; c.beginPath(); c.ellipse(s0 + 24, top - 15, 10, 7, 0, Math.PI, 0); c.fill(); c.fillStyle = lit ? '#FACC15' : '#6B5A12'; c.beginPath(); c.ellipse(s0 + 24, top - 16, 8, 6, 0, Math.PI, 0); c.fill(); box(c, s0 + 12, top - 17, 24, 3, lit ? '#EAB308' : '#5B4A0E'); }
    else { box(c, s0 + 30, top - 26, 22, 12, INK); box(c, s0 + 31, top - 25, 20, 10, lit ? '#B91C1C' : '#4A1414'); box(c, s0 + 34, top - 22, 6, 6, '#18181B'); box(c, s0 + 44, top - 31, 1, 6, '#A1A1AA'); }
  }
  // THE SHORING under the spur's rail: timber posts on cribbing (stacked blocks, crossed) down on the floor, X-braced
  // in pairs, a cross head under the rail
  for (let x = SPUR_X0 + 40; x < SPUR_X1 - 10; x += 70) {
    if (!seen(cam, x - 40, x + 40)) continue;
    const y = rail(x);
    timber(c, x - 4, y + 10, 8, FOOT_Y - 40 - y - 10, lit);
    timber(c, x - 18, y + 6, 36, 6, lit);
    for (let k = 0; k < 4; k++) timber(c, x - 16 + (k % 2) * 4, FOOT_Y - 40 + k * 10, 24 + (k % 2 ? -8 : 0), 9, lit);
    if (x + 70 < SPUR_X1 - 10) {
      const y2 = rail(x + 70);
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y + 30); c.lineTo(x + 70, y2 + 140); c.moveTo(x, y + 140); c.lineTo(x + 70, y2 + 30); c.stroke();
      c.strokeStyle = lit ? WOOD[3] : mix(WOOD[3], '#0B0820', 0.45); c.lineWidth = 3; c.stroke();
    }
  }
};

/** The spur's stretch of the rail itself, over the finished look: red primer, rust bleeding at its splices, timber ties
 *  of odd sizes, one or two missing; its top still a lit line (it's the track: it reads as the track). */
export const drawSpurRail = (c: Ctx, cam: number, lit: boolean) => {
  const a = Math.max(SPUR_X0, cam - 120), b = Math.min(SPUR_X1, cam + CANVAS_WIDTH + 120);
  if (b <= a) return;
  // (its ties: timber, odd sizes, every so often one missing)
  for (let x = Math.ceil(a / 18) * 18; x < b; x += 18) {
    if (hash(x * 0.37) > 0.9) continue;
    const y = rail(x), h = 6 + Math.round(hash(x * 1.3) * 3), w = 6 + Math.round(hash(x * 2.1) * 3);
    box(c, x - w / 2 - 1, y + 3, w + 2, h + 2, INK); box(c, x - w / 2, y + 4, w, h, lit ? WOOD[2] : mix(WOOD[2], '#0B0820', 0.4)); box(c, x - w / 2, y + 4, w, 1, lit ? WOOD[4] : WOOD[2]);
  }
  const ya = rail(a), yb = rail(b);
  for (const [w, col, dy] of [[10, INK, 3], [6, lit ? '#9A3412' : '#5A1E10', 3], [3, lit ? '#C2410C' : '#7C2D12', 1], [1, lit ? '#FED7AA' : '#FDBA74', -0.5]] as const) {
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a, ya + dy); c.lineTo(b, yb + dy); c.stroke();
  }
  // (the splice plates, bolted, the rust run down from them)
  for (let x = Math.ceil(a / 90) * 90; x < b; x += 90) { const y = rail(x); box(c, x - 6, y - 1, 12, 7, INK); box(c, x - 5, y, 10, 5, '#57534E'); box(c, x - 3, y + 1, 2, 2, '#A8A29E'); box(c, x + 1, y + 1, 2, 2, '#A8A29E'); checker(c, x - 4, y + 6, 6, 8, '#7C2D12'); }
};

export const drawSpurFront = (c: Ctx, cam: number, lit: boolean, f: number) => {
  if (!seen(cam, SPUR_X0 - 140, SPUR_X1)) return;
  const y0 = rail(SPUR_X0);
  // THE SWITCH: its motor box by the split, the throw rod out to the points, its lamp red (set to the spur)
  if (seen(cam, SPUR_X0 - 140, SPUR_X0 + 60)) {
    const sx = SPUR_X0 - 70;
    box(c, sx - 1, y0 - 31, 44, 32, INK); box(c, sx, y0 - 30, 42, 30, '#3F3F46'); box(c, sx, y0 - 30, 42, 3, '#71717A'); hazard(c, sx, y0 - 8, 42, 8, '#EAB308', '#27272A', 6);
    box(c, sx + 42, y0 - 6, SPUR_X0 - sx - 42, 3, INK); box(c, sx + 42, y0 - 5, SPUR_X0 - sx - 42, 1, '#A1A1AA');
    box(c, sx + 18, y0 - 46, 4, 16, INK); lamp(c, sx + 20, y0 - 50, 5, '#EF4444', (f >> 4) % 2 === 0, 3);
    // (on its post by the switch: the spur's closed)
    const [p0, , p1, p3] = plateBoxAt('SPUR CLOSED', 'stencil', sx + 20, y0 - 104, 5);
    legs(c, [(p0 + p1) / 2], p3 - 4, y0 - 54, '#52525B', 4);
    plate(c, 'spur-closed', sx + 20, y0 - 104, 'SPUR CLOSED', 'stencil', '#F97316', '#1C1917', 5);
  }
  // THE BANNER, between the scaffold tops on a pipe, on its cables
  const [[, a1], [b0]] = SCAFFOLDS, top = rail(SCAFFOLDS[0][0]) - SCAF_UP, mid = (a1 + b0) / 2;
  if (seen(cam, a1 - 120, b0 + 120)) {
    cyl(c, a1 - 4, top - 30, b0 - a1 + 8, 5, '#71717A');
    for (const ux of [a1, b0]) { box(c, ux - 2, top - 30, 5, 30, INK); box(c, ux - 1, top - 30, 3, 30, lit ? '#A1A1AA' : '#3F4A5E'); }
    const [, by0] = plateBoxAt('UNDER\nCONSTRUCTION', 'stencil', mid, top + 4, 5);
    cables(c, [mid - 44, mid + 40], top - 25, by0 + 2, '#A1A1AA');
    plate(c, 'spur-banner', mid, top + 4, 'UNDER\nCONSTRUCTION', 'stencil', '#FACC15', '#1C1917', 5, true, '#27272A');
  }
  // KEEP OUT, zip-tied to each scaffold's face; the work lights clamped on their tops, aimed down at the rail
  for (const [s0, s1] of SCAFFOLDS) {
    if (!seen(cam, s0 - 40, s1 + 40)) continue;
    const m = (s0 + s1) / 2, y = rail(s0);
    plate(c, 'keepout', m, y - 52, 'KEEP\nOUT', 'stencil', '#DC2626', '#FFFFFF', 4, true, '#27272A');
    for (const lx of [s0 + 6, s1 - 6]) {
      box(c, lx - 1, top - 44, 3, 30, INK); box(c, lx, top - 44, 1, 30, '#A1A1AA');
      box(c, lx - 8, top - 52, 16, 11, INK); box(c, lx - 7, top - 51, 14, 9, '#EAB308'); box(c, lx - 6, top - 43, 12, 2, '#FEF9C3');
      if (!lit) lamp(c, lx, top - 40, 3, '#FEF3C7', true, 3);
    }
  }
};

/** The work lights' pools on the spur, and the guide lights' glow up the finished branch. */
export const spurLights = (cam: number, k: number, lights: Light[]) => {
  if (!seen(cam, SPUR_X0 - 500, SPUR_X0 + BRANCH_LEN) || k >= 1) return;
  for (const [s0, s1] of SCAFFOLDS) for (const lx of [s0 + 6, s1 - 6]) lights.push({ x: lx, y: rail(s0) - 120, r: 170, a: 0.85, cone: 160, color: 'rgba(254, 243, 199, 0.16)' });
  lights.push({ x: SPUR_X0 - 50, y: rail(SPUR_X0) - 50, r: 70, a: 0.8, color: 'rgba(239, 68, 68, 0.18)' });
  for (let x = SPUR_X0 + 200; x < SPUR_X0 + BRANCH_LEN; x += 300) lights.push({ x, y: branchY(x), r: 110, a: 0.5, color: 'rgba(103, 232, 249, 0.1)' });
};
