// The control room, painted: Donnie's booth. A cinderblock box painted the color of a dentist's waiting room, a drop
// ceiling with a stain in it and one bare bulb on a cord, the wall of CRTs (the park's cameras), the console he does
// the voice from (a gooseneck mic, a sandwich, a soda the size of a bucket, the mug the fangs live in, the foam head
// the wig lives on), his chair (taped), the bin, the mini fridge, the pizza boxes; the coat rack and the cape; the
// nest of junk food he lives in (his sin's gluttony): the fridge a glass-door cooler of blood bags with the takeout
// menu on it, nine pizza boxes, a family bucket of chicken on the soda cases, the recycling gone over with two-liters,
// an open box on the floor by his chair, bones and ketchup packets everywhere; the
// staff door out into the shop. Light fake 3D (paint.ts): the back wall a step back, the floor's tiles going back to
// it, the wall between the room and the shop a solid block with its near side showing.
//
// Still things are stamped once; the monitors, the console's lights, the bulb, the hole's glow are live over them.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { timeOfDay, hourMix, skyAt } from '../../timeOfDay';
import { drawLooseWig, drawLooseFangs } from '../donnie';
import { type Passage, passageBack, passageSide, passageFront, passageLintel } from './passage';
import { rockWall } from './shopArt';
import { x0, HOLE_X, DESK_X, RACK_X, ROOM_DOOR, SHOP_X, PART_L, PART_R, BUFFET_X, SLUSH_X } from './geo';
import {
  INK, box, slab, pole, ball, rampOf, dark, lite, mix, checker, hazeBands, stamp, hash,
  WALL_D, CEIL, eyeOf, inDepth, at, quad, seg, shade, inked, wallRun, ceiling, tileFloor, frontFloor, plaque,
  type Eye,
} from './paint';
import { signAt, signText, enamel, print } from '../letters';

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
const screenAt = (i: number): [number, number] => [BANK_L + 22 + (i % 3) * 122, BANK_TOP + 22 + Math.floor(i / 3) * 104];
const SCR_W = 92, SCR_H = 60;
/** Each set's plastic: the same beige, gone yellow by different amounts (the ones up top nearer the bulb, the worst). */
const CASE = ['#C4B48A', '#BDB394', '#C9B47E', '#B9B29C', '#BFB08A', '#B5AE98'];
/** What each camera sees, on the label-maker tape under its screen. */
const TAPE = ['TOWN', 'CASTLE', 'CLOCK', 'HELL', 'BALLRM', 'GIFTS'];

/** The camera feeds' on-screen lettering: a blocky 3x5 character generator (digits, the few letters it needs). */
const GLYPH: Record<string, string> = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001011001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  ':': '000010000010000', C: '111100100100111', A: '010101111101101', M: '101111111101101', R: '110101110101101',
  E: '111100110100111', ' ': '000000000000000',
};
/** Sets `s` in the character generator at x, y (its top left): white, a dark drop under it. (Runs per row: cheap.) */
const osdText = (g: Ctx, s: string, x: number, y: number, col = '#E8ECEF') => {
  for (const [dx, cl] of [[1, 'rgba(0, 0, 0, 0.7)'], [0, col]] as const) {
    for (let k = 0; k < s.length; k++) {
      const bits = GLYPH[s[k]] ?? GLYPH[' '];
      for (let row = 0; row < 5; row++) {
        let run = -1;
        for (let col3 = 0; col3 <= 3; col3++) {
          const on = col3 < 3 && bits[row * 3 + col3] === '1';
          if (on && run < 0) run = col3;
          else if (!on && run >= 0) { box(g, x + k * 4 + run + dx, y + row + dx, col3 - run, 1, cl); run = -1; }
        }
      }
    }
  }
};
/** A run of the character generator, stamped (put down where the screen's translated to; one per text and spot). */
const osd = (c: Ctx, s: string, x: number, y: number) => stamp(c, `ctl-osd|${s}|${x},${y}`, x - 1, y - 1, s.length * 4 + 3, 8, g => osdText(g, s, x, y));

/** The feeds' clock: the hour the park's sky says it is, the minutes and seconds ticking on from there. */
const HOUR: Record<string, number> = { morning: 9, midday: 12, afternoon: 15, 'golden hour': 17, sunset: 19, dusk: 20, night: 23 };
const clockAt = (f: number) => {
  const t = (HOUR[timeOfDay().name] ?? 21) * 3600 + 13 * 60 + 37 + Math.floor(f / 60);
  const two = (n: number) => String(n).padStart(2, '0');
  return { hm: `${two(Math.floor(t / 3600) % 24)}:${two(Math.floor(t / 60) % 60)}:`, s: two(t % 60), min: Math.floor(t / 60) % 60, hr: Math.floor(t / 3600) % 12 };
};

const paintBank = (g: Ctx) => {
  // (the steel rack: uprights punched for shelf pins, a back panel, the shelves; the casings on it)
  slab(g, BANK_L, BANK_TOP, BANK_R - BANK_L, 222, '#2F343B', { edge: 4 });
  box(g, BANK_L + 10, BANK_TOP + 6, BANK_R - BANK_L - 20, 210, '#262A30');
  for (const ux of [BANK_L + 2, BANK_R - 8]) {
    pole(g, ux, BANK_TOP + 2, 6, 218, '#5B636D');
    for (let y = BANK_TOP + 8; y < BANK_TOP + 216; y += 8) box(g, ux + 2, y, 2, 3, '#1A1D21');
  }
  // (the tubes' backs: the bulge behind each casing, its vent slots, in the dark behind the shelf lip)
  for (let i = 0; i < 6; i++) {
    const [sx, sy] = screenAt(i), col = dark(CASE[i], 0.22);
    slab(g, sx + 8, sy - 22, SCR_W - 16, 12, col, { edge: 2 });
    for (let k = 0; k < 9; k++) box(g, sx + 16 + k * 7, sy - 19, 3, 5, rampOf(col)[0]);
  }
  for (let row = 0; row < 2; row++) {
    const sy = BANK_TOP + 104 + row * 104;
    slab(g, BANK_L - 6, sy, BANK_R - BANK_L + 12, 10, '#5B636D', { edge: 2 });
    for (let x = BANK_L + 2; x < BANK_R; x += 40) { box(g, x, sy + 4, 2, 2, '#2F343B'); box(g, x, sy + 4, 1, 1, '#9AA3AD'); }
    // (each set's shadow on the shelf under it)
    for (let k = 0; k < 3; k++) checker(g, screenAt(row * 3 + k)[0] - 10, sy + 2, SCR_W + 20, 2, '#2F343B');
  }
  for (let i = 0; i < 6; i++) {
    const [sx, sy] = screenAt(i), col = CASE[i], r = rampOf(col);
    // (the casing: beige plastic gone yellow up top where the bulb's cooked it, stepped round its corners)
    slab(g, sx - 12, sy - 12, SCR_W + 24, SCR_H + 34, col, { edge: 4 });
    checker(g, sx - 8, sy - 8, SCR_W + 16, 2, mix(col, '#C99A3A', 0.35));
    box(g, sx - 8, sy - 10, SCR_W + 16, 1, mix(col, '#D6A84A', 0.25));
    // (the side vents, stepped slots)
    for (let k = 0; k < 6; k++) for (const vx of [sx - 10, sx + SCR_W + 7]) { box(g, vx, sy + 6 + k * 6, 3, 3, r[0]); box(g, vx, sy + 6 + k * 6, 3, 1, INK); }
    // (the bezel: sunk into the casing (lit along its foot, in shadow under the top), the dark plastic round the glass)
    box(g, sx - 7, sy - 7, SCR_W + 14, SCR_H + 14, r[4]);
    box(g, sx - 7, sy - 7, SCR_W + 13, SCR_H + 13, r[0]);
    box(g, sx - 6, sy - 6, SCR_W + 12, SCR_H + 12, '#2B2822');
    box(g, sx - 5, sy - 5, SCR_W + 10, 1, '#4E483C'); box(g, sx - 5, sy - 5, 1, SCR_H + 10, '#4E483C');
    box(g, sx - 5, sy + SCR_H + 4, SCR_W + 10, 1, '#16140F'); box(g, sx + SCR_W + 4, sy - 5, 1, SCR_H + 10, '#16140F');
    box(g, sx - 1, sy - 1, SCR_W + 2, SCR_H + 2, '#0B0D0E');
    // (the badge up top: a chrome lozenge, the maker's mark pressed in it)
    const bx = sx + SCR_W / 2 - 12;
    box(g, bx - 1, sy - 11, 26, 6, INK); box(g, bx, sy - 10, 24, 4, '#A8ADB4'); box(g, bx, sy - 10, 24, 1, '#E4E7EB'); box(g, bx, sy - 7, 24, 1, '#6B7078');
    for (let k = 0; k < 5; k++) box(g, bx + 3 + k * 4, sy - 9, 2, 2, '#3A3E44');
    // (the panel under the glass: the speaker grille, the label-maker tape, the knobs, the power button, its lamp)
    const y0 = sy + SCR_H + 9;
    for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 5; gx++) box(g, sx - 6 + gx * 3, y0 + gy * 3, 2, 2, r[0]);
    box(g, sx + 14, y0 - 1, 42, 10, '#121212'); box(g, sx + 14, y0 - 1, 42, 1, '#3A3A3A'); box(g, sx + 14, y0 + 8, 42, 1, '#000000');
    signText(g, TAPE[i], sx + 35, y0 + 8, print(6, '#E8E8E8'), 'center');
    for (const kx of [sx + SCR_W - 20, sx + SCR_W - 9]) { ball(g, kx, y0 + 4, 4, '#3A3A3E'); box(g, kx - 1, y0, 1, 3, '#D4D4D8'); }
    slab(g, sx + SCR_W + 1, y0 - 1, 7, 6, r[1], { edge: 1 });
    box(g, sx + SCR_W + 2, y0 + 7, 4, 2, INK); box(g, sx + SCR_W + 3, y0 + 7, 2, 1, '#22C55E');
    // (the casing's foot on the shelf)
    box(g, sx - 12, sy + SCR_H + 21, SCR_W + 24, 1, INK);
  }
  // (what's stuck on them: the wifi password on a sticky note; a rubber bat on CASTLE's casing; a plastic pumpkin up on
  // CLOCK's; DO NOT UNPLUG on HELL's; a strip of tape holding GIFTS' cracked bezel)
  {
    const [ax, ay] = screenAt(0);
    box(g, ax - 13, ay + 46, 14, 13, '#FDE68A'); box(g, ax - 13, ay + 46, 14, 2, '#F5D063');
    box(g, ax - 11, ay + 50, 10, 1, '#A16207'); box(g, ax - 11, ay + 53, 7, 1, '#A16207'); box(g, ax - 11, ay + 56, 9, 1, '#A16207');
    const [cx, cy] = screenAt(1);
    inked(g, () => { g.moveTo(cx + SCR_W + 2, cy - 8); g.lineTo(cx + SCR_W + 6, cy - 12); g.lineTo(cx + SCR_W + 8, cy - 9); g.lineTo(cx + SCR_W + 10, cy - 12); g.lineTo(cx + SCR_W + 14, cy - 8); g.lineTo(cx + SCR_W + 10, cy - 6); g.lineTo(cx + SCR_W + 8, cy - 4); g.lineTo(cx + SCR_W + 6, cy - 6); g.closePath(); }, '#27272A', 1);
    box(g, cx + SCR_W + 7, cy - 8, 1, 1, '#EF4444'); box(g, cx + SCR_W + 9, cy - 8, 1, 1, '#EF4444');
    const [px, py] = screenAt(2);
    inked(g, () => g.ellipse(px + SCR_W - 10, py - 18, 8, 6, 0, 0, Math.PI * 2), '#EA7A1A', 2);
    box(g, px + SCR_W - 16, py - 22, 3, 6, '#F59E3A'); box(g, px + SCR_W - 9, py - 23, 2, 9, '#C2560E');
    box(g, px + SCR_W - 11, py - 26, 2, 3, '#3F6212');
    box(g, px + SCR_W - 15, py - 19, 2, 2, INK); box(g, px + SCR_W - 8, py - 19, 2, 2, INK); box(g, px + SCR_W - 14, py - 15, 7, 1, INK);
    const [hx, hy] = screenAt(3);
    box(g, hx - 14, hy - 4, 12, 22, '#F1EEE6'); box(g, hx - 14, hy - 4, 12, 1, '#FFFFFF');
    for (let k = 0; k < 4; k++) box(g, hx - 12, hy + k * 5, 6 + (k % 2) * 2, 2, '#B91C1C');
    const [tx, ty] = screenAt(5);
    box(g, tx - 14, ty - 4, 20, 6, '#C8BFA6'); box(g, tx - 14, ty - 4, 20, 1, '#E2DBC6'); checker(g, tx - 14, ty + 1, 20, 1, '#9C9480');
    g.strokeStyle = '#5A5A5A'; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 4, ty - 6); g.lineTo(tx + 2, ty + 2); g.lineTo(tx + 1, ty + 7); g.stroke();
  }
  // (the cables out of the backs, down the side of the rack in a bundle (zip-tied), off along the floor behind the desk:
  // black power, gray coax, the yellow and red composite leads)
  const cols = ['#141416', '#3F4247', '#141416', '#B88A12', '#9B1C1C', '#2A2C30'];
  for (let k = 0; k < cols.length; k++) {
    g.strokeStyle = INK; g.lineWidth = 4;
    const lane = BANK_R + 4 + k * 2;
    const path = () => { g.beginPath(); g.moveTo(BANK_R - 20 - k * 10, BANK_TOP + 220); g.quadraticCurveTo(lane, BANK_TOP + 222, lane, BANK_TOP + 250); g.lineTo(lane, GY - 30); g.quadraticCurveTo(lane, GY - 6, lane - 40 - k * 14, GY - 4); };
    path(); g.stroke();
    g.strokeStyle = cols[k]; g.lineWidth = 2; path(); g.stroke();
  }
  for (let y = BANK_TOP + 260; y < GY - 30; y += 46) { box(g, BANK_R + 2, y, 15, 3, '#E7E5E4'); box(g, BANK_R + 2, y + 2, 15, 1, '#A8A29E'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The camera feeds: each a little scene of its place, painted the once (the outdoor ones again when the hour moves on),
// what moves in it drawn live over that, then the glass over it all. All of it at the screen's own top left.

type Tod = ReturnType<typeof timeOfDay>;
/** An outdoor feed's sky: the hour's, in bands (a dither where they meet), the stars out at night. */
const feedSky = (g: Ctx, tod: Tod, h: number) => {
  const n = 4;
  for (let k = 0; k < n; k++) {
    const col = mix(skyAt(0.12 + (k / (n - 1)) * 0.7, tod), '#20283A', 0.3), y = Math.round((k * h) / n);
    box(g, 0, y, SCR_W, Math.ceil(h / n) + 1, col);
    if (k) checker(g, 0, y, SCR_W, 2, mix(skyAt(0.12 + ((k - 1) / (n - 1)) * 0.7, tod), '#20283A', 0.3));
  }
  if (tod.stars > 0.3) for (let k = 0; k < 9; k++) box(g, 3 + ((k * 37) % (SCR_W - 6)), 2 + ((k * 13) % 16), 1, 1, k % 3 ? '#C8CCE0' : '#8890B0');
  if (tod.moon > 0.3) { ball(g, SCR_W - 16, 9, 4, '#E8E4D0', false); box(g, SCR_W - 15, 7, 2, 2, '#C8C2A8'); }
};
/** A color on an outdoor feed: lighter by day, darkening down to the night. */
const dayOf = (col: string, tod: Tod) => hourMix(lite(col, 0.3), lite(col, 0.1), col, tod);
/** Is it dark enough that the windows are lit? */
const litAt = (tod: Tod) => tod.lamps > 0.3;

const paintTown = (g: Ctx, tod: Tod) => {
  const d = (c: string) => dayOf(c, tod), lit = litAt(tod);
  feedSky(g, tod, 30);
  // (the hills behind, the church spire off on them)
  g.fillStyle = d('#262C3A'); g.beginPath(); g.moveTo(0, 28); g.lineTo(18, 22); g.lineTo(40, 26); g.lineTo(64, 20); g.lineTo(SCR_W, 25); g.lineTo(SCR_W, 34); g.lineTo(0, 34); g.closePath(); g.fill();
  box(g, 70, 10, 3, 14, d('#262C3A')); box(g, 71, 6, 1, 4, d('#262C3A'));
  // (the square's fronts: gabled, the stone ramped left to right, the roofs' ridges lit, chimneys, the doors)
  for (let k = 0; k < 4; k++) {
    const hx = 3 + k * 22, top = 30 + (k % 2) * 3, w = 18, col = d(['#5A4E46', '#4A4440', '#5E5348', '#47423F'][k]), r = rampOf(col);
    box(g, hx, top, w, 50 - top, col); box(g, hx, top, 2, 50 - top, r[3]); box(g, hx + w - 2, top, 2, 50 - top, r[1]);
    for (let y = top + 4; y < 50; y += 4) box(g, hx + 2, y, w - 4, 1, r[1]);
    const roof = d('#1E1A1C');
    g.fillStyle = roof; g.beginPath(); g.moveTo(hx - 2, top + 1); g.lineTo(hx + w / 2, top - 10); g.lineTo(hx + w + 2, top + 1); g.closePath(); g.fill();
    g.strokeStyle = d('#3E3438'); g.lineWidth = 1; g.beginPath(); g.moveTo(hx - 1, top); g.lineTo(hx + w / 2, top - 9); g.stroke();
    if (k % 2 === 0) box(g, hx + w - 6, top - 9, 3, 6, d('#3A2E2A'));
    box(g, hx + 6, 42, 6, 8, d('#1A1210')); box(g, hx + 6, 42, 6, 1, d('#3A2A22'));
    if (!lit) { box(g, hx + 2, top + 4, 4, 4, d('#2E3440')); box(g, hx + w - 6, top + 4, 4, 4, d('#2E3440')); }
  }
  // (the cobbles, the curb; a lamp post on the corner)
  box(g, 0, 50, SCR_W, SCR_H - 50, d('#35302C')); box(g, 0, 50, SCR_W, 1, d('#5A524A'));
  for (let y = 52; y < SCR_H; y += 3) for (let x = (y % 2) * 3; x < SCR_W; x += 6) box(g, x, y, 3, 1, d('#2A2522'));
  box(g, 46, 30, 1, 20, d('#1A1A1E')); box(g, 44, 28, 5, 3, d('#1A1A1E')); box(g, 45, 29, 3, 1, lit ? '#FDE68A' : d('#3A3A40'));
  if (lit) checker(g, 40, 50, 14, 2, '#8A7A4A');
};
const paintCastle = (g: Ctx, tod: Tod) => {
  const d = (c: string) => dayOf(c, tod), stone = d('#4A4540'), r = rampOf(stone);
  feedSky(g, tod, 34);
  // (the towers either side, their battlements; the keep's wall between, its courses; the gate, the portcullis down)
  const course = (x: number, y: number, w: number, h: number) => {
    box(g, x, y, w, h, stone); box(g, x, y, 2, h, r[3]); box(g, x + w - 2, y, 2, h, r[1]);
    for (let yy = y + 4, k = 0; yy < y + h; yy += 4, k++) { box(g, x + 2, yy, w - 4, 1, r[1]); for (let xx = x + 3 + (k % 2) * 4; xx < x + w - 3; xx += 8) box(g, xx, yy - 3, 1, 3, r[1]); }
  };
  course(20, 24, 52, 30);
  for (let k = 0; k < 6; k++) box(g, 20 + k * 9, 20, 6, 4, stone);
  for (const tx of [6, 70]) {
    course(tx, 12, 16, 42);
    for (let k = 0; k < 3; k++) box(g, tx + k * 6, 8, 4, 4, stone);
    box(g, tx + 6, 20, 3, 6, '#0C0A09');
  }
  // (a pennant up on the right one)
  box(g, 79, 0, 1, 8, d('#1A1A1E')); box(g, 80, 1, 6, 3, '#7F1D1D');
  g.fillStyle = '#0C0A09'; g.beginPath(); g.moveTo(38, 54); g.lineTo(38, 40); g.quadraticCurveTo(46, 32, 54, 40); g.lineTo(54, 54); g.closePath(); g.fill();
  for (let x = 40; x < 54; x += 3) box(g, x, 38, 1, 16, '#3A3530');
  for (let y = 42; y < 54; y += 3) box(g, 38, y, 16, 1, '#3A3530');
  // (the moat, the bridge over it, the path)
  box(g, 0, 54, SCR_W, SCR_H - 54, d('#1E2A2C')); checker(g, 0, 55, SCR_W, 1, d('#34484A'));
  box(g, 36, 54, 20, 3, d('#5C4630')); box(g, 36, 54, 20, 1, d('#7A5E40'));
  g.fillStyle = d('#3A3428'); g.beginPath(); g.moveTo(38, 57); g.lineTo(54, 57); g.lineTo(62, SCR_H); g.lineTo(30, SCR_H); g.closePath(); g.fill();
};
const paintTower = (g: Ctx, tod: Tod) => {
  const d = (c: string) => dayOf(c, tod), lit = litAt(tod), brick = d('#3A3330'), r = rampOf(brick);
  feedSky(g, tod, SCR_H);
  // (the rooftops round its foot)
  box(g, 0, 46, 30, 14, d('#22201E')); box(g, 62, 50, 30, 10, d('#22201E'));
  g.fillStyle = d('#22201E'); g.beginPath(); g.moveTo(0, 46); g.lineTo(14, 38); g.lineTo(30, 46); g.moveTo(62, 50); g.lineTo(78, 42); g.lineTo(92, 50); g.fill();
  if (lit) { box(g, 8, 50, 3, 3, '#C89A3A'); box(g, 80, 53, 3, 3, '#C89A3A'); }
  // (the tower: brick courses, ramped; the gallery under the face; the spire, the weathervane)
  box(g, 34, 14, 24, SCR_H - 14, brick); box(g, 34, 14, 3, SCR_H - 14, r[3]); box(g, 55, 14, 3, SCR_H - 14, r[1]);
  for (let y = 16, k = 0; y < SCR_H; y += 3, k++) { box(g, 37, y, 18, 1, r[1]); box(g, 39 + (k % 2) * 4, y - 2, 1, 2, r[1]); }
  box(g, 32, 30, 28, 3, d('#2A2522')); for (let x = 33; x < 59; x += 3) box(g, x, 33, 1, 4, d('#2A2522'));
  g.fillStyle = d('#2A1E22'); g.beginPath(); g.moveTo(32, 14); g.lineTo(46, 0); g.lineTo(60, 14); g.closePath(); g.fill();
  g.fillStyle = d('#463238'); g.beginPath(); g.moveTo(34, 14); g.lineTo(46, 2); g.lineTo(46, 14); g.closePath(); g.fill();
  box(g, 46, 0, 1, 2, d('#1A1A1E'));
  // (the face: its rim, the hour ticks; lit from behind after dark)
  ball(g, 46, 22, 7, '#2A2420');
  ball(g, 46, 22, 6, lit ? '#FDE68A' : d('#E0D6BC'), false);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, 46 + Math.cos(a) * 5 - 0.5, 22 + Math.sin(a) * 5 - 0.5, 1, 1, '#3A3028'); }
  if (lit) { box(g, 42, 42, 3, 5, '#C89A3A'); box(g, 48, 42, 3, 5, '#C89A3A'); }
};
const paintHell = (g: Ctx) => {
  // (the cavern: dark red banded down to the glow; the rock hanging off the top; the far spires; the gate's arch; the
  // lava's crust along the bottom, the flames live over it)
  const band = ['#1E0404', '#2E0808', '#450C0A', '#5E140E', '#7A1E10'];
  band.forEach((col, k) => { box(g, 0, k * 12, SCR_W, 12, col); if (k) checker(g, 0, k * 12, SCR_W, 2, band[k - 1]); });
  g.fillStyle = '#120202';
  for (let k = 0; k < 8; k++) { const x = k * 12 + (k % 2) * 3; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 6, 6 + (k % 3) * 4); g.lineTo(x + 11, 0); g.closePath(); g.fill(); }
  g.fillStyle = '#2A0606';
  for (const [x, h] of [[4, 22], [18, 14], [70, 26], [84, 16]] as const) { g.beginPath(); g.moveTo(x - 6, 50); g.lineTo(x, 50 - h); g.lineTo(x + 6, 50); g.closePath(); g.fill(); }
  box(g, 30, 22, 32, 28, '#2A0606'); box(g, 34, 26, 24, 24, '#0E0202');
  g.fillStyle = '#2A0606'; g.beginPath(); g.moveTo(30, 23); g.quadraticCurveTo(46, 12, 62, 23); g.closePath(); g.fill();
  for (let x = 36; x < 58; x += 4) box(g, x, 26, 1, 24, '#3A1010');
  box(g, 0, SCR_H - 8, SCR_W, 8, '#7C2D12'); checker(g, 0, SCR_H - 9, SCR_W, 2, '#5E140E');
};
const paintBallroom = (g: Ctx) => {
  // (the wall: purple banded; two tall arched windows (the night out of them); swagged red curtains; the floor going
  // back under the tiles (they're live))
  const band = ['#1E0B44', '#2E1065', '#3B1580', '#4C1D95'];
  band.forEach((col, k) => { box(g, 0, k * 11, SCR_W, 12, col); if (k) checker(g, 0, k * 11, SCR_W, 2, band[k - 1]); });
  for (const wx of [16, 62]) {
    g.fillStyle = '#C9A227'; g.beginPath(); g.moveTo(wx - 1, 40); g.lineTo(wx - 1, 14); g.quadraticCurveTo(wx + 7, 4, wx + 15, 14); g.lineTo(wx + 15, 40); g.closePath(); g.fill();
    g.fillStyle = '#0E1430'; g.beginPath(); g.moveTo(wx + 1, 40); g.lineTo(wx + 1, 15); g.quadraticCurveTo(wx + 7, 7, wx + 13, 15); g.lineTo(wx + 13, 40); g.closePath(); g.fill();
    box(g, wx + 6, 9, 2, 31, '#C9A227'); box(g, wx + 1, 26, 12, 1, '#C9A227');
    box(g, wx + 9, 14, 1, 1, '#C8CCE0'); box(g, wx + 3, 30, 1, 1, '#C8CCE0');
  }
  for (const [x, s] of [[0, 1], [SCR_W, -1]] as const) {
    g.fillStyle = '#7F1D1D'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + s * 14, 0); g.quadraticCurveTo(x + s * 6, 20, x + s * 9, 44); g.lineTo(x, 44); g.closePath(); g.fill();
    for (let k = 1; k < 3; k++) box(g, x + s * (k * 4) - (s < 0 ? 1 : 0), 2, 1, 40, '#5C0E0E');
    box(g, x + s * 2 - (s < 0 ? 2 : 0), 0, 2, 44, '#A12A2A');
  }
  box(g, 0, 0, SCR_W, 3, '#5C0E0E'); checker(g, 0, 3, SCR_W, 2, '#7F1D1D');
  box(g, 0, 44, SCR_W, SCR_H - 44, '#160A26');
  box(g, 45, 0, 1, 12, '#A1A1AA');
};
const paintShop = (g: Ctx) => {
  // (the wall red, banded; the shelves of tees (stepped, the horns on the hooks); the counter in front, the register on
  // it; the clerk in horns asleep on his arms across it)
  const band = ['#3B0A0A', '#4A0E0E', '#5B1414'];
  band.forEach((col, k) => { box(g, 0, k * 14, SCR_W, 15, col); if (k) checker(g, 0, k * 14, SCR_W, 2, band[k - 1]); });
  box(g, 0, 42, SCR_W, SCR_H - 42, '#3A0A0A'); checker(g, 0, 42, SCR_W, 2, '#5B1414');
  for (const sy of [18, 38]) { box(g, 2, sy, 50, 2, '#6B4423'); box(g, 2, sy, 50, 1, '#8A5A2E'); }
  for (let k = 0; k < 5; k++) {
    const tx = 4 + k * 10, col = ['#DC2626', '#18181B', '#F8FAFC', '#7C3AED', '#18181B'][k], r = rampOf(col);
    box(g, tx, 24, 8, 13, col); box(g, tx - 2, 24, 12, 4, col); box(g, tx, 24, 2, 13, r[3]); box(g, tx + 6, 24, 2, 13, r[1]);
    box(g, tx + 3, 24, 2, 1, INK);
  }
  for (let k = 0; k < 4; k++) { const hx = 6 + k * 12; box(g, hx, 12, 2, 6, '#DC2626'); box(g, hx + 6, 12, 2, 6, '#DC2626'); box(g, hx + 2, 16, 4, 2, '#991B1B'); }
  // (the counter)
  box(g, 46, 40, SCR_W - 46, SCR_H - 40, '#5C3317'); box(g, 46, 40, SCR_W - 46, 2, '#8A5A2E'); box(g, 46, 42, 2, SCR_H - 42, '#7A4A22');
  for (let y = 46; y < SCR_H; y += 5) box(g, 48, y, SCR_W - 48, 1, '#4A2810');
  box(g, 78, 30, 12, 10, '#3F3F46'); box(g, 78, 30, 12, 2, '#71717A'); box(g, 80, 32, 8, 3, '#0A2A10'); box(g, 81, 33, 5, 1, '#4ADE80');
  // (the clerk: his arms folded on the counter, his head down on them, the horns up off it, a staff tee)
  box(g, 52, 34, 22, 7, '#5B21B6'); box(g, 52, 34, 22, 2, '#7C3AED');
  box(g, 54, 37, 18, 4, '#E8B48A'); box(g, 54, 37, 18, 1, '#F5C9A4');
  ball(g, 62, 31, 6, '#3A2618', false); box(g, 57, 31, 10, 4, '#E8B48A'); box(g, 59, 33, 2, 1, INK); box(g, 63, 33, 2, 1, INK);
  box(g, 56, 22, 2, 5, '#DC2626'); box(g, 66, 22, 2, 5, '#DC2626'); box(g, 55, 26, 3, 1, '#991B1B'); box(g, 66, 26, 3, 1, '#991B1B');
  box(g, 60, 36, 3, 2, '#9CC4E0');
};

/** The still part of feed i (its key changes with the hour for the outdoor ones). */
const feedStill = (c: Ctx, i: number, tod: Tod) => {
  const key = i <= 2 ? `ctl-feed-${i}-${tod.key}` : `ctl-feed-${i}`;
  stamp(c, key, 0, 0, SCR_W, SCR_H, g => {
    g.save(); g.beginPath(); g.rect(0, 0, SCR_W, SCR_H); g.clip();
    [paintTown, paintCastle, paintTower][i]?.(g, tod);
    if (i === 3) paintHell(g); else if (i === 4) paintBallroom(g); else if (i === 5) paintShop(g);
    g.restore();
    osdText(g, `CAM ${i + 1}`, 4, 4);
  });
};

/** What moves in feed i (drawn live at its top left): the windows, a walker, a bat, the hands, the flames and the damned,
 *  the floor and the ghosts dancing, the clerk's Z's. */
const feedLive = (c: Ctx, i: number, f: number, tod: Tod) => {
  const lit = litAt(tod), d = (col: string) => dayOf(col, tod);
  if (i === 0) {
    if (lit) for (let k = 0; k < 4; k++) {
      const hx = 3 + k * 22, top = 30 + (k % 2) * 3, on = (k + Math.floor(f / 50)) % 5;
      box(c, hx + 2, top + 4, 4, 4, on ? '#FDE68A' : '#A16207'); box(c, hx + 12, top + 4, 4, 4, (on + 2) % 5 ? '#F5D06A' : '#8A5A10');
    }
    // (a guest crossing the square, legs going)
    const wx = ((f * 0.22) % (SCR_W + 16)) - 8, step = Math.floor(f / 10) % 2;
    box(c, wx, 45, 3, 3, d('#2563EB')); box(c, wx, 43, 3, 2, d('#E8B48A'));
    box(c, wx + (step ? 0 : 1), 48, 1, 2, d('#1F2937')); box(c, wx + (step ? 2 : 1), 48, 1, 2, d('#1F2937'));
  } else if (i === 1) {
    if (lit) for (const [x, y] of [[11, 30], [75, 30], [30, 30], [60, 30]] as const) box(c, x, y, 3, 4, Math.floor(f / 8 + x) % 3 ? '#F59E0B' : '#FDE68A');
    // (a bat going over, flapping)
    const bx = ((f * 0.5 + 40) % 150) - 20, by = 8 + Math.sin(f * 0.07) * 3, up = Math.floor(f / 6) % 2;
    box(c, bx, by, 2, 2, '#0A0A0C');
    box(c, bx - 3, by + (up ? -1 : 1), 3, 1, '#0A0A0C'); box(c, bx + 2, by + (up ? -1 : 1), 3, 1, '#0A0A0C');
  } else if (i === 2) {
    // (the hands: the feed's own clock, near enough)
    const { min, hr } = clockAt(f), am = (min / 60) * Math.PI * 2 - Math.PI / 2, ah = ((hr + min / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    c.strokeStyle = '#1A1410'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(46.5, 22.5); c.lineTo(46.5 + Math.cos(am) * 5, 22.5 + Math.sin(am) * 5); c.moveTo(46.5, 22.5); c.lineTo(46.5 + Math.cos(ah) * 3, 22.5 + Math.sin(ah) * 3); c.stroke();
  } else if (i === 3) {
    // (the fire along the bottom, stepped, flickering)
    for (let k = 0; k < 7; k++) {
      const h = 10 + ((k * 7 + Math.floor(f / 6)) % 5) * 3, x = 1 + k * 13;
      box(c, x, SCR_H - h, 11, h, '#B91C1C'); box(c, x + 2, SCR_H - h + 3, 7, h - 3, '#F97316'); box(c, x + 4, SCR_H - h + 7, 3, h - 7, '#FDE047');
    }
    // (a guest down in it: shirt, arms up and going, mouth wide; a pitchfork up into his seat now and again)
    const bob = Math.round(Math.sin(f * 0.25) * 2), gx = 44, gy = 36 + bob, wave = Math.floor(f / 5) % 2;
    box(c, gx, gy + 6, 8, 9, '#0EA5E9'); box(c, gx, gy + 6, 8, 2, '#38BDF8');
    box(c, gx + 1, gy, 6, 6, '#E8B48A'); box(c, gx + 1, gy, 6, 1, '#6B3A12');
    box(c, gx + 2, gy + 2, 1, 1, INK); box(c, gx + 5, gy + 2, 1, 1, INK); box(c, gx + 3, gy + 3, 2, 3, '#3A0A0A');
    box(c, gx - 3, gy - 1 + (wave ? 0 : 2), 2, 8, '#E8B48A'); box(c, gx + 9, gy - 1 + (wave ? 2 : 0), 2, 8, '#E8B48A');
    if (wave) { box(c, gx - 5, gy - 4, 1, 2, '#FDE68A'); box(c, gx + 12, gy - 4, 1, 2, '#FDE68A'); box(c, gx + 3, gy - 5, 1, 2, '#FDE68A'); }
    const poke = f % 150;
    if (poke < 30) {
      const up = poke < 8 ? poke : poke < 22 ? 8 : 30 - poke, fy = SCR_H - up * 2;
      box(c, gx + 3, fy - 1, 1, 22, '#52525B'); box(c, gx + 1, fy - 1, 5, 1, '#71717A');
      for (const tx of [gx + 1, gx + 3, gx + 5]) box(c, tx, fy - 4, 1, 3, '#A1A1AA');
    }
    for (let k = 0; k < 4; k++) { const ey = SCR_H - ((f * 0.6 + k * 17) % 50); box(c, 8 + k * 23 + Math.round(Math.sin(f * 0.1 + k) * 2), ey, 1, 1, '#FDBA74'); }
  } else if (i === 4) {
    // (the disco ball turning: its glints walking round; the dance floor going round its colors; two ghosts at it)
    ball(c, 46, 17, 6, '#A1A1AA', false);
    for (let k = 0; k < 3; k++) { const a = f * 0.05 + k * 2.1; if (Math.cos(a) > 0) box(c, 46 + Math.sin(a) * 4, 15 + k * 2, 1, 1, '#FFFFFF'); }
    const t = Math.floor(f / 20), floor = ['#F472B6', '#60A5FA', '#FDE047', '#4ADE80'];
    for (let k = 0; k < 8; k++) box(c, 2 + k * 11, 46, 10, 5, floor[(k + t) % 4]);
    for (let k = 0; k < 6; k++) box(c, k * 16, 52, 15, 8, floor[(k + t + 1) % 4]);
    for (const [gx0, ph] of [[30, 0], [56, 1.6]] as const) {
      const gx = gx0 + Math.round(Math.sin(f * 0.06 + ph) * 3), gy = 30 + Math.round(Math.abs(Math.sin(f * 0.12 + ph)) * -2);
      box(c, gx, gy, 7, 10, '#DCE4F5'); box(c, gx + 1, gy - 2, 5, 2, '#DCE4F5'); box(c, gx, gy, 2, 10, '#F4F7FF');
      box(c, gx + (Math.floor(f / 8) % 2), gy + 10, 2, 2, '#DCE4F5'); box(c, gx + 4 + (Math.floor(f / 8) % 2), gy + 10, 2, 2, '#DCE4F5');
      box(c, gx + 2, gy + 1, 1, 2, INK); box(c, gx + 4, gy + 1, 1, 2, INK);
    }
  } else {
    // (the clerk's Z's, drifting up off him)
    for (let k = 0; k < 2; k++) {
      const t = (f + k * 60) % 120, zx = 66 + Math.round(t / 14) + k * 2, zy = 26 - Math.round(t / 8);
      if (zy < 2) continue;
      box(c, zx, zy, 3, 1, '#E8ECEF'); box(c, zx + 1, zy + 1, 1, 1, '#E8ECEF'); box(c, zx, zy + 2, 3, 1, '#E8ECEF');
    }
  }
};

/** A dead feed: snow (four frames of it, painted the once, the screens out of step). */
const snow = (c: Ctx, i: number, f: number) => {
  const k = (Math.floor(f / 3) + i) % 4;
  stamp(c, `ctl-snow-${k}`, 0, 0, SCR_W, SCR_H, g => {
    box(g, 0, 0, SCR_W, SCR_H, '#2A2A2E');
    for (let n = 0; n < 420; n++) {
      const h = hash(n * 1.37 + k * 91.7), x = Math.floor(hash(n * 7.1 + k * 3.3) * SCR_W), y = Math.floor(hash(n * 3.9 + k * 11.1) * SCR_H);
      box(g, x, y, h < 0.5 ? 1 : 2, 1, h < 0.35 ? '#D4D4D8' : h < 0.7 ? '#71717A' : '#18181B');
    }
  });
};

/** The glass over each picture: the tube's green-gray cast, the scanlines, its corners rounded off under the bezel, the
 *  edges going dark (a stepped vignette), the curve of it catching the bulb top left. */
const glass = (c: Ctx) => stamp(c, 'ctl-glass', 0, 0, SCR_W, SCR_H, g => {
  box(g, 0, 0, SCR_W, SCR_H, 'rgba(40, 90, 70, 0.10)');
  for (let y = 1; y < SCR_H; y += 2) box(g, 0, y, SCR_W, 1, 'rgba(0, 0, 0, 0.22)');
  for (let k = 0; k < 3; k++) {
    const a = `rgba(0, 0, 0, ${0.22 - k * 0.07})`, e = k * 2;
    box(g, e, e, SCR_W - e * 2, 2, a); box(g, e, SCR_H - e - 2, SCR_W - e * 2, 2, a);
    box(g, e, e + 2, 2, SCR_H - e * 2 - 4, a); box(g, SCR_W - e - 2, e + 2, 2, SCR_H - e * 2 - 4, a);
  }
  // (the corners: the tube's round under the square bezel)
  for (const [cx, sx] of [[0, 1], [SCR_W, -1]] as const) for (const [cy, sy] of [[0, 1], [SCR_H, -1]] as const) {
    for (const [dx, dy, w, h] of [[0, 0, 4, 1], [0, 1, 2, 1], [0, 2, 1, 2]] as const) box(g, sx > 0 ? cx + dx : cx - dx - w, sy > 0 ? cy + dy : cy - dy - h, w, h, '#0B0D0E');
  }
  // (the glare: a stepped curve of light in the top left, a fleck bottom right)
  box(g, 6, 3, 18, 1, 'rgba(255, 255, 255, 0.20)'); box(g, 4, 4, 6, 1, 'rgba(255, 255, 255, 0.16)'); box(g, 3, 5, 2, 8, 'rgba(255, 255, 255, 0.14)');
  box(g, 24, 3, 8, 1, 'rgba(255, 255, 255, 0.08)'); box(g, 3, 13, 1, 6, 'rgba(255, 255, 255, 0.07)');
  box(g, SCR_W - 9, SCR_H - 7, 4, 1, 'rgba(255, 255, 255, 0.10)');
});

/** Feed i on its screen: the picture (or snow), what moves in it, the roll bar, the odd flicker and tear, the clock and the
 *  REC lamp, the glass. */
const feed = (c: Ctx, i: number, f: number, dead: boolean) => {
  const [mx, my] = screenAt(i), tod = timeOfDay();
  c.save(); c.translate(mx, my);
  if (dead) snow(c, i, f);
  else { feedStill(c, i, tod); feedLive(c, i, f, tod); }
  // (the roll bar going down it, each its own speed)
  const ry = Math.round((f * (0.5 + i * 0.09) + i * 23) % (SCR_H + 24)) - 12;
  box(c, 0, ry, SCR_W, 3, 'rgba(255, 255, 255, 0.06)'); box(c, 0, ry + 3, SCR_W, 2, 'rgba(0, 0, 0, 0.12)');
  // (now and then one picture tears: a few lines of it smeared sideways for a moment; a flicker)
  const slot = Math.floor(f / 200);
  if (!dead && Math.floor(hash(slot * 3.7) * 6) === i && f % 200 < 8) {
    for (let k = 0; k < 3; k++) { const ty = Math.floor(hash(f * 0.37 + k) * (SCR_H - 2)); box(c, 0, ty, SCR_W, 1, 'rgba(220, 230, 240, 0.35)'); box(c, Math.floor(hash(f + k * 5) * 60), ty + 1, 30, 1, 'rgba(0, 0, 0, 0.5)'); }
  }
  if (hash(Math.floor(f / 4) * 1.3 + i * 17.1) > 0.96) box(c, 0, 0, SCR_W, SCR_H, 'rgba(220, 240, 230, 0.06)');
  if (!dead) {
    const { hm, s } = clockAt(f);
    osd(c, hm, SCR_W - 37, SCR_H - 8); osd(c, s, SCR_W - 13, SCR_H - 8);
    if (Math.floor(f / 30) % 2) { box(c, SCR_W - 21, 4, 5, 5, '#7F1D1D'); box(c, SCR_W - 20, 5, 3, 3, '#EF4444'); }
    osd(c, 'REC', SCR_W - 15, 4);
  }
  glass(c);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The park's own cameras, in here too (wall units): a housing on a bracket up under the conduit, panning in steps, the red
// tally lamp on it lit while it's recording. One by the clock looking at the desk, one at the far end of the rack.

/** A camera on its bracket (the bracket's foot on the wall at 0, 0, the head out to the right), at pan step `p` (0 turned
 *  most toward the room, 2 side on). */
const paintCctv = (g: Ctx, p: number) => {
  slab(g, -5, -8, 10, 16, '#6B7078', { edge: 2 });
  box(g, -3, -5, 2, 2, '#2F343B'); box(g, -3, 3, 2, 2, '#2F343B');
  pole(g, 4, -2, 10, 4, '#8A9098');
  box(g, 12, -4, 5, 8, '#3F444C');
  const L = [20, 25, 30][p], drop = [7, 5, 3][p];
  // (the housing: off-white, tipped down at the room; the sun hood over it; the lens at its business end)
  inked(g, () => { g.moveTo(14, -10); g.lineTo(14 + L, -10 + drop); g.lineTo(14 + L, -1 + drop); g.lineTo(14, 0); g.closePath(); }, '#D6D3C8', 2);
  box(g, 15, -9, L - 2, 2, '#ECEAE2'); box(g, 15, -3 + Math.round(drop / 2), L - 2, 2, '#A8A498');
  inked(g, () => { g.moveTo(12, -13); g.lineTo(18 + L, -13 + drop); g.lineTo(18 + L, -10 + drop); g.lineTo(12, -10); g.closePath(); }, '#B8B4A8', 1);
  const lx = 14 + L, ly = -5 + drop, lr = [5, 4, 3][p];
  inked(g, () => g.ellipse(lx, ly, Math.max(2, lr - 1), lr, 0, 0, Math.PI * 2), '#1A1C20', 1);
  box(g, lx - 1, ly - 2, 1, 2, '#7DB7E8'); box(g, lx, ly - 1, 1, 1, '#C8E0F5');
  // (the cable off the back, looped down into the conduit)
  g.strokeStyle = '#141416'; g.lineWidth = 2; g.beginPath(); g.moveTo(14, -2); g.quadraticCurveTo(6, 14, 0, -28); g.stroke();
};
const CCTV: { x: number; y: number; dir: 1 | -1; ph: number }[] = [
  { x: x0 + 246, y: GY - 486, dir: 1, ph: 0 },
  { x: BANK_R + 8, y: GY - 486, dir: -1, ph: 300 },
];
const cctv = (c: Ctx, f: number) => {
  for (const cam of CCTV) {
    // (the pan: a slow back-and-forth in three steps, holding at each end)
    const t = ((f + cam.ph) % 720) / 720, s = Math.sin(t * Math.PI * 2), p = s > 0.45 ? 2 : s < -0.45 ? 0 : 1;
    c.save(); c.translate(cam.x, cam.y); c.scale(cam.dir, 1);
    stamp(c, `ctl-cctv-${p}`, -8, -32, 60, 56, g => paintCctv(g, p));
    // (the tally: red, blinking while it records)
    const on = Math.floor(f / 40) % 2 === 0;
    box(c, 16, -8, 3, 3, INK); box(c, 17, -7, 2, 2, on ? '#EF4444' : '#4A1414');
    c.restore();
  }
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

// ---------------------------------------------------------------------------------------------------------------
// His nest (his sin's gluttony): the junk food he lives on, all over the room

/** A blood bag (its top left at x, y): a slumped plastic pouch, dark red, stepped; its label; the port up top; a bendy
 *  straw stuck in it if `straw`. */
const bloodBag = (g: Ctx, x: number, y: number, h: number, straw: boolean) => {
  const sag = Math.round(h * 2);
  inked(g, () => { g.moveTo(x + 1, y + 2); g.lineTo(x + 9, y + 2); g.quadraticCurveTo(x + 11, y + 10 + sag, x + 8, y + 15); g.lineTo(x + 2, y + 15); g.quadraticCurveTo(x - 1, y + 10 + sag, x + 1, y + 2); g.closePath(); }, '#8E1414', 1);
  box(g, x + 1, y + 3, 2, 10, '#B91C1C'); box(g, x + 7, y + 5, 2, 9, '#5C0A0A');
  box(g, x + 2, y + 6, 6, 4, '#F1EFEA'); box(g, x + 2, y + 6, 6, 1, '#DC2626'); box(g, x + 3, y + 8, 3, 1, '#9CA3AF');
  box(g, x + 4, y, 2, 3, '#D6D3D1');
  if (straw) { box(g, x + 5, y - 9, 2, 10, '#F1EFEA'); box(g, x + 5, y - 9, 6, 2, '#F1EFEA'); box(g, x + 6, y - 6, 1, 6, '#F472B6'); box(g, x + 7, y - 9, 3, 1, '#F472B6'); }
};
/** A two-liter, empty (feet at x, y; on its side if `lying`): green-tinted plastic, its red label, the cap, a brown
 *  dreg in the bottom. */
const twoLiter = (g: Ctx, x: number, y: number, lying = false, cap = '#DC2626') => {
  g.save(); g.translate(x, y); if (lying) g.rotate(-Math.PI / 2);
  inked(g, () => { g.moveTo(-5, 0); g.lineTo(-5, -20); g.quadraticCurveTo(-5, -25, -2, -27); g.lineTo(-2, -30); g.lineTo(2, -30); g.lineTo(2, -27); g.quadraticCurveTo(5, -25, 5, -20); g.lineTo(5, 0); g.closePath(); }, '#7FA894', 1);
  box(g, -4, -20, 2, 19, '#B8D8C6'); box(g, 3, -20, 2, 19, '#5E8070');
  box(g, -5, -15, 10, 7, cap); box(g, -5, -15, 10, 1, '#FCA5A5'); box(g, -3, -12, 6, 1, '#F8FAFC');
  box(g, -3, -3, 6, 2, '#6B3A12');
  box(g, -3, -33, 6, 4, cap); box(g, -3, -33, 6, 1, '#FCA5A5');
  g.restore();
};
/** A ketchup packet (its middle at x, y), torn open and squeezed out if `squeezed`: a smear of it trailing off. */
const packet = (g: Ctx, x: number, y: number, rot = 0, squeezed = false) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  box(g, -5, -3, 10, 6, INK); box(g, -4, -2, 8, 4, '#DC2626'); box(g, -4, -2, 8, 1, '#F87171'); box(g, 2, -2, 2, 4, '#F8FAFC');
  if (squeezed) { box(g, -10, 0, 6, 2, '#B91C1C'); box(g, -13, 1, 4, 1, '#991B1B'); box(g, -4, -2, 4, 2, '#7F1D1D'); }
  g.restore();
};
/** A chicken bone, picked clean (its middle at x, y). */
const bone = (g: Ctx, x: number, y: number, rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  box(g, -5, -2, 10, 4, INK); box(g, -4, -1, 8, 2, '#EDE3C8'); box(g, -4, -1, 8, 1, '#FFFBEB');
  for (const s of [-1, 1]) { box(g, s * 5 - 2, -3, 4, 6, INK); box(g, s * 5 - 1, -2, 2, 4, '#EDE3C8'); }
  g.restore();
};
/** The family bucket of chicken (feet at x, y): a red-and-white striped tub, the cartoon chicken on it, its lid off, the
 *  drumsticks heaped up out of the top (half of them already bones). */
const familyBucket = (g: Ctx, x: number, y: number) => {
  const top = y - 34;
  const tub = () => { g.moveTo(x - 14, y); g.lineTo(x - 18, top); g.lineTo(x + 18, top); g.lineTo(x + 14, y); g.closePath(); };
  // (the heap first, behind its rim: fried drumsticks, a couple picked to the bone)
  for (const [dx, dy, r, picked] of [[-10, -3, -0.5, false], [-2, -6, -0.1, true], [6, -4, 0.4, false], [12, -2, 0.8, true], [2, -1, 0.15, false]] as const) {
    g.save(); g.translate(x + dx, top + dy); g.rotate(r);
    if (picked) { box(g, -2, -12, 4, 14, INK); box(g, -1, -11, 2, 12, '#EDE3C8'); box(g, -3, -14, 6, 4, INK); box(g, -2, -13, 4, 2, '#EDE3C8'); }
    else {
      inked(g, () => g.ellipse(0, -7, 6, 8, 0, 0, Math.PI * 2), '#C47A22', 2);
      box(g, -4, -12, 3, 8, '#E09A3A'); box(g, 2, -8, 3, 6, '#8A4A10');
      for (const [cx, cy] of [[-2, -9], [1, -5], [-3, -4], [2, -11]]) box(g, cx, cy, 2, 1, '#F6C877');
      box(g, -1, 0, 3, 4, '#EDE3C8');
    }
    g.restore();
  }
  // (the tub: the stripes, darker round to the right; the rim)
  inked(g, tub, '#F1EFEA', 2);
  g.save(); g.beginPath(); tub(); g.clip();
  for (let k = -3; k <= 3; k++) { g.fillStyle = '#C42A22'; g.beginPath(); g.moveTo(x + k * 6 - 2, y); g.lineTo(x + k * 7.6 - 2.4, top); g.lineTo(x + k * 7.6 + 1.4, top); g.lineTo(x + k * 6 + 1, y); g.closePath(); g.fill(); }
  box(g, x + 8, top, 12, 34, 'rgba(40, 10, 10, 0.25)'); box(g, x - 18, top, 5, 34, 'rgba(255, 255, 255, 0.18)');
  g.restore();
  box(g, x - 19, top - 2, 38, 4, INK); box(g, x - 18, top - 1, 36, 2, '#E7E5E4');
  // (the chicken: a white head in a yellow ring, a red comb, the beak)
  ball(g, x, y - 17, 8, '#FACC15'); ball(g, x, y - 17, 6, '#F8FAFC', false);
  box(g, x - 2, y - 25, 4, 3, '#DC2626'); box(g, x + 3, y - 18, 4, 2, '#F59E0B'); box(g, x + 1, y - 20, 2, 2, INK);
  // (a grease stain soaked through the cardboard)
  box(g, x - 12, y - 8, 6, 4, 'rgba(160, 110, 40, 0.35)');
};

const paintFridge = (g: Ctx) => {
  // (the mini fridge: a glass-door cooler of blood bags (a bendy straw stuck in one), the takeout menu on its door under
  // a magnet; a microwave on it, a coffee maker on that; the pizza boxes stacked beside, the top one open, crusts in it)
  const fx = x0 - 6;
  slab(g, fx, GY - 80, 60, 80, '#D9D5CB', { edge: 4 });
  // (the glass door: dark in its frame, the light on inside up top, wire shelves, the bags slumped on them)
  box(g, fx + 5, GY - 74, 40, 66, INK); box(g, fx + 6, GY - 73, 38, 64, '#2A1418');
  box(g, fx + 6, GY - 73, 38, 3, '#F5E6E6'); checker(g, fx + 6, GY - 70, 38, 2, '#8A6A6A');
  for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) {
    if (row === 2 && k === 2) continue;   // (one gone: in him)
    bloodBag(g, fx + 8 + k * 12, GY - 68 + row * 20, hash(row * 3.1 + k * 1.7), row === 1 && k === 0);
  }
  for (const sy of [GY - 52, GY - 32]) { box(g, fx + 6, sy, 38, 2, '#9CA3AF'); box(g, fx + 6, sy + 2, 38, 1, '#3F3F46'); }
  box(g, fx + 9, GY - 72, 2, 62, 'rgba(255, 255, 255, 0.12)'); box(g, fx + 13, GY - 72, 1, 62, 'rgba(255, 255, 255, 0.08)');
  box(g, fx + 49, GY - 66, 4, 30, '#8E8A80'); box(g, fx + 49, GY - 66, 1, 30, '#F1EFEA');
  // (the takeout menu: folded in three, its red header, the columns of dishes, one circled twice, the price in marker)
  const mx = fx + 24, my = GY - 78;
  slab(g, mx, my, 24, 34, '#F8F4E8', { edge: 1 });
  box(g, mx + 8, my + 2, 1, 30, '#D6D0BC'); box(g, mx + 16, my + 2, 1, 30, '#D6D0BC');
  box(g, mx + 2, my + 3, 20, 7, '#B91C1C'); signAt(g, 'MENU', mx + 12, my + 9, 6, print(6, '#FEF2F2'));
  for (let r = 0; r < 6; r++) for (let k = 0; k < 3; k++) box(g, mx + 2 + k * 8, my + 13 + r * 3, 4 + ((r + k) % 2), 1, '#8A8478');
  g.strokeStyle = '#DC2626'; g.lineWidth = 1; g.beginPath(); g.ellipse(mx + 13, my + 20, 6, 3, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(mx + 13, my + 20, 7, 3.6, 0.1, 0, Math.PI * 2); g.stroke();
  // (the magnet holding it: a little plastic pizza slice)
  inked(g, () => { g.moveTo(mx + 8, my - 3); g.lineTo(mx + 16, my - 3); g.lineTo(mx + 12, my + 5); g.closePath(); }, '#F59E0B', 1);
  box(g, mx + 10, my - 2, 2, 2, '#DC2626'); box(g, mx + 13, my - 1, 2, 2, '#DC2626');
  // (on top: the microwave, the coffee maker)
  slab(g, fx + 3, GY - 112, 54, 32, '#2A2A2E', { edge: 2 });
  box(g, fx + 7, GY - 108, 34, 24, '#141416'); box(g, fx + 9, GY - 106, 30, 2, '#3A3A40');
  box(g, fx + 45, GY - 106, 8, 4, '#22C55E'); for (let i = 0; i < 6; i++) box(g, fx + 45 + (i % 2) * 5, GY - 99 + Math.floor(i / 2) * 5, 3, 3, '#52525B');
  // (something exploded in it: red up the inside of the glass)
  box(g, fx + 11, GY - 100, 12, 8, 'rgba(185, 28, 28, 0.5)'); box(g, fx + 25, GY - 96, 8, 6, 'rgba(185, 28, 28, 0.35)');
  slab(g, fx + 13, GY - 140, 24, 28, '#1F1F22', { edge: 2 });
  box(g, fx + 16, GY - 128, 18, 14, '#3F2A1C'); box(g, fx + 16, GY - 128, 18, 4, '#6B4A30');
  // (the pizza boxes: nine high, crooked, grease through the cardboard; the top one open, its lid up, the crusts in it)
  for (let i = 0; i < 9; i++) {
    const w = 64, y = GY - 9 - i * 9, dx = (hash(i * 3.3) - 0.5) * 8;
    slab(g, fx + 66 + dx, y, w, 9, i % 3 === 1 ? '#BE9460' : '#C9A06A', { edge: 2 });
    box(g, fx + 66 + dx + 24, y + 3, 16, 3, '#B91C1C');
    if (hash(i * 7.7) < 0.5) box(g, fx + 70 + dx + hash(i) * 30, y + 2, 6, 4, 'rgba(120, 70, 20, 0.35)');
  }
  const tx = fx + 66 + (hash(8 * 3.3) - 0.5) * 8, ty = GY - 9 - 8 * 9;
  inked(g, () => { g.moveTo(tx + 2, ty); g.lineTo(tx + 6, ty - 42); g.lineTo(tx + 60, ty - 42); g.lineTo(tx + 62, ty); g.closePath(); }, '#E2C895', 2);
  box(g, tx + 14, ty - 34, 12, 8, 'rgba(150, 90, 30, 0.35)'); box(g, tx + 36, ty - 20, 10, 10, 'rgba(150, 90, 30, 0.3)'); box(g, tx + 26, ty - 12, 6, 4, 'rgba(150, 90, 30, 0.4)');
  for (const [cx, w] of [[tx + 10, 14], [tx + 30, 10], [tx + 46, 12]] as const) { inked(g, () => g.ellipse(cx + w / 2, ty - 1, w / 2, 3, 0, Math.PI, Math.PI * 2), '#D6A048', 1); box(g, cx + 2, ty - 3, w - 4, 1, '#F0C878'); }
};

/** Against the wall by the fridge (wall units): soda cases, the family bucket up on them, the recycling bin gone over
 *  with empty two-liters, one more on the floor. */
const paintNestBack = (g: Ctx) => {
  const bx = x0 + 150;
  for (let k = 0; k < 2; k++) {
    const y = GY - 18 - k * 18, dx = k * 3;
    slab(g, bx + dx, y, 46, 18, '#B91C1C', { edge: 2 });
    g.strokeStyle = '#F8FAFC'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx + dx + 4, y + 12); g.quadraticCurveTo(bx + dx + 20, y + 2, bx + dx + 42, y + 10); g.stroke();
    box(g, bx + dx + 30, y + 3, 10, 4, '#7F1D1D');
  }
  familyBucket(g, bx + 26, GY - 36);
  bone(g, bx + 62, GY - 3, 0.3); bone(g, bx - 8, GY - 2, -0.2);
  // (the recycling bin: blue, its arrows; two-liters jutting out of the top of it)
  const rx = x0 + 214;
  for (const [dx, r] of [[-8, -0.35], [2, 0.1], [11, 0.45]] as const) { g.save(); g.translate(rx + 20 + dx, GY - 30); g.rotate(r); twoLiter(g, 0, 0, false, dx > 0 ? '#16A34A' : '#DC2626'); g.restore(); }
  slab(g, rx, GY - 40, 40, 40, '#2563EB', { edge: 3 });
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 - Math.PI / 2, ax = rx + 20 + Math.cos(a) * 7, ay = GY - 20 + Math.sin(a) * 7; box(g, ax - 2, ay - 2, 4, 4, '#E0F2FE'); }
  twoLiter(g, x0 + 292, GY - 5, true);
  packet(g, x0 + 140, GY - 3, 0.2, true);
};

/** At his plane, round his chair: an open pizza box on the floor, its last slice; bones; ketchup packets everywhere; a
 *  two-liter rolled under the chair, another stood by the desk. (Low: nothing to stand on.) */
const paintNest = (g: Ctx) => {
  const px = x0 + 266;
  // (the box: its base on the floor, the lid up behind it, grease all over the inside of the lid)
  inked(g, () => { g.moveTo(px, GY - 6); g.lineTo(px + 4, GY - 44); g.lineTo(px + 40, GY - 44); g.lineTo(px + 42, GY - 6); g.closePath(); }, '#E2C895', 2);
  box(g, px + 10, GY - 36, 10, 8, 'rgba(150, 90, 30, 0.35)'); box(g, px + 24, GY - 22, 10, 9, 'rgba(150, 90, 30, 0.3)');
  box(g, px + 6, GY - 42, 30, 2, '#F0DCAE');
  // (the last slice, cold, and the crusts)
  inked(g, () => { g.moveTo(px + 6, GY - 7); g.lineTo(px + 26, GY - 12); g.lineTo(px + 24, GY - 6); g.closePath(); }, '#F0B848', 1);
  box(g, px + 22, GY - 12, 4, 6, '#C88A30');
  for (const [cx, cy] of [[px + 12, GY - 8], [px + 18, GY - 9]]) box(g, cx, cy, 3, 2, '#B91C1C');
  inked(g, () => g.ellipse(px + 33, GY - 7, 6, 2, 0, Math.PI, Math.PI * 2), '#D6A048', 1);
  slab(g, px - 2, GY - 6, 46, 6, '#C9A06A', { edge: 2 }); box(g, px + 14, GY - 4, 14, 2, '#B91C1C');
  // (the bones, the packets, the bottles)
  bone(g, px + 52, GY - 3, 0.4); bone(g, px - 10, GY - 2, -0.3); bone(g, x0 + 396, GY - 2, 0.1);
  for (const [x, r, sq] of [[x0 + 318, 0.3, true], [x0 + 330, -0.2, false], [x0 + 384, 0.6, true], [x0 + 400, -0.4, false], [x0 + 444, 0.2, false], [x0 + 256, 0.1, false]] as const) packet(g, x, GY - 3, r, sq);
  twoLiter(g, x0 + 368, GY - 5, true, '#16A34A');
  twoLiter(g, x0 + 443, GY - 2);
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
  // (between the sandwich and the mug: a picked drumstick bone, two packets; one more past the mug)
  bone(g, DESK_X + 55, T - 2, -0.2); packet(g, DESK_X + 52, T - 6, 0.15); packet(g, DESK_X + 88, T - 2, -0.3, true);
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
    stamp(c, 'ctl-bank', BANK_L - 10, BANK_TOP - 50, BANK_R - BANK_L + 32, GY - BANK_TOP + 50, paintBank);
    for (let i = 0; i < 6; i++) feed(c, i, f, look.done || (look.burst && i === 3));
    cctv(c, f);
    stamp(c, 'ctl-fridge', x0 - 10, GY - 146, 150, 146, paintFridge);
    stamp(c, 'ctl-nest-back', x0 + 130, GY - 96, 170, 98, paintNestBack);
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
  // At his plane: his nest round the chair, the chair, the bin, the console and its clutter, the head, the rack and the
  // cape
  stamp(c, 'ctl-nest', x0 + 240, GY - 50, 220, 52, paintNest);
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
  // (the buffet's heat lamps, orange on the steam table; the slushie machine's red header)
  if (near(BUFFET_X + 130)) {
    const [hx, hy] = at(eye, BUFFET_X + 127, GY - 70, WALL_D), [sx, sy] = at(eye, SLUSH_X, GY - 96, WALL_D);
    lights.push({ x: hx, y: hy, r: 170, a: 0.65, cone: 160, color: 'rgba(251, 146, 60, 0.09)' });
    lights.push({ x: sx, y: sy, r: 90, a: 0.6, color: 'rgba(239, 68, 68, 0.08)' });
  }
  const mixN = (a: number, b: number) => Math.round(a + (b - a) * k);
  if (door !== null && near(door)) lights.push({ x: door - 20, y: GY - 70, r: 150, a: 0.6, color: 'rgba(167, 139, 250, 0.09)' });
  return { dark: 0.3 + (0.26 - 0.3) * k, shade: [mixN(10, 34), mixN(12, 6), mixN(22, 6)], lights };
};

void lite; void dark;
