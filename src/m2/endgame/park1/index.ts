// THE WATER PARK, level 1 (the endgame's first, the owner's design): in through the gate he kicked down (endgame/lot),
// the entry plaza and its slides (this level's new mechanic: slides.ts), two tube rides (tube.ts), MOUNT EVEREST BUT
// BETTER's tower (tower.ts) up to THE SUMMIT and the kid (boss.ts), the slide all the way back down (descent.ts),
// VICTORY, and on: level 2's start (a stub, the owner designs it). One continuous run; the hour's 10, 11 from the kid's
// death on (the owner's: "after the kid dies, the hour advances"). Crude first pass (art.ts); the SNES pass later.
//
// Where everything is: geo.ts. The checkpoints (geo.ts CP): saved at each (endgame/stages.ts); a file's CONTINUE puts
// him at the start of the level it's reached (the lot for level 1; the splashdown for level 2).

import type { StageLayout } from '../../../m1/game/stages/index';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { EnemyKind } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE, topBand } from '../../../m1/constants';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { arrived, isLeaving, carryGut, takeGut, setUi, takeStartCheckpoint, setEndgameAt } from '../../store';
import { saveProgress } from '../../save';
import { stopWeapons } from '../../weapons';
import { todLight, setEndgameHour } from '../../timeOfDay';
import { createGrab, updateGrab, drawGrab, type Grab } from '../../moves/grab';
import { sleepFar, wakeNear } from '../../dormant';
import { markBossFight } from '../../bossQuiet';
import { updateSwimAir, drawAir } from '../../frontier/air';
import { setTubeRide } from '../../weapons/tubeRide';
import { lay, solid, ledge, meatheadSays, saidOver } from '../../adventure/section';
import { endgameStage, endgameAtCheckpoint, PARK_STAGE, L3_CP } from '../stages';
import { GY, CP, CP_AT, CP_FLOOR, GROUND, POOLS, LEDGES, ISLANDS, SLIDES, TUBES, TOWER, SUMMIT, PLAZA_CAST, PICKUPS, L2, FLOORS, floorY } from './geo';
import { newSlides, updateSlides, offSlide, type SlideState } from './slides';
import { newTube, boardTube, updateTube, unboardTube, tubeOn, tubeBox, tubeFoesLeft, funnelShot, type TubeRide } from './tube';
import { drawFunnelShot, prebakeFunnelShot, funnelSheet } from './funnel';
import { newTower, buildTower, updateTower, floorOf, towerCamY, climbEase, ROUND, type Tower, type TowerEvents } from './tower';
import { KIND_OF, setRidingCheck, setShotBox, updateShots, drawShots, drawBarks, byPants, clearShots } from './kinds';
import { type Fight, startFight, updateFight, resetFight, fightDead, drawFight, drawFightHud, setOnKilled, doorState } from './boss';
import { type Descent, startDescent, updateDescent, descentDone, drawDescentKid, drawGreenWater, drawDescentHud } from './descent';
import { drawParkBackdrop, drawParkBack, drawParkFront, parkLamps, drawTubeRing, drawTubeHud } from './art';
import * as L from './lines';
import { type Park2, buildPark2, updatePark2, inLevel2, camY2, drawBackdrop2Over, drawPark2Back, drawPark2Front, drawPark2Hud, lights2, setPark2Killed } from '../park2/index';
import { CP2_AT } from '../park2/geo';

export { PARK_STAGE };
const STAGE1 = endgameStage('park1')!, STAGE2 = endgameStage('park2')!, STAGE3 = endgameStage('park3')!;
/** Where every checkpoint puts him: level 1's (geo.ts) and level 2's (park2/geo.ts). */
const AT: Record<number, { x: number; y: number }> = { ...CP_AT, ...CP2_AT };

interface Park {
  grab: Grab; sl: SlideState; tube: TubeRide; tw: Tower;
  /** The summit's fight: waiting for him, on, or won (the kid's dead). */
  fightState: 'wait' | 'on' | 'won'; f: Fight | null;
  descent: Descent | null;
  said: Record<string, boolean>; lineAt: Record<string, number>;
  /** The tube's controls card: up, how long, armed (a fresh press closes it); seen. */
  card: { t: number; armed: boolean } | null; cardSeen: boolean;
  lostTube: boolean;
  /** How far the tube rides have carried him back round their loops, all told (the backdrop's parallax: art.ts). */
  shift: number;
  /** Where his feet last stood (or rode): the plaza's camera goes up with him up a tall slide's stairs, not his jumps. */
  standY: number;
  /** standY eased (the plaza's camera follows this: a landing or a step up doesn't jolt it). */
  camStand: number;
  /** The kid's dead (the hour's on, the file's at level 2). */
  killed: boolean;
  slideTipT: number;
  greenPool: number;
  /** Level 2 (THE LAZY RIVER, park2/): its own state; on past the splashdown. */
  l2: Park2;
}
const parkOf = (state: GameState) => state.stage as Park | null;
/** The stairs' ramp underfoot: how wide each of its columns is. */
const STAIR_COL = 3;
let devStarted = false;
const DEV_CP = (): number | null => { if (!import.meta.env.DEV || devStarted) return null; devStarted = true; const q = new URLSearchParams(location.search).get('park'); return q !== null ? +q : null; };

const once = (pk: Park, k: string, go: () => void) => { if (!pk.said[k]) { pk.said[k] = true; go(); } };
/** A line of his for a moment (not over anybody: dropped if somebody's talking), no more than once in `gap` ms. */
const mhSay = (state: GameState, pk: Park, k: string, lines: L.ByPants, gap = 45000) => {
  const now = performance.now();
  if (now - (pk.lineAt[k] ?? -1e9) < gap) return;
  pk.lineAt[k] = now;
  meatheadSays(state, pickLine(byPants(state, lines)), true);
};
/** A safe point: the endgame's place on the file (level 1, level 2 once the kid's dead, level 3 once the son is: by the
 *  checkpoint's own stage), saved. */
const savePoint = (state: GameState, pk: Park) => { setEndgameAt({ stage: endgameAtCheckpoint(PARK_STAGE, state.checkpoint)?.id ?? (pk.killed ? STAGE2.id : STAGE1.id), cp: state.checkpoint }); saveProgress(); };

const SLIDE_TIPS = [
  { pad: ['DPAD_RIGHT'], kb: ['@right'], label: 'FASTER' },
  { pad: ['DPAD_LEFT'], kb: ['@left'], label: 'SLOWER' },
  { pad: ['A'], kb: ['@jump'], label: 'AT THE LIP: THROWN HIGHER' },
] as import('../../upgrades/equipInfo').EquipControl[];
// (the owner's "disable all charge moves on the tube slides. just shooting or air grabs"; the cape still works on them,
// unsaid: "Remove mention of the cape in the inner tube tutorial. Let the player find out")
const tubeCardRows = () => [
  { pad: ['A'], kb: ['@jump'], label: 'JUMP, TUBE AND ALL (THE GAPS, LOW SHOTS)' },
  { pad: ['DPAD_DOWN'], kb: ['@down'], label: 'DUCK (HIGH SHOTS, PIPES)' },
  { pad: ['X'], kb: ['@fire'], label: 'SHOOT (ANY GUN: SWITCH AWAY)' },
  { pad: ['A', 'B'], join: '+', kb: ['@airGrab'], label: 'AIR GRAB (WATCH WHERE YOU LAND)' },
] as import('../../upgrades/equipInfo').EquipControl[];
const TUBE_CARD_TEXT = "THE TUBE'S STUCK TO YOUR ASS AND IT GOES ON ITS OWN. THE CHUTE'S GOT HOLES IN IT WITH NO BOTTOM: JUMP THEM. JUST SHOOTING AND AIR GRABS: NO UPPERCUTS, DIVE KICKS, SLIDES, CHARGES, BEATDOWNS OR SHAKEDOWNS. IT KEEPS GOING TILL EVERY ALIEN ON IT'S DEAD.";
const CARD_HOLD = 90;
/** The turning tower's radius at its most (the spiral's middle): about the screen's width across. */
const TOWER_RADIUS = 330;
const NOCYL = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('nocyl');

/** On the spiral, wrapped round: the part of the screen the mountain covers solid (its face and its floors, from the
 *  summit's deck down to base camp's, round as far as the wrap goes), where the sky needn't be put down under it. */
let trueCam: { x: number; y: number } | null = null;
const spiralHole = (state: GameState) => {
  const c = parkOf(state)?.tw?.climb, cyl = c ? parkLayout.cylinder?.(state) : null;
  if (!cyl || state.screenShakeTimer > 0) return null;
  const r = cyl.radius, half = CANVAS_WIDTH / 2, cy = state.camera.y;
  return {
    x0: r >= half ? 0 : Math.ceil(half - r) + 4, x1: r >= half ? CANVAS_WIDTH : Math.floor(half + r) - 4,
    y0: Math.ceil(floorY(FLOORS) + TOWER.DECK - cy) + 10, y1: Math.floor(floorY(0) + TOWER.DECK - cy) - 10,
  };
};

/** Stood on one of the tower's floors under the top, the camera settled on it: the floors (opaque, the whole tower's
 *  width, which is the screen's) cover all of the screen, so no sky's put down under them at all. */
const floorHole = (state: GameState) => {
  const pk = parkOf(state), tw = pk?.tw;
  if (!pk || !tw || tw.climb || tw.settle > 0 || state.screenShakeTimer > 0) return null;
  const k = floorOf(state);
  if (k === null || k < 1 || k > FLOORS - 2) return null;
  if (Math.abs(state.camera.x - TOWER.TL) > 0.01 || Math.abs(state.camera.y - towerCamY(k)) > 2) return null;
  return { x0: 0, x1: CANVAS_WIDTH, y0: 0, y1: CANVAS_HEIGHT };
};

export const parkLayout: StageLayout = {
  left: -260,
  startX: CP_AT[0].x,
  verticalCamera: true,
  startsStanding: true,
  build: (state) => {
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    resetFight(); clearShots(state);
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    { const d = DEV_CP(); if (d !== null) state.checkpoint = d; }
    if (!AT[state.checkpoint]) state.checkpoint = 0;
    const killed = state.checkpoint >= CP.L2;
    setEndgameHour(state.checkpoint >= L3_CP ? STAGE3.hour : killed ? STAGE2.hour : STAGE1.hour);
    // ---- the engine's own boss end (Meathead 1's: its door, its arena's floor, walls and ceiling at BOSS_DOOR_X, 7200 on,
    // and a wall at its stage width): the lands sit out past it (100000 on); the water park's at 0, so it's taken out
    // here (it stood in the Kamikaze's sinkhole). Only the far left wall's kept.
    state.blocks = state.blocks.filter(b => b.x + b.w <= parkLayout.left);
    // ---- the ground: the plaza's runs, the pools' floors (their sides are the runs' ends), the islands, the ledges
    lay(state, GROUND.map(([a, b]) => ({ x1: a, y1: GY, x2: b, y2: GY, surface: 'hard' })));
    lay(state, POOLS.map(p => ({ x1: p.x1, y1: p.bottom, x2: p.x2, y2: p.bottom, surface: 'hard' })));
    for (let i = state.blocks.length - 1; i >= 0; i--) state.blocks[i].hidden = true;
    for (const [x, y, w] of ISLANDS) solid(state, x, y, w, GY + 1400 - y, { hidden: true, tag: 'wp-island' });
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true, tag: 'wp-ledge' });
    // ---- the slides' and tubes' stairs and decks
    for (const S of [...SLIDES, ...TUBES]) {
      // (the owner's: "walking up narrow flights of stairs looks jittery. smooth it out": a solid block a step, he popped up
      // 24 px every few frames (and the camera with him). Underfoot now, a smooth ramp through the treads' middles, cut
      // into thin columns (the engine's own slopes, finer): his feet climb a few px a frame; the steps are still drawn)
      const st = S.stairs, end = st.x + st.n * st.run;
      for (let x = st.x; x < end; x += STAIR_COL) {
        const w = Math.min(STAIR_COL, end - x), y = Math.max(S.deck.y, Math.round(GY - ((x + w / 2 - st.x) / st.run + 0.5) * st.rise));
        solid(state, x, y, w, GY - y, { hidden: true, tag: 'wp-step' });
      }
      if (S.stairs.n > 0) solid(state, S.deck.x1, S.deck.y, S.deck.x2 - S.deck.x1, GY - S.deck.y, { hidden: true, tag: 'wp-deck' });
    }
    // ---- the walls: no way back out the gate (the lot's behind it), base camp's far end, level 2's way on (shut)
    solid(state, -120, -6000, 60, 7000, { hidden: true, tag: 'wp-gate' });
    solid(state, 29900, -400, 60, 1400, { hidden: true, tag: 'wp-basecamp-end' });
    buildTower(state);
    // ---- the cast, the pickups
    // (none at or near where he starts: safe-checkpoints)
    const at0 = AT[state.checkpoint];
    PLAZA_CAST.forEach(([who, x, y], i) => {
      if (state.checkpoint > 0 && x > at0.x - 700 && x < at0.x + 300) return;
      const e = makeKindEnemy(KIND_OF[who] as EnemyKind, x, y);
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = (i * 7 + Math.floor(x / 10)) % 23;
      state.enemies.push(e);
    });
    for (const [x, y, type] of PICKUPS) state.pickups.push({ id: `wp-${x}-${y}`, pos: { x: x - 10, y: y - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    const pk: Park = {
      grab: createGrab(state), sl: newSlides(), tube: newTube(), tw: newTower(state.checkpoint >= CP.L2 ? CP_FLOOR[CP.L2] : CP_FLOOR[state.checkpoint] ?? (state.checkpoint >= CP.baseCamp ? 1 : 0)),
      fightState: killed ? 'won' : 'wait', f: null, descent: null, said: {}, lineAt: {}, card: null, cardSeen: false, lostTube: false, shift: 0, standY: GY, camStand: GY, killed,
      slideTipT: 0, greenPool: killed ? 1 : 0,
      l2: null as unknown as Park2,
    };
    // (level 2's world, on past the splashdown (park2/): its decks, river, cast; the son's death moves the hour on and
    // the file to level 3)
    pk.l2 = buildPark2(state, state.checkpoint, () => { state.checkpoint = L3_CP; savePoint(state, pk); });
    setPark2Killed(() => { setEndgameHour(STAGE3.hour); });
    // (past a tube's or the tower's checkpoint: what's behind it's been done; said already)
    if (state.checkpoint >= CP.blackHole) pk.cardSeen = true;
    if (state.checkpoint > 0) { pk.said.in = true; pk.said.possessed = true; }
    if (state.checkpoint >= CP.twister) pk.said.slide = true;
    if (state.checkpoint >= CP.baseCamp) pk.said.everest = true;
    state.stage = pk;
    setRidingCheck(s => { const q = parkOf(s); return !!q && tubeOn(q.tube); });
    setTubeRide(s => { if (s.stageId !== PARK_STAGE) return null; const q = parkOf(s); return q?.tube?.mode === 'ride' ? { speed: TUBES[q.tube.i].speed } : null; });
    setShotBox(s => { const q = parkOf(s); return q && tubeOn(q.tube) ? tubeBox(s, q.tube) : { x: s.player.pos.x, y: s.player.pos.y + (s.player.isDucking ? 24 : 0), w: s.player.width, h: s.player.height - (s.player.isDucking ? 24 : 0) }; });
    setOnKilled(s => {
      const q = parkOf(s);
      if (!q) return;
      // (the owner's: "after the kid dies, the hour advances"; and the file's past level 1: CONTINUE's level 2's start)
      q.killed = true;
      setEndgameHour(STAGE2.hour);
      setEndgameAt({ stage: STAGE2.id, cp: CP.L2 }); saveProgress();
    });
    // ---- him, where he starts
    const p = state.player, at = AT[state.checkpoint];
    p.pos = { x: at.x - p.width / 2, y: at.y - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1;
    p.noSpecials = false; p.carried = false; p.logSeat = false; p.tubeSit = null; p.kickPose = 0; p.inCutscene = false;
    setUi({ noSwitch: false, pauseControls: null, introCutscene: false, chordTips: null, minigameCard: null });
    state.camera.x = at.x - CANVAS_WIDTH / 2;
    const k = state.checkpoint >= CP.camp2 && state.checkpoint < CP.L2 ? CP_FLOOR[state.checkpoint] : null;
    state.camera.y = k !== null ? towerCamY(k) : state.checkpoint >= CP.L2 ? camY2() : at.y - 550;
    // (a safe point: on the file)
    savePoint(state, pk);
    sleepFar(state);
    return { x: at.x, y: at.y };
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const pk = parkOf(state);
    if (import.meta.env.DEV) { const w = window as unknown as Record<string, unknown>; w.__wpFunnelSheet = funnelSheet; }
    if (import.meta.env.DEV) { (window as unknown as { __m2: GameState }).__m2 = state; (window as unknown as { __wp: unknown }).__wp = pk; (window as unknown as { __wpProbe: () => unknown }).__wpProbe = () => { const q = state.player, x = q.pos.x + q.width / 2, f = q.pos.y + q.height; return [x | 0, f | 0, +q.vel.x.toFixed(1), +q.vel.y.toFixed(1), q.isGrounded, state.blocks.filter(b => x >= b.x && x <= b.x + b.w && Math.abs(b.y - f) < 6).map(b => `${b.tag}:${b.type}:${b.x},${b.y},${b.w}`)]; }; }
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!pk) return controls;
    wakeNear(state);
    // (the pools, the lagoon and the tube rides' splash pools: real water, he swims in it; his air goes while he's under)
    updateSwimAir(ctx, (x, y) => parkLayout.waterBodyAt!(state, x, y));
    const p = state.player, cx = p.pos.x + p.width / 2;
    if (p.isGrounded || p.carried) pk.standY = p.pos.y + p.height;
    // (a stage built before this field existed (the dev tab's hot reload) has none: NaN would take the camera with it)
    if (!Number.isFinite(pk.camStand)) pk.camStand = pk.standY;
    pk.camStand += (pk.standY - pk.camStand) * 0.2;
    if (Math.abs(pk.standY - pk.camStand) < 0.5) pk.camStand = pk.standY;
    updateShots(ctx);
    let out: Controls = controls;
    // ---- the descent (the kid's dead): no input, no HUD, then VICTORY; then he's his again
    if (pk.descent) {
      out = updateDescent(ctx, pk.descent, () => { pk.greenPool = 0.01; });
      if (pk.descent.step === 'thrown' || pk.descent.step === 'line' || pk.descent.step === 'victory') pk.greenPool = Math.max(pk.greenPool, pk.descent.pool);
      if (descentDone(pk.descent)) {
        pk.descent = null; pk.greenPool = 1;
        p.inCutscene = false; p.untouchable = false; p.carried = false; p.logSeat = false; p.tubeSit = null; p.spriteRot = 0;
        state.cameraOverride = null;
        state.checkpoint = CP.L2; savePoint(state, pk);
      }
      setUi({ introCutscene: true });
      return out;
    }
    // ---- level 2 (past the splashdown, out of its pool): park2's
    if (pk.killed && pk.l2 && inLevel2(state)) {
      out = updatePark2(ctx, pk.l2, controls, cp => { state.checkpoint = cp; savePoint(state, pk); });
      return updateGrab(ctx, pk.grab, out);
    }
    // ---- the summit's fight
    if (pk.fightState === 'on' && pk.f) {
      const f = pk.f;
      markBossFight(state, 'zorzarblax', { l: SUMMIT.L, r: SUMMIT.R });
      out = updateFight(ctx, f, controls);
      // (held in: the summit's ends)
      const lo = SUMMIT.L + 4, hi = SUMMIT.R - 4 - p.width;
      if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
      if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
      state.cameraMinX = SUMMIT.L; state.cameraMaxX = SUMMIT.L;
      if (fightDead(f)) { pk.fightState = 'won'; pk.descent = startDescent(); }
      setUi({ introCutscene: !!p.inCutscene });
      return updateGrab(ctx, pk.grab, out);
    }
    // ---- the tube rides
    if (pk.tube.mode === 'card' && pk.card) {
      pk.card.t++;
      const any = !!(controls.jump || controls.special || controls.shoot || controls.left || controls.right || controls.up || controls.down);
      if (!pk.card.armed && pk.card.t > CARD_HOLD && !any) { pk.card.armed = true; setUi({ minigameCard: { title: 'THE TUBE', rows: tubeCardRows(), text: TUBE_CARD_TEXT, ready: true } }); }
      if (pk.card.armed && any) { pk.card = null; setUi({ minigameCard: null }); playSound('menuok', 0.6); pk.tube.mode = 'ride'; mhSay(state, pk, 'tube', L.MH_TUBE, 20000); }
    }
    if (tubeOn(pk.tube)) {
      out = updateTube(ctx, pk.tube, controls, {
        onEnd: () => { mhSay(state, pk, 'tubeDone', L.MH_TUBE_DONE, 30000); },
        // (a missed jump: down a gap, tube and all, into the dark)
        onFall: () => { pk.lostTube = true; meatheadSays(state, pickLine(L.MH_FALL), false); },
        onClear: () => { mhSay(state, pk, 'tubeClear', L.MH_TUBE_CLEAR, 20000); },
      });
      pk.shift = pk.tube.shift;
      // (the funnel at the Abyss's end: a cutscene, no HUD; its top-down shot baked ahead, on the ride's last stretch)
      setUi({ introCutscene: pk.tube.mode === 'card' || pk.tube.mode === 'funnel' });
      if (pk.tube.mode === 'ride' && pk.tube.cleared && TUBES[pk.tube.i].funnel) prebakeFunnelShot();
      return updateGrab(ctx, pk.grab, out);
    }
    // (onto a tube: walked off the rack's deck into the chute's mouth (that deck's own end: the Abyss's stairs go up past
    // the Black Hole's deck height, far off to its right, and used to put him on the Black Hole))
    if (!p.inCutscene && p.health > 0 && p.isGrounded) TUBES.forEach((T, i) => {
      if (Math.abs(p.pos.y + p.height - T.deck.y) < 4 && cx > T.deck.x2 - 36 && cx < T.deck.x2 + 12 && controls.right && !tubeOn(pk.tube)) {
        offSlide(state, pk.sl);
        const card = !pk.cardSeen;
        boardTube(state, pk.tube, i, card);
        if (card) { pk.cardSeen = true; pk.card = { t: 0, armed: false }; setUi({ minigameCard: { title: 'THE TUBE', rows: tubeCardRows(), text: TUBE_CARD_TEXT, ready: false } }); }
        else mhSay(state, pk, 'tube', L.MH_TUBE, 20000);
        // (its checkpoint: back here, at the rack)
        const cp = i === 0 ? CP.blackHole : CP.abyss;
        if (state.checkpoint < cp) { state.checkpoint = cp; savePoint(state, pk); }
      }
    });
    if (tubeOn(pk.tube)) return { ...NO_CONTROLS };
    // ---- the tower
    const ev: TowerEvents = {};
    out = updateTower(ctx, pk.tw, out, ev);
    if (ev.locked !== undefined) mhSay(state, pk, 'locked', L.MH_LOCKED, 60000);
    if (ev.cleared !== undefined) mhSay(state, pk, 'floorDone', L.MH_FLOOR_DONE, 25000);
    if (ev.arrived !== undefined) {
      const k = ev.arrived;
      const cp = k === 3 ? CP.camp2 : k === 6 ? CP.camp4 : k === 8 ? CP.hillary : null;
      if (cp !== null && state.checkpoint < cp) { state.checkpoint = cp; savePoint(state, pk); }
      if (k === 8) mhSay(state, pk, 'summit', L.MH_SUMMIT, 60000);
      // (up onto the summit, the kid alive: it's on)
      if (k === 9 && pk.fightState === 'wait' && !pk.killed) { pk.fightState = 'on'; pk.f = startFight(state); }
    }
    // ---- the slides
    if (!pk.tw.climb) {
      out = updateSlides(ctx, pk.sl, out, () => { once(pk, 'slide', () => meatheadSays(state, pickLine(byPants(state, L.MH_SLIDE)), true)); if (pk.slideTipT === 0) pk.slideTipT = 1; });
    }
    if (pk.slideTipT > 0) { pk.slideTipT++; setUi({ chordTips: pk.slideTipT < 300 ? SLIDE_TIPS : null }); if (pk.slideTipT >= 300) pk.slideTipT = -1; }
    // ---- the checkpoints along the plaza (passing one: it's his, saved there)
    for (const c of [CP.squirt, CP.twister, CP.lagoon, CP.kamikaze, CP.splash, CP.baseCamp]) {
      if (c > state.checkpoint && cx >= CP_AT[c].x && p.isGrounded && Math.abs(p.pos.y + p.height - GY) < 4 && p.health > 0) { state.checkpoint = c; savePoint(state, pk); }
    }
    // ---- what he says on the way (each once; never over anybody)
    if (!p.inCutscene && p.health > 0 && !isTalking()) {
      if (cx > 360 && cx < 900) once(pk, 'in', () => meatheadSays(state, pickLine(byPants(state, L.MH_IN)), true));
      if (cx > 820 && cx < 1300) once(pk, 'possessed', () => meatheadSays(state, pickLine(byPants(state, L.MH_POSSESSED)), true));
      if (cx > 3300 && cx < 3520) once(pk, 'crater', () => meatheadSays(state, pickLine(byPants(state, L.MH_CRATER)), true));
      if (cx > 4300 && cx < 4500) once(pk, 'pelican', () => meatheadSays(state, pickLine(byPants(state, L.MH_PELICAN)), true));
      if (cx > 27950 && cx < 28500) once(pk, 'everest', () => meatheadSays(state, pickLine(byPants(state, L.MH_EVEREST)), true));
    }
    // ---- the camera: the floor he's on, up the tower (the whole floor in view); on the stairs, him; else the plaza
    const k = floorOf(state);
    if (pk.tw.climb) {
      // (round the spiral: on him, wherever round it he's got to (the tower's face repeats out there: art.ts))
      state.cameraMinX = TOWER.TL - ROUND - 900; state.cameraMaxX = TOWER.TR + ROUND + 900;
      state.cameraOverride = { x: cx - CANVAS_WIDTH / 2, y: p.pos.y + p.height - 400 };
    } else if (pk.tw.settle > 0 && k !== null) {
      // (up: settling back onto the floor's view, not snapped)
      pk.tw.settle--;
      state.cameraMinX = TOWER.TL - ROUND - 900; state.cameraMaxX = TOWER.TR + ROUND + 900;
      state.cameraOverride = { x: TOWER.TL, y: towerCamY(k) };
    } else {
      if (state.cameraOverride) state.cameraOverride = null;
      if (k !== null && k >= 1 && cx > TOWER.TL - 10 && cx < TOWER.TR + 10) { state.cameraMinX = TOWER.TL; state.cameraMaxX = TOWER.TL; }
      else { state.cameraMinX = -200; state.cameraMaxX = (pk.killed ? L2.wall + 120 : TOWER.TR + 40) - CANVAS_WIDTH; }
    }
    setUi({ near: null, map: null, nearExit: false, introCutscene: !!p.inCutscene });
    return updateGrab(ctx, pk.grab, out);
  },
  cameraFixedY: (state) => {
    const pk = parkOf(state);
    if (!pk || pk.tw.climb || pk.tw.settle > 0 || tubeOn(pk.tube) || pk.descent) return undefined;
    if (pk.killed && inLevel2(state)) return camY2();
    const p = state.player, cx = p.pos.x + p.width / 2;
    if (pk.fightState === 'on') return towerCamY(9);
    const k = floorOf(state);
    if (k !== null && k >= 1 && cx > TOWER.TL - 10 && cx < TOWER.TR + 10) return towerCamY(k);
    // (down in a pool: its floor on screen)
    const feet = p.pos.y + p.height, pool = POOLS.find(q => cx > q.x1 - 10 && cx < q.x2 + 10 && feet > q.surface + 4);
    if (pool) return Math.max(GY - 550, pool.bottom + 70 - 600);
    // (the plaza's flat: the camera held steady over it; up a tall slide's or tube's stairs, up with him)
    return Math.min(GY - 550, (Number.isFinite(pk.camStand) ? pk.camStand : pk.standY) - 430);
  },
  waterBodyAt: (_state, x, y) => {
    for (const p of POOLS) if (x >= p.x1 && x <= p.x2 && y >= p.surface - 40 && y <= p.bottom) return { key: p.name, x1: p.x1, x2: p.x2, surface: p.surface, bottom: p.bottom, kind: 'clean' };
    return null;
  },
  deathMessage: (ctx) => {
    const pk = parkOf(ctx.state);
    if (pk?.lostTube) { pk.lostTube = false; return pickLine(L.TUBE_DEATH); }
    return undefined;
  },
  // (the owner's: "when going up the stairs on each level of the mount everest ride, do a 'rotating tower' effect like the
  // hurricane effect in meathead one until it 'settles' it only rotates when going up the spiral stairs": round the
  // spiral, the world's wrapped round a cylinder, eased in off the floor and back out onto the next (stepped, so the
  // engine's wrap is worked out a few times, not every frame); flat everywhere else)
  cylinder: (state) => {
    const c = parkOf(state)?.tw?.climb;
    if (!c || NOCYL) return null;
    const e = Math.round(climbEase(c) * 24) / 24;
    return e < 0.04 ? null : { radius: Math.round(TOWER_RADIUS / e) };
  },
  drawBackdrop: (c, state) => {
    // (round the spiral and settling off it: the camera's drawn from whole device pixels (it's easing after him, between
    // pixels nearly every frame, and every stamp put down between pixels is smoothed: several times the cost without a
    // GPU, for a softening nobody sees); put back after the frame's drawn (drawHud), so the easing's untouched)
    const tw = parkOf(state)?.tw;
    if (tw && (tw.climb || tw.settle > 0)) {
      trueCam = { x: state.camera.x, y: state.camera.y };
      state.camera.x = Math.round(state.camera.x * RENDER_SCALE) / RENDER_SCALE; state.camera.y = Math.round(state.camera.y * RENDER_SCALE) / RENDER_SCALE;
    }
    const out = drawParkBackdrop(c, state, parkOf(state)?.shift ?? 0, spiralHole(state) ?? floorHole(state));
    if (parkOf(state)?.killed) drawBackdrop2Over(c, state);
    return out;
  },
  lighting: (state) => todLight(parkOf(state)?.killed && state.camera.x + CANVAS_WIDTH > 37400 ? [...parkLamps(state), ...lights2(state)] : parkLamps(state), 1),
  drawBack: (c, state) => {
    const pk = parkOf(state);
    const tw = pk?.tw;
    drawParkBack(c, state, { gates: tw?.gate ?? [], tells: tw?.tells ?? [], locked: tw?.locked ?? null, door: pk?.f ? doorState(pk.f) : pk?.killed ? 1 : 0, greenPool: pk?.greenPool ?? 0, climb: tw?.climb ? { k: tw.climb.k, e: climbEase(tw.climb) } : null, spiral: !!tw && (!!tw.climb || tw.settle > 0), descent: !!pk && (!!pk.descent || pk.killed) }, () => {
      if (pk) drawGreenWater(c, state, pk.descent, pk.killed);
    });
    if (!pk) return;
    // (the kid: up there; dead in the slide's mouth, on the way down, floating in the pool)
    if (pk.f && pk.fightState === 'on') { drawFight(c, state, pk.f); if (pk.f.death && (pk.f.death.step === 'flop' || pk.f.death.step === 'done')) drawDescentKid(c, null, true); }
    if (pk.fightState === 'won' && (pk.descent || pk.killed)) drawDescentKid(c, pk.descent, !pk.descent);
    // (the tube's back half, behind him)
    const T = pk.tube;
    if (tubeOn(T) && !state.player.hidden) { state.player.facing = 1; drawTubeRing(c, state, TUBES[T.i].id, false); }
    // (on the stairs: drawn stood (he's walking up them))
    if (pk.tw.climb) state.player.isGrounded = true;
    // (level 2's world)
    if (pk.l2 && state.camera.x + CANVAS_WIDTH > 37400) drawPark2Back(c, state, pk.l2);
  },
  drawFront: (c, state) => {
    const pk = parkOf(state);
    drawParkFront(c, state, pk?.greenPool ?? 0, !!pk && (!!pk.descent || pk.killed));
    if (!pk) return;
    const T = pk.tube;
    if (tubeOn(T) && !state.player.hidden) drawTubeRing(c, state, TUBES[T.i].id, true);
    drawShots(c, state);
    if (pk.l2 && state.camera.x + CANVAS_WIDTH > 37400) drawPark2Front(c, state, pk.l2);
    drawAir(c, state);
    drawBarks(c, state, saidOver);
    drawGrab(c, state, pk.grab);
  },
  drawHud: (c, state) => {
    if (trueCam) { state.camera.x = trueCam.x; state.camera.y = trueCam.y; trueCam = null; }
    const pk = parkOf(state);
    if (!pk) return;
    // (the funnel's top-down shot, over the lot)
    const shot = funnelShot(pk.tube);
    if (shot !== null) { drawFunnelShot(c, shot, state.frame); return; }
    if (pk.f && pk.fightState === 'on') drawFightHud(c, state, pk.f, topBand());
    drawDescentHud(c, pk.descent);
    if (pk.tube.mode === 'ride' || pk.tube.mode === 'fall') drawTubeHud(c, tubeFoesLeft(pk.tube), topBand());
    if (pk.l2) drawPark2Hud(c, state, pk.l2);
  },
};
export const PARK_FLOOR_Y = floorY;
void unboardTube;
