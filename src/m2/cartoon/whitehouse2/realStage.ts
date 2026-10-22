// THE REAL STAGE (the user's: "behind the projection it's a basic stage layout with NO hazards: a stage where an
// audience watched the actors projected as cartoon characters"). What the screen hid, once it's down: both halves of
// the White House drawn as what they were, a long black-box soundstage, at peak SNES (part one's pass): no cartoon ink,
// real materials in stepped ramps under the work lights, dithered seams.
//
// Far off (screen space, painted once): the soundstage's own back wall: cinderblock in courses, the fly gallery's
// catwalk and its rail, the pin rail with the rope lines tied off, a roll-up loading door in hazard stripes, conduit,
// breaker boxes, a fire extinguisher, EXIT signs glowing. Then (at the back, to the one eye): black velour legs in
// folds under a border, the pipe grid overhead (a box truss, par cans and lekos hung off it, the show's VIDEO-MAX
// projectors hung upside down, cable looped between), the stage floor going back (black plywood, scuffed, spike tape
// where each room's set stood, cables taped down across it, glow-tape dots). Nearer: the scenery flats' backs (the
// rooms were plywood flats painted as the White House: from behind, raw 1x3 frames, toggle rails, corner blocks,
// muslin, the cartoon paint bled round their edges, stenciled names, jacks braced off them weighted with sandbags and
// stage weights), truss towers, road cases, the mean men's spare suits on a costume rack, a craft-service table gone
// cold, a director's chair, a ladder, the show's TV cameras on their pedestals. In the play plane: everything he
// stands on is what it was all along, plywood: boxes painted flat black, stenciled (PIANO, PODIUM...), scuffed to the
// ply at the corners, screwed; planks on stands; scaffold stairs and a scaffold deck (steel tube, couplers, toe
// boards), their tops lit along the edge (standable reads standable). In front, under the stage's lip: the empty
// front row of the house (red velour, armrests, cup holders, row letters, aisle lights) and what the audience dropped
// running. One eye, as the cartoon's (the middle of the screen).
//
// Each half hands its own plan (its boxes, planks, stairs, flats): whitehouse1/index.ts and whitehouse2/index.ts.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { box, mix, hash, onScreen, checker, stamp, ramp6, boxSides, type Ctx } from '../kit';
import { GY } from '../geometry';

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
const quad = (c: Ctx, pts: P[], fill: string) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };
const seenAt = (state: GameState, E: P, a: number, b: number, d: number, m = 60) => { const pa = proj(E, a, 0, d).x, pb = proj(E, b, 0, d).x; return pb > state.camera.x - m && pa < state.camera.x + CANVAS_WIDTH + m; };
/** Still art (no hour indoors): painted once into a stamp at world (x, y). */
const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `rs-${key}`, bx, by, bw, bh, paint); c.restore();
};

const PLY = '#B88B5A', PLY_DK = '#8C6640', BLACK = '#1B1A1F', BLACK_LT = '#2C2A31', LIP = '#E7E2D6', STEEL = '#6B7280', STEEL_LT = '#9CA3AF';
/** Materials, darkest first (kit.ts's six steps). */
const PLYR = ramp6('#B88B5A'), BLK = ['#09080C', '#121116', '#1B1A1F', '#24222A', '#323038', '#46434E'], STL = ramp6('#7A8090'), MUSLIN = ramp6('#CFC4AA'), VELOUR = ['#060508', '#0C0B10', '#121118', '#18161F', '#201E28', '#2A2834'];
const STENCIL = { sx: 1, sy: 1, stencil: true, fill: ['#E5E7EB', '#D1D5DB'] };
const STENCIL_DK = { sx: 1, sy: 1, stencil: true, fill: ['#1F2937', '#111827'] };
/** A face in steps (lit top and left, shaded right and bottom, dithered), no ink (real things, not the cartoon). */
const slab = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  box(g, x, y, w, h, R[3]);
  if (w < 4 || h < 4) return;
  box(g, x, y, w, 2, R[4]); box(g, x, y, 2, h, R[4]); box(g, x + 1, y, Math.max(1, Math.round(w * 0.3)), 1, R[5]);
  box(g, x + w - 2, y + 1, 2, h - 1, R[1]); checker(g, x + w - 4, y + 1, 2, h - 1, R[2], 0, 1);
  box(g, x + 1, y + h - 2, w - 1, 2, R[1]);
};
/** A round tube (steel), stepped across. */
const tube = (g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, R = STL) => {
  g.lineCap = 'butt';
  for (const [k, col] of [[1, R[1]], [0.7, R[3]], [0.3, R[5]]] as [number, string][]) { g.strokeStyle = col; g.lineWidth = w * k; g.beginPath(); g.moveTo(x0 - (1 - k) * 0.4, y0 - (1 - k) * 0.4); g.lineTo(x1 - (1 - k) * 0.4, y1 - (1 - k) * 0.4); g.stroke(); }
};

/** What a half's stage is made of (world x; heights as world y tops). */
export interface StagePlan {
  /** The span it covers (world x). */
  a: number; b: number;
  /** The floor's top under world x (the second floor's deck where there is one). */
  floorAt: (x: number) => number;
  /** Solid plywood boxes: [from, to, top y, its stenciled name]. */
  boxes: [number, number, number, string][];
  /** Planks on stands (the one-way ledges): [from, to, top y]. */
  planks: [number, number, number][];
  /** Scaffold stairs up from the stage floor to a deck: from, to, the steps, the deck's top y. */
  stairs?: { a: number; b: number; n: number; top: number };
  /** Scaffold decks (the second floor): [from, to, top y]. */
  decks: [number, number, number][];
  /** Scenery flats' backs (where the rooms changed): [x, their stencil]. */
  flats: [number, string][];
  /** Spike-tape names on the floor (where each room's set stood): [x, words]. */
  marks: [number, string][];
  /** The show's TV cameras in the wings: x. */
  cameras: number[];
}

// ---------------------------------------------------------------------------------------------------------------
// Far off: the soundstage's back wall (screen space, a tile painted once, slid along)

const TW = 960, TH = 600;
const paintFarWall = (g: Ctx) => {
  const B = ['#0E0D12', '#14131A', '#1A1922', '#22202A'];
  box(g, 0, 0, TW, TH, B[1]);
  // (cinderblock in courses, each block's lit top edge)
  for (let row = 0, y = 0; y < TH; y += 16, row++) for (let x = -(row % 2) * 20; x < TW; x += 40) { const k = hash(x * 0.13 + row * 3.7); box(g, x + 1, y + 1, 38, 14, k < 0.2 ? B[2] : k > 0.9 ? B[0] : B[1]); box(g, x + 1, y + 1, 38, 1, B[3]); }
  // (the fly gallery: a catwalk along the wall, its rail, the pin rail's ropes coming down tied off on cleats)
  const gy = 150;
  box(g, 0, gy, TW, 10, '#2A2830'); box(g, 0, gy, TW, 2, '#3E3B46'); checker(g, 0, gy + 10, TW, 4, '#08070A', 0, 1);
  box(g, 0, gy - 40, TW, 3, '#34313C'); for (let x = 0; x < TW; x += 60) box(g, x, gy - 40, 3, 40, '#34313C');
  box(g, 0, gy - 20, TW, 2, '#2A2830');
  for (let x = 20; x < TW; x += 22) { const len = 180 + hash(x) * 220; box(g, x, gy + 10, 1, len, '#4A4234'); box(g, x - 3, gy + 10 + len, 7, 3, '#5A5A66'); if (hash(x * 3) < 0.3) { box(g, x - 4, gy + 10 + len * 0.6, 9, 10, '#3A3428'); } }
  // (a roll-up loading door: its slats, the hazard stripes round it, the chain)
  const dx = 560, dy = 300;
  box(g, dx - 4, dy - 4, 248, 304, '#0A090C');
  for (let y = dy; y < dy + 296; y += 8) { box(g, dx, y, 240, 7, '#2E2C34'); box(g, dx, y, 240, 1, '#3E3B46'); }
  for (let k = 0; k < 30; k++) { box(g, dx - 12 + k * 9, dy - 14, 5, 8, k % 2 ? '#C8A010' : '#14131A'); }
  for (let y = dy; y < dy + 300; y += 9) { box(g, dx - 12, y, 8, 5, (y / 9) % 2 ? '#C8A010' : '#14131A'); box(g, dx + 244, y, 8, 5, (y / 9) % 2 ? '#14131A' : '#C8A010'); }
  signText(g, 'DOCK 3', dx + 120, dy + 40, STENCIL);
  for (let y = dy + 20; y < dy + 260; y += 6) box(g, dx + 250, y, 2, 3, '#5A5A66');
  // (conduit runs, breaker boxes, a fire extinguisher, the EXIT signs)
  box(g, 0, 270, TW, 3, '#3A3844'); box(g, 0, 270, TW, 1, '#5A5866');
  for (const x of [120, 380]) { box(g, x, 280, 40, 56, '#3A3844'); box(g, x, 280, 40, 2, '#5A5866'); box(g, x + 4, 290, 32, 4, '#2A2830'); box(g, x + 30, 310, 4, 8, '#DC2626'); signText(g, 'PANEL', x + 20, 330, STENCIL); }
  box(g, 260, 470, 12, 30, '#B91C1C'); box(g, 260, 470, 3, 30, '#DC2626'); box(g, 262, 464, 8, 6, '#2A2830');
  for (const x of [60, 880]) { box(g, x - 24, 230, 48, 18, '#5A0A0A'); box(g, x - 22, 232, 44, 14, '#B91C1C'); signText(g, 'EXIT', x, 243, { sx: 1, sy: 1, fill: ['#FEE2E2', '#FCA5A5'] }); }
};

/** Screen space: the soundstage's far wall (nothing of the sky: it's indoors). */
export const drawStageBackdrop = (c: Ctx, state: GameState) => {
  box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0C0B10');
  const off = state.camera.x * 0.3, y = Math.round(-80 - state.camera.y * 0.3);
  for (let x = -(((off % TW) + TW) % TW); x < CANVAS_WIDTH; x += TW) { c.save(); c.translate(Math.round(x), y); stamp(c, 'rs-farwall', 0, 0, TW, TH, paintFarWall); c.restore(); }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The back: the legs and border, the pipe grid, the floor going back

/** A stretch of black velour legs (x0..x1 world, the floor fy, its top): folds in steps, the hem on the floor. */
const paintDrapes = (g: Ctx, w: number, h: number) => {
  box(g, 0, -h, w, h, VELOUR[2]);
  for (let x = 0; x < w; x += 46) {
    box(g, x, -h, 14, h, VELOUR[3]); box(g, x + 14, -h, 4, h, VELOUR[4]); box(g, x + 18, -h, 2, h, VELOUR[5]);
    box(g, x + 30, -h, 10, h, VELOUR[1]); checker(g, x + 28, -h, 2, h, VELOUR[1], 0, 1); checker(g, x + 12, -h, 2, h, VELOUR[3], 1, 1);
  }
  box(g, 0, -16, w, 16, VELOUR[1]); for (let x = 0; x < w; x += 23) box(g, x, -16, 12, 3, VELOUR[3]);
  // (the border above: a black teaser, its batten)
  box(g, 0, -h, w, 40, VELOUR[1]); box(g, 0, -h + 38, w, 3, VELOUR[0]);
};
/** The pipe grid: a box truss along it (stepped tube, triangulated), par cans and lekos, a VIDEO-MAX projector hung
 *  upside down every so often, cable looped between, safety chains. */
const paintGrid = (g: Ctx, w: number, seed: number) => {
  // (the box truss: top and bottom chords, the diagonals)
  tube(g, 0, 0, w, 0, 5); tube(g, 0, 26, w, 26, 5);
  for (let x = 0; x < w; x += 26) { tube(g, x, 2, x + 13, 24, 2); tube(g, x + 13, 24, x + 26, 2, 2); }
  for (let x = 0; x < w; x += 78) box(g, x - 2, -2, 5, 30, STL[2]);
  for (let x = 10; x < w; x += 40) {
    const k = hash(seed + x * 0.01);
    if (k < 0.45) {
      // (a par can: a black drum, its yoke, the lens; a gel frame)
      box(g, x - 1, 28, 3, 8, STL[1]); slab(g, x - 9, 36, 18, 20, BLK); box(g, x - 7, 56, 14, 3, '#FEF3C7'); box(g, x - 7, 56, 14, 1, '#FFFFFF'); box(g, x - 10, 36, 20, 2, BLK[5]);
      box(g, x - 9, 58, 18, 2, ['#F472B6', '#60A5FA', '#FDE047', '#FFFFFF'][Math.floor(k * 9) % 4]);
    } else if (k < 0.7) {
      // (a leko: a long barrel at an angle, shutters)
      g.save(); g.translate(x, 40); g.rotate(0.5 + k);
      slab(g, -6, -6, 26, 12, BLK); box(g, 18, -5, 5, 10, '#3F3F46'); box(g, 22, -3, 2, 6, '#FEF3C7'); for (const s of [-1, 1]) box(g, 8, s * 6 - 1, 4, 2, STL[3]);
      g.restore();
      box(g, x - 1, 28, 3, 8, STL[1]);
    }
    // (cable looped down to the next)
    g.strokeStyle = '#0A0A0D'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 4, 28); g.quadraticCurveTo(x + 20, 50, x + 36, 28); g.stroke();
  }
  // (a projector hung under it: the VIDEO-MAX, three lenses, upside down, safety chain)
  const px = w * 0.5;
  slab(g, px - 4, 28, 8, 16, STL);
  slab(g, px - 46, 44, 92, 40, BLK);
  for (let k = 0; k < 3; k++) { box(g, px + 46, 50 + k * 11, 10, 9, '#0A0A0D'); box(g, px + 48, 52 + k * 11, 6, 5, ['#4A1A1A', '#1A3A1A', '#1A1A4A'][k]); box(g, px + 49, 53 + k * 11, 2, 2, '#9CA3AF'); }
  signText(g, 'VIDEO-MAX', px, 74, STENCIL);
  g.strokeStyle = STL[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(px - 30, 26); g.lineTo(px - 30, 44); g.stroke();
};

/** The legs, the grid, the floor going back, the flats' backs and what's in the wings (world, behind him). */
export const drawStageShell = (c: Ctx, state: GameState, plan: StagePlan) => {
  const E = eyeOf(state), D = 0.8;
  const v0 = state.camera.x - 200, v1 = state.camera.x + CANVAS_WIDTH + 200;
  const a = Math.max(plan.a, v0 - 600), b = Math.min(plan.b, v1 + 600);
  if (a >= b) return;
  const H = 600, seg = 460;
  atDepth(c, E, D, () => {
    for (let x = Math.floor((a - 400) / seg) * seg; x < b + 400; x += seg) {
      if (!seenAt(state, E, x, x + seg, D, 40)) continue;
      still(c, 'drapes', x, GY, 0, -H, seg, H, g => paintDrapes(g, seg, H));
      still(c, `grid-${Math.abs(Math.round(x / seg)) % 4}`, x, GY - 660, 0, -4, seg, 92, g => paintGrid(g, seg, Math.abs(Math.round(x / seg)) % 4));
      // (safety lines and hanging cable down from the grid)
      box(c, x + seg * 0.3, GY - 634, 2, 60, '#0A0A0D');
    }
  });
  // (the stage floor going back: black plywood in bands, the sheets' seams, scuffs, spike tape, cables taped down)
  const fA = a - 200, fB = b + 200, dAt = (k: number) => D + (1 - D) * k;
  for (let i = 0; i < 4; i++) quad(c, [proj(E, fA, GY, dAt(i / 4)), proj(E, fB, GY, dAt(i / 4)), proj(E, fB, GY, dAt((i + 1) / 4)), proj(E, fA, GY, dAt((i + 1) / 4))], ['#18171C', '#1E1C22', '#232128', '#2A282F'][i]);
  for (let x = Math.floor(a / 96) * 96; x < b; x += 96) { const p0 = proj(E, x, GY, D), p1 = proj(E, x, GY, 1); c.strokeStyle = '#0E0D12'; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  for (const k of [0.5]) { const p0 = proj(E, fA, GY, dAt(k)), p1 = proj(E, fB, GY, dAt(k)); c.strokeStyle = '#0E0D12'; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  for (let x = Math.floor(a / 70) * 70; x < b; x += 70) { const k = hash(x * 0.07); if (k > 0.55) continue; const p = proj(E, x + k * 40, GY, dAt(0.2 + k)); box(c, p.x, p.y, 10 + k * 20, 1, '#34313A'); }
  // (cables snaking across the floor going back, gaffer tape over them; glow-tape dots on the edges)
  for (let x = Math.floor(a / 380) * 380 + 120; x < b; x += 380) {
    const pts = [0, 0.25, 0.5, 0.75, 1].map(k => proj(E, x + Math.sin(k * 5 + x) * 30, GY, dAt(k)));
    c.strokeStyle = '#08080A'; c.lineWidth = 3; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
    c.strokeStyle = '#2E2C34'; c.lineWidth = 1; c.stroke();
    for (const p of [pts[1], pts[3]]) { box(c, p.x - 8, p.y - 1, 16, 3, '#3A3A44'); box(c, p.x - 8, p.y - 1, 16, 1, '#5A5A66'); }
  }
  for (let x = Math.floor(a / 300) * 300; x < b; x += 300) { const p = proj(E, x, GY, dAt(0.92)); box(c, p.x, p.y, 3, 2, '#A3F0C0'); }
  for (const [x, words] of plan.marks) {
    if (x < v0 - 200 || x > v1 + 200) continue;
    const p = proj(E, x, GY, D + (1 - D) * 0.35);
    box(c, p.x - 36, p.y - 3, 72, 7, '#0A0A0D'); box(c, p.x - 34, p.y - 2, 68, 5, '#E5E7EB'); box(c, p.x - 34, p.y - 2, 68, 1, '#FFFFFF');
    c.save(); c.translate(p.x, p.y); c.scale(1, 0.6); signText(c, words, 0, 1, STENCIL_DK); c.restore();
    box(c, p.x - 46, p.y - 1, 8, 3, '#FDE047'); box(c, p.x + 38, p.y - 1, 8, 3, '#F472B6');
    box(c, p.x - 40, p.y + 6, 4, 4, '#FDE047'); box(c, p.x + 36, p.y - 8, 4, 4, '#F472B6');
  }
  // (nearer: the flats' backs, and the wings' clutter between them; the TV cameras)
  const DN = 0.88;
  atDepth(c, E, DN, () => {
    for (const [x, name] of plan.flats) {
      if (!seenAt(state, E, x - 160, x + 160, DN)) continue;
      still(c, `flat-${name}`, x, GY, -150, -440, 300, 446, g => paintFlat(g, name));
    }
    // (between the flats, every so often: what's in the wings)
    for (let x = Math.floor(a / 300) * 300 + 150; x < b; x += 300) {
      if (plan.flats.some(([fx]) => Math.abs(fx - x) < 230) || plan.cameras.some(cx => Math.abs(cx - x) < 140)) continue;
      if (!seenAt(state, E, x - 120, x + 120, DN)) continue;
      const kind = Math.floor(hash(x * 0.011) * WINGS.length);
      still(c, `wing-${kind}`, x, GY, -110, -380, 220, 384, g => WINGS[kind](g));
    }
    for (const x of plan.cameras) {
      if (!seenAt(state, E, x - 160, x + 80, DN)) continue;
      still(c, 'tvcam', x, GY, -150, -170, 230, 176, g => tvCamera(g));
    }
  });
};

/** A scenery flat from behind (local: its middle at 0, feet 0): two flats side by side, raw 1x3 frames, toggles,
 *  corner blocks, muslin, the cartoon's paint bled round the edges, a stencil; a jack braced off the back, sandbags and
 *  a stage weight on its foot. */
const paintFlat = (g: Ctx, name: string) => {
  const h = 420, w = 132;
  for (const [ox, bleed] of [[-w - 2, '#FDE68A'], [2, '#9DD6F5']] as [number, string][]) {
    // (the paint that got round the front's edge)
    box(g, ox - 2, -h - 2, w + 4, h + 2, bleed); box(g, ox - 2, -h - 2, w + 4, 1, mix(bleed, '#FFFFFF', 0.4));
    slab(g, ox, -h, w, h, MUSLIN);
    // (the muslin's own texture, a water stain, a patch)
    for (let k = 0; k < 40; k++) box(g, ox + 6 + hash(k + ox) * (w - 12), -h + 10 + hash(k * 3 + ox) * (h - 20), 3, 1, MUSLIN[2]);
    g.fillStyle = 'rgba(120,100,70,0.25)'; g.beginPath(); g.ellipse(ox + w * 0.6, -h * 0.3, 18, 26, 0.3, 0, Math.PI * 2); g.fill();
    // (the frame: stiles and rails of raw 1x3, toggles across, corner blocks of ply, keystones)
    for (const [x, y, ww, hh] of [[ox, -h, w, 10], [ox, -10, w, 10], [ox, -h, 10, h], [ox + w - 10, -h, 10, h], [ox, -h * 0.66, w, 8], [ox, -h * 0.33, w, 8]] as [number, number, number, number][]) slab(g, x, y, ww, hh, PLYR);
    for (const [cx, cy, s] of [[ox + 10, -h + 10, 1], [ox + w - 10, -h + 10, -1], [ox + 10, -10, 1], [ox + w - 10, -10, -1]] as [number, number, number][]) { g.fillStyle = PLYR[2]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + s * 18, cy); g.lineTo(cx, cy + (cy < -h / 2 ? 18 : -18)); g.closePath(); g.fill(); box(g, cx + s * 3, cy + (cy < -h / 2 ? 3 : -5), 2, 2, '#4B5563'); }
    for (const ty of [-h * 0.66, -h * 0.33]) for (const kx of [ox + 10, ox + w - 22]) { box(g, kx, ty - 4, 12, 16, PLYR[2]); box(g, kx + 2, ty, 2, 2, '#4B5563'); box(g, kx + 8, ty + 8, 2, 2, '#4B5563'); }
    for (let y = -h + 20; y < -10; y += 40) { box(g, ox + 3, y, 2, 2, '#4B5563'); box(g, ox + w - 5, y, 2, 2, '#4B5563'); }
  }
  signText(g, name, -w / 2 - 2, -h + 60, STENCIL_DK);
  signText(g, 'SOCKS S1', w / 2 + 2, -h + 60, STENCIL_DK);
  signText(g, 'THIS SIDE BACK', w / 2 + 2, -h + 140, STENCIL_DK);
  // (the jack: a triangle of 1x3 braced off the back, hinged; sandbags and a stage weight on its foot)
  for (const s of [-1, 1]) {
    const jx = s * (w * 0.55);
    g.strokeStyle = PLYR[1]; g.lineWidth = 7; g.beginPath(); g.moveTo(jx, -h * 0.62); g.lineTo(jx + s * 70, -2); g.stroke();
    g.strokeStyle = PLYR[4]; g.lineWidth = 3; g.stroke();
    g.strokeStyle = PLYR[1]; g.lineWidth = 6; g.beginPath(); g.moveTo(jx, -h * 0.3); g.lineTo(jx + s * 40, -h * 0.3 + 60); g.stroke(); g.strokeStyle = PLYR[3]; g.lineWidth = 2; g.stroke();
    // (sandbags: canvas, stitched, slumped; a cast iron stage weight)
    for (const [bx, by, bw] of [[jx + s * 58, -12, 30], [jx + s * 72, -24, 26]] as [number, number, number][]) { g.fillStyle = '#5A4A2E'; g.beginPath(); g.ellipse(bx, by, bw / 2, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#8A7A4E'; g.beginPath(); g.ellipse(bx - 2, by - 2, bw / 2 - 3, 5, 0, 0, Math.PI * 2); g.fill(); box(g, bx - bw / 2 + 4, by - 1, bw - 8, 1, '#3A2E1A'); box(g, bx - 3, by - 7, 6, 3, '#3A2E1A'); }
    slab(g, jx + s * 40 - 10, -10, 20, 10, STL);
  }
};
/** The wings' clutter (local: its middle at 0, feet 0). */
const WINGS: ((g: Ctx) => void)[] = [
  // (a truss tower: four stepped legs, triangulated, a base plate, par cans on top)
  g => {
    for (const x of [-16, 16]) tube(g, x, -360, x, 0, 4);
    for (let y = 0; y > -360; y -= 30) { tube(g, -16, y, 16, y - 30, 2); tube(g, 16, y, -16, y - 30, 2); }
    slab(g, -30, -8, 60, 8, STL);
    for (const x of [-18, 2]) { slab(g, x, -382, 16, 22, BLK); box(g, x + 2, -362, 12, 2, '#FEF3C7'); }
  },
  // (road cases stacked: black, aluminum edging, corner caps, stencils, casters)
  g => {
    for (const [x, y, w, h, t] of [[-80, -70, 100, 70, 'AUDIO'], [-70, -130, 80, 60, 'SOCKS'], [30, -54, 60, 54, 'CABLE']] as [number, number, number, number, string][]) {
      slab(g, x, y, w, h, BLK); box(g, x, y + h / 2 - 1, w, 3, STL[4]); for (const [cx, cy] of [[x, y], [x + w - 6, y], [x, y + h - 6], [x + w - 6, y + h - 6]]) box(g, cx, cy, 6, 6, STL[3]);
      signText(g, t, x + w / 2, y + h / 2 - 8, STENCIL);
    }
    for (const x of [-72, -6, 36, 80]) { box(g, x, -4, 8, 4, '#0A0A0D'); }
  },
  // (the mean men's spare suits on a costume rack: black suits, a pinstripe, sweater vests, a tag on each; a mirror)
  g => {
    tube(g, -90, -170, 90, -170, 4); for (const x of [-88, 88]) tube(g, x, -170, x, -6, 4); for (const x of [-100, 76]) slab(g, x, -8, 24, 6, STL);
    for (let k = 0; k < 9; k++) {
      const x = -76 + k * 19, col = ['#1C1C22', '#1C1C22', '#1E293B', '#C8A26B', '#1C1C22', '#A3B18A', '#27303F', '#1C1C22', '#B08968'][k];
      box(g, x - 1, -170, 2, 6, STL[4]);
      const R = ramp6(col); g.fillStyle = R[3]; g.beginPath(); g.moveTo(x - 9, -160); g.lineTo(x + 9, -160); g.lineTo(x + 8, -70); g.lineTo(x - 8, -70); g.closePath(); g.fill(); box(g, x - 9, -160, 3, 90, R[4]); box(g, x + 6, -160, 3, 90, R[1]);
      box(g, x - 2, -160, 4, 18, '#F2F2F8'); if (k % 3 === 0) box(g, x - 0.5, -158, 1.5, 14, '#050505');
      box(g, x + 4, -150, 6, 8, '#F2E8C8');
    }
    signText(g, 'MEAN MEN', 0, -186, STENCIL);
  },
  // (craft services gone cold: a folding table, a coffee urn, a box of donuts, cups; a director's chair by it)
  g => {
    slab(g, -90, -60, 120, 8, ramp6('#D6D2C4')); for (const x of [-84, 20]) tube(g, x, -52, x, 0, 3);
    slab(g, -80, -110, 26, 50, STL); box(g, -70, -84, 6, 4, '#1A1A22'); box(g, -76, -114, 18, 4, STL[4]);
    slab(g, -44, -74, 44, 14, ramp6('#F2E2C2')); for (let k = 0; k < 4; k++) { g.fillStyle = ['#F472B6', '#7C2D12', '#FDE68A', '#F472B6'][k]; g.beginPath(); g.arc(-38 + k * 10, -76, 4, Math.PI, 0); g.fill(); }
    for (let k = 0; k < 4; k++) slab(g, 4 + k * 6, -70, 5, 10, ramp6('#F4F4FA'));
    // (the director's chair: canvas, crossed legs, DIRECTOR on the back)
    tube(g, 44, -2, 76, -60, 3, PLYR); tube(g, 76, -2, 44, -60, 3, PLYR); tube(g, 44, -60, 44, -110, 3, PLYR); tube(g, 76, -60, 76, -110, 3, PLYR);
    slab(g, 42, -108, 36, 18, ramp6('#1E3A8A')); slab(g, 42, -64, 36, 6, ramp6('#1E3A8A'));
    signText(g, 'DIRECTOR', 60, -97, { sx: 1, sy: 1, fill: ['#F4F4FA', '#D6D6E4'] });
  },
  // (an A-frame ladder, a coil of cable, a mop bucket)
  g => {
    for (const s of [-1, 1]) tube(g, s * 6, -220, s * 40, 0, 4, ramp6('#C8A040'));
    for (let y = -190; y < 0; y += 30) { const k = (y + 220) / 220; box(g, -6 - k * 34, y, 12 + k * 68, 4, '#A8842C'); box(g, -6 - k * 34, y, 12 + k * 68, 1, '#E8C860'); }
    slab(g, -14, -228, 28, 10, ramp6('#C8A040'));
    for (let r = 18; r > 6; r -= 4) { g.strokeStyle = r % 8 ? '#1A1A22' : '#2E2C34'; g.lineWidth = 3; g.beginPath(); g.ellipse(80, -10, r + 6, r * 0.4, 0, 0, Math.PI * 2); g.stroke(); }
    slab(g, -96, -36, 34, 36, ramp6('#F2C84A')); box(g, -90, -60, 3, 26, '#8A6A4A'); for (let k = 0; k < 8; k++) box(g, -98 + k * 4, -42 + (k % 2) * 3, 3, 8, '#D6D2C4');
  },
];
const tvCamera = (g: Ctx) => {
  // (local: the pedestal's foot at 0: the show's studio camera, dark, abandoned: a tripod dolly, the column, the head,
  // its lens hood, the viewfinder, CAM 2, its cable trailing off)
  slab(g, -30, -12, 60, 12, BLK); for (const dx of [-26, 18]) { box(g, dx, -4, 8, 4, '#0A0A0D'); }
  slab(g, -5, -112, 10, 100, STL);
  slab(g, -36, -164, 66, 48, ramp6('#3F3F46'));
  slab(g, 30, -156, 24, 32, BLK); box(g, 52, -152, 4, 24, '#1E3A5A'); box(g, 53, -150, 2, 6, '#60A5FA');
  slab(g, -50, -160, 16, 22, BLK); box(g, -48, -156, 10, 12, '#1A2230');
  g.strokeStyle = '#18181B'; g.lineWidth = 3; g.beginPath(); g.moveTo(-10, -118); g.lineTo(-56, -98); g.stroke();
  g.strokeStyle = '#0A0A0D'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -2); g.quadraticCurveTo(-60, 2, -140, -1); g.stroke();
  signText(g, 'CAM 2', -3, -136, STENCIL);
  box(g, 14, -160, 6, 4, '#7F1D1D');
};

// ---------------------------------------------------------------------------------------------------------------
// In the play plane: what he stands on

const lit = (c: Ctx, x: number, y: number, w: number) => { box(c, x + 1, y, w - 2, 2, LIP); box(c, x + 4, y, w * 0.35, 1, '#FFFFFF'); };
/** A plywood box, painted black, scuffed to the ply at its corners, screwed, its stencil, its lit top. */
export const stageBox = (c: Ctx, a: number, b: number, top: number, fy: number, name: string) => {
  const w = b - a, h = fy - top;
  slab(c, a, top, w, h, BLK);
  box(c, a, top, w, 3, '#3A3740');
  // (the plywood showing at the scuffed corners and edges, the screws, a boot scuff)
  box(c, a, fy - 6, 8, 6, PLY_DK); box(c, a + 1, fy - 6, 6, 1, PLY); box(c, b - 7, top + 4, 7, 5, PLY_DK); box(c, b - 6, top + 4, 5, 1, PLY);
  if (w > 40) { box(c, a + w * 0.4, top + 3, 14, 1, PLY_DK); box(c, a + 3, top + h * 0.5, 1, 10, PLY_DK); }
  c.fillStyle = '#6B7280'; for (const [dx, dy] of [[6, 8], [w - 8, 8], [6, h - 10], [w - 8, h - 10]]) if (dy > 6 && dy < h) c.fillRect(a + dx, top + dy, 2, 2);
  if (h > 30) for (let x = a + 14; x < b - 10; x += 26) c.fillRect(x, top + 8, 2, 2);
  if (name && h > 26) signText(c, name, (a + b) / 2, Math.min(fy - 12, top + 24), STENCIL);
  lit(c, a, top, w);
};
/** A plank on two stands (a one-way ledge). */
export const stagePlank = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  for (const x of [a + 12, b - 16]) { slab(c, x, top + 10, 5, fy - top - 10, STL); slab(c, x - 8, fy - 4, 21, 4, STL); box(c, x - 3, top + 30, 11, 3, STL[2]); }
  slab(c, a, top, b - a, 10, PLYR); box(c, a, top + 8, b - a, 2, PLY_DK);
  for (let x = a + 10; x < b - 6; x += 30) box(c, x, top + 4, 8, 1, PLYR[2]);
  lit(c, a, top, b - a);
};
/** Scaffold stairs (treads lit along their noses), a handrail of tube, couplers. */
export const scaffoldStairs = (c: Ctx, a: number, b: number, n: number, fy: number, top: number) => {
  const w = (b - a) / n, rise = (fy - top) / n;
  tube(c, a, fy, b, top, 6);
  tube(c, a, fy - 80, b, top - 80, 4); tube(c, a, fy - 40, b, top - 40, 3);
  for (let k = 0; k <= n; k += 3) { const x = a + k * w, y = fy - k * rise; tube(c, x, y - 82, x, y, 3); box(c, x - 3, y - 84, 7, 6, STL[2]); box(c, x - 3, y - 42, 7, 5, STL[2]); }
  for (let k = 1; k <= n; k++) {
    const x = a + (k - 1) * w, y = fy - k * rise;
    box(c, x, y, w, 6, STL[2]); box(c, x, y + 4, w, 2, STL[1]);
    for (let gx = x + 2; gx < x + w - 2; gx += 4) box(c, gx, y + 1, 2, 3, STL[3]);
    box(c, x, y, w, 1.5, LIP);
    box(c, x, y + 6, 2, rise, '#1F2937');
  }
};
/** A scaffold deck (the second floor): plywood on a steel frame (standards, ledgers, cross braces, couplers, a toe
 *  board), lit along its edge. */
export const scaffoldDeck = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  slab(c, a, top, b - a, 12, PLYR); box(c, a, top + 10, b - a, 3, PLY_DK);
  for (let x = a + 30; x < b; x += 122) box(c, x, top + 2, 1, 8, PLYR[1]);
  for (let x = a + 10; x < b; x += 110) {
    tube(c, x + 2, top + 12, x + 2, fy, 5);
    box(c, x - 2, top + 14, 9, 6, STL[2]); box(c, x - 6, fy - 4, 17, 4, STL[2]);
    if (x + 110 < b) { tube(c, x + 4, top + 18, x + 110, fy - 6, 3); tube(c, x + 4, fy - 6, x + 110, top + 18, 3); tube(c, x + 2, (top + fy) / 2, x + 112, (top + fy) / 2, 3); box(c, x + 52, (top + fy) / 2 - 3, 8, 6, STL[2]); }
  }
  lit(c, a, top, b - a);
};
/** The whole play plane of a half's plan (behind him). */
export const drawStageProps = (c: Ctx, state: GameState, plan: StagePlan) => {
  const ok = (a: number, b: number) => onScreen(state, a - 40, b + 40), E = eyeOf(state);
  // (their depth: the decks' and the planks' thickness going back, a standard at the back corner; the cases' sides)
  for (const [a, b, top] of plan.decks) if (ok(a, b)) boxSides(c, E, a, b, top, GY, 0.86, PLYR, { apron: 12, leg: 5, sideR: STL });
  for (const [a, b, top] of plan.planks) if (ok(a, b)) boxSides(c, E, a, b, top, plan.floorAt((a + b) / 2), 0.94, PLYR, { apron: 10, leg: 5, sideR: PLYR });
  for (const [a, b, top] of plan.boxes) if (ok(a, b)) boxSides(c, E, a, b, top, plan.floorAt((a + b) / 2), 0.92, BLK, { lines: [top + 3] });
  for (const [a, b, top] of plan.decks) if (ok(a, b)) scaffoldDeck(c, a, b, top, GY);
  if (plan.stairs && ok(plan.stairs.a, plan.stairs.b)) scaffoldStairs(c, plan.stairs.a, plan.stairs.b, plan.stairs.n, GY, plan.stairs.top);
  for (const [a, b, top] of plan.planks) if (ok(a, b)) stagePlank(c, a, b, top, plan.floorAt((a + b) / 2));
  for (const [a, b, top, name] of plan.boxes) if (ok(a, b)) stageBox(c, a, b, top, plan.floorAt((a + b) / 2), name);
  // (the stage floor's lit front edge: its lip, the apron's black face, glow tape every so often)
  const v0 = Math.max(plan.a, state.camera.x - 60), v1 = Math.min(plan.b, state.camera.x + CANVAS_WIDTH + 60);
  if (v0 < v1) {
    box(c, v0, GY, v1 - v0, 60, '#161519'); box(c, v0, GY + 2, v1 - v0, 6, '#22202A'); checker(c, v0, GY + 8, v1 - v0, 2, '#22202A', 0, 1);
    box(c, v0, GY, v1 - v0, 2, LIP);
    for (let x = Math.ceil(v0 / 300) * 300; x < v1; x += 300) { box(c, x, GY + 6, 3, 8, '#38BDF8'); box(c, x, GY + 6, 3, 2, '#BAE6FD'); }
    for (let x = Math.ceil(v0 / 120) * 120; x < v1; x += 120) box(c, x, GY + 20, 2, 2, '#3A3844');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// In front: the empty front row under the stage's lip

/** The front row's seat backs (world, in front of him, below the stage's lip): red velour in steps, armrests, cup
 *  holders, row A's letters, an aisle light; what the audience dropped running. */
export const drawSeats = (c: Ctx, state: GameState, a: number, b: number) => {
  const v0 = Math.max(a, state.camera.x - 40), v1 = Math.min(b, state.camera.x + CANVAS_WIDTH + 40);
  if (v0 >= v1) return;
  const y = GY + 26, V = ramp6('#7A2A33');
  box(c, v0, y + 14, v1 - v0, 60, '#0D0C10');
  for (let x = Math.floor(v0 / 54) * 54; x < v1; x += 54) {
    slab(c, x + 4, y, 44, 30, V); box(c, x + 8, y + 6, 36, 2, V[2]); box(c, x + 8, y + 14, 36, 2, V[2]); box(c, x + 8, y + 22, 36, 2, V[2]);
    // (the armrest between, its cup holder; the seat number)
    slab(c, x - 2, y + 6, 8, 26, BLK); box(c, x - 4, y + 4, 12, 4, '#3A3844'); box(c, x - 2, y + 4, 8, 1, '#5A5866');
    box(c, x + 22, y + 26, 8, 4, '#C8B48A');
    if (Math.floor(x / 54) % 8 === 0) { box(c, x + 1, y + 34, 4, 3, '#FDE68A'); box(c, x + 1, y + 34, 4, 1, '#FFFFFF'); }
    const k = hash(x * 0.013);
    // (popcorn, a foam finger, a juice box, a balloon on a string, a program: dropped running)
    if (k < 0.12) { box(c, x + 18, y - 10, 12, 12, '#F8FAFC'); box(c, x + 18, y - 10, 3, 12, '#DC2626'); box(c, x + 24, y - 10, 3, 12, '#DC2626'); box(c, x + 18, y - 13, 12, 3, '#FDE68A'); box(c, x + 20, y - 15, 3, 3, '#FFF6D0'); box(c, x + 25, y - 14, 3, 2, '#FFF6D0'); }
    else if (k < 0.2) { c.save(); c.translate(x + 28, y - 2); c.rotate(-0.5); box(c, -5, -22, 10, 24, '#8B5CF6'); box(c, -2, -30, 4, 9, '#8B5CF6'); box(c, -5, -22, 2, 24, '#B49AFA'); c.restore(); }
    else if (k < 0.26) { box(c, x + 20, y - 8, 9, 10, '#22C55E'); box(c, x + 20, y - 8, 2, 10, '#86EFAC'); box(c, x + 26, y - 13, 1.5, 6, '#F8FAFC'); }
    else if (k < 0.3) { c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 26, y); c.quadraticCurveTo(x + 20, y - 40, x + 30, y - 70); c.stroke(); c.fillStyle = '#F472B6'; c.beginPath(); c.ellipse(x + 30, y - 80, 9, 11, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FBCFE8'; c.fillRect(x + 25, y - 86, 3, 4); }
    else if (k < 0.36) { c.save(); c.translate(x + 26, y - 3); c.rotate(0.2); box(c, -8, -10, 16, 11, '#1D4ED8'); box(c, -6, -8, 12, 3, '#FDE047'); box(c, -6, -4, 8, 1, '#FFFFFF'); c.restore(); }
  }
  box(c, v0, y - 2, v1 - v0, 2, '#2A2830');
};

/** The stage door (the way out, far right): a steel door, a push bar, the EXIT sign lit red over it, STAGE DOOR
 *  stenciled. */
export const drawStageDoor = (c: Ctx, a: number, b: number, fy: number) => {
  still(c, `door-${Math.round(b - a)}`, a, fy, -150, -300, b - a + 300, 302, g => paintStageDoor(g, b - a));
};
/** (local: x from the door's left, its foot at 0) The stage door: a steel frame in the cinderblock, two steel leaves in
 *  steps (a wired-glass light in one, the push bars, kick plates, a closer arm), STAGE DOOR stenciled, CAST & CREW ONLY,
 *  the EXIT sign lit red over it; beside it the call board (the sign-in sheet, a pencil on a string, the show's call
 *  times), a fire extinguisher, NO SMOKING, the light switches, a coat hook with a crew jacket. */
const paintStageDoor = (g: Ctx, w: number) => {
  const DR = ramp6('#5A6270'), FR = ramp6('#3A3F4A');
  // (the cinderblock round it, a lit course edge on each block)
  for (let row = 0, y = -296; y < 0; y += 16, row++) for (let x = -140 - (row % 2) * 20; x < w + 150; x += 40) { const k = hash(x * 0.13 + row * 3.7); box(g, x + 1, y + 1, 38, 14, k < 0.2 ? '#22202A' : '#1A1922'); box(g, x + 1, y + 1, 38, 1, '#2C2A34'); }
  // (the frame, the leaves)
  slab(g, -10, -224, w + 20, 224, FR);
  for (let k = 0; k < 2; k++) {
    const lx = k * (w / 2), lw = w / 2;
    slab(g, lx + 2, -214, lw - 4, 214, DR);
    box(g, lx + 8, -206, lw - 16, 2, DR[4]); box(g, lx + 8, -24, lw - 16, 18, DR[1]); box(g, lx + 8, -24, lw - 16, 2, DR[4]);
    slab(g, lx + 8, -116, lw - 16, 10, ramp6('#B8BEC8')); box(g, lx + 10, -112, lw - 20, 2, '#E8ECF2');
    if (k === 0) { box(g, lx + 18, -186, lw - 36, 50, '#0A090C'); box(g, lx + 19, -185, lw - 38, 48, '#3A4A5A'); for (let yy = -184; yy < -136; yy += 6) box(g, lx + 19, yy, lw - 38, 1, '#5A6A7A'); for (let xx = lx + 22; xx < lx + lw - 18; xx += 6) box(g, xx, -185, 1, 48, '#5A6A7A'); }
  }
  box(g, w / 2 - 1, -214, 2, 214, '#1A1C22');
  slab(g, w - 40, -222, 30, 6, ramp6('#8A909A')); box(g, w - 30, -216, 4, 12, '#6A707A');
  signText(g, 'STAGE DOOR', w / 2, -196, STENCIL);
  signText(g, 'CAST & CREW', w / 2 + w / 4, -70, STENCIL); signText(g, 'ONLY', w / 2 + w / 4, -60, STENCIL);
  // (the EXIT sign over it: its box, the letters lit red, the glow spilling down the block)
  box(g, w / 2 - 38, -266, 76, 32, '#0A090C'); box(g, w / 2 - 36, -264, 72, 28, '#5A0A0A'); box(g, w / 2 - 33, -261, 66, 22, '#B91C1C'); box(g, w / 2 - 33, -261, 66, 4, '#DC2626');
  signText(g, 'EXIT', w / 2, -244, { sx: 2, sy: 2, fill: ['#FFFFFF', '#FEE2E2'] });
  checker(g, w / 2 - 40, -232, 80, 6, 'rgba(220,38,38,0.35)', 0, 1);
  // (the call board: cork, the sign-in sheet, call times, a pencil on a string)
  slab(g, -136, -210, 104, 120, PLYR);
  box(g, -130, -204, 92, 108, '#8A6A44'); checker(g, -130, -204, 92, 108, '#7A5A36', 0, 1);
  box(g, -126, -198, 40, 54, '#F8F4EC'); for (let k = 0; k < 9; k++) { box(g, -122, -192 + k * 5, 32, 1, '#9CA3AF'); if (k < 6) box(g, -120 + (k % 3) * 4, -193 + k * 5, 10 + (k * 7) % 12, 1, '#1E3A8A'); }
  signText(g, 'SIGN IN', -106, -146, STENCIL_DK);
  box(g, -80, -196, 38, 26, '#FDE68A'); for (let k = 0; k < 4; k++) box(g, -77, -191 + k * 5, 30 - (k % 2) * 8, 1, '#5A4A2A');
  box(g, -80, -164, 38, 30, '#FFFFFF'); signText(g, 'CALL 6AM', -61, -152, { sx: 1, sy: 1, fill: ['#991B1B'] });
  for (const [px, py] of [[-106, -199], [-61, -197], [-61, -165]] as [number, number][]) box(g, px - 1, py - 1, 3, 3, '#DC2626');
  g.strokeStyle = '#D6D3D1'; g.lineWidth = 1; g.beginPath(); g.moveTo(-90, -144); g.quadraticCurveTo(-94, -110, -86, -96); g.stroke(); box(g, -88, -96, 2, 12, '#FACC15');
  // (the extinguisher on its hook, its sign; NO SMOKING; the switches)
  box(g, -60, -86, 16, 10, '#B91C1C'); signText(g, 'FIRE', -52, -78, { sx: 1, sy: 1, fill: ['#FFFFFF'] });
  c2(g, -60, -70);
  box(g, w + 30, -200, 64, 40, '#F8F8F0'); box(g, w + 32, -198, 60, 36, '#FFFFFF');
  g.strokeStyle = '#B91C1C'; g.lineWidth = 3; g.beginPath(); g.arc(w + 50, -180, 12, 0, Math.PI * 2); g.moveTo(w + 42, -188); g.lineTo(w + 58, -172); g.stroke();
  box(g, w + 64, -184, 22, 3, '#1A1A1A'); signText(g, 'NO', w + 74, -170, { sx: 1, sy: 1, fill: ['#B91C1C'] });
  slab(g, w + 30, -120, 26, 40, ramp6('#9CA3AF')); for (let k = 0; k < 3; k++) box(g, w + 36 + k * 6, -106, 3, 10, k === 1 ? '#DC2626' : '#2A2830');
  // (a coat hook, a crew jacket on it: black, CREW on the back)
  box(g, w + 110, -190, 6, 6, '#6B7280');
  g.fillStyle = '#121116'; g.beginPath(); g.moveTo(w + 113, -186); g.lineTo(w + 132, -176); g.lineTo(w + 136, -100); g.lineTo(w + 92, -100); g.lineTo(w + 96, -176); g.closePath(); g.fill();
  box(g, w + 94, -176, 42, 2, '#2A2830'); signText(g, 'CREW', w + 114, -146, { sx: 1, sy: 1, fill: ['#E5E7EB'] });
};
/** A fire extinguisher (local: its top-left x, its top y). */
const c2 = (g: Ctx, x: number, y: number) => {
  const E = ramp6('#C81E1E');
  box(g, x, y + 4, 16, 48, E[1]); box(g, x + 2, y + 4, 10, 48, E[3]); box(g, x + 3, y + 6, 3, 44, E[5]);
  box(g, x + 4, y - 4, 8, 8, '#2A2830'); box(g, x + 10, y - 2, 10, 3, '#2A2830');
  box(g, x + 2, y + 20, 12, 10, '#F8F8F0'); box(g, x + 4, y + 23, 8, 1, '#3A3844');
};

/** The fallen screen: its aluminum frame bent, the white fabric heaped over the stage's lip into the pit (world, in
 *  front). */
export const drawFallenScreen = (c: Ctx, a: number, b: number, fy: number) => {
  const w = b - a;
  // (the frame: bent bars sticking up out of it)
  tube(c, a + 20, fy + 30, a + 60, fy - 30, 5, ramp6('#B8BEC8')); tube(c, a + 60, fy - 30, a + 90, fy - 22, 5, ramp6('#B8BEC8'));
  tube(c, b - 40, fy + 26, b - 20, fy - 40, 5, ramp6('#B8BEC8'));
  // (the fabric heaped, its folds in steps)
  c.fillStyle = '#A9A5B2'; c.beginPath(); c.moveTo(a - 20, fy + 50);
  for (let k = 0; k <= 16; k++) { const x = a - 20 + (k / 16) * (w + 40), hh = 10 + hash(k * 3.3) * 22; c.quadraticCurveTo(x - (w + 40) / 32, fy - hh, x, fy + 2 - hh * 0.3); }
  c.lineTo(b + 20, fy + 50); c.closePath(); c.fill();
  c.save(); c.clip();
  c.fillStyle = '#C9C6CF'; for (let k = 0; k < 14; k++) { const x = a + (k / 14) * w + hash(k) * 20, hh = 8 + hash(k * 7) * 16; c.beginPath(); c.ellipse(x, fy - hh * 0.5, 18, hh * 0.6, 0, Math.PI, 0); c.fill(); }
  c.fillStyle = '#E8E6EC'; for (let k = 0; k < 14; k++) { const x = a + (k / 14) * w + hash(k) * 20 - 4, hh = 8 + hash(k * 7) * 16; c.beginPath(); c.ellipse(x, fy - hh * 0.6, 10, hh * 0.4, 0, Math.PI, 0); c.fill(); }
  c.restore();
  for (let k = 0; k < 10; k++) { const x = a + hash(k * 13) * w; box(c, x, fy - 4, 3, 30, '#8A8696'); box(c, x + 3, fy - 4, 1, 30, '#C9C6CF'); }
  // (a torn corner of the picture still on it: a bit of the cartoon's wallpaper, a stripe of its blue)
  c.fillStyle = 'rgba(253, 230, 138, 0.35)'; c.beginPath(); c.ellipse(a + w * 0.3, fy - 6, 40, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(29, 78, 216, 0.25)'; c.beginPath(); c.ellipse(a + w * 0.7, fy - 4, 50, 7, 0, 0, Math.PI * 2); c.fill();
};

/** The projector rig: a truss tower at the stage's corner, the 1994 three-lens video projector up on it (red, green,
 *  blue). `on` its lenses lit; `broken` knocked crooked and smoking. */
export const drawProjectorRig = (c: Ctx, x: number, fy: number, f: number, on: boolean, broken: boolean) => {
  const h = 380;
  // (the truss tower: a box truss on a steel base plate weighted with sandbags, its lacing, a safety chain; the snake of
  // cables down it to a road case at its foot)
  still(c, 'rig-tower', x, fy, -70, -h - 20, 140, h + 22, g => {
    for (const dx of [-16, 16]) tube(g, dx, -h, dx, 0, 5);
    for (const dx of [-10, 10]) tube(g, dx, -h, dx, 0, 2, ramp6('#5A6070'));
    for (let y = 0; y > -h; y -= 30) { tube(g, -16, y, 16, y - 30, 2); tube(g, 16, y, -16, y - 30, 2); box(g, -18, y - 2, 36, 3, STL[2]); box(g, -18, y - 2, 36, 1, STL[4]); }
    slab(g, -40, -10, 80, 10, STL);
    for (const sx of [-34, 18]) { slab(g, sx, -24, 18, 14, ramp6('#8A7A52')); box(g, sx + 2, -20, 14, 1, '#6A5A3A'); box(g, sx + 6, -26, 6, 3, '#5A4A2A'); }
    c3(g, -14, -h + 6);
    // (the snake: a fat bundle of cable taped every so often, down the tower to the floor, off to a road case)
    g.strokeStyle = '#0A090C'; g.lineWidth = 7; g.beginPath(); g.moveTo(-22, -h + 40); g.quadraticCurveTo(-30, -h / 2, -24, -30); g.quadraticCurveTo(-26, -6, -60, -4); g.stroke();
    g.strokeStyle = '#2A2830'; g.lineWidth = 3; g.stroke();
    for (let y = -h + 60; y < -40; y += 46) { box(g, -30, y, 12, 4, '#9CA3AF'); box(g, -30, y, 12, 1, '#D1D5DB'); }
    signText(g, 'VIDEO', 0, -h / 2 + 14, STENCIL);
  });
  // (the projector: a 1994 three-gun CRT projector, a black steel case on a yoke clamped to the truss: vents, the
  // handles, VIDEO-MAX 3000, three fat lenses (red, green, blue) in a row; knocked crooked and smoking once it's blown)
  c.save(); c.translate(x, fy - h - 30); c.rotate(broken ? 0.35 : 0.12);
  tube(c, -20, 22, -20, 34, 4); tube(c, 20, 22, 20, 34, 4); tube(c, -30, 22, 30, 22, 4);
  slab(c, -46, -30, 98, 56, BLK);
  box(c, -44, -28, 94, 3, '#3A3844'); box(c, -46, 22, 98, 4, '#08070A');
  for (let k = 0; k < 8; k++) { box(c, -38 + k * 6, -20, 3, 16, '#08070A'); box(c, -38 + k * 6, -20, 1, 16, '#3A3844'); }
  for (const hx of [-30, 20]) { box(c, hx, -36, 14, 3, '#5A5866'); box(c, hx, -36, 2, 6, '#5A5866'); box(c, hx + 12, -36, 2, 6, '#5A5866'); }
  signText(c, 'VIDEO-MAX 3000', 2, 16, STENCIL);
  box(c, 34, -22, 6, 3, on ? '#22C55E' : '#14532D');
  for (let k = 0; k < 3; k++) {
    const ly = -16 + k * 15, col = ['#EF4444', '#22C55E', '#3B82F6'][k];
    box(c, 52, ly - 7, 16, 14, '#08070A'); box(c, 52, ly - 7, 16, 2, '#3A3844'); box(c, 66, ly - 6, 4, 12, '#121116');
    c.fillStyle = on ? col : mix(col, '#0A0A0D', 0.78); c.beginPath(); c.arc(68, ly, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = on ? mix(col, '#FFFFFF', 0.5) : mix(col, '#0A0A0D', 0.6); c.beginPath(); c.arc(68, ly, 3.5, 0, Math.PI * 2); c.fill();
    if (on) { c.fillStyle = '#FFFFFF'; c.fillRect(68, ly - 3, 2, 2); c.fillStyle = `rgba(255,255,255,${0.18 + 0.06 * Math.sin(f * 0.3 + k)})`; c.beginPath(); c.arc(70, ly, 11, 0, Math.PI * 2); c.fill(); }
    if (broken && k === 1) { c.strokeStyle = '#D1D5DB'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(64, ly - 4); c.lineTo(68, ly); c.lineTo(66, ly + 4); c.moveTo(68, ly); c.lineTo(72, ly - 3); c.stroke(); }
  }
  c.restore();
  if (broken) {
    // (smoke off it, a spark now and then, a melted cable end dangling)
    for (let k = 0; k < 5; k++) { const t = ((f + k * 14) % 70) / 70; c.fillStyle = `rgba(110,106,118,${0.55 * (1 - t)})`; c.beginPath(); c.arc(x + 24 + Math.sin(t * 4 + k) * 9, fy - h - 54 - t * 100, 6 + t * 16, 0, Math.PI * 2); c.fill(); }
    if (f % 90 < 5) { for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#FDE68A' : '#FFFFFF'; c.fillRect(x + 50 + hash(f + k) * 24, fy - h - 44 + hash(f * 3 + k) * 24, 2, 2); } }
    c.strokeStyle = '#0A090C'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 30, fy - h - 4); c.quadraticCurveTo(x - 40, fy - h + 30 + Math.sin(f * 0.05) * 3, x - 34, fy - h + 50); c.stroke(); box(c, x - 36, fy - h + 49, 4, 4, '#3A2A1A');
  }
};
/** A safety chain down a truss (local x, top y). */
const c3 = (g: Ctx, x: number, y: number) => { for (let k = 0; k < 10; k++) { box(g, x - 1 + (k % 2), y + k * 5, 3, 4, '#8A909A'); box(g, x + (k % 2), y + k * 5 + 1, 1, 2, '#2A2830'); } };

/** The real stage's lighting (the work lights up: soft, all over; a glow about him). */
export const realLight = (state: GameState, lights: Light[]) => {
  const p = state.player;
  return { dark: 0.44, shade: [10, 9, 14] as [number, number, number], rim: 0.5, lights: [...lights, { x: p.pos.x + p.width / 2, y: p.pos.y + 10, r: 150, a: 0.35 }] };
};
/** The work lights' and the exit sign's lights (the real stage's lighting: soft, all over). */
export const stageLights = (state: GameState, a: number, b: number, extra: Light[] = []): Light[] => {
  const out: Light[] = [];
  const v0 = state.camera.x - 500, v1 = state.camera.x + CANVAS_WIDTH + 500;
  for (let x = Math.ceil(Math.max(a, v0) / 320) * 320; x < Math.min(b, v1); x += 320) out.push({ x, y: GY - 560, r: 520, a: 0.5, color: '#FFF1D6' });
  return [...out, ...extra];
};
void BLACK; void BLACK_LT; void STEEL; void STEEL_LT;
