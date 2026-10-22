// Disaster: The Ride, the doorway from the pre-show into the theater (fake 3D on the one eye: paint.ts). The dividing
// wall is a real thick wall (EL..ER) cut open along the play plane like the rest of the building: whichever of its
// faces the eye's on the side of goes back from the cut to the rooms' back walls (the pre-show's indigo, the theater's
// black), with the doorway's hole in it near the front; through the hole, the far room. The doorway's back jamb (the
// wall's thickness, a reveal) stands at DOOR_D, the brass saddle on the floor between, the head's soffit over it (when
// the eye's under it). The door's single padded leaf is hinged on the back jamb's theater corner and stands swung open
// into the theater, going back in perspective (it swings a touch further as he barges through). The theater's screen
// light spills through onto the pre-show's carpet in stepped bands (and in the lighting). At the play plane: the wall
// cut in section over the opening (block core, its skins, the roof deck over it), the casing round the opening, and
// THEATER / PLEASE MOVE ALL THE WAY IN hung on chains in front of it on the pre-show side. All scenery: nothing to
// stand on (the casing's head lit underneath, dark on top).

import { box, checker, mix, poly, at, ramp6, signW } from '../blvd/kit';
import { X, Y, GY, PRESHOW, THEATER, DOOR_HALF } from './layout';
import type { Dz } from './state';
import {
  type Ctx, type View, INK, WALL_D, seenD, levelQ, sideQ, INDIGO, BLACKS, GOLD, SHELL, CHAR, hungBoard, showLook, still, deep, faceWide,
} from './paint';

/** The wall's middle (the rooms' old shared line), its half thickness, its faces. */
export const DOOR_E = X(THEATER.a), HALF = DOOR_HALF, EL = DOOR_E - HALF, ER = DOOR_E + HALF;
/** The opening: its head's height, and how far back it goes (its back jamb's depth). */
export const DOOR_H = 166, DOOR_D = 0.95;
/** The door leaf's width (frontal), and the px a unit of 1/d stands for going back (so the leaf's as wide as the
 *  opening's deep). */
const LEAF_W = 68, KZ = LEAF_W / (1 / DOOR_D - 1);

/** The theater's light (its screen, by the scene; the fire once it's real). */
export const spillColor = (beat: number, real: boolean) => (real ? '#F97316' : ['#E0F2FE', '#FCA5A5', '#CBD5E1', '#F8FAFC', '#93C5FD', '#FDBA74'][beat] ?? '#E0F2FE');
const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a})`;

const near = (v: View) => seenD(v, EL - 260, ER + 260, WALL_D) || seenD(v, EL - 260, ER + 260);

/** The spill on the near carpet (flat, under the play plane: drawn before the floor's bent). */
export const doorwaySpillFront = (c: Ctx, v: View, beat: number, real: boolean) => {
  if (!near(v)) return;
  const col = spillColor(beat, real);
  for (let i = 0; i < 3; i++) {
    const len = 150 - i * 44, deepY = 70 - i * 18;
    poly(c, [[ER, GY], [EL - len, GY], [EL - len - 50 + i * 12, GY + deepY], [EL + 6, GY + deepY]], rgba(col, 0.06));
  }
};

/** The wall in depth: the spill on the far carpet, the saddle, the face he's looking at (its hole), the jamb, the
 *  door leaf. Before any room's play plane. */
export const doorwayBack = (c: Ctx, v: View, o: Dz, beat: number, real: boolean) => {
  if (!near(v)) return;
  const eye = v.eye, head = Y(DOOR_H), col = spillColor(beat, real);
  // (the theater's light through the opening onto the pre-show's carpet going back: a skewed patch in stepped bands)
  for (let i = 0; i < 3; i++) {
    const len = 170 - i * 50;
    poly(c, [at(eye, EL, GY, 1), at(eye, EL, GY, DOOR_D), at(eye, EL - len, GY, DOOR_D - 0.02 + i * 0.005), at(eye, EL - len - 30, GY, 1)], rgba(col, 0.07));
  }
  // (the saddle: brass, going back across the wall's thickness)
  levelQ(c, eye, EL, ER, GY, 1, DOOR_D, GOLD[2]);
  levelQ(c, eye, EL, ER, GY, 1, 0.992, GOLD[4]);
  levelQ(c, eye, EL, ER, GY, DOOR_D + 0.006, DOOR_D, GOLD[0]);
  // The face he's looking at (going back from the cut, the hole in it near the front)
  const side = eye.x < EL - 1 ? -1 : eye.x > ER + 1 ? 1 : 0;
  // (only once it's wider than a sliver on screen: a hair past its edge it flickered, its trim and inked corners popping)
  if (side && faceWide(v, side < 0 ? EL : ER, WALL_D) >= 1.5) {
    const ex = side < 0 ? EL : ER, R = side < 0 ? INDIGO : BLACKS, top = Y(side < 0 ? PRESHOW.ceil : THEATER.ceil), steps = 4;
    for (let i = 0; i < steps; i++) {
      const d0 = 1 - ((1 - WALL_D) * i) / steps, d1 = 1 - ((1 - WALL_D) * (i + 1)) / steps, cc = R[Math.max(1, 3 - i)];
      sideQ(c, eye, ex, top, head, d0, d1, cc);
      const b0 = Math.min(d0, DOOR_D);
      if (b0 > d1) sideQ(c, eye, ex, head, GY, b0, d1, cc);
    }
    // (its panels: seams going up it at depths, a dithered lit edge on each)
    for (const d of [0.93, 0.9, 0.87]) {
      sideQ(c, eye, ex, top + 20, d < DOOR_D ? GY - 18 : head - 10, d, d - 0.003, R[0]);
      sideQ(c, eye, ex, top + 20, d < DOOR_D ? GY - 18 : head - 10, d + 0.004, d, R[4]);
    }
    // (the crown along its top, the skirting along its foot past the opening)
    sideQ(c, eye, ex, top, top + 8, 1, WALL_D, side < 0 ? GOLD[2] : BLACKS[4]); sideQ(c, eye, ex, top, top + 2, 1, WALL_D, side < 0 ? GOLD[4] : BLACKS[5]);
    sideQ(c, eye, ex, GY - 13, GY, DOOR_D - 0.008, WALL_D, side < 0 ? INDIGO[0] : BLACKS[0]); sideQ(c, eye, ex, GY - 13, GY - 11, DOOR_D - 0.008, WALL_D, side < 0 ? GOLD[2] : BLACKS[3]);
    // (the casing round the hole: its head, its back leg, seen going back; inked along the hole)
    sideQ(c, eye, ex, head - 9, head, 1, DOOR_D - 0.008, GOLD[2]); sideQ(c, eye, ex, head - 2, head, 1, DOOR_D - 0.008, GOLD[4]);
    sideQ(c, eye, ex, head - 9, GY, DOOR_D, DOOR_D - 0.008, GOLD[3]); sideQ(c, eye, ex, head - 9, GY, DOOR_D, DOOR_D - 0.002, GOLD[5]);
    const [hx0, hy0] = at(eye, ex, head, 1), [hx1, hy1] = at(eye, ex, head, DOOR_D), [, by1] = at(eye, ex, GY, DOOR_D);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(hx0, hy0); c.lineTo(hx1, hy1); c.lineTo(hx1, by1); c.stroke();
    // (its far edge, the corner with the back wall, inked; the near cut's edge lit)
    const [p, q] = at(eye, ex, top, WALL_D), [, s] = at(eye, ex, GY, WALL_D);
    box(c, p - (side > 0 ? 1 : 0), q, 1, s - q, INK);
    const [cx0, cy0] = at(eye, ex, top, 1);
    box(c, cx0 - (side > 0 ? 0 : 1), cy0, 1, head - 9 - cy0, R[5]);
    // (the light from the far room catching the back casing's edge)
    sideQ(c, eye, ex, head - 4, GY - 2, DOOR_D + 0.003, DOOR_D, rgba(col, 0.35));
  }
  // The back jamb: the wall's thickness at DOOR_D (a reveal: drywall in steps, the casings either side edge-on, the
  // hinges on the theater side, the stop)
  deep(c, v, DOOR_D, () => {
    const w = ER - EL, J = side < 0 ? INDIGO : side > 0 ? BLACKS : SHELL;
    box(c, EL - 1, head - 1, w + 2, GY - head + 1, INK);
    box(c, EL, head, w, GY - head, J[2]);
    box(c, EL, head, w, 3, J[0]);
    for (let k = 0; k < 4; k++) box(c, EL + 4 + k * 5, head + 3, 2, GY - head - 3, k % 2 ? J[3] : J[1]);
    checker(c, EL + 4, head + 3, w - 8, GY - head - 3, J[3], 0, 1);
    box(c, EL, head, 4, GY - head, GOLD[3]); box(c, EL, head, 1, GY - head, GOLD[5]);
    box(c, ER - 4, head, 4, GY - head, GOLD[2]); box(c, ER - 1, head, 1, GY - head, GOLD[0]);
    box(c, ER - 8, head + 4, 3, GY - head - 4, J[0]);
    for (const hy of [head + 14, head + 76, GY - 22]) { box(c, ER - 6, hy - 1, 6, 12, INK); box(c, ER - 5, hy, 4, 10, GOLD[3]); box(c, ER - 5, hy, 4, 1, GOLD[5]); }
    box(c, EL, GY - 10, w, 10, J[0]); box(c, EL, GY - 10, w, 1, J[3]);
    // (the theater's light up its edge)
    box(c, EL + 4, head + 3, 2, GY - head - 3, rgba(col, 0.25));
  });
  // (the head's soffit, if he's under it)
  if (eye.y > head + 1) { levelQ(c, eye, EL, ER, head, 1, DOOR_D, SHELL[1]); levelQ(c, eye, EL, ER, head, 1, 0.994, GOLD[1]); }
  leaf(c, v, o, real);
};

/** The door's leaf, padded leather on the pre-show's side, black on the theater's: hinged at the back jamb's theater
 *  corner, swung open into the theater (a touch further while he's in the doorway), going back in perspective. */
const leaf = (c: Ctx, v: View, o: Dz, real: boolean) => {
  const eye = v.eye, th = ((110 + 14 * o.doorT) * Math.PI) / 180;
  const xf = ER + LEAF_W * Math.sin(th), df = DOOR_D + (1 - DOOR_D) * Math.cos(th), hh = DOOR_H - 3;
  const xs = (s: number) => ER + (xf - ER) * s, ds = (s: number) => DOOR_D + (df - DOOR_D) * s;
  const P = (s: number, h: number) => at(eye, xs(s), Y(h), ds(s));
  // (which face: the eye's side of it, by where the eye would stand going back from the play plane)
  const z = (d: number) => (1 / d - 1) * KZ, hz = z(DOOR_D), ux = xf - ER, uz = z(df) - hz;
  const cross = ux * (-KZ - hz) - uz * (eye.x - ER);
  const padded = cross < 0;
  const V = real ? CHAR : padded ? ramp6('#7F1D1D') : BLACKS;
  const quad = (s0: number, s1: number, h0: number, h1: number, cc: string) => poly(c, [P(s0, h1), P(s1, h1), P(s1, h0), P(s0, h0)], cc);
  // (its shadow on the deck, going back from the hinge)
  poly(c, [P(0, 0), P(1, 0), at(eye, xs(1) + 10, GY, ds(1) - 0.012), at(eye, ER + 6, GY, DOOR_D - 0.01)], 'rgba(0, 0, 0, 0.35)');
  // (its face in stepped bands across it: lit toward the free edge on the padded side, the hinge side darker)
  const bands = padded ? [V[2], V[3], V[3], V[4]] : [V[1], V[2], V[2], V[3]];
  for (let i = 0; i < 4; i++) quad(i / 4, (i + 1) / 4, 0, hh, bands[i]);
  if (padded && !real) {
    // (the tufting: studs in a diamond grid, each with its dimple's shadow)
    for (let r = 0, h = 30; h < hh - 12; h += 16, r++) for (let s = 0.12 + (r % 2) * 0.09; s < 0.92; s += 0.18) {
      const [px, py] = P(s, h); box(c, px - 1, py + 1, 3, 2, V[1]); box(c, px, py, 2, 2, GOLD[4]);
    }
  } else if (!padded) {
    // (the theater's side: a push plate, a sign: PULL)
    quad(0.62, 0.86, 92, 112, mix(GOLD[3], '#000000', real ? 0.6 : 0.1));
  }
  // (the kick plate, its lit top; the handle by the free edge)
  quad(0, 1, 2, 22, real ? CHAR[3] : GOLD[2]); quad(0, 1, 20, 22, real ? CHAR[4] : GOLD[5]);
  quad(0.86, 0.93, 74, 94, GOLD[4]);
  // (its free edge: the leaf's thickness, lit; inked round)
  const [ax, ay] = P(1, hh), [, by] = P(1, 0);
  box(c, ax - 1, ay, 3, by - ay, INK); box(c, ax, ay, 1, by - ay, padded ? V[5] : V[3]);
  const pts = [P(0, hh), P(1, hh), P(1, 0), P(0, 0)];
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke();
};

/** The play plane: the wall cut in section over the opening, the casing's legs at the cut, the signs. */
export const doorwayPlane = (c: Ctx, v: View, real: boolean) => {
  if (!seenD(v, EL - 240, ER + 40)) return;
  const head = Y(DOOR_H), top = Y(THEATER.ceil) - 120, ceilP = Y(PRESHOW.ceil);
  still(c, `dw-section-${real ? 1 : 0}`, DOOR_E, 0, -HALF - 6, top - 2, HALF * 2 + 12, head - top + 12, g => {
    const w = HALF * 2, l = -HALF, S = SHELL;
    // (the block core in courses, inked joints, its skins either side: the pre-show's indigo, the theater's black)
    box(g, l - 1, top, w + 2, head - top, INK);
    box(g, l, top, w, head - top, S[2]);
    for (let y = top + 2, r = 0; y < head - 10; y += 8, r++) {
      box(g, l + 3, y + 7, w - 6, 1, S[0]);
      for (let k = l + 3 + (r % 2) * 6; k < l + w - 3; k += 12) box(g, k, y, 1, 7, S[0]);
      box(g, l + 3, y, w - 6, 1, S[3]);
    }
    checker(g, l + 3, top, w - 6, head - top, S[1], 0, 1);
    box(g, l, top, 3, head - top, INDIGO[3]); box(g, l, top, 1, head - top, INDIGO[5]);
    box(g, l + w - 3, top, 3, head - top, BLACKS[3]); box(g, l + w - 1, top, 1, head - top, BLACKS[1]);
    // (the pre-show's ceiling meeting it: its fascia's end)
    box(g, l - 4, ceilP - 8, 4, 10, INK);
    // (once it's real: a crack down it, stepped)
    if (real) { const pts: [number, number][] = [[2, top + 60], [-4, top + 160], [5, top + 260], [-2, head - 14]]; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
    // (the casing's head over the opening: dark on top (no ledge), its face, lit along its underside)
    box(g, l - 6, head - 11, w + 12, 11, INK);
    box(g, l - 5, head - 10, w + 10, 9, GOLD[1]); box(g, l - 5, head - 6, w + 10, 4, GOLD[3]); box(g, l - 5, head - 2, w + 10, 1, GOLD[5]);
  });
  // (the casing's legs at the cut: thin, set against the opening)
  for (const x of [EL - 4, ER]) { box(c, x - (x < DOOR_E ? 1 : 0), head, 5, GY - head, INK); box(c, x, head, 4, GY - head, GOLD[1]); box(c, x + (x < DOOR_E ? 0 : 3), head, 1, GY - head, GOLD[4]); }
  // The signs: THEATER on chains off the pre-show's ceiling, PLEASE MOVE ALL THE WAY IN hung under it
  const big = showLook(2, 2, '#F97316', '#1C0A06'), small = showLook(1, 1, '#FDE68A', '#000000');
  const lw = signW('PLEASE MOVE ALL THE WAY IN', small) + 16, cx = Math.round(EL - 26 - lw / 2);
  if (seenD(v, cx - lw / 2 - 20, cx + lw / 2 + 20)) {
    still(c, 'dw-signs', cx, 0, -lw / 2 - 20, ceilP - 1, lw + 40, 110, g => {
      // (the plaque's chains run up past the board to the ceiling, then the board over them)
      hungBoard(g, 0, ceilP + 58, ceilP, ['PLEASE MOVE ALL THE WAY IN'], small, '#312E81');
      hungBoard(g, 0, ceilP + 22, ceilP, ['THEATER'], big, '#1C1917');
    });
  }
};
