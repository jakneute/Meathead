// The temple, painted: the Temple of the Jaguar seen from behind, where the illusion shows how it's done. A black-box
// building in depth (the far block wall, the plywood floor going back to it, the lighting truss overhead), the ride's
// fiberglass facade from the back (raw shell, stud frames, kickers and sandbags, the show lights leaking through its
// seams), the crew's clutter; then the tricks themselves at his level (the catapult, the dart trap and its leaf
// blower, the Pepper's ghost pane and the fog machine, the snake on its ram), the scaffolds he climbs, and the loading
// station: the long line snaking back into the dark, the operators' booth, the Jaguar Express on its track.
// The SNES pass: the far wall's high works (the duct, a cable tray, the gallery, vents), the set's catwalk behind the
// facade (show lights on its rail in the cue's colors, hazers, cable runs), the facade's backs worked over (wire runs,
// the bits' speakers, foam patches, the crew's names in marker), more of the crew's corners (stacked flats, the bone
// tote, the scenic paint table and a half-carved foam head, the ghost's projector, the spare serpent heads, the dimmer
// racks), real boulders (stamped turns), carved dart faces, the station's gates, grouper and height check; the people
// on costume.ts (castArt.ts).
//
// Depth is done the intro's way (intro/art/upper.ts): a point `d` back is drawn d of the way from where he's looking
// (the eye) to where it'd be up front, so whole layers are just drawn under that scale (inDepth) and parallax, shrink
// and stand on the floor going back for free. A little haze goes over everything past each step back. Indoors: no time
// of day; work lights and the ride's show light, through the scene lighting (templeLighting).

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { saidOver } from '../section';
import { drawRideCart, JAGUAR_EXPRESS } from '../rideCart';
import { guestAt, drawGuest, type Guest } from '../queue/crowd';
import {
  INK, box, slab, pole, ball, sign, rampOf, dark, lite, mix, checker, bandedGradient, steppedGlow, stamp, hash,
} from '../../intro/art/kit';
import {
  x1, T, CATAPULT_X, DART_WALL, DART_TOP, SNAKE_WALL, SNAKE_TOP, SNAKE_Y, SNAKE_REACH, STATION_X, CART_X, BOOTH_X, END_WALL,
  GHOST_X, FOG_X, LEDGES, type Temple, crewed, DART_TELL, dartY, SNAKE_CYCLE, snakeOut, GUESTS, SEAT,
} from './layout';
import { signAt, signText, plank, enamel, stencil, print, led, graffiti, gilt } from '../letters';
import { drawBoneSuit, drawFlungGuest } from './castArt';
import { drawGuest as drawParkGuest } from '../../frontier/town/people';

type Ctx = CanvasRenderingContext2D;
export interface Eye { x: number; y: number }
/** The labels on the crew's kit: printed small in the park's letters (decals, tape, stencils), never stock type. */
const text = (c: Ctx, s: string, x: number, y: number, col: string, size = 4, _align?: CanvasTextAlign, _shadow?: string | null) => signAt(c, s, x, y, size, print(size, col));

// ---------------------------------------------------------------------------------------------------------------
// Depth

/** Where he's looking from (the intro's eye: the middle of the screen, a little above halfway). */
export const eyeOf = (state: GameState): Eye => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 });
/** Draws `paint` as if `d` back (1: his plane; under 1, further; over 1, nearer). */
export const inDepth = (c: Ctx, eye: Eye, d: number, paint: () => void) => {
  c.save(); c.translate(eye.x * (1 - d), eye.y * (1 - d)); c.scale(d, d); paint(); c.restore();
};
/** A point `d` back, where it's drawn. */
export const at = (eye: Eye, x: number, y: number, d: number): [number, number] => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];
/** The x span (in that layer's own units) that's on screen at depth d. */
export const spanAt = (eye: Eye, d: number, pad = 80): [number, number] => [eye.x - CANVAS_WIDTH / 2 / d - pad, eye.x + CANVAS_WIDTH / 2 / d + pad];
/** Where the floor `d` back is drawn (its y). */
export const floorAt = (eye: Eye, d: number, y = GY) => eye.y + (y - eye.y) * d;
const quad = (c: Ctx, col: string, a: [number, number], b: [number, number], cc: [number, number], dd: [number, number]) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(dd[0], dd[1]); c.closePath(); c.fill();
};
const seg = (c: Ctx, a: [number, number], b: [number, number], col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };

/**
 * Something solid at his level (a wall, a box), from x to x + w, `top` down to `bottom`: its front, and going back
 * from it to `back` (its top, if he's above it; the side that faces him), the top's front edge lit (somewhere to stand).
 */
export const block3d = (c: Ctx, eye: Eye, x: number, top: number, w: number, bottom: number, col: string, back = 0.9,
  face?: (g: Ctx) => void, opts: { lip?: boolean; key?: string; part?: 'back' | 'front'; at?: number } = {}) => {
  const r = rampOf(col);
  // (its front can stand back from his plane: `at` deep)
  const fd = opts.at ?? 1, mid = (fd + back) / 2;
  // (drawn in two goes where something stands right beside it: its side and top (going back) first, then whatever's
  // beside it, nearer the eye than that side, then its front over the lot)
  if (opts.part !== 'front') {
    // (the side that faces him)
    const side = eye.x < x ? x : eye.x > x + w ? x + w : null;
    if (side !== null) {
      const a1 = at(eye, side, top, back), b1 = at(eye, side, bottom, back);
      quad(c, r[1], at(eye, side, top, fd), a1, b1, at(eye, side, bottom, fd));
      quad(c, 'rgba(10, 6, 2, 0.3)', at(eye, side, top, mid), a1, b1, at(eye, side, bottom, mid));
      seg(c, a1, b1, INK);
    }
    // (its top, if he's above it)
    if (eye.y < top) {
      quad(c, r[3], at(eye, x, top, fd), at(eye, x + w, top, fd), at(eye, x + w, top, back), at(eye, x, top, back));
      seg(c, at(eye, x, top, back), at(eye, x + w, top, back), r[2], 2);
    }
  }
  if (opts.part === 'back') return;
  const front = () => {
    if (face && opts.key) stamp(c, opts.key, x - 2, top - 2, w + 4, bottom - top + 4, face);
    else if (face) face(c);
    else slab(c, x, top, w, bottom - top, col);
    if (opts.lip !== false) { box(c, x, top, w, 2, r[4]); box(c, x, top + 2, w, 2, r[3]); }
  };
  if (fd === 1) front(); else inDepth(c, eye, fd, front);
};

// ---------------------------------------------------------------------------------------------------------------
// The colors

const WOOD = '#9A7646', PLY = '#B08A58', STEEL = '#7D8794', FIBER = '#6E6453';
const TAPE_Y = '#E8C130', TAPE_W = '#D8D4CC';
/** The ride's own show light coming through the seams of the set, slowly going round its colors. */
const SHOW = ['#F59E0B', '#22C55E', '#DC2626', '#8B5CF6', '#F97316', '#14B8A6'];
const showAt = (i: number, f: number) => {
  const t = f / 240 + i * 1.7, k = t - Math.floor(t);
  const a = SHOW[Math.floor(t) % SHOW.length], b = SHOW[(Math.floor(t) + 1) % SHOW.length];
  // (held, then a quick cross-fade, in steps: a lighting cue, not a smooth blend)
  return k < 0.8 ? a : mix(a, b, Math.round(((k - 0.8) / 0.2) * 4) / 4);
};

const WALL_D = 0.5, FACADE_D = 0.78, PROPS_D = 0.9, TRUSS_D = 0.62;
/** The room's two ends (the back door's wall, the end wall): planes going straight back from his plane to the far wall. */
const ROOM_L = T + 10, ROOM_R = END_WALL;
/** Where the rigging (chains, cables) goes up to: out of sight above the screen, however high he's climbed. */
const CHAIN_TOP = GY - 1700;
/** A chain hung from y0 down to y1 (links: 4 on, 2 off). */
const chain = (c: Ctx, x: number, y0: number, y1: number, col: string) => {
  c.strokeStyle = col; c.lineWidth = 2; c.setLineDash([4, 2]); c.beginPath(); c.moveTo(x + 1, y0); c.lineTo(x + 1, y1); c.stroke(); c.setLineDash([]);
};
const HAZE = [0.52, 0.56, 0.6, 0.66, 0.74, 0.84, 0.95];
/** The facade's panels: where each starts (front-plane units at FACADE_D), its look. */
const PANELS: { x: number; w: number; kind: number }[] = [];
for (let x = T + 120, i = 0; x < STATION_X - 160; i++) { const w = 300 + Math.round(hash(i * 3.1) * 140); PANELS.push({ x, w, kind: i % 5 }); x += w + 22; }

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen): the dark of the building's height

export const drawTempleBackdrop = (c: Ctx, _state: GameState) => {
  bandedGradient(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#050302', '#0E0907', '#160F0A'], 10);
};

// ---------------------------------------------------------------------------------------------------------------
// The far wall: painted block, conduit, the odd exit sign and fuse panel (stamped, 512 wide)

const paintWallTile = (g: Ctx, x: number, i: number) => {
  const top = GY - 1300;
  box(g, x, top, 512, GY - top, '#15100D');
  // (block courses, dark on dark)
  g.fillStyle = '#0D0907';
  for (let y = top; y < GY; y += 16) {
    g.fillRect(x, y, 512, 1);
    for (let bx = ((y / 16) % 2) * 16; bx < 512; bx += 32) g.fillRect(x + bx, y, 1, 16);
  }
  checker(g, x, GY - 120, 512, 2, '#1E1712');
  box(g, x, GY - 118, 512, 118, '#1A1410');
  // (conduit along it, stepped round)
  for (const cy of [GY - 520, GY - 540]) { box(g, x, cy, 512, 2, '#4A4A4E'); box(g, x, cy + 2, 512, 2, '#2E2E32'); box(g, x, cy + 4, 512, 1, '#151518'); }
  for (let k = 0; k < 4; k++) { box(g, x + 30 + k * 128, GY - 546, 6, 14, '#3A3A3E'); }
  // (up high, the building's works: the supply duct (galvanized, banded seams, hung on straps), a cable tray under it,
  // the gallery along the wall (its grating, the rail, a ladder up to it), louvered vents; dim, it's all way back)
  {
    const dy = GY - 690, dr = rampOf('#5E646C');
    for (let k = 0; k < 4; k++) box(g, x + 40 + k * 128, GY - 760, 2, 70, '#2A2C30');
    box(g, x, dy - 1, 512, 42, INK);
    box(g, x, dy, 512, 6, dr[3]); box(g, x, dy + 6, 512, 14, dr[2]); box(g, x, dy + 20, 512, 12, dr[1]); box(g, x, dy + 32, 512, 8, dr[0]);
    checker(g, x, dy + 6, 512, 1, dr[3]); checker(g, x, dy + 32, 512, 1, dr[1]);
    for (let k = 0; k < 512; k += 64) { box(g, x + k, dy, 3, 40, dr[0]); box(g, x + k + 3, dy, 1, 40, dr[4]); }
    // (a branch dropping off it to a diffuser, every other tile)
    if (i % 2 === 0) { slab(g, x + 300, dy + 40, 30, 50, dr[1], { edge: 2 }); slab(g, x + 290, dy + 90, 50, 12, dr[2], { edge: 2 }); for (let k = 0; k < 4; k++) box(g, x + 294 + k * 11, dy + 94, 6, 2, '#141416'); }
    // (the cable tray: a ladder of steel, cable bundles sagging over its rungs)
    const ty = GY - 620;
    box(g, x, ty, 512, 2, '#4A4E56'); box(g, x, ty + 10, 512, 2, '#3A3E46');
    for (let k = 0; k < 512; k += 24) box(g, x + k, ty, 2, 12, '#33363E');
    for (let k = 0; k < 512; k += 4) box(g, x + k, ty + 3 + Math.round(Math.sin((x + k) * 0.05) * 1.5), 4, 4, (k / 4) % 3 ? '#121214' : '#1E1E24');
    // (the gallery: grating seen from below, a toe board, the rail; the ladder up to it in some)
    const gy = GY - 820;
    box(g, x, gy, 512, 8, '#2A2C30'); for (let k = 0; k < 512; k += 6) box(g, x + k, gy + 2, 2, 5, '#17181B');
    box(g, x, gy - 36, 512, 3, '#4A4E56'); box(g, x, gy - 18, 512, 2, '#3A3E46'); box(g, x, gy - 8, 512, 8, '#33363E');
    for (let k = 0; k < 512; k += 96) box(g, x + k + 10, gy - 36, 3, 36, '#4A4E56');
    if (i % 3 === 1) { for (const lx of [x + 420, x + 446]) box(g, lx, gy, 3, 260, '#3A3E46'); for (let ly = gy + 12; ly < gy + 260; ly += 14) box(g, x + 420, ly, 29, 2, '#33363E'); }
    // (a louvered vent, in the block)
    const vx = x + 270 + Math.round(hash(i * 2.1) * 150), vy = GY - 470;
    slab(g, vx, vy, 70, 44, '#2A2C30', { edge: 2 }); for (let k = 0; k < 6; k++) { box(g, vx + 4, vy + 4 + k * 6, 62, 3, '#3E424A'); box(g, vx + 4, vy + 7 + k * 6, 62, 1, '#141416'); }
  }
  const h = hash(i * 7.3);
  if (h < 0.35) {
    // a fuse panel, a conduit down to it
    box(g, x + 200, GY - 532, 4, 230, '#3A3A3E');
    slab(g, x + 170, GY - 300, 70, 100, '#5B6068', { edge: 4 });
    box(g, x + 178, GY - 290, 54, 6, '#E8C130'); signAt(g, 'DANGER', x + 205, GY - 260, 6, enamel(6, '#E8C130', INK));
    signAt(g, '480V', x + 205, GY - 248, 6, enamel(6, '#D8D4CC', INK));
  } else if (h < 0.6) {
    // stenciled big on the block: which stage this is
    signAt(g, 'STAGE 3', x + 256, GY - 380, 24, stencil(24, '#2A221C', '#5A5048', i));
    signAt(g, 'NO SMOKING ON THE FLOOR', x + 256, GY - 350, 8, stencil({ sx: 2, sy: 2 }, '#2A221C', '#5A5048', i + 1));
  } else {
    // a big roll-up door, shut
    slab(g, x + 120, GY - 330, 240, 330, '#3A3E44', { edge: 4 });
    for (let y = GY - 320; y < GY; y += 10) box(g, x + 124, y, 232, 2, '#2A2D32');
    sign(g, x + 190, GY - 360, 100, 14, '#B91C1C', 'KEEP CLEAR', '#F8FAFC', 6, INK, stencil(6, '#F8FAFC'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floor (painted black ply, seams converging, tape spike marks), in perspective from the far wall to under him

const drawFloor = (c: Ctx, eye: Eye, L: number, R: number) => {
  const yw = floorAt(eye, WALL_D), bottom = floorAt(eye, 1.6);
  const cols = ['#120E0B', '#17120F', '#1C1612', '#211A15', '#261F19', '#2B231C', '#30271F'];
  const ds = [WALL_D, 0.6, 0.7, 0.8, 0.9, 1.0, 1.15, 1.6];
  for (let i = 0; i < cols.length; i++) {
    const ya = floorAt(eye, ds[i]), yb = floorAt(eye, ds[i + 1]);
    box(c, L, ya, R - L, yb - ya + 1, cols[i]);
    if (i) checker(c, L, Math.floor(ya), R - L, 2, cols[i - 1]);
  }
  // (the sheets' long seams, going back to the wall)
  const [s0, s1] = spanAt(eye, WALL_D, 0);
  c.strokeStyle = 'rgba(0, 0, 0, 0.45)'; c.lineWidth = 1;
  c.beginPath();
  for (let x = Math.floor(s0 / 96) * 96; x < s1; x += 96) { const a = at(eye, x, GY, WALL_D), b = at(eye, x, GY, 1.6); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  c.stroke();
  // (and the butt joints across)
  for (const d of [0.57, 0.66, 0.77, 0.9, 1.06, 1.28]) box(c, L, floorAt(eye, d), R - L, 1, 'rgba(0, 0, 0, 0.5)');
  // (scuffs, lit where the work lights fall)
  c.fillStyle = 'rgba(255, 230, 190, 0.035)';
  for (let x = Math.floor(s0 / 230) * 230; x < s1; x += 230) { const p = at(eye, x + hash(x) * 120, GY, 0.62 + hash(x * 1.3) * 0.5); c.fillRect(p[0], p[1], 30, 2); }
  // (spike marks: tape, where things go)
  for (let x = Math.floor(s0 / 370) * 370; x < s1; x += 370) {
    const d = 0.7 + hash(x * 0.37) * 0.35, p = at(eye, x + 40, GY, d), s = d * 6;
    const col = hash(x) < 0.5 ? TAPE_Y : hash(x) < 0.75 ? TAPE_W : '#4ADE80';
    box(c, p[0] - s, p[1], s * 2, Math.max(1, s * 0.3), col); box(c, p[0] - s * 0.15, p[1] - s * 0.3, s * 0.3, s * 0.9, col);
  }
  void bottom; void yw;
};

// ---------------------------------------------------------------------------------------------------------------
// The room's ends: the back door's wall and the end wall, each a plane going straight back from his plane to the far
// wall (only the one facing the eye shows): painted block, its courses, the conduit and the dado band carried round
// from the far wall, all going back to the same point as the floor's seams

const drawRoomEnd = (c: Ctx, eye: Eye, X: number) => {
  if (X === ROOM_L ? eye.x <= X : eye.x >= X) return;
  const p = (y: number, d: number) => at(eye, X, y, d);
  // (where it lands on screen: cull by that, not by where it stands)
  const xs = [p(GY, 1)[0], p(GY, WALL_D)[0]];
  const L = eye.x - CANVAS_WIDTH / 2 - 4, R = eye.x + CANVAS_WIDTH / 2 + 4;
  if (Math.max(...xs) < L || Math.min(...xs) > R) return;
  const ds = [1, 0.9, 0.8, 0.7, 0.6, WALL_D];
  const cols = ['#2E2620', '#29221C', '#241D18', '#1E1814', '#191310'];
  for (let i = 0; i < cols.length; i++) quad(c, cols[i], p(CHAIN_TOP, ds[i]), p(CHAIN_TOP, ds[i + 1]), p(GY, ds[i + 1]), p(GY, ds[i]));
  // (the dado band low down, as on the far wall)
  quad(c, '#1F1813', p(GY - 118, 1), p(GY - 118, WALL_D), p(GY, WALL_D), p(GY, 1));
  seg(c, p(GY - 119, 1), p(GY - 119, WALL_D), '#2A221C', 2);
  // (block courses: every 32 up, going back)
  // (each course's top lit a little, its joint dark)
  c.strokeStyle = '#3A3029'; c.lineWidth = 1; c.beginPath();
  for (let y = GY - 31; y > CHAIN_TOP; y -= 32) { const a = p(y, 1), b = p(y, WALL_D); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  c.stroke();
  c.strokeStyle = '#0F0B09'; c.lineWidth = 1; c.beginPath();
  for (let y = GY - 32; y > CHAIN_TOP; y -= 32) { const a = p(y, 1), b = p(y, WALL_D); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  // (and the joints, staggered: up the wall at steps going back)
  for (let i = 0; i < 12; i++) {
    const d = 1 - (1 - WALL_D) * (i + 0.5) / 12;
    for (let y = GY - 32 * (i % 2 ? 1 : 2); y > GY - 900; y -= 64) { const a = p(y, d), b = p(y + 32, d); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  }
  c.stroke();
  // (the conduit, carried round from the far wall)
  for (const cy of [GY - 520, GY - 540]) { seg(c, p(cy, 1), p(cy, WALL_D), '#4A4A4E', 2); seg(c, p(cy + 2, 1), p(cy + 2, WALL_D), '#26262A', 2); }
  // (the corner with the far wall, and the edge where it's cut off at his plane)
  seg(c, p(CHAIN_TOP, WALL_D), p(GY, WALL_D), '#0A0706', 2);
  seg(c, p(CHAIN_TOP, 1), p(GY, 1), INK, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The truss overhead: box truss, the lamps hung off it (their beams, dust in them)

const TRUSS_Y = GY - 640;
/** How deep the box truss is (its back chords that much further back than its front ones). */
const TRUSS_BACK = TRUSS_D - 0.035;
/** The span of the truss (in its own units): wall to wall, nothing past the room's ends. */
const trussSpan = (eye: Eye, pad: number): [number, number] => {
  const [s0, s1] = spanAt(eye, TRUSS_D, pad);
  return [Math.max(s0, ROOM_L), Math.min(s1, ROOM_R)];
};
const trussLamps = (eye: Eye) => {
  const out: number[] = [];
  const [s0, s1] = spanAt(eye, TRUSS_D, 200);
  for (let x = Math.floor(s0 / 420) * 420 + 150; x < s1; x += 420) if (x > ROOM_L + 40 && x < ROOM_R - 40) out.push(x);
  return out;
};
const drawTruss = (c: Ctx, eye: Eye, f: number) => {
  // (it's a box truss: its back chords first, the underside between them and the front ones (he's under it: rungs
  // going back to the one point everything goes back to), then the front)
  {
    const [s0, s1] = trussSpan(eye, 40);
    if (s1 > s0) {
      inDepth(c, eye, TRUSS_BACK, () => {
        box(c, s0, TRUSS_Y, s1 - s0, 3, '#3A3E46'); box(c, s0, TRUSS_Y + 36, s1 - s0, 3, '#33363E');
        c.strokeStyle = '#2C2F36'; c.lineWidth = 2; c.beginPath();
        for (let x = Math.floor(s0 / 40) * 40; x < s1; x += 40) { c.moveTo(Math.max(s0, x), TRUSS_Y + 3); c.lineTo(x + 20, TRUSS_Y + 36); c.lineTo(Math.min(s1, x + 40), TRUSS_Y + 3); }
        c.stroke();
      });
      if (eye.y > TRUSS_Y + 39) {
        const a0 = at(eye, s0, TRUSS_Y + 39, TRUSS_D), a1 = at(eye, s1, TRUSS_Y + 39, TRUSS_D), b0 = at(eye, s0, TRUSS_Y + 39, TRUSS_BACK), b1 = at(eye, s1, TRUSS_Y + 39, TRUSS_BACK);
        quad(c, 'rgba(20, 21, 26, 0.55)', a0, a1, b1, b0);
        c.strokeStyle = '#3A3E46'; c.lineWidth = 2; c.beginPath();
        for (let x = Math.ceil(s0 / 40) * 40; x <= s1; x += 40) { const p = at(eye, x, TRUSS_Y + 38, TRUSS_D), q = at(eye, x, TRUSS_Y + 38, TRUSS_BACK); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
        c.stroke();
      }
    }
  }
  inDepth(c, eye, TRUSS_D, () => {
    const [s0, s1] = trussSpan(eye, 40);
    if (s1 <= s0) return;
    const a = Math.floor(s0 / 40) * 40;
    box(c, s0, TRUSS_Y, s1 - s0, 3, '#5A5E66'); box(c, s0, TRUSS_Y + 3, s1 - s0, 1, '#2A2C30');
    box(c, s0, TRUSS_Y + 36, s1 - s0, 3, '#4A4E56'); box(c, s0, TRUSS_Y + 39, s1 - s0, 1, '#22242A');
    c.save(); c.beginPath(); c.rect(s0, TRUSS_Y, s1 - s0, 40); c.clip();
    c.strokeStyle = '#3E424A'; c.lineWidth = 2; c.beginPath();
    for (let x = a; x < s1; x += 40) { c.moveTo(x, TRUSS_Y + 3); c.lineTo(x + 20, TRUSS_Y + 36); c.lineTo(x + 40, TRUSS_Y + 3); }
    c.stroke();
    c.restore();
    // (chains up into the dark: up past the top of the screen, however high he's climbed)
    for (let x = Math.floor(s0 / 600) * 600 + 80; x < s1; x += 600) if (x > s0) chain(c, x, CHAIN_TOP, TRUSS_Y, '#3A3A3E');
    // the lamps: clamped on, pointed down
    for (const x of trussLamps(eye)) {
      box(c, x - 2, TRUSS_Y + 36, 4, 10, '#22242A');
      c.save(); c.translate(x, TRUSS_Y + 52); c.rotate(0.12 * Math.sin(x));
      slab(c, -10, -8, 20, 22, '#2E3036', { edge: 2 });
      box(c, -9, 14, 18, 3, '#FFE7B0'); box(c, -7, 15, 14, 1, '#FFFFFF');
      c.restore();
    }
  });
  // the beams down from them: stepped, faint; dust turning in them
  for (const x of trussLamps(eye)) {
    const [lx, ly] = at(eye, x, TRUSS_Y + 68, TRUSS_D), [fx, fy] = at(eye, x, GY, 0.7);
    for (let k = 0; k < 3; k++) {
      const wTop = 6 + k * 4, wBot = 40 + k * 26;
      quad(c, `rgba(255, 226, 170, ${0.035 - k * 0.008})`, [lx - wTop, ly], [lx + wTop, ly], [fx + wBot, fy], [fx - wBot, fy]);
    }
    for (let i = 0; i < 6; i++) {
      const u = ((f * 0.002 + hash(x + i) ) % 1), w = (hash(x * 3 + i) - 0.5) * 2;
      const px = lx + (fx - lx) * u + w * (8 + u * 36) + Math.sin(f * 0.02 + i) * 3, py = ly + (fy - ly) * u;
      box(c, px, py, 1, 1, 'rgba(255, 240, 210, 0.5)');
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The set's catwalk: just behind the facade's top, its full length: grating, rails, the hanger rods up into the dark;
// the show's lights clamped on its rail aimed out over the set (their lenses in the show's colors), hazers on its deck
// puffing, cable runs draped along it (stamped in 512 lengths; the lenses and the haze live)

const CAT_D = 0.745, CAT_Y = GY - 520;
const CAT_X0 = T + 100, CAT_X1 = STATION_X - 140;
const paintCatwalk = (g: Ctx, x0: number, x1: number, i: number) => {
  const st = rampOf('#5A6068');
  // (the deck: seen from under, the grating's diamonds, the stringer along its edge)
  box(g, x0, CAT_Y - 1, x1 - x0, 12, INK);
  box(g, x0, CAT_Y, x1 - x0, 10, st[1]);
  for (let x = x0; x < x1; x += 4) box(g, x, CAT_Y + 2 + ((x / 4) % 2), 2, 6, '#141518');
  box(g, x0, CAT_Y, x1 - x0, 2, st[3]); box(g, x0, CAT_Y + 9, x1 - x0, 1, st[0]);
  // (the toe board, the mid rail and the top rail; posts every 128, kicked out at the foot)
  box(g, x0, CAT_Y - 9, x1 - x0, 9, st[2]); box(g, x0, CAT_Y - 9, x1 - x0, 1, st[4]); checker(g, x0, CAT_Y - 2, x1 - x0, 2, st[1]);
  for (const ry of [CAT_Y - 26, CAT_Y - 46]) { box(g, x0, ry - 1, x1 - x0, 5, INK); box(g, x0, ry, x1 - x0, 3, st[2]); box(g, x0, ry, x1 - x0, 1, st[4]); }
  for (let x = Math.ceil(x0 / 128) * 128; x < x1; x += 128) { box(g, x - 1, CAT_Y - 48, 6, 48, INK); box(g, x, CAT_Y - 47, 4, 46, st[2]); box(g, x, CAT_Y - 47, 1, 46, st[4]); }
  // (the cable runs: two bundles draped rail to rail, zip-tied at the posts; a coil hung off one)
  for (const [yy, col, sag] of [[CAT_Y - 40, '#121214', 7], [CAT_Y - 20, '#1E1E24', 5]] as const) {
    g.strokeStyle = col; g.lineWidth = 3; g.beginPath();
    for (let x = Math.floor(x0 / 128) * 128; x < x1; x += 128) { g.moveTo(Math.max(x0, x + 2), yy); g.quadraticCurveTo(x + 66, yy + sag * 2, Math.min(x1, x + 130), yy); }
    g.stroke();
    for (let x = Math.ceil(x0 / 128) * 128; x < x1; x += 128) box(g, x - 1, yy - 2, 6, 3, '#E7E5E4');
  }
  if (i % 2) { g.strokeStyle = '#18181B'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x0 + 200, CAT_Y + 26 + k, 12 - k, 18, 0, 0, Math.PI * 2); g.stroke(); } box(g, x0 + 196, CAT_Y + 4, 8, 6, '#E8C130'); }
  // (a crew tag, a sign: the load on it)
  if (i % 3 === 0) { slab(g, x0 + 360, CAT_Y - 44, 56, 18, '#E8C130', { edge: 2 }); signAt(g, 'MAX 500 LB', x0 + 388, CAT_Y - 35, 6, stencil(6, INK)); }
  if (i % 3 === 2) { slab(g, x0 + 120, CAT_Y - 44, 64, 18, '#F1EFEA', { edge: 2 }); signAt(g, 'TIE OFF HERE', x0 + 152, CAT_Y - 35, 6, print(6, '#B91C1C')); }
};
/** Where the show lights clamp on the catwalk's rail (in its own units). */
const catLamps = (s0: number, s1: number) => { const out: number[] = []; for (let x = Math.floor(s0 / 260) * 260 + 70; x < s1; x += 260) if (x > CAT_X0 + 30 && x < CAT_X1 - 30) out.push(x); return out; };
const drawCatwalk = (c: Ctx, eye: Eye, f: number) => {
  const [s0, s1] = spanAt(eye, CAT_D, 60);
  if (s1 < CAT_X0 || s0 > CAT_X1) return;
  inDepth(c, eye, CAT_D, () => {
    // (the hanger rods, up out of sight)
    for (let x = Math.ceil(Math.max(s0, CAT_X0) / 512) * 512 + 40; x < Math.min(s1, CAT_X1); x += 512) { box(c, x, CHAIN_TOP, 3, CAT_Y - 46 - CHAIN_TOP, '#2E3036'); box(c, x - 3, CAT_Y - 48, 9, 4, '#3A3E46'); }
    for (let i = Math.floor(Math.max(s0, CAT_X0) / 512); i * 512 < Math.min(s1, CAT_X1); i++) {
      const a = Math.max(i * 512, CAT_X0), b = Math.min((i + 1) * 512, CAT_X1);
      if (b > a) stamp(c, `tpl-cat-${i}`, a, CAT_Y - 60, b - a, 110, g => paintCatwalk(g, a, b, i));
    }
    // the show lights: PAR cans on yokes, hung off the top rail, tipped forward over the set; the lens in the cue's color
    catLamps(s0, s1).forEach(x => {
      const i = Math.floor(x / 260), col = showAt(i, f);
      box(c, x + 6, CAT_Y - 46, 3, 10, '#2A2C30');
      c.save(); c.translate(x + 7, CAT_Y - 30); c.rotate(0.5);
      slab(c, -9, -6, 26, 14, '#26282E', { edge: 2 }); box(c, -7, -5, 20, 2, '#3E424A');
      box(c, 16, -7, 3, 16, INK); box(c, 17, -6, 2, 14, mix(col, '#FFFFFF', 0.35));
      box(c, 18, -9, 6, 3, '#1A1A1E'); box(c, 18, 7, 6, 3, '#1A1A1E');
      c.restore();
      steppedGlow(c, x + 22, CAT_Y - 18, 22, col, 0.18, 0.02, 3);
    });
    // the hazers on the deck, every so often: a box, its fan, the haze it's putting out drifting over the set
    for (let x = Math.floor(s0 / 880) * 880 + 400; x < s1; x += 880) {
      if (x < CAT_X0 + 40 || x > CAT_X1 - 80) continue;
      slab(c, x, CAT_Y - 26, 40, 26, '#2A2A30', { edge: 2 }); ball(c, x + 12, CAT_Y - 13, 7, '#3A3A40'); ball(c, x + 12, CAT_Y - 13, 2, '#111114', false);
      box(c, x + 26, CAT_Y - 20, 10, 3, '#E8C130'); box(c, x + 30, CAT_Y - 9, 3, 3, f % 50 < 25 ? '#22C55E' : '#14532D');
      for (let k = 0; k < 5; k++) {
        const t = ((f * 0.5 + k * 40) % 200) / 200;
        c.fillStyle = `rgba(200, 196, 190, ${(0.1 * (1 - t)).toFixed(3)})`;
        const r = 8 + t * 34;
        c.fillRect(Math.round(x + 40 + t * 90 + Math.sin(f * 0.01 + k) * 6 - r), Math.round(CAT_Y - 30 + t * 50 - r * 0.4), Math.round(r * 2), Math.round(r * 0.8));
      }
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The set's back: fiberglass shells, raw; stud frames; kickers down to sandbags; light leaking through the seams

/** The outline of a panel's top edge (how the front's shaped: stepped tiers, a jaguar's head, columns, the shrine). */
const panelTop = (kind: number, w: number, u: number): number => {
  switch (kind) {
    case 0: return 260 + Math.floor(u * 5) * 0 + (u < 0.2 || u > 0.8 ? 0 : u < 0.35 || u > 0.65 ? 60 : 120);
    case 1: { const k = Math.max(0, 1 - Math.pow((u - 0.5) * 2.1, 2)); return 230 + Math.sqrt(k) * 190 + ((u > 0.18 && u < 0.3) || (u > 0.7 && u < 0.82) ? 40 : 0); }
    case 2: return (u % 0.34) < 0.2 ? 400 : 300;
    case 3: return 300 + (Math.floor(u * 8) % 2) * 20;
    default: return 330 + (u > 0.3 && u < 0.7 ? 140 : 0);
  }
};
const paintPanel = (g: Ctx, p: { x: number; w: number; kind: number }, i: number) => {
  const { x, w, kind } = p;
  const r = rampOf(FIBER);
  // (the shell's outline, stepped every 4)
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 2, GY);
  for (let k = 0; k <= w; k += 4) g.lineTo(x + k, GY - panelTop(kind, w, k / w) - 2);
  g.lineTo(x + w + 2, GY); g.closePath(); g.fill();
  g.fillStyle = r[2]; g.beginPath(); g.moveTo(x, GY);
  for (let k = 0; k <= w; k += 4) g.lineTo(x + k, GY - panelTop(kind, w, k / w));
  g.lineTo(x + w, GY); g.closePath(); g.fill();
  g.save(); g.clip();
  // (stepped: lit up top where the light from over the set lands on it, darker toward the floor)
  for (let y = 0; y < 6; y++) box(g, x, GY - 480 + y * 80, w, 80, y < 1 ? r[3] : y < 3 ? r[2] : y < 5 ? mix(r[2], r[1], 0.5) : r[1]);
  for (let y = 1; y < 6; y++) checker(g, x, GY - 480 + y * 80, w, 2, y < 3 ? r[3] : r[2]);
  // (the mat in the glass: a faint weave, mottled)
  for (let k = 0; k < w * 3; k++) { const hx = hash(i * 101 + k), hy = hash(i * 57 + k * 1.7); box(g, x + hx * w, GY - hy * 470, 2, 2, hx < 0.5 ? r[1] : r[3]); }
  // (resin runs down it)
  for (let k = 0; k < 6; k++) { const rx = x + 20 + hash(i * 9 + k) * (w - 40), ry = GY - panelTop(kind, w, (rx - x) / w) + 6; box(g, rx, ry, 2, 18 + hash(k + i) * 50, r[1]); box(g, rx, ry, 1, 6, r[4]); }
  // (the front's paint, wrapped round the top edge: moss and stone, just a lip of it)
  for (let k = 0; k <= w; k += 4) { const ty = GY - panelTop(kind, w, k / w); box(g, x + k, ty, 4, 3, (k / 4) % 3 ? '#4C6B3A' : '#7A7466'); }
  // (the stud frame, screwed through)
  for (let sx = x + 24; sx < x + w - 10; sx += 92) { pole(g, sx, GY - Math.min(panelTop(kind, w, (sx - x) / w), 420) + 16, 8, Math.min(panelTop(kind, w, (sx - x) / w), 420) - 16, WOOD, true); }
  slab(g, x + 10, GY - 200, w - 20, 10, WOOD, { edge: 2 });
  slab(g, x + 10, GY - 22, w - 20, 10, WOOD, { edge: 2 });
  // (and what's written on the back of it)
  signAt(g, 'THIS SIDE BACK', x + w / 2, GY - 150, 8, stencil(8, '#3E372C'));
  signAt(g, '^  ^  ^', x + w / 2, GY - 136, 8, stencil(8, '#3E372C'));
  signAt(g, ['PANEL 7B', 'JAGUAR HEAD (L)', 'COLUMN SET 2', 'STEP WALL 4', 'SHRINE TOP'][kind], x + w / 2, GY - 110, 6, plank(6, '#2E2820', undefined, undefined, kind));
  if (i % 3 === 1) { box(g, x + 30, GY - 90, 56, 26, '#E7E2D2'); signAt(g, 'WET', x + 58, GY - 79, 6, print(6, '#B91C1C')); signAt(g, 'PAINT', x + 58, GY - 70, 6, print(6, '#B91C1C')); }
  // (the works on its back: a wire run down a stud, zip-tied, to a junction box; the speaker that does this bit's
  // sound; a hole patched with gaffer tape; a chunk of the carved foam front broken off and glued back in with spray
  // foam; an access hatch; the crew's names in marker)
  const sx = x + 24 + 92 * (1 + (i % 2)), top = GY - Math.min(panelTop(kind, w, (sx - x) / w), 420);
  if (sx < x + w - 30) {
    box(g, sx + 9, top + 20, 2, GY - 60 - top - 20, '#141416');
    for (let y = top + 34; y < GY - 60; y += 30) box(g, sx + 8, y, 4, 2, '#E7E5E4');
    slab(g, sx + 2, GY - 64, 18, 18, '#5B6068', { edge: 2 }); box(g, sx + 6, GY - 60, 10, 2, '#E8C130');
  }
  if (kind === 1 || kind === 4) {
    const px0 = x + w * 0.5 - 22, py0 = GY - 330;
    slab(g, px0, py0, 44, 54, '#1C1C20', { edge: 2 });
    ball(g, px0 + 22, py0 + 20, 14, '#2E2E34'); ball(g, px0 + 22, py0 + 20, 6, '#141416', false); box(g, px0 + 17, py0 + 15, 3, 3, '#4A4A52');
    ball(g, px0 + 22, py0 + 44, 5, '#2E2E34');
    signAt(g, kind === 1 ? 'ROAR' : 'CHANT', px0 + 22, py0 - 6, 6, stencil(6, '#5A5048'));
  }
  if (i % 4 === 2) {
    const hx = x + w - 90;
    for (let k = 0; k < 3; k++) { box(g, hx + k * 4, GY - 250 + k * 9, 44, 8, '#8A8E96'); box(g, hx + k * 4, GY - 250 + k * 9, 44, 2, '#B8BCC4'); }
  }
  if (i % 4 === 0) {
    const fx = x + 50, fy = GY - 300;
    g.fillStyle = '#E8C66A'; g.beginPath(); g.ellipse(fx + 30, fy + 22, 38, 28, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 12; k++) ball(g, fx - 2 + hash(i + k) * 64, fy - 2 + hash(i * 3 + k) * 48, 4 + hash(k) * 4, k % 2 ? '#F2D88A' : '#D8B058', false);
    slab(g, fx + 10, fy + 6, 42, 32, '#8E8676', { edge: 2 }); box(g, fx + 14, fy + 10, 34, 4, '#A8A090'); box(g, fx + 22, fy + 20, 12, 8, '#6E6658');
  }
  if (i % 3 === 0) { slab(g, x + w - 70, GY - 140, 52, 60, PLY, { edge: 2 }); box(g, x + w - 66, GY - 112, 6, 4, '#9CA3AF'); signAt(g, 'ACCESS', x + w - 44, GY - 128, 6, stencil(6, '#3E372C')); }
  signAt(g, ['MIKE + DEB 2019', 'GARY WAS HERE', 'TONY SUCKS', 'SHOW #4000!', 'JJ <3 SID'][i % 5], x + w * 0.62, GY - 186, 6, graffiti(6, ['#E7E5E4', '#F472B6', '#FDE047', '#93C5FD', '#86EFAC'][i % 5], i));
  g.restore();
};

const drawFacade = (c: Ctx, eye: Eye, f: number) => {
  // (padded for what spills past a panel: its glow, the light pool off its seam, the kickers' sandbags)
  const [s0, s1] = spanAt(eye, FACADE_D, 140);
  inDepth(c, eye, FACADE_D, () => {
    PANELS.forEach((p, i) => {
      if (p.x + p.w < s0 || p.x > s1) return;
      // (the show light over the top of it, off the ride's side)
      const col = showAt(i, f), top = GY - panelTop(p.kind, p.w, 0.5);
      steppedGlow(c, p.x + p.w / 2, top - 10, p.w * 0.55, col, 0.1, 0.0, 4);
      // (through the seam after it: a slit of it, and a pool on the floor in front)
      const gx = p.x + p.w + 2, nextCol = showAt(i + 1, f);
      bandedGradient(c, gx, GY - 300, 18, 300, [dark(col, 0.6), col, lite(col, 0.3)], 6);
      box(c, gx + 6, GY - 300, 6, 300, lite(col, 0.5));
      void nextCol;
      stamp(c, `tpl-panel-${i}`, p.x - 4, GY - 500, p.w + 8, 504, g => paintPanel(g, p, i));
    });
  });
  // (light pools on the floor out from the seams)
  PANELS.forEach((p, i) => {
    if (p.x + p.w < s0 || p.x > s1) return;
    const [gx, gy] = at(eye, p.x + p.w + 11, GY, FACADE_D + 0.04);
    const col = showAt(i, f);
    c.save(); c.translate(gx, gy); c.scale(1, 0.22); steppedGlow(c, 0, 0, 70, col, 0.22, 0.02, 4); c.restore();
  });
  // the kickers: 2x4s braced down from the frames to the floor toward him, sandbags on their feet
  PANELS.forEach((p, i) => {
    if (p.x + p.w < s0 || p.x > s1) return;
    for (const u of [0.25, 0.75]) {
      const kx = p.x + p.w * u, top = at(eye, kx, GY - 190, FACADE_D), foot = at(eye, kx + 20, GY, FACADE_D + 0.09);
      seg(c, top, foot, INK, 6 * FACADE_D); seg(c, top, foot, WOOD, 4 * FACADE_D);
      seg(c, [top[0] - 1, top[1]], [foot[0] - 1, foot[1]], lite(WOOD, 0.3), 1);
      const s = FACADE_D + 0.09;
      inDepth(c, eye, s, () => stamp(c, `tpl-sandbag-${Math.round(kx)}`, kx + 2, GY - 22, 44, 24, g => sandbag(g, kx + 2, i)));
    }
  });
};
const sandbag = (g: Ctx, x: number, i: number) => {
  const r = rampOf('#8A7652');
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + 20, GY - 8, 21, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[1]; g.beginPath(); g.ellipse(x + 20, GY - 8, 20, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = r[2]; g.beginPath(); g.ellipse(x + 18, GY - 10, 17, 6, 0, 0, Math.PI * 2); g.fill();
  box(g, x + 8, GY - 14, 12, 2, r[3]);
  box(g, x + 30, GY - 16, 2, 10, r[0]);
  if (i % 2) { g.fillStyle = r[1]; g.beginPath(); g.ellipse(x + 26, GY - 18, 14, 6, 0, 0, Math.PI * 2); g.fill(); box(g, x + 18, GY - 22, 10, 2, r[3]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The crew's clutter (props at PROPS_D): road cases, the costume rack, the incident board, ladders, the break room

type Prop = { x: number; kind: 'case' | 'rack' | 'board' | 'ladder' | 'break' | 'cooler' | 'title' | 'cable' | 'flats' | 'bones' | 'paint' | 'projector' | 'snakes' | 'dimmer' };
const PROPS: Prop[] = [
  { x: T + 160, kind: 'break' }, { x: T + 420, kind: 'title' }, { x: T + 560, kind: 'case' }, { x: T + 820, kind: 'rack' },
  { x: T + 1180, kind: 'cable' }, { x: T + 1400, kind: 'flats' }, { x: T + 1690, kind: 'bones' }, { x: T + 1900, kind: 'board' },
  { x: T + 2150, kind: 'case' }, { x: T + 2420, kind: 'ladder' }, { x: T + 2560, kind: 'paint' }, { x: T + 2880, kind: 'cooler' },
  { x: T + 3060, kind: 'projector' }, { x: T + 3640, kind: 'case' }, { x: T + 3800, kind: 'snakes' }, { x: T + 4020, kind: 'dimmer' },
  { x: T + 4240, kind: 'rack' },
];
/** Where the projector's lens is (its beam goes from there to the ghost's pane). */
const PROJ_LENS: [number, number] = [T + 3092, GY - 313];
const paintProp = (g: Ctx, p: Prop) => {
  const x = p.x;
  switch (p.kind) {
    case 'flats': {
      // scenery flats stacked against a rack: the backs (lauan on 1x3 frames, stenciled what they are), the painted
      // stone and jungle fronts peeking past their edges
      const fr = rampOf('#B89868');
      box(g, x - 4, GY - 236, 6, 236, '#3A3E46'); box(g, x + 214, GY - 236, 6, 236, '#3A3E46'); box(g, x - 4, GY - 236, 224, 5, '#4A4E56');
      for (const [dx, h, col, label, front] of [[0, 220, '#A88A5C', 'TEMPLE INT 3', '#7A7466'], [26, 200, '#B09468', 'ALTAR (L)', '#8E8676'], [52, 182, '#9C8054', 'JUNGLE 12', '#3E6B34']] as const) {
        const fx = x + dx, fy = GY - h, fw = 150;
        box(g, fx - 4, fy + 2, 4, h - 2, front); for (let y = fy + 6; y < GY; y += 14) box(g, fx - 4, y, 4, 4, dark(front, 0.3));
        slab(g, fx, fy, fw, h, col, { edge: 2 });
        for (const yy of [fy + 2, fy + h * 0.5, GY - 10]) { box(g, fx + 2, yy, fw - 4, 8, fr[3]); box(g, fx + 2, yy + 7, fw - 4, 1, fr[0]); }
        for (const xx of [fx + 2, fx + fw - 10]) { box(g, xx, fy + 2, 8, h - 4, fr[3]); box(g, xx + 7, fy + 2, 1, h - 4, fr[0]); }
        g.fillStyle = fr[2]; g.beginPath(); g.moveTo(fx + 10, fy + 10); g.lineTo(fx + 40, fy + 10); g.lineTo(fx + 10, fy + 40); g.closePath(); g.fill();
        signAt(g, label, fx + fw / 2, fy + h * 0.3, 8, stencil(8, '#2A221C', undefined, dx));
      }
      break;
    }
    case 'bones': {
      // a rolling tote of prop skeletons (bones sticking out of it every which way), and one hung up on a stand like a coat
      for (let k = 0; k < 9; k++) {
        const bx = x + 14 + hash(k * 3.3) * 90, by = GY - 76 - hash(k * 1.7) * 18, a = (hash(k * 5.1) - 0.5) * 1.6;
        g.save(); g.translate(bx, by); g.rotate(a); box(g, -2, -18, 5, 26, INK); box(g, -1, -17, 3, 24, '#E7E2D2'); box(g, -3, -20, 7, 5, '#F1EDE2'); g.restore();
      }
      for (const [sx, sy] of [[x + 40, GY - 92], [x + 82, GY - 86]]) { ball(g, sx, sy, 9, '#EDE8DC'); box(g, sx - 5, sy - 2, 4, 4, INK); box(g, sx + 1, sy - 2, 4, 4, INK); box(g, sx - 3, sy + 4, 6, 2, '#8E8676'); }
      slab(g, x, GY - 80, 120, 70, '#5B6068', { edge: 3 }); box(g, x + 2, GY - 80, 116, 3, '#8A9098');
      for (let k = 0; k < 4; k++) box(g, x + 10 + k * 28, GY - 70, 2, 54, '#4A4E56');
      box(g, x + 22, GY - 52, 76, 16, '#F1EFEA'); signAt(g, 'SKELETONS', x + 60, GY - 48, 6, print(6, '#1A0B06')); signAt(g, '(CLEAN)', x + 60, GY - 40, 6, print(6, '#B91C1C'));
      for (const wx of [x + 10, x + 110]) ball(g, wx, GY - 5, 5, '#2A2A2E');
      // (the one on the stand)
      const hx = x + 160;
      pole(g, hx, GY - 190, 4, 190, '#6B7280'); box(g, hx - 16, GY - 4, 36, 4, '#3A3E44');
      ball(g, hx + 2, GY - 182, 10, '#EDE8DC'); box(g, hx - 3, GY - 184, 4, 4, INK); box(g, hx + 4, GY - 184, 4, 4, INK);
      for (let k = 0; k < 5; k++) { box(g, hx - 12 + k, GY - 162 + k * 7, 28 - k * 2, 3, INK); box(g, hx - 11 + k, GY - 161 + k * 7, 26 - k * 2, 1, '#E7E2D2'); }
      box(g, hx - 14, GY - 166, 3, 50, '#E7E2D2'); box(g, hx + 15, GY - 166, 3, 50, '#E7E2D2');
      g.fillStyle = '#E7E2D2'; g.beginPath(); g.ellipse(hx + 2, GY - 118, 13, 6, 0, 0, Math.PI * 2); g.fill();
      box(g, hx - 6, GY - 112, 3, 60, '#E7E2D2'); box(g, hx + 8, GY - 112, 3, 60, '#E7E2D2');
      box(g, hx + 10, GY - 150, 20, 12, '#E8C130'); signAt(g, 'BOB', hx + 20, GY - 147, 6, print(6, INK));
      break;
    }
    case 'paint': {
      // the scenic shop's corner: a folding table of paint (STONE GRAY, MOSS, GOLD LEAF), brushes in a coffee can, a
      // drop cloth spattered; a foam block on sawhorses, half carved into a stone head, the hot-wire bow on it
      const r = rampOf('#7A7A80');
      g.fillStyle = '#D8D0BC'; g.beginPath(); g.moveTo(x - 10, GY); g.lineTo(x + 250, GY); g.lineTo(x + 236, GY - 8); g.lineTo(x + 4, GY - 8); g.closePath(); g.fill();
      for (let k = 0; k < 30; k++) box(g, x + hash(k * 2.3) * 240 - 6, GY - 7 + hash(k * 3.9) * 6, 3, 1, ['#7A7466', '#4C6B3A', '#E8B400', '#8E8676'][k % 4]);
      box(g, x, GY - 66, 120, 6, r[3]); box(g, x, GY - 60, 120, 2, r[0]);
      for (const lx of [x + 8, x + 106]) { box(g, lx, GY - 60, 3, 60, r[1]); box(g, lx + 3, GY - 60, 3, 60, r[0]); }
      for (const [dx, col, lab] of [[6, '#8E8676', 'STONE'], [36, '#4C6B3A', 'MOSS'], [66, '#E8B400', 'GOLD'], [94, '#5A3A20', 'GRIME']] as const) {
        slab(g, x + dx, GY - 92, 22, 26, '#C8CCD2', { edge: 2 }); box(g, x + dx, GY - 92, 22, 4, col); box(g, x + dx + 2, GY - 86, 18, 3, col);
        for (let k = 0; k < 3; k++) box(g, x + dx + 4 + k * 6, GY - 88, 2, 6 + k * 3, col);
        signAt(g, lab, x + dx + 11, GY - 76, 4, print(4, '#1A0B06'));
      }
      slab(g, x + 124, GY - 30, 16, 30, '#B91C1C', { edge: 2 }); for (let k = 0; k < 4; k++) { box(g, x + 126 + k * 3, GY - 48 + k, 2, 20, '#A8743A'); box(g, x + 126 + k * 3, GY - 50 + k, 2, 4, ['#8E8676', '#4C6B3A', '#E8B400', INK][k]); }
      // (the foam block, half a stone head)
      for (const lx of [x + 158, x + 228]) { g.strokeStyle = WOOD; g.lineWidth = 4; g.beginPath(); g.moveTo(lx - 10, GY); g.lineTo(lx, GY - 40); g.lineTo(lx + 10, GY); g.stroke(); }
      box(g, x + 150, GY - 44, 90, 6, WOOD);
      slab(g, x + 160, GY - 110, 70, 66, '#C8D8E0', { edge: 2 });
      g.fillStyle = '#8E8676'; g.beginPath(); g.moveTo(x + 160, GY - 44); g.lineTo(x + 160, GY - 94); g.lineTo(x + 182, GY - 104); g.lineTo(x + 196, GY - 92); g.lineTo(x + 196, GY - 44); g.closePath(); g.fill();
      box(g, x + 166, GY - 86, 10, 5, INK); box(g, x + 166, GY - 88, 10, 2, '#A8A090'); box(g, x + 178, GY - 76, 5, 12, '#A8A090'); box(g, x + 166, GY - 60, 24, 5, '#5A534C');
      for (let k = 0; k < 7; k++) box(g, x + 198 + hash(k) * 30, GY - 44 + hash(k + 9) * 3, 4, 3, '#E0ECF0');
      g.strokeStyle = '#6B7280'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 204, GY - 46); g.lineTo(x + 204, GY - 130); g.lineTo(x + 244, GY - 130); g.lineTo(x + 244, GY - 46); g.stroke();
      g.strokeStyle = '#F87171'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 206, GY - 128); g.lineTo(x + 206, GY - 48); g.stroke();
      break;
    }
    case 'projector': {
      // the ghost's projector: on a crank-up stand (its tripod legs, the mast's sections), aimed left at the pane; the
      // laptop running the cues on a road case at its foot, a cable up the mast
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 30, GY); g.lineTo(x + 6, GY - 70); g.lineTo(x + 40, GY); g.moveTo(x + 6, GY - 70); g.lineTo(x + 6, GY); g.stroke();
      g.strokeStyle = '#6B7280'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 30, GY); g.lineTo(x + 6, GY - 70); g.lineTo(x + 40, GY); g.stroke();
      pole(g, x + 2, GY - 300, 8, 232, '#5A6068'); pole(g, x + 3, GY - 200, 6, 130, '#7D8794');
      box(g, x - 2, GY - 210, 16, 6, '#3A3E44'); box(g, x + 12, GY - 212, 10, 4, '#B91C1C');
      box(g, x + 8, GY - 296, 2, 226, '#141416');
      slab(g, x - 26, GY - 326, 60, 26, '#E7E5E4', { edge: 2 }); box(g, x - 24, GY - 324, 56, 3, '#FFFFFF'); for (let k = 0; k < 6; k++) box(g, x + 4 + k * 4, GY - 318, 2, 12, '#A8A29E');
      ball(g, PROJ_LENS[0], PROJ_LENS[1], 8, '#26262A'); ball(g, PROJ_LENS[0], PROJ_LENS[1], 4, '#93C5FD', false); box(g, PROJ_LENS[0] - 2, PROJ_LENS[1] - 3, 2, 2, '#FFFFFF');
      box(g, x + 26, GY - 304, 4, 3, '#22C55E');
      slab(g, x + 40, GY - 50, 80, 50, '#26262A', { edge: 2 }); for (const cx of [x + 42, x + 112]) for (const cy of [GY - 48, GY - 8]) box(g, cx, cy, 6, 6, '#9CA3AF');
      slab(g, x + 52, GY - 58, 44, 8, '#3A3E44', { edge: 1 }); g.fillStyle = INK; g.beginPath(); g.moveTo(x + 56, GY - 58); g.lineTo(x + 52, GY - 86); g.lineTo(x + 92, GY - 86); g.lineTo(x + 92, GY - 58); g.closePath(); g.fill();
      box(g, x + 55, GY - 84, 35, 24, '#1E3A5F'); for (let k = 0; k < 5; k++) box(g, x + 58, GY - 81 + k * 4, k === 2 ? 28 : 20, 2, k === 2 ? '#FDE047' : '#93C5FD');
      signAt(g, 'GHOST CUE', x + 80, GY - 30, 6, stencil(6, '#E8C130'));
      break;
    }
    case 'snakes': {
      // spare serpent heads on steel shelving, eyes dead, a tag on the shelf
      const r = rampOf('#2F7A3A');
      for (const lx of [x, x + 156]) { box(g, lx, GY - 200, 5, 200, INK); box(g, lx + 1, GY - 200, 3, 200, '#7D8794'); }
      for (const sy of [GY - 196, GY - 126, GY - 56]) {
        box(g, x, sy, 161, 6, '#5A6068'); box(g, x, sy, 161, 1, '#A8B0BA');
        if (sy < GY - 60) for (let k = 0; k < 3; k++) {
          const hx = x + 14 + k * 48, hy = sy + 70 - 8;
          g.fillStyle = INK; g.beginPath(); g.moveTo(hx, hy - 30); g.lineTo(hx + 40, hy - 22); g.lineTo(hx + 44, hy - 10); g.lineTo(hx, hy); g.closePath(); g.fill();
          g.fillStyle = r[k === 1 ? 1 : 2]; g.beginPath(); g.moveTo(hx + 1, hy - 28); g.lineTo(hx + 38, hy - 21); g.lineTo(hx + 42, hy - 11); g.lineTo(hx + 1, hy - 2); g.closePath(); g.fill();
          box(g, hx + 2, hy - 27, 30, 3, r[3]); box(g, hx + 24, hy - 22, 6, 4, '#57534E'); box(g, hx + 26, hy - 22, 2, 4, INK);
          for (let q = 0; q < 4; q++) box(g, hx + 6 + q * 8, hy - 15 + (q % 2) * 3, 4, 2, r[0]);
        }
      }
      box(g, x + 30, GY - 52, 100, 46, '#3A3E44'); box(g, x + 32, GY - 50, 96, 2, '#5A6068'); signAt(g, 'RAM PARTS', x + 80, GY - 34, 6, stencil(6, '#E8C130'));
      box(g, x + 40, GY - 130, 84, 12, '#F1EFEA'); signAt(g, 'SPARES - DO NOT FEED', x + 82, GY - 127, 4, print(4, '#B91C1C'));
      break;
    }
    case 'dimmer': {
      // the dimmer racks and the DMX rack: black cabinets, rows of breakers, the patch bay's cables in loops; a stool
      for (let k = 0; k < 2; k++) {
        const rx = x + k * 56;
        slab(g, rx, GY - 190, 52, 190, '#141416', { edge: 3 });
        for (let y = GY - 180; y < GY - 30; y += 12) { box(g, rx + 6, y, 40, 8, '#26262A'); for (let q = 0; q < 6; q++) box(g, rx + 8 + q * 6, y + 2, 4, 4, '#3A3A42'); }
        box(g, rx + 6, GY - 24, 40, 10, '#2A2A2E');
      }
      g.strokeStyle = '#2563EB'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + 64 + k * 8, GY - 150); g.quadraticCurveTo(x + 50 + k * 6, GY - 70, x + 70 + k * 10, GY - 30); g.stroke(); }
      slab(g, x + 118, GY - 48, 26, 6, '#3A3E44', { edge: 1 }); for (const lx of [x + 120, x + 138]) box(g, lx, GY - 42, 3, 42, '#6B7280');
      sign(g, x + 6, GY - 214, 100, 16, '#B91C1C', 'DIMMERS', '#F8FAFC', 6, INK, stencil(6, '#F8FAFC'));
      break;
    }
    case 'case': {
      for (const [dx, h, w, col] of [[0, 70, 90, '#2A2A2E'], [94, 50, 70, '#26262A'], [10, 40, 70, '#303036']] as const) {
        const y = dx === 10 ? GY - 110 : GY - h;
        slab(g, x + dx, y, w, h, col, { edge: 2 });
        for (const cx of [x + dx + 2, x + dx + w - 8]) for (const cy of [y + 2, y + h - 8]) { box(g, cx, cy, 6, 6, '#9CA3AF'); box(g, cx, cy, 3, 3, '#D1D5DB'); }
        box(g, x + dx + w / 2 - 8, y + h / 2 - 2, 16, 4, '#6B7280');
      }
      signAt(g, 'JAGUAR FX', x + 45, GY - 26, 6, stencil(6, '#E8C130'));
      signAt(g, 'FRAGILE', x + 129, GY - 16, 6, stencil(6, '#D8D4CC'));
      signAt(g, 'FOG', x + 45, GY - 86, 6, stencil(6, '#D8D4CC'));
      break;
    }
    case 'rack': {
      // a rolling rack of the warrior costumes (feathers, gold), a spear or two leant on it
      pole(g, x, GY - 150, 4, 140, '#9CA3AF'); pole(g, x + 120, GY - 150, 4, 140, '#9CA3AF'); box(g, x, GY - 152, 124, 4, '#D1D5DB');
      for (let k = 0; k < 6; k++) {
        const cx = x + 10 + k * 18, col = ['#B45309', '#15803D', '#B91C1C'][k % 3];
        box(g, cx + 6, GY - 150, 2, 8, '#D1D5DB');
        slab(g, cx, GY - 142, 16, 56, col, { edge: 2 });
        box(g, cx + 2, GY - 138, 12, 4, '#E8B400');
        for (let q = 0; q < 3; q++) box(g, cx + 3 + q * 4, GY - 90, 3, 12, ['#16A34A', '#E8B400', '#DC2626'][q]);
      }
      for (const wx of [x + 4, x + 116]) ball(g, wx, GY - 5, 4, '#3A3A3E');
      box(g, x - 30, GY - 200, 3, 200, '#8B5A2B'); box(g, x - 32, GY - 212, 7, 14, '#D1D5DB');
      box(g, x - 20, GY - 190, 3, 190, '#8B5A2B'); box(g, x - 22, GY - 202, 7, 14, '#D1D5DB');
      sign(g, x + 14, GY - 190, 96, 14, '#F1EFEA', 'WARRIORS', '#1A0B06', 6, '#6B7280', stencil(6, '#1A0B06'));
      break;
    }
    case 'board': {
      // the incident board, on an easel
      g.strokeStyle = WOOD; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 20, GY); g.lineTo(x + 50, GY - 170); g.lineTo(x + 80, GY); g.stroke();
      slab(g, x - 10, GY - 160, 120, 90, '#1F3A2C', { edge: 4 });
      box(g, x - 10, GY - 160, 120, 4, WOOD);
      signAt(g, 'DAYS WITHOUT', x + 50, GY - 140, 6, plank(6, '#E7E5E4', undefined, undefined, 1));
      signAt(g, 'AN INCIDENT', x + 50, GY - 130, 6, plank(6, '#E7E5E4', undefined, undefined, 2));
      signAt(g, '0', x + 50, GY - 98, 16, plank(16, '#F8FAFC', undefined, undefined, 3));
      signAt(g, '(BEST: 2)', x + 50, GY - 80, 6, plank(6, '#9CA3AF', undefined, undefined, 4));
      break;
    }
    case 'ladder': {
      for (const lx of [x, x + 34]) { box(g, lx, GY - 260, 5, 260, INK); box(g, lx + 1, GY - 260, 3, 260, '#C2A23C'); box(g, lx + 1, GY - 260, 1, 260, '#E8D27A'); }
      for (let y = GY - 240; y < GY; y += 26) { box(g, x + 4, y, 30, 4, '#A88A2C'); box(g, x + 4, y, 30, 1, '#E8D27A'); }
      box(g, x - 16, GY - 122, 72, 12, '#E8C130'); signAt(g, 'NOT A STEP', x + 20, GY - 113, 6, stencil(6, INK));
      break;
    }
    case 'cooler': {
      slab(g, x, GY - 90, 44, 90, '#D8D4CC', { edge: 2 });
      g.fillStyle = 'rgba(147, 197, 253, 0.8)'; g.beginPath(); g.ellipse(x + 22, GY - 110, 16, 22, 0, 0, Math.PI * 2); g.fill();
      box(g, x + 12, GY - 120, 6, 10, 'rgba(255,255,255,0.6)');
      box(g, x + 8, GY - 60, 8, 6, '#3B82F6'); box(g, x + 28, GY - 60, 8, 6, '#DC2626');
      // and a mop bucket, the mop in it
      slab(g, x + 60, GY - 34, 40, 34, '#E8C130', { edge: 2 }); box(g, x + 78, GY - 130, 3, 100, '#B08A58');
      signAt(g, 'CAUTION', x + 80, GY - 14, 6, print(6, INK));
      break;
    }
    case 'cable': {
      // a big coil of cable, a spool on a stand
      for (let k = 0; k < 5; k++) { g.strokeStyle = k % 2 ? '#2A2A2E' : '#3A3A40'; g.lineWidth = 3; g.beginPath(); g.ellipse(x + 40, GY - 10 - k * 3, 36 - k * 2, 10, 0, 0, Math.PI * 2); g.stroke(); }
      ball(g, x + 130, GY - 50, 44, '#5A4632');
      ball(g, x + 130, GY - 50, 30, '#1C1C20', false);
      box(g, x + 124, GY - 56, 12, 12, '#9CA3AF');
      break;
    }
    case 'title': {
      // (hung from the truss on chains, way up: the crew's own sign)
      // (its chains, up out of sight, are drawn over the stamp: drawProps)
      sign(g, x - 10, GY - 470, 280, 28, '#5A1A0C', 'TEMPLE OF THE JAGUAR', '#F2C14E', 10, '#7A5224', gilt({ sx: 2, sy: 2 }, '#2A0A04', 5));
      sign(g, x + 10, GY - 424, 240, 30, '#E7E2D2', 'CAST AND CREW ONLY', '#1A0B06', 7, '#6B7280', enamel({ sx: 1, sy: 2 }, '#1A0B06'));
      signAt(g, 'NO FLASH PHOTOGRAPHY OF THE MAGIC', x + 130, GY - 400, 6, print(6, '#B91C1C'));
      for (const cx of [x + 30, x + 230]) for (let y = GY - 438; y < GY - 428; y += 4) box(g, cx, y, 2, 3, '#4A4A4E');
      break;
    }
    case 'break': {
      // the break room: a plywood shack, its window lit, the door ajar, a vending machine glowing inside
      slab(g, x, GY - 150, 180, 150, PLY, { edge: 4 });
      for (let k = 1; k < 4; k++) box(g, x + k * 45, GY - 146, 1, 142, dark(PLY, 0.25));
      box(g, x - 6, GY - 158, 192, 10, dark(PLY, 0.4)); box(g, x - 6, GY - 158, 192, 2, lite(PLY, 0.3));
      slab(g, x + 18, GY - 120, 70, 50, '#3A2E1E', { edge: 2 });
      box(g, x + 22, GY - 116, 62, 42, '#F2C66A');
      for (let y = GY - 116; y < GY - 76; y += 5) box(g, x + 22, y, 62, 2, '#C9963E');
      box(g, x + 110, GY - 110, 52, 110, '#1A120C');
      slab(g, x + 118, GY - 100, 30, 100, '#B91C1C', { edge: 2 }); box(g, x + 122, GY - 94, 22, 40, '#7DD3FC'); box(g, x + 122, GY - 94, 22, 3, '#E0F2FE');
      g.fillStyle = dark(PLY, 0.1); g.beginPath(); g.moveTo(x + 110, GY - 110); g.lineTo(x + 92, GY - 104); g.lineTo(x + 92, GY + 2); g.lineTo(x + 110, GY); g.closePath(); g.fill();
      sign(g, x + 104, GY - 136, 64, 12, '#F1EFEA', 'BREAK ROOM', '#1A0B06', 6, '#6B7280', enamel(6, '#1A0B06'));
      break;
    }
  }
};
const PROP_W: Record<Prop['kind'], [number, number]> = {
  case: [-6, 180], rack: [-40, 170], board: [-20, 140], ladder: [-20, 80], break: [-10, 200], cooler: [-4, 110], title: [-20, 300], cable: [-10, 190],
  flats: [-8, 232], bones: [-4, 190], paint: [-14, 270], projector: [-36, 160], snakes: [-4, 168], dimmer: [-2, 150],
};
const drawProps = (c: Ctx, eye: Eye, f: number) => {
  const [s0, s1] = spanAt(eye, PROPS_D, 40);
  inDepth(c, eye, PROPS_D, () => {
    for (const p of PROPS) {
      const [a, w] = PROP_W[p.kind];
      if (p.x + a + w < s0 || p.x + a > s1) continue;
      const top = p.kind === 'title' ? GY - 480 : p.kind === 'projector' ? GY - 340 : GY - 270;
      if (p.kind === 'title') for (const cx of [p.x + 10, p.x + 250]) chain(c, cx, CHAIN_TOP, GY - 470, '#4A4A4E');
      stamp(c, `tpl-prop-${p.x}`, p.x + a, top, w, GY - top + 6, g => paintProp(g, p));
      // (what's live on them: the dimmers' LEDs, the projector's beam to the pane while the ghost's up)
      if (p.kind === 'dimmer') for (let k = 0; k < 2; k++) for (let y = GY - 178; y < GY - 30; y += 12) { const on = hash(y * 0.3 + k + Math.floor(f / 9) * 0.17) < 0.6; box(c, p.x + k * 56 + 44, y + 2, 2, 2, on ? '#22C55E' : '#14532D'); }
      if (p.kind === 'projector' && f % 120 < 60) {
        const [lx, ly] = PROJ_LENS;
        for (let k = 0; k < 3; k++) quad(c, `rgba(200, 225, 255, ${(0.05 - k * 0.013).toFixed(3)})`, [lx + 6, ly - 3 - k * 2], [lx + 6, ly + 3 + k * 2], [lx + 200, ly + 100 + k * 22], [lx + 200, ly - 10 - k * 18]);
      }
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The scaffolds (every ledge he can stand on): a planked deck, lit along its front edge, on tube frames down to the
// floor, braced; the deck's top going back

const scaffold = (c: Ctx, eye: Eye, x: number, y: number, w: number, i: number, f: number) => {
  const back = 0.93;
  // (the frames: tubes at the front and the back, cross-braced, base plates)
  for (const d of [back, 1]) {
    const col = d < 1 ? '#4B525C' : STEEL;
    for (const lx of [x + 6, x + w - 10]) {
      const a = at(eye, lx, y + 10, d), b = at(eye, lx, GY, d);
      box(c, a[0] - 1, a[1], 6 * d, b[1] - a[1], INK); box(c, a[0], a[1], 4 * d, b[1] - a[1], col); box(c, a[0], a[1], 1, b[1] - a[1], lite(col, 0.35));
      box(c, b[0] - 3, b[1] - 2, 10 * d, 3, '#2A2C30');
    }
    // (the X brace)
    const p = at(eye, x + 8, y + 14, d), q = at(eye, x + w - 8, GY - 6, d), p2 = at(eye, x + w - 8, y + 14, d), q2 = at(eye, x + 8, GY - 6, d);
    seg(c, p, q, d < 1 ? '#3A4048' : '#5E6670', 2); seg(c, p2, q2, d < 1 ? '#3A4048' : '#5E6670', 2);
  }
  // (the rails going back between the frames, at the deck and the foot)
  for (const lx of [x + 8, x + w - 8]) for (const yy of [y + 12, GY - 4]) seg(c, at(eye, lx, yy, back), [lx, yy], '#59616C', 2);
  // (the deck's top, planked, going back; seen from above)
  if (eye.y < y) {
    const pl = rampOf('#8A6B42');
    quad(c, pl[2], [x, y], [x + w, y], at(eye, x + w, y, back), at(eye, x, y, back));
    for (let k = 1; k < 4; k++) { const d = 1 - (1 - back) * (k / 4); seg(c, at(eye, x, y, d), at(eye, x + w, y, d), pl[1], 1); }
  }
  // (the front: the plank ends, the toe board, a tag; the lit lip)
  slab(c, x, y, w, 10, '#8A6B42', { edge: 2 });
  for (let k = x + 30; k < x + w - 6; k += 34) box(c, k, y + 2, 1, 7, dark('#8A6B42', 0.4));
  box(c, x, y, w, 2, '#F2D08A'); box(c, x, y + 2, w, 1, '#C9A160');
  // (a tag on the frame)
  if (i % 3 === 0) { box(c, x + w - 30, y + 24, 14, 18, '#16A34A'); box(c, x + w - 28, y + 26, 10, 3, '#F1EFEA'); box(c, x + w - 24, y + 14, 1, 10, '#D1D5DB'); }
  // (a clamp light on it, pointed down: the work light)
  if (i % 2 === 0) {
    const lx = x + 18, ly = y + 12;
    box(c, lx, ly, 2, 8, '#2A2C30');
    c.fillStyle = INK; c.beginPath(); c.moveTo(lx - 7, ly + 6); c.lineTo(lx + 9, ly + 6); c.lineTo(lx + 6, ly + 18); c.lineTo(lx - 4, ly + 18); c.closePath(); c.fill();
    c.fillStyle = '#9CA3AF'; c.beginPath(); c.moveTo(lx - 6, ly + 7); c.lineTo(lx + 8, ly + 7); c.lineTo(lx + 5, ly + 17); c.lineTo(lx - 3, ly + 17); c.closePath(); c.fill();
    box(c, lx - 3, ly + 17, 8, 2, f % 97 === 0 ? '#C9A160' : '#FFF4C8');
    // (its cord, drooping off to the frame)
    c.strokeStyle = '#18181B'; c.lineWidth = 1; c.beginPath(); c.moveTo(lx + 2, ly + 8); c.quadraticCurveTo(lx + 14, ly + 50, x + 6, ly + 60); c.stroke();
  }
};
/** Where the work lights hang (for the lighting). */
const workLights = (): [number, number][] => LEDGES.filter((_, i) => i % 2 === 0).map(([x, y]) => [x + 19, y + 30]);

// ---------------------------------------------------------------------------------------------------------------
// The tricks

const drawBackDoor = (c: Ctx, eye: Eye, f: number) => {
  // the wall: painted block, the door's frame, the door off its top hinge
  block3d(c, eye, T - 60, GY - 700, 70, GY, '#3A3330', 0.88, g => {
    slab(g, T - 60, GY - 700, 70, 700, '#3A3330', { edge: 4 });
    for (let y = GY - 700; y < GY; y += 16) box(g, T - 58, y, 66, 1, '#2A2422');
    box(g, T - 60, GY - 16, 70, 16, '#4A403A');
  }, { key: 'tpl-door-wall', lip: false, part: 'front' });
  // (the doorway: in that wall (the room's end, going back), a hole through to the dino park's day, its frame)
  const X = ROOM_L, D0 = 0.995, D1 = 0.9, H = 104;
  const p = (y: number, d: number) => at(eye, X, y, d);
  if (eye.x > X) {
    quad(c, '#5A5E66', p(GY - H - 4, D0 + 0.004), p(GY - H - 4, D1 - 0.008), p(GY, D1 - 0.008), p(GY, D0 + 0.004));
    c.save(); c.beginPath();
    const q = [p(GY - H, D0), p(GY - H, D1), p(GY, D1), p(GY, D0)];
    c.moveTo(q[0][0], q[0][1]); for (const v of q.slice(1)) c.lineTo(v[0], v[1]); c.closePath(); c.clip();
    // (the day out there: sky, the park's green, a palm; banded)
    const top = Math.min(q[0][1], q[1][1]), bot = Math.max(q[2][1], q[3][1]), l = Math.min(q[0][0], q[1][0]), w = Math.max(q[0][0], q[1][0]) - l;
    bandedGradient(c, l, top, w, bot - top, ['#8FB8D8', '#B9D7C2', '#5E8A4A'], 6);
    quad(c, '#4E6B34', p(GY - 30, D0), p(GY - 30, D1), p(GY, D1), p(GY, D0));
    quad(c, '#2E4A22', p(GY - 70, 0.95), p(GY - 70, 0.93), p(GY - 20, 0.93), p(GY - 20, 0.95));
    c.restore();
    seg(c, p(GY - H - 2, D0), p(GY - H - 2, D1), '#3A3E44', 3);
  }
  // (the door: kicked in, swung right round into the room on its hinges at the far jamb (so it's face on, back
  // there), and hanging off the top one; splintered at the lock)
  inDepth(c, eye, D1, () => {
    c.save(); c.translate(X + 2, GY - 1); c.rotate(0.12);
    slab(c, 0, -96, 50, 96, '#5A5E66', { edge: 2 });
    box(c, 6, -88, 38, 34, '#4E525A'); box(c, 6, -46, 38, 38, '#4E525A');
    box(c, 40, -50, 8, 3, '#C0C4CC');
    box(c, 46, -58, 4, 8, '#D8C08A'); box(c, 44, -50, 2, 4, '#D8C08A');
    c.restore();
  });
  // (the exit sign over it: a blade sign, stuck out from the wall face on to him, lit; and what it's for)
  inDepth(c, eye, 0.95, () => {
    const dx = X;
    box(c, dx, GY - 146, 6, 4, '#3A3E44');
    const glow = f % 180 < 2 ? '#14532D' : '#22C55E';
    slab(c, dx + 4, GY - 150, 56, 22, '#1A1A1A', { edge: 2 });
    signAt(c, 'EXIT', dx + 32, GY - 135, 8, led(8, glow, '#1A1A1A'));
    sign(c, dx + 2, GY - 124, 68, 8, '#F1EFEA', 'DINO PARK', '#1A0B06', 6, '#6B7280', enamel(6, '#1A0B06'));
  });
};

const drawCatapult = (c: Ctx, eye: Eye, state: GameState, tp: Temple) => {
  const X = CATAPULT_X, f = state.frame;
  const manned = crewed(state, 1);
  // the arm's swing: cocked back (to the right), wound back down after each throw, flung over to the left
  const t = tp.catapultT;
  const wind = Math.max(0, Math.min(1, 1 - (t - 90) / 50));
  const ang = !manned ? 1.15 : t <= 20 ? -0.35 + 1.5 * (t / 20) : 1.15 * wind - 0.35 * (1 - wind);
  // (the base: a timber sled on iron wheels, going back)
  block3d(c, eye, X - 70, GY - 34, 150, GY - 12, '#6A4A2A', 0.93, g => {
    slab(g, X - 70, GY - 34, 150, 22, '#6A4A2A', { edge: 2 });
    for (const bx of [X - 64, X - 10, X + 62]) { box(g, bx, GY - 30, 6, 14, '#3A3E44'); box(g, bx + 1, GY - 28, 2, 2, '#C0C4CC'); }
  }, { key: 'tpl-cata-base', lip: false, part: 'front' });
  for (const wx of [X - 50, X + 60]) { ball(c, wx, GY - 10, 10, '#3A3E44'); box(c, wx - 1 + Math.round(Math.cos(wx) * 5), GY - 11, 3, 3, '#9CA3AF'); }
  // (the A-frame uprights, the axle; the back one dimmer)
  for (const d of [0.95, 1]) {
    const col = d < 1 ? '#4A3220' : '#7A5430';
    const a = at(eye, X - 40, GY - 34, d), b = at(eye, X - 4, GY - 96, d), cc = at(eye, X + 32, GY - 34, d);
    seg(c, a, b, INK, 9 * d); seg(c, b, cc, INK, 9 * d); seg(c, a, b, col, 7 * d); seg(c, b, cc, col, 7 * d);
    seg(c, [a[0] + 1, a[1]], [b[0] + 1, b[1]], lite(col, 0.3), 1);
  }
  ball(c, X - 4, GY - 94, 5, '#9CA3AF');
  // (the stop beam it slams into)
  slab(c, X - 46, GY - 132, 10, 40, '#5A3A20', { edge: 2 }); box(c, X - 46, GY - 120, 10, 8, '#2A2A2E');
  // the arm, and the bucket on the end (a boulder sat in it while it's cocked)
  c.save(); c.translate(X - 4, GY - 94); c.rotate(-Math.PI / 2 + ang);
  // (rotated so +x points along the arm)
  slab(c, -14, -5, 120, 10, '#8A5E34', { edge: 2 });
  box(c, 20, -6, 6, 12, '#3A3E44'); box(c, 70, -6, 6, 12, '#3A3E44');
  c.fillStyle = INK; c.beginPath(); c.arc(112, 0, 16, -Math.PI / 2, Math.PI / 2, true); c.fill();
  c.fillStyle = '#4A4E56'; c.beginPath(); c.arc(112, 0, 14, -Math.PI / 2, Math.PI / 2, true); c.fill();
  if (manned && t > 20 && wind > 0.95) drawBoulder(c, 104, 0, 11, 0);
  c.restore();
  // (the winch it's wound back with, the rope to the arm)
  slab(c, X + 50, GY - 74, 24, 40, '#5A3A20', { edge: 2 });
  ball(c, X + 62, GY - 64, 8, '#6B7280');
  const crank = manned && t > 90 ? f * 0.3 : 0;
  box(c, X + 62 + Math.cos(crank) * 12 - 2, GY - 64 + Math.sin(crank) * 12 - 2, 5, 5, '#B91C1C');
  const tip = [X - 4 + Math.cos(-Math.PI / 2 + ang) * 60, GY - 94 + Math.sin(-Math.PI / 2 + ang) * 60];
  c.strokeStyle = '#C9B38A'; c.lineWidth = 1; c.beginPath(); c.moveTo(X + 62, GY - 64); c.lineTo(tip[0], tip[1]); c.stroke();
  // (the pile of them: real ones; the placard says so, and somebody's added to it)
  for (let i = 0; i < 6; i++) {
    const bx = X + 120 + (i % 3) * 22 + (i > 2 ? 11 : 0), by = GY - 12 - (i > 2 ? 20 : 0);
    if (i < 5) drawBoulder(c, bx, by, 12, i * 1.7);
  }
  slab(c, X + 112, GY - 96, 80, 34, '#E7E2D2', { edge: 2 });
  signAt(c, 'BOULDERS', X + 152, GY - 82, 6, print(6, '#1A0B06'));
  signAt(c, '(REAL)', X + 152, GY - 72, 6, print(6, '#B91C1C'));
  box(c, X + 116, GY - 62, 72, 9, TAPE_W); text(c, 'INSURANCE SAID FOAM', X + 152, GY - 55, '#1E3A8A', 4, 'center', null);
  // (stenciled on the frame's back upright: what it is)
  inDepth(c, eye, 0.95, () => sign(c, X - 70, GY - 230, 140, 16, '#2A2A2E', 'THE ROLLING BOULDER', '#E8C130', 6, '#4A4E56', stencil(6, '#E8C130')));
  inDepth(c, eye, 0.95, () => { box(c, X - 60, GY - 210, 2, 116, '#3A3A3E'); box(c, X + 58, GY - 210, 2, 176, '#3A3A3E'); });
};

const drawDartWall = (c: Ctx, eye: Eye, state: GameState, tp: Temple) => {
  const f = state.frame, X = DART_WALL;
  // the wall: from this side (the ride's), carved stone faces in fiberglass; the holes in their mouths
  block3d(c, eye, X, DART_TOP, 40, GY, '#7A7466', 0.86, g => {
    slab(g, X, DART_TOP, 40, GY - DART_TOP, '#7A7466', { edge: 4 });
    // (the block courses, painted on the foam: each a lit top, a dark joint)
    const wr = rampOf('#7A7466');
    for (let y = DART_TOP + 8; y < GY; y += 20) { box(g, X + 2, y, 36, 1, wr[0]); box(g, X + 2, y + 1, 36, 1, wr[3]); box(g, X + 2 + ((y / 20) % 2) * 18, y - 19, 1, 19, wr[0]); }
    for (let k = 0; k < 3; k++) {
      const fy = DART_TOP + 18 + k * 60, r = rampOf('#8E8676');
      // (a carved face: the slab it's on, the brow, sunk eyes, a broad nose, a grimace; lit from the upper left)
      box(g, X + 3, fy - 1, 34, 48, INK);
      box(g, X + 4, fy, 32, 46, r[1]); box(g, X + 6, fy + 2, 28, 42, r[2]); box(g, X + 6, fy + 2, 4, 42, r[3]); checker(g, X + 10, fy + 2, 1, 42, r[3]);
      box(g, X + 7, fy + 6, 26, 3, r[4]); box(g, X + 7, fy + 9, 26, 1, r[0]);
      box(g, X + 8, fy + 11, 8, 5, INK); box(g, X + 24, fy + 11, 8, 5, INK); box(g, X + 9, fy + 14, 6, 1, r[1]); box(g, X + 25, fy + 14, 6, 1, r[1]);
      box(g, X + 16, fy + 16, 8, 11, r[3]); box(g, X + 16, fy + 16, 2, 11, r[4]); box(g, X + 22, fy + 18, 2, 9, r[1]); box(g, X + 15, fy + 26, 10, 2, r[0]);
      box(g, X + 10, fy + 32, 20, 7, INK); box(g, X + 11, fy + 33, 18, 5, r[0]);
      for (let q = 0; q < 4; q++) box(g, X + 12 + q * 4, fy + 33, 2, 2, r[3]);
      box(g, X + 9, fy + 39, 22, 1, r[4]);
      // (moss in its creases; a chip off the corner, the foam showing yellow under the paint)
      box(g, X + 6, fy + 2, 28, 3, '#4C6B3A'); checker(g, X + 6, fy + 5, 28, 2, '#3E5A2E'); box(g, X + 30, fy + 28, 4, 10, '#3E5A2E');
      if (k === 1) { box(g, X + 29, fy + 3, 6, 5, '#E8C66A'); box(g, X + 30, fy + 4, 4, 2, '#F2D88A'); }
    }
    box(g, X, DART_TOP, 40, 6, '#4C6B3A'); checker(g, X, DART_TOP + 6, 40, 2, '#3E5A2E');
  }, { key: 'tpl-dart-wall', part: 'front' });
  // (the holes: glowing before a volley)
  const tell = crewed(state, 2) && tp.dartT <= DART_TELL;
  for (const h of [true, false]) {
    const lit = tell && tp.dartHigh === h;
    box(c, X - 5, dartY(h) - 5, 8, 10, INK);
    box(c, X - 4, dartY(h) - 4, 6, 8, lit ? (f % 4 < 2 ? '#FDE047' : '#F97316') : '#100C0A');
    if (lit) steppedGlow(c, X - 2, dartY(h), 18, '#FDE047', 0.35, 0.05, 3);
  }
  // the rig behind it: PVC pipes from the holes back to a manifold, the leaf blower on a stand, a bucket of darts
  const rx = X + 40;
  for (const h of [true, false]) { box(c, rx, dartY(h) - 3, 34, 6, '#E7E5E4'); box(c, rx, dartY(h) - 3, 34, 1, '#FFFFFF'); box(c, rx, dartY(h) + 2, 34, 1, '#A8A29E'); }
  box(c, rx + 30, dartY(true) - 4, 8, dartY(false) - dartY(true) + 8, '#D6D3D1');
  slab(c, rx + 38, GY - 46, 44, 26, '#E8701A', { edge: 2 });
  box(c, rx + 44, GY - 42, 28, 4, '#1A1A1A'); text(c, 'LEAFMASTER', rx + 60, GY - 26, INK, 4, 'center', null);
  if (crewed(state, 2)) for (let i = 0; i < 3; i++) box(c, rx + 82 + ((f * 3 + i * 7) % 14), GY - 40 + i * 4, 3, 1, 'rgba(255,255,255,0.4)');
  box(c, rx + 50, GY - 20, 4, 20, '#3A3E44'); box(c, rx + 42, GY - 2, 20, 2, '#3A3E44');
  slab(c, rx + 92, GY - 30, 26, 30, '#D8D4CC', { edge: 2 });
  for (let k = 0; k < 5; k++) { box(c, rx + 95 + k * 4, GY - 40 + (k % 2) * 3, 1, 12, '#D4D4D8'); box(c, rx + 94 + k * 4, GY - 42 + (k % 2) * 3, 3, 3, '#EF4444'); }
  text(c, 'DARTS', rx + 105, GY - 12, '#1A0B06', 4, 'center', null);
  // (the crew's sign for it, taped to the back of the wall: you see it from his side going over)
  slab(c, X + 2, DART_TOP + 26, 36, 50, '#F1EFEA', { edge: 2 });
  text(c, 'POISON', X + 20, DART_TOP + 40, '#B91C1C', 4, 'center', null);
  text(c, 'DART', X + 20, DART_TOP + 48, '#B91C1C', 4, 'center', null);
  text(c, 'TRAP', X + 20, DART_TOP + 56, '#B91C1C', 4, 'center', null);
  text(c, 'RELOAD', X + 20, DART_TOP + 66, '#1A0B06', 4, 'center', null);
  box(c, X + 4, DART_TOP + 24, 10, 4, TAPE_Y); box(c, X + 26, DART_TOP + 24, 10, 4, TAPE_Y);
};

const drawGhost = (c: Ctx, eye: Eye, f: number) => {
  // the black velvet booth he stands in (going back), the glass on its stand at an angle, his spot
  const bx = GHOST_X - 120;
  inDepth(c, eye, 0.94, () => stamp(c, 'tpl-ghost-booth', bx - 10, GY - 210, 140, 214, g => {
    slab(g, bx, GY - 190, 120, 190, '#0E0B0D', { edge: 2 });
    for (let k = 0; k < 9; k++) box(g, bx + 6 + k * 13, GY - 186, 4, 186, k % 2 ? '#17121A' : '#0A080B');
    slab(g, bx - 6, GY - 204, 132, 16, '#2A2A2E', { edge: 2 });
    signAt(g, "PEPPER'S GHOST", bx + 60, GY - 193, 6, enamel(6, '#E8C130'));
  }));
  // (his spot: on when he's doing his bit)
  const on = (f % 120) < 60;
  const [sx, sy] = at(eye, GHOST_X - 70, GY - 200, 0.94);
  // (a soft wash on him from a lamp in the booth's top, not a beam: the lamp's housing, its glow round him)
  box(c, sx - 8, sy - 2, 16, 6, '#1A1A1E'); box(c, sx - 6, sy + 4, 12, 1, on ? '#E0F2FE' : '#3A3A40');
  if (on) steppedGlow(c, sx, sy + 110, 70, '#BAE6FD', 0.12, 0.0, 4);
  // (him, in the suit: the bones painted on, a skull hood; arms up and waving while he's on)
  c.save(); c.translate(GHOST_X - 70, GY); c.scale(-1, 1);
  drawBoneSuit(c, f, on);
  c.restore();
  // (the pane: the frame on its stand, the glass, the light catching it in bands; his reflection on it, faint)
  c.save(); c.translate(GHOST_X, GY); c.rotate(-0.35);
  box(c, -2, -180, 4, 180, '#9CA3AF');
  c.fillStyle = 'rgba(186, 230, 253, 0.12)'; c.fillRect(2, -176, 40, 176);
  for (let k = 0; k < 4; k++) box(c, 6 + k * 9, -176, 2, 176, `rgba(224, 242, 254, ${0.16 - k * 0.03})`);
  box(c, 2, -178, 42, 3, '#9CA3AF'); box(c, 42, -180, 3, 180, '#6B7280');
  if (on) { c.globalAlpha = 0.22; c.translate(22, -10); c.scale(0.8, 0.8); drawBoneSuit(c, f, true); c.globalAlpha = 1; }
  c.restore();
  // (and the note taped to the frame)
  box(c, GHOST_X + 3, GY - 92, 46, 26, '#F1EFEA'); box(c, GHOST_X + 18, GY - 95, 16, 4, TAPE_Y);
  signText(c, 'DO NOT', GHOST_X + 26, GY - 83, print(4, '#B91C1C'));
  signText(c, 'LEAN ON', GHOST_X + 26, GY - 75, print(4, '#B91C1C'));
  signText(c, 'GLASS', GHOST_X + 26, GY - 67, print(4, '#B91C1C'));
  // the base of the stand
  box(c, GHOST_X - 20, GY - 4, 60, 4, '#3A3E44');
};

const drawFogMachine = (c: Ctx, f: number) => {
  const X = FOG_X, r = rampOf('#2E2E34');
  slab(c, X, GY - 34, 50, 34, '#26262A', { edge: 2 });
  box(c, X + 2, GY - 32, 46, 2, r[3]); box(c, X + 2, GY - 30, 2, 28, r[3]); box(c, X + 2, GY - 6, 46, 4, r[0]);
  for (let k = 0; k < 5; k++) { box(c, X + 6 + k * 6, GY - 28, 3, 12, '#111114'); box(c, X + 6 + k * 6, GY - 28, 3, 1, r[4]); }
  box(c, X + 50, GY - 24, 10, 8, '#3A3E44'); box(c, X + 50, GY - 24, 10, 1, '#6A707A'); box(c, X + 58, GY - 26, 4, 12, '#52565E'); box(c, X + 58, GY - 26, 1, 12, '#8A909A');
  box(c, X + 10, GY - 40, 30, 6, '#3A3E44'); box(c, X + 10, GY - 40, 30, 1, '#6A707A');
  box(c, X + 4, GY - 14, 30, 8, '#E8C130'); signAt(c, 'FOG-O-MATIC', X + 19, GY - 11, 4, print(4, INK));
  // (the DMX cable from the dimmer racks, and the remote on its cord)
  c.strokeStyle = '#2563EB'; c.lineWidth = 2; c.beginPath(); c.moveTo(X + 50, GY - 8); c.quadraticCurveTo(X + 66, GY + 2, X + 90, GY - 2); c.stroke();
  box(c, X + 38, GY - 12, 4, 4, f % 40 < 20 ? '#EF4444' : '#450A0A');
  // (the juice, in a jug on top, its tube)
  slab(c, X + 4, GY - 62, 20, 24, '#D8E8F0', { edge: 2 }); box(c, X + 6, GY - 54, 16, 14, '#A8D0E8');
  text(c, 'FOG', X + 14, GY - 46, '#1E3A8A', 4, 'center', null); text(c, 'JUICE', X + 14, GY - 40, '#1E3A8A', 4, 'center', null);
  c.strokeStyle = '#D6D3D1'; c.lineWidth = 1; c.beginPath(); c.moveTo(X + 14, GY - 62); c.quadraticCurveTo(X + 30, GY - 76, X + 36, GY - 40); c.stroke();
  // (its cord, taped down across the floor)
  box(c, X - 120, GY - 2, 120, 2, '#111114');
  for (const tx of [X - 100, X - 40]) box(c, tx, GY - 3, 10, 4, '#3A3A3E');
};

const drawSnakeRig = (c: Ctx, eye: Eye, state: GameState, tp: Temple) => {
  const X = SNAKE_WALL, f = state.frame, manned = crewed(state, 3);
  // the wall: this side painted rock (fiberglass), the hole the serpent comes out of; the speaker that does its hiss
  block3d(c, eye, X, SNAKE_TOP, 50, GY, '#6E665A', 0.86, g => {
    slab(g, X, SNAKE_TOP, 50, GY - SNAKE_TOP, '#6E665A', { edge: 4 });
    const r = rampOf('#6E665A');
    for (let k = 0; k < 9; k++) { const ky = SNAKE_TOP + 20 + k * 36; box(g, X + 4, ky, 42, 2, r[1]); box(g, X + 4 + (k % 2) * 20, ky + 2, 20, 2, r[3]); }
    for (let k = 0; k < 8; k++) box(g, X + 2 + (k * 13) % 44, SNAKE_TOP + 6 + k * 41, 4, 16, '#3E5A2E');
    // (the warning, on the crew side's edge where you'd see it climbing)
    box(g, X + 3, GY - 210, 44, 64, INK);
    for (let k = 0; k < 6; k++) box(g, X + 4 + k * 8, GY - 209, 4, 6, k % 2 ? INK : '#E8C130');
    box(g, X + 4, GY - 202, 42, 54, '#E8C130');
    text(g, 'DANGER', X + 25, GY - 192, INK, 4, 'center', null);
    text(g, 'PNEUMATIC', X + 25, GY - 184, INK, 4, 'center', null);
    text(g, '1,200 PSI', X + 25, GY - 174, '#B91C1C', 4, 'center', null);
    text(g, 'DO NOT', X + 25, GY - 164, INK, 4, 'center', null);
    text(g, 'STAND IN', X + 25, GY - 158, INK, 4, 'center', null);
    text(g, 'FRONT', X + 25, GY - 152, INK, 4, 'center', null);
  }, { key: 'tpl-snake-wall', part: 'front' });
  // (the hole)
  c.fillStyle = INK; c.beginPath(); c.ellipse(X + 4, SNAKE_Y, 10, 30, 0, 0, Math.PI * 2); c.fill();
  // (the speaker, bolted up by the hole: its cone thumping with the hiss)
  const s = manned ? snakeOut(tp.snakeT) : { k: 0, rear: false };
  slab(c, X + 6, SNAKE_Y - 70, 30, 30, '#26262A', { edge: 2 });
  const throb = s.rear && f % 4 < 2 ? 1 : 0;
  ball(c, X + 21, SNAKE_Y - 55, 9 + throb, '#3A3A40'); ball(c, X + 21, SNAKE_Y - 55, 3, '#18181B', false);
  if (s.rear) for (let k = 1; k <= 2; k++) { c.strokeStyle = `rgba(187, 247, 208, ${0.5 - k * 0.15})`; c.lineWidth = 1; c.beginPath(); c.arc(X + 21, SNAKE_Y - 55, 12 + k * 5 + (f % 6), Math.PI * 0.6, Math.PI * 1.4); c.stroke(); }
  // the ram: its cylinder on the far side, stenciled; its air line to the compressor; the tank, its gauge
  const cy = SNAKE_Y;
  slab(c, X + 50, cy - 12, 96, 24, '#B91C1C', { edge: 2 });
  for (const bx of [X + 52, X + 140]) box(c, bx, cy - 14, 4, 28, '#9CA3AF');
  text(c, 'SERPENT OF DOOM', X + 98, cy + 3, '#F8FAFC', 4, 'center', null);
  box(c, X + 146, cy - 4, 10, 8, '#52565E');
  box(c, X + 140, cy + 12, 6, GY - cy - 12, '#3A3E44');
  c.strokeStyle = '#18181B'; c.lineWidth = 3; c.beginPath(); c.moveTo(X + 156, cy); c.bezierCurveTo(X + 200, cy + 40, X + 150, GY - 60, X + 190, GY - 40); c.stroke();
  c.strokeStyle = '#E8C130'; c.lineWidth = 1; c.beginPath(); c.moveTo(X + 156, cy - 1); c.bezierCurveTo(X + 200, cy + 39, X + 150, GY - 61, X + 190, GY - 41); c.stroke();
  // (the compressor: a tank on its side, the motor on it, the gauge's needle)
  const tk = X + 180;
  pole(c, tk, GY - 56, 70, 40, '#B91C1C');
  box(c, tk + 8, GY - 16, 8, 16, '#3A3E44'); box(c, tk + 54, GY - 16, 8, 16, '#3A3E44');
  slab(c, tk + 18, GY - 80, 34, 24, '#3A3E44', { edge: 2 });
  ball(c, tk + 6, GY - 70, 8, '#F1EFEA', true);
  const needle = manned ? -0.5 + Math.sin(f * 0.05) * 0.2 + (s.k > 0.5 ? 1 : 0) : -1.2;
  c.strokeStyle = '#B91C1C'; c.lineWidth = 1; c.beginPath(); c.moveTo(tk + 6, GY - 70); c.lineTo(tk + 6 + Math.sin(needle) * 6, GY - 70 - Math.cos(needle) * 6); c.stroke();
  if (!manned) {
    // locked out: the tag on the valve
    box(c, X + 150, cy + 6, 1, 10, '#D1D5DB'); slab(c, X + 142, cy + 16, 18, 24, '#B91C1C', { edge: 2 });
    text(c, 'LOCK', X + 151, cy + 28, '#F8FAFC', 4, 'center', null); text(c, 'OUT', X + 151, cy + 35, '#F8FAFC', 4, 'center', null);
  }
};

/** The serpent: a big rubber puppet head on the ram's rod, lunging out of the hole (in front). */
const drawSnakeHead = (c: Ctx, state: GameState, tp: Temple) => {
  const f = state.frame, manned = crewed(state, 3);
  const s = manned ? snakeOut(tp.snakeT) : { k: 0, rear: false };
  const hx = SNAKE_WALL - Math.max(-0.12, s.k) * SNAKE_REACH, y = SNAKE_Y + (manned ? 0 : 10);
  // (the rod: chrome, banded)
  const rl = SNAKE_WALL + 50 - (hx + 20);
  if (rl > 0) { box(c, hx + 20, y - 5, rl, 10, INK); box(c, hx + 20, y - 4, rl, 3, '#E5E7EB'); box(c, hx + 20, y - 1, rl, 3, '#9CA3AF'); box(c, hx + 20, y + 2, rl, 2, '#6B7280'); }
  // (the neck: a ribbed rubber sleeve over it)
  const neck = Math.min(rl, 80);
  for (let k = 0; k < neck; k += 8) { const r = rampOf('#2F7A3A'); box(c, hx + 16 + k, y - 13, 8, 26, INK); box(c, hx + 17 + k, y - 12, 6, 24, k % 16 ? r[2] : r[1]); box(c, hx + 17 + k, y - 12, 6, 3, r[3]); }
  // (the head: wedge-shaped, scaled, the jaw hung open when it lunges; a seam and bolts round the back)
  const open = manned ? Math.max(0, s.k) * 14 + (s.rear ? 4 : 0) : 2;
  const r = rampOf('#2F7A3A');
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 26, y - 30); c.lineTo(hx - 34, y - 18); c.lineTo(hx - 46, y - 4); c.lineTo(hx + 26, y + 6); c.closePath(); c.fill();
  c.fillStyle = r[2]; c.beginPath(); c.moveTo(hx + 24, y - 28); c.lineTo(hx - 33, y - 17); c.lineTo(hx - 44, y - 5); c.lineTo(hx + 24, y + 4); c.closePath(); c.fill();
  c.fillStyle = r[3]; c.beginPath(); c.moveTo(hx + 24, y - 28); c.lineTo(hx - 33, y - 17); c.lineTo(hx - 30, y - 12); c.lineTo(hx + 24, y - 20); c.closePath(); c.fill();
  // (the scales: rows of them, each a lit lip over a shadow, staggered; the brow ridge over the eye; the nostril)
  for (let row = 0; row < 3; row++) for (let k = 0; k < 7 - row * 2; k++) {
    const sx = hx - 22 + row * 6 + k * 8 + (row % 2) * 4, sy = y - 22 + row * 6 + Math.round((sx - hx) * 0.08);
    box(c, sx, sy, 6, 1, r[4]); box(c, sx, sy + 1, 6, 2, r[3]); box(c, sx + 1, sy + 3, 5, 1, r[1]);
  }
  checker(c, hx - 28, y - 9, 50, 2, r[1]);
  box(c, hx - 21, y - 23, 14, 3, r[1]); box(c, hx - 21, y - 24, 14, 1, r[4]);
  box(c, hx - 41, y - 10, 3, 2, INK);
  // (the jaw: its belly plates, pale, banded)
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 24, y + 4); c.lineTo(hx - 42, y + open); c.lineTo(hx - 34, y + 12 + open); c.lineTo(hx + 24, y + 26); c.closePath(); c.fill();
  c.fillStyle = r[1]; c.beginPath(); c.moveTo(hx + 22, y + 6); c.lineTo(hx - 40, y + 1 + open); c.lineTo(hx - 33, y + 10 + open); c.lineTo(hx + 22, y + 24); c.closePath(); c.fill();
  for (let k = 0; k < 6; k++) { const bx = hx + 14 - k * 9, by = y + 20 - k * 2 + open * (k / 6); box(c, bx - 4, by, 7, 3, '#C8C27A'); box(c, bx - 4, by, 7, 1, '#E8E2A0'); box(c, bx - 4, by + 3, 7, 1, '#6E6A3A'); }
  if (open > 3) {
    c.fillStyle = '#7F1D1D'; c.beginPath(); c.moveTo(hx + 10, y + 4); c.lineTo(hx - 42, y - 4); c.lineTo(hx - 40, y + open); c.lineTo(hx + 10, y + 10); c.closePath(); c.fill();
    // fangs, a forked tongue
    box(c, hx - 38, y - 4, 3, 8, '#F8FAFC'); box(c, hx - 26, y - 5, 3, 7, '#F8FAFC');
    const tl = 10 + Math.sin(f * 0.8) * 4;
    box(c, hx - 44 - tl, y + open / 2, tl, 2, '#DC2626'); box(c, hx - 48 - tl, y + open / 2 - 3, 4, 2, '#DC2626'); box(c, hx - 48 - tl, y + open / 2 + 3, 4, 2, '#DC2626');
  }
  // (the eye: lit when it's live, a dead marble when it isn't)
  const eyeCol = manned ? (s.rear ? '#FDE047' : '#FACC15') : '#57534E';
  box(c, hx - 18, y - 20, 10, 7, INK); box(c, hx - 17, y - 19, 8, 5, eyeCol); box(c, hx - 13, y - 19, 2, 5, INK);
  // (the back of it: the seam, the bolts, the hose clamp on the rod)
  box(c, hx + 18, y - 26, 2, 50, r[0]);
  for (const by of [y - 18, y - 4, y + 12]) box(c, hx + 20, by, 3, 3, '#9CA3AF');
};

// ---------------------------------------------------------------------------------------------------------------
// The loading station: the line snaking back into the dark (switchbacks going back and up a ramp), the rails, the
// banner, the wait-time sign; the platform, the track and its tunnel; the booth

interface Row { d: number; rise: number; guests: Guest[] }
let ROWS: Row[] | null = null;
const QX0 = STATION_X + 80, QX1 = STATION_X + 1340;
const rows = (): Row[] => {
  if (ROWS) return ROWS;
  const out: Row[] = [];
  // (four switchbacks across the floor going back, then the line climbs a ramp at the back into the dark)
  const depths = [0.9, 0.79, 0.7, 0.63, 0.58, 0.54];
  depths.forEach((d, k) => {
    const rise = k < 4 ? 0 : (k - 3) * 44;
    const guests: Guest[] = [];
    // (shuffling along it: the way they're going alternates row to row, a few turned to talk; gaps where it's moved up)
    const dir: 1 | -1 = k % 2 ? 1 : -1;
    let x = QX0 + 40 + hash(k * 3) * 40, i = 0;
    while (x < QX1 - 60) {
      const facing: 1 | -1 = hash(k * 31 + i) < 0.2 ? (-dir as 1 | -1) : dir;
      guests.push(guestAt(k * 41 + i * 3 + 5, x, GY - rise, facing, 0.92 + hash(k + i * 0.7) * 0.12));
      x += 40 + hash(k * 13 + i * 1.9) * 30 + (hash(k + i * 7.7) < 0.15 ? 70 : 0); i++;
    }
    out.push({ d, rise, guests });
  });
  return (ROWS = out);
};

const drawQueueRow = (c: Ctx, eye: Eye, row: Row, k: number, f: number) => {
  const { d, rise } = row;
  const y = GY - rise;
  // (what's going back from this row to the next one back: the corral's outer rails, or the ramp's deck)
  const all = rows(), next = all[k + 1], dn = next ? next.d : FAR_D;
  // (culled by where it lands on screen: as far back as it goes, it's nearer the middle)
  const [s0, s1] = spanAt(eye, dn, 60);
  if (QX1 + 60 < s0 || QX0 - 60 > s1) return;
  if (next && !rise && !next.rise) {
    for (const x of [QX0 - 20, QX1 + 20]) {
      seg(c, at(eye, x, GY - 28, dn), at(eye, x, GY - 28, d), '#B8963C', 3 * d); seg(c, at(eye, x, GY - 29, dn), at(eye, x, GY - 29, d), '#FFF0B0', 1);
      seg(c, at(eye, x, GY - 10, dn), at(eye, x, GY - 10, d), '#A88A3C', 2 * d);
    }
  }
  if (rise > 0) {
    // (the ramp's deck under this row, going back to the next: seen from above)
    const a = at(eye, QX0 - 40, y, d), b = at(eye, QX1 + 40, y, d), b2 = at(eye, QX1 + 40, y, dn), a2 = at(eye, QX0 - 40, y, dn);
    if (eye.y < y) { quad(c, '#3A2E24', a, b, b2, a2); seg(c, a2, b2, '#241C16', 1); }
    // (its open end's side, toward the eye: the frame under it)
    const sx = eye.x < QX0 - 40 ? QX0 - 40 : eye.x > QX1 + 40 ? QX1 + 40 : null;
    if (sx !== null) quad(c, '#1E1813', at(eye, sx, y, d), at(eye, sx, y, dn), at(eye, sx, GY, dn), at(eye, sx, GY, d));
  }
  inDepth(c, eye, d, () => {
    // (the ramp's deck under this switchback, if it's up off the floor: its front face down to the floor)
    if (rise > 0) {
      slab(c, QX0 - 40, y, QX1 - QX0 + 80, rise, '#2A231D', { edge: 2 });
      box(c, QX0 - 40, y, QX1 - QX0 + 80, 3, '#5A4A3A');
      for (let x = QX0; x < QX1; x += 120) box(c, x, y + 4, 4, rise - 4, '#1A1410');
    }
    // (the people: stamped in two shifts of weight, swapped now and then)
    const phase = Math.floor((f + k * 37) / 50) % 2;
    stamp(c, `tpl-q-${k}-${phase}`, QX0 - 20, y - 110, QX1 - QX0 + 40, 112, g => { for (const gg of row.guests) drawGuest(g, gg, phase * 23 + gg.seed); });
    // (the switchback's rails in front of them: brass posts, a pipe rail; open at the end it turns at)
    const open = k % 2 ? QX1 - 60 : QX0;
    const rx0 = k % 2 ? QX0 - 20 : QX0 + 60, rx1 = k % 2 ? QX1 - 60 : QX1 + 20;
    const ry = y + 14;
    for (let x = rx0; x <= rx1; x += 70) { box(c, x - 2, ry - 44, 5, 44, INK); box(c, x - 1, ry - 44, 3, 44, '#B8963C'); box(c, x - 1, ry - 44, 1, 44, '#F2D88A'); box(c, x - 4, ry - 2, 9, 3, '#7A6020'); }
    box(c, rx0, ry - 42, rx1 - rx0, 3, '#D8B860'); box(c, rx0, ry - 42, rx1 - rx0, 1, '#FFF0B0');
    box(c, rx0, ry - 24, rx1 - rx0, 2, '#A88A3C');
    void open;
  });
};

const drawQueue = (c: Ctx, eye: Eye, f: number, upTo: number, from: number) => {
  rows().forEach((row, k) => { if (row.d > from && row.d <= upTo) drawQueueRow(c, eye, row, k, f); });
};

/** The queue's far end: stairs up into the dark (the line goes on up them, out of sight). */
const FAR_D = 0.5, FAR_RISE = 3 * 44;
/** Whether the line's far end (its stairs, the sign over them) lands on screen. */
const farInView = (eye: Eye) => { const [s0, s1] = spanAt(eye, FAR_D, 40); return QX0 + 460 > s0 && QX0 - 60 < s1; };
const drawQueueFar = (c: Ctx, eye: Eye) => {
  if (!farInView(eye)) return;
  inDepth(c, eye, FAR_D, () => {
    const y = GY - FAR_RISE;
    slab(c, QX0 - 60, y - 160, 260, 160 + FAR_RISE, '#120D0A', { edge: 2 });
    for (let k = 0; k < 7; k++) box(c, QX0 - 40 + k * 22, y - k * 22, 160, 4, '#3A2E24');
  });
};
/** ...and the sign over where it goes up: lit (drawn over the haze). */
const drawWaitSign = (c: Ctx, eye: Eye, f: number) => {
  if (!farInView(eye)) return;
  inDepth(c, eye, FAR_D, () => {
    const y = GY - FAR_RISE, sx = QX0 + 230;
    box(c, sx + 30, y - 90, 3, 90, '#3A3A3E'); box(c, sx + 190, y - 90, 3, 90, '#3A3A3E');
    sign(c, sx, y - 150, 220, 30, '#1A1A1A', 'WAIT FROM THIS POINT', '#F2C14E', 8, '#4A4E56', enamel({ sx: 1, sy: 2 }, '#F2C14E'));
    slab(c, sx + 40, y - 112, 140, 26, '#0A0A0C', { edge: 2 });
    signAt(c, '240 MINUTES', sx + 110, y - 94, 8, led(8, f % 90 < 80 ? '#F87171' : '#7F1D1D', '#0A0A0C'));
  });
};

/** The booth's front and back (set back behind the track: past its ties, short of the line's first row). */
export const BOOTH_D = 0.944;
const BOOTH_BACK = 0.906;
/** Where the track lever stands on the booth's console (by the second operator, her side of it). */
const LEVER_X = BOOTH_X + 152;
/** The switch on the track, just ahead of the cart: the points that send it the other way, the actual dangerous track. */
const SWITCH_X = BOOTH_X - 70;
const drawSwitch = (c: Ctx, eye: Eye, f: number, thrown: boolean) => {
  // (the cable from the lever: out of the booth's base, along the floor in its conduit, to the switch machine)
  const b0 = at(eye, BOOTH_X + 4, GY - 2, BOOTH_D), b1 = at(eye, SWITCH_X + 34, GY - 2, BOOTH_D);
  seg(c, b0, b1, '#18181B', 3); seg(c, [b0[0], b0[1] - 1], [b1[0], b1[1] - 1], '#E8C130', 1);
  // (the switch machine, beside the far rail: a box, a lamp on it, green for the ride's track, red for the other)
  inDepth(c, eye, BOOTH_D, () => {
    slab(c, SWITCH_X + 6, GY - 26, 36, 26, '#3A3E44', { edge: 2 });
    box(c, SWITCH_X + 10, GY - 20, 28, 7, '#E8C130'); text(c, 'SWITCH', SWITCH_X + 24, GY - 15, INK, 4, 'center', null);
    pole(c, SWITCH_X + 22, GY - 50, 4, 24, '#4A4E56');
    const col = thrown ? (f % 20 < 12 ? '#EF4444' : '#7F1D1D') : '#22C55E';
    ball(c, SWITCH_X + 24, GY - 54, 6, col);
  });
  // (its throw rod, under the rails, to the points; the points themselves: the blade over against the rail, or not)
  const r0 = at(eye, SWITCH_X + 20, GY, BOOTH_D), r1 = at(eye, SWITCH_X + 20, GY, 1.005);
  seg(c, r0, r1, '#5A5E66', 2);
  const tip = thrown ? 0.985 : 0.997;
  seg(c, at(eye, SWITCH_X + 20, GY - 2, tip), at(eye, SWITCH_X + 140, GY - 2, 1), '#D1D5DB', 2);
};

/**
 * The loading platform's own kit, set back behind the track (GATE_D): the load gates (a row a car, numbered, their
 * swing bars, the row plates), the grouper at her podium waving the next lot up, the height check (a carved jaguar
 * on a post, its paw out at the line), and a lost and found bin of what the ride's shaken out of people.
 */
const GATE_D = 0.94;
const drawStationDressing = (c: Ctx, eye: Eye, f: number) => {
  const [s0, s1] = spanAt(eye, GATE_D, 80);
  const gx0 = STATION_X + 640, gx1 = BOOTH_X - 90;
  if (gx1 < s0 || STATION_X + 500 > s1) return;
  inDepth(c, eye, GATE_D, () => {
    stamp(c, 'tpl-gates', STATION_X + 480, GY - 140, gx1 - STATION_X - 470, 146, g => {
      // the height check: a jaguar carved on a post (painted foam), its paw out level with the line
      const hx = STATION_X + 520, st = rampOf('#8E8676');
      slab(g, hx, GY - 120, 22, 120, '#7A7466', { edge: 2 }); box(g, hx + 2, GY - 120, 6, 120, st[3]);
      for (let y = GY - 100; y < GY; y += 22) box(g, hx + 2, y, 18, 2, st[1]);
      g.fillStyle = INK; g.beginPath(); g.ellipse(hx + 11, GY - 128, 15, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#D99A2B'; g.beginPath(); g.ellipse(hx + 11, GY - 128, 14, 11, 0, 0, Math.PI * 2); g.fill();
      box(g, hx + 1, GY - 138, 6, 6, '#D99A2B'); box(g, hx + 16, GY - 138, 6, 6, '#D99A2B');
      box(g, hx + 4, GY - 131, 5, 3, INK); box(g, hx + 14, GY - 131, 5, 3, INK); box(g, hx + 5, GY - 131, 2, 1, '#FDE047'); box(g, hx + 15, GY - 131, 2, 1, '#FDE047');
      box(g, hx + 9, GY - 125, 5, 3, '#3A2008'); for (const [dx, dy] of [[-1, -122], [20, -124], [6, -136]] as const) box(g, hx + dx, GY + dy, 3, 2, '#3A2008');
      slab(g, hx + 22, GY - 98, 30, 8, '#D99A2B', { edge: 2 }); for (let k = 0; k < 3; k++) box(g, hx + 46, GY - 97 + k * 2, 5, 1, '#F8FAFC');
      slab(g, hx - 6, GY - 70, 34, 30, '#5A1A0C', { edge: 2 });
      signAt(g, 'YOU MUST', hx + 11, GY - 64, 4, print(4, '#F2C14E')); signAt(g, 'BE THIS', hx + 11, GY - 57, 4, print(4, '#F2C14E')); signAt(g, 'TALL', hx + 11, GY - 50, 4, print(4, '#F2C14E'));
      // the load gates: posts, swing bars, the row plates over them
      for (let k = 0; k < 3; k++) {
        const x = gx0 + k * ((gx1 - 70 - gx0) / 3);
        for (const px0 of [x, x + 70]) { box(g, px0 - 1, GY - 52, 8, 52, INK); box(g, px0, GY - 51, 6, 51, '#B8963C'); box(g, px0, GY - 51, 2, 51, '#F2D88A'); box(g, px0 - 3, GY - 3, 12, 3, '#7A6020'); }
        box(g, x + 6, GY - 40, 64, 5, INK); box(g, x + 6, GY - 39, 64, 3, '#E8C130'); box(g, x + 6, GY - 39, 64, 1, '#FDE68A');
        for (let q = 0; q < 4; q++) box(g, x + 12 + q * 16, GY - 39, 6, 3, INK);
        slab(g, x + 18, GY - 76, 40, 18, '#1A1A1A', { edge: 2 }); signAt(g, `ROW ${k + 1}`, x + 38, GY - 70, 6, enamel(6, '#F2C14E', INK));
        box(g, x + 36, GY - 58, 3, 6, '#3A3A3E');
      }
      // the lost and found
      const lx = gx1 - 8;
      slab(g, lx - 60, GY - 50, 56, 50, '#3A5A8A', { edge: 2 }); box(g, lx - 58, GY - 50, 52, 3, '#5A7AAA');
      for (const [dx, dy, w, h, col] of [[-54, -60, 14, 12, '#E85AA8'], [-40, -64, 18, 6, '#1C1C24'], [-24, -58, 10, 10, '#F2B02A'], [-50, -56, 8, 8, '#93C5FD'], [-18, -62, 12, 4, '#E8E2D2']] as const) slab(g, lx + dx, GY + dy, w, h, col, { edge: 1 });
      box(g, lx - 56, GY - 34, 48, 14, '#F1EFEA'); signAt(g, 'LOST + FOUND', lx - 32, GY - 30, 4, print(4, '#1E3A8A'));
      signAt(g, '(MOSTLY TEETH)', lx - 32, GY - 23, 4, print(4, '#B91C1C'));
    });
    // the grouper at her podium, pointing the next lot to their row
    const px0 = STATION_X + 590;
    drawParkGuest(c, px0 - 14, GY, { seed: 4417, woman: true, f, outfit: 'operator', pose: 'point', mood: 'bored' });
    slab(c, px0, GY - 48, 26, 48, '#6B4A2C', { edge: 2 }); box(c, px0 - 2, GY - 52, 30, 5, '#3A2A1A'); box(c, px0 + 4, GY - 40, 18, 10, '#F1EFEA');
    box(c, px0 + 10, GY - 62, 2, 10, '#18181B'); ball(c, px0 + 11, GY - 64, 3, '#26262A');
  });
};

const drawStation = (c: Ctx, eye: Eye, state: GameState, tp: Temple) => {
  const f = state.frame;
  // the banner over the station, hung from the truss
  inDepth(c, eye, 0.92, () => {
    const bx = STATION_X + 460, by = GY - 360;
    for (const cx of [bx + 20, bx + 560]) chain(c, cx, CHAIN_TOP, by, '#4A4A4E');
    slab(c, bx, by, 600, 40, '#5A1A0C', { edge: 2 });
    for (let k = 0; k < 600; k += 20) box(c, bx + k, by + 36, 10, 4, '#E8B400');
    signAt(c, 'JAGUAR EXPRESS', bx + 300, by + 16, 10, plank({ sx: 2, sy: 2 }, '#F2C14E', undefined, INK, 6));
    signAt(c, 'KEEP HANDS, ARMS AND EXPECTATIONS INSIDE THE CART AT ALL TIMES', bx + 300, by + 30, 6, enamel(6, '#F1EFEA', INK));
  });
  // the platform's edge (yellow, of course), the track along it: ties, two rails going back, on into the tunnel
  const tx0 = STATION_X + 560, tx1 = END_WALL + 4;
  const near = 1.0, far = 0.955;
  for (let x = Math.floor(tx0 / 26) * 26; x < tx1; x += 26) {
    if (x < state.camera.x - 40 || x > state.camera.x + CANVAS_WIDTH + 40) continue;
    quad(c, '#3A2A1C', at(eye, x, GY + 2, 1.01), at(eye, x + 14, GY + 2, 1.01), at(eye, x + 14, GY + 2, far - 0.01), at(eye, x, GY + 2, far - 0.01));
    seg(c, at(eye, x, GY + 2, far - 0.01), at(eye, x + 14, GY + 2, far - 0.01), '#5A4630', 1);
  }
  for (const d of [far, near]) {
    const a = at(eye, tx0, GY - 2, d), b = at(eye, tx1, GY - 2, d);
    seg(c, [a[0], a[1] + 2], [b[0], b[1] + 2], '#2A2C30', 3); seg(c, a, b, d < 1 ? '#7D8794' : '#B8C0CA', 2); seg(c, [a[0], a[1] - 1], [b[0], b[1] - 1], '#E5E7EB', 1);
  }
  // (the tunnel the track goes on into: a hole in the end wall (the room's end, going back), its frame; the rails go
  // into the dark of it)
  if (eye.x < END_WALL) {
    const m = (y: number, d: number) => at(eye, END_WALL, y, d);
    quad(c, '#3A3E44', m(GY - 136, 1), m(GY - 136, 0.925), m(GY + 2, 0.925), m(GY + 2, 1));
    quad(c, '#050302', m(GY - 130, 1), m(GY - 130, 0.932), m(GY + 2, 0.932), m(GY + 2, 1));
    quad(c, '#0E0A08', m(GY - 130, 0.95), m(GY - 130, 0.932), m(GY + 2, 0.932), m(GY + 2, 0.95));
  }
  // (the platform's yellow edge, where he stands)
  for (let x = STATION_X + 20; x < tx0; x += 16) box(c, x, GY, 8, 3, '#E8C130');
  // the end wall, and the tunnel the track goes on through
  block3d(c, eye, END_WALL, GY - 700, 200, GY, '#2E2824', 0.86, g => {
    slab(g, END_WALL, GY - 700, 200, 700, '#2E2824', { edge: 4 });
    for (let y = GY - 700; y < GY; y += 16) box(g, END_WALL + 2, y, 196, 1, '#221D1A');
    // (painted on the wall, up over the tunnel: an arrow, which way they go)
    sign(g, END_WALL + 20, GY - 250, 160, 22, '#14532D', 'FRIENDLY TRACK', '#BBF7D0', 7, '#4A4E56', plank(7, '#BBF7D0', undefined, '#052E16', 7));
    box(g, END_WALL + 40, GY - 222, 120, 9, TAPE_W); signAt(g, '(MOSTLY)', END_WALL + 100, GY - 215, 6, plank(6, '#B91C1C', undefined, undefined, 8));
  }, { key: 'tpl-end-wall', lip: false, part: 'front' });
  // (the beacon over the tunnel, stuck out from the wall)
  const bc = at(eye, END_WALL - 6, GY - 150, 0.965);
  ball(c, bc[0], bc[1], 5, f % 50 < 25 ? '#F59E0B' : '#78350F');
  // the booth: set back behind the track (its front just past the ties, its back short of the line's first row): the
  // operators in it (behind the glass), the console, the lever in reach of her; the cable from it to the switch
  const ld = tp.loading;
  const thrown = !!ld && ld.step === 4 && ld.t >= 10;
  drawStationDressing(c, eye, f);
  drawSwitch(c, eye, f, thrown);
  block3d(c, eye, BOOTH_X, GY - 130, 170, GY, '#6B4A2C', BOOTH_BACK, g => {
    slab(g, BOOTH_X, GY - 130, 170, 130, '#6B4A2C', { edge: 4 });
    slab(g, BOOTH_X - 6, GY - 140, 182, 14, '#3A2A1A', { edge: 2 });
    for (let k = 0; k < 170; k += 22) box(g, BOOTH_X + k, GY - 60, 2, 56, '#5A3E24');
    box(g, BOOTH_X + 8, GY - 116, 154, 54, '#0E1A24');
  }, { key: 'tpl-booth', lip: false, at: BOOTH_D });
  inDepth(c, eye, BOOTH_D, () => {
    signAt(c, 'OPERATORS', BOOTH_X + 85, GY - 130, 6, enamel(6, '#F2C14E', INK));
    c.save(); c.beginPath(); c.rect(BOOTH_X + 8, GY - 116, 154, 54); c.clip();
    box(c, BOOTH_X + 8, GY - 116, 154, 54, '#2A3A44');
    for (const [i, seed, woman] of [[0, 818, false], [1, 1331, true]] as const) {
      const voice = i ? 'm2.operator2' : 'm2.operator';
      // (talking: the mouth going, a frame shut and a frame open)
      const talk = ld?.said?.who === voice && (f >> 3) % 2 === 1;
      drawParkGuest(c, BOOTH_X + 50 + i * 70, GY - 30, { seed, woman, f, outfit: 'operator', facing: -1, mood: i ? (talk ? 'shocked' : 'bored') : (talk ? 'angry' : 'shocked') });
    }
    // (the lever: on the console in there, at her elbow; thrown when they send him off)
    c.save(); c.translate(LEVER_X, GY - 62); c.rotate(thrown ? 0.75 : -0.35);
    box(c, -3, -34, 6, 34, INK); box(c, -2, -34, 4, 34, '#A1A1AA'); box(c, -2, -34, 1, 34, '#E5E7EB'); ball(c, 0, -36, 6, '#DC2626');
    c.restore();
    // (the glass: reflections in bands)
    c.fillStyle = 'rgba(160, 200, 230, 0.12)'; c.fillRect(BOOTH_X + 8, GY - 116, 154, 54);
    for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(230, 245, 255, ${0.12 - k * 0.03})`; c.beginPath(); c.moveTo(BOOTH_X + 20 + k * 40, GY - 116); c.lineTo(BOOTH_X + 34 + k * 40, GY - 116); c.lineTo(BOOTH_X + 4 + k * 40, GY - 62); c.lineTo(BOOTH_X - 10 + k * 40, GY - 62); c.closePath(); c.fill(); }
    c.restore();
    // (the console's sill: buttons blinking, DISPATCH; the lever's quadrant, its slot, what it does)
    slab(c, BOOTH_X + 4, GY - 64, 162, 8, '#3A3E44', { edge: 2 });
    for (let k = 0; k < 8; k++) box(c, BOOTH_X + 12 + k * 10, GY - 62, 5, 3, ['#22C55E', '#EF4444', '#F59E0B', '#3B82F6'][k % 4] === '#22C55E' && (f + k * 11) % 40 < 20 ? '#14532D' : ['#22C55E', '#EF4444', '#F59E0B', '#3B82F6'][k % 4]);
    slab(c, BOOTH_X + 96, GY - 54, 40, 14, '#1A1A1A', { edge: 2 }); text(c, 'DISPATCH', BOOTH_X + 116, GY - 44, '#22C55E', 4, 'center', null);
    slab(c, LEVER_X - 12, GY - 66, 24, 6, '#26262A', { edge: 2 });
    box(c, LEVER_X - 14, GY - 52, 28, 10, '#E8C130'); text(c, 'TRACK', LEVER_X, GY - 45, INK, 4, 'center', null);
  });
  // the wait-time sign at the line's entrance, on its post
  pole(c, STATION_X + 70, GY - 150, 6, 150, '#5A5E66');
  sign(c, STATION_X + 10, GY - 196, 126, 46, '#1A1A1A', '', '#F2C14E', 6, '#6B4A2C');
  signAt(c, 'WAIT TIME', STATION_X + 73, GY - 180, 6, enamel(6, '#F2C14E', INK));
  signAt(c, 'FROM HERE', STATION_X + 73, GY - 170, 6, enamel(6, '#F2C14E', INK));
  signAt(c, '240 MIN', STATION_X + 73, GY - 156, 8, led(8, f % 120 < 100 ? '#F87171' : '#7F1D1D', '#1A1A1A'));
};

// ---------------------------------------------------------------------------------------------------------------
// The lot, back to front

export const drawTempleBack = (c: Ctx, state: GameState, tp: Temple) => {
  const cam = state.camera.x, f = state.frame;
  const L = cam - 20, R = cam + CANVAS_WIDTH + 20;
  if (R < T - 300 || L > x1 + 200) return;
  const eye = eyeOf(state);
  const vis = (a: number, b: number) => b > L - 100 && a < R + 100;
  const top = state.camera.y - 20;
  // The far wall
  inDepth(c, eye, WALL_D, () => {
    const [s0, s1] = spanAt(eye, WALL_D, 0);
    for (let i = Math.floor(s0 / 512); i * 512 < s1; i++) stamp(c, `tpl-wall-${i}`, i * 512, GY - 1300, 512, 1300, g => paintWallTile(g, i * 512, i));
    // (exit signs on it, lit)
    for (let i = Math.floor(s0 / 1100); i * 1100 < s1; i++) {
      const x = i * 1100 + 300;
      slab(c, x, GY - 260, 50, 20, '#141414', { edge: 2 }); signAt(c, 'EXIT', x + 25, GY - 246, 8, led(8, '#22C55E', '#141414'));
    }
  });
  drawFloor(c, eye, L, R);
  // The room's ends, going back to the far wall
  drawRoomEnd(c, eye, ROOM_L);
  drawRoomEnd(c, eye, ROOM_R);
  // Everything in between, back to front, a haze over what's past each step back
  const haze = (d: number) => {
    const y = floorAt(eye, d);
    c.fillStyle = 'rgba(16, 10, 6, 0.24)'; c.fillRect(L, top, R - L, y - top);
  };
  const layers: [number, () => void][] = [
    [TRUSS_D, () => drawTruss(c, eye, f)],
    [CAT_D, () => drawCatwalk(c, eye, f)],
    [FACADE_D, () => drawFacade(c, eye, f)],
    [PROPS_D, () => drawProps(c, eye, f)],
    [FAR_D, () => drawQueueFar(c, eye)],
  ];
  // (the line's rows cull themselves by where they land on screen, as do the far end and its sign)
  for (const row of rows()) layers.push([row.d, () => drawQueue(c, eye, f, row.d, row.d - 0.001)]);
  layers.sort((a, b) => a[0] - b[0]);
  let hi = 0;
  for (const [d, draw] of layers) {
    while (hi < HAZE.length && HAZE[hi] < d) haze(HAZE[hi++]);
    draw();
  }
  while (hi < HAZE.length) haze(HAZE[hi++]);
  drawWaitSign(c, eye, f);
  // His level: the walls' sides and tops going back first (anything standing beside one, on his side of it, is in
  // front of that), then the scaffolds, then the walls' fronts, the door, the tricks, the station
  if (vis(CATAPULT_X - 120, CATAPULT_X + 220)) block3d(c, eye, CATAPULT_X - 70, GY - 34, 150, GY - 12, '#6A4A2A', 0.93, undefined, { part: 'back' });
  if (vis(DART_WALL - 40, DART_WALL + 180)) block3d(c, eye, DART_WALL, DART_TOP, 40, GY, '#7A7466', 0.86, undefined, { part: 'back' });
  if (vis(SNAKE_WALL - 40, SNAKE_WALL + 270)) block3d(c, eye, SNAKE_WALL, SNAKE_TOP, 50, GY, '#6E665A', 0.86, undefined, { part: 'back' });
  LEDGES.forEach(([x, y, w], i) => { if (vis(x, x + w)) scaffold(c, eye, x, y, w, i, f); });
  if (vis(T - 80, T + 120)) drawBackDoor(c, eye, f);
  if (vis(CATAPULT_X - 120, CATAPULT_X + 220)) drawCatapult(c, eye, state, tp);
  if (vis(DART_WALL - 40, DART_WALL + 180)) drawDartWall(c, eye, state, tp);
  if (vis(GHOST_X - 160, GHOST_X + 60)) drawGhost(c, eye, f);
  if (vis(FOG_X - 140, FOG_X + 70)) drawFogMachine(c, f);
  if (vis(SNAKE_WALL - 40, SNAKE_WALL + 270)) drawSnakeRig(c, eye, state, tp);
  if (vis(STATION_X - 60, x1)) drawStation(c, eye, state, tp);
  // (cables along the floor at his feet, taped down)
  for (let x = Math.floor(L / 300) * 300; x < R; x += 300) {
    const k = hash(x * 0.13);
    if (k < 0.4) continue;
    box(c, x, GY - 2, 300, 2, '#0E0E10');
    box(c, x + 40 + k * 100, GY - 3, 12, 4, '#3A3A3E'); box(c, x + 40 + k * 100, GY - 3, 12, 1, '#5A5A60');
  }
};

/**
 * A boulder (a real one: granite): lit from the upper left in steps (the light stays put as it turns), dithered where
 * the steps meet, inked; its cracks, chips and a lichen patch turn with it (eight frames of the turn, each stamped).
 */
const paintBoulder = (g: Ctx, r: number, turn: number) => {
  const st = rampOf('#8A8178');
  g.save();
  g.fillStyle = INK; g.beginPath(); g.arc(0, 0, r + 1, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
  // (the steps: rings about a spot up and to the left)
  const lx = -r * 0.35, ly = -r * 0.4;
  for (const [k, col] of [[1.9, st[0]], [1.45, st[1]], [1.05, st[2]], [0.62, st[3]], [0.28, st[4]]] as const) { g.fillStyle = col; g.beginPath(); g.arc(lx, ly, r * k, 0, Math.PI * 2); g.fill(); }
  for (let yy = -r; yy < r; yy += 2) for (let xx = -r + ((yy / 2) & 1); xx < r; xx += 2) { const d = Math.hypot(xx - lx, yy - ly) / r; if (Math.abs(d - 1.05) < 0.08 || Math.abs(d - 1.45) < 0.08) { g.fillStyle = d < 1.25 ? st[1] : st[0]; g.fillRect(xx, yy, 1, 1); } }
  // (what turns with it: a crack and its branch, chips, flecks of mica, a lichen patch)
  g.rotate(turn);
  g.fillStyle = st[0]; g.fillRect(-2, -r * 0.8, 2, r * 0.75); g.fillRect(-2, -r * 0.1, r * 0.55, 2); g.fillRect(r * 0.5, -r * 0.1, 2, r * 0.4);
  g.fillStyle = st[4]; g.fillRect(0, -r * 0.8, 1, r * 0.7);
  for (const [cx, cy] of [[r * 0.35, r * 0.25], [-r * 0.6, r * 0.35], [r * 0.1, -r * 0.5]]) { g.fillStyle = st[0]; g.fillRect(cx, cy, 3, 2); g.fillStyle = st[4]; g.fillRect(cx, cy - 1, 3, 1); }
  for (let k = 0; k < 5; k++) { g.fillStyle = '#E8E4DC'; g.fillRect(Math.round((hash(k * 3.1) - 0.5) * r * 1.4), Math.round((hash(k * 5.7) - 0.5) * r * 1.4), 1, 1); }
  g.fillStyle = '#7A8A4A'; g.fillRect(-r * 0.7, -r * 0.1, 4, 3); g.fillRect(-r * 0.6, -r * 0.2, 3, 2);
  g.restore();
  g.restore();
};
const drawBoulder = (c: Ctx, x: number, y: number, r: number, turn: number) => {
  const k = ((Math.round(turn / (Math.PI / 4)) % 8) + 8) % 8;
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `tpl-boulder-${r}-${k}`, -r - 2, -r - 2, r * 2 + 4, r * 2 + 4, g => paintBoulder(g, r, k * Math.PI / 4));
  c.restore();
};

/** The cart at the station, whoever's still in it. */
const drawCart = (c: Ctx, x: number, f: number, riders: number[]) => {
  riders.forEach(i => drawParkGuest(c, x + SEAT[i], GY + 4, { seed: GUESTS[i].seed, woman: GUESTS[i].woman, f, pose: 'sit', mood: 'happy', scale: 0.9 }));
  drawRideCart(c, x, GY, f, JAGUAR_EXPRESS, false);
};

/** Stuff nearer than him: a cable hung down past the camera, the tops of road cases at the bottom edge. */
const drawForeground = (c: Ctx, eye: Eye) => {
  const d = 1.35;
  const [s0, s1] = spanAt(eye, d, 60);
  inDepth(c, eye, d, () => {
    for (let x = Math.floor(s0 / 900) * 900; x < s1; x += 900) {
      const k = hash(x * 0.71);
      const cx = x + k * 400;
      if (k < 0.35) {
        // a road case, its top just in at the bottom: black ply, the aluminum edging, ball corners, a latch, stenciled
        stamp(c, `tpl-fg-case-${x}`, cx - 4, GY - 46, 172, 70, g => {
          slab(g, cx, GY - 40, 160, 60, '#141416', { edge: 2 });
          box(g, cx, GY - 40, 160, 4, '#3A3E46'); box(g, cx, GY - 40, 160, 1, '#6A707A'); box(g, cx, GY - 26, 160, 3, '#2A2C32');
          for (const bx of [cx - 2, cx + 150]) { box(g, bx, GY - 42, 12, 10, INK); box(g, bx + 1, GY - 41, 10, 8, '#4A4E56'); box(g, bx + 2, GY - 40, 4, 3, '#8A909A'); }
          box(g, cx + 70, GY - 36, 20, 8, '#2A2C32'); box(g, cx + 72, GY - 35, 16, 2, '#6A707A');
          signAt(g, k < 0.17 ? 'TEMPLE FX 2' : 'SPARE BONES', cx + 40, GY - 16, 6, stencil(6, '#3A3A40', undefined, x));
        });
      } else if (k < 0.7) {
        // a cable hung down out of the dark (looped), a hint of light along it
        c.strokeStyle = '#0A0A0C'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, GY - 1200); c.quadraticCurveTo(cx + 30, GY - 500, cx - 10, GY - 330); c.stroke();
        c.strokeStyle = '#26262C'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - 1, GY - 1200); c.quadraticCurveTo(cx + 29, GY - 500, cx - 11, GY - 330); c.stroke();
        box(c, cx - 14, GY - 334, 8, 10, '#18181B'); box(c, cx - 13, GY - 333, 6, 2, '#3A3A40');
      } else {
        // a chain hoist hung off the grid, its hook down near his head, the load chain looped
        chain(c, cx, CHAIN_TOP, GY - 420, '#1A1A1E');
        slab(c, cx - 14, GY - 420, 30, 34, '#2A2410', { edge: 2 }); box(c, cx - 12, GY - 418, 26, 3, '#4A4020'); box(c, cx - 4, GY - 410, 10, 6, '#141416');
        chain(c, cx, GY - 386, GY - 300, '#1A1A1E');
        c.strokeStyle = '#141416'; c.lineWidth = 2; c.setLineDash([4, 2]); c.beginPath(); c.moveTo(cx + 8, GY - 386); c.quadraticCurveTo(cx + 26, GY - 330, cx + 12, GY - 360); c.stroke(); c.setLineDash([]);
        c.strokeStyle = '#1E1E22'; c.lineWidth = 4; c.beginPath(); c.arc(cx + 1, GY - 292, 7, -0.3, Math.PI * 1.1); c.stroke();
      }
    }
  });
};

export const drawTempleFront = (c: Ctx, state: GameState, tp: Temple) => {
  const cam = state.camera.x, f = state.frame;
  if (cam > x1 || cam + CANVAS_WIDTH < T - 200) return;
  const eye = eyeOf(state);
  // Boulders: real ones, stepped, cracked, turning as they roll
  for (const b of tp.boulders) {
    // (its shadow on the floor: under it rolling, a smaller one under where it's coming down while it flies)
    const sh = b.rolling ? 1 : Math.max(0.3, 1 - (GY - b.y) / 300);
    c.fillStyle = 'rgba(0, 0, 0, 0.32)'; c.fillRect(Math.round(b.x - b.r * sh), GY - 2, Math.round(b.r * 2 * sh), 3);
    c.fillStyle = 'rgba(0, 0, 0, 0.18)'; c.fillRect(Math.round(b.x - b.r * sh - 4), GY - 1, Math.round(b.r * 2 * sh + 8), 2);
    drawBoulder(c, b.x, b.y, b.r, b.x * 0.06);
  }
  // Darts: a shaft, a point, red fletching
  for (const d of tp.darts) {
    box(c, d.x - 2, d.y - 1, 4, 2, '#9CA3AF'); box(c, d.x, d.y - 1, 14, 2, '#D6C8A0'); box(c, d.x, d.y - 1, 14, 1, '#F1EAD0');
    box(c, d.x + 12, d.y - 4, 6, 3, '#EF4444'); box(c, d.x + 12, d.y + 1, 6, 3, '#B91C1C');
  }
  // The serpent
  if (Math.abs(SNAKE_WALL - cam - 400) < 800) drawSnakeHead(c, state, tp);
  // Fog over the floor: puffs, stepped
  for (const fg of tp.fog) {
    const a = 0.16 * (1 - fg.t / 260);
    c.fillStyle = `rgba(214, 211, 209, ${a * 0.6})`; c.beginPath(); c.arc(fg.x, fg.y, fg.r, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(230, 228, 226, ${a * 0.8})`; c.beginPath(); c.arc(fg.x - fg.r * 0.2, fg.y - fg.r * 0.15, fg.r * 0.6, 0, Math.PI * 2); c.fill();
  }
  // The cart, and whoever's still in it; the ones kicked out, flying
  const ld = tp.loading;
  const riders = ld ? GUESTS.map((_, i) => i).filter(i => i >= ld.kicked) : tp.loadingSeen ? [] : [0, 1, 2];
  c.save(); c.beginPath(); c.rect(T - 400, GY - 1000, END_WALL - T + 400, 1100); c.clip();
  drawCart(c, CART_X + (ld?.rolling ?? 0), f, riders);
  c.restore();
  if (ld) for (const g of ld.flying) { c.save(); c.translate(g.x, g.y); c.rotate(-g.rot); drawFlungGuest(c, g.seed, g.woman, f); c.restore(); }
  drawForeground(c, eye);
  // What's being said (over whoever's saying it)
  if (ld?.said) {
    const who = ld.said.who;
    const op = (x: number, y: number) => { const [px, py] = at(eye, x, y, BOOTH_D); return { x: px, y: py }; };
    const pos = who === 'm2.operator' ? op(BOOTH_X + 50, GY - 150) : who === 'm2.operator2' ? op(BOOTH_X + 120, GY - 170)
      : ld.step >= 1 ? { x: STATION_X + 520 + (who === 'm2.guest' ? 0 : 90), y: GY - 250 }
      : ld.flying.length ? { x: Math.max(cam + 140, ld.flying[ld.flying.length - 1].x), y: Math.max(state.camera.y + 140, ld.flying[ld.flying.length - 1].y - 50) } : { x: CART_X - 300, y: GY - 300 };
    saidOver(c, ld.said.s.text, pos.x, pos.y, who.startsWith('m2.operator') ? '#FDE68A' : '#FFFFFF', 260);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The light: dim backstage, pools under the work lights and the truss lamps, the show light through the seams,
// the exit signs, the booth; the hazards kept in sight

export const templeLighting = (state: GameState, tp: Temple): SceneLight => {
  const eye = eyeOf(state), f = state.frame;
  const lights: Light[] = [];
  const cam = state.camera.x;
  const near = (x: number) => x > cam - 400 && x < cam + CANVAS_WIDTH + 400;
  for (const [x, y] of workLights()) if (near(x)) lights.push({ x, y, r: 260, a: 0.75, cone: 120, color: 'rgba(255, 220, 160, 0.12)' });
  for (const x of trussLamps(eye)) { const [lx, ly] = at(eye, x, TRUSS_Y + 60, TRUSS_D); if (near(lx)) lights.push({ x: lx, y: ly, r: 420, a: 0.5, cone: 150, color: 'rgba(255, 226, 170, 0.06)' }); }
  PANELS.forEach((p, i) => {
    const [gx, gy] = at(eye, p.x + p.w + 11, GY - 120, FACADE_D);
    if (near(gx)) { const col = showAt(i, f); const n = parseInt(col.slice(1), 16); lights.push({ x: gx, y: gy, r: 150, a: 0.55, color: `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, 0.1)` }); }
  });
  {
    // (the catwalk's show lights, soft, in their cue's colors)
    const [s0, s1] = spanAt(eye, CAT_D, 0);
    for (const x of catLamps(s0, s1)) {
      const [lx, ly] = at(eye, x + 22, CAT_Y - 18, CAT_D), n = parseInt(showAt(Math.floor(x / 260), f).slice(1), 16);
      if (near(lx)) lights.push({ x: lx, y: ly, r: 120, a: 0.4, color: `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, 0.08)` });
    }
  }
  if (near(T)) lights.push({ x: T + 36, y: GY - 60, r: 140, a: 0.7, color: 'rgba(200, 230, 200, 0.08)' }, { x: T + 36, y: GY - 130, r: 60, a: 0.6, color: 'rgba(34, 197, 94, 0.14)' });
  if (near(CATAPULT_X)) lights.push({ x: CATAPULT_X + 20, y: GY - 300, r: 340, a: 0.7, cone: 200, color: 'rgba(255, 220, 160, 0.08)' });
  if (near(GHOST_X) && (f % 120) < 60) lights.push({ x: GHOST_X - 70, y: GY - 90, r: 150, a: 0.7, color: 'rgba(200, 230, 255, 0.1)' });
  if (near(SNAKE_WALL)) lights.push({ x: SNAKE_WALL - 80, y: SNAKE_TOP - 40, r: 360, a: 0.7, cone: 160, color: 'rgba(190, 255, 200, 0.06)' });
  if (near(DART_WALL) && crewed(state, 2) && tp.dartT <= DART_TELL) lights.push({ x: DART_WALL - 4, y: dartY(tp.dartHigh), r: 70, a: 0.8, color: 'rgba(253, 224, 71, 0.18)' });
  if (near(STATION_X + 600)) {
    for (const x of [STATION_X + 300, STATION_X + 700, STATION_X + 1100]) lights.push({ x, y: GY - 300, r: 330, a: 0.6, cone: 170, color: 'rgba(255, 210, 150, 0.08)' });
    const [bx, by] = at(eye, BOOTH_X + 85, GY - 90, BOOTH_D);
    lights.push({ x: bx, y: by, r: 130, a: 0.7, color: 'rgba(160, 220, 255, 0.08)' });
  }
  // (the hazards: kept in sight)
  for (const b of tp.boulders) lights.push({ x: b.x, y: b.y, r: 60, a: 0.55 });
  if (tp.darts.length) lights.push({ x: tp.darts[0].x, y: tp.darts[0].y, r: 70, a: 0.5 });
  if (crewed(state, 3)) { const s = snakeOut(tp.snakeT); lights.push({ x: SNAKE_WALL - Math.max(0, s.k) * SNAKE_REACH, y: SNAKE_Y, r: 90, a: 0.55, color: 'rgba(160, 255, 160, 0.06)' }); }
  void SNAKE_CYCLE;
  return { dark: 0.45, shade: [10, 6, 3], lights, rim: 0.5 };
};
