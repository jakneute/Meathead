// The AMULET (SPEC.md): the piss-off yell, passive. What he takes fills a meter; it drains on its own. Full, he screams
// an echoey "FUCK OFF!" (its own voice, m2.yell: voiceclips.ts's 'echo'), and it hits everything on the screen: regular
// enemies stunned (or killed, if it's enough), a little off everybody, the bosses and sub-bosses too. Then he's
// invulnerable a while with nothing knocking him about, then a cooldown before it can fill again. Only with the amulet
// owned and switched on (the pause menu's AMULET ON / OFF): amuletActive().
//
// Wiring (each a line where it's needed):
//   stepAmulet(ctx)        each frame, from moves/grab.ts updateGrab (every land, the hub, the pen, the intro, the gym)
//   amuletShielded()       grab.ts folds it into player.untouchable (nothing hurts him; hurtPlayer, the engine's
//                          contact and shots, Meathead 2's own hurts that ask untouchable)
//   drawAmuletFx(c, state) the shockwave and the aura, world space, from grab.ts drawGrab
//   takeYell(e, frame)     the land bosses' fights (each fight.ts takeHits): the yell's share, in place of reading the
//                          health it took as a weapon's shot (their breather as ever)
//   subscribeAmulet / amuletSnap   the HUD's meter and face (AmuletHud.tsx)
//   rageDamageK() / raged(n)       through the rage his charge moves and grabs hit harder (RAGE_DAMAGE_K, ×1.5; times
//                          the bulk up's own): bossMelee.ts (the bosses' and sub-bosses' normalized hits), apply.ts's
//                          melee hook (the engine's hits on everything else), moves/grab.ts (every grab's damage),
//                          moves/followups.ts. Not his weapons (the owner's "all charge/grabs that is, like bulk up")
//
// The numbers (TUNE) are tune.ts's: AMULET_FULL (35 damage, as it comes off his health: after the soft hits and the
// helmet), AMULET_DRAIN (3.5 a second), YELL_DAMAGE, YELL_STUN, YELL_SHIELD (3 s), YELL_COOLDOWN (10 s), RAGE_DAMAGE_K (×1.5).

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';
import { shakeScreen } from '../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_INVINCIBILITY_FRAMES } from '../../m1/constants';
import { setArmor } from '../../m1/game/core/resist';
import { isMidBoss } from '../../m1/game/combat/midBoss';
import { pushEnemy } from '../../m1/game/combat/knockback';
import { interrupt } from '../../m1/game/enemies/enemies';
import { playSound } from '../../m1/game/platform/audio';
import { say, type Voice } from '../../m1/game/platform/speech';
import { setHeadFlush } from '../../m1/game/render/player/body';
import { hazardKill } from '../hazardHit';
import { amuletActive } from './state';
import { YELL_LINE } from './lines';
import { AMULET_FULL, AMULET_DRAIN, YELL_DAMAGE, YELL_STUN, YELL_SHIELD, YELL_COOLDOWN, YELL_EDGE, AMULET_ANGRY_AT, RAGE_DAMAGE_K } from './tune';

type Phase = 'fill' | 'rage' | 'cool';
/** His voice, through the canyon (tools/voices/cast.json m2.yell). */
const YELL_VOICE: Voice = { id: 'm2.yell', pitch: 0.1, rate: 1.2 };
/** What goes up over the ones it kills. */
const KILL_CALLS = ['FUCKED OFF!', 'TOLD!', 'EARDRUMS!'];
/** God mode (the cheats): a hurt that takes nothing counts as this much, so the meter can be tried out. */
const GOD_HIT = 8;

const a = {
  st: null as GameState | null,
  phase: 'fill' as Phase,
  /** The meter, in damage taken (0..AMULET_FULL). */
  meter: 0,
  /** Frames left of the rage (invulnerable) or the cooldown. */
  t: 0,
  /** His health as it was last frame (what's come off since fills it). */
  hp: -1,
  /** His health as the yell went off: held there through the rage (anything that slips past the shield). */
  hpLock: 0,
  /** The pushback the frame before (a new shove's cancelled in the rage). */
  push: 0,
  /** His hurt timer the frame before (god mode's stand-in for what he took). */
  hurtWas: 0,
  /** The shockwave: where it went off (world), how many frames ago. */
  ring: null as null | { x: number; y: number; t: number },
};

// ---- the land bosses' share (their fights read the health they lose as a weapon's shot: this says it was the yell)
const yelled = new WeakMap<Enemy, { n: number; at: number }>();
/** The yell's damage on this boss in the last couple of frames (0 if none), taken once. */
export const takeYell = (e: Enemy, frame: number) => {
  const y = yelled.get(e);
  if (!y) return 0;
  yelled.delete(e);
  return frame - y.at <= 2 ? y.n : 0;
};

// ---- for the HUD (a new snapshot only when what it shows changes)
export interface AmuletSnap { phase: Phase; fill: number; left: number }
let snap: AmuletSnap = { phase: 'fill', fill: 0, left: 0 };
const listeners = new Set<() => void>();
export const subscribeAmulet = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const amuletSnap = () => snap;
const publish = () => {
  const fill = Math.round((a.phase === 'fill' ? a.meter / AMULET_FULL : 0) * 32) / 32;
  const left = Math.round((a.phase === 'rage' ? a.t / YELL_SHIELD : a.phase === 'cool' ? a.t / YELL_COOLDOWN : 0) * 24) / 24;
  if (fill === snap.fill && left === snap.left && a.phase === snap.phase) return;
  snap = { phase: a.phase, fill, left };
  listeners.forEach(f => f());
};

/** Invulnerable just now (the rage after the yell). */
export const amuletShielded = () => a.phase === 'rage' && a.t > 0;
/** His charge moves and grabs through the rage: RAGE_DAMAGE_K, else 1 (bossMelee.ts, apply.ts's melee hook,
 *  moves/grab.ts, moves/followups.ts). Multiplies with the bulk up's own. Never his weapons. */
export const rageDamageK = () => (amuletActive() && amuletShielded() ? RAGE_DAMAGE_K : 1);
/** A charge move's or a grab's damage, raged if he's raging (whole numbers, as the damage numbers show). */
export const raged = (n: number) => { const k = rageDamageK(); return k === 1 ? n : Math.round(n * k); };
/** How pissed off he is (0..1): the meter, and all the way through the rage. */
export const amuletAnger = () => (!amuletActive() ? 0 : a.phase === 'rage' ? 1 : a.phase === 'fill' ? a.meter / AMULET_FULL : 0);

// (his face on the sprite: red with it, from the angry point up)
setHeadFlush(() => { const k = amuletAnger(); return k <= AMULET_ANGRY_AT ? 0 : (k - AMULET_ANGRY_AT) / (1 - AMULET_ANGRY_AT); });

const endRage = () => { setArmor(false, 'amulet'); };
const reset = () => {
  if (a.phase === 'rage') endRage();
  a.phase = 'fill'; a.meter = 0; a.t = 0; a.ring = null;
};

/** On the screen (or just off it): the view as drawn, else the camera's. */
const onScreen = (state: GameState, e: Enemy) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  return e.pos.x + e.width > v.x - YELL_EDGE && e.pos.x < v.x + v.w + YELL_EDGE && e.pos.y + e.height > v.y - YELL_EDGE && e.pos.y < v.y + v.h + YELL_EDGE;
};

/** The yell landing on one of them. */
const hit = (ctx: FrameContext, e: Enemy, cx: number) => {
  const { state, fx } = ctx;
  // (a boss or a sub-boss: a little off it, through whatever its fight reads (the land bosses, takeYell); no stun)
  if (e.type === 'boss' || isMidBoss(e)) {
    e.health -= YELL_DAMAGE; e.hitFlash = 8;
    yelled.set(e, { n: YELL_DAMAGE, at: state.frame });
    return;
  }
  // (anybody else: enough to finish it and it's blown off its feet; else a chunk off, knocked back a step, stunned)
  if (e.health <= YELL_DAMAGE) { hazardKill(ctx, e, cx, KILL_CALLS[Math.floor(Math.random() * KILL_CALLS.length)], { color: '#FCA5A5', fling: { x: (e.pos.x + e.width / 2 < cx ? -1 : 1) * 9, y: -9 } }); return; }
  e.health -= YELL_DAMAGE; e.hitFlash = 8;
  const away = e.pos.x + e.width / 2 < cx ? -1 : 1;
  pushEnemy(e, away * 4, -3, YELL_STUN);
  interrupt(e);
  e.shootTimer = Math.max(e.shootTimer || 0, YELL_STUN);
  fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 20 }, YELL_DAMAGE, false);
};

const yell = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height * 0.3;
  a.phase = 'rage'; a.t = YELL_SHIELD; a.meter = 0; a.hpLock = p.health;
  a.ring = { x: cx, y: cy, t: 0 };
  setArmor(true, 'amulet');
  // (the words over him only while it's said: the speech rule. Urgent: it's a scream, it cuts off anybody talking)
  say(YELL_LINE, YELL_VOICE, 'urgent', {
    always: true,
    onShow: spoken => {
      state.playerLastVulgarity = YELL_LINE; state.playerVulgarityTimer = 9999;
      if (!spoken) setTimeout(() => { if (state.playerLastVulgarity === YELL_LINE) state.playerVulgarityTimer = 0; }, 1600);
    },
    onHide: () => { if (state.playerLastVulgarity === YELL_LINE) state.playerVulgarityTimer = 0; },
  });
  playSound('boom', 0.8, -6); playSound('rumble', 0.9, -4);
  shakeScreen(state, 26, 10);
  for (const e of [...state.enemies]) {
    if (e.health <= 0 || e.isBlownAway || e.innocent || !onScreen(state, e)) continue;
    hit(ctx, e, cx);
  }
  // (spit and steam off him)
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2;
    state.particles.push({ pos: { x: cx, y: cy }, vel: { x: Math.cos(ang) * (5 + Math.random() * 3), y: Math.sin(ang) * (4 + Math.random() * 2) - 1 }, life: 22, color: i % 3 ? 'rgba(255, 255, 255, 0.75)' : '#FCA5A5', size: 2 + Math.random() * 3 });
  }
};

/** Each frame (moves/grab.ts updateGrab). */
export const stepAmulet = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  if (state !== a.st) { reset(); a.st = state; a.hp = p.health; a.push = p.pushbackTimer; }
  if (a.ring && ++a.ring.t > 40) a.ring = null;
  let took = a.hp > 0 && p.health < a.hp ? a.hp - p.health : 0;
  // (the cheats' god mode: nothing comes off him, so a fresh hurt counts as a middling hit, for trying it out)
  if (ctx.cheats.invincible && p.hurtTimer >= PLAYER_INVINCIBILITY_FRAMES - 1 && a.hurtWas < p.hurtTimer) took += GOD_HIT;
  a.hurtWas = p.hurtTimer;
  a.hp = p.health;
  // (dead, dying: it's all off; back at a checkpoint it starts empty)
  if (p.health <= 0 || state.deathTimer > 0) { reset(); publish(); return; }
  if (!amuletActive()) {
    // (switched off (or not his): the meter empty; a rage on ends, into its cooldown, so it can't be flicked back for a
    // free one)
    if (a.phase === 'rage') { endRage(); a.phase = 'cool'; a.t = YELL_COOLDOWN; }
    else if (a.phase === 'cool' && --a.t <= 0) a.phase = 'fill';
    a.meter = 0;
    publish();
    return;
  }
  switch (a.phase) {
    case 'fill': {
      a.meter = Math.max(0, Math.min(AMULET_FULL, a.meter - AMULET_DRAIN + took));
      if (a.meter >= AMULET_FULL && !p.inCutscene) yell(ctx);
      break;
    }
    case 'rage': {
      // (anything that got past the shield anyway (a hazard that doesn't ask): it's put back)
      if (p.health < a.hpLock) { p.health = a.hpLock; a.hp = p.health; } else a.hpLock = p.health;
      // (the shield's flicker, and whatever asks the hurt timer leaves him be (kept under the hurt face's 40))
      p.invincibilityTimer = Math.max(p.invincibilityTimer, Math.min(a.t, 30));
      // (no shoves: a new one (not his own rebound off something he hit) is cancelled on the spot)
      if (p.pushbackTimer > a.push && !p.recoiling && !p.slideRecoil && !p.isHarmlessPushback && !p.carried && !p.inCutscene) {
        p.pushbackTimer = 0; p.vel.x = 0; if (p.vel.y < 0) p.vel.y = 0;
        if (p.freefall?.style === 'flail') p.freefall = undefined;
      }
      if (--a.t <= 0) { endRage(); a.phase = 'cool'; a.t = YELL_COOLDOWN; }
      break;
    }
    case 'cool': {
      a.meter = 0;
      if (--a.t <= 0) a.phase = 'fill';
      break;
    }
  }
  a.push = p.pushbackTimer;
  // (his face: angry from AMULET_ANGRY_AT up (the sprite's own scowl), steam off his head near the top)
  const k = amuletAnger();
  if (k >= AMULET_ANGRY_AT && !p.inCutscene) {
    p.angryTimer = Math.max(p.angryTimer ?? 0, 2);
    if (k > 0.75 && state.frame % (a.phase === 'rage' ? 4 : 9) === 0) {
      state.particles.push({ pos: { x: p.pos.x + p.width / 2 + (Math.random() - 0.5) * 16, y: p.pos.y + 2 }, vel: { x: (Math.random() - 0.5) * 0.8, y: -1.4 - Math.random() }, life: 22, color: 'rgba(240, 240, 240, 0.55)', size: 2.5 + Math.random() * 2 });
    }
  }
  publish();
};

/** The shockwave going out off him, and the red heat round him through the rage (world space; grab.ts drawGrab). */
export const drawAmuletFx = (c: CanvasRenderingContext2D, state: GameState) => {
  const r = a.ring;
  if (r && state === a.st) {
    const k = r.t / 40;
    c.save();
    // (two rings, the second behind the first; the air inside them shimmering)
    for (const [lag, w, col] of [[0, 10, '255, 255, 255'], [5, 6, '252, 165, 165']] as const) {
      const t = r.t - lag;
      if (t <= 0) continue;
      const rad = 30 + t * 26, al = Math.max(0, 1 - t / 36);
      c.strokeStyle = `rgba(${col}, ${(0.8 * al).toFixed(3)})`;
      c.lineWidth = Math.max(1, w * al);
      c.beginPath(); c.ellipse(r.x, r.y, rad, rad * 0.8, 0, 0, Math.PI * 2); c.stroke();
    }
    if (k < 0.25) { c.fillStyle = `rgba(255, 255, 255, ${(0.25 * (1 - k / 0.25)).toFixed(3)})`; c.beginPath(); c.arc(r.x, r.y, 40 + r.t * 20, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  if (a.phase === 'rage' && state === a.st && state.player.health > 0 && !state.player.hidden) {
    const p = state.player, pulse = 0.5 + 0.5 * Math.sin(state.frame * 0.3);
    const fade = Math.min(1, a.t / 30);
    c.save();
    c.strokeStyle = `rgba(239, 68, 68, ${((0.35 + 0.3 * pulse) * fade).toFixed(3)})`;
    c.lineWidth = 3;
    c.beginPath(); c.ellipse(p.pos.x + p.width / 2, p.pos.y + p.height / 2, p.width * 0.9 + pulse * 4, p.height * 0.62 + pulse * 4, 0, 0, Math.PI * 2); c.stroke();
    c.restore();
  }
};
