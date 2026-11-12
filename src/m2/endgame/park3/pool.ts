// THE WAVE POOL (level 3's end: the owner's "the end of the sequence will shoot you and the dirty water through a grate
// and into the wave pool, where the third boss is"; rebuilt 2026-11-06: "the wave pool should regularly push you back
// at any depth and be ridiculously deep and long. much more than a real wave pool. it's by far the largest boss arena
// in the game (so far) and the first part is mostly evasion. you jump to the surface to get air"). Out past the
// tunnels, its own stretch of the stage (geo.ts WP): nine screens long, three deep. Night (the small hours; just before
// dawn once he's dead). The beach (the shallow end, zero entry) on the left, where he's flushed in; the deep end out to
// the right, its floor 120 FT down, the body mazes on it (mazes.ts); the wave machine over the far wall.
//
//   THE FLUSH   (the boss's door: the pump room's outflow, walked into; a short beat, no input, no HUD) Sucked down the
//               intake with a gurgle, gone; out of the outflow pipe in the deck's back wall in a burst of brown water,
//               shot over the beach into the shallows, a splash, his line. Then GUPPLAX's intro (boss.ts). Died in the
//               pool: back at the pump room's checkpoint (the refill there); walk into the intake again (the same beat,
//               the retry's intro). A retry starts it all whole again (his HP, the tanks).
//   THE FIGHT   GUPPLAX (boss.ts); the surges (waves.ts) shoving him back toward the beach at any depth; his air (the
//               tunnels' air, longer here: hazards.ts updateAir3, the gauge on the HUD with his depth); the mazes and
//               their tanks (mazes.ts). The camera follows him all over (no fixed screen).
//   THE END     (a cutscene, skippable all-or-nothing: the skip goes straight to level 4's lot) GUPPLAX's death:
//               up to the surface belly up, his throat swelling shut (the chlorine), his last line (Mom, his little
//               brother). Meathead hops up on his belly. He swells under him, beeping, and bursts: a flash, the bang, a
//               column of water; the corpse goes up with Meathead astride it, his one line, and they fly over the
//               park to the parking lot (ride.ts), VICTORY over the flight, timed to end as they come down. Level 4's
//               lot starts with the crash landing (ride.ts updateCrash, called by park4/lot.ts). The hour's on (13).
//
// Depth (what's in front of what): the sky and the far park (screen); the deck's back wall and palms (dimmed: nothing to
// stand on), the beach (stood on: lit top), the tower, the signs, the outflow pipe; under the surface the pool's tiled
// back wall (banded darker down), the light shafts, the floor (stood on: its lip lit), the far wall's intakes; the body
// piles (stood on: lit tops), the snags, the tanks, the hands; GUPPLAX; him (the engine); then the water's wash over all
// of it under the surface, the surge's streaks, the chlorine clouds, the crests and globs, the words.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { WaterBody } from '../../../m1/game/stages/index';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H, topBand } from '../../../m1/constants';
import { lay, solid, meatheadSays, speak, label, box } from '../../adventure/section';
import { setUi, goTo, setStartCheckpoint, setEndgameAt } from '../../store';
import { saveProgress } from '../../save';
import { setEndgameHour, timeOfDay, todLight, drawNightSky } from '../../timeOfDay';
import { markBossFight } from '../../bossQuiet';
import { type Victory, startVictory, tickVictory, drawVictory, VICTORY_FRAMES } from '../../victory';
import { stamp, checker, bandedGradient, mix, hash } from '../../intro/art/kit';
import { byPants } from '../park1/kinds';
import { ENDGAME_STAGES, WATER_PARK_NAME } from '../stages';
import { WP, poolFloor, POOL_RUNS, POOL_SIGNS, PUMP_ROOM, CP3, feetAt } from './geo';
import { drawSigns } from './art';
import { air3 } from './hazards';
import { type Fight3, startGup, updateGup, gupDead, gupTank, drawGup3, drawGupFront, drawGupHud, splash, TOWER, AIR_GAUGE } from './boss';
import { type Mazes, newMazes, updateMazes, mazeBlocks, drawMazesBack, drawMazesFront, mazeLights, mazeAt, tankInView, TANK_COUNT, MAZE_BOX } from './mazes';
import { type Waves, newWaves, updateWaves, surgeOf, swellAt, drawWaves } from './waves';
import { drawGup, drawBurst, warmBurst } from './gupArt';
import { type Flight, drawFlightBackdrop, warmRide, arriveByCrash, SEAT_SCREEN } from './ride';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const INK = '#04080C';
const hands = (): Controls => ({ ...NO_CONTROLS });

/** His air in the pool (frames from full to none: ~38 s; the tunnels' is 22), and how fast it comes back at the top. */
export const POOL_AIR = { frames: 2300, refill: 15, src: 'm2:wp3_pooldrown' };

type Step = 'idle' | 'flush' | 'fight' | 'dying' | 'mount' | 'swell' | 'fly' | 'done';
export interface Pool {
  step: Step; t: number; skipT: number; talk: number;
  f: Fight3 | null; mz: Mazes; wv: Waves;
  /** He's been through the flush this visit (the next: the retry's intro). */
  seen: boolean;
  /** The flush's start (bx, by); the hop up onto him (from); the flight (fl), the corpse's turn in it, the blast's
   *  flash (frames left); the VICTORY, and when (frame, how far along) it started; his line done; the whistle down. */
  bx: number; by: number; from: { x: number; y: number }; fl: Flight; rot: number; flash: number;
  v: Victory | null; vt0: number; vk0: number; lineDone: boolean; whistled: boolean; said: string | null;
  /** The camera's height (eased after him). */
  camY: number;
  /** His lines: when each was last said; one owed (said when nobody's talking). */
  lineAt: Record<string, number>; owe: L.ByPants | null; once: Record<string, boolean>;
}

/** Hour 12 here; 13 once he's dead (endgame/stages.ts park3t's, and the next). */
const HOUR_AFTER = 13;

export const newPool = (state: GameState, _cp: number): Pool => {
  // ---- the pool's ground: the beach (dry, a zero-entry), the slopes, the shelf, the drop, the deep end's floor; the
  // fence behind the beach, the wave machine's housing past the deep end (solid: no climbing out round him)
  lay(state, POOL_RUNS.map(([x1, y1, x2, y2]) => ({ x1, y1, x2, y2, surface: 'concrete' })));
  for (const b of state.blocks) if (b.x >= WP.x0 - 400 && !b.tag) b.hidden = true;
  solid(state, WP.x0 - 100, WP.beachTop - 2000, 60, 2600, { hidden: true, tag: 'wp3-fence' });
  solid(state, WP.x1, WP.beachTop - 2000, 600, WP.deep - WP.beachTop + 2400, { hidden: true, tag: 'wp3-housing' });
  state.blocks.push(...mazeBlocks());
  return {
    step: 'idle', t: 0, skipT: 0, talk: 0, f: null, mz: newMazes(), wv: newWaves(), seen: state.stageMemo['m2:wp3-flushed'] === '1',
    bx: 0, by: 0, from: { x: 0, y: 0 }, fl: { k: 0, up: 0, t: 0 }, rot: 0, flash: 0, v: null, vt0: -1, vk0: 0, lineDone: false, whistled: false, said: null, camY: WP.surf - 400,
    lineAt: {}, owe: null, once: {},
  };
};
export const poolOn = (pl: Pool) => pl.step !== 'idle';

/** Level 4's start (the first stage of level 4 in stages.ts). */
const level4 = () => { const s = ENDGAME_STAGES.find(e => e.level === 4); return s ? { id: s.id, cp: s.checkpoints[0].cp } : null; };

/** A line of his in the fight (not over anybody), no more than once in `gap` ms. */
const mhSay = (state: GameState, pl: Pool, k: string, lines: L.ByPants, gap = 45000) => {
  const now = performance.now();
  if (now - (pl.lineAt[k] ?? -1e9) < gap || isTalking() || pl.f?.said) return false;
  pl.lineAt[k] = now;
  meatheadSays(state, pickLine(byPants(state, lines)), false);
  return true;
};

/** A frame. `save`: a checkpoint's his. */
export const updatePool = (ctx: FrameContext, pl: Pool, controls: Controls, save: (cp: number) => void): Controls => {
  const { state } = ctx, p = state.player;
  pl.t++; pl.skipT++;
  const cx = p.pos.x + p.width / 2;
  switch (pl.step) {
    case 'idle': return controls;
    // ---- THE FLUSH: down the intake, out of the outflow pipe over the beach, into the shallows
    case 'flush': {
      const t = pl.t, view = { x: WP.x0 - 60, y: WP.surf - 400 };
      p.inCutscene = true; p.untouchable = true; setUi({ introCutscene: true });
      if (t === 1) { playSound('glug', 1, -10); playSound('rumble', 0.8, -6); save(CP3.pump); }
      if (t < 22) { p.carried = true; p.vel.x = 0; p.vel.y = 0; p.pos.x += ((PUMP_ROOM.outA + PUMP_ROOM.outB) / 2 - p.width / 2 - p.pos.x) * 0.2; p.pos.y += 4; if (t % 4 === 0) shakeScreen(state, 4, 2); return hands(); }
      if (t === 22) { p.hidden = true; p.carried = false; state.cameraOverride = view; p.pos.x = WP.pipe.x - p.width / 2; p.pos.y = WP.pipe.y - p.height / 2; pl.camY = view.y; return hands(); }
      if (t > 22 && t < 58) {
        state.cameraOverride = view;
        if (t % 6 === 0) { playSound('gush', 0.5, -8); shakeScreen(state, 3, 2); }
        if (t % 3 === 0) state.particles.push({ pos: { x: WP.pipe.x + 30, y: WP.pipe.y + 10 }, vel: { x: 0.5 + Math.random(), y: 1 }, life: 30, color: '#6A4A20', size: 3, grav: 0.3 });
        return hands();
      }
      if (t === 58) { playSound('crash', 1, -8); playSound('gush', 1, -4); shakeScreen(state, 12, 6); p.hidden = false; pl.bx = p.pos.x; pl.by = p.pos.y; pl.seen = true; state.stageMemo['m2:wp3-flushed'] = '1'; }
      // (shot out over the beach in an arc, tumbling, with the brown water, into the shallows)
      const k = Math.min(1, (t - 58) / 50), tx = WP.beach + 300 - p.width / 2;
      p.pos.x = pl.bx + k * (tx - pl.bx); p.pos.y = pl.by - Math.sin(k * Math.PI) * 200 + k * (WP.surf - 20 - pl.by);
      p.spriteRot = k < 1 ? (t - 58) * 0.35 : 0;
      state.cameraOverride = { x: Math.max(WP.x0 - 60, Math.min(p.pos.x - 300, WP.beach - 100)), y: view.y };
      for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: WP.pipe.x + 30, y: WP.pipe.y + (Math.random() - 0.5) * 30 }, vel: { x: 4 + Math.random() * 5, y: (Math.random() - 0.5) * 3 - 1 }, life: 30, color: i ? '#6A4A20' : '#8A6A30', size: 4 + Math.random() * 5, grav: 0.2 });
      if (t === 108) {
        splash(state, cx, 30); playSound('splash', 1, -6);
        p.spriteRot = 0; p.carried = false; p.untouchable = false; p.vel.x = 0; p.vel.y = 2;
        meatheadSays(state, pickLine(byPants(state, L.MH_FLUSHED)), true);
        // (a fresh go: every tank whole, the surges from the top of their clock)
        pl.mz = newMazes(); pl.wv = newWaves(); pl.owe = null; pl.once = {};
        pl.step = 'fight'; pl.t = 0; pl.f = startGup(state, state.stageMemo['m2:boss-intro:gupplax'] === '1', pl.mz, pl.wv);
        state.stageMemo['m2:boss-intro:gupplax'] = '1';
      }
      return hands();
    }
    // ---- THE FIGHT
    case 'fight': {
      const f = pl.f!;
      markBossFight(state, 'gupplax', { l: WP.x0, r: WP.x1 });
      const out = updateGup(ctx, f, controls);
      const live = f.mode === 'on' && p.health > 0 && !p.inCutscene;
      if (f.mode === 'on') {
        const s = updateWaves(state, pl.wv, live);
        updateMazes(ctx, pl.mz, () => {
          gupTank(state, f);
          pl.owe = f.tanks >= TANK_COUNT ? L.MH_ALL : L.MH_TANK;
        });
        // ---- what he says (each to its moment; never over anybody)
        if (live) {
          if (s.st === 'tell' && pl.wv.n === 1 && !pl.once.surge) { pl.once.surge = true; mhSay(state, pl, 'surge', L.MH_SURGE, 0); }
          else if (s.st === 'tell' && pl.wv.n % 4 === 0 && pl.wv.n > 1) mhSay(state, pl, 'surge', L.MH_SURGE);
          if (cx > WP.x0 + 2300 && !pl.once.deep) { if (mhSay(state, pl, 'deep', L.MH_DEEP, 0)) pl.once.deep = true; }
          if (f.clanks >= 3 && !pl.once.armor) { if (mhSay(state, pl, 'armor', L.MH_ARMOR, 0)) pl.once.armor = true; }
          const m = mazeAt(cx, p.pos.y + p.height / 2);
          if (m >= 0 && !pl.mz.entered[m]) { pl.mz.entered[m] = true; mhSay(state, pl, 'maze', L.MH_MAZE, 20000); }
          const ti = tankInView(state, pl.mz);
          if (ti >= 0 && !pl.mz.seenTank[ti]) {
            pl.mz.seenTank[ti] = true;
            if (!pl.once.tank) { pl.once.tank = true; pl.owe = L.MH_TANK_SEE; if (f.tanks === 0) f.pend = L.GUP_TANKWARN; }
          }
          if (pl.owe && !isTalking() && !f.said && !f.pend) { meatheadSays(state, pickLine(byPants(state, pl.owe)), false); pl.owe = null; }
        }
      }
      // (the camera: along the whole pool, on him (up and down: poolCamY))
      if (f.mode === 'on') { state.cameraOverride = null; state.cameraMinX = WP.x0 - 60; state.cameraMaxX = WP.x1 + 200 - W; }
      setUi({ introCutscene: !!p.inCutscene || f.mode === 'intro' });
      if (gupDead(f)) {
        pl.step = 'dying'; pl.t = 0; pl.skipT = 0; pl.talk = 0;
        p.inCutscene = true; p.untouchable = true;
        // (the hour on, the file on to level 4's start (CONTINUE, a death or a reload from here on: its start))
        setEndgameHour(HOUR_AFTER);
        const l4 = level4();
        if (l4) { setEndgameAt({ stage: l4.id, cp: l4.cp }); saveProgress(); }
      }
      return out;
    }
  }
  // ---- THE END (a cutscene: skippable, all of it: the skip goes straight to level 4's lot)
  const f = pl.f!;
  p.inCutscene = true; p.untouchable = true; setUi({ introCutscene: true });
  if (pl.step !== 'done') {
    if (pl.skipT > SKIP_AFTER) offerSkip();
    if (pl.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; pl.said = null; pl.v = null; toLevel4(state, pl, false); return hands(); }
  }
  // (warming what the flight draws, a piece a frame, while he dies and swells: nothing painted mid-flight)
  if (pl.step === 'dying' || pl.step === 'mount' || pl.step === 'swell') { warmBurst(); warmRide(); }
  const t = pl.t, camAt = (x: number) => ({ x: Math.max(WP.x0 - 60, Math.min(WP.x1 + 200 - W, x - W / 2)), y: WP.surf - 260 });
  switch (pl.step) {
    case 'dying': {
      // (up to the surface, belly up, his throat swelling shut (the chlorine), his last line (Mom, his brother); him
      // treading water up to him, waiting)
      f.y += (WP.surf + 6 - f.y) * 0.08;
      state.cameraOverride = camAt(f.x); pl.camY = WP.surf - 260;
      p.carried = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
      const tx = Math.max(WP.beach + 200, f.x - 150) - p.width / 2, ty = WP.surf - p.height * 0.45 + Math.sin(state.frame * 0.08) * 2;
      p.pos.x += (tx - p.pos.x) * 0.06; p.pos.y += (ty - p.pos.y) * 0.08;
      const all = f.tanks >= TANK_COUNT;
      if (t === 1) { playSound('retch', 0.9, 8); speakGup(pl, pickLine(byPants(state, all ? L.GUP_DEATH_ALL : L.GUP_DEATH)), () => { pl.talk = 1; }); }
      if (t % 20 === 5) playSound(all ? 'snort' : 'beep', 0.4, 18 - Math.min(16, t / 10));
      if ((pl.talk === 1 && t > 90) || t > 700) { pl.step = 'mount'; pl.t = 0; pl.from = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height }; playSound('jump', 0.8); }
      break;
    }
    case 'mount': {
      // (a hop up onto his belly: sat on the breastplate)
      const k = Math.min(1, t / 26), seat = gupSeat(f, 1);
      const x = pl.from.x + (seat.x - pl.from.x) * k, y = pl.from.y + (seat.y - pl.from.y) * k - Math.sin(k * Math.PI) * 60;
      p.carried = true; p.pos.x = x - p.width / 2; p.pos.y = y - p.height; p.vel.x = 0; p.vel.y = 0;
      state.cameraOverride = camAt(f.x);
      if (k >= 1) { pl.step = 'swell'; pl.t = 0; p.logSeat = true; playSound('squish', 1, -6); playSound('splash', 0.6, -4); }
      break;
    }
    case 'swell': {
      // (the chlorine's last of him: he swells up under him, creaking, hives popping, beeping quicker and quicker)
      const S = swellOf(t), seat = gupSeat(f, S);
      sitOn(p, seat.x, seat.y, Math.sin(t * 0.9) * 0.04 * (t / SWELL));
      state.cameraOverride = { x: camAt(f.x).x + (Math.random() - 0.5) * t * 0.06, y: WP.surf - 300 };
      if (t % Math.max(3, 16 - Math.floor(t / 8)) === 0) playSound('beep', 0.5, 6 + t / 8);
      if (t % 14 === 0) { playSound('squish', 0.6, 4 + t / 20); shakeScreen(state, 2 + t / 25, 2); }
      if (t % 4 === 0) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 120 * S, y: seat.y + Math.random() * 40 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 - Math.random() * 2 }, life: 20, color: Math.random() < 0.5 ? '#F07A8A' : '#9AF060', size: 2 + Math.random() * 2 });
      if (t >= SWELL) {
        // (POP: the flash, the bang, the water column, the guts; up they go)
        pl.step = 'fly'; pl.t = 0; pl.flash = 16; pl.fl = { k: 0, up: 0, t: 0 }; pl.vt0 = -1; pl.lineDone = false;
        playSound('nuke', 0.9, -4); playSound('boom', 1, -10); playSound('gorespray', 1, -6); playSound('tsunami', 0.7, -2);
        shakeScreen(state, 26, 16);
        for (let i = 0; i < 90; i++) state.particles.push({ pos: { x: f.x + (Math.random() - 0.5) * 140, y: WP.surf - 30 }, vel: { x: (Math.random() - 0.5) * 14, y: -3 - Math.random() * 14 }, life: 50 + Math.random() * 40, color: ['#5ACA3A', '#7A4A8A', '#C04A5A', '#E0F2FE'][i % 4], size: 2 + Math.random() * 5, grav: 0.35 });
      }
      break;
    }
    case 'fly': {
      // (the flight: his one line as they go up; VICTORY started once it's done, timed to end as they come down in the lot)
      const fl = pl.fl;
      fl.t = t;
      if (t === 2) meatheadSays(state, pickLine(byPants(state, L.MH_LAUNCH)), true, () => { pl.lineDone = true; });
      if (!pl.v && (pl.lineDone || t >= 150)) { pl.v = startVictory(); pl.vt0 = t; pl.vk0 = fl.k; }
      if (pl.v) tickVictory(state, pl.v);
      // (how far along: a guess at the pace till the VICTORY's started, then exactly to land as it ends)
      fl.k = pl.vt0 < 0 ? t / FLY_GUESS : Math.min(1, pl.vk0 + (1 - pl.vk0) * (t - pl.vt0) / VICTORY_FRAMES);
      fl.up = Math.sin(Math.PI * fl.k);
      const rot = -0.42 * Math.cos(Math.PI * fl.k) + Math.sin(t * 0.13) * 0.05;
      const sx = f.x, sy = WP.surf - 60 - fl.up * 900;
      sitOn(p, sx, sy, rot);
      pl.rot = rot;
      state.cameraOverride = { x: sx - SEAT_SCREEN.x, y: sy - SEAT_SCREEN.y }; pl.camY = sy - SEAT_SCREEN.y;
      // (smoke off him, green out of him: left behind in the air)
      if (t % 3 === 0) state.particles.push({ pos: { x: sx - 110 * Math.cos(rot), y: sy + 20 - 110 * Math.sin(rot) }, vel: { x: -1.5, y: 0.5 }, life: 46, color: t % 6 ? '#4A4A52' : '#6A6A72', size: 6 + Math.random() * 4 });
      if (t % 4 === 0) state.particles.push({ pos: { x: sx - 60, y: sy + 40 }, vel: { x: -2 - Math.random() * 2, y: 1 + Math.random() * 2 }, life: 40, color: Math.random() < 0.6 ? '#5ACA3A' : '#7A4A8A', size: 2 + Math.random() * 3, grav: 0.2 });
      if (t % 40 === 0) playSound('whoosh', 0.6, -6 + (t % 7));
      if (fl.k > 0.82 && !pl.whistled) { pl.whistled = true; playSound('fallwhistle', 0.7, -6); }
      if (fl.k >= 1) toLevel4(state, pl, true);
      break;
    }
    case 'done':
      break;
  }
  if (pl.flash > 0) pl.flash--;
  return hands();
};
/** How swollen he is, `t` frames into the swell (1 .. 1.7, quicker at the end). */
const SWELL = 96;
const swellOf = (t: number) => 1 + 0.7 * Math.pow(Math.min(1, t / SWELL), 1.6);
/** The flight's length before the VICTORY's started (its pace till then). */
const FLY_GUESS = 90 + VICTORY_FRAMES;
/** Where he sits on GUPPLAX belly up (puffed), swollen `S`: on his chest, the top of him. */
const gupSeat = (f: Fight3, S: number) => ({ x: f.x - 10 * S, y: WP.surf - 24 - 52 * S });
/** Him sat at (x, y: his seat), turned `rot` (the seat's the pivot). */
const sitOn = (p: GameState['player'], x: number, y: number, rot: number) => {
  const up = p.height / 2 - 10;
  p.carried = true; p.logSeat = true; p.facing = 1; p.spriteRot = rot; p.vel.x = 0; p.vel.y = 0; p.isGrounded = false;
  p.pos.x = x + Math.sin(rot) * up - p.width / 2; p.pos.y = y - Math.cos(rot) * up - p.height / 2;
};
/** On to level 4's lot (`crash`: in on the corpse; the skip's: just there). */
const toLevel4 = (state: GameState, pl: Pool, crash: boolean) => {
  if (pl.step === 'done') return;
  pl.step = 'done'; pl.t = 0;
  const p = state.player;
  p.spriteRot = 0; p.untouchable = false; p.logSeat = false;
  const l4 = level4();
  if (!l4) return;
  if (crash) arriveByCrash();
  setStartCheckpoint(l4.cp); goTo(l4.id);
};
let gupTok = 0;
const speakGup = (pl: Pool, text: string, onDone: () => void) => {
  const tok = ++gupTok;
  speak(L.GUP_VOICE, text, s => { if (tok === gupTok) pl.said = s?.text ?? null; }, true, () => { if (tok === gupTok) onDone(); });
};

/** The camera's height: after him, all the way down (the top: the sky over the surface in view; the bottom: the deep
 *  end's floor), eased. In the cutscenes their own. */
export const poolCamY = (state: GameState, pl: Pool) => {
  const p = state.player;
  if (pl.step !== 'fight') return pl.camY;
  const want = p.pos.y + p.height / 2 - 300, lo = WP.surf - 420, hi = WP.deep + 150 - H;
  pl.camY += (Math.max(lo, Math.min(hi, want)) - pl.camY) * 0.12;
  if (!Number.isFinite(pl.camY)) pl.camY = want;
  return Math.round(pl.camY * 2) / 2;
};
export const poolWater = (_state: GameState, _pl: Pool, x: number, y: number): WaterBody | null => {
  if (x < WP.beach || x > WP.x1 || y < WP.surf - 40 || y > poolFloor(x) + 2) return null;
  return { key: 'wp3-pool', x1: WP.beach, x2: WP.x1, surface: WP.surf, bottom: poolFloor(x), kind: 'clean' };
};
export const poolDeath = (_pl: Pool) => undefined;
/** How far down the camera is (0 at the surface .. 1 at the bottom). */
const depthK = (state: GameState) => Math.max(0, Math.min(1, (state.camera.y + H / 2 - WP.surf) / (WP.deep - WP.surf)));
/** The pool's lighting: the night's, darker the deeper the camera; the deck's lamps; the lights in the pool's walls; the
 *  tanks' glow; a little of the surface's light round him (so the piles near him read). */
export const poolLights = (state: GameState, pl: Pool): SceneLight | null => {
  if (pl.step === 'fly' || pl.step === 'done') { const p = state.player; return todLight([{ x: p.pos.x + p.width / 2, y: p.pos.y + 30, r: 260, a: 0.3, color: '#FDE68A' }], 0.8); }
  const ls: Light[] = [
    { x: TOWER.x - 10, y: TOWER.seat - 90, r: 320, a: 0.45, color: '#FDE68A' },
    { x: WP.x0 + 300, y: WP.beachTop - 200, r: 360, a: 0.4, color: '#FDE68A' },
  ];
  for (let x = WP.beach + 400; x < WP.x1; x += 500) ls.push({ x, y: poolFloor(x) - 60, r: 230, a: 0.3, color: '#7DD3FC' });
  const dk = depthK(state), p = state.player;
  ls.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 30, r: 300, a: 0.14 * dk, color: '#7DC8E8' });
  ls.push(...mazeLights(state, pl.mz));
  const base = todLight(ls.filter(l => l.x > state.camera.x - 400 && l.x < state.camera.x + W + 400 && l.y > state.camera.y - 400 && l.y < state.camera.y + H + 400), 1);
  if (!base) return null;
  return { ...base, dark: Math.min(0.84, base.dark + 0.42 * dk), shade: dk > 0.15 ? [3, 12, 28] : base.shade };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Screen space: the sky by the hour, the stars and the moon, the rest of the water park far off (busy: lit, the
 *  aliens' saucers and the demons' fires over it). Under the surface it's all covered. */
export const drawPoolBackdrop = (c: Ctx, state: GameState, pl: Pool) => {
  if (pl.step === 'fly' || pl.step === 'done') { drawFlightBackdrop(c, state, pl.fl); return; }
  const tod = timeOfDay(), cy = state.camera.y, horizon = Math.round(WP.beachTop - 180 - cy);
  if (horizon + 200 < 0) { R(c, 0, 0, W, H, '#020A14'); return; }
  bandedGradient(c, 0, 0, W, Math.max(40, horizon + 40), tod.sky, 14);
  R(c, 0, horizon + 40, W, H, tod.sky[tod.sky.length - 1]);
  drawNightSky(c, 0, 0, W, Math.max(40, horizon), W - 160 - state.camera.x * 0.02, 70, state.frame, state.camera.x * 0.02, tod);
  const sx = -((state.camera.x * 0.15) % 900);
  for (let k = -1; k < 3; k++) stamp(c, 'wp3-far', Math.round(sx + k * 900), horizon - 160, 900, 200, g => paintFar(g, Math.round(sx + k * 900), horizon - 160));
  const f = state.frame;
  for (let k = 0; k < 4; k++) { const x = ((k * 260 - state.camera.x * 0.15 + 2000) % 1100) - 100, y = horizon - 40 - (k % 2) * 30; c.globalAlpha = 0.25 + 0.1 * Math.sin(f * 0.1 + k); c.fillStyle = '#F97316'; c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  for (let k = 0; k < 2; k++) { const x = ((k * 480 + f * 0.4 - state.camera.x * 0.1) % 1000 + 1000) % 1000 - 100, y = horizon - 150 - k * 40 + Math.sin(f * 0.03 + k) * 8; R(c, x - 20, y, 40, 6, '#3A4A5A'); R(c, x - 10, y - 6, 20, 6, '#5A6A7A'); if (f % 30 < 15) R(c, x - 2, y + 6, 4, 3, '#86EFAC'); }
};
const paintFar = (g: Ctx, x0: number, y0: number) => {
  // (the rest of the water park, far off at night, in two layers of silhouette and the haze between: MOUNT EVEREST
  // BUT BETTER (a snowy point: not a volcano), the slide towers and their loops, the lazy river's palms burnt to
  // sticks, the park's lights; banded haze along the foot)
  const far = (col: string) => mix(col, '#1A2244', 0.62), near = (col: string) => mix(col, '#141A30', 0.45);
  const B = y0 + 200;
  // ---- the far layer: the mountain, its snow, its flags; a ridge of trees
  g.fillStyle = far('#5A5A6A'); g.beginPath(); g.moveTo(x0 + 470, B); g.lineTo(x0 + 610, y0 + 26); g.lineTo(x0 + 650, y0 + 22); g.lineTo(x0 + 820, B); g.closePath(); g.fill();
  g.fillStyle = far('#3A3A4A'); g.beginPath(); g.moveTo(x0 + 650, y0 + 22); g.lineTo(x0 + 820, B); g.lineTo(x0 + 720, B); g.lineTo(x0 + 640, y0 + 60); g.closePath(); g.fill();
  g.fillStyle = far('#E8ECF0'); g.beginPath(); g.moveTo(x0 + 610, y0 + 26); g.lineTo(x0 + 650, y0 + 22); g.lineTo(x0 + 690, y0 + 70); g.lineTo(x0 + 664, y0 + 62); g.lineTo(x0 + 640, y0 + 80); g.lineTo(x0 + 616, y0 + 64); g.lineTo(x0 + 592, y0 + 74); g.closePath(); g.fill();
  for (let k = 0; k < 6; k++) R(g, x0 + 600 + k * 9, y0 + 34 + k * 6, 4, 4, far(['#E04A3A', '#F0D040', '#3A9A4A'][k % 3]));
  for (let x = x0; x < x0 + 900; x += 14) { const h = 14 + Math.floor(hash(x * 0.37) * 18); R(g, x, B - 20 - h, 14, h + 20, far('#2A3A3A')); }
  checker(g, x0, B - 30, 900, 4, far('#2A3A3A'), 0, 2);
  // (the haze between)
  for (let b = 0; b < 3; b++) { g.globalAlpha = 0.25 + b * 0.1; R(g, x0, B - 30 + b * 6, 900, 6, '#26305A'); }
  g.globalAlpha = 1;
  // ---- the near layer: the slide towers and their loops, the burnt palms, the lamps' dots
  for (const [x, h, col] of [[90, 130, '#E04A3A'], [230, 96, '#3A8AE0'], [360, 150, '#E0C03A']] as const) {
    R(g, x0 + x - 1, B - h - 1, 16, h + 1, '#0A0E1A'); R(g, x0 + x, B - h, 14, h, near('#4A5A6A')); R(g, x0 + x, B - h, 3, h, near('#6A7A8A'));
    for (const [w, cc] of [[10, '#0A0E1A'], [7, col], [2, mix(col, '#FFFFFF', 0.4)]] as const) { g.strokeStyle = w === 10 ? cc : near(cc); g.lineWidth = w; g.beginPath(); g.moveTo(x0 + x + 7, B - h); g.bezierCurveTo(x0 + x + 90, B - h, x0 + x - 50, B - h / 2, x0 + x + 70, B - 4); g.stroke(); }
  }
  for (const px of [470, 540, 820, 870]) { R(g, x0 + px, B - 54, 4, 54, '#0A0806'); R(g, x0 + px - 6, B - 56, 16, 3, '#0A0806'); R(g, x0 + px + 1, B - 56, 2, 2, '#E0601A'); }
  for (let k = 0; k < 16; k++) { R(g, x0 + 30 + k * 56, B - 10 - (k % 3) * 8, 3, 3, '#FDE68A'); R(g, x0 + 31 + k * 56, B - 7 - (k % 3) * 8, 1, 7, '#1A1A24'); }
  R(g, x0, B - 4, 900, 4, near('#2A3446'));
};

// ---- the pool's tiled back wall (one strip, banded darker by depth, dithered between bands, the tiles' grout, cracked
// and grimy ones seeded across it), baked once and laid as a pattern: one fill a frame for all of it
const BACK_W = 480, BACK_H = WP.deep - WP.surf + 80;
const BANDS = ['#3A9AC8', '#2E8AB8', '#267AA6', '#1E6A94', '#185A82', '#124A70', '#0E3E60', '#0A3252', '#082844', '#061F38', '#05182C', '#041222', '#030E1A', '#020A14'];
let backPat: CanvasPattern | null = null;
const backPattern = (c: Ctx) => {
  if (backPat) return backPat;
  const cv = document.createElement('canvas'); cv.width = BACK_W; cv.height = BACK_H;
  const g = cv.getContext('2d')!;
  const bh = BACK_H / BANDS.length;
  BANDS.forEach((col, i) => {
    R(g, 0, i * bh, BACK_W, bh + 1, col);
    if (i + 1 < BANDS.length) { checker(g, 0, (i + 1) * bh - 6, BACK_W, 6, BANDS[i + 1], 0, 1); }
  });
  for (let y = 0; y < BACK_H; y += 40) {
    const band = BANDS[Math.min(BANDS.length - 1, Math.floor(y / bh))];
    R(g, 0, y, BACK_W, 1, mix(band, '#000000', 0.35)); R(g, 0, y + 1, BACK_W, 1, mix(band, '#FFFFFF', 0.08));
    for (let x = 0; x < BACK_W; x += 40) {
      R(g, x, y, 1, 40, mix(band, '#000000', 0.35));
      const s = hash(x * 7.1 + y * 0.37);
      // (a cracked tile, a missing one, a streak of grime down from the grout)
      if (s < 0.05) { g.strokeStyle = mix(band, '#000000', 0.5); g.lineWidth = 1; g.beginPath(); g.moveTo(x + 6, y + 4); g.lineTo(x + 18, y + 20); g.lineTo(x + 14, y + 34); g.stroke(); }
      else if (s < 0.075) R(g, x + 2, y + 2, 37, 37, mix(band, '#1A1A10', 0.5));
      else if (s < 0.14) { R(g, x + 10 + Math.floor(s * 100) % 20, y + 2, 3, 20 + Math.floor(s * 300) % 18, mix(band, '#2A3A1A', 0.35)); }
    }
  }
  backPat = c.createPattern(cv, 'repeat');
  backPat?.setTransform(new DOMMatrix().translate(0, WP.surf));
  return backPat;
};
// ---- the pool's back wall, below the surface: tile pictures along it now and then (so the long swim reads as going
// somewhere): the park's mascot dolphin, HAPPY WATERS in mosaic, a NO DIVING pictogram somebody's added to, a lane T,
// a grate on the deep floor's wall. Tiles 10 px, darker the deeper they are (the wall's bands), drawn on the wall: behind
// the mazes, GUPPLAX and him; the water's wash goes over them.
interface Mural { x: number; y: number; w: number; h: number; kind: 'dolphin' | 'logo' | 'nodive' | 'lane' | 'grate' }
const MURALS: Mural[] = [
  { x: WP.beach + 560, y: WP.surf + 40, w: 200, h: 120, kind: 'dolphin' },
  { x: WP.x0 + 1750, y: WP.surf + 50, w: 260, h: 90, kind: 'logo' },
  { x: WP.x0 + 2850, y: WP.surf + 90, w: 120, h: 120, kind: 'nodive' },
  { x: WP.x0 + 3500, y: WP.surf + 300, w: 60, h: 420, kind: 'lane' },
  { x: WP.x0 + 4700, y: WP.surf + 160, w: 260, h: 90, kind: 'logo' },
  { x: WP.x0 + 5900, y: WP.surf + 400, w: 200, h: 120, kind: 'dolphin' },
  { x: WP.x0 + 6600, y: WP.surf + 1100, w: 140, h: 120, kind: 'grate' },
];
const DOLPHIN = [
  '..........##........',
  '.........###........',
  '...#############....',
  '..###############...',
  '.####o############..',
  '##################..',
  '.#######wwwwww######',
  '..####wwwwwwwww.....',
  '....###.......###...',
  '.....#.........###..',
  '................##..',
  '....................',
];
const paintMural = (g: Ctx, m: Mural) => {
  const depthK = Math.max(0, Math.min(1, (m.y - WP.surf) / (WP.deep - WP.surf)));
  const d = (col: string) => mix(col, '#03101E', 0.25 + depthK * 0.6);
  const tile = (tx: number, ty: number, col: string) => { R(g, tx, ty, 10, 10, d(col)); R(g, tx, ty, 10, 1, d(mix(col, '#000000', 0.35))); R(g, tx, ty, 1, 10, d(mix(col, '#000000', 0.35))); R(g, tx + 2, ty + 2, 2, 1, d(mix(col, '#FFFFFF', 0.4))); };
  if (m.kind === 'dolphin') {
    for (let r = 0; r < DOLPHIN.length; r++) for (let c = 0; c < DOLPHIN[r].length; c++) { const ch = DOLPHIN[r][c]; if (ch === '.') continue; tile(m.x + c * 10, m.y + r * 10, ch === 'w' ? '#E8F4FC' : ch === 'o' ? '#0A1A2A' : '#5A9AD0'); }
    // (somebody's drawn fangs on it)
    for (let k = 0; k < 3; k++) R(g, m.x + 60 + k * 14, m.y + 70, 4, 8, d('#F8FAFC'));
  } else if (m.kind === 'logo') {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 26; c++) tile(m.x + c * 10, m.y + r * 10, r === 0 || r === 8 || c === 0 || c === 25 ? '#F0C040' : '#2A6AB0');
    g.font = '14px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = d('#0A1A2A'); g.fillText(WATER_PARK_NAME, m.x + m.w / 2 + 2, m.y + 54); g.fillStyle = d('#F8FAFC'); g.fillText(WATER_PARK_NAME, m.x + m.w / 2, m.y + 52); g.textAlign = 'left';
  } else if (m.kind === 'nodive') {
    for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) { const dx = c - 5.5, dy = r - 5.5, rr = Math.sqrt(dx * dx + dy * dy); if (rr > 6) continue; tile(m.x + c * 10, m.y + r * 10, rr > 4.6 || Math.abs(dx - dy) < 1 ? '#C83A2A' : '#E8F4FC'); }
    // (the diver in it, and the extra arms somebody's added)
    R(g, m.x + 40, m.y + 30, 10, 40, d('#0A1A2A')); R(g, m.x + 30, m.y + 40, 30, 6, d('#0A1A2A')); R(g, m.x + 26, m.y + 54, 38, 4, d('#2A8A3A'));
  } else if (m.kind === 'lane') {
    for (let r = 0; r < m.h / 10; r++) for (let c = 0; c < 2; c++) tile(m.x + 20 + c * 10, m.y + r * 10, '#0A1A3A');
    for (let c = 0; c < 6; c++) tile(m.x + c * 10, m.y + m.h - 10, '#0A1A3A');
  } else {
    R(g, m.x - 2, m.y - 2, m.w + 4, m.h + 4, INK); R(g, m.x, m.y, m.w, m.h, d('#3A4048'));
    for (let k = 0; k < 8; k++) { R(g, m.x + 8, m.y + 8 + k * 14, m.w - 16, 8, d('#0A0C10')); R(g, m.x + 8, m.y + 16 + k * 14, m.w - 16, 2, d('#6A7078')); }
    // (a sneaker caught in it)
    R(g, m.x + 40, m.y + 50, 30, 12, d('#E8E4DC')); R(g, m.x + 40, m.y + 58, 30, 4, d('#C83A2A'));
  }
};

/** The visible stretch of the pool's water (x range) as a path: the surface (swelling), then back along the floor. */
const waterPath = (c: Ctx, x0: number, x1: number, wv: Waves | null, swell: boolean) => {
  c.beginPath();
  c.moveTo(x0, WP.surf);
  for (let x = x0; x <= x1; x += 16) c.lineTo(x, WP.surf - (swell && wv ? swellAt(wv, x) : 0));
  c.lineTo(x1, WP.surf);
  c.lineTo(x1, poolFloor(x1));
  const pts = POOL_RUNS.flatMap(([a, ya, b, yb]) => [[a, ya], [b, yb]] as [number, number][]).filter(([x]) => x > x0 && x < x1).reverse();
  for (const [x, y] of pts) c.lineTo(x, y);
  c.lineTo(x0, poolFloor(x0));
  c.closePath();
};

/** World space, behind him: the deck, the beach, the pool's tiled inside, the floor, the far wall, the tower, the
 *  signs, the outflow pipe, the drain; the mazes; then GUPPLAX. */
export const drawPoolBack = (c: Ctx, state: GameState, pl: Pool) => {
  // (the flight: the pool's down there in the backdrop; here only the corpse, under him)
  if (pl.step === 'fly' || pl.step === 'done') { if (pl.f && pl.step === 'fly') { const p = state.player, up = p.height / 2 - 10, cx = p.pos.x + p.width / 2 - Math.sin(pl.rot) * up, cy = p.pos.y + p.height / 2 + Math.cos(pl.rot) * up; drawBurst(c, cx, cy, pl.rot, state.frame); } return; }
  const cam = state.camera, vx0 = Math.max(WP.beach, cam.x - 20), vx1 = Math.min(WP.x1, cam.x + W + 20);
  const topVis = cam.y < WP.surf + 20, deepVis = cam.y + H > WP.surf;
  // ---- above the surface: the deck's back wall, the palms, the beach (chunks)
  if (topVis) {
    const k0 = Math.floor((cam.x - 50 - WP.x0) / 400), k1 = Math.floor((cam.x + W + 50 - WP.x0) / 400);
    for (let k = Math.max(-1, k0); k <= Math.min(Math.ceil((WP.x1 - WP.x0) / 400), k1); k++) stamp(c, `wp3-deck-${k}`, WP.x0 + k * 400, WP.beachTop - 380, 400, 480, g => paintDeck(g, k));
  }
  // ---- under it: the back wall (the pattern), the light shafts, the floor and the shell under it
  if (deepVis && vx1 > vx0) {
    const pat = backPattern(c);
    if (pat) { c.fillStyle = pat; waterPath(c, vx0, vx1, null, false); c.fill(); }
    for (const m of MURALS) if (m.x < cam.x + W + 20 && m.x + m.w > cam.x - 20 && m.y < cam.y + H && m.y + m.h > cam.y) stamp(c, `wp3-mural-${m.x}`, m.x - 4, m.y - 4, m.w + 8, m.h + 8, g => paintMural(g, m));
    // (the depth markings along the waterline; the drop's warning; the lights set in the walls)
    c.font = '7px "Press Start 2P"'; c.fillStyle = '#F8FAFC';
    for (let x = WP.beach + 200; x < WP.x1 - 60; x += 700) if (x > cam.x - 60 && x < cam.x + W) c.fillText(`${feetAt(poolFloor(x + 40))} FT`, x, WP.surf + 22);
    if (WP.dropA > cam.x - 200 && WP.dropA < cam.x + W + 100) {
      c.font = '8px "Press Start 2P"'; c.fillStyle = '#FDE047';
      c.fillText('120 FT', WP.dropA + 70, WP.shelf + 80); c.fillText('NO DIVING', WP.dropA + 70, WP.shelf + 100);
      c.fillStyle = '#FCA5A5'; c.fillText('NO SURFACING', WP.dropA + 70, WP.shelf + 120);
    }
    for (let x = WP.beach + 400; x < WP.x1; x += 500) if (x > cam.x - 40 && x < cam.x + W + 40) { const y = poolFloor(x) - 60; R(c, x - 14, y - 8, 28, 16, INK); R(c, x - 12, y - 6, 24, 12, '#BAE6FD'); R(c, x - 12, y - 6, 24, 3, '#F0F9FF'); }
    // (the light shafts down from the surface: slanted, two bands each, gone by the deep)
    if (cam.y < WP.surf + 900) {
      for (let k = Math.floor((cam.x - 300) / 330); k <= Math.floor((cam.x + W + 200) / 330); k++) {
        const x = k * 330 + Math.sin(state.frame * 0.006 + k) * 30, h = 520 + (k % 3) * 120;
        for (const [w0, w1, a] of [[46, 110, 0.06], [20, 50, 0.06]] as const) {
          c.globalAlpha = a; c.fillStyle = '#D8F4FF';
          c.beginPath(); c.moveTo(x, WP.surf); c.lineTo(x + w0, WP.surf); c.lineTo(x + w0 - 120 + w1, WP.surf + h); c.lineTo(x - 120, WP.surf + h); c.closePath(); c.fill();
        }
      }
      c.globalAlpha = 1;
    }
    // (the floor: concrete under it, its lip lit (stood on))
    c.fillStyle = '#1E2228'; c.beginPath(); c.moveTo(vx0, poolFloor(vx0));
    const pts = POOL_RUNS.flatMap(([a, ya, b, yb]) => [[a, ya], [b, yb]] as [number, number][]).filter(([x]) => x > vx0 && x < vx1);
    for (const [x, y] of pts) c.lineTo(x, y);
    c.lineTo(vx1, poolFloor(vx1)); c.lineTo(vx1, WP.deep + 400); c.lineTo(vx0, WP.deep + 400); c.closePath(); c.fill();
    for (const [w, col, dy] of [[5, '#3A4A58', 3], [2, '#8ACCE8', 0]] as const) {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(vx0, poolFloor(vx0) + dy);
      for (const [x, y] of pts) c.lineTo(x, y + dy);
      c.lineTo(vx1, poolFloor(vx1) + dy); c.stroke();
    }
    // (the far wall: the wave machine's intakes, where the surges come from)
    if (cam.x + W > WP.x1 - 20) for (let j = Math.max(0, Math.floor((cam.y - WP.surf) / 600)); j <= Math.floor((cam.y + H - WP.surf) / 600) && WP.surf + j * 600 < WP.deep + 200; j++) stamp(c, `wp3-far-wall-${j}`, WP.x1, WP.surf + j * 600, 300, 600, g => paintFarWall(g, WP.surf + j * 600));
  }
  drawSigns(c, state, POOL_SIGNS);
  // (the outflow pipe in the deck's back wall: dribbling once he's come through it)
  if (cam.x < WP.pipe.x + 200 && topVis) {
    R(c, WP.pipe.x - 40, WP.pipe.y - 26, 76, 52, INK); R(c, WP.pipe.x - 36, WP.pipe.y - 22, 68, 44, '#5A6068'); R(c, WP.pipe.x - 36, WP.pipe.y - 22, 68, 4, '#8A9098');
    R(c, WP.pipe.x + 20, WP.pipe.y - 16, 12, 32, '#1A1208');
    if (pl.seen && state.frame % 4 < 2) R(c, WP.pipe.x + 30, WP.pipe.y + 10 + (state.frame % 8), 3, 4, '#6A4A20');
  }
  if (topVis && state.camera.x < TOWER.x + 200) stamp(c, 'wp3-tower', TOWER.x - 70, TOWER.seat - 120, 140, WP.beachTop - TOWER.seat + 124, g => paintTower(g));
  // ---- the mazes, then GUPPLAX (on the tower, in the pool; dead: belly up, puffed; the deflating balloon of him; the skin)
  drawMazesBack(c, state, pl.mz);
  const f = pl.f;
  const arm = f ? Math.min(5, f.tanks) : 0;
  if (f && (pl.step === 'fight' || pl.step === 'flush')) drawGup3(c, state, f);
  else if (f && pl.step === 'dying') drawGup(c, f.x, Math.min(f.y, WP.surf + 6) - Math.min(30, pl.t * 0.4), f.face, { pose: pl.t > 50 ? 'puffed' : 'hurt', q: 0, mouth: !!pl.said, arm }, state.frame);
  else if (f && pl.step === 'mount') drawGup(c, f.x, WP.surf - 24, f.face, { pose: 'puffed', q: 0, arm }, state.frame);
  else if (f && pl.step === 'swell') {
    // (swelling: scaled up round his middle, shaking; flashing pink the last of it)
    const S = swellOf(pl.t), j = (Math.random() - 0.5) * pl.t * 0.05;
    c.save(); c.translate(f.x + j, WP.surf - 24); c.scale(S, S);
    drawGup(c, 0, 0, f.face, { pose: 'puffed', q: 0, arm }, state.frame);
    c.restore();
    if (pl.t > SWELL - 30 && state.frame % 6 < 3) { c.globalAlpha = 0.35; c.fillStyle = '#F07A8A'; c.beginPath(); c.ellipse(f.x, WP.surf - 36 * S, 80 * S, 44 * S, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  }
};
// ---- the deck, by zone along the pool (the owner's: no going in circles; the water park as distinct attractions):
// THE BEACH (lounge chairs, umbrellas, palms: the tower's there), THE SNACK SHACK (SNAX, the towel hut, the bins
// overflowing), THE CABANAS (striped tents, a slide tower behind, tubes off it), THE DEEP END (the high dive, CLOSED,
// the first aid hut), THE MACHINE (chain-link, pipes, the housing). All of it behind the coping, dimmed toward the
// night (nothing there to stand on: no lit tops); the beach in front of it lit (stood on).
type DeckZone = 'beach' | 'snack' | 'cabana' | 'dive' | 'machine';
const deckZone = (x: number): DeckZone => { const d = x - WP.x0; return d < 1300 ? 'beach' : d < 2600 ? 'snack' : d < 4200 ? 'cabana' : d < 6000 ? 'dive' : 'machine'; };
const dimC = (col: string, k = 0.42) => mix(col, '#1A2244', k);
/** A box in steps, dimmed (back on the deck). */
const dbox = (g: Ctx, x: number, y: number, w: number, h: number, col: string, k = 0.42) => {
  R(g, x - 1, y - 1, w + 2, h + 2, INK); R(g, x, y, w, h, dimC(col, k));
  R(g, x, y, w, 2, dimC(mix(col, '#FFFFFF', 0.2), k + 0.08)); R(g, x, y, 2, h, dimC(mix(col, '#FFFFFF', 0.12), k + 0.05));
  R(g, x, y + h - 3, w, 3, dimC(mix(col, '#000000', 0.35), k)); R(g, x + w - 3, y, 3, h, dimC(mix(col, '#000000', 0.25), k));
};
const palmTree = (g: Ctx, x: number, base: number, hgt: number) => {
  // (a trunk in rings, curving; fronds in two greens, drooping, each with a lit spine)
  for (let i = 0; i < hgt; i += 8) { const k = i / hgt, tx = x + Math.sin(k * 1.6) * 14; R(g, tx - 5, base - i - 8, 10, 8, INK); R(g, tx - 4, base - i - 8, 8, 7, dimC(i % 16 ? '#7A5A3A' : '#6A4A2A')); R(g, tx - 4, base - i - 8, 2, 7, dimC('#9A7A50')); }
  const top = base - hgt, tx = x + Math.sin(1.6) * 14;
  for (let a = 0; a < 7; a++) {
    const ang = -Math.PI + (a / 6) * Math.PI, len = 60 + (a % 3) * 10, ex = tx + Math.cos(ang) * len, ey = top + 24 + Math.abs(Math.cos(ang)) * 20;
    for (const [w, col] of [[9, INK], [7, a % 2 ? '#2A6A3A' : '#3A7A3A'], [2, '#5A9A4A']] as const) { g.strokeStyle = w === 9 ? INK : dimC(col); g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(tx, top); g.quadraticCurveTo(tx + Math.cos(ang) * len * 0.5, top - 22, ex, ey); g.stroke(); }
  }
  g.lineCap = 'butt';
  g.fillStyle = INK; g.beginPath(); g.arc(tx - 4, top + 6, 6, 0, Math.PI * 2); g.arc(tx + 6, top + 8, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = dimC('#6A4A2A'); g.beginPath(); g.arc(tx - 4, top + 6, 4, 0, Math.PI * 2); g.arc(tx + 6, top + 8, 4, 0, Math.PI * 2); g.fill();
};
const paintDeck = (g: Ctx, k: number) => {
  const x0 = WP.x0 + k * 400, x1 = x0 + 400, bt = WP.beachTop, wallTop = bt - 70;
  const zone = deckZone(x0 + 200);
  // ---- the deck's back wall: stucco in steps, a tile band along its top, banded darker down to the deck
  for (let b = 0; b < 5; b++) R(g, x0, wallTop + b * 14, 400, 14, dimC(['#C8B8A0', '#B8A890', '#A89880', '#988870', '#887860'][b]));
  for (let b = 1; b < 5; b++) checker(g, x0, wallTop + b * 14 - 2, 400, 2, dimC(['#C8B8A0', '#B8A890', '#A89880', '#988870', '#887860'][b]), 0, 2);
  for (let x = x0; x < x1; x += 10) R(g, x, wallTop, 10, 6, dimC((x / 10) % 2 ? '#2A7AB8' : '#E8E4DC'));
  R(g, x0, wallTop - 2, 400, 2, INK);
  // ---- the zone's things, behind the wall's top and in front of it
  const r = (n: number) => hash(x0 * 0.13 + n);
  if (zone === 'beach') {
    palmTree(g, x0 + 80 + r(1) * 60, wallTop, 190 + r(2) * 60);
    if (k % 2 === 0) palmTree(g, x0 + 300 + r(3) * 40, wallTop, 160 + r(4) * 50);
    for (let i = 0; i < 2; i++) {
      // (a lounge chair, a folded umbrella stood by it)
      const cx = x0 + 60 + i * 190 + r(5 + i) * 40, cy = bt - 6;
      R(g, cx - 1, cy - 9, 62, 7, INK); for (let s = 0; s < 6; s++) R(g, cx + s * 10, cy - 8, 9, 5, dimC(s % 2 ? '#E8E4DC' : '#2A8AC8', 0.3));
      R(g, cx + 44, cy - 26, 16, 20, INK); R(g, cx + 45, cy - 25, 14, 18, dimC('#2A8AC8', 0.3)); R(g, cx + 2, cy - 2, 3, 6, INK); R(g, cx + 54, cy - 2, 3, 6, INK);
      R(g, cx + 76, cy - 90, 4, 90, dimC('#E8E4DC', 0.35)); g.fillStyle = dimC(i ? '#E04A3A' : '#F0C040', 0.3); g.beginPath(); g.moveTo(cx + 70, cy - 90); g.lineTo(cx + 78, cy - 98); g.lineTo(cx + 86, cy - 90); g.lineTo(cx + 82, cy - 40); g.lineTo(cx + 74, cy - 40); g.closePath(); g.fill();
    }
  } else if (zone === 'snack') {
    if (k % 3 === 0) {
      // (SNAX: the shack, its counter shuttered, the menu board, the awning dimmed (not a ledge))
      dbox(g, x0 + 60, bt - 150, 220, 150, '#D8A040');
      for (let s = 0; s < 11; s++) { g.fillStyle = dimC(s % 2 ? '#E8E4DC' : '#C83A2A', 0.5); g.beginPath(); g.moveTo(x0 + 50 + s * 22, bt - 160); g.lineTo(x0 + 72 + s * 22, bt - 160); g.lineTo(x0 + 72 + s * 22, bt - 140); g.lineTo(x0 + 61 + s * 22, bt - 134); g.lineTo(x0 + 50 + s * 22, bt - 140); g.closePath(); g.fill(); }
      for (let v = 0; v < 6; v++) R(g, x0 + 80, bt - 120 + v * 8, 120, 5, dimC('#7A7A80'));
      dbox(g, x0 + 210, bt - 124, 56, 44, '#2A2A2A'); for (let v = 0; v < 4; v++) R(g, x0 + 216, bt - 116 + v * 9, 30 + (v % 2) * 10, 2, dimC('#F0E070', 0.3));
      g.font = '12px "Press Start 2P"'; g.fillStyle = INK; g.fillText('SNAX', x0 + 125, bt - 168); g.fillStyle = dimC('#F0D040', 0.2); g.fillText('SNAX', x0 + 124, bt - 169);
    } else {
      // (the towel hut, the bins overflowing)
      dbox(g, x0 + 40, bt - 110, 120, 110, '#3A8AC8');
      for (let v = 0; v < 4; v++) R(g, x0 + 50, bt - 96 + v * 18, 100, 12, dimC(['#E04A3A', '#F0C040', '#E8E4DC', '#3AA04A'][v], 0.4));
      for (const bx of [x0 + 240, x0 + 300]) { dbox(g, bx, bt - 50, 36, 50, '#3A5A3A'); for (let q = 0; q < 4; q++) R(g, bx + 2 + q * 8, bt - 58 - (q % 2) * 6, 8, 10, dimC(['#E8E4DC', '#C83A2A', '#F0C040', '#8A6A3A'][q], 0.35)); }
    }
  } else if (zone === 'cabana') {
    // (the slide tower behind, its tubes off it; the striped cabanas in front of the wall)
    if (k % 2 === 1) {
      R(g, x0 + 260, bt - 330, 50, 260, INK); R(g, x0 + 262, bt - 328, 46, 258, dimC('#8A8E98', 0.5));
      for (let y = bt - 320; y < bt - 70; y += 26) { g.strokeStyle = dimC('#5A5E68', 0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 262, y); g.lineTo(x0 + 308, y + 26); g.stroke(); }
      g.lineCap = 'round';
      for (const [col, pts] of [['#E04A3A', [[x0 + 285, bt - 320], [x0 + 380, bt - 260], [x0 + 200, bt - 190], [x0 + 330, bt - 110]]], ['#3A8AE0', [[x0 + 285, bt - 300], [x0 + 150, bt - 240], [x0 + 260, bt - 150], [x0 + 120, bt - 90]]]] as [string, [number, number][]][]) for (const [w, cc] of [[22, INK], [18, col], [6, mix(col, '#FFFFFF', 0.35)]] as const) { g.strokeStyle = w === 22 ? INK : dimC(cc, 0.5); g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); g.stroke(); }
      g.lineCap = 'butt';
    }
    for (let i = 0; i < 2; i++) {
      const cx = x0 + 40 + i * 200 + r(9 + i) * 30, col = ['#E04A3A', '#2A8AC8', '#3AA04A', '#F0A030'][(k + i) % 4];
      g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 2, bt); g.lineTo(cx + 60, bt - 112); g.lineTo(cx + 122, bt); g.closePath(); g.fill();
      for (let s = 0; s < 6; s++) { g.fillStyle = dimC(s % 2 ? '#E8E4DC' : col, 0.45); g.beginPath(); g.moveTo(cx + 60, bt - 108); g.lineTo(cx + s * 20, bt); g.lineTo(cx + s * 20 + 20, bt); g.closePath(); g.fill(); }
      g.fillStyle = dimC('#0A0A10', 0.2); g.beginPath(); g.moveTo(cx + 60, bt - 60); g.lineTo(cx + 44, bt); g.lineTo(cx + 76, bt); g.closePath(); g.fill();
      R(g, cx + 58, bt - 126, 4, 16, INK); R(g, cx + 62, bt - 126, 12, 7, dimC(col, 0.3));
    }
  } else if (zone === 'dive') {
    if (k % 3 === 0) {
      // (the high dive: a tower of scaffold, the board off its top, a chain across the ladder: CLOSED)
      for (const lx of [x0 + 160, x0 + 220]) { R(g, lx - 3, bt - 300, 6, 300, INK); R(g, lx - 2, bt - 300, 4, 300, dimC('#C8CCD4', 0.5)); }
      for (let y = bt - 290; y < bt; y += 30) R(g, x0 + 160, y, 60, 3, dimC('#8A8E98', 0.5));
      R(g, x0 + 150, bt - 306, 180, 10, INK); R(g, x0 + 152, bt - 304, 176, 6, dimC('#2A8AC8', 0.45));
      R(g, x0 + 150, bt - 200, 80, 14, INK); R(g, x0 + 152, bt - 198, 76, 10, dimC('#C83A2A', 0.35));
      g.font = '7px "Press Start 2P"'; g.fillStyle = dimC('#F8FAFC', 0.2); g.fillText('CLOSED', x0 + 165, bt - 189);
    } else if (k % 3 === 1) {
      // (FIRST AID: a hut, its cross, its door hanging open, the light out)
      dbox(g, x0 + 100, bt - 120, 160, 120, '#E8E4DC');
      R(g, x0 + 160, bt - 108, 40, 12, dimC('#C83A2A', 0.3)); R(g, x0 + 174, bt - 122, 12, 40, dimC('#C83A2A', 0.3));
      R(g, x0 + 120, bt - 70, 34, 70, INK); R(g, x0 + 150, bt - 70, 10, 70, dimC('#7A7A80'));
      g.font = '7px "Press Start 2P"'; g.fillStyle = INK; g.fillText('FIRST AID', x0 + 186, bt - 60);
    } else palmTree(g, x0 + 200 + r(7) * 80, wallTop, 210);
  } else {
    // (the machine end: chain-link over the wall, pipes along it, a warning board)
    for (let x = x0; x < x1; x += 12) { g.strokeStyle = dimC('#7A7E88', 0.5); g.lineWidth = 1; g.beginPath(); g.moveTo(x, wallTop - 90); g.lineTo(x + 12, wallTop - 78); g.moveTo(x + 12, wallTop - 90); g.lineTo(x, wallTop - 78); g.stroke(); }
    for (let x = x0; x < x1; x += 100) R(g, x, wallTop - 96, 4, 96, dimC('#5A5E68', 0.4));
    R(g, x0, wallTop - 98, 400, 3, dimC('#8A8E98', 0.4));
    for (const py of [wallTop + 20, wallTop + 40]) { R(g, x0, py, 400, 10, INK); R(g, x0, py + 1, 400, 8, dimC('#4A6A7A', 0.4)); R(g, x0, py + 1, 400, 2, dimC('#7A9AAA', 0.4)); for (let x = x0 + 30; x < x1; x += 90) R(g, x, py - 2, 8, 14, dimC('#2A3A44', 0.4)); }
    if (k % 2 === 0) { dbox(g, x0 + 140, wallTop - 70, 120, 44, '#F0C040', 0.3); g.font = '7px "Press Start 2P"'; g.fillStyle = INK; g.fillText('DANGER', x0 + 170, wallTop - 52); g.fillText('WAVE MACHINE', x0 + 150, wallTop - 38); }
  }
  // ---- the beach (zero-entry concrete, warm, its top lit in steps: stood on; wet and darker toward the water); past
  // it, the pool's coping behind the water (dimmed)
  for (let x = x0; x < x1; x += 20) {
    if (x + 20 <= WP.beach) {
      const wet = Math.max(0, Math.min(1, (x - (WP.beach - 200)) / 200));
      const col = mix('#C8B898', '#8A8070', wet * 0.6);
      R(g, x, bt, 20, 100, col); R(g, x, bt, 20, 3, mix('#F8ECD0', col, wet * 0.5)); R(g, x, bt + 3, 20, 3, mix(col, '#FFFFFF', 0.18));
      checker(g, x, bt + 6, 20, 4, mix(col, '#FFFFFF', 0.18), 0, 2); checker(g, x, bt + 30, 20, 70, mix(col, '#000000', 0.15), 0, 2);
      if (wet > 0.3 && (x / 20) % 3 === 0) R(g, x + 4, bt + 1, 10, 1, '#E0F2FE');
    }
    else if (x < WP.x1) {
      R(g, x, bt, 20, WP.surf - bt, dimC('#B8B0A0')); R(g, x, bt, 20, 2, dimC('#D8D0C0'));
      R(g, x, WP.surf - 6, 20, 6, dimC((x / 20) % 2 ? '#2A7AB8' : '#E8E4DC', 0.3));
    }
  }
  // ---- the wave machine's housing over the far wall: concrete in steps, louvers, WAVE POOL in big letters
  if (x1 > WP.x1) {
    const hx = WP.x1, top = bt - 340;
    R(g, hx - 2, top - 2, 404, WP.surf - top + 104, INK);
    for (let b = 0; b < 6; b++) R(g, hx, top + b * 60, 400, 60, ['#6A7078', '#62686F', '#5A6068', '#52585F', '#4A5058', '#42484F'][b]);
    R(g, hx, top, 400, 6, '#8A9098'); R(g, hx, top + 6, 400, 2, '#7A8088');
    for (let y = top + 60; y < bt - 40; y += 30) for (let k2 = 0; k2 < 3; k2++) { R(g, hx + 70 + k2 * 70, y, 50, 5, '#22282F'); R(g, hx + 70 + k2 * 70, y + 5, 50, 1, '#8A9098'); }
    g.font = '10px "Press Start 2P"'; g.fillStyle = INK; g.fillText('WAVE', hx + 15, top + 41); g.fillText('POOL', hx + 15, top + 57); g.fillStyle = '#FACC15'; g.fillText('WAVE', hx + 14, top + 40); g.fillText('POOL', hx + 14, top + 56);
    if (k % 2 === 0) { g.fillStyle = '#DC2626'; g.beginPath(); g.arc(hx + 30, top + 80, 6, 0, Math.PI * 2); g.fill(); }
  }
};
const paintFarWall = (g: Ctx, y0: number) => {
  // (the far wall under the surface: concrete, banded darker down; the intakes, huge grilles, one a screen)
  const x = WP.x1;
  for (let y = y0; y < y0 + 600; y += 40) { const k = Math.max(0, Math.min(1, (y - WP.surf) / (WP.deep - WP.surf))); R(g, x, y, 300, 40, mix('#4A5460', '#0A1018', k)); R(g, x, y, 300, 1, mix('#6A7480', '#141C24', k)); }
  for (let y = Math.ceil((y0 - WP.surf) / 600) * 600 + WP.surf + 140; y < y0 + 600; y += 600) {
    if (y > WP.deep - 60) continue;
    const k = Math.max(0, Math.min(1, (y - WP.surf) / (WP.deep - WP.surf)));
    R(g, x + 6, y - 6, 120, 232, INK); R(g, x + 10, y - 2, 112, 224, mix('#2A3038', '#05080C', k));
    for (let j = 0; j < 9; j++) R(g, x + 14, y + 8 + j * 24, 104, 6, mix('#7A8490', '#1A2028', k));
  }
};
const paintTower = (g: Ctx) => {
  // (the lifeguard tower: white-painted wood, a ladder, a red cross on the seat's back, an umbrella)
  const x = TOWER.x, s = TOWER.seat, ft = WP.beachTop;
  for (const lx of [x - 40, x + 36]) { R(g, lx - 2, s - 2, 8, ft - s + 2, INK); R(g, lx, s, 4, ft - s, '#E8E4DC'); }
  for (let y = s + 20; y < ft; y += 22) R(g, x - 40, y, 80, 3, '#D8D4CC');
  R(g, x - 46, s - 4, 92, 10, INK); R(g, x - 44, s - 2, 88, 6, '#F1EFEA');
  R(g, x + 20, s - 60, 26, 58, INK); R(g, x + 22, s - 58, 22, 54, '#F1EFEA'); R(g, x + 30, s - 48, 6, 18, '#DC2626'); R(g, x + 24, s - 42, 18, 6, '#DC2626');
  R(g, x - 2, s - 118, 4, 60, '#3A3A3A');
  g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(x - 60, s - 100); g.quadraticCurveTo(x, s - 130, x + 60, s - 100); g.closePath(); g.fill();
  g.fillStyle = '#F8FAFC'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x - 60 + k * 40, s - 100); g.lineTo(x - 40 + k * 40, s - 122 + Math.abs(k - 1) * 6); g.lineTo(x - 20 + k * 40, s - 100); g.closePath(); g.fill(); }
};

/** The water's wash (over everything under the surface: bluer up top, murkier down), in bands. */
const WASH = ['rgba(30, 120, 160, 0.30)', 'rgba(24, 100, 140, 0.34)', 'rgba(18, 80, 120, 0.38)', 'rgba(12, 60, 100, 0.42)', 'rgba(8, 44, 80, 0.46)', 'rgba(6, 32, 64, 0.50)', 'rgba(4, 22, 48, 0.54)'];
/** World space, in front: the wash, the surface (swelling before a surge), the wave lines, the surge's streaks, the
 *  chlorine, GUPPLAX's crests and globs and words; the whirlpool. */
export const drawPoolFront = (c: Ctx, state: GameState, pl: Pool) => {
  if (pl.step === 'fly' || pl.step === 'done') return;
  const cam = state.camera, x0 = Math.max(WP.beach, cam.x - 20), x1 = Math.min(WP.x1, cam.x + W + 20), f = state.frame;
  const wv = pl.step === 'fight' ? pl.wv : null;
  if (x1 > x0 && cam.y + H > WP.surf - 30) {
    c.save(); waterPath(c, x0, x1, wv, true); c.clip();
    const bh = (WP.deep - WP.surf) / WASH.length;
    for (let i = 0; i < WASH.length; i++) {
      const y = WP.surf - 30 + i * bh, y2 = i === WASH.length - 1 ? WP.deep + 10 : y + bh + 30;
      if (y2 < cam.y || y > cam.y + H) continue;
      c.fillStyle = WASH[i]; c.fillRect(x0, Math.max(y, cam.y - 2), x1 - x0, Math.min(y2, cam.y + H + 2) - Math.max(y, cam.y - 2));
    }
    c.restore();
    if (cam.y < WP.surf + 40) {
      c.strokeStyle = 'rgba(200, 240, 255, 0.75)'; c.lineWidth = 2;
      c.beginPath(); for (let x = x0; x <= x1; x += 16) { const y = WP.surf - (wv ? swellAt(wv, x) : 0) + Math.sin((x + f * 2.4) * 0.03) * 3; if (x === x0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
      for (let k = 0; k < 10; k++) { const wx = WP.x1 - ((f * 1.3 + k * 700) % (WP.x1 - WP.beach)); if (wx > x0 && wx < x1) { const y = WP.surf - (wv ? swellAt(wv, wx) : 0); c.fillStyle = 'rgba(240, 250, 255, 0.7)'; c.fillRect(wx - 30, y - 4, 40, 3); c.fillRect(wx - 10, y - 6, 12, 2); } }
    }
  }
  if (wv) drawWaves(c, state, wv);
  drawMazesFront(c, state, pl.mz);
  if (pl.f && pl.step === 'fight') drawGupFront(c, state, pl.f);
  if (pl.step === 'dying' && pl.said && pl.f) saidOver3(c, state, pl.said, pl.f.x, WP.surf - 200);
};
const saidOver3 = (c: Ctx, state: GameState, text: string, x: number, y: number) => {
  c.font = '7px "Press Start 2P"'; c.textAlign = 'center';
  const sx = Math.max(state.camera.x + 160, Math.min(state.camera.x + W - 160, x));
  c.fillStyle = '#000'; c.fillText(text, sx + 1, y + 1); c.fillStyle = '#BEF264'; c.fillText(text, sx, y);
  c.textAlign = 'left';
};

/** Screen space: his bar (boss.ts); his air (a big gauge down the left, under the HUD's corner) and how deep he is;
 *  the surge's warning; the intros' letterbox and SKIP; the end's letterbox, SKIP, the ride down the storm pipes and
 *  VICTORY over it. */
export const drawPoolHud = (c: Ctx, state: GameState, pl: Pool) => {
  if (pl.step === 'fight' && pl.f) {
    drawGupHud(c, state, pl.f, topBand());
    const p = state.player;
    if (pl.f.mode === 'on' && !p.inCutscene && p.health > 0) {
      // (his air: a bar along the bottom left, his depth after it; flashing red low)
      const a = air3(state), { x, y, w, h } = AIR_GAUGE;
      if (p.swimming || a < 0.999) {
        label(c, 'AIR', x + 14, y - 4, '#E0F2FE', 6);
        box(c, x + 30, y - 12, w, h, '#0C1A2A'); box(c, x + 32, y - 10, w - 4, h - 4, '#06101A');
        const fill = Math.round((w - 4) * a), low = a < 0.3, col = low ? (state.frame % 16 < 8 ? '#F87171' : '#FCA5A5') : '#7DD3FC';
        box(c, x + 32, y - 10, fill, h - 4, col); box(c, x + 32, y - 10, fill, 2, low ? '#FECACA' : '#E0F2FE');
        for (let i = 1; i < 6; i++) box(c, x + 32 + Math.round(((w - 4) * i) / 6), y - 10, 1, h - 4, '#0C1A2A');
        label(c, feetAt(p.pos.y + p.height / 2) + ' FT', x + w + 62, y - 4, '#BAE6FD', 6);
      }
      // (the surge coming: the klaxon's light, flashing, at the screen's right edge)
      const s = surgeOf(pl.wv);
      if (s.st === 'tell' || (s.st === 'on' && s.push > 0.3)) {
        const on = s.st === 'on' || state.frame % 16 < 9;
        if (on) { label(c, s.st === 'tell' ? 'SURGE!' : '<<< SURGE', W / 2, H - 30, s.st === 'tell' ? '#FDE047' : '#7DD3FC', 8); }
      }
    }
  }
  if (pl.step === 'flush' || (pl.step !== 'fight' && pl.step !== 'idle')) {
    const k = Math.min(1, (pl.step === 'flush' ? pl.t : pl.skipT) / 20), bar = Math.round(k * 44);
    c.fillStyle = '#000'; c.fillRect(0, 0, W, bar); c.fillRect(0, H - bar, W, bar);
    if (pl.step !== 'flush' && pl.step !== 'done' && pl.skipT > SKIP_AFTER) drawSkipPrompt(c, W);
    if (pl.flash > 0) { c.globalAlpha = Math.min(1, pl.flash / 8); c.fillStyle = pl.flash > 10 ? '#FFFFFF' : '#E8FFD0'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    if (pl.v) drawVictory(c, pl.v);
  }
};
export { MAZE_BOX };
