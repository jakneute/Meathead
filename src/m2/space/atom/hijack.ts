// THE LINE, and THE HIJACK. Out the backstage door into the queue's last stretch: he walks straight up past the line
// (they've got something to say about it: clean, shitty or naked), to the front. The first time (HIJACK_MEMO, kept
// across his deaths), a scene: the operator greets him; he hauls the guy in the front seat out and throws him over the
// rail into the line (down go a few of them), the one in the back seat gets out on her own, he sits down; the
// operator won't send it, so he gets out, kicks the big green DISPATCH button himself, and hops back in as it goes.
// Into the tunnel, and on to the ride (SECTIONS.ride). After that, the sled's waiting there to get straight into.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Pose } from '../../spooky/costume';
import { teleport, hands, speak, meatheadSays, type Said } from '../section';
import { SECTIONS, GY } from '../geometry';
import { playSound, stopSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { silenceAll, pickLine, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { KICK_POSE_FRAMES } from '../../../m1/constants';
import { lookOf } from '../../adventure/temple/people';
import { SEATS, SLED_SINK } from '../ride/sled';
import { LINE_X0, LINE_X1, CONSOLE_X, SLED_X, HIJACK_AT, TUNNEL_X, QUEUE, HIJACK_MEMO } from './layout';
import { GUEST_SEEDS } from './art';
import * as L from './lines';

const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

export interface Hijack {
  /** The scene's going (and where it's got to), how long into this step; somebody's saying something. */
  active: boolean; step: number; t: number; busy: boolean;
  said: { who: 'op' | 'g0' | 'g1' | 'q'; s: Said; x: number; y: number } | null;
  /** The sled in front, pulling out into the tunnel; his, rolling off. */
  frontX: number; rolling: number;
  frontOut: boolean; backOut: boolean;
  flying: { seed: number; x: number; y: number; vx: number; vy: number; rot: number; landed: boolean }[];
  walker: { x: number } | null;
  /** The people in line he's knocked over (with the one he threw). */
  knocked: Set<number>;
  /** Who in line's talking (their seed); how far up the line he's had a bark; his own say, once. */
  barking: number | null; barkTo: number; cutSaid: boolean;
  opPose: Pose; opHidden: boolean;
  /** The big green button: frames since it was kicked (0: not yet). */
  pressT: number;
  boot: number;
}
export const newHijack = (): Hijack => ({
  active: false, step: 0, t: 0, busy: false, said: null, frontX: TUNNEL_X + 400, rolling: 0, frontOut: false, backOut: false,
  flying: [], walker: null, knocked: new Set(), barking: null, barkTo: LINE_X0 + 60, cutSaid: false, opPose: 'stand', opHidden: false,
  pressT: 0, boot: 0,
});

/** The guests in the sled are already out of it, and the sled's ready (the hijack's been: a revisit, or a death since). */
export const settleHijack = (state: GameState, hj: Hijack) => {
  if (!state.stageMemo[HIJACK_MEMO]) return;
  hj.frontOut = true; hj.backOut = true;
};

const say = (hj: Hijack, who: 'op' | 'g0' | 'g1', voiceId: string, text: string, x: number, y: number, next: () => void) => {
  hj.busy = true;
  speak(voiceId, text, s => { hj.said = s ? { who, s, x, y } : (hj.said?.who === who ? null : hj.said); }, true, () => { hj.busy = false; next(); });
};
const me = (state: GameState, hj: Hijack, text: string, next: () => void) => {
  hj.busy = true;
  meatheadSays(state, text, true, () => { hj.busy = false; next(); });
};
const guestVoice = (seed: number) => (lookOf(seed).woman ? 'm2.guest' : 'm2.guest2');

// ---------------------------------------------------------------------------------------------------------------
// The line (walking up it, before the scene)

export const runLine = (state: GameState, hj: Hijack) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  if (hj.active || state.stageMemo[HIJACK_MEMO] || px < LINE_X0 || px > LINE_X1 + 40) return;
  if (px < hj.barkTo || isTalking()) return;
  // (the nearest of them up ahead has something to say: one every so far up the line)
  const q = QUEUE.filter(o => Math.abs(o.x - px) < 160).sort((a, b) => Math.abs(a.x - px - 60) - Math.abs(b.x - px - 60))[0];
  if (!q) return;
  hj.barkTo = px + 230;
  hj.barking = q.seed;
  const y = GY - 90 - (q.row ? 0 : 14);
  speak(guestVoice(q.seed), pickLine(L.QUEUE_BARKS[dressed(state)]), s => {
    if (s) hj.said = { who: 'q', s, x: q.x, y };
    else { if (hj.said?.who === 'q') hj.said = null; hj.barking = null; }
  }, false, () => {
    // (his say back, once, partway up)
    if (!hj.cutSaid && px > LINE_X0 + 250) { hj.cutSaid = true; meatheadSays(state, pickLine(L.MEATHEAD_CUTS)); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The scene

/** Into the sled, and off: on to the ride (it takes him from there). */
export const handOff = (state: GameState, hj: Hijack) => {
  const p = state.player;
  stopSound('alarm');
  p.carried = false; p.hidden = false; p.inCutscene = false; p.cartSeat = false; p.kickPose = 0;
  hj.active = false; hj.said = null;
  state.stageMemo[HIJACK_MEMO] = 'yes';
  settleHijack(state, hj);
  hj.rolling = 0;
  teleport(state, SECTIONS.ride.x0 + 150, GY);
};

/** Does the scene start (or the sled just take him)? Returns true if it's taken over. */
export const atPlatform = (state: GameState, hj: Hijack) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  if (!p.isGrounded || px < HIJACK_AT) return false;
  if (state.stageMemo[HIJACK_MEMO]) { if (px > SLED_X - 120) { handOff(state, hj); return true; } return false; }
  hj.active = true; hj.step = 0; hj.t = 0; hj.frontX = SLED_X + 180;
  p.inCutscene = true; p.vel.x = 0;
  playSound('ding', 0.6, 4);
  return true;
};

const seat = (state: GameState, hj: Hijack) => {
  const p = state.player;
  p.carried = true; p.cartSeat = true; p.facing = 1;
  p.pos.x = SLED_X + hj.rolling + SEATS[0] - p.width / 2; p.pos.y = GY - SLED_SINK - p.height; p.vel.x = 0; p.vel.y = 0;
};
const walkTo = (state: GameState, x: number, speed = 3) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  if (Math.abs(px - x) <= speed) { p.pos.x = x - p.width / 2; p.vel.x = 0; return true; }
  // (a hair over the walk's threshold, so his legs go: the walk cycle's own clock sets the stride, not the speed)
  p.facing = px < x ? 1 : -1; p.pos.x += p.facing * speed; p.vel.x = p.facing * 0.5;
  return false;
};

export const runHijack = (ctx: FrameContext, hj: Hijack): Controls => {
  const { state } = ctx, p = state.player;
  hj.t++;
  p.inCutscene = true;
  if (hj.t > SKIP_AFTER || hj.step > 0) offerSkip();
  if ((hj.t > SKIP_AFTER || hj.step > 0) && takeSkip()) { silenceAll(); handOff(state, hj); return hands(); }
  const dr = dressed(state), opY = GY - 100;
  // (the sled in front, pulling out; the thrown one, flying; the one walking off)
  if (hj.frontX < TUNNEL_X + 400) hj.frontX += 2.5;
  for (const g of hj.flying) {
    if (g.landed) continue;
    g.vy += 0.45; g.x += g.vx; g.y += g.vy; g.rot -= 0.16;
    if (g.y >= GY - 20 && g.vy > 0) {
      g.y = GY - 16; g.landed = true; g.rot = -1.5;
      playSound('thud', 1, -6); playSound('crunch', 0.6); shakeScreen(state, 6, 3);
      for (const q of QUEUE) if (Math.abs(q.x - g.x) < 70) hj.knocked.add(q.seed);
    }
  }
  if (hj.walker) { hj.walker.x -= 2.2; if (hj.walker.x < LINE_X1 - 300) hj.walker = null; }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  if (hj.pressT > 0) hj.pressT++;
  switch (hj.step) {
    // Up to the sled
    case 0:
      if (walkTo(state, SLED_X - 150)) { hj.step = 1; hj.t = 0; p.facing = 1; }
      break;
    case 1:
      if (hj.busy || hj.t < 10) break;
      hj.step = 2;
      say(hj, 'op', 'm2.space.op', L.OP_GREET[dr], CONSOLE_X - 50, opY, () => me(state, hj, pickLine(L.MEATHEAD_PARTY), () => { hj.step = 3; hj.t = 0; }));
      break;
    // The front seat: out, over the rail, into the line
    case 3:
      if (!walkTo(state, SLED_X + SEATS[0] - 56)) break;
      p.facing = 1;
      if (hj.t < 14) break;
      hj.frontOut = true;
      playSound('whoosh', 0.9, -4); playSound('punch', 0.7);
      hj.flying.push({ seed: GUEST_SEEDS[0], x: SLED_X + SEATS[0], y: GY - 40, vx: -(SLED_X + SEATS[0] - (LINE_X1 - 140)) / 46, vy: -11, rot: 0, landed: false });
      hj.step = 4; hj.t = 0;
      say(hj, 'g0', guestVoice(GUEST_SEEDS[0]), pickLine(L.GUEST_THROWN[dr]), LINE_X1 - 140, GY - 120, () => {});
      break;
    // The back seat: out on her own
    case 4:
      if (hj.t === 40) { hj.backOut = true; hj.walker = { x: SLED_X + SEATS[1] - 40 }; playSound('land', 0.5); }
      if (hj.t > 40 && !hj.busy) { hj.step = 5; hj.t = 0; say(hj, 'g1', guestVoice(GUEST_SEEDS[1]), L.GUEST_FLEES, SLED_X - 120, GY - 100, () => {}); }
      break;
    // In he gets; the operator's say, his, hers
    case 5:
      if (hj.t < 30) break;
      if (hj.t === 30) { seat(state, hj); playSound('land', 0.8); playSound('clang', 0.3, -4); }
      if (hj.busy) break;
      hj.step = 6;
      say(hj, 'op', 'm2.space.op', L.OP_PROTEST[dr], CONSOLE_X - 50, opY, () => me(state, hj, L.MEATHEAD_WHICH, () =>
        say(hj, 'op', 'm2.space.op', L.OP_DONT, CONSOLE_X - 50, opY, () => { hj.step = 7; hj.t = 0; })));
      break;
    case 6: seat(state, hj); break;
    // Out again, back to the console, and the boot into the big green one
    case 7:
      if (hj.t === 1) { p.carried = false; p.cartSeat = false; p.pos.y = GY - p.height; p.vel.y = 0; p.isGrounded = true; }
      if (!walkTo(state, CONSOLE_X + 46)) break;
      p.facing = -1;
      if (!hj.boot) { hj.boot = 1; p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.6, -4); hj.opPose = 'after'; }
      else if (++hj.boot === 9) {
        hj.pressT = 1; playSound('clang', 1, -6); playSound('punch', 0.9); shakeScreen(state, 5, 3);
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: CONSOLE_X + 10, y: GY - 74 }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 20, color: i % 2 ? '#FDE047' : '#4ADE80', size: 2 });
      }
      if (hj.boot > 9 && hj.pressT > 12) { hj.step = 8; hj.t = 0; playSound('alarm', 0.5); playSound('grind', 0.6, -6); }
      break;
    // Off it goes: he runs and jumps in; her last say; into the tunnel
    case 8: {
      hj.rolling += Math.min(5, hj.t * 0.06);
      if (hj.t < 34) { walkTo(state, SLED_X + hj.rolling + SEATS[0], 5); if (hj.t > 20) p.pos.y = GY - p.height - Math.sin(((hj.t - 20) / 14) * Math.PI) * 40; }
      else seat(state, hj);
      if (hj.t === 36) { playSound('land', 0.7); say(hj, 'op', 'm2.space.op', L.OP_AFTER, CONSOLE_X - 50, opY, () => {}); }
      if (hj.t >= 12 && (hj.t - 12) % 54 === 0) playSound('alarm', 0.4);
      if (p.pos.x > TUNNEL_X + 30) p.hidden = true;
      if (hj.t > 200 && !hj.busy) { handOff(state, hj); return hands(); }
      break;
    }
  }
  return hands();
};
