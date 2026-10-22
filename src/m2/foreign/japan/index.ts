// JAPAN: section 6 of Foreign Lands' streets (flows on from Italy, into Morocco: no walls, no doors). Two TORII gates
// first (their beams to stand on: a ninja up top), the KOI POND (stepping stones across, and the park's giant
// animatronic koi leaping out of it on a schedule: the bubbles are the tell; it hits whoever's in its arc, him or the
// cast), the VENDING-MACHINE ALLEY (machines to climb, one stacked on another), then THE FIVE-STORY PAGODA, climbed
// inside floor by floor (its doors at the bottom, a ninja a floor; out over the top roof and down its eaves on the far
// side: the eaves climb back up, too), the SUMO RING on its clay mound (a sumo stomping), the stone lanterns, the
// manga stand; then THE BULLET TRAIN (station.ts, job 4b: two Fujis climbed over, the track between them that the
// Shinkansen blasts along, the gantries and walkway out of its way), to the border with Morocco.
//
// The SNES pass: art.ts paints it all (still art stamped for the hour; the koi, the petals, the train live); the pond's
// back goes down before the fronts. Checkpoints 50-59. Outdoors: the time of day's light.

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
import { type Ctx, type View, viewIn, promenade, postBoard, hungBoard, swag, LOOKS, onScreen, FACADE_D } from '../kit';
import { TALK } from './lines';
import './kinds';
import { STATION_CHECKPOINTS, buildStation, updateStation, drawStationBack, drawStationFront, stationLamps } from './station';
import {
  type JpFront, drawFront, drawTorii, steppingStone, drawKoiFish, bubbles, koiSplash, drawVendingArt, drawPagodaArt, drawDohyoArt, drawStoneLantern,
  drawMangaStand, drawCherry, petal, lanternPost, drawJpFlag,
} from './art';

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
  // the torii (JAPAN's checkpoint's spot left clear): a ninja up on the second gate's beam, the cosplay kid under it
  // (stars from above, the energy ball low)
  ['m2:fl_ninja', 610, KASAGI], ['m2:fl_cosplay', 560, 0],
  // the vending alley: a samurai on the ground, then one up on the stacked machines (the katana in his face as he climbs:
  // shoot up, or hop past it), a ninja on the last machine
  ['m2:fl_samurai', 1220, 0], ['m2:fl_samurai', 1455, 260], ['m2:fl_ninja', 1595, 130],
  // the pagoda: one a floor, the door by its checkpoint left clear
  ['m2:fl_ninja', 2110, 240], ['m2:fl_cosplay', 1890, 360], ['m2:fl_ninja', 2100, 480], ['m2:fl_ninja', 2000, 600],
  // the sumo at the ring's far side (out of THE SUMO RING checkpoint's reach)
  ['m2:fl_sumo', 2670, DOHYO.h], ['m2:fl_samurai', 2900, 0], ['m2:fl_cosplay', 3070, MANGA.h], ['m2:fl_ninja', 3300, 0], ['m2:fl_sumo', 3460, 0],
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
// Drawing (the SNES pass: art.ts paints it; still art stamped for the hour, the koi, the petals, the train live)

/** The street's fronts (set back, braced): machiya in dark wood and white plaster under gray tile. */
const FRONTS: JpFront[] = [
  { rx: 120, w: 220, h: 160, name: 'RAMEN (INSTANT)', noren: '#B91C1C' },
  { rx: 1240, w: 420, h: 220, name: 'KARAOKE (ENGLISH ONLY)', noren: '#1E3A8A' },
  { rx: 2950, w: 260, h: 170, name: 'SUSHI (COOKED)', noren: '#1E3A8A' },
  { rx: 3260, w: 260, h: 150, name: 'ANIME GIFTS', noren: '#B91C1C' },
];
const drawFronts = (c: Ctx, v: View) => {
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawFront(c, v, X(fr.rx), fr);
};

/** The koi: under the water, the bubbles; out, the robot fish curving through the air; the splashes as it leaves and
 *  comes back in. */
const drawKoi = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, POND.a, POND.b)) return;
  const k = koiAt(f);
  if (k.st === 'warn') { bubbles(c, k.x, k.y, f); return; }
  if (k.st !== 'out') return;
  const ang = Math.atan2(-Math.cos(Math.PI * k.u) * 200 * Math.PI, (POND.b - POND.a - 100) * k.dir);
  c.save(); c.translate(k.x, k.y); c.rotate(ang); if (k.dir < 0) c.scale(1, -1);
  drawKoiFish(c, f);
  c.restore();
  const from = k.dir > 0 ? POND.a + 50 : POND.b - 50, to = k.dir > 0 ? POND.b - 50 : POND.a + 50;
  if (k.u < 0.1) koiSplash(c, from, GY + POND.surface, k.u * 10);
  if (k.u > 0.9) koiSplash(c, to, GY + POND.surface, (k.u - 0.9) * 10);
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
    // (the pond's back first (its far paving and railing are farther back than any front), then the fronts)
    drawPoolBack(c, v, POND);
    drawFronts(c, v);
    // (cherry trees, set back; petals drifting)
    for (const rx of [1150, 2340, 2870, 3560]) drawCherry(c, v, X(rx), rx);
    TORII.forEach(([a, b], i) => drawTorii(c, v, X(a), X(b), Y(KASAGI), Y(NUKI), i === 1));
    for (const [a, b] of STONES) steppingStone(c, v, X(a), X(b), Y(STONE_TOP));
    if (onScreen(v, X(1240), X(1650))) drawVendingArt(c, v, VENDING.map(([a, b, h]) => [X(a), X(b), Y(h)] as [number, number, number]), f);
    drawPagodaArt(c, v, X, Y, { a: PAGODA.a, b: PAGODA.b, walls: P_WALLS, floors: P_FLOORS, roof: P_ROOF, eaves: P_EAVES, eaveL: EAVE_L, eaveR: EAVE_R });
    drawDohyoArt(c, v, X(DOHYO.a), X(DOHYO.b), Y(DOHYO.h));
    for (const [a, b, h] of LANTERNS) drawStoneLantern(c, v, X(a), X(b), Y(h));
    drawMangaStand(c, v, X(MANGA.a), X(MANGA.b), Y(MANGA.h));
    for (let k = 0; k < 8; k++) { const px0 = ((k * 233 + f * 0.6) % 3600), py0 = ((k * 97 + f * 0.8) % 260); if (onScreen(v, X(px0), X(px0))) petal(c, X(px0), Y(260) + py0, f + k * 5); }
    // (lanterns strung over the alley; the lantern posts)
    if (onScreen(v, X(1240), X(1660))) swag(c, X(1240), Y(300), X(1660), Y(300), 24, ['#DC2626', '#F8FAFC'], 'lanterns', 40);
    if (onScreen(v, X(3150), X(3250))) for (const lx of [3160, 3220]) lanternPost(c, X(lx), GY);
    // (signs)
    { const [a, b] = TORII[0]; if (onScreen(v, X(a), X(b))) hungBoard(c, X((a + b) / 2), Y(KASAGI) + 22, Y(KASAGI) + 40, ['JAPAN', 'A TASTE OF ASIA (CHINA)'], LOOKS.japan(1), '#F8FAFC'); }
    if (onScreen(v, X(720), X(780))) postBoard(c, X(740), GY, ['KOI POND', 'DO NOT FEED', 'THE ROBOT'], LOOKS.japan(1), '#F8FAFC', undefined, 120);
    if (onScreen(v, X(1660), X(1780))) postBoard(c, X(1710), GY, ['VENDING ALLEY', 'YEN ONLY'], LOOKS.japan(1), '#FEF3C7', undefined, 100);
    if (onScreen(v, X(PAGODA.a) - 120, X(PAGODA.a))) postBoard(c, X(1640), GY, ['FIVE-STORY PAGODA', 'NO ELEVATOR. NINJAS.'], LOOKS.japan(1), '#F8FAFC', undefined, 150);
    if (onScreen(v, X(2300), X(2440))) postBoard(c, X(2350), GY, ['SUMO RING', 'NO SHOES', 'NO SHIRT', 'NO PROBLEM'], LOOKS.japan(1), '#FEF3C7', undefined, 140);
    if (onScreen(v, X(MANGA.a), X(MANGA.b))) postBoard(c, X(3070), Y(MANGA.h), ['MANGA', '(JAPANESE COMICS)', '(READ BACKWARDS)'], LOOKS.japan(1), '#FEF3C7', undefined, 56);
    drawStationBack(c, v, state);
    if (onScreen(v, X(20), X(120))) drawJpFlag(c, X(40), f);
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
