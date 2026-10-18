// Timber Tumble's painting kit (the final pass: peak SNES, matched to the wilds' (wilds/paint.ts), the train's
// (train/paint.ts) and the town's (town/paint.ts): the same pine planks, fiberglass, steel, bark). The ride's own
// materials in stepped ramps (darkest first), lit from the upper left, inked round: the park's flume water (pool-blue,
// chlorinated), the sewer's brick and sludge and its concrete, rust; then past the culvert the REAL river (greener,
// browner, cold), real rock, moss and lichen, and the logging crew's orange and hi-vis.
//
// Still art goes through the train's still(): painted once for the hour into its own canvas and put down after that,
// cached under the slopes' tilt (the flume's pieces are drawn turned along the lift hill and the drops).

import { timeOfDay, farTint, skyAt, hourMix } from '../../timeOfDay';
import {
  box, checker, mix, hash, INK, slab, post, ball, fiberglass, pine, near, dimmed, rampOf, FIBER, STONE, DIRT, GRASS, NEEDLE, BARK,
  PLANK, PLY, STEEL, WATER, LIP, FIBER_LIP, bandedGradient, hazeBands, pixelBlob, still, stillAt, planks, boards, lip, glass, warmth,
  puff, flame, rivets, part, TOPLIP, BRASS,
} from '../train/paint';
import { clump, at, poly, OAK } from '../wilds/paint';
import { signText, type Look } from '../../signLetters';

export {
  box, checker, mix, hash, INK, slab, post, ball, fiberglass, pine, near, dimmed, rampOf, FIBER, STONE, DIRT, GRASS, NEEDLE, BARK,
  PLANK, PLY, STEEL, WATER, LIP, FIBER_LIP, bandedGradient, hazeBands, pixelBlob, still, stillAt, planks, boards, lip, glass, warmth,
  puff, flame, rivets, part, TOPLIP, BRASS, clump, at, poly, OAK, timeOfDay, farTint, skyAt, hourMix,
};
export type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The ride's own materials (darkest first)

/** The park's flume water: pool-blue, chlorinated, too clean. */
export const POOL = ['#062234', '#0A3450', '#0E4A6C', '#14628A', '#1E7EA6', '#3A9CC0', '#6CC0DA', '#A8E0EE', '#E4F8FC'];
/** The real river: colder, greener-brown, peat in it. */
export const RIVER = ['#06120E', '#0C1E18', '#122C24', '#1A3C32', '#245044', '#326656', '#4A806C', '#7AA898', '#C4DCD2'];
/** Sewer brick: sooty red-brown, wet. */
export const BRICK = ['#140C08', '#22140E', '#341E14', '#4A2A1C', '#603826', '#784A32', '#925E42'];
/** Mortar and old concrete (the culvert, the busted sections, the headwall). */
export const CONCRETE = ['#1E1C1A', '#34322E', '#4C4944', '#66625C', '#827D76', '#A09A92', '#C4BEB4'];
/** Sludge: brown-green, a sheen on it. */
export const SLUDGE = ['#0E0E04', '#1A1A08', '#28280C', '#383812', '#4A4A1A', '#606024', '#7C7A34', '#A2A05A'];
/** Rust (the hangers, the rebar, the outfalls' weep). */
export const RUST = ['#1E0A04', '#381206', '#561C0A', '#74280E', '#923A16', '#B05222', '#CC7034'];
/** Moss on real rock and wet brick. */
export const MOSS = ['#0A1406', '#14240A', '#1E3410', '#2A4616', '#3A5C1C', '#507624', '#6C9230'];
/** Real river rock: cold blue-gray granite with lichen on it. */
export const GRANITE = ['#101216', '#1C2026', '#2C3038', '#3E434C', '#535862', '#6C727C', '#8E949C', '#B4B8BE'];
/** The logging crew's orange (the chipper, the saws' bodies, the chaps). */
export const ORANGE = ['#3A1404', '#622208', '#8E340C', '#B84A12', '#E06A1A', '#F28E3A', '#FAB66A'];
/** Hi-vis lime. */
export const HIVIS = ['#2A3608', '#46580E', '#667E14', '#8AA81C', '#B2D02A', '#D2EA4A', '#ECFA8A'];
/** The ride's logs: molded fiberglass painted as bark (too even, too brown). */
export const FAKEBARK = ['#1E0E06', '#341A0C', '#4E2A14', '#6A3C1E', '#86502A', '#A46A3A', '#C28A50'];
/** The logs' cut ends (painted rings). */
export const RINGS = ['#5A3A1E', '#7E5630', '#A07444', '#C29660', '#DAB47C', '#ECCE9A'];
/** Canvas (the camp's tents). */
export const CANVAS = ['#3A3020', '#5A4C34', '#7E6E50', '#A8966E', '#C8B890', '#E2D6B2', '#F4ECD2'];

/** Ramps for the hour, made once per hour (k: how far into the hour's light). */
const RAMPS = new Map<string, string[]>();
export const hr = (name: string, R: string[], k = 0.18) => {
  const key = `${name}-${k}-${timeOfDay().key}`;
  let r = RAMPS.get(key);
  if (!r) { const tod = timeOfDay(); r = R.map(c => farTint(c, k, tod)); RAMPS.set(key, r); }
  return r;
};
/** Indoors and underground the hour doesn't reach (the station, the shed, the sewer): the ramp as it is. */
export const asIs = (R: string[]) => R;

/** A stepped band of `n` rows down a box, from `cols[0]` at the top, dithered between rows. */
export const bands = (g: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => {
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const y0 = y + (i * h) / n;
    box(g, x, y0, w, h / n + 1, cols[i]);
    if (i) checker(g, x, y0 - 1, w, 2, cols[i - 1], i % 2);
  }
};

/** A brick course run (mortar, the bricks offset row by row, each lit along its top, a few darker or missing). */
export const brickwork = (g: Ctx, x: number, y: number, w: number, h: number, B: string[], M: string[], seed = 0, bh = 8, bw = 20) => {
  box(g, x, y, w, h, M[2]);
  for (let r = 0, yy = y; yy < y + h; yy += bh, r++) {
    for (let xx = x - ((r % 2) * bw) / 2; xx < x + w; xx += bw) {
      const k = hash(seed + r * 31 + Math.floor(xx));
      if (k < 0.04) continue;
      const col = k < 0.2 ? B[2] : k > 0.85 ? B[4] : B[3];
      box(g, xx + 1, yy + 1, bw - 2, bh - 2, col);
      box(g, xx + 1, yy + 1, bw - 2, 1, mix(col, '#FFFFFF', 0.12));
      box(g, xx + 1, yy + bh - 2, bw - 2, 1, B[1]);
    }
  }
};

/** Real-world lettering (no park alphabet): hand-painted with a brush, thick and uneven, or sprayed. */
export const handPainted = (col: string, cell = 1): Look => ({ sx: cell, sy: cell, fill: [col, col, col, mix(col, '#000000', 0.25)], dither: false, wobble: 1, seed: 7, drip: { col: mix(col, '#000000', 0.15), rate: 0.35, len: 4 } });

/** A plywood sign of the real world (spray-painted on a sheet of ply nailed to two stakes): no park lettering, no
 *  burned planks: `lines` top to bottom. World space, its feet at (x, feet). */
export const crewSign = (c: Ctx, x: number, feet: number, lines: string[], opts: { col?: string; tall?: number; seed?: number } = {}) => {
  const w = Math.max(...lines.map(l => l.length * 6 + 16)), h = lines.length * 12 + 8, tall = opts.tall ?? 72, top = feet - tall, seed = opts.seed ?? 0;
  stillAt(c, `crewsign-${lines.join('|')}-${tall}`, x, feet, -w / 2 - 10, -tall - 8, w + 20, tall + 12, g => {
    const P = hr('ply', PLY), D = hr('dirt', DIRT), S = hr('stake', BARK);
    // (two raw stakes, split, pounded in crooked)
    for (const [px, lean] of [[-w / 2 + 8, -0.04], [w / 2 - 8, 0.05]] as const) {
      g.save(); g.translate(px, 0); g.rotate(lean);
      box(g, -3, -tall - 2, 6, tall + 2, INK); box(g, -2, -tall - 2, 4, tall + 2, S[4]); box(g, -2, -tall - 2, 1, tall + 2, S[6]); box(g, 1, -tall - 2, 1, tall + 2, S[2]);
      g.restore();
    }
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, w / 2 + 6, 3, 0, Math.PI, 0); g.fill(); g.fillStyle = D[3]; g.beginPath(); g.ellipse(0, 0, w / 2 + 5, 2, 0, Math.PI, 0); g.fill();
    // (the sheet: weathered ply, its plies showing at the edge, a corner broken off, water stain, nails)
    const t = top - feet;
    box(g, -w / 2 - 1, t - 1, w + 2, h + 2, INK);
    box(g, -w / 2, t, w, h, P[4]); box(g, -w / 2, t, w, 1, P[5]); box(g, -w / 2, t + h - 2, w, 2, P[2]);
    for (let gy = t + 3; gy < t + h - 2; gy += 4) box(g, -w / 2 + 2 + hash(seed + gy) * 10, gy, w * (0.3 + hash(seed + gy * 3) * 0.5), 1, P[3]);
    box(g, w / 2 - 14, t + h - 10, 10, 8, mix(P[3], '#3A3020', 0.4));
    g.fillStyle = INK; g.beginPath(); g.moveTo(w / 2 + 1, t - 1); g.lineTo(w / 2 - 6, t - 1); g.lineTo(w / 2 + 1, t + 6); g.closePath(); g.fill();
    for (const nx of [-w / 2 + 5, w / 2 - 7]) { box(g, nx, t + 3, 2, 2, STEEL[1]); box(g, nx, t + h - 5, 2, 2, STEEL[1]); }
    lines.forEach((l, i) => signText(g, l, 0, t + 12 + i * 12, handPainted(opts.col ?? '#C81E1E')));
  });
};

void mix; void hazeBands; void skyAt; void hourMix;
