// What's along the streets, lot by lot, so it isn't the same row of houses the
// whole way: the painted ladies up round Haight, the head shops, a park at the
// top of a hill, Lombard, the Mission's taquerias and murals, the glass boxes of
// the startups south of Market, Chinatown under its lanterns, and the houses
// again out toward the Presidio. Cross streets between the districts, each with
// its sign. (The quakes need to know it too: things only come down off buildings.)

import type { GroundRun } from '../../core/terrain';
import { runYAt } from '../../core/terrain';
import { GROUND_Y } from '../../../constants';
import { COURSE, HOUSES_END } from './course';

export type LotKind = 'victorian' | 'shop' | 'taqueria' | 'glass' | 'chinatown' | 'park' | 'cross';
export interface Lot { i: number; x: number; kind: LotKind; name: string }

export const LOT_W = 170;

const V = 'victorian', S = 'shop', T = 'taqueria', G = 'glass', C = 'chinatown', P = 'park', X = 'cross';
const PLAN: [LotKind, string?][] = [
  [V], [V], [V], [X, 'HAIGHT ST'], [S, 'TIE-DYE'], [S, 'VINYL'], [S, 'SMOKE SHOP'], [V], [P, 'ALAMO SQ'], [P],
  [V], [V], [V], [X, 'LOMBARD ST'], [V], [V], [V], [V], [S, 'KOMBUCHA BAR'], [X, 'VALENCIA ST'],
  [T, 'TAQUERIA'], [S, '$14 TOAST'], [T, 'BURRITOS'], [S, 'BOBA'], [X, 'MISSION ST'], [G, 'DISRUPTR'], [G, 'APPZILLA'], [G, 'SYNERGY.AI'], [G, 'UBERIFY'], [X, 'MARKET ST'],
  [C, 'DIM SUM'], [C, 'BAKERY'], [C, 'HERBS'], [C, 'NOODLES'], [C, 'TEA'], [X, 'GRANT AVE'], [V], [V], [P, 'PRESIDIO'], [P],
  [V], [V],
];

/** The lot at world x (undefined off the ends of the streets). */
export const lotAt = (x: number): Lot | undefined => {
  const i = Math.floor((x - COURSE.streets.x1) / LOT_W);
  if (i < 0 || COURSE.streets.x1 + (i + 1) * LOT_W > HOUSES_END) return undefined;
  const [kind, name] = PLAN[i % PLAN.length];
  return { i, x: COURSE.streets.x1 + i * LOT_W, kind, name: name ?? '' };
};

/** Street height at x, going by the runs either side over a gap (the buildings sit on the lowest point under them). */
export const groundUnder = (runs: GroundRun[], x: number) => {
  let best: number | null = null, dist = Infinity;
  for (const r of runs) {
    if (r.surface !== 'street') continue;
    if (x >= r.x1 && x <= r.x2) return runYAt(r, x);
    const d = Math.min(Math.abs(x - r.x1), Math.abs(x - r.x2));
    if (d < dist) { dist = d; best = x < r.x1 ? r.y1 : r.y2; }
  }
  return best ?? GROUND_Y;
};
/** The street's height at points across a lot (its ends and every 17 between). */
const across = (runs: GroundRun[], lot: Lot) => { const out: number[] = []; for (let x = lot.x; x <= lot.x + LOT_W; x += 17) out.push(groundUnder(runs, x)); return out; };
/**
 * The ground a lot's building stands on: the street's highest point along the front, the way they build them up a
 * hill here (the house level, its foundation taking up the rest down to the street on the downhill side: see lotFoot).
 */
export const lotBase = (runs: GroundRun[], lot: Lot) => Math.min(...across(runs, lot)) + 4;
/** How far down the street goes along a lot's front (its lowest point): the foundation runs down to this. */
export const lotFoot = (runs: GroundRun[], lot: Lot) => Math.max(...across(runs, lot)) + 4;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/**
 * Everything that's going to come down in the quakes, sitting where you can see it from the start: pots on the
 * windowsills and balconies, AC units stuck out of upstairs windows, loose bricks along the shops' parapets.
 * (x, y: where it sits, its bottom on the ledge.)
 */
export const looseOnStreets = (runs: GroundRun[]) => {
  const out: { x: number; y: number; look: 'pot' | 'ac' | 'brick' }[] = [];
  for (let i = 0; ; i++) {
    const lot = lotAt(COURSE.streets.x1 + i * LOT_W + 1);
    if (!lot) { if (COURSE.streets.x1 + i * LOT_W > HOUSES_END) break; continue; }
    const base = lotBase(runs, lot), w = LOT_W - 4, x = lot.x;
    switch (lot.kind) {
      case 'victorian':
        for (const s of [190, 310]) if (hash(i * 7 + s) > 0.35) out.push({ x: x + 24, y: base - s, look: 'pot' });
        break;
      case 'shop':
        if (hash(i + 21) > 0.3) out.push({ x: x + w / 2, y: base - 170, look: 'ac' });
        if (hash(i + 23) > 0.4) out.push({ x: x + 20 + hash(i + 24) * (w - 40), y: base - 250 - Math.floor(hash(i + 4) * 30) - 8, look: 'brick' });
        break;
      case 'taqueria':
        out.push({ x: x + w * 0.25, y: base - 150, look: 'pot' });
        break;
      case 'chinatown':
        for (const s of [170, 280]) if (hash(i * 5 + s) > 0.3) out.push({ x: x + 30 + hash(i + s) * (w - 70), y: base - s - 18, look: 'pot' });
        break;
    }
  }
  return out;
};
