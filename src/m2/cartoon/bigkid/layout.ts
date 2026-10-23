// THE BIG-KID ZONE, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h). The park's
// zone for the older kids: 90s "extreme" (zigzags, neon, spray paint, chain-link, skate-park concrete), its rides
// bigger and TRACKLESS (they roam loose and try to run him down: telegraphed every time, and they hurt the cast too),
// themed on legally distinct knockoffs of Y7 cartoons and early adult animation. Harder platforming than the kiddie
// square: the land's swaying stack-towers (cartoon/sway.ts) over bottomless GLOP PITS (green slime: the big kids' ball
// pit; in, and he's spat back out where he last stood, hurt), in a bumper-car rink where the cars ram the towers'
// feet and set them swinging, a hopping simulator pod before the second pit. DAD MAN's posters everywhere (the
// failed mid-90s show, setting up the boss). Every bit of it goes both ways (he'll be back through here).
//
//   0      THE ZONE GATE (cp 40): out of the White House's stage door; the neon arch, THE BIG-KID ZONE; a poster column
//          (DAD MAN); a ride op alone (taught).
//   860    THE POSTER WALL: a plywood construction fence pasted with DAD MAN, faded, peeling; one graffitied.
//   1250   COUCH DUDES' CRUISIN' COUCH: the couch out of its garage, roaming the street; it lines up on him (headlights,
//          the horn) and charges. Jump it, or get up on the newsstand's awning or the bus shelter. Alone.
//   2750   THE DAD MAN GIFT SHACK (cp 41): EVERYTHING 90% OFF; the clearance bin of talking dolls; the awning (a
//          pickup); a churro vendor and a ride op.
//   3700   THE GLOP PIT: three towers across it (lean to make each gap), a stack of glop drums on each bank (the way
//          back up); Gloppy on the far bank hocking loogies at him on the lids.
//   4900   SPAZ & STINKY'S BUMPER BASH (cp 42): a fenced rink, three bumper cars loose in it (they spin, line up, beep,
//          ram); two towers in the rink up off the floor (the cars ram their feet and set them swinging); the scorer's
//          stands up to them. The skate punk past it.
//   6450   IN LOVING MEMORY (cp 43): breathing room. The memorial plaque for DAD MAN's dead cast under the faded
//          family mural, a bench, dead flowers, a beer can somebody left on it. A pickup.
//   7250   GIGGLES THE CLOWN'S HURL-A-WHIRL: four cars on arms whirling round a clown-head hub that rolls loose about
//          its plaza (it shudders, honks and lurches at him); the cars at two heights (jump the low ones, walk under
//          the high ones). A ride op who sets it on him; THE FLEA overhead.
//   8500   DETECTIVE DRAKE'S MOTION MADNESS (cp 44): the simulator pod on its hydraulic legs, hopping after him across
//          its plaza (it crouches and hisses first); then THE GLOP PIT, PART 2: a harder chain of three towers; Gloppy.
//   10560  RAD RAT'S TUBULAR HALFPIPE (cp 45): a giant skateboard rocking back and forth in a halfpipe; drop in,
//          cross, jump it at the bottom; the skate punk on the far lip.
//   11450  THE WAY ON (cp 46): the big DAD MAN LIVE billboard (the amphitheater: setting up the boss); a mixed
//          crowd; the gate to DAD MAN: THE EXTENDED UNIVERSE (the right end: on to the knockoff area).

import { SECTIONS, GY } from '../geometry';
import type { TowerDef } from '../sway';

export const x0 = SECTIONS.bigkid.x0, x1 = SECTIONS.bigkid.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// The ground: glop pits (no ground), the halfpipe (a dip), solids, ledges

/** The glop pits (no ground: in, and he's spat back out, hurt): [from, to]. */
export const PITS: [number, number][] = [[3700, 4600], [9400, 10340]];
/** The halfpipe: its lips (a, b), how deep, how wide each curved ramp is. */
export const PIPE = { a: 10700, b: 11300, depth: 170, ramp: 150 };
/** How far below the ground line the halfpipe's floor is at rx (0 off it). */
export const pipeDepth = (rx: number) => {
  const { a, b, depth, ramp } = PIPE;
  if (rx <= a || rx >= b) return 0;
  const u = rx < a + ramp ? (rx - a) / ramp : rx > b - ramp ? (b - rx) / ramp : 1;
  return depth * (1 - (1 - u) * (1 - u));
};
/** Flat ground: [from, to] at the ground line (between: the pits, the halfpipe). */
export const GROUND: [number, number][] = [[-200, 3700], [4600, 9400], [10340, PIPE.a], [PIPE.b, 12200]];
/** The halfpipe's floor, in runs (its ramps in short straight bits): [x1, depth1, x2, depth2]. */
export const PIPE_RUNS: [number, number, number, number][] = (() => {
  const out: [number, number, number, number][] = [];
  const { a, b, ramp } = PIPE, n = 10;
  for (let i = 0; i < n; i++) { const p = a + (ramp * i) / n, q = a + (ramp * (i + 1)) / n; out.push([p, pipeDepth(p + 0.01), q, pipeDepth(q)]); }
  out.push([a + ramp, PIPE.depth, b - ramp, PIPE.depth]);
  for (let i = 0; i < n; i++) { const p = b - ramp + (ramp * i) / n, q = b - ramp + (ramp * (i + 1)) / n; out.push([p, pipeDepth(p), q, pipeDepth(q - 0.01)]); }
  return out;
})();

/** The bumper rink: its floor (between its rails), the rails (low walls with a standable top: [from, to]). */
export const RINK = { a: 5100, b: 6200, rail: 40 };
export const RAILS: [number, number][] = [[RINK.a - 40, RINK.a], [RINK.b, RINK.b + 40]];
/** Solid things (walls with a standable top, lit along it): [from, to, top height]. */
export const SOLIDS_BASE: [number, number, number][] = [...RAILS.map(([a, b]) => [a, b, RINK.rail] as [number, number, number])];

/** The rides' patches. */
export const COUCH = { a: 1500, b: 2650, barn: [1250, 1500] as [number, number] };
export const WHIRL = { a: 7250, b: 8350, lo: 7560, hi: 8040, r: 210 };
export const POD = { a: 8650, b: 9150 };

/** The glop drums (stacked two high, solid: the steps up off each pit's banks): [from, to, height]. */
export const DRUMS: [number, number, number][] = [[3560, 3660, 120], [4630, 4730, 130], [9270, 9370, 120], [10370, 10470, 140]];
/** Solid things (walls with a standable top, lit along it): [from, to, top height]. */
export const SOLIDS: [number, number, number][] = [...SOLIDS_BASE, ...DRUMS];
/** The scorer's stands in the rink (scaffolds: up to its towers): [from, to, height]. */
export const STANDS: [number, number, number][] = [[5250, 5350, 130], [5990, 6090, 130]];
/** The couch's street: a newsstand's awning and the park shuttle's bus shelter roof (on poles) to get up out of its
 *  way. */
export const NEWSSTAND: [number, number, number] = [1880, 1990, 110];
export const SHELTER: [number, number, number] = [2270, 2390, 90];
/** The gift shack (behind the path) and its awning (a ledge, a pickup up on it). */
export const SHACK = { a: 2800, b: 3330, awning: [2830, 2970, 120] as [number, number, number], bin: 3080 };
/** Ledges (one-way, to stand on): [from, to, height]. */
export const LEDGES: [number, number, number][] = [...STANDS, NEWSSTAND, SHELTER, SHACK.awning];

// ---------------------------------------------------------------------------------------------------------------
// The towers (world coordinates)

const T = (rx: number, h: number, extra: Partial<TowerDef> = {}): TowerDef => ({ x: X(rx), y: GY, h, pit: PITS.some(([a, b]) => rx > a && rx < b), ...extra });
/** The zone's stacks: 90s colors (teal, purple, lime, hot pink, orange) and a black-and-white checker lid. */
const ZT = (a: string, b: string, c: string) => [a, b, a, b, c, b, a];
export const TOWERS: TowerDef[] = [
  // (the first glop pit: too far apart upright; lean into each gap)
  T(3790, 230, { tiers: ZT('#14B8A6', '#7C3AED', '#84CC16'), lid: '#F5F5F4' }),
  T(4150, 260, { tiers: ZT('#EC4899', '#1F2937', '#FDE047'), lid: '#F5F5F4' }),
  T(4460, 220, { tiers: ZT('#F97316', '#7C3AED', '#14B8A6'), lid: '#F5F5F4' }),
  // (the rink's: up off the floor; the cars ram their feet)
  T(5480, 240, { tiers: ZT('#84CC16', '#1F2937', '#EC4899'), lid: '#F5F5F4' }),
  T(5840, 240, { tiers: ZT('#7C3AED', '#FDE047', '#14B8A6'), lid: '#F5F5F4' }),
  // (the second glop pit: taller, further)
  T(9520, 240, { tiers: ZT('#EC4899', '#14B8A6', '#FDE047'), lid: '#F5F5F4' }),
  T(9900, 260, { lean: 0.55, tiers: ZT('#1F2937', '#84CC16', '#F97316'), lid: '#F5F5F4' }),
  T(10220, 260, { tiers: ZT('#7C3AED', '#F97316', '#84CC16'), lid: '#F5F5F4' }),
];
/** Which towers stand in a glop pit (their foot rising out of the slime). */
export const IN_PIT = new Set([0, 1, 2, 5, 6, 7]);
/** Which stand in the rink (the bumper cars knock their feet). */
export const IN_RINK = [3, 4];

// ---------------------------------------------------------------------------------------------------------------
// The cast, the pickups, the checkpoints

/** [kind, x, height of its feet]. Encounter pass (cartoon-spec.md, 2026-10-21): nobody within a checkpoint's safe
 *  reach (spawnSafe.ts SAFE_X); the cast up on the stands and the drums, set on him with the rides and over the glop. */
export const CAST: [string, number, number][] = [
  // (the gate: a ride op alone, taught; the couch's street stays the couch's)
  ['m2:ct_rideop', 820, 0],
  // (the gift shack, out of its checkpoint's reach: the churro vendor; then the Flea by the first glop pit: up on the
  // lids, he leaps and dives at where he was: keep moving and he goes into the glop)
  ['m2:ct_churro', 3180, 0], ['m2:ct_flea', 3520, 0],
  // (the bumper bash: Gloppy on the near scorer's stand hocking loogies onto the rink floor (half speed in a puddle,
  // with the cars lining up); a ride op on the far stand, on his headset setting the cars on him)
  ['m2:ct_gloppy', STANDS[0][0] + 50, STANDS[0][2]], ['m2:ct_rideop', STANDS[1][0] + 50, STANDS[1][2]],
  // (past the memorial: Rad Rat (spiky: no dive kick); then the hurl-a-whirl's op who sets it on him with Gloppy at
  // the plaza's mouth, puddles to wade through as it lurches over (and they're in its way when it does))
  ['m2:ct_skatepunk', 6960, 0], ['m2:ct_rideop', 7170, 0], ['m2:ct_gloppy', 7250, 0],
  // (the second glop pit, past the pod's plaza (the pod alone): the Flea up on the near drums, the step up, diving
  // after him once he's out on the lids; the churro vendor below them throwing flat at him from behind)
  ['m2:ct_churro', 9190, 0], ['m2:ct_flea', DRUMS[2][0] + 50, DRUMS[2][2]],
  // (the way on: the mixed crowd at the gate, past the checkpoint's reach)
  ['m2:ct_rideop', 11730, 0], ['m2:ct_skatepunk', 11790, 0], ['m2:ct_gloppy', 11850, 0], ['m2:ct_flea', 11905, 0],
];
/** Pickups (lean): [x, height, type]. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [NEWSSTAND[0] + 55, NEWSSTAND[2], 'small_ammo'],
  [SHACK.awning[0] + 70, SHACK.awning[2], 'small_health'],
  [STANDS[1][0] + 50, STANDS[1][2], 'small_ammo'],
  [6560, 0, 'small_health'],
  [10650, 0, 'small_ammo'],
  [11520, 0, 'small_health'],
];
export const CHECKPOINTS = [
  { name: 'THE BIG-KID ZONE', cp: 40, x: X(200), y: GY },
  { name: 'THE DAD MAN GIFT SHACK', cp: 41, x: X(2750), y: GY },
  { name: 'THE BUMPER BASH', cp: 42, x: X(4900), y: GY },
  { name: 'IN LOVING MEMORY', cp: 43, x: X(6500), y: GY },
  { name: 'THE MOTION MADNESS', cp: 44, x: X(8480), y: GY },
  { name: 'THE TUBULAR HALFPIPE', cp: 45, x: X(10630), y: GY },
  // (just off the halfpipe's lip: the gate's crowd stands clear of its safe reach)
  { name: 'THE EXTENDED UNIVERSE', cp: 46, x: X(11330), y: GY },
];

/** The memorial: the plaque on its stone, the bench, the mural on the wall behind. */
export const MEMORIAL = { plaque: 6760, bench: 6600, wall: [6420, 7060] as [number, number] };
/** The DAD MAN LIVE billboard, the gate on (the right end). */
export const BILLBOARD = 11400;
export const GATE = { a: 11860, b: 12000 };

/** Once each, passing: [the gag, from x]. */
export const GAG_AT: [string, number][] = [['posters', 600], ['graffiti', 960], ['couch', 1420], ['shop', 2860], ['slime', 3480], ['bumper', 4980], ['memorial', 6640], ['whirl', 7150], ['pod', 8580], ['halfpipe', 10600], ['billboard', 11330], ['exit', 11830]];

/** The zone's signs: [x, feet height, lines, board color]. */
export const SIGNS: [number, number, string[], string][] = [
  [1160, 0, ['COUCH DUDES', "CRUISIN' COUCH", 'IT DRIVES ITSELF!'], '#7C3AED'],
  [3470, 0, ['THE GLOP PIT', 'NO LIFEGUARD ON DUTY. EVER.'], '#16A34A'],
  [4990, 0, ["SPAZ & STINKY'S", 'BUMPER BASH', 'ALL CRASH! ALL DAY!'], '#DB2777'],
  [7130, 0, ["GIGGLES THE CLOWN'S", 'HURL-A-WHIRL', 'IT GOES WHERE IT WANTS!'], '#EA580C'],
  [8560, 0, ["DETECTIVE DRAKE'S", 'MOTION MADNESS', 'FEEL EVERY BUMP!'], '#0E7490'],
  [9170, 0, ['THE GLOP PIT, PART 2', 'NOW WITH MORE GLOP'], '#16A34A'],
  [10580, 0, ["RAD RAT'S", 'TUBULAR HALFPIPE', 'TOTALLY GNARLY!'], '#7C3AED'],
];
