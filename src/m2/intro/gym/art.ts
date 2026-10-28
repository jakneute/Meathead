// The Iron Pit, drawn (Meathead 2's opening stage): Meathead 1's gym, its own walls and things (m1 stages/gym/draw:
// the two-tone cinderblock gone yellow under the tubes, the drop ceiling, the mirrors, the posters, the treadmills, the
// benches, the plyo boxes), the length of it this time; and what's new: the TV up on the wall, the duct down off the
// ceiling, the tall storage shelves, the mezzanine, his souvenirs from Meathead 1 all over the place (hung, on little
// shelves, on the floor), Meathead 1's ring (the posts rusting, the ropes sagging, MEATHEAD'S GYM on its apron with a
// letter gone), and the way out: EXIT, the arrow pointing on.
//
// Meathead 2's fake 3D over it (the visual upgrade): the room is a box seen from one eye, the middle of the screen. The
// back wall stands back at D_WALL (smaller, slower, nearer the middle); the drop ceiling and the rubber floor run from it
// out toward you in true perspective (their tile grids fanning out from the eye, the rows deeper the nearer they are),
// the tube light troffers set in the ceiling in rows going back, each throwing its pool of light on the rubber below
// (the sheen in it), dust turning in the back row's light; the end walls are the room's sides, receding to the same
// eye; the gym's floor things (benches, treadmills, the rack...) stand out on the floor at D_PROP; everything he stands
// on (the shelves, the plyo boxes, the mezzanine, the ring) is a box with its top and its side toward the eye drawn in
// depth, its front on the play line, its lit lip at his feet; and down at the bottom of the screen, nearer than him, a
// few dark things on the floor go by faster (drawGymNear). Back to front, nothing deeper over anything nearer; all
// culled by where it lands on the screen. Still art is stamped (stamp places fractional scales exactly).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawWallStill, drawProp, drawLedge, propSpan, steel, signText, floorShadow } from '../../../m1/game/stages/gym/draw';
import type { Prop } from '../../../m1/game/stages/gym/course';
import { bandedGradient, checker, steppedGlow } from '../../../m1/game/render/pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../../m1/game/render/npc/kit';
import { drawSouvenir } from '../../../m1/game/garage/draw';
import { stamp, mix, hash } from '../art/kit';
import { newsPicture } from './shots';
import { board } from './obstacles';
import { X0, Y, LEFT, RIGHT, CEIL_Y, LEDGES, DUCT, MEZZ, MEZZ_Y, SCAF, RING, EXIT_X, SOUVENIR_SPOTS, WALL_SHELVES, SQUAT_X, TRUCK_X } from './course';

type Ctx = CanvasRenderingContext2D;
const R = (x: number) => X0 + x;

// ---------------------------------------------------------------------------------------------------------------
// The eye, and the depths

/** The back wall; the gym's floor things; the back of what he stands on; the ring's back; the near floor things. */
const D_WALL = 0.8, D_PROP = 0.86, D_BOX = 0.9, D_RING = 0.87, D_NEAR = 1.14;
/** How near the ceiling and the floor come (past the screen's top and bottom). */
const D_CEIL_NEAR = 1.36, D_FLOOR_NEAR = 1.24;

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
/** Draws `fn` (in world coordinates) pushed back (or forward) to depth s about the eye. */
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
/** The world x's that land on the screen at depth s (and a margin). */
const vis = (state: GameState, E: P, s: number, m = 40): [number, number] => [E.x + (state.camera.x - m - E.x) / s, E.x + (state.camera.x + CANVAS_WIDTH + m - E.x) / s];
/** Does world x a..b at depth s land on screen? (Its full drawn span: culled by where it lands, never by its world x.) */
const seen = (state: GameState, E: P, a: number, b: number, s: number, m = 40) => { const pa = E.x + (a - E.x) * s, pb = E.x + (b - E.x) * s; return pb > state.camera.x - m && pa < state.camera.x + CANVAS_WIDTH + m; };
const path = (c: Ctx, pts: P[]) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y); c.closePath(); };
const quad = (c: Ctx, pts: P[], fill: string) => { path(c, pts); c.fillStyle = fill; c.fill(); };
/** A strip of a level plane at height y, x0..x1, from depth d0 back to d1. */
const strip = (c: Ctx, E: P, x0: number, x1: number, y: number, d0: number, d1: number, fill: string) => quad(c, [proj(E, x0, y, d0), proj(E, x1, y, d0), proj(E, x1, y, d1), proj(E, x0, y, d1)], fill);
/** n+1 depths from s0 to s1, evenly spaced in real depth (1/s): the rows of a tiled plane, deeper the nearer. */
const zRows = (s0: number, s1: number, n: number) => { const z0 = 1 / s0, z1 = 1 / s1; return Array.from({ length: n + 1 }, (_, i) => 1 / (z0 + ((z1 - z0) * i) / n)); };
/** The depth a z-step `dz` nearer (dz < 0: further back). */
const zStep = (s: number, dz: number) => 1 / (1 / s - dz);

/** A wall face at x, y0..y1, from depth d0 to d1, in stepped bands (ramp[0] at the back), inked round. */
const face = (c: Ctx, E: P, x: number, y0: number, y1: number, d0: number, d1: number, ramp: string[]) => {
  const outline = [proj(E, x, y0, d0), proj(E, x, y0, d1), proj(E, x, y1, d1), proj(E, x, y1, d0)];
  quad(c, outline, ramp[0]);
  for (let i = 1; i < ramp.length; i++) {
    const a = d0 + ((d1 - d0) * i) / ramp.length;
    quad(c, [proj(E, x, y0, a), proj(E, x, y0, d1), proj(E, x, y1, d1), proj(E, x, y1, a)], ramp[i]);
  }
  path(c, outline); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
};
/** A level face at y, x0..x1, d0..d1, in stepped bands (ramp[0] at the back), inked round. */
const plane = (c: Ctx, E: P, x0: number, x1: number, y: number, d0: number, d1: number, ramp: string[]) => {
  strip(c, E, x0, x1, y, d0, d1, ramp[0]);
  for (let i = 1; i < ramp.length; i++) strip(c, E, x0, x1, y, d0 + ((d1 - d0) * i) / ramp.length, d1, ramp[i]);
  path(c, [proj(E, x0, y, d0), proj(E, x1, y, d0), proj(E, x1, y, d1), proj(E, x0, y, d1)]); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
};
/** A box in the room (x0..x1, y0 top..y1 bottom, depth d0..d1): its side toward the eye and its top (seen from above)
 *  or its underside (from below), in depth; its front's the caller's (on the play line, d1 = 1). `flush`: an end that's
 *  up against something else in the room (its side's buried there: never drawn, wherever the eye is). */
const box3 = (c: Ctx, E: P, x0: number, x1: number, y0: number, y1: number, d0: number, d1: number, side: string[], top?: string[], flush?: 'left' | 'right') => {
  if (E.x < x0) { if (flush !== 'left') face(c, E, x0, y0, y1, d0, d1, side); }
  else if (E.x > x1) { if (flush !== 'right') face(c, E, x1, y0, y1, d0, d1, side); }
  if (top && y0 > E.y) plane(c, E, x0, x1, y0, d0, d1, top);
  if (top && y1 < E.y) plane(c, E, x0, x1, y1, d0, d1, top);
};
/** A soft shadow on the floor round a box's foot. */
const footShadow = (c: Ctx, E: P, x0: number, x1: number, d0: number, d1: number) => {
  strip(c, E, x0 - 10, x1 + 10, Y, zStep(d0, -0.03), Math.min(D_FLOOR_NEAR, zStep(d1, 0.02)), 'rgba(0,0,0,0.18)');
  strip(c, E, x0 - 4, x1 + 4, Y, zStep(d0, -0.012), d1, 'rgba(0,0,0,0.3)');
};

// ---------------------------------------------------------------------------------------------------------------
// What's where

/** Meathead 1's gym things: on the back wall (mirrors, windows, posters) and out on the floor at D_PROP. */
const PROPS: Prop[] = [
  { look: 'mirror', x: R(420), y: Y - 250 }, { look: 'poster', x: R(160), y: Y - 340, text: 'LEG DAY EVERY DAY' },
  { look: 'window', x: R(780), y: Y - 360 }, { look: 'dumbbells', x: R(600), y: Y }, { look: 'poster', x: R(1000), y: Y - 340, text: 'NO PAIN NO GAIN' },
  { look: 'treadmill', x: R(1380), y: Y }, { look: 'bike', x: R(1500), y: Y }, { look: 'treadmill', x: R(1640), y: Y }, { look: 'window', x: R(1540), y: Y - 360 },
  { look: 'poster', x: R(1220), y: Y - 340, text: 'SWEAT IS FAT CRYING' },
  { look: 'fountain', x: R(2640), y: Y }, { look: 'poster', x: R(2440), y: Y - 360, text: 'STAY LOW' },
  { look: 'window', x: R(2980), y: Y - 360 }, { look: 'poster', x: R(3250), y: Y - 340, text: 'LIFT HEAVY' },
  { look: 'bag', x: R(4020), y: Y }, { look: 'poster', x: R(4190), y: Y - 340, text: 'WIPE DOWN YOUR BENCH' },
  { look: 'mirror', x: R(4330), y: Y - 250 }, { look: 'window', x: R(4880), y: Y - 360 }, { look: 'bench', x: R(4680), y: Y },
];
const onWall = (p: Prop) => p.look === 'mirror' || p.look === 'window' || p.look === 'poster';
const WALL_SOUVENIRS = SOUVENIR_SPOTS.filter(s => s.y !== Y), FLOOR_SOUVENIRS = SOUVENIR_SPOTS.filter(s => s.y === Y);

/** The doors on the back wall. The way out's placed so that, with the camera stopped at the room's right end (where he
 *  walks up to it), it lands just past where he stops (EXIT_AT): a door at the back he walks right up to. */
const EYE_AT_RIGHT = RIGHT + 60 - CANVAS_WIDTH / 2;
const EXIT_WALL_X = EYE_AT_RIGHT + (EXIT_X - 20 - EYE_AT_RIGHT) / D_WALL;
const FRONT_WALL_X = LEFT + 26;

/** The troffers: one every 320 along, in rows going back (their depths); the I-beams between. */
const FIX_ROWS = [0.9, 1.1], FIX_W = 96, FIX_STEP = 320;
const fixX = (k: number) => k * FIX_STEP + 100;
const flickering = (k: number, f: number) => ((k % 5) + 5) % 5 === 2 && hash(Math.floor(f / 5) + k * 1.3) > 0.85;

/** The dark things on the floor nearer than him (x in their own depth's coordinates): low, so they never hide him. */
type NearKind = 'plates' | 'bells' | 'jug' | 'ball' | 'kbell' | 'towel';
const NEAR_PROPS: { x: number; kind: NearKind }[] = [
  { x: R(380), kind: 'jug' }, { x: R(900), kind: 'plates' }, { x: R(1450), kind: 'bells' }, { x: R(1990), kind: 'ball' },
  { x: R(2620), kind: 'kbell' }, { x: R(3180), kind: 'towel' }, { x: R(3720), kind: 'plates' }, { x: R(4260), kind: 'jug' },
  { x: R(4880), kind: 'bells' }, { x: R(5400), kind: 'towel' }, { x: R(5880), kind: 'ball' },
];

// ---------------------------------------------------------------------------------------------------------------
// The room

/** Behind the lot: the dark of the room. */
export const drawGymBackdrop = (c: Ctx) => { c.fillStyle = '#0E0A08'; c.fillRect(0, 0, CANVAS_WIDTH, 600); };

export const drawGymBack = (c: Ctx, state: GameState) => {
  const E = eyeOf(state);
  ceiling(c, state, E);
  floor(c, state, E);
  backWall(c, state, E);
  endWall(c, state, E, LEFT); endWall(c, state, E, RIGHT);
  beams(c, state, E);
  fixtures(c, state, E);
  floorThings(c, state, E);
  motes(c, state, E);
  if (seen(state, E, RING.x1 - 60, RING.x2 + 60, D_RING) || seen(state, E, RING.x1 - 60, RING.x2 + 60, 1)) ring(c, state, E);
};

/** The drop ceiling: tiles gone yellow and water-stained in their T-bar grid (the odd one missing, the dark up through
 *  it), going back to the wall, darker the further back, in steps. */
const CEIL_ROWS = zRows(D_WALL, D_CEIL_NEAR, 11);
const ceiling = (c: Ctx, state: GameState, E: P) => {
  const [va, vb] = vis(state, E, D_WALL);
  const a = Math.max(LEFT, va), b = Math.min(RIGHT, vb);
  if (b <= a) return;
  strip(c, E, a, b, CEIL_Y, D_WALL, D_CEIL_NEAR, '#5E584C');
  const n = CEIL_ROWS.length - 1;
  for (let i = 0; i < n; i++) {
    const s0 = CEIL_ROWS[i], s1 = CEIL_ROWS[i + 1];
    const [ra, rb] = vis(state, E, s0);
    const back = 1 - i / n, shade = back > 0.7 ? 0.42 : back > 0.45 ? 0.26 : back > 0.2 ? 0.12 : 0.04;
    for (let x = Math.floor(Math.max(LEFT, ra) / 64) * 64; x < Math.min(RIGHT, rb); x += 64) {
      const h = hash(x * 0.11 + i * 3.7), xa = Math.max(LEFT, x), xb = Math.min(RIGHT, x + 64);
      if (h > 0.975) { strip(c, E, xa, xb, CEIL_Y, s0, s1, '#0E0A08'); continue; }
      strip(c, E, xa, xb, CEIL_Y, s0, s1, mix(h > 0.5 ? '#8A8473' : '#7E7868', '#1E1A14', shade));
      if (h < 0.09) {
        const p = proj(E, x + 32, CEIL_Y, (s0 + s1) / 2), q = proj(E, x + 32, CEIL_Y, s1);
        c.fillStyle = 'rgba(120, 84, 30, 0.3)'; c.beginPath(); c.ellipse(p.x, p.y, 16 * s0, Math.max(1, Math.abs(q.y - p.y) * 0.7), 0, 0, Math.PI * 2); c.fill();
      }
    }
  }
  // (the T-bar grid: along, fanning out from the eye, and across)
  c.strokeStyle = '#A8A290'; c.lineWidth = 1; c.beginPath();
  for (let x = Math.ceil(a / 64) * 64; x < b; x += 64) { const p = proj(E, x, CEIL_Y, D_WALL), q = proj(E, x, CEIL_Y, D_CEIL_NEAR); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); }
  for (let i = 1; i < n; i++) { const p = proj(E, a, CEIL_Y, CEIL_ROWS[i]), q = proj(E, b, CEIL_Y, CEIL_ROWS[i]); c.moveTo(p.x, Math.round(p.y) + 0.5); c.lineTo(q.x, Math.round(q.y) + 0.5); }
  c.stroke();
  // (where it meets the wall: the dark of the angle, dithered off)
  strip(c, E, a, b, CEIL_Y, D_WALL, zStep(D_WALL, 0.02), 'rgba(20,14,10,0.45)');
};

/** The I-beams across the ceiling (front to back), between the lights: their sides toward the eye, their undersides. */
const beams = (c: Ctx, state: GameState, E: P) => {
  const [va, vb] = vis(state, E, D_WALL);
  for (let x = Math.floor(va / FIX_STEP) * FIX_STEP + 260; x < vb; x += FIX_STEP) {
    if (x < LEFT + 20 || x + 12 > RIGHT - 20) continue;
    const fx = E.x < x ? x : x + 12;
    if (E.x < x || E.x > x + 12) quad(c, [proj(E, fx, CEIL_Y, D_WALL), proj(E, fx, CEIL_Y, D_CEIL_NEAR), proj(E, fx, CEIL_Y + 8, D_CEIL_NEAR), proj(E, fx, CEIL_Y + 8, D_WALL)], '#2E2E34');
    strip(c, E, x, x + 12, CEIL_Y + 8, D_WALL, D_CEIL_NEAR, '#4A4A52');
    strip(c, E, x, x + 3, CEIL_Y + 8, D_WALL, D_CEIL_NEAR, '#71717A');
    // (rivets along it)
    c.fillStyle = '#8A8A94';
    for (const d of CEIL_ROWS.slice(1, -1)) { const p = proj(E, x + 7, CEIL_Y + 8, d); c.fillRect(Math.round(p.x - d), Math.round(p.y), Math.max(1, Math.round(2 * d)), Math.max(1, Math.round(1.2 * d))); }
  }
};

/** The troffers: set in the ceiling in rows going back, their diffusers lit (one flickering); the back row's light
 *  down in a faint sheet. Their pools on the floor are the floor's. */
const fixtures = (c: Ctx, state: GameState, E: P) => {
  const f = state.frame;
  for (const d of FIX_ROWS) {
    const [va, vb] = vis(state, E, d, 140);
    for (let k = Math.floor((va - 100) / FIX_STEP); fixX(k) < vb; k++) {
      const x = fixX(k);
      if (x < LEFT + 10 || x + FIX_W > RIGHT - 10) continue;
      const fl = flickering(k, f), sa = zStep(d, -0.025), sb = zStep(d, 0.025);
      if (!fl) strip(c, E, x - 26, x + FIX_W + 26, CEIL_Y, zStep(d, -0.05), zStep(d, 0.05), 'rgba(254,252,232,0.07)');
      strip(c, E, x - 5, x + FIX_W + 5, CEIL_Y, sa, sb, '#52525B');
      strip(c, E, x - 3, x + FIX_W + 3, CEIL_Y, zStep(sa, 0.004), zStep(sb, -0.004), '#71717A');
      strip(c, E, x, x + FIX_W, CEIL_Y, zStep(sa, 0.008), zStep(sb, -0.008), fl ? '#5A5A62' : '#FEFCE8');
      if (!fl) for (const t of [0.35, 0.65]) { const m = 1 / (1 / sa + (1 / sb - 1 / sa) * t); strip(c, E, x + 2, x + FIX_W - 2, CEIL_Y, zStep(m, -0.002), zStep(m, 0.002), '#FFFFFF'); }
      strip(c, E, x, x + FIX_W, CEIL_Y, zStep(sb, -0.012), zStep(sb, -0.008), fl ? '#3F3F46' : '#FDE68A');
      // (the back row: its light down to the floor, a faint sheet in two steps)
      if (d < 1 && !fl) {
        quad(c, [proj(E, x, CEIL_Y, d), proj(E, x + FIX_W, CEIL_Y, d), proj(E, x + FIX_W + 50, Y, d), proj(E, x - 50, Y, d)], 'rgba(254,252,232,0.035)');
        quad(c, [proj(E, x + 14, CEIL_Y, d), proj(E, x + FIX_W - 14, CEIL_Y, d), proj(E, x + FIX_W + 10, Y, d), proj(E, x - 10, Y, d)], 'rgba(254,252,232,0.03)');
      }
    }
  }
};

/** Dust turning in the back row's light. */
const motes = (c: Ctx, state: GameState, E: P) => {
  const f = state.frame, d = FIX_ROWS[0];
  const [va, vb] = vis(state, E, d, 140);
  const span = Y - CEIL_Y - 60;
  for (let k = Math.floor((va - 100) / FIX_STEP); fixX(k) < vb; k++) {
    const x = fixX(k);
    if (x < LEFT + 10 || x + FIX_W > RIGHT - 10 || flickering(k, f)) continue;
    for (let i = 0; i < 9; i++) {
      const h1 = hash(k * 13.1 + i * 7.7), h2 = hash(k * 5.3 + i * 3.1), h3 = hash(i * 9.9 + k);
      const wy = CEIL_Y + 40 + ((h2 * span + f * (0.08 + h3 * 0.12)) % span);
      const wx = x - 20 + h1 * (FIX_W + 40) + Math.sin(f * 0.012 + i * 2.1) * 8 * (wy - CEIL_Y) / span;
      const p = proj(E, wx, wy, d), tw = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(f * 0.05 + i * 1.7));
      c.fillStyle = `rgba(254, 249, 220, ${tw.toFixed(2)})`; c.fillRect(Math.round(p.x), Math.round(p.y), h3 > 0.7 ? 2 : 1, h3 > 0.7 ? 2 : 1);
    }
  }
};

/** The rubber floor (Meathead 1's: black flecked tiles), going back to the wall and out under you: the tiles in true
 *  perspective, the seams fanning out from the eye; the pools of light from the troffers, the sheen in them; the
 *  daylight in at the door; the shadow along the wall's foot. */
const FLOOR_ROWS = zRows(D_WALL, D_FLOOR_NEAR, 9);
const FLECKS = ['#3A3A3A', '#4A6A8A', '#8A4A4A', '#2E2E2E'];
const floor = (c: Ctx, state: GameState, E: P) => {
  const [va, vb] = vis(state, E, D_WALL);
  const a = Math.max(LEFT, va), b = Math.min(RIGHT, vb);
  if (b <= a) return;
  strip(c, E, a, b, Y, D_WALL, D_FLOOR_NEAR, '#171717');
  const n = FLOOR_ROWS.length - 1;
  for (let i = 0; i < n; i++) {
    const s0 = FLOOR_ROWS[i], s1 = FLOOR_ROWS[i + 1];
    const [ra, rb] = vis(state, E, s0);
    const back = 1 - i / n, shade = back > 0.7 ? 0.35 : back > 0.4 ? 0.18 : 0;
    for (let x = Math.floor(Math.max(LEFT, ra) / 64) * 64; x < Math.min(RIGHT, rb); x += 64) {
      const xa = Math.max(LEFT, x), xb = Math.min(RIGHT, x + 64);
      if (((Math.round(x / 64) + i) & 1) === 0) strip(c, E, xa, xb, Y, s0, s1, mix('#202020', '#080808', shade));
      for (let k = 0; k < 2; k++) {
        const h = hash(x * 0.37 + i * 11 + k * 5.1), p = proj(E, x + 6 + h * 52, Y, s0 + (s1 - s0) * hash(h * 91 + k));
        // (on the pixel grid: a fraction of a pixel would shimmer as it slides by)
        c.fillStyle = FLECKS[Math.floor(h * 4)]; c.fillRect(Math.round(p.x), Math.round(p.y), Math.max(1, Math.round(1.5 * s0)), 1);
      }
    }
  }
  c.strokeStyle = '#070707'; c.lineWidth = 1.5; c.beginPath();
  for (let x = Math.ceil(a / 64) * 64; x < b; x += 64) { const p = proj(E, x, Y, D_WALL), q = proj(E, x, Y, D_FLOOR_NEAR); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); }
  for (let i = 1; i < n; i++) { const p = proj(E, a, Y, FLOOR_ROWS[i]), q = proj(E, b, Y, FLOOR_ROWS[i]); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); }
  c.stroke();
  // (the chalk scuffed about, the odd one)
  c.fillStyle = 'rgba(231,229,228,0.5)';
  for (let x = Math.ceil(a / 210) * 210; x < b; x += 210) { const p = proj(E, x + 30, Y, FLOOR_ROWS[1 + Math.floor(hash(x) * (n - 2))]), px = Math.round(p.x), py = Math.round(p.y); c.fillRect(px, py, 3, 1); c.fillRect(px + 4, py + 1, 2, 1); }
  // (the light pools under the troffers: three steps out, and the sheen up the middle of each)
  const f = state.frame;
  for (const d of FIX_ROWS) {
    const [pa, pb] = vis(state, E, d, 200);
    for (let k = Math.floor((pa - 100) / FIX_STEP); fixX(k) < pb; k++) {
      const x = fixX(k);
      if (x < LEFT + 10 || x + FIX_W > RIGHT - 10 || flickering(k, f)) continue;
      for (let j = 0; j < 3; j++) {
        const dz = 0.05 + j * 0.05, s0 = Math.max(D_WALL, zStep(d, -dz)), s1 = Math.min(D_FLOOR_NEAR, zStep(d, dz));
        strip(c, E, Math.max(LEFT, x - 20 - j * 34), Math.min(RIGHT, x + FIX_W + 20 + j * 34), Y, s0, s1, 'rgba(254,252,232,0.045)');
      }
      strip(c, E, x + 30, x + FIX_W - 30, Y, Math.max(D_WALL, zStep(d, -0.06)), Math.min(D_FLOOR_NEAR, zStep(d, 0.06)), 'rgba(255,255,255,0.05)');
      strip(c, E, x + 42, x + FIX_W - 42, Y, Math.max(D_WALL, zStep(d, -0.04)), Math.min(D_FLOOR_NEAR, zStep(d, 0.04)), 'rgba(255,255,255,0.06)');
    }
  }
  // (daylight in at the door they came in through, across the floor)
  if (seen(state, E, FRONT_WALL_X - 60, FRONT_WALL_X + 260, D_WALL)) {
    for (let k = 0; k < 4; k++) {
      const s1 = zStep(D_WALL, 0.05 + k * 0.05);
      quad(c, [proj(E, FRONT_WALL_X, Y, D_WALL), proj(E, FRONT_WALL_X + 70, Y, D_WALL), proj(E, FRONT_WALL_X + 70 + 40 * (k + 1), Y, s1), proj(E, FRONT_WALL_X - 10 * k, Y, s1)], `rgba(254, 243, 199, ${(0.12 - k * 0.025).toFixed(3)})`);
    }
  }
  // (the shadow along the wall's foot, in two steps)
  strip(c, E, a, b, Y, D_WALL, zStep(D_WALL, 0.012), 'rgba(0,0,0,0.45)');
  strip(c, E, a, b, Y, zStep(D_WALL, 0.012), zStep(D_WALL, 0.03), 'rgba(0,0,0,0.2)');
};

/** The back wall, set back at D_WALL: Meathead 1's cinderblock in its two paints, its mirrors, windows and posters, the
 *  little shelves with his souvenirs on them and the hung ones, the TV, the two doors; hazed back a touch (the doors
 *  over the haze: they're lit). */
const CHUNK = 256;
const backWall = (c: Ctx, state: GameState, E: P) => {
  const [va, vb] = vis(state, E, D_WALL, 30);
  const x1 = Math.max(LEFT, va), x2 = Math.min(RIGHT, vb);
  if (x2 <= x1) return;
  atDepth(c, E, D_WALL, () => {
    for (let cx = Math.floor(x1 / CHUNK) * CHUNK; cx < x2; cx += CHUNK) {
      const a = Math.max(LEFT, cx), b = Math.min(RIGHT, cx + CHUNK);
      if (b <= a) continue;
      stamp(c, `m2gym-wall3-${cx}`, a - 2, CEIL_Y, b - a + 4, Y - CEIL_Y, g => { g.save(); g.beginPath(); g.rect(a, CEIL_Y, b - a, Y - CEIL_Y + 2); g.clip(); drawWallStill(g, a, b); g.restore(); });
    }
    // (the angle trim along its top)
    c.fillStyle = '#2E241E'; c.fillRect(x1, CEIL_Y, x2 - x1, 6); c.fillStyle = '#4A3E34'; c.fillRect(x1, CEIL_Y + 5, x2 - x1, 1);
    const on = (a: number, b: number) => b > x1 - 20 && a < x2 + 20;
    for (const p of PROPS) {
      if (!onWall(p)) continue;
      const [a, b] = propSpan(p);
      if (!on(a, b)) continue;
      if (p.look === 'poster') { drawProp(c, state, p); continue; }
      stamp(c, `m2gym-prop-${p.look}-${p.x}-${p.y}`, a - 12, p.y - 10, b - a + 24, 186, g => drawProp(g, state, p));
    }
    for (const s of WALL_SHELVES) if (on(s.x, s.x + s.w)) wallShelf(c, s.x, s.y, s.w);
    for (const s of WALL_SOUVENIRS) if (on(s.x - 60, s.x + 60)) { c.save(); c.translate(s.x, s.y); c.scale(0.8, 0.8); drawSouvenir(c, s.id, state.frame); c.restore(); }
    if (on(R(400), R(560))) tv(c, R(470), 250, state.frame);
    // (the haze: it's back there)
    c.fillStyle = 'rgba(16, 12, 10, 0.16)'; c.fillRect(x1, CEIL_Y, x2 - x1, Y - CEIL_Y);
    if (on(FRONT_WALL_X - 20, FRONT_WALL_X + 100)) frontDoor(c);
    if (on(EXIT_WALL_X - 20, EXIT_WALL_X + 100)) exitDoor(c, state);
  });
};

/** An end of the room (x = LEFT or RIGHT): its side wall, toward the eye, from the back wall out past the screen; the
 *  cinderblock's two paints and the stripe carried round onto it, the courses fanning out from the eye, in shadow. */
const END_DS = [D_WALL, 0.92, 1.06, 1.2, 1.4];
const endWall = (c: Ctx, state: GameState, E: P, x: number) => {
  if (x === LEFT ? E.x <= x : E.x >= x) return;
  const a = proj(E, x, Y, D_WALL).x, b = proj(E, x, Y, 1.4).x;
  if (Math.max(a, b) < state.camera.x - 10 || Math.min(a, b) > state.camera.x + CANVAS_WIDTH + 10) return;
  const bands: [number, number, string[]][] = [
    [CEIL_Y, Y - 176, ['#6E6858', '#7A7462', '#857E6A', '#8C8470']],
    [Y - 176, Y - 170, ['#9C8410', '#AE9412', '#BC9F14', '#C9A814']],
    [Y - 170, Y - 8, ['#3E0E0E', '#4A1010', '#541212', '#5C1414']],
    [Y - 8, Y, ['#0A0A0A', '#0E0E0E', '#111111', '#141414']],
  ];
  for (const [y0, y1, ramp] of bands) for (let i = 0; i < END_DS.length - 1; i++) {
    quad(c, [proj(E, x, y0, END_DS[i]), proj(E, x, y0, END_DS[i + 1]), proj(E, x, y1, END_DS[i + 1]), proj(E, x, y1, END_DS[i])], ramp[i]);
  }
  // (the courses and the joints)
  c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 1; c.beginPath();
  for (let y = CEIL_Y + 24; y < Y - 8; y += 24) { const p = proj(E, x, y, D_WALL), q = proj(E, x, y, 1.4); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); }
  const js = zRows(D_WALL, 1.4, 12);
  for (let i = 1; i < js.length; i++) for (let y = CEIL_Y + (i % 2) * 24; y < Y - 8; y += 48) { const p = proj(E, x, y, js[i]), q = proj(E, x, Math.min(Y - 8, y + 24), js[i]); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); }
  c.stroke();
  // (the corner where it meets the back wall, catching the light)
  const p = proj(E, x, CEIL_Y, D_WALL), q = proj(E, x, Y, D_WALL);
  c.strokeStyle = 'rgba(255,245,220,0.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
  // (a fire extinguisher on the left one, near the corner)
  if (x === LEFT) {
    const s = 0.88, f = proj(E, x, Y, s);
    c.fillStyle = INK; c.fillRect(f.x - 5 * s, f.y - 120 * s, 10 * s, 36 * s);
    c.fillStyle = '#B91C1C'; c.fillRect(f.x - 4 * s, f.y - 119 * s, 8 * s, 34 * s);
    c.fillStyle = '#F06A55'; c.fillRect(f.x - 3 * s, f.y - 117 * s, 2 * s, 28 * s);
    c.fillStyle = '#27272A'; c.fillRect(f.x - 2 * s, f.y - 125 * s, 4 * s, 6 * s);
  }
};

/** The gym's floor things, out on the floor at D_PROP: Meathead 1's (the benches, the treadmills, the bike, the rack,
 *  the fountain, the bag on its chain from the ceiling), his squat rack, the hand truck of protein, and the souvenirs
 *  left lying about. */
const floorThings = (c: Ctx, state: GameState, E: P) => {
  const ok = (a: number, b: number) => seen(state, E, a, b, D_PROP);
  atDepth(c, E, D_PROP, () => {
    for (const p of PROPS) {
      if (onWall(p)) continue;
      const [a, b] = propSpan(p);
      if (!ok(a - 20, b + 20)) continue;
      if (p.look === 'bag') { drawProp(c, state, p); continue; }
      stamp(c, `m2gym-prop-${p.look}-${p.x}-${p.y}`, a - 12, p.y - 196, b - a + 24, 204, g => drawProp(g, state, p));
    }
    if (ok(SQUAT_X - 100, SQUAT_X + 100)) stamp(c, 'm2gym-squat', SQUAT_X - 92, Y - 180, 184, 186, g => drawProp(g, state, { look: 'squat', x: SQUAT_X, y: Y }));
    if (ok(TRUCK_X - 40, TRUCK_X + 40)) stamp(c, 'm2gym-truck', TRUCK_X - 40, Y - 120, 80, 126, g => handTruck(g, TRUCK_X));
    for (const s of FLOOR_SOUVENIRS) if (ok(s.x - 60, s.x + 60)) { c.save(); c.translate(s.x, s.y); c.scale(0.8, 0.8); drawSouvenir(c, s.id, state.frame); c.restore(); }
  });
};

// ---------------------------------------------------------------------------------------------------------------

/** A little wall shelf a souvenir sits on: dim, no lit lip (it's on the back wall: nothing to stand on). */
const wallShelf = (c: Ctx, x: number, y: number, w: number) => {
  for (const bx of [x + 8, x + w - 14]) { c.fillStyle = '#221C18'; c.beginPath(); c.moveTo(bx, y + 6); c.lineTo(bx + 6, y + 6); c.lineTo(bx + 1, y + 24); c.lineTo(bx, y + 24); c.closePath(); c.fill(); }
  c.fillStyle = '#5A4430'; c.fillRect(x, y, w, 6);
  c.fillStyle = '#4A3826'; c.fillRect(x, y + 4, w, 2);
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - 0.5, y - 0.5, w + 1, 7);
};

/** The TV up on its bracket: the news on it (him, GUANTANAMO, the anchor), flickering. */
const tv = (c: Ctx, x: number, y: number, f: number) => {
  steel(c, x - 3, y - 50, 6, 50, '#3F3F46');
  ink(c, () => c.roundRect(x - 44, y - 4, 88, 60, 5), '#1C1C22', 1);
  c.fillStyle = '#0A0A0E'; c.fillRect(x - 38, y + 2, 76, 46);
  // (the news on it: the cutscene's own picture, shrunk)
  newsPicture(c, x - 36, y + 4, 72, 42, f, false);
  if ((f >> 3) % 17 === 0) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - 36, y + 4, 72, 42); }
  c.fillStyle = '#E11D48'; c.fillRect(x + 34, y + 50, 2, 2);
};

/** The door in from outside, by the left corner (the one they came in through): steel, kicked in, the daylight round it. */
const frontDoor = (c: Ctx) => {
  const x = FRONT_WALL_X, top = Y - 150;
  shaded(c, () => c.rect(x - 8, top - 8, 86, 158), '#27272A', x - 8, top - 8, 86, 158);
  bandedGradient(c, x, top, 70, 150, ['#FEF3C7', '#FDE68A', '#FCD34D'], 4);
  c.save(); c.translate(x, top); c.transform(0.45, 0.12, 0, 1, 0, 0);
  shaded(c, () => c.rect(0, 0, 70, 150), '#3F4F46', 0, 0, 70, 150);
  c.restore();
  ink(c, () => c.rect(x + 24, top - 24, 40, 12), '#1F2937', 0.8);
  signText(c, 'IN', x + 44, top - 15, 'bold 7px "Press Start 2P"', '#FDE68A');
};

/** The hand truck they wheeled the protein in on, left where they dropped it: four tubs stacked up it. */
const handTruck = (c: Ctx, x: number) => {
  floorShadow(c, x, 40);
  steel(c, x - 18, Y - 110, 4, 108, '#52525B'); steel(c, x - 18, Y - 4, 40, 4, '#52525B');
  for (let k = 0; k < 4; k++) {
    const y = Y - 4 - k * 26;
    shaded(c, () => c.roundRect(x - 14, y - 24, 30, 24, 3), '#18181C', x - 14, y - 24, 30, 24);
    ink(c, () => c.rect(x - 11, y - 18, 24, 10), '#B81C1C', 0.6);
    c.fillStyle = '#F8F0E0'; c.fillRect(x - 8, y - 15, 18, 1.4); c.fillRect(x - 6, y - 12, 14, 1.2);
  }
  ink(c, () => c.arc(x - 16, Y - 6, 7, 0, Math.PI * 2), '#18181B', 1);
  c.fillStyle = '#A1A1AA'; c.fillRect(x - 17, Y - 7, 2, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// What he stands on (and the duct he slides under): boxes in depth, their fronts on the play line

/** The mid layer: the mezzanine (its deck and its side running back to the wall), the shelves and plyo boxes (their
 *  tops and sides in depth, the lit lip at his feet), the duct (its side going back). */
export const drawGymMid = (c: Ctx, state: GameState) => {
  const E = eyeOf(state);
  // (the mezzanine's deck and side first, its front last: the plyo box up against it is in front of its side, and its
  // own top and buried end go back behind the lockers' front)
  const mezzOn = seen(state, E, MEZZ.x1 - 40, MEZZ.x2 + 40, D_WALL) || seen(state, E, MEZZ.x1 - 40, MEZZ.x2 + 40, 1);
  if (mezzOn) mezz3(c, E);
  for (const l of LEDGES) {
    if (!seen(state, E, l.x - 20, l.x + l.w + 20, D_BOX) && !seen(state, E, l.x - 20, l.x + l.w + 20, 1)) continue;
    footShadow(c, E, l.x, l.x + l.w, D_BOX, 1);
    const flush = l.x + l.w === MEZZ.x1 ? 'right' : l.x === MEZZ.x2 ? 'left' : undefined;
    if (l.look === 'step') {
      box3(c, E, l.x, l.x + l.w, l.y + 50, Y, D_BOX, 1, ['#6A4626', '#7A5230', '#8A5E38'], undefined, flush);
      box3(c, E, l.x, l.x + l.w, l.y, l.y + 50, D_BOX, 1, ['#7E5630', '#8E6238', '#A06E40'], ['#9A6A3C', '#B07A44', '#C48A50', '#D89C60'], flush);
      drawLedge(c, { x: l.x, y: l.y, w: l.w, look: 'step' });
    } else {
      box3(c, E, l.x, l.x + l.w, l.y, Y, D_BOX, 1, ['#1E1E24', '#26262C', '#2E2E35', '#36363E'], ['#3F3F46', '#4A4A52', '#5A5A62', '#6A6A72'], flush);
      drawLedge(c, { x: l.x, y: l.y, w: l.w, look: 'rack' });
    }
    // (the lit lip along the top's front edge: stood on)
    c.fillStyle = '#F4F4F5'; c.fillRect(l.x + 1, l.y, l.w - 2, 1.4);
  }
  if (mezzOn) mezzanine(c);
  if (seen(state, E, DUCT.x1 - 20, DUCT.x2 + 20, D_BOX) || seen(state, E, DUCT.x1 - 20, DUCT.x2 + 20, 1)) {
    // (the dark on the floor under it, the gap he goes through)
    strip(c, E, DUCT.x1 - 6, DUCT.x2 + 6, Y, zStep(D_BOX, -0.02), 1, 'rgba(0,0,0,0.4)');
    box3(c, E, DUCT.x1, DUCT.x2, CEIL_Y, DUCT.bottom, D_BOX, 1, ['#3E464C', '#4C555C', '#5A636A', '#687279']);
    duct(c);
  }
};

/**
 * The renovation's scaffold off the mezzanine's end: steel tube posts going back to the wall, cross-braced, the plank
 * deck on top (its lit lip: stood on), caution tape strung under it; the plywood partition hung off the ceiling down
 * to the deck's far end, hazard-striped, spray-painted. Broken (dive-kicked through): only the post stubs on their
 * base plates; the partition still hung there (its boards and poles are the debris, obstacles.ts).
 */
export const drawScaffold = (c: Ctx, state: GameState, broken: boolean) => {
  const E = eyeOf(state), { x1, x2, wallX, deck } = SCAF;
  if (!seen(state, E, x1 - 40, x2 + 40, D_WALL) && !seen(state, E, x1 - 40, x2 + 40, 1)) return;
  const posts = [x1 + 6, (x1 + wallX) / 2, wallX - 6];
  // (the partition: its side running back to the wall, its face)
  box3(c, E, wallX, x2, CEIL_Y, deck, D_WALL, 1, ['#4A3A26', '#5A4630', '#6A5236', '#7A5E3E'], ['#6A5236', '#7A5E3E', '#8A6A46', '#9A764E']);
  stamp(c, `m2gym-partition-${wallX}`, wallX - 2, CEIL_Y - 2, x2 - wallX + 4, deck - CEIL_Y + 4, g => {
    const w = x2 - wallX, h = deck - CEIL_Y;
    bandedGradient(g, wallX, CEIL_Y, w, h, ['#C49A60', '#B88E56', '#AC824C', '#A07642', '#946A3A'], 10);
    for (let y = CEIL_Y + 96; y < deck; y += 96) { g.fillStyle = '#6A4A26'; g.fillRect(wallX, y, w, 2); }
    for (let k = 0; k < 18; k++) { g.fillStyle = k % 2 ? '#9A6E3C' : '#D4AC70'; g.fillRect(wallX + 4 + hash(k * 3.1) * (w - 12), CEIL_Y + 8 + hash(k * 7.7) * (h - 16), 6 + hash(k) * 6, 1); }
    // (hazard stripes along its foot, a spray-painted X across it)
    for (let x = wallX; x < x2; x += 12) { g.fillStyle = '#FACC15'; g.fillRect(x, deck - 14, 6, 14); g.fillStyle = '#111'; g.fillRect(x + 6, deck - 14, 6, 14); }
    g.strokeStyle = '#B91C1C'; g.lineWidth = 5; g.lineCap = 'round';
    const my = CEIL_Y + h * 0.55;
    g.beginPath(); g.moveTo(wallX + 12, my - 30); g.lineTo(x2 - 12, my + 30); g.moveTo(x2 - 12, my - 30); g.lineTo(wallX + 12, my + 30); g.stroke();
    g.lineCap = 'butt';
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(wallX, CEIL_Y - 2, w, h + 2);
  });
  if (broken) {
    // (what's left: the post stubs, snapped off, on their base plates)
    for (const px of posts) { steel(c, px - 3, Y - 14, 6, 14, '#9CA3AF'); c.fillStyle = INK; c.fillRect(px - 8, Y - 3, 16, 3); c.fillStyle = '#52525B'; c.fillRect(px - 7, Y - 2, 14, 1); }
    return;
  }
  footShadow(c, E, x1, wallX, D_BOX, 1);
  // (the posts at the back, and the ties between front and back under the deck)
  for (const px of posts) {
    const a = proj(E, px, Y, D_BOX), b = proj(E, px, deck, D_BOX);
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    c.strokeStyle = '#71717A'; c.lineWidth = 3; c.stroke();
    const t0 = proj(E, px, Y - 70, D_BOX), t1 = proj(E, px, Y - 70, 1);
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y); c.stroke();
    c.strokeStyle = '#8A8F98'; c.lineWidth = 2; c.stroke();
  }
  // (the deck in depth: its boards' tops, their seams going back)
  box3(c, E, x1, wallX, deck, deck + 12, D_BOX, 1, ['#6A4A26', '#7A5530', '#8A6038', '#9A6C40'], ['#8A6038', '#9A6C40', '#AA7848', '#BA8450'], 'left');
  if (deck > E.y) for (let x = x1 + 22; x < wallX; x += 22) { const a = proj(E, x, deck, D_BOX), b = proj(E, x, deck, 1); c.strokeStyle = '#5A3C1E'; c.lineWidth = 1; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
  // The front: posts, braces, the tape, the deck's edge (stamped)
  stamp(c, `m2gym-scaffold-${x1}`, x1 - 10, deck - 4, wallX - x1 + 20, Y - deck + 6, g => {
    for (let i = 0; i < posts.length - 1; i++) {
      // (an X of braces between each pair of posts)
      for (const [ya, yb] of [[Y - 8, deck + 20], [deck + 20, Y - 8]] as const) {
        g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(posts[i], ya); g.lineTo(posts[i + 1], yb); g.stroke();
        g.strokeStyle = '#A1A1AA'; g.lineWidth = 2; g.stroke();
      }
    }
    // (the ledger across, the caution tape strung under the deck)
    steel(g, x1, Y - 72, wallX - x1, 5, '#9CA3AF');
    for (let x = x1 + 8; x < wallX - 8; x += 10) { g.fillStyle = (x / 10) % 2 < 1 ? '#FACC15' : '#1C1917'; g.fillRect(x, deck + 22 + Math.sin(x * 0.05) * 2, 10, 5); }
    for (const px of posts) { steel(g, px - 3, deck, 6, Y - deck, '#9CA3AF'); g.fillStyle = INK; g.fillRect(px - 8, Y - 3, 16, 3); g.fillStyle = '#52525B'; g.fillRect(px - 7, Y - 2, 14, 1); }
    // (the boards' ends along the front, a couple overhanging)
    for (let x = x1, k = 0; x < wallX; x += 44, k++) board(g, x - (k % 3 === 1 ? 4 : 0), deck, Math.min(44, wallX - x) + (k % 3 === 1 ? 4 : 0));
    steel(g, x1, deck + 6, wallX - x1, 5, '#71717A');
    // (the lit lip: stood on)
    g.fillStyle = '#F4F4F5'; g.fillRect(x1 + 1, deck, wallX - x1 - 2, 1.4);
  });
};

/** The mezzanine's deck going back to the wall (diamond plate), its side toward the eye (the steel edge, the locker
 *  bank's end panel), the rails along its sides going back. */
const mezz3 = (c: Ctx, E: P) => {
  const { x1, x2 } = MEZZ;
  if (E.x < x1 || E.x > x2) {
    const sx = E.x < x1 ? x1 : x2;
    face(c, E, sx, MEZZ_Y + 14, Y, D_WALL, 1, ['#1C2A38', '#22323F', '#283A48', '#2E4150']);
    face(c, E, sx, MEZZ_Y, MEZZ_Y + 14, D_WALL, 1, ['#2E2E34', '#3A3A42', '#46464E', '#52525B']);
  }
  plane(c, E, x1, x2, MEZZ_Y, D_WALL, 1, ['#34343B', '#3F3F46', '#4A4A52', '#56565E']);
  c.fillStyle = '#7A7A84';
  for (const d of zRows(D_WALL, 1, 5).slice(1, -1)) for (let x = x1 + 12; x < x2; x += 24) { const p = proj(E, x, MEZZ_Y, d); c.fillRect(Math.round(p.x), Math.round(p.y), Math.max(1, Math.round(2 * d)), 1); }
  // (the side rails, going back)
  for (const rx of [x1 + 3, x2 - 3]) {
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath();
    const t0 = proj(E, rx, MEZZ_Y - 42, D_WALL), t1 = proj(E, rx, MEZZ_Y - 42, 1);
    c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y);
    for (const d of [0.85, 0.9, 0.95]) { const a = proj(E, rx, MEZZ_Y, d), b = proj(E, rx, MEZZ_Y - 40, d); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); }
    c.stroke();
    c.strokeStyle = '#A1A1AA'; c.lineWidth = 1.4; c.stroke();
  }
};

/** The duct's front: galvanized, banded, riveted, a grille in it, full height so it's plainly only gone under. */
const duct = (c: Ctx) => {
  const { x1, x2, bottom } = DUCT, w = x2 - x1;
  stamp(c, `m2gym-duct-${x1}`, x1 - 4, CEIL_Y - 4, w + 8, bottom - CEIL_Y + 12, g => {
    bandedGradient(g, x1, CEIL_Y, w, bottom - CEIL_Y, ['#8A949C', '#7A848C', '#6C767E', '#5E686F', '#525B62'], 10);
    for (let x = x1; x < x2; x += 46) { g.fillStyle = '#3E464C'; g.fillRect(x, CEIL_Y, 3, bottom - CEIL_Y); g.fillStyle = '#B4BEC6'; g.fillRect(x + 3, CEIL_Y, 1, bottom - CEIL_Y); for (let y = CEIL_Y + 8; y < bottom; y += 16) { g.fillStyle = '#C8D0D6'; g.fillRect(x + 6, y, 2, 2); } }
    checker(g, x1, bottom - 40, w, 40, 'rgba(0,0,0,0.12)', 0);
    ink(g, () => g.rect(x1 + w / 2 - 30, CEIL_Y + 120, 60, 40), '#3E464C', 1);
    g.fillStyle = '#1E2428'; for (let k = 0; k < 6; k++) g.fillRect(x1 + w / 2 - 26, CEIL_Y + 126 + k * 6, 52, 3);
    for (let x = x1; x < x2; x += 16) { g.fillStyle = '#FACC15'; g.fillRect(x, bottom - 8, 8, 8); g.fillStyle = '#111'; g.fillRect(x + 8, bottom - 8, 8, 8); }
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x1, CEIL_Y - 2, w, bottom - CEIL_Y + 2);
  });
};

/** The mezzanine's front: the lockers built in under it, floor to deck; its deck's edge and the rail, NO SPOTTERS. */
const mezzanine = (c: Ctx) => {
  const { x1, x2 } = MEZZ;
  stamp(c, `m2gym-lockers-${x1}`, x1 - 2, MEZZ_Y + 10, x2 - x1 + 4, Y - MEZZ_Y - 8, g => {
    const n = Math.floor((x2 - x1) / 30), lw = (x2 - x1) / n;
    for (let k = 0; k < n; k++) {
      const lx = x1 + k * lw, c0 = k % 3 === 1 ? '#3A5A7A' : '#33536F';
      shaded(g, () => g.rect(lx + 1, MEZZ_Y + 14, lw - 2, Y - MEZZ_Y - 16), c0, lx + 1, MEZZ_Y + 14, lw - 2, Y - MEZZ_Y - 16);
      g.fillStyle = dark(c0, 0.4); for (let v = 0; v < 4; v++) g.fillRect(lx + 6, MEZZ_Y + 26 + v * 4, lw - 12, 1.4);
      g.fillStyle = '#C8C8D0'; g.fillRect(lx + lw - 8, MEZZ_Y + 80, 3, 12);
      g.fillStyle = lite(c0, 0.3); g.fillRect(lx + 2, MEZZ_Y + 15, 1.4, Y - MEZZ_Y - 18);
      g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(lx + 0.5, MEZZ_Y + 13.5, lw - 1, Y - MEZZ_Y - 14);
    }
    g.fillStyle = '#F4F4F5'; g.fillRect(x1 + lw * 2 + 4, MEZZ_Y + 40, 10, 30);
  });
  shadedTop(c, () => c.rect(x1, MEZZ_Y, x2 - x1, 14), '#52525B', x1, MEZZ_Y, x2 - x1, 14);
  c.fillStyle = '#E4E4E7'; c.fillRect(x1, MEZZ_Y, x2 - x1, 2);
  for (let x = x1 + 10; x < x2; x += 30) steel(c, x, MEZZ_Y - 40, 3, 40, '#A1A1AA');
  steel(c, x1, MEZZ_Y - 42, x2 - x1, 4, '#A1A1AA');
  shaded(c, () => c.rect(x1 + 30, MEZZ_Y + 22, 140, 20), '#FACC15', x1 + 30, MEZZ_Y + 22, 140, 20);
  signText(c, 'NO SPOTTERS', x1 + 100, MEZZ_Y + 36, 'bold 8px "Press Start 2P"', '#18181B', 'rgba(161, 98, 7, 0.5)');
};

// ---------------------------------------------------------------------------------------------------------------
// The ring

/** Meathead 1's ring, a box in the room: the mat (gone yellow, duct tape over the splits) running back to the far posts,
 *  its lamp hanging over it and the pool of light on the canvas; the apron's side toward the eye; the far posts and
 *  ropes at the back, the side ropes running back to them; the apron's front (MEATHEAD'S GYM, a letter gone); the
 *  wooden steps up at each end. */
const ROPES = [{ dy: -120, c: '#B91C1C', sag: 8 }, { dy: -84, c: '#D6D3D1', sag: 12 }, { dy: -48, c: '#1E40AF', sag: 6 }];
const ring = (c: Ctx, state: GameState, E: P) => {
  const { x1, x2, mat } = RING, W = x2 - x1, mid = (x1 + x2) / 2;
  const flick = Math.sin(state.frame * 0.7) > 0.97 ? 0.4 : 1;
  footShadow(c, E, x1, x2, D_RING, 1);
  // (the apron's side toward the eye)
  if (E.x < x1 || E.x > x2) face(c, E, E.x < x1 ? x1 : x2, mat + 10, Y, D_RING, 1, ['#0E1424', '#141B30', '#1B2540', '#1F2A48']);
  if (E.x < x1 || E.x > x2) face(c, E, E.x < x1 ? x1 : x2, mat, mat + 10, D_RING, 1, ['#8E8774', '#A8A08A', '#BCB49C', '#C8C0A8']);
  // (the mat, back to the far posts: the canvas in steps, darker back, the seams fanning out, the tape, the lamp's pool)
  plane(c, E, x1, x2, mat, D_RING, 1, ['#8E8774', '#A09880', '#B0A890', '#BCB49C', '#C8C0A8']);
  c.strokeStyle = 'rgba(90, 80, 60, 0.5)'; c.lineWidth = 1; c.beginPath();
  for (let x = x1 + 80; x < x2; x += 80) { const p = proj(E, x, mat, D_RING), q = proj(E, x, mat, 1); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); }
  c.stroke();
  for (const tx of [x1 + 150, x1 + 420]) strip(c, E, tx - 16, tx + 16, mat, 0.93, 0.955, '#A1A1AA');
  for (let j = 0; j < 3; j++) strip(c, E, mid - 90 - j * 70, mid + 90 + j * 70, mat, Math.max(D_RING, zStep(0.93, -0.02 - j * 0.025)), Math.min(1, zStep(0.93, 0.04 + j * 0.03)), `rgba(236, 252, 203, ${(0.07 * flick).toFixed(3)})`);
  // (the wooden steps up, each end: two treads, boxes in depth, lit along their tops. Before the apron's front: the far
  // end's go back behind it; their ends against the ring are buried, never drawn; the high tread's box only from the
  // low one's top up, so its side doesn't come down over the low tread's top)
  for (const side of [-1, 1]) {
    const o = side < 0 ? x1 : x2;
    for (const [w, top, bot] of [[40, Y - 17, Y], [20, mat, Y - 17]] as [number, number, number][]) {
      const a = side < 0 ? o - w : o, b = side < 0 ? o : o + w;
      box3(c, E, a, b, top, bot, 0.93, 1, ['#4A3220', '#5A3E28', '#6A4A30'], ['#7A5636', '#8E6640', '#A2764A'], side < 0 ? 'right' : 'left');
      shadedTop(c, () => c.rect(a, top, b - a, Y - top), '#7A5636', a, top, b - a, Y - top, 0.8);
      c.fillStyle = '#C8A070'; c.fillRect(a + 1, top, b - a - 2, 1.4);
    }
  }
  // (the far posts and their ropes, at the back of the mat)
  atDepth(c, E, D_RING, () => ringRopes(c, x1 + 8, x2 - 8, mat, 1));
  // (the side ropes, from the near posts back to the far ones)
  c.lineCap = 'round';
  for (const [nx, fx] of [[x1 + 6, x1 + 8], [x2 - 6, x2 - 8]]) for (const r of ROPES) {
    const a = { x: nx, y: mat + r.dy }, b = proj(E, fx, mat + r.dy, D_RING), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + r.sag };
    const curve = () => { c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(m.x, m.y, b.x, b.y); c.stroke(); };
    c.strokeStyle = INK; c.lineWidth = 5; curve(); c.strokeStyle = dark(r.c, 0.25); c.lineWidth = 3; curve(); c.strokeStyle = lite(r.c, 0.4); c.lineWidth = 1; curve();
  }
  c.lineCap = 'butt';
  // (its lamp, hanging over the middle: the cord from the ceiling, the green shade)
  atDepth(c, E, 0.93, () => {
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(mid, CEIL_Y); c.lineTo(mid, mat - 236); c.stroke();
    ink(c, () => { c.moveTo(mid - 8, mat - 238); c.lineTo(mid + 8, mat - 238); c.lineTo(mid + 30, mat - 216); c.lineTo(mid - 30, mat - 216); c.closePath(); }, '#14532D', 1);
    c.fillStyle = '#22803F'; c.fillRect(mid - 6, mat - 236, 4, 18);
    c.fillStyle = flick < 1 ? '#A3A38A' : '#FEFCE8'; c.fillRect(mid - 14, mat - 216, 28, 3);
    steppedGlow(c, mid, mat - 210, 90, '#ECFCCB', 0.08 * flick, 0.015 * flick, 5);
  });
  // (the apron's front, on the play line)
  stamp(c, `m2gym-ring-${x1}`, x1 - 4, mat - 2, W + 8, Y - mat + 4, g => {
    bandedGradient(g, x1, mat, W, 10, ['#D4CCB4', '#C8C0A8', '#B4AC94'], 3);
    g.fillStyle = '#ECE6D2'; g.fillRect(x1, mat, W, 1.4); g.fillStyle = INK; g.fillRect(x1, mat - 0.5, W, 1);
    bandedGradient(g, x1, mat + 10, W, Y - mat - 10, ['#1B2540', '#243152', '#1F2A48', '#141B30'], 4);
    for (let x = x1; x < x2; x += 60) { g.fillStyle = '#141B30'; g.fillRect(x, mat + 10, 3, Y - mat); }
    g.font = 'bold 10px "Press Start 2P"';
    const word = "MEATHEAD'S GYM", gone = word.indexOf('Y');
    let lx = mid - g.measureText(word).width / 2;
    for (let i = 0; i < word.length; i++) { if (i !== gone) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText(word[i], lx + 1, mat + 27); g.fillStyle = '#C8B060'; g.fillText(word[i], lx, mat + 26); } lx += g.measureText(word[i]).width; }
    for (const tx of [x1 + 150, x1 + 420]) { g.save(); g.translate(tx, mat + 5); for (const a of [0.5, -0.5]) { g.save(); g.rotate(a); ink(g, () => g.rect(-12, -2, 24, 4), '#A1A1AA', 0.6); g.restore(); } g.restore(); }
  });
};
const ringRopes = (c: Ctx, a: number, b: number, base: number, dim: number) => {
  for (const x of [a, b]) {
    shaded(c, () => c.rect(x - 6, base - 150, 12, 150), '#78716C', x - 6, base - 150, 12, 150);
    c.fillStyle = 'rgba(154, 52, 18, 0.6)'; c.fillRect(x - 4, base - 120, 5, 12); c.fillRect(x - 2, base - 60, 4, 9);
    for (const r of ROPES) shaded(c, () => c.roundRect(x - 10, base + r.dy - 7, 20, 16, 3), r.c, x - 10, base + r.dy - 7, 20, 16);
  }
  c.lineCap = 'round';
  for (const r of ROPES) {
    const curve = () => { c.beginPath(); c.moveTo(a, base + r.dy); c.quadraticCurveTo((a + b) / 2, base + r.dy + r.sag * 2, b, base + r.dy); c.stroke(); };
    c.globalAlpha = dim;
    c.strokeStyle = INK; c.lineWidth = 6; curve();
    c.strokeStyle = dark(r.c, 0.25); c.lineWidth = 4; curve();
    c.strokeStyle = lite(r.c, 0.4); c.lineWidth = 1; curve();
    c.globalAlpha = 1;
  }
  c.lineCap = 'butt';
};
/** The ring's near posts and bottom rope, in front of everybody (only the bottom one: it doesn't hide the fight). */
export const drawRingFront = (c: Ctx, state: GameState) => {
  const { x1, x2, mat } = RING;
  const E = eyeOf(state);
  if (!seen(state, E, x1 - 20, x2 + 20, 1)) return;
  for (const x of [x1 + 6, x2 - 6]) { shaded(c, () => c.rect(x - 7, mat - 150, 14, 150), '#78716C', x - 7, mat - 150, 14, 150); for (const r of ROPES) shaded(c, () => c.roundRect(x - 11, mat + r.dy - 7, 22, 18, 3), r.c, x - 11, mat + r.dy - 7, 22, 18); }
  c.lineCap = 'round';
  const r = ROPES[2], curve = () => { c.beginPath(); c.moveTo(x1 + 6, mat + r.dy); c.quadraticCurveTo((x1 + x2) / 2, mat + r.dy + r.sag * 2, x2 - 6, mat + r.dy); c.stroke(); };
  c.strokeStyle = INK; c.lineWidth = 7; curve(); c.strokeStyle = dark(r.c, 0.25); c.lineWidth = 5; curve(); c.strokeStyle = r.c; c.lineWidth = 3; curve(); c.strokeStyle = lite(r.c, 0.45); c.lineWidth = 1; curve();
  c.lineCap = 'butt';
};

// ---------------------------------------------------------------------------------------------------------------
// The way out

/** The way out, in the back wall: a steel door (shut and chained till the ring's done), EXIT lit over it, the arrow
 *  pointing on. (Drawn at the wall's depth: EXIT_WALL_X.) */
let exitOpen = 0;
export const setExitOpen = (k: number) => { exitOpen = k; };
const exitDoor = (c: Ctx, state: GameState) => {
  const x = EXIT_WALL_X, top = Y - 160, w = 80;
  shaded(c, () => c.rect(x - 8, top - 8, w + 16, 168), '#27272A', x - 8, top - 8, w + 16, 168);
  bandedGradient(c, x, top, w, 160, ['#FEF9C3', '#FEF3C7', '#FDE68A'], 3);
  const lw = w * (1 - exitOpen * 0.85);
  shaded(c, () => c.rect(x, top, lw, 160), '#52525B', x, top, lw, 160);
  shadedTop(c, () => c.rect(x + 1, top + 134, lw - 2, 24), '#A1A1AA', x + 1, top + 134, lw - 2, 24, 0.8);
  if (lw > 40) { shaded(c, () => c.rect(x + lw - 16, top + 80, 10, 6), '#D4D4D8', x + lw - 16, top + 80, 10, 6, 0.8); }
  if (exitOpen <= 0) {
    c.strokeStyle = '#9CA3AF'; c.lineWidth = 3;
    for (let i = 0; i <= 8; i++) { const u = i / 8; c.beginPath(); c.ellipse(x + u * w, top + 70 + Math.sin(u * Math.PI) * 14, 4, 2.5, (i % 2) * Math.PI / 2, 0, Math.PI * 2); c.stroke(); }
    shaded(c, () => c.roundRect(x + w / 2 - 7, top + 82, 14, 14, 2), '#CA8A04', x + w / 2 - 7, top + 82, 14, 14);
  }
  // (once it's open, the daylight out across the floor in front of it)
  if (exitOpen > 0) for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(254, 243, 199, ${((0.16 - k * 0.035) * exitOpen).toFixed(3)})`; c.fillRect(x - k * 10, Y - 2 + k * 3, w + k * 20, 3); }
  // The EXIT sign over it: lit red, the arrow pointing right (blinking once it's open)
  const on = exitOpen > 0 ? (state.frame >> 4) % 2 === 0 : false;
  shaded(c, () => c.rect(x - 4, top - 40, w + 8, 26), '#18181B', x - 4, top - 40, w + 8, 26);
  c.fillStyle = exitOpen > 0 ? '#EF4444' : '#7F1D1D'; c.font = 'bold 12px "Press Start 2P"'; c.textAlign = 'left';
  c.fillText('EXIT', x + 4, top - 21);
  c.fillStyle = on || exitOpen <= 0 ? (exitOpen > 0 ? '#FCA5A5' : '#7F1D1D') : '#EF4444';
  c.beginPath(); c.moveTo(x + 60, top - 34); c.lineTo(x + 78, top - 27); c.lineTo(x + 60, top - 20); c.closePath(); c.fill(); c.fillRect(x + 52, top - 30, 9, 6);
  if (exitOpen > 0) steppedGlow(c, x + w / 2, top - 27, 70, '#EF4444', 0.12, 0.02, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// In front

/** A ceiling tile they came down through (on the ceiling's plane over the play line): knocked out, the dark up in
 *  there, one hanging by a corner (k: how fresh, 1 down to 0). */
export const drawCeilingHole = (c: Ctx, state: GameState, x: number, frame: number, k: number) => {
  const E = eyeOf(state), s0 = zStep(1, -0.05), s1 = zStep(1, 0.05);
  strip(c, E, x - 30, x + 30, CEIL_Y, s0, s1, '#0E0A08');
  const a = proj(E, x - 30, CEIL_Y, s1), b = proj(E, x + 30, CEIL_Y, s1);
  c.fillStyle = '#A8A290'; c.fillRect(a.x, a.y - 1, b.x - a.x, 1.5);
  c.save(); c.translate(b.x, b.y); c.rotate(1.1 + Math.sin(frame * 0.2) * 0.05 * k);
  c.fillStyle = '#8A8473'; c.fillRect(0, 0, 28 * s1, 6); c.fillStyle = '#5A5444'; c.fillRect(0, 5, 28 * s1, 1); c.restore();
};

/** The dark things on the floor nearer than him, at D_NEAR, going by faster than he does: low (never over him). */
export const drawGymNear = (c: Ctx, state: GameState) => {
  const E = eyeOf(state);
  atDepth(c, E, D_NEAR, () => {
    for (const n of NEAR_PROPS) if (seen(state, E, n.x - 40, n.x + 40, D_NEAR)) stamp(c, `m2gym-near-${n.kind}-${n.x}`, n.x - 40, Y - 34, 80, 40, g => nearThing(g, n.x, n.kind));
  });
};
const NS = '#140F0C', NR = '#3E3530';
const nearThing = (g: Ctx, x: number, kind: NearKind) => {
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(x, Y - 1, 30, 4, 0, 0, Math.PI * 2); g.fill();
  const rim = (a: number, y: number, w: number) => { g.fillStyle = NR; g.fillRect(a, y, w, 1); };
  switch (kind) {
    case 'plates': for (let k = 0; k < 3; k++) { const w = 48 - k * 9, y = Y - 6 - k * 6; g.fillStyle = INK; g.fillRect(x - w / 2 - 1, y - 1, w + 2, 7); g.fillStyle = NS; g.fillRect(x - w / 2, y, w, 5); rim(x - w / 2 + 2, y, w - 4); g.fillStyle = '#241C18'; g.fillRect(x - 3, y + 1, 6, 3); } break;
    case 'bells': for (const dx of [-14, 14]) { for (const hx of [dx - 11, dx + 4]) { g.fillStyle = INK; g.fillRect(x + hx - 1, Y - 19, 9, 19); g.fillStyle = NS; g.fillRect(x + hx, Y - 18, 7, 17); rim(x + hx + 1, Y - 18, 5); } g.fillStyle = '#2A2420'; g.fillRect(x + dx - 4, Y - 11, 8, 3); } break;
    case 'jug': g.fillStyle = INK; g.beginPath(); g.roundRect(x - 11, Y - 27, 22, 27, 5); g.fill(); g.fillStyle = NS; g.beginPath(); g.roundRect(x - 10, Y - 26, 20, 25, 4); g.fill(); g.fillStyle = 'rgba(59,130,246,0.14)'; g.fillRect(x - 8, Y - 16, 16, 14); rim(x - 7, Y - 26, 14); g.fillStyle = '#241C18'; g.fillRect(x - 4, Y - 28, 8, 3); break;
    case 'ball': g.fillStyle = INK; g.beginPath(); g.arc(x, Y - 13, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = NS; g.beginPath(); g.arc(x, Y - 13, 13, 0, Math.PI * 2); g.fill(); g.strokeStyle = NR; g.lineWidth = 1; g.beginPath(); g.arc(x, Y - 13, 11, Math.PI * 1.15, Math.PI * 1.7); g.stroke(); g.strokeStyle = '#241C18'; g.beginPath(); g.moveTo(x - 13, Y - 13); g.lineTo(x + 13, Y - 13); g.stroke(); break;
    case 'kbell': g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(x, Y - 19, 7, Math.PI, 0); g.stroke(); g.strokeStyle = NS; g.lineWidth = 4; g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(x, Y - 10, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = NS; g.beginPath(); g.arc(x, Y - 10, 10, 0, Math.PI * 2); g.fill(); g.strokeStyle = NR; g.lineWidth = 1; g.beginPath(); g.arc(x, Y - 10, 8, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); break;
    case 'towel': g.fillStyle = INK; g.beginPath(); g.ellipse(x - 8, Y - 5, 18, 7, 0, Math.PI, 0); g.ellipse(x + 10, Y - 4, 14, 6, 0, Math.PI, 0); g.fill(); g.fillStyle = '#1C1816'; g.beginPath(); g.ellipse(x - 8, Y - 5, 17, 6, 0, Math.PI, 0); g.ellipse(x + 10, Y - 4, 13, 5, 0, Math.PI, 0); g.fill(); rim(x - 18, Y - 10, 14); break;
  }
};
