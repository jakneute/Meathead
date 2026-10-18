// The train and what goes by it, drawn (the prototype first pass: crude but readable: flat colors with a lit and a
// shaded tone, an ink edge, recognizable silhouettes). The scenery's the PARK's frontier going by (the land's joke: the
// real wilderness comes later): its painted mountain flats (kit.ts), then nearer, scrolling faster, fiberglass rock
// formations with their bolts and seams, plywood pine cutouts on braces, a split-rail park fence, a guest viewing deck
// with guests waving at the train (WAVE AT THE TRAIN!), a painted billboard, a prop mine with GOLD! on it; the far
// embankment behind the line, telegraph poles whipping by; under the train the ballast and the ties blurring past, the
// rails the wheels sit on.
//
// The cars (big, the playtest's): every floor, roof, load, step and fitting he can stand on has its lit top edge
// (standable reads standable). The cars he can go into are drawn from outside (their windows dimly lit) until he's in
// one: then that one's drawn opened up (its back wall, its windows onto whatever's going by, its racks, bunks, shelves,
// tables, crates, its lamps hung from the ceiling). The grades tilt the whole view (index.ts worldTilt): the train stays
// on its rails.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { label } from '../section';
import { GY } from '../geometry';
import { box, mix, INK, frontierSky, hash, painted, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { trainOf } from './state';
import { CARS, CAR_X, RAIL, DECK, ROOF, CEIL, COUPLER, END, TOP, ENTERABLE, ENGINE, fittings, type CarKind, type Fit } from './layout';
import { carXNow, insideCar, offOf } from './where';
import { drawTunnelInside, BERM_Y } from './passers';
import { viewOf, inView, screenY, ZOOM } from './view';

const LIP = '#E8C890';

// ---------------------------------------------------------------------------------------------------------------
// The scenery (screen space, scrolled by how far the world's gone by)

/** Screen space: the sky and the park's frontier going by (sinking as the line climbs, rising as it drops). */
export const drawScenery = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  const fake = { ...state, camera: { ...state.camera, x: state.camera.x + tr.dist } } as GameState;
  frontierSky(c, fake);
  const W = CANVAS_WIDTH, base = Math.round(screenY(state, BERM_Y + 24) + tr.climb * 0.5 * ZOOM);
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
// Behind the train: the far embankment, the telegraph poles, the inside of a tunnel, the ballast, the ties, the rails

export const drawTrackside = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), v = viewOf(state), a = v.x - 220, b = v.x + v.w + 220, bottom = v.y + v.h + 240;
  // (the embankment behind the line, its top lit)
  box(c, a, BERM_Y, b - a, GY - BERM_Y, '#7A6040'); box(c, a, BERM_Y, b - a, 3, '#9A8060');
  for (let x = Math.floor((a + tr.dist) / 70) * 70 - tr.dist; x < b; x += 70) box(c, x + ((Math.abs(Math.round(x)) * 13) % 30), BERM_Y + 12 + ((Math.abs(Math.round(x)) * 7) % 20), 8, 3, '#5A4A30');
  // (the telegraph poles whipping by, their wires: up over the roofs)
  const P = 560, ptop = ROOF - 150;
  for (let x = Math.floor((a + tr.dist * 0.9) / P) * P - tr.dist * 0.9; x < b + P; x += P) {
    box(c, x, ptop, 7, BERM_Y - ptop, '#4A3220'); box(c, x - 22, ptop + 6, 52, 5, '#4A3220');
    for (const ix of [x - 18, x + 22]) box(c, ix, ptop, 4, 6, '#86EFAC');
  }
  c.strokeStyle = 'rgba(28, 18, 9, 0.6)'; c.lineWidth = 1;
  for (const dy of [2, 10]) { c.beginPath(); c.moveTo(a, ptop + dy); c.lineTo(b, ptop + dy); c.stroke(); }
  // (a tunnel over the far side)
  drawTunnelInside(c, state);
  // (the ballast and the ties, blurring past; the rails the wheels sit on)
  box(c, a, GY - 6, b - a, bottom - GY + 6, '#6A625A');
  for (let x = Math.floor((a + tr.dist) / 36) * 36 - tr.dist; x < b; x += 36) box(c, x, GY - 4, 12, 10, '#3F2A1A');
  box(c, a, RAIL, b - a, 4, '#A1A1AA'); box(c, a, RAIL, b - a, 1, '#E4E4E7');
  for (let x = Math.floor((a + tr.dist) / 23) * 23 - tr.dist; x < b; x += 23) box(c, x, GY + 6 + (Math.abs(Math.round(x)) % 5) * 3, 4, 2, '#8A8278');
};

// ---------------------------------------------------------------------------------------------------------------
// The cars

const COLOR: Record<CarKind, [string, string]> = {
  caboose: ['#A3262A', '#5A1418'], coach: ['#5A2A3A', '#341620'], diner: ['#2A4A3A', '#16281E'], baggage: ['#5A4A2A', '#33281A'],
  cattle: ['#7A4A2A', '#4A2A16'], boxcar: ['#8A3A22', '#5A2412'], flat: ['#5A3A1E', '#3A2412'], hopper: ['#4A4A52', '#2A2A30'],
  tank: ['#2A2A30', '#18181C'], tender: ['#26262C', '#141418'], engine: ['#A3262A', '#5A1418'],
};
const shade = (col: string, k: number) => mix(col, k > 0 ? '#FFFFFF' : '#000000', Math.abs(k));

/** The wheels' radius: they sit right on the rails. */
const WR = 18;
/** A truck under a car: its frame and its two wheels on the rails, turning. */
const truck = (c: Ctx, x: number, roll: number) => {
  const wy = RAIL - WR;
  box(c, x - 36, DECK + 12, 72, 12, INK); box(c, x - 34, DECK + 13, 68, 9, '#3A3A40');
  for (const wx of [x - 20, x + 20]) {
    c.fillStyle = INK; c.beginPath(); c.arc(wx, wy, WR + 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#52525B'; c.beginPath(); c.arc(wx, wy, WR, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(wx, wy, WR - 5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 2;
    for (let k = 0; k < 4; k++) { const t = roll + (k * Math.PI) / 4; c.beginPath(); c.moveTo(wx - Math.cos(t) * (WR - 3), wy - Math.sin(t) * (WR - 3)); c.lineTo(wx + Math.cos(t) * (WR - 3), wy + Math.sin(t) * (WR - 3)); c.stroke(); }
    box(c, wx - 3, wy - 3, 6, 6, '#D4D4D8');
  }
  // (the side frame between the axles, down to just over the rail)
  box(c, x - 28, wy - 4, 56, 8, '#27272A');
};

/** A car's floor and underframe, its trucks, the couplings' plates either side (lit: you stand on them). */
const underframe = (c: Ctx, x: number, len: number, roll: number) => {
  box(c, x - COUPLER / 2, DECK, len + COUPLER, 12, INK);
  box(c, x - COUPLER / 2, DECK + 1, len + COUPLER, 10, '#5A3A22');
  box(c, x - COUPLER / 2, DECK, len + COUPLER, 2, LIP);
  box(c, x, DECK + 11, len, 5, '#26262C');
  truck(c, x + 70, roll); truck(c, x + len - 70, roll);
  // (the couplers' knuckles at either end)
  box(c, x - 18, DECK + 12, 18, 9, '#3F3F46'); box(c, x + len, DECK + 12, 18, 9, '#3F3F46');
};

/** The end platforms' railings, the grab irons up the car's ends, and its steps (lit treads: stand on them). */
const ends = (c: Ctx, i: number, x: number, len: number) => {
  for (const [a, b] of [[x, x + END], [x + len - END, x + len]]) {
    box(c, a, DECK - 34, b - a, 3, '#3F3F46');
    for (const px of [a + 2, b - 4]) box(c, px, DECK - 34, 2, 34, '#3F3F46');
  }
  const top = ENTERABLE.includes(CARS[i].kind) ? ROOF : TOP[CARS[i].kind] ?? DECK;
  const steps = fittings(i).filter(ft => ft.look === 'step');
  if (!steps.length) return;
  // (the ladder's rails up the end of the body, then the treads)
  for (const lx of [x + 4, x + 36, x + len - 38, x + len - 6]) box(c, lx, top + 4, 2, DECK - top - 4, '#71717A');
  for (const ft of steps) { const sx = x + ft.x; box(c, sx - 1, DECK - ft.h - 1, ft.w + 2, 8, INK); box(c, sx, DECK - ft.h, ft.w, 6, '#8A8A92'); box(c, sx, DECK - ft.h, ft.w, 2, LIP); }
};

/** The window spots along a car he goes into (x from its left end), all the same height (CEIL + 70 .. + 150). */
const windows = (i: number): number[] => {
  const d = CARS[i];
  if (d.kind === 'cattle' || d.kind === 'baggage') return [];
  const a = END + 36, b = d.len - END - 36, n = Math.max(2, Math.floor((b - a) / 64));
  return Array.from({ length: n }, (_, k) => a + ((b - a) * (k + 0.5)) / n);
};
const WIN_W = 34, WIN_T = CEIL + 70, WIN_H = 80;

/** A car he can go into, from outside: its side (the windows dim lit), its roof (lit top), its name. */
const exterior = (c: Ctx, i: number, x: number, f: number) => {
  const d = CARS[i], [col, dark] = COLOR[d.kind], a = x + END, w = d.len - 2 * END;
  box(c, a - 1, CEIL - 1, w + 2, DECK - CEIL + 2, INK);
  box(c, a, CEIL, w, DECK - CEIL, col);
  box(c, a, CEIL, w, 4, shade(col, 0.2)); box(c, a, DECK - 40, w, 40, dark);
  // (the letterboard under the eaves)
  box(c, a + 10, CEIL + 22, w - 20, 26, shade(col, -0.25));
  if (d.kind === 'cattle') {
    // (slats, the dark of the car between them: something big moving in there)
    for (let y = CEIL + 56; y < DECK - 40; y += 18) { box(c, a, y, w, 10, col); box(c, a, y + 10, w, 8, 'rgba(20, 12, 6, 0.75)'); }
    for (let x2 = a + 40; x2 < a + w - 10; x2 += 80) box(c, x2, CEIL + 50, 6, DECK - CEIL - 90, dark);
    signText(c, 'LIVESTOCK', a + w / 2, CEIL + 41, painted(1, '#FDE68A', '#1C1209'));
  } else if (d.kind === 'baggage') {
    // (a big sliding door, two little barred windows)
    box(c, a + w / 2 - 70, CEIL + 64, 140, DECK - CEIL - 104, dark); box(c, a + w / 2 - 76, CEIL + 58, 152, 6, '#3F3F46');
    for (const wx of [a + 40, a + w - 74]) { box(c, wx, CEIL + 90, 34, 34, 'rgba(254, 230, 138, 0.4)'); for (let k = 0; k < 4; k++) box(c, wx + 4 + k * 8, CEIL + 90, 2, 34, '#3F3F46'); }
    signText(c, 'U.S. MAIL', a + w / 2, CEIL + 41, painted(1, '#FDE68A', '#1C1209'));
  } else {
    // (a row of tall windows, dim lit from inside: you can't make out who's in there)
    for (const wx of windows(i)) {
      const sx = x + wx - WIN_W / 2;
      box(c, sx - 2, WIN_T - 2, WIN_W + 4, WIN_H + 4, INK); box(c, sx, WIN_T, WIN_W, WIN_H, 'rgba(214, 190, 120, 0.55)');
      box(c, sx, WIN_T, WIN_W, 4, 'rgba(255, 255, 255, 0.25)'); box(c, sx, WIN_T + WIN_H / 2 - 1, WIN_W, 2, INK);
      box(c, sx + 2, WIN_T + WIN_H + 10, WIN_W - 4, 50, shade(col, -0.12));
    }
    const name = d.kind === 'diner' ? 'DINING CAR' : d.kind === 'caboose' ? 'W.L.R.R.' : 'WILDERNESS LAND R.R.';
    signText(c, name, a + w / 2, CEIL + 41, painted(1, '#F4CC4E', '#1C1209'));
  }
  // (the doors at the ends of the side)
  for (const dx of [a + 4, a + w - 30]) { box(c, dx, CEIL + 56, 26, DECK - CEIL - 60, dark); box(c, dx + 20, CEIL + 160, 3, 5, '#E0B040'); }
  roof(c, i, x, f);
};
/** Its roof (the ceiling inside): the top lit (he stands on it), the caboose's cupola. */
const roof = (c: Ctx, i: number, x: number, f: number) => {
  const d = CARS[i], [col, dark] = COLOR[d.kind], a = x + END, w = d.len - 2 * END;
  box(c, a - 4, ROOF - 1, w + 8, CEIL - ROOF + 2, INK);
  box(c, a - 3, ROOF, w + 6, CEIL - ROOF, dark); box(c, a - 3, ROOF, w + 6, 3, LIP);
  if (d.kind === 'caboose') {
    const cx = x + d.len * 0.42;
    box(c, cx - 1, ROOF - 41, 86, 42, INK); box(c, cx, ROOF - 40, 84, 40, col); box(c, cx, ROOF - 40, 84, 3, LIP);
    box(c, cx + 8, ROOF - 30, 28, 18, 'rgba(214, 190, 120, 0.6)'); box(c, cx + 48, ROOF - 30, 28, 18, 'rgba(214, 190, 120, 0.6)');
    // (the stovepipe, smoking)
    box(c, x + d.len * 0.25, ROOF - 24, 8, 24, '#27272A');
    c.globalAlpha = 0.5; box(c, x + d.len * 0.25 - 4 - ((f * 0.5) % 20), ROOF - 36 - ((f * 0.3) % 10), 10, 10, '#A8A29E'); c.globalAlpha = 1;
  }
};

/** A fitting, drawn (its top lit where he can stand). */
const fitting = (c: Ctx, x: number, ft: Fit, col: string) => {
  const fx = x + ft.x, top = DECK - ft.h;
  switch (ft.look) {
    case 'rack': {
      // (a luggage rack: brass rails on brackets off the back wall, bags and cases on it)
      for (const bx of [fx + 6, fx + ft.w - 10]) box(c, bx, top + 6, 4, 18, '#A88A3A');
      box(c, fx - 1, top - 1, ft.w + 2, 8, INK); box(c, fx, top, ft.w, 6, '#C8A44C'); box(c, fx, top, ft.w, 2, LIP);
      for (let k = 8; k < ft.w - 20; k += 34) box(c, fx + k, top - 14 - (k % 3) * 2, 24, 14 + (k % 3) * 2, k % 2 ? '#7A4A2A' : '#3F5A7A');
      break;
    }
    case 'bunk': {
      box(c, fx - 1, top - 1, ft.w + 2, 14, INK); box(c, fx, top, ft.w, 12, '#7A4A2A'); box(c, fx + 4, top - 6, ft.w - 8, 7, '#E7E5E4'); box(c, fx, top, ft.w, 2, LIP);
      box(c, fx, top + 12, 6, DECK - top - 12, '#5A3A1E'); box(c, fx + ft.w - 6, top + 12, 6, DECK - top - 12, '#5A3A1E');
      box(c, fx + 10, top - 10, 24, 6, '#F5F5F4');
      break;
    }
    case 'shelf': case 'loft': {
      const wood = ft.look === 'loft' ? '#8A6A3A' : '#6B4423';
      box(c, fx - 1, top - 1, ft.w + 2, 10, INK); box(c, fx, top, ft.w, 8, wood); box(c, fx, top, ft.w, 2, LIP);
      if (ft.look === 'loft') {
        for (const px of [fx + 8, fx + ft.w - 14]) box(c, px, top + 8, 6, DECK - top - 8, '#5A3A1E');
        for (let k = 4; k < ft.w - 10; k += 22) box(c, fx + k, top - 8 - (k % 3) * 2, 20, 8 + (k % 3) * 2, '#D4B050');
      } else {
        for (const bx of [fx + 8, fx + ft.w - 12]) box(c, bx, top + 8, 4, 16, '#5A3A1E');
        for (let k = 6; k < ft.w - 18; k += 30) box(c, fx + k, top - 16 + (k % 2) * 4, 22, 16 - (k % 2) * 4, k % 3 ? '#B08A5A' : '#A1A1AA');
      }
      break;
    }
    case 'table': {
      box(c, fx - 1, top - 1, ft.w + 2, 8, INK); box(c, fx, top, ft.w, 6, '#F8FAFC'); box(c, fx, top, ft.w, 2, '#FFFFFF');
      box(c, fx + 4, top + 6, ft.w - 8, 10, '#E7E5E4'); box(c, fx + ft.w / 2 - 3, top + 16, 6, DECK - top - 16, '#6B4423');
      box(c, fx + ft.w / 2 - 4, top - 12, 8, 12, '#B8A060'); box(c, fx + 10, top - 4, 10, 4, '#D4D4D8');
      break;
    }
    case 'counter': case 'desk': {
      const tone = ft.look === 'counter' ? '#52525B' : '#7A4A2A';
      box(c, fx - 1, top - 1, ft.w + 2, ft.h + 1, INK); box(c, fx, top, ft.w, ft.h, tone); box(c, fx, top, ft.w, 3, LIP);
      if (ft.look === 'counter') { box(c, fx + 12, top - 12, 22, 12, '#27272A'); box(c, fx + 50, top - 10, 26, 10, '#78716C'); }
      else box(c, fx + 8, top - 8, 30, 8, '#E7E5E4');
      break;
    }
    case 'crate': {
      box(c, fx - 1, top - 1, ft.w + 2, (ft.solid ?? ft.h) + 1, INK); box(c, fx, top, ft.w, ft.solid ?? ft.h, '#B08A5A'); box(c, fx, top, ft.w, 3, LIP);
      c.strokeStyle = '#6B4423'; c.lineWidth = 2; c.beginPath(); c.moveTo(fx + 3, top + 3); c.lineTo(fx + ft.w - 3, top + (ft.solid ?? ft.h) - 3); c.moveTo(fx + ft.w - 3, top + 3); c.lineTo(fx + 3, top + (ft.solid ?? ft.h) - 3); c.stroke();
      break;
    }
    case 'bale': {
      box(c, fx - 1, top - 1, ft.w + 2, ft.h + 1, INK); box(c, fx, top, ft.w, ft.h, '#D4B050'); box(c, fx, top, ft.w, 3, LIP);
      for (const k of [0.3, 0.7]) box(c, fx + ft.w * k, top, 2, ft.h, '#8A6A2A');
      break;
    }
    case 'step': break;
  }
  void col;
};

/** A car he can go into, opened up (he's in it): the back wall and its windows onto whatever's going by, what's in it to
 *  climb, the lamps hung from the ceiling. */
const interior = (c: Ctx, i: number, x: number, f: number) => {
  const d = CARS[i], [col] = COLOR[d.kind], a = x + END, w = d.len - 2 * END;
  const wall = mix(col, '#E8D8B8', 0.55), wain = mix(col, '#3A2410', 0.3);
  // (the back wall, with holes in it for its windows: what's going by shows through them)
  const wins = windows(i).map(wx => x + wx - WIN_W / 2);
  box(c, a, CEIL, w, WIN_T - CEIL, wall); box(c, a, WIN_T + WIN_H, w, DECK - WIN_T - WIN_H, wall);
  let wx0 = a;
  for (const wx of wins) { box(c, wx0, WIN_T, wx - wx0, WIN_H, wall); wx0 = wx + WIN_W; }
  box(c, wx0, WIN_T, a + w - wx0, WIN_H, wall);
  for (const wx of wins) { box(c, wx - 3, WIN_T - 3, WIN_W + 6, 3, '#6B4423'); box(c, wx - 3, WIN_T + WIN_H, WIN_W + 6, 4, '#6B4423'); box(c, wx - 3, WIN_T - 3, 3, WIN_H + 7, '#6B4423'); box(c, wx + WIN_W, WIN_T - 3, 3, WIN_H + 7, '#6B4423'); }
  box(c, a, DECK - 60, w, 60, wain); box(c, a, DECK - 62, w, 3, mix(wain, '#FFFFFF', 0.3));
  // (the ceiling's curve, its ribs)
  box(c, a, CEIL, w, 14, mix(wall, '#000000', 0.2));
  for (let k = a + 30; k < a + w; k += 60) box(c, k, CEIL, 4, 14, mix(wall, '#000000', 0.35));
  if (d.kind === 'cattle') {
    box(c, a, CEIL, w, DECK - CEIL, mix(col, '#2A1A0A', 0.3));
    for (let y = CEIL + 20; y < DECK - 8; y += 18) box(c, a, y, w, 8, mix(col, '#E8C890', 0.15));
    // (hay, and what the cattle leave)
    for (let k = 0; k < w; k += 18) box(c, a + k, DECK - 6 - (k % 36 ? 2 : 6), 16, 8, '#D4B050');
    for (let k = 60; k < w; k += 130) box(c, a + k, DECK - 5, 10, 5, '#4A3018');
  } else if (d.kind === 'coach') {
    // (the seats: plush benches facing each other, low; the aisle)
    for (let k = 60; k < w - 40; k += 90) { box(c, a + k, DECK - 44, 12, 44, INK); box(c, a + k + 1, DECK - 43, 10, 42, '#7A2A2A'); box(c, a + k - 10, DECK - 22, 32, 8, '#5A1A1A'); }
  } else if (d.kind === 'diner') {
    // (the kitchen at the front end: the stove's flue, pots on hooks)
    const kx = a + w - 130;
    box(c, kx + 100, CEIL + 14, 8, DECK - CEIL - 70, '#3F3F46');
    for (let k = 0; k < 3; k++) box(c, kx + 10 + k * 30, CEIL + 40, 14, 16, '#A1A1AA');
  } else if (d.kind === 'baggage') {
    for (let k = 20; k < w - 30; k += 110) { box(c, a + k, DECK - 22, 36, 22, '#A8A29E'); box(c, a + k + 12, DECK - 26, 12, 6, '#78716C'); }
    signText(c, 'U.S. MAIL', a + w / 2, DECK - 70, painted(1, '#3F2A14', '#E8D8B8'));
  } else if (d.kind === 'caboose') {
    // (the pot-bellied stove and its pipe; the ladder up into the cupola)
    box(c, a + 210, DECK - 40, 30, 40, '#27272A'); box(c, a + 218, CEIL + 14, 10, DECK - CEIL - 54, '#3F3F46'); box(c, a + 216, DECK - 28, 16, 8, f % 20 < 10 ? '#F97316' : '#DC2626');
  }
  for (const ft of fittings(i)) if (ft.look !== 'step') fitting(c, x, ft, col);
  // (the ceiling, lit on top: the roof's still there to stand on)
  roof(c, i, x, f);
  // (the lamps, hung from the ceiling, swinging a little: dim, warm)
  for (const [lx, ly] of lamps(i, x, f)) { c.strokeStyle = '#3F3F46'; c.lineWidth = 1; c.beginPath(); c.moveTo(Math.round(lx), CEIL + 14); c.lineTo(lx, ly - 6); c.stroke(); box(c, lx - 6, ly - 6, 12, 14, INK); box(c, lx - 5, ly - 5, 10, 12, '#D8B868'); }
};

/** A car's hanging lamps (where they hang now, swinging). */
const lamps = (i: number, x: number, f: number): [number, number][] => {
  const d = CARS[i];
  return [0.25, 0.5, 0.75].map((k, n) => { const s = Math.sin(f * 0.05 + i + n * 1.3) * 5; return [x + d.len * k + s, CEIL + 46 - Math.abs(s) * 0.3]; });
};

/** A car he only crosses on top: its body or its load, the top of it lit (he stands on it). */
const topCar = (c: Ctx, i: number, x: number) => {
  const d = CARS[i], [col, dark] = COLOR[d.kind], top = TOP[d.kind]!, a = x + END, w = d.len - 2 * END;
  if (d.kind === 'boxcar') {
    box(c, a - 1, top - 1, w + 2, DECK - top + 2, INK); box(c, a, top, w, DECK - top, col);
    for (let k = a + 16; k < a + w; k += 16) box(c, k, top + 8, 1, DECK - top - 8, shade(col, -0.2));
    box(c, a + w / 2 - 60, top + 40, 120, DECK - top - 48, dark); box(c, a + w / 2 - 66, top + 34, 132, 6, '#3F3F46');
    signText(c, 'W.L.R.R.', a + 70, top + 70, painted(2, '#E7E5E4', '#1C1209'));
    box(c, a, top, w, 3, LIP); box(c, a + 24, top - 5, w - 48, 5, '#7A5030'); box(c, a + 24, top - 5, w - 48, 1, LIP);
  } else if (d.kind === 'flat') {
    // (the logs: three tiers of them, chained down; their cut ends ringed)
    for (let r = 0; r < 3; r++) {
      const ly = DECK - 44 * (r + 1), inset = r * 10;
      box(c, a + inset - 1, ly - 1, w - inset * 2 + 2, 44, INK); box(c, a + inset, ly, w - inset * 2, 42, r % 2 ? '#8A5A30' : '#9A6A3A');
      box(c, a + inset, ly + 5, w - inset * 2, 3, '#B07A48');
      for (const ex of [a + inset, a + w - inset - 28]) { c.fillStyle = '#E8C890'; c.beginPath(); c.arc(ex + 14, ly + 21, 17, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#8A5A30'; c.lineWidth = 1.5; c.beginPath(); c.arc(ex + 14, ly + 21, 9, 0, Math.PI * 2); c.stroke(); }
    }
    for (const chx of [a + w * 0.3, a + w * 0.7]) box(c, chx, top, 4, DECK - top, '#71717A');
    box(c, a + 20, top, w - 40, 3, LIP);
  } else if (d.kind === 'hopper') {
    c.fillStyle = INK; c.beginPath(); c.moveTo(a - 1, top - 1); c.lineTo(a + w + 1, top - 1); c.lineTo(a + w - 40, DECK + 1); c.lineTo(a + 40, DECK + 1); c.closePath(); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(a, top); c.lineTo(a + w, top); c.lineTo(a + w - 40, DECK); c.lineTo(a + 40, DECK); c.closePath(); c.fill();
    for (let k = a + 40; k < a + w - 30; k += 50) box(c, k, top + 6, 5, DECK - top - 12, dark);
    // (the ore heaped up over its top: lit, you stand on it)
    for (let k = 0; k < w; k += 18) box(c, a + k, top - 5 - (k % 36 ? 0 : 4), 18, 8, k % 36 ? '#A16207' : '#B88A2A');
    box(c, a, top, w, 2, LIP);
    signText(c, 'ORE', a + w / 2, top + 90, painted(3, '#E7E5E4', '#1C1209'));
  } else if (d.kind === 'tank') {
    box(c, a - 1, top - 1, w + 2, DECK - top - 4, INK);
    c.fillStyle = col; c.beginPath(); c.roundRect(a, top, w, DECK - top - 6, 40); c.fill();
    box(c, a + 16, top + 10, w - 32, 4, shade(col, 0.25));
    box(c, a + w / 2 - 27, top - 19, 54, 20, INK); box(c, a + w / 2 - 26, top - 18, 52, 18, '#3A3A40'); box(c, a + w / 2 - 26, top - 18, 52, 2, LIP);
    signText(c, 'SARSAPARILLA', a + w / 2, top + 100, painted(2, '#F4F4F5', '#1C1209'));
    box(c, a + 14, top, w - 28, 2, LIP);
  } else if (d.kind === 'tender') {
    box(c, a - 1, top + 6, w + 2, DECK - top - 5, INK); box(c, a, top + 7, w, DECK - top - 7, col); box(c, a, top + 7, w, 3, '#E0B040');
    signText(c, 'W.L.R.R.', a + w / 2, top + 44, painted(1, '#E0B040', '#1C1209'));
    // (the coal heaped over it: lumps, a lit top)
    for (let k = 0; k < w; k += 12) { c.fillStyle = k % 24 ? '#18181B' : '#27272A'; c.beginPath(); c.arc(a + k + 6, top + 4, 7, Math.PI, 0); c.fill(); }
    box(c, a, top, w, 2, '#71717A');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame's drawing

/** Behind everybody: the cars (opened up if he's inside one; the ones he only crosses), their trucks on the rails. */
export const drawCarsBack = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame, roll = tr.dist / WR;
  for (let i = tr.rear; i < CARS.length; i++) {
    if (i === ENGINE || tr.cars[i]?.gone) continue;
    const x = carXNow(tr, i) + (tr.cut && tr.cut.phase === 'tell' && i === tr.cut.k ? tr.shudder : 0), d = CARS[i];
    if (!inView(state, x - COUPLER, x + d.len + COUPLER, 100)) continue;
    underframe(c, x, d.len, roll + i);
    ends(c, i, x, d.len);
    if (ENTERABLE.includes(d.kind)) { if (insideCar(state, tr, i)) interior(c, i, x, f); }
    else topCar(c, i, x);
  }
};

/** In front of the cast: the sides of the cars he isn't in (whoever's in there out of sight); the cut's warning over the
 *  coupling; the switch it'll go off the line at. */
export const drawCarsFront = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  for (let i = tr.rear; i < CARS.length; i++) {
    const d = CARS[i];
    if (!ENTERABLE.includes(d.kind) || tr.cars[i]?.gone) continue;
    const x = carXNow(tr, i) + (tr.cut && tr.cut.phase === 'tell' && i === tr.cut.k ? tr.shudder : 0);
    if (!inView(state, x, x + d.len, 60) || insideCar(state, tr, i)) continue;
    exterior(c, i, x, f);
  }
  // (the cut: a red ! over the coupling, UNCOUPLING!, then JUMP! as it goes)
  const cut = tr.cut;
  if (cut) {
    const cx = CAR_X[cut.k] + CARS[cut.k].len + COUPLER / 2 + offOf(tr, cut.k), y = DECK - 90;
    if (f % 12 < 8 && (cut.phase === 'tell' || cut.off > -260)) {
      c.fillStyle = INK; c.beginPath(); c.arc(cx, y, 15, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#DC2626'; c.beginPath(); c.arc(cx, y, 13, 0, Math.PI * 2); c.fill();
      label(c, '!', cx + 1, y + 6, '#FEF3C7', 14);
      label(c, cut.phase === 'tell' ? 'UNCOUPLING!' : 'JUMP!', cx, y - 24, '#FDE047', 8);
    }
    // (the switch stand by the line: its lever, its target disc (green: the main line; red: thrown), the points)
    if (cut.sw !== undefined) {
      const sx = cut.sw, red = !!cut.thrown;
      box(c, sx - 40, RAIL + 1, 80, 3, red ? '#D4D4D8' : '#71717A');
      box(c, sx + 50, GY - 50, 6, 52, '#3F3F46'); box(c, sx + 40, GY - 4, 26, 6, '#27272A');
      box(c, sx + 46, GY - 20, 14, 4, '#52525B');
      c.fillStyle = INK; c.beginPath(); c.arc(sx + 53, GY - 58, 13, 0, Math.PI * 2); c.fill();
      c.fillStyle = red ? '#DC2626' : '#16A34A'; c.beginPath(); c.arc(sx + 53, GY - 58, 11, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#3F3F46'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx + 53, GY - 14); c.lineTo(sx + 53 + (red ? -16 : 16), GY - 30); c.stroke();
    }
  }
};

/** The wrecks: each cut car slews off the rails at the switch, slides down the near bank and goes over on its side
 *  (wheels up), dust and planks; then left there, going by with the ground. */
export const stepWrecks = (state: GameState) => {
  const tr = trainOf(state), v = viewOf(state);
  for (const w of tr.wrecks) {
    w.t++;
    w.vx += (-tr.v - w.vx) * (w.t > 0 ? 0.05 : 0.01);
    w.x += w.vx;
    if (w.t <= 0) continue;
    const k = Math.min(1, w.t / 40);
    w.y = 70 * k * k; w.rot = 0.22 * Math.sin(Math.min(1, w.t / 30) * Math.PI);
    w.tip = Math.min(1, Math.max(0, (w.t - 10) / 34));
    if (w.t < 46 && w.t % 3 === 0) for (let n = 0; n < 3; n++) state.particles.push({ pos: { x: w.x + Math.random() * w.len, y: GY + w.y - 10 }, vel: { x: (Math.random() - 0.5) * 4 - 2, y: -1 - Math.random() * 3 }, life: 30, color: n % 2 ? '#A8977A' : '#8A5A30', size: 3 + Math.random() * 3 });
    if (w.t === 22) playSound('crash', 0.7, -16);
  }
  tr.wrecks = tr.wrecks.filter(w => w.x + w.len > v.x - 300 && w.t < 2000);
};
export const drawWrecks = (c: Ctx, state: GameState) => {
  const tr = trainOf(state);
  for (const w of tr.wrecks) {
    const [col, dark] = COLOR[w.kind], body = ENTERABLE.includes(w.kind) ? DECK - ROOF : DECK - (TOP[w.kind] ?? DECK - 100);
    const H = body + 50, flip = Math.cos(w.tip * Math.PI);
    c.save();
    c.translate(w.x + w.len / 2, GY + w.y - H / 2 - 4);
    c.rotate(w.rot);
    c.scale(1, flip === 0 ? 0.01 : flip);
    // (the body, its floor, its trucks: upside down once it's gone over)
    box(c, -w.len / 2 - 1, -H / 2 - 1, w.len + 2, body + 2, INK); box(c, -w.len / 2, -H / 2, w.len, body, col);
    box(c, -w.len / 2, -H / 2 + body - 20, w.len, 20, dark);
    if (ENTERABLE.includes(w.kind)) for (let k = -w.len / 2 + 60; k < w.len / 2 - 50; k += 64) box(c, k, -H / 2 + 70, 30, 70, '#1C1917');
    box(c, -w.len / 2 + 30, H / 2 - 50, w.len - 60, 10, INK);
    for (const tx of [-w.len / 2 + 70, w.len / 2 - 70]) for (const dx of [-20, 20]) { c.fillStyle = INK; c.beginPath(); c.arc(tx + dx, H / 2 - 22, WR + 1, 0, Math.PI * 2); c.fill(); c.fillStyle = '#52525B'; c.beginPath(); c.arc(tx + dx, H / 2 - 22, WR - 1, 0, Math.PI * 2); c.fill(); }
    // (splintered, broken planks along its side)
    for (let k = 0; k < 5; k++) box(c, -w.len / 2 + hash(w.seed + k) * (w.len - 40), -H / 2 + hash(w.seed * 3 + k) * body, 30, 4, '#8A5A30');
    c.restore();
  }
};

/** The lights in the cars (world), for the lighting (the playtest: muted, no spotlights): the car he's in lit right
 *  through (a soft fill; its lamps' warmth), the others only a dim glow at their windows; the caboose's marker. */
export const carLamps = (state: GameState): Light[] => {
  const tr = trainOf(state), f = state.frame, out: Light[] = [];
  for (let i = tr.rear; i < CARS.length; i++) {
    const d = CARS[i];
    if (tr.cars[i]?.gone || !ENTERABLE.includes(d.kind)) continue;
    const x = carXNow(tr, i);
    if (!inView(state, x, x + d.len, 200)) continue;
    if (insideCar(state, tr, i)) {
      for (let lx = x + END + 60; lx < x + d.len - END - 30; lx += 110) out.push({ x: lx, y: CEIL + 160, r: 200, a: 0.95 });
      for (const [lx, ly] of lamps(i, x, f)) out.push({ x: lx, y: ly, r: 110, a: 0.3, color: '#4A3818' });
    } else {
      for (const wx of windows(i)) out.push({ x: x + wx, y: WIN_T + WIN_H / 2, r: 44, a: 0.3, color: '#3A2C12' });
    }
    if (d.kind === 'caboose') out.push({ x: x + 4, y: DECK - 60, r: 50, a: 0.35, color: '#5A1A1A' });
  }
  return out;
};
