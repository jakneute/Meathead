// CANADA's far end (job 4b: the pavilions lengthened), past the ranger station and before the helipad: THE FROZEN
// POND (a refrigerated one: it's Florida) and THE TOBOGGAN HILL. The pond's ice in panels over the water, a pickup game
// of hockey on it; the THIN panels are marked (darker, hairline cracks, a SORRY sign): stood on, they crack (the
// creak and the cracks spreading: the tell) and give way, dropping whoever's on them into the freezing water (him:
// `m2:fl_thin_ice`, hurt going in; the cast too, THROUGH THE ICE!); a broken panel freezes over again after a while
// (the way back's never lost; he can always swim it and climb out at the ends, or up through a hole). The cast keep off
// the thin ice on their own (knocked onto it, that's another matter). Then the toboggan hill: stairs cut in the snow up
// to the sugar shack on top (a Mountie, a lumberjack), down the toboggan chute's far side, a last moose, on to the
// helipad.

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { GroundRun } from '../../../m1/game/core/terrain';
import { ledge, solid, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { heard } from '../../bossQuiet';
import { setHazardZones, hazardHit } from '../../hazardHit';
import { runsAround, poolSteps, poolAt, drawPoolBack, drawPoolFront, type Pool } from '../water';
import { hurtIn, placePickups, newShout, shout, drawShout, type Shout } from '../setpiece';
import { byPants } from '../cast';
import { V, THIN_ICE } from './lines';
import { type Ctx, type View, postBoard, hungBoard, LOOKS, onScreen } from '../kit';
import { drawPine, drawPondBoards, drawHill, drawShack, icePanel, iceChunks } from './art';

const { x0, x1 } = SECTIONS.canada;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Canada ended (the ranger station): this starts there. */
export const POND_FROM = 3600;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Canada's start, heights up from the promenade). He jumps ~145 up, ~210 across.

export const ICE_POND: Pool = { key: 'icepond', a: X(3750), b: X(4450), surface: 30, bed: 190, col: '#1E3A8A', wall: '#94A3B8' };
/** The ice: ten panels across the pond (70 wide), which are thin. */
const PANEL_W = 70, PANELS = 10, THIN = new Set([2, 3, 5, 7, 8]);
/** Cracking: frames stood on before it goes; frames before it's frozen over again. */
const CRACK = 34, REFREEZE = 330;
/** The toboggan hill: up the stairs, the top, down the chute. */
const HILL = { a: 4560, top: 4800, b: 5020, end: 5360, h: 380 } as const;
const SHACK = { a: 4840, b: 4960, h: 470 } as const;

const ENEMIES: [string, number, number][] = [
  ['m2:fl_lumberjack', 3660, 0],
  ['m2:fl_hockey', 3820, 0], ['m2:fl_hockey', 4060, 0], ['m2:fl_hockey', 4410, 0],
  ['m2:fl_moose', 4510, 0],
  ['m2:fl_mountie', 4870, HILL.h], ['m2:fl_lumberjack', 4990, HILL.h],
  ['m2:fl_hockey', 5200, Math.round(HILL.h * (1 - (5200 - HILL.b) / (HILL.end - HILL.b)))],
  ['m2:fl_moose', 5390, 0],
];

export const POND_CHECKPOINTS = [
  { name: 'CANADA: THE FROZEN POND', cp: 94, x: X(3650), y: GY },
  { name: 'CANADA: THE TOBOGGAN HILL', cp: 95, x: X(4500), y: GY },
];

export const pondRuns = (): GroundRun[] => [
  ...runsAround(X(POND_FROM), X(HILL.a), [ICE_POND]),
  { x1: X(HILL.a), y1: GY, x2: X(HILL.top), y2: Y(HILL.h), surface: 'hard', steps: { n: 9 } },
  { x1: X(HILL.top), y1: Y(HILL.h), x2: X(HILL.b), y2: Y(HILL.h), surface: 'hard' },
  { x1: X(HILL.b), y1: Y(HILL.h), x2: X(HILL.end), y2: GY, surface: 'hard' },
  { x1: X(HILL.end), y1: GY, x2: x1, y2: GY, surface: 'hard' },
];

// ---------------------------------------------------------------------------------------------------------------
// The ice

interface Panel { b: Block; i: number; thin: boolean; crack: number; brokeAt: number }
interface Ice { panels: Panel[]; dunked: number; said: Shout }
const iceOf = (state: GameState) => foreignState<Ice>(state, 'canada-ice' as 'canada', () => ({ panels: [], dunked: -9999, said: newShout() }));
const panelX = (i: number) => ICE_POND.a + i * PANEL_W;

const standsOn = (b: Block, x: number, w: number, feet: number, grounded: boolean) => grounded && Math.abs(feet - b.y) < 4 && x + w > b.x + 4 && x < b.x + b.w - 4;

export const buildPond = (state: GameState) => {
  const ice = iceOf(state);
  poolSteps(state, ICE_POND);
  ice.panels = Array.from({ length: PANELS }, (_, i) => ({ b: ledge(state, panelX(i), GY, PANEL_W, { hidden: true, tag: 'ca-ice' }), i, thin: THIN.has(i), crack: 0, brokeAt: -1 }));
  solid(state, X(SHACK.a), Y(SHACK.h), SHACK.b - SHACK.a, SHACK.h - HILL.h, { hidden: true, tag: 'ca-shack' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'ca', X, Y, [[4900, SHACK.h, 'small_health'], [4020, 0, 'small_ammo']]);
};

export const updatePond = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, f = state.frame, ice = iceOf(state);
  const near = p.pos.x > X(3500) && p.pos.x < X(4600);
  const zones: { x0: number; x1: number; y0: number; y1: number; ground: boolean }[] = [];
  for (const pn of ice.panels) {
    if (!pn.thin) continue;
    zones.push({ x0: pn.b.x - 6, x1: pn.b.x + PANEL_W + 6, y0: GY - 80, y1: GY + ICE_POND.bed, ground: true });
    if (pn.brokeAt >= 0) {
      // (frozen over again in a while, once nobody's in the hole)
      if (f - pn.brokeAt > REFREEZE) { pn.b.y = GY; pn.crack = 0; pn.brokeAt = -1; if (near && heard(state, pn.b.x)) playSound('crack', 0.3, 20); }
      continue;
    }
    const onHim = standsOn(pn.b, p.pos.x, p.width, p.pos.y + p.height, p.isGrounded);
    const onThem = state.enemies.filter(e => e.health > 0 && standsOn(pn.b, e.pos.x, e.width, e.pos.y + e.height, e.vel.y === 0));
    if (!onHim && !onThem.length) continue;
    pn.crack++;
    // (a hockey player warns him, too late, sorry)
    if (onHim && pn.crack === 1) { const h = state.enemies.find(e => e.health > 0 && e.kind === 'm2:fl_hockey' && Math.abs(e.pos.x - p.pos.x) < 700); if (h) shout(state, ice.said, V.hockey.m, byPants(state, THIN_ICE), h.pos.x + h.width / 2, h.pos.y - 18, 0.7); }
    if (pn.crack % 10 === 1 && near) playSound('crack', 0.45, 6 + pn.crack / 3);
    if (pn.crack < CRACK) continue;
    // (it goes)
    pn.brokeAt = f; pn.b.y = -99999;
    playSound('glass', 0.7, -10); playSound('splash', 0.8, -4);
    for (const e of onThem) hazardHit(ctx, e, 30, e.pos.x + e.width / 2 + 40, 'THROUGH THE ICE!', { color: '#BAE6FD', knock: 2 });
    if (onHim) ice.dunked = f;
  }
  setHazardZones(state, 'ca-thinice', zones);
  // (in the freezing water after going through: hurt once, going in)
  if (f - ice.dunked < 50 && p.pos.y + p.height > GY + ICE_POND.surface - 4 && hurtIn(ctx, p.pos.x, p.pos.y, p.width, p.height, 7, 'm2:fl_thin_ice', { x: 0, y: -3 }, 30)) ice.dunked = -9999;
};

export const pondWater = (x: number, y: number) => poolAt([ICE_POND], x, y);

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the SNES pass: art.ts paints it; here's only where)

export const drawPondBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(POND_FROM), x1)) return;
  const f = state.frame;
  // (the pond's back first, then the pines and the boards behind it (nearer than its far paving), snow on the pines)
  drawPoolBack(c, v, ICE_POND);
  for (const rx of [3700, 4200, 4620, 5100]) drawPine(c, v, X(rx) + 40, 200, rx, 0.9, true);
  drawPondBoards(c, v, ICE_POND.a, ICE_POND.b - ICE_POND.a);
  // (the toboggan hill: the snow, the stairs cut in it, the chute down its far side; the sugar shack on top)
  drawHill(c, v, X(HILL.a), X(HILL.top), X(HILL.b), X(HILL.end), Y(HILL.h), 9, f);
  drawShack(c, v, X(SHACK.a), X(SHACK.b), Y(SHACK.h), Y(HILL.h), f);
  if (onScreen(v, X(SHACK.a), X(SHACK.b))) hungBoard(c, X((SHACK.a + SHACK.b) / 2), Y(SHACK.h) + 20, Y(SHACK.h) + 46, ['SUGAR SHACK', 'SYRUP: $40'], LOOKS.canada(1), '#7C2D12');
  // (signs: held up, nothing over them)
  if (onScreen(v, X(3620), X(3760))) postBoard(c, X(3680), GY, ['THE FROZEN POND', 'REFRIGERATED', 'SORRY ABOUT THE ICE'], LOOKS.canada(1), '#1E3A8A', undefined, 150);
  if (onScreen(v, X(4460), X(4560))) postBoard(c, X(4500), GY, ['TOBOGGAN HILL', 'TOBOGGANS: SOLD OUT'], LOOKS.canada(1), '#14532D', undefined, 110);
  if (onScreen(v, X(5300), X(5460))) postBoard(c, X(5380), GY, ['LEAVING CANADA', 'SORRY', '(FOR EVERYTHING)'], LOOKS.canada(1), '#7F1D1D', undefined, 120);
};

export const drawPondFront = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, ICE_POND.a - 60, ICE_POND.b + 60)) return;
  const f = state.frame, ice = iceOf(state);
  drawPoolFront(c, v, ICE_POND, f);
  // (the ice over it: panels (the thin ones darker and marked, their cracks spreading as they go), lit lips: standable)
  for (const pn of ice.panels) {
    const x = panelX(pn.i);
    if (pn.brokeAt >= 0) { iceChunks(c, x, f); continue; }
    icePanel(c, x, PANEL_W, pn.thin, pn.crack / CRACK, pn.crack > 0, f);
  }
  drawShout(c, ice.said);
};

export const pondLamps = (v: View): Light[] => (onScreen(v, X(SHACK.a), X(SHACK.b)) ? [{ x: X(4900), y: Y(HILL.h + 40), r: 130, a: 0.45, color: '#FDE68A' }] : []);
