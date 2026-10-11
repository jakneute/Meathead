// Real hell, drawn: crude (flat colors, a few tones, black outlines where they help it read), but everything shaped
// like what it is. The cavern: its roof far up (banded red down to the lava's glow), stalactites, lava falls going
// back. The pit's shaft he falls down; the wrecked car and what's left of its riders. The basalt floor (a lit top lip:
// standable; glowing seams in it), rocks shaped like rocks (outlined, shaded, a lit top), slabs of rock to jump up
// through (jagged undersides), cages hung on chains with what's left of somebody in them, bone piles; the gate into the
// demon's pit; Satan's lake behind it; the vent.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, postSign, wallSign } from '../section';
import { GY } from '../geometry';
import {
  x0, x1, SHAFT_L, SHAFT_R, SHAFT_TOP, LEFT_ROCK_BOTTOM, RIGHT_ROCK_BOTTOM, RIGHT_ROCK_W, WRECK_X, WRECK_B_X, POOLS, ROCKS, LEDGES,
  REFILL_X, ARENA_IN, VENT_X, LAVA_DROP, CAGES, BONES,
} from './layout';
import { drawWreckedCar } from './hazards';

type Ctx = CanvasRenderingContext2D;
const INK = '#0C0303';
/** A cheap stable hash (for where cracks and pebbles go). */
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

const BANDS = ['#1A0303', '#2A0505', '#3B0707', '#4C0A06', '#5E1006', '#701807', '#832209'];

/** Screen space: the cavern roof far up, red going down to the glow of the lava (banded), stalactites going back,
 *  lava falls pouring down the far wall, the far rock along the bottom. */
export const drawHellBackdrop = (c: Ctx, state: GameState) => {
  const bh = CANVAS_HEIGHT / BANDS.length, f = state.frame;
  BANDS.forEach((col, i) => box(c, 0, i * bh, CANVAS_WIDTH, bh + 1, col));
  // (lava falls, far back: slowest)
  const off0 = -((state.camera.x * 0.08) % 420);
  for (let x = off0 - 420; x < CANVAS_WIDTH + 420; x += 420) {
    box(c, x + 150, 60, 18, CANVAS_HEIGHT, '#9A3412');
    box(c, x + 154, 60, 6, CANVAS_HEIGHT, '#EA580C');
    for (let y = ((f * 2) % 40) + 60; y < CANVAS_HEIGHT; y += 40) box(c, x + 156, y, 3, 12, '#FDBA74');
  }
  // (stalactites)
  const off = -((state.camera.x * 0.15) % 160);
  c.fillStyle = '#120202';
  for (let x = off - 160; x < CANVAS_WIDTH + 160; x += 160) {
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 40, 0); c.lineTo(x + 22, 90 + Math.abs(Math.round(x - off) % 3) * 30); c.fill();
    c.beginPath(); c.moveTo(x + 80, 0); c.lineTo(x + 110, 0); c.lineTo(x + 96, 50); c.fill();
  }
  // (the far rock along the bottom, and a nearer, darker row)
  const off2 = -((state.camera.x * 0.35) % 220);
  c.fillStyle = '#240404';
  for (let x = off2 - 220; x < CANVAS_WIDTH + 220; x += 220) { c.beginPath(); c.moveTo(x, CANVAS_HEIGHT); c.lineTo(x + 60, CANVAS_HEIGHT - 170); c.lineTo(x + 140, CANVAS_HEIGHT - 120); c.lineTo(x + 220, CANVAS_HEIGHT); c.fill(); }
  const off3 = -((state.camera.x * 0.55) % 300);
  c.fillStyle = '#1A0303';
  for (let x = off3 - 300; x < CANVAS_WIDTH + 300; x += 300) { c.beginPath(); c.moveTo(x, CANVAS_HEIGHT); c.lineTo(x + 90, CANVAS_HEIGHT - 110); c.lineTo(x + 130, CANVAS_HEIGHT - 90); c.lineTo(x + 200, CANVAS_HEIGHT - 130); c.lineTo(x + 300, CANVAS_HEIGHT); c.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The pit's wreck: the riders, in bits

const SKIN = ['#F1C27D', '#8D5524', '#C68642', '#FFDBAC', '#5C3A1E'];
const HAIR = ['#2C1B10', '#E6C36A', '#7C2D12', '#18181B', '#A8A29E'];
const CLOTH = ['#1D4ED8', '#15803D', '#9333EA', '#DB2777', '#CA8A04'];
const stump = (c: Ctx, x: number, y: number, h: number) => { box(c, x - 3, y - h, 7, h, '#991B1B'); box(c, x - 1, y - h + 2, 3, h - 4, '#FECACA'); };
const leg = (c: Ctx, x: number, y: number, s: number, i: number) => {
  const x2 = s > 0 ? x : x - 56;
  box(c, x2 - 1, y - 14, 58, 14, INK); box(c, x2, y - 13, 56, 13, CLOTH[i % 5]);
  box(c, s > 0 ? x + 56 : x - 74, y - 16, 18, 16, '#E5E5E5'); box(c, s > 0 ? x + 56 : x - 74, y - 4, 18, 4, '#A3A3A3');
  stump(c, x, y, 13);
};
const arm = (c: Ctx, x: number, y: number, s: number, i: number) => {
  const x2 = s > 0 ? x : x - 40;
  box(c, x2 - 1, y - 11, 42, 11, INK); box(c, x2, y - 10, 40, 10, CLOTH[(i + 2) % 5]);
  box(c, s > 0 ? x + 40 : x - 54, y - 10, 14, 10, SKIN[i % 5]); box(c, s > 0 ? x + 52 : x - 58, y - 8, 6, 4, SKIN[i % 5]);
  stump(c, x, y, 10);
};
const head = (c: Ctx, x: number, y: number, i: number) => {
  box(c, x - 15, y - 29, 30, 29, INK);
  box(c, x - 14, y - 28, 28, 28, SKIN[i % 5]); box(c, x - 15, y - 32, 30, 9, HAIR[i % 5]);
  box(c, x - 8, y - 18, 5, 3, '#000000'); box(c, x + 3, y - 18, 5, 3, '#000000'); box(c, x - 5, y - 9, 10, 4, '#450A0A');
  box(c, x - 10, y - 2, 20, 4, '#991B1B'); box(c, x - 18, y, 36, 2, '#7F1D1D');
};
const pool = (c: Ctx, x: number, w: number) => {
  c.fillStyle = '#5B0A0A'; c.beginPath(); c.ellipse(x, GY + 1, w, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#991B1B'; c.beginPath(); c.ellipse(x - w * 0.2, GY, w * 0.5, 2.5, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 4; k++) box(c, x - w + ((k * 53) % (w * 2)), GY - 4 - (k % 2) * 3, 4, 3, '#991B1B');
};

/** A rider hanging half out of a car's doors, the ride's souvenir shirt on him (at x, his chest's top at y). */
const rider = (c: Ctx, x: number, y: number, i: number) => {
  box(c, x - 2, y - 2, 40, 36, INK); box(c, x, y, 36, 32, CLOTH[i % 5]);
  box(c, x + 36, y + 4, 24, 24, SKIN[i % 5]); box(c, x + 34, y, 26, 7, HAIR[i % 5]);
  box(c, x + 48, y + 14, 4, 3, '#000000'); box(c, x + 50, y + 22, 8, 3, '#450A0A');
  box(c, x + 2, y + 34, 30, 36, '#991B1B');
  c.font = '5px "Press Start 2P"'; c.fillStyle = '#FDE68A'; c.fillText('I RODE', x + 1, y + 14); c.fillText('IT!', x + 8, y + 22);
};

/** The two wrecked elevators at the bottom of the pit (both shafts' cars came down when the tower went: one on its
 *  side against the other), and both cars' riders, in bits, all over. */
const drawWreck = (c: Ctx, state: GameState, extra: boolean) => {
  const f = state.frame, W = WRECK_X, B = WRECK_B_X;
  // (the other car, on its side, its riders' share)
  pool(c, B, 110);
  drawWreckedCar(c, B + 63, GY - 58, -Math.PI / 2, f);
  box(c, B - 63, GY - 113, 126, 3, '#FB923C');
  rider(c, B - 20, GY - 150, 3);
  head(c, B + 40, GY - 112, 0); arm(c, B - 60, GY - 112, -1, 1);
  leg(c, B - 80, GY, -1, 4); arm(c, B + 20, GY, -1, 2);
  pool(c, W, 150); pool(c, W + 260, 70); pool(c, W + 400, 40); pool(c, W + 320, 50); pool(c, W + 560, 60);
  for (let k = 0; k < 9; k++) box(c, W - 120 + k * 31, GY - 170 - ((k * 37) % 70), 6 + (k % 3) * 4, 4 + (k % 2) * 6, '#5B0A0A');
  // (the cable down the shaft, snapped, swinging a little)
  c.strokeStyle = '#3F3F46'; c.lineWidth = 3; c.beginPath(); c.moveTo(W + 10, SHAFT_TOP); c.quadraticCurveTo(W + 10 + Math.sin(f * 0.02) * 12, GY - 600, W - 10, GY - 140); c.stroke();
  if (extra) drawWreckedCar(c, W + 250, GY, 0.2, f);
  drawWreckedCar(c, W, GY, 0, f, true);
  // (one hanging half out of its doors, the ride's souvenir shirt on him)
  rider(c, W + 56, GY - 70, 0);
  // (the bits)
  leg(c, W + 420, GY, -1, 0); leg(c, W + 200, GY, -1, 1); leg(c, W + 330, GY, 1, 2);
  arm(c, W + 560, GY, -1, 3); arm(c, W + 150, GY, 1, 4); arm(c, W + 470, GY, -1, 0);
  head(c, W + 300, GY, 1); head(c, W + 650, GY, 2); head(c, W + 240, GY, 3); head(c, W + 520, GY, 4);
  // (a ribcage, guts in a loop)
  box(c, W + 600, GY - 5, 56, 5, '#E7E5E4'); for (let i = 0; i < 6; i++) box(c, W + 604 + i * 9, GY - 24, 4, 20, '#E7E5E4');
  box(c, W + 600, GY - 24, 56, 4, '#E7E5E4');
  c.strokeStyle = '#BE185D'; c.lineWidth = 6; c.beginPath(); c.moveTo(W + 90, GY - 2); c.bezierCurveTo(W + 110, GY - 40, W + 150, GY + 6, W + 170, GY - 20); c.stroke();
  c.strokeStyle = '#F472B6'; c.lineWidth = 2; c.stroke();
  // (a photo strip from the ride, and a hat)
  box(c, W + 380, GY - 4, 18, 4, '#FFFFFF'); box(c, W + 470, GY - 14, 24, 14, '#18181B'); box(c, W + 464, GY - 5, 36, 5, '#18181B');
};

// ---------------------------------------------------------------------------------------------------------------
// Rock

/** The floor: basalt, its lit lip, glowing seams and pebbles along it (where they go, hashed on x: they stay put). */
const floor = (c: Ctx, a: number, b: number, f: number) => {
  box(c, a, GY, b - a, 400, '#2A1208');
  box(c, a, GY + 14, b - a, 400, '#1F0D06');
  box(c, a, GY, b - a, 4, '#EA580C');
  box(c, a, GY + 4, b - a, 2, '#7C2D12');
  const s = Math.floor(a / 70) * 70;
  for (let x = s; x < b - 20; x += 70) {
    if (x < a) continue;
    const h = hash(x), glow = 0.5 + 0.5 * Math.sin(f * 0.05 + x);
    if (h < 0.45) { box(c, x + h * 30, GY + 10, 3, 14 + h * 20, `rgba(249, 115, 22, ${0.35 + glow * 0.35})`); box(c, x + h * 30, GY + 22 + h * 10, 18, 2, `rgba(249, 115, 22, ${0.3 + glow * 0.3})`); }
    if (h > 0.6) { box(c, x + 20, GY - 4, 7, 4, '#3B1408'); box(c, x + 20, GY - 4, 7, 1, '#9A3412'); }
  }
};

/** A rock with a flat top to stand on (outlined, shaded, lit top), from `top` down to `bot`. */
export const rock = (c: Ctx, x: number, top: number, w: number, bot: number) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 2, bot); c.lineTo(x - 6, top + 22); c.lineTo(x - 2, top - 1); c.lineTo(x + w + 2, top - 1); c.lineTo(x + w + 6, top + 24); c.lineTo(x + w + 2, bot); c.fill();
  c.fillStyle = '#4A1C0B'; c.beginPath(); c.moveTo(x, bot); c.lineTo(x - 4, top + 22); c.lineTo(x, top); c.lineTo(x + w, top); c.lineTo(x + w + 4, top + 24); c.lineTo(x + w, bot); c.fill();
  box(c, x + w * 0.6, top + 6, w * 0.4, bot - top - 6, '#341307');
  box(c, x + 6, top + 18, 4, Math.min(30, bot - top - 20), '#5E2610');
  box(c, x, top, w, 4, '#FB923C'); box(c, x, top + 4, w, 2, '#9A3412');
};

/** A slab of rock to jump up through and stand on: lit top, jagged underside. */
const slab = (c: Ctx, x: number, y: number, w: number) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 2, y - 1); c.lineTo(x + w + 2, y - 1); c.lineTo(x + w + 2, y + 15);
  for (let k = w; k > 0; k -= 22) c.lineTo(x + k - 11, y + 17 + (hash(x + k) * 12));
  c.lineTo(x - 2, y + 15); c.fill();
  c.fillStyle = '#4A1C0B'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w, y + 13);
  for (let k = w; k > 0; k -= 22) c.lineTo(x + k - 11, y + 14 + (hash(x + k) * 10));
  c.lineTo(x, y + 13); c.fill();
  box(c, x, y, w, 3, '#FB923C'); box(c, x, y + 3, w, 2, '#9A3412');
};

/** A cage hung on a chain from the dark, a skeleton slumped in it (set dressing, swinging a little). */
const cage = (c: Ctx, x: number, low: number, f: number, camY: number) => {
  const sw = Math.sin(f * 0.02 + x) * 4, top = GY - low - 90;
  c.strokeStyle = '#27272A'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, camY - 20); c.lineTo(x + sw, top); c.stroke();
  const cx = x + sw;
  box(c, cx - 26, top, 52, 4, '#3F3F46'); box(c, cx - 26, top + 66, 52, 4, '#3F3F46');
  // (the skeleton, in the back of it)
  box(c, cx - 8, top + 22, 14, 12, '#E7E5E4'); box(c, cx - 5, top + 26, 3, 3, '#000000'); box(c, cx + 1, top + 26, 3, 3, '#000000');
  box(c, cx - 2, top + 34, 3, 20, '#D6D3D1'); for (let i = 0; i < 3; i++) box(c, cx - 8, top + 38 + i * 5, 16, 2, '#D6D3D1');
  box(c, cx + 6, top + 54, 14, 3, '#D6D3D1'); box(c, cx - 14, top + 52, 12, 3, '#D6D3D1');
  for (let i = 0; i < 6; i++) box(c, cx - 26 + i * 10, top, 3, 70, '#52525B');
  c.fillStyle = '#3F3F46'; c.beginPath(); c.moveTo(cx - 26, top); c.lineTo(cx, top - 14); c.lineTo(cx + 26, top); c.fill();
};

/** A pile of bones: a skull or two on it. */
const bones = (c: Ctx, x: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, GY, 34, 12, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#A8A29E'; c.beginPath(); c.ellipse(x, GY, 32, 10, 0, Math.PI, 0); c.fill();
  for (let i = 0; i < 4; i++) { const bx = x - 26 + i * 15; box(c, bx, GY - 6 - (i % 2) * 3, 18, 3, '#E7E5E4'); box(c, bx - 2, GY - 7 - (i % 2) * 3, 4, 5, '#E7E5E4'); box(c, bx + 16, GY - 7 - (i % 2) * 3, 4, 5, '#E7E5E4'); }
  box(c, x - 8, GY - 20, 16, 13, '#E7E5E4'); box(c, x - 5, GY - 16, 4, 4, '#000000'); box(c, x + 1, GY - 16, 4, 4, '#000000'); box(c, x - 4, GY - 9, 8, 2, '#57534E');
};

/** World space, behind: the shaft, the floor, rocks and slabs, the pit's set pieces, the dressing, the gate, the vent. */
export const drawHellWorld = (c: Ctx, state: GameState, o: { extraWreck: boolean; beaten: boolean }) => {
  const cam = state.camera.x, f = state.frame, vis = (a: number, b: number) => b > cam - 200 && a < cam + CANVAS_WIDTH + 200;
  // The shaft's rock (both sides, far up), the stairs up in the left, the overhang he walks out under on the right
  if (vis(x0 - 200, SHAFT_R + RIGHT_ROCK_W)) {
    box(c, SHAFT_L, SHAFT_TOP, SHAFT_R - SHAFT_L, GY - SHAFT_TOP, '#240C05');
    for (let y = SHAFT_TOP + 80; y < GY - 100; y += 140) { const hx = SHAFT_L + 40 + hash(y) * 600; box(c, hx, y, 90 + hash(y + 1) * 60, 8, '#33120A'); box(c, hx + 20, y + 30, 40, 6, '#1C0904'); }
    for (const [a, b, bot] of [[x0 - 200, SHAFT_L, LEFT_ROCK_BOTTOM], [SHAFT_R, SHAFT_R + RIGHT_ROCK_W, RIGHT_ROCK_BOTTOM]] as const) {
      box(c, a, SHAFT_TOP, b - a, bot - SHAFT_TOP, '#170804');
      box(c, a === SHAFT_R ? a : b - 10, SHAFT_TOP, 10, bot - SHAFT_TOP, '#3B1408');
      // (its underside: jagged, dark)
      if (bot < GY) { c.fillStyle = '#170804'; c.beginPath(); c.moveTo(a, bot);
        for (let x = a; x <= b; x += 24) c.lineTo(x + 12, bot + 8 + hash(x) * 14);
        c.lineTo(b, bot); c.fill();
      }
      for (let y = SHAFT_TOP + 60; y < bot - 40; y += 120) box(c, a + 20 + hash(y + a) * (b - a - 60), y, 30, 4, '#2A0F06');
    }
  }
  // The floor, all but the pools
  let from = x0 - 200;
  for (const [a, b] of POOLS) { if (vis(from, a)) floor(c, Math.max(from, cam - 220), Math.min(a, cam + CANVAS_WIDTH + 220), f); from = b; }
  if (vis(from, x1 + 200)) floor(c, Math.max(from, cam - 220), Math.min(x1 + 200, cam + CANVAS_WIDTH + 220), f);
  // (the dressing: cages hung on chains, bone piles)
  for (const [x, low] of CAGES) if (vis(x - 40, x + 40)) cage(c, x, low, f, state.camera.y);
  for (const x of BONES) if (vis(x - 40, x + 40)) bones(c, x);
  // Rocks (in the lava they go on down into it) and slabs
  for (const [x, top, w] of ROCKS) if (vis(x, x + w)) rock(c, x, top, w, GY + LAVA_DROP + 30);
  for (const [x, y, w] of LEDGES) if (vis(x, x + w)) slab(c, x, y, w);
  // The pit: the wreck, the bits
  if (vis(x0, WRECK_X + 700)) drawWreck(c, state, o.extraWreck);
  if (vis(x0 + 1350, x0 + 1550)) postSign(c, x0 + 1520, GY, 'ABANDON ALL HOPE', '#450A0A', '#FDBA74');
  // (the refill's spot, and the way into the demon's pit: an arch of bones, its plaque)
  if (vis(REFILL_X - 200, ARENA_IN + 200)) {
    postSign(c, REFILL_X - 130, GY, 'LAST REST STOP', '#450A0A', '#FDE68A');
    for (const px of [ARENA_IN - 20, ARENA_IN + 60]) {
      box(c, px - 2, GY - 232, 28, 232, INK); box(c, px, GY - 230, 24, 230, '#D6D3D1'); box(c, px + 16, GY - 230, 8, 230, '#A8A29E');
      for (let y = GY - 200; y < GY; y += 40) box(c, px - 3, y, 30, 8, '#E7E5E4');
    }
    box(c, ARENA_IN - 32, GY - 252, 128, 30, INK); box(c, ARENA_IN - 30, GY - 250, 124, 26, '#E7E5E4');
    for (let i = 0; i < 4; i++) { box(c, ARENA_IN - 24 + i * 30, GY - 246, 18, 18, '#A8A29E'); box(c, ARENA_IN - 20 + i * 30, GY - 242, 4, 4, '#000000'); box(c, ARENA_IN - 12 + i * 30, GY - 242, 4, 4, '#000000'); }
    wallSign(c, ARENA_IN + 32, GY - 280, o.beaten ? "GONE TO DAD'S" : 'NO LOITERING', '#7F1D1D', '#FEF08A');
  }
  // (the vent: a ring of rock, glowing once it's live; its sign on a post)
  if (vis(VENT_X - 200, VENT_X + 200)) {
    rock(c, VENT_X - 46, GY - 12, 18, GY); rock(c, VENT_X + 28, GY - 12, 18, GY);
    box(c, VENT_X - 28, GY - 6, 56, 6, '#1C1917'); box(c, VENT_X - 22, GY - 4, 44, 3, o.beaten ? '#F97316' : '#7C2D12');
    if (o.beaten && f % 24 < 12) box(c, VENT_X - 3, GY - 16, 6, 6, '#FDE047');
    postSign(c, VENT_X + 110, GY, 'EXPRESS TO SURFACE', '#450A0A', '#FDE68A');
  }
};

/** Satan's lake: lava out behind the demon's pit (drawn before the floor, behind it). Its far shore first, then (after
 *  Satan, who comes up out of it) its surface, and the pit's back wall between it and the floor. */
export const drawLake = (c: Ctx, state: GameState, part: 'shore' | 'surface') => {
  const a = ARENA_IN - 300, b = VENT_X + 600, f = state.frame;
  if (b < state.camera.x - 200 || a > state.camera.x + CANVAS_WIDTH + 200) return;
  const L = GY - 110;
  if (part === 'shore') {
    for (let x = a; x < b; x += 180) { c.fillStyle = '#1C0606'; c.beginPath(); c.moveTo(x, L); c.lineTo(x + 50, L - 40 - (x % 3) * 12); c.lineTo(x + 120, L - 20); c.lineTo(x + 180, L); c.fill(); }
    return;
  }
  box(c, a, L, b - a, 40, '#C2410C');
  box(c, a, L, b - a, 5, '#FDBA74');
  for (let x = a + ((f >> 3) % 40); x < b; x += 40) box(c, x, L + 4, 16, 3, '#FDE047');
  // (the pit's back wall between it and the floor: rock, dim, no lip: not something to stand on)
  box(c, a, L + 40, b - a, GY - L - 40, '#1F0A05');
  for (let x = a + 30; x < b; x += 110) box(c, x, L + 48 + (x % 4) * 4, 50, 5, '#2A0F06');
};
