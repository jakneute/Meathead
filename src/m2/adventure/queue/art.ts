// The Jungle Cruise's queue, painted (the final look; queue/index.ts runs it). A thatched queue house that goes a long
// way back: its switchback lanes one behind the other, each further one smaller, dimmer and hazier (painted once each
// and slid with the camera at its own depth), the bamboo rails turning at the ends, the floor's planks running back
// toward where he's looking, the roof's thatch going up and back over it all, the line going in at a door at the far
// end. In front: the entrance arch with its wait-time board hung under it, the crates, the staff gate; out back the
// staff's alley (the chain-link between him and the line, the dumpster, the AC, the pallets, the signs nobody reads);
// then the loading dock and the boat.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay, farTint, hourMix } from '../../timeOfDay';
import { bendFloor, sign, steppedGlow, ball } from '../../intro/art/kit';
import { SECTIONS, GY } from '../geometry';
import { drawGuest, guestAt, drawGuestsDimmed, type Guest } from './crowd';
import { drawLaunch } from '../river/boat';
import {
  type Ctx, type Eye, INK, rampOf, box, checker, hash, mix, dark, lite, stamp, tilePattern,
  eyeOf, P, quad, seg, atDepth, bamboo, bambooRail, lash, logPost, logBeam, thatchRoof, fringe, stencil, box3d, drawJungleBackdrop,
  BAMBOO, PLANK, STRAW,
} from './depth';
import { signAt, carved, plank, enamel, print, stencil as stencilLook } from '../letters';
import { LEAF as JLEAF, leaf as jleaf, clump as jclump, bigLeaf as jbig, fern as jfern } from '../jungle/art/paint';

const { x0, x1 } = SECTIONS.queue;
const R = (x: number) => x0 + x;
/** A polygon, filled. */
const poly4 = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };

/** The queue house: its span (relative), its depths (the far wall, the lanes far to near, the live near lane, the
 *  eave's posts), how high its eave is, where its ridge is. */
const HALL = { a: 120, b: 1490 };
const WALL_S = 0.42, NEAR_S = 0.89, EAVE_S = 0.95, RAIL_S = 0.93, LINK_S = 0.965;
const LANES = [0.47, 0.56, 0.66, 0.77];
const EAVE_Y = GY - 250, RIDGE_Y = GY - 440, RIDGE_S = 0.64;
const DOOR = { x: 1330, w: 70 };
const GUEST_SCALE = 0.95;
/** The big roof's straw: weathered, a touch darker than the arch's new stuff (it's further back, it's not the show). */
const ROOF = '#A88A52';

/** Where things are (relative): kept in step with queue/index.ts's own (its solids). */
export interface QueueSpots {
  fence: { x: number; w: number; h: number };
  crates: { x: number; w: number; h: number }[];
  dumpster: { x: number; w: number; h: number };
  ac: { x: number; w: number; h: number };
  pallets: { x: number; y: number; w: number };
}

// ---------------------------------------------------------------------------------------------------------------
// The far lanes: everyone in each painted once (two poses, shuffling between them), dimmed into the dark under the roof
// and the haze, and slid with the camera at its depth

interface Lane { id: string; s: number; xa: number; xb: number; guests: Guest[] }
let lanes: Lane[] | null = null;
const farLanes = (): Lane[] => {
  if (lanes) return lanes;
  lanes = LANES.map((s, k) => {
    // (the switchback: each lane open at the other end from the one in front of it; the furthest goes in at the door)
    const xa = k % 2 ? 150 : 190, xb = k === 0 ? DOOR.x + 30 : k % 2 ? 1420 : 1460;
    const guests: Guest[] = [];
    const dir: 1 | -1 = k % 2 ? 1 : -1;
    let i = 0;
    for (let x = xa + 10; x < xb - 10; x += 30 + hash(k * 31 + i) * 20 + (hash(i * 5.3 + k) < 0.12 ? 40 : 0), i++) {
      const g = guestAt(100 + k * 40 + i, R(x), GY, hash(k * 7 + i * 3) < 0.8 ? dir : (-dir as 1 | -1), GUEST_SCALE);
      guests.push(g);
    }
    return { id: `lane${k}`, s, xa, xb, guests };
  });
  return lanes;
};

const LANE_H = 108;
const laneCache = new Map<string, HTMLCanvasElement>();
/** One lane's rails (in its own depth's world units): bamboo posts along the front, two rails, the end posts. */
const laneRails = (g: Ctx, xa: number, xb: number) => {
  for (let x = xa; x <= xb + 1; x += 64) { bamboo(g, R(x) - 3, GY - 52, GY, 6); lash(g, R(x) - 4, GY - 50, 8, 4); }
  bambooRail(g, R(xa), R(xb), GY - 48, 5);
  bambooRail(g, R(xa), R(xb), GY - 28, 4);
};
const drawFarLane = (c: Ctx, eye: Eye, L: Lane, f: number, shade: string, haze: string, k: number) => {
  const m = c.getTransform(), sc = Math.abs(m.a) * L.s, tod = timeOfDay(), ph = (f >> 6) & 1;
  const pad = 30, wx0 = R(L.xa) - pad, wW = L.xb - L.xa + pad * 2, top = GY - LANE_H;
  const key = `${L.id}|${sc.toFixed(3)}|${tod.key}|${ph}`;
  let cv = laneCache.get(key);
  if (!cv) {
    if (laneCache.size > 20) laneCache.clear();
    cv = document.createElement('canvas'); cv.width = Math.ceil(wW * sc); cv.height = Math.ceil((LANE_H + 8) * sc);
    const g = cv.getContext('2d')!;
    g.setTransform(sc, 0, 0, sc, -wx0 * sc, -top * sc);
    for (const gu of L.guests) drawGuest(g, gu, ph * 23 + gu.seed);
    laneRails(g, L.xa, L.xb);
    // (into the dark under the roof, and the haze the further it is: all of it in one go)
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop';
    g.fillStyle = shade; g.globalAlpha = 0.3 + k * 0.08; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = haze; g.globalAlpha = 0.12 + (1 - L.s) * 0.55; g.fillRect(0, 0, cv.width, cv.height);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    laneCache.set(key, cv);
  }
  const [sx, sy] = P(eye, wx0, top, L.s);
  c.drawImage(cv, sx, sy, cv.width / Math.abs(m.a), cv.height / Math.abs(m.a));
};

/** A rail turning back between two lanes at x (relative), from depth s0 to s1. */
const uTurn = (c: Ctx, eye: Eye, x: number, s0: number, s1: number, col: string) => {
  for (const [h, w] of [[48, 3], [28, 2]] as const) seg(c, P(eye, R(x), GY - h, s0), P(eye, R(x), GY - h, s1), col, Math.max(1, w * s1));
  const [px, py] = P(eye, R(x), GY - 52, (s0 + s1) / 2), [, pb] = P(eye, R(x), GY, (s0 + s1) / 2);
  box(c, px - 1.5, py, 3, pb - py, col);
};

// ---------------------------------------------------------------------------------------------------------------
// The queue house

const FLOOR = '#7A5A38';
const drawFloor = (c: Ctx, eye: Eye) => {
  const tod = timeOfDay();
  // (the ground round the house: packed earth, going back to where the jungle starts)
  const g0 = farTint('#6E5A3A', 0.25), g1 = farTint('#5A4A30', 0.6);
  const xa = Math.max(x0 - 300, eye.x - CANVAS_WIDTH), xb = Math.min(x1 + 300, eye.x + CANVAS_WIDTH);
  const bands = [1, 0.85, 0.7, 0.58, 0.48, WALL_S - 0.04];
  for (let i = 0; i < bands.length - 1; i++) quad(c, P(eye, xa, GY, bands[i]), P(eye, xb, GY, bands[i]), P(eye, xb, GY, bands[i + 1]), P(eye, xa, GY, bands[i + 1]), mix(g0, g1, i / (bands.length - 2)));
  // (the jungle's edge along the back of it: low scrub, dark)
  atDepth(c, eye, WALL_S - 0.04);
  // (in tiles, painted once each for the hour: banana plants, palms, bushes in the leaves' ramp, ferns along the foot)
  {
    const TL = 512, lf = JLEAF.map(col => farTint(mix(col, '#0A1A10', 0.25), 0.7)), dd = WALL_S - 0.04;
    for (let tx = Math.floor((eye.x - 2000) / TL) * TL; tx < eye.x + 2000; tx += TL) {
      const sx = eye.x + (tx - 60 - eye.x) * dd;
      if (sx + (TL + 120) * dd < eye.x - CANVAS_WIDTH / 2 - 20 || sx > eye.x + CANVAS_WIDTH / 2 + 20) continue;
      const k = ((tx / TL) % 3 + 3) % 3;
      stamp(c, `q-edge-${k}-${tod.key}`, tx - 60, GY - 230, TL + 120, 236, g => {
        g.save(); g.translate(tx, 0);
        for (let i = 0; i < 3; i++) {
          const px = 80 + i * 170 + hash(k * 7 + i) * 40, ph = 150 + hash(k + i * 3) * 50;
          g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(px, GY); g.quadraticCurveTo(px + 10, GY - ph / 2, px + 4, GY - ph); g.stroke();
          g.strokeStyle = farTint('#6A5438', 0.7); g.lineWidth = 5; g.stroke();
          for (let r = 0; r < ph; r += 8) box(g, px + 2 + Math.sin(r * 0.02) * 4, GY - r, 4, 1, farTint('#4A3A26', 0.7));
          for (let f2 = 0; f2 < 7; f2++) { const ang = -Math.PI / 2 + (f2 - 3) * 0.55; jleaf(g, px + 4, GY - ph, 34, ang, lf, f2 < 3 ? 4 : 3); }
        }
        for (let i = 0; i < 9; i++) jclump(g, 20 + i * 58 + hash(k * 3 + i) * 20, GY - 26 - hash(i + k) * 20, 36, 26, k * 31 + i * 5, lf, 1);
        // (banana plants: big paddle leaves, a hand of green bananas)
        for (let i = 0; i < 2; i++) {
          const bx = 150 + i * 220 + hash(k + i * 9) * 30;
          for (let f2 = 0; f2 < 5; f2++) jbig(g, bx, GY - 30, 18, -Math.PI / 2 + (f2 - 2) * 0.6, lf, 3);
          box(g, bx - 3, GY - 70, 6, 40, lf[2]); for (let b2 = 0; b2 < 4; b2++) box(g, bx + 4, GY - 56 + b2 * 4, 6, 3, farTint('#9AB23A', 0.7));
        }
        for (let i = 0; i < 14; i++) jfern(g, 10 + i * 38, GY, 22 + hash(i * 3 + k) * 10, i + k * 20, 0, lf, 3);
        g.restore();
      });
    }
  }
  c.restore();
  // The house's floor: planks running back, banded darker the further under the roof; a seam at every lane
  const shade = tod.dark > 0.1 ? 0.5 : 0.38;
  const depths = [EAVE_S, ...[...LANES].reverse(), WALL_S].sort((a, b) => b - a);
  for (let i = 0; i < depths.length - 1; i++) {
    const s0 = depths[i], s1 = depths[i + 1];
    quad(c, P(eye, R(HALL.a), GY, s0), P(eye, R(HALL.b), GY, s0), P(eye, R(HALL.b), GY, s1), P(eye, R(HALL.a), GY, s1), mix(FLOOR, '#1A120A', shade * (0.4 + i * 0.12)));
    seg(c, P(eye, R(HALL.a), GY, s1), P(eye, R(HALL.b), GY, s1), mix(FLOOR, '#120C06', 0.6), 1);
  }
  // (the planks' seams, all running back toward where he's looking)
  c.strokeStyle = 'rgba(26, 14, 6, 0.45)'; c.lineWidth = 1; c.beginPath();
  for (let x = HALL.a; x <= HALL.b; x += 22) { const a = P(eye, R(x), GY, EAVE_S), b = P(eye, R(x), GY, WALL_S); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  c.stroke();
  // (the planks' butt joints staggered, knots, nail heads; a worn pale track along each lane where the feet go)
  for (let i = 0; i < depths.length - 1; i++) {
    const s0 = depths[i], s1 = depths[i + 1], sm = (s0 + s1) / 2;
    for (let x = HALL.a + 11; x < HALL.b; x += 22) {
      const h = hash(x * 0.13 + i * 7.7);
      if (h > 0.55) { const p0 = P(eye, R(x - 11), GY, sm + (s0 - s1) * (h - 0.75)), p1 = P(eye, R(x + 11), GY, sm + (s0 - s1) * (h - 0.75)); seg(c, p0, p1, 'rgba(26, 14, 6, 0.55)', 1); }
      if (h < 0.12) { const [kx, ky] = P(eye, R(x), GY, sm); box(c, kx - 2 * sm, ky, 4 * sm, 1, 'rgba(40, 22, 8, 0.6)'); }
      if (h > 0.3 && h < 0.36) { const [nx, ny] = P(eye, R(x - 9), GY, s1 + (s0 - s1) * 0.15); box(c, nx, ny, 1, 1, 'rgba(200, 200, 210, 0.5)'); }
    }
  }
  for (const s of LANES) {
    const s0 = Math.min(EAVE_S, s + 0.035), s1 = s + 0.012;
    quad(c, P(eye, R(HALL.a + 30), GY, s0), P(eye, R(HALL.b - 30), GY, s0), P(eye, R(HALL.b - 30), GY, s1), P(eye, R(HALL.a + 30), GY, s1), 'rgba(232, 200, 144, 0.08)');
  }
  // (the strip in front of the eave, out in the light: the same planks, lit)
  quad(c, P(eye, R(HALL.a), GY, 1), P(eye, R(HALL.b), GY, 1), P(eye, R(HALL.b), GY, EAVE_S), P(eye, R(HALL.a), GY, EAVE_S), mix(FLOOR, '#E8C890', 0.15));
};

/** The far wall: dark planks, old safari posters, a lantern or two, the door the line goes in at. */
const drawFarWall = (c: Ctx, eye: Eye, f: number) => {
  atDepth(c, eye, WALL_S);
  const a = R(HALL.a), b = R(HALL.b), top = EAVE_Y - 10, wall = '#3A2A1A';
  stamp(c, 'q-farwall', a, top, b - a, GY - top, g => {
    // (woven mat panels between bamboo uprights: the weave in two tones, stepped darker up under the roof)
    const mat = rampOf('#6A5032');
    box(g, a, top, b - a, GY - top, wall);
    for (let y = top; y < GY - 44; y += 4) for (let x = a; x < b; x += 4) {
      const k = ((x - a) >> 2) + ((y - top) >> 2);
      box(g, x, y, 4, 4, k % 2 ? mat[1] : mat[2]);
      box(g, x + (k % 2 ? 0 : 3), y, 1, 4, mat[0]);
    }
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(16, 10, 4, ${(0.42 - i * 0.07).toFixed(3)})`; g.fillRect(a, top + i * 14, b - a, 14); }
    for (let x = a; x < b; x += 92) bamboo(g, x - 4, top, GY, 8, mix(BAMBOO, '#3A2A1A', 0.35));
    // (the wainscot: planks along the foot, scuffed by three hours of shoes)
    const wp = rampOf('#4A3420');
    box(g, a, GY - 44, b - a, 44, wp[2]);
    for (let y = GY - 44; y < GY; y += 11) { box(g, a, y, b - a, 1, wp[0]); box(g, a, y + 1, b - a, 1, wp[3]); }
    for (let k = 0; k < 60; k++) box(g, a + hash(k * 3.1) * (b - a), GY - 8 - hash(k) * 10, 6 + hash(k * 2) * 8, 1, wp[1]);
    box(g, a, GY - 46, b - a, 2, wp[4]);
    // (the posters, old, pinned up, a corner curling: each its own painted ad, its title along the foot)
    const POSTERS: [number, string, string, string][] = [
      [140, '#2E6A5A', 'JUNGLE CRUISE', 'cruise'], [440, '#2A6A9A', 'THE FALLS', 'falls'], [680, '#7A4A8A', 'HIPPO POOL', 'hippo'],
      [800, '#C8963A', 'YOUR SKIPPER', 'skip'], [1110, '#4A7A3A', 'ELEPHANTS', 'ele'],
    ];
    for (const [px, col, title, what] of POSTERS) {
      const x = a + px - HALL.a, y = GY - 214, w = 84, h = 96, P = rampOf(col);
      // (the bamboo frame)
      box(g, x - 5, y - 5, w + 10, h + 10, INK); box(g, x - 4, y - 4, w + 8, h + 8, rampOf(BAMBOO)[1]); box(g, x - 4, y - 4, w + 8, 1, rampOf(BAMBOO)[3]);
      box(g, x - 1, y - 1, w + 2, h + 2, INK);
      // (the art: a banded sky in the poster's own colors, then the picture)
      for (let k = 0; k < 4; k++) box(g, x, y + k * 9, w, 9, mix(lite(col, 0.55), P[2], k / 4));
      box(g, x, y + 36, w, h - 36, P[1]);
      if (what === 'cruise') {
        box(g, x, y + 54, w, 20, '#3A7A9A'); for (let k = 0; k < 5; k++) box(g, x + 6 + k * 13, y + 60 + (k % 2) * 6, 8, 1, '#BCE4F0');
        for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#2E7230' : '#3A8A3A'; g.beginPath(); g.ellipse(x + 6 + k * 12, y + 46, 10, 10, 0, Math.PI, 0); g.fill(); }
        box(g, x + 14, y + 52, 42, 7, '#F1EFEA'); box(g, x + 14, y + 57, 42, 2, '#8A3A1E');
        for (let k = 0; k < 6; k++) box(g, x + 14 + k * 7, y + 38, 7, 4, k % 2 ? '#F1EFEA' : '#2E7A4A');
        box(g, x + 16, y + 42, 1, 10, '#5A3A1A'); box(g, x + 54, y + 42, 1, 10, '#5A3A1A');
      } else if (what === 'falls') {
        box(g, x + 4, y + 20, 18, 52, '#3A5A3A'); box(g, x + 48, y + 20, 18, 52, '#2E4A2E');
        for (let k = 0; k < 13; k++) box(g, x + 22 + k * 2, y + 20, 2, 52, k % 3 ? '#9AD0E8' : '#E8F8FF');
        for (let k = 0; k < 6; k++) { g.fillStyle = '#F4FAFC'; g.beginPath(); g.arc(x + 24 + k * 5, y + 72, 4, 0, Math.PI * 2); g.fill(); }
        // (and round the back of it, a little skipper pointing: you'll get it on the ride)
        box(g, x + 56, y + 52, 4, 10, '#E8D8A8'); box(g, x + 55, y + 47, 6, 5, '#E0B088'); box(g, x + 54, y + 46, 8, 2, '#E8D8A8'); box(g, x + 50, y + 54, 6, 1, '#E0B088');
      } else if (what === 'hippo') {
        box(g, x, y + 50, w, 26, '#3A6A8A'); for (let k = 0; k < 6; k++) box(g, x + 4 + k * 11, y + 58 + (k % 2) * 8, 7, 1, '#9ACAE0');
        for (const [hx, hs] of [[x + 20, 1], [x + 50, 0.8]] as [number, number][]) {
          g.fillStyle = '#8A6A9A'; g.beginPath(); g.ellipse(hx, y + 52, 14 * hs, 9 * hs, 0, Math.PI, 0); g.fill();
          box(g, hx - 9 * hs, y + 44 - 6 * hs, 4, 4, '#8A6A9A'); box(g, hx + 5 * hs, y + 44 - 6 * hs, 4, 4, '#8A6A9A');
          box(g, hx - 6 * hs, y + 46, 3, 2, '#FFFFFF'); box(g, hx + 3 * hs, y + 46, 3, 2, '#FFFFFF'); box(g, hx - 5 * hs, y + 46, 1, 2, INK); box(g, hx + 4 * hs, y + 46, 1, 2, INK);
        }
      } else if (what === 'skip') {
        // (the skipper: the safari hat, the grin, the thumbs up: it's Artie, and he's very funny)
        box(g, x + 20, y + 30, 30, 8, '#E8D8A8'); box(g, x + 14, y + 37, 42, 4, '#E8D8A8'); box(g, x + 20, y + 35, 30, 2, '#8A3A1E');
        box(g, x + 22, y + 41, 26, 22, '#E8B890'); box(g, x + 26, y + 46, 4, 4, INK); box(g, x + 40, y + 46, 4, 4, INK);
        box(g, x + 26, y + 54, 18, 5, INK); box(g, x + 27, y + 54, 16, 2, '#FFFFFF');
        box(g, x + 18, y + 63, 34, 20, '#C8B07A'); box(g, x + 33, y + 63, 4, 20, '#A8905A');
        box(g, x + 52, y + 58, 8, 10, '#E8B890'); box(g, x + 54, y + 52, 4, 7, '#E8B890');
      } else {
        box(g, x, y + 60, w, 16, '#3A7A9A');
        box(g, x + 14, y + 40, 32, 20, '#7A7A84'); box(g, x + 40, y + 34, 16, 16, '#7A7A84'); box(g, x + 52, y + 44, 5, 16, '#7A7A84'); box(g, x + 16, y + 58, 7, 8, '#6A6A72'); box(g, x + 36, y + 58, 7, 8, '#6A6A72');
        box(g, x + 47, y + 40, 2, 2, INK); box(g, x + 14, y + 40, 32, 2, '#9A9AA4');
        for (let k = 0; k < 7; k++) box(g, x + 56 + Math.sin(k) * 2, y + 20 + k * 3, 2, 2, '#BCE4F0');
      }
      // (the title band, the ad's lettering)
      box(g, x, y + h - 20, w, 20, P[0]); box(g, x, y + h - 20, w, 1, P[3]);
      signAt(g, title, x + w / 2, y + h - 7, 5, print(5, '#F4E8C8', INK));
      // (age: the corner curling, a tear, a pin)
      poly4(g, [[x + w, y], [x + w - 10, y], [x + w, y + 10]], dark(col, 0.1)); poly4(g, [[x + w - 10, y], [x + w, y + 10], [x + w - 6, y + 6]], '#D8C8A0');
      box(g, x + 6, y + 30, 1, 10, P[0]); box(g, x + 3, y + 1, 3, 3, '#C81E1E');
    }
    // (THE RIVERS OF ADVENTURE: a big map on parchment, the river winding, the route dotted, X marks the hippos)
    {
      const mx = a + 262 - HALL.a, my = GY - 220, mw = 150, mh = 104;
      box(g, mx - 3, my - 3, mw + 6, mh + 6, INK); box(g, mx - 2, my - 2, mw + 4, mh + 4, '#5A3A1E');
      const pr = rampOf('#D8C49A');
      box(g, mx, my, mw, mh, pr[2]); box(g, mx, my, mw, 2, pr[3]);
      for (let k = 0; k < 30; k++) box(g, mx + hash(k * 7) * (mw - 6), my + hash(k * 3) * (mh - 4), 3 + hash(k) * 6, 1, pr[1]);
      g.strokeStyle = '#4A8AAA'; g.lineWidth = 5; g.beginPath(); g.moveTo(mx + 6, my + 80); g.bezierCurveTo(mx + 40, my + 20, mx + 70, my + 100, mx + 100, my + 50); g.quadraticCurveTo(mx + 120, my + 26, mx + mw - 6, my + 30); g.stroke();
      g.strokeStyle = '#8ACAE0'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#B81E1E'; for (let k = 0; k < 9; k++) { const t2 = k / 9; g.fillRect(mx + 8 + t2 * 130, my + 66 - Math.sin(t2 * 6) * 18, 2, 2); }
      for (const [xx, yy] of [[mx + 46, my + 40], [mx + 108, my + 60]]) { box(g, xx - 3, yy - 3, 2, 2, '#2A1A0A'); box(g, xx + 1, yy + 1, 2, 2, '#2A1A0A'); box(g, xx + 1, yy - 3, 2, 2, '#2A1A0A'); box(g, xx - 3, yy + 1, 2, 2, '#2A1A0A'); }
      for (let k = 0; k < 7; k++) { g.fillStyle = '#4A7A3A'; g.beginPath(); g.arc(mx + 14 + k * 20, my + 18 + (k % 2) * 70, 6, 0, Math.PI * 2); g.fill(); }
      box(g, mx + mw - 20, my + mh - 22, 14, 14, pr[1]); box(g, mx + mw - 14, my + mh - 26, 2, 22, '#2A1A0A'); box(g, mx + mw - 24, my + mh - 16, 22, 2, '#2A1A0A');
      signAt(g, 'THE RIVERS OF ADVENTURE', mx + mw / 2, my + 10, 5, print(5, '#3A1A0A'));
    }
    // (the chalkboard: today's skipper, the boats running)
    {
      const cx = a + 570 - HALL.a, cy = GY - 196, cw = 76, ch = 56;
      box(g, cx - 4, cy - 4, cw + 8, ch + 8, '#5A3A1E'); box(g, cx - 4, cy - 4, cw + 8, 1, '#8A5A2E');
      box(g, cx, cy, cw, ch, '#1E2E26'); for (let k = 0; k < 14; k++) box(g, cx + hash(k * 5) * (cw - 10), cy + hash(k * 9) * (ch - 4), 8, 1, '#2E3E36');
      signAt(g, "TODAY'S", cx + cw / 2, cy + 11, 5, print(5, '#E8E8E0'));
      signAt(g, 'SKIPPER:', cx + cw / 2, cy + 20, 5, print(5, '#E8E8E0'));
      signAt(g, 'ARTIE', cx + cw / 2, cy + 31, 5, print(5, '#F8E070'));
      signAt(g, 'BOATS: 1/9', cx + cw / 2, cy + 46, 5, print(5, '#F0A0A0'));
      box(g, cx + 6, cy + ch + 1, 10, 2, '#E8E8E0');
    }
    // (a shelf of junk: a lantern, a radio, a croc skull, rope; oars crossed and a life ring on the wall)
    {
      const sx = a + 920 - HALL.a, sy = GY - 150;
      box(g, sx, sy, 80, 4, '#6A4A2A'); box(g, sx, sy, 80, 1, '#9A7A4A'); for (const bx of [sx + 6, sx + 70]) poly4(g, [[bx, sy + 4], [bx + 4, sy + 4], [bx + 4, sy + 16]], '#4A3220');
      box(g, sx + 4, sy - 14, 9, 14, INK); box(g, sx + 5, sy - 13, 7, 12, '#C8A060');
      box(g, sx + 20, sy - 16, 22, 16, INK); box(g, sx + 21, sy - 15, 20, 14, '#6A4A2A'); box(g, sx + 23, sy - 12, 8, 8, '#2A2A2A'); box(g, sx + 34, sy - 12, 4, 4, '#C8C0A0'); box(g, sx + 38, sy - 26, 1, 10, '#8A8A8A');
      box(g, sx + 48, sy - 8, 26, 8, '#E8E0C8'); for (let k = 0; k < 6; k++) box(g, sx + 50 + k * 4, sy - 3, 2, 3, '#FFFFFF'); box(g, sx + 52, sy - 7, 4, 3, INK);
      g.fillStyle = '#C8A86A'; g.beginPath(); g.ellipse(sx + 40, sy + 30, 12, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7A6236'; g.beginPath(); g.ellipse(sx + 40, sy + 30, 6, 3, 0, 0, Math.PI * 2); g.fill();
      const ox = sx + 130, oy = GY - 190;
      for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(ox - s * 20, oy - 20); g.lineTo(ox + s * 20, oy + 40); g.stroke(); g.strokeStyle = '#B08A5C'; g.lineWidth = 3; g.stroke(); }
      g.fillStyle = INK; g.beginPath(); g.arc(ox, oy + 62, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F1EFEA'; g.beginPath(); g.arc(ox, oy + 62, 14, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 4; i++) { g.fillStyle = '#C81E1E'; g.beginPath(); g.moveTo(ox, oy + 62); g.arc(ox, oy + 62, 14, i * Math.PI / 2, i * Math.PI / 2 + 0.6); g.fill(); }
      g.fillStyle = '#3A2A1A'; g.beginPath(); g.arc(ox, oy + 62, 7, 0, Math.PI * 2); g.fill();
    }
    // (pith helmets on pegs, by the door)
    for (let k = 0; k < 4; k++) { const hx = a + 1236 - HALL.a + k * 18, hy = GY - 120; box(g, hx, hy, 2, 6, '#3A2A1A'); g.fillStyle = INK; g.beginPath(); g.ellipse(hx + 1, hy + 10, 9, 7, 0, Math.PI, 0); g.fill(); g.fillStyle = '#E8DCB0'; g.beginPath(); g.ellipse(hx + 1, hy + 10, 8, 6, 0, Math.PI, 0); g.fill(); box(g, hx - 8, hy + 9, 18, 2, '#C8B888'); }
    // (the door the line goes in at: dark, a bulb over it)
    const dx = a + DOOR.x - HALL.a;
    box(g, dx - 6, GY - 140, DOOR.w + 12, 140, '#22180E'); box(g, dx, GY - 132, DOOR.w, 132, '#0A0604');
    box(g, dx - 6, GY - 140, DOOR.w + 12, 4, '#5A4430');
    // (a sign over it, painted on the wall: the line goes on)
    box(g, dx - 20, GY - 172, DOOR.w + 40, 22, '#1A120A'); box(g, dx - 18, GY - 170, DOOR.w + 36, 18, '#C8A050');
    signAt(g, 'QUEUE', dx + DOOR.w / 2, GY - 157, 8, plank({ sx: 1, sy: 2 }, '#3A1A08', '#C8A050'));
  });
  // (lanterns along it, lit as the day goes)
  const lamps = timeOfDay().lamps;
  for (const lx of [380, 650, 920, 1180]) {
    const x = R(lx), y = GY - 210;
    box(c, x - 4, y, 9, 12, INK); box(c, x - 3, y + 1, 7, 10, lamps > 0.15 ? '#FFC870' : '#7A6A4A');
    if (lamps > 0.15) steppedGlow(c, x, y + 6, 40, '#FFC060', 0.25 * lamps, 0, 4);
  }
  c.restore();
};

/** The roof's posts (bamboo, lashed) at a depth, every `every` (relative). */
const posts = (c: Ctx, eye: Eye, s: number, every: number, from = HALL.a, to = HALL.b) => {
  atDepth(c, eye, s);
  for (let x = from; x <= to + 1; x += every) {
    bamboo(c, R(x) - 5, EAVE_Y, GY, 10);
    lash(c, R(x) - 6, EAVE_Y + 6, 12, 6); lash(c, R(x) - 6, GY - 70, 12, 5);
  }
  c.restore();
};

/** Signs hung on ropes from the eave over the near lane: how long from here (it gets longer, the further along). */
const HUNG: [number, string, string][] = [[285, 'WAIT FROM HERE', '3 HRS'], [760, 'WAIT FROM HERE', '3 HRS 10 MIN'], [1240, 'WAIT FROM HERE', '3 HRS 35 MIN']];
const hungSigns = (c: Ctx, eye: Eye, f: number) => {
  atDepth(c, eye, EAVE_S);
  for (const [x, a, b] of HUNG) {
    const sx = R(x), sy = EAVE_Y + 26, sw = Math.round(c.measureText ? 96 : 96), sway = Math.round(Math.sin(f * 0.02 + x) * 1);
    box(c, sx - 34, EAVE_Y + 4, 1, 22, '#8A7048'); box(c, sx + 34, EAVE_Y + 4, 1, 22, '#8A7048');
    stamp(c, `q-hung-${x}`, sx - sw / 2 - 6 + sway, sy - 6, sw + 12, 40, g => {
      sign(g, sx - sw / 2 + sway, sy, sw, 26, '#2E4A2A', '', '#000', 5, '#6A4A2A');
      signAt(g, a, sx + sway, sy + 10, 5, plank(5, '#E8D8A0', '#2E4A2A', '#122012', x));
      signAt(g, b, sx + sway, sy + 21, 6, plank(6, '#F4C040', '#2E4A2A', '#122012', x + 1));
    });
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The near lane (live: they talk, they turn and glare as he goes by)

const homes = new WeakMap<Guest, { x: number; facing: 1 | -1 }>();
/** The near line, put at its depth this frame (so it slides by at its own speed), the ones he's passing glaring. */
const placeNear = (eye: Eye, gs: Guest[], px: number) => {
  for (const g of gs) {
    let h = homes.get(g);
    if (!h) { h = { x: g.x, facing: g.facing }; homes.set(g, h); }
    const [x, y] = P(eye, h.x, GY, NEAR_S);
    g.x = x; g.y = y; g.scale = GUEST_SCALE * NEAR_S;
    // (him going by: they turn to look; once he's well past, back to the front)
    g.facing = Math.abs(px - x) < 170 ? (px < x ? -1 : 1) : h.facing;
  }
};

/** The near rails (in front of the near lane, a little nearer), along a stretch. */
const nearRails = (c: Ctx, eye: Eye, from: number, to: number) => {
  atDepth(c, eye, RAIL_S);
  laneRails(c, from, to);
  c.restore();
};

/** The chain-link out back (between the alley and the line): posts, rails, the mesh. */
const chainLink = (c: Ctx, eye: Eye, from: number, to: number) => {
  atDepth(c, eye, LINK_S);
  const top = GY - 150, a = R(from), b = R(to);
  const mesh = tilePattern(c, 'q-chainlink', 12, 12, g => {
    g.fillStyle = 'rgba(190, 200, 210, 0.5)';
    for (let i = 0; i < 12; i++) { g.fillRect(i, i, 1, 1); g.fillRect(11 - i, i, 1, 1); }
    g.fillStyle = 'rgba(240, 245, 250, 0.45)'; g.fillRect(0, 0, 1, 1); g.fillRect(6, 6, 1, 1);
  });
  c.fillStyle = mesh; c.fillRect(a, top, b - a, GY - top);
  for (let x = from; x <= to; x += 130) { const r = rampOf('#9AA4AE'); box(c, R(x) - 3, top - 4, 6, GY - top + 4, INK); box(c, R(x) - 2, top - 4, 4, GY - top + 4, r[2]); box(c, R(x) - 2, top - 4, 1, GY - top + 4, r[4]); ball(c, R(x), top - 5, 3, '#9AA4AE'); }
  box(c, a, top - 1, b - a, 4, INK); box(c, a, top, b - a, 2, '#C8D0D8'); box(c, a, GY - 8, b - a, 3, '#8A949E');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// In front: the arch and its board, the crates, the staff gate, the alley's things, the dock

/** The entrance: two logs, a beam, a thatched cap, the carved name board, and the wait-time board hung under it. */
const arch = (c: Ctx, f: number) => {
  const a = R(30), b = R(250);
  stamp(c, 'q-arch', a - 30, GY - 372, b - a + 82, 372, g => {
    // (the cap: a thatched hat on the beam, its fringe)
    g.save(); g.beginPath(); g.moveTo(a - 26, GY - 300); g.lineTo(a + 20, GY - 362); g.lineTo(b + 22, GY - 362); g.lineTo(b + 50, GY - 300); g.closePath(); g.clip();
    for (let y = GY - 364; y < GY - 300; y += 9) { g.fillStyle = rampOf(STRAW)[(y >> 3) % 2 ? 1 : 2]; g.fillRect(a - 30, y, b - a + 84, 9); for (let x = a - 30; x < b + 54; x += 2) { const k = hash(x * 0.37 + y); g.fillStyle = k < 0.3 ? rampOf(STRAW)[0] : k < 0.7 ? rampOf(STRAW)[2] : rampOf(STRAW)[3]; g.fillRect(x, y + 5, 2, 4 + Math.floor(k * 6)); } }
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(a - 26, GY - 300); g.lineTo(a + 20, GY - 362); g.lineTo(b + 22, GY - 362); g.lineTo(b + 50, GY - 300); g.stroke();
    fringe(g, a - 26, b + 50, GY - 302, 16);
    // (the logs, the beam across, lashed)
    logPost(g, a - 11, GY - 300, GY, 22);
    logPost(g, b - 11, GY - 300, GY, 22);
    logBeam(g, a - 22, b + 34, GY - 300, 18);
    lash(g, a - 12, GY - 300, 24, 10); lash(g, b - 12, GY - 300, 24, 10);
    // (the carved board up on the beam: JUNGLE CRUISE, a skull's grin either end for the adventure of it)
    const bx = a + 16, bw = b - a - 32;
    sign(g, bx, GY - 344, bw, 34, '#D8B878', '', '#000', 8, '#6A3A1A');
    signAt(g, 'JUNGLE CRUISE', (a + b) / 2, GY - 323, 10, carved({ sx: 2, sy: 2 }, '#5A1A0A', '#F0D8A0', 3));
    for (const sx of [bx + 10, bx + bw - 10]) { ball(g, sx, GY - 328, 5, '#EDE4C8'); box(g, sx - 3, GY - 330, 2, 2, INK); box(g, sx + 1, GY - 330, 2, 2, INK); box(g, sx - 2, GY - 325, 4, 1, INK); }
    // (the chains the board hangs on)
    for (const cx of [a + 40, b - 40]) for (let y = GY - 282; y < GY - 240; y += 5) { box(g, cx - 1, y, 3, 4, '#5A5A60'); box(g, cx, y + 1, 1, 2, '#9A9AA0'); }
  });
  // The wait-time board: green, three slats of flip numbers (live: a number flips now and then)
  const bx = R(42), by = GY - 240, bw = 196, bh = 76;
  stamp(c, 'q-waitboard', bx - 6, by - 6, bw + 12, bh + 12, g => {
    sign(g, bx, by, bw, bh, '#244A2C', '', '#000', 6, '#6A4A2A');
    signAt(g, 'WAIT TIMES', bx + bw / 2, by + 11, 6, plank(6, '#F0D890', '#244A2C', '#0E1E10', 2));
    const rows: [string, string][] = [['STANDBY', '180'], ['FAST PASS', '175'], ['EXTRA FAST PASS', '185']];
    rows.forEach(([n, v], i) => {
      const y = by + 18 + i * 18;
      box(g, bx + 6, y, bw - 12, 15, '#1A3220');
      signAt(g, n, bx + 10, y + 11, 5, enamel(5, i === 2 ? '#F8A0C8' : '#E8E0C0', '#0A140C'), 'left');
      for (let k = 0; k < 3; k++) { const tx = bx + bw - 66 + k * 13; box(g, tx, y + 1, 11, 13, '#0A0A0A'); box(g, tx, y + 7, 11, 1, '#2A2A2A'); signAt(g, v[k], tx + 6, y + 11, 7, print(7, '#F8E070')); }
      signAt(g, 'MIN', bx + bw - 14, y + 11, 5, enamel(5, '#E8E0C0', '#0A140C'));
    });
  });
  // (now and then a number flaps over: the extra fast pass going up a minute that never shows)
  const t = f % 420;
  if (t < 8) { const tx = bx + bw - 66 + 2 * 13, y = by + 18 + 2 * 18; box(c, tx, y + 1, 11, 6 - (t >> 1), '#2A2A2A'); }
};

/** A crate: planks, battens, a stenciled word or two. */
const CRATE_WORDS = ['BANANAS', 'QUININE', 'IDOLS', 'SNAKES?', 'FRAGILE'];
const crateFront = (x: number, top: number, w: number, h: number, i: number) => (g: Ctx) => {
  const r = rampOf('#A8743A');
  box(g, x, top, w, h, r[2]);
  for (let y = top + 2; y < top + h; y += 10) { box(g, x, y, w, 1, r[1]); box(g, x, y + 1, w, 1, r[3]); }
  box(g, x, top, 5, h, r[1]); box(g, x + w - 5, top, 5, h, r[1]); box(g, x, top + h - 5, w, 5, r[1]); box(g, x, top, w, 5, r[3]);
  // (a batten across, corner to corner)
  g.strokeStyle = r[1]; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 4, top + h - 4); g.lineTo(x + w - 4, top + 6); g.stroke();
  g.strokeStyle = r[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4, top + h - 7); g.lineTo(x + w - 6, top + 4); g.stroke();
  for (const [nx, ny] of [[x + 2, top + 2], [x + w - 4, top + 2], [x + 2, top + h - 4], [x + w - 4, top + h - 4]]) box(g, nx, ny, 2, 2, '#3A3A3A');
  const word = CRATE_WORDS[i % CRATE_WORDS.length];
  stencil(g, word, x + w / 2, top + h / 2 + 3, 'rgba(40, 20, 8, 0.75)', 5);
  if (h > 80) { stencil(g, 'THIS', x + w / 2, top + 22, 'rgba(40, 20, 8, 0.55)', 5); stencil(g, 'SIDE UP', x + w / 2, top + 30, 'rgba(40, 20, 8, 0.55)', 5); }
  g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 1, top + 1, w - 2, h - 2);
};

/** The staff gate: a tall teal fence panel (stood on: its cap lit), CAST MEMBERS ONLY on it. */
const staffGate = (c: Ctx, eye: Eye, F: QueueSpots['fence']) => {
  const x = R(F.x), top = GY - F.h;
  box3d(c, eye, x, top, F.w, GY, 0.035, '#2A6A60', { key: 'q-gate', paint: g => {
    const r = rampOf('#2A6A60');
    box(g, x, top, F.w, F.h, r[2]);
    for (let k = 0; k < F.w; k += 6) { box(g, x + k, top, 1, F.h, r[1]); box(g, x + k + 1, top, 1, F.h, r[3]); }
    box(g, x, top + 20, F.w, 4, r[1]); box(g, x, GY - 30, F.w, 4, r[1]);
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 1, top + 1, F.w - 2, F.h - 2);
  } }, lite('#2A6A60', 0.3));
  // (the sign on it: hung off its front, a little wider than it)
  stamp(c, 'q-gate-sign', x - 36, GY - 118, F.w + 72, 40, g => {
    sign(g, x - 30, GY - 112, F.w + 60, 28, '#F4F0E0', '', '#000', 5, '#5A5A60');
    signAt(g, 'CAST MEMBERS', x + F.w / 2, GY - 101, 5, enamel(5, '#A8221A'));
    signAt(g, 'ONLY', x + F.w / 2, GY - 90, 5, enamel(5, '#A8221A'));
  });
};

/** The dumpster: green, its lid propped on a bag, HAPPYLAND WASTE on it; flies. */
const dumpster = (c: Ctx, eye: Eye, D: QueueSpots['dumpster'], f: number) => {
  const x = R(D.x), top = GY - D.h;
  box3d(c, eye, x, top, D.w, GY - 6, 0.06, '#2F6A3A', { key: 'q-dumpster', paint: g => {
    const r = rampOf('#2F6A3A');
    box(g, x, top, D.w, D.h - 6, r[2]); box(g, x, top, D.w, 6, r[3]);
    for (let k = 12; k < D.w; k += 18) { box(g, x + k, top + 8, 3, D.h - 18, r[1]); box(g, x + k + 3, top + 8, 1, D.h - 18, r[3]); }
    box(g, x + 3, top + 18, D.w - 6, 12, '#E8E0C8'); signAt(g, 'HAPPYLAND WASTE', x + D.w / 2, top + 28, 5, print(5, '#2A3A2A'));
    for (let k = 0; k < 6; k++) box(g, x + 4 + k * 15, top + D.h - 14, 6, 3, '#6A4A2A');
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 1, top + 1, D.w - 2, D.h - 8);
  } }, '#3A7A4A');
  // (the wheels; a trash bag sticking out from under the lid)
  for (const wx of [x + 10, x + D.w - 16]) { box(c, wx - 1, GY - 7, 8, 7, INK); box(c, wx, GY - 6, 6, 5, '#3A3A3A'); }
  // (flies)
  for (let k = 0; k < 4; k++) { const a = f * 0.09 + k * 1.7; box(c, x + D.w / 2 + Math.cos(a) * (14 + k * 4), top - 14 + Math.sin(a * 1.3) * 7, 2, 2, '#111'); }
};

/** The AC unit: gray, louvers down its front, the fan going on top, a puddle under its drip. */
const acUnit = (c: Ctx, eye: Eye, A: QueueSpots['ac'], f: number) => {
  const x = R(A.x), top = GY - A.h;
  box3d(c, eye, x, top, A.w, GY, 0.07, '#9AA0A8', { key: 'q-ac', paint: g => {
    const r = rampOf('#9AA0A8');
    box(g, x, top, A.w, A.h, r[2]);
    for (let y = top + 10; y < GY - 8; y += 5) { box(g, x + 6, y, A.w - 12, 2, r[1]); box(g, x + 6, y + 2, A.w - 12, 1, r[3]); }
    box(g, x + 6, GY - 8, A.w - 12, 4, r[0]);
    box(g, x + A.w - 18, top + 4, 12, 4, '#E8E0C0');
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 1, top + 1, A.w - 2, A.h - 2);
  } });
  // (the fan on top, seen from above: its grille, its blades going round)
  const [cx, cy] = P(eye, x + A.w / 2, top, 1 - 0.035);
  c.save(); c.translate(cx, cy); c.scale(1, 0.22);
  c.fillStyle = '#3A3E44'; c.beginPath(); c.arc(0, 0, 24, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#6A7078';
  for (let k = 0; k < 3; k++) { const a = f * 0.4 + (k * Math.PI * 2) / 3; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 21, a, a + 0.7); c.closePath(); c.fill(); }
  c.strokeStyle = '#B8BEC6'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 24, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.stroke();
  c.restore();
  // (the drip and its puddle)
  const t = f % 70; if (t < 40) box(c, x + 8, GY - 6 + t * 0.15, 1, 2, '#9AD0F0');
  box(c, x - 6, GY - 1, 26, 2, 'rgba(120, 180, 220, 0.5)');
};

/** The pallets: one laid across two sawhorses (stood on: its top lit), more stacked against the wall behind. */
const pallets = (c: Ctx, eye: Eye, Pl: QueueSpots['pallets']) => {
  const x = R(Pl.x), top = GY - Pl.y;
  const r = rampOf('#B08850');
  for (const sx of [x + 8, x + Pl.w - 22]) {
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(sx, top + 12); c.lineTo(sx - 6, GY); c.moveTo(sx + 14, top + 12); c.lineTo(sx + 20, GY); c.stroke();
    c.strokeStyle = r[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, top + 12); c.lineTo(sx - 6, GY); c.moveTo(sx + 14, top + 12); c.lineTo(sx + 20, GY); c.stroke();
    box(c, sx - 2, top + 12, 18, 4, r[1]);
  }
  box3d(c, eye, x, top, Pl.w, top + 12, 0.05, '#B08850', { key: 'q-pallet', paint: g => {
    box(g, x, top, Pl.w, 12, r[0]);
    for (let k = 0; k < Pl.w; k += 15) { box(g, x + k, top, 11, 3, r[3]); }
    for (const bx of [0, Pl.w / 2 - 5, Pl.w - 10]) box(g, x + bx, top + 3, 10, 9, r[2]);
    g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(x + 0.5, top + 0.5, Pl.w - 1, 11);
  } });
};

/** A sign on a pole (a stake in the ground): `lines` of words on a board. */
const poleSign = (c: Ctx, key: string, x: number, w: number, h: number, face: string, frame: string, lines: [string, string, number][], high = 70) => {
  const top = GY - high - h;
  stamp(c, key, x - w / 2 - 6, top - 6, w + 12, high + h + 8, g => {
    box(g, x - 3, top + h, 6, high, INK); box(g, x - 2, top + h, 4, high, '#8A8E96'); box(g, x - 2, top + h, 1, high, '#C8CCD2');
    sign(g, x - w / 2, top, w, h, face, '', '#000', 5, frame);
    lines.forEach(([s, col, size], i) => signAt(g, s, x, top + 4 + (h - 4) * ((i + 0.75) / lines.length), size, size >= 10 ? plank(size, col, undefined, undefined, i) : enamel(size, col)));
  });
};

/** The alley's smaller things: the butt can under NO SMOKING, the mop bucket and its sign, the incident board, the
 *  zip-tied arrows on the chain-link. Not stood on: low, dimmer, no lit tops. */
const alleyBits = (c: Ctx, eye: Eye, f: number) => {
  // NO SMOKING (and the can under it, full of butts)
  poleSign(c, 'q-nosmoke', R(700), 64, 30, '#F4F0E8', '#8A1A1A', [['NO', '#B01818', 6], ['SMOKING', '#B01818', 6]], 76);
  { const bx = R(722); box(c, bx - 1, GY - 22, 18, 22, INK); box(c, bx, GY - 21, 16, 21, '#B84A2A'); box(c, bx, GY - 21, 16, 3, '#D8704A'); for (let k = 0; k < 7; k++) box(c, bx + 1 + k * 2, GY - 24 - (k % 3), 1, 4, k % 2 ? '#F4F0E0' : '#E8B080'); for (let k = 0; k < 6; k++) box(c, bx - 14 + k * 9, GY - 2, 4, 1, '#E8E0D0'); }
  // The mop bucket, WET FLOOR (a folding sign, stood on the ground)
  { const bx = R(1010); box(c, bx - 1, GY - 25, 30, 25, INK); box(c, bx, GY - 24, 28, 22, '#E8C030'); box(c, bx, GY - 24, 28, 3, '#F8E060'); box(c, bx + 4, GY - 4, 4, 4, '#222'); box(c, bx + 20, GY - 4, 4, 4, '#222');
    box(c, bx + 12, GY - 70, 3, 50, '#A88050'); for (let k = 0; k < 9; k++) box(c, bx + 6 + k * 2, GY - 26, 1, 6, '#D8D0C0'); }
  {
    const sx = R(1060);
    c.fillStyle = INK; c.beginPath(); c.moveTo(sx - 21, GY); c.lineTo(sx - 9, GY - 56); c.lineTo(sx + 9, GY - 56); c.lineTo(sx + 21, GY); c.closePath(); c.fill();
    c.fillStyle = '#F4C820'; c.beginPath(); c.moveTo(sx - 19, GY - 1); c.lineTo(sx - 8, GY - 54); c.lineTo(sx + 8, GY - 54); c.lineTo(sx + 19, GY - 1); c.closePath(); c.fill();
    box(c, sx - 8, GY - 54, 16, 3, '#F8E070');
    signAt(c, 'WET', sx, GY - 26, 5, print(5, '#1A1A1A')); signAt(c, 'FLOOR', sx, GY - 12, 5, print(5, '#1A1A1A'));
  }
  // DAYS WITHOUT AN INCIDENT: a whiteboard on a post, the number wiped and redone in marker
  poleSign(c, 'q-incident', R(1400), 76, 44, '#F4F4F0', '#4A4A50', [['DAYS WITHOUT', '#2A2A3A', 5], ['AN INCIDENT', '#2A2A3A', 5], ['0', '#C81818', 10]], 60);
};
/** The zip-tied signs on the chain-link (at its depth): EXTRA FAST PASS this way. */
const linkSigns = (c: Ctx, eye: Eye) => {
  atDepth(c, eye, LINK_S);
  stamp(c, 'q-xfp1', R(960) - 4, GY - 132, 120, 44, g => {
    box(g, R(960), GY - 128, 112, 36, '#F4F0F4'); box(g, R(960), GY - 128, 112, 4, '#E070A8'); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(R(960), GY - 128, 112, 36);
    signAt(g, 'EXTRA FAST PASS', R(1016), GY - 112, 5, print(5, '#C0186A'));
    signAt(g, 'THIS WAY >>', R(1016), GY - 100, 5, print(5, '#3A2A3A'));
    for (const zx of [R(964), R(1066)]) { box(g, zx, GY - 132, 2, 8, '#1A1A1A'); box(g, zx, GY - 96, 2, 8, '#1A1A1A'); }
  });
  stamp(c, 'q-xfp2', R(1250) - 4, GY - 120, 92, 36, g => {
    // (cardboard, in marker)
    box(g, R(1250), GY - 116, 84, 28, '#C8A070'); box(g, R(1250), GY - 116, 84, 2, '#D8B484'); g.strokeStyle = '#6A4A2A'; g.lineWidth = 1; g.strokeRect(R(1250) + 0.5, GY - 115.5, 83, 27);
    signAt(g, 'X-FAST PASS', R(1292), GY - 104, 5, plank(5, '#1A1A1A', undefined, undefined, 5));
    signAt(g, '-->', R(1292), GY - 94, 5, plank(5, '#1A1A1A', undefined, undefined, 6));
    box(g, R(1254), GY - 120, 2, 6, '#1A1A1A'); box(g, R(1328), GY - 120, 2, 6, '#1A1A1A');
  });
  c.restore();
};

/** The river's far bank (world at depth, painted flat): trunks in their bark's steps, crowns, palms, reeds at the
 *  water's edge, a heron. */
const farBank = (g: Ctx, x0: number, w: number) => {
  const hz = (col: string) => mix(farTint(col, 0.6), '#9ABCC0', 0.22);
  const lf = JLEAF.map(hz), br = ['#2A1E14', '#3E2E1E', '#56422A', '#6E5636', '#8A6E48'].map(hz);
  for (let i = 0; i < w / 92; i++) {
    const x = x0 + 30 + i * 92 + hash(i * 3.3) * 30, tw = 12 + hash(i) * 10, th = 150 + hash(i * 2) * 60;
    for (let k = 0; k < 5; k++) box(g, x + (tw * k) / 5, GY - th, tw / 5 + 0.5, th, br[[3, 4, 3, 2, 1][k]]);
    box(g, x - 1, GY - th, 1, th, br[0]); box(g, x + tw, GY - th, 1, th, br[0]);
  }
  for (let i = 0; i < w / 200; i++) {
    const px = x0 + 120 + i * 200 + hash(i * 5) * 40, ph = 160 + hash(i) * 50;
    g.strokeStyle = br[0]; g.lineWidth = 6; g.beginPath(); g.moveTo(px, GY); g.quadraticCurveTo(px - 12, GY - ph / 2, px - 4, GY - ph); g.stroke();
    g.strokeStyle = br[3]; g.lineWidth = 4; g.stroke();
    for (let f2 = 0; f2 < 7; f2++) jleaf(g, px - 4, GY - ph, 32, -Math.PI / 2 + (f2 - 3) * 0.55, lf, f2 < 3 ? 4 : 3);
  }
  for (let i = 0; i < w / 70; i++) jclump(g, x0 + 20 + i * 70 + hash(i * 7) * 20, GY - 150 - hash(i * 2.2) * 50, 46, 30, i * 9 + 4, lf, 1);
  for (let i = 0; i < w / 52; i++) jclump(g, x0 + i * 52 + hash(i * 1.7) * 20, GY - 22, 30, 18, i * 5 + 70, lf, 1);
  // (reeds, a stripe of mud, the heron)
  box(g, x0, GY - 4, w, 4, hz('#4A3A22'));
  for (let x = x0; x < x0 + w; x += 3) { const h = 8 + hash(x * 0.3) * 14; box(g, x, GY - h, 1, h, hz(hash(x) > 0.5 ? '#6A8A3A' : '#4A6A2A')); if (hash(x * 1.7) > 0.93) box(g, x - 1, GY - h - 4, 3, 5, hz('#5A3A1A')); }
  const hx = x0 + 520;
  box(g, hx, GY - 30, 2, 22, hz('#3A3A40')); box(g, hx + 4, GY - 30, 2, 22, hz('#3A3A40'));
  g.fillStyle = hz('#9AA8B4'); g.beginPath(); g.ellipse(hx + 4, GY - 36, 12, 7, -0.2, 0, Math.PI * 2); g.fill();
  box(g, hx + 12, GY - 58, 3, 20, hz('#B4C0CA')); box(g, hx + 12, GY - 60, 7, 4, hz('#B4C0CA')); box(g, hx + 19, GY - 59, 8, 2, hz('#E0B040'));
};

/** The boathouse: on pilings over the water, bamboo posts, a thatched roof, the dark inside with a spare boat moored
 *  and another up on the hoist (OUT OF SERVICE), life rings, BOATHOUSE carved over the front. */
const boathouse = (g: Ctx, a: number, b: number) => {
  const hz = (col: string) => mix(farTint(col, 0.5), '#9ABCC0', 0.12);
  const top = GY - 150, deck = GY - 8;
  // (the dark inside, the back wall's planks)
  box(g, a, top, b - a, deck - top, hz('#1E160E'));
  for (let x = a; x < b; x += 14) box(g, x, top, 1, deck - top, hz('#2E2216'));
  // (the hoist: a beam, chains, the boat up in it, its tag)
  box(g, a + 10, top + 14, b - a - 20, 6, hz('#4A3A2A'));
  for (const cx of [a + 50, b - 60]) for (let y = top + 20; y < top + 60; y += 4) box(g, cx, y, 2, 3, hz('#7A7A80'));
  const bx = a + 30, by = top + 60;
  box(g, bx, by, b - a - 60, 14, INK); box(g, bx + 1, by + 1, b - a - 62, 12, hz('#E8E0C8')); box(g, bx + 1, by + 9, b - a - 62, 3, hz('#8A3A1E'));
  box(g, bx + 30, by + 4, 60, 9, hz('#F4F0E0')); signAt(g, 'OUT OF SERVICE', bx + 60, by + 11, 5, print(5, hz('#B81E1E')));
  // (the moored one, its striped canopy, bobbing at the water)
  box(g, a + 16, deck - 30, b - a - 32, 4, INK);
  for (let k = 0; k < (b - a - 34) / 14; k++) box(g, a + 17 + k * 14, deck - 29, 14, 3, hz(k % 2 ? '#F1EFEA' : '#2E7A4A'));
  for (const px of [a + 22, b - 26]) box(g, px, deck - 26, 2, 16, hz('#6A4A28'));
  box(g, a + 14, deck - 10, b - a - 28, 12, INK); box(g, a + 15, deck - 9, b - a - 30, 10, hz('#E8E0C8')); box(g, a + 15, deck - 3, b - a - 30, 3, hz('#8A3A1E'));
  // (the posts, the deck's edge, the pilings down into the water)
  for (const px of [a - 6, (a + b) / 2 - 4, b - 2]) { box(g, px - 1, top - 4, 10, deck - top + 24, INK); box(g, px, top - 4, 8, deck - top + 24, hz('#B89A4E')); box(g, px, top - 4, 2, deck - top + 24, hz('#DCC27A')); for (let y = top + 10; y < deck + 16; y += 26) box(g, px - 1, y, 10, 2, hz('#6A5A2A')); }
  box(g, a - 10, deck, b - a + 20, 6, INK); box(g, a - 9, deck + 1, b - a + 18, 4, hz('#7A5A38'));
  // (life rings on the posts)
  for (const rx of [a + 2, b - 10]) { g.fillStyle = INK; g.beginPath(); g.arc(rx + 4, top + 100, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = hz('#F1EFEA'); g.beginPath(); g.arc(rx + 4, top + 100, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = hz('#C81E1E'); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(rx + 4, top + 100); g.arc(rx + 4, top + 100, 8, i * Math.PI / 2, i * Math.PI / 2 + 0.6); g.fill(); } g.fillStyle = hz('#1E160E'); g.beginPath(); g.arc(rx + 4, top + 100, 4, 0, Math.PI * 2); g.fill(); }
  // (the lantern hook: its glow's live)
  box(g, (a + b) / 2 + 8, top + 14, 1, 8, hz('#3A3A3A')); box(g, (a + b) / 2 + 6, top + 22, 7, 8, hz('#8A7A50'));
  // (the roof: thatch, hipped, its fringe; the carved board over the front)
  const S = rampOf(STRAW).map(hz);
  poly4(g, [[a - 30, top], [a + 20, top - 70], [b - 20, top - 70], [b + 30, top]], INK);
  for (let r = 0; r < 7; r++) { const y = top - 68 + r * 10, k = r / 7; poly4(g, [[a + 20 - 50 * k, y], [b - 20 + 50 * k, y], [b - 20 + 50 * (k + 0.14), y + 10], [a + 20 - 50 * (k + 0.14), y + 10]], S[r % 2 ? 1 : 2]); for (let x = a + 20 - 50 * k; x < b - 20 + 50 * k; x += 3) box(g, x, y + 5, 1, 5 + ((x * 7) & 3), S[0]); }
  for (let x = a - 30; x < b + 30; x += 2) box(g, x, top, 2, 5 + Math.floor(hash(x * 0.7) * 8), S[hash(x) > 0.5 ? 1 : 2]);
  const bw = 120, bl = (a + b) / 2 - bw / 2;
  box(g, bl - 1, top - 34, bw + 2, 22, INK); box(g, bl, top - 33, bw, 20, hz('#8A6038')); box(g, bl, top - 33, bw, 2, hz('#B08A5C'));
  signAt(g, 'BOATHOUSE', (a + b) / 2, top - 18, 8, carved({ sx: 1, sy: 2 }, hz('#3A1A0A'), hz('#F0D8A0'), 7));
};

/** The fiberglass hippo: its head up out of the water, ears twitching, the jaw opening on its hinge (the steel shows). */
const hippo = (c: Ctx, x: number, y: number, f: number) => {
  const hz = (col: string) => mix(farTint(col, 0.4), '#9ABCC0', 0.06);
  const t = f % 300, open = t < 60 ? Math.sin((t / 60) * Math.PI) * 14 : 0, ear = (f >> 4) % 6 === 0 ? 2 : 0;
  const H = ['#3A2E44', '#54445E', '#6E5A7A', '#8A7496', '#A890B2'].map(hz);
  // (the ripples round it)
  for (let k = 0; k < 2; k++) { const r = 34 + ((f * 0.3 + k * 20) % 40); c.strokeStyle = `rgba(220, 245, 255, ${(0.4 * (1 - (r - 34) / 40)).toFixed(3)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, r, r * 0.22, 0, 0, Math.PI * 2); c.stroke(); }
  // (the lower jaw, swung down on its hinge: pink inside, a tusk, the steel arm)
  if (open > 1) {
    box(c, x + 6, y - 14, 26, open + 6, INK); box(c, x + 7, y - 13, 24, open + 4, hz('#D86A8A')); box(c, x + 10, y - 13, 3, 7, hz('#F4F0E0')); box(c, x + 26, y - 13, 3, 7, hz('#F4F0E0'));
    box(c, x + 2, y - 16, 6, 4, hz('#8A8E96'));
  }
  // (the head: a dome, stepped, the snout out front, eyes and ears up on top, nostrils)
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y - 10, 30, 18, 0, Math.PI, 0); c.fill(); c.fillRect(x - 30, y - 10, 66, 10);
  c.fillStyle = H[2]; c.beginPath(); c.ellipse(x, y - 10, 29, 17, 0, Math.PI, 0); c.fill(); c.fillRect(x - 29, y - 10, 64, 9);
  c.fillStyle = H[3]; c.beginPath(); c.ellipse(x - 6, y - 16, 18, 9, 0, Math.PI, 0); c.fill();
  box(c, x + 18, y - 22 - open * 0.4, 18, 14, INK); box(c, x + 19, y - 21 - open * 0.4, 16, 12, H[2]); box(c, x + 19, y - 21 - open * 0.4, 16, 3, H[4]);
  box(c, x + 26, y - 20 - open * 0.4, 2, 2, H[0]); box(c, x + 31, y - 20 - open * 0.4, 2, 2, H[0]);
  for (const s of [-1, 1]) { box(c, x - 8 + s * 9, y - 26, 6, 5, INK); box(c, x - 7 + s * 9, y - 25, 4, 3, hz('#F4F0E0')); box(c, x - 6 + s * 9, y - 25, 2, 2, INK); }
  for (const s of [-1, 1]) { box(c, x - 10 + s * 14, y - 30 - ear, 5, 6, INK); box(c, x - 9 + s * 14, y - 29 - ear, 3, 4, H[1]); }
  box(c, x - 29, y - 2, 64, 2, H[0]);
  // (the waterline: a lip of white along it)
  box(c, x - 34, y - 1, 72, 2, 'rgba(230, 248, 255, 0.7)');
};

/** The loading dock: its boards going back to the water, the river past it, the station's thatched canopy, the gate,
 *  PLEASE WAIT HERE painted on the boards, the operator's podium, the boat at the end. */
const dock = (c: Ctx, eye: Eye, f: number) => {
  const a = R(1480), b = R(2000);
  // (the river out past the dock: going back to the far bank, banded, its sheen sliding)
  const wcol = hourMix('#1E5A68', '#4A5268', '#121E38');
  // (only seen past the dock's start: going back, it'd slide left over the back route's things as he walks, but they're
  // stood in front of it)
  c.save(); c.beginPath(); c.rect(a, GY - 2000, 4000, 4000); c.clip();
  quad(c, P(eye, a, GY, 0.82), P(eye, b + 800, GY, 0.82), P(eye, b + 800, GY, 0.55), P(eye, a, GY, 0.55), mix(wcol, '#BFE6F0', 0.18));
  quad(c, P(eye, a, GY, 0.68), P(eye, b + 800, GY, 0.68), P(eye, b + 800, GY, 0.55), P(eye, a, GY, 0.55), mix(wcol, '#BFE6F0', 0.32));
  checker(c, P(eye, a, GY, 0.68)[0], P(eye, a, GY, 0.68)[1], P(eye, b + 800, GY, 0.68)[0] - P(eye, a, GY, 0.68)[0], 2, mix(wcol, '#BFE6F0', 0.32), 0);
  for (let k = 0; k < 18; k++) { const s = 0.58 + (k % 5) * 0.05, x = R(1500 + ((k * 97 + f * 0.4 * s) % 1100)); const [px, py] = P(eye, x, GY, s); box(c, px, py, 10 * s, 1, 'rgba(230, 248, 255, 0.55)'); }
  // (the far bank: trunks, crowns, palms, reeds at the water)
  const tod = timeOfDay();
  atDepth(c, eye, 0.55);
  stamp(c, `q-farbank-${tod.key}`, R(1380), GY - 240, 1400, 250, g => farBank(g, R(1380), 1400));
  c.restore();
  // (the boathouse out over the water: its spare boats, one up on the hoist OUT OF SERVICE)
  atDepth(c, eye, 0.62);
  stamp(c, `q-boathouse-${tod.key}`, R(1540), GY - 250, 300, 270, g => boathouse(g, R(1560), R(1810)));
  if (tod.lamps > 0.15) { steppedGlow(c, R(1694), GY - 124, 40, '#FFC060', 0.25 * tod.lamps, 0, 4); box(c, R(1692), GY - 127, 5, 6, '#FFE08A'); }
  c.restore();
  // (a hippo, fiberglass, its head up out of the water, the jaw on its hinge opening now and then)
  atDepth(c, eye, 0.72);
  hippo(c, R(1600), GY + 4, f);
  c.restore();
  c.restore();
  // The dock's boards, going back
  const pr = rampOf(PLANK);
  quad(c, P(eye, a, GY, 1), P(eye, R(1900), GY, 1), P(eye, R(1900), GY, 0.82), P(eye, a, GY, 0.82), pr[2]);
  for (const s of [0.95, 0.9, 0.86]) seg(c, P(eye, a, GY, s), P(eye, R(1900), GY, s), pr[1], 1);
  c.strokeStyle = pr[1]; c.lineWidth = 1; c.beginPath();
  for (let x = 1480; x <= 1900; x += 30) { const p0 = P(eye, R(x), GY, 1), p1 = P(eye, R(x), GY, 0.82); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); }
  c.stroke();
  seg(c, P(eye, a, GY, 0.82), P(eye, R(1900), GY, 0.82), pr[4], 2);
  // (PLEASE WAIT HERE, painted on the boards: lying down on them)
  {
    const [px, py] = P(eye, R(1600), GY, 0.9);
    c.save(); c.translate(px, py); c.scale(0.9, 0.32); signAt(c, 'PLEASE WAIT HERE', 0, 0, 8, stencilLook({ sx: 1, sy: 2 }, '#F0C020')); c.restore();
    const [lx, ly] = P(eye, R(1530), GY, 0.94), [rx] = P(eye, R(1680), GY, 0.94);
    box(c, lx, ly, rx - lx, 2, '#F0C020');
  }
  // The station's canopy: posts, a thatched roof going back
  atDepth(c, eye, 0.84);
  for (const x of [1500, 1700, 1880]) { logPost(c, R(x) - 7, GY - 230, GY, 14); }
  c.restore();
  thatchRoof(c, eye, R(1470), R(1910), 0.97, GY - 232, 0.82, GY - 330, 40, STRAW, 12);
  // (the near posts, the fringe)
  for (const x of [1490, 1890]) logPost(c, R(x) - 8, GY - 232, GY, 16);
  fringe(c, R(1470), R(1910), GY - 234, 16);
  // LOADING DOCK, hung off the eave on ropes
  box(c, R(1610), GY - 222, 1, 16, '#8A7048'); box(c, R(1730), GY - 222, 1, 16, '#8A7048');
  stamp(c, 'q-loading', R(1590), GY - 212, 164, 36, g => sign(g, R(1596), GY - 206, 152, 24, '#D8B878', 'LOADING DOCK', '#5A1A0A', 7, '#6A3A1A', carved({ sx: 1, sy: 2 }, '#5A1A0A', '#F8E8C0', 4)));
  // (the gate at the front of the line: a bamboo bar, BOARD HERE)
  bamboo(c, R(1540) - 4, GY - 56, GY, 8); bambooRail(c, R(1540), R(1600), GY - 48, 5);
  // The operator's podium: a microphone, a clipboard, a little sign
  {
    const px = R(1770);
    stamp(c, 'q-podium', px - 22, GY - 92, 44, 92, g => {
      const r = rampOf('#7A4A2A');
      box(g, px - 18, GY - 64, 36, 64, INK); box(g, px - 17, GY - 63, 34, 62, r[2]); box(g, px - 17, GY - 63, 34, 4, r[3]); box(g, px - 17, GY - 63, 4, 62, r[3]); box(g, px + 13, GY - 63, 4, 62, r[1]);
      box(g, px - 20, GY - 68, 40, 6, INK); box(g, px - 19, GY - 67, 38, 4, r[3]);
      box(g, px - 17, GY - 50, 34, 14, '#E8E0C0'); signAt(g, 'BOAT 7', px, GY - 40, 5, { ...print(5, '#5A1A0A'), space: 2 });
      box(g, px + 8, GY - 88, 2, 22, '#2A2A2A'); ball(g, px + 9, GY - 89, 3, '#3A3A3A');
    });
  }
  // KEEP HANDS AND FEET INSIDE THE BOAT, on a post at the edge
  poleSign(c, 'q-hands', R(1852), 108, 32, '#F4F0E0', '#2A5A3A', [['KEEP HANDS & FEET', '#2A3A2A', 5], ['INSIDE THE BOAT', '#2A3A2A', 5]], 54);
  // The water at the dock's end, and the boat waiting in it
  {
    const wtop = GY + 38;
    box(c, R(1900), GY, 100 + 200, wtop - GY, mix(wcol, '#BFE6F0', 0.1));
    for (let k = 0; k < 6; k++) box(c, R(1904 + ((k * 37 + f * 0.5) % 180)), GY + 10 + (k % 3) * 8, 12, 1, 'rgba(230, 248, 255, 0.5)');
    drawLaunch(c, R(1904), GY + 24, f, { rock: Math.round(Math.sin(f * 0.05) * 1) });
    box(c, R(1900), wtop, 300, 400, dark(wcol, 0.2));
    for (let x = 1900; x < 2200; x += 16) box(c, R(x), wtop - 1 + Math.round(Math.sin(x * 0.05 + f * 0.08)), 10, 2, 'rgba(220, 245, 255, 0.8)');
    // (the dock's end: its pilings, its edge)
    const pr2 = rampOf('#6A4A2A');
    for (const px of [1880, 1896]) { box(c, R(px) - 1, GY - 6, 10, 70, INK); box(c, R(px), GY - 6, 8, 70, pr2[2]); box(c, R(px), GY - 6, 3, 70, pr2[3]); box(c, R(px), GY - 6, 8, 2, pr2[4]); }
    // (a rope from the piling to the boat's bow cleat)
    c.strokeStyle = rampOf('#D8C08A')[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(R(1900), GY - 2); c.quadraticCurveTo(R(1904), GY + 26, R(1914), GY + 22); c.stroke();
  }
};

/** The ground he walks on, toward the viewer: flagstones in the plaza, the alley's asphalt, the dock's boards. */
const nearGround = (c: Ctx, eye: Eye, f: number) => {
  const H = 400;
  stamp(c, 'q-ground', x0, GY, 1900, 80, g => {
    const sr = rampOf('#9A8A72');
    // (the plaza: flagstones)
    box(g, x0, GY, 440, 80, sr[1]);
    for (let y = GY + 2, row = 0; y < GY + 80; y += 14, row++) for (let x = x0 + (row % 2) * 18 - 18; x < R(440); x += 36) {
      const w = 34 + Math.floor(hash(x + y) * 4) - 2;
      box(g, x + 1, y, w - 2, 12, hash(x * 3 + y) < 0.5 ? sr[2] : sr[3]); box(g, x + 1, y, w - 2, 2, sr[4]);
    }
    // (the alley: asphalt, cracked, a painted line, oil)
    const ar = rampOf('#4A4A50');
    box(g, R(440), GY, 1040, 80, ar[2]);
    checker(g, R(440), GY, 1040, 2, ar[3]);
    for (let k = 0; k < 40; k++) box(g, R(440) + Math.floor(hash(k * 7.7) * 1030), GY + 4 + Math.floor(hash(k * 3.1) * 70), 2, 2, hash(k) < 0.5 ? ar[1] : ar[3]);
    box(g, R(440), GY + 22, 1040, 3, '#C8A82A');
    for (const ox of [620, 930, 1200]) { g.fillStyle = 'rgba(20, 16, 30, 0.5)'; g.beginPath(); g.ellipse(R(ox), GY + 40, 26, 6, 0, 0, Math.PI * 2); g.fill(); }
    for (const cx of [700, 1100, 1350]) { g.strokeStyle = ar[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(R(cx), GY); g.lineTo(R(cx + 8), GY + 20); g.lineTo(R(cx + 2), GY + 44); g.stroke(); }
    // (the dock: boards, crossways, nails)
    const pr = rampOf(PLANK);
    box(g, R(1480), GY, 420, 80, pr[1]);
    for (let y = GY; y < GY + 80; y += 8) { box(g, R(1480), y + 1, 420, 6, pr[2]); box(g, R(1480), y + 1, 420, 1, pr[3]); }
    for (let x = 1480; x < 1900; x += 60) for (let y = GY; y < GY + 80; y += 8) box(g, R(x + ((y >> 3) % 2) * 30), y + 1, 1, 6, pr[0]);
  });
  // (deeper down: plain fill, it's all off the bottom)
  box(c, x0, GY + 80, 1900, H, '#3A3328');
  // (the edge where he walks: a lit lip)
  box(c, x0, GY, 1900, 2, '#C8B898');
  bendFloor(c, eye, GY, GY, GY + 70, x0 - 200, R(1900));
};

// ---------------------------------------------------------------------------------------------------------------

/** The sky and the jungle round the queue (screen space). */
export const drawQueueBackdrop = (c: Ctx, state: GameState) => {
  drawJungleBackdrop(c, state, GY - 210 - state.camera.y, state.camera.x, state.frame);
};

export interface QueueArt { plaza: Guest[]; back: Guest[]; front: Guest[] }

/** Everything behind the people (world space). */
export const drawQueueBack = (c: Ctx, state: GameState, q: QueueArt, S: QueueSpots) => {
  const f = state.frame, eye = eyeOf(state), tod = timeOfDay();
  const px = state.player.pos.x + state.player.width / 2;
  const vis = (a: number, b: number) => b > state.camera.x - 120 && a < state.camera.x + CANVAS_WIDTH + 120;
  drawFloor(c, eye);
  // The house: its far wall, the lanes far to near (the turns between them), its roof
  drawFarWall(c, eye, f);
  const shade = mix('#1A1008', `rgb(${tod.shade.join(',')})`, 0.4), haze = mix(tod.haze, '#C8D8C8', 0.4);
  const L = farLanes();
  posts(c, eye, WALL_S + 0.02, 340);
  for (let k = 0; k < L.length; k++) {
    const lane = L[k];
    // (the turn from the lane in front of this one, at whichever end it's open)
    const nearer = k + 1 < L.length ? L[k + 1].s : NEAR_S;
    drawFarLane(c, eye, lane, f, shade, haze, L.length - k);
    const turnX = k % 2 ? lane.xa : lane.xb;
    if (k > 0) uTurn(c, eye, turnX, lane.s, L[k - 1].s, mix(BAMBOO, '#2A1A0A', 0.45 + (1 - lane.s) * 0.3));
    if (k === 2) posts(c, eye, (lane.s + nearer) / 2, 340, HALL.a + 170);
    void nearer;
  }
  // (the line's the near lane's too, turning back from the last far one)
  uTurn(c, eye, L[L.length - 1].xa, L[L.length - 1].s, NEAR_S, mix(BAMBOO, '#2A1A0A', 0.35));
  thatchRoof(c, eye, R(HALL.a - 20), R(HALL.b + 20), EAVE_S + 0.02, EAVE_Y - 4, RIDGE_S, RIDGE_Y, 150, ROOF, 22);
  // The near lane: live (they talk, they glare), dimmed a little in one go; its rails; the eave's posts and fringe
  placeNear(eye, q.plaza, px); placeNear(eye, q.back, px);
  drawGuestsDimmed(c, [...q.plaza, ...q.back], f, 0.22, '26, 18, 10');
  nearRails(c, eye, 140, 420);
  nearRails(c, eye, 470, 1470);
  posts(c, eye, EAVE_S, 170);
  {
    const [ea] = P(eye, R(HALL.a - 20), EAVE_Y, EAVE_S + 0.02), [eb, ey] = P(eye, R(HALL.b + 20), EAVE_Y, EAVE_S + 0.02);
    fringe(c, ea, eb, ey - 6, 18, ROOF);
  }
  hungSigns(c, eye, f);
  // Out back: the chain-link, the signs on it
  if (vis(R(440), R(1480))) { chainLink(c, eye, 440, 1480); linkSigns(c, eye); }
  // In front: the crates, the gate, the arch and its board, the alley's things, the dock
  S.crates.forEach((cr, i) => box3d(c, eye, R(cr.x), GY - cr.h, cr.w, GY, 0.05, '#A8743A', { key: `q-crate${i}`, paint: crateFront(R(cr.x), GY - cr.h, cr.w, cr.h, i) }));
  staffGate(c, eye, S.fence);
  if (vis(R(0), R(300))) arch(c, f);
  if (vis(R(440), R(1480))) { dumpster(c, eye, S.dumpster, f); acUnit(c, eye, S.ac, f); pallets(c, eye, S.pallets); alleyBits(c, eye, f); }
  if (vis(R(1440), x1 + 200)) dock(c, eye, f);
  nearGround(c, eye, f);
  // The front of the line, at the dock (live, at his depth)
  for (const g of q.front) drawGuest(c, g, f);
};

/** The lanterns' light (world space), for the hour's lighting. */
export const queueLamps = () => {
  const out: { x: number; y: number; r: number; a: number; color: string }[] = [];
  for (let x = HALL.a + 85; x < HALL.b; x += 340) out.push({ x: R(x), y: EAVE_Y + 40, r: 160, a: 0.7, color: '#FFB860' });
  out.push({ x: R(1700), y: GY - 200, r: 200, a: 0.8, color: '#FFC070' });
  return out;
};

/** The hanging lanterns along the eave (drawn after the house: in front of the near lane). */
export const drawQueueLanterns = (c: Ctx, state: GameState) => {
  const eye = eyeOf(state), lamps = timeOfDay().lamps;
  for (let x = HALL.a + 85; x < HALL.b; x += 340) {
    const [lx, ly] = P(eye, R(x), EAVE_Y + 10, EAVE_S);
    box(c, lx, ly - 10, 1, 12, '#3A3A3A');
    box(c, lx - 5, ly + 2, 11, 14, INK); box(c, lx - 4, ly + 3, 9, 12, lamps > 0.15 ? '#FFC870' : '#9A8A60'); box(c, lx - 4, ly + 3, 9, 2, '#3A3A3A'); box(c, lx - 1, ly + 7, 3, 5, lamps > 0.15 ? '#FFF2C0' : '#C8B888');
    if (lamps > 0.15) steppedGlow(c, lx, ly + 9, 46, '#FFC060', 0.22 * lamps, 0, 4);
  }
};
