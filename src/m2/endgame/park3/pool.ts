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
//   THE END     (a cutscene, skippable all-or-nothing) GUPPLAX's death: up to the surface, choking on his whistle (every
//               tank burst: his throat swelling shut), swelling, his last line, belly up; then the air goes out of him: a
//               squeal, he zips round like a let-go balloon and slaps down flat, a skin on the water. Meathead's line.
//               The wave machine dies and the main drain opens under him: a whirlpool; the skin goes down it, then him
//               (his line), down the drain into the dark: tumbling through the storm pipes, VICTORY (timed to end as he
//               comes out), spat out at the parking lot (level 4's start: stages.ts). The hour's on (13).
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
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone, VICTORY_FRAMES } from '../../victory';
import { stamp, checker, bandedGradient, mix, hash } from '../../intro/art/kit';
import { byPants } from '../park1/kinds';
import { ENDGAME_STAGES } from '../stages';
import { WP, poolFloor, POOL_RUNS, POOL_SIGNS, PUMP_ROOM, CP3, feetAt } from './geo';
import { drawSigns } from './art';
import { air3 } from './hazards';
import { type Fight3, startGup, updateGup, gupDead, gupTank, drawGup3, drawGupFront, drawGupHud, splash, TOWER, AIR_GAUGE } from './boss';
import { type Mazes, newMazes, updateMazes, mazeBlocks, drawMazesBack, drawMazesFront, mazeLights, mazeAt, tankInView, TANK_COUNT, MAZE_BOX } from './mazes';
import { type Waves, newWaves, updateWaves, surgeOf, swellAt, drawWaves } from './waves';
import { drawGup } from './gupArt';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const INK = '#04080C';
const hands = (): Controls => ({ ...NO_CONTROLS });

/** His air in the pool (frames from full to none: ~38 s; the tunnels' is 22), and how fast it comes back at the top. */
export const POOL_AIR = { frames: 2300, refill: 15, src: 'm2:wp3_pooldrown' };

type Step = 'idle' | 'flush' | 'fight' | 'dying' | 'deflate' | 'skin' | 'drain' | 'ride' | 'done';
export interface Pool {
  step: Step; t: number; skipT: number; talk: number;
  f: Fight3 | null; mz: Mazes; wv: Waves;
  /** He's been through the flush this visit (the next: the retry's intro). */
  seen: boolean;
  /** The deflate's path (where he is, zipping round), the skin's spot, the drain (where, how open). */
  bx: number; by: number; ba: number; skinX: number; drainX: number; drain: number;
  v: Victory | null; said: string | null;
  /** (the stub, if level 4 isn't in yet) He's come back up out of the drain. */
  stubbed: boolean;
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
    bx: 0, by: 0, ba: 0, skinX: 0, drainX: 0, drain: 0, v: null, said: null, stubbed: false, camY: WP.surf - 400,
    lineAt: {}, owe: null, once: {},
  };
};
export const poolOn = (pl: Pool) => pl.step !== 'idle';

/** Level 4's start (the first stage of level 4 in stages.ts), or null (not in yet: the stub). */
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
        // (the hour on, the file on to level 4's start (CONTINUE: its start); level 4's not in: still here)
        setEndgameHour(HOUR_AFTER);
        const l4 = level4();
        if (l4) { setEndgameAt({ stage: l4.id, cp: l4.cp }); saveProgress(); }
      }
      return out;
    }
  }
  // ---- THE END (a cutscene: skippable, all of it)
  const f = pl.f!;
  p.inCutscene = true; p.untouchable = true; setUi({ introCutscene: true });
  if (pl.step !== 'ride' && pl.step !== 'done') {
    if (pl.skipT > SKIP_AFTER) offerSkip();
    if (pl.skipT > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; pl.said = null; pl.step = 'ride'; pl.t = 0; pl.v = startVictory(); p.hidden = true; return hands(); }
  }
  const t = pl.t, camAt = (x: number) => ({ x: Math.max(WP.x0 - 60, Math.min(WP.x1 + 200 - W, x - W / 2)), y: WP.surf - 260 });
  if (pl.step === 'dying' || pl.step === 'deflate' || pl.step === 'skin') {
    // (him: up at the surface, treading water off to the side, watching)
    p.carried = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
    const at = pl.step === 'skin' ? pl.skinX : f.x;
    const tx = Math.max(WP.beach + 200, at - 260) - p.width / 2, ty = WP.surf - p.height * 0.45 + Math.sin(state.frame * 0.08) * 2;
    p.pos.x += (tx - p.pos.x) * 0.06; p.pos.y += (ty - p.pos.y) * 0.08;
  }
  switch (pl.step) {
    case 'dying': {
      // (up to the surface, choking on his whistle (or his throat swelling shut: every tank), swelling up; his last
      // line; belly up)
      f.y += (WP.surf + 6 - f.y) * 0.08;
      state.cameraOverride = camAt(f.x);
      const all = f.tanks >= TANK_COUNT;
      if (t === 1) { playSound('retch', 0.9, 8); speakGup(pl, pickLine(byPants(state, all ? L.GUP_DEATH_ALL : L.GUP_DEATH)), () => { pl.talk = 1; }); }
      if (t % 20 === 5) playSound(all ? 'snort' : 'beep', 0.4, 18 - Math.min(16, t / 10));
      if ((pl.talk === 1 && t > 90) || t > 700) { pl.step = 'deflate'; pl.t = 0; pl.bx = f.x; pl.by = WP.surf - 60; pl.ba = 0; playSound('fart', 1, 6); }
      break;
    }
    case 'deflate': {
      // (the air going out of him: zipping round like a let-go balloon, squealing, then slapped down flat)
      const k = t / 110;
      pl.ba += 0.21 + k * 0.1;
      pl.bx += Math.cos(pl.ba) * 9 - 1.2; pl.by += Math.sin(pl.ba * 1.3) * 7;
      pl.bx = Math.max(WP.beach + 300, Math.min(WP.x1 - 80, pl.bx)); pl.by = Math.max(WP.surf - 300, Math.min(WP.surf - 30, pl.by));
      state.cameraOverride = camAt(pl.bx);
      if (t % 7 === 0) playSound('fart', 0.7, 4 + (t % 21) / 3);
      if (t % 3 === 0) state.particles.push({ pos: { x: pl.bx - Math.cos(pl.ba) * 40, y: pl.by - Math.sin(pl.ba * 1.3) * 30 }, vel: { x: -Math.cos(pl.ba) * 2, y: -Math.sin(pl.ba) * 2 }, life: 24, color: '#9AF060', size: 4 });
      if (t >= 110) { pl.step = 'skin'; pl.t = 0; pl.skinX = pl.bx; pl.drainX = Math.max(WP.beach + 400, Math.min(WP.x1 - 200, pl.bx + 160)); splash(state, pl.skinX, 26); playSound('splat', 1, -10); playSound('splash', 0.8, -8); shakeScreen(state, 8, 4); }
      break;
    }
    case 'skin':
      // (flat on the water; his line over it)
      state.cameraOverride = camAt(pl.skinX);
      if (t === 30) meatheadSays(state, pickLine(byPants(state, L.MH_GUP_DEAD)), true, () => { pl.talk = 2; });
      if ((pl.talk === 2 && t > 60) || t > 600) { pl.step = 'drain'; pl.t = 0; playSound('rumble', 1, -14); playSound('glug', 1, -12); shakeScreen(state, 10, 5); }
      break;
    case 'drain': {
      // (the wave machine dies, the main drain opens: a whirlpool; the skin goes down, then him (his line), into it)
      pl.drain = Math.min(1, pl.drain + 0.012);
      state.cameraOverride = camAt(pl.drainX);
      pl.skinX += (pl.drainX - pl.skinX) * 0.03;
      p.carried = true; p.vel.x = 0; p.vel.y = 0;
      const a = t * 0.18, r = Math.max(0, 260 - t * 2.2);
      const tx = pl.drainX + Math.cos(a) * r - p.width / 2, ty = WP.surf - p.height + 10 + Math.max(0, t - 100) * 2.5;
      p.pos.x += (tx - p.pos.x) * 0.12; p.pos.y += (ty - p.pos.y) * 0.12;
      p.spriteRot = t > 60 ? a * 0.5 : 0;
      if (t === 40) meatheadSays(state, pickLine(byPants(state, L.MH_DRAIN)), false);
      if (t % 15 === 0) playSound('gush', 0.6, -10);
      if (t >= 150) { p.hidden = true; pl.step = 'ride'; pl.t = 0; pl.v = startVictory(); playSound('fallwhistle', 0.6, -4); }
      break;
    }
    case 'ride':
      if (pl.v) tickVictory(state, pl.v);
      if (t % 24 === 0) playSound('gush', 0.4, -6 + (t % 5));
      if (t >= VICTORY_FRAMES || (pl.v && victoryDone(pl.v))) {
        pl.v = null; pl.step = 'done'; pl.t = 0;
        p.spriteRot = 0; p.untouchable = false;
        const l4 = level4();
        if (l4) { setStartCheckpoint(l4.cp); goTo(l4.id); }
        else {
          // TODO(level 4): STUB, for level 4's agent to wire up: when stages.ts has a level-4 stage, the line above goes
          // there (its first checkpoint: the parking lot). Till then he's put back on the beach, his control back.
          pl.stubbed = true; p.inCutscene = false; p.hidden = false; p.carried = false; state.cameraOverride = null;
          p.pos.x = WP.x0 + 200; p.pos.y = WP.beachTop - p.height; p.vel.x = 0; p.vel.y = 0;
          setUi({ introCutscene: false });
        }
      }
      break;
    case 'done':
      if (pl.stubbed) { p.inCutscene = false; p.untouchable = false; setUi({ introCutscene: false }); state.cameraMinX = WP.x0 - 60; state.cameraMaxX = WP.x1 + 200 - W; return controls; }
      break;
  }
  return hands();
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
  const ls: Light[] = [
    { x: TOWER.x - 10, y: TOWER.seat - 90, r: 320, a: 0.45, color: '#FDE68A' },
    { x: WP.x0 + 300, y: WP.beachTop - 200, r: 360, a: 0.4, color: '#FDE68A' },
  ];
  for (let x = WP.beach + 400; x < WP.x1; x += 500) ls.push({ x, y: poolFloor(x) - 60, r: 230, a: pl.step === 'drain' ? 0.05 : 0.3, color: '#7DD3FC' });
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
export const drawPoolBackdrop = (c: Ctx, state: GameState, _pl: Pool) => {
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
  const dim = (col: string) => mix(col, '#1A2244', 0.55);
  g.fillStyle = dim('#5A5A6A'); g.beginPath(); g.moveTo(x0 + 520, y0 + 200); g.lineTo(x0 + 640, y0 + 30); g.lineTo(x0 + 700, y0 + 70); g.lineTo(x0 + 800, y0 + 200); g.closePath(); g.fill();
  g.fillStyle = dim('#E8ECF0'); g.beginPath(); g.moveTo(x0 + 610, y0 + 74); g.lineTo(x0 + 640, y0 + 30); g.lineTo(x0 + 668, y0 + 60); g.closePath(); g.fill();
  for (const [x, h] of [[80, 120], [200, 90], [330, 140]] as const) { R(g, x0 + x, y0 + 200 - h, 14, h, dim('#4A5A6A')); g.strokeStyle = dim(['#E04A3A', '#3A8AE0', '#E0C03A'][x % 3]); g.lineWidth = 8; g.beginPath(); g.moveTo(x0 + x + 7, y0 + 200 - h); g.bezierCurveTo(x0 + x + 80, y0 + 200 - h, x0 + x - 40, y0 + 200 - h / 2, x0 + x + 60, y0 + 196); g.stroke(); }
  for (let k = 0; k < 14; k++) R(g, x0 + 40 + k * 60, y0 + 186 - (k % 3) * 8, 4, 4, dim('#FDE68A'));
  R(g, x0, y0 + 196, 900, 4, dim('#2A3446'));
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
  // (the main drain on the deep floor, opened under him at the end: a black hole)
  if (pl.drain > 0) { c.fillStyle = '#000'; c.beginPath(); c.ellipse(pl.drainX, WP.surf + 4, 40 * pl.drain + 6, 6, 0, 0, Math.PI * 2); c.fill(); }
  if (topVis && state.camera.x < TOWER.x + 200) stamp(c, 'wp3-tower', TOWER.x - 70, TOWER.seat - 120, 140, WP.beachTop - TOWER.seat + 124, g => paintTower(g));
  // ---- the mazes, then GUPPLAX (on the tower, in the pool; dead: belly up, puffed; the deflating balloon of him; the skin)
  drawMazesBack(c, state, pl.mz);
  const f = pl.f;
  const arm = f ? Math.min(5, f.tanks) : 0;
  if (f && (pl.step === 'fight' || pl.step === 'flush')) drawGup3(c, state, f);
  else if (f && pl.step === 'dying') drawGup(c, f.x, Math.min(f.y, WP.surf + 6) - Math.min(30, pl.t * 0.4), f.face, { pose: pl.t > 50 ? 'puffed' : 'hurt', q: 0, mouth: !!pl.said, arm }, state.frame);
  else if (f && pl.step === 'deflate') { const k = Math.max(0.35, 1 - pl.t / 140); c.save(); c.translate(pl.bx, pl.by); c.scale(k, k); drawGup(c, 0, 0, Math.cos(pl.ba) < 0 ? -1 : 1, { pose: 'puffed', q: 0, arm }, state.frame); c.restore(); }
  else if (f && (pl.step === 'skin' || pl.step === 'drain')) { const k = pl.step === 'drain' ? Math.min(1, pl.t / 80) : 0; c.save(); c.translate(pl.skinX, WP.surf + k * 30); c.scale(1 - k * 0.7, 1 - k * 0.7); drawGup(c, 0, 0, 1, { pose: 'skin', q: 0 }, state.frame); c.restore(); }
};
const paintDeck = (g: Ctx, k: number) => {
  const x0 = WP.x0 + k * 400, x1 = x0 + 400;
  const dimC = (col: string) => mix(col, '#1A2244', 0.4);
  // ---- the deck's back: a low wall, palms in planters behind it (dimmed: nothing back there to stand on)
  R(g, x0, WP.beachTop - 70, 400, 70, dimC('#7A7468')); R(g, x0, WP.beachTop - 70, 400, 4, dimC('#A8A090'));
  checker(g, x0, WP.beachTop - 66, 400, 4, dimC('#6A6458'), 0, 2);
  for (let x = x0 + 60 + (k % 2) * 90; x < x1; x += 260) {
    const hgt = 200 + Math.floor(hash(x) * 80);
    R(g, x - 4, WP.beachTop - 70 - hgt, 8, hgt, dimC('#6A4A2A'));
    for (let a = 0; a < 6; a++) { g.strokeStyle = dimC('#2A6A3A'); g.lineWidth = 6; g.beginPath(); g.moveTo(x, WP.beachTop - 70 - hgt); g.quadraticCurveTo(x + Math.cos(a) * 60, WP.beachTop - 110 - hgt + Math.sin(a) * 10, x + Math.cos(a) * 90, WP.beachTop - 50 - hgt + Math.abs(Math.sin(a)) * 30); g.stroke(); }
  }
  // (a deck chair now and then, behind the coping; a lamp post)
  if (k % 3 === 1) { R(g, x0 + 200, WP.beachTop - 30, 60, 6, dimC('#E8E4DC')); R(g, x0 + 250, WP.beachTop - 56, 6, 30, dimC('#E8E4DC')); }
  if (k % 4 === 2) { R(g, x0 + 320, WP.beachTop - 260, 6, 190, dimC('#3A3A44')); R(g, x0 + 310, WP.beachTop - 270, 26, 10, dimC('#FDE68A')); }
  // ---- the beach (zero-entry concrete, warm, its top lit: stood on); past it, the pool's coping behind the water
  for (let x = x0; x < x1; x += 20) {
    if (x + 20 <= WP.beach) { R(g, x, WP.beachTop, 20, 100, '#C8B898'); R(g, x, WP.beachTop, 20, 3, '#F0E4C8'); R(g, x, WP.beachTop + 3, 20, 2, '#D8CCB0'); checker(g, x, WP.beachTop + 20, 20, 80, '#B0A080', 0, 2); }
    else if (x < WP.x1) { R(g, x, WP.beachTop, 20, WP.surf - WP.beachTop, dimC('#B8B0A0')); R(g, x, WP.beachTop, 20, 2, dimC('#D8D0C0')); }
  }
  // ---- the wave machine's housing over the far wall: concrete, louvers, WAVE POOL in big letters
  if (x1 > WP.x1) {
    const hx = WP.x1, top = WP.beachTop - 340;
    R(g, hx, top, 400, WP.surf - top + 100, '#5A6068'); R(g, hx, top, 400, 6, '#7A8088');
    for (let y = top + 60; y < WP.beachTop - 40; y += 30) for (let k2 = 0; k2 < 3; k2++) R(g, hx + 70 + k2 * 70, y, 50, 4, '#2A3038');
    g.font = '10px "Press Start 2P"'; g.fillStyle = '#FACC15'; g.fillText('WAVE', hx + 14, top + 40); g.fillText('POOL', hx + 14, top + 56);
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
  if (pl.drain > 0 && pl.step !== 'done') {
    c.strokeStyle = 'rgba(220, 245, 255, 0.7)'; c.lineWidth = 2;
    for (let k = 0; k < 5; k++) { const r = (30 + k * 40) * pl.drain; c.beginPath(); c.ellipse(pl.drainX, WP.surf + 4, r, r * 0.12, 0, f * 0.15 + k, f * 0.15 + k + 4); c.stroke(); }
  }
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
  if (pl.step === 'done' && !pl.stubbed) { drawRide(c, state, pl); return; }
  if (pl.step === 'flush' || (pl.step !== 'fight' && pl.step !== 'idle' && pl.step !== 'done')) {
    const k = Math.min(1, (pl.step === 'flush' ? pl.t : pl.skipT) / 20), bar = Math.round(k * 44);
    if (pl.step === 'ride') drawRide(c, state, pl);
    c.fillStyle = '#000'; c.fillRect(0, 0, W, bar); c.fillRect(0, H - bar, W, bar);
    if (pl.step !== 'flush' && pl.step !== 'ride' && pl.skipT > SKIP_AFTER) drawSkipPrompt(c, W);
    if (pl.v) drawVictory(c, pl.v);
  }
};
/** Down the storm pipes: the dark, ribs of the pipe rushing by, him tumbling in the brown water, a grate of light at
 *  the end growing (the lot). */
const drawRide = (c: Ctx, state: GameState, pl: Pool) => {
  const f = state.frame, k = Math.min(1, pl.t / VICTORY_FRAMES);
  R(c, 0, 0, W, H, '#060806');
  for (let i = 0; i < 9; i++) { const z = ((i / 9) + pl.t * 0.02) % 1, r = 30 + z * z * 600; c.strokeStyle = mix('#2A2418', '#6A5A3A', z); c.lineWidth = 2 + z * 14; c.beginPath(); c.ellipse(W / 2, H / 2, r, r * 0.8, 0, 0, Math.PI * 2); c.stroke(); }
  c.fillStyle = '#FDE68A'; c.globalAlpha = k * 0.9; c.beginPath(); c.ellipse(W / 2, H / 2, 10 + k * 90, (10 + k * 90) * 0.8, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  for (let i = 0; i < 16; i++) { const a = i * 0.7 + f * 0.05, r = 80 + ((i * 53 + f * 6) % 260); R(c, W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r * 0.8, 6, 4, i % 2 ? '#6A4A20' : '#8A6A30'); }
  c.save(); c.translate(W / 2 + Math.sin(f * 0.07) * 40, H / 2 + Math.cos(f * 0.05) * 30); c.rotate(f * 0.2);
  R(c, -12, -26, 24, 40, '#1A1410'); R(c, -9, -36, 18, 14, '#1A1410'); R(c, -24, -18, 12, 8, '#1A1410'); R(c, 12, -10, 12, 8, '#1A1410'); R(c, -10, 14, 8, 16, '#1A1410'); R(c, 4, 14, 8, 16, '#1A1410');
  c.restore();
};
export { MAZE_BOX };
