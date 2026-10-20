// Sillyville Square, painted (the SNES pass): one eye over the whole scene (kit.ts's view), the far off cached per hour
// (far.ts: the sky, the patchwork hills, the water tower, the rest of Cartoon Land, the square's own roofs), the fronts
// back at FRONT_D with their curvy sides, the garden alley behind them, the candy pavement and the street's furniture
// (fronts.ts), and on the play plane, everything he stands on bright and lit along its top (standable reads
// standable), its top going back to the eye where the eye's over it, everything else dimmed:
//
//   THE GROUND       candy cobbles coming toward him (scanline-bent: their joints fan out), a candy-striped curb lit
//                    along its top
//   THE BALL PITS    full to the brim, their balls coming toward him and going back to a padded rim (the bumpers'
//                    stripes along their sides); heaped round the feet of the towers that stand in them
//   THE TOADSTOOLS   spotted caps (their tops going back round), fat gilled stalks
//   SWEET-TOOTH      a three-tier frosted cake of a shop: piped icing, drips, sprinkles, the candy jars in its round
//                    window, a peppermint door, the cherry; its curvy sides and its frosted top going back
//   THE HATTERY      a stack of hats (derby, bowler, fez, topper) with their brims and bands; the trolley's arch, its
//                    signal lamp; its sides and top going back
//   ONE-SCOOP        a giant cone (scenery, dimmed) and its wafer balcony (bright)
//   THE GUMDROP      sugar-crusted on its twisted licorice stalk
//   THE TROLLEY BEAM a candy-striped beam, its top going back
//   THE STUDIO       LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994): a purple drum of a showplace, the film reel,
//                    the marquee's chaser bulbs, poster cases, the doors (the way on), the VISIONARY stand-in
//   THE HEIGHT STICK YOU MUST BE THIS SHORT TO RIDE: a grinning sunflower, its leaf held out at kid height
//
// Signs: the land's cartoon boards on their curly poles (kit.ts toonSign). The revisit (the rides shut for the day):
// popped balloons and confetti about the place, the shops CLOSED.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { bendFloor } from '../../intro/art/kit';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import {
  type Ctx, type View, INK, box, mix, hash, onScreen, viewOf, at, still, polyF, sideBack, topBack, drumTop, ballR, eggR,
  ramp6, rampH, hour, dimmed, lit, toonSign, toonLetters, bandsDown, shadeAcross, candyStroke, glassOf,
  BUBBLEGUM, FROSTING, MINT, LEMON, LILAC, SKY, CHERRY, LICORICE, WAFFLE, GRASS, BRASS, STEEL, LIP,
} from '../kit';
import { GY } from '../geometry';
import { drawKiddieFar } from './far';
import { drawAlley, drawFronts, drawPavement, drawFurniture, frontLamps, PIT_D } from './fronts';
import { shut } from './state';
import {
  PITS, GROUND, SHOP, HATTERY, TOADS, BALCONY, GUMDROP, END_BALCONY, TROLLEY, STUDIO, SIGNS, TOWERS, IN_PIT, X, Y,
} from './layout';

export const drawKiddieBackdrop = (c: Ctx, state: GameState) => { drawKiddieFar(c, state); return true; };

/** How far back the set pieces' sides and tops run. */
const SET_D = 0.9;

// ---------------------------------------------------------------------------------------------------------------
// The ground coming toward him: candy cobbles, bent

const COBS = [BUBBLEGUM, LILAC, MINT, LEMON].map(R => [mix(R[3], '#FFFFFF', 0.25), mix(R[4], '#FFFFFF', 0.3), mix(R[2], '#FFFFFF', 0.2)]);
const cobbles = (c: Ctx) => tilePattern(c, `ct-ki-cob-${timeOfDay().key}`, 96, 40, g => {
  box(g, 0, 0, 96, 40, hour('#A07AA8'));
  for (let r = 0; r < 4; r++) {
    let x = (r % 2) * 7;
    while (x < 96) {
      const w = 12 + Math.floor(hash(r * 31 + x * 0.7) * 6), y = r * 10, C = COBS[Math.floor(hash(r * 13 + x) * 4)].map(cc => hour(cc));
      for (const ox of [0, -96, 96]) {
        const bx = x + ox;
        box(g, bx + 1, y + 1, w - 1, 8, C[0]);
        box(g, bx + 1, y + 1, w - 1, 1, C[1]); box(g, bx + 1, y + 1, 1, 7, C[1]); box(g, bx + 2, y + 2, 2, 1, '#FFFFFF');
        box(g, bx + 1, y + 7, w - 1, 2, C[2]); box(g, bx + w - 1, y + 2, 1, 7, C[2]);
      }
      x += w;
    }
  }
});
/** Balls (the pits'), a pattern at radius r. */
const BALLS = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6', '#FB923C', '#A855F7'];
const ballPattern = (c: Ctx, r: number) => tilePattern(c, `ct-ki-balls-${r}-${timeOfDay().key}`, (r * 2 + 1) * 7, (r * 2 - 1) * 2, g => {
  const tw = (r * 2 + 1) * 7, th = (r * 2 - 1) * 2;
  box(g, 0, 0, tw, th, hour('#2A1E4A'));
  for (let row = 0; row < 3; row++) for (let k = -1; k < 8; k++) {
    const x = k * (r * 2 + 1) + (row % 2 ? r + 0.5 : 0), y = row * (r * 2 - 1), R = ramp6(hour(BALLS[(k * 3 + row * 5 + 70) % BALLS.length]));
    for (const oy of [0, -th, th]) { if (y + oy < -r - 1 || y + oy > th + r + 1) continue; ballR(g, x, y + oy, r, R, false); g.fillStyle = 'rgba(26,16,40,0.35)'; g.beginPath(); g.arc(x, y + oy, r, 0.2, Math.PI - 0.2); g.lineTo(x, y + oy); g.fill(); }
  }
});
/** The ground runs (and the pits' near halves), coming toward him, bent; the curb along the edge, lit. */
const drawNearGround = (c: Ctx, state: GameState, v: View) => {
  const L = state.camera.x - 40, R = state.camera.x + 840, Cb = rampH(['#4A1A30', '#8E2A54', '#E2465E', '#F4F0F4', '#FFFFFF', '#FFFFFF']);
  for (const [ga, gb] of GROUND) {
    // (the first run carries on off the land's start, under where the camera can still see)
    const a = X(ga === GROUND[0][0] ? ga - 700 : ga), b = X(gb), s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    box(c, s, GY, e - s, 700, hour('#6A4A7A'));
    c.fillStyle = cobbles(c); c.fillRect(s, GY + 8, e - s, 600);
    // (a mint gutter, then a flower bed nearer still)
    box(c, s, GY + 40, e - s, 6, hour(MINT[2])); box(c, s, GY + 40, e - s, 1, hour(MINT[4]));
    for (let x = Math.floor(s / 7) * 7; x < e; x += 7) if (hash(x * 0.21) > 0.45) box(c, x, GY + 70 + Math.floor(hash(x) * 20), 3, 3, hour(['#F472B6', '#FDE047', '#FFFFFF', '#C084FC'][Math.floor(hash(x * 3) * 4)]));
    bendFloor(c, v.eye, GY, GY, GY + 150, a, b);
    // (the curb: candy-striped, lit along its top)
    box(c, s, GY, e - s, 10, INK);
    for (let x = Math.floor(s / 16) * 16; x < e; x += 16) { const red = (x / 16) % 2 === 0, C3 = red ? Cb[2] : Cb[3]; box(c, Math.max(s, x), GY + 1, Math.min(16, e - Math.max(s, x)), 8, C3); box(c, Math.max(s, x), GY + 7, Math.min(16, e - Math.max(s, x)), 2, red ? Cb[1] : hour('#C8B8D0')); }
    box(c, s, GY, e - s, 2, LIP[2]); box(c, s, GY, e - s, 1, LIP[3]);
  }
  for (const [pa, pb] of PITS) {
    const a = X(pa), b = X(pb), s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    box(c, s, GY, e - s, 700, hour('#2A1E4A'));
    c.fillStyle = ballPattern(c, 7); c.fillRect(s, GY + 4, e - s, 600);
    bendFloor(c, v.eye, GY, GY, GY + 150, a, b);
  }
};

/** The pits' far halves: the balls going back to the padded rim, the bumpers along their sides. */
const drawPitBacks = (c: Ctx, v: View) => {
  for (const [pa, pb] of PITS) {
    const a = X(pa), b = X(pb);
    if (!onScreenV(v, a - 40, b + 40)) continue;
    // (the balls, in rows: smaller going back)
    const rows = 5;
    for (let i = 0; i < rows; i++) {
      const d0 = PIT_D + ((1 - PIT_D) * i) / rows, d1 = PIT_D + ((1 - PIT_D) * (i + 1)) / rows;
      const pts: [number, number][] = [at(v.eye, a, GY, d0), at(v.eye, b, GY, d0), at(v.eye, b, GY, d1), at(v.eye, a, GY, d1)];
      c.save(); c.beginPath(); pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      c.fillStyle = ballPattern(c, i < 2 ? 4 : 5); c.fillRect(Math.min(pts[0][0], pts[3][0]) - 4, pts[0][1] - 12, Math.max(pts[1][0], pts[2][0]) - Math.min(pts[0][0], pts[3][0]) + 8, pts[3][1] - pts[0][1] + 20);
      c.fillStyle = `rgba(42,30,74,${0.28 - i * 0.05})`; c.fill();
      c.restore();
    }
    // (the padded rim at the back: striped vinyl, a lit top)
    const [ra, ry] = at(v.eye, a, GY, PIT_D), [rb] = at(v.eye, b, GY, PIT_D), rh = 12 * PIT_D;
    box(c, ra, ry - rh, rb - ra, rh, INK);
    for (let x = ra; x < rb; x += 14) box(c, x, ry - rh + 1, Math.min(7, rb - x), rh - 2, dimmed('#E2465E'));
    for (let x = ra + 7; x < rb; x += 14) box(c, x, ry - rh + 1, Math.min(7, rb - x), rh - 2, dimmed('#F8F0F4'));
    box(c, ra, ry - rh + 1, rb - ra, 2, dimmed('#FFFFFF')); box(c, ra, ry - 3, rb - ra, 2, dimmed('#7A2A44'));
    // (the bumpers along its sides, going back)
    for (const [x, s] of [[a, 1], [b, -1]] as [number, number][]) {
      const [nx, ny] = at(v.eye, x, GY, 1), [fx, fy] = at(v.eye, x, GY, PIT_D);
      polyF(c, [[nx - s * 2, ny + 1], [nx + s * 9, ny + 1], [fx + s * 8, fy], [fx - s * 2, fy]], INK);
      polyF(c, [[nx, ny], [nx + s * 7, ny], [fx + s * 6, fy], [fx, fy]], hour('#F8F0F4'));
      for (let k = 0; k < 4; k++) { const u0 = k / 4, u1 = (k + 0.5) / 4; polyF(c, [[nx + (fx - nx) * u0, ny + (fy - ny) * u0], [nx + (fx - nx) * u0 + s * 7, ny + (fy - ny) * u0], [nx + (fx - nx) * u1 + s * 7, ny + (fy - ny) * u1], [nx + (fx - nx) * u1, ny + (fy - ny) * u1]], hour('#E2465E')); }
    }
  }
};
const onScreenV = (v: View, a: number, b: number) => b > v.cam.x - 60 && a < v.cam.x + 860;
/** The balls heaped round the feet of the towers that stand in a pit. */
export const drawPitHeaps = (c: Ctx, state: GameState) => {
  for (const i of IN_PIT) {
    const t = TOWERS[i]; if (!t || !onScreen(state, t.x - 60, t.x + 60)) continue;
    for (let k = 0; k < 13; k++) { const a = Math.PI + (k / 12) * Math.PI, r = 6 + (k % 3); ballR(c, t.x + Math.cos(a) * (26 - (k % 2) * 6), GY + 2 + Math.sin(a) * 9 - (k % 2) * 4, r, ramp6(hour(BALLS[(k * 3 + i) % BALLS.length]))); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The toadstools, the balconies, the gumdrop, the trolley beam

const toadstool = (c: Ctx, v: View, a: number, b: number, h: number, seed: number) => {
  const xa = X(a), xb = X(b), top = Y(h), mx = (xa + xb) / 2, w = xb - xa, capCol = ['#E2283E', '#A855F7', '#F2822A', '#E2468A'][((Math.floor(seed) % 4) + 4) % 4];
  // (the cap's top going back round, spotted)
  if (drumTop(c, v.eye, xa, xb, top, 0.95, rampH(ramp6(capCol)))) {
    const [sx, sy] = at(v.eye, mx - w * 0.2, top, 0.975), [tx, ty] = at(v.eye, mx + w * 0.22, top, 0.965);
    eggR(c, sx, sy, 5, 1.5, rampH(FROSTING), false); eggR(c, tx, ty, 4, 1.2, rampH(FROSTING), false);
  }
  still(c, `ki-toad-${w}-${h}-${seed % 4}`, mx, 0, -w / 2 - 14, top - 6, w + 28, GY - top + 10, g => {
    const S = rampH(FROSTING), C = rampH(ramp6(capCol));
    // (the stalk: fat, bendy, stepped across, a skirt ring)
    const stalk = () => { g.moveTo(-w * 0.18, GY); g.quadraticCurveTo(-w * 0.3, (GY + top) / 2, -w * 0.14, top + 18); g.lineTo(w * 0.14, top + 18); g.quadraticCurveTo(w * 0.04, (GY + top) / 2, w * 0.2, GY); g.closePath(); };
    shadeAcross(g, stalk, -w * 0.3, top + 18, w * 0.5, GY - top - 18, S);
    g.beginPath(); stalk(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    const ry = top + 18 + (GY - top - 18) * 0.25;
    g.fillStyle = INK; g.beginPath(); g.ellipse(-w * 0.02, ry, w * 0.22, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.ellipse(-w * 0.02, ry - 1, w * 0.2, 3.5, 0, 0, Math.PI * 2); g.fill(); box(g, -w * 0.18, ry - 3, w * 0.12, 1, S[5]);
    // (the cap: flat on top (he stands on it), domed under with its gills, white spots, lit along its lip)
    const cap = () => { g.moveTo(-w / 2, top); g.lineTo(w / 2, top); g.quadraticCurveTo(w / 2 + 9, top + 20, w / 2 - 6, top + 23); g.lineTo(-w / 2 + 6, top + 23); g.quadraticCurveTo(-w / 2 - 9, top + 20, -w / 2, top); g.closePath(); };
    bandsDown(g, cap, -w / 2 - 10, top, w + 20, 24, [C[4], C[3], C[3], C[2], C[1]]);
    g.save(); g.beginPath(); cap(); g.clip(); box(g, -w / 2 - 10, top, w * 0.2, 24, 'rgba(255,255,255,0.18)'); box(g, w * 0.3, top, w, 24, 'rgba(26,16,40,0.16)'); g.restore();
    for (let k = -w / 2 + 8; k < w / 2 - 6; k += 4) box(g, k, top + 22, 1, 3, S[1]);
    g.beginPath(); cap(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 4; i++) eggR(g, -w / 2 + 12 + i * (w - 24) / 3, top + 11 + (i % 2) * 3, 4.5, 3.5, S, false);
    box(g, -w / 2 + 2, top, w - 4, 2, LIP[2]); box(g, -w / 2 + 6, top, w / 2, 1, LIP[3]);
  });
};
/** A wafer balcony on curly brackets, lit along its top (its top going back). */
const balcony = (c: Ctx, v: View, a: number, b: number, h: number, col: string[], key: string, toGround = false) => {
  const xa = X(a), xb = X(b), y = Y(h);
  topBack(c, v.eye, xa, xb, y, 1, 0.95, rampH(col), 2);
  still(c, `ki-balc-${key}`, xa, y, -10, -4, b - a + 20, (toGround ? h : 60) + 8, g => {
    const w = b - a, R = rampH(col);
    box(g, -2, -2, w + 4, 16, INK); box(g, 0, 0, w, 12, R[3]); box(g, 0, 0, w, 3, R[4]); box(g, 0, 9, w, 3, R[1]);
    for (let x = 6; x < w; x += 12) { box(g, x, 4, 6, 2, R[2]); box(g, x + 1, 6, 4, 1, R[5]); }
    for (let k = 0; k < Math.floor(w / 14); k++) { g.fillStyle = INK; g.beginPath(); g.arc(7 + k * 14, 12, 7, 0, Math.PI); g.fill(); g.fillStyle = R[2]; g.beginPath(); g.arc(7 + k * 14, 12, 5.5, 0, Math.PI); g.fill(); }
    for (const bx of [12, w - 14]) {
      const path = toGround ? () => { g.moveTo(bx, 12); g.quadraticCurveTo(bx + 2, 60, bx, h); } : () => { g.moveTo(bx, 14); g.quadraticCurveTo(bx + 4, 40, bx + 18, 50); g.quadraticCurveTo(bx + 26, 54, bx + 22, 44); };
      candyStroke(g, path, 4, R, null);
    }
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w / 2, 1, LIP[3]);
  });
};
/** The gumdrop on its twisted licorice stalk, up out of the big pit: sugar-crusted, lit along its top. */
const gumdrop = (c: Ctx, v: View) => {
  const xa = X(GUMDROP.a), xb = X(GUMDROP.b), top = Y(GUMDROP.h), mx = (xa + xb) / 2, w = xb - xa;
  drumTop(c, v.eye, xa + 2, xb - 2, top, 0.95, rampH(MINT));
  still(c, 'ki-gumdrop', mx, 0, -w / 2 - 14, top - 6, w + 28, GY - top + 40, g => {
    const Lq = rampH(LICORICE), M = rampH(MINT);
    candyStroke(g, () => { g.moveTo(0, GY + 30); g.bezierCurveTo(-24, GY - 30, 24, top + 60, 0, top + 20); }, 16, Lq, rampH(CHERRY), 7);
    const drop = () => { g.moveTo(-w / 2, top + 31); g.quadraticCurveTo(-w / 2 - 2, top, -w / 2 + 10, top); g.lineTo(w / 2 - 10, top); g.quadraticCurveTo(w / 2 + 2, top, w / 2, top + 31); g.closePath(); };
    shadeAcross(g, drop, -w / 2, top, w, 32, M);
    g.save(); g.beginPath(); drop(); g.clip(); box(g, -w / 2, top + 26, w, 6, M[1]); for (let i = 0; i < 26; i++) box(g, -w / 2 + 6 + hash(i * 3.1) * (w - 12), top + 4 + hash(i * 7.7) * 24, hash(i) > 0.5 ? 2 : 1, 1, i % 3 ? M[5] : '#FFFFFF'); g.restore();
    g.beginPath(); drop(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    box(g, -w / 2 + 6, top, w - 12, 2, LIP[2]); box(g, -w / 2 + 10, top, w / 2 - 10, 1, LIP[3]);
  });
};
/** The trolley's track: a candy-striped beam, its top going back, lit along it (he walks it). */
const trolleyBeam = (c: Ctx, state: GameState, v: View) => {
  const ra = X(TROLLEY.a), rb = X(TROLLEY.b), y = Y(TROLLEY.h);
  const l = Math.max(ra, state.camera.x - 40), r = Math.min(rb, state.camera.x + 840);
  if (r <= l) return;
  const W2 = rampH(FROSTING), G = rampH(MINT), St = rampH(STEEL);
  topBack(c, v.eye, l, r, y, 1, 0.965, St, 2);
  box(c, l, y - 2, r - l, 19, INK); box(c, l, y, r - l, 15, W2[3]);
  for (let x = Math.floor(l / 24) * 24; x < r; x += 24) { const x0 = Math.max(l, x), ww = Math.min(12, r - x0); if (ww > 0) { box(c, x0, y + 3, ww, 9, G[3]); box(c, x0, y + 3, ww, 2, G[4]); box(c, x0, y + 10, ww, 2, G[2]); } }
  box(c, l, y + 12, r - l, 3, W2[1]);
  box(c, l, y + 2, r - l, 1, W2[5]);
  for (let x = Math.floor(l / 48) * 48 + 20; x < r; x += 48) { box(c, x, y + 6, 3, 3, St[1]); box(c, x, y + 6, 1, 1, St[5]); }
  box(c, l, y, r - l, 2, LIP[2]); box(c, l, y, r - l, 1, LIP[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// THE SWEET-TOOTH SHOPPE

const SHOP_TIERS: [number, number, string[]][] = [[0, 0.42, BUBBLEGUM], [0.42, 0.75, FROSTING], [0.75, 1, LILAC]];
const tierBow = (t: number) => { const tt = SHOP_TIERS.find(([a, b]) => t >= a && t <= b) ?? SHOP_TIERS[0], u = (t - tt[0]) / (tt[1] - tt[0]); return 36 * u * (1 - u); };
const drawSweetShop = (c: Ctx, state: GameState, v: View) => {
  const xa = X(SHOP.a), xb = X(SHOP.b), top = Y(SHOP.h), w = xb - xa, closed = shut(state);
  if (!onScreen(state, xa - 120, xb + 120)) return;
  const Sd = rampH(ramp6('#E06AA0'));
  sideBack(c, v.eye, xa, -1, top, GY, 1, SET_D, Sd, 3, tierBow);
  sideBack(c, v.eye, xb, 1, top, GY, 1, SET_D, Sd, 3, tierBow);
  topBack(c, v.eye, xa - 4, xb + 4, top, 1, SET_D, rampH(FROSTING), 3);
  still(c, `ki-sweet-${closed ? 1 : 0}`, xa, 0, -40, top - 80, w + 80, GY - top + 84, g => {
    const F = rampH(FROSTING);
    for (const [t0, t1, Rm] of SHOP_TIERS) {
      const R = rampH(Rm), y0 = GY - (GY - top) * t1, y1 = GY - (GY - top) * t0;
      const tier = () => { g.moveTo(0, y1); g.quadraticCurveTo(-18, (y0 + y1) / 2, 0, y0); g.lineTo(w, y0); g.quadraticCurveTo(w + 18, (y0 + y1) / 2, w, y1); g.closePath(); };
      shadeAcross(g, tier, -10, y0, w + 20, y1 - y0, R);
      g.save(); g.beginPath(); tier(); g.clip();
      if (Rm === FROSTING) { g.fillStyle = hour(BUBBLEGUM[3]); for (let k = -80; k < w + 80; k += 30) { g.beginPath(); g.moveTo(k, y1); g.lineTo(k + 12, y1); g.lineTo(k + 42, y0); g.lineTo(k + 30, y0); g.closePath(); g.fill(); } g.fillStyle = 'rgba(26,16,40,0.18)'; g.fillRect(w * 0.64, y0, w, y1 - y0); g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(-10, y0, w * 0.2, y1 - y0); }
      if (Rm === LILAC) for (let i = 0; i < 30; i++) box(g, 6 + hash(i * 2.3) * (w - 12), y0 + 8 + hash(i * 5.9) * (y1 - y0 - 14), i % 2 ? 4 : 1, i % 2 ? 1 : 4, hour(['#FDE047', '#F472B6', '#5EEAD4', '#FFFFFF'][i % 4]));
      box(g, -20, y1 - 5, w + 40, 5, R[1]);
      g.restore();
      g.beginPath(); tier(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
      // (the icing piped along each tier's top, drips off it)
      for (let k = 4; k < w - 2; k += 9) { g.fillStyle = INK; g.beginPath(); g.arc(k, y0 + 1, 5.5, 0, Math.PI * 2); g.fill(); }
      for (let k = 4; k < w - 2; k += 9) { g.fillStyle = F[3]; g.beginPath(); g.arc(k, y0 + 1, 4.5, 0, Math.PI * 2); g.fill(); box(g, k - 2, y0 - 2, 2, 2, F[5]); }
      for (let k = 10; k < w - 8; k += 22) { const dl = 6 + ((k * 7) % 11); box(g, k - 4, y0 + 4, 8, dl, INK); box(g, k - 3, y0 + 4, 6, dl - 1, F[3]); box(g, k - 3, y0 + 4, 2, dl - 2, F[5]); box(g, k + 1, y0 + 4, 2, dl - 1, F[1]); g.fillStyle = INK; g.beginPath(); g.arc(k, y0 + 4 + dl, 4, 0, Math.PI); g.fill(); g.fillStyle = F[3]; g.beginPath(); g.arc(k, y0 + 3 + dl, 3, 0, Math.PI); g.fill(); }
    }
    // (the round window: the candy jars on their shelves, glowing)
    const Gl = glassOf().map(cc => hour(cc)), wx = w * 0.3, wy = GY - 54;
    g.fillStyle = INK; g.beginPath(); g.ellipse(wx, wy, 44, 36, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = F[3]; g.beginPath(); g.ellipse(wx, wy, 41, 33, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.ellipse(wx, wy, 36, 28, 0, 0, Math.PI * 2); g.clip();
    for (let i = 0; i < 4; i++) box(g, wx - 40, wy - 30 + i * 15, 80, 16, Gl[4 - i]);
    for (const sy of [wy - 4, wy + 18]) { box(g, wx - 36, sy, 72, 3, hour(WAFFLE[1])); box(g, wx - 36, sy, 72, 1, hour(WAFFLE[4])); for (let i = 0; i < 6; i++) { const jx = wx - 30 + i * 11; box(g, jx - 4, sy - 13, 9, 13, hour('#DDEEF8')); box(g, jx - 3, sy - 9, 7, 8, hour(['#EF4444', '#22C55E', '#FDE047', '#3B82F6', '#EC4899', '#F97316'][(i + (sy > wy ? 3 : 0)) % 6])); box(g, jx - 3, sy - 15, 7, 3, hour(['#E2465E', '#7C5CC8'][i % 2])); box(g, jx - 3, sy - 12, 1, 10, '#FFFFFF'); } }
    box(g, wx - 30, wy - 26, 4, 30, 'rgba(255,255,255,0.5)');
    g.restore();
    g.strokeStyle = hour(BUBBLEGUM[1]); g.lineWidth = 2; g.beginPath(); g.moveTo(wx - 36, wy); g.lineTo(wx + 36, wy); g.moveTo(wx, wy - 28); g.lineTo(wx, wy + 28); g.stroke();
    // (the door: round-topped, a peppermint swirl in its window, a step; CLOSED the revisit)
    const dx = w * 0.72, D3 = rampH(ramp6('#7C2D12'));
    g.fillStyle = INK; g.beginPath(); g.ellipse(dx, GY, 27, 48, 0, Math.PI, 0); g.fill();
    g.save(); g.beginPath(); g.ellipse(dx, GY, 23, 44, 0, Math.PI, 0); g.clip(); shadeAcross(g, () => g.rect(dx - 24, GY - 46, 48, 46), dx - 24, GY - 46, 48, 46, D3); for (let k = -18; k < 20; k += 8) box(g, dx + k, GY - 44, 1, 44, D3[1]); g.restore();
    const px = dx, py = GY - 28;
    g.fillStyle = INK; g.beginPath(); g.arc(px, py, 9, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#FFFFFF' : hour('#E2283E'); g.beginPath(); g.moveTo(px, py); g.arc(px, py, 7.5, (k / 8) * Math.PI * 2 + 0.3, ((k + 1) / 8) * Math.PI * 2 + 0.3); g.closePath(); g.fill(); }
    box(g, dx + 12, GY - 22, 3, 3, hour(BRASS[4]));
    if (closed) { box(g, dx - 17, GY - 54, 34, 10, INK); box(g, dx - 16, GY - 53, 32, 8, hour('#C8283E')); signText(g, 'CLOSED', dx, GY - 46, { sx: 1, sy: 1, fill: '#FFFFFF' }); }
    box(g, dx - 32, GY - 4, 64, 4, F[2]); box(g, dx - 32, GY - 4, 64, 1, F[5]);
    // (the roof: the top tier's frosting, flat and lit (stand on it); a cherry up one end, its stalk; the name)
    box(g, -8, top - 4, w + 16, 12, INK);
    box(g, -6, top - 2, w + 12, 8, F[3]); box(g, -6, top + 3, w + 12, 3, F[2]);
    box(g, -6, top - 2, w + 12, 2, LIP[2]); box(g, -2, top - 2, w * 0.5, 1, LIP[3]);
    ballR(g, w - 30, top - 18, 14, rampH(CHERRY));
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(w - 30, top - 30); g.quadraticCurveTo(w - 24, top - 46, w - 12, top - 52); g.stroke();
    g.strokeStyle = hour('#5E8A2A'); g.lineWidth = 2; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(w - 6, top - 50, 8, 4, -0.4, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#7CC864'); g.beginPath(); g.ellipse(w - 6, top - 50, 6.5, 2.8, -0.4, 0, Math.PI * 2); g.fill();
    signText(g, 'SWEET-TOOTH SHOPPE', w / 2, GY - (GY - top) * 0.86, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDF2F8', '#F9A8D4']));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE HAT-HAT HATTERY

const HAT_BANDS: [number, number, string, string][] = [[0, 0.3, '#7C3AED', '#FDE047'], [0.3, 0.55, '#16A34A', '#F472B6'], [0.55, 0.8, '#DC2626', '#FFFFFF'], [0.8, 1, '#0EA5E9', '#FDE047']];
const hatInset = (t: number) => { const b = HAT_BANDS.find(([a, z]) => t >= a && t <= z) ?? HAT_BANDS[0]; const u = (t - b[0]) / (b[1] - b[0]); return -b[0] * 14 + 24 * u * (1 - u) - 4 * u * u; };
const drawHattery = (c: Ctx, state: GameState, v: View) => {
  const xa = X(HATTERY.a), xb = X(HATTERY.b), top = Y(HATTERY.h), w = xb - xa, closed = shut(state);
  if (!onScreen(state, xa - 120, xb + 160)) return;
  const Sd = rampH(ramp6('#5A6AC8'));
  sideBack(c, v.eye, xa, -1, top, GY, 1, SET_D, Sd, 3, hatInset);
  sideBack(c, v.eye, xb, 1, top, GY, 1, SET_D, Sd, 3, hatInset);
  topBack(c, v.eye, xa + 58, xb - 58, top, 1, SET_D, rampH(SKY), 3);
  still(c, `ki-hattery-${closed ? 1 : 0}`, xa, 0, -30, top - 30, w + 60, GY - top + 34, g => {
    for (const [t0, t1, col, band] of HAT_BANDS) {
      const R = rampH(ramp6(col)), Bd = rampH(ramp6(band)), y0 = GY - (GY - top) * t1, y1 = GY - (GY - top) * t0, inset = t0 * 14;
      const hat = () => { g.moveTo(inset, y1); g.quadraticCurveTo(inset - 12, (y0 + y1) / 2, inset + 4, y0); g.lineTo(w - inset - 4, y0); g.quadraticCurveTo(w - inset + 12, (y0 + y1) / 2, w - inset, y1); g.closePath(); };
      shadeAcross(g, hat, inset - 12, y0, w - inset * 2 + 24, y1 - y0, R);
      g.beginPath(); hat(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
      // (its band, stepped; a bow on the derby, a feather on the bowler)
      box(g, inset + 2, y1 - 13, w - inset * 2 - 4, 8, Bd[3]); box(g, inset + 2, y1 - 13, w - inset * 2 - 4, 2, Bd[4]); box(g, inset + 2, y1 - 7, w - inset * 2 - 4, 2, Bd[1]);
      if (t0 === 0) { ballR(g, w * 0.82, y1 - 9, 6, Bd); ballR(g, w * 0.82 - 9, y1 - 9, 5, Bd); ballR(g, w * 0.82 + 9, y1 - 9, 5, Bd); }
      if (t0 === 0.3) { candyStroke(g, () => { g.moveTo(w * 0.16, y1 - 10); g.quadraticCurveTo(w * 0.1, y1 - 40, w * 0.2, y1 - 52); }, 5, rampH(ramp6('#F472B6')), null); }
      // (each hat's brim: a fat ellipse, lit along its top)
      g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, y1, w / 2 - inset + 13, 7, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = R[2]; g.beginPath(); g.ellipse(w / 2, y1, w / 2 - inset + 11, 5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = R[4]; g.beginPath(); g.ellipse(w / 2 - 6, y1 - 2, w / 2 - inset, 2.5, 0, Math.PI, 0); g.fill();
    }
    // (the fez's tassel off the third hat's side)
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.7, GY - (GY - top) * 0.8 + 2); g.quadraticCurveTo(w * 0.86, GY - (GY - top) * 0.78, w * 0.88, GY - (GY - top) * 0.66); g.stroke();
    ballR(g, w * 0.88, GY - (GY - top) * 0.64, 5, rampH(LEMON));
    // (the door, round-topped; the shop window full of hats)
    const D3 = rampH(LEMON);
    g.fillStyle = INK; g.beginPath(); g.ellipse(w * 0.3, GY, 25, 45, 0, Math.PI, 0); g.fill();
    g.save(); g.beginPath(); g.ellipse(w * 0.3, GY, 21, 41, 0, Math.PI, 0); g.clip(); shadeAcross(g, () => g.rect(w * 0.3 - 22, GY - 42, 44, 42), w * 0.3 - 22, GY - 42, 44, 42, D3); g.restore();
    box(g, w * 0.3 + 10, GY - 20, 3, 3, hour(BRASS[4]));
    if (closed) { box(g, w * 0.3 - 17, GY - 52, 34, 10, INK); box(g, w * 0.3 - 16, GY - 51, 32, 8, hour('#C8283E')); signText(g, 'CLOSED', w * 0.3, GY - 44, { sx: 1, sy: 1, fill: '#FFFFFF' }); }
    // (the trolley's arch out the right side at the track's height, dark inside, a striped surround)
    const ay = Y(TROLLEY.h), Wt = rampH(FROSTING), Rd = rampH(CHERRY);
    g.fillStyle = INK; g.beginPath(); g.moveTo(w - 74, ay + 4); g.lineTo(w - 74, ay - 72); g.quadraticCurveTo(w - 36, ay - 116, w + 4, ay - 72); g.lineTo(w + 4, ay + 4); g.closePath(); g.fill();
    for (let k = 0; k < 9; k++) { const a0 = Math.PI + (k / 9) * Math.PI, a1 = Math.PI + ((k + 1) / 9) * Math.PI; g.fillStyle = k % 2 ? Wt[3] : Rd[3]; g.beginPath(); g.ellipse(w - 35, ay - 70, 36, 40, 0, a0, a1); g.ellipse(w - 35, ay - 70, 30, 34, 0, a1, a0, true); g.closePath(); g.fill(); }
    g.fillStyle = '#120A1E'; g.beginPath(); g.moveTo(w - 64, ay); g.lineTo(w - 64, ay - 68); g.quadraticCurveTo(w - 34, ay - 102, w - 4, ay - 68); g.lineTo(w - 4, ay); g.closePath(); g.fill();
    for (let k = 0; k < 4; k++) box(g, w - 62, ay - 60 + k * 15, 56, 2, 'rgba(60,40,90,0.6)');
    // (the roof: lit)
    box(g, 56, top - 4, w - 112, 12, INK);
    box(g, 58, top - 2, w - 116, 8, hour(SKY[3])); box(g, 58, top + 3, w - 116, 3, hour(SKY[2]));
    box(g, 58, top - 2, w - 116, 2, LIP[2]); box(g, 62, top - 2, (w - 116) / 2, 1, LIP[3]);
    signText(g, 'HAT-HAT HATTERY', w / 2 - 20, GY - (GY - top) * 0.42, toonLetters(1));
    signText(g, closed ? 'TROLLEY CLOSED' : 'SKY-HIGH TROLLEY', w / 2 - 20, GY - (GY - top) * 0.18, toonLetters(1, closed ? ['#FFFFFF', '#FFE4E6', '#FECDD3', '#FB7185'] : ['#FFFFFF', '#FFFFFF', '#FEF9C3', '#FDE047']));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE ONE-SCOOP SHOPPE (scenery) and its balcony

const scoopShop = (c: Ctx, v: View) => {
  const xa = X(BALCONY.a) - 60, w = 280, top = Y(380);
  still(c, 'ki-scoop', xa, 0, -40, top - 150, w + 80, GY - top + 154, g => {
    const Wf = rampH(WAFFLE, true);
    // (a giant cone of a building: the waffle, its criss-cross, a door in its point)
    const cone = () => { g.moveTo(30, top + 80); g.lineTo(w - 30, top + 80); g.lineTo(w / 2 + 40, GY); g.lineTo(w / 2 - 40, GY); g.closePath(); };
    shadeAcross(g, cone, 30, top + 80, w - 60, GY - top - 80, Wf);
    g.save(); g.beginPath(); cone(); g.clip(); g.strokeStyle = Wf[1]; g.lineWidth = 2; for (let k = -300; k < 300; k += 22) { g.beginPath(); g.moveTo(k, top + 80); g.lineTo(k + 300, GY); g.stroke(); g.beginPath(); g.moveTo(k + 300, top + 80); g.lineTo(k, GY); g.stroke(); } g.strokeStyle = Wf[4]; g.lineWidth = 1; for (let k = -300; k < 300; k += 22) { g.beginPath(); g.moveTo(k + 1, top + 80); g.lineTo(k + 301, GY); g.stroke(); } g.restore();
    g.beginPath(); cone(); g.strokeStyle = dimmed(INK); g.lineWidth = 3; g.stroke();
    box(g, w / 2 - 14, GY - 40, 28, 40, dimmed(INK)); box(g, w / 2 - 12, GY - 38, 24, 38, dimmed('#7A3A2A'));
    // (three scoops on top, each stepped, a drip or two, the cherry)
    for (const [sx, sy, r, col] of [[w / 2 - 50, top + 60, 62, '#FBCFE8'], [w / 2 + 50, top + 50, 58, '#BBF7D0'], [w / 2, top - 10, 66, '#FEF3C7']] as [number, number, number, string][]) {
      const R = rampH(ramp6(col), true);
      ballR(g, sx, sy, r, R);
      for (let k = 0; k < 4; k++) { const dx = sx - r * 0.6 + k * r * 0.4; box(g, dx - 4, sy + r * 0.62, 8, 10 + k * 3, R[2]); box(g, dx - 3, sy + r * 0.62, 2, 8 + k * 3, R[4]); }
    }
    ballR(g, w / 2, top - 82, 13, rampH(CHERRY, true));
    signText(g, 'ONE-SCOOP SHOPPE', w / 2, top + 4, toonLetters(1, [dimmed('#FFFFFF'), dimmed('#FFF7C2'), dimmed('#FDE047'), dimmed('#F59E0B')]));
  });
  balcony(c, v, BALCONY.a, BALCONY.b, BALCONY.h, WAFFLE, 'scoop');
};

// ---------------------------------------------------------------------------------------------------------------
// The YOU MUST BE THIS SHORT TO RIDE stick

const heightStick = (c: Ctx, x: number) => {
  still(c, 'ki-stick', x, GY, -70, -200, 170, 204, g => {
    const Gr = rampH(GRASS), Pe = rampH(LEMON), Bd = rampH(BUBBLEGUM);
    candyStroke(g, () => { g.moveTo(0, 0); g.quadraticCurveTo(-8, -60, 0, -120); }, 5, Gr, null);
    // (the hand: a leaf held out flat at the line, the dashes from it)
    eggR(g, 26, -54, 22, 6, Gr);
    for (let k = 0; k < 4; k++) box(g, 12 + k * 7, -55, 4, 1, Gr[1]);
    for (let x2 = 50; x2 < 98; x2 += 8) box(g, x2, -54, 4, 1, '#FFFFFF');
    // (the flower face, grinning)
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; eggR(g, Math.cos(a) * 18, -134 + Math.sin(a) * 18, 9, 5.5, Pe, true, a); }
    ballR(g, 0, -134, 14, rampH(WAFFLE));
    box(g, -6, -140, 4, 4, INK); box(g, 3, -140, 4, 4, INK); box(g, -5, -140, 1, 1, '#FFFFFF'); box(g, 4, -140, 1, 1, '#FFFFFF');
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(0, -132, 7, 0.2, Math.PI - 0.2); g.stroke();
    box(g, -3, -126, 6, 2, '#FFFFFF');
    // (the board on the stalk)
    g.fillStyle = INK; g.beginPath(); g.roundRect(-57, -105, 114, 36, 9); g.fill();
    g.save(); g.beginPath(); g.roundRect(-54, -102, 108, 30, 7); g.clip(); for (let i = 0; i < 5; i++) box(g, -54, -102 + i * 6, 108, 7, [Bd[4], Bd[3], Bd[3], Bd[2], Bd[1]][i]); g.restore();
    box(g, -50, -101, 30, 1, Bd[5]);
    signText(g, 'YOU MUST BE', 0, -89, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDF2F8', '#F9A8D4']));
    signText(g, 'THIS SHORT TO RIDE', 0, -78, toonLetters(1));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The studio's front

const STUDIO_TOP = 420;
const drawStudioFront = (c: Ctx, state: GameState, v: View) => {
  const xa = X(STUDIO.a), xb = X(STUDIO.b) + 200, w = xb - xa, top = Y(STUDIO_TOP), dx = X(STUDIO.door);
  if (!onScreen(state, xa - 200, xb + 40)) return;
  const Pu = rampH(ramp6('#6D28D9'));
  sideBack(c, v.eye, xa, -1, top, GY, 1, 0.86, Pu, 3, t => 28 * t * (1 - t) - 10 * t * t);
  still(c, 'ki-studio', xa, 0, -30, top - 150, w + 60, GY - top + 154, g => {
    const St = rampH(STEEL), Gd = rampH(BRASS), Rd = rampH(CHERRY), Lm = rampH(LEMON);
    // (the building: a fat purple drum, a wavy top, banded across, courses of scalloped trim)
    const body = () => { g.moveTo(0, GY); g.quadraticCurveTo(-14, (GY + top) / 2, 10, top); for (let k = 0; k < 6; k++) g.quadraticCurveTo(10 + (k + 0.5) * (w - 20) / 6, top - 24, 10 + (k + 1) * (w - 20) / 6, top); g.lineTo(w, GY); g.closePath(); };
    shadeAcross(g, body, -14, top - 24, w + 14, GY - top + 24, Pu);
    g.save(); g.beginPath(); body(); g.clip();
    for (const yy of [top + 40, top + 180, GY - 140]) { box(g, -20, yy, w + 40, 8, Pu[2]); box(g, -20, yy, w + 40, 2, Pu[4]); for (let x = -10; x < w + 20; x += 16) { g.fillStyle = Pu[2]; g.beginPath(); g.arc(x, yy + 8, 8, 0, Math.PI); g.fill(); g.fillStyle = Pu[1]; g.fillRect(x - 1, yy + 12, 2, 2); } }
    for (let k = 0; k < 7; k++) { const sx = 26 + k * (w - 52) / 6; for (let y = top + 56; y < top + 170; y += 22) { g.fillStyle = Gd[3]; g.beginPath(); g.moveTo(sx, y - 5); g.lineTo(sx + 2, y - 1); g.lineTo(sx + 6, y); g.lineTo(sx + 2, y + 1); g.lineTo(sx, y + 5); g.lineTo(sx - 2, y + 1); g.lineTo(sx - 6, y); g.lineTo(sx - 2, y - 1); g.closePath(); g.fill(); } }
    g.restore();
    g.beginPath(); body(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    // (the film reel over the door: steel stepped round, its holes, the hub, a strip of film curling off it)
    const rx = dx - xa, ry = top + 90;
    g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 93, 0, Math.PI * 2); g.fill();
    for (const [rr, col] of [[88, St[2]], [84, St[3]], [70, St[4]]] as const) { g.fillStyle = col; g.beginPath(); g.arc(rx - (88 - rr) * 0.2, ry - (88 - rr) * 0.2, rr, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = St[1]; g.beginPath(); g.arc(rx, ry, 88, 0.1, Math.PI * 0.6); g.arc(rx - 6, ry - 6, 84, Math.PI * 0.6, 0.1, true); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3, hx = rx + Math.cos(a) * 52, hy = ry + Math.sin(a) * 52; g.fillStyle = INK; g.beginPath(); g.arc(hx, hy, 23, 0, Math.PI * 2); g.fill(); g.fillStyle = Pu[1]; g.beginPath(); g.arc(hx, hy, 21, 0, Math.PI * 2); g.fill(); g.fillStyle = Pu[0]; g.beginPath(); g.arc(hx + 3, hy + 3, 17, 0, Math.PI * 2); g.fill(); }
    ballR(g, rx, ry, 15, St);
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(rx + 70, ry + 50); g.quadraticCurveTo(rx + 150, ry + 60, rx + 170, ry + 10); g.quadraticCurveTo(rx + 186, ry - 30, rx + 210, ry - 20); g.stroke();
    g.strokeStyle = hour('#3A3448'); g.lineWidth = 12; g.stroke();
    g.setLineDash([3, 5]); g.strokeStyle = hour('#C8C4D8'); g.lineWidth = 9; g.stroke(); g.setLineDash([]);
    g.strokeStyle = hour('#FFE8A0'); g.lineWidth = 5; g.setLineDash([6, 4]); g.stroke(); g.setLineDash([]);
    // (the marquee: a long board with chaser bulbs (live), its letters; EST. 1994 on a little plaque under it)
    g.fillStyle = INK; g.beginPath(); g.roundRect(rx - 252, top + 194, 504, 78, 12); g.fill();
    g.fillStyle = Lm[3]; g.beginPath(); g.roundRect(rx - 248, top + 198, 496, 70, 10); g.fill();
    box(g, rx - 244, top + 199, 488, 2, Lm[5]); box(g, rx - 244, top + 264, 488, 3, Lm[1]);
    g.save(); g.beginPath(); g.roundRect(rx - 238, top + 208, 476, 50, 8); g.clip(); for (let i = 0; i < 5; i++) box(g, rx - 238, top + 208 + i * 10, 476, 11, [Rd[4], Rd[3], Rd[3], Rd[2], Rd[1]][i]); g.restore();
    signText(g, 'LEARN THE MAGIC OF', rx, top + 224, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FEF9C3', '#FDE047']));
    signText(g, 'HOW CARTOONS ARE MADE', rx, top + 242, toonLetters(2));
    box(g, rx + 150, top + 270, 84, 14, INK); box(g, rx + 151, top + 271, 82, 12, Gd[3]); box(g, rx + 151, top + 271, 82, 2, Gd[5]);
    signText(g, 'EST. 1994', rx + 192, top + 281, { sx: 1, sy: 1, bold: true, fill: hour('#3A2208') });
    // (the doors: tall, round-topped, propped open, the dark inside; the velvet rope's brass posts either side)
    g.fillStyle = INK; g.beginPath(); g.moveTo(rx - 62, GY); g.lineTo(rx - 62, GY - 112); g.quadraticCurveTo(rx, GY - 164, rx + 62, GY - 112); g.lineTo(rx + 62, GY); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) { const a0 = Math.PI + (i / 9) * Math.PI, a1 = Math.PI + ((i + 1) / 9) * Math.PI; g.fillStyle = i % 2 ? Lm[3] : Rd[3]; g.beginPath(); g.ellipse(rx, GY - 110, 61, 50, 0, a0, a1); g.ellipse(rx, GY - 110, 54, 43, 0, a1, a0, true); g.closePath(); g.fill(); }
    g.fillStyle = '#0B0614'; g.beginPath(); g.moveTo(rx - 54, GY); g.lineTo(rx - 54, GY - 108); g.quadraticCurveTo(rx, GY - 152, rx + 54, GY - 108); g.lineTo(rx + 54, GY); g.closePath(); g.fill();
    for (let k = 0; k < 5; k++) box(g, rx - 52, GY - 100 + k * 20, 104, 2, 'rgba(90,60,140,0.35)');
    for (const s of [-1, 1]) { const D3 = rampH(ramp6('#5A1A3A')); box(g, rx + s * 54 - (s > 0 ? 0 : 14), GY - 108, 14, 108, INK); box(g, rx + s * 54 - (s > 0 ? -1 : 13), GY - 107, 12, 106, D3[3]); box(g, rx + s * 54 - (s > 0 ? -1 : 13), GY - 107, 3, 106, D3[4]); box(g, rx + s * 54 - (s > 0 ? -10 : 4), GY - 60, 3, 6, Gd[4]); }
    for (const px of [rx - 90, rx + 90]) { box(g, px - 3, GY - 40, 6, 40, INK); box(g, px - 2, GY - 39, 4, 39, Gd[3]); box(g, px - 2, GY - 39, 1, 39, Gd[5]); ballR(g, px, GY - 42, 5, Gd); box(g, px - 8, GY - 3, 16, 3, Gd[2]); }
    // (poster cases either side: the show's poster, the tour's)
    for (const [pxc, title, sub] of [[rx - 250, 'CHELSEA', '& SOCKS!'], [rx + 236, 'COME SEE', 'THE MAGIC']] as [number, string, string][]) {
      box(g, pxc - 34, GY - 140, 68, 96, INK); box(g, pxc - 32, GY - 138, 64, 92, Gd[3]); box(g, pxc - 32, GY - 138, 64, 2, Gd[5]);
      box(g, pxc - 28, GY - 134, 56, 84, hour(title === 'CHELSEA' ? '#5EB4F4' : '#F472B6'));
      if (title === 'CHELSEA') { g.fillStyle = INK; g.beginPath(); g.ellipse(pxc, GY - 98, 16, 14, 0, 0, Math.PI * 2); g.fill(); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(pxc + s * 14, GY - 104); g.lineTo(pxc + s * 12, GY - 120); g.lineTo(pxc + s * 4, GY - 110); g.closePath(); g.fill(); } g.fillStyle = '#F4F0F4'; g.beginPath(); g.ellipse(pxc, GY - 92, 9, 6, 0, 0, Math.PI * 2); g.fill(); box(g, pxc - 7, GY - 102, 4, 4, hour('#9EE64A')); box(g, pxc + 3, GY - 102, 4, 4, hour('#9EE64A')); }
      else { for (let k = 0; k < 3; k++) { g.fillStyle = hour(['#FDE047', '#FFFFFF', '#5EEAD4'][k]); g.beginPath(); g.arc(pxc - 12 + k * 12, GY - 98 + (k % 2) * 6, 6, 0, Math.PI * 2); g.fill(); } }
      signText(g, title, pxc, GY - 64, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF', ink: INK });
      signText(g, sub, pxc, GY - 54, { sx: 1, sy: 1, bold: true, fill: hour('#FDE047'), ink: INK });
      box(g, pxc - 30, GY - 136, 3, 50, 'rgba(255,255,255,0.35)');
    }
    // (a cardboard 1994 animator stand-in by the door: a ponytail, round glasses, a turtleneck, a pencil behind the ear,
    // a smug grin, VISIONARY on his base)
    const sx = rx - 150, Sk = rampH(ramp6('#F0C8A2')), Tn = rampH(ramp6('#2A2430')), Hr = rampH(ramp6('#5A3A22'));
    box(g, sx - 22, GY - 124, 44, 104, INK); box(g, sx - 20, GY - 122, 40, 102, hour('#C8A878'));
    box(g, sx - 18, GY - 92, 36, 72, Tn[3]); box(g, sx - 18, GY - 92, 8, 72, Tn[4]); box(g, sx + 10, GY - 92, 8, 72, Tn[2]); box(g, sx - 12, GY - 94, 24, 6, Tn[4]);
    eggR(g, sx, GY - 104, 13, 14, Sk);
    box(g, sx - 14, GY - 122, 28, 9, Hr[3]); box(g, sx - 14, GY - 122, 28, 2, Hr[4]); box(g, sx + 11, GY - 114, 6, 20, Hr[2]);
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(sx - 5, GY - 106, 4, 0, Math.PI * 2); g.arc(sx + 6, GY - 106, 4, 0, Math.PI * 2); g.stroke();
    box(g, sx - 6, GY - 107, 2, 2, INK); box(g, sx + 5, GY - 107, 2, 2, INK);
    g.beginPath(); g.moveTo(sx - 5, GY - 97); g.quadraticCurveTo(sx + 1, GY - 93, sx + 7, GY - 99); g.stroke();
    box(g, sx - 3, GY - 95, 7, 3, Hr[2]);
    box(g, sx - 20, GY - 116, 16, 3, Lm[3]); box(g, sx - 20, GY - 116, 3, 3, hour('#F4A6C0'));
    box(g, sx - 22, GY - 20, 44, 20, INK); box(g, sx - 21, GY - 19, 42, 18, St[3]); box(g, sx - 21, GY - 19, 42, 2, St[5]);
    signText(g, 'VISIONARY', sx, GY - 6, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#F1F5F9', '#CBD5E1']));
  });
  // (the chaser bulbs round the marquee, live; dark on a revisit? no: the studio's open)
  const rx = dx, ry = top + 194;
  for (let i = 0; i < 26; i++) { const bx = rx - 244 + i * 19.5, on = (state.frame >> 3) % 3 === i % 3; for (const by of [ry + 2, ry + 76]) { c.fillStyle = INK; c.beginPath(); c.arc(bx, by, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = on ? '#FFFFFF' : '#F59E0B'; c.beginPath(); c.arc(bx, by, 3, 0, Math.PI * 2); c.fill(); if (on) { c.fillStyle = '#FFF4C8'; c.fillRect(bx - 1, by - 2, 1, 1); } } }
};

// ---------------------------------------------------------------------------------------------------------------
// The revisit: popped balloons and confetti lying about

const LITTER = [480, 1240, 2300, 3200, 4700, 5900, 6500, 8150, 9300, 10050, 12300, 12900];
const drawLitter = (c: Ctx, state: GameState) => {
  for (const lx of LITTER) {
    const x = X(lx); if (!onScreen(state, x - 40, x + 40)) continue;
    still(c, `ki-litter-${lx}`, x, GY, -30, -10, 60, 14, g => {
      for (let k = 0; k < 3; k++) { const col = BALLS[(lx / 10 + k) % BALLS.length | 0], R = rampH(ramp6(col)); const px = -18 + k * 14 + hash(lx + k) * 6; polyF(g, [[px - 4, 0], [px + 3, -3], [px + 6, -1], [px + 2, 1]], INK); polyF(g, [[px - 3, -1], [px + 3, -2], [px + 5, -1], [px + 1, 0]], R[3]); box(g, px - 1, -2, 2, 1, R[5]); g.strokeStyle = hour('#E8E4F0'); g.lineWidth = 1; g.beginPath(); g.moveTo(px - 3, -1); g.quadraticCurveTo(px - 8, -6, px - 12 + k * 2, -2); g.stroke(); }
      for (let k = 0; k < 14; k++) box(g, -26 + hash(lx * 1.3 + k) * 52, -2 - hash(k + lx) * 3, 2, 1, hour(['#F472B6', '#FDE047', '#5EEAD4', '#FFFFFF', '#C084FC'][k % 5]));
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawKiddieBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state), closed = shut(state);
  drawAlley(c, v);
  drawFronts(c, v, closed);
  drawPavement(c, v);
  drawFurniture(c, v, closed);
  drawStudioFront(c, state, v);
  drawPitBacks(c, v);
  drawNearGround(c, state, v);
  if (closed) drawLitter(c, state);
  for (const [x, h, lines, board, tall] of SIGNS) if (onScreen(state, X(x) - 200, X(x) + 200)) toonSign(c, X(x), Y(h), lines, { board, tall });
  if (onScreen(state, X(860) - 80, X(860) + 120)) heightStick(c, X(860));
  if (onScreen(state, X(BALCONY.a) - 120, X(BALCONY.b) + 160)) scoopShop(c, v);
  drawSweetShop(c, state, v);
  drawHattery(c, state, v);
  if (onScreen(state, X(GUMDROP.a) - 40, X(GUMDROP.b) + 40)) gumdrop(c, v);
  TOADS.forEach(([a, b, h], i) => { if (onScreen(state, X(a) - 30, X(b) + 30)) toadstool(c, v, a, b, h, i); });
  // (the studio square's balcony: a scalloped awning on curly posts down to the street)
  if (onScreen(state, X(END_BALCONY.a) - 40, X(END_BALCONY.b) + 40)) balcony(c, v, END_BALCONY.a, END_BALCONY.b, END_BALCONY.h, SKY, 'end', true);
  trolleyBeam(c, state, v);
};

export const kiddieLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const v = viewOf(state), out = frontLamps(v);
  const dx = X(STUDIO.door);
  if (dx > state.camera.x - 300 && dx < state.camera.x + 1100) out.push({ x: dx, y: Y(STUDIO_TOP) + 230, r: 220, a: 0.6, color: '#FDE047' });
  const sx = X(SHOP.a) + (SHOP.b - SHOP.a) * 0.3;
  if (sx > state.camera.x - 200 && sx < state.camera.x + 1000) out.push({ x: sx, y: GY - 54, r: 90, a: 0.45, color: '#FFD08A' });
  return out;
};
void lit;
