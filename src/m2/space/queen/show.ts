// The showpiece room's cutscene (HUD hidden; skip all-or-nothing): he walks up to her glass, has his say, kicks it in.
// The real ones up in the control booth light up and have theirs; their dish puts its rings into her head; she twitches,
// the green comes on under her crest, she rears up and screeches (she says nothing: the screech, the clicks, the
// hydraulics). Then she brings both fists down on the floor in front of him, and it goes, all of it on screen: the floor
// cracking up under him, the slabs breaking away, him and them and the dust going down together into the dark (the
// camera down with him), and he lands in the rubble on the attraction's basement floor (basement.ts), his say. Seen once
// a run (kept across his deaths): back up here after, her stand's empty, its lines torn, the hole's still in the floor
// (its broken edges; walk into it and down he drops again), and the rubble's still down there.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { KICK_POSE_FRAMES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hands, speak, meatheadSays, saidOver, teleport, box } from '../section';
import { GY } from '../geometry';
import { GLASS_X, QUEEN_X, BOOTH, HOLE, BF } from './geo';
import { ink } from '../../../m1/game/render/npc/kit';
import { drawQueen, queenHead } from './art';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** Kept across his deaths: the floor's gone, he's been down (the checkpoint past it, the same). */
export const FELL_MEMO = 'm2:space:fell';
export const BASEMENT_CP = 71;

type Step = 'wait' | 'walk' | 'look' | 'kick' | 'booth' | 'beam' | 'rise' | 'smash' | 'drop' | 'land' | 'done';
export interface Show {
  step: Step; stepT: number; skipT: number; token: number;
  glass: boolean; booth: number; beam: number; alive: number; ext: number;
  boothSaid: string | null;
  /** Kept for the old fade (unused now: the fall's all on screen). */
  fade: number;
  /** The floor cracking (0..1), given way (the slabs falling, frames since). */
  crack: number; fallT: number;
}
export const fell = (state: GameState) => !!state.stageMemo[FELL_MEMO] || state.checkpoint >= BASEMENT_CP;
export const makeShow = (state: GameState): Show => {
  const done = fell(state);
  return { step: done ? 'done' : 'wait', stepT: 0, skipT: 0, token: 0, glass: !done, booth: 0, beam: 0, alive: 0, ext: 0, boothSaid: null, fade: 0, crack: done ? 1 : 0, fallT: done ? 999 : -1 };
};
export const showOn = (s: Show) => s.step !== 'wait' && s.step !== 'done';
/** Skippable now (not once the floor's going: that's short, and it's the way down). */
export const showSkippable = (s: Show) => showOn(s) && s.step !== 'smash' && s.step !== 'drop' && s.step !== 'land';
/** The floor's given way (the slab over the hole's to go). */
export const collapsed = (s: Show) => s.fallT >= 0;

const go = (s: Show, st: Step) => { s.step = st; s.stepT = 0; };
const tokened = (s: Show, fn: () => void) => { const tok = s.token; return () => { if (tok === s.token) fn(); }; };

export const startShow = (state: GameState, s: Show) => {
  s.token++; go(s, 'walk'); s.skipT = 0;
  state.player.inCutscene = true;
};

/** The floor goes: the slab's out from under him (index.ts takes its block away), and down he drops. */
const giveWay = (state: GameState, s: Show) => {
  const p = state.player;
  state.stageMemo[FELL_MEMO] = '1';
  if (state.checkpoint < BASEMENT_CP) state.checkpoint = BASEMENT_CP;
  p.hidden = false; p.kickPose = 0; p.facing = 1;
  s.fallT = 0; s.crack = 1;
  playSound('crash', 1, -8); playSound('rumble', 1, -6); shakeScreen(state, 16, 8);
  dustOut(state, HOLE.a, HOLE.b, GY + 8, 26);
  go(s, 'drop');
};
const dustOut = (state: GameState, a: number, b: number, y: number, n: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: a + Math.random() * (b - a), y: y + (Math.random() - 0.5) * 10 }, vel: { x: (Math.random() - 0.5) * 3, y: -0.5 + Math.random() * 1.5 }, life: 70, color: ['#57534E', '#78716C', '#A8A29E'][i % 3], size: 4 + Math.random() * 6, grav: 0.02 });
};

/** Each frame; the cutscene's controls while it's on (else null). */
export const tickShow = (ctx: FrameContext, s: Show): Controls | null => {
  const { state } = ctx, p = state.player;
  if (!showOn(s)) return null;
  s.stepT++; s.skipT++;
  p.inCutscene = true;
  if (showSkippable(s) && s.skipT > SKIP_AFTER) offerSkip();
  if (showSkippable(s) && s.skipT > SKIP_AFTER && takeSkip()) {
    silenceAll(); state.playerVulgarityTimer = 0; s.token++;
    s.glass = false; s.boothSaid = null; s.beam = 0; s.alive = 1;
    // (skipped: the floor goes now, under him where he stands, and down he goes (that's short; it plays))
    if (cx0(state) < HOLE.a + 20 || cx0(state) > HOLE.b - 20) teleport(state, (HOLE.a + HOLE.b) / 2, GY);
    giveWay(state, s);
    return hands();
  }
  const t = s.stepT, cx = p.pos.x + p.width / 2;
  switch (s.step) {
    case 'walk':
      if (cx < GLASS_X - 60 && t < 240) return { ...hands(), right: true } as Controls;
      p.vel.x = 0; p.facing = 1;
      go(s, 'look');
      meatheadSays(state, pick(L.MH_GLASS[dressed(state)]), true, tokened(s, () => go(s, 'kick')));
      break;
    case 'look': p.vel.x = 0; break;
    case 'kick':
      p.vel.x = 0; p.facing = 1;
      if ((p.kickPose || 0) > 0) p.kickPose!--;
      if (t === 6) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
      if (t === 16) { shatter(state, s); meatheadSays(state, pick(L.MH_KICK[dressed(state)]), true, tokened(s, () => go(s, 'booth'))); }
      break;
    case 'booth':
      s.booth = Math.min(1, s.booth + 0.04);
      if (t === 1) playSound('alarm', 0.4, 2);
      if (t === 30) speak('m2.space.alien', pick(L.BOOTH_TAKEOVER[dressed(state)]), x => { s.boothSaid = x?.text ?? null; }, true, tokened(s, () => go(s, 'beam')));
      break;
    case 'beam':
      s.beam = Math.min(1, t / 20);
      s.alive = Math.min(1, Math.max(0, (t - 40) / 50));
      if (t % 8 === 0) { playSound('click', 0.5, 6 + (t % 24) / 2); shakeScreen(state, 2, 2); }
      if (t === 2) playSound('alienCharge', 0.8, -6);
      if (t % 12 === 0) for (let i = 0; i < 4; i++) state.particles.push({ pos: queenHead(QUEEN_X, -1, 0), vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 18, color: i % 2 ? '#A3E635' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.2 });
      if (t >= 110) { go(s, 'rise'); s.beam = 0; }
      break;
    case 'rise':
      // (up she rears: the screech, no words)
      if (t === 1) { playSound('roar', 1, -6); playSound('screams', 0.6, -10); shakeScreen(state, 14, 8); }
      if (t % 10 === 0) playSound('click', 0.4, -4);
      if (t >= 70) go(s, 'smash');
      break;
    case 'smash':
      // (both fists down on the floor in front of him, out on her arm; the floor cracking up under him, more and more,
      // bits jumping off it, him staggering on it; then it goes)
      s.ext = Math.min(1, t / 10) * 130;
      p.vel.x = 0;
      if (t === 10) { playSound('crash', 1, -6); playSound('boom', 0.8, -8); shakeScreen(state, 18, 10); for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: HOLE.a + Math.random() * (HOLE.b - HOLE.a), y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 6 }, life: 40, color: ['#3F3F46', '#52525B', '#A78BFA', '#18181B'][i % 4], size: 3 + Math.random() * 5, grav: 0.4 }); }
      if (t > 10) s.crack = Math.min(1, (t - 10) / 34);
      if (t === 18 || t === 28 || t === 38) { playSound('crack', 1, -4 + t / 10); shakeScreen(state, 6, 3); for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: HOLE.a + Math.random() * (HOLE.b - HOLE.a), y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 24, color: '#52525B', size: 2 + Math.random() * 3, grav: 0.35 }); }
      if (t === 30) { p.facing = -1; }
      if (t === 36) { p.facing = 1; }
      if (t >= 46) giveWay(state, s);
      break;
    case 'drop':
      // (down: him, the slabs and the dust together, the camera down after him; the slabs land first, he lands on
      // them)
      s.fallT++;
      s.ext *= 0.9;
      p.vel.x = 0;
      if (t === 4) playSound('whoosh', 0.8, -8);
      if (t % 5 === 0 && p.pos.y + p.height < BF - 40) dustOut(state, p.pos.x - 10, p.pos.x + p.width + 10, p.pos.y + 20, 2);
      if (s.fallT === SLAB_T) { playSound('crash', 1, -4); playSound('boom', 0.7, -10); shakeScreen(state, 12, 6); dustOut(state, HOLE.a - 40, HOLE.b + 40, BF - 10, 30); }
      if (p.isGrounded && t > 4 && p.pos.y + p.height > BF - 60) {
        go(s, 'land');
        playSound('land', 1); playSound('thud', 1, -8); playSound('crash', 0.6, -2); shakeScreen(state, 14, 7);
        dustOut(state, p.pos.x - 40, p.pos.x + p.width + 40, BF - 10, 22);
        meatheadSays(state, pick(L.MH_FALL[dressed(state)]), true, tokened(s, () => { if (s.step === 'land') s.stepT = 9000; }));
      }
      if (t > 300) go(s, 'land');
      break;
    case 'land':
      s.fallT++;
      // (landed in the rubble: his say, and he's his own again)
      if (s.stepT > 9000 || t > 420) { go(s, 'done'); p.inCutscene = false; }
      break;
    default: break;
  }
  return hands();
};

const cx0 = (state: GameState) => state.player.pos.x + state.player.width / 2;

// ---------------------------------------------------------------------------------------------------------------
// The floor going: its cracks, its slabs coming down (the same ones lie in the rubble after: lowerArt draws them)

/** How long the slabs take down (frames from the floor going). */
export const SLAB_T = 34;
/** The slabs: where they start (x across the hole, their width), where they end up (on the rubble: x, the turn). */
export const SLABS = [
  { x: HOLE.a + 4, w: 30, ex: HOLE.a - 30, er: -0.5 },
  { x: HOLE.a + 36, w: 34, ex: HOLE.a + 20, er: 0.3 },
  { x: HOLE.a + 72, w: 30, ex: HOLE.a + 96, er: -0.15 },
  { x: HOLE.a + 104, w: 34, ex: HOLE.b + 30, er: 0.6 },
];
/** A slab's pose, k through its fall (0 in the floor, 1 down on the pile). */
export const slabPose = (sl: (typeof SLABS)[number], i: number, k: number) => {
  const e = Math.min(1, k);
  return { x: sl.x + (sl.ex - sl.x) * e, y: GY + (BF - 10 - (i % 2) * 8 - GY) * e * e, r: sl.er * e + Math.sin(e * Math.PI) * 0.6 * (i % 2 ? 1 : -1) };
};
/** One slab of floor (concrete, its lit top, the rebar out of its broken edge). */
export const drawSlab = (c: Ctx, x: number, y: number, w: number, r: number) => {
  c.save(); c.translate(x + w / 2, y + 12); c.rotate(r);
  ink(c, () => { c.moveTo(-w / 2, -12); c.lineTo(w / 2, -12); c.lineTo(w / 2 - 3, 10); c.lineTo(w / 4, 12); c.lineTo(-w / 2 + 2, 9); c.closePath(); }, '#3F3F46', 1.5);
  c.fillStyle = '#A78BFA'; c.fillRect(-w / 2, -12, w, 3);
  c.fillStyle = '#27272A'; c.fillRect(-w / 2 + 2, 2, w - 6, 7);
  c.fillStyle = '#7C2D12'; c.fillRect(w / 2 - 2, -4, 6, 2); c.fillRect(-w / 2 - 4, 3, 6, 2);
  c.restore();
};
/** World: the floor cracking (before it goes), and the slabs on their way down. */
export const drawFallingSlabs = (c: Ctx, state: GameState, s: Show) => {
  if (s.step === 'done' || s.step === 'wait') return;
  if (s.crack > 0 && s.fallT < 0) {
    // (the floor breaking up under him: the slabs heaving up out of it, tilting, the black between them widening;
    // shaking more as it goes)
    const cr = s.crack, j = (state.frame % 4 < 2 ? 1 : -1) * cr;
    box(c, HOLE.a, GY - 2, HOLE.b - HOLE.a, 4, '#020204');
    SLABS.forEach((sl, i) => {
      const lift = cr * (5 + (i % 2) * 5) + (i % 2 ? j : -j), r = (i % 2 ? 1 : -1) * 0.14 * cr + j * 0.02;
      drawSlab(c, sl.x + (i - 1.5) * cr * 2, GY - lift, sl.w - 3, r);
    });
    return;
  }
  if (s.fallT < 0) return;
  const k = Math.min(1, s.fallT / SLAB_T);
  SLABS.forEach((sl, i) => { const ps = slabPose(sl, i, k); drawSlab(c, ps.x, ps.y, sl.w, ps.r); });
};

const shatter = (state: GameState, s: Show) => {
  s.glass = false;
  playSound('glass', 1, -2); playSound('crash', 0.7, 2); shakeScreen(state, 8, 4);
  for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: GLASS_X + Math.random() * 20, y: GY - Math.random() * 320 }, vel: { x: 1 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: i % 3 ? 'rgba(186, 230, 253, 0.8)' : '#FFFFFF', size: 2 + Math.random() * 4, grav: 0.35 });
};

/** Her, on her stand, as the scene has her (gone, after: drawn empty by the room). */
export const drawShowQueen = (c: Ctx, state: GameState, s: Show) => {
  if (s.step === 'done' || s.step === 'land') return;
  const pose = s.step === 'beam' ? (s.alive > 0 ? 'wake' : 'dormant') : s.step === 'rise' ? 'roar' : s.step === 'smash' || s.step === 'drop' ? 'swipe' : 'dormant';
  drawQueen(c, QUEEN_X, -1, { pose, t: state.frame, ext: s.ext, alive: s.alive, beat: 0 });
};
export const drawShowSaid = (c: Ctx, s: Show) => {
  if (s.boothSaid) saidOver(c, s.boothSaid, BOOTH.x + BOOTH.w / 2, BOOTH.y - 20, '#D9F99D', 260);
};
/** Screen space: the fade to black (not used now: the fall's on screen). */
export const drawShowFade = (c: Ctx, s: Show) => {
  if (s.fade <= 0) return;
  c.fillStyle = `rgba(0, 0, 0, ${s.fade.toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
export const showHead = (s: Show) => queenHead(QUEEN_X, -1, s.ext);
