// NORWAY: section 2 of Foreign Lands' streets (flows on from Mexico, into China: no walls, no doors). The fishing
// village fronts in red and ochre with their steep roofs, the fjord far off. A viking alone, then a shield wall of one;
// the TROLL BRIDGE (two troll statues holding a plank up: stand on them, a viking on the plank lobbing axes); the
// lutefisk booth (FREE SAMPLES: the sampler lady); then THE FJORD, a wave pool (800 wide: no jumping it), and the
// LONGSHIP on it, ferrying across and back, rocking on the wave machine's swell (a viking aboard). The wave machine
// sends a big wave down the pool every few seconds: in the water, it shoves and hurts (him and the cast: anybody
// knocked in). Then the STAVE CHURCH, climbed roof by roof (dragon heads off every gable end, a small ammo up top),
// and the lot of them mixed, to the border with China.
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
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { makeMover, moveMover, type Mover } from '../movers';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import {
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, flagPole,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK, LIP,
} from '../kit';
import { TALK } from './lines';
import './kinds';

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
  ['m2:fl_viking', 1280, PLANK.h], ['m2:fl_lutefisk', 1840, 0],
  ['m2:fl_shieldviking', 2900, 0], ['m2:fl_viking', 3150, 140], ['m2:fl_viking', 3260, 270],
  ['m2:fl_shieldviking', 3470, 0], ['m2:fl_lutefisk', 3620, 0], ['m2:fl_viking', 3740, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[3200, 520, 'small_ammo'], [1690, BOOTH.h, 'small_health']];

export const NORWAY_CHECKPOINTS = [
  { name: 'NORWAY', cp: 10, x: X(150), y: GY },
  { name: 'NORWAY: THE FJORD', cp: 11, x: X(1950), y: GY },
  { name: 'NORWAY: THE STAVE CHURCH', cp: 12, x: X(2860), y: GY },
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

const RED = '#9F1239', OCHRE = '#CA8A04', WHITE = '#E7E5E4', TAR = '#3F2A14';

/** The fishing village's fronts (set back): wooden, steep-roofed, red, ochre and white, white trim. */
const FRONTS: [number, number, number, string][] = [[340, 220, 170, RED], [600, 200, 150, OCHRE], [860, 240, 180, WHITE], [3560, 220, 160, RED]];
const drawFronts = (c: Ctx, v: View) => {
  for (const [rx, w, h, col] of FRONTS) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, col);
    for (let x = 8; x < w; x += 12) box(c, x, -h, 1, h, dimmed(mix(col, '#000000', 0.25)));
    poly(c, [[-10, -h], [w / 2, -h - w * 0.45], [w + 10, -h]], dimmed('#292524'));
    poly(c, [[-4, -h - 2], [w / 2, -h - w * 0.45 + 6], [w + 4, -h - 2]], dimmed('#3F3F46'));
    hole(c, w / 2 - 18, -72, 36, 72, true);
    for (const wx of [18, w - 46]) { hole(c, wx, -h + 36, 28, 32, true); box(c, wx - 3, -h + 34, 34, 3, dimmed('#F5F5F4')); }
  });
};

/** A troll statue (standable: its flat head): a lumpy gray-green body, a big nose, tiny eyes, its arms up to the plank. */
const drawTroll = (c: Ctx, a: number, b: number, flip: boolean) => {
  const top = Y(TROLL_H), w = b - a, R = ramp6(hour('#6B7F5E'));
  // (the arms up holding the plank)
  const ax = flip ? a + 10 : b - 22;
  box(c, ax - 1, Y(PLANK.h) + 14, 14, top - Y(PLANK.h) - 10, INK); box(c, ax, Y(PLANK.h) + 14, 12, top - Y(PLANK.h) - 10, R[2]);
  box(c, ax - 3, Y(PLANK.h) + 12, 18, 10, R[3]);
  // (the face: the nose, the eyes, the tusks; hair like moss)
  box(c, a + w / 2 - 12, top + 26, 24, 34, R[4]); box(c, a + w / 2 - 12, top + 26, 24, 2, R[5]);
  for (const ex of [a + w / 2 - 20, a + w / 2 + 14]) box(c, ex, top + 20, 6, 4, INK);
  box(c, a + w / 2 - 18, top + 66, 4, 8, '#F5F5F4'); box(c, a + w / 2 + 14, top + 66, 4, 8, '#F5F5F4');
  for (let k = 0; k < 6; k++) box(c, a + 6 + k * 16, top - 4 - (k % 2) * 3, 10, 6, dimmed('#3F6212'));
};

/** The lutefisk booth's bits: its striped awning on poles, its sign hung off the awning. */
const drawBoothBits = (c: Ctx) => {
  const a = X(BOOTH.a), b = X(BOOTH.b);
  for (const px0 of [a + 6, b - 10]) box(c, px0, Y(BOOTH.h) - 70, 4, 70, dimmed('#78716C'));
  for (let k = 0; k < 8; k++) box(c, a - 8 + k * 22, Y(BOOTH.h) - 82, 22, 14, dimmed(k % 2 ? '#F8FAFC' : '#1D4ED8'));
  hungBoard(c, (a + b) / 2, Y(BOOTH.h) - 68, Y(BOOTH.h) - 40, ['FREE LUTEFISK', 'PLEASE. ANYBODY.'], LOOKS.norway(1), '#7F1D1D');
};

/** The longship: the hull (planks, a row of round shields along the side), the dragon at the prow, the tail at the stern,
 *  the mast and its striped sail. Its deck's lit lip (standable). */
const drawShip = (c: Ctx, v: View, sx: number, dy: number, f: number) => {
  if (!onScreen(v, sx - 60, sx + SHIP.w + 60)) return;
  const R = ramp6(hour('#7C4A1E')), w = SHIP.w, tilt = Math.sin(f * 0.05) * 3;
  // (the deck going back)
  poly(c, [at(v.eye, sx, dy, 1), at(v.eye, sx + w, dy, 1), at(v.eye, sx + w, dy, 0.94), at(v.eye, sx, dy, 0.94)], R[4]);
  // (the mast and the sail, red and white stripes, bellied)
  box(c, sx + w / 2 - 3, dy - 170, 6, 170, INK); box(c, sx + w / 2 - 2, dy - 170, 4, 170, R[3]);
  box(c, sx + w / 2 - 70, dy - 166, 140, 4, R[2]);
  for (let k = 0; k < 7; k++) { const x = sx + w / 2 - 66 + k * 19, bel = Math.sin((k / 6) * Math.PI) * 10; box(c, x, dy - 162 + bel * 0.2, 19, 100 + bel, hour(k % 2 ? '#F8FAFC' : '#B91C1C')); }
  // (the hull: curving up at both ends)
  poly(c, [[sx - 30, dy - 30 + tilt], [sx, dy], [sx + w, dy], [sx + w + 30, dy - 30 - tilt], [sx + w - 20, dy + 44], [sx + 20, dy + 44]], R[2]);
  for (let k = 0; k < 4; k++) box(c, sx + 10, dy + 6 + k * 9, w - 20, 1, R[1]);
  // (the shields along the side)
  for (let k = 0; k < 7; k++) { const cx = sx + 26 + k * 35; c.fillStyle = INK; c.beginPath(); c.arc(cx, dy + 12, 11, 0, Math.PI * 2); c.fill(); c.fillStyle = hour(k % 2 ? '#FCD34D' : '#DC2626'); c.beginPath(); c.arc(cx, dy + 12, 10, 0, Math.PI * 2); c.fill(); box(c, cx - 2, dy + 10, 4, 4, '#D6D3D1'); }
  // (the dragon's head at the prow (right), its tail curled at the stern)
  poly(c, [[sx + w + 26, dy - 26 - tilt], [sx + w + 40, dy - 70 - tilt], [sx + w + 66, dy - 74 - tilt], [sx + w + 60, dy - 60 - tilt], [sx + w + 44, dy - 58 - tilt], [sx + w + 34, dy - 24 - tilt]], R[3]);
  box(c, sx + w + 52, dy - 70 - tilt, 4, 4, '#FDE047');
  poly(c, [[sx - 26, dy - 26 + tilt], [sx - 40, dy - 60 + tilt], [sx - 26, dy - 74 + tilt], [sx - 30, dy - 58 + tilt], [sx - 20, dy - 24 + tilt]], R[3]);
  // (the deck's edge: somewhere to stand)
  box(c, sx, dy, w, 3, LIP[2]); box(c, sx, dy, w, 1, LIP[3]);
};

/** The stave church (its roofs are what he climbs): dark tarred wood, shingled roofs stacked up to a spire, a dragon
 *  head curling off every gable end, the doorway carved round. */
const drawChurch = (c: Ctx, v: View) => {
  if (!onScreen(v, X(2880), X(3520))) return;
  const W = ramp6(hour(TAR));
  // (the walls under each roof, set back a touch: the body of it)
  setBack(c, v, X(2950), 500, 0.96, () => {
    wall(c, 0, 500, 140, TAR); for (let x = 6; x < 500; x += 10) box(c, x, -140, 1, 140, dimmed('#1C1917'));
    hole(c, 220, -100, 60, 100, true);
    wall(c, 70, 360, 270, TAR); wall(c, 150, 200, 400, TAR); wall(c, 220, 60, 520, TAR);
  });
  for (const [a, b, h] of CHURCH) {
    const y = Y(h), A = X(a), B = X(b);
    // (the roof: shingles sloping down from its ridge (the bit he stands on) to its eaves)
    poly(c, [[A, y], [B, y], [B + 24, y + 46], [A - 24, y + 46]], W[2]);
    for (let k = 1; k < 4; k++) box(c, A - k * 6, y + k * 11, B - A + k * 12, 1, W[1]);
    for (let x = A; x < B; x += 14) box(c, x, y + 4, 1, 40, W[1]);
    // (dragon heads off the gable ends)
    for (const s of [-1, 1]) { const ex = s < 0 ? A - 24 : B + 24; poly(c, [[ex, y + 46], [ex + s * 14, y + 20], [ex + s * 30, y + 14], [ex + s * 24, y + 26], [ex + s * 12, y + 30]], W[3]); box(c, ex + s * 22 - 2, y + 16, 3, 3, '#FDE047'); }
    ledge3(c, v, A, y, B - A, '#57402A', 6);
  }
  // (the spire's cross... a little dragon instead)
  box(c, X(3198), Y(520) - 40, 4, 40, W[3]);
};

export const norway: ForeignSection = {
  id: 'norway', x0, x1,
  checkpoints: NORWAY_CHECKPOINTS,
  build: (state) => {
    layOwn(state, runsAround(x0, x1, [POOL]));
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
    poolZones(state, 'no-fjord', [POOL]);
    // The longship, across and back, riding the swell
    if (n.ship) { const sx = shipX(f); moveMover(state, n.ship, sx, deckY(f, sx)); }
    // The wave machine: a wave down the pool; in the water at its crest, shoved and hurt (each once a wave)
    const cr = crestAt(f), wn = Math.floor(f / WAVE_EVERY);
    if (wn !== n.waveN) { n.waveN = wn; n.hit.clear(); }
    if (f % WAVE_EVERY === 0 && Math.abs(p.pos.x - (POOL.a + POOL.b) / 2) < 900) playSound('splash', 0.5, -8);
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
  waterBodyAt: (_state, x, y) => poolAt([POOL], x, y),
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, POOL.a, '#D6CBB4', '#8C7F68');
    promenade(c, v, POOL.b, x1, '#D6CBB4', '#8C7F68');
    drawFronts(c, v);
    drawPoolBack(c, v, POOL);
    // (the wave machine's housing at the pool's far end, set back: the sign on it)
    setBack(c, v, POOL.a - 40, 120, 0.9, () => { wall(c, 0, 120, 90, '#475569'); for (let k = 0; k < 3; k++) box(c, 14 + k * 34, -70, 20, 30, dimmed('#1E293B')); });
    // (the trolls and their plank, the booth)
    boxes3(c, v, [
      ...TROLLS.map(([a, b]) => ({ x: X(a), top: Y(TROLL_H), w: b - a, bottom: GY, col: '#6B7F5E', standable: true })),
      { x: X(BOOTH.a), top: Y(BOOTH.h), w: BOOTH.b - BOOTH.a, bottom: GY, col: '#1E40AF', standable: true },
    ]);
    if (onScreen(v, X(1060), X(1500))) { TROLLS.forEach(([a, b], i) => drawTroll(c, X(a), X(b), i === 1)); ledge3(c, v, X(PLANK.a), Y(PLANK.h), PLANK.b - PLANK.a, '#8B5E34', 12); }
    if (onScreen(v, X(BOOTH.a), X(BOOTH.b))) drawBoothBits(c);
    // (the longship)
    if (state.stage) { const n = norOf(state); if (n.ship) drawShip(c, v, n.ship.x, n.ship.y, f); }
    drawChurch(c, v);
    // (the signs: on posts, hung, never anything over them)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(200), GY, ['NORWAY', 'CAPITAL OF SWEDEN'], LOOKS.norway(2), '#7F1D1D');
    if (onScreen(v, X(PLANK.a), X(PLANK.b))) postBoard(c, X(1010), GY, ['TROLL BRIDGE', 'TOLL: $5'], LOOKS.norway(1), '#3F6212', undefined, 80);
    if (onScreen(v, X(1880), X(2000))) postBoard(c, X(1930), GY, ['THE FJORD', '(WAVE POOL)', 'NO LIFEGUARD ON DUTY'], LOOKS.norway(1), '#1E3A8A', undefined, 130);
    if (onScreen(v, X(2820), X(2920))) postBoard(c, X(2860), GY, ['STAVE CHURCH', 'NO STAVES INSIDE'], LOOKS.norway(1), '#3F2A14', undefined, 110);
    if (onScreen(v, X(3560), X(3800))) postBoard(c, X(3660), GY, ['LEAVING NORWAY', 'NEXT: CHINA (NOT JAPAN)'], LOOKS.norway(1), '#7F1D1D', undefined, 100);
    for (const [fx, cols] of [[X(80), ['#BA0C2F', '#F8FAFC', '#00205B', '#F8FAFC', '#BA0C2F']], [X(3780), ['#BA0C2F', '#F8FAFC', '#00205B', '#F8FAFC', '#BA0C2F']]] as const) if (onScreen(v, fx - 20, fx + 60)) flagPole(c, fx, GY, 200, [...cols], f);
    void WHITE;
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawPoolFront(c, v, POOL, f, x => waveH(f, x));
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    if (onScreen(v, X(2900), X(3500))) out.push({ x: X(3200), y: Y(60), r: 160, a: 0.45, color: '#FDE68A' });
    if (onScreen(v, X(BOOTH.a), X(BOOTH.b))) out.push({ x: X(1680), y: Y(110), r: 120, a: 0.4, color: '#FDE68A' });
    return out;
  },
};
