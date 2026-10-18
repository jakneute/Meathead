// The train and what goes by it, drawn (the prototype first pass: crude but readable: flat colors with a lit and a
// shaded tone, an ink edge, recognizable silhouettes). The scenery's the PARK's frontier going by (the land's joke: the
// real wilderness comes later): its painted mountain flats (kit.ts), then nearer, scrolling faster, fiberglass rock
// formations with their bolts and seams, plywood pine cutouts on braces, a split-rail park fence, a guest viewing deck
// with guests waving at the train (WAVE AT THE TRAIN!), a painted billboard, a prop mine with GOLD! on it; the
// embankment behind the line (the robbers ride it), telegraph poles whipping by; under the train the ballast and the
// ties blurring past.
//
// The cars: every floor and roof he can stand on has its lit top edge (standable reads standable). The cars he can go
// into are drawn from outside (their windows lit, whoever's inside a shape behind the glass) until he's in one: then
// that one's drawn opened up (its back wall, its windows onto the scenery, its seats, tables, shelves, its lanterns
// swinging).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { label } from '../section';
import { GY } from '../geometry';
import { box, mix, INK, frontierSky, onScreen, hash, painted, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { trainOf, type Train } from './state';
import { CARS, CAR_X, DECK, ROOF, CEIL, COUPLER, END, TOP, ENTERABLE, ENGINE, type CarKind } from './layout';
import { carXNow, insideCar, offOf } from './cars';
import { drawTunnelInside, BERM_Y } from './passers';

const LIP = '#E8C890';

// ---------------------------------------------------------------------------------------------------------------
// The scenery (screen space, scrolled by how far the world's gone by)

/** Screen space: the sky and the park's frontier going by, the inside of a tunnel over it if there's one. */
export const drawScenery = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  const fake = { ...state, camera: { ...state.camera, x: state.camera.x + tr.dist } } as GameState;
  frontierSky(c, fake);
  const W = CANVAS_WIDTH, base = 468 - state.camera.y;
  // (the park's scenery: a tile of it every 1800 px, at 0.45 of the world's speed)
  const off = (tr.dist * 0.45 + state.camera.x * 0.45) % 1800;
  for (let k = -1; k < 2; k++) {
    const bx = k * 1800 - off;
    if (bx > W || bx + 1800 < 0) continue;
    fakeRock(c, bx + 120, base, 220, 130, 1);
    pineCutout(c, bx + 420, base, 90); pineCutout(c, bx + 470, base, 70);
    viewingDeck(c, bx + 640, base, f);
    billboard(c, bx + 1000, base, ['SAWDUST GULCH', '3 MILES', 'GOLD! TIMBER! FUDGE!']);
    fakeRock(c, bx + 1250, base, 160, 90, 2);
    mineProp(c, bx + 1300, base);
    pineCutout(c, bx + 1560, base, 100); pineCutout(c, bx + 1640, base, 80);
  }
  // (the park's split-rail fence along the front of it)
  const off2 = (tr.dist * 0.55 + state.camera.x * 0.55) % 60;
  for (let x = -off2; x < W; x += 60) { box(c, x, base - 28, 5, 30, '#6B4423'); }
  box(c, 0, base - 24, W, 4, '#8A5A30'); box(c, 0, base - 12, W, 4, '#8A5A30');
  box(c, 0, base, W, CANVAS_HEIGHT - base, '#5A6A3A');
  drawTunnelInside(c, state);
  return true;
};

/** A fiberglass rock formation: a lumpy butte in two tones, its seams and its bolts showing, the paint's edge. */
const fakeRock = (c: Ctx, x: number, base: number, w: number, h: number, seed: number) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 2, base); c.lineTo(x + w * 0.1, base - h * 0.7); c.lineTo(x + w * 0.25, base - h); c.lineTo(x + w * 0.7, base - h * 0.95); c.lineTo(x + w * 0.85, base - h * 0.55); c.lineTo(x + w + 2, base); c.closePath(); c.fill();
  c.fillStyle = '#B8743E'; c.beginPath(); c.moveTo(x, base); c.lineTo(x + w * 0.11, base - h * 0.68); c.lineTo(x + w * 0.26, base - h + 2); c.lineTo(x + w * 0.69, base - h * 0.93); c.lineTo(x + w * 0.84, base - h * 0.54); c.lineTo(x + w, base); c.closePath(); c.fill();
  c.fillStyle = '#8A522A'; c.beginPath(); c.moveTo(x + w * 0.55, base); c.lineTo(x + w * 0.69, base - h * 0.93); c.lineTo(x + w * 0.84, base - h * 0.54); c.lineTo(x + w, base); c.closePath(); c.fill();
  // (strata bands, a molded seam down it, the bolts along the seam)
  for (let k = 1; k < 4; k++) box(c, x + w * 0.12, base - h * k * 0.22, w * 0.7, 2, '#9A5E30');
  box(c, x + w * (0.4 + seed * 0.05), base - h * 0.9, 2, h * 0.9, '#6B3A1A');
  for (let k = 0; k < 5; k++) box(c, x + w * (0.4 + seed * 0.05) - 3, base - h * 0.85 + k * h * 0.18, 3, 3, '#D4D4D8');
};
/** A plywood pine cutout on its stand: the brace behind it showing. */
const pineCutout = (c: Ctx, x: number, base: number, h: number) => {
  c.strokeStyle = '#8A6A40'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, base - h * 0.6); c.lineTo(x + 24, base); c.stroke();
  c.fillStyle = INK; c.beginPath(); c.moveTo(x, base - h - 2); c.lineTo(x + h * 0.32, base - h * 0.3); c.lineTo(x - h * 0.32, base - h * 0.3); c.closePath(); c.fill();
  c.fillStyle = '#2F5A2A'; c.beginPath(); c.moveTo(x, base - h); c.lineTo(x + h * 0.3, base - h * 0.32); c.lineTo(x - h * 0.3, base - h * 0.32); c.closePath(); c.fill();
  c.fillStyle = '#3F7A36'; c.beginPath(); c.moveTo(x, base - h); c.lineTo(x - h * 0.3, base - h * 0.32); c.lineTo(x - h * 0.05, base - h * 0.32); c.closePath(); c.fill();
  box(c, x - 3, base - h * 0.32, 6, h * 0.32, '#5A3A1E');
};
/** The guests' viewing deck: a railing on posts, guests waving at the train (arms going), its sign. */
const viewingDeck = (c: Ctx, x: number, base: number, f: number) => {
  box(c, x - 4, base - 40, 248, 6, INK); box(c, x - 2, base - 39, 244, 4, '#9A6A3A');
  for (let k = 0; k < 6; k++) box(c, x + k * 48, base - 36, 5, 36, '#6B4423');
  const skins = ['#F0C8A2', '#A86B43', '#6E4426', '#F6DCC8', '#D9A877'], shirts = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981', '#EC4899'];
  for (let k = 0; k < 5; k++) {
    const gx = x + 20 + k * 46, sk = skins[k], up = Math.sin(f * 0.25 + k * 1.7) > 0;
    box(c, gx - 8, base - 70, 16, 28, INK); box(c, gx - 7, base - 69, 14, 26, shirts[k]);
    box(c, gx - 6, base - 86, 12, 14, INK); box(c, gx - 5, base - 85, 10, 12, sk);
    box(c, gx - 6, base - 88, 12, 4, k % 2 ? '#1F1611' : '#A16207');
    // (the waving arm)
    c.strokeStyle = sk; c.lineWidth = 3; c.beginPath(); c.moveTo(gx + 6, base - 64); c.lineTo(gx + (up ? 16 : 12), base - (up ? 88 : 82)); c.stroke();
    if (k === 2) { box(c, gx - 16, base - 74, 8, 6, '#27272A'); }
  }
  // (the sign on the railing)
  box(c, x + 70, base - 112, 120, 24, INK); box(c, x + 72, base - 110, 116, 20, '#FEF3C7');
  signText(c, 'WAVE AT THE TRAIN!', x + 130, base - 96, { sx: 1, sy: 1, fill: '#7F1D1D' });
  box(c, x + 126, base - 88, 4, 48, '#6B4423');
};
/** A painted billboard on posts. */
const billboard = (c: Ctx, x: number, base: number, lines: string[]) => {
  for (const px of [x + 20, x + 150]) box(c, px, base - 90, 8, 90, '#5A3A1E');
  box(c, x - 2, base - 152, 184, 70, INK); box(c, x, base - 150, 180, 66, '#E8D8A8');
  box(c, x, base - 150, 180, 4, '#FFF8E0');
  lines.forEach((l, i) => signText(c, l, x + 90, base - 128 + i * 20, { sx: i ? 1 : 2, sy: i ? 1 : 2, fill: i === 2 ? '#B91C1C' : '#3F2A14' }));
};
/** The prop mine: a timber frame over a painted black hole, a cart on a stub of track, GOLD! on a board. */
const mineProp = (c: Ctx, x: number, base: number) => {
  box(c, x, base - 70, 70, 70, '#18181B');
  box(c, x - 8, base - 80, 86, 12, '#6B4423'); box(c, x - 6, base - 70, 10, 70, '#6B4423'); box(c, x + 66, base - 70, 10, 70, '#6B4423');
  box(c, x + 8, base - 108, 54, 22, INK); box(c, x + 10, base - 106, 50, 18, '#FDE047');
  signText(c, 'GOLD!', x + 35, base - 93, { sx: 2, sy: 2, fill: '#7F1D1D' });
  box(c, x + 90, base - 24, 40, 18, INK); box(c, x + 92, base - 22, 36, 14, '#52525B'); box(c, x + 94, base - 28, 32, 6, '#A16207');
};

// ---------------------------------------------------------------------------------------------------------------
// Behind the train: the embankment, the telegraph poles, the ballast and the ties

export const drawTrackside = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), a = state.camera.x - 40, b = state.camera.x + CANVAS_WIDTH + 40;
  // (the embankment behind the line, the robbers' road)
  box(c, a, BERM_Y, b - a, GY - BERM_Y, '#7A6040'); box(c, a, BERM_Y, b - a, 3, '#9A8060');
  for (let x = Math.floor((a + tr.dist) / 70) * 70 - tr.dist; x < b; x += 70) box(c, x + ((x * 13) % 30), BERM_Y + 12 + ((x * 7) % 20), 8, 3, '#5A4A30');
  // (the telegraph poles whipping by, their wires)
  const P = 560;
  for (let x = Math.floor((a + tr.dist * 0.9) / P) * P - tr.dist * 0.9; x < b + P; x += P) {
    box(c, x, ROOF - 190, 7, BERM_Y - ROOF + 190, '#4A3220'); box(c, x - 22, ROOF - 184, 52, 5, '#4A3220');
    for (const ix of [x - 18, x + 22]) box(c, ix, ROOF - 190, 4, 6, '#86EFAC');
  }
  c.strokeStyle = 'rgba(28, 18, 9, 0.6)'; c.lineWidth = 1;
  for (const dy of [-188, -180]) { c.beginPath(); c.moveTo(a, ROOF + dy); c.lineTo(b, ROOF + dy); c.stroke(); }
  // (the ballast and the ties, blurring past; the rails)
  box(c, a, GY - 6, b - a, CANVAS_HEIGHT + state.camera.y - GY + 10, '#6A625A');
  for (let x = Math.floor((a + tr.dist) / 36) * 36 - tr.dist; x < b; x += 36) box(c, x, GY - 4, 12, 10, '#3F2A1A');
  box(c, a, GY - 7, b - a, 3, '#A1A1AA'); box(c, a, GY - 7, b - a, 1, '#E4E4E7');
  for (let x = Math.floor((a + tr.dist * 1.0) / 23) * 23 - tr.dist; x < b; x += 23) box(c, x, GY + 8 + (Math.abs(Math.round(x)) % 5) * 4, 4, 2, '#8A8278');
};

// ---------------------------------------------------------------------------------------------------------------
// The cars

const COLOR: Record<CarKind, [string, string]> = {
  caboose: ['#A3262A', '#5A1418'], coach: ['#5A2A3A', '#341620'], diner: ['#2A4A3A', '#16281E'], baggage: ['#5A4A2A', '#33281A'],
  cattle: ['#7A4A2A', '#4A2A16'], boxcar: ['#8A3A22', '#5A2412'], flat: ['#5A3A1E', '#3A2412'], hopper: ['#4A4A52', '#2A2A30'],
  tank: ['#2A2A30', '#18181C'], tender: ['#26262C', '#141418'], engine: ['#A3262A', '#5A1418'],
};
const shade = (col: string, k: number) => mix(col, k > 0 ? '#FFFFFF' : '#000000', Math.abs(k));

/** A truck under a car: its frame and its two wheels, turning. */
const truck = (c: Ctx, x: number, roll: number) => {
  box(c, x - 26, DECK + 8, 52, 10, INK); box(c, x - 24, DECK + 9, 48, 7, '#3A3A40');
  for (const wx of [x - 14, x + 14]) {
    c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 10, 10.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#52525B'; c.beginPath(); c.arc(wx, GY - 10, 9, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) { const t = roll + (k * Math.PI) / 4; c.beginPath(); c.moveTo(wx - Math.cos(t) * 8, GY - 10 - Math.sin(t) * 8); c.lineTo(wx + Math.cos(t) * 8, GY - 10 + Math.sin(t) * 8); c.stroke(); }
  }
};

/** A car's floor and underframe, its trucks, the couplings' plates either side (lit: you stand on them). */
const underframe = (c: Ctx, x: number, len: number, roll: number) => {
  box(c, x - COUPLER / 2, DECK, len + COUPLER, 8, INK);
  box(c, x - COUPLER / 2, DECK + 1, len + COUPLER, 6, '#5A3A22');
  box(c, x - COUPLER / 2, DECK, len + COUPLER, 2, LIP);
  box(c, x, DECK + 7, len, 4, '#26262C');
  truck(c, x + 46, roll); truck(c, x + len - 46, roll);
  // (the couplers' knuckles at either end)
  box(c, x - 14, DECK + 8, 14, 7, '#3F3F46'); box(c, x + len, DECK + 8, 14, 7, '#3F3F46');
};
/** The end platforms' railings and the ladders up the car's ends. */
const ends = (c: Ctx, x: number, len: number) => {
  for (const [a, b] of [[x, x + END], [x + len - END, x + len]]) {
    box(c, a, DECK - 30, b - a, 3, '#3F3F46');
    for (const px of [a + 2, b - 4]) box(c, px, DECK - 30, 2, 30, '#3F3F46');
  }
  for (const lx of [x + END - 5, x + len - END + 1]) for (let y = DECK - 12; y > ROOF + 6; y -= 12) box(c, lx, y, 4, 2, '#A1A1AA');
};

/** A car he can go into, from outside: its side (the windows lit), its roof (lit top), its name. */
const exterior = (c: Ctx, i: number, x: number, f: number) => {
  const d = CARS[i], [col, dark] = COLOR[d.kind], a = x + END, w = d.len - 2 * END;
  box(c, a - 1, CEIL - 1, w + 2, DECK - CEIL + 2, INK);
  box(c, a, CEIL, w, DECK - CEIL, col);
  box(c, a, CEIL, w, 3, shade(col, 0.2)); box(c, a, DECK - 14, w, 14, dark);
  if (d.kind === 'cattle') {
    // (slats, the dark of the car between them: something big moving in there)
    for (let y = CEIL + 8; y < DECK - 14; y += 12) { box(c, a, y, w, 6, col); box(c, a, y + 6, w, 6, 'rgba(20, 12, 6, 0.75)'); }
    for (let x2 = a + 30; x2 < a + w - 10; x2 += 60) box(c, x2, CEIL, 5, DECK - CEIL - 14, dark);
  } else if (d.kind === 'baggage') {
    // (a big sliding door, two little barred windows)
    box(c, a + w / 2 - 40, CEIL + 14, 80, DECK - CEIL - 30, dark); box(c, a + w / 2 - 44, CEIL + 10, 88, 4, '#3F3F46');
    for (const wx of [a + 30, a + w - 54]) { box(c, wx, CEIL + 20, 24, 20, 'rgba(254, 230, 138, 0.55)'); for (let k = 0; k < 3; k++) box(c, wx + 4 + k * 7, CEIL + 20, 2, 20, '#3F3F46'); }
    signText(c, 'U.S. MAIL', a + w / 2, DECK - 17, painted(1, '#FDE68A', '#1C1209'));
  } else {
    // (a row of windows, lit from inside: whoever's in there a shape behind the glass)
    const n = Math.floor((w - 20) / 40);
    for (let k = 0; k < n; k++) { const wx = a + 14 + k * ((w - 28) / n); box(c, wx - 1, CEIL + 17, 26, 30, INK); box(c, wx, CEIL + 18, 24, 28, 'rgba(254, 230, 138, 0.55)'); box(c, wx, CEIL + 18, 24, 3, 'rgba(255, 255, 255, 0.35)'); }
    if (d.kind === 'coach' || d.kind === 'diner') signText(c, d.kind === 'diner' ? 'DINING CAR' : 'WILDERNESS LAND R.R.', a + w / 2, DECK - 4, { sx: 1, sy: 1, fill: '#F4CC4E' });
    if (d.kind === 'caboose') signText(c, 'W.L.R.R.', a + w / 2, DECK - 3, painted(1, '#FDE68A', '#1C1209'));
  }
  // (the doors at the ends of the side)
  for (const dx of [a + 2, a + w - 16]) { box(c, dx, CEIL + 10, 14, DECK - CEIL - 14, dark); box(c, dx + 10, CEIL + 50, 2, 3, '#E0B040'); }
  roof(c, i, x, f);
};
/** Its roof (the ceiling inside): the top lit (he stands on it), a clerestory, the caboose's cupola. */
const roof = (c: Ctx, i: number, x: number, f: number) => {
  const d = CARS[i], [col, dark] = COLOR[d.kind], a = x + END - 6, w = d.len - 2 * END + 12;
  box(c, a - 1, ROOF - 1, w + 2, CEIL - ROOF + 2, INK);
  box(c, a, ROOF, w, CEIL - ROOF, dark); box(c, a, ROOF, w, 3, LIP);
  if (d.kind === 'caboose') {
    const cx = x + d.len * 0.42;
    box(c, cx - 1, ROOF - 31, 66, 32, INK); box(c, cx, ROOF - 30, 64, 30, col); box(c, cx, ROOF - 30, 64, 3, LIP);
    box(c, cx + 6, ROOF - 22, 22, 14, '#FDE68A'); box(c, cx + 36, ROOF - 22, 22, 14, '#FDE68A');
    // (the stovepipe, smoking)
    box(c, x + d.len * 0.25, ROOF - 18, 6, 18, '#27272A');
    c.globalAlpha = 0.5; box(c, x + d.len * 0.25 - 4 - ((f * 0.5) % 20), ROOF - 28 - ((f * 0.3) % 10), 8, 8, '#A8A29E'); c.globalAlpha = 1;
  }
};

/** A car he can go into, opened up (he's in it): the back wall and its windows onto the scenery, what's in it, the
 *  lanterns swinging. */
const interior = (c: Ctx, i: number, x: number, f: number) => {
  const d = CARS[i], [col, dark] = COLOR[d.kind], a = x + END, w = d.len - 2 * END;
  const wall = mix(col, '#E8D8B8', 0.55), wain = mix(col, '#3A2410', 0.3);
  // (the back wall, with holes in it for its windows: the scenery going by shows through them)
  const n = Math.floor((w - 20) / 40), wins: number[] = [];
  if (d.kind !== 'baggage' && d.kind !== 'cattle') for (let k = 0; k < n; k++) wins.push(a + 14 + k * ((w - 28) / n));
  box(c, a, CEIL, w, 18, wall); box(c, a, CEIL + 46, w, DECK - CEIL - 46, wall);
  let wx0 = a;
  for (const wx of wins) { box(c, wx0, CEIL + 18, wx - wx0, 28, wall); wx0 = wx + 24; }
  box(c, wx0, CEIL + 18, a + w - wx0, 28, wall);
  for (const wx of wins) { box(c, wx - 3, CEIL + 15, 30, 3, '#6B4423'); box(c, wx - 3, CEIL + 46, 30, 3, '#6B4423'); box(c, wx - 3, CEIL + 15, 3, 34, '#6B4423'); box(c, wx + 24, CEIL + 15, 3, 34, '#6B4423'); }
  box(c, a, DECK - 40, w, 40, wain); box(c, a, DECK - 42, w, 3, mix(wain, '#FFFFFF', 0.3));
  if (d.kind === 'cattle') {
    box(c, a, CEIL, w, DECK - CEIL, mix(col, '#2A1A0A', 0.3));
    for (let y = CEIL + 14; y < DECK - 8; y += 14) box(c, a, y, w, 7, mix(col, '#E8C890', 0.15));
    // (hay, and what the cattle leave)
    for (let k = 0; k < w; k += 18) box(c, a + k, DECK - 6 - (k % 36 ? 2 : 6), 16, 8, '#D4B050');
    for (let k = 60; k < w; k += 130) box(c, a + k, DECK - 5, 10, 5, '#4A3018');
  } else {
    if (d.kind === 'coach') {
      // (the seats: plush benches facing each other, a luggage rack over them with bags on it)
      for (let k = 30; k < w - 30; k += 62) { box(c, a + k, DECK - 34, 10, 34, INK); box(c, a + k + 1, DECK - 33, 8, 32, '#7A2A2A'); box(c, a + k - 6, DECK - 18, 22, 6, '#5A1A1A'); }
      box(c, a + 4, CEIL + 8, w - 8, 3, '#A1A1AA');
      for (let k = 50; k < w - 40; k += 110) { box(c, a + k, CEIL + 0, 22, 8, '#8A5A30'); }
    } else if (d.kind === 'diner') {
      // (tables in white cloths, a lamp on each; the kitchen at the front end: the stove, pots, a counter)
      for (let k = 30; k < w - 130; k += 92) {
        box(c, a + k, DECK - 30, 50, 4, '#F8FAFC'); box(c, a + k + 2, DECK - 26, 46, 10, '#E7E5E4'); box(c, a + k + 22, DECK - 16, 6, 16, '#6B4423');
        box(c, a + k + 20, DECK - 40, 10, 10, '#FDE68A'); box(c, a + k + 8, DECK - 33, 8, 3, '#D4D4D8');
      }
      const kx = a + w - 120;
      box(c, kx, DECK - 40, 110, 40, '#52525B'); box(c, kx, DECK - 40, 110, 3, '#A1A1AA');
      box(c, kx + 10, DECK - 52, 20, 12, '#27272A'); box(c, kx + 40, DECK - 50, 24, 10, '#78716C');
      box(c, kx + 80, CEIL + 10, 6, DECK - CEIL - 50, '#3F3F46');
      for (let k = 0; k < 3; k++) box(c, kx + 12 + k * 30, CEIL + 22, 12, 14, '#A1A1AA');
    } else if (d.kind === 'baggage') {
      // (shelves of parcels, mail sacks heaped on the floor)
      for (const y of [CEIL + 22, CEIL + 52]) { box(c, a + 6, y, w - 12, 3, '#6B4423'); for (let k = 10; k < w - 30; k += 36) box(c, a + k, y - 14 + (k % 3) * 2, 24, 14 - (k % 3) * 2, k % 2 ? '#B08A5A' : '#C8A070'); }
      for (let k = 20; k < w - 30; k += 80) { box(c, a + k, DECK - 18, 30, 18, '#A8A29E'); box(c, a + k + 10, DECK - 22, 10, 6, '#78716C'); }
      signText(c, 'U.S. MAIL', a + w / 2, DECK - 46, painted(1, '#3F2A14', '#E8D8B8'));
    } else if (d.kind === 'caboose') {
      // (the pot-bellied stove and its pipe, the bunk, the desk, the ladder up into the cupola)
      box(c, a + 40, DECK - 34, 26, 34, '#27272A'); box(c, a + 46, CEIL, 8, DECK - CEIL - 34, '#3F3F46'); box(c, a + 46, DECK - 24, 14, 6, f % 20 < 10 ? '#F97316' : '#DC2626');
      box(c, a + 100, DECK - 30, 70, 10, '#7A4A2A'); box(c, a + 100, DECK - 34, 70, 4, '#E7E5E4');
      for (let y = DECK - 10; y > CEIL; y -= 10) box(c, a + d.len * 0.42 - END + 10, y, 30, 2, '#A1A1AA');
    }
  }
  // (the crates, solid: hop them)
  for (const cx of d.crates ?? []) { box(c, x + cx - 1, DECK - 41, 42, 41, INK); box(c, x + cx, DECK - 40, 40, 40, '#B08A5A'); box(c, x + cx, DECK - 40, 40, 3, LIP); c.strokeStyle = '#6B4423'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + cx + 3, DECK - 37); c.lineTo(x + cx + 37, DECK - 3); c.stroke(); }
  // (the ceiling, lit on top: the roof's still there to stand on)
  roof(c, i, x, f);
  // (the lanterns, swinging on their hooks)
  for (const [lx, ly] of lanterns(i, x, f)) { c.strokeStyle = '#3F3F46'; c.lineWidth = 1; c.beginPath(); c.moveTo(lx - (lx - Math.round(lx)), CEIL); c.lineTo(lx, ly - 6); c.stroke(); box(c, lx - 5, ly - 6, 10, 12, INK); box(c, lx - 4, ly - 5, 8, 10, '#FDE68A'); }
  void dark;
};

/** A car's lanterns (where they hang now, swinging). */
const lanterns = (i: number, x: number, f: number): [number, number][] => {
  const d = CARS[i];
  return [0.3, 0.7].map((k, n) => { const s = Math.sin(f * 0.06 + i + n * 1.3) * 6; return [x + d.len * k + s, CEIL + 18 - Math.abs(s) * 0.3]; });
};

/** A car he only crosses on top: its body or its load, the top of it lit (he stands on it). */
const topCar = (c: Ctx, i: number, x: number) => {
  const d = CARS[i], [col, dark] = COLOR[d.kind], top = TOP[d.kind]!, a = x + END, w = d.len - 2 * END;
  if (d.kind === 'boxcar') {
    box(c, a - 1, top - 1, w + 2, DECK - top + 2, INK); box(c, a, top, w, DECK - top, col);
    for (let k = a + 14; k < a + w; k += 14) box(c, k, top + 6, 1, DECK - top - 6, shade(col, -0.2));
    box(c, a + w / 2 - 34, top + 16, 68, DECK - top - 20, dark); box(c, a + w / 2 - 38, top + 12, 76, 4, '#3F3F46');
    signText(c, 'W.L.R.R.', a + 50, top + 34, painted(1, '#E7E5E4', '#1C1209'));
    box(c, a, top, w, 3, LIP); box(c, a + 20, top - 4, w - 40, 4, '#7A5030'); box(c, a + 20, top - 4, w - 40, 1, LIP);
  } else if (d.kind === 'flat') {
    // (the logs: three tiers of them, chained down; their cut ends ringed)
    for (let r = 0; r < 3; r++) {
      const ly = DECK - 22 * (r + 1), inset = r * 8;
      box(c, a + inset - 1, ly - 1, w - inset * 2 + 2, 22, INK); box(c, a + inset, ly, w - inset * 2, 20, r % 2 ? '#8A5A30' : '#9A6A3A');
      box(c, a + inset, ly + 3, w - inset * 2, 2, '#B07A48');
      for (const ex of [a + inset, a + w - inset - 14]) { c.fillStyle = '#E8C890'; c.beginPath(); c.arc(ex + 7, ly + 10, 8, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#8A5A30'; c.lineWidth = 1; c.beginPath(); c.arc(ex + 7, ly + 10, 4, 0, Math.PI * 2); c.stroke(); }
    }
    for (const chx of [a + w * 0.3, a + w * 0.7]) box(c, chx, top, 3, DECK - top, '#71717A');
    box(c, a + 16, top, w - 32, 3, LIP);
  } else if (d.kind === 'hopper') {
    c.fillStyle = INK; c.beginPath(); c.moveTo(a - 1, top - 1); c.lineTo(a + w + 1, top - 1); c.lineTo(a + w - 20, DECK + 1); c.lineTo(a + 20, DECK + 1); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(a, top); c.lineTo(a + w, top); c.lineTo(a + w - 20, DECK); c.lineTo(a + 20, DECK); c.closePath(); c.fill();
    for (let k = a + 30; k < a + w - 20; k += 40) box(c, k, top + 4, 4, DECK - top - 8, dark);
    // (the ore heaped up over its top: lit, you stand on it)
    for (let k = 0; k < w; k += 16) box(c, a + k, top - 4 - (k % 32 ? 0 : 3), 16, 6, k % 32 ? '#A16207' : '#B88A2A');
    box(c, a, top, w, 2, LIP);
    signText(c, 'ORE', a + w / 2, top + 44, painted(2, '#E7E5E4', '#1C1209'));
  } else if (d.kind === 'tank') {
    box(c, a - 1, top - 1, w + 2, DECK - top - 4, INK);
    c.fillStyle = col; c.beginPath(); c.roundRect(a, top, w, DECK - top - 6, 18); c.fill();
    box(c, a + 8, top + 6, w - 16, 3, shade(col, 0.25));
    box(c, a + w / 2 - 21, top - 15, 42, 16, INK); box(c, a + w / 2 - 20, top - 14, 40, 14, '#3A3A40'); box(c, a + w / 2 - 20, top - 14, 40, 2, LIP);
    signText(c, 'SARSAPARILLA', a + w / 2, top + 36, { sx: 1, sy: 1, fill: '#F4F4F5' });
    box(c, a + 6, top, w - 12, 2, LIP);
  } else if (d.kind === 'tender') {
    box(c, a - 1, top + 6, w + 2, DECK - top - 5, INK); box(c, a, top + 7, w, DECK - top - 7, col); box(c, a, top + 7, w, 3, '#E0B040');
    signText(c, 'W.L.R.R.', a + w / 2, top + 54, painted(1, '#E0B040', '#1C1209'));
    // (the coal heaped over it: lumps, a lit top)
    for (let k = 0; k < w; k += 12) { c.fillStyle = k % 24 ? '#18181B' : '#27272A'; c.beginPath(); c.arc(a + k + 6, top + 4, 7, Math.PI, 0); c.fill(); }
    box(c, a, top, w, 2, '#71717A');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame's drawing

/** Behind everybody: the trackside, the cars (opened up if he's inside one; the ones he only crosses), their trucks,
 *  the wrecks flying off the back. */
export const drawCarsBack = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, roll = tr.dist / 10;
  drawTrackside(c, state);
  for (let i = tr.rear; i < CARS.length; i++) {
    if (i === ENGINE || tr.cars[i]?.gone) continue;
    const x = carXNow(tr, i) + (tr.cut && tr.cut.phase === 'tell' && i === tr.cut.k ? tr.shudder : 0), d = CARS[i];
    if (!onScreen(state, x - COUPLER, x + d.len + COUPLER, 100)) continue;
    underframe(c, x, d.len, roll + i);
    ends(c, x, d.len);
    if (ENTERABLE.includes(d.kind)) { if (insideCar(state, tr, i)) interior(c, i, x, f); }
    else topCar(c, i, x);
  }
  drawWrecks(c, tr);
};

/** In front of the cast: the sides of the cars he isn't in (whoever's inside is behind the glass); the cut's warning
 *  over the coupling. */
export const drawCarsFront = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  for (let i = tr.rear; i < CARS.length; i++) {
    const d = CARS[i];
    if (!ENTERABLE.includes(d.kind) || tr.cars[i]?.gone) continue;
    const x = carXNow(tr, i) + (tr.cut && tr.cut.phase === 'tell' && i === tr.cut.k ? tr.shudder : 0);
    if (!onScreen(state, x, x + d.len, 60) || insideCar(state, tr, i)) continue;
    exterior(c, i, x, f);
  }
  // (the cut: a red ! over the coupling, UNCOUPLING!, then JUMP! as it goes)
  const cut = tr.cut;
  if (cut) {
    const cx = CAR_X[cut.k] + CARS[cut.k].len + COUPLER / 2 + offOf(tr, cut.k), y = DECK - 70;
    if (f % 12 < 8) {
      c.fillStyle = INK; c.beginPath(); c.arc(cx, y, 15, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.arc(cx, y, 13, 0, Math.PI * 2); c.fill();
      label(c, '!', cx + 1, y + 6, '#FEF3C7', 14);
      label(c, cut.phase === 'tell' ? 'UNCOUPLING!' : 'JUMP!', cx, y - 24, '#FDE047', 8);
    }
  }
};

/** The wrecks: cut cars off the line, tumbling away behind, shedding wheels and planks. */
const drawWrecks = (c: Ctx, tr: Train) => {
  for (const w of tr.wrecks) {
    w.t++; w.vy += 0.5; w.x += w.vx - tr.v * 0.3; w.y += w.vy; w.rot += w.vr;
    if (w.y > GY - 20) { w.y = GY - 20; w.vy *= -0.35; w.vr *= 0.7; }
    const [col, dark] = COLOR[w.kind];
    c.save(); c.translate(w.x + w.len / 2, w.y - 50); c.rotate(w.rot);
    box(c, -w.len / 2 - 1, -51, w.len + 2, 102, INK); box(c, -w.len / 2, -50, w.len, 100, col); box(c, -w.len / 2, 30, w.len, 20, dark);
    for (let k = -w.len / 2 + 20; k < w.len / 2 - 20; k += 40) box(c, k, -36, 22, 24, '#1C1917');
    c.restore();
  }
  tr.wrecks = tr.wrecks.filter(w => w.t < 150);
};

/** The cars' lanterns, the caboose's marker, for the lighting (world). */
export const carLamps = (state: GameState): Light[] => {
  const tr = trainOf(state), f = state.frame, out: Light[] = [];
  for (let i = tr.rear; i < CARS.length; i++) {
    const d = CARS[i];
    if (tr.cars[i]?.gone || !ENTERABLE.includes(d.kind)) continue;
    const x = carXNow(tr, i);
    if (!onScreen(state, x, x + d.len, 200)) continue;
    for (const [lx, ly] of lanterns(i, x, f)) out.push({ x: lx, y: ly, r: 130, a: 0.9, color: '#FFD08A' });
    if (d.kind === 'caboose') out.push({ x: x + 4, y: DECK - 40, r: 70, a: 0.8, color: '#F87171' });
  }
  void hash;
  return out;
};
