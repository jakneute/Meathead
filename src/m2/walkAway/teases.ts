// The walk screens' teases: on each land's horizon, the land's OTHER attractions (where they'd be seen from its way in,
// or from the boss's corner on the way out) and the neighboring lands' landmarks out past its edge, each painted by
// the land's own far pen (parkFar.ts's farMark for the neighbors; frontier/teases.ts, foreign/teases.ts,
// adventure/teases.ts, spooky/teases.ts for a land's own), so they look the same here as from inside the lands.
//
// The ring of lands round the hub: Future, Wilderness, Spooky, Cartoon, Hollywood, Fairy, Jungle, Foreign (and round
// to Future). Each land's neighbors stand at its horizon's far ends (the one before it in the ring off left, the one
// after it off right), small and deep in the haze; its own attractions nearer, between, clear of the middle (where the
// gate or the boss's arena is).
//
// Painted in the screen's own px (the walk screens' far strips paint their lands' layers at the screen's size, then
// bring them down: farStrip.ts), across `span` px with their feet at `foot`, into a strip that's painted once for the
// hour. `layer`: the neighbors (behind the land's own far layers) or its attractions (in front of its far mountains,
// behind its nearer layers). No volcanoes anywhere.

import { type Ctx, LW, HOR } from './kit';
import { farStrip } from './farStrip';
import { timeOfDay, farTint, skyAt, type TimeOfDay } from '../timeOfDay';
import { mix } from '../intro/art/kit';
import { farMark, farTreeline, type FarMark } from '../parkFar';
import { paintTeaseAt } from '../frontier/teases';
import { paintMark } from '../foreign/teases';
import { farTemple, farWaterTower, farCruise } from '../adventure/teases';
import { farOtherCastle } from '../spooky/teases';

export type WalkLand = 'adventure' | 'frontier' | 'spooky' | 'cartoon' | 'hollywood' | 'fantasy' | 'space' | 'foreign';

const tint = (tod: TimeOfDay, k: number) => (c: string) => mix(farTint(c, 1, tod), skyAt(0.86, tod), k);

/** Each land's neighbors (off left, off right): parkFar's marks, a height (screen px). Jungle Land has no parkFar mark:
 *  its temple's own pen (adventure/teases.ts) stands in. */
type N = { mark: FarMark | 'jungle'; h: number };
const NEIGHBORS: Record<WalkLand, [N, N]> = {
  space: [{ mark: 'showcase', h: 190 }, { mark: 'rockies', h: 150 }],
  frontier: [{ mark: 'needle', h: 190 }, { mark: 'clockTower', h: 230 }],
  spooky: [{ mark: 'rockies', h: 150 }, { mark: 'cartoonTower', h: 200 }],
  cartoon: [{ mark: 'clockTower', h: 230 }, { mark: 'thrones', h: 200 }],
  hollywood: [{ mark: 'cartoonTower', h: 200 }, { mark: 'fairyCastle', h: 230 }],
  fantasy: [{ mark: 'thrones', h: 200 }, { mark: 'jungle', h: 190 }],
  adventure: [{ mark: 'fairyCastle', h: 230 }, { mark: 'showcase', h: 190 }],
  foreign: [{ mark: 'jungle', h: 190 }, { mark: 'needle', h: 190 }],
};

const neighbor = (g: Ctx, n: N, x: number, foot: number, tod: TimeOfDay) => {
  if (n.mark === 'jungle') farTemple(g, x, foot, n.h * 1.2, tint(tod, 0.5), tod.lamps);
  else farMark(g, n.mark, x, foot, n.h, 0.5, tod);
};

/** A land's own attractions on its horizon, across `span`, feet at `foot` (`out`: seen from the boss's end, on the way
 *  out: the ones back toward the hub). */
const own = (g: Ctx, land: WalkLand, span: number, foot: number, out: boolean, tod: TimeOfDay) => {
  const at = (u: number) => Math.round(span * u), T = tint(tod, 0.32);
  switch (land) {
    case 'frontier':
      // (in: up ahead the railroad's trestle off left, Sawdust Gulch and Timber Tumble off right)
      paintTeaseAt(g, 'trestle', at(0.2), foot, false, tod);
      paintTeaseAt(g, 'gulch', at(0.68), foot, false, tod);
      paintTeaseAt(g, 'tumble', at(out ? 0.3 : 0.86), foot, out, tod);
      return;
    case 'foreign':
      // (across the lagoon from the gate: the far shore's pavilions, small)
      for (const [id, u] of [['norway', 0.16], ['china', 0.27], ['japan', 0.72], ['morocco', 0.82], ['uk', 0.92]] as const) paintMark(g, id, at(u), foot, 0.42, 1.6, tod);
      return;
    case 'adventure':
      // (in: through the gap in the jungle at the path's end; out: over the clearing's treeline)
      farTemple(g, at(out ? 0.78 : 0.41), foot, 240, T, tod.lamps);
      farCruise(g, at(out ? 0.24 : 0.62), foot, T, tod.lamps);
      farWaterTower(g, at(out ? 0.12 : 0.54), foot, T, tod.lamps);
      return;
    case 'spooky':
      farOtherCastle(g, at(out ? 0.78 : 0.24), foot, 230, T, tod.lamps);
      return;
    case 'hollywood':
      farMark(g, 'thrones', at(out ? 0.25 : 0.76), foot, 210, 0.32, tod);
      return;
    default:
  }
};

/** The teases as a strip of the walk screen's picture (TS_W by TS_H px, their feet near its bottom), painted once for
 *  the hour; and put down on the horizon (`lift`: raised that many px, for a scene whose skyline sits higher). */
export const TS_W = LW + 60, TS_H = 70;
export const teaseStrip = (land: WalkLand, layer: 'far' | 'near', out = false) =>
  farStrip(`wt-${land}-${layer}-${out ? 'o' : 'i'}`, TS_W, TS_H, g => { g.save(); g.scale(0.5, 0.5); paintLandTeases(g, land, layer, TS_W * 4, TS_H * 4 - 8, out); g.restore(); });
export const drawTeaseStrip = (c: Ctx, land: WalkLand, layer: 'far' | 'near', sway: number, out = false, lift = 0) =>
  c.drawImage(teaseStrip(land, layer, out), -30 + Math.round(sway * (layer === 'far' ? 0.08 : 0.14)), HOR + 2 - TS_H - lift);

/** Paints the land's teases into `g` (screen px): the neighbors (`layer` 'far') or its own attractions ('near'), with
 *  the park's tree line along their feet. */
export const paintLandTeases = (g: Ctx, land: WalkLand, layer: 'far' | 'near', span: number, foot: number, out = false, tod = timeOfDay()) => {
  if (layer === 'far') {
    const [a, b] = NEIGHBORS[land];
    neighbor(g, a, Math.round(span * 0.06), foot, tod);
    neighbor(g, b, Math.round(span * 0.94), foot, tod);
    farTreeline(g, 0, Math.round(span * 0.16), foot - 14, tint(tod, 0.5)('#2A3A2A'), 1);
    farTreeline(g, Math.round(span * 0.84), span, foot - 14, tint(tod, 0.5)('#2A3A2A'), 2);
    return;
  }
  own(g, land, span, foot, out, tod);
};
