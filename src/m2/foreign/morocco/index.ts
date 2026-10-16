// MOROCCO: section 7 of Foreign Lands' streets (flows on from Japan, into France: no walls, no doors). The bazaar's
// tiled gate first, then THE ROOFTOPS: flat-roofed houses stepping up, the alleys between them hung with CARPETS on
// lines (just ledges: they don't fly, whatever the salesmen say), salesmen and a snake charmer down in the alleys, a
// hookah bro up top. Then the MINARET-ISH TOWER (the gift shop's: its elevator OUT OF ORDER), climbed inside floor by
// floor to its balcony, and down its far side by the carpets hung off it on poles (they climb back up, too). Then THE
// TANNERY: a row of dye vats (hot, filthy: in one, he's hurt and out again; the cast too), their rims to hop along,
// the drying racks over them the high way; the hookah lounge's tent, the spice stall, to the border with France.
//
// Crude (the first pass): readable boxes with full game feel. Checkpoints 60-69. Outdoors: the time of day's light.

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
import {
  type Ctx, type View, viewIn, box, mix, poly, at, promenade, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, swag, lantern,
  LOOKS, dimmed, hour, ramp6, onScreen, FACADE_D, INK, LIP, timeOfDay,
} from '../kit';
import { TALK } from './lines';
import './kinds';

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
const VATS: Pool[] = [[2300, 2420], [2450, 2570], [2600, 2720], [2750, 2870], [2900, 3020]].map(([a, b], i) => ({ key: `vat${i}`, a: X(a), b: X(b), surface: 18, bed: VAT_DEEP, col: DYES[i], wall: '#A8A29E' }));
const RACKS: [number, number, number][] = [[2400, 2620, 150], [2700, 2920, 150]];
/** The hookah lounge: cushions, the tent's top; the spice stall. */
const CUSHIONS = { a: 3200, b: 3300, h: 40 } as const;
const TENT = { a: 3180, b: 3420, h: 190 } as const;
const SPICE = { a: 3460, b: 3570, h: 100 } as const;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_carpet', 400, 0], ['m2:fl_snakecharmer', 825, 0], ['m2:fl_carpet', 940, 220], ['m2:fl_camel', 1150, 0],
  ['m2:fl_hookah', 1260, 300], ['m2:fl_snakecharmer', 1455, 0], ['m2:fl_camel', 1700, 0],
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
];

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const SAND = '#E7C9A0', CLAY = '#C2794A', TILEBLUE = '#1D4ED8', TILEGREEN = '#15803D';

/** A zellige band: little tiles in a checker of blue, green and white. */
const zellige = (c: Ctx, x: number, y: number, w: number, h: number, dim = false) => {
  const f = dim ? dimmed : hour;
  for (let yy = 0; yy < h; yy += 6) for (let xx = 0; xx < w; xx += 6) box(c, x + xx, y + yy, 6, 6, f([TILEBLUE, '#F8FAFC', TILEGREEN, '#F8FAFC'][((xx + yy) / 6) % 4]));
};

/** The houses: sand and clay walls, a horseshoe-arch door, a tiled band, a lit roof edge (standable). */
const drawRoofs = (c: Ctx, v: View) => {
  boxes3(c, v, ROOFS.map(([a, b, h], i) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: i % 2 ? CLAY : SAND, standable: true })));
  for (const [a, b, h] of ROOFS) {
    if (!onScreen(v, X(a), X(b))) continue;
    const mx = X((a + b) / 2);
    box(c, mx - 18, GY - 64, 36, 64, '#1C1014'); c.fillStyle = '#1C1014'; c.beginPath(); c.arc(mx, GY - 64, 20, Math.PI, 0); c.fill();
    zellige(c, X(a) + 6, Y(h) + 14, b - a - 12, 12);
    for (const wx of [X(a) + 20, X(b) - 40]) if (h > 180) { box(c, wx, Y(h) + 40, 20, 28, '#1C1014'); for (let k = 0; k < 3; k++) box(c, wx + 2 + k * 6, Y(h) + 40, 2, 28, hour('#3F2A1C')); }
  }
};

/** A carpet hung over a line: the line (poles at each end), its top edge (lit: somewhere to stand), its body hanging
 *  down under it with a pattern and a fringe. */
const RUG_COLS = [['#B91C1C', '#FCD34D', '#1E3A8A'], ['#1E3A8A', '#F8FAFC', '#B91C1C'], ['#7C2D12', '#F59E0B', '#14532D'], ['#14532D', '#FCA5A5', '#FCD34D']];
const drawCarpet = (c: Ctx, v: View, a: number, b: number, h: number, i: number) => {
  if (!onScreen(v, X(a), X(b))) return;
  const [base, pat, edge] = RUG_COLS[i % RUG_COLS.length], y = Y(h), w = b - a;
  box(c, X(a) - 3, y - 20, 4, 24, INK); box(c, X(b) - 1, y - 20, 4, 24, INK);
  box(c, X(a), y - 1, w, 1, INK);
  box(c, X(a) + 4, y + 2, w - 8, 52, hour(edge));
  box(c, X(a) + 8, y + 2, w - 16, 46, hour(base));
  for (let k = 0; k < 3; k++) poly(c, [[X(a) + w / 2, y + 8 + k * 2], [X(a) + w / 2 + 22 - k * 6, y + 26], [X(a) + w / 2, y + 44 - k * 2], [X(a) + w / 2 - 22 + k * 6, y + 26]], hour(k % 2 ? base : pat));
  for (let x = X(a) + 6; x < X(b) - 6; x += 4) box(c, x, y + 54, 2, 6, hour('#F5F5F4'));
  ledge3(c, v, X(a) + 4, y, w - 8, edge, 4);
};

/** The tower: inside (its back wall, set back), its walls, floors, the balcony and its dome, a gold finial; tiles. */
const drawTower = (c: Ctx, v: View) => {
  if (!onScreen(v, X(TOWER.a) - 60, X(TOWER.b) + 200)) return;
  const [ax, ay] = at(v.eye, X(TOWER.a), Y(TOWER.top + 40), 0.94), [bx, by] = at(v.eye, X(TOWER.b), GY, 0.94);
  box(c, ax, ay, bx - ax, by - ay, dimmed(SAND));
  for (let k = 0; k < 6; k++) { const wy = ay + 40 + k * 110; box(c, ax + (bx - ax) / 2 - 8, wy, 16, 34, '#1C1014'); c.fillStyle = '#1C1014'; c.beginPath(); c.arc(ax + (bx - ax) / 2, wy, 8, Math.PI, 0); c.fill(); }
  boxes3(c, v, T_WALLS.map(([a, b, lo, hi]) => ({ x: X(a), top: Y(hi), w: b - a, bottom: Y(lo), col: SAND })));
  for (const [a, b, lo, hi] of T_WALLS) for (let y = Y(hi) + 30; y < Y(lo) - 10; y += 90) zellige(c, X(a) + 2, y, b - a - 4, 18);
  for (const [a, b, h] of T_FLOORS) ledge3(c, v, X(a), Y(h), b - a, '#92400E', 10);
  const [ba, bb, bh] = BALCONY;
  // (the dome over the balcony, set back off it; the finial)
  setBack(c, v, X(TOWER.a) + 40, TOWER.b - TOWER.a - 80, 0.95, () => {
    const w = TOWER.b - TOWER.a - 80;
    box(c, 0, -bh - 90, w, 90, dimmed(SAND)); zellige(c, 6, -bh - 80, w - 12, 12, true);
    c.fillStyle = dimmed(TILEGREEN); c.beginPath(); c.arc(w / 2, -bh - 90, w / 2, Math.PI, 0); c.fill();
    box(c, w / 2 - 2, -bh - 90 - w / 2 - 40, 4, 40, dimmed('#CA8A04'));
    for (let k = 0; k < 3; k++) { c.fillStyle = dimmed('#FCD34D'); c.beginPath(); c.arc(w / 2, -bh - 90 - w / 2 - 12 - k * 12, 5 - k, 0, Math.PI * 2); c.fill(); }
  });
  ledge3(c, v, X(ba), Y(bh), bb - ba, CLAY, 16);
  for (let x = X(ba) + 6; x < X(bb); x += 14) box(c, x, Y(bh) - 18, 3, 18, hour('#F5F5F4'));
  box(c, X(ba), Y(bh) - 20, bb - ba, 3, hour('#F5F5F4'));
  // (the carpets hung off the far side on poles)
  T_CARPETS.forEach(([a, b, h], i) => { box(c, X(TOWER.b), Y(h) - 22, X(b) - X(TOWER.b), 3, hour('#78350F')); drawCarpet(c, v, a, b, h, i + 1); });
};

/** The tannery: each vat a stone basin full of dye (its surface lit, bubbling), the rims between; the drying racks over
 *  them (poles and a lit plank), hides hung off them. */
const drawTannery = (c: Ctx, v: View, f: number) => {
  if (!onScreen(v, X(2260), X(3060))) return;
  for (const p of VATS) {
    if (!onScreen(v, p.a, p.b)) continue;
    const W = ramp6(hour(p.wall));
    const [ax, ay] = at(v.eye, p.a, GY, 0.9), [bx] = at(v.eye, p.b, GY, 0.9);
    box(c, ax, ay, bx - ax, GY + VAT_DEEP - ay, W[1]);
    box(c, p.a, GY, 6, VAT_DEEP, W[2]); box(c, p.b - 6, GY, 6, VAT_DEEP, W[2]);
    const col = hour(p.col);
    box(c, p.a + 6, GY + p.surface, p.b - p.a - 12, VAT_DEEP - p.surface, col);
    box(c, p.a + 6, GY + p.surface, p.b - p.a - 12, 2, mix(col, '#FFFFFF', 0.35));
    for (let k = 0; k < 3; k++) { const bx2 = p.a + 20 + ((k * 37 + (f >> 2)) % (p.b - p.a - 40)), r = 2 + ((f + k * 11) % 20) / 8; c.strokeStyle = mix(col, '#FFFFFF', 0.5); c.lineWidth = 1; c.beginPath(); c.arc(bx2, GY + p.surface - 1, r, Math.PI, 0); c.stroke(); }
    // (the rims' lit tops: the ground between the vats)
    box(c, p.b, GY, 30, 3, LIP[2]);
  }
  for (const [a, b, h] of RACKS) {
    if (!onScreen(v, X(a), X(b))) continue;
    for (const px0 of [X(a) + 4, X(b) - 8]) box(c, px0, Y(h), 4, h, hour('#78350F'));
    ledge3(c, v, X(a), Y(h), b - a, '#92400E', 8);
    for (let k = 0; k < 4; k++) { const hx = X(a) + 24 + k * ((b - a - 48) / 3); poly(c, [[hx - 14, Y(h) + 8], [hx + 14, Y(h) + 8], [hx + 18, Y(h) + 44], [hx, Y(h) + 52], [hx - 18, Y(h) + 44]], hour(['#D6A15E', '#1E40AF', '#EAB308', '#DC2626'][k])); }
  }
};

/** The hookah lounge's tent: striped, its top's lip lit (standable), its poles, the cushions; the spice stall's cones. */
const drawLounge = (c: Ctx, v: View) => {
  if (!onScreen(v, X(TENT.a) - 40, X(SPICE.b) + 40)) return;
  for (const px0 of [X(TENT.a) + 6, X(TENT.b) - 10]) box(c, px0, Y(TENT.h), 4, TENT.h, hour('#78350F'));
  for (let x = X(TENT.a) - 10, k = 0; x < X(TENT.b) + 10; x += 20, k++) poly(c, [[x, Y(TENT.h)], [x + 20, Y(TENT.h)], [x + 20, Y(TENT.h) + 30 + (k % 2) * 4], [x, Y(TENT.h) + 30]], hour(k % 2 ? '#B91C1C' : '#FCD34D'));
  ledge3(c, v, X(TENT.a), Y(TENT.h), TENT.b - TENT.a, '#B91C1C', 6);
  boxes3(c, v, [
    { x: X(CUSHIONS.a), top: Y(CUSHIONS.h), w: CUSHIONS.b - CUSHIONS.a, bottom: GY, col: '#7C3AED', standable: true },
    { x: X(SPICE.a), top: Y(SPICE.h), w: SPICE.b - SPICE.a, bottom: GY, col: '#92400E', standable: true },
  ]);
  for (let k = 0; k < 4; k++) { const sx = X(SPICE.a) + 18 + k * 26; poly(c, [[sx - 11, Y(SPICE.h) + 30], [sx + 11, Y(SPICE.h) + 30], [sx, Y(SPICE.h) + 8]], hour(['#DC2626', '#EAB308', '#F97316', '#65A30D'][k])); }
};

export const morocco: ForeignSection = {
  id: 'morocco', x0, x1,
  checkpoints: MOROCCO_CHECKPOINTS,
  build: (state) => {
    layOwn(state, runsAround(x0, x1, VATS));
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
    // The dye vats: walkers keep out; in one, he's scalded and pops back out (the cast too, knocked in)
    setHazardZones(state, 'ma-vats', VATS.map(v => ({ x0: v.a, x1: v.b, y0: GY - 4, y1: GY + VAT_DEEP, ground: true })));
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const vat = VATS.find(v => cx > v.a + 4 && cx < v.b - 4 && feet > GY + v.surface + 4);
    if (vat && p.health > 0 && !p.inCutscene) {
      if (p.invincibilityTimer <= 0) { hurtPlayer(ctx, 9, 'm2:fl_dye', { x: 0, y: -12 }, 30); playSound('splash', 0.7, -4); }
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
    // (the bazaar's fronts behind: sand walls, arches, tiled bands, awnings dimmed: scenery)
    for (const [rx, w, h] of [[300, 200, 200], [720, 300, 260], [1360, 260, 280], [2240, 340, 180], [3060, 300, 220]] as const) setBack(c, v, X(rx), w, FACADE_D, () => {
      wall(c, 0, w, h, rx % 3 ? SAND : CLAY);
      for (let k = 0; k < Math.floor(w / 70); k++) { const ax = 16 + k * 70; box(c, ax, -90, 44, 90, '#1C1014'); c.fillStyle = '#1C1014'; c.beginPath(); c.arc(ax + 22, -90, 22, Math.PI, 0); c.fill(); }
      zellige(c, 0, -h + 20, w, 12, true);
      for (let x = 4; x < w; x += 30) box(c, x, -h, 14, 8, dimmed(CLAY));
    });
    // (the gate: a tiled horseshoe arch, set back over the way in)
    setBack(c, v, X(220), 260, 0.92, () => {
      wall(c, 0, 50, 260, SAND); wall(c, 210, 50, 260, SAND); box(c, 0, -260, 260, 60, dimmed(SAND));
      zellige(c, 6, -250, 248, 16, true);
      c.fillStyle = dimmed(TILEBLUE); c.beginPath(); c.arc(130, -150, 84, Math.PI, 0); c.fill();
      c.fillStyle = dimmed(SAND); c.beginPath(); c.arc(130, -150, 74, Math.PI, 0); c.fill();
    });
    drawRoofs(c, v);
    boxes3(c, v, CRATES.map(([a, b, h]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col: '#A16207', standable: true })));
    for (const [a, b, h] of CRATES) if (onScreen(v, X(a), X(b))) { box(c, X(a) + 4, Y(h) + h / 2, b - a - 8, 2, hour('#78350F')); poly(c, [[X(a) + 4, Y(h) + 6], [X(b) - 4, GY - 6], [X(b) - 8, GY - 6], [X(a) + 4, Y(h) + 12]], hour('#92400E')); }
    CARPETS.forEach(([a, b, h], i) => drawCarpet(c, v, a, b, h, i));
    drawTower(c, v);
    drawTannery(c, v, f);
    drawLounge(c, v);
    // (lamps strung over the alleys: brass lanterns)
    for (const [a, b] of [[700, 860], [1020, 1180], [1340, 1500]] as const) if (onScreen(v, X(a), X(b))) swag(c, X(a), Y(330), X(b), Y(330), 20, ['#F59E0B', '#16A34A'], 'lanterns', 40);
    // (signs)
    if (onScreen(v, X(100), X(320))) postBoard(c, X(180), GY, ['MOROCCO', 'THE MIDDLE EAST', '(IN AFRICA)'], LOOKS.morocco(2), TILEBLUE, undefined, 130);
    if (onScreen(v, X(540), X(680))) postBoard(c, X(610), Y(140), ['THE SOUK', '(SOUP)'], LOOKS.morocco(1), '#7F1D1D', undefined, 90);
    if (onScreen(v, X(1640), X(1740))) postBoard(c, X(1690), GY, ['TOWER GIFT SHOP', 'ELEVATOR', 'OUT OF ORDER'], LOOKS.morocco(1), TILEGREEN, undefined, 120);
    if (onScreen(v, X(2160), X(2300))) postBoard(c, X(2230), GY, ['THE TANNERY', 'DO NOT SWIM', 'IN THE DYE'], LOOKS.morocco(1), '#7C2D12', undefined, 120);
    if (onScreen(v, X(TENT.a), X(TENT.b))) hungBoard(c, X((TENT.a + TENT.b) / 2), Y(TENT.h) + 30, Y(TENT.h) + 56, ['HOOKAH LOUNGE', 'APPLE. ONLY APPLE.'], LOOKS.morocco(1), TILEBLUE);
    if (onScreen(v, X(SPICE.a), X(SPICE.b))) hungBoard(c, X((SPICE.a + SPICE.b) / 2), Y(SPICE.h) - 4, Y(SPICE.h) - 40, ['SPICES', 'MILD (ALL OF THEM)'], LOOKS.morocco(1), '#7C2D12');
    if (onScreen(v, X(3540), X(3600))) postBoard(c, X(3560), GY, ['LEAVING MOROCCO', 'SHUKRAN (CHEERS)'], LOOKS.morocco(1), TILEBLUE, undefined, 160);
    // (the flag: red, the green star)
    if (onScreen(v, X(20), X(120))) {
      const fx = X(40);
      box(c, fx - 2, GY - 200, 4, 200, hour('#9CA3AF'));
      for (let i = 0; i < 48; i += 4) box(c, fx + 2 + i, GY - 198 + Math.sin(f * 0.08 + i * 0.12) * 2, 4, 30, hour('#C1272D'));
      c.strokeStyle = hour('#006233'); c.lineWidth = 2; c.beginPath();
      for (let k = 0; k <= 5; k++) { const a = -Math.PI / 2 + (k * 4 * Math.PI) / 5, sx = fx + 26 + Math.cos(a) * 8, sy = GY - 183 + Math.sin(a) * 8; if (k) c.lineTo(sx, sy); else c.moveTo(sx, sy); }
      c.stroke();
    }
    void lantern; void timeOfDay; void hole;
  },
  outdoors: () => 1,
  lamps: (state) => {
    const v = viewIn(state), out: Light[] = [];
    for (const [a, b] of [[700, 860], [1020, 1180], [1340, 1500]] as const) if (onScreen(v, X(a), X(b))) out.push({ x: X((a + b) / 2), y: Y(310), r: 140, a: 0.4, color: '#FDBA74' });
    if (onScreen(v, X(TENT.a), X(TENT.b))) out.push({ x: X(3300), y: Y(110), r: 150, a: 0.45, color: '#FCA5A5' });
    return out;
  },
};
