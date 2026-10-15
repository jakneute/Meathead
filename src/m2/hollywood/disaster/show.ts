// THE SHOW: the narrator's loop in the theater, and the room's pathetic effects to match. "HERE'S AN EARTHQUAKE." the
// room shakes (lightly); "HERE'S A VOLCANO." a space heater and a red gel; "HERE'S A TORNADO." a desk fan; "HERE'S A
// BLIZZARD." the AC up a bit; "HERE'S A FLOOD." a squirt; "HERE'S A WILDFIRE." the fog machine. Round and round, while
// he's in the theater. The guests underwhelmed (or overreacting); him, the first time each one goes. Once the lever's
// been pulled (the room wrecked), the loop goes on over the wreck, nothing left to work but the voice.
//
// Each disaster's effect starts when its line does (the narrator's in the queue with everybody else: nobody talks over
// anybody), runs a while, a gap, the next one.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { lookOf } from '../../adventure/temple/people';
import { speak, meatheadSays } from '../section';
import { X, Y, R, FX, SCREEN, THEATER, WATCHERS } from './layout';
import { dzOf, type Dz } from './state';
import { NARR, LOOP, NARR_STEVE, EFFECT, UNDERWHELMED, OVERREACT, GUEST_VOICES } from './lines';

/** How long an effect runs (from its line), and the gap before the next line. */
export const FX_LEN = 300;
const GAP = 110;
export const DISASTERS = ['EARTHQUAKE', 'VOLCANO', 'TORNADO', 'BLIZZARD', 'FLOOD', 'WILDFIRE'] as const;

/** A fixed line said in the last 45 s: not again yet (pickLine does it for the pools). */
const lastSaid = new Map<string, number>();
export const fresh = (line: string) => { const t = Date.now(), l = lastSaid.get(line); if (l !== undefined && t - l < 45000) return false; lastSaid.set(line, t); return true; };

/** The narrator says something, over the theater's speakers (in turn); `shown` when it starts. */
export const narrate = (state: GameState, line: string, shown?: () => void, done?: () => void) => {
  const o = dzOf(state);
  let started = false, ended = false;
  speak(NARR, line, s => { o.narr = s; if (s && !started) { started = true; shown?.(); } }, true, () => { if (ended) return; ended = true; done?.(); });
};

/** The show's state this frame: which disaster, how far into its effect (frames; -1 between them). */
export const showNow = (o: Dz) => ({ beat: o.show.beat, k: o.show.t >= 0 && o.show.on ? o.show.t : -1 });

interface ShowRun { on: boolean; asked: boolean; askedAt: number }
const RUN = new WeakMap<object, ShowRun>();
const runOf = (o: Dz) => { let r = RUN.get(o); if (!r) { r = { on: false, asked: false, askedAt: 0 }; RUN.set(o, r); } return r; };

/** In the theater: the loop, the effects (none once it's wrecked), who says what about them. */
export const updateShow = (ctx: FrameContext, active: boolean, wrecked: boolean) => {
  const { state } = ctx, o = dzOf(state), sh = o.show, run = runOf(o), p = state.player;
  // (the squirt's drops, wherever they are)
  sh.squirt = sh.squirt.filter(d => { d.t++; d.vy += 0.3; d.x += d.vx; d.y += d.vy; return d.y < Y(-4) && d.t < 90; });
  if (!active) { if (!run.on) { run.asked = false; sh.t = -1; } }
  if (!active && !run.on) return;
  // Between effects: the gap, then the next line (the effect starts when it does)
  if (!run.on) {
    if (sh.t < 0) sh.t--;
    if (!run.asked && -sh.t > GAP) {
      run.asked = true; run.askedAt = state.frame;
      // (once round the loop: the Steve plug, in the gap)
      if (sh.loops >= 1 && !o.said.narrSteve && fresh(NARR_STEVE[0])) { o.said.narrSteve = true; narrate(state, NARR_STEVE[0]); }
      narrate(state, pickLine(LOOP[sh.beat]), () => { run.on = true; sh.on = 1; sh.t = 0; });
    }
    // (never shown (dropped): on with it anyway)
    if (run.asked && state.frame - run.askedAt > 420) { run.on = true; sh.on = 1; sh.t = 0; }
    return;
  }
  sh.t++;
  const k = sh.t, b = sh.beat;
  if (!wrecked) effect(ctx, o, b, k);
  // Him, the first time each goes (casual: never over anybody); a guest now and then
  if (k === 170 && !wrecked && !o.said[`fx${b}`] && !isTalking() && p.health > 0) { o.said[`fx${b}`] = true; meatheadSays(state, pickLine(EFFECT[b]), false); }
  if (k === 230 && !isTalking() && !o.guestSaid && Math.random() < (wrecked ? 0 : 0.45)) {
    const cx = p.pos.x + p.width / 2;
    let best: [number, number] | null = null, bd = 500;
    for (const w of WATCHERS) { const d = Math.abs(X(w[0]) - cx); if (d < bd) { bd = d; best = w; } }
    if (best) {
      const [rx, seed] = best, at = { x: X(rx), y: Y(96) };
      speak(lookOf(seed).woman ? GUEST_VOICES.f : GUEST_VOICES.m, pickLine(seed % 2 ? UNDERWHELMED : OVERREACT), s => { o.guestSaid = s ? { ...at, s } : null; }, false);
    }
  }
  if (k >= FX_LEN) { run.on = false; run.asked = false; sh.on = 0; sh.t = -1; sh.beat = (b + 1) % 6; if (sh.beat === 0) sh.loops++; }
};

/** The effect itself (pathetic). */
const effect = (ctx: FrameContext, o: Dz, b: number, k: number) => {
  const { state, fx } = ctx, p = state.player, f = state.frame;
  const cx = p.pos.x + p.width / 2, inRoom = R(cx) > THEATER.a && R(cx) < THEATER.b;
  switch (b) {
    case 0:
      // (the room shakes: lightly)
      if (k < 150 && k % 6 === 0 && inRoom) shakeScreen(state, 4, 1.4);
      if (k === 2) playSound('rumble', 0.25, 8);
      break;
    case 1:
      // (the space heater on, the red gel up: the shimmer off it)
      if (k === 2) playSound('click', 0.4, -4);
      if (k < 260 && f % 9 === 0) state.particles.push({ pos: { x: X(FX.heater) + (Math.random() - 0.5) * 30, y: Y(56) }, vel: { x: 0, y: -0.6 }, life: 40, color: 'rgba(254, 215, 170, 0.35)', size: 4 });
      break;
    case 2:
      // (the desk fan: a breeze, and a gum wrapper)
      if (k === 2) playSound('click', 0.4, 4);
      if (k < 260 && inRoom && p.isGrounded && !p.carried && cx > X(FX.fan) && cx < X(FX.fan) + 340) p.vel.x += 0.05;
      if (k < 260 && f % 14 === 0) state.particles.push({ pos: { x: X(FX.fan) + 20, y: Y(60) + (Math.random() - 0.5) * 16 }, vel: { x: 2 + Math.random() * 1.5, y: (Math.random() - 0.5) * 0.6 }, life: 50, color: 'rgba(226, 232, 240, 0.5)', size: 2 });
      break;
    case 3:
      // (the AC, up a bit: a drip, a flake or two)
      if (k === 2) playSound('click', 0.3, 10);
      if (k < 260 && f % 12 === 0) state.particles.push({ pos: { x: X(FX.ac) + (Math.random() - 0.5) * 50, y: Y(70) }, vel: { x: (Math.random() - 0.5) * 0.8, y: 0.6 }, life: 80, color: '#F8FAFC', size: 2 });
      break;
    case 4:
      // (a squirt: one, out of the nozzle, at the guests)
      if (k === 40) {
        playSound('splash', 0.35, 10);
        for (let i = 0; i < 16; i++) o.show.squirt.push({ x: X(FX.squirt), y: Y(70), vx: 2.2 + i * 0.12, vy: -5.2 + i * 0.05, t: -i });
      }
      if (k > 40 && k < 120) for (const d of o.show.squirt) if (d.t > 0 && Math.abs(d.x - cx) < 18 && d.y > p.pos.y && d.y < p.pos.y + p.height && !o.said.spritzAt) {
        o.said.spritzAt = true; fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 30 }, 'SPRITZ!', true, '#93C5FD');
      }
      if (k === 130) o.said.spritzAt = false;
      break;
    case 5:
      // (the fog machine: a puff, rolling along the floor)
      if (k === 2) playSound('whoosh', 0.3, -10);
      if (k < 160 && f % 5 === 0) state.particles.push({ pos: { x: X(FX.fog) + 10, y: Y(18) }, vel: { x: 0.6 + Math.random() * 0.9, y: -0.05 }, life: 160, color: 'rgba(214, 211, 209, 0.28)', size: 16 + Math.random() * 10 });
      break;
  }
  void SCREEN;
};
