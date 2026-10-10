// Real hell, drawn (crude first pass: boxes, flat colors). The sky's a cavern roof glowing red (banded, SNES-style
// steps); the pit's shaft of rock he falls down; the wrecked car and what's left of its riders; the basalt floor (a
// lit top lip: standable), the rocks and ledges; the gate into the demon's pit; Satan's lake behind it; the vent.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, postSign, wallSign, groundBox, ledgeBox } from '../section';
import { GY } from '../geometry';
import {
  x0, x1, SHAFT_L, SHAFT_R, SHAFT_TOP, LEFT_ROCK_BOTTOM, RIGHT_ROCK_BOTTOM, RIGHT_ROCK_W, WRECK_X, STAIRS_X, POOLS, ROCKS, LEDGES,
  REFILL_X, ARENA_IN, VENT_X, LAVA_DROP,
} from './layout';
import { drawWreckedCar } from './hazards';

type Ctx = CanvasRenderingContext2D;

const BANDS = ['#1A0303', '#2A0505', '#3B0707', '#4C0A06', '#5E1006', '#701807', '#832209'];

/** Screen space: the cavern roof far up, red going down to the glow of the lava (banded), stalactites going back. */
export const drawHellBackdrop = (c: Ctx, state: GameState) => {
  const bh = CANVAS_HEIGHT / BANDS.length;
  BANDS.forEach((col, i) => box(c, 0, i * bh, CANVAS_WIDTH, bh + 1, col));
  // (stalactites, far back: slow)
  const off = -((state.camera.x * 0.15) % 160);
  c.fillStyle = '#120202';
  for (let x = off - 160; x < CANVAS_WIDTH + 160; x += 160) {
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 40, 0); c.lineTo(x + 22, 90 + ((x - off) % 3) * 30); c.fill();
    c.beginPath(); c.moveTo(x + 80, 0); c.lineTo(x + 110, 0); c.lineTo(x + 96, 50); c.fill();
  }
  // (a far rock wall at the bottom, the lava's glow over it)
  const off2 = -((state.camera.x * 0.35) % 220);
  c.fillStyle = '#240404';
  for (let x = off2 - 220; x < CANVAS_WIDTH + 220; x += 220) { c.beginPath(); c.moveTo(x, CANVAS_HEIGHT); c.lineTo(x + 60, CANVAS_HEIGHT - 170); c.lineTo(x + 140, CANVAS_HEIGHT - 120); c.lineTo(x + 220, CANVAS_HEIGHT); c.fill(); }
};

/** Severed bits (crude, big enough to read): a leg in its jeans and sneaker, an arm, a head (seeded skin and hair), a
 *  ribcage; blood under and round all of it. */
const SKIN = ['#F1C27D', '#8D5524', '#C68642', '#FFDBAC', '#5C3A1E'];
const HAIR = ['#2C1B10', '#E6C36A', '#7C2D12', '#18181B', '#A8A29E'];
const CLOTH = ['#1D4ED8', '#15803D', '#9333EA', '#DB2777', '#CA8A04'];
const stump = (c: Ctx, x: number, y: number, h: number) => { box(c, x - 3, y - h, 7, h, '#991B1B'); box(c, x - 1, y - h + 2, 3, h - 4, '#FECACA'); };
const leg = (c: Ctx, x: number, y: number, s: number, i: number) => {
  const x2 = s > 0 ? x : x - 56;
  box(c, x2, y - 13, 56, 13, CLOTH[i % 5]); box(c, x2, y - 13, 56, 3, '#00000033');
  box(c, s > 0 ? x + 56 : x - 74, y - 16, 18, 16, '#E5E5E5'); box(c, s > 0 ? x + 56 : x - 74, y - 4, 18, 4, '#A3A3A3');
  stump(c, s > 0 ? x : x, y, 13);
};
const arm = (c: Ctx, x: number, y: number, s: number, i: number) => {
  const x2 = s > 0 ? x : x - 40;
  box(c, x2, y - 10, 40, 10, CLOTH[(i + 2) % 5]);
  box(c, s > 0 ? x + 40 : x - 54, y - 10, 14, 10, SKIN[i % 5]); box(c, s > 0 ? x + 52 : x - 58, y - 8, 6, 4, SKIN[i % 5]);
  stump(c, x, y, 10);
};
const head = (c: Ctx, x: number, y: number, i: number) => {
  box(c, x - 14, y - 28, 28, 28, SKIN[i % 5]); box(c, x - 15, y - 32, 30, 9, HAIR[i % 5]);
  box(c, x - 8, y - 18, 5, 3, '#000000'); box(c, x + 3, y - 18, 5, 3, '#000000'); box(c, x - 5, y - 9, 10, 4, '#450A0A');
  box(c, x - 10, y - 2, 20, 4, '#991B1B'); box(c, x - 18, y, 36, 2, '#7F1D1D');
};
const pool = (c: Ctx, x: number, w: number) => {
  c.fillStyle = '#5B0A0A'; c.beginPath(); c.ellipse(x, GY + 1, w, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#991B1B'; c.beginPath(); c.ellipse(x - w * 0.2, GY, w * 0.5, 2.5, 0, 0, Math.PI * 2); c.fill();
  // (splashes up off the floor)
  for (let k = 0; k < 4; k++) box(c, x - w + ((k * 53) % (w * 2)), GY - 4 - (k % 2) * 3, 4, 3, '#991B1B');
};

/** The wrecked elevator at the bottom of the pit, and its riders, in bits, all over. */
const drawWreck = (c: Ctx, state: GameState, extra: boolean) => {
  const f = state.frame;
  // (the blood first, under it all; sprayed up the shaft's wall behind)
  pool(c, WRECK_X, 150); pool(c, WRECK_X - 230, 60); pool(c, WRECK_X + 230, 70); pool(c, WRECK_X + 360, 40); pool(c, WRECK_X - 330, 34);
  for (let k = 0; k < 9; k++) box(c, WRECK_X - 120 + k * 31, GY - 150 - ((k * 37) % 70), 6 + (k % 3) * 4, 4 + (k % 2) * 6, '#5B0A0A');
  // (the cable down the shaft, snapped, swinging a little)
  c.strokeStyle = '#3F3F46'; c.lineWidth = 3; c.beginPath(); c.moveTo(WRECK_X + 10, SHAFT_TOP); c.quadraticCurveTo(WRECK_X + 10 + Math.sin(f * 0.02) * 12, GY - 600, WRECK_X - 30, GY - 160); c.stroke();
  if (extra) drawWreckedCar(c, WRECK_X + 210, GY, 0.2, f);
  drawWreckedCar(c, WRECK_X, GY, -0.07, f);
  // (one hanging half out of its doors, the ride's souvenir shirt on him)
  box(c, WRECK_X + 26, GY - 70, 40, 34, '#1D4ED8'); box(c, WRECK_X + 66, GY - 66, 24, 24, '#C68642'); box(c, WRECK_X + 64, GY - 70, 26, 7, '#2C1B10');
  box(c, WRECK_X + 72, GY - 56, 4, 3, '#000000'); box(c, WRECK_X + 78, GY - 48, 8, 3, '#450A0A');
  box(c, WRECK_X + 30, GY - 36, 30, 36, '#991B1B');
  c.font = '5px "Press Start 2P"'; c.fillStyle = '#FDE68A'; c.fillText('I RODE', WRECK_X + 28, GY - 56); c.fillText('IT!', WRECK_X + 36, GY - 48);
  // (the bits)
  leg(c, WRECK_X - 200, GY, 1, 0); leg(c, WRECK_X + 150, GY, -1, 1); leg(c, WRECK_X + 280, GY, 1, 2);
  arm(c, WRECK_X - 110, GY, -1, 3); arm(c, WRECK_X + 110, GY, 1, 4); arm(c, WRECK_X + 340, GY, -1, 0);
  head(c, WRECK_X - 260, GY, 1); head(c, WRECK_X + 200, GY, 3); head(c, WRECK_X + 390, GY, 4);
  // (a ribcage, guts in a loop, a spine)
  box(c, WRECK_X - 340, GY - 5, 56, 5, '#E7E5E4'); for (let i = 0; i < 6; i++) box(c, WRECK_X - 336 + i * 9, GY - 24, 4, 20, '#E7E5E4');
  box(c, WRECK_X - 340, GY - 24, 56, 4, '#E7E5E4');
  c.strokeStyle = '#BE185D'; c.lineWidth = 6; c.beginPath(); c.moveTo(WRECK_X + 60, GY - 2); c.bezierCurveTo(WRECK_X + 80, GY - 40, WRECK_X + 120, GY + 6, WRECK_X + 140, GY - 20); c.stroke();
  c.strokeStyle = '#F472B6'; c.lineWidth = 2; c.stroke();
  // (a photo strip from the ride, and a hat)
  box(c, WRECK_X - 160, GY - 4, 18, 4, '#FFFFFF'); box(c, WRECK_X - 70, GY - 14, 24, 14, '#18181B'); box(c, WRECK_X - 76, GY - 5, 36, 5, '#18181B');
};

/** World space, behind: the shaft, the floor, the pools' banks, rocks and ledges, the pit's set pieces. */
export const drawHellWorld = (c: Ctx, state: GameState, o: { extraWreck: boolean; beaten: boolean }) => {
  const cam = state.camera.x, vis = (a: number, b: number) => b > cam - 200 && a < cam + CANVAS_WIDTH + 200;
  // The shaft's rock (both sides, far up), the tunnel up in the left, the overhang he walks out under on the right
  if (vis(x0 - 200, SHAFT_R + RIGHT_ROCK_W)) {
    box(c, x0 - 200, SHAFT_TOP, SHAFT_L - x0 + 200, LEFT_ROCK_BOTTOM - SHAFT_TOP, '#1C0A06');
    box(c, SHAFT_L - 8, SHAFT_TOP, 8, LEFT_ROCK_BOTTOM - SHAFT_TOP, '#3B1408');
    box(c, SHAFT_R, SHAFT_TOP, RIGHT_ROCK_W, RIGHT_ROCK_BOTTOM - SHAFT_TOP, '#1C0A06');
    box(c, SHAFT_R, SHAFT_TOP, 8, RIGHT_ROCK_BOTTOM - SHAFT_TOP, '#3B1408');
    box(c, SHAFT_R, RIGHT_ROCK_BOTTOM - 8, RIGHT_ROCK_W, 8, '#2A0F06');
    // (the shaft's back wall: rock, and the tower's floor's gone out of the top of it)
    box(c, SHAFT_L, SHAFT_TOP, SHAFT_R - SHAFT_L, GY - SHAFT_TOP, '#2A0E06');
    for (let y = SHAFT_TOP + 80; y < GY - 100; y += 170) box(c, SHAFT_L + ((y * 7) % 500), y, 90, 10, '#3B1408');
    // (the stairs back up: a doorway in the rock, its sign on the rock over it)
    box(c, x0 - 10, LEFT_ROCK_BOTTOM, STAIRS_X + 60 - x0, GY - LEFT_ROCK_BOTTOM, '#0A0303');
    for (let i = 0; i < 6; i++) box(c, x0 + i * 14, GY - 12 - i * 26, 60, 6, '#3F3F46');
    wallSign(c, STAIRS_X + 20, LEFT_ROCK_BOTTOM - 26, 'STAIRS UP', '#3F3F46', '#FDE68A');
  }
  // The floor, all but the pools (basalt; the lit lip: standable)
  let from = x0 - 200;
  for (const [a, b] of POOLS) { if (vis(from, a)) groundBox(c, from, a, GY, '#2A1208', '#EA580C'); from = b; }
  if (vis(from, x1 + 200)) groundBox(c, from, x1 + 200, GY, '#2A1208', '#EA580C');
  // (the pools' rock under them, below the lava: see hazards' drawLava)
  for (const [x, top, w] of ROCKS) if (vis(x, x + w)) { box(c, x, top, w, GY + LAVA_DROP + 20 - top, '#3B1408'); box(c, x, top, w, 4, '#FB923C'); }
  for (const [x, y, w] of LEDGES) if (vis(x, x + w)) ledgeBox(c, x, y, w, '#3B1408', '#FB923C');
  // The pit: the wreck, the bits
  if (vis(x0, WRECK_X + 500)) drawWreck(c, state, o.extraWreck);
  if (vis(WRECK_X + 900, WRECK_X + 1100)) postSign(c, WRECK_X + 1000, GY, 'ABANDON ALL HOPE', '#450A0A', '#FDBA74');
  // (the refill's spot, and the way into the demon's pit: an arch of bones, its plaque)
  if (vis(REFILL_X - 200, ARENA_IN + 200)) {
    postSign(c, REFILL_X - 130, GY, 'LAST REST STOP', '#450A0A', '#FDE68A');
    box(c, ARENA_IN - 20, GY - 230, 24, 230, '#D6D3D1'); box(c, ARENA_IN + 60, GY - 230, 24, 230, '#D6D3D1');
    box(c, ARENA_IN - 30, GY - 250, 124, 26, '#E7E5E4');
    for (let i = 0; i < 4; i++) { box(c, ARENA_IN - 24 + i * 30, GY - 246, 18, 18, '#A8A29E'); box(c, ARENA_IN - 20 + i * 30, GY - 242, 4, 4, '#000000'); box(c, ARENA_IN - 12 + i * 30, GY - 242, 4, 4, '#000000'); }
    wallSign(c, ARENA_IN + 32, GY - 280, o.beaten ? 'GONE TO DAD\'S' : 'NO LOITERING', '#7F1D1D', '#FEF08A');
  }
  // (the vent, and its sign on a post)
  if (vis(VENT_X - 200, VENT_X + 200)) {
    box(c, VENT_X - 34, GY - 6, 68, 6, '#1C1917'); box(c, VENT_X - 24, GY - 4, 48, 3, o.beaten ? '#F97316' : '#7C2D12');
    if (o.beaten && state.frame % 24 < 12) box(c, VENT_X - 3, GY - 14, 6, 6, '#FDE047');
    postSign(c, VENT_X + 110, GY, 'EXPRESS TO SURFACE', '#450A0A', '#FDE68A');
  }
};

/** Satan's lake: lava out behind the demon's pit (drawn before the floor, behind it). Its far shore first, then (after
 *  Satan, who comes up out of it) its surface. */
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
