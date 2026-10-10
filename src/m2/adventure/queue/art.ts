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
  type Ctx, type Eye, INK, rampOf, box, checker, hash, mix, dark, lite, stamp, tilePattern, text,
  eyeOf, P, quad, seg, atDepth, bamboo, bambooRail, lash, logPost, logBeam, thatchRoof, fringe, stencil, box3d, drawJungleBackdrop,
  BAMBOO, PLANK, STRAW,
} from './depth';

const { x0, x1 } = SECTIONS.queue;
const R = (x: number) => x0 + x;

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
  const scrub = farTint('#2A4A2A', 0.7);
  for (let x = Math.floor((xa - 200) / 40) * 40; x < xb + 200; x += 40) { c.fillStyle = scrub; c.beginPath(); c.arc(x + 20, GY - 8, 26 + hash(x) * 14, Math.PI, 0); c.fill(); }
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
  // (the strip in front of the eave, out in the light: the same planks, lit)
  quad(c, P(eye, R(HALL.a), GY, 1), P(eye, R(HALL.b), GY, 1), P(eye, R(HALL.b), GY, EAVE_S), P(eye, R(HALL.a), GY, EAVE_S), mix(FLOOR, '#E8C890', 0.15));
};

/** The far wall: dark planks, old safari posters, a lantern or two, the door the line goes in at. */
const drawFarWall = (c: Ctx, eye: Eye, f: number) => {
  atDepth(c, eye, WALL_S);
  const a = R(HALL.a), b = R(HALL.b), top = EAVE_Y - 10, wall = '#3A2A1A';
  stamp(c, 'q-farwall', a, top, b - a, GY - top, g => {
    box(g, a, top, b - a, GY - top, wall);
    for (let x = a; x < b; x += 18) { box(g, x, top, 1, GY - top, '#22180E'); box(g, x + 1, top, 1, GY - top, '#4A3826'); }
    box(g, a, GY - 40, b - a, 4, '#22180E');
    // (posters: an elephant, a falls, a hippo, a skipper; old, curling)
    const posters: [number, string, string][] = [[260, '#C89A3A', 'ele'], [520, '#3A8AAA', 'falls'], [780, '#B8563A', 'hippo'], [1040, '#C8B04A', 'skip'], [1200, '#5A8A3A', 'ele']];
    for (const [px, col, what] of posters) {
      const x = a + px - HALL.a, y = GY - 190;
      box(g, x - 2, y - 2, 64, 84, INK); box(g, x, y, 60, 80, col); box(g, x, y, 60, 12, lite(col, 0.3)); box(g, x + 4, y + 14, 52, 50, dark(col, 0.25));
      if (what === 'ele') { box(g, x + 14, y + 34, 30, 20, '#6A6A72'); box(g, x + 38, y + 28, 12, 14, '#6A6A72'); box(g, x + 46, y + 40, 4, 16, '#6A6A72'); box(g, x + 16, y + 52, 6, 10, '#6A6A72'); box(g, x + 34, y + 52, 6, 10, '#6A6A72'); }
      else if (what === 'falls') { for (let k = 0; k < 6; k++) box(g, x + 22 + k * 3, y + 16, 2, 46, k % 2 ? '#E8F8FF' : '#9AD0E8'); box(g, x + 6, y + 16, 14, 46, '#3A5A3A'); box(g, x + 42, y + 16, 12, 46, '#3A5A3A'); }
      else if (what === 'hippo') { box(g, x + 10, y + 40, 40, 18, '#8A6A9A'); box(g, x + 40, y + 32, 16, 14, '#8A6A9A'); for (let k = 0; k < 52; k += 4) box(g, x + 4 + k, y + 56, 2, 8, '#3A6A8A'); }
      else { box(g, x + 22, y + 22, 18, 10, '#E8D8A8'); box(g, x + 18, y + 30, 26, 4, '#E8D8A8'); box(g, x + 25, y + 34, 12, 12, '#E8B890'); box(g, x + 22, y + 46, 18, 18, '#C8A86A'); }
      box(g, x + 4, y + 66, 52, 4, lite(col, 0.4)); box(g, x + 8, y + 72, 44, 3, lite(col, 0.4));
      box(g, x + 56, y, 4, 6, dark(col, 0.5));
    }
    // (the door the line goes in at: dark, a bulb over it)
    const dx = a + DOOR.x - HALL.a;
    box(g, dx - 6, GY - 140, DOOR.w + 12, 140, '#22180E'); box(g, dx, GY - 132, DOOR.w, 132, '#0A0604');
    box(g, dx - 6, GY - 140, DOOR.w + 12, 4, '#5A4430');
    // (a sign over it, painted on the wall: the line goes on)
    box(g, dx - 20, GY - 172, DOOR.w + 40, 22, '#1A120A'); box(g, dx - 18, GY - 170, DOOR.w + 36, 18, '#C8A050');
    text(g, 'QUEUE', dx + DOOR.w / 2, GY - 157, '#3A1A08', 8, 'center', null);
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
      text(g, a, sx + sway, sy + 10, '#E8D8A0', 5, 'center', '#122012');
      text(g, b, sx + sway, sy + 21, '#F4C040', 6, 'center', '#122012');
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
    text(g, 'JUNGLE CRUISE', (a + b) / 2, GY - 323, '#6A1A0A', 10, 'center', '#F0D8A0');
    for (const sx of [bx + 10, bx + bw - 10]) { ball(g, sx, GY - 328, 5, '#EDE4C8'); box(g, sx - 3, GY - 330, 2, 2, INK); box(g, sx + 1, GY - 330, 2, 2, INK); box(g, sx - 2, GY - 325, 4, 1, INK); }
    // (the chains the board hangs on)
    for (const cx of [a + 40, b - 40]) for (let y = GY - 282; y < GY - 240; y += 5) { box(g, cx - 1, y, 3, 4, '#5A5A60'); box(g, cx, y + 1, 1, 2, '#9A9AA0'); }
  });
  // The wait-time board: green, three slats of flip numbers (live: a number flips now and then)
  const bx = R(42), by = GY - 240, bw = 196, bh = 76;
  stamp(c, 'q-waitboard', bx - 6, by - 6, bw + 12, bh + 12, g => {
    sign(g, bx, by, bw, bh, '#244A2C', '', '#000', 6, '#6A4A2A');
    text(g, 'WAIT TIMES', bx + bw / 2, by + 11, '#F0D890', 6, 'center', '#0E1E10');
    const rows: [string, string][] = [['STANDBY', '180'], ['FAST PASS', '175'], ['EXTRA FAST PASS', '185']];
    rows.forEach(([n, v], i) => {
      const y = by + 18 + i * 18;
      box(g, bx + 6, y, bw - 12, 15, '#1A3220');
      text(g, n, bx + 10, y + 11, i === 2 ? '#F8A0C8' : '#E8E0C0', 5, 'left', '#0A140C');
      for (let k = 0; k < 3; k++) { const tx = bx + bw - 66 + k * 13; box(g, tx, y + 1, 11, 13, '#0A0A0A'); box(g, tx, y + 7, 11, 1, '#2A2A2A'); text(g, v[k], tx + 6, y + 11, '#F8E070', 7, 'center', null); }
      text(g, 'MIN', bx + bw - 14, y + 11, '#E8E0C0', 5, 'center', '#0A140C');
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
  stamp(c, 'q-gate-sign', x - 30, GY - 118, F.w + 60, 40, g => {
    sign(g, x - 24, GY - 112, F.w + 48, 28, '#F4F0E0', '', '#000', 5, '#5A5A60');
    text(g, 'CAST MEMBERS', x + F.w / 2, GY - 101, '#A8221A', 5, 'center', null);
    text(g, 'ONLY', x + F.w / 2, GY - 90, '#A8221A', 5, 'center', null);
  });
};

/** The dumpster: green, its lid propped on a bag, HAPPYLAND WASTE on it; flies. */
const dumpster = (c: Ctx, eye: Eye, D: QueueSpots['dumpster'], f: number) => {
  const x = R(D.x), top = GY - D.h;
  box3d(c, eye, x, top, D.w, GY - 6, 0.06, '#2F6A3A', { key: 'q-dumpster', paint: g => {
    const r = rampOf('#2F6A3A');
    box(g, x, top, D.w, D.h - 6, r[2]); box(g, x, top, D.w, 6, r[3]);
    for (let k = 12; k < D.w; k += 18) { box(g, x + k, top + 8, 3, D.h - 18, r[1]); box(g, x + k + 3, top + 8, 1, D.h - 18, r[3]); }
    box(g, x + 6, top + 18, D.w - 12, 12, '#E8E0C8'); text(g, 'HAPPYLAND WASTE', x + D.w / 2, top + 28, '#2A3A2A', 5, 'center', null);
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
    lines.forEach(([s, col, size], i) => text(g, s, x, top + 4 + (h - 4) * ((i + 0.75) / lines.length), col, size, 'center', null));
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
    text(c, 'WET', sx, GY - 26, '#1A1A1A', 5, 'center', null); text(c, 'FLOOR', sx, GY - 16, '#1A1A1A', 5, 'center', null);
  }
  // DAYS WITHOUT AN INCIDENT: a whiteboard on a post, the number wiped and redone in marker
  poleSign(c, 'q-incident', R(1400), 76, 44, '#F4F4F0', '#4A4A50', [['DAYS WITHOUT', '#2A2A3A', 5], ['AN INCIDENT', '#2A2A3A', 5], ['0', '#C81818', 10]], 60);
};
/** The zip-tied signs on the chain-link (at its depth): EXTRA FAST PASS this way. */
const linkSigns = (c: Ctx, eye: Eye) => {
  atDepth(c, eye, LINK_S);
  stamp(c, 'q-xfp1', R(960) - 4, GY - 132, 120, 44, g => {
    box(g, R(960), GY - 128, 112, 36, '#F4F0F4'); box(g, R(960), GY - 128, 112, 4, '#E070A8'); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(R(960), GY - 128, 112, 36);
    text(g, 'EXTRA FAST PASS', R(1016), GY - 112, '#C0186A', 5, 'center', null);
    text(g, 'THIS WAY >>', R(1016), GY - 100, '#3A2A3A', 5, 'center', null);
    for (const zx of [R(964), R(1066)]) { box(g, zx, GY - 132, 2, 8, '#1A1A1A'); box(g, zx, GY - 96, 2, 8, '#1A1A1A'); }
  });
  stamp(c, 'q-xfp2', R(1250) - 4, GY - 120, 92, 36, g => {
    // (cardboard, in marker)
    box(g, R(1250), GY - 116, 84, 28, '#C8A070'); box(g, R(1250), GY - 116, 84, 2, '#D8B484'); g.strokeStyle = '#6A4A2A'; g.lineWidth = 1; g.strokeRect(R(1250) + 0.5, GY - 115.5, 83, 27);
    text(g, 'X-FAST PASS', R(1292), GY - 104, '#1A1A1A', 5, 'center', null);
    text(g, '-->', R(1292), GY - 94, '#1A1A1A', 5, 'center', null);
    box(g, R(1254), GY - 120, 2, 6, '#1A1A1A'); box(g, R(1328), GY - 120, 2, 6, '#1A1A1A');
  });
  c.restore();
};

/** The loading dock: its boards going back to the water, the river past it, the station's thatched canopy, the gate,
 *  PLEASE WAIT HERE painted on the boards, the operator's podium, the boat at the end. */
const dock = (c: Ctx, eye: Eye, f: number) => {
  const a = R(1480), b = R(2000);
  // (the river out past the dock: going back to the far bank, banded, its sheen sliding)
  const wcol = hourMix('#1E5A68', '#4A5268', '#121E38');
  quad(c, P(eye, a, GY, 0.82), P(eye, b + 200, GY, 0.82), P(eye, b + 200, GY, 0.55), P(eye, a, GY, 0.55), mix(wcol, '#BFE6F0', 0.18));
  quad(c, P(eye, a, GY, 0.68), P(eye, b + 200, GY, 0.68), P(eye, b + 200, GY, 0.55), P(eye, a, GY, 0.55), mix(wcol, '#BFE6F0', 0.32));
  for (let k = 0; k < 10; k++) { const s = 0.58 + (k % 5) * 0.05, x = R(1500 + ((k * 97 + f * 0.4 * s) % 520)); const [px, py] = P(eye, x, GY, s); box(c, px, py, 10 * s, 1, 'rgba(230, 248, 255, 0.55)'); }
  // (the far bank: scrub and trunks)
  atDepth(c, eye, 0.55);
  for (let x = 1440; x < 2100; x += 46) { box(c, R(x) + 10, GY - 120, 6, 120, farTint('#4A3A2A', 0.5)); c.fillStyle = farTint('#2E5A30', 0.5); c.beginPath(); c.arc(R(x) + 13, GY - 120, 30, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(R(x) + 30, GY - 10, 26, Math.PI, 0); c.fill(); }
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
    c.save(); c.translate(px, py); c.scale(0.9, 0.32); text(c, 'PLEASE WAIT HERE', 0, 0, '#F0C020', 8, 'center', null); c.restore();
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
  stamp(c, 'q-loading', R(1590), GY - 212, 164, 36, g => sign(g, R(1596), GY - 206, 152, 24, '#D8B878', 'LOADING DOCK', '#5A1A0A', 7, '#6A3A1A'));
  // (the gate at the front of the line: a bamboo bar, BOARD HERE)
  bamboo(c, R(1540) - 4, GY - 56, GY, 8); bambooRail(c, R(1540), R(1600), GY - 48, 5);
  // The operator's podium: a microphone, a clipboard, a little sign
  {
    const px = R(1770);
    stamp(c, 'q-podium', px - 22, GY - 92, 44, 92, g => {
      const r = rampOf('#7A4A2A');
      box(g, px - 18, GY - 64, 36, 64, INK); box(g, px - 17, GY - 63, 34, 62, r[2]); box(g, px - 17, GY - 63, 34, 4, r[3]); box(g, px - 17, GY - 63, 4, 62, r[3]); box(g, px + 13, GY - 63, 4, 62, r[1]);
      box(g, px - 20, GY - 68, 40, 6, INK); box(g, px - 19, GY - 67, 38, 4, r[3]);
      box(g, px - 16, GY - 50, 32, 14, '#E8E0C0'); text(g, 'BOAT 7', px, GY - 40, '#5A1A0A', 5, 'center', null);
      box(g, px + 8, GY - 88, 2, 22, '#2A2A2A'); ball(g, px + 9, GY - 89, 3, '#3A3A3A');
    });
  }
  // KEEP HANDS AND FEET INSIDE THE BOAT, on a post at the edge
  poleSign(c, 'q-hands', R(1852), 100, 32, '#F4F0E0', '#2A5A3A', [['KEEP HANDS & FEET', '#2A3A2A', 5], ['INSIDE THE BOAT', '#2A3A2A', 5]], 54);
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
