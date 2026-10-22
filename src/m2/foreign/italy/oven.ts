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
import { heard } from '../../bossQuiet';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, box, poly, at, atDepth, box3Back, still, lip, underBack, steppedGlow, board, postBoard, LOOKS, hour, ramp6, onScreen } from '../kit';
import { drawHillTown, paintTunnelBack, pilot, flameColumn, paintRoofFront, paintSacks, chimney, smokePuffs, paintVespa, drawHouseBox, balcony, laundry } from './art';
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
  // (IL FORNO's checkpoint's spot left clear) in the oven, a pizzaiolo and a nonna working between the burners (lure
  // them into the flare); on the roof, a nonna, the opera singer, a pizza tosser at the far end (pies along the roof
  // at him between the chimneys)
  ['m2:fl_pizzaiolo', 4560, 0], ['m2:fl_nonna', 4760, 0],
  ['m2:fl_nonna', 4520, OVEN.roof], ['m2:fl_opera', 4800, OVEN.roof], ['m2:fl_pizzaiolo', 4950, OVEN.roof],
  // the rooftops: the opera singer and a pizza tosser up the houses; down the last one, a nonna on the high balcony,
  // the opera singer and a pizza tosser below
  ['m2:fl_opera', 5380, 300], ['m2:fl_pizzaiolo', 5560, 420],
  ['m2:fl_nonna', 5690, 280], ['m2:fl_opera', 5700, 0], ['m2:fl_pizzaiolo', 5760, 0],
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
      if (fl.st === 'warn') { hit.clear(); if (fl.k === 0 && near && heard(state, X(rx))) playSound('whoosh', 0.3, -18); }
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
// Drawing (the SNES pass: art.ts paints it; still art stamped for the hour, the fires and the smoke live)

const BRICK_C = '#A0482E';

export const drawOvenBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(OVEN_FROM), x1, 0.9)) return;
  const f = state.frame, eye = v.eye;
  // (the hill town behind, set back: stucco houses up the slope, tiled roofs, a little bell tower)
  drawHillTown(c, v, X(4020), 220, 200, 3);
  drawHillTown(c, v, X(5050), 600, 520, 5);
  // (the oven's inside: the firebrick back wall and its gas manifold, glowing where a burner's going; the soffit; then
  // its roof (the walk), the flour sacks up to it, and the chimneys on it)
  if (onScreen(v, X(OVEN.a), X(OVEN.b))) {
    const H = OVEN.ceil, w = OVEN.b - OVEN.a;
    atDepth(c, eye, 0.93, () => still(c, `it-forno-back-${w}`, X(OVEN.a), GY, -2, -H - 2, w + 4, H + 4, g => paintTunnelBack(g, w, H, BURNERS.map(rx => rx - OVEN.a))));
    BURNERS.forEach((rx, k) => {
      const fl = flameAt(f, k), [gx, gy] = at(eye, X(rx), GY - 40, 0.93);
      if (fl.st === 'fire') steppedGlow(c, gx, gy, 60 + fl.k * 30, '#FB923C', 0, 0.35 * fl.k, 4);
    });
    const Sf = ramp6(hour('#3A1A10'));
    underBack(c, eye, X(OVEN.a), X(OVEN.b), Y(OVEN.ceil), 1, 0.93, Sf, 3);
    // (the burners' grates in the floor, at the play plane under the flames: steel, slotted; the pilot's blue tongues)
    BURNERS.forEach((rx, k) => {
      const St = ramp6(hour('#52525B')), P = (x: number, d: number) => at(eye, x, GY, d);
      poly(c, [P(X(rx) - 34, 1), P(X(rx) + 34, 1), P(X(rx) + 34, 0.95), P(X(rx) - 34, 0.95)], St[1]);
      for (let s = -28; s <= 28; s += 8) { const [p0, q0] = P(X(rx) + s, 0.995), [p1, q1] = P(X(rx) + s, 0.955); c.strokeStyle = '#0A0A0A'; c.lineWidth = 2; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
      box(c, X(rx) - 35, GY - 1, 70, 2, St[4]);
      const fl = flameAt(f, k);
      if (fl.st === 'warn' && (f >> 2) % 2 === 0) pilot(c, X(rx), GY - 1, f);
    });
    const roof = { x: X(OVEN.a), top: Y(OVEN.roof), w, bottom: Y(OVEN.ceil), col: BRICK_C, standable: true };
    const sacks = { x: X(SACKS.a), top: Y(SACKS.h), w: SACKS.b - SACKS.a, bottom: GY, col: '#E4D8BE', standable: true };
    box3Back(c, v, roof); box3Back(c, v, sacks);
    still(c, `it-forno-roof-${w}`, roof.x, roof.top, -2, -1, w + 4, OVEN.roof - OVEN.ceil + 2, g => paintRoofFront(g, w, OVEN.roof - OVEN.ceil));
    still(c, `it-forno-sacks-${sacks.w}x${SACKS.h}`, sacks.x, sacks.top, -2, -1, sacks.w + 4, SACKS.h + 2, g => paintSacks(g, sacks.w, SACKS.h));
    lip(c, roof.x, roof.top, w); lip(c, sacks.x, sacks.top, sacks.w);
    // (the chimneys: stubs off the roof over each burner, set back a touch: not somewhere to stand; smoke before they blow)
    BURNERS.forEach((rx, k) => {
      chimney(c, v, X(rx), Y(OVEN.roof));
      const fl = flameAt(f, k, true);
      if (fl.st === 'warn') { const [mx, my] = at(eye, X(rx), Y(OVEN.roof) - 46, 0.95); smokePuffs(c, mx, my, f, fl.k); }
    });
    board(c, X(4535), Y(OVEN.roof) + 35, ['PIZZA TO GO', '(THROUGH)'], LOOKS.italy(1), '#14532D');
  }
  // (the Vespa, the houses, the balconies)
  if (onScreen(v, X(VESPA.a) - 10, X(VESPA.b) + 10)) {
    const vb = { x: X(VESPA.a), top: Y(VESPA.h), w: VESPA.b - VESPA.a, bottom: GY - 20, col: '#7DD3C0', standable: true };
    box3Back(c, v, vb);
    still(c, `it-vespa-${vb.w}`, vb.x, vb.top, -8, -22, vb.w + 16, VESPA.h + 24, g => paintVespa(g, vb.w, VESPA.h - 20, VESPA.h));
    lip(c, vb.x, vb.top, vb.w);
  }
  HOUSES.forEach(([a, b, h, col], i) => drawHouseBox(c, v, X(a), X(b), Y(h), col, i + 1));
  for (const [a, b, h] of BALCONIES) balcony(c, v, X(a), X(b), Y(h), true);
  // (laundry strung between the houses: scenery, high over the alleys)
  for (const [a, b, h] of [[5250, 5300, 330], [5450, 5500, 450]] as const) if (onScreen(v, X(a) - 40, X(b) + 40)) laundry(c, X(a) - 30, Y(h), X(b) + 30, Y(h), 5, a);
  // (signs: held up, nothing over them)
  if (onScreen(v, X(4180), X(4300))) postBoard(c, X(4180), GY, ['IL FORNO', "WORLD'S LONGEST", 'PIZZA OVEN'], LOOKS.italy(1), '#7F1D1D', undefined, 220);
  if (onScreen(v, X(5700), X(5860))) postBoard(c, X(5785), GY, ['LEAVING ITALY', 'ARRIVEDERCI (BYE)'], LOOKS.italy(1), '#14532D', undefined, 100);
};

export const drawOvenFront = (c: Ctx, v: View, state: GameState) => {
  const f = state.frame;
  if (onScreen(v, X(OVEN.a), X(OVEN.b))) BURNERS.forEach((rx, k) => {
    const fi = flameAt(f, k), fo = flameAt(f, k, true);
    // (inside: kept under the ceiling; the chimney's: up off its mouth)
    if (fi.st === 'fire') { c.save(); c.beginPath(); c.rect(X(OVEN.a), Y(OVEN.ceil), OVEN.b - OVEN.a, OVEN.ceil + 2); c.clip(); flameColumn(c, X(rx), GY, OVEN.ceil * fi.k, FW - 6, f); c.restore(); }
    if (fo.st === 'fire') flameColumn(c, X(rx), Y(OVEN.roof) - 40, 150 * fo.k, FW - 6, f + 9);
  });
  drawShout(c, fornoOf(state).said);
};

export const ovenLamps = (v: View, f: number): Light[] => {
  const out: Light[] = [];
  if (!onScreen(v, X(OVEN.a), X(OVEN.b))) return out;
  BURNERS.forEach((rx, k) => { const fl = flameAt(f, k); out.push({ x: X(rx), y: Y(60), r: fl.st === 'fire' ? 200 : 90, a: fl.st === 'fire' ? 0.7 : 0.35, color: '#FB923C' }); });
  return out;
};
