// THE WOODCHIPPER (the user's: "the end of the line is a woodchipper. you gotta jump out at that moment or else you get
// a funny death animation"). The real river runs into a logging crew's sluice; its conveyor hauls the log up into the
// hopper of their big orange chipper. Told plain and early: the crew's WOODCHIPPER sign on the bank, then as the log
// goes up the conveyor a lamp on the chipper goes amber (READY), then flashes green with JUMP! over the clearing and
// the crew yelling it (a good second and a half to do it in). Jump then: he vaults out over the hopper and lands on the
// crew's clearing past it (on his feet: off its right end into the woods); the log goes through, chips everywhere.
// Don't: the log noses into the hopper, then him, feet first, flailing (his own hurt line), the chute spraying wood
// chips, then red, his shoe, the bits of his pants (or not: naked), all over the crew's truck; then the death screen
// (m2:fr_chipper: its death lines). A jump before the window is just a hop in the log.
//
// The crew (kinds.ts LOGGER) are enemies: they yell JUMP while he's coming, then they're sore about their log and come
// at him with chainsaws. Anybody flung or thrown into the running chipper's hopper (a logger, alive or a body; the grab's
// throw, a charge's knock, a corpse going over) goes through it: red out the chute over the truck, CHIPPED!.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import type { Enemy } from '../../../m1/types';
import { KILL_CALLOUTS, type KillCallout } from '../../../m1/content/dialogue';
import { hands, meatheadSays, speak, byPants, getFrontier } from '../section';
import type { ByPants } from '../talk';
import { lookOf } from '../../adventure/temple/people';
import { rideOf } from './state';
import { unboard, feetY, riderX } from './ride';
import { X, x0, x1, CHIPPER, JUMP_FROM, READY_FROM, LAND_X, END } from './layout';
import { startGore, updateGore, chipperJammed } from './chipperGore';
import { RIDE_VOICES, CREW_JUMP, CREW_MAD, CHIPPED_CALLS, JUMPED, HURT } from './lines';
import { inPlay } from '../../moves/grab';

const LEAP = 54;
/** Whoever goes into the hopper: its own callout (the announcer's). */
(KILL_CALLOUTS as Record<string, { lines: string[]; color: string }>).chipped = { lines: [...CHIPPED_CALLS], color: '#D6A060' };
/** The hopper's mouth (world): flung into this, through the chipper. */
const HOPPER = { x0: CHIPPER.x - 50, x1: CHIPPER.x + 70, y0: CHIPPER.hopperY - 70, y1: CHIPPER.hopperY + 40 };

/** One of the crew says it (over them while it's said). */
const crewSays = (state: GameState, who: Enemy, pool: ByPants) => {
  const ch = rideOf(state).chip, woman = lookOf(Math.abs(Math.round(who.initialX || 0)) + (who.variant ?? 0) * 31).woman;
  ch.crewBy = who;
  speak(woman ? RIDE_VOICES.crewf : RIDE_VOICES.crew, pickLine(byPants(state, pool)), s => { ch.crew = s; }, false);
};
const crewAlive = (state: GameState) => rideOf(state).crew.filter(e => e.health > 0 && !e.isBlownAway && inPlay(state, e));

/** Anybody flung into the running chipper's hopper goes through it. */
const chipThrown = (ctx: FrameContext) => {
  const { state } = ctx, ch = rideOf(state).chip;
  const held = (getFrontier(state) as { grab?: { held: Enemy | null } } | null)?.grab?.held ?? null;
  for (const e of state.enemies) {
    if (e.type === 'boss' || e === held || (e.health <= 0 && !e.isBlownAway)) continue;
    const flying = e.isBlownAway || e.meleeFlung || e.uppercutFlung || (e.pauseTimer ?? 0) > 0 || Math.abs(e.vel.y) > 2.5;
    const feet = e.pos.y + e.height;
    if (!flying || feet > CHIPPER.ground - 16) continue;
    if (e.pos.x + e.width < HOPPER.x0 || e.pos.x > HOPPER.x1 || e.pos.y > HOPPER.y1 || feet < HOPPER.y0) continue;
    const alive = e.health > 0;
    e.health = 0; e.isBlownAway = false; e.vel.x = 0; e.vel.y = 0;
    ctx.fx.spawnKillCallout(e, 'chipped' as KillCallout);
    // (in and gone: out of sight down the throat)
    e.pos.y = CHIPPER.ground + 4000;
    ch.gore = 80;
    startGore(state, e);
    playSound('grind', 1, -12); playSound('gorespray', 1, -4); playSound('crunch', 0.9, -8); shakeScreen(state, 7, 3);
    if (alive) playSound('screams', 0.7, 4);
  }
};

/** A frame of the end of the river (while he's in the log on the sluice, and after). Returns the controls (or none: the
 *  leap, the mulching). */
export const updateChipper = (ctx: FrameContext, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, r = rideOf(state), L = r.log, ch = r.chip;
  // ---- the chips and the bits, flying (on after it's done)
  for (const q of ch.chips) { q.vy += 0.35; q.x += q.vx; q.y += q.vy; q.life--; if (q.y > CHIPPER.ground + 10) { q.y = CHIPPER.ground + 10; q.vx *= 0.5; q.vy = 0; } }
  ch.chips = ch.chips.filter(q => q.life > 0);
  // ---- running: anybody flung in goes through it, red out the chute a while after
  if (ch.state !== 'idle') chipThrown(ctx);
  updateGore(state);
  if (ch.gore > 0) { ch.gore--; if (ch.gore % 3 === 0 && !chipperJammed(state)) spray(state, ch.gore > 50 ? 'red' : ch.gore > 25 ? 'meat' : 'wood'); if (ch.gore % 12 === 0) playSound('grind', 0.7, -8); }
  // ---- the crew, sore about their log, once he's down on their clearing (the first time this visit)
  if (!ch.madSaid && ch.state === 'safe' && ch.t > 50 && p.health > 0 && !p.inCutscene) {
    const who = crewAlive(state)[0];
    ch.madSaid = true;
    if (who) crewSays(state, who, CREW_MAD);
  }
  if (L.mode === 'ride' && L.rx >= READY_FROM) {
    if (ch.state === 'idle') { ch.state = 'ready'; ch.t = 0; playSound('engine', 0.8, -8); }
    if (ch.state === 'ready' && L.rx >= JUMP_FROM) {
      ch.state = 'open'; ch.t = 0; playSound('alert', 1, 4); playSound('beep', 0.8, 8);
      const who = crewAlive(state)[0];
      if (!ch.crewSaid && who) { ch.crewSaid = true; crewSays(state, who, CREW_JUMP); }
    }
    ch.t++;
    if (ch.state === 'open' && ch.t % 20 === 0) playSound('beep', 0.6, 10);
    // (jumped in the window: out and over)
    if (ch.state === 'open' && controls.jump && !ch.lk && p.health > 0) {
      ch.state = 'leap'; ch.t = 0; ch.lk = 0.001; ch.lx0 = riderX(r); ch.ly0 = feetY(r);
      L.mode = 'leap'; p.inCutscene = true; p.logSeat = false;
      playSound('jump', 1, -2); playSound('whoosh', 0.8);
      return hands();
    }
    // (the log's nose into the hopper: too late)
    if (L.rx >= END - 30 && (ch.state === 'open' || ch.state === 'ready')) {
      ch.state = 'mulch'; ch.t = 0; L.mode = 'chipper';
      p.inCutscene = true; p.isDucking = false; p.logSeat = false;
      meatheadSays(state, pickLine(HURT['m2:fr_chipper'].hurt), false);
      playSound('grind', 1, -10); playSound('screams', 0.9, 2);
      return hands();
    }
    return null;
  }
  if (ch.state === 'leap') return leap(ctx);
  if (ch.state === 'mulch') return mulch(ctx);
  // (the chipper chewing through the log after he's out)
  if (ch.state === 'safe') {
    ch.t++;
    if (ch.t < 70 && ch.t % 3 === 0) spray(state, ch.t < 60 ? 'wood' : 'dust');
  }
  return null;
};

const spray = (state: GameState, what: 'wood' | 'dust' | 'red' | 'meat' | 'shoe' | 'cloth') => {
  const ch = rideOf(state).chip, cx = CHUTE.x, cy = CHUTE.y;
  const col = what === 'wood' ? ['#D6A060', '#B8813E', '#E8C890'] : what === 'dust' ? ['#C8A878'] : what === 'red' ? ['#B91C1C', '#7F1D1D', '#DC2626'] : what === 'meat' ? ['#F2A8B0', '#991B1B', '#F5F0E6'] : what === 'shoe' ? ['#3F2A14'] : isNude(state) ? ['#F0C8A2'] : isShat(state) ? ['#6B4A1E', '#3B6AA0'] : ['#3B6AA0', '#F8FAFC'];
  const n = what === 'shoe' ? 1 : 4;
  for (let i = 0; i < n; i++) ch.chips.push({ x: cx, y: cy, vx: 4 + Math.random() * 6, vy: -5 - Math.random() * 5, c: col[i % col.length], s: what === 'shoe' ? 9 : what === 'meat' ? 4 : 2 + Math.random() * 2, life: 260 });
};

/** Out of the log, up over the hopper, down onto the clearing. */
const leap = (ctx: FrameContext): Controls => {
  const { state } = ctx, p = state.player, r = rideOf(state), ch = r.chip, L = r.log;
  ch.t++;
  const k = Math.min(1, ch.t / LEAP);
  const x = ch.lx0 + (X(LAND_X) - ch.lx0) * k, y = ch.ly0 + (CHIPPER.ground - ch.ly0) * k - Math.sin(k * Math.PI) * 170;
  p.pos.x = x - p.width / 2; p.pos.y = y - p.height; p.vel.x = 4; p.vel.y = k < 0.5 ? -6 : 6;
  p.isGrounded = false; p.facing = 1; p.spriteRot = 0;
  // (the log goes on up into it without him)
  L.rx = Math.min(END, L.rx + 1.7);
  if (L.rx >= END - 30 && ch.t % 3 === 0) spray(state, 'wood');
  state.cameraOverride = { x: Math.max(x0, Math.min(x1 - CANVAS_WIDTH, X(LAND_X) - 420)), y: CHIPPER.ground - 440 };
  if (k >= 1) {
    ch.state = 'safe'; ch.t = 0; L.mode = 'done';
    unboard(state);
    p.pos.y = CHIPPER.ground - p.height; p.vel.x = 0; p.vel.y = 0;
    p.inCutscene = false;
    playSound('land', 1); shakeScreen(state, 6, 3);
    meatheadSays(state, pickLine(byPants(state, JUMPED)), true);
  }
  return hands();
};

/** In he goes: the log first, then him, feet first; the chute sprays it all over the truck; the death screen. */
const mulch = (ctx: FrameContext): Controls => {
  const { state } = ctx, p = state.player, r = rideOf(state), ch = r.chip, L = r.log;
  ch.t++;
  const t = ch.t;
  // (the log: on up into the hopper and gone)
  L.rx = Math.min(END + 60, L.rx + 1.4);
  if (t % 3 === 0) spray(state, t < 30 ? 'wood' : t < 50 ? 'red' : 'meat');
  if (t === 60) spray(state, 'shoe');
  if (t === 66 || t === 74) spray(state, 'cloth');
  if (t % 10 === 0) { playSound('grind', 1, -8 - (t % 20) / 4); shakeScreen(state, 5, 2); }
  if (t === 34) { playSound('gorespray', 1, -4); playSound('splat', 1, -6); }
  // (him: flailing, sinking into the hopper feet first (its front's drawn over him), shoved on down)
  const sink = Math.max(0, t - 20) * 1.3;
  p.freefall = { style: 'flail', t, rot: Math.sin(t * 0.3) * 0.25, land: 0 };
  p.pos.x = CHIPPER.x - 6 - p.width / 2; p.pos.y = CHIPPER.hopperY - p.height + 8 + sink;
  p.vel.x = 0; p.vel.y = 0; p.isGrounded = false; p.spriteRot = 0;
  if (sink > p.height + 10) p.hidden = true;
  state.cameraOverride = { x: Math.max(x0, Math.min(x1 - CANVAS_WIDTH, CHIPPER.x - 360)), y: CHIPPER.ground - 440 };
  if (t >= 110) {
    p.inCutscene = false; p.untouchable = false; p.invincibilityTimer = 0;
    p.carried = false; p.freefall = undefined;
    hurtPlayer(ctx, 9999, 'm2:fr_chipper');
    // (still alive (the cheat): spat out the chute onto the clearing, in one piece somehow)
    if (p.health > 0) {
      p.hidden = false; ch.state = 'safe'; ch.t = 0; L.mode = 'done';
      unboard(state);
      p.pos.x = X(LAND_X) - p.width / 2; p.pos.y = CHIPPER.ground - p.height;
    }
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the sluice and its conveyor, the chipper (its hopper, its body, its chute out over the crew's truck), the
// crew, the lamp and the JUMP!; the clearing.

/** The chute's mouth (world): where it all comes out. */
export const CHUTE = { x: CHIPPER.x + 150, y: CHIPPER.hopperY - 96 };

export { drawChipperBack, drawChipperFront } from './chipperArt';
