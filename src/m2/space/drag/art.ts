// The main drag, painted (the final pass: peak SNES, fake 3D, one eye for the lot; the square's kit). The backdrop:
// the sky by the hour; behind him (to the left) the giant atom with the hole he came out of, smoking; ahead, bigger
// the further he gets, Space Needle 2 going up out of sight. In the world, back to front: the walk going back, the far
// row, the OPEN TRENCH and the DRAINED LAGOON cut through it; the shops' sides and fronts; the needle's base at the end
// (its legs coming down into the plaza, the lift lobby round its core); the walk under him, bent; the googie roofs'
// lips, the steps, the observation balcony; the big signs, the lamps.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { SECTIONS, GY } from '../geometry';
import { type Ctx, INK, box, checker, poly, still, inView, viewOf, board, slab, ramp6, lit, chromePole, starburst, ball, glassOf, CHROME, PINK, TEAL, LIP, ORANGE, mix } from '../square/paint';
import { drawSky, drawClouds, drawBlimp, drawFarHills, drawFarSkyline, drawGiantAtom, drawNeedle, horizonY } from '../square/sky';
import { drawGoingBack, drawPlayPlane, drawPitDressing, type Ground } from '../square/ground';
import { type Shop, type Block, drawSides, drawShopFront, shopBlocks } from '../square/buildings';
import { drawLamp, drawSpeaker, drawBigSign } from '../square/props';
import { X, Y, T1, T2, LEDGES, LAMPS, SPEAKERS, LIFT_X } from './layout';
import { drawFlSkyBits, drawFlHorizon, drawFlXeno } from '../landmarks';

const { x0, x1 } = SECTIONS.drag;

export const drawDragBackdrop = (c: Ctx, state: GameState) => {
  drawSky(c, state);
  const t = state.frame, cam = state.camera.x + CANVAS_WIDTH / 2;
  const prog = Math.max(0, Math.min(1, (cam - x0) / (x1 - x0)));
  const hz = horizonY(state);
  drawClouds(c, state);
  drawBlimp(c, state);
  drawFlSkyBits(c, state, hz);
  drawFarHills(c, state);
  // (the park's horizon: Foreign Lands' showcase one way, Wilderness Land's mesa the other)
  drawFlHorizon(c, state, hz - 56);
  drawFarSkyline(c, state, 0.03, 0.45, 11);
  // (XENOSCARE across the park ahead, past the needle, where the land ends)
  drawFlXeno(c, state, hz + 6);
  // The giant atom, behind him now (receding off to the left), the hole in it smoking
  const as = 1.1 - prog * 0.6;
  drawGiantAtom(c, 120 - prog * 260, hz - 120 * as - 40, as, t, true);
  // Space Needle 2 ahead: up out of sight; over its own lift once that's on the screen
  const lift = X(LIFT_X) - state.camera.x;
  drawNeedle(c, Math.min(690, lift), hz + 6, 0.6 + prog * prog * 1.5, t);
  drawFarSkyline(c, state, 0.08, 0.22, 5, 14);
  return true;
};

const SHOPS: Shop[] = [
  { x: X(60), w: 320, h: 180, wall: '#EDE9FE', trim: '#8B5CF6', roof: 'boomerang', font: 'chrome', name: 'VOYAGE TO 2010: EXIT', sub: 'PLEASE EXIT THROUGH THE GIFT SHOP' },
  { x: X(6080), w: 230, h: 150, wall: '#FCE7F3', trim: '#0EA5E9', roof: 'dome', font: 'neon', nameBg: '#1E0B2E', nameInk: '#7DF9FF', name: 'ROBO-DENTIST', sub: 'NO HUMANS INVOLVED. NO REFUNDS.' },
  { x: X(3620), w: 300, h: 170, wall: '#ECFEFF', trim: '#F97316', roof: 'fin', font: 'chrome', name: 'CAR OF TOMORROW SHOWROOM', sub: 'FLYING CARS: COMING SOON SINCE 1958' },
  { x: X(4000), w: 280, h: 160, wall: '#FEF3C7', trim: '#DB2777', roof: 'saucer', font: 'enamel', nameBg: '#1E3A8A', nameInk: '#FDE68A', name: 'PNEUMATIC MAIL', sub: 'YOUR LETTER, SHOT THROUGH A TUBE' },
  { x: X(4700), w: 220, h: 260, wall: '#CCFBF1', trim: '#F472B6', roof: 'flat', font: 'neon', nameBg: '#1E0B2E', nameInk: '#FF6AD5', name: 'MOTEL OF THE FUTURE', sub: 'HOURLY RATES', signDrop: 24 },
  { x: X(5000), w: 200, h: 240, wall: '#E0E7FF', trim: '#22C55E', roof: 'flat', font: 'enamel', nameBg: '#F8FAFC', nameInk: '#15803D', name: 'ATOMIC DRY CLEANERS', sub: 'WE GET THE GLOW OUT', signDrop: 24 },
  { x: X(5300), w: 200, h: 260, wall: '#FFE4E6', trim: '#6366F1', roof: 'flat', font: 'marquee', nameBg: '#4C1D95', name: 'MOON TAN', sub: 'TAN LIKE AN ASTRONAUT. BURN LIKE ONE.', signDrop: 24 },
  { x: X(6820), w: 260, h: 160, wall: '#F1F5F9', trim: '#E11D48', roof: 'boomerang', font: 'marquee', nameBg: '#9F1239', name: 'NEEDLE GIFTS', sub: 'I WENT TO SPACE AND ALL I GOT WAS THIS SHIRT' },
];

const GROUND: Ground = {
  id: 'dr',
  floor: [[x0 - 200, X(T1.a)], [X(T1.b), X(T2.a)], [X(T2.b), x1 + 200]],
  pits: [{ a: X(T1.a), b: X(T1.b), kind: 'trench' }, { a: X(T2.a), b: X(T2.b), kind: 'lagoon' }],
};

const LX = X(LIFT_X);
const BLOCKS: Block[] = [
  ...shopBlocks(SHOPS, GY, true),
  { x0: LX - 140, x1: LX + 140, top: GY - 150, bottom: GY, col: '#FDA4AF', noTop: true },
];

const signs = (c: Ctx, state: GameState) => {
  drawBigSign(c, state, 'd-trench', X(T1.a - 150), 120, 'FUTURELAND UNDERGROUND', 'OPEN TRENCH. CAST MEMBERS ONLY.', '#FACC15', '#18181B', false, 'enamel2');
  drawBigSign(c, state, 'd-lagoon', X(1880), 150, 'THE LAGOON OF TOMORROW', 'DRAINED 1971. SUBMARINES ON THE BOTTOM.', '#0C1E3A', '#5EEAD4', true, 'neon2');
  drawBigSign(c, state, 'd-mover', X(4300), 290, 'THE PEOPLE MOVER (EXPRESS RETURN)', 'WALK FASTER, CITIZEN!', undefined, undefined, true, 'chrome2');
  drawBigSign(c, state, 'd-plaza', X(5850), 150, 'SPACE NEEDLE 2', 'TO SPACE AND BEYOND! 62 MILES UP!', '#7F1D1D', undefined, false, 'marquee');
};

const ledges = (c: Ctx, state: GameState) => {
  for (const [rx, h, w, what] of LEDGES) {
    const x = X(rx), y = Y(h);
    if (!inView(state, x - 40, x + w + 40)) continue;
    still(c, `spc-dledge-${what}-${w}-${h}`, x, y, -40, -60, w + 80, h + 64, g => {
      if (what === 'roof') {
        // (the roof's edge: a lit chrome coping to stand on, a starburst up at the corner)
        box(g, -6, -2, w + 12, 14, INK); box(g, -4, 0, w + 8, 10, CHROME[3]); box(g, -4, 7, w + 8, 3, CHROME[2]);
        box(g, -4, 0, w + 8, 3, LIP[2]); box(g, -4, 0, w + 8, 1, LIP[3]);
        for (let k = 4; k < w; k += 16) box(g, k, 4, 6, 2, PINK[3]);
        chromePole(g, w - 10, -22, 0, 3); starburst(g, w - 10, -26, 10);
      } else {
        // (a landing on chrome stilts: a lit lip, a railing along the back)
        chromePole(g, 8, 12, h, 8); chromePole(g, w - 8, 12, h, 8);
        box(g, -2, -2, w + 4, 16, INK); box(g, 0, 0, w, 12, CHROME[3]); box(g, 0, 8, w, 4, CHROME[2]);
        box(g, 0, 0, w, 3, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
        for (let k = 6; k < w - 4; k += 12) box(g, k, 5, 4, 2, TEAL[3]);
        box(g, 0, -28, w, 4, INK); box(g, 0, -27, w, 2, CHROME[4]); for (let k = 0; k <= w; k += 24) { box(g, k - 1, -27, 3, 27, INK); box(g, k, -27, 1, 27, CHROME[4]); }
        // (its name on the fascia under the floor: up over the railing it was cut off, and whoever stood there covered it)
        if (what === 'balcony') board(g, w / 2, 26, 'OBSERVATION BALCONY', '#0F172A', '#7DD3FC', 6, 4, false, 'small');
      }
    });
  }
};

/** The needle's base at the end: its three legs (white enamel, lit down their left sides, riveted) coming down into
 *  the plaza on their feet, the core, the lift lobby round its foot (pink, a band of trim, the lift's doors, the call
 *  button), LIFT TO SPACE over the doors. */
const paintBase = (g: Ctx) => {
  const on = lit(), Lg = ramp6('#EEF2F8'), Pk = ramp6('#FDA4AF'), glass = glassOf();
  for (const [fx, tx, k] of [[-320, -40, 2], [320, 40, 3], [-120, -10, 4]] as const) {
    poly(g, [[fx - 23, 0], [tx - 13, -560], [tx + 13, -560], [fx + 23, 0]], INK);
    poly(g, [[fx - 20, 0], [tx - 10, -560], [tx + 10, -560], [fx + 20, 0]], Lg[k]);
    poly(g, [[fx - 20, 0], [tx - 10, -560], [tx - 4, -560], [fx - 8, 0]], Lg[k + 1] ?? Lg[5]);
    poly(g, [[fx + 12, 0], [tx + 6, -560], [tx + 10, -560], [fx + 20, 0]], Lg[k - 1]);
    for (let u = 0.08; u < 1; u += 0.08) { const x = fx + (tx - fx) * u, y = -560 * u; box(g, x - 1, y, 2, 2, Lg[1]); }
    // (the plates it's built of: a seam across every so often (a dark line over a lit one); the safety-orange bands
    // up it in steps, as on the shaft; grime come up from the foot, dithered off)
    const across = (u: number, h: number, col: string) => { const w0 = 20 - 10 * u, w1 = 20 - 10 * (u + h / 560), x0 = fx + (tx - fx) * u, x1 = fx + (tx - fx) * (u + h / 560), y0 = -560 * u; poly(g, [[x0 - w0, y0], [x0 + w0, y0], [x1 + w1, y0 - h], [x1 - w1, y0 - h]], col); };
    for (let u = 0.12; u < 0.98; u += 0.12) { across(u, 1, Lg[1]); across(u + 1 / 560, 1, Lg[5]); }
    for (const u of [0.42, 0.72]) { across(u, 14, ORANGE[3]); across(u + 10 / 560, 4, ORANGE[1]); across(u, 2, ORANGE[5]); }
    for (let r = 0; r < 4; r++) { const y = -24 - r * 6, u = -y / 560, x = fx + (tx - fx) * u, w0 = 20 - 10 * u; checker(g, x - w0, y, w0 * 2, 3, mix(Lg[k], '#5A5A6A', 0.35), r % 2, 2); }
    // (its foot: a chrome shoe bolted down)
    box(g, fx - 30, -14, 60, 14, INK); box(g, fx - 29, -13, 58, 13, CHROME[3]); box(g, fx - 29, -13, 58, 2, CHROME[5]); for (const bx of [fx - 22, fx + 18]) box(g, bx, -9, 4, 4, CHROME[1]);
  }
  // (the core: banded, the lift's shaft)
  box(g, -45, -560, 90, 560, INK);
  slab(g, -44, -560, 88, 560, Lg, false);
  for (let y = -540; y < -150; y += 40) { box(g, -44, y, 88, 2, Lg[2]); box(g, -44, y + 2, 88, 1, Lg[5]); for (const rx of [-38, -12, 12, 36]) box(g, rx, y + 6, 2, 2, Lg[1]); }
  // (the shaft's round: shaded across in steps toward its right, a lit strip down its left; portholes up it, lit
  // after dark; the cable run up its middle, clamped)
  box(g, 22, -560, 10, 410, Lg[2]); checker(g, 16, -560, 6, 410, Lg[2], 0, 2); box(g, 32, -560, 12, 410, Lg[1]);
  box(g, -40, -560, 6, 410, Lg[5]);
  for (let y = -500; y < -180; y += 80) { box(g, -9, y - 1, 18, 18, INK); box(g, -8, y, 16, 16, CHROME[3]); box(g, -6, y + 2, 12, 12, on ? '#FFE8A0' : glass[2]); box(g, -6, y + 2, 12, 4, on ? '#FFF6D0' : glass[3]); box(g, -6, y + 2, 2, 12, '#FFFFFF'); }
  box(g, 24, -560, 3, 410, CHROME[1]); for (let y = -540; y < -160; y += 28) box(g, 22, y, 7, 3, CHROME[4]);
  // (the lobby round its foot)
  box(g, -142, -152, 284, 152, INK);
  slab(g, -140, -150, 280, 150, Pk);
  box(g, -140, -150, 280, 10, PINK[2]); box(g, -140, -150, 280, 2, PINK[4]);
  for (const wx of [-128, 76]) { box(g, wx - 1, -121, 54, 72, INK); box(g, wx, -120, 52, 70, glass[1]); box(g, wx, -120, 52, 24, glass[2]); box(g, wx, -120, 2, 70, glass[4]); box(g, wx + 25, -120, 2, 70, CHROME[3]); }
  // (the lift's doors: brushed chrome, a seam, the floor indicator over them)
  box(g, -38, -122, 76, 122, INK); box(g, -35, -119, 34, 119, CHROME[4]); box(g, 1, -119, 34, 119, CHROME[4]);
  box(g, -35, -119, 3, 119, CHROME[6]); box(g, 1, -119, 3, 119, CHROME[6]); box(g, -2, -119, 4, 119, INK);
  for (let k = 0; k < 6; k++) box(g, -24 + k * 9, -128, 6, 4, k === 0 ? (on ? '#FFE070' : '#F59E0B') : '#3A3A48');
  box(g, 50, -98, 16, 26, INK); box(g, 51, -97, 14, 24, CHROME[3]); g.fillStyle = on ? '#FDE047' : '#F59E0B'; g.beginPath(); g.moveTo(58, -93); g.lineTo(54, -85); g.lineTo(62, -85); g.fill();
  ball(g, 58, -79, 2, '#EF4444');
  board(g, 0, -174, 'ELEVATOR TO SPACE', '#0F172A', '#FDE047', 10, 8, true, 'chrome2');
  board(g, 0, -134, 'ALL ABOARD! 62 MILES UP. NO REFUNDS IN ORBIT.', '#FFFFFF', '#BE123C', 6, 3, false, 'small');
  void checker; void mix;
};
const base = (c: Ctx, state: GameState) => {
  if (!inView(state, LX - 400, LX + 400)) return;
  still(c, 'spc-needlebase', LX, GY, -380, -562, 760, 564, paintBase);
};

/** `mid`: what goes on the walk, in front of the shops but behind the furniture (the track, the gear, the landing). */
export const drawDragBack = (c: Ctx, state: GameState, mid?: () => void) => {
  const v = viewOf(state);
  drawGoingBack(c, v, GROUND);
  drawSides(c, v, BLOCKS);
  for (const sh of SHOPS) drawShopFront(c, state, sh, GY);
  base(c, state);
  drawPlayPlane(c, v, GROUND);
  drawPitDressing(c, v, GROUND);
  mid?.();
  signs(c, state);
  for (const rx of LAMPS) if (inView(state, X(rx) - 50, X(rx) + 60)) drawLamp(c, X(rx), GY, state.frame);
  ledges(c, state);
};

export const drawDragSpeakers = (c: Ctx, state: GameState, talking: boolean) => {
  for (const [rx, h] of SPEAKERS) if (inView(state, X(rx) - 40, X(rx) + 40)) drawSpeaker(c, X(rx), GY, h, talking, state.frame);
};

export const dragLamps = (): Light[] => [
  ...LAMPS.map(rx => ({ x: X(rx) + 28, y: GY - 180, r: 150, a: 0.85, color: '#FFE9A8' })),
  { x: X(LIFT_X), y: GY - 100, r: 260, a: 0.9, color: '#FDE68A' },
];
