// ITALY's far end (job 4b: the pavilions lengthened): IL FORNO, the WORLD'S LONGEST PIZZA OVEN, a brick tunnel he
// walks through, its three burners flaring floor to ceiling on a staggered beat (the blue pilot flicker and the hiss
// first: the tell; `m2:fl_oven_fire`, the cast too: a pizzaiolo works in there), or over it: up the flour sacks onto
// the oven's roof, where the chimneys over the burners blow their fire out the top on the off beat (so neither way's
// free). Then THE ROOFTOPS: terracotta houses stepping up the hill (a Vespa to start; the alleys between them), an opera
// singer on a roof, a nonna, and down the last house's balconies (they climb back up) to the border with Japan.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, at, boxes3, ledge3, setBack, wall, hole, postBoard, hungBoard, LOOKS, dimmed, hour, ramp6, onScreen, INK, rnd } from '../kit';
import { V, FORNO } from './lines';

const { x0, x1 } = SECTIONS.italy;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Italy ended: this starts there. */
export const OVEN_FROM = 4000;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Italy's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The oven: its tunnel (x), the inside's ceiling (h) and the roof's top (h); the flour sacks up to it. */
const OVEN = { a: 4300, b: 5000, ceil: 130, roof: 200 } as const;
const SACKS = { a: 4200, b: 4280, h: 100 } as const;
/** The burners (rx) and their beat: each PERIOD frames, offset by its turn; WARN of pilot flicker, then FIRE. The
 *  chimneys over them go on the off beat (half a period on). */
const BURNERS = [4420, 4650, 4880];
const PERIOD = 240, WARN = 45, FIRE = 60, FW = 46;
/** The houses up the hill (solid), the Vespa (solid), the last house's balconies (one-way). */
const HOUSES: [number, number, number, string][] = [[5080, 5250, 180, '#E2725B'], [5300, 5450, 300, '#F4A259'], [5500, 5640, 420, '#C2678A']];
const VESPA = { a: 5010, b: 5070, h: 70 } as const;
const BALCONIES: [number, number, number][] = [[5640, 5720, 140], [5650, 5740, 280]];

const ENEMIES: [string, number, number][] = [
  ['m2:fl_pizzaiolo', 4100, 0], ['m2:fl_nonna', 4180, 0],
  ['m2:fl_nonna', 4520, OVEN.roof], ['m2:fl_pizzaiolo', 4560, 0], ['m2:fl_opera', 4800, OVEN.roof],
  ['m2:fl_nonna', 5180, 180], ['m2:fl_opera', 5380, 300], ['m2:fl_pizzaiolo', 5560, 420],
  ['m2:fl_opera', 5700, 0], ['m2:fl_pizzaiolo', 5760, 0],
];

export const OVEN_CHECKPOINTS = [
  { name: 'ITALY: IL FORNO', cp: 44, x: X(4140), y: GY },
  { name: 'ITALY: THE ROOFTOPS', cp: 45, x: X(5030), y: GY },
];

/** A burner's state at frame f: the pilot (warn), the fire (0..1 up), or out. `off`: its chimney (the off beat). */
const flameAt = (f: number, k: number, off = false) => {
  const t = (f + k * 80 + (off ? PERIOD / 2 : 0)) % PERIOD;
  if (t < WARN) return { st: 'warn' as const, k: t / WARN };
  if (t < WARN + FIRE) { const u = (t - WARN) / FIRE; return { st: 'fire' as const, k: Math.min(1, u * 5, (1 - u) * 5) }; }
  return { st: 'out' as const, k: 0 };
};

interface Forno { said: Shout; hit: Set<object>[] }
const fornoOf = (state: GameState) => foreignState<Forno>(state, 'italy-forno' as 'italy', () => ({ said: newShout(), hit: Array.from({ length: BURNERS.length * 2 }, () => new Set<object>()) }));

export const buildOven = (state: GameState) => {
  solid(state, X(OVEN.a), Y(OVEN.roof), OVEN.b - OVEN.a, OVEN.roof - OVEN.ceil, { hidden: true, tag: 'it-oven-roof' });
  solid(state, X(SACKS.a), Y(SACKS.h), SACKS.b - SACKS.a, SACKS.h, { hidden: true, tag: 'it-sacks' });
  solid(state, X(VESPA.a), Y(VESPA.h), VESPA.b - VESPA.a, VESPA.h, { hidden: true, tag: 'it-vespa' });
  for (const [a, b, h] of HOUSES) solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'it-house' });
  for (const [a, b, h] of BALCONIES) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'it-balcony' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'it', X, Y, [[4650, OVEN.roof, 'small_ammo'], [5570, 420, 'small_health']]);
};

export const updateOven = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, o = fornoOf(state);
  const near = p.pos.x > X(3900) && p.pos.x < X(5200);
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  BURNERS.forEach((rx, k) => {
    for (const off of [false, true]) {
      const fl = flameAt(f, k, off), hit = o.hit[k + (off ? BURNERS.length : 0)];
      // (inside: floor to ceiling; the chimney: up off the roof)
      const top = off ? Y(OVEN.roof) - 150 : Y(OVEN.ceil), bot = off ? Y(OVEN.roof) : GY;
      if (fl.st !== 'out') zones.push({ x0: X(rx) - FW, x1: X(rx) + FW, y0: top, y1: bot });
      if (fl.st === 'warn') { hit.clear(); if (fl.k === 0 && near) playSound('whoosh', 0.3, -18); }
      if (fl.st === 'warn' && !off && fl.k === 0 && k === 0 && near) shout(state, o.said, V.pizza.m, byPants(state, FORNO), X(OVEN.a) + 60, Y(OVEN.roof) - 70, 0.4);
      if (fl.st !== 'fire') continue;
      if (fl.k > 0 && fl.k < 0.25 && near && !hit.size) playSound('flame', 0.5, -4);
      const h = (bot - top) * fl.k;
      if (!hit.has(p) && hurtIn(ctx, X(rx) - FW + 6, bot - h, FW * 2 - 12, h, 10, 'm2:fl_oven_fire', { x: Math.sign(p.pos.x + p.width / 2 - X(rx)) * 8 || 8, y: -6 }, 26)) hit.add(p);
      hitCastIn(ctx, X(rx) - FW, bot - h, FW * 2, h, 36, X(rx), 'WELL DONE!', '#FB923C', hit);
    }
  });
  setHazardZones(state, 'it-forno', zones);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const BRICK = '#9A3412', TERRA = '#C2410C';

const drawFlame = (c: Ctx, x: number, bot: number, h: number, f: number) => {
  for (let k = 0; k < 7; k++) {
    const y = bot - (h * (k + 1)) / 7, w = FW * (1 - k / 9) + Math.sin(f * 0.5 + k) * 6;
    box(c, x - w, y, w * 2, h / 7 + 2, ['#7C2D12', '#C2410C', '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FEF3C7'][k]);
  }
};

export const drawOvenBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(OVEN_FROM), x1)) return;
  const f = state.frame;
  // (the hill town behind, set back: stucco, shutters)
  for (const [rx, w, h, col] of [[4020, 220, 200, '#F4A259'], [5050, 600, 520, '#E2725B']] as const) setBack(c, v, X(rx), w, 0.9, () => {
    wall(c, 0, w, h, col); poly(c, [[-12, -h], [w / 2, -h - 50], [w + 12, -h]], dimmed(TERRA));
    for (let wx = 20; wx < w - 40; wx += 70) for (let wy = -h + 40; wy < -60; wy += 90) { hole(c, wx, wy, 26, 34, true); box(c, wx - 8, wy, 6, 34, dimmed('#15803D')); box(c, wx + 28, wy, 6, 34, dimmed('#15803D')); }
  });
  // (the oven's inside: the back wall glowing, the arch-mouths at the ends; then its roof (the walk) and chimneys)
  if (onScreen(v, X(OVEN.a), X(OVEN.b))) {
    const B = ramp6(hour(BRICK));
    const [ax, ay] = at(v.eye, X(OVEN.a), Y(OVEN.ceil), 0.93), [bx, by] = at(v.eye, X(OVEN.b), GY, 0.93);
    box(c, ax, ay, bx - ax, by - ay, '#2A0F08');
    for (let y = ay + 12; y < by; y += 12) for (let x = ax + ((y / 12) % 2) * 14; x < bx; x += 28) box(c, x, y, 1, 12, '#3B1408');
    for (const rx of BURNERS) {
      const fl = flameAt(f, BURNERS.indexOf(rx));
      const [gx, gy] = at(v.eye, X(rx), GY, 0.93);
      box(c, gx - 30, gy - 8, 60, 8, '#44403C');
      if (fl.st === 'warn' && (f >> 2) % 2) box(c, gx - 20, gy - 12, 40, 4, '#60A5FA');
    }
    boxes3(c, v, [
      { x: X(OVEN.a), top: Y(OVEN.roof), w: OVEN.b - OVEN.a, bottom: Y(OVEN.ceil), col: BRICK, standable: true },
      { x: X(SACKS.a), top: Y(SACKS.h), w: SACKS.b - SACKS.a, bottom: GY, col: '#E7E5E4', standable: true },
    ]);
    for (let x = X(OVEN.a); x < X(OVEN.b); x += 28) box(c, x, Y(OVEN.roof) + 20, 1, OVEN.roof - OVEN.ceil - 20, B[1]);
    // (the mouths: arched, sooty)
    for (const ex of [X(OVEN.a), X(OVEN.b) - 24]) { box(c, ex, Y(OVEN.ceil) - 4, 24, 10, B[3]); }
    // (the chimneys: stubs off the roof over each burner, set back a touch: not somewhere to stand)
    for (const rx of BURNERS) { const [cx, cy] = at(v.eye, X(rx), Y(OVEN.roof), 0.95); box(c, cx - 18, cy - 40, 36, 40, dimmed(BRICK)); box(c, cx - 22, cy - 46, 44, 8, dimmed('#57534E')); const fl = flameAt(f, BURNERS.indexOf(rx), true); if (fl.st === 'warn' && (f >> 3) % 2) box(c, cx - 10, cy - 54, 20, 8, dimmed('#A8A29E')); }
  }
  // (the Vespa, the houses, the balconies)
  boxes3(c, v, [
    { x: X(VESPA.a), top: Y(VESPA.h), w: VESPA.b - VESPA.a, bottom: GY - 20, col: '#38BDF8', standable: true },
    ...HOUSES.map(([a, b, h, col]) => ({ x: X(a), top: Y(h), w: b - a, bottom: GY, col, standable: true })),
  ]);
  if (onScreen(v, X(VESPA.a), X(VESPA.b))) for (const wx of [X(VESPA.a) + 12, X(VESPA.b) - 12]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 10, 10, 0, Math.PI * 2); c.fill(); }
  for (const [a, b, h] of HOUSES) if (onScreen(v, X(a), X(b))) {
    // (the tile roof's edge along its top, the shutters)
    for (let x = X(a) - 6; x < X(b) + 6; x += 14) box(c, x, Y(h) - 6, 12, 8, hour(TERRA));
    for (let wy = Y(h) + 40; wy < GY - 50; wy += 90) { box(c, X(a) + 30, wy, 26, 34, '#1C1014'); box(c, X(a) + 22, wy, 6, 34, hour('#15803D')); box(c, X(a) + 58, wy, 6, 34, hour('#15803D')); }
  }
  for (const [a, b, h] of BALCONIES) if (onScreen(v, X(a), X(b))) { ledge3(c, v, X(a), Y(h), b - a, '#78716C', 10); for (let x = X(a) + 6; x < X(b); x += 12) box(c, x, Y(h) - 18, 2, 18, INK); box(c, X(a), Y(h) - 20, b - a, 2, INK); }
  // (laundry strung between the houses: scenery, high over the alleys)
  for (const [a, b, h] of [[5250, 5300, 330], [5450, 5500, 450]] as const) if (onScreen(v, X(a), X(b))) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(X(a) - 30, Y(h)); c.lineTo(X(b) + 30, Y(h)); c.stroke(); for (let k = 0; k < 4; k++) box(c, X(a) - 24 + k * 26, Y(h), 14, 18, dimmed(['#F8FAFC', '#DC2626', '#FDE68A', '#60A5FA'][k])); }
  // (signs: held up, nothing over them)
  if (onScreen(v, X(4180), X(4300))) postBoard(c, X(4180), GY, ['IL FORNO', "WORLD'S LONGEST", 'PIZZA OVEN'], LOOKS.italy(1), '#7F1D1D', undefined, 220);
  if (onScreen(v, X(OVEN.a), X(OVEN.b))) hungBoard(c, X(4650), Y(OVEN.roof) - 70, Y(OVEN.roof) - 40, ['PIZZA TO GO', '(THROUGH)'], LOOKS.italy(1), '#14532D');
  if (onScreen(v, X(5700), X(5860))) postBoard(c, X(5785), GY, ['LEAVING ITALY', 'ARRIVEDERCI (BYE)'], LOOKS.italy(1), '#14532D', undefined, 100);
  void rnd;
};

export const drawOvenFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (onScreen(v, X(OVEN.a), X(OVEN.b))) BURNERS.forEach((rx, k) => {
    const fi = flameAt(f, k), fo = flameAt(f, k, true);
    if (fi.st === 'fire') drawFlame(c, X(rx), GY, (OVEN.ceil) * fi.k, f);
    if (fo.st === 'fire') drawFlame(c, X(rx), Y(OVEN.roof) - 40, 150 * fo.k, f + 9);
  });
  drawShout(c, fornoOf(state).said);
};

export const ovenLamps = (v: View, f: number): Light[] => {
  const out: Light[] = [];
  if (!onScreen(v, X(OVEN.a), X(OVEN.b))) return out;
  BURNERS.forEach((rx, k) => { const fl = flameAt(f, k); out.push({ x: X(rx), y: Y(60), r: fl.st === 'fire' ? 200 : 90, a: fl.st === 'fire' ? 0.7 : 0.35, color: '#FB923C' }); });
  return out;
};
