// Sawdust Gulch's townsfolk (Meathead 2's own kinds, registered when Wilderness Land is loaded): the park's staff in
// costume, playing the town (men and women, every skin, build and hair, seeded per enemy), who break character to yell
// at him. A run of them through the town and the mines, each with its tell before it hits:
//
//   deputy      keeps his distance, draws (the tell) and fires; pistol whips up close
//   sheriff     the showdown's: DRAW! (a long tell, the callout over him), then fans the hammer (three shots)
//   snakeoil    up on his wagon: a tonic bottle up over his head (the tell), lobbed: it bursts into a cloud of fumes that
//               hangs and chokes anybody in it; up close he smashes one on him
//   barber      the quartet: they wait in a row and sing as he comes (SHAVE AND A HAIRCUT...: the tell), then come at
//               him with straight razors (TWO BITS!: the slash)
//   bouncer     huge: arms out (the tell), grabs him and throws him the length of the room
//   dancer      the can-can: the leg up (the tell), the kick; at range, a whiskey bottle lobbed
//   patron      the saloon's drinkers (gamblers, cowpokes): calm at their cards and drinks till the brawl, then at
//               anybody: punches, a chair broken over a back (some carry one), bottles thrown (the saloon's AI, below)
//   undertaker  walks up and MEASURES him (the tape out: the tell, the callout), then the spade
//   blacksmith  a red-hot horseshoe lobbed from his tongs; the hammer up close (a big knock)
//   farmhand    the pitchfork drawn back (the tell), the jab; the tines out front are pointy (no charging into them)
//   feller      next to a prop pine: chops it (TIMBER!) and it comes down the way it leans, on whoever's there; after,
//               hatchets lobbed, the axe up close
//   birler      a lumberjack on his own log on the mill pond: rolls it at Meathead's log and rams it (logs.ts)
//   miner       the pickaxe up (the tell), the swing; the lit candle on his hard hat: dive kicking onto it hurts (spiky)
//   prospector  keeps back; lights a stick of dynamite (the fuse sparking: the tell) and lobs it; a gold pan up close
//   crate       a TNT crate (a fixture): done in by anything, it goes up (blast.ts)
//
// The small stuff of the special deaths (headshots, flings, the bodies) plays out on their drawings (kindArt.ts).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { pushEnemy } from '../../../m1/game/combat/knockback';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { exemptFromZones, hazardKill } from '../../hazardHit';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { townOf } from './state';
import { lob } from './throws';
import {
  HURT, TOWN_VOICES, DEPUTY_BARK, SHERIFF_DRAW, SALESMAN_BARK, QUARTET_SING, QUARTET_HIT, BOUNCER_BARK, DANCER_BARK,
  UNDERTAKER_MEASURE, SMITH_BARK, FARMHAND_BARK, FELLER_TIMBER, FELLER_BARK, BIRLER_BARK, MINER_BARK, PROSPECTOR_BARK,
  PATRON_BARK,
} from './lines';
import {
  drawDeputy, drawSheriff, drawSalesman, drawBarber, drawBouncer, drawDancer, drawUndertaker, drawSmith, drawFarmhand,
  drawFeller, drawBirler, drawMiner, drawProspector, drawCrate, drawPatron,
} from './kindArt';
import './duelDeath';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !state.player.inCutscene && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** Who's in there: the same person every time (where they were put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const woman = (e: Enemy) => lookOf(seedOf(e)).woman;
const gender = (e: Enemy) => (woman(e) ? 'f' : 'm') as 'm' | 'f';

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
/** A hit in front of it: the damage, its source, a knock. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
  if (p.pos.x < x + reach && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;
const feetOf = (state: GameState) => state.player.pos.y + state.player.height;

/** A bark over its head (rare, one at a time, never over the announcer). */
export const bark = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.4, force = false) => {
  const tw = townOf(state);
  if (!force && (tw.pa || state.frame - tw.barkAt < 220 || Math.random() > chance)) return;
  tw.barkAt = state.frame;
  speak(voice, pickLine(byPants(state, pool)), s => { if (s) tw.barks.set(e, s); else tw.barks.delete(e); }, false);
};
const townVoice = (e: Enemy) => (woman(e) ? TOWN_VOICES.woman : TOWN_VOICES.man);
/** Whoever's voice it is (a townsman's or a townswoman's; the sheriffs their own). */
export const voiceOf = (e: Enemy) => (e.kind === 'm2:fr_sheriff' ? (woman(e) ? TOWN_VOICES.sherifff : TOWN_VOICES.sheriff) : townVoice(e));
/** Its first sight of him: a bark, maybe. */
const spotted = (state: GameState, e: Enemy, voice: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, voice, pool, chance);
};

/** A slug from a gun (the engine's projectile: its source is `<kind>_shot`). */
const fire = (state: GameState, e: Enemy, dmg = 8, spread = 0) => {
  const p = state.player, m = mid(e);
  const hx = m.x + e.facing! * 24, hy = e.pos.y + 28;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height * 0.45 + spread;
  const d = Math.hypot(tx - hx, ty - hy) || 1, sp = 8.5;
  state.projectiles.push({ id: `fr-town-${state.frame}-${Math.random()}`, pos: { x: hx - 5, y: hy - 3 }, vel: { x: ((tx - hx) / d) * sp, y: ((ty - hy) / d) * sp }, width: 10, height: 6, health: 1, maxHealth: 1, type: 'projectile', damage: dmg, owner: 'enemy', shooterKind: e.kind, shot: 'slug' });
  playSound('gun', 0.7, e.kind === 'm2:fr_sheriff' ? -10 : -4);
  for (let n = 0; n < 5; n++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: e.facing! * (1 + Math.random() * 3), y: (Math.random() - 0.5) * 2 }, life: 10, color: n % 2 ? '#FDE047' : '#E7E5E4', size: 2 });
};

// ---------------------------------------------------------------------------------------------------------------
// The deputy

const deputy = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 500, 160) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, townVoice(e), DEPUTY_BARK); }
      break;
    case 'near':
      if (!sees(state, e, 600, 200)) { setState(e, 'idle'); break; }
      if (Math.abs(pm.x - mid(e).x) < 56 && level(state, e)) { setState(e, 'whipWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 150, 320, 1.4);
      if (e.aiTimer! > 70) { setState(e, 'aim'); e.vel.x = 0; }
      break;
    case 'aim':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) { fire(state, e); setState(e, 'fire'); }
      break;
    case 'fire':
      if (e.aiTimer! > 14) setState(e, 'near');
      break;
    case 'whipWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { playSound('whoosh', 0.6, 4); strike(ctx, e, 44, 9, 'm2:fr_deputy', 6); setState(e, 'whip'); }
      break;
    case 'whip':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The sheriff

const sheriff = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = woman(e) ? TOWN_VOICES.sherifff : TOWN_VOICES.sheriff;
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 760, 220) && e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 60 && level(state, e)) { setState(e, 'whipWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 200, 380, 1.5);
      if (e.aiTimer! > 80) { setState(e, 'draw'); e.vel.x = 0; bark(state, e, vo, SHERIFF_DRAW, 0.7); playSound('click', 0.8, -4); }
      break;
    case 'draw':
      // (DRAW!: the hand over the holster, a long beat)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 40) setState(e, 'fan');
      break;
    case 'fan':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 1 || e.aiTimer! === 8 || e.aiTimer! === 15) fire(state, e, 9, (e.aiTimer! - 8) * 2);
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'whipWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 12) { playSound('whoosh', 0.7, 2); strike(ctx, e, 48, 12, 'm2:fr_sheriff', 8); setState(e, 'whip'); }
      break;
    case 'whip':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The snake-oil salesman (up on his wagon)

const snakeoil = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  tick(e);
  e.vel.x = 0;
  const vo = woman(e) ? TOWN_VOICES.salesmanf : TOWN_VOICES.salesman;
  switch (e.aiState) {
    default:
      e.facing = dirTo(e, pm.x);
      if (sees(state, e, 520, 200) && e.aiTimer! > 30) { setState(e, 'near'); spotted(state, e, vo, SALESMAN_BARK, 0.8); }
      break;
    case 'near':
      e.facing = dirTo(e, pm.x);
      if (!sees(state, e, 620, 240)) { setState(e, 'idle'); break; }
      if (Math.abs(pm.x - mid(e).x) < 54 && level(state, e)) { setState(e, 'smashWind'); break; }
      if (e.aiTimer! > 60) setState(e, 'wind');
      break;
    case 'wind':
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) { lob(state, e, 'tonic', pm.x + (Math.random() - 0.5) * 30, feetOf(state), 42); setState(e, 'near'); e.aiTimer = -30; }
      break;
    case 'smashWind':
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) { if (strike(ctx, e, 44, 8, 'm2:fr_snakeoil', 5)) playSound('glass', 0.8, 0); setState(e, 'smash'); }
      break;
    case 'smash':
      if (e.aiTimer! > 26) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The barbershop quartet

const barber = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  if (e.aiState === 'idle') e.aiState = 'quartet';
  switch (e.aiState) {
    case 'quartet':
      // (stood in a row, harmonizing; he's near: the song (one of them sings it for the lot), then at him)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 300, 160)) {
        const tw = townOf(state);
        if (!tw.said.quartet) { tw.said.quartet = true; bark(state, e, TOWN_VOICES.quartet, QUARTET_SING, 1, true); }
        if (e.aiTimer! > 60 + (e.variant ?? 0) * 6) setState(e, 'come');
      } else e.aiTimer = 0;
      break;
    case 'come':
      if (Math.abs(pm.x - mid(e).x) < 52 && level(state, e)) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.6 + (e.variant ?? 0) * 0.08, 46);
      break;
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) {
        const tw = townOf(state);
        if (!tw.said.twobits) { tw.said.twobits = true; bark(state, e, TOWN_VOICES.quartet, QUARTET_HIT, 1, true); }
        playSound('whoosh', 0.6, 10); strike(ctx, e, 40, 9, 'm2:fr_barber', 5); setState(e, 'slash');
      }
      break;
    case 'slash':
      if (e.aiTimer! > 26) setState(e, 'come');
      break;
    default: setState(e, 'come');
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The saloon (the playtest: "as soon as you initiate violence BRAWL pops up on screen and everyone fights everyone.
// last man alive can leave"): its bouncer, can-can dancers and drinkers are calm (harmless, at their cards, their
// drinks, the kick line on the stage) till he starts something (scenes.ts's saloon); then it's everybody at everybody:
// each picks somebody (the nearest, him often enough), goes at them and lays into them: punches, chairs broken over
// backs, bottles thrown, the kick line's kicks, the bouncer throwing people the length of the room (over the bar).
// Whoever hits one, it's after them now, often. What one of them does to another is real: they die of it.

/** The saloon's own (scenes.ts puts them in): calm, then the brawl. */
export const SALOON_FOLK = new WeakSet<Enemy>();
interface Brawler { target?: Enemy | 'him'; pickT?: number; chair?: boolean }
const brawlerOf = (e: Enemy) => e as Enemy & Brawler;
const alive = (e: Enemy) => e.health > 0 && !e.isBlownAway;

/** One of them lays into another: the damage, a knock (or a throw), the kill (its callout); it'll be after them now. */
const hitOther = (ctx: FrameContext, e: Enemy, o: Enemy, dmg: number, call: string, kx: number, ky: number) => {
  const dir = mid(o).x < mid(e).x ? -1 : 1;
  o.health -= dmg; o.hitFlash = 8;
  if (o.health <= 0) { o.seen = true; hazardKill(ctx, o, mid(e).x, call, { fling: { x: dir * Math.max(8, kx), y: Math.min(-9, ky) } }); return; }
  pushEnemy(o, dir * kx, ky, 24);
  ctx.fx.spawnDamageNumber({ x: o.pos.x, y: o.pos.y - 20 }, Math.round(dmg), false);
  playSound('punch', 0.7, -2);
  if (SALOON_FOLK.has(o) && Math.random() < 0.6) { const ob = brawlerOf(o); ob.target = e; ob.pickT = 140; }
};
/** Somebody to go at: the nearest on his level (him, if he's nearer, or a third of the time anyway). */
const pickTarget = (state: GameState, e: Enemy) => {
  const b = brawlerOf(e), p = state.player, m = mid(e);
  const him = p.health > 0 && !p.inCutscene, pm = mid(p);
  let best: Enemy | null = null, bestD = Infinity;
  for (const o of townOf(state).saloon.foes) {
    if (o === e || !alive(o)) continue;
    const om = mid(o), d = Math.abs(om.x - m.x) + Math.abs(om.y - m.y) * 2.5;
    if (d < bestD) { bestD = d; best = o; }
  }
  const himD = Math.abs(pm.x - m.x) + Math.abs(pm.y - m.y) * 2.5;
  b.target = him && (!best || himD < bestD || Math.random() < 0.33) ? 'him' : best ?? undefined;
  b.pickT = 120 + Math.floor(Math.random() * 140);
};

/** The calm before it: harmless, at their drinks and cards; the kick line kicking on the stage. */
const calm = (state: GameState, e: Enemy) => {
  e.harmless = true; e.vel.x = 0;
  const f = state.frame + (e.variant ?? 0) * 13;
  if (e.kind === 'm2:fr_dancer') { e.aiState = f % 40 < 20 ? 'kickWind' : 'kick'; e.facing = f % 160 < 80 ? 1 : -1; }
  else if (e.kind === 'm2:fr_patron') e.aiState = Math.floor(f / 90) % 3 === 0 ? 'drink' : 'calm';
  else e.aiState = 'calm';
  return false;
};

/** The brawl. */
const brawl = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, b = brawlerOf(e), p = state.player;
  e.harmless = false;
  tick(e);
  if (b.chair === undefined) b.chair = e.kind === 'm2:fr_patron' && seedOf(e) % 3 === 0;
  const gone = b.target === 'him' ? p.health <= 0 || p.inCutscene : !b.target || !alive(b.target);
  if (gone || (b.pickT = (b.pickT ?? 0) - 1) <= 0) { pickTarget(state, e); if (Math.random() < 0.2) bark(state, e, townVoice(e), PATRON_BARK, 0.5); }
  const t = b.target;
  if (!t) { e.vel.x = 0; return false; }
  const tm = t === 'him' ? mid(p) : mid(t), tFeet = t === 'him' ? feetOf(state) : t.pos.y + t.height;
  const dx = Math.abs(tm.x - mid(e).x), lvl = Math.abs(tFeet - (e.pos.y + e.height)) < 50;
  const k = e.kind, bouncer = k === 'm2:fr_bouncer', dancer = k === 'm2:fr_dancer';
  const reach = bouncer ? 54 : dancer ? 56 : b.chair ? 60 : 46;
  const WIND = bouncer ? 'grabWind' : dancer ? 'kickWind' : b.chair ? 'chairWind' : 'wind';
  const HIT = bouncer ? 'grab' : dancer ? 'kick' : b.chair ? 'chair' : 'swing';
  const TOSS = dancer ? 'wind' : 'toss';
  switch (e.aiState) {
    case WIND: {
      e.vel.x = 0; e.facing = dirTo(e, tm.x);
      if (e.aiTimer! <= (bouncer ? 26 : b.chair ? 22 : 14)) break;
      const dmg = bouncer ? 44 : dancer ? 22 : b.chair ? 30 : 16;
      if (t === 'him') {
        const src = bouncer ? 'm2:fr_bouncer' : dancer ? 'm2:fr_dancer' : b.chair ? 'm2:fr_chair' : 'm2:fr_patron';
        if (strike(ctx, e, reach, bouncer ? 14 : dancer ? 9 : b.chair ? 12 : 8, src, bouncer ? 13 : 6, bouncer ? -10 : -4) && bouncer) shakeScreen(state, 6, 3);
      } else {
        const fx0 = e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
        if (t.pos.x < fx0 + reach && t.pos.x + t.width > fx0 && t.pos.y < e.pos.y + e.height && t.pos.y + t.height > e.pos.y + 6)
          hitOther(ctx, e, t, dmg, bouncer ? 'THROWN OUT!' : dancer ? 'CAN-CANNED!' : b.chair ? 'CHAIRED!' : 'KNOCKED OUT!', bouncer ? 12 : 7, bouncer ? -11 : -5);
      }
      playSound(b.chair ? 'crunch' : 'whoosh', 0.7, bouncer ? -8 : 4);
      // (a chair goes to pieces over whoever it's broken on)
      if (b.chair) { b.chair = false; for (let n = 0; n < 10; n++) state.particles.push({ pos: { x: mid(e).x + e.facing! * 30, y: e.pos.y + 20 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 30, color: n % 2 ? '#8A5A30' : '#B07A48', size: 3 + Math.random() * 3 }); }
      setState(e, HIT);
      break;
    }
    case HIT: case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > (bouncer ? 40 : 24)) setState(e, 'go');
      break;
    case TOSS:
      e.vel.x = 0; e.facing = dirTo(e, tm.x);
      if (e.aiTimer! > 22) { lob(state, e, 'bottle', tm.x, tFeet - 30, 30); setState(e, 'after'); }
      break;
    default:
      // (going at them; off the balcony (or not level with them, or a long way off), a bottle thrown)
      if (dx < reach && lvl) { setState(e, WIND); e.vel.x = 0; break; }
      if (!bouncer && (e.aiState === 'go' ? e.aiTimer! : 0) > 60 && (!lvl || dx > 260) && Math.random() < 0.03) { setState(e, TOSS); break; }
      if (e.aiState !== 'go') setState(e, 'go');
      walkTo(ctx, e, tm.x, bouncer ? 1.2 : 1.7, reach - 8);
      if (!lvl && e.vel.x === 0 && e.aiTimer! > 90 && !bouncer) setState(e, TOSS);
      break;
  }
  return false;
};

/** The saloon's folk: calm till it starts, then the brawl; anybody else (never, so far): at him, the brawl's way. */
const saloonAI = (ctx: FrameContext, e: Enemy) => {
  const g = townOf(ctx.state).saloon;
  if (SALOON_FOLK.has(e) && g.state === 'wait') return calm(ctx.state, e);
  if (!SALOON_FOLK.has(e)) brawlerOf(e).target = 'him';
  return brawl(ctx, e);
};

// ---------------------------------------------------------------------------------------------------------------
// The bouncer

const bouncer = (ctx: FrameContext, e: Enemy) => {
  if (SALOON_FOLK.has(e)) return saloonAI(ctx, e);
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 700, 200) && e.aiTimer! > 20) { setState(e, 'come'); spotted(state, e, townVoice(e), BOUNCER_BARK, 0.6); }
      break;
    case 'come':
      if (Math.abs(pm.x - mid(e).x) < 62 && level(state, e)) { setState(e, 'grabWind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.1, 56);
      break;
    case 'grabWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 30) {
        if (strike(ctx, e, 50, 14, 'm2:fr_bouncer', 13, -10)) { playSound('slam', 0.9, -6); shakeScreen(state, 6, 3); }
        else playSound('whoosh', 0.8, -8);
        setState(e, 'grab');
      }
      break;
    case 'grab':
      if (e.aiTimer! > 44) setState(e, 'come');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The can-can dancer

const dancer = (ctx: FrameContext, e: Enemy) => {
  if (SALOON_FOLK.has(e)) return saloonAI(ctx, e);
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 700, 220) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, townVoice(e), DANCER_BARK, 0.4); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 60 && level(state, e)) { setState(e, 'kickWind'); e.vel.x = 0; break; }
      if (dx > 150 && e.aiTimer! > 60) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.5, 54);
      break;
    }
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 22) { lob(state, e, 'bottle', pm.x, feetOf(state) - 30, 32); setState(e, 'after'); }
      break;
    case 'kickWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { playSound('whoosh', 0.6, 8); strike(ctx, e, 56, 9, 'm2:fr_dancer', 7, -6); setState(e, 'kick'); }
      break;
    case 'kick': case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > (e.aiState === 'kick' ? 20 : 40)) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The undertaker

const undertaker = (ctx: FrameContext, e: Enemy) => {
  const { state, fx } = ctx, pm = mid(state.player);
  tick(e);
  const vo = woman(e) ? TOWN_VOICES.undertakerf : TOWN_VOICES.undertaker;
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 420, 150) && e.aiTimer! > 20) setState(e, 'come');
      break;
    case 'come': {
      const close = Math.abs(pm.x - mid(e).x) < 70 && level(state, e);
      if (close && !(e as { measured?: boolean }).measured) { setState(e, 'measure'); e.vel.x = 0; bark(state, e, vo, UNDERTAKER_MEASURE, 1, true); break; }
      if (close) { setState(e, 'swingWind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 0.9, 60);
      break;
    }
    case 'measure':
      // (the tape out to him, a long look; then the box's size, over him)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 40) fx.spawnDamageNumber({ x: state.player.pos.x, y: state.player.pos.y - 26 }, '6 FT 1', true, '#FDE047');
      if (e.aiTimer! > 56) { (e as { measured?: boolean }).measured = true; setState(e, 'swingWind'); }
      break;
    case 'swingWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 20) { if (strike(ctx, e, 60, 13, 'm2:fr_undertaker', 8)) playSound('clang', 0.9, -6); else playSound('whoosh', 0.7, -6); setState(e, 'swing'); }
      break;
    case 'swing':
      if (e.aiTimer! > 40) setState(e, 'come');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The blacksmith

const blacksmith = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 480, 180) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, townVoice(e), SMITH_BARK, 0.6); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 68 && level(state, e)) { setState(e, 'hammerWind'); e.vel.x = 0; break; }
      if (dx > 120 && e.aiTimer! > 70) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 0.8, 60);
      break;
    }
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) { lob(state, e, 'horseshoe', pm.x - e.facing! * 20, feetOf(state), 36); setState(e, 'after'); }
      break;
    case 'hammerWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 28) { if (strike(ctx, e, 58, 16, 'm2:fr_blacksmith', 9, -7)) { playSound('clang', 1, -8); shakeScreen(state, 5, 3); } else playSound('whoosh', 0.8, -8); setState(e, 'hammer'); }
      break;
    case 'hammer': case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > (e.aiState === 'hammer' ? 34 : 40)) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The farmhand

const farmhand = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 380, 160) && e.aiTimer! > 20) { setState(e, 'come'); spotted(state, e, townVoice(e), FARMHAND_BARK, 0.5); }
      break;
    case 'come':
      if (Math.abs(pm.x - mid(e).x) < 80 && level(state, e)) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.3, 70);
      break;
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 20) { playSound('whoosh', 0.6, 0); strike(ctx, e, 70, 10, 'm2:fr_farmhand', 6); setState(e, 'jab'); }
      break;
    case 'jab':
      if (e.aiTimer! > 28) setState(e, 'come');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The feller (TIMBER!)

/** Which prop pine a feller drops (town state's pines). */
const PINE_OF = new WeakMap<Enemy, number>();
export const givePine = (e: Enemy, i: number) => { PINE_OF.set(e, i); };

const feller = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const pine = PINE_OF.has(e) ? townOf(state).pines[PINE_OF.get(e)!] : undefined;
  switch (e.aiState) {
    default: {
      e.vel.x = 0;
      if (pine && pine.state === 'up') {
        // (by his tree: he's in its fall (or coming into it), he chops)
        e.facing = pine.dir > 0 ? (pine.x > mid(e).x ? 1 : -1) : (pine.x < mid(e).x ? -1 : 1);
        const a = Math.min(pine.x, pine.x + pine.dir * pine.len), b = Math.max(pine.x, pine.x + pine.dir * pine.len);
        if (state.player.health > 0 && pm.x > a - 140 && pm.x < b + 20 && Math.abs(feetOf(state) - pine.y) < 160) { setState(e, 'chop'); pine.state = 'chop'; pine.t = 0; pine.by = e; }
        break;
      }
      e.facing = dirTo(e, pm.x);
      if (sees(state, e, 460, 180) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, townVoice(e), FELLER_BARK, 0.35); }
      break;
    }
    case 'chop':
      e.vel.x = 0;
      if (e.aiTimer! % 14 === 7) { playSound('thud', 0.7, 6); state.particles.push({ pos: { x: pine ? pine.x : mid(e).x, y: (pine?.y ?? e.pos.y + e.height) - 24 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 }, life: 18, color: '#E8C890', size: 3 }); }
      if (e.aiTimer! === 44) bark(state, e, townVoice(e), FELLER_TIMBER, 1, true);
      if (e.aiTimer! >= 60) { if (pine && pine.state === 'chop') { pine.state = 'fall'; pine.t = 0; playSound('crack', 1, -6); } setState(e, 'near'); e.aiTimer = -30; }
      // (knocked off it: the tree stays up for now)
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 58 && level(state, e)) { setState(e, 'swingWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 120, 280, 1.2);
      if (e.aiTimer! > 60 && sees(state, e, 520, 220)) { setState(e, 'wind'); e.vel.x = 0; }
      break;
    }
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 22) { lob(state, e, 'hatchet', pm.x, feetOf(state) - 34, 30); setState(e, 'after'); }
      break;
    case 'swingWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 18) { playSound('whoosh', 0.8, -2); strike(ctx, e, 54, 12, 'm2:fr_feller', 7); setState(e, 'swing'); }
      break;
    case 'swing': case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > (e.aiState === 'swing' ? 28 : 44)) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The birler: stood on his log (logs.ts drives the log; he keeps to its middle) till he's knocked off it

const birler = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  tick(e);
  if (e.aiState === 'off') return false;
  // (hit hard, flung, grabbed: off his log, into the drink)
  if ((e.pauseTimer ?? 0) > 3 || e.isBlownAway || e.meleeFlung || e.uppercutFlung) { e.aiState = 'off'; return false; }
  const log = townOf(state).logs.find(L => L.birler === e);
  if (!log) { e.aiState = 'off'; return false; }
  e.pos.x = log.x + log.len / 2 - e.width / 2; e.pos.y = log.m.b.y - e.height; e.vel.x = 0; e.vel.y = 0;
  e.facing = dirTo(e, mid(state.player).x);
  if (sees(state, e, 500, 200)) spotted(state, e, townVoice(e), BIRLER_BARK, 0.8);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The miner

const miner = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 380, 140) && e.aiTimer! > 20) { setState(e, 'come'); spotted(state, e, townVoice(e), MINER_BARK, 0.4); }
      break;
    case 'come':
      if (!sees(state, e, 520, 200)) { setState(e, 'idle'); break; }
      if (Math.abs(pm.x - mid(e).x) < 64 && level(state, e)) { setState(e, 'wind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.15, 56);
      break;
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 24) { if (strike(ctx, e, 56, 14, 'm2:fr_miner', 7, -5)) playSound('crunch', 0.8, 0); else playSound('whoosh', 0.7, -4); setState(e, 'swing'); }
      break;
    case 'swing':
      if (e.aiTimer! > 32) setState(e, 'come');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The prospector

const prospector = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = woman(e) ? TOWN_VOICES.prospectorf : TOWN_VOICES.prospector;
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (sees(state, e, 560, 220) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, PROSPECTOR_BARK, 0.8); }
      break;
    case 'near':
      if (!sees(state, e, 680, 260)) { setState(e, 'idle'); break; }
      if (Math.abs(pm.x - mid(e).x) < 54 && level(state, e)) { setState(e, 'whackWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 180, 360, 1.0);
      if (e.aiTimer! > 90) { setState(e, 'light'); e.vel.x = 0; playSound('ignite', 0.5, 6); }
      break;
    case 'light':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 40) { lob(state, e, 'dynamite', pm.x + state.player.vel.x * 20, feetOf(state), 44); setState(e, 'near'); e.aiTimer = -20; }
      break;
    case 'whackWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 42, 8, 'm2:fr_prospector', 6)) playSound('clang', 0.7, 6); setState(e, 'whack'); }
      break;
    case 'whack':
      if (e.aiTimer! > 26) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

const H = { x: 1, y: -68, r: 10 };
const person = (kind: `m2:fr_${string}`, stats: { w: number; h: number; hp: number; contact: number; mass: number }, ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Parameters<typeof registerM2Kind>[0]> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: H, ai, draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:fr_deputy', { w: 38, h: 72, hp: 60, contact: 4, mass: 180 }, deputy, drawDeputy);
person('m2:fr_sheriff', { w: 40, h: 74, hp: 260, contact: 5, mass: 210 }, sheriff, drawSheriff, { head: { x: 1, y: -70, r: 10 } });
person('m2:fr_snakeoil', { w: 38, h: 72, hp: 70, contact: 4, mass: 180 }, snakeoil, drawSalesman, { pathing: false });
person('m2:fr_barber', { w: 36, h: 70, hp: 40, contact: 3, mass: 160 }, barber, drawBarber, { head: { x: 1, y: -66, r: 10 } });
person('m2:fr_bouncer', { w: 50, h: 76, hp: 240, contact: 6, mass: 330 }, bouncer, drawBouncer, { head: { x: 1, y: -70, r: 11 } });
person('m2:fr_dancer', { w: 36, h: 70, hp: 50, contact: 3, mass: 150 }, dancer, drawDancer, { head: { x: 1, y: -66, r: 10 } });
person('m2:fr_patron', { w: 38, h: 72, hp: 60, contact: 3, mass: 180 }, saloonAI, drawPatron);
person('m2:fr_undertaker', { w: 36, h: 80, hp: 120, contact: 4, mass: 170 }, undertaker, drawUndertaker, { head: { x: 1, y: -76, r: 10 } });
person('m2:fr_blacksmith', { w: 44, h: 74, hp: 180, contact: 5, mass: 280 }, blacksmith, drawSmith, { head: { x: 1, y: -70, r: 10 } });
person('m2:fr_farmhand', { w: 38, h: 72, hp: 70, contact: 4, mass: 180 }, farmhand, drawFarmhand, { pointy: { source: 'm2:fr_pitchfork', label: 'FORKED!', damage: 13 } });
person('m2:fr_feller', { w: 40, h: 74, hp: 110, contact: 5, mass: 210 }, feller, drawFeller, { head: { x: 1, y: -70, r: 10 } });
person('m2:fr_birler', { w: 38, h: 72, hp: 70, contact: 4, mass: 190 }, birler, drawBirler, { pathing: false });
// (the birler's out on the water on purpose: the pond's danger zone isn't his)
exemptFromZones('m2:fr_birler', 'fr-town-water');
person('m2:fr_miner', { w: 38, h: 72, hp: 100, contact: 5, mass: 200 }, miner, drawMiner, { spiky: { source: 'm2:fr_hotwax', label: 'HOT WAX!', damage: 12 } });
person('m2:fr_prospector', { w: 38, h: 70, hp: 80, contact: 4, mass: 170 }, prospector, drawProspector, { head: { x: 1, y: -66, r: 10 } });
registerM2Kind({
  kind: 'm2:fr_tntcrate', stats: { w: 34, h: 30, hp: 1, contact: 0, mass: 60 },
  ai: (_ctx, e) => { e.vel.x = 0; return false; },
  make: b => ({ ...b, harmless: true }),
  draw: (c, e) => drawCrate(c, e), robot: true, gender: 'n', grab: 'none', fixture: true, pathing: false,
});
