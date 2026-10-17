// GERMANY's art (the SNES pass): the half-timbered fronts (plaster over a stone plinth, the timber frame with its
// braces and St Andrew's crosses, green shutters, geraniums, the gable end under its tiled verges, an iron bracket
// sign, painted boards; braced from behind), THE CASTLE (cut stone, corbels and battlements, arched windows, the gate's
// arch behind the portcullis, Bavarian banners, round towers shaded round under their slate cones and pennants), the
// WORLD'S BIGGEST CUCKOO CLOCK (its carved house: shingles, fretwork verges, a carved bird on the peak, the dial's
// numbers that don't line up, pine-cone weights; the hands and the pendulum live), the wheel of carved figures (the rim's
// teeth, turned spokes, the brass hub; the figures carved and painted), the cuckoo and its door, the battlements, the
// portcullis (iron in steps, rivets, its spikes), the far tower and its balconies' rails, the biergarten (plank tables
// and benches, steins, the bandstand in Bavarian lozenges under its scalloped roof), the stands (striped valances, the
// giant pretzel, the giant sausage), the keg stack, the pennants; and THE BREWERY HILL (the brewery behind, the
// embankment's stone, the cobbled ramp going back, the stairs, the dock and its doors, hay bales, crates, the Brauhaus
// in plaster and timber, the copper kettle, the hop loft and the drying racks, the kegs rolling, the burst of foam).
// Still art painted once for the hour; only what moves live. No layout here: index.ts and brewery.ts say where.

import { GY } from '../geometry';
import {
  type Ctx, type View, type Box3, INK, box, mix, poly, checker, hash, at, atDepth, ramp6, dimmed, hour, slab, post, ball, timeOfDay,
  stoneBlocks, stucco, planks, shingles, hole, facade, still, board, words, plain, LOOKS, onScreen, lip, box3Back, ledge3, steppedGlow, pixelBlob,
} from '../kit';

const lampsOn = () => timeOfDay().lamps > 0.3;
export const WOOD = '#7C4A1E', STONE = '#B8B2A6', PLASTER = '#F5F0E0', TIMBER = '#3F2A14', TILE = '#9A3412', SLATE = '#3E5A8A';
const GOLD = '#CA8A04', BRASS = '#B8860B';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A timber (local): a beam from (x1, y1) to (x2, y2), `w` thick, lit along its upper side, inked. */
const beam = (g: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, T: string[]) => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, nx = (-dy / d) * w / 2, ny = (dx / d) * w / 2;
  poly(g, [[x1 + nx * 1.4, y1 + ny * 1.4], [x2 + nx * 1.4, y2 + ny * 1.4], [x2 - nx * 1.4, y2 - ny * 1.4], [x1 - nx * 1.4, y1 - ny * 1.4]], INK);
  poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], T[2]);
  // (the lit side: the one toward the upper left)
  const up = ny > 1e-3 || (Math.abs(ny) <= 1e-3 && nx > 0) ? -1 : 1;
  poly(g, [[x1 + nx * up, y1 + ny * up], [x2 + nx * up, y2 + ny * up], [x2 + nx * up * 0.3, y2 + ny * up * 0.3], [x1 + nx * up * 0.3, y1 + ny * up * 0.3]], T[3]);
};
/** A window with green shutters folded back and a flower box of red geraniums under it (local: top-left x, y). */
const shutterWindow = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  hole(g, x, y, w, h, true);
  const Sh = ramp6(dimmed('#166534'));
  for (const sx of [x - 11, x + w + 2]) { box(g, sx - 1, y - 1, 11, h + 2, INK); box(g, sx, y, 9, h, Sh[3]); box(g, sx, y, 1, h, Sh[4]); for (let yy = y + 3; yy < y + h - 2; yy += 4) box(g, sx + 1, yy, 7, 1, Sh[1]); }
  const P = ramp6(dimmed('#78350F'));
  box(g, x - 5, y + h + 2, w + 10, 8, INK); box(g, x - 4, y + h + 3, w + 8, 6, P[3]); box(g, x - 4, y + h + 3, w + 8, 1, P[4]);
  for (let k = 0; k < (w + 8) / 4; k++) {
    const fx = x - 3 + k * 4, t = hash(seed + k);
    box(g, fx, y + h - 1, 3, 4, dimmed('#2F6B2A'));
    if (t > 0.3) { box(g, fx, y + h - 3, 3, 3, dimmed(t > 0.65 ? '#DC2626' : '#EF4444')); box(g, fx, y + h - 3, 1, 1, dimmed('#FECACA')); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The half-timbered fronts (FACADE_D, braced)

export interface DeFront { rx: number; w: number; h: number; name: string }
const paintFront = (g: Ctx, f: DeFront) => {
  const { w, h } = f, R = ramp6(dimmed(PLASTER)), T = ramp6(dimmed(TIMBER)), S = ramp6(dimmed('#9C948A')), Rf = ramp6(dimmed(TILE)), seed = f.rx;
  const gh = 80, mid = -Math.round(h / 2);
  // (the gable end and the walls under it: plaster, stippled)
  poly(g, [[-2, 1], [-2, -h], [w / 2, -h - gh - 2], [w + 2, -h], [w + 2, 1]], INK);
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h); g.lineTo(w / 2, -h - gh); g.lineTo(w, -h); g.lineTo(w, 0); g.closePath(); g.clip();
  slab(g, 0, -h - gh, w, h + gh, R, false); stucco(g, 0, -h - gh, w, h + gh, R, seed);
  // (the timber frame: posts every 60, the sill, the rail, the plate; braces down the ground floor, St Andrew's crosses
  // up the first; the gable's own posts and its collar)
  for (let x = 0; x <= w; x += 60) beam(g, Math.min(w - 3, Math.max(3, x)), -h, Math.min(w - 3, Math.max(3, x)), -24, 6, T);
  for (const y of [-24, mid, -h]) beam(g, 0, y, w, y, 6, T);
  for (let x = 0, k = 0; x < w - 30; x += 60, k++) {
    const a = x + 3, b = Math.min(w, x + 60) - 3;
    if (k % 2) { beam(g, a, mid + 3, b, -h + 3, 4, T); beam(g, a, -h + 3, b, mid + 3, 4, T); }
    else beam(g, a, mid + 3, b, -h + 3, 4, T);
    if (k % 2 === 0 && x > 0) beam(g, a, -27, a + 22, mid + 3, 4, T);
  }
  beam(g, w * 0.25, -h - gh * 0.5, w * 0.75, -h - gh * 0.5, 5, T);
  beam(g, w / 2, -h, w / 2, -h - gh + 6, 5, T);
  g.restore();
  // (the stone plinth along the foot)
  box(g, 0, -22, w, 22, INK); stoneBlocks(g, 0, -21, w, 21, S, seed, 30, 11);
  // (the tiled verges up the gable, the bargeboards lit along their tops, the ridge's finial)
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -16 : w + 16, y0 = -h + 6;
    poly(g, [[x0, y0], [w / 2, -h - gh - 10], [w / 2, -h - gh + 2], [x0 - s * 4, y0 + 10]], INK);
    poly(g, [[x0 + s * -1, y0 + 1], [w / 2, -h - gh - 8], [w / 2, -h - gh + 1], [x0 - s * 4, y0 + 8]], Rf[s < 0 ? 3 : 2]);
    for (let k = 0; k < 12; k++) { const t = k / 12, x = x0 + (w / 2 - x0) * t, y = y0 + (-h - gh - 8 - y0) * t; box(g, x - 1, y + 3, 3, 3, Rf[1]); box(g, x - 1, y + 3, 3, 1, Rf[4]); }
    beam(g, x0 - s * 2, y0 + 9, w / 2, -h - gh + 2, 4, T);
  }
  box(g, w / 2 - 2, -h - gh - 18, 4, 10, INK); box(g, w / 2 - 1, -h - gh - 17, 2, 9, dimmed(GOLD));
  // (the attic window up the gable, the windows with their shutters and geraniums, the arched plank door)
  hole(g, w / 2 - 10, -h - gh * 0.42 - 6, 20, 22, true);
  for (const wx of [26, w - 58]) shutterWindow(g, wx, -h + 28, 32, 30, seed + wx);
  const dx = w / 2 - 20, P = ramp6(dimmed('#5C3A1A'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(dx - 4, 0); g.lineTo(dx - 4, -58); g.arc(dx + 20, -58, 24, Math.PI, 0); g.lineTo(dx + 44, 0); g.closePath(); g.fill();
  g.fillStyle = S[3]; g.beginPath(); g.moveTo(dx - 3, 0); g.lineTo(dx - 3, -58); g.arc(dx + 20, -58, 23, Math.PI, 0); g.lineTo(dx + 43, 0); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(dx, 0); g.lineTo(dx, -58); g.arc(dx + 20, -58, 20, Math.PI, 0); g.lineTo(dx + 40, 0); g.closePath(); g.clip();
  if (lampsOn()) { box(g, dx, -80, 40, 80, '#B07024'); box(g, dx, -80, 40, 30, '#E8A646'); }
  else { planks(g, dx, -80, 40, 80, P, true, seed, 8); for (const y of [-60, -24]) { box(g, dx, y, 40, 3, dimmed('#2A2A2A')); box(g, dx, y, 40, 1, dimmed('#6A6A6A')); } box(g, dx + 30, -40, 3, 3, dimmed(GOLD)); }
  g.restore();
  // (the painted board between the windows; an iron bracket sign off the wall by the door: a stein on it)
  board(g, w / 2, -h + 46, [f.name], LOOKS.germany(1), dimmed('#14532D'), ramp6(dimmed(GOLD)), 4);
  const bx = dx - 30, by = -96, I = ramp6(dimmed('#27272A'));
  box(g, bx - 2, by, 30, 3, I[2]); box(g, bx - 2, by, 30, 1, I[4]); g.strokeStyle = I[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(bx + 26, by + 3); g.quadraticCurveTo(bx + 12, by + 4, bx + 6, by + 14); g.stroke();
  for (const sx of [bx + 2, bx + 16]) box(g, sx, by + 3, 1, 6, I[3]);
  box(g, bx, by + 9, 20, 18, INK); box(g, bx + 1, by + 10, 18, 16, dimmed('#F59E0B')); box(g, bx + 1, by + 10, 18, 4, dimmed('#FFFFFF')); box(g, bx + 1, by + 10, 3, 16, dimmed('#FCD34D'));
  box(g, bx + 19, by + 13, 4, 9, INK); box(g, bx + 20, by + 15, 2, 5, dimmed('#F59E0B'));
};
export const drawFront = (c: Ctx, v: View, x: number, f: DeFront) => facade(c, v, `de-front-${f.rx}`, x, f.w, f.h, g => paintFront(g, f), undefined, 100, 24);

// ---------------------------------------------------------------------------------------------------------------
// THE CASTLE (set back at 0.93) and the far tower

/** A round tower (local: its foot's left at (x, 0), `w` across, `h` up, its slate cone `roof` high): cut stone shaded
 *  round (lit left, dark right, in bands), its windows, a corbelled ring under the cone, the cone's scales shaded the
 *  same way, its finial and pennant. */
const roundTower = (g: Ctx, x: number, w: number, h: number, roof: number, seed: number) => {
  const S = ramp6(dimmed(STONE)), Sl = ramp6(dimmed(SLATE));
  box(g, x - 1, -h - 1, w + 2, h + 1, INK);
  stoneBlocks(g, x, -h, w, h, S, seed, 24, 14);
  const bands = [0.1, 0.22, 0.6, 0.78, 0.9];
  bands.forEach((t, i) => { const bx = x + w * t; g.fillStyle = i < 2 ? 'rgba(255, 250, 235, 0.16)' : `rgba(20, 14, 24, ${0.1 + (i - 2) * 0.1})`; g.fillRect(Math.round(bx), -h, Math.round(w * (i < 2 ? 0.12 : 0.12 + (i - 2) * 0.05)), h); });
  box(g, x + w - 6, -h, 6, h, S[1]); checker(g, x + w - 10, -h, 4, h, S[1], 0, 1);
  for (let k = 0; k < 3; k++) {
    const wy = -h + 60 + k * 160, ww = 16;
    if (wy > -60) break;
    g.fillStyle = INK; g.beginPath(); g.moveTo(x + w / 2 - ww / 2 - 2, wy + 32); g.lineTo(x + w / 2 - ww / 2 - 2, wy + 6); g.arc(x + w / 2, wy + 6, ww / 2 + 2, Math.PI, 0); g.lineTo(x + w / 2 + ww / 2 + 2, wy + 32); g.closePath(); g.fill();
    hole(g, x + w / 2 - ww / 2, wy + 4, ww, 26, true);
  }
  // (the corbels and the ring of battlements under the cone)
  box(g, x - 7, -h - 14, w + 14, 14, INK); box(g, x - 6, -h - 13, w + 12, 12, S[3]); box(g, x - 6, -h - 13, w + 12, 1, S[5]);
  for (let cx = x - 4; cx < x + w + 4; cx += 10) { box(g, cx, -h - 2, 6, 6, S[2]); box(g, cx, -h + 3, 6, 1, S[0]); }
  // (the cone: slate scales, lit left, shaded right)
  const tip: [number, number] = [x + w / 2, -h - 14 - roof];
  poly(g, [[x - 10, -h - 12], tip, [x + w + 10, -h - 12]], INK);
  g.save(); g.beginPath(); g.moveTo(x - 9, -h - 13); g.lineTo(tip[0], tip[1] + 2); g.lineTo(x + w + 9, -h - 13); g.closePath(); g.clip();
  shingles(g, x - 10, -h - 14 - roof, w + 20, roof + 2, Sl, 7, 6, seed);
  g.fillStyle = 'rgba(255, 250, 235, 0.14)'; g.fillRect(x - 10, -h - 14 - roof, (w + 20) * 0.3, roof + 2);
  g.fillStyle = 'rgba(20, 14, 24, 0.3)'; g.fillRect(x + (w + 20) * 0.62 - 10, -h - 14 - roof, (w + 20) * 0.4, roof + 2);
  g.restore();
  box(g, tip[0] - 1, tip[1] - 26, 3, 28, INK); box(g, tip[0], tip[1] - 25, 1, 26, dimmed(GOLD)); ball(g, tip[0], tip[1] - 2, 3, dimmed(GOLD));
  poly(g, [[tip[0] + 2, tip[1] - 26], [tip[0] + 22, tip[1] - 21], [tip[0] + 2, tip[1] - 16]], dimmed('#1D4ED8'));
  poly(g, [[tip[0] + 2, tip[1] - 26], [tip[0] + 12, tip[1] - 23.5], [tip[0] + 2, tip[1] - 21]], dimmed('#F8FAFC'));
};
/** A banner in Bavarian lozenges hung down a wall (local: its rod's middle at (x, y), `h` long). */
const lozengeBanner = (g: Ctx, x: number, y: number, h: number) => {
  const B = ramp6(dimmed('#2563EB')), W = ramp6(dimmed('#F8FAFC')), bw = 40;
  box(g, x - bw / 2 - 4, y - 3, bw + 8, 4, INK); box(g, x - bw / 2 - 3, y - 2, bw + 6, 2, dimmed(GOLD));
  box(g, x - bw / 2 - 1, y, bw + 2, h + 1, INK);
  g.save(); g.beginPath(); g.rect(x - bw / 2, y, bw, h); g.clip();
  box(g, x - bw / 2, y, bw, h, W[3]);
  for (let r = 0; r * 10 < h + 10; r++) for (let k = -1; k < 5; k++) { const cx = x - bw / 2 + k * 10 + (r % 2) * 5, cy = y + r * 10; poly(g, [[cx, cy - 5], [cx + 5, cy], [cx, cy + 5], [cx - 5, cy]], B[3]); box(g, cx - 1, cy - 4, 1, 2, B[4]); }
  box(g, x + bw / 2 - 5, y, 5, h, 'rgba(20, 14, 24, 0.25)');
  g.restore();
  poly(g, [[x - bw / 2 - 1, y + h], [x + bw / 2 + 1, y + h], [x, y + h + 14]], INK); poly(g, [[x - bw / 2, y + h], [x + bw / 2, y + h], [x, y + h + 12]], W[2]);
};
const paintCastle = (g: Ctx) => {
  const S = ramp6(dimmed(STONE)), W = 1180, H = 600;
  box(g, -1, -H - 1, W + 2, H + 1, INK);
  stoneBlocks(g, 0, -H, W, H, S, 1720, 40, 20);
  box(g, 0, -40, W, 40, S[1]); checker(g, 0, -46, W, 6, S[1], 0, 2);
  // (the corbels along the top and the battlements over them)
  box(g, -6, -H - 4, W + 12, 18, INK); box(g, -5, -H - 3, W + 10, 16, S[3]); box(g, -5, -H - 3, W + 10, 1, S[5]);
  for (let x = 0; x < W; x += 18) { box(g, x, -H + 13, 10, 8, S[2]); box(g, x, -H + 20, 10, 1, S[0]); }
  for (let x = 4; x < W - 20; x += 36) { box(g, x - 1, -H - 26, 22, 23, INK); box(g, x, -H - 25, 20, 22, S[3]); box(g, x, -H - 25, 20, 1, S[5]); box(g, x, -H - 25, 3, 22, S[4]); box(g, x + 17, -H - 25, 3, 22, S[1]); }
  // (arched windows in two rows, arrow slits between)
  for (const [wy, n] of [[-470, 7], [-320, 9]] as const) for (let k = 0; k < n; k++) {
    const wx = 110 + k * ((W - 260) / (n - 1)) - 14;
    if (wx > 900 && wx < 1100) continue;
    g.fillStyle = INK; g.beginPath(); g.moveTo(wx - 4, wy + 50); g.lineTo(wx - 4, wy + 12); g.arc(wx + 14, wy + 12, 18, Math.PI, 0); g.lineTo(wx + 32, wy + 50); g.closePath(); g.fill();
    g.fillStyle = S[4]; g.beginPath(); g.arc(wx + 14, wy + 12, 17, Math.PI, 0); g.fill();
    hole(g, wx, wy + 6, 28, 42, true);
    box(g, wx + 40, wy + 14, 4, 22, INK); box(g, wx + 40, wy + 14, 1, 22, S[4]);
  }
  // (the gate's arch, behind the portcullis: the dark passage, the voussoirs round it)
  const gx = 1000, gr = 64;
  g.fillStyle = INK; g.beginPath(); g.moveTo(gx - gr - 14, 0); g.lineTo(gx - gr - 14, -200); g.arc(gx, -200, gr + 14, Math.PI, 0); g.lineTo(gx + gr + 14, 0); g.closePath(); g.fill();
  for (let k = 0; k <= 12; k++) { const a = Math.PI + (k / 12) * Math.PI; const vx = gx + Math.cos(a) * (gr + 7), vy = -200 + Math.sin(a) * (gr + 7); box(g, vx - 6, vy - 6, 12, 12, k % 2 ? S[3] : S[4]); }
  g.fillStyle = '#140C10'; g.beginPath(); g.moveTo(gx - gr, 0); g.lineTo(gx - gr, -200); g.arc(gx, -200, gr, Math.PI, 0); g.lineTo(gx + gr, 0); g.closePath(); g.fill();
  box(g, gx - gr, -24, gr * 2, 24, '#22161A');
  // (the banners, the ivy up its foot)
  lozengeBanner(g, 300, -560, 200); lozengeBanner(g, 760, -560, 200);
  for (let i = 0; i < 260; i++) { const x = hash(i * 1.3) * W, y = -6 - hash(i * 2.7) * 90 * hash(x * 0.01); box(g, x, y, 3, 2, dimmed(i % 3 ? '#3F6212' : '#4D7C0F')); }
  // (the towers either end)
  roundTower(g, -40, 120, 820, 150, 11);
  roundTower(g, 1080, 140, 860, 150, 23);
};
export const drawCastle = (c: Ctx, v: View, x: number) => facade(c, v, 'de-castle', x, 1180, 600, paintCastle, 0.93, 470, 70, false);
/** The far tower at the end of the battlements (set back at 0.95). */
export const drawFarTower = (c: Ctx, v: View, x: number) => facade(c, v, 'de-fartower', x, 170, 640, g => roundTower(g, 0, 170, 640, 150, 31), 0.95, 200, 24, false);

// ---------------------------------------------------------------------------------------------------------------
// THE CUCKOO CLOCK (its house set back at 0.95, the hands and pendulum live)

const paintClock = (g: Ctx) => {
  const W = ramp6(dimmed(WOOD)), L = ramp6(dimmed('#C8A060')), Sh = ramp6(dimmed('#3F2A14')), Gd = ramp6(dimmed(BRASS));
  // (the house: planks, carved leaves at its corners)
  box(g, -1, -981, 362, 342, INK); planks(g, 0, -980, 360, 340, W, true, 7, 14);
  box(g, 0, -980, 360, 340, 'rgba(20, 14, 24, 0.12)');
  for (const lx of [10, 330]) for (let k = 0; k < 5; k++) { const ly = -940 + k * 60; poly(g, [[lx, ly], [lx + 10, ly - 12], [lx + 20, ly], [lx + 10, ly + 14]], L[2]); box(g, lx + 9, ly - 10, 2, 22, L[1]); box(g, lx + 4, ly - 4, 4, 2, L[4]); }
  // (the steep roof: shingles, the fretwork verges, a carved bird on the peak)
  poly(g, [[-32, -978], [180, -1124], [392, -978]], INK);
  g.save(); g.beginPath(); g.moveTo(-28, -980); g.lineTo(180, -1120); g.lineTo(388, -980); g.closePath(); g.clip();
  shingles(g, -30, -1122, 420, 144, Sh, 10, 8, 3);
  g.fillStyle = 'rgba(20, 14, 24, 0.25)'; g.fillRect(180, -1122, 220, 144);
  g.restore();
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -32 : 392;
    for (let k = 0; k < 14; k++) { const t = k / 14, x = x0 + (180 - x0) * t, y = -978 + (-1124 + 978) * t; box(g, x - 4, y + 2, 9, 9, INK); box(g, x - 3, y + 3, 7, 7, L[3]); box(g, x - 1, y + 5, 3, 3, INK); box(g, x - 3, y + 3, 7, 1, L[5]); }
  }
  ball(g, 180, -1132, 9, dimmed('#7C4A1E')); poly(g, [[186, -1134], [200, -1130], [186, -1128]], dimmed('#F59E0B')); box(g, 176, -1136, 3, 3, INK);
  poly(g, [[170, -1132], [160, -1146], [176, -1138]], dimmed('#5C3A1A'));
  // (the fretwork band under the eaves)
  box(g, 0, -980, 360, 14, INK); for (let k = 0; k < 10; k++) { box(g, 10 + k * 34, -979, 20, 12, L[3]); box(g, 10 + k * 34, -979, 20, 1, L[5]); box(g, 17 + k * 34, -975, 6, 6, INK); }
  // (the dial: a brass bezel, cream enamel, its numbers that don't line up)
  g.fillStyle = INK; g.beginPath(); g.arc(180, -840, 100, 0, Math.PI * 2); g.fill();
  g.fillStyle = Gd[3]; g.beginPath(); g.arc(180, -840, 98, 0, Math.PI * 2); g.fill();
  g.fillStyle = Gd[4]; g.beginPath(); g.arc(178, -842, 98, Math.PI, Math.PI * 1.5); g.lineTo(180, -840); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(180, -840, 93, 0, Math.PI * 2); g.fill();
  g.fillStyle = dimmed('#F5F0E0'); g.beginPath(); g.arc(180, -840, 92, 0, Math.PI * 2); g.fill();
  g.fillStyle = dimmed('#E2DAC4'); g.beginPath(); g.arc(184, -836, 86, 0, Math.PI * 2); g.fill();
  g.fillStyle = dimmed('#F5F0E0'); g.beginPath(); g.arc(178, -842, 82, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + (hash(k * 3.7) - 0.5) * 0.3, r = 74 + (hash(k * 1.3) - 0.5) * 8, nx = 180 + Math.cos(a) * r, ny = -840 + Math.sin(a) * r;
    const n = 1 + Math.floor(hash(k * 5.1) * 3);
    for (let j = 0; j < n; j++) { box(g, nx - n * 2 + j * 4 - 1, ny - 6, 3, 12, INK); box(g, nx - n * 2 + j * 4, ny - 5, 1, 10, dimmed('#3F2A14')); }
  }
  // (the chains and the pine-cone weights)
  for (const wx of [60, 300]) {
    for (let y = -740; y < -622; y += 6) { box(g, wx - 1, y, 4, 4, INK); box(g, wx, y + 1, 2, 2, Gd[(y / 6) % 2 ? 3 : 2]); }
    const Pc = ramp6(dimmed('#5C3A1A'));
    g.fillStyle = INK; g.beginPath(); g.ellipse(wx + 1, -598, 12, 24, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Pc[2]; g.beginPath(); g.ellipse(wx + 1, -598, 11, 23, 0, 0, Math.PI * 2); g.fill();
    for (let r = 0; r < 8; r++) for (let k = 0; k < 3; k++) { const sx = wx - 8 + k * 6 + (r % 2) * 3, sy = -616 + r * 5; box(g, sx, sy, 5, 3, Pc[3]); box(g, sx, sy, 5, 1, Pc[4]); box(g, sx, sy + 3, 5, 1, Pc[0]); }
  }
};
export const drawClockHouse = (c: Ctx, v: View, x: number, f: number) => {
  if (!onScreen(v, x - 40, x + 400, 0.95)) return;
  atDepth(c, v.eye, 0.95, () => {
    still(c, 'de-clock', x, GY, -40, -1150, 440, 590, paintClock);
    c.save(); c.translate(x, GY);
    // (the hands at the wrong time, brass, inked; the pendulum swinging, its bob a carved leaf)
    const t = f * 0.002, Gd = ramp6(dimmed(BRASS));
    for (const [a, len, wd] of [[t * 12, 50, 5], [t, 74, 4]] as const) {
      c.strokeStyle = INK; c.lineWidth = wd + 2; c.beginPath(); c.moveTo(180, -840); c.lineTo(180 + Math.cos(a) * len, -840 + Math.sin(a) * len); c.stroke();
      c.strokeStyle = dimmed('#1C1917'); c.lineWidth = wd; c.beginPath(); c.moveTo(180, -840); c.lineTo(180 + Math.cos(a) * len, -840 + Math.sin(a) * len); c.stroke();
    }
    ball(c, 180, -840, 6, Gd[3]);
    const sw = Math.sin(f * 0.05) * 0.35, px0 = 180 + Math.sin(sw) * 160, py0 = -740 + Math.cos(sw) * 160;
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(180, -740); c.lineTo(px0, py0); c.stroke();
    c.strokeStyle = Gd[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(180, -740); c.lineTo(px0, py0); c.stroke();
    const Lf = ramp6(dimmed('#B45309'));
    poly(c, [[px0, py0 - 22], [px0 + 18, py0], [px0, py0 + 24], [px0 - 18, py0]], INK);
    poly(c, [[px0, py0 - 20], [px0 + 16, py0], [px0, py0 + 22], [px0 - 16, py0]], Lf[3]);
    poly(c, [[px0, py0 - 20], [px0 - 16, py0], [px0, py0 + 22]], Lf[4]);
    box(c, px0 - 1, py0 - 18, 2, 38, Lf[1]);
    c.restore();
  });
};

/** The cuckoo (in front of the battlements): its door in a carved frame, open in the warning, the bird out on its arm
 *  pecking (carved and painted: a breast, wing feathers, the beak, googly eyes). */
export const drawCuckoo = (c: Ctx, dx: number, dy: number, st: 'in' | 'warn' | 'out', k: number, f: number) => {
  const W = ramp6(hour(WOOD)), L = ramp6(hour('#C8A060'));
  box(c, dx - 36, dy - 44, 72, 62, INK); box(c, dx - 35, dy - 43, 70, 60, L[3]); box(c, dx - 35, dy - 43, 70, 1, L[5]); box(c, dx - 35, dy - 43, 2, 60, L[4]); box(c, dx + 31, dy - 43, 4, 60, L[1]);
  for (let x = dx - 32; x < dx + 30; x += 8) { box(c, x, dy + 12, 5, 4, L[2]); box(c, x + 1, dy + 13, 3, 2, INK); }
  if (st === 'in') { box(c, dx - 26, dy - 32, 52, 44, W[3]); box(c, dx - 26, dy - 32, 52, 1, W[5]); box(c, dx, dy - 32, 1, 44, W[1]); for (const y of [dy - 26, dy + 4]) box(c, dx - 22, y, 44, 2, W[2]); ball(c, dx + 18, dy - 10, 2.5, hour(GOLD)); return; }
  box(c, dx - 26, dy - 32, 52, 44, '#1C1014'); box(c, dx - 26, dy - 32, 52, 6, '#120A0E');
  if (st === 'warn') { box(c, dx - 37, dy - 32, 11, 44, INK); box(c, dx - 36, dy - 31, 9, 42, W[3]); box(c, dx - 36, dy - 31, 1, 42, W[5]); return; }
  const by = dy - 10 + k * 100;
  box(c, dx - 3, dy - 10, 6, k * 100, INK); box(c, dx - 2, dy - 10, 4, k * 100, W[2]); box(c, dx - 2, dy - 10, 1, k * 100, W[4]);
  const B = ramp6(hour('#92400E'));
  box(c, dx - 30, by - 22, 60, 40, INK); box(c, dx - 28, by - 20, 56, 36, B[3]); box(c, dx - 28, by - 20, 56, 3, B[4]); box(c, dx + 18, by - 20, 10, 36, B[2]);
  box(c, dx - 20, by - 2, 34, 16, hour('#E7D3A8')); box(c, dx - 20, by - 2, 34, 2, hour('#F5EBD0'));
  for (let r = 0; r < 3; r++) for (let j = 0; j < 4; j++) { box(c, dx - 24 + j * 7 + (r % 2) * 3, by - 14 + r * 5, 6, 3, B[1]); box(c, dx - 24 + j * 7 + (r % 2) * 3, by - 14 + r * 5, 6, 1, B[4]); }
  box(c, dx - 20, by - 14, 40, 6, hour('#FCD34D')); box(c, dx - 20, by - 14, 40, 1, hour('#FEF08A'));
  for (const ex of [dx - 14, dx + 6]) { box(c, ex - 1, by - 19, 12, 12, INK); box(c, ex, by - 18, 10, 10, '#FFFFFF'); box(c, ex + 3 + Math.round(Math.sin(f * 0.6) * 2), by - 15, 4, 4, INK); }
  const open = (f >> 2) % 2 ? 4 : 0;
  poly(c, [[dx - 11, by + 13], [dx + 11, by + 13], [dx, by + 37]], INK); poly(c, [[dx - 10, by + 14], [dx + 10, by + 14], [dx, by + 35 - open]], hour('#F59E0B'));
  poly(c, [[dx - 10, by + 14], [dx, by + 14], [dx, by + 33 - open]], hour('#FBBF24'));
};

// ---------------------------------------------------------------------------------------------------------------
// The wheel of carved figures

export const FIGS = ['woodcutter', 'couple', 'drinker', 'goat', 'hunter', 'milkmaid'] as const;
/** A carved, painted figure standing at the back of its platform (local: the platform's left at 0, its top at 0). */
const paintFigure = (g: Ctx, kind: typeof FIGS[number], sway: number) => {
  const W = ramp6(hour(WOOD)), Sk = ramp6(hour('#E8C7A0'));
  const person = (bx: number, col: string, h = 40, hat?: string, skirt = false) => {
    const R = ramp6(hour(col));
    box(g, bx - 8, -h - 1, 16, h - 9, INK); box(g, bx - 7, -h, 14, h - 11, R[3]); box(g, bx - 7, -h, 3, h - 11, R[4]); box(g, bx + 4, -h, 3, h - 11, R[2]);
    if (skirt) { poly(g, [[bx - 10, -10], [bx - 7, -h * 0.55], [bx + 7, -h * 0.55], [bx + 10, -10]], INK); poly(g, [[bx - 9, -11], [bx - 6, -h * 0.55], [bx + 6, -h * 0.55], [bx + 9, -11]], R[3]); box(g, bx - 5, -h * 0.5, 10, 14, hour('#F5F5F4')); }
    else for (const lx of [bx - 6, bx + 2]) { box(g, lx - 1, -11, 6, 11, INK); box(g, lx, -10, 4, 10, W[2]); box(g, lx, -10, 1, 10, W[4]); }
    box(g, bx - 6, -h - 12, 12, 12, INK); box(g, bx - 5, -h - 11, 10, 10, Sk[3]); box(g, bx - 5, -h - 11, 3, 10, Sk[4]);
    box(g, bx + 1, -h - 8, 2, 2, INK); box(g, bx - 3, -h - 8, 2, 2, INK); box(g, bx - 4, -h - 4, 2, 2, hour('#F87171')); box(g, bx + 2, -h - 4, 2, 2, hour('#F87171'));
    if (hat) { const Hh = ramp6(hour(hat)); box(g, bx - 8, -h - 13, 16, 3, INK); box(g, bx - 7, -h - 13, 14, 2, Hh[3]); box(g, bx - 4, -h - 18, 8, 6, INK); box(g, bx - 3, -h - 17, 6, 5, Hh[3]); box(g, bx - 3, -h - 17, 2, 5, Hh[4]); }
  };
  switch (kind) {
    case 'woodcutter': {
      person(30, '#991B1B', 40, '#166534');
      box(g, 52, -13, 22, 13, INK); planks(g, 53, -12, 20, 12, W, false, 3, 6); g.fillStyle = W[4]; g.beginPath(); g.ellipse(73, -6, 3, 6, 0, 0, Math.PI * 2); g.fill();
      box(g, 39, -48 + sway, 4, 28, INK); box(g, 40, -47 + sway, 2, 26, W[3]); box(g, 37, -52 + sway, 12, 7, INK); box(g, 38, -51 + sway, 10, 5, hour('#CBD5E1')); box(g, 38, -51 + sway, 10, 1, '#FFFFFF');
      break;
    }
    case 'couple': person(24, '#15803D', 40, '#3F2A14'); person(48, '#B91C1C', 36, undefined, true); box(g, 30, -30 + sway, 14, 3, INK); box(g, 31, -30 + sway, 12, 2, Sk[3]); break;
    case 'drinker': {
      person(36, '#1E3A8A', 40, '#166534');
      box(g, 43, -46 - sway, 10, 14, INK); box(g, 44, -45 - sway, 8, 12, hour('#F59E0B')); box(g, 44, -45 - sway, 8, 3, '#FFFFFF'); box(g, 44, -45 - sway, 2, 12, hour('#FCD34D')); box(g, 52, -42 - sway, 3, 7, INK);
      break;
    }
    case 'goat': {
      const G = ramp6(hour('#F5F5F4'));
      box(g, 19, -31, 42, 20, INK); box(g, 20, -30, 40, 18, G[3]); box(g, 20, -30, 40, 3, G[4]); box(g, 20, -16, 40, 4, G[2]);
      box(g, 55, -41 - sway, 14, 14, INK); box(g, 56, -40 - sway, 12, 12, G[3]); box(g, 56, -40 - sway, 12, 2, G[4]);
      box(g, 63, -38 - sway, 2, 2, INK); box(g, 60, -29 - sway, 4, 6, G[2]);
      for (const hx of [57, 63]) poly(g, [[hx, -40 - sway], [hx - 3, -50 - sway], [hx + 2, -41 - sway]], W[2]);
      for (const lx of [23, 31, 47, 53]) { box(g, lx - 1, -13, 5, 13, INK); box(g, lx, -12, 3, 12, W[2]); }
      break;
    }
    case 'hunter': {
      person(34, '#166534', 40, '#166534');
      box(g, 40, -47, 28, 4, INK); box(g, 41, -46, 26, 2, W[1]); box(g, 62, -49, 4, 6, INK);
      box(g, 28, -66, 2, 10, hour('#F5F5F4'));
      break;
    }
    case 'milkmaid': {
      person(36, '#1E40AF', 38, undefined, true);
      const M = ramp6(hour('#D6D3D1'));
      box(g, 47, -27 + sway, 12, 12, INK); box(g, 48, -26 + sway, 10, 10, M[3]); box(g, 48, -26 + sway, 3, 10, M[4]); box(g, 48, -26 + sway, 10, 2, '#FFFFFF');
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(53, -26 + sway, 6, Math.PI, 0); g.stroke();
      break;
    }
  }
};
export const drawFigure = (c: Ctx, kind: typeof FIGS[number], x: number, y: number, f: number) => {
  const sway = Math.round(Math.sin(f * 0.08) * 2);
  still(c, `de-fig-${kind}-${sway}`, x, y, -6, -80, 100, 82, g => paintFigure(g, kind, sway));
};
/** The wheel behind the figures (dimmed, thin: not somewhere to stand): the carved rim with its teeth turning with it,
 *  the turned spokes out to each platform, the brass hub. `pts`: each platform's middle. */
export const drawWheelArt = (c: Ctx, cx: number, cy: number, r: number, pts: { x: number; y: number }[], turn: number) => {
  const W = ramp6(dimmed(WOOD)), Gd = ramp6(dimmed(BRASS));
  c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = W[2]; c.lineWidth = 7; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = W[4]; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r - 2, Math.PI * 0.9, Math.PI * 1.7); c.stroke();
  c.strokeStyle = W[0]; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r + 2, Math.PI * -0.1, Math.PI * 0.7); c.stroke();
  for (let k = 0; k < 36; k++) { const a = turn + (k / 36) * Math.PI * 2, tx = cx + Math.cos(a) * (r + 7), ty = cy + Math.sin(a) * (r + 7); box(c, tx - 3, ty - 3, 6, 6, INK); box(c, tx - 2, ty - 2, 4, 4, k % 2 ? W[3] : W[2]); }
  for (const p of pts) {
    c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(p.x, p.y + 8); c.stroke();
    c.strokeStyle = W[3]; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(p.x, p.y + 8); c.stroke();
    c.strokeStyle = W[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy - 1); c.lineTo(p.x, p.y + 7); c.stroke();
    const mx = (cx + p.x) / 2, my = (cy + p.y + 8) / 2; ball(c, mx, my, 4, W[3]);
  }
  ball(c, cx, cy, 26, Gd[3]);
  for (let k = 0; k < 8; k++) { const a = turn + (k / 8) * Math.PI * 2; box(c, cx + Math.cos(a) * 17 - 2, cy + Math.sin(a) * 17 - 2, 4, 4, Gd[1]); }
  ball(c, cx, cy, 7, Gd[4]);
};

// ---------------------------------------------------------------------------------------------------------------
// The battlements, the portcullis, the balconies

/** The merlons along the battlements' back edge (at 0.94, where the walk's top ends; dimmed: not somewhere to stand),
 *  lit left, shaded right, the odd slit. */
export const merlons = (c: Ctx, v: View, a: number, b: number, y: number) => {
  const S = ramp6(dimmed(STONE)), d = 0.94, [pa, py] = at(v.eye, a, y, d), [pb] = at(v.eye, b, y, d);
  box(c, pa, py - 8, pb - pa, 8, S[2]); box(c, pa, py - 8, pb - pa, 1, S[4]);
  for (let x = a; x < b; x += 40) {
    const [mx] = at(v.eye, x, y, d), m = Math.round(22 * d), t = Math.round(py - 30 * d);
    box(c, mx - 1, t - 1, m + 2, py - 7 - t + 1, INK); box(c, mx, t, m, py - 7 - t, S[3]); box(c, mx, t, m, 1, S[5]); box(c, mx, t, 3, py - 7 - t, S[4]); box(c, mx + m - 4, t, 4, py - 7 - t, S[1]);
    box(c, mx, t + 11, m, 1, S[1]); box(c, mx + Math.round(m / 2), t, 1, 11, S[1]);
    if (hash(x * 0.13) > 0.5) { box(c, mx + 9, t + 4, 4, 11, INK); box(c, mx + 9, t + 4, 1, 11, S[4]); }
  }
};
/** The portcullis (ground to battlements: no way through) and the stone jambs either side of it. */
export const drawPortcullis = (c: Ctx, a: number, b: number, top: number, battleY: number) => {
  still(c, `de-portcullis-${b - a}`, a, battleY, -32, 0, b - a + 54, GY - battleY + 2, g => {
    const S = ramp6(hour(STONE)), I = ramp6(hour('#4B4B55')), w = b - a, gt = top - battleY;
    box(g, -31, 19, 32, GY - battleY - 19, INK); stoneBlocks(g, -30, 20, 30, GY - battleY - 20, S, a, 15, 12); box(g, -30, 20, 2, GY - battleY - 20, S[5]);
    box(g, w - 1, 19, 22, GY - battleY - 19, INK); stoneBlocks(g, w, 20, 20, GY - battleY - 20, S, b, 10, 12); box(g, w + 16, 20, 4, GY - battleY - 20, S[1]);
    box(g, 0, gt, w, GY - top, '#140C10'); checker(g, 0, gt, w, GY - top, '#22161A', 0, 2);
    for (let x = 2; x < w; x += 9) { box(g, x - 1, gt, 6, GY - top, INK); box(g, x, gt, 4, GY - top, I[3]); box(g, x, gt, 1, GY - top, I[5]); box(g, x + 3, gt, 1, GY - top, I[1]); }
    for (let y = gt + 6; y < GY - battleY; y += 26) { box(g, 0, y - 1, w, 6, INK); box(g, 0, y, w, 4, I[2]); box(g, 0, y, w, 1, I[4]); for (let x = 2; x < w; x += 9) box(g, x + 1, y + 1, 2, 2, I[5]); }
    for (let x = 2; x < w; x += 9) { poly(g, [[x - 1, GY - battleY - 6], [x + 5, GY - battleY - 6], [x + 2, GY - battleY + 1]], INK); poly(g, [[x, GY - battleY - 6], [x + 4, GY - battleY - 6], [x + 2, GY - battleY]], I[4]); }
  });
};
/** A balcony's railing along its back (set back at 0.95: behind where he stands): posts and a top rail, dimmed iron. */
export const backRail = (c: Ctx, v: View, a: number, b: number, y: number) => {
  const I = ramp6(dimmed('#3F3F46')), [pa, py] = at(v.eye, a, y, 0.95), [pb] = at(v.eye, b, y, 0.95);
  box(c, pa, py - 17, pb - pa, 3, I[2]); box(c, pa, py - 17, pb - pa, 1, I[4]);
  for (let x = a + 6; x < b; x += 16) { const [qx] = at(v.eye, x, y, 0.95); box(c, qx, py - 15, 2, 15, I[2]); box(c, qx, py - 15, 1, 15, I[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The biergarten

/** A front for a box (local: its top-left at 0, 0): the bandstand's skirt in Bavarian lozenges. */
const paintLozenges = (g: Ctx, w: number, h: number) => {
  const B = ramp6(hour('#2563EB')), Wt = ramp6(hour('#F8FAFC'));
  box(g, -1, 0, w + 2, h, INK); box(g, 0, 0, w, h - 1, Wt[3]);
  g.save(); g.beginPath(); g.rect(0, 0, w, h - 1); g.clip();
  for (let r = 0; r * 12 < h + 12; r++) for (let k = -1; k * 12 < w + 12; k++) { const cx = k * 12 + (r % 2) * 6, cy = r * 12; poly(g, [[cx, cy - 6], [cx + 6, cy], [cx, cy + 6], [cx - 6, cy]], B[3]); box(g, cx - 1, cy - 5, 1, 3, B[4]); box(g, cx + 1, cy + 2, 1, 3, B[1]); }
  g.restore();
  box(g, 0, 0, w, 6, Wt[4]); box(g, 0, 5, w, 1, Wt[1]); box(g, 0, h - 7, w, 6, B[1]); box(g, w - 4, 0, 4, h, 'rgba(20, 14, 24, 0.25)');
};
/** A hay bale front (straw in rows, lit along each, twine bands). */
const paintBale = (g: Ctx, w: number, h: number) => {
  const S = ramp6(hour('#CA8A04'));
  box(g, -1, 0, w + 2, h, INK); box(g, 0, 0, w, h - 1, S[3]);
  for (let y = 2; y < h - 2; y += 4) for (let x = (y % 8) / 2; x < w; x += 6) { box(g, x, y, 4, 1, S[4]); box(g, x + 1, y + 2, 3, 1, S[2]); }
  for (const y of [Math.round(h * 0.3), Math.round(h * 0.7)]) { box(g, 0, y, w, 3, hour('#7C2D12')); box(g, 0, y, w, 1, hour('#B45309')); }
  for (let x = 0; x < w; x += 3) box(g, x, h - 4 - (x % 2), 2, 2, S[1]);
  box(g, w - 4, 0, 4, h, S[1]); box(g, 0, 0, 2, h, S[5]);
};
/** A stack of kegs lying with their heads to him (two under, one on top), the dark between them, a plank laid over. */
const paintKegStack = (g: Ctx, w: number, h: number) => {
  box(g, 2, 6, w - 4, h - 6, '#24160E');
  for (const [kx, ky, r] of [[w * 0.27, h - 18, 18], [w * 0.73, h - 18, 18], [w / 2, 24, 17]] as const) kegHead(g, kx, ky, r, 0);
  const P = ramp6(hour('#A16207'));
  box(g, -3, 0, w + 6, 7, INK); box(g, -2, 0, w + 4, 6, P[3]); box(g, -2, 0, w + 4, 1, P[5]); box(g, -2, 5, w + 4, 1, P[1]);
};
/** A keg's head (seen end on, spinning by `spin`): the steel chime, the head's staves, the bung; the light fixed. */
export const kegHead = (g: Ctx, x: number, y: number, r: number, spin: number) => {
  const O = ramp6(hour('#92400E')), I = ramp6(hour('#52525B'));
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = I[3]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = I[5]; g.beginPath(); g.arc(x - 1, y - 1, r, Math.PI * 1.05, Math.PI * 1.45); g.lineTo(x, y); g.fill();
  g.fillStyle = O[3]; g.beginPath(); g.arc(x, y, r - 4, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, r - 4, 0, Math.PI * 2); g.clip();
  g.translate(x, y); g.rotate(-spin);
  for (let k = -3; k <= 3; k++) { box(g, k * 6 - 3, -r, 6, r * 2, O[(k + 3) % 2 ? 3 : 2]); box(g, k * 6 - 3, -r, 1, r * 2, O[4]); box(g, k * 6 + 2, -r, 1, r * 2, O[1]); }
  box(g, -3, -r * 0.5, 6, 6, INK); box(g, -2, -r * 0.5 + 1, 4, 4, hour(GOLD)); box(g, -2, -r * 0.5 + 1, 2, 1, hour('#FDE68A'));
  g.restore();
  g.fillStyle = 'rgba(20, 14, 24, 0.3)'; g.beginPath(); g.arc(x + 2, y + 2, r - 4, -Math.PI * 0.2, Math.PI * 0.8); g.lineTo(x, y); g.fill();
  g.strokeStyle = I[1]; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r - 4, 0, Math.PI * 2); g.stroke();
};
/** Play-plane boxes with fronts of their own (bales, a keg stack, the lozenge skirt): every box's top and sides going
 *  back first, then each front (stamped), its lit lip. */
export const paintedBoxes = (c: Ctx, v: View, list: { b: Box3; kind: 'lozenge' | 'bale' | 'kegs' }[]) => {
  const vis = list.filter(o => onScreen(v, o.b.x, o.b.x + o.b.w));
  for (const o of vis) box3Back(c, v, o.b);
  for (const { b, kind } of vis) {
    const w = Math.round(b.w), h = Math.round(b.bottom - b.top);
    still(c, `de-box-${kind}-${w}x${h}`, b.x, b.top, -2, -1, w + 4, h + 2, g => (kind === 'lozenge' ? paintLozenges : kind === 'bale' ? paintBale : paintKegStack)(g, w, h));
    if (b.standable) lip(c, b.x, b.top, b.w);
  }
};
/** A bench by a table (scenery: dimmed): its plank seat, lit along its top, its legs. */
export const bench = (c: Ctx, x: number, w: number) => {
  const W = ramp6(dimmed('#78350F'));
  box(c, x - 1, GY - 25, w + 2, 8, INK); box(c, x, GY - 24, w, 6, W[3]); box(c, x, GY - 24, w, 1, W[4]); box(c, x, GY - 19, w, 1, W[1]);
  for (const lx of [x + 2, x + w - 6]) { box(c, lx - 1, GY - 18, 6, 18, INK); box(c, lx, GY - 18, 4, 18, W[2]); }
};
/** Steins stood on a table's top (at its back: a little set back), full, foam on top. */
export const tableSteins = (c: Ctx, v: View, a: number, b: number, y: number) => {
  atDepth(c, v.eye, 0.965, () => still(c, `de-steins-${b - a}`, a, y, -2, -18, b - a + 4, 20, g => {
    for (let x = 18, k = 0; x < b - a - 14; x += 34 + (k % 2) * 10, k++) {
      box(g, x - 1, -15, 10, 15, INK); box(g, x, -14, 8, 14, hour('#F59E0B')); box(g, x, -14, 2, 14, hour('#FCD34D')); box(g, x, -14, 8, 3, '#FFFFFF'); box(g, x + 8, -11, 3, 7, INK);
      if (k % 3 === 1) { box(g, x + 14, -3, 10, 3, INK); box(g, x + 15, -3, 8, 2, hour('#D97706')); }
    }
  }));
};
/** The bandstand's posts (turned, white), its roof in lozenge shingles with a scalloped valance (the ledge drawn by the
 *  caller). */
export const bandstandRoof = (c: Ctx, a: number, b: number, roofY: number, standY: number) => {
  const Wt = ramp6(hour('#F5F5F4'));
  for (const px0 of [a + 9, b - 9]) {
    post(c, px0, roofY, standY, 6, Wt);
    for (let y = roofY + 20; y < standY - 10; y += 34) { box(c, px0 - 4, y, 9, 3, INK); box(c, px0 - 3, y, 7, 2, Wt[4]); }
  }
  still(c, `de-bandroof-${b - a}`, a, roofY, -24, -2, b - a + 48, 34, g => {
    const B = ramp6(hour('#1E40AF')), W2 = ramp6(hour('#F8FAFC')), w = b - a;
    poly(g, [[-21, 17], [w + 21, 17], [w + 1, -1], [-1, -1]], INK);
    g.save(); g.beginPath(); g.moveTo(-20, 16); g.lineTo(w + 20, 16); g.lineTo(w, 0); g.lineTo(0, 0); g.closePath(); g.clip();
    for (let r = 0; r < 3; r++) for (let k = -2; k * 10 < w + 30; k++) { const cx = k * 10 + (r % 2) * 5 - 10, cy = 3 + r * 6; poly(g, [[cx, cy - 3], [cx + 5, cy], [cx, cy + 3], [cx - 5, cy]], (k + r) % 2 ? B[3] : W2[3]); }
    g.restore();
    for (let k = 0; k * 12 < w + 40; k++) { const x = -20 + k * 12; box(g, x, 16, 12, 6, INK); box(g, x + 1, 16, 10, 5, k % 2 ? W2[3] : B[3]); g.fillStyle = INK; g.beginPath(); g.arc(x + 6, 22, 6, 0, Math.PI); g.fill(); g.fillStyle = k % 2 ? W2[3] : B[3]; g.beginPath(); g.arc(x + 6, 22, 5, 0, Math.PI); g.fill(); }
  });
};
/** A stand's striped valance hung under its top (its stripes, a scalloped hem), on its front. */
export const valance = (c: Ctx, a: number, b: number, y: number, col: string) => {
  const R = ramp6(hour(col)), Wt = ramp6(hour('#F8FAFC'));
  for (let k = 0, x = a - 4; x < b + 4; k++, x += 22) {
    const S = k % 2 ? Wt : R, ww = Math.min(22, b + 4 - x);
    box(c, x, y + 4, ww, 12, INK); box(c, x + 1, y + 4, ww - 1, 11, S[3]); box(c, x + 1, y + 4, ww - 1, 2, S[4]); box(c, x + ww - 3, y + 4, 2, 11, S[2]);
    c.fillStyle = INK; c.beginPath(); c.arc(x + ww / 2, y + 15, ww / 2, 0, Math.PI); c.fill(); c.fillStyle = S[3]; c.beginPath(); c.arc(x + ww / 2, y + 15, ww / 2 - 1, 0, Math.PI); c.fill();
  }
};
/** The giant pretzel on its stick over the pretzel stand: baked brown in steps, a lit crust, salt. */
export const giantPretzel = (c: Ctx, x: number, y: number) => {
  still(c, 'de-pretzel', x, y, -30, -26, 60, 78, g => {
    const P = ramp6(hour('#B45309'));
    box(g, -2, 14, 4, 37, INK); box(g, -1, 14, 2, 37, hour('#78350F'));
    const loop = (w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(-14, 14); g.bezierCurveTo(-30, -6, -10, -26, 0, -4); g.bezierCurveTo(10, -26, 30, -6, 14, 14); g.moveTo(-14, 14); g.lineTo(10, -2); g.moveTo(14, 14); g.lineTo(-10, -2); g.stroke(); };
    loop(10, INK); loop(8, P[2]); loop(4, P[3]);
    g.save(); g.translate(-1, -1); loop(1.5, P[4]); g.restore();
    for (let k = 0; k < 14; k++) box(g, -18 + hash(k * 2.3) * 36, -14 + hash(k * 1.7) * 26, 1, 1, '#FFFFFF');
    g.lineCap = 'butt';
  });
};
/** The giant sausage in its bun on a stick over the wurst stand, a squiggle of mustard. */
export const giantSausage = (c: Ctx, x: number, y: number) => {
  still(c, 'de-sausage', x, y, -34, -18, 68, 70, g => {
    const B = ramp6(hour('#D97706')), S = ramp6(hour('#9A3412'));
    box(g, -2, 8, 4, 43, INK); box(g, -1, 8, 2, 43, hour('#78350F'));
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 2, 26, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = B[3]; g.beginPath(); g.ellipse(0, 2, 25, 8, 0, 0, Math.PI * 2); g.fill(); box(g, -22, 4, 44, 3, B[2]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -3, 31, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.ellipse(0, -3, 30, 6, 0, 0, Math.PI * 2); g.fill(); box(g, -26, -7, 50, 2, S[4]); box(g, -24, -1, 48, 2, S[2]);
    for (let x2 = -22; x2 < 22; x2 += 4) box(g, x2, -5 + ((x2 >> 2) % 2 ? 1 : -1), 3, 1, hour('#FDE047'));
  });
};
/** Pennants (Bavarian blue and white) swagged between two points: triangles, lit on their left, inked. */
export const pennants = (c: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number) => {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 18));
  const pt = (t: number) => [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t)] as const;
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i <= n; i++) { const [x, y] = pt(i / n); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.stroke();
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pt(i / n), [bx, by] = pt((i + 1) / n), R = ramp6(dimmed(i % 2 ? '#F8FAFC' : '#2563EB'));
    poly(c, [[ax + 1, ay], [bx - 1, by], [(ax + bx) / 2, (ay + by) / 2 + 15]], INK);
    poly(c, [[ax + 2, ay + 1], [bx - 2, by + 1], [(ax + bx) / 2, (ay + by) / 2 + 13]], R[3]);
    poly(c, [[ax + 2, ay + 1], [(ax + bx) / 2, (ay + by) / 2 + 1], [(ax + bx) / 2, (ay + by) / 2 + 13]], R[4]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE BREWERY HILL

const paintBrewery = (g: Ctx) => {
  const R = ramp6(dimmed(PLASTER)), T = ramp6(dimmed(TIMBER)), Rf = ramp6(dimmed(TILE)), Br = ramp6(dimmed('#9A3B2A')), w = 700, h = 640;
  box(g, -1, -h - 1, w + 2, h + 1, INK); slab(g, 0, -h, w, h, R, false); stucco(g, 0, -h, w, h, R, 4650);
  for (let x = 0; x <= w; x += 70) beam(g, Math.min(w - 3, Math.max(3, x)), -h, Math.min(w - 3, Math.max(3, x)), 0, 6, T);
  for (const y of [-h + 3, -h + 160, -320, -160]) beam(g, 0, y, w, y, 6, T);
  for (let x = 0, k = 0; x < w; x += 70, k++) if (k % 2) { beam(g, x + 3, -323, x + 67, -h + 163, 4, T); beam(g, x + 3, -h + 163, x + 67, -323, 4, T); }
  for (const wy of [-560, -440, -280]) for (const wx of [80, 300, 520]) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(wx - 3, wy + 72); g.lineTo(wx - 3, wy + 10); g.arc(wx + 30, wy + 10, 33, Math.PI, 0); g.lineTo(wx + 63, wy + 72); g.closePath(); g.fill();
    hole(g, wx, wy + 4, 60, 66, true);
  }
  board(g, 350, -h + 110, ['BREWERY', 'EST. 1996'], LOOKS.germany(1), dimmed('#14532D'), ramp6(dimmed(GOLD)), 5);
  // (the roof: tiles banded, hipped back, the ridge)
  poly(g, [[-22, -h + 2], [350, -h - 162], [722, -h + 2]], INK);
  g.save(); g.beginPath(); g.moveTo(-20, -h); g.lineTo(350, -h - 160); g.lineTo(720, -h); g.closePath(); g.clip();
  shingles(g, -20, -h - 160, 740, 162, Rf, 8, 6, 9);
  g.fillStyle = 'rgba(20, 14, 24, 0.25)'; g.fillRect(350, -h - 160, 370, 162);
  g.restore();
  for (const dx of [180, 520]) { box(g, dx - 1, -h - 92, 42, 46, INK); box(g, dx, -h - 91, 40, 44, R[3]); hole(g, dx + 8, -h - 82, 24, 26, true); poly(g, [[dx - 6, -h - 90], [dx + 20, -h - 112], [dx + 46, -h - 90]], Rf[2]); }
  // (the brick chimney off its right end)
  box(g, 619, -h - 171, 42, 171, INK); for (let y = -h - 170, r = 0; y < -h; y += 8, r++) for (let x = 620 + (r % 2) * 7; x < 660; x += 14) { box(g, x, y, 13, 7, Br[(r + x) % 3 ? 3 : 2]); box(g, x, y, 13, 1, Br[4]); }
  box(g, 614, -h - 178, 52, 9, INK); box(g, 615, -h - 177, 50, 7, Br[2]); box(g, 615, -h - 177, 50, 1, Br[4]);
};
export const drawBrewery = (c: Ctx, v: View, x: number) => facade(c, v, 'de-brewery', x, 700, 640, paintBrewery, 0.93, 190, 30, false);
/** The chimney's smoke (live, at the brewery's depth). */
export const brewerySmoke = (c: Ctx, v: View, x: number, f: number) => {
  for (let k = 0; k < 4; k++) {
    const t = ((f * 0.6 + k * 40) % 160) / 160, [sx, sy] = at(v.eye, x + 640 + t * 30, GY - 820 - t * 120, 0.93), r = 8 + t * 16;
    c.globalAlpha = 0.7 * (1 - t); pixelBlob(c, sx, sy, r, r * 0.7, dimmed('#D6D3D1')); pixelBlob(c, sx - r * 0.2, sy - r * 0.2, r * 0.6, r * 0.4, dimmed('#F5F5F4')); c.globalAlpha = 1;
  }
};

/** The embankment under the ramp, the yard and the stairs (from rx a to the stairs' foot): the retaining wall's cut
 *  stone along under the road, the earth below in bands with grass and stones; the road's cobbles going back; the
 *  ramp's lit lip; the stairs' treads. `rampY(x)`: the road's world y at world x. */
export const drawEmbankment = (c: Ctx, v: View, a: number, rb: number, yb: number, sb: number, top: number, rampY: (x: number) => number, f: number) => {
  void f;
  const E = ramp6(hour('#6B5B45')), S = ramp6(hour(STONE)), C = ramp6(hour('#A8A29E'));
  // (the earth: everything under the road)
  const xa = Math.max(a, v.cam.x - 20), xb = Math.min(sb, v.cam.x + 820);
  if (xb > xa) {
    c.save(); c.beginPath(); c.moveTo(a, GY); c.lineTo(rb, top); c.lineTo(yb, top); c.lineTo(sb, GY); c.lineTo(sb, GY + 400); c.lineTo(a, GY + 400); c.closePath(); c.clip();
    box(c, xa, top, xb - xa, GY + 400 - top, E[2]);
    for (let y = Math.floor((top - GY) / 30) * 30 + GY; y < GY + 400; y += 30) { box(c, xa, y, xb - xa, 2, E[1]); checker(c, xa, y + 2, xb - xa, 2, E[1], 0, 1); }
    for (let x = Math.ceil(xa / 40) * 40; x < xb; x += 40) for (let k = 0; k < 4; k++) { const sy = rampY(Math.min(yb, Math.max(a, x))) + 50 + hash(x * 0.07 + k) * 300; if (sy > GY + 380) continue; const sx = x + hash(x + k * 3) * 30; box(c, sx, sy, 8, 5, E[3]); box(c, sx, sy, 8, 1, E[4]); box(c, sx, sy + 5, 8, 1, E[0]); }
    c.restore();
  }
  // (the retaining wall's band under the road (stamped in pieces along it), grass along its foot)
  for (let x = Math.floor(a / 100) * 100; x < yb; x += 100) {
    if (x + 100 < xa - 40 || x > xb + 40) continue;
    const x0 = Math.max(a, x), x1 = Math.min(yb, x + 100);
    c.save(); c.beginPath(); c.moveTo(x0, rampY(x0)); c.lineTo(x1, rampY(x1)); c.lineTo(x1, rampY(x1) + 40); c.lineTo(x0, rampY(x0) + 40); c.closePath(); c.clip();
    const ty = Math.min(rampY(x0), rampY(x1));
    still(c, `de-retain-${(x0 - a) % 400}`, x0, ty, 0, 0, 100, 100, g => stoneBlocks(g, 0, 0, 100, 100, S, x0 % 400, 25, 12));
    c.restore();
    for (let gx = x0; gx < x1; gx += 4) if (hash(gx * 0.3) > 0.4) { const gy = rampY(gx) + 40; box(c, gx, gy, 2, 3 + hash(gx) * 3, hour('#4D7C0F')); }
  }
  // (the road's cobbles going back, the lit lip along its edge)
  const seg = 40;
  for (let x = a; x < yb; x += seg) {
    const x1 = Math.min(yb, x + seg), y0 = rampY(x), y1 = rampY(x1);
    if (x1 < xa - 40 || x > xb + 40) continue;
    if (v.eye.y < Math.min(y0, y1) - 1) {
      for (let k = 0; k < 3; k++) {
        const d0 = 1 - k * 0.02, d1 = d0 - 0.02;
        poly(c, [at(v.eye, x, y0, d0), at(v.eye, x1, y1, d0), at(v.eye, x1, y1, d1), at(v.eye, x, y0, d1)], C[3 - k]);
      }
      for (let k = 0; k < 4; k++) { const t = (k + 0.5) / 4, cx = x + (x1 - x) * t, cy = y0 + (y1 - y0) * t; for (const d of [0.99, 0.97, 0.95]) { const [p, q] = at(v.eye, cx + (d * 100) % 7, cy, d); box(c, p - 3, q - 1, 6, 2, C[1]); box(c, p - 3, q - 1, 6, 1, C[4]); } }
    }
    c.strokeStyle = C[1]; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y0 + 4); c.lineTo(x1, y1 + 4); c.stroke();
    for (let k = 0; k < 3; k++) { const t = (k + 0.5) / 3; box(c, x + (x1 - x) * t - 6, y0 + (y1 - y0) * t + 2, 12, 4, C[k % 2 ? 2 : 3]); }
  }
  c.strokeStyle = '#F2D79A'; c.lineWidth = 3; c.beginPath(); c.moveTo(a, GY); c.lineTo(rb, top); c.lineTo(yb, top); c.stroke();
  c.strokeStyle = '#FFF6D8'; c.lineWidth = 1; c.beginPath(); c.moveTo(a, GY - 1); c.lineTo(rb, top - 1); c.lineTo(yb, top - 1); c.stroke();
  // (the stairs down the far side: each tread's top going back, its riser in stone, its lit lip)
  const n = 12, tw = (sb - yb) / n;
  for (let k = 0; k < n; k++) {
    // (where the feet go: a descending run's tread at its top end, the engine's treadYAt)
    const x = yb + tw * k, rise = (GY - top) / n, y = top + rise * k;
    if (x + tw < xa - 40 || x > xb + 40) continue;
    if (v.eye.y < y - 1) poly(c, [at(v.eye, x, y, 1), at(v.eye, x + tw, y, 1), at(v.eye, x + tw, y, 0.94), at(v.eye, x, y, 0.94)], C[3]);
    box(c, x - 1, y, tw + 2, rise, INK); box(c, x, y, tw, rise - 1, S[2]); box(c, x, y, 1, rise - 1, S[4]); box(c, x, y + rise - 3, tw, 2, S[1]);
    lip(c, x, y, tw);
  }
};
/** The keg dock at the ramp's top (set back): its plank wall, the hoist beam, its doors (open while a keg teeters). */
export const drawDock = (c: Ctx, v: View, x: number, rampTop: number, open: boolean) => {
  if (!onScreen(v, x - 20, x + 80, 0.97)) return;
  // (kept above the yard's edge: looking up at it, it never comes down over the embankment's face)
  c.save(); c.beginPath(); c.rect(x - 40, rampTop - 220, 140, 220); c.clip();
  atDepth(c, v.eye, 0.97, () => still(c, `de-dock-${open ? 1 : 0}`, x, rampTop, -16, -148, 92, 150, g => {
    const W = ramp6(dimmed('#78350F')), I = ramp6(dimmed('#3F3F46'));
    box(g, -1, -131, 62, 131, INK); planks(g, 0, -130, 60, 130, W, true, 11, 10);
    box(g, -14, -140, 88, 10, INK); box(g, -13, -139, 86, 8, W[3]); box(g, -13, -139, 86, 1, W[5]);
    box(g, 66, -131, 2, 30, I[3]); box(g, 62, -103, 10, 4, I[2]);
    box(g, 7, -101, 46, 101, INK);
    if (open) { box(g, 8, -100, 44, 100, '#140C10'); checker(g, 8, -100, 44, 100, '#22161A', 0, 2); for (const s of [-1, 1]) { const dx = s < 0 ? -2 : 52; box(g, dx, -100, 10, 100, W[2]); box(g, dx, -100, 1, 100, W[4]); } }
    else { planks(g, 8, -100, 44, 100, ramp6(dimmed('#5C3A1A')), true, 5, 11); box(g, 29, -100, 2, 100, INK); for (const y of [-80, -20]) { box(g, 8, y, 44, 4, I[2]); box(g, 8, y, 44, 1, I[4]); } }
  }));
  c.restore();
};
/** The Brauhaus's wall (yard to roof: no way in): plaster and timber, small windows high up, a painted hop vine. */
const paintHaus = (g: Ctx, w: number, h: number) => {
  const R = ramp6(hour(PLASTER)), T = ramp6(hour(TIMBER)), Gv = ramp6(hour('#4D7C0F'));
  box(g, -1, 0, w + 2, h, INK); slab(g, 0, 0, w, h - 1, R, true); stucco(g, 0, 0, w, h, R, 4900);
  for (let x = 0; x <= w; x += 50) beam(g, Math.min(w - 3, Math.max(3, x)), 0, Math.min(w - 3, Math.max(3, x)), h, 6, T);
  beam(g, 0, 200, w, 200, 6, T); beam(g, 0, 4, w, 4, 6, T);
  for (let x = 0; x < w - 40; x += 50) { beam(g, x + 3, 197, x + 47, 7, 4, T); }
  for (const wx of [14, 64, 114]) if (wx + 24 < w) hole(g, wx, 40, 22, 26, true);
  for (let y = 230; y < h - 20; y += 6) { const x = 30 + Math.sin(y * 0.08) * 10; box(g, x, y, 2, 6, Gv[2]); if ((y / 6) % 3 === 0) { box(g, x - 5, y, 5, 3, Gv[3]); box(g, x - 5, y, 2, 1, Gv[4]); } if ((y / 6) % 5 === 0) { box(g, x + 3, y + 2, 4, 5, hour('#A3E635')); box(g, x + 3, y + 2, 2, 1, hour('#D9F99D')); } }
};
/** The bales, the crates, the Brauhaus: their tops and sides going back, then their fronts (the bales' straw, the crates'
 *  planks with BIER stenciled, the Brauhaus's plaster and timber), each lit lip. */
export const breweryBoxes = (c: Ctx, v: View, bales: Box3, crates: Box3, haus: Box3) => {
  const vis = [bales, crates, haus].filter(b => onScreen(v, b.x, b.x + b.w));
  for (const b of vis) box3Back(c, v, b);
  for (const b of vis) {
    const w = Math.round(b.w), h = Math.round(b.bottom - b.top);
    const kind = b === bales ? 'bale' : b === crates ? 'crate' : 'haus';
    still(c, `de-bx-${kind}-${w}x${h}`, b.x, b.top, -2, -1, w + 4, h + 2, g => {
      if (kind === 'bale') paintBale(g, w, h);
      else if (kind === 'haus') paintHaus(g, w, h);
      else {
        const W = ramp6(hour('#78350F'));
        for (let y = 0, k = 0; y < h; y += 30, k++) {
          const ch = Math.min(30, h - y);
          box(g, -1, y, w + 2, ch, INK); planks(g, 0, y + 1, w, ch - 2, W, false, k * 7, 9);
          box(g, 0, y + 1, w, 2, W[4]); box(g, 0, y + ch - 3, w, 2, W[1]); box(g, 0, y + 1, 3, ch - 2, W[4]); box(g, w - 3, y + 1, 3, ch - 2, W[1]);
          if (ch > 20) words(g, 'BIER', w / 2, y + 21, plain(1, 1, hour('#1C1917')));
        }
      }
    });
    lip(c, b.x, b.top, b.w);
  }
};
/** The copper kettle's dome on the Brauhaus roof (set back a touch: behind where he walks), riveted, its chimney. */
export const kettle = (c: Ctx, v: View, x: number, roofY: number) => {
  atDepth(c, v.eye, 0.96, () => still(c, 'de-kettle', x, roofY, -40, -96, 80, 98, g => {
    const K = ramp6(hour('#B45309'));
    g.fillStyle = INK; g.beginPath(); g.arc(0, -4, 36, Math.PI, 0); g.fill();
    g.fillStyle = K[3]; g.beginPath(); g.arc(0, -4, 34, Math.PI, 0); g.fill();
    g.fillStyle = K[4]; g.beginPath(); g.arc(-4, -6, 26, Math.PI, Math.PI * 1.5); g.lineTo(-4, -6); g.fill();
    g.fillStyle = K[2]; g.beginPath(); g.arc(4, -4, 30, Math.PI * 1.6, 0); g.lineTo(4, -4); g.fill();
    box(g, -10, -30, 4, 3, K[5]);
    for (const r of [16, 28]) for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI; box(g, Math.cos(a) * r - 1, -4 + Math.sin(a) * r - 1, 2, 2, K[1]); }
    box(g, -36, -6, 72, 4, INK); box(g, -35, -6, 70, 3, K[2]);
    box(g, -7, -91, 14, 58, INK); box(g, -6, -90, 12, 56, K[2]); box(g, -6, -90, 3, 56, K[4]); box(g, 3, -90, 3, 56, K[1]);
    box(g, -9, -95, 18, 6, INK); box(g, -8, -94, 16, 4, K[3]); box(g, -8, -94, 16, 1, K[5]);
  }));
};
/** The steam out of the kettle's chimney (live). */
export const kettleSteam = (c: Ctx, v: View, x: number, roofY: number, f: number) => {
  for (let k = 0; k < 3; k++) {
    const t = ((f * 0.8 + k * 30) % 90) / 90, [sx, sy] = at(v.eye, x + Math.sin(t * 4 + k) * 4, roofY - 100 - t * 50, 0.96), r = 6 + t * 10;
    c.globalAlpha = 0.75 * (1 - t); pixelBlob(c, sx, sy, r, r * 0.7, hour('#E5E7EB')); c.globalAlpha = 1;
  }
};
/** Hop bines hung under a loft ledge (cones on their strings, stepped greens). */
export const hops = (c: Ctx, a: number, b: number, y: number) => {
  const G = ramp6(hour('#65A30D'));
  for (let x = a + 8, k = 0; x < b - 6; x += 12, k++) {
    const len = 20 + (k % 3) * 6;
    box(c, x + 2, y, 1, len, hour('#3F6212'));
    for (let j = 0; j < 3; j++) { const cy = y + 6 + j * (len / 3); box(c, x - 1, cy - 1, 7, 7, INK); box(c, x, cy, 5, 5, G[3]); box(c, x, cy, 5, 1, G[4]); box(c, x + 1, cy + 2, 3, 1, G[2]); box(c, x, cy, 1, 5, G[4]); }
  }
};
/** A keg bursting on the bales: foam and spray in steps, a shower of droplets. */
export const kegBurst = (c: Ctx, x: number, y: number, bt: number) => {
  const r = bt * 5;
  for (let k = 0; k < 18; k++) {
    const a = -Math.PI * (0.08 + (0.84 * k) / 17), d = r * (0.7 + hash(k * 1.7) * 0.5), px0 = x + Math.cos(a) * d, py0 = y + Math.sin(a) * d + bt * bt * 0.2;
    const s = k % 3 ? 5 : 7;
    box(c, px0 - 1, py0 - 1, s + 2, s, INK); box(c, px0, py0, s, s - 2, k % 3 ? '#FEF3C7' : '#F59E0B'); box(c, px0, py0, s, 1, '#FFFFFF');
  }
  if (bt < 12) { steppedGlow(c, x, y, 26 - bt, '#FFF7D6', 0.5, 0.05, 3); pixelBlob(c, x, y - 4, 22 - bt, 12 - bt * 0.6, '#FFFBEB'); }
};

void mix; void ledge3; void slab; void ball;
