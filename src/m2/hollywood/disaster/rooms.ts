// Disaster: The Ride, the rooms (the final pass: peak SNES, fake 3D on the boulevard's one eye: paint.ts). Each room a
// box cut open along the play plane: its back wall at WALL_D (painted once a chunk at a time and put down at its depth),
// its floor going back to it in bands (the pattern in it going back too), its ceiling's underside, the side walls
// between the rooms going back (straight), and over the ceiling the building's guts in section (the plenum: ducts, the
// sprinkler main, bar joists, the roof deck), dark on up. Under the play plane the floor comes toward us, bent.
//
// The lobby: maroon flock over gold-railed wainscot, deco fan sconces, the doors out to the backlot (the lot through
// their glass by the hour), DISASTER: THE RIDE in bulbs hung over it, the franchise's one-sheets in their cases, the
// queue's brass posts and velvet, the monitors' truss, LAVA NACHOS and its menu board, Steve's standee, the PA's horns;
// cracked once it's real. The pre-show: indigo, star-flecked fabric panels, CHIP CHADWICK on the big TV, the rules
// board, the theater's doors.

import type { GameState } from '../../../m1/game/core/state';
import { bendFloor } from '../../intro/art/kit';
import { drawPerson } from '../../adventure/temple/people';
import { box, checker, mix, hash, poly, at, bandedGradient, steppedGlow, ramp6, board, plain, words, timeOfDay, skyAt, hourMix, glassOf, STEVE } from '../blvd/kit';
import { steveCard, paintStandee, velvetRopePaint } from '../blvd/props';
import {
  X, Y, GY, LOBBY, PRESHOW, THEATER, FAR_WALL, DOOR_HALF, QUEUE_RAILS, RAIL_H, LEDGES, HORNS, PRESHOW_WATCHERS,
} from './layout';
import type { Dz } from './state';
import {
  type Ctx, type View, INK, WALL_D, NEAR_D, seenD, spanAt, levelQ, sideQ, MAROON, CARPET, INDIGO, TRUSS, GOLD, CASE, SHELL,
  lip, tubeH, tubeV, truss, chain, hungBoard, oneSheet, horn, disasterLook, rideLook, showLook, still, deep,
} from './paint';

// ---------------------------------------------------------------------------------------------------------------
// The shell (shared by the rooms)

const CHUNK = 512;
/** A room's back wall, x a..b, floor to ceiling: painted a chunk at a time (`paint` in world coordinates, the wall's
 *  face as if at the play plane) and put down at WALL_D. */
export const backWall = (c: Ctx, v: View, key: string, a: number, b: number, ceil: number, paint: (g: Ctx, x: number, w: number) => void) => {
  const [sa, sb] = spanAt(v, WALL_D, 40), top = Y(ceil);
  deep(c, v, WALL_D, () => {
    for (let x = a, i = 0; x < b; x += CHUNK, i++) {
      const w = Math.min(CHUNK, b - x);
      if (x + w < sa || x > sb) continue;
      still(c, `${key}-${i}`, 0, 0, x, top - 2, w, GY - top + 2, g => paint(g, x, w));
    }
  });
};
/** A room's floor going back (a..b), from the play plane to the wall: banded (lit near, dim at the wall), its pattern's
 *  rows going back too (`dots`: a color for a row at depth d, x), the skirting's shadow along the wall's foot. */
export const floorBack = (c: Ctx, v: View, a: number, b: number, R: string[], dots?: (x: number, row: number) => string | null) => {
  const eye = v.eye, n = 5, bands = [R[4], R[3], R[3], R[2], R[2]];
  for (let i = 0; i < n; i++) levelQ(c, eye, a, b, GY, 1 - ((1 - WALL_D) * i) / n, 1 - ((1 - WALL_D) * (i + 1)) / n, bands[i]);
  if (dots) {
    for (let row = 0; row < 6; row++) {
      const d = 1 - ((1 - WALL_D) * (row + 0.5)) / 6, [sa] = at(eye, a, GY, d), [sb] = at(eye, b, GY, d);
      if (sb < v.v0 || sa > v.v1) continue;
      const [, sy] = at(eye, a, GY, d), sz = Math.max(1, Math.round(3 * d - 1));
      for (let x = Math.ceil(a / 40) * 40 + (row % 2) * 20; x < b; x += 40) {
        const col = dots(x, row);
        if (!col) continue;
        const [px] = at(eye, x, GY, d);
        if (px < v.v0 - 10 || px > v.v1 + 10) continue;
        box(c, px - sz, sy - 1, sz * 2 + 1, Math.max(1, sz - 1), col);
      }
    }
  }
  // (the wall's foot: its shadow on the floor, dithered out)
  const [p, q] = at(eye, a, GY, WALL_D), [r] = at(eye, b, GY, WALL_D);
  box(c, p, q, r - p, 2, R[0]); checker(c, p, q + 2, r - p, 2, R[0], 0, 1);
};
/** A room's ceiling's underside going back (a..b at height ceil), banded darker going back, its grid's lines going back
 *  (every `cell` along) and across. */
export const ceilingUnder = (c: Ctx, v: View, a: number, b: number, ceil: number, R: string[], cell = 64) => {
  const eye = v.eye, y = Y(ceil);
  if (eye.y <= y + 1) return;
  const n = 4;
  for (let i = 0; i < n; i++) levelQ(c, eye, a, b, y, 1 - ((1 - WALL_D) * i) / n, 1 - ((1 - WALL_D) * (i + 1)) / n, R[Math.max(0, 2 - Math.floor(i / 2))]);
  c.strokeStyle = R[0]; c.lineWidth = 1; c.beginPath();
  for (let x = Math.ceil(a / cell) * cell; x < b; x += cell) { const [p, q] = at(eye, x, y, 1), [r, s] = at(eye, x, y, WALL_D); c.moveTo(p, q); c.lineTo(r, s); }
  c.stroke();
  const [p, q] = at(eye, a, y, (1 + WALL_D) / 2), [r] = at(eye, b, y, (1 + WALL_D) / 2);
  box(c, p, q, r - p, 1, R[0]);
};
/** A side wall at x = e going back (floor to ceil), banded, a skirting and a crown along it; which face shows is the
 *  one the eye's on the side of. `R` its ramp. */
export const sideWall = (c: Ctx, v: View, e: number, ceil: number, R: string[], trim: string[], door?: { h: number; to: number; col: string }) => {
  const eye = v.eye, side = eye.x > e ? 1 : -1;
  if (Math.abs(eye.x - e) < 2) return;
  const top = Y(ceil), steps = 4;
  for (let i = 0; i < steps; i++) sideQ(c, eye, e, top, GY, 1 - ((1 - WALL_D) * i) / steps, 1 - ((1 - WALL_D) * (i + 1)) / steps, R[Math.max(1, 3 - i)]);
  sideQ(c, eye, e, GY - 12, GY, 1, WALL_D, trim[1]); sideQ(c, eye, e, GY - 12, GY - 10, 1, WALL_D, trim[3]);
  sideQ(c, eye, e, top, top + 8, 1, WALL_D, trim[2]); sideQ(c, eye, e, top + 6, top + 8, 1, WALL_D, trim[4]);
  if (door) {
    // (the doorway at its front: what's through it, the jamb's lit edge)
    sideQ(c, eye, e, Y(door.h) - 6, GY, 1, door.to - 0.012, trim[1]);
    sideQ(c, eye, e, Y(door.h), GY, 1, door.to, door.col);
    const [p, q] = at(eye, e, Y(door.h), door.to), [, s] = at(eye, e, GY, door.to);
    box(c, p - (side > 0 ? 0 : 1), q, 1, s - q, trim[4]);
  }
  // (its far edge, the corner with the back wall, inked)
  const [p, q] = at(eye, e, top, WALL_D), [, s] = at(eye, e, GY, WALL_D);
  box(c, p - (side > 0 ? 1 : 0), q, 1, s - q, INK);
};
/** Over a room's ceiling: the building's guts in section, at the play plane (the ceiling's edge, the plenum's duct, the
 *  sprinkler main, conduit and bar joists under the roof deck), then dark on up. */
export const plenum = (c: Ctx, v: View, key: string, a: number, b: number, ceil: number, fascia: string[]) => {
  const top = Y(ceil), H = 120;
  const sa = Math.max(a, v.v0), sb = Math.min(b, v.v1);
  if (sb <= sa) return;
  if (v.top < top - H) bandedGradient(c, sa, Math.max(v.top, top - 1400), sb - sa, top - H - Math.max(v.top, top - 1400) + 2, ['#030203', '#060507', '#0A080B'], 4);
  for (let x = a, i = 0; x < b; x += CHUNK, i++) {
    const w = Math.min(CHUNK, b - x);
    if (x + w < v.v0 || x > v.v1) continue;
    still(c, `${key}-plen-${i}`, 0, 0, x, top - H, w, H + 16, g => {
      const S = SHELL, T = TRUSS.map(cc => mix(cc, '#0A080B', 0.55));
      bandedGradient(g, x, top - H, w, H, ['#0A080B', '#141116', '#1C181E'], 4);
      // (the roof deck: corrugated, its edge)
      box(g, x, top - H, w, 10, S[1]); for (let k = Math.ceil(x / 8) * 8; k < x + w; k += 8) { box(g, k, top - H + 2, 4, 6, S[2]); box(g, k, top - H + 2, 4, 1, S[3]); }
      box(g, x, top - H + 10, w, 2, INK);
      // (the bar joists: a truss every so far, end on, their seats)
      for (let k = Math.ceil(x / 160) * 160; k < x + w; k += 160) { box(g, k - 1, top - H + 12, 3, 40, T[2]); box(g, k - 6, top - H + 50, 13, 3, T[3]); poly(g, [[k - 10, top - H + 12], [k + 10, top - H + 12], [k, top - H + 50]], 'rgba(60, 66, 76, 0.5)'); }
      truss(g, x, x + w, top - H + 14, 22, T, 18);
      // (the duct: sheet metal, its seams and their lit edges, a hanger strap every so far)
      box(g, x, top - 74, w, 30, INK); box(g, x, top - 73, w, 28, S[3]); box(g, x, top - 73, w, 3, S[5]); box(g, x, top - 49, w, 4, S[1]);
      checker(g, x, top - 70, w, 2, S[4], 0, 1);
      for (let k = Math.ceil(x / 72) * 72; k < x + w; k += 72) { box(g, k, top - 73, 2, 28, S[1]); box(g, k + 2, top - 73, 1, 28, S[5]); box(g, k + 30, top - 92, 2, 19, T[3]); }
      // (the sprinkler main (red), its drops; conduit (gray); a cable tray)
      tubeH(g, x, x + w, top - 38, 5, ramp6('#8A1A16'));
      for (let k = Math.ceil(x / 120) * 120 + 40; k < x + w; k += 120) { box(g, k, top - 33, 2, 25, '#6A1410'); box(g, k - 2, top - 10, 6, 3, GOLD[3]); }
      tubeH(g, x, x + w, top - 26, 2, T);
      box(g, x, top - 18, w, 4, INK); for (let k = Math.ceil(x / 10) * 10; k < x + w; k += 10) box(g, k, top - 17, 6, 2, T[3]);
      // (the ceiling's edge: its fascia, trimmed, at the cut)
      box(g, x, top - 8, w, 10, INK); box(g, x, top - 7, w, 8, fascia[2]); box(g, x, top - 7, w, 2, fascia[4]); box(g, x, top - 1, w, 2, fascia[1]);
    });
  }
};

/** The floor toward us under the play plane (a..b), painted flat a chunk at a time (`paint`), then bent with the rest. */
export const BAND = 260;
export const floorFront = (c: Ctx, v: View, key: string, a: number, b: number, paint: (g: Ctx, x: number, w: number) => void, fill: string) => {
  for (let x = a, i = 0; x < b; x += CHUNK, i++) {
    const w = Math.min(CHUNK, b - x);
    if (x + w < v.v0 || x > v.v1) continue;
    still(c, `${key}-ff-${i}`, 0, 0, x, GY - 1, w, BAND + 1, g => paint(g, x, w));
  }
  const sa = Math.max(a, v.v0), sb = Math.min(b, v.v1);
  if (v.bot > GY + BAND && sb > sa) box(c, sa, GY + BAND - 1, sb - sa, v.bot - GY - BAND + 1, fill);
};
export const bendAll = (c: Ctx, v: View, a: number, b: number) => bendFloor(c, v.eye, GY, GY, GY + BAND, a, b);

// ---------------------------------------------------------------------------------------------------------------
// The lobby

const CARPET_DOT = (x: number, row: number) => { const h = hash(x * 0.37 + row * 3.1); return h > 0.62 ? (h > 0.85 ? '#2E7A78' : GOLD[2]) : h < 0.2 ? CARPET[1] : null; };
/** The cinema carpet, flat (a run of it under the play plane): deep red, bands of the deco pattern (gold fans, teal
 *  diamonds) in rows, banded nearer, the lip of it at the play plane lit. */
export const paintCarpet = (g: Ctx, x: number, w: number, R = CARPET, motif = [GOLD[2], '#2E7A78']) => {
  bandedGradient(g, x, GY, w, BAND, [R[4], R[3], R[3], R[2]], 6);
  for (let y = GY + 14, row = 0; y < GY + BAND; y += 26, row++) {
    for (let k = Math.ceil(x / 36) * 36 + (row % 2) * 18; k < x + w; k += 36) {
      // (a fan: three steps of gold, a teal diamond between them)
      box(g, k - 6, y, 13, 2, motif[0]); box(g, k - 4, y - 2, 9, 2, motif[0]); box(g, k - 1, y - 4, 3, 2, mix(motif[0], '#FFFFFF', 0.3));
      box(g, k + 17, y + 6, 2, 2, motif[1]); box(g, k + 15, y + 8, 6, 2, motif[1]); box(g, k + 17, y + 10, 2, 2, motif[1]);
    }
    box(g, x, y + 16, w, 1, R[2]);
  }
  box(g, x, GY, w, 2, R[5]); box(g, x, GY + 2, w, 1, R[3]);
  // (worn: a path down the middle of it, dithered)
  checker(g, x, GY + 40, w, 60, R[2], 0, 2);
};

/** The lobby's back wall: flocked maroon (damask in steps), the gold chair rail and the raised wainscot under it, the
 *  crown, deco fan sconces, the menu board over the counter, the franchise's one-sheets, TO THE BACKLOT; cracked
 *  once it's real. World coordinates, its face. */
const paintLobbyWall = (g: Ctx, x: number, w: number, real: boolean) => {
  const top = Y(LOBBY.ceil), M = MAROON, G = GOLD;
  bandedGradient(g, x, top, w, GY - top, [M[2], M[3], M[3], M[3], M[2]], 8);
  // (the damask: a diamond and fleur on a 24 x 30 cell, lit up its left)
  for (let yy = top + 34, r = 0; yy < GY - 104; yy += 30, r++) for (let xx = Math.floor(x / 24) * 24 + (r % 2 ? 12 : 0); xx < x + w; xx += 24) {
    poly(g, [[xx, yy - 8], [xx + 6, yy], [xx, yy + 8], [xx - 6, yy]], M[4]);
    poly(g, [[xx, yy - 8], [xx, yy + 8], [xx - 6, yy]], M[5]);
    box(g, xx - 1, yy - 1, 2, 2, M[2]);
    box(g, xx + 11, yy + 13, 2, 3, M[4]);
  }
  // (the crown: gold in steps, an egg-and-dart row)
  box(g, x, top, w, 14, INK); box(g, x, top + 1, w, 12, G[3]); box(g, x, top + 1, w, 2, G[5]); box(g, x, top + 10, w, 3, G[1]);
  for (let k = Math.ceil(x / 8) * 8; k < x + w; k += 8) { box(g, k, top + 4, 4, 5, G[2]); box(g, k, top + 4, 1, 2, G[4]); }
  box(g, x, top + 14, w, 3, M[0]);
  // (the chair rail, the wainscot's raised panels under it, the base)
  const rail = GY - 96;
  box(g, x, rail - 2, w, 9, INK); box(g, x, rail - 1, w, 7, G[3]); box(g, x, rail - 1, w, 2, G[5]); box(g, x, rail + 4, w, 2, G[1]);
  box(g, x, rail + 7, w, 81, M[1]);
  for (let k = Math.floor(x / 90) * 90 + 8; k < x + w; k += 90) {
    box(g, k, rail + 16, 74, 60, M[0]); box(g, k + 1, rail + 17, 72, 58, M[2]); box(g, k + 1, rail + 17, 72, 2, M[3]); box(g, k + 1, rail + 17, 2, 58, M[3]); box(g, k + 4, rail + 22, 66, 48, M[1]);
    box(g, k + 4, rail + 22, 66, 1, M[0]); box(g, k + 69, rail + 22, 1, 48, M[3]);
  }
  box(g, x, GY - 12, w, 12, INK); box(g, x, GY - 11, w, 11, M[0]); box(g, x, GY - 11, w, 2, G[2]);
  // (deco fan sconces, their light up the wall in stepped fans)
  for (let k = Math.floor(x / 300) * 300 + 220; k < x + w + 40; k += 300) {
    if (k < 160) continue;
    for (let r = 0; r < 4; r++) poly(g, [[k, rail - 66], [k - 30 - r * 10, top + 30 + r * 14], [k + 30 + r * 10, top + 30 + r * 14]], `rgba(253, 230, 138, ${(0.1 - r * 0.02).toFixed(2)})`);
    poly(g, [[k - 15, rail - 80], [k + 15, rail - 80], [k + 6, rail - 60], [k - 6, rail - 60]], INK);
    poly(g, [[k - 13, rail - 79], [k + 13, rail - 79], [k + 5, rail - 61], [k - 5, rail - 61]], G[3]);
    for (let f = -2; f <= 2; f++) box(g, k + f * 5, rail - 78, 1, 14, G[5]);
    box(g, k - 13, rail - 82, 26, 3, '#FFF4C8');
  }
  // (TO THE BACKLOT over the doors out)
  if (x < X(260)) board(g, X(70), GY - 196, ['TO THE BACKLOT'], showLook(1, 1, '#FEF3C7'), '#3A0A14', G, 5);
  // (the menu board over the counter: the snacks, their prices, stepped panels)
  const mb = X(1635);
  if (x < mb + 120 && x + w > mb - 120) {
    box(g, mb - 106, GY - 214, 212, 104, INK); box(g, mb - 104, GY - 212, 208, 100, CASE[2]); box(g, mb - 104, GY - 212, 208, 3, CASE[4]);
    const items: [string, string, string][] = [['LAVA NACHOS', '$14', '#F97316'], ['TORNADO DOG', '$11', '#E2E8F0'], ['FLOOD CUP', '$9', '#60A5FA'], ['ASH POPCORN', '$12', '#D6D3D1']];
    items.forEach(([t, p, col], i) => { words(g, t, mb - 96, GY - 194 + i * 20, showLook(1, 1, col, '#000000'), 'left'); words(g, p, mb + 96, GY - 194 + i * 20, showLook(1, 1, '#FDE047', '#000000'), 'right'); });
  }
  // (the franchise's one-sheets in their cases (absurd sequel numbers))
  const SHEETS: [number, string, string, string][] = [[1460, 'FLOOD 4', 'STILL WET', '#1D4ED8'], [1800, 'RIDE 2', 'COMING SOON SINCE 1991', '#4338CA']];
  for (const [rx, t1, t2, col] of SHEETS) {
    if (x > X(rx) + 70 || x + w < X(rx) - 70) continue;
    oneSheet(g, X(rx), GY - 232, 100, 136, (gg, l, t, ww, hh) => {
      const R = ramp6(col);
      bandedGradient(gg, l, t, ww, hh, [R[1], R[2], R[3], R[2]], 6);
      if (t1 === 'FLOOD 4') {
        // (a man on a roof in a wave, banded)
        for (let i = 0; i < 4; i++) box(gg, l, t + 70 + i * 10, ww, 10, ['#5A96D4', '#2E6AB2', '#1C4A88', '#12305E'][i]);
        poly(gg, [[l + 30, t + 72], [l + 50, t + 56], [l + 70, t + 72]], '#7A1A16'); box(gg, l + 46, t + 46, 6, 10, '#E2B48C'); box(gg, l + 44, t + 40, 10, 6, '#3A2410');
        for (let i = 0; i < 6; i++) box(gg, l + i * 18, t + 68 + (i % 2) * 2, 12, 2, '#A6CEF2');
      } else {
        // (the ride's building in silhouette, a question mark over it)
        box(gg, l + 22, t + 64, 56, 46, '#1A1640'); box(gg, l + 30, t + 56, 40, 10, '#1A1640'); box(gg, l + 44, t + 90, 12, 20, '#F97316');
        words(gg, '?', l + ww / 2, t + 50, showLook(3, 3, '#FDE047', '#1A1640'));
      }
      words(gg, t1, l + ww / 2, t + 22, showLook(2, 2, '#FDE047', '#000000'));
      words(gg, t2, l + ww / 2, t + hh - 8, plain(1, 1, '#F8FAFC', '#000000'));
    });
  }
  // (once it's real: cracks up the wall, stepped, a chunk of flock gone to the plaster)
  if (real) for (let k = Math.floor(x / 700) * 700 + 380; k < x + w + 60; k += 700) {
    const pts: [number, number][] = [[k, top + 18], [k + 30, top + 88], [k + 10, top + 148], [k + 50, top + 228], [k + 36, rail]];
    for (const [lw, col] of [[4, INK], [1, M[5]]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px + (lw < 2 ? 1 : 0), py) : g.moveTo(px + (lw < 2 ? 1 : 0), py))); g.stroke(); }
    box(g, k + 18, top + 120, 22, 16, '#C8B8A4'); box(g, k + 18, top + 120, 22, 2, '#E8DCC8'); checker(g, k + 16, top + 118, 26, 20, M[1], 0, 1);
  }
};

/** The doors out to the backlot, on the back wall at its depth: glass double doors in gold frames, the lot through
 *  them by the hour (red once it's real), a push bar, NO RE-ENTRY. Live (the hour). */
const lobbyDoors = (c: Ctx, v: View, real: boolean) => {
  const dx = X(20), tod = timeOfDay();
  deep(c, v, WALL_D, () => {
    box(c, dx - 4, GY - 160, 108, 160, INK); box(c, dx - 3, GY - 159, 106, 159, GOLD[2]); box(c, dx - 3, GY - 159, 106, 2, GOLD[5]);
    for (const lx of [dx + 2, dx + 52]) {
      const gx = lx + 5, gw = 36, gy = GY - 148, gh = 136;
      // (the lot through the glass: the sky by the hour, the soundstages across the lot, the asphalt)
      const sky = real ? ['#4A0E0C', '#A02C10', '#E07A34'] : [hourMix('#5A8AC8', '#7A4E66', '#141A30', tod), hourMix('#9AB8D8', '#C88A7A', '#24304A', tod), skyAt(0.9, tod)];
      bandedGradient(c, gx, gy, gw, gh - 40, sky, 5);
      box(c, gx, gy + 54, gw, 42, hourMix('#B8B0A4', '#8A6A62', '#2E2C3A', tod)); box(c, gx, gy + 54, gw, 2, hourMix('#D8D0C2', '#A88A80', '#3E3C4A', tod));
      box(c, gx + 4, gy + 72, 12, 24, hourMix('#6A6260', '#5A4448', '#1E1C26', tod));
      box(c, gx, gy + gh - 40, gw, 40, hourMix('#4A4446', '#3E3236', '#16141C', tod)); box(c, gx, gy + gh - 40, gw, 1, hourMix('#6A6466', '#5A4A4E', '#26242C', tod));
      if (real) for (let i = 0; i < 5; i++) box(c, gx + ((i * 13 + v.f) % gw), gy + ((i * 29 + v.f * 2) % gh), 2, 2, '#B8B0A8');
      // (the glass's sheen, the frame, the push bar)
      const G = glassOf();
      poly(c, [[gx + 4, gy], [gx + 12, gy], [gx, gy + 12], [gx, gy + 4]], 'rgba(255,255,255,0.3)');
      box(c, gx - 5, gy - 5, gw + 10, 5, GOLD[3]); box(c, gx - 5, gy + gh, gw + 10, 5, GOLD[1]); box(c, gx - 5, gy, 5, gh, GOLD[4]); box(c, gx + gw, gy, 5, gh, GOLD[1]);
      box(c, gx - 2, gy + 74, gw + 4, 5, INK); box(c, gx - 1, gy + 75, gw + 2, 3, G[4]);
    }
    box(c, dx + 49, GY - 159, 3, 159, INK);
    still(c, 'noreentry', dx + 50, GY - 34, -24, -6, 48, 12, g => { box(g, -22, -5, 44, 10, INK); box(g, -21, -4, 42, 8, '#FEF3C7'); words(g, 'NO RE-ENTRY', 0, 3, plain(1, 1, '#7F1D1D')); });
  });
};

/** DISASTER: THE RIDE over the lobby, in a box hung on chains (askew once it's real, bulbs out). */
const lobbyMarquee = (c: Ctx, f: number, real: boolean) => {
  const ceil = Y(LOBBY.ceil), cx = X(330), cy = ceil + 72;
  for (const s of [-1, 1]) chain(c, cx + s * 230, ceil, ceil + 30 + (real && s > 0 ? 18 : 0));
  c.save(); if (real) { c.translate(cx, cy); c.rotate(0.06); c.translate(-cx, -cy); }
  still(c, 'marquee-box', cx, ceil + 30, -294, -4, 588, 92, g => {
    const R = ramp6('#7C2D12'), G = GOLD;
    box(g, -262, -2, 524, 88, INK);
    box(g, -260, 0, 520, 84, G[3]); box(g, -260, 0, 520, 2, G[5]); box(g, -260, 82, 520, 2, G[1]);
    box(g, -254, 6, 508, 72, R[1]); bandedGradient(g, -254, 6, 508, 72, [R[2], R[1], R[0]], 4);
    // (the chaser bulbs round its edge, sockets)
    for (let k = -250; k < 252; k += 10) { box(g, k, 2, 4, 3, G[1]); box(g, k, 79, 4, 3, G[1]); }
    // (the deco wings either end)
    for (const s of [-1, 1]) { poly(g, [[s * 262, 10], [s * 290, 42], [s * 262, 74]], INK); poly(g, [[s * 262, 14], [s * 286, 42], [s * 262, 70]], G[3]); poly(g, [[s * 262, 14], [s * 286, 42], [s * 274, 42]], G[5]); }
  });
  for (let k = -250; k < 252; k += 10) { const on = !real ? (Math.floor((k + 250) / 10) + Math.floor(f / 6)) % 3 !== 0 : hash(k) > 0.6 && f % 30 < 18; box(c, cx + k, ceil + 32, 4, 3, on ? '#FFF4C8' : '#6A5A3A'); box(c, cx + k, ceil + 109, 4, 3, on ? '#FFF4C8' : '#6A5A3A'); }
  words(c, 'DISASTER:', cx, cy, disasterLook(3, !real || f % 30 < 12));
  words(c, 'THE RIDE', cx, cy + 32, rideLook(3));
  c.restore();
};

/** The queue's posts (brass stanchions, solid: a lit lip on each) and the velvet between them (behind). */
const queueVelvet = (c: Ctx, v: View) => {
  deep(c, v, NEAR_D, () => { c.save(); c.translate(0, GY); velvetRopePaint(c, X(QUEUE_RAILS[0]) - 40, X(QUEUE_RAILS[QUEUE_RAILS.length - 1]) + 40); c.restore(); });
};
/** The posts themselves (over the guests: never hidden), exactly on their solids, their caps' tops going back. */
const queueRails = (c: Ctx, v: View) => {
  for (const rx of QUEUE_RAILS) {
    if (!seenD(v, X(rx) - 20, X(rx) + 20)) continue;
    if (v.eye.y < Y(RAIL_H) - 1) levelQ(c, v.eye, X(rx) - 6, X(rx) + 6, Y(RAIL_H), 1, 0.985, GOLD[4]);
    levelQ(c, v.eye, X(rx) - 8, X(rx) + 8, GY - 1, 1, 0.988, GOLD[1]);
    still(c, 'qpost', X(rx), GY, -9, -RAIL_H - 2, 18, RAIL_H + 2, g => {
      const G = GOLD;
      box(g, -6, -RAIL_H, 12, RAIL_H, INK);
      box(g, -5, -RAIL_H + 1, 10, RAIL_H - 1, G[3]); box(g, -5, -RAIL_H + 1, 3, RAIL_H - 1, G[4]); box(g, -4, -RAIL_H + 1, 1, RAIL_H - 1, G[5]); box(g, 2, -RAIL_H + 1, 3, RAIL_H - 1, G[1]);
      for (const y of [-24, -12]) { box(g, -5, y, 10, 2, G[1]); box(g, -5, y, 10, 1, G[5]); }
      box(g, -8, -5, 16, 5, INK); box(g, -7, -4, 14, 4, G[2]); box(g, -7, -4, 14, 1, G[4]);
    });
    lip(c, X(rx) - 6, Y(RAIL_H), 12);
  }
};

/** The monitors' truss (a ledge: lit), hung on chains, the teaser on its two monitors (static once it's real). */
const gantry = (c: Ctx, v: View, f: number, real: boolean) => {
  const [rx, h, w] = LEDGES[0], x = X(rx), y = Y(h), ceil = Y(LOBBY.ceil);
  if (!seenD(v, x - 20, x + w + 20)) return;
  for (const cx of [x + 12, x + w - 12]) chain(c, cx, ceil, y);
  truss(c, x, x + w, y, 14, TRUSS, 14);
  lip(c, x, y, w);
  for (const k of [0, 1]) {
    const mx = x + 30 + k * 100, my = y + 18;
    still(c, 'monitor', mx, my, -2, -4, 74, 58, g => {
      box(g, 30, -4, 10, 6, INK); box(g, 31, -3, 8, 4, TRUSS[3]);
      box(g, -1, 0, 72, 52, INK); box(g, 0, 1, 70, 50, CASE[3]); box(g, 0, 1, 70, 2, CASE[5]); box(g, 66, 1, 4, 50, CASE[1]);
    });
    const sx = mx + 4, sy = my + 5, sw = 62, sh = 42;
    if (real) { box(c, sx, sy, sw, sh, '#2A2A2E'); for (let i = 0; i < 14; i++) box(c, sx + ((i * 23 + f * 7) % (sw - 4)), sy + ((i * 11 + f * 3) % (sh - 3)), 4, 2, i % 2 ? '#F5F5F4' : '#71717A'); }
    else {
      bandedGradient(c, sx, sy, sw, sh, ['#0E0A2A', '#1E1B4B', '#2E2470'], 4);
      words(c, 'DISASTER!', sx + sw / 2, sy + 20, showLook(1, 1, '#F97316', '#000000'));
      words(c, 'MILDLY', sx + sw / 2, sy + 33, showLook(1, 1, '#FDE68A', '#000000'));
      c.fillStyle = 'rgba(0,0,0,0.2)'; for (let yy = sy; yy < sy + sh; yy += 3) c.fillRect(sx, yy, sw, 1);
    }
  }
};

/** The concession counter (solid: its top going back, a lit lip): LAVA NACHOS, the warmer, the cheese pump. */
const counter = (c: Ctx, v: View, f: number) => {
  const x = X(1560), y = Y(60), w = 150;
  if (!seenD(v, x - 40, x + w + 40)) return;
  // (its top going back, the backbar behind it)
  levelQ(c, v.eye, x, x + w, y, 1, 0.94, '#D8CCB2'); levelQ(c, v.eye, x, x + w, y, 0.97, 0.94, '#BCAE92');
  still(c, 'counter', x, y, -6, -54, w + 12, 60 + 56, g => {
    const W = ramp6('#92400E'), G = GOLD;
    box(g, -1, 0, w + 2, 60, INK);
    box(g, 0, 1, w, 59, W[3]); box(g, 0, 1, 4, 59, W[4]); box(g, w - 6, 1, 6, 59, W[1]);
    for (let k = 10; k < w - 10; k += 34) { box(g, k, 12, 26, 38, W[2]); box(g, k, 12, 26, 2, W[1]); box(g, k, 48, 26, 2, W[4]); box(g, k + 24, 12, 2, 38, W[4]); }
    box(g, 0, 52, w, 8, W[0]); box(g, 0, 52, w, 1, G[2]);
    box(g, -4, -2, w + 8, 6, INK); box(g, -3, -1, w + 6, 4, '#E8E0CC'); box(g, -3, -1, w + 6, 1, '#FFFFFF');
    // (the nacho warmer: a glass box, the chips in it, its red lamp)
    box(g, 14, -38, 52, 36, INK); box(g, 15, -37, 50, 34, 'rgba(186, 230, 253, 0.25)'); box(g, 15, -37, 50, 6, '#3A2A1A'); box(g, 18, -31, 44, 3, '#F97316');
    for (let i = 0; i < 9; i++) poly(g, [[18 + i * 5, -4], [22 + i * 5, -14 - (i % 3) * 3], [26 + i * 5, -4]], i % 2 ? '#E8B830' : '#F2CC50');
    box(g, 16, -36, 2, 30, 'rgba(255,255,255,0.4)');
    // (the cheese pump, glowing orange; a cup stack)
    box(g, 82, -30, 22, 28, INK); box(g, 83, -29, 20, 27, '#A8ACB0'); box(g, 83, -29, 4, 27, '#D0D4D8'); box(g, 86, -46, 6, 18, INK); box(g, 87, -45, 4, 16, '#71717A');
    box(g, 88, -12, 10, 6, '#F97316'); box(g, 88, -12, 10, 2, '#FDBA74');
    for (let i = 0; i < 4; i++) { box(g, 116, -10 - i * 6, 18, 6, INK); box(g, 117, -9 - i * 6, 16, 5, i % 2 ? '#DC2626' : '#F5F5F4'); }
    words(g, 'LAVA NACHOS $14', w / 2, 34, showLook(1, 1, '#FDE047', '#000000'));
  });
  lip(c, x, y, w);
  // (its warmer lamp flickering)
  box(c, x + 18, y - 31, 44, 3, f % 50 < 47 ? '#FDBA74' : '#F97316');
};

/** The lobby's back wall, ceiling and floor going back (depth: drawn before any room's play plane). */
export const lobbyShell = (c: Ctx, v: View, real: boolean) => {
  const a = X(-200), b = X(LOBBY.b);
  backWall(c, v, `lobby-${real ? 1 : 0}`, a, b, LOBBY.ceil, (g, x, w) => paintLobbyWall(g, x, w, real));
  lobbyDoors(c, v, real);
  ceilingUnder(c, v, a, b, LOBBY.ceil, ['#2A2024', '#3E3236', '#5A4A4E', '#7A686C'], 60);
  floorBack(c, v, a, b, CARPET, CARPET_DOT);
};
export const lobbyPlenum = (c: Ctx, v: View) => plenum(c, v, 'lobby', X(-200), X(LOBBY.b), LOBBY.ceil, MAROON);

export const drawLobby = (c: Ctx, v: View, state: GameState, o: Dz, real: boolean) => {
  const f = state.frame, ceil = Y(LOBBY.ceil);
  // (the PA's horns, the marquee; the hung signs)
  for (const rx of HORNS) if (rx < LOBBY.b && seenD(v, X(rx) - 20, X(rx) + 20)) still(c, 'horn', X(rx), ceil, -18, -1, 36, 36, g => horn(g, 0, 0));
  if (seenD(v, X(30), X(640))) lobbyMarquee(c, f, real);
  if (seenD(v, X(980), X(1320))) still(c, 'waitboard', X(1150), 0, -180, ceil - 1, 360, 160, g => hungBoard(g, 0, ceil + 130, ceil, ['WAIT FROM HERE: 90 MINUTES'], showLook(2, 2, '#18181B', '#B8860B'), '#FDE047'));
  if (seenD(v, X(1530), X(1740))) still(c, 'snackboard', X(1635), 0, -100, ceil - 1, 200, 100, g => hungBoard(g, 0, ceil + 56, ceil, ['DISASTER SNACKS'], showLook(1, 2, '#FDE68A', '#000000'), '#7F1D1D'));
  queueVelvet(c, v);
  // The queue's guests (shoved aside, mad)
  for (const g of o.guests) {
    const x = X(g.rx) + (g.shove > 0 ? g.dir * (30 - g.shove) * 1.2 : 0);
    if (x < v.v0 - 40 || x > v.v1 + 40) continue;
    c.save(); c.translate(x, GY); c.scale(g.seed % 2 ? 0.92 : -0.92, 0.92);
    drawPerson(c, { seed: g.seed, outfit: 'guest', f, pose: g.mad > 0 ? 'point' : g.seed % 4 === 0 ? 'photo' : 'stand', mood: g.mad > 0 ? 'angry' : 'bored', shorts: g.seed % 3 === 0, talking: g.mad > 0 && f % 10 < 5 });
    c.restore();
  }
  queueRails(c, v);
  gantry(c, v, f, real);
  counter(c, v, f);
  // Steve: a standee in the queue (yellow)
  if (seenD(v, X(1300), X(1380))) deep(c, v, NEAR_D, () => still(c, 'standee', X(1340), GY, -52, -140, 104, 152, paintStandee));
  // Real: a ceiling tile down on the carpet, the grid's hole over it
  if (real && seenD(v, X(1120), X(1240))) {
    box(c, X(1150), ceil - 1, 60, 4, INK);
    c.save(); c.translate(X(1180), GY - 6); c.rotate(0.2); box(c, -41, -9, 82, 12, INK); box(c, -40, -8, 80, 10, '#D6D3D1'); box(c, -40, -8, 80, 2, '#F5F5F4'); checker(c, -40, -6, 80, 8, '#A8A29E', 0, 2); c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The pre-show

/** The pre-show's back wall: indigo fabric panels in deco frames, flecked with painted stars, the rules board, Steve's
 *  poster. */
const paintPreshowWall = (g: Ctx, x: number, w: number) => {
  const top = Y(PRESHOW.ceil), I = INDIGO, G = GOLD;
  bandedGradient(g, x, top, w, GY - top, [I[1], I[2], I[2], I[1]], 6);
  for (let k = Math.floor((x - X(PRESHOW.a)) / 110) * 110 + X(PRESHOW.a) + 14; k < x + w; k += 110) {
    box(g, k - 1, top + 24, 86, GY - top - 44, INK);
    box(g, k, top + 25, 84, GY - top - 46, I[3]); box(g, k, top + 25, 84, 2, I[4]); box(g, k, top + 25, 2, GY - top - 46, I[4]); box(g, k + 80, top + 25, 4, GY - top - 46, I[1]);
    // (the fabric's quilting, banded; stars painted on it)
    for (let y = top + 50; y < GY - 30; y += 40) { box(g, k + 2, y, 80, 1, I[2]); checker(g, k + 2, y + 1, 80, 2, I[2], 0, 1); }
    for (let i = 0; i < 5; i++) { const sx = k + 8 + hash(k + i * 3.3) * 66, sy = top + 40 + hash(k * 0.7 + i) * (GY - top - 100); box(g, sx, sy, 3, 1, '#FDE68A'); box(g, sx + 1, sy - 1, 1, 3, '#FDE68A'); }
  }
  box(g, x, top, w, 10, INK); box(g, x, top + 1, w, 8, G[3]); box(g, x, top + 1, w, 2, G[5]);
  box(g, x, GY - 14, w, 14, INK); box(g, x, GY - 13, w, 13, I[0]); box(g, x, GY - 13, w, 2, G[2]);
  // (the rules board: what the ride may cause)
  const rb = X(2010);
  if (x < rb + 90 && x + w > rb - 90) board(g, rb, GY - 170, ['THIS RIDE MAY CAUSE:', 'MILD WARMTH', 'A BREEZE', 'DAMPNESS', 'NO FLASH PHOTOGRAPHY'], showLook(1, 1, '#FDE68A', '#000000'), '#1E1B4B', G, 6);
  // (Steve, a framed poster)
  const sp = X(2530);
  if (x < sp + 60 && x + w > sp - 60) steveCard(g, sp, GY - 250, 1.2, 1, 'poster');
};

/** CHIP CHADWICK on the big TV, hung off the ceiling (very excited; static once it's real, the set swinging). */
const bigTv = (c: Ctx, o: Dz, f: number, real: boolean) => {
  const ceil = Y(PRESHOW.ceil), tx = X(PRESHOW.tv);
  c.save(); if (real) { c.translate(tx, ceil); c.rotate(-0.08); c.translate(-tx, -ceil); }
  for (const s of [-1, 1]) chain(c, tx + s * 80, ceil, ceil + 48);
  still(c, 'tv', tx, ceil + 46, -134, -4, 268, 198, g => {
    const K = CASE;
    box(g, -131, -1, 262, 192, INK);
    box(g, -130, 0, 260, 190, K[3]); box(g, -130, 0, 260, 3, K[5]); box(g, -130, 0, 3, 190, K[4]); box(g, 124, 0, 6, 190, K[1]); box(g, -130, 182, 260, 8, K[1]);
    box(g, -116, 12, 232, 158, INK);
    box(g, 100, 176, 10, 4, '#4ADE80'); box(g, -120, 177, 40, 2, K[4]);
  });
  const sx = tx - 112, sy = ceil + 62, sw = 224, sh = 150;
  if (real) {
    bandedGradient(c, sx, sy, sw, sh, ['#3F3F46', '#52525B', '#3F3F46'], 3);
    for (let i = 0; i < 70; i++) box(c, sx + ((i * 37 + f * 11) % sw), sy + ((i * 23 + f * 5) % sh), 5, 2, i % 3 ? '#E7E5E4' : '#71717A');
    box(c, sx, sy + ((f * 4) % sh), sw, 3, 'rgba(255,255,255,0.25)');
  } else {
    // (the set behind him: a sunburst in bands, the desk)
    bandedGradient(c, sx, sy, sw, sh, ['#C2410C', '#F97316', '#FDBA74'], 6);
    for (let k = 0; k < 12; k += 2) { const a = k * Math.PI / 6 + f * 0.01; poly(c, [[sx + sw / 2, sy + 70], [sx + sw / 2 + Math.cos(a - 0.15) * 200, sy + 70 + Math.sin(a - 0.15) * 200], [sx + sw / 2 + Math.cos(a + 0.15) * 200, sy + 70 + Math.sin(a + 0.15) * 200]], 'rgba(253, 230, 138, 0.35)'); }
    box(c, sx, sy + sh - 40, sw, 40, '#7C2D12'); box(c, sx, sy + sh - 40, sw, 3, '#C2410C');
    // (Chip: the hair helmet, the huge grin, the tan, the finger guns), stamped by his mouth
    const talk = !!o.host && f % 8 < 4, hx = sx + sw / 2, hy = sy + 70;
    c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
    still(c, `chip-${talk ? 1 : 0}`, hx, hy, -76, -60, 152, 160, g => {
      const S = ramp6('#C68A5E');
      box(g, -52, 32, 104, 62, INK); box(g, -50, 34, 100, 60, '#1D4ED8'); box(g, -50, 34, 14, 60, '#3B6EF0'); box(g, 36, 34, 14, 60, '#14318E');
      poly(g, [[-10, 34], [10, 34], [0, 52]], '#F8FAFC'); box(g, -3, 38, 6, 22, '#DC2626'); box(g, -3, 38, 2, 22, '#F87171');
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 36, 42, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = S[3]; g.beginPath(); g.ellipse(0, 0, 34, 40, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = S[4]; g.beginPath(); g.ellipse(-10, -6, 18, 26, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = S[2]; g.beginPath(); g.ellipse(22, 8, 10, 24, 0, 0, Math.PI * 2); g.fill();
      // (the hair: a helmet, stepped, a lit swoop)
      g.fillStyle = INK; g.beginPath(); g.ellipse(-4, -34, 42, 20, -0.1, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3F2A14'; g.beginPath(); g.ellipse(-4, -34, 40, 18, -0.1, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#6A4A22'; g.beginPath(); g.ellipse(-12, -40, 24, 8, -0.2, 0, Math.PI * 2); g.fill();
      box(g, -20, -46, 14, 2, '#9A7240');
      box(g, -18, -8, 10, 6, '#FFFFFF'); box(g, 8, -8, 10, 6, '#FFFFFF'); box(g, -15, -7, 4, 4, INK); box(g, 11, -7, 4, 4, INK);
      box(g, -20, -14, 12, 2, '#3F2A14'); box(g, 8, -14, 12, 2, '#3F2A14');
      box(g, -19, 11, 38, talk ? 16 : 10, INK); box(g, -18, 12, 36, talk ? 14 : 8, '#7F1D1D'); box(g, -16, 12, 32, 4, '#FFFFFF'); for (let k = -12; k < 16; k += 6) box(g, k, 12, 1, 4, '#D6D3D1');
      for (const s of [-1, 1]) { box(g, s * 62 - 9, 39, 18, 14, INK); box(g, s * 62 - 8, 40, 16, 12, S[3]); box(g, s * 62 + (s > 0 ? 0 : -12), 42, 12, 5, INK); box(g, s * 62 + (s > 0 ? 1 : -11), 43, 10, 3, S[4]); }
    });
    c.restore();
    words(c, 'CHIP CHADWICK', sx + sw / 2, sy + sh - 10, showLook(1, 2, '#FDE047', '#000000'));
    c.fillStyle = 'rgba(0, 0, 0, 0.16)'; for (let yy = sy; yy < sy + sh; yy += 4) c.fillRect(sx, yy, sw, 2);
    poly(c, [[sx, sy], [sx + 40, sy], [sx, sy + 30]], 'rgba(255,255,255,0.12)');
  }
  c.restore();
};

export const preshowShell = (c: Ctx, v: View) => {
  const a = X(PRESHOW.a), b = X(PRESHOW.b) - DOOR_HALF;
  backWall(c, v, 'preshow', a, b, PRESHOW.ceil, paintPreshowWall);
  ceilingUnder(c, v, a, b, PRESHOW.ceil, ['#0A0820', '#14103A', '#1E1852', '#2A2268'], 50);
  floorBack(c, v, a, b, INDIGO, (x, row) => (hash(x * 0.41 + row) > 0.7 ? GOLD[1] : null));
};
/** The partition in from the lobby (going back, its doorway at the front). */
export const lobbyPartition = (c: Ctx, v: View) => {
  const a = X(PRESHOW.a);
  if (seenD(v, a - 10, a + 10, WALL_D) || seenD(v, a - 10, a + 10)) sideWall(c, v, a, LOBBY.ceil, v.eye.x > a ? INDIGO : MAROON, GOLD, { h: 170, to: 0.95, col: v.eye.x > a ? MAROON[1] : INDIGO[1] });
};
export const preshowPlenum = (c: Ctx, v: View) => plenum(c, v, 'preshow', X(PRESHOW.a), X(PRESHOW.b), PRESHOW.ceil, INDIGO);

export const drawPreshow = (c: Ctx, v: View, state: GameState, o: Dz, real: boolean) => {
  const f = state.frame, a = X(PRESHOW.a), ceil = Y(PRESHOW.ceil);
  // (the header over the doorway in from the lobby, at the cut)
  still(c, 'header-1900', a, 0, -10, ceil - 2, 20, Y(170) - ceil + 4, g => { box(g, -8, ceil, 16, Y(170) - ceil, INK); box(g, -7, ceil, 14, Y(170) - ceil - 1, SHELL[3]); box(g, -7, ceil, 3, Y(170) - ceil - 1, SHELL[4]); box(g, -7, Y(170) - 8, 14, 7, GOLD[3]); box(g, -7, Y(170) - 8, 14, 1, GOLD[5]); });
  still(c, 'preboard', X(PRESHOW.a + 120), 0, -80, ceil - 1, 160, 90, g => hungBoard(g, 0, ceil + 50, ceil, ['PRE-SHOW'], showLook(2, 2, '#FDE68A', '#1C0A06'), '#312E81'));
  for (const rx of HORNS) if (rx >= PRESHOW.a && rx < PRESHOW.b && seenD(v, X(rx) - 20, X(rx) + 20)) still(c, 'horn', X(rx), ceil, -18, -1, 36, 36, g => horn(g, 0, 0));
  if (seenD(v, X(PRESHOW.tv) - 140, X(PRESHOW.tv) + 140)) bigTv(c, o, f, real);
  // The guests watching it (bored; scared once it's real)
  for (const [rx, seed] of PRESHOW_WATCHERS) { c.save(); c.translate(X(rx), GY); c.scale(rx < PRESHOW.tv ? 0.9 : -0.9, 0.9); drawPerson(c, { seed, outfit: 'guest', f, pose: real ? 'point' : 'stand', mood: real ? 'scared' : 'bored', shorts: seed % 3 === 0 }); c.restore(); }
};

/** The floor fronts: the lobby's carpet, the pre-show's, the theater's deck, outside's asphalt (then bent). */
export const paintIndigoCarpet = (g: Ctx, x: number, w: number) => paintCarpet(g, x, w, INDIGO, [GOLD[1], '#5446A6']);

void THEATER; void FAR_WALL; void tubeV; void steppedGlow; void STEVE; void CASE;
