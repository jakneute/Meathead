// The cars, drawn (the final pass: peak SNES): Lonesome Pine Station's train (wilds/stationArt.ts) at the train
// section's big car sizes: the red cupola caboose, the maroon clerestory coaches in gold pinstripes, the Pullman-green
// dining cars, the olive mail cars, the slatted cattle cars, the outside-braced boxcars in boxcar red, the log flats,
// the ore hoppers, the SARSAPARILLA tank car, the tender in black and brass. Each car's still art is painted once for
// the hour (paint.ts still(), kept under the grades' tilt) in four layers, all local to the car's left end and the
// ground line (y = 0 at GY):
//
//   base   behind everybody: the floor's beam and its lit lip, the sills, the truss rods and queenposts, the brake
//          gear, the couplers, the end platforms' railings and brake wheels, the ladders and their lit treads;
//   top    the cars he only crosses: their bodies and loads, each top lit (he stands on it);
//   int    a car he's in, opened up: the back wall (holes in it for its windows: what's going by shows through), the
//          wainscot, the ceiling's curve and ribs, the furniture, what he climbs (racks, bunks, shelves, tables, the
//          counter, the desk, crates, bales, the hayloft: every top lit);
//   ext    in front of the cast: the sides of the cars he isn't in (whoever's in there out of sight), their windows dim
//          lit (warm after dark), their roofs (lit tops).
//
// Live: the trucks' wheels going round, the lamps swinging, the stoves' fire, the stovepipes' smoke, the wrecks.

import { signText } from '../../signLetters';
import { painted } from '../kit';
import { GY } from '../geometry';
import {
  type Ctx, box, checker, mix, hash, INK, stillAt, N, slab, post, rivets, planks, boards, lip, glass, warmth, wheel, barrel, flame, puff,
  RED, MAROON, IRON, BLACK, BRASS, VARNISH, GREEN, OLIVE, OXIDE, FIR, CREAM, PLUSH, HAY, ORE, COAL, GOLD, STEEL, BARK, PLANK,
} from './paint';
import { CARS, RAIL, DECK, ROOF, CEIL, COUPLER, END, TOP, ENTERABLE, fittings, type CarKind, type Fit } from './layout';

// Local heights (y = 0 at the ground line).
const Dk = DECK - GY, Cl = CEIL - GY, Rf = ROOF - GY, Rl = RAIL - GY;
/** The wheels' radius: they sit right on the rails. */
export const WR = 18;

/** Each kind's body ramp. */
export const BODY: Record<CarKind, string[]> = {
  caboose: RED, coach: MAROON, diner: GREEN, baggage: OLIVE, cattle: FIR, boxcar: OXIDE, flat: VARNISH, hopper: IRON, tank: BLACK, tender: BLACK, engine: RED,
};

/** The window spots along a car he goes into (x from its left end), all the same height (CEIL + 70 .. + 150). */
export const windows = (i: number): number[] => {
  const d = CARS[i];
  if (d.kind === 'cattle' || d.kind === 'baggage') return [];
  const a = END + 36, b = d.len - END - 36, n = Math.max(2, Math.floor((b - a) / 64));
  return Array.from({ length: n }, (_, k) => a + ((b - a) * (k + 0.5)) / n);
};
const winOf = (kind: CarKind, len: number) => windows(CARS.findIndex(d => d.kind === kind && d.len === len));
export const WIN_W = 34, WIN_T = CEIL + 70, WIN_H = 80;
const Wt = WIN_T - GY;
/** The caboose's pot-bellied stove (x along its body), clear of the bunks and the desk. */
const STOVE = 152;

// ---------------------------------------------------------------------------------------------------------------
// The base: underframe, ends, ladders

const paintBase = (g: Ctx, kind: CarKind, len: number) => {
  const S = N(STEEL), B = N(BLACK), V = N(VARNISH), Bd = N(BODY[kind]);
  const a = -COUPLER / 2, b = len + COUPLER / 2;
  // (the floor: its beam end on, the deck's planks seen at the edge, the lit lip: you stand on it; the plates over the
  // couplings)
  box(g, a, Dk, b - a, 13, INK);
  boards(g, a, Dk + 1, b - a, 5, V, 5, len);
  box(g, a, Dk + 6, b - a, 6, mix(Bd[1], V[1], 0.5)); box(g, a, Dk + 6, b - a, 1, Bd[2]);
  for (let x = 6; x < len - 6; x += 22) { box(g, x, Dk + 7, 2, 2, INK); box(g, x, Dk + 7, 1, 1, S[5]); }
  lip(g, a, Dk, b - a);
  for (const px of [a, len - 4]) { box(g, px, Dk + 1, 30, 4, S[3]); box(g, px, Dk + 1, 30, 1, S[5]); box(g, px + 4, Dk + 2, 2, 2, INK); box(g, px + 22, Dk + 2, 2, 2, INK); }
  // (under it: the sills, the truss rods sagging to their queenposts, the brake cylinder and its rods, the couplers'
  // knuckles and the link between)
  box(g, 0, Dk + 12, len, 5, INK); box(g, 0, Dk + 12, len, 4, B[2]); box(g, 0, Dk + 12, len, 1, B[4]);
  const qa = len * 0.36, qb = len * 0.64;
  for (const qx of [qa, qb]) { box(g, qx - 2, Dk + 16, 5, 10, INK); box(g, qx - 1, Dk + 16, 3, 9, S[3]); }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(40, Dk + 15); g.lineTo(qa, Dk + 25); g.lineTo(qb, Dk + 25); g.lineTo(len - 40, Dk + 15); g.stroke();
  g.strokeStyle = S[4]; g.lineWidth = 1; g.stroke();
  box(g, len / 2 - 16, Dk + 16, 32, 8, INK); box(g, len / 2 - 15, Dk + 17, 30, 6, B[3]); box(g, len / 2 - 15, Dk + 17, 30, 1, B[5]); box(g, len / 2 + 15, Dk + 19, 30, 2, S[2]);
  for (const [kx, dir] of [[-18, -1], [len, 1]] as const) {
    box(g, kx, Dk + 12, 18, 10, INK); box(g, kx + 1, Dk + 13, 16, 8, S[2]); box(g, kx + 1, Dk + 13, 16, 2, S[4]);
    box(g, kx + (dir < 0 ? -4 : 16), Dk + 14, 6, 6, INK); box(g, kx + (dir < 0 ? -3 : 17), Dk + 15, 4, 4, S[3]);
  }
  // (the end platforms: their railings and posts, a brake wheel on its staff at each)
  if (kind !== 'tender' && kind !== 'engine') for (const [p0, p1] of [[0, END], [len - END, len]]) {
    box(g, p0, Dk - 35, p1 - p0, 4, INK); box(g, p0, Dk - 34, p1 - p0, 2, B[4]); box(g, p0, Dk - 34, p1 - p0, 1, B[6]);
    for (const px of [p0 + 2, p1 - 4]) { box(g, px - 1, Dk - 34, 4, 34, INK); box(g, px, Dk - 34, 2, 34, B[4]); box(g, px, Dk - 34, 1, 34, B[6]); }
    for (let px = p0 + 10; px < p1 - 6; px += 8) box(g, px, Dk - 32, 1, 30, B[3]);
    const wx = p0 < len / 2 ? p0 + 14 : p1 - 14;
    box(g, wx - 1, Dk - 52, 3, 52, INK); box(g, wx, Dk - 52, 1, 52, S[4]);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(wx + 0.5, Dk - 52, 9, 3, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = S[4]; g.lineWidth = 1; g.stroke();
  }
  // (the ladder up the body's end: iron rails, then the treads (lit: stand on them))
  const top = ENTERABLE.includes(kind) ? Rf : (TOP[kind] ?? DECK) - GY;
  const idx = CARS.findIndex(d => d.kind === kind && d.len === len);
  const steps = idx >= 0 ? fittings(idx).filter(ft => ft.look === 'step') : [];
  if (!steps.length) return;
  for (const lx of [4, 36, len - 38, len - 6]) { box(g, lx - 1, top + 3, 4, Dk - top - 3, INK); box(g, lx, top + 4, 2, Dk - top - 4, S[3]); box(g, lx, top + 4, 1, Dk - top - 4, S[5]); }
  for (let y = top + 18; y < Dk - 8; y += 22) for (const lx of [4, len - 38]) { box(g, lx, y, 34, 2, INK); box(g, lx, y, 34, 1, S[4]); }
  for (const ft of steps) {
    const sx = ft.x, sy = Dk - ft.h;
    box(g, sx - 1, sy - 1, ft.w + 2, 9, INK); slab(g, sx, sy, ft.w, 7, N(PLANK)); lip(g, sx, sy, ft.w);
    box(g, sx + 2, sy + 7, 3, 4, S[2]); box(g, sx + ft.w - 5, sy + 7, 3, 4, S[2]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The outsides of the cars he goes into

/** The roof (the ceiling inside): tar-black over its eave molding, lit along the top (he stands on it), its overhang. */
const roofSlab = (g: Ctx, len: number, Bd: string[]) => {
  const B = N(BLACK), a = END, w = len - 2 * END;
  box(g, a - 5, Rf - 1, w + 10, Cl - Rf + 4, INK);
  box(g, a - 4, Rf, w + 8, Cl - Rf + 2, B[3]);
  box(g, a - 4, Rf + 5, w + 8, 2, B[2]); checker(g, a - 4, Rf + 4, w + 8, 2, B[4], 0);
  box(g, a - 4, Cl, w + 8, 3, Bd[1]); box(g, a - 4, Cl, w + 8, 1, Bd[4]);
  for (let x = a + 8; x < a + w; x += 30) box(g, x, Rf + 3, 1, Cl - Rf - 3, B[2]);
  lip(g, a - 4, Rf, w + 8);
};

/** A window from outside: its arched (or square) sash, the glass, the curtain tied back inside, the sill. */
const outWindow = (g: Ctx, x: number, arch: boolean, Bd: string[], warm: number, seed: number) => {
  const V = N(VARNISH), r = arch ? 14 : 2;
  g.fillStyle = INK; g.beginPath(); g.roundRect(x - 3, Wt - 3, WIN_W + 6, WIN_H + 6, [r + 2, r + 2, 2, 2]); g.fill();
  g.fillStyle = V[4]; g.beginPath(); g.roundRect(x - 2, Wt - 2, WIN_W + 4, WIN_H + 4, [r + 1, r + 1, 1, 1]); g.fill();
  g.save(); g.beginPath(); g.roundRect(x, Wt, WIN_W, WIN_H, [r, r, 0, 0]); g.clip();
  glass(g, x, Wt, WIN_W, WIN_H, warm);
  // (the curtain inside, tied back to one side; a silhouette in the odd window, someone's hat)
  const cs = seed % 2 ? x + WIN_W - 9 : x;
  box(g, cs, Wt, 9, WIN_H, mix(N(PLUSH)[3], '#000000', 0.2)); box(g, cs + (seed % 2 ? 0 : 7), Wt, 2, WIN_H, N(PLUSH)[5]);
  if (seed % 3 === 0) { const hx = x + 12; box(g, hx, Wt + WIN_H - 30, 12, 30, mix('#1A1210', warm > 0.5 ? '#3A2210' : '#1A2A36', 0.4)); box(g, hx + 1, Wt + WIN_H - 40, 10, 11, mix('#1A1210', '#2A3A48', 0.3)); box(g, hx - 2, Wt + WIN_H - 42, 14, 3, '#0E0A08'); }
  g.restore();
  box(g, x - 2, Wt + WIN_H / 2 - 1, WIN_W + 4, 3, INK); box(g, x - 2, Wt + WIN_H / 2 - 1, WIN_W + 4, 1, V[5]);
  box(g, x - 4, Wt + WIN_H + 2, WIN_W + 8, 4, INK); box(g, x - 3, Wt + WIN_H + 2, WIN_W + 6, 2, V[5]);
  void Bd;
};

/** The ends of a car body seen past its side: corner posts, the vestibule door's frame and its brass handle. */
const corners = (g: Ctx, len: number, Bd: string[]) => {
  for (const cx of [END, len - END - 8]) { box(g, cx - 1, Cl, 10, Dk - Cl, INK); box(g, cx, Cl, 8, Dk - Cl, Bd[2]); box(g, cx, Cl, 2, Dk - Cl, Bd[4]); box(g, cx + 6, Cl, 2, Dk - Cl, Bd[1]); }
  for (const hx of [END + 12, len - END - 16]) { box(g, hx, Cl + 150, 3, 26, INK); box(g, hx + 1, Cl + 151, 1, 24, BRASS[4]); }
};

const paintExt = (g: Ctx, kind: CarKind, len: number) => {
  const Bd = N(BODY[kind]), a = END, w = len - 2 * END, warm = warmth(), V = N(VARNISH), S = N(STEEL);
  box(g, a - 1, Cl - 1, w + 2, Dk - Cl + 2, INK);
  if (kind === 'caboose') {
    // (red planks standing up, the windows square in their frames, the belt rail, gold lettering)
    planks(g, a, Cl, w, Dk - Cl, Bd, 7, 13);
    box(g, a, Cl, w, 3, Bd[5]); box(g, a, Dk - 30, w, 30, Bd[1]); checker(g, a, Dk - 34, w, 4, Bd[2], 0);
    box(g, a, Wt + WIN_H + 14, w, 4, INK); box(g, a, Wt + WIN_H + 14, w, 3, Bd[4]); box(g, a, Wt + WIN_H + 14, w, 1, Bd[6]);
    winOf(kind, len).forEach((wx, k) => outWindow(g, wx - WIN_W / 2, false, Bd, warm, k + 1));
    signText(g, 'W.L.R.R.', a + w / 2, Cl + 42, { sx: 2, sy: 2, fill: GOLD, shadow: Bd[0] });
    signText(g, 'No. 13', a + w / 2, Dk - 46, { sx: 1, sy: 1, fill: GOLD, shadow: Bd[0] });
  } else if (kind === 'cattle') {
    // (slats with the dark of the car between them, its posts and braces, the LIVESTOCK board)
    const F = Bd;
    box(g, a, Cl, w, Dk - Cl, '#0E0804');
    for (let y = Cl + 56, r = 0; y < Dk - 30; y += 18, r++) { box(g, a, y, w, 11, INK); boards(g, a, y, w, 10, F, 10, r * 7); }
    box(g, a, Cl, w, 52, F[3]); planks(g, a, Cl, w, 52, F, 9, 5);
    box(g, a, Dk - 30, w, 30, F[2]); planks(g, a, Dk - 30, w, 30, F, 9, 9);
    for (let x2 = a + 10; x2 < a + w - 10; x2 += 66) { box(g, x2 - 1, Cl, 10, Dk - Cl, INK); slab(g, x2, Cl, 8, Dk - Cl, F); }
    for (let x2 = a + 10; x2 < a + w - 76; x2 += 132) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x2 + 8, Dk - 30); g.lineTo(x2 + 66, Cl + 52); g.stroke(); g.strokeStyle = F[3]; g.lineWidth = 5; g.stroke(); g.strokeStyle = F[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x2 + 7, Dk - 32); g.lineTo(x2 + 65, Cl + 50); g.stroke(); }
    box(g, a + w / 2 - 64, Cl + 14, 128, 26, INK); slab(g, a + w / 2 - 63, Cl + 15, 126, 24, N(PLANK));
    signText(g, 'LIVESTOCK', a + w / 2, Cl + 31, painted(1, '#F4E2A8', '#2A1608'));
    for (const hx of [a + 30, a + w - 40]) { box(g, hx, Dk - 24, 12, 4, INK); box(g, hx + 1, Dk - 23, 10, 2, S[4]); }
  } else if (kind === 'baggage') {
    // (olive planks, the big sliding door on its track, two barred windows, U.S. MAIL; the mail crane's catcher arm)
    planks(g, a, Cl, w, Dk - Cl, Bd, 6, 21);
    box(g, a, Cl, w, 3, Bd[5]); box(g, a, Dk - 30, w, 30, Bd[1]); checker(g, a, Dk - 34, w, 4, Bd[2], 0);
    box(g, a + 4, Cl + 52, w - 8, 1, GOLD); box(g, a + 4, Dk - 36, w - 8, 1, BRASS[3]);
    const dx = a + w / 2 - 70;
    box(g, dx - 8, Cl + 56, 156, 7, INK); box(g, dx - 7, Cl + 57, 154, 4, S[3]); box(g, dx - 7, Cl + 57, 154, 1, S[5]);
    box(g, dx - 1, Cl + 63, 142, Dk - Cl - 101, INK); planks(g, dx, Cl + 64, 140, Dk - Cl - 104, N(OLIVE.map(c => mix(c, '#000000', 0.12))), 10, 3);
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(dx + 4, Cl + 70); g.lineTo(dx + 136, Dk - 46); g.moveTo(dx + 136, Cl + 70); g.lineTo(dx + 4, Dk - 46); g.stroke();
    g.strokeStyle = Bd[2]; g.lineWidth = 3; g.stroke();
    for (const rx of [dx + 12, dx + 118]) { g.fillStyle = INK; g.beginPath(); g.arc(rx, Cl + 63, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = S[4]; g.beginPath(); g.arc(rx, Cl + 63, 3.5, 0, Math.PI * 2); g.fill(); }
    box(g, dx + 128, Cl + 150, 5, 30, INK); box(g, dx + 129, Cl + 151, 3, 28, S[5]);
    for (const wx of [a + 40, a + w - 74]) {
      box(g, wx - 3, Cl + 87, 40, 40, INK); box(g, wx - 2, Cl + 88, 38, 38, V[4]);
      glass(g, wx, Cl + 90, 34, 34, warm * 0.8);
      for (let k = 0; k < 4; k++) { box(g, wx + 4 + k * 8, Cl + 90, 3, 34, INK); box(g, wx + 5 + k * 8, Cl + 90, 1, 34, S[5]); }
    }
    signText(g, 'U.S. MAIL', a + w / 2, Cl + 40, { sx: 2, sy: 2, fill: GOLD, shadow: Bd[0] });
    signText(g, 'W.L.R.R. EXPRESS', a + w / 2, Dk - 16, { sx: 1, sy: 1, fill: GOLD, shadow: Bd[0] });
    // (the catcher arm folded against the side by the door)
    box(g, dx - 26, Cl + 110, 4, 100, INK); box(g, dx - 25, Cl + 111, 2, 98, S[4]);
    box(g, dx - 34, Cl + 150, 20, 4, INK); box(g, dx - 33, Cl + 151, 18, 2, S[5]);
  } else {
    // (a coach, a diner: the lower panel's siding, the belt rail, the window band's pilasters, the letterboard in gold,
    // the clerestory's little colored panes under the eaves, gold pinstripes)
    box(g, a, Cl, w, Dk - Cl, Bd[3]);
    planks(g, a, Wt + WIN_H + 8, w, Dk - (Wt + WIN_H + 8), Bd, 4, kind === 'diner' ? 31 : 17);
    box(g, a, Cl, w, 4, Bd[5]); box(g, a, Cl, 3, Dk - Cl, Bd[4]); box(g, a + w - 4, Cl, 4, Dk - Cl, Bd[1]);
    box(g, a, Dk - 26, w, 26, Bd[1]); checker(g, a, Dk - 30, w, 4, Bd[2], 0);
    // (the clerestory's panes)
    box(g, a + 6, Cl + 5, w - 12, 12, INK);
    for (let x = a + 8; x < a + w - 12; x += 16) { box(g, x, Cl + 6, 13, 10, ['#B8862C', '#6A9A5A', '#B84A3A', '#5A7AA8'][Math.floor(x / 16) % 4]); box(g, x, Cl + 6, 13, 2, '#F2E2A8'); box(g, x + 13, Cl + 6, 3, 10, Bd[2]); }
    // (the letterboard)
    box(g, a + 8, Cl + 22, w - 16, 28, INK); box(g, a + 9, Cl + 23, w - 18, 26, Bd[2]); box(g, a + 9, Cl + 23, w - 18, 1, Bd[4]); box(g, a + 9, Cl + 48, w - 18, 1, Bd[0]);
    box(g, a + 12, Cl + 26, w - 24, 1, GOLD); box(g, a + 12, Cl + 45, w - 24, 1, GOLD);
    signText(g, kind === 'diner' ? 'DINING CAR' : 'WILDERNESS LAND R.R.', a + w / 2, Cl + 42, { sx: kind === 'diner' ? 2 : 1, sy: kind === 'diner' ? 2 : 1, fill: GOLD, shadow: Bd[0] });
    // (pilasters between the windows, the belt rail under them)
    const ws = winOf(kind, len);
    for (let k = 0; k <= ws.length; k++) {
      const px = k === 0 ? a + 10 : k === ws.length ? a + w - 14 : (ws[k - 1] + ws[k]) / 2 - 2;
      box(g, px - 1, Wt - 6, 6, WIN_H + 14, INK); box(g, px, Wt - 6, 4, WIN_H + 14, Bd[2]); box(g, px, Wt - 6, 1, WIN_H + 14, Bd[5]);
    }
    box(g, a, Wt + WIN_H + 8, w, 5, INK); box(g, a, Wt + WIN_H + 8, w, 4, Bd[4]); box(g, a, Wt + WIN_H + 8, w, 1, Bd[6]);
    box(g, a + 4, Wt - 9, w - 8, 1, GOLD); box(g, a + 4, Dk - 34, w - 8, 1, BRASS[3]);
    ws.forEach((wx, k) => outWindow(g, wx - WIN_W / 2, true, Bd, warm, k + (kind === 'diner' ? 1 : 0)));
    if (kind === 'diner') {
      // (the kitchen's end: a louvered vent instead of a window panel under the belt, its stovepipe up through the roof)
      const kx = a + w - 64;
      box(g, kx, Dk - 70, 40, 34, INK); box(g, kx + 1, Dk - 69, 38, 32, Bd[2]);
      for (let y = Dk - 66; y < Dk - 38; y += 5) { box(g, kx + 3, y, 34, 2, Bd[1]); box(g, kx + 3, y, 34, 1, Bd[4]); }
    } else signText(g, 'COACH No. 4', a + w / 2, Dk - 46, { sx: 1, sy: 1, fill: GOLD, shadow: Bd[0] });
  }
  corners(g, len, Bd);
  roofSlab(g, len, Bd);
  outsideFittings(g, kind, len);
};

/** What's on the outside of a car he goes into but not its side, so it's there whether the car's shut or opened up
 *  (paintExt and paintInt both): the caboose's marker lamps on its ends; on the roof, the caboose's cupola (its top lit:
 *  stand on it; it's solid either way) and stovepipe, the diner's stovepipe (their smoke's drawn live either way). */
const outsideFittings = (g: Ctx, kind: CarKind, len: number) => {
  const Bd = N(BODY[kind]), a = END, w = len - 2 * END, warm = warmth(), V = N(VARNISH), B = N(BLACK);
  if (kind === 'caboose') {
    // (the marker lamp at the back: red lens in brass; another at the front, unlit)
    for (const [mx, lit] of [[a - 12, true], [a + w + 2, false]] as const) {
      box(g, mx - 1, Cl + 98, 12, 18, INK); box(g, mx, Cl + 99, 10, 16, BRASS[3]); box(g, mx, Cl + 99, 2, 16, BRASS[5]);
      box(g, mx + 2, Cl + 103, 6, 7, lit ? '#E8262A' : '#4A1416'); if (lit) box(g, mx + 2, Cl + 103, 2, 2, '#FF9A8A');
      box(g, mx + 3, Cl + 95, 4, 4, INK);
    }
  }
  if (kind === 'caboose') {
    const cx = Math.round(len * 0.42), R = Bd;
    box(g, cx - 1, Rf - 41, 86, 42, INK);
    planks(g, cx, Rf - 40, 84, 40, R, 7, 41);
    box(g, cx + 78, Rf - 40, 6, 40, R[1]);
    for (const wx of [cx + 8, cx + 48]) { box(g, wx - 2, Rf - 32, 32, 22, INK); box(g, wx - 1, Rf - 31, 30, 20, V[4]); glass(g, wx, Rf - 30, 28, 18, warm); box(g, wx + 13, Rf - 30, 2, 18, V[3]); }
    box(g, cx - 4, Rf - 41, 92, 6, INK); box(g, cx - 3, Rf - 40, 90, 4, B[3]); box(g, cx - 3, Rf - 36, 90, 1, B[1]); lip(g, cx - 3, Rf - 40, 90);
  }
  if (kind === 'caboose' || kind === 'diner') {
    const sx = Math.round(kind === 'caboose' ? len * 0.25 : len - END - 40);
    box(g, sx - 1, Rf - 26, 10, 26, INK); box(g, sx, Rf - 25, 8, 25, B[3]); box(g, sx, Rf - 25, 2, 25, B[5]);
    box(g, sx - 4, Rf - 30, 16, 5, INK); box(g, sx - 3, Rf - 29, 14, 3, B[4]); box(g, sx - 3, Rf - 29, 14, 1, B[6]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The cars he crosses on top

/** A log seen side on (one of a tier): bark in rolling plates, banded round, lit along its top; its cut end ringed. */
const log = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  const Bk = N(BARK), Pl = N(PLANK);
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  const bands: [number, string][] = [[0.12, Bk[5]], [0.16, Bk[4]], [0.3, Bk[3]], [0.24, Bk[2]], [0.18, Bk[1]]];
  let yy = y;
  for (const [k, col] of bands) { box(g, x, yy, w, h * k + 1, col); yy += h * k; }
  checker(g, x, y + h * 0.28, w, 2, Bk[4], seed % 2);
  for (let i = 0; i < w / 14; i++) { const px = x + hash(seed + i) * (w - 12), py = y + 3 + hash(seed * 3 + i) * (h - 10); box(g, px, py, 8 + hash(i + seed) * 8, 2, Bk[1]); box(g, px + 1, py - 1, 6, 1, Bk[5]); }
  for (const ex of [x, x + w - h * 0.5]) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(ex + h * 0.25, y + h / 2, h * 0.27, h / 2 + 0.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Pl[5]; g.beginPath(); g.ellipse(ex + h * 0.25, y + h / 2, h * 0.24, h / 2 - 1, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = Pl[3]; g.lineWidth = 1;
    for (const k of [0.66, 0.4, 0.16]) { g.beginPath(); g.ellipse(ex + h * 0.25, y + h / 2, h * 0.24 * k, (h / 2 - 1) * k, 0, 0, Math.PI * 2); g.stroke(); }
    box(g, ex + h * 0.2, y + h / 2 - 1, 2, 2, Pl[2]);
  }
};

const paintTop = (g: Ctx, kind: CarKind, len: number) => {
  const Bd = N(BODY[kind]), top = (TOP[kind] ?? DECK) - GY, a = END, w = len - 2 * END, S = N(STEEL), B = N(BLACK);
  if (kind === 'boxcar') {
    // (boxcar red planks, outside-braced (posts and diagonals), the sliding door on its track, the lettering; the roof's
    // running board flush on top, lit: he stands on it)
    box(g, a - 1, top - 1, w + 2, Dk - top + 2, INK);
    planks(g, a, top, w, Dk - top, Bd, 6, 77);
    box(g, a, Dk - 24, w, 24, Bd[1]); checker(g, a, Dk - 28, w, 4, Bd[2], 0);
    const dx = a + w / 2 - 62;
    for (let x2 = a + 6; x2 < a + w; x2 += Math.round((w - 12) / 6)) {
      if (x2 > dx - 10 && x2 < dx + 130) continue;
      box(g, x2 - 1, top + 6, 8, Dk - top - 10, INK); slab(g, x2, top + 6, 6, Dk - top - 10, Bd);
    }
    for (const [x2, dir] of [[a + 6, 1], [a + w - 6, -1]] as const) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x2, Dk - 8); g.lineTo(x2 + dir * 84, top + 10); g.stroke(); g.strokeStyle = Bd[3]; g.lineWidth = 5; g.stroke(); g.strokeStyle = Bd[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x2 - 1, Dk - 10); g.lineTo(x2 + dir * 84 - 1, top + 8); g.stroke(); }
    box(g, dx - 8, top + 34, 140, 7, INK); box(g, dx - 7, top + 35, 138, 4, S[3]); box(g, dx - 7, top + 35, 138, 1, S[5]);
    box(g, dx - 1, top + 41, 126, Dk - top - 49, INK); planks(g, dx, top + 42, 124, Dk - top - 51, N(OXIDE.map(c => mix(c, '#000000', 0.15))), 10, 8);
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(dx + 4, top + 48); g.lineTo(dx + 120, Dk - 14); g.moveTo(dx + 120, top + 48); g.lineTo(dx + 4, Dk - 14); g.stroke(); g.strokeStyle = Bd[2]; g.lineWidth = 3; g.stroke();
    box(g, dx + 114, top + 150, 4, 34, INK); box(g, dx + 115, top + 151, 2, 32, S[5]);
    signText(g, 'W.L.R.R.', a + 80, top + 66, { sx: 2, sy: 2, fill: '#ECE4D0', shadow: Bd[0] });
    signText(g, 'No. 2207', a + 80, top + 90, { sx: 1, sy: 1, fill: '#ECE4D0', shadow: Bd[0] });
    signText(g, 'CAPY 40000', a + w - 80, Dk - 40, { sx: 1, sy: 1, fill: '#ECE4D0', shadow: Bd[0] });
    box(g, a - 3, top - 2, w + 6, 6, INK); box(g, a - 2, top - 1, w + 4, 4, Bd[2]);
    box(g, a + 18, top - 1, w - 36, 4, N(PLANK)[3]); for (let x = a + 18; x < a + w - 18; x += 24) box(g, x, top - 1, 1, 4, N(PLANK)[1]);
    lip(g, a - 2, top, w + 4);
  } else if (kind === 'flat') {
    // (the flatcar's deck and its stakes, three tiers of logs chained down, the chains' binders)
    box(g, a - 1, Dk - 8, w + 2, 9, INK); boards(g, a, Dk - 7, w, 7, N(VARNISH), 7, 5);
    for (let r = 0; r < 3; r++) {
      const ly = Dk - 8 - 41.3 * (r + 1), inset = r * 3;
      for (let k = 0; k < 2; k++) log(g, a + inset, ly + k * 20.6, w - inset * 2, 20, r * 11 + k * 3 + 1);
    }
    for (const sx of [a + 2, a + w * 0.33, a + w * 0.66, a + w - 8]) { box(g, sx - 1, top + 2, 8, Dk - top - 2, INK); slab(g, sx, top + 3, 6, Dk - top - 3, N(VARNISH)); }
    for (const chx of [a + w * 0.2, a + w * 0.5, a + w * 0.8]) {
      for (let y = top; y < Dk - 8; y += 5) { box(g, chx - 1, y, 5, 4, INK); box(g, chx, y + 1, 3, 2, (y / 5) % 2 ? S[4] : S[2]); }
      box(g, chx - 4, top + 50, 11, 6, INK); box(g, chx - 3, top + 51, 9, 4, S[3]); box(g, chx + 4, top + 44, 3, 12, S[4]);
    }
    lip(g, a, top, w, ['#3A2410', '#8A6034', '#D8A464', '#F4D2A0']);
  } else if (kind === 'hopper') {
    // (planked, strapped with iron, the slope sheets down to the chutes; the ore heaped level with the top (lit))
    const path = () => { g.beginPath(); g.moveTo(a, top); g.lineTo(a + w, top); g.lineTo(a + w - 40, Dk); g.lineTo(a + 40, Dk); g.closePath(); };
    g.save(); g.fillStyle = INK; g.translate(0, 0); path(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.fill(); path(); g.clip();
    boards(g, a, top, w, Dk - top, N(VARNISH.map(c => mix(c, IRON[3], 0.35))), 9, 33);
    box(g, a, top, w, 12, Bd[3]); box(g, a, top + 10, w, 2, Bd[1]);
    for (let k = a + 30; k < a + w - 20; k += 52) { box(g, k - 1, top, 8, Dk - top, INK); box(g, k, top, 6, Dk - top, Bd[3]); box(g, k, top, 1, Dk - top, Bd[5]); box(g, k + 5, top, 1, Dk - top, Bd[1]); for (let y = top + 10; y < Dk; y += 24) { box(g, k + 2, y, 2, 2, INK); box(g, k + 2, y, 1, 1, Bd[6]); } }
    box(g, a + 40, Dk - 30, w - 80, 30, Bd[1]); checker(g, a + 40, Dk - 34, w - 80, 4, Bd[2], 0);
    g.restore();
    for (const cx of [a + w * 0.35, a + w * 0.65]) { box(g, cx - 13, Dk - 14, 26, 14, INK); box(g, cx - 12, Dk - 13, 24, 12, Bd[2]); box(g, cx - 12, Dk - 13, 24, 1, Bd[4]); }
    const O = N(ORE);
    box(g, a + 2, top + 1, w - 4, 8, O[2]);
    for (let k = 0; k < w - 8; k += 7) { const rh = 2 + hash(k * 0.37) * 3; box(g, a + 4 + k, top + 3 - rh * 0.3, 7, rh + 3, O[3 + (k % 3 === 0 ? 1 : 0)]); box(g, a + 4 + k, top + 3 - rh * 0.3, 3, 1, O[5]); if (hash(k) > 0.8) box(g, a + 6 + k, top + 3, 1, 1, '#F2E2A0'); }
    lip(g, a + 1, top, w - 2, ['#3A1C0C', '#8A5A2A', '#D8A060', '#F4D49A']);
    signText(g, 'ORE', a + w / 2, top + 100, { sx: 3, sy: 3, fill: '#E8E0CC', shadow: Bd[0] });
    signText(g, 'W.L.R.R.', a + w / 2, top + 130, { sx: 1, sy: 1, fill: '#E8E0CC', shadow: Bd[0] });
  } else if (kind === 'tank') {
    // (its cradle and saddle bands, the tank banded round, riveted at its seams, the dome on top (its top lit), the
    // lettering)
    box(g, a + 10, Dk - 24, w - 20, 24, INK); box(g, a + 11, Dk - 23, w - 22, 22, B[2]); box(g, a + 11, Dk - 23, w - 22, 1, B[4]);
    g.save(); g.beginPath(); g.roundRect(a, top, w, Dk - top - 8, 40); g.clip();
    barrel(g, a - 1, top - 1, w + 2, Dk - top - 6, Bd);
    for (const sx of [a + w * 0.25, a + w * 0.5, a + w * 0.75]) { box(g, sx, top, 2, Dk - top, INK); box(g, sx + 2, top, 1, Dk - top, Bd[4]); for (let y = top + 8; y < Dk - 16; y += 9) { box(g, sx - 3, y, 2, 2, INK); box(g, sx - 3, y, 1, 1, Bd[6]); } }
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(a, top, w, Dk - top - 8, 40); g.stroke();
    for (const bx of [a + 60, a + w - 66]) { box(g, bx - 1, top + 4, 8, Dk - top - 10, INK); box(g, bx, top + 4, 6, Dk - top - 10, S[3]); box(g, bx, top + 4, 1, Dk - top - 10, S[5]); }
    const dx = a + w / 2 - 26;
    box(g, dx - 1, top - 19, 54, 21, INK); barrel(g, dx, top - 18, 52, 18, Bd); box(g, dx - 4, top - 20, 60, 4, INK); box(g, dx - 3, top - 19, 58, 2, BRASS[3]);
    lip(g, dx - 3, top - 18, 58);
    box(g, a + 30, top + 2, w - 60, 2, Bd[5]); lip(g, a + 20, top, w - 40);
    signText(g, 'SARSAPARILLA', a + w / 2, top + 98, { sx: 2, sy: 2, fill: ['#FFF4D0', '#F2D27A', '#C8962E'], shadow: Bd[0], dither: true });
    signText(g, 'WILDERNESS LAND BOTTLING CO.', a + w / 2, top + 120, { sx: 1, sy: 1, fill: '#D8CCB0', shadow: Bd[0] });
  } else if (kind === 'tender') {
    // (the station's tender: black, brass-trimmed, riveted, gold lettering; heaped with coal, cordwood stacked at its
    // back end; the water hatch)
    const t0 = top + 7;
    box(g, a - 1, t0 - 1, w + 2, Dk - t0 + 2, INK); box(g, a, t0, w, Dk - t0, Bd[3]);
    box(g, a, t0, w, 3, Bd[5]); box(g, a, t0, 3, Dk - t0, Bd[4]); box(g, a + w - 4, t0, 4, Dk - t0, Bd[1]);
    box(g, a, t0 + 5, w, 2, BRASS[3]); box(g, a, t0 + 5, w, 1, BRASS[5]); box(g, a, Dk - 6, w, 2, BRASS[2]);
    rivets(g, a + 4, a + w - 4, t0 + 10, Bd[6]); rivets(g, a + 4, a + w - 4, Dk - 10, Bd[6]);
    for (let x = a + 60; x < a + w; x += 60) { box(g, x, t0 + 8, 1, Dk - t0 - 14, Bd[1]); box(g, x + 1, t0 + 8, 1, Dk - t0 - 14, Bd[4]); }
    signText(g, 'W.L.R.R.', a + w / 2, t0 + 38, { sx: 2, sy: 2, fill: GOLD, shadow: Bd[0] });
    const C = N(COAL), V = N(VARNISH);
    for (let k = 0; k < w; k += 9) { const r = 5 + hash(k * 0.7) * 3; g.fillStyle = INK; g.beginPath(); g.arc(a + k + 5, top + 5, r + 1, Math.PI, 0); g.fill(); g.fillStyle = C[2 + (k % 2)]; g.beginPath(); g.arc(a + k + 5, top + 5, r, Math.PI, 0); g.fill(); box(g, a + k + 3, top + 1, 2, 1, C[5]); }
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const lx = a + 4 + k * 13 + r * 6, ly = top - 2 - r * 8; box(g, lx - 1, ly - 1, 14, 10, INK); box(g, lx, ly, 12, 8, V[3 + ((k + r) % 2)]); box(g, lx, ly, 12, 2, V[5]); g.fillStyle = V[6]; g.beginPath(); g.ellipse(lx + 2, ly + 4, 2, 3.4, 0, 0, Math.PI * 2); g.fill(); }
    lip(g, a, top, w, ['#121216', '#34343E', '#6E6E7E', '#A8A8B8']);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The insides

/** A fitting, drawn (its top lit where he can stand). */
const fitting = (g: Ctx, ft: Fit, seed: number) => {
  const fx = ft.x, top = Dk - ft.h, V = N(VARNISH), S = N(STEEL), P = N(PLANK);
  switch (ft.look) {
    case 'rack': {
      // (a luggage rack: brass rods on brackets off the wall, bags and cases and a hatbox on it)
      for (const bx of [fx + 6, fx + ft.w - 10]) { box(g, bx - 1, top + 4, 6, 22, INK); box(g, bx, top + 5, 4, 20, BRASS[3]); box(g, bx, top + 5, 1, 20, BRASS[5]); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(bx + 2, top + 24); g.lineTo(bx + (bx < fx + 20 ? -8 : 10), top + 34); g.stroke(); g.strokeStyle = BRASS[3]; g.lineWidth = 1; g.stroke(); }
      for (let k = 8; k < ft.w - 22; k += 32) {
        const bw = 24 + (k % 3) * 2, bh = 13 + ((k + seed) % 3) * 3, kind = (k / 32 + seed) % 3;
        const col = kind === 0 ? '#7A4A2A' : kind === 1 ? '#3F5A7A' : '#8A3A4A';
        box(g, fx + k - 1, top - bh - 1, bw + 2, bh + 1, INK); slab(g, fx + k, top - bh, bw, bh, N([mix(col, INK, 0.6), mix(col, INK, 0.4), mix(col, INK, 0.2), col, mix(col, '#FFFFFF', 0.2), mix(col, '#FFFFFF', 0.4)]));
        box(g, fx + k + bw / 2 - 3, top - bh - 4, 6, 3, INK); box(g, fx + k + 2, top - bh + 4, bw - 4, 1, BRASS[3]);
        if (kind === 2) { box(g, fx + k + 3, top - bh - 2, bw - 6, 2, '#F2E8D0'); }
      }
      box(g, fx - 1, top - 1, ft.w + 2, 8, INK);
      for (const ry of [top, top + 4]) { box(g, fx, ry, ft.w, 3, BRASS[3]); box(g, fx, ry, ft.w, 1, BRASS[5]); }
      lip(g, fx, top, ft.w, ['#6A4410', '#C8962E', '#FFF0A8', '#FFF8D8']);
      break;
    }
    case 'bunk': {
      // (a bunk: its frame, a striped wool blanket over the tick, a pillow; its posts to the floor)
      for (const px of [fx, fx + ft.w - 6]) { box(g, px - 1, top - 4, 8, Dk - top + 4, INK); slab(g, px, top - 3, 6, Dk - top + 3, V); }
      box(g, fx - 1, top - 1, ft.w + 2, 15, INK); slab(g, fx, top + 6, ft.w, 8, V);
      const bl = seed % 2 ? '#8A2A2A' : '#3A5A3A';
      box(g, fx + 2, top, ft.w - 4, 7, '#E8E0CC'); box(g, fx + 24, top, ft.w - 28, 7, bl); box(g, fx + 24, top, ft.w - 28, 1, mix(bl, '#FFFFFF', 0.3));
      for (let x = fx + 34; x < fx + ft.w - 8; x += 22) box(g, x, top, 3, 7, '#E8D8A0');
      box(g, fx + 4, top - 5, 18, 6, INK); box(g, fx + 5, top - 4, 16, 5, '#F2EEE2'); box(g, fx + 5, top - 4, 16, 1, '#FFFFFF');
      lip(g, fx, top, ft.w, ['#5A4C34', '#C8B890', '#F4ECD2', '#FFFFFF']);
      break;
    }
    case 'shelf': case 'loft': {
      const loft = ft.look === 'loft', wd = loft ? N(FIR) : V;
      if (loft) {
        for (const px of [fx + 8, fx + ft.w / 2 - 3, fx + ft.w - 14]) { box(g, px - 1, top + 8, 8, Dk - top - 8, INK); slab(g, px, top + 8, 6, Dk - top - 8, wd); }
        g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(fx + 14, top + 40); g.lineTo(fx + ft.w / 2 - 3, top + 10); g.lineTo(fx + ft.w - 14, top + 40); g.stroke(); g.strokeStyle = wd[3]; g.lineWidth = 2; g.stroke();
        // (hay heaped on it, wisps hanging off the edge)
        const Hh = N(HAY);
        for (let k = 2; k < ft.w - 6; k += 6) { const hh = 6 + hash(k * 1.3 + seed) * 6; box(g, fx + k, top - hh, 7, hh, Hh[3 + (k % 12 === 2 ? 1 : 0)]); box(g, fx + k, top - hh, 2, 1, Hh[5]); }
        for (let k = 6; k < ft.w; k += 11) box(g, fx + k, top + 8, 1, 4 + (k % 5), Hh[4]);
      } else {
        for (const bx of [fx + 8, fx + ft.w - 12]) { box(g, bx - 1, top + 7, 6, 18, INK); box(g, bx, top + 8, 4, 16, S[3]); box(g, bx, top + 8, 1, 16, S[5]); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(bx + 2, top + 22); g.lineTo(bx + (bx < fx + 20 ? 10 : -6), top + 9); g.stroke(); }
        // (what's on it: crates, sacks, a jar, a lantern)
        for (let k = 6; k < ft.w - 18; k += 28) {
          const t = (Math.floor(k / 28) + seed) % 4;
          if (t === 0) { box(g, fx + k - 1, top - 17, 22, 17, INK); slab(g, fx + k, top - 16, 20, 16, P); box(g, fx + k + 2, top - 9, 16, 1, P[1]); }
          else if (t === 1) { g.fillStyle = INK; g.beginPath(); g.ellipse(fx + k + 10, top - 8, 11, 9, 0, Math.PI, 0); g.lineTo(fx + k + 21, top); g.lineTo(fx + k - 1, top); g.fill(); g.fillStyle = '#C8B48A'; g.beginPath(); g.ellipse(fx + k + 10, top - 7, 9.5, 7.5, 0, Math.PI, 0); g.fill(); box(g, fx + k + 2, top - 7, 16, 7, '#C8B48A'); box(g, fx + k + 4, top - 12, 4, 2, '#E8D8B0'); }
          else if (t === 2) { box(g, fx + k + 2, top - 14, 12, 14, INK); box(g, fx + k + 3, top - 13, 10, 13, '#5A8A6A'); box(g, fx + k + 4, top - 12, 2, 10, '#A8D8B8'); box(g, fx + k + 2, top - 17, 12, 4, '#7A5A3A'); }
          else { box(g, fx + k + 2, top - 16, 12, 16, INK); box(g, fx + k + 3, top - 15, 10, 14, BRASS[3]); box(g, fx + k + 5, top - 12, 6, 8, '#F2D27A'); box(g, fx + k + 6, top - 20, 4, 4, BRASS[2]); }
        }
      }
      box(g, fx - 1, top - 1, ft.w + 2, 10, INK); slab(g, fx, top, ft.w, 8, wd);
      lip(g, fx, top, ft.w);
      break;
    }
    case 'table': {
      // (a dining table: the white cloth draped, its hem, the pedestal; a place set, a bud vase, the cruet)
      box(g, fx + ft.w / 2 - 4, top + 14, 8, Dk - top - 18, INK); box(g, fx + ft.w / 2 - 3, top + 14, 6, Dk - top - 18, V[3]); box(g, fx + ft.w / 2 - 3, top + 14, 2, Dk - top - 18, V[5]);
      box(g, fx + ft.w / 2 - 14, Dk - 5, 28, 5, INK); box(g, fx + ft.w / 2 - 13, Dk - 4, 26, 4, V[3]);
      box(g, fx - 1, top - 1, ft.w + 2, 18, INK);
      box(g, fx, top, ft.w, 16, '#E8E4DA'); box(g, fx, top, ft.w, 4, '#FAF8F2'); box(g, fx, top + 13, ft.w, 3, '#C8C2B4');
      for (let x = fx + 6; x < fx + ft.w; x += 12) box(g, x, top + 6, 1, 9, '#D2CCBE');
      box(g, fx + 8, top - 3, 14, 3, INK); box(g, fx + 9, top - 2, 12, 2, '#F4F4F2'); box(g, fx + 24, top - 5, 1, 5, '#C8CCD4');
      box(g, fx + ft.w / 2 - 2, top - 14, 5, 14, INK); box(g, fx + ft.w / 2 - 1, top - 13, 3, 13, '#A8C8D8'); box(g, fx + ft.w / 2 - 3, top - 18, 7, 5, seed % 2 ? '#D83A5A' : '#F2C84A');
      box(g, fx + ft.w - 18, top - 9, 6, 9, INK); box(g, fx + ft.w - 17, top - 8, 4, 8, '#7A3A1A'); box(g, fx + ft.w - 10, top - 7, 5, 7, INK); box(g, fx + ft.w - 9, top - 6, 3, 6, '#E8E0CC');
      lip(g, fx, top, ft.w, ['#A8A296', '#E8E4DA', '#FAF8F2', '#FFFFFF']);
      break;
    }
    case 'counter': {
      // (the kitchen's counter: varnished doors and drawers, a zinc top (lit); a stockpot, a bread board)
      box(g, fx - 1, top - 1, ft.w + 2, ft.h + 1, INK); slab(g, fx, top, ft.w, ft.h, V);
      for (let x = fx + 6; x < fx + ft.w - 20; x += 36) { box(g, x, top + 12, 30, ft.h - 18, INK); slab(g, x + 1, top + 13, 28, ft.h - 20, V); box(g, x + 24, top + 26, 3, 3, BRASS[4]); }
      box(g, fx - 2, top - 2, ft.w + 4, 6, INK); box(g, fx - 1, top - 1, ft.w + 2, 4, S[4]);
      box(g, fx + 10, top - 16, 24, 16, INK); barrel(g, fx + 11, top - 15, 22, 15, N(STEEL)); box(g, fx + 9, top - 17, 26, 3, S[2]);
      box(g, fx + 50, top - 6, 30, 6, INK); box(g, fx + 51, top - 5, 28, 5, V[5]); box(g, fx + 56, top - 11, 16, 6, '#C8964A'); box(g, fx + 56, top - 11, 16, 2, '#E8B86A');
      lip(g, fx - 1, top, ft.w + 2, ['#22262C', '#6C7682', '#C4CCD6', '#F0F4F8']);
      break;
    }
    case 'desk': {
      // (the conductor's desk: varnished, pigeonholes over it on the wall, the ledger open, the inkwell, a lantern)
      box(g, fx - 1, top - 1, ft.w + 2, ft.h + 1, INK); slab(g, fx, top, ft.w, ft.h, V);
      box(g, fx + 6, top + 10, ft.w - 12, ft.h - 14, INK); slab(g, fx + 7, top + 11, ft.w - 14, ft.h - 16, V); box(g, fx + ft.w / 2 - 2, top + 20, 4, 3, BRASS[4]);
      box(g, fx + 6, top - 5, 32, 5, INK); box(g, fx + 7, top - 4, 14, 4, '#F2EEE0'); box(g, fx + 23, top - 4, 14, 4, '#E8E2D0'); box(g, fx + 21, top - 5, 2, 5, '#7A2A1A');
      for (let k = 0; k < 3; k++) box(g, fx + 9, top - 3 + k, 10, 1, k % 2 ? '#8A8A9A' : '#F2EEE0');
      box(g, fx + 44, top - 6, 6, 6, INK); box(g, fx + 45, top - 5, 4, 5, '#1A1A2A');
      box(g, fx + 58, top - 18, 12, 18, INK); box(g, fx + 59, top - 17, 10, 16, '#B8282A'); box(g, fx + 61, top - 13, 6, 8, '#F2D27A'); box(g, fx + 61, top - 22, 6, 4, INK);
      lip(g, fx, top, ft.w);
      break;
    }
    case 'crate': {
      const h = ft.solid ?? ft.h;
      box(g, fx - 1, top - 1, ft.w + 2, h + 1, INK);
      boards(g, fx, top, ft.w, h, P, 8, seed + ft.x);
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(fx + 4, top + 4); g.lineTo(fx + ft.w - 4, top + h - 4); g.stroke(); g.strokeStyle = P[4]; g.lineWidth = 1; g.stroke();
      for (const [cx, cy] of [[fx, top], [fx + ft.w - 6, top], [fx, top + h - 6], [fx + ft.w - 6, top + h - 6]]) { box(g, cx, cy, 6, 6, S[2]); box(g, cx + 1, cy + 1, 1, 1, S[5]); }
      const st = ['THIS SIDE UP', 'FRAGILE', 'W.L.R.R.', 'GIFT SHOP'][(seed + ft.x) % 4];
      if (ft.w > 50) signText(g, st, fx + ft.w / 2, top + h / 2 + 4, { sx: 1, sy: 1, fill: '#2A1608' });
      lip(g, fx, top, ft.w);
      break;
    }
    case 'bale': {
      const Hh = N(HAY);
      box(g, fx - 1, top - 1, ft.w + 2, ft.h + 1, INK); box(g, fx, top, ft.w, ft.h, Hh[3]);
      for (let y = top + 2; y < top + ft.h; y += 3) for (let x = fx + ((y * 3) % 5); x < fx + ft.w; x += 6) box(g, x, y, 3, 1, (x + y) % 2 ? Hh[2] : Hh[4]);
      box(g, fx, top + ft.h - 4, ft.w, 4, Hh[1]); box(g, fx + ft.w - 4, top, 4, ft.h, Hh[2]);
      for (const k of [0.3, 0.7]) { box(g, fx + ft.w * k - 1, top, 3, ft.h, INK); box(g, fx + ft.w * k, top, 1, ft.h, '#C8B060'); }
      for (let x = fx + 2; x < fx + ft.w; x += 5) box(g, x, top - 2, 1, 2, Hh[5]);
      lip(g, fx, top, ft.w, ['#5E4612', '#C8A440', '#F4DE8A', '#FFF4C8']);
      break;
    }
    case 'step': break;
  }
};

const paintInt = (g: Ctx, kind: CarKind, len: number) => {
  const Bd = N(BODY[kind]), a = END, w = len - 2 * END, V = N(VARNISH), Cr = N(CREAM), B = N(BLACK), S = N(STEEL);
  const ws = winOf(kind, len).map(wx => wx - WIN_W / 2);
  // ---- the back wall
  if (kind === 'cattle') {
    // (slats: between them, the day (or the tunnel) going by shows through)
    const F = N(FIR);
    box(g, a, Cl, w, Dk - Cl, F[1]);
    for (let y = Cl + 18; y < Dk - 6; y += 18) { boards(g, a, y, w, 11, F.map(c => mix(c, '#000000', 0.25)), 11, y); box(g, a, y + 11, w, 1, F[0]); }
    for (let y = Cl + 30; y < Dk - 20; y += 18) g.clearRect(a, y, w, 2);
    for (let x2 = a + 10; x2 < a + w - 10; x2 += 66) { box(g, x2 - 1, Cl, 10, Dk - Cl, INK); slab(g, x2, Cl, 8, Dk - Cl, F.map(c => mix(c, '#000000', 0.2))); }
    const Hh = N(HAY);
    for (let k = 0; k < w; k += 8) { const hh = 4 + hash(k * 0.9) * 8; box(g, a + k, Dk - hh, 9, hh, Hh[2 + (k % 24 === 0 ? 1 : 0)]); box(g, a + k + 2, Dk - hh, 3, 1, Hh[4]); }
    for (let k = 60; k < w; k += 130) { g.fillStyle = INK; g.beginPath(); g.ellipse(a + k, Dk - 3, 8, 5, 0, Math.PI, 0); g.fill(); g.fillStyle = '#4A3018'; g.beginPath(); g.ellipse(a + k, Dk - 3, 7, 4, 0, Math.PI, 0); g.fill(); box(g, a + k - 2, Dk - 6, 2, 1, '#6A4A28'); }
    // (the trough at the front end)
    box(g, a + w - 90, Dk - 22, 70, 22, INK); boards(g, a + w - 89, Dk - 21, 68, 20, F, 7, 3); box(g, a + w - 86, Dk - 20, 62, 4, '#3A6A8A'); box(g, a + w - 86, Dk - 20, 62, 1, '#8AC0D8');
  } else if (kind === 'baggage') {
    // (bare boards, the mail racks' pigeonholes, mailbags slumped, U.S. MAIL stenciled, the lamp hooks)
    boards(g, a, Cl, w, Dk - Cl, V.map(c => mix(c, '#000000', 0.18)), 10, 9);
    for (const [px, pw] of [[a + 30, 150], [a + w - 190, 160]] as const) {
      box(g, px - 2, Cl + 34, pw + 4, 92, INK); box(g, px, Cl + 36, pw, 88, V[2]);
      for (let r = 0; r < 4; r++) for (let k = 0; k < Math.floor(pw / 20); k++) { const cx = px + 2 + k * 20, cy = Cl + 38 + r * 22; box(g, cx, cy, 18, 20, V[0]); box(g, cx, cy + 18, 18, 2, V[4]); if (hash(cx + cy) > 0.35) { box(g, cx + 2, cy + 8, 14, 10, '#E8E0C8'); box(g, cx + 2, cy + 8, 14, 1, '#FFFFFF'); } }
    }
    signText(g, 'U.S. MAIL', a + w / 2, Cl + 80, { sx: 2, sy: 2, fill: '#2A1608', worn: 0.15, wornCol: V[3] });
    for (let k = 20; k < w - 30; k += 110) { g.fillStyle = INK; g.beginPath(); g.ellipse(a + k + 18, Dk - 10, 20, 12, 0, Math.PI, 0); g.lineTo(a + k + 38, Dk); g.lineTo(a + k - 2, Dk); g.fill(); g.fillStyle = '#A8A08A'; g.beginPath(); g.ellipse(a + k + 18, Dk - 9, 18.5, 10.5, 0, Math.PI, 0); g.fill(); box(g, a + k + 1, Dk - 9, 35, 9, '#A8A08A'); box(g, a + k + 12, Dk - 24, 12, 6, '#8A826A'); signText(g, 'U.S.', a + k + 18, Dk - 4, { sx: 1, sy: 1, fill: '#3A2A1A' }); }
  } else {
    // (cream walls over a varnished wainscot; the windows' frames (the holes cut after); a mirror or a framed park
    // poster between)
    box(g, a, Cl, w, Dk - Cl, Cr[4]);
    for (let y = Cl + 20; y < Dk - 60; y += 4) checker(g, a, y, w, 1, Cr[5], (y >> 2) & 1, 6);
    box(g, a, Cl + 14, w, 3, Cr[2]);
    // (the wainscot)
    box(g, a, Dk - 62, w, 62, V[3]);
    for (let x = a + 6; x < a + w - 20; x += 46) { box(g, x, Dk - 54, 40, 46, INK); slab(g, x + 1, Dk - 53, 38, 44, V); }
    box(g, a, Dk - 64, w, 4, INK); box(g, a, Dk - 64, w, 3, V[5]); box(g, a, Dk - 64, w, 1, V[6]);
    for (let k = 0; k < ws.length; k++) {
      const wx = ws[k];
      box(g, wx - 5, Wt - 5, WIN_W + 10, WIN_H + 11, INK); slab(g, wx - 4, Wt - 4, WIN_W + 8, WIN_H + 9, V);
      // (the curtains, tied back either side)
      if (kind !== 'caboose') { const Pc = kind === 'diner' ? N(GREEN) : N(PLUSH); for (const [cx, sd] of [[wx - 12, 1], [wx + WIN_W + 2, -1]] as const) { box(g, cx, Wt - 8, 10, WIN_H + 4, INK); slab(g, cx + 1, Wt - 7, 8, WIN_H + 2, Pc); box(g, cx + (sd > 0 ? 6 : 1), Wt + WIN_H / 2, 3, 4, BRASS[4]); } box(g, wx - 14, Wt - 12, WIN_W + 28, 5, INK); box(g, wx - 13, Wt - 11, WIN_W + 26, 3, BRASS[3]); }
      if (k < ws.length - 1 && kind !== 'caboose' && k % 2 === 1) {
        const px = (wx + WIN_W + ws[k + 1]) / 2 - 10;
        box(g, px - 1, Wt + 14, 22, 30, INK); slab(g, px, Wt + 15, 20, 28, N(BRASS)); box(g, px + 3, Wt + 18, 14, 22, '#5A7A6A'); box(g, px + 4, Wt + 30, 12, 9, '#7A6A4A'); box(g, px + 6, Wt + 22, 6, 8, '#E8E0C8');
      }
    }
    // (the ceiling's curve: banded darker up into it, its ribs; the clerestory's little panes in the coaches and diners)
    for (let i = 0; i < 4; i++) box(g, a, Cl + i * 4, w, 4, mix(Cr[3], Cr[1], 1 - i / 4));
    for (let k = a + 30; k < a + w; k += 60) { box(g, k, Cl, 4, 18, Cr[1]); box(g, k, Cl, 1, 18, Cr[4]); }
    if (kind !== 'caboose') for (let x = a + 8; x < a + w - 12; x += 16) { box(g, x, Cl + 2, 12, 8, ['#B8862C', '#6A9A5A', '#B84A3A', '#5A7AA8'][Math.floor(x / 16) % 4]); box(g, x, Cl + 2, 12, 1, '#F2E2A8'); }
    if (kind === 'coach') {
      // (the seats: plush benches facing each other, low, brass-capped arms; the aisle runner)
      for (let k = 60; k < w - 40; k += 90) {
        const sx = a + k;
        box(g, sx - 1, Dk - 46, 14, 46, INK); slab(g, sx, Dk - 45, 12, 45, N(PLUSH));
        for (let y = Dk - 40; y < Dk - 10; y += 8) box(g, sx + 5, y, 2, 2, N(PLUSH)[1]);
        box(g, sx - 12, Dk - 24, 36, 10, INK); slab(g, sx - 11, Dk - 23, 34, 8, N(PLUSH));
        box(g, sx + 2, Dk - 50, 8, 5, INK); box(g, sx + 3, Dk - 49, 6, 3, BRASS[4]);
      }
      box(g, a, Dk - 4, w, 4, N(PLUSH)[2]); for (let x = a; x < a + w; x += 10) box(g, x, Dk - 3, 5, 1, N(PLUSH)[4]);
    } else if (kind === 'diner') {
      // (the chairs by the tables; the kitchen at the front end: the range (black iron, brass rail), its stovepipe, pots
      // on hooks, the plate rack)
      for (const tx of [80, 220, 360]) for (const cx of [tx - 14, tx + 76]) { box(g, cx - 1, Dk - 52, 12, 52, INK); slab(g, cx, Dk - 51, 10, 51, V); box(g, cx - 2, Dk - 28, 14, 6, N(GREEN)[3]); }
      const kx = a + w - 130;
      box(g, kx - 4, Cl + 14, 134, Dk - Cl - 14, N(['#2A2A26', '#3E3E38', '#56564C', '#6E6E62', '#8A8A7C', '#A8A898', '#C8C8B8'])[2]);
      for (let y = Cl + 20; y < Dk - 64; y += 12) for (let x = kx; x < kx + 128; x += 12) { box(g, x, y, 11, 11, '#D8D4C8'); box(g, x, y, 11, 1, '#F2F0E8'); }
      box(g, kx + 98, Cl + 14, 10, Dk - Cl - 76, INK); box(g, kx + 99, Cl + 14, 8, Dk - Cl - 76, B[3]); box(g, kx + 99, Cl + 14, 2, Dk - Cl - 76, B[5]);
      for (let k = 0; k < 3; k++) { const px = kx + 10 + k * 30, py = Cl + 50; g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(px + 7, Cl + 36); g.lineTo(px + 7, py); g.stroke(); box(g, px - 1, py - 1, 16, 16, INK); barrel(g, px, py, 14, 14, k === 1 ? N(BRASS) : N(STEEL)); }
      box(g, kx + 4, Cl + 80, 80, 4, INK); box(g, kx + 5, Cl + 81, 78, 2, V[4]);
      for (let x = kx + 8; x < kx + 80; x += 8) { box(g, x, Cl + 68, 6, 13, INK); box(g, x + 1, Cl + 69, 4, 12, '#F2F0EA'); box(g, x + 1, Cl + 69, 4, 1, '#3A6AA8'); }
    } else if (kind === 'caboose') {
      // (the pot-bellied stove and its pipe, a coal scuttle; the ladder up into the cupola; flags and lanterns on hooks)
      const sx = a + STOVE;
      box(g, sx + 7, Cl + 14, 12, Dk - Cl - 54, INK); box(g, sx + 8, Cl + 14, 10, Dk - Cl - 54, B[3]); box(g, sx + 8, Cl + 14, 3, Dk - Cl - 54, B[5]);
      g.fillStyle = INK; g.beginPath(); g.ellipse(sx + 13, Dk - 24, 18, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = B[3]; g.beginPath(); g.ellipse(sx + 13, Dk - 24, 16, 16, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = B[5]; g.beginPath(); g.ellipse(sx + 8, Dk - 30, 6, 8, 0, 0, Math.PI * 2); g.fill();
      box(g, sx - 2, Dk - 44, 30, 6, INK); box(g, sx - 1, Dk - 43, 28, 4, B[4]); box(g, sx + 2, Dk - 8, 22, 8, INK); box(g, sx + 3, Dk - 7, 20, 7, B[2]);
      box(g, sx - 26, Dk - 14, 16, 14, INK); box(g, sx - 25, Dk - 13, 14, 13, B[2]); for (let k = 0; k < 4; k++) box(g, sx - 24 + k * 3, Dk - 16 - (k % 2), 3, 3, N(COAL)[3]);
      const lx = Math.round(len * 0.42) + 56;
      for (const rx of [lx, lx + 24]) { box(g, rx - 1, Cl, 4, 180, INK); box(g, rx, Cl, 2, 180, V[4]); }
      for (let y = Cl + 12; y < Cl + 176; y += 18) { box(g, lx, y, 24, 3, INK); box(g, lx, y, 24, 2, V[4]); }
      for (const [fx, col] of [[a + 20, '#D83A3A'], [a + 34, '#2E9A5A']] as const) { box(g, fx, Cl + 30, 2, 40, V[2]); box(g, fx + 2, Cl + 30, 12, 9, INK); box(g, fx + 2, Cl + 31, 11, 7, col); }
    }
  }
  // ---- the windows: holes (what's going by shows through)
  for (const wx of ws) g.clearRect(wx, Wt, WIN_W, WIN_H);
  for (const wx of ws) { box(g, wx, Wt + WIN_H / 2 - 1, WIN_W, 3, INK); box(g, wx, Wt + WIN_H / 2 - 1, WIN_W, 1, V[5]); }
  if (kind === 'cattle') { const F = N(FIR); box(g, a, Cl, w, 14, F[1]); for (let k = a + 30; k < a + w; k += 60) box(g, k, Cl, 4, 14, F[0]); }
  // ---- what he climbs
  const idx = CARS.findIndex(d => d.kind === kind && d.len === len);
  if (idx >= 0) for (const ft of fittings(idx)) if (ft.look !== 'step') fitting(g, ft, idx);
  // ---- the ceiling (the roof's still there to stand on): its section, the hooks the lamps hang from
  const R = N(BLACK);
  box(g, a - 5, Rf - 1, w + 10, Cl - Rf + 4, INK); box(g, a - 4, Rf, w + 8, Cl - Rf + 2, R[3]); box(g, a - 4, Cl, w + 8, 3, Bd[1]);
  for (let x = a + 8; x < a + w; x += 30) box(g, x, Rf + 3, 1, Cl - Rf - 3, R[2]);
  lip(g, a - 4, Rf, w + 8);
  // ---- what's outside it that isn't its side (the cupola, the stovepipes, the marker lamps): there either way
  outsideFittings(g, kind, len);
  void S; void IRON; void RED; void post;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame's drawing

const wheelAt = (c: Ctx, x: number, y: number, roll: number) => {
  // (cached at eight turns: the spokes repeat every eighth of one)
  const ph = ((Math.round((roll / (Math.PI * 2)) * 64) % 8) + 8) % 8;
  stillAt(c, `tr-wheel-${ph}`, x, y, -WR - 3, -WR - 3, WR * 2 + 6, WR * 2 + 6, g => wheel(g, 0, 0, WR, (ph / 8) * (Math.PI * 2 / 8), false, 8));
};
/** A truck under a car: the wheels on the rails turning, the archbar side frame, its journal boxes and springs. */
export const truck = (c: Ctx, x: number, roll: number) => {
  const wy = RAIL - WR, S = N(STEEL);
  for (const wx of [x - 20, x + 20]) wheelAt(c, wx, wy, roll);
  stillAt(c, 'tr-truckframe', x, GY, -40, -60, 80, 60, g => {
    const y0 = Rl - WR;
    box(g, -36, Dk + 12, 72, 12, INK);
    box(g, -34, Dk + 13, 68, 9, S[2]); box(g, -34, Dk + 13, 68, 1, S[4]);
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-30, y0 - 2); g.lineTo(-16, y0 - 9); g.lineTo(16, y0 - 9); g.lineTo(30, y0 - 2); g.stroke();
    g.strokeStyle = S[3]; g.lineWidth = 2; g.stroke();
    box(g, -30, y0 - 1, 60, 5, INK); box(g, -29, y0, 58, 3, S[2]); box(g, -29, y0, 58, 1, S[4]);
    for (const jx of [-20, 20]) { box(g, jx - 6, y0 - 5, 12, 9, INK); box(g, jx - 5, y0 - 4, 10, 7, S[3]); box(g, jx - 5, y0 - 4, 10, 1, S[5]); }
    for (let k = 0; k < 3; k++) { box(g, -6, y0 - 8 + k * 3, 12, 2, INK); box(g, -5, y0 - 8 + k * 3, 10, 1, S[5]); }
  });
};

export const drawBase = (c: Ctx, kind: CarKind, len: number, x: number) => stillAt(c, `tr-base-${kind}-${len}`, x, GY, -COUPLER / 2 - 22, Rf - 64, len + COUPLER + 44, -Rf + 64 + 34, g => paintBase(g, kind, len));
export const drawExt = (c: Ctx, kind: CarKind, len: number, x: number) => stillAt(c, `tr-ext-${kind}-${len}`, x, GY, -16, Rf - 50, len + 32, Dk - Rf + 52, g => paintExt(g, kind, len));
export const drawInt = (c: Ctx, kind: CarKind, len: number, x: number) => stillAt(c, `tr-int-${kind}-${len}`, x, GY, END - 16, Rf - 50, len - 2 * END + 32, Dk - Rf + 52, g => paintInt(g, kind, len));
export const drawTop = (c: Ctx, kind: CarKind, len: number, x: number) => {
  const top = (TOP[kind] ?? DECK) - GY;
  stillAt(c, `tr-top-${kind}-${len}`, x, GY, -6, top - 40, len + 12, Dk - top + 42, g => paintTop(g, kind, len));
};

/** The live bits on a car: the stoves' smoke out of their pipes; (inside) the stove's fire. */
export const drawCarLive = (c: Ctx, kind: CarKind, len: number, x: number, f: number, inside: boolean) => {
  if (kind === 'caboose' || kind === 'diner') {
    const sx = x + Math.round(kind === 'caboose' ? len * 0.25 : len - END - 40) + 4;
    for (let k = 0; k < 4; k++) {
      const t = ((f * 0.02 + k / 4) % 1);
      puff(c, sx - t * 90, ROOF - 34 - t * 40, 4 + t * 10, ['#6A6A70', '#8A8A90', '#B8B8BE'], 0.55 * (1 - t));
    }
  }
  if (inside && kind === 'caboose') {
    const sx = x + END + STOVE;
    box(c, sx + 6, DECK - 28, 14, 8, INK);
    box(c, sx + 7, DECK - 27, 12, 6, f % 20 < 10 ? '#F97316' : '#DC2626'); box(c, sx + 9, DECK - 26, 6, 2, '#FDE047');
  }
};

/** A hanging lamp (where it hangs now): the rod, the brass font, its glass chimney, the flame. */
export const drawLamp = (c: Ctx, lx: number, ly: number, f: number) => {
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(Math.round(lx), CEIL + 14); c.lineTo(lx, ly - 10); c.stroke();
  c.strokeStyle = BRASS[3]; c.lineWidth = 1; c.stroke();
  box(c, lx - 7, ly - 11, 14, 3, INK); box(c, lx - 6, ly - 10, 12, 1, BRASS[4]);
  box(c, lx - 4, ly - 9, 8, 10, INK); box(c, lx - 3, ly - 8, 6, 9, '#F2E2B0'); box(c, lx - 3, ly - 8, 2, 9, '#FFF8E0');
  box(c, lx - 1, ly - 6 + (f % 12 < 6 ? 0 : 1), 2, 4, '#F97316');
  box(c, lx - 6, ly + 1, 12, 7, INK); box(c, lx - 5, ly + 2, 10, 5, BRASS[3]); box(c, lx - 5, ly + 2, 3, 5, BRASS[5]); box(c, lx + 3, ly + 2, 2, 5, BRASS[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The wrecks: the cut cars gone off the line, over on their sides down the near bank, burning

export const drawWreckCar = (c: Ctx, kind: CarKind, len: number, t: number, seed: number) => {
  // (local: its left end, the ground line; drawn as it stood, then charred over, then fire)
  c.save();
  drawBase(c, kind, len, 0);
  if (ENTERABLE.includes(kind)) drawExt(c, kind, len, 0); else drawTop(c, kind, len, 0);
  for (const tx of [70, len - 70]) truck(c, tx, seed);
  c.restore();
  // (charred: soot over it, blacker the longer it burns; broken planks out of its side; the fire)
  const top = ENTERABLE.includes(kind) ? ROOF : TOP[kind] ?? DECK - 100;
  const k = Math.min(0.75, 0.3 + t / 400);
  c.globalAlpha = k; c.fillStyle = '#140C08'; c.fillRect(END - 4, top - 4, len - 2 * END + 8, DECK - top + 18); c.globalAlpha = 1;
  for (let i = 0; i < 6; i++) {
    const px = END + hash(seed + i) * (len - 2 * END - 40), py = top + 20 + hash(seed * 3 + i) * (DECK - top - 40);
    c.save(); c.translate(px, py); c.rotate((hash(seed + i * 7) - 0.5) * 1.2);
    box(c, -1, -1, 34, 6, INK); box(c, 0, 0, 32, 4, N(VARNISH)[3]); box(c, 0, 0, 32, 1, N(VARNISH)[5]); box(c, 28, 0, 4, 4, '#1A0E08');
    c.restore();
  }
  for (let i = 0; i < 7; i++) { const fx = END + 20 + hash(seed * 5 + i) * (len - 2 * END - 40); flame(c, fx, top + 10 + hash(i + seed) * 40, 30 + hash(seed + i * 3) * 30, t + i * 9, i); }
  void PLANK; void GY;
};
