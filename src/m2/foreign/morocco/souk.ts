// MOROCCO's far end (job 4b: the pavilions lengthened): THE SOUK, and the CAMEL STAMPEDE. A long covered market alley,
// its stalls' striped AWNINGS stepping up and down over it (standable: lit lips) to the tea terrace at the top; and
// the park's CAMEL RIDE at its far end, whose fiberglass camels keep getting loose: every several seconds the herd
// THUNDERS down the alley from the far end (the dust cloud, the rumble and the bells first: the tell; a salesman's
// shout), trampling whoever's down in it (him: `m2:fl_stampede`, knocked flying; the cast too). The awnings are over
// their humps: up there, they go by underneath. Salesmen, camel suits spitting, a snake charmer and hookah bros up on
// the awnings; the broken corral at the end (GATE BROKEN, CAMELS: ALSO BROKEN), to the border with France.

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
import { type Ctx, type View, postBoard, LOOKS, onScreen, rnd, at } from '../kit';
import { drawSoukWall, drawStallAwning, drawCorral, dustPuff, drawRideCamel, drawHerdGate, drawHerdDoors, herdJambs, HERD_D, type HerdGate, SAND, OCHRE } from './art';
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
/** The herd's ways (flush behind the alley, at HERD_D; `a` its left end): THE CAMEL RIDE's stable at the far end (under
 *  the last awning, in place of its stall), where they burst out, and the souk's gate at the near end, where they go.
 *  They only ever show up or vanish in one of these two arches. */
const WAY_IN: HerdGate & { a: number } = { a: 4975, w: 140, r: 56, h: 190, H: 305, col: OCHRE, lines: ['CAMEL RIDE STABLES', 'KEEP DOORS SHUT'], bg: '#7F1D1D', seed: 2, floor: 'straw' };
const WAY_OUT: HerdGate & { a: number } = { a: 3595, w: 150, r: 60, h: 180, H: 310, col: SAND, lines: ['THE SOUK', '(SOUP)', 'WATCH FOR CAMELS'], bg: '#1D4ED8', seed: 1, floor: 'paving', hoof: true };
const jambs = (G: HerdGate & { a: number }) => herdJambs(G).map(j => G.a + j) as [number, number];
const [IN_L, IN_R] = jambs(WAY_IN), [OUT_L, OUT_R] = jambs(WAY_OUT);
/** The lead's nose starts just inside the stable's far jamb (the herd all in the dark); the herd's length, nose to tail. */
const LEAD0 = IN_R + 30, LONG = (HERD.n - 1) * HERD.gap + 100;
/** When (frames into the run) the stable's doors swing shut behind the tail, the souk's gate's are shoved open by the
 *  lead's nose, and swing shut behind the tail. */
const IN_SHUT = (LEAD0 + LONG - IN_L) / HERD.v, OUT_OPEN = (LEAD0 - 30 - OUT_R - 50) / HERD.v, OUT_SHUT = (LEAD0 + LONG - OUT_L) / HERD.v;
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

const ENEMIES: [string, number, number][] = [
  // (THE SOUK's and THE CAMEL CORRAL's checkpoints' spots left clear; nobody idle down in the alley, the herd's run)
  // up on the awnings: a salesman, the hookah bro, a snake charmer (the snake low across the awnings at his feet as he
  // hops), a camel suit and a salesman side by side (the ram shoves him off down into the stampede: shove him instead),
  // a salesman on the highest, the hookah bro and a camel suit on the way down
  ['m2:fl_carpet', 3990, 230], ['m2:fl_hookah', 4180, 330], ['m2:fl_snakecharmer', 4370, 250],
  ['m2:fl_camel', 4530, 350], ['m2:fl_carpet', 4590, 350], ['m2:fl_carpet', 4720, 450],
  ['m2:fl_hookah', 4870, 300], ['m2:fl_camel', 4930, 300],
];

export const SOUK_CHECKPOINTS = [
  { name: 'MOROCCO: THE SOUK', cp: 64, x: X(3640), y: GY },
  { name: 'MOROCCO: THE CAMEL CORRAL', cp: 65, x: X(5190), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The herd

/** The herd now: 'warn' (the stable's doors rattling, dust out under them), 'run' (the lead camel's x, heading left,
 *  out of the stable and on into the souk's gate), or gone (the tail in the dark through the souk's gate). */
const herdAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY);
  if (t < WARN) return { st: 'warn' as const, n, lead: X(ALLEY.b), t };
  const lead = X(LEAD0) - (t - WARN) * HERD.v;
  if (lead + LONG > X(OUT_L)) return { st: 'run' as const, n, lead, t: t - WARN };
  return { st: 'gone' as const, n, lead: 0, t: 0 };
};
/** The two gates' doors now: how far open (0..1), and the stable's rattle (px) in the warning. */
const doorsAt = (f: number) => {
  const t = f % EVERY, rt = t - WARN;
  const inOpen = rt < 0 ? 0 : clamp01(rt / 4) * (1 - clamp01((rt - IN_SHUT) / 18));
  const outOpen = clamp01((rt - OUT_OPEN) / 5) * (1 - clamp01((rt - OUT_SHUT) / 18));
  const shake = rt < 0 && t % 9 < 5 ? ((f >> 1) % 2 ? 1 : -1) * (t > WARN - 36 ? 2 : 1) : 0;
  return { inOpen, outOpen, shake, rt };
};
/** The herd (a run on), drawn between screen x a..b only, `dk` toward the dark. */
const herdStrip = (c: Ctx, lead: number, f: number, a: number, b: number, dk: number) => {
  if (b - a < 1 || lead - 34 > b || lead + LONG < a) return;
  c.save(); c.beginPath(); c.rect(a, Y(200), b - a, 220); c.clip();
  for (let k = 0; k < HERD.n; k++) { const x = lead + k * HERD.gap; if (x - 34 < b && x + 100 > a) drawRideCamel(c, x, f, k, dk); }
  c.restore();
};
/** Where a gate's jambs fall on screen (they're set back a touch). */
const jambsOn = (v: View, l: number, r: number) => [at(v.eye, X(l), GY, HERD_D)[0], at(v.eye, X(r), GY, HERD_D)[0]] as const;
/** The herd inside a gate's arch (behind whoever's out in the alley): darker the deeper in, in steps; `inward` -1 (the
 *  souk's: deeper to the left) or 1 (the stable's: deeper to the right). */
const herdInArch = (c: Ctx, lead: number, f: number, a: number, b: number, inward: -1 | 1) => {
  const xs = [0, 1, 2, 3].map(i => Math.round(a + ((b - a) * i) / 3)), DK = [0.42, 0.62, 0.8];
  for (let i = 0; i < 3; i++) { const s = inward > 0 ? i : 2 - i; herdStrip(c, lead, f, xs[s], xs[s + 1], DK[i]); }
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
  // (the stable's doors knocking as they're shoved on, flung open, the souk's gate's swinging shut behind the herd)
  if (near) {
    const rt = (f % EVERY) - WARN;
    if (rt < 0 && hd.t % 9 === 0 && hd.t > 20) playSound('thud', 0.25, hd.t > WARN - 36 ? 0 : -4);
    if (rt === 0) playSound('slam', 0.6, -2);
    if (rt === Math.ceil(OUT_SHUT) + 14) playSound('slam', 0.35, 2);
  }
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
  // (the herd's ways: the souk's gate at the near end, the camel ride's stable at the far; their doors; the herd while
  // it's in either arch, behind whoever's out in the alley; the dust out under the stable's doors in the warning)
  const dr = doorsAt(f);
  drawHerdGate(c, v, X(WAY_OUT.a), WAY_OUT); drawHerdDoors(c, v, X(WAY_OUT.a), WAY_OUT, dr.outOpen, 0);
  drawHerdGate(c, v, X(WAY_IN.a), WAY_IN); drawHerdDoors(c, v, X(WAY_IN.a), WAY_IN, dr.inOpen, dr.shake);
  if (hd.st === 'run') {
    const [ol, or] = jambsOn(v, OUT_L, OUT_R), [il, ir] = jambsOn(v, IN_L, IN_R);
    herdInArch(c, hd.lead, f, ol, or, -1); herdInArch(c, hd.lead, f, il, ir, 1);
  }
  if (hd.st === 'warn' && hd.t > 20 && onScreen(v, X(IN_L) - 60, X(IN_R))) {
    // (dust puffing out under and between the doors, more as they knock harder, rolling out along the alley)
    c.globalAlpha = 0.65;
    const k0 = Math.min(9, Math.floor((hd.t - 20) / 7));
    for (let k = 0; k < k0; k++) { const ph = ((hd.t * 0.9 + k * 13) % 40) / 40, r = 5 + ph * 12 + rnd(k) * 5; dustPuff(c, X(IN_L) + 8 + rnd(k + 5) * (IN_R - IN_L - 16) - ph * 50, GY - 6 - ph * 22 - rnd(k + 9) * 10, r); }
    c.globalAlpha = 1;
  }
  // (the stalls under the awnings: their goods behind, the awnings over them, their tops the walk; the last's the
  // stable's gate, under it)
  AWNINGS.forEach(([a, b, h, col], i) => drawStallAwning(c, v, X(a), X(b), Y(h), col, i, i < AWNINGS.length - 1));
  // (the corral: its gatepost (a hop), the rails, its broken gate, the ride's sign)
  if (onScreen(v, X(5100), X(5400))) {
    drawCorral(c, v, X(FENCE.a), X(FENCE.b), Y(FENCE.h), X(5380));
    postBoard(c, X(5300), GY, ['CAMEL RIDES', 'GATE BROKEN', 'CAMELS: ALSO BROKEN'], LOOKS.morocco(1), '#1D4ED8', undefined, 150);
  }
  // (signs: held up, nothing over them; THE SOUK's is over its gate)
  if (onScreen(v, X(4660), X(4800))) postBoard(c, X(4730), Y(450), ['TEA TERRACE', 'SWEET TEA (SOUTHERN)'], LOOKS.morocco(1), '#15803D', undefined, 62);
  if (onScreen(v, X(5320), X(5480))) postBoard(c, X(5390), GY, ['LEAVING MOROCCO', 'SHUKRAN (CHEERS)'], LOOKS.morocco(1), '#1D4ED8', undefined, 100);
};

export const drawSoukFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame, hd = herdAt(f);
  if (hd.st === 'run' && onScreen(v, X(OUT_L), X(IN_R))) {
    // (out in the alley, between the two gates' near jambs: out of the stable's arch, on into the souk's gate's)
    const [, a] = jambsOn(v, OUT_L, OUT_R), [b] = jambsOn(v, IN_L, IN_R);
    herdStrip(c, hd.lead, f, Math.round(a), Math.round(b), 0);
    c.save(); c.beginPath(); c.rect(Math.round(a), Y(200), Math.round(b) - Math.round(a), 220); c.clip();
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
  // (the brass lantern hung in each herd gate's arch)
  for (const G of [WAY_OUT, WAY_IN]) { const [lx, ly] = at(v.eye, X(G.a + G.w / 2), Y(G.h - 14), HERD_D); if (onScreen(v, X(G.a), X(G.a + G.w), HERD_D)) out.push({ x: lx, y: ly, r: 80, a: 0.35, color: '#FFB060' }); }
  return out;
};
