// A lever thrown by hand (shared: the coaster's RIDE MODE lever; Disaster: The Ride's REAL DISASTERS lever can use it
// as it is). His pose is the engine's own (Player.leverPull: him from behind, both fists on the grip, render/player/
// ladder.ts drawOverheadPull): he steps up to it, reaches up and takes hold, hauls it over (sunk, braced, straining),
// it hits its stop with a jolt, and he lets go. The section draws the lever itself at `throwAngle` (its handle rotated
// about its pivot by that, 0 straight up, + toward +x) and does whatever the lever does on `'thrown'`.
//
//   const th = startThrow();                         // up pressed at it
//   const step = tickThrow(state, LEVER, th);        // every frame (his controls: none while it's 'busy')
//   if (step === 'thrown') { ...flip it... }         // the frame it hits its stop
//   drawn at throwAngle(LEVER, th, flipped)
//
// Hurt, dead or knocked off his feet partway, he lets go (it's 'done', not thrown: up again to have another go).

import type { GameState } from '../../m1/game/core/state';
import { playSound } from '../../m1/game/platform/audio';

/** A lever on the floor (or a wall): its pivot (world), pivot to grip (px), its two throws (radians from straight up,
 *  + toward +x), where he stands to throw it (his middle, from the pivot's x). */
export interface HandLever { x: number; y: number; len: number; from: number; to: number; stand: number }
/** One throw of it, under way: frames in; let go (frames of letting go). */
export interface LeverThrow { t: number; letGo: number; thrown: boolean }

/** Frames: the whole haul; the reach (taking hold) and the stop (the jolt) as parts of it; letting go after. */
const PULL = 40, REACH = 0.25, BOTTOM = 0.82, LET_GO = 10;
const ease = (k: number) => k * k * (3 - 2 * k);

export const startThrow = (): LeverThrow => ({ t: 0, letGo: 0, thrown: false });

/** The handle's angle: mid-throw (th), or at rest (thrown or not). */
export const throwAngle = (lv: HandLever, th: LeverThrow | null, flipped: boolean) => {
  if (!th || th.letGo > 0 || th.thrown) return flipped ? lv.to : lv.from;
  const t = th.t / PULL, k = t <= REACH ? 0 : t >= BOTTOM ? 1 : ((t - REACH) / (BOTTOM - REACH)) ** 1.6;
  const j = t > BOTTOM ? (t - BOTTOM) / (1 - BOTTOM) : 0, dir = Math.sign(lv.to - lv.from) || 1;
  // (a shake in it while he hauls; the bounce off its stop)
  return lv.from + (lv.to - lv.from) * k + (t > REACH && t < BOTTOM ? Math.sin(th.t * 1.3) * 0.03 : 0) - dir * Math.sin(Math.PI * j) * 0.1 * (1 - j);
};

/**
 * A frame of the throw: his pose on its grip (stepped up to it), the sounds. 'busy' while he's at it (no controls for
 * him), 'thrown' the frame it hits its stop, 'done' once he's let go (or been knocked off it).
 */
export const tickThrow = (state: GameState, lv: HandLever, th: LeverThrow): 'busy' | 'thrown' | 'done' => {
  const p = state.player;
  const a = throwAngle(lv, th, th.thrown), gx = lv.x + Math.sin(a) * lv.len, gy = lv.y - Math.cos(a) * lv.len;
  const lean = Math.sign(lv.to - lv.from) || 1;
  if (p.health <= 0 || p.pushbackTimer > 0 || !p.isGrounded) { p.leverPull = undefined; return 'done'; }
  p.vel.x = 0;
  if (!th.thrown) {
    th.t++;
    const t = th.t / PULL, r = Math.min(1, t / REACH), j = t > BOTTOM ? (t - BOTTOM) / (1 - BOTTOM) : 0;
    // (stepped up to it as he reaches)
    const cx = p.pos.x + p.width / 2;
    p.pos.x += (lv.x + lv.stand - cx) * 0.35;
    p.leverPull = { gx, gy, ang: a, hold: ease(r), load: t <= REACH ? 0 : t >= BOTTOM ? 1 : Math.min(1, ((t - REACH) / (BOTTOM - REACH)) * 1.6), jolt: j > 0 ? Math.sin(Math.PI * Math.min(1, j * 1.4)) : 0, lean };
    if (th.t === Math.round(PULL * REACH)) playSound('click', 0.5, -4);
    if (t > REACH && t < BOTTOM && th.t % 9 === 0) playSound('grind', 0.25, 6);
    if (th.t >= PULL) { th.thrown = true; return 'thrown'; }
    return 'busy';
  }
  // Letting go: his hands come down off it, he straightens up
  th.letGo++;
  const lp = p.leverPull;
  if (lp) { lp.gx = gx; lp.gy = gy; lp.ang = a; lp.hold = Math.max(0, 1 - th.letGo / LET_GO); lp.load *= 0.75; lp.jolt = 0; }
  if (th.letGo >= LET_GO) { p.leverPull = undefined; return 'done'; }
  return 'busy';
};
