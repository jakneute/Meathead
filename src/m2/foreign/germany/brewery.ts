// GERMANY's far end (job 4b: the pavilions lengthened): THE BREWERY HILL. Past the beer tent, the hay-bale KEG
// CATCHER (hop it), then the cobbled KEG RAMP up to the brewery yard, and the brewery's loading dock at its top rolls a
// full keg down it every couple of seconds (the dock door, the keg teetering on the lip and the crew's shout first:
// the tell), faster and faster, bouncing at the bottom into the bales and bursting: whoever's in its way gets run over
// (him: `m2:fl_keg`; the cast too, a slap-dancer on the ramp, anybody knocked onto it). Barmaids and a tuba up top
// (the tuba shoves him back down into the kegs). Then THE BRAUHAUS: its wall's a wall (yard to roof), so it's up the
// keg crates, the hop loft's balcony and over its roof (the copper kettle, a small ammo), down the drying racks on its
// far side (they climb back up), the stairs down to the promenade, the border with Italy.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { GroundRun } from '../../../m1/game/core/terrain';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK, LIP } from '../kit';
import { V, KEG } from './lines';

const { x0, x1 } = SECTIONS.germany;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Germany ended: this starts there. */
export const BREW_FROM = 3800;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Germany's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const RAMP = { a: 4000, b: 4700, h: 420 } as const;
const YARD_B = 5200, STAIRS_B = 5480;
/** The keg catcher: hay bales at the ramp's foot (solid, standable). */
const BALES = { a: 3880, b: 3950, h: 80 } as const;
/** The Brauhaus (solid: yard to roof), the keg crates (solid), the hop loft's balcony and the drying racks (one-way). */
const HAUS = { a: 4900, b: 5050, h: 800 } as const;
const CRATES = { a: 4760, b: 4840, h: 540 } as const;
const LOFT: [number, number, number][] = [[4800, 4895, 670], [5060, 5170, 690], [5080, 5190, 560]];
/** The kegs: one every EVERY frames, teetering TEETER frames on the lip (the tell), then rolling down (A px/f²). */
const EVERY = 130, TEETER = 40, A = 0.085, KR = 26;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_slapper', 3780, 0],
  ['m2:fl_slapper', 4350, 210], ['m2:fl_tuba', 4745, RAMP.h], ['m2:fl_barmaid', 4800, CRATES.h],
  ['m2:fl_barmaid', 4990, HAUS.h], ['m2:fl_tuba', 5120, RAMP.h], ['m2:fl_slapper', 5160, RAMP.h],
  ['m2:fl_barmaid', 5500, 0], ['m2:fl_slapper', 5540, 0],
];

export const BREW_CHECKPOINTS = [
  { name: 'GERMANY: THE BREWERY HILL', cp: 33, x: X(3830), y: GY },
  { name: 'GERMANY: THE BRAUHAUS', cp: 34, x: X(5500), y: GY },
];

export const breweryRuns = (): GroundRun[] => [
  { x1: X(BREW_FROM), y1: GY, x2: X(RAMP.a), y2: GY, surface: 'hard' },
  { x1: X(RAMP.a), y1: GY, x2: X(RAMP.b), y2: Y(RAMP.h), surface: 'hard' },
  { x1: X(RAMP.b), y1: Y(RAMP.h), x2: X(YARD_B), y2: Y(RAMP.h), surface: 'hard' },
  { x1: X(YARD_B), y1: Y(RAMP.h), x2: X(STAIRS_B), y2: GY, surface: 'hard', steps: { n: 12 } },
  { x1: X(STAIRS_B), y1: GY, x2: x1, y2: GY, surface: 'hard' },
];

/** The ramp's height at rx. */
const rampH = (rx: number) => (rx <= RAMP.a ? 0 : rx >= RAMP.b ? RAMP.h : (RAMP.h * (rx - RAMP.a)) / (RAMP.b - RAMP.a));

// ---------------------------------------------------------------------------------------------------------------
// The kegs

interface Keg { n: number; rx: number; spin: number; gone: boolean }
interface Brew { said: Shout; hit: Map<number, Set<object>> }
const brewOf = (state: GameState) => foreignState<Brew>(state, 'germany-brew' as 'germany', () => ({ said: newShout(), hit: new Map() }));

/** Every keg rolling at frame f: where it is (rx of its middle), its spin; burst once it reaches the bales. */
const kegsAt = (f: number): Keg[] => {
  const out: Keg[] = [], now = Math.floor(f / EVERY);
  for (let n = now; n > now - 4; n--) {
    if (n < 0) continue;
    const t = f - n * EVERY - TEETER;
    if (t < 0) { out.push({ n, rx: RAMP.b + 10, spin: 0, gone: false }); continue; }
    const rx = RAMP.b + 10 - 0.5 * A * t * t;
    if (rx < BALES.b + KR) continue;
    out.push({ n, rx, spin: (0.5 * A * t * t) / KR, gone: false });
  }
  return out;
};
/** A keg's burst at the bales: its frame (or null). */
const burstAt = (f: number) => {
  const tHit = Math.sqrt((2 * (RAMP.b + 10 - BALES.b - KR)) / A) + TEETER;
  const n = Math.floor((f - tHit) / EVERY), t = f - (n * EVERY + tHit);
  return n >= 0 && t >= 0 && t < 24 ? t : null;
};

export const buildBrewery = (state: GameState) => {
  solid(state, X(BALES.a), Y(BALES.h), BALES.b - BALES.a, BALES.h, { hidden: true, tag: 'de-bales' });
  solid(state, X(HAUS.a), Y(HAUS.h), HAUS.b - HAUS.a, HAUS.h - RAMP.h, { hidden: true, tag: 'de-brauhaus' });
  solid(state, X(CRATES.a), Y(CRATES.h), CRATES.b - CRATES.a, CRATES.h - RAMP.h, { hidden: true, tag: 'de-crates' });
  for (const [a, b, h] of LOFT) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'de-loft' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'de', X, Y, [[5000, HAUS.h, 'small_ammo'], [4850, 670, 'small_health']]);
};

export const updateBrewery = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, b = brewOf(state);
  const near = p.pos.x > X(3500) && p.pos.x < X(5300);
  const kegs = kegsAt(f);
  // (the walkers keep out of a rolling keg's way; the dock's lip while one teeters)
  setHazardZones(state, 'de-kegs', kegs.map(k => ({ x0: X(k.rx) - 120, x1: X(k.rx) + 60, y0: Y(rampH(k.rx)) - 70, y1: Y(rampH(k.rx)) + 4, ground: true })));
  if (f % EVERY === 0 && near) { playSound('clang', 0.4, -12); shout(state, b.said, V.barmaid.f, byPants(state, KEG), X(RAMP.b) + 20, Y(RAMP.h) - 90, 0.3); }
  if (f % EVERY === TEETER && near) playSound('rumble', 0.5, 6);
  for (const k of kegs) {
    if (k.rx > RAMP.b) continue;
    let hit = b.hit.get(k.n);
    if (!hit) { hit = new Set(); b.hit.set(k.n, hit); }
    const kx = X(k.rx), ky = Y(rampH(k.rx)) - KR;
    if (!hit.has(p) && hurtIn(ctx, kx - KR, ky - KR, KR * 2, KR * 2, 11, 'm2:fl_keg', { x: -10, y: -8 }, 26)) { hit.add(p); playSound('thud', 0.8, -6); }
    hitCastIn(ctx, kx - KR, ky - KR, KR * 2, KR * 2, 38, kx + 40, 'KEGGED!', '#FBBF24', hit);
  }
  for (const n of b.hit.keys()) if (n < Math.floor(f / EVERY) - 4) b.hit.delete(n);
  if (burstAt(f) === 0 && near) playSound('crash', 0.6, -4);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const COBBLE = '#A8A29E', OAK = '#92400E', COPPER = '#B45309';

const drawKeg = (c: Ctx, x: number, y: number, spin: number) => {
  c.save(); c.translate(x, y); c.rotate(-spin);
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, KR + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = hour(OAK); c.beginPath(); c.arc(0, 0, KR, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#3F3F46'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, KR - 5, 0, Math.PI * 2); c.stroke();
  box(c, -KR + 4, -2, KR * 2 - 8, 4, '#3F3F46'); box(c, -2, -KR + 4, 4, KR * 2 - 8, hour('#78350F'));
  box(c, -4, -4, 8, 8, '#CA8A04');
  c.restore();
};

export const drawBreweryBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(BREW_FROM), x1)) return;
  const f = state.frame;
  // (the brewery's far fronts: white plaster and dark beams, the copper kettle's chimney, set back)
  setBack(c, v, X(4650), 700, 0.93, () => {
    wall(c, 0, 700, 640, '#F5F0E0');
    const B = dimmed('#3F2A14');
    for (let x = 0; x <= 700; x += 70) box(c, x - 3, -640, 6, 640, B);
    box(c, 0, -320, 700, 6, B);
    poly(c, [[-20, -640], [350, -800], [720, -640]], dimmed('#7F1D1D'));
    for (const wx of [80, 300, 520]) hole(c, wx, -560, 60, 70, true);
  });
  // (the ramp: the hill under it, its cobbled face, the lit lip all the way up: somewhere to stand)
  if (onScreen(v, X(RAMP.a), X(YARD_B))) {
    const C = ramp6(hour(COBBLE)), E = ramp6(hour('#6B5B45'));
    poly(c, [[X(RAMP.a), GY], [X(RAMP.b), Y(RAMP.h)], [X(YARD_B), Y(RAMP.h)], [X(STAIRS_B), GY]], E[2]);
    box(c, X(RAMP.a), GY, STAIRS_B - RAMP.a, 400, E[1]);
    for (let k = 0; k < 12; k++) box(c, X(RAMP.a + 120 + k * 80), Y(rampH(RAMP.a + 120 + k * 80)) + 30 + (k % 3) * 40, 26, 5, E[1]);
    c.strokeStyle = C[3]; c.lineWidth = 6; c.beginPath(); c.moveTo(X(RAMP.a), GY - 2); c.lineTo(X(RAMP.b), Y(RAMP.h) - 2); c.lineTo(X(YARD_B), Y(RAMP.h) - 2); c.stroke();
    for (let rx = RAMP.a + 10; rx < RAMP.b; rx += 22) box(c, X(rx), Y(rampH(rx)) + 2, 14, 5, C[1]);
    c.strokeStyle = LIP[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(X(RAMP.a), GY); c.lineTo(X(RAMP.b), Y(RAMP.h)); c.lineTo(X(YARD_B), Y(RAMP.h)); c.stroke();
    // (the stairs down the far side: treads)
    for (let k = 0; k < 12; k++) { const a = YARD_B + ((STAIRS_B - YARD_B) * k) / 12, h = RAMP.h - (RAMP.h * (k + 1)) / 12; box(c, X(a), Y(h), (STAIRS_B - YARD_B) / 12, 4, C[3]); box(c, X(a), Y(h), (STAIRS_B - YARD_B) / 12, 2, LIP[2]); }
  }
  // (the dock at the top: its door open while a keg teeters)
  if (onScreen(v, X(4690), X(4770))) {
    const open = f % EVERY < TEETER;
    setBack(c, v, X(4700), 60, 0.97, () => { c.save(); c.translate(0, -RAMP.h); wall(c, 0, 60, 130, '#78350F'); hole(c, 8, -100, 44, 100, open); c.restore(); });
    hungBoard(c, X(4730), Y(RAMP.h + 140), Y(RAMP.h + 160), ['KEG DOCK'], LOOKS.germany(1), '#1C1917');
  }
  // (the bales, the crates, the Brauhaus: its wall down to the yard (no way through), its roof the walk)
  boxes3(c, v, [
    { x: X(BALES.a), top: Y(BALES.h), w: BALES.b - BALES.a, bottom: GY, col: '#CA8A04', standable: true },
    { x: X(CRATES.a), top: Y(CRATES.h), w: CRATES.b - CRATES.a, bottom: Y(RAMP.h), col: '#78350F', standable: true },
    { x: X(HAUS.a), top: Y(HAUS.h), w: HAUS.b - HAUS.a, bottom: Y(RAMP.h), col: '#E7E0CC', standable: true },
  ]);
  if (onScreen(v, X(HAUS.a), X(HAUS.b))) {
    for (let x = X(HAUS.a); x <= X(HAUS.b); x += 50) box(c, x - 3, Y(HAUS.h), 6, HAUS.h - RAMP.h, hour('#3F2A14'));
    box(c, X(HAUS.a), Y(600), HAUS.b - HAUS.a, 6, hour('#3F2A14'));
    // (the copper kettle's dome on the roof, its chimney: scenery behind where he walks)
    const K = ramp6(hour(COPPER));
    c.fillStyle = K[2]; c.beginPath(); c.arc(X(5000), Y(HAUS.h) - 4, 34, Math.PI, 0); c.fill();
    box(c, X(4994), Y(HAUS.h) - 90, 12, 56, K[1]);
    if ((f >> 4) % 3 === 0) box(c, X(4990), Y(HAUS.h) - 110, 20, 14, dimmed('#E5E7EB'));
  }
  if (onScreen(v, X(BALES.a), X(BALES.b))) for (let y = Y(BALES.h) + 10; y < GY; y += 18) box(c, X(BALES.a), y, BALES.b - BALES.a, 2, hour('#A16207'));
  for (const [a, b, h] of LOFT) if (onScreen(v, X(a), X(b))) { ledge3(c, v, X(a), Y(h), b - a, '#78716C', 10); for (let x = X(a) + 8; x < X(b) - 6; x += 12) box(c, x, Y(h) + 10, 5, 26, hour('#65A30D')); }
  // (the signs: held up, nothing over them)
  if (onScreen(v, X(3960), X(4100))) postBoard(c, X(3990), GY, ['KEG RAMP', 'WATCH FOR KEGS', '(THEY WATCH FOR YOU)'], LOOKS.germany(1), '#7F1D1D', undefined, 160);
  if (onScreen(v, X(BALES.a), X(BALES.b))) hungBoard(c, X((BALES.a + BALES.b) / 2), Y(BALES.h), Y(BALES.h) + 24, ['KEG CATCHER'], LOOKS.germany(1), '#14532D');
  if (onScreen(v, X(4700), X(4860))) postBoard(c, X(4840), Y(RAMP.h), ['BRAUHAUS', 'BEER: BUD LIGHT'], LOOKS.germany(1), '#1C1917', undefined, 100);
  if (onScreen(v, X(5420), X(5600))) postBoard(c, X(5510), GY, ['LEAVING GERMANY', 'AUF WIEDERSEHEN', '(GOODBYE IN DUTCH)'], LOOKS.germany(1), '#1C1917', undefined, 120);
};

export const drawBreweryFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (onScreen(v, X(BALES.a), X(RAMP.b + 60))) {
    for (const k of kegsAt(f)) {
      const wob = k.rx > RAMP.b ? Math.sin(f * 0.5) * 0.15 : 0;
      drawKeg(c, X(k.rx), Y(rampH(Math.min(k.rx, RAMP.b))) - KR, k.spin + wob);
    }
    const bt = burstAt(f);
    if (bt !== null) for (let k = 0; k < 14; k++) { const a = -Math.PI * (0.1 + (0.8 * k) / 13), r = bt * 5; box(c, X(BALES.b + 20) + Math.cos(a) * r, Y(BALES.h) - 10 + Math.sin(a) * r + bt * bt * 0.2, 6, 5, k % 3 ? '#FEF3C7' : '#F59E0B'); }
  }
  drawShout(c, brewOf(state).said);
};

export const breweryLamps = (v: View): Light[] => (onScreen(v, X(4600), X(5200)) ? [{ x: X(4730), y: Y(RAMP.h + 60), r: 140, a: 0.45, color: '#FDE68A' }] : []);
