// THE WAVE POOL (level 3's end: the owner's "the end of the sequence will shoot you and the dirty water through a grate
// and into the wave pool, where the third boss is. he will be erratic, the scene will be extra wide, and the wave pool
// will push you back. all the way to the 'shallow' end"). Out past the tunnels, its own stretch of the stage (geo.ts
// WP): night (the small hours; just before dawn once he's dead), the deep end on the right under the wave machine's
// housing and the lifeguard's tower, the beach (a zero-entry: the shallow end) on the left, three screens wide.
//
//   THE FLUSH   (the boss's door: the pump room's outflow, walked into; a short beat, no input, no HUD) Sucked down the
//               intake with a gurgle, gone; out of the grate low in the deep end's wall in a burst of brown water,
//               shot across the pool, a splash, his line. Then GUPPLAX's intro (boss.ts). Died in the pool: back at the
//               pump room's checkpoint (the refill there); walk into the intake again (the same beat, the retry's
//               intro).
//   THE WAVES   in the water, the pool shoves him back toward the beach all the time (harder up at the surface: dive and
//               swim under it to get out to the deep end), and GUPPLAX's whistle throws big ones down it. On the beach
//               it can't get him, and neither can he get at GUPPLAX: the taunts.
//   THE END     (a cutscene, skippable all-or-nothing) GUPPLAX's death (no weakness yet, so his standard one): choking on
//               his whistle, swelling, his last line, belly up; then the air goes out of him: a squeal, he zips round
//               the pool like a let-go balloon and slaps down flat, a skin on the water. Meathead's line. The wave
//               machine dies and the main drain opens under the deep end: a whirlpool; the skin goes down it, then him
//               (his line), down the drain into the dark: tumbling through the storm pipes, VICTORY (timed to end as he
//               comes out), spat out at the parking lot (level 4's start: stages.ts). The hour's on (13).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { WaterBody } from '../../../m1/game/stages/index';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H, topBand } from '../../../m1/constants';
import { lay, solid, meatheadSays, speak } from '../../adventure/section';
import { setUi, goTo, setStartCheckpoint, setEndgameAt } from '../../store';
import { saveProgress } from '../../save';
import { setEndgameHour, timeOfDay, todLight, drawNightSky } from '../../timeOfDay';
import { markBossFight } from '../../bossQuiet';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone, VICTORY_FRAMES } from '../../victory';
import { stamp, checker, bandedGradient, mix } from '../../intro/art/kit';
import { byPants } from '../park1/kinds';
import { ENDGAME_STAGES } from '../stages';
import { WP, poolFloor, POOL_SIGNS, PUMP_ROOM, CP3 } from './geo';
import { drawSigns } from './art';
import { type Fight3, startGup, updateGup, gupDead, drawGup3, drawGupFront, drawGupHud, splash, TOWER, GX1 } from './boss';
import { drawGup } from './gupArt';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const INK = '#04080C';
const hands = (): Controls => ({ ...NO_CONTROLS });

type Step = 'idle' | 'flush' | 'fight' | 'dying' | 'deflate' | 'skin' | 'drain' | 'ride' | 'done';
export interface Pool {
  step: Step; t: number; skipT: number; talk: number;
  f: Fight3 | null;
  /** He's been through the flush this visit (the next: the retry's intro). */
  seen: boolean;
  /** The deflate's path (where he is, zipping round), the skin's spot, the drain's pull. */
  bx: number; by: number; ba: number; skinX: number; drain: number;
  v: Victory | null; said: string | null;
  /** (the stub, if level 4 isn't in yet) He's come back up out of the drain. */
  stubbed: boolean;
}

/** Hour 12 here; 13 once he's dead (endgame/stages.ts park3t's, and the next). */
const HOUR_AFTER = 13;

export const newPool = (state: GameState, _cp: number): Pool => {
  // ---- the pool's ground: the beach (dry, a zero-entry), the slope down, the deep end's floor; the fence behind the
  // beach, the wave machine's housing past the deep end (solid: no climbing out round him)
  lay(state, [
    { x1: WP.x0 - 300, y1: WP.beachTop, x2: WP.beach, y2: WP.beachTop, surface: 'concrete' },
    { x1: WP.beach, y1: WP.beachTop, x2: WP.slopeEnd, y2: WP.deep, surface: 'concrete' },
    { x1: WP.slopeEnd, y1: WP.deep, x2: WP.x1, y2: WP.deep, surface: 'concrete' },
  ]);
  for (const b of state.blocks) if (b.x >= WP.x0 - 400 && !b.tag) b.hidden = true;
  solid(state, WP.x0 - 100, WP.beachTop - 2000, 60, 2600, { hidden: true, tag: 'wp3-fence' });
  solid(state, WP.x1, WP.beachTop - 2000, 600, 3000, { hidden: true, tag: 'wp3-housing' });
  return { step: 'idle', t: 0, skipT: 0, talk: 0, f: null, seen: state.stageMemo['m2:wp3-flushed'] === '1', bx: 0, by: 0, ba: 0, skinX: 0, drain: 0, v: null, said: null, stubbed: false };
};
export const poolOn = (pl: Pool) => pl.step !== 'idle';

/** Level 4's start (the other agent's: the first stage of level 4 in stages.ts), or null (not in yet: the stub). */
const level4 = () => { const s = ENDGAME_STAGES.find(e => e.level === 4); return s ? { id: s.id, cp: s.checkpoints[0].cp } : null; };

/** A frame. `save`: a checkpoint's his. */
export const updatePool = (ctx: FrameContext, pl: Pool, controls: Controls, save: (cp: number) => void): Controls => {
  const { state } = ctx, p = state.player;
  pl.t++; pl.skipT++;
  const cx = p.pos.x + p.width / 2;
  switch (pl.step) {
    case 'idle': return controls;
    // ---- THE FLUSH: down the intake, out of the grate, across the pool
    case 'flush': {
      const t = pl.t;
      p.inCutscene = true; p.untouchable = true; setUi({ introCutscene: true });
      if (t === 1) { playSound('glug', 1, -10); playSound('rumble', 0.8, -6); save(CP3.pump); }
      if (t < 22) { p.carried = true; p.vel.x = 0; p.vel.y = 0; p.pos.x += ((PUMP_ROOM.outA + PUMP_ROOM.outB) / 2 - p.width / 2 - p.pos.x) * 0.2; p.pos.y += 4; if (t % 4 === 0) shakeScreen(state, 4, 2); return hands(); }
      if (t === 22) { p.hidden = true; p.carried = false; state.cameraOverride = { x: WP.x1 - W + 120, y: WP.surf - 230 }; p.pos.x = WP.x1 - p.width - 4; p.pos.y = WP.grateY - p.height / 2; return hands(); }
      if (t > 22 && t < 58) { state.cameraOverride = { x: WP.x1 - W + 120, y: WP.surf - 230 }; if (t % 6 === 0) { playSound('gush', 0.5, -8); shakeScreen(state, 3, 2); } return hands(); }
      if (t === 58) { playSound('crash', 1, -8); playSound('gush', 1, -4); shakeScreen(state, 12, 6); p.hidden = false; pl.bx = p.pos.x; pl.by = p.pos.y; pl.seen = true; state.stageMemo['m2:wp3-flushed'] = '1'; }
      // (shot out across the pool in an arc, tumbling, with the brown water)
      const k = Math.min(1, (t - 58) / 50);
      p.pos.x = pl.bx - k * 640; p.pos.y = pl.by - Math.sin(k * Math.PI) * 220 + k * (WP.surf - 20 - pl.by);
      p.spriteRot = k < 1 ? (t - 58) * 0.35 : 0;
      state.cameraOverride = { x: Math.min(WP.x1 + 200 - W, Math.max(WP.x0, p.pos.x - 400)), y: WP.surf - 230 };
      for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: WP.x1 - 6, y: WP.grateY + (Math.random() - 0.5) * 50 }, vel: { x: -4 - Math.random() * 5, y: (Math.random() - 0.5) * 3 }, life: 30, color: i ? '#6A4A20' : '#8A6A30', size: 4 + Math.random() * 5 });
      if (t === 108) {
        splash(state, cx, 30); playSound('splash', 1, -6);
        p.spriteRot = 0; p.carried = false; p.untouchable = false; p.vel.x = 0; p.vel.y = 2;
        meatheadSays(state, pickLine(byPants(state, L.MH_FLUSHED)), true);
        pl.step = 'fight'; pl.t = 0; pl.f = startGup(state, state.stageMemo['m2:boss-intro:gupplax'] === '1');
        state.stageMemo['m2:boss-intro:gupplax'] = '1';
      }
      return hands();
    }
    // ---- THE FIGHT
    case 'fight': {
      const f = pl.f!;
      markBossFight(state, 'gupplax', { l: WP.x0, r: WP.x1 });
      const out = updateGup(ctx, f, controls);
      // (the waves: the pool shoving him back toward the beach the whole time, harder up at the surface)
      if (p.swimming && f.mode === 'on' && p.health > 0 && !p.inCutscene) {
        // (as a drag on his swimming, so the floor and the walls still stop him: about 1.2 px a frame back up top, half
        // that down deep)
        const top = p.pos.y < WP.surf + 110;
        p.vel.x -= top ? 0.12 : 0.055;
      }
      // (the camera: along the whole pool, on him; held steady over the water)
      if (f.mode === 'on') { state.cameraOverride = null; state.cameraMinX = WP.x0 - 60; state.cameraMaxX = WP.x1 + 40 - W; }
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
  const t = pl.t;
  if (pl.step === 'dying' || pl.step === 'deflate' || pl.step === 'skin') {
    // (him: treading water at the surface, off to his left, watching)
    p.carried = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
    const tx = Math.max(WP.beach + 200, (pl.step === 'dying' ? f.x : pl.step === 'skin' ? pl.skinX : f.x) - 260) - p.width / 2, ty = WP.surf - p.height * 0.45 + Math.sin(state.frame * 0.08) * 2;
    p.pos.x += (tx - p.pos.x) * 0.06; p.pos.y += (ty - p.pos.y) * 0.1;
  }
  switch (pl.step) {
    case 'dying':
      // (choking on his whistle, swelling up; his last line; belly up)
      state.cameraOverride = { x: Math.max(WP.x0, Math.min(WP.x1 + 40 - W, f.x - W / 2)), y: WP.surf - 230 };
      if (t === 1) { playSound('retch', 0.9, 8); speakGup(pl, pickLine(byPants(state, L.GUP_DEATH)), () => { pl.talk = 1; }); }
      if (t % 20 === 5) playSound('beep', 0.4, 18 - Math.min(16, t / 10));
      if ((pl.talk === 1 && t > 90) || t > 700) { pl.step = 'deflate'; pl.t = 0; pl.bx = f.x; pl.by = f.y - 60; pl.ba = 0; playSound('fart', 1, 6); }
      break;
    case 'deflate': {
      // (the air going out of him: zipping round the pool like a let-go balloon, squealing, then slapped down flat)
      const k = t / 110;
      pl.ba += 0.21 + k * 0.1;
      pl.bx += Math.cos(pl.ba) * 9 - 1.2; pl.by += Math.sin(pl.ba * 1.3) * 7;
      pl.bx = Math.max(WP.beach + 300, Math.min(WP.x1 - 80, pl.bx)); pl.by = Math.max(WP.surf - 300, Math.min(WP.surf - 30, pl.by));
      state.cameraOverride = { x: Math.max(WP.x0, Math.min(WP.x1 + 40 - W, pl.bx - W / 2)), y: WP.surf - 230 };
      if (t % 7 === 0) playSound('fart', 0.7, 4 + (t % 21) / 3);
      if (t % 3 === 0) state.particles.push({ pos: { x: pl.bx - Math.cos(pl.ba) * 40, y: pl.by - Math.sin(pl.ba * 1.3) * 30 }, vel: { x: -Math.cos(pl.ba) * 2, y: -Math.sin(pl.ba) * 2 }, life: 24, color: '#9AF060', size: 4 });
      if (t >= 110) { pl.step = 'skin'; pl.t = 0; pl.skinX = Math.min(WP.drain - 200, pl.bx); splash(state, pl.skinX, 26); playSound('splat', 1, -10); playSound('splash', 0.8, -8); shakeScreen(state, 8, 4); }
      break;
    }
    case 'skin':
      // (flat on the water; his line over it)
      state.cameraOverride = { x: Math.max(WP.x0, Math.min(WP.x1 + 40 - W, pl.skinX - W / 2)), y: WP.surf - 230 };
      if (t === 30) meatheadSays(state, pickLine(byPants(state, L.MH_GUP_DEAD)), true, () => { pl.talk = 2; });
      if ((pl.talk === 2 && t > 60) || t > 600) { pl.step = 'drain'; pl.t = 0; playSound('rumble', 1, -14); playSound('glug', 1, -12); shakeScreen(state, 10, 5); }
      break;
    case 'drain': {
      // (the wave machine dies, the main drain opens: a whirlpool; the skin goes down, then him (his line), into it)
      pl.drain = Math.min(1, pl.drain + 0.012);
      state.cameraOverride = { x: Math.max(WP.x0, Math.min(WP.x1 + 40 - W, WP.drain - W / 2)), y: WP.surf - 230 };
      pl.skinX += (WP.drain - pl.skinX) * 0.03;
      // (him: pulled to it, round and round, down)
      p.carried = true; p.vel.x = 0; p.vel.y = 0;
      const a = t * 0.18, r = Math.max(0, 260 - t * 2.2);
      const tx = WP.drain + Math.cos(a) * r - p.width / 2, ty = WP.surf - p.height + 10 + Math.max(0, t - 100) * 2.5;
      p.pos.x += (tx - p.pos.x) * 0.12; p.pos.y += (ty - p.pos.y) * 0.12;
      p.spriteRot = t > 60 ? a * 0.5 : 0;
      if (t === 40) meatheadSays(state, pickLine(byPants(state, L.MH_DRAIN)), false);
      if (t % 15 === 0) playSound('gush', 0.6, -10);
      if (t >= 150) {
        // (down it: the ride, VICTORY timed to end as he comes out at the lot)
        p.hidden = true; pl.step = 'ride'; pl.t = 0; pl.v = startVictory(); playSound('fallwhistle', 0.6, -4);
      }
      break;
    }
    case 'ride':
      if (pl.v) tickVictory(state, pl.v);
      if (t % 24 === 0) playSound('gush', 0.4, -6 + (t % 5));
      if (t >= VICTORY_FRAMES || (pl.v && victoryDone(pl.v))) {
        pl.v = null; pl.step = 'done'; pl.t = 0;
        p.spriteRot = 0; p.untouchable = false;
        const l4 = level4();
        // (gone: still down the pipe, the dark held, as the lot comes up)
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
      if (pl.stubbed) { p.inCutscene = false; p.untouchable = false; setUi({ introCutscene: false }); state.cameraMinX = WP.x0 - 60; state.cameraMaxX = WP.x1 + 40 - W; return controls; }
      break;
  }
  return hands();
};
let gupTok = 0;
const speakGup = (pl: Pool, text: string, onDone: () => void) => {
  const tok = ++gupTok;
  speak(L.GUP_VOICE, text, s => { if (tok === gupTok) pl.said = s?.text ?? null; }, true, () => { if (tok === gupTok) onDone(); });
};

export const poolCamY = (_state: GameState, _pl: Pool) => WP.surf - 230;
export const poolWater = (_state: GameState, _pl: Pool, x: number, y: number): WaterBody | null => {
  if (x < WP.beach || x > WP.x1 || y < WP.surf - 40 || y > poolFloor(x) + 2) return null;
  return { key: 'wp3-pool', x1: WP.beach, x2: WP.x1, surface: WP.surf, bottom: poolFloor(x), kind: 'clean' };
};
export const poolDeath = (_pl: Pool) => undefined;
export const poolLights = (state: GameState, pl: Pool): SceneLight | null => {
  const ls: Light[] = [
    { x: TOWER.x - 10, y: TOWER.seat - 90, r: 320, a: 0.45, color: '#FDE68A' },
    { x: WP.x0 + 300, y: WP.beachTop - 200, r: 360, a: 0.4, color: '#FDE68A' },
    { x: WP.x0 + 1300, y: WP.beachTop - 220, r: 300, a: 0.2, color: '#A7F3D0' },
  ];
  // (the pool lights under the water, glowing up)
  for (let x = WP.slopeEnd; x < WP.x1; x += 300) ls.push({ x, y: WP.deep - 40, r: 190, a: pl.step === 'drain' ? 0.05 : 0.14, color: '#7DD3FC' });
  void state;
  return todLight(ls.filter(l => l.x > state.camera.x - 400 && l.x < state.camera.x + W + 400), 1);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** Screen space: the sky by the hour, the stars and the moon, the rest of the water park far off (busy: lit, the
 *  aliens' saucers and the demons' fires over it). */
export const drawPoolBackdrop = (c: Ctx, state: GameState, _pl: Pool) => {
  const tod = timeOfDay(), cy = state.camera.y, horizon = Math.round(WP.beachTop - 180 - cy);
  bandedGradient(c, 0, 0, W, Math.max(40, horizon + 40), tod.sky, 14);
  R(c, 0, horizon + 40, W, H, tod.sky[tod.sky.length - 1]);
  drawNightSky(c, 0, 0, W, Math.max(40, horizon), W - 160 - state.camera.x * 0.02, 70, state.frame, state.camera.x * 0.02, tod);
  // (the far park: slides, the fake mountain, lit windows; parallax slow)
  const sx = -((state.camera.x * 0.15) % 900);
  for (let k = -1; k < 3; k++) stamp(c, 'wp3-far', Math.round(sx + k * 900), horizon - 160, 900, 200, g => paintFar(g, Math.round(sx + k * 900), horizon - 160));
  // (the fires and the saucers over it, live: a glow, a blink)
  const f = state.frame;
  for (let k = 0; k < 4; k++) { const x = ((k * 260 - state.camera.x * 0.15 + 2000) % 1100) - 100, y = horizon - 40 - (k % 2) * 30; c.globalAlpha = 0.25 + 0.1 * Math.sin(f * 0.1 + k); c.fillStyle = '#F97316'; c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  for (let k = 0; k < 2; k++) { const x = ((k * 480 + f * 0.4 - state.camera.x * 0.1) % 1000 + 1000) % 1000 - 100, y = horizon - 150 - k * 40 + Math.sin(f * 0.03 + k) * 8; R(c, x - 20, y, 40, 6, '#3A4A5A'); R(c, x - 10, y - 6, 20, 6, '#5A6A7A'); if (f % 30 < 15) R(c, x - 2, y + 6, 4, 3, '#86EFAC'); }
};
const paintFar = (g: Ctx, x0: number, y0: number) => {
  const dim = (col: string) => mix(col, '#1A2244', 0.55);
  // (the mountain, the slides' towers and their tangles, the lazy river's grotto glowing faint)
  g.fillStyle = dim('#5A5A6A'); g.beginPath(); g.moveTo(x0 + 520, y0 + 200); g.lineTo(x0 + 640, y0 + 30); g.lineTo(x0 + 700, y0 + 70); g.lineTo(x0 + 800, y0 + 200); g.closePath(); g.fill();
  g.fillStyle = dim('#E8ECF0'); g.beginPath(); g.moveTo(x0 + 610, y0 + 74); g.lineTo(x0 + 640, y0 + 30); g.lineTo(x0 + 668, y0 + 60); g.closePath(); g.fill();
  for (const [x, h] of [[80, 120], [200, 90], [330, 140]] as const) { R(g, x0 + x, y0 + 200 - h, 14, h, dim('#4A5A6A')); g.strokeStyle = dim(['#E04A3A', '#3A8AE0', '#E0C03A'][x % 3]); g.lineWidth = 8; g.beginPath(); g.moveTo(x0 + x + 7, y0 + 200 - h); g.bezierCurveTo(x0 + x + 80, y0 + 200 - h, x0 + x - 40, y0 + 200 - h / 2, x0 + x + 60, y0 + 196); g.stroke(); }
  for (let k = 0; k < 14; k++) R(g, x0 + 40 + k * 60, y0 + 186 - (k % 3) * 8, 4, 4, dim('#FDE68A'));
  R(g, x0, y0 + 196, 900, 4, dim('#2A3446'));
};

/** World space, behind him: the deck, the beach, the pool's tiled inside, the wave machine's housing, the tower, the
 *  chairs, the grate, the drain; then GUPPLAX (the water's wash goes over his bottom half). */
export const drawPoolBack = (c: Ctx, state: GameState, pl: Pool) => {
  const cx0 = Math.floor((state.camera.x - 50 - WP.x0) / 400), cx1 = Math.floor((state.camera.x + W + 50 - WP.x0) / 400);
  for (let k = Math.max(-1, cx0); k <= Math.min(7, cx1); k++) stamp(c, `wp3-pool-${k}`, WP.x0 + k * 400, WP.beachTop - 380, 400, WP.deep + 120 - (WP.beachTop - 380), g => paintPoolChunk(g, k));
  drawSigns(c, state, POOL_SIGNS);
  // (the grate: burst out once he's come through it)
  const gy = WP.grateY;
  R(c, WP.x1 - 6, gy - 34, 12, 68, INK);
  if (pl.seen) { R(c, WP.x1 - 4, gy - 30, 8, 60, '#1A1208'); c.save(); c.translate(WP.x1 - 60, WP.deep - 8); c.rotate(0.4); R(c, -30, -6, 60, 10, '#4B5563'); c.restore(); }
  else for (let k = 0; k < 5; k++) R(c, WP.x1 - 4, gy - 28 + k * 12, 8, 6, '#6B7280');
  // (the main drain on the deep floor: a grate in a ring; open, a black hole)
  R(c, WP.drain - 46, WP.deep - 6, 92, 8, INK);
  if (pl.drain > 0) { c.fillStyle = '#000'; c.beginPath(); c.ellipse(WP.drain, WP.deep - 2, 40 * pl.drain + 6, 6, 0, 0, Math.PI * 2); c.fill(); }
  else for (let k = 0; k < 6; k++) R(c, WP.drain - 40 + k * 14, WP.deep - 4, 8, 4, '#9CA3AF');
  // (the tower: on the deck past the deep end, at the housing's foot)
  if (state.camera.x + W > TOWER.x - 120) stamp(c, 'wp3-tower', TOWER.x - 70, TOWER.seat - 120, 140, WP.beachTop - TOWER.seat + 124, g => paintTower(g));
  // (GUPPLAX: on the tower, in the pool; dead: belly up, puffed; the deflating balloon of him; the skin)
  const f = pl.f;
  if (f && (pl.step === 'fight' || pl.step === 'flush')) drawGup3(c, state, f);
  else if (f && pl.step === 'dying') drawGup(c, f.x, Math.min(f.y, WP.surf + 6) - Math.min(30, pl.t * 0.4), f.face, { pose: pl.t > 50 ? 'puffed' : 'hurt', q: 0, mouth: !!pl.said }, state.frame);
  else if (f && pl.step === 'deflate') { c.save(); c.translate(pl.bx, pl.by); c.rotate(pl.ba); c.scale(Math.max(0.35, 1 - pl.t / 140), Math.max(0.35, 1 - pl.t / 140)); drawGup(c, 0, 0, 1, { pose: 'puffed', q: 0 }, state.frame); c.restore(); }
  else if (f && (pl.step === 'skin' || pl.step === 'drain')) { const k = pl.step === 'drain' ? Math.min(1, pl.t / 80) : 0; c.save(); c.translate(pl.skinX, WP.surf + k * 30); c.rotate(pl.step === 'drain' ? pl.t * 0.15 : 0); c.scale(1 - k * 0.7, 1 - k * 0.7); drawGup(c, 0, 0, 1, { pose: 'skin', q: 0 }, state.frame); c.restore(); }
};
const TILE = ['#0E4A6A', '#14628A', '#1A7AA8', '#3A9AC8', '#8ACCE8'];
const paintPoolChunk = (g: Ctx, k: number) => {
  const x0 = WP.x0 + k * 400, x1 = x0 + 400, top = WP.beachTop - 380;
  // ---- the deck's back: a low wall, palms in planters behind it (dimmed: nothing back there to stand on)
  const dimC = (col: string) => mix(col, '#1A2244', 0.4);
  R(g, x0, WP.beachTop - 70, 400, 70, dimC('#7A7468')); R(g, x0, WP.beachTop - 70, 400, 4, dimC('#A8A090'));
  for (let x = x0 + 60; x < x1; x += 220) {
    R(g, x - 4, WP.beachTop - 300, 8, 230, dimC('#6A4A2A'));
    for (let a = 0; a < 6; a++) { g.strokeStyle = dimC('#2A6A3A'); g.lineWidth = 6; g.beginPath(); g.moveTo(x, WP.beachTop - 300); g.quadraticCurveTo(x + Math.cos(a) * 60, WP.beachTop - 340 + Math.sin(a) * 10, x + Math.cos(a) * 90, WP.beachTop - 280 + Math.abs(Math.sin(a)) * 30); g.stroke(); }
  }
  // ---- the beach (zero-entry concrete, warm) and the deck: its top lit (stood on)
  for (let x = x0; x < x1; x += 20) {
    const fl = poolFloor(x + 10);
    // (under it all: the pool's concrete shell, down out of sight)
    R(g, x, Math.min(WP.beachTop, fl) + 4, 20, WP.deep + 120 - Math.min(WP.beachTop, fl), '#3A3E46');
    if (x + 20 <= WP.beach) { R(g, x, WP.beachTop, 20, 60, '#C8B898'); R(g, x, WP.beachTop, 20, 3, '#F0E4C8'); R(g, x, WP.beachTop + 3, 20, 2, '#D8CCB0'); }
    // ---- the pool's inside: tiles down to its floor (the slope, the deep end), a black lane line along the floor
    if (x + 20 > WP.beach && x < WP.x1) {
      R(g, x, WP.surf, 20, fl - WP.surf, TILE[2]);
      for (let y = WP.surf + 10; y < fl; y += 20) R(g, x, y, 20, 1, TILE[1]);
      R(g, x, WP.surf, 1, fl - WP.surf, TILE[1]);
      R(g, x, fl - 2, 20, 120, TILE[0]); R(g, x, fl - 2, 20, 2, TILE[3]);
      if (fl >= WP.deep - 1) R(g, x, fl - 30, 20, 6, '#0A1A2A');
    }
  }
  // (the depth markings along the wall at the waterline: 3 FT ... 12 FT, NO DIVING)
  g.font = '7px "Press Start 2P"'; g.fillStyle = '#F8FAFC';
  for (let x = WP.beach + 100; x < WP.x1 - 60; x += 300) { if (x < x0 - 40 || x >= x1) continue; const ft = Math.round(3 + ((x - WP.beach) / (WP.x1 - WP.beach)) * 9); g.fillText(`${ft} FT`, x, WP.surf + 20); }
  checker(g, x0, WP.surf + 30, 400, 4, TILE[1], 0, 2);
  // ---- the wave machine's housing (past the deep end): concrete, louvered vents, WAVE POOL in big letters
  if (x1 > WP.x1) {
    const hx = WP.x1;
    R(g, hx, top + 40, 400, WP.deep + 120 - top - 40, '#5A6068'); R(g, hx, top + 40, 400, 6, '#7A8088');
    for (let y = top + 100; y < WP.beachTop - 40; y += 30) for (let k2 = 0; k2 < 3; k2++) R(g, hx + 140 + k2 * 70, y, 50, 4, '#2A3038');
    g.font = '10px "Press Start 2P"'; g.fillStyle = '#FACC15'; g.fillText('WAVE POOL', hx + 14, top + 80);
    R(g, hx, WP.beachTop, 400, 120, '#8A8478');
    R(g, hx, WP.beachTop, 400, 3, '#B0A898');
  }
  void top;
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

/** World space, in front: the water (a wash over everything under its surface, the surface moving down the pool),
 *  the crests, the globs, the slicks, his words; the whirlpool. */
export const drawPoolFront = (c: Ctx, state: GameState, pl: Pool) => {
  const x0 = Math.max(WP.beach, state.camera.x - 20), x1 = Math.min(WP.x1, state.camera.x + W + 20), f = state.frame;
  if (x1 > x0) {
    // (the wash: the water's body, darker down; the surface rolling (the waves going toward the beach))
    c.fillStyle = 'rgba(20, 110, 150, 0.38)';
    c.beginPath(); c.moveTo(x0, WP.surf);
    for (let x = x0; x <= x1; x += 16) c.lineTo(x, WP.surf + Math.sin((x + f * 2.4) * 0.03) * 3);
    for (let x = x1; x >= x0; x -= 40) c.lineTo(x, poolFloor(x) + 2);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(8, 40, 70, 0.25)'; c.fillRect(x0, WP.surf + 120, x1 - x0, WP.deep - WP.surf - 120);
    c.strokeStyle = 'rgba(200, 240, 255, 0.75)'; c.lineWidth = 2;
    c.beginPath(); for (let x = x0; x <= x1; x += 16) { const y = WP.surf + Math.sin((x + f * 2.4) * 0.03) * 3; if (x === x0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
    // (the wave lines rolling toward the beach)
    for (let k = 0; k < 6; k++) { const wx = ((WP.x1 - ((f * 1.3 + k * 400) % (WP.x1 - WP.beach)))); if (wx > x0 && wx < x1) { c.fillStyle = 'rgba(240, 250, 255, 0.7)'; c.fillRect(wx - 30, WP.surf - 4, 40, 3); c.fillRect(wx - 10, WP.surf - 6, 12, 2); } }
  }
  if (pl.f && (pl.step === 'fight')) drawGupFront(c, state, pl.f);
  if (pl.step === 'dying' && pl.said && pl.f) saidOver3(c, state, pl.said, pl.f.x, WP.surf - 200);
  if (pl.drain > 0 && pl.step !== 'done') {
    // (the whirlpool: rings turning in to the drain)
    c.strokeStyle = 'rgba(220, 245, 255, 0.7)'; c.lineWidth = 2;
    for (let k = 0; k < 5; k++) { const r = (30 + k * 40) * pl.drain; c.beginPath(); c.ellipse(WP.drain, WP.surf + 4, r, r * 0.12, 0, f * 0.15 + k, f * 0.15 + k + 4); c.stroke(); }
  }
};
const saidOver3 = (c: Ctx, state: GameState, text: string, x: number, y: number) => {
  c.font = '7px "Press Start 2P"'; c.textAlign = 'center';
  const sx = Math.max(state.camera.x + 160, Math.min(state.camera.x + W - 160, x));
  c.fillStyle = '#000'; c.fillText(text, sx + 1, y + 1); c.fillStyle = '#BEF264'; c.fillText(text, sx, y);
  c.textAlign = 'left';
};

/** Screen space: his bar; the intros' letterbox and SKIP; the end's letterbox, SKIP, the ride down the storm pipes and
 *  VICTORY over it. */
export const drawPoolHud = (c: Ctx, state: GameState, pl: Pool) => {
  if (pl.step === 'fight' && pl.f) drawGupHud(c, state, pl.f, topBand());
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
  // (him, tumbling: a silhouette spun round in the middle)
  c.save(); c.translate(W / 2 + Math.sin(f * 0.07) * 40, H / 2 + Math.cos(f * 0.05) * 30); c.rotate(f * 0.2);
  R(c, -12, -26, 24, 40, '#1A1410'); R(c, -9, -36, 18, 14, '#1A1410'); R(c, -24, -18, 12, 8, '#1A1410'); R(c, 12, -10, 12, 8, '#1A1410'); R(c, -10, 14, 8, 16, '#1A1410'); R(c, 4, 14, 8, 16, '#1A1410');
  c.restore();
};
export { GX1 };
