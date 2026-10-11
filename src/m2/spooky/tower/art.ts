// The clock tower, painted (the final pass: peak SNES, the kit Adventure Land's painted with). The loading bay (red
// damask over dark panelling, the line in its switchbacks standing back on the floor, HOW THE RIDE WORKS, the
// operator's booth, the marquee, the hatch the cars come up through); the tower's insides floor by floor (old stone,
// lancet windows on the night, gas sconces, plank floors on their beams, everything with a lit lip that's somewhere to
// stand); the two shafts up the middle in their iron lattice, the nets across them, the red DROP lamps; the works
// (gears, pendulums, cuckoo clocks: hazards.ts paints the moving parts); the clock room at the top (the clock face from
// behind, frosted glass, the bell, the winch); the ride's "hell" under the foot of it (plywood and cardboard) and, once
// it's broken through, the chute down into the real one.
//
// Depth, indoors and light: the back walls stand a little back from his plane (WALL_D, BAY_D: one shared eye, the
// middle of the view), so the floors' tops (or their undersides, over him) show going back to them, and the side
// walls' insides show between; nothing in his plane moves. All of it is drawn inside the world's sway (worldTilt), so
// the wobble tips the lot together. Still pictures are stamped (they paint live while the tower's swaying: stamps
// can't turn); the stonework's a repeating tile, one fill whatever the sway.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawPerson } from '../../adventure/temple/people';
import {
  INK, box, text, slab, pole, ball, sign, rampOf, checker, bandedGradient, hazeBands, steppedGlow, stamp, hash, tilePattern,
} from '../../intro/art/kit';
import {
  x0, ENTRY_DOOR_X, WAIT_SIGN_X, HOW_BOARD_X, QUEUE_X0, QUEUE_X1, BOOTH_X, PLATFORM_X0, PLATFORM_X1, STAFF_DOOR_X, BAY_TOP,
  TX0, TX1, W, U, WALL, SH0, SH1, SHM, SHX, DOCK_X, CAR_W, DOOR_H, F, STORIES, SLAB, TOP, ROOF, B1, CH0, CH1, HELL_AT, LEDGES, CHUTE_LEDGES, BEAMS, beamTop, PENDULUMS,
  CUCKOOS, GALLERY, WHOLE, WRECK, JAMS, upRight, LIFT, liftY, ROTTEN, TORN_NET, SHELF, type Piece,
} from './layout';
import { GY } from '../geometry';
import { gearAt, gearsNow, drawGear, drawPendulum } from './hazards';
import { drawCar, drawWalkers, readyLight, type Ride } from './ride';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];

export interface TowerLook {
  ride: Ride; broken: number; beamHp: number[]; crashed: boolean;
  /** The nets still across the shaft (by floor), the grate over it at the foot, the ride's hell's floor. */
  nets: boolean[]; grate: boolean; b1: boolean;
  /** The operator: talking. */
  opTalking: boolean;
  /** The shaft's red DROP lamps going (a car coming down, after). */
  lamp: boolean;
  /** Floor 5's rotten boards (0 whole, >0 cracking, <0 gone). */
  rot: number[];
}

// ---------------------------------------------------------------------------------------------------------------
// Depth (one eye for the whole scene: the middle of the view)

interface Eye { x: number; y: number }
/** How far back the walls stand: the tower's, the bay's. */
const WALL_D = 0.93, BAY_D = 0.9;
const eyeOf = (state: GameState): Eye => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  return { x: v.x + v.w / 2, y: v.y + v.h * 0.45 };
};
const inDepth = (c: Ctx, eye: Eye, d: number, paint: () => void) => {
  c.save(); c.translate(eye.x * (1 - d), eye.y * (1 - d)); c.scale(d, d); paint(); c.restore();
};
const at = (eye: Eye, x: number, y: number, d: number): P => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];
const quad = (c: Ctx, col: string, a: P, b: P, cc: P, dd: P) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(dd[0], dd[1]); c.closePath(); c.fill();
};
const seg = (c: Ctx, a: P, b: P, col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };

/** What of the world's on screen (with room for the sway). */
const viewOf = (state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  return { x0: v.x - 160, x1: v.x + v.w + 160, y0: v.y - 160, y1: v.y + v.h + 160 };
};
type View = ReturnType<typeof viewOf>;
/** The same, in the units of a layer d back. */
const viewAt = (v: View, eye: Eye, d: number): View => ({
  x0: eye.x + (v.x0 - eye.x) / d, x1: eye.x + (v.x1 - eye.x) / d, y0: eye.y + (v.y0 - eye.y) / d, y1: eye.y + (v.y1 - eye.y) / d,
});

/** A plaque (a sign on a wall): its middle at (x, y). */
const plaque = (c: Ctx, x: number, y: number, words: string, face: string, ink: string, size = 8) => {
  c.font = `${size}px "Press Start 2P"`;
  const w = Math.ceil(c.measureText(words).width) + 16, h = size + 10;
  sign(c, x - w / 2, y - h / 2, w, h, face, words, ink, size);
};

// ---------------------------------------------------------------------------------------------------------------
// The colors

const STONE = ['#141118', '#1E1A24', '#28232F', '#332D3B', '#423A4C'];
const PLANK = rampOf('#6E4626');
const LIP_HI = '#F6CC84', LIP = '#D9953E';
const IRON = '#4A4D55', BRASS = '#B8862E', OAK = '#5A3A22';
const ROCK = ['#0E0605', '#1A0D09', '#27140D', '#361C12', '#47261A'];

/** Old stonework, as a repeating tile: two courses of rough-dressed blocks, each lit along its top and left. */
const stoneFill = (c: Ctx) => tilePattern(c, 'tw-stone', 192, 64, g => {
  g.fillStyle = '#100D14'; g.fillRect(0, 0, 192, 64);
  const st = (x: number, y: number, w: number, i: number) => {
    const h = hash(i * 3.7 + x * 0.11), col = h < 0.35 ? STONE[1] : h < 0.8 ? STONE[2] : '#2C2634';
    for (const ox of [0, -192, 192]) {
      const sx = x + ox; if (sx > 192 || sx + w < 0) continue;
      box(g, sx, y, w - 2, 30, col);
      box(g, sx, y, w - 2, 2, STONE[3]); box(g, sx, y, 2, 30, STONE[3]);
      checker(g, sx + 2, y + 2, w - 6, 2, STONE[3]);
      box(g, sx, y + 28, w - 2, 2, STONE[0]); box(g, sx + w - 4, y, 2, 30, STONE[0]);
      checker(g, sx + 2, y + 26, w - 6, 2, STONE[0], 1);
      // (pits and chips)
      box(g, sx + 6 + Math.floor(h * (w - 18)), y + 10 + Math.floor(h * 10), 2, 2, STONE[0]);
      if (h > 0.5) box(g, sx + 4 + Math.floor((1 - h) * (w - 14)), y + 18, 4, 2, STONE[4]);
    }
  };
  let i = 0;
  for (let x = 0, k = 0; x < 192; k++) { const w = [52, 40, 60, 40][k]; st(x, 0, w, i++); x += w; }
  for (let x = -12, k = 0; x < 180; k++) { const w = [34, 56, 44, 58][k]; st(x, 32, w, i++); x += w; }
});
/** Rock (under the tower, the chute's walls): heaped, rounded, lit from above. */
const rockFill = (c: Ctx) => tilePattern(c, 'tw-rock', 160, 96, g => {
  g.fillStyle = ROCK[0]; g.fillRect(0, 0, 160, 96);
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(hash(i * 1.9) * 160), y = Math.floor(hash(i * 2.3 + 1) * 96), w = 26 + Math.floor(hash(i * 3.1) * 30), h = 16 + Math.floor(hash(i * 4.7) * 16);
    for (const [ox, oy] of [[0, 0], [-160, 0], [0, -96], [-160, -96]]) {
      const sx = x + ox, sy = y + oy;
      g.fillStyle = ROCK[1]; g.beginPath(); g.roundRect(sx, sy, w, h, 6); g.fill();
      g.fillStyle = ROCK[2]; g.beginPath(); g.roundRect(sx + 2, sy + 2, w - 6, h - 6, 5); g.fill();
      box(g, sx + 6, sy + 2, w - 14, 2, ROCK[3]); box(g, sx + 8, sy + 2, 6, 2, ROCK[4]);
    }
  }
});

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen): the night past the walls, what of it the sway shows; far off and down, the park's lights

export const drawTowerBackdrop = (c: Ctx, state?: GameState) => {
  bandedGradient(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#05040C', '#0B0A1C', '#16132C', '#1E1830'], 10);
  for (let i = 0; i < 40; i++) { const x = Math.floor(hash(i * 5.3) * CANVAS_WIDTH), y = Math.floor(hash(i * 7.1) * CANVAS_HEIGHT * 0.8); box(c, x, y, i % 5 ? 1 : 2, i % 5 ? 1 : 2, i % 3 ? '#5A5A7A' : '#B8B8D8'); }
  // (far off and below: the park's rooftops, its lights; further down the higher he goes)
  const cy = state ? state.camera.y : 0;
  const base = Math.round(CANVAS_HEIGHT - 60 - Math.min(0, cy) * 0.06);
  if (base < CANVAS_HEIGHT + 40) {
    c.fillStyle = '#0A0812';
    c.beginPath(); c.moveTo(0, CANVAS_HEIGHT);
    for (let x = 0; x <= CANVAS_WIDTH; x += 20) { const h = hash(Math.floor(x / 20) * 1.3); c.lineTo(x, base - h * 34 - (h > 0.85 ? 30 : 0)); c.lineTo(x + 20, base - h * 34 - (h > 0.85 ? 30 : 0)); }
    c.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT); c.closePath(); c.fill();
    for (let i = 0; i < 26; i++) { const x = Math.floor(hash(i * 9.7) * CANVAS_WIDTH), y = base - 4 + Math.floor(hash(i * 2.9) * 40); box(c, x, y, 2, 2, i % 4 ? '#7A5A2A' : '#5A3A6A'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The loading bay

const QUEUE_PEOPLE = Array.from({ length: 14 }, (_, i) => ({ seed: 4001 + i * 211, x: QUEUE_X0 + 30 + i * 46 + (i % 3) * 6, row: i % 2 }));
const BAY_L = x0 - 400, BAY_R = TX0 + 120;

/** The bay's wallpaper: red damask in stripes, as a tile. */
const damask = (c: Ctx) => tilePattern(c, 'tw-damask', 48, 64, g => {
  box(g, 0, 0, 48, 64, '#4A0E10'); box(g, 0, 0, 16, 64, '#3E0B0D');
  box(g, 15, 0, 2, 64, '#5E1A14'); box(g, 46, 0, 2, 64, '#2E0708');
  // (the motif: a pixel fleur)
  const m = '#5C1418', mh = '#6E1E1C';
  box(g, 30, 14, 4, 18, m); box(g, 26, 18, 12, 4, m); box(g, 24, 26, 4, 6, m); box(g, 36, 26, 4, 6, m); box(g, 30, 10, 4, 4, mh); box(g, 28, 34, 8, 2, m);
  box(g, 30, 46, 4, 4, m); box(g, 28, 48, 8, 2, mh);
});

/** A door in the bay's back wall, in its own deep frame (the jambs going back to the wall, so it stands in his plane:
 *  whoever comes out of it comes out where it is). */
const bayDoor = (c: Ctx, eye: Eye, x: number, w: number, h: number, frame: string, inside: string, paintDoor?: (c: Ctx, l: number, t: number) => void) => {
  const l = x - w / 2, r = x + w / 2, t = GY - h;
  const fr = rampOf(frame);
  // (the jamb on the side that faces the eye, going back)
  if (eye.x > l) quad(c, fr[1], [l, t], at(eye, l, t, BAY_D), at(eye, l, GY, BAY_D), [l, GY]);
  if (eye.x < r) quad(c, fr[1], [r, t], at(eye, r, t, BAY_D), at(eye, r, GY, BAY_D), [r, GY]);
  quad(c, fr[0], [l, t], [r, t], at(eye, r, t, BAY_D), at(eye, l, t, BAY_D));
  box(c, l, t, w, h, inside);
  hazeBands(c, l, t, w, h, '#000000', 0.4, 0, 4);
  paintDoor?.(c, l, t);
  // (the casing round it)
  slab(c, l - 10, t - 12, w + 20, 12, frame, { edge: 2 });
  slab(c, l - 10, t, 10, h, frame, { edge: 2 }); slab(c, r, t, 10, h, frame, { edge: 2 });
};

/** HOW THE RIDE WORKS: a framed board, four panels, a picture in each (stamped). */
const paintHowBoard = (g: Ctx, hx: number, hy: number) => {
  slab(g, hx - 218, hy - 10, 436, 204, '#3A2414', { edge: 4 });
  for (let i = 0; i < 8; i++) box(g, hx - 210 + i * 54, hy - 8, 2, 2, '#D4A84A');
  box(g, hx - 210, hy - 2, 420, 188, '#16100C');
  bandedGradient(g, hx - 210, hy - 2, 420, 188, ['#1E1612', '#120C09'], 4);
  text(g, 'HOW THE RIDE WORKS', hx, hy + 18, '#FDE68A', 10, 'center', '#5A2A08');
  const panels: [string, string][] = [['1. BOARD', 'THE CAR'], ['2. UP THE', 'CLOCK TOWER'], ['3. DROP TO', 'HELL!'], ['4. EXIT THRU', 'GIFT SHOP']];
  panels.forEach(([a, b], i) => {
    const px = hx - 200 + i * 100, py = hy + 30;
    slab(g, px, py, 92, 112, '#2A2220', { edge: 2 });
    bandedGradient(g, px + 4, py + 4, 84, 104, i === 2 ? ['#1A0606', '#4A0E08', '#8A2408'] : ['#0E1024', '#1A1C3A', '#2A2A4A'], 5);
    if (i === 0) {
      // (the car at the platform, a stick rider stepping in)
      slab(g, px + 26, py + 52, 40, 34, '#B8862E', { edge: 2 }); box(g, px + 30, py + 58, 32, 22, '#2A1410');
      ball(g, px + 46, py + 46, 5, '#F0C8A2'); box(g, px + 43, py + 52, 6, 16, '#3B82F6');
      box(g, px + 14, py + 86, 64, 4, '#5A5A60');
    }
    if (i === 1) {
      // (the tower, the car on the way up it)
      slab(g, px + 32, py + 14, 28, 92, '#4A4458', { edge: 2 });
      g.fillStyle = INK; g.beginPath(); g.moveTo(px + 28, py + 16); g.lineTo(px + 46, py + 2); g.lineTo(px + 64, py + 16); g.fill();
      ball(g, px + 46, py + 28, 8, '#E8D9A0'); box(g, px + 45, py + 22, 2, 6, INK); box(g, px + 45, py + 27, 5, 2, INK);
      slab(g, px + 38, py + 66, 16, 14, '#B8862E', { edge: 2 });
      for (let k = 0; k < 3; k++) box(g, px + 66, py + 76 - k * 12, 4, 8, '#FDE68A');
    }
    if (i === 2) {
      // (the drop: the car falling, the flames under)
      slab(g, px + 34, py + 20, 22, 18, '#B8862E', { edge: 2 });
      for (let k = 0; k < 3; k++) box(g, px + 38 + k * 6, py + 4, 2, 14, '#FDE68A');
      for (let k = 0; k < 4; k++) {
        const fx = px + 10 + k * 20;
        g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(fx, py + 104); g.lineTo(fx + 9, py + 74 - (k % 2) * 8); g.lineTo(fx + 18, py + 104); g.fill();
        g.fillStyle = '#FBBF24'; g.beginPath(); g.moveTo(fx + 5, py + 104); g.lineTo(fx + 9, py + 88); g.lineTo(fx + 13, py + 104); g.fill();
      }
    }
    if (i === 3) {
      // (the gift shop: a storefront, a till)
      slab(g, px + 14, py + 40, 64, 62, '#7F1D1D', { edge: 2 });
      box(g, px + 10, py + 34, 72, 8, '#FDE68A'); for (let k = 0; k < 6; k++) box(g, px + 12 + k * 12, py + 34, 6, 8, '#B91C1C');
      box(g, px + 22, py + 56, 18, 16, '#FDE68A'); box(g, px + 52, py + 56, 18, 16, '#FDE68A');
      text(g, '$', px + 46, py + 96, '#4ADE80', 10, 'center', INK);
    }
    text(g, a, px + 46, hy + 156, '#E7E5E4', 6); text(g, b, px + 46, hy + 168, '#FCA5A5', 6);
  });
  text(g, 'RIDERS MUST BE THIS WICKED TO RIDE', hx, hy + 182, '#A8A29E', 6);
};

/** The back wall of the bay (BAY_D back): damask over dark panelling, a picture rail, the sconces, the board. */
const drawBayWall = (c: Ctx, eye: Eye, v: View, f: number) => {
  inDepth(c, eye, BAY_D, () => {
    const w = viewAt(v, eye, BAY_D), L = Math.max(BAY_L, w.x0), R = Math.min(BAY_R, w.x1);
    if (R <= L) return;
    c.fillStyle = damask(c); c.fillRect(L, BAY_TOP, R - L, GY - BAY_TOP);
    // (the dado: dark oak panels, a chair rail over them)
    box(c, L, GY - 118, R - L, 118, '#2A160C');
    for (let x = Math.floor(L / 120) * 120; x < R; x += 120) {
      box(c, x + 10, GY - 104, 100, 90, '#3A2012'); box(c, x + 10, GY - 104, 100, 2, '#56321C'); box(c, x + 10, GY - 104, 2, 90, '#4A2A16');
      box(c, x + 10, GY - 16, 100, 2, '#1C0E06'); box(c, x + 108, GY - 104, 2, 90, '#1C0E06');
    }
    slab(c, L, GY - 124, R - L, 10, '#6A4224', { edge: 2, ink: false }); box(c, L, GY - 114, R - L, 2, INK);
    // (the crown up under the ceiling; the wall darker up there)
    hazeBands(c, L, BAY_TOP, R - L, 120, '#000000', 0.5, 0, 4);
    slab(c, L, BAY_TOP, R - L, 14, '#4A2A16', { edge: 2, ink: false }); box(c, L, BAY_TOP + 14, R - L, 2, INK);
    // (fake torches: flame-shaped bulbs in iron cups; dim)
    for (let x = x0 + 180; x < TX0 - 100; x += 360) {
      if (x < L - 40 || x > R + 40) continue;
      const fl = (f >> 3) % 2;
      steppedGlow(c, x, GY - 312, 46, '#F59E0B', 0.09, 0.0, 4);
      box(c, x - 2, GY - 290, 4, 22, INK); box(c, x - 10, GY - 270, 20, 4, INK); box(c, x - 9, GY - 270, 18, 2, '#5A5A60');
      slab(c, x - 8, GY - 300, 16, 12, '#3A3A40', { edge: 2 });
      c.fillStyle = INK; c.beginPath(); c.moveTo(x - 7, GY - 300); c.quadraticCurveTo(x - 6 + fl, GY - 318, x + fl, GY - 328); c.quadraticCurveTo(x + 6, GY - 316, x + 7, GY - 300); c.fill();
      c.fillStyle = '#EA580C'; c.beginPath(); c.moveTo(x - 5, GY - 301); c.quadraticCurveTo(x - 4 + fl, GY - 316, x + fl, GY - 325); c.quadraticCurveTo(x + 5, GY - 314, x + 5, GY - 301); c.fill();
      box(c, x - 2, GY - 312, 4, 10, '#FDE047'); box(c, x - 1, GY - 316 + fl, 2, 4, '#FEF3C7');
    }
    // HOW THE RIDE WORKS
    const hx = HOW_BOARD_X, hy = GY - 360;
    if (hx + 230 > L && hx - 230 < R) stamp(c, 'tw-howboard', hx - 222, hy - 14, 444, 212, g => paintHowBoard(g, hx, hy));
  });
};

/** The bay's floor going back to the wall (big checkered tiles, worn), and its front (a lit lip: stand on it). */
const drawBayFloor = (c: Ctx, eye: Eye, v: View) => {
  const L = Math.max(BAY_L, v.x0), R = Math.min(TX0 - WALL, v.x1);
  if (R <= L) return;
  // (going back: bands, dark at the wall, lighter nearer)
  const ds = [BAY_D, 0.925, 0.95, 0.975, 1];
  const cols = ['#1C1414', '#241A18', '#2C201C', '#342620'];
  for (let i = 0; i < cols.length; i++) {
    const ya = at(eye, 0, GY, ds[i])[1], yb = at(eye, 0, GY, ds[i + 1])[1];
    box(c, L, ya, R - L, yb - ya + 1, cols[i]);
  }
  // (the tile joints going back to the eye)
  c.strokeStyle = 'rgba(0, 0, 0, 0.5)'; c.lineWidth = 1; c.beginPath();
  for (let x = Math.floor(L / 64) * 64; x < R; x += 64) { const a = at(eye, x, GY, BAY_D), b = at(eye, x, GY, 1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  c.stroke();
  for (const d of [0.95]) box(c, L, at(eye, 0, GY, d)[1], R - L, 1, 'rgba(0, 0, 0, 0.5)');
  // (the front: the floor's edge, lit; the stone foundation under it)
  box(c, L, GY, R - L, 50, '#1E1614');
  bandedGradient(c, L, GY + 4, R - L, 46, ['#3A2C26', '#1E1614'], 4);
  // (under it, the rock the park's built on, all the way down)
  const yb = Math.min(HELL_AT + 600, v.y1);
  if (yb > GY + 50) { c.fillStyle = rockFill(c); c.fillRect(L, GY + 50, R - L, yb - GY - 50); box(c, L, GY + 50, R - L, 4, ROCK[0]); }
  box(c, L, GY, R - L, 2, '#D8C2A0'); box(c, L, GY + 2, R - L, 2, '#9A8268');
};

const drawBay = (c: Ctx, state: GameState, look: TowerLook, eye: Eye, v: View) => {
  const f = state.frame;
  // the bay building's roof and the dark of its ceiling (the sky over that is the backdrop's)
  {
    const L = Math.max(BAY_L, v.x0), R = Math.min(TX0 - WALL, v.x1);
    slab(c, L, BAY_TOP - 64, R - L, 34, '#2A2230', { edge: 2 });
    for (let x = Math.floor(L / 24) * 24; x < R; x += 24) box(c, x, BAY_TOP - 64, 2, 8, '#1A1420');
    box(c, L, BAY_TOP - 66, R - L, 2, '#5A4E66');
    box(c, L, BAY_TOP - 30, R - L, 40, '#0E0A0C');
    // (the ceiling's underside, going back to the wall: dark boards, the trusses across it)
    quad(c, '#161012', [L, BAY_TOP + 10], [R, BAY_TOP + 10], at(eye, R, BAY_TOP, BAY_D), at(eye, L, BAY_TOP, BAY_D));
    for (let x = Math.floor(L / 240) * 240 + 20; x < R; x += 240) {
      const a = at(eye, x, BAY_TOP, BAY_D);
      quad(c, '#2A1A12', [x, BAY_TOP + 10], [x + 24, BAY_TOP + 10], [a[0] + 24 * BAY_D, a[1]], a);
      slab(c, x, BAY_TOP + 6, 24, 40, '#4A2C18', { edge: 2 });
    }
  }
  drawBayWall(c, eye, v, f);
  drawBayFloor(c, eye, v);
  // the way back to the hallway (an arch of the dungeon's stone)
  bayDoor(c, eye, ENTRY_DOOR_X + 10, 64, 136, '#4A4458', '#06050A', (g, l, t) => {
    for (let y = t + 10; y < GY; y += 26) box(g, l, y, 64, 1, '#120E16');
  });
  plaque(c, ENTRY_DOOR_X + 10, GY - 166, 'DUNGEON', '#2E1065', '#BBF7D0');
  // the wait sign, on its posts
  {
    const sx = WAIT_SIGN_X;
    pole(c, sx - 60, GY - 72, 6, 72, IRON); pole(c, sx + 54, GY - 72, 6, 72, IRON);
    plaque(c, sx, GY - 80, 'WAIT FROM HERE: 45 MIN', '#450A0A', '#FDBA74');
  }
  // the queue: two rows standing back on the floor (the line's switchbacks), the brass rails in front of each
  for (const row of [1, 0]) {
    const d = row ? 0.935 : 0.965;
    inDepth(c, eye, d, () => {
      QUEUE_PEOPLE.filter(q => q.row === row).forEach(q => {
        c.save(); c.translate(q.x, GY); c.scale(0.86, 0.86);
        drawPerson(c, { seed: q.seed, outfit: 'guest', f: f + q.seed, pose: 'stand', mood: (f + q.seed) % 400 < 40 ? 'bored' : 'happy', woman: q.seed % 5 < 2 });
        c.restore();
      });
      const ry = GY - 36;
      for (let x = QUEUE_X0; x <= QUEUE_X1; x += 110) { pole(c, x, ry, 5, 36, BRASS); ball(c, x + 2.5, ry - 2, 4, BRASS); box(c, x - 6, GY - 3, 17, 3, '#3A2A14'); }
      box(c, QUEUE_X0, ry + 2, QUEUE_X1 - QUEUE_X0, 5, INK);
      box(c, QUEUE_X0, ry + 3, QUEUE_X1 - QUEUE_X0, 3, '#8A6420');
    });
  }
  // the marquee over the platform, on its chains, its chase lights
  const mx = (PLATFORM_X0 + PLATFORM_X1) / 2;
  if (mx + 200 > v.x0 && mx - 200 < v.x1) {
    for (const cx of [mx - 150, mx + 146]) for (let y = BAY_TOP + 16; y < GY - 440; y += 6) box(c, cx + 1, y, 2, 4, '#5A5A60');
    slab(c, mx - 172, GY - 442, 344, 58, '#5A1010', { edge: 4 });
    box(c, mx - 160, GY - 432, 320, 38, '#2A0606');
    for (let i = 0; i < 16; i++) {
      const on = (f >> 4) % 2 === i % 2;
      for (const by of [GY - 437, GY - 389]) ball(c, mx - 158 + i * 21, by, 2.5, on ? '#FDE047' : '#5A3A10', false);
    }
    text(c, 'ELEVATOR TO HELL', mx, GY - 405, '#FDE68A', 12, 'center', '#7A1A08');
  }
  // the platform (a step up, at the back: not his to stand on), the track off it into the tower
  inDepth(c, eye, 0.95, () => {
    const L = PLATFORM_X0, R = TX0;
    slab(c, L, GY - 22, R - L, 22, '#2E2622', { edge: 2 });
    box(c, L, GY - 22, R - L, 2, '#6A5A50');
    for (let x = L + 40; x < R; x += 80) { box(c, x, GY - 16, 30, 2, '#E8C130'); box(c, x + 6, GY - 16, 6, 2, INK); box(c, x + 18, GY - 16, 6, 2, INK); }
  });
  box(c, PLATFORM_X0 + 40, GY - 3, TX0 - PLATFORM_X0 - 40, 3, '#3A3A40'); box(c, PLATFORM_X0 + 40, GY - 3, TX0 - PLATFORM_X0 - 40, 1, '#6A6A74');
  // the car, at the platform or rolling off it (behind the gate)
  for (const car of look.ride.cars) {
    if (car.phase === 'lift') {
      // (up through the hatch in the floor: nothing of it below the floor's line)
      c.save(); c.beginPath(); c.rect(car.x - CAR_W, GY - 400, CAR_W * 2, 400); c.clip(); drawCar(c, car, f); c.restore();
    } else if ((car.phase === 'board' || car.phase === 'roll') && car.x < TX0 + 100) { drawCar(c, car, f); drawWalkers(c, car, f); }
  }
  // the gate (a turnstile), the rail along the front of the platform
  pole(c, PLATFORM_X0 - 12, GY - 62, 8, 62, '#A1A1AA');
  slab(c, PLATFORM_X0 - 34, GY - 58, 32, 6, '#C8C8D0', { edge: 2 });
  ball(c, PLATFORM_X0 - 8, GY - 64, 5, '#D4D4D8');
  // (a velvet rope between brass posts: a rope, not a rail to stand on)
  for (let x = PLATFORM_X0; x < PLATFORM_X1 - 40; x += 80) {
    const a = Math.max(x, PLATFORM_X0), b = Math.min(x + 80, PLATFORM_X1);
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(a, GY - 44); c.quadraticCurveTo((a + b) / 2, GY - 26, b, GY - 44); c.stroke();
    c.strokeStyle = '#8A1420'; c.lineWidth = 3; c.beginPath(); c.moveTo(a, GY - 44); c.quadraticCurveTo((a + b) / 2, GY - 26, b, GY - 44); c.stroke();
  }
  for (let x = PLATFORM_X0 + 40; x < PLATFORM_X1; x += 80) { pole(c, x - 2, GY - 48, 5, 48, BRASS); ball(c, x + 0.5, GY - 50, 4, BRASS); }
  // the operator's booth: a little gothic kiosk, him (little devil horns) behind its window
  {
    const bx = BOOTH_X;
    // (its side, going back)
    if (eye.x > bx + 50) quad(c, '#2A1A12', [bx + 50, GY - 150], at(eye, bx + 50, GY - 150, 0.93), at(eye, bx + 50, GY, 0.93), [bx + 50, GY]);
    else if (eye.x < bx - 50) quad(c, '#2A1A12', [bx - 50, GY - 150], at(eye, bx - 50, GY - 150, 0.93), at(eye, bx - 50, GY, 0.93), [bx - 50, GY]);
    slab(c, bx - 50, GY - 150, 100, 150, '#5A3A22', { edge: 4 });
    for (let y = GY - 60; y < GY - 8; y += 16) box(c, bx - 44, y, 88, 2, '#3A2414');
    // (the roof: a red gable, gold trim, a finial)
    c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 60, GY - 148); c.lineTo(bx, GY - 190); c.lineTo(bx + 60, GY - 148); c.closePath(); c.fill();
    c.fillStyle = '#7F1D1D'; c.beginPath(); c.moveTo(bx - 56, GY - 150); c.lineTo(bx, GY - 186); c.lineTo(bx + 56, GY - 150); c.closePath(); c.fill();
    c.fillStyle = '#A82424'; c.beginPath(); c.moveTo(bx - 50, GY - 152); c.lineTo(bx, GY - 184); c.lineTo(bx - 4, GY - 152); c.closePath(); c.fill();
    box(c, bx - 60, GY - 152, 120, 4, '#C8962E'); box(c, bx - 60, GY - 152, 120, 1, '#F2D07A');
    ball(c, bx, GY - 190, 4, '#C8962E');
    // (the window, him in it)
    box(c, bx - 42, GY - 132, 84, 64, INK);
    bandedGradient(c, bx - 40, GY - 130, 80, 60, ['#123048', '#0A1C2C'], 4);
    c.save(); c.beginPath(); c.rect(bx - 40, GY - 130, 80, 60); c.clip();
    c.save(); c.translate(bx + 4, GY - 22); c.scale(-1, 1);
    drawPerson(c, { seed: 777, outfit: 'operator', f, pose: 'stand', mood: 'bored', talking: look.opTalking });
    c.restore();
    // (the horns, on a headband)
    for (const hx of [bx - 6, bx + 7]) { c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 1, GY - 93); c.lineTo(hx + 2, GY - 104); c.lineTo(hx + 6, GY - 93); c.fill(); c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(hx, GY - 94); c.lineTo(hx + 2, GY - 102); c.lineTo(hx + 5, GY - 94); c.fill(); }
    c.restore();
    // (the glass: a glint, stepped)
    box(c, bx - 36, GY - 126, 10, 2, 'rgba(220, 240, 255, 0.35)'); box(c, bx - 36, GY - 124, 2, 10, 'rgba(220, 240, 255, 0.25)');
    box(c, bx - 40, GY - 130, 2, 60, '#5A3A22'); box(c, bx - 1, GY - 130, 2, 60, '#5A3A22');
    // (the counter: dark, flat, not somewhere to stand)
    box(c, bx - 52, GY - 70, 104, 8, '#2A1A10'); box(c, bx - 52, GY - 62, 104, 2, INK);
    plaque(c, bx, GY - 36, 'OPERATOR', '#3A2414', '#FDE68A', 6);
    // (his light: red while they're getting in; green, gate shut, bars down: go)
    const go = readyLight(look.ride);
    if (go) steppedGlow(c, bx + 36, GY - 172, 22, '#4ADE80', 0.22, 0.02, 4);
    slab(c, bx + 28, GY - 180, 16, 16, '#27272A', { edge: 2 });
    ball(c, bx + 36, GY - 172, 5, go ? '#4ADE80' : '#B91C1C', false);
    if (!go) box(c, bx + 34, GY - 175, 2, 2, '#F87171');
  }
  // the staff door
  bayDoor(c, eye, STAFF_DOOR_X, 60, 130, '#3F3F46', '#1C1917', (g, l, t) => {
    slab(g, l + 2, t + 2, 56, 128, '#4A4A52', { edge: 2 });
    box(g, l + 8, t + 14, 44, 40, '#3A3A42'); box(g, l + 8, t + 64, 44, 56, '#3A3A42');
    box(g, l + 6, t + 64, 48, 4, '#9A9AA4'); box(g, l + 6, t + 68, 48, 2, INK);
    box(g, l + 26, t + 22, 8, 10, '#121214'); box(g, l + 27, t + 23, 6, 3, '#2A2A30');
  });
  plaque(c, STAFF_DOOR_X, GY - 158, 'CAST MEMBERS ONLY', '#1C1917', '#FDE68A');
  // the hatch the cars come up through (in the floor, by the dock)
  {
    const open = look.ride.cars.some(k => k.phase === 'lift' || (k.phase === 'under' && k.t > 120));
    const hx = DOCK_X - CAR_W / 2 - 8, hw = CAR_W + 16;
    box(c, hx - 4, GY - 1, hw + 8, 9, INK);
    if (open) {
      box(c, hx, GY, hw, 8, '#000000');
      // (its leaves up either side, on their rams)
      for (const lx of [hx - 20, hx + hw + 4]) { slab(c, lx, GY - 34, 16, 34, '#4A4A52', { edge: 2 }); for (let y = GY - 30; y < GY; y += 8) { box(c, lx + 2, y, 12, 4, '#E8C130'); box(c, lx + 6, y, 4, 4, INK); } }
    } else {
      for (const [lx, lw] of [[hx, hw / 2 - 1], [hx + hw / 2 + 1, hw / 2 - 1]]) {
        box(c, lx, GY, lw, 6, '#52525B');
        for (let x = lx + 4; x < lx + lw - 4; x += 8) box(c, x, GY + 1, 4, 1, '#3A3A40');
      }
      box(c, hx, GY, hw, 2, '#D8C2A0');
    }
    // (the yellow-and-black stripes round it: keep clear)
    for (let x = hx - 4; x < hx + hw + 4; x += 12) box(c, x, GY - 1, 6, 1, '#E8C130');
  }
  // after: the line's no shorter (a sign hung on the marquee, hand-lettered)
  if (look.crashed) { slab(c, mx - 92, GY - 382, 184, 22, '#F4E8C8', { edge: 2 }); text(c, 'NOW EVEN LONGER!', mx, GY - 367, '#7F1D1D', 7, 'center', null); }
};

// ---------------------------------------------------------------------------------------------------------------
// The tower: the back wall, its windows and sconces

const PLAQUES = ['FLOOR 1', 'FLOOR 2', 'FLOOR 3', 'FLOOR 4', 'FLOOR 5', 'FLOOR 6', 'CLOCK ROOM'];

/** A lancet window in the back wall (its middle at the origin): the night out it, leaded panes, a stone surround. */
const paintWindow = (g: Ctx, moon: boolean) => {
  const arch = (w: number, top: number, bottom: number) => { g.beginPath(); g.moveTo(-w / 2, bottom); g.lineTo(-w / 2, top + w / 2); g.arc(0, top + w / 2, w / 2, Math.PI, 0); g.lineTo(w / 2, bottom); g.closePath(); };
  g.fillStyle = INK; arch(52, -58, 52); g.fill();
  g.fillStyle = STONE[3]; arch(48, -56, 50); g.fill();
  g.fillStyle = STONE[4]; arch(48, -56, 50); g.save(); g.clip(); box(g, -24, -56, 6, 106, STONE[4]); box(g, 18, -56, 6, 106, STONE[1]); g.restore();
  g.fillStyle = STONE[1]; arch(36, -48, 44); g.fill();
  g.save(); g.fillStyle = '#000'; arch(30, -44, 44); g.clip();
  bandedGradient(g, -16, -44, 32, 88, ['#06081A', '#0E1430', '#1A2248'], 6);
  if (moon) { ball(g, 4, -20, 7, '#D8D8C0', false); box(g, 0, -26, 4, 2, '#F2F2DC'); }
  box(g, -9, -8, 1, 1, '#E0E7FF'); box(g, 7, 12, 1, 1, '#A8B0D0'); box(g, -5, 24, 1, 1, '#E0E7FF');
  // (the leading: diamonds)
  g.strokeStyle = '#141018'; g.lineWidth = 1; g.beginPath();
  for (let k = -60; k < 60; k += 10) { g.moveTo(-16, k); g.lineTo(16, k + 32); g.moveTo(16, k); g.lineTo(-16, k + 32); }
  g.stroke();
  box(g, -1, -44, 2, 88, '#141018');
  g.restore();
  // (the sill)
  slab(g, -28, 44, 56, 8, STONE[3], { edge: 2 });
};
/** A gas sconce on the wall: an iron arm, a glass lantern, the flame; its light (dim, stepped). */
const drawSconce = (c: Ctx, x: number, y: number, f: number) => {
  const fl = (f >> 2) % 9 === 0 ? 0.05 : 0.08;
  steppedGlow(c, x, y, 64, '#F5B041', fl, 0.0, 4);
  box(c, x - 2, y + 10, 4, 14, INK); box(c, x - 8, y + 22, 16, 4, INK);
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 8, y - 10); c.lineTo(x, y - 18); c.lineTo(x + 8, y - 10); c.fill();
  box(c, x - 8, y - 10, 16, 20, INK);
  box(c, x - 6, y - 8, 12, 16, '#E8C878'); box(c, x - 6, y - 8, 12, 4, '#FFF1C0'); box(c, x - 6, y + 4, 12, 4, '#C8A050');
  box(c, x - 1, y - 8, 2, 16, '#2A2018');
  box(c, x - 2, y - 2 + ((f >> 3) % 2), 4, 6, '#FFFFFF');
  box(c, x - 9, y + 8, 18, 3, '#3A3A40');
};

/** The back wall (WALL_D back): the stone, darker up under each ceiling and down by each floor; the windows, the
 *  sconces, the floors' numbers; the clock face, way up. */
const drawBackWall = (c: Ctx, eye: Eye, v: View, f: number, crashed: boolean) => {
  inDepth(c, eye, WALL_D, () => {
    const w = viewAt(v, eye, WALL_D);
    const y0 = Math.max(ROOF, w.y0), y1 = Math.min(GY, w.y1);
    if (y1 <= y0) return;
    c.fillStyle = stoneFill(c); c.fillRect(TX0, y0, W, y1 - y0);
    for (let k = 0; k <= STORIES; k++) {
      const fy = F(k), ceil = k < STORIES ? F(k + 1) + SLAB : ROOF;
      if (fy < w.y0 - 40 || ceil > w.y1 + 40) continue;
      // (the dark up under the ceiling, and along the floor)
      hazeBands(c, TX0, ceil, W, 70, '#08060A', 0.55, 0, 4);
      hazeBands(c, TX0, fy - 30, W, 30, '#08060A', 0, 0.4, 3);
      if (k === STORIES) continue;
      c.save(); c.translate(U(upRight(k) ? 160 : 1000), fy - 230);
      stamp(c, `tw-window-${k === 4 ? 1 : 0}`, -30, -62, 60, 120, g => paintWindow(g, k === 4));
      c.restore();
      drawSconce(c, U(upRight(k) ? 320 : 840), fy - 300, f + k * 37);
    }
    for (let k = 0; k <= STORIES; k++) {
      const y = F(k) - 300;
      if (y < w.y0 - 30 || y > w.y1 + 30) continue;
      plaque(c, U(k === 0 || upRight(k) ? 140 : 1020), y, PLAQUES[k], '#221C1A', '#E7E5E4');
    }
    // (the clock room: the clock face from behind)
    if (w.y0 < TOP) drawClockFace(c, f, crashed);
  });
};

/** The side walls' insides, going back to the back wall (only the one that faces the eye shows); and the roof's
 *  underside. */
const drawRoomSides = (c: Ctx, eye: Eye, v: View) => {
  const y0 = Math.max(ROOF, v.y0 - 200), y1 = Math.min(GY, v.y1 + 200);
  for (const X of [TX0, TX1]) {
    if (X === TX0 ? eye.x <= X : eye.x >= X) continue;
    const ds = [1, 0.98, 0.96, WALL_D];
    const cols = ['#2C2634', '#25202C', '#1E1A24'];
    for (let i = 0; i < cols.length; i++) quad(c, cols[i], at(eye, X, y0, ds[i]), at(eye, X, y0, ds[i + 1]), at(eye, X, y1, ds[i + 1]), at(eye, X, y1, ds[i]));
    c.strokeStyle = '#141118'; c.lineWidth = 1; c.beginPath();
    for (let y = Math.ceil(y0 / 32) * 32; y < y1; y += 32) { const a = at(eye, X, y, 1), b = at(eye, X, y, WALL_D); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.stroke();
    seg(c, at(eye, X, y0, WALL_D), at(eye, X, y1, WALL_D), '#0A080C', 2);
  }
  if (v.y0 < ROOF + 60 && eye.y > ROOF) {
    quad(c, '#16121A', [TX0, ROOF], [TX1, ROOF], at(eye, TX1, ROOF, WALL_D), at(eye, TX0, ROOF, WALL_D));
    // (the rafters going back)
    for (let x = TX0 + 40; x < TX1; x += 120) quad(c, '#2A1C14', [x, ROOF], [x + 22, ROOF], at(eye, x + 22, ROOF, WALL_D), at(eye, x, ROOF, WALL_D));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floors

/** A floor piece's top going back to the wall (from over it), or its underside (from under it). */
const pieceDepth = (c: Ctx, eye: Eye, k: number, p: Piece) => {
  const xa = U(p[0]), xb = U(p[1]), ya = F(k) + p[2], yb = F(k) + p[3];
  if (eye.y < Math.min(ya, yb)) {
    // (the boards going back, seams along them, lit at the front)
    quad(c, PLANK[2], [xa, ya], [xb, yb], at(eye, xb, yb, WALL_D), at(eye, xa, ya, WALL_D));
    for (const d of [0.95, 0.975]) seg(c, at(eye, xa, ya, d), at(eye, xb, yb, d), PLANK[1], 1);
    quad(c, PLANK[3], [xa, ya], [xb, yb], at(eye, xb, yb, 0.988), at(eye, xa, ya, 0.988));
  } else if (eye.y > Math.max(ya, yb) + SLAB) {
    // (the underside: dark boards, the joists going back)
    const ua = ya + SLAB, ub = yb + SLAB;
    quad(c, '#1E140C', [xa, ua], [xb, ub], at(eye, xb, ub, WALL_D), at(eye, xa, ua, WALL_D));
    for (let x = xa + 24; x < xb - 10; x += 64) {
      const y = ua + (ub - ua) * ((x - xa) / (xb - xa));
      quad(c, '#3A2412', [x, y], [x + 12, y], at(eye, x + 12, y, WALL_D), at(eye, x, y, WALL_D));
    }
  }
};
/** A stretch of floor, its front: the boards' edge (a lit lip along the top), the big beam under it; a sagging one
 *  slopes and breaks off ragged. */
const drawPiece = (c: Ctx, k: number, p: Piece, sags: boolean) => {
  const xa = U(p[0]), xb = U(p[1]), ya = F(k) + p[2], yb = F(k) + p[3];
  const band = (o: number, h: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(xa, ya + o); c.lineTo(xb, yb + o); c.lineTo(xb, yb + o + h); c.lineTo(xa, ya + o + h); c.closePath(); c.fill(); };
  band(-1, SLAB + 2, INK);
  band(0, 9, PLANK[2]);
  band(9, 1, INK);
  band(10, SLAB - 11, '#4A2E18');
  band(SLAB - 4, 3, '#2E1C0E');
  band(10, 2, '#5E3C20');
  // (the lit lip: somewhere to stand)
  band(0, 2, LIP_HI); band(2, 2, LIP);
  if (ya === yb) { checker(c, xa, ya + 4, xb - xa, 2, PLANK[3]); checker(c, xa, ya + 7, xb - xa, 2, PLANK[1], 1); }
  // (the board ends, the bolts in the beam)
  const yAt = (x: number) => ya + (yb - ya) * ((x - xa) / (xb - xa));
  for (let x = xa + 30; x < xb - 6; x += 46) { const y = yAt(x); box(c, x, y + 4, 1, 5, PLANK[0]); box(c, x + 1, y + 4, 1, 5, PLANK[3]); }
  for (let x = xa + 20; x < xb - 10; x += 64) { const y = yAt(x); box(c, x, y + 15, 4, 4, '#1A120C'); box(c, x, y + 15, 2, 2, '#8A8A90'); }
  if (sags) {
    // (where it's torn away at its low end: splintered boards sticking out, a bent nail or two)
    for (let i = 0; i < 5; i++) {
      const l = 8 + ((i * 7) % 11);
      c.fillStyle = INK; c.beginPath(); c.moveTo(xb - 2, yb + i * 4); c.lineTo(xb + l + 2, yb + i * 4 + 2 + (i % 2) * 3); c.lineTo(xb - 2, yb + i * 4 + 5); c.fill();
      c.fillStyle = i % 2 ? PLANK[3] : PLANK[2]; c.beginPath(); c.moveTo(xb - 2, yb + i * 4 + 1); c.lineTo(xb + l, yb + i * 4 + 2 + (i % 2) * 3); c.lineTo(xb - 2, yb + i * 4 + 4); c.fill();
    }
    box(c, xb - 6, yb + SLAB, 2, 8, '#8A8A90');
  }
};
/** Rubble on a floor by the shaft's edge, after (low: nothing to stand on). */
const drawRubble = (c: Ctx, x: number, y: number, n: number) => {
  for (let i = 0; i < n; i++) {
    const h = hash(x * 0.01 + i * 3.3), bx = x + (h - 0.5) * 60, w = 6 + Math.floor(h * 10);
    box(c, bx - 1, y - 7, w + 2, 7, INK); box(c, bx, y - 6, w, 6, i % 3 ? STONE[3] : PLANK[2]); box(c, bx, y - 6, w, 1, i % 3 ? STONE[4] : PLANK[3]);
  }
};
/** The shaft jammed with wreckage at floor k (none, the way it's built now: kept in case). */
const drawJam = (c: Ctx, k: number) => {
  const y = F(k);
  slab(c, SH0 - 4, y - 2, SH1 - SH0 + 8, 20, '#B8862E', { edge: 2 });
  for (let x = SH0 + 8; x < SH1; x += 24) box(c, x, y + 4, 10, 8, '#8A5A18');
  box(c, SH0 - 2, y - 2, SH1 - SH0 + 4, 2, LIP_HI);
};

// ---------------------------------------------------------------------------------------------------------------
// The shafts: the iron lattice, the guide rails, the nets across, the DROP lamps

const drawShaft = (c: Ctx, v: View, crashed: boolean) => {
  const sy0 = Math.max(ROOF, v.y0), sy1 = Math.min(GY + 30, v.y1);
  if (sy1 <= sy0) return;
  // (the dark down it: darkest in the middle of each)
  box(c, SH0, sy0, SH1 - SH0, sy1 - sy0, '#0A080E');
  for (const [a, b] of [[SH0, SHX], [SHX, SH1]]) { box(c, a, sy0, 14, sy1 - sy0, '#120F18'); box(c, b - 14, sy0, 14, sy1 - sy0, '#120F18'); checker(c, a + 14, sy0, 4, sy1 - sy0, '#120F18'); }
  // (the lattice: X bracing between the corner posts, struts across; after the crash, torn and bent)
  for (const [a, b] of [[SH0, SHX], [SHX, SH1]]) {
    for (let y = Math.ceil(sy0 / 90) * 90 - 90; y < sy1; y += 90) {
      const torn = crashed && hash(y * 0.013 + a) < 0.45;
      if (!torn) {
        seg(c, [a + 4, y], [b - 4, y + 90], '#06050A', 4); seg(c, [b - 4, y], [a + 4, y + 90], '#06050A', 4);
        seg(c, [a + 4, y], [b - 4, y + 90], '#2C2C34', 2); seg(c, [b - 4, y], [a + 4, y + 90], '#2C2C34', 2);
      } else {
        // (a brace snapped off, hanging from the post)
        seg(c, [a + 4, y], [a + 22, y + 46], '#2C2C34', 2); seg(c, [b - 4, y], [b - 14, y + 30], '#2C2C34', 2);
      }
      box(c, a, y - 2, b - a, 4, '#1A1A20'); box(c, a, y - 2, b - a, 1, '#3A3A44');
    }
    // (the corner posts and the car's guide rails)
    pole(c, a, sy0, 6, sy1 - sy0, '#3A3A44'); pole(c, b - 6, sy0, 6, sy1 - sy0, '#3A3A44');
    pole(c, a + 10, sy0, 5, sy1 - sy0, '#6A6E78'); pole(c, b - 15, sy0, 5, sy1 - sy0, '#6A6E78');
  }
  // (the I-beam between the two)
  box(c, SHX - 5, sy0, 10, sy1 - sy0, INK); box(c, SHX - 4, sy0, 8, sy1 - sy0, '#3F3F48'); box(c, SHX - 4, sy0, 2, sy1 - sy0, '#7A7A86'); box(c, SHX - 1, sy0, 2, sy1 - sy0, '#2A2A32');
  for (let y = Math.ceil(sy0 / 40) * 40; y < sy1; y += 40) { box(c, SHX - 3, y, 2, 2, '#9A9AA6'); box(c, SHX + 1, y, 2, 2, '#9A9AA6'); }
  // (stenciled on the posts, every floor)
  for (let k = 0; k <= STORIES; k++) { const y = F(k) - 190; if (y < sy0 - 20 || y > sy1 + 20) continue; text(c, 'UP', (SH0 + SHX) / 2, y, '#4A4A58', 8, 'center', null); text(c, 'DOWN', (SHX + SH1) / 2, y, '#4A4A58', 8, 'center', null); }
};
/** A safety net across the shaft (or a stretch of it): a lit rope along its top (stand on it: it holds. For now),
 *  the mesh sagging under. */
const drawNet = (c: Ctx, y: number, a = SH0, b = SH1) => {
  const sag = (x: number) => Math.sin(((x - a) / (b - a)) * Math.PI) * 16;
  // (the mesh: diamonds, sagging to the bottom rope)
  c.strokeStyle = '#7A6C52'; c.lineWidth = 1; c.beginPath();
  for (let x = a; x < b; x += 12) { c.moveTo(x, y + 4); c.lineTo(x + 6, y + 6 + sag(x + 6) * 0.5); c.lineTo(x + 12, y + 4); c.moveTo(x + 6, y + 6 + sag(x + 6) * 0.5); c.lineTo(x, y + 8 + sag(x)); c.moveTo(x + 6, y + 6 + sag(x + 6) * 0.5); c.lineTo(x + 12, y + 8 + sag(x + 12)); }
  c.stroke();
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(a, y + 8); for (let x = a; x <= b; x += 8) c.lineTo(x, y + 8 + sag(x)); c.stroke();
  c.strokeStyle = '#9A8862'; c.lineWidth = 1; c.beginPath(); c.moveTo(a, y + 8); for (let x = a; x <= b; x += 8) c.lineTo(x, y + 8 + sag(x)); c.stroke();
  // (the top rope: twisted, lit)
  box(c, a, y - 1, b - a, 6, INK);
  box(c, a, y, b - a, 4, '#B8A27A'); box(c, a, y, b - a, 1, '#F4E6C2');
  for (let x = a + 2; x < b; x += 6) box(c, x, y + 2, 2, 2, '#7A6A4A');
  // (the anchors in the posts)
  for (const x of [a - 6, b - 2]) { slab(c, x, y - 4, 8, 10, IRON, { edge: 2 }); box(c, x + 3, y - 1, 2, 2, '#9A9AA4'); }
};
/** A net's shreds hanging off the posts, after it's been gone through. */
const drawNetShreds = (c: Ctx, y: number) => {
  c.strokeStyle = '#8A7A5A'; c.lineWidth = 1;
  for (const x0 of [SH0 + 2, SH1 - 26]) for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(x0 + i * 5, y + 2); c.lineTo(x0 + i * 4 + 2, y + 24 + (i % 3) * 10); c.stroke(); }
  for (const x of [SH0 - 6, SH1 - 2]) { slab(c, x, y - 4, 8, 10, IRON, { edge: 2 }); box(c, x + 3, y - 1, 2, 2, '#9A9AA4'); }
};
/** The ride's red DROP lamps on the shaft's posts, at every floor: lit (and flashing) while a car's coming down. */
const drawShaftLamps = (c: Ctx, k: number, on: boolean, f: number) => {
  const y = F(k) - 70, lit = on && (f >> 3) % 2 === 0;
  for (const x of [SH0 - 12, SH1 + 2]) {
    if (lit) steppedGlow(c, x + 5, y + 7, 40, '#EF4444', 0.3, 0.04, 4);
    slab(c, x - 3, y - 4, 16, 22, '#2A2A30', { edge: 2 });
    box(c, x, y, 10, 14, INK);
    box(c, x + 1, y + 1, 8, 12, lit ? '#EF4444' : '#4A0A0A');
    box(c, x + 1, y + 1, 8, 3, lit ? '#FCA5A5' : '#6A1414'); box(c, x + 2, y + 2, 2, 2, lit ? '#FFFFFF' : '#8A2020');
    box(c, x + 1, y + 10, 8, 3, lit ? '#B91C1C' : '#300606');
    // (its plate under it)
    box(c, x - 7, y + 20, 24, 10, INK); box(c, x - 6, y + 21, 22, 8, '#E8C130');
    text(c, 'DROP', x + 5, y + 28, '#1A0B06', 5, 'center', null);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The clock room

const drawClockFace = (c: Ctx, f: number, crashed: boolean) => {
  // the clock face from behind: frosted glass in stepped rings (lit through from outside, dim), iron spokes and rings,
  // the numerals backward, the hands' shadows through it
  const cx = U(920), cy = ROOF + 230, r = 170;
  c.fillStyle = INK; c.beginPath(); c.arc(cx, cy, r + 16, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3A3640'; c.beginPath(); c.arc(cx, cy, r + 14, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#4A4552'; c.beginPath(); c.arc(cx - 2, cy - 2, r + 10, Math.PI * 0.9, Math.PI * 1.6); c.lineTo(cx, cy); c.fill();
  const glass = ['#4E4128', '#5E4E2E', '#6E5A34', '#7E683A', '#8C7442'];
  glass.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(cx, cy, r * (1 - i * 0.18), 0, Math.PI * 2); c.fill(); });
  // (the frost: a stipple)
  for (let i = 0; i < 90; i++) { const a = hash(i * 1.7) * Math.PI * 2, d = Math.sqrt(hash(i * 2.9)) * (r - 6); box(c, Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 2, 2, i % 2 ? '#9A8250' : '#4E4128'); }
  const nums = ['IIX', 'I', 'II', 'III', 'VI', 'V', 'IV', 'IIV', 'IIIV', 'XI', 'X', 'IX'];
  nums.forEach((n, i) => { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; c.save(); c.translate(cx - Math.cos(a) * (r - 26), cy + Math.sin(a) * (r - 26)); c.scale(-1, 1); text(c, n, 0, 4, '#2A2010', 10, 'center', null); c.restore(); });
  // (the iron: the rings, the spokes)
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r * 0.62, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#3A3640'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r * 0.62, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; seg(c, [cx + Math.cos(a) * 20, cy + Math.sin(a) * 20], [cx + Math.cos(a) * r, cy + Math.sin(a) * r], INK, 4); seg(c, [cx + Math.cos(a) * 20, cy + Math.sin(a) * 20], [cx + Math.cos(a) * r, cy + Math.sin(a) * r], '#3A3640', 2); }
  // (after: stopped, and cracked across, a shard out of it)
  const hh = crashed ? 2.2 : -(f / 3000) * Math.PI * 2, mm = crashed ? -0.4 : -(f / 250) * Math.PI * 2;
  c.lineCap = 'round';
  c.strokeStyle = '#1E1810'; c.lineWidth = 12; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(hh) * 90, cy - Math.cos(hh) * 90); c.stroke();
  c.lineWidth = 7; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(mm) * 140, cy - Math.cos(mm) * 140); c.stroke();
  c.lineCap = 'butt';
  // (the motion works at the middle: the arbor, its gear box)
  slab(c, cx - 16, cy - 16, 32, 32, '#4A4552', { edge: 2 });
  ball(c, cx, cy, 7, '#8A6A2A');
  if (crashed) {
    c.fillStyle = '#0A0C1E'; c.beginPath(); c.moveTo(cx - 40, cy - 10); c.lineTo(cx - 70, cy + 60); c.lineTo(cx - 10, cy + 70); c.closePath(); c.fill();
    box(c, cx - 40, cy + 40, 1, 1, '#E0E7FF');
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 150, cy - 60); c.lineTo(cx - 40, cy - 10); c.lineTo(cx + 10, cy + 40); c.lineTo(cx + 120, cy + 100); c.moveTo(cx - 40, cy - 10); c.lineTo(cx - 20, cy - 120); c.stroke();
    c.strokeStyle = '#A89868'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - 150, cy - 62); c.lineTo(cx - 40, cy - 12); c.lineTo(cx + 10, cy + 38); c.stroke();
  }
};

/** The bell over its gallery, on its yoke; the hanger up to the roof. */
const paintBell = (g: Ctx, bx: number, by: number) => {
  pole(g, bx - 5, ROOF, 10, by - ROOF - 14, IRON);
  slab(g, bx - 40, by - 18, 80, 14, OAK, { edge: 2 });
  for (const x of [bx - 34, bx + 26]) { box(g, x, by - 14, 6, 6, '#2A2A30'); box(g, x + 1, by - 13, 2, 2, '#9A9AA4'); }
  const shape = (o: number) => { g.beginPath(); g.moveTo(bx - 20 - o, by - 2 - o); g.lineTo(bx + 20 + o, by - 2 - o); g.quadraticCurveTo(bx + 26 + o, by + 50, bx + 46 + o, by + 90 + o); g.lineTo(bx - 46 - o, by + 90 + o); g.quadraticCurveTo(bx - 26 - o, by + 50, bx - 20 - o, by - 2 - o); g.closePath(); };
  g.fillStyle = INK; shape(2); g.fill();
  g.save(); shape(0); g.clip();
  const BR = ['#4A3008', '#6A4610', '#8A6018', '#B07E22', '#D8A83A', '#F2D27A'];
  const order = [3, 4, 5, 4, 3, 2, 2, 2, 1, 1, 1, 0];
  for (let i = 0; i < order.length; i++) box(g, bx - 48 + i * 8, by - 4, 9, 100, BR[order[i]]);
  // (the bands round it)
  for (const y of [by + 12, by + 70]) { box(g, bx - 48, y, 96, 3, BR[1]); box(g, bx - 48, y, 96, 1, BR[4]); }
  g.restore();
  // (the lip: a heavy ring)
  slab(g, bx - 52, by + 86, 104, 8, '#9A6C1E', { edge: 2 });
  // (the clapper hanging inside)
  box(g, bx - 3, by + 88, 6, 10, INK); ball(g, bx, by + 100, 6, '#5A5A60');
};

/** The winch the cars' cable comes off (over the shafts), its drum, the cable (after: snapped, frayed). */
const drawWinch = (c: Ctx, crashed: boolean) => {
  slab(c, SH0 - 22, ROOF + 38, SH1 - SH0 + 44, 54, '#3E3A44', { edge: 4 });
  // (the drum: stepped round, the cable wound on it)
  const dy = ROOF + 48;
  const DR = ['#1A1A20', '#2E2E36', '#4A4A54', '#6A6A76', '#8A8A96'];
  const order = [3, 4, 3, 2, 2, 1, 1, 0];
  for (let i = 0; i < order.length; i++) box(c, SH0 - 8, dy + i * 4, SH1 - SH0 + 16, 4, DR[order[i]]);
  for (let x = SH0 - 6; x < SH1 + 8; x += 6) box(c, x, dy, 1, 32, 'rgba(10, 8, 12, 0.6)');
  for (const x of [SH0 - 16, SH1 + 6]) { slab(c, x, dy - 4, 10, 40, IRON, { edge: 2 }); ball(c, x + 5, dy + 16, 4, '#8A8A96'); }
  // (the cable down)
  box(c, SHM - 3, ROOF + 90, 6, crashed ? 60 : 30, INK); box(c, SHM - 2, ROOF + 90, 2, crashed ? 60 : 30, '#5A5A64');
  if (crashed) { for (let i = 0; i < 4; i++) box(c, SHM - 8 + i * 4, ROOF + 148 + (i % 2) * 4, 2, 10, '#3A3A44'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The beams (LOAD-BEARING. DO NOT RAM)

const BEAM_COL = { wood: '#8A5A2E', steel: '#6A7484', main: '#8A3418' } as const;

const paintPlaque = (g: Ctx, b: (typeof BEAMS)[number], i: number, py: number) => {
  const w = b.w + 60;
  sign(g, b.x + b.w / 2 - w / 2, py - 14, w, 26, '#F2E6C4', '', '#7F1D1D', 6);
  text(g, b.look === 'main' ? 'MAIN SUPPORT' : `BEAM ${i + 1} OF ${BEAMS.length}`, b.x + b.w / 2, py - 3, '#8A1A1A', 6, 'center', null);
  text(g, i === 0 ? 'DO NOT RAM' : b.look === 'main' ? 'SERIOUSLY' : 'LOAD-BEARING', b.x + b.w / 2, py + 8, '#1C1917', 5, 'center', null);
};
const drawBeam = (c: Ctx, i: number, hp: number) => {
  const b = BEAMS[i], top = beamTop(b), bot = F(b.k), h = bot - top;
  const col = BEAM_COL[b.look], r = rampOf(col);
  if (hp <= 0) {
    // (the stumps: splintered (or torn) off the floor and the ceiling)
    const stump = (y: number, hh: number, up: boolean) => {
      box(c, b.x - 1, y, b.w + 2, hh, INK);
      pole(c, b.x, y, b.w, hh, col, false);
      const edge = up ? y : y + hh;
      c.fillStyle = INK; c.beginPath(); c.moveTo(b.x - 1, edge);
      for (let k = 0; k <= 6; k++) c.lineTo(b.x + (b.w * k) / 6, edge + (up ? -1 : 1) * (k % 2 ? 14 : 4 + (k % 3) * 3));
      c.lineTo(b.x + b.w + 1, edge); c.fill();
      c.fillStyle = r[3]; c.beginPath(); c.moveTo(b.x, edge);
      for (let k = 0; k <= 6; k++) c.lineTo(b.x + (b.w * k) / 6, edge + (up ? -1 : 1) * (k % 2 ? 12 : 3 + (k % 3) * 3));
      c.lineTo(b.x + b.w, edge); c.fill();
    };
    stump(bot - 24, 24, true); stump(top, 30, false);
    return;
  }
  // the knee braces up into the ceiling either side (for the look: the post's what holds it)
  for (const s of [-1, 1]) {
    const ax = s < 0 ? b.x : b.x + b.w, tx = ax + s * 46;
    seg(c, [tx, top], [ax, top + 56], INK, 9); seg(c, [tx, top], [ax, top + 56], r[1], 6); seg(c, [tx, top + 1], [ax, top + 55], r[3], 2);
  }
  box(c, b.x - 2, top, b.w + 4, h, INK);
  if (b.look === 'wood') {
    pole(c, b.x, top, b.w, h, col, false);
    // (the grain; iron straps, bolted)
    for (let y = top + 14; y < bot - 10; y += 22) box(c, b.x + 6 + ((y / 22) % 3) * 6, y, 2, 12, r[1]);
    for (let y = top + 40; y < bot - 20; y += 90) { box(c, b.x - 2, y, b.w + 4, 8, '#2A2A30'); box(c, b.x - 2, y, b.w + 4, 2, '#6A6A74'); box(c, b.x + 4, y + 3, 3, 3, '#9A9AA4'); box(c, b.x + b.w - 7, y + 3, 3, 3, '#9A9AA4'); }
  } else if (b.look === 'steel') {
    // (an I-beam: the flanges lit and shaded, the web set back)
    box(c, b.x, top, b.w, h, r[1]);
    box(c, b.x, top, 7, h, r[3]); box(c, b.x, top, 2, h, r[4]);
    box(c, b.x + b.w - 7, top, 7, h, r[2]); box(c, b.x + b.w - 2, top, 2, h, r[1]);
    box(c, b.x + 7, top, 3, h, r[0]); checker(c, b.x + 10, top, 2, h, r[0]);
    for (let y = top + 20; y < bot; y += 40) { box(c, b.x + 2, y, 3, 3, INK); box(c, b.x + 2, y, 1, 1, r[4]); box(c, b.x + b.w - 5, y, 3, 3, INK); }
  } else {
    // (the main: a riveted box column, red lead paint, collars every so often, hazard stripes at its foot)
    pole(c, b.x, top, b.w, h, col, false);
    for (let y = top + 30; y < bot - 40; y += 70) { slab(c, b.x - 5, y, b.w + 10, 10, '#4A4450', { edge: 2 }); for (let x = b.x; x < b.x + b.w; x += 10) box(c, x, y + 4, 2, 2, '#A8A0B0'); }
    for (let y = top + 10; y < bot; y += 16) { box(c, b.x + 3, y, 2, 2, r[0]); box(c, b.x + b.w - 5, y, 2, 2, r[0]); }
    c.save(); c.beginPath(); c.rect(b.x, bot - 30, b.w, 26); c.clip();
    box(c, b.x, bot - 30, b.w, 26, '#E8C130');
    c.fillStyle = INK; for (let k = -30; k < b.w + 30; k += 14) { c.beginPath(); c.moveTo(b.x + k, bot - 4); c.lineTo(b.x + k + 7, bot - 4); c.lineTo(b.x + k + 33, bot - 30); c.lineTo(b.x + k + 26, bot - 30); c.fill(); }
    c.restore();
  }
  // the cracks (the more it's taken, the more of them, the wider): ink, a lit lip on the near side, splinters
  const dmg = b.hp - hp;
  for (let j = 0; j < dmg; j++) {
    const cy = bot - 80 - j * 70;
    const pts: P[] = [[b.x - 2, cy], [b.x + b.w * 0.35, cy + 8], [b.x + b.w * 0.25, cy + 18], [b.x + b.w * 0.7, cy + 24], [b.x + b.w + 2, cy + 32]];
    c.strokeStyle = INK; c.lineWidth = 3 + j * 2; c.beginPath(); pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.strokeStyle = r[4]; c.lineWidth = 1; c.beginPath(); pts.forEach(([x, y], k) => (k ? c.lineTo(x, y - 3 - j) : c.moveTo(x, y - 3 - j))); c.stroke();
    for (let s = 0; s < 3; s++) box(c, b.x - 6 + s * (b.w / 2 + 4), cy + 4 + s * 9, 6, 2, r[3]);
  }
  // the plaque on it (at head height): which one it is, and the warning
  const py = bot - 120;
  stamp(c, `tw-beamplaque-${i}`, b.x - 36, py - 20, b.w + 72, 38, g => paintPlaque(g, b, i, py));
};

// ---------------------------------------------------------------------------------------------------------------
// The works on the walls

/** A cuckoo clock (its middle at the origin): a carved chalet, its door up top (the bird's), the dial, the pine-cone
 *  weights on their chains. Stamped; its pendulum's drawn live. */
const paintCuckoo = (g: Ctx) => {
  const WN = rampOf('#6A3A1A');
  // (the carving over it: leaves, a carved bird)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -60, 34, 10, 0, 0, Math.PI * 2); g.fill();
  for (let k = -3; k <= 3; k++) { g.fillStyle = k % 2 ? WN[2] : WN[3]; g.beginPath(); g.ellipse(k * 9, -60 - (3 - Math.abs(k)) * 2, 7, 5, k * 0.3, 0, Math.PI * 2); g.fill(); }
  // (the roof: stepped shingles)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-38, -26); g.lineTo(0, -56); g.lineTo(38, -26); g.closePath(); g.fill();
  g.fillStyle = WN[1]; g.beginPath(); g.moveTo(-35, -27); g.lineTo(0, -53); g.lineTo(35, -27); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(-35, -27); g.lineTo(0, -53); g.lineTo(35, -27); g.closePath(); g.clip();
  for (let y = -52; y < -26; y += 6) for (let x = -36 + ((y / 6) % 2) * 4; x < 36; x += 8) { box(g, x, y, 7, 5, WN[2]); box(g, x, y, 7, 1, WN[3]); }
  g.restore();
  // (the case)
  slab(g, -26, -30, 52, 60, WN[2], { edge: 2 });
  // (the bird's door, up top: shut; its own art's drawn over when it's out)
  box(g, -10, -27, 20, 20, INK); box(g, -9, -26, 18, 18, WN[0]); box(g, -1, -26, 2, 18, INK);
  // (the dial)
  ball(g, 0, 10, 14, '#E8DCC0');
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, Math.round(Math.cos(a) * 11) - 1, 10 + Math.round(Math.sin(a) * 11) - 1, 2, 2, '#3A2A18'); }
  box(g, -1, 3, 2, 8, INK); box(g, -1, 9, 7, 2, INK);
  // (the weights: pine cones on chains)
  for (const [x, len] of [[-14, 40], [11, 26]]) {
    for (let y = 30; y < 30 + len; y += 4) box(g, x + 1, y, 2, 3, '#7A7A84');
    const wy = 30 + len;
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + 2, wy + 9, 6, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8A6420'; g.beginPath(); g.ellipse(x + 2, wy + 9, 5, 9, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 4; k++) box(g, x - 1 + (k % 2) * 3, wy + 3 + k * 4, 3, 2, '#C89A3A');
  }
};
const drawCuckooClock = (c: Ctx, x: number, y: number, f: number) => {
  c.save(); c.translate(x, y);
  stamp(c, 'tw-cuckoo', -40, -72, 80, 160, paintCuckoo);
  // (its pendulum, swinging under it)
  const a = Math.sin(f * 0.07 + x) * 0.25;
  c.rotate(a); box(c, -1, 30, 2, 30, '#5A4A2A'); ball(c, 0, 62, 5, '#C89A3A'); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Under the tower: the ride's "hell" (plywood and cardboard), the hole the car made, the chute down to the real one

/** A cardboard flame (its foot at the origin): an ink edge, three tones, its cardboard showing at the side, a stand. */
const flame = (c: Ctx, x: number, y: number, hgt: number, wob: number) => {
  const shape = (s: number) => { c.beginPath(); c.moveTo(x - 12 * s, y); c.quadraticCurveTo(x - 14 * s, y - hgt * 0.5, x - 2 + wob, y - hgt * s); c.quadraticCurveTo(x + 4, y - hgt * 0.55 * s, x + 6 * s, y - hgt * 0.7 * s); c.quadraticCurveTo(x + 14 * s, y - hgt * 0.4, x + 12 * s, y); c.closePath(); };
  c.fillStyle = INK; shape(1.12); c.fill();
  c.fillStyle = '#B8481A'; shape(1.04); c.fill();
  c.fillStyle = '#E8601A'; shape(0.8); c.fill();
  c.fillStyle = '#F8C030'; shape(0.45); c.fill();
  box(c, x + 10, y - hgt * 0.3, 2, hgt * 0.3, '#A08060');
  box(c, x - 3, y - 4, 6, 4, '#5A3A1A');
};

const drawUnder = (c: Ctx, f: number, look: TowerLook, v: View) => {
  // the rock all round
  const rx0 = Math.max(TX0 - WALL - 300, v.x0), rx1 = Math.min(TX1 + WALL + 300, v.x1), ry0 = Math.max(GY + 24, v.y0), ry1 = Math.min(HELL_AT + 400, v.y1);
  if (rx1 > rx0 && ry1 > ry0) { c.fillStyle = rockFill(c); c.fillRect(rx0, ry0, rx1 - rx0, ry1 - ry0); }
  // B1: the room (a theater flat painted as hell across its back, plywood seams showing)
  if (v.y0 < B1 + 30 && v.y1 > GY) {
    bandedGradient(c, CH0, GY + 30, CH1 - CH0, B1 - GY - 30, ['#1A0404', '#3A0A08', '#6A1A0A', '#8A2A0C'], 6);
    // (the painted flames on the flat: flat, cheap)
    for (let x = CH0 + 20; x < CH1 - 20; x += 54) {
      const h = 80 + ((x * 7) % 50);
      c.fillStyle = '#A8300C'; c.beginPath(); c.moveTo(x - 24, B1); c.quadraticCurveTo(x - 10, B1 - h * 0.6, x, B1 - h); c.quadraticCurveTo(x + 10, B1 - h * 0.6, x + 24, B1); c.fill();
      c.fillStyle = '#C85A14'; c.beginPath(); c.moveTo(x - 12, B1); c.quadraticCurveTo(x - 4, B1 - h * 0.4, x, B1 - h * 0.6); c.quadraticCurveTo(x + 4, B1 - h * 0.4, x + 12, B1); c.fill();
    }
    for (let x = CH0 + 96; x < CH1; x += 96) box(c, x, GY + 30, 1, B1 - GY - 30, '#2A0806');
    // (its ceiling: black, the red par cans hung from it)
    box(c, CH0, GY + 24, CH1 - CH0, 18, '#0E0606'); box(c, CH0, GY + 42, CH1 - CH0, 2, INK);
    for (let x = CH0 + 70; x < CH1 - 40; x += 140) {
      steppedGlow(c, x, GY + 60, 36, '#DC2626', 0.14, 0.0, 3);
      slab(c, x - 8, GY + 42, 16, 16, '#2A2A30', { edge: 2 }); box(c, x - 6, GY + 56, 12, 3, '#F87171');
    }
    // (the cardboard flames along the floor, waving on their sticks)
    for (let x = CH0 + 10; x < CH1 - 20; x += 46) flame(c, x + 11, B1, 46 + ((x * 3) % 20) + Math.sin(f * 0.1 + x) * 3, Math.sin(f * 0.13 + x) * 2);
    // (the plywood devil, waving on a stick: a cutout, painted)
    {
      const dx = CH0 + 60, dy = B1 - 150, wv = Math.sin(f * 0.08) * 0.15;
      c.save(); c.translate(dx, dy + 80); c.rotate(wv);
      pole(c, -3, 0, 6, 70, '#7A4A1A');
      const DV = rampOf('#B91C1C');
      c.fillStyle = INK; c.beginPath(); c.moveTo(-22, -82); c.lineTo(-30, -104); c.lineTo(-12, -82); c.lineTo(12, -82); c.lineTo(30, -104); c.lineTo(22, -82); c.lineTo(22, 1); c.lineTo(-22, 1); c.closePath(); c.fill();
      c.fillStyle = DV[2]; c.beginPath(); c.moveTo(-20, -80); c.lineTo(-27, -100); c.lineTo(-12, -80); c.lineTo(12, -80); c.lineTo(27, -100); c.lineTo(20, -80); c.lineTo(20, 0); c.lineTo(-20, 0); c.closePath(); c.fill();
      box(c, -20, -80, 4, 80, DV[3]); box(c, 16, -80, 4, 80, DV[1]);
      box(c, -14, -68, 8, 6, '#FDE047'); box(c, 6, -68, 8, 6, '#FDE047'); box(c, -12, -66, 3, 3, INK); box(c, 9, -66, 3, 3, INK);
      box(c, -12, -54, 24, 4, INK); for (let k = 0; k < 4; k++) box(c, -10 + k * 6, -54, 3, 3, '#F8F8F0');
      box(c, -4, -46, 8, 10, DV[1]);
      // (his painted pitchfork)
      box(c, 22, -90, 3, 90, '#5A3A1A'); box(c, 16, -96, 15, 3, '#9A9AA4'); box(c, 16, -104, 3, 10, '#9A9AA4'); box(c, 22, -104, 3, 10, '#9A9AA4'); box(c, 28, -104, 3, 10, '#9A9AA4');
      c.restore();
    }
    // (the gift shop's door, in its far wall: lit, the plush on its shelves)
    {
      const l = CH0 + 4;
      slab(c, l - 4, B1 - 120, 54, 120, '#3A2A1A', { edge: 2 });
      bandedGradient(c, l + 4, B1 - 112, 38, 112, ['#7A5A2A', '#5A4020'], 4);
      for (const y of [B1 - 86, B1 - 54]) { box(c, l + 4, y, 38, 3, '#2A1A0A'); for (let k = 0; k < 4; k++) ball(c, l + 9 + k * 9, y - 5, 4, ['#DC2626', '#F8F8F0', '#7C3AED', '#16A34A'][k], false); }
    }
    plaque(c, CH1 - 90, GY + 110, 'FAKE HELL', '#7F1D1D', '#FDE68A', 10);
    plaque(c, CH0 + 160, GY + 70, '< GIFT SHOP', '#14532D', '#BBF7D0');
    // its floor (a lit lip): whole, or broken through in the middle
    const floor = (a: number, b: number) => {
      box(c, a, B1, b - a, 30, '#3A0C0C'); checker(c, a, B1 + 6, b - a, 2, '#4A1212');
      box(c, a, B1 + 26, b - a, 4, '#200606');
      box(c, a, B1, b - a, 2, '#FCA5A5'); box(c, a, B1 + 2, b - a, 2, '#DC4A4A');
    };
    if (look.b1) floor(CH0, CH1);
    else {
      floor(CH0, SH0); floor(SH1, CH1);
      // (the broken edges: splinters down into the hole)
      for (const [x, s] of [[SH0, 1], [SH1, -1]] as [number, number][]) for (let i = 0; i < 4; i++) {
        const l = 10 + ((i * 5) % 9);
        c.fillStyle = INK; c.beginPath(); c.moveTo(x, B1 + i * 7); c.lineTo(x + s * l, B1 + i * 7 + 3 + l * 0.4); c.lineTo(x, B1 + i * 7 + 6); c.fill();
        c.fillStyle = '#6A2A1A'; c.beginPath(); c.moveTo(x, B1 + i * 7 + 1); c.lineTo(x + s * (l - 2), B1 + i * 7 + 3 + l * 0.4); c.lineTo(x, B1 + i * 7 + 5); c.fill();
      }
      // (a torn brass panel off the car, on what's left of the floor)
      c.save(); c.translate(SH1 + 42, B1 - 6); c.rotate(-0.12); slab(c, -22, -8, 44, 14, BRASS, { edge: 2 }); box(c, -14, -4, 3, 3, INK); c.restore();
    }
  }
  // the chute (the hole the car made): rock, the glow coming up out of it (dim), its shelves
  if (!look.b1 && v.y1 > B1) {
    bandedGradient(c, CH0, B1 + 30, CH1 - CH0, HELL_AT - B1 + 200, ['#0E0404', '#1E0606', '#320A06', '#4A1206', '#6A2008'], 12);
    // (the walls of it: ragged rock, lit along the top)
    for (let y = B1 + 60; y < HELL_AT + 200; y += 70) {
      const lw = 14 + ((y * 3) % 22), rw = 14 + ((y * 5) % 20);
      for (const [x, w] of [[CH0, lw], [CH1 - rw, rw]]) { box(c, x - 1, y - 1, w + 2, 52, INK); box(c, x, y, w, 50, ROCK[2]); box(c, x, y, w, 3, ROCK[4]); box(c, x, y + 40, w, 10, ROCK[1]); }
    }
    for (const [x, y, w] of CHUTE_LEDGES) {
      if (y < v.y0 - 40 || y > v.y1 + 40) continue;
      box(c, x - 2, y - 1, w + 4, 22, INK);
      box(c, x, y, w, 20, ROCK[3]); checker(c, x, y + 8, w, 2, ROCK[2]); box(c, x, y + 14, w, 6, ROCK[1]);
      c.fillStyle = ROCK[2]; c.beginPath(); c.moveTo(x + 4, y + 20); c.lineTo(x + w * 0.5, y + 36); c.lineTo(x + w - 4, y + 20); c.fill();
      // (the lip: lit from below, hot)
      box(c, x, y, w, 2, '#FDBA74'); box(c, x, y + 2, w, 2, '#EA7A2C');
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lot, back to front

export const drawTowerBack = (c: Ctx, state: GameState, look: TowerLook) => {
  const v = viewOf(state), f = state.frame, eye = eyeOf(state);
  if (v.x0 < TX0 + 40 && v.y1 > BAY_TOP - 400 && v.y0 < GY + 100) drawBay(c, state, look, eye, v);
  if (v.x1 < TX0 - WALL) return;
  // The outside of the tower, round it (what shows past the walls, swaying)
  {
    const ya = Math.max(ROOF - 400, v.y0), yb = Math.min(GY + 30, v.y1);
    if (yb > ya) { c.fillStyle = stoneFill(c); c.fillRect(TX0 - WALL, ya, W + 400 + WALL, yb - ya); box(c, TX0 - WALL, ya, W + 400 + WALL, yb - ya, 'rgba(6, 4, 10, 0.55)'); }
  }
  // under the ground floor
  if (v.y1 > GY) drawUnder(c, f, look, v);
  // The back wall (standing back), the side walls' insides and the roof's underside going back to it
  drawBackWall(c, eye, v, f, look.crashed);
  drawRoomSides(c, eye, v);
  // the floors' tops (or undersides) going back, the ledges'
  for (let k = 0; k <= STORIES; k++) {
    const y = F(k);
    if (y < v.y0 - 80 || y > v.y1 + 80) continue;
    const pieces = k === 0 ? [[-WALL, 420, 0, 0], [740, W + WALL, 0, 0]] as Piece[] : (look.crashed ? WRECK : WHOLE)[k];
    for (const p of pieces) pieceDepth(c, eye, k, p);
  }
  const ledges = LEDGES.filter(l => !(look.crashed && l === SHELF));
  for (const [x, y, w] of ledges) if (y > v.y0 && y < v.y1 && eye.y < y) quad(c, PLANK[2], [x, y], [x + w, y], at(eye, x + w, y, 0.965), at(eye, x, y, 0.965));
  // the clock room: the bell up over its gallery, the winch the car's cable came off
  if (v.y0 < TOP) {
    const bx = GALLERY[0] + 120, by = GALLERY[1] - 140;
    stamp(c, 'tw-bell', bx - 60, ROOF - 2, 120, by - ROOF + 110, g => paintBell(g, bx, by));
    drawWinch(c, look.crashed);
  }
  // The shafts, up the middle
  drawShaft(c, v, look.crashed);
  // the cars in the shafts (behind everything of the tower's own)
  for (const car of look.ride.cars) {
    if (car.phase === 'under' || car.phase === 'lift' || ((car.phase === 'board' || car.phase === 'roll') && car.x < TX0 + 100)) continue;
    c.save(); c.beginPath();
    // (unloading, and off along its track: in the ride's hell, into the tunnel in its far wall)
    if (car.phase === 'unload' || car.phase === 'return') c.rect(CH0, GY + 30, CH1 - CH0, B1 - GY + 10);
    else c.rect(TX0, ROOF - 50, W + 200, HELL_AT - ROOF + 1000);
    c.clip();
    drawCar(c, car, f);
    if (car.phase === 'unload') { c.beginPath(); c.rect(CH0 + 26, GY + 30, CH1 - CH0, B1 - GY + 10); c.clip(); drawWalkers(c, car, f); }
    c.restore();
  }
  // the cuckoo clocks (their birds are the enemies), the gears
  for (const [x, y] of CUCKOOS) if (y > v.y0 && y < v.y1) drawCuckooClock(c, x, y, f);
  for (const g of gearsNow(look.crashed)) {
    if (g.y < v.y0 || g.y > v.y1) continue;
    const a = gearAt(g, f);
    // (its axle in the wall, a mounting plate)
    if (!g.roll) { slab(c, g.x - 8, g.y - 8, 16, 16, '#2A2A30', { edge: 2 }); }
    drawGear(c, a.x, a.y, g.r, a.a);
  }
  // The floors: their fronts (a lit lip), the nets across the shaft (before), shreds of them (after); the ledges
  for (let k = 1; k <= STORIES; k++) {
    const y = F(k);
    if (y < v.y0 - 80 || y > v.y1 + 80) continue;
    for (const p of (look.crashed ? WRECK : WHOLE)[k]) drawPiece(c, k, p, p[3] !== p[2]);
    if (look.nets[k]) drawNet(c, y);
    if (!look.crashed && k === TORN_NET) {
      // (floor 4's: the UP half's there, the DOWN half's torn out: jump it)
      drawNet(c, y, SH0, SHX);
      c.strokeStyle = '#8A7A5A'; c.lineWidth = 1;
      for (const xx of [SHX + 2, SH1 - 26]) for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(xx + i * 5, y + 2); c.lineTo(xx + i * 4 + 2, y + 30 + (i % 3) * 12); c.stroke(); }
      slab(c, SH1 - 2, y - 4, 8, 10, IRON, { edge: 2 });
    }
    if (look.crashed && !look.nets[k]) {
      drawNetShreds(c, y);
      drawRubble(c, SH0 - 40, y, 4); drawRubble(c, SH1 + 40, y, 3);
    }
    if (look.crashed && JAMS.includes(k)) drawJam(c, k);
    // (floor 4, caved in: the broken planks hanging off the edge)
    if (look.crashed && k === 4) for (let i = 0; i < 5; i++) { c.save(); c.translate(U(330), y + 6); c.rotate(1.1 + i * 0.12); box(c, 0, -4, 48 + i * 9, 8, INK); box(c, 1, -3, 46 + i * 9, 6, PLANK[2]); box(c, 1, -3, 46 + i * 9, 2, PLANK[3]); box(c, 44 + i * 9, -3, 2, 6, PLANK[0]); c.restore(); }
    if (look.crashed && k <= 5) drawShaftLamps(c, k, look.lamp, f);
  }
  if (v.y1 > GY - 40 && v.y0 < GY + 60) {
    drawPiece(c, 0, [-WALL, 420, 0, 0], false); drawPiece(c, 0, [740, W + WALL, 0, 0], false);
    if (look.grate) {
      // (the grate over the shaft's foot: a steel frame, bars, the ride's red light coming up through it)
      box(c, SH0, GY, SH1 - SH0, 22, INK);
      for (let x = SH0 + 4; x < SH1 - 4; x += 14) { box(c, x, GY + 4, 8, 16, (x / 14) % 2 < 1 ? '#7F1D1D' : '#A8261C'); box(c, x, GY + 4, 8, 2, '#E04A3A'); }
      box(c, SH0, GY, SH1 - SH0, 4, '#5A5A64'); box(c, SH0, GY, SH1 - SH0, 2, '#D8D8E0');
      for (let x = SH0; x < SH1; x += 40) box(c, x, GY, 3, 22, '#3A3A44');
    } else {
      // (torn out: the edges bent down into the hole)
      for (const [x, s] of [[SH0 - 2, 1], [SH1 - 8, -1]] as [number, number][]) {
        c.save(); c.translate(x + 5, GY); c.rotate(s * 0.25); box(c, -5, 0, 10, 46, INK); box(c, -4, 0, 8, 44, '#4A4A54'); box(c, -4, 0, 2, 44, '#8A8A96'); c.restore();
      }
    }
    if (look.crashed) drawShaftLamps(c, 0, look.lamp, f);
  }
  // the ledges: plank catwalks on iron brackets, a lit lip
  for (const [x, y, w] of ledges) {
    if (y < v.y0 || y > v.y1) continue;
    for (const bx of [x + 8, x + w - 14]) { box(c, bx, y + 14, 6, 22, INK); box(c, bx + 1, y + 14, 4, 20, IRON); c.fillStyle = INK; c.beginPath(); c.moveTo(bx + 6, y + 14); c.lineTo(bx + 18 * (bx < x + w / 2 ? 1 : -1) + 3, y + 14); c.lineTo(bx + 3, y + 30); c.fill(); }
    box(c, x - 1, y - 1, w + 2, 16, INK);
    box(c, x, y, w, 14, PLANK[2]); checker(c, x, y + 6, w, 2, PLANK[1]); box(c, x, y + 10, w, 4, PLANK[1]);
    for (let bx = x + 26; bx < x + w - 4; bx += 34) box(c, bx, y + 4, 1, 9, PLANK[0]);
    box(c, x, y, w, 2, LIP_HI); box(c, x, y + 2, w, 2, LIP);
  }
  // floor 3's counterweight: a ton of iron on its chain, a lit lip on its top (ride it)
  if (F(LIFT.k) + 40 > v.y0 && LIFT.top - 400 < v.y1) {
    const ly = liftY(f), cx = LIFT.x + LIFT.w / 2;
    for (let y = F(LIFT.k + 1) + SLAB; y < ly; y += 8) { box(c, cx - 3, y, 6, 6, INK); box(c, cx - 2 + ((y / 8) % 2), y + 1, 4 - ((y / 8) % 2) * 2, 4, '#7A7A84'); }
    slab(c, LIFT.x, ly, LIFT.w, 44, '#3A3A42', { edge: 4 });
    box(c, LIFT.x + 8, ly + 10, LIFT.w - 16, 26, '#26262C');
    for (let x = LIFT.x + 6; x < LIFT.x + LIFT.w - 4; x += 14) { box(c, x, ly + 6, 2, 2, '#8A8A96'); box(c, x, ly + 38, 2, 2, '#8A8A96'); }
    text(c, '1 TON', cx, ly + 28, '#B8B8C4', 8, 'center', INK);
    box(c, LIFT.x, ly, LIFT.w, 2, LIP_HI); box(c, LIFT.x, ly + 2, LIFT.w, 2, LIP);
  }
  // floor 5's rotten boards (cracking: shaking; gone: a hole, broken ends)
  if (!look.crashed && F(ROTTEN.k) > v.y0 && F(ROTTEN.k) < v.y1) ROTTEN.boards.forEach(([a, b], i) => {
    const st = look.rot[i], y = F(ROTTEN.k);
    if (st < 0) { box(c, U(a), y, 6, 18, '#3A2410'); box(c, U(a), y, 6, 2, '#6A4A20'); box(c, U(b) - 6, y, 6, 14, '#3A2410'); return; }
    const sh = st > 0 ? Math.sin(st * 1.7) * 2 : 0, l = U(a) + 1 + sh, w = b - a - 2;
    box(c, l, y, w, SLAB - 2, INK);
    box(c, l + 1, y + 1, w - 2, SLAB - 5, '#5A4426'); checker(c, l + 1, y + 8, w - 2, 2, '#4A3A20');
    // (the rot: grey-green patches, holes)
    box(c, l + 8, y + 8, 10, 6, '#4A5236'); box(c, l + w - 20, y + 12, 8, 4, '#3E4430'); box(c, l + 26, y + 14, 4, 3, INK);
    box(c, l + 1, y + 1, w - 2, 2, '#B89A50'); box(c, l + 1, y + 3, w - 2, 1, '#8A6A30');
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(l + 11, y + 6); c.lineTo(l + 29, y + 12); c.lineTo(l + 21, y + 18); c.stroke();
    if (st > 0) for (let j = 0; j < 3; j++) box(c, l + 7 + j * 18, y + 8, 6, 3, INK);
  });
  // the beams
  BEAMS.forEach((b, i) => { if (F(b.k) > v.y0 && beamTop(b) < v.y1) drawBeam(c, i, look.beamHp[i]); });
  // the pendulums
  for (const p of PENDULUMS) if (p.y < v.y1 + 300 && p.y + p.len + 40 > v.y0) drawPendulum(c, p, f, look.crashed);
  // The walls (the left one with the maintenance door at its foot, in from the bay), the roof
  {
    const wy0 = Math.max(ROOF - 200, v.y0), lb = Math.min(GY - DOOR_H, v.y1), rb = Math.min(GY, v.y1);
    const wall = (x: number, y0: number, y1: number, litSide: number) => {
      if (y1 <= y0) return;
      c.fillStyle = stoneFill(c); c.fillRect(x, y0, WALL, y1 - y0);
      box(c, x, y0, WALL, y1 - y0, 'rgba(30, 24, 40, 0.25)');
      box(c, litSide, y0, 4, y1 - y0, STONE[4]); box(c, x, y0, 1, y1 - y0, INK); box(c, x + WALL - 1, y0, 1, y1 - y0, INK);
    };
    wall(TX0 - WALL, wy0, lb, TX0 - 4);
    wall(TX1, wy0, rb, TX1);
    // (the lintel over the maintenance door, the door's frame)
    if (v.y1 > GY - DOOR_H - 20 && v.y0 < GY) {
      slab(c, TX0 - WALL - 10, GY - DOOR_H - 14, WALL + 20, 14, '#4A4458', { edge: 2 });
      slab(c, TX0 - WALL, GY - DOOR_H, 6, DOOR_H, OAK, { edge: 2 }); slab(c, TX0 - 6, GY - DOOR_H, 6, DOOR_H, OAK, { edge: 2 });
    }
    if (v.y0 < ROOF + 40) {
      slab(c, TX0 - WALL, ROOF - 40, W + WALL * 2, 40, '#3A3242', { edge: 4 });
      for (let x = TX0 - WALL + 20; x < TX1 + WALL; x += 60) box(c, x, ROOF - 30, 4, 4, '#6A6070');
    }
  }
  if (v.x0 < TX0 + 200 && v.y1 > GY - 300 && v.y0 < GY) plaque(c, TX0 - 40, GY - DOOR_H - 40, 'CLOCK TOWER: STAFF ONLY', '#1C1917', '#FDE68A');
};
