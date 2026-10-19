// The Mother Lode Mine, drawn (the final pass: peak SNES). Outside: the park's fiberglass mountain (molded crags in
// courses, lit up their left, seams bolted down them, a chip to the white gelcoat, pines on its ledges), its ends cut
// away going back to show what it is (the shell's thickness, the steel armature behind it); the headframe over the
// shaft (timber, its sheave wheel), the tour's waiting shed (TOURS: WAIT HERE), the exit's headframe and its yellow
// posts. Inside (real rock: the park dug it): the tunnels opened up toward him: the back wall going back in strata and
// blocks, the floor's gravel going back, the ceiling's underside, timber sets (the cap across, the post at the back,
// lagging between), the shafts' cribbing and ladders, the lanterns on their hooks (soft, warm: murky, never black), the
// side adit the runaways come out of, the firedamp's sickly haze (soot once it's gone up), the flooded shaft's rock and
// its hump, the canaries in their cages.
//
// And the mine's working parts: the rails (on ties, their heads lit), the buffer at the track's foot, the trestle over
// the chasm (timber bents down into the dark), the low beams (solid down to the line they hit at, their foot striped:
// no words), the ore chutes' hoppers, the cracked ceiling over a cave-in; the carts (riveted iron, ore heaped in the
// runaways), the rocks coming down and their rubble, the chute's dump.

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { type Ctx, type TownView, box, checker, mix, hash, at, poly, still, stillAt, atDepth, seen, sideBack, topBack, underBack, INK, timeOfDay, farTint, hr, hr7, back7, fiberglass, ball, puff, FIBER, FIBER_LIP, MINE, TIMBER, STEEL, IRON, BRASS, ORE, COAL, NEEDLE, PLY, TOPLIP, MINE_BK, signPaint, western, viewIn, PIX, pixelBlob, DIRT, STONE, BARK } from './paint';
import { signText } from '../../signLetters';
import { townOf } from './state';
import { LANTERNS, CANARIES, GAS, CART_RUN, RIDE, BEAMS, BEAM_GAP, CHUTES, CAVEINS, CHASM, SHAFTS, FY, CEIL_Y, X, Y, mineDepthOf } from './layout';
import { onScreen } from './view';
import { BAND } from './ground';
import { BEND } from '../../intro/art/kit';

/** The tunnels' back wall (going back from the cut at the play plane). */
const BK = MINE_BK;

/** The opening a mine ledge (a..b, x from the section's start) is cut into: its shaft, or the tunnel (a world box: x0,
 *  y0, x1, y1). What's drawn of a ledge going back stays inside it. */
export const mineCut = (a: number, b: number): [number, number, number, number] => {
  for (const [sa, sb] of SHAFTS) if (a >= sa && b <= sb) return [X(sa), GY - 2, X(sb), FY];
  return [X(11600), CEIL_Y, X(13080), FY];
};

// ---------------------------------------------------------------------------------------------------------------
// Outside: the fiberglass mountain, the headframes, the shed

const MA = 11600, MB = 14420;
/** The mountain's outline (world), left foot to right foot. */
const crag = (): [number, number][] => {
  const a = X(MA), b = X(MB), t = Y(420);
  return [[a - 20, GY], [a - 20, t + 60], [a + 60, t + 30], [a + 140, t - 10], [a + 300, t], [a + 420, t - 50], [a + 560, t - 46], [a + 700, t - 96], [a + 860, t - 110], [a + 1000, t - 80], [a + 1180, t - 120], [a + 1360, t - 60], [a + 1520, t - 30], [a + 1700, t - 70], [a + 1900, t + 10], [a + 2100, t - 20], [a + 2300, t + 40], [a + 2500, t + 30], [a + 2700, t + 70], [b + 20, t + 90], [b + 20, GY]];
};

const drawMountain = (c: Ctx, v: TownView) => {
  const tod = timeOfDay(), F = FIBER.map(col => farTint(col, 0.2, tod)), eye = v.eye;
  const a = X(MA), b = X(MB);
  // (its ends going back, cut away: the shell's thickness, the steel armature behind it, struts down to footings;
  // never below the ground line: from down in the mine they used to swing down through the rock and the shafts)
  const S = hr('steel', STEEL), P = hr('ply', PLY);
  c.save(); c.beginPath(); c.rect(v.v0 - 400, v.top - 400, v.v1 - v.v0 + 800, GY - v.top + 400); c.clip();
  for (const [e, side, top] of [[a - 20, -1, Y(420) + 60], [b + 20, 1, Y(420) + 90]] as const) {
    if ((eye.x - e) * side <= 1) continue;
    const d1 = 0.84;
    poly(c, [at(eye, e, top, 1), at(eye, e, top + 20, d1), at(eye, e, GY, d1), at(eye, e, GY, 1)], mix(S[1], INK, 0.3));
    for (let k = 1; k < 5; k++) { const d = 1 - (1 - d1) * (k / 5), [x0, y0] = at(eye, e, top + 6, d), [, y1] = at(eye, e, GY, d); box(c, x0 - 1, y0, 3, y1 - y0, S[3]); box(c, x0 - 1, y0, 1, y1 - y0, S[5]); }
    for (let y = top + 20; y < GY; y += 40) { const [x0, yy0] = at(eye, e, y, 1), [x1, yy1] = at(eye, e, y + 30, d1); c.strokeStyle = S[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, yy0); c.lineTo(x1, yy1); c.stroke(); }
    // (the shell's cut edge: the fiberglass a few px thick, white gelcoat inside)
    const [x0, t0] = at(eye, e, top, 1), [, b0] = at(eye, e, GY, 1);
    box(c, x0 - (side > 0 ? 0 : 4), t0, 4, b0 - t0, '#E8E2D2'); box(c, x0 - (side > 0 ? 0 : 4) + (side > 0 ? 3 : 0), t0, 1, b0 - t0, F[1]);
    const [fx, fy] = at(eye, e, GY, 0.92); box(c, fx - 10, fy - 6, 20, 6, P[2]);
  }
  c.restore();
  // (the face: stamped in chunks, clipped to the outline)
  const pts = crag();
  for (let x = a - 20, i = 0; x < b + 20; x += 400, i++) {
    const w = Math.min(400, b + 20 - x);
    if (x + w < v.v0 || x > v.v1) continue;
    still(c, `mtn-${i}`, 0, 0, x - 2, Y(560), w + 4, GY - Y(560) + 2, g => {
      g.save(); g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.clip();
      fiberglass(g, x, Y(560), w, GY - Y(560), F, i * 13 + 5);
      // (the light down the left of each crag, the shade down its right)
      for (let k = 1; k < pts.length - 2; k++) {
        const [px, py] = pts[k], [nx, ny] = pts[k + 1];
        if (px + 200 < x || px > x + w + 200) continue;
        if (ny > py) { g.fillStyle = F[2]; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.lineTo(nx, GY); g.lineTo(px + (nx - px) * 0.6, GY); g.closePath(); g.fill(); checker(g, px, py, (nx - px) * 0.5, GY - py, F[3], k % 2); }
        else { g.fillStyle = F[4]; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.lineTo(nx - (nx - px) * 0.3, ny + 60); g.lineTo(px, py + 40); g.closePath(); g.fill(); }
      }
      // (darker toward the foot)
      for (let k = 0; k < 4; k++) { g.globalAlpha = 0.12 + k * 0.06; box(g, x, GY - 120 + k * 30, w, 30, INK); }
      g.globalAlpha = 1;
      g.restore();
      // (its ridge inked, its lip worn pale)
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); pts.slice(1, -1).forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
      const L = FIBER_LIP.map(col => farTint(col, 0.2, tod));
      for (let k = 1; k < pts.length - 2; k++) { const [px, py] = pts[k], [nx, ny] = pts[k + 1]; g.strokeStyle = L[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py + 2); g.lineTo(nx, ny + 2); g.stroke(); }
    });
  }
  // (pines on its ledges)
  const N = NEEDLE.map(col => farTint(col, 0.2, tod));
  for (const [rx, h] of [[11760, 50], [12100, 44], [12520, 60], [13020, 48], [13400, 56], [13900, 46]] as const) {
    const x = X(rx), py = Y(420) - 30 - ((rx * 7) % 50);
    if (!seen(v, x - 30, x + 30)) continue;
    for (let t = 0; t < 4; t++) { const y0 = py - h + t * h * 0.24, half = 4 + t * 6; c.fillStyle = INK; c.beginPath(); c.moveTo(x, y0 - 1); c.lineTo(x + half + 1, y0 + h * 0.34 + 1); c.lineTo(x - half - 1, y0 + h * 0.34 + 1); c.closePath(); c.fill(); c.fillStyle = N[2]; c.beginPath(); c.moveTo(x, y0); c.lineTo(x + half, y0 + h * 0.34); c.lineTo(x - half, y0 + h * 0.34); c.closePath(); c.fill(); c.fillStyle = N[4]; c.beginPath(); c.moveTo(x, y0); c.lineTo(x - half, y0 + h * 0.34); c.lineTo(x - half * 0.3, y0 + h * 0.34); c.closePath(); c.fill(); }
    box(c, x - 2, py - 4, 4, 6, hr('timber', TIMBER)[3]);
  }
};

/** A timber headframe over a shaft (two posts, the braces, the sheave wheel up top), its name board. */
const headframe = (c: Ctx, ha: number, hb: number, words: string) => {
  still(c, `head-${words}`, ha, GY, -14, -360, hb - ha + 28, 362, g => {
    const T = hr('timber', TIMBER), S = hr('steel', STEEL), w = hb - ha;
    for (const px of [0, w]) { box(g, px - 7, -262, 14, 262, INK); box(g, px - 6, -262, 12, 262, T[3]); box(g, px - 6, -262, 3, 262, T[5]); box(g, px + 3, -262, 3, 262, T[1]); }
    for (const [x0, y0, x1, y1] of [[0, -262, w / 2, -332], [w, -262, w / 2, -332], [0, -140, w, -262], [w, -140, 0, -262]]) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = T[3]; g.lineWidth = 5; g.stroke(); g.strokeStyle = T[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - 2); g.lineTo(x1, y1 - 2); g.stroke(); }
    box(g, -10, -268, w + 20, 10, INK); box(g, -9, -267, w + 18, 8, T[3]); box(g, -9, -267, w + 18, 2, T[5]);
    // (the sheave wheel, spoked, its cable down the shaft)
    const cx = w / 2, cy = -322;
    g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 24, 0, Math.PI * 2); g.fill();
    g.strokeStyle = S[4]; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, 19, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = S[2]; g.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); g.stroke(); }
    box(g, cx - 3, cy - 3, 6, 6, BRASS[3]);
    box(g, cx + 18, cy, 2, 280, S[2]);
    // (the board, burned)
    const bw = Math.min(w - 20, 260);
    box(g, cx - bw / 2 - 1, -246, bw + 2, 34, INK); box(g, cx - bw / 2, -245, bw, 32, hr('plank', ['#2A1608', '#44260E', '#603818', '#7E4E24', '#9C6834', '#BA8448', '#D8A464'])[5]);
    signText(g, words, cx, -222, western(2, '#3A1E0C', '#E8C890'));
  });
};

const drawOutside = (c: Ctx, state: GameState, v: TownView) => {
  if (seen(v, X(11140), X(11620), 1, 120)) {
    headframe(c, X(11300), X(11600), 'MOTHER LODE MINE');
    // (the tour's waiting shed: a little false front, its bench, the sign)
    still(c, 'tourshed', X(11140), GY, -10, -170, 170, 172, g => {
      const W = hr7('#6A5A3A'), T = hr7('#E8D8B0');
      box(g, -1, -131, 152, 131, INK); box(g, 0, -130, 150, 130, W[3]);
      for (let x = 0; x < 150; x += 14) { box(g, x, -130, 2, 130, W[4]); box(g, x + 12, -130, 2, 130, W[1]); }
      box(g, 14, -160, 122, 32, INK); box(g, 15, -159, 120, 30, W[3]); box(g, 15, -159, 120, 2, W[5]);
      box(g, 20, -112, 110, 26, INK); box(g, 21, -111, 108, 24, '#1C1917'); box(g, 21, -111, 108, 2, '#3A3532');
      signText(g, 'TOURS: WAIT HERE', 75, -95, signPaint(1, '#FDE047', '#3A2A0A'));
      box(g, 12, -50, 126, 8, INK); box(g, 13, -49, 124, 6, T[2]); box(g, 13, -49, 124, 1, T[4]); box(g, 18, -42, 6, 42, T[1]); box(g, 126, -42, 6, 42, T[1]);
      box(g, 40, -78, 20, 24, '#E8DCB0'); box(g, 42, -74, 16, 1, '#5A4A3A'); box(g, 42, -70, 12, 1, '#5A4A3A');
    });
  }
  if (seen(v, X(14400), X(14710), 1, 120)) {
    headframe(c, X(14420), X(14690), 'MINE EXIT');
    for (const px of [X(14412), X(14698)]) { box(c, px - 5, GY - 51, 10, 51, INK); box(c, px - 4, GY - 50, 8, 50, '#F2C82A'); box(c, px - 4, GY - 50, 2, 50, '#FFF08A'); box(c, px - 4, GY - 32, 8, 8, '#1C1917'); box(c, px - 4, GY - 16, 8, 8, '#1C1917'); }
  }
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// Inside: the rock, the tunnels opened up, timber, lanterns, the gas

/** The rock mass at the play plane (stamped in chunks: strata, blocks, veins of the park's fake gold, real quartz). */
const paintRock = (g: Ctx, x0: number, w: number, y0: number, h: number) => {
  const tod = timeOfDay(), R = MINE.map(col => farTint(col, 0.1, tod)), s = Math.floor(x0);
  box(g, x0, y0, w, h, R[2]);
  for (let y = y0 + 6, row = 0; y < y0 + h; y += 18 + (row % 3) * 6, row++) {
    for (let x = x0 - 30 + hash(s + row) * 40; x < x0 + w; x += 40 + hash(s + row * 3 + x) * 40) {
      const bw = 30 + hash(x + row) * 40, bh = 12 + hash(x * 1.3 + row) * 10;
      box(g, x, y, bw, bh, R[(row + Math.floor(x / 40)) % 2 ? 3 : 2]); box(g, x, y, bw, 1, R[4]); box(g, x, y + bh, bw, 1, R[0]); box(g, x + bw - 1, y, 1, bh, R[1]);
    }
  }
  for (let i = 0; i < w / 160; i++) { const vx = x0 + hash(s + i * 3.3) * w, vy = y0 + hash(s + i * 5.1) * h; g.strokeStyle = hash(i + s) > 0.5 ? mix(R[5], '#C8A040', 0.4) : mix(R[5], '#E8E8F0', 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(vx, vy); g.lineTo(vx + 20, vy + 8); g.lineTo(vx + 34, vy + 4); g.stroke(); }
};

/** A tunnel cut through the rock (a..b, y0..y1 at the play plane): its back wall going back, its floor's gravel, its
 *  ceiling's underside, timber sets along it. `sets` puts the sets in. */
const tunnel = (c: Ctx, v: TownView, a: number, b: number, y0: number, y1: number, sets: boolean) => {
  const eye = v.eye, R = hr('mine', MINE, 0.1), T = hr('timber', TIMBER, 0.1);
  const xa = Math.max(a, v.v0 - 100), xb = Math.min(b, v.v1 + 100);
  if (xb <= xa) return;
  // (the back wall, back at BK: banded darker down, strata across, the odd boulder bedded in it)
  const [ba, bt] = at(eye, xa, y0, BK), [bb, bbt] = at(eye, xb, y1, BK);
  c.save(); c.beginPath(); c.rect(xa, y0, xb - xa, y1 - y0); c.clip();
  box(c, xa, y0, xb - xa, y1 - y0, R[2]);
  // (a step lighter than the rock's face: murky, never black, under the mine's dark)
  const steps = [R[3], R[3], R[4], R[3], R[2]];
  for (let i = 0; i < steps.length; i++) box(c, ba, bt + ((bbt - bt) * i) / steps.length, bb - ba, (bbt - bt) / steps.length + 1, steps[i]);
  for (let y = y0 + 20; y < y1; y += 26) { const [p0, py] = at(eye, xa, y, BK), [p1] = at(eye, xb, y, BK); box(c, p0, py, p1 - p0, 1, R[0]); box(c, p0, py + 1, p1 - p0, 1, R[4]); }
  for (let x = Math.floor(xa / 90) * 90; x < xb; x += 90) { const bx = x + hash(x) * 50, by = y0 + 20 + hash(x * 1.7) * (y1 - y0 - 40); const [px, py] = at(eye, bx, by, BK); c.fillStyle = R[3]; c.beginPath(); c.ellipse(px, py, 14, 8, 0, 0, Math.PI * 2); c.fill(); box(c, px - 8, py - 6, 10, 2, R[5]); }
  // (the ceiling's underside going back, the floor going back)
  underBack(c, eye, xa, xb, y0, 1, BK, [R[0], R[1], R[1]], 3);
  if (eye.y < y1 - 1) for (let i = 0; i < 4; i++) { const d0 = 1 - ((1 - BK) * i) / 4, d1 = 1 - ((1 - BK) * (i + 1)) / 4; poly(c, [at(eye, xa, y1, d0), at(eye, xb, y1, d0), at(eye, xb, y1, d1), at(eye, xa, y1, d1)], [R[4], R[3], R[3], R[2]][i]); }
  if (eye.y < y1 - 1) for (let x = Math.floor(xa / 12) * 12; x < xb; x += 12) { const d = 1 - (1 - BK) * hash(x * 0.7), [px, py] = at(eye, x + hash(x) * 8, y1, d); box(c, px, py, 2, 1, hash(x * 3.1) > 0.5 ? R[5] : R[1]); }
  // (timber sets: the post at the back, the cap across the ceiling going back to it, lagging boards between)
  if (sets) for (let x = Math.ceil((xa - 20) / 160) * 160 + 50; x < xb + 20; x += 160) {
    const [px, pt] = at(eye, x, y0, BK + 0.01), [, pb] = at(eye, x, y1, BK + 0.01);
    box(c, px - 6, pt, 12, pb - pt, INK); box(c, px - 5, pt, 10, pb - pt, T[3]); box(c, px - 5, pt, 3, pb - pt, T[5]); box(c, px + 2, pt, 3, pb - pt, T[1]);
    poly(c, [at(eye, x - 12, y0, 1), at(eye, x + 12, y0, 1), at(eye, x + 12, y0 + 10, BK), at(eye, x - 12, y0 + 10, BK)], T[2]);
    box(c, x - 13, y0, 26, 12, INK); box(c, x - 12, y0, 24, 11, T[3]); box(c, x - 12, y0 + 9, 24, 2, T[1]);
    for (let k = 0; k < 3; k++) { const [lx, ly] = at(eye, x + 20 + k * 40, y0, BK + 0.02); box(c, lx, ly, 36, 4, T[2]); box(c, lx, ly + 4, 36, 1, T[0]); }
  }
  c.restore();
};

/** A shaft (a..b, from the ground down to y1): its cribbing on the back wall, a ladder, the cable. Seen from above (from
 *  the street), its mouth too: a hole in the ground going back to its back wall (the ground carries on behind it,
 *  ground.ts), its sides going down dark, the back wall's top showing through it. */
const shaft = (c: Ctx, v: TownView, a: number, b: number, y0: number, y1: number) => {
  const eye = v.eye, R = hr('mine', MINE, 0.1), T = hr('timber', TIMBER, 0.1), S = hr('steel', STEEL, 0.1);
  const mouth = eye.y < GY - 2, [ma, mt] = at(eye, a, GY, BK), [mb] = at(eye, b, GY, BK);
  c.save(); c.beginPath(); c.rect(a, y0, b - a, y1 - y0);
  if (mouth) { c.moveTo(a, GY); c.lineTo(ma, mt); c.lineTo(mb, mt); c.lineTo(b, GY); c.closePath(); }
  c.clip();
  const fx0 = Math.min(a, ma) - 2, ft = mouth ? Math.min(y0, mt) - 2 : y0;
  box(c, fx0, ft, Math.max(b, mb) + 2 - fx0, y1 - ft, R[1]);
  const [ba, bt] = at(eye, a, mouth ? GY : y0, BK), [bb, bbt] = at(eye, b, y1, BK);
  bandedGradient4(c, ba, bt, bb - ba, bbt - bt, [R[2], R[2], R[1], R[1]]);
  // (the cribbing: squared timbers laid round, their ends showing)
  for (let y = y0 + 10; y < y1; y += 44) { const [p0, py] = at(eye, a, y, BK), [p1] = at(eye, b, y, BK); box(c, p0, py, p1 - p0, 10, T[2]); box(c, p0, py, p1 - p0, 2, T[4]); box(c, p0, py + 10, p1 - p0, 2, T[0]); }
  for (const x of [a + 20, b - 20]) { const [px, pt] = at(eye, x, y0, BK), [, pb] = at(eye, x, y1, BK); box(c, px - 5, pt, 10, pb - pt, T[3]); box(c, px - 5, pt, 2, pb - pt, T[5]); }
  // (a ladder down the back, the cable)
  const lx = (a + b) / 2, [l0, lt] = at(eye, lx - 14, y0, BK + 0.02), [l1, lb] = at(eye, lx + 14, y1, BK + 0.02);
  box(c, l0, lt, 3, lb - lt, T[4]); box(c, l1, lt, 3, lb - lt, T[4]);
  for (let y = lt + 8; y < lb; y += 14) box(c, l0, y, l1 - l0 + 3, 2, T[5]);
  const [cx, ct] = at(eye, lx + 30, y0, BK + 0.05), [, cb] = at(eye, lx + 30, y1 - 200, BK + 0.05); box(c, cx, ct, 2, cb - ct, S[2]);
  c.restore();
  // (the mouth's far edge, inked; its walls' lips at the ground line)
  if (mouth) box(c, ma, mt - 1, mb - ma, 1, INK);
  box(c, a - 2, GY - 2, 4, y1 - GY, INK); box(c, b - 2, GY - 2, 4, y1 - GY, INK);
};
const bandedGradient4 = (c: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => { for (let i = 0; i < cols.length; i++) box(c, x, y + (h * i) / cols.length, w, h / cols.length + 1, cols[i]); };

/** A lantern on its hook (world), its flame's flicker. */
const lantern = (c: Ctx, x: number, y: number, f: number) => {
  const B = BRASS;
  box(c, x - 1, y - 18, 2, 10, INK);
  box(c, x - 6, y - 10, 12, 3, INK); box(c, x - 5, y - 9, 10, 1, B[4]);
  box(c, x - 6, y - 7, 12, 13, INK); box(c, x - 5, y - 6, 10, 11, mix('#F2D27A', '#FFF4C8', f % 30 < 2 ? 0.6 : 0)); box(c, x - 5, y - 6, 3, 11, '#FFF8E0');
  box(c, x - 1, y - 4 + (f % 12 < 6 ? 0 : 1), 2, 5, '#F97316');
  box(c, x - 6, y - 7, 1, 13, B[2]); box(c, x + 5, y - 7, 1, 13, B[2]);
  box(c, x - 7, y + 5, 14, 4, INK); box(c, x - 6, y + 6, 12, 2, B[3]);
};

export const drawMineBack = (c: Ctx, state: GameState, v: TownView) => {
  const f = state.frame, tw = townOf(state);
  drawMountain(c, v);
  // ---- the rock under the ground line (stamped in chunks), the tunnels and shafts cut in it (the headframes after:
  //      they stand in front of the shafts' mouths)
  const ra = X(11300), rb = X(14690), tod = timeOfDay();
  for (let x = ra, i = 0; x < rb; x += 512, i++) {
    const w = Math.min(512, rb - x);
    if (x + w < v.v0 || x > v.v1) continue;
    for (let y = GY + 4, j = 0; y < Y(-920); y += 512, j++) {
      const h = Math.min(512, Y(-920) - y);
      if (y + h < v.top || y > v.bot) continue;
      still(c, `rock-${i}-${j}`, 0, 0, x, y, w, h, g => paintRock(g, x, w, y, h));
    }
  }
  void tod;
  if (seen(v, X(11300), X(11600), 1, 100)) shaft(c, v, X(11300), X(11600), GY - 2, FY);
  if (seen(v, X(14420), X(14690), 1, 100)) shaft(c, v, X(14420), X(14690), GY - 2, FY);
  tunnel(c, v, X(11600), X(13080), CEIL_Y, FY, true);
  tunnel(c, v, X(13000), X(14420), CEIL_Y, FY + 300, false);
  drawOutside(c, state, v);
  // (the flooded shaft: its cut down to the bed, dark)
  if (seen(v, X(13000), X(14420))) { const R = hr('mine', MINE, 0.1), xa = Math.max(X(13000), v.v0 - 60), xb = Math.min(X(14420), v.v1 + 60); box(c, xa, FY, xb - xa, Y(-880) - FY, R[1]); }
  // (the side adit at the top of the cart track: where the runaways come from, timbered)
  if (seen(v, CART_RUN.b, CART_RUN.b + 80)) {
    const T = hr('timber', TIMBER, 0.1), x = CART_RUN.b + 10;
    box(c, x, FY - 90, 60, 90, '#0A0604'); bandedGradient4(c, x + 4, FY - 86, 52, 86, ['#140C08', '#0E0806', '#0A0604', '#060403']);
    box(c, x - 6, FY - 96, 72, 10, INK); box(c, x - 5, FY - 95, 70, 8, T[3]); box(c, x - 5, FY - 95, 70, 2, T[5]);
    for (const px of [x - 4, x + 56]) { box(c, px - 1, FY - 88, 10, 88, INK); box(c, px, FY - 88, 8, 88, T[3]); box(c, px, FY - 88, 2, 88, T[5]); }
  }
  // ---- the lanterns on their hooks
  for (const [lx, lh] of LANTERNS) { const x = X(lx), y = Y(lh); if (onScreen(state, x - 20, x + 20)) lantern(c, x, y, f + lx); }
  // ---- the gas: a sickly haze in the pocket, while it's there; soot once it's gone up
  if (tw.gasGone === 0) {
    for (let k = 0; k < 9; k++) {
      const gx = GAS.a + 20 + k * ((GAS.b - GAS.a - 40) / 8), gy = FY - 70 + Math.sin(f * 0.02 + k * 2) * 20;
      c.globalAlpha = 0.12 + 0.04 * Math.sin(f * 0.03 + k);
      for (const [r, col] of [[1, '#6A8A1E'], [0.72, '#A3C635'], [0.42, '#D4EC7A']] as const) { c.fillStyle = col; c.beginPath(); c.ellipse(gx - (1 - r) * 8, gy - (1 - r) * 10, 40 * r, 60 * r, 0, 0, Math.PI * 2); c.fill(); }
    }
    c.globalAlpha = 1;
  } else if (tw.gasGone > 360) { c.globalAlpha = 0.3; box(c, GAS.a, CEIL_Y, GAS.b - GAS.a, FY - CEIL_Y, '#1C1917'); c.globalAlpha = 1; }
};

/** The rock down into the flooded shaft's water, and the hump under it (swim under them): after the water's body. */
export const drawMineRock = (c: Ctx, state: GameState, v: TownView) => {
  if (!onScreen(state, X(13100), X(14320))) return;
  const rock = (a: number, b: number, t: number, bt: number, key: string) => {
    still(c, `sumprock-${key}`, 0, 0, X(a) - 2, t - 2, X(b) - X(a) + 4, bt - t + 6, g => {
      paintRock(g, X(a), X(b) - X(a), t, bt - t);
      const R = MINE;
      box(g, X(a) - 1, t, 2, bt - t, INK); box(g, X(b) - 1, t, 2, bt - t, INK);
      box(g, X(a), bt - 4, X(b) - X(a), 4, mix(R[1], '#0A1A20', 0.5)); box(g, X(a), bt - 1, X(b) - X(a), 2, INK);
      for (let x = X(a) + 6; x < X(b); x += 14) box(g, x, bt + 1, 2, 2 + hash(x) * 5, mix(R[2], '#1E3A40', 0.5));
    });
  };
  rock(13120, 14300, CEIL_Y, Y(-560), 'roof');
  rock(13520, 13860, Y(-560) - 1, Y(-740), 'hump');
  void v;
};

/** The canaries in their cages, hung from the ceiling (the dead one feet up). */
export const drawCanaries = (c: Ctx, state: GameState) => {
  const f = state.frame, tw = townOf(state);
  for (const [rx, alive] of CANARIES) {
    const x = X(rx), y = CEIL_Y + 50;
    if (!onScreen(state, x - 30, x + 30)) continue;
    const live = alive && tw.gasGone >= 0, B = BRASS;
    box(c, x - 1, CEIL_Y, 2, y - CEIL_Y - 24, INK);
    c.fillStyle = INK; c.beginPath(); c.arc(x, y - 26, 4, 0, Math.PI * 2); c.fill(); c.strokeStyle = B[4]; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y - 26, 3, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(x, y - 12, 12, Math.PI, 0); c.stroke();
    c.strokeStyle = B[3]; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y - 12, 12, Math.PI, 0); c.stroke();
    for (let k = -10; k <= 10; k += 5) { c.strokeStyle = k < 0 ? B[4] : B[2]; c.beginPath(); c.moveTo(x + k, y - 12 - Math.sqrt(Math.max(0, 144 - k * k)) + 2); c.lineTo(x + k, y + 6); c.stroke(); }
    box(c, x - 14, y + 5, 28, 5, INK); box(c, x - 13, y + 6, 26, 3, B[3]); box(c, x - 13, y + 6, 26, 1, B[5]);
    box(c, x - 8, y - 2, 16, 2, B[2]);
    if (live) {
      const hop = f % 40 < 6 ? -2 : 0;
      box(c, x - 6, y - 5 + hop, 11, 8, INK); box(c, x - 5, y - 4 + hop, 9, 6, '#F2D02A'); box(c, x - 5, y - 4 + hop, 4, 2, '#FFF08A'); box(c, x + 1, y - 2 + hop, 3, 3, '#C8A010');
      box(c, x + 3, y - 3 + hop, 3, 2, '#F97316'); box(c, x + 1, y - 4 + hop, 1, 1, INK); box(c, x - 7, y - 1 + hop, 3, 2, '#C8A010');
      // (its song: notes going up)
      if (f % 90 < 30) { const ny = y - 22 - (f % 90) / 3; box(c, x + 10, ny, 3, 3, '#FDE047'); box(c, x + 12, ny - 5, 1, 5, '#FDE047'); box(c, x + 12, ny - 5, 3, 1, '#FDE047'); }
    } else {
      // (feet up on the cage floor, X eyes)
      box(c, x - 6, y, 11, 6, INK); box(c, x - 5, y + 1, 9, 4, '#D8B820');
      box(c, x - 2, y - 3, 1, 3, '#F97316'); box(c, x + 1, y - 3, 1, 3, '#F97316');
      box(c, x + 2, y + 2, 1, 1, INK); box(c, x + 3, y + 3, 1, 1, INK); box(c, x + 3, y + 2, 1, 1, INK); box(c, x + 2, y + 3, 1, 1, INK);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The working parts

/** The rails (on ties going back a little, their heads lit), the buffer, the trestle over the chasm, the low beams,
 *  the chutes' hoppers, the cracked ceiling over the cave-ins. */
export const drawMineBitsArt = (c: Ctx, state: GameState) => {
  const S = hr('steel', STEEL, 0.1), T = hr('timber', TIMBER, 0.1), eye = { x: state.camera.x + 400, y: state.camera.y + 252 };
  if (onScreen(state, CART_RUN.a - 40, RIDE.b + RIDE.w + 40)) {
    const a = CART_RUN.a - 30, b = RIDE.b + RIDE.w + 40;
    // (the chasm under the trestle: black all the way down, mist in it)
    const ca = CHASM.a, cb = CHASM.b;
    box(c, ca, FY, cb - ca, 1200, '#050302');
    bandedGradient4(c, ca, FY, cb - ca, 160, ['#1A1410', '#120E0A', '#0A0806', '#050302']);
    // (the trestle's bents: timbers down into the dark, X-braced, their bolts)
    for (let x = ca; x <= cb; x += 56) {
      box(c, x - 1, FY, 10, 300, INK); box(c, x, FY, 8, 300, T[3]); box(c, x, FY, 2, 300, T[5]);
      if (x + 56 <= cb) for (const [y0, y1] of [[FY + 10, FY + 120], [FY + 130, FY + 240]] as const) { c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 4, y0); c.lineTo(x + 60, y1); c.moveTo(x + 60, y0); c.lineTo(x + 4, y1); c.stroke(); c.strokeStyle = T[2]; c.lineWidth = 4; c.stroke(); }
    }
    c.globalAlpha = 0.18; for (let k = 0; k < 3; k++) box(c, ca, FY + 140 + k * 70, cb - ca, 30, '#8A8A90'); c.globalAlpha = 1;
    box(c, ca, FY - 2, cb - ca, 9, INK); box(c, ca, FY - 1, cb - ca, 7, T[3]); box(c, ca, FY - 1, cb - ca, 1, T[5]);
    // (the ties going back a little, the rails)
    for (let x = Math.ceil(a / 22) * 22; x < b; x += 22) {
      poly(c, [at(eye, x, FY, 1), at(eye, x + 12, FY, 1), at(eye, x + 12, FY, 0.95), at(eye, x, FY, 0.95)], T[2]);
      box(c, x, FY - 2, 12, 3, T[3]); box(c, x, FY - 2, 12, 1, T[5]);
    }
    for (const d of [0.96, 0.99]) { const [ra, ry] = at(eye, a, FY, d), [rb] = at(eye, b, FY, d); box(c, ra, ry - 4, rb - ra, 4, S[2]); box(c, ra, ry - 4, rb - ra, 1, S[6]); box(c, ra, ry - 3, rb - ra, 1, S[4]); box(c, ra, ry, rb - ra, 1, INK); }
    // (the buffer at the track's foot: a timber block, striped)
    const bx = CART_RUN.a - 34;
    box(c, bx - 1, FY - 31, 18, 31, INK); box(c, bx, FY - 30, 16, 30, T[3]); box(c, bx, FY - 30, 4, 30, T[5]);
    for (let k = 0; k < 3; k++) box(c, bx, FY - 26 + k * 9, 16, 4, k % 2 ? '#F2F0EA' : '#C81E1E');
  }
  for (const [bx, half] of BEAMS) {
    const x = X(bx);
    if (!onScreen(state, x - 30, x + 30)) continue;
    // (a beam: a timber down from the ceiling to the gap, full across: no standing under it; it comes down solid to the
    // line it hits at (BEAM_GAP over the cart's floor), its foot hazard-striped; no words (the user's: the player can
    // tell))
    const bottom = FY - 34 - BEAM_GAP;
    box(c, x - half - 2, CEIL_Y, half * 2 + 4, bottom - CEIL_Y, INK); box(c, x - half, CEIL_Y, half * 2, bottom - CEIL_Y - 2, T[3]); box(c, x - half, CEIL_Y, 3, bottom - CEIL_Y - 2, T[5]); box(c, x + half - 3, CEIL_Y, 3, bottom - CEIL_Y - 2, T[1]);
    for (let y = CEIL_Y + 10; y < bottom - 20; y += 13) box(c, x - half + 4, y, half * 2 - 8, 1, T[2]);
    box(c, x - half - 14, bottom - 14, half * 2 + 28, 14, INK); box(c, x - half - 13, bottom - 13, half * 2 + 26, 12, T[3]); box(c, x - half - 13, bottom - 13, half * 2 + 26, 2, T[5]);
    c.save(); c.beginPath(); c.rect(x - half - 13, bottom - 7, half * 2 + 26, 6); c.clip();
    for (let k = -2; k < 8; k++) { const sx = x - half - 13 + k * 8; c.fillStyle = '#F2C82A'; c.beginPath(); c.moveTo(sx, bottom - 1); c.lineTo(sx + 4, bottom - 1); c.lineTo(sx + 10, bottom - 7); c.lineTo(sx + 6, bottom - 7); c.closePath(); c.fill(); }
    c.restore();
    for (const bxx of [x - half - 8, x + half + 5]) { box(c, bxx, bottom - 10, 3, 3, S[1]); box(c, bxx, bottom - 10, 1, 1, S[5]); }
  }
  for (const ch of CHUTES) {
    const x = X(ch);
    if (!onScreen(state, x - 40, x + 40)) continue;
    // (the hopper: riveted iron, its gate)
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 30, CEIL_Y - 2); c.lineTo(x + 30, CEIL_Y - 2); c.lineTo(x + 22, CEIL_Y + 18); c.lineTo(x - 22, CEIL_Y + 18); c.closePath(); c.fill();
    c.fillStyle = S[3]; c.beginPath(); c.moveTo(x - 28, CEIL_Y); c.lineTo(x + 28, CEIL_Y); c.lineTo(x + 20, CEIL_Y + 16); c.lineTo(x - 20, CEIL_Y + 16); c.closePath(); c.fill();
    box(c, x - 26, CEIL_Y, 10, 14, S[5]); box(c, x + 14, CEIL_Y + 2, 8, 14, S[1]);
    for (let k = -22; k < 24; k += 8) box(c, x + k, CEIL_Y + 3, 1, 1, S[6]);
    box(c, x - 20, CEIL_Y + 14, 40, 4, IRON[1]);
  }
  for (const [cx, half] of CAVEINS) {
    const x = X(cx);
    if (!onScreen(state, x - half, x + half)) continue;
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
    for (let k = -2; k <= 2; k++) { c.moveTo(x + k * half / 2.5, CEIL_Y); c.lineTo(x + k * half / 2.5 + 8, CEIL_Y + 12); c.lineTo(x + k * half / 2.5 - 4, CEIL_Y + 22); }
    c.stroke();
    c.strokeStyle = hr('mine', MINE, 0.1)[4]; c.lineWidth = 1; c.beginPath();
    for (let k = -2; k <= 2; k++) { c.moveTo(x + k * half / 2.5 + 1, CEIL_Y + 1); c.lineTo(x + k * half / 2.5 + 9, CEIL_Y + 13); }
    c.stroke();
    box(c, x - half, CEIL_Y - 4, half * 2, 4, mix('#3A2A1A', '#000000', 0.3));
  }
};

/** A mine cart (its left end at x, its wheels on the rail at railY): riveted iron, banded, ore heaped in it (or not). */
export const drawCartArt = (c: Ctx, x: number, railY: number, f: number, loaded: boolean) => {
  const w = RIDE.w, top = railY - 34, S = hr('iron', IRON, 0.1), O = hr('ore', ORE, 0.1);
  if (loaded) for (let k = 0; k < 6; k++) { const ox = x + 6 + k * 11, r = 7 + (k % 2) * 2; c.fillStyle = INK; c.beginPath(); c.arc(ox, top - 1, r + 1, Math.PI, 0); c.fill(); c.fillStyle = k % 3 === 1 ? '#C8962E' : O[3]; c.beginPath(); c.arc(ox, top - 1, r, Math.PI, 0); c.fill(); box(c, ox - r * 0.5, top - r * 0.7, 3, 2, k % 3 === 1 ? '#FFE07A' : O[5]); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 3, top - 1); c.lineTo(x + w + 3, top - 1); c.lineTo(x + w - 2, top + 27); c.lineTo(x + 2, top + 27); c.closePath(); c.fill();
  c.fillStyle = S[3]; c.beginPath(); c.moveTo(x - 1, top); c.lineTo(x + w + 1, top); c.lineTo(x + w - 3, top + 26); c.lineTo(x + 3, top + 26); c.closePath(); c.fill();
  box(c, x, top, 10, 25, S[4]); box(c, x + w - 12, top, 9, 25, S[2]);
  box(c, x - 1, top, w + 2, 3, S[5]); box(c, x - 1, top, w + 2, 1, S[6]);
  box(c, x + 1, top + 12, w - 2, 3, S[1]); box(c, x + 1, top + 12, w - 2, 1, S[4]);
  for (let k = 0; k < 5; k++) { box(c, x + 6 + k * 14, top + 5, 2, 2, INK); box(c, x + 6 + k * 14, top + 5, 1, 1, S[6]); box(c, x + 6 + k * 14, top + 18, 2, 2, INK); box(c, x + 6 + k * 14, top + 18, 1, 1, S[6]); }
  for (const wx of [x + 14, x + w - 14]) {
    c.fillStyle = INK; c.beginPath(); c.arc(wx, railY - 6, 8, 0, Math.PI * 2); c.fill();
    c.fillStyle = S[2]; c.beginPath(); c.arc(wx, railY - 6, 6.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = S[4]; c.beginPath(); c.arc(wx, railY - 6, 6.5, Math.PI * 1.1, Math.PI * 1.7); c.lineTo(wx, railY - 6); c.fill();
    const a = f * 0.4; for (let k = 0; k < 4; k++) { const q = a + (k * Math.PI) / 2; box(c, wx + Math.cos(q) * 4 - 1, railY - 7 + Math.sin(q) * 4, 2, 2, S[5]); }
    box(c, wx - 2, railY - 8, 4, 4, BRASS[3]);
  }
};

/** A rock coming down (or lying), stepped. */
export const drawRockArt = (c: Ctx, x: number, y: number, r: number) => ball(c, x, y, r, r * 0.92, hr('mine', MINE, 0.05).map((col, i) => (i > 2 ? mix(col, '#A8A29E', 0.25) : col)));

/** The chute's dump: a stream of ore and rock pouring. */
export const drawDumpArt = (c: Ctx, x: number, f: number) => {
  const O = hr('ore', ORE, 0.1);
  c.globalAlpha = 0.9; box(c, x - 24, CEIL_Y + 16, 48, FY - CEIL_Y - 16, O[1]); c.globalAlpha = 1;
  for (let y = CEIL_Y + 16 + ((f * 7) % 20); y < FY; y += 20) for (let k = 0; k < 3; k++) { const rx = x - 20 + hash(y + k * 7) * 34, s = 5 + hash(y * 3 + k) * 5; box(c, rx - 1, y - 1, s + 2, s + 2, INK); box(c, rx, y, s, s, k === 1 ? '#C8962E' : O[3]); box(c, rx, y, s * 0.5, 1, k === 1 ? '#FFE07A' : O[5]); }
};

/** The chute's pile on the floor. */
export const drawPileArt = (c: Ctx, x: number, n: number) => {
  const O = hr('ore', ORE, 0.1);
  for (let k = 0; k < n; k++) { const px = x + (k - 1) * 18; c.fillStyle = INK; c.beginPath(); c.ellipse(px, FY, 23, 9 + k * 2, 0, Math.PI, 0); c.fill(); c.fillStyle = O[2]; c.beginPath(); c.ellipse(px, FY, 22, 8 + k * 2, 0, Math.PI, 0); c.fill(); c.fillStyle = O[4]; c.beginPath(); c.ellipse(px - 6, FY - 3, 10, 4 + k, 0, Math.PI, 0); c.fill(); box(c, px + 4, FY - 6 - k, 3, 2, '#C8962E'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The earth in front of it all, from up top

/** The underground between the shafts (world x), down to under the flooded shaft's bed. */
const VA = 11600, VB = 14420, VBOT = Y(-880) + 320;

/** The cut-away ground face (world): the soil banded over the rock, roots down through it, pebbles; the rock below in
 *  courses, darker going down; its sides at the shafts inked. */
const paintEarth = (g: Ctx, x0: number, w: number, y0: number, h: number) => {
  const tod = timeOfDay(), D = DIRT.map(col => farTint(col, 0.2, tod)), S = STONE.map(col => farTint(col, 0.2, tod)), B = BARK.map(col => farTint(col, 0.2, tod));
  const xa = X(VA), xb = X(VB), SO = 90;
  const dk = (col: string, y: number) => mix(col, '#040302', Math.min(0.88, 0.25 + Math.max(0, y - GY - SO) / 520));
  // (the rock: courses of blocks, world-anchored, each lit along its top, shaded along its foot)
  box(g, x0, y0, w, h, dk(S[1], y0 + h / 2));
  for (let y = GY + SO, row = 0; y < y0 + h; row++) {
    const rh = 22 + hash(row * 2.9) * 22;
    if (y + rh >= y0) for (let x = xa - 60 + hash(row * 1.3) * 50; x < x0 + w; ) {
      const bw = 36 + hash(row * 7.1 + x * 0.013) * 54;
      if (x + bw >= x0) {
        box(g, x, y, bw - 1, rh - 1, dk(S[1 + Math.floor(hash(row * 3.7 + x * 0.031) * 3)], y));
        box(g, x, y, bw - 1, 2, dk(S[5], y)); box(g, x, y + rh - 2, bw - 1, 1, dk(S[0], y)); box(g, x + bw - 2, y, 1, rh - 1, dk(S[0], y));
        if (hash(row * 5.3 + x * 0.07) > 0.85) checker(g, x + 4, y + 4, bw - 10, rh - 10, dk(S[3], y), row & 1);
      }
      x += bw;
    }
    y += rh;
  }
  // (the soil over it, banded darker going down, dithered between bands; the rubble at its foot)
  const bands = [D[4], D[3], D[3], D[2], D[2], D[1]], bh = SO / bands.length;
  for (let i = 0; i < bands.length; i++) { box(g, x0, GY + i * bh, w, bh + 1, bands[i]); if (i) checker(g, x0, GY + i * bh - 1, w, PIX, bands[i - 1], i & 1); }
  for (let x = Math.floor(x0 / 22) * 22; x < x0 + w; x += 22) { const px = x + hash(x * 0.9) * 14, py = GY + 12 + hash(x * 1.7) * (SO - 20); pixelBlob(g, px, py, 3 + hash(x) * 4, 2 + hash(x * 2) * 2, S[2]); box(g, px - 2, py - 2, 3, 1, S[4]); }
  box(g, x0, GY + SO - 2, w, 3, D[0]);
  for (let x = Math.floor(x0 / 30) * 30; x < x0 + w; x += 30) pixelBlob(g, x + hash(x * 4.1) * 20, GY + SO + 2, 6 + hash(x * 3.3) * 8, 3, dk(S[2], GY + SO));
  // (roots down through the soil from the mountain's foot: crooked, forking, lit down one side)
  for (let x = Math.floor(x0 / 70) * 70; x < x0 + w; x += 70) {
    let rx = x + hash(x * 0.37) * 50, ry = GY;
    const len = 30 + hash(x * 0.61) * (SO + 30);
    for (let s = 0; s < len; s += 6) {
      const nx = rx + (hash(x + s * 1.9) - 0.5) * 6;
      g.strokeStyle = B[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(rx, ry); g.lineTo(nx, ry + 6); g.stroke();
      g.strokeStyle = B[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(rx - 1, ry); g.lineTo(nx - 1, ry + 6); g.stroke();
      if (hash(x * 1.1 + s) > 0.86) { g.strokeStyle = B[2]; g.beginPath(); g.moveTo(nx, ry + 6); g.lineTo(nx + (hash(s + x) > 0.5 ? 8 : -8), ry + 14); g.stroke(); }
      rx = nx; ry += 6;
    }
  }
  // (the top: the ground's line, inked; the sides cut at the shafts, inked)
  box(g, x0, GY - 1, w, 2, INK); box(g, x0, GY + 1, w, 1, D[5]);
  box(g, xa - 1, y0, 3, h, INK); box(g, xb - 2, y0, 3, h, INK);
};

/** Over everything underground between the shafts while he's up top: the ground's face, solid (the playtest: the
 *  tunnels, their lanterns and the canary showed through the ground from the street). Faded out by how far down a shaft
 *  he goes (no pop), back as he comes up. From the street its top follows the bent floor's fanned edge (that's the
 *  floor's to show). The shafts' own openings are left clear: down them is genuinely in view. */
export const drawMineVeil = (c: Ctx, state: GameState) => {
  const p = state.player, a = 1 - mineDepthOf(p.pos.x + p.width / 2, p.pos.y + p.height, 60, 300);
  if (a <= 0.01) return;
  const v = viewIn(state), xa = X(VA), xb = X(VB);
  if (xb < v.v0 || xa > v.v1 || GY > v.bot) return;
  const ex = v.eye.x, fan = (e: number, y: number) => ex + (e - ex) * (1 + (y - GY) * BEND);
  const left = X(SHAFTS[0][0]), right = X(SHAFTS[1][1]);
  const L = (y: number) => (ex < left ? Math.max(xa, fan(left, y)) : xa), R = (y: number) => (ex > right ? Math.min(xb, fan(right, y)) : xb);
  c.save(); c.beginPath();
  const N = 16;
  for (let i = 0; i <= N; i++) { const y = GY - 1 + (BAND * i) / N; i ? c.lineTo(L(y), y) : c.moveTo(L(y), y); }
  c.lineTo(xa, GY - 1 + BAND); c.lineTo(xa, VBOT); c.lineTo(xb, VBOT); c.lineTo(xb, GY - 1 + BAND);
  for (let i = N; i >= 0; i--) { const y = GY - 1 + (BAND * i) / N; c.lineTo(R(y), y); }
  c.closePath(); c.clip();
  c.globalAlpha = a;
  for (let x = xa, i = 0; x < xb; x += 512, i++) {
    const w = Math.min(512, xb - x);
    if (x + w < v.v0 || x > v.v1) continue;
    for (let y = GY - 2, j = 0; y < VBOT; y += 512, j++) {
      const hh = Math.min(512, VBOT - y);
      if (y + hh < v.top || y > v.bot) continue;
      still(c, `earth-${i}-${j}`, 0, 0, x, y, w, hh, g => paintEarth(g, x, w, y, hh));
    }
  }
  c.restore();
};

void checker; void stillAt; void atDepth; void sideBack; void topBack; void back7; void hr7; void puff; void COAL; void TOPLIP;
