// The control room, painted: Donnie's booth. A cinderblock box painted the color of a dentist's waiting room, a drop
// ceiling with a stain in it and one bare bulb on a cord, the wall of CRTs (the park's cameras), the console he does
// the voice from (a gooseneck mic, a sandwich, a soda the size of a bucket, the mug the fangs live in, the foam head
// the wig lives on), his chair (taped), the bin, the mini fridge, the pizza boxes; the coat rack and the cape; the
// staff door out into the shop. Light fake 3D (paint.ts): the back wall a step back, the floor's tiles going back to
// it, the wall between the room and the shop a solid block with its near side showing.
//
// Still things are stamped once; the monitors, the console's lights, the bulb, the hole's glow are live over them.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { timeOfDay, hourMix, skyAt } from '../../timeOfDay';
import { drawLooseWig, drawLooseFangs } from '../../cast/donnie';
import { type Passage, passageBack, passageSide, passageFront, passageLintel } from './passage';
import { rockWall } from './shopArt';
import { x0, HOLE_X, DESK_X, RACK_X, ROOM_DOOR, SHOP_X, PART_L, PART_R } from './geo';
import {
  INK, box, slab, pole, ball, rampOf, dark, lite, mix, checker, hazeBands, stamp, hash,
  WALL_D, CEIL, eyeOf, inDepth, at, quad, seg, shade, inked, wallRun, ceiling, tileFloor, frontFloor, plaque,
  type Eye,
} from './paint';
import { signAt, enamel, print } from '../letters';

type Ctx = CanvasRenderingContext2D;

/** The room's paint: institutional mint-gray up top, a darker band below the chair rail. */
const PAINT = '#5A6656', LOWER = '#3B4A44', BLOCK_H = 16, BLOCK_W = 32;
/** The room's left end (well off screen) and where its back wall meets the shop's. */
const ROOM_L = x0 - 260;

// ---------------------------------------------------------------------------------------------------------------
// The back wall (a tile of it: 256 wide)

/** Cinderblock, painted: courses, staggered joints, each block's top lit a hair; grime up under the ceiling. */
export const paintBlock = (g: Ctx, x: number, w: number, top: number, bottom: number, col: string, seed: number) => {
  const r = rampOf(col);
  box(g, x, top, w, bottom - top, col);
  for (let y = bottom - BLOCK_H; y >= top - BLOCK_H; y -= BLOCK_H) {
    const row = Math.round((bottom - y) / BLOCK_H);
    box(g, x, y, w, 1, r[1]);
    box(g, x, y + 1, w, 1, mix(col, r[3], 0.5));
    for (let bx = (row % 2) * (BLOCK_W / 2); bx < w; bx += BLOCK_W) {
      box(g, x + bx, y, 1, BLOCK_H, r[1]);
      // (the odd block a shade off: patched, stained)
      const h = hash(seed * 13.7 + row * 7.1 + bx * 0.37);
      if (h < 0.06) box(g, x + bx + 1, y + 2, BLOCK_W - 1, BLOCK_H - 2, mix(col, INK, 0.12));
      else if (h > 0.95) checker(g, x + bx + 1, y + 2, BLOCK_W - 1, BLOCK_H - 2, mix(col, '#8A8060', 0.2));
    }
  }
};

const paintWallTile = (g: Ctx, x: number, v: number) => {
  const top = CEIL - 260, W = 256;
  // (the upper paint, the chair rail, the darker band, the rubber base)
  paintBlock(g, x, W, top, GY - 120, PAINT, v + 1);
  paintBlock(g, x, W, GY - 120, GY - 12, LOWER, v + 5);
  checker(g, x, GY - 122, W, 2, LOWER);
  slab(g, x - 2, GY - 126, W + 4, 6, '#6B5A44', { ink: false, edge: 2 });
  box(g, x, GY - 120, W, 1, INK);
  box(g, x, GY - 12, W, 12, '#221E1B'); box(g, x, GY - 12, W, 1, '#4A433D'); box(g, x, GY - 11, W, 1, '#332D29');
  // (grime: up under the ceiling, and a dark band where hands and chairs go)
  hazeBands(g, x, CEIL, W, 170, '#0C0A10', 0.6, 0.0, 6);
  // (the conduit along it, strapped)
  box(g, x, CEIL + 40, W, 2, '#8A8F94'); box(g, x, CEIL + 42, W, 2, '#5C6166'); box(g, x, CEIL + 44, W, 1, '#2E3236');
  for (let k = 0; k < 2; k++) { box(g, x + 40 + k * 128, CEIL + 38, 4, 9, '#4A4E52'); box(g, x + 40 + k * 128, CEIL + 38, 1, 9, '#8A8F94'); }
  if (v === 1) {
    // (an outlet, a power strip off it, a strip off that: the cords down to the floor)
    shade(g, x + 120, GY - 64, 14, 20, '#D8D2C0');
    box(g, x + 124, GY - 59, 2, 3, '#3A3530'); box(g, x + 128, GY - 59, 2, 3, '#3A3530'); box(g, x + 124, GY - 52, 2, 3, '#3A3530'); box(g, x + 128, GY - 52, 2, 3, '#3A3530');
    g.strokeStyle = '#1E1E22'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 127, GY - 50); g.quadraticCurveTo(x + 134, GY - 20, x + 150, GY - 10); g.stroke();
    shade(g, x + 146, GY - 16, 46, 8, '#E5E1D6');
    for (let i = 0; i < 5; i++) box(g, x + 150 + i * 8, GY - 13, 3, 2, '#3A3530');
    box(g, x + 188, GY - 15, 3, 3, '#EF4444');
    g.beginPath(); g.moveTo(x + 156, GY - 14); g.quadraticCurveTo(x + 160, GY - 40, x + 176, GY - 30); g.moveTo(x + 168, GY - 14); g.lineTo(x + 200, GY - 6); g.stroke();
  } else if (v === 2) {
    // (the leak: a brown stain run down from the ceiling, in steps)
    for (let k = 0; k < 5; k++) { const w = 22 - k * 4; box(g, x + 70 - w / 2 + k, CEIL + 50 + k * 12, w, 12, mix(PAINT, '#6B4F2A', 0.38 - k * 0.06)); }
    checker(g, x + 64, CEIL + 110, 14, 8, mix(PAINT, '#6B4F2A', 0.2));
    box(g, x + 70, CEIL + 50, 1, 90, mix(PAINT, '#4A361C', 0.4));
  } else if (v === 3) {
    // (a fire extinguisher on its hook, its sign over it)
    shade(g, x + 180, GY - 230, 30, 14, '#B91C1C');
    signAt(g, 'FIRE', x + 195, GY - 220, 6, enamel(6, '#FEE2E2'));
    pole(g, x + 186, GY - 196, 14, 40, '#C42A22');
    box(g, x + 188, GY - 202, 10, 6, '#27272A'); box(g, x + 196, GY - 204, 10, 3, '#27272A');
    box(g, x + 186, GY - 180, 14, 6, '#E8E1D0');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// On the back wall: the monitor rack, the boards and posters; the fridge, the pizza boxes (all at WALL_D, wall units)

/** The wall of monitors: where the rack runs (wall units), and each screen's top left. */
const BANK_L = x0 + 284, BANK_R = x0 + 664, BANK_TOP = GY - 418;
const screenAt = (i: number): [number, number] => [BANK_L + 22 + (i % 3) * 122, BANK_TOP + 20 + Math.floor(i / 3) * 104];
const SCR_W = 92, SCR_H = 62;

const paintBank = (g: Ctx) => {
  // (the steel rack: uprights, shelves; the casings on it)
  slab(g, BANK_L, BANK_TOP, BANK_R - BANK_L, 222, '#2F343B', { edge: 4 });
  for (let row = 0; row < 2; row++) {
    const sy = BANK_TOP + 104 + row * 104;
    slab(g, BANK_L - 6, sy, BANK_R - BANK_L + 12, 10, '#5B636D', { edge: 2 });
  }
  for (let i = 0; i < 6; i++) {
    const [sx, sy] = screenAt(i);
    // (the casing: beige plastic gone yellow, a bevel round the glass, the brand strip, two knobs, a vent)
    slab(g, sx - 12, sy - 10, SCR_W + 24, SCR_H + 30, '#B8AE92', { edge: 4 });
    box(g, sx - 4, sy - 4, SCR_W + 8, SCR_H + 8, '#3A362C'); box(g, sx - 3, sy - 3, SCR_W + 6, 1, '#7A715C'); box(g, sx - 3, sy - 3, 1, SCR_H + 6, '#7A715C');
    box(g, sx, sy + SCR_H + 8, 30, 3, '#8C836A');
    ball(g, sx + SCR_W - 18, sy + SCR_H + 10, 3, '#3A3A3E'); ball(g, sx + SCR_W - 6, sy + SCR_H + 10, 3, '#3A3A3E');
    signAt(g, `CAM ${i + 1}`, sx + 2, sy + SCR_H + 13, 6, print(6, '#3A362C'), 'left');
  }
  // (cables down out of the back of the rack, bundled, to the floor behind the desk)
  g.strokeStyle = '#141416'; g.lineWidth = 3;
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(BANK_L + 80 + k * 70, BANK_TOP + 222); g.quadraticCurveTo(BANK_L + 90 + k * 70, GY - 60, BANK_L + 120 + k * 50, GY - 4); g.stroke(); }
  // (a sticky note on one casing: the wifi password; a strip of tape holding a cracked bezel)
  box(g, BANK_L + 30, BANK_TOP + 76, 14, 12, '#FDE68A'); box(g, BANK_L + 32, BANK_TOP + 80, 10, 1, '#A16207'); box(g, BANK_L + 32, BANK_TOP + 83, 7, 1, '#A16207');
  box(g, BANK_L + 252, BANK_TOP + 120, 18, 5, '#C8BFA6');
};

/** The camera feeds: crude little scenes (the town, the castle, the clock tower, hell, the ballroom, the gift shop). */
const feed = (c: Ctx, i: number, f: number, dead: boolean) => {
  const [mx, my] = screenAt(i);
  if (dead) {
    box(c, mx, my, SCR_W, SCR_H, '#2A2A2E');
    for (let k = 0; k < 46; k++) box(c, mx + ((k * 37 + f * 13) % (SCR_W - 2)), my + ((k * 23 + f * 7) % (SCR_H - 2)), 2, 2, k % 3 ? '#9CA3AF' : '#52525B');
  } else {
    // (the outdoor feeds (the town, the castle, the tower) under the hour's sky; the indoor ones their own light)
    const tod = timeOfDay(), out = i <= 2, lit = !out || tod.lamps > 0.3;
    const outSky = (top: boolean) => mix(skyAt(top ? 0.2 : 0.75, tod), '#20283A', 0.3);
    const sky = out ? [outSky(true), outSky(false)] : [['#450A0A', '#7F1D1D'], ['#2E1065', '#4C1D95'], ['#3B0A0A', '#5B1414']][i - 3];
    box(c, mx, my, SCR_W, SCR_H, sky[1]); box(c, mx, my, SCR_W, 20, sky[0]); checker(c, mx, my + 20, SCR_W, 2, sky[0]);
    if (out && tod.stars > 0.3) for (let k = 0; k < 5; k++) box(c, mx + 6 + k * 19, my + 4 + (k % 3) * 5, 1, 1, '#C8CCE0');
    /** A building's stone or wood on an outdoor feed: lighter by day. */
    const day = (col: string) => (out ? hourMix(lite(col, 0.3), lite(col, 0.1), col, tod) : col);
    const win = lit ? '#FDE68A' : day('#3A3440');
    if (i === 0) {
      // (the town square: gabled fronts, their windows lit)
      box(c, mx, my + 52, SCR_W, 10, day('#292524'));
      for (let k = 0; k < 4; k++) {
        const hx = mx + 4 + k * 22;
        box(c, hx, my + 32, 18, 20, day(k % 2 ? '#57534E' : '#4A4440')); box(c, hx, my + 32, 1, 20, day('#78716C'));
        c.fillStyle = day('#1C1917'); c.beginPath(); c.moveTo(hx - 2, my + 33); c.lineTo(hx + 9, my + 22); c.lineTo(hx + 20, my + 33); c.closePath(); c.fill();
        box(c, hx + 6, my + 38, 5, 6, lit ? ((k + Math.floor(f / 50)) % 3 ? '#FDE68A' : '#A16207') : win);
      }
    } else if (i === 1) {
      // (the castle's front: battlements, the door)
      box(c, mx + 18, my + 22, 56, 40, day('#44403C')); box(c, mx + 18, my + 22, 56, 2, day('#57534E'));
      for (let k = 0; k < 4; k++) box(c, mx + 18 + k * 16, my + 16, 9, 7, day('#44403C'));
      box(c, mx + 40, my + 42, 12, 20, '#0C0A09'); box(c, mx + 24, my + 30, 5, 7, win); box(c, mx + 63, my + 30, 5, 7, win);
    } else if (i === 2) {
      // (the clock tower, its face lit)
      box(c, mx + 36, my + 6, 20, 56, day('#292524')); box(c, mx + 36, my + 6, 2, 56, day('#3F3A36'));
      ball(c, mx + 46, my + 18, 6, lit ? '#FDE68A' : '#E8DCC0', false); box(c, mx + 45, my + 13, 2, 6, INK); box(c, mx + 45, my + 18, 4, 1, INK);
    } else if (i === 3) {
      // (the elevator shaft's camera: the fire at the bottom, flickering)
      for (let k = 0; k < 6; k++) { const h = 14 + ((k * 7 + Math.floor(f / 6)) % 5) * 4; box(c, mx + 4 + k * 15, my + SCR_H - h, 10, h, k % 2 ? '#F97316' : '#DC2626'); box(c, mx + 6 + k * 15, my + SCR_H - h + 4, 6, h - 4, '#FDE047'); }
    } else if (i === 4) {
      // (the ballroom: the disco ball, the dance floor going round its colors)
      box(c, mx + 45, my, 1, 12, '#A1A1AA'); ball(c, mx + 46, my + 18, 6, '#A1A1AA', false);
      for (let k = 0; k < 6; k++) box(c, mx + 4 + k * 15, my + 50, 12, 12, (k + Math.floor(f / 20)) % 2 ? '#F472B6' : '#60A5FA');
    } else {
      // (the gift shop: the tee racks, a clerk in horns)
      box(c, mx, my + 54, SCR_W, 8, '#7F1D1D');
      for (let k = 0; k < 5; k++) box(c, mx + 8 + k * 17, my + 30, 10, 24, k % 2 ? '#18181B' : '#DC2626');
      box(c, mx + 72, my + 34, 10, 20, '#E8B48A'); box(c, mx + 72, my + 30, 2, 4, '#DC2626'); box(c, mx + 80, my + 30, 2, 4, '#DC2626');
    }
  }
  // (the glass: scanlines, a sheen in its corner, the roll bar going down it; the red REC dot)
  c.fillStyle = 'rgba(0, 0, 0, 0.22)';
  for (let y = my + 1; y < my + SCR_H; y += 2) c.fillRect(mx, y, SCR_W, 1);
  box(c, mx, my + ((f * 2) % SCR_H), SCR_W, 2, 'rgba(255, 255, 255, 0.07)');
  box(c, mx + 3, my + 3, 10, 2, 'rgba(255, 255, 255, 0.18)'); box(c, mx + 3, my + 5, 2, 6, 'rgba(255, 255, 255, 0.18)');
  if (!dead && Math.floor(f / 30) % 2) { box(c, mx + SCR_W - 10, my + 4, 5, 5, '#7F1D1D'); box(c, mx + SCR_W - 9, my + 5, 3, 3, '#EF4444'); }
};

const paintBoards = (g: Ctx) => {
  // (the board: DAYS WITHOUT AN INCIDENT, its number card)
  const bx = x0 + 52, by = GY - 380;
  slab(g, bx, by, 170, 64, '#E8E3D6', { edge: 2 });
  box(g, bx + 4, by + 4, 162, 22, '#166534'); box(g, bx + 4, by + 4, 162, 2, '#22A04A');
  signAt(g, 'DAYS WITHOUT', bx + 85, by + 14, 7, enamel(7, '#F0FDF4', '#0A3A1C'));
  signAt(g, 'AN INCIDENT', bx + 85, by + 24, 7, enamel(7, '#F0FDF4', '#0A3A1C'));
  slab(g, bx + 66, by + 30, 38, 30, '#F8FAFC', { edge: 2 });
  signAt(g, '0', bx + 86, by + 55, 20, enamel(20, '#DC2626', '#7F1D1D'));
  // (the old number, in the bin under it: a stack of cards)
  // (a poster: the kitten hanging off its branch)
  const px = x0 + 70, py = GY - 288;
  slab(g, px, py, 64, 84, '#F1EEE6', { edge: 2 });
  box(g, px + 5, py + 5, 54, 58, '#7DB7E8'); box(g, px + 5, py + 5, 54, 14, '#5E9ED6'); checker(g, px + 5, py + 19, 54, 2, '#5E9ED6');
  box(g, px + 5, py + 18, 54, 3, '#6B4423'); box(g, px + 30, py + 14, 3, 6, '#3F6B2A'); box(g, px + 34, py + 13, 6, 3, '#4D7F33');
  inked(g, () => { g.ellipse(px + 30, py + 38, 9, 13, 0, 0, Math.PI * 2); }, '#E89A3C', 2);
  inked(g, () => { g.ellipse(px + 30, py + 24, 7, 6, 0, 0, Math.PI * 2); }, '#F0A848', 2);
  box(g, px + 24, py + 17, 3, 6, '#E89A3C'); box(g, px + 34, py + 17, 3, 6, '#E89A3C');
  box(g, px + 27, py + 23, 2, 2, INK); box(g, px + 32, py + 23, 2, 2, INK);
  box(g, px + 26, py + 46, 3, 8, '#E89A3C'); box(g, px + 32, py + 46, 3, 8, '#E89A3C');
  box(g, px + 36, py + 30, 5, 2, '#C87A2A');
  signAt(g, 'HANG IN', px + 32, py + 72, 6, print(6, '#1E3A8A'));
  signAt(g, 'THERE', px + 32, py + 80, 6, print(6, '#1E3A8A'));
  // (the calendar: the month crossed off, day by day)
  const kx = x0 + 156, ky = GY - 286;
  slab(g, kx, ky, 54, 70, '#F8FAFC', { edge: 2 });
  box(g, kx + 3, ky + 3, 48, 22, '#B45309'); signAt(g, 'OCT', kx + 27, ky + 18, 8, print({ sx: 2, sy: 2 }, '#FEF3C7', '#78350F'));
  for (let d = 0; d < 28; d++) {
    const cx = kx + 5 + (d % 7) * 7, cy = ky + 30 + Math.floor(d / 7) * 9;
    box(g, cx, cy, 5, 6, '#D6D3D1');
    if (d < 9) { box(g, cx, cy, 5, 1, '#DC2626'); box(g, cx + 2, cy + 2, 1, 2, '#DC2626'); box(g, cx, cy + 5, 5, 1, '#DC2626'); }
  }
  // (the clock: ten past, forever)
  const cx = x0 + 236, cy = GY - 380;
  ball(g, cx, cy, 15, '#3A3530'); ball(g, cx, cy, 12, '#F5F2EA', false);
  box(g, cx - 1, cy - 9, 2, 9, INK); box(g, cx, cy - 1, 7, 2, INK); box(g, cx - 1, cy - 1, 2, 2, '#DC2626');
  // (PARK OPERATIONS over the rack)
  plaque(g, (BANK_L + BANK_R) / 2, BANK_TOP - 30, 'PARK OPERATIONS', '#27272A', '#FDE047');
};

const paintFridge = (g: Ctx) => {
  // (the mini fridge, a microwave on it, a coffee maker on that; pizza boxes stacked beside)
  const fx = x0 - 6;
  slab(g, fx, GY - 76, 58, 76, '#D9D5CB', { edge: 4 });
  box(g, fx + 4, GY - 54, 50, 1, '#8E8A80'); box(g, fx + 48, GY - 48, 4, 18, '#8E8A80');
  box(g, fx + 8, GY - 70, 14, 10, '#FDE047'); box(g, fx + 10, GY - 66, 10, 1, '#A16207');
  box(g, fx + 30, GY - 40, 10, 12, '#60A5FA'); box(g, fx + 30, GY - 40, 10, 3, '#F8FAFC');
  slab(g, fx + 2, GY - 108, 54, 32, '#2A2A2E', { edge: 2 });
  box(g, fx + 6, GY - 104, 34, 24, '#141416'); box(g, fx + 8, GY - 102, 30, 2, '#3A3A40');
  box(g, fx + 44, GY - 102, 8, 4, '#22C55E'); for (let i = 0; i < 6; i++) box(g, fx + 44 + (i % 2) * 5, GY - 95 + Math.floor(i / 2) * 5, 3, 3, '#52525B');
  slab(g, fx + 12, GY - 136, 24, 28, '#1F1F22', { edge: 2 });
  box(g, fx + 15, GY - 124, 18, 14, '#3F2A1C'); box(g, fx + 15, GY - 124, 18, 4, '#6B4A30');
  for (let i = 0; i < 7; i++) {
    const w = 64, y = GY - 9 - i * 9, dx = (hash(i * 3.3) - 0.5) * 8;
    slab(g, fx + 66 + dx, y, w, 9, '#C9A06A', { edge: 2 });
    box(g, fx + 66 + dx + 24, y + 3, 16, 3, '#B91C1C');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// At his plane: the console and what's on it, the chair, the bin, the coat rack

const DESK_L = DESK_X - 70, DESK_W = 200, DESK_TOP = GY - 74;

/** The console's top, going back: you see onto it from up here (live: it moves with the eye). */
const consoleTop = (c: Ctx, eye: Eye) => {
  const a = at(eye, DESK_L, DESK_TOP, 1), b = at(eye, DESK_L + DESK_W, DESK_TOP, 1), cc = at(eye, DESK_L + DESK_W, DESK_TOP, 0.955), d = at(eye, DESK_L, DESK_TOP, 0.955);
  quad(c, INK, [a[0] - 1, a[1]], [b[0] + 1, b[1]], [cc[0] + 1, cc[1] - 2], [d[0] - 1, d[1] - 2]);
  quad(c, '#4B5361', a, b, cc, d);
  // (a ring off a cup, crumbs)
  const r = at(eye, DESK_X - 6, DESK_TOP, 0.975); box(c, r[0], r[1], 8, 1, '#3A414C');
};
const paintConsole = (g: Ctx) => {
  // (the sloped panel, the cabinet under it)
  slab(g, DESK_L, DESK_TOP, DESK_W, 30, '#555E6C', { edge: 2 });
  slab(g, DESK_L + 4, DESK_TOP + 30, DESK_W - 8, 44, '#3A414C', { edge: 4 });
  for (let i = 0; i < 8; i++) {
    const bx = DESK_L + 12 + i * 23;
    box(g, bx + 1, DESK_TOP + 15, 4, 12, '#15181D'); box(g, bx + 1, DESK_TOP + 15, 4, 1, '#000000');
  }
  // (vent slots, a kick plate scuffed bare, a strip of tape: DO NOT TOUCH, in marker)
  for (let i = 0; i < 6; i++) box(g, DESK_L + 20 + i * 8, DESK_TOP + 44, 4, 14, '#262B33');
  box(g, DESK_L + 6, GY - 8, DESK_W - 12, 8, '#22262C'); checker(g, DESK_L + 40, GY - 6, 40, 4, '#5B6470');
  box(g, DESK_L + 96, DESK_TOP + 40, 78, 10, '#D9D4C2'); signAt(g, 'DO NOT TOUCH', DESK_L + 135, DESK_TOP + 48, 6, print(6, '#1E3A8A'));
  // (on top, left to right: the bucket of soda, a chip bag, the mic's base, the papers, the sandwich, the mug, the
  // foam head's stand)
  const T = DESK_TOP - 4;
  slab(g, DESK_X - 66, T - 28, 16, 28, '#DC2626', { edge: 2 });
  box(g, DESK_X - 64, T - 20, 12, 6, '#F8FAFC'); box(g, DESK_X - 68, T - 31, 20, 4, '#F8FAFC'); box(g, DESK_X - 68, T - 31, 20, 1, '#FFFFFF');
  box(g, DESK_X - 56, T - 42, 2, 12, '#F472B6'); box(g, DESK_X - 56, T - 42, 6, 2, '#F472B6');
  inked(g, () => { g.moveTo(DESK_X - 46, T); g.lineTo(DESK_X - 44, T - 16); g.lineTo(DESK_X - 33, T - 18); g.lineTo(DESK_X - 31, T); g.closePath(); }, '#EAB308', 1);
  box(g, DESK_X - 42, T - 12, 8, 4, '#DC2626');
  box(g, DESK_X - 34, T - 1, 2, 1, '#EAB308'); box(g, DESK_X - 28, T, 2, 1, '#EAB308');
  slab(g, DESK_X - 30, T - 3, 16, 3, '#27272A', { edge: 1 });
  for (let i = 0; i < 4; i++) box(g, DESK_X - 8 + i, T - 3 - i * 2, 22, 2, i % 2 ? '#E7E5E4' : '#F8FAFC');
  box(g, DESK_X - 8, T - 11, 23, 1, '#A8A29E');
  // (the sandwich: on its wax paper, a bite out of it)
  box(g, DESK_X + 16, T - 1, 34, 2, '#E7E2CF');
  inked(g, () => { g.moveTo(DESK_X + 20, T - 1); g.lineTo(DESK_X + 20, T - 9); g.lineTo(DESK_X + 38, T - 9); g.lineTo(DESK_X + 40, T - 6); g.lineTo(DESK_X + 44, T - 7); g.lineTo(DESK_X + 46, T - 1); g.closePath(); }, '#D6A86A', 1);
  box(g, DESK_X + 21, T - 5, 24, 2, '#65A30D'); box(g, DESK_X + 21, T - 3, 24, 1, '#DC2626'); box(g, DESK_X + 21, T - 8, 16, 1, '#E8C48A');
  // (the mug: #1 BOSS, the fangs live in it)
  slab(g, DESK_X + 64, T - 16, 14, 16, '#F1EFEA', { edge: 2 });
  box(g, DESK_X + 78, T - 12, 3, 2, '#F1EFEA'); box(g, DESK_X + 80, T - 12, 2, 7, '#F1EFEA'); box(g, DESK_X + 78, T - 6, 3, 2, '#F1EFEA');
  box(g, DESK_X + 66, T - 11, 10, 3, '#DC2626');
  // (the foam head's stand)
  pole(g, DESK_X + 104, T - 10, 5, 10, '#D6D3D1');
  slab(g, DESK_X + 96, T - 2, 20, 2, '#A8A29E', { edge: 1, ink: false });
};

/** The foam head (bald, or the wig still on it). */
const foamHead = (c: Ctx, f: number, wig: boolean) => {
  const hx = DESK_X + 106, hy = DESK_TOP - 4 - 24;
  inked(c, () => c.ellipse(hx, hy, 10, 13, 0, 0, Math.PI * 2), '#E7E5E4', 2);
  c.fillStyle = '#F5F5F4'; c.beginPath(); c.ellipse(hx - 2, hy - 3, 7, 9, 0, 0, Math.PI * 2); c.fill();
  box(c, hx - 6, hy + 2, 3, 6, '#D6D3D1'); box(c, hx + 3, hy - 1, 3, 1, '#D6D3D1');
  if (wig) drawLooseWig(c, hx, hy - 6, f, 1, -0.1);
};

const paintChair = (g: Ctx) => {
  // (his chair: a five-star base on casters, the gas lift sunk all the way, the seat split and duct-taped, the back
  // leaning off its post)
  const cx = x0 + 352;
  box(g, cx - 25, GY - 12, 50, 5, INK); box(g, cx - 24, GY - 11, 48, 3, '#3A3A40'); box(g, cx - 24, GY - 11, 48, 1, '#5A5A62');
  for (const lx of [-22, 0, 22]) ball(g, cx + lx, GY - 4, 4, '#1F1F22');
  pole(g, cx - 3, GY - 36, 6, 25, '#8A8F98');
  slab(g, cx - 28, GY - 46, 56, 12, '#3F3F46', { edge: 2 });
  box(g, cx - 12, GY - 45, 22, 4, '#A1A1AA'); box(g, cx - 4, GY - 47, 5, 9, '#A1A1AA');
  // (the post up from the back of the seat, the back on it)
  inked(g, () => { g.moveTo(cx - 24, GY - 46); g.lineTo(cx - 32, GY - 84); g.lineTo(cx - 26, GY - 84); g.lineTo(cx - 18, GY - 46); g.closePath(); }, '#2E2E33', 2);
  inked(g, () => { g.moveTo(cx - 44, GY - 136); g.lineTo(cx - 14, GY - 132); g.lineTo(cx - 20, GY - 82); g.lineTo(cx - 44, GY - 86); g.closePath(); }, '#45454D', 2);
  inked(g, () => { g.moveTo(cx - 41, GY - 132); g.lineTo(cx - 18, GY - 129); g.lineTo(cx - 19, GY - 124); g.lineTo(cx - 41, GY - 127); g.closePath(); }, '#5A5A64', 0);
  box(g, cx - 36, GY - 114, 14, 4, '#A1A1AA'); box(g, cx - 31, GY - 119, 4, 14, '#A1A1AA');
  // (an arm, its pad gone)
  box(g, cx + 18, GY - 66, 4, 22, '#27272A'); box(g, cx + 10, GY - 68, 16, 4, '#27272A');
};

const paintBin = (g: Ctx) => {
  // (the bin, overflowing: wrappers, a pizza box sticking out)
  const bx = x0 + 410;
  slab(g, bx, GY - 32, 26, 32, '#4B5563', { edge: 2 });
  for (let i = 0; i < 3; i++) box(g, bx + 5 + i * 7, GY - 26, 2, 20, '#3A414C');
  g.save(); g.translate(bx + 16, GY - 34); g.rotate(-0.5); slab(g, -2, -10, 26, 6, '#C9A06A', { edge: 1 }); g.restore();
  for (const [dx, dy, col] of [[2, -36, '#F8FAFC'], [10, -38, '#EAB308'], [18, -35, '#DC2626'], [-6, -4, '#F8FAFC'], [30, -3, '#EAB308']] as const) { inked(g, () => g.ellipse(bx + dx + 3, GY + dy + 3, 4, 3, 0, 0, Math.PI * 2), col, 1); }
};

const paintRack = (g: Ctx) => {
  // (the bentwood coat rack: a cross foot, the pole, the hooks; a staff windbreaker on the near hook)
  const rx = RACK_X;
  for (const s of [-1, 1]) { g.save(); g.translate(rx, GY - 6); g.rotate(s * 0.35); slab(g, -2, -4, 4, 14, '#5C3317', { edge: 1 }); g.restore(); }
  box(g, rx - 18, GY - 4, 36, 4, '#5C3317'); box(g, rx - 18, GY - 4, 36, 1, '#8A5A2E');
  pole(g, rx - 2, GY - 172, 5, 170, '#7A4520');
  ball(g, rx + 0.5, GY - 176, 4, '#8A5A2E');
  for (const s of [-1, 1]) { box(g, rx + (s < 0 ? -14 : 3), GY - 166, 12, 3, '#7A4520'); box(g, rx + (s < 0 ? -15 : 14), GY - 171, 3, 7, '#7A4520'); }
  // (the windbreaker: purple, STAFF across the back)
  inked(g, () => { g.moveTo(rx - 14, GY - 164); g.lineTo(rx - 6, GY - 164); g.lineTo(rx - 4, GY - 104); g.lineTo(rx - 24, GY - 102); g.lineTo(rx - 22, GY - 150); g.closePath(); }, '#5B21B6', 2);
  box(g, rx - 20, GY - 146, 3, 40, '#4C1D95'); box(g, rx - 12, GY - 162, 4, 4, '#7C3AED');
  box(g, rx - 21, GY - 132, 16, 5, '#EDE9FE');
};

/** The cape on its hook: black, its red lining showing at the edge, DONNIE on its name tag. */
const cape = (c: Ctx) => {
  const rx = RACK_X;
  inked(c, () => { c.moveTo(rx - 8, GY - 166); c.lineTo(rx + 14, GY - 166); c.lineTo(rx + 24, GY - 50); c.lineTo(rx + 8, GY - 44); c.lineTo(rx - 6, GY - 52); c.lineTo(rx - 2, GY - 120); c.closePath(); }, '#18181B', 2);
  box(c, rx + 14, GY - 150, 3, 96, '#27272A'); box(c, rx + 2, GY - 140, 2, 80, '#0B0B0D');
  inked(c, () => { c.moveTo(rx + 16, GY - 140); c.lineTo(rx + 23, GY - 52); c.lineTo(rx + 19, GY - 50); c.closePath(); }, '#B91C1C', 0);
  box(c, rx - 6, GY - 170, 22, 7, '#991B1B'); box(c, rx - 6, GY - 170, 22, 2, '#DC2626');
  box(c, rx + 2, GY - 120, 12, 8, '#F8FAFC'); box(c, rx + 2, GY - 120, 12, 2, '#DC2626'); box(c, rx + 4, GY - 116, 8, 1, '#3F3F46');
};

// ---------------------------------------------------------------------------------------------------------------
// The floor: the hole he came up through, or the hatch before

const holePts = (eye: Eye): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, j = 0.75 + hash(i * 5.1) * 0.4;
    const dx = Math.cos(a) * 40 * j, dd = 0.955 + Math.sin(a) * 0.035 * j;
    pts.push(at(eye, HOLE_X + dx, GY, dd));
  }
  return pts;
};
const drawHole = (c: Ctx, eye: Eye, f: number, burst: boolean) => {
  if (!burst) {
    // (an access hatch in the floor: a steel plate, its bolts)
    const a = at(eye, HOLE_X - 30, GY, 0.925), b = at(eye, HOLE_X + 30, GY, 0.925), cc = at(eye, HOLE_X + 30, GY, 0.99), d = at(eye, HOLE_X - 30, GY, 0.99);
    quad(c, INK, [a[0] - 1, a[1] - 1], [b[0] + 1, b[1] - 1], [cc[0] + 1, cc[1] + 1], [d[0] - 1, d[1] + 1]);
    quad(c, '#5B636D', a, b, cc, d);
    seg(c, a, b, '#8A939E', 1);
    for (let i = 0; i < 4; i++) box(c, a[0] + 6 + i * 16, (a[1] + d[1]) / 2, 2, 2, '#2F343B');
    return;
  }
  const pts = holePts(eye);
  const path = (k: number) => { c.beginPath(); pts.forEach(([x, y], i) => { const px = HOLE_X + (x - HOLE_X) * k, py = at(eye, HOLE_X, GY, 0.955)[1] + (y - at(eye, HOLE_X, GY, 0.955)[1]) * k; if (i) c.lineTo(px, py); else c.moveTo(px, py); }); c.closePath(); };
  // (broken tile round the edge, then down: the dark, and at the bottom of it the lava, dim, breathing)
  path(1.18); c.fillStyle = '#3A3A36'; c.fill();
  path(1.0); c.fillStyle = INK; c.fill();
  path(0.86); c.fillStyle = '#140606'; c.fill();
  const glow = Math.floor(f / 14) % 3;
  path(0.55); c.fillStyle = ['#4A1208', '#561608', '#4A1208'][glow]; c.fill();
  path(0.3); c.fillStyle = '#7C2D12'; c.fill();
  // (chunks of tile kicked up round it)
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.4, p = at(eye, HOLE_X + Math.cos(a) * 54, GY, 0.955 + Math.sin(a) * 0.04);
    box(c, p[0] - 4, p[1] - 3, 8, 3, INK); box(c, p[0] - 3, p[1] - 3, 6, 2, i % 2 ? '#C9C2B0' : '#8E8878');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The room, drawn (world space, behind everything)

export interface RoomLook { burst: boolean; took: { wig: boolean; cape: boolean; fangs: boolean }; done: boolean }

export const drawRoom = (c: Ctx, state: GameState, look: RoomLook) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > PART_R + 60 || v.x + v.w < ROOM_L) return;
  const f = state.frame, eye = eyeOf(state);
  // The plane-1 dark above the ceiling (seen if he's up high), the back wall, the ceiling under it
  box(c, ROOM_L, CEIL - 900, PART_R - ROOM_L, 900, '#0C0A10');
  wallRun(c, eye, 'ctl-wall', ROOM_L, ROOM_DOOR + 2, 256, 4, paintWallTile, 'rgba(8, 10, 18, 0.18)');
  ceiling(c, eye, ROOM_L, PART_L, ['#3A3B38', '#43443F', '#4C4D47', '#55564F'], 64, '#8A8B84');
  for (const d of [0.97, 0.93, 0.895]) seg(c, at(eye, ROOM_L, CEIL, d), at(eye, PART_L, CEIL, d), '#8A8B84', 1);
  // (the ceiling tile that's missing, the one with the stain)
  {
    const t = (x: number, d0: number, d1: number, col: string) => quad(c, col, at(eye, x, CEIL, d0), at(eye, x + 64, CEIL, d0), at(eye, x + 64, CEIL, d1), at(eye, x, CEIL, d1));
    t(x0 + 128, 0.97, 0.93, '#0E0E10'); t(x0 + 448, 0.93, 0.895, '#6B5E3E');
  }
  // On the back wall: the rack and its feeds, the boards, the fridge
  inDepth(c, eye, WALL_D, () => {
    stamp(c, 'ctl-boards', x0 + 40, GY - 400, 230, 200, paintBoards);
    stamp(c, 'ctl-bank', BANK_L - 10, BANK_TOP - 50, BANK_R - BANK_L + 20, GY - BANK_TOP + 50, paintBank);
    for (let i = 0; i < 6; i++) feed(c, i, f, look.done || (look.burst && i === 3));
    stamp(c, 'ctl-fridge', x0 - 10, GY - 140, 150, 140, paintFridge);
  });
  // The floor: tiles going back to the wall, the hole (or the hatch), the front edge
  tileFloor(c, eye, ROOM_L, PART_R, 40, ['#8E8878', '#77715F'], 3, '#4A463C');
  drawHole(c, eye, f, look.burst);
  frontFloor(c, ROOM_L, PART_R, ['#6F6A5C', '#5A5649', '#46433A', '#36332C'], '#9C9684');
  drawPartitionSide(c, state, -1);
  // The bare bulb on its cord (swinging a touch when the floor goes)
  {
    const sw = look.burst ? Math.sin(f * 0.05) * 3 : 0, bx = x0 + 300 + sw;
    seg(c, [x0 + 300, CEIL], [bx, GY - 392], '#18181B', 2);
    box(c, bx - 3, GY - 394, 6, 6, '#3F3F46');
    const lit = Math.floor(f / 90) % 7 !== 0;
    ball(c, bx, GY - 382, 6, lit ? '#FDE68A' : '#A1A1AA');
  }
  // At his plane: the chair, the bin, the console and its clutter, the head, the rack and the cape
  stamp(c, 'ctl-chair', x0 + 300, GY - 140, 90, 142, paintChair);
  stamp(c, 'ctl-bin', x0 + 396, GY - 60, 60, 62, paintBin);
  consoleTop(c, eye);
  stamp(c, 'ctl-console', DESK_L - 4, DESK_TOP - 50, DESK_W + 8, 124, paintConsole);
  // (the console's lights, going round; its faders)
  for (let i = 0; i < 8; i++) {
    const bx = DESK_L + 12 + i * 23, on = (i + Math.floor(f / 20)) % 4;
    box(c, bx - 1, DESK_TOP + 5, 9, 6, INK); box(c, bx, DESK_TOP + 6, 7, 4, ['#DC2626', '#22C55E', '#FDE047', '#3B82F6'][on]); box(c, bx, DESK_TOP + 6, 7, 1, '#FFFFFF');
    box(c, bx - 1, DESK_TOP + 17 + ((i * 5) % 8), 8, 3, '#A1A1AA');
  }
  // (the mic: gooseneck up off its base, the foam on it)
  const mx = DESK_X - 22;
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(mx, DESK_TOP - 6); c.quadraticCurveTo(mx + 2, DESK_TOP - 30, mx - 6, DESK_TOP - 38); c.stroke();
  c.strokeStyle = '#71717A'; c.lineWidth = 2; c.stroke();
  inked(c, () => c.ellipse(mx - 8, DESK_TOP - 42, 5, 6, -0.4, 0, Math.PI * 2), '#27272A', 2);
  box(c, mx - 11, DESK_TOP - 46, 3, 3, '#52525B');
  if (!look.took.fangs) drawLooseFangs(c, DESK_X + 72, DESK_TOP - 22, 0.2);
  foamHead(c, f, !look.took.wig);
  stamp(c, 'ctl-rack', RACK_X - 30, GY - 182, 56, 184, paintRack);
  if (!look.took.cape) cape(c);
};

// ---------------------------------------------------------------------------------------------------------------
// The wall between the room and the shop: a thick block, front to back, the staff door's passage through it
// (passage.ts): over his head its lintel (STAFF ONLY); through it, its back wall (the booth's painted block giving
// way to the shop's fiberglass rock at the threshold, the steel door swung back against the block), the booth's
// tiles giving way to the shop's carpet; its near jambs sliding past in front of him.

export const STAFF: Passage = { A: PART_L, B: PART_R, H: GY - 156, top: CEIL - 300, dp: 0.935, near: 1.09, split: ROOM_DOOR + 34 };

const paintStaffRear = (g: Ctx) => {
  const { A, B, H, split } = STAFF;
  // (the booth's side: its block, the rail, the base; the door swung back flat against it)
  paintBlock(g, A, split - A, H, GY - 120, PAINT, 21);
  paintBlock(g, A, split - A, GY - 120, GY - 12, LOWER, 22);
  slab(g, A, GY - 126, split - A, 6, '#6B5A44', { ink: false, edge: 2 });
  box(g, A, GY - 12, split - A, 12, '#221E1B');
  box(g, A, H, split - A, GY - H, 'rgba(8, 12, 24, 0.22)');
  slab(g, A + 8, GY - 148, 64, 148, '#7C6F64', { edge: 3 });
  box(g, A + 14, GY - 30, 52, 24, '#A8A29E'); box(g, A + 14, GY - 30, 52, 2, '#D6D3D1');
  slab(g, A + 12, GY - 80, 48, 6, '#C9A227', { edge: 1 });
  box(g, A + 64, GY - 110, 4, 8, '#5C5148'); box(g, A + 64, GY - 40, 4, 8, '#5C5148');
  // (the badge reader by the threshold, its light red; a strip of yellow-and-black tape up the corner)
  slab(g, split - 22, GY - 96, 12, 18, '#27272A', { edge: 2 }); box(g, split - 19, GY - 92, 6, 3, '#EF4444');
  for (let y = H; y < GY; y += 8) { box(g, split - 4, y, 4, 4, '#EAB308'); box(g, split - 4, y + 4, 4, 4, '#18181B'); }
  // (the shop's side: the rock, lit red)
  rockWall(g, split, B, H, GY, 7);
  box(g, split, H, B - split, GY - H, 'rgba(70, 6, 6, 0.18)');
  box(g, A, H, B - A, 6, 'rgba(0, 0, 0, 0.35)');
};

const paintStaffLintel = (g: Ctx) => {
  const { A, B, H, top } = STAFF;
  paintBlock(g, A, B - A, top, H, PAINT, 11);
  hazeBands(g, A, CEIL, B - A, 170, '#0C0A10', 0.6, 0, 6);
  // (the steel header over the opening, STAFF ONLY on the block over it)
  slab(g, A, H - 10, B - A, 10, '#6B7280', { edge: 2 });
  for (let x = A + 10; x < B - 4; x += 24) box(g, x, H - 6, 2, 2, '#3F3F46');
  plaque(g, (A + B) / 2 - 10, H - 34, 'STAFF ONLY', '#7F1D1D', '#FEF2F2');
};

/** The wall between's sides, going back (each drawn before what stands at his plane on its side of it). */
export const drawPartitionSide = (c: Ctx, state: GameState, side: -1 | 1) => {
  const eye = eyeOf(state);
  if (side < 0) passageSide(c, eye, PART_L, -1, STAFF, PAINT);
  else passageSide(c, eye, PART_R, 1, STAFF, '#5B1414');
};

/** World space, after the shop: the passage through the wall between, its lintel. */
export const drawPartition = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > PART_R + 200 || v.x + v.w < PART_L - 200) return;
  passageBack(c, eyeOf(state), STAFF, 'ctl-staff-rear', paintStaffRear, '#8E8878', '#741A1A', '#2A2A2E');
  passageLintel(c, STAFF, 'ctl-staff-lintel', paintStaffLintel);
  box(c, PART_L - 1, STAFF.top, 2, STAFF.H - STAFF.top, INK); box(c, PART_R - 1, STAFF.top, 2, STAFF.H - STAFF.top, INK);
};
/** World space, in front of everything: the passage's near jambs and lintel edge. */
export const drawPartitionFront = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > PART_R + 300 || v.x + v.w < PART_L - 300) return;
  passageFront(c, eyeOf(state), STAFF, '#3A3F48');
};

// ---------------------------------------------------------------------------------------------------------------
// The light: dim; the bulb, the monitors' blue, the hole's lava once it's open, the shop's red through the door

/** `door`: where the ballroom's doors are, if they're open (its purple light comes through them onto the shop's floor). */
export const roomLighting = (state: GameState, burst: boolean, door: number | null = null): SceneLight => {
  const eye = eyeOf(state), f = state.frame, cam = state.camera.x;
  const lights: Light[] = [];
  const near = (x: number) => x > cam - 400 && x < cam + CANVAS_WIDTH + 400;
  // (the booth's light and the shop's, crossing over as he goes through the staff door: no jump at the threshold)
  const k = Math.max(0, Math.min(1, (eye.x - (STAFF.split - 300)) / 600));
  if (k < 1) {
    if (Math.floor(f / 90) % 7 !== 0) lights.push({ x: x0 + 300, y: GY - 382, r: 300, a: 0.7, cone: 200, color: 'rgba(253, 230, 160, 0.07)' });
    const [bx, by] = at(eye, (BANK_L + BANK_R) / 2, BANK_TOP + 110, WALL_D);
    lights.push({ x: bx, y: by, r: 260, a: 0.75, color: 'rgba(147, 197, 253, 0.08)' });
    if (burst) lights.push({ x: HOLE_X, y: GY - 10, r: 120 + (Math.floor(f / 14) % 3) * 6, a: 0.7, color: 'rgba(249, 115, 22, 0.12)' });
  }
  // (the shop: the rope lights' red along the top, the painted lava's orange low down)
  for (let x = Math.floor((Math.max(cam, SHOP_X) - 300) / 320) * 320 + 160; x < cam + CANVAS_WIDTH + 300; x += 320) if (near(x) && x > SHOP_X) {
    lights.push({ x, y: GY - 60, r: 200, a: 0.6, color: 'rgba(234, 88, 12, 0.07)' });
    lights.push({ x: x + 160, y: GY - 330, r: 240, a: 0.6, cone: 220, color: 'rgba(254, 215, 170, 0.05)' });
  }
  const mixN = (a: number, b: number) => Math.round(a + (b - a) * k);
  if (door !== null && near(door)) lights.push({ x: door - 20, y: GY - 70, r: 150, a: 0.6, color: 'rgba(167, 139, 250, 0.09)' });
  return { dark: 0.3 + (0.26 - 0.3) * k, shade: [mixN(10, 34), mixN(12, 6), mixN(22, 6)], lights };
};

void lite; void dark;
