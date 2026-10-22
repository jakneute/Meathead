// NORWAY: section 2 of Foreign Lands' streets (flows on from Mexico, into China: no walls, no doors). The fishing
// village fronts in red and ochre with their steep roofs, the fjord far off. A viking alone, then a shield wall of one;
// the TROLL BRIDGE (two troll statues holding a plank up: stand on them, a viking on the plank lobbing axes); the
// lutefisk booth (FREE SAMPLES: the sampler lady); then THE FJORD, a wave pool (800 wide: no jumping it), and the
// LONGSHIP on it, ferrying across and back, rocking on the wave machine's swell (a viking aboard). The wave machine
// sends a big wave down the pool every few seconds: in the water, it shoves and hurts (him and the cast: anybody
// knocked in). Then the STAVE CHURCH, climbed roof by roof (dragon heads off every gable end, a small ammo up top),
// and the lot of them mixed; then THE TROLL TOLL BRIDGE (toll.ts, job 4b: two giant trolls holding a bridge up, the
// toll gang at its gate, the troll under the bridge in the river), to the border with China.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 10-19. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { heardSpan } from '../../bossQuiet';
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { makeMover, moveMover, type Mover } from '../movers';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import {
  type Ctx, type View, viewIn, box, poly, promenade, boxes3, ledge3, postBoard, hungBoard, flagPole, LOOKS, hour, ramp6, onScreen, FACADE_D, INK,
} from '../kit';
import { drawHouse, trollFace, drawBooth, drawHousing, drawShip, drawChurch, type NoFront } from './art';
import { TALK } from './lines';
import './kinds';
import { TOLL_FROM, TOLL_CHECKPOINTS, RIVER, tollRuns, buildToll, updateToll, tollWater, drawTollBack, drawTollFront, tollLamps } from './toll';

const { x0, x1 } = SECTIONS.norway;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

const POOL: Pool = { key: 'fjord', a: X(2000), b: X(2800), surface: 30, bed: 190, col: '#1D4ED8', wall: '#64748B' };
/** The trolls (standable), the plank they hold up (one-way). */
const TROLLS: [number, number][] = [[1080, 1180], [1380, 1480]];
const TROLL_H = 130, PLANK = { a: 1160, b: 1400, h: 210 } as const;
const BOOTH = { a: 1600, b: 1760, h: 80 } as const;
/** The longship: its deck's width; where its left end docks (left, right); its deck over the promenade. */
const SHIP = { w: 260, l: 2010, r: 2530, deck: 16 } as const;
const CYCLE = 960;
/** The wave machine: a wave every WAVE_EVERY frames, WAVE_RUN frames down the pool. */
const WAVE_EVERY = 330, WAVE_RUN = 150;
/** The stave church's roofs (one-way), bottom to top: [a, b, h]. */
const CHURCH: [number, number, number][] = [[2920, 3480, 140], [3000, 3400, 270], [3080, 3320, 400], [3160, 3240, 520]];

const ENEMIES: [string, number, number][] = [
  ['m2:fl_viking', 600, 0], ['m2:fl_shieldviking', 900, 0],
  // (the sampler lady by her booth, out of THE FJORD's checkpoint's reach: lobbing as he comes down off the plank)
  ['m2:fl_viking', 1280, PLANK.h], ['m2:fl_lutefisk', 1570, 0],
  // the church (off its checkpoint's spot): a shield wall of one up on the bottom roof's far end (a shield on a roof:
  // over him, behind him), the vikings up the roofs (their horns: no dive kicks onto them), the sampler lady up on the
  // third roof lobbing down
  ['m2:fl_shieldviking', 3400, 140], ['m2:fl_viking', 3150, 140], ['m2:fl_viking', 3260, 270], ['m2:fl_lutefisk', 3200, 400],
  // down the far side: a shield wall with a viking right behind it (the shield in front, the axes over it)
  ['m2:fl_shieldviking', 3540, 0], ['m2:fl_viking', 3640, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[3200, 520, 'small_ammo'], [1690, BOOTH.h, 'small_health']];

export const NORWAY_CHECKPOINTS = [
  { name: 'NORWAY', cp: 10, x: X(150), y: GY },
  { name: 'NORWAY: THE FJORD', cp: 11, x: X(1950), y: GY },
  { name: 'NORWAY: THE STAVE CHURCH', cp: 12, x: X(2860), y: GY },
  ...TOLL_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// The longship and the wave machine

interface Nor { ship: Mover | null; hit: Set<object>; waveN: number }
const norOf = (state: GameState) => foreignState<Nor>(state, 'norway', () => ({ ship: null, hit: new Set(), waveN: -1 }));

const ease = (t: number) => t * t * (3 - 2 * t);
/** Where the ship's left end is at frame f. */
const shipX = (f: number) => {
  const t = f % CYCLE;
  if (t < 150) return X(SHIP.l);
  if (t < 480) return X(SHIP.l) + (X(SHIP.r) - X(SHIP.l)) * ease((t - 150) / 330);
  if (t < 630) return X(SHIP.r);
  return X(SHIP.r) - (X(SHIP.r) - X(SHIP.l)) * ease((t - 630) / 330);
};
/** The wave's crest (world x), or null between waves. */
const crestAt = (f: number) => { const t = f % WAVE_EVERY; return t < WAVE_RUN ? POOL.a + ((POOL.b - POOL.a + 200) * t) / WAVE_RUN - 100 : null; };
const waveH = (f: number, x: number) => { const c = crestAt(f); return c === null ? 0 : 28 * Math.exp(-(((x - c) / 70) ** 2)); };
/** The deck's top (world y) with its left end at sx. */
const deckY = (f: number, sx: number) => Y(SHIP.deck) - waveH(f, sx + SHIP.w / 2) + Math.round(Math.sin(f * 0.05) * 3);

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const RED = '#9F1239', OCHRE = '#CA8A04', WHITE = '#E7E5E4';

/** The fishing village's fronts (set back, braced): board-and-batten, sod roofs, red, ochre and white, white trim. */
const FRONTS: NoFront[] = [
  { rx: 340, w: 220, h: 170, col: RED, name: 'SWEATERS' },
  { rx: 600, w: 200, h: 150, col: OCHRE, name: 'TROLL GIFTS' },
  { rx: 860, w: 240, h: 180, col: WHITE, name: 'WAFFLES' },
  { rx: 3560, w: 220, h: 160, col: RED, name: 'FISK' },
];
const drawFronts = (c: Ctx, v: View) => {
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawHouse(c, v, X(fr.rx), fr);
};

/** The stave church (its roofs are what he climbs): the walls set back, the shingled roofs, their ridges' lips; the
 *  spire's little dragon weathervane. */
const drawStaveChurch = (c: Ctx, v: View) => {
  if (!onScreen(v, X(2880), X(3520))) return;
  drawChurch(c, v, X, Y, CHURCH);
  for (const [a, b, h] of CHURCH) ledge3(c, v, X(a), Y(h), b - a, '#57402A', 6);
  const W = ramp6(hour('#3F2A14'));
  box(c, X(3198) - 1, Y(520) - 41, 6, 41, INK); box(c, X(3198), Y(520) - 40, 4, 40, W[3]); box(c, X(3198), Y(520) - 40, 1, 40, W[5]);
  poly(c, [[X(3200), Y(520) - 40], [X(3212), Y(520) - 48], [X(3218), Y(520) - 44], [X(3208), Y(520) - 38]], hour('#CA8A04'));
};

export const norway: ForeignSection = {
  id: 'norway', x0, x1,
  checkpoints: NORWAY_CHECKPOINTS,
  build: (state) => {
    layOwn(state, [...runsAround(x0, X(TOLL_FROM), [POOL]), ...tollRuns()]);
    buildToll(state);
    poolSteps(state, POOL);
    for (const [a, b] of TROLLS) solid(state, X(a), Y(TROLL_H), b - a, TROLL_H, { hidden: true, tag: 'no-troll' });
    ledge(state, X(PLANK.a), Y(PLANK.h), PLANK.b - PLANK.a, { hidden: true, tag: 'no-plank' });
    solid(state, X(BOOTH.a), Y(BOOTH.h), BOOTH.b - BOOTH.a, BOOTH.h, { hidden: true, tag: 'no-booth' });
    for (const [a, b, h] of CHURCH) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'no-church' });
    const n = norOf(state);
    n.ship = makeMover(state, shipX(state.frame), deckY(state.frame, shipX(state.frame)), SHIP.w, 'no-ship');
    spawnCast(state, ENEMIES, X, Y);
    // (a viking aboard: put on the deck wherever the ship is now)
    if (n.ship) spawnCast(state, [['m2:fl_viking', n.ship.x - x0 + 140, 0]], X, () => n.ship!.y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `no-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, n = norOf(state), f = state.frame;
    pavilionTalk(state, 'no', x0, GY, TALK);
    updateToll(ctx);
    poolZones(state, 'no-fjord', [POOL]);
    // The longship, across and back, riding the swell
    if (n.ship) { const sx = shipX(f); moveMover(state, n.ship, sx, deckY(f, sx)); }
    // The wave machine: a wave down the pool; in the water at its crest, shoved and hurt (each once a wave)
    const cr = crestAt(f), wn = Math.floor(f / WAVE_EVERY);
    if (wn !== n.waveN) { n.waveN = wn; n.hit.clear(); }
    if (f % WAVE_EVERY === 0 && heardSpan(state, POOL.a, POOL.b)) playSound('splash', 0.5, -8);
    if (cr !== null) {
      const pcx = p.pos.x + p.width / 2, inWater = pcx > POOL.a && pcx < POOL.b && p.pos.y + p.height > GY + POOL.surface - 6;
      if (inWater && Math.abs(pcx - cr) < 46 && !n.hit.has(p) && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene) {
        n.hit.add(p); hurtPlayer(ctx, 6, 'm2:fl_wave', { x: 9, y: -6 }, 24); playSound('splash', 0.8, -2);
      }
      for (const e of hazardVictims(state)) {
        if (n.hit.has(e) || !boxHits(e, cr - 40, GY + POOL.surface - 10, 80, POOL.bed)) continue;
        if (e.pos.x + e.width / 2 < POOL.a || e.pos.x + e.width / 2 > POOL.b) continue;
        n.hit.add(e); hazardHit(ctx, e, 30, cr - 60, 'WAVED!', { color: '#93C5FD' });
      }
    }
    return controls;
  },
  waterBodyAt: (state, x, y) => {
    // (the wave machine's swell lifts what's floating in it)
    const w = poolAt([POOL], x, y);
    if (w) { w.lift = waveH(state.frame, x); return w; }
    return tollWater(x, y);
  },
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, POOL.a, '#D6CBB4', '#8C7F68', [false, true]);
    promenade(c, v, POOL.b, RIVER.a, '#D6CBB4', '#8C7F68', [true, true]);
    promenade(c, v, RIVER.b, x1, '#D6CBB4', '#8C7F68', [true, false]);
    drawFronts(c, v);
    drawPoolBack(c, v, POOL);
    // (the wave machine's housing at the pool's far end, set back: its light on before a wave)
    drawHousing(c, v, POOL.a - 40, f % WAVE_EVERY > WAVE_EVERY - 70);
    // (the trolls and their plank, the booth)
    boxes3(c, v, [
      ...TROLLS.map(([a, b]) => ({ x: X(a), top: Y(TROLL_H), w: b - a, bottom: GY, col: '#6B7F5E', standable: true, look: 'rock' as const })),
      { x: X(BOOTH.a), top: Y(BOOTH.h), w: BOOTH.b - BOOTH.a, bottom: GY, col: '#1E40AF', standable: true, look: 'plank' },
    ]);
    if (onScreen(v, X(1040), X(1520))) {
      TROLLS.forEach(([a, b], i) => trollFace(c, X(a), Y(TROLL_H), b - a, TROLL_H, i === 1 ? 10 : b - a - 22, PLANK.h - TROLL_H - 14));
      ledge3(c, v, X(PLANK.a), Y(PLANK.h), PLANK.b - PLANK.a, '#8B5E34', 12, 'plank');
    }
    if (onScreen(v, X(BOOTH.a) - 20, X(BOOTH.b) + 20)) { drawBooth(c, X(BOOTH.a), X(BOOTH.b), Y(BOOTH.h)); hungBoard(c, X((BOOTH.a + BOOTH.b) / 2), Y(BOOTH.h) - 68, Y(BOOTH.h) - 40, ['FREE LUTEFISK', 'PLEASE. ANYBODY.'], LOOKS.norway(1), '#7F1D1D'); }
    // (the longship)
    if (state.stage) { const n = norOf(state); if (n.ship) drawShip(c, v, n.ship.x, n.ship.y, SHIP.w, f); }
    drawStaveChurch(c, v);
    // (the signs: on posts, hung, never anything over them)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['NORWAY', 'CAPITAL OF SWEDEN'], LOOKS.norway(2), '#7F1D1D');
    if (onScreen(v, X(PLANK.a), X(PLANK.b))) postBoard(c, X(1010), GY, ['TROLL BRIDGE', 'TOLL: $5'], LOOKS.norway(1), '#3F6212', undefined, 80);
    if (onScreen(v, X(1880), X(2000))) postBoard(c, X(1930), GY, ['THE FJORD', '(WAVE POOL)', 'NO LIFEGUARD ON DUTY'], LOOKS.norway(1), '#1E3A8A', undefined, 130);
    if (onScreen(v, X(2820), X(2920))) postBoard(c, X(2860), GY, ['STAVE CHURCH', 'NO STAVES INSIDE'], LOOKS.norway(1), '#3F2A14', undefined, 110);
    drawTollBack(c, v, state);
    for (const [fx, cols] of [[X(80), ['#BA0C2F', '#F8FAFC', '#00205B', '#F8FAFC', '#BA0C2F']], [X(5580),['#BA0C2F', '#F8FAFC', '#00205B', '#F8FAFC', '#BA0C2F']]] as const) if (onScreen(v, fx - 20, fx + 60)) flagPole(c, fx, GY, 200, [...cols], f);
    void WHITE;
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawPoolFront(c, v, POOL, f, x => waveH(f, x));
    drawTollFront(c, v, state);
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    if (onScreen(v, X(2900), X(3500))) out.push({ x: X(3200), y: Y(60), r: 160, a: 0.45, color: '#FDE68A' });
    if (onScreen(v, X(BOOTH.a), X(BOOTH.b))) out.push({ x: X(1680), y: Y(110), r: 120, a: 0.4, color: '#FDE68A' });
    out.push(...tollLamps(v));
    return out;
  },
};
