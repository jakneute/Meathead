// The GRAND BALLROOM, painted: a theme park's idea of a vampire's ballroom, rented out for a wedding. Purple flock
// damask (raised ogee medallions with a sheen), gold-painted plastic pilasters (fluted, acanthus capitals, the paint
// kicked off their plinths), a cornice of egg-and-dart over dentils, red velvet swags with bullion fringe, jabots and
// tassels; a gilt mirror, plastic candle sconces dripping crystals, a portrait of somebody's idea of a count under a
// picture light; raised-panel wainscoting. The buffet (draped cloth, chafing dishes, the punch bowl, the cake with a
// slice already gone) and the DJ's table against the back wall; plastic crystal chandeliers (stood on), a disco ball,
// fog machines, gold chiavari chairs, the bandstand's riser (plank top, pleated velvet skirt, footlights, a drum kit); a
// light-up dance floor; a coffered ceiling. The room's two ends show their near sides going back (paint.ts's light
// fake 3D): the foyer's arch in the left one, the kitchen's swing doors in the right one, where the guests run through;
// past the stage's wall, the proscenium and its curtain.
//
// Still things are stamped (painted once); live each frame only: the ceiling's coffers, the floor's tiles and the
// riser's top (a handful of batched quads each: they go back to the eye), the floor's lights, the crystals' glints,
// the candle flames, the disco ball's sparkles and spots, the fog.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import {
  INK, box, slab, pole, ball, rampOf, mix, checker, hazeBands, stamp, hash, pixelBlob, steppedGlow, bandedGradient,
  WALL_D, CEIL, eyeOf, inDepth, at, quad, seg, inked, standTop, wallRun, ceiling, spanAt, type Eye, type P,
} from '../control/paint';
import { type Passage, passageBack, passageSide, passageFront, passageLintel } from '../control/passage';
import { rockWall } from '../control/shopArt';
import { drawBallDoors } from '../control/ballDoors';
import { pitLights } from './pit';
import { x0, ARENA_L, ARENA_R, ARENA_MID, CIRCLE_X, CHANDELIERS, RISER } from './arena';
import { signAt, signW, haunt, print, candle, blood } from '../letters';
import { bust, drawBust, SKIN, HAIR, CLOTH, IRIS, type BustSpec } from '../../grossBust';

/** Somebody's idea of a count: deathly, a widow's peak slicked back, a high collar, bloodshot, grinning. */
const COUNT: BustSpec = { seed: 777, skin: SKIN.ghoul, hair: 'slick', hairRamp: HAIR.black, iris: IRIS.yellow, sclera: 'red', mouth: 'grin', coat: CLOTH.black, extras: ['ruff', 'mole', 'drool'], tall: 1.1, wide: 0.9, nose: 1.15, bulge: 1.25 };

type Ctx = CanvasRenderingContext2D;

const GOLD = '#CA8A04', VELVET = '#8E1414';
/** Gilt, dark to lit (7 steps); the velvet's (6); the flock's (7); purple satin (6); pink satin (6); the stage's boards. */
const GILT = ['#3A2206', '#6B4410', '#966A0C', '#BE8A0A', '#DDA912', '#F5CF3A', '#FEF0A8'];
const VR = ['#3A0606', '#5C0A0A', '#8E1414', '#B42020', '#D63A30', '#EE6A55'];
const FL = ['#1A0530', '#26073F', '#3B0764', '#4C1D95', '#5B21B6', '#7C3AED', '#A78BFA'];
const PU = ['#2E0A4A', '#4C1D95', '#6B21A8', '#8B3FC8', '#A855F7', '#C084FC'];
const PK = ['#500724', '#831843', '#BE185D', '#DB2777', '#EC4899', '#F9A8D4'];
const WOOD = ['#2A1608', '#4A2A12', '#6B421E', '#8A5A2B', '#A87440', '#C8935A'];
const CLOTHS = ['#8C857A', '#B5AE9F', '#D9D3C6', '#EEEAE0', '#FBF9F4'];
const CHROME = ['#3F3F46', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];
/** The room's ends at his plane: the left (the gate's line) and the stage's wall. */
const END_L = ARENA_L - 30, END_R = ARENA_R;
/** The doorway he kicked in, at the far left (seen before the fight). */
const DOOR_X = x0 + 30;

// ---------------------------------------------------------------------------------------------------------------
// The kit's ornaments (all painted into stamps)

/** A molding's profile: rows of [color, height] down from y; returns the y under it. */
const profile = (g: Ctx, x: number, y: number, w: number, rows: [string, number][]) => { for (const [col, h] of rows) { box(g, x, y, w, h, col); y += h; } return y; };
const fillPath = (g: Ctx, col: string, path: () => void) => { g.fillStyle = col; g.beginPath(); path(); g.fill(); };
/** A row of gilt beads (3 tall). */
const beads = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x, y, w, 3, GILT[1]);
  for (let k = x + 1; k < x + w - 1; k += 3) { box(g, k, y, 2, 2, GILT[4]); box(g, k, y, 1, 1, GILT[6]); box(g, k + 1, y + 1, 1, 1, GILT[2]); }
};
/** Egg-and-dart: stepped eggs in their sockets, a lit dart between. */
const eggDart = (g: Ctx, x: number, y: number, w: number, h = 8) => {
  box(g, x, y, w, h, GILT[1]); box(g, x, y, w, 1, GILT[5]); box(g, x, y + h - 1, w, 1, GILT[0]);
  for (let k = x + 1; k < x + w - 6; k += 8) {
    box(g, k, y + 1, 6, h - 2, GILT[0]);
    box(g, k + 1, y + 2, 4, h - 4, GILT[3]); box(g, k + 1, y + 2, 2, 1, GILT[6]); box(g, k + 1, y + 3, 1, h - 6, GILT[5]); box(g, k + 4, y + 3, 1, h - 5, GILT[2]);
    box(g, k + 7, y + 2, 1, h - 4, GILT[5]);
  }
};
/** Dentils: little blocks in a row, lit on top, shadowed down the right. */
const dentils = (g: Ctx, x: number, y: number, w: number, h = 5) => {
  box(g, x, y, w, h, FL[0]);
  for (let k = x; k < x + w; k += 6) { box(g, k, y, 4, h, FL[3]); box(g, k, y, 4, 1, FL[5]); box(g, k + 3, y + 1, 1, h - 1, FL[1]); }
};
/** A gilt rosette: a stepped boss with four petals. */
const rosette = (g: Ctx, cx: number, cy: number, r: number) => {
  for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r]]) { box(g, cx + dx - 1.5, cy + dy - 1.5, 3, 3, INK); box(g, cx + dx - 1, cy + dy - 1, 2, 2, GILT[4]); }
  ball(g, cx, cy, r * 0.75, GILT[3]);
};
/** A carved gilt frame `t` thick: moldings stepping in (lit top and left, shaded bottom and right), a bead run, an ink
 *  line round the opening, rosettes at the corners. */
const giltFrame = (g: Ctx, x: number, y: number, w: number, h: number, t = 9) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  const IDX = [1, 4, 3, 2, 1, 5, 4, 2, 1, 3, 0];
  for (let i = 0; i < t; i++) {
    const k = IDX[i % IDX.length], xi = x + i, yi = y + i, wi = w - 2 * i, hi = h - 2 * i;
    const lt = GILT[Math.min(6, k + 1)], dk = GILT[Math.max(0, k - 1)];
    box(g, xi, yi, wi, 1, lt); box(g, xi, yi, 1, hi, lt); box(g, xi, yi + hi - 1, wi, 1, dk); box(g, xi + wi - 1, yi, 1, hi, dk);
  }
  // (a run of beads round the outer ridge)
  for (let k = x + 6; k < x + w - 6; k += 4) { box(g, k, y + 2, 2, 2, GILT[5]); box(g, k, y + h - 4, 2, 2, GILT[3]); }
  for (let k = y + 6; k < y + h - 6; k += 4) { box(g, x + 2, k, 2, 2, GILT[5]); box(g, x + w - 4, k, 2, 2, GILT[3]); }
  box(g, x + t - 1, y + t - 1, w - 2 * t + 2, 1, INK); box(g, x + t - 1, y + t - 1, 1, h - 2 * t + 2, INK);
  box(g, x + t - 1, y + h - t, w - 2 * t + 2, 1, INK); box(g, x + w - t, y + t - 1, 1, h - 2 * t + 2, INK);
  for (const [cx, cy] of [[x + 4, y + 4], [x + w - 4, y + 4], [x + 4, y + h - 4], [x + w - 4, y + h - 4]]) rosette(g, cx, cy, 4);
};
/** A carved shell crest standing on y: fanned ribs, alternately lit, a scroll either side. */
const crest = (g: Ctx, cx: number, y: number, w: number) => {
  const r = w / 2, n = 7;
  inked(g, () => { g.moveTo(cx - r, y); g.arc(cx, y, r, Math.PI, 0); g.closePath(); }, GILT[2], 2);
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI;
    fillPath(g, i % 2 ? GILT[3] : GILT[4], () => { g.moveTo(cx, y); g.arc(cx, y, r - 2, a0 + 0.04, a1 - 0.04); g.closePath(); });
  }
  fillPath(g, GILT[5], () => { g.moveTo(cx, y); g.arc(cx, y, r * 0.45, Math.PI * 1.15, Math.PI * 1.55); g.closePath(); });
  ball(g, cx, y - 1, 3, GILT[4]);
  for (const s of [-1, 1]) { ball(g, cx + s * (r + 3), y - 2, 3, GILT[3]); box(g, cx + s * (r + 3) - 1, y - 3, 1, 1, INK); }
};
/** An acanthus leaf: a stepped tongue, its tip curling over. */
const leaf = (g: Ctx, x: number, y: number, w: number, h: number) => {
  inked(g, () => { g.moveTo(x, y + h); g.quadraticCurveTo(x - 1, y + 2, x + w / 2, y); g.quadraticCurveTo(x + w + 1, y + 2, x + w, y + h); g.closePath(); }, GILT[3], 1);
  box(g, x + 1, y + 2, 1, h - 3, GILT[5]); box(g, x + w / 2, y + 3, 1, h - 4, GILT[1]); box(g, x + w - 2, y + 4, 1, h - 5, GILT[2]);
  box(g, x + w / 2 - 1, y, 2, 2, GILT[6]);
};
/** A tassel hung at (x, y): cord, a stepped knob, a waist, a skirt of strands. */
const tassel = (g: Ctx, x: number, y: number, len = 14) => {
  box(g, x, y, 1, 4, GILT[2]);
  ball(g, x + 0.5, y + 6, 3, GILT[4]);
  inked(g, () => { g.moveTo(x - 2, y + 10); g.lineTo(x - 4, y + 11 + len); g.lineTo(x + 5, y + 11 + len); g.lineTo(x + 3, y + 10); g.closePath(); }, GILT[2], 1);
  for (let i = 0; i < 8; i++) box(g, x - 3 + i, y + 11 + (i % 2), 1, len - 1 - (i % 2), [GILT[2], GILT[4], GILT[3], GILT[5]][i % 4]);
  box(g, x - 3, y + 9, 7, 2, INK); box(g, x - 2, y + 9, 5, 1, GILT[5]);
};
/** A crystal prism hung from (x, y): a lit facet and a shaded one, a glint. */
const prism = (g: Ctx, x: number, y: number, len = 7) => {
  fillPath(g, '#0C3B5E', () => { g.moveTo(x, y - 1); g.lineTo(x + 3, y + 3); g.lineTo(x, y + len + 1); g.lineTo(x - 3, y + 3); g.closePath(); });
  fillPath(g, '#E0F2FE', () => { g.moveTo(x, y); g.lineTo(x, y + len); g.lineTo(x - 2, y + 3); g.closePath(); });
  fillPath(g, '#38BDF8', () => { g.moveTo(x, y); g.lineTo(x + 2, y + 3); g.lineTo(x, y + len); g.closePath(); });
  box(g, x - 1, y + 2, 1, 1, '#FFFFFF');
};

/**
 * A velvet swag from xa to xb hung at y, `thick` deep, sagging: its folds banded along it (crests lit, troughs dark),
 * a gold braid and bullion fringe along its lower edge. `R` its ramp (6 steps).
 */
const swag = (g: Ctx, xa: number, xb: number, y: number, sag: number, R = VR, thick = 16, fringe = 6) => {
  const mid = (xa + xb) / 2;
  const curve = (t: number) => { g.moveTo(xa, y + thick * t); g.quadraticCurveTo(mid, y + thick * t + sag * (2 + 0.3 * t), xb, y + thick * t); };
  const body = () => { g.moveTo(xa, y); g.quadraticCurveTo(mid, y + sag * 2, xb, y); g.lineTo(xb, y + thick); g.quadraticCurveTo(mid, y + thick + sag * 2.3, xa, y + thick); g.closePath(); };
  inked(g, body, R[1], 2);
  g.save(); g.beginPath(); body(); g.clip();
  const k = thick / 16;
  for (const [t, col, lw] of [[0.1, R[3], 4], [0.18, R[4], 1.5], [0.34, R[2], 3], [0.47, R[0], 2], [0.6, R[2], 4], [0.67, R[3], 2], [0.73, R[5], 1], [0.86, R[1], 3], [0.96, R[0], 2]] as const) {
    g.strokeStyle = col; g.lineWidth = lw * k; g.beginPath(); curve(t); g.stroke();
  }
  g.restore();
  // (the braid, then the fringe hanging off it)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); curve(1); g.stroke();
  g.strokeStyle = GILT[3]; g.lineWidth = 2; g.beginPath(); curve(1); g.stroke();
  const n = Math.max(4, Math.round((xb - xa) / 2));
  for (let i = 0; i <= n; i++) {
    const s = i / n, px = xa + (xb - xa) * s, py = y + thick + 2 * (1 - s) * s * sag * 2.3;
    box(g, px, py + 1, 1, fringe + (i % 3 === 0 ? 1 : 0), [GILT[3], GILT[5], GILT[2]][i % 3]);
  }
};
/** A jabot: a pleated tail falling from a gather at (x, y), longest on the outside (`out` -1 its left, 1 its right). */
const jabot = (g: Ctx, x: number, y: number, len: number, out: -1 | 1, R = VR) => {
  const cols = [R[3], R[4], R[2], R[1]];
  for (let p = 0; p < 4; p++) {
    const px = out > 0 ? x + p * 4 : x - (p + 1) * 4, l0 = len * (0.45 + 0.55 * (p / 3));
    for (let c = 0; c < 4; c++) {
      const l = l0 + (out > 0 ? c : 3 - c) * 1.5;
      box(g, px + c, y, 1, l, cols[c]);
      box(g, px + c, y + l, 1, 4 + ((p + c) % 2), c % 2 ? GILT[5] : GILT[3]);
    }
    box(g, px, y, 1, l0, INK);
  }
  box(g, out > 0 ? x + 16 : x - 17, y, 1, len + 4, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The back wall (a tile: 200 wide, a pilaster at its left)

/** One ogee medallion's outline. */
const ogee = (g: Ctx, cx: number, cy: number, a: number, b: number) => {
  g.moveTo(cx, cy - b);
  g.bezierCurveTo(cx + a * 0.25, cy - b * 0.55, cx + a, cy - b * 0.45, cx + a, cy);
  g.bezierCurveTo(cx + a, cy + b * 0.45, cx + a * 0.25, cy + b * 0.55, cx, cy + b);
  g.bezierCurveTo(cx - a * 0.25, cy + b * 0.55, cx - a, cy + b * 0.45, cx - a, cy);
  g.bezierCurveTo(cx - a, cy - b * 0.45, cx - a * 0.25, cy - b * 0.55, cx, cy - b);
  g.closePath();
};
/** Flock damask over (x, y, w, h): raised ogees (lit up-left, shadowed down-right) round a fleur, lozenges between,
 *  the nap dithered; a sheen down the middle of the bay. */
const damask = (g: Ctx, x: number, y: number, w: number, h: number, sheen = true) => {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  box(g, x, y, w, h, FL[2]);
  checker(g, x, y, w, h, 'rgba(26, 5, 48, 0.22)');
  for (let row = -1; row * 36 < h + 36; row++) for (let col = -1; col * 50 < w + 50; col++) {
    const cx = x + col * 50 + 25 + (row % 2 ? 25 : 0), cy = y + row * 36 + 18;
    fillPath(g, FL[0], () => ogee(g, cx + 1, cy + 1, 14, 20));
    fillPath(g, FL[5], () => ogee(g, cx - 1, cy - 1, 14, 20));
    fillPath(g, FL[3], () => ogee(g, cx, cy, 14, 20));
    fillPath(g, FL[2], () => ogee(g, cx, cy + 1, 9, 13));
    fillPath(g, FL[3], () => { g.moveTo(cx, cy - 10); g.quadraticCurveTo(cx + 5, cy - 1, cx, cy + 7); g.quadraticCurveTo(cx - 5, cy - 1, cx, cy - 10); });
    box(g, cx - 1, cy - 7, 1, 8, FL[5]); box(g, cx + 1, cy - 3, 1, 7, FL[1]);
    box(g, cx - 7, cy + 2, 3, 3, FL[3]); box(g, cx + 4, cy + 2, 3, 3, FL[3]); box(g, cx - 7, cy + 2, 1, 1, FL[5]); box(g, cx + 4, cy + 2, 1, 1, FL[5]);
    box(g, cx - 4, cy + 8, 8, 2, FL[3]); box(g, cx - 4, cy + 8, 8, 1, FL[4]);
    const dx = cx + 25;
    fillPath(g, FL[3], () => { g.moveTo(dx, cy - 6); g.lineTo(dx + 4, cy); g.lineTo(dx, cy + 6); g.lineTo(dx - 4, cy); g.closePath(); });
    box(g, dx - 1, cy - 2, 1, 2, FL[5]);
  }
  if (sheen) for (const [dx, ww, a] of [[56, 88, 0.045], [74, 52, 0.045], [90, 20, 0.04]] as const) { g.fillStyle = `rgba(196, 181, 253, ${a})`; g.fillRect(x + dx, y, ww, h); }
  g.restore();
};

/** A raised panel in the wainscot: a gilt bead molding round a beveled field. */
const panel = (g: Ctx, x: number, y: number, w: number, h: number) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, GILT[2]); box(g, x, y, w, 1, GILT[5]); box(g, x, y, 1, h, GILT[4]); box(g, x, y + h - 1, w, 1, GILT[0]); box(g, x + w - 1, y, 1, h, GILT[1]);
  const fx = x + 2, fy = y + 2, fw = w - 4, fh = h - 4;
  box(g, fx, fy, fw, fh, FL[1]);
  for (let i = 0; i < 4; i++) {
    box(g, fx + i, fy + i, fw - 2 * i, 1, FL[4]); box(g, fx + i, fy + i, 1, fh - 2 * i, FL[3]);
    box(g, fx + i, fy + fh - 1 - i, fw - 2 * i, 1, FL[0]); box(g, fx + fw - 1 - i, fy + i, 1, fh - 2 * i, FL[1]);
  }
  box(g, fx + 4, fy + 4, fw - 8, fh - 8, FL[2]);
  checker(g, fx + 4, fy + 4, fw - 8, 2, FL[3]);
  checker(g, fx + 4, fy + fh - 6, fw - 8, 2, FL[1], 1);
  rosette(g, x + w / 2, y + h / 2, 3);
};
const wainscot = (g: Ctx, x: number, w: number) => {
  box(g, x, GY - 118, w, 118, FL[1]);
  profile(g, x, GY - 120, w, [[INK, 1], [GILT[5], 1], [GILT[4], 1], [GILT[3], 2], [GILT[1], 1], [INK, 1]]);
  beads(g, x, GY - 113, w);
  box(g, x, GY - 110, w, 2, FL[0]);
  for (let k = 0; k < 4; k++) panel(g, x + 30 + k * 43, GY - 100, 34, 78);
  profile(g, x, GY - 16, w, [[INK, 1], [GILT[4], 1], [GILT[2], 1], [INK, 1]]);
  box(g, x, GY - 12, w, 12, FL[0]); box(g, x, GY - 12, w, 1, FL[2]); checker(g, x, GY - 5, w, 2, '#0E0418'); box(g, x, GY - 3, w, 3, '#0E0418');
};
/** The cornice under the ceiling: a lit fillet, egg-and-dart, dentils. */
const cornice = (g: Ctx, x: number, w: number) => {
  profile(g, x, CEIL, w, [[INK, 1], [GILT[5], 1], [GILT[3], 1]]);
  eggDart(g, x, CEIL + 3, w);
  dentils(g, x, CEIL + 11, w);
  profile(g, x, CEIL + 16, w, [[GILT[1], 1], [INK, 1]]);
  box(g, x, CEIL + 18, w, 3, 'rgba(10, 3, 18, 0.45)');
};
/** A gold-painted plastic pilaster at x (20 wide): fluted, an acanthus capital with volutes, a torus base on a plinth
 *  (the paint kicked off it), a scuff at shin height. */
const pilaster = (g: Ctx, x: number) => {
  const top = CEIL + 22, foot = GY - 26;
  pole(g, x, top, 20, foot - top, GILT[3]);
  for (const fx of [x + 4, x + 9, x + 14]) {
    box(g, fx, top + 32, 2, foot - top - 42, GILT[1]); box(g, fx, top + 31, 2, 1, GILT[0]); box(g, fx + 2, top + 32, 1, foot - top - 42, GILT[5]);
    box(g, fx, foot - 10, 2, 1, GILT[5]);
  }
  // (the capital: two rows of leaves, the volutes, the abacus; the necking under it)
  box(g, x - 2, top, 24, 22, GILT[1]);
  for (let i = 0; i < 4; i++) leaf(g, x - 3 + i * 6.5, top + 9, 6, 13);
  for (let i = 0; i < 3; i++) leaf(g, x + 0.5 + i * 6.5, top + 2, 6, 11);
  for (const vx of [x - 3, x + 23]) { ball(g, vx, top + 4, 3.5, GILT[4]); box(g, vx - 1, top + 3, 2, 2, GILT[1]); box(g, vx, top + 4, 1, 1, INK); }
  slab(g, x - 6, top - 4, 32, 6, GILT[4], { edge: 1 });
  profile(g, x - 1, top + 22, 22, [[INK, 1], [GILT[5], 1], [GILT[3], 2], [GILT[1], 1], [INK, 1]]);
  // (the base and plinth)
  profile(g, x - 3, foot, 26, [[INK, 1], [GILT[5], 1], [GILT[4], 2], [GILT[2], 1], [GILT[0], 1], [GILT[1], 1], [GILT[4], 1], [GILT[3], 2], [GILT[1], 1], [INK, 1]]);
  slab(g, x - 5, foot + 12, 30, GY - foot - 12, GILT[2], { edge: 2 });
  box(g, x + 16, GY - 10, 5, 3, '#E7E5E4'); box(g, x + 18, GY - 7, 3, 2, '#D6D3D1'); box(g, x - 3, GY - 5, 3, 2, '#E7E5E4');
  checker(g, x + 5, GY - 50, 9, 10, '#E7E5E4'); box(g, x + 7, GY - 47, 4, 3, '#D6D3D1');
};

/** A candle cup at (x, y): its drip pan, crystals off it, a plastic sleeve up from it, the flame bulb in a halo. */
const candleCup = (g: Ctx, x: number, y: number, h = 14) => {
  steppedGlow(g, x + 0.5, y - h - 7, 16, '#FDE68A', 0.4, 0.03, 4);
  prism(g, x - 5, y + 2); prism(g, x + 5, y + 2);
  slab(g, x - 6, y - 2, 12, 4, GILT[4], { edge: 1 });
  pole(g, x - 2, y - 2 - h, 5, h, '#EEEAE0');
  box(g, x - 2, y - 2 - h, 2, 5, '#FFFFFF'); box(g, x + 1, y - h + 1, 1, 4, '#D9D3C6');
  inked(g, () => { g.moveTo(x + 0.5, y - h - 13); g.quadraticCurveTo(x + 4, y - h - 6, x + 0.5, y - h - 2); g.quadraticCurveTo(x - 3, y - h - 6, x + 0.5, y - h - 13); }, '#FCD34D', 1);
  box(g, x - 1, y - h - 7, 2, 4, '#FEF3C7'); box(g, x, y - h - 6, 1, 2, '#FFFFFF');
};

/** v1: a mirror in a carved frame, the room dim in it (a chandelier, the dance floor's squares), a bevel, streaks. */
const paintMirror = (g: Ctx, x: number) => {
  const fx = x + 50, fy = GY - 330, fw = 100, fh = 196, t = 9;
  crest(g, fx + fw / 2, fy + 1, 36);
  giltFrame(g, fx, fy, fw, fh, t);
  const gx = fx + t, gy = fy + t, gw = fw - 2 * t, gh = fh - 2 * t;
  bandedGradient(g, gx, gy, gw, gh, ['#1E2238', '#353C5A', '#4A5474', '#5E6A84', '#6E7A94'], 10);
  // (the room in it: the far swags, a chandelier's glow, the floor's squares going round)
  for (let k = 0; k < gw; k += 12) { box(g, gx + k, gy + 10 + ((k / 12) % 2) * 2, 12, 3, '#5A2A3A'); }
  steppedGlow(g, gx + 24, gy + 48, 24, '#FDE68A', 0.22, 0.02, 4);
  box(g, gx + 14, gy + 46, 20, 3, '#B08A40'); for (let i = 0; i < 5; i++) box(g, gx + 15 + i * 4, gy + 49, 1, 4 + (i % 2) * 2, '#C7E4F2');
  const sq = ['#7A4A8A', '#3E5A9A', '#8A7A40', '#4A3A7A'];
  for (let k = 0; k < gw; k += 10) { box(g, gx + k, gy + gh - 18, 10, 18, sq[(k / 10) % 4]); box(g, gx + k, gy + gh - 18, 10, 1, '#8A94B0'); }
  checker(g, gx, gy + gh - 20, gw, 2, '#4A5474');
  // (the bevel round the glass, streaks of reflection, the silver going at the corners)
  box(g, gx, gy, gw, 2, '#9AA6C0'); box(g, gx, gy, 2, gh, '#8A96B0'); box(g, gx, gy + gh - 2, gw, 2, '#2A3048'); box(g, gx + gw - 2, gy, 2, gh, '#323A54');
  for (const [ox, wd, a] of [[16, 12, 0.18], [36, 6, 0.14]] as const) {
    g.fillStyle = `rgba(255, 255, 255, ${a})`; g.beginPath(); g.moveTo(gx + ox, gy + 2); g.lineTo(gx + ox + wd, gy + 2); g.lineTo(gx + 2, gy + 2 + (ox + wd) * 2.4); g.lineTo(gx + 2, gy + 2 + ox * 2.4); g.closePath(); g.fill();
  }
  for (let i = 0; i < 14; i++) { const cx = hash(i * 3.7) < 0.5 ? gx + 3 + hash(i) * 10 : gx + gw - 13 + hash(i) * 10, cy = hash(i * 1.9) < 0.5 ? gy + 3 + hash(i * 5.1) * 10 : gy + gh - 13 + hash(i * 5.1) * 10; box(g, cx, cy, 2, 1 + (i % 2), '#1A1E30'); }
  // (an apron scroll under it)
  inked(g, () => { g.moveTo(fx + 30, fy + fh); g.quadraticCurveTo(fx + fw / 2, fy + fh + 14, fx + fw - 30, fy + fh); g.closePath(); }, GILT[3], 2);
  box(g, fx + 40, fy + fh + 1, 20, 1, GILT[5]); rosette(g, fx + fw / 2, fy + fh + 5, 3);
};
/** v2: a plastic candelabra sconce: an escutcheon, S arms, three candles dripping crystals, their glow on the flock. */
const paintSconce = (g: Ctx, x: number) => {
  const cx = x + 100, cy = GY - 250;
  steppedGlow(g, cx, cy - 20, 70, '#FDE68A', 0.14, 0.0, 5);
  inked(g, () => { g.moveTo(cx, cy - 22); g.quadraticCurveTo(cx + 10, cy - 14, cx + 7, cy + 10); g.quadraticCurveTo(cx + 9, cy + 26, cx, cy + 36); g.quadraticCurveTo(cx - 9, cy + 26, cx - 7, cy + 10); g.quadraticCurveTo(cx - 10, cy - 14, cx, cy - 22); }, GILT[2], 2);
  box(g, cx - 4, cy - 12, 2, 36, GILT[5]); box(g, cx + 3, cy - 8, 2, 32, GILT[0]); box(g, cx - 1, cy - 16, 2, 46, GILT[3]);
  ball(g, cx, cy + 37, 3, GILT[3]); prism(g, cx, cy + 40, 10);
  for (const s of [-1, 1]) {
    const arm = () => { g.moveTo(cx, cy + 8); g.bezierCurveTo(cx + s * 14, cy + 24, cx + s * 32, cy + 16, cx + s * 28, cy); };
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); arm(); g.stroke();
    g.strokeStyle = GILT[2]; g.lineWidth = 4; g.beginPath(); arm(); g.stroke();
    g.strokeStyle = GILT[5]; g.lineWidth = 1; g.beginPath(); arm(); g.stroke();
    g.lineCap = 'butt';
    candleCup(g, cx + s * 28, cy);
  }
  ball(g, cx, cy + 8, 4, GILT[4]);
  candleCup(g, cx, cy - 22, 18);
};
/** v3: the portrait: the count as a gross-up in oils, a carved frame, a picture light washing down it, a nameplate. */
const paintPortrait = (g: Ctx, x: number) => {
  const px = x + 60, py = GY - 336;
  giltFrame(g, px - 10, py - 10, 100, 126, 10);
  box(g, px, py, 80, 106, '#1C0F24'); box(g, px, py, 80, 40, '#2A1635'); checker(g, px, py + 40, 80, 2, '#2A1635');
  // (the count himself: a gross-up in oils (grossBust.ts), fangs in the grin, the varnish cracked)
  drawBust(g, bust('ballroom-count', COUNT, 'oil'), px + 2, py + 2, 76, 104, 150);
  for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(253, 230, 138, 0.06)'; g.fillRect(px + 10 - i * 5, py, 60 + i * 10, 24 + i * 18); }
  slab(g, px + 16, py - 24, 48, 6, GILT[4], { edge: 1 }); box(g, px + 38, py - 18, 4, 7, GILT[1]); box(g, px + 18, py - 19, 44, 1, '#FEF3C7');
  slab(g, px + 8, py + 120, 64, 11, GILT[3], { edge: 1 });
  signAt(g, 'THE COUNT', px + 40, py + 125, 6, print(6, GILT[0]));
};

const paintWallTile = (g: Ctx, x: number, v: number) => {
  const W = 200, top = CEIL - 260;
  box(g, x, top, W, CEIL - top + 2, FL[0]);
  damask(g, x, CEIL + 18, W, GY - 118 - (CEIL + 18));
  hazeBands(g, x, CEIL + 18, W, 150, '#0A0310', 0.6, 0, 6);
  wainscot(g, x, W);
  cornice(g, x, W);
  pilaster(g, x); pilaster(g, x + W);
  if (v === 1) paintMirror(g, x);
  else if (v === 2) paintSconce(g, x);
  else if (v === 3) paintPortrait(g, x);
  // (a swag of red velvet between the capitals, jabots at its ends, a tassel off each capital)
  swag(g, x + 27, x + W - 7, CEIL + 14, 38);
  jabot(g, x + 27, CEIL + 16, 58, 1); jabot(g, x + W - 7, CEIL + 16, 58, -1);
  rosette(g, x + 27, CEIL + 17, 4); rosette(g, x + W - 7, CEIL + 17, 4);
  tassel(g, x + 27, CEIL + 20, 16); tassel(g, x + W - 7, CEIL + 20, 16);
};

// ---------------------------------------------------------------------------------------------------------------
// Against the back wall: the buffet and the cake (left), the DJ's table (right); wall units at WALL_D

const BUF_X = ARENA_L + 60, DJ_X = ARENA_R - 300;

/** A cake tier, middle cx, top y: banded icing (lit left), a lip, pink fondant swags, a piped shell border. */
const tier = (g: Ctx, cx: number, y: number, w: number, h: number) => {
  const x = cx - w / 2;
  pole(g, x, y, w, h, '#F1E9D8');
  box(g, x - 1, y - 3, w + 2, 1, INK); box(g, x, y - 2, w, 3, '#FFFFFF'); box(g, x + w - 6, y - 2, 6, 3, '#E7DECB');
  g.strokeStyle = PK[5]; g.lineWidth = 1.5;
  for (let k = x + 1; k < x + w - 6; k += 8) { g.beginPath(); g.moveTo(k, y + 3); g.quadraticCurveTo(k + 4, y + 8, k + 8, y + 3); g.stroke(); box(g, k, y + 2, 2, 2, PK[3]); }
  for (let k = x; k < x + w - 1; k += 3) { box(g, k, y + h - 3, 3, 3, '#D9CFBD'); box(g, k, y + h - 3, 2, 2, '#FFFFFF'); }
};
const paintBuffet = (g: Ctx) => {
  const x = BUF_X, top = GY - 56, w = 240;
  // (the cloth: its top edge, the drape in folds to the floor, the hem broken on it)
  box(g, x - 1, top - 3, w + 2, 5, INK); box(g, x, top - 2, w, 3, CLOTHS[4]);
  const fold = [3, 4, 4, 3, 2, 2, 2, 1, 1, 2, 2, 3];
  for (let k = 0; k < w; k += 12) for (let c = 0; c < 12 && k + c < w; c++) box(g, x + k + c, top + 1, 1, GY - top - 1, CLOTHS[fold[c]]);
  box(g, x - 1, top, 1, GY - top, INK); box(g, x + w, top, 1, GY - top, INK);
  checker(g, x, GY - 6, w, 2, CLOTHS[1]); box(g, x, GY - 4, w, 4, CLOTHS[1]); box(g, x, GY - 1, w, 1, CLOTHS[0]);
  // (purple satin swags along the front, a rosette and a tassel at each gather)
  for (let k = 0; k < w; k += 40) swag(g, x + k, x + k + 40, top + 1, 4, PU, 6, 3);
  for (let k = 0; k <= w; k += 40) { rosette(g, x + k, top + 3, 3); tassel(g, x + k, top + 6, 9); }
  // (the runner down the front, fringed)
  const RUN = [3, 4, 3, 2, 2, 2, 1, 2, 3, 4, 3, 2, 2, 1, 1, 2, 3, 3, 2, 2, 1, 2, 3, 2, 1, 1];
  for (let c = 0; c < 26; c++) box(g, x + 62 + c, top - 2, 1, 44, PU[RUN[c]]);
  box(g, x + 61, top - 2, 1, 44, INK); box(g, x + 88, top - 2, 1, 44, INK); box(g, x + 61, top + 42, 28, 2, GILT[3]);
  for (let c = 0; c < 26; c += 2) box(g, x + 62 + c, top + 44, 1, 5, c % 4 ? GILT[5] : GILT[2]);
  const on = top - 2;
  // (glass cups stacked; the punch bowl on its foot, the punch, the ladle)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) {
    const cx = x + 6 + j * 7 + i * 3.5, cy = on - 6 - i * 6;
    box(g, cx - 3, cy, 7, 6, '#0C3B5E'); box(g, cx - 2, cy, 5, 5, '#A5D8F0'); box(g, cx - 2, cy, 1, 5, '#E0F2FE');
  }
  slab(g, x + 30, on - 4, 14, 4, '#A5D8F0', { edge: 1 }); box(g, x + 35, on - 9, 4, 5, '#7DC4E4');
  inked(g, () => { g.ellipse(x + 37, on - 18, 20, 10, 0, 0, Math.PI); g.closePath(); }, '#8CCBE8', 2);
  fillPath(g, '#B91C1C', () => { g.ellipse(x + 37, on - 17, 17, 6, 0, 0, Math.PI); g.closePath(); });
  fillPath(g, '#7F1D1D', () => g.ellipse(x + 37, on - 18, 18, 3, 0, 0, Math.PI * 2));
  fillPath(g, '#DC2626', () => g.ellipse(x + 35, on - 18.5, 13, 1.8, 0, 0, Math.PI * 2));
  box(g, x + 22, on - 16, 2, 6, '#E0F2FE'); box(g, x + 26, on - 12, 4, 1, '#FFFFFF');
  for (let i = 0; i < 6; i++) box(g, x + 19 + i * 6, on - 19, 2, 1, '#E0F2FE');
  seg(g, [x + 44, on - 19], [x + 52, on - 34], INK, 3); seg(g, [x + 44, on - 19], [x + 52, on - 34], '#D4D4D8', 1); box(g, x + 51, on - 36, 4, 2, '#A1A1AA');
  // (plates stacked, napkins fanned)
  for (let i = 0; i < 6; i++) { box(g, x + 92, on - 2 - i * 2, 14, 2, INK); box(g, x + 93, on - 2 - i * 2, 12, 1, i % 2 ? CLOTHS[3] : CLOTHS[4]); }
  for (let i = 0; i < 4; i++) {
    const ty = on - 22 + Math.abs(i - 1.5) * 2;
    fillPath(g, i % 2 ? PK[5] : PK[4], () => { g.moveTo(x + 98, on - 13); g.lineTo(x + 92 + i * 4, ty); g.lineTo(x + 95 + i * 4, ty); g.closePath(); });
  }
  // (two chafing dishes: the stand, the sterno's flame, the pan, the roll-top lid)
  for (const cx of [x + 108, x + 148]) {
    for (const lx of [cx + 2, cx + 30]) { box(g, lx - 1, on - 10, 3, 10, INK); box(g, lx, on - 10, 1, 10, CHROME[3]); }
    seg(g, [cx + 3, on - 1], [cx + 31, on - 9], CHROME[1], 1); seg(g, [cx + 3, on - 9], [cx + 31, on - 1], CHROME[1], 1);
    box(g, cx + 14, on - 5, 6, 5, '#3F3F46'); box(g, cx + 15, on - 9, 4, 4, '#60A5FA'); box(g, cx + 16, on - 11, 2, 3, '#FDBA74');
    slab(g, cx, on - 18, 34, 8, CHROME[2], { edge: 2 });
    inked(g, () => { g.ellipse(cx + 17, on - 18, 17, 9, 0, Math.PI, 0); g.closePath(); }, CHROME[2], 2);
    fillPath(g, CHROME[3], () => { g.ellipse(cx + 13, on - 19, 11, 6, 0, Math.PI, 0); g.closePath(); });
    fillPath(g, CHROME[4], () => { g.ellipse(cx + 10, on - 21, 5, 3, 0, Math.PI, 0); g.closePath(); });
    box(g, cx + 26, on - 24, 4, 5, CHROME[1]);
    box(g, cx + 14, on - 30, 6, 3, INK); box(g, cx + 15, on - 29, 4, 1, '#52525B');
  }
  // (the cake on its stand: three tiers, roses, the little couple on top (him in a cape); a slice already gone)
  const cx = x + 213;
  slab(g, cx - 12, on - 4, 24, 4, GILT[3], { edge: 1 }); pole(g, cx - 3, on - 12, 6, 8, GILT[3]);
  inked(g, () => g.ellipse(cx, on - 13, 25, 3, 0, 0, Math.PI * 2), GILT[4], 2);
  tier(g, cx, on - 38, 46, 24); tier(g, cx, on - 56, 34, 18); tier(g, cx, on - 70, 22, 14);
  // (the gap: the slice's cut faces, sponge and jam in layers)
  const sx = cx + 10, sy = on - 38;
  box(g, sx, sy - 2, 13, 26, INK); box(g, sx + 1, sy, 11, 24, '#F6D98A');
  for (let i = 0; i < 4; i++) box(g, sx + 1, sy + 3 + i * 6, 11, 2, i % 2 ? '#F1E9D8' : '#B91C1C');
  box(g, sx + 1, sy, 2, 24, '#E8C46A'); box(g, sx + 12, sy, 1, 24, INK);
  for (const [rx, ry] of [[cx - 16, on - 39], [cx - 2, on - 39], [cx - 10, on - 57], [cx + 6, on - 57]]) { box(g, rx - 1, ry + 1, 5, 2, '#4D7C0F'); ball(g, rx + 1, ry, 2.5, '#F472B6'); box(g, rx + 1, ry - 1, 1, 1, '#9D174D'); }
  const ty = on - 72;
  box(g, cx - 8, ty - 11, 6, 10, '#7F1D1D'); box(g, cx - 7, ty - 11, 1, 9, '#B91C1C');
  box(g, cx - 6, ty - 10, 3, 10, '#18181B'); box(g, cx - 6, ty - 14, 3, 4, '#E5E7EB'); box(g, cx - 6, ty - 15, 3, 1, '#18181B');
  fillPath(g, '#FBF9F4', () => { g.moveTo(cx + 2, ty - 9); g.lineTo(cx, ty); g.lineTo(cx + 6, ty); g.lineTo(cx + 4, ty - 9); g.closePath(); });
  box(g, cx + 2, ty - 13, 3, 4, '#E8B48A'); box(g, cx + 4, ty - 13, 2, 8, '#E5E7EB'); box(g, cx + 2, ty - 14, 3, 1, '#A16207');
  // (the slice's fork, left lying by the stand)
  box(g, cx + 14, on - 2, 9, 1, CHROME[2]); box(g, cx + 22, on - 3, 3, 1, CHROME[3]);
};

/** A PA speaker on a tripod stand, a T-bar of two par cans on top. */
const speaker = (g: Ctx, sx: number) => {
  for (const fx of [sx + 1, sx + 25]) { seg(g, [sx + 13, GY - 16], [fx, GY], INK, 3); seg(g, [sx + 13, GY - 16], [fx, GY], '#52525B', 1); }
  pole(g, sx + 11, GY - 66, 4, 54, '#52525B');
  slab(g, sx, GY - 122, 26, 58, '#232326', { edge: 2 });
  checker(g, sx + 3, GY - 106, 20, 38, '#34343A');
  box(g, sx + 5, GY - 118, 16, 9, INK); box(g, sx + 6, GY - 117, 14, 7, '#3F3F46'); box(g, sx + 9, GY - 116, 8, 5, '#27272A'); box(g, sx + 11, GY - 115, 4, 3, '#0A0A0A');
  const wx = sx + 13, wy = GY - 88;
  ball(g, wx, wy, 10, '#3F3F46'); fillPath(g, '#1C1C1F', () => g.arc(wx, wy, 7.5, 0, Math.PI * 2));
  fillPath(g, '#3A3A40', () => { g.moveTo(wx, wy); g.arc(wx, wy, 6, Math.PI * 0.95, Math.PI * 1.6); g.closePath(); });
  ball(g, wx, wy, 3, '#52525B', false);
  box(g, sx + 9, GY - 74, 8, 3, '#0A0A0A'); box(g, sx + 10, GY - 69, 6, 2, '#A1A1AA');
  pole(g, sx + 12, GY - 140, 2, 18, '#52525B');
  box(g, sx + 1, GY - 143, 24, 4, INK); box(g, sx + 2, GY - 142, 22, 2, '#52525B');
  for (const [dx, gel] of [[2, '#F472B6'], [14, '#60A5FA']] as const) {
    slab(g, sx + dx, GY - 156, 10, 13, '#18181B', { edge: 1 }); box(g, sx + dx + 1, GY - 155, 2, 11, '#3F3F46');
    ball(g, sx + dx + 5, GY - 143, 3.5, gel); box(g, sx + dx + 3, GY - 145, 1, 1, '#FFFFFF');
  }
};
const paintDJ = (g: Ctx) => {
  const x = DJ_X;
  // (cables drooping off to the speakers)
  g.strokeStyle = '#0A0A0A'; g.lineWidth = 2;
  for (const [a, b] of [[x + 4, x - 27], [x + 146, x + 179]]) { g.beginPath(); g.moveTo(a, GY - 50); g.quadraticCurveTo((a + b) / 2, GY - 8, b, GY - 70); g.stroke(); }
  for (const sx of [x - 40, x + 166]) speaker(g, sx);
  // (the table: a black stretch skirt in folds, its top edge)
  const SK = ['#2E2E33', '#3A3A40', '#27272A', '#1C1C1F', '#141416', '#1C1C1F', '#27272A', '#2E2E33', '#27272A', '#1C1C1F'];
  for (let k = 0; k < 150; k++) box(g, x + k, GY - 50, 1, 50, SK[k % 10]);
  box(g, x - 1, GY - 50, 1, 50, INK); box(g, x + 150, GY - 50, 1, 50, INK);
  slab(g, x - 3, GY - 55, 156, 6, '#3F3F46', { edge: 1 });
  // (the banner: printed vinyl, a gilt border, grommets, bats either side)
  const bx = x + 14, by = GY - 47;
  box(g, bx - 1, by - 1, 124, 24, INK);
  bandedGradient(g, bx, by, 122, 22, ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'], 5);
  box(g, bx + 2, by + 2, 118, 1, '#FDE047'); box(g, bx + 2, by + 19, 118, 1, '#CA8A04'); box(g, bx + 2, by + 2, 1, 18, '#FDE047'); box(g, bx + 119, by + 2, 1, 18, '#CA8A04');
  for (const [gx, gy] of [[bx + 4, by + 4], [bx + 116, by + 4], [bx + 4, by + 16], [bx + 116, by + 16]]) { box(g, gx - 1, gy - 1, 3, 3, '#A1A1AA'); box(g, gx, gy, 1, 1, INK); }
  signAt(g, 'DJ VLAD', bx + 61, by + 11, 8, haunt(8, '#FDE047', '#4C1D95'));
  for (const s of [-1, 1]) bat(g, bx + 61 + s * 46, by + 10, '#0A0A0A');
  // (the console: two turntables, the mixer, the laptop's lid (a bat glowing on it), headphones; a cup; the tip jar)
  slab(g, x + 8, GY - 66, 134, 11, '#3F3F46', { edge: 2 });
  for (const dx of [32, 118]) {
    inked(g, () => g.ellipse(x + dx, GY - 66, 16, 4, 0, 0, Math.PI * 2), '#52525B', 1);
    fillPath(g, '#0A0A0A', () => g.ellipse(x + dx, GY - 66.5, 13, 3.2, 0, 0, Math.PI * 2));
    g.strokeStyle = '#2A2A2E'; g.lineWidth = 1; g.beginPath(); g.ellipse(x + dx, GY - 66.5, 9, 2.2, 0, 0, Math.PI * 2); g.stroke();
    fillPath(g, '#DC2626', () => g.ellipse(x + dx, GY - 66.5, 3, 1, 0, 0, Math.PI * 2)); box(g, x + dx, GY - 67, 1, 1, '#FFFFFF');
    seg(g, [x + dx + 14, GY - 70], [x + dx + 5, GY - 66], CHROME[3], 1); ball(g, x + dx + 14, GY - 70, 1.5, CHROME[2], false);
  }
  slab(g, x + 58, GY - 72, 34, 8, '#27272A', { edge: 1 });
  for (let i = 0; i < 4; i++) { box(g, x + 62 + i * 7, GY - 70, 1, 5, '#0A0A0A'); box(g, x + 61 + i * 7, GY - 68 + (i % 3) - 1, 3, 2, CHROME[3]); }
  for (let i = 0; i < 4; i++) box(g, x + 88, GY - 70 + i, 2, 1, ['#EF4444', '#FACC15', '#4ADE80', '#4ADE80'][i]);
  slab(g, x + 56, GY - 94, 38, 22, CHROME[2], { edge: 1 });
  steppedGlow(g, x + 75, GY - 83, 9, '#FFFFFF', 0.35, 0.05, 3);
  bat(g, x + 75, GY - 84, '#F8FAFC');
  box(g, x + 59, GY - 91, 9, 5, '#B91C1C'); signAt(g, '666', x + 63.5, GY - 88.5, 4, print(4, '#FEF2F2'));
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(x + 90, GY - 92, 7, Math.PI, 0); g.stroke();
  g.strokeStyle = '#52525B'; g.lineWidth = 1; g.beginPath(); g.arc(x + 90, GY - 92, 7, Math.PI, 0); g.stroke();
  slab(g, x + 81, GY - 93, 5, 8, '#27272A', { edge: 1 }); slab(g, x + 94, GY - 93, 5, 8, '#27272A', { edge: 1 });
  box(g, x + 12, GY - 75, 7, 9, INK); box(g, x + 13, GY - 74, 5, 8, '#DC2626'); box(g, x + 13, GY - 74, 5, 1, '#FFFFFF'); box(g, x + 13, GY - 72, 1, 6, '#F87171');
  box(g, x + 128, GY - 82, 14, 16, '#0C3B5E'); box(g, x + 129, GY - 81, 12, 15, '#A5D8F0'); box(g, x + 130, GY - 76, 10, 9, '#4D7C0F'); box(g, x + 131, GY - 75, 3, 2, '#86EFAC');
  box(g, x + 129, GY - 82, 12, 2, '#71717A'); box(g, x + 129, GY - 72, 12, 5, '#F8FAFC'); signAt(g, 'TIPS', x + 135, GY - 69.5, 4, print(4, '#18181B'));
};
/** A bat, wings out (its middle at x, y). */
const bat = (g: Ctx, cx: number, cy: number, col: string) => {
  fillPath(g, col, () => { g.moveTo(cx, cy - 1); g.lineTo(cx - 9, cy - 4); g.lineTo(cx - 7, cy); g.lineTo(cx - 4, cy - 1); g.lineTo(cx, cy + 3); g.lineTo(cx + 4, cy - 1); g.lineTo(cx + 7, cy); g.lineTo(cx + 9, cy - 4); g.closePath(); });
  box(g, cx - 2, cy - 3, 1, 2, col); box(g, cx + 1, cy - 3, 1, 2, col);
  if (col === '#0A0A0A') { box(g, cx - 1, cy - 1, 1, 1, '#EF4444'); box(g, cx + 1, cy - 1, 1, 1, '#EF4444'); }
};

// ---------------------------------------------------------------------------------------------------------------
// At his plane

/** A gold chiavari chair (feet at x, GY): ball finials, turned rails, a buttoned white cushion, a pink tie; or over. */
const paintChair = (g: Ctx, x: number, over: boolean) => {
  if (over) {
    g.save(); g.translate(x, GY - 4); g.rotate(-Math.PI / 2 + 0.1); g.translate(-x, -(GY - 4)); paintChair(g, x, false); g.restore();
    return;
  }
  for (const dx of [-12, 9]) { pole(g, x + dx, GY - 76, 3, 76, GILT[2]); ball(g, x + dx + 1.5, GY - 77, 2, GILT[4]); }
  for (let k = 0; k < 4; k++) {
    const y = GY - 72 + k * 8;
    box(g, x - 9, y - 1, 18, 4, INK); box(g, x - 9, y, 18, 2, GILT[3]); box(g, x - 9, y, 18, 1, GILT[5]);
    for (const nx of [x - 4, x + 2]) { box(g, nx, y - 1, 2, 4, GILT[4]); box(g, nx, y - 1, 1, 1, GILT[6]); }
  }
  for (const dx of [-14, 11]) pole(g, x + dx, GY - 38, 3, 38, GILT[3]);
  box(g, x - 12, GY - 15, 24, 3, INK); box(g, x - 12, GY - 14, 24, 1, GILT[4]);
  slab(g, x - 16, GY - 41, 32, 5, GILT[3], { edge: 1 });
  box(g, x - 15, GY - 48, 30, 8, INK); box(g, x - 14, GY - 47, 28, 6, '#EEEAE0'); box(g, x - 14, GY - 47, 28, 1, '#FFFFFF'); box(g, x - 14, GY - 43, 28, 2, '#C9C2B4');
  box(g, x - 7, GY - 45, 1, 1, '#A8A29E'); box(g, x + 6, GY - 45, 1, 1, '#A8A29E'); box(g, x - 7, GY - 46, 1, 1, '#FFFFFF');
  box(g, x + 9, GY - 42, 2, 8, PK[4]); box(g, x + 11, GY - 42, 2, 6, PK[3]);
};

/** The bandstand riser's front at his plane: the lit lip (stood on), gilt apron, purple satin swags with fringe over a
 *  pleated velvet skirt; footlights on its front edge, their hoods and the wash they throw up. */
const paintRiser = (g: Ctx) => {
  const x = RISER.x, top = GY - RISER.h, w = RISER.w;
  const pleat = [1, 2, 3, 4, 3, 2, 1, 0];
  for (let k = 0; k < w; k++) box(g, x + k, top + 8, 1, GY - top - 8, VR[pleat[k % 8]]);
  box(g, x, GY - 3, w, 3, VR[0]); checker(g, x, GY - 5, w, 2, VR[0]);
  box(g, x - 1, top, 1, GY - top, INK);
  profile(g, x, top + 7, w, [[GILT[4], 1], [GILT[2], 1], [INK, 1]]);
  for (let k = 0; k < w; k += 30) swag(g, x + k, x + k + 30, top + 10, 2.5, PU, 6, 3);
  for (let k = 0; k <= w; k += 30) rosette(g, x + k, top + 12, 2.5);
  standTop(g, x - 2, top, w + 4, WOOD[3], '#FCD34D');
  // (footlights: brass hoods on the lip's front edge, lamps lit under them, a warm wash thrown up)
  for (let k = 0; k < 4; k++) {
    const lx = x + 15 + k * 30;
    steppedGlow(g, lx, top - 4, 16, '#FDE68A', 0.32, 0.02, 4);
    inked(g, () => { g.moveTo(lx - 6, top); g.lineTo(lx - 5, top - 5); g.quadraticCurveTo(lx, top - 8, lx + 5, top - 5); g.lineTo(lx + 6, top); g.closePath(); }, GILT[3], 1);
    box(g, lx - 4, top - 5, 3, 1, GILT[6]); box(g, lx - 3, top - 2, 6, 2, '#FEF3C7'); box(g, lx - 1, top - 2, 2, 1, '#FFFFFF');
  }
};
const RISER_D = 0.95, KIT_D = 0.968;
/** The chairs (off ARENA_L). */
const CHAIR_X = [80, 210, 345, 455];
/** The riser's top going back (live: it goes back to the eye; four quads and one batched stroke): boards running
 *  across, staggered butt joints; its left side if it faces the eye. */
const riserTop = (c: Ctx, eye: Eye) => {
  const x = RISER.x, X2 = ARENA_R, top = GY - RISER.h;
  const p = (xx: number, d: number) => at(eye, xx, top, d);
  const rows = 4, dr = (r: number) => 1 - ((1 - RISER_D) * r) / rows;
  const BOARD = [WOOD[3], WOOD[2], mix(WOOD[2], INK, 0.12), mix(WOOD[2], INK, 0.24)];
  for (let r = 0; r < rows; r++) quad(c, BOARD[r], p(x, dr(r)), p(X2, dr(r)), p(X2, dr(r + 1)), p(x, dr(r + 1)));
  c.strokeStyle = WOOD[0]; c.lineWidth = 1; c.beginPath();
  for (let r = 1; r <= rows; r++) { const a = p(x, dr(r)), b = p(X2, dr(r)); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  for (let r = 0; r < rows; r++) { const jx = x + 22 + ((r * 37) % 60), a = p(jx, dr(r)), b = p(jx, dr(r + 1)); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
  c.stroke();
  if (eye.x < x) {
    quad(c, VR[0], at(eye, x, top, 1), at(eye, x, top, RISER_D), at(eye, x, GY, RISER_D), at(eye, x, GY, 1));
    seg(c, at(eye, x, top + 1, 1), at(eye, x, top + 1, RISER_D), GILT[4], 1);
  }
  seg(c, p(x, RISER_D), p(X2, RISER_D), INK, 1);
};
/** The band's kit on the riser (in its own depth, feet on the riser's top): a bass drum with the band's name on its
 *  head, toms, a snare, a floor tom, the hi-hat and a crash on their stands; a mic stand at the front. */
const paintKit = (g: Ctx) => {
  const kx = RISER.x, fy = GY - RISER.h, SH = '#991B1B';
  const legs = (x: number) => { seg(g, [x, fy - 6], [x - 5, fy], INK, 2); seg(g, [x, fy - 6], [x + 5, fy], INK, 2); };
  const stand = (x: number, y0: number) => { pole(g, x - 1, y0, 2, fy - y0 - 4, CHROME[2], false); legs(x); };
  const cymbal = (x: number, y: number, r: number, tilt: number) => {
    inked(g, () => g.ellipse(x, y, r, 2.5, tilt, 0, Math.PI * 2), GILT[3], 1);
    fillPath(g, GILT[5], () => g.ellipse(x - r * 0.3, y - 0.5, r * 0.45, 1, tilt, 0, Math.PI * 2)); box(g, x - 1, y - 2, 2, 2, GILT[1]);
  };
  const drum = (x: number, y: number, w: number, h: number) => {
    pole(g, x, y, w, h, SH); box(g, x, y, w, 2, CHROME[3]); box(g, x, y + h - 2, w, 2, CHROME[1]);
    for (let k = x + 2; k < x + w - 1; k += 4) box(g, k, y + 2, 1, h - 4, CHROME[2]);
    inked(g, () => g.ellipse(x + w / 2, y, w / 2, 2.5, 0, 0, Math.PI * 2), '#F1EFEA', 1);
  };
  // (hi-hat, snare at the left; the crash on its boom over the right; the floor tom)
  stand(kx + 22, fy - 46); cymbal(kx + 22, fy - 46, 10, 0); cymbal(kx + 22, fy - 43, 10, 0);
  stand(kx + 38, fy - 24); drum(kx + 30, fy - 30, 16, 7);
  pole(g, kx + 104, fy - 60, 2, 56, CHROME[2], false); legs(kx + 105);
  cymbal(kx + 96, fy - 64, 13, -0.15);
  drum(kx + 90, fy - 24, 16, 20); box(g, kx + 91, fy - 4, 1, 4, CHROME[1]); box(g, kx + 104, fy - 4, 1, 4, CHROME[1]);
  // (the bass drum, front on: hoop, lugs, the head with the band's name and a bat; toms on it)
  const bx = kx + 68, by = fy - 19;
  drum(bx - 18, fy - 50, 15, 9); drum(bx + 3, fy - 50, 15, 9);
  box(g, bx - 2, fy - 42, 4, 6, CHROME[1]);
  fillPath(g, INK, () => g.arc(bx, by, 19, 0, Math.PI * 2));
  fillPath(g, SH, () => g.arc(bx, by, 18, 0, Math.PI * 2));
  fillPath(g, VR[3], () => { g.moveTo(bx, by); g.arc(bx, by, 18, Math.PI * 0.9, Math.PI * 1.6); g.closePath(); });
  fillPath(g, CHROME[2], () => g.arc(bx, by, 16, 0, Math.PI * 2));
  fillPath(g, '#E7E2D8', () => g.arc(bx, by, 14.5, 0, Math.PI * 2));
  fillPath(g, '#FBF9F4', () => g.arc(bx - 2, by - 2, 11, 0, Math.PI * 2));
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.4; box(g, bx + Math.cos(a) * 17 - 1, by + Math.sin(a) * 17 - 1, 2, 2, CHROME[4]); }
  bat(g, bx, by - 7, '#18181B');
  signAt(g, 'BATS', bx, by + 3, 6, blood({ sx: 1, sy: 1 }, '#B91C1C', '#3A0606', 3));
  for (const s of [-1, 1]) seg(g, [bx + s * 15, by + 10], [bx + s * 20, fy], CHROME[1], 1);
  // (the mic stand at the front of the riser)
  pole(g, kx + 8, fy - 52, 2, 48, CHROME[2], false); legs(kx + 9);
  seg(g, [kx + 9, fy - 52], [kx + 16, fy - 56], CHROME[1], 2); ball(g, kx + 17, fy - 57, 2.5, '#27272A');
};

/** A fog machine (live: its puffs and its light), feet at x. */
const fogMachine = (c: Ctx, fx: number, f: number, dir: number) => {
  stamp(c, `ball-fogger-${dir}`, fx - 10, GY - 30, 60, 32, g => {
    const bx = dir > 0 ? fx : fx + 40;
    g.strokeStyle = '#0A0A0A'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, GY - 8); g.quadraticCurveTo(bx - dir * 6, GY - 2, bx - dir * 7, GY); g.stroke();
    slab(g, fx, GY - 22, 40, 20, '#2E2E33', { edge: 2 });
    for (let i = 0; i < 4; i++) { box(g, fx + 17 + i * 4, GY - 18, 2, 11, '#141416'); box(g, fx + 17 + i * 4, GY - 18, 2, 1, '#52525B'); }
    box(g, fx + 3, GY - 2, 6, 2, INK); box(g, fx + 31, GY - 2, 6, 2, INK);
    box(g, fx + 9, GY - 27, 22, 2, INK); box(g, fx + 9, GY - 27, 2, 6, INK); box(g, fx + 29, GY - 27, 2, 6, INK); box(g, fx + 11, GY - 26, 18, 1, '#52525B');
    const nx = dir > 0 ? fx + 39 : fx - 5;
    box(g, nx, GY - 16, 6, 7, INK); box(g, nx + 1, GY - 15, 4, 5, CHROME[1]); box(g, nx + (dir > 0 ? 4 : 1), GY - 14, 1, 3, '#0A0A0A');
    box(g, fx + 4, GY - 11, 10, 5, '#FACC15'); checker(g, fx + 4, GY - 11, 10, 5, '#18181B');
    box(g, fx + 3, GY - 19, 10, 6, INK); box(g, fx + 4, GY - 18, 8, 4, '#7F1D1D');
  });
  box(c, fx + 4, GY - 18, 8, 4, Math.floor(f / 20) % 2 ? '#EF4444' : '#7F1D1D');
  for (let i = 0; i < 4; i++) {
    const u = ((f + i * 40 + fx) % 160) / 160;
    c.globalAlpha = 0.35 * (1 - u);
    pixelBlob(c, fx + 20 + dir * (24 + u * 120), GY - 12 - u * 12, 18 + u * 40, 7 + u * 6, '#E2E8F0');
  }
  c.globalAlpha = 1;
};

/** Where a chandelier's prisms hang (x off its left end, y off its ring's top): their glints are live. */
const prismsOf = (w: number): P[] => {
  const out: P[] = [];
  for (let i = 0; i < 9; i++) out.push([8 + i * ((w - 16) / 8), 22 + (i % 2) * 3]);
  for (let i = 0; i < 5; i++) out.push([34 + i * ((w - 68) / 4), 40 + (i % 2) * 2]);
  out.push([w / 2, 62]);
  return out;
};
/** A plastic crystal chandelier: the canopy at the ceiling, chains, the brass ring (stood on: its lip lit), tiers,
 *  bead festoons, prisms, the bowl and its finial drop; candle sleeves on the ring's ends. */
const paintChandelier = (g: Ctx, x: number, top: number, w: number) => {
  const mid = x + w / 2;
  inked(g, () => { g.moveTo(mid - 14, CEIL); g.quadraticCurveTo(mid, CEIL + 12, mid + 14, CEIL); g.closePath(); }, GILT[3], 2);
  box(g, mid - 10, CEIL + 1, 8, 2, GILT[5]);
  for (const cx of [x + 14, mid, x + w - 14]) for (let y = CEIL + 4, i = 0; y < top - 2; y += 6, i++) {
    if (i % 2) { box(g, cx - 1, y, 3, 6, INK); box(g, cx, y + 1, 1, 4, GILT[4]); }
    else { box(g, cx - 2, y, 5, 6, INK); box(g, cx - 1, y + 1, 3, 4, GILT[3]); box(g, cx, y + 2, 1, 2, INK); box(g, cx - 1, y + 1, 1, 1, GILT[6]); }
  }
  // (the festoons: beads swagged under the ring and the tier)
  const festoon = (xa: number, xb: number, y: number, sag: number) => {
    const n = Math.max(3, Math.round((xb - xa) / 3));
    for (let i = 0; i <= n; i++) { const s = i / n, px = xa + (xb - xa) * s, py = y + 4 * s * (1 - s) * sag; box(g, px - 1, py - 1, 2, 2, i % 3 ? '#9ED8F2' : '#FFFFFF'); }
  };
  for (let i = 0; i < 4; i++) festoon(x + 8 + (i * (w - 16)) / 4, x + 8 + ((i + 1) * (w - 16)) / 4, top + 18, 8);
  for (let i = 0; i < 4; i++) festoon(x + 34 + (i * (w - 68)) / 4, x + 34 + ((i + 1) * (w - 68)) / 4, top + 36, 5);
  slab(g, x + 18, top + 8, w - 36, 9, GILT[3], { edge: 2 }); beads(g, x + 20, top + 12, w - 40);
  slab(g, x + 34, top + 26, w - 68, 9, GILT[2], { edge: 2 }); box(g, x + 36, top + 29, w - 72, 1, GILT[5]);
  inked(g, () => { g.ellipse(mid, top + 35, 18, 14, 0, 0, Math.PI); g.closePath(); }, GILT[2], 2);
  fillPath(g, GILT[4], () => { g.ellipse(mid - 5, top + 37, 8, 6, 0, 0, Math.PI); g.closePath(); }); box(g, mid - 10, top + 37, 4, 2, GILT[6]);
  pole(g, mid - 2, top + 49, 5, 6, GILT[3]); ball(g, mid + 0.5, top + 57, 3.5, GILT[4]);
  for (const [dx, dy] of prismsOf(w)) prism(g, x + dx, top + dy, dy > 60 ? 12 : 8);
  standTop(g, x, top, w, '#A16207', '#FDE047');
  for (const cx of [x + 4, x + w - 10]) { pole(g, cx, top - 12, 6, 12, '#EEEAE0'); box(g, cx, top - 12, 2, 4, '#FFFFFF'); box(g, cx - 2, top - 2, 10, 2, GILT[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The stage's end, going back: the kitchen's swing doors in it (the left end's the way in: a passage, below)

const endWall = (c: Ctx, eye: Eye, X: number, side: -1 | 1, f: number) => {
  if (side < 0 ? eye.x >= X : eye.x <= X) return;
  const p = (y: number, d: number): P => at(eye, X, y, d), top = CEIL - 300;
  const ds = [1, 0.97, 0.94, 0.91, 0.885, WALL_D];
  // (each band on to the back wall, the next over it: no antialiased hairline between them crawling as it scrolls)
  for (let i = 0; i < ds.length - 1; i++) quad(c, mix('#2E1065', INK, i * 0.1), p(top, ds[i]), p(top, WALL_D), p(GY, WALL_D), p(GY, ds[i]));
  quad(c, '#1E0A33', p(GY - 118, 1), p(GY - 118, WALL_D), p(GY, WALL_D), p(GY, 1));
  quad(c, GILT[2], p(CEIL, 1), p(CEIL, WALL_D), p(CEIL + 16, WALL_D), p(CEIL + 16, 1));
  seg(c, p(CEIL + 3, 1), p(CEIL + 3, WALL_D), GILT[5], 1); seg(c, p(CEIL + 16, 1), p(CEIL + 16, WALL_D), INK, 1);
  seg(c, p(GY - 119, 1), p(GY - 119, WALL_D), GILT[4], 3); seg(c, p(GY - 117, 1), p(GY - 117, WALL_D), GILT[1], 1);
  seg(c, p(GY - 14, 1), p(GY - 14, WALL_D), GILT[3], 2);
  // (the opening, in a gilt casing: an arch on the left, swing doors on the right)
  const a = 0.97, b = 0.905;
  quad(c, INK, p(GY - 153, a + 0.005), p(GY - 153, b - 0.005), p(GY, b - 0.005), p(GY, a + 0.005));
  quad(c, GILT[2], p(GY - 151, a + 0.004), p(GY - 151, b - 0.004), p(GY, b - 0.004), p(GY, a + 0.004));
  quad(c, INK, p(GY - 146, a), p(GY - 146, b), p(GY, b), p(GY, a));
  if (side < 0) {
    quad(c, '#0E0418', p(GY - 145, a), p(GY - 145, b), p(GY, b), p(GY, a));
    quad(c, '#3A2A10', p(GY - 20, a), p(GY - 20, b), p(GY, b), p(GY, a));
  } else {
    const m = (a + b) / 2, swing = Math.sin(f * 0.15) * 0.004;
    quad(c, '#6B6763', p(GY - 140, a), p(GY - 140, m + swing), p(GY, m + swing), p(GY, a));
    quad(c, '#57534E', p(GY - 140, m - swing), p(GY - 140, b), p(GY, b), p(GY, m - swing));
    quad(c, '#A8A29E', p(GY - 26, a), p(GY - 26, m + swing), p(GY - 4, m + swing), p(GY - 4, a));
    quad(c, '#8A847E', p(GY - 26, m - swing), p(GY - 26, b), p(GY - 4, b), p(GY - 4, m - swing));
    for (const d of [(a + m) / 2, (m + b) / 2]) { const q = p(GY - 104, d); box(c, q[0] - 3, q[1] - 1, 6, 9, INK); box(c, q[0] - 2, q[1], 4, 7, '#BAE6FD'); box(c, q[0] - 2, q[1], 1, 3, '#FFFFFF'); }
    seg(c, p(GY - 140, m), p(GY, m), INK, 1);
  }
  seg(c, p(top, WALL_D), p(GY, WALL_D), INK, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The banner: pink satin, swallowtail ends folded back, a bow in the middle (where the disco ball's wire comes down:
// the words either side of it, never behind it), gilt letters inked; hung on cords from the cornice. Stamped, at WALL_D.

const BANNER_Y = GY - 420;
const BANNER_LOOK = { ...candle({ sx: 2, sy: 2 }, PK[2], '#FDE68A', false), ink: '#3B0764' };
const BANNER_GAP = 26;
let bannerAt: { a: number; b: number } | null = null;
const bannerSpan = () => {
  if (!bannerAt) {
    const wl = signW('CONGRATULATIONS', BANNER_LOOK), wr = signW('BRAD & TIFFANY', BANNER_LOOK);
    bannerAt = { a: Math.round(ARENA_MID - BANNER_GAP - wl - 18), b: Math.round(ARENA_MID + BANNER_GAP + wr + 18) };
  }
  return bannerAt;
};
const paintBanner = (g: Ctx) => {
  const { a, b } = bannerSpan(), y = BANNER_Y - 14, h = 28;
  g.strokeStyle = GILT[2]; g.lineWidth = 1;
  for (const [cx, tx] of [[a + 6, a - 30], [b - 6, b + 30]]) { g.beginPath(); g.moveTo(cx, y); g.lineTo(tx, CEIL + 20); g.stroke(); }
  // (the tails, folded back behind the ends, notched)
  for (const s of [-1, 1]) {
    const ex = s < 0 ? a : b;
    inked(g, () => { g.moveTo(ex, y + 4); g.lineTo(ex + s * 22, y + 6); g.lineTo(ex + s * 14, y + h / 2 + 5); g.lineTo(ex + s * 22, y + h + 4); g.lineTo(ex, y + h + 2); g.closePath(); }, PK[1], 2);
    box(g, Math.min(ex, ex + s * 18), y + 7, 18, 2, PK[2]);
  }
  // (the body: banded satin, gentle folds across, a gilt hem top and bottom)
  box(g, a - 1, y - 1, b - a + 2, h + 2, INK);
  bandedGradient(g, a, y, b - a, h, [PK[4], PK[3], PK[3], PK[2], PK[1]], 7);
  for (let k = a + 18; k < b - 16; k += 46) { g.fillStyle = 'rgba(255, 255, 255, 0.10)'; g.fillRect(k, y + 3, 8, h - 6); g.fillStyle = 'rgba(80, 7, 36, 0.18)'; g.fillRect(k + 8, y + 3, 6, h - 6); }
  box(g, a, y + 1, b - a, 2, GILT[4]); box(g, a, y + 1, b - a, 1, GILT[6]); box(g, a, y + h - 3, b - a, 2, GILT[2]);
  signAt(g, 'CONGRATULATIONS', ARENA_MID - BANNER_GAP - 4, BANNER_Y, 8, BANNER_LOOK, 'right');
  signAt(g, 'BRAD & TIFFANY', ARENA_MID + BANNER_GAP + 4, BANNER_Y, 8, BANNER_LOOK, 'left');
  // (the bow: two loops, two tails, a knot)
  for (const s of [-1, 1]) {
    inked(g, () => { g.moveTo(ARENA_MID, BANNER_Y + 2); g.lineTo(ARENA_MID + s * 14, BANNER_Y + 22); g.lineTo(ARENA_MID + s * 8, BANNER_Y + 20); g.lineTo(ARENA_MID + s * 4, BANNER_Y + 24); g.closePath(); }, PK[3], 2);
    inked(g, () => { g.moveTo(ARENA_MID, BANNER_Y); g.quadraticCurveTo(ARENA_MID + s * 26, BANNER_Y - 20, ARENA_MID + s * 20, BANNER_Y + 2); g.closePath(); }, PK[4], 2);
    fillPath(g, PK[5], () => { g.moveTo(ARENA_MID + s * 3, BANNER_Y - 2); g.quadraticCurveTo(ARENA_MID + s * 18, BANNER_Y - 14, ARENA_MID + s * 15, BANNER_Y - 3); g.closePath(); });
  }
  ball(g, ARENA_MID, BANNER_Y, 5, PK[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// The ceiling's coffers (live: they go back to the eye; batched, one fill per layer per row: ~18 fills a frame)

const COFFER_D = [1, 0.953, 0.906, WALL_D];
/** Each coffer, outside in: [color, x inset, near and far insets (shares of the row's depth)]: the gilt fillet, the
 *  recess's lit far face, the recess, the sunk panel. */
const COFFER: [string, number, number, number][] = [
  [GILT[1], 8, 0.08, 0.08], [GILT[3], 10, 0.11, 0.11], ['#3A1A50', 12, 0.14, 0.14], ['#0E0418', 13, 0.2, 0.26], ['#22103A', 24, 0.32, 0.36],
];
const coffers = (c: Ctx, eye: Eye, L: number, R: number) => {
  if (eye.y <= CEIL) return;
  const [s0, s1] = spanAt(eye, 1, 100);
  const a = Math.floor(Math.max(L, s0) / 100) * 100, b = Math.min(R, s1);
  const p = (x: number, d: number) => at(eye, x, CEIL, d);
  const quads = (col: string, x0_: number, x1_: number, e0: number, e1: number) => {
    c.fillStyle = col; c.beginPath();
    for (let x = a; x < b; x += 100) {
      const q0 = p(x + x0_, e0), q1 = p(x + x1_, e0), q2 = p(x + x1_, e1), q3 = p(x + x0_, e1);
      c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]); c.lineTo(q2[0], q2[1]); c.lineTo(q3[0], q3[1]); c.closePath();
    }
    c.fill();
  };
  for (let r = 0; r < 3; r++) {
    const d0 = COFFER_D[r], d1 = COFFER_D[r + 1], dd = d0 - d1, k = 0.2 + r * 0.14;
    for (const [col, ix, n0, n1] of COFFER) quads(mix(col, INK, k), ix, 100 - ix, d0 - dd * n0, d1 + dd * n1);
    const dm = (d0 + d1) / 2;
    quads(mix(GILT[4], INK, k), 46, 54, dm + dd * 0.08, dm - dd * 0.08);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The room, drawn (world space, behind everything)

/** `swing`: the disco ball knocked swinging on its wire (radians off straight down; Donnie on his way up past it). */
export interface BallLook { cleared: boolean; ballDown: boolean; swing?: number }
/** The disco ball's wire: hung from the ceiling over the middle of the floor, this long to the ball's middle. */
export const BALL_WIRE = GY - 366 - CEIL;

const LIT = ['#F472B6', '#60A5FA', '#FDE047', '#A78BFA'];
/** Quads batched by fill color (one path, one fill per color). */
const batch = new Map<string, number[]>();
const toBatch = (col: string, q: P[]) => { let a = batch.get(col); if (!a) { a = []; batch.set(col, a); } for (const v of q) a.push(v[0], v[1]); };
const flushBatch = (c: Ctx) => {
  for (const [col, a] of batch) {
    if (!a.length) continue;
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < a.length; i += 8) { c.moveTo(a[i], a[i + 1]); c.lineTo(a[i + 2], a[i + 3]); c.lineTo(a[i + 4], a[i + 5]); c.lineTo(a[i + 6], a[i + 7]); c.closePath(); }
    c.fill(); a.length = 0;
  }
};
const rampCache = new Map<string, string[]>();
const rampFor = (col: string) => { let r = rampCache.get(col); if (!r) { r = rampOf(col); rampCache.set(col, r); } return r; };
const mixCache = new Map<string, string>();
const mixFor = (col: string, k: number) => { const key = `${col}${k}`; let m = mixCache.get(key); if (!m) { m = mix(col, INK, k); mixCache.set(key, m); } return m; };

export const drawBallroomArt = (c: Ctx, state: GameState, look: BallLook) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const f = state.frame, eye = eyeOf(state);
  const vis = (a: number, z: number) => z > v.x - 100 && a < v.x + v.w + 100;
  const L = x0 - 260, R = ARENA_R + 400;
  box(c, L, CEIL - 900, R - L, 900, '#0A0310');
  wallRun(c, eye, 'ball-wall', L, R, 200, 4, paintWallTile, 'rgba(10, 3, 18, 0.34)');
  ceiling(c, eye, L, R, ['#2A1238', '#24102F', '#1E0C28', '#180A22'], 100, '#3A2410');
  coffers(c, eye, L, R);
  inDepth(c, eye, WALL_D, () => {
    stamp(c, 'ball-buffet', BUF_X - 4, GY - 152, 252, 154, paintBuffet);
    stamp(c, 'ball-dj', DJ_X - 44, GY - 162, 240, 164, paintDJ);
    // (the tables dimmed a step: background, not stood on)
    c.fillStyle = 'rgba(10, 3, 18, 0.22)'; c.fillRect(BUF_X - 50, GY - 162, DJ_X + 250 - BUF_X, 162);
    // (the banner over the floor, between the pilasters)
    const { a, b } = bannerSpan();
    stamp(c, 'ball-banner', a - 40, CEIL + 16, b - a + 80, BANNER_Y + 30 - CEIL - 16, paintBanner);
  });
  // The floor: the parquet in the foyer, the light-up dance floor going back (its tiles going round their colors;
  // each tile beveled, the lit ones glowing in steps); batched by color, a few fills a row
  {
    const [s0, s1] = [Math.max(L, v.x - 200), Math.min(R, v.x + v.w + 200)];
    const rows = 3;
    const q = (xa: number, xb: number, e0: number, e1: number): P[] => [at(eye, xa, GY, e0), at(eye, xb, GY, e0), at(eye, xb, GY, e1), at(eye, xa, GY, e1)];
    for (let r = 0; r < rows; r++) {
      const d0 = WALL_D + (1 - WALL_D) * (r / rows), d1 = WALL_D + (1 - WALL_D) * ((r + 1) / rows), k = (rows - 1 - r) * 0.1, dd = d1 - d0;
      for (let x = Math.floor(s0 / 50) * 50; x < s1; x += 50) {
        const n = Math.floor(x / 50);
        if (x < END_L) {
          const col = mixFor(n % 2 ? '#78350F' : '#8A4A1C', k), rp = rampFor(col);
          toBatch(col, q(x, x + 50, d0, d1));
          toBatch(rp[1], q(x + 16, x + 17, d0, d1)); toBatch(rp[1], q(x + 33, x + 34, d0, d1));
          toBatch(rp[3], q(x + 1, x + 49, d0 + dd * 0.02, d0 + dd * 0.1));
        } else {
          const lit = (n + r * 3 + Math.floor(f / 30)) % 5 === 0;
          const col = mixFor(lit ? LIT[(n + r) % 4] : (n + r) % 2 ? '#2E1065' : '#4C1D95', k + (lit ? 0.12 : 0)), rp = rampFor(col);
          toBatch(rp[1], q(x, x + 50, d0, d1));
          toBatch(col, q(x + 3, x + 47, d0 + dd * 0.1, d1 - dd * 0.06));
          toBatch(rp[3], q(x + 3, x + 47, d0 + dd * 0.1, d0 + dd * 0.2));
          if (lit) { toBatch(rp[3], q(x + 12, x + 38, d0 + dd * 0.32, d1 - dd * 0.22)); toBatch(rp[4], q(x + 20, x + 30, d0 + dd * 0.44, d1 - dd * 0.34)); }
        }
      }
      flushBatch(c);
      box(c, s0, Math.round(eye.y + (GY - eye.y) * d0), s1 - s0, 1, '#1E0A33');
    }
    c.strokeStyle = '#1E0A33'; c.lineWidth = 1; c.beginPath();
    for (let x = Math.floor(s0 / 50) * 50; x < s1; x += 50) { const a = at(eye, x, GY, WALL_D), b = at(eye, x, GY, 1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.stroke();
    // (the near floor: the same tiles, cut at his plane: banded down)
    for (let x = Math.floor(s0 / 50) * 50; x < s1; x += 50) {
      const n = Math.floor(x / 50), foyer = x < END_L;
      const lit = !foyer && (n + 9 + Math.floor(f / 30)) % 5 === 0;
      const col = foyer ? (n % 2 ? '#78350F' : '#8A4A1C') : lit ? LIT[(n + 3) % 4] : n % 2 ? '#2E1065' : '#4C1D95';
      const r = rampFor(col);
      box(c, x, GY, 50, 400, r[1]); box(c, x, GY + 14, 50, 400, r[0]); checker(c, x, GY + 12, 50, 2, r[0]);
      box(c, x, GY, 50, 2, r[4]); box(c, x, GY + 2, 50, 2, r[3]); box(c, x + 49, GY, 1, 400, '#14061F');
      if (lit) box(c, x + 12, GY + 4, 26, 8, r[3]);
    }
  }
  // (once it's done: the scorch where the circle opened, in steps)
  if (look.cleared) {
    for (const [rx, d0, d1, col] of [[110, 0.93, 1.0, '#0A0505'], [80, 0.945, 0.99, '#2A0A0A'], [44, 0.955, 0.98, '#3B0A0A']] as const) {
      const pts: P[] = [];
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(at(eye, CIRCLE_X + Math.cos(a) * rx * (0.85 + hash(i) * 0.25), GY, (d0 + d1) / 2 + Math.sin(a) * (d1 - d0) / 2)); }
      c.fillStyle = col; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.fill();
    }
  }
  // The ends going back (in the fight's view, both show a strip of themselves): the arch, the kitchen's doors
  passageSide(c, eye, END_L, 1, ENTRY, '#2E1065', false);
  endWall(c, eye, END_R, -1, f);
  // The way in: the passage through the far left wall, the doors he kicked in flat on its floor
  if (vis(L, END_L + 100)) drawEntry(c, eye);
  // The stage's wall at the far right: the proscenium, the curtain
  if (vis(END_R, R)) stamp(c, 'ball-stage', END_R - 6, CEIL - 300, R - END_R + 6, GY - CEIL + 302, paintStage);
  if (!vis(ARENA_L - 100, ARENA_R + 100)) return;
  // The bandstand's riser: its top going back, the kit on it, its front
  riserTop(c, eye);
  inDepth(c, eye, KIT_D, () => stamp(c, 'ball-kit', RISER.x - 4, GY - RISER.h - 72, RISER.w + 8, 74, paintKit));
  stamp(c, 'ball-riser', RISER.x - 64, GY - RISER.h - 24, RISER.w + 70, RISER.h + 26, paintRiser);
  // Fog machines in the corners, puffing
  fogMachine(c, ARENA_L + 20, f, 1);
  fogMachine(c, ARENA_R - 175, f, -1);
  // Gold chairs round the edge (clear of the DJ's banner), one or two over once it's done
  for (let i = 0; i < 4; i++) { const cx = ARENA_L + CHAIR_X[i], over = look.cleared && i % 2 === 1; c.save(); c.translate(cx, 0); stamp(c, `ball-chair-${over ? 'o' : 'u'}`, -40, GY - 80, 80, 82, g => paintChair(g, 0, over)); c.restore(); }
  // The chandeliers: the ring stood on, crystals glinting, the bulbs flickering
  for (const ch of CHANDELIERS) {
    const top = GY - ch.h;
    c.save(); c.translate(ch.x, 0);
    stamp(c, 'ball-chandelier', -4, CEIL - 2, ch.w + 8, top - CEIL + 82, g => paintChandelier(g, 0, top, ch.w));
    c.restore();
    const ps = prismsOf(ch.w);
    for (let i = 0; i < ps.length; i++) {
      if ((i * 5 + Math.floor(f / 7)) % 6) continue;
      const gx = Math.round(ch.x + ps[i][0]), gy = top + ps[i][1] + 3;
      box(c, gx - 1, gy - 2, 1, 5, '#FFFFFF'); box(c, gx - 3, gy, 5, 1, '#FFFFFF');
    }
    for (const cx of [ch.x + 4, ch.x + ch.w - 10]) { const fl = Math.floor(f / 6 + cx) % 2; box(c, cx + 1, top - 19 - fl, 4, 7 + fl, '#FCD34D'); box(c, cx + 2, top - 17, 2, 4, '#FFFFFF'); }
  }
  // The disco ball over the middle of the floor (its spots going round the walls); down once it's all over
  if (!look.ballDown) {
    const sw = look.swing ?? 0;
    if (Math.abs(sw) < 0.004) box(c, ARENA_MID - 1, CEIL, 2, GY - 382 - CEIL, '#71717A');
    else {
      // (swinging: the wire in 2px steps along it, the ball at its end, its spots swept about with it)
      const sx = Math.sin(sw), sy = Math.cos(sw);
      for (let k = 0; k < BALL_WIRE - 16; k += 2) box(c, ARENA_MID + sx * k - 1, CEIL + sy * k, 2, 2, '#71717A');
    }
    const bx = ARENA_MID + Math.sin(sw) * BALL_WIRE, by = CEIL + Math.cos(sw) * BALL_WIRE;
    discoBall(c, bx, by, 16, f, sw * 3);
    for (let i = 0; i < 8; i++) { const a = f * 0.01 + i * 0.8 + sw * 4; box(c, bx + Math.cos(a) * 340, GY - 250 + Math.sin(a * 1.7) * 140, 4, 4, ['#F472B6', '#60A5FA', '#FDE047', '#FFFFFF'][i % 4]); }
  } else if (look.cleared) discoBall(c, ARENA_MID - 160, GY - 14, 14, 0);
};

/** The disco ball's facets turned by `rot`, shaded by where they sit (the light up-left stays put). */
const BALL_SH = ['#3F3F46', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];
const paintBallFacets = (c: Ctx, x: number, y: number, r: number, rot: number) => {
  const cs = Math.cos(rot), sn = Math.sin(rot), n = Math.floor(r / 3.2);
  for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
    const ox = i * 3.2, oy = j * 3.2;
    if (ox * ox + oy * oy > (r * 0.9) ** 2) continue;
    const fx = ox * cs - oy * sn, fy = ox * sn + oy * cs;
    const lum = 0.55 - ((ox * 0.5 + oy * 0.65) / r) * 0.55 - ((ox * ox + oy * oy) / (r * r)) * 0.25;
    box(c, Math.round(x + fx) - 1, Math.round(y + fy) - 1, 2, 2, BALL_SH[Math.max(0, Math.min(4, Math.round(lum * 4)))]);
  }
};
/** The disco ball: its cap, a dark body, a grid of shaded facets (stamped while it hangs still; live only while it
 *  swings or rolls), a few sparkles going round it. */
export const discoBall = (c: Ctx, x: number, y: number, r: number, f: number, rot = 0) => {
  box(c, x - 3, y - r - 4, 6, 5, INK); box(c, x - 2, y - r - 3, 4, 3, '#A1A1AA');
  if (Math.abs(rot) < 0.01) {
    c.save(); c.translate(x, y);
    stamp(c, `ball-disco-${r}`, -r - 2, -r - 2, r * 2 + 4, r * 2 + 4, g => { ball(g, 0, 0, r, '#52525B'); paintBallFacets(g, 0, 0, r, 0); });
    c.restore();
  } else { ball(c, x, y, r, '#52525B'); paintBallFacets(c, x, y, r, rot); }
  for (let i = 0; i < 3; i++) {
    const a = f * 0.05 + i * 2.1;
    if (Math.cos(a) > 0.4) continue;
    const sx = Math.round(x + Math.cos(a) * r * 0.55), sy = Math.round(y + Math.sin(a * 1.3) * r * 0.5);
    box(c, sx - 1, sy - 3, 2, 6, '#FFFFFF'); box(c, sx - 3, sy - 1, 6, 2, '#FFFFFF');
  }
};

// The way in, at the far left: the end wall's doorway done as a passage through it (control/passage.ts), the way the
// shop's end has it: over his head its lintel; through it, its back wall (the shop's rock giving way to the flock at
// the doors' frame), the shop's carpet giving way to the foyer's parquet; the doors he kicked in flat on its floor;
// its near jambs sliding past in front of him.
// (its threshold's at the far side of the doors' frame: through the frame, the shop)
const ENTRY: Passage = { A: x0 - 260, B: END_L, H: GY - 204, top: CEIL - 300, dp: 0.935, near: 1.09, split: DOOR_X + 64 };

const paintEntryRear = (g: Ctx) => {
  const { A, B, H, split } = ENTRY;
  rockWall(g, A, split, H, GY, 5);
  box(g, A, H, split - A, GY - H, 'rgba(70, 6, 6, 0.18)');
  damask(g, split, H, B - split, GY - 118 - H, false);
  wainscot(g, split, B - split);
  box(g, A, H, B - A, 6, 'rgba(0, 0, 0, 0.35)');
};
const paintEntryLintel = (g: Ctx) => {
  const { A, B, H, top } = ENTRY;
  box(g, A, top, B - A, CEIL - top + 2, FL[0]);
  damask(g, A, CEIL + 18, B - A, H - 16 - CEIL - 18, false);
  hazeBands(g, A, CEIL + 18, B - A, 150, '#0A0310', 0.6, 0, 6);
  cornice(g, A, B - A);
  slab(g, A, H - 16, B - A, 16, GILT[3], { edge: 2 });
  eggDart(g, A + 2, H - 12, B - A - 4);
  box(g, A, H - 3, B - A, 2, GILT[1]);
};
const drawEntry = (c: Ctx, eye: Eye) => {
  passageBack(c, eye, ENTRY, 'ball-entry-rear', paintEntryRear, '#741A1A', '#8A4A1C', '#2E1065');
  // (the doors he kicked in: torn off, flat on the floor this side of their frame)
  drawBallDoors(c, eye, DOOR_X, { kind: 'down' });
  passageLintel(c, ENTRY, 'ball-entry-lintel', paintEntryLintel);
  box(c, END_L - 1, ENTRY.top, 2, ENTRY.H - ENTRY.top, INK);
};
/** World space, in front of everything: the way in's near jambs and lintel edge (off screen in the fight's view). */
export const drawBallroomFront = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > END_L + 300) return;
  passageFront(c, eyeOf(state), ENTRY, '#7A5A10');
};

/** The stage's wall: a fluted gilt proscenium post, the frieze over it; the red velvet curtain in deep folds (each
 *  fold a ramp across, the crests lit), a swagged valance with bullion fringe and tassels on a carved pelmet, the hem
 *  pooled on the floor, fringe along it. */
const paintStage = (g: Ctx) => {
  const L = END_R, R = ARENA_R + 400, top = CEIL - 300;
  box(g, L, top, R - L, GY - top, '#1A0530');
  const FOLD = [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 0, 0];
  for (let x = L + 26; x < R; x++) { const k = (x - L - 26) % 22; box(g, x, CEIL, 1, GY - CEIL, k === 0 ? INK : VR[FOLD[k]]); }
  for (let x = L + 26; x < R; x += 22) {
    inked(g, () => { g.ellipse(x + 11, GY - 3, 12, 6, 0, Math.PI, 0); g.closePath(); }, VR[2], 1);
    fillPath(g, VR[4], () => { g.ellipse(x + 9, GY - 5, 6, 2, 0, Math.PI, 0); g.closePath(); });
  }
  box(g, L + 26, GY - 3, R - L - 26, 3, VR[0]);
  for (let x = L + 26; x < R; x += 2) box(g, x, GY - 3, 1, 3, x % 4 ? GILT[4] : GILT[2]);
  for (let x = L + 26; x < R; x += 60) swag(g, x, x + 60, CEIL + 30, 9, VR, 20, 7);
  for (let x = L + 26; x <= R; x += 60) { rosette(g, x, CEIL + 34, 4); tassel(g, x, CEIL + 38, 22); }
  slab(g, L, CEIL - 6, R - L, 36, GILT[3], { edge: 3 });
  eggDart(g, L + 3, CEIL + 4, R - L - 6, 10);
  beads(g, L + 3, CEIL + 18, R - L - 6);
  box(g, L, top, R - L, CEIL - 6 - top, FL[1]);
  for (let x = L + 30; x < R; x += 60) rosette(g, x, CEIL - 30, 6);
  // (the proscenium's post: fluted gilt, its capital, its plinth)
  pole(g, L, CEIL + 30, 26, GY - CEIL - 30, GILT[3]);
  for (const fx of [L + 5, L + 11, L + 17]) { box(g, fx, CEIL + 60, 2, GY - CEIL - 100, GILT[1]); box(g, fx + 2, CEIL + 60, 1, GY - CEIL - 100, GILT[5]); }
  for (let i = 0; i < 4; i++) leaf(g, L - 1 + i * 7, CEIL + 34, 7, 18);
  slab(g, L - 4, CEIL + 28, 34, 6, GILT[4], { edge: 1 });
  profile(g, L - 4, GY - 34, 34, [[INK, 1], [GILT[5], 1], [GILT[3], 2]]);
  slab(g, L - 4, GY - 30, 34, 30, GILT[2], { edge: 2 });
  box(g, L - 1, top, 2, CEIL + 30 - top, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The light: dim and purple; the chandeliers warm, the footlights, the circle's red once it's open

export const ballroomLighting = (state: GameState, circle: number): SceneLight => {
  const lights: Light[] = [];
  for (const ch of CHANDELIERS) lights.push({ x: ch.x + ch.w / 2, y: GY - ch.h - 10, r: 230, a: 0.75, color: 'rgba(253, 224, 160, 0.07)' });
  lights.push({ x: ARENA_MID, y: GY - 366, r: 120, a: 0.5 });
  lights.push({ x: RISER.x + RISER.w / 2, y: GY - RISER.h - 20, r: 110, a: 0.45, color: 'rgba(253, 224, 160, 0.06)' });
  lights.push(...pitLights(circle, state.frame));
  // (the shop's red through the doorway he kicked in)
  lights.push({ x: DOOR_X + 20, y: GY - 70, r: 140, a: 0.55, color: 'rgba(220, 38, 38, 0.08)' });
  return { dark: 0.3, shade: [18, 4, 30], lights };
};

void CANVAS_HEIGHT; void GOLD; void VELVET;
