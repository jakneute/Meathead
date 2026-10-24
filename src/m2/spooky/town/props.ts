// The town's furniture at the play plane, every piece standing on the ground and going back in perspective (one eye:
// paint.ts's view): the balconies out from the shops (lit along their lips: stand here) and the gallows' selfie
// station; the solid things (the crate, the BLOOD-COLA machine, the fountain and its gargoyle, the hearse, the arcade's
// roof); the modern conveniences (the gate in, the CRYPT-O ATM, the ADA ramp's sign and its crypt up on the terrace with
// the phone-charging coffin, the gargoyle's security camera, the buggy charger, the castle sign and the stair lift, the
// landing's bench); and the gas lamps (FREE WI-FI). Fronts painted once (stamps); the sides and tops that go back, live.

import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { GY } from '../geometry';
import { X, Y, STAIRS, RAMP, LEDGES, SOLIDS, LAMPS } from './layout';
import { SHOP_D } from './buildings';
import { type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, stamp, board, words, ironPost, textW, steppedGlow, STONE, OAK, IRON, BRASS, LIP, SLATE } from './paint';
import { blood, stencil, print, enamel } from '../letters';

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
const seen = (v: View, a: number, b: number) => b > v.v0 - 200 && a < v.v1 + 200;

/** A box's top and its side going back (from the play plane at (x0..x1, top..bottom) to depth d), the sides he can see. */
const boxBack = (c: Ctx, v: View, x0: number, x1: number, top: number, bottom: number, d: number, topCols: string[], sideCols: string[]) => {
  const eye = v.eye, P = (x: number, y: number, k: number) => at(eye, x, y, k);
  if (eye.x > x1) poly(c, [P(x1, top, 1), P(x1, top, d), P(x1, bottom, d), P(x1, bottom, 1)], sideCols[0]);
  if (eye.x < x0) poly(c, [P(x0, top, 1), P(x0, top, d), P(x0, bottom, d), P(x0, bottom, 1)], sideCols[1] ?? sideCols[0]);
  if (eye.y < top) {
    poly(c, [P(x0, top, 1), P(x1, top, 1), P(x1, top, d), P(x0, top, d)], topCols[0]);
    if (topCols[1]) poly(c, [P(x0, top, 1 - (1 - d) * 0.5), P(x1, top, 1 - (1 - d) * 0.5), P(x1, top, d), P(x0, top, d)], topCols[1]);
  } else if (eye.y > bottom) poly(c, [P(x0, bottom, 1), P(x1, bottom, 1), P(x1, bottom, d), P(x0, bottom, d)], sideCols[1] ?? sideCols[0]);
  // (the edges going back, inked)
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  for (const [x, y] of [[x0, top], [x1, top], [x1, bottom], [x0, bottom]] as const) { const [a, b] = P(x, y, d); c.moveTo(x, y); c.lineTo(a, b); }
  c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The balconies and the gallows

const drawBalcony = (c: Ctx, v: View, x: number, y: number, w: number) => {
  const eye = v.eye, P = (px: number, py: number, k: number) => at(eye, px, py, k), T = 14;
  // (the brackets under it, against the wall)
  atDepth(c, eye, SHOP_D + 0.01, () => {
    for (const bx of [x + 8, x + w - 26]) { poly(c, [[bx - 1, y + T - 1], [bx + 19, y + T - 1], [bx - 1, y + T + 28]], INK); poly(c, [[bx, y + T], [bx + 17, y + T], [bx, y + T + 25]], OAK[2]); box(c, bx, y + T, 3, 22, OAK[4]); }
  });
  // (the floor going back to the wall: its planks from above, its joists from under)
  if (eye.y < y) {
    poly(c, [P(x, y, 1), P(x + w, y, 1), P(x + w, y, SHOP_D), P(x, y, SHOP_D)], OAK[3]);
    for (let k = 1; k < 4; k++) { const d = 1 - (1 - SHOP_D) * k / 4, [a, b] = P(x, y, d), [e] = P(x + w, y, d); box(c, a, b, e - a, 1, OAK[2]); }
  } else if (eye.y > y + T) {
    poly(c, [P(x, y + T, 1), P(x + w, y + T, 1), P(x + w, y + T, SHOP_D), P(x, y + T, SHOP_D)], OAK[1]);
    for (let jx = x + 10; jx < x + w; jx += 24) { const [a, b] = P(jx, y + T, 1), [e, f] = P(jx, y + T, SHOP_D); poly(c, [[a, b], [a + 3, b], [e + 3, f], [e, f]], OAK[0]); }
  }
  // (its rail: iron, the side rails going back to the wall, the front one at the lip)
  const RH = 28;
  for (const ex of [x, x + w]) {
    const [a, b] = P(ex, y - RH, 1), [e, f] = P(ex, y - RH, SHOP_D);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(a, b); c.lineTo(e, f); c.stroke();
    c.strokeStyle = IRON[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(a, b); c.lineTo(e, f); c.stroke();
    for (let k = 1; k < 3; k++) { const d = 1 - (1 - SHOP_D) * k / 3, [p, q] = P(ex, y - RH, d), [, r] = P(ex, y, d); box(c, p - 1, q, 2, r - q, INK); }
  }
  for (let px = x + 4; px < x + w; px += 12) { box(c, px - 1, y - RH, 3, RH, INK); box(c, px, y - RH, 1, RH, IRON[3]); }
  for (let px = x + 10; px < x + w - 4; px += 24) { box(c, px - 2, y - RH + 10, 5, 5, INK); box(c, px - 1, y - RH + 11, 3, 3, IRON[4]); }
  box(c, x - 1, y - RH - 2, w + 2, 5, INK); box(c, x, y - RH - 1, w, 2, IRON[4]); box(c, x, y - RH - 1, w, 1, IRON[5]);
  // (the floor's edge, at the lip: lit, it's to stand on)
  box(c, x - 1, y - 1, w + 2, T + 2, INK);
  box(c, x, y, w, T, OAK[3]); box(c, x, y + T - 4, w, 4, OAK[1]);
  for (let px = x + 18; px < x + w; px += 28) box(c, px, y + 4, 1, T - 8, OAK[1]);
  box(c, x, y, w, 3, LIP[2]); box(c, x, y, w, 1, LIP[3]);
};

/** The gallows, a selfie station: posts, the platform (its top going back), the beam, a ring light where the noose was. */
const drawGallows = (c: Ctx, v: View, x: number, y: number, w: number) => {
  const D = 0.94, eye = v.eye, P = (px: number, py: number, k: number) => at(eye, px, py, k);
  // (the back posts, and the back half of the frame)
  atDepth(c, eye, D, () => { for (const px of [x + 6, x + w - 16]) { box(c, px - 1, y, 12, GY - y, INK); box(c, px, y, 10, GY - y, OAK[2]); } });
  if (eye.y < y) { poly(c, [P(x, y, 1), P(x + w, y, 1), P(x + w, y, D), P(x, y, D)], OAK[4]); for (let k = 1; k < 3; k++) { const [a, b] = P(x, y, 1 - (1 - D) * k / 3), [e] = P(x + w, y, 1 - (1 - D) * k / 3); box(c, a, b, e - a, 1, OAK[2]); } }
  stamp(c, `tn-gallows-${fontIn()}`, x - 40, y - 200, w + 80, GY - y + 204, g => {
    const post = (px: number, top: number, bot: number, wd = 10) => { box(g, px - 1, top - 1, wd + 2, bot - top + 1, INK); box(g, px, top, wd, bot - top, OAK[3]); box(g, px, top, 3, bot - top, OAK[5]); box(g, px + wd - 3, top, 3, bot - top, OAK[1]); };
    post(x + 6, y, GY); post(x + w - 16, y, GY);
    bar2(g, x + 10, y + 14, x + w - 14, GY - 6, 4); bar2(g, x + w - 14, y + 14, x + 10, GY - 6, 4);
    post(x + w - 30, y - 150, y);
    box(g, x + 19, y - 151, w - 38, 12, INK); box(g, x + 20, y - 150, w - 40, 10, OAK[3]); box(g, x + 20, y - 150, w - 40, 2, OAK[5]); box(g, x + 20, y - 142, w - 40, 2, OAK[1]);
    bar2(g, x + w - 30, y - 110, x + w - 70, y - 145, 5);
    box(g, x + 49, y - 140, 2, 52, IRON[4]);
    // (the ring light, lit; its stand; a phone holder)
    for (const [r, col] of [[19, INK], [17, '#FEF9C3'], [14, INK]] as const) { g.strokeStyle = col; g.lineWidth = r === 17 ? 4 : 2; g.beginPath(); g.arc(x + 50, y - 72, r, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 1; g.beginPath(); g.arc(x + 50, y - 72, 17, Math.PI * 1.1, Math.PI * 1.5); g.stroke();
    box(g, x + 47, y - 74, 6, 10, INK); box(g, x + 48, y - 73, 4, 8, '#3B82F6');
    // (a tripod on the platform)
    for (const dx of [-8, 0, 8]) bar2(g, x + w - 50, y - 30, x + w - 50 + dx, y, 2);
    box(g, x + w - 58, y - 38, 16, 9, INK); box(g, x + w - 57, y - 37, 14, 7, IRON[3]); box(g, x + w - 52, y - 36, 4, 4, '#60A5FA');
    board(g, x + w / 2, y - 168, 'SELFIE STATION', '#1E1036', '#E9D5FF');
    board(g, x + w / 2, y - 120 + 0, '#HANGINGOUT', '#1C1917', '#FDE68A', 6);
    // (the platform's edge: lit, it's to stand on)
    box(g, x - 1, y - 1, w + 2, 16, INK); box(g, x, y, w, 14, OAK[3]); box(g, x, y + 10, w, 4, OAK[1]); box(g, x, y, w, 3, LIP[2]); box(g, x, y, w, 1, LIP[3]);
  });
};
/** A plank or beam laid at an angle: inked, lit along its top. */
const bar2 = (g: Ctx, xa: number, ya: number, xb: number, yb: number, w: number) => {
  g.lineCap = 'butt';
  g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.stroke();
  g.strokeStyle = OAK[3]; g.lineWidth = w; g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.stroke();
  g.strokeStyle = OAK[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(xa, ya - w / 3); g.lineTo(xb, yb - w / 3); g.stroke();
};

const drawLedges = (c: Ctx, v: View) => {
  LEDGES.forEach(([rx, h, w], i) => {
    const x = X(rx), y = Y(h);
    if (!seen(v, x, x + w) || i === 3 || i === 4) return;
    if (i === 1) drawGallows(c, v, x, y, w); else drawBalcony(c, v, x, y, w);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The solid things

const lip = (g: Ctx, x: number, y: number, w: number) => { box(g, x, y - 1, w, 3, LIP[2]); box(g, x, y - 1, w, 1, LIP[3]); };
const paintSolid = (g: Ctx, i: number) => {
  const [rx, top, w, base, what] = SOLIDS[i];
  const x = X(rx), y = Y(top), h = top - base, b = Y(base);
  switch (what) {
    case 'crate': {
      box(g, x - 1, y - 1, w + 2, h + 2, INK);
      for (let k = 0; k < 4; k++) { box(g, x, y + k * (h / 4), w, h / 4 - 1, OAK[4 - (k % 2)]); box(g, x, y + k * (h / 4), w, 1, OAK[5]); }
      bar2(g, x + 5, y + 5, x + w - 5, b - 5, 4); bar2(g, x + w - 5, y + 5, x + 5, b - 5, 4);
      box(g, x, y, 5, h, OAK[2]); box(g, x + w - 5, y, 5, h, OAK[1]);
      words(g, 'FRAGILE', x + w / 2, y + h / 2 + 3, '#7F1D1D', 5, null, stencil(5, '#7F1D1D'));
      lip(g, x, y, w); break;
    }
    case 'vending': {
      // BLOOD-COLA: rows of cans behind the glass, the coin slot, the drop; its lit sign at the top
      const R = ['#4A0808', '#7F1D1D', '#991B1B', '#B91C1C', '#DC2626'];
      box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, R[2]); box(g, x, y, 4, h, R[4]); box(g, x + w - 5, y, 5, h, R[1]);
      box(g, x + 6, y + 18, 32, 66, INK); box(g, x + 7, y + 19, 30, 64, '#1A1A22');
      for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) { const col = ['#DC2626', '#F5F5F4', '#16A34A'][(r + k) % 3]; box(g, x + 9 + k * 10, y + 22 + r * 12, 7, 9, col); box(g, x + 9 + k * 10, y + 22 + r * 12, 2, 9, mix(col, '#FFFFFF', 0.4)); box(g, x + 9 + k * 10, y + 29 + r * 12, 7, 2, mix(col, '#000000', 0.4)); }
      box(g, x + 7, y + 19, 2, 64, 'rgba(255,255,255,0.15)');
      box(g, x + 43, y + 21, 12, 24, INK); box(g, x + 44, y + 22, 10, 22, '#D4D4D8'); box(g, x + 48, y + 26, 2, 8, INK); box(g, x + 45, y + 36, 8, 2, '#22C55E');
      box(g, x + 7, b - 27, 46, 14, INK); box(g, x + 8, b - 26, 44, 12, '#09090B'); box(g, x + 8, b - 26, 44, 2, '#3F3F46');
      box(g, x + 3, y + 3, w - 6, 12, INK); box(g, x + 4, y + 4, w - 8, 10, '#FECACA'); box(g, x + 4, y + 4, w - 8, 2, '#FFFFFF');
      words(g, 'BLOOD', x + w / 2, y + 13, '#7F1D1D', 6, null, { ...blood(6, '#991B1B'), ink: undefined, drip: { col: '#7F1D1D', rate: 0.4, len: 4 } });
      words(g, 'COLA', x + 46, y + 60, '#FECACA', 5, null, print(5, '#FECACA'));
      lip(g, x, y, w); break;
    }
    case 'fountain': {
      // The basin's front: stone, coursed, a carved band; its rim (to stand on) lit
      box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, STONE[3]); box(g, x, y, w, 8, STONE[4]); box(g, x, y + 8, w, 1, STONE[1]);
      for (let k = 0; k < 4; k++) { box(g, x + 12 + k * 38, y + 16, 22, 16, STONE[2]); box(g, x + 12 + k * 38, y + 16, 22, 1, STONE[1]); box(g, x + 12 + k * 38, y + 31, 22, 1, STONE[5]); }
      box(g, x, y + h - 6, w, 6, STONE[1]); checker(g, x, y + h - 12, w, 6, STONE[2]);
      lip(g, x, y, w);
      board(g, x + w / 2, y + 26, 'WISHES $1', '#14532D', '#BBF7D0', 6); break;
    }
    case 'statue': {
      // The gargoyle on its pedestal, wings out, spitting into the basin
      const S = STONE;
      box(g, x - 1, y + 23, w + 2, h - 22, INK); box(g, x, y + 24, w, h - 24, S[4]); box(g, x, y + 24, 6, h - 24, S[5]); box(g, x + w - 8, y + 24, 8, h - 24, S[2]);
      box(g, x - 4, y + 22, w + 8, 4, S[5]); box(g, x - 4, h + y - 4, w + 8, 4, S[3]);
      poly(g, [[x - 7, y + 25], [x + w + 7, y + 25], [x + w + 1, y + 5], [x + w / 2 + 9, y - 5], [x + w / 2 - 9, y - 5], [x - 1, y + 5]], INK);
      poly(g, [[x - 5, y + 24], [x + w + 5, y + 24], [x + w, y + 6], [x + w / 2 + 8, y - 3], [x + w / 2 - 8, y - 3], [x, y + 6]], S[3]);
      poly(g, [[x - 5, y + 24], [x + w / 2, y + 24], [x + w / 2 - 8, y - 3], [x, y + 6]], S[4]);
      for (const s of [-1, 1]) { const ex = s < 0 ? x - 2 : x + w + 2; poly(g, [[ex, y + 4], [ex + s * 18, y - 14], [ex + s * 14, y - 4], [ex + s * 20, y + 2], [ex, y + 14]], INK); poly(g, [[ex, y + 5], [ex + s * 16, y - 11], [ex + s * 12, y - 3], [ex + s * 17, y + 2], [ex, y + 12]], s < 0 ? S[4] : S[2]); }
      box(g, x + 10, y + 6, 4, 3, '#FDE047'); box(g, x + w - 14, y + 6, 4, 3, '#FDE047');
      box(g, x + w / 2 - 6, y + 12, 12, 4, INK);
      box(g, x - 6, y - 5, w + 12, 2, S[6]); break;
    }
    case 'hearse': {
      // A hearse, parked, nose to the left: VALET ONLY (its roof to stand on). A long black fifties coach: the hood and
      // its chrome grille, a skeleton chauffeur in his cap at the wheel, the long window behind him curtained in purple
      // velvet (tied back: the casket's brass rail and a wreath), the vinyl landau panel and its chrome S-bar, a tail fin
      // with a bullet tail light, whitewalls, chrome everywhere; the black in banded steps, dithered between, the sky's
      // sheen raked across it
      const K = ['#050508', '#0E0E14', '#18181F', '#26262E', '#3A3A44', '#5A5A66'];
      const CH = ['#3F3F46', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];
      const belt = y + 20, rock = b - 16, wy = b - 10;
      const shell: [number, number][] = [[x - 2, b - 10], [x - 2, belt + 2], [x + 2, belt], [x + 30, belt - 2], [x + 42, y + 1], [x + w - 8, y + 1], [x + w - 3, y + 6], [x + w, belt - 2], [x + w + 3, belt + 4], [x + w + 3, b - 10]];
      poly(g, shell.map(([px, py]) => [px + (px < x + w / 2 ? -1 : 1), py - (py < belt ? 1 : 0)] as [number, number]), INK);
      poly(g, shell, K[2]);
      // (the body's steps: lit along the beltline, darker toward the rocker, dithered between)
      box(g, x - 1, belt, w + 3, 4, K[4]); checker(g, x - 1, belt + 4, w + 3, 2, K[3]);
      box(g, x - 1, belt + 6, w + 3, 10, K[3]); checker(g, x - 1, belt + 16, w + 3, 2, K[2]);
      box(g, x - 1, rock - 6, w + 3, 6, K[1]); checker(g, x - 1, rock - 8, w + 3, 2, K[1]);
      box(g, x - 1, rock, w + 3, 6, K[0]);
      // (the chrome spear down its flank, and the rocker strip)
      box(g, x + 4, belt + 9, w - 10, 2, CH[2]); box(g, x + 4, belt + 9, w - 10, 1, CH[4]);
      box(g, x, rock - 1, w + 2, 2, CH[1]); box(g, x, rock - 1, w + 2, 1, CH[3]);
      // (the hood: a lit crown line, a winged-skull ornament on the nose)
      box(g, x + 2, belt - 1, 28, 1, K[5]); box(g, x + 6, belt + 1, 22, 1, K[4]);
      box(g, x + 4, belt - 5, 4, 3, CH[3]); box(g, x + 2, belt - 4, 2, 1, CH[2]); box(g, x + 8, belt - 4, 2, 1, CH[2]); box(g, x + 5, belt - 4, 1, 1, INK); box(g, x + 7, belt - 4, 1, 1, INK);
      // (the glass: the windshield raked and the driver's window, tinted)
      const glass = (pts: [number, number][], inner: [number, number][]) => { poly(g, pts, INK); poly(g, inner, '#1C1A2A'); };
      glass([[x + 31, belt - 1], [x + 42, y + 2], [x + 47, y + 2], [x + 47, belt - 1]], [[x + 33, belt - 2], [x + 43, y + 3], [x + 46, y + 3], [x + 46, belt - 2]]);
      glass([[x + 48, y + 2], [x + 75, y + 2], [x + 75, belt - 1], [x + 48, belt - 1]], [[x + 49, y + 3], [x + 74, y + 3], [x + 74, belt - 2], [x + 49, belt - 2]]);
      for (let k = 0; k < 6; k++) box(g, x + 36 + k, belt - 4 - k * 2, 1, 2, 'rgba(200,190,230,0.22)');
      // (the chauffeur: a skull under a peaked cap, a bony hand on the wheel)
      box(g, x + 56, y + 5, 12, 4, INK); box(g, x + 55, y + 8, 15, 2, INK); box(g, x + 57, y + 6, 10, 2, '#27272A'); box(g, x + 57, y + 6, 10, 1, '#52525B'); box(g, x + 56, y + 8, 13, 1, CH[1]);
      box(g, x + 57, y + 10, 10, 8, '#D6D3C4'); box(g, x + 57, y + 10, 3, 8, '#F5F3E7'); box(g, x + 65, y + 10, 2, 8, '#A8A491');
      box(g, x + 58, y + 12, 3, 3, INK); box(g, x + 63, y + 12, 3, 3, INK); box(g, x + 61, y + 15, 2, 1, INK);
      for (let k = 0; k < 4; k++) box(g, x + 58 + k * 2, y + 17, 1, 1, INK);
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.ellipse(x + 51.5, belt - 5.5, 1.5, 4, 0, 0, Math.PI * 2); g.stroke();
      box(g, x + 52, belt - 7, 5, 1, '#D6D3C4'); box(g, x + 52, belt - 5, 4, 1, '#D6D3C4');
      // (the B-pillar)
      box(g, x + 76, y + 2, 4, belt - y - 2, K[1]); box(g, x + 76, y + 2, 1, belt - y - 2, K[4]);
      // (the long window: the casket's lid and its brass rail, a wreath; purple velvet pleated and tied back with gold tassels)
      const lw0 = x + 81, lw1 = x + 127;
      box(g, lw0 - 1, y + 2, lw1 - lw0 + 2, belt - y - 3, INK); box(g, lw0, y + 3, lw1 - lw0, belt - y - 5, '#120E1C');
      box(g, lw0 + 10, belt - 9, lw1 - lw0 - 20, 6, '#3B2416'); box(g, lw0 + 10, belt - 9, lw1 - lw0 - 20, 1, '#6E4A30'); box(g, lw0 + 10, belt - 6, lw1 - lw0 - 20, 1, '#C8A040');
      for (const hx of [lw0 + 14, lw0 + 20, lw0 + 26]) box(g, hx, belt - 5, 2, 1, '#FDE68A');
      g.strokeStyle = '#14532D'; g.lineWidth = 2; g.beginPath(); g.arc(lw1 - 16, belt - 13, 4, 0, Math.PI * 2); g.stroke();
      box(g, lw1 - 19, belt - 15, 1, 1, '#DC2626'); box(g, lw1 - 14, belt - 11, 1, 1, '#F5F5F4'); box(g, lw1 - 13, belt - 16, 1, 1, '#DC2626');
      for (const [cx0, dir] of [[lw0, 1], [lw1, -1]] as const) {
        poly(g, [[cx0, y + 3], [cx0 + dir * 11, y + 3], [cx0 + dir * 4, belt - 9], [cx0 + dir * 8, belt - 2], [cx0, belt - 2]], '#4A1D5E');
        for (let k = 2; k < 10; k += 3) box(g, cx0 + dir * k - (dir < 0 ? 1 : 0), y + 4, 1, 7 - Math.abs(k - 5), '#6B2E86');
        box(g, cx0 + dir * 3 - 1, belt - 11, 3, 3, '#C8A040'); box(g, cx0 + dir * 3, belt - 8, 1, 3, '#FDE68A');
      }
      box(g, lw0, y + 3, lw1 - lw0, 2, '#3B1550');
      for (let k = lw0; k < lw1; k += 4) box(g, k, y + 5, 2, 1, '#6B2E86');
      // (the landau panel: padded vinyl, its stitching, the chrome S-bar)
      const l0 = x + 130, l1 = x + w - 6;
      poly(g, [[l0, y + 2], [l1 - 3, y + 2], [l1, y + 7], [l1, belt - 1], [l0, belt - 1]], '#0A0A0E');
      for (let k = l0 + 3; k < l1 - 2; k += 3) box(g, k, y + 4, 1, 1, '#26262E');
      g.strokeStyle = CH[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(l0 + 4, belt - 4); g.bezierCurveTo(l0 + 14, belt - 4, l0 + 10, y + 7, l1 - 6, y + 8); g.stroke();
      g.strokeStyle = CH[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(l0 + 4, belt - 5); g.bezierCurveTo(l0 + 14, belt - 5, l0 + 10, y + 6, l1 - 6, y + 7); g.stroke();
      // (the doors' seams and their chrome handles)
      for (const sx of [x + 47, x + 78]) box(g, sx, belt, 1, rock - belt - 2, K[0]);
      for (const hx of [x + 68, x + 98]) { box(g, hx, belt + 4, 6, 2, INK); box(g, hx, belt + 4, 5, 1, CH[3]); }
      // (the tail fin, a bullet tail light in it; the rear bumper, the plate, the exhaust and a last breath out of it)
      poly(g, [[x + w - 26, belt + 1], [x + w + 1, belt - 7], [x + w + 4, belt - 6], [x + w + 4, belt + 4]], INK);
      poly(g, [[x + w - 24, belt + 1], [x + w + 1, belt - 6], [x + w + 3, belt + 3]], K[4]);
      box(g, x + w - 1, belt - 5, 4, 4, '#7F1D1D'); box(g, x + w, belt - 4, 2, 2, '#EF4444'); box(g, x + w, belt - 4, 1, 1, '#FECACA');
      box(g, x + w - 4, b - 15, 9, 5, INK); box(g, x + w - 3, b - 14, 8, 3, CH[2]); box(g, x + w - 3, b - 14, 8, 1, CH[4]);
      box(g, x + w - 18, b - 14, 9, 5, INK); box(g, x + w - 17, b - 13, 7, 3, '#E7E5E4'); box(g, x + w - 16, b - 12, 5, 1, '#1E3A8A');
      box(g, x + w - 8, b - 9, 10, 3, INK); box(g, x + w - 7, b - 8, 8, 1, CH[1]);
      for (const [px, py, r, a] of [[x + w + 6, b - 9, 3, 0.18], [x + w + 12, b - 12, 4, 0.12], [x + w + 20, b - 15, 5, 0.07]] as const) { g.globalAlpha = a; g.fillStyle = '#A1A1AA'; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
      // (the nose: the grille's chrome bars, the headlights (one lit, one dead), the front bumper)
      box(g, x - 4, belt + 2, 6, rock - belt - 4, INK); box(g, x - 3, belt + 3, 4, rock - belt - 6, CH[1]);
      for (let k = belt + 4; k < rock - 3; k += 2) box(g, x - 3, k, 4, 1, CH[3]);
      g.fillStyle = INK; g.beginPath(); g.arc(x + 5, belt + 5, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FDE68A'; g.beginPath(); g.arc(x + 5, belt + 5, 2.5, 0, Math.PI * 2); g.fill(); box(g, x + 4, belt + 4, 1, 1, '#FFFFFF');
      g.fillStyle = INK; g.beginPath(); g.arc(x + 12, belt + 5, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#44403C'; g.beginPath(); g.arc(x + 12, belt + 5, 2, 0, Math.PI * 2); g.fill();
      box(g, x - 6, b - 15, 12, 5, INK); box(g, x - 5, b - 14, 11, 3, CH[2]); box(g, x - 5, b - 14, 11, 1, CH[4]);
      // (the sky's sheen: pale streaks raked across the black)
      for (const sx of [x + 18, x + 104, x + 140]) for (let k = 0; k < 10; k++) { box(g, sx + k, belt + 13 - k, 2, 1, 'rgba(200,190,230,0.16)'); if (k % 2) box(g, sx + k + 3, belt + 13 - k, 1, 1, 'rgba(200,190,230,0.1)'); }
      // (the wheels: the arches dark, chrome-lipped; whitewalls, chrome caps and their spinner bars, a highlight)
      for (const wx of [x + 34, x + w - 34]) {
        g.fillStyle = INK; g.beginPath(); g.arc(wx, wy, 17, Math.PI, 0); g.fill();
        g.strokeStyle = CH[2]; g.lineWidth = 1; g.beginPath(); g.arc(wx, wy, 16.5, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
        g.fillStyle = INK; g.beginPath(); g.arc(wx, wy, 13, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#141418'; g.beginPath(); g.arc(wx, wy, 12, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#D6D3D1'; g.beginPath(); g.arc(wx, wy, 8.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#141418'; g.beginPath(); g.arc(wx, wy, 6.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = CH[2]; g.beginPath(); g.arc(wx, wy, 5.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = CH[3]; g.beginPath(); g.arc(wx - 1, wy - 1, 3.5, 0, Math.PI * 2); g.fill();
        box(g, wx - 5, wy, 10, 1, CH[1]); box(g, wx, wy - 5, 1, 10, CH[1]);
        box(g, wx - 1, wy - 1, 2, 2, CH[4]); box(g, wx - 3, wy - 4, 2, 1, '#FFFFFF');
      }
      // (the roof's drip rail, and its lip: lit, to stand on)
      box(g, x + 42, y + 2, w - 50, 1, CH[1]);
      box(g, x + 42, y - 1, w - 50, 3, LIP[2]); box(g, x + 42, y - 1, w - 50, 1, LIP[3]);
      ironPost(g, x - 28, y - 30, b, 4);
      board(g, x - 28, y - 40, 'HEARSE PARKING - VALET ONLY', '#1C1917', '#FDE68A', 6); break;
    }
    case 'arcade': {
      // The arcade's roof: a stone entablature on columns (to stand on); its board
      box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, STONE[3]); box(g, x, y, w, 6, STONE[4]); box(g, x, y + h - 5, w, 5, STONE[1]);
      for (let k = x + 6; k < x + w - 6; k += 12) box(g, k, y + h - 5, 6, 3, STONE[2]);
      lip(g, x, y, w);
      for (let k = 0; k <= 6; k++) {
        const cx = x + 10 + k * ((w - 30) / 6), ch = GY - y - h;
        box(g, cx - 5, y + h, 24, 7, INK); box(g, cx - 4, y + h, 22, 6, STONE[4]); box(g, cx - 4, y + h, 22, 1, STONE[5]);
        box(g, cx - 1, y + h + 6, 16, ch - 12, INK); box(g, cx, y + h + 6, 14, ch - 12, STONE[4]); box(g, cx, y + h + 6, 4, ch - 12, STONE[5]); box(g, cx + 10, y + h + 6, 4, ch - 12, STONE[2]);
        for (let fx = cx + 5; fx < cx + 10; fx += 3) box(g, fx, y + h + 8, 1, ch - 16, STONE[3]);
        box(g, cx - 5, GY - 7, 24, 7, INK); box(g, cx - 4, GY - 6, 22, 6, STONE[3]); box(g, cx - 4, GY - 6, 22, 1, STONE[5]);
      }
      board(g, x + w / 2, y + h / 2 + 1, 'THE GRAND ARCADE - NO LOITERING', '#1E1036', '#E9D5FF', 6); break;
    }
  }
};

const solidBack = (c: Ctx, v: View, i: number) => {
  const [rx, top, w, base, what] = SOLIDS[i];
  const x = X(rx), y = Y(top), b = Y(base);
  if (what === 'crate') boxBack(c, v, x, x + w, y, b, 0.95, [OAK[4], OAK[3]], [OAK[2], OAK[3]]);
  else if (what === 'vending') boxBack(c, v, x, x + w, y, b, 0.95, ['#7F1D1D'], ['#4A0808', '#991B1B']);
  else if (what === 'fountain') {
    // (the basin's top: its rim round the water, green and scummy, going back)
    const eye = v.eye, P = (px: number, py: number, k: number) => at(eye, px, py, k), D = 0.88;
    boxBack(c, v, x, x + w, y, b, D, [STONE[4]], [STONE[2], STONE[3]]);
    if (eye.y < y) {
      poly(c, [P(x + 8, y, 0.99), P(x + w - 8, y, 0.99), P(x + w - 8, y, D + 0.01), P(x + 8, y, D + 0.01)], '#2E4A12');
      poly(c, [P(x + 8, y, 0.97), P(x + w - 8, y, 0.97), P(x + w - 8, y, 0.94), P(x + 8, y, 0.94)], '#4D7C0F');
      const [a, b2] = P(x + 30, y, 0.95); box(c, a, b2, 20, 1, '#86EFAC');
    }
  } else if (what === 'hearse') boxBack(c, v, x + 40, x + w - 8, y, y + 16, 0.95, ['#26262E'], ['#0E0E14']);
  else if (what === 'arcade') {
    // (the colonnade going back: its back row of columns and the wall under it, arcade cabinets glowing (dim) in its
    // shade; the roof's top going back)
    const D = 0.86, h = top - base, eye = v.eye;
    atDepth(c, eye, D, () => {
      box(c, x - 1, y, w + 2, GY - y, INK); box(c, x, y + h, w, GY - y - h, STONE[1]);
      for (let k = 0; k < 6; k++) {
        const cx = x + 40 + k * ((w - 80) / 5);
        box(c, cx - 15, GY - 64, 30, 64, INK); box(c, cx - 14, GY - 63, 28, 63, ['#1E3A8A', '#7F1D1D', '#14532D'][k % 3]);
        box(c, cx - 10, GY - 58, 20, 16, '#0A0A12'); box(c, cx - 9, GY - 57, 18, 14, ['#22D3EE', '#F472B6', '#A3E635'][k % 3]);
        box(c, cx - 9, GY - 57, 18, 3, '#FFFFFF');
        box(c, cx - 12, GY - 38, 24, 6, '#18181B'); box(c, cx - 6, GY - 37, 3, 3, '#EF4444'); box(c, cx + 2, GY - 37, 3, 3, '#FDE047');
      }
      for (let k = 0; k <= 6; k++) { const cx = x + 10 + k * ((w - 30) / 6); box(c, cx - 1, y + h, 16, GY - y - h, INK); box(c, cx, y + h, 14, GY - y - h, STONE[2]); box(c, cx, y + h, 3, GY - y - h, STONE[3]); }
    });
    boxBack(c, v, x, x + w, y, y + h, D, [STONE[4], STONE[3]], [STONE[2], STONE[3]]);
  }
};

const drawSolids = (c: Ctx, v: View) => {
  SOLIDS.forEach(([rx, top, w], i) => {
    if (!seen(v, X(rx) - 60, X(rx) + w + 60)) return;
    solidBack(c, v, i);
    stamp(c, `tn-solid${i}-${fontIn()}`, X(rx) - 220, Y(top) - 100, w + 440, top + 120, g => paintSolid(g, i));
  });
  // (the fountain's water, spat out by the gargoyle: live, in pixels)
  const sx = X(1080), sy = Y(150);
  if (seen(v, sx - 100, sx + 100)) for (let k = 0; k < 6; k++) { const t = (v.f * 0.04 + k / 6) % 1; box(c, sx - 22 - t * 50, sy + t * t * 50, 3, 3, '#86EFAC'); box(c, sx + 22 + t * 50, sy + t * t * 50, 3, 3, '#86EFAC'); box(c, sx - 21 - t * 50, sy + t * t * 50, 1, 1, '#F0FDF4'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The modern conveniences (and the rest of the town's furniture), each with its sign on it

/** A crypt (a little temple of stone): pediment, columns, the black doorway; its roof going back. */
const cryptBack = (c: Ctx, v: View, cx: number, base: number, w: number, h: number) => {
  const D = 0.88, x0 = cx - w / 2, x1 = cx + w / 2;
  boxBack(c, v, x0, x1, base - h, base, D, [STONE[3]], [STONE[2], STONE[3]]);
  const eye = v.eye, P = (x: number, y: number, k: number) => at(eye, x, y, k), peak = base - h - w * 0.32;
  // (the roof's slope he can see)
  const side = eye.x > cx ? 1 : -1, ex = side > 0 ? x1 + 12 : x0 - 12;
  poly(c, [P(ex, base - h, 1), P(cx, peak, 1), P(cx, peak, D), P(ex, base - h, D)], SLATE[side > 0 ? 3 : 4]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); const [a, b] = P(cx, peak, 1), [e, f] = P(cx, peak, D); c.moveTo(a, b); c.lineTo(e, f); c.stroke();
};
const paintCrypt = (g: Ctx, cx: number, base: number, w: number, h: number) => {
  const x0 = cx - w / 2, top = base - h, peak = top - w * 0.32, S = STONE;
  box(g, x0 - 1, top - 1, w + 2, h + 1, INK);
  for (let y = top, row = 0; y < base; y += 16, row++) for (let x = x0 + (row % 2) * -12; x < x0 + w; x += 24) { const xa = Math.max(x0, x), xb = Math.min(x0 + w, x + 24); box(g, xa, y, xb - xa - 1, 15, S[hash(x + y) > 0.6 ? 4 : 3]); box(g, xa, y, xb - xa - 1, 1, S[5]); }
  poly(g, [[x0 - 16, top + 2], [cx, peak - 2], [x0 + w + 16, top + 2]], INK);
  poly(g, [[x0 - 13, top], [cx, peak + 1], [x0 + w + 13, top]], S[4]);
  poly(g, [[x0 - 13, top], [cx, peak + 1], [cx, peak + 8], [x0 - 4, top]], S[5]);
  poly(g, [[x0 + 8, top - 4], [cx, peak + 12], [x0 + w - 8, top - 4]], S[2]);
  box(g, x0 - 14, top - 2, w + 28, 7, INK); box(g, x0 - 13, top - 1, w + 26, 5, S[4]); box(g, x0 - 13, top - 1, w + 26, 1, S[5]);
  for (const px of [x0 + 8, x0 + w - 26]) { box(g, px - 1, top + 6, 20, h - 6, INK); box(g, px, top + 6, 18, h - 6, S[4]); box(g, px, top + 6, 5, h - 6, S[5]); box(g, px + 13, top + 6, 5, h - 6, S[2]); box(g, px - 3, top + 6, 24, 5, S[5]); box(g, px - 3, base - 6, 24, 6, S[3]); }
  box(g, x0, base - 4, w, 4, S[2]);
};
export const paintGag = (g: Ctx, i: number) => {
  switch (i) {
    case 0: { // the gate in: stone pillars capped with urns, the iron arch and its bars, its sign
      const x = X(250);
      for (const px of [x - 134, x + 102]) {
        box(g, px - 1, GY - 201, 34, 201, INK);
        for (let y = GY - 200, r = 0; y < GY; y += 16, r++) { box(g, px, y, 32, 15, STONE[r % 2 ? 3 : 4]); box(g, px, y, 32, 1, STONE[5]); box(g, px + (r % 2 ? 10 : 20), y, 1, 15, STONE[1]); }
        box(g, px, GY - 200, 6, 200, STONE[5]); box(g, px + 26, GY - 200, 6, 200, STONE[2]);
        box(g, px - 5, GY - 208, 42, 10, INK); box(g, px - 4, GY - 207, 40, 8, STONE[4]); box(g, px - 4, GY - 207, 40, 2, STONE[6]);
        g.fillStyle = INK; g.beginPath(); g.ellipse(px + 16, GY - 222, 13, 15, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = STONE[4]; g.beginPath(); g.ellipse(px + 16, GY - 222, 11, 13, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = STONE[5]; g.beginPath(); g.ellipse(px + 12, GY - 226, 5, 6, 0, 0, Math.PI * 2); g.fill();
        box(g, px + 12, GY - 240, 8, 6, STONE[3]);
      }
      // (the arch: iron, scrolled, its bars hanging down, spikes along the top)
      for (const [col, lw] of [[INK, 9], [IRON[3], 5], [IRON[5], 1]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x - 102, GY - 196); g.quadraticCurveTo(x, GY - 252, x + 102, GY - 196); g.stroke(); }
      for (let px = x - 90; px <= x + 90; px += 15) { const ty = GY - 196 - (1 - ((px - x) / 102) ** 2) * 27; box(g, px - 1, ty, 3, GY - 150 - ty, INK); box(g, px, ty, 1, GY - 150 - ty, IRON[4]); poly(g, [[px - 3, GY - 150], [px + 4, GY - 150], [px, GY - 140]], INK); }
      for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(x + s * 60, GY - 180, 10, 0, Math.PI * 2); g.stroke(); g.strokeStyle = IRON[4]; g.lineWidth = 1; g.stroke(); }
      board(g, x, GY - 232, 'WELCOME TO SPOOKY LAND', '#2E1065', '#BBF7D0');
      break;
    }
    case 1: { // the crypt with the ATM in it
      const x = X(2240);
      paintCrypt(g, x, GY, 120, 130);
      box(g, x - 23, GY - 101, 46, 101, INK); box(g, x - 22, GY - 100, 44, 100, '#120E18');
      box(g, x - 17, GY - 91, 34, 24, INK); box(g, x - 16, GY - 90, 32, 22, '#22D3EE'); box(g, x - 16, GY - 90, 32, 3, '#A5F3FC'); box(g, x - 12, GY - 84, 24, 2, '#0E7490'); box(g, x - 12, GY - 79, 16, 2, '#0E7490');
      box(g, x - 13, GY - 61, 26, 16, INK); box(g, x - 12, GY - 60, 24, 14, '#52525B');
      for (let k = 0; k < 3; k++) for (let r = 0; r < 2; r++) box(g, x - 9 + k * 7, GY - 58 + r * 6, 4, 3, '#D4D4D8');
      box(g, x - 10, GY - 40, 20, 3, INK); box(g, x - 8, GY - 39, 16, 1, '#22C55E');
      board(g, x, GY - 150, 'CRYPT-O ATM', '#0C4A6E', '#BAE6FD', 7);
      board(g, x, GY - 114, 'FEES APPLY', '#1C1917', '#E7E5E4', 6);
      break;
    }
    case 2: { // the ADA sign at the foot of the ramp
      const x = X(RAMP.r0 - 70);
      ironPost(g, x, GY - 120, GY, 6);
      box(g, x - 41, GY - 165, 82, 48, INK); box(g, x - 40, GY - 164, 80, 46, '#1D4ED8'); box(g, x - 40, GY - 164, 80, 2, '#3B82F6'); box(g, x - 38, GY - 162, 76, 1, '#F8FAFC'); box(g, x - 38, GY - 121, 76, 1, '#F8FAFC');
      g.strokeStyle = '#F8FAFC'; g.lineWidth = 3; g.beginPath(); g.arc(x - 20, GY - 132, 9, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(x - 22, GY - 156, 3, 0, Math.PI * 2); g.fill(); box(g, x - 23, GY - 152, 3, 13, '#F8FAFC'); box(g, x - 23, GY - 141, 12, 3, '#F8FAFC');
      words(g, 'CRYPT', x + 14, GY - 144, '#F8FAFC', 7, null, enamel(7, '#F8FAFC')); words(g, 'ACCESS', x + 14, GY - 132, '#F8FAFC', 7, null, enamel(7, '#F8FAFC'));
      break;
    }
    case 3: { // up on the terrace: the crypt the ramp's for, and the phone-charging coffin
      const cx = X(4050), base = Y(RAMP.h);
      paintCrypt(g, cx, base, 160, 170);
      poly(g, [[cx - 27, base], [cx - 27, base - 111], [cx, base - 132], [cx + 27, base - 111], [cx + 27, base]], INK);
      poly(g, [[cx - 25, base], [cx - 25, base - 110], [cx, base - 129], [cx + 25, base - 110], [cx + 25, base]], '#120E18');
      board(g, cx, base - 150, 'NOW ADA COMPLIANT', '#1E1036', '#E9D5FF', 7);
      const kx = X(3930);
      poly(g, [[kx - 46, base - 26], [kx - 31, base - 36], [kx + 31, base - 36], [kx + 46, base - 26], [kx + 31, base + 1], [kx - 31, base + 1]], INK);
      poly(g, [[kx - 44, base - 26], [kx - 30, base - 34], [kx + 30, base - 34], [kx + 44, base - 26], [kx + 30, base], [kx - 30, base]], OAK[3]);
      poly(g, [[kx - 44, base - 26], [kx - 30, base - 34], [kx - 20, base - 34], [kx - 34, base - 26], [kx - 22, base], [kx - 30, base]], OAK[5]);
      box(g, kx - 30, base - 33, 60, 3, BRASS[4]); box(g, kx - 2, base - 26, 4, 18, BRASS[3]); box(g, kx - 8, base - 20, 16, 4, BRASS[3]);
      for (let k = 0; k < 4; k++) { box(g, kx - 33 + k * 18, base - 51, 12, 18, INK); box(g, kx - 32 + k * 18, base - 50, 10, 16, '#18181B'); box(g, kx - 31 + k * 18, base - 48, 8, 11, ['#22D3EE', '#A3E635', '#22D3EE', '#F472B6'][k]); box(g, kx - 28 + k * 18, base - 34, 2, 6, '#D4D4D8'); }
      ironPost(g, kx + 53, base - 96, base, 5);
      board(g, kx + 53, base - 96, 'PHONE CHARGING COFFIN', '#1E1036', '#E9D5FF', 6);
      board(g, kx + 53, base - 76, '20 MIN LIMIT', '#1C1917', '#FDE68A', 6);
      break;
    }
    case 4: { // the gargoyle with the security camera
      const x = X(4980), S = STONE;
      box(g, x - 17, GY - 151, 34, 151, INK);
      for (let y = GY - 150, r = 0; y < GY; y += 15, r++) { box(g, x - 16, y, 32, 14, S[r % 2 ? 3 : 4]); box(g, x - 16, y, 32, 1, S[5]); }
      box(g, x - 16, GY - 150, 6, 150, S[5]); box(g, x + 10, GY - 150, 6, 150, S[2]);
      box(g, x - 23, GY - 159, 46, 10, INK); box(g, x - 22, GY - 158, 44, 8, S[4]); box(g, x - 22, GY - 158, 44, 2, S[6]);
      poly(g, [[x - 17, GY - 158], [x + 17, GY - 158], [x + 13, GY - 187], [x - 13, GY - 187]], INK);
      poly(g, [[x - 15, GY - 159], [x + 15, GY - 159], [x + 11, GY - 185], [x - 11, GY - 185]], S[3]);
      for (const s of [-1, 1]) { poly(g, [[x + s * 13, GY - 177], [x + s * 33, GY - 198], [x + s * 26, GY - 184], [x + s * 34, GY - 176], [x + s * 12, GY - 165]], INK); poly(g, [[x + s * 13, GY - 176], [x + s * 30, GY - 194], [x + s * 24, GY - 183], [x + s * 30, GY - 177], [x + s * 12, GY - 167]], s < 0 ? S[4] : S[2]); }
      box(g, x - 8, GY - 180, 4, 3, '#FDE047'); box(g, x + 4, GY - 180, 4, 3, '#FDE047');
      box(g, x + 5, GY - 205, 28, 14, INK); box(g, x + 6, GY - 204, 26, 12, '#E5E7EB'); box(g, x + 6, GY - 204, 26, 3, '#FFFFFF'); box(g, x + 30, GY - 203, 7, 10, INK); box(g, x + 31, GY - 201, 5, 6, '#3B82F6');
      box(g, x + 10, GY - 191, 3, 8, IRON[3]);
      board(g, x, GY - 110, "SMILE! YOU'RE ON CAMERA", '#1C1917', '#FDE68A', 6);
      break;
    }
    case 5: { // the hitching post with the car charger
      const x = X(9000);
      for (const px of [x - 46, x + 38]) { box(g, px - 1, GY - 43, 10, 43, INK); box(g, px, GY - 42, 8, 42, OAK[3]); box(g, px, GY - 42, 2, 42, OAK[5]); }
      box(g, x - 51, GY - 51, 102, 10, INK); box(g, x - 50, GY - 50, 100, 8, OAK[3]); box(g, x - 50, GY - 50, 100, 2, OAK[5]);
      for (const rx of [x - 20, x + 10]) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(rx, GY - 40, 5, 0, Math.PI); g.stroke(); }
      box(g, x + 59, GY - 111, 32, 111, INK); box(g, x + 60, GY - 110, 30, 110, '#E5E7EB'); box(g, x + 60, GY - 110, 4, 110, '#FFFFFF'); box(g, x + 86, GY - 110, 4, 110, '#A1A1AA');
      box(g, x + 64, GY - 104, 22, 14, INK); box(g, x + 65, GY - 103, 20, 12, '#16A34A'); box(g, x + 67, GY - 101, 8, 2, '#BBF7D0');
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 88, GY - 70); g.quadraticCurveTo(x + 112, GY - 50, x + 104, GY - 26); g.stroke();
      g.strokeStyle = '#27272A'; g.lineWidth = 2; g.stroke();
      ironPost(g, x + 62, GY - 190, GY - 110, 5);
      board(g, x + 62, GY - 190, 'HORSE & BUGGY EV CHARGING', '#14532D', '#BBF7D0', 6);
      break;
    }
    case 6: { // the castle sign at the foot of the stairs, and the stair lift (out of order)
      const x = X(STAIRS.a0 - 130);
      for (const px of [x - 122, x + 108]) { box(g, px - 1, GY - 231, 16, 231, INK); box(g, px, GY - 230, 14, 230, OAK[2]); box(g, px, GY - 230, 4, 230, OAK[4]); box(g, px + 11, GY - 230, 3, 230, OAK[1]); }
      const R = ['#2A0606', '#450A0A', '#5E1010', '#7F1D1D', '#991B1B'];
      box(g, x - 143, GY - 279, 286, 66, INK); box(g, x - 141, GY - 277, 282, 62, R[1]);
      box(g, x - 141, GY - 277, 282, 3, R[3]); box(g, x - 141, GY - 219, 282, 4, R[0]); box(g, x - 136, GY - 272, 272, 1, R[0]);
      for (const sx of [x - 136, x + 130]) { box(g, sx, GY - 250, 4, 4, INK); box(g, sx, GY - 250, 2, 2, '#A8A29E'); }
      { const L = { ...blood({ sx: 1, sy: 2 }, '#FECACA', R[0], 7), drip: { col: '#F87171', tip: '#FEE2E2', rate: 0.35, len: 4 } }; words(g, "DRACULA'S", x - 6, GY - 254, '#FECACA', 8, null, L); words(g, 'OTHER CASTLE', x - 6, GY - 234, '#FECACA', 8, null, L); }
      poly(g, [[x + 112, GY - 256], [x + 128, GY - 246], [x + 112, GY - 236]], INK); poly(g, [[x + 113, GY - 254], [x + 126, GY - 246], [x + 113, GY - 238]], '#FECACA');
      const sx = X(STAIRS.a0 + 30);
      box(g, sx - 15, GY - 47, 32, 10, INK); box(g, sx - 14, GY - 46, 30, 8, '#1D4ED8'); box(g, sx - 14, GY - 46, 30, 2, '#60A5FA');
      box(g, sx - 15, GY - 77, 10, 32, INK); box(g, sx - 14, GY - 76, 8, 30, '#1D4ED8'); box(g, sx - 14, GY - 76, 2, 30, '#60A5FA');
      box(g, sx - 7, GY - 38, 8, 38, INK); box(g, sx - 6, GY - 38, 6, 38, '#52525B');
      box(g, sx + 4, GY - 64, 14, 3, '#A1A1AA');
      ironPost(g, sx + 60, GY - 100, GY, 5);
      board(g, sx + 60, GY - 100, 'STAIR LIFT OUT OF ORDER', '#1C1917', '#FDE68A', 6);
      break;
    }
    case 7: { // the landing: a bench, and the sign
      const x = X(STAIRS.a1 + 150), base = Y(STAIRS.mid);
      for (const px of [x - 37, x + 29]) { box(g, px - 1, base - 17, 8, 17, INK); box(g, px, base - 16, 6, 16, IRON[3]); }
      for (const [yy, hh] of [[base - 24, 6], [base - 44, 5], [base - 36, 5]] as const) { box(g, x - 41, yy - 1, 82, hh + 2, INK); box(g, x - 40, yy, 80, hh, OAK[3]); box(g, x - 40, yy, 80, 1, OAK[5]); }
      box(g, x - 38, base - 44, 4, 26, IRON[3]); box(g, x + 34, base - 44, 4, 26, IRON[3]);
      ironPost(g, x, base - 110, base - 44, 5);
      board(g, x, base - 110, 'HALFWAY! (NOT REALLY)', '#1E1036', '#E9D5FF', 7);
      break;
    }
  }
};
/** Each gag: where it is (for culling) [from, to]. */
const GAGS: [number, number][] = [[100, 400], [2160, 2320], [RAMP.r0 - 120, RAMP.r0], [3860, 4150], [4940, 5020], [8940, 9120], [STAIRS.a0 - 290, STAIRS.a0 + 200], [STAIRS.a1 + 80, STAIRS.a1 + 260]];

/** The ADA ramp's handrail, a step back (never in front of him): iron, on posts, sloped with the ramp. */
const drawHandrail = (c: Ctx, v: View) => {
  if (!seen(v, X(RAMP.r0), X(RAMP.t1))) return;
  atDepth(c, v.eye, 0.95, () => {
    const a = X(RAMP.r0) + 10, b = X(RAMP.r1), ya = GY - 40, yb = Y(RAMP.h) - 40;
    for (let i = 0; i <= 5; i++) { const k = i / 5, px = a + (b - a) * k, py = ya + (yb - ya) * k; box(c, px - 2, py, 5, 40, INK); box(c, px - 1, py, 3, 40, IRON[4]); }
    for (const [col, w, dy] of [[INK, 6, 0], [IRON[4], 3, 0], [IRON[5], 1, -1]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a - 4, ya + 3 + dy); c.lineTo(b, yb + dy); c.lineTo(X(RAMP.t1) - 20, yb + dy); c.stroke(); }
  });
};

const drawGags = (c: Ctx, v: View) => {
  if (seen(v, X(2180), X(2300))) cryptBack(c, v, X(2240), GY, 120, 130);
  if (seen(v, X(3970), X(4130))) cryptBack(c, v, X(4050), Y(RAMP.h), 160, 170);
  drawHandrail(c, v);
  GAGS.forEach(([a, b], i) => {
    if (!seen(v, X(a), X(b))) return;
    stamp(c, `tn-gag${i}-${fontIn()}`, X(a) - 170, GY - 470, X(b) - X(a) + 340, 490, g => paintGag(g, i));
  });
  // (live: the camera's red light)
  if (v.f % 60 < 30 && seen(v, X(4980), X(5020))) box(c, X(4980) + 31, GY - 196, 3, 3, '#EF4444');
};

// ---------------------------------------------------------------------------------------------------------------
// The gas lamps (two of them with something modern on them)

export const paintLamp = (g: Ctx, lit: boolean, sign: string) => {
  // (the post: iron, fluted, on a stepped base, a crossbar for the lamplighter's ladder)
  box(g, -10, -10, 20, 10, INK); box(g, -9, -9, 18, 9, IRON[2]); box(g, -9, -9, 18, 2, IRON[4]);
  box(g, -6, -18, 12, 9, INK); box(g, -5, -17, 10, 8, IRON[3]); box(g, -5, -17, 3, 8, IRON[4]);
  box(g, -4, -152, 8, 136, INK); box(g, -3, -152, 6, 136, IRON[3]); box(g, -3, -152, 2, 136, IRON[4]); box(g, 2, -152, 1, 136, IRON[1]);
  box(g, -14, -128, 28, 4, INK); box(g, -13, -127, 26, 2, IRON[4]);
  for (const s of [-1, 1]) { box(g, s * 13 - 2, -131, 4, 4, INK); }
  // (the lantern: four panes, lit (or not), its frame, the pointed cap and its finial)
  poly(g, [[-12, -152], [12, -152], [9, -174], [-9, -174]], INK);
  const glass = lit ? ['#E0A94A', '#FDE68A', '#FFF6D0'] : ['#5A4E30', '#8A7A4A', '#A8986A'];
  poly(g, [[-10, -153], [10, -153], [8, -172], [-8, -172]], glass[1]);
  poly(g, [[-10, -153], [-3, -153], [-3, -172], [-8, -172]], glass[0]);
  box(g, 1, -170, 3, 14, glass[2]);
  box(g, -1, -173, 2, 20, INK); box(g, -11, -164, 22, 1, INK);
  if (lit) box(g, -2, -162, 4, 6, '#FFFFFF');
  poly(g, [[-15, -173], [15, -173], [0, -186]], INK); poly(g, [[-12, -174], [12, -174], [0, -184]], IRON[3]); poly(g, [[-12, -174], [0, -184], [0, -174]], IRON[4]);
  box(g, -2, -192, 4, 8, INK); box(g, -1, -191, 2, 6, IRON[5]);
  if (sign) board(g, 0, -62, sign, '#1E1036', '#BBF7D0', 7);
};

const drawLamps = (c: Ctx, v: View) => {
  const tod = timeOfDay(), lit = tod.lamps > 0.05;
  LAMPS.forEach(([rx, h], i) => {
    const x = X(rx), base = Y(h);
    if (!seen(v, x - 40, x + 40)) return;
    // (its glow after dark: dim, stepped, warm)
    if (lit) steppedGlow(c, x, base - 162, 34, '#FFD27A', 0.1 * tod.lamps, 0, 3);
    const sign = i === 0 ? 'FREE WI-FI' : i === 2 ? 'USB PORT' : '';
    c.save(); c.translate(x, base);
    stamp(c, `tn-lamp-${lit ? 1 : 0}-${sign}-${fontIn()}`, -70, -200, 140, 204, g => paintLamp(g, lit, sign));
    c.restore();
  });
};

/** Its lamps, for the light after dark. */
export const townLamps = (): Light[] => LAMPS.map(([rx, h]) => ({ x: X(rx), y: Y(h) - 162, r: 140, a: 0.8, color: '#FFD27A' }));

export const drawProps = (c: Ctx, v: View) => {
  drawGags(c, v);
  drawLamps(c, v);
  drawLedges(c, v);
  drawSolids(c, v);
  void checker; void textW;
};
