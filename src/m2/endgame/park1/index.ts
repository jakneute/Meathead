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
import { CANVAS_WIDTH, topBand } from '../../../m1/constants';
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
import { lay, solid, ledge, meatheadSays, saidOver } from '../../adventure/section';
import { endgameStage, PARK_STAGE } from '../stages';
import { GY, CP, CP_AT, CP_FLOOR, GROUND, POOLS, LAZY, LEDGES, ISLANDS, SLIDES, TUBES, TOWER, SUMMIT, PLAZA_CAST, PICKUPS, L2, floorY, step } from './geo';
import { newSlides, updateSlides, offSlide, type SlideState } from './slides';
import { newTube, boardTube, updateTube, unboardTube, tubeOn, tubeBox, tubeDucked, type TubeRide } from './tube';
import { newTower, buildTower, updateTower, floorOf, towerCamY, type Tower, type TowerEvents } from './tower';
import { KIND_OF, setRidingCheck, setShotBox, updateShots, drawShots, drawBarks, byPants, clearShots } from './kinds';
import { type Fight, startFight, updateFight, resetFight, fightDead, drawFight, drawFightHud, setOnKilled, doorState } from './boss';
import { type Descent, startDescent, updateDescent, descentDone, drawDescentKid, drawGreenWater, drawDescentHud } from './descent';
import { drawParkBackdrop, drawParkBack, drawParkFront, parkLamps, drawTubeRing } from './art';
import * as L from './lines';

export { PARK_STAGE };
const STAGE1 = endgameStage('park1')!, STAGE2 = endgameStage('park2')!;

interface Park {
  grab: Grab; sl: SlideState; tube: TubeRide; tw: Tower;
  /** The summit's fight: waiting for him, on, or won (the kid's dead). */
  fightState: 'wait' | 'on' | 'won'; f: Fight | null;
  descent: Descent | null;
  said: Record<string, boolean>; lineAt: Record<string, number>;
  /** The tube's controls card: up, how long, armed (a fresh press closes it); seen. */
  card: { t: number; armed: boolean } | null; cardSeen: boolean;
  lostTube: boolean;
  /** The kid's dead (the hour's on, the file's at level 2). */
  killed: boolean;
  slideTipT: number;
  greenPool: number;
}
const parkOf = (state: GameState) => state.stage as Park | null;
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
/** A safe point: the endgame's place on the file (level 1, or level 2 once the kid's dead), saved. */
const savePoint = (state: GameState, pk: Park) => { setEndgameAt({ stage: pk.killed ? STAGE2.id : STAGE1.id, cp: state.checkpoint }); saveProgress(); };

const SLIDE_TIPS = [
  { pad: ['DPAD_RIGHT'], kb: ['@right'], label: 'FASTER' },
  { pad: ['DPAD_LEFT'], kb: ['@left'], label: 'SLOWER' },
  { pad: ['A'], kb: ['@jump'], label: 'AT THE LIP: THROWN HIGHER' },
] as import('../../upgrades/equipInfo').EquipControl[];
const TUBE_CARD_ROWS = [
  { pad: ['DPAD_RIGHT'], kb: ['@right'], label: 'LEAN ON (FASTER)' },
  { pad: ['DPAD_LEFT'], kb: ['@left'], label: 'LEAN BACK (SLOWER)' },
  { pad: ['A'], kb: ['@jump'], label: 'HOP (THE LOW SHOTS)' },
  { pad: ['DPAD_DOWN'], kb: ['@down'], label: 'DUCK (HIGH SHOTS, PIPES)' },
  { pad: ['X'], kb: ['@fire'], label: 'SHOOT' },
] as import('../../upgrades/equipInfo').EquipControl[];
const TUBE_CARD_TEXT = "YOU'RE LOCKED INTO THE TUBE: NOTHING KNOCKS YOU OUT OF IT. BUT THE CHUTE'S BROKEN, AND THE TUBE JUMPS THE GAPS OFF THE RED LIPS. BE UP IN A HOP WHEN IT HITS ONE AND IT GOES WITHOUT YOU.";
const CARD_HOLD = 90;

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
    if (!CP_AT[state.checkpoint]) state.checkpoint = 0;
    const killed = state.checkpoint >= CP.L2;
    setEndgameHour(killed ? STAGE2.hour : STAGE1.hour);
    // ---- the ground: the plaza's runs, the pools' floors (their sides are the runs' ends), the islands, the ledges
    lay(state, GROUND.map(([a, b]) => ({ x1: a, y1: GY, x2: b, y2: GY, surface: 'hard' })));
    lay(state, POOLS.map(p => ({ x1: p.x1, y1: p.bottom, x2: p.x2, y2: p.bottom, surface: 'hard' })));
    for (let i = state.blocks.length - 1; i >= 0; i--) state.blocks[i].hidden = true;
    for (const [x, y, w] of ISLANDS) solid(state, x, y, w, GY + 1400 - y, { hidden: true, tag: 'wp-island' });
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true, tag: 'wp-ledge' });
    // ---- the slides' and tubes' stairs and decks
    for (const S of [...SLIDES, ...TUBES]) {
      for (let i = 0; i < S.stairs.n; i++) { const s = step(S.stairs, i); solid(state, s.x, s.y, s.w, s.h, { hidden: true, tag: 'wp-step' }); }
      if (S.stairs.n > 0) solid(state, S.deck.x1, S.deck.y, S.deck.x2 - S.deck.x1, GY - S.deck.y, { hidden: true, tag: 'wp-deck' });
    }
    // ---- the walls: no way back out the gate (the lot's behind it), base camp's far end, level 2's way on (shut)
    solid(state, -120, -6000, 60, 7000, { hidden: true, tag: 'wp-gate' });
    solid(state, 29900, -400, 60, 1400, { hidden: true, tag: 'wp-basecamp-end' });
    solid(state, L2.wall, -2000, 60, 3000, { hidden: true, tag: 'wp-l2' });
    buildTower(state);
    // ---- the cast, the pickups
    PLAZA_CAST.forEach(([who, x, y], i) => {
      const e = makeKindEnemy(KIND_OF[who] as EnemyKind, x, y);
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = (i * 7 + Math.floor(x / 10)) % 23;
      state.enemies.push(e);
    });
    for (const [x, y, type] of PICKUPS) state.pickups.push({ id: `wp-${x}-${y}`, pos: { x: x - 10, y: y - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    const pk: Park = {
      grab: createGrab(state), sl: newSlides(), tube: newTube(), tw: newTower(CP_FLOOR[state.checkpoint] ?? (state.checkpoint >= CP.baseCamp ? 1 : 0)),
      fightState: killed ? 'won' : 'wait', f: null, descent: null, said: {}, lineAt: {}, card: null, cardSeen: false, lostTube: false, killed,
      slideTipT: 0, greenPool: killed ? 1 : 0,
    };
    // (past a tube's or the tower's checkpoint: what's behind it's been done; said already)
    if (state.checkpoint >= CP.blackHole) pk.cardSeen = true;
    if (state.checkpoint > 0) { pk.said.in = true; pk.said.possessed = true; }
    if (state.checkpoint >= CP.twister) pk.said.slide = true;
    if (state.checkpoint >= CP.baseCamp) pk.said.everest = true;
    state.stage = pk;
    setRidingCheck(s => { const q = parkOf(s); return !!q && tubeOn(q.tube); });
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
    const p = state.player, at = CP_AT[state.checkpoint];
    p.pos = { x: at.x - p.width / 2, y: at.y - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1;
    p.noSpecials = false; p.carried = false; p.logSeat = false;
    setUi({ noSwitch: false, pauseControls: null, introCutscene: false, chordTips: null, minigameCard: null });
    state.camera.x = at.x - CANVAS_WIDTH / 2;
    const k = state.checkpoint >= CP.camp2 && state.checkpoint < CP.L2 ? CP_FLOOR[state.checkpoint] : null;
    state.camera.y = k !== null ? towerCamY(k) : at.y - 550;
    // (a safe point: on the file)
    savePoint(state, pk);
    sleepFar(state);
    return { x: at.x, y: at.y };
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const pk = parkOf(state);
    if (import.meta.env.DEV) { (window as unknown as { __m2: GameState }).__m2 = state; (window as unknown as { __wp: unknown }).__wp = pk; }
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    if (!pk) return controls;
    wakeNear(state);
    const p = state.player, cx = p.pos.x + p.width / 2;
    updateShots(ctx);
    let out: Controls = controls;
    // ---- the descent (the kid's dead): no input, no HUD, then VICTORY; then he's his again
    if (pk.descent) {
      out = updateDescent(ctx, pk.descent, () => { pk.greenPool = 0.01; });
      if (pk.descent.step === 'thrown' || pk.descent.step === 'line' || pk.descent.step === 'victory') pk.greenPool = Math.max(pk.greenPool, pk.descent.pool);
      if (descentDone(pk.descent)) {
        pk.descent = null; pk.greenPool = 1;
        p.inCutscene = false; p.untouchable = false; p.carried = false; p.logSeat = false; p.spriteRot = 0;
        state.cameraOverride = null;
        state.checkpoint = CP.L2; savePoint(state, pk);
      }
      setUi({ introCutscene: true });
      return out;
    }
    // ---- the summit's fight
    if (pk.fightState === 'on' && pk.f) {
      const f = pk.f;
      markBossFight(state, 'ufo', { l: SUMMIT.L, r: SUMMIT.R });
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
      if (!pk.card.armed && pk.card.t > CARD_HOLD && !any) { pk.card.armed = true; setUi({ minigameCard: { title: 'THE TUBE', rows: TUBE_CARD_ROWS, text: TUBE_CARD_TEXT, ready: true } }); }
      if (pk.card.armed && any) { pk.card = null; setUi({ minigameCard: null }); playSound('menuok', 0.6); pk.tube.mode = 'ride'; pk.tube.jumpWas = true; mhSay(state, pk, 'tube', L.MH_TUBE, 20000); }
    }
    if (tubeOn(pk.tube)) {
      out = updateTube(ctx, pk.tube, controls, () => { mhSay(state, pk, 'tubeDone', L.MH_TUBE_DONE, 30000); }, () => {
        // (off the tube: the careless jump. Down into the deep end)
        pk.lostTube = true;
        meatheadSays(state, pickLine(L.MH_LOST_TUBE), false);
        playSound('whoosh', 0.9, -10);
      });
      setUi({ introCutscene: pk.tube.mode === 'card' });
      return updateGrab(ctx, pk.grab, out);
    }
    if (pk.tube.mode === 'lost') { updateTube(ctx, pk.tube, controls, () => {}, () => {}); }
    // (onto a tube: walked off the rack's deck into the chute's mouth)
    if (!p.inCutscene && p.health > 0 && p.isGrounded) TUBES.forEach((T, i) => {
      if (Math.abs(p.pos.y + p.height - T.deck.y) < 4 && cx > T.deck.x2 - 36 && controls.right && !tubeOn(pk.tube)) {
        offSlide(state, pk.sl);
        const card = !pk.cardSeen;
        boardTube(state, pk.tube, i, card);
        if (card) { pk.cardSeen = true; pk.card = { t: 0, armed: false }; setUi({ minigameCard: { title: 'THE TUBE', rows: TUBE_CARD_ROWS, text: TUBE_CARD_TEXT, ready: false } }); }
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
    // ---- the lazy river: shoving him back as he wades it
    if (p.isGrounded && !p.carried && Math.abs(p.pos.y + p.height - GY) < 3 && cx > LAZY.x1 && cx < LAZY.x2) p.pos.x += LAZY.push;
    // ---- the checkpoints along the plaza (passing one: it's his, saved there)
    for (const c of [CP.squirt, CP.twister, CP.lazy, CP.kamikaze, CP.splash, CP.baseCamp]) {
      if (c > state.checkpoint && cx >= CP_AT[c].x && p.isGrounded && Math.abs(p.pos.y + p.height - GY) < 4 && p.health > 0) { state.checkpoint = c; savePoint(state, pk); }
    }
    // ---- what he says on the way (each once; never over anybody)
    if (!p.inCutscene && p.health > 0 && !isTalking()) {
      if (cx > 360 && cx < 900) once(pk, 'in', () => meatheadSays(state, pickLine(byPants(state, L.MH_IN)), true));
      if (cx > 820 && cx < 1300) once(pk, 'possessed', () => meatheadSays(state, pickLine(byPants(state, L.MH_POSSESSED)), true));
      if (cx > 3300 && cx < 3520) once(pk, 'crater', () => meatheadSays(state, pickLine(byPants(state, L.MH_CRATER)), true));
      if (cx > LAZY.x1 && cx < LAZY.x2) once(pk, 'lazy', () => meatheadSays(state, pickLine(byPants(state, L.MH_LAZY)), true));
      if (cx > 4300 && cx < 4500) once(pk, 'pelican', () => meatheadSays(state, pickLine(byPants(state, L.MH_PELICAN)), true));
      if (cx > 27950 && cx < 28500) once(pk, 'everest', () => meatheadSays(state, pickLine(byPants(state, L.MH_EVEREST)), true));
      if (pk.killed && cx > L2.wall - 260) mhSay(state, pk, 'stub', L.MH_STUB, 45000);
    }
    // ---- the camera: the floor he's on, up the tower (the whole floor in view); on the stairs, him; else the plaza
    const k = floorOf(state);
    if (pk.tw.climb) {
      state.cameraMinX = TOWER.TL - TOWER.STAIR - 200; state.cameraMaxX = TOWER.TR + TOWER.STAIR + 200 - CANVAS_WIDTH;
      state.cameraOverride = { x: Math.max(TOWER.TL - 260, Math.min(TOWER.TR + 260 - CANVAS_WIDTH, cx - CANVAS_WIDTH / 2)), y: p.pos.y + p.height - 400 };
    } else {
      if (state.cameraOverride && !pk.tube.lostAt) state.cameraOverride = null;
      if (k !== null && k >= 1 && cx > TOWER.TL - 10 && cx < TOWER.TR + 10) { state.cameraMinX = TOWER.TL; state.cameraMaxX = TOWER.TL; }
      else { state.cameraMinX = -200; state.cameraMaxX = (pk.killed ? L2.wall + 120 : TOWER.TR + 40) - CANVAS_WIDTH; }
    }
    setUi({ near: null, map: null, nearExit: false, introCutscene: !!p.inCutscene });
    return updateGrab(ctx, pk.grab, out);
  },
  cameraFixedY: (state) => {
    const pk = parkOf(state);
    if (!pk || pk.tw.climb || tubeOn(pk.tube) || pk.descent) return undefined;
    const p = state.player, cx = p.pos.x + p.width / 2;
    if (pk.fightState === 'on') return towerCamY(9);
    const k = floorOf(state);
    if (k !== null && k >= 1 && cx > TOWER.TL - 10 && cx < TOWER.TR + 10) return towerCamY(k);
    // (the plaza's flat: the camera held steady over it)
    return GY - 550;
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
  drawBackdrop: (c, state) => drawParkBackdrop(c, state),
  lighting: (state) => todLight(parkLamps(state), 1),
  drawBack: (c, state) => {
    const pk = parkOf(state);
    const tw = pk?.tw;
    drawParkBack(c, state, { gates: tw?.gate ?? [], tells: tw?.tells ?? [], locked: tw?.locked ?? null, door: pk?.f ? doorState(pk.f) : pk?.killed ? 1 : 0, greenPool: pk?.greenPool ?? 0 }, () => {
      if (pk) drawGreenWater(c, state, pk.descent);
    });
    if (!pk) return;
    // (the kid: up there; dead in the slide's mouth, on the way down, floating in the pool)
    if (pk.f && pk.fightState === 'on') { drawFight(c, state, pk.f); if (pk.f.death && (pk.f.death.step === 'flop' || pk.f.death.step === 'done')) drawDescentKid(c, null, true); }
    if (pk.fightState === 'won' && (pk.descent || pk.killed)) drawDescentKid(c, pk.descent, !pk.descent);
    // (the tube's back half, behind him)
    const T = pk.tube;
    if (tubeOn(T) || T.mode === 'lost') drawTubeRing(c, T.x, T.y - 4, T.air ? 0 : (state.player.spriteRot ?? 0), false);
    // (on the stairs: drawn stood (he's walking up them))
    if (pk.tw.climb) state.player.isGrounded = true;
  },
  drawFront: (c, state) => {
    const pk = parkOf(state);
    drawParkFront(c, state);
    if (!pk) return;
    const T = pk.tube;
    if (tubeOn(T) || T.mode === 'lost') drawTubeRing(c, T.x, T.y - 4, T.air ? 0 : (state.player.spriteRot ?? 0), true);
    void tubeDucked;
    drawShots(c, state);
    drawBarks(c, state, saidOver);
    drawGrab(c, state, pk.grab);
  },
  drawHud: (c, state) => {
    const pk = parkOf(state);
    if (!pk) return;
    if (pk.f && pk.fightState === 'on') drawFightHud(c, state, pk.f, topBand());
    drawDescentHud(c, pk.descent);
  },
};
export const PARK_FLOOR_Y = floorY;
void unboardTube;
