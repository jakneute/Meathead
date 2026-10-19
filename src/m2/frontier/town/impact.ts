// THE CRASH's impact point (crash.ts runs the scene; this draws where No. 7 meets the depot and the ground it tore up
// getting there). The user's: "make sure the train crash looks more detailed, especially at the building's impact
// point". Peak SNES: ramps, stepped shading, dithering, inked edges; everything tinted for the hour.
//
//   before the nose gets there   the wall bowing ahead of it: the boards' seams splitting, cracks running, the bay
//                                window's glass starring (BURST frames after the hit it gives)
//   the hole                     the depot's board-and-batten caved in round the nose, board by board (each column
//                                broken off at its own height, splintered), opened up over BURST..BURST+7; the room
//                                inside seen through it from the scene's one eye: the back wall's faded paper and
//                                wainscot, the DEPARTURES board hanging askew off one nail, a clock knocked crooked, the
//                                ticket counter and its brass grille bent, the lamp swung over, a bench tipped on its
//                                back, timetables and plaster on the floor; dust hanging in it, settling; a small fire
//                                smoldering in the wreckage (soft: no glare)
//   in front of the nose         the studs snapped and bent in, the top plate broken where the headlamp went up through
//                                it, the sole plate kicked up in a V, loose boards hanging in, battens split, the buffer
//                                stop's striped beam carried in bent on the cowcatcher, dirt plowed up against the wall,
//                                the platform's boards buckled up in a wave in front of the wheels, cracks running out
//                                over the wall, a batten sprung, the other bay window shattered (shards in the sash,
//                                the curtain torn), glass and the CLOSED sign on the ground
//   the roof over it             the eaves' left end torn off the rest at BREAK: the near piece drooped on its hinge,
//                                its torn end's rafters and dangling shingles; the far piece shoved up on the headlamp;
//                                the attic dark between them; sagging in over the frames after the burst
//   the name board               hanging by its right chain, the left one snapped: swinging, then settled crooked
//   the ground                   the rails peeled up and curled (one rail section thrown aside in a loop), the ties
//                                scattered (some stood on end), spikes popped, the furrow the engine plowed, the buffer
//                                stop's stumps and its smashed red lamp; coal spilled from the tender
//
// All background (nothing lit along a top: none of it reads as somewhere to stand), collision untouched. The static
// layers are stamps (painted once for the hour); only what moves (the opening hole, the sag, the swing) draws live, and
// once it's settled it's a stamp too.

import type { GameState } from '../../../m1/game/core/state';
import { checker } from '../../../m1/game/render/pixelArt';
import { stamp } from '../../intro/art/kit';
import { timeOfDay } from '../../timeOfDay';
import { signText, fit } from '../../signLetters';
import { box, mix, hash, INK, burned, type Ctx } from '../kit';
import { N, STEEL, BRASS, COAL, VARNISH, flame, puff } from '../train/paint';
import { PLANK } from '../wilds/paint';
import { GY } from '../geometry';
import { X } from './layout';

/** The depot (places.ts's): its left foot at X(380), its width and height; where its eaves break off (places.ts's
 *  DEPOT_BREAK, the same). */
const W = 240, H = 260, BREAK = 150;
/** Frames after the hit the nose bursts the wall (crash.ts's into-the-depot beat). */
export const BURST = 14;
/** When the name board's done swinging. */
const SIGN_REST = BURST + 130;
/** The hole, board by board (14 px each, from the wall's left end): how high each column's broken off. */
const COLS = [250, 262, 262, 262, 262, 248, 236, 220, 228, 196, 176, 120, 40];
const CW = 14, RIGHT = COLS.length * CW;
/** The hole's middle (it opens out from here). */
const MID: [number, number] = [80, -130];

const TAU = Math.PI * 2;
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));
const ease = (k: number) => 1 - (1 - k) * (1 - k);
/** Seven steps round a color (darkest first), tinted for the hour. */
const r7 = (col: string) => N([mix(col, INK, 0.66), mix(col, INK, 0.44), mix(col, INK, 0.2), col, mix(col, '#FFFFFF', 0.2), mix(col, '#FFFFFF', 0.42), mix(col, '#FFFFFF', 0.66)]);
/** Still art, painted once for the hour (local box bx, by, bw, bh about (x, y)). */
const cached = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `wreck-${key}-${timeOfDay().key}`, bx, by, bw, bh, paint);
  c.restore();
};
const polyF = (g: Ctx, pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
const line = (g: Ctx, pts: number[], col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };

/** The hole's outline (local), board by board: each column's broken end in splintered teeth. */
const HOLE: [number, number][] = (() => {
  const p: [number, number][] = [[-8, 4], [-8, -COLS[0] + 8]];
  COLS.forEach((h, k) => {
    const x0 = k * CW, j = (n: number) => hash(k * 7.13 + n) - 0.5;
    p.push([x0, -h + j(1) * 6], [x0 + 4, -h - 5 - j(2) * 4], [x0 + 7, -h + 4 + j(3) * 4], [x0 + 10, -h - 7 - j(4) * 5], [x0 + CW, -h + j(5) * 4]);
  });
  p.push([RIGHT + 4, -22], [RIGHT - 2, -10], [RIGHT + 3, 4]);
  return p;
})();
const holePath = (c: Ctx, ox: number, g: number) => {
  c.beginPath();
  HOLE.forEach(([x, y], i) => { const px = ox + MID[0] + (x - MID[0]) * g, py = GY + MID[1] + (y - MID[1]) * g; if (i) c.lineTo(px, py); else c.moveTo(px, py); });
  c.closePath();
};

const growAt = (t: number) => Math.max(0.12, ease(clamp01((t - BURST) / 7)));
const sagAt = (t: number) => ease(clamp01((t - BURST - 1) / 22));
const signAt = (t: number) => (t < BURST ? 0 : t >= SIGN_REST ? -0.42 : -0.42 + 0.38 * Math.exp(-(t - BURST) / 26) * Math.cos((t - BURST) * 0.2));

/** Is the depot stove in yet (its own drawing leaves the eaves' left end and the name board to this)? */
export const stoveIn = (t: number) => t >= BURST;
/** Where the hole is (world), for the scene's dust, embers and light. */
export const holeAt = (): [number, number] => [X(380) + MID[0], GY + MID[1]];

// ---------------------------------------------------------------------------------------------------------------
// Behind the engine: the room through the hole, the attic, the far piece of the eaves

export const drawImpactBack = (c: Ctx, state: GameState, t: number) => {
  if (t < BURST) return;
  const ox = X(380), f = state.frame, eye = { x: state.camera.x + 400, y: state.camera.y + 252 };
  // (the attic behind the eaves, dark, its rafters: seen where the eaves have come away)
  cached(c, 'attic', ox, GY, -16, -300, BREAK + 20, 44, g => {
    box(g, -14, -298, BREAK + 14, 40, '#0E0904');
    checker(g, -14, -298, BREAK + 14, 6, '#1A120A', 0);
    for (let x = -6; x < BREAK; x += 22) { polyF(g, [x, -258, x + 6, -258, x + 18, -298, x + 12, -298], '#2A1C10'); line(g, [x + 1, -258, x + 13, -298], '#3E2A16'); }
  });
  const k = sagAt(t);
  if (k >= 1) cached(c, 'roofB', ox, GY, -40, -330, 130, 90, g => roofB(g, 1));
  else { c.save(); c.translate(ox, GY); roofB(c, k); c.restore(); }
  c.save();
  holePath(c, ox, growAt(t)); c.clip();
  box(c, ox - 20, GY - 300, RIGHT + 40, 304, '#120B06');
  room(c, ox, eye);
  // (a fire smoldering in the wreckage on the floor: low stepped flames, its smoke curling up inside)
  const sm = clamp01((t - BURST - 20) / 60);
  if (sm > 0) {
    for (let i = 0; i < 3; i++) { const q = ((f * 0.5 + i * 33) % 100) / 100; puff(c, ox + 128 + q * 10, GY - 20 - q * 120, 8 + q * 20, ['#2A2420', '#3E3832', '#56504A'], 0.4 * (1 - q) * sm); }
    c.globalAlpha = 1;
    for (let i = 0; i < 2; i++) flame(c, ox + 122 + i * 12, GY - 4, (10 + i * 4) * sm, f + i * 9, 3 + i);
  }
  // (the dust hanging in it, thick at the burst and settling: stepped bands, dithered at their edges)
  const dust = 0.42 * (1 - clamp01((t - BURST) / 110)) + 0.07;
  c.globalAlpha = dust;
  box(c, ox - 20, GY - 300, RIGHT + 40, 304, '#7A6A52');
  c.globalAlpha = dust * 0.8;
  box(c, ox - 20, GY - 300, RIGHT + 40, 120, '#5A4C3A');
  checker(c, ox - 20, GY - 182, RIGHT + 40, 4, '#5A4C3A', 0);
  c.globalAlpha = 1;
  // (the hole's rim: the wall's thickness in shadow round it)
  holePath(c, ox, growAt(t)); c.lineJoin = 'miter';
  c.strokeStyle = 'rgba(12, 7, 3, 0.55)'; c.lineWidth = 16; c.stroke();
  c.strokeStyle = '#140D08'; c.lineWidth = 6; c.stroke();
  c.restore();
};

/** The room inside, from the eye: its back wall (back at RB), its floor and ceiling going back, its far end's inside,
 *  the counter and the lamp (back a little), the bench (nearer). */
const room = (c: Ctx, ox: number, eye: { x: number; y: number }) => {
  const RB = 0.86;
  const at = (x: number, y: number, d: number): [number, number] => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];
  const quad = (a: [number, number], b: [number, number], cc: [number, number], d: [number, number], col: string) => polyF(c, [...a, ...b, ...cc, ...d], col);
  const depth = (d: number, draw: () => void) => { c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); draw(); c.restore(); };
  depth(RB, () => cached(c, 'room', ox, GY, -90, -330, 420, 334, paintRoom));
  const Fl = r7('#6A4A2C');
  if (eye.y < GY - 1) {
    for (let i = 0; i < 4; i++) { const d0 = 1 - ((1 - RB) * i) / 4, d1 = 1 - ((1 - RB) * (i + 1)) / 4; quad(at(ox - 90, GY, d0), at(ox + W, GY, d0), at(ox + W, GY, d1), at(ox - 90, GY, d1), i % 2 ? Fl[2] : Fl[3]); }
    c.strokeStyle = Fl[1]; c.lineWidth = 1; c.beginPath();
    for (let x = ox - 84; x < ox + W; x += 22) { const [ax, ay] = at(x, GY, 1), [bx, by] = at(x, GY, RB); c.moveTo(ax, ay); c.lineTo(bx, by); }
    c.stroke();
  }
  if (eye.y > GY - H + 1) {
    quad(at(ox - 90, GY - H, 1), at(ox + W, GY - H, 1), at(ox + W, GY - H, RB), at(ox - 90, GY - H, RB), '#1E140C');
    for (let x = ox - 80; x < ox + W; x += 40) quad(at(x, GY - H, 1), at(x + 8, GY - H, 1), at(x + 8, GY - H, RB), at(x, GY - H, RB), '#2E2014');
  }
  if (eye.x > ox) quad(at(ox, GY - H, 1), at(ox, GY - H, RB), at(ox, GY, RB), at(ox, GY, 1), r7('#56604E')[1]);
  depth(0.93, () => cached(c, 'counter', ox, GY, 30, -290, 220, 294, paintCounter));
  depth(0.97, () => cached(c, 'bench', ox, GY, -20, -70, 210, 74, paintBench));
};

/** The room's back wall: faded sage paper going dark up top in the lamp smoke, the wainscot, the DEPARTURES board
 *  hanging askew off one nail (its string snapped at the other), a clock knocked crooked, a torn poster. */
const paintRoom = (g: Ctx) => {
  const P = r7('#56604E'), V = N(VARNISH), Cr = r7('#E8DCB8');
  box(g, -90, -330, 420, 334, P[2]);
  for (let x = -90; x < 330; x += 16) { box(g, x, -260, 6, 190, P[3]); for (let y = -250; y < -80; y += 18) box(g, x + 10, y + ((x / 16) & 1) * 9, 2, 3, P[4]); }
  for (let k = 0; k < 4; k++) box(g, -90, -260 + k * 12, 420, 12, mix(P[1], INK, 0.5 - k * 0.12));
  checker(g, -90, -212, 420, 4, P[1], 0);
  box(g, -90, -330, 420, 70, '#0E0904');
  for (let x = -80; x < 330; x += 40) { box(g, x, -330, 10, 70, '#2A1C10'); box(g, x, -330, 2, 70, '#3E2A16'); }
  // (the wainscot: varnished panels, the chair rail, the baseboard)
  box(g, -90, -72, 420, 72, V[2]);
  for (let x = -84; x < 320; x += 46) { box(g, x, -64, 38, 52, V[1]); box(g, x + 2, -62, 34, 48, V[3]); box(g, x + 2, -62, 34, 1, V[5]); box(g, x + 34, -62, 2, 48, V[1]); }
  box(g, -90, -76, 420, 5, INK); box(g, -90, -75, 420, 3, V[4]); box(g, -90, -75, 420, 1, V[6]);
  box(g, -90, -8, 420, 8, V[1]); box(g, -90, -8, 420, 1, V[3]);
  // (a torn poster: SEE THE WEST BY RAIL, half of it hanging off)
  box(g, 150, -176, 46, 60, INK); box(g, 151, -175, 44, 58, Cr[4]); box(g, 151, -175, 44, 2, Cr[6]);
  box(g, 155, -166, 36, 18, r7('#C87A3A')[3]); box(g, 155, -152, 36, 4, r7('#7A9AB0')[3]);
  signText(g, 'BY RAIL', 173, -132, { sx: 1, sy: 1, fill: '#7F1D1D' });
  polyF(g, [151, -146, 195, -150, 192, -118, 176, -96, 160, -112], INK); polyF(g, [152, -145, 194, -149, 191, -119, 176, -98, 161, -113], Cr[3]);
  // (the DEPARTURES board, hanging off its one nail, the string's other end loose)
  box(g, 23, -239, 4, 4, INK); box(g, 24, -238, 2, 2, '#A1A1AA');
  line(g, [25, -237, 6, -214], '#C8B890');
  line(g, [25, -237, 98, -226, 108, -212], '#C8B890');
  g.save(); g.translate(64, -196); g.rotate(0.16);
  box(g, -60, -30, 120, 64, INK); box(g, -58, -28, 116, 60, V[3]); box(g, -58, -28, 116, 1, V[5]);
  box(g, -54, -24, 108, 52, '#1E2622'); checker(g, -54, -24, 108, 52, '#26302A', 0);
  signText(g, 'DEPARTURES', 0, -12, { sx: 1, sy: 1, fill: Cr[5] });
  box(g, -48, -8, 96, 1, Cr[2]);
  signText(g, 'NO. 7    2:15', 0, 6, { sx: 1, sy: 1, fill: Cr[4] });
  signText(g, 'NO. 7  ON TIME', 0, 20, { sx: 1, sy: 1, fill: '#F2D02A' });
  g.restore();
  // (the clock, knocked off its nail and hanging crooked, its glass starred)
  g.save(); g.translate(232, -206); g.rotate(-0.34);
  g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 15, 0, TAU); g.fill();
  g.fillStyle = V[4]; g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.fill();
  g.fillStyle = Cr[5]; g.beginPath(); g.arc(0, 0, 10, 0, TAU); g.fill();
  for (let i = 0; i < 12; i++) box(g, Math.cos((i / 12) * TAU) * 8 - 0.5, Math.sin((i / 12) * TAU) * 8 - 0.5, 1, 1, INK);
  line(g, [0, 0, 0, -7], INK, 2); line(g, [0, 0, 5, 2], INK, 2);
  line(g, [-6, -6, 0, 0, 7, -3], '#FFFFFF'); line(g, [0, 0, -2, 8], '#FFFFFF');
  g.restore();
};

/** The ticket counter (knocked askew, split at its end, its brass grille bent), TICKETS over it; the lamp swung over on
 *  its chain. */
const paintCounter = (g: Ctx) => {
  const V = N(VARNISH), B = BRASS, Cr = r7('#E8DCB8');
  const x0 = 96, x1 = 196, top = -80;
  g.save(); g.translate(x0, 0); g.rotate(-0.04); g.translate(-x0, 0);
  box(g, x0 - 1, top - 1, x1 - x0 + 2, -top + 1, INK); box(g, x0, top, x1 - x0, -top, V[2]);
  for (const px of [x0 + 6, x0 + 52]) { box(g, px, top + 10, 40, -top - 20, V[1]); box(g, px + 2, top + 12, 36, -top - 24, V[3]); box(g, px + 2, top + 12, 36, 1, V[5]); box(g, px + 36, top + 12, 2, -top - 24, V[1]); }
  box(g, x0 - 5, top - 7, x1 - x0 + 10, 8, INK); box(g, x0 - 4, top - 6, x1 - x0 + 8, 6, V[4]); box(g, x0 - 4, top - 6, x1 - x0 + 8, 1, V[6]);
  // (the grille: brass bars, two bowed in, one snapped and hanging)
  box(g, x0 + 2, top - 66, x1 - x0 - 4, 4, INK); box(g, x0 + 3, top - 65, x1 - x0 - 6, 2, B[4]);
  for (let x = x0 + 6, i = 0; x < x1 - 4; x += 7, i++) {
    const bow = i === 4 || i === 5 ? 5 : 0;
    if (i === 8) { line(g, [x, top - 62, x + 2, top - 40], INK, 3); line(g, [x, top - 62, x + 2, top - 40], B[3], 1); continue; }
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, top - 62); g.quadraticCurveTo(x - bow, top - 34, x, top - 7); g.stroke();
    g.strokeStyle = i % 2 ? B[3] : B[4]; g.lineWidth = 1; g.stroke();
  }
  box(g, x0 + 30, top - 82, 42, 13, INK); box(g, x0 + 31, top - 81, 40, 11, Cr[4]); box(g, x0 + 31, top - 81, 40, 1, Cr[6]);
  signText(g, 'TICKETS', x0 + 51, top - 72, { sx: 1, sy: 1, fill: '#7F1D1D' });
  // (split at its near end: the panel stove in, splinters)
  polyF(g, [x0, top + 4, x0 + 16, top + 18, x0 + 8, top + 40, x0 + 18, top + 62, x0, -2], '#140C08');
  for (const [a, b] of [[top + 18, 8], [top + 40, -6], [top + 62, 7]]) polyF(g, [x0 + 12, a, x0 + 22 + b, a - 4, x0 + 14, a + 3], '#D8B880');
  g.restore();
  // (the lamp, swung over on its chain and stuck)
  for (let i = 0; i < 6; i++) box(g, 150 + i * 2, -258 + i * 5, 2, 4, i % 2 ? '#52525B' : '#71717A');
  g.save(); g.translate(163, -228); g.rotate(-0.42);
  polyF(g, [-14, 0, 14, 0, 8, -10, -8, -10], INK); polyF(g, [-12, -1, 12, -1, 7, -9, -7, -9], r7('#2E5A3A')[3]); box(g, -7, -9, 14, 1, r7('#2E5A3A')[5]);
  box(g, -5, 0, 10, 8, INK); box(g, -4, 0, 8, 7, '#8A7A62'); box(g, -3, 1, 2, 5, '#C8B890');
  g.restore();
};

/** A station bench tipped over on its back (its slats stood up, its cast iron ends in the air); timetables, plaster
 *  and a split plank on the floor. */
const paintBench = (g: Ctx) => {
  const V = N(VARNISH), S = N(STEEL), Cr = r7('#E8DCB8'), Pl = r7('#C8BCA8');
  g.save(); g.translate(14, -4); g.rotate(-1.18);
  for (let k = 0; k < 3; k++) { box(g, -1, k * 9 - 1, 82, 9, INK); box(g, 0, k * 9, 80, 7, V[3 + (k & 1)]); box(g, 0, k * 9, 80, 1, V[5]); }
  for (const lx of [6, 66]) { box(g, lx - 1, -18, 9, 46, INK); box(g, lx, -17, 7, 44, S[2]); box(g, lx, -17, 2, 44, S[4]); box(g, lx - 6, -18, 18, 5, INK); box(g, lx - 5, -17, 16, 3, S[3]); }
  g.restore();
  // (the floor's litter)
  for (let i = 0; i < 9; i++) {
    const x = 40 + hash(i * 3.3) * 150, w = 6 + hash(i * 5.1) * 10;
    g.save(); g.translate(x, -3); g.rotate((hash(i * 9.7) - 0.5) * 0.8);
    if (i % 3 === 0) { box(g, -w / 2, -2, w, 4, Cr[5]); box(g, -w / 2 + 1, -1, w - 2, 1, Cr[2]); }
    else { box(g, -w / 2 - 1, -4, w + 2, 6, INK); box(g, -w / 2, -3, w, 4, Pl[3 + (i & 1)]); box(g, -w / 2, -3, w, 1, Pl[5]); }
    g.restore();
  }
  g.save(); g.translate(150, -6); g.rotate(0.2);
  box(g, -30, -4, 60, 8, INK); box(g, -29, -3, 58, 6, r7('#7A6A4A')[3]); box(g, -29, -3, 58, 1, r7('#7A6A4A')[5]);
  polyF(g, [28, -3, 36, -6, 31, 0, 37, 3, 28, 3], '#D8B880');
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The eaves' left end: the near piece (BREAK back to its torn end, drooped on its hinge) and the far piece (shoved up
// on the headlamp)

/** A run of the eaves, local x0..x1 (shingled as places.ts's, the brackets under it at the same places). */
const eaves = (g: Ctx, x0: number, x1: number, tornLeft: boolean, tornRight: boolean) => {
  const Sh = N(['#1A0E08', '#2E1A0E', '#462816', '#5E3820', '#78482A', '#946038', '#B07A4C']), T = r7('#E8D8B0');
  box(g, x0, -286, x1 - x0, 26, INK); box(g, x0 + 1, -285, x1 - x0 - 2, 24, Sh[3]);
  for (let r = 0; r < 3; r++) for (let x = -11 + (r % 2) * 6; x < W + 11; x += 12) {
    const a = Math.max(x, x0 + 1), b = Math.min(x + 11, x1 - 1);
    if (b <= a) continue;
    box(g, a, -285 + r * 8, b - a, 7, Sh[2 + ((x + r) & 1)]); box(g, a, -279 + r * 8, b - a, 1, Sh[5]);
  }
  // (the torn ends: ragged, the rafters' ends sticking out, shingles hanging off)
  const torn = (x: number, dir: number) => {
    for (let i = 0; i < 4; i++) { const y = -284 + i * 7, w = 3 + hash(x + i) * 5; box(g, dir < 0 ? x - w : x, y, w, 5, INK); }
    for (const [y, l] of [[-282, 12], [-266, 9]] as const) { const bx = dir < 0 ? x - l : x; box(g, bx, y - 1, l, 7, INK); box(g, bx, y, l, 5, '#5E4428'); box(g, bx, y, l, 1, '#8A6A40'); polyF(g, [dir < 0 ? bx : bx + l, y, dir < 0 ? bx - 4 : bx + l + 4, y + 2, dir < 0 ? bx : bx + l, y + 5], '#D8B880'); }
    for (let i = 0; i < 3; i++) {
      g.save(); g.translate(x + dir * (2 + i * 7), -260); g.rotate(dir * (0.4 + i * 0.3));
      box(g, -5, 0, 10, 8 + i * 2, INK); box(g, -4, 1, 8, 6 + i * 2, Sh[3 + (i & 1)]); box(g, -4, 1, 8, 1, Sh[5]);
      g.restore();
    }
  };
  if (tornLeft) torn(x0, -1);
  if (tornRight) torn(x1, 1);
  for (let x = 10; x < W - 4; x += 38) { if (x < x0 + 2 || x > x1 - 8) continue; box(g, x, -260, 6, 14, T[2]); box(g, x, -260, 2, 14, T[4]); box(g, x + 1, -246, 4, 2, T[1]); }
};
/** The near piece: hinged where it tore at BREAK, its left end drooped (k: how far it's sagged). */
const roofA = (g: Ctx, k: number) => {
  g.save(); g.translate(BREAK, -273); g.rotate(-0.17 * k); g.translate(-BREAK, 273);
  eaves(g, 64, BREAK + 1, true, false);
  // (the crease where it bent)
  box(g, BREAK - 2, -286, 2, 26, INK); box(g, BREAK, -285, 1, 24, '#2E1A0E');
  g.restore();
};
/** The far piece: shoved up on the headlamp, tipped back on its left end. */
const roofB = (g: Ctx, k: number) => {
  g.save(); g.translate(-12, -273 - 4 * k); g.rotate(-0.26 * k); g.translate(12, 273);
  eaves(g, -12, 58, false, true);
  g.restore();
};

/** The name board: hanging by its right chain off the eaves (the left one snapped, its ends dangling), at angle a. */
const sign = (g: Ctx, a: number) => {
  const P = N(PLANK), S = N(STEEL), px = 205, py = -260;
  const link = (x: number, y: number, i: number) => { box(g, x - 1, y, 3, 3, INK); box(g, x, y + (i & 1), 1, 2, S[4 + (i & 1)]); };
  // (the right chain, still holding it; the board)
  g.save(); g.translate(px, py); g.rotate(a);
  for (let i = 0; i < 5; i++) link(0, i * 3, i);
  box(g, -185, 14, 202, 36, INK); box(g, -184, 15, 200, 34, P[5]); box(g, -184, 15, 200, 2, P[6]); box(g, -184, 47, 200, 2, P[3]);
  for (let x = -170; x < 10; x += 46) box(g, x, 17, 1, 30, P[4]);
  signText(g, 'SAWDUST GULCH', -84, 38, fit('SAWDUST GULCH', burned(2, 7), 188));
  // (split along its grain at the left, the corner broken off, the snapped chain's end hanging off it)
  polyF(g, [-185, 26, -168, 30, -150, 27, -132, 32, -150, 34, -168, 33, -185, 36], INK);
  polyF(g, [-186, 13, -170, 13, -178, 20, -186, 24], '#140C08');
  polyF(g, [-171, 13, -165, 16, -176, 20], '#D8B880');
  g.restore();
  // (the snapped chain off the board's left end hangs straight down)
  const cs = Math.cos(a), sn = Math.sin(a), ex = px + (-176) * cs - 14 * sn, ey = py + (-176) * sn + 14 * cs;
  for (let i = 0; i < 3; i++) link(ex, ey + i * 3, i);
};

// ---------------------------------------------------------------------------------------------------------------
// In front of the engine: the wall bowing ahead of the nose, then what's left round the hole

export const drawImpactFront = (c: Ctx, state: GameState, t: number) => {
  const ox = X(380);
  if (t < 6) return;
  if (t < BURST) { bowing(c, ox, (t - 6) / (BURST - 6), state.frame); return; }
  if (t >= BURST + 3) cached(c, 'front', ox, GY, -120, -300, 410, 304, paintFront);
  const k = sagAt(t);
  if (k >= 1) cached(c, 'roofA', ox, GY, 30, -320, 140, 90, g => roofA(g, 1));
  else { c.save(); c.translate(ox, GY); roofA(c, k); c.restore(); }
  const a = signAt(t);
  if (t >= SIGN_REST) cached(c, 'sign', ox, GY, -10, -270, 250, 220, g => sign(g, a));
  else { c.save(); c.translate(ox, GY); sign(c, a); c.restore(); }
};

/** The wall bowing ahead of the nose (b 0..1): the seams splitting open up the boards, cracks running out from the
 *  corner, the bay window's glass starring. */
const bowing = (c: Ctx, ox: number, b: number, f: number) => {
  const jig = (f & 1) * b;
  for (let k = 0; k < 10; k++) {
    const x = ox + k * CW + jig, len = (60 + hash(k * 3.7) * 170) * b * (1 - k / 13);
    box(c, x - 1, GY - 20 - len, 3, len, INK); box(c, x + 2, GY - 20 - len, 1, len, '#B8A070');
  }
  c.lineCap = 'butt';
  for (const [a, l] of [[-0.3, 140], [0.2, 120], [-0.8, 110], [0.6, 90], [-1.2, 80]] as const) {
    const ex = ox + Math.cos(a) * l * b, ey = GY - 150 + Math.sin(a) * l * b;
    line(c, [ox + 2, GY - 150, (ox + ex) / 2 + 6, (GY - 150 + ey) / 2 - 4, ex, ey], INK, 2);
  }
  const wx = ox + 44, wy = GY - 122;
  for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + 0.3; line(c, [wx, wy, wx + Math.cos(a) * 24 * b, wy + Math.sin(a) * 30 * b], '#F8FAFC'); }
};

/** What's left round the hole (local: the depot's left foot at (0, 0)). */
const paintFront = (g: Ctx) => {
  const R = r7('#7A6A4A'), T = r7('#E8D8B0'), F = r7('#B08A5A'), Bk = r7('#5E4A30'), P = N(PLANK), D = r7('#7A5A36');
  g.lineJoin = 'miter'; g.lineCap = 'butt';
  /** A timber from a to b (w wide), inked, lit down one side; its ends splintered where they're broken. */
  const timber = (ax: number, ay: number, bx: number, by: number, w: number, Rm: string[], brokeA: boolean, brokeB: boolean) => {
    const l = Math.hypot(bx - ax, by - ay), an = Math.atan2(by - ay, bx - ax);
    g.save(); g.translate(ax, ay); g.rotate(an);
    box(g, -1, -w / 2 - 1, l + 2, w + 2, INK); box(g, 0, -w / 2, l, w, Rm[3]); box(g, 0, -w / 2, l, 2, Rm[5]); box(g, 0, w / 2 - 2, l, 2, Rm[1]);
    for (let i = 0; i < l - 10; i += 9) box(g, i + hash(ax + i) * 6, -w / 2 + 3 + ((i / 9) % 2) * 2, 6, 1, Rm[2]);
    const teeth = (x: number, dir: number) => { for (let i = 0; i < 3; i++) polyF(g, [x, -w / 2 + i * (w / 3), x + dir * (4 + hash(x * 3 + i) * 7), -w / 2 + i * (w / 3) + w / 6, x, -w / 2 + (i + 1) * (w / 3)], i & 1 ? '#D8B880' : '#F0D8A0'); };
    if (brokeA) teeth(0, -1);
    if (brokeB) teeth(l, 1);
    g.restore();
  };
  // ---- dirt plowed up against the wall's foot (the cowcatcher's buried in it)
  const mound = [-38, 2, -22, -10, 0, -18, 22, -24, 48, -19, 74, -27, 98, -16, 116, -8, 130, 2];
  polyF(g, mound.map((v, i) => (i % 2 ? v - 1 : v)), INK);
  polyF(g, mound, D[3]);
  polyF(g, [-22, -9, 0, -17, 22, -23, 48, -18, 74, -26, 98, -15, 98, -11, 74, -21, 48, -14, 22, -18, 0, -12, -22, -5], D[5]);
  checker(g, -20, -8, 130, 4, D[2], 0);
  for (let i = 0; i < 16; i++) { const x = -30 + hash(i * 2.9) * 150, y = -4 - hash(i * 4.3) * 14, s = 3 + hash(i * 7.7) * 4; box(g, x - 1, y - 1, s + 2, s, INK); box(g, x, y, s, s - 1, D[2 + (i % 3)]); box(g, x, y, s, 1, D[5]); }
  // ---- the platform's boards buckled up in a wave in front of the wheels
  const wave = [3, 12, 24, 30, 20, 8, 2];
  for (let i = 0; i < wave.length; i++) {
    const x = -100 + i * 14, a = (i < 3 ? -0.5 : i === 3 ? 0.05 : 0.55) + (hash(i * 5.3) - 0.5) * 0.2;
    g.save(); g.translate(x, -4 - wave[i]); g.rotate(a);
    box(g, -13, -4, 26, 8, INK); box(g, -12, -3, 24, 6, P[4]); box(g, -12, -3, 24, 1, P[6]); box(g, -12, 2, 24, 1, P[2]);
    box(g, -9, -2, 1, 1, INK); box(g, 8, -2, 1, 1, INK);
    polyF(g, [12, -3, 16, -1, 12, 3], '#D8B880');
    g.restore();
  }
  // ---- the buffer stop's striped beam, carried in on the cowcatcher and bent in a V against the counter
  for (const [ax, ay, bx, by] of [[94, -8, 124, -34], [124, -34, 156, -12]] as const) {
    const l = Math.hypot(bx - ax, by - ay), an = Math.atan2(by - ay, bx - ax);
    g.save(); g.translate(ax, ay); g.rotate(an);
    box(g, -1, -6, l + 2, 12, INK);
    for (let s = 0; s < l; s += 8) { box(g, s, -5, Math.min(8, l - s), 10, (s / 8) & 1 ? '#F2F0EA' : '#C81E1E'); box(g, s, -5, Math.min(8, l - s), 1, (s / 8) & 1 ? '#FFFFFF' : '#E85A4A'); }
    g.restore();
  }
  // ---- the sole plate kicked up in a V over the cowcatcher
  timber(32, -2, 62, -26, 8, F, false, true);
  timber(66, -24, 100, -4, 8, F, true, false);
  // ---- the studs: snapped and bent in by the nose
  timber(44, -254, 40, -194, 8, F, false, true);
  timber(86, -250, 102, -176, 8, F, false, true);
  timber(82, 0, 98, -50, 8, F, false, true);
  timber(126, 0, 134, -112, 8, F, false, true);
  timber(134, -112, 127, -232, 8, F, true, false);
  // ---- the top plate: broken where the headlamp went up through it (its left half shoved up, its right sagging)
  timber(6, -252, 50, -270, 10, F, false, true);
  timber(64, -240, RIGHT, -254, 10, F, true, false);
  // ---- the boards round the hole: inked, their broken ends' raw wood, splinters into the hole; the battens split off
  // at their own lengths
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); HOLE.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  COLS.forEach((h, k) => {
    const x0 = k * CW, j = (n: number) => hash(k * 7.13 + n) - 0.5;
    line(g, [x0 + 1, -h + j(1) * 6 - 2, x0 + 4, -h - 7 - j(2) * 4, x0 + 7, -h + 2 + j(3) * 4, x0 + 10, -h - 9 - j(4) * 5, x0 + CW - 1, -h + j(5) * 4 - 2], '#D8B880');
    for (let i = 0; i < 2; i++) { const sx = x0 + 3 + i * 6, l = 6 + hash(k * 3.1 + i) * 14; polyF(g, [sx, -h + 1, sx + 3, -h + 1, sx + 1 + (hash(k + i) - 0.5) * 6, -h + 2 + l], i ? '#C8A070' : '#E8D0A0'); }
    if (k > 0) {
      const top = -Math.min(h, COLS[k - 1]), l = 10 + hash(k * 4.7) * 18;
      box(g, x0 - 3, top - 1, 6, l + 2, INK); box(g, x0 - 2, top, 4, l, R[4]); box(g, x0 - 2, top, 1, l, R[5]);
      polyF(g, [x0 - 2, top + l, x0, top + l + 5, x0 + 2, top + l], '#D8B880');
    }
  });
  // ---- loose boards hanging in (their backs: rough, unpainted)
  const hang = (x: number, y: number, a: number, l: number) => {
    g.save(); g.translate(x, y); g.rotate(a);
    box(g, -1, -1, 14, l + 2, INK); box(g, 0, 0, 12, l, Bk[3]); box(g, 0, 0, 2, l, Bk[5]); box(g, 10, 0, 2, l, Bk[1]);
    for (let i = 6; i < l - 6; i += 11) box(g, 3 + (i % 5), i, 1, 7, Bk[2]);
    polyF(g, [0, l, 3, l + 6, 6, l + 1, 9, l + 7, 12, l], '#D8B880');
    box(g, 4, 2, 2, 2, '#71717A');
    g.restore();
  };
  hang(126, -194, 0.55, 72);
  hang(178, -118, 0.7, 58);
  hang(16, -4, Math.PI + 0.32, 80);
  // ---- cracks running out over the wall from the hole; a batten sprung off it
  for (const pts of [[RIGHT + 3, -30, 200, -36, 214, -28, 234, -42], [168, -122, 186, -140, 204, -136, 228, -160], [150, -178, 170, -198, 178, -228], [112, -232, 122, -248, 142, -252], [RIGHT, -6, 208, -12]]) {
    line(g, pts, INK, 2); line(g, pts.map((v, i) => (i % 2 ? v + 2 : v)), R[5]);
  }
  box(g, 195, -200, 4, 150, R[1]);
  g.save(); g.translate(197, -200); g.rotate(-0.09);
  box(g, -3, -1, 6, 152, INK); box(g, -2, 0, 4, 150, R[4]); box(g, -2, 0, 1, 150, R[5]); box(g, -1, 2, 2, 2, '#71717A');
  g.restore();
  // ---- the other bay window shattered: the sash dark, shards left in its corners, the muntins snapped, the curtain torn
  const sx = W - 64, sy = -150, sw = 40, sh = 56;
  box(g, sx, sy, sw, sh, '#1A120C'); checker(g, sx, sy, sw, sh, '#2A1C12', 0);
  polyF(g, [sx, sy, sx + 10, sy, sx + 6, sy + 30, sx + 12, sy + sh, sx, sy + sh], '#7A1E1A');
  polyF(g, [sx + 2, sy, sx + 6, sy, sx + 4, sy + 26, sx + 2, sy + 40], '#B8302A');
  for (const pts of [[sx, sy, sx + 15, sy, sx, sy + 17], [sx + sw, sy, sx + sw - 11, sy, sx + sw, sy + 22], [sx, sy + sh, sx + 11, sy + sh, sx, sy + sh - 13], [sx + sw, sy + sh, sx + sw - 16, sy + sh, sx + sw, sy + sh - 19], [sx + 18, sy, sx + 26, sy, sx + 21, sy + 12]]) {
    polyF(g, pts, '#A8C0CE'); line(g, [pts[2], pts[3], pts[4], pts[5]], '#F0F8FF');
  }
  box(g, sx + sw / 2 - 1, sy, 2, 24, T[2]); polyF(g, [sx + sw / 2 - 1, sy + 24, sx + sw / 2 + 1, sy + 24, sx + sw / 2 + 4, sy + 29], T[2]);
  line(g, [sx, sy + sh / 2 - 1, sx + 26, sy + sh / 2 + 5], INK, 3); line(g, [sx, sy + sh / 2 - 1, sx + 26, sy + sh / 2 + 5], T[2], 1);
  line(g, [sx - 3, sy + 12, sx - 8, sy + 2, sx - 14, sy - 6], INK, 2);
  // ---- glass on the ground (under the window, in front of the hole), the CLOSED sign blown out onto it
  for (let i = 0; i < 18; i++) { const x = i < 9 ? 150 + hash(i * 3.1) * 90 : -40 + hash(i * 5.9) * 170, y = -2 - hash(i * 8.3) * 3, w = 2 + (i % 3); box(g, x, y, w, 2, '#B8D4E4'); box(g, x, y, 1, 1, '#FFFFFF'); }
  g.save(); g.translate(204, -7); g.rotate(0.12);
  box(g, -21, -7, 42, 14, INK); box(g, -20, -6, 40, 12, '#F2E8C8'); box(g, -20, -6, 40, 1, '#FFFFFF'); box(g, -20, 5, 40, 1, '#B8AA88');
  signText(g, 'CLOSED', 0, 3, { sx: 1, sy: 1, fill: '#7F1D1D' });
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The ground torn up (behind the train): local to X(0)

export const drawYardWreck = (c: Ctx, bx: number) => {
  cached(c, 'yard', X(0), GY, 60, -140, 360, 144, g => paintYard(g, bx - X(0)));
};
const paintYard = (g: Ctx, bx: number) => {
  const S = N(STEEL), Ti = N(['#1A120C', '#2A1E14', '#3C2C1E', '#4E3A28', '#624A34', '#7A5E44']), D = r7('#7A5A36'), Tb = N(['#1E140C', '#2E2014', '#40301E', '#56422A', '#6E5838', '#8A7250', '#A88E6A']);
  // ---- the furrow the engine plowed (under it, mostly), its clods thrown up
  box(g, 150, -4, 260, 4, '#2E2014'); checker(g, 150, -6, 260, 2, '#2E2014', 0);
  for (let x = 156; x < 410; x += 17) { const h = 3 + hash(x) * 5; box(g, x - 1, -4 - h, 10, h + 1, INK); box(g, x, -3 - h, 8, h, D[3]); box(g, x, -3 - h, 8, 1, D[5]); }
  // ---- the ties kicked loose: scattered, some stood on end, some split
  const tie = (x: number, y: number, a: number, l = 14) => { g.save(); g.translate(x, y); g.rotate(a); box(g, -1, -1, l + 2, 6, INK); box(g, 0, 0, l, 4, Ti[3]); box(g, 0, 0, l, 1, Ti[5]); box(g, 2, 0, 2, 2, '#26262C'); if (l > 10) box(g, l - 4, 0, 2, 2, '#26262C'); g.restore(); };
  for (let i = 0; i < 16; i++) { const x = 92 + i * 15 + hash(i * 3.3) * 10, up = i % 5 === 2; tie(x, up ? -14 : -4 + hash(i * 7) * 3, up ? -1.25 - hash(i) * 0.3 : (hash(i * 7.7) - 0.5) * 0.9, i % 4 === 3 ? 8 : 14); }
  // ---- the rails peeled up and curled; a length of one thrown aside in a loop; spikes popped
  g.lineCap = 'round';
  for (const [w, col] of [[6, INK], [4, S[3]], [1, S[6]]] as const) {
    g.strokeStyle = col; g.lineWidth = w;
    g.beginPath(); g.moveTo(96, -4); g.quadraticCurveTo(200, -8, 236, -70); g.quadraticCurveTo(250, -104, 226, -118); g.quadraticCurveTo(208, -126, 214, -100); g.stroke();
    g.beginPath(); g.moveTo(100, -2); g.quadraticCurveTo(180, -4, 262, -34); g.quadraticCurveTo(300, -48, 304, -30); g.stroke();
    g.beginPath(); g.moveTo(318, -4); g.lineTo(350, -6); g.arc(366, -30, 22, Math.PI * 0.55, Math.PI * 2.25); g.stroke();
  }
  g.lineCap = 'butt';
  for (const [x, y] of [[150, -6], [176, -8], [204, -16], [226, -40], [282, -42]] as const) { box(g, x - 4, y - 2, 9, 4, INK); box(g, x - 3, y - 1, 7, 2, '#3A3A40'); }
  for (let i = 0; i < 7; i++) { const x = 120 + hash(i * 6.1) * 200; g.save(); g.translate(x, -3); g.rotate((hash(i * 2.2) - 0.5) * 2.4); box(g, -1, -5, 3, 7, INK); box(g, 0, -4, 1, 5, S[5]); g.restore(); }
  // ---- the buffer stop: splintered timber stumps where it stood, its red lamp smashed on its side
  polyF(g, [bx - 20, 0, bx - 16, -22, bx - 4, -30, bx + 6, -16, bx + 22, -26, bx + 26, 0], INK);
  polyF(g, [bx - 17, 0, bx - 14, -20, bx - 4, -27, bx + 5, -13, bx + 20, -23, bx + 23, 0], Tb[2]);
  polyF(g, [bx - 14, -20, bx - 4, -27, bx - 2, -20, bx - 12, -14], Tb[5]);
  for (const [px, py] of [[bx - 14, -20], [bx - 4, -27], [bx + 5, -13], [bx + 20, -23]] as const) polyF(g, [px - 2, py + 2, px, py - 6, px + 3, py + 2], '#D8B880');
  for (const by of [-14, -6]) for (const bxx of [bx - 10, bx + 8]) { box(g, bxx, by, 3, 3, INK); box(g, bxx, by, 1, 1, S[5]); }
  g.save(); g.translate(bx + 40, -6); g.rotate(1.2);
  box(g, -7, -7, 14, 14, INK); box(g, -6, -6, 12, 12, S[2]); box(g, -4, -3, 8, 7, '#3A0A0A'); box(g, -6, -6, 12, 1, S[4]);
  g.restore();
  for (let i = 0; i < 7; i++) box(g, bx + 26 + hash(i * 4.4) * 40, -2 - hash(i * 3.9) * 2, 2 + (i & 1), 2, i % 2 ? '#E8262A' : '#FF9A8A');
  for (const [px, a] of [[bx + 70, -0.2]] as const) { g.save(); g.translate(px, -4); g.rotate(a); box(g, -1, -4, 22, 8, INK); for (let k = 0; k < 3; k++) box(g, k * 7, -3, 7, 6, k % 2 ? '#F2F0EA' : '#C81E1E'); g.restore(); }
};

/** Coal spilled off the tender in a heap at x (world, its middle) on the ground, k how much has come off. */
export const drawCoalHeap = (c: Ctx, x: number, k: number) => {
  if (k <= 0) return;
  const C = N(COAL), w = 110 * k, h = 30 * k;
  polyF(c, [x - w / 2 - 2, GY, x - w * 0.2, GY - h - 2, x + w * 0.1, GY - h * 0.8 - 2, x + w / 2 + 2, GY], INK);
  polyF(c, [x - w / 2, GY, x - w * 0.2, GY - h, x + w * 0.1, GY - h * 0.8, x + w / 2, GY], C[2]);
  polyF(c, [x - w / 2 + 6, GY - 2, x - w * 0.2, GY - h + 2, x - w * 0.12, GY - h * 0.6], C[3]);
  const n = Math.floor(26 * k);
  for (let i = 0; i < n; i++) {
    const u = hash(i * 3.7) - 0.5, cx = x + u * w, top = GY - h * (1 - Math.abs(u) * 1.8), cy = Math.min(GY - 5, top + hash(i * 5.3) * (GY - top));
    box(c, cx - 1, cy - 1, 8, 7, INK); box(c, cx, cy, 6, 5, C[2 + (i % 3)]); box(c, cx, cy, 3, 1, C[6]);
  }
};
