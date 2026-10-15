// The boulevard's hustlers (Meathead 2's own kinds, registered when Hollywood Land's loaded): costumed impersonators,
// legally distinct, each after a photo and twenty bucks. Every one of them hustles the same way, on top of its own
// trick:
//
//   THE HUSTLE  sees him, comes at him (a bark now and then: clean, shat or naked); right up close, the tell (the
//               camera up, the hand out, the grin) and then the PHOTO: a flash, he's dazzled a moment, and they've
//               lifted some ammo off him (whatever he's got the most of) and leg it, laughing. Kill one carrying it
//               and it's dropped back. Respond with violence: hit them out of the tell and nothing's lost.
//
//   marilyn   a Marilyn-ish blonde in the white halter dress (always a woman; any skin, any build): at mid range she
//             plants herself over an imaginary grate, holds her skirt (the tell), and the dress blows up: a gust that
//             hurts and shoves him back.
//   elvis     an Elvis-ish King in the white rhinestone jumpsuit (always a man): the hip shake (the tell), then a karate
//             kick lunge across the pavement.
//   hero      a caped superhero knock-off in a muscle suit (men and women): keeps its distance, strikes the pose (the
//             tell) and throws its foam shield (it comes back).
//   pirate    a pirate-captain knock-off, drunk (men and women): staggers about; close, winds up (the tell) and slashes
//             with the cutlass. The cutlass is out in front: charging into it hurts (pointy).
//   statue    a gold-painted living statue (men and women): stands stock still on its box, looks like part of the
//             street, till he's close; then it's on him. Heavy.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { WeaponType } from '../../../m1/types';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { maxAmmo } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, meatheadSays } from '../section';
import { outOf } from './state';
import { throwShield } from './shots';
import { HURT, HUSTLER_VOICES, MARILYN_HUSTLE, ELVIS_HUSTLE, HERO_HUSTLE, PIRATE_HUSTLE, STATUE_HUSTLE, THIEF_GLOAT, PICKPOCKETED, type ByPants } from './lines';
import { drawMarilyn, drawElvis, drawHero, drawPirate, drawStatue } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

export const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
export const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
export const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
/** Who's in the costume: the same person every time (the seed's where they were put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
export const womanOf = (e: Enemy) => lookOf(seedOf(e)).woman;
export const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
export const byPants = <T extends ByPants>(state: GameState, r: T) => (isNude(state) ? r.nude : isShat(state) ? r.shitty : r.clean);

/** Somebody's bark over their head (rare; never on top of another, or the PA): in their own voice. */
export const bark = (state: GameState, e: Enemy, voice: string, pool: string[], chance = 0.4) => {
  const o = outOf(state);
  if (o.pa || o.paBusy || state.frame - o.barkAt < 220 || Math.random() > chance) return;
  o.barkAt = state.frame;
  speak(voice, pickLine(pool), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
};

// ---------------------------------------------------------------------------------------------------------------
// The hustle: the photo, the pickpocket, the getaway

/** What he's got the most of, to lift some of (none: nothing worth taking). */
const richest = (state: GameState): WeaponType | null => {
  const p = state.player;
  let best: WeaponType | null = null, bk = 0;
  for (const w of p.availableWeapons) {
    const m = maxAmmo(w), n = p.weaponAmmo[w] ?? 0;
    if (!Number.isFinite(m) || m <= 0 || n <= 0) continue;
    const k = n / m + (w === p.currentWeapon ? 0.25 : 0);
    if (k > bk) { bk = k; best = w; }
  }
  return best;
};
const snap = (ctx: FrameContext, e: Enemy, voice: string) => {
  const { state, fx } = ctx, p = state.player, o = outOf(state), m = mid(e);
  o.flashes.push({ x: m.x + e.facing! * 14, y: e.pos.y + 10, at: state.frame });
  playSound('click', 0.9, 6); playSound('click', 0.6, 12);
  state.playerStunTimer = Math.max(state.playerStunTimer, 32);
  const w = richest(state);
  if (w) {
    const have = p.weaponAmmo[w], n = Math.min(have, Math.max(1, Math.round(maxAmmo(w) * 0.15)));
    p.weaponAmmo[w] = have - n;
    const was = o.loot.get(e);
    o.loot.set(e, { w, n: (was?.n ?? 0) + n });
    if (!o.thieves.includes(e)) o.thieves.push(e);
    fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 30 }, 'PICKPOCKETED!', true, '#FDE047');
    if (Math.random() < 0.55 && !o.said.robbedRecently) { o.said.robbedRecently = true; meatheadSays(state, pickLine(PICKPOCKETED), false); setTimeout(() => { o.said.robbedRecently = false; }, 9000); }
    else bark(state, e, voice, byPants(state, THIEF_GLOAT), 0.9);
  } else fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 30 }, '-$20', true, '#86EFAC');
  setState(e, 'flee');
  e.facing = (-dirTo(e, mid(p).x)) as 1 | -1;
};

interface Hustler {
  speed: number;
  voice: (e: Enemy) => string;
  pool: ByPants;
  /** Its own trick: given how far off he is, start it (return true) or not. Its own states run in `own`. */
  attack?: (ctx: FrameContext, e: Enemy, dx: number, dy: number) => boolean;
  own?: (ctx: FrameContext, e: Enemy) => void;
}
/** The hustle (the states every hustler shares), and its own trick on top. */
const hustler = (h: Hustler) => (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  switch (e.aiState) {
    default: {
      // (strolling about their patch of sidewalk)
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 50 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.5;
      if (e.aiTimer > 20 && sees(state, e, 440, 130)) { setState(e, 'approach'); bark(state, e, h.voice(e), byPants(state, h.pool)); }
      break;
    }
    case 'approach': {
      e.facing = dirTo(e, p.x);
      const close = Math.abs(dx) < 46 && Math.abs(dy) < 60;
      if (close && !holdingOff(state) && !pl.inCutscene) { setState(e, 'pose'); e.vel.x = 0; break; }
      if (!holdingOff(state) && (e.leapCd ?? 0) <= 0 && h.attack?.(ctx, e, dx, dy)) break;
      e.vel.x = Math.abs(dx) > 40 && safeAhead(ctx, e, e.facing) ? e.facing * h.speed : 0;
      if (!sees(state, e, 700, 260)) setState(e, 'idle');
      break;
    }
    case 'pose':
      // (the tell: the camera up, the grin)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 26) {
        if (Math.abs(dx) < 64 && Math.abs(dy) < 60 && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.carried && !pl.inCutscene) snap(ctx, e, h.voice(e));
        else setState(e, 'approach');
      }
      break;
    case 'flee':
      // (legging it with his stuff; back for more after a while)
      e.vel.x = safeAhead(ctx, e, e.facing!) ? e.facing! * h.speed * 1.9 : 0;
      if (e.aiTimer > 150) { setState(e, 'approach'); e.leapCd = 40; }
      break;
    case 'idle':
      setState(e, 'stroll');
      break;
  }
  h.own?.(ctx, e);
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Their tricks

const MARILYN_REACH = 150;
const marilynAttack = (_ctx: FrameContext, e: Enemy, dx: number, dy: number) => {
  if (Math.abs(dx) > 60 && Math.abs(dx) < 140 && Math.abs(dy) < 70) { setState(e, 'billow'); e.vel.x = 0; playSound('whoosh', 0.25, -8); return true; }
  return false;
};
const marilynOwn = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  if (e.aiState === 'billow') {
    e.vel.x = 0;
    if (e.aiTimer > 30) { setState(e, 'gust'); playSound('whoosh', 0.9, -2); }
  } else if (e.aiState === 'gust') {
    e.vel.x = 0;
    // (the dress up round her ears, a gale out of it: him shoved back, hurt the once)
    if (Math.abs(dx) < MARILYN_REACH && Math.abs(p.y - m.y) < 80 && pl.health > 0 && !pl.carried) {
      pl.vel.x += Math.sign(dx || 1) * 0.9;
      if (pl.invincibilityTimer <= 0 && e.aiTimer === 4) hurtPlayer(ctx, 9, 'm2:hw_marilyn_gust', { x: Math.sign(dx || 1) * 9, y: -5 }, 22);
    }
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * 30, y: e.pos.y + e.height - 10 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 3 }, life: 18, color: '#F8FAFC', size: 2 });
    if (e.aiTimer > 26) { setState(e, 'approach'); e.leapCd = 100; }
  }
};

const elvisAttack = (_ctx: FrameContext, e: Enemy, dx: number, dy: number) => {
  if (Math.abs(dx) > 80 && Math.abs(dx) < 230 && Math.abs(dy) < 60) { setState(e, 'shake'); e.vel.x = 0; return true; }
  return false;
};
const elvisOwn = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  if (e.aiState === 'shake') {
    e.vel.x = 0; e.facing = dirTo(e, p.x);
    if (e.aiTimer % 8 === 1) playSound('boing', 0.2, 6);
    if (e.aiTimer > 32) { setState(e, 'kick'); playSound('whoosh', 0.7, 4); }
  } else if (e.aiState === 'kick') {
    const ok = safeAhead(ctx, e, e.facing!, 30);
    e.vel.x = ok ? e.facing! * 7.5 : 0;
    if (Math.abs(p.x - m.x) < 40 && Math.abs(p.y - m.y) < 60 && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.carried)
      hurtPlayer(ctx, 13, 'm2:hw_elvis', { x: e.facing! * 8, y: -6 }, 20);
    if (!ok || e.aiTimer > 22) { setState(e, 'recover'); }
  } else if (e.aiState === 'recover') {
    e.vel.x *= 0.85;
    if (e.aiTimer > 34) { setState(e, 'approach'); e.leapCd = 80; }
  }
};

const heroAttack = (ctx: FrameContext, e: Enemy, dx: number, dy: number) => {
  const out = outOf(ctx.state).shots.some(s => s.from === e);
  if (!out && Math.abs(dx) > 120 && Math.abs(dx) < 420 && Math.abs(dy) < 110) { setState(e, 'aim'); e.vel.x = 0; return true; }
  // (keeps its distance from him till it's thrown: no closer than a throw)
  if (out && Math.abs(dx) < 260) { e.vel.x = 0; return true; }
  return false;
};
const heroOwn = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player);
  if (e.aiState === 'aim') {
    e.vel.x = 0; e.facing = dirTo(e, p.x);
    if (e.aiTimer > 24) { throwShield(state, e, e.facing); setState(e, 'thrown'); }
  } else if (e.aiState === 'thrown') {
    e.vel.x = 0;
    if (e.aiTimer > 40) { setState(e, 'approach'); e.leapCd = 70; }
  }
};

const pirateAttack = (_ctx: FrameContext, e: Enemy, dx: number, dy: number) => {
  if (Math.abs(dx) < 96 && Math.abs(dy) < 60) { setState(e, 'wind'); e.vel.x = 0; return true; }
  return false;
};
const pirateOwn = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  // (drunk: the walk wanders)
  if (e.aiState === 'approach' || e.aiState === 'stroll' || e.aiState === undefined) e.vel.x *= 0.6 + 0.6 * Math.abs(Math.sin((state.frame + seedOf(e)) * 0.05));
  if (e.aiState === 'wind') {
    e.vel.x = 0; e.facing = dirTo(e, p.x);
    if (e.aiTimer > 24) { setState(e, 'slash'); playSound('whoosh', 0.6, 8); }
  } else if (e.aiState === 'slash') {
    e.vel.x = 0;
    if (e.aiTimer === 3 && (p.x - m.x) * e.facing! > -10 && Math.abs(p.x - m.x) < 100 && Math.abs(p.y - m.y) < 60 && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.carried)
      hurtPlayer(ctx, 12, 'm2:hw_pirate', { x: e.facing! * 7, y: -5 }, 18);
    if (e.aiTimer > 26) { setState(e, 'approach'); e.leapCd = 60; }
  }
};

/** The statue: stock still till he's close (it's on its box: part of the street), then it's a hustler like the rest. */
const statueAI = (() => {
  const h = hustler({ speed: 1.0, voice: e => womanOf(e) ? HUSTLER_VOICES.statuef : HUSTLER_VOICES.statue, pool: STATUE_HUSTLE });
  return (ctx: FrameContext, e: Enemy) => {
    const { state } = ctx, p = mid(state.player), m = mid(e);
    if (!e.aiState || e.aiState === 'still') {
      e.aiState = 'still'; e.vel.x = 0; tick(e);
      if (sees(state, e, 120, 90) || (e.hitFlash ?? 0) > 0) { e.facing = dirTo(e, p.x); setState(e, 'pose'); bark(state, e, womanOf(e) ? HUSTLER_VOICES.statuef : HUSTLER_VOICES.statue, byPants(state, STATUE_HUSTLE), 0.8); }
      void m;
      return false;
    }
    return h(ctx, e);
  };
})();

// ---------------------------------------------------------------------------------------------------------------

const gendered = (m: string, f: string) => (e: Enemy) => (womanOf(e) ? f : m);
const personGender = (e: Enemy) => (womanOf(e) ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({
  kind: 'm2:hw_marilyn', stats: { w: 36, h: 72, hp: 90, contact: 5, mass: 150 }, humanoid: true, gender: 'f', head: { x: 1, y: -66, r: 10 },
  ai: hustler({ speed: 1.3, voice: () => HUSTLER_VOICES.marilyn, pool: MARILYN_HUSTLE, attack: marilynAttack, own: marilynOwn }),
  draw: (c, e, f) => drawMarilyn(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hw_elvis', stats: { w: 40, h: 76, hp: 140, contact: 6, mass: 210 }, humanoid: true, gender: 'm', head: { x: 1, y: -70, r: 10 },
  ai: hustler({ speed: 1.4, voice: () => HUSTLER_VOICES.elvis, pool: ELVIS_HUSTLE, attack: elvisAttack, own: elvisOwn }),
  draw: (c, e, f) => drawElvis(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hw_hero', stats: { w: 40, h: 74, hp: 120, contact: 6, mass: 200 }, humanoid: true, gender: personGender, head: { x: 1, y: -68, r: 10 },
  ai: hustler({ speed: 1.2, voice: gendered(HUSTLER_VOICES.hero, HUSTLER_VOICES.herof), pool: HERO_HUSTLE, attack: heroAttack, own: heroOwn }),
  draw: (c, e, f) => drawHero(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hw_pirate', stats: { w: 40, h: 74, hp: 160, contact: 6, mass: 200 }, humanoid: true, gender: personGender, head: { x: 1, y: -68, r: 10 },
  pointy: { source: 'm2:hw_pirate_cutlass', label: 'SKEWERED!', damage: 13 },
  ai: hustler({ speed: 1.0, voice: gendered(HUSTLER_VOICES.pirate, HUSTLER_VOICES.piratef), pool: PIRATE_HUSTLE, attack: pirateAttack, own: pirateOwn }),
  draw: (c, e, f) => drawPirate(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:hw_statue', stats: { w: 42, h: 78, hp: 140, contact: 5, mass: 260 }, humanoid: true, gender: personGender, head: { x: 1, y: -72, r: 10 },
  ai: statueAI,
  draw: (c, e, f) => drawStatue(c, e, f, seedOf(e)),
});
