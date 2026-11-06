// THE KAIJU FINALE's world: where each section starts and ends, the ground's shape along the whole run (the one
// profile everybody stands on: him, the bosses, the landmarks, the tiny people), the engine's ground runs made from it.
//
//   0 .. AMERICA_LEN          AMERICA USA (the way in: no fight)
//   then the 16 sections       (sections.ts), each `len` long, back to back
//   then END_LEN               the run's end (the owner's ending goes here: a placeholder)

import { GROUND_Y } from '../../../m1/constants';
import type { GroundRun } from '../../../m1/game/core/terrain';
import { SECTIONS, AMERICA_LEN, type SectionDef, type Land } from './sections';

export const GY = GROUND_Y;
export const END_LEN = 1100;
/** Each section's start (world x). */
export const SEC_X: number[] = (() => { const out: number[] = []; let x = AMERICA_LEN; for (const s of SECTIONS) { out.push(x); x += s.len; } return out; })();
export const RUN_END = SEC_X[SEC_X.length - 1] + SECTIONS[SECTIONS.length - 1].len;
export const WORLD_END = RUN_END + END_LEN;
export const secEnd = (i: number) => SEC_X[i] + SECTIONS[i].len;
/** The section at world x (-1: AMERICA USA; SECTIONS.length: the end). */
export const secAt = (x: number) => { if (x < AMERICA_LEN) return -1; for (let i = 0; i < SECTIONS.length; i++) if (x < secEnd(i)) return i; return SECTIONS.length; };
export const landAt = (x: number): Land => { const i = secAt(x); return i < 0 ? 'america' : i >= SECTIONS.length ? 'cartoon' : SECTIONS[i].land; };

// ---------------------------------------------------------------------------------------------------------------
// The ground: each section's points (world), eased between (smoothstep: no kinks to trip on)

const PTS: [number, number][] = (() => {
  const out: [number, number][] = [[-400, 0], [AMERICA_LEN - 60, 0]];
  SECTIONS.forEach((s: SectionDef, i) => { for (const [rx, h] of s.ground) out.push([SEC_X[i] + rx, h]); });
  out.push([RUN_END, 0], [WORLD_END + 600, 0]);
  out.sort((a, b) => a[0] - b[0]);
  return out;
})();
/** How high the ground is over the base line at world x (positive up). */
export const groundH = (x: number) => {
  let i = 0;
  while (i < PTS.length - 2 && x > PTS[i + 1][0]) i++;
  const [x0, h0] = PTS[i], [x1, h1] = PTS[i + 1];
  const k = x1 === x0 ? 0 : Math.max(0, Math.min(1, (x - x0) / (x1 - x0)));
  return h0 + (h1 - h0) * k * k * (3 - 2 * k);
};
/** The ground's top (world y) at x. */
export const floorY = (x: number) => Math.round(GY - groundH(x));

/** The engine's ground: the profile sampled into short straight runs (its own columns follow each). */
export const GROUND_RUNS: GroundRun[] = (() => {
  const out: GroundRun[] = [];
  const STEP = 48;
  for (let x = -400; x < WORLD_END + 600; x += STEP) out.push({ x1: x, y1: floorY(x), x2: x + STEP, y2: floorY(x + STEP), surface: 'concrete' } as GroundRun);
  return out;
})();
