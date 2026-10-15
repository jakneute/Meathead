// THE WAREHOUSE: section 3 of Hollywood Land (owner: the warehouse agent). The coaster's launch bursts him in through
// the end wall and all its walls come down (burst.ts): they were secretly filming the next big superhero team-up (THE
// REVENGERS 19) in here for a tax write-off, and now the whole public knows (they're stood on the fallen back wall,
// phones up, the whole way along). Cast and crew are pissed. The green-screen sets in a row (layout.ts): a platforming
// fight through the film crew (kinds.ts: grips, boom ops, runners, the director and his ACTION!, craft services, mocap
// doubles, the stunt coordinator), the stunt wires again and escalated, the set's own gear working against him
// (hazards.ts: the lighting rig, pyro, wind machines). At the end, on the main stage: the script in its glass case on a
// plinth, lit and roped off and laser-gridded like a temple idol. Before he gets near: THE ENSEMBLE CAST, the sub-boss
// (cast.ts, fight.ts): thirty principals, every one an A-lister in a legally distinct superhero suit, who think they
// have powers they don't, and die like the people they are, bodies piling up. Then (ending.ts) BETTER CLEAN UP THE
// BODIES: the bulldozer, the pile, the case knocked over (the script leaked), through the far wall into the dumpster at
// the lot's start; he's in the lot.
//
// SUB-BOSS RULES: open before it starts; once it's on, both sides locked (the stage door down behind him, the far wall
// ahead) till every one of them is dead; never respawned once past (CAST_MEMO; its checkpoint's `clear`); clean / shitty
// / naked line pools for every line group (lines.ts); the big health and ammo before it (the cast's holding area).
//
// ~12500 px of play: the sets ~9600 (~2.4 min with the crew), the main stage and the cast (~2 min). Checkpoints 20-25.
// Indoors, but the walls are down: a half share of the time of day's light, the studio lights after dark.
//
// Revisits differ: the walls down for good, the wreck where it stopped, the bodies gone (to the dumpster), the bulldozer
// gone (outside, in the dumpster), the case on its side, empty, the pages all over the stage, the far wall smashed open
// (the way out to the lot, and back in from it). Back the other way, off the left end: the coaster's stop 3.

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { HollywoodSection } from '../section';
import { layOwn, solid, ledge, endWalls, endExits, runExits, meatheadSays, saidOver } from '../section';
import { DOORS } from '../geometry';
import { flash } from '../blvd/paint';
import {
  x0, x1, X, Y, R, GY, BACK_Y, GROUND, SOLIDS, LEDGES, WIRES, ENEMIES, PICKUPS, REFILL, CHECKPOINTS, FAR_WALL, CASE_X, ARENA,
  WALLS_MEMO, CAST_MEMO, LEAK_MEMO,
} from './layout';
import { whOf } from './state';
import './kinds';
import './cast';
import { updateShots } from './kinds';
import { drawShots } from './shots';
import { updateHazards, drawHazards } from './hazards';
import { takeLaunch, updateBurst, drawBurstHud } from './burst';
import { updateFight, fightCam, castDone, drawFightBack, drawFightFront, drawFightHud } from './fight';
import { startEnding, updateEnding, endingOn, leaked, caseDown, drawEndingBack, drawEndingFront, drawEndingHud } from './ending';
import { drawWarehouseBackdrop, drawWarehouseBack, warehouseLamps } from './art';
import { GAG_LINES, AD_STEVE } from './lines';
import { adSay } from './talk';

const memo = (state: GameState, k: string) => !!state.stageMemo[k];

/** The gags along the way (once each, a stage build): [from, to, which]. */
const GAGS: [number, number, keyof typeof GAG_LINES][] = [
  [780, 1100, 'rooftop'], [2680, 2900, 'abyss'], [4880, 5100, 'craft'], [5470, 5640, 'steve'], [6380, 6700, 'mothership'],
  [6900, 7060, 'pyro'], [8300, 8520, 'newyork'], [REFILL - 120, REFILL + 60, 'refill'],
];

export const warehouse: HollywoodSection = {
  id: 'warehouse', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    const o = whOf(state);
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' as const })));
    for (const [rx, h, w] of SOLIDS) solid(state, X(rx), Y(h), w, h, { hidden: true, tag: 'warehouse' });
    for (const [rx, h, w] of LEDGES) ledge(state, X(rx), Y(h), w, { hidden: true, tag: 'warehouse' });
    endWalls(state, 'warehouse');
    // (a fresh start further on (the checkpoint-skip cheat): what he'd have done on the way is done)
    if (state.checkpoint >= 20) state.stageMemo[WALLS_MEMO] = '1';
    if (state.checkpoint >= 30) { state.stageMemo[CAST_MEMO] = '1'; state.stageMemo[LEAK_MEMO] = '1'; }
    // (the far wall: up till the bulldozer's through it)
    if (!memo(state, LEAK_MEMO)) o.farWall = solid(state, X(FAR_WALL), GY - 1300, x1 - X(FAR_WALL), 1400, { hidden: true, tag: 'warehouse-far' });
    ENEMIES.forEach(([kind, rx, h], i) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 7 + rx) % 17;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `warehouse-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    // (the big health and ammo, before the main stage)
    state.pickups.push(
      { id: 'warehouse-health', pos: { x: X(REFILL) - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'warehouse-ammo', pos: { x: X(REFILL) + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
  },
  update: (ctx, controls) => {
    const { state } = ctx, o = whOf(state), p = state.player, E = o.ending;
    if (!controls.up) o.upLatch = false;
    takeLaunch(state);
    updateShots(ctx);
    updateHazards(ctx);
    o.flashes = o.flashes.filter(fl => state.frame - fl.at < 12);
    const burst = updateBurst(ctx);
    if (burst) return burst;
    updateFight(ctx);
    // The last of them dead (or back in after it, the bulldozer still parked): the ending
    if (castDone(state) && !leaked(state) && E.phase === 'off' && p.health > 0 && p.pos.x > X(ARENA.a)) { if (++E.t > 50) startEnding(state); }
    const ending = updateEnding(ctx);
    if (ending) return ending;
    if (p.health <= 0) return controls;
    const rx = R(p.pos.x + p.width / 2);
    const busy = () => !!o.ad || o.adBusy;
    if (!p.inCutscene) for (const [a, b, k] of GAGS) if (rx > a && rx < b && !o.said[k] && !busy()) { o.said[k] = true; meatheadSays(state, pickLine(GAG_LINES[k]), true); }
    if (rx > 4700 && !o.said.adSteve && !busy()) { o.said.adSteve = true; adSay(state, AD_STEVE, undefined, false); }
    // (the script's laser grid: walk into it and the alarm goes)
    const inGrid = !caseDown(state) && Math.abs(p.pos.x + p.width / 2 - X(CASE_X)) < 150 && p.pos.y + p.height > GY - 40;
    if (inGrid && !o.said.alarmOn) { o.said.alarmOn = true; o.alarm = 90; playSound('alarm', 0.6, 2); }
    if (!inGrid) o.said.alarmOn = false;
    if (o.alarm > 0) o.alarm--;
    // The ways out: back off the left end (the coaster's stop 3); through the far wall once it's open (the lot)
    if (!endingOn(state)) runExits(state, endExits('warehouse').filter(e => e.to === DOORS.coaster.end || (leaked(state) && e.to === DOORS.lot.start)));
    return controls;
  },
  drawBackdrop: (c, state) => drawWarehouseBackdrop(c, state),
  drawBack: (c, state) => {
    drawWarehouseBack(c, state);
    drawHazards(c, state);
    drawFightBack(c, state);
    drawEndingBack(c, state);
  },
  drawFront: (c, state) => {
    const o = whOf(state), f = state.frame, cam = state.camera.x;
    drawShots(c, state);
    drawFightFront(c, state, saidOver);
    drawEndingFront(c, state);
    for (const fl of o.flashes) flash(c, fl.x, fl.y, f - fl.at);
    // Who's saying what: the crew and the cast over their heads, the crowd over the fallen wall, the AD up top
    for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0 && e.pos.x > x0 - 200 && e.pos.x < x1 + 200) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, e.kind === 'm2:hww_actor' ? '#FBCFE8' : '#BFDBFE', 220); }
    if (o.crowd) saidOver(c, o.crowd.s.text, Math.max(cam + 120, Math.min(cam + CANVAS_WIDTH - 120, o.crowd.x)), BACK_Y - 90, '#F5F5F4', 240);
    if (o.ad && state.player.pos.x > x0 - 400 && state.player.pos.x < x1 + 400) saidOver(c, o.ad.text, cam + CANVAS_WIDTH / 2, state.camera.y + 110, '#FDE047', 320);
  },
  drawHud: (c, state) => {
    drawFightHud(c, state);
    drawEndingHud(c, state);
    drawBurstHud(c, state);
    const o = whOf(state);
    if (o.alarm > 0 && o.alarm % 20 < 10) { c.fillStyle = 'rgba(239, 68, 68, 0.12)'; c.fillRect(0, 0, CANVAS_WIDTH, 600); }
  },
  cameraX: (state) => fightCam(state),
  outdoors: (state) => (whOf(state).ending.phase === 'lot' ? 1 : 0.5),
  lamps: () => warehouseLamps(),
  wires: () => WIRES,
};
