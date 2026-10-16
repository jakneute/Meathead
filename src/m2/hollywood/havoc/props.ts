// What stands about the havoc's street, each at its depth (painted once for the hour, put down farthest first): the PA's
// poles by the curb (Steve's flier taped round each; snapped off where the tornado's been), Steve's standees, his
// posters on their stands and his fliers taped to posts (held up, never on the air where a front's gone), the guests
// running for it at the back of the sidewalk (seeded: men and women, every build and skin), the windsocks at the wind's
// stretches (the gust's tell in them), the first aid tent (its canopy's top going back, FIRST AID on its valance, lit
// along its top: stood on), the way on to Steve's stage (revisits).
//
// THE SAFE TORNADO LAUNCHING ZONE: loud about it, the user's design. Painted on the pavement going back: a box in hazard
// stripes, the pavement inside it tinted, chevrons chasing into it; on the curb's face and the street (before the bend)
// stripes, the zone's name stenciled big, block arrows chasing in. YOU ARE NOW ENTERING A on its own sign on two posts
// before it. Over it a gantry at the back of the sidewalk: its posts banded in hazard colors on their footings, a truss
// across (dark along its top: scenery, not a ledge), beacons turning on its posts, two spotlights hung under it down onto
// the box, and the marquee on two chains under the truss: bulbs chasing round its edge, CUTSCENE / TRIGGER ZONE in bulbs,
// the lines flashing yellow and red against each other (faster once it's coming). Spent: painted on still, the bulbs
// dead, no lights.

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson } from '../../adventure/temple/people';
import { GY } from '../geometry';
import { X, x1 as X1, ZONE, REFILL, HORNS, STEVES, WIND } from './layout';
import type { Hv } from './state';
import { isTorn, guestAt, GUEST_BASES } from './chase';
import {
  type Ctx, type View, INK, box, mix, hash, poly, at, atDepth, stillAt, seen, signText, FRONT_D, STEEL, STEVE, BRASS, CONCRETE, hour,
  ramp6, post, board,
} from '../blvd/kit';
import { enamel, gate } from '../../hub/letters';
import type { Look } from '../../signLetters';
import { paintStandee, steveCard } from '../blvd/props';
import { paintPA, paintPosterStand } from '../lot/props';
import { PA_D, STANDEE_D, PROP_D, SIGN_D, GUEST_D, GANTRY_D, hazard, lip, chain, truss, tubeV } from './paint';

// ---------------------------------------------------------------------------------------------------------------
// The standing things

const paintFlierPost = (g: Ctx, seed: number) => {
  const S = STEEL.map(c => hour(c));
  box(g, -8, -6, 16, 6, INK); box(g, -7, -5, 14, 5, S[2]); box(g, -7, -5, 14, 1, S[4]);
  post(g, 0, -160, -6, 5, S);
  box(g, -3, -164, 7, 5, INK); box(g, -2, -163, 5, 3, S[4]);
  steveCard(g, 0, -116, 0.8, seed);
  box(g, -20, -140, 40, 2, 'rgba(240,240,220,0.6)'); box(g, -20, -94, 40, 2, 'rgba(240,240,220,0.6)');
};
const paintPAStub = (g: Ctx) => {
  const S = STEEL.map(c => hour(c));
  box(g, -9, -10, 18, 10, INK); box(g, -8, -9, 16, 9, S[2]); box(g, -8, -9, 16, 2, S[4]);
  post(g, 0, -34, -10, 6, S);
  poly(g, [[-4, -34], [-1, -40], [1, -35], [4, -42], [4, -34]], S[3]);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(2, -30); g.quadraticCurveTo(12, -20, 8, -4); g.stroke();
  g.strokeStyle = '#B91C1C'; g.beginPath(); g.moveTo(-1, -30); g.quadraticCurveTo(-10, -18, -6, -2); g.stroke();
};
/** The way on (the revisit): STUNTMAN STEVE'S STUPENDOUS STUNTERY > on two posts, in his yellow. */
const paintStunterySign = (g: Ctx) => {
  const S = STEEL.map(c => hour(c));
  for (const px of [-80, 80]) post(g, px, -120, 0, 6, S);
  board(g, 0, -150, ["STUNTMAN STEVE'S", 'STUPENDOUS STUNTERY >'], gate({ sx: 1, sy: 2 }, '#18181B', STEVE[3]), STEVE[3], STEVE, 7);
};

/** The first aid tent: a canopy on four legs, its top going back (lit at its front: he stands on it), FIRST AID on its
 *  valance, a cot and a kit under it. */
const tent = (c: Ctx, v: View, f: number) => {
  const x = X(REFILL - 74), w = 148, top = GY - 118, eye = v.eye;
  if (!(x + w + 60 > v.v0 && x - 60 < v.v1)) return;
  const Wt = ramp6(hour('#F4F2EE')), S = STEEL.map(col => hour(col)), Rd = ramp6(hour('#DC2626'));
  // (the back legs, the back curtain, the cot and the kit under it)
  for (const lx of [x + 4, x + w - 6]) { const [p, q] = at(eye, lx, top + 18, 0.93), [, q2] = at(eye, lx, GY, 0.93); box(c, p - 1, q, 4, q2 - q, INK); box(c, p, q, 2, q2 - q, S[3]); }
  poly(c, [at(eye, x + 4, top + 18, 0.93), at(eye, x + w - 4, top + 18, 0.93), at(eye, x + w - 4, GY - 50, 0.93), at(eye, x + 4, GY - 50, 0.93)], Wt[2]);
  atDepth(c, eye, 0.955, () => {
    box(c, x + 20, GY - 28, 70, 8, INK); box(c, x + 21, GY - 27, 68, 6, hour('#4A6A4A')); box(c, x + 21, GY - 27, 68, 2, hour('#6A8A6A'));
    box(c, x + 40, GY - 26, 20, 4, Rd[3]); for (const lx of [x + 24, x + 84]) box(c, lx, GY - 20, 3, 20, S[2]);
    box(c, x + 102, GY - 22, 26, 22, INK); box(c, x + 103, GY - 21, 24, 20, Wt[3]); box(c, x + 112, GY - 19, 6, 14, Rd[3]); box(c, x + 108, GY - 15, 14, 6, Rd[3]);
    tubeV(c, x + 132, GY - 96, GY, 2, S); box(c, x + 126, GY - 98, 14, 3, S[3]); box(c, x + 128, GY - 94, 8, 12, 'rgba(186, 230, 253, 0.8)');
  });
  // (the front legs, the canopy's top going back, its valance)
  for (const lx of [x + 2, x + w - 6]) { box(c, lx - 1, top + 18, 6, GY - top - 18, INK); box(c, lx, top + 18, 4, GY - top - 18, S[3]); box(c, lx, top + 18, 1, GY - top - 18, S[5]); box(c, lx - 3, GY - 3, 10, 3, S[1]); }
  if (eye.y < top) {
    for (let i = 0; i < 3; i++) { const p = 1 - 0.0233 * i, q = 1 - 0.0233 * (i + 1); poly(c, [at(eye, x, top, p), at(eye, x + w, top, p), at(eye, x + w, top, q), at(eye, x, top, q)], Wt[3 - i]); }
    const [cx, cy] = at(eye, x + w / 2, top, 0.965); box(c, cx - 3, cy - 6, 6, 12, Rd[3]); box(c, cx - 9, cy - 2, 18, 4, Rd[3]);
  }
  box(c, x - 2, top - 1, w + 4, 20, INK); box(c, x - 1, top, w + 2, 18, Wt[3]); box(c, x - 1, top + 14, w + 2, 4, Wt[1]);
  for (let k = 0; k < w; k += 12) { c.fillStyle = Wt[2]; c.beginPath(); c.arc(x + k + 6, top + 18, 6, 0, Math.PI); c.fill(); }
  box(c, x + 8, top + 4, 10, 10, Rd[3]); box(c, x + 11, top + 2, 4, 14, Rd[3]); box(c, x + 6, top + 7, 14, 4, Rd[3]);
  signText(c, 'FIRST AID', x + w / 2 + 10, top + 14, enamel({ sx: 1, sy: 2 }, '#DC2626'));
  lip(c, x - 1, top, w + 2);
  void f;
};

/** A windsock on its pole (the gust's tell in it: hanging, filling, out straight). */
const windsock = (c: Ctx, v: View, rx: number, f: number, done: boolean) => {
  const x = X(rx);
  if (!seen(v, x - 100, x + 20, 0.97)) return;
  const wt = f % 320, k = done ? 0.08 : wt >= 210 ? 1 : wt >= 160 ? 0.6 : 0.22, S = STEEL.map(col => hour(col));
  atDepth(c, v.eye, 0.97, () => {
    box(c, x - 8, GY - 6, 16, 6, INK); box(c, x - 7, GY - 5, 14, 5, S[2]);
    post(c, x, GY - 200, GY - 6, 5, S);
    box(c, x - 4, GY - 203, 8, 4, INK); box(c, x - 3, GY - 202, 6, 2, S[4]);
    // (the sock: stepped hoops, orange and white, out the way the wind's going, sagging when it's slack)
    const n = 5, len = 74;
    for (let j = 0; j < n; j++) {
      const u0 = j / n, u1 = (j + 1) / n, flap = Math.sin(f * 0.4 + j) * (k > 0.5 ? 2 : 1);
      const p = (u: number): [number, number] => [x - u * len * (0.25 + k * 0.75), GY - 196 + u * u * (1 - k) * 60 + flap * u];
      const r0 = 9 - u0 * 4, r1 = 9 - u1 * 4, [ax, ay] = p(u0), [bx, by] = p(u1);
      poly(c, [[ax, ay - r0 - 1], [bx, by - r1 - 1], [bx, by + r1 + 1], [ax, ay + r0 + 1]], INK);
      poly(c, [[ax, ay - r0], [bx, by - r1], [bx, by + r1], [ax, ay + r0]], j % 2 ? '#F4F0E8' : '#EA580C');
      poly(c, [[ax, ay - r0], [bx, by - r1], [bx, by - r1 * 0.3], [ax, ay - r0 * 0.3]], j % 2 ? '#FFFFFF' : '#FB923C');
    }
  });
};

export const drawHavocProps = (c: Ctx, v: View, state: GameState, hv: Hv, done: boolean) => {
  const f = state.frame;
  interface S { x: number; d: number; draw: () => void }
  const all: S[] = [];
  HORNS.forEach((rx, i) => {
    const x = X(rx);
    if (!seen(v, x - 40, x + 40, PA_D)) return;
    if (isTorn(state, 'horn', i)) all.push({ x, d: PA_D, draw: () => stillAt(c, v, PA_D, 'hh-pastub', x, GY, -20, -46, 40, 48, paintPAStub) });
    else all.push({ x, d: PA_D, draw: () => stillAt(c, v, PA_D, `hh-pa-${rx % 3}`, x, GY, -40, -236, 80, 238, g => paintPA(g, rx)) });
  });
  STEVES.forEach(([rx, kind], i) => {
    const x = X(rx);
    if (isTorn(state, 'steve', i)) return;
    if (kind === 'standee') { if (seen(v, x - 60, x + 60, STANDEE_D)) all.push({ x, d: STANDEE_D, draw: () => stillAt(c, v, STANDEE_D, 'hh-standee', x, GY, -52, -140, 104, 152, paintStandee) }); }
    else if (kind === 'poster') { if (seen(v, x - 60, x + 60, PROP_D)) all.push({ x, d: PROP_D, draw: () => stillAt(c, v, PROP_D, `hh-poster-${rx % 3}`, x, GY, -60, -210, 120, 212, g => paintPosterStand(g, rx)) }); }
    else if (seen(v, x - 40, x + 40, PROP_D)) all.push({ x, d: PROP_D, draw: () => stillAt(c, v, PROP_D, `hh-flier-${rx % 3}`, x, GY, -30, -170, 60, 172, g => paintFlierPost(g, rx % 3)) });
  });
  if (done && seen(v, X1 - 220, X1 + 20, SIGN_D)) all.push({ x: X1 - 100, d: SIGN_D, draw: () => stillAt(c, v, SIGN_D, 'hh-stuntery', X1 - 100, GY, -120, -180, 240, 182, paintStunterySign) });
  // (the guests running for it, at the back of the sidewalk: what the tornado hasn't taken)
  const people: { x: number; k: number; dir: 1 | -1 }[] = [];
  if (!done) for (let k = 0; k < GUEST_BASES.length; k++) {
    if (hv.guestsGone[k]) continue;
    const g = guestAt(k, f);
    if (seen(v, g.x - 30, g.x + 30, GUEST_D)) people.push({ x: g.x, k, dir: g.dir });
  }
  for (const p of people) atDepth(c, v.eye, GUEST_D, () => {
    c.save(); c.translate(p.x, GY); c.scale(p.dir * 0.92, 0.92);
    drawPerson(c, { seed: 900 + p.k * 37, outfit: 'guest', f, pose: 'walk', mood: 'scared', woman: p.k % 2 === 1, shorts: p.k % 3 === 0 });
    c.restore();
  });
  all.sort((a, b) => a.d - b.d);
  for (const s of all) s.draw();
  for (const [a] of WIND) windsock(c, v, a, f, done);
  tent(c, v, f);
};

// ---------------------------------------------------------------------------------------------------------------
// THE SAFE TORNADO LAUNCHING ZONE

const zoneFlash = (state: GameState, hv: Hv) => { const per = hv.tornado.surge ? 8 : 18; return state.frame % per < per / 2; };
const ZD0 = 0.998, ZD1 = FRONT_D + 0.006, BAND_D = 0.013;

/** Hazard stripes lying on the ground: x a..b, from depth d0 back to d1, sliding by phase. */
const stripesFlat = (c: Ctx, eye: View['eye'], a: number, b: number, d0: number, d1: number, phase: number) => {
  const q = (x0: number, x1: number, e0: number, e1: number): [number, number][] => [at(eye, x0, GY, e0), at(eye, x1, GY, e0), at(eye, x1, GY, e1), at(eye, x0, GY, e1)];
  c.save(); c.beginPath(); q(a, b, d0, d1).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  poly(c, q(a, b, d0, d1), '#18181B');
  c.fillStyle = '#FACC15';
  for (let sx = a - 30 + (((phase % 16) + 16) % 16); sx < b + 20; sx += 16) { c.beginPath(); [at(eye, sx, GY, d0), at(eye, sx + 8, GY, d0), at(eye, sx + 18, GY, d1), at(eye, sx + 10, GY, d1)].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); }
  c.restore();
};
/** The zone painted on the pavement going back: the tinted box, its striped edges, the chevrons chasing into it. */
export const zoneFloor = (c: Ctx, v: View, state: GameState, hv: Hv, done: boolean) => {
  const A = X(ZONE.a), B = X(ZONE.b), f = state.frame, eye = v.eye;
  if (!(B + 40 > v.v0 && A - 340 < v.v1)) return;
  // (the chevrons: on the pavement going back, the light chasing along them into it)
  for (let i = 0, x = A - 40; x > A - 300; x -= 44, i++) {
    const on = !done && (Math.floor(f / 4) + i) % 6 < 2, col = on ? '#FEF08A' : done ? '#A16207' : '#CA8A04', dm = (ZD0 + ZD1) / 2;
    poly(c, [at(eye, x - 12, GY, 0.982), at(eye, x, GY, 0.982), at(eye, x + 14, GY, dm), at(eye, x, GY, 0.902), at(eye, x - 12, GY, 0.902), at(eye, x + 2, GY, dm)], col);
  }
  // (the box: the pavement tinted inside it, hazard stripes all round it)
  poly(c, [at(eye, A, GY, ZD0), at(eye, B, GY, ZD0), at(eye, B, GY, ZD1), at(eye, A, GY, ZD1)], done ? 'rgba(250, 204, 21, 0.08)' : 'rgba(250, 204, 21, 0.16)');
  const ph = done ? 0 : f * 0.5;
  stripesFlat(c, eye, A, B, ZD0, ZD0 - BAND_D, ph);
  stripesFlat(c, eye, A, B, ZD1 + BAND_D, ZD1, -ph);
  for (const [x0, x1] of [[A, A + 8], [B - 8, B]] as const) for (let d = ZD0, j = 0; d > ZD1; d -= 0.008, j++) poly(c, [at(eye, x0, GY, d), at(eye, x1, GY, d), at(eye, x1, GY, Math.max(ZD1, d - 0.008)), at(eye, x0, GY, Math.max(ZD1, d - 0.008))], (j + Math.floor(ph / 8)) % 2 ? '#FACC15' : '#18181B');
};
/** On the street (before the bend): the curb's face striped, the zone's name stenciled big, the block arrows. */
export const zoneStreet = (c: Ctx, a: number, b: number, state: GameState, done: boolean) => {
  const A = X(ZONE.a), B = X(ZONE.b), f = state.frame;
  if (B < a || A - 320 > b) return;
  for (let i = 0, x = A - 70; x > A - 300; x -= 90, i++) {
    const on = !done && (Math.floor(f / 6) + i) % 3 === 0;
    const y = GY + 30, col = on ? '#FDE047' : done ? '#854D0E' : '#A16207', dk2 = mix(col, '#000000', 0.35);
    box(c, x - 37, y - 7, 28, 14, dk2); box(c, x - 36, y - 6, 26, 12, col); box(c, x - 36, y - 6, 26, 2, mix(col, '#FFFFFF', 0.35));
    poly(c, [[x - 11, y - 16], [x + 13, y], [x - 11, y + 16]], dk2); poly(c, [[x - 10, y - 15], [x + 12, y], [x - 10, y + 15]], col);
  }
  const ph = done ? 0 : f * 0.5;
  hazard(c, A, GY + 12, B - A, 8, ph); hazard(c, A, GY + 54, B - A, 8, -ph);
  signText(c, 'SAFE TORNADO LAUNCHING ZONE', (A + B) / 2, GY + 47, { sx: 1, sy: 3, fill: done ? '#CA8A04' : ['#FEF08A', '#FACC15', '#FACC15', '#CA8A04'], dither: true, stencil: true, worn: 0.1, wornCol: '#3F3F46', seed: 7, shadow: '#18181B' });
};

const paintEnteringSign = (g: Ctx) => {
  const S = STEEL.map(c => hour(c)), w = 136, h = 48, top = -218;
  for (const px of [-30, 24]) { box(g, px - 1, top + h, 8, -top - h, INK); box(g, px, top + h, 6, -top - h, S[3]); box(g, px, top + h, 2, -top - h, S[5]); box(g, px - 4, -5, 14, 5, INK); box(g, px - 3, -4, 12, 4, S[2]); }
  box(g, -w / 2 - 3, top - 3, w + 6, h + 6, INK); box(g, -w / 2 - 2, top - 2, w + 4, h + 4, '#FACC15'); box(g, -w / 2 - 2, top - 2, w + 4, 1, '#FEF08A');
  box(g, -w / 2 + 3, top + 3, w - 6, h - 6, '#18181B'); box(g, -w / 2 + 3, top + 3, w - 6, 1, '#3F3F46');
  const L = enamel({ sx: 2, sy: 2 }, '#FDE047', '#000');
  signText(g, 'YOU ARE NOW', 0, top + 21, L); signText(g, 'ENTERING A', 0, top + 40, L);
  for (const [sx, sy] of [[-w / 2 + 1, top + 1], [w / 2 - 3, top + 1], [-w / 2 + 1, top + h - 3], [w / 2 - 3, top + h - 3]]) box(g, sx, sy, 2, 2, '#A1A1AA');
};

/** The zone's signs: YOU ARE NOW ENTERING A before it; the gantry over it (beacons, spotlights, the marquee). */
export const zoneSigns = (c: Ctx, v: View, state: GameState, hv: Hv, done: boolean) => {
  const A = X(ZONE.a), B = X(ZONE.b), f = state.frame, mid = (A + B) / 2, on = zoneFlash(state, hv), eye = v.eye;
  if (!(B + 40 > v.v0 && A - 200 < v.v1)) return;
  stillAt(c, v, SIGN_D, 'hh-entering', A - 82, GY, -80, -230, 160, 232, paintEnteringSign);
  // The spotlights' cones: from under the truss (at its depth) down onto the box
  const trussY = GY - 404;
  if (!done) for (const [lx, dir] of [[A + 26, 1], [B - 26, -1]] as const) {
    const [sx, sy] = at(eye, lx, trussY + 22, GANTRY_D), pulse = 0.08 + 0.05 * (0.5 + 0.5 * Math.sin(f * 0.16 + dir));
    const [g0x, g0y] = at(eye, mid + dir * 30 - 80, GY, 0.97), [g1x] = at(eye, mid + dir * 30 + 80, GY, 0.97);
    for (let k = 0; k < 3; k++) { const sp = 1 - k * 0.3; c.fillStyle = `rgba(254, 240, 138, ${(pulse * (0.5 + k * 0.35)).toFixed(3)})`; c.beginPath(); c.moveTo(sx - 5, sy); c.lineTo(sx + 5, sy); c.lineTo(mid + (g1x - mid) * sp + dir * 10, g0y); c.lineTo(mid + (g0x - mid) * sp + dir * 10, g0y); c.closePath(); c.fill(); }

  }
  if (!done) { const k2 = 0.5 + 0.5 * Math.sin(f * 0.16); poly(c, [at(eye, mid - 130, GY, 0.995), at(eye, mid + 130, GY, 0.995), at(eye, mid + 110, GY, 0.95), at(eye, mid - 110, GY, 0.95)], `rgba(254, 240, 138, ${(0.12 + k2 * 0.08).toFixed(3)})`); }
  atDepth(c, eye, GANTRY_D, () => {
    // The posts (banded in hazard colors, on their footings), the truss over the street (dark along its top: not a ledge)
    for (const px of [A - 4, B - 6]) {
      box(c, px - 7, GY - 10, 24, 10, INK); box(c, px - 6, GY - 9, 22, 9, hour(CONCRETE[4])); box(c, px - 6, GY - 9, 22, 2, hour(CONCRETE[5]));
      box(c, px - 1, trussY, 12, GY - trussY - 10, INK);
      for (let y = trussY, j = 0; y < GY - 10; y += 8, j++) { const hh = Math.min(8, GY - 10 - y), yel = j % 2 === 0; box(c, px, y, 10, hh, yel ? '#FACC15' : '#27272A'); box(c, px, y, 2, hh, yel ? '#FEF08A' : '#3F3F46'); box(c, px + 8, y, 2, hh, yel ? '#CA8A04' : '#18181B'); }
    }
    const T = ['#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A', '#A1A1AA'];
    truss(c, A - 6, B + 6, trussY, 14, T, 16);
    box(c, A - 6, trussY - 2, B - A + 12, 3, '#18181B');
    // (the beacons on top of the posts, turning: a stepped dome, its flash going round)
    for (const [k, px] of [[0, A + 1], [1, B - 1]] as const) {
      const lit = !done && (Math.floor(f / 5) + k * 2) % 4 < 2;
      box(c, px - 8, trussY - 4, 16, 4, INK); box(c, px - 7, trussY - 3, 14, 3, '#3F3F46');
      box(c, px - 7, trussY - 15, 14, 12, INK); box(c, px - 6, trussY - 14, 12, 10, lit ? '#FB923C' : done ? '#57534E' : '#9A3412'); box(c, px - 6, trussY - 14, 4, 10, lit ? '#FDBA74' : done ? '#78716C' : '#C2410C');
      if (lit) { box(c, px - 4, trussY - 13, 3, 3, '#FFEDD5'); for (const [r, a] of [[26, 0.12], [16, 0.22]] as const) { c.fillStyle = `rgba(251, 146, 60, ${a})`; c.fillRect(px - r, trussY - 9 - r * 0.35, r * 2, r * 0.7); } }
    }
    // (the spotlights, hung under the truss at its ends)
    for (const [lx, dir] of [[A + 26, 1], [B - 26, -1]] as const) {
      box(c, lx - 1, trussY + 12, 3, 4, INK);
      box(c, lx - 9, trussY + 15, 18, 13, INK); box(c, lx - 8, trussY + 16, 16, 11, '#27272A'); box(c, lx - 8, trussY + 16, 16, 2, '#52525B');
      box(c, lx - 6 + dir * 2, trussY + 25, 12, 3, done ? '#57534E' : '#FEF3C7');
      for (const s of [-1, 1]) box(c, lx + s * 10 - 1, trussY + 17, 2, 8, '#18181B');
    }
    // The marquee: on two chains under the truss, bulbs chasing round its edge, the two lines flashing
    const w = 290, h = 92, top = trussY + 30, x0 = mid - w / 2;
    for (const cx of [x0 + 40, x0 + w - 40]) chain(c, cx, trussY + 12, top, T);
    box(c, x0 - 4, top - 4, w + 8, h + 8, INK);
    box(c, x0 - 3, top - 3, w + 6, h + 6, BRASS[3]); box(c, x0 - 3, top - 3, w + 6, 1, BRASS[5]); box(c, x0 - 3, top - 3, 1, h + 6, BRASS[4]); box(c, x0 - 3, top + h + 2, w + 6, 1, BRASS[1]);
    box(c, x0, top, w, h, '#7F1D1D'); box(c, x0, top, w, 2, '#A83232');
    box(c, x0 + 6, top + 6, w - 12, h - 12, '#18181B'); box(c, x0 + 6, top + 6, w - 12, 1, '#27272A');
    let n = 0;
    const bulb = (bx: number, by: number) => { const lt = !done && (n++ + Math.floor(f / 3)) % 3 === 0; box(c, bx - 1, by - 1, 4, 4, '#000'); box(c, bx, by, 2, 2, lt ? '#FEF3C7' : done ? '#44403C' : '#B45309'); if (lt) box(c, bx, by, 1, 1, '#FFFFFF'); };
    for (let x = x0 + 3; x < x0 + w - 3; x += 9) bulb(x, top + 2);
    for (let y = top + 11; y < top + h - 3; y += 9) bulb(x0 + w - 4, y);
    for (let x = x0 + w - 6; x > x0 + 3; x -= 9) bulb(x, top + h - 4);
    for (let y = top + h - 13; y > top + 3; y -= 9) bulb(x0 + 2, y);
    const look = (col: string): Look => ({ sx: 3, sy: 4, gap: 1, fill: '#000', bulbs: { lit: !done, col: done ? '#57534E' : col, dim: '#44403C' } });
    signText(c, 'SAFE TORNADO', mid, top + 42, look(on ? '#FDE047' : '#F87171'));
    signText(c, 'LAUNCHING ZONE', mid, top + 80, look(on ? '#F87171' : '#FDE047'));
  });
  void lip; void hash;
};

/** Where the zone's lights are (for the lamps). */
export const zoneLights = (v: View) => {
  const zx = X((ZONE.a + ZONE.b) / 2);
  return { floor: at(v.eye, zx, GY - 20, 0.98), sign: at(v.eye, zx, GY - 330, GANTRY_D) };
};
