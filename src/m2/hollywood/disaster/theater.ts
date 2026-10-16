// Disaster: The Ride, the theater (the final pass: peak SNES, fake 3D on the one eye: paint.ts). A black box: its back
// wall in quilted acoustic panels, the screen's black velour masking either side in stepped folds, the EXIT (chained
// during the show), Steve's poster; the lighting grid going back under the ceiling, pipe battens of par cans at their
// depths, the front-of-house truss (dim: scenery); the black deck going back, glow tape on it. The big screen hung in
// front of the wall (its silver, its frame, the speaker stacks either side, the footage: footage.ts). Under it the
// effects (the space heater and the red gel, the desk fan on its stool, the AC on its stand, the squirt nozzle, the fog
// machine), each with its masking-tape label. At the play plane: the lean rails, the FX DEPT cases, the hung truss, the
// catwalks (grating, kick plates; their handrails dim: not ledges), all lit along their lips; the cow on its chain; the
// EFFECTS CONTROL booth and its lever. Once it's REAL: cracks up the wall, scorch round the heater, frost blooming off
// the AC and icicles under the catwalks, water out of the screen across the floor, the screen torn and burnt (the
// footage flickering through the rip), the booth under the truss; the far wall out flat on the lot, the backlot burning
// under the red sky through the hole (the lot's own far off, by the hour).

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson } from '../../adventure/temple/people';
import { box, checker, mix, hash, poly, at, bandedGradient, pixelBlob, ramp6, board, plain, words, sideBack, topBack, ASPHALT } from '../blvd/kit';
import { steveCard } from '../blvd/props';
import { beam } from '../coaster/paint';
import { throwAngle } from '../lever';
import {
  X, Y, GY, PRESHOW, THEATER, FAR_WALL, SCREEN, FX, CAT_L, CAT_R, BOOTH, COW_AT, LEAN_RAILS, WATCHERS, LEDGES, REAL_LEVER,
} from './layout';
import type { Dz } from './state';
import { FX_LEN } from './show';
import { footage } from './footage';
import {
  type Ctx, type View, INK, WALL_D, SCREEN_D, seenD, spanAt, levelQ, sideQ, BLACKS, TRUSS, CASE, GOLD, SILVER, SHELL, CHAR, ICE, FIRE, WATER,
  INDIGO, lip, dimRail, tubeH, tubeV, truss, chain, standBoard, showLook, stencil, still, deep,
} from './paint';
import { backWall, floorBack, ceilingUnder, sideWall, plenum } from './rooms';

import { EFX_D } from './paint';

// ---------------------------------------------------------------------------------------------------------------
// The shell

/** The theater's back wall: quilted acoustic panels in blacks, the screen's velour masking in folds, a kick strip and
 *  the aisle's step lights, the EXIT (chained shut, or blown open), Steve's poster (TESTED BY STEVE). */
const paintTheaterWall = (g: Ctx, x: number, w: number, real: boolean) => {
  const top = Y(THEATER.ceil), K = BLACKS;
  bandedGradient(g, x, top, w, GY - top, [K[1], K[2], K[2], K[1]], 6);
  const mA = X(SCREEN.a - 150), mB = X(SCREEN.b + 150);
  for (let k = Math.floor((x - X(THEATER.a)) / 96) * 96 + X(THEATER.a) + 10; k < x + w; k += 96) {
    if (k + 84 > mA && k < mB) continue;
    for (let y = top + 40; y < GY - 120; y += 96) {
      box(g, k - 1, y - 1, 86, 86, INK);
      box(g, k, y, 84, 84, K[3]); box(g, k, y, 84, 2, K[5]); box(g, k, y, 2, 84, K[4]); box(g, k + 80, y, 4, 84, K[1]); box(g, k, y + 80, 84, 4, K[1]);
      // (the quilting: a cross of stitched seams, the pillow of it lit up and left)
      box(g, k + 41, y + 4, 1, 76, K[1]); box(g, k + 4, y + 41, 76, 1, K[1]);
      for (const [qx, qy] of [[k + 6, y + 6], [k + 45, y + 6], [k + 6, y + 45], [k + 45, y + 45]]) { box(g, qx, qy, 14, 3, K[4]); box(g, qx, qy, 3, 14, K[4]); checker(g, qx + 3, qy + 3, 12, 12, K[4], 0, 1); }
    }
  }
  // (the masking either side of the screen and over it: black velour, folds in steps)
  if (x < mB && x + w > mA) {
    for (let k = Math.max(x, mA); k < Math.min(x + w, mB); k += 2) {
      const ph = ((k - mA) % 28) / 28, col = ph < 0.25 ? K[4] : ph < 0.5 ? K[3] : ph < 0.8 ? K[2] : K[1];
      box(g, k, top, 2, GY - top - 10, col);
    }
    box(g, Math.max(x, mA), GY - 14, Math.min(x + w, mB) - Math.max(x, mA), 4, K[0]);
  }
  // (the kick strip, the step lights along it)
  box(g, x, GY - 10, w, 10, INK); box(g, x, GY - 9, w, 9, K[0]);
  for (let k = Math.ceil(x / 120) * 120; k < x + w; k += 120) { box(g, k, GY - 7, 6, 3, '#F59E0B'); box(g, k, GY - 7, 6, 1, '#FDE68A'); }
  // (the crown: a black batten, the pipe at its top)
  box(g, x, top, w, 8, INK); box(g, x, top + 1, w, 5, K[3]); box(g, x, top + 1, w, 1, K[5]);
  // (the EXIT: the door, chained shut during the show (its card), or blown open once it's real)
  const ex = X(THEATER.b - 90);
  if (x < ex + 60 && x + w > ex - 60) {
    box(g, ex - 42, GY - 134, 84, 134, INK);
    if (!real) {
      const D = ramp6('#44403C');
      for (const s of [-1, 1]) { const lx = s < 0 ? ex - 40 : ex + 1; box(g, lx, GY - 132, 39, 132, D[3]); box(g, lx, GY - 132, 39, 2, D[5]); box(g, lx, GY - 132, 2, 132, D[4]); box(g, lx + 36, GY - 132, 3, 132, D[1]); box(g, lx + 4, GY - 76, 31, 5, D[1]); box(g, lx + 4, GY - 76, 31, 1, D[5]); }
      // (the chain, crossed over the push bars, the padlock)
      for (const [x0, y0, x1, y1] of [[ex - 38, GY - 96, ex + 38, GY - 52], [ex + 38, GY - 96, ex - 38, GY - 52]] as const) {
        const n = 14;
        for (let i = 0; i <= n; i++) { const t = i / n, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 6; box(g, cx - 2, cy - 2, 5, 4, INK); box(g, cx - 1, cy - 1, 3, 2, i % 2 ? SILVER[4] : SILVER[2]); }
      }
      box(g, ex - 7, GY - 82, 14, 14, INK); box(g, ex - 6, GY - 81, 12, 12, GOLD[3]); box(g, ex - 6, GY - 81, 12, 2, GOLD[5]); box(g, ex - 4, GY - 88, 8, 7, INK);
      board(g, ex, GY - 112, ['CLOSED DURING', 'THE DISASTERS'], showLook(1, 1, '#B91C1C', '#FEF3C7'), '#FEF3C7', GOLD, 4);
    } else {
      box(g, ex - 40, GY - 132, 80, 132, '#1C0806'); bandedGradient(g, ex - 40, GY - 132, 80, 132, ['#2A0808', '#5A1A0C', '#2A0A06'], 4);
      // (one door hanging off a hinge, scorched)
      poly(g, [[ex - 40, GY - 130], [ex - 6, GY - 118], [ex - 14, GY - 4], [ex - 40, GY - 2]], CHAR[3]); poly(g, [[ex - 40, GY - 130], [ex - 30, GY - 126], [ex - 34, GY - 2], [ex - 40, GY - 2]], CHAR[4]);
    }
    // (the EXIT sign over it, in its box)
    box(g, ex - 26, GY - 158, 52, 20, INK); box(g, ex - 25, GY - 157, 50, 18, '#0E2A14');
    words(g, 'EXIT', ex, GY - 143, { sx: 2, sy: 2, fill: real ? '#14532D' : '#4ADE80', shadow: '#052E16' });
  }
  // (Steve, a poster on the wall: tested the effects; a placard under it)
  const sp = X(5150);
  if (x < sp + 70 && x + w > sp - 70) {
    steveCard(g, sp, GY - 300, 1.4, 2, 'poster');
    board(g, sp, GY - 228, ['TESTED BY STEVE', 'HE GOT WARM'], showLook(1, 1, '#FDE047', '#000000'), '#1C1917', GOLD, 4);
  }
};

/** The grid under the ceiling going back: pipe battens at their depths, par cans on them (gelled, lit or dark). */
const grid = (c: Ctx, v: View, real: boolean) => {
  const ceil = Y(THEATER.ceil);
  if (v.eye.y <= ceil + 20) return;
  for (const d of [WALL_D + 0.02, 0.9, 0.95]) {
    const [a, b] = spanAt(v, d, 60), lo = Math.max(a, X(THEATER.a)), hi = Math.min(b, X(FAR_WALL));
    if (hi <= lo) continue;
    const T = TRUSS.map(cc => mix(cc, '#060508', 0.35 + (1 - d) * 1.5));
    deep(c, v, d, () => {
      tubeH(c, lo, hi, ceil + 16, 4, T);
      for (let x = Math.ceil(lo / 260) * 260; x < hi; x += 260) box(c, x, ceil, 2, 16, T[1]);
      for (let x = Math.ceil(lo / 130) * 130 + 40; x < hi; x += 130) {
        const k = hash(x * 0.13 + d), gel = real ? (k > 0.5 ? '#7F1D1D' : '#2A0A08') : ['#FDE68A', '#93C5FD', '#FCA5A5', '#FDE68A'][Math.floor(k * 4)];
        box(c, x - 1, ceil + 20, 3, 5, T[2]);
        box(c, x - 7, ceil + 24, 14, 18, INK); box(c, x - 6, ceil + 25, 12, 16, CASE[3]); box(c, x - 6, ceil + 25, 3, 16, CASE[5]);
        box(c, x - 7, ceil + 41, 14, 3, INK); box(c, x - 6, ceil + 41, 12, 2, k > 0.55 || real ? gel : mix(gel, '#000000', 0.6));
      }
    });
  }
};

export const theaterShell = (c: Ctx, v: View, real: boolean) => {
  const a = X(THEATER.a), b = X(FAR_WALL);
  backWall(c, v, `theater-${real ? 1 : 0}`, a, b, THEATER.ceil, (g, x, w) => paintTheaterWall(g, x, w, real));
  ceilingUnder(c, v, a, b, THEATER.ceil, BLACKS, 120);
  floorBack(c, v, a, b, ['#060508', '#0C0A0E', '#16131A', '#1E1A22', '#28232C', '#332C38'], (x, row) => (row % 2 === 0 && x % 240 === 0 ? '#C8F07A' : hash(x * 0.29 + row) > 0.8 ? '#28232C' : null));
};
/** The partition from the pre-show (the theater's left wall above it, or the pre-show's side of it). */
export const theaterPartition = (c: Ctx, v: View) => {
  const e = X(THEATER.a);
  if (!seenD(v, e - 10, e + 10, WALL_D) && !seenD(v, e - 10, e + 10)) return;
  const inT = v.eye.x > e;
  sideWall(c, v, e, inT ? THEATER.ceil : PRESHOW.ceil, inT ? BLACKS : INDIGO, inT ? TRUSS.map(cc => mix(cc, '#000000', 0.4)) : GOLD, { h: 166, to: 0.96, col: inT ? INDIGO[1] : BLACKS[0] });
};
export const theaterPlenum = (c: Ctx, v: View, real: boolean, open: boolean) => {
  plenum(c, v, open ? 'theater-open' : 'theater', X(THEATER.a), X(FAR_WALL + (open ? 0 : 40)), THEATER.ceil, BLACKS);
  // (the building's broken end over the hole, once the wall's out: the roof torn off ragged, rebar, insulation)
  if (open && seenD(v, X(FAR_WALL) - 60, X(FAR_WALL) + 60)) {
    const wx = X(FAR_WALL), top = Y(THEATER.ceil);
    // (looking in from outside: the roof's torn end going back over the ceiling, dark, its deck's edge)
    if (v.eye.x > wx + 2) {
      sideQ(c, v.eye, wx, top - 1400, top, 1, WALL_D, '#0E0C10');
      sideQ(c, v.eye, wx, top - 120, top - 108, 1, WALL_D, SHELL[2]);
      sideQ(c, v.eye, wx, top - 8, top, 1, WALL_D, BLACKS[3]);
    }
    const edge: [number, number][] = [[wx, top - 1600], [wx + 20, top - 1600], [wx + 44, top - 200], [wx + 8, top - 140], [wx + 30, top - 98], [wx + 2, top - 66], [wx + 24, top - 30], [wx + 10, top + 2], [wx, top + 2]];
    poly(c, edge.map(([x, y]) => [x + 1, y] as [number, number]), INK);
    poly(c, edge, '#0E0C10');
    poly(c, [[wx + 24, top - 30], [wx + 10, top + 2], [wx + 6, top + 2], [wx + 18, top - 30]], SHELL[3]);
    poly(c, [[wx + 30, top - 98], [wx + 2, top - 66], [wx, top - 66], [wx + 24, top - 98]], SHELL[3]);
    c.lineCap = 'round';
    for (const [lw, col] of [[4, INK], [2, '#8A3A1A']] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(wx + 22, top - 32); c.lineTo(wx + 46, top - 46); c.moveTo(wx + 28, top - 96); c.lineTo(wx + 56, top - 88); c.moveTo(wx + 12, top - 140); c.lineTo(wx + 40, top - 160); c.stroke(); }
    c.lineCap = 'butt';
    for (let k = 0; k < 4; k++) pixelBlob(c, wx + 14 + k * 4, top - 20 - k * 44, 8, 5, '#C8A040');
    void real;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The screen

const screenAt = () => ({ sx: X(SCREEN.a), sy: Y(SCREEN.hi), sw: SCREEN.b - SCREEN.a, sh: SCREEN.hi - SCREEN.lo });
/** The speaker stacks hung either side of the screen (where the narrator comes out of). */
const paintSpeaker = (g: Ctx) => {
  const K = CASE;
  box(g, -31, -1, 62, 130, INK); box(g, -30, 0, 60, 128, K[3]); box(g, -30, 0, 60, 2, K[5]); box(g, -30, 0, 2, 128, K[4]); box(g, 26, 0, 4, 128, K[1]);
  for (const [cy, r] of [[30, 20], [80, 20], [116, 8]] as const) {
    g.fillStyle = INK; g.beginPath(); g.arc(0, cy, r + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = K[1]; g.beginPath(); g.arc(0, cy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = K[2]; g.beginPath(); g.arc(-2, cy - 2, r * 0.7, 0, Math.PI * 2); g.fill();
    g.fillStyle = K[4]; g.beginPath(); g.arc(0, cy, r * 0.25, 0, Math.PI * 2); g.fill();
  }
};
const drawScreen = (c: Ctx, v: View, o: Dz, beat: number, k: number, real: boolean, f: number) => {
  const r = o.real, { sx, sy, sw, sh } = screenAt();
  deep(c, v, SCREEN_D, () => {
    // (the cables up to the grid, the speakers, the frame: black, a silver bead round it)
    for (const cx of [sx + 60, sx + sw - 60]) chain(c, cx, Y(THEATER.ceil), sy - 14);
    for (const cx of [sx - 60, sx + sw + 60]) { chain(c, cx, Y(THEATER.ceil), sy + 10); still(c, 'speaker', cx, sy + 10, -32, -2, 64, 132, paintSpeaker); }
    still(c, 'screenframe', sx, sy, -16, -16, sw + 32, sh + 32, g => {
      box(g, -15, -15, sw + 30, sh + 30, INK); box(g, -13, -13, sw + 26, sh + 26, BLACKS[2]); box(g, -13, -13, sw + 26, 2, BLACKS[4]);
      box(g, -3, -3, sw + 6, sh + 6, SILVER[1]); box(g, -3, -3, sw + 6, 1, SILVER[4]);
    });
    if (r.phase === 'on' && r.step < 2) {
      bandedGradient(c, sx, sy, sw, sh, f % 20 < 10 ? ['#4A0A0A', '#7F1D1D', '#4A0A0A'] : ['#0A0202', '#1C0404', '#0A0202'], 6);
      words(c, 'REAL DISASTERS', sx + sw / 2, sy + sh / 2, showLook(4, 5, '#FDE047', '#000000'));
      words(c, '(EXPERIMENTAL)', sx + sw / 2, sy + sh / 2 + 40, showLook(3, 3, '#F8FAFC', '#000000'));
    } else if (!real || (r.phase === 'on' && r.fire < 0.25)) {
      footage(c, sx, sy, sw, sh, beat, k, f);
      // (the silver's weave over it, faint; the hot spot in the middle)
      checker(c, sx, sy, sw, sh, 'rgba(255,255,255,0.03)', 0, 2);
    } else {
      // (torn and burnt: the footage flickering through the rip, the rest scorched in stepped rings, the silver in tatters)
      bandedGradient(c, sx, sy, sw, sh, [CHAR[1], CHAR[2], CHAR[3], CHAR[2]], 5);
      const rip = () => { c.beginPath(); c.moveTo(sx + 300, sy); c.lineTo(sx + 520, sy + 120); c.lineTo(sx + 430, sy + sh); c.lineTo(sx + 700, sy + sh); c.lineTo(sx + 640, sy + 90); c.lineTo(sx + 820, sy); c.closePath(); };
      c.save(); rip(); c.clip();
      if (f % 30 < 22) footage(c, sx, sy, sw, sh, beat, k, f); else { box(c, sx + 300, sy, 520, sh, '#2A2A2E'); for (let i = 0; i < 60; i++) box(c, sx + 300 + ((i * 41 + f * 13) % 520), sy + ((i * 19 + f * 7) % sh), 6, 2, '#E7E5E4'); }
      c.restore();
      c.strokeStyle = INK; c.lineWidth = 3; rip(); c.stroke();
      // (the burnt edge of the rip: a lit char rim, embers)
      c.strokeStyle = FIRE[1]; c.lineWidth = 1; rip(); c.stroke();
      for (let i = 0; i < 8; i++) { const ex = sx + 300 + hash(i * 3.1) * 520, ey = sy + hash(i * 5.7) * sh; if ((f + i * 9) % 40 < 20) box(c, ex, ey, 2, 2, FIRE[4]); }
      for (let i = 0; i < 9; i++) { const bx = sx + 60 + i * 120, by = sy + 30 + (i % 3) * 70; pixelBlob(c, bx, by, 70, 40, 'rgba(10, 8, 7, 0.45)'); pixelBlob(c, bx, by, 40, 22, 'rgba(10, 8, 7, 0.5)'); }
      // (tatters hanging off the top, the silver's back showing)
      for (let i = 0; i < 7; i++) { const tx = sx + 40 + i * 150 + (i % 2) * 40, th = 30 + hash(i) * 50; poly(c, [[tx, sy], [tx + 26, sy], [tx + 16, sy + th], [tx + 8, sy + th - 10]], SILVER[1]); poly(c, [[tx, sy], [tx + 8, sy], [tx + 8, sy + th - 10]], SILVER[3]); }
      if (r.flood > 0.2) for (let i = 0; i < 6; i++) { const wx = sx + 160 + i * 150; box(c, wx, sy + 60, 8, sh - 60, 'rgba(90, 150, 212, 0.4)'); box(c, wx, sy + 60, 2, sh - 60, 'rgba(166, 206, 242, 0.5)'); }
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The effects under the screen

const tape = (c: Ctx, x: number, y: number, text: string, col: string) => {
  const w = text.length * 6 + 8;
  box(c, x - w / 2 - 1, y - 9, w + 2, 11, INK); box(c, x - w / 2, y - 8, w, 9, '#E8E0C8'); box(c, x - w / 2, y - 8, w, 1, '#FFF8E0');
  box(c, x - w / 2, y - 8, 2, 9, '#C8BCA0'); box(c, x + w / 2 - 2, y - 8, 2, 9, '#C8BCA0');
  words(c, text, x, y, plain(1, 1, col));
};
/** A desk fan's head (cage, hub, blades turning by `spin`), its middle at (0, 0). */
export const fanHead = (c: Ctx, spin: number) => {
  const S = SILVER;
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 23, 0, Math.PI * 2); c.fill();
  c.fillStyle = S[3]; c.beginPath(); c.arc(0, 0, 21, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#2A3038'; c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.fill();
  c.save(); c.rotate(spin);
  for (let i = 0; i < 3; i++) { c.rotate((Math.PI * 2) / 3); c.fillStyle = INK; c.beginPath(); c.ellipse(0, -9, 6, 10, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#7A8494'; c.beginPath(); c.ellipse(0, -9, 5, 9, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#A8B2C0'; c.beginPath(); c.ellipse(-2, -11, 2, 5, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  c.strokeStyle = S[4]; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 12, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(a) * 4, Math.sin(a) * 4); c.lineTo(Math.cos(a) * 21, Math.sin(a) * 21); c.stroke(); }
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C8302A'; c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill();
  box(c, -2, -2, 2, 2, '#F87171');
};
/** The cow (the tornado scene's prop: fiberglass, stepped), its middle at (0, 0), facing right. */
export const cowProp = (c: Ctx, harness: boolean) => {
  box(c, -31, -15, 62, 30, INK);
  box(c, -30, -14, 60, 28, '#F4F4F2'); box(c, -30, -14, 60, 3, '#FFFFFF'); box(c, -30, 6, 60, 8, '#C8C8C4'); checker(c, -30, 2, 60, 4, '#C8C8C4', 0, 1);
  box(c, -16, -14, 18, 12, '#1C1917'); box(c, -16, -14, 18, 2, '#3A3634'); box(c, 8, -2, 12, 10, '#1C1917'); box(c, -26, 0, 8, 6, '#1C1917');
  box(c, 22, -24, 20, 18, INK); box(c, 23, -23, 18, 16, '#F4F4F2'); box(c, 23, -23, 18, 3, '#FFFFFF'); box(c, 34, -15, 8, 7, '#F2A0B0'); box(c, 36, -13, 2, 2, '#7A3A44');
  box(c, 27, -19, 3, 3, INK); box(c, 22, -28, 4, 5, '#E8D8A8'); box(c, 36, -28, 4, 5, '#E8D8A8');
  box(c, -4, 13, 10, 5, '#F2A0B0');
  for (const lx of [-24, -10, 8, 20]) { box(c, lx - 1, 13, 7, 15, INK); box(c, lx, 13, 5, 13, '#E8E8E4'); box(c, lx, 24, 5, 3, '#2A2422'); }
  box(c, -34, -12, 4, 14, INK); box(c, -33, -10, 2, 12, '#C8C8C4');
  if (harness) { box(c, -12, -16, 4, 32, '#3A3A44'); box(c, 10, -16, 4, 32, '#3A3A44'); box(c, -2, -24, 4, 10, '#5A5A64'); }
};

const drawEffects = (c: Ctx, v: View, o: Dz, beat: number, k: number, f: number) => {
  const r = o.real, wreck = r.phase !== 'off';
  const on = (b: number) => !wreck && beat === b && k >= 0 && k < FX_LEN - 40;
  deep(c, v, EFX_D, () => {
    // (the heater: a grille box, its coils glowing on; burnt black once it's real)
    const hx = X(FX.heater), H = wreck ? CHAR : ramp6('#A8A29E');
    box(c, hx - 25, GY - 53, 50, 53, INK); box(c, hx - 24, GY - 52, 48, 50, H[3]); box(c, hx - 24, GY - 52, 48, 2, H[5]); box(c, hx - 24, GY - 52, 3, 50, H[4]); box(c, hx + 20, GY - 52, 4, 50, H[1]);
    for (let i = 0; i < 4; i++) { const lit = on(1); box(c, hx - 18, GY - 44 + i * 10, 36, 4, wreck ? CHAR[1] : lit ? (f % 10 < 5 ? FIRE[3] : FIRE[2]) : '#4A4440'); if (lit) box(c, hx - 18, GY - 44 + i * 10, 36, 1, FIRE[5]); }
    box(c, hx - 22, GY - 4, 44, 4, H[1]);
    tape(c, hx, GY - 58, 'VOLCANO', '#B91C1C');
    // (the red gel lamp on its tripod over it, its beam when it's on)
    const lx = hx + 36;
    for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(lx, GY - 40); c.lineTo(lx + s * 16, GY); c.stroke(); c.strokeStyle = TRUSS[3]; c.lineWidth = 1; c.stroke(); }
    tubeV(c, lx - 2, GY - 140, GY - 38, 3, TRUSS);
    box(c, lx - 13, GY - 158, 26, 20, INK); box(c, lx - 12, GY - 157, 24, 18, CASE[3]); box(c, lx - 12, GY - 157, 24, 2, CASE[5]);
    box(c, lx - 10, GY - 140, 20, 5, wreck ? CHAR[2] : on(1) ? '#EF4444' : '#5A1414'); box(c, lx - 10, GY - 140, 20, 1, wreck ? CHAR[3] : '#FCA5A5');
    if (on(1)) beam(c, lx, GY - 136, GY - 4, 60, '#EF4444', 0.12);
    // (the desk fan on its stool: gone once it's flown (the bracket left))
    const fx = X(FX.fan), W = ramp6('#78350F');
    box(c, fx - 19, GY - 46, 38, 7, INK); box(c, fx - 18, GY - 45, 36, 5, W[4]); box(c, fx - 18, GY - 45, 36, 1, W[5]);
    for (const s of [-1, 1]) { box(c, fx + s * 12 - 3, GY - 40, 6, 40, INK); box(c, fx + s * 12 - 2, GY - 40, 4, 40, W[3]); box(c, fx + s * 12 - 2, GY - 40, 1, 40, W[5]); }
    box(c, fx - 12, GY - 18, 24, 3, W[2]);
    tubeV(c, fx - 2, GY - 72, GY - 45, 4, SILVER);
    if (!wreck || (r.phase === 'on' && r.step < 4)) { c.save(); c.translate(fx, GY - 88); fanHead(c, on(2) ? f * 0.8 : 0.3); c.restore(); }
    else { box(c, fx - 5, GY - 76, 10, 5, INK); box(c, fx - 4, GY - 75, 8, 3, SILVER[2]); }
    tape(c, fx, GY - 116, 'TORNADO', '#334155');
    // (the AC unit on its stand, its vent; iced over once it's real, icicles off it)
    const ax = X(FX.ac), A = wreck ? ICE : ramp6('#D6D3D1');
    for (const s of [-1, 1]) tubeV(c, ax + s * 38 - 2, GY - 30, GY, 4, TRUSS);
    box(c, ax - 45, GY - 87, 90, 59, INK); box(c, ax - 44, GY - 86, 88, 57, A[3]); box(c, ax - 44, GY - 86, 88, 3, A[5]); box(c, ax - 44, GY - 86, 3, 57, A[4]); box(c, ax + 39, GY - 86, 5, 57, A[1]);
    for (let i = 0; i < 5; i++) { box(c, ax - 36, GY - 77 + i * 8, 64, 4, wreck ? ICE[2] : on(3) ? '#3B82F6' : '#5A5652'); box(c, ax - 36, GY - 77 + i * 8, 64, 1, wreck ? ICE[5] : on(3) ? '#BFDBFE' : '#8A8682'); }
    box(c, ax + 32, GY - 78, 6, 6, wreck ? ICE[1] : on(3) ? '#4ADE80' : '#14532D');
    if (wreck) for (let i = 0; i < 7; i++) { const ix = ax - 40 + i * 13, ih = 10 + (i % 3) * 7; poly(c, [[ix, GY - 30], [ix + 6, GY - 30], [ix + 3, GY - 30 + ih]], ICE[4]); box(c, ix + 1, GY - 30, 1, ih - 3, ICE[5]); }
    if (on(3)) for (let i = 0; i < 3; i++) pixelBlob(c, ax + (i - 1) * 24, GY - 22 + ((f + i * 20) % 30), 10, 4, 'rgba(219, 234, 254, 0.35)');
    tape(c, ax, GY - 94, 'BLIZZARD', '#1D4ED8');
    // (the squirt nozzle on its pipe: brass)
    const sx = X(FX.squirt);
    tubeV(c, sx - 3, GY - 70, GY, 6, ramp6('#57534E'));
    box(c, sx - 9, GY - 78, 18, 10, INK); box(c, sx - 8, GY - 77, 16, 8, GOLD[3]); box(c, sx - 8, GY - 77, 16, 2, GOLD[5]); box(c, sx + 6, GY - 76, 9, 5, INK); box(c, sx + 7, GY - 75, 7, 3, GOLD[2]);
    tape(c, sx, GY - 86, 'FLOOD', '#1D4ED8');
    // (the fog machine: a black box on the floor, its nozzle, its LED)
    const gx = X(FX.fog), G2 = wreck ? CHAR : CASE;
    box(c, gx - 31, GY - 31, 62, 31, INK); box(c, gx - 30, GY - 30, 60, 30, G2[3]); box(c, gx - 30, GY - 30, 60, 2, G2[5]); box(c, gx - 30, GY - 30, 2, 30, G2[4]); box(c, gx + 26, GY - 30, 4, 30, G2[1]);
    for (let i = 0; i < 4; i++) box(c, gx - 6 + i * 6, GY - 24, 3, 14, G2[1]);
    box(c, gx + 30, GY - 22, 12, 9, INK); box(c, gx + 31, GY - 21, 10, 7, SILVER[2]);
    box(c, gx - 22, GY - 24, 6, 4, on(5) && f % 12 < 8 ? '#EF4444' : '#450A0A');
    tape(c, gx, GY - 38, 'WILDFIRE', '#C2410C');
  });
  // (the squirt's drops: stepped, a lit dot)
  for (const d of o.show.squirt) if (d.t > 0) { box(c, d.x - 2, d.y - 2, 5, 5, WATER[2]); box(c, d.x - 1, d.y - 2, 2, 2, WATER[5]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: what he stands on (lit lips), the people, the cow, the booth

const leanRail = (c: Ctx, v: View, rx: number) => {
  const x = X(rx) - 60, y = Y(32), w = 120;
  topBack(c, v.eye, x, x + w, y, 1, 0.97, TRUSS, 1);
  still(c, 'leanrail', x, y, -2, -2, w + 4, 36, g => {
    const S = TRUSS;
    for (const px of [6, w / 2 - 3, w - 12]) { tubeV(g, px, 4, 32, 6, S); box(g, px - 4, 28, 14, 4, INK); box(g, px - 3, 29, 12, 3, S[2]); }
    tubeH(g, 0, w, 16, 3, S);
    box(g, -1, -1, w + 2, 8, INK); box(g, 0, 0, w, 6, '#3A2A22'); box(g, 0, 0, w, 2, '#5A4434'); box(g, 0, 5, w, 1, '#1E1410');
  });
  lip(c, x, y, w);
};
const fxCases = (c: Ctx, v: View) => {
  const x = X(2780), y = Y(90), w = 110;
  topBack(c, v.eye, x, x + w, y, 1, 0.95, CASE, 2);
  sideBack(c, v.eye, x + w, 1, y, GY, 1, 0.95, CASE, 2, false);
  still(c, 'fxcases', x, y, -4, -2, w + 8, 94, g => {
    const K = CASE, S = SILVER;
    const caseBox = (cx: number, cy: number, cw: number, ch: number, label: string) => {
      box(g, cx - 1, cy - 1, cw + 2, ch + 2, INK);
      box(g, cx, cy, cw, ch, K[3]); box(g, cx, cy, cw, 2, K[5]); box(g, cx, cy, 2, ch, K[4]); box(g, cx + cw - 3, cy, 3, ch, K[1]);
      for (const ex of [cx, cx + cw - 6]) for (const ey of [cy, cy + ch - 6]) { box(g, ex, ey, 6, 6, S[3]); box(g, ex, ey, 2, 2, S[5]); }
      box(g, cx, cy + ch * 0.5, cw, 2, S[2]); box(g, cx, cy + ch * 0.5, cw, 1, S[4]);
      box(g, cx + cw / 2 - 6, cy + ch * 0.5 - 3, 12, 6, S[1]); box(g, cx + cw / 2 - 5, cy + ch * 0.5 - 2, 10, 1, S[4]);
      words(g, label, cx + cw / 2, cy + ch * 0.5 - 6, stencil('#E8E4DA'));
    };
    caseBox(2, 46, 106, 44, 'FX DEPT');
    caseBox(0, 0, 110, 46, 'FRAGILE');
  });
  // (on top: a fog juice jug, a roll of tape; dressing under his feet)
  box(c, x + 14, y - 13, 12, 13, INK); box(c, x + 15, y - 12, 10, 12, '#E8E8F0'); box(c, x + 15, y - 8, 10, 4, '#2563EB'); box(c, x + 18, y - 16, 4, 4, INK);
  c.fillStyle = INK; c.beginPath(); c.arc(x + 84, y - 5, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3A3A44'; c.beginPath(); c.arc(x + 84, y - 5, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(x + 84, y - 5, 2, 0, Math.PI * 2); c.fill();
  lip(c, x, y, w);
};
/** A truss section hung on chain hoists (a ledge: lit). */
const hungTruss = (c: Ctx, v: View, rx: number, h: number, w: number) => {
  const x = X(rx), y = Y(h), ceil = Y(THEATER.ceil);
  for (const cx of [x + 14, x + w - 14]) {
    chain(c, cx, ceil, y - 22);
    box(c, cx - 8, y - 24, 16, 14, INK); box(c, cx - 7, y - 23, 14, 12, '#B8860B'); box(c, cx - 7, y - 23, 14, 2, '#E8C25A'); box(c, cx - 7, y - 13, 14, 2, '#6A4410');
    chain(c, cx, y - 10, y);
  }
  topBack(c, v.eye, x, x + w, y, 1, 0.97, TRUSS, 1);
  truss(c, x, x + w, y, 16, TRUSS, 13);
  lip(c, x, y, w);
};
/** A catwalk (a ledge: lit): grating deck going back, its kick plate, the hanging rods up, its handrail (dim). */
const catwalk = (c: Ctx, v: View, rx: number, h: number, w: number, real: boolean) => {
  const x = X(rx), y = Y(h), ceil = Y(THEATER.ceil), S = TRUSS;
  const [sa, sb] = [Math.max(x, v.v0 - 20), Math.min(x + w, v.v1 + 20)];
  if (sb <= sa) return;
  for (let k = x + 10; k < x + w; k += 130) if (k > v.v0 - 20 && k < v.v1 + 20) tubeV(c, k, ceil, y - 34, 2, S.map(cc => mix(cc, '#000000', 0.35)));
  // (the deck seen from over it: grating going back)
  if (v.eye.y < y - 1) { levelQ(c, v.eye, sa, sb, y, 1, 0.95, S[1]); c.strokeStyle = S[0]; c.lineWidth = 1; c.beginPath(); for (let k = Math.ceil(sa / 8) * 8; k < sb; k += 8) { const [p, q] = at(v.eye, k, y, 1), [r2, s2] = at(v.eye, k, y, 0.95); c.moveTo(p, q); c.lineTo(r2, s2); } c.stroke(); }
  // (the handrail: dim, thin, no lip: not his)
  dimRail(c, sa, sb, y - 34, S[1]);
  for (let k = Math.ceil(x / 40) * 40; k < x + w; k += 40) if (k >= sa && k <= sb) box(c, k, y - 34, 1, 34, S[1]);
  dimRail(c, sa, sb, y - 17, S[0]);
  // (the deck's edge: the kick plate, its bolts; under it the stringer)
  box(c, sa, y - 1, sb - sa, 15, INK); box(c, sa, y, sb - sa, 13, S[2]); box(c, sa, y + 10, sb - sa, 3, S[0]);
  for (let k = Math.ceil(sa / 24) * 24; k < sb; k += 24) { box(c, k, y + 5, 2, 2, S[0]); box(c, k, y + 5, 1, 1, S[4]); }
  lip(c, sa, y, sb - sa);
  if (real) for (let k = Math.ceil(sa / 26) * 26; k < sb; k += 26) { const ih = 6 + ((k * 7) % 12); poly(c, [[k, y + 14], [k + 5, y + 14], [k + 2, y + 14 + ih]], ICE[4]); box(c, k + 1, y + 14, 1, ih - 2, ICE[5]); }
};

const drawBooth = (c: Ctx, o: Dz, f: number) => {
  const r = o.real, by = Y(CAT_R.h), squashed = r.squashed;
  const cx0 = X(BOOTH.cab), cw = X(BOOTH.b) - cx0;
  still(c, `booth-${squashed ? 1 : 0}`, cx0, by, -10, -156, cw + 20, 158, g => {
    const W = ramp6('#57534E'), R = ramp6('#7C2D12');
    box(g, -1, -141, cw + 2, 141, INK);
    box(g, 0, -140, cw, 140, W[3]); box(g, 0, -140, 4, 140, W[4]); box(g, cw - 6, -140, 6, 140, W[1]);
    for (let y = -130; y < 0; y += 10) box(g, 0, y, cw, 1, W[2]);
    box(g, -8, -153, cw + 16, 16, INK); box(g, -7, -152, cw + 14, 14, R[3]); box(g, -7, -152, cw + 14, 2, R[5]); box(g, -7, -140, cw + 14, 2, R[1]);
    words(g, 'EFFECTS CONTROL', cw / 2, -142, showLook(1, 1, '#FDE68A', '#1C0A06'));
    // (the window: its frame, the tinted glass (or gone), the desk and its console)
    box(g, 12, -122, cw - 24, 68, INK); box(g, 14, -120, cw - 28, 64, squashed ? '#120E0C' : '#0C2A3E');
    if (!squashed) { bandedGradient(g, 14, -120, cw - 28, 64, ['#0C2A3E', '#123A52', '#0C2A3E'], 4); poly(g, [[20, -120], [44, -120], [14, -96], [14, -110]], 'rgba(186, 230, 253, 0.25)'); }
    else for (let i = 0; i < 6; i++) poly(g, [[14 + i * 46, -120], [30 + i * 46, -120], [22 + i * 46, -104]], 'rgba(224, 242, 254, 0.5)');
    box(g, 14, -56, cw - 28, 16, INK); box(g, 15, -55, cw - 30, 14, CASE[3]); box(g, 15, -55, cw - 30, 2, CASE[5]);
    box(g, 10, -4, cw - 20, 4, W[1]);
  });
  // (the console's lights: idle, or panicking)
  const panic = r.phase === 'on' && r.step >= 2;
  for (let k = 0; k < 8; k++) box(c, cx0 + 24 + k * 34, by - 52, 6, 5, squashed ? '#1C1917' : panic ? (f % 8 < 4 ? '#EF4444' : '#300') : (k + Math.floor(f / 24)) % 3 ? '#4ADE80' : '#FDE047');
  if (!squashed) {
    // (the sleeper: slumped over the desk, the eye mask on, earplugs in, a Zzz going up)
    c.save(); c.translate(cx0 + 110, by - 40); c.scale(0.9, 0.9);
    drawPerson(c, { seed: 5113, outfit: 'operator', f: 0, pose: 'sit', mood: 'bored', talking: !!o.sleeper });
    box(c, -9, -83, 22, 8, INK); box(c, -8, -82, 20, 6, '#DB2777'); box(c, -8, -82, 20, 1, '#F472B6');
    c.restore();
    for (let k = 0; k < 3; k++) { const t = ((f + k * 30) % 90) / 90; words(c, 'Z', cx0 + 130 + t * 20 + k * 4, by - 96 - t * 40, { sx: 1 + (k % 2), sy: 1 + (k % 2), fill: `rgba(255,255,255,${(1 - t).toFixed(2)})` }); }
  }
  // (the truss, coming down on it; down on it: his legs out from under, the blood)
  if (r.truss > 0) {
    const ty = by - 300 + 230 * r.truss;
    c.save(); c.translate(cx0 + cw / 2, ty); c.rotate(-0.12 * r.truss);
    truss(c, -170, 170, -12, 24, TRUSS, 14);
    for (let x = -150; x < 160; x += 60) { box(c, x - 1, 11, 18, 20, INK); box(c, x, 12, 16, 18, CASE[3]); box(c, x, 12, 4, 18, CASE[5]); box(c, x + 3, 28, 10, 4, '#7F1D1D'); }
    c.restore();
  }
  if (squashed) {
    // (the desk flat; his legs out the side, one shoe off; the pool, stepped)
    for (let i = 0; i < 3; i++) box(c, cx0 + 56 + i * 8, by - 4 + i, 140 - i * 30, 4 - i, ['#5A0A0A', '#7F1D1D', '#991B1B'][i]);
    box(c, cx0 + 120, by - 6, 30, 3, '#B91C1C'); box(c, cx0 + 124, by - 6, 8, 1, '#F87171');
    box(c, cx0 + 29, by - 19, 58, 12, INK); box(c, cx0 + 30, by - 18, 56, 10, '#3A4A6A'); box(c, cx0 + 30, by - 18, 56, 2, '#5A6A8A');
    box(c, cx0 + 39, by - 9, 52, 10, INK); box(c, cx0 + 40, by - 8, 50, 8, '#3A4A6A');
    box(c, cx0 + 19, by - 21, 14, 14, INK); box(c, cx0 + 20, by - 20, 12, 12, '#1C1917'); box(c, cx0 + 35, by - 11, 10, 11, INK); box(c, cx0 + 36, by - 10, 8, 10, '#E7B48F');
    still(c, 'backin5', cx0 + 110, by - 150, -64, -14, 128, 28, g => board(g, 0, 0, ['BACK IN 5'], showLook(1, 1, '#18181B', '#FEF3C7'), '#FEF3C7', GOLD, 5));
  }
  // The lever: the balcony's plate (SIMULATED / REAL (EXPERIMENTAL)) up on its post over his head, the handle thrown one
  // way or the other (mid-throw, where he's hauled it: ../lever.ts)
  const lv = REAL_LEVER, lx = lv.x, ang = throwAngle(lv, o.pull, o.real.phase !== 'off'), on = ang > 0, pt = by - 160;
  tubeV(c, lx - 2, pt + 50, by, 4, TRUSS);
  still(c, `leverplate-${on ? 1 : 0}`, lx, pt, -64, -4, 128, 58, g => {
    const P = ramp6('#E7E5E4');
    box(g, -62, -2, 124, 54, INK);
    box(g, -60, 0, 120, 50, P[3]); box(g, -60, 0, 120, 2, P[5]); box(g, -60, 0, 2, 50, P[4]); box(g, 56, 0, 4, 50, P[1]); box(g, -60, 46, 120, 4, P[1]);
    box(g, -60, 0, 120, 18, '#B91C1C'); box(g, -60, 0, 120, 2, '#EF4444'); box(g, -60, 16, 120, 2, '#7F1D1D');
    words(g, 'REAL DISASTERS', 0, 13, showLook(1, 1, '#FEF3C7', '#450A0A'));
    words(g, 'SIMULATED', -30, 30, plain(1, 1, !on ? '#15803D' : '#A8A29E'));
    words(g, 'REAL', 34, 30, plain(1, 1, on ? '#DC2626' : '#A8A29E'));
    words(g, '(EXPERIMENTAL)', 0, 43, plain(1, 1, '#57534E'));
    for (const sx2 of [-56, 52]) { box(g, sx2, 22, 3, 3, P[1]); box(g, sx2, 22, 1, 1, '#FFFFFF'); }
  });
  box(c, lx - 17, by - 15, 34, 15, INK); box(c, lx - 16, by - 14, 32, 14, CASE[3]); box(c, lx - 16, by - 14, 32, 2, CASE[5]);
  c.save(); c.translate(lx, lv.y); c.rotate(ang);
  box(c, -3, -lv.len + 2, 6, lv.len - 2, INK); box(c, -2, -lv.len + 3, 4, lv.len - 4, SILVER[3]); box(c, -2, -lv.len + 3, 1, lv.len - 4, SILVER[5]);
  c.fillStyle = INK; c.beginPath(); c.arc(0, -lv.len, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#B91C1C'; c.beginPath(); c.arc(0, -lv.len, 6, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F87171'; c.beginPath(); c.arc(-2, -lv.len - 2, 2, 0, Math.PI * 2); c.fill();
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The wreck (live: it spreads in the cutscene)

const wreckWall = (c: Ctx, v: View, o: Dz) => {
  const r = o.real, ceil = Y(THEATER.ceil);
  deep(c, v, WALL_D, () => {
    if (r.crack > 0) {
      const n = Math.floor(r.crack * 9);
      for (const [lw, col] of [[4, INK], [1, BLACKS[5]]] as const) {
        c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
        for (let i = 0; i < n; i++) { const x = X(THEATER.a + 150 + i * 280) + (lw < 2 ? 1 : 0); c.moveTo(x, ceil + 40); c.lineTo(x + 40, ceil + 160); c.lineTo(x + 10, ceil + 260); c.lineTo(x + 60, ceil + 400); c.lineTo(x + 30, GY - 20); c.moveTo(x + 10, ceil + 260); c.lineTo(x - 20, ceil + 300); }
        c.stroke();
      }
    }
    if (r.fire > 0) {
      // (scorch up the wall over the heater, in stepped rings)
      const hx = X(FX.heater), k = Math.min(1, r.fire * 1.4);
      for (let i = 0; i < 4; i++) pixelBlob(c, hx, GY - 120 - i * 30, (90 - i * 14) * k, (140 - i * 20) * k, `rgba(10, 8, 7, ${(0.3 + i * 0.12).toFixed(2)})`);
    }
    if (r.frost > 0) {
      // (frost blooming across it off the AC: stepped blobs, crystals)
      for (let i = 0; i < 6; i++) {
        const fx = X(4400 + i * 150), fy = ceil + 120 + (i % 3) * 140;
        pixelBlob(c, fx, fy, 120 * r.frost, 90 * r.frost, 'rgba(174, 208, 230, 0.22)');
        pixelBlob(c, fx, fy, 70 * r.frost, 50 * r.frost, 'rgba(212, 234, 246, 0.25)');
        for (let j = 0; j < 5; j++) { const a = j * 1.26 + i; box(c, fx + Math.cos(a) * 60 * r.frost, fy + Math.sin(a) * 40 * r.frost, 3, 1, ICE[5]); box(c, fx + Math.cos(a) * 60 * r.frost + 1, fy + Math.sin(a) * 40 * r.frost - 1, 1, 3, ICE[5]); }
      }
    }
  });
};
const wreckFloor = (c: Ctx, v: View, o: Dz, f: number) => {
  const r = o.real;
  if (r.flood > 0) {
    // (the water out of the screen, across the floor going back: banded, the light on it rippling)
    const a = X(SCREEN.a - 200), b = a + (SCREEN.b - SCREEN.a + 400) * r.flood;
    for (let i = 0; i < 4; i++) levelQ(c, v.eye, a, b, GY - 1, 1 - ((1 - WALL_D) * i) / 4, 1 - ((1 - WALL_D) * (i + 1)) / 4, `rgba(46, 106, 178, ${(0.5 - i * 0.08).toFixed(2)})`);
    for (let i = 0; i < 6; i++) { const d = 0.99 - i * 0.025, [p, q] = at(v.eye, a + ((i * 173 + f * 0.7) % Math.max(1, b - a - 60)), GY, d); box(c, p, q - 1, 30 * d, 1, 'rgba(166, 206, 242, 0.6)'); }
  }
  if (r.fire > 0.5) {
    // (the heater's patch of floor, burnt black around it)
    const hx = X(FX.heater);
    levelQ(c, v.eye, hx - 80, hx + 80, GY, 1, 0.93, 'rgba(10, 8, 7, 0.6)');
  }
};

export const drawTheater = (c: Ctx, v: View, state: GameState, o: Dz, beat: number, k: number, real: boolean) => {
  const f = state.frame, r = o.real;
  wreckWall(c, v, o);
  grid(c, v, real);
  if (seenD(v, X(SCREEN.a) - 120, X(SCREEN.b) + 120, SCREEN_D)) drawScreen(c, v, o, beat, k, real, f);
  wreckFloor(c, v, o, f);
  // (the front-of-house truss along the ceiling's edge: dim, set back, its pars (red once it's real))
  deep(c, v, 0.985, () => {
    const [a, b] = spanAt(v, 0.985, 40), lo = Math.max(a, X(THEATER.a)), hi = Math.min(b, X(FAR_WALL));
    if (hi > lo) {
      const T = TRUSS.map(cc => mix(cc, '#060508', 0.45)), y = Y(THEATER.ceil) + 18;
      truss(c, lo, hi, y, 12, T, 16);
      for (let x = Math.ceil((lo - X(THEATER.a)) / 220) * 220 + X(THEATER.a) + 100; x < hi; x += 220) { box(c, x - 9, y + 12, 18, 20, INK); box(c, x - 8, y + 13, 16, 18, CASE[2]); box(c, x - 8, y + 13, 4, 18, CASE[4]); box(c, x - 6, y + 30, 12, 3, real ? '#7F1D1D' : '#FDE68A'); }
    }
  });
  if (seenD(v, X(FX.heater) - 80, X(FX.fog) + 80, EFX_D)) drawEffects(c, v, o, beat, k, f);
  // The sign: PLEASE STAND. HOLD THE RAIL.
  if (seenD(v, X(3170) - 80, X(3170) + 80, EFX_D)) deep(c, v, EFX_D, () => still(c, 'standsign', X(3170), GY, -70, -120, 140, 122, g => standBoard(g, 0, 0, ['PLEASE STAND.', 'HOLD THE RAIL.'], showLook(1, 1, '#FDE68A', '#000000'), '#18181B')));
  // The guests standing about watching (scenery: behind him), down once it's real (gone after)
  if (!real || r.phase === 'on') for (const [rx, seed] of WATCHERS) {
    if (X(rx) < v.v0 - 60 || X(rx) > v.v1 + 60) continue;
    const down = r.phase === 'on' && r.step >= 2;
    c.save(); c.translate(X(rx), GY - 4);
    if (down) { c.rotate(seed % 2 ? 1.45 : -1.45); c.translate(0, -12); }
    c.scale(seed % 2 ? 0.86 : -0.86, 0.86);
    const wob = !down && beat === 0 && k >= 0 && k < 150 ? Math.sin(f * 0.6) * 0.04 : 0; c.rotate(wob);
    drawPerson(c, { seed, outfit: 'guest', f, pose: down ? 'stand' : seed % 5 === 0 ? 'point' : 'stand', mood: down ? 'scared' : seed % 3 ? 'bored' : 'happy', shorts: seed % 3 === 0 });
    c.restore();
  }
  // (one left once it's over: singed black, clapping, slowly; smoke off him)
  if (real && r.phase === 'done' && seenD(v, X(2960), X(3060))) {
    c.save(); c.translate(X(3010), GY - 4); c.scale(0.86, 0.86);
    drawPerson(c, { seed: 1217, outfit: 'guest', f, pose: f % 60 < 30 ? 'cheer' : 'stand', mood: 'happy' });
    c.restore();
    checker(c, X(3010) - 18, GY - 70, 36, 66, 'rgba(12, 10, 9, 0.7)', 0, 1); c.fillStyle = 'rgba(12, 10, 9, 0.35)'; c.fillRect(X(3010) - 18, GY - 70, 36, 66);
    for (let i = 0; i < 3; i++) { const t = ((f + i * 25) % 75) / 75; pixelBlob(c, X(3010) + Math.sin(t * 4 + i) * 6, GY - 76 - t * 40, 4 + t * 6, 3 + t * 4, `rgba(80, 74, 70, ${(0.5 * (1 - t)).toFixed(2)})`); }
  }
  // What he stands on: the lean rails, the cases, the hung truss, the catwalks (lit lips)
  for (const rx of LEAN_RAILS) if (seenD(v, X(rx) - 70, X(rx) + 70)) leanRail(c, v, rx);
  if (seenD(v, X(2770), X(2900))) fxCases(c, v);
  for (const [rx, h, w, what] of LEDGES) {
    if (what === 'gantry' || !seenD(v, X(rx) - 20, X(rx) + w + 20)) continue;
    if (what === 'truss') hungTruss(c, v, rx, h, w);
    else catwalk(c, v, rx, h, w, r.frost > 0);
  }
  // The cow (the tornado scene's), on its chain (gone flying once it's real); its wire's sign
  const cowHere = !real || (r.phase === 'on' && r.step < 4);
  if (seenD(v, X(COW_AT.x) - 60, X(COW_AT.x) + 60)) {
    chain(c, X(COW_AT.x), Y(THEATER.ceil), Y(COW_AT.h) + (cowHere ? 26 : 30));
    if (cowHere) {
      const cx = X(COW_AT.x) + Math.sin(f * 0.03) * 4, cy = Y(COW_AT.h) + 50;
      c.save(); c.translate(cx, cy); cowProp(c, true); c.restore();
      still(c, 'cowtag', X(COW_AT.x), cy - 40, -40, -10, 80, 14, g => tape(g, 0, 2, 'TORNADO COW', '#7C2D12'));
    } else { box(c, X(COW_AT.x) - 6, Y(COW_AT.h) + 28, 12, 6, INK); box(c, X(COW_AT.x) - 5, Y(COW_AT.h) + 29, 10, 4, '#3A3A44'); }
  }
  if (seenD(v, X(CAT_L.b - 80), X(CAT_L.b + 20))) still(c, 'cowrig', X(CAT_L.b - 30), Y(565) - 14, -36, -10, 72, 14, g => tape(g, 0, 2, 'COW RIG', '#7C2D12'));
  if (seenD(v, X(BOOTH.lever) - 80, X(BOOTH.b) + 20)) drawBooth(c, o, f);
};

// ---------------------------------------------------------------------------------------------------------------
// The far wall, and outside

const OUT_D = 0.74;
/** Outside, far (drawn before the building): the funnel off across the lot, the lot going back from the hole (cracked,
 *  ash over it), a false front burning at the back of it. */
export const drawOutsideFar = (c: Ctx, v: View, f: number) => {
  const wx = X(FAR_WALL), end = X(6600);
  if (!seenD(v, wx, end, OUT_D)) return;
  // (the funnel, far off across the backlot: stepped rings, lit up its left by the fires, debris going round)
  deep(c, v, 0.36, () => {
    const tx = X(6300) + Math.sin(f * 0.01) * 120, foot = GY;
    for (let i = 0; i < 16; i++) {
      const t = i / 15, cy = foot - 40 - i * 44, rw = 18 + t * t * 150, wob = Math.sin(f * 0.08 + i * 0.7) * (6 + t * 14);
      c.fillStyle = '#2A1C1A'; c.beginPath(); c.ellipse(tx + wob, cy, rw + 3, 18, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = i % 2 ? '#4A3430' : '#5A403A'; c.beginPath(); c.ellipse(tx + wob, cy, rw, 15, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8A5A44'; c.beginPath(); c.ellipse(tx + wob - rw * 0.45, cy - 3, rw * 0.35, 7, 0, 0, Math.PI * 2); c.fill();
    }
    for (let i = 0; i < 6; i++) pixelBlob(c, tx + Math.sin(f * 0.05 + i) * 80, foot - 20 - i * 6, 60, 18, 'rgba(90, 64, 54, 0.7)');
    for (let i = 0; i < 10; i++) { const a = f * 0.06 + i * 0.63, rr = 60 + (i % 4) * 40; box(c, tx + Math.cos(a) * rr, foot - 120 - i * 50 + Math.sin(a) * 14, 10, 4, i % 2 ? '#3A2A22' : '#6A4A32'); }
  });
  // (the lot going back from the hole: banded asphalt, its stall lines going back at the eye, cracks, ash)
  const A = ASPHALT.map(cc => mix(cc, '#4A1A10', 0.18)), n = 6;
  for (let i = 0; i < n; i++) levelQ(c, v.eye, wx, end, GY, 1 - ((1 - OUT_D) * i) / n, 1 - ((1 - OUT_D) * (i + 1)) / n, A[Math.max(1, 5 - i)]);
  c.strokeStyle = '#8A7A6A'; c.lineWidth = 1; c.beginPath();
  for (let x = Math.ceil(wx / 140) * 140; x < end; x += 140) { const [p, q] = at(v.eye, x, GY, 0.96), [r2, s2] = at(v.eye, x, GY, 0.84); c.moveTo(p, q); c.lineTo(r2, s2); }
  c.stroke();
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
  for (let x = wx + 120; x < end; x += 230) { const p = at(v.eye, x, GY, 0.99), q = at(v.eye, x + 40, GY, 0.9), s = at(v.eye, x + 10, GY, 0.8); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.lineTo(s[0], s[1]); }
  c.stroke();
  // (its back edge: a curb and a chain-link fence, sagging)
  const [p0, q0] = at(v.eye, wx, GY, OUT_D), [p1] = at(v.eye, end, GY, OUT_D);
  box(c, p0, q0 - 2, p1 - p0, 3, '#7A6A60');
  deep(c, v, OUT_D, () => {
    const [a, b] = [Math.max(wx, spanAt(v, OUT_D)[0]), Math.min(end, spanAt(v, OUT_D)[1])];
    for (let x = Math.ceil(a / 90) * 90; x < b; x += 90) { box(c, x - 1, GY - 70, 4, 70, INK); box(c, x, GY - 70, 2, 70, '#7A7A84'); }
    checker(c, a, GY - 64, b - a, 60, 'rgba(120, 120, 132, 0.4)', 0, 2);
    box(c, a, GY - 70, b - a, 2, '#5A5A64');
  });
  // (a false front at the back of the lot, burning: board-and-batten, its sign, the fire up it in stepped tongues)
  deep(c, v, 0.8, () => {
    const fx = X(5950);
    still(c, 'burnfront', fx, GY, -90, -262, 180, 264, g => {
      const B = ramp6('#5A4030').map(cc => mix(cc, '#140806', 0.3));
      box(g, -82, -260, 164, 260, INK);
      for (let k = -80; k < 80; k += 12) { box(g, k, -258, 12, 258, B[2 + (Math.abs(k / 12) % 2)]); box(g, k + 9, -258, 3, 258, B[1]); }
      box(g, -82, -260, 164, 12, B[0]);
      board(g, 0, -214, ['HOTEL'], showLook(2, 2, '#E8C25A', '#1C0A06'), '#3A1A10', GOLD, 5);
      for (const wx2 of [-56, 26]) { box(g, wx2, -170, 32, 40, INK); box(g, wx2 + 2, -168, 28, 36, '#2A0806'); }
      box(g, -20, -90, 40, 90, INK); box(g, -18, -88, 36, 88, '#1C0806');
      checker(g, -82, -260, 164, 120, 'rgba(10, 4, 2, 0.5)', 0, 2);
      // (the 2x4s behind it, showing past its ends)
      for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(s * 70, -200); g.lineTo(s * 92, 0); g.stroke(); g.strokeStyle = B[3]; g.lineWidth = 4; g.stroke(); }
    });
    for (let i = 0; i < 6; i++) {
      const bx = fx - 70 + i * 28, h = 50 + ((f * 3 + i * 17) % 40);
      for (const [k2, col] of [[1, FIRE[2]], [0.7, FIRE[3]], [0.4, FIRE[5]]] as const) { c.fillStyle = col; c.beginPath(); c.moveTo(bx - 16 * k2, GY - 262); c.quadraticCurveTo(bx + Math.sin(f * 0.2 + i) * 8, GY - 262 - h * k2, bx + 16 * k2, GY - 262); c.closePath(); c.fill(); }
    }
    for (let i = 0; i < 8; i++) { const t = ((f * 0.6 + i * 30) % 240) / 240; pixelBlob(c, fx - 40 + i * 12 + t * 80, GY - 290 - t * 300, 16 + t * 40, 10 + t * 24, `rgba(40, 24, 22, ${(0.6 * (1 - t)).toFixed(2)})`); }
  });
};

/** The far wall: up (its inside face going back, its cut end at the play plane: block, solid); going over outward about
 *  its foot (the cutscene); out flat on the lot after, broken in three, the rubble at the hole, the sign stuck in it. */
export const drawFarWall = (c: Ctx, v: View, o: Dz, real: boolean) => {
  const r = o.real, wx = X(FAR_WALL), H = THEATER.ceil;
  if (!seenD(v, wx - 700, X(6400), WALL_D) && !seenD(v, wx - 100, wx + 900)) return;
  const fall = r.phase === 'done' || (real && r.phase !== 'on') ? 1 : r.wall;
  const ang = (Math.PI / 2) * fall * fall, cs = Math.cos(ang), sn = Math.sin(ang);
  const P = (u: number, h: number, d: number) => at(v.eye, wx + 40 + (u - 40) * cs + h * sn, GY + (u - 40) * sn - h * cs, d);
  if (fall < 1) {
    // (its inside face going back: black acoustic panels, banded; cracks once it's quaking)
    if (v.eye.x < wx + 40 * (1 - cs) + H * sn || fall > 0) {
      const bands: [number, number, string][] = [[0, 12, BLACKS[0]], [12, 120, BLACKS[2]], [120, 360, BLACKS[3]], [360, 560, BLACKS[2]], [560, H, BLACKS[1]]];
      for (const [h0, h1, col] of bands) poly(c, [P(0, h0, 1), P(0, h1, 1), P(0, h1, WALL_D), P(0, h0, WALL_D)], col);
      c.strokeStyle = BLACKS[1]; c.lineWidth = 1; c.beginPath();
      for (let kk = 1; kk < 6; kk++) { const d = 1 - ((1 - WALL_D) * kk) / 6, [p, q] = P(0, 12, d), [p2, q2] = P(0, H, d); c.moveTo(p, q); c.lineTo(p2, q2); }
      for (const h of [120, 240, 360, 480]) { const [p, q] = P(0, h, 1), [p2, q2] = P(0, h, WALL_D); c.moveTo(p, q); c.lineTo(p2, q2); }
      c.stroke();
    }
    // (its cut end, at the play plane: poured concrete block, coursed, lit down its left; solid)
    const corners = [P(0, 0, 1), P(40, 0, 1), P(40, H, 1), P(0, H, 1)];
    poly(c, [[corners[0][0] - 1, corners[0][1]], [corners[1][0] + 1, corners[1][1]], [corners[2][0] + 1, corners[2][1]], [corners[3][0] - 1, corners[3][1]]], INK);
    poly(c, corners, SHELL[3]);
    poly(c, [P(0, 0, 1), P(6, 0, 1), P(6, H, 1), P(0, H, 1)], SHELL[5]);
    poly(c, [P(32, 0, 1), P(40, 0, 1), P(40, H, 1), P(32, H, 1)], SHELL[1]);
    c.strokeStyle = SHELL[2]; c.lineWidth = 1; c.beginPath();
    for (let h = 16; h < H; h += 16) { const [p, q] = P(6, h, 1), [p2, q2] = P(32, h, 1); c.moveTo(p, q); c.lineTo(p2, q2); }
    c.stroke();
    if (r.crack > 0.3) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); const a1 = P(20, H, 1), a2 = P(10, H * 0.6, 1), a3 = P(30, H * 0.3, 1), a4 = P(16, 0, 1); c.moveTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.lineTo(a3[0], a3[1]); c.lineTo(a4[0], a4[1]); c.stroke(); }
    return;
  }
  // Out flat on the lot: its inside face up, broken in three, going back (the near edge crushed under rubble)
  const W = H / 3;
  for (let i = 0; i < 3; i++) {
    const a = wx + 40 + i * W + 4, b = a + W - 10, tilt = (i - 1) * 0.004;
    for (let j = 0; j < 4; j++) levelQ(c, v.eye, a, b, GY - 3 + j * tilt * 100, 0.975 - ((0.975 - WALL_D) * j) / 4, 0.975 - ((0.975 - WALL_D) * (j + 1)) / 4, [BLACKS[3], BLACKS[2], BLACKS[2], BLACKS[1]][j]);
    // (its panels' seams, lying going back; its far edge, inked)
    c.strokeStyle = BLACKS[1]; c.lineWidth = 1; c.beginPath();
    for (let x = a + 40; x < b; x += 96) { const [p, q] = at(v.eye, x, GY - 3, 0.975), [p2, q2] = at(v.eye, x, GY - 3, WALL_D); c.moveTo(p, q); c.lineTo(p2, q2); }
    c.stroke();
    const [p, q] = at(v.eye, a, GY - 3, WALL_D), [p2] = at(v.eye, b, GY - 3, WALL_D);
    box(c, p, q - 1, p2 - p, 2, INK);
  }
  // (the rubble along the hole and over the wall's near edge: chunks of block in steps)
  for (let i = 0; i < 26; i++) {
    const rx = wx - 30 + ((i * 53) % 700), w = 10 + (i % 4) * 5, h = 6 + (i % 3) * 3;
    if (rx < v.v0 - 20 || rx > v.v1 + 20) continue;
    box(c, rx - 1, GY - h - 1, w + 2, h + 1, INK); box(c, rx, GY - h, w, h, i % 3 ? SHELL[3] : BLACKS[3]); box(c, rx, GY - h, w, 1, i % 3 ? SHELL[5] : BLACKS[5]); box(c, rx + w - 2, GY - h, 2, h, SHELL[1]);
  }
  // (a sign stuck in the rubble: this way; held up on its post)
  const sx = X(5600);
  if (sx > v.v0 - 100 && sx < v.v1 + 100) {
    c.save(); c.translate(sx, GY); c.rotate(-0.12);
    tubeV(c, -3, -112, 0, 5, ramp6('#57534E'));
    still(c, 'rideexit', 0, -128, -82, -26, 164, 52, g => board(g, 0, 0, ['RIDE EXIT', 'EVERYTHING >>'], showLook(1, 2, '#18181B', '#D6D3D1'), '#FEF3C7', GOLD, 6));
    c.restore();
  }
};

/** The outside's near asphalt under the play plane (flat; bent with the rest). */
export const paintAsphalt = (g: Ctx, x: number, w: number) => {
  const A = ASPHALT.map(cc => mix(cc, '#4A1A10', 0.18));
  bandedGradient(g, x, GY, w, 260, [A[4], A[3], A[3], A[2]], 6);
  box(g, x, GY, w, 2, A[5]);
  for (let k = Math.ceil(x / 23) * 23; k < x + w; k += 23) { const h = hash(k * 0.31); if (h > 0.7) box(g, k, GY + 8 + h * 200, 3 + h * 6, 1, A[5]); else if (h < 0.15) box(g, k, GY + 20 + h * 900, 2, 2, '#9A928A'); }
  for (let k = Math.ceil(x / 300) * 300; k < x + w; k += 300) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(k, GY + 4); g.lineTo(k + 30, GY + 40); g.lineTo(k + 14, GY + 90); g.stroke(); }
};

void sideQ; void lip; void SCREEN; void hash;
