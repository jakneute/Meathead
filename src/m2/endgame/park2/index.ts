// THE WATER PARK, level 2: THE LAZY RIVER (the owner's brief, 2026-11-05). The same engine stage as level 1 (one
// continuous run: park1/index.ts hands everything past level 1's splashdown over to this), from the gate building on
// past the Everest splash pool, through the burning river, to Satan's other son in his grotto, and out the far side to
// level 3's stub.
//
//   meet.ts     the son, at the river's head: the cutscene, the river going up
//   vines.ts    Jungle Land's vines, harder: over the fire, in chains, catching fire and snapping
//   logs.ts     Wilderness Land's rolling logs, burning away under him; the footbridges sagged low across (duck)
//   towers.ts   Cartoon Land's swaying stack-towers (the TIKI TOWERS), burning away
//   fire.ts     the burning river (touched: dead), the jets up out of it, the patches, what's thrown
//   kinds.ts    his crew (the burnouts), the imps; level 1's possessed and aliens too
//   boss.ts     MEHPHISTO in SKULL GROTTO (Soulsborne tells), his brother BRATHAZAR at half (two on one)
//   end.ts      both down: the pretzel float, the beer, down the river on them (VICTORY timed to the landing), control back
//   art.ts      the look; geo.ts where everything is; lines.ts what's said
//
// The checkpoints (geo.ts CP2): saved at each (endgame/stages.ts park2's list; park3's, past the grotto). A file's
// CONTINUE puts him at its level's very start (level 2's: the splashdown; level 3's: the stub).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, topBand } from '../../../m1/constants';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { setUi, goTo, setStartCheckpoint } from '../../store';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { MH_DOOR3 } from '../park3/lines';
import { markBossFight } from '../../bossQuiet';
import { lay, solid, meatheadSays, saidOver } from '../../adventure/section';
import { byPants } from '../park1/kinds';
import { GY, DECKS, DECK_DY, GAPS, RIVER, floorDy, gapAt, RIVER_BED, CP2, CP2_AT, CAST2, PICKUPS2, GROTTO, L3, L2_FROM, HEAD, LOGS2, TOWERS2 } from './geo';
import { updateFire, drawRiver, drawJets, drawPatches, drawShots2, extraPatches, clearFire } from './fire';
import { newVines2, updateVines2, drawVines2, onVine2, type Vines2 } from './vines';
import { buildLogs2, updateLogs2, updateBeams, drawLogs2, drawBeamsBack, drawBeamsFront, logUnder2, logStage, type Log2Run } from './logs';
import { buildTowers2, updateTowers2, drawTowers2, onTower2, towerStage, type Tower2Run } from './towers';
import { makeCast2, drawBarks2 } from './kinds';
import { newMeet, updateMeet, drawMeet, drawMeetHud, meetOn, meetFront, meetSeen, type Meet } from './meet';
import { type Fight2, startFight2, updateFight2, drawFight2, drawFight2Hud, resetFight2, BEANBAG_X, SON_HP } from './boss';
import { type EndScene, startEnd, updateEnd, drawEnd, drawEndHud, drawEndAfter, endOn } from './end';
import { drawBack2, drawFront2, drawBackdrop2, lamps2 } from './art';
import * as L from './lines';
import { contactSheet } from './sheet';
import { newHeat, updateHeat, heatOff, plumeSounds, drawShimmer, drawPlumes, drawNullPop, CRATE, type Heat } from './steam';
import './lavaDeath';
import { setPiece } from '../../upgrades/state';
import { keepForRevisits } from '../../store';
import { DEMON_NUTLESS } from '../../spooky/hell/demon';

export interface Park2 {
  meet: Meet; vines: Vines2; logs: Log2Run[]; towers: Tower2Run[];
  fightState: 'wait' | 'on' | 'won'; f: Fight2 | null;
  /** The son's dead (the hour's on, the file's at level 3). */
  killed: boolean;
  /** After him: Meathead's line, VICTORY, then control back. */
  end: EndScene | null;
  /** What last burned away under him (a log, a tower, a vine) and when: the river's death names it. */
  cause: { src: string; at: number } | null;
  said: Record<string, boolean>; lineAt: Record<string, number>;
  /** The grotto's back (open after: the way on), its door (kicked in). */
  backOpen: number; door: number;
  /** Level 3's way in (the MAINTENANCE door at the river's end): frames into him opening it and going in (-1 not yet). */
  l3door: number;
  /** The lava's heat: over it (or in a plume's steam) his power's nulled (steam.ts). */
  heat: Heat;
  onSave?: () => void;
}

/** Is he in level 2's world (past level 1's splashdown, out of its pool)? */
export const inLevel2 = (state: GameState) => state.player.pos.x + state.player.width / 2 >= L2_FROM;

const once = (p2: Park2, k: string, go: () => void) => { if (!p2.said[k]) { p2.said[k] = true; go(); } };
const mhSay = (state: GameState, p2: Park2, k: string, lines: string[] | L.ByPants, gap = 45000) => {
  const now = performance.now();
  if (now - (p2.lineAt[k] ?? -1e9) < gap || isTalking()) return;
  p2.lineAt[k] = now;
  meatheadSays(state, pickLine(Array.isArray(lines) ? lines : byPants(state, lines)), false);
};

/** Level 2's world, laid down (park1's build calls it): its decks, the river's bed, the grotto's walls, the cast and
 *  the pickups (none at or near where he starts: safe-checkpoints). `cp`: the checkpoint he starts at. */
export const buildPark2 = (state: GameState, cp: number, onSave: () => void): Park2 => {
  resetFight2(); clearFire(state);
  lay(state, DECKS.map(([a, b], i) => ({ x1: a, y1: GY + (DECK_DY[i] ?? 0), x2: b, y2: GY + (DECK_DY[i] ?? 0), surface: 'hard' as const })));
  // (the river's bed, hidden: where a body comes to rest, in the flames)
  for (const g of GAPS) solid(state, g.a, RIVER_BED + g.water, g.b - g.a, 400, { hidden: true, tag: 'wp2-bed' });
  // (the crate stood by the oasis's tall vent: steam.ts)
  solid(state, CRATE.x, GY + floorDy(CRATE.x) - CRATE.h, CRATE.w, CRATE.h, { hidden: true, tag: 'wp2-crate' });
  for (const b of state.blocks) if (!b.tag) b.hidden = true;
  const killed = cp >= CP2.L3;
  // (the grotto's door (a board in the cave's mouth: walk up to it), its back wall (shut till he's dead), level 3's shut
  // way on)
  if (!killed) solid(state, GROTTO.R, GY - 700, 60, 760, { hidden: true, tag: 'wp2-back' });
  solid(state, L3.wall, GY - 2000, 60, 3000, { hidden: true, tag: 'wp2-l3' });
  const doorDown = killed || state.stageMemo['m2:boss-intro:mehphisto'] === '1';
  if (!doorDown) solid(state, GROTTO.door - 62, GY - 200, 14, 200, { hidden: true, tag: 'wp2-door' });
  const at0 = CP2_AT[cp] ?? CP2_AT[CP2.start];
  CAST2.forEach(([who, x, y], i) => {
    if (killed && x < GROTTO.R) return;
    if (cp > CP2.start && x > at0.x - 700 && x < at0.x + 360) return;
    state.enemies.push(makeCast2(who, x, y + floorDy(x), i));
  });
  for (const [x, y0, type] of PICKUPS2) { const y = y0 + floorDy(x); state.pickups.push({ id: `wp2-${x}-${y0}`, pos: { x: x - 10, y: y - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 }); }
  const p2: Park2 = {
    meet: newMeet(cp >= CP2.river || meetSeen(state)), vines: newVines2(), logs: buildLogs2(state), towers: buildTowers2(state),
    fightState: killed ? 'won' : 'wait', f: null, killed, end: null, cause: null, said: {}, lineAt: {},
    backOpen: killed ? 1 : 0, door: doorDown ? 1 : 0, l3door: -1, heat: newHeat(),
  };
  heatOff(p2.heat);
  if (import.meta.env.DEV && typeof window !== 'undefined') { const w = window as unknown as Record<string, unknown>; w.__wp2 = p2; w.__wp2Sheet = contactSheet; w.__wp2Hands = () => setPiece('hands', true); w.__wp2Nutless = (on: boolean) => keepForRevisits(DEMON_NUTLESS, on ? '1' : null); w.__wp2Win = () => { if (p2.f) { p2.killed = true; p2.end = startEnd(p2.f); } }; }
  if (cp > CP2.start) { p2.said.vine = true; }
  if (cp >= CP2.logJam) p2.said.log = true;
  if (cp >= CP2.tiki) p2.said.tower = true;
  p2.onSave = onSave;
  camDy = camTarget(at0.x);
  return p2;
};
let onKilledHook: ((state: GameState) => void) | null = null;
/** (park1's index) What else goes on when the son dies: the hour, the file. */
export const setPark2Killed = (fn: (state: GameState) => void) => { onKilledHook = fn; };

/** A frame of level 2 (park1's update hands over to it here). `save`: the checkpoint's his (it's saved). */
export const updatePark2 = (ctx: FrameContext, p2: Park2, controls: Controls, save: (cp: number) => void): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  easeCam(state);
  let out = controls;
  // ---- both down: the end (they run, the pretzel, the beer, down the river on them: VICTORY), then control back
  if (p2.end && p2.f) {
    heatOff(p2.heat);
    const e = p2.end;
    out = updateEnd(ctx, e, p2.f, () => { p2.backOpen = 1; state.blocks = state.blocks.filter(b => b.tag !== 'wp2-back'); });
    if (!endOn(e)) { p2.fightState = 'won'; p2.end = null; setUi({ introCutscene: false }); state.cameraMinX = GROTTO.R - 400; state.cameraMaxX = L3.wall + 120 - CANVAS_WIDTH; return controls; }
    setUi({ introCutscene: true });
    state.cameraMinX = GROTTO.L; state.cameraMaxX = L3.wall + 200;
    return out;
  }
  // ---- the grotto's fight
  if (p2.fightState === 'on' && p2.f) {
    heatOff(p2.heat);
    const f = p2.f;
    markBossFight(state, 'mehphisto', { l: GROTTO.L, r: GROTTO.R });
    out = updateFight2(ctx, f, controls, () => {
      // (both down: the son's dead (the hour goes on (12), and the file's at level 3); the end's cutscene)
      p2.killed = true;
      onKilledHook?.(state);
      p2.onSave?.();
      p2.end = startEnd(f);
    });
    p2.door = f.door;
    const lo = GROTTO.door - 100, hi = GROTTO.R - 4 - p.width;
    if (p.pos.x < lo && f.mode !== 'intro') { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
    if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
    state.cameraMinX = GROTTO.L; state.cameraMaxX = GROTTO.L;
    updateFire(ctx, { riverOn: false, cause: () => null, jetsOn: false });
    setUi({ introCutscene: !!p.inCutscene });
    return out;
  }
  // ---- the meeting (at the river's head)
  if (meetOn(p2.meet) || p2.meet.step === 'wait') {
    out = updateMeet(ctx, p2.meet, out);
    if (meetOn(p2.meet)) {
      heatOff(p2.heat);
      updateFire(ctx, { riverOn: false, cause: () => null });
      setUi({ introCutscene: true });
      state.cameraMinX = L2_FROM - 200; state.cameraMaxX = L3.wall;
      return out;
    }
  }
  // ---- the obstacles (before he moves)
  const onGone = (src: string, lines: string[]) => () => { p2.cause = { src, at: state.frame }; mhSay(state, p2, src, lines, 6000); };
  updateTowers2(ctx, p2.towers, onGone('m2:wp2_tower', L.MH_TOWER_GOING));
  out = updateLogs2(ctx, p2.logs, out, onGone('m2:wp2_log', L.MH_LOG_GOING));
  updateBeams(ctx);
  out = updateVines2(ctx, p2.vines, out, onGone('m2:wp2_vine', []));
  // (the lava's heat: over it, or in the steam, his power's nulled; the heat knocks an uppercut's height out of it)
  updateHeat(ctx, p2.heat, p2.l3door < 0 && meetFront(p2.meet) === Infinity, first => mhSay(state, p2, 'null', first ? L.MH_NULL_FIRST : L.MH_NULL, first ? 0 : 20000));
  plumeSounds(state);
  // (what he says the first time each burns under him; going, on the way out)
  const lg = logUnder2(state, p2.logs);
  if (lg) { once(p2, 'log', () => mhSay(state, p2, 'log', L.MH_LOG)); if (logStage(lg).stage === 'crumble') mhSay(state, p2, 'logGoing', L.MH_LOG_GOING, 8000); }
  if (onTower2(state, p2.towers)) { once(p2, 'tower', () => mhSay(state, p2, 'tower', L.MH_TOWER)); const t = p2.towers.find(r => r.t.on); if (t && towerStage(t).stage === 'crumble') mhSay(state, p2, 'towerGoing', L.MH_TOWER_GOING, 8000); }
  if (onVine2(state, p2.vines) && p2.vines.burn.some(b => b && !b.gone && b.t > 6)) once(p2, 'vineBurn', () => mhSay(state, p2, 'vineBurn', L.MH_VINE_BURN));
  // ---- the fire: the river, the jets, the patches, the shots
  const fell = !p.isGrounded && !p.carried && p.vel.y > 0;
  if (fell && p.pos.y + p.height > GY + floorDy(cx) + 10 && RIVER.some(([a, b]) => cx > a && cx < b) && !p2.said.screamAt) { p2.said.screamAt = true; meatheadSays(state, pickLine(L.MH_RIVER), false); }
  if (p.isGrounded) p2.said.screamAt = false;
  updateFire(ctx, { riverOn: true, cause: () => (p2.cause && state.frame - p2.cause.at < 150 ? p2.cause.src : null) });
  // ---- the grotto's door: walked up to (the board's in the way: he walks into it); kicked in, walked in through
  if (p2.fightState === 'wait' && !p2.killed && p.health > 0 && p.isGrounded && !p.inCutscene) {
    const at = p2.door ? GROTTO.door + 20 : GROTTO.door - 70;
    if (cx >= at - p.width / 2) {
      p2.fightState = 'on'; p2.f = startFight2(state);
      state.blocks = state.blocks.filter(b => b.tag !== 'wp2-door');
      if (state.checkpoint < CP2.grotto) save(CP2.grotto);
    }
  }
  // ---- the checkpoints along the way (passing one: it's his, saved there)
  for (const c of [CP2.river, CP2.canopy, CP2.logJam, CP2.bar, CP2.tiki, CP2.soup, CP2.bend, CP2.grotto, CP2.L3]) {
    if (c > state.checkpoint && cx >= CP2_AT[c].x && p.isGrounded && Math.abs(p.pos.y + p.height - GY - floorDy(cx)) < 4 && p.health > 0 && (c !== CP2.L3 || p2.killed)) save(c);
  }
  // ---- what he says on the way (each once; never over anybody)
  if (!p.inCutscene && p.health > 0) {
    if (cx > GROTTO.door - 600 && cx < GROTTO.door - 200) once(p2, 'grotto', () => mhSay(state, p2, 'grotto', L.MH_GROTTO));
  }
  // ---- level 3's way in: the MAINTENANCE door at the river's end, walked up to: he opens it (a beat, no input), his
  // line, in he goes (level 3: endgame/park3, its own stage)
  if (p2.l3door < 0 && p2.killed && p2.fightState === 'won' && cx > L3.wall - 64 && p.isGrounded && !p.inCutscene && p.health > 0) { p2.l3door = 0; state.blocks = state.blocks.filter(b => b.tag !== 'wp2-l3'); meatheadSays(state, pickLine(byPants(state, MH_DOOR3)), true); }
  if (p2.l3door >= 0) {
    p2.l3door++;
    p.inCutscene = true; p.facing = 1; setUi({ introCutscene: true });
    if (p2.l3door === 18) playSound('clang', 0.8, -6);
    if (p2.l3door > 40) { p.carried = true; p.vel.x = 0; p.vel.y = 0; p.pos.x += 1.8; }
    if (p2.l3door === 96) { setStartCheckpoint(0); goTo('park3t'); }
    return { ...NO_CONTROLS };
  }
  // ---- the camera's reach: the whole run (the grotto's back's shut till he's dead: up to it)
  state.cameraMinX = L2_FROM - 400; state.cameraMaxX = (p2.killed ? L3.wall + 120 : GROTTO.R + 20) - CANVAS_WIDTH;
  if (state.cameraOverride) state.cameraOverride = null;
  setUi({ near: null, map: null, nearExit: false, introCutscene: !!p.inCutscene });
  return out;
};

/** The camera's height in level 2: held steady over the decks (the river's flames along the bottom of the screen, the
 *  vines' beams along the top). */
export const camY2 = () => GY - 470 + Math.round(camDy);
/** (the camera's height follows the decks' (the river steps up and down: geo.ts DECK_DY), eased) */
let camDy = 0;
const camTarget = (x: number) => { const g = gapAt(x); return g ? (g.dyL + g.dyR) / 2 : floorDy(x); };
const easeCam = (state: GameState, snap = false) => { const t = camTarget(state.player.pos.x + state.player.width / 2); camDy = snap ? t : camDy + (t - camDy) * 0.05; };

/** The building at the gate (it's level 1's art) and level 2's door. */
export const level2Door = (p2: Park2) => p2.door;

// ---------------------------------------------------------------------------------------------------------------
// Drawing

export const drawBackdrop2Over = (c: CanvasRenderingContext2D, state: GameState) => { if (state.camera.x + CANVAS_WIDTH > L2_FROM) drawBackdrop2(c, state); };
export const drawPark2Back = (c: CanvasRenderingContext2D, state: GameState, p2: Park2) => {
  const front = meetFront(p2.meet);
  drawBack2(c, state, { door: p2.door, backOpen: p2.backOpen, inGrotto: p2.fightState === 'on' || !!p2.end, beanbag: BEANBAG_X }, () => {
    drawBeamsBack(c, state);
    drawRiver(c, state, front);
    if (front === Infinity) drawShimmer(c, state, GAPS);
    drawJets(c, state);
  }, () => {
    drawPatches(c, state, extraPatches(state));
    drawLogs2(c, state, p2.logs);
    drawTowers2(c, state, p2.towers);
    drawPlumes(c, state);
    drawVines2(c, state, p2.vines);
  });
  // (level 3's door, opening: the dark doorway, the door swung in on its hinge; him going in through it)
  if (p2.l3door > 0) drawL3Door(c, state, p2.l3door);
  drawMeet(c, state, p2.meet);
  if (p2.end && p2.f) drawEnd(c, state, p2.end, p2.f);
  else if (p2.f && p2.fightState === 'on') drawFight2(c, state, p2.f);
  if (p2.killed && !endOn(p2.end)) drawEndAfter(c, state);
};
export const drawPark2Front = (c: CanvasRenderingContext2D, state: GameState, p2: Park2) => {
  drawBeamsFront(c, state);
  drawFront2(c, state);
  drawShots2(c, state);
  drawNullPop(c, state, p2.heat);
  drawBarks2(c, state, saidOver);
  void p2;
};
export const drawPark2Hud = (c: CanvasRenderingContext2D, state: GameState, p2: Park2) => {
  drawMeetHud(c, p2.meet);
  if (p2.f && p2.fightState === 'on') drawFight2Hud(c, state, p2.f, topBand());
  if (p2.end && endOn(p2.end)) drawEndHud(c, p2.end);
};
export const lights2 = lamps2;
/** The MAINTENANCE door (park2/art.ts paints it shut at L3.wall + 10, 90 wide, 170 tall), opening. */
const drawL3Door = (c: CanvasRenderingContext2D, state: GameState, t: number) => {
  const dx = L3.wall + 10, dw = 90, dh = 170, k = Math.min(1, Math.max(0, (t - 14) / 20));
  c.fillStyle = '#05070A'; c.fillRect(dx, GY - dh, dw * k, dh);
  c.fillStyle = '#1A1E24'; for (let y = GY - dh + 20; y < GY; y += 30) c.fillRect(dx + 4, y, dw * k - 8, 2);
  // (the door itself, swung in: foreshortened to a slab at its hinge)
  const w = Math.max(6, dw * (1 - k)); c.fillStyle = '#4B5563'; c.fillRect(dx, GY - dh, w, dh); c.fillStyle = '#9CA3AF'; c.fillRect(dx, GY - dh, 3, dh);
  // (him: gone through it once he's past the frame)
  if (t > 60) state.player.hidden = state.player.pos.x > dx + 10;
};
export { HEAD, SON_HP, LOGS2, TOWERS2, playSound };
