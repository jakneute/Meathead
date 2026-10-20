// PUNCHY & KICKY's cast (Meathead 2's own kinds, registered when Cartoon Land is loaded): the show's costumed
// characters and the live show's crew (men and women, every skin, build and hair, seeded per enemy; any of them in any
// costume). Each has its tell before it hits:
//
//   punchy     PUNCHY, the cat (a full costume: the big cat head, a torn ear, stitches, a mad grin; the fur suit; a
//              wooden mallet as big as he is). Close: the mallet hauled up over his head (the tell), then down in front
//              of him. Further off: a crouch, the mallet back (the tell), a leap at him, and the mallet into the floor
//              where he lands; it sticks, and he tugs at it (his window).
//   kicky      KICKY, the mouse (the big mouse head, buck teeth, round ears; red sneakers; a meat cleaver held out in
//              front: POINTY, charging into it hurts). Off a way: the cleaver drawn back with a glint (the tell) and
//              flung spinning; then he digs another out of his pouch. Close: up on one foot, knee up (the tell), and the
//              big kick.
//   kickyboom  KICKY with the dynamite (the same costume, a bandolier of sticks): a match struck on his teeth, a stick
//              lit (the tell: the fuse fizzing in his hand), and lobbed; it lands, its fuse still going, and goes up
//              (everybody's dynamite: the cast too). Close: the kick.
//   host       THE HOST of PUNCHY & KICKY LIVE! (a red tailcoat spattered with stage blood, a top hat, a bow tie, a
//              bullhorn, a cane): keeps his distance; the bullhorn up (the tell: "AND NOW... THE ANVIL!"), and an
//              anvil's shadow is on him (hazards.ts callAnvil). Close: the cane raised (the tell), and a whack.
//   stagehand  A STAGEHAND (black clothes, a headset, gaffer tape, work gloves): a folded portable hole held up and
//              wiggled (the tell), then flung down in front of him, where it spreads out flat. Close: a sandbag hoisted
//              over the shoulder (the tell) and swung.
//
// What they throw: hazards.ts (updateThrows). Their drawings: kindArt.ts.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickFreshLine } from '../../../m1/game/platform/speech';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { itchyOf } from './state';
import { throwIt, callAnvil, holesFull, bonkStars } from './hazards';
import { HURT, DEATH_KIND, KILL_CALLS, CAST_VOICES, PUNCHY_BARK, KICKY_BARK, BOOM_BARK, HOST_BARK, HOST_CUE, STAGEHAND_BARK } from './lines';
import { drawPunchy, drawKicky, drawHost, drawStagehand } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);
for (const [source, kind] of Object.entries(DEATH_KIND)) registerDeathKind(source, kind);
for (const [kind, calls] of Object.entries(KILL_CALLS)) registerKindCallouts(kind, calls);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !state.player.inCutscene && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** Who's in there: the same person every time (where they were put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
export const isWoman = (e: Enemy) => lookOf(seedOf(e)).woman;
const gender = (e: Enemy) => (isWoman(e) ? 'f' : 'm') as 'm' | 'f';
const voice = (e: Enemy, m: string, f: string) => (isWoman(e) ? f : m);

const walkTo = (ctx: FrameContext, e: Enemy, x: number, speed: number, stop = 50) => {
  const d = x - mid(e).x;
  e.facing = (d < 0 ? -1 : 1);
  if (Math.abs(d) < stop || !safeAhead(ctx, e, e.facing, 12)) { e.vel.x = 0; return; }
  e.vel.x = e.facing * speed;
};
const backOff = (ctx: FrameContext, e: Enemy, x: number, speed: number) => {
  const away = (x < mid(e).x ? 1 : -1);
  e.facing = -away as 1 | -1;
  e.vel.x = safeAhead(ctx, e, away, 12) ? away * speed : 0;
};
/** Keep `near`..`far` from him (closing in, backing off), facing him. */
const keepAt = (ctx: FrameContext, e: Enemy, near: number, far: number, speed: number) => {
  const pm = mid(ctx.state.player), dx = Math.abs(pm.x - mid(e).x);
  if (dx > far) walkTo(ctx, e, pm.x, speed, far - 20);
  else if (dx < near) backOff(ctx, e, pm.x, speed * 0.8);
  else e.vel.x = 0;
  e.facing = dirTo(e, pm.x);
};
/** A hit in front of it, or all round it (`round`). */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4, round = false) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = round ? e.pos.x - reach : e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
  const w = round ? e.width + reach * 2 : reach;
  if (p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

/** A bark over its head (rare, one at a time; never over anybody else's words; never a line said in the last 45 s:
 *  nothing fresh, nothing said). */
export const bark = (state: GameState, e: Enemy, vo: string, pool: ByPants | string[], chance = 0.4, force = false) => {
  const k = itchyOf(state);
  if (!force && (state.frame - k.barkAt < 240 || Math.random() > chance)) return;
  const line = pickFreshLine(Array.isArray(pool) ? pool : byPants(state, pool));
  if (!line) return;
  k.barkAt = state.frame;
  speak(vo, line, s => { if (s) k.barks.set(e, s); else k.barks.delete(e); }, false);
};
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};

// ---------------------------------------------------------------------------------------------------------------
// Punchy, the cat

type Leaper = Enemy & { tx?: number };
const punchy = (ctx: FrameContext, e: Leaper) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e);
  tick(e);
  const vo = voice(e, CAST_VOICES.punchy, CAST_VOICES.punchyf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 580, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, PUNCHY_BARK, 0.6); }
      return false;
    case 'near': {
      const dx = Math.abs(pm.x - m.x);
      if (dx < 74 && level(state, e)) { setState(e, 'slamWind'); e.vel.x = 0; return false; }
      // (a brute: straight at him; off a way, now and then, the leap)
      if (e.aiTimer! > 90 && dx > 150 && dx < 340 && level(state, e, 90) && e.vel.y === 0) { setState(e, 'crouch'); e.vel.x = 0; playSound('whoosh', 0.25, -8); return false; }
      walkTo(ctx, e, pm.x, 1.7, 60);
      return false;
    }
    case 'slamWind':
      // (the mallet hauled up over his head: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 24) {
        if (strike(ctx, e, 60, 12, 'm2:ct_punchy', 7, -5)) { playSound('bonk', 0.9, -4); bonkStars(state, pm.x, state.player.pos.y + 6); }
        playSound('thud', 0.6, -6); setState(e, 'slam');
        bark(state, e, vo, PUNCHY_BARK, 0.15);
      }
      return false;
    case 'slam':
      // (the mallet down on the floor in front of him: a beat to get it back up)
      e.vel.x = 0;
      if (e.aiTimer! > 30) setState(e, 'near');
      return false;
    case 'crouch':
      // (crouched, the mallet cocked back: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 28) {
        setState(e, 'leap'); e.tx = pm.x;
        e.vel.y = -10.5; e.vel.x = Math.max(-5, Math.min(5, (pm.x - m.x) / 34));
        playSound('jump', 0.6, -6); bark(state, e, vo, PUNCHY_BARK, 0.3);
      }
      return false;
    case 'leap':
      // (up and over at him, the mallet over his head, down onto where he was)
      e.facing = e.vel.x < 0 ? -1 : e.vel.x > 0 ? 1 : e.facing;
      if (e.aiTimer! > 6 && e.vel.y === 0) {
        setState(e, 'stuck'); e.vel.x = 0;
        playSound('slam', 0.8, -6); playSound('bonk', 0.5, -12);
        if (strike(ctx, e, 34, 13, 'm2:ct_punchy', 8, -6, true)) bonkStars(state, pm.x, state.player.pos.y + 6);
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: m.x + e.facing! * 30 + (Math.random() - 0.5) * 30, y: e.pos.y + e.height - 2 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 24, color: '#E7D3A8', size: 4 });
        return false;
      }
      if (e.aiTimer! > 90) setState(e, 'near');
      return false;
    case 'stuck':
      // (the mallet's stuck in the floor; tugging at it: his window)
      e.vel.x = 0;
      if (e.aiTimer! % 14 === 0) playSound('click', 0.3, -4);
      if (e.aiTimer! > 56) { setState(e, 'near'); playSound('crack', 0.4, 6); }
      return false;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Kicky, the mouse (the cleaver, or the dynamite)

/** Kicky's close one: up on one foot, then the kick. */
const kick = (ctx: FrameContext, e: Enemy, st: string) => {
  const { state } = ctx, pm = mid(state.player);
  if (st === 'kickWind') {
    e.vel.x = 0; e.facing = dirTo(e, pm.x);
    if (e.aiTimer! > 18) { if (strike(ctx, e, 48, 11, 'm2:ct_kicky', 11, -7)) playSound('punch', 0.9, -2); playSound('whoosh', 0.5, 6); setState(e, 'kick'); }
    return true;
  }
  if (st === 'kick') { e.vel.x = 0; if (e.aiTimer! > 26) setState(e, 'near'); return true; }
  return false;
};
const kicky = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e);
  tick(e);
  const vo = voice(e, CAST_VOICES.kicky, CAST_VOICES.kickyf);
  if (kick(ctx, e, e.aiState ?? '')) return false;
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 580, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, KICKY_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - m.x) < 62 && level(state, e)) { setState(e, 'kickWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 150, 320, 2);
      if (e.aiTimer! > 80 && Math.abs(pm.y - m.y) < 140) { setState(e, 'throwWind'); e.vel.x = 0; }
      break;
    case 'throwWind':
      // (the cleaver drawn back past his ear, a glint off it: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 6) playSound('clink', 0.5, 14);
      if (e.aiTimer! > 28) {
        throwIt(state, e, { kind: 'cleaver', x: m.x + e.facing! * 16, y: e.pos.y + 26, vx: e.facing! * 8.2, vy: Math.max(-3.5, Math.min(1.5, (pm.y - (e.pos.y + 26)) / 30)) - 1 });
        playSound('whoosh', 0.6, 8); bark(state, e, vo, KICKY_BARK, 0.2);
        setState(e, 'empty');
      }
      break;
    case 'empty':
      // (empty-handed: another cleaver out of the pouch)
      e.vel.x = 0;
      if (e.aiTimer! === 30) playSound('clink', 0.3, 4);
      if (e.aiTimer! > 40) setState(e, 'near');
      break;
  }
  return false;
};
const kickyboom = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e);
  tick(e);
  const vo = voice(e, CAST_VOICES.kicky, CAST_VOICES.kickyf);
  if (kick(ctx, e, e.aiState ?? '')) return false;
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 620, 300) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, BOOM_BARK, 0.5); }
      break;
    case 'near': {
      if (Math.abs(pm.x - m.x) < 62 && level(state, e)) { setState(e, 'kickWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 200, 360, 1.6);
      const live = itchyOf(state).throws.filter(s => s.kind === 'dynamite' && s.from === e).length;
      if (e.aiTimer! > 100 && live === 0 && Math.abs(pm.y - m.y) < 220) { setState(e, 'light'); e.vel.x = 0; }
      break;
    }
    case 'light':
      // (the match struck on his buck teeth, the stick lit, the fuse fizzing in his hand: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 8) playSound('ignite', 0.5, 10);
      if (e.aiTimer! > 10 && e.aiTimer! % 6 === 0) playSound('click', 0.2, 22);
      if (e.aiTimer! > 34) {
        const t = 34, g = 0.35, hx = m.x + e.facing! * 14, hy = e.pos.y + 18;
        const tx = pm.x + state.player.vel.x * t * 0.3, ty = state.player.pos.y + state.player.height - 6;
        throwIt(state, e, { kind: 'dynamite', x: hx, y: hy, vx: Math.max(-9, Math.min(9, (tx - hx) / t)), vy: (ty - hy - 0.5 * g * t * t) / t, fuse: 84 });
        playSound('whoosh', 0.5, 4); bark(state, e, vo, BOOM_BARK, 0.35);
        setState(e, 'after');
      }
      break;
    case 'after':
      // (fingers in his ears)
      e.vel.x = 0;
      if (e.aiTimer! > 60) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The host

const host = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e), me = e as { cueAt?: number };
  tick(e);
  const vo = voice(e, CAST_VOICES.host, CAST_VOICES.hostf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 640, 340) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, HOST_BARK, 0.7); }
      break;
    case 'near':
      if (Math.abs(pm.x - m.x) < 64 && level(state, e)) { setState(e, 'caneWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 220, 400, 1.4);
      if (e.aiTimer! > 80 && state.frame - (me.cueAt ?? -9999) > 300 && Math.abs(pm.x - m.x) < 560) { setState(e, 'cue'); e.vel.x = 0; bark(state, e, vo, HOST_CUE, 1, true); }
      break;
    case 'cue':
      // (the bullhorn up, the other arm flung up at the sky: the tell; then the anvil's shadow is on him)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 8 === 0) playSound('rumble', 0.2, 18);
      if (e.aiTimer! > 30) { if (callAnvil(state)) me.cueAt = state.frame; setState(e, 'after'); }
      break;
    case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > 50) setState(e, 'near');
      break;
    case 'caneWind':
      // (the cane raised: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 18) { if (strike(ctx, e, 54, 10, 'm2:ct_host', 8, -5)) playSound('punch', 0.8, 4); playSound('whoosh', 0.45, 8); setState(e, 'cane'); }
      break;
    case 'cane':
      if (e.aiTimer! > 26) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The stagehand

const stagehand = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player), m = mid(e);
  tick(e);
  const vo = voice(e, CAST_VOICES.stagehand, CAST_VOICES.stagehandf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, STAGEHAND_BARK, 0.6); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - m.x);
      if (dx < 64 && level(state, e)) { setState(e, 'bagWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 160, 330, 1.5);
      if (e.aiTimer! > 90 && dx < 420 && !holesFull(state) && level(state, e, 40)) { setState(e, 'hole'); e.vel.x = 0; }
      break;
    }
    case 'hole':
      // (a folded portable hole held up, wiggled: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 2) playSound('whoosh', 0.2, 18);
      if (e.aiTimer! > 26) {
        // (flung down onto the floor between them, short of him: he walks into it or round it)
        const land = pm.x - e.facing! * 70, t = 26, g = 0.35, hx = m.x + e.facing! * 14, hy = e.pos.y + 30, ty = e.pos.y + e.height;
        throwIt(state, e, { kind: 'hole', x: hx, y: hy, vx: (land - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t });
        playSound('whoosh', 0.45, 2); bark(state, e, vo, STAGEHAND_BARK, 0.3);
        setState(e, 'after');
      }
      break;
    case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > 40) setState(e, 'near');
      break;
    case 'bagWind':
      // (a sandbag hoisted over the shoulder: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 20) { if (strike(ctx, e, 52, 11, 'm2:ct_stagehand', 9, -5)) playSound('thud', 0.9, -4); playSound('whoosh', 0.5, -2); setState(e, 'bag'); }
      break;
    case 'bag':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

/** Out of aggro range: this far off, anybody after him gives up and goes back to standing about. */
const LEASH_X = 840, LEASH_Y = 460;
const leashed = <E extends Enemy>(ai: (ctx: FrameContext, e: E) => boolean) => (ctx: FrameContext, e: Enemy) => {
  // (never mid-move: Punchy up in the air finishes his leap)
  if (e.aiState && e.aiState !== 'idle' && e.aiState !== 'leap') {
    const p = mid(ctx.state.player), m = mid(e);
    if (Math.abs(p.x - m.x) > LEASH_X || Math.abs(p.y - m.y) > LEASH_Y) { setState(e, 'idle'); e.vel.x = 0; }
  }
  return ai(ctx, e as E);
};
type Reg = Parameters<typeof registerM2Kind>[0];
const person = (kind: `m2:ct_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -70, r: 14 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:ct_punchy', { w: 40, h: 84, hp: 125, contact: 4, mass: 210 }, punchy, drawPunchy, { head: { x: 2, y: -74, r: 16 }, pathing: false });
person('m2:ct_kicky', { w: 34, h: 74, hp: 90, contact: 4, mass: 150 }, kicky, (c, e, f, s) => drawKicky(c, e, f, s, false), { pointy: { source: 'm2:ct_cleaver', label: 'CLEAVED!', damage: 12 } });
person('m2:ct_kickyboom', { w: 34, h: 74, hp: 90, contact: 4, mass: 150 }, kickyboom, (c, e, f, s) => drawKicky(c, e, f, s, true));
person('m2:ct_host', { w: 36, h: 80, hp: 115, contact: 4, mass: 180 }, host, drawHost, { head: { x: 1, y: -66, r: 10 } });
person('m2:ct_stagehand', { w: 36, h: 74, hp: 100, contact: 4, mass: 180 }, stagehand, drawStagehand, { head: { x: 1, y: -66, r: 10 } });
