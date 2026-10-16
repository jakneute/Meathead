// JAPAN: section 6 of Foreign Lands' streets (flows on from Italy, into Morocco: no walls, no doors). Two TORII gates
// first (their beams to stand on: a ninja up top), the KOI POND (stepping stones across, and the park's giant
// animatronic koi leaping out of it on a schedule: the bubbles are the tell; it hits whoever's in its arc, him or the
// cast), the VENDING-MACHINE ALLEY (machines to climb, one stacked on another), then THE FIVE-STORY PAGODA, climbed
// inside floor by floor (its doors at the bottom, a ninja a floor; out over the top roof and down its eaves on the far
// side: the eaves climb back up, too), the SUMO RING on its clay mound (a sumo stomping), the stone lanterns, the
// manga stand; then THE BULLET TRAIN (station.ts, job 4b: two Fujis climbed over, the track between them that the
// Shinkansen blasts along, the gantries and walkway out of its way), to the border with Morocco.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 50-59. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { runsAround, poolSteps, poolAt, poolZones, drawPoolBack, drawPoolFront, type Pool } from '../water';
import {
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, swag, lantern,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK, timeOfDay,
} from '../kit';
import { TALK } from './lines';
import './kinds';
import { STATION_CHECKPOINTS, buildStation, updateStation, drawStationBack, drawStationFront, stationLamps } from './station';

const { x0, x1 } = SECTIONS.japan;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The torii: [a, b] the posts' outer edges; the top beam (kasagi) at 170, the tie beam (nuki) at 110: both to stand on. */
const TORII: [number, number][] = [[260, 440], [520, 700]];
const KASAGI = 170, NUKI = 110;
const POND: Pool = { key: 'koi', a: X(780), b: X(1180), surface: 24, bed: 150, col: '#0F766E', wall: '#78716C' };
/** The stepping stones across the pond (one-way, just over the water). */
const STONES: [number, number][] = [[850, 905], [960, 1015], [1070, 1125]];
const STONE_TOP = -6;
/** The koi: a leap every KOI_EVERY frames, the bubbles first (KOI_WARN), then the arc (KOI_LEAP frames), alternating ways. */
const KOI_EVERY = 300, KOI_WARN = 50, KOI_LEAP = 70;
/** The vending machines (solid, standable): [a, b, h]; the third is two stacked. */
const VENDING: [number, number, number][] = [[1260, 1330, 130], [1340, 1410, 130], [1420, 1490, 260], [1560, 1630, 130]];
/** The pagoda: its walls (solid, [a, b, from h, to h]: doors under them), its floors inside, its top roof, its eaves. */
const PAGODA = { a: 1800, b: 2200 } as const;
const P_WALLS: [number, number, number, number][] = [[1800, 1820, 140, 700], [2180, 2200, 140, 700]];
const P_FLOORS: [number, number, number][] = [[1820, 1960, 120], [2040, 2180, 240], [1820, 1960, 360], [2040, 2180, 480], [1840, 2160, 600]];
const P_ROOF: [number, number, number] = [1740, 2260, 700];
const P_EAVES = [220, 340, 460, 580];
const EAVE_L: [number, number] = [1710, 1800], EAVE_R: [number, number] = [2200, 2290];
/** The sumo ring's clay mound, the stone lanterns, the manga stand. */
const DOHYO = { a: 2460, b: 2700, h: 40 } as const;
const LANTERNS: [number, number, number][] = [[2380, 2420, 70], [2760, 2800, 70]];
const MANGA = { a: 3000, b: 3140, h: 110 } as const;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_ninja', 350, KASAGI], ['m2:fl_cosplay', 640, 0],
  ['m2:fl_samurai', 1220, 0], ['m2:fl_ninja', 1455, 260], ['m2:fl_ninja', 1595, 130], ['m2:fl_samurai', 1700, 0],
  ['m2:fl_ninja', 2110, 240], ['m2:fl_cosplay', 1890, 360], ['m2:fl_ninja', 2000, 600],
  ['m2:fl_sumo', 2580, DOHYO.h], ['m2:fl_samurai', 2900, 0], ['m2:fl_cosplay', 3070, MANGA.h], ['m2:fl_ninja', 3300, 0], ['m2:fl_sumo', 3460, 0],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[2000, 600, 'small_health'], [2240, 700, 'small_ammo']];

export const JAPAN_CHECKPOINTS = [
  { name: 'JAPAN', cp: 50, x: X(150), y: GY },
  { name: 'JAPAN: THE KOI POND', cp: 51, x: X(740), y: GY },
  { name: 'JAPAN: THE PAGODA', cp: 52, x: X(1720), y: GY },
  { name: 'JAPAN: THE SUMO RING', cp: 53, x: X(2330), y: GY },
  ...STATION_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// The koi

/** Where the koi is at frame f: in (bubbles at its start), or out on its arc (its middle, which way). */
const koiAt = (f: number) => {
  const k = Math.floor(f / KOI_EVERY), t = f % KOI_EVERY, dir = k % 2 ? -1 : 1;
  const a = POND.a + 50, b = POND.b - 50, from = dir > 0 ? a : b, to = dir > 0 ? b : a, surf = GY + POND.surface;
  if (t < KOI_WARN) return { st: 'warn' as const, x: from, y: surf, dir, u: t / KOI_WARN };
  if (t < KOI_WARN + KOI_LEAP) { const u = (t - KOI_WARN) / KOI_LEAP; return { st: 'out' as const, x: from + (to - from) * u, y: surf - Math.sin(Math.PI * u) * 200, dir, u }; }
  return { st: 'in' as const, x: from, y: surf, dir, u: 0 };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const VERMILION = '#DC2626', DARKWOOD = '#3F2A1C', PLASTER = '#F5F0E6', TILE = '#334155';

/** The street's fronts: dark wood and white plaster, gray tiled roofs, noren curtains in the doors. */
const drawFronts = (c: Ctx, v: View) => {
  for (const [rx, w, h] of [[120, 220, 160], [1240, 420, 220], [2950, 260, 170], [3260, 260, 150]] as const) setBack(c, v, X(rx), w, FACADE_D, () => {
    wall(c, 0, w, h, PLASTER);
    const B = dimmed(DARKWOOD);
    box(c, 0, -h, w, 6, B); for (let x = 0; x <= w; x += 50) box(c, x - 2, -h, 4, h, B);
    poly(c, [[-18, -h], [w + 18, -h], [w + 6, -h - 34], [-6, -h - 34]], dimmed(TILE));
    for (let x = -14; x < w + 14; x += 8) box(c, x, -h - 30, 2, 28, dimmed('#475569'));
    hole(c, w / 2 - 22, -70, 44, 70, true);
    // (the noren: a split curtain in the door, a red or indigo)
    for (let k = 0; k < 3; k++) box(c, w / 2 - 21 + k * 15, -70, 13, 26, dimmed(rx % 2 ? '#1E3A8A' : '#B91C1C'));
    for (const wx of [16, w - 46]) { hole(c, wx, -h + 30, 30, 34, true); for (let k = 1; k < 3; k++) box(c, wx + k * 10, -h + 30, 1, 34, B); }
  });
};

/** A torii: two vermilion posts, the tie beam, the black-topped beam over them swept up at the ends. */
const drawTorii = (c: Ctx, v: View, a: number, b: number) => {
  if (!onScreen(v, X(a) - 40, X(b) + 40)) return;
  const R = ramp6(hour(VERMILION));
  for (const px0 of [X(a) + 18, X(b) - 34]) { box(c, px0 - 1, Y(KASAGI), 18, KASAGI, INK); box(c, px0, Y(KASAGI), 16, KASAGI, R[3]); box(c, px0, Y(KASAGI), 3, KASAGI, R[4]); box(c, px0 - 4, GY - 14, 24, 14, hour('#1C1917')); }
  ledge3(c, v, X(a) + 10, Y(NUKI), b - a - 20, VERMILION, 10);
  poly(c, [[X(a) - 24, Y(KASAGI) - 10], [X(b) + 24, Y(KASAGI) - 10], [X(b) + 14, Y(KASAGI) + 6], [X(a) - 14, Y(KASAGI) + 6]], hour('#1C1917'));
  ledge3(c, v, X(a), Y(KASAGI), b - a, VERMILION, 14);
};

/** The vending machines: tall boxes, a lit panel of cans, a coin slot, a big plastic bottle on top of one. */
const VCOL = ['#E5E7EB', '#DC2626', '#2563EB', '#16A34A', '#F97316'];
const drawVending = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(1240), X(1650))) return;
  boxes3(c, v, VENDING.map(([a, b, h], i) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: VCOL[i % VCOL.length], standable: true })));
  const lamps = timeOfDay().lamps;
  for (const [a, b, h] of VENDING) for (let s = 0; s < (h > 200 ? 2 : 1); s++) {
    const top = Y(h) + s * 130, x = X(a);
    box(c, x + 8, top + 12, b - a - 16, 52, lamps > 0.3 ? '#FEF9C3' : '#E0F2FE');
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) box(c, x + 12 + k * 13, top + 16 + r * 16, 8, 12, ['#DC2626', '#2563EB', '#F59E0B', '#10B981'][(r + k + s) % 4]);
    box(c, x + b - a - 22, top + 78, 10, 16, INK); box(c, x + 8, top + 104, b - a - 16, 14, INK);
    if ((f >> 5) % 7 === s + a % 3) box(c, x + 8, top + 12, b - a - 16, 2, '#FFFFFF');
  }
};

/** The pagoda: its inside (the back wall, set back), its walls, its floors, its roofs sweeping out over the eaves (the
 *  eaves' lips: somewhere to stand), the spire on top. */
const drawPagoda = (c: Ctx, v: View) => {
  if (!onScreen(v, X(PAGODA.a) - 120, X(PAGODA.b) + 120)) return;
  const [ax, ay] = at(v.eye, X(PAGODA.a), Y(700), 0.94), [bx, by] = at(v.eye, X(PAGODA.b), GY, 0.94);
  box(c, ax, ay, bx - ax, by - ay, dimmed('#7F1D1D'));
  for (let y = ay + 24; y < by; y += 120 * 0.94) box(c, ax, y, bx - ax, 3, dimmed('#3F2A1C'));
  for (let k = 0; k < 5; k++) box(c, ax + (bx - ax) * 0.45, ay + 50 + k * 112, 18, 30, '#1C1014');
  boxes3(c, v, P_WALLS.map(([a, b, lo, hi]) => ({ x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: VERMILION, standable: false })));
  for (const [a, b, h] of P_FLOORS) ledge3(c, v, X(a), Y(h), b - a, '#78350F', 10);
  // (the roofs: one over every story, swept up at the tips; the eaves either side are standable)
  const T = ramp6(hour(TILE));
  for (const h of P_EAVES) {
    poly(c, [[X(EAVE_L[0]) - 16, Y(h) - 10], [X(EAVE_L[1]) + 4, Y(h) + 18], [X(EAVE_R[0]) - 4, Y(h) + 18], [X(EAVE_R[1]) + 16, Y(h) - 10], [X(EAVE_R[1]), Y(h) + 6], [X(EAVE_L[0]), Y(h) + 6]], T[2]);
    ledge3(c, v, X(EAVE_L[0]), Y(h), EAVE_L[1] - EAVE_L[0], TILE, 8);
    ledge3(c, v, X(EAVE_R[0]), Y(h), EAVE_R[1] - EAVE_R[0], TILE, 8);
  }
  const [ra, rb, rh] = P_ROOF;
  poly(c, [[X(ra) - 20, Y(rh) - 14], [X(rb) + 20, Y(rh) - 14], [X(rb), Y(rh) + 20], [X(ra), Y(rh) + 20]], T[2]);
  ledge3(c, v, X(ra), Y(rh), rb - ra, TILE, 12);
  // (the spire: rings on a pole, set back off the roof's middle: not somewhere to stand)
  const mx = X((PAGODA.a + PAGODA.b) / 2);
  box(c, mx - 3, Y(rh) - 150, 6, 150, dimmed('#CA8A04'));
  for (let k = 0; k < 7; k++) box(c, mx - 10, Y(rh) - 40 - k * 14, 20, 4, dimmed('#CA8A04'));
};

/** The sumo ring: the clay mound, its straw ring, the hanging roof over it (set back, dim) with its tassels. */
const drawDohyo = (c: Ctx, v: View) => {
  if (!onScreen(v, X(DOHYO.a) - 80, X(DOHYO.b) + 80)) return;
  setBack(c, v, X(DOHYO.a) - 30, DOHYO.b - DOHYO.a + 60, 0.92, () => {
    const w = DOHYO.b - DOHYO.a + 60;
    poly(c, [[-20, -300], [w + 20, -300], [w - 10, -340], [10, -340]], dimmed('#1C1917'));
    box(c, -10, -300, w + 20, 10, dimmed('#7C2D12'));
    for (const [tx, col] of [[0, '#16A34A'], [w, '#DC2626']] as const) { box(c, tx - 6, -290, 12, 50, dimmed(col)); }
  });
  boxes3(c, v, [{ x: X(DOHYO.a), top: Y(DOHYO.h), w: DOHYO.b - DOHYO.a, bottom: GY, col: '#C2884E', standable: true }]);
  box(c, X(DOHYO.a) + 30, Y(DOHYO.h) + 6, DOHYO.b - DOHYO.a - 60, 4, hour('#E7D7A8'));
  boxes3(c, v, LANTERNS.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#A8A29E', standable: true })));
  for (const [a, b, h] of LANTERNS) { box(c, X(a) + 10, Y(h) + 14, b - a - 20, 16, timeOfDay().lamps > 0.3 ? '#FDE68A' : '#57534E'); }
};

/** The koi: under the water, the bubbles; out, a big orange-and-white robot fish curving through the air, its seams. */
const drawKoi = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, POND.a, POND.b)) return;
  const k = koiAt(f);
  if (k.st === 'warn') { for (let i = 0; i < 6; i++) { const r = 3 + ((f + i * 7) % 12) / 3; c.strokeStyle = '#E0F2FE'; c.lineWidth = 1; c.beginPath(); c.arc(k.x + Math.sin(i * 2.1 + f * 0.2) * 16, k.y - ((f * 2 + i * 9) % 18), r, 0, Math.PI * 2); c.stroke(); } return; }
  if (k.st !== 'out') return;
  const ang = Math.atan2(-Math.cos(Math.PI * k.u) * 200 * Math.PI, (POND.b - POND.a - 100) * k.dir) ;
  c.save(); c.translate(k.x, k.y); c.rotate(ang); if (k.dir < 0) c.scale(1, -1);
  poly(c, [[-44, 0], [-30, -16], [10, -20], [36, -10], [42, 0], [36, 10], [10, 18], [-30, 14]], INK);
  poly(c, [[-42, 0], [-29, -14], [10, -18], [34, -9], [40, 0], [34, 9], [10, 16], [-29, 12]], '#F8FAFC');
  for (const [px0, py0, w] of [[-20, -10, 18], [4, -6, 22], [-8, 4, 14]] as const) box(c, px0, py0, w, 8, '#F97316');
  poly(c, [[-42, 0], [-62, -16], [-56, 0], [-62, 16]], '#F97316');
  box(c, 26, -6, 5, 5, INK); box(c, 27, -5, 2, 2, '#FFFFFF');
  box(c, 38, 4, 6, 2, INK); limb2(c, 36, 2, 50, 10); limb2(c, 36, 6, 48, 16);
  box(c, -6, -18, 1, 34, '#9CA3AF');
  c.restore();
  // (the splashes as it leaves and comes back in)
  if (k.u < 0.08 || k.u > 0.92) for (let i = 0; i < 3; i++) box(c, k.x - 20 + i * 18, GY + POND.surface - 8 - (i % 2) * 6, 4, 6, '#E0F2FE');
  void v;
};
const limb2 = (c: Ctx, ax: number, ay: number, bx: number, by: number) => { c.strokeStyle = '#FCD34D'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); };

/** Japan's flag on a pole: white, the red disc. */
const drawFlag = (c: Ctx, x: number, f: number) => {
  box(c, x - 2, GY - 200, 4, 200, hour('#9CA3AF')); box(c, x - 3, GY - 204, 6, 4, '#CA8A04');
  for (let i = 0; i < 48; i += 4) { const wave = Math.sin(f * 0.08 + i * 0.12) * 2; box(c, x + 2 + i, GY - 198 + wave, 4, 30, hour('#F8FAFC')); }
  c.fillStyle = hour('#BC002D'); c.beginPath(); c.arc(x + 26, GY - 183 + Math.sin(f * 0.08 + 3) * 2, 8, 0, Math.PI * 2); c.fill();
};

export const japan: ForeignSection = {
  id: 'japan', x0, x1,
  checkpoints: JAPAN_CHECKPOINTS,
  build: (state) => {
    layOwn(state, runsAround(x0, x1, [POND]));
    buildStation(state);
    poolSteps(state, POND);
    for (const [a, b] of TORII) { ledge(state, X(a), Y(KASAGI), b - a, { hidden: true, tag: 'jp-torii' }); ledge(state, X(a) + 10, Y(NUKI), b - a - 20, { hidden: true, tag: 'jp-torii' }); }
    for (const [a, b] of STONES) ledge(state, X(a), Y(STONE_TOP), b - a, { hidden: true, tag: 'jp-stone' });
    for (const [a, b, h] of VENDING) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'jp-vending' });
    for (const [a, b, lo, hi] of P_WALLS) solid(state, X(a), Y(hi), b - a, hi - lo, { hidden: true, tag: 'jp-pagoda-wall' });
    for (const [a, b, h] of P_FLOORS) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'jp-pagoda-floor' });
    ledge(state, X(P_ROOF[0]), Y(P_ROOF[2]), P_ROOF[1] - P_ROOF[0], { hidden: true, tag: 'jp-pagoda-roof' });
    for (const h of P_EAVES) for (const [a, b] of [EAVE_L, EAVE_R]) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'jp-eave' });
    solid(state, X(DOHYO.a), Y(DOHYO.h), DOHYO.b - DOHYO.a, DOHYO.h, { hidden: true, tag: 'jp-dohyo' });
    for (const [a, b, h] of LANTERNS) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'jp-lantern' });
    solid(state, X(MANGA.a), Y(MANGA.h), MANGA.b - MANGA.a, MANGA.h, { hidden: true, tag: 'jp-manga' });
    spawnCast(state, ENEMIES, X, Y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `jp-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, f = state.frame;
    pavilionTalk(state, 'jp', x0, GY, TALK);
    updateStation(ctx);
    poolZones(state, 'jp-pond', [POND]);
    // The koi: the bubbles, then out and over in an arc; it hits whoever's in the way (him, the cast)
    const k = koiAt(f), near = Math.abs(p.pos.x - (POND.a + POND.b) / 2) < 800;
    if (f % KOI_EVERY === 0 && near) playSound('glug', 0.6, -6);
    if (f % KOI_EVERY === KOI_WARN && near) playSound('splash', 0.8, -4);
    if (f % KOI_EVERY === KOI_WARN + KOI_LEAP && near) playSound('splash', 0.7, 2);
    if (k.st === 'out') {
      const bx = k.x - 40, by = k.y - 20, bw = 80, bh = 40;
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && p.pos.x < bx + bw && p.pos.x + p.width > bx && p.pos.y < by + bh && p.pos.y + p.height > by)
        hurtPlayer(ctx, 11, 'm2:fl_koi', { x: k.dir * 9, y: -7 }, 22);
      for (const e of hazardVictims(state)) if (boxHits(e, bx, by, bw, bh)) hazardHit(ctx, e, 40, k.x - k.dir * 30, "KOI'D!", { color: '#F97316' });
    }
    return controls;
  },
  waterBodyAt: (_state, x, y) => poolAt([POND], x, y),
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, POND.a, '#D6CBB4', '#8C7F68');
    promenade(c, v, POND.b, x1, '#D6CBB4', '#8C7F68');
    drawFronts(c, v);
    drawPoolBack(c, v, POND);
    for (const [a, b] of TORII) drawTorii(c, v, a, b);
    // (the stepping stones: gray, rounded, their lit tops)
    for (const [a, b] of STONES) if (onScreen(v, X(a), X(b))) { c.fillStyle = hour('#57534E'); c.beginPath(); c.ellipse(X((a + b) / 2), Y(STONE_TOP) + 10, (b - a) / 2, 14, 0, 0, Math.PI * 2); c.fill(); ledge3(c, v, X(a) + 4, Y(STONE_TOP), b - a - 8, '#78716C', 6); }
    drawVending(c, v, f);
    drawPagoda(c, v);
    drawDohyo(c, v);
    boxes3(c, v, [{ x: X(MANGA.a), top: Y(MANGA.h), w: MANGA.b - MANGA.a, bottom: GY, col: '#7C3AED', standable: true }]);
    if (onScreen(v, X(MANGA.a), X(MANGA.b))) for (let k = 0; k < 6; k++) box(c, X(MANGA.a) + 10 + k * 21, Y(MANGA.h) + 20, 16, 24, ['#F472B6', '#FDE047', '#60A5FA', '#F87171', '#4ADE80', '#F8FAFC'][k]);
    // (cherry trees: dark trunks, pink clouds, set back; petals drifting)
    for (const rx of [1150, 2340, 2870, 3560]) setBack(c, v, X(rx), 140, 0.9, () => {
      box(c, 64, -150, 12, 150, dimmed('#3F2A1C'));
      for (const [bx, by, r] of [[70, -170, 46], [30, -150, 32], [110, -150, 34], [70, -210, 30]] as const) { c.fillStyle = dimmed('#F9A8D4'); c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill(); }
    });
    for (let k = 0; k < 8; k++) { const px0 = ((k * 233 + f * 0.6) % 3600), py0 = ((k * 97 + f * 0.8) % 260); if (onScreen(v, X(px0), X(px0))) box(c, X(px0), Y(260) + py0, 3, 2, '#FBCFE8'); }
    // (lanterns strung over the alley)
    if (onScreen(v, X(1240), X(1660))) swag(c, X(1240), Y(300), X(1660), Y(300), 24, ['#DC2626', '#F8FAFC'], 'lanterns', 40);
    if (onScreen(v, X(3150), X(3250))) for (const lx of [3160, 3220]) { box(c, X(lx) - 1, GY - 90, 3, 90, INK); lantern(c, X(lx), GY - 94, 8, '#F8FAFC'); }
    // (signs)
    { const [a, b] = TORII[0]; if (onScreen(v, X(a), X(b))) hungBoard(c, X((a + b) / 2), Y(KASAGI) + 10, Y(KASAGI) + 40, ['JAPAN', 'A TASTE OF ASIA (CHINA)'], LOOKS.japan(1), '#F8FAFC'); }
    if (onScreen(v, X(720), X(780))) postBoard(c, X(740), GY, ['KOI POND', 'DO NOT FEED', 'THE ROBOT'], LOOKS.japan(1), '#F8FAFC', undefined, 120);
    if (onScreen(v, X(1660), X(1780))) postBoard(c, X(1710), GY, ['VENDING ALLEY', 'YEN ONLY'], LOOKS.japan(1), '#FEF3C7', undefined, 100);
    if (onScreen(v, X(PAGODA.a) - 120, X(PAGODA.a))) postBoard(c, X(1640), GY, ['FIVE-STORY PAGODA', 'NO ELEVATOR. NINJAS.'], LOOKS.japan(1), '#F8FAFC', undefined, 150);
    if (onScreen(v, X(2300), X(2440))) postBoard(c, X(2350), GY, ['SUMO RING', 'NO SHOES', 'NO SHIRT', 'NO PROBLEM'], LOOKS.japan(1), '#FEF3C7', undefined, 140);
    if (onScreen(v, X(MANGA.a), X(MANGA.b))) hungBoard(c, X(3070), Y(MANGA.h) - 4, Y(MANGA.h) - 40, ['MANGA', '(JAPANESE COMICS)', '(READ BACKWARDS)'], LOOKS.japan(1), '#FEF3C7');
    drawStationBack(c, v, state);
    if (onScreen(v, X(20), X(120))) drawFlag(c, X(40), f);
    void mix; void wall; void hole;
  },
  drawFront: (c, state) => {
    const v = viewIn(state), f = state.frame;
    drawPoolFront(c, v, POND, f);
    drawKoi(c, v, f);
    drawStationFront(c, v, state);
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (const [a, b, h] of LANTERNS) if (onScreen(v, X(a), X(b))) out.push({ x: X((a + b) / 2), y: Y(h) + 20, r: 110, a: 0.45, color: '#FDE68A' });
    if (onScreen(v, X(1240), X(1660))) out.push({ x: X(1450), y: Y(120), r: 220, a: 0.45, color: '#E0F2FE' });
    for (const lx of [3160, 3220]) if (onScreen(v, X(lx), X(lx))) out.push({ x: X(lx), y: GY - 94, r: 90, a: 0.4, color: '#FEF3C7' });
    out.push(...stationLamps(v, state.frame));
    return out;
  },
};
