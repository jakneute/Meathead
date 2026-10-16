// Foreign Lands' crude painting kit (the first pass: readable boxes, on Hollywood's boulevard kit, hollywood/blvd/kit.ts,
// so the SNES pass can lift every piece straight onto its ramps): the fake 3D (one eye for the scene, Spooky Land's:
// a box's top and sides going back toward it, straight walls, things farther back dimmed), what he can stand on read
// as standable (a lit lip along its top), the scenery (facades, set back and dimmed: never mistaken for somewhere to
// stand), the promenade along the lagoon, and the pavilions' signs: held up (on posts, hung off a frame, bolted to a
// facade), every pavilion's own lettering (the park's alphabet, signLetters.ts), never over by anything.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import {
  box, mix, checker, hash, at, atDepth, poly, viewOf, timeOfDay, hourMix, signText, signW, signH,
  INK, LIP, ramp6, hour, dimmed, slab, post, topBack, sideBack, board, words, deco, paint, plain, type View, type Look,
} from '../hollywood/blvd/kit';
import { rampDown, tone } from '../signLetters';
import { GY } from './geometry';

export { box, mix, checker, hash, at, atDepth, poly, viewOf, timeOfDay, hourMix, signText, signW, signH, INK, LIP, ramp6, hour, dimmed, slab, post, topBack, sideBack, board, words, deco, paint, plain, rampDown, tone };
export type { View, Look };
export type Ctx = CanvasRenderingContext2D;

/** Where the pavilions' facades stand (back from the play plane: scenery), and the lagoon's railing. */
export const FACADE_D = 0.88, RAIL_D = 0.8;

/** On screen, world x a..b at depth d (by where it's drawn: no pop-in)? */
export const onScreen = (v: View, a: number, b: number, d = 1, pad = 80) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + CANVAS_WIDTH + pad;
};

// ---------------------------------------------------------------------------------------------------------------
// Boxes in the play plane (what he stands on and walks into): the top and the side he can see going back, then the
// front. Standable: the lit lip along the front's top edge.

export interface Box3 { x: number; top: number; w: number; bottom: number; col: string; standable?: boolean; back?: number }
/** The faces going back (draw every box's before any box's front: nothing going back over something nearer). */
export const box3Back = (c: Ctx, v: View, b: Box3) => {
  const R = ramp6(hour(b.col)), d1 = b.back ?? 0.93;
  topBack(c, v.eye, b.x, b.x + b.w, b.top, 1, d1, R, 2);
  sideBack(c, v.eye, b.x, -1, b.top, b.bottom, 1, d1, R, 2, false);
  sideBack(c, v.eye, b.x + b.w, 1, b.top, b.bottom, 1, d1, R, 2, false);
};
export const box3Front = (c: Ctx, b: Box3) => {
  const R = ramp6(hour(b.col));
  slab(c, b.x, b.top, b.w, b.bottom - b.top, R, b.bottom - b.top > 40);
  box(c, b.x, b.top, b.w, 1, INK);
  if (b.standable) { box(c, b.x, b.top, b.w, 3, LIP[2]); box(c, b.x, b.top, b.w, 1, LIP[3]); }
};
/** A lot of boxes, in the right order (all the going-back faces, then the fronts). */
export const boxes3 = (c: Ctx, v: View, list: Box3[]) => {
  const vis = list.filter(b => onScreen(v, b.x, b.x + b.w, 1));
  for (const b of vis) box3Back(c, v, b);
  for (const b of vis) box3Front(c, b);
};
/** A one-way ledge he can stand on (a terrace, a beam, a balcony): its front, its top going back, the lit lip. */
export const ledge3 = (c: Ctx, v: View, x: number, y: number, w: number, col: string, thick = 16) => {
  const R = ramp6(hour(col));
  topBack(c, v.eye, x, x + w, y, 1, 0.94, R, 2);
  box(c, x, y, w, thick, R[2]); box(c, x, y + thick - 3, w, 3, R[1]); box(c, x, y + thick, w, 1, INK);
  box(c, x, y, w, 3, LIP[2]); box(c, x, y, w, 1, LIP[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// Scenery, set back (dimmed: not somewhere to stand)

/** A facade standing on the ground at depth d: `paint` draws it as if at the play plane, local x 0 at its left, y 0 at
 *  its foot (it's scaled back toward the eye). */
export const setBack = (c: Ctx, v: View, x: number, w: number, d: number, paint: () => void) => {
  if (!onScreen(v, x, x + w, d)) return;
  atDepth(c, v.eye, d, () => { c.save(); c.translate(x, GY); paint(); c.restore(); });
};
/** A flat wall (dimmed), local to setBack: its left foot at (x, 0), `h` up. */
export const wall = (c: Ctx, x: number, w: number, h: number, col: string, trim?: string) => {
  const R = ramp6(dimmed(col));
  slab(c, x, -h, w, h, R);
  box(c, x - 1, -h - 1, w + 2, 1, INK);
  if (trim) { box(c, x - 4, -h - 6, w + 8, 6, dimmed(trim)); box(c, x - 4, -h - 6, w + 8, 1, mix(dimmed(trim), '#FFFFFF', 0.3)); }
};
/** A dark doorway or window (local to setBack). */
export const hole = (c: Ctx, x: number, y: number, w: number, h: number, glow = false) => {
  const lamps = timeOfDay().lamps;
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, glow && lamps > 0.3 ? mix('#3A2410', '#FCD34D', 0.6 * lamps) : '#1C1014');
  if (glow && lamps > 0.3) box(c, x, y, w, 2, '#FDE68A');
};

// ---------------------------------------------------------------------------------------------------------------
// The promenade (along the lagoon: pale pavers, their joints, a lit edge; going back to the railing over the water)

export const promenade = (c: Ctx, v: View, x0: number, x1: number, top = '#D6CBB4', face = '#8C7F68') => {
  const a = Math.max(x0, v.cam.x - 120), b = Math.min(x1, v.cam.x + CANVAS_WIDTH + 120);
  if (b <= a) return;
  const R = ramp6(hour(top));
  topBack(c, v.eye, a, b, GY, 1, RAIL_D, R, 3);
  // (the pavers' joints going back toward the lagoon)
  c.strokeStyle = mix(R[2], INK, 0.2); c.lineWidth = 1;
  for (let x = Math.ceil(a / 80) * 80; x < b; x += 80) { const [px0, py0] = at(v.eye, x, GY, 1), [px1, py1] = at(v.eye, x, GY, RAIL_D); c.beginPath(); c.moveTo(px0, py0); c.lineTo(px1, py1); c.stroke(); }
  // (the railing at the water's edge: posts and a rail, iron)
  const [ra] = at(v.eye, a, GY, RAIL_D), [rb] = at(v.eye, b, GY, RAIL_D), [, ry] = at(v.eye, a, GY, RAIL_D);
  box(c, ra, ry - 30 * RAIL_D, rb - ra, 3, dimmed('#2A2A2E'));
  for (let x = Math.ceil(a / 60) * 60; x < b; x += 60) { const [px] = at(v.eye, x, GY, RAIL_D); box(c, px, ry - 30 * RAIL_D, 2, 30 * RAIL_D, dimmed('#2A2A2E')); }
  // (the front: the paving's edge, lit, then the dark under it)
  const F = ramp6(hour(face));
  box(c, a, GY, b - a, 400, F[2]); box(c, a, GY, b - a, 6, F[3]);
  checker(c, a, GY + 6, b - a, 4, F[1], 0, 2);
  box(c, a, GY, b - a, 3, LIP[2]); box(c, a, GY, b - a, 1, LIP[3]);
  for (let x = Math.ceil(a / 80) * 80; x < b; x += 80) box(c, x, GY + 3, 1, 14, F[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// Signs (held up: on two posts, or hung off a frame; each pavilion its own lettering)

/** A pavilion's sign on two posts, standing at world x on the ground at feetY (the board's middle `up` over it). */
export const postBoard = (c: Ctx, x: number, feetY: number, lines: string[], L: Look, bg: string, frame?: string[], up = 110) => {
  // (the board's size first, to put the posts under its ends)
  const lh = signH(L) + Math.max(2, (L.sy ?? 1) * 2), pad = 6;
  const w = Math.round(Math.max(...lines.map(l => signW(l, L))) + pad * 2), h = Math.round(lh * lines.length + pad * 1.5);
  const y = feetY - up;
  const P = ramp6(hour('#5C4630'));
  post(c, x - w / 2 + 8, y, feetY, 6, P); post(c, x + w / 2 - 8, y, feetY, 6, P);
  board(c, x, y, lines, L, bg, frame);
  return [w, h];
};
/** A sign hung by two chains off something over it at hangY (a beam, an arch), its middle at y. */
export const hungBoard = (c: Ctx, x: number, hangY: number, y: number, lines: string[], L: Look, bg: string, frame?: string[]) => {
  const lh = signH(L) + Math.max(2, (L.sy ?? 1) * 2);
  const w = Math.round(Math.max(...lines.map(l => signW(l, L))) + 12), h = Math.round(lh * lines.length + 9);
  for (const sx of [x - w / 2 + 6, x + w / 2 - 6]) { box(c, sx, hangY, 1, y - h / 2 - hangY, INK); for (let k = hangY; k < y - h / 2; k += 4) box(c, sx - 1, k, 3, 2, '#71717A'); }
  board(c, x, y, lines, L, bg, frame);
};

// ---------------------------------------------------------------------------------------------------------------
// Bits every pavilion hangs about

/** A string of little flags or bulbs swagged between two points (papel picado, bunting, lights). */
export const swag = (c: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, cols: string[], kind: 'flags' | 'bulbs' | 'lanterns' = 'flags', step = 18) => {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.stroke();
  const lamps = timeOfDay().lamps;
  for (let i = 1; i < n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t), col = cols[i % cols.length];
    if (kind === 'flags') { poly(c, [[x - 6, y], [x + 6, y], [x + 6, y + 10], [x + 3, y + 13], [x, y + 10], [x - 3, y + 13], [x - 6, y + 10]], dimmed(col)); box(c, x - 4, y + 3, 2, 2, mix(dimmed(col), '#FFFFFF', 0.4)); box(c, x + 1, y + 6, 2, 2, mix(dimmed(col), '#FFFFFF', 0.4)); }
    else if (kind === 'bulbs') { box(c, x - 2, y, 4, 5, lamps > 0.3 ? '#FEF3C7' : mix(col, '#FFFFFF', 0.3)); box(c, x - 1, y + 5, 2, 1, INK); }
    else lantern(c, x, y + 4, 7, col);
  }
};
/** A paper lantern (red, a gold band top and bottom, a tassel), glowing after dark. */
export const lantern = (c: Ctx, x: number, y: number, r: number, col = '#DC2626') => {
  const lamps = timeOfDay().lamps, body = lamps > 0.3 ? mix(col, '#FDE68A', 0.45 * lamps) : dimmed(col);
  box(c, x - r - 1, y - r * 0.8 - 1, r * 2 + 2, r * 1.6 + 2, INK);
  box(c, x - r, y - r * 0.8, r * 2, r * 1.6, body);
  box(c, x - r, y - r * 0.8, r * 2, 2, '#CA8A04'); box(c, x - r, y + r * 0.8 - 2, r * 2, 2, '#CA8A04');
  box(c, x - r + 2, y - r * 0.5, 2, r, mix(body, '#FFFFFF', 0.35));
  box(c, x - 1, y + r * 0.8, 2, r * 0.7, '#CA8A04');
};
/** A flag on a pole (world: the pole's foot on the ground at x), its stripes. Waving. */
export const flagPole = (c: Ctx, x: number, feetY: number, h: number, stripes: string[], f: number, vertical = false) => {
  const P = ramp6(hour('#9CA3AF'));
  post(c, x, feetY - h, feetY, 4, P);
  box(c, x - 3, feetY - h - 4, 6, 4, '#CA8A04');
  const fw = 48, fh = 30, top = feetY - h + 2;
  for (let i = 0; i < fw; i += 4) {
    const wave = Math.sin(f * 0.08 + i * 0.12) * 2;
    stripes.forEach((col, k) => {
      if (vertical) { const band = Math.floor((i / fw) * stripes.length); if (band === k) box(c, x + 2 + i, top + wave, 4, fh, hour(col)); }
      else box(c, x + 2 + i, top + wave + (k * fh) / stripes.length, 4, Math.ceil(fh / stripes.length), hour(col));
    });
  }
};

/** A seeded pick 0..1 for a pavilion's bits. */
export const rnd = (n: number) => hash(n * 7.13 + 1.7);
export const viewIn = (state: GameState) => viewOf(state);
/** Lettering looks for each pavilion (the park's alphabet, set each pavilion's way). */
export const LOOKS = {
  /** Mexico: a festive painted hand, hot pink and marigold, a dark drop. */
  mexico: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#F472B6', 0.3), dither: true, shadow: '#3B0764', drop: 1, gap: 1 }),
  /** Norway: carved into wood, a rune-ish lean. */
  norway: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FDE68A', 0.25), grain: '#B45309', lip: '#78350F', slant: 0.4, gap: 1 }),
  /** China: gold on red lacquer, bold. */
  china: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FCD34D', 0.35), dither: true, bold: s >= 2, shadow: '#450A0A', drop: 1, gap: 1 }),
  /** Germany: blackletter-ish (serifs, bold, gold leaf). */
  germany: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FBBF24', 0.3), serif: true, ink: '#1C1917', gap: 2 }),
  /** Italy: a sign-painter's cream script-ish (serifs, a lean), red shadow. */
  italy: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FEF3C7', 0.2), serif: true, slant: 0.5, shadow: '#991B1B', drop: 1, gap: 2 }),
  /** Japan: brush-ish black on white paper, heavy, a red hanko-ish drop. */
  japan: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#1C1917', 0.15), bold: s >= 2, shadow: '#DC2626', drop: 1, gap: 1 }),
  /** Morocco: tile-blue and gold, a raised edge. */
  morocco: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FCD34D', 0.3), hi: '#FEF9C3', ink: '#1E3A8A', gap: 1 }),
  /** France: thin gold serifs on bistro green, a lean. */
  france: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FDE68A', 0.25), serif: true, slant: 0.3, ink: '#14532D', gap: 2 }),
  /** The UK: enamel-sign white on red, bold, a dark drop. */
  uk: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#F8FAFC', 0.15), bold: s >= 2, shadow: '#1E3A8A', drop: 1, gap: 1 }),
  /** Canada: routed into a plank (carved, wood grain), lumber-camp yellow. */
  canada: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#FDE68A', 0.3), grain: '#92400E', lip: '#78350F', gap: 1 }),
  /** The land's own (the gate, the PA horns): red, white and blue, stars-and-stripes loud. */
  land: (s = 2): Look => ({ sx: s, sy: s + 1, fill: rampDown('#F8FAFC', 0.2), ink: '#1E3A8A', shadow: '#991B1B', drop: 2, gap: 1 }),
} as const;
