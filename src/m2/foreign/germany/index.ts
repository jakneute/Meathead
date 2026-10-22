// GERMANY: section 4 of Foreign Lands' streets (flows on from China, into Italy: no walls, no doors). The BIERGARTEN
// (long tables to stand on, the oompah band's bandstand and its roof, barmaids lobbing steins, a slap-dancer), the
// pretzel and sausage stands, then the CASTLE: its gate's shut (a portcullis, ground to battlements), so the way on is
// up the WORLD'S BIGGEST CUCKOO CLOCK on its wall: the clock's figures (a woodcutter, a dancing couple, a beer drinker,
// a goat...) come out on a schedule, round and round on its big wheel, a sixth of a turn at a time: ride them up to
// the battlements. Over the battlements, under the clock's door: on the hour (every few seconds) the CUCKOO bursts out
// and pecks whoever's under it (him, the cast). Down the far tower's balconies (the way back up, too), the beer tent,
// then THE BREWERY HILL (brewery.ts, job 4b: kegs rolled down the ramp at him, the Brauhaus climbed over), the
// border with Italy.
//
// The SNES pass: art.ts paints it all (the layout here untouched). Checkpoints 30-39. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { heard } from '../../bossQuiet';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { makeMover, moveMover, type Mover } from '../movers';
import {
  type Ctx, type View, type Box3, viewIn, atDepth, promenade, boxes3, box3Back, box3Front, ledge3, postBoard, hungBoard, flagPole, LOOKS, onScreen, FACADE_D,
} from '../kit';
import {
  drawFront, drawCastle, drawFarTower, drawClockHouse, drawCuckoo, drawFigure, drawWheelArt, merlons, drawPortcullis, backRail, paintedBoxes, bench,
  tableSteins, bandstandRoof, valance, giantPretzel, giantSausage, pennants, FIGS, STONE, type DeFront,
} from './art';
import { TALK } from './lines';
import './kinds';
import { BREW_FROM, BREW_CHECKPOINTS, breweryRuns, buildBrewery, updateBrewery, drawBreweryBack, drawBreweryFront, breweryLamps } from './brewery';

const { x0, x1 } = SECTIONS.germany;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const TABLES: [number, number, number][] = [[520, 680, 50], [1060, 1220, 50], [3150, 3310, 50]];
const STAGE = { a: 760, b: 980, h: 90, roof: 260 } as const;
const STANDS: [number, number, number, string][] = [[1340, 1480, 100, '#B45309'], [1520, 1650, 130, '#991B1B']];
const KEGS = { a: 2020, b: 2100, h: 70 } as const;
/** The cuckoo clock's wheel of figures: its hub (rx, h), its radius, how many, each platform's width. */
const WHEEL = { cx: 2300, cy: 360, r: 220, n: 6, w: 90 } as const;
/** A sixth of a turn every STEP frames (TURN of them turning, the rest stopped). */
const STEP = 180, TURN = 60;
const BATTLE = { a: 1950, b: 2740, h: 640 } as const;
const GATE = { a: 2700, b: 2740, h: 600 } as const;
/** The far tower's balconies (one-way): down from the battlements, and the way back up. */
const BALCONIES: [number, number, number][] = [[2750, 2900, 140], [2760, 2900, 280], [2750, 2900, 420], [2760, 2900, 560]];
/** The cuckoo's door (rx), the box it pecks (over the battlements); its schedule. */
const CUCKOO = { x: 2300, a: 2228, b: 2372, every: 360, warn: 45, out: 40 } as const;

const ENEMIES: [string, number, number][] = [
  // the biergarten (the way in by GERMANY's checkpoint quiet): a barmaid up on a table, the tuba on the bandstand, a
  // slap-dancer under it; a barmaid on the next table; at the stands, a slap-dancer on the ground under the tuba up on
  // the sausage stand (its OOM-PAH shoves him into the slaps)
  ['m2:fl_barmaid', 600, 50], ['m2:fl_tuba', 870, STAGE.h], ['m2:fl_slapper', 1000, 0],
  ['m2:fl_barmaid', 1140, 50], ['m2:fl_slapper', 1300, 0], ['m2:fl_tuba', 1590, 130],
  // the battlements: a slap-dancer waiting where the clock's wheel lets him off, by the cuckoo's door (lure it under
  // the cuckoo); the barmaid and the tuba on along them
  ['m2:fl_slapper', 2150, BATTLE.h], ['m2:fl_barmaid', 2460, BATTLE.h], ['m2:fl_tuba', 2610, BATTLE.h],
  // down the far tower: a barmaid on the top balcony (steins down on him), a slap-dancer on a low one; then past THE
  // CASTLE's checkpoint, a tuba with a slap-dancer right in front of it (charge the dancer into it)
  ['m2:fl_barmaid', 2820, 560], ['m2:fl_slapper', 2830, 280], ['m2:fl_slapper', 3500, 0], ['m2:fl_tuba', 3570, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2660, BATTLE.h, 'small_ammo'], [1410, 100, 'small_health']];

export const GERMANY_CHECKPOINTS = [
  { name: 'GERMANY', cp: 30, x: X(150), y: GY },
  { name: 'GERMANY: THE CUCKOO CLOCK', cp: 31, x: X(1750), y: GY },
  { name: 'GERMANY: THE CASTLE', cp: 32, x: X(2960), y: GY },
  ...BREW_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// The wheel and the cuckoo

interface Ger { figs: Mover[] }
const gerOf = (state: GameState) => foreignState<Ger>(state, 'germany', () => ({ figs: [] }));
const ease = (t: number) => t * t * (3 - 2 * t);
/** The wheel's turn (radians) at frame f: a sixth of a turn each STEP, turning for TURN frames of it. */
const turnAt = (f: number) => { const k = Math.floor(f / STEP), t = f % STEP; return ((k + (t < TURN ? ease(t / TURN) : 1)) * Math.PI * 2) / WHEEL.n; };
/** Figure i's platform: its top's left end (world). */
const figAt = (f: number, i: number) => {
  const a = turnAt(f) + (i * Math.PI * 2) / WHEEL.n + Math.PI / 2;
  return { x: X(WHEEL.cx) + Math.cos(a) * WHEEL.r - WHEEL.w / 2, y: Y(WHEEL.cy) - Math.sin(a) * WHEEL.r };
};
/** The cuckoo: 0 in, 'warn' its door open, 'out' pecking (and how far out, 0..1). */
const cuckooAt = (f: number) => {
  const t = f % CUCKOO.every;
  if (t < CUCKOO.warn) return { st: 'warn' as const, k: 0 };
  if (t < CUCKOO.warn + CUCKOO.out) { const u = (t - CUCKOO.warn) / CUCKOO.out; return { st: 'out' as const, k: Math.min(1, u * 4, (1 - u) * 4) }; }
  return { st: 'in' as const, k: 0 };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (art.ts paints it all)

/** The half-timbered fronts (set back, braced), their boards. */
const FRONTS: DeFront[] = [
  { rx: 300, w: 240, h: 180, name: 'WURST HAUS' },
  { rx: 1240, w: 300, h: 200, name: 'GIFTS (SWISS)' },
  { rx: 2980, w: 260, h: 170, name: 'LEDERHOSEN' },
  { rx: 3400, w: 280, h: 190, name: 'STEINS' },
];

/** The wheel: its rim, teeth and spokes behind (dimmed, thin: not somewhere to stand), each figure's platform
 *  (standable) and its carved figure. */
const drawWheel = (c: Ctx, v: View, g: Ger, f: number) => {
  if (!onScreen(v, X(WHEEL.cx - WHEEL.r - 80), X(WHEEL.cx + WHEEL.r + 80))) return;
  drawWheelArt(c, X(WHEEL.cx), Y(WHEEL.cy), WHEEL.r, g.figs.map(m => ({ x: m.x + WHEEL.w / 2, y: m.y })), turnAt(f));
  g.figs.forEach((m, i) => { drawFigure(c, FIGS[i % FIGS.length], m.x, m.y, f + i * 20); ledge3(c, v, m.x, m.y, WHEEL.w, '#A16207', 10); });
};

/** The biergarten: the promenade, the fronts, the castle and its clock, the tables (steins on them) and their benches,
 *  the bandstand, the stands and their signs, the keg stack, the pennants. */
const drawGarden = (c: Ctx, v: View, f: number) => {
  promenade(c, v, x0, X(4000), '#D6CBB4', '#8C7F68');
  promenade(c, v, X(5480), x1, '#D6CBB4', '#8C7F68');
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawFront(c, v, X(fr.rx), fr);
  drawCastle(c, v, X(1720));
  drawClockHouse(c, v, X(2120), f);
  // (the giant pretzel and sausage on their sticks, stood at the backs of their stands)
  if (onScreen(v, X(1340), X(1480))) atDepth(c, v.eye, 0.97, () => giantPretzel(c, X(1410), Y(100) - 50));
  if (onScreen(v, X(1520), X(1650))) atDepth(c, v.eye, 0.97, () => giantSausage(c, X(1585), Y(130) - 50));
  // (the tables: their tops, the steins on them, their fronts; the benches either side (scenery))
  const tables: Box3[] = TABLES.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#92400E', standable: true, look: 'plank' }));
  const tv = tables.filter(t => onScreen(v, t.x, t.x + t.w));
  for (const t of tv) box3Back(c, v, t);
  for (const t of tv) tableSteins(c, v, t.x, t.x + t.w, t.top);
  for (const t of tv) { box3Front(c, t); bench(c, t.x - 26, 20); bench(c, t.x + t.w + 6, 20); }
  boxes3(c, v, STANDS.map(([a, b, h, col]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col, standable: true, look: 'plank' as const })));
  paintedBoxes(c, v, [
    { b: { x: X(STAGE.a), top: Y(STAGE.h), w: STAGE.b - STAGE.a, bottom: GY, col: '#1E3A8A', standable: true }, kind: 'lozenge' },
    { b: { x: X(KEGS.a), top: Y(KEGS.h), w: KEGS.b - KEGS.a, bottom: GY, col: '#78350F', standable: true }, kind: 'kegs' },
  ]);
  if (onScreen(v, X(STAGE.a) - 30, X(STAGE.b) + 30)) {
    bandstandRoof(c, X(STAGE.a), X(STAGE.b), Y(STAGE.roof), Y(STAGE.h));
    ledge3(c, v, X(STAGE.a), Y(STAGE.roof), STAGE.b - STAGE.a, '#1E40AF', 6);
  }
  for (const [a, b, h, col] of STANDS) if (onScreen(v, X(a), X(b))) valance(c, X(a), X(b), Y(h), col);
  // (Bavarian blue-and-white pennants over the garden)
  for (let rx = 380; rx < 1300; rx += 300) if (onScreen(v, X(rx), X(rx + 300))) pennants(c, X(rx), Y(230), X(rx + 300), Y(230), 22);
};

export const germany: ForeignSection = {
  id: 'germany', x0, x1,
  checkpoints: GERMANY_CHECKPOINTS,
  build: (state) => {
    layOwn(state, [{ x1: x0, y1: GY, x2: X(BREW_FROM), y2: GY, surface: 'hard' }, ...breweryRuns()]);
    buildBrewery(state);
    for (const [a, b, h] of TABLES) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'de-table' });
    solid(state, X(STAGE.a), Y(STAGE.h), STAGE.b - STAGE.a, STAGE.h, { hidden: true, tag: 'de-stage' });
    ledge(state, X(STAGE.a), Y(STAGE.roof), STAGE.b - STAGE.a, { hidden: true, tag: 'de-roof' });
    for (const [a, b, h] of STANDS) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'de-stand' });
    solid(state, X(KEGS.a), Y(KEGS.h), KEGS.b - KEGS.a, KEGS.h, { hidden: true, tag: 'de-kegs' });
    ledge(state, X(BATTLE.a), Y(BATTLE.h), BATTLE.b - BATTLE.a, { hidden: true, tag: 'de-battlements' });
    solid(state, X(GATE.a), Y(GATE.h), GATE.b - GATE.a, GATE.h, { hidden: true, tag: 'de-portcullis' });
    for (const [a, b, h] of BALCONIES) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'de-balcony' });
    const g = gerOf(state);
    g.figs = Array.from({ length: WHEEL.n }, (_, i) => { const p = figAt(state.frame, i); return makeMover(state, p.x, p.y, WHEEL.w, 'de-figure'); });
    spawnCast(state, ENEMIES, X, Y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `de-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, g = gerOf(state), f = state.frame;
    pavilionTalk(state, 'de', x0, GY, TALK);
    updateBrewery(ctx);
    // The wheel: a sixth of a turn at a time (a clunk as each turn starts)
    g.figs.forEach((m, i) => { const q = figAt(f, i); moveMover(state, m, q.x, q.y); });
    if (f % STEP === 0 && heard(state, X(WHEEL.cx))) playSound('clang', 0.4, -10);
    // The cuckoo: the door's click, then out and pecking; its box a danger zone (the cast keep out from the click on)
    const ck = cuckooAt(f), za = X(CUCKOO.a), zb = X(CUCKOO.b), zy = Y(BATTLE.h + 120);
    if (ck.st !== 'in') setHazardZones(state, 'de-cuckoo', [{ x0: za, x1: zb, y0: zy, y1: Y(BATTLE.h) + 4 }]);
    const near = heard(state, X(CUCKOO.x));
    if (f % CUCKOO.every === 0 && near) playSound('click', 0.6, -6);
    if (f % CUCKOO.every === CUCKOO.warn && near) { playSound('horn', 0.5, 14); setTimeout(() => playSound('horn', 0.5, 10), 260); }
    if (ck.st === 'out' && ck.k > 0.7) {
      const by = Y(BATTLE.h + 150) - 10 + ck.k * 100, bx0 = X(CUCKOO.x) - 30, bw = 60, bh = 60;
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && p.pos.x < bx0 + bw && p.pos.x + p.width > bx0 && p.pos.y < by + 36 && p.pos.y + p.height > by - 22) {
        hurtPlayer(ctx, 10, 'm2:fl_cuckoo', { x: Math.sign(p.pos.x + p.width / 2 - X(CUCKOO.x)) * 9 || 9, y: -5 }, 22);
        shakeScreen(state, 5, 3);
      }
      for (const e of hazardVictims(state)) if (boxHits(e, bx0, by - 22, bw, bh)) hazardHit(ctx, e, 35, X(CUCKOO.x), "CUCKOO'D!", { color: '#FCD34D' });
    }
    return controls;
  },
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawGarden(c, v, f);
    // (back to front: the battlements' merlons (0.94), the far tower (0.95), then the play plane: the battlements' walk,
    // the portcullis (iron, ground to top), the far tower's balconies, their rails along their backs)
    const battle = onScreen(v, X(BATTLE.a), X(BATTLE.b)), tower = onScreen(v, X(2740), X(2920));
    if (battle) merlons(c, v, X(BATTLE.a), X(BATTLE.b), Y(BATTLE.h));
    if (tower) drawFarTower(c, v, X(2745));
    if (battle) ledge3(c, v, X(BATTLE.a), Y(BATTLE.h), BATTLE.b - BATTLE.a, STONE, 20, 'stone');
    if (onScreen(v, X(GATE.a) - 40, X(GATE.b) + 40)) drawPortcullis(c, X(GATE.a), X(GATE.b), Y(GATE.h), Y(BATTLE.h));
    if (tower) for (const [a, b, h] of BALCONIES) { backRail(c, v, X(a), X(b), Y(h)); ledge3(c, v, X(a), Y(h), b - a, '#78716C', 10, 'stone'); }
    drawWheel(c, v, gerOf(state), f);
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['GERMANY', 'OKTOBERFEST: ALL YEAR'], LOOKS.germany(2), '#1C1917');
    if (onScreen(v, X(400), X(500))) postBoard(c, X(450), GY, ['BIERGARTEN', 'NO OUTSIDE BIER'], LOOKS.germany(1), '#14532D', undefined, 90);
    if (onScreen(v, X(1340), X(1480))) hungBoard(c, X(1410), Y(100) - 6, Y(100) + 30, ['PRETZELS', 'GERMAN FRENCH FRIES'], LOOKS.germany(1), '#78350F');
    if (onScreen(v, X(1520), X(1650))) hungBoard(c, X(1585), Y(130) - 6, Y(130) + 30, ['WURST', 'THE WURST IN TOWN'], LOOKS.germany(1), '#7F1D1D');
    if (onScreen(v, X(1760), X(1960))) postBoard(c, X(1860), GY, ["WORLD'S BIGGEST", 'CUCKOO CLOCK', 'SWISS MADE'], LOOKS.germany(1), '#3F2A14', undefined, 130);
    if (onScreen(v, X(2560), X(2700))) postBoard(c, X(2620), GY, ['CASTLE CLOSED', 'USE THE CLOCK'], LOOKS.germany(1), '#7F1D1D', undefined, 80);
    drawBreweryBack(c, v, state);
    if (onScreen(v, X(20), X(120))) flagPole(c, X(40), GY, 200, ['#000000', '#DD0000', '#FFCE00'], f);
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    if (onScreen(v, X(CUCKOO.a), X(CUCKOO.b))) { const ck = cuckooAt(f); drawCuckoo(c, X(CUCKOO.x), Y(BATTLE.h + 150), ck.st, ck.k, f); }
    drawBreweryFront(c, v, state);
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    if (onScreen(v, X(STAGE.a), X(STAGE.b))) out.push({ x: X(870), y: Y(200), r: 170, a: 0.5, color: '#FDE68A' });
    if (onScreen(v, X(2100), X(2500))) out.push({ x: X(2300), y: Y(860), r: 200, a: 0.4, color: '#FDE68A' });
    out.push(...breweryLamps(v));
    return out;
  },
};
