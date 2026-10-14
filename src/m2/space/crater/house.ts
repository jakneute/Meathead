// XENOSCARE's machinery: the pre-show (the teleporter gag), the animatronics' jump scares, the ride's trams.
//
//   THE PRE-SHOW   (a cutscene: HUD hidden, skip all-or-nothing) into the teleport chamber: the host on the screen
//                  welcomes the volunteers, the lights go down, the tube winds up, the strobe, black; and BOO, a rubber
//                  green right in his face out of the floor. His say about it; the host: you've arrived (it's the same
//                  room); the far doors slide open. Seen once a run (kept across his deaths).
//   THE RIGS       the animatronics' jump scares (rigs.ts): the gag at first; later taken over by the real ones.
//   THE TRAMS      the ride's empty cars, still running: a bell and a light (the tell), then one comes out of the
//                  tunnel and along the track to the tunnel the far side. They hit anybody on the track, him or
//                  them (hazardHit.ts: nobody stands about on it, but they can be knocked onto it).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import type { Block } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { hazardVictims, hazardHit, setHazardZones } from '../../hazardHit';
import { hands, speak, meatheadSays, saidOver, box, label } from '../section';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { GY } from '../geometry';
import { drawCheapGreen, shown } from './art';
import { type Rig, makeRigs, tickRigs, drawRigs, drawRigSaid, rigLights } from './rigs';
import { PRESHOW, TRAMS, CEIL, HOUSE_DOOR, HALLS } from './layout';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

const TRAM = 'm2:sp_tram';
registerHurtLines(TRAM, L.HURT_TRAM, L.DEATH_TRAM);
registerDeathKind(TRAM, 'flattened');

/** Kept across his deaths: the pre-show's been seen this run. */
const PRESHOW_MEMO = 'm2:space:preshow';
/** The checkpoint just past the pre-show (from there on, it's been seen). */
export const AFTER_PRESHOW_CP = 62;

// ---------------------------------------------------------------------------------------------------------------
// The state

type Step = 'welcome' | 'teleport' | 'strobe' | 'black' | 'boo' | 'mh' | 'arrived';
interface Tram { a: number; b: number; x: number; mode: 'wait' | 'warn' | 'run'; t: number }
export interface House {
  show: 'pending' | 'on' | 'done';
  step: Step; t: number; stepT: number; token: number;
  /** The host's words (the screen), the BOO's. */
  hostSaid: string | null; booSaid: string | null;
  /** The pre-show's doors (the way out, shut till it's done). */
  exit: Block | null;
  rigs: Rig[];
  trams: Tram[];
}
export const makeHouse = (): House => ({
  show: 'pending', step: 'welcome', t: 0, stepT: 0, token: 0, hostSaid: null, booSaid: null, exit: null,
  rigs: makeRigs(),
  trams: TRAMS.map(([a, b], i) => ({ a, b, x: a - 200, mode: 'wait', t: 140 + i * 90 })),
});

export const buildHouse = (state: GameState, h: House) => {
  const seen = !!state.stageMemo[PRESHOW_MEMO] || state.checkpoint >= AFTER_PRESHOW_CP;
  if (seen) { h.show = 'done'; return; }
  h.exit = { x: PRESHOW.r - 30, y: CEIL - 200, w: 30, h: GY - CEIL + 200, type: 'wall', hidden: true, tag: 'xeno-preshow-exit' } as Block;
  state.blocks.push(h.exit);
};

// ---------------------------------------------------------------------------------------------------------------
// The pre-show

const guard = <A extends unknown[]>(h: House, f: (...a: A) => void) => { const tok = h.token; return (...a: A) => { if (tok === h.token) f(...a); }; };
const go = (h: House, s: Step) => { h.step = s; h.stepT = 0; };

const startShow = (state: GameState, h: House) => {
  h.show = 'on'; h.t = 0; go(h, 'welcome'); h.token++;
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0; p.facing = 1;
  speak('m2.space.xeno', pick(L.XENO_WELCOME), guard(h, (s: { text: string } | null) => { h.hostSaid = s?.text ?? null; }), true, guard(h, () => {
    go(h, 'teleport');
    speak('m2.space.xeno', pick(L.XENO_TELEPORT), guard(h, (s: { text: string } | null) => { h.hostSaid = s?.text ?? null; }), true, guard(h, () => { go(h, 'strobe'); }));
  }));
};

const endShow = (state: GameState, h: House, skipped: boolean) => {
  if (skipped) { silenceAll(); state.playerVulgarityTimer = 0; }
  h.token++; h.hostSaid = null; h.booSaid = null;
  h.show = 'done';
  state.stageMemo[PRESHOW_MEMO] = '1';
  if (h.exit) { state.blocks = state.blocks.filter(b => b !== h.exit); h.exit = null; playSound('slam', 0.6, 6); }
  state.player.inCutscene = false;
};

/** Where the BOO comes up (right in front of him). */
const booX = (state: GameState) => state.player.pos.x + state.player.width / 2 + 70;

const runShow = (ctx: FrameContext, h: House): Controls => {
  const { state } = ctx, p = state.player;
  h.t++; h.stepT++;
  p.inCutscene = true; p.vel.x = 0; p.facing = 1;
  if (h.t > SKIP_AFTER) offerSkip();
  if (h.t > SKIP_AFTER && takeSkip()) { endShow(state, h, true); return hands(); }
  const t = h.stepT;
  switch (h.step) {
    case 'welcome': case 'teleport':
      if (h.step === 'teleport' && t % 30 === 0) playSound('rumble', 0.25 + Math.min(0.4, t / 300), -6);
      if (h.t > 1400) go(h, 'strobe');
      break;
    case 'strobe':
      if (t % 6 === 0) playSound('click', 0.5, 12);
      if (t % 12 === 0) shakeScreen(state, 2, 2);
      if (t === 2) playSound('alarm', 0.4, 4);
      if (t >= 80) { go(h, 'black'); playSound('thud', 0.8, -8); }
      break;
    case 'black':
      if (t === 20) playSound('thud', 0.3, -12);
      if (t >= 46) {
        go(h, 'boo');
        playSound('boing', 1, -4); playSound('screams', 0.5, 14); shakeScreen(state, 8, 4);
        speak('m2.space.boo', pick(L.BOO), guard(h, (s: { text: string } | null) => { h.booSaid = s?.text ?? null; }), false, guard(h, () => {
          go(h, 'mh');
          meatheadSays(state, pick(L.MH_BOO[dressed(state)]), true, guard(h, () => {
            go(h, 'arrived');
            speak('m2.space.xeno', pick(L.XENO_ARRIVED), guard(h, (s: { text: string } | null) => { h.hostSaid = s?.text ?? null; }), true, guard(h, () => endShow(state, h, false)));
          }));
        }));
      }
      break;
    case 'arrived':
      if (t === 10) playSound('ding', 0.6, 6);
      if (h.t > 3000) endShow(state, h, false);
      break;
    default: break;
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const tickHouse = (ctx: FrameContext, h: House, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  // (a fresh start past it (the checkpoint's set after the build): seen)
  if (h.show === 'pending' && state.checkpoint >= AFTER_PRESHOW_CP) endShow(state, h, false);
  if (h.show === 'pending' && cx > PRESHOW.trigger && cx < PRESHOW.r && p.isGrounded && p.health > 0 && state.deathTimer <= 0) startShow(state, h);
  if (h.show === 'on') return runShow(ctx, h);
  tickRigs(ctx, h.rigs);
  tickTrams(ctx, h);
  void controls;
  return null;
};
export const showOn = (h: House) => h.show === 'on';
export const showSkipT = (h: House) => h.t;

// ---------------------------------------------------------------------------------------------------------------
// The trams

const TRAM_W = 180, TRAM_H = 66, TRAM_SPEED = 8.5, TRAM_DMG = 24, WAIT = 260, WARN = 84;
const tickTrams = (ctx: FrameContext, h: House) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  const zones: { x0: number; x1: number; y0: number; y1: number; ground: boolean }[] = [];
  for (const tr of h.trams) {
    const near = cx > tr.a - 900 && cx < tr.b + 900;
    tr.t++;
    // (the track's no place for them to stand, ever: nobody starts on it or wanders onto it between cars; knocked on, it's theirs)
    // (all the way a car goes: out of the wall before the track, on past its end)
    zones.push({ x0: (tr.mode === 'run' ? Math.max(tr.a - 160, tr.x) : tr.a - 160) - TRAM_W / 2 - 20, x1: tr.b + 200 + TRAM_W / 2 + 20, y0: GY - TRAM_H, y1: GY, ground: true });
    if (tr.mode === 'wait') { if (near && tr.t >= WAIT) { tr.mode = 'warn'; tr.t = 0; } continue; }
    if (tr.mode === 'warn') {
      if (tr.t % 20 === 1 && near) playSound('ding', 0.6, 8);
      if (tr.t >= WARN) { tr.mode = 'run'; tr.t = 0; tr.x = tr.a - 160; if (near) playSound('engine', 0.5, 2); }
      continue;
    }
    tr.x += TRAM_SPEED;
    const l = tr.x - TRAM_W / 2, r = tr.x + TRAM_W / 2;
    if (near && tr.t % 14 === 0) playSound('clink', 0.3, -4);
    // (him on the track: hit, flung on ahead of it)
    if (l < tr.b + 60 && r > tr.a - 60 && p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0
      && p.pos.x + p.width > l && p.pos.x < r && p.pos.y + p.height > GY - TRAM_H) {
      hurtPlayer(ctx, TRAM_DMG, TRAM, { x: 9, y: -7 }, 16);
      playSound('crash', 0.7, -2); shakeScreen(state, 8, 4);
    }
    // (one of them on it: theirs)
    for (const e of hazardVictims(state)) {
      if (e.pos.x + e.width > l && e.pos.x < r && e.pos.y + e.height > GY - TRAM_H && e.pos.y < GY && (e.hazardHitAt ?? -99) < state.frame - 30) {
        e.hazardHitAt = state.frame;
        hazardHit(ctx, e, 120, l, 'RUN OVER!', { knock: 12 });
      }
    }
    if (tr.x > tr.b + 200) { tr.mode = 'wait'; tr.t = 0; }
  }
  setHazardZones(state, 'xeno-trams', zones);
};

const drawTrams = (c: Ctx, state: GameState, h: House) => {
  const f = state.frame;
  for (const tr of h.trams) {
    if (!shown(state, tr.a - 200, tr.b + 200)) continue;
    // (the bell's light, at the tunnel mouth: red, blinking)
    const lit = tr.mode === 'warn' && Math.floor(tr.t / 8) % 2 === 0;
    box(c, tr.a - 80, GY - 168, 20, 20, '#18181B'); box(c, tr.a - 77, GY - 165, 14, 14, lit ? '#EF4444' : '#450A0A');
    box(c, tr.b + 60, GY - 168, 20, 20, '#18181B'); box(c, tr.b + 63, GY - 165, 14, 14, lit ? '#EF4444' : '#450A0A');
    if (tr.mode !== 'run') continue;
    // (clipped to between the tunnels' mouths: it comes out of one and goes into the other)
    c.save(); c.beginPath(); c.rect(tr.a - 20, GY - 200, tr.b - tr.a + 40, 210); c.clip();
    const l = tr.x - TRAM_W / 2;
    // (a ride car: a fat saucer-shaped tub, two rows of seats, lap bars, headlamps)
    ink(c, () => c.roundRect(l, GY - TRAM_H + 16, TRAM_W, TRAM_H - 22, 14), '#7C3AED', 2);
    box(c, l + 6, GY - TRAM_H + 22, TRAM_W - 12, 4, '#A78BFA');
    ink(c, () => c.roundRect(l + 30, GY - TRAM_H - 4, 40, 26, 6), '#1E1B4B');
    ink(c, () => c.roundRect(l + 100, GY - TRAM_H - 4, 40, 26, 6), '#1E1B4B');
    limb(c, l + 28, GY - TRAM_H + 10, l + 74, GY - TRAM_H + 10, 3, '#FDE047');
    limb(c, l + 98, GY - TRAM_H + 10, l + 144, GY - TRAM_H + 10, 3, '#FDE047');
    for (let i = 0; i < 4; i++) ink(c, () => c.arc(l + 24 + i * 44, GY - 6, 7, 0, Math.PI * 2), '#27272A');
    box(c, l + TRAM_W - 8, GY - 40, 8, 8, f % 10 < 5 ? '#FEF9C3' : '#FDE047');
    label(c, 'XENOSCARE', tr.x, GY - 22, '#E9D5FF', 7);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing and lighting

/** World space, behind him: the rigs, the trams. */
export const drawHouseBack = (c: Ctx, state: GameState, h: House) => {
  drawRigs(c, state, h.rigs);
  drawTrams(c, state, h);
  // (the pre-show's way out: shut doors till the show's done)
  if (h.exit && shown(state, PRESHOW.r - 60, PRESHOW.r)) {
    box(c, PRESHOW.r - 34, GY - 180, 34, 180, '#334155'); box(c, PRESHOW.r - 34, GY - 180, 34, 4, '#64748B');
    box(c, PRESHOW.r - 18, GY - 180, 2, 180, '#0F172A');
  }
};
/** World space, over him: the BOO in his face (the pre-show's), the words. */
export const drawHouseFront = (c: Ctx, state: GameState, h: House) => {
  const f = state.frame;
  if (h.show === 'on' && (h.step === 'boo' || h.step === 'mh')) {
    const x = booX(state), k = Math.min(1.2, h.stepT / 6);
    c.save(); c.beginPath(); c.rect(x - 200, -5000, 400, 5000 + GY); c.clip();
    drawCheapGreen(c, x, GY + 160 - 160 * Math.min(1, k), f, 1.25, 'boo');
    c.restore();
  }
  if (h.show === 'on' && h.hostSaid) saidOver(c, h.hostSaid, PRESHOW.l + 195, GY - 350, '#7DD3FC', 260);
  if (h.booSaid) saidOver(c, h.booSaid, booX(state), GY - 220, '#86EFAC', 160);
  drawRigSaid(c, h.rigs);
};

/** The haunted house's dark: pools of colored light at the shows, the pre-show's strobe and black. Null outdoors. */
export const houseLighting = (state: GameState, h: House): SceneLight | null => {
  const x = state.player.pos.x;
  if (x < HOUSE_DOOR - 60) return null;
  const lights: Light[] = [];
  const add = (lx: number, ly: number, r: number, a: number, color?: string) => { if (shown(state, lx - r, lx + r)) lights.push({ x: lx, y: ly, r, a, color }); };
  // (the shows' lights)
  for (let i = 0; i < 4; i++) add(HOUSE_DOOR + 190 + i * 220, GY - 230, 150, 0.6, 'rgba(250, 204, 21, 0.05)');
  add(PRESHOW.tube, GY - 200, 220, 0.7, 'rgba(56, 189, 248, 0.07)');
  add(HALLS.bridge.l + 700, GY - 240, 420, 0.75, 'rgba(249, 115, 22, 0.09)');
  add(HALLS.specimen.l + 720, GY - 160, 260, 0.85, 'rgba(74, 222, 128, 0.12)');
  add(HALLS.specimen.l + 300, GY - 120, 200, 0.5);
  add(HALLS.engine.l + 760, GY - 160, 300, 0.75, 'rgba(244, 114, 182, 0.08)');
  add(HALLS.exit.l + 300, GY - 200, 300, 0.65, 'rgba(253, 224, 71, 0.06)');
  // (each of the halls: work lights along the ceiling, dim)
  for (let lx = HOUSE_DOOR + 400; lx < HALLS.exit.r; lx += 520) add(lx, CEIL + 30, 180, 0.35);
  // (a rig popping: a red spot on it)
  for (const l of rigLights(h.rigs)) add(l.x, l.y, l.r, l.a, l.color);
  // (a tram's headlamp)
  for (const tr of h.trams) if (tr.mode === 'run') add(tr.x + 100, GY - 40, 160, 0.7, 'rgba(254, 249, 195, 0.08)');
  // (him: a little of his own, so he's never lost in it)
  lights.push({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + 30, r: 140, a: 0.4 });
  // The pre-show: down, the strobe, black, the red BOO
  if (h.show === 'on') {
    const t = h.stepT;
    if (h.step === 'welcome') return { dark: 0.55 + Math.min(0.2, h.t / 200), shade: [6, 6, 20], lights: [...lights] };
    if (h.step === 'teleport') return { dark: 0.78, shade: [6, 6, 20], lights: [{ x: PRESHOW.tube, y: GY - 200, r: 200 + Math.min(120, t), a: 0.9, color: 'rgba(56, 189, 248, 0.15)' }] };
    if (h.step === 'strobe') return t % 8 < 3 ? { dark: 0.05, lights: [] } : { dark: 0.92, shade: [0, 0, 0], lights: [] };
    if (h.step === 'black') return { dark: 1, shade: [0, 0, 0], lights: [] };
    if (h.step === 'boo' || h.step === 'mh') return { dark: 0.8, shade: [10, 0, 0], lights: [{ x: booX(state), y: GY - 120, r: 200, a: 1, color: 'rgba(239, 68, 68, 0.2)' }, { x: state.player.pos.x + 20, y: GY - 40, r: 100, a: 0.6 }] };
  }
  return { dark: 0.5, shade: [14, 6, 30], lights, rim: 0.55 };
};
