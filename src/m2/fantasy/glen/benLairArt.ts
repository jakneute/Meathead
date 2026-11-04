// CON-FUCK-TIOUS's lair under the dragon's lair (benLair.ts), painted. Its own signature (no other lair has it): the
// dragon's lair's old MACHINE ROOM from when the dragon was a real animatronic, SIR SCORCH-A-LOT (1979-2004), replaced
// by a theater major in a suit: his great rotting head on a pallet (green rubber over fiberglass, the skin peeling off
// the foam and the mesh, chipped teeth, a horn snapped off, the hoses out of the neck; one eye still wired, glowing red;
// Ben's sleeping bag laid in its open jaw, a pillow on the tongue, BEN'S BED. NOT A RIDE. on masking tape), the old
// control desk (one button still blinking), the two hydraulic rams that worked him up through the floor of the lair
// overhead, the propane manifold for his fire (red pipe, valves, gauges, blue pilot lights) and the fog drum (UNICORN
// BREATH), the I-beams and the stage's underside overhead; gym-bro junk: a jousting lance for a barbell with plywood kite
// shields for plates, racked on two hydraulic jacks; a fiberglass DRAGON EGG with a handle bolted on for a kettlebell; a
// towel on a valve. Riveted steel panels, its own dark, the eye's red and the pilots' blue in it.
//
// The way to it: the plank out of the adit in the mine shaft's wall (lit along its top), and the adit's mouth drawn on
// that wall in perspective (the shaft's one eye), half boarded up, warm light beaming out between the boards across the
// shaft, falling on the plank and the shaft's far wall, pink fairy dust drifting in it (the tell; drawAditUnder /
// drawAditOver, called from art.ts so the meadow's near ground covers it where that ground's in front); then once he's
// in, the earth in cross section (the meadow's near ground fading into it: `reveal`): the adit's few feet of mine timber
// (rock, timber sets, a lantern, a puddle under a drip), the incline's forty treads down (timber sets, a rope rail, a
// work-lamp cable, Ben's chalk), broken through into the park's service tunnel (concrete, a lavender stripe, conduit, a
// cable tray, caged bulbs, water stains, puddles, stenciled signs, Ben's stash by his door), the long run to the room.
// And the staff trapdoor in the lair's floor up top the cannon shoots him out of. Still art painted once (stamped in
// tiles); the bulbs, the pilots, the eye, the drips, the beam and the dust live.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, checker, bandedGradient, hazeBands, tilePattern, stamp, hash, mix, text, PIX } from '../../intro/art/kit';
import { drawCannon, FAIRY } from '../../upgrades/returnCannon';
import { drawBen, benHeadY, drawBenGross, drawBenGrossBack, drawGate, drawCannonChain, gateK } from '../../upgrades/confucktious';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { saidOver } from '../section';
import { sunBehind } from '../../sunFlare';
import { at, polyF, topBack, viewOf, type View } from '../kit';
import { checkerFill } from '../../../m1/game/render/pixelArt';
import { GY } from '../geometry';
import { GORGE_D } from './paint';
import { X, Y } from './layout';
import {
  LIP, MOUTH, STEP_N, STEP_D, STEP_W, STEPS_A, STEPS_B, stepAt, FLOOR, TUN, ROOM, RH, CANNON_LX, CHUTE, HEAD_LX, TRAPDOOR_RX,
  lairOf, benAt, inRoom, underView,
} from './benLair';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A1028';
/** The cutaway's reach (x from the glen's start): from the shaft's wall to past where the view can get to from the room. */
const CUT_B = ROOM.b + 640;
const CUT_TOP = GY + 12, CUT_BOT = Y(FLOOR) + 420;
/** Ramps (deep .. lit). */
const SOIL = ['#1E120C', '#2E1E14', '#43301F', '#5A4130', '#735740', '#8E7056'];
const ROCK = ['#1C1A1E', '#2C2930', '#3E3A44', '#55505C', '#706A78', '#928C9A'];
const TIMB = ['#1C100C', '#301E16', '#462C20', '#5E3E2A', '#7C5638', '#9E744E'];
const CONC = ['#2A2834', '#3E3B4A', '#55516A', '#6E6A84', '#8C88A0', '#B0ACC2'];
const LAV = ['#3A2A5A', '#54407E', '#7058A6', '#9076C8', '#B09AE0', '#D4C6F4'];
const STEEL = ['#141A20', '#222C34', '#34404A', '#4A5862', '#66747E', '#8E9AA2'];
const RED = ['#3A0808', '#5E0E0E', '#8A1A16', '#B42A20', '#DA4A36', '#F4846A'];
const SCALE = ['#0E2014', '#18341E', '#24502A', '#346E36', '#4E9048', '#7CB46A'];
const FOAMY = ['#5A4A18', '#8A7428', '#B49A3E', '#D4BE62', '#EAD890', '#FAF0C4'];
const BONEW = ['#6A6050', '#8E846E', '#B2A88E', '#D2C8AC', '#ECE4CC', '#FFFAEA'];
const HAZ = ['#E8B820', '#1A1410'];
const LIPC = ['#5A4630', '#A08058', '#F2D79A', '#FFF6D8'];

const seen = (state: GameState, a: number, b: number, t: number, bt: number, m = 60) =>
  b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m && bt > state.camera.y - m && t < state.camera.y + CANVAS_HEIGHT + m;
const R = (rx: number) => X(rx), H = (h: number) => Y(h);

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A standable top's lit lip (standable reads standable). */
const lip = (g: Ctx, x: number, y: number, w: number) => { box(g, x, y, w, 2, LIPC[2]); box(g, x, y, w, 1, LIPC[3]); };
/** A caged work bulb's housing (its glow is live): hung off the conduit at (x, y). */
const bulbHousing = (g: Ctx, x: number, y: number) => {
  box(g, x - 1, y - 8, 2, 8, STEEL[1]);
  box(g, x - 5, y - 1, 10, 3, STEEL[2]); box(g, x - 5, y - 1, 10, 1, STEEL[4]);
  box(g, x - 4, y + 2, 8, 7, '#C8B070'); box(g, x - 3, y + 3, 3, 4, '#FFF4C8');
  for (const dx of [-4, -1, 2]) box(g, x + dx, y + 2, 1, 8, STEEL[0]);
  box(g, x - 4, y + 9, 8, 1, STEEL[0]);
};
/** A stenciled word on a wall (spray paint: a little overspray). */
const stencil = (g: Ctx, s: string, x: number, y: number, col: string, size = 6) => {
  g.save(); g.globalAlpha = 0.35; text(g, s, x + 1, y + 1, col, size, 'center', null); g.restore();
  text(g, s, x, y, col, size, 'center', null);
};
/** A board sign: its face, its words, nailed up. */
const board = (g: Ctx, x: number, y: number, w: number, h: number, face: string, words: string[], ink: string, size = 6) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, face); box(g, x, y, w, 1, mix(face, '#FFFFFF', 0.35)); box(g, x, y + h - 1, w, 1, mix(face, '#000000', 0.35));
  words.forEach((t, i) => text(g, t, x + w / 2, y + 9 + i * (size + 3), ink, size, 'center', null));
  box(g, x + 2, y + 2, 1, 1, '#C8C8D0'); box(g, x + w - 3, y + 2, 1, 1, '#C8C8D0');
};

// ---------------------------------------------------------------------------------------------------------------
// The earth, the adit, the service tunnel (world space; painted into the tiles)

/** Paints `draw` at (0, 0) and wrapped round a w x h tile's edges (what hangs over one edge comes in at the other), so
 *  the tile repeats without a seam: cut off at the edges, its clods and blocks drew a straight line down and across
 *  the rock every tile (the owner: "similar banding problem when entering the cave to ben's lair"). */
const wrapped = (w: number, h: number, draw: (ox: number, oy: number) => void) => { for (const oy of [-h, 0, h]) for (const ox of [-w, 0, w]) draw(ox, oy); };
const earthTile = (g: Ctx) => tilePattern(g, 'fy-ben-earth3', 96, 80, t => {
  box(t, 0, 0, 96, 80, SOIL[2]);
  wrapped(96, 80, (ox, oy) => {
    // (clods: dithered darker blobs, lighter crumbs on their tops)
    for (let k = 0; k < 14; k++) { const x = hash(k * 3.7) * 92 + ox, y = hash(k * 5.9) * 76 + oy, r = 3 + hash(k) * 6; t.fillStyle = SOIL[1]; t.beginPath(); t.ellipse(x, y, r * 1.4, r, hash(k * 9.1) - 0.5, 0, Math.PI * 2); t.fill(); checker(t, Math.round(x - r * 1.6), Math.round(y - r - 2), Math.round(r * 3.2), 2, SOIL[3], 0, 1); }
    for (let k = 0; k < 9; k++) {
      // (stones in it: a lit top, a dark under)
      const x = hash(k * 7.1 + 2) * 86 + 5 + ox, y = hash(k * 2.3 + 9) * 70 + 4 + oy, r = 2.5 + hash(k * 4.4) * 3.5;
      t.fillStyle = ROCK[0]; t.beginPath(); t.ellipse(x, y, r + 1, r * 0.8 + 1, 0, 0, Math.PI * 2); t.fill();
      t.fillStyle = ROCK[2]; t.beginPath(); t.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); t.fill();
      t.fillStyle = ROCK[4]; t.beginPath(); t.ellipse(x - r * 0.3, y - r * 0.35, r * 0.5, r * 0.3, 0, 0, Math.PI * 2); t.fill();
    }
  });
  for (let k = 0; k < 40; k++) box(t, hash(k * 1.3 + 5) * 95, hash(k * 8.1) * 79, 1, 1, k % 3 ? SOIL[4] : SOIL[0]);
});

const paintEarth = (g: Ctx) => {
  const a = R(MOUTH.a), b = R(CUT_B);
  g.fillStyle = earthTile(g); g.fillRect(a, CUT_TOP, b - a, CUT_BOT - CUT_TOP);
  // (darker going down: the topsoil, then the clay and the rock)
  hazeBands(g, a, CUT_TOP + 60, b - a, CUT_BOT - CUT_TOP - 60, '#0A0608', 0, 0.62, 8);
  // (the turf's underside along the top: matted roots, the grass's dark band)
  box(g, a, CUT_TOP, b - a, 6, SOIL[0]); checker(g, a, CUT_TOP + 6, b - a, 4, SOIL[0], 0, 1);
  for (let x = Math.floor(a / 9) * 9; x < b; x += 9) {
    const l = 6 + Math.floor(hash(x * 0.37) * 26), w = hash(x * 0.71) > 0.5 ? 2 : 1;
    box(g, x, CUT_TOP + 4, w, l, x % 2 ? '#4A3424' : '#3A2818');
    if (l > 20) box(g, x + (hash(x) > 0.5 ? 1 : -2), CUT_TOP + 4 + l - 6, 2, 1, '#4A3424');
  }
  // (a strata line of rock through it, and a band of flints)
  for (const [y0, col] of [[Y(-300), ROCK[2]], [Y(-560), ROCK[1]], [Y(-880), ROCK[1]]] as const) {
    for (let x = Math.floor(a / 6) * 6; x < b; x += 6) { const dy = Math.round(Math.sin(x * 0.006) * 10 + hash(x * 0.13) * 3); box(g, x, y0 + dy, 6, 4, col); box(g, x, y0 + dy, 6, 1, ROCK[3]); }
  }
};

/** An air's back wall: what's behind him in it (x from the glen's start, its top and floor heights). */
const airBack = (g: Ctx, a: number, b: number, top: number, floor: number, kind: 'adit' | 'tunnel') => {
  const x = R(a), w = b - a, y = H(top), hh = top - floor;
  if (kind === 'adit') {
    // (the mine's own rock, dark, damp; timber sets every few feet: two posts and a cap)
    bandedGradient(g, x, y, w, hh, ['#20160E', '#2C1E14', '#38281A'], 4);
    for (let k = 0; k < 12; k++) { const sx = x + hash(k * 3.3 + a) * w, sy = y + hash(k * 5.1) * hh; box(g, sx, sy, 6 + hash(k) * 8, 2, '#1A100A'); }
    for (let sx = x + 10; sx < x + w - 10; sx += 56) {
      for (const px of [sx, sx + 40]) { box(g, px - 1, y, 8, hh, INK); box(g, px, y, 6, hh, TIMB[2]); box(g, px, y, 2, hh, TIMB[4]); box(g, px + 5, y, 1, hh, TIMB[0]); }
      box(g, sx - 3, y, 52, 9, INK); box(g, sx - 2, y + 1, 50, 7, TIMB[3]); box(g, sx - 2, y + 1, 50, 2, TIMB[5]);
    }
    return;
  }
  // (the service tunnel: poured concrete in board-formed bands, a lavender stripe at waist height, a darker dado)
  bandedGradient(g, x, y, w, hh, [CONC[1], CONC[2], CONC[2], CONC[1]], 6);
  for (let yy = y + 14; yy < y + hh; yy += 18) box(g, x, yy, w, 1, CONC[0]);
  for (let xx = Math.ceil(x / 120) * 120; xx < x + w; xx += 120) box(g, xx, y, 1, hh, CONC[0]);
  const fy = H(floor);
  box(g, x, fy - 36, w, 12, LAV[2]); box(g, x, fy - 36, w, 2, LAV[4]); box(g, x, fy - 26, w, 2, LAV[0]);
  box(g, x, fy - 24, w, 24, CONC[0]); checker(g, x, fy - 24, w, 2, CONC[1], 0, 1);
  // (the shadow under the ceiling)
  box(g, x, y, w, 6, CONC[0]); checker(g, x, y + 6, w, 4, CONC[0], 0, 1);
};

/** A floor slab under an air (lit along its top) and its hazard-striped edge where it steps down. */
const slabTop = (g: Ctx, a: number, b: number, floor: number, edge: boolean) => {
  const x = R(a), w = b - a, y = H(floor);
  box(g, x, y, w, 6, CONC[2]); checker(g, x, y + 4, w, 2, CONC[1], 0, 1); lip(g, x, y, w);
  if (edge) for (let k = 0; k < 4; k++) box(g, x + w - 12 + k * 3, y + 2, 2, 3, HAZ[k % 2]);
};

/** The mine's rock (the adit, the incline): blocky faces lit top-left and dark under-right, grit, and an ore glint or
 *  two (fake gems: it's the dwarf mine's). */
const rockTile = (g: Ctx) => tilePattern(g, 'fy-ben-rock2', 120, 90, t => {
  box(t, 0, 0, 120, 90, ROCK[2]);
  wrapped(120, 90, (ox, oy) => {
    for (let k = 0; k < 16; k++) {
      const x = Math.round(hash(k * 4.1) * 108) + ox, y = Math.round(hash(k * 6.3 + 1) * 82) + oy, w = Math.round(10 + hash(k * 2.2) * 18), h = Math.round(6 + hash(k * 3.7) * 10);
      box(t, x, y, w, h, ROCK[k % 3 ? 2 : 3]); box(t, x, y, w, 1, ROCK[4]); box(t, x, y, 1, h, ROCK[3]); box(t, x, y + h - 1, w, 1, ROCK[0]); box(t, x + w - 1, y, 1, h, ROCK[1]);
    }
  });
  for (let k = 0; k < 34; k++) box(t, hash(k * 1.7 + 3) * 119, hash(k * 9.3) * 89, 1, 1, k % 2 ? ROCK[1] : ROCK[4]);
  const GEM = ['#F9A8D4', '#C4B5FD', '#FDE68A', '#93C5FD'];
  for (let k = 0; k < 4; k++) { const x = Math.round(6 + hash(k * 7.7 + 2) * 104), y = Math.round(6 + hash(k * 5.5 + 4) * 74), col = GEM[k % 4]; box(t, x, y, 2, 2, col); box(t, x, y, 1, 1, '#FFFFFF'); box(t, x + 2, y + 1, 1, 1, mix(col, '#000000', 0.45)); }
});
/** A timber set standing on the floor at x (world), up to the roof at `top` (screen y): the post (lit down its left),
 *  its cap along the roof (lit along its underside, from the lamps), a wedge or two. */
const timberSet = (g: Ctx, x: number, top: number, floor: number) => {
  const h = floor - top;
  box(g, x - 5, top, 10, h, INK); box(g, x - 4, top, 8, h, TIMB[2]); box(g, x - 4, top, 2, h, TIMB[4]); box(g, x + 3, top, 1, h, TIMB[0]);
  for (let y = top + 14; y < floor - 6; y += 23) box(g, x - 3, y, 6, 1, TIMB[1]);
  box(g, x - 22, top, 44, 9, INK); box(g, x - 21, top, 42, 7, TIMB[3]); box(g, x - 21, top + 6, 42, 1, TIMB[5]);
  box(g, x - 9, top + 9, 4, 4, TIMB[1]); box(g, x + 5, top + 9, 4, 4, TIMB[1]);
};
/** Chalk on rock or concrete (Ben's: a little smudged). */
const chalk = (g: Ctx, s: string, x: number, y: number, size = 5) => {
  g.save(); g.globalAlpha = 0.3; text(g, s, x + 1, y, '#F4F0E8', size, 'center', null); g.globalAlpha = 0.85; text(g, s, x, y, '#F4F0E8', size, 'center', null); g.restore();
};
/** A chalked arrow (pointing right, or down the incline). */
const chalkArrow = (g: Ctx, x: number, y: number, len: number, down = 0) => {
  g.save(); g.globalAlpha = 0.85; g.strokeStyle = '#F4F0E8'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + down); g.stroke();
  const a = Math.atan2(down, len), ex = x + len, ey = y + down;
  g.beginPath(); g.moveTo(ex - Math.cos(a - 0.6) * 8, ey - Math.sin(a - 0.6) * 8); g.lineTo(ex, ey); g.lineTo(ex - Math.cos(a + 0.6) * 8, ey - Math.sin(a + 0.6) * 8); g.stroke();
  g.restore();
};
/** A puddle on a floor's top at x (world), w wide: the wet dark, the ceiling's light in it. */
const puddle = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x, y - 1, w, 2, '#2A3040'); box(g, x + 3, y - 2, w - 6, 1, '#2A3040');
  box(g, x + 4, y - 1, w * 0.4, 1, '#8A96B0'); box(g, x + w * 0.6, y - 1, 3, 1, '#C8D2E8');
};

/** The incline's line of nosings, height at rx (from the adit's floor down to the tunnel's). */
const noseAt = (rx: number) => MOUTH.floor + (FLOOR - MOUTH.floor) * Math.max(0, Math.min(1, (rx - STEPS_A) / (STEPS_B - STEPS_A)));
/** The step under rx. */
const stepUnder = (rx: number) => stepAt(Math.max(0, Math.min(STEP_N - 1, Math.floor((rx - STEPS_A) / STEP_W))));
/** The roof over the adit and the incline (a height, at rx): flat over the adit, then sloping down with the treads
 *  (between each tread's stepped ceiling's two ends, so it's never far off where his head would stop). One slope, not
 *  a step per tread: stepped, every tread's roof and its shade under it came out as a staircase of square blocks. */
const ROOF_OFF = 152;
const roofAt = (rx: number) => (rx < STEPS_A ? MOUTH.top : Math.min(MOUTH.top, noseAt(rx) + ROOF_OFF));
/** The floor under the rock wall at rx: the adit's, then each tread's. */
const wallFloorAt = (rx: number) => (rx < STEPS_A ? MOUTH.floor : stepUnder(rx).floor);
/** A run of 2px columns from x0 to x1 (screen), each from top(x) to bot(x) (screen, at the column's middle): a shape
 *  that follows a slope in whole pixel steps (no smoothed edge on it). */
const columns = (g: Ctx, x0: number, x1: number, top: (x: number) => number, bot: (x: number) => number) => {
  const a = Math.floor(x0 / PIX) * PIX;
  g.beginPath();
  for (let x = a; x < x1; x += PIX) { const y = Math.round(top(x + PIX / 2)); if (x === a) g.moveTo(x, y); else g.lineTo(x, y); g.lineTo(x + PIX, y); }
  for (let x = a + Math.ceil((x1 - a) / PIX) * PIX - PIX; x >= a; x -= PIX) { const y = Math.round(bot(x + PIX / 2)); g.lineTo(x + PIX, y); g.lineTo(x, y); }
  g.closePath();
};
/** The mine's rock wall behind him, all along the adit and down the incline as one piece: the rock, dark up under the
 *  roof in bands that follow the roof's slope (a dither row at each step, laid on the fainter band's side of it, never
 *  doubled up over its own), the roof's lagging along its top. */
const ROOF_BANDS = [0.6, 0.42, 0.27, 0.14, 0.05], ROOF_BAND_H = 14;
const paintMineWall = (g: Ctx) => {
  const xa = R(MOUTH.a), xb = R(STEPS_B), rx = (x: number) => x - R(0);
  const roof = (x: number) => H(roofAt(rx(x))), under = (o: number) => (x: number) => roof(x) + o;
  columns(g, xa, xb, roof, x => H(wallFloorAt(rx(x)))); g.fillStyle = rockTile(g); g.fill();
  ROOF_BANDS.forEach((al, k) => { columns(g, xa, xb, under(k * ROOF_BAND_H), under((k + 1) * ROOF_BAND_H)); g.fillStyle = `rgba(10, 6, 8, ${al})`; g.fill(); });
  for (let k = 0; k + 1 < ROOF_BANDS.length; k++) {
    const hi = ROOF_BANDS[k], lo = ROOF_BANDS[k + 1], y = (k + 1) * ROOF_BAND_H;
    columns(g, xa, xb, under(y), under(y + PIX)); g.fillStyle = checkerFill(g, `rgba(10, 6, 8, ${((hi - lo) / (1 - lo)).toFixed(3)})`, 0, PIX); g.fill();
  }
  // (the lagging: boards along the roof, lit along their underside, a butt joint every few feet)
  columns(g, xa, xb, roof, under(5)); g.fillStyle = TIMB[1]; g.fill();
  columns(g, xa, xb, under(4), under(5)); g.fillStyle = TIMB[3]; g.fill();
  for (let x = Math.ceil(xa / 34) * 34; x < xb; x += 34) box(g, x, Math.round(roof(x + 1)), 1, 4, TIMB[0]);
};
/** A timber set on the incline: a post standing on the tread at rx, up to the sloping roof; its cap laid along the roof
 *  under the lagging (raked with it), lit along its underside; a wedge or two. */
const rakedSet = (g: Ctx, rx: number) => {
  const x = R(rx), top = H(roofAt(rx)), floor = H(stepUnder(rx).floor), h = floor - top;
  box(g, x - 5, top, 10, h, INK); box(g, x - 4, top, 8, h, TIMB[2]); box(g, x - 4, top, 2, h, TIMB[4]); box(g, x + 3, top, 1, h, TIMB[0]);
  for (let y = top + 14; y < floor - 6; y += 23) box(g, x - 3, y, 6, 1, TIMB[1]);
  const ya = H(roofAt(rx - 22)), yb = H(roofAt(rx + 22));
  polyF(g, [[x - 22, ya - 1], [x + 22, yb - 1], [x + 22, yb + 9], [x - 22, ya + 9]], INK);
  polyF(g, [[x - 21, ya], [x + 21, yb], [x + 21, yb + 7], [x - 21, ya + 7]], TIMB[3]);
  polyF(g, [[x - 21, ya + 6], [x + 21, yb + 6], [x + 21, yb + 7], [x - 21, ya + 7]], TIMB[5]);
  const yc = H(roofAt(rx));
  box(g, x - 9, yc + 9, 4, 4, TIMB[1]); box(g, x + 5, yc + 9, 4, 4, TIMB[1]);
};
/** The incline's timber sets, and the work lamps on its cable (every other set). */
const SETS = Array.from({ length: Math.floor((STEPS_B - STEPS_A - 30) / 96) + 1 }, (_, k) => STEPS_A + 30 + k * 96);
export const INCLINE_BULBS = SETS.filter((_, k) => k % 2 === 1).map(rx => ({ rx, top: roofAt(rx) }));
/** Where water drips off the roof (x from the glen's start; the roof's height there), onto a puddle under it. */
const DRIPS: { rx: number; top: number; floor: number }[] = [
  { rx: MOUTH.a + 118, top: MOUTH.top, floor: MOUTH.floor },
  ...[0.3, 0.72].map(t => { const rx = Math.round(STEPS_A + t * (STEPS_B - STEPS_A)), s = stepUnder(rx), m = Math.round((s.a + s.b) / 2); return { rx: m, top: roofAt(m), floor: s.floor }; }),
  { rx: TUN.a + 200, top: TUN.top, floor: FLOOR }, { rx: TUN.a + 470, top: TUN.top, floor: FLOOR },
];

const paintTunnel = (g: Ctx) => {
  const T = TIMB;
  // THE ADIT: the mine's rock, two timber sets, the roof lagged with boards; its floor planked over the old cart rails;
  // a lantern on the inner set's cap (its flame live); the NO ADMITTANCE board fallen half across it
  { const x = R(MOUTH.a), w = MOUTH.b - MOUTH.a, y = H(MOUTH.top), fy = H(MOUTH.floor);
    paintMineWall(g);
    for (const rx of [MOUTH.a + 34, MOUTH.a + 108]) timberSet(g, R(rx), y, fy);
    box(g, R(MOUTH.a + 108) + 10, y + 9, 1, 8, STEEL[2]); box(g, R(MOUTH.a + 108) + 7, y + 17, 7, 9, INK); box(g, R(MOUTH.a + 108) + 8, y + 18, 5, 7, '#C89A40');
    board(g, R(MOUTH.a + 60), fy - 30, 50, 22, '#A89470', ['NO', 'ADMITTANCE'], '#6A1414', 5);
    // (the floor: planks over the sleepers, the rail's head showing along it, lit along its top)
    box(g, x, fy, w, 8, T[2]); for (let k = 0; k < w; k += 18) box(g, x + k, fy, 1, 8, T[0]);
    for (let k = 6; k < w; k += 24) box(g, x + k, fy + 5, 10, 3, T[1]);
    lip(g, x, fy, w);
    box(g, x, fy + 2, w, 1, STEEL[4]);
    puddle(g, R(MOUTH.a + 110), fy, 18);
  }
  // THE INCLINE: forty treads down through the rock, timber sets every few yards (their caps under the stepped roof),
  // the roof lagged; a rope handrail along the wall; a cable sagging set to set with a work lamp on every other one;
  // the treads planks on a stringer, each lit along its nosing (standable reads standable)
  chalk(g, 'BEN', R(STEPS_A + 70), H(MOUTH.floor) - 40, 6); chalkArrow(g, R(STEPS_A + 92), H(MOUTH.floor) - 44, 40, 34);
  chalk(g, 'MIND THE STEP BRO', R(STEPS_A + 380), H(noseAt(STEPS_A + 380)) - 58, 5);
  // (the rope handrail along the wall: dim, nothing to stand on; iron eyes at the sets)
  { const off = 42, x0r = STEPS_A + 4, x1r = STEPS_B - 4;
    g.strokeStyle = '#3A2C1E'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(x0r), H(noseAt(x0r)) - off); g.lineTo(R(x1r), H(noseAt(x1r)) - off); g.stroke();
    g.strokeStyle = '#6A5640'; g.lineWidth = 1; g.beginPath(); g.moveTo(R(x0r), H(noseAt(x0r)) - off - 1); g.lineTo(R(x1r), H(noseAt(x1r)) - off - 1); g.stroke();
  }
  for (const rx of SETS) { rakedSet(g, rx); box(g, R(rx) + 4, H(noseAt(rx)) - 44, 4, 4, STEEL[3]); }
  // (the cable, sagging set to set under the caps)
  g.strokeStyle = '#141014'; g.lineWidth = 2; g.beginPath();
  for (let k = 0; k + 1 < SETS.length; k++) { const a = SETS[k], b = SETS[k + 1], ya = H(roofAt(a)) + 12, yb = H(roofAt(b)) + 12; g.moveTo(R(a), ya); g.quadraticCurveTo(R((a + b) / 2), Math.max(ya, yb) + 14, R(b), yb); }
  g.stroke();
  for (const b of INCLINE_BULBS) bulbHousing(g, R(b.rx), H(b.top) + 20);
  // (the stringer under the treads, the treads, the risers)
  polyF(g, [[R(STEPS_A), H(stepAt(0).floor) + 5], [R(STEPS_B), H(FLOOR - STEP_D) + 5], [R(STEPS_B), H(FLOOR - STEP_D) + 16], [R(STEPS_A), H(stepAt(0).floor) + 16]], T[1]);
  g.strokeStyle = T[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(R(STEPS_A), H(stepAt(0).floor) + 6); g.lineTo(R(STEPS_B), H(FLOOR - STEP_D) + 6); g.stroke();
  for (let i = 0; i < STEP_N; i++) {
    const s = stepAt(i), x = R(s.a), w = s.b - s.a, fy = H(s.floor), py = H(i ? stepAt(i - 1).floor : MOUTH.floor);
    box(g, x, py, 2, fy - py, T[1]); box(g, x, py, 1, fy - py, T[0]);
    box(g, x, fy, w, 6, T[3]); box(g, x, fy + 5, w, 1, T[0]); box(g, x + w - 3, fy + 2, 1, 1, STEEL[4]);
    lip(g, x, fy, w);
  }
  for (const d of DRIPS) if (d.rx > STEPS_A && d.rx < STEPS_B) puddle(g, R(d.rx) - 7, H(d.floor), 14);
  // THE BREAK-THROUGH at the incline's foot: the utilidor's wall smashed open, rebar out of it, rubble on the floor
  // THE UTILIDOR: the park's service tunnel (board-formed concrete, the lavender stripe, the dado)
  airBack(g, TUN.a, TUN.b, TUN.top, FLOOR, 'tunnel');
  slabTop(g, TUN.a, TUN.b, FLOOR, false);
  { const x = R(TUN.a), y = H(TUN.top), fy = H(FLOOR);
    const jag: [number, number][] = [[x, y]];
    for (let k = 0; k <= 10; k++) jag.push([x + 10 + hash(k * 3.3) * 26 + (k % 2) * 8, y + (k * (fy - y - 8)) / 10]);
    jag.push([x, fy - 8]);
    g.fillStyle = rockTile(g); g.beginPath(); jag.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill();
    g.strokeStyle = CONC[0]; g.lineWidth = 2; g.beginPath(); jag.slice(1, -1).forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
    g.strokeStyle = '#6A4A3A'; g.lineWidth = 1; for (let k = 0; k < 4; k++) { const ry = y + 26 + k * 30; g.beginPath(); g.moveTo(x + 14 + (k % 2) * 6, ry); g.lineTo(x + 30 + k * 2, ry + 6 - k * 3); g.stroke(); }
    for (let k = 0; k < 7; k++) { const rx = x + 4 + hash(k * 5.1) * 60, r = 3 + hash(k * 2.7) * 5; box(g, rx - r, fy - r, r * 2, r, CONC[1]); box(g, rx - r, fy - r, r * 2, 1, CONC[3]); }
  }
  // (water stains down the concrete from the roof's seams)
  for (let k = 0; k < 9; k++) { const sx = R(TUN.a + 60 + k * 92 + hash(k * 7.3) * 30), l = 30 + hash(k * 3.9) * 70; checker(g, sx, H(TUN.top) + 8, 4 + (k % 2) * 2, l, CONC[0], 0, 1); box(g, sx + 1, H(TUN.top) + 8, 1, l * 0.6, CONC[0]); }
  // (the conduit along the ceiling: a fat gray one, a red sprinkler line, a yellow gas line; a cable tray under them,
  // the cables sagging out of it hanger to hanger)
  const pipe = (y: number, col: string[], th: number) => { box(g, R(TUN.a + 30), H(TUN.top) + y, TUN.b - TUN.a - 30, th, col[2]); box(g, R(TUN.a + 30), H(TUN.top) + y, TUN.b - TUN.a - 30, 1, col[4]); box(g, R(TUN.a + 30), H(TUN.top) + y + th - 1, TUN.b - TUN.a - 30, 1, col[0]); };
  pipe(8, STEEL, 6); pipe(16, RED, 3); pipe(21, ['#5A4404', '#8A6A08', '#C09A14', '#E8C030', '#F8E070', '#FFF6B8'], 2);
  box(g, R(TUN.a + 30), H(TUN.top) + 30, TUN.b - TUN.a - 30, 2, STEEL[3]);
  g.strokeStyle = '#141014'; g.lineWidth = 1; g.beginPath();
  for (let rx = TUN.a + 30; rx + 110 <= TUN.b; rx += 110) { box(g, R(rx), H(TUN.top) + 24, 1, 8, STEEL[2]); for (const sag of [6, 10]) { g.moveTo(R(rx), H(TUN.top) + 32); g.quadraticCurveTo(R(rx + 55), H(TUN.top) + 32 + sag, R(rx + 110), H(TUN.top) + 32); } }
  g.stroke();
  for (let rx = TUN.a + 60; rx < TUN.b; rx += 220) bulbHousing(g, R(rx), H(TUN.top) + 38);
  // (a junction box or two off the conduit)
  for (const rx of [TUN.a + 420, TUN.a + 760]) { const x = R(rx), y = H(TUN.top) + 52; box(g, x + 5, H(TUN.top) + 30, 2, 22, STEEL[2]); box(g, x - 1, y - 1, 14, 18, INK); box(g, x, y, 12, 16, STEEL[3]); box(g, x, y, 12, 1, STEEL[5]); box(g, x + 4, y + 6, 4, 4, HAZ[0]); }
  // (the stencils and the signs along it)
  stencil(g, 'B-7', R(TUN.a + 70), H(TUN.top) + 60, CONC[4], 8);
  stencil(g, 'CAST MEMBERS ONLY', R(TUN.a + 150), H(FLOOR) - 70, LAV[4]);
  board(g, R(TUN.a + 300), H(FLOOR) - 104, 84, 30, '#2A2A3A', ['NO PIXIE DUST', 'PAST THIS POINT'], '#F9A8D4', 5);
  stencil(g, "DRAGON'S LAIR", R(TUN.a + 540), H(FLOOR) - 72, '#E8E2F0');
  for (let k = 0; k < 3; k++) box(g, R(TUN.a + 592) + k * 6, H(FLOOR) - 78 + k, 4, 6 - k * 2, '#E8E2F0');
  stencil(g, 'CORRIDOR CLOSED 2004', R(TUN.a + 650), H(TUN.top) + 62, '#E8B820', 5);
  // (puddles under the drips; a WET FLOOR sign somebody put out in 2004)
  for (const d of DRIPS) if (d.rx > TUN.a) puddle(g, R(d.rx) - 16, H(FLOOR), 32);
  { const x = R(TUN.a + 236), y = H(FLOOR);
    polyF(g, [[x - 9, y], [x - 3, y - 26], [x + 3, y - 26], [x + 9, y]], INK); polyF(g, [[x - 8, y], [x - 2, y - 25], [x + 2, y - 25], [x + 8, y]], mix(HAZ[0], CONC[1], 0.25));
    box(g, x - 4, y - 16, 8, 1, INK); box(g, x - 5, y - 11, 10, 1, INK); box(g, x - 1, y - 22, 2, 4, INK);
  }
  // (a mop bucket somebody left in 2004, one of the gift shop's foam swords stood up in it)
  { const x = R(TUN.a + 440), y = H(FLOOR); box(g, x - 1, y - 21, 24, 21, INK); box(g, x, y - 20, 22, 18, '#C8A420'); box(g, x, y - 20, 22, 2, '#E8D068'); box(g, x + 4, y - 4, 4, 4, INK); box(g, x + 14, y - 4, 4, 4, INK); box(g, x + 15, y - 46, 2, 30, TIMB[3]); box(g, x + 10, y - 22, 12, 3, '#7A7A84');
    box(g, x + 4, y - 58, 4, 38, '#8AA0C8'); box(g, x + 4, y - 58, 1, 38, '#C8D6F0'); box(g, x, y - 24, 12, 3, '#E0B840'); }
  // BEN'S STASH by his door: tubs of whey off the gift shop's truck, a towel over the sprinkler line, a stack of plush
  // boxes, his chalked arrow (dimmed: the junk's set dressing, nothing to stand on)
  { const fy = H(FLOOR), P = ['#3A1A5A', '#5A2A8A', '#7A44B4', '#9A66D2', '#C4A0EE'], G = ['#1A3A1A', '#2A5A2A', '#3A7A3A', '#5A9A4A', '#8ACA6A'];
    tub(g, R(TUN.b - 236), fy - 22, 18, 22, P, 'WHEY'); tub(g, R(TUN.b - 214), fy - 16, 14, 16, G, 'BCAA'); tub(g, R(TUN.b - 232), fy - 40, 14, 15, P, 'WHEY');
    for (let k = 0; k < 2; k++) { const x = R(TUN.b - 186), y = fy - 20 - k * 20; box(g, x - 1, y - 1, 34, 21, INK); box(g, x, y, 32, 19, mix('#E8B8D0', CONC[1], 0.3)); box(g, x, y, 32, 1, mix('#FFFFFF', CONC[1], 0.3)); text(g, 'PIXIE', x + 16, y + 9, '#8A2A5A', 4, 'center', null); text(g, 'PLUSH', x + 16, y + 15, '#8A2A5A', 4, 'center', null); }
    { const x = R(TUN.b - 300), y = H(TUN.top) + 18; box(g, x, y, 22, 3, '#E8E2D8'); box(g, x + 2, y + 3, 6, 26, '#E8E2D8'); box(g, x + 14, y + 3, 6, 20, '#D8D0C4'); box(g, x + 2, y + 24, 6, 2, '#C84A4A'); }
    chalk(g, "BEN'S GYM", R(TUN.b - 120), fy - 92, 5); chalkArrow(g, R(TUN.b - 148), fy - 80, 70);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The machine room (local: x from its left end, y up from its floor; painted at the room's origin)

const W = ROOM.b - ROOM.a;
/** Where things are along the room (from its left end): the desk, the propane and the fog, the lance bench, the egg. */
const DESK_LX = 380, PLUMB_LX = 580, GYM_LX = 920, EGG_LX = 830;
const paintRoomWall = (g: Ctx) => {
  // (riveted steel panels, banded darker up into the stage's underside)
  bandedGradient(g, 0, -RH, W, RH, [STEEL[1], STEEL[2], STEEL[2], STEEL[3]], 8);
  for (let x = 0; x < W; x += 80) { box(g, x, -RH, 2, RH, STEEL[0]); box(g, x + 2, -RH, 1, RH, STEEL[4]); for (let y = -RH + 10; y < 0; y += 22) { box(g, x + 6, y, 2, 2, STEEL[4]); box(g, x + 72, y, 2, 2, STEEL[4]); box(g, x + 6, y + 2, 2, 1, STEEL[0]); box(g, x + 72, y + 2, 2, 1, STEEL[0]); } }
  for (let y = -RH + 100; y < 0; y += 100) { box(g, 0, y, W, 2, STEEL[0]); box(g, 0, y + 2, W, 1, STEEL[4]); }
  // (rust streaks, a damp patch)
  for (let k = 0; k < 14; k++) { const x = hash(k * 4.7) * W, l = 30 + hash(k * 2.2) * 120; checker(g, x, -RH + 30 + hash(k) * 40, 3, l, '#6A3A1E', 0, 1); }
  // (the stage's underside overhead: I-beams across, the lair's floor planks over them, chains)
  box(g, 0, -RH, W, 22, '#120E10'); for (let x = 0; x < W; x += 14) box(g, x, -RH + 4, 1, 16, '#2A2024');
  for (let x = 40; x < W; x += 180) {
    box(g, x - 2, -RH, 26, 30, INK); box(g, x, -RH, 22, 4, STEEL[3]); box(g, x + 9, -RH + 4, 4, 22, STEEL[2]); box(g, x, -RH + 24, 22, 4, STEEL[3]); box(g, x, -RH, 22, 1, STEEL[5]);
  }
  for (const cx of [260, 720]) for (let y = -RH + 26; y < -RH + 120; y += 6) { box(g, cx, y, 3, 4, STEEL[3]); box(g, cx, y + 4, 3, 2, STEEL[1]); }
  stencil(g, 'MACHINE ROOM', 520, -RH + 70, '#C8D0D8', 8);
  stencil(g, "DRAGON'S LAIR - STAGE B", 520, -RH + 86, '#C8D0D8', 5);
  stencil(g, 'LOAD LIMIT 1 DRAGON', 880, -RH + 140, '#E8B820', 5);
};

/** The dragon's head (SIR SCORCH-A-LOT), on its side on a pallet: its middle at x, the pallet on the floor. */
const paintHead = (g: Ctx, x: number) => {
  // (the pallet)
  box(g, x - 100, -14, 200, 14, INK); box(g, x - 98, -13, 196, 4, TIMB[3]); box(g, x - 98, -13, 196, 1, TIMB[5]);
  for (const px of [-96, -6, 84]) { box(g, x + px, -9, 12, 9, TIMB[2]); box(g, x + px, -9, 12, 1, TIMB[4]); }
  // (the hoses and wires out of the neck stump, off the pallet's left end)
  for (const [col, dy, l] of [['#2A2A30', 0, 60], ['#B42A20', 6, 48], ['#E8C030', 10, 36], ['#3A6A3A', 3, 54]] as const) {
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 80, -60 + dy); g.quadraticCurveTo(x - 110, -30 + dy, x - 80 - l, -14); g.stroke();
    g.strokeStyle = col; g.lineWidth = 3; g.stroke();
  }
  // (the neck stump: torn rubber, the foam and the steel frame showing)
  g.fillStyle = INK; g.beginPath(); g.ellipse(x - 78, -62, 22, 44, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = FOAMY[3]; g.beginPath(); g.ellipse(x - 78, -62, 19, 41, 0, 0, Math.PI * 2); g.fill();
  checker(g, x - 94, -100, 32, 76, FOAMY[2], 0, 1);
  box(g, x - 80, -100, 4, 76, STEEL[3]); box(g, x - 92, -64, 28, 4, STEEL[3]);
  // (the skull: green rubber over the fiberglass, banded; the brow ridge, scales in rows)
  const skull = () => { g.beginPath(); g.moveTo(x - 76, -104); g.quadraticCurveTo(x - 40, -132, x + 20, -118); g.lineTo(x + 96, -86); g.quadraticCurveTo(x + 104, -76, x + 96, -66); g.lineTo(x + 20, -62); g.lineTo(x - 76, -20); g.closePath(); };
  g.fillStyle = INK; g.save(); g.translate(0, 0); skull(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.restore();
  skull(); g.fillStyle = SCALE[3]; g.fill();
  g.save(); skull(); g.clip();
  for (let i = 0; i < 6; i++) box(g, x - 80, -134 + i * 20, 190, 20, SCALE[[4, 4, 3, 3, 2, 1][i]]);
  for (let y = -128; y < -20; y += 8) for (let sx = x - 76 + ((y / 8) & 1) * 6; sx < x + 100; sx += 12) { box(g, sx, y, 8, 1, SCALE[1]); box(g, sx + 1, y - 1, 5, 1, SCALE[5]); }
  // (the skin peeled off in patches: the yellow foam, the mesh)
  for (const [px, py, pw, ph] of [[x - 30, -110, 34, 18], [x + 40, -92, 22, 12], [x - 60, -60, 26, 22]] as const) {
    box(g, px - 1, py - 1, pw + 2, ph + 2, SCALE[0]); box(g, px, py, pw, ph, FOAMY[3]); checker(g, px, py, pw, ph, FOAMY[1], 0, 1);
    for (let k = 0; k < pw; k += 5) box(g, px + k, py, 1, ph, FOAMY[0]);
    box(g, px + pw - 6, py - 4, 8, 5, SCALE[4]); box(g, px + pw - 5, py - 4, 6, 1, SCALE[5]);
  }
  g.restore();
  // (the brow ridge and the eye socket (its glow's live), a horn snapped off, the nostril)
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + 16, -104, 22, 9, -0.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = SCALE[4]; g.beginPath(); g.ellipse(x + 16, -106, 20, 6, -0.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + 22, -92, 12, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3A0606'; g.beginPath(); g.ellipse(x + 22, -92, 10, 7, 0, 0, Math.PI * 2); g.fill();
  box(g, x - 22, -136, 14, 16, INK); box(g, x - 20, -134, 10, 14, BONEW[3]); box(g, x - 20, -134, 3, 14, BONEW[5]); box(g, x - 21, -138, 12, 4, BONEW[1]);
  box(g, x + 84, -84, 8, 5, INK);
  // (the lower jaw, dropped open on its hinge, lying on the pallet; the teeth (fiberglass, chipped))
  const jaw = () => { g.beginPath(); g.moveTo(x - 40, -40); g.lineTo(x + 92, -32); g.quadraticCurveTo(x + 102, -22, x + 90, -14); g.lineTo(x - 50, -14); g.closePath(); };
  jaw(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); g.fillStyle = SCALE[2]; g.fill();
  g.save(); jaw(); g.clip(); box(g, x - 50, -40, 160, 6, SCALE[3]); box(g, x - 50, -22, 160, 8, SCALE[1]); g.restore();
  for (let k = 0; k < 8; k++) {
    const tx = x - 10 + k * 12, chip = k === 3 || k === 6;
    g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 4, -64); g.lineTo(tx + 4, -64); g.lineTo(tx, chip ? -58 : -50); g.closePath(); g.fill();
    g.fillStyle = BONEW[3]; g.beginPath(); g.moveTo(tx - 3, -64); g.lineTo(tx + 3, -64); g.lineTo(tx, chip ? -59 : -52); g.closePath(); g.fill();
    if (k % 2 === 0) { g.fillStyle = INK; g.beginPath(); g.moveTo(tx + 2, -34); g.lineTo(tx + 9, -34); g.lineTo(tx + 5, -46); g.closePath(); g.fill(); g.fillStyle = BONEW[4]; g.beginPath(); g.moveTo(tx + 3, -34); g.lineTo(tx + 8, -34); g.lineTo(tx + 5, -44); g.closePath(); g.fill(); }
  }
  // (the mouth's dark between, Ben's sleeping bag laid in it (orange nylon, quilted), a pillow on the tongue)
  box(g, x - 20, -62, 112, 26, '#2A0A0E');
  box(g, x - 16, -48, 104, 12, INK); box(g, x - 15, -47, 102, 10, '#E07A20'); box(g, x - 15, -47, 102, 2, '#F8B060');
  for (let k = 0; k < 102; k += 12) box(g, x - 15 + k, -47, 1, 10, '#A0500E');
  box(g, x + 60, -56, 26, 12, INK); box(g, x + 61, -55, 24, 10, '#E8E4F0'); box(g, x + 61, -55, 24, 2, '#FFFFFF');
  // (the masking tape on the jaw: BEN'S BED. NOT A RIDE.)
  box(g, x - 34, -30, 92, 12, '#E8DCB0'); box(g, x - 34, -30, 92, 1, '#FFF4D0');
  text(g, "BEN'S BED. NOT A RIDE.", x + 12, -21, '#3A2A1A', 5, 'center', null);
  // (the brass plaque on the pallet's end)
  box(g, x + 30, -12, 64, 10, '#6A4A10'); box(g, x + 31, -11, 62, 8, '#C8A040');
  text(g, 'SIR SCORCH-A-LOT 79-04', x + 62, -5, '#3A2408', 4, 'center', null);
};

/** The control desk (one button's light is live): at x, on the floor. */
const paintDesk = (g: Ctx, x: number) => {
  box(g, x - 1, -61, 82, 61, INK); box(g, x, -60, 80, 60, STEEL[2]); box(g, x, -60, 80, 2, STEEL[4]);
  box(g, x + 4, -56, 72, 20, '#20262C'); box(g, x + 4, -56, 72, 1, '#4A5662');
  for (let k = 0; k < 6; k++) { const bx = x + 10 + k * 11; box(g, bx - 1, -51, 8, 8, INK); box(g, bx, -50, 6, 6, ['#B42A20', '#E8C030', '#3A8A3A', '#2A5AB4', '#B42A20', '#7A7A84'][k]); box(g, bx, -50, 6, 1, '#FFFFFF'); }
  text(g, 'SCORCH', x + 40, -26, '#C8D0D8', 5, 'center', null);
  box(g, x + 30, -20, 20, 10, '#14181C'); for (let k = 0; k < 3; k++) box(g, x + 32 + k * 6, -18, 4, 6, '#3A4048');
};
/** The hydraulic rams that worked the dragon up through the lair's floor overhead: fat cylinders hung off the I-beams,
 *  chrome rods down out of them to the clevis brackets that held his head (it's lying under them now). */
const paintRam = (g: Ctx, x: number, rodEnd: number) => {
  const cTop = -RH + 22, cBot = -RH + 170;
  box(g, x - 15, cTop, 30, cBot - cTop, INK);
  box(g, x - 13, cTop, 26, cBot - cTop, STEEL[2]); box(g, x - 13, cTop, 6, cBot - cTop, STEEL[4]); box(g, x + 8, cTop, 5, cBot - cTop, STEEL[1]);
  for (const y of [cTop, cTop + 70, cBot - 6]) { box(g, x - 15, y, 30, 6, STEEL[3]); box(g, x - 15, y, 30, 1, STEEL[5]); }
  box(g, x - 7, cBot, 14, rodEnd - cBot, INK); box(g, x - 6, cBot, 12, rodEnd - cBot, '#C8D0D8'); box(g, x - 6, cBot, 3, rodEnd - cBot, '#FFFFFF'); box(g, x + 4, cBot, 2, rodEnd - cBot, '#7A8490');
  box(g, x - 10, rodEnd - 2, 20, 10, INK); box(g, x - 9, rodEnd - 1, 18, 8, STEEL[3]); box(g, x - 9, rodEnd - 1, 18, 1, STEEL[5]); box(g, x - 2, rodEnd + 2, 4, 4, INK);
  // (its hose, looping down off the cylinder and back up into the ceiling)
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 13, cTop + 30); g.quadraticCurveTo(x + 44, cTop + 120, x + 30, -RH); g.stroke(); g.strokeStyle = '#2A2A30'; g.lineWidth = 3; g.stroke();
};
/** The propane manifold and the fog drum: at x, on the floor (the pilots are live). */
const paintPlumbing = (g: Ctx, x: number) => {
  // (the tank: red, banded; PROPANE / FIRE EFFECT ONLY)
  box(g, x - 1, -101, 52, 101, INK); g.fillStyle = INK; g.beginPath(); g.ellipse(x + 25, -100, 26, 10, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 5; i++) box(g, x + i * 10, -100, 10, 100, RED[[4, 3, 3, 2, 1][i]]);
  g.fillStyle = RED[4]; g.beginPath(); g.ellipse(x + 25, -100, 24, 8, 0, 0, Math.PI * 2); g.fill();
  box(g, x + 4, -70, 42, 20, '#F4F0E8'); text(g, 'PROPANE', x + 25, -62, '#8A1A16', 5, 'center', null); text(g, 'FIRE FX', x + 25, -54, '#3A2A2A', 4, 'center', null);
  box(g, x + 20, -114, 10, 8, STEEL[3]); box(g, x + 22, -122, 6, 8, STEEL[4]);
  // (the manifold: red pipe off it, across and up into the ceiling in three runs; valves, gauges; the pilots' burners)
  for (const [px, top] of [[x + 70, -RH], [x + 100, -RH], [x + 130, -RH]] as const) {
    box(g, px - 1, top, 8, -top - 40, INK); box(g, px, top, 6, -top - 40, RED[3]); box(g, px, top, 2, -top - 40, RED[5]);
    box(g, px - 4, -150, 14, 12, INK); box(g, px - 3, -149, 12, 10, '#C8A040'); box(g, px - 1, -147, 8, 6, '#F4F0E8'); box(g, px + 2, -146, 1, 3, '#8A1A16');
    box(g, px - 6, -94, 18, 5, INK); box(g, px - 5, -93, 16, 3, '#E8C030');
    box(g, px - 2, -46, 10, 8, STEEL[2]); box(g, px - 1, -40, 8, 2, STEEL[4]);
  }
  box(g, x + 48, -76, 92, 6, INK); box(g, x + 48, -75, 92, 4, RED[3]); box(g, x + 48, -75, 92, 1, RED[5]);
  // (the fog drum: UNICORN BREATH)
  box(g, x + 152, -71, 46, 71, INK); for (let i = 0; i < 4; i++) box(g, x + 153 + i * 11, -70, 11, 70, ['#B8C0E8', '#9AA2D0', '#7A82B4', '#5A6294'][i]);
  for (const y of [-64, -36, -8]) box(g, x + 152, y, 46, 3, '#3A4274');
  box(g, x + 158, -56, 34, 16, '#F4F0FA'); text(g, 'UNICORN', x + 175, -49, '#7A2A6A', 4, 'center', null); text(g, 'BREATH', x + 175, -43, '#7A2A6A', 4, 'center', null);
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 175, -71); g.quadraticCurveTo(x + 175, -RH + 60, x + 210, -RH); g.stroke(); g.strokeStyle = '#4A4A58'; g.lineWidth = 4; g.stroke();
};
/** The gym: the lance barbell with kite shield plates on two hydraulic jacks; the dragon egg kettlebell; a towel. */
const paintGym = (g: Ctx, x: number, eggX: number) => {
  // (the jacks: red bottle jacks, their saddles up)
  for (const jx of [x + 10, x + 120]) { box(g, jx - 1, -61, 22, 61, INK); box(g, jx, -60, 20, 60, RED[3]); box(g, jx, -60, 5, 60, RED[5]); box(g, jx + 15, -60, 5, 60, RED[1]); box(g, jx + 6, -72, 8, 12, '#C8D0D8'); box(g, jx + 3, -74, 14, 3, STEEL[3]); }
  // (the lance across them: striped, the vamplate, the tip)
  box(g, x - 40, -79, 220, 7, INK);
  for (let k = 0; k < 220; k += 14) box(g, x - 39 + k, -78, 14, 5, (k / 14) % 2 ? '#F4F0FA' : '#B02466');
  box(g, x - 39, -78, 218, 1, '#FFFFFF');
  g.fillStyle = INK; g.beginPath(); g.moveTo(x + 180, -82); g.lineTo(x + 196, -75); g.lineTo(x + 180, -68); g.closePath(); g.fill();
  g.fillStyle = '#C8D0D8'; g.beginPath(); g.moveTo(x + 181, -80); g.lineTo(x + 193, -75); g.lineTo(x + 181, -70); g.closePath(); g.fill();
  // (the shields for plates, two a side: plywood kite shields, painted, a hole drilled through)
  const shield = (sx: number, col: string, crest: string) => {
    g.fillStyle = INK; g.beginPath(); g.moveTo(sx - 15, -100); g.lineTo(sx + 15, -100); g.lineTo(sx + 15, -76); g.quadraticCurveTo(sx + 12, -56, sx, -48); g.quadraticCurveTo(sx - 12, -56, sx - 15, -76); g.closePath(); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(sx - 13, -98); g.lineTo(sx + 13, -98); g.lineTo(sx + 13, -76); g.quadraticCurveTo(sx + 10, -58, sx, -51); g.quadraticCurveTo(sx - 10, -58, sx - 13, -76); g.closePath(); g.fill();
    box(g, sx - 13, -98, 26, 2, mix(col, '#FFFFFF', 0.35)); box(g, sx - 2, -90, 4, 30, crest); box(g, sx - 9, -82, 18, 4, crest);
    box(g, sx - 2, -78, 4, 4, INK);
  };
  shield(x - 24, '#3A5AB4', '#E8C030'); shield(x - 10, '#B42A20', '#F4F0FA'); shield(x + 150, '#B42A20', '#F4F0FA'); shield(x + 164, '#3A5AB4', '#E8C030');
  // (the dragon egg kettlebell: a speckled fiberglass egg, a steel handle bolted on, GIFT SHOP 49.99)
  const ex = eggX;
  box(g, ex - 12, -64, 4, 18, INK); box(g, ex + 8, -64, 4, 18, INK); box(g, ex - 12, -68, 24, 5, INK); box(g, ex - 11, -67, 22, 3, STEEL[4]); box(g, ex - 11, -63, 2, 16, STEEL[3]); box(g, ex + 9, -63, 2, 16, STEEL[3]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(ex, -26, 22, 28, 0, 0, Math.PI * 2); g.fill();
  const egg = () => { g.beginPath(); g.ellipse(ex, -26, 20, 26, 0, 0, Math.PI * 2); };
  egg(); g.fillStyle = '#7AA0C8'; g.fill();
  g.save(); egg(); g.clip(); for (let i = 0; i < 5; i++) box(g, ex - 20 + i * 8, -54, 8, 56, ['#B8D4EC', '#9ABCE0', '#7AA0C8', '#5A80A8', '#3A5A80'][i]);
  for (let k = 0; k < 16; k++) box(g, ex - 16 + hash(k * 3.1) * 30, -48 + hash(k * 5.7) * 44, 3, 2, k % 2 ? '#2A3A6A' : '#E8F0FA'); g.restore();
  box(g, ex - 10, -42, 4, 8, '#FFFFFF');
  box(g, ex - 2, -10, 20, 8, '#F07A1A'); text(g, '49.99', ex + 8, -4, '#3A1400', 4, 'center', null);
  // (the towel on the near jack's saddle)
  box(g, x + 4, -78, 10, 26, INK); box(g, x + 5, -77, 8, 24, '#E8E4F0'); for (let k = 0; k < 24; k += 4) box(g, x + 5, -77 + k, 8, 1, '#B02466');
};
const paintRoomFloor = (g: Ctx) => {
  box(g, -20, 0, W + 40, 8, CONC[2]); checker(g, -20, 6, W + 40, 2, CONC[1], 0, 1); lip(g, 0, 0, W);
  box(g, 0, -3, W, 3, CONC[1]);
  // (the yellow safety line, an oil stain, a drain)
  for (let x = 330; x < W - 40; x += 20) box(g, x, -2, 12, 1, '#C8A020');
  g.fillStyle = 'rgba(10,8,12,0.55)'; g.beginPath(); g.ellipse(600, -1, 40, 2, 0, 0, Math.PI * 2); g.fill();
  box(g, 400, -2, 20, 2, INK); for (let k = 0; k < 20; k += 3) box(g, 400 + k, -2, 1, 2, STEEL[3]);
};
/** The chute up over the cannon: brick, sooty, dark, a sliver of light at the trapdoor up top. */
const paintChute = (g: Ctx) => {
  const a = CHUTE.a, b = CHUTE.b, top = -(CHUTE.top - FLOOR), bot = -RH;
  box(g, a - 6, top, b - a + 12, bot - top + 4, '#2A1410');
  for (let y = top; y < bot; y += 8) for (let x = a - 6 + ((y / 8) & 1) * 8; x < b + 6; x += 16) box(g, x, y, 15, 7, y % 16 ? '#4A2A22' : '#3E221A');
  box(g, a, top, b - a, bot - top + 4, '#06040A');
  bandedGradient(g, a, top, b - a, 40, ['#3A3448', '#18141E', '#06040A'], 4);
  box(g, a + 4, top, b - a - 8, 2, '#C8C0A8');
  for (let y = top + 20; y < bot; y += 18) { box(g, a + 8, y, b - a - 16, 2, STEEL[3]); }
};
// ---- Ben's dressing (the owner: "make the details in bens lairs in general more....detailed"): on the steel, his trophy
// wall of stolen Fairy Land props (a carousel unicorn's head mounted like a kill, two Broomstick Deathmatch brooms
// crossed, a tiara on a nail), his two posters (WISHING IS NOT A WORKOUT; NO FAIRY GODMOTHER IS COMING. LIFT.), his tool
// pegboard over a workbench (a vise, the amulet's next try: a Fairy Wheel hub cap with a gift-shop crystal glued in,
// wands for scrap, a soldering iron, a gooseneck lamp), the weld scorch on the wall behind it, a shelf of protein tubs,
// chalk handprints; on the floor at the west wall a mini fridge with a hot plate and the Witch's Cottage cauldron on it
// for a pot, a chalk bucket and its dust by the bench, an extension cord down off the I-beams. All of it background
// (nothing lit along a top). In front: the nearest I-beam across the top and its gussets (in silhouette).

/** A poster stuck up on the steel with tape: its paper, a dog-ear, words in his voice. */
const poster = (g: Ctx, x: number, y: number, w: number, h: number, face: string, words: [string, string][], size = 5) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, face); box(g, x, y, w, 2, mix(face, '#FFFFFF', 0.3));
  checker(g, x, y + h - 8, w, 6, mix(face, '#000000', 0.12), 0, 1); box(g, x, y + h - 2, w, 2, mix(face, '#000000', 0.2));
  words.forEach(([t, col], i) => text(g, t, x + w / 2, y + 12 + i * (size + 4), col, size, 'center', null));
  g.fillStyle = mix(face, '#000000', 0.3); g.beginPath(); g.moveTo(x + w, y + h - 8); g.lineTo(x + w, y + h); g.lineTo(x + w - 8, y + h); g.closePath(); g.fill();
  for (const [tx, ty] of [[x - 3, y - 2], [x + w - 7, y - 2]]) { box(g, tx, ty, 10, 4, 'rgba(236,224,180,0.75)'); }
};
/** A tub of protein on a shelf or the floor. */
const tub = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], word: string) => {
  box(g, x - 1, y - 3, w + 2, h + 3, INK);
  for (let i = 0; i < 4; i++) box(g, x + (i * w) / 4, y, w / 4 + 1, h, R[4 - i]);
  box(g, x, y - 2, w, 3, STEEL[1]); box(g, x, y - 2, w, 1, STEEL[4]);
  box(g, x + 2, y + 5, w - 4, h - 11, '#E8E2D0'); text(g, word, x + w / 2, y + h / 2 + 2, R[0], 4, 'center', null);
};

const paintDress = (g: Ctx) => {
  // ---- the trophy wall: the unicorn's head on a plaque, the brooms crossed, the tiara on its nail
  { const x = 410, y = -284;
    box(g, x - 23, y - 4, 46, 52, INK); box(g, x - 22, y - 3, 44, 50, TIMB[3]); box(g, x - 22, y - 3, 44, 2, TIMB[5]); box(g, x - 22, y + 44, 44, 3, TIMB[1]);
    // (the head: white fiberglass, a pink mane, the gold horn, one eye painted on, the neck sawn off flat)
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 10, y + 40); g.lineTo(x - 14, y + 10); g.quadraticCurveTo(x - 8, y - 6, x + 10, y - 2); g.lineTo(x + 26, y + 18); g.quadraticCurveTo(x + 30, y + 26, x + 22, y + 30); g.lineTo(x + 8, y + 26); g.lineTo(x + 10, y + 40); g.closePath(); g.fill();
    g.fillStyle = BONEW[4]; g.beginPath(); g.moveTo(x - 8, y + 38); g.lineTo(x - 12, y + 11); g.quadraticCurveTo(x - 7, y - 3, x + 9, y); g.lineTo(x + 24, y + 18); g.quadraticCurveTo(x + 27, y + 25, x + 21, y + 28); g.lineTo(x + 7, y + 24); g.lineTo(x + 8, y + 38); g.closePath(); g.fill();
    box(g, x - 8, y + 6, 4, 30, BONEW[5]); box(g, x + 4, y + 22, 18, 3, BONEW[2]);
    for (let k = 0; k < 5; k++) { box(g, x - 15 + (k & 1), y + 2 + k * 7, 6, 8, INK); box(g, x - 14 + (k & 1), y + 3 + k * 7, 4, 6, ['#F472B6', '#EC4899', '#F9A8D4', '#DB2777', '#F472B6'][k]); }
    box(g, x + 6, y + 8, 4, 4, INK); box(g, x + 7, y + 8, 2, 1, '#FFFFFF'); box(g, x + 19, y + 22, 2, 2, INK);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x + 4, y + 1); g.lineTo(x + 20, y - 22); g.lineTo(x + 10, y + 3); g.closePath(); g.fill();
    g.fillStyle = FOAMY[4]; g.beginPath(); g.moveTo(x + 6, y + 0); g.lineTo(x + 18, y - 18); g.lineTo(x + 9, y + 1); g.closePath(); g.fill();
    for (let k = 0; k < 3; k++) box(g, x + 9 + k * 3, y - 4 - k * 4, 3, 1, FOAMY[1]);
    // (the brooms, crossed: stick and bristles, a strap on one)
    for (const s of [-1, 1]) {
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 60 + s * 34, y - 4); g.lineTo(x + 60 - s * 34, y + 52); g.stroke();
      g.strokeStyle = TIMB[4]; g.lineWidth = 3; g.stroke();
      const bx = x + 60 - s * 34, by = y + 52;
      g.fillStyle = INK; g.beginPath(); g.moveTo(bx - 3, by - 6); g.lineTo(bx + 3, by - 6); g.lineTo(bx + 10 * -s + 8, by + 14); g.lineTo(bx + 10 * -s - 8, by + 14); g.closePath(); g.fill();
      g.fillStyle = FOAMY[3]; g.beginPath(); g.moveTo(bx - 2, by - 5); g.lineTo(bx + 2, by - 5); g.lineTo(bx + 10 * -s + 6, by + 12); g.lineTo(bx + 10 * -s - 6, by + 12); g.closePath(); g.fill();
      for (let k = -4; k <= 4; k += 2) box(g, bx + 10 * -s + k, by + 4, 1, 8, FOAMY[1]);
    }
    box(g, x + 56, y + 20, 8, 8, INK); box(g, x + 57, y + 21, 6, 6, RED[3]);
    // (the tiara on its nail: rhinestones)
    const tx = x + 130, ty = y + 14;
    box(g, tx - 1, ty - 8, 2, 4, STEEL[4]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 16, ty + 6); g.lineTo(tx - 12, ty - 4); g.lineTo(tx - 6, ty + 1); g.lineTo(tx, ty - 8); g.lineTo(tx + 6, ty + 1); g.lineTo(tx + 12, ty - 4); g.lineTo(tx + 16, ty + 6); g.closePath(); g.fill();
    g.fillStyle = '#C8D0D8'; g.beginPath(); g.moveTo(tx - 14, ty + 5); g.lineTo(tx - 11, ty - 2); g.lineTo(tx - 6, ty + 2); g.lineTo(tx, ty - 6); g.lineTo(tx + 6, ty + 2); g.lineTo(tx + 11, ty - 2); g.lineTo(tx + 14, ty + 5); g.closePath(); g.fill();
    for (const [dx, col] of [[-11, '#F9A8D4'], [0, '#93C5FD'], [11, '#F9A8D4']] as const) { box(g, tx + dx - 1, ty - 1, 3, 3, col); box(g, tx + dx - 1, ty - 1, 1, 1, '#FFFFFF'); }
    text(g, 'TROPHIES', x + 66, y + 66, '#C8D0D8', 4, 'center', null);
  }
  // ---- WISHING IS NOT A WORKOUT (over the desk)
  poster(g, 352, -206, 72, 60, '#E8E2F4', [['WISHING', '#7A2A6A'], ['IS NOT A', '#3A2A4A'], ['WORKOUT', '#B02466']], 5);
  // ---- the pegboard over the workbench: holes, the tools on hooks
  { const x = 456, y = -196, w = 116, h = 66;
    box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, '#7A5A3A'); box(g, x, y, w, 1, '#9A7A52');
    for (let yy = y + 4; yy < y + h; yy += 6) for (let xx = x + 4; xx < x + w; xx += 6) box(g, xx, yy, 1, 1, '#3A2818');
    // (the hammer, a wrench, a big one, pliers, the welding mask, the angle grinder)
    box(g, x + 8, y + 12, 3, 30, INK); box(g, x + 9, y + 13, 1, 28, TIMB[5]); box(g, x + 4, y + 8, 12, 6, INK); box(g, x + 5, y + 9, 10, 4, STEEL[4]); box(g, x + 5, y + 9, 10, 1, STEEL[5]);
    for (const [wx, l] of [[x + 24, 36], [x + 32, 28]] as const) { box(g, wx - 1, y + 10, 4, l, INK); box(g, wx, y + 11, 2, l - 2, STEEL[4]); box(g, wx - 3, y + 7, 8, 6, INK); box(g, wx - 2, y + 8, 6, 4, STEEL[5]); }
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 42, y + 12); g.lineTo(x + 50, y + 44); g.moveTo(x + 50, y + 12); g.lineTo(x + 42, y + 44); g.stroke(); g.strokeStyle = STEEL[4]; g.lineWidth = 1; g.stroke();
    box(g, x + 40, y + 38, 5, 8, '#2A5AB4'); box(g, x + 48, y + 38, 5, 8, '#2A5AB4');
    // (the mask: black, its green glass)
    box(g, x + 60, y + 8, 22, 28, INK); box(g, x + 61, y + 9, 20, 26, '#26262E'); box(g, x + 61, y + 9, 5, 26, '#3E3E4A'); box(g, x + 64, y + 16, 14, 6, INK); box(g, x + 65, y + 17, 12, 4, '#2E5A2E'); box(g, x + 65, y + 17, 4, 1, '#7AC07A');
    // (the grinder: its body, its guard, the disc)
    box(g, x + 88, y + 20, 24, 10, INK); box(g, x + 89, y + 21, 22, 8, '#E8C030'); box(g, x + 89, y + 21, 22, 2, '#F8E070'); box(g, x + 84, y + 14, 10, 20, INK);
    g.fillStyle = STEEL[3]; g.beginPath(); g.arc(x + 89, y + 24, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = STEEL[5]; g.beginPath(); g.arc(x + 88, y + 23, 4, 0, Math.PI * 2); g.fill();
    for (const [nx, ny] of [[x + 9, y + 10], [x + 25, y + 8], [x + 33, y + 8], [x + 46, y + 10], [x + 70, y + 6]]) box(g, nx, ny, 2, 2, '#C8C8D0');
  }
  // ---- the weld scorch on the steel behind the bench (a sooty bloom, spatter beads)
  for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(8,6,10,${(0.16 + k * 0.08).toFixed(2)})`; g.beginPath(); g.ellipse(520, -82, 46 - k * 9, 28 - k * 5, 0, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 22; k++) box(g, 480 + hash(k * 3.7) * 80, -110 + hash(k * 5.3) * 50, 1, 1, k % 3 ? '#E8B860' : '#FFF4C8');
  // ---- the workbench: a steel top on angle legs, a shelf under (a toolbox, coffee cans of bolts), the clutter on it
  { const x = 462, w = 112;
    box(g, x - 1, -47, w + 2, 6, INK); box(g, x, -46, w, 4, STEEL[3]); box(g, x, -46, w, 1, STEEL[4]); box(g, x, -42, w, 1, STEEL[1]);
    for (const lx of [x + 2, x + w - 6]) { box(g, lx - 1, -42, 6, 42, INK); box(g, lx, -42, 4, 42, STEEL[2]); box(g, lx, -42, 1, 42, STEEL[4]); }
    box(g, x + 4, -16, w - 8, 3, INK); box(g, x + 4, -16, w - 8, 2, STEEL[2]);
    box(g, x + 10, -32, 34, 16, INK); box(g, x + 11, -31, 32, 15, RED[3]); box(g, x + 11, -31, 32, 3, RED[5]); box(g, x + 24, -28, 6, 3, STEEL[4]);
    for (let k = 0; k < 3; k++) { const cx = x + 56 + k * 14; box(g, cx - 1, -29, 12, 13, INK); box(g, cx, -28, 10, 12, STEEL[3]); box(g, cx, -28, 3, 12, STEEL[5]); box(g, cx, -28, 10, 1, '#C8C8D0'); }
    // (the vise at the west end, jaws closed on a wand)
    box(g, x + 2, -60, 24, 14, INK); box(g, x + 3, -59, 22, 12, '#2A5AB4'); box(g, x + 3, -59, 22, 2, '#5A8AE0'); box(g, x + 12, -64, 4, 6, STEEL[4]);
    box(g, x - 8, -55, 44, 2, '#F4D040'); box(g, x - 12, -58, 6, 8, INK); g.fillStyle = '#F8E070'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 2 : 5; g.lineTo(x - 10 + Math.cos(a) * rr, -54 + Math.sin(a) * rr); } g.closePath(); g.fill();
    // (the amulet's next try: a ride's hub cap, a gift-shop crystal glued in its middle, a chain off it)
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + 50, -53, 15, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = STEEL[4]; g.beginPath(); g.ellipse(x + 50, -54, 13, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C8D0D8'; g.beginPath(); g.ellipse(x + 47, -55, 6, 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = INK; g.beginPath(); g.moveTo(x + 50, -66); g.lineTo(x + 56, -58); g.lineTo(x + 50, -52); g.lineTo(x + 44, -58); g.closePath(); g.fill();
    g.fillStyle = '#C084FC'; g.beginPath(); g.moveTo(x + 50, -64); g.lineTo(x + 54, -58); g.lineTo(x + 50, -54); g.lineTo(x + 46, -58); g.closePath(); g.fill(); box(g, x + 48, -61, 2, 2, '#F5E8FF');
    for (let k = 0; k < 8; k++) box(g, x + 64 + k * 3, -48 + ((k & 1) ? 1 : 0), 2, 2, '#E8C030');
    // (spare wands for scrap in a can; the soldering iron on its stand)
    box(g, x + 82, -60, 12, 14, INK); box(g, x + 83, -59, 10, 13, STEEL[3]);
    for (const [dx, col] of [[-3, '#F472B6'], [1, '#93C5FD'], [4, '#F4D040']] as const) { box(g, x + 87 + dx, -76, 2, 17, col); box(g, x + 86 + dx, -79, 4, 4, '#F8E070'); }
    box(g, x + 98, -50, 12, 3, INK); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 100, -50); g.lineTo(x + 108, -62); g.stroke(); g.strokeStyle = '#B42A20'; g.lineWidth = 1; g.stroke();
    // (the gooseneck lamp clamped on the east end: its head bent down over the work)
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x + w - 4, -46); g.quadraticCurveTo(x + w + 2, -96, x + w - 22, -94); g.stroke(); g.strokeStyle = STEEL[4]; g.lineWidth = 1; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(x + w - 34, -86); g.lineTo(x + w - 20, -100); g.lineTo(x + w - 14, -90); g.closePath(); g.fill();
    g.fillStyle = '#3A8A3A'; g.beginPath(); g.moveTo(x + w - 31, -87); g.lineTo(x + w - 20, -98); g.lineTo(x + w - 16, -90); g.closePath(); g.fill();
    box(g, x + w - 30, -88, 10, 2, '#FFF4C8');
  }
  // ---- the shelf of tubs over the egg (two brackets, a plank)
  { const x = 790, y = -150, w = 84;
    for (const bx of [x + 8, x + w - 12]) { box(g, bx - 1, y + 4, 5, 14, INK); box(g, bx, y + 4, 3, 12, STEEL[3]); }
    box(g, x - 1, y - 1, w + 2, 7, INK); box(g, x, y, w, 5, TIMB[3]); box(g, x, y, w, 1, TIMB[4]);
    tub(g, x + 3, y - 28, 24, 28, RED, 'WHEY'); tub(g, x + 30, y - 24, 22, 24, LAV, 'MASS'); tub(g, x + 55, y - 30, 26, 30, SCALE, 'GAIN');
  }
  // ---- NO FAIRY GODMOTHER IS COMING. LIFT. (over the gym)
  poster(g, 930, -236, 96, 66, '#F4E8D0', [['NO FAIRY', '#3A2A4A'], ['GODMOTHER', '#3A2A4A'], ['IS COMING.', '#3A2A4A'], ['LIFT.', '#B42A20']], 5);
  // ---- the chalk: handprints on the steel by the bar, a bucket, the dust
  for (const [hx, hy] of [[880, -118], [898, -126], [1080, -120], [1064, -110]] as const) {
    g.fillStyle = 'rgba(236,232,240,0.3)'; g.beginPath(); g.ellipse(hx, hy, 5, 6, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 4; k++) box(g, hx - 5 + k * 3, hy - 12 + Math.abs(k - 1.5) * 2, 2, 6, 'rgba(236,232,240,0.26)');
  }
  { const x = 866; box(g, x - 1, -19, 16, 19, INK); box(g, x, -18, 14, 18, '#D8D8E0'); box(g, x, -18, 4, 18, '#F4F4F8'); box(g, x, -18, 14, 2, '#FFFFFF'); box(g, x + 2, -22, 10, 4, '#F4F4F8'); }
  for (let k = 0; k < 40; k++) box(g, 840 + hash(k * 2.3) * 250, -3 + hash(k * 4.1) * 3, 2, 1, `rgba(236,232,240,${(0.3 + hash(k) * 0.4).toFixed(2)})`);
  // ---- the mini fridge at the west wall, the hot plate on it, the witch's cauldron on that (STOLEN on tape)
  { const x = 4, w = 40, h = 54, y = -h;
    box(g, x - 1, y - 1, w + 2, h + 1, INK);
    for (let i = 0; i < 4; i++) box(g, x + (i * w) / 4, y, w / 4 + 1, h, ['#F4F4F8', '#D8D8E0', '#B8B8C4', '#9898A8'][i]);
    box(g, x, y + 16, w, 2, '#6A6A7A'); box(g, x + w - 7, y + 22, 3, 18, '#6A6A7A');
    box(g, x + 4, y + 28, 26, 9, '#E8DCB0'); text(g, 'STOLEN', x + 17, y + 35, '#3A2A1A', 4, 'center', null);
    for (const [mx, col] of [[x + 6, '#F472B6'], [x + 16, '#93C5FD'], [x + 26, '#F4D040']] as const) box(g, mx, y + 4, 6, 6, col);
    box(g, x + 1, y - 7, w - 2, 7, INK); box(g, x + 2, y - 6, w - 4, 5, '#26262E'); box(g, x + 2, y - 6, w - 4, 1, '#4A4A58');
    // (the cauldron: black iron, three stubby feet, its rim, a ladle in it)
    const cx = x + 20, cy = y - 18;
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, 15, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2A2A34'; g.beginPath(); g.ellipse(cx, cy, 13, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4A4A58'; g.beginPath(); g.ellipse(cx - 5, cy - 2, 5, 5, 0, 0, Math.PI * 2); g.fill();
    box(g, cx - 15, cy - 11, 30, 4, INK); box(g, cx - 14, cy - 10, 28, 2, '#5A5A68');
    box(g, cx - 12, cy - 8, 24, 2, '#7CB46A');
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 4, cy - 8); g.lineTo(cx + 12, cy - 26); g.stroke(); g.strokeStyle = TIMB[4]; g.lineWidth = 1; g.stroke();
  }
  // ---- a stolen parade banner strung between two I-beams (pink, scalloped, PIXIE PARADE), BEN'S GYM sprayed over it
  { const a = 800, b = 1080, y = -RH + 34;
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(a - 10, -RH + 26); g.lineTo(a, y); g.moveTo(b + 10, -RH + 26); g.lineTo(b, y); g.stroke();
    box(g, a - 1, y - 1, b - a + 2, 34, INK);
    for (let i = 0; i < 3; i++) box(g, a, y + i * 10, b - a, 10, ['#F9A8D4', '#F472B6', '#EC4899'][i]);
    box(g, a, y, b - a, 1, '#FCE7F3');
    for (let x = a; x < b; x += 16) { g.fillStyle = INK; g.beginPath(); g.arc(x + 8, y + 32, 8, 0, Math.PI); g.fill(); g.fillStyle = '#DB2777'; g.beginPath(); g.arc(x + 8, y + 31, 7, 0, Math.PI); g.fill(); }
    text(g, 'PIXIE PARADE', (a + b) / 2, y + 18, '#FDF2F8', 8, 'center', '#9D174D');
    // (his spray paint over it: BEN'S GYM, dripping)
    g.save(); g.globalAlpha = 0.9; text(g, "BEN'S GYM", (a + b) / 2 + 6, y + 30, '#1A1028', 10, 'center', null); g.restore();
    for (const [dx, l] of [[-40, 9], [-6, 14], [30, 7], [52, 11]] as const) box(g, (a + b) / 2 + dx, y + 32, 2, l, '#1A1028');
  }
  // ---- a jousting knight's dented breastplate hung on a hook, for parts (two rivets already drilled out)
  { const x = 1010, y = -318;
    box(g, x - 1, y - 8, 2, 6, STEEL[4]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 24, y); g.lineTo(x + 24, y); g.lineTo(x + 20, y + 40); g.quadraticCurveTo(x, y + 56, x - 20, y + 40); g.closePath(); g.fill();
    g.save(); g.beginPath(); g.moveTo(x - 22, y + 2); g.lineTo(x + 22, y + 2); g.lineTo(x + 18, y + 39); g.quadraticCurveTo(x, y + 53, x - 18, y + 39); g.closePath(); g.clip();
    for (let i = 0; i < 5; i++) box(g, x - 24 + i * 10, y, 10, 56, ['#E8ECF0', '#C8D0D8', '#A8B0BA', '#88909C', '#68707C'][i]);
    box(g, x - 1, y, 2, 56, '#F8FAFC'); g.fillStyle = 'rgba(30,30,40,0.35)'; g.beginPath(); g.ellipse(x + 8, y + 22, 6, 4, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    for (const [rx, ry] of [[x - 16, y + 6], [x + 14, y + 6]] as const) box(g, rx, ry, 3, 3, INK);
    box(g, x - 10, y + 2, 20, 4, '#B02466');
  }
  // ---- the extension cord down off the I-beam to the fridge
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(40, -RH + 28); g.quadraticCurveTo(28, -RH + 140, 34, -120); g.lineTo(38, -60); g.stroke();
  g.strokeStyle = '#E8862A'; g.lineWidth = 2; g.stroke();
};

/** The near I-beam across the top in front of it all and its gussets at each end (silhouette, a cold rim). */
const paintRoomNear = (g: Ctx) => {
  const N = ['#06040A', '#0E0A14', '#1A1424', '#2A2238'];
  box(g, -24, -RH - 16, W + 48, 18, N[0]); box(g, -24, -RH + 2, W + 48, 2, N[2]); box(g, -24, -RH + 4, W + 48, 1, N[3]);
  for (let x = 30; x < W; x += 150) { box(g, x, -RH - 14, 4, 16, N[1]); box(g, x + 1, -RH + 5, 2, 3, N[1]); }
  for (const [x, s] of [[-24, 1], [W + 24, -1]] as const) {
    g.fillStyle = N[0]; g.beginPath(); g.moveTo(x, -RH + 2); g.lineTo(x + s * 56, -RH + 2); g.lineTo(x, -RH + 58); g.closePath(); g.fill();
    g.fillStyle = N[3]; g.beginPath(); g.moveTo(x + s * 56, -RH + 2); g.lineTo(x + s * 52, -RH + 2); g.lineTo(x, -RH + 54); g.lineTo(x, -RH + 58); g.closePath(); g.fill();
  }
  // (a cable looped off it)
  g.strokeStyle = N[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(640, -RH + 2); g.quadraticCurveTo(700, -RH + 44, 760, -RH + 2); g.stroke();
};

const paintRoom = (g: Ctx) => {
  paintRoomWall(g);
  paintDress(g);
  paintChute(g);
  paintRam(g, HEAD_LX - 60, -128); paintRam(g, HEAD_LX + 50, -122);
  paintDesk(g, DESK_LX);
  paintPlumbing(g, PLUMB_LX);
  paintGym(g, GYM_LX, EGG_LX);
  paintHead(g, HEAD_LX);
  paintRoomFloor(g);
};

/** All of the still underground art (world space), clipped to one tile. */
const TILE = 256;
const paintUnder = (g: Ctx) => {
  paintEarth(g);
  paintTunnel(g);
  g.save(); g.translate(R(ROOM.a), H(FLOOR));
  paintRoom(g);
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The adit's way in from the shaft (the plank; the mouth in the shaft's side wall and the light beaming out of it),
// the trapdoor up top

const paintPlank = (g: Ctx) => {
  const w = LIP.b - LIP.a + 6;
  // (an old plank on two iron brackets out of the rock, its top lit)
  box(g, -1, -1, w + 2, 14, INK); box(g, 0, 0, w, 12, TIMB[3]); box(g, 0, 8, w, 4, TIMB[1]); lip(g, 0, 0, w);
  for (let k = 6; k < w; k += 14) box(g, k, 2, 1, 6, TIMB[1]);
  for (const bx of [6, w - 14]) { box(g, bx, 12, 4, 14, INK); box(g, bx + 1, 12, 2, 12, STEEL[3]); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(bx + 2, 24); g.lineTo(w + 2, 12); g.stroke(); g.strokeStyle = STEEL[3]; g.lineWidth = 1; g.stroke(); }
};
const paintTrapdoor = (g: Ctx, open: boolean) => {
  // (flush in the lair's floor: two boards, iron hinges, STAFF stenciled; open: the lid up on its hinge)
  if (!open) { box(g, -22, 2, 44, 5, '#3A2A1A'); box(g, -22, 2, 44, 1, '#5A4630'); box(g, -1, 2, 1, 5, '#1A100A'); box(g, -18, 3, 5, 3, STEEL[3]); box(g, 13, 3, 5, 3, STEEL[3]); return; }
  box(g, -22, 2, 44, 6, '#06040A');
  box(g, -24, -42, 6, 44, INK); box(g, -23, -41, 4, 42, TIMB[3]); box(g, -23, -41, 1, 42, TIMB[5]);
};

/** The mouth is in the shaft's side wall (the wall at x = MOUTH.a, going back in depth like the rest of the shaft's
 *  sides, sets.ts gorgeFaces): from depth DF (behind the play plane) to DN (in front of it). One eye for all of it
 *  (viewOf). It shows (and the beam's drawn over the wall) while the eye's out over the shaft; past the wall the
 *  meadow's near ground is in front of the shaft, so the beam's drawn before that ground (drawAditUnder), which covers
 *  it where it should. */
const DF = 0.8, DN = 1.24;
const wallX = () => R(MOUTH.a);
type Eye = View['eye'];
const onWall = (eye: Eye, y: number, d: number) => at(eye, wallX(), y, d);
/** A quad on the wall's face: heights y0..y1 (screen), depths d0..d1. */
const wallQuad = (c: Ctx, eye: Eye, y0: number, y1: number, d0: number, d1: number, col: string) =>
  polyF(c, [onWall(eye, y0, d0), onWall(eye, y0, d1), onWall(eye, y1, d1), onWall(eye, y1, d0)], col);
/** A shimmer in steps (the light's not a candle: a slow breathe, stepped, never smooth). */
const shimmer = (f: number) => 0.9 + 0.1 * Math.round(Math.sin(f * 0.045) * 2) / 2;

/** The mouth, on the shaft's side wall: its timber frame, the dark in it, the warm light back down it (banded, hotter
 *  deeper in), two boards nailed across it (one hanging loose), the light coming through between them. */
const drawMouth = (c: Ctx, eye: Eye, f: number) => {
  const top = H(MOUTH.top), fl = H(MOUTH.floor), sh = shimmer(f);
  wallQuad(c, eye, top - 12, fl + 2, DF - 0.07, DN + 0.07, INK);
  wallQuad(c, eye, top, fl, DF, DN, '#140A06');
  // (the light back down it: bands closing in on the hot middle)
  const GL = ['#4A220C', '#8A4416', '#C8702A', '#F2A848', sh > 0.95 ? '#FFE8B0' : '#FFD890'];
  GL.forEach((col, k) => {
    const t = (k + 1) / (GL.length + 1), yc = fl - 30, dc = (DF + DN) / 2;
    wallQuad(c, eye, top + (yc - top) * t * 0.8, fl + (yc - fl) * t * 0.7, DF + (dc - DF) * t, DN + (dc - DN) * t, col);
  });
  // (seen nearly edge-on it's still a slit of light: never thinner than that)
  { const [ax] = onWall(eye, top, 1), [bx, by] = onWall(eye, fl, 1); box(c, Math.round(Math.min(ax, bx)) - 1, top + 6, 2, by - top - 6, GL[4]); }
  // (the frame: the posts at its two sides (the near one lit), the cap over it)
  wallQuad(c, eye, top - 6, fl, DN, DN + 0.05, TIMB[3]); wallQuad(c, eye, top - 6, fl, DN + 0.04, DN + 0.05, TIMB[5]);
  wallQuad(c, eye, top - 6, fl, DF - 0.05, DF, TIMB[1]);
  wallQuad(c, eye, top - 12, top - 4, DF - 0.07, DN + 0.07, TIMB[3]); wallQuad(c, eye, top - 6, top - 4, DF - 0.07, DN + 0.07, TIMB[5]);
  // (the boards: one nailed across its top, one torn off at the near end and hanging down)
  const board = (y0: number, d0: number, y1: number, d1: number, th: number) => {
    polyF(c, [onWall(eye, y0 - 1, d0), onWall(eye, y1 - 1, d1), onWall(eye, y1 + th + 1, d1), onWall(eye, y0 + th + 1, d0)], INK);
    polyF(c, [onWall(eye, y0, d0), onWall(eye, y1, d1), onWall(eye, y1 + th, d1), onWall(eye, y0 + th, d0)], TIMB[3]);
    polyF(c, [onWall(eye, y0, d0), onWall(eye, y1, d1), onWall(eye, y1 + 1, d1), onWall(eye, y0 + 1, d0)], TIMB[5]);
  };
  board(top + 4, DF - 0.04, top + 8, DN + 0.04, 8);
  board(top + 16, DF - 0.04, top + 46, DN - 0.06, 7);
};

/** The light beaming out of the mouth, across the shaft at the play plane (the plank, the stair's foot): the volume
 *  from the opening out to its far end, projected for the one eye; banded in three spreads and three lengths, a
 *  dithered skirt round it; two shafts through the gaps in the boards; dust drifting in it. Polygons each frame
 *  (cheap), no pixel work. */
const BEAM_L = 240;
const drawBeam = (c: Ctx, eye: Eye, f: number, k: number) => {
  if (k <= 0) return;
  const top = H(MOUTH.top), fl = H(MOUTH.floor), x0 = wallX(), sh = shimmer(f) * k;
  /** The beam's cross section at t (0 the mouth, 1 its far end), spread s (1 the whole, less nearer its core). */
  const corners = (t: number, s: number): [number, number][] => {
    const yc = fl - 30 + t * 42, dc = 1.0;
    const yt = top + 6 + t * 24, yb = fl - 2 + t * 60, dn = 1.08 + t * 0.08, df = 0.94 - t * 0.04;
    const x = x0 - t * BEAM_L, out: [number, number][] = [];
    for (const y of [yc + (yt - yc) * s, yc + (yb - yc) * s]) for (const d of [dc + (df - dc) * s, dc + (dn - dc) * s]) out.push(at(eye, x, y, d));
    return out;
  };
  const vol = (t0: number, t1: number, s: number) => hull([...corners(t0, s), ...corners(t1, s)]);
  const fill = (pts: [number, number][], style: string | CanvasPattern) => { c.fillStyle = style; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };
  c.save();
  // (its dithered skirt, then the bands: each spread nearer the core brighter, each length further out dimmer)
  c.globalAlpha = 0.3 * sh; fill(vol(0, 0.6, 1.15), checkerFill(c, '#FFD8A0', 0, 2));
  for (const [t0, t1, a] of [[0, 0.35, 1], [0.35, 0.7, 0.6], [0.7, 1, 0.3]] as const) {
    for (const [s, al] of [[1, 0.07], [0.6, 0.12], [0.3, 0.2]] as const) { c.globalAlpha = al * a * sh; fill(vol(t0, t1, s), '#FFD08A'); }
  }
  // (the two shafts through the gaps between the boards)
  for (const dy of [-50, -34]) {
    const pts: [number, number][] = [];
    for (const t of [0, 0.9]) { const x = x0 - t * BEAM_L, y = fl + dy + t * 50; for (const d of [0.97, 1.04 + t * 0.06]) { pts.push(at(eye, x, y - 1 - t * 5, d), at(eye, x, y + 1 + t * 5, d)); } }
    c.globalAlpha = 0.24 * sh; fill(hull(pts), '#FFF0C8');
  }
  // (dust in it: pink fairy dust and gold motes, drifting out and down, twinkling)
  c.globalAlpha = k;
  for (let i = 0; i < 16; i++) {
    const u = ((f * 0.35 + i * 19) % 140) / 140, x = x0 - 6 - u * BEAM_L * 0.85 + Math.sin(f * 0.04 + i * 1.7) * 5;
    const y = fl - 34 + hash(i * 3.1) * 40 + u * 60 + Math.sin(u * 6 + i) * 4, d = 0.92 + hash(i * 5.7) * 0.22;
    const [sx, sy] = at(eye, x, y, d), a = (u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85) * 0.9;
    c.fillStyle = i % 3 ? `rgba(249,168,212,${a.toFixed(2)})` : `rgba(255,236,160,${a.toFixed(2)})`;
    c.fillRect(Math.round(sx), Math.round(sy), 2, 2);
    if (i % 5 === 0 && (f + i * 7) % 40 < 12) { c.fillRect(Math.round(sx) - 2, Math.round(sy), 6, 1); c.fillRect(Math.round(sx), Math.round(sy) - 2, 1, 6); }
  }
  // (where it falls on the plank: its top lit warm)
  c.globalAlpha = 0.55 * sh; c.fillStyle = '#FFD890'; c.fillRect(R(LIP.a) - 3, H(LIP.top), LIP.b - LIP.a + 6, 2);
  c.globalAlpha = 0.25 * sh; c.fillRect(R(LIP.a) - 3, H(LIP.top) + 2, LIP.b - LIP.a + 6, 6);
  c.restore();
};
/** Where the beam's light falls on the shaft's far wall (depth GORGE_D): a warm wash, banded, brightest level with the
 *  mouth, fading up the wall to the shaft's rim (what's seen of it from the meadow, the rest behind the near ground). */
const drawSpill = (c: Ctx, eye: Eye, f: number, k: number) => {
  if (k <= 0) return;
  const x0 = wallX(), sh = shimmer(f) * k, cy = H(MOUTH.floor) - 20;
  const rect = (s: number): [number, number][] => {
    const a = x0 - 30 - BEAM_L * 0.85 * s, b = x0 - 4, t = cy - (cy - GY) * s - 4, bt = cy + 60 * s;
    return [at(eye, a, t, GORGE_D), at(eye, b, t, GORGE_D), at(eye, b, bt, GORGE_D), at(eye, a, bt, GORGE_D)];
  };
  c.save();
  c.globalAlpha = 0.28 * sh; c.fillStyle = checkerFill(c, '#FFC880', 1, 2); c.beginPath(); rect(1.1).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
  for (const [s, a] of [[1, 0.07], [0.62, 0.09], [0.3, 0.12]] as const) { c.globalAlpha = a * sh; polyF(c, rect(s), '#FFC070'); }
  c.restore();
};
/** A convex hull (the beam's volume, projected). */
const hull = (pts: [number, number][]): [number, number][] => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [], up: [number, number][] = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};
/** The beam's strength: on whenever it's about (it's the tell: seen from the meadow and from across the shaft), gone
 *  as the cutaway comes up. */
const beamK = (state: GameState) => {
  const h = lairOf(state), cx = state.camera.x + CANVAS_WIDTH / 2;
  return Math.abs(cx - wallX()) < CANVAS_WIDTH * 1.2 ? 1 - h.reveal : 0;
};
const aditSeen = (state: GameState) => seen(state, R(LIP.a) - BEAM_L - 120, R(MOUTH.a) + 200, GY - 40, H(MOUTH.floor) + 160);

/** The plank (it stands out of the wall, in front of it). */
const drawPlank = (c: Ctx, eye: Eye) => {
  topBack(c, eye, R(LIP.a) - 3, R(LIP.b) + 3, H(LIP.top), 1, 0.9, TIMB);
  c.save(); c.translate(R(LIP.a) - 3, H(LIP.top)); stamp(c, 'fy-ben-plank', -4, -4, LIP.b - LIP.a + 18, 34, paintPlank); c.restore();
};
/** Before the meadow's near ground (art.ts drawGlenBack), with the eye past the wall (the meadow's ground in front of
 *  the shaft there): the plank and the beam, so that ground covers what of them it's in front of. */
export const drawAditUnder = (c: Ctx, state: GameState) => {
  if (!aditSeen(state)) return;
  const v = viewOf(state);
  if (v.eye.x < wallX() - 1) return;
  drawSpill(c, v.eye, state.frame, beamK(state));
  drawPlank(c, v.eye);
  drawBeam(c, v.eye, state.frame, beamK(state));
};
/** After the shaft's side walls (art.ts drawGlenBack; the stairs go over it), with the eye out over the shaft (the
 *  wall's face in view): the mouth on the wall, the plank out of it, the beam over the shaft. */
export const drawAditOver = (c: Ctx, state: GameState) => {
  if (!aditSeen(state)) return;
  const v = viewOf(state), h = lairOf(state);
  if (v.eye.x >= wallX() - 1) return;
  drawSpill(c, v.eye, state.frame, beamK(state));
  if (h.reveal < 1) { c.save(); c.globalAlpha = 1 - h.reveal; drawMouth(c, v.eye, state.frame); c.restore(); }
  drawPlank(c, v.eye);
  drawBeam(c, v.eye, state.frame, beamK(state));
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A caged bulb's light falling under it (live): a cone opening down from the bulb at (x, y), w wide at its foot h
 *  below, in three bands stepping down toward its edge and its foot, a dithered skirt round them (a flat rectangle of
 *  light read as a pale box down the post). Six fills. */
const bulbGlow = (c: Ctx, x: number, y: number, w: number, h: number, a: number) => {
  const cone = (s: number, l: number): [number, number][] => [[x - 3, y], [x + 3, y], [x + (w / 2) * s, y + h * l], [x - (w / 2) * s, y + h * l]];
  c.save();
  c.globalAlpha = a * 0.7; c.fillStyle = checkerFill(c, '#FFECAA', 0, PIX); c.beginPath(); cone(1.2, 1.1).forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.fill();
  for (const [s, l] of [[1, 1], [0.66, 0.75], [0.36, 0.5]] as const) { c.globalAlpha = a * 0.45; polyF(c, cone(s, l), '#FFECAA'); }
  c.restore();
};

/** Behind him: the adit's mouth on the shaft's wall and the light out of it (the tell), the trapdoor up top; under the
 *  ground (once he's in): the earth in cross section, the tunnel, the room, its live lights, the cannon, Ben; the
 *  meadow's near ground over it till then. */
export const drawLairBack = (c: Ctx, state: GameState) => {
  const f = state.frame, h = lairOf(state);
  // The trapdoor in the lair's floor up top (banged open a moment as he comes out of it)
  if (seen(state, R(TRAPDOOR_RX) - 40, R(TRAPDOOR_RX) + 40, GY - 60, GY + 20)) {
    const open = f - h.hatchAt < 40;
    c.save(); c.translate(R(TRAPDOOR_RX), GY); stamp(c, `fy-ben-trap-${open}`, -26, -44, 52, 54, g => paintTrapdoor(g, open)); c.restore();
  }
  // Under the ground
  if (h.reveal <= 0) return;
  // (the sun's lens ghosts fade out while the cutaway's up: its discs and ring strung across the screen read as pale
  // rings of light on the rock, the owner's "banding problem when entering the cave")
  sunBehind(c, () => true);
  const L = Math.max(R(MOUTH.a), state.camera.x - 40), Rr = Math.min(R(CUT_B), state.camera.x + CANVAS_WIDTH + 40);
  const T = Math.max(CUT_TOP, state.camera.y - 40), B = Math.min(CUT_BOT, state.camera.y + CANVAS_HEIGHT + 40);
  if (Rr <= L || B <= T) return;
  // (the still art, in tiles)
  const ox = R(MOUTH.a), oy = CUT_TOP;
  for (let ty = Math.floor((T - oy) / TILE); ty * TILE + oy < B; ty++) for (let tx = Math.floor((L - ox) / TILE); tx * TILE + ox < Rr; tx++) {
    const x = ox + tx * TILE, y = oy + ty * TILE;
    const w = Math.min(TILE, R(CUT_B) - x), hh = Math.min(TILE, CUT_BOT - y);
    if (w <= 0 || hh <= 0) continue;
    stamp(c, `fy-ben-under4-${tx}-${ty}`, x, y, w, hh, g => { g.save(); g.beginPath(); g.rect(x, y, w, hh); g.clip(); paintUnder(g); g.restore(); });
  }
  // (the live bits: the tunnel's bulbs flickering, the dragon's eye, the desk's button, the pilots, the fog off the drum)
  for (let rx = TUN.a + 60, i = 0; rx < TUN.b; rx += 220, i++) {
    const on = !(i === 2 && f % 140 < 9) && !(i === 4 && (f % 97 < 4 || f % 97 === 11));
    if (on) { bulbGlow(c, R(rx), H(TUN.top) + 41, 36, 60, 0.18); c.fillStyle = '#FFF8D8'; c.fillRect(R(rx) - 2, H(TUN.top) + 41, 4, 3); }
  }
  // (the incline's work lamps, the adit's lantern flame, the drips off the roof (each a drop falling, a ring on its
  // puddle as it lands))
  for (const b of INCLINE_BULBS) { bulbGlow(c, R(b.rx), H(b.top) + 23, 30, 44, 0.16); c.fillStyle = '#FFF8D8'; c.fillRect(R(b.rx) - 2, H(b.top) + 23, 4, 3); }
  { const fl = (f >> 3) % 3; c.fillStyle = fl ? '#FFD060' : '#FFF0A0'; c.fillRect(R(MOUTH.a + 108) + 9, H(MOUTH.top) + 19 + (fl === 2 ? 1 : 0), 3, 4); }
  DRIPS.forEach((d, i) => {
    const per = 70 + i * 13, t = (f + i * 29) % per, fall = H(d.floor) - H(d.top) - 6;
    const y = H(d.top) + 6 + Math.min(fall, 0.05 * t * t);
    if (y < H(d.floor) - 2) { c.fillStyle = '#A8C0E0'; c.fillRect(R(d.rx), Math.round(y), 1, 3); }
    else if (t < Math.sqrt(fall / 0.05) + 10) { c.fillStyle = 'rgba(200,215,240,0.6)'; c.fillRect(R(d.rx) - 4, H(d.floor) - 3, 9, 1); }
  });
  const ro = R(ROOM.a), fo = H(FLOOR);
  if (seen(state, ro, R(ROOM.b), H(ROOM.top), fo)) {
    const pulse = 0.6 + 0.4 * Math.sin(f * 0.08);
    c.fillStyle = `rgba(255,40,30,${(0.5 + 0.4 * pulse).toFixed(2)})`; c.fillRect(ro + HEAD_LX + 16, fo - 96, 12, 8);
    c.fillStyle = '#FFD0C0'; c.fillRect(ro + HEAD_LX + 19, fo - 94, 4, 3);
    if (f % 50 < 25) { c.fillStyle = '#FF4A3A'; c.fillRect(ro + DESK_LX + 54, fo - 50, 6, 6); }
    for (const px of [PLUMB_LX + 70, PLUMB_LX + 100, PLUMB_LX + 130]) { const fl = (f + px) % 7 < 3 ? 1 : 0; c.fillStyle = '#3A8AFF'; c.fillRect(ro + px + 1, fo - 52 - fl, 4, 4 + fl); c.fillStyle = '#C8E8FF'; c.fillRect(ro + px + 2, fo - 50, 2, 2); }
    for (let i = 0; i < 6; i++) {
      const u = ((f * 0.25 + i * 41) % 240) / 240, x = ro + PLUMB_LX + 175 + Math.sin(f * 0.02 + i) * 20 + u * 60, y = fo - 6 - u * 30;
      c.fillStyle = `rgba(210,215,240,${(0.22 * Math.sin(u * Math.PI)).toFixed(2)})`; c.fillRect(Math.round(x) - 18, Math.round(y) - 5, 36, 10);
    }
    // (the hot plate's coil under the cauldron, its steam; the gooseneck lamp's bulb)
    const on = 0.6 + 0.4 * Math.sin(f * 0.11);
    c.fillStyle = `rgba(248,113,62,${on.toFixed(2)})`; c.fillRect(ro + 8, fo - 57, 8, 1); c.fillRect(ro + 30, fo - 57, 8, 1);
    for (let i = 0; i < 3; i++) { const u = ((f * 0.45 + i * 33) % 100) / 100; c.fillStyle = `rgba(190,230,170,${(0.32 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(ro + 20 + Math.sin(f * 0.05 + i * 2) * 4), Math.round(fo - 86 - u * 40), Math.round(3 + u * 4), Math.round(3 + u * 4)); }
  }
  drawCannon(c, h.cannon, FAIRY);
  drawCannonChain(c, h.cannon, gateK(state, h.gate));
  drawGate(c, state, h.gate, 'shields');
  if (seen(state, ro, R(ROOM.b), H(ROOM.top), fo)) { const b = h.ben, at = benAt(); drawBen(c, at.x, at.y, b.facing, b.pose, Math.floor(b.poseT / 5), b.piece); }
  // The meadow's near ground over it till he's in (fading out as he goes in)
  if (h.reveal < 1) { c.save(); c.globalAlpha = 1 - h.reveal; box(c, L, T, Rr - L, B - T, '#4E7A3A'); c.restore(); }
};

/** In front of him: Ben's words over his head (only while said; not while his gross-up has them). */
export const drawLairFront = (c: Ctx, state: GameState) => {
  const h = lairOf(state);
  // (the nearest I-beam and its gussets in front, as the room comes into view)
  const ro = R(ROOM.a), fo = H(FLOOR);
  if (h.reveal > 0 && seen(state, ro - 30, R(ROOM.b) + 30, fo - RH - 20, fo - RH + 70)) {
    c.save(); c.globalAlpha = h.reveal; c.translate(ro, fo); stamp(c, 'fy-ben-near', -26, -RH - 18, W + 52, 80, paintRoomNear); c.restore();
  }
  if (h.reveal < 0.5 || !h.ben.said || h.script?.gross) return;
  const at = benAt();
  saidOver(c, h.ben.said.text, at.x, benHeadY(at.y), '#FFFFFF', 220);
};

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawLairHud = (c: Ctx, state: GameState) => {
  if (!inRoom(state)) return;
  const h = lairOf(state), sc = h.script;
  if ((h.phase === 'meet' || h.phase === 'gift') && sc?.gross) {
    drawBenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, h.phase === 'meet' ? 'amulet' : null, !!h.ben.said);
    if (h.ben.said) saidOver(c, h.ben.said.text, CANVAS_WIDTH / 2 - 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The glen's light, and the lair's: under the ground, its own dark (deep, a cold violet), the bulbs' warm pools down the
 *  tunnel, the room's eye red and pilots blue, a glow about him; over the shaft, a soft warm light where the beam out
 *  of the adit falls on the plank (the tell). */
export const lairLighting = (base: SceneLight | null, state: GameState): SceneLight | null => {
  const h = lairOf(state), f = state.frame, p = state.player;
  const k = beamK(state);
  if (!underView(state) && k <= 0) return base;
  const lights: Light[] = [...(base?.lights ?? [])];
  if (k > 0) lights.push({ x: R(MOUTH.a) - 60, y: H(MOUTH.floor) - 16, r: 110, a: 0.45 * k, color: 'rgba(255,190,110,0.10)' });
  if (!underView(state)) return { ...(base ?? { dark: 0.3 }), lights };
  const r = h.reveal;
  for (const b of INCLINE_BULBS) lights.push({ x: R(b.rx), y: H(b.top) + 26, r: 130, a: 0.6 * r, color: 'rgba(255,220,150,0.10)' });
  for (let rx = TUN.a + 60, i = 0; rx < TUN.b; rx += 220, i++) {
    const on = !(i === 2 && f % 140 < 9) && !(i === 4 && (f % 97 < 4 || f % 97 === 11));
    if (on) lights.push({ x: R(rx), y: H(TUN.top) + 44, r: 150, a: 0.7 * r, color: 'rgba(255,220,150,0.10)' });
  }
  lights.push({ x: R(MOUTH.a) + 80, y: H(MOUTH.floor) - 40, r: 120, a: 0.4 * r, color: 'rgba(255,170,90,0.10)' });
  const ro = R(ROOM.a), fo = H(FLOOR);
  lights.push({ x: ro + HEAD_LX + 22, y: fo - 92, r: 130, a: (0.55 + 0.2 * Math.sin(f * 0.08)) * r, color: 'rgba(255,60,40,0.14)' });
  lights.push({ x: ro + PLUMB_LX + 100, y: fo - 50, r: 110, a: 0.6 * r, color: 'rgba(80,150,255,0.14)' });
  for (const lx of [300, 560, 820]) lights.push({ x: ro + lx, y: fo - RH + 40, r: 230, cone: 70, a: 0.55 * r, color: 'rgba(255,230,180,0.08)' });
  lights.push({ x: ro + CANNON_LX, y: fo - RH + 10, r: 90, a: 0.4 * r, color: 'rgba(230,220,255,0.10)' });
  lights.push({ x: ro + 552, y: fo - 70, r: 90, a: 0.5 * r, color: 'rgba(255,240,190,0.12)' });
  lights.push({ x: ro + 24, y: fo - 60, r: 70, a: 0.45 * r, color: 'rgba(248,113,62,0.12)' });
  lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 140, a: 0.35 * r });
  return { ...(base ?? { dark: 0.4 }), dark: 0.4 + 0.22 * r, shade: [14, 8, 24], grade: undefined, lights };
};

/** Where the meadow's near ground is cut off at the shaft's wall (screen x), while the cutaway's up, or null. It's the
 *  ground in front of the play plane, and the cutaway's a section through the play plane: bent (fanned out from the
 *  eye), its end past the wall stuck out over the shaft as a slanted green wedge between the stairs and the adit. Cut
 *  there, what shows past the wall is the shaft behind, the same as the rest of the shaft. */
export const nearGroundCut = (state: GameState) => (lairOf(state).reveal >= 0.5 ? R(MOUTH.a) : null);

/** For a still look (the contact sheet): the whole room painted at once at (0, 0) = its floor's left end. */
export const paintLairRoom = (g: Ctx) => paintRoom(g);
export { paintRoomNear as paintLairNear };
export { paintUnder as paintLairUnder };
