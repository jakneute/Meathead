// Futureland's street furniture (the square's and the main drag's; the walk in paints the same): the googie lamps (a
// chrome pole, a boomerang arm, a starburst lamp: lit after dark), the PA's horn speakers, the big signs up on posts,
// the FUTURELAND gate, the rocket trash cans (FEED ME), the planters. Each painted once for the hour (still()).

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { type Ctx, INK, box, checker, mix, poly, still, inView, board, chromePole, starburst, ball, slab, ramp6, lit, steppedGlow, timeOfDay, CHROME, PINK, TEAL, LIP } from './paint';

// ---------------------------------------------------------------------------------------------------------------
// The lamps

/** A googie lamp, its feet at (0, 0): a chrome pole on a finned foot, a boomerang arm, a starburst round the bulb. */
export const paintLamp = (g: Ctx, on: boolean) => {
  // (the foot: three fins round a collar)
  poly(g, [[-14, 0], [-3, -22], [-3, 0]], INK); poly(g, [[-12, -1], [-3, -19], [-3, -1]], PINK[3]); poly(g, [[-12, -1], [-6, -12], [-3, -1]], PINK[4]);
  poly(g, [[14, 0], [3, -22], [3, 0]], INK); poly(g, [[12, -1], [3, -19], [3, -1]], PINK[2]);
  chromePole(g, 0, -170, 0, 6);
  for (const y of [-60, -120]) { box(g, -5, y, 10, 4, INK); box(g, -4, y + 1, 8, 2, TEAL[4]); }
  // (the arm: a boomerang out to the right, lit along its top)
  poly(g, [[-3, -170], [28, -184], [31, -176], [0, -161]], INK);
  poly(g, [[-1, -168], [27, -181], [29, -177], [1, -163]], CHROME[4]); poly(g, [[-1, -168], [27, -181], [27, -180], [-1, -167]], CHROME[6]);
  // (the lamp: a starburst round a bulb, a glass globe)
  starburst(g, 28, -180, 13, on ? '#FFE070' : '#E8C040');
  ball(g, 28, -180, 5, on ? '#FFF8D0' : '#F4F0E0');
};
export const drawLamp = (c: Ctx, x: number, y: number, f = 0) => {
  const on = lit();
  still(c, `spc-lamp-${on ? 1 : 0}`, x, y, -40, -200, 84, 202, g => paintLamp(g, on));
  // (its glow after dark: dim, stepped, two rings, a flicker now and then)
  if (on) { const k = timeOfDay().lamps * ((f + x) % 211 < 4 ? 0.5 : 1); steppedGlow(c, x + 28, y - 180, 30, '#FFE9A8', 0.22 * k, 0.04 * k, 3); }
};

// ---------------------------------------------------------------------------------------------------------------
// The PA's horns

/** A horn speaker on a pole (the PA), its feet at (0, 0), the horn `h` up. */
export const paintSpeaker = (g: Ctx, h: number) => {
  chromePole(g, 0, -h, 0, 4, CHROME);
  box(g, -6, -h + 4, 12, 6, INK); box(g, -5, -h + 5, 10, 4, CHROME[2]);
  // (the horn: a flared cone, banded, its mouth dark)
  poly(g, [[-3, -h - 3], [23, -h - 16], [23, h > 0 ? -h + 12 : 0], [-3, -h + 3]], INK);
  poly(g, [[-1, -h - 2], [21, -h - 14], [21, -h + 10], [-1, -h + 2]], CHROME[4]);
  poly(g, [[-1, -h - 2], [21, -h - 14], [21, -h - 9], [-1, -h - 1]], CHROME[6]);
  poly(g, [[8, -h + 4], [21, -h + 10], [21, -h + 4], [8, -h + 1]], CHROME[2]);
  box(g, 19, -h - 13, 4, 22, CHROME[1]);
  for (let k = 0; k < 3; k++) box(g, 4 + k * 6, -h - 4 - k * 3, 1, 8 + k * 6, CHROME[3]);
};
export const drawSpeaker = (c: Ctx, x: number, y: number, h: number, talking: boolean, f: number) => {
  still(c, `spc-spk-${h}`, x, y, -20, -h - 24, 52, h + 26, g => paintSpeaker(g, h));
  // (talking: rings coming off it, stepped)
  if (talking) for (let k = 0; k < 3; k++) {
    const r = 6 + k * 6 + ((f >> 2) % 3) * 2;
    c.strokeStyle = k ? (k === 1 ? '#FCD34D' : '#B8860B') : '#FEF3C7'; c.lineWidth = 2;
    c.beginPath(); c.arc(x + 24, y - h - 2, r, -0.7, 0.7); c.stroke();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The big signs up on posts

/** A big sign: two chrome posts (or one pylon), the main board (bulbs round it), the joke on a smaller one under it. */
export const paintBigSign = (g: Ctx, h: number, a: string, b: string, bg = '#0F172A', ink = '#FDE047', pylon = false) => {
  if (pylon) { chromePole(g, 0, -h + 10, 0, 10); for (let y = -h + 40; y < -10; y += 40) { box(g, -7, y, 14, 4, INK); box(g, -6, y + 1, 12, 2, PINK[4]); } }
  else for (const px of [-147, 147]) chromePole(g, px, -h + 10, 0, 6);
  board(g, 0, -h, a, bg, ink, 9, 8, true);
  board(g, 0, -h + 26, b, '#FFFFFF', '#0F766E', 6, 5);
};
export const drawBigSign = (c: Ctx, state: GameState, key: string, x: number, h: number, a: string, b: string, bg?: string, ink?: string, pylon = false) => {
  if (!inView(state, x - 240, x + 240)) return;
  still(c, `spc-sign-${key}`, x, GY, -240, -h - 44, 480, h + 46, g => paintBigSign(g, h, a, b, bg, ink, pylon));
};

// ---------------------------------------------------------------------------------------------------------------
// The FUTURELAND gate

/** The gate, its middle at (0, 0) on the ground: two fiberglass pylons ringed in chrome, a boomerang arch between them
 *  (bulbs along it), FUTURELAND up on it, THE WORLD OF TOMORROW! under, a starburst on top, a rocket on each pylon. */
export const paintGate = (g: Ctx) => {
  const on = lit(), W = ramp6('#F4F6FA'), P = ramp6('#E8659E');
  for (const s of [-1, 1]) {
    const x = s * 200;
    box(g, x - 15, -282, 30, 282, INK);
    slab(g, x - 14, -281, 28, 281, W, false);
    for (let y = -250; y < -10; y += 46) { box(g, x - 16, y, 32, 7, INK); box(g, x - 15, y + 1, 30, 5, TEAL[3]); box(g, x - 15, y + 1, 30, 1, TEAL[5]); box(g, x + 9, y + 1, 6, 5, TEAL[1]); }
    box(g, x - 20, -10, 40, 10, INK); box(g, x - 19, -9, 38, 9, CHROME[3]); box(g, x - 19, -9, 38, 2, CHROME[5]);
    // (a rocket up on top of each)
    poly(g, [[x - 8, -282], [x - 8, -306], [x, -326], [x + 8, -306], [x + 8, -282]], INK);
    poly(g, [[x - 7, -283], [x - 7, -305], [x, -323], [x + 7, -305], [x + 7, -283]], W[3]);
    poly(g, [[x - 7, -283], [x - 7, -305], [x - 3, -315], [x - 3, -283]], W[5]);
    box(g, x - 7, -300, 14, 4, PINK[3]);
    for (const fs of [-1, 1]) poly(g, [[x + fs * 7, -296], [x + fs * 14, -282], [x + fs * 7, -284]], PINK[2]);
  }
  // (the arch: a curved band, pink, lit along its top edge, shaded under)
  const arch = (dy: number, dx: number) => { g.beginPath(); g.moveTo(-244 + dx, -250 + dy); g.quadraticCurveTo(0, -334 + dy, 244 - dx, -250 + dy); };
  g.fillStyle = INK; arch(0, 0); g.lineTo(244, -224); g.quadraticCurveTo(0, -298, -244, -224); g.closePath(); g.fill();
  g.fillStyle = P[3]; arch(3, 4); g.lineTo(240, -228); g.quadraticCurveTo(0, -302, -240, -228); g.closePath(); g.fill();
  g.fillStyle = P[1]; g.beginPath(); g.moveTo(-240, -235); g.quadraticCurveTo(0, -310, 240, -235); g.lineTo(240, -228); g.quadraticCurveTo(0, -302, -240, -228); g.closePath(); g.fill();
  g.strokeStyle = P[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(-238, -246); g.quadraticCurveTo(0, -328, 238, -246); g.stroke();
  for (let k = 0.04; k < 1; k += 0.048) { const u = k, x = -230 + 460 * u, y = (1 - u) * (1 - u) * -247 + 2 * (1 - u) * u * -330 + u * u * -247; box(g, x - 1, y + 1, 3, 3, on ? '#FFF3B0' : '#F4D060'); }
  starburst(g, 0, -306, 26);
  board(g, 0, -252, 'FUTURELAND', '#0F172A', '#5EEAD4', 14, 10, true);
  board(g, 0, -212, 'THE WORLD OF TOMORROW! (SINCE 1962)', '#FFFFFF', '#BE185D', 7, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// The rocket trash can, the planter

/** A rocket trash can (w by h, its foot at (0, 0) at its left): white fiberglass, red fins, a porthole mouth, FEED
 *  ME on its side; its nose cut flat (stand on it: lit). */
export const paintTrashCan = (g: Ctx, w: number, h: number) => {
  const R = ramp6('#F4F6FA');
  for (const s of [-1, 1]) { const x = s < 0 ? 0 : w; poly(g, [[x, -30], [x + s * 10, 0], [x, -2]], INK); poly(g, [[x, -27], [x + s * 8, -1], [x, -3]], s < 0 ? '#EF4444' : '#B91C1C'); }
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  slab(g, 0, -h, w, h, R, false);
  box(g, 0, -h + 8, w, 4, '#EF4444'); box(g, 0, -h + 8, w, 1, '#FCA5A5');
  g.fillStyle = INK; g.beginPath(); g.arc(w / 2, -h + 26, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = CHROME[3]; g.beginPath(); g.arc(w / 2, -h + 26, 8, Math.PI * 1.1, Math.PI * 1.6); g.lineTo(w / 2, -h + 26); g.fill();
  g.font = '5px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#B91C1C'; g.fillText('FEED', w / 2, -h + 46); g.fillText('ME', w / 2, -h + 54); g.textAlign = 'left';
  box(g, 0, -12, w, 12, R[2]); checker(g, 0, -16, w, 4, R[2], 0, 1);
  // (the top: lit, it's to stand on)
  box(g, -1, -h - 1, w + 2, 3, LIP[2]); box(g, -1, -h - 1, w + 2, 1, LIP[3]);
};
/** A planter (pink fiberglass, a clipped hedge and flowers along it; its lit rim to stand on). */
export const paintPlanter = (g: Ctx, w: number, h: number) => {
  const R = ramp6('#F59AC2');
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  slab(g, 0, -h, w, h, R);
  for (let x = 6; x < w - 4; x += 14) box(g, x, -h + 14, 6, h - 22, R[2]);
  for (let k = 0; k < 5; k++) { const x = 8 + k * 16; g.fillStyle = INK; g.beginPath(); g.arc(x, -h - 2, 10, Math.PI, 0); g.fill(); g.fillStyle = '#2E7A4A'; g.beginPath(); g.arc(x, -h - 2, 9, Math.PI, 0); g.fill(); g.fillStyle = '#4EB060'; g.beginPath(); g.arc(x - 2, -h - 5, 5, Math.PI, 0); g.fill(); box(g, x - 2, -h - 8, 2, 2, ['#FDE047', '#F472B6', '#F8FAFC'][k % 3]); }
  box(g, -1, -h - 1, w + 2, 3, LIP[2]); box(g, -1, -h - 1, w + 2, 1, LIP[3]);
  void mix;
};
