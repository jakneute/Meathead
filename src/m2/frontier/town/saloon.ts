// The saloon, drawn (the final pass: peak SNES). At the play plane (its walls and doors are his: the batwings in its
// left end, the locked back door in its right, its roof he can stand on).
//
// Outside: its long two-story side (clapboard in oxblood, the corner boards and belt course in cream), SALOON painted
// big across the top under the roof's lit edge, the rooms' windows upstairs (a lamp in each after dark, a curtain, the
// odd silhouette), a balcony painted on (the park's trompe l'oeil: flat, dimmed, no lip: not to stand on), the windows
// and posters downstairs, WHISKEY CARDS CAN-CAN ROOMS, lamps; its ends going back (the batwings' end, the back door's),
// its roof going back.
//
// In it (him inside, or the brawl on), opened up toward him: the floor's planks going back to the back wall, the
// ceiling's pressed tin and beams, the back wall's flocked paper over a varnished wainscot (the stage's red curtain and
// its proscenium, the back bar's mirror with the room dim in it and its shelves of bottles, WANTED posters, the painting
// of a horse, the rooms' doors upstairs), the side walls going back (the batwings in the left, the back door in the
// right), the stage's boards and footlights, the card tables (green baize, cards and chips, chairs), the long bar (its
// paneled front, the brass foot rail, spittoons, its top going back), the barkeep behind it (ducked in the brawl), the
// stairs up (treads lit) and the balcony's floor and rail, the piano under them and its player, the chandeliers.

import type { GameState } from '../../../m1/game/core/state';
import { signText, fit } from '../../signLetters';
import { GY } from '../geometry';
import {
  type Ctx, type TownView, box, checker, mix, hash, at, poly, still, stillAt, atDepth, sideBack, topBack, underBack, INK,
  hr, hr7, clapboard, sash, door, western, signPaint, warmth, lampsOn, BRASS, TAR, TOPLIP, VARNISH, PLANK, STEEL, CREAM,
} from './paint';
import { townOf } from './state';
import { SALOON, X, Y, inSaloon } from './layout';
import { drawGuest } from './people';

/** The back wall's depth (the room's own), the walls' and roof's. */
const BK = 0.84;
const OXBLOOD = '#7A2E22', TRIM = '#E8D8B0';

// ---------------------------------------------------------------------------------------------------------------
// Outside

const paintOutside = (g: Ctx) => {
  const a = SALOON.a, b = SALOON.b, w = b - a, roof = Y(486) - GY;
  const R = hr7(OXBLOOD), T = hr7(TRIM), V = hr('varn', VARNISH), warm = warmth();
  box(g, -1, roof - 1, w + 2, -roof + 1, INK);
  clapboard(g, 0, roof, w, -roof, R, 10, 3800);
  // (the roof's edge: a cornice, brackets, its lit lip (stand on it))
  box(g, -6, roof - 2, w + 12, 18, INK); box(g, -5, roof - 1, w + 10, 16, T[3]); box(g, -5, roof + 13, w + 10, 2, T[1]);
  for (let x = 4; x < w - 4; x += 22) { box(g, x, roof + 15, 7, 12, T[2]); box(g, x, roof + 15, 2, 12, T[4]); box(g, x + 1, roof + 27, 5, 2, T[1]); }
  const L = hr('lip', TOPLIP); box(g, -5, roof - 1, w + 10, 1, L[3]); box(g, -5, roof, w + 10, 1, L[2]); box(g, -5, roof + 1, w + 10, 1, L[1]);
  // (SALOON painted big across the top band: shadowed, the paint chipped)
  const big = western(5, '#F2E2B8', R[0], INK);
  signText(g, 'SALOON', w / 2, roof + 76, big);
  for (let k = 0; k < 18; k++) box(g, w / 2 - 170 + hash(k * 3.1) * 340, roof + 44 + hash(k * 1.7) * 30, 2, 1, R[3]);
  // (corner boards, the belt course between the floors)
  box(g, 0, roof, 8, -roof, T[3]); box(g, 0, roof, 2, -roof, T[5]); box(g, w - 8, roof, 8, -roof, T[2]); box(g, w - 2, roof, 2, -roof, T[1]);
  const belt = -228;
  box(g, 0, belt - 4, w, 8, T[3]); box(g, 0, belt - 4, w, 1, T[5]); box(g, 0, belt + 3, w, 1, T[1]);
  // (upstairs: the rooms' windows, a lamp in each after dark, curtains, the odd silhouette)
  for (let i = 0; i < 7; i++) {
    const wx = 80 + i * 140, wy = Y(380) - GY;
    sash(g, wx, wy, 52, 70, T, warm, ['#B8302A', '#E8B030', '#3A6A9A', '#7A3A8A'][i % 4]);
    if (warm > 0.3 && i % 3 === 1) { box(g, wx + 20, wy + 28, 14, 30, mix('#4A2E10', '#1C1209', 0.5)); g.fillStyle = mix('#4A2E10', '#1C1209', 0.5); g.beginPath(); g.arc(wx + 27, wy + 24, 7, 0, Math.PI * 2); g.fill(); }
  }
  // (the balcony painted on: flat, its "rail" and "floor" in paint, the park's (dimmed, no lip))
  g.globalAlpha = 0.5;
  box(g, 20, Y(262) - GY, w - 40, 8, R[1]); box(g, 20, Y(262) - GY + 8, w - 40, 4, R[0]);
  for (let x = 26; x < w - 24; x += 18) box(g, x, Y(300) - GY, 3, 38, R[1]);
  box(g, 20, Y(302) - GY, w - 40, 4, R[1]);
  g.globalAlpha = 1;
  // (downstairs: windows, the painted line, posters, lamps)
  for (let i = 0; i < 6; i++) { const wx = 150 + i * 140, wy = Y(200) - GY; sash(g, wx, wy, 56, 64, T, warm, i % 2 ? '#B8302A' : undefined); }
  const ln = fit('WHISKEY  CARDS  CAN-CAN  ROOMS', signPaint(2, '#F2D24A', R[0]), w - 80);
  box(g, 40, Y(240) - GY, w - 80, 28, mix(R[1], INK, 0.3)); box(g, 40, Y(240) - GY, w - 80, 2, R[4]);
  signText(g, 'WHISKEY  CARDS  CAN-CAN  ROOMS', w / 2, Y(240) - GY + 21, ln);
  for (const [px, words] of [[110, ['WANTED', 'ONE FARE']], [w - 150, ['NO', 'SPITTING']], [w / 2 - 20, ['CAN-CAN', '9 PM']]] as const) {
    box(g, px - 1, -122, 42, 52, INK); box(g, px, -121, 40, 50, '#E8DCB0'); box(g, px, -121, 40, 2, '#F8F0D8'); box(g, px + 36, -121, 4, 50, '#C8B890');
    signText(g, words[0], px + 20, -110, { sx: 1, sy: 1, fill: '#7F1D1D' }); box(g, px + 10, -106, 20, 18, '#A8A090'); signText(g, words[1], px + 20, -78, { sx: 1, sy: 1, fill: '#2A1A10' });
  }
  for (const lx of [60, w / 2 + 60, w - 60]) { box(g, lx - 2, -150, 8, 3, INK); box(g, lx + 2, -158, 9, 12, INK); box(g, lx + 3, -157, 7, 10, lampsOn() ? '#FFE8A0' : '#C8B890'); box(g, lx + 1, -160, 11, 3, BRASS[2]); }
  // (the boardwalk along its foot)
  box(g, -8, -8, w + 16, 8, V[3]); box(g, -8, -8, w + 16, 1, V[5]); for (let x = -8; x < w + 8; x += 18) box(g, x, -8, 1, 8, INK);
  checker(g, 0, -18, w, 10, R[1], 0);
};

/** The left doorway (the batwings: swinging, or barred with planks across in the brawl) and the back door (locked: a
 *  padlock and STAFF ONLY; open once it's won), at the play plane. */
const doors = (c: Ctx, state: GameState, inside: boolean) => {
  const tw = townOf(state), f = state.frame, a = SALOON.a, b = SALOON.b, dt = SALOON.doorTop;
  const brawl = tw.saloon.state === 'on', done = tw.saloon.state === 'done';
  const V = hr('varn', VARNISH), S = hr('steel', STEEL);
  // (the doorway: dark (outside looking in) or the street's light (inside looking out); its frame)
  box(c, a - 6, dt - 4, 26, GY - dt + 4, INK);
  if (inside) { box(c, a - 4, dt, 22, GY - dt, mix('#E8D8B0', '#2A3448', 1 - warmth() * 0.2)); box(c, a - 4, dt, 22, 20, '#BFE0F8'); } else box(c, a - 4, dt, 22, GY - dt, '#140C08');
  box(c, a - 6, dt - 4, 26, 4, V[4]);
  if (brawl) {
    for (const y of [Y(90), Y(40)]) { box(c, a - 14, y, 42, 12, INK); box(c, a - 13, y + 1, 40, 10, V[3]); box(c, a - 13, y + 1, 40, 2, V[5]); box(c, a - 10, y + 4, 2, 2, S[5]); box(c, a + 22, y + 4, 2, 2, S[5]); }
  } else {
    // (the batwings: two louvered half-doors swinging)
    const sw = Math.sin(f * 0.05) * 3;
    for (const [dx, k] of [[-4, 1], [8, -1]] as const) {
      const x = a + dx + sw * k, y = Y(98);
      box(c, x - 1, y - 1, 12, 54, INK); box(c, x, y, 10, 52, V[3]); box(c, x, y, 10, 2, V[5]);
      for (let ly = y + 6; ly < y + 46; ly += 5) box(c, x + 1, ly, 8, 2, V[2]);
      c.fillStyle = INK; c.beginPath(); c.arc(x + 5, y, 5, Math.PI, 0); c.fill(); c.fillStyle = V[4]; c.beginPath(); c.arc(x + 5, y, 4, Math.PI, 0); c.fill();
    }
  }
  // (the back door)
  box(c, b - 14, dt - 4, 24, GY - dt + 4, INK);
  if (!done) {
    box(c, b - 12, dt, 20, GY - dt, V[3]);
    for (let y = dt + 10; y < GY; y += 14) { box(c, b - 12, y, 20, 2, V[1]); box(c, b - 12, y + 2, 20, 1, V[5]); }
    box(c, b - 12, dt, 3, GY - dt, V[4]);
    box(c, b - 8, Y(60), 10, 12, INK); box(c, b - 7, Y(60) + 1, 8, 10, S[4]); box(c, b - 6, Y(68), 6, 6, INK); box(c, b - 7, Y(60) + 1, 3, 3, S[6]);
    if (inside) { box(c, b - 116, Y(162), 92, 22, INK); box(c, b - 115, Y(161), 90, 20, '#7F1D1D'); box(c, b - 115, Y(161), 90, 2, '#B83A2A'); signText(c, 'STAFF ONLY', b - 70, Y(161) + 14, signPaint(1, '#FEF3C7', '#3A0A06')); }
  } else { box(c, b - 12, dt, 20, GY - dt, '#BFE0F8'); box(c, b - 12, GY - 40, 20, 40, '#C8B080'); }
};

// ---------------------------------------------------------------------------------------------------------------
// In it

/** The back wall (local: the room's left foot at (0, 0), at the play plane's scale; drawn back at BK). */
const paintBackWall = (g: Ctx) => {
  const a = SALOON.a, w = SALOON.b - a, top = Y(470) - GY;
  const P = hr7('#5A2430'), V = hr('varn', VARNISH), T = hr7('#C8A040'), Cr = hr('cream', CREAM);
  // (flocked paper: a damask stripe, banded darker up top in the lamp smoke)
  box(g, 0, top, w, -top, P[3]);
  for (let x = 0; x < w; x += 24) { box(g, x, top, 10, -top, P[2]); for (let y = top + 10; y < -90; y += 22) { box(g, x + 14, y + ((x / 24) % 2) * 11, 4, 6, P[4]); box(g, x + 15, y + 2 + ((x / 24) % 2) * 11, 2, 2, P[5]); } }
  for (let k = 0; k < 4; k++) { g.globalAlpha = 0.1 + k * 0.05; box(g, 0, top + k * 18, w, 18, '#1A0A08'); }
  g.globalAlpha = 1;
  // (the wainscot: varnished panels, a chair rail)
  box(g, 0, -86, w, 86, V[2]);
  for (let x = 8; x < w - 30; x += 44) { box(g, x, -76, 36, 64, V[1]); box(g, x + 2, -74, 32, 60, V[3]); box(g, x + 2, -74, 32, 2, V[5]); box(g, x + 32, -74, 2, 60, V[1]); }
  box(g, 0, -90, w, 6, V[4]); box(g, 0, -90, w, 1, V[6]); box(g, 0, -10, w, 10, V[1]);
  // (the stage's proscenium, its red velvet curtain in folds, CAN-CAN up top)
  const sx = X(3840) - a, sw = 230;
  box(g, sx - 4, Y(262) - GY - 4, sw + 8, Y(36) - Y(262) + 4, INK);
  for (let k = 0; k < sw; k += 10) { const col = ['#5E0C14', '#8A1426', '#B4243A', '#8A1426'][((Math.floor(k / 10) % 4) + 4) % 4]; box(g, sx + k, Y(248) - GY, 10, Y(36) - Y(248), col); box(g, sx + k + 1, Y(248) - GY, 2, Y(36) - Y(248), (k / 10) % 4 === 2 ? '#D84A5A' : col); }
  for (let k = 0; k < sw; k += 14) { g.fillStyle = '#C8962E'; g.beginPath(); g.arc(sx + k + 7, Y(248) - GY, 7, 0, Math.PI); g.fill(); }
  box(g, sx - 6, Y(266) - GY, sw + 12, 22, T[3]); box(g, sx - 6, Y(266) - GY, sw + 12, 3, T[5]); box(g, sx - 6, Y(266) - GY + 19, sw + 12, 3, T[1]);
  signText(g, 'CAN-CAN', sx + sw / 2, Y(266) - GY + 16, western(1, '#7F1D1D', T[1]));
  // (WANTED posters; the painting of a horse in its gilt frame)
  for (const [px, words] of [[X(4110) - a, ['WANTED', '$4 FARE']], [X(4180) - a, ['WANTED', 'CHEATS']]] as const) {
    const py = Y(200) - GY;
    box(g, px - 1, py - 1, 52, 66, INK); box(g, px, py, 50, 64, Cr[5]); box(g, px, py, 50, 2, Cr[6]); box(g, px + 46, py, 4, 64, Cr[3]);
    signText(g, words[0], px + 25, py + 12, { sx: 1, sy: 1, fill: '#7F1D1D', shadow: Cr[4] }); box(g, px + 13, py + 18, 24, 22, Cr[2]); box(g, px + 18, py + 22, 14, 12, Cr[1]);
    signText(g, words[1], px + 25, py + 54, { sx: 1, sy: 1, fill: '#2A1A10' });
  }
  const hx = X(4600) - a, hy = Y(330) - GY;
  box(g, hx - 1, hy - 1, 92, 62, INK); box(g, hx, hy, 90, 60, T[3]); box(g, hx, hy, 90, 2, T[5]); box(g, hx + 4, hy + 4, 82, 52, '#5A7A5A'); box(g, hx + 4, hy + 4, 82, 20, '#8AA8C0');
  g.fillStyle = '#5A3A1E'; g.beginPath(); g.ellipse(hx + 45, hy + 32, 20, 8, 0, 0, Math.PI * 2); g.fill(); box(g, hx + 25, hy + 32, 4, 14, '#5A3A1E'); box(g, hx + 58, hy + 32, 4, 14, '#5A3A1E'); box(g, hx + 61, hy + 20, 8, 12, '#5A3A1E'); box(g, hx + 64, hy + 18, 6, 4, '#3A2414');
  // (the back bar: shelves of bottles over the long mirror, its carved top)
  const bx = X(4260) - a, by = Y(180) - GY;
  box(g, bx - 1, by - 13, 292, 124, INK); box(g, bx, by - 12, 290, 122, V[2]);
  for (let k = 0; k < 6; k++) { box(g, bx + 6 + k * 48, by - 18, 36, 8, V[3]); box(g, bx + 6 + k * 48, by - 18, 36, 2, V[5]); }
  box(g, bx + 26, by + 2, 238, 52, '#5A6E7A'); box(g, bx + 28, by + 4, 234, 48, '#7A90A0'); box(g, bx + 30, by + 6, 40, 4, '#C8D8E4'); for (let k = 0; k < 6; k++) box(g, bx + 40 + k * 36, by + 30, 8, 22, '#4A5A66');
  for (const sy of [by + 70, by + 96]) { box(g, bx + 4, sy, 282, 4, V[4]); box(g, bx + 4, sy, 282, 1, V[6]); for (let k = 0; k < 22; k++) { const col = ['#8A5A20', '#3E7A3A', '#7F1D1D', '#D9C08A', '#2A2A3A'][k % 5], h = 18 - (k % 3) * 3; box(g, bx + 8 + k * 12, sy - h, 7, h, col); box(g, bx + 10 + k * 12, sy - h - 4, 3, 4, col); box(g, bx + 9 + k * 12, sy - h + 2, 1, h - 4, mix(col, '#FFFFFF', 0.35)); box(g, bx + 8 + k * 12, sy - h + 6, 7, 4, '#E8DCB0'); } }
  // (the rooms' doors upstairs, numbered)
  for (let i = 0; i < 3; i++) { const dx = X(4300) - a + i * 140; door(g, dx, Y(310) - GY, 56, 106, V); signText(g, String(i + 1), dx + 28, Y(290) - GY, { sx: 1, sy: 1, fill: '#E8C25A', shadow: INK }); }
};

/** In it: the room opened up toward him. */
const drawInside = (c: Ctx, state: GameState, v: TownView) => {
  const tw = townOf(state), f = state.frame, eye = v.eye, a = SALOON.a, b = SALOON.b, top = Y(470);
  const brawl = tw.saloon.state === 'on';
  const V = hr('varn', VARNISH), P = hr7('#5A2430'), Fl = hr7('#7A5434'), Tin = hr7('#A89870');
  // (the side walls going back, the ceiling's underside, the floor going back)
  sideBack(c, eye, a, 1, top, GY, 1, BK, [P[2], P[2], P[3], P[3], P[4]], 4, false);
  sideBack(c, eye, b, -1, top, GY, 1, BK, [P[2], P[2], P[3], P[3], P[4]], 4, false);
  for (const [e, side] of [[a, 1], [b, -1]] as const) {
    if ((eye.x - e) * side <= 1) continue;
    // (the wainscot along them)
    poly(c, [at(eye, e, GY - 86, 1), at(eye, e, GY - 86, BK), at(eye, e, GY, BK), at(eye, e, GY, 1)], V[2]);
    const [p0x, p0y] = at(eye, e, GY - 88, 1), [p1x, p1y] = at(eye, e, GY - 88, BK);
    c.strokeStyle = V[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(p0x, p0y); c.lineTo(p1x, p1y); c.stroke();
  }
  underBack(c, eye, a, b, top, 1, BK, [Tin[1], Tin[2], Tin[2]], 3);
  if (eye.y > top + 1) for (let k = 0; k < 6; k++) { const d = 1 - (1 - BK) * ((k + 0.5) / 6), [p0, py] = at(eye, a, top, d), [p1] = at(eye, b, top, d); box(c, p0, py, p1 - p0, 2, Tin[4]); }
  if (eye.y < GY - 1) {
    for (let i = 0; i < 6; i++) { const d0 = 1 - ((1 - BK) * i) / 6, d1 = 1 - ((1 - BK) * (i + 1)) / 6; poly(c, [at(eye, a, GY, d0), at(eye, b, GY, d0), at(eye, b, GY, d1), at(eye, a, GY, d1)], i % 2 ? Fl[3] : Fl[4]); }
    for (let x = a + 40; x < b; x += 60) { const [p0, q0] = at(eye, x, GY, 1), [p1, q1] = at(eye, x, GY, BK); c.strokeStyle = Fl[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
  }
  // (the back wall)
  stillAt(c, v, BK, 'saloon-back', a, GY, -2, top - GY - 2, b - a + 4, GY - top + 4, paintBackWall);
  // (the chandeliers, hung back a little, their candles flickering)
  for (const lx of [X(4000), X(4400), X(4750)]) atDepth(c, eye, 0.93, () => {
    const B = BRASS;
    box(c, lx - 1, top, 2, 50, INK);
    box(c, lx - 30, top + 50, 60, 6, INK); box(c, lx - 29, top + 51, 58, 4, B[3]); box(c, lx - 29, top + 51, 58, 1, B[5]);
    c.strokeStyle = B[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(lx - 26, top + 54); c.quadraticCurveTo(lx, top + 70, lx + 26, top + 54); c.stroke();
    for (let k = -2; k <= 2; k++) { box(c, lx + k * 12 - 2, top + 42, 4, 9, '#F5F0DC'); box(c, lx + k * 12 - 1, top + 37 - ((f + k * 3) % 8 < 4 ? 1 : 0), 2, 5, '#FDE047'); box(c, lx + k * 12, top + 38, 1, 2, '#FFFFFF'); }
    for (let k = 0; k < 5; k++) box(c, lx - 20 + k * 10, top + 58 + (k % 2) * 3, 2, 4, '#E8F0F8');
  });
  // (the stage's boards going back, its front at the play plane (lit: stand on it), footlights)
  const st = Y(36);
  topBack(c, eye, X(3850), X(4060), st, 1, BK, [Fl[2], Fl[3], Fl[4], Fl[4], Fl[5]], 3);
  box(c, X(3850) - 1, st - 1, X(4060) - X(3850) + 2, GY - st + 1, INK); box(c, X(3850), st, X(4060) - X(3850), GY - st, V[2]);
  for (let x = X(3850) + 6; x < X(4060) - 6; x += 30) { box(c, x, st + 8, 22, GY - st - 14, V[1]); box(c, x, st + 8, 22, 1, V[4]); }
  const L = hr('lip', TOPLIP); box(c, X(3850), st, X(4060) - X(3850), 1, L[3]); box(c, X(3850), st + 1, X(4060) - X(3850), 1, L[2]); box(c, X(3850), st + 2, X(4060) - X(3850), 1, L[1]);
  for (let k = 0; k < 7; k++) { const fx = X(3862) + k * 30; box(c, fx - 1, st - 5, 8, 5, INK); box(c, fx, st - 4, 6, 4, (f % 20 < 10) === (k % 2 === 0) ? '#FEF08A' : '#CA8A04'); }
  // (the barkeep behind the bar: polishing a glass; ducked behind it in the brawl, peeking)
  const duck = brawl ? 34 + Math.sin(f * 0.1) * 4 : 0;
  c.save(); c.beginPath(); c.rect(X(4250), Y(300), 320, Y(52) - Y(300)); c.clip();
  atDepth(c, eye, 0.93, () => drawGuest(c, X(4470), GY - 4 + duck, { seed: 333, f, outfit: 'barkeep', mood: brawl ? 'scared' : 'bored', facing: -1 }));
  c.restore();
  // (the balcony's floor going back to the rooms' doors, its underside, its rail at the front; the posts under it)
  const by = Y(200);
  topBack(c, eye, X(4260), X(4720), by, 1, BK, [Fl[2], Fl[3], Fl[4], Fl[4], Fl[5]], 3);
  underBack(c, eye, X(4260), X(4720), by + 12, 1, BK, [V[0], V[1], V[1]], 3);
  for (const px of [X(4270), X(4500), X(4710)]) { box(c, px - 5, by + 12, 10, GY - by - 12, INK); box(c, px - 4, by + 12, 8, GY - by - 12, V[3]); box(c, px - 4, by + 12, 2, GY - by - 12, V[5]); }
  // (the stairs up and the piano under them, all from the room's one eye (the playtest's: they looked off). An open
  // stair: its treads exactly on the ledges he stands on ([4720,4780] at 150, [4780,4840] at 100, [4840,4892] at 50,
  // the balcony's floor at 200 above them), each going back to ST_BK with its lit lip at the front, the risers' faces
  // seen in perspective, carried on two sawtooth stringers (the far one back at ST_BK, the near one at the play plane).
  // The piano stands on the floor between the stringers (its front at 0.95, its top and end going back to 0.9) under the
  // high treads, clear of the low one: drawn after the far stringer, before the treads and the near one.)
  const ST_BK = 0.92, STEPS = [[4720, 4780, 150], [4780, 4840, 100], [4840, 4892, 50]] as const;
  const stringer = (col: string, lit: string) => {
    // (the sawtooth under the treads; its underside a straight run from under the top tread down to the floor)
    const pts: [number, number][] = [[X(4720), Y(200) + 12], [X(4720), Y(150) + 8], [X(4780), Y(150) + 8], [X(4780), Y(100) + 8], [X(4840), Y(100) + 8], [X(4840), Y(50) + 8], [X(4892), Y(50) + 8], [X(4892), GY], [X(4866), GY], [X(4720), Y(126)]];
    poly(c, pts, col);
    c.strokeStyle = INK; c.lineWidth = 2; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) c.lineTo(x, y); c.closePath(); c.stroke();
    c.strokeStyle = lit; c.lineWidth = 1; c.beginPath(); c.moveTo(X(4720) + 1, Y(126) - 1); c.lineTo(X(4866) - 1, GY - 1); c.stroke();
  };
  atDepth(c, eye, ST_BK, () => stringer(V[1], V[2]));
  // (the piano: an upright on the floor, its end and lid going back, the front cached; its player behind it, playing on
  // through anything)
  const pa = X(4726), pb = X(4822), pt = GY - 77;
  sideBack(c, eye, pa, -1, pt, GY, 0.95, 0.9, [V[1], V[1], V[2], V[2], V[3]], 2, false);
  sideBack(c, eye, pb, 1, pt, GY, 0.95, 0.9, [V[1], V[1], V[2], V[2], V[3]], 2, false);
  topBack(c, eye, pa, pb, pt, 0.95, 0.9, [V[2], V[3], V[4], V[4], V[5]], 2);
  atDepth(c, eye, 0.95, () => {
    drawGuest(c, X(4746), GY - 4, { seed: 517, f: f + (brawl ? f : 0), outfit: 'pianist', pose: 'sit', mood: brawl ? 'scared' : 'happy' });
    still(c, 'saloon-piano', pa, GY, -2, -92, 102, 94, g => {
      box(g, -1, -77, 98, 77, INK); box(g, 0, -76, 96, 76, V[2]); box(g, 0, -76, 96, 3, V[4]); box(g, 0, -76, 4, 76, V[3]);
      for (let k = 0; k < 3; k++) { box(g, 10 + k * 28, -66, 22, 22, V[1]); box(g, 10 + k * 28, -66, 22, 1, V[4]); }
      box(g, 2, -40, 92, 8, '#F5F5F4'); box(g, 2, -40, 92, 1, '#FFFFFF'); for (let k = 0; k < 11; k++) box(g, 5 + k * 8, -40, 3, 5, '#1C1917');
      box(g, 2, -32, 92, 3, V[1]); box(g, 8, -8, 6, 8, V[1]); box(g, 82, -8, 6, 8, V[1]);
      box(g, 39, -89, 20, 13, INK); box(g, 40, -88, 18, 12, '#E8DCB0'); box(g, 42, -86, 14, 1, '#5A4A3A'); box(g, 42, -83, 14, 1, '#5A4A3A');
    });
  });
  // (the treads' tops going back and the risers' faces (seen past their ends, from the eye), then the near stringer,
  // the treads' fronts with their lit lips (where he stands), the rail on its balusters, the newel at the foot)
  for (const [sa, sb, sh] of STEPS) {
    const y = Y(sh);
    topBack(c, eye, X(sa), X(sb), y, 1, ST_BK, [Fl[3], Fl[4], Fl[5], Fl[5], Fl[6]], 2);
    sideBack(c, eye, X(sa), 1, Y(sh + 50), y, 1, ST_BK, [V[1], V[2], V[2], V[3], V[4]], 2, false);
  }
  sideBack(c, eye, X(4892), 1, Y(50), GY, 1, ST_BK, [V[1], V[2], V[2], V[3], V[4]], 2, false);
  stringer(V[2], V[4]);
  for (const [sa, sb, sh] of STEPS) {
    const y = Y(sh), w = X(sb) - X(sa);
    box(c, X(sa) - 1, y - 1, w + 2, 10, INK); box(c, X(sa), y, w, 8, V[3]); box(c, X(sa), y + 6, w, 2, V[1]); box(c, X(sb) - 3, y, 3, 8, V[2]);
    box(c, X(sa), y, w, 1, L[3]); box(c, X(sa), y + 1, w, 1, L[2]); box(c, X(sa), y + 2, w, 1, L[1]);
  }
  const railY = (x: number) => Y(236 - ((x - 4720) * 150) / 172);
  for (const [sa, sb, sh] of STEPS) for (const bx of [sa + 14, sa + 40]) { if (bx > sb - 6) continue; const x = X(bx), top = railY(bx); box(c, x - 1, top, 5, Y(sh) - top, INK); box(c, x, top, 3, Y(sh) - top, V[4]); box(c, x, top, 1, Y(sh) - top, V[6]); }
  const nx = X(4880), nt = railY(4880) - 8;
  box(c, nx - 4, nt, 10, Y(50) - nt, INK); box(c, nx - 3, nt + 1, 8, Y(50) - nt - 1, V[3]); box(c, nx - 3, nt + 1, 2, Y(50) - nt - 1, V[5]); box(c, nx - 5, nt - 4, 12, 6, INK); box(c, nx - 4, nt - 3, 10, 4, V[4]);
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(X(4716), railY(4716)); c.lineTo(X(4880), railY(4880)); c.stroke();
  c.strokeStyle = V[4]; c.lineWidth = 4; c.stroke(); c.strokeStyle = V[6]; c.lineWidth = 1; c.beginPath(); c.moveTo(X(4716), railY(4716) - 2); c.lineTo(X(4880), railY(4880) - 2); c.stroke();
  // (the card tables: green baize going back a little, cards and chips; their legs; a chair by each)
  for (const ta of [4110, 4620]) {
    const xa = X(ta), xb = X(ta + 70), tp = Y(40), G = hr7('#1E6A3A');
    topBack(c, eye, xa - 4, xb + 4, tp, 1, 0.94, [G[1], G[2], G[3], G[3], G[4]], 2);
    for (const lx of [xa + 6, xb - 10]) { box(c, lx - 1, tp + 8, 7, GY - tp - 8, INK); box(c, lx, tp + 8, 5, GY - tp - 8, V[2]); box(c, lx, tp + 8, 1, GY - tp - 8, V[4]); }
    box(c, xa - 5, tp - 1, xb - xa + 10, 10, INK); box(c, xa - 4, tp, xb - xa + 8, 8, G[3]); box(c, xa - 4, tp + 6, xb - xa + 8, 2, V[2]);
    box(c, xa - 4, tp, xb - xa + 8, 1, L[3]); box(c, xa - 4, tp + 1, xb - xa + 8, 1, L[2]);
    for (let k = 0; k < 4; k++) { box(c, xa + 8 + k * 14, tp - 3, 9, 3, INK); box(c, xa + 9 + k * 14, tp - 2, 7, 2, k % 2 ? '#F5F5F4' : '#DC2626'); }
    for (let k = 0; k < 3; k++) { box(c, xb - 20 + k * 2, tp - 3 - k * 2, 8, 2, ['#CA8A04', '#DC2626', '#1D4ED8'][k]); }
    const cx = ta === 4110 ? xa - 22 : xb + 10;
    box(c, cx, GY - 30, 14, 3, V[3]); box(c, cx, GY - 30, 2, 30, V[2]); box(c, cx + 12, GY - 30, 2, 30, V[2]); box(c, cx + (ta === 4110 ? 0 : 12), GY - 56, 2, 26, V[2]);
  }
};

/** The long bar (a solid: he can jump up on it): the paneled front, its top going back lit, the brass foot rail, the
 *  spittoons. */
export const drawBar = (c: Ctx, state: GameState, xa: number, xb: number, top: number) => {
  const v = { eye: { x: state.camera.x + 400, y: state.camera.y + 252 } };
  const V = hr('varn', VARNISH), L = hr('lip', TOPLIP), B = BRASS;
  topBack(c, v.eye, xa - 5, xb + 5, top, 1, 0.95, [V[2], V[3], V[4], V[4], V[5]], 2);
  box(c, xa - 6, top - 1, xb - xa + 12, GY - top + 1, INK); box(c, xa - 5, top, xb - xa + 10, 10, V[3]);
  box(c, xa - 5, top, xb - xa + 10, 1, L[3]); box(c, xa - 5, top + 1, xb - xa + 10, 1, L[2]); box(c, xa - 5, top + 2, xb - xa + 10, 1, L[1]);
  box(c, xa, top + 10, xb - xa, GY - top - 10, V[2]);
  for (let x = xa + 10; x < xb - 20; x += 60) { box(c, x, top + 18, 48, GY - top - 34, V[1]); box(c, x + 2, top + 20, 44, GY - top - 38, V[3]); box(c, x + 2, top + 20, 44, 2, V[5]); box(c, x + 44, top + 20, 2, GY - top - 38, V[1]); }
  box(c, xa - 4, GY - 12, xb - xa + 8, 4, INK); box(c, xa - 4, GY - 12, xb - xa + 8, 3, B[3]); box(c, xa - 4, GY - 12, xb - xa + 8, 1, B[5]);
  for (let x = xa + 20; x < xb; x += 70) { box(c, x, GY - 12, 3, 12, B[2]); box(c, x, GY - 12, 1, 12, B[4]); }
  for (const sx of [xa - 26, xb + 14]) {
    box(c, sx - 1, GY - 15, 16, 15, INK); box(c, sx, GY - 14, 14, 14, B[3]); box(c, sx, GY - 14, 4, 14, B[5]); box(c, sx + 10, GY - 14, 4, 14, B[1]);
    box(c, sx - 3, GY - 17, 20, 4, INK); box(c, sx - 2, GY - 16, 18, 2, B[4]);
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawSaloon = (c: Ctx, state: GameState, v: TownView) => {
  const p = state.player, eye = v.eye;
  const inside = inSaloon(p.pos.x + p.width / 2, p.pos.y + p.height);
  const a = SALOON.a, b = SALOON.b;
  if (!inside) {
    const R = hr7(OXBLOOD), Tr = hr('tar', TAR);
    // (its ends going back, its roof going back)
    sideBack(c, eye, a, -1, Y(486), GY, 1, BK, R, 4);
    sideBack(c, eye, b, 1, Y(486), GY, 1, BK, R, 4);
    topBack(c, eye, a - 5, b + 5, Y(486), 1, BK, [Tr[1], Tr[2], Tr[3], Tr[3], Tr[4]], 4);
    if (eye.y < Y(486) - 1) for (let k = 1; k < 5; k++) { const d = 1 - (1 - BK) * (k / 5), [p0, py] = at(eye, a - 5, Y(486), d), [p1] = at(eye, b + 5, Y(486), d); box(c, p0, py, p1 - p0, 1, Tr[1]); }
    still(c, 'saloon-out', a, GY, -10, Y(486) - GY - 4, b - a + 20, GY - Y(486) + 6, paintOutside);
    doors(c, state, false);
    return;
  }
  drawInside(c, state, v);
  // (the walls over the doors at the play plane: cut through, the timber showing)
  const W = hr('varn', VARNISH);
  for (const wx of [a - 8, b - 8]) { box(c, wx - 1, Y(470) - 1, 18, SALOON.doorTop - Y(470) + 1, INK); box(c, wx, Y(470), 16, SALOON.doorTop - Y(470), W[1]); box(c, wx, Y(470), 3, SALOON.doorTop - Y(470), W[3]); for (let y = Y(470) + 20; y < SALOON.doorTop; y += 40) box(c, wx, y, 16, 2, W[0]); }
  box(c, a - 1, Y(470) - 1, b - a + 2, 18, INK); box(c, a, Y(470), b - a, 16, W[1]); box(c, a, Y(470) + 14, b - a, 2, W[0]);
  doors(c, state, true);
  void mix; void PLANK; void hash;
};
