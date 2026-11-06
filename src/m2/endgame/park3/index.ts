// THE WATER PARK, level 3: THE MAINTENANCE TUNNELS (the owner's brief, 2026-11-05), and THE WAVE POOL past them (the
// boss: the alien one, in the alien / demon / alien / demon order). Its own engine stage (TUNNEL_STAGE): in through
// the MAINTENANCE door at the end of THE LAZY RIVER (park2: walked up to, it opens; he goes in), out through the wave
// pool's drain to the parking lot (level 4's).
//
//   geo.ts        where everything is (the grid: rock, air, ladders, water, the vat, the sludge; the cast's marks)
//   art.ts        the tunnels drawn (baked chunks), the props, the signs, the lamps
//   hazards.ts    the vat and the sludge (touched: dead), the vat's spurts, the leaking drums' gas, the puddles' arcs,
//                 the steam vents
//   junctions.ts  the flooded pipes' valves (the staircases' alternation, in pipes), their hazards
//   gangways.ts   Fairy Land's staircases, in steel
//   kinds.ts      the janitors, the technicians (possessed: the aliens' turn), the grubs, the eels
//   pool.ts       THE WAVE POOL: the flush in, the waves, the boss (boss.ts), the drain out (end.ts)
//   lines.ts      what's said
//
// The checkpoints (geo.ts CP3, endgame/stages.ts park3t): saved at each. A file's CONTINUE puts him at level 3's very
// start (the MAINTENANCE door, at the end of the lazy river: endgame/stages.ts park3). Hour 12; 13 once the boss is dead.

import type { StageLayout } from '../../../m1/game/stages/index';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { arrived, isLeaving, carryGut, takeGut, setUi, takeStartCheckpoint, setEndgameAt } from '../../store';
import { saveProgress } from '../../save';
import { stopWeapons } from '../../weapons';
import { setEndgameHour } from '../../timeOfDay';
import { createGrab, updateGrab, drawGrab, type Grab } from '../../moves/grab';
import { updateLadders, drawLadders, onLadder, type LadderDef } from '../../moves/ladders';
import { updateWires, drawWires, onWire } from '../../hollywood/wires';
import type { StuntWire } from '../../hollywood/section';
import { sleepFar, wakeNear } from '../../dormant';
import { meatheadSays, saidOver } from '../../adventure/section';
import { byPants } from '../park1/kinds';
import { endgameStage, TUNNEL_STAGE } from '../stages';
import { CELL, ROWS, COLS, Y0, GRID, at, cellAt, isRock, isWater, CP3, CP3_AT, CAST3, PICKUPS3, LADDERS3, WIRES3, WP, STAGE_END, PUMP_ROOM, SEC, cellX, GANG_ROOM } from './geo';
import { drawTunnels, drawLiquidTops, drawWater, drawProps, drawSigns, drawLamps, drawTunnelBackdrop, tunnelLights, drawPours, drawOutflow } from './art';
import { newHazards, updateHazards, drawHazardsBack, drawHazardsFront, updateAir3, drawAir3, type Hazards } from './hazards';
import { newJunctions, updateJunctions, drawJunctions, junctionBlocks, type Junctions } from './junctions';
import { makeGangways, updateGangways, drawGangways, type Gangways } from './gangways';
import { makeCast3, drawBarks3, updateShots3, drawShots3, clearShots3 } from './kinds';
import { type Pool, newPool, updatePool, poolOn, drawPoolBackdrop, drawPoolBack, drawPoolFront, drawPoolHud, poolLights, poolWater, poolCamY, poolDeath } from './pool';
import * as L from './lines';
import { contactSheet } from './sheet';
import { setCheat } from '../../cheats';

export { TUNNEL_STAGE };
const STAGE = endgameStage('park3t')!;
const LADDERS: LadderDef[] = LADDERS3.map(l => ({ x: l.x, top: l.top, bottom: l.bottom }));
const WIRES: StuntWire[] = WIRES3.map(w => ({ from: w.from, to: w.to, rigY: w.rigY }));

export interface Tunnels {
  grab: Grab; hz: Hazards; jn: Junctions; gw: Gangways; pool: Pool;
  said: Record<string, boolean>; lineAt: Record<string, number>;
  /** Where his feet last stood (or held on, or swam): the camera's eased after it. */
  standY: number; camY: number;
  /** What killed him (the stage's own death screen), and when. */
  cause: string | null;
}
const tunOf = (state: GameState) => state.stage as Tunnels | null;
let devStarted = false;
const DEV_CP = (): number | null => { if (!import.meta.env.DEV || devStarted) return null; devStarted = true; const q = new URLSearchParams(location.search).get('tunnel'); return q !== null ? +q : null; };

const once = (t: Tunnels, k: string, go: () => void) => { if (!t.said[k]) { t.said[k] = true; go(); } };
/** A line of his for a moment (not over anybody), no more than once in `gap` ms. */
export const mhSay3 = (state: GameState, t: Tunnels, k: string, lines: L.ByPants, gap = 45000) => {
  const now = performance.now();
  if (now - (t.lineAt[k] ?? -1e9) < gap || isTalking()) return;
  t.lineAt[k] = now;
  meatheadSays(state, pickLine(byPants(state, lines)), false);
};
/** A safe point: the endgame's place on the file, saved. */
const savePoint = (state: GameState) => { setEndgameAt({ stage: STAGE.id, cp: state.checkpoint }); saveProgress(); };

// ---------------------------------------------------------------------------------------------------------------
// The grid, made solid: each row's runs of rock, then runs the same width stacked down merged (fewer blocks)

const gridBlocks = (): Block[] => {
  const rows: { c0: number; c1: number; r: number }[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const runs: { c0: number; c1: number; r: number }[] = [];
    let c = 0;
    while (c < COLS) {
      if (!isRock(GRID[r][c])) { c++; continue; }
      const a = c; while (c < COLS && isRock(GRID[r][c])) c++;
      runs.push({ c0: a, c1: c - 1, r });
    }
    rows.push(runs);
  }
  const out: Block[] = [];
  const open = new Map<string, { c0: number; c1: number; r0: number; r1: number }>();
  for (let r = 0; r < ROWS; r++) {
    const seen = new Set<string>();
    for (const run of rows[r]) {
      const k = `${run.c0},${run.c1}`, o = open.get(k);
      if (o && o.r1 === r - 1) { o.r1 = r; seen.add(k); }
      else { if (o) out.push(blockOf(o)); open.set(k, { c0: run.c0, c1: run.c1, r0: r, r1: r }); seen.add(k); }
    }
    for (const [k, o] of [...open]) if (!seen.has(k)) { out.push(blockOf(o)); open.delete(k); }
  }
  for (const o of open.values()) out.push(blockOf(o));
  return out;
};
const blockOf = (o: { c0: number; c1: number; r0: number; r1: number }): Block => ({ x: o.c0 * CELL, y: Y0 + o.r0 * CELL, w: (o.c1 - o.c0 + 1) * CELL, h: (o.r1 - o.r0 + 1) * CELL, type: 'wall', hidden: true, tag: 'wp3-rock' } as Block);
const GRID_BLOCKS = gridBlocks();

// ---------------------------------------------------------------------------------------------------------------
// The water: a cell's column, up to where it meets air (its surface) or rock (full: no air at all)

const waterAt = (x: number, y: number) => {
  const c = Math.floor(x / CELL);
  let r = Math.floor((y - Y0) / CELL);
  // (just over a surface: the water under it)
  if (!isWater(at(c, r)) && isWater(at(c, r + 1)) && !isRock(at(c, r))) r++;
  if (!isWater(at(c, r))) return null;
  let top = r; while (top > 0 && isWater(at(c, top - 1))) top--;
  let bot = r; while (bot < ROWS - 1 && isWater(at(c, bot + 1))) bot++;
  let a = c; while (a > 0 && isWater(at(a - 1, r))) a--;
  let b = c; while (b < COLS - 1 && isWater(at(b + 1, r))) b++;
  return { key: `wp3-${a}-${top}`, x1: a * CELL, x2: (b + 1) * CELL, surface: Y0 + top * CELL, bottom: Y0 + (bot + 1) * CELL, kind: 'clean' as const };
};

export const tunnelLayout: StageLayout = {
  left: -200,
  startX: CP3_AT[0].x,
  verticalCamera: true,
  startsStanding: true,
  build: (state) => {
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    clearShots3(state);
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    { const d = DEV_CP(); if (d !== null) state.checkpoint = d; }
    if (!CP3_AT[state.checkpoint]) state.checkpoint = 0;
    setEndgameHour(STAGE.hour);
    // ---- the engine's own end (Meathead 1's boss door and arena): none here; the grid's rock, the walls at the ends
    state.blocks = [...GRID_BLOCKS.map(b => ({ ...b }))];
    state.blocks.push({ x: -120, y: Y0 - 2000, w: 120, h: 4000, type: 'wall', hidden: true, tag: 'wp3-l' } as Block);
    state.groundRuns = [];
    // ---- the cast, the pickups (none at or near where he starts: safe-checkpoints)
    const at0 = CP3_AT[state.checkpoint];
    CAST3.forEach(([who, x, y], i) => {
      if (state.checkpoint > 0 && Math.abs(x - at0.x) < 520 && Math.abs(y - at0.y) < 400) return;
      state.enemies.push(makeCast3(who, x, y, i));
    });
    for (const [x, y, type] of PICKUPS3) state.pickups.push({ id: `wp3-${x}-${y}`, pos: { x: x - 10, y: y - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    const t: Tunnels = {
      grab: createGrab(state), hz: newHazards(), jn: newJunctions(state, state.checkpoint), gw: makeGangways(state), pool: newPool(state, state.checkpoint),
      said: {}, lineAt: {}, standY: at0.y, camY: at0.y - 430, cause: null,
    };
    state.blocks.push(...junctionBlocks(t.jn));
    if (state.checkpoint > 0) t.said.in = true;
    state.stage = t;
    if (import.meta.env.DEV && typeof window !== 'undefined') { const w = window as unknown as Record<string, unknown>; w.__m2 = state; w.__wp3 = t; w.__wp3Sheet = contactSheet; w.__wp3God = () => setCheat('god', true); w.__wp3WP = WP; }
    // ---- him, where he starts
    const p = state.player;
    p.pos = { x: at0.x - p.width / 2, y: at0.y - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1;
    p.noSpecials = false; p.carried = false; p.logSeat = false; p.kickPose = 0; p.inCutscene = false;
    setUi({ noSwitch: false, pauseControls: null, introCutscene: false, chordTips: null, minigameCard: null });
    state.camera.x = Math.max(0, at0.x - CANVAS_WIDTH / 2);
    state.camera.y = t.camY;
    savePoint(state);
    sleepFar(state);
    return { x: at0.x, y: at0.y };
  },
  update: (ctx, controls) => {
    const { state } = ctx, t = tunOf(state);
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!t) return controls;
    wakeNear(state);
    const p = state.player, cx = p.pos.x + p.width / 2;
    updateAir3(ctx, (x, y) => tunnelLayout.waterBodyAt!(state, x, y));
    updateShots3(ctx);
    // ---- the wave pool (the flush in, the fight, the drain out): pool.ts's
    if (poolOn(t.pool) || cx > WP.x0 - 200) {
      const out = updatePool(ctx, t.pool, controls, cp => { state.checkpoint = cp; savePoint(state); });
      t.standY = p.pos.y + p.height;
      return updateGrab(ctx, t.grab, out);
    }
    let out: Controls = controls;
    out = updateLadders(ctx, LADDERS, out);
    out = updateWires(ctx, WIRES, out);
    updateGangways(ctx, t.gw);
    updateJunctions(ctx, t.jn);
    updateHazards(ctx, t.hz, src => { t.cause = src; });
    // ---- the outflow's intake (the boss's door: walked, jumped or dropped into): the flush (pool.ts)
    if (p.health > 0 && !p.inCutscene && cx > PUMP_ROOM.outA + 4 && cx < PUMP_ROOM.outB - 4 && p.pos.y + p.height > PUMP_ROOM.floor - 4) {
      if (state.checkpoint < CP3.pump) { state.checkpoint = CP3.pump; savePoint(state); }
      t.pool.step = 'flush'; t.pool.t = 0;
      return { ...NO_CONTROLS };
    }
    // ---- the checkpoints along the way (passing one, stood (or swimming) there: it's his)
    for (const [k, c] of Object.entries(CP3_AT)) {
      const n = +k;
      if (n > state.checkpoint && n <= CP3.pump && Math.abs(cx - c.x) < 40 && Math.abs(p.pos.y + p.height - c.y) < 90 && p.health > 0) { state.checkpoint = n; savePoint(state); }
    }
    // ---- what he says on the way (each once; never over anybody)
    if (!p.inCutscene && p.health > 0 && !isTalking()) {
      if (cx > 260 && cx < 700) once(t, 'in', () => mhSay3(state, t, 'in', L.MH_IN));
      if (cx > cellX(SEC.piss + 2) && cx < cellX(SEC.piss + 9)) once(t, 'piss', () => mhSay3(state, t, 'piss', L.MH_PISS));
      if (cx > cellX(SEC.chem + 3) && cx < cellX(SEC.chem + 8)) once(t, 'chem', () => mhSay3(state, t, 'chem', L.MH_CHEM));
      if (cx > cellX(SEC.gang + 2) && cx < cellX(SEC.gang + 7)) once(t, 'gang', () => mhSay3(state, t, 'gang', L.MH_GANG));
      if (cx > cellX(SEC.shaft + 2) && cx < cellX(SEC.shaft + 8)) once(t, 'shaft', () => mhSay3(state, t, 'shaft', L.MH_SHAFT));
      if (p.swimming) once(t, 'swim', () => mhSay3(state, t, 'swim', L.MH_SWIM));
      if (cx > PUMP_ROOM.x + 200 && p.pos.y + p.height <= PUMP_ROOM.floor + 2) once(t, 'pump', () => mhSay3(state, t, 'pump', L.MH_PUMP));
    }
    // ---- the camera: along the tunnels; up and down after where he stands (or holds on, or swims), eased
    if (p.isGrounded || p.carried || onLadder(state) || onWire(state) || p.swimming) t.standY = p.pos.y + p.height;
    state.cameraMinX = 0; state.cameraMaxX = COLS * CELL - CANVAS_WIDTH;
    if (state.cameraOverride) state.cameraOverride = null;
    setUi({ near: null, map: null, nearExit: false, introCutscene: !!p.inCutscene });
    return updateGrab(ctx, t.grab, out);
  },
  cameraFixedY: (state) => {
    const t = tunOf(state);
    if (!t) return undefined;
    const p = state.player;
    if (poolOn(t.pool) || p.pos.x > WP.x0 - 200) return poolCamY(state, t.pool);
    // (on a ladder, a wire or swimming: him; stood: his floor, a good way up the screen (it's all ceiling over him))
    const free = onLadder(state) || onWire(state) || p.swimming;
    const cx = p.pos.x + p.width / 2, low = cx > GANG_ROOM.a - 200 && cx < GANG_ROOM.b + 100;
    const want = (free ? p.pos.y + p.height : t.standY) - (low ? 300 : 400);
    const lo = Y0, hi = Y0 + ROWS * CELL - CANVAS_HEIGHT;
    t.camY += (Math.max(lo, Math.min(hi, want)) - t.camY) * (free ? 0.12 : 0.1);
    if (!Number.isFinite(t.camY)) t.camY = want;
    return Math.round(t.camY * 2) / 2;
  },
  waterBodyAt: (state, x, y) => {
    const t = tunOf(state);
    if (x > WP.x0 - 100) return t ? poolWater(state, t.pool, x, y) : null;
    return waterAt(x, y);
  },
  deathMessage: (ctx) => {
    const t = tunOf(ctx.state);
    if (!t) return undefined;
    t.cause = null;
    return poolDeath(t.pool);
  },
  drawBackdrop: (c, state) => {
    const t = tunOf(state);
    if (t && state.camera.x + CANVAS_WIDTH > WP.x0 - 100) { drawPoolBackdrop(c, state, t.pool); return true; }
    drawTunnelBackdrop(c);
    return true;
  },
  lighting: (state) => {
    const t = tunOf(state);
    if (t && state.camera.x + CANVAS_WIDTH > WP.x0 - 100) return poolLights(state, t.pool);
    return { dark: 0.42, shade: [6, 20, 14], rim: 0.5, lights: tunnelLights(state) };
  },
  drawBack: (c, state) => {
    const t = tunOf(state);
    if (!t) return;
    if (state.camera.x + CANVAS_WIDTH > WP.x0 - 100) { drawPoolBack(c, state, t.pool); return; }
    drawTunnels(c, state);
    drawProps(c, state);
    drawSigns(c, state);
    drawLadders(c, state, LADDERS);
    drawGangways(c, state, t.gw);
    drawJunctions(c, state, t.jn);
    drawHazardsBack(c, state, t.hz);
    drawWires(c, state, WIRES);
    drawOutflow(c, state, 1);
    drawLamps(c, state);
  },
  drawFront: (c, state) => {
    const t = tunOf(state);
    if (!t) return;
    if (state.camera.x + CANVAS_WIDTH > WP.x0 - 100) drawPoolFront(c, state, t.pool);
    else {
      drawPours(c, state);
      drawLiquidTops(c, state);
      drawHazardsFront(c, state, t.hz);
      drawWater(c, state);
    }
    drawShots3(c, state);
    drawAir3(c, state);
    drawBarks3(c, state, saidOver);
    drawGrab(c, state, t.grab);
  },
  drawHud: (c, state) => {
    const t = tunOf(state);
    if (t) drawPoolHud(c, state, t.pool);
  },
};
export { STAGE_END, cellAt };
