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
import { bust, randomBust, drawBust } from '../../grossBust';
import {
  type Ctx, type TownView, box, checker, mix, hash, at, poly, still, stillAt, atDepth, sideBack, topBack, underBack, INK,
  hr, hr7, clapboard, sash, door, western, signPaint, warmth, lampsOn, BRASS, TAR, TOPLIP, VARNISH, PLANK, STEEL, CREAM,
  skyAt, back7, bandedGradient, flame, halo,
} from './paint';
import { townOf } from './state';
import { SALOON, X, Y, inSaloon } from './layout';
import { drawGuest } from './people';
import { drawPianist } from './pianist';

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

/** The batwings' swing (degrees; + swung away from us, - toward), sprung shut, flapping a while after he goes through. */
const wing = { th: 0, om: 0, f: -1 };
const swingWings = (state: GameState, brawl: boolean) => {
  if (wing.f === state.frame) return wing.th;
  wing.f = state.frame;
  const p = state.player, cx = p.pos.x + p.width / 2, mid = SALOON.a + 7;
  if (brawl) { wing.th = 0; wing.om = 0; return 0; }
  if (Math.abs(cx - mid) < 20 + p.width / 2 && p.pos.y + p.height > SALOON.doorTop + 20 && Math.abs(p.vel.x) > 0.3) {
    const to = 78 * Math.sign(p.vel.x); wing.th += (to - wing.th) * 0.35; wing.om = 0;
  } else { wing.om += -wing.th * 0.05; wing.om *= 0.9; wing.th += wing.om; }
  return wing.th;
};

/** What's out the doorway (local: its foot's left at (0, 0), w wide, h tall), painted for the hour: the sky banded, the
 *  street's far side (a store front, its window lit after dark), the boardwalk going off, the dirt; `alley` the back
 *  door's (the next store's plank wall close by, the crate). */
const paintOut = (w: number, h: number, alley: boolean) => (g: Ctx) => {
  const S = [skyAt(0.15), skyAt(0.4), skyAt(0.7), skyAt(0.95)];
  for (let k = 0; k < 4; k++) box(g, 0, -h + (k * h * 0.5) / 4, w, h * 0.5 / 4 + 1, S[k]);
  const Fr = back7(alley ? '#8A6A4A' : '#A85A3A'), Wd = back7('#6A4A2E');
  if (alley) {
    // (the store's plank side wall across the alley, its shadow; the crate off the door)
    // (a pine over its roof; the wall in the alley's shade, a shuttered window; the sun on the dirt between)
    poly(g, [[w * 0.6, -h], [w + 2, -h * 0.58], [w * 0.2, -h * 0.58]], back7('#2E5A3A')[2]);
    box(g, 0, -h * 0.56, w, h * 0.56 - 14, Fr[1]); for (let x = 2; x < w; x += 5) box(g, x, -h * 0.56, 1, h * 0.56 - 14, Fr[0]); box(g, 0, -h * 0.56, w, 2, Fr[3]);
    box(g, 4, -h * 0.46, w - 8, 18, Fr[0]); box(g, 5, -h * 0.46 + 1, w / 2 - 6, 16, Fr[2]); box(g, w / 2 + 1, -h * 0.46 + 1, w / 2 - 6, 16, Fr[2]);
    box(g, w * 0.5, -38, w * 0.5, 24, Wd[3]); box(g, w * 0.5, -38, w * 0.5, 2, Wd[5]); box(g, w * 0.5, -26, w * 0.5, 2, Wd[1]); box(g, w * 0.5, -38, 1, 24, INK);
  } else {
    // (across the street: a false front, its sign board, a window (lit warm after dark), its porch posts)
    box(g, 0, -h * 0.72, w, h * 0.72, Fr[3]); box(g, 0, -h * 0.72, w, 3, Fr[5]); box(g, 0, -h * 0.66, w, 6, Fr[1]);
    for (let y = -h * 0.6; y < -24; y += 6) box(g, 0, y, w, 1, Fr[2]);
    box(g, 4, -h * 0.5, w - 8, 22, INK); box(g, 5, -h * 0.5 + 1, w - 10, 20, lampsOn() ? '#F8D890' : skyAt(0.5)); box(g, w / 2 - 1, -h * 0.5 + 1, 2, 20, Fr[1]); box(g, 5, -h * 0.5 + 1, w - 10, 2, lampsOn() ? '#FFF0C0' : skyAt(0.2));
    box(g, 2, -h * 0.24, 3, h * 0.24 - 12, Wd[2]); box(g, w - 5, -h * 0.24, 3, h * 0.24 - 12, Wd[2]);
  }
  // (the ground: the boardwalk's planks, the street's dirt banded)
  const D = back7('#A48254');
  box(g, 0, -14, w, 14, D[3]); box(g, 0, -14, w, 1, D[5]); for (let k = 0; k < 6; k++) box(g, (k * 7) % w, -10 + (k % 3) * 3, 3, 1, D[1]);
  box(g, 0, -6, w, 6, Wd[3]); box(g, 0, -6, w, 1, Wd[5]); for (let x = 2; x < w; x += 6) box(g, x, -5, 1, 5, Wd[1]);
  // (the light's edge: a haze down the doorway's sides)
  g.globalAlpha = 0.25; box(g, 0, -h, 2, h, '#FFFFFF'); box(g, w - 2, -h, 2, h, INK); g.globalAlpha = 1;
};

/** The room seen dim from the street (local as paintOut): warm and dark, a chandelier's glints, the backs of folk. */
const paintIn = (w: number, h: number) => (g: Ctx) => {
  bandedGradient(g, 0, -h, w, h, ['#2A1A10', '#1E120A', '#140C06'], 6);
  for (let k = 0; k < 4; k++) box(g, 3 + k * 6, -h + 18 + (k % 2) * 2, 2, 3, '#E8C870');
  g.globalAlpha = 0.18; box(g, 0, -h + 12, w, 16, '#F4C890'); g.globalAlpha = 1;
  box(g, 4, -46, 9, 30, '#0A0604'); box(g, 5, -54, 7, 8, '#0A0604'); box(g, w - 10, -40, 8, 26, '#0A0604');
  box(g, 0, -10, w, 10, '#1E140A'); box(g, 0, -10, w, 1, '#4A3018');
};

/** A batwing leaf hinged at x = hx (its free edge toward `s`), swung `th` degrees, from y0 down to y1, from one eye. */
const leaf = (c: Ctx, eye: { x: number; y: number }, hx: number, s: 1 | -1, th: number, y0: number, y1: number, lw: number) => {
  const V = hr('varn', VARNISH), r = (th * Math.PI) / 180, fx = hx + s * Math.cos(r) * lw, fd = 1 - Math.sin(r) * 0.07;
  const H0 = at(eye, hx, y0, 1), H1 = at(eye, hx, y1, 1), F0 = at(eye, fx, y0, fd), F1 = at(eye, fx, y1, fd);
  const shade = Math.abs(Math.sin(r)), face = shade > 0.55 ? V[2] : V[3];
  // (the scalloped top: higher at the hinge, dipping to the free edge)
  const lerp = (p: [number, number], q: [number, number], t: number): [number, number] => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const M0 = lerp(H0, F0, 0.5);
  c.fillStyle = INK; c.beginPath(); c.moveTo(H0[0], H0[1] - 7); c.quadraticCurveTo(M0[0], M0[1] - 6, F0[0], F0[1]); c.lineTo(F1[0], F1[1]); c.lineTo(H1[0], H1[1]); c.closePath(); c.fill();
  const In = (p: [number, number], q: [number, number]) => lerp(p, q, 0.08);
  const h0 = In(H0, F0), f0 = In(F0, H0), h1 = In(H1, F1), f1 = In(F1, H1);
  c.fillStyle = face; c.beginPath(); c.moveTo(h0[0], h0[1] - 5); c.quadraticCurveTo(M0[0], M0[1] - 5, f0[0], f0[1] + 1); c.lineTo(f1[0], f1[1] - 1); c.lineTo(h1[0], h1[1] - 1); c.closePath(); c.fill();
  // (the louvers across it, each lit along its top; the stile at each edge)
  c.lineWidth = 1;
  for (let k = 1; k < 9; k++) {
    const t = 0.12 + k * 0.095, a0 = lerp(h0, h1, t), a1 = lerp(f0, f1, t);
    c.strokeStyle = V[1]; c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.stroke();
    c.strokeStyle = shade > 0.55 ? V[3] : V[5]; c.beginPath(); c.moveTo(a0[0], a0[1] - 1); c.lineTo(a1[0], a1[1] - 1); c.stroke();
  }
  c.strokeStyle = V[4]; c.beginPath(); c.moveTo(h0[0], h0[1] - 4); c.lineTo(h1[0], h1[1]); c.stroke();
  // (its free edge's thickness, seen as it swings)
  if (shade > 0.15) { c.fillStyle = V[1]; c.beginPath(); c.moveTo(F0[0], F0[1]); c.lineTo(F0[0] - s * 2, F0[1]); c.lineTo(F1[0] - s * 2, F1[1]); c.lineTo(F1[0], F1[1]); c.closePath(); c.fill(); }
  // (the brass hinges)
  for (const t of [0.15, 0.85]) { const p = lerp(H0, H1, t); box(c, p[0] - 2, p[1] - 2, 4, 4, INK); box(c, p[0] - 1, p[1] - 1, 2, 2, BRASS[4]); }
};

/** The left doorway (the batwings: swinging on their hinges as he goes through, flapping after; barred with planks in
 *  the brawl) and the back door (locked: a padlock and STAFF ONLY; swung open once it's won), at the play plane, from
 *  the room's one eye. */
const doors = (c: Ctx, state: GameState, inside: boolean) => {
  const tw = townOf(state), a = SALOON.a, b = SALOON.b, dt = SALOON.doorTop;
  const eye = { x: state.camera.x + 400, y: state.camera.y + 252 };
  const brawl = tw.saloon.state === 'on', done = tw.saloon.state === 'done';
  const V = hr('varn', VARNISH), S = hr('steel', STEEL), B = BRASS;
  const dh = GY - dt;
  // ---- the batwings' doorway: the casing (jambs, a header with its cap), what's through it
  const o0 = a - 6, ow = 26;
  box(c, o0 - 6, dt - 10, ow + 12, dh + 10, INK);
  still(c, inside ? 'saloon-out-front' : 'saloon-in-front', o0, GY, 0, -dh, ow, dh, inside ? paintOut(ow, dh, false) : paintIn(ow, dh));
  for (const jx of [o0 - 5, o0 + ow]) { box(c, jx, dt - 4, 5, dh + 4, V[3]); box(c, jx, dt - 4, 1, dh + 4, V[5]); box(c, jx + 4, dt - 4, 1, dh + 4, V[1]); box(c, jx - 1, GY - 8, 7, 8, V[2]); box(c, jx - 1, GY - 8, 7, 1, V[4]); }
  box(c, o0 - 7, dt - 10, ow + 14, 7, V[4]); box(c, o0 - 7, dt - 10, ow + 14, 1, V[6]); box(c, o0 - 7, dt - 4, ow + 14, 1, V[1]);
  for (let x = o0 - 5; x < o0 + ow + 5; x += 5) box(c, x, dt - 8, 3, 2, V[5]);
  // (the light thrown in across the floor from the street, inside)
  if (inside && eye.y < GY - 1) {
    const P0 = at(eye, o0, GY, 1), P1 = at(eye, o0 + ow, GY, 1), P2 = at(eye, o0 + ow + 40, GY, 0.92), P3 = at(eye, o0 + 10, GY, 0.92);
    c.globalAlpha = 0.14; poly(c, [P0, P1, P2, P3], skyAt(0.8)); c.globalAlpha = 1;
  }
  if (brawl) {
    // (barred: the leaves shut behind two planks nailed across)
    leaf(c, eye, o0, 1, 0, Y(98), Y(46), ow / 2); leaf(c, eye, o0 + ow, -1, 0, Y(98), Y(46), ow / 2);
    for (const y of [Y(90), Y(40)]) { box(c, a - 16, y, 46, 12, INK); box(c, a - 15, y + 1, 44, 10, V[3]); box(c, a - 15, y + 1, 44, 2, V[5]); box(c, a - 15, y + 9, 44, 1, V[1]); box(c, a - 12, y + 4, 2, 2, S[5]); box(c, a + 24, y + 4, 2, 2, S[5]); }
  } else {
    const th = swingWings(state, false), idle = Math.sin(state.frame * 0.05) * 3;
    // (the far-swung leaf first, so the nearer one's drawn over it)
    const L1 = () => leaf(c, eye, o0, 1, th + idle, Y(98), Y(46), ow / 2), L2 = () => leaf(c, eye, o0 + ow, -1, th - idle, Y(98), Y(46), ow / 2);
    if (eye.x < o0 + ow / 2) { L2(); L1(); } else { L1(); L2(); }
  }
  // ---- the back door: shut and padlocked, or swung open on the alley
  const b0 = b - 12, bw = 20;
  box(c, b0 - 6, dt - 10, bw + 12, dh + 10, INK);
  if (!done) {
    box(c, b0, dt, bw, dh, V[3]);
    for (let y = dt + 10; y < GY; y += 14) { box(c, b0, y, bw, 2, V[1]); box(c, b0, y + 2, bw, 1, V[5]); }
    box(c, b0, dt, 3, dh, V[4]); box(c, b0 + bw - 2, dt, 2, dh, V[1]);
    // (the Z brace, the hasp and its padlock)
    c.strokeStyle = V[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(b0 + 2, GY - 12); c.lineTo(b0 + bw - 2, dt + 14); c.stroke();
    box(c, b0 + 2, Y(64), 14, 4, INK); box(c, b0 + 3, Y(63), 12, 2, S[4]);
    box(c, b - 8, Y(60), 10, 12, INK); box(c, b - 7, Y(60) + 1, 8, 10, S[4]); box(c, b - 7, Y(60) + 1, 8, 2, S[6]); box(c, b - 6, Y(68), 6, 6, INK); box(c, b - 5, Y(67), 4, 4, S[2]); box(c, b - 4, Y(56), 2, 3, INK);
    if (inside) { box(c, b - 116, Y(162), 92, 22, INK); box(c, b - 115, Y(161), 90, 20, '#7F1D1D'); box(c, b - 115, Y(161), 90, 2, '#B83A2A'); signText(c, 'STAFF ONLY', b - 70, Y(161) + 14, signPaint(1, '#FEF3C7', '#3A0A06')); }
  } else {
    // (the alley out the open door, its light across the floor, the door itself swung back into the room on its
    // hinges at the far jamb: its face foreshortened, its edge showing, the padlock hanging open off the hasp)
    still(c, inside ? 'saloon-out-back' : 'saloon-in-back', b0, GY, 0, -dh, bw, dh, inside ? paintOut(bw, dh, true) : paintIn(bw, dh));
    if (inside && eye.y < GY - 1) { const P0 = at(eye, b0, GY, 1), P1 = at(eye, b0 + bw, GY, 1), P2 = at(eye, b0 - 10, GY, 0.92), P3 = at(eye, b0 - 50, GY, 0.92); c.globalAlpha = 0.14; poly(c, [P0, P1, P2, P3], skyAt(0.8)); c.globalAlpha = 1; }
    const hx = b0 - 5, r = (62 * Math.PI) / 180, fx = hx - Math.cos(r) * bw, fd = 1 - Math.sin(r) * 0.14;
    const H0 = at(eye, hx, dt, 1), H1 = at(eye, hx, GY, 1), F0 = at(eye, fx, dt, fd), F1 = at(eye, fx, GY, fd);
    poly(c, [[H0[0] + 1, H0[1] - 1], [F0[0] - 1, F0[1] - 1], [F1[0] - 1, F1[1] + 1], [H1[0] + 1, H1[1] + 1]], INK);
    poly(c, [H0, F0, F1, H1], V[2]);
    const lerp = (p: [number, number], q: [number, number], t: number): [number, number] => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    c.lineWidth = 1;
    for (let t = 0.08; t < 1; t += 0.117) { const p = lerp(H0, H1, t), q = lerp(F0, F1, t); c.strokeStyle = V[1]; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); c.strokeStyle = V[3]; c.beginPath(); c.moveTo(p[0], p[1] + 1); c.lineTo(q[0], q[1] + 1); c.stroke(); }
    c.fillStyle = V[4]; c.beginPath(); c.moveTo(F0[0], F0[1]); c.lineTo(F0[0] + 3, F0[1]); c.lineTo(F1[0] + 3, F1[1]); c.lineTo(F1[0], F1[1]); c.closePath(); c.fill();
    const hp = lerp(lerp(H0, F0, 0.8), lerp(H1, F1, 0.8), 0.5);
    box(c, hp[0] - 2, hp[1] - 3, 5, 6, INK); box(c, hp[0] - 1, hp[1] - 2, 3, 4, S[4]); box(c, hp[0] - 2, hp[1] + 3, 6, 7, INK); box(c, hp[0] - 1, hp[1] + 4, 4, 5, S[4]); box(c, hp[0] - 1, hp[1] + 4, 4, 1, S[6]);
    for (const t of [0.12, 0.88]) { const p = lerp(H0, H1, t); box(c, p[0] - 1, p[1] - 3, 4, 6, INK); box(c, p[0], p[1] - 2, 2, 4, B[3]); }
  }
  // (the back door's casing)
  for (const jx of [b0 - 5, b0 + bw]) { box(c, jx, dt - 4, 5, dh + 4, V[3]); box(c, jx, dt - 4, 1, dh + 4, V[5]); box(c, jx + 4, dt - 4, 1, dh + 4, V[1]); }
  box(c, b0 - 7, dt - 10, bw + 14, 7, V[4]); box(c, b0 - 7, dt - 10, bw + 14, 1, V[6]); box(c, b0 - 7, dt - 4, bw + 14, 1, V[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// In it: the pieces

/** A raised panel (varnished wood): inked, its bevels stepped (lit top and left, shadowed bottom and right), the field
 *  grained, a glint along its top. */
const panel = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, R[1]);
  box(g, x, y, w, 2, R[5]); box(g, x, y, 2, h, R[4]); box(g, x, y + h - 2, w, 2, R[0]); box(g, x + w - 2, y + 2, 2, h - 2, R[1]);
  box(g, x + 3, y + 3, w - 6, h - 6, R[3]);
  box(g, x + 3, y + 3, w - 6, 1, R[4]); box(g, x + 3, y + h - 4, w - 6, 1, R[2]);
  for (let k = 0; k < Math.max(1, (w - 8) / 7); k++) { const gx = x + 5 + hash(seed + k * 1.9) * (w - 10); box(g, gx, y + 4 + hash(seed + k) * 3, 1, Math.max(2, h - 10 - hash(seed + k * 2.3) * 6), R[2]); }
  if (w > 10 && h > 10) for (let yy = y + 4; yy < y + h - 4; yy += 2) box(g, x + w - 5, yy, 1, 1, R[2]);
};

/** The upright piano's face (local: its left foot at (0, 0), 96 wide, 77 tall): the case inked, the lid open over
 *  the hammers, carved scroll panels and a fretwork panel (red silk behind), the music desk with sheet music, the
 *  fallboard's gilt line, ivory keys (yellowed, black ones in their twos and threes), the key slip, the carved console
 *  legs, the lower panels, brass pedals; a whiskey glass and a tip jar on top. */
const paintPiano = (g: Ctx) => {
  const V = hr('varn', VARNISH), B = BRASS;
  // (the case)
  box(g, -1, -78, 98, 78, INK); box(g, 0, -77, 96, 77, V[2]);
  box(g, 0, -77, 3, 77, V[4]); box(g, 93, -77, 3, 77, V[1]);
  // (the top: its lid propped open a crack, the hammers' felt showing)
  box(g, -3, -80, 102, 4, INK); box(g, -2, -79, 100, 2, V[4]); box(g, -2, -79, 100, 1, V[6]);
  box(g, 4, -76, 88, 3, '#120A06'); for (let k = 0; k < 29; k++) box(g, 6 + k * 3, -75, 2, 2, k % 2 ? '#D8CCB0' : '#B8AC90');
  // (the upper front: scroll-carved side panels, the middle a fretwork over red silk)
  panel(g, 6, -71, 22, 24, V, 11); panel(g, 68, -71, 22, 24, V, 12);
  for (const px of [17, 79]) {
    g.strokeStyle = V[5]; g.lineWidth = 1; g.beginPath(); g.arc(px - 3, -62, 3, Math.PI * 0.2, Math.PI * 1.6); g.stroke(); g.beginPath(); g.arc(px + 3, -56, 3, Math.PI * 1.2, Math.PI * 2.6); g.stroke();
    g.strokeStyle = V[0]; g.beginPath(); g.arc(px - 3, -61, 3, Math.PI * 0.2, Math.PI * 1.1); g.stroke();
    box(g, px - 1, -60, 2, 2, V[5]);
  }
  box(g, 31, -72, 34, 26, INK); box(g, 32, -71, 32, 24, '#5A0E14');
  for (let y = -71; y < -47; y += 2) for (let x = 32 + ((y / 2) & 1); x < 64; x += 2) box(g, x, y, 1, 1, '#8A1A24');
  for (let k = 0; k < 5; k++) { box(g, 34 + k * 7, -71, 2, 24, V[3]); box(g, 34 + k * 7, -71, 1, 24, V[5]); }
  for (const y of [-63, -55]) { box(g, 32, y, 32, 2, V[3]); box(g, 32, y, 32, 1, V[5]); }
  box(g, 44, -66, 8, 8, INK); box(g, 45, -65, 6, 6, V[4]); box(g, 46, -64, 2, 2, V[6]);
  // (the music desk's ledge; the sheet music on it, over at the left where his eyes are; a dog-eared page)
  box(g, 4, -47, 88, 3, INK); box(g, 4, -46, 88, 2, V[4]); box(g, 4, -46, 88, 1, V[6]);
  for (const [sx, tilt] of [[8, 0], [24, 1]] as const) {
    box(g, sx - 1, -63 - tilt, 18, 18, INK); box(g, sx, -62 - tilt, 16, 16, tilt ? '#EEE4C8' : '#F6EEDA'); box(g, sx + 14, -62 - tilt, 2, 16, '#D8CCAA');
    for (let k = 0; k < 3; k++) { for (let l = 0; l < 5; l++) box(g, sx + 1, -60 - tilt + k * 5 + l, 13, 1, l % 2 ? (tilt ? '#EEE4C8' : '#F6EEDA') : '#8A7A62'); for (let n = 0; n < 4; n++) box(g, sx + 2 + n * 3 + (k + n) % 2, -59 - tilt + k * 5 + ((n * 3 + k) % 3), 2, 1, '#2A1A10'); }
  }
  box(g, 38, -47, 2, 2, '#D8CCAA'); box(g, 39, -48, 1, 1, '#F6EEDA');
  // (the fallboard's gilt line)
  box(g, 2, -44, 92, 4, V[1]); box(g, 2, -44, 92, 1, V[3]); box(g, 20, -42, 56, 1, B[3]); box(g, 46, -43, 4, 2, B[4]);
  // (the keys: ivory, yellowed, a gap at each, the black keys in their twos and threes, lit along the front)
  box(g, 2, -40, 92, 8, INK);
  for (let k = 0; k < 23; k++) { const x = 3 + k * 4; box(g, x, -39, 3, 7, hash(k * 2.7) < 0.3 ? '#E2D4AE' : '#F0E6CC'); box(g, x, -33, 3, 1, '#C8B890'); box(g, x, -39, 1, 6, '#FFF8E8'); }
  for (let k = 0; k < 22; k++) { const n = k % 7; if (n === 2 || n === 6) continue; const x = 5 + k * 4; box(g, x, -39, 2, 4, '#141010'); box(g, x, -39, 1, 1, '#5A5450'); }
  // (the key slip, lit: the keybed's front)
  box(g, 1, -32, 94, 4, INK); box(g, 2, -31, 92, 2, V[4]); box(g, 2, -31, 92, 1, V[6]);
  // (the cheeks at the keys' ends, the carved console legs under them)
  for (const cx of [0, 90]) { box(g, cx - 1, -46, 8, 18, INK); box(g, cx, -45, 6, 16, V[3]); box(g, cx, -45, 2, 16, V[5]); }
  for (const [cx, k] of [[3, 1], [93, -1]] as const) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 3 * k, -28); g.quadraticCurveTo(cx + 6 * k, -24, cx + 3 * k, -16); g.quadraticCurveTo(cx - 1 * k, -10, cx + 2 * k, -6); g.lineTo(cx - 3 * k, -6); g.closePath(); g.fill();
    g.fillStyle = V[3]; g.beginPath(); g.moveTo(cx - 2 * k, -27); g.quadraticCurveTo(cx + 4 * k, -24, cx + 2 * k, -16); g.quadraticCurveTo(cx - 1 * k, -10, cx + 1 * k, -7); g.lineTo(cx - 2 * k, -7); g.closePath(); g.fill();
    box(g, cx + (k > 0 ? 0 : -2), -24, 2, 2, V[5]); oval(g, cx + 2 * k, -16, 2, 2, V[5]);
  }
  // (the lower front: two raised panels, a carved rosette between)
  panel(g, 10, -27, 32, 19, V, 21); panel(g, 54, -27, 32, 19, V, 22);
  oval(g, 48, -18, 5, 5, INK); oval(g, 48, -18, 4, 4, V[3]); for (let a = 0; a < 6; a++) box(g, 48 + Math.cos(a) * 2.5 - 0.5, -18 + Math.sin(a) * 2.5 - 0.5, 1, 1, V[5]); box(g, 47, -19, 2, 2, V[6]);
  // (the plinth, the pedals)
  box(g, 0, -6, 96, 6, V[1]); box(g, 0, -6, 96, 1, V[3]);
  for (const px of [40, 52]) { box(g, px - 1, -5, 7, 4, INK); box(g, px, -4, 5, 2, B[3]); box(g, px, -4, 5, 1, B[5]); }
  // (on top at the front: a whiskey glass, half gone, and the tip jar, a few coins in it)
  box(g, 7, -87, 8, 8, INK); box(g, 8, -86, 6, 7, '#C8D8E0'); box(g, 8, -83, 6, 4, '#B8701E'); box(g, 8, -83, 6, 1, '#E8A848'); box(g, 9, -86, 1, 6, '#FFFFFF');
  box(g, 19, -91, 11, 12, INK); box(g, 20, -90, 9, 11, '#B8D0D8'); box(g, 20, -90, 9, 1, '#E8F4F8'); box(g, 21, -89, 1, 9, '#F4FCFF');
  for (const [cx, cy, cc] of [[22, -82, B[4]], [25, -81, B[3]], [23, -84, '#C8C8C8'], [26, -83, B[4]]] as const) box(g, cx, cy, 2, 1, cc);
  box(g, 20, -82, 9, 3, '#3E7A3A'); box(g, 21, -82, 3, 1, '#6AA65A');
};

/** A chair (bentwood: a hooped back, a round seat, splayed legs), feet at (x, 0), the back on the `back` side. */
const chair = (c: Ctx, x: number, y: number, back: 1 | -1, V: string[]) => {
  box(c, x - 9, y - 30, 20, 5, INK); box(c, x - 8, y - 29, 18, 3, V[3]); box(c, x - 8, y - 29, 18, 1, V[5]);
  for (const [lx, fx] of [[x - 6, x - 9], [x + 7, x + 10]]) { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(lx, y - 26); c.lineTo(fx, y); c.stroke(); c.strokeStyle = V[2]; c.lineWidth = 2; c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 7, y - 12); c.lineTo(x + 8, y - 12); c.stroke();
  const bx = back > 0 ? x + 8 : x - 6;
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(bx, y - 28); c.quadraticCurveTo(bx + back * 4, y - 46, bx - back * 2, y - 58); c.stroke();
  c.strokeStyle = V[3]; c.lineWidth = 2; c.stroke(); c.strokeStyle = V[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(bx - 1, y - 30); c.quadraticCurveTo(bx + back * 4 - 1, y - 46, bx - back * 2 - 1, y - 57); c.stroke();
};

/** A spittoon (brass, bellied, a flared mouth), its foot at (x, y): lit at the upper left, a dribble down it. */
const spittoon = (g: Ctx, x: number, y: number) => {
  const B = BRASS;
  oval(g, x, y - 7, 9, 7, INK); oval(g, x, y - 7, 8, 6, B[2]); oval(g, x - 2, y - 8, 5, 4, B[3]); box(g, x - 5, y - 10, 2, 2, B[5]); box(g, x - 4, y - 11, 1, 1, B[6]);
  box(g, x + 4, y - 9, 2, 5, B[1]);
  box(g, x - 7, y - 2, 14, 2, INK); box(g, x - 6, y - 2, 12, 1, B[1]);
  box(g, x - 4, y - 15, 8, 3, INK); oval(g, x, y - 15, 8, 2.5, INK); oval(g, x, y - 15, 7, 1.8, B[4]); oval(g, x, y - 15, 4, 1, '#2A1A08'); box(g, x - 6, y - 16, 3, 1, B[6]);
  box(g, x + 2, y - 13, 1, 4, '#4A3010'); box(g, x + 2, y - 9, 1, 1, '#4A3010');
  box(g, x + 8, y - 1, 5, 1, '#3A2810'); box(g, x - 13, y - 1, 3, 1, '#3A2810');
};

const oval = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// In it

/** The back wall (local: the room's left foot at (0, 0), at the play plane's scale; drawn back at BK). */
const paintBackWall = (g: Ctx) => {
  const a = SALOON.a, w = SALOON.b - a, top = Y(470) - GY;
  const P = hr7('#5A2430'), V = hr('varn', VARNISH), T = hr7('#C8A040'), Cr = hr('cream', CREAM);
  // (flocked paper: a damask, each medallion stepped (shadowed under, lit over), set in staggered rows; a sheen down
  // the paper under each chandelier, dithered; banded darker up top in the lamp smoke)
  box(g, 0, top, w, -top, P[3]);
  for (let row = 0, y = top + 26; y < -96; y += 40, row++) for (let x = (row % 2) * 16 + 8; x < w; x += 32) {
    for (let dy = -11; dy <= 11; dy++) { const hw = Math.round(6 * (1 - Math.abs(dy) / 11)); box(g, x - hw, y + dy + 1, hw * 2 + 1, 1, P[2]); }
    for (let dy = -11; dy <= 11; dy++) { const hw = Math.round(6 * (1 - Math.abs(dy) / 11)); if (hw > 0) box(g, x - hw, y + dy, hw * 2 + 1, 1, P[4]); }
    for (let dy = -6; dy <= 6; dy++) { const hw = Math.round(3 * (1 - Math.abs(dy) / 6)); box(g, x - hw, y + dy, hw * 2 + 1, 1, P[3]); }
    box(g, x, y - 1, 1, 3, P[5]); box(g, x - 3, y - 9, 1, 2, P[5]);
    for (const [ox, oy] of [[-9, -13], [9, -13], [-9, 13], [9, 13]] as const) { box(g, x + ox - 1, y + oy, 3, 1, P[4]); box(g, x + ox + (ox < 0 ? 1 : -1), y + oy + (oy < 0 ? 1 : -1), 1, 2, P[4]); }
    box(g, x, y - 18, 1, 5, P[2]); box(g, x, y + 13, 1, 5, P[2]);
  }
  for (const sx of [X(4000) - a, X(4400) - a, X(4750) - a]) for (let y = top + 30; y < -94; y += 2) for (let x = sx - 70 + ((y >> 1) & 1); x < sx + 70; x += 2) {
    const k = 1 - Math.abs(x - sx) / 70 - Math.max(0, (y + 200) / 200) * 0.6;
    if (k > 0.45 || (k > 0.2 && ((x + y) >> 1) % 2 === 0)) { g.globalAlpha = 0.16; box(g, x, y, 1, 1, '#F4C890'); }
  }
  g.globalAlpha = 1;
  for (let k = 0; k < 4; k++) { g.globalAlpha = 0.1 + k * 0.05; box(g, 0, top + (3 - k) * 14 + 22, w, 14, '#1A0A08'); }
  g.globalAlpha = 1;
  // (the cornice at the ceiling, a picture rail in gilt)
  box(g, 0, top, w, 22, INK); box(g, 0, top + 1, w, 8, V[2]); box(g, 0, top + 9, w, 4, V[4]); box(g, 0, top + 9, w, 1, V[6]); box(g, 0, top + 13, w, 7, V[1]);
  for (let x = 4; x < w; x += 10) { box(g, x, top + 14, 5, 5, V[3]); box(g, x, top + 14, 5, 1, V[5]); }
  box(g, 0, top + 30, w, 3, T[2]); box(g, 0, top + 30, w, 1, T[5]);
  // (the wainscot: raised panels between stiles, a molded chair rail, the baseboard scuffed)
  box(g, 0, -88, w, 88, V[2]);
  for (let x = 6, i = 0; x < w - 30; x += 44, i++) panel(g, x, -78, 36, 58, V, i * 3.7);
  box(g, 0, -95, w, 9, INK); box(g, 0, -94, w, 3, V[5]); box(g, 0, -94, w, 1, V[6]); box(g, 0, -91, w, 2, V[3]); box(g, 0, -89, w, 2, V[1]);
  box(g, 0, -14, w, 14, INK); box(g, 0, -13, w, 12, V[1]); box(g, 0, -13, w, 1, V[4]); box(g, 0, -10, w, 1, V[2]);
  for (let k = 0; k < 30; k++) box(g, hash(k * 4.1) * w, -12 + hash(k * 2.3) * 9, 3 + hash(k) * 6, 1, V[0]);
  // (the stage: its proscenium in gilt, the velvet backdrop in deep folds, the swagged valance with its gold fringe and
  // tassels, the side drapes drawn back on gold ropes, the curtain's hem fringed; CAN-CAN up top)
  const sx = X(3840) - a, sw = 230, ct = Y(248) - GY, cb = Y(36) - GY;
  box(g, sx - 12, Y(266) - GY - 6, sw + 24, cb - (Y(266) - GY) + 6, INK);
  for (let k = 0; k < sw; k += 12) {
    const F = ['#3A0810', '#5E0C18', '#7A1424', '#5E0C18'];
    for (let j = 0; j < 4; j++) box(g, sx + k + j * 3, ct, 3, cb - ct, F[j]);
    box(g, sx + k + 6, ct, 1, cb - ct, '#9A2034'); box(g, sx + k, ct, 1, cb - ct, '#1E0408');
  }
  const drape = (side: 1 | -1) => {
    const e = side > 0 ? sx : sx + sw, d = (n: number) => e + side * n;
    const pts: [number, number][] = [[d(0), ct], [d(62), ct], [d(26), -132], [d(20), -120], [d(48), cb], [d(0), cb]];
    g.save(); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
    for (let k = 0; k < 66; k += 9) { const F = ['#6A0E1E', '#9A1A30', '#C8344A', '#E05A6A', '#9A1A30']; for (let j = 0; j < 5; j++) box(g, Math.min(d(k + j * 2), d(k + j * 2 + 2)), ct, 2, cb - ct, F[j]); box(g, Math.min(d(k), d(k + 1)), ct, 1, cb - ct, '#3A0810'); }
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(pts[1][0], pts[1][1]); g.lineTo(pts[2][0], pts[2][1]); g.lineTo(pts[3][0], pts[3][1]); g.lineTo(pts[4][0], pts[4][1]); g.stroke();
    // (the gold rope tie-back, its tassel)
    box(g, Math.min(d(-2), d(24)), -130, 26, 5, INK); box(g, Math.min(d(-1), d(23)), -129, 24, 3, T[4]); for (let k = 0; k < 24; k += 3) box(g, Math.min(d(k), d(k + 1)), -129, 1, 3, T[2]);
    box(g, d(24) - 3, -126, 6, 4, T[3]); for (let k = 0; k < 5; k++) box(g, d(24) - 3 + k + (side < 0 ? 1 : 0), -122, 1, 9 - (k % 2) * 2, k % 2 ? T[2] : T[4]);
  };
  drape(1); drape(-1);
  for (let k = 0; k < sw; k += 2) box(g, sx + k, cb - 4, 1, 4, k % 4 ? T[2] : T[4]);
  // (the valance: swags, each lit along its belly, gold fringe under, a tassel where they meet)
  for (let k = 0; k < sw; k += 46) {
    g.fillStyle = INK; g.beginPath(); g.moveTo(sx + k - 1, ct - 1); g.quadraticCurveTo(sx + k + 23, ct + 30, sx + k + 47, ct - 1); g.closePath(); g.fill();
    g.fillStyle = '#8A1426'; g.beginPath(); g.moveTo(sx + k, ct); g.quadraticCurveTo(sx + k + 23, ct + 27, sx + k + 46, ct); g.closePath(); g.fill();
    g.strokeStyle = '#C8344A'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx + k + 4, ct + 2); g.quadraticCurveTo(sx + k + 23, ct + 20, sx + k + 42, ct + 2); g.stroke();
    g.strokeStyle = '#5E0C18'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + k + 8, ct + 1); g.quadraticCurveTo(sx + k + 23, ct + 9, sx + k + 38, ct + 1); g.stroke();
    for (let j = 2; j < 46; j += 2) { const t = j / 46, yy = ct + 4 * t * (1 - t) * 13.5 * 2; box(g, sx + k + j, yy, 1, 3 + (j % 4 ? 0 : 1), j % 4 ? T[3] : T[5]); }
    box(g, sx + k - 2, ct, 4, 4, T[4]); for (let j = 0; j < 4; j++) box(g, sx + k - 2 + j, ct + 4, 1, 8 - (j % 2) * 2, j % 2 ? T[2] : T[4]);
  }
  // (the proscenium: gilt pilasters with stepped flutes, the header with its egg-and-dart and the name)
  for (const px of [sx - 12, sx + sw]) {
    box(g, px, Y(266) - GY, 12, cb - (Y(266) - GY), T[2]); box(g, px, Y(266) - GY, 2, cb - (Y(266) - GY), T[5]); box(g, px + 10, Y(266) - GY, 2, cb - (Y(266) - GY), T[0]);
    for (const fx of [px + 4, px + 7]) { box(g, fx, Y(240) - GY, 1, Y(60) - Y(240), T[1]); box(g, fx + 1, Y(240) - GY, 1, Y(60) - Y(240), T[4]); }
    box(g, px - 1, Y(248) - GY, 14, 6, T[4]); box(g, px - 1, Y(248) - GY, 14, 1, T[6]); box(g, px - 1, cb - 8, 14, 8, T[3]); box(g, px - 1, cb - 8, 14, 1, T[5]);
  }
  const hy = Y(266) - GY;
  box(g, sx - 14, hy - 4, sw + 28, 26, INK); box(g, sx - 13, hy - 3, sw + 26, 24, T[3]); box(g, sx - 13, hy - 3, sw + 26, 2, T[6]); box(g, sx - 13, hy + 19, sw + 26, 2, T[0]);
  for (let x = sx - 10; x < sx + sw + 10; x += 6) { box(g, x, hy, 3, 3, T[4]); box(g, x, hy + 2, 3, 1, T[1]); box(g, x + 4, hy, 1, 3, T[1]); }
  box(g, sx + sw / 2 - 44, hy + 4, 88, 14, T[2]); box(g, sx + sw / 2 - 44, hy + 4, 88, 1, T[1]); box(g, sx + sw / 2 - 44, hy + 17, 88, 1, T[5]);
  signText(g, 'CAN-CAN', sx + sw / 2, hy + 16, western(1, '#7F1D1D', T[1]));
  // (WANTED posters: old paper, foxed and stained, nailed up, a corner torn; the faces gross-ups)
  for (const [px, words] of [[X(4110) - a, ['WANTED', '$4 FARE']], [X(4180) - a, ['WANTED', 'CHEATS']]] as const) {
    const py = Y(200) - GY, tilt = words[1] === 'CHEATS' ? 1 : 0;
    box(g, px + 2, py + 2, 51, 65, '#2A0C10');
    box(g, px - 1, py - 1, 52, 66, INK); box(g, px, py, 50, 64, Cr[5]); box(g, px, py, 50, 2, Cr[6]); box(g, px + 46, py, 4, 64, Cr[3]); box(g, px, py + 60, 46, 4, Cr[4]);
    for (let k = 0; k < 40; k++) { const fx = px + 2 + hash(px + k * 1.3) * 44, fy = py + 3 + hash(px * 2 + k) * 58; if (fy > py + 16 && fy < py + 42 && fx > px + 11 && fx < px + 39) continue; box(g, fx, fy, 1, 1, Cr[3]); }
    for (let k = 0; k < 6; k++) box(g, px + 30 + k, py + 44 + (k & 1), 6 - k, 1, Cr[4]);
    signText(g, words[0], px + 25, py + 12, { sx: 1, sy: 1, fill: '#7F1D1D', shadow: Cr[4] }); box(g, px + 12, py + 17, 26, 24, INK); box(g, px + 13, py + 18, 24, 22, Cr[2]); drawBust(g, bust(`wanted-${words[1]}`, randomBust(words[1] === 'CHEATS' ? 1871 : 1868, { hair: 'crew', mouth: 'grimace' }), 'photo'), px + 13, py + 18, 24, 22, 150);
    box(g, px + 8, py + 44, 34, 1, Cr[3]); box(g, px + 12, py + 46, 26, 1, Cr[3]);
    signText(g, words[1], px + 25, py + 56, { sx: 1, sy: 1, fill: '#2A1A10' });
    // (the nail, the torn corner)
    box(g, px + 24, py + 2, 3, 3, INK); box(g, px + 24, py + 2, 1, 1, '#A8A8B0');
    poly(g, [[px + 50 - tilt * 50, py + 64], [px + 50 - tilt * 50 + (tilt ? 9 : -9), py + 64], [px + 50 - tilt * 50, py + 55]], P[3]);
    box(g, tilt ? px : px + 49, py + 55, 1, 9, INK);
  }
  // (the painting of a horse: an ornate gilt frame, a butte under a banded sky, the horse in its stepped browns, the
  // varnish crazed)
  const hx = X(4600) - a, hy2 = Y(330) - GY;
  box(g, hx - 5, hy2 - 5, 100, 70, INK); box(g, hx - 4, hy2 - 4, 98, 68, T[2]); box(g, hx - 4, hy2 - 4, 98, 2, T[5]); box(g, hx - 4, hy2 - 4, 2, 68, T[4]); box(g, hx - 4, hy2 + 62, 98, 2, T[0]); box(g, hx + 92, hy2 - 4, 2, 68, T[1]);
  for (let x = hx; x < hx + 90; x += 4) { box(g, x, hy2 - 3, 2, 1, T[6]); box(g, x + 1, hy2 + 62, 2, 1, T[3]); }
  for (const [cx, cy] of [[hx - 3, hy2 - 3], [hx + 89, hy2 - 3], [hx - 3, hy2 + 59], [hx + 89, hy2 + 59]] as const) { box(g, cx, cy, 6, 6, T[4]); box(g, cx + 2, cy + 2, 2, 2, T[6]); }
  box(g, hx, hy2, 90, 60, INK);
  const SKY = ['#5A86B8', '#7AA2C8', '#A8C0D0', '#E8C8A0'];
  for (let k = 0; k < 4; k++) box(g, hx + 1, hy2 + 1 + k * 7, 88, 7, SKY[k]);
  poly(g, [[hx + 50, hy2 + 30], [hx + 56, hy2 + 18], [hx + 76, hy2 + 18], [hx + 82, hy2 + 30]], '#8A5A4A'); box(g, hx + 56, hy2 + 18, 20, 2, '#B87A5A');
  poly(g, [[hx + 1, hy2 + 30], [hx + 14, hy2 + 24], [hx + 30, hy2 + 30]], '#7A6A7A');
  box(g, hx + 1, hy2 + 29, 88, 4, '#9AA05A'); box(g, hx + 1, hy2 + 33, 88, 10, '#7A8A4A'); box(g, hx + 1, hy2 + 43, 88, 16, '#5A6A3A');
  for (let k = 0; k < 30; k++) box(g, hx + 2 + hash(k * 3.3) * 86, hy2 + 34 + hash(k * 1.9) * 24, 2, 1, k % 2 ? '#9AA05A' : '#46562E');
  const HB = ['#2A1A0E', '#5A3A1E', '#7A5230', '#9A6A40'];
  for (const [lx, back] of [[hx + 28, 1], [hx + 33, 0], [hx + 54, 1], [hx + 59, 0]] as const) { box(g, lx, hy2 + 36, 3, 14, back ? HB[1] : HB[2]); box(g, lx, hy2 + 49, 3, 2, HB[0]); }
  oval(g, hx + 44, hy2 + 34, 19, 7, HB[0]); oval(g, hx + 44, hy2 + 34, 18, 6, HB[2]); oval(g, hx + 41, hy2 + 32, 13, 3, HB[3]);
  poly(g, [[hx + 56, hy2 + 32], [hx + 62, hy2 + 20], [hx + 68, hy2 + 22], [hx + 63, hy2 + 36]], HB[2]);
  poly(g, [[hx + 62, hy2 + 20], [hx + 72, hy2 + 22], [hx + 72, hy2 + 27], [hx + 66, hy2 + 26]], HB[2]); box(g, hx + 69, hy2 + 22, 1, 4, '#F4ECD2'); box(g, hx + 66, hy2 + 22, 1, 1, INK);
  box(g, hx + 61, hy2 + 18, 2, 3, HB[1]); for (let k = 0; k < 6; k++) box(g, hx + 58 + k, hy2 + 21 + k * 2, 2, 3, HB[0]);
  for (let k = 0; k < 6; k++) box(g, hx + 24 - k, hy2 + 31 + k * 3, 3, 3, HB[0]);
  g.globalAlpha = 0.25; for (let k = 0; k < 40; k++) box(g, hx + 1 + hash(k * 7.1) * 86, hy2 + 1 + hash(k * 5.3) * 56, 2 + (k % 3), 1, '#3A2A10'); g.globalAlpha = 1;
  box(g, hx + 1, hy2 + 1, 88, 1, '#FFF8E0');
  // (the back bar: a carved crest over its cornice, fluted columns, the long beveled mirror with the room dim in it and
  // streaks across, shelves of bottles: every one its own shape, labeled, glinting)
  const bx = X(4260) - a, by = Y(180) - GY;
  box(g, bx - 1, by - 13, 292, 124, INK); box(g, bx, by - 12, 290, 122, V[2]);
  box(g, bx - 6, by - 26, 302, 16, INK); box(g, bx - 5, by - 25, 300, 14, V[3]); box(g, bx - 5, by - 25, 300, 2, V[5]); box(g, bx - 5, by - 13, 300, 2, V[1]);
  for (let x = bx - 2; x < bx + 292; x += 8) { box(g, x, by - 21, 4, 5, V[4]); box(g, x, by - 21, 4, 1, V[6]); box(g, x, by - 17, 4, 1, V[1]); }
  g.fillStyle = INK; g.beginPath(); g.moveTo(bx + 105, by - 25); g.quadraticCurveTo(bx + 145, by - 56, bx + 185, by - 25); g.closePath(); g.fill();
  g.fillStyle = V[3]; g.beginPath(); g.moveTo(bx + 108, by - 25); g.quadraticCurveTo(bx + 145, by - 53, bx + 182, by - 25); g.closePath(); g.fill();
  g.strokeStyle = V[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(bx + 114, by - 27); g.quadraticCurveTo(bx + 145, by - 49, bx + 176, by - 27); g.stroke();
  oval(g, bx + 145, by - 34, 6, 5, INK); oval(g, bx + 145, by - 34, 5, 4, T[3]); box(g, bx + 143, by - 37, 2, 2, T[6]);
  for (const cx of [bx + 4, bx + 140, bx + 268]) {
    box(g, cx - 1, by - 11, 20, 121, INK); box(g, cx, by - 10, 18, 119, V[3]); box(g, cx, by - 10, 2, 119, V[5]); box(g, cx + 16, by - 10, 2, 119, V[1]);
    for (const fx of [cx + 5, cx + 9, cx + 13]) { box(g, fx, by + 2, 1, 96, V[1]); box(g, fx + 1, by + 2, 1, 96, V[4]); }
    box(g, cx - 2, by - 10, 22, 8, V[4]); box(g, cx - 2, by - 10, 22, 1, V[6]); box(g, cx - 2, by - 3, 22, 1, V[1]);
  }
  for (const [m0, m1] of [[bx + 22, bx + 140], [bx + 158, bx + 268]] as const) {
    const mw = m1 - m0;
    box(g, m0, by + 1, mw, 55, INK); box(g, m0 + 1, by + 2, mw - 2, 53, '#C8D8E4'); box(g, m0 + 2, by + 3, mw - 4, 51, '#5A6E7A');
    for (let k = 0; k < 4; k++) box(g, m0 + 2, by + 3 + k * 13, mw - 4, 13, ['#4A5E6A', '#566A76', '#627682', '#6E828E'][k]);
    // (the room in it, dim: the chandelier's glints, the far wall's lamps, figures)
    for (let k = 0; k < 5; k++) box(g, m0 + 12 + k * 20, by + 14 + (k % 2) * 2, 2, 3, '#E8D8A0');
    box(g, m0 + 10, by + 9, mw - 20, 1, '#8A9AA4');
    for (let k = 0; k < 3; k++) { const fx = m0 + 18 + k * 34; box(g, fx, by + 32, 8, 22, '#3A4A56'); oval(g, fx + 4, by + 29, 4, 4, '#3A4A56'); }
    for (const [sx0, sw0] of [[10, 8], [26, 3], [mw * 0.55, 6], [mw * 0.55 + 12, 2]] as const) for (let k = 0; k < 53; k++) box(g, m0 + 2 + sx0 + k * 0.6, by + 54 - k, sw0, 1, '#9AB0BE');
    box(g, m0 + 2, by + 3, mw - 4, 1, '#E8F0F8'); box(g, m0 + 2, by + 3, 1, 51, '#A8BCC8');
  }
  // (the counter's back under the mirror, cupboard doors)
  box(g, bx + 2, by + 56, 286, 54, V[1]);
  for (const sy of [by + 70, by + 96]) {
    box(g, bx + 2, sy, 286, 5, INK); box(g, bx + 3, sy, 284, 3, V[4]); box(g, bx + 3, sy, 284, 1, V[6]);
    for (let k = 0; k < 22; k++) bottle(g, bx + 11 + k * 12.6, sy, Math.floor(hash(k * 7.7 + sy) * 5), ['#7A4A18', '#2E6A32', '#6A1A1A', '#C8B07A', '#22223A', '#8A5A20', '#3A5A2A'][Math.floor(hash(k * 3.1 + sy) * 7)], k + sy);
  }
  // (the rooms' doors upstairs: casings with a cornice, a transom lit warm, brass numbers; a sconce between; somebody's
  // boots left out at 3)
  for (let i = 0; i < 3; i++) {
    const dx = X(4300) - a + i * 140, dy = Y(310) - GY;
    box(g, dx - 9, dy - 26, 74, 132, INK); box(g, dx - 8, dy - 25, 72, 131, V[3]); box(g, dx - 8, dy - 25, 2, 131, V[5]); box(g, dx + 62, dy - 25, 2, 131, V[1]);
    box(g, dx - 12, dy - 32, 80, 8, INK); box(g, dx - 11, dy - 31, 78, 6, V[4]); box(g, dx - 11, dy - 31, 78, 1, V[6]); box(g, dx - 11, dy - 26, 78, 1, V[1]);
    box(g, dx, dy - 20, 56, 14, INK); box(g, dx + 1, dy - 19, 54, 12, '#E8B860'); box(g, dx + 1, dy - 19, 54, 3, '#F8D890'); for (let k = 1; k < 4; k++) box(g, dx + k * 14, dy - 19, 1, 12, V[2]);
    door(g, dx, dy, 56, 106, V);
    box(g, dx + 20, Y(298) - GY, 16, 12, INK); box(g, dx + 21, Y(297) - GY, 14, 10, BRASS[2]); box(g, dx + 21, Y(297) - GY, 14, 1, BRASS[4]);
    signText(g, String(i + 1), dx + 28, Y(290) - GY, { sx: 1, sy: 1, fill: '#FFF0A8', shadow: INK });
    if (i < 2) { const sx2 = dx + 98; box(g, sx2 - 3, dy + 30, 8, 3, INK); box(g, sx2 - 2, dy + 30, 6, 2, BRASS[3]); box(g, sx2 - 3, dy + 16, 8, 14, INK); box(g, sx2 - 2, dy + 17, 6, 12, '#F8E8B0'); box(g, sx2 - 1, dy + 18, 1, 10, '#FFFFFF'); box(g, sx2 - 1, dy + 22, 2, 3, '#FBBF24'); box(g, sx2 - 4, dy + 14, 10, 3, BRASS[2]); }
  }
  const bt = X(4300) - a + 280 + 60;
  for (const k of [0, 9]) { box(g, bt + k - 1, -224, 8, 23, INK); box(g, bt + k, -223, 6, 20, '#5A3418'); box(g, bt + k, -223, 2, 20, '#7A4E28'); box(g, bt + k - 4, -205, 11, 5, INK); box(g, bt + k - 3, -204, 9, 3, '#4A2A12'); box(g, bt + k, -218, 6, 1, '#3A2010'); }
};

/** A bottle on a shelf at (x, y) (its foot's middle): kind 0 whiskey, 1 wine, 2 rum, 3 gin, 4 a decanter; glass in
 *  its color, the liquid a band darker, a label, a cork, a glint. */
const bottle = (g: Ctx, x: number, y: number, kind: number, col: string, seed: number) => {
  const dk = mix(col, INK, 0.45), lt = mix(col, '#FFFFFF', 0.4);
  const [bw, bh, nw, nh] = [[8, 15, 3, 6], [6, 19, 2, 7], [10, 11, 3, 4], [8, 14, 4, 3], [10, 12, 2, 3]][kind];
  const x0 = Math.round(x - bw / 2);
  if (kind === 4) { oval(g, x, y - 6, 6, 6.5, INK); oval(g, x, y - 6, 5, 5.5, '#B8D0D8'); box(g, x - 4, y - 6, 9, 5, '#B8701E'); box(g, x - 4, y - 6, 9, 1, '#E8A848'); box(g, x - 3, y - 10, 1, 4, '#FFFFFF'); box(g, x - 1, y - 15, 3, 4, INK); oval(g, x + 0.5, y - 16, 2.5, 2.5, INK); oval(g, x + 0.5, y - 16, 1.5, 1.5, '#D8E8F0'); return; }
  box(g, x0 - 1, y - bh - 1, bw + 2, bh + 1, INK); box(g, x0, y - bh, bw, bh, col); box(g, x0 + bw - 2, y - bh, 2, bh, dk);
  box(g, x0, y - Math.round(bh * 0.55), bw, Math.round(bh * 0.55), dk); box(g, x0 + bw - 2, y - Math.round(bh * 0.55), 2, Math.round(bh * 0.55), mix(dk, INK, 0.4));
  if (kind !== 3) { box(g, x0, y - bh - 1, 1, 1, INK); box(g, x0 + bw - 1, y - bh - 1, 1, 1, INK); }
  const nx = Math.round(x - nw / 2);
  box(g, nx - 1, y - bh - nh - 1, nw + 2, nh + 1, INK); box(g, nx, y - bh - nh, nw, nh, col); box(g, nx, y - bh - nh - 2, nw, 2, kind === 1 ? '#7F1D1D' : '#C8A070');
  const ly = y - Math.round(bh * 0.7), lh = Math.max(4, Math.round(bh * 0.4));
  box(g, x0, ly, bw, lh, hash(seed) < 0.5 ? '#E8DCB0' : '#F4ECD2'); box(g, x0, ly, bw, 1, INK); box(g, x0, ly + lh - 1, bw, 1, '#8A7A5A'); box(g, x0 + 1, ly + 2, bw - 2, 1, ['#7F1D1D', '#1E3A6A', '#2A1A10'][Math.floor(hash(seed * 1.7) * 3)]);
  box(g, x0 + 1, y - bh + 1, 1, bh - 3, lt); box(g, x0 + 1, y - bh + 1, 1, 1, '#FFFFFF');
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
    // (the floorboards: running back from him, banded darker going back, each board's seam inked, the butt joints
    // staggered, knots and nail heads, a worn pale path from the doors to the bar)
    const NB = 10, dAt = (i: number) => 1 - ((1 - BK) * i) / NB;
    for (let i = 0; i < NB; i++) poly(c, [at(eye, a, GY, dAt(i)), at(eye, b, GY, dAt(i)), at(eye, b, GY, dAt(i + 1.25)), at(eye, a, GY, dAt(i + 1.25))], [Fl[4], Fl[4], Fl[3], Fl[4], Fl[3], Fl[3], Fl[2], Fl[3], Fl[2], Fl[2]][i]);
    const [w0, wy0] = at(eye, a + 20, GY, 0.985), [w1] = at(eye, X(4250), GY, 0.985), [, wy1] = at(eye, a, GY, 0.94);
    c.globalAlpha = 0.18; box(c, w0, wy0 + (wy1 - wy0), w1 - w0, Math.abs(wy0 - wy1), Fl[6]); c.globalAlpha = 1;
    c.strokeStyle = Fl[1]; c.lineWidth = 1; c.beginPath();
    for (let x = a + 12; x < b; x += 24) { const [p0, q0] = at(eye, x, GY, 1), [p1, q1] = at(eye, x, GY, BK); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    c.stroke();
    c.strokeStyle = Fl[0]; c.beginPath();
    for (let x = a + 12, k = 0; x < b - 24; x += 24, k++) { const i = 1 + Math.floor(hash(k * 2.3) * (NB - 2)), [p0, q0] = at(eye, x, GY, dAt(i)), [p1] = at(eye, x + 24, GY, dAt(i)); c.moveTo(p0, q0); c.lineTo(p1, q0); }
    c.stroke();
    c.fillStyle = Fl[1]; c.beginPath();
    for (let k = 0; k < 28; k++) { const [kx, ky] = at(eye, a + 30 + hash(k * 5.7) * (b - a - 60), GY, 1 - hash(k * 3.9) * (1 - BK)); c.moveTo(kx + 3, ky); c.ellipse(kx, ky, 3, 1, 0, 0, Math.PI * 2); }
    c.fill();
    c.fillStyle = Fl[5];
    for (let x = a + 18; x < b; x += 48) { const [nx0, ny0] = at(eye, x, GY, 0.99); box(c, nx0, ny0, 1, 1, Fl[5]); const [nx1, ny1] = at(eye, x + 24, GY, 0.9); box(c, nx1, ny1, 1, 1, Fl[5]); }
  }
  // (the back wall)
  stillAt(c, v, BK, 'saloon-back', a, GY, -2, top - GY - 2, b - a + 4, GY - top + 4, paintBackWall);
  // (the chandeliers, hung back a little, their candles flickering)
  // (wagon-wheel chandeliers: a ceiling rose, the chain, the wheel's rim in brass with its spokes and hub, candles in
  // brass cups (wax run down them), their flames flickering, a soft glow round each (the lighting system lights the
  // room from them, art.ts townLamps), crystal drops glinting)
  for (const lx of [X(4000), X(4400), X(4750)]) atDepth(c, eye, 0.93, () => {
    const B = BRASS, ry = top + 54;
    box(c, lx - 8, top, 16, 4, INK); box(c, lx - 7, top, 14, 3, B[2]); box(c, lx - 7, top, 14, 1, B[4]);
    for (let y = top + 4; y < ry - 4; y += 4) { box(c, lx - 2, y, 4, 4, INK); box(c, lx - 1, y + ((y >> 2) & 1), 2, 2, B[(y >> 2) & 1 ? 3 : 5]); }
    for (const sx of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(lx, ry - 18); c.lineTo(lx + sx * 26, ry); c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.ellipse(lx, ry, 30, 5, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = B[2]; c.lineWidth = 4; c.stroke();
    c.strokeStyle = B[4]; c.lineWidth = 1; c.beginPath(); c.ellipse(lx, ry - 1, 30, 5, 0, Math.PI * 0.95, Math.PI * 2.05); c.stroke();
    c.strokeStyle = B[1]; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 4; k++) { const t = (k / 4) * Math.PI; c.moveTo(lx + Math.cos(t) * 28, ry + Math.sin(t) * 4); c.lineTo(lx - Math.cos(t) * 28, ry - Math.sin(t) * 4); } c.stroke();
    box(c, lx - 4, ry - 3, 8, 7, INK); box(c, lx - 3, ry - 2, 6, 5, B[3]); box(c, lx - 3, ry - 2, 2, 2, B[5]); box(c, lx - 1, ry + 4, 2, 4, B[2]); box(c, lx - 2, ry + 8, 4, 2, B[4]);
    for (let k = 0; k < 7; k++) {
      const t = (k / 7) * Math.PI * 2 + 0.2, cx = Math.round(lx + Math.cos(t) * 28), cy = Math.round(ry + Math.sin(t) * 5), back = Math.sin(t) < 0;
      c.globalAlpha = back ? 0.8 : 1;
      box(c, cx - 4, cy - 2, 8, 3, INK); box(c, cx - 3, cy - 2, 6, 2, B[4]);
      box(c, cx - 2, cy - 12, 5, 10, INK); box(c, cx - 1, cy - 11, 3, 9, '#F5F0DC'); box(c, cx - 1, cy - 11, 1, 9, '#FFFFFF'); box(c, cx + 1, cy - 8, 1, 4, '#D8CCAA');
      const fl = 6 + ((f + k * 5) % 9 < 4 ? 1 : 0) + Math.sin(f * 0.37 + k) * 0.6;
      flame(c, cx + 0.5, cy - 12, fl, f + k * 7, k);
      c.globalAlpha = 1;
    }
    halo(c, lx, ry - 14, 46, '#FFD890', 0.12);
    for (let k = 0; k < 6; k++) { const dx = lx - 25 + k * 10, dy = ry + 6 + (k % 2) * 3; box(c, dx, dy, 1, 3, '#B8C8D8'); box(c, dx - 1, dy + 3, 3, 3, (f + k * 11) % 40 < 3 ? '#FFFFFF' : '#D8E8F8'); }
  });
  // (the stage's boards going back, its front at the play plane (lit: stand on it), footlights)
  const st = Y(36);
  topBack(c, eye, X(3850), X(4060), st, 1, BK, [Fl[2], Fl[3], Fl[4], Fl[4], Fl[5]], 3);
  if (eye.y < st - 1) { c.strokeStyle = Fl[2]; c.lineWidth = 1; c.beginPath(); for (let k = 1; k < 5; k++) { const d = 1 - (1 - BK) * (k / 5), [p0, q0] = at(eye, X(3850), st, d), [p1] = at(eye, X(4060), st, d); c.moveTo(p0, q0); c.lineTo(p1, q0); } c.stroke(); }
  // (the apron: raised panels, the lit lip along its front edge)
  still(c, 'saloon-apron', X(3850), st, -2, -2, X(4060) - X(3850) + 4, GY - st + 3, g => {
    const w = X(4060) - X(3850), h = GY - st;
    box(g, -1, -1, w + 2, h + 1, INK); box(g, 0, 0, w, h, V[2]); box(g, 0, h - 4, w, 4, V[1]);
    for (let x = 6, i = 0; x < w - 26; x += 30, i++) panel(g, x, 9, 22, h - 16, V, 40 + i);
  });
  const L = hr('lip', TOPLIP); box(c, X(3850), st, X(4060) - X(3850), 1, L[3]); box(c, X(3850), st + 1, X(4060) - X(3850), 1, L[2]); box(c, X(3850), st + 2, X(4060) - X(3850), 1, L[1]);
  // (the footlights: tin shell reflectors along the edge, an oil flame in each, a little glow thrown up the curtain)
  for (let k = 0; k < 7; k++) {
    const fx = X(3862) + k * 30;
    halo(c, fx + 3, st - 6, 16, '#FFD890', 0.1);
    flame(c, fx + 3, st - 3, 5 + ((f + k * 4) % 10 < 5 ? 1 : 0), f + k * 9, k);
    box(c, fx - 2, st - 7, 10, 7, INK); box(c, fx - 1, st - 6, 8, 6, '#A8A8B0'); box(c, fx - 1, st - 6, 8, 1, '#E8E8F0'); box(c, fx + 5, st - 6, 2, 6, '#6A6A72'); box(c, fx, st - 4, 6, 2, '#FEF08A');
  }
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
  atDepth(c, eye, 0.95, () => still(c, 'saloon-piano', pa, GY, -4, -96, 106, 98, paintPiano));
  // (the player on his stool in front of it, at the keys' left end (clear of the stair's stringer over its right))
  atDepth(c, eye, 0.97, () => drawPianist(c, X(4752), GY, f, brawl));
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
    box(c, X(sa) + 2, y + 4, w - 6, 1, V[2]); box(c, X(sa) + 10, y + 3, w - 22, 1, V[4]);
    box(c, X(sa), y, w, 1, L[3]); box(c, X(sa), y + 1, w, 1, L[2]); box(c, X(sa), y + 2, w, 1, L[1]);
    // (the nosing worn pale where everybody steps)
    box(c, X(sa) + 16, y + 1, w - 32, 1, L[3]);
  }
  // (the rail on turned balusters (a vase, a ring, a bead), the newel post at the foot with its carved panel and ball)
  const railY = (x: number) => Y(236 - ((x - 4720) * 150) / 172);
  for (const [sa, sb, sh] of STEPS) for (const bx of [sa + 10, sa + 30, sa + 50]) {
    if (bx > sb - 4) continue;
    const x = X(bx), t = railY(bx), h = Y(sh) - t;
    box(c, x - 1, t, 5, h, INK); box(c, x, t, 3, h, V[3]); box(c, x, t, 1, h, V[5]);
    box(c, x - 2, t + h * 0.55, 7, h * 0.3, INK); box(c, x - 1, t + h * 0.55 + 1, 5, h * 0.3 - 2, V[3]); box(c, x - 1, t + h * 0.55 + 1, 2, h * 0.3 - 2, V[5]); box(c, x + 3, t + h * 0.55 + 1, 1, h * 0.3 - 2, V[1]);
    box(c, x - 2, t + h * 0.4, 7, 3, INK); box(c, x - 1, t + h * 0.4 + 1, 5, 1, V[5]);
    box(c, x - 2, Y(sh) - 4, 7, 4, INK); box(c, x - 1, Y(sh) - 3, 5, 2, V[4]);
  }
  const nx = X(4880), nt = railY(4880) - 8, nb = Y(50);
  box(c, nx - 5, nt, 12, nb - nt, INK); box(c, nx - 4, nt + 1, 10, nb - nt - 1, V[3]); box(c, nx - 4, nt + 1, 2, nb - nt - 1, V[5]); box(c, nx + 4, nt + 1, 2, nb - nt - 1, V[1]);
  box(c, nx - 2, nt + 12, 6, nb - nt - 22, V[2]); box(c, nx - 2, nt + 12, 6, 1, V[1]); box(c, nx - 2, nb - 11, 6, 1, V[5]);
  box(c, nx - 6, nt + 6, 14, 3, INK); box(c, nx - 5, nt + 6, 12, 2, V[4]);
  box(c, nx - 6, nb - 6, 14, 6, INK); box(c, nx - 5, nb - 5, 12, 4, V[3]); box(c, nx - 5, nb - 5, 12, 1, V[5]);
  box(c, nx - 6, nt - 3, 14, 5, INK); box(c, nx - 5, nt - 2, 12, 3, V[4]); box(c, nx - 5, nt - 2, 12, 1, V[6]);
  c.fillStyle = INK; c.beginPath(); c.arc(nx + 1, nt - 7, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = V[4]; c.beginPath(); c.arc(nx + 1, nt - 7, 4, 0, Math.PI * 2); c.fill(); box(c, nx - 1, nt - 10, 2, 2, V[6]);
  c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(X(4716), railY(4716)); c.lineTo(X(4880), railY(4880)); c.stroke();
  c.strokeStyle = V[3]; c.lineWidth = 5; c.stroke(); c.strokeStyle = V[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(X(4716), railY(4716) - 1.5); c.lineTo(X(4880), railY(4880) - 1.5); c.stroke();
  c.strokeStyle = V[6]; c.lineWidth = 1; c.beginPath(); c.moveTo(X(4730), railY(4730) - 2); c.lineTo(X(4800), railY(4800) - 2); c.stroke();
  // (the card tables: green baize going back a little, cards and chips; their legs; a chair by each)
  for (const ta of [4110, 4620]) {
    const xa = X(ta), xb = X(ta + 70), tp = Y(40), G = hr7('#1E6A3A');
    const first = ta === 4110;
    // (the chair, pushed back, behind the table's near legs)
    chair(c, first ? xa - 16 : xb + 16, GY, first ? -1 : 1, V);
    topBack(c, eye, xa - 4, xb + 4, tp, 1, 0.94, [G[1], G[2], G[3], G[3], G[4]], 2);
    // (a worn sheen across the baize going back, where the cards get dragged)
    if (eye.y < tp - 1) { const [p0, q0] = at(eye, xa + 20, tp, 0.97), [p1] = at(eye, xa + 50, tp, 0.97); c.globalAlpha = 0.5; box(c, p0, q0, p1 - p0, 1, G[5]); c.globalAlpha = 1; }
    // (turned legs, a stretcher)
    for (const lx of [xa + 6, xb - 10]) { box(c, lx - 1, tp + 8, 7, GY - tp - 8, INK); box(c, lx, tp + 8, 5, GY - tp - 8, V[2]); box(c, lx, tp + 8, 1, GY - tp - 8, V[4]); box(c, lx - 1, tp + 16, 7, 4, V[3]); box(c, lx - 1, tp + 16, 7, 1, V[5]); box(c, lx - 1, GY - 3, 7, 3, V[1]); }
    box(c, xa + 10, GY - 12, xb - xa - 18, 3, INK); box(c, xa + 10, GY - 11, xb - xa - 18, 1, V[3]);
    // (the rim: baize to the edge, a wood band round it, its lit lip (stand on it))
    box(c, xa - 5, tp - 1, xb - xa + 10, 10, INK); box(c, xa - 4, tp, xb - xa + 8, 5, G[3]); box(c, xa - 4, tp + 5, xb - xa + 8, 3, V[3]); box(c, xa - 4, tp + 5, xb - xa + 8, 1, V[5]); box(c, xa - 4, tp + 7, xb - xa + 8, 1, V[1]);
    for (let x = xa - 2; x < xb + 4; x += 3) box(c, x, tp + 3, 1, 1, G[2]);
    box(c, xa - 4, tp, xb - xa + 8, 1, L[3]); box(c, xa - 4, tp + 1, xb - xa + 8, 1, L[2]);
    // (cards fanned, chips stacked in their colors (striped edges), a whiskey glass, the bottle on the first, an ashtray
    // with a cigar going on the second)
    for (let k = 0; k < 5; k++) { const cx0 = xa + 6 + k * 4; box(c, cx0, tp - 4 + (k % 2), 6, 3, INK); box(c, cx0 + 1, tp - 3 + (k % 2), 4, 2, k === 4 ? '#F5F5F4' : '#E8E0D0'); box(c, cx0 + 2, tp - 3 + (k % 2), 1, 1, k % 2 ? '#1C1917' : '#DC2626'); }
    for (const [sx0, n, col] of [[xa + 32, 3, '#DC2626'], [xa + 39, 5, '#1D4ED8'], [xa + 46, 2, '#F5F5F4']] as const) {
      box(c, sx0 - 1, tp - n * 2 - 1, 7, n * 2 + 1, INK);
      for (let j = 0; j < n; j++) { box(c, sx0, tp - 2 - j * 2, 5, 2, col); box(c, sx0 + 1, tp - 2 - j * 2, 1, 2, '#F5F5F4'); box(c, sx0 + 3, tp - 2 - j * 2, 1, 2, '#F5F5F4'); box(c, sx0, tp - 1 - j * 2, 5, 1, mix(col, INK, 0.35)); }
    }
    box(c, xb - 12, tp - 8, 7, 8, INK); box(c, xb - 11, tp - 7, 5, 7, '#C8D8E0'); box(c, xb - 11, tp - 4, 5, 4, '#B8701E'); box(c, xb - 11, tp - 4, 5, 1, '#E8A848'); box(c, xb - 10, tp - 7, 1, 5, '#FFFFFF');
    if (first) { box(c, xb - 3, tp - 20, 7, 20, INK); box(c, xb - 2, tp - 14, 5, 14, '#5A3A12'); box(c, xb - 2, tp - 9, 5, 5, '#E8DCB0'); box(c, xb - 2, tp - 7, 5, 1, '#7F1D1D'); box(c, xb - 1, tp - 19, 3, 5, '#5A3A12'); box(c, xb - 1, tp - 13, 1, 9, '#9A7A3A'); }
    else {
      box(c, xb - 26, tp - 3, 10, 3, INK); box(c, xb - 25, tp - 2, 8, 2, '#5A5A62'); box(c, xb - 25, tp - 2, 8, 1, '#8A8A92');
      box(c, xb - 22, tp - 5, 9, 2, '#6A3E1E'); box(c, xb - 14, tp - 5, 1, 2, (f % 16) < 8 ? '#F06A1E' : '#B4281A');
      for (let k = 0; k < 3; k++) { const t = ((f * 0.5 + k * 12) % 36) / 36; c.globalAlpha = 0.3 * (1 - t); box(c, xb - 14 + Math.sin(t * 8 + k) * 2, tp - 8 - t * 26, 2 + t * 3, 2, '#D8D0C8'); }
      c.globalAlpha = 1;
      // (somebody's dropped hand, scattered on the floor under it: the aces he was hiding)
      for (const [dx, dy, col] of [[-6, -1, '#F5F5F4'], [4, -2, '#E8E0D0'], [12, 0, '#F5F5F4'], [-14, 0, '#E8E0D0']] as const) { box(c, xa + 30 + dx, GY + dy - 2, 7, 3, INK); box(c, xa + 31 + dx, GY + dy - 1, 5, 1, col); box(c, xa + 33 + dx, GY + dy - 1, 1, 1, dx > 0 ? '#DC2626' : '#1C1917'); }
    }
  }
};

/** The long bar (a solid: he can jump up on it): the paneled front, its top going back lit, the brass foot rail, the
 *  spittoons. */
export const drawBar = (c: Ctx, state: GameState, xa: number, xb: number, top: number) => {
  const v = { eye: { x: state.camera.x + 400, y: state.camera.y + 252 } };
  const V = hr('varn', VARNISH), L = hr('lip', TOPLIP), B = BRASS;
  topBack(c, v.eye, xa - 5, xb + 5, top, 1, 0.95, [V[2], V[3], V[4], V[4], V[5]], 2);
  // (rings left on the top going back, a rag)
  if (v.eye.y < top - 1) for (let k = 0; k < 5; k++) { const [rx, ry] = at(v.eye, xa + 30 + k * 61, top, 0.975 - (k % 2) * 0.012); c.strokeStyle = V[2]; c.lineWidth = 1; c.beginPath(); c.ellipse(rx, ry, 4, 1, 0, 0, Math.PI * 2); c.stroke(); }
  still(c, `saloon-bar-${xb - xa}`, xa, GY, -32, top - GY - 2, xb - xa + 64, GY - top + 3, g => {
    const w = xb - xa, t = top - GY;
    // (the top's thick front edge, a molding under it)
    box(g, -6, t - 1, w + 12, -t + 1, INK); box(g, -5, t, w + 10, 10, V[3]); box(g, -5, t + 8, w + 10, 2, V[1]);
    box(g, -3, t + 10, w + 6, 4, V[4]); box(g, -3, t + 10, w + 6, 1, V[6]); box(g, -3, t + 13, w + 6, 1, V[1]);
    for (let x = -2; x < w + 2; x += 6) box(g, x, t + 11, 3, 2, V[5]);
    // (the front: stiles and raised panels, pilasters between with brass caps)
    box(g, 0, t + 14, w, -t - 14, V[2]);
    for (let x = 10, i = 0; x < w - 20; x += 60, i++) panel(g, x, t + 20, 48, -t - 38, V, 60 + i * 2.1);
    for (let x = 2; x < w; x += 60) { box(g, x - 1, t + 14, 7, -t - 14, INK); box(g, x, t + 14, 5, -t - 14, V[3]); box(g, x, t + 14, 1, -t - 14, V[5]); box(g, x - 1, t + 15, 7, 2, B[3]); box(g, x - 1, t + 15, 7, 1, B[5]); }
    // (the kick plate scuffed by a thousand boots)
    box(g, 0, -12, w, 12, V[1]); box(g, 0, -12, w, 1, V[3]);
    for (let k = 0; k < 40; k++) box(g, hash(k * 3.7) * w, -10 + hash(k * 1.3) * 8, 2 + hash(k) * 5, 1, k % 3 ? V[0] : V[3]);
    // (the brass foot rail on its brackets, a highlight stepped along it)
    for (let x = 20; x < w; x += 70) { box(g, x - 1, -14, 5, 10, INK); box(g, x, -13, 3, 8, B[2]); box(g, x, -13, 1, 8, B[4]); box(g, x - 2, -6, 7, 2, INK); box(g, x - 1, -6, 5, 1, B[3]); }
    box(g, -4, -14, w + 8, 6, INK); box(g, -4, -13, w + 8, 4, B[2]); box(g, -4, -13, w + 8, 1, B[4]); box(g, -4, -12, w + 8, 1, B[5]); box(g, -4, -10, w + 8, 1, B[1]);
    for (let x = 6; x < w; x += 24) box(g, x, -13, 4, 1, B[6]);
    // (the spittoons, one at each end)
    spittoon(g, -18, 0); spittoon(g, w + 20, 0);
  });
  // (its lit lip: stand on it)
  box(c, xa - 5, top, xb - xa + 10, 1, L[3]); box(c, xa - 5, top + 1, xb - xa + 10, 1, L[2]); box(c, xa - 5, top + 2, xb - xa + 10, 1, L[1]);
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
