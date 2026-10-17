// JAPAN's art (the SNES pass): the machiya fronts (dark wood lattice down the ground floor, white plaster and slatted
// windows up top, the little pent roof between, gray kawara tile rows under their ridge and its end tiles, noren in the
// doors, a red paper lantern, painted boards; braced from behind), the TORII (vermilion posts round in steps on their
// black feet, the tie beam, the black top beam swept up at its ends, the plaque), the stepping stones, the ROBOT KOI
// (kohaku patches on white in steps, scales, fins and their rays, its panel seams and rivets, a camera eye, whiskers)
// and its bubbles, the VENDING MACHINES (their lit windows of cans and bottles, the buttons, the brand panels, the coin
// slot and the bin), the FIVE-STORY PAGODA (its lacquer inside and the lucky cats on its shelves, its walls, plank
// floors, the tiled eaves and their rafters and brackets, the top roof, the bronze spire), the SUMO RING (the clay
// mound, its straw bales, the white lines, the hanging roof, its purple curtain and four tassels), the stone lanterns,
// the manga stand, the cherry trees, the lantern posts, the flag; and THE BULLET TRAIN (the ballast and the sleepers
// going back, the rails; the fiberglass Fujis in their snow paint, the tunnel portals and their roll-up shutters; the
// signal gantries, the walkway, the station canopy, the departure board; the train itself). Still art painted once for
// the hour; only what moves live. No layout here: index.ts and station.ts say where.

import { GY } from '../geometry';
import {
  type Ctx, type View, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay, steppedGlow, pixelBlob,
  stucco, planks, hole, facade, still, board, words, plain, LOOKS, onScreen, lip, topBack, box3Back, ledge3, lantern,
} from '../kit';

const lampsOn = () => timeOfDay().lamps > 0.3;
export const VERMILION = '#D9381E', DARKWOOD = '#3F2A1C', PLASTER = '#F5F0E6', TILE = '#4A5564', GOLD = '#CA8A04';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** Kawara tile rows (local): the round tiles' rolls running down, each lit down its left, the valleys between dark,
 *  the row of end tiles (with their little crests) along the eave. `R`: the tiles' ramp. */
export const kawara = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x, y, w, h, R[2]);
  box(g, x, y, w, Math.round(h * 0.35), R[3]); checker(g, x, y + Math.round(h * 0.35), w, 2, R[3], 0, 1);
  for (let xx = x; xx < x + w; xx += 6) { box(g, xx, y, 3, h - 4, R[3]); box(g, xx, y, 1, h - 4, R[4]); box(g, xx + 3, y, 2, h - 4, R[1]); }
  for (let xx = x + 1; xx < x + w - 3; xx += 6) { box(g, xx - 1, y + h - 5, 6, 5, INK); box(g, xx, y + h - 4, 4, 4, R[3]); box(g, xx + 1, y + h - 3, 2, 2, R[1]); box(g, xx, y + h - 4, 1, 1, R[5]); }
};
/** A sweeping roof's tip (local): the eave curling up at the corner (`dir` -1 left, 1 right) from (x, y). */
const tip = (g: Ctx, x: number, y: number, dir: number, R: string[], up = 10, out = 16) => {
  poly(g, [[x, y - 2], [x + dir * out * 0.6, y - up * 0.3], [x + dir * out, y - up], [x + dir * (out + 3), y - up + 2], [x + dir * out * 0.7, y + 4], [x, y + 6]], INK);
  poly(g, [[x, y - 1], [x + dir * out * 0.6, y - up * 0.3 + 1], [x + dir * out, y - up + 1], [x + dir * out * 0.7, y + 3], [x, y + 5]], R[2]);
  box(g, x + dir * out - 1, y - up + 1, 2, 2, R[4]);
};

// ---------------------------------------------------------------------------------------------------------------
// The machiya fronts (FACADE_D, braced)

export interface JpFront { rx: number; w: number; h: number; name: string; noren: string }
const paintFront = (g: Ctx, f: JpFront) => {
  const { w, h } = f, P = ramp6(dimmed(PLASTER)), Wd = ramp6(dimmed(DARKWOOD)), T = ramp6(dimmed(TILE)), seed = f.rx;
  const split = -Math.round(h * 0.48);
  // (the upper floor: white plaster, stippled, its posts)
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  slab(g, 0, -h, w, h + split, P, false); stucco(g, 0, -h, w, h + split, P, seed);
  for (let x = 0; x <= w; x += 52) { const px0 = Math.min(w - 5, x); box(g, px0, -h, 5, h, Wd[2]); box(g, px0, -h, 1, h, Wd[4]); box(g, px0 + 4, -h, 1, h, Wd[0]); }
  box(g, 0, -h, w, 6, Wd[2]); box(g, 0, -h, w, 1, Wd[4]);
  // (the slatted mushiko windows up top, lit behind after dark)
  for (let wx = 18; wx < w - 40; wx += 52) {
    box(g, wx - 2, -h + 20, 30, 24, INK); box(g, wx - 1, -h + 21, 28, 22, lampsOn() ? '#E8A646' : dimmed('#2A2420'));
    for (let k = 0; k < 7; k++) { box(g, wx + k * 4, -h + 21, 2, 22, P[3]); box(g, wx + k * 4, -h + 21, 1, 22, P[5]); }
  }
  // (the ground floor: the dark wood lattice, slat after slat, its rail; the door with its noren)
  const lat = split + 8;
  box(g, 0, lat, w, -lat, Wd[1]);
  for (let x = 2; x < w; x += 4) { box(g, x, lat, 2, -lat - 6, Wd[3]); box(g, x, lat, 1, -lat - 6, Wd[4]); }
  for (const y of [lat + 4, -30]) { box(g, 0, y, w, 4, Wd[2]); box(g, 0, y, w, 1, Wd[4]); }
  const dx = Math.round(w / 2 - 24), dw = 48;
  hole(g, dx, -78, dw, 78, true);
  const N = ramp6(dimmed(f.noren));
  for (let k = 0; k < 3; k++) { const nx = dx + 1 + k * 16; box(g, nx, -78, 15, 30, N[3]); box(g, nx, -78, 2, 30, N[4]); box(g, nx + 13, -78, 2, 30, N[2]); box(g, nx, -50, 15, 2, N[1]); }
  g.fillStyle = dimmed('#F8FAFC'); g.beginPath(); g.arc(dx + dw / 2, -64, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = N[3]; g.beginPath(); g.arc(dx + dw / 2, -64, 4, 0, Math.PI * 2); g.fill();
  box(g, dx - 4, -82, dw + 8, 4, Wd[3]); box(g, dx - 4, -82, dw + 8, 1, Wd[5]);
  // (the pent roof between the floors: tiles, its fascia, the rafter ends under it)
  box(g, -8, split - 6, w + 16, 16, INK); kawara(g, -7, split - 5, w + 14, 14, T);
  for (let x = -4; x < w + 4; x += 8) box(g, x, split + 10, 4, 3, Wd[1]);
  // (the main roof over it all: tile rows, the ridge and its end tiles)
  box(g, -14, -h - 26, w + 28, 28, INK); kawara(g, -13, -h - 25, w + 26, 26, T);
  box(g, -6, -h - 34, w + 12, 9, INK); box(g, -5, -h - 33, w + 10, 7, T[3]); box(g, -5, -h - 33, w + 10, 2, T[5]);
  for (const ex of [-9, w + 1]) { box(g, ex, -h - 40, 9, 14, INK); box(g, ex + 1, -h - 39, 7, 12, T[2]); box(g, ex + 1, -h - 39, 2, 12, T[4]); }
  // (the painted board over the door on the pent roof, a lantern either side)
  board(g, w / 2, split - 18, [f.name], LOOKS.japan(1), dimmed('#F8FAFC'), ramp6(dimmed(DARKWOOD)), 4);
  for (const lx of [dx - 14, dx + dw + 14]) { box(g, lx, -92, 1, 6, INK); lantern(g, lx, -80, 7, '#DC2626'); }
  box(g, 0, -8, w, 8, Wd[0]); checker(g, 0, -12, w, 4, Wd[0], 1, 2);
};
export const drawFront = (c: Ctx, v: View, x: number, f: JpFront) => facade(c, v, `jp-front-${f.rx}`, x, f.w, f.h, g => paintFront(g, f), undefined, 50, 22);

// ---------------------------------------------------------------------------------------------------------------
// The torii

/** A torii at the play plane: the posts (round, vermilion in steps, their black feet), the tie beam (standable: its
 *  wedges through the posts), the plaque strut, the vermilion lower beam and the black top beam over it (standable)
 *  swept up at its ends. `a`, `b`: the posts' outer edges (world); `kasagi`, `nuki`: the beams' tops. */
export const drawTorii = (c: Ctx, v: View, a: number, b: number, kasagi: number, nuki: number, strut: boolean) => {
  if (!onScreen(v, a - 40, b + 40)) return;
  const R = ramp6(hour(VERMILION)), K = ramp6(hour('#26262C'));
  for (const px0 of [a + 26, b - 26]) {
    post(c, px0, kasagi + 20, GY - 14, 16, R);
    box(c, px0 - 11, GY - 16, 22, 16, INK); box(c, px0 - 10, GY - 15, 20, 15, K[3]); box(c, px0 - 10, GY - 15, 4, 15, K[4]); box(c, px0 + 6, GY - 15, 4, 15, K[1]); box(c, px0 - 10, GY - 15, 20, 1, K[5]);
  }
  ledge3(c, v, a + 10, nuki, b - a - 20, VERMILION, 10);
  for (const wx of [a + 40, b - 46]) { box(c, wx - 1, nuki + 1, 8, 9, INK); box(c, wx, nuki + 2, 6, 7, K[3]); }
  if (strut) { const mx = (a + b) / 2; box(c, mx - 7, kasagi + 20, 14, nuki - kasagi - 20, INK); box(c, mx - 6, kasagi + 20, 12, nuki - kasagi - 20, R[3]); box(c, mx - 6, kasagi + 20, 3, nuki - kasagi - 20, R[4]); }
  // (the vermilion lower beam under the top one)
  box(c, a - 6, kasagi + 11, b - a + 12, 11, INK); box(c, a - 5, kasagi + 12, b - a + 10, 9, R[3]); box(c, a - 5, kasagi + 12, b - a + 10, 2, R[4]); box(c, a - 5, kasagi + 19, b - a + 10, 2, R[1]);
  // (the black top beam: its ends swept up past the posts; the stand-on part lit along its top)
  for (const [x, dir] of [[a, -1], [b, 1]] as const) {
    poly(c, [[x, kasagi - 1], [x + dir * 14, kasagi - 4], [x + dir * 26, kasagi - 12], [x + dir * 28, kasagi - 8], [x + dir * 20, kasagi + 4], [x, kasagi + 12]], INK);
    poly(c, [[x, kasagi], [x + dir * 14, kasagi - 3], [x + dir * 25, kasagi - 10], [x + dir * 19, kasagi + 3], [x, kasagi + 11]], K[2]);
    box(c, x + dir * 24 - 1, kasagi - 10, 2, 2, K[4]);
  }
  ledge3(c, v, a, kasagi, b - a, '#2E2E36', 12);
};

/** A stepping stone (rounded rock over the water, moss on it; its top going back and its lit lip). */
export const steppingStone = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const R = ramp6(hour('#6B6660')), cx = (a + b) / 2, rx = (b - a) / 2;
  c.fillStyle = INK; c.beginPath(); c.ellipse(cx, top + 12, rx + 1, 15, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[2]; c.beginPath(); c.ellipse(cx, top + 12, rx, 14, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[3]; c.beginPath(); c.ellipse(cx - rx * 0.2, top + 8, rx * 0.75, 9, 0, 0, Math.PI * 2); c.fill();
  box(c, cx - rx * 0.6, top + 3, 6, 2, R[4]);
  for (let k = 0; k < 6; k++) box(c, a + 6 + hash(a + k) * (b - a - 12), top + 4 + hash(a * 3 + k) * 12, 3, 2, hour(k % 2 ? '#4D7C2A' : '#3F6212'));
  topBack(c, v.eye, a, b, top, 1, 0.95, R, 2);
  lip(c, a, top, b - a);
};

// ---------------------------------------------------------------------------------------------------------------
// The robot koi (live)

/** The koi out on its arc (local, already turned: its nose to the right): white in steps under kohaku patches, scales,
 *  the dorsal and pectoral fins, the tail and its rays, a panel seam and rivets, the camera eye, the whiskers. */
export const drawKoiFish = (c: Ctx, f: number) => {
  const Wt = ['#8A8A90', '#B8B8BE', '#DCDCE0', '#F4F4F6', '#FFFFFF'], Or = ['#7C2D12', '#C2410C', '#EA580C', '#FB923C', '#FDBA74'];
  const flap = Math.sin(f * 0.5) * 4;
  // (the tail: two lobes, their rays)
  poly(c, [[-38, -2], [-64, -18 - flap], [-58, 0], [-64, 18 + flap], [-38, 3]], INK);
  poly(c, [[-38, -1], [-62, -16 - flap], [-57, 0], [-62, 16 + flap], [-38, 2]], Or[3]);
  for (let k = 0; k < 4; k++) { c.strokeStyle = Or[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-60, -14 + k * 9 - flap * (1 - k / 3)); c.stroke(); }
  // (the dorsal fin, the pectoral fins)
  poly(c, [[-18, -16], [-6, -27], [12, -20], [10, -17]], INK); poly(c, [[-16, -16], [-6, -25], [10, -19]], Or[2]);
  poly(c, [[6, 10], [-2, 24 + flap * 0.5], [-10, 20], [0, 9]], INK); poly(c, [[5, 10], [-2, 22 + flap * 0.5], [-8, 19], [0, 10]], Wt[2]);
  // (the body: inked, white in bands (lit up top, shaded under the belly))
  const body: [number, number][] = [[-42, 0], [-30, -16], [10, -20], [36, -10], [42, 0], [36, 10], [10, 18], [-30, 14]];
  poly(c, body.map(([x, y]) => [x * 1.04, y * 1.08] as [number, number]), INK);
  poly(c, body, Wt[2]);
  c.save(); c.beginPath(); body.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  box(c, -44, -22, 90, 12, Wt[3]); box(c, -44, -22, 90, 4, Wt[4]); checker(c, -44, -10, 90, 2, Wt[3], 0, 1);
  box(c, -44, 8, 90, 14, Wt[1]); checker(c, -44, 6, 90, 2, Wt[1], 1, 1);
  // (the kohaku patches, stepped, lit along their tops)
  for (const [px0, py0, pw, ph] of [[-24, -16, 20, 12], [2, -18, 24, 11], [-10, 2, 16, 8], [24, -8, 10, 8]] as const) {
    box(c, px0, py0, pw, ph, Or[2]); box(c, px0, py0, pw, 2, Or[3]); box(c, px0 + 2, py0 + ph - 2, pw - 2, 2, Or[1]); checker(c, px0, py0 + ph - 4, pw, 2, Or[1], 0, 1);
  }
  // (the scales: little arcs in rows)
  c.strokeStyle = 'rgba(28, 16, 20, 0.28)'; c.lineWidth = 1;
  for (let r = 0; r < 4; r++) for (let x = -30 + (r % 2) * 4; x < 28; x += 8) { c.beginPath(); c.arc(x, -10 + r * 6, 3, -Math.PI / 2, Math.PI / 2); c.stroke(); }
  // (the robot's panel seam round its middle, rivets along it; the hinge where the tail goes on)
  c.strokeStyle = Wt[0]; c.beginPath(); c.moveTo(-4, -22); c.lineTo(-6, 20); c.stroke();
  for (let y = -16; y < 16; y += 6) box(c, -6, y, 2, 2, Wt[0]);
  c.restore();
  box(c, -41, -4, 4, 8, INK); box(c, -40, -3, 2, 6, '#9CA3AF');
  // (the camera eye: a black lens in a chrome ring, a red LED in it; the mouth, the whiskers)
  ball(c, 27, -4, 5, '#9CA3AF'); ball(c, 27, -4, 3, '#18181B', false); box(c, 27, -5, 2, 2, (f >> 3) % 2 ? '#EF4444' : '#7F1D1D'); box(c, 25, -6, 1, 1, '#FFFFFF');
  box(c, 39, 2, 5, 3, INK); box(c, 40, 3, 3, 1, '#7F1D1D');
  for (const [ax, ay, bx, by] of [[36, 3, 50, 10], [36, 6, 48, 16]] as const) { c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.strokeStyle = '#FCD34D'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
};
/** Bubbles coming up (the tell): stepped rings, a glint on each. */
export const bubbles = (c: Ctx, x: number, y: number, f: number) => {
  for (let i = 0; i < 7; i++) {
    const r = 2 + ((f + i * 7) % 12) / 3, bx = Math.round(x + Math.sin(i * 2.1 + f * 0.2) * 18), by = Math.round(y - ((f * 2 + i * 9) % 22));
    c.strokeStyle = '#0E4A5A'; c.lineWidth = 2; c.beginPath(); c.arc(bx, by, r + 0.5, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#E0F2FE'; c.lineWidth = 1; c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.stroke();
    box(c, bx - r * 0.5, by - r * 0.6, 1, 1, '#FFFFFF');
  }
  // (the boil on the surface over it)
  for (let k = 0; k < 5; k++) box(c, x - 24 + k * 12 + Math.sin(f * 0.3 + k) * 2, y - 2 - (k % 2) * 2, 6, 2, '#BAE6FD');
};
/** The splash as it breaks the surface: droplets in steps, thrown up and out. */
export const koiSplash = (c: Ctx, x: number, y: number, k: number) => {
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * (0.15 + (i / 8) * 0.7), r = 10 + k * 40, dx = Math.round(x + Math.cos(a) * r), dy = Math.round(y + Math.sin(a) * r * 0.8 + k * k * 30);
    box(c, dx - 2, dy - 3, 5, 6, '#0E4A5A'); box(c, dx - 1, dy - 2, 3, 4, '#BAE6FD'); box(c, dx - 1, dy - 2, 1, 1, '#FFFFFF');
  }
  box(c, x - 26, y - 4, 52, 4, '#E0F2FE'); box(c, x - 18, y - 7, 36, 3, '#F0F9FF');
};

// ---------------------------------------------------------------------------------------------------------------
// The vending machines (play-plane boxes: what he climbs)

const BRANDS = [['PEPPY', 'WATER', '#E5E7EB', '#1D4ED8'], ['COLD', 'COFFEE', '#DC2626', '#F8FAFC'], ['MILK', 'TEA', '#2563EB', '#F8FAFC'], ['GREEN', 'TEA', '#16A34A', '#F8FAFC'], ['HOT CORN', 'SOUP', '#F97316', '#FFFBEB']] as const;
/** A machine's front (local: its top-left at 0, 0, w x h): the body in its color, the brand panel up top, the window of
 *  drinks in three rows (cans and bottles in steps) and their buttons, the coin slot and the bill slot, the bin. */
const paintMachine = (g: Ctx, w: number, h: number, i: number) => {
  const [b1, b2, col, ink] = BRANDS[i % BRANDS.length], R = ramp6(hour(col)), on = lampsOn();
  box(g, -1, 0, w + 2, h + 1, INK);
  slab(g, 0, 0, w, h, R, false);
  // (the brand panel)
  box(g, 5, 3, w - 10, 21, INK); box(g, 6, 4, w - 12, 19, hour(ink)); box(g, 6, 4, w - 12, 2, hour(mix(ink, '#FFFFFF', 0.4)));
  words(g, b1, w / 2, 13, plain(1, 1, hour(col)));
  words(g, b2, w / 2, 21, plain(1, 1, hour(mix(col, INK, 0.3))));
  // (the window: lit from inside after dark, the drinks in rows on their shelves, a button under each)
  box(g, 5, 25, w - 10, 61, INK); box(g, 6, 26, w - 12, 59, on ? '#FEF9C3' : hour('#D8E8F0'));
  if (!on) { box(g, 6, 26, w - 12, 6, hour('#F0F8FC')); box(g, 8, 28, 2, 54, '#FFFFFF'); }
  const DR = ['#DC2626', '#2563EB', '#F59E0B', '#10B981', '#F8FAFC', '#7C3AED'];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
    const dx = 9 + k * ((w - 18) / 4), dy = 28 + r * 19, D = ramp6(hour(DR[(r + k * 2 + i) % DR.length])), bottle = (r + k + i) % 3 === 0;
    if (bottle) { box(g, dx + 2, dy - 1, 4, 3, INK); box(g, dx + 3, dy, 2, 2, hour('#E5E7EB')); box(g, dx, dy + 2, 9, 12, INK); box(g, dx + 1, dy + 3, 7, 10, hour('#E0F2FE')); box(g, dx + 1, dy + 6, 7, 5, D[3]); box(g, dx + 1, dy + 6, 2, 5, D[4]); }
    else { box(g, dx, dy + 2, 9, 12, INK); box(g, dx + 1, dy + 3, 7, 10, D[3]); box(g, dx + 1, dy + 3, 2, 10, D[4]); box(g, dx + 6, dy + 3, 2, 10, D[2]); box(g, dx + 1, dy + 3, 7, 1, hour('#E5E7EB')); box(g, dx + 2, dy + 7, 5, 3, hour('#F8FAFC')); }
    box(g, dx + 1, dy + 15, 7, 3, INK); box(g, dx + 2, dy + 16, 5, 1, on ? '#60A5FA' : hour('#93C5FD'));
  }
  box(g, 6, 46, w - 12, 1, hour('#A1A1AA')); box(g, 6, 65, w - 12, 1, hour('#A1A1AA'));
  // (the coin slot, the bill slot, the price sticker, the bin)
  box(g, w - 20, 90, 12, 18, INK); box(g, w - 19, 91, 10, 16, R[2]); box(g, w - 15, 93, 2, 6, INK); box(g, w - 18, 102, 8, 2, INK);
  box(g, 8, 92, 18, 10, hour('#FDE047')); words(g, '$4', 17, 100, plain(1, 1, hour('#B91C1C')));
  box(g, 5, h - 18, w - 10, 14, INK); box(g, 6, h - 17, w - 12, 12, '#1C1014'); box(g, 6, h - 17, w - 12, 3, R[1]);
  box(g, 0, h - 3, w, 3, R[1]);
};
/** The machines: their going-back faces, their fronts (each stamped; a stacked pair as two), the lit lips; a glint
 *  across one window now and then. */
export const drawVendingArt = (c: Ctx, v: View, list: [number, number, number][], f: number) => {
  const vis = list.filter(([a, b]) => onScreen(v, a, b));
  for (const [a, b, top] of vis) box3Back(c, v, { x: a, top, w: b - a, bottom: GY, col: BRANDS[list.findIndex(l => l[0] === a) % BRANDS.length][2] });
  vis.forEach(([a, b, top]) => {
    const i = list.findIndex(l => l[0] === a), w = b - a, n = Math.round((GY - top) / 130);
    for (let s = 0; s < n; s++) still(c, `jp-vend-${w}-${(i + s * 2) % BRANDS.length}`, a, top + s * 130, -2, -1, w + 4, 132, g => paintMachine(g, w, 130, i + s * 2));
    if ((f >> 5) % 7 === i % 7) { const y = top + 24 + ((f >> 1) % 60); box(c, a + 6, y, w - 12, 1, '#FFFFFF'); }
    lip(c, a, top, w);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE FIVE-STORY PAGODA

/** The pagoda's inside (still at 0.94; local foot at 0, `w` across, `h` up): lacquer walls in panels, the posts, the
 *  beams under every floor and roof, the shelves of lucky cats (the gift shop it really is), slits of sky, the central
 *  pillar up through it all. `floors`: heights of its floors and roofs. */
const paintPagodaInside = (g: Ctx, w: number, h: number, floors: number[], roofs: number[]) => {
  const R = ramp6(dimmed('#8A1C14')), Wd = ramp6(dimmed(DARKWOOD)), Gd = ramp6(dimmed(GOLD));
  box(g, 0, -h, w, h, R[1]);
  for (let x = 0; x < w; x += 40) { box(g, x + 4, -h, 32, h, R[2]); box(g, x + 4, -h, 1, h, R[3]); }
  for (let x = 0; x <= w; x += 80) { box(g, Math.min(w - 8, x), -h, 8, h, Wd[2]); box(g, Math.min(w - 8, x), -h, 2, h, Wd[3]); }
  // (the central pillar)
  const cx = Math.round(w / 2);
  box(g, cx - 9, -h, 18, h, INK); box(g, cx - 8, -h, 16, h, Wd[3]); box(g, cx - 8, -h, 4, h, Wd[4]); box(g, cx + 4, -h, 4, h, Wd[1]);
  // (a beam under each floor and each roof: the roofs' ones darker, rafter ends along them; no ledge: nowhere to stand)
  for (const fh of floors) { box(g, 0, -fh, w, 10, Wd[2]); box(g, 0, -fh, w, 1, Wd[3]); }
  for (const rh of roofs) { box(g, 0, -rh - 14, w, 16, Wd[0]); for (let x = 4; x < w; x += 10) box(g, x, -rh + 2, 5, 3, Wd[1]); }
  // (each storey: a slit of sky either side, a shelf of lucky cats waving)
  const levels = [0, ...floors];
  levels.forEach((lo, i) => {
    const hi = i + 1 < levels.length ? levels[i + 1] : h, mid = -Math.round((lo + hi) / 2);
    if (hi - lo < 50) return;
    for (const sx of [24, w - 36]) { box(g, sx - 1, mid - 21, 14, 32, INK); box(g, sx, mid - 20, 12, 30, lampsOn() ? '#2A1A30' : dimmed('#9CC4E4')); box(g, sx + 5, mid - 20, 2, 30, Wd[2]); }
    const shy = mid + 10;
    box(g, 60, shy, w - 120, 4, Wd[3]); box(g, 60, shy, w - 120, 1, Wd[4]);
    for (let x = 70; x < w - 70; x += 26) {
      if (Math.abs(x - cx) < 20) continue;
      box(g, x - 1, shy - 15, 12, 15, INK); box(g, x, shy - 14, 10, 14, dimmed('#F8FAFC')); box(g, x, shy - 14, 3, 14, dimmed('#FFFFFF'));
      box(g, x + 1, shy - 17, 3, 3, dimmed('#F8FAFC')); box(g, x + 6, shy - 17, 3, 3, dimmed('#F8FAFC'));
      box(g, x + 2, shy - 10, 2, 1, INK); box(g, x + 6, shy - 10, 2, 1, INK); box(g, x + 3, shy - 6, 4, 2, dimmed('#DC2626'));
      box(g, x + 8, shy - 22 + ((x / 26) % 2) * 2, 3, 8, dimmed('#F8FAFC')); box(g, x + 2, shy - 4, 6, 2, Gd[3]);
    }
  });
};
/** An eave (local: its root at the wall (0, 0) and its tip `w` out the way `dir` goes): the tiles' front under the lip,
 *  the rafters and the dark under them, a bracket set at the root. */
const paintEave = (g: Ctx, w: number, dir: number, scenery = false) => {
  const T = ramp6(scenery ? dimmed(TILE) : hour(TILE)), Wd = ramp6(scenery ? dimmed(DARKWOOD) : hour(DARKWOOD)), R = ramp6(scenery ? dimmed(VERMILION) : hour(VERMILION));
  const x0 = dir > 0 ? 0 : -w;
  box(g, x0 - 1, -1, w + 2, 12, INK); kawara(g, x0, 0, w, 10, T);
  box(g, x0, 10, w, 8, '#1C1014');
  for (let x = x0 + 2; x < x0 + w - 2; x += 6) { box(g, x, 10, 3, 5, Wd[2]); box(g, x, 10, 1, 5, Wd[4]); }
  const bx = dir > 0 ? 0 : -18;
  box(g, bx, 16, 18, 10, INK); box(g, bx + 1, 17, 16, 3, R[3]); box(g, bx + 3, 20, 12, 3, Wd[3]); box(g, bx + 5, 23, 8, 2, R[2]);
  tip(g, dir > 0 ? x0 + w : x0, 2, dir, T);
};
/** The pagoda: its inside set back, its two walls (box faces), the plank floors, the eaves out either side (what he
 *  stands on: tiles under the lit lip), the top roof, the bronze spire set back. */
export const drawPagodaArt = (c: Ctx, v: View, X: (rx: number) => number, Y: (h: number) => number, P: {
  a: number; b: number; walls: [number, number, number, number][]; floors: [number, number, number][]; roof: [number, number, number]; eaves: number[]; eaveL: [number, number]; eaveR: [number, number];
}) => {
  if (!onScreen(v, X(P.a) - 120, X(P.b) + 120)) return;
  const w = P.b - P.a, H = P.roof[2];
  atDepth(c, v.eye, 0.94, () => still(c, `jp-pagoda-in-${w}x${H}`, X(P.a), GY, -2, -H - 2, w + 4, H + 4, g => paintPagodaInside(g, w, H, P.floors.map(f => f[2]), P.eaves)));
  // (the walls: vermilion lacquer, their gold fittings, the lintel over each door)
  const R = ramp6(hour(VERMILION)), Gd = ramp6(hour(GOLD)), Wd = ramp6(hour(DARKWOOD));
  for (const [a, b, lo, hi] of P.walls) {
    box3Back(c, v, { x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: VERMILION });
    box(c, X(a) - 1, Y(hi), b - a + 2, hi - lo + 1, INK); box(c, X(a), Y(hi), b - a, hi - lo, R[3]); box(c, X(a), Y(hi), 4, hi - lo, R[4]); box(c, X(b) - 4, Y(hi), 4, hi - lo, R[1]);
    for (let h = lo + 40; h < hi; h += 120) { box(c, X(a), Y(h), b - a, 4, Gd[3]); box(c, X(a), Y(h), b - a, 1, Gd[5]); }
    box(c, X(a) - 4, Y(lo) - 10, b - a + 8, 12, INK); box(c, X(a) - 3, Y(lo) - 9, b - a + 6, 10, Wd[3]); box(c, X(a) - 3, Y(lo) - 9, b - a + 6, 2, Wd[5]);
  }
  for (const [a, b, h] of P.floors) ledge3(c, v, X(a), Y(h), b - a, '#8B5A2B', 10, 'plank');
  // (the eaves either side at every roof)
  for (const h of P.eaves) {
    still(c, `jp-eave-l-${P.eaveL[1] - P.eaveL[0]}`, X(P.eaveL[1]), Y(h), -(P.eaveL[1] - P.eaveL[0]) - 24, -14, P.eaveL[1] - P.eaveL[0] + 26, 42, g => paintEave(g, P.eaveL[1] - P.eaveL[0], -1));
    still(c, `jp-eave-r-${P.eaveR[1] - P.eaveR[0]}`, X(P.eaveR[0]), Y(h), -2, -14, P.eaveR[1] - P.eaveR[0] + 26, 42, g => paintEave(g, P.eaveR[1] - P.eaveR[0], 1));
    topBack(c, v.eye, X(P.eaveL[0]), X(P.eaveL[1]), Y(h), 1, 0.95, ramp6(hour(TILE)), 2); topBack(c, v.eye, X(P.eaveR[0]), X(P.eaveR[1]), Y(h), 1, 0.95, ramp6(hour(TILE)), 2);
    lip(c, X(P.eaveL[0]), Y(h), P.eaveL[1] - P.eaveL[0]); lip(c, X(P.eaveR[0]), Y(h), P.eaveR[1] - P.eaveR[0]);
  }
  // (the top roof: tiles the whole width under its lip, the ends swept up)
  const [ra, rb, rh] = P.roof, T = ramp6(hour(TILE));
  topBack(c, v.eye, X(ra), X(rb), Y(rh), 1, 0.93, T, 3);
  still(c, `jp-pagoda-roof-${rb - ra}`, X(ra), Y(rh), -24, -14, rb - ra + 48, 40, g => {
    box(g, -1, -1, rb - ra + 2, 16, INK); kawara(g, 0, 0, rb - ra, 14, T);
    box(g, 0, 14, rb - ra, 8, '#1C1014'); for (let x = 2; x < rb - ra - 2; x += 6) { box(g, x, 14, 3, 5, Wd[2]); box(g, x, 14, 1, 5, Wd[4]); }
    tip(g, 0, 3, -1, T, 12, 20); tip(g, rb - ra, 3, 1, T, 12, 20);
  });
  lip(c, X(ra), Y(rh), rb - ra);
  // (the spire: bronze rings on its pole, the water flame and the jewel on top; set back off the roof: not somewhere to stand)
  const mx = X((P.a + P.b) / 2), [sx, sy] = at(v.eye, mx, Y(rh), 0.95), Bz = ramp6(dimmed('#A16207'));
  box(c, sx - 4, sy - 152, 8, 152, INK); box(c, sx - 3, sy - 152, 6, 152, Bz[3]); box(c, sx - 3, sy - 152, 2, 152, Bz[5]);
  box(c, sx - 14, sy - 14, 28, 14, INK); box(c, sx - 13, sy - 13, 26, 12, Bz[2]); box(c, sx - 13, sy - 13, 26, 2, Bz[4]);
  for (let k = 0; k < 9; k++) { const rw = 22 - k, ry = sy - 28 - k * 12; box(c, sx - rw / 2 - 1, ry - 1, rw + 2, 5, INK); box(c, sx - rw / 2, ry, rw, 3, Bz[3]); box(c, sx - rw / 2, ry, rw, 1, Bz[5]); }
  poly(c, [[sx - 10, sy - 140], [sx - 4, sy - 156], [sx, sy - 146], [sx + 4, sy - 156], [sx + 10, sy - 140]], Bz[2]);
  ball(c, sx, sy - 162, 5, dimmed('#FCD34D'));
};

// ---------------------------------------------------------------------------------------------------------------
// THE SUMO RING, the stone lanterns, the manga stand

/** The dohyo's front (local, w x h): packed clay in steps, its straw bales sunk along the top edge, grit; the clay's
 *  slope foot. */
const paintDohyo = (g: Ctx, w: number, h: number) => {
  const C = ramp6(hour('#C2884E')), S = ramp6(hour('#D8C08A'));
  box(g, -1, 0, w + 2, h, INK); box(g, 0, 0, w, h, C[3]);
  box(g, 0, 0, w, 3, C[4]); box(g, 0, h - 8, w, 8, C[2]); checker(g, 0, h - 10, w, 2, C[2], 0, 1);
  for (let i = 0; i < w / 4; i++) box(g, hash(i * 1.7) * w, 4 + hash(i * 3.3) * (h - 8), 2, 1, i % 3 ? C[2] : C[4]);
  // (the straw bales along the edge: bundles, their ropes)
  for (let x = 4; x < w - 18; x += 22) { box(g, x - 1, 3, 20, 10, INK); box(g, x, 4, 18, 8, S[3]); box(g, x, 4, 18, 2, S[5]); box(g, x, 10, 18, 2, S[1]); for (const rx of [x + 5, x + 12]) box(g, rx, 4, 1, 8, S[0]); }
  box(g, 0, 0, 2, h, C[4]); box(g, w - 3, 0, 3, h, C[1]);
};
export const drawDohyoArt = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 80, b + 80)) return;
  // (the hanging roof, set back: its gable and the crossed finials, the logs along its ridge, the purple curtain along its
  // edge, a tassel at each corner (green, red, white, black), the cables up out of the top)
  facade(c, v, `jp-tsuriyane-${b - a}`, a - 30, b - a + 60, 340, g => {
    const w = b - a + 60, T = ramp6(dimmed('#2E2A28')), Wd = ramp6(dimmed('#8B6A3A')), Pu = ramp6(dimmed('#5B2A86'));
    for (const cx of [20, w - 20]) box(g, cx, -460, 1, 120, dimmed('#71717A'));
    poly(g, [[-22, -298], [w + 22, -298], [w - 6, -342], [6, -342]], INK);
    poly(g, [[-20, -299], [w + 20, -299], [w - 7, -340], [7, -340]], T[2]); poly(g, [[-20, -299], [w / 2, -299], [w / 2, -340], [7, -340]], T[3]);
    for (let x = 8; x < w - 8; x += 6) box(g, x, -338, 2, 38, T[1]);
    box(g, 4, -346, w - 8, 6, INK); box(g, 5, -345, w - 10, 4, Wd[3]); box(g, 5, -345, w - 10, 1, Wd[5]);
    for (let k = 0; k < 5; k++) { const lx = 30 + k * ((w - 60) / 4); box(g, lx - 5, -354, 10, 9, INK); box(g, lx - 4, -353, 8, 7, Wd[3]); box(g, lx - 4, -353, 8, 2, Wd[5]); }
    for (const [ex, dir] of [[6, -1], [w - 6, 1]] as const) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(ex, -340); g.lineTo(ex + dir * 14, -372); g.stroke(); g.strokeStyle = Wd[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(ex, -340); g.lineTo(ex + dir * 14, -372); g.stroke(); }
    box(g, -12, -300, w + 24, 14, INK); box(g, -11, -299, w + 22, 12, Pu[3]); box(g, -11, -299, w + 22, 2, Pu[5]);
    for (let x = -10; x < w + 10; x += 30) { g.fillStyle = Pu[2]; g.beginPath(); g.arc(x + 15, -287, 15, 0, Math.PI); g.fill(); }
    for (const [tx, col] of [[-6, '#16A34A'], [w + 6, '#DC2626'], [16, '#F8FAFC'], [w - 16, '#1C1917']] as const) {
      const Tc = ramp6(dimmed(col)), tx0 = Math.round(tx);
      box(g, tx0 - 1, -288, 2, 14, INK); ball(g, tx0, -272, 5, Tc[3]);
      box(g, tx0 - 6, -268, 12, 44, INK); box(g, tx0 - 5, -268, 10, 43, Tc[3]); for (let k = 0; k < 5; k++) box(g, tx0 - 5 + k * 2, -268, 1, 43, k % 2 ? Tc[2] : Tc[4]);
    }
  }, 0.92, 140, 40, false);
  // (the mound: its top going back with the white lines on it, its clay front stamped, the lit lip)
  const C = ramp6(hour('#C2884E'));
  box3Back(c, v, { x: a, top, w: b - a, bottom: GY, col: '#C2884E' });
  if (v.eye.y < top - 1) for (const lx of [(a + b) / 2 - 24, (a + b) / 2 + 18]) { const [p0, q0] = at(v.eye, lx, top, 0.985), [p1] = at(v.eye, lx + 6, top, 0.985), [, q1] = at(v.eye, lx, top, 0.955); box(c, p0, Math.min(q0, q1), p1 - p0, Math.abs(q1 - q0) + 1, hour('#F8FAFC')); }
  still(c, `jp-dohyo-${b - a}x${GY - top}`, a, top, -2, -1, b - a + 4, GY - top + 2, g => paintDohyo(g, b - a, GY - top));
  lip(c, a, top, b - a);
  void C;
};
/** A stone lantern (a box he stands on): its base, the post, the light box (its windows lit after dark), the umbrella
 *  roof with its curled corners (its top the lit lip). */
export const drawStoneLantern = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#9A948A' });
  still(c, `jp-toro-${w}x${h}`, a, top, -4, -2, w + 8, h + 3, g => {
    const S = ramp6(hour('#9A948A'));
    const st = (x: number, y: number, ww: number, hh: number) => { box(g, x - 1, y - 1, ww + 2, hh + 2, INK); box(g, x, y, ww, hh, S[3]); box(g, x, y, ww, 1, S[5]); box(g, x, y, 2, hh, S[4]); box(g, x + ww - 2, y, 2, hh, S[1]); };
    st(2, h - 12, w - 4, 12); st(w / 2 - 6, h - 34, 12, 22); st(6, h - 40, w - 12, 6);
    st(8, 16, w - 16, h - 56);
    const on = lampsOn();
    box(g, 12, 20, w - 24, h - 66, on ? '#FDE68A' : '#2A2622'); if (on) box(g, 14, 22, w - 28, 4, '#FFFBEB');
    box(g, w / 2 - 1, 20, 2, h - 66, S[2]);
    st(0, 6, w, 10); box(g, -2, 12, 4, 4, S[2]); box(g, w - 2, 12, 4, 4, S[2]);
    for (let x = 3; x < w - 3; x += 4) box(g, x, 7, 2, 2, S[4]);
  });
  lip(c, a, top, w);
};
/** The manga stand (a box he stands on): its frame, three shelves of volumes (spines in steps, the odd cover facing
 *  out), a NEW! sticker, the price card. */
export const drawMangaStand = (c: Ctx, v: View, a: number, b: number, top: number) => {
  if (!onScreen(v, a - 10, b + 10)) return;
  const w = b - a, h = GY - top;
  box3Back(c, v, { x: a, top, w, bottom: GY, col: '#7C3AED' });
  still(c, `jp-manga-${w}x${h}`, a, top, -2, -1, w + 4, h + 2, g => {
    const F = ramp6(hour('#7C3AED')), Wd = ramp6(hour('#8B5A2B'));
    box(g, -1, 0, w + 2, h + 1, INK); slab(g, 0, 0, w, h, F, false);
    const COLS = ['#F472B6', '#FDE047', '#60A5FA', '#F87171', '#4ADE80', '#F8FAFC', '#FB923C', '#A78BFA'];
    for (let r = 0; r < 3; r++) {
      const sy = 8 + r * 32;
      box(g, 6, sy, w - 12, 28, INK); box(g, 7, sy + 1, w - 14, 26, '#1C1014');
      for (let x = 8, k = 0; x < w - 10; k++) {
        const bw = 5 + Math.floor(hash(r * 31 + k) * 4), Cc = ramp6(hour(COLS[(r * 3 + k) % COLS.length]));
        if (k % 7 === 3 && x + 18 < w - 10) { box(g, x, sy + 4, 17, 23, Cc[3]); box(g, x, sy + 4, 17, 2, Cc[5]); box(g, x + 4, sy + 9, 8, 8, hour('#FDE68A')); box(g, x + 6, sy + 11, 2, 2, INK); box(g, x + 9, sy + 11, 2, 2, INK); box(g, x + 2, sy + 20, 13, 2, Cc[1]); x += 19; continue; }
        box(g, x, sy + 6, bw - 1, 21, Cc[3]); box(g, x, sy + 6, 1, 21, Cc[5]); box(g, x + bw - 2, sy + 6, 1, 21, Cc[1]); box(g, x + 1, sy + 10, bw - 3, 2, Cc[1]);
        x += bw;
      }
      box(g, 6, sy + 27, w - 12, 3, Wd[3]); box(g, 6, sy + 27, w - 12, 1, Wd[5]);
    }
    box(g, w - 30, 2, 26, 10, INK); box(g, w - 29, 3, 24, 8, hour('#DC2626')); words(g, 'NEW!', w - 17, 10, plain(1, 1, '#FFFFFF'));
  });
  lip(c, a, top, w);
};

// ---------------------------------------------------------------------------------------------------------------
// Cherry trees, lantern posts, the flag

const paintCherry = (g: Ctx, seed: number) => {
  const Bk = ramp6(dimmed('#4A3428')), Bl = ramp6(dimmed('#F4A8C8'));
  // (the trunk and its limbs, bark lit down the left)
  poly(g, [[60, 0], [64, -110], [58, -150], [70, -150], [76, -110], [80, 0]], INK);
  poly(g, [[61, 0], [65, -110], [60, -148], [68, -148], [75, -110], [79, 0]], Bk[2]); box(g, 62, -120, 3, 120, Bk[3]);
  for (let y = -110; y < -4; y += 12) box(g, 66 + (y % 3), y, 8, 1, Bk[1]);
  for (const [x1, y1] of [[22, -170], [118, -168], [40, -205], [100, -210]] as const) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(70, -128); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = Bk[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(70, -128); g.lineTo(x1, y1); g.stroke(); }
  // (the blossom: clouds of it in steps, darker underneath, a dither at its edges, petals in it)
  const clumps: [number, number, number][] = [[70, -175, 46], [26, -158, 32], [114, -156, 34], [70, -216, 32], [42, -198, 26], [100, -200, 26]];
  for (const [x, y, r] of clumps) pixelBlob(g, x + 2, y + 4, r, r * 0.78, Bl[1]);
  for (const [x, y, r] of clumps) pixelBlob(g, x, y, r * 0.92, r * 0.7, Bl[2]);
  for (const [x, y, r] of clumps) pixelBlob(g, x - r * 0.18, y - r * 0.16, r * 0.62, r * 0.46, Bl[3]);
  for (const [x, y, r] of clumps) pixelBlob(g, x - r * 0.3, y - r * 0.3, r * 0.28, r * 0.2, Bl[4]);
  for (let i = 0; i < 60; i++) box(g, 20 + hash(seed + i * 1.3) * 100, -230 + hash(seed + i * 2.7) * 90, 2, 2, hash(seed + i) > 0.5 ? Bl[5] : Bl[1]);
};
export const drawCherry = (c: Ctx, v: View, x: number, seed: number) => facade(c, v, `jp-cherry-${seed}`, x, 140, 150, g => paintCherry(g, seed), 0.9, 110, 10, false);
/** A petal drifting (live): two pinks, a 2x2 turning. */
export const petal = (c: Ctx, x: number, y: number, f: number) => { const t = (f >> 3) % 2; box(c, x, y, 3, 2, t ? '#FBCFE8' : '#F9A8D4'); box(c, x + (t ? 2 : 0), y, 1, 1, '#FFFFFF'); };
/** A lantern post: a wooden post on a stone foot, a paper lantern sat on it under a little roof. */
export const lanternPost = (c: Ctx, x: number, foot: number) => {
  const Wd = ramp6(hour(DARKWOOD)), S = ramp6(hour('#9A948A')), T = ramp6(hour(TILE));
  box(c, x - 6, foot - 8, 13, 8, INK); box(c, x - 5, foot - 7, 11, 7, S[3]); box(c, x - 5, foot - 7, 11, 1, S[5]);
  post(c, x, foot - 86, foot - 8, 5, Wd);
  box(c, x - 5, foot - 87, 11, 3, INK); box(c, x - 4, foot - 86, 9, 2, Wd[4]);
  lantern(c, x, foot - 96, 8, '#F8FAFC');
  box(c, x, foot - 110, 1, 6, INK);
  box(c, x - 9, foot - 114, 19, 6, INK); box(c, x - 8, foot - 113, 17, 4, T[3]); box(c, x - 8, foot - 113, 17, 1, T[5]);
};
/** Japan's flag on its pole: white in stepped folds, the red disc riding them, the gold ball. */
export const drawJpFlag = (c: Ctx, x: number, f: number) => {
  const P = ramp6(hour('#9CA3AF'));
  post(c, x, GY - 200, GY, 4, P);
  box(c, x - 5, GY - 5, 11, 5, INK); box(c, x - 4, GY - 5, 9, 4, P[2]);
  ball(c, x, GY - 204, 3, '#CA8A04');
  const fw = 48, fh = 30, top = GY - 198, Wt = ramp6(hour('#F8FAFC')), Rd = ramp6(hour('#BC002D'));
  for (let i = 0; i < fw; i += 2) {
    const ph = f * 0.08 + i * 0.12, wave = Math.sin(ph) * 2 * (i / fw + 0.3), lk = Math.cos(ph), sh = lk > 0.55 ? 4 : lk < -0.55 ? 2 : 3;
    box(c, x + 2 + i, top + wave - 1, 2, fh + 2, INK); box(c, x + 2 + i, top + wave, 2, fh, Wt[sh]);
    const dx = i - 24, dd = Math.abs(dx);
    if (dd < 9) { const half = Math.sqrt(81 - dx * dx); box(c, x + 2 + i, top + wave + 15 - half, 2, half * 2, Rd[sh]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE BULLET TRAIN: the track, the Fujis, the portals, the gantries, the walkway, the canopy, the board, the train

/** The track across the floor (a..b): the ballast going back (gravel in steps), the concrete sleepers going back, the
 *  two rails (lit along their heads). */
export const drawTrack = (c: Ctx, v: View, a: number, b: number) => {
  const eye = v.eye, P = (x: number, d: number) => at(eye, x, GY, d), Ba = ramp6(hour('#6B6660')), Cn = ramp6(hour('#B8B2A8')), St = ramp6(hour('#9CA3AF'));
  if (eye.y < GY - 1) {
    poly(c, [P(a, 0.998), P(b, 0.998), P(b, 0.94), P(a, 0.94)], Ba[2]);
    for (let x = Math.ceil(a / 7) * 7; x < b; x += 7) for (const d of [0.99, 0.975, 0.96, 0.948]) { if (hash(x * 0.3 + d * 10) < 0.5) continue; const [px0, py0] = P(x + hash(x + d) * 6, d); box(c, px0, py0, 2, 1, hash(x * 0.7 + d) > 0.5 ? Ba[3] : Ba[1]); }
    for (let x = Math.ceil(a / 26) * 26; x < b; x += 26) { poly(c, [P(x, 0.992), P(x + 12, 0.992), P(x + 12, 0.948), P(x, 0.948)], Cn[2]); const [p0, q0] = P(x, 0.992), [p1] = P(x + 12, 0.992); box(c, p0, q0 - 1, p1 - p0, 1, Cn[4]); }
    for (const d of [0.985, 0.955]) { const [p0, q0] = P(a, d), [p1, q1] = P(b, d); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(p0, q0 - 2); c.lineTo(p1, q1 - 2); c.stroke(); c.strokeStyle = St[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0 - 3); c.lineTo(p1, q1 - 3); c.stroke(); c.strokeStyle = St[5]; c.beginPath(); c.moveTo(p0, q0 - 4); c.lineTo(p1, q1 - 4); c.stroke(); }
  }
  box(c, a, GY - 2, b - a, 2, Ba[1]);
};
/** A Fuji step's front (local, w x h): fiberglass painted as the mountain (blue-gray rock, streaked), the snow paint
 *  along its top dripping down, the bolted panel seams; a lit left edge. */
const paintFujiStep = (g: Ctx, w: number, h: number, seed: number) => {
  const R = ramp6(hour('#64748B')), S = ramp6(hour('#F8FAFC'));
  box(g, -1, 0, w + 2, h + 1, INK); slab(g, 0, 0, w, h, R, true);
  for (let i = 0; i < w / 5; i++) { const sx = hash(seed + i * 2.3) * w; box(g, sx, 18 + hash(seed + i) * (h - 30), 1, 10 + hash(seed + i * 5) * 20, R[hash(seed + i * 7) > 0.5 ? 2 : 4]); }
  // (the snow paint along its top, drips down from it)
  box(g, 0, 0, w, 12, S[3]); box(g, 0, 0, w, 2, S[5]); box(g, 0, 10, w, 2, S[1]);
  for (let x = 2; x < w - 4; x += 6) { const d = 4 + Math.floor(hash(seed + x * 0.7) * 14); box(g, x, 12, 4, d, S[3]); box(g, x, 12, 1, d, S[5]); box(g, x + 1, 12 + d, 2, 2, S[2]); }
  // (the panel seams, bolted)
  for (let x = 40; x < w - 10; x += 40) { box(g, x, 14, 1, h - 14, R[1]); for (let y = 24; y < h - 6; y += 22) { box(g, x - 2, y, 2, 2, R[0]); box(g, x - 2, y, 1, 1, R[5]); } }
  box(g, 0, 0, 2, h, R[4]); box(g, w - 3, 0, 3, h, R[1]);
};
export const drawFujiSteps = (c: Ctx, v: View, steps: { a: number; b: number; top: number }[]) => {
  const vis = steps.filter(s => onScreen(v, s.a, s.b));
  for (const s of vis) {
    // (the snow on its top going back)
    box3Back(c, v, { x: s.a, top: s.top, w: s.b - s.a, bottom: GY, col: '#64748B' });
    topBack(c, v.eye, s.a, s.b, s.top, 1, 0.93, ramp6(hour('#E8EEF4')), 3);
  }
  for (const s of vis) { still(c, `jp-fuji-${s.b - s.a}x${GY - s.top}-${Math.round(s.a) % 997}`, s.a, s.top, -2, -1, s.b - s.a + 4, GY - s.top + 2, g => paintFujiStep(g, s.b - s.a, GY - s.top, Math.round(s.a))); lip(c, s.a, s.top, s.b - s.a); }
};
/** A tunnel portal on a Fuji's face (x..x + 78 the opening, its top `top`): the concrete portal in steps (its arch
 *  stones, the hazard band), and in it the steel roll-up shutter, slat on slat down to the ground (`open` 0 shut .. 1 up:
 *  rolled up into its drum), its bottom bar in hazard stripes, DANGER on it; while it's up, the dark of the tunnel and
 *  the train's lamps coming. The red light over it blinks in the warning. */
export const drawPortal = (c: Ctx, x: number, top: number, open: number, warn: boolean, f: number) => {
  const Cn = ramp6(hour('#A8A29E')), St = ramp6(hour('#8A9099')), oh = GY - top;
  box(c, x - 7, top - 15, 92, oh + 15, INK);
  box(c, x - 6, top - 14, 90, oh + 14, Cn[3]); box(c, x - 6, top - 14, 90, 2, Cn[5]); box(c, x - 6, top - 14, 3, oh + 14, Cn[4]); box(c, x + 81, top - 14, 3, oh + 14, Cn[1]);
  for (let k = 0; k < 7; k++) { box(c, x - 4 + k * 13, top - 12, 11, 8, Cn[k % 2 ? 2 : 4]); box(c, x - 4 + k * 13, top - 5, 11, 1, INK); }
  // (the opening: dark, the train's lamps in it when it's coming)
  box(c, x, top, 78, oh, '#0B0B0F');
  if (open > 0.05) { steppedGlow(c, x + 39, GY - 40, 30 * open, '#FFF4C8', 0, 0.4 * open, 3); for (const lx of [x + 26, x + 52]) { box(c, lx - 3, GY - 44, 6, 4, '#FFF4C8'); } }
  // (the shutter: rolled down from its drum, slat by slat; the hazard bar at its foot; DANGER on it)
  const sh = Math.round(oh * (1 - open));
  box(c, x - 2, top - 2, 82, 8, INK); box(c, x - 1, top - 1, 80, 6, St[2]); box(c, x - 1, top - 1, 80, 1, St[4]);
  if (sh > 2) {
    for (let y = top + 5; y < top + sh; y += 5) { box(c, x, y, 78, 5, St[3]); box(c, x, y, 78, 1, St[5]); box(c, x, y + 4, 78, 1, St[1]); }
    if (sh > 30) { box(c, x + 14, top + sh - 46, 50, 12, St[1]); words(c, 'DANGER', x + 39, top + sh - 37, plain(1, 1, '#FACC15')); }
    const by = top + sh - 9;
    box(c, x, by, 78, 9, INK);
    for (let k = 0; k < 10; k++) poly(c, [[x + k * 8, by + 8], [x + k * 8 + 4, by + 1], [x + k * 8 + 8, by + 1], [x + k * 8 + 4, by + 8]], k % 2 ? '#FACC15' : '#1C1917');
  }
  // (the red light over it)
  const lit = warn && (f >> 3) % 2 === 0;
  box(c, x + 33, top - 26, 12, 10, INK); box(c, x + 34, top - 25, 10, 8, lit ? '#EF4444' : '#450A0A');
  if (lit) steppedGlow(c, x + 39, top - 21, 16, '#EF4444', 0, 0.4, 3);
};
/** A signal gantry deck (a..b at h): its lattice legs on their footings, the grating deck (standable), the signal head
 *  set back on it (its two lamps; the top one or the bottom one lit in the warning). */
export const drawGantry = (c: Ctx, v: View, a: number, b: number, y: number, below: number, warn: number) => {
  const St = ramp6(hour('#475569'));
  for (const lx of [a + 8, b - 14]) {
    box(c, lx - 1, y + 10, 8, below - y - 10, INK); box(c, lx, y + 10, 6, below - y - 10, St[3]); box(c, lx, y + 10, 2, below - y - 10, St[5]);
    for (let yy = y + 16; yy < below - 6; yy += 12) { box(c, lx + 2, yy, 2, 6, St[1]); }
    box(c, lx - 4, below - 6, 14, 6, INK); box(c, lx - 3, below - 5, 12, 5, hour('#A8A29E'));
  }
  // (the signal head, set back on the deck: not in the way)
  const [sx, sy] = at(v.eye, (a + b) / 2, y, 0.95);
  box(c, sx - 1, sy - 44, 3, 12, INK);
  box(c, sx - 10, sy - 34, 20, 28, INK); box(c, sx - 9, sy - 33, 18, 26, dimmed('#1C1917'));
  for (const [k, ly] of [[1, sy - 30], [2, sy - 19]] as const) { const on = warn === k; box(c, sx - 6, ly, 12, 9, on ? '#EF4444' : '#450A0A'); if (on) { box(c, sx - 5, ly + 1, 4, 3, '#FECACA'); steppedGlow(c, sx, ly + 4, 14, '#EF4444', 0, 0.35, 3); } }
  ledge3(c, v, a, y, b - a, '#FACC15', 10, 'metal');
};
/** The platform walkway (no yellow line: there isn't one) on its steel columns; the station canopy over it on its posts
 *  (set back); the departure board under the top deck, its LED rows (DOES NOT STOP), on its posts. */
export const drawWalkway = (c: Ctx, v: View, a: number, b: number, y: number) => {
  const St = ramp6(hour('#64748B'));
  for (let lx = a + 20; lx < b; lx += 100) { box(c, lx - 1, y + 10, 10, GY - y - 10, INK); box(c, lx, y + 10, 8, GY - y - 10, St[3]); box(c, lx, y + 10, 2, GY - y - 10, St[5]); box(c, lx + 6, y + 10, 2, GY - y - 10, St[1]); }
  ledge3(c, v, a, y, b - a, '#A8A29E', 12, 'stone');
};
export const drawCanopy = (c: Ctx, v: View, a: number, b: number, y: number, below: number) => {
  const St = ramp6(dimmed('#475569'));
  for (const px0 of [a + 10, b - 10]) { const [qx, qy] = at(v.eye, px0, y + 10, 0.96), [, ry] = at(v.eye, px0, below, 0.96); box(c, qx - 3, qy, 6, ry - qy, INK); box(c, qx - 2, qy, 4, ry - qy, St[3]); box(c, qx - 2, qy, 1, ry - qy, St[5]); }
  ledge3(c, v, a, y, b - a, '#94A3B8', 12, 'metal');
  for (let x = a + 4; x < b - 4; x += 8) box(c, x, y + 12, 4, 3, hour('#64748B'));
};
export const drawDepartureBoard = (c: Ctx, v: View, a: number, b: number, y: number, below: number, f: number) => {
  const St = ramp6(dimmed('#475569'));
  for (const px0 of [a + 6, b - 6]) { const [qx, qy] = at(v.eye, px0, y + 10, 0.97), [, ry] = at(v.eye, px0, below, 0.97); box(c, qx - 3, qy, 6, ry - qy, INK); box(c, qx - 2, qy, 4, ry - qy, St[3]); }
  const bx = a - 30, bw = b - a + 60, by = y + 12;
  box(c, bx - 2, by - 2, bw + 4, 44, INK); box(c, bx - 1, by - 1, bw + 2, 42, hour('#27272A')); box(c, bx - 1, by - 1, bw + 2, 1, hour('#71717A'));
  box(c, bx + 3, by + 3, bw - 6, 34, '#0A0A0C');
  const O = '#FB923C';
  for (let yy = by + 4; yy < by + 36; yy += 2) for (let xx = bx + 4; xx < bx + bw - 4; xx += 2) box(c, xx, yy, 1, 1, '#1A0E08');
  words(c, 'SHINKANSEN', bx + bw / 2, by + 16, plain(1, 1, O));
  words(c, (f >> 5) % 2 ? 'DOES NOT STOP' : 'NEXT: NEVER', bx + bw / 2, by + 30, plain(1, 1, (f >> 5) % 2 ? O : '#FDBA74'));
  ledge3(c, v, a, y, b - a, '#94A3B8', 12, 'metal');
};
/** The train (live, clipped to the track between its portals): the long white duck-bill nose in stepped bands, the
 *  cockpit glass, the headlamps, the blue stripe and its pin line, the windows streaking (lit after dark), the doors,
 *  the car joints, the skirt and the bogies, the pantograph, speed streaks. */
export const drawTrainArt = (c: Ctx, nose: number, len: number, top: number, h: number, clipA: number, clipB: number, f: number) => {
  c.save(); c.beginPath(); c.rect(clipA, top - 30, clipB - clipA, h + 60); c.clip();
  const tail = nose - len, W = ['#8A94A4', '#B8C0CC', '#DCE2EA', '#F1F5F9', '#FFFFFF'], B = ['#0B1E5A', '#1D4ED8', '#3B6FE8'], on = lampsOn();
  const bodyEnd = nose - 170;
  // (the car body: banded down its side)
  box(c, tail, top + 6, bodyEnd - tail, h - 10, INK);
  box(c, tail, top + 8, bodyEnd - tail, h - 14, W[3]);
  box(c, tail, top + 8, bodyEnd - tail, 6, W[4]); box(c, tail, top + 14, bodyEnd - tail, 4, W[3]); checker(c, tail, top + 18, bodyEnd - tail, 2, W[2], 0, 1);
  box(c, tail, top + h - 30, bodyEnd - tail, 22, W[2]); checker(c, tail, top + h - 32, bodyEnd - tail, 2, W[2], 1, 1);
  // (the nose: the duck bill in steps, tapering down to its tip)
  for (let k = 0; k < 10; k++) {
    const t0 = k / 10, t1 = (k + 1) / 10, x0 = bodyEnd + 170 * t0, x1 = bodyEnd + 170 * t1, y0 = top + 8 + (h * 0.62) * t0 * t0, y1 = top + 8 + (h * 0.62) * t1 * t1;
    poly(c, [[x0, y0], [x1, y1], [x1, GY - 14 - t1 * 4], [x0, GY - 14 - t0 * 4]], k < 3 ? W[3] : k < 7 ? W[2] : W[1]);
    box(c, x0, y0, x1 - x0 + 1, 2, W[4]);
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(bodyEnd, top + 7); for (let k = 0; k <= 10; k++) { const t = k / 10; c.lineTo(bodyEnd + 170 * t, top + 7 + (h * 0.62) * t * t); } c.lineTo(nose + 2, GY - 16); c.stroke();
  // (the cockpit glass, the headlamps)
  poly(c, [[bodyEnd + 10, top + 12], [bodyEnd + 70, top + 20], [bodyEnd + 66, top + 34], [bodyEnd + 6, top + 30]], INK);
  poly(c, [[bodyEnd + 12, top + 14], [bodyEnd + 67, top + 22], [bodyEnd + 64, top + 32], [bodyEnd + 8, top + 28]], '#1E293B'); box(c, bodyEnd + 18, top + 16, 20, 2, '#64748B');
  for (const hx of [nose - 46, nose - 30]) { box(c, hx - 1, GY - 40, 10, 6, INK); box(c, hx, GY - 39, 8, 4, '#FFF4C8'); }
  steppedGlow(c, nose - 20, GY - 37, 26, '#FFF4C8', 0, 0.4, 3);
  // (the blue stripe and its pin line, down the length and along the nose)
  box(c, tail, GY - 42, bodyEnd - tail + 120, 11, B[1]); box(c, tail, GY - 42, bodyEnd - tail + 120, 2, B[2]); box(c, tail, GY - 33, bodyEnd - tail + 120, 2, B[0]);
  box(c, tail, GY - 28, nose - tail - 20, 3, B[1]);
  // (the windows: a strip of them, glinting by day, lit after dark; the doors; the car joints)
  for (let x = tail + 20; x < bodyEnd - 30; x += 40) {
    const car = Math.floor((x - tail) / 250), inCar = (x - tail) % 250;
    if (inCar < 24 || inCar > 226) continue;
    box(c, x - 1, top + 23, 28, 18, INK); box(c, x, top + 24, 26, 16, on ? '#FDE68A' : '#1E293B');
    if (!on) { box(c, x + 2, top + 26, 6, 2, '#64748B'); box(c, x + 3, top + 28, 2, 8, '#334155'); }
    void car;
  }
  for (let jx = tail + 250; jx < bodyEnd; jx += 250) { box(c, jx - 6, top + 8, 12, h - 14, INK); box(c, jx - 4, top + 10, 8, h - 18, '#27272A'); for (let y = top + 12; y < GY - 14; y += 4) box(c, jx - 4, y, 8, 1, '#3F3F46'); }
  for (let dx = tail + 120; dx < bodyEnd - 40; dx += 250) { box(c, dx, top + 20, 1, h - 44, W[1]); box(c, dx + 22, top + 20, 1, h - 44, W[1]); }
  // (the skirt, the bogies)
  box(c, tail, GY - 14, nose - tail - 30, 10, INK); box(c, tail, GY - 13, nose - tail - 30, 7, '#3F3F46'); box(c, tail, GY - 13, nose - tail - 30, 1, '#71717A');
  for (let bx = tail + 40; bx < bodyEnd; bx += 125) { box(c, bx, GY - 10, 34, 8, '#18181B'); for (const wx of [bx + 7, bx + 27]) { c.fillStyle = '#52525B'; c.beginPath(); c.arc(wx, GY - 4, 4, 0, Math.PI * 2); c.fill(); } }
  // (the pantograph on the roof: its arms up to the wire)
  for (let px0 = tail + 300; px0 < bodyEnd - 100; px0 += 750) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(px0, top + 7); c.lineTo(px0 + 16, top - 14); c.lineTo(px0 + 32, top + 7); c.stroke(); box(c, px0 + 4, top - 16, 26, 3, '#71717A'); }
  // (speed streaks)
  for (let k = 0; k < 10; k++) box(c, tail + hash(k * 3.1 + (f >> 1)) * len, top + hash(k * 1.7 + (f >> 1)) * h, 40 + hash(k) * 30, 1, k % 2 ? '#FFFFFF' : '#E0F2FE');
  c.restore();
};

void stucco; void planks; void mix; void checker; void words;
