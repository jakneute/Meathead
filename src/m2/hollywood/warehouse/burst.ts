// THE BURST-IN (the coaster's launch: section.ts takeBurstIn), the user's playtest notes: he comes in through the
// CEILING (only the roof: the launch drops him through it). Out of the white of the flight, the dim of a secret shoot
// (the sets lit, the crew stood about, the director by his monitors); the roof bursts, the throne-train and him come
// down through it, the train wrecks, he lands on his feet. Then, one at a time: the director (a member of the public on
// his secret set: they're shooting REVENGERS: END-OF-THE-WORLD'S-DAY here, at Happy Land of all places, for the tax
// write-off, and nobody can know), him (no idea what the fuss is), the director again (everybody knows this movie),
// him (never heard of it), the director (it's a secret; Area 51), the director thinking it over (bribe him or kill
// him?)... and while he's still thinking, the walls all come down flat, outward. The public, outside, staring in over
// them, phones up. KILL THEM ALL! THEY CANNOT KNOW!: the crew in the background run out over the fallen walls at the
// public (a brawl along the back from then on); the foreground crew come at him (the section's enemies). His shrug.
// A cutscene: HUD hidden, one speaker at a time, SKIP >> for the lot.
//
// Launched in again later (the lever's still on): the walls already down; he drops in through his own hole, a line, on.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { Controls } from '../../../m1/game/platform/input';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hands, meatheadSays, takeBurstIn, box } from '../section';
import { lookOf } from '../../adventure/temple/people';
import { X, GY, x0, ROOF_Y, BACK_Y, WALLS_MEMO } from './layout';
import { whOf } from './state';
import { BURST, BURST_WHAT, BURST_NEVER, BACK_AGAIN, CROWD_GASP, DIR_WHO, DIR_TITLE, DIR_SECRET, DIR_PONDER, DIR_KILL } from './lines';
import { crowdSay, dirSay } from './talk';
import { drawDirector } from './kindArt';

/** Where the wreck comes down (its middle), where he lands, where the director stands (x from the section's start). */
export const WRECK_X = 380;
const LAND_X = 470, DIR_X = 600;
/** The hole the train made in the roof (x from the section's start): there for good. */
export const ROOF_HOLE = { a: 250, b: 520 } as const;
export const wallsDown = (state: GameState) => !!state.stageMemo[WALLS_MEMO];
/** The director's a man (his voice is): the first man's seed. */
const DIR_SEED = [5, 7, 9, 11, 13, 15, 17, 19, 21].find(s => !lookOf(s).woman) ?? 5;
const CAM = { x: x0 - 40, y: GY - 550 };
/** Up at the roof for the crash (it's off the top of the usual view), down with him as he falls. */
const ROOF_CAM = GY - 720;
const camY = (t: number) => { const k = Math.max(0, Math.min(1, (t - 34) / 40)); return ROOF_CAM + (CAM.y - ROOF_CAM) * k * k * (3 - 2 * k); };

/** The director, as a person to draw (not on the engine's list: the scene's). */
const dirPuppet = new WeakMap<object, Enemy>();
const puppetOf = (state: GameState) => {
  let e = dirPuppet.get(state.stage as object);
  if (!e) { e = makeKindEnemy('m2:hww_director' as EnemyKind, X(DIR_X), GY); e.initialX = DIR_SEED; e.variant = 0; dirPuppet.set(state.stage as object, e); }
  return e;
};

/** The crew in the background, out at the public (the burst-in's KILL THEM ALL). */
const sendRunners = (state: GameState) => {
  const b = whOf(state).burst;
  if (b.runners.length) return;
  for (let k = 0; k < 7; k++) b.runners.push({ x: x0 + 40 + k * 105 + ((k * 37) % 40), seed: 300 + k * 13, t: 0, at: k * 6 });
};

const done = (state: GameState, skipped: boolean) => {
  const b = whOf(state).burst, p = state.player;
  if (skipped) silenceAll();
  b.on = false; b.fall = 1; b.falling = -1; b.tx = X(WRECK_X); b.ty = GY; b.tv = 0; b.tilt = 1; b.landed = true;
  b.dir.mode = 'gone'; b.dir.said = null;
  whOf(state).crowd = null;
  sendRunners(state);
  state.stageMemo[WALLS_MEMO] = '1';
  if (p.carried || p.pos.y + p.height < GY - 2) { p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; }
  p.carried = false; p.spriteRot = 0;
  p.inCutscene = false;
  state.cameraOverride = null;
};

/** The coaster's just put him here flying (once a launch): the burst-in, or (the walls already down) just a drop in. */
export const takeLaunch = (state: GameState) => {
  if (!takeBurstIn()) return;
  const o = whOf(state), b = o.burst, p = state.player;
  if (wallsDown(state)) {
    // (down through his own hole in the roof)
    p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = ROOF_Y - 60 - p.height; p.vel.x = 1; p.vel.y = 6;
    state.camera.x = CAM.x; state.camera.y = CAM.y;
    meatheadSays(state, pickLine(BACK_AGAIN), false);
    return;
  }
  Object.assign(b, { on: true, t: 0, fall: 0, falling: -1, tx: X(WRECK_X), ty: ROOF_Y - 40, tv: 0, tilt: 0, my: ROOF_Y - 140, mv: 0, landed: false, step: 0, runners: [] });
  b.dir = { x: X(DIR_X), face: -1, mode: 'up', said: null };
  p.inCutscene = true; p.carried = true; p.vel.x = 0; p.vel.y = 0;
  p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = b.my - p.height;
  state.camera.x = CAM.x; state.camera.y = ROOF_CAM;
  state.cameraOverride = { x: CAM.x, y: ROOF_CAM };
};

export const updateBurst = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, o = whOf(state), b = o.burst, p = state.player, f = state.frame, d = b.dir;
  if (!b.on) return null;
  b.t++;
  p.inCutscene = true;
  if (b.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { done(state, true); return hands(); } }
  state.cameraOverride = { x: CAM.x, y: camY(b.t) };
  // (the crew on the set stood where they are: it's the director's scene)
  for (const e of state.enemies) if (e.pos.x < x0 + 1400 && e.health > 0) { e.vel.x = 0; e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2); }
  // The roof goes: the train and him down through it
  if (b.t === 24) {
    playSound('crash', 1, -10); playSound('boom', 0.8, -6); shakeScreen(state, 16, 7);
    for (let k = 0; k < 46; k++) state.particles.push({ pos: { x: X(ROOF_HOLE.a) + Math.random() * (ROOF_HOLE.b - ROOF_HOLE.a), y: ROOF_Y - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 5, y: 1 + Math.random() * 4 }, life: 60, color: ['#78716C', '#A8A29E', '#57534E', '#1C1917'][k % 4], size: 3 + Math.random() * 6, grav: 0.4 });
  }
  if (b.t >= 24) {
    if (b.ty < GY) {
      b.tv = Math.min(24, b.tv + 0.9); b.ty += b.tv; b.tilt = Math.min(1, b.tilt + 0.035);
      if (b.ty >= GY) {
        b.ty = GY; b.tilt = 1;
        playSound('crash', 1, -12); playSound('grind', 0.7, -6); shakeScreen(state, 20, 8);
        for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: b.tx + (Math.random() - 0.5) * 220, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.8)', size: 5 + Math.random() * 6 });
        // (the director up out of his chair at the noise)
        d.mode = 'up';
      }
    }
    if (!b.landed && b.t >= 30) {
      b.mv = Math.min(20, b.mv + 0.8); b.my += b.mv;
      p.spriteRot = (p.spriteRot ?? 0) + 0.28;
      if (b.my >= GY) { b.my = GY; b.landed = true; p.spriteRot = 0; p.carried = false; p.vel.y = 0; playSound('thud', 1, -8); shakeScreen(state, 8, 4); }
      p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = b.my - p.height; p.facing = 1;
    }
  }
  if (b.landed) { p.pos.y = GY - p.height; p.vel.x = 0; p.facing = 1; }
  // Then, one at a time: who the fuck is he; the movie (he doesn't know it); the secret; buy him or bury him
  if (b.landed && b.step === 0 && b.t > 110) {
    b.step = 1;
    dirSay(state, DIR_WHO, () => meatheadSays(state, pickLine(BURST_WHAT), true, () => dirSay(state, DIR_TITLE, () => meatheadSays(state, pickLine(BURST_NEVER), true,
      () => dirSay(state, DIR_SECRET, () => { d.mode = 'think'; dirSay(state, DIR_PONDER, () => { b.step = 2; b.falling = 0; playSound('rumble', 0.8, -10); shakeScreen(state, 30, 2); }); })))));
  }
  // ...while he's still thinking it over, the walls go: all of them, flat, outward
  if (b.falling >= 0) {
    b.falling++;
    if (b.falling > 40 && b.fall < 1) {
      b.fall = Math.min(1, b.fall + 0.022 + b.fall * 0.04);
      if (b.fall >= 1) {
        playSound('boom', 1, -12); playSound('crash', 1, -10); shakeScreen(state, 20, 8);
        for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: CAM.x + Math.random() * CANVAS_WIDTH, y: GY - 60 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 50, color: 'rgba(168, 162, 158, 0.8)', size: 5 + Math.random() * 6 });
      }
    }
  }
  // The public, staring in; KILL THEM ALL (the crew out at them, behind; the ones on the set at him)
  if (b.fall >= 1 && b.step === 2 && b.falling > 120) {
    b.step = 3;
    crowdSay(state, CROWD_GASP, CAM.x + 420, 3, () => { d.mode = 'yell'; sendRunners(state); dirSay(state, DIR_KILL, () => { d.mode = 'run'; meatheadSays(state, pickLine(BURST), true, () => { b.step = 4; }); }); });
  }
  if (d.mode === 'run') { d.x += 6; d.face = 1; if (d.x > CAM.x + CANVAS_WIDTH + 80) d.mode = 'gone'; }
  for (const r of b.runners) r.t++;
  // (the phones going off in the crowd)
  if (b.fall >= 1 && f % 9 === 0) o.flashes.push({ x: CAM.x + Math.random() * CANVAS_WIDTH, y: BACK_Y - 60 - Math.random() * 20, at: f });
  if ((b.step === 4 && d.mode === 'gone') || b.t > 3000) done(state, false);
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World, on the play plane: the director (by his chair and the monitor, then up, thinking, yelling, off). */
export const drawBurstDirector = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = whOf(state).burst, d = b.dir;
  if (!b.on || d.mode === 'gone') return;
  const e = puppetOf(state), f = state.frame;
  e.pos.x = d.x - e.width / 2; e.pos.y = GY - e.height; e.facing = d.face;
  e.aiState = d.mode === 'yell' ? 'action' : 'approach'; e.vel.x = d.mode === 'run' ? 6 : 0;
  // (his chair, behind him, till he's off)
  if (d.mode !== 'run') { box(c, X(DIR_X) + 20, GY - 46, 40, 6, '#78350F'); box(c, X(DIR_X) + 20, GY - 82, 40, 26, '#18181B'); box(c, X(DIR_X) + 24, GY - 40, 4, 40, '#78350F'); box(c, X(DIR_X) + 52, GY - 40, 4, 40, '#78350F'); }
  c.save(); c.translate(Math.round(d.x), GY); c.scale(d.face, 1);
  drawDirector(c, e, f, DIR_SEED, false);
  c.restore();
  // (thinking it over: a hand to the chin's a "...")
  if (d.mode === 'think' && !d.said) { c.fillStyle = '#F5F5F4'; for (let k = 0; k < 3; k++) if ((f >> 4) % 4 > k) { c.beginPath(); c.arc(d.x - 8 + k * 8, GY - 104, 2, 0, Math.PI * 2); c.fill(); } }
};
/** The director's words over him (in front of everything). */
export const drawBurstSaid = (c: CanvasRenderingContext2D, state: GameState, saidOver: (c: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, w: number) => void) => {
  const d = whOf(state).burst.dir;
  if (d.said && d.mode !== 'gone') saidOver(c, d.said.text, d.x, GY - 108, '#BFDBFE', 300);
};

/** Screen space: the dim of the inside before the walls go, the front wall's shadow coming down over us, SKIP >>. */
export const drawBurstHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const b = whOf(state).burst;
  if (!b.on) return;
  if (b.fall < 1) { c.fillStyle = `rgba(0, 0, 0, ${0.4 * (1 - b.fall)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // (the white of the flight, going)
  if (b.t < 24) { c.fillStyle = `rgba(255, 255, 255, ${1 - b.t / 24})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // (the fourth wall, coming down toward us: its shadow sweeping down the screen, then gone)
  if (b.fall > 0.3 && b.fall < 1) { const k = (b.fall - 0.3) / 0.7; c.fillStyle = `rgba(28, 25, 23, ${0.8 * (1 - k * 0.6)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * k); }
  if (b.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
