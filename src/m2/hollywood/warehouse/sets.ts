// The sets, standing at the back of the stage floor in a row (world space, at their depths: paint.ts's view; the
// scenery is set back and dimmed, nothing on it lit along a lip: none of it's for standing on): the green-screen cycs
// (muslin hung off pipe battens on chains, its seams, the sweep down onto a painted green floor, the tracking markers
// taped on it), the painted flats (the rooftop's city, New New York burning) braced from behind with 2x4 jacks and
// sandbags, the banners hung off box truss on chain motors, the gear (a camera on its dolly and its track, the camera
// crane, the slate, the signs on C-stands), video village (its monitors under a black pop-up, the chairs), craft
// services and the catering truck, the call sheet with Steve's headshot on it, the mothership's walls, New New York's
// rubble and its fire bars, the cast's trailers. The still art's painted once for the hour (blvd/kit.ts still()); only
// what moves or flickers is live.

import { X, GY, ROOF_Y, REFILL, ARENA } from './layout';
import {
  type Ctx, type View, INK, WALL_D, CYC_D, PROP_D, GEAR_D, pal, seenAt, floorQ, floorY, pipe, riser, truss, sandbag, cStand,
  appleBox, flightCase, revLogo, revLook, standSign, TAPE, back,
} from './paint';
import {
  box, checker, mix, hash, poly, at, atDepth, still, bandedGradient, lit, ramp6, board, plain, deco, words, STEVE, BRASS,
  signText, type Look,
} from '../blvd/kit';
import { steveCard } from '../blvd/props';

// ---------------------------------------------------------------------------------------------------------------
// The cycs

/** How tall the cycs hang (world, at their depth), and the main stage's. */
const CYC_H = 470;
/**
 * A green-screen cyc from x a..b (world, at CYC_D; feet at GY): the pipe batten on its chains up into the dark, the
 * muslin banded (lit across its middle), its seams, its hem's grommets, the sweep down onto the floor, the tracking
 * markers (pink and white tape crosses, seeded). Live (it's mostly a few big fills).
 */
const cyc = (c: Ctx, v: View, a: number, b: number, h = CYC_H, seed = 0) => {
  const C = pal().chroma, S = pal().steel, top = GY - h;
  atDepth(c, v.eye, CYC_D, () => {
    // (the chains up from the batten into the dark; the batten)
    for (let x = a + 60; x < b - 20; x += 240) { box(c, x - 1, ROOF_Y, 3, top - ROOF_Y - 14, INK); for (let y = ROOF_Y; y < top - 16; y += 6) box(c, x, y, 1, 3, back(S[4], WALL_D)); }
    pipe(c, a - 14, b + 14, top - 16, 5, S.map(cc => back(cc, WALL_D)));
    // (the muslin: banded, lit across its middle, darker into the sweep)
    box(c, a - 1, top - 1, b - a + 2, h + 1, INK);
    bandedGradient(c, a, top, b - a, h - 46, [C[2], C[3], C[4], C[4], C[3], C[3]], 8);
    bandedGradient(c, a, GY - 46, b - a, 46, [C[3], C[2], C[1]], 4);
    // (its hem along the top: a darker band, the grommets and their ties)
    box(c, a, top, b - a, 5, C[1]);
    for (let x = a + 8; x < b; x += 20) { box(c, x, top + 1, 3, 3, C[6]); box(c, x + 1, top - 12, 1, 13, INK); }
    // (the panel seams: a darker line, dithered along it)
    for (let x = a + 140; x < b - 10; x += 140) { box(c, x, top + 5, 1, h - 5, C[2]); checker(c, x + 1, top + 5, 2, h - 50, C[2], 0, 1); }
    // (the edges, wrapped round their frames, in shade)
    box(c, a, top, 4, h, C[1]); box(c, b - 6, top, 6, h, C[1]); checker(c, b - 10, top, 4, h, C[1], 0, 1);
    // (the tracking markers: tape crosses, seeded, never in the sweep)
    for (let x = a + 40; x < b - 30; x += 96) for (let y = top + 44; y < GY - 80; y += 92) {
      const k = hash(x * 0.13 + y * 0.07 + seed);
      if (k < 0.18) continue;
      const mx = x + Math.round((k - 0.5) * 30), my = y + Math.round((hash(x + y) - 0.5) * 20), col = k > 0.7 ? TAPE.pink : TAPE.white;
      box(c, mx - 7, my - 1, 15, 3, INK); box(c, mx - 2, my - 6, 4, 13, INK);
      box(c, mx - 6, my, 13, 1, col); box(c, mx - 1, my - 5, 2, 11, col);
    }
  });
  // (the green floor painted out in front of it, going forward a step; tape marks on it)
  const eye = v.eye, n = 3, d0 = CYC_D, d1 = CYC_D + 0.05;
  for (let i = 0; i < n; i++) floorQ(c, eye, a, b, d0 + ((d1 - d0) * i) / n, d0 + ((d1 - d0) * (i + 1)) / n, [C[1], C[2], C[2]][i]);
  for (let x = a + 50; x < b - 30; x += 130) { const d = d0 + 0.012 + hash(x * 0.3) * 0.03, [sx, sy] = at(eye, x, GY, d); box(c, sx - 4, sy, 9, 1, TAPE.white); box(c, sx, sy - 1, 1, 3, TAPE.white); }
};

// ---------------------------------------------------------------------------------------------------------------
// The flats

/** A flat's bracing seen past its ends: a 2x4 jack going back to the floor, a sandbag on its foot. */
const jack = (g: Ctx, x: number, top: number, side: 1 | -1) => {
  const P = pal().plyD;
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x, top); g.lineTo(x + side * 34, -2); g.stroke();
  g.strokeStyle = P[3]; g.lineWidth = 4; g.beginPath(); g.moveTo(x, top); g.lineTo(x + side * 34, -2); g.stroke();
  g.strokeStyle = P[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 1, top); g.lineTo(x + side * 34 - 1, -3); g.stroke();
  sandbag(g, x + side * 30, 0, 20, pal().sand);
};
/**
 * A painted city on a flat (w wide, h tall; feet at 0): its sky banded (dusk; or the sky on fire), the skyline painted
 * in stepped layers, its windows lit, a water tower or two; `burning`: fire painted up the towers, smoke, a hole in
 * one. Its plywood edge, the 2x4 frame at its ends; the bracing behind it.
 */
const paintSkyline = (g: Ctx, w: number, h: number, burning: boolean) => {
  const P = pal().plyD;
  jack(g, 8, -h + 40, -1); jack(g, w - 8, -h + 40, 1);
  box(g, -3, -h - 3, w + 6, h + 3, INK);
  // (the edge: plywood, the frame's 2x4 showing)
  box(g, -2, -h - 2, w + 4, h + 2, P[2]); box(g, -2, -h - 2, w + 4, 1, P[4]);
  const sky = burning ? ['#2A0A06', '#5A1408', '#9A2C0A', '#D85A14', '#F4A040'] : ['#141A3A', '#26306A', '#4A3E7A', '#9A5A7A', '#E89A6A'];
  bandedGradient(g, 0, -h, w, h, sky.map(cc => back(cc, 0.95)), 10);
  // (the skyline in two layers: the far one paler, the near one dark, lit windows)
  for (const [layer, col, dark] of [[0, burning ? '#4A1C14' : '#3A3A6A', burning ? '#2A100C' : '#2A2A52'], [1, burning ? '#1C1210' : '#141428', burning ? '#0C0806' : '#0A0A18']] as const) {
    for (let x = layer ? -10 : 6, k = 0; x < w; k++) {
      const bw = 26 + Math.floor(hash(k * 3.1 + layer * 9) * 34), bh = (layer ? 110 : 170) + Math.floor(hash(k * 7.3 + layer) * (layer ? 150 : 170));
      const bx = Math.max(0, x), bR = Math.min(w, x + bw);
      if (bR > bx) {
        box(g, bx, -bh, bR - bx, bh, back(col, 0.95)); box(g, bx, -bh, Math.min(3, bR - bx), bh, back(mix(col, '#FFFFFF', 0.12), 0.95)); box(g, Math.max(bx, bR - 4), -bh, Math.min(4, bR - bx), bh, back(dark, 0.95));
        // (a crown on the tall ones: a spire, a setback, a water tower)
        const kind = Math.floor(hash(k * 5.5 + layer * 3) * 4);
        if (kind === 0 && bR - bx > 18) { poly(g, [[bx + 4, -bh], [(bx + bR) / 2, -bh - 30], [bR - 4, -bh]], back(col, 0.95)); box(g, (bx + bR) / 2 - 1, -bh - 46, 2, 18, back(dark, 0.95)); }
        else if (kind === 1 && bR - bx > 18) box(g, bx + 5, -bh - 14, bR - bx - 10, 14, back(col, 0.95));
        else if (kind === 2 && bR - bx > 18) { box(g, bx + 6, -bh - 16, 12, 10, back(dark, 0.95)); box(g, bx + 7, -bh - 6, 2, 6, back(dark, 0.95)); box(g, bx + 15, -bh - 6, 2, 6, back(dark, 0.95)); }
        for (let y = -bh + 10; y < -12; y += 12) for (let wx = bx + 4; wx < bR - 5; wx += 7) if (hash(wx * 0.7 + y * 0.31 + layer) > (layer ? 0.45 : 0.6)) box(g, wx, y, 3, 5, back(burning && hash(wx + y) > 0.6 ? '#F48A2A' : '#F2D27A', 0.95));
        // (the fire painted up it, the smoke over it)
        if (burning && layer === 1 && k % 3 === 0) {
          for (const [fc, s] of [['#9A1E0A', 1], ['#E4580E', 0.75], ['#F8C040', 0.45]] as const) poly(g, [[bx, -bh + 30], [bx + (bR - bx) * 0.2, -bh - 40 * s], [bx + (bR - bx) * 0.45, -bh - 12 * s], [bx + (bR - bx) * 0.7, -bh - 56 * s], [bR, -bh + 30]], back(fc, 0.95));
          for (let s = 0; s < 4; s++) { g.fillStyle = back(['#3A2A26', '#2A1E1C', '#4A3830', '#1E1614'][s], 0.95); g.beginPath(); g.ellipse(bx + 10 + s * 12, -bh - 70 - s * 26, 22 + s * 8, 14 + s * 4, 0, 0, Math.PI * 2); g.fill(); }
        }
      }
      x += bw + (layer ? 2 : 10);
    }
  }
  // (a seam down it, the paint scuffed along its foot)
  for (let x = 120; x < w; x += 120) box(g, x, -h, 1, h, back('#000000', 0.9));
  checker(g, 0, -10, w, 10, back('#000000', 0.9), 0, 2);
};

/** A banner hung off a length of box truss on two chain motors (the truss up near the roof): vinyl, its eyelets and
 *  bungees, its words. Its middle at x, its middle y (world, at the depth it's drawn at). */
const banner = (g: Ctx, x: number, y: number, w: number, h: number, draw: (g: Ctx) => void, bg: string) => {
  const S = pal().steel.map(cc => back(cc, WALL_D)), G = pal().gear, ty = ROOF_Y + 50;
  // (the chain motors: up to the roof's steel, the motors' bodies, the chain down to the truss)
  for (const mx of [x - w / 2 + 30, x + w / 2 - 30]) {
    box(g, mx - 1, ROOF_Y, 3, ty - ROOF_Y - 26, INK);
    box(g, mx - 7, ty - 30, 14, 16, INK); box(g, mx - 6, ty - 29, 12, 14, G[3]); box(g, mx - 6, ty - 29, 3, 14, G[5]);
    box(g, mx, ty - 14, 1, 14, S[4]);
  }
  truss(g, x - w / 2 - 20, x + w / 2 + 20, ty, 14, S);
  // (the bungees down to the eyelets)
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath();
  for (let k = 0; k <= 6; k++) { const bx = x - w / 2 + 6 + ((w - 12) * k) / 6; g.moveTo(bx, ty + 14); g.lineTo(bx, y - h / 2 + 4); }
  g.stroke();
  const R = ramp6(bg);
  box(g, x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, INK);
  box(g, x - w / 2, y - h / 2, w, h, R[3]); box(g, x - w / 2, y - h / 2, w, 3, R[4]); box(g, x - w / 2, y + h / 2 - 4, w, 4, R[2]);
  // (it sags a little between the eyelets: a shade under each)
  for (let k = 0; k < 6; k++) box(g, x - w / 2 + 10 + ((w - 12) * k) / 6, y - h / 2 + 4, (w - 12) / 6 - 8, 1, R[2]);
  for (let k = 0; k <= 6; k++) { const bx = x - w / 2 + 6 + ((w - 12) * k) / 6; box(g, bx - 2, y - h / 2 + 2, 4, 4, INK); box(g, bx - 1, y - h / 2 + 3, 2, 2, '#D8D4CC'); }
  draw(g);
};

// ---------------------------------------------------------------------------------------------------------------
// The gear

/** A cinema camera on its dolly (feet at 0): the dolly's chassis on its track wheels, the column, the geared head, the
 *  body, the magazine on top (two reels), the lens and its matte box, the monitor on its arm, the operator's seat. */
const paintCamera = (g: Ctx) => {
  const G = pal().gear, S = pal().steel;
  // (the dolly)
  box(g, -46, -24, 92, 18, INK); box(g, -45, -23, 90, 16, G[3]); box(g, -45, -23, 90, 2, G[5]); box(g, -45, -9, 90, 2, G[1]);
  for (const wx of [-36, -20, 20, 36]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -5, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = S[2]; g.beginPath(); g.arc(wx, -5, 4, 0, Math.PI * 2); g.fill(); box(g, wx - 1, -6, 2, 2, S[5]); }
  box(g, 30, -46, 4, 24, INK); box(g, 24, -50, 18, 5, INK); box(g, 25, -49, 16, 3, G[4]);
  // (the column, the head)
  riser(g, -6, -96, -24, 12, G);
  box(g, -18, -108, 36, 14, INK); box(g, -17, -107, 34, 12, G[4]); box(g, -17, -107, 34, 2, G[6]);
  g.fillStyle = INK; g.beginPath(); g.arc(-22, -101, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = G[4]; g.beginPath(); g.arc(-22, -101, 5, 0, Math.PI * 2); g.fill();
  // (the body, the magazine's two reels)
  box(g, -28, -138, 52, 32, INK); box(g, -27, -137, 50, 30, G[3]); box(g, -27, -137, 50, 3, G[5]); box(g, -27, -137, 4, 30, G[4]); box(g, 19, -137, 4, 30, G[1]);
  for (const [rx, r] of [[-14, 15], [12, 13]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(rx, -152, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = G[3]; g.beginPath(); g.arc(rx, -152, r, 0, Math.PI * 2); g.fill(); g.fillStyle = G[5]; g.beginPath(); g.arc(rx - 3, -155, r * 0.45, 0, Math.PI * 2); g.fill(); box(g, rx - 1, -153, 3, 3, G[1]); }
  box(g, -22, -128, 8, 5, '#B91C1C'); box(g, -22, -128, 3, 2, '#F87171');
  words(g, 'PANAVISHUN', -2, -112, plain(1, 1, '#C8C8D0'));
  // (the lens out the front, its follow focus, the matte box)
  box(g, 23, -130, 18, 16, INK); box(g, 24, -129, 16, 14, G[2]); for (let k = 0; k < 4; k++) box(g, 26 + k * 4, -129, 1, 14, G[4]);
  box(g, 40, -140, 16, 36, INK); box(g, 41, -139, 14, 34, G[3]); box(g, 41, -139, 14, 2, G[5]); box(g, 44, -134, 8, 24, '#0A0A14'); box(g, 45, -133, 3, 6, '#5A6AA0');
  box(g, 41, -147, 14, 7, INK); box(g, 42, -146, 12, 5, G[2]);
  // (the monitor on its arm; the seat)
  box(g, -32, -124, 4, 16, INK); box(g, -50, -138, 22, 16, INK); box(g, -49, -137, 20, 14, G[2]); box(g, -47, -135, 16, 10, '#2E7A3E'); box(g, -47, -135, 16, 2, '#7AD08A');
  box(g, -44, -58, 4, 34, INK); box(g, -43, -57, 2, 32, S[3]); box(g, -52, -62, 18, 6, INK); box(g, -51, -61, 16, 4, G[4]);
};
/** The dolly's track on the floor going along at depth d (two rails, the ties between, going back a step). */
const dollyTrack = (c: Ctx, v: View, a: number, b: number, d: number) => {
  const S = pal().steel, P = pal().ply, eye = v.eye, d1 = d - 0.012;
  for (let x = a; x < b; x += 24) { const [p, q] = at(eye, x, GY, d), [r, s] = at(eye, x, GY, d1); poly(c, [[p - 2, q], [p + 3, q], [r + 3, s], [r - 2, s]], P[2]); }
  for (const dd of [d, d1]) { const [p, q] = at(eye, a, GY, dd), [r] = at(eye, b, GY, dd); box(c, p, q - 2, r - p, 3, INK); box(c, p, q - 2, r - p, 1, S[5]); box(c, p, q - 1, r - p, 1, S[3]); }
};
/** The slate on its stand: the clapper's sticks striped, the board's chalk: what's being shot. Feet at 0. */
const paintSlate = (g: Ctx) => {
  const G = pal().gear;
  cStand(g, 0, 0, 84);
  box(g, -36, -134, 72, 52, INK); box(g, -35, -133, 70, 50, '#1A1C20'); box(g, -35, -133, 70, 2, '#3A3C44');
  for (let k = 0; k < 7; k++) box(g, -35 + k * 10, -142, 10, 8, k % 2 ? '#F4F0E8' : '#14161A');
  box(g, -36, -143, 72, 1, INK);
  for (const y of [-118, -105, -92]) box(g, -33, y, 66, 1, '#5A5C64');
  words(g, 'REVENGERS:', 0, -122, plain(1, 1, '#F4F0E8'));
  words(g, 'END-OF-THE-', 0, -109, plain(1, 1, '#E2DED4'));
  words(g, "WORLD'S-DAY", 0, -96, plain(1, 1, '#E2DED4'));
  words(g, 'SECRET SET', 0, -85, plain(1, 1, '#F8A0A0'));
  void G;
};
/** The camera crane (its base, the counterweights, the arm up out of sight: the wire's camera crane): feet at 0. */
const paintCraneBase = (g: Ctx) => {
  const G = pal().gear, S = pal().steel;
  box(g, -60, -30, 120, 26, INK); box(g, -59, -29, 118, 24, G[3]); box(g, -59, -29, 118, 3, G[5]);
  for (const wx of [-46, -16, 16, 46]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -5, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#26262C'; g.beginPath(); g.arc(wx, -5, 5, 0, Math.PI * 2); g.fill(); }
  riser(g, -8, -120, -30, 16, G);
  // (the counterweights stacked on the back of the arm, the arm up to the right)
  g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(-90, -96); g.lineTo(150, -250); g.stroke();
  g.strokeStyle = S[3]; g.lineWidth = 10; g.beginPath(); g.moveTo(-90, -96); g.lineTo(150, -250); g.stroke();
  g.strokeStyle = S[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(-90, -101); g.lineTo(150, -255); g.stroke();
  for (let k = 0; k < 4; k++) { box(g, -96 + k * 7, -110 + k * -4, 8, 26, INK); box(g, -95 + k * 7, -109 + k * -4, 6, 24, '#B8A040'); }
  box(g, -12, -128, 24, 12, INK); box(g, -11, -127, 22, 10, G[4]);
  words(g, 'TECHNO-ISH', 0, -12, plain(1, 1, '#C8C8D0'));
};
/** Video village: a black pop-up over the monitors on their cart, the director's and the producer's chairs, the
 *  headphones, a cooler. Feet at 0 (its left). */
const chair = (g: Ctx, x: number, name: string, back2 = '#18181B') => {
  const W2 = pal().ply;
  for (const lx of [x + 2, x + 30]) { box(g, lx - 1, -74, 4, 74, INK); box(g, lx, -74, 2, 74, W2[3]); }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 2, -2); g.lineTo(x + 32, -38); g.moveTo(x + 32, -2); g.lineTo(x + 2, -38); g.stroke();
  g.strokeStyle = W2[3]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 2, -2); g.lineTo(x + 32, -38); g.moveTo(x + 32, -2); g.lineTo(x + 2, -38); g.stroke();
  box(g, x - 1, -42, 36, 6, INK); box(g, x, -41, 34, 4, back2); box(g, x, -41, 34, 1, mix(back2, '#FFFFFF', 0.3));
  box(g, x - 1, -74, 36, 18, INK); box(g, x, -73, 34, 16, back2); box(g, x, -73, 34, 2, mix(back2, '#FFFFFF', 0.25));
  words(g, name, x + 17, -61, plain(1, 1, '#F4F0E8'));
};
const paintVillage = (g: Ctx) => {
  const G = pal().gear, S = pal().steel, B = pal().blacks;
  // (the pop-up's legs, its black canopy and valance)
  for (const lx of [-4, 196]) riser(g, lx, -150, 0, 4, S);
  poly(g, [[-14, -150], [96, -176], [210, -150]], INK); poly(g, [[-12, -151], [96, -174], [208, -151]], B[3]); poly(g, [[96, -174], [208, -151], [96, -151]], B[1]);
  box(g, -14, -152, 224, 14, INK); box(g, -13, -151, 222, 12, B[2]); box(g, -13, -151, 222, 1, B[4]);
  signText(g, 'VIDEO VILLAGE', 98, -142, plain(1, 1, '#E8E4DA'));
  // (the cart: three monitors on its top shelf (live pictures drawn over), cables, a hard drive)
  box(g, 16, -62, 150, 8, INK); box(g, 17, -61, 148, 6, S[3]); box(g, 17, -61, 148, 1, S[5]);
  box(g, 16, -14, 150, 6, INK); box(g, 17, -13, 148, 4, S[2]);
  for (const lx of [20, 158]) riser(g, lx, -62, -8, 3, S);
  for (const wx of [24, 154]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -4, 4, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 3; k++) { box(g, 22 + k * 48, -104, 46, 42, INK); box(g, 23 + k * 48, -103, 44, 40, G[3]); box(g, 23 + k * 48, -103, 44, 2, G[5]); box(g, 26 + k * 48, -100, 38, 30, '#06080C'); box(g, 40 + k * 48, -66, 10, 4, G[2]); }
  flightCase(g, 30, -14, 40, 24, 'HDD'); flightCase(g, 96, -14, 54, 20);
  // (the chairs, the headphones hung on one, a cooler)
  chair(g, 176, 'DIRECTOR', '#18181B'); chair(g, 218, 'PRODUCER', '#3A1A1A');
  box(g, 182, -78, 10, 4, INK); box(g, 180, -76, 4, 8, '#3A3A44'); box(g, 190, -76, 4, 8, '#3A3A44');
  box(g, 258, -24, 36, 24, INK); box(g, 259, -23, 34, 22, '#2A62B8'); box(g, 259, -23, 34, 6, '#F4F0E8'); box(g, 259, -23, 34, 1, '#FFFFFF');
};
/** Craft services' long table: the cloth, the urns, the donut boxes, a bowl of candy, the sign. Feet at 0. */
const paintCraftTable = (g: Ctx) => {
  const S = pal().steel, P = pal().ply;
  standSign(g, -30, 0, ['CRAFT SERVICES', 'CAST AND CREW ONLY'], plain(1, 1, '#FDE68A'), '#7F1D1D', 116);
  for (const lx of [8, 172]) { box(g, lx - 1, -46, 5, 46, INK); box(g, lx, -46, 3, 46, S[3]); }
  box(g, 0, -50, 184, 8, INK); box(g, 1, -49, 182, 6, '#F0ECE2'); box(g, 1, -49, 182, 1, '#FFFFFF');
  box(g, 1, -43, 182, 18, '#C8302A'); for (let k = 1; k < 182; k += 8) box(g, k, -43, 4, 18, '#E8E0D4');
  for (let y = -43; y < -25; y += 8) box(g, 1, y, 182, 4, '#C8302A');
  for (let k = 1; k < 182; k += 8) for (let y = -43; y < -25; y += 8) box(g, k, y, 4, 4, '#F0ECE2');
  box(g, 1, -27, 182, 2, '#7A1A16');
  // (the urns: chrome, stepped; their spigots)
  for (const ux of [14, 40]) { box(g, ux - 1, -82, 20, 33, INK); box(g, ux, -81, 18, 31, S[3]); box(g, ux, -81, 5, 31, S[5]); box(g, ux + 13, -81, 5, 31, S[1]); box(g, ux + 6, -58, 6, 4, INK); box(g, ux - 2, -85, 22, 4, INK); box(g, ux - 1, -84, 20, 2, S[4]); }
  words(g, 'DECAF', 23, -66, plain(1, 1, '#18181B'));
  // (the donut boxes, open: pink frosting; a bowl of candy; the bagels)
  for (const bx of [72, 112]) { box(g, bx - 1, -60, 36, 11, INK); box(g, bx, -59, 34, 9, '#F4E8D0'); poly(g, [[bx, -59], [bx + 34, -59], [bx + 30, -78], [bx + 4, -78]], '#F8F0DC'); box(g, bx + 4, -78, 26, 1, INK); for (let k = 0; k < 3; k++) { g.fillStyle = INK; g.beginPath(); g.arc(bx + 7 + k * 10, -55, 4.5, 0, Math.PI * 2); g.fill(); g.fillStyle = k === 1 ? '#8A4A1A' : '#F48AB4'; g.beginPath(); g.arc(bx + 7 + k * 10, -56, 3.5, 0, Math.PI * 2); g.fill(); box(g, bx + 6 + k * 10, -57, 2, 2, '#3A1A0A'); } }
  g.fillStyle = INK; g.beginPath(); g.ellipse(162, -54, 14, 7, 0, 0, Math.PI); g.fill(); g.fillStyle = '#E8E4DA'; g.beginPath(); g.ellipse(162, -55, 12, 5, 0, 0, Math.PI); g.fill();
  for (let k = 0; k < 7; k++) box(g, 152 + k * 3, -57 - (k % 2) * 2, 2, 2, ['#EF4444', '#FACC15', '#22C55E', '#3B82F6'][k % 4]);
  appleBox(g, 186, 0, 28, 14, P);
};
/** The catering truck (its middle-bottom at 0): white, the service window up its side under a striped awning, the
 *  menu, CATERING; the counter's own shelf is the play plane's (the ledge he stands on). */
const paintCatering = (g: Ctx) => {
  const S = pal().steel, w = 300, h = 250, x = -w / 2;
  for (const wx of [x + 40, x + w - 50]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -18, 17, 0, Math.PI * 2); g.fill(); g.fillStyle = '#26262C'; g.beginPath(); g.arc(wx, -18, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = S[3]; g.beginPath(); g.arc(wx, -18, 6, 0, Math.PI * 2); g.fill(); }
  const R = ramp6('#E8E4DC');
  box(g, x - 1, -h - 1, w + 2, h - 18, INK);
  box(g, x, -h, w, h - 20, R[3]); box(g, x, -h, w, 3, R[5]); box(g, x, -h, 3, h - 20, R[4]); box(g, x + w - 5, -h, 5, h - 20, R[2]); checker(g, x + w - 9, -h, 4, h - 20, R[2], 0, 2);
  box(g, x, -40, w, 6, '#B91C1C'); box(g, x, -40, w, 1, '#F87171');
  // (the window: the kitchen's dark inside, a cook's paper hat, the hood; the awning)
  box(g, x + 30, -210, 230, 92, INK); box(g, x + 32, -208, 226, 88, '#141018'); box(g, x + 32, -208, 226, 14, '#2A2430');
  for (let k = 0; k < 4; k++) box(g, x + 50 + k * 50, -200, 30, 5, S[2]);
  box(g, x + 150, -170, 16, 12, '#F4F0E8'); box(g, x + 152, -158, 12, 10, '#C8946A');
  for (let k = 0; k < 13; k++) { const ax = x + 22 + k * 19; poly(g, [[ax, -226], [ax + 19, -226], [ax + 19, -212], [ax + 9, -206], [ax, -212]], k % 2 ? '#F4F0E8' : '#B91C1C'); }
  box(g, x + 22, -228, 247, 3, INK);
  signText(g, 'CATERING', 0, -232, deco('#F4F0E8', '#7F1D1D', 2, 2));
  // (the menu board by the window)
  box(g, x + 262, -196, 34, 60, INK); box(g, x + 263, -195, 32, 58, '#1A1C20');
  for (let k = 0; k < 6; k++) box(g, x + 266, -188 + k * 8, 18 + (k * 7) % 8, 2, '#E8E4DA');
  box(g, x + 4, -100, 20, 50, R[2]); box(g, x + 4, -100, 20, 1, R[4]); box(g, x + 20, -76, 2, 4, S[4]);
};
/** The call sheet on its board on legs: the pages pinned up, Steve's headshot (yellow), CALL ME scrawled on it. */
const paintCallSheet = (g: Ctx) => {
  const P = pal().ply;
  for (const lx of [-50, 46]) { box(g, lx - 1, -110, 6, 110, INK); box(g, lx, -110, 4, 110, P[2]); box(g, lx, -110, 1, 110, P[4]); }
  box(g, -58, -196, 116, 94, INK); box(g, -57, -195, 114, 92, P[3]); box(g, -57, -195, 114, 2, P[5]); box(g, -53, -191, 106, 84, '#B88A54');
  checker(g, -53, -191, 106, 84, '#A87A44', 0, 2);
  for (const [px, py, pw, ph] of [[-49, -187, 40, 54], [-7, -180, 18, 22]] as const) { box(g, px - 1, py - 1, pw + 2, ph + 2, INK); box(g, px, py, pw, ph, '#F4F0E8'); for (let y = py + 10; y < py + ph - 3; y += 5) box(g, px + 3, y, pw - 6 - ((y * 3) % 9), 1, '#8A8A94'); box(g, px + pw / 2 - 1, py, 3, 3, '#DC2626'); }
  words(g, 'CALL SHEET', -29, -176, plain(1, 1, '#18181B'));
  steveCard(g, 30, -150, 0.7, 2, 'flier');
  words(g, 'CALL ME', 30, -114, plain(1, 1, '#B91C1C'));
};
/** One of the cast's trailers (its door end): white, its star on the door with their name, the steps, the AC, a
 *  window, its hitch. Feet at 0 (its left). */
const paintTrailer = (g: Ctx, name: string) => {
  const S = pal().steel, R = ramp6('#E8E4DA'), w = 120, h = 150;
  box(g, -1, -h - 1, w + 2, h - 8, INK);
  box(g, 0, -h, w, h - 10, R[3]); box(g, 0, -h, w, 3, R[5]); box(g, 0, -h, 3, h - 10, R[4]); box(g, w - 4, -h, 4, h - 10, R[2]);
  for (let k = 6; k < w - 4; k += 8) box(g, k, -h + 4, 1, h - 16, R[2]);
  box(g, 0, -26, w, 6, '#3A6AB8');
  box(g, 22, -h - 10, 34, 10, INK); box(g, 23, -h - 9, 32, 8, S[4]); for (let k = 0; k < 5; k++) box(g, 26 + k * 6, -h - 8, 3, 6, S[2]);
  // (the door: its star (gold), the name on it; the steps up to it)
  box(g, 24, -126, 42, 104, INK); box(g, 25, -125, 40, 102, R[2]); box(g, 25, -125, 40, 2, R[4]); box(g, 58, -76, 4, 3, S[4]);
  g.fillStyle = INK; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 6 : 15; g.lineTo(45 + Math.cos(a) * rr, -104 + Math.sin(a) * rr); } g.closePath(); g.fill();
  g.fillStyle = BRASS[3]; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 5 : 13; g.lineTo(45 + Math.cos(a) * rr, -104 + Math.sin(a) * rr); } g.closePath(); g.fill();
  g.fillStyle = BRASS[5]; g.beginPath(); g.arc(42, -107, 2.5, 0, Math.PI * 2); g.fill();
  board(g, 45, -78, [name], plain(1, 1, '#18181B'), '#F2C24A', BRASS, 3);
  for (let k = 0; k < 3; k++) { box(g, 18 - k * 4, -20 + k * 7, 52 + k * 8, 4, INK); box(g, 19 - k * 4, -19 + k * 7, 50 + k * 8, 2, S[3]); }
  box(g, 78, -116, 30, 22, INK); box(g, 79, -115, 28, 20, lit() ? '#FFD88A' : '#3A4258'); box(g, 79, -115, 28, 3, '#7A8AA0');
  for (const wx of [w - 26]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -10, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = '#26262C'; g.beginPath(); g.arc(wx, -10, 8, 0, Math.PI * 2); g.fill(); }
};
/** The mothership's walls (a run of them, w wide): riveted panels, the greebles, the light strips (lit live), a door
 *  that'll never open. Feet at 0. */
const paintShipWall = (g: Ctx, w: number, h: number) => {
  const G = pal().gear, R = ramp6('#4A4E5C');
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  bandedGradient(g, 0, -h, w, h, [R[2], R[3], R[3], R[2], R[1]], 6);
  for (let x = 16; x < w - 16; x += 60) {
    box(g, x, -h + 18, 44, h - 36, INK); box(g, x + 1, -h + 19, 42, h - 38, R[2]); box(g, x + 1, -h + 19, 42, 2, R[4]); box(g, x + 1, -h + 19, 2, h - 38, R[4]);
    for (let y = -h + 30; y < -24; y += 36) { box(g, x + 6, y, 30, 14, R[1]); box(g, x + 6, y, 30, 1, R[3]); box(g, x + 9, y + 4, 6, 6, G[2]); box(g, x + 26, y + 3, 6, 8, R[0]); }
    for (let y = -h + 22; y < -20; y += 18) { box(g, x + 3, y, 2, 2, R[0]); box(g, x + 3, y, 1, 1, R[5]); box(g, x + 39, y, 2, 2, R[0]); box(g, x + 39, y, 1, 1, R[5]); }
  }
  // (pipes along it, a hazard band at its foot)
  pipe(g, 0, w, -h + 8, 4, ramp6('#6A6E7A')); pipe(g, 0, w, -30, 3, ramp6('#6A6E7A'));
  for (let x = 0; x < w; x += 12) poly(g, [[x, -12], [x + 6, -12], [x + 12, 0], [x + 6, 0]], '#C8A020');
  box(g, 0, -12, w, 1, INK);
};
/** New New York's rubble: foam chunks painted as broken concrete, rebar, a toppled hot dog cart. Feet at 0. */
const paintRubble = (g: Ctx, seed: number) => {
  const F = pal().foam;
  for (let k = 0; k < 7; k++) {
    const x = -30 + hash(seed * 3 + k) * 80, w = 18 + hash(seed + k * 1.7) * 26, h = 10 + hash(seed * 7 + k) * 22, y = -(k % 3) * 8;
    poly(g, [[x - 1, y + 1], [x + w * 0.2, y - h - 1], [x + w * 0.8, y - h * 0.8 - 1], [x + w + 1, y + 1]], INK);
    poly(g, [[x, y], [x + w * 0.2, y - h], [x + w * 0.8, y - h * 0.8], [x + w, y]], F[3]);
    poly(g, [[x, y], [x + w * 0.2, y - h], [x + w * 0.4, y - h * 0.9], [x + w * 0.3, y]], F[4]);
    poly(g, [[x + w * 0.8, y - h * 0.8], [x + w, y], [x + w * 0.7, y]], F[1]);
  }
  for (let k = 0; k < 3; k++) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-10 + k * 22, -18); g.quadraticCurveTo(-4 + k * 22, -40, 6 + k * 22, -44 - k * 4); g.stroke(); g.strokeStyle = '#8A4A2A'; g.lineWidth = 1.5; g.stroke(); }
  if (seed % 2) { box(g, 34, -30, 40, 20, INK); box(g, 35, -29, 38, 18, '#D8D4CC'); box(g, 35, -29, 38, 4, '#E8B020'); words(g, 'HOT DOGS', 54, -16, plain(1, 1, '#B91C1C')); g.fillStyle = INK; g.beginPath(); g.arc(44, -8, 6, 0, Math.PI * 2); g.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The floor's dressing (cables, apple boxes, sandbags, flight cases, a fog machine): between the sets

const CLUTTER: [number, number][] = [[620, 0], [1500, 1], [2470, 2], [2560, 3], [4520, 4], [6180, 5], [6250, 1], [8180, 2], [9300, 0]];
const paintClutter = (g: Ctx, k: number) => {
  const P = pal().ply;
  if (k === 0) { appleBox(g, -30, 0, 30, 14, P); appleBox(g, -26, -14, 24, 10, P); flightCase(g, 6, 0, 46, 28, 'GRIP'); }
  else if (k === 1) { flightCase(g, -40, 0, 56, 34, 'ELECTRIC'); sandbag(g, 26, 0); sandbag(g, 30, -8, 16); }
  else if (k === 2) { cStand(g, 0, 0, 110); box(g, -4, -114, 34, 26, INK); box(g, -3, -113, 32, 24, '#2A2A30'); box(g, -1, -111, 28, 20, '#F4F0E8'); }
  else if (k === 3) { flightCase(g, -30, 0, 36, 40); flightCase(g, -28, -40, 32, 20); appleBox(g, 10, 0, 30, 14, P); }
  else if (k === 4) { box(g, -24, -20, 48, 20, INK); box(g, -23, -19, 46, 18, '#3A3A44'); box(g, -23, -19, 46, 2, '#5A5A66'); words(g, 'FOG', 0, -8, plain(1, 1, '#F4F0E8')); box(g, 24, -12, 8, 6, '#18181B'); }
  else { sandbag(g, -20, 0); sandbag(g, 0, 0); sandbag(g, -10, -8); flightCase(g, 16, 0, 40, 24, 'CAM'); }
};
/** A cable run snaking along the floor at depth d (black, a lit edge). */
const cable = (c: Ctx, v: View, a: number, b: number, d: number, seed: number) => {
  const eye = v.eye;
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath();
  for (let x = a; x <= b; x += 20) { const dd = d + Math.sin(x * 0.013 + seed) * 0.008, [sx, sy] = at(eye, x, GY, dd); if (x === a) c.moveTo(sx, sy); else c.lineTo(sx, sy); }
  c.stroke();
  c.strokeStyle = '#3A3A44'; c.lineWidth = 1; c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------

/** The sets, each where it stands (at the back of the floor), with their gear and signs. */
export const drawSets = (c: Ctx, v: View, f: number) => {
  const eye = v.eye;
  const on = (a: number, b: number, d = PROP_D) => seenAt(v, X(a), X(b), d);
  // The floor's cables and dressing
  for (const [a, b, d, s] of [[300, 2400, 0.86, 1], [3300, 3720, 0.9, 2], [4300, 6300, 0.87, 3], [6300, 9900, 0.88, 4], [9900, 10690, 0.9, 5]] as const) if (on(a, b, d)) cable(c, v, X(a), X(b), d, s);
  for (const [rx, k] of CLUTTER) if (on(rx - 80, rx + 80, GEAR_D)) atDepth(c, eye, GEAR_D, () => still(c, `hww-clutter-${k}`, X(rx), GY, -70, -150, 140, 152, g => paintClutter(g, k)));

  // SET 1: the rooftop (its cyc, the painted city, the banner, the camera on its dolly, the slate, QUIET ON SET)
  if (on(700, 2600, CYC_D)) {
    cyc(c, v, X(740), X(1500), CYC_H, 1);
    if (on(1540, 2600, CYC_D)) atDepth(c, eye, CYC_D, () => still(c, 'hww-skyline-1', X(1560), GY, -50, -520, 1100, 522, g => paintSkyline(g, 1000, 470, false)));
    atDepth(c, eye, CYC_D, () => still(c, 'hww-banner-1', X(1120), 0, -240, ROOF_Y - 10, 480, 500, g => banner(g, 0, GY - 470, 360, 64, gg => revLogo(gg, 0, GY - 462, 1, 'RESEMBLE'), '#18181B')));
  }
  if (on(700, 1500)) {
    dollyTrack(c, v, X(700), X(1100), GEAR_D + 0.006);
    atDepth(c, eye, GEAR_D, () => { still(c, 'hww-camera', X(840), GY, -60, -175, 124, 177, paintCamera); still(c, 'hww-slate', X(1380), GY, -44, -150, 88, 152, paintSlate); });
  }
  if (on(2300, 2460)) atDepth(c, eye, GEAR_D, () => still(c, 'hww-quiet', X(2380), GY, -90, -170, 180, 172, g => standSign(g, 0, 0, ['QUIET ON SET', 'CLOSED SET. NO PUBLIC.'], plain(1, 1, '#FACC15'), '#18181B', 110)));

  // SET 2: the abyss (its cyc, its sign, HERO FALLS)
  if (on(2600, 4600, CYC_D)) {
    cyc(c, v, X(2640), X(4420), CYC_H + 20, 2);
    atDepth(c, eye, CYC_D, () => still(c, 'hww-banner-2', X(3520), 0, -240, ROOF_Y - 10, 480, 520, g => banner(g, 0, GY - 480, 330, 60, gg => { words(gg, 'HERO FALLS (STUNT)', 0, GY - 480, deco('#ECFCCB', '#14532D', 2, 2)); words(gg, 'HE IS NOT SUPPOSED TO DIE', 0, GY - 460, plain(1, 1, '#F0FDF4')); }, '#14532D')));
  }
  if (on(2680, 2840)) atDepth(c, eye, GEAR_D, () => still(c, 'hww-abyss', X(2760), GY, -100, -170, 200, 172, g => standSign(g, 0, 0, ['THE ABYSS', 'PIT: 40 FT. DO NOT FALL IN.'], plain(1, 1, '#FDE047'), '#14532D', 110)));

  // Video village, craft services, the catering truck, the call sheet
  if (on(4560, 4960)) atDepth(c, eye, GEAR_D, () => still(c, 'hww-village', X(4600), GY, -20, -180, 320, 182, paintVillage));
  if (on(4560, 4800, GEAR_D)) {
    // (the monitors' pictures: the sets, live; the middle one green, the take playing)
    atDepth(c, eye, GEAR_D, () => {
      for (let k = 0; k < 3; k++) {
        const mx = X(4600) + 26 + k * 48, my = GY - 100;
        if (k === 1) { box(c, mx, my, 38, 30, '#1E8A3A'); box(c, mx + 14 + ((f >> 2) % 10), my + 10, 4, 14, '#18181B'); }
        else { box(c, mx, my, 38, 30, k ? '#1E2A5A' : '#3A2A4A'); box(c, mx, my + 22, 38, 8, '#2A2228'); if ((f + k * 20) % 90 < 60) box(c, mx + 2, my + 2, 5, 3, '#EF4444'); }
        box(c, mx, my + ((f + k * 13) % 30), 38, 1, 'rgba(255,255,255,0.12)');
      }
    });
  }
  if (on(4830, 5200)) atDepth(c, eye, GEAR_D, () => still(c, 'hww-craft', X(4960), GY, -110, -170, 340, 172, paintCraftTable));
  if (on(5150, 5500, 0.93)) atDepth(c, eye, 0.93, () => still(c, 'hww-catering', X(5330), GY, -160, -250, 320, 252, paintCatering));
  if (on(5440, 5720)) atDepth(c, eye, GEAR_D, () => { still(c, 'hww-callsheet', X(5550), GY, -62, -200, 124, 202, paintCallSheet); still(c, 'hww-dchair', X(5640), GY, -4, -80, 44, 82, g => chair(g, 0, 'DIRECTOR')); });

  // SET 3: the mothership (its cyc, the ship's walls on it, PYRO: HOT SET, PART 19 OF 40, the crane's base)
  if (on(6300, 8200, CYC_D)) {
    cyc(c, v, X(6340), X(8160), CYC_H + 40, 3);
    atDepth(c, eye, CYC_D, () => {
      for (const [pa, pb] of [[6420, 6980], [7620, 8100]] as const) {
        if (!seenAt(v, X(pa), X(pb), CYC_D)) continue;
        still(c, `hww-ship-${pa}`, X(pa), GY, -4, -384, X(pb) - X(pa) + 8, 386, g => paintShipWall(g, X(pb) - X(pa), 380));
        // (the light strips along it, chasing)
        for (let x = X(pa) + 20, k = 0; x < X(pb) - 30; x += 60, k++) { const lit2 = ((f >> 3) + k) % 4 !== 0; box(c, x + 12, GY - 300, 18, 4, lit2 ? '#22D3EE' : '#0E4E5A'); box(c, x + 12, GY - 300, 18, 1, lit2 ? '#CFFAFE' : '#0E7490'); box(c, x + 14, GY - 120, 4, 4, (f + x) % 60 < 30 ? '#F472B6' : '#5A1A3A'); }
      }
      still(c, 'hww-banner-3', X(7330), 0, -260, ROOF_Y - 10, 520, 530, g => banner(g, 0, GY - 500, 390, 66, gg => revLogo(gg, 0, GY - 494, 1, 'PART 19 OF 40'), '#1E3A8A'));
    });
  }
  if (on(6680, 7100)) atDepth(c, eye, GEAR_D, () => { still(c, 'hww-crane', X(6800), GY, -110, -270, 280, 272, paintCraneBase); still(c, 'hww-pyrosign', X(7000), GY, -100, -170, 200, 172, g => standSign(g, 0, 0, ['PYRO: HOT SET', 'REAL FIRE. FAKE SPACESHIP.'], plain(1, 1, '#FDE047'), '#7C2D12', 110)); });

  // SET 4: the battle of New New York (the burning city, the banner, the rubble, the fire bars)
  if (on(8200, 9600, CYC_D)) {
    atDepth(c, eye, CYC_D, () => {
      if (seenAt(v, X(8280), X(9540), CYC_D)) still(c, 'hww-skyline-2', X(8300), GY, -50, -560, 1320, 562, g => paintSkyline(g, 1220, 500, true));
      still(c, 'hww-banner-4', X(8900), 0, -260, ROOF_Y - 10, 520, 540, g => banner(g, 0, GY - 520, 400, 64, gg => { words(gg, 'THE BATTLE OF NEW NEW YORK', 0, GY - 520, deco('#FDE047', '#7C2D12', 2, 1)); words(gg, 'THE 11TH TIME', 0, GY - 500, plain(1, 1, '#FED7AA')); }, '#7C2D12'));
    });
    // (the fire bars along its foot: gas pipes, their flames licking up the painted city)
    atDepth(c, eye, CYC_D + 0.008, () => {
      for (let x = X(8340); x < X(9500); x += 140) {
        if (!seenAt(v, x - 60, x + 60, CYC_D)) continue;
        pipe(c, x - 40, x + 40, GY - 8, 4, pal().steel);
        for (let k = 0; k < 5; k++) { const fh = 20 + ((f * 3 + k * 37 + x) % 17), fx = x - 32 + k * 16; poly(c, [[fx - 5, GY - 8], [fx, GY - 8 - fh], [fx + 5, GY - 8]], '#E4580E'); poly(c, [[fx - 3, GY - 8], [fx, GY - 8 - fh * 0.6], [fx + 3, GY - 8]], '#F8C040'); }
      }
    });
  }
  for (const [rx, s] of [[8620, 1], [9180, 2], [9400, 3]] as const) if (on(rx - 60, rx + 120, GEAR_D)) atDepth(c, eye, GEAR_D, () => still(c, `hww-rubble-${s}`, X(rx), GY, -40, -60, 140, 62,g => paintRubble(g, s)));

  // The cast's holding area: their trailers, the sign
  if (on(9420, 10000, PROP_D)) {
    atDepth(c, eye, PROP_D, () => { for (const [rx, who] of [[9440, 'SUPERBMAN'], [9560, 'GROAT'], [9820, 'BATTMAN']] as const) if (seenAt(v, X(rx), X(rx) + 130, PROP_D)) still(c, `hww-trailer-${who}`, X(rx), GY, -4, -164, 132, 166, g => paintTrailer(g, who)); });
    if (on(REFILL - 40, REFILL + 180, GEAR_D)) atDepth(c, eye, GEAR_D, () => still(c, 'hww-principal', X(REFILL + 70), GY, -130, -170, 260, 172, g => standSign(g, 0, 0, ['PRINCIPAL CAST ONLY', 'BEYOND THIS POINT. NO EXCEPTIONS.'], plain(1, 1, '#FDE68A'), '#7F1D1D', 110)));
  }

  // The main stage's cyc and its banner (the picture's title)
  if (on(ARENA.a - 50, ARENA.b + 50, CYC_D)) {
    cyc(c, v, X(ARENA.a + 30), X(ARENA.b - 8), CYC_H + 60, 4);
    atDepth(c, eye, CYC_D, () => still(c, 'hww-banner-main', X((ARENA.a + ARENA.b) / 2), 0, -340, ROOF_Y - 10, 680, 540, g => banner(g, 0, GY - 540, 600, 84, gg => revLogo(gg, 0, GY - 528, 2, "END-OF-THE-WORLD'S-DAY"), '#18181B')));
  }
};

void floorY; void revLook; void STEVE; void signText;
export type { Look };
