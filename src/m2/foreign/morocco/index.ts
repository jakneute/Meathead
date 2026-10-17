// MOROCCO: section 7 of Foreign Lands' streets (flows on from Japan, into France: no walls, no doors). The bazaar's
// tiled gate first, then THE ROOFTOPS: flat-roofed houses stepping up, the alleys between them hung with CARPETS on
// lines (just ledges: they don't fly, whatever the salesmen say), salesmen and a snake charmer down in the alleys, a
// hookah bro up top. Then the MINARET-ISH TOWER (the gift shop's: its elevator OUT OF ORDER), climbed inside floor by
// floor to its balcony, and down its far side by the carpets hung off it on poles (they climb back up, too). Then THE
// TANNERY: a row of dye vats (hot, filthy: in one, he's hurt and out again; the cast too), their rims to hop along,
// the drying racks over them the high way; the hookah lounge's tent, the spice stall; then THE SOUK (souk.ts, job 4b:
// its awnings stepping up and down over the alley, the ride camels stampeding along it), to the border with France.
//
// The SNES pass: art.ts paints it all (still art stamped for the hour; the dye, the steam, the camels live); the vats'
// paving goes down before the fronts. Checkpoints 60-69. Outdoors: the time of day's light.

import type { Light } from '../../../m1/game/render/lighting';
import type { ForeignSection } from '../section';
import { layOwn, solid, ledge } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { pavilionTalk } from '../pavilion';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { hazardVictims, hazardHit, setHazardZones } from '../../hazardHit';
import { runsAround, type Pool } from '../water';
import { type Ctx, type View, viewIn, promenade, postBoard, hungBoard, LOOKS, onScreen, FACADE_D } from '../kit';
import { TALK, DYED_LINES, MIXED_LINES, UNDYED_LINES } from './lines';
import { meatheadSays } from '../section';
import { pickLine } from '../../../m1/game/platform/speech';
import './kinds';
import { SOUK_CHECKPOINTS, buildSouk, updateSouk, drawSoukBack, drawSoukFront, soukLamps } from './souk';
import {
  type MaFront, SAND, CLAY, ROSE, OCHRE, drawFront, drawGate, drawHouseBox, drawCrate, drawCarpet, drawTowerArt, vatPaving, drawVat, drawVatFront, drawRackArt,
  drawTentArt, drawPoufs, drawSpiceStall, lanternString, drawMaFlag,
} from './art';

const { x0, x1 } = SECTIONS.morocco;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from the section's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The houses (solid, flat roofs to stand on) and the carpets hung between them (one-way). */
const ROOFS: [number, number, number][] = [[520, 700, 140], [860, 1020, 220], [1180, 1340, 300], [1500, 1650, 200]];
const CARPETS: [number, number, number][] = [[700, 860, 170], [1020, 1180, 250], [1340, 1500, 240]];
/** Crates: a step up onto the first roof, and one in each alley (a way back up out of it). */
const CRATES: [number, number, number][] = [[450, 510, 70], [740, 790, 70], [1060, 1110, 110], [1360, 1410, 110]];
/** The tower: its walls (doors under them), its floors inside, its balcony, the carpets hung off its far side. */
const TOWER = { a: 1740, b: 2000, top: 720 } as const;
const T_WALLS: [number, number, number, number][] = [[1740, 1760, 140, 720], [1980, 2000, 140, 720]];
const T_FLOORS: [number, number, number][] = [[1760, 1880, 120], [1860, 1980, 240], [1760, 1880, 360], [1860, 1980, 480], [1760, 1880, 600]];
const BALCONY: [number, number, number] = [1720, 2020, 720];
const T_CARPETS: [number, number, number][] = [[2000, 2110, 580], [2060, 2170, 440], [2000, 2110, 300], [2060, 2170, 160]];
/** The tannery's dye vats (dug out: their rims between are the ground), how deep, their dyes; the drying racks over them. */
const VAT_DEEP = 60;
const DYES = ['#1E40AF', '#EAB308', '#DC2626', '#16A34A', '#7C2D12'];
/** How long a dye stays on him (15 s, its last 3 fading). */
const DYE_FRAMES = 900;
/** Two dyes mixed like paint: each channel the geometric mean (blue and yellow, olive green; red and yellow, orange). */
const mixDye = (a: string, b: string) => {
  const rgb = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(Math.sqrt(v * B[i])).toString(16).padStart(2, '0')).join('');
};
const VATS: Pool[] = [[2300, 2420], [2450, 2570], [2600, 2720], [2750, 2870], [2900, 3020]].map(([a, b], i) => ({ key: `vat${i}`, a: X(a), b: X(b), surface: 18, bed: VAT_DEEP, col: DYES[i], wall: '#A8A29E' }));
const RACKS: [number, number, number][] = [[2400, 2620, 150], [2700, 2920, 150]];
/** The hookah lounge: cushions, the tent's top; the spice stall. */
const CUSHIONS = { a: 3200, b: 3300, h: 40 } as const;
const TENT = { a: 3180, b: 3420, h: 190 } as const;
const SPICE = { a: 3460, b: 3570, h: 100 } as const;

const ENEMIES: [string, number, number][] = [
  // (none down in the narrow alleys between the roofs, where he goes over them: up on the roofs, or out in the open)
  ['m2:fl_camel', 260, 0], ['m2:fl_carpet', 400, 0], ['m2:fl_snakecharmer', 610, 140], ['m2:fl_carpet', 940, 220],
  ['m2:fl_hookah', 1260, 300], ['m2:fl_snakecharmer', 1575, 200], ['m2:fl_camel', 1700, 0],
  ['m2:fl_carpet', 1920, 240], ['m2:fl_hookah', 1820, 600],
  ['m2:fl_carpet', 2220, 0], ['m2:fl_camel', 3080, 0],
  ['m2:fl_snakecharmer', 3140, 0], ['m2:fl_hookah', 3330, 0], ['m2:fl_carpet', 3510, SPICE.h],
];
const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [[1870, 720, 'small_ammo'], [2510, 150, 'small_health']];

export const MOROCCO_CHECKPOINTS = [
  { name: 'MOROCCO', cp: 60, x: X(150), y: GY },
  { name: 'MOROCCO: THE ROOFTOPS', cp: 61, x: X(470), y: GY },
  { name: 'MOROCCO: THE TOWER', cp: 62, x: X(1690), y: GY },
  { name: 'MOROCCO: THE TANNERY', cp: 63, x: X(2240), y: GY },
  ...SOUK_CHECKPOINTS,
];

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the SNES pass: art.ts paints it; still art stamped for the hour, the dye, the steam, the lanterns live)

const TILEBLUE = '#1D4ED8', TILEGREEN = '#15803D';
/** The medina's fronts (set back, braced): plaster over zellige, horseshoe-arched shops, mashrabiyas. */
const FRONTS: MaFront[] = [
  { rx: 300, w: 200, h: 200, col: OCHRE, name: 'RUGS (MACHINE MADE)', goods: 'rugs' },
  { rx: 720, w: 300, h: 260, col: ROSE, name: 'LAMPS (NO GENIES)', goods: 'lamps' },
  { rx: 1360, w: 260, h: 280, col: SAND, name: 'TAGINES (CROCK-POTS)', goods: 'pots' },
  { rx: 2240, w: 340, h: 180, col: CLAY, name: 'SLIPPERS (ONE SIZE)', goods: 'slippers' },
  { rx: 3060, w: 300, h: 220, col: ROSE, name: 'FEZZES (FROM FEZ, OHIO)', goods: 'fez' },
];
const drawFronts = (c: Ctx, v: View) => {
  const on = FRONTS.filter(fr => onScreen(v, X(fr.rx) - 60, X(fr.rx + fr.w) + 60, FACADE_D));
  on.sort((p, q) => Math.abs(X(q.rx + q.w / 2) - v.eye.x) - Math.abs(X(p.rx + p.w / 2) - v.eye.x));
  for (const fr of on) drawFront(c, v, X(fr.rx), fr);
};

export const morocco: ForeignSection = {
  id: 'morocco', x0, x1,
  checkpoints: MOROCCO_CHECKPOINTS,
  build: (state) => {
    layOwn(state, runsAround(x0, x1, VATS));
    buildSouk(state);
    for (const [a, b, h] of ROOFS) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'ma-roof' });
    for (const [a, b, h] of CRATES) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'ma-crate' });
    for (const [a, b, h] of [...CARPETS, ...T_FLOORS, BALCONY, ...T_CARPETS, ...RACKS]) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'ma-ledge' });
    for (const [a, b, lo, hi] of T_WALLS) solid(state, X(a), Y(hi), b - a, hi - lo, { hidden: true, tag: 'ma-tower-wall' });
    ledge(state, X(TENT.a), Y(TENT.h), TENT.b - TENT.a, { hidden: true, tag: 'ma-tent' });
    solid(state, X(CUSHIONS.a), Y(CUSHIONS.h), CUSHIONS.b - CUSHIONS.a, CUSHIONS.h, { hidden: true, tag: 'ma-cushions' });
    solid(state, X(SPICE.a), Y(SPICE.h), SPICE.b - SPICE.a, SPICE.h, { hidden: true, tag: 'ma-spice' });
    spawnCast(state, ENEMIES, X, Y);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `ma-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    pavilionTalk(state, 'ma', x0, GY, TALK);
    updateSouk(ctx);
    // The dye vats: walkers keep out; in one, he's scalded and pops back out (the cast too, knocked in)
    setHazardZones(state, 'ma-vats', VATS.map(v => ({ x0: v.a, x1: v.b, y0: GY - 4, y1: GY + VAT_DEEP, ground: true })));
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const vat = VATS.find(v => cx > v.a + 4 && cx < v.b - 4 && feet > GY + v.surface + 4);
    if (vat && p.health > 0 && !p.inCutscene) {
      if (p.invincibilityTimer <= 0) {
        hurtPlayer(ctx, 9, 'm2:fl_dye', { x: 0, y: -12 }, 30); playSound('splash', 0.7, -4);
        // (and he comes out that color, a good while, fading back to himself. Like paint: a second color mixes in (red
        // and blue, purple); one of those two again, and it's just that one; a third color on top of two, and somehow
        // it's all gone, he's himself again)
        const parts = p.dyeTimer && p.dyeTimer > 0 ? (p.dyeParts ?? []) : [];
        const set = (next: string[]) => { p.dyeParts = next; p.dyeColor = next.length === 2 ? mixDye(next[0], next[1]) : next[0]; p.dyeTimer = next.length ? DYE_FRAMES : 0; };
        if (parts.length === 2 && !parts.includes(vat.col)) { set([]); meatheadSays(state, pickLine(UNDYED_LINES), false); }
        else if (parts.length === 2) set([vat.col]);
        else if (parts.length === 1 && parts[0] !== vat.col) { set([parts[0], vat.col]); meatheadSays(state, pickLine(MIXED_LINES), false); }
        else { if (!parts.length) meatheadSays(state, pickLine(DYED_LINES), false); set([vat.col]); }
      }
      else if (p.vel.y >= 0) p.vel.y = -11;
    }
    for (const e of hazardVictims(state)) {
      const ex = e.pos.x + e.width / 2, v = VATS.find(o => ex > o.a + 4 && ex < o.b - 4 && e.pos.y + e.height > GY + o.surface + 4);
      if (v) { hazardHit(ctx, e, 30, ex, 'DYED!', { color: v.col }); if (e.health > 0) e.vel.y = -10; }
    }
    return controls;
  },
  drawBack: (c, state) => {
    const v = viewIn(state), f = state.frame;
    promenade(c, v, x0, VATS[0].a, '#E7D3B0', '#9C7F5A');
    VATS.forEach((p, i) => { const nx = VATS[i + 1]?.a ?? x1; promenade(c, v, p.b, nx, '#E7D3B0', '#9C7F5A'); });
    // (the vats' paving behind them first (it's farther back than any front), then the fronts, then the gate over the
    // way in)
    for (const p of VATS) vatPaving(c, v, p.a, p.b);
    drawFronts(c, v);
    drawGate(c, v, X(220));
    // (the rooftops: the houses, the crates, the carpets between)
    ROOFS.forEach(([a, b, h], i) => drawHouseBox(c, v, X(a), X(b), Y(h), i % 2 ? CLAY : SAND, i));
    for (const [a, b, h] of CRATES) drawCrate(c, v, X(a), X(b), Y(h), a);
    CARPETS.forEach(([a, b, h], i) => drawCarpet(c, v, X(a), X(b), Y(h), i));
    drawTowerArt(c, v, X, Y, { a: TOWER.a, b: TOWER.b, top: TOWER.top, walls: T_WALLS, floors: T_FLOORS, balcony: BALCONY, carpets: T_CARPETS });
    // (the tannery: the vats, the racks over them)
    VATS.forEach((p, i) => drawVat(c, v, p.a, p.b, p.surface, p.bed, p.col, p.wall, f, i * 37));
    RACKS.forEach(([a, b, h], i) => drawRackArt(c, v, X(a), X(b), Y(h), i * 2, f));
    // (the hookah lounge's tent, its poufs, the spice stall)
    drawTentArt(c, v, X(TENT.a), X(TENT.b), Y(TENT.h));
    drawPoufs(c, v, X(CUSHIONS.a), X(CUSHIONS.b), Y(CUSHIONS.h));
    drawSpiceStall(c, v, X(SPICE.a), X(SPICE.b), Y(SPICE.h));
    // (brass lanterns strung over the alleys)
    for (const [a, b] of [[700, 860], [1020, 1180], [1340, 1500]] as const) if (onScreen(v, X(a), X(b))) lanternString(c, X(a), Y(330), X(b), Y(330), 20, 40);
    // (signs: held up, nothing over them)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(180), GY, ['MOROCCO', 'THE MIDDLE EAST', '(IN AFRICA)'], LOOKS.morocco(2), TILEBLUE, undefined, 130);
    if (onScreen(v, X(540), X(680))) postBoard(c, X(610), Y(140), ['THE SOUK', '(SOUP)'], LOOKS.morocco(1), '#7F1D1D', undefined, 90);
    if (onScreen(v, X(1640), X(1740))) postBoard(c, X(1690), GY, ['TOWER GIFT SHOP', 'ELEVATOR', 'OUT OF ORDER'], LOOKS.morocco(1), TILEGREEN, undefined, 120);
    if (onScreen(v, X(2160), X(2300))) postBoard(c, X(2230), GY, ['THE TANNERY', 'DO NOT SWIM', 'IN THE DYE'], LOOKS.morocco(1), '#7C2D12', undefined, 120);
    if (onScreen(v, X(TENT.a), X(TENT.b))) hungBoard(c, X((TENT.a + TENT.b) / 2), Y(TENT.h) + 30, Y(TENT.h) + 56, ['HOOKAH LOUNGE', 'APPLE. ONLY APPLE.'], LOOKS.morocco(1), TILEBLUE);
    if (onScreen(v, X(SPICE.a), X(SPICE.b))) postBoard(c, X((SPICE.a + SPICE.b) / 2), Y(SPICE.h), ['SPICES', 'MILD (ALL OF THEM)'], LOOKS.morocco(1), '#7C2D12', undefined, 44);
    drawSoukBack(c, v, state);
    // (the flag: red, the green star)
    if (onScreen(v, X(20), X(120))) drawMaFlag(c, X(40), f);
  },
  drawFront: (c, state) => { const v = viewIn(state); for (const p of VATS) drawVatFront(c, v, p.a, p.b, p.surface, p.bed, p.col); drawSoukFront(c, v, state); },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (const [a, b] of [[700, 860], [1020, 1180], [1340, 1500]] as const) if (onScreen(v, X(a), X(b))) out.push({ x: X((a + b) / 2), y: Y(310), r: 140, a: 0.4, color: '#FDBA74' });
    if (onScreen(v, X(TENT.a), X(TENT.b))) out.push({ x: X(3300), y: Y(110), r: 150, a: 0.45, color: '#FCA5A5' });
    out.push(...soukLamps(v));
    return out;
  },
};
