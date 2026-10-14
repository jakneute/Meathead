// The temple, painted: the Temple of the Jaguar seen from behind, where the illusion shows how it's done. A black-box
// building in depth (the far block wall, the plywood floor going back to it, the lighting truss overhead), the ride's
// fiberglass facade from the back (raw shell, stud frames, kickers and sandbags, the show lights leaking through its
// seams), the crew's clutter; then the tricks themselves at his level (the catapult, the dart trap and its leaf
// blower, the Pepper's ghost pane and the fog machine, the snake on its ram), the scaffolds he climbs, and the loading
// station: the long line snaking back into the dark, the operators' booth, the Jaguar Express on its track.
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
import { drawPerson } from './people';
import {
  INK, box, text, slab, pole, ball, sign, rampOf, dark, lite, mix, checker, bandedGradient, steppedGlow, stamp, hash,
} from '../../intro/art/kit';
import {
  x1, T, CATAPULT_X, DART_WALL, DART_TOP, SNAKE_WALL, SNAKE_TOP, SNAKE_Y, SNAKE_REACH, STATION_X, CART_X, BOOTH_X, END_WALL,
  GHOST_X, FOG_X, LEDGES, type Temple, crewed, DART_TELL, dartY, SNAKE_CYCLE, snakeOut, GUESTS, SEAT,
} from './layout';
import { signAt, signText, plank, enamel, stencil, print, led } from '../letters';

type Ctx = CanvasRenderingContext2D;
export interface Eye { x: number; y: number }

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

type Prop = { x: number; kind: 'case' | 'rack' | 'board' | 'ladder' | 'break' | 'cooler' | 'title' | 'cable' };
const PROPS: Prop[] = [
  { x: T + 160, kind: 'break' }, { x: T + 420, kind: 'title' }, { x: T + 560, kind: 'case' }, { x: T + 820, kind: 'rack' },
  { x: T + 1180, kind: 'cable' }, { x: T + 1900, kind: 'board' }, { x: T + 2150, kind: 'case' }, { x: T + 2420, kind: 'ladder' },
  { x: T + 3020, kind: 'cooler' }, { x: T + 3640, kind: 'case' }, { x: T + 4240, kind: 'rack' },
];
const paintProp = (g: Ctx, p: Prop) => {
  const x = p.x;
  switch (p.kind) {
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
      sign(g, x - 10, GY - 470, 280, 28, '#5A1A0C', 'TEMPLE OF THE JAGUAR', '#F2C14E', 10, '#7A5224', plank({ sx: 2, sy: 2 }, '#F2C14E', undefined, '#2A0A04', 5));
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
};
const drawProps = (c: Ctx, eye: Eye) => {
  const [s0, s1] = spanAt(eye, PROPS_D, 40);
  inDepth(c, eye, PROPS_D, () => {
    for (const p of PROPS) {
      const [a, w] = PROP_W[p.kind];
      if (p.x + a + w < s0 || p.x + a > s1) continue;
      const top = p.kind === 'title' ? GY - 480 : GY - 270;
      if (p.kind === 'title') for (const cx of [p.x + 10, p.x + 250]) chain(c, cx, CHAIN_TOP, GY - 470, '#4A4A4E');
      stamp(c, `tpl-prop-${p.x}`, p.x + a, top, w, GY - top + 6, g => paintProp(g, p));
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
  if (manned && t > 20 && wind > 0.95) ball(c, 104, 0, 11, '#8A8178');
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
    if (i < 5) ball(c, bx, by, 12, ['#8A8178', '#7A736A', '#968C80'][i % 3]);
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
    for (let k = 0; k < 3; k++) {
      const fy = DART_TOP + 18 + k * 60, r = rampOf('#8E8676');
      box(g, X + 4, fy, 32, 46, r[1]); box(g, X + 6, fy + 2, 28, 42, r[2]);
      box(g, X + 8, fy + 10, 8, 4, INK); box(g, X + 24, fy + 10, 8, 4, INK);
      box(g, X + 8, fy + 8, 8, 2, r[3]); box(g, X + 24, fy + 8, 8, 2, r[3]);
      box(g, X + 17, fy + 16, 6, 10, r[3]); box(g, X + 10, fy + 32, 20, 6, r[0]);
      box(g, X + 6, fy + 2, 28, 3, '#4C6B3A');
    }
    box(g, X, DART_TOP, 40, 6, '#4C6B3A');
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
  if (on) for (let k = 0; k < 3; k++) quad(c, `rgba(220, 240, 255, ${0.05 - k * 0.012})`, [sx - 4 - k * 3, sy], [sx + 4 + k * 3, sy], [sx + 30 + k * 10, sy + 186], [sx - 30 - k * 10, sy + 186]);
  // (him, in the suit: the bones painted on)
  c.save(); c.translate(GHOST_X - 70, GY); c.scale(-1, 1);
  drawPerson(c, { seed: 909, outfit: 'stage', f, pose: on ? 'fly' : 'stand', mood: 'bored' });
  c.restore();
  const g = GHOST_X - 70;
  for (let i = 0; i < 4; i++) box(c, g - 6, GY - 50 + i * 8, 12, 2, on ? '#F8FAFC' : '#A8A29E');
  box(c, g - 1, GY - 54, 2, 34, on ? '#F8FAFC' : '#A8A29E');
  // (the pane: the frame on its stand, the glass, the light catching it in bands; his reflection on it, faint)
  c.save(); c.translate(GHOST_X, GY); c.rotate(-0.35);
  box(c, -2, -180, 4, 180, '#9CA3AF');
  c.fillStyle = 'rgba(186, 230, 253, 0.12)'; c.fillRect(2, -176, 40, 176);
  for (let k = 0; k < 4; k++) box(c, 6 + k * 9, -176, 2, 176, `rgba(224, 242, 254, ${0.16 - k * 0.03})`);
  box(c, 2, -178, 42, 3, '#9CA3AF'); box(c, 42, -180, 3, 180, '#6B7280');
  if (on) { c.globalAlpha = 0.18; c.translate(22, -10); c.scale(0.8, 0.8); drawPerson(c, { seed: 909, outfit: 'stage', f, pose: 'fly', mood: 'bored' }); c.globalAlpha = 1; }
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
  const X = FOG_X;
  slab(c, X, GY - 34, 50, 34, '#26262A', { edge: 2 });
  for (let k = 0; k < 5; k++) box(c, X + 6 + k * 6, GY - 28, 3, 12, '#111114');
  box(c, X + 50, GY - 24, 10, 8, '#3A3E44'); box(c, X + 58, GY - 26, 4, 12, '#52565E');
  box(c, X + 10, GY - 40, 30, 6, '#3A3E44');
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
  for (let k = 0; k < 6; k++) box(c, hx - 24 + k * 8, y - 14 + (k % 2) * 4, 4, 2, r[1]);
  // (the jaw)
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 24, y + 4); c.lineTo(hx - 42, y + open); c.lineTo(hx - 34, y + 12 + open); c.lineTo(hx + 24, y + 26); c.closePath(); c.fill();
  c.fillStyle = r[1]; c.beginPath(); c.moveTo(hx + 22, y + 6); c.lineTo(hx - 40, y + 1 + open); c.lineTo(hx - 33, y + 10 + open); c.lineTo(hx + 22, y + 24); c.closePath(); c.fill();
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
      c.save(); c.translate(BOOTH_X + 50 + i * 70, GY - 30); c.scale(-1, 1);
      const voice = i ? 'm2.operator2' : 'm2.operator';
      drawPerson(c, { seed, woman, outfit: 'operator', f, mood: i ? 'bored' : 'shocked', talking: ld?.said?.who === voice });
      c.restore();
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
    [FACADE_D, () => drawFacade(c, eye, f)],
    [PROPS_D, () => drawProps(c, eye)],
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

/** The cart at the station, whoever's still in it. */
const drawCart = (c: Ctx, x: number, f: number, riders: number[]) => {
  riders.forEach(i => { c.save(); c.translate(x + SEAT[i], GY - 12); c.scale(0.9, 0.9); drawPerson(c, { seed: GUESTS[i].seed, woman: GUESTS[i].woman, outfit: 'guest', pose: 'sit', f, mood: 'happy' }); c.restore(); });
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
      if (k < 0.5) {
        // a road case, its top just in at the bottom
        slab(c, cx, GY - 40, 160, 60, '#141416', { edge: 2 });
        for (const bx of [cx + 2, cx + 150]) box(c, bx, GY - 38, 8, 8, '#4A4E56');
      } else {
        // a cable hung down out of the dark (looped)
        c.strokeStyle = '#0A0A0C'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, GY - 1200); c.quadraticCurveTo(cx + 30, GY - 500, cx - 10, GY - 330); c.stroke();
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
    c.save(); c.translate(b.x, b.y);
    c.fillStyle = 'rgba(0,0,0,0.3)'; if (b.rolling) c.fillRect(-b.r, b.r - 2, b.r * 2, 3);
    ball(c, 0, 0, b.r, '#8A8178');
    c.rotate(b.x * 0.06);
    box(c, -b.r * 0.2, -b.r * 0.7, 2, b.r * 0.6, '#5A534C'); box(c, -b.r * 0.2, -b.r * 0.1, b.r * 0.5, 2, '#5A534C');
    box(c, b.r * 0.3, b.r * 0.2, 3, 3, '#6A635A'); box(c, -b.r * 0.6, b.r * 0.3, 3, 2, '#6A635A');
    c.restore();
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
  if (ld) for (const g of ld.flying) { c.save(); c.translate(g.x, g.y); c.rotate(-g.rot); drawPerson(c, { seed: g.seed, woman: g.woman, outfit: 'guest', pose: 'fly', f, mood: 'shocked' }); c.restore(); }
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
  if (near(T)) lights.push({ x: T + 36, y: GY - 60, r: 140, a: 0.7, color: 'rgba(200, 230, 200, 0.08)' }, { x: T + 36, y: GY - 130, r: 60, a: 0.6, color: 'rgba(34, 197, 94, 0.14)' });
  if (near(CATAPULT_X)) lights.push({ x: CATAPULT_X + 20, y: GY - 300, r: 340, a: 0.7, cone: 200, color: 'rgba(255, 220, 160, 0.08)' });
  if (near(GHOST_X) && (f % 120) < 60) lights.push({ x: GHOST_X - 70, y: GY - 200, r: 210, a: 0.8, cone: 60, color: 'rgba(200, 230, 255, 0.12)' });
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
