// Sawdust Gulch's scenes: the crash's aftermath (the visit of the crash: the engine nosed into the smashed buffer
// stop, steaming; the gawkers; a covered stretcher carried off to FIRST AID: Tucker, never seen, the sheet over him,
// his cap on it), the two fights that shut their doors till they're done (the saloon's brawl, the showdown), what he's
// got to say passing things (once each), and the townsfolk's barks and the announcer's words drawn over them.
//
// The fights: walking into the saloon, the bouncer bars the doors and the shutters (the camera on the room); a wave of
// the saloon's staff, and the next when they're down to one; done, the doors open. The showdown the same in the Wild
// West Show's street: gates shut (SHOW IN PROGRESS), the announcer, the sheriff's line, the fight; done, the gates open,
// the crowd claps. A checkpoint past either has it done; the cast in them is held off (out of sight, or not started)
// till it begins.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind, Block } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { meatheadSays, speak, byPants, saidOver, landVisit, label, type Said } from '../section';
import { crashed } from '../train/engine';
import type { ByPants } from '../talk';
import { townOf, type Gate } from './state';
import { GY } from '../geometry';
import { X, Y, SALOON, SQUARE, BRAWL, SHOWDOWN, inSaloon, type TownKind } from './layout';
import {
  ARRIVE, STRETCHER, REVISIT, TOWN_IN, COFFIN, SALOON_IN, BRAWL_DONE, SHOWDOWN_IN, SHOWDOWN_DONE, POND, MILL, MINE, CANARY,
  FLOOD, QUEUE, SHOW_OPEN, SHOW_CLOSE, SHERIFF_BARK, TOWN_VOICES,
} from './lines';
import { lookOf } from '../../adventure/temple/people';
import { seedOf } from './kinds';

const AWAY = -99999;

/** One of the townsfolk, put down at (x from the section's start, height). */
export const spawnTown = (state: GameState, kind: TownKind, rx: number, h: number, variant = 0) => {
  const e = makeKindEnemy(`m2:fr_${kind}` as EnemyKind, X(rx), Y(h));
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.variant = (Math.abs(rx) + variant) % 7; e.facing = -1;
  state.enemies.push(e);
  return e;
};

// ---------------------------------------------------------------------------------------------------------------
// The crash: is this the visit it happened in? (the town built before it, this visit: then the wreck's still there)

let sawUncrashed = -1, stretcherVisit = -1;
export const wreckHere = (state: GameState) => crashed(state) && sawUncrashed === landVisit();

// ---------------------------------------------------------------------------------------------------------------
// Building: the fights' walls (away till they shut), their first waves (unless they're done)

const wall = (state: GameState, x: number, w: number, h: number): Block => {
  const b: Block = { x, y: AWAY, w, h, type: 'wall', hidden: true, tag: 'fr-gate' } as Block;
  state.blocks.push(b);
  return b;
};
export const buildScenes = (state: GameState) => {
  if (!crashed(state)) sawUncrashed = landVisit();
  const tw = townOf(state);
  tw.saloon.walls = [wall(state, SALOON.door - 8, 16, 110), wall(state, SALOON.window.x - 2, 14, SALOON.window.y1 - SALOON.window.y0)];
  tw.showdown.walls = [wall(state, SQUARE.a - 16, 16, 600), wall(state, SQUARE.b, 16, 600)];
  tw.saloon.state = state.checkpoint >= 23 ? 'done' : 'wait';
  tw.showdown.state = state.checkpoint >= 24 ? 'done' : 'wait';
  if (tw.saloon.state === 'wait') for (const [k, rx, h] of BRAWL[0]) tw.saloon.foes.add(spawnTown(state, k, rx, h));
  if (tw.showdown.state === 'wait') for (const [k, rx, h] of SHOWDOWN[0]) tw.showdown.foes.add(spawnTown(state, k, rx, h));
};

const shut = (state: GameState, which: 'saloon' | 'showdown', on: boolean) => {
  const g: Gate = townOf(state)[which];
  if (which === 'saloon') { g.walls[0].y = on ? Y(110) : AWAY; g.walls[1].y = on ? SALOON.window.y0 : AWAY; }
  else { g.walls[0].y = on ? GY - 600 : AWAY; g.walls[1].y = on ? GY - 600 : AWAY; }
};

const hold = (e: Enemy) => { e.puppet = true; e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2); e.vel.x = 0; };
const release = (e: Enemy) => { e.puppet = false; e.pauseTimer = 0; };

/** A fight's frame: held till he's in, then its waves, then open. */
const runGate = (state: GameState, which: 'saloon' | 'showdown', inside: boolean, onStart: () => void, onDone: () => void) => {
  const tw = townOf(state), g = tw[which], waves = which === 'saloon' ? BRAWL : SHOWDOWN;
  if (g.state === 'done') return;
  if (g.state === 'wait') {
    for (const e of g.foes) if (e.health > 0) hold(e);
    if (inside && state.player.health > 0) {
      g.state = 'on'; g.t = 0; g.wave = 0;
      shut(state, which, true);
      for (const e of g.foes) release(e);
      playSound('slam', 1, -6);
      onStart();
    }
    return;
  }
  g.t++;
  const alive = [...g.foes].filter(e => e.health > 0 && !e.isBlownAway).length;
  if (alive <= 1 && g.wave + 1 < waves.length && g.t > 60) {
    g.wave++;
    for (const [k, rx, h] of waves[g.wave]) g.foes.add(spawnTown(state, k, rx, h, g.wave * 3));
    playSound('slam', 0.7, -2);
  } else if (alive === 0 && g.wave + 1 >= waves.length) {
    g.state = 'done';
    shut(state, which, false);
    playSound('ding', 0.8, 0);
    onDone();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The frame

type Gag = [key: string, from: number, to: number, pool: ByPants];
const GAGS: Gag[] = [
  ['town', 650, 1000, TOWN_IN], ['coffin', 2300, 2500, COFFIN], ['pond', 5280, 5500, POND], ['mill', 6820, 7100, MILL],
  ['mine', 8310, 8600, MINE], ['canary', 9650, 9760, CANARY], ['flood', 9960, 10100, FLOOD], ['queue', 10650, 10900, QUEUE],
];

export const updateScenes = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), p = state.player;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, rx = cx - X(0);
  const free = p.health > 0 && !p.inCutscene;
  const once = (k: string, pool: ByPants) => { if (!tw.said[k] && free) { tw.said[k] = true; meatheadSays(state, pickLine(byPants(state, pool)), false); } };
  // ---- the crash's aftermath
  const wreck = wreckHere(state);
  if (state.checkpoint === 20 && rx < 600 && state.frame > 30) once('arrive', wreck ? ARRIVE : REVISIT);
  if (wreck && stretcherVisit !== landVisit() && rx < 700) { stretcherVisit = landVisit(); tw.stretcherT = 1; }
  if (tw.stretcherT > 0 && tw.stretcherT < 320) {
    tw.stretcherT++;
    if (tw.stretcherT === 170) once('stretcher', STRETCHER);
    if (tw.stretcherT === 300) playSound('slam', 0.5, 4);
  }
  // ---- passing things
  for (const [k, a, b, pool] of GAGS) if (rx > a && rx < b) once(k, pool);
  // ---- the saloon's brawl
  runGate(state, 'saloon', inSaloon(cx, feet) && cx > SALOON.a + 50,
    () => meatheadSays(state, pickLine(byPants(state, SALOON_IN)), false),
    () => meatheadSays(state, pickLine(byPants(state, BRAWL_DONE)), false));
  // ---- the showdown
  runGate(state, 'showdown', cx > SQUARE.a + 40 && cx < SQUARE.b - 40 && feet > GY - 20 && p.isGrounded,
    () => announce(state, SHOW_OPEN, () => {
      const sheriff = [...tw.showdown.foes].find(e => e.kind === 'm2:fr_sheriff' && e.health > 0);
      const then = () => meatheadSays(state, pickLine(byPants(state, SHOWDOWN_IN)), true);
      if (sheriff) speak(lookOf(seedOf(sheriff)).woman ? TOWN_VOICES.sherifff : TOWN_VOICES.sheriff, pickLine(byPants(state, SHERIFF_BARK)), s => { if (s) tw.barks.set(sheriff, s); else tw.barks.delete(sheriff); }, true, then);
      else then();
    }),
    () => announce(state, SHOW_CLOSE, () => meatheadSays(state, pickLine(byPants(state, SHOWDOWN_DONE)), true)));
};

const announce = (state: GameState, pool: ByPants, then?: () => void) => {
  const tw = townOf(state);
  speak(TOWN_VOICES.announcer, pickLine(byPants(state, pool)), s => { tw.pa = s; }, true, then);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: who's saying what, over their heads; the sheriff's DRAW!

export const drawScenesFront = (c: CanvasRenderingContext2D, state: GameState) => {
  const tw = townOf(state);
  for (const [e, s] of tw.barks) if (e.health > 0 || s) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 22, '#FDE68A');
  if (tw.pa) saidOver(c, (tw.pa as Said).text, X(4402), Y(310), '#F5F5F4');
  for (const e of state.enemies) {
    if (e.kind === 'm2:fr_sheriff' && e.aiState === 'draw' && e.health > 0 && state.frame % 10 < 7) label(c, 'DRAW!', e.pos.x + e.width / 2, e.pos.y - 8, '#F87171', 10);
  }
};
