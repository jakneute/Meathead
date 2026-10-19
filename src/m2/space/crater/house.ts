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
import { heard, heardSpan } from '../../bossQuiet';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { hazardVictims, hazardHit, setHazardZones } from '../../hazardHit';
import { hands, speak, meatheadSays, saidOver, box } from '../section';
import { INK, limb } from '../../../m1/game/render/npc/kit';
import { GY } from '../geometry';
import { drawCheapGreen, shown } from './art';
import { type Rig, makeRigs, tickRigs, drawRigs, drawRigsFront, drawRigSaid, rigLights } from './rigs';
import { checker, orb, stamp } from './paint';
import { DOORWAYS, DOOR_TOP } from './ship';
import { lettering } from '../square/lettering';
import { PRESHOW, TRAMS, CEIL, HOUSE_DOOR, HALLS } from './layout';
import { liveBolts } from './kinds';
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
/** The floor the aliens keep off for a tram's run (all the way a car goes: out of the wall before the track, on past
 *  its end): [from, to] (world x). Nobody's posted in it (index.ts places them clear of it). */
export const tramKeepOut = (a: number, b: number): [number, number] => [a - 160 - TRAM_W / 2 - 20, b + 200 + TRAM_W / 2 + 20];
const tickTrams = (ctx: FrameContext, h: House) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  const zones: { x0: number; x1: number; y0: number; y1: number; ground: boolean }[] = [];
  for (const tr of h.trams) {
    const near = cx > tr.a - 900 && cx < tr.b + 900;
    tr.t++;
    // (the track's no place for them to stand, ever: nobody starts on it or wanders onto it between cars; knocked on, it's theirs)
    // (all the way a car goes: out of the wall before the track, on past its end)
    const [k0, k1] = tramKeepOut(tr.a, tr.b);
    zones.push({ x0: tr.mode === 'run' ? Math.max(k0, tr.x - TRAM_W / 2 - 20) : k0, x1: k1, y0: GY - TRAM_H, y1: GY, ground: true });
    if (tr.mode === 'wait') { if (near && tr.t >= WAIT) { tr.mode = 'warn'; tr.t = 0; } continue; }
    if (tr.mode === 'warn') {
      // (heard only from on the screen or just off it: bossQuiet.ts)
      const hear = heardSpan(state, tr.a, tr.b);
      if (tr.t % 20 === 1 && hear) playSound('ding', 0.6, 8);
      if (tr.t >= WARN) { tr.mode = 'run'; tr.t = 0; tr.x = tr.a - 160; if (hear) playSound('engine', 0.5, 2); }
      continue;
    }
    tr.x += TRAM_SPEED;
    // (only the part of it that's out, where it can be seen: not the bit still in the tunnel behind the hatch)
    const l = Math.max(tr.x - TRAM_W / 2, tr.a - 109), r = Math.min(tr.x + TRAM_W / 2, tr.b + 109);
    if (heard(state, tr.x) && tr.t % 14 === 0) playSound('clink', 0.3, -4);
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

const PURPLE = ['#1E0B3A', '#2E1065', '#4C1D95', '#6D28D9', '#8B5CF6', '#A78BFA', '#DDD6FE'];
const c01 = (v: number) => Math.max(0, Math.min(1, v));
/** How far up each airlock's shutter is (0 shut, 1 up): from the bell's last beat as a car comes, down behind it. */
const hatches = (tr: Tram) => {
  const left = tr.x - TRAM_W / 2, right = tr.x + TRAM_W / 2;
  const openA = tr.mode === 'warn' ? c01((tr.t - (WARN - 30)) / 24) : tr.mode === 'run' ? c01((tr.a - 10 - left) / 40) : 0;
  const openB = tr.mode === 'run' ? Math.min(c01((right - (tr.b - 70)) / 40), c01((tr.b + 140 - left) / 40)) : 0;
  return { openA, openB };
};
const drawTrams = (c: Ctx, state: GameState, h: House) => {
  const f = state.frame;
  for (const tr of h.trams) {
    if (!shown(state, tr.a - 200, tr.b + 200)) continue;
    // (the bell's light, at each tunnel mouth: red, blinking; a grille for the bell)
    const lit = tr.mode === 'warn' && Math.floor(tr.t / 8) % 2 === 0;
    for (const lx of [tr.a - 80, tr.b + 60]) {
      box(c, lx - 1, GY - 169, 22, 22, INK); box(c, lx, GY - 168, 20, 20, '#27272A'); box(c, lx, GY - 168, 20, 2, '#52525B');
      box(c, lx + 3, GY - 165, 14, 14, lit ? '#EF4444' : '#450A0A'); box(c, lx + 4, GY - 164, 5, 4, lit ? '#FECACA' : '#7F1D1D');
      if (lit) { box(c, lx - 4, GY - 160, 3, 4, '#F87171'); box(c, lx + 21, GY - 160, 3, 4, '#F87171'); }
    }
    // (the airlock doors at each mouth: shut, then sliding up out of its way as a car comes, down again behind it; in
    // the one it's coming out of, its headlamp coming up the tunnel first)
    const { openA, openB } = hatches(tr);
    const coming = tr.mode === 'warn' ? c01(tr.t / WARN) : tr.mode === 'run' ? c01(1 - (tr.x - (tr.a - 160)) / 120) : 0;
    hatchOpen(c, tr.a - 110, openA, f, coming); hatchOpen(c, tr.b + 20, openB, f, 0);
    if (tr.mode !== 'run') continue;
    // (seen only where it's out: between the airlocks, and in each open hatch below its shutter's foot)
    const eA = GY - Math.round(139 * openA), eB = GY - Math.round(139 * openB);
    c.save(); c.beginPath();
    c.rect(tr.a - 21, GY - 220, tr.b - tr.a + 42, 230);
    c.rect(tr.a - 109, eA, 88, GY - eA + 10);
    c.rect(tr.b + 21, eB, 88, GY - eB + 10);
    c.clip();
    const l = Math.round(tr.x - TRAM_W / 2);
    // (its headlamp's beam on ahead of it: stepped, warm, down onto the track)
    const bx = l + TRAM_W + 4, by = GY - 40;
    for (const [len, sp, a] of [[170, 34, 0.07], [120, 24, 0.09], [70, 14, 0.12]] as const) {
      c.fillStyle = `rgba(254, 249, 195, ${a})`; c.beginPath(); c.moveTo(bx, by - 4); c.lineTo(bx + len, by - sp * 0.4); c.lineTo(bx + len, by + sp); c.lineTo(bx, by + 5); c.closePath(); c.fill();
    }
    for (const [w2, a] of [[70, 0.08], [44, 0.1], [22, 0.14]] as const) box(c, bx + 110 - w2, GY - 3, w2 * 2, 3, `rgba(254, 249, 195, ${a})`);
    // (the car: stamped (its body, seats, lit portholes, its name in neon); the moving bits live)
    c.save(); c.translate(l, GY); stamp(c, 'xs-tram-car', -6, -76, TRAM_W + 14, 78, paintTram); c.restore();
    // (its wheels turning)
    for (let i = 0; i < 4; i++) { const wx = l + 24 + i * 44; box(c, wx - 8, GY - 9, 16, 9, INK); box(c, wx - 7, GY - 8, 14, 7, '#27272A'); box(c, wx - 7, GY - 8, 14, 1, '#52525B'); box(c, wx - 1, GY - 6 + ((f + i * 3) % 4 < 2 ? 0 : 2), 2, 2, '#A1A1AA'); }
    // (the running lights along its skirt, chasing; the headlamp, flickering a little; the tail lamp)
    for (let k = 0; k < 11; k++) { const on = (Math.floor(f / 4) + k) % 4 === 0; box(c, l + 8 + k * 16, GY - 13, 4, 2, on ? '#F5D0FE' : PURPLE[4]); }
    const hot = f % 10 < 5 ? '#FEF9C3' : '#FEF08A';
    box(c, l + TRAM_W - 9, GY - 45, 8, 9, hot); box(c, l + TRAM_W - 8, GY - 44, 3, 3, '#FFFFFF');
    box(c, l - 2, GY - 42, 4, 6, (f >> 3) % 2 ? '#EF4444' : '#B91C1C'); box(c, l - 2, GY - 42, 2, 2, '#FECACA');
    c.restore();
  }
};
/** A ride car (local: its left end at 0, the deck at 0): a fat fiberglass tub, banded light to dark down it and lit
 *  along its lip; two rows of seats in it, their lap bars; a row of lit portholes along its side either side of its name
 *  in neon; the headlamp's housing at its nose, the tail lamp's at its back. */
const paintTram = (g: Ctx) => {
  const W = TRAM_W, P = PURPLE;
  // (the seats: tuck-and-roll backs, a lit top, the lap bars across)
  for (const sx of [30, 100]) {
    box(g, sx - 1, -72, 42, 30, INK);
    box(g, sx, -71, 40, 28, '#1E1B4B'); box(g, sx, -71, 40, 3, '#4338CA'); box(g, sx, -68, 40, 3, '#312E81'); box(g, sx + 2, -70, 12, 1, '#818CF8');
    for (let k = 1; k < 4; k++) box(g, sx + k * 10, -65, 1, 20, '#13113A');
    limb(g, sx - 2, -57, sx + 44, -57, 3, '#CA8A04'); box(g, sx, -58, 40, 1, '#FEF08A');
  }
  // (the tub: inked, its bands down it, dithered where they meet)
  g.fillStyle = INK; g.beginPath(); g.roundRect(-1, -52, W + 2, 48, 15); g.fill();
  g.save(); g.beginPath(); g.roundRect(0, -51, W, 46, 14); g.clip();
  const bands: [number, number, string][] = [[-51, 2, P[6]], [-49, 4, P[5]], [-45, 7, P[4]], [-38, 12, P[3]], [-26, 9, P[2]], [-17, 7, P[1]], [-10, 6, P[0]]];
  bands.forEach(([y, hh, col], i) => { box(g, 0, y, W, hh, col); if (i) checker(g, 0, y, W, 1, bands[i - 1][2]); });
  // (lit at its back end, shaded at its nose)
  box(g, 0, -49, 6, 40, P[4]); checker(g, 6, -49, 2, 40, P[4]); box(g, W - 6, -49, 6, 40, P[2]); checker(g, W - 8, -49, 2, 40, P[2]);
  g.restore();
  box(g, 10, -50, W - 20, 1, '#F5F3FF');
  // (the name: in a dark band, neon)
  box(g, 47, -41, 86, 22, INK); box(g, 48, -40, 84, 20, '#14072A');
  lettering(g, 'XENOSCARE', 90, -30, 'neon', '#E9D5FF', '#14072A', true);
  // (the portholes, lit warm inside)
  for (const px of [13, 27, 41, 139, 153, 167]) {
    g.fillStyle = INK; g.beginPath(); g.arc(px, -33, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#A1A1AA'; g.beginPath(); g.arc(px, -33, 5, 0, Math.PI * 2); g.fill();
    orb(g, px, -33, 4, ['#92400E', '#D97706', '#FBBF24', '#FDE68A', '#FFFBEB'], false);
  }
  // (the headlamp's housing at the nose, chrome; the tail lamp's at the back; the bumper)
  box(g, W - 11, -47, 12, 13, INK); box(g, W - 10, -46, 10, 11, '#71717A'); box(g, W - 10, -46, 10, 1, '#E4E4E7');
  box(g, -4, -44, 6, 10, INK);
  box(g, W - 3, -20, 7, 12, INK); box(g, W - 2, -19, 5, 10, '#A1A1AA'); box(g, W - 2, -19, 5, 2, '#F4F4F5');
  // (the skirt under it, dark, where the running lights go)
  box(g, 4, -15, W - 8, 6, INK); box(g, 5, -14, W - 10, 4, '#0B0418');
};
/** A tram airlock's hatch (its opening's left at x: the hatch art's in ship.ts), its shutter slid up `open` of the way:
 *  the slats riding up into the top, the tunnel dark behind (its ribs going back, the rails into it; `glow`: a car's
 *  headlamp coming up it), the shutter's striped foot where it's got to, a lamp turning while it moves. */
const hatchOpen = (c: Ctx, x: number, open: number, f: number, glow: number) => {
  if (open <= 0.01) return;
  const l = x + 1, w = 88, top = GY - 139, h = 139, up = Math.round(h * open), edge = GY - up;
  c.save(); c.beginPath(); c.roundRect(l, top, w, h, [29, 29, 0, 0]); c.clip();
  // (the tunnel behind: dark, banded, its ribs going back, the rails into it)
  const T = ['#020106', '#06040C', '#0B0814', '#110C1E'];
  T.forEach((col, i) => box(c, l, edge + (up * i) / T.length, w, up / T.length + 1, col));
  for (let k = 1; k <= 3; k++) { const ins = k * 9; box(c, l + ins, Math.max(edge, top + ins), 1, GY - Math.max(edge, top + ins), '#1C1830'); box(c, l + w - ins, Math.max(edge, top + ins), 1, GY - Math.max(edge, top + ins), '#1C1830'); if (top + ins > edge) box(c, l + ins, top + ins, w - ins * 2, 1, '#1C1830'); }
  if (glow > 0.01) for (const [r, a] of [[30, 0.12], [18, 0.2], [8, 0.4]] as const) box(c, l + w / 2 - r, GY - 40 - r * 0.6, r * 2, r * 1.2, `rgba(254, 249, 195, ${(a * glow).toFixed(3)})`);
  for (const ry of [GY - 9, GY - 3]) { box(c, l, ry, w, 2, '#3F3F46'); box(c, l, ry, w, 1, '#71717A'); }
  // (the shutter: its slats riding up into the top, the rest of it)
  for (let y = edge - 12, i = 0; y > top - 12; y -= 12, i++) { box(c, l, y, w, 11, i % 2 ? '#3F3F46' : '#52525B'); box(c, l, y, w, 1, '#A1A1AA'); box(c, l, y + 11, w, 1, INK); }
  box(c, l, top, w, Math.max(0, edge - top), 'rgba(10, 8, 20, 0.35)');
  // (the shutter's foot, where it's got to)
  box(c, l, edge - 6, w, 6, INK); for (let k = 0; k < w; k += 12) box(c, l + k, edge - 5, 6, 4, '#EAB308');
  c.restore();
  if (open < 0.98) { box(c, x + w / 2 - 4, top - 14, 8, 8, INK); box(c, x + w / 2 - 3, top - 13, 6, 6, (f >> 2) % 2 ? '#EF4444' : '#7F1D1D'); }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing and lighting

/** World space, behind him: the rigs, the trams. */
export const drawHouseBack = (c: Ctx, state: GameState, h: House) => {
  drawRigs(c, state, h.rigs);
  drawTrams(c, state, h);
  // (the pre-show's way out: its doorway's leaves shut till the show's done)
  const d = DOORWAYS[1];
  if (h.exit && shown(state, d.l - 30, d.r + 30)) {
    // (two sliding leaves, steel, ribbed, a hazard band across them, meeting in the middle; a red lamp on them: shut)
    const w = (d.r - d.l) / 2, H = GY - DOOR_TOP;
    box(c, d.l - 1, DOOR_TOP, d.r - d.l + 2, H, INK);
    for (const [lx, s] of [[d.l, -1], [d.l + w, 1]] as const) {
      box(c, lx, DOOR_TOP, w, H, '#334155'); box(c, lx, DOOR_TOP, 4, H, s < 0 ? '#64748B' : '#475569'); box(c, lx + w - 3, DOOR_TOP, 3, H, '#1E293B');
      checker(c, lx + 4, DOOR_TOP, 2, H, '#475569');
      for (let y = DOOR_TOP + 24; y < GY - 10; y += 36) { box(c, lx + 4, y, w - 8, 1, '#1E293B'); box(c, lx + 4, y + 1, w - 8, 1, '#64748B'); }
      for (let k = 0; k < 5; k++) box(c, lx, GY - 76 + k * 7, w, 4, k % 2 ? '#CE9A10' : INK);
    }
    box(c, d.l + w - 1, DOOR_TOP, 2, H, '#0F172A');
    box(c, d.l + w - 6, DOOR_TOP + 14, 12, 10, INK); box(c, d.l + w - 5, DOOR_TOP + 15, 10, 8, state.frame % 40 < 20 ? '#EF4444' : '#7F1D1D');
  }
};
/** World space, over the scenery, them and him: the rigs' animatronics popping out (the bolts go over these). */
export const drawHouseProps = (c: Ctx, state: GameState, h: House) => drawRigsFront(c, state, h.rigs);
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
  // (the soldiers' bolts: each its own pink light)
  for (const b of liveBolts()) add(b.x, b.y, 70, 0.9, 'rgba(244, 114, 182, 0.35)');
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
  // (a tram: its own glow (its portholes, its neon), its headlamp's beam on ahead of it; one coming, its headlamp up the
  // tunnel in the hatch first)
  for (const tr of h.trams) {
    const out = (x: number) => x > tr.a - 120 && x < tr.b + 120;
    if (tr.mode === 'run') {
      if (out(tr.x)) add(tr.x, GY - 40, 170, 0.8, 'rgba(196, 181, 253, 0.07)');
      for (const [dx, r, a] of [[TRAM_W / 2 + 50, 120, 0.85], [TRAM_W / 2 + 140, 100, 0.6]] as const) if (out(tr.x + dx)) add(tr.x + dx, GY - 34, r, a, 'rgba(254, 249, 195, 0.1)');
    } else if (tr.mode === 'warn') add(tr.a - 65, GY - 50, 110, 0.6 * Math.min(1, tr.t / WARN), 'rgba(254, 249, 195, 0.08)');
  }
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
