// The castle, painted (the final pass: peak SNES, a gothic theme-park manor). Each room its own wallpaper (damask,
// stripes, kitchen stone, library boards, rosebuds, nursery moons, gallery velvet) under a crown molding, a chair rail
// and raised-panel wainscot; tall leaded windows (moonlight through them), heavy curtains; the walls go way up
// (absurdly spacious). Indoors the depth is kept light: straight walls, and a strip of floor going back to them, its
// boards converging on the one eye (the middle of the screen). A lit top lip on everything he can stand on (the stairs,
// the balconies, the table, the shelves, the canopy, the stoves, the frames); the rest of the furniture dimmed back
// into the room. Still art is stamped (painted once, put down with one drawImage); what moves or flickers is live.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import {
  INK, box, slab, pole, sign, rampOf, mix, checker, bandedGradient, hazeBands, pixelBlob, tilePattern, brickPattern, stamp, hash,
} from '../../intro/art/kit';
import { GY } from '../geometry';
import { paSaying } from './pa';
import { drawPaHorn } from './horn';
import { timeOfDay, skyAt } from '../../timeOfDay';
import { drawTowerIntact } from '../../walkAway/spookyTown';
import { drawDoorways, DOORWAYS } from './doorways';
import {
  x0, ROOMS, CEIL, ceilOf, DY, dyAt, LEDGES, STOVES, STOVE_TOP, BURNERS, stovePhase, FIRE_H, STOVE_CYCLE, STOVE_FIRE, BED, CHAND_W, BOOKCASES, BOOK_TELL,
  TRAIN, WARDROBES, HORNS, BALLPIT, type Castle, type LedgeLook,
} from './layout';
import { signAt, signW, gothic, enamel, led } from '../letters';

type Ctx = CanvasRenderingContext2D;
type Room = (typeof ROOMS)[number];
type RoomId = Room['id'];
const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;
/** The dark of the castle (what background things are dimmed toward). */
const GLOOM = '#140608';
const dimc = (col: string, k = 0.25) => mix(col, GLOOM, k);
/** Puts a stamp down at (x, y), its picture painted round its own origin (so one picture can go down in many places). */
const put = (c: Ctx, key: string, x: number, y: number, l: number, t: number, w: number, h: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(x, y); stamp(c, key, l, t, w, h, paint); c.restore();
};
/** Draws a little pixel picture (rows of '#'), `px` a cell. */
const bits = (g: Ctx, rows: string[], x: number, y: number, col: string, px = 2) => {
  g.fillStyle = col;
  rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') g.fillRect(x + i * px, y + j * px, px, px); });
};
/** A brass plaque on the wall, its words on it, centered at (x, y). */
const plaque = (c: Ctx, x: number, y: number, words: string, face = '#4A0E0E', ink = '#FDE68A', frame = '#8A6A1E') => {
  // (the castle's own lettering: tall gothic capitals, serifed, inked)
  const L = gothic(8, ink, mix(face, '#000000', 0.55)), w = Math.round(signW(words, L)) + 18;
  sign(c, x - w / 2, y - 11, w, 22, face, words, ink, 8, frame, L);
};

/** The ramps: brass and gilt, iron, the dark wood, wax. */
const BRASS = rampOf('#A87A1E'), GILT = ['#3A2A08', '#6B4E10', '#A07A1E', '#D4A73A', '#F2D27A'], IRON = rampOf('#3A3A42');
const WAX = ['#9A9080', '#C8C0AE', '#E8E2D0', '#F6F2E6', '#FFFFFF'];

/** A standable thing's look: its body and its lit lip. */
const LOOKS: Record<LedgeLook, [string, string]> = {
  stair: ['#4A2A1E', '#C08A5A'], balcony: ['#4A2C1E', '#D4A373'], table: ['#5A3420', '#FFFFFF'], shelf: ['#4A3220', '#C9A060'],
  canopy: ['#7A1430', '#F472B6'], toyshelf: ['#3E3E6A', '#A5B4FC'], cauldron: ['#57524C', '#C8C2BA'], frame: ['#8A6A14', '#FDE047'], rack: ['#3F3F46', '#D4D4D8'],
};
/** A standable thing's body, with its top lit (the lip he can see he can stand on). */
const lipSlab = (c: Ctx, x: number, y: number, w: number, h: number, body: string, lip: string) => {
  const r = rampOf(body), l = rampOf(lip);
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, r[2]); box(c, x, y + h - 3, w, 3, r[0]); checker(c, x, y + h - 5, w, 2, r[1]);
  box(c, x, y, w, 2, l[3]); box(c, x, y + 2, w, 2, l[2]); checker(c, x, y + 4, w, 2, l[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The rooms: the walls

/** Where the walls meet the floor (the floor going back from his plane to here). */
const FOOT = GY - 22;
/** Where the paper stops and the chair rail and wainscot start. */
const RAIL = FOOT - 156;
/** The walls are painted in tiles this wide (stamped), from each room's left end. */
const TW = 400;

interface RoomLook { paper: 'damask' | 'stripe' | 'stone' | 'boards' | 'rose' | 'moons' | 'velvet'; wain: string; floor: string; floorKind: 'boards' | 'flags' | 'carpet'; drape: string }
const LOOK: Record<RoomId, RoomLook> = {
  foyer: { paper: 'damask', wain: '#3A1E14', floor: '#5A3424', floorKind: 'boards', drape: '#6A0E1E' },
  dining: { paper: 'stripe', wain: '#2E1A16', floor: '#4E2C20', floorKind: 'boards', drape: '#4A1450' },
  kitchen: { paper: 'stone', wain: '#B8B4A4', floor: '#4E473E', floorKind: 'flags', drape: '#5A4A22' },
  study: { paper: 'boards', wain: '#2E1E12', floor: '#4A2E1E', floorKind: 'boards', drape: '#1E4A2A' },
  bedroom: { paper: 'rose', wain: '#3A1420', floor: '#6A1A2A', floorKind: 'carpet', drape: '#7A1430' },
  nursery: { paper: 'moons', wain: '#2E2E4A', floor: '#3E3A5E', floorKind: 'carpet', drape: '#2A3A6A' },
  gallery: { paper: 'velvet', wain: '#2A1610', floor: '#4E3020', floorKind: 'boards', drape: '#6A0E1E' },
};

const FLEUR = ['...#...', '..###..', '.#.#.#.', '##.#.##', '.#####.', '...#...', '..###..', '.#...#.'];
const ROSE = ['.##.', '####', '####', '.##.', '..#.', '.##.'];
const STAR = ['..#..', '.###.', '#####', '.#.#.'];
const MOON = ['.##', '##.', '#..', '##.', '.##'];

/** The paper's repeat (a fill, lined up with the room's own coordinates). */
const paperFill = (g: Ctx, r: Room): CanvasPattern | string | null => {
  const W = rampOf(r.wall), kind = LOOK[r.id].paper;
  switch (kind) {
    case 'damask': return tilePattern(g, `cPaper:${r.id}`, 32, 40, t => { for (const [x, y] of [[9, 4], [-7, 24], [25, 24]]) { bits(t, FLEUR, x, y + 2, W[0]); bits(t, FLEUR, x, y, mix(W[2], W[3], 0.6)); } });
    case 'rose': return tilePattern(g, `cPaper:${r.id}`, 28, 32, t => { for (const [x, y] of [[4, 4], [18, 20]]) { bits(t, ROSE, x, y + 2, W[0]); bits(t, ROSE.slice(0, 4), x, y, mix(W[2], '#C0506A', 0.35)); t.fillStyle = mix(W[2], '#3A6A3A', 0.5); t.fillRect(x + 4, y + 8, 2, 4); } });
    case 'moons': return tilePattern(g, `cPaper:${r.id}`, 48, 48, t => {
      t.fillStyle = mix(W[2], W[3], 0.4); for (let x = 0; x < 48; x += 24) t.fillRect(x, 0, 10, 48);
      bits(t, STAR, 13, 6, mix(W[2], '#E8D890', 0.4)); bits(t, MOON, 37, 30, mix(W[2], '#E8D890', 0.4));
    });
    case 'stripe': return tilePattern(g, `cPaper:${r.id}`, 32, 8, t => { t.fillStyle = mix(W[2], W[3], 0.45); t.fillRect(0, 0, 12, 8); t.fillStyle = W[1]; t.fillRect(14, 0, 2, 8); t.fillRect(28, 0, 2, 8); t.fillStyle = mix(W[2], '#C9A227', 0.25); t.fillRect(20, 0, 2, 8); });
    case 'velvet': return tilePattern(g, `cPaper:${r.id}`, 40, 8, t => { const o = [1, 2, 2, 3, 2, 2, 1, 1, 0, 1]; o.forEach((k, i) => { t.fillStyle = W[k]; t.fillRect(i * 4, 0, 4, 8); }); });
    case 'boards': return tilePattern(g, `cPaper:${r.id}`, 24, 96, t => {
      t.fillStyle = W[2]; t.fillRect(0, 0, 24, 96); t.fillStyle = W[0]; t.fillRect(22, 0, 2, 96); t.fillStyle = W[3]; t.fillRect(0, 0, 1, 96);
      t.fillStyle = W[1]; t.fillRect(4, 30, 3, 2); t.fillRect(14, 70, 4, 2); t.fillRect(0, 95, 22, 1);
    });
    case 'stone': return brickPattern(g, `cPaper:${r.id}`, 44, 22, [mix(W[2], '#8A8270', 0.35), mix(W[2], '#7A7262', 0.35)], W[0]);
  }
  return null;
};

/** A pilaster (a flat column up the wall: dimmed, not a ledge), its middle at x. */
const pilaster = (g: Ctx, x: number, top: number, bot: number, trim: string) => {
  const T = rampOf(dimc(trim, 0.2));
  box(g, x - 15, top, 30, bot - top, INK);
  const order = [3, 2, 2, 2, 1, 1, 0];
  order.forEach((k, i) => box(g, x - 14 + i * 4, top, 4, bot - top, T[k]));
  for (const fx of [x - 6, x + 2]) box(g, fx, top + 30, 2, bot - top - 60, T[1]);
  // (its capital and its base)
  box(g, x - 19, top, 38, 14, T[1]); box(g, x - 19, top, 38, 3, T[3]); box(g, x - 17, top + 14, 34, 4, T[0]);
  box(g, x - 19, bot - 14, 38, 14, T[1]); box(g, x - 19, bot - 14, 38, 2, T[2]);
};

/** One tile of a room's wall (x from tx to tx + TW, ceiling to floor). */
const paintWall = (g: Ctx, r: Room, tx: number) => {
  const top = ceilOf(r.id), L = LOOK[r.id], W = rampOf(r.wall), T = rampOf(r.trim);
  // The paper (or stone, or boards): darker up under the ceiling, its repeat over it
  bandedGradient(g, tx, top, TW, RAIL - top, [W[0], W[1], W[2], W[2], mix(W[2], W[3], 0.25)], 10);
  const pat = paperFill(g, r);
  if (pat) { g.fillStyle = pat; g.fillRect(tx, top + 40, TW, RAIL - top - 40); }
  if (L.paper === 'stone') {
    // (the kitchen: smoke-blackened up top, the stone's courses lit along their tops)
    hazeBands(g, tx, top + 40, TW, (RAIL - top) * 0.6, '#0A0604', 0.7, 0, 6);
  }
  hazeBands(g, tx, top + 40, TW, 140, '#0A0204', 0.5, 0, 4);
  // Pilasters at the tile's ends (each tile paints its half)
  if (L.paper !== 'stone') for (const px of [tx, tx + TW]) pilaster(g, px, top + 40, RAIL, r.trim);
  // The crown molding way up: stepped, dentils under it, its shadow on the wall
  box(g, tx, top, TW, 12, T[1]); box(g, tx, top + 12, TW, 3, T[3]); box(g, tx, top + 15, TW, 9, T[2]);
  for (let x = Math.floor(tx / 12) * 12; x < tx + TW; x += 12) { box(g, x, top + 24, 7, 7, T[3]); box(g, x, top + 29, 7, 2, T[1]); }
  box(g, tx, top + 31, TW, 5, T[1]); box(g, tx, top + 36, TW, 2, INK); checker(g, tx, top + 38, TW, 2, '#0A0204');
  // The chair rail (dim: no lip to it), the wainscot under it
  const WA = rampOf(L.wain);
  box(g, tx, RAIL, TW, FOOT - RAIL, WA[1]);
  box(g, tx, RAIL - 2, TW, 2, INK); box(g, tx, RAIL, TW, 8, T[1]); box(g, tx, RAIL, TW, 2, mix(T[2], T[1], 0.5)); box(g, tx, RAIL + 8, TW, 2, INK);
  if (L.paper === 'stone') {
    // (the kitchen's: glazed white tile, gone yellow, grime working up from the floor)
    g.fillStyle = tilePattern(g, 'cKitTile', 16, 12, t => {
      t.fillStyle = WA[0]; t.fillRect(0, 0, 16, 12); t.fillStyle = WA[2]; t.fillRect(0, 0, 15, 11);
      t.fillStyle = WA[3]; t.fillRect(0, 0, 15, 1); t.fillRect(0, 0, 1, 11); t.fillStyle = WA[1]; t.fillRect(1, 9, 14, 2);
    });
    g.fillRect(tx, RAIL + 10, TW, FOOT - RAIL - 30);
    hazeBands(g, tx, RAIL + 60, TW, FOOT - RAIL - 80, '#1A1408', 0, 0.6, 5);
  } else {
    // (raised panels: a groove round each, the bevel lit top and left)
    for (let px = Math.floor(tx / 100) * 100 + 8; px < tx + TW; px += 100) {
      const y0 = RAIL + 22, h = FOOT - 34 - y0;
      box(g, px, y0, 84, h, WA[0]);
      box(g, px + 2, y0 + 2, 82, h - 2, WA[3]); box(g, px + 4, y0 + h - 4, 80, 2, WA[1]); box(g, px + 82, y0 + 4, 2, h - 6, WA[1]);
      box(g, px + 6, y0 + 6, 74, h - 12, WA[2]); checker(g, px + 6, y0 + 6, 74, 2, WA[3]); checker(g, px + 6, y0 + h - 8, 74, 2, WA[1], 1);
      box(g, px + 10, y0 + 10, 66, h - 20, mix(WA[2], WA[1], 0.4));
    }
  }
  // The baseboard
  box(g, tx, FOOT - 20, TW, 20, WA[0]); box(g, tx, FOOT - 20, TW, 3, WA[2]); box(g, tx, FOOT - 17, TW, 1, WA[1]); box(g, tx, FOOT - 2, TW, 2, INK);
};

const drawRoomWalls = (c: Ctx, state: GameState, r: Room) => {
  const top = ceilOf(r.id);
  for (let i = 0, tx = r.a; tx < r.b; i++, tx += TW) {
    if (!seen(state, tx, tx + TW)) continue;
    stamp(c, `cWall:${r.id}:${i}`, tx, top, Math.min(TW, r.b - tx), FOOT - top, g => paintWall(g, r, tx));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floor: boards (or flagstones, or carpet) going back to the wall, converging on the eye; the lit edge he walks
// along; under it the floor's thickness and the stone it's laid on

const drawFloor = (c: Ctx, state: GameState, r: Room) => {
  const L = LOOK[r.id], F = rampOf(L.floor), ex = state.camera.x + CANVAS_WIDTH / 2;
  const a = Math.max(r.a, state.camera.x - 40), b = Math.min(r.b, state.camera.x + CANVAS_WIDTH + 40);
  if (b <= a) return;
  const K = 0.93;
  // (going back: darker toward the wall, in bands, dithered between)
  box(c, a, FOOT, b - a, 8, F[0]); box(c, a, FOOT + 8, b - a, 7, F[1]); box(c, a, FOOT + 15, b - a, 7, F[2]);
  checker(c, a, FOOT + 6, b - a, 2, F[1]); checker(c, a, FOOT + 13, b - a, 2, F[2]);
  box(c, a, FOOT, b - a, 2, INK);
  if (L.floorKind !== 'carpet') {
    // (the seams: each from his plane back toward the one eye)
    const step = L.floorKind === 'flags' ? 64 : 28;
    c.fillStyle = L.floorKind === 'flags' ? F[0] : mix(F[0], INK, 0.3);
    for (let x = Math.floor(a / step) * step; x < b + step; x += step) {
      for (let k = 0; k < 11; k++) { const y = FOOT + 2 + k * 2, s = (y - FOOT) / (GY - FOOT), bx = ex + (x - ex) * (K + (1 - K) * s); c.fillRect(Math.round(bx), y, 1, 2); }
    }
    if (L.floorKind === 'flags') box(c, a, FOOT + 10, b - a, 1, F[0]);
  } else {
    // (carpet: a border pattern along the front, a pile stipple)
    checker(c, a, FOOT + 2, b - a, 6, mix(F[1], F[2], 0.5));
    box(c, a, GY - 6, b - a, 2, mix(F[2], '#C9A227', 0.35));
  }
  // The edge he walks along: lit
  box(c, a, GY, b - a, 2, F[4]); box(c, a, GY + 2, b - a, 2, F[3]); checker(c, a, GY + 4, b - a, 2, F[3]);
  // (under it: the boards' thickness, the joists, then the stone below)
  box(c, a, GY + 6, b - a, 10, F[1]); box(c, a, GY + 16, b - a, 2, INK);
  c.fillStyle = brickPattern(c, 'cUnderStone', 40, 18, ['#2A2024', '#251C20'], '#140E10');
  c.fillRect(a, GY + 18, b - a, 382);
  for (let x = Math.floor(a / 120) * 120; x < b; x += 120) { box(c, x, GY + 18, 18, 22, '#3A2418'); box(c, x, GY + 18, 18, 2, '#5A3A24'); }
  hazeBands(c, a, GY + 18, b - a, 80, '#0A0406', 0.1, 0.85, 5);
  box(c, a, GY + 98, b - a, 302, '#0A0406');
};

// ---------------------------------------------------------------------------------------------------------------
// The rooms' things (stamped)

/** A tall gothic window: its stone surround, the leaded glass (moonlight, a drift of cloud), the sill; the heavy
 *  curtains either side, tied back, the pelmet over. (x: the glass's left; bot: its sill.) */
const gothicWindow = (c: Ctx, id: RoomId, x: number, bot: number, w = 70, h = 300) => { const tod = timeOfDay(); put(c, `cWin:${id}:${w}:${h}:${tod.key}`, x, bot, -56, -h - w / 2 - 30, w + 112, h + w / 2 + 80, g => {
  const top = -h, S = rampOf('#4A4048'), D = rampOf(LOOK[id].drape);
  const arch = (inset: number) => { g.beginPath(); g.moveTo(-inset, 0); g.lineTo(-inset, top); for (let k = 0; k <= 8; k++) { const a = Math.PI + (k / 8) * Math.PI; g.lineTo(w / 2 + Math.cos(a) * (w / 2 + inset), top + Math.sin(a) * (w / 2 + inset)); } g.lineTo(w + inset, 0); g.closePath(); };
  // (the stone surround)
  g.fillStyle = INK; arch(14); g.fill(); g.fillStyle = S[1]; arch(12); g.fill(); g.fillStyle = S[2]; arch(8); g.fill();
  g.fillStyle = S[3]; g.fillRect(-8, top, 3, h); g.fillStyle = S[0]; g.fillRect(w + 5, top, 3, h);
  // (the glass: the sky outside at this hour (old glass: a little dim), banded; a drift of cloud; stars at night)
  g.save(); arch(0); g.clip();
  const sky = [0.1, 0.35, 0.6, 0.85].map(v => mix(skyAt(v, tod), '#101828', 0.3));
  bandedGradient(g, 0, top - w / 2, w, h + w / 2, sky, 8);
  const cl = mix(tod.cloud, '#101828', 0.35);
  pixelBlob(g, w * 0.6, top + 90, 30, 6, cl); pixelBlob(g, w * 0.2, top + 170, 26, 5, mix(cl, sky[2], 0.4));
  const stars = Math.round(6 * tod.stars);
  for (let k = 0; k < stars; k++) box(g, Math.floor(hash(k + w) * w), top - w / 2 + 10 + Math.floor(hash(k * 3 + h) * 120), 2, 2, '#C8D8F0');
  // (the view out, low in the glass: the crags far off, the town's roofs below, and up over them the ELEVATOR TO
  // HELL's clock tower: the ride after this one; all through the old glass, dimmed)
  {
    const hz = -Math.round(h * 0.3), sd = (k: number) => mix(skyAt(0.9, tod), '#1A1428', k);
    const crag = sd(0.35), cragL = sd(0.25);
    g.fillStyle = crag; g.beginPath(); g.moveTo(0, hz + 4);
    for (let x = 0; x <= w; x += 4) g.lineTo(x, hz - 10 - Math.round((Math.sin(x * 0.11 + w) * 0.5 + 0.5) * 16 + hash(Math.floor(x / 4) + h) * 4));
    g.lineTo(w, hz + 4); g.closePath(); g.fill();
    for (let x = 0; x < w; x += 8) box(g, x, hz - 6 - Math.round((Math.sin(x * 0.11 + w) * 0.5 + 0.5) * 12), 2, 4, cragL);
    drawTowerIntact(g, Math.round(w * 0.6), hz + 8, 0.15, 0);
    const roof = sd(0.55), roofL = sd(0.45), lamp = mix('#C8923C', '#101828', 0.3);
    for (let x = -4, i = 0; x < w + 4; i++) {
      const rw = 12 + Math.floor(hash(i * 3.3 + w) * 4) * 2, rh = 10 + Math.floor(hash(i * 5.1 + h) * 6) * 2, rt = hz + 12 - rh;
      box(g, x, rt, rw, -rt, roof); box(g, x, rt, 1, -rt, roofL);
      g.fillStyle = roof; g.beginPath(); g.moveTo(x - 1, rt + 1); g.lineTo(x + rw / 2, rt - 7); g.lineTo(x + rw + 1, rt + 1); g.closePath(); g.fill();
      for (let wy = rt + 4; wy < -4; wy += 7) for (let wx = x + 3; wx < x + rw - 3; wx += 5) box(g, wx, wy, 2, 2, tod.lamps > 0.2 && hash(wx * 0.7 + wy * 1.3) > 1 - 0.5 * tod.lamps ? lamp : sd(0.65));
      x += rw - 1;
    }
    g.globalAlpha = 0.28; box(g, 0, hz - 80, w, 80 - hz, '#101828'); g.globalAlpha = 1;
  }
  // (the leading: diamonds)
  g.strokeStyle = '#0E0C12'; g.lineWidth = 1.5; g.beginPath();
  for (let k = -h; k < w + h; k += 18) { g.moveTo(k, 0); g.lineTo(k + h + w, -h - w); g.moveTo(k, 0); g.lineTo(k - h - w, -h - w); }
  g.stroke();
  // (moonlight catching a few panes)
  for (let k = 0; k < 5; k++) checker(g, 6 + k * 10, top + 20 + k * 40, 8, 24, mix(sky[2], '#FFFFFF', 0.18));
  g.restore();
  // (the mullion and the transoms: stone)
  box(g, w / 2 - 4, top - w / 2, 8, h + w / 2, INK); box(g, w / 2 - 3, top - w / 2, 6, h + w / 2, S[2]); box(g, w / 2 - 3, top - w / 2, 2, h + w / 2, S[3]);
  for (let y = top + 60; y < -20; y += 80) { box(g, 0, y - 1, w, 7, INK); box(g, 0, y, w, 5, S[2]); box(g, 0, y, w, 2, S[3]); }
  // (the sill)
  box(g, -14, -1, w + 28, 12, INK); box(g, -13, 0, w + 26, 10, S[2]); box(g, -13, 0, w + 26, 2, mix(S[3], S[2], 0.5)); box(g, -13, 8, w + 26, 2, S[0]);
  // The curtains: velvet in folds, gathered at the tiebacks, down past the sill
  for (const cx of [-46, w + 16]) {
    const cw = 30, ct = top - w / 2 - 14, cb = 40;
    box(g, cx - 1, ct, cw + 2, cb - ct, INK);
    const folds = [1, 2, 3, 2, 1, 0, 1, 2, 3, 2];
    folds.forEach((k, i) => box(g, cx + i * 3, ct, 3, cb - ct, D[k]));
    // (the tieback: the cloth pinched in, a gold cord)
    const ty = -110;
    box(g, cx - 2, ty - 3, cw + 4, 10, D[0]); box(g, cx - 3, ty, cw + 6, 5, GILT[2]); box(g, cx - 3, ty, cw + 6, 2, GILT[4]);
    box(g, cx + cw / 2 - 2, ty + 5, 4, 14, GILT[2]); box(g, cx + cw / 2 - 3, ty + 18, 6, 6, GILT[3]);
    hazeBands(g, cx, cb - 50, cw, 50, '#0A0204', 0, 0.4, 3);
  }
  // (the pelmet over it all: velvet, scalloped, gold fringe)
  const py = top - w / 2 - 24, pw = w + 112;
  box(g, -57, py - 1, pw + 2, 22, INK); box(g, -56, py, pw, 20, D[2]); box(g, -56, py, pw, 3, D[3]); box(g, -56, py + 16, pw, 4, D[0]);
  for (let k = -56; k < w + 56; k += 16) { box(g, k + 2, py + 20, 12, 4, D[1]); box(g, k + 4, py + 24, 8, 2, D[1]); box(g, k + 2, py + 20, 12, 1, GILT[3]); }
  box(g, -56, py + 4, pw, 2, GILT[3]);
}); };

/** A fireplace, big as a garage: the cut-stone surround, the mantel, the firebox (its fire drawn live). Feet at GY. */
const paintFireplace = (g: Ctx) => {
  const S = rampOf('#5E5650');
  // (the surround: cut stone, each block lit along its top and left)
  box(g, -122, -232, 244, 232, INK);
  for (let y = -230, row = 0; y < 0; y += 26, row++) for (let bx = -120 - (row % 2) * 20; bx < 120; bx += 40) {
    const x = Math.max(-120, bx), xr = Math.min(120, bx + 38), k = hash(bx * 0.3 + y);
    box(g, x, y, xr - x, 24, k < 0.3 ? S[1] : S[2]); box(g, x, y, xr - x, 2, S[3]); box(g, x, y, 2, 24, S[3]); box(g, x, y + 22, xr - x, 2, S[0]);
  }
  // (the mantel: a heavy shelf on corbels; dimmed: not a ledge)
  const M = rampOf('#4E4038');
  box(g, -132, -254, 264, 24, INK); box(g, -130, -252, 260, 20, M[2]); box(g, -130, -252, 260, 2, M[3]); box(g, -130, -236, 260, 4, M[0]);
  for (const kx of [-112, 96]) { box(g, kx, -232, 16, 30, M[1]); box(g, kx, -232, 16, 3, M[2]); box(g, kx + 4, -206, 8, 6, M[0]); }
  // (the opening, arched, the firebox inside going back black, the bricks at the back just catching the glow)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-82, 0); g.lineTo(-82, -140); g.quadraticCurveTo(0, -186, 82, -140); g.lineTo(82, 0); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(-78, 0); g.lineTo(-78, -138); g.quadraticCurveTo(0, -180, 78, -138); g.lineTo(78, 0); g.closePath(); g.clip();
  bandedGradient(g, -80, -180, 160, 180, ['#050203', '#0E0606', '#1E0C08', '#3A160C'], 8);
  g.fillStyle = brickPattern(g, 'cFireBrick', 16, 8, ['#2A120C', '#24100A'], '#120806'); g.fillRect(-60, -150, 120, 130);
  hazeBands(g, -80, -180, 160, 120, '#050203', 0.9, 0, 5);
  g.restore();
  // (the hearth, out in front; the andirons, the logs)
  box(g, -112, -8, 224, 8, S[1]); box(g, -112, -8, 224, 2, S[3]);
  for (const ax of [-46, 40]) { box(g, ax, -34, 6, 26, IRON[1]); box(g, ax - 2, -38, 10, 6, IRON[3]); }
  for (const [lx, ly, lw] of [[-52, -20, 104], [-40, -30, 80]] as const) { box(g, lx, ly, lw, 11, '#2A160C'); box(g, lx, ly, lw, 3, '#4A2A16'); box(g, lx + lw - 6, ly + 2, 5, 7, '#6A4A2A'); }
};
/** The fire in it (live): tongues in steps, dim (it's back there: no glare). */
const fireIn = (c: Ctx, x: number, f: number) => {
  const cols = ['#7A2A10', '#A8461A', '#C8762A', '#D8A040'];
  for (let k = 0; k < 7; k++) {
    const h = 26 + Math.sin(f * 0.27 + k * 1.9) * 9 + (k % 3) * 8, fx = x - 48 + k * 14;
    for (let s = 0; s < 4; s++) { const hh = h * (1 - s * 0.24), ww = 12 - s * 3; box(c, fx + (12 - ww) / 2, GY - 24 - hh, ww, hh, cols[s]); }
  }
  for (let k = 0; k < 3; k++) if ((f + k * 11) % 30 < 15) box(c, x - 30 + k * 30 + ((f >> 2) % 3), GY - 70 - ((f + k * 11) % 30) * 1.4, 2, 2, '#D8A040');
};
const fireplace = (c: Ctx, x: number, f: number) => { put(c, 'cFireplace', x, GY, -134, -258, 268, 260, paintFireplace); fireIn(c, x, f); };

/** A candle in a cup (live flame): its foot at (x, y). */
const candle = (c: Ctx, x: number, y: number, h: number, f: number, seed: number) => {
  box(c, x - 3, y - h - 1, 7, h + 1, INK); box(c, x - 2, y - h, 5, h, WAX[2]); box(c, x - 2, y - h, 1, h, WAX[4]); box(c, x + 2, y - h, 1, h, WAX[1]);
  box(c, x - 2, y - h, 5, 2, WAX[3]); box(c, x, y - h - 3, 1, 3, INK);
  const fl = (f + seed) % 9 < 4 ? 1 : 0;
  box(c, x - 1, y - h - 9 - fl, 3, 6 + fl, '#E8862A'); box(c, x, y - h - 7 - fl, 1, 4, '#F8D878');
};
/** A wall sconce: a brass back plate, an arm, a cup, its candle (live). Its flame's foot at (x, y). */
const sconce = (c: Ctx, x: number, y: number, f: number) => {
  box(c, x - 7, y + 6, 14, 22, INK); box(c, x - 6, y + 7, 12, 20, BRASS[1]); box(c, x - 6, y + 7, 12, 2, BRASS[3]); box(c, x - 2, y + 12, 4, 10, BRASS[0]);
  box(c, x - 9, y, 18, 6, INK); box(c, x - 8, y + 1, 16, 4, BRASS[2]); box(c, x - 8, y + 1, 16, 1, BRASS[4]);
  candle(c, x, y, 18, f, x);
};
/** A candelabra (three candles, lit), its foot at (x, y). */
const candelabra = (c: Ctx, x: number, y: number, f: number) => {
  box(c, x - 9, y - 5, 18, 5, INK); box(c, x - 8, y - 4, 16, 4, BRASS[2]); box(c, x - 8, y - 4, 16, 1, BRASS[4]);
  pole(c, x - 2, y - 26, 4, 22, BRASS[2]);
  box(c, x - 15, y - 29, 30, 5, INK); box(c, x - 14, y - 28, 28, 3, BRASS[2]); box(c, x - 14, y - 28, 28, 1, BRASS[4]);
  for (const dx of [-12, 0, 12]) candle(c, x + dx, y - 28, dx ? 10 : 14, f, dx * 7 + x);
};
/** A portrait's eyes, following him (live, over the stamped painting): two pupils turned his way. */
const eyesFollow = (c: Ctx, state: GameState, x: number, y: number) => {
  const p = state.player, dx = Math.sign(p.pos.x + p.width / 2 - x), dy = p.pos.y + 30 - dyAt(p.pos.x) > y ? 1 : 0;
  box(c, x - 8, y - 1, 6, 4, '#E8E2D0'); box(c, x + 2, y - 1, 6, 4, '#E8E2D0');
  box(c, x - 6 + dx * 2, y + dy, 2, 2, INK); box(c, x + 4 + dx * 2, y + dy, 2, 2, INK);
};

/** Each room's windows (from its left end): x, and the sill's height (up off the floor). */
const WINDOWS: Record<RoomId, [number, number][]> = {
  foyer: [[560, 230]], dining: [[440, 230], [1320, 230]], kitchen: [[600, 230], [1340, 230]], study: [[1100, 230], [1150, 760]],
  bedroom: [[250, 230], [860, 440]], nursery: [[320, 230], [1180, 230]], gallery: [],
};
/** The sconces down each room (room x), clear of the windows and the pictures; where the candlelight comes from. */
const SCONCES: Record<RoomId, number[]> = {
  foyer: [290], dining: [180, 990, 1790], kitchen: [180, 990], study: [380, 1040], bedroom: [560, 1680], nursery: [180, 760, 1380], gallery: [300, 1300],
};
const SCONCE_Y = GY - 270;

/** A suit of armor on its plinth, halberd in its fist (scenery: dimmed back). Feet at its origin. */
const paintArmor = (g: Ctx) => {
  const St = rampOf(dimc('#8A90A0', 0.3)), P = rampOf(dimc('#4A3A34', 0.2)), Rd = rampOf(dimc('#9A1A1A', 0.25));
  slab(g, -28, -26, 56, 26, P[2], { edge: 4 });
  // (the halberd, behind its arm)
  box(g, 18, -176, 4, 150, P[0]); box(g, 19, -176, 1, 150, P[3]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(12, -170); g.lineTo(34, -164); g.lineTo(30, -146); g.lineTo(12, -150); g.closePath(); g.fill();
  g.fillStyle = St[3]; g.beginPath(); g.moveTo(14, -168); g.lineTo(31, -163); g.lineTo(28, -149); g.lineTo(14, -152); g.closePath(); g.fill();
  box(g, 18, -190, 4, 16, St[2]);
  // (the legs: greaves, knee cops, sabatons)
  for (const lx of [-13, 2]) { pole(g, lx, -72, 11, 46, St[2]); box(g, lx - 1, -58, 13, 7, St[3]); box(g, lx - 2, -30, 15, 5, St[1]); }
  // (the skirt of plates, the breastplate, the pauldrons)
  for (let k = 0; k < 3; k++) { box(g, -17, -84 + k * 5, 34, 6, INK); box(g, -16, -83 + k * 5, 32, 4, St[2 - (k % 2)]); }
  box(g, -17, -126, 34, 44, INK); box(g, -16, -125, 32, 42, St[2]); box(g, -16, -125, 12, 42, St[3]); box(g, -12, -121, 4, 20, St[4]); box(g, 10, -125, 6, 42, St[1]);
  box(g, -1, -125, 2, 40, St[1]);
  for (const sx of [-25, 13]) { box(g, sx - 1, -129, 14, 16, INK); box(g, sx, -128, 12, 14, St[2]); box(g, sx, -128, 12, 4, St[3]); }
  // (the arms, the gauntlet round the haft)
  pole(g, -24, -114, 8, 32, St[2]); pole(g, 14, -114, 8, 28, St[2]); box(g, 14, -88, 10, 8, St[1]);
  // (the helm: the visor's slit, the red plume)
  box(g, -11, -153, 22, 26, INK); box(g, -10, -152, 20, 24, St[2]); box(g, -10, -152, 7, 24, St[3]); box(g, -8, -141, 16, 3, INK); box(g, -8, -134, 16, 1, St[1]);
  for (let k = 0; k < 4; k++) box(g, -4 + k * 2, -166 + k, 4, 14 - k, Rd[2 + (k % 2)]);
};

/** A portrait in its gilt frame: a sitter (each their own), and how they went. (Its eyes are left for eyesFollow.) */
const paintPortrait = (g: Ctx, w: number, h: number, i: number, eyes: boolean) => {
  // (the frame: stepped gilt, lit top-left, ornaments at the corners)
  box(g, -8, -8, w + 16, h + 16, INK);
  box(g, -7, -7, w + 14, h + 14, GILT[2]); box(g, -7, -7, w + 14, 2, GILT[4]); box(g, -7, -7, 2, h + 14, GILT[3]);
  box(g, -7, h + 5, w + 14, 2, GILT[0]); box(g, w + 5, -7, 2, h + 14, GILT[1]);
  box(g, -3, -3, w + 6, h + 6, GILT[1]); checker(g, -5, -5, w + 10, 2, GILT[3]);
  for (const [cx, cy] of [[-7, -7], [w - 3, -7], [-7, h - 3], [w - 3, h - 3]]) { box(g, cx, cy, 10, 10, GILT[3]); box(g, cx + 3, cy + 3, 4, 4, GILT[1]); }
  box(g, -1, -1, w + 2, h + 2, INK);
  // (the painting: a dark ground, banded)
  const grounds = [['#1A1420', '#2E2438', '#3A2E44'], ['#141E1A', '#22342C', '#2E4038'], ['#201A12', '#3A3020', '#4A3E28'], ['#1E1418', '#342228', '#422C32'], ['#121822', '#202C3C', '#2A3A4E'], ['#22140E', '#3A2418', '#4A3020']][i % 6];
  bandedGradient(g, 0, 0, w, h, grounds, 6);
  const cx = Math.round(w / 2), fy = Math.round(h * 0.3), fw = Math.max(18, Math.round(w * 0.14));
  const skin = ['#C9A98A', '#8A5A3A', '#E0BCA0', '#5A3A28', '#B88A66', '#D8B090'][i % 6], S = rampOf(skin);
  const coat = ['#1E1A22', '#2A1A40', '#3A1A1A', '#1A2A22', '#2A2A3A', '#3A2A10'][i % 6], C = rampOf(coat);
  // (the shoulders, the coat, a collar, a jewel)
  box(g, cx - w * 0.32, h * 0.62, w * 0.64, h * 0.38, C[2]); box(g, cx - w * 0.32, h * 0.62, w * 0.2, h * 0.38, C[3]); box(g, cx + w * 0.18, h * 0.62, w * 0.14, h * 0.38, C[1]);
  box(g, cx - 8, h * 0.6, 16, 10, i % 2 ? '#E8E2D0' : '#9A1A1A'); box(g, cx - 2, h * 0.66, 4, 4, GILT[3]);
  // (the neck, the face, lit from the left)
  box(g, cx - 5, fy + 24, 10, h * 0.62 - fy - 22, S[1]);
  box(g, cx - fw / 2 - 1, fy - 1, fw + 2, 28, INK); box(g, cx - fw / 2, fy, fw, 26, S[2]); box(g, cx - fw / 2, fy, 4, 26, S[3]); box(g, cx + fw / 2 - 4, fy, 4, 26, S[1]);
  box(g, cx - 1, fy + 10, 3, 6, S[1]);
  if (!eyes) { box(g, cx - 7, fy + 8, 5, 3, INK); box(g, cx + 3, fy + 8, 5, 3, INK); }
  // (the hair: slicked, a wig, a bun, bald, a beard, a widow's peak)
  const hair = ['#141016', '#D8D4CC', '#4A2A14', '#141016', '#8A3A1A', '#2A2A2A'][i % 6];
  switch (i % 6) {
    case 0: box(g, cx - fw / 2 - 2, fy - 6, fw + 4, 8, hair); box(g, cx - 2, fy, 4, 4, hair); break;
    case 1: box(g, cx - fw / 2 - 8, fy - 8, fw + 16, 10, hair); box(g, cx - fw / 2 - 8, fy, 8, 30, hair); box(g, cx + fw / 2, fy, 8, 30, hair); break;
    case 2: box(g, cx - fw / 2 - 2, fy - 4, fw + 4, 6, hair); box(g, cx - 7, fy - 14, 14, 10, hair); break;
    case 3: box(g, cx - fw / 2, fy - 2, fw, 3, S[3]); box(g, cx - fw / 2 - 2, fy + 6, 3, 8, hair); box(g, cx + fw / 2 - 1, fy + 6, 3, 8, hair); break;
    case 4: box(g, cx - fw / 2 - 2, fy - 5, fw + 4, 7, hair); box(g, cx - fw / 2, fy + 18, fw, 12, hair); break;
    default: box(g, cx - fw / 2 - 2, fy - 6, fw + 4, 6, hair); box(g, cx - 3, fy, 6, 3, hair);
  }
  // (and how they went: a grape, an apple in the mouth, a tight-lipped smirk)
  if (i % 3 === 0) { box(g, cx - 4, fy + 16, 8, 8, INK); box(g, cx - 3, fy + 17, 6, 6, '#6A1E9E'); box(g, cx - 2, fy + 18, 2, 2, '#B07ADE'); }
  else box(g, cx - 4, fy + 18, 8, 2, S[0]);
  // (the varnish, gone dark at the edges)
  hazeBands(g, 0, h - 30, w, 30, '#0A0606', 0, 0.45, 3);
};
const portrait = (c: Ctx, x: number, y: number, w: number, h: number, i: number, eyes: boolean) => put(c, `cPortrait:${i % 6}:${w}:${h}:${eyes}`, x, y, -10, -10, w + 20, h + 20, g => paintPortrait(g, w, h, i, eyes));

/** A floor-to-ceiling bookcase (scenery: its shelves dark, no lips: not to stand on). */
const SHELF_WOOD = rampOf(dimc('#3A2414', 0.15));
const BOOK_COLS = ['#5A1414', '#14285A', '#143A20', '#5A3A10', '#3A1460', '#7A5A10', '#2A2A2A', '#5A2A3A'].map(c => dimc(c, 0.2));
/** One shelf's books, x0..x1 (every height and width, a lean now and then, a gap), standing on the board at y + 34; the
 *  board under them, x0 - 8..x1 + 12. */
const bookRow = (g: Ctx, x0: number, x1: number, y: number, seed: number) => {
  const Wd = SHELF_WOOD;
  for (let bx = x0, k = seed; bx < x1; k++) {
    const s = hash(k * 1.37), bw = 6 + Math.floor(s * 7), bh = 22 + Math.floor(hash(k * 2.1) * 12), R = rampOf(BOOK_COLS[k % BOOK_COLS.length]);
    if (s > 0.94) { bx += 14; continue; }
    if (s > 0.88 && bx + 26 < x1) {
      g.save(); g.translate(bx, y + 34); g.rotate(-0.35); box(g, 0, -bh, bw, bh, R[2]); box(g, 0, -bh, 1, bh, R[3]); g.restore(); bx += 18; continue;
    }
    box(g, bx, y + 34 - bh, bw, bh, R[2]); box(g, bx, y + 34 - bh, 1, bh, R[3]); box(g, bx + bw - 1, y + 34 - bh, 1, bh, R[0]);
    if (s < 0.5) { box(g, bx, y + 38 - bh, bw, 2, GILT[1]); box(g, bx, y + 30 - 6, bw, 2, GILT[1]); }
    bx += bw + 1;
  }
  // (the shelf board: dark, its front edge only a shade up)
  box(g, x0 - 8, y + 34, x1 - x0 + 20, 6, Wd[1]); box(g, x0 - 8, y + 34, x1 - x0 + 20, 1, Wd[2]); box(g, x0 - 8, y + 40, x1 - x0 + 20, 2, INK);
};
/** The library's cases are all this tall (floor to ceiling); their shelves every 44 from the top, here (from FOOT). */
const CASE_H = 1180;
const shelfYs = (): number[] => { const out: number[] = []; for (let y = -CASE_H + 30; y < -20; y += 44) out.push(y); return out; };
const paintBookcase = (g: Ctx, w: number, h: number, i: number) => {
  const Wd = SHELF_WOOD;
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  box(g, 0, -h, w, h, Wd[0]);
  pole(g, 0, -h, 10, h, Wd[2]); pole(g, w - 10, -h, 10, h, Wd[2]);
  box(g, 0, -h, w, 18, Wd[2]); box(g, 0, -h, w, 3, Wd[3]); box(g, 0, -h + 15, w, 3, Wd[0]);
  for (let y = -h + 30, row = 0; y < -20; y += 44, row++) bookRow(g, 12, w - 16, y, i * 31 + row * 7);
  box(g, 0, -20, w, 20, Wd[1]); box(g, 0, -20, w, 2, Wd[2]);
};
const bookcase = (c: Ctx, x: number, w: number, h: number, i: number) => put(c, `cBooks:${w}:${h}:${i}`, x, FOOT, -2, -h - 2, w + 4, h + 4, g => paintBookcase(g, w, h, i));

// ---------------------------------------------------------------------------------------------------------------
// The set pieces

const drawChandelier = (c: Ctx, x: number, y: number, f: number, shake: number, top: number) => {
  const jx = shake ? Math.round(Math.sin(f * 1.7) * shake) : 0, X = x + jx;
  // (its chain, up into the dark)
  c.strokeStyle = BRASS[0]; c.lineWidth = 3; c.setLineDash([5, 3]); c.beginPath(); c.moveTo(x + Math.round(jx * 0.3) + 0.5, top); c.lineTo(X + 0.5, y - 34); c.stroke();
  c.strokeStyle = BRASS[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + Math.round(jx * 0.3) - 0.5, top); c.lineTo(X - 0.5, y - 34); c.stroke(); c.setLineDash([]);
  // (the crown, the stem)
  box(c, X - 9, y - 38, 18, 8, INK); box(c, X - 8, y - 37, 16, 6, BRASS[2]); box(c, X - 8, y - 37, 16, 2, BRASS[4]);
  pole(c, X - 3, y - 30, 6, 56, BRASS[2]);
  // (the arms, out to the ring)
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) box(c, X + s * (6 + k * 10) - (s < 0 ? 10 : 0), y - 12 + k * 3, 10, 3, k % 2 ? BRASS[2] : BRASS[1]);
  // (the ring: lit along its top, beaded)
  const L = X - CHAND_W / 2;
  box(c, L - 1, y - 1, CHAND_W + 2, 12, INK); box(c, L, y, CHAND_W, 10, BRASS[2]); box(c, L, y, CHAND_W, 2, BRASS[4]); box(c, L, y + 2, CHAND_W, 2, BRASS[3]); box(c, L, y + 8, CHAND_W, 2, BRASS[0]);
  for (let k = 4; k < CHAND_W - 2; k += 8) box(c, L + k, y + 5, 2, 2, BRASS[0]);
  // (the bowl under, in steps, its finial)
  [[64, BRASS[2]], [50, BRASS[1]], [36, BRASS[2]], [20, BRASS[1]]].forEach(([w, col], k) => { box(c, X - (w as number) / 2 - 1, y + 10 + k * 4, (w as number) + 2, 5, INK); box(c, X - (w as number) / 2, y + 10 + k * 4, w as number, 4, col as string); box(c, X - (w as number) / 2, y + 10 + k * 4, 4, 4, BRASS[3]); });
  box(c, X - 3, y + 26, 6, 6, BRASS[2]); box(c, X - 1, y + 32, 2, 4, BRASS[1]);
  // (the candles on the ring)
  for (let k = -2; k <= 2; k++) candle(c, X + k * 20, y, 16, f, k * 3 + x);
  // (the crystals: drops on threads, glinting)
  for (let k = -3; k <= 3; k++) {
    const dx = X + k * 13, len = 6 + (k & 1) * 6;
    box(c, dx, y + 24, 1, len, '#9AB8C8');
    box(c, dx - 2, y + 24 + len, 5, 6, INK); box(c, dx - 1, y + 24 + len, 3, 5, '#BFE3F5'); box(c, dx - 1, y + 24 + len, 1, 2, ((f >> 3) + k) % 5 ? '#E0F2FE' : '#FFFFFF');
  }
};
const drawWreck = (c: Ctx, x: number, y: number) => {
  const L = x - CHAND_W / 2;
  // (the ring, crumpled flat, its arms bent up, the bowl knocked off)
  box(c, L - 7, y - 11, CHAND_W + 14, 12, INK); box(c, L - 6, y - 10, CHAND_W + 12, 10, BRASS[1]); box(c, L - 6, y - 10, CHAND_W + 12, 2, BRASS[3]);
  for (const [ax, h] of [[L + 10, 18], [L + 40, 12], [L + 70, 22]] as const) { box(c, ax - 1, y - 10 - h, 5, h, INK); box(c, ax, y - 10 - h, 3, h, BRASS[2]); }
  box(c, x + 20, y - 18, 22, 8, INK); box(c, x + 21, y - 17, 20, 6, BRASS[2]); box(c, x + 21, y - 17, 20, 2, BRASS[4]);
  // (glass everywhere, the candles knocked over)
  for (let k = 0; k < 11; k++) box(c, x - 52 + k * 10 + (k % 3), y - 3 - (k % 3) * 2, 3, 2, k % 2 ? '#E0F2FE' : '#9AB8C8');
  for (const [cx, cy] of [[x - 30, y - 14], [x + 4, y - 16]] as const) { box(c, cx - 1, cy - 1, 16, 6, INK); box(c, cx, cy, 14, 4, WAX[2]); box(c, cx, cy, 14, 1, WAX[4]); }
};

/** The stoves' iron bodies (stamped); their burners, oven windows and sparks are live (drawStove). */
const paintStove = (g: Ctx, w: number) => {
  const H = GY - STOVE_TOP;
  // (its flue pipe, up the wall behind it into the dark, a damper on it)
  box(g, w - 52, -H - 520, 22, 520, INK); pole(g, w - 51, -H - 520, 20, 520, '#2A2A30', false); box(g, w - 54, -H - 300, 26, 6, IRON[3]);
  // (the body: black iron, nickel trim, riveted)
  box(g, -2, -H - 2, w + 4, H + 2, INK);
  box(g, 0, -H, w, H - 6, IRON[2]); box(g, 0, -H, 4, H - 6, IRON[3]); box(g, w - 6, -H, 6, H - 6, IRON[1]);
  box(g, 6, -H + 8, w - 12, 6, '#8A8E98'); box(g, 6, -H + 8, w - 12, 2, '#C8CCD4'); box(g, 6, -H + 13, w - 12, 1, INK);
  for (let k = 0; k < 6; k++) { const kx = 18 + k * ((w - 36) / 5) - 4; box(g, kx, -H + 9, 8, 4, '#3A3A40'); box(g, kx + 1, -H + 9, 3, 2, '#E8E8F0'); }
  for (let rx = 10; rx < w - 6; rx += 24) { box(g, rx, -12, 2, 2, IRON[4]); box(g, rx, -H + 18, 2, 2, IRON[4]); }
  // (the oven doors: panels, chrome handles; the windows left to drawStove)
  const ow = w / 2 - 18;
  for (const ox of [12, w / 2 + 6]) {
    box(g, ox - 1, -H + 21, ow + 2, H - 32, INK); box(g, ox, -H + 22, ow, H - 34, IRON[1]); box(g, ox, -H + 22, ow, 2, IRON[3]); box(g, ox, -H + 22, 2, H - 34, IRON[3]);
    box(g, ox + 8, -H + 26, ow - 16, 4, INK); box(g, ox + 8, -H + 26, ow - 16, 2, '#E8E8F0'); box(g, ox + 8, -H + 28, ow - 16, 1, '#8A8E98');
    box(g, ox + 13, -H + 33, ow - 26, 20, INK);
  }
  // (the feet: claw, cast)
  for (const fx of [4, w - 20]) { box(g, fx, -8, 16, 8, INK); box(g, fx + 1, -8, 14, 6, IRON[1]); box(g, fx + 1, -8, 14, 2, IRON[3]); }
  // (the top: the lit lip (stand on it, between flare-ups))
  box(g, -2, -H - 2, w + 4, 2, INK); box(g, 0, -H, w, 2, '#F0F0F4'); box(g, 0, -H + 2, w, 2, '#B8BCC4'); checker(g, 0, -H + 4, w, 2, '#8A8E98');
};
const drawStove = (c: Ctx, x: number, w: number, i: number, t: number, f: number) => {
  const ph = stovePhase(t, i), blink = (f >> 2) % 2 === 1;
  put(c, `cStove:${w}`, x, GY, -60, STOVE_TOP - GY - 530, w + 120, GY - STOVE_TOP + 536, g => paintStove(g, w));
  // (the oven windows: dark; glowing as it's about to go; bright in the flare-up)
  const ow = w / 2 - 18;
  for (const ox of [x + 12, x + w / 2 + 6]) {
    const col = ph === 'fire' ? '#E8701A' : ph === 'tell' ? (blink ? '#C04A14' : '#6A1E0A') : '#16161A';
    box(c, ox + 14, STOVE_TOP + 34, ow - 28, 18, col);
    if (ph !== 'off') { box(c, ox + 14, STOVE_TOP + 34, ow - 28, 3, ph === 'fire' ? '#F8C050' : '#A8401A'); checker(c, ox + 14, STOVE_TOP + 46, ow - 28, 6, '#3A0E06'); }
  }
  // (the burners: iron grates on the top, red-hot when they're going)
  for (const [bx, bw] of BURNERS) {
    const hot = ph === 'off' ? '#4A4A52' : ph === 'tell' ? (blink ? '#DC2626' : '#7F1D1D') : '#F05030';
    box(c, x + bx - 2, STOVE_TOP - 7, bw + 4, 7, INK);
    box(c, x + bx, STOVE_TOP - 6, bw, 5, hot); box(c, x + bx, STOVE_TOP - 6, bw, 1, ph === 'off' ? '#6A6A72' : '#FCA5A5');
    for (let k = 1; k < 5; k++) box(c, x + bx + k * (bw / 5) - 1, STOVE_TOP - 7, 2, 7, INK);
    // (the tell: it sputters, sparks spitting off it)
    if (ph === 'tell') for (let k = 0; k < 4; k++) { const s = (f + k * 5) % 12; box(c, x + bx + 8 + k * 16 + ((k * 3 + f) % 5), STOVE_TOP - 10 - s * 1.5, 3, 3, s < 6 ? '#FDBA74' : '#C2410C'); }
  }
};
/** The burners' flames (over everything behind: drawn in front of him). */
export const drawStoveFire = (c: Ctx, state: GameState, cs: Castle) => {
  c.save(); c.translate(0, DY.kitchen);
  const f = state.frame;
  const cols = ['#B91C1C', '#EA580C', '#F59E0B', '#FDE68A'];
  STOVES.forEach(([x], i) => {
    if (!seen(state, x, x + 300) || stovePhase(cs.stoveT, i) !== 'fire') return;
    const k = ((cs.stoveT + i * 100) % STOVE_CYCLE) - (STOVE_CYCLE - STOVE_FIRE);
    const h = FIRE_H * Math.min(1, k / 8) * (k > STOVE_FIRE - 10 ? (STOVE_FIRE - k) / 10 : 1);
    for (const [bx, bw] of BURNERS) {
      const n = 7, cw = bw / n;
      for (let j = 0; j < n; j++) {
        const fh = h * (0.62 + 0.38 * Math.abs(Math.sin(f * 0.45 + j * 1.7))), fx = x + bx + j * cw;
        // (each tongue in steps: the red outside, orange, amber, the yellow at its root)
        for (let s = 0; s < 4; s++) {
          const hh = fh * [1, 0.78, 0.55, 0.3][s], inset = [0, 1, 2, 3][s];
          box(c, fx + inset * 0.5, STOVE_TOP - hh, cw + 1 - inset, hh, cols[s]);
        }
        box(c, fx + cw * 0.3, STOVE_TOP - fh - 6 - ((f + j * 3) % 8), 3, 4, cols[0]);
      }
    }
  });
  c.restore();
};

const paintBed = (g: Ctx) => {
  const { w } = BED, top = BED.top - GY, Wd = rampOf('#4A2214'), Sh = ['#9AA0B0', '#C8CCD8', '#E2E6EE', '#F2F4F8', '#FFFFFF'], Cv = rampOf('#8A1430');
  // (the curtains off the canopy: pulled back to the posts, in folds)
  for (const cx of [6, w - 30]) { const folds = [1, 2, 3, 2, 1, 2, 3, 1]; box(g, cx - 1, -352, 26, 230, INK); folds.forEach((k, i) => box(g, cx + i * 3, -352, 3, 228, Cv[k])); box(g, cx - 2, -170, 28, 6, GILT[3]); }
  // (the headboard: tall, carved, a bat cut in it)
  box(g, -9, top - 150, 30, 150 - top, INK);
  slab(g, -8, top - 148, 28, 148 - top, Wd[2], { edge: 4 });
  box(g, -1, top - 120, 14, 8, Wd[0]); box(g, -5, top - 116, 22, 3, Wd[0]);
  // (the frame along its side, the skirt hanging to the floor, the dark under it)
  box(g, 0, top + 24, w, -top - 24, INK); box(g, 2, top + 26, w - 4, -top - 30, Wd[1]); box(g, 2, top + 26, w - 4, 3, Wd[3]);
  box(g, 10, -14, w - 20, 12, '#080404');
  // (the mattress: white sheets, lit along the top; the coverlet over it, quilted, gold-trimmed, hanging over the side)
  box(g, 0, top - 1, w, 28, INK); box(g, 1, top, w - 2, 26, Sh[2]); box(g, 1, top, w - 2, 2, Sh[4]); box(g, 1, top + 2, w - 2, 2, Sh[3]); box(g, 1, top + 22, w - 2, 4, Sh[1]);
  box(g, 120, top + 2, w - 128, 44, INK); box(g, 121, top + 3, w - 130, 42, Cv[2]); box(g, 121, top + 3, w - 130, 2, Cv[3]);
  for (let qx = 132; qx < w - 16; qx += 24) for (let qy = top + 10; qy < top + 40; qy += 12) { box(g, qx, qy, 2, 2, Cv[0]); box(g, qx + 12, qy + 6, 2, 2, Cv[1]); }
  box(g, 121, top + 40, w - 130, 3, GILT[3]); for (let qx = 124; qx < w - 12; qx += 6) box(g, qx, top + 43, 2, 4, GILT[2]);
  // (the pillows)
  for (const px of [12, 58]) { box(g, px - 1, top - 15, 46, 17, INK); box(g, px, top - 14, 44, 15, Sh[2]); box(g, px, top - 14, 44, 3, Sh[4]); box(g, px + 36, top - 14, 8, 15, Sh[1]); }
  // (the posts, up to the canopy: turned, finials at the foot)
  for (const px of [-6, w - 6]) { pole(g, px, -370, 12, 370, Wd[2]); for (const ry of [-300, -200, -100]) { box(g, px - 2, ry, 16, 6, INK); box(g, px - 1, ry + 1, 14, 4, Wd[3]); } }
};
const drawBed = (c: Ctx) => put(c, 'cBed', BED.x, GY, -40, -380, BED.w + 60, 384, paintBed);

const paintWardrobe = (g: Ctx, open: boolean) => {
  const Wd = rampOf(dimc('#4A2614', 0.15));
  // (the carcass: crown, plinth, panels)
  box(g, -62, -302, 124, 302, INK); box(g, -60, -300, 120, 300, Wd[1]);
  box(g, -66, -312, 132, 16, INK); box(g, -65, -311, 130, 14, Wd[2]); box(g, -65, -311, 130, 2, Wd[3]);
  box(g, -56, -14, 112, 14, Wd[0]);
  if (open) {
    // (open: the dark inside, the frocks hung in it, the door swung wide)
    box(g, -54, -290, 108, 276, '#050203');
    box(g, -50, -280, 100, 3, Wd[0]);
    for (let k = 0; k < 4; k++) { const fx = -42 + k * 22; box(g, fx + 6, -278, 2, 8, '#3A3A3A'); box(g, fx, -270, 14, 80 + (k % 2) * 30, ['#1A1022', '#220A10', '#101A1A', '#1A1A10'][k]); }
    box(g, -112, -290, 52, 278, INK); slab(g, -110, -288, 48, 274, Wd[2], { edge: 4, ink: false });
    box(g, -100, -270, 28, 110, Wd[1]); box(g, -100, -140, 28, 110, Wd[1]);
  } else {
    for (const dx of [-54, 2]) { slab(g, dx, -290, 52, 276, Wd[2], { edge: 4, ink: false }); box(g, dx + 10, -270, 32, 110, Wd[1]); box(g, dx + 10, -140, 32, 110, Wd[1]); box(g, dx + 10, -270, 32, 2, Wd[3]); box(g, dx + 10, -140, 32, 2, Wd[3]); }
    box(g, -2, -290, 4, 276, INK);
    for (const hx of [-12, 8]) { box(g, hx, -164, 4, 16, INK); box(g, hx, -164, 2, 14, GILT[3]); }
  }
};
const drawWardrobe = (c: Ctx, x: number, open: boolean) => put(c, `cWard:${open}`, x, FOOT + 8, -116, -316, 186, 318, g => paintWardrobe(g, open));

/** The toy train: a tin locomotive, red and blue and gold, its rods going round. (Its box: TRAIN.w x TRAIN.h.) */
const drawTrain = (c: Ctx, x: number, dir: number, f: number) => {
  c.save(); c.translate(Math.round(dir > 0 ? x : x + TRAIN.w), GY); c.scale(dir > 0 ? 1 : -1, 1);
  const Rd = rampOf('#C81E1E'), Bl = rampOf('#1E40AF'), Yl = rampOf('#E8B020');
  put(c, 'cTrain', 0, 0, -4, -44, TRAIN.w + 10, 46, g => {
    // (the cab at the back: blue, a window, its roof)
    box(g, -1, -35, 27, 27, INK); box(g, 0, -34, 25, 25, Bl[2]); box(g, 0, -34, 4, 25, Bl[3]); box(g, 21, -34, 4, 25, Bl[1]);
    box(g, 6, -28, 12, 10, INK); box(g, 7, -27, 10, 8, '#F8E8A0');
    box(g, -3, -38, 31, 5, INK); box(g, -2, -37, 29, 3, Rd[3]);
    // (the boiler: red, banded in gold, lit along its top)
    box(g, 24, -27, 44, 20, INK); box(g, 25, -26, 42, 18, Rd[2]); box(g, 25, -26, 42, 3, Rd[4]); box(g, 25, -23, 42, 3, Rd[3]); box(g, 25, -11, 42, 3, Rd[0]);
    for (const bx of [36, 52]) { box(g, bx, -26, 3, 18, Yl[2]); box(g, bx, -26, 1, 18, Yl[4]); }
    // (the dome, the stack)
    box(g, 41, -32, 10, 7, INK); box(g, 42, -31, 8, 6, Yl[2]); box(g, 42, -31, 3, 3, Yl[4]);
    box(g, 55, -38, 10, 13, INK); box(g, 56, -37, 8, 12, '#2A2A30'); box(g, 54, -40, 12, 4, INK); box(g, 55, -39, 10, 2, '#4A4A52');
    // (the front: headlamp, cowcatcher)
    box(g, 66, -24, 6, 6, INK); box(g, 67, -23, 4, 4, '#FDE68A');
    g.fillStyle = INK; g.beginPath(); g.moveTo(64, -8); g.lineTo(76, -1); g.lineTo(64, -1); g.closePath(); g.fill();
    g.fillStyle = Yl[2]; g.beginPath(); g.moveTo(65, -7); g.lineTo(74, -2); g.lineTo(65, -2); g.closePath(); g.fill();
    // (the footplate)
    box(g, 0, -9, 66, 3, INK); box(g, 0, -9, 66, 1, Yl[3]);
  });
  // (the wheels, their spokes and the rod going round)
  const a = (f * 0.35 * dir) % (Math.PI * 2);
  for (const wx of [12, 34, 54]) {
    box(c, wx - 7, -14, 14, 14, INK); box(c, wx - 6, -13, 12, 12, Rd[2]); box(c, wx - 6, -13, 12, 2, Rd[4]); box(c, wx - 2, -9, 4, 4, Yl[3]);
    box(c, wx + Math.round(Math.cos(a) * 4) - 1, -8 + Math.round(Math.sin(a) * 4) - 1, 3, 3, INK);
  }
  const rx = Math.round(Math.cos(a) * 4), ry = Math.round(Math.sin(a) * 4);
  box(c, 12 + rx, -8 + ry, 42, 2, '#C8CCD4');
  c.restore();
  // (a puff out of the stack)
  if ((f >> 3) % 2) { const sx = dir > 0 ? x + 60 : x + TRAIN.w - 60, k = f % 8; pixelBlob(c, sx, GY - 46 - k * 2, 8 + k, 5 + k * 0.4, '#8A8690'); pixelBlob(c, sx - dir * 2, GY - 48 - k * 2, 5 + k * 0.6, 3, '#B4B0B8'); }
};

// ---------------------------------------------------------------------------------------------------------------
// Each room's own things

/** A dining chair, tucked in behind the table (dim: not to stand on). Feet at its origin. */
const paintChair = (g: Ctx) => {
  const Wd = rampOf(dimc('#3A2216', 0.2)), Vl = rampOf(dimc('#4A1450', 0.25));
  box(g, -1, -151, 34, 111, INK); box(g, 0, -150, 32, 110, Wd[2]); box(g, 0, -150, 4, 110, Wd[3]); box(g, 28, -150, 4, 110, Wd[0]);
  box(g, 6, -136, 20, 80, Vl[2]); box(g, 6, -136, 20, 3, Vl[3]); for (let k = 0; k < 2; k++) box(g, 14, -120 + k * 34, 4, 4, GILT[2]);
  box(g, -3, -158, 38, 10, INK); box(g, -2, -157, 36, 8, Wd[2]); box(g, -2, -157, 36, 2, Wd[3]); box(g, 10, -166, 12, 10, INK); box(g, 11, -165, 10, 8, Wd[2]);
};
const paintRockingHorse = (g: Ctx) => {
  const Hr = rampOf(dimc('#B8B0A8', 0.2)), Rd = rampOf(dimc('#A01E1E', 0.2)), Wd = rampOf(dimc('#5A3A20', 0.2));
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(60, -120, 125, Math.PI * 0.32, Math.PI * 0.68); g.stroke();
  g.strokeStyle = Wd[2]; g.lineWidth = 4; g.beginPath(); g.arc(60, -120, 125, Math.PI * 0.32, Math.PI * 0.68); g.stroke();
  for (const lx of [22, 34, 82, 94]) { box(g, lx - 1, -52, 8, 46, INK); box(g, lx, -52, 6, 44, Hr[2]); }
  box(g, 14, -92, 94, 44, INK); box(g, 15, -91, 92, 42, Hr[2]); box(g, 15, -91, 92, 6, Hr[3]); box(g, 15, -55, 92, 6, Hr[1]);
  for (let k = 0; k < 8; k++) box(g, 22 + ((k * 23) % 80), -86 + ((k * 13) % 30), 4, 4, Hr[1]);
  box(g, 92, -130, 30, 44, INK); box(g, 93, -129, 28, 42, Hr[2]); box(g, 112, -122, 20, 18, Hr[2]); box(g, 112, -122, 20, 18, Hr[2]);
  box(g, 106, -122, 3, 3, INK); for (let k = 0; k < 5; k++) box(g, 86 - k, -128 + k * 9, 8, 8, '#2A1A10');
  box(g, 44, -96, 36, 10, INK); box(g, 45, -95, 34, 8, Rd[2]); box(g, 45, -95, 34, 2, Rd[3]);
  box(g, 6, -86, 10, 4, '#2A1A10'); box(g, 2, -84, 6, 20, '#2A1A10');
};
const paintBlocks = (g: Ctx) => {
  const letters = ['B', 'O', 'O', '!', 'Z'], cols = ['#A01E1E', '#1E40AF', '#B8901A', '#157A3A', '#6A1E9E'];
  const at: [number, number][] = [[0, -30], [32, -30], [64, -30], [16, -60], [96, -30]];
  at.forEach(([x, y], k) => { const R = rampOf(dimc(cols[k], 0.15)); slab(g, x, y, 30, 30, R[2], { edge: 4 }); signAt(g, letters[k], x + 15, y + 20, 8, enamel({ sx: 2, sy: 2 }, '#F1EFEA', R[0])); });
};
const paintCrib = (g: Ctx) => {
  const Wd = rampOf(dimc('#5A5A8A', 0.2));
  box(g, -1, -91, 162, 91, INK); box(g, 0, -90, 160, 6, Wd[3]); box(g, 0, -14, 160, 14, Wd[1]);
  for (let k = 0; k < 9; k++) pole(g, 6 + k * 18, -84, 5, 70, Wd[2], false);
  for (const px of [0, 150]) pole(g, px, -100, 10, 100, Wd[2]);
};
/** The nursery's chimney breast (the bats come out of it). */
const paintChimney = (g: Ctx) => {
  const S = rampOf(dimc('#4A3A3A', 0.15));
  g.fillStyle = brickPattern(g, 'cChimBrick', 30, 14, [S[2], S[1]], S[0]); g.fillRect(0, 0, 120, 260);
  box(g, 0, 0, 4, 260, S[3]); box(g, 116, 0, 4, 260, INK);
  box(g, 18, 238, 84, 28, INK); box(g, 20, 240, 80, 26, '#050303'); hazeBands(g, 20, 160, 80, 80, '#050303', 0, 0.6, 4);
  box(g, -6, 230, 132, 10, INK); box(g, -5, 231, 130, 8, S[2]); box(g, -5, 231, 130, 2, S[3]);
};
const paintHams = (g: Ctx, k: number) => {
  const len = 300 + (k % 3) * 40, M = rampOf(k % 2 ? '#8A3A1E' : '#9A4A2A');
  box(g, 0, 0, 2, len, '#3A3A40');
  box(g, -8, len, 18, 6, INK); box(g, -14, len + 4, 30, 44, INK);
  box(g, -13, len + 5, 28, 42, M[2]); box(g, -13, len + 5, 8, 42, M[3]); box(g, 9, len + 5, 6, 42, M[1]);
  box(g, -6, len + 46, 14, 8, '#E8DCC0'); box(g, -6, len + 46, 14, 2, '#FFFFFF');
  for (let j = 0; j < 3; j++) box(g, -11, len + 14 + j * 10, 24, 1, M[0]);
};
const paintChopBlock = (g: Ctx) => {
  const Wd = rampOf('#6B4423');
  slab(g, 0, -70, 90, 70, Wd[2], { edge: 4 });
  for (let k = 0; k < 4; k++) box(g, 8, -60 + k * 14, 74, 1, Wd[1]);
  box(g, 34, -98, 6, 30, INK); box(g, 35, -97, 4, 28, '#C8CCD4'); box(g, 28, -104, 22, 12, INK); box(g, 29, -103, 20, 10, '#A8ACB4'); box(g, 29, -103, 20, 2, '#E8ECF4');
  box(g, 10, -74, 30, 4, '#7A1A1A');
};

const drawRoomThings = (c: Ctx, state: GameState, r: Room) => {
  const f = state.frame, a = r.a;
  switch (r.id) {
    case 'foyer':
      put(c, 'cArmor', a + 380, FOOT + 10, -40, -200, 80, 202, paintArmor); put(c, 'cArmor', a + 1300, FOOT + 10, -40, -200, 80, 202, paintArmor);
      portrait(c, a + 900, GY - 640, 160, 200, 0, true); eyesFollow(c, state, a + 980, GY - 640 + 68);
      break;
    case 'dining':
      for (let k = 0; k < 4; k++) portrait(c, a + 220 + k * 440, GY - 620, 110, 140, k + 1, false);
      fireplace(c, a + 1700, f);
      for (let k = 0; k < 9; k++) put(c, 'cChair', a + 330 + k * 135, GY - 30, -4, -168, 40, 130, paintChair);
      break;
    case 'study':
      bookcase(c, a + 72, 268, CASE_H, 0); bookcase(c, a + 700, 300, CASE_H, 1); bookcase(c, a + 1380, 380, CASE_H, 2);
      fireplace(c, a + 560, f);
      // (the reading table, the open tome on it; dimmed)
      put(c, 'cReadTable', a + 980, GY, -4, -120, 170, 122, g => {
        const Wd = rampOf(dimc('#4A2A16', 0.2));
        box(g, -1, -91, 162, 10, INK); box(g, 0, -90, 160, 8, Wd[2]); box(g, 0, -90, 160, 2, Wd[3]);
        for (const lx of [10, 140]) pole(g, lx, -82, 10, 82, Wd[2]);
        box(g, 39, -105, 52, 16, INK); box(g, 40, -104, 24, 14, '#F1E8C8'); box(g, 66, -104, 24, 14, '#E8DCB8'); box(g, 64, -106, 2, 16, '#8A6A3A');
        for (let k = 0; k < 4; k++) { box(g, 44, -100 + k * 3, 16, 1, '#8A7A5A'); box(g, 70, -100 + k * 3, 16, 1, '#8A7A5A'); }
      });
      break;
    case 'kitchen':
      for (let k = 0; k < 6; k++) put(c, `cHam:${k % 3}`, a + 200 + k * 260, CEIL + 38, -16, -2, 34, 480, g => paintHams(g, k % 3));
      put(c, 'cChop', a + 160, GY, -4, -108, 100, 110, paintChopBlock);
      break;
    case 'bedroom':
      portrait(c, a + 1300, GY - 680, 150, 190, 4, true); eyesFollow(c, state, a + 1375, GY - 680 + 65);
      fireplace(c, a + 1340, f);
      break;
    case 'nursery': {
      put(c, 'cRockHorse', a + 180, FOOT + 6, -10, -140, 150, 142, paintRockingHorse);
      put(c, 'cBlocks', a + 1120, FOOT + 6, -4, -64, 132, 66, paintBlocks);
      put(c, 'cCrib', a + 1300, FOOT + 6, -4, -264, 170, 266, paintCrib);
      put(c, 'cChimney', a + 880, CEIL + 38, -8, -2, 140, 272, paintChimney);
      plaque(c, (BALLPIT.a + BALLPIT.b) / 2, GY - 150, 'BALL PIT: NO SHOES, NO ESCAPE', '#1E1B4B', '#F9A8D4', '#6A5AA0');
      break;
    }
    case 'gallery':
      for (let k = 0; k < 5; k++) { const py = GY - 660 + (k % 2) * 24; portrait(c, a + 240 + k * 230, py, 150, 200, k, true); eyesFollow(c, state, a + 315 + k * 230, py + 68); }
      // (the empty frame at the end: his)
      put(c, 'cReserved', r.b - 330, GY - 600, -10, -10, 210, 270, g => {
        box(g, -8, -8, 206, 266, INK); box(g, -7, -7, 204, 264, GILT[2]); box(g, -7, -7, 204, 2, GILT[4]); box(g, -7, -7, 2, 264, GILT[3]); box(g, -7, 255, 204, 2, GILT[0]); box(g, 195, -7, 2, 264, GILT[1]);
        checker(g, -5, -5, 200, 2, GILT[3]); box(g, -1, -1, 192, 252, INK);
        bandedGradient(g, 0, 0, 190, 250, ['#0A0606', '#140A0A', '#1E1010'], 5);
        box(g, 90, -26, 10, 18, INK); box(g, 92, -24, 6, 14, '#3A3A40');
      });
      plaque(c, r.b - 235, GY - 330, 'RESERVED', '#3A0A0A', '#FCA5A5');
      break;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What he can stand on

const drawLedge = (c: Ctx, state: GameState, x: number, y: number, w: number, look: LedgeLook) => {
  const f = state.frame, [fill, lip] = LOOKS[look];
  const Wd = rampOf(fill);
  switch (look) {
    case 'stair': {
      // (a flight of the grand stair: the stringer under it, balusters to the floor, the handrail over; carpet on the tread)
      for (let bx = x + 8; bx < x + w - 4; bx += 22) pole(c, bx, y + 18, 5, GY - y - 18, dimc(Wd[2], 0.25), false);
      box(c, x, y + 14, w, 8, Wd[1]);
      box(c, x - 7, y - 36, w + 14, 6, INK); box(c, x - 6, y - 35, w + 12, 4, Wd[3]); box(c, x - 6, y - 35, w + 12, 1, Wd[4]);
      for (let bx = x + 4; bx < x + w; bx += 16) { box(c, bx, y - 31, 4, 31, INK); box(c, bx + 1, y - 31, 2, 31, Wd[2]); }
      lipSlab(c, x, y, w, 16, fill, lip);
      box(c, x + 6, y + 4, w - 12, 8, '#7A1420'); box(c, x + 6, y + 4, w - 12, 2, '#A82A3A');
      break;
    }
    case 'balcony': {
      // (its columns holding it up: dim, see-through between; the balustrade on it; a molded underside)
      for (const px of [x + 8, x + w - 26]) { pole(c, px, y + 16, 18, GY - y - 16, dimc('#5A4A44', 0.3)); box(c, px - 4, y + 16, 26, 10, dimc('#6A5A54', 0.3)); box(c, px - 4, GY - 12, 26, 12, dimc('#6A5A54', 0.3)); }
      box(c, x - 6, y - 44, w + 12, 7, INK); box(c, x - 5, y - 43, w + 10, 5, Wd[3]); box(c, x - 5, y - 43, w + 10, 1, Wd[4]);
      for (let bx = x + 8; bx < x + w - 6; bx += 20) { box(c, bx - 1, y - 38, 8, 38, INK); box(c, bx, y - 38, 6, 38, Wd[2]); box(c, bx, y - 26, 6, 8, Wd[3]); box(c, bx + 1, y - 38, 1, 38, Wd[3]); }
      lipSlab(c, x, y, w, 18, fill, lip);
      box(c, x + 4, y + 18, w - 8, 6, INK); box(c, x + 6, y + 18, w - 12, 4, Wd[1]);
      for (let k = x + 10; k < x + w - 10; k += 14) box(c, k, y + 20, 6, 2, Wd[0]);
      break;
    }
    case 'table': {
      // (turned legs, the tablecloth hanging off it in folds, its lace hem; candelabras and place settings along it)
      for (const lx of [x + 20, x + w / 2 - 7, x + w - 34]) { pole(c, lx, y + 22, 14, GY - y - 22, Wd[2]); box(c, lx - 3, y + 44, 20, 8, INK); box(c, lx - 2, y + 45, 18, 6, Wd[3]); }
      const Cl = ['#8A8478', '#B8B2A4', '#DAD5C8', '#EEEBE2', '#FFFFFF'];
      box(c, x - 5, y + 3, w + 10, 22, INK); box(c, x - 4, y + 4, w + 8, 20, Cl[2]);
      for (let k = x; k < x + w; k += 40) { box(c, k + 10, y + 6, 4, 18, Cl[1]); box(c, k + 14, y + 6, 2, 18, Cl[3]); }
      for (let k = x - 4; k < x + w + 4; k += 16) { box(c, k + 2, y + 24, 12, 4, Cl[2]); box(c, k + 4, y + 28, 8, 2, Cl[1]); box(c, k + 6, y + 25, 2, 2, Cl[0]); }
      box(c, x - 1, y - 1, w + 2, 6, INK); box(c, x, y, w, 2, Cl[4]); box(c, x, y + 2, w, 2, Cl[3]);
      for (let k = x + 90; k < x + w - 40; k += 200) {
        candelabra(c, k, y, f);
        // (a place setting: a plate, a goblet; the roast on its platter in the middle)
        box(c, k + 56, y - 3, 30, 3, INK); box(c, k + 57, y - 3, 28, 2, '#E8E8F0'); box(c, k + 62, y - 4, 18, 1, '#C8C8D0');
        box(c, k + 96, y - 14, 8, 6, INK); box(c, k + 97, y - 13, 6, 4, '#9A1A2A'); box(c, k + 99, y - 8, 2, 6, '#C8CCD4'); box(c, k + 96, y - 2, 8, 2, '#C8CCD4');
      }
      const mx = x + w / 2 - 30;
      box(c, mx - 1, y - 4, 62, 4, INK); box(c, mx, y - 4, 60, 3, '#C8CCD4');
      box(c, mx + 8, y - 20, 44, 17, INK); box(c, mx + 9, y - 19, 42, 15, '#8A4A1E'); box(c, mx + 9, y - 19, 42, 4, '#B8702E'); box(c, mx + 46, y - 16, 8, 8, '#C81E1E');
      break;
    }
    case 'shelf': case 'toyshelf': {
      // (on the wall, on iron brackets; a few things on it, at the back)
      for (const bx of [x + 16, x + w - 26]) { c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 1, y + 14); c.lineTo(bx + 11, y + 14); c.lineTo(bx + 5, y + 52); c.lineTo(bx - 1, y + 52); c.closePath(); c.fill(); c.fillStyle = IRON[2]; c.beginPath(); c.moveTo(bx, y + 15); c.lineTo(bx + 9, y + 15); c.lineTo(bx + 4, y + 48); c.lineTo(bx, y + 48); c.closePath(); c.fill(); }
      lipSlab(c, x, y, w, 16, fill, lip);
      break;
    }
    case 'canopy': {
      // (the bed's canopy: velvet pelmet, scalloped, gold fringe; the lit top: bounce up onto it)
      const Cv = rampOf('#8A1430');
      lipSlab(c, x, y, w, 22, fill, lip);
      box(c, x + 2, y + 8, w - 4, 2, GILT[3]);
      for (let k = x; k < x + w; k += 20) { box(c, k + 2, y + 22, 16, 6, INK); box(c, k + 3, y + 22, 14, 5, Cv[1]); box(c, k + 6, y + 27, 8, 3, Cv[1]); for (let j = 0; j < 3; j++) box(c, k + 4 + j * 5, y + 30, 2, 3, GILT[2]); }
      break;
    }
    case 'cauldron': {
      // (the stone hearth (solid: up onto it), its fire under the cauldron, the cauldron bubbling green)
      const S = rampOf(fill);
      box(c, x - 2, y - 2, w + 4, GY - y + 2, INK);
      c.fillStyle = brickPattern(c, 'cHearthStone', 36, 18, [S[2], mix(S[2], S[1], 0.5)], S[0]); c.fillRect(x, y, w, GY - y);
      box(c, x, y, 3, GY - y, S[3]); box(c, x + w - 3, y, 3, GY - y, S[1]);
      box(c, x + 80, y + 20, 90, 60, '#0A0404'); for (let k = 0; k < 5; k++) { const h = 14 + Math.sin(f * 0.3 + k * 2) * 5; box(c, x + 88 + k * 16, y + 80 - h, 10, h, k % 2 ? '#A8461A' : '#7A2A10'); }
      // (the cauldron: black iron, lit on its left; the green at the brim)
      box(c, x + 66, y - 76, 118, 74, INK); box(c, x + 68, y - 74, 114, 70, IRON[1]); box(c, x + 68, y - 74, 22, 70, IRON[2]); box(c, x + 74, y - 68, 6, 40, IRON[3]); box(c, x + 160, y - 74, 22, 70, IRON[0]);
      box(c, x + 58, y - 82, 134, 12, INK); box(c, x + 60, y - 80, 130, 8, IRON[2]); box(c, x + 60, y - 80, 130, 2, IRON[4]);
      box(c, x + 70, y - 86, 110, 6, '#16A34A'); box(c, x + 70, y - 86, 110, 2, '#4ADE80');
      for (let k = 0; k < 4; k++) { const ph = (f + k * 13) % 30; if (ph < 18) { box(c, x + 80 + k * 24, y - 92 - ph * 0.6, 8, 8, INK); box(c, x + 81 + k * 24, y - 91 - ph * 0.6, 6, 6, '#4ADE80'); box(c, x + 82 + k * 24, y - 90 - ph * 0.6, 2, 2, '#BBF7D0'); } }
      // (its lit top: the stone's)
      box(c, x, y, w, 2, S[4]); box(c, x, y + 2, w, 2, S[3]);
      break;
    }
    case 'frame': {
      // (a huge gilt frame on the wall, its top edge his to stand on; an ancestor in it, watching him)
      const fh = Math.min(170, GY - y - 14);
      box(c, x - 1, y + 9, w + 2, fh + 2, INK); box(c, x, y + 10, w, fh, GILT[2]); box(c, x, y + 10, 4, fh, GILT[3]); box(c, x + w - 4, y + 10, 4, fh, GILT[1]);
      checker(c, x + 4, y + 14, w - 8, 2, GILT[3]); box(c, x + 9, y + 19, w - 18, fh - 18, INK);
      bandedGradient(c, x + 10, y + 20, w - 20, fh - 20, ['#1A1420', '#2A2230', '#342A3A'], 4);
      const cx = x + w / 2;
      box(c, cx - 34, y + 90, 68, 80, '#1E1A22'); box(c, cx - 34, y + 90, 20, 80, '#2E2834'); box(c, cx - 6, y + 88, 12, 8, '#E8E2D0');
      box(c, cx - 15, y + 49, 30, 34, INK); box(c, cx - 14, y + 50, 28, 32, '#C9A98A'); box(c, cx - 14, y + 50, 6, 32, '#DEC0A4'); box(c, cx + 8, y + 50, 6, 32, '#A8886A');
      box(c, cx - 16, y + 44, 32, 8, '#2A1A14'); box(c, cx - 4, y + 72, 8, 2, '#7A4A3A');
      eyesFollow(c, state, cx, y + 62);
      lipSlab(c, x - 4, y, w + 8, 12, fill, lip);
      break;
    }
    case 'rack': {
      // (a pot rack on chains from way up, the pots and pans hung under it)
      const top = CEIL + 38;
      for (const cx of [x + 10, x + w - 13]) { c.strokeStyle = '#4A4A52'; c.lineWidth = 3; c.setLineDash([5, 3]); c.beginPath(); c.moveTo(cx + 1.5, top); c.lineTo(cx + 1.5, y); c.stroke(); c.setLineDash([]); }
      for (let k = 0; k < 4; k++) {
        const px = x + 20 + k * ((w - 40) / 3), cu = k % 2 === 0, P = rampOf(cu ? '#B4602A' : '#7A7E88');
        box(c, px, y + 14, 2, 14, IRON[1]);
        box(c, px - 13, y + 27, 26, 18, INK); box(c, px - 12, y + 28, 24, 16, P[2]); box(c, px - 12, y + 28, 6, 16, P[3]); box(c, px + 8, y + 28, 4, 16, P[1]); box(c, px + 11, y + 32, 10, 3, P[0]);
      }
      lipSlab(c, x, y, w, 14, fill, lip);
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The whole of it

/** The castle, a room at a time, each on its own floor: drawn in the room's own coordinates (its floor at GY), clipped
 *  to it, moved up or down to where it is. */
export const drawCastleBack = (c: Ctx, state: GameState, cs: Castle) => {
  const each = (paint: (r: Room) => void) => {
    for (const r of ROOMS) {
      if (!seen(state, r.a - 150, r.b + 150)) continue;
      c.save();
      c.beginPath(); c.rect(r.a, -100000, r.b - r.a, 200000); c.clip();
      c.translate(0, DY[r.id]);
      paint(r);
      c.restore();
    }
  };
  // The rooms' walls and floors, then the doorways through the walls between them, then what's nearer
  each(r => drawRoomBack(c, state, r));
  drawDoorways(c, state);
  each(r => drawRoomFront(c, state, cs, r));
  // (the dining room's rotten floorboards at its far end, broken through: the way down to the kitchen)
  if (seen(state, ROOMS[1].b - 120, ROOMS[1].b + 20)) {
    const x = ROOMS[1].b, P = rampOf('#5A3420');
    for (let k = 0; k < 5; k++) { c.save(); c.translate(x - 20 - k * 14, GY + 6 + k * 3); c.rotate(0.5 + k * 0.2); box(c, -1, -1, 42, 10, INK); box(c, 0, 0, 40, 8, P[2]); box(c, 0, 0, 40, 2, P[3]); box(c, 34, 0, 6, 8, P[1]); c.restore(); }
    // (on the wall over the fireplace, clear of the doorway)
    plaque(c, x - 200, GY - 330, 'SERVANTS ONLY: MIND THE FLOOR', '#3F3F46', '#E4E4E7', '#6B6F78');
  }
  // The castle's front door (the way back out to the stairs)
  if (seen(state, x0, x0 + 200)) {
    const shut = cs.doorShut > 0;
    put(c, `cFrontDoor:${shut}:${shut ? '' : timeOfDay().key}`, x0 + 60, GY, -60, -200, 120, 202, g => {
      const Wd = rampOf('#4A2814'), S = rampOf('#4E4446');
      g.fillStyle = INK; g.beginPath(); g.moveTo(-56, 0); g.lineTo(-56, -150); g.arc(0, -150, 56, Math.PI, 0); g.lineTo(56, 0); g.closePath(); g.fill();
      g.fillStyle = S[2]; g.beginPath(); g.moveTo(-52, 0); g.lineTo(-52, -150); g.arc(0, -150, 52, Math.PI, 0); g.lineTo(52, 0); g.closePath(); g.fill();
      g.save(); g.beginPath(); g.moveTo(-42, 0); g.lineTo(-42, -150); g.arc(0, -150, 42, Math.PI, 0); g.lineTo(42, 0); g.closePath(); g.clip();
      if (shut) {
        for (let k = 0; k < 8; k++) { box(g, -42 + k * 11, -200, 11, 200, Wd[k % 2 ? 2 : 1]); box(g, -42 + k * 11, -200, 1, 200, Wd[3]); }
        for (const sy of [-150, -60]) { box(g, -42, sy, 84, 8, INK); box(g, -42, sy + 1, 84, 6, IRON[2]); box(g, -42, sy + 1, 84, 1, IRON[4]); }
        box(g, -1, -200, 2, 200, INK); for (const hx of [-12, 8]) { box(g, hx, -96, 4, 18, INK); box(g, hx, -95, 3, 16, GILT[3]); }
      } else {
        bandedGradient(g, -42, -200, 84, 200, [skyAt(0.3), skyAt(0.6), skyAt(0.9)], 5);
        box(g, -42, -26, 84, 26, '#0E0C14');
      }
      g.restore();
    });
    // (a modern convenience: a lit EXIT box over it, code says so)
    put(c, 'cExitBox', x0 + 60, GY - 228, -24, -10, 48, 20, g => { box(g, -22, -8, 44, 16, INK); box(g, -21, -7, 42, 14, '#0E3A1A'); signAt(g, 'EXIT', 0, 4, 8, led(8, '#4ADE80', '#0E3A1A')); });
  }
  // TO THE DUNGEON, on the gallery's wall by the doorway at its end (doorways.ts: the stairs down through it)
  for (const d of DOORWAYS) if (d.end && seen(state, d.cx - 80, d.cx + 80)) plaque(c, d.cx, d.top - 70, 'TO THE DUNGEON', '#27272A', '#FCA5A5', '#5A5A62');
};

/** A room's back half: its walls, its floor going back, its windows and things on the walls. */
const drawRoomBack = (c: Ctx, state: GameState, r: Room) => {
  const f = state.frame;
  // (over the ceiling: the dark of the roof void, its beams)
  { const top = ceilOf(r.id), a = Math.max(r.a, state.camera.x - 40), b = Math.min(r.b, state.camera.x + CANVAS_WIDTH + 40);
    if (b > a) { box(c, a, top - 700, b - a, 700, '#080304'); for (let x = Math.floor(a / 160) * 160; x < b; x += 160) { box(c, x, top - 700, 20, 700, '#140A08'); box(c, x, top - 700, 3, 700, '#1E100C'); } box(c, a, top - 24, b - a, 24, '#140A08'); box(c, a, top - 24, b - a, 2, '#24140E'); } }
  drawRoomWalls(c, state, r);
  drawFloor(c, state, r);
  // (the windows: how big the place is)
  for (const [wx, sill] of WINDOWS[r.id]) if (seen(state, r.a + wx - 60, r.a + wx + 130)) gothicWindow(c, r.id, r.a + wx, GY - sill);
  for (const sx of SCONCES[r.id]) if (seen(state, r.a + sx - 20, r.a + sx + 20)) sconce(c, r.a + sx, SCONCE_Y, f);
  drawRoomThings(c, state, r);
  plaque(c, r.a + 300, GY - 330, r.name);
};
/** A room's nearer half: what he stands on, the set pieces, the PA's horns (after the doorways). */
const drawRoomFront = (c: Ctx, state: GameState, cs: Castle, r: Room) => {
  const f = state.frame, inRoom = (x: number) => x > r.a - 260 && x < r.b + 260;
  // What he can stand on
  for (const [x, y, w, look] of LEDGES) if (inRoom(x) && seen(state, x, x + w)) drawLedge(c, state, x, y, w, look);
  // The set pieces
  if (r.id === 'bedroom') {
    if (seen(state, BED.x, BED.x + BED.w)) drawBed(c);
    WARDROBES.forEach((x, i) => { if (seen(state, x - 120, x + 120)) drawWardrobe(c, x, cs.wardrobe[i]); });
  }
  if (r.id === 'kitchen') STOVES.forEach(([x, w], i) => { if (seen(state, x - 60, x + w + 60)) drawStove(c, x, w, i, cs.stoveT, f); });
  if (r.id === 'study') BOOKCASES.forEach(([x, y], i) => {
    if (!seen(state, x - 100, x + 100)) return;
    const t = cs.shelfT[i], tell = t > 0 && t < BOOK_TELL, rattle = tell ? Math.round(Math.sin(f * 2.3) * 2) : 0;
    // (a stretch of shelves of one of the library's own cases, the same wood and books: nothing to see till its tell)
    const rows = shelfYs().filter(ry => FOOT + ry + 34 > y - 140 && FOOT + ry + 34 < y + 30);
    put(c, `cPolt:${i}`, x + rattle, FOOT, -40, rows[0] - 2, 80, rows[rows.length - 1] - rows[0] + 46, g => {
      for (const [k, ry] of rows.entries()) { box(g, -36, ry, 72, 34, SHELF_WOOD[0]); bookRow(g, -32, 28, ry, 977 + i * 31 + k * 7); }
    });
    // (the tell: the whole stretch shudders, the books jut out of their rows, a ghostly green round them)
    if (tell) for (const [k, ry] of rows.entries()) {
      const yy = FOOT + ry, jx = x + rattle - 30 + ((f * 7 + k * 23) % 54);
      box(c, x + rattle - 38, yy - 2, 76, 2, (f >> 1) % 2 ? '#86EFAC' : '#4ADE80'); box(c, x + rattle - 38, yy + 34, 76, 2, '#86EFAC');
      box(c, jx - 1, yy + 6, 9, 30, INK); box(c, jx, yy + 7, 7, 28, k % 2 ? '#2D51B0' : '#B91C1C'); box(c, jx, yy + 7, 2, 28, '#86EFAC');
    }
  });
  if (r.id === 'dining') for (const ch of cs.chand) if (seen(state, ch.x - 60, ch.x + 60)) {
    if (ch.state === 'down') drawWreck(c, ch.x, ch.y);
    else drawChandelier(c, ch.x, ch.y, f, ch.state === 'tell' ? 2 : 0, CEIL + 30);
    // (its shadow on the table under it, darker as it creaks: where not to be)
    if (ch.state === 'tell' || ch.state === 'hang') { c.fillStyle = ch.state === 'tell' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.18)'; c.fillRect(ch.x - CHAND_W / 2, GY - 76, CHAND_W, 4); if (ch.state === 'tell') checker(c, ch.x - CHAND_W / 2 - 8, GY - 76, CHAND_W + 16, 4, 'rgba(0, 0, 0, 0.4)'); }
  }
  if (r.id === 'nursery') {
    // (the track the train runs on, its buffers at each end)
    if (seen(state, TRAIN.a - 20, TRAIN.b + TRAIN.w + 20)) {
      const a = TRAIN.a - 8, b = TRAIN.b + TRAIN.w + 8;
      for (let x = a; x < b; x += 16) { box(c, x, GY - 5, 10, 5, '#3A2416'); box(c, x, GY - 5, 10, 1, '#5A3A20'); }
      box(c, a, GY - 7, b - a, 3, INK); box(c, a, GY - 7, b - a, 2, '#C8CCD4');
      for (const [bx, s] of [[a - 10, 1], [b, -1]] as const) { box(c, bx - 1, GY - 25, 12, 25, INK); box(c, bx, GY - 24, 10, 24, '#C81E1E'); box(c, bx, GY - 24, 10, 3, '#F87171'); box(c, bx + (s > 0 ? 8 : -4), GY - 18, 6, 6, '#F1EFEA'); }
    }
    if (seen(state, cs.train.x - 40, cs.train.x + 120)) drawTrain(c, cs.train.x, cs.train.dir, f);
  }
  const talking = !!paSaying(state);
  for (const [hx, hy] of HORNS) if (hx > r.a - 60 && hx < r.b && seen(state, hx - 30, hx + 60)) drawPaHorn(c, hx, hy, talking, f);
};

/** The ball pit: a pit of plastic balls (in front of him: he's in up to his thighs), its padded rim. */
export const drawBallPit = (c: Ctx, state: GameState) => {
  const { a, b } = BALLPIT;
  if (!seen(state, a - 40, b + 40)) return;
  c.save(); c.translate(0, DY.nursery);
  const cols = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7', '#F97316'].map(col => rampOf(col));
  box(c, a, GY + 8, b - a, 60, '#1E1B4B');
  for (let row = 0; row < 4; row++) for (let x = a + 4 + (row % 2) * 7; x < b - 6; x += 14) {
    const y = Math.round(GY + 4 + row * 9 + Math.sin(state.frame * 0.05 + x) * 1), R = cols[(x * 7 + row * 3) % cols.length | 0];
    c.fillStyle = INK; c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[2]; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
    box(c, x - 4, y - 4, 3, 3, R[4]); box(c, x + 1, y + 2, 4, 3, R[1]);
  }
  // (the rim: padded vinyl, in pink and blue blocks, lit along the top)
  for (const [x, col] of [[a - 12, '#DB2777'], [b - 2, '#2563EB']] as const) { const R = rampOf(col); box(c, x - 1, GY - 5, 16, 72, INK); box(c, x, GY - 4, 14, 70, R[2]); box(c, x, GY - 4, 14, 2, R[4]); box(c, x, GY - 2, 14, 2, R[3]); box(c, x + 10, GY - 2, 4, 68, R[1]); }
  c.restore();
};

/** The books in the air (over everything: they're coming at him). */
export const drawBooks = (c: Ctx, cs: Castle) => {
  for (const b of cs.books) {
    c.save(); c.translate(Math.round(b.x), Math.round(b.y + DY.study)); c.rotate(b.rot);
    const R = rampOf(b.col);
    box(c, -10, -7, 20, 14, INK);
    box(c, -9, -6, 18, 12, R[2]); box(c, -9, -6, 18, 2, R[3]); box(c, -9, 4, 18, 2, R[1]);
    box(c, -9, -6, 4, 12, R[0]); box(c, -8, -4, 2, 2, GILT[3]); box(c, -8, 2, 2, 2, GILT[3]);
    box(c, 7, -5, 2, 10, '#F1E8C8'); box(c, -1, -2, 6, 4, GILT[2]);
    c.restore();
  }
};

/** Candlelight: the dark of the castle, the chandeliers and sconces glowing (near the screen only). */
export const castleLighting = (state: GameState, cs: Castle): SceneLight => {
  const lights: Light[] = [];
  const near = (x: number) => x > state.camera.x - 300 && x < state.camera.x + CANVAS_WIDTH + 300;
  for (const ch of cs.chand) if (near(ch.x) && ch.state !== 'down') lights.push({ x: ch.x, y: ch.y - 10 + dyAt(ch.x), r: 260, a: 0.8, color: 'rgba(253, 186, 116, 0.10)' });
  for (const r of ROOMS) for (const sx of SCONCES[r.id]) { const x = r.a + sx; if (near(x)) lights.push({ x, y: SCONCE_Y - 20 + DY[r.id], r: 230, a: 0.6, color: 'rgba(253, 186, 116, 0.06)' }); }
  for (const r of ROOMS) for (const [wx, sill] of WINDOWS[r.id]) { const x = r.a + wx + 35; if (near(x)) lights.push({ x, y: GY - sill - 150 + DY[r.id], r: 200, a: 0.35 + 0.25 * (1 - timeOfDay().stars), color: 'rgba(120, 160, 220, 0.06)' }); }
  for (const d of DOORWAYS) if (near(d.cx)) lights.push({ x: d.cx, y: d.bottom - 120, r: 150, a: 0.4, color: 'rgba(253, 186, 116, 0.06)' });
  STOVES.forEach(([x, w], i) => { if (near(x) && stovePhase(cs.stoveT, i) === 'fire') lights.push({ x: x + w / 2, y: STOVE_TOP - 60 + dyAt(x), r: 260, a: 0.9, color: 'rgba(251, 146, 60, 0.18)' }); });
  return { dark: 0.42, shade: [26, 6, 14], lights };
};
