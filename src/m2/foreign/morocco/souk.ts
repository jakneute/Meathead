// MOROCCO's far end (job 4b: the pavilions lengthened): THE SOUK, and the CAMEL STAMPEDE. A long covered market alley,
// its stalls' striped AWNINGS stepping up and down over it (standable: lit lips) to the tea terrace at the top; and
// the park's CAMEL RIDE at its far end, whose fiberglass camels keep getting loose: every several seconds the herd
// THUNDERS down the alley from the far end (the dust cloud, the rumble and the bells first: the tell; a salesman's
// shout), trampling whoever's down in it (him: `m2:fl_stampede`, knocked flying; the cast too). The awnings are over
// their humps: up there, they go by underneath. Salesmen, a camel suit spitting and a hookah bro smoking up on the
// awnings; the broken corral at the end (GATE BROKEN, CAMELS: ALSO BROKEN), to the border with France.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { ledge, solid, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, postBoard, LOOKS, onScreen, rnd } from '../kit';
import { drawSoukWall, drawStallAwning, drawCorral, dustPuff, drawRideCamel } from './art';
import { V, STAMPEDE } from './lines';

const { x0, x1 } = SECTIONS.morocco;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Morocco ended: this starts there. */
export const SOUK_FROM = 3600;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Morocco's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const ALLEY = { a: 3750, b: 5020 } as const;
/** The awnings (one-way): [a, b, h, stripe]. */
const AWNINGS: [number, number, number, string][] = [
  [3760, 3900, 130, '#DC2626'], [3940, 4080, 230, '#15803D'], [4120, 4260, 330, '#1D4ED8'], [4300, 4440, 250, '#EAB308'],
  [4480, 4620, 350, '#DC2626'], [4660, 4800, 450, '#15803D'], [4840, 4960, 300, '#1D4ED8'], [4980, 5090, 160, '#EAB308'],
];
/** The corral's fence (solid, low: a hop) past the alley. */
const FENCE = { a: 5130, b: 5150, h: 60 } as const;
/** The herd: how many, spaced, how tall, how fast; one every EVERY frames, WARN of dust and bells first. */
const HERD = { n: 5, gap: 110, h: 112, v: 11 } as const;
const EVERY = 450, WARN = 90;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_snakecharmer', 3660, 0],
  ['m2:fl_carpet', 3990, 230], ['m2:fl_hookah', 4180, 330], ['m2:fl_camel', 4540, 350], ['m2:fl_carpet', 4720, 450], ['m2:fl_hookah', 4890, 300],
  ['m2:fl_carpet', 5060, 0], ['m2:fl_camel', 5230, 0], ['m2:fl_snakecharmer', 5320, 0],
];

export const SOUK_CHECKPOINTS = [
  { name: 'MOROCCO: THE SOUK', cp: 64, x: X(3640), y: GY },
  { name: 'MOROCCO: THE CAMEL CORRAL', cp: 65, x: X(5190), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The herd

/** The herd now: 'warn' (dust at the far end), 'run' (the lead camel's nose at world x, heading left), or gone. */
const herdAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY);
  if (t < WARN) return { st: 'warn' as const, n, lead: X(ALLEY.b), t };
  const lead = X(ALLEY.b) + 60 - (t - WARN) * HERD.v;
  if (lead + HERD.n * HERD.gap > X(ALLEY.a)) return { st: 'run' as const, n, lead, t: t - WARN };
  return { st: 'gone' as const, n, lead: 0, t: 0 };
};

interface Souk { said: Shout; hit: Set<object>; n: number }
const soukOf = (state: GameState) => foreignState<Souk>(state, 'morocco-souk' as 'morocco', () => ({ said: newShout(), hit: new Set(), n: -1 }));

export const buildSouk = (state: GameState) => {
  for (const [a, b, h] of AWNINGS) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'ma-awning' });
  solid(state, X(FENCE.a), Y(FENCE.h), FENCE.b - FENCE.a, FENCE.h, { hidden: true, tag: 'ma-fence' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'ma', X, Y, [[4730, 450, 'small_ammo'], [4190, 330, 'small_health']]);
};

export const updateSouk = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, s = soukOf(state);
  const near = p.pos.x > X(3500) && p.pos.x < X(5300);
  const hd = herdAt(f);
  if (hd.n !== s.n) { s.n = hd.n; s.hit.clear(); }
  if (hd.st !== 'gone') setHazardZones(state, 'ma-herd', [{ x0: X(ALLEY.a), x1: X(ALLEY.b) + 60, y0: Y(HERD.h), y1: GY + 4, ground: true }]);
  if (hd.st === 'warn' && hd.t === 0 && near) { playSound('rumble', 0.6, 6); shout(state, s.said, V.carpet.m, byPants(state, STAMPEDE), X(ALLEY.b) - 40, Y(200), 0.5); }
  if (hd.st === 'warn' && near && hd.t % 18 === 0) playSound('ding', 0.3, 10);
  if (hd.st !== 'run') return;
  if (near && hd.t % 8 === 0) { playSound('stomp', 0.5, -6); shakeScreen(state, 2, 2); }
  if (hd.t === 0 && near) playSound('bellow', 0.7, 4);
  const a = Math.max(X(ALLEY.a), hd.lead - 30), b = Math.min(X(ALLEY.b) + 60, hd.lead + HERD.n * HERD.gap);
  if (b <= a) return;
  if (!s.hit.has(p) && hurtIn(ctx, a, Y(HERD.h), b - a, HERD.h, 14, 'm2:fl_stampede', { x: -14, y: -11 }, 34)) { s.hit.add(p); playSound('crunch', 0.8, -4); shakeScreen(state, 6, 4); }
  hitCastIn(ctx, a, Y(HERD.h), b - a, HERD.h, 60, b + 100, 'TRAMPLED!', '#FCD34D', s.hit);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the SNES pass: art.ts paints it; still art stamped for the hour, the dust and the herd live)

export const drawSoukBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(SOUK_FROM), x1)) return;
  const f = state.frame, hd = herdAt(f);
  // (the covered market's far wall, set back: its arcade of shops, the windows up it, the roof's beams and reeds)
  drawSoukWall(c, v, X(3720), 1340, 560);
  // (the stalls under the awnings: their goods behind, the awnings over them, their tops the walk)
  AWNINGS.forEach(([a, b, h, col], i) => drawStallAwning(c, v, X(a), X(b), Y(h), col, i));
  // (the corral: its gatepost (a hop), the rails, its broken gate, the ride's sign)
  if (onScreen(v, X(5100), X(5400))) {
    drawCorral(c, v, X(FENCE.a), X(FENCE.b), Y(FENCE.h), X(5380));
    postBoard(c, X(5300), GY, ['CAMEL RIDES', 'GATE BROKEN', 'CAMELS: ALSO BROKEN'], LOOKS.morocco(1), '#1D4ED8', undefined, 150);
  }
  // (the dust boiling up at the far end: the tell)
  if (hd.st === 'warn' && onScreen(v, X(4800), X(5100))) {
    c.globalAlpha = 0.7;
    for (let k = 0; k < 10; k++) { const r = 8 + hd.t * 0.22 + rnd(k) * 10; dustPuff(c, X(ALLEY.b) - 20 + rnd(k + 5) * 80, GY - 14 - rnd(k + 9) * 70, r); }
    c.globalAlpha = 1;
  }
  // (signs: held up, nothing over them)
  if (onScreen(v, X(3640), X(3760))) postBoard(c, X(3700), GY, ['THE SOUK', '(SOUP)', 'WATCH FOR CAMELS'], LOOKS.morocco(1), '#1D4ED8', undefined, 150);
  if (onScreen(v, X(4660), X(4800))) postBoard(c, X(4730), Y(450), ['TEA TERRACE', 'SWEET TEA (SOUTHERN)'], LOOKS.morocco(1), '#15803D', undefined, 62);
  if (onScreen(v, X(5320), X(5480))) postBoard(c, X(5390), GY, ['LEAVING MOROCCO', 'SHUKRAN (CHEERS)'], LOOKS.morocco(1), '#1D4ED8', undefined, 100);
};

export const drawSoukFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame, hd = herdAt(f);
  if (hd.st === 'run' && onScreen(v, X(ALLEY.a), X(ALLEY.b) + 80)) {
    c.save(); c.beginPath(); c.rect(X(ALLEY.a) - 40, Y(200), X(ALLEY.b) - X(ALLEY.a) + 140, 220); c.clip();
    for (let k = 0; k < HERD.n; k++) drawRideCamel(c, hd.lead + k * HERD.gap, f, k);
    // (the dust kicked up behind the herd)
    c.globalAlpha = 0.6;
    for (let k = 0; k < 8; k++) { const r = 12 + rnd(k + f) * 14; dustPuff(c, hd.lead + HERD.n * HERD.gap - 40 + rnd(k * 3) * 80, GY - 14 - rnd(k + 2) * 36, r); }
    c.globalAlpha = 1;
    c.restore();
  }
  drawShout(c, soukOf(state).said);
};

export const soukLamps = (v: View): Light[] => {
  const out: Light[] = [];
  for (const rx of [3900, 4300, 4730, 5000]) if (onScreen(v, X(rx), X(rx))) out.push({ x: X(rx), y: Y(520), r: 130, a: 0.4, color: '#FDBA74' });
  return out;
};
