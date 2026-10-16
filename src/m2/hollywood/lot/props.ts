// The backlot's furniture (peak SNES, each at its depth, painted once for the hour): THE DUMPSTER heaped with dead
// Revengers (suits seamed, capes, masks, a leg up, an arm over the front, a shield, blood run down its front in steps, its
// lid flung back, HAPPYWOOD WASTE stenciled, the flies), the bulldozer crashed nose up on it (its tracks and cleats, the
// blade, the cab's cage and glass, its stack still smoking), the merch carts already selling the leak (REVENGERS:
// RESEMBLE in the picture's own lettering, the shirts on their line, the striped umbrella), the guests reading the
// pages, the PA horns on their poles (Steve's flier taped round each), Steve's standees and posters, the palms, the
// studio gate (its deco pylons, the guard booth, the arm up), New York's hydrant and a plywood taxi propped up on a 2x4,
// the western town's hitching rail and a plywood cactus, the suburb's FOR SALE sign, the signs at the holes. At the play
// plane, what he stands on, each going back to the fronts and lit along its lip: the fire escapes (gratings, brackets
// back to the bricks, their ladders), the prop crates, the saloon's balcony and the suburb's porch roof on their posts,
// the water tower's catwalk under its tank, the trough, the fall tower down in the collapse, the camera crane's
// platform on its mast, the gift shop's register and its shelf unit.

import type { Light } from '../../../m1/game/render/lighting';
import { GY } from '../geometry';
import {
  X, Y, DUMP, TOWER, PIT1, PIT2, FALL_TOWER, CRANE, GIFT, SOLIDS, LEDGES, SPEAKERS, STEVES, READERS, TANK,
} from './layout';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, still, stillAt, seen, signText, timeOfDay,
  FRONT_D, PLY, SAND, BRASS, STEEL, STEVE, IRON, CONCRETE, ramp6, hour, dimmed, rampH, slab, post, ball, board, plain, deco,
  sideBack, topBack, underBack,
} from '../blvd/kit';
import { paintStandee, steveCard, paintPalm, paintSawhorse, velvetRopePaint } from '../blvd/props';
import { revLook, subLook } from '../warehouse/paint';
import { drawBody, CAST } from '../warehouse/cast';
import { drawPerson } from '../../adventure/temple/people';
import { gate } from '../../hub/letters';
import { BIN, CAT, BOARD, SHINGLE, lip, boards, tube } from './paint';
import { LOT_FRONTS } from './fronts';

const GATE_D = 0.97, PA_D = 0.965, PALM_D = 0.935, PROP_D = 0.952, DUMP_D = 0.94, DOZER_D = 0.96;
/** Behind a hole (its far edge: the lot strip). */
const PIT_BACK_D = FRONT_D - 0.006;

// ---------------------------------------------------------------------------------------------------------------
// The dumpster and the bulldozer

const SUITS = ['#1D4ED8', '#DC2626', '#15803D', '#7E22CE', '#F59E0B', '#18181B', '#0E7490', '#BE185D'];
const SKIN = ['#F6DCC8', '#D9A877', '#A86B43', '#6E4426', '#F0C8A2', '#8D5A3B'];
const DW = DUMP.b - DUMP.a, RIM = DUMP.h;

/** The dumpster, its heap (local: its left foot at (0, 0), its rim at -RIM). */
const paintDumpster = (g: Ctx) => {
  const B = BIN.map(c => hour(c));
  // (its lid flung back, leaning on the warehouse side behind)
  poly(g, [[6, -RIM - 2], [DW - 6, -RIM - 2], [DW - 30, -RIM - 64], [30, -RIM - 64]], INK);
  poly(g, [[8, -RIM - 3], [DW - 8, -RIM - 3], [DW - 31, -RIM - 62], [31, -RIM - 62]], B[1]);
  for (let k = 1; k < 6; k++) { const y = -RIM - 3 - k * 10; box(g, 10 + k * 3.6, y, DW - 20 - k * 7.2, 1, B[0]); }
  // (the heap over the rim: the cast themselves, the very bodies off the warehouse floor (suits, capes, masks, blood),
  // tipped in every which way, the back ones higher, the bin's front hiding what's sunk in)
  // All of them but the one that missed (twenty-nine), heaped into a mound well over the rim: wide at the bottom,
  // narrowing to one on top, each row drawn over the one under it
  const ROWS = [8, 7, 6, 4, 3, 1];
  let n = 0;
  ROWS.forEach((count, r) => {
    const w = (DW - 40) * (1 - r * 0.14), y0 = -RIM + 10 - r * 15;
    for (let k = 0; k < count; k++, n++) {
      const x = DW / 2 - w / 2 + (count > 1 ? (k / (count - 1)) * w : w / 2) + (hash(n * 3.1) - 0.5) * 14;
      const y = y0 + (hash(n * 5.7) - 0.5) * 8, a = (hash(n * 9.3) - 0.5) * 1.1, d: 1 | -1 = hash(n * 2.3) < 0.5 ? 1 : -1;
      g.save(); g.translate(x, y); g.rotate(a); drawBody(g, 1 + (n % (CAST.length - 1)), 0, 0, d, 1, 0); g.restore();
    }
  });
  // (a pair of boots up out of it, crossed)
  for (const [x, a] of [[176, 0.5], [188, 0.2]] as const) { g.save(); g.translate(x, -RIM - 30); g.rotate(a); box(g, -5, -30, 10, 30, INK); box(g, -4, -29, 8, 28, hour('#3A2A20')); box(g, -4, -29, 3, 28, hour('#5A4030')); box(g, -6, -36, 14, 8, INK); box(g, -5, -35, 12, 6, hour('#26201C')); box(g, -5, -35, 12, 1, hour('#4A3E34')); g.restore(); }
  // (an arm hanging over the front; a shield)
  const shield = (sx: number, sy: number) => { for (const [r, col] of [[15, INK], [14, '#DC2626'], [10, '#F8FAFC'], [6, '#2563EB']] as const) { g.fillStyle = hour(col); g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill(); } poly(g, [[sx, sy - 5], [sx + 1.5, sy - 1.5], [sx + 5, sy - 1], [sx + 2, sy + 1.5], [sx + 3, sy + 5], [sx, sy + 3], [sx - 3, sy + 5], [sx - 2, sy + 1.5], [sx - 5, sy - 1], [sx - 1.5, sy - 1.5]], '#F8FAFC'); box(g, sx - 9, sy - 9, 4, 2, '#FFFFFF'); };
  shield(DW - 50, -RIM - 26);
  // (the bin: a big steel box, its rolled rim, ribs, stiffeners, the fork pockets, casters)
  box(g, -2, -RIM - 2, DW + 4, RIM + 2, INK);
  box(g, 0, -RIM, DW, RIM, B[3]);
  box(g, 0, -RIM, 6, RIM, B[4]); checker(g, 6, -RIM, 4, RIM, B[4], 0, 2); box(g, DW - 8, -RIM, 8, RIM, B[1]); checker(g, DW - 12, -RIM, 4, RIM, B[1], 0, 2);
  box(g, -4, -RIM - 4, DW + 8, 8, INK); box(g, -3, -RIM - 3, DW + 6, 6, B[3]); box(g, -3, -RIM - 3, DW + 6, 2, B[5]); box(g, -3, -RIM + 1, DW + 6, 2, B[1]);
  for (let x = 30; x < DW - 20; x += 56) { box(g, x - 1, -RIM + 4, 8, RIM - 14, INK); box(g, x, -RIM + 4, 6, RIM - 14, B[3]); box(g, x, -RIM + 4, 2, RIM - 14, B[5]); box(g, x + 4, -RIM + 4, 2, RIM - 14, B[1]); }
  for (const fx of [40, DW - 80]) { box(g, fx - 1, -34, 42, 16, INK); box(g, fx, -33, 40, 14, B[0]); box(g, fx, -33, 40, 2, B[2]); }
  box(g, 0, -16, DW, 16, B[1]); checker(g, 0, -20, DW, 4, B[1], 1, 2);
  for (const cx of [16, DW - 32]) { box(g, cx - 1, -9, 18, 9, INK); box(g, cx, -8, 16, 8, hour('#2A2A30')); ball(g, cx + 8, -3, 3, '#5A5A62', false); }
  signText(g, 'HAPPYWOOD WASTE', DW / 2, -RIM + 44, { sx: 1, sy: 2, fill: hour('#BBF7D0'), stencil: true });
  signText(g, 'NO BODIES', DW / 2, -RIM + 60, plain(1, 1, hour('#E8F0E0')));
  // (rust streaks; blood run down the front in steps, pooled at the foot)
  for (const [dx, l] of [[22, 30], [96, 46], [190, 26]] as const) { box(g, dx, -RIM + 4, 3, l, hour('#7A3A1A')); box(g, dx, -RIM + 4 + l, 2, 6, hour('#5A2A10')); }
  const Bl = ['#4A0A0A', '#7F1D1D', '#991B1B', '#B91C1C'];
  for (const [dx, l] of [[60, 42], [150, 74], [214, 30], [240, 58], [118, 20]] as const) { box(g, dx, -RIM + 2, 6, l, Bl[1]); box(g, dx + 1, -RIM + 2, 2, l, Bl[3]); box(g, dx, -RIM + 2 + l, 6, 6, Bl[2]); box(g, dx + 1, -RIM + 6 + l, 4, 2, Bl[0]); }
  // (the arm over the front)
  const sk = ramp6(hour(SKIN[2]));
  box(g, 209, -RIM - 6, 12, 56, INK); box(g, 210, -RIM - 5, 10, 54, sk[3]); box(g, 210, -RIM - 5, 3, 54, sk[4]); box(g, 217, -RIM - 5, 3, 54, sk[1]);
  box(g, 205, -RIM + 46, 20, 10, INK); box(g, 206, -RIM + 47, 18, 8, sk[3]); box(g, 206, -RIM + 47, 18, 2, sk[4]);
  box(g, 209, -RIM - 6, 12, 10, hour(SUITS[0]));
  g.fillStyle = 'rgba(20, 10, 14, 0.3)'; g.fillRect(-6, -2, DW + 12, 4);
  // ONE THAT MISSED: CAPTAIN AMERICANO himself, off the far corner and down the outside of it, flat on the asphalt
  // beside it in his pool; where he hit, the rim's dented in and smeared, a run of him down the bin's end
  poly(g, [[DW - 18, -RIM - 4], [DW + 4, -RIM - 4], [DW + 4, -RIM + 3], [DW - 6, -RIM + 6], [DW - 18, -RIM + 1]], INK);
  poly(g, [[DW - 16, -RIM - 2], [DW + 2, -RIM - 2], [DW + 2, -RIM + 2], [DW - 6, -RIM + 4], [DW - 16, -RIM]], B[1]);
  box(g, DW - 22, -RIM - 4, 24, 4, Bl[2]); box(g, DW - 18, -RIM - 4, 14, 1, Bl[3]);
  // (the smear down the bin's face below where he hit, on the steel, never off its edge)
  for (const [dx, w, l] of [[-14, 6, 44], [-24, 4, 26], [-8, 3, 70]] as const) { box(g, DW + dx, -RIM + 2, w, l, Bl[1]); box(g, DW + dx + 1, -RIM + 2, Math.max(1, w - 3), l, Bl[3]); box(g, DW + dx, -RIM + 2 + l, w, 3, Bl[0]); }
  const mx = DW + 78;
  drawBody(g, 0, mx, 0, 1, 1, 1);
  // (what came off him on the way down: his shield, rolled off on its rim; a boot; spatter on the asphalt)
  shield(mx + 70, -14);
  box(g, mx - 64, -7, 16, 8, INK); box(g, mx - 63, -6, 14, 6, hour('#7F1D1D')); box(g, mx - 63, -6, 14, 2, hour('#A83A3A'));
  for (const [dx, dy, w] of [[-38, -2, 4], [-26, -1, 6], [46, -1, 5], [58, -3, 3], [-14, -4, 2], [30, -5, 2]] as const) { box(g, mx + dx, dy, w, 2, Bl[1]); box(g, mx + dx, dy, Math.max(1, w - 2), 1, Bl[3]); }
};

/** The bulldozer, crashed nose up into the dumpster's left end (local: its tracks' rear foot at (0, 0), facing right). */
const paintDozer = (g: Ctx) => {
  const Y2 = CAT.map(c => hour(c)), Tk = IRON.map(c => hour(c)), S = STEEL.map(c => hour(c));
  g.save(); g.rotate(-0.09);
  // (the ripper at the back)
  poly(g, [[-18, -40], [4, -36], [4, -28], [-12, -6], [-20, -8], [-8, -28], [-20, -32]], INK); poly(g, [[-16, -38], [2, -35], [2, -30], [-12, -9], [-16, -10], [-6, -29], [-16, -32]], Y2[2]);
  // (the tracks: the frame, the cleats going round, the road wheels, the sprocket)
  box(g, -1, -34, 182, 35, INK);
  g.fillStyle = Tk[2]; g.beginPath(); g.roundRect(0, -33, 180, 33, 14); g.fill();
  for (let x = 4; x < 178; x += 9) { box(g, x, -33, 6, 4, Tk[4]); box(g, x, -4, 6, 4, Tk[3]); box(g, x, -33, 6, 1, Tk[5]); }
  box(g, 14, -26, 152, 18, Tk[1]);
  for (let k = 0; k < 6; k++) { ball(g, 26 + k * 26, -16, 7, Tk[3], false); ball(g, 26 + k * 26, -16, 2, Tk[5], false); }
  ball(g, 16, -18, 11, Tk[2], true); for (let k = 0; k < 8; k++) { const an = (k * Math.PI) / 4; box(g, 16 + Math.cos(an) * 10 - 1, -18 + Math.sin(an) * 10 - 1, 3, 3, Tk[4]); }
  // (the body: the hood, its grille louvers, the engine side panels; the cab's cage and glass; the stack)
  box(g, 19, -93, 124, 62, INK);
  box(g, 20, -92, 122, 60, Y2[3]); box(g, 20, -92, 122, 3, Y2[5]); box(g, 20, -92, 4, 60, Y2[4]); box(g, 138, -92, 4, 60, Y2[1]); box(g, 20, -38, 122, 6, Y2[1]);
  for (let k = 0; k < 7; k++) box(g, 96 + k * 6, -84, 3, 30, Y2[1]);
  for (const px of [30, 64]) { box(g, px, -84, 28, 40, Y2[2]); box(g, px, -84, 28, 1, Y2[4]); box(g, px + 26, -84, 2, 40, Y2[1]); }
  signText(g, 'HAPPYWOOD', 80, -42, { sx: 1, sy: 1, fill: hour('#2A1408'), stencil: true });
  box(g, 59, -147, 66, 56, INK);
  for (const px of [60, 120]) { box(g, px, -146, 5, 54, Y2[3]); box(g, px, -146, 2, 54, Y2[5]); }
  box(g, 60, -146, 65, 6, Y2[3]); box(g, 60, -146, 65, 2, Y2[5]);
  box(g, 66, -140, 53, 34, hour('#3A5470')); box(g, 66, -140, 53, 10, hour('#7A9AB8')); checker(g, 66, -130, 53, 2, hour('#7A9AB8'), 0, 1);
  poly(g, [[70, -134], [80, -134], [74, -110], [68, -110]], 'rgba(255,255,255,0.35)');
  // (the glass cracked where it hit)
  g.strokeStyle = '#E8F0F8'; g.lineWidth = 1; g.beginPath(); g.moveTo(108, -128); g.lineTo(116, -136); g.moveTo(108, -128); g.lineTo(118, -122); g.moveTo(108, -128); g.lineTo(100, -138); g.stroke();
  box(g, 60, -106, 65, 14, Y2[2]);
  box(g, 33, -126, 9, 34, INK); box(g, 34, -125, 7, 33, S[2]); box(g, 34, -125, 2, 33, S[4]); box(g, 32, -130, 11, 5, INK); box(g, 33, -129, 9, 3, S[1]);
  // (the push arms out to the blade, the blade: curved, its cutting edge lit)
  box(g, 140, -50, 46, 10, INK); box(g, 141, -49, 44, 8, Y2[2]); box(g, 141, -49, 44, 2, Y2[4]);
  poly(g, [[182, -104], [198, -100], [204, -60], [200, -4], [184, -4], [190, -60]], INK);
  poly(g, [[184, -102], [196, -98], [201, -60], [197, -6], [187, -6], [192, -60]], Y2[3]);
  poly(g, [[184, -102], [188, -101], [194, -60], [190, -6], [187, -6], [192, -60]], Y2[1]);
  box(g, 196, -8, 6, 6, S[4]); box(g, 196, -98, 3, 92, Y2[5]);
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The carts, the poles, the gate, the stands

/** A Revengers merch cart: its wheels, its navy body (the logo on it), the striped umbrella on its pole, shirts hung on a
 *  line: I READ IT FIRST $35. Feet at (0, 0). */
const paintMerch = (g: Ctx) => {
  const N = ramp6(hour('#1E3A8A')), S = STEEL.map(c => hour(c)), Rd = ramp6(hour('#DC2626')), Wt = ramp6(hour('#F8FAFC'));
  for (const wx of [-34, 34]) { ball(g, wx, -10, 10, '#18181B'); ball(g, wx, -10, 4, '#A1A1AA', false); }
  box(g, -51, -72, 102, 56, INK); box(g, -50, -71, 100, 54, N[3]); box(g, -50, -71, 100, 3, N[4]); box(g, -50, -71, 3, 54, N[4]); box(g, 46, -71, 4, 54, N[1]); box(g, -50, -20, 100, 3, N[1]);
  box(g, -54, -75, 108, 5, INK); box(g, -53, -74, 106, 3, S[4]); box(g, -53, -74, 106, 1, S[6]);
  signText(g, 'REVENGERS', 0, -57, revLook(1, 2));
  box(g, -38, -55, 76, 11, INK); box(g, -37, -54, 74, 9, '#8A0E1E'); box(g, -37, -54, 74, 1, '#E8B83A');
  signText(g, 'RESEMBLE', 0, -47, subLook(1, 1));
  // (the umbrella's pole, the umbrella: gores in red and white, each lit and shaded)
  post(g, 0, -168, -74, 4, S);
  for (let k = 0; k < 6; k++) {
    const x0 = -74 + k * 24.6, x1 = x0 + 24.6, R = k % 2 ? Wt : Rd, lt = k < 3;
    poly(g, [[0, -172], [x0, -134], [x1, -134]], INK);
    poly(g, [[0, -170], [x0 + 1, -135], [x1 - 1, -135]], R[lt ? 3 : 2]);
    poly(g, [[0, -170], [x0 + 1, -135], [x0 + 6, -135]], R[lt ? 4 : 3]);
    g.fillStyle = R[1]; g.beginPath(); g.arc((x0 + x1) / 2, -135, 12.3, 0, Math.PI); g.fill();
  }
  ball(g, 0, -173, 3, '#E8C25A', false);
  // (the line strung from the pole, the shirts on it)
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-52, -122); g.quadraticCurveTo(0, -112, 52, -122); g.stroke();
  for (let k = 0; k < 3; k++) {
    const sx = -40 + k * 32, col = ['#F8FAFC', '#FDE047', '#18181B'][k], R = ramp6(hour(col));
    box(g, sx - 15, -120, 30, 8, INK); box(g, sx - 10, -114, 20, 26, INK);
    box(g, sx - 14, -119, 28, 6, R[3]); box(g, sx - 9, -113, 18, 24, R[3]); box(g, sx - 9, -113, 4, 24, R[4]); box(g, sx + 6, -113, 3, 24, R[1]);
    box(g, sx - 6, -106, 12, 6, k === 2 ? '#FDE047' : '#1E3A8A');
    box(g, sx - 1, -122, 2, 4, '#8A6A3A');
  }
  board(g, 0, -30, ['I READ IT FIRST', '$35'], plain(1, 1, '#FDE68A'), '#7F1D1D', BRASS, 4);
};

/** A PA pole: a steel pole on its base, the junction box, two gray horns, Steve's flier taped round it. Feet at 0. */
export const paintPA = (g: Ctx, seed: number) => {
  const S = STEEL.map(c => hour(c));
  box(g, -9, -10, 18, 10, INK); box(g, -8, -9, 16, 9, S[2]); box(g, -8, -9, 16, 2, S[4]);
  post(g, 0, -224, -10, 6, S);
  box(g, -8, -150, 16, 20, INK); box(g, -7, -149, 14, 18, S[3]); box(g, -7, -149, 14, 2, S[5]); box(g, -2, -145, 4, 4, '#4ADE80');
  for (const [dir, y] of [[1, -214], [-1, -200]] as const) {
    box(g, dir > 0 ? 3 : -13, y + 2, 10, 6, INK); box(g, dir > 0 ? 4 : -12, y + 3, 8, 4, '#5A5E66');
    const x0 = dir * 12, x1 = dir * 32;
    poly(g, [[x0, y - 2], [x1, y - 11], [x1, y + 19], [x0, y + 10]], INK);
    poly(g, [[x0, y - 1], [x1 - dir, y - 9], [x1 - dir, y + 17], [x0, y + 9]], '#8A8E96');
    poly(g, [[x0, y - 1], [x1 - dir, y - 9], [x1 - dir, y - 3], [x0, y + 3]], '#B4B8C0');
    box(g, Math.min(x1, x1 - dir * 3), y - 9, 3, 26, '#4A4E56');
  }
  steveCard(g, 0, -96, 0.5, seed);
  box(g, -12, -112, 24, 2, 'rgba(240,240,220,0.6)'); box(g, -12, -82, 24, 2, 'rgba(240,240,220,0.6)');
};

/** The studio gate: two deco pylons, the beam across, HAPPYWOOD STUDIOS on its board (the joke under), the guard booth
 *  and its barrier arm (up). Local: the left pylon's middle at x 0, feet at 0; the right pylon at x 220. */
const paintGate = (g: Ctx) => {
  const R = rampH('#E8D8B8'), T = rampH('#2E6A8A'), S = STEEL.map(c => hour(c)), glass = ['#24364E', '#4A6888', '#7E98B0'];
  for (const px of [0, 220]) {
    box(g, px - 17, -282, 34, 282, INK); slab(g, px - 16, -280, 32, 280, R);
    for (const fx of [px - 9, px + 5]) { box(g, fx, -270, 4, 230, R[2]); box(g, fx, -270, 1, 230, R[4]); }
    for (let k = 0; k < 3; k++) { box(g, px - 20 + k * 2, -40 - k * 10, 40 - k * 4, 6, INK); box(g, px - 19 + k * 2, -39 - k * 10, 38 - k * 4, 4, R[3 + (k % 2)]); }
    box(g, px - 12, -300, 24, 20, INK); slab(g, px - 11, -298, 22, 18, T, false);
    ball(g, px, -306, 6, '#E8C25A');
  }
  // (the beam and the board)
  box(g, 14, -272, 192, 8, INK); box(g, 14, -271, 192, 6, S[3]); box(g, 14, -271, 192, 1, S[5]);
  board(g, 110, -308, ['HAPPYWOOD STUDIOS'], deco('#F2C24A', '#1C1014', 3), '#1C1014', BRASS, 8);
  board(g, 110, -246, ['NOTHING FILMED HERE SINCE 1987'], plain(1, 1, '#2A1A1A'), '#F2EAD8', BRASS, 4);
  // (the guard booth beside the right pylon: stucco, a band of windows, a tile cap; the barrier arm up, striped)
  const bx = 250, Bw = rampH('#F2E8D4');
  box(g, bx - 1, -96, 62, 96, INK); slab(g, bx, -95, 60, 95, Bw);
  box(g, bx + 4, -80, 52, 30, INK); box(g, bx + 5, -79, 50, 28, glass[1]); box(g, bx + 5, -79, 50, 10, glass[2]); box(g, bx + 29, -79, 2, 28, Bw[1]);
  box(g, bx - 5, -104, 70, 10, INK); for (let k = bx - 4; k < bx + 65; k += 5) { box(g, k, -103, 4, 8, hour('#B8603E')); box(g, k, -103, 4, 1, hour('#E08A5E')); }
  board(g, bx + 30, -34, ['GUARD'], plain(1, 1, '#18181B'), '#E8E2D4', S, 3);
  g.save(); g.translate(bx - 6, -40); g.rotate(-1.35);
  box(g, -2, -4, 150, 8, INK); for (let k = 0; k < 148; k += 14) box(g, k - 1, -3, 7, 6, k % 28 ? '#F8FAFC' : '#DC2626'); box(g, -1, -3, 148, 1, '#FFFFFF');
  g.restore();
  box(g, bx - 12, -44, 12, 44, INK); box(g, bx - 11, -43, 10, 43, S[3]); box(g, bx - 11, -43, 3, 43, S[5]);
};

/** A poster stand (a one-sheet frame on two legs), Steve's poster in it. Feet at 0. */
export const paintPosterStand = (g: Ctx, seed: number) => {
  const S = STEEL.map(c => hour(c));
  for (const lx of [-40, 36]) { box(g, lx - 1, -84, 6, 84, INK); box(g, lx, -84, 4, 84, S[3]); box(g, lx, -84, 1, 84, S[5]); }
  steveCard(g, 0, -150, 1.6, seed, 'poster');
};
/** A board on two posts (a set's sign), its lines in `L`. Feet at 0. */
export const paintTwoPostSign = (g: Ctx, lines: string[], bg: string, ink: string, h: number, span: number) => {
  const S = STEEL.map(c => hour(c));
  for (const px of [-span / 2, span / 2]) post(g, px, -h, 0, 5, S);
  board(g, 0, -h - 8, lines, plain(1, 1, ink), bg, S, 6);
};
/** NEW YORK's hydrant (red, its chain, the caps). Feet at 0. */
const paintHydrant = (g: Ctx) => {
  const R = ramp6(hour('#B91C1C'));
  box(g, -10, -4, 20, 4, INK); box(g, -9, -3, 18, 3, R[2]);
  box(g, -8, -34, 16, 30, INK); box(g, -7, -33, 14, 29, R[3]); box(g, -7, -33, 4, 29, R[4]); box(g, 4, -33, 3, 29, R[1]);
  box(g, -12, -24, 24, 8, INK); box(g, -11, -23, 22, 6, R[3]); box(g, -11, -23, 22, 2, R[4]);
  g.fillStyle = INK; g.beginPath(); g.arc(0, -34, 9, Math.PI, 0); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(0, -34, 8, Math.PI, 0); g.fill(); box(g, -2, -44, 4, 4, R[2]); box(g, -3, -38, 3, 2, R[5]);
  box(g, -2, -22, 1, 10, '#A1A1AA'); box(g, -2, -12, 4, 1, '#A1A1AA');
};
/** A plywood cutout (a yellow cab, a saguaro), painted, its 2x4 brace behind and a sandbag on its foot. */
const paintTaxi = (g: Ctx) => {
  const Y2 = ramp6(hour('#F2C230')), P = PLY.map(c => hour(c)), glass = ['#24364E', '#4A6888', '#7E98B0'];
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(60, -50); g.lineTo(90, 0); g.stroke(); g.strokeStyle = P[3]; g.lineWidth = 4; g.stroke();
  const body: [number, number][] = [[-70, -16], [-68, -36], [-40, -40], [-26, -62], [30, -62], [46, -40], [72, -36], [74, -16]];
  poly(g, body.map(([x, y]) => [x + (x < 0 ? -2 : 2), y - 2] as [number, number]).concat([[76, -12], [-72, -12]]), INK);
  poly(g, body.concat([[74, -14], [-70, -14]]), Y2[3]);
  poly(g, [[-68, -36], [-40, -40], [-26, -62], [-20, -62], [-34, -36], [-66, -32]], Y2[4]);
  box(g, -70, -20, 144, 4, Y2[1]);
  poly(g, [[-36, -40], [-24, -58], [-2, -58], [-2, -40]], glass[1]); poly(g, [[2, -40], [2, -58], [28, -58], [40, -40]], glass[1]); box(g, -34, -56, 30, 4, glass[2]);
  for (let k = 0; k < 8; k++) box(g, -60 + k * 16, -30, 8, 6, k % 2 ? '#18181B' : Y2[4]);
  box(g, -12, -70, 24, 8, INK); box(g, -11, -69, 22, 6, '#F8FAFC'); signText(g, 'TAXI', 0, -64, plain(1, 1, '#18181B'));
  for (const wx of [-42, 44]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -12, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2A2A30'; g.beginPath(); g.arc(wx, -12, 11, 0, Math.PI * 2); g.fill(); ball(g, wx, -12, 5, '#A1A1AA', false); }
  box(g, 72, -4, 22, 6, INK); box(g, 73, -3, 20, 4, hour(SAND[3]));
};
const paintCactus = (g: Ctx) => {
  const G2 = ramp6(hour('#4A7A3A')), P = PLY.map(c => hour(c));
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(8, -90); g.lineTo(34, 0); g.stroke(); g.strokeStyle = P[3]; g.lineWidth = 4; g.stroke();
  const arm = (x: number, y: number, w: number, h: number) => { box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, G2[3]); box(g, x, y, Math.max(2, w * 0.3), h, G2[4]); box(g, x + w - 3, y, 3, h, G2[1]); for (let yy = y + 4; yy < y + h; yy += 6) box(g, x + w / 2, yy, 1, 2, '#F4F0E8'); };
  arm(-9, -150, 18, 150); arm(-32, -100, 14, 40); arm(-32, -74, 24, 10); arm(18, -120, 14, 46); arm(8, -84, 24, 10);
  box(g, -14, -4, 28, 4, INK); box(g, -13, -3, 26, 3, hour(SAND[3]));
  box(g, -10, -150, 20, 1, P[4]);
};
const paintHitch = (g: Ctx) => {
  const B = BOARD.map(c => hour(c));
  for (const px of [-36, 36]) { box(g, px - 4, -40, 8, 40, INK); box(g, px - 3, -39, 6, 39, B[3]); box(g, px - 3, -39, 2, 39, B[4]); }
  box(g, -42, -40, 84, 7, INK); box(g, -41, -39, 82, 5, B[3]); box(g, -41, -39, 82, 1, B[5]);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-10, -34); g.quadraticCurveTo(-6, -20, -12, -12); g.stroke();
};
const paintForSale = (g: Ctx) => {
  const W2 = ramp6(hour('#F8FAFC'));
  box(g, -3, -70, 6, 70, INK); box(g, -2, -70, 4, 70, W2[3]);
  box(g, -2, -66, 40, 4, INK); box(g, -1, -65, 38, 2, W2[3]);
  for (const hx of [6, 30]) box(g, hx, -62, 1, 8, '#4A4A4A');
  board(g, 18, -44, ['FOR SALE', '0 BED 0 BATH', 'NO BACK'], plain(1, 1, '#B91C1C'), '#F8FAFC', STEEL, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The standing things, the farthest first

interface Standing { x: number; d: number; key: string; bx: number; by: number; bw: number; bh: number; paint: (g: Ctx) => void; live?: (c: Ctx, f: number) => void }

const covered = (rx: number) => LOT_FRONTS.some(fr => rx > fr.rx + 50 && rx < fr.rx + fr.w - 50);
const inPit = (rx: number) => (rx > PIT1.a - 60 && rx < PIT1.b + 60) || (rx > PIT2.a - 60 && rx < PIT2.b + 60);

const standing = (): Standing[] => {
  const out: Standing[] = [];
  out.push({ x: X(DUMP.a), d: DUMP_D, key: 'dumpster', bx: -60, by: -RIM - 140, bw: DW + 260, bh: RIM + 142, paint: paintDumpster, live: (c, f) => {
    // (the flies over it)
    for (let k = 0; k < 8; k++) { const fx = X(DUMP.a) + 50 + ((k * 43 + f * (k + 1) * 0.6) % 190), fy = GY - RIM - 50 + Math.sin(f * 0.2 + k) * 16; box(c, fx, fy, 2, 2, '#18181B'); if ((f + k) % 4 < 2) box(c, fx - 1, fy - 1, 4, 1, 'rgba(226, 232, 240, 0.6)'); }
  } });
  out.push({ x: X(DUMP.a) - 214, d: DOZER_D, key: 'dozer', bx: -30, by: -180, bw: 250, bh: 182, paint: paintDozer, live: (c, f) => {
    // (its stack still smoking)
    const sx = X(DUMP.a) - 214 + 30, sy = GY - 138;
    for (let k = 0; k < 5; k++) { const t = ((f * 0.5 + k * 20) % 100) / 100, r = 3 + t * 10; c.fillStyle = `rgba(60, 56, 60, ${(0.5 * (1 - t)).toFixed(2)})`; c.fillRect(Math.round(sx - r + t * 18), Math.round(sy - t * 70 - r * 0.6), Math.round(r * 2), Math.round(r * 1.2)); }
  } });
  for (const rx of [880, 1180]) out.push({ x: X(rx), d: PROP_D, key: 'merch', bx: -80, by: -180, bw: 160, bh: 182, paint: paintMerch });
  for (const rx of SPEAKERS) out.push({ x: X(rx), d: PA_D, key: `pa-${rx % 3}`, bx: -40, by: -236, bw: 80, bh: 238, paint: g => paintPA(g, rx) });
  for (const rx of [3000, 4600, 6550]) { const h = 220 + (rx % 3) * 20; out.push({ x: X(rx), d: PALM_D, key: `palm-${rx}`, bx: -80, by: -h - 70, bw: 160, bh: h + 72, paint: g => paintPalm(g, h, rx) }); }
  for (const [rx, kind] of STEVES) {
    if (kind === 'standee') out.push({ x: X(rx), d: 0.958, key: 'standee', bx: -52, by: -140, bw: 104, bh: 152, paint: paintStandee });
    else if (!covered(rx)) out.push({ x: X(rx), d: inPit(rx) ? PIT_BACK_D : PROP_D, key: `posterstand-${rx % 3}`, bx: -60, by: -210, bw: 120, bh: 212, paint: g => paintPosterStand(g, rx) });
  }
  out.push({ x: X(1340), d: GATE_D, key: 'gate', bx: -40, by: -340, bw: 380, bh: 342, paint: paintGate });
  out.push({ x: X(1640), d: 0.965, key: 'hydrant', bx: -20, by: -50, bw: 40, bh: 52, paint: paintHydrant });
  out.push({ x: X(2860), d: PROP_D, key: 'taxi', bx: -80, by: -80, bw: 180, bh: 82, paint: paintTaxi });
  out.push({ x: X(4740), d: PROP_D, key: 'hitch', bx: -50, by: -50, bw: 100, bh: 52, paint: paintHitch });
  out.push({ x: X(5990), d: PROP_D, key: 'cactus', bx: -40, by: -160, bw: 80, bh: 162, paint: paintCactus });
  out.push({ x: X(6760), d: 0.945, key: 'forsale', bx: -20, by: -80, bw: 80, bh: 82, paint: paintForSale });
  // (the signs: the flood tank's on its post (the counter under it), the holes' behind them, the sawhorse at the collapse)
  out.push({ x: X(3125), d: 0.968, key: 'floodsign', bx: -100, by: -220, bw: 200, bh: 222, paint: g => {
    const S = STEEL.map(c => hour(c));
    post(g, 0, -160, 0, 6, S);
    board(g, 0, -184, ['FLASH FLOOD!'], gate({ sx: 2, sy: 2 }, '#F0F9FF', '#0369A1'), '#0369A1', S, 6);
    board(g, 0, -158, ['GUESTS MAY GET WET'], plain(1, 1, '#BAE6FD'), '#0C4A6E', S, 4);
    board(g, 0, -112, ['DAYS WITHOUT A', 'PEE IN IT:  '], plain(1, 1, '#18181B'), '#E7E5E4', S, 5);
  }, live: (c, f) => signText(c, '0', X(3125) + 37, GY - 104, plain(1, 1, f % 60 < 40 ? '#B91C1C' : '#7F1D1D')) });
  out.push({ x: X(PIT1.a) + 200, d: PIT_BACK_D, key: 'pit1sign', bx: -100, by: -100, bw: 200, bh: 102, paint: g => paintTwoPostSign(g, ['MAIN STREET COLLAPSE', 'STUNT SHOW CLOSED 1991'], '#2A1A10', '#FDE68A', 50, 110) });
  out.push({ x: X(PIT2.a) + 166, d: PIT_BACK_D, key: 'pit2sign', bx: -110, by: -100, bw: 220, bh: 102, paint: g => paintTwoPostSign(g, ['FUTURE HOMES OF THE STARS', 'BEHIND EVERY HOUSE: NOTHING'], '#1C1917', '#FDE68A', 50, 130) });
  // (the ride's queue: velvet ropes in switchbacks, TODAY'S WAIT)
  for (let k = 0; k < 2; k++) out.push({ x: X(8800) - 180, d: 0.97 - k * 0.02, key: 'ridequeue', bx: -110, by: -50, bw: 220, bh: 52, paint: g => velvetRopePaint(g, -100, 100) });
  out.push({ x: X(8800) + 230, d: 0.965, key: 'ridewait', bx: -70, by: -150, bw: 140, bh: 152, paint: g => paintTwoPostSign(g, ["TODAY'S WAIT", '0 MINUTES'], '#1C1917', '#F97316', 90, 60) });
  return out;
};

/** A guest reading a leaked page held up to the face (live). */
const reader = (c: Ctx, x: number, seed: number, f: number) => {
  c.save(); c.translate(x, GY); c.scale(seed % 2 ? 0.92 : -0.92, 0.92);
  drawPerson(c, { seed, outfit: 'guest', f, pose: 'hold', mood: seed % 3 ? 'shocked' : 'happy' });
  box(c, 5, -87, 16, 20, INK); box(c, 6, -86, 14, 18, '#F8FAFC'); box(c, 6, -86, 14, 2, '#FFFFFF'); box(c, 17, -86, 3, 18, '#D8D4CC');
  for (let k = 0; k < 4; k++) box(c, 8, -82 + k * 3, 9 - (k % 2) * 3, 1, '#78716C');
  c.restore();
};

export const drawLotStanding = (c: Ctx, v: View, f: number) => {
  const all = standing().filter(s => seen(v, s.x + s.bx, s.x + s.bx + s.bw, s.d));
  all.sort((a, b) => a.d - b.d);
  const people = READERS.map(([rx, seed]) => ({ x: X(rx), d: 0.95, seed })).filter(p => seen(v, p.x - 30, p.x + 30, p.d));
  let pi = 0;
  for (const s of all) {
    while (pi < people.length && people[pi].d <= s.d) { const p = people[pi++]; atDepth(c, v.eye, p.d, () => reader(c, p.x, p.seed, f)); }
    stillAt(c, v, s.d, `lot-${s.key}`, s.x, GY, s.bx, s.by, s.bw, s.bh, s.paint);
    if (s.live) atDepth(c, v.eye, s.d, () => s.live!(c, f));
  }
  while (pi < people.length) { const p = people[pi++]; atDepth(c, v.eye, p.d, () => reader(c, p.x, p.seed, f)); }
};

/** Steve's posters on the fronts (framed). */
export const drawLotPosters = (c: Ctx, v: View) => {
  for (const [rx, kind] of STEVES) {
    if (kind !== 'poster' || !covered(rx) || !seen(v, X(rx) - 60, X(rx) + 60, FRONT_D)) continue;
    stillAt(c, v, FRONT_D, `lot-poster-${rx % 3}`, X(rx), GY - 150, -60, -70, 120, 140, g => steveCard(g, 0, 0, 1.8, rx, 'poster'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// At the play plane: what he stands on

const ESC_BACK = FRONT_D + 0.014;
/** A fire escape's platform: its grating's front (lit lip along it), a drop ladder under the low ones. */
const paintEscape = (g: Ctx, w: number, low: boolean) => {
  const I = IRON.map(c => hour(c));
  box(g, -2, -1, w + 4, 10, INK); box(g, -1, 0, w + 2, 8, I[2]); for (let x = 1; x < w; x += 4) box(g, x, 2, 2, 5, I[0]);
  box(g, -1, 6, w + 2, 2, I[1]);
  lip(g, -1, 0, w + 2);
  if (low) { for (const lx of [w - 34, w - 14]) { box(g, lx - 1, 8, 4, 56, INK); box(g, lx, 8, 2, 56, I[3]); } for (let y = 16; y < 64; y += 10) { box(g, w - 34, y, 22, 2, INK); box(g, w - 34, y, 22, 1, I[4]); } }
};
const paintCrate = (g: Ctx, w: number, h: number) => {
  const B = BOARD.map(c => hour(c));
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  boards(g, 0, -h, w, h, B, 10, w + h);
  for (const [x0, y0, ww, hh] of [[0, -h, w, 6], [0, -6, w, 6], [0, -h, 6, h], [w - 6, -h, 6, h]] as const) { box(g, x0, y0, ww, hh, B[4]); box(g, x0, y0, ww, 1, B[5]); box(g, x0 + ww - 1, y0, 1, hh, B[1]); }
  g.lineCap = 'butt'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(5, -h + 5); g.lineTo(w - 5, -5); g.stroke(); g.strokeStyle = B[4]; g.lineWidth = 5; g.stroke(); g.strokeStyle = B[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(5, -h + 3); g.lineTo(w - 5, -7); g.stroke();
  signText(g, 'PROPS', w / 2, -h / 2 + 10, { sx: 1, sy: 1, fill: B[0], stencil: true });
  lip(g, 0, -h, w);
};
const paintTrough = (g: Ctx, w: number, h: number) => {
  const B = BOARD.map(c => hour(c));
  for (const lx of [8, w - 16]) { box(g, lx - 1, -24, 10, 24, INK); box(g, lx, -24, 8, 24, B[2]); box(g, lx, -24, 2, 24, B[4]); }
  box(g, -1, -h - 1, w + 2, h - 22, INK);
  boards(g, 0, -h, w, h - 24, B, 9, 3);
  box(g, 0, -h, 5, h - 24, B[4]); box(g, w - 5, -h, 5, h - 24, B[1]);
  for (const bx of [w * 0.3, w * 0.7]) { box(g, bx, -h, 3, h - 24, hour('#3A3A44')); box(g, bx, -h, 1, h - 24, hour('#6A6A74')); }
  lip(g, 0, -h, w);
};
const paintCounter = (g: Ctx, w: number, h: number) => {
  const Bw = ramp6(hour('#7F1D1D')), G = ['#24364E', '#4A6888', '#7E98B0'];
  box(g, -1, -h - 1, w + 2, h + 1, INK); box(g, 0, -h, w, h, Bw[2]);
  box(g, 4, -h + 8, w - 8, h - 22, INK); box(g, 5, -h + 9, w - 10, h - 24, G[1]); box(g, 5, -h + 9, w - 10, 6, G[2]);
  for (let k = 0; k < 4; k++) { const bx = 14 + k * 22; box(g, bx, -24, 10, 10, hour(STEVE[3])); ball(g, bx + 5, -30, 6, '#E2B48C', false); box(g, bx, -36, 10, 4, hour('#8A5A2A')); box(g, bx + 1, -30, 8, 2, '#18181B'); }
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.moveTo(10, -14); g.lineTo(18, -14); g.lineTo(34, -h + 9); g.lineTo(26, -h + 9); g.fill();
  box(g, 0, -12, w, 12, Bw[1]); box(g, 0, -12, w, 1, Bw[3]);
  signText(g, 'REGISTER', w / 2, -h + 7, plain(1, 1, '#FDE68A'));
  lip(g, 0, -h, w);
};
const paintShelfUnit = (g: Ctx, w: number, h: number) => {
  const Sh = ramp6(hour('#8A4A1E')), SUITS2 = ['#1D4ED8', '#DC2626', '#15803D', '#F59E0B'];
  for (const px of [0, w - 8]) { box(g, px - 1, -h, 10, h, INK); box(g, px, -h, 8, h, Sh[3]); box(g, px, -h, 2, h, Sh[4]); box(g, px + 6, -h, 2, h, Sh[1]); }
  box(g, 8, -h + 14, w - 16, h - 14, hour('#3A2418'));
  for (let y = -h + 46, r = 0; y < 0; y += 40, r++) {
    box(g, 8, y, w - 16, 5, INK); box(g, 8, y, w - 16, 4, Sh[3]); box(g, 8, y, w - 16, 1, Sh[5]);
    for (let x = 14, k = 0; x < w - 26; x += 22, k++) { const col = ramp6(hour(SUITS2[(k + r) % 4])); box(g, x - 1, y - 21, 16, 21, INK); box(g, x, y - 20, 14, 20, col[3]); box(g, x, y - 20, 4, 20, col[4]); g.fillStyle = INK; g.beginPath(); g.arc(x + 7, y - 25, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#F0C8A2'); g.beginPath(); g.arc(x + 7, y - 25, 6, 0, Math.PI * 2); g.fill(); box(g, x + 2, y - 28, 10, 3, col[2]); }
  }
  box(g, -2, -h - 1, w + 4, 14, INK); box(g, -1, -h, w + 2, 12, Sh[3]); box(g, -1, -h + 9, w + 2, 3, Sh[1]);
  signText(g, 'PLUSH', w / 2, -h + 10, plain(1, 1, '#FDE68A'));
  lip(g, -1, -h, w + 2);
};

export const drawLotPlayThings = (c: Ctx, v: View, f: number) => {
  const eye = v.eye, I = IRON.map(col => hour(col)), B = BOARD.map(col => hour(col)), S = STEEL.map(col => hour(col));
  // The fire escapes: brackets back to the bricks, the grating going back, a ladder up between, the rail at the back
  const escapes = LEDGES.filter(l => l[3] === 'escape');
  for (const [rx, h, w] of escapes) {
    const x = X(rx), y = Y(h);
    if (!seen(v, x - 60, x + w + 60)) continue;
    for (const bx of [x + 8, x + w - 10]) { const [px, py] = at(eye, bx, y + 60, ESC_BACK); tube(c, bx, y + 8, px, py, 3, I[2], I[4]); }
    if (!topBack(c, eye, x, x + w, y, 1, ESC_BACK, I, 3)) underBack(c, eye, x, x + w, y + 8, 1, ESC_BACK, I, 3);
    if (eye.y < y) for (let k = x + 4; k < x + w; k += 6) { const [p0, q0] = at(eye, k, y, 0.996), [p1, q1] = at(eye, k, y, ESC_BACK + 0.004); c.strokeStyle = I[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
    // (its rail at the back: posts and a top rail, against the bricks; the end rails coming forward)
    const [ra] = at(eye, x, y - 30, ESC_BACK), [rb, ry] = at(eye, x + w, y - 30, ESC_BACK), [, rf] = at(eye, x, y, ESC_BACK);
    tube(c, ra, ry, rb, ry, 2, I[3], I[5]);
    for (let k = 0; k <= 6; k++) { const px = ra + ((rb - ra) * k) / 6; box(c, px, ry, 1, rf - ry, I[3]); }
    const low = h < 200;
    still(c, `lot-escape-${w}-${low ? 1 : 0}`, x, y, -6, -4, w + 12, 72, g => paintEscape(g, w, low));
  }
  // (the ladders between each pair, at the back)
  for (const [ax2, bx2] of [[1700, 1740], [2200, 2240]]) {
    const lx = X(bx2) + 96, [p0, q0] = at(eye, lx, Y(240), ESC_BACK + 0.006), [, q1] = at(eye, lx, Y(120), ESC_BACK + 0.006);
    if (!seen(v, lx - 40, lx + 40)) continue;
    for (const dx of [0, 14]) { box(c, p0 + dx - 1, q0, 4, q1 - q0, INK); box(c, p0 + dx, q0, 2, q1 - q0, I[3]); }
    for (let y = q0 + 6; y < q1; y += 10) { box(c, p0, y, 16, 2, INK); box(c, p0, y, 16, 1, I[4]); }
    void ax2;
  }
  // The solids: the crates, the trough, the register (each going back first, then its face)
  for (const [rx, h, w, what] of SOLIDS) {
    const x = X(rx), y = Y(h);
    if (!seen(v, x - 40, x + w + 40)) continue;
    const R = what === 'counter' ? ramp6(hour('#7F1D1D')) : B;
    if (what === 'trough') {
      // (the water in it, going back; its far side)
      const W2 = ['#0E3A52', '#1A587A', '#2A7AA0', '#4A9AC0', '#7ABCD8', '#B8E0F0'].map(col => hour(col));
      topBack(c, eye, x, x + w, y, 1, 0.95, B);
      topBack(c, eye, x + 5, x + w - 5, y + 6, 0.995, 0.955, W2);
    } else topBack(c, eye, x, x + w, y, 1, 0.94, R);
    sideBack(c, eye, eye.x > x + w ? x + w : x, eye.x > x + w ? 1 : -1, y, what === 'trough' ? y + h - 24 : GY, 1, what === 'trough' ? 0.95 : 0.94, R);
    if (what === 'crate') still(c, `lot-crate-${w}-${h}`, x, GY, -4, -h - 4, w + 8, h + 6, g => paintCrate(g, w, h));
    else if (what === 'trough') still(c, `lot-trough-${w}-${h}`, x, GY, -4, -h - 4, w + 8, h + 6, g => paintTrough(g, w, h));
    else still(c, `lot-counter-${w}-${h}`, x, GY, -4, -h - 4, w + 8, h + 6, g => paintCounter(g, w, h));
  }
  // The ledges: the porches, the shelf, the water tower, the crane
  for (const [rx, h, w, what] of LEDGES) {
    const x = X(rx), y = Y(h);
    if (what === 'escape' || !seen(v, x - 80, x + w + 80)) continue;
    if (what === 'porch') {
      const west = rx < 6000, P = west ? B : ramp6(hour('#F4F0E8'));
      for (const px of [x + 6, x + w - 14]) { box(c, px - 1, y + 10, 10, GY - y - 10, INK); box(c, px, y + 10, 8, GY - y - 10, P[3]); box(c, px, y + 10, 2, GY - y - 10, P[4]); box(c, px + 6, y + 10, 2, GY - y - 10, P[1]); }
      if (west) {
        // (the saloon's balcony: its deck going back, the rail along the back against the front)
        topBack(c, eye, x, x + w, y, 1, FRONT_D + 0.006, B, 4);
        const [ra, ry] = at(eye, x, y - 34, FRONT_D + 0.006), [rb] = at(eye, x + w, y - 34, FRONT_D + 0.006), [, rf] = at(eye, x, y, FRONT_D + 0.006);
        box(c, ra, ry - 1, rb - ra, 5, INK); box(c, ra, ry, rb - ra, 3, B[3]); box(c, ra, ry, rb - ra, 1, B[5]);
        for (let px = ra + 2; px < rb; px += 8) { box(c, px, ry + 3, 3, rf - ry - 3, INK); box(c, px, ry + 3, 2, rf - ry - 3, B[2]); }
      } else {
        // (the suburb's porch roof: shingles going back to the house, its white fascia)
        topBack(c, eye, x, x + w, y, 1, FRONT_D + 0.004, SHINGLE.map(col => hour(col)), 4);
        underBack(c, eye, x, x + w, y + 14, 1, FRONT_D + 0.004, ramp6(hour('#C8C0B0')), 3);
      }
      still(c, `lot-porch-${west ? 1 : 0}-${w}`, x, y, -4, -4, w + 8, 20, g => {
        box(g, -2, -1, w + 4, 16, INK);
        if (west) boards(g, -1, 0, w + 2, 14, B, 7, 11); else { const Wt = ramp6(hour('#F4F0E8')); box(g, -1, 0, w + 2, 14, Wt[3]); box(g, -1, 10, w + 2, 4, Wt[1]); for (let k = 4; k < w; k += 20) box(g, k, 4, 8, 3, Wt[2]); }
        lip(g, -1, 0, w + 2);
      });
    } else if (what === 'shelf') {
      topBack(c, eye, x, x + w, y, 1, 0.95, ramp6(hour('#8A4A1E')));
      still(c, `lot-shelf-${w}-${h}`, x, GY, -6, -h - 4, w + 12, h + 6, g => paintShelfUnit(g, w, h));
    } else if (what === 'tower') {
      // THE WATER TOWER: its legs and braces down to the dirt, the catwalk ring (lit lip), the tank on it (riveted
      // staves in steps), its cone and finial, HAPPYWOOD on it
      const Wt = ramp6(hour('#A8B0B8')), cx = x + w / 2;
      for (const lx of [x + 10, x + w - 20]) { box(c, lx - 1, y + 10, 12, GY - y - 10, INK); box(c, lx, y + 10, 10, GY - y - 10, S[3]); box(c, lx, y + 10, 3, GY - y - 10, S[5]); box(c, lx + 8, y + 10, 2, GY - y - 10, S[1]); box(c, lx - 4, GY - 8, 18, 8, INK); box(c, lx - 3, GY - 7, 16, 7, hour(CONCRETE[4])); }
      for (let yy = y + 30; yy < GY - 30; yy += 70) { tube(c, x + 16, yy, x + w - 16, yy + 70, 2, S[2], S[4]); tube(c, x + w - 16, yy, x + 16, yy + 70, 2, S[2], S[4]); tube(c, x + 12, yy, x + w - 12, yy, 3, S[3], S[5]); }
      const tt = y - 150, tw = w - 20, tx = x + 10;
      box(c, tx - 1, tt - 1, tw + 2, 151, INK);
      for (let k = 0; k < tw; k += 2) { const u = k / tw; box(c, tx + k, tt, 2, 150, Wt[u < 0.1 ? 2 : u < 0.32 ? 4 : u < 0.55 ? 3 : u < 0.82 ? 2 : 1]); }
      for (let yy = tt + 14; yy < y; yy += 22) { box(c, tx, yy, tw, 2, Wt[1]); box(c, tx, yy - 1, tw, 1, Wt[5]); for (let k = 6; k < tw; k += 10) box(c, tx + k, yy + 3, 1, 1, Wt[0]); }
      poly(c, [[tx - 8, tt + 1], [cx, tt - 58], [tx + tw + 8, tt + 1]], INK);
      poly(c, [[tx - 6, tt], [cx, tt - 56], [cx, tt]], Wt[3]); poly(c, [[cx, tt - 56], [tx + tw + 6, tt], [cx, tt]], Wt[1]);
      for (let k = 1; k < 4; k++) { const yy = tt - 56 + k * 14, hw = (k * 14 / 56) * (tw / 2 + 6); box(c, cx - hw, yy, hw * 2, 1, Wt[2]); }
      box(c, cx - 2, tt - 70, 4, 14, INK); box(c, cx - 1, tt - 70, 2, 14, S[4]); ball(c, cx, tt - 72, 3, '#B4BCC8', true);
      signText(c, 'HAPPYWOOD', cx, tt + 70, gate({ sx: 2, sy: 2 }, '#3B6AC8', '#14306A'));
      signText(c, 'STUDIOS', cx, tt + 90, plain(1, 1, hour('#1E3A8A')));
      if (timeOfDay().lamps > 0.25 && (f >> 5) % 2 === 0) box(c, cx - 2, tt - 78, 4, 3, '#FF5A5A');
      // (the catwalk ring: its rail behind him, its grating, the lit lip)
      if (!topBack(c, eye, x, x + w, y, 1, 0.95, S)) underBack(c, eye, x, x + w, y + 8, 1, 0.95, S, 3);
      tube(c, x - 2, y - 30, x + w + 2, y - 30, 2, S[3], S[5]);
      for (let px = x; px <= x + w; px += 17) box(c, px, y - 30, 2, 30, S[2]);
      box(c, x - 3, y - 1, w + 6, 10, INK); box(c, x - 2, y, w + 4, 8, S[2]); for (let k = x; k < x + w; k += 4) box(c, k, y + 3, 2, 4, S[0]);
      lip(c, x - 2, y, w + 4);
    } else if (what === 'crane') {
      // THE CAMERA CRANE: its mast (a lattice column) down into the foundation pit, the platform's truss, its deck
      // (lit lip), the camera on its head pointing at nothing, the seat, A-CAM taped on
      const mx = X((CRANE.a + CRANE.b) / 2);
      box(c, mx - 13, y + 14, 26, GY + 420 - y, INK);
      box(c, mx - 12, y + 14, 24, GY + 420 - y, S[2]); box(c, mx - 12, y + 14, 4, GY + 420 - y, S[4]); box(c, mx + 8, y + 14, 4, GY + 420 - y, S[0]);
      for (let yy = y + 24; yy < GY + 420; yy += 24) { c.strokeStyle = S[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(mx - 10, yy); c.lineTo(mx + 10, yy + 12); c.moveTo(mx + 10, yy + 12); c.lineTo(mx - 10, yy + 24); c.stroke(); }
      box(c, x + 24, y + 12, w - 48, 14, INK); for (let k = x + 26; k < x + w - 26; k += 12) { c.strokeStyle = S[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(k, y + 13); c.lineTo(k + 6, y + 25); c.lineTo(k + 12, y + 13); c.stroke(); } box(c, x + 24, y + 24, w - 48, 2, S[3]);
      topBack(c, eye, x, x + w, y, 1, 0.955, S);
      // (the camera, on its fluid head; the seat)
      const G = ['#08080A', '#121216', '#1C1C22', '#28282F', '#36363E', '#4A4A54', '#6A6A76'];
      box(c, x + 40, y - 8, 14, 8, INK); box(c, x + 41, y - 7, 12, 7, G[4]);
      box(c, x + 26, y - 38, 46, 30, INK); box(c, x + 27, y - 37, 44, 28, G[3]); box(c, x + 27, y - 37, 44, 3, G[5]); box(c, x + 27, y - 37, 3, 28, G[5]);
      box(c, x + 71, y - 32, 20, 18, INK); box(c, x + 72, y - 31, 18, 16, G[2]); ball(c, x + 90, y - 23, 7, '#3A3A44', true); ball(c, x + 90, y - 23, 3, '#7AA6C8', false);
      box(c, x + 30, y - 46, 30, 8, INK); box(c, x + 31, y - 45, 28, 6, G[4]);
      box(c, x + 30, y - 30, 22, 6, '#F1EFE8'); signText(c, 'A-CAM', x + 41, y - 25, plain(1, 1, '#18181B'));
      box(c, x + 150, y - 22, 26, 6, INK); box(c, x + 151, y - 21, 24, 4, hour('#27272A')); box(c, x + 160, y - 16, 6, 16, S[2]);
      box(c, x - 2, y - 1, w + 4, 12, INK); box(c, x - 1, y, w + 2, 10, S[3]); box(c, x - 1, y + 7, w + 2, 3, S[1]);
      lip(c, x - 1, y, w + 2);
    }
  }
  // The fall tower down in MAIN STREET COLLAPSE: scaffold going down out of sight, its pad on top (lit lip)
  {
    const fx = X(FALL_TOWER.a), fw = FALL_TOWER.w, top = GY + FALL_TOWER.drop;
    if (seen(v, fx - 40, fx + fw + 40)) {
      const Bl = ramp6(hour('#1E40AF'));
      for (const px of [fx + 8, fx + fw - 16]) { box(c, px - 1, top, 10, 440, INK); box(c, px, top, 8, 440, S[3]); box(c, px, top, 2, 440, S[5]); box(c, px + 6, top, 2, 440, S[1]); }
      for (let yy = top + 20; yy < top + 420; yy += 60) { tube(c, fx + 12, yy, fx + fw - 12, yy + 60, 2, S[2], S[4]); tube(c, fx + fw - 12, yy, fx + 12, yy + 60, 2, S[2], S[4]); tube(c, fx + 8, yy, fx + fw - 8, yy, 3, S[3], S[5]); }
      topBack(c, eye, fx, fx + fw, top, 1, 0.94, Bl);
      box(c, fx - 1, top - 1, fw + 2, 16, INK); box(c, fx, top, fw, 14, Bl[3]); box(c, fx, top + 10, fw, 4, Bl[1]);
      for (let k = fx + 12; k < fx + fw; k += 18) { box(c, k, top + 3, 1, 8, Bl[1]); box(c, k + 1, top + 3, 1, 8, Bl[4]); }
      signText(c, 'FALL PAD', fx + fw / 2, top + 11, plain(1, 1, '#F8FAFC'));
      lip(c, fx, top, fw);
    }
  }
  // (the sawhorse at the collapse's edge, its blinker)
  const sx = X(PIT1.a) - 40;
  if (seen(v, sx - 80, sx + 80)) { still(c, 'lot-saw-collapse', sx, GY, -80, -70, 160, 72, g => paintSawhorse(g, 'CLOSED 1991')); box(c, sx - 3, GY - 54, 6, 4, (f >> 4) % 2 === 0 ? '#FBBF24' : '#78350F'); }
  void SAND; void PLY; void BRASS; void mix; void hash; void dimmed; void TOWER; void GIFT; void TANK; void post;
};

/** Lit after dark: the gate's board, the PA poles' boxes. */
export const standingLights = (v: View): Light[] => {
  const out: Light[] = [];
  const [gx, gy] = at(v.eye, X(1340) + 110, GY - 300, GATE_D);
  out.push({ x: gx, y: gy, r: 200, a: 0.8, color: '#FDE68A' });
  for (const rx of SPEAKERS) { if (X(rx) < v.cam.x - 300 || X(rx) > v.cam.x + 1100) continue; const [x, y] = at(v.eye, X(rx), GY - 214, PA_D); out.push({ x, y, r: 110, a: 0.5, color: '#FFE9A8' }); }
  return out;
};

void dimmed; void deco; void slab; void ball;
