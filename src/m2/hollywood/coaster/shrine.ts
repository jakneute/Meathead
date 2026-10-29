// The shrines (each stop's famous toilet, like a holy relic) and the control booth, peak SNES:
//   the toilets   porcelain in steps, inked: THE CHAIRMAN OF THE BOWEL (a crooner's pink, gold fittings; his fedora and
//                 his martini on the tank, a cigarette butt on the seat, a ring), THE GODFATHER'S CLOG (avocado, the
//                 plunger still stuck in it, an orange on the tank, a rose), THE ROCK GOD'S TOUR BUS TOILET (black,
//                 band stickers all over, a guitar pick; sealed in its hazmat case, glowing, something growing out)
//   the plinths   marble with gold moldings and a star (lit along the top: he can stand on it); stop 3's a hazard-
//                 striped steel base, biohazard signs, the case on it (glass in steps, steel corners, its lid lit)
//   the rest      velvet ropes on brass posts, the brass plaque on its stand, the theatre lights on their stands with
//                 their stepped beams, the name over each (deco letters on a board: hung, or on posts)
//   the booth     up on its stilts: corrugated steel, the big window (the sky in it by day, lit at night), the sleeper
//                 slumped at the desk behind it, the panel's lamps; the lever on its plate (RIDE MODE: NORMAL /
//                 EXPERIMENTAL), the lockout lamp, the handle at its throw (../lever.ts)

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { drawPerson } from '../../adventure/temple/people';
import { type Ctx, type CView, INK, vis, pal, lattice, member, rivets, hazard, goldStar, beam, chains, PORCELAIN, CHROME, MARBLE, BIO, POO } from './paint';
import { box, checker, mix, hash, poly, at, atDepth, still, stillAt, signW, STEEL, BRASS, ramp6, hour, lit, board, deco, plain, words, sideBack, topBack, glassOf, ball } from '../blvd/kit';
import { velvetRopePaint } from '../blvd/props';
import { X, Y, STOPS, BOOTH, BOOTH_LEVER, FUMES, LAUNCHED_MEMO, LEVER_MEMO, CLEARED_MEMO, CASE_HP } from './layout';
import { throwAngle } from '../lever';
import type { Coaster } from './state';
import { throneState, caseLift, drawThroneMess } from './thrones';
import { WALL_D } from './set';


export const TITLES = ['THE CHAIRMAN OF THE BOWEL', "THE GODFATHER'S CLOG", "THE ROCK GOD'S TOUR BUS TOILET"];
const PLAQUES: [string, string][] = [['AS SAT ON BY', 'DINO SINATRELLI 1961'], ['AS CLOGGED BY', 'MARLOWE BRANDOE 1994'], ['NEVER FLUSHED', 'SINCE 1973']];
const BODY = ['#F4A6CC', '#9CAE3E', '#2A2830'];

// ---------------------------------------------------------------------------------------------------------------
// A toilet (feet at the origin: the bowl's foot from -2 to 13, the bowl -4..32 under its seat (-35..-25), the tank from
// -26 to -2 up to its lid at -78; the handle -25..-18 at -64..-60). thrones.ts paints the clog over this in the same
// places (its x is ours - 6: the snapped handle's stub covers ours exactly): keep the two lined up.

const ellF = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { if (rx <= 0 || ry <= 0) return; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
/** A run of something down a face (inked, lit down its left, a bead at its foot). */
const dribble = (g: Ctx, M: string[], x: number, y0: number, y1: number) => {
  box(g, x - 1, y0, 4, y1 - y0, INK); box(g, x, y0, 2, y1 - y0, M[2]); box(g, x, y0, 1, y1 - y0, M[4]);
  ellF(g, x + 1, y1, 2.4, 2, INK); ellF(g, x + 1, y1, 1.5, 1.2, M[2]); box(g, x, y1 - 1, 1, 1, M[5]);
};

export const paintToilet = (g: Ctx, i: number) => {
  const R = ramp6(hour(BODY[i])), C = (i === 0 ? BRASS : CHROME).map(c => hour(c));
  // (its shadow on the plinth)
  g.fillStyle = 'rgba(24, 14, 20, 0.32)'; g.beginPath(); g.ellipse(4, 0, 26, 2.4, 0, 0, Math.PI * 2); g.fill();

  // The tank: rounded, stepped across (lit up its left, a streak of shine down it, dithered into the shade on its
  // right), the shadow under its lid, its foot in shade
  g.fillStyle = INK; g.beginPath(); g.roundRect(-27, -71, 26, 42, 3); g.fill();
  g.save(); g.beginPath(); g.roundRect(-26, -70, 24, 40, 2); g.clip();
  box(g, -26, -70, 24, 40, R[3]);
  box(g, -26, -70, 6, 40, R[4]); checker(g, -20, -70, 2, 40, R[4], 0, 1);
  box(g, -25, -66, 1, 22, R[5]); checker(g, -25, -44, 1, 8, R[5], 0, 1); box(g, -24, -67, 7, 1, R[5]); box(g, -24, -66, 2, 1, R[5]);
  box(g, -7, -70, 5, 40, R[2]); checker(g, -10, -70, 3, 40, R[2], 0, 1); box(g, -3, -70, 1, 40, R[1]);
  box(g, -26, -70, 24, 2, R[2]); checker(g, -26, -68, 24, 1, R[2], 0, 1);
  box(g, -26, -34, 24, 4, R[1]); checker(g, -26, -37, 24, 3, R[2], 0, 1);
  box(g, -24, -32, 18, 1, R[2]);
  g.restore();
  // (the lid: overhanging, its top lit, its front, its underside in shade; the trim on it)
  g.fillStyle = INK; g.beginPath(); g.roundRect(-30, -78, 32, 10, 3); g.fill();
  g.fillStyle = R[3]; g.beginPath(); g.roundRect(-29, -77, 30, 8, 2); g.fill();
  box(g, -28, -77, 28, 1, R[5]); box(g, -28, -76, 28, 2, R[4]); box(g, -29, -71, 30, 1, R[2]); box(g, -28, -70, 28, 1, R[1]);
  box(g, -29, -76, 2, 5, R[4]); box(g, -28, -76, 1, 3, R[5]); box(g, -1, -76, 2, 5, R[2]);
  if (i === 0) { box(g, -28, -73, 28, 1, C[4]); box(g, -28, -73, 9, 1, C[5]); }
  else if (i === 1) { box(g, -28, -73, 28, 1, C[3]); box(g, -28, -73, 6, 1, C[5]); }
  else for (let x = -26; x <= -4; x += 4) { box(g, x, -74, 2, 2, C[1]); box(g, x, -74, 1, 1, C[5]); }
  // (the flush handle: a round escutcheon, the lever off it)
  ellF(g, -23, -62, 2.3, 2.3, INK); ellF(g, -23, -62, 1.5, 1.5, C[3]); box(g, -24, -63, 1, 1, C[5]);
  box(g, -22, -63, 4, 3, INK); box(g, -21, -62, 3, 1, C[4]); box(g, -19, -62, 1, 1, C[5]);
  // (the maker's badge low on the tank: a little oval)
  ellF(g, -14, -38, 3.4, 1.8, INK); ellF(g, -14, -38, 2.6, 1.1, C[3]); box(g, -15, -39, 2, 1, C[5]);
  if (i === 0) goldStar(g, -15, -53, 4);

  // The supply line: out of the plinth by its shutoff (an oval handle), a braided hose up to the tank, its nut
  box(g, -20, -9, 4, 9, INK); box(g, -19, -9, 2, 9, C[3]); box(g, -19, -9, 1, 9, C[5]);
  box(g, -22, -13, 8, 5, INK); box(g, -21, -12, 6, 3, C[3]); box(g, -21, -12, 6, 1, C[5]); box(g, -16, -12, 1, 3, C[1]);
  ellF(g, -24, -11, 2.4, 3.4, INK); ellF(g, -24, -11, 1.4, 2.4, C[2]); box(g, -25, -13, 1, 2, C[4]);
  box(g, -20, -29, 4, 16, INK); box(g, -19, -29, 2, 16, C[2]);
  for (let y = -29; y < -13; y += 2) box(g, -19 + ((y >> 1) & 1), y, 1, 1, C[4]);
  box(g, -22, -31, 8, 4, INK); box(g, -21, -30, 6, 2, C[3]); box(g, -21, -30, 6, 1, C[5]);

  // The pedestal and the bowl: one shape, rounded to the light (stepped in ovals), a streak of shine round its top, the
  // trapway's hump down its side, shaded under the rim and off its right, light bounced up under its belly; ink round it
  const bowl = () => { g.beginPath(); g.moveTo(-4, -26); g.lineTo(32, -26); g.quadraticCurveTo(31, -9, 16, -6); g.lineTo(13, 0); g.lineTo(-2, 0); g.lineTo(-1, -12); g.closePath(); };
  g.save(); bowl(); g.clip();
  box(g, -6, -28, 40, 30, R[2]);
  ellF(g, 10, -17, 17, 12, R[3]); checker(g, 25, -26, 3, 20, R[3], 0, 1);
  ellF(g, 5, -19, 9, 6, R[4]); checker(g, 13, -23, 3, 8, R[4], 1, 1);
  box(g, -3, -14, 3, 14, R[4]); box(g, -2, -12, 1, 9, R[5]);
  box(g, 29, -26, 5, 16, R[1]); checker(g, 27, -26, 2, 16, R[1], 0, 1);
  box(g, -6, -26, 40, 2, R[3]); box(g, -6, -26, 22, 1, R[4]);
  box(g, -6, -24, 40, 1, R[1]); checker(g, -6, -23, 40, 2, R[1], 0, 1);
  box(g, 1, -21, 9, 1, R[5]); box(g, 0, -20, 3, 1, R[5]); checker(g, 10, -21, 4, 1, R[5], 0, 1);
  g.strokeStyle = R[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(13, -5); g.quadraticCurveTo(5, -6, 6, -11); g.quadraticCurveTo(7, -17, 1, -18); g.stroke();
  g.strokeStyle = R[5]; g.beginPath(); g.moveTo(12, -4); g.quadraticCurveTo(4, -5, 5, -11); g.stroke();
  g.strokeStyle = R[3]; g.beginPath(); g.moveTo(28, -15); g.quadraticCurveTo(26, -9, 17, -8); g.stroke();
  box(g, -6, -2, 40, 2, R[1]); checker(g, -6, -4, 40, 2, R[1], 0, 1);
  g.restore();
  bowl(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  // (the bolt caps on the foot: domed, a glint each)
  for (const bx of [-1, 12]) { ellF(g, bx, -3, 2.6, 2.4, INK); ellF(g, bx, -3.2, 1.9, 1.7, C[2]); ellF(g, bx - 0.5, -3.8, 1, 0.9, C[4]); box(g, bx - 1, -5, 1, 1, C[5]); }

  // The lid, up against the tank: the Chairman's pink with a gold edge, the Godfather's in its shag cover (1972),
  // the Rock God's with a sticker slapped on
  const LR = i === 1 ? ramp6(hour('#8A5A26')) : R;
  const lid = () => { g.beginPath(); g.moveTo(-3, -31); g.lineTo(4, -31); g.lineTo(3, -63); g.quadraticCurveTo(1, -68, -2, -65); g.closePath(); };
  g.save(); g.translate(0.5, 0); lid(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = LR[3]; g.fill(); g.restore();
  g.save(); g.translate(0.5, 0); lid(); g.clip();
  box(g, -4, -70, 3, 40, LR[4]); box(g, -2, -66, 1, 30, LR[5]); box(g, 2, -70, 3, 40, LR[2]);
  if (i === 1) for (let y = -66; y < -32; y++) for (let x = -3; x < 4; x++) { const h = hash(x * 7.1 + y * 3.3); if (h < 0.22) box(g, x, y, 1, 1, LR[1]); else if (h > 0.84) box(g, x, y, 1, 1, LR[5]); }
  if (i === 0) { box(g, 2, -64, 1, 32, C[4]); box(g, -2, -64, 1, 4, C[5]); }
  if (i === 2) { box(g, -2, -56, 6, 7, INK); box(g, -1, -55, 5, 5, hour('#DC2626')); box(g, 0, -54, 1, 1, hour('#F8FAFC')); box(g, 2, -54, 1, 1, hour('#F8FAFC')); box(g, 0, -52, 3, 1, hour('#F8FAFC')); }
  g.restore();

  // The seat: a ring seen from just above (its rim edge under, lit along its top), the hinge, the bowl's opening
  box(g, -6, -35, 7, 4, INK); box(g, -5, -34, 5, 2, C[3]); box(g, -5, -34, 2, 1, C[5]);
  ellF(g, 15, -29, 21, 5, INK); box(g, -6, -31, 42, 2, INK); ellF(g, 15, -31, 21, 5, INK);
  ellF(g, 15, -29, 20, 4, R[2]); box(g, -5, -31, 40, 2, R[2]); box(g, -4, -30, 6, 1, R[4]);
  ellF(g, 15, -31, 20, 4, R[3]); ellF(g, 11, -32, 15, 2.6, R[4]); box(g, 3, -34, 7, 1, R[5]); box(g, 28, -29, 4, 1, R[2]);
  if (i === 0) { g.strokeStyle = C[4]; g.lineWidth = 1; g.beginPath(); g.ellipse(15, -29.5, 19.5, 3.6, 0, 0.15, Math.PI - 0.15); g.stroke(); }
  if (i === 2) for (let x = -1; x <= 31; x += 5) { const y = -29 + 4 * Math.sqrt(Math.max(0, 1 - ((x - 15) / 20) ** 2)); box(g, x, y - 1, 2, 2, C[1]); box(g, x, y - 1, 1, 1, C[5]); }
  ellF(g, 16, -31, 13, 2.4, INK);
  ellF(g, 16, -31.2, 12, 1.7, R[1]);
  if (i === 0) {
    // (clear water, a brown ring round it at the waterline)
    ellF(g, 16, -30.6, 11, 1.2, hour('#7EB6CA')); box(g, 10, -31, 6, 1, hour('#CFEFF8'));
    g.strokeStyle = hour('#8A6A3A'); g.lineWidth = 1; g.beginPath(); g.ellipse(16, -30.8, 11.5, 1.5, 0, Math.PI, Math.PI * 2); g.stroke();
  } else if (i === 2) {
    ellF(g, 16, -30.6, 11, 1.2, hour('#BEF264')); box(g, 12, -31, 5, 1, hour('#ECFCCB'));
  }

  if (i === 0) {
    // THE CHAIRMAN: his fedora on the lid (pinched, a band round it, the brim lit), his martini (an olive), a butt on
    // the seat
    const F = ramp6(hour('#3A3430'));
    box(g, -29, -82, 18, 4, INK); box(g, -28, -81, 16, 2, F[2]); box(g, -28, -81, 16, 1, F[4]);
    box(g, -24, -90, 10, 9, INK); box(g, -23, -89, 8, 8, F[3]); box(g, -23, -89, 3, 8, F[4]); box(g, -22, -89, 1, 5, F[5]); box(g, -16, -89, 1, 8, F[1]);
    box(g, -20, -90, 2, 2, INK); box(g, -23, -84, 8, 2, hour('#7F1D1D')); box(g, -23, -84, 8, 1, hour('#B91C1C'));
    const Gl = hour('#DCEAF0');
    g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-10, -94); g.lineTo(-4, -86); g.lineTo(2, -94); g.closePath(); g.stroke();
    g.fillStyle = Gl; g.beginPath(); g.moveTo(-9, -93); g.lineTo(-4, -87); g.lineTo(1, -93); g.closePath(); g.fill();
    box(g, -8, -92, 10, 2, hour('#E8F4C8'));
    box(g, -5, -86, 2, 7, INK); box(g, -8, -79, 8, 2, INK); box(g, -7, -92, 2, 2, '#FFFFFF');
    box(g, -6, -91, 3, 3, hour('#16A34A')); box(g, -5, -91, 1, 1, hour('#DC2626'));
    box(g, 3, -36, 7, 3, INK); box(g, 4, -35, 4, 1, hour('#F5F5F4')); box(g, 4, -35, 2, 1, hour('#D9A066')); box(g, 8, -35, 1, 1, hour('#A8A29E')); box(g, 9, -35, 1, 1, hour('#F97316'));
  } else if (i === 1) {
    // THE GODFATHER'S CLOG: still in there since 1994. Murky water brimming up proud of the seat (scum on it), the
    // plunger stuck in it to the cup, a wad of paper, floaters, a horse's head come up out of it; it's run over the
    // seat and down the bowl into a puddle at its foot. An orange and a cannoli on the lid, a rose across the seat.
    const M = ramp6(hour('#5E5628')), Pp = POO.map(cc => hour(cc));
    dribble(g, M, 5, -28, -22); dribble(g, M, 27, -28, -13); dribble(g, M, 20, -28, -19);
    ellF(g, 24, -0.6, 10, 2.2, INK); ellF(g, 24, -0.9, 9, 1.4, M[2]); box(g, 19, -2, 4, 1, M[4]); box(g, 27, -1, 2, 1, M[5]);
    ellF(g, 16, -31.6, 13.6, 3.4, INK); ellF(g, 16, -31.6, 12.6, 2.6, M[2]); ellF(g, 14, -32.4, 9, 1.4, M[3]);
    checker(g, 6, -33, 20, 1, M[4], 0, 1); box(g, 7, -34, 5, 1, M[5]);
    // (the plunger: its handle (wood, grain, a hang hole at the top), the red cup down in it, ridged, lit)
    g.save(); g.translate(14, -30); g.rotate(0.32);
    const W = ramp6(hour('#A16207')), Rb = ramp6(hour('#B91C1C'));
    box(g, -3, -48, 6, 46, INK); box(g, -2, -47, 4, 44, W[3]); box(g, -2, -47, 1, 44, W[5]); box(g, 1, -47, 1, 44, W[1]);
    for (let y = -42; y < -6; y += 7) box(g, -1, y, 1, 3, W[2]);
    box(g, -1, -45, 2, 2, INK);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-11, 1); g.quadraticCurveTo(0, -13, 11, 1); g.closePath(); g.fill();
    g.fillStyle = Rb[2]; g.beginPath(); g.moveTo(-9.5, 0); g.quadraticCurveTo(0, -11, 9.5, 0); g.closePath(); g.fill();
    g.fillStyle = Rb[3]; g.beginPath(); g.moveTo(-8, -1); g.quadraticCurveTo(-3, -9, 2, -5); g.lineTo(-4, -1); g.closePath(); g.fill();
    box(g, -6, -6, 3, 1, Rb[5]); box(g, -7, -4, 1, 1, Rb[4]);
    box(g, -8, -2, 16, 1, Rb[1]); box(g, 4, -6, 4, 1, Rb[1]);
    g.restore();
    // (the murk's near lip back over the cup's foot)
    ellF(g, 16, -30.4, 12.4, 1.6, M[2]); box(g, 8, -30, 4, 1, M[4]);
    // (the wad of paper, sodden)
    ellF(g, 23, -33, 4.2, 2.8, INK); ellF(g, 23, -33.2, 3.4, 2, hour('#C8C0B0')); ellF(g, 22.4, -33.8, 2.2, 1.2, hour('#F4F0E6'));
    box(g, 21, -34, 1, 1, '#FFFFFF'); box(g, 24, -32, 2, 1, M[3]);
    // (floaters)
    for (const [fx, fy, r] of [[9, -32.4, 2.6], [17, -31.6, 2], [12, -31, 1.4]] as const) { ellF(g, fx, fy, r + 1, r * 0.62 + 1, INK); ellF(g, fx, fy - 0.2, r, r * 0.6, Pp[2]); ellF(g, fx - r * 0.3, fy - r * 0.3, r * 0.5, r * 0.3, Pp[3]); box(g, fx - r * 0.5, fy - r * 0.5, 1, 1, Pp[5]); }
    // (the horse's head, up out of it at the front: its mane, an ear back, a white blaze, the eye, a nostril; red in
    // the murk round its neck)
    const Hh = ramp6(hour('#6B3F1F'));
    const head = () => { g.beginPath(); g.moveTo(26, -31); g.lineTo(26, -39); g.lineTo(27, -44); g.lineTo(28.5, -41); g.lineTo(30, -41); g.quadraticCurveTo(34, -39, 35, -36); g.lineTo(34.5, -34); g.lineTo(31, -34); g.lineTo(30, -31); g.closePath(); };
    head(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = Hh[3]; g.fill();
    g.save(); head(); g.clip();
    box(g, 26, -44, 2, 14, Hh[1]); box(g, 28, -41, 3, 2, Hh[4]); box(g, 31, -38, 4, 1, Hh[4]); box(g, 30, -34, 6, 1, Hh[2]);
    box(g, 30, -40, 1, 1, hour('#F4F0E6')); box(g, 31, -39, 2, 1, hour('#F4F0E6'));
    g.restore();
    box(g, 29, -38, 1, 1, INK); box(g, 29, -39, 1, 1, '#FFFFFF'); box(g, 34, -36, 1, 1, INK);
    ellF(g, 28.5, -31, 4, 1.4, INK); ellF(g, 28.5, -31.2, 3.2, 0.8, M[2]); box(g, 27, -31, 2, 1, hour('#991B1B')); box(g, 30, -31, 1, 1, hour('#DC2626'));
    // (the rose across the back of the seat: stem, a thorn, a leaf, the bloom)
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, -33); g.lineTo(4, -36); g.stroke();
    g.strokeStyle = hour('#15803D'); g.lineWidth = 1.4; g.beginPath(); g.moveTo(-6, -33); g.lineTo(4, -36); g.stroke();
    box(g, -2, -36, 1, 1, INK); box(g, 0, -34, 3, 2, INK); box(g, 0, -34, 2, 1, hour('#22C55E'));
    ball(g, 6, -37, 3.2, hour('#B91C1C')); box(g, 5, -38, 2, 1, hour('#7F1D1D')); box(g, 6, -36, 2, 1, hour('#7F1D1D'));
    // (on the lid: a cannoli (ridged shell, the cream at its ends, chips in it), an orange (dimpled, its leaf))
    const Sh = ramp6(hour('#C8893E')), Cr = hour('#FFF6E0');
    box(g, -27, -83, 10, 6, INK); box(g, -26, -82, 8, 4, Sh[3]); box(g, -26, -82, 8, 1, Sh[5]); box(g, -26, -79, 8, 1, Sh[1]);
    for (let x = -25; x < -18; x += 2) box(g, x, -81, 1, 2, Sh[2]);
    for (const ex of [-29, -18]) { box(g, ex, -82, 3, 4, INK); box(g, ex + (ex < -20 ? 1 : 0), -81, 2, 2, Cr); }
    box(g, -28, -81, 1, 1, hour('#3A220C')); box(g, -17, -80, 1, 1, hour('#3A220C'));
    ball(g, -9, -83, 5, hour('#F97316'));
    const Or = ramp6(hour('#F97316'));
    for (let k = 0; k < 7; k++) box(g, -12 + hash(k * 3.7) * 6, -86 + hash(k * 5.1) * 6, 1, 1, Or[2]);
    box(g, -10, -89, 2, 2, INK); box(g, -9, -89, 1, 1, hour('#4D7C0F'));
    g.fillStyle = INK; g.beginPath(); g.moveTo(-9, -89); g.quadraticCurveTo(-4, -93, -2, -89); g.quadraticCurveTo(-5, -87, -9, -89); g.fill();
    g.fillStyle = hour('#4D7C0F'); g.beginPath(); g.moveTo(-8, -89); g.quadraticCurveTo(-4, -92, -3, -89.5); g.quadraticCurveTo(-5, -88, -8, -89); g.fill();
  } else {
    // THE ROCK GOD'S: band stickers all over it, a guitar pick on the lid, a lightning bolt in white paint marker
    const st: [number, number, number, number, string][] = [[-24, -64, 8, 5, '#DC2626'], [-16, -50, 9, 6, '#FACC15'], [-22, -42, 6, 6, '#38BDF8'], [4, -21, 8, 5, '#F472B6'], [18, -18, 7, 6, '#F8FAFC'], [-12, -60, 6, 4, '#A3E635']];
    for (const [sx, sy, w, h, col] of st) { box(g, sx - 1, sy - 1, w + 2, h + 2, INK); box(g, sx, sy, w, h, hour(col)); box(g, sx, sy, w, 1, hour(mix(col, '#FFFFFF', 0.4))); box(g, sx + w - 2, sy + h - 2, 2, 2, hour(mix(col, '#000000', 0.3))); }
    box(g, -15, -48, 7, 1, hour('#18181B')); box(g, -15, -46, 5, 1, hour('#18181B'));
    g.strokeStyle = hour('#F8FAFC'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-8, -66); g.lineTo(-14, -56); g.lineTo(-9, -56); g.lineTo(-15, -46); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(-20, -81); g.lineTo(-12, -81); g.lineTo(-16, -74); g.closePath(); g.fill();
    g.fillStyle = hour('#9333EA'); g.beginPath(); g.moveTo(-19, -80.5); g.lineTo(-13, -80.5); g.lineTo(-16, -75.5); g.closePath(); g.fill();
    box(g, -18, -80, 2, 1, hour('#D8B4FE'));
  }
};
const toilet = (c: Ctx, i: number, x: number, y: number) => still(c, `hwc-toilet-${i}`, x, y, -36, -100, 80, 104, g => paintToilet(g, i));

// ---------------------------------------------------------------------------------------------------------------
// The plinths

/** A marble plinth (w × h): its front (moldings, veins, a star), painted once. */
const paintPlinth = (g: Ctx, w: number, h: number) => {
  const M = ramp6(hour(MARBLE[3])), G = BRASS.map(c => hour(c));
  box(g, -1, -1, w + 2, h + 1, INK);
  box(g, 0, 0, w, h, M[3]); box(g, 0, 0, 3, h, M[4]); box(g, w - 4, 0, 4, h, M[2]); checker(g, w - 7, 0, 3, h, M[2], 0, 2);
  // (the veins: thin, wandering, dithered)
  for (let k = 0; k < 5; k++) { let vx = 6 + hash(k * 3.3) * (w - 12); for (let y = 8; y < h - 10; y += 2) { vx += (hash(k * 9 + y) - 0.5) * 2.4; box(g, vx, y, 1, 2, (y >> 1) % 3 ? M[2] : M[1]); } }
  // (the moldings: gold along the top and the foot)
  box(g, 0, 2, w, 5, G[3]); box(g, 0, 2, w, 1, G[5]); box(g, 0, 6, w, 1, G[1]);
  box(g, 0, h - 9, w, 9, G[2]); box(g, 0, h - 9, w, 2, G[4]); box(g, 0, h - 2, w, 2, G[1]);
  // (the star in the middle, in a gold ring)
  g.fillStyle = INK; g.beginPath(); g.arc(w / 2, h / 2 - 2, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = G[2]; g.beginPath(); g.arc(w / 2, h / 2 - 2, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = M[4]; g.beginPath(); g.arc(w / 2, h / 2 - 2, 8, 0, Math.PI * 2); g.fill();
  goldStar(g, w / 2, h / 2 - 2, 6);
  // (its lit lip: he can stand on it)
  const L = pal().lip; box(g, 0, 0, w, 2, L[2]); box(g, 0, 0, w, 1, L[3]);
};
/** Stop 3's base: hazard-striped steel, bolted, its biohazard signs. */
const paintBase = (g: Ctx, w: number, h: number) => {
  const S = pal().steel;
  box(g, -1, -1, w + 2, h + 1, INK); box(g, 0, 0, w, h, S[2]); box(g, 0, 0, w, 2, S[4]); box(g, 0, 0, 2, h, S[3]); box(g, w - 3, 0, 3, h, S[1]);
  hazard(g, 0, h - 12, w, 10, 6);
  rivets(g, 4, w - 6, 5, 10, S);
  for (const bx of [22, w - 22]) {
    const Y2 = pal().hazard;
    g.fillStyle = INK; g.beginPath(); g.moveTo(bx, 7); g.lineTo(bx + 14, 31); g.lineTo(bx - 14, 31); g.closePath(); g.fill();
    g.fillStyle = Y2[3]; g.beginPath(); g.moveTo(bx, 10); g.lineTo(bx + 11, 29); g.lineTo(bx - 11, 29); g.closePath(); g.fill();
    g.fillStyle = Y2[5]; g.beginPath(); g.moveTo(bx, 10); g.lineTo(bx + 3, 15); g.lineTo(bx - 3, 15); g.closePath(); g.fill();
    // (the trefoil, crude: three dots round a ring)
    for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k * Math.PI * 2) / 3; box(g, bx + Math.cos(a) * 4 - 1.5, 22 + Math.sin(a) * 4 - 1.5, 3, 3, INK); }
    box(g, bx - 1, 21, 2, 2, INK);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The stands, the ropes, the plaque, the name

/** A theatre light on its stand (a tripod at the back, the can on its yoke), aimed at (tx, ty); its beam (live). */
const lightStand = (c: Ctx, v: CView, x: number, feetY: number, tx: number, ty: number, f: number, tod: boolean) => {
  const S = pal().steel, d = 0.985;
  atDepth(c, v.eye, d, () => {
    const top = feetY - 150;
    for (const dx of [-14, 14]) member(c, x, feetY - 34, x + dx, feetY, 2, S);
    member(c, x, top + 12, x, feetY - 30, 3, S);
    box(c, x - 3, feetY - 36, 6, 5, INK); box(c, x - 2, feetY - 35, 4, 3, S[3]);
    const a = Math.atan2(ty - top, tx - x);
    c.save(); c.translate(x, top); c.rotate(a - Math.PI / 2);
    box(c, -8, -10, 16, 20, INK); box(c, -7, -9, 14, 18, '#26222A'); box(c, -7, -9, 4, 18, '#46404E');
    box(c, -9, 8, 18, 5, INK); box(c, -8, 9, 16, 3, '#FFF6C8'); box(c, -6, 9, 5, 1, '#FFFFFF');
    c.restore();
  });
  const [lx, ly] = at(v.eye, x, feetY - 150, d);
  // (the beam: banded, stepped toward the toilet)
  const dx = tx - lx, dy = ty - ly, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let k = 0; k < 4; k++) {
    const t0 = k / 4, t1 = (k + 1) / 4, w0 = 7 + 44 * t0, w1 = 7 + 44 * t1;
    c.globalAlpha = (tod ? 0.2 : 0.12) * (1 - k * 0.15);
    c.fillStyle = '#FEF3C0';
    c.beginPath(); c.moveTo(lx + dx * t0 + nx * w0, ly + dy * t0 + ny * w0); c.lineTo(lx + dx * t1 + nx * w1, ly + dy * t1 + ny * w1); c.lineTo(lx + dx * t1 - nx * w1, ly + dy * t1 - ny * w1); c.lineTo(lx + dx * t0 - nx * w0, ly + dy * t0 - ny * w0); c.closePath(); c.fill();
  }
  c.globalAlpha = 1;
  void f;
};
/** The brass plaque on its stand (two lines). Feet at 0. */
const paintPlaque = (g: Ctx, a: string, b: string) => {
  const G = BRASS.map(c => hour(c));
  box(g, -3, -52, 6, 52, INK); box(g, -2, -52, 4, 52, G[2]); box(g, -2, -52, 1, 52, G[4]);
  box(g, -11, -5, 22, 5, INK); box(g, -10, -4, 20, 4, G[2]); box(g, -10, -4, 20, 1, G[4]);
  board(g, 0, -70, [a, b], plain(1, 1, '#3A2408'), G[3], G, 7);
};
/** The name over a shrine: deco letters on a board (crimson; stop 3's biohazard green). */
const paintTitle = (g: Ctx, i: number) => {
  const L = deco(i === 2 ? '#D9F99D' : '#F2C24A', i === 2 ? '#14532D' : '#4C0519', 2, 1);
  board(g, 0, 0, [TITLES[i]], L, i === 2 ? '#14532D' : '#5A0820', BRASS, 8);
};
const titleW = (i: number) => signW(TITLES[i], deco('#F2C24A', '#4C0519', 2, 1)) + 22;

/** Each shrine's name: hung from the catwalk over it (stop 1), or on its two posts (drawn before the catwalks). */
export const drawShrineTitle = (c: Ctx, v: CView, i: number) => {
  const s = STOPS[i], dy = Y(s.h), mx = X(s.shrine.x) + s.shrine.w / 2, ty = i === 0 ? dy - 186 : i === 1 ? dy - 160 : dy - 196, w = titleW(i);
  if (!vis(v, mx - w / 2 - 20, mx + w / 2 + 20, ty - 60, dy)) return;
  const S = pal().steel;
  if (i === 0) chains(c, [mx - w / 2 + 14, mx + w / 2 - 14], dy - 230, ty - 12);
  else for (const px of [mx - w / 2 + 16, mx + w / 2 - 16]) { box(c, px - 3, ty + 10, 6, dy - ty - 10, INK); box(c, px - 2, ty + 10, 4, dy - ty - 10, S[3]); box(c, px - 2, ty + 10, 1, dy - ty - 10, S[5]); box(c, px - 7, dy - 4, 14, 4, S[2]); }
  still(c, `hwc-title-${i}`, mx, ty, -w / 2 - 10, -18, w + 20, 36, g => paintTitle(g, i));
};

// ---------------------------------------------------------------------------------------------------------------
// The shrine

/** The case's front pane's cracks, `n` of CRACKS (each a star of lines off a strike, dark with a lit edge; the later
 *  ones longer, running into each other). */
const CRACKS = 16;
const paintCracks = (g: Ctx, sw: number, n: number) => {
  g.lineWidth = 1;
  for (let k = 0; k < n; k++) {
    const ox = 10 + hash(k * 7.3) * (sw - 20), oy = 8 + hash(k * 3.1 + 2) * 56, arms = 5 + (k % 3);
    for (let r = 0; r < arms; r++) {
      const a = r * (Math.PI * 2 / arms) + k, l = 8 + hash(k + r * 1.7) * (10 + k * 1.6);
      const mx = ox + Math.cos(a + 0.2) * l * 0.5, my = oy + Math.sin(a + 0.2) * l * 0.5, ex = ox + Math.cos(a) * l, ey = oy + Math.sin(a) * l;
      g.strokeStyle = 'rgba(10, 10, 14, 0.75)'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(mx, my); g.lineTo(ex, ey); g.stroke();
      g.strokeStyle = 'rgba(240, 249, 255, 0.65)'; g.beginPath(); g.moveTo(ox + 1, oy); g.lineTo(mx + 1, my); g.lineTo(ex + 1, ey); g.stroke();
    }
    // (the ring round a strike)
    g.strokeStyle = 'rgba(240, 249, 255, 0.45)'; g.beginPath(); g.arc(ox, oy, 3 + (k % 3), 0, Math.PI * 2); g.stroke();
  }
};

export const drawShrine = (c: Ctx, v: CView, state: GameState, i: number, co: Coaster) => {
  const s = STOPS[i], f = state.frame, dy = Y(s.h), sx = X(s.shrine.x), sw = s.shrine.w, top = dy - s.shrine.h, mx = sx + sw / 2;
  if (!vis(v, sx - 200, sx + sw + 200, dy - 260, dy)) return;
  const eye = v.eye, night = lit();
  const gone = throneState(state, i) === 'exploded' || (i === 2 && co.breach >= 0), lift = caseLift(co);
  // (the lights on their stands, aimed at it)
  if (!gone) { lightStand(c, v, sx - 64, dy, mx - 8, top - 30, f, night); lightStand(c, v, sx + sw + 64, dy, mx + 8, top - 30, f + 20, night); }
  // (the velvet ropes either side, the plaque in front of the left one)
  still(c, `hwc-rope-${i}`, sx - 110, dy, -10, -46, 116, 48, g => velvetRopePaint(g, 0, 96));
  still(c, `hwc-rope-${i}`, sx + sw + 14, dy, -10, -46, 116, 48, g => velvetRopePaint(g, 0, 96));
  { const [a, b] = PLAQUES[i]; still(c, `hwc-plaque-${i}`, sx - 150, dy, -80, -100, 160, 102, g => paintPlaque(g, a, b)); }
  const M = ramp6(hour(MARBLE[3])), S = pal().steel;
  if (i < 2) {
    // The plinth: its top and its side going back, its front
    topBack(c, eye, sx, sx + sw, top, 1, 0.965, M);
    sideBack(c, eye, sx, -1, top, dy, 1, 0.965, M, 2);
    sideBack(c, eye, sx + sw, 1, top, dy, 1, 0.965, M, 2);
    still(c, `hwc-plinth-${sw}-${s.shrine.h}`, sx, top, -2, -2, sw + 4, s.shrine.h + 3, g => paintPlinth(g, sw, s.shrine.h));
    if (!gone) toilet(c, i, mx - 6, top);
    if (i === 1 && !gone) for (let k = 0; k < 7; k++) { const a = f * 0.13 + k * 0.9; box(c, mx + 8 + Math.cos(a * 1.3) * (18 + k * 3), top - 46 + Math.sin(a) * 14, 2, 2, INK); }
  } else {
    // THE ROCK GOD'S: the base; the case on it (rattling before it vents: index.ts's fumes); the toilet inside, glowing
    const cyc = co.fumeT % FUMES.every, tell = cyc >= FUMES.every - FUMES.vent - FUMES.tell && cyc < FUMES.every - FUMES.vent;
    const jx = tell && !gone ? (f % 4 < 2 ? -1 : 1) : 0, bt = top + 72;
    sideBack(c, eye, sx, -1, bt, dy, 1, 0.965, S, 2);
    sideBack(c, eye, sx + sw, 1, bt, dy, 1, 0.965, S, 2);
    still(c, `hwc-base-${sw}`, sx, bt, -2, -2, sw + 4, dy - bt + 3, g => paintBase(g, sw, dy - bt));
    if (!gone) {
      const B = BIO.map(cc => hour(cc)), ct = top - lift;
      // (the case's back pane and its sides going back: glass, tinted)
      c.fillStyle = 'rgba(20, 40, 12, 0.55)'; c.fillRect(sx + jx + 2, ct + 2, sw - 4, 70);
      topBack(c, eye, sx + jx, sx + sw + jx, ct, 1, 0.965, S, 2);
      // (the glow inside, pulsing in steps)
      const pulse = 0.5 + 0.5 * Math.sin(f * 0.1);
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(190, 242, 100, ${(0.12 + 0.1 * pulse) * (1 - k * 0.3)})`; c.beginPath(); c.ellipse(mx + 8 + jx, bt - 26, 30 - k * 8, 26 - k * 7, 0, 0, Math.PI * 2); c.fill(); }
      toilet(c, 2, mx - 6 + jx, bt);
      // (something growing out of it: a stalk, its bulb)
      c.lineCap = 'round';
      const tipX = mx + 18 + jx + Math.sin(f * 0.05) * 6, tipY = bt - 64;
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(mx + 10 + jx, bt - 30); c.quadraticCurveTo(mx + 32 + Math.sin(f * 0.05) * 6, bt - 52, tipX, tipY); c.stroke();
      c.strokeStyle = B[2]; c.lineWidth = 3; c.stroke();
      c.strokeStyle = B[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(mx + 9 + jx, bt - 31); c.quadraticCurveTo(mx + 31 + Math.sin(f * 0.05) * 6, bt - 53, tipX - 1, tipY - 1); c.stroke();
      c.lineCap = 'butt';
      ball(c, tipX, tipY, 4, B[3]);
      c.fillStyle = `rgba(190, 242, 100, ${0.45 + 0.25 * Math.sin(f * 0.1)})`; c.beginPath(); c.ellipse(mx + 8 + jx, bt - 26, 15, 4, 0, 0, Math.PI * 2); c.fill();
      // (the front pane: tinted in bands, two streaks of glare; the steel corners; the lid (lit: stand on it))
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(132, 204, 22, ${0.1 + k * 0.05})`; c.fillRect(sx + jx, ct + k * 24, sw, 24); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(sx + jx + 12, ct + 6, 3, 58); c.fillRect(sx + jx + 20, ct + 6, 2, 38); c.fillRect(sx + jx + sw - 26, ct + 30, 2, 30);
      // (shot: cracks spreading over it, more and more the more it's taken (index.ts CASE_HP), till it's all crazed)
      const cracks = Math.min(CRACKS, Math.floor((co.caseDmg / CASE_HP) * (CRACKS + 1)));
      if (cracks > 0) still(c, `hwc-case-cracks-${cracks}-${sw}`, sx + jx, ct, 0, 0, sw, 72, g => paintCracks(g, sw, cracks));
      for (const px of [sx + jx, sx + sw - 7 + jx]) { box(c, px - 1, ct - 1, 9, 74, INK); box(c, px, ct, 7, 72, S[3]); box(c, px, ct, 2, 72, S[5]); box(c, px + 6, ct, 1, 72, S[1]); rivets(c, px + 3, px + 3, ct + 10, 1, S); }
      box(c, sx + jx - 2, ct - 2, sw + 4, 7, INK); box(c, sx + jx - 1, ct - 1, sw + 2, 5, S[2]); hazard(c, sx + jx - 1, ct + 2, sw + 2, 2, 4);
      box(c, sx + jx - 1, ct - 1, sw + 2, 2, pal().lip[2]); box(c, sx + jx - 1, ct - 1, sw + 2, 1, pal().lip[3]);
      box(c, sx - 2, bt - 2, sw + 4, 4, INK); box(c, sx - 1, bt - 1, sw + 2, 2, S[4]);
    } else {
      // (blown: the base's top bare, lit; the lid somewhere)
      box(c, sx - 1, bt - 1, sw + 2, 3, pal().lip[2]);
    }
  }
  drawThroneMess(c, state, i);
};

// ---------------------------------------------------------------------------------------------------------------
// The booth and the lever

export const drawBooth = (c: Ctx, v: CView, state: GameState, co: Coaster) => {
  const f = state.frame, by = Y(BOOTH.h), launched = !!state.stageMemo[LAUNCHED_MEMO], dy = Y(STOPS[2].h);
  if (!vis(v, X(BOOTH.a) - 40, X(BOOTH.b) + 40, by - 200, dy)) return;
  const S = pal().steel, eye = v.eye;
  // (the stilts down to the deck, braced)
  for (const rx of [BOOTH.a + 24, BOOTH.b - 30]) lattice(c, X(rx), by + 12, dy, 16, S, 40, 0, false);
  member(c, X(BOOTH.a + 24), dy - 20, X(BOOTH.a + 120), by + 14, 4, S);
  // The cab: its side and roof going back, its walls (corrugated), the window, the sleeper behind it
  const cx0 = X(BOOTH.cab), cw = X(BOOTH.b) - cx0 - 8, top = by - 130;
  const Wl = ramp6(hour('#A8A29E')), Rf = ramp6(hour('#7F1D1D'));
  sideBack(c, eye, cx0, -1, top, by, 1, 0.95, Wl, 2);
  sideBack(c, eye, cx0 + cw, 1, top, by, 1, 0.95, Wl, 2);
  // (the roof's overhang: its ends and its top going back from where its front's drawn)
  sideBack(c, eye, cx0 - 10, -1, top - 12, top + 2, 1, 0.95, Rf, 1, false);
  sideBack(c, eye, cx0 + cw + 10, 1, top - 12, top + 2, 1, 0.95, Rf, 1, false);
  topBack(c, eye, cx0 - 10, cx0 + cw + 10, top - 12, 1, 0.95, Rf, 2);
  box(c, cx0 - 1, top - 1, cw + 2, 131, INK);
  box(c, cx0, top, cw, 130, Wl[3]);
  for (let x = cx0 + 3; x < cx0 + cw; x += 6) { box(c, x, top, 2, 130, Wl[2]); box(c, x + 2, top, 1, 130, Wl[4]); }
  box(c, cx0, top, 3, 130, Wl[5]); box(c, cx0 + cw - 4, top, 4, 130, Wl[1]);
  checker(c, cx0, by - 14, cw, 4, Wl[1], 0, 2); box(c, cx0, by - 10, cw, 10, Wl[1]);
  // (the roof: an overhang, a gutter, lit along the top edge)
  box(c, cx0 - 10, top - 12, cw + 20, 14, INK); box(c, cx0 - 9, top - 11, cw + 18, 12, Rf[3]); box(c, cx0 - 9, top - 11, cw + 18, 2, Rf[4]); box(c, cx0 - 9, top - 3, cw + 18, 3, Rf[1]);
  // (the sign on its front: screwed on)
  still(c, 'hwc-ridecontrol', cx0 + cw / 2, top - 20, -60, -12, 120, 24, g => board(g, 0, 0, ['RIDE CONTROL'], plain(1, 1, '#FDE68A'), '#7F1D1D', BRASS, 5));
  // (the window: the inside (dim), the sleeper slumped at his desk, the panel, the glass over it all)
  const wx = cx0 + 14, ww = cw - 28, wy = by - 112, wh = 62;
  box(c, wx - 3, wy - 3, ww + 6, wh + 6, INK); box(c, wx - 2, wy - 2, ww + 4, wh + 4, S[3]); box(c, wx - 2, wy - 2, ww + 4, 1, S[5]);
  box(c, wx, wy, ww, wh, lit() ? '#4A3A20' : '#1E2430');
  box(c, wx, wy, ww, 10, lit() ? '#5A4828' : '#2A3240');
  if (!launched) {
    // (kept inside the window: his legs are under the desk, behind the wall)
    c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); c.translate(cx0 + 70, by - 40); c.scale(0.9, 0.9);
    drawPerson(c, { seed: 4407, outfit: 'operator', f: 0, pose: 'sit', mood: 'bored', talking: !!co.sleeper });
    c.restore();
  } else {
    // (BACK IN 5, taped to the inside of the glass)
    box(c, cx0 + 50, by - 98, 70, 26, INK); box(c, cx0 + 51, by - 97, 68, 24, '#FEF3C7'); words(c, 'BACK IN 5', cx0 + 85, by - 81, plain(1, 1, '#18181B'));
  }
  // (the desk, the panel's lamps (live), a mug and a donut box)
  box(c, wx, by - 56, ww, 16, INK); box(c, wx + 1, by - 55, ww - 2, 14, '#2E2A30'); box(c, wx + 1, by - 55, ww - 2, 2, '#4A4450');
  for (let k = 0; k < 6; k++) { const on = (k + Math.floor(f / 20)) % 3 ? '#4ADE80' : '#EF4444'; box(c, wx + 10 + k * 20, by - 51, 6, 6, INK); box(c, wx + 11 + k * 20, by - 50, 4, 4, on); box(c, wx + 11 + k * 20, by - 50, 1, 1, '#FFFFFF'); }
  box(c, wx + ww - 26, by - 66, 8, 10, INK); box(c, wx + ww - 25, by - 65, 6, 8, '#F8FAFC'); box(c, wx + ww - 19, by - 63, 2, 4, '#F8FAFC');
  box(c, wx + 4, by - 62, 22, 6, INK); box(c, wx + 5, by - 61, 20, 4, '#F472B6');
  // (the glass: banded with the sky by day, two streaks of glare)
  const Gl = glassOf();
  c.globalAlpha = lit() ? 0.12 : 0.28;
  for (let k = 0; k < 4; k++) { c.fillStyle = Gl[2 + Math.min(3, k)]; c.fillRect(wx, wy + k * (wh / 4), ww, wh / 4); }
  c.globalAlpha = 1;
  c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.moveTo(wx + 20, wy + wh); c.lineTo(wx + 44, wy); c.lineTo(wx + 52, wy); c.lineTo(wx + 28, wy + wh); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(wx + 60, wy + wh); c.lineTo(wx + 78, wy); c.lineTo(wx + 82, wy); c.lineTo(wx + 64, wy + wh); c.closePath(); c.fill();
  if (!launched) for (let k = 0; k < 3; k++) { const t = ((f + k * 30) % 90) / 90; words(c, 'Z', cx0 + 86 + t * 20 + k * 4, by - 90 - t * 50, plain(1 + (k % 2), 1 + (k % 2), `rgba(255,255,255,${1 - t})`)); }
  // The balcony (one-way, up on the stilts: stand on it): its grating, its lip
  { const [ax, ay] = at(eye, X(BOOTH.a), by, 0.972), [bx] = at(eye, X(BOOTH.b), by, 0.972); if (eye.y < by) poly(c, [[X(BOOTH.a), by], [X(BOOTH.b), by], [bx, ay], [ax, ay]], S[1]); }
  still(c, `hwc-balcony`, X(BOOTH.a), by, -3, -3, BOOTH.b - BOOTH.a + 6, 18, g => {
    const w = BOOTH.b - BOOTH.a; box(g, -2, -1, w + 4, 14, INK); box(g, -1, 0, w + 2, 12, S[2]);
    for (let k = 2; k < w - 2; k += 5) box(g, k, 4, 3, 5, S[0]);
    box(g, -1, 10, w + 2, 2, S[1]); hazard(g, -1, 8, w + 2, 2, 4);
    const L = pal().lip; box(g, -1, -1, w + 2, 3, L[2]); box(g, -1, -1, w + 2, 1, L[3]);
  });
  // The lever: the plate up on its post (RIDE MODE, NORMAL to the left, EXPERIMENTAL to the right, the one it's on
  // lit), its lockout lamp (red while the stop's staff are alive), the base, the handle at its throw
  const lv = BOOTH_LEVER, lx = lv.x, flipped = !!state.stageMemo[LEVER_MEMO];
  const ang = throwAngle(lv, co.pull, flipped), exp = ang > 0;
  const L1 = plain(1, 1, '#18181B'), Ln = plain(1, 1, !exp ? '#15803D' : '#A8A29E'), Le = plain(1, 1, exp ? '#DC2626' : '#A8A29E');
  const pw = Math.max(signW('RIDE MODE', L1), signW('< NORMAL', Ln), signW('EXPERIMENTAL >', Le)) + 20, ptop = by - 152;
  box(c, lx - 3, ptop + 50, 6, by - ptop - 50, INK); box(c, lx - 2, ptop + 50, 4, by - ptop - 50, S[3]); box(c, lx - 2, ptop + 50, 1, by - ptop - 50, S[5]);
  box(c, lx - pw / 2 - 3, ptop - 3, pw + 6, 58, INK); box(c, lx - pw / 2 - 2, ptop - 2, pw + 4, 56, S[3]); box(c, lx - pw / 2 - 2, ptop - 2, pw + 4, 1, S[5]);
  const Pl = ramp6(hour('#E7E5E4'));
  box(c, lx - pw / 2, ptop, pw, 52, Pl[3]); box(c, lx - pw / 2, ptop, pw, 2, Pl[5]); box(c, lx - pw / 2, ptop + 49, pw, 3, Pl[2]);
  box(c, lx - pw / 2 + 4, ptop + 17, pw - 8, 1, Pl[1]);
  words(c, 'RIDE MODE', lx, ptop + 13, L1);
  words(c, '< NORMAL', lx - pw / 2 + 8, ptop + 30, Ln, 'left');
  words(c, 'EXPERIMENTAL >', lx + pw / 2 - 8, ptop + 45, Le, 'right');
  for (const [sx2, sy] of [[lx - pw / 2 + 2, ptop + 2], [lx + pw / 2 - 4, ptop + 2], [lx - pw / 2 + 2, ptop + 47], [lx + pw / 2 - 4, ptop + 47]]) box(c, sx2, sy, 2, 2, S[1]);
  const locked = !state.stageMemo[CLEARED_MEMO(2)];
  box(c, lx + pw / 2 - 14, ptop + 3, 10, 10, INK); box(c, lx + pw / 2 - 13, ptop + 4, 8, 8, locked ? (f % 40 < 20 ? '#EF4444' : '#7F1D1D') : '#4ADE80'); box(c, lx + pw / 2 - 12, ptop + 5, 2, 2, '#FFFFFF');
  // (the base: a stepped steel housing, its slot)
  box(c, lx - 18, by - 16, 36, 16, INK); box(c, lx - 17, by - 15, 34, 15, S[2]); box(c, lx - 17, by - 15, 34, 2, S[4]); box(c, lx - 17, by - 15, 2, 15, S[3]); box(c, lx + 13, by - 15, 4, 15, S[1]);
  box(c, lx - 10, by - 13, 20, 3, INK);
  hazard(c, lx - 17, by - 6, 34, 4, 4);
  c.save(); c.translate(lx, lv.y); c.rotate(ang);
  box(c, -4, -lv.len + 2, 8, lv.len - 2, INK); box(c, -3, -lv.len + 3, 6, lv.len - 4, S[3]); box(c, -3, -lv.len + 3, 2, lv.len - 4, S[5]); box(c, 2, -lv.len + 3, 1, lv.len - 4, S[1]);
  c.restore();
  const kx = lx + Math.sin(ang) * lv.len, ky = lv.y - Math.cos(ang) * lv.len;
  ball(c, kx, ky, 7, '#DC2626');
  void GY; void WALL_D; void beam; void STEEL; void PORCELAIN; void stillAt; void poly;
};
