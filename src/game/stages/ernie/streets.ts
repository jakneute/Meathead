// What's along the streets, lot by lot, so it isn't the same row of houses the
// whole way: the painted ladies up round Haight, the head shops, a park at the
// top of a hill, Lombard, the Mission's taquerias and murals, the glass boxes of
// the startups south of Market, Chinatown under its lanterns, and the houses
// again out toward the Presidio. Cross streets between the districts, each with
// its sign. (The quakes need to know it too: things only come down off buildings.)

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

/** How high up over the sidewalk this lot's windowsills are (things teeter on them in a quake); none on a glass box. */
export const sillsOf = (kind: LotKind): number[] => {
  switch (kind) {
    case 'victorian': return [190, 310];
    case 'shop': case 'taqueria': return [170];
    case 'chinatown': return [170, 280];
    default: return [];
  }
};

/** There's a building here for stuff to come off (not a park, not a cross street). */
export const buildingAt = (x: number) => { const l = lotAt(x); return !!l && l.kind !== 'park' && l.kind !== 'cross'; };
