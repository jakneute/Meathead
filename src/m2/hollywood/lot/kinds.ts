// The backlot's people (Meathead 2's own kinds): the studio tour's staff and the extras still in costume, nothing
// filmed in decades and all of them still here. Teach, then escalate (layout.ts): each alone first, then mixed.
//
//   guide      a tour guide (khaki, lanyard, visor) with a megaphone (the shooter): keeps a few strides off, raises
//              the megaphone (the tell) and blasts him: a slow fat ring of sound that shoves him back.
//   cart       backlot security in a golf cart (the rusher): the light on the roof going (the tell), then flat out at
//              him, overshooting; anybody else in its way gets run down too.
//   legionary  an extra in a cardboard centurion's kit (the bruiser with reach): marches at him; close, draws the
//              spear back (the tell) and thrusts. The spear's out in front: charging into it hurts (pointy).
//   cowboy     an extra in a cowboy's getup (the grabber): swings the lasso overhead (the tell), throws it; caught, he's
//              yanked in and held a moment.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { tick, setState, dirTo, seedOf, womanOf, sees, bark, byPants } from '../blvd/kinds';
import { fireBlast, throwLasso } from '../blvd/shots';
import { HURT, LOT_VOICES, GUIDE_BARK, SECURITY_BARK, EXTRA_BARK } from './lines';
import { drawGuide, drawCart, drawLegionary, drawCowboy } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const v = (e: Enemy, m: string, f: string) => (womanOf(e) ? f : m);

/** Strolling about its patch, till it sees him. */
const stroll = (ctx: FrameContext, e: Enemy, range = 60, speed = 0.6) => {
  const home = e.homeX ?? e.pos.x;
  e.facing ??= -1;
  if (Math.abs(e.pos.x - home) > range || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
  e.vel.x = e.facing * speed;
};

const guide = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      stroll(ctx, e);
      if (e.aiTimer > 20 && sees(state, e, 560, 220)) { setState(e, 'walk'); e.shootTimer = 50 + (seedOf(e) % 40); bark(state, e, v(e, LOT_VOICES.guide, LOT_VOICES.guidef), byPants(state, GUIDE_BARK)); }
      break;
    case 'walk': {
      e.facing = dirTo(e, p.x);
      const want = Math.abs(dx) > 320 ? e.facing : Math.abs(dx) < 160 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.0 : 0;
      e.shootTimer++;
      if (e.shootTimer > 120 && Math.abs(dx) < 440 && Math.abs(p.y - m.y) < 90 && !holdingOff(state)) setState(e, 'raise');
      break;
    }
    case 'raise':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 2) playSound('beep', 0.3, 4);
      if (e.aiTimer > 30) { fireBlast(state, e, e.facing); setState(e, 'blast'); }
      break;
    case 'blast':
      if (e.aiTimer > 26) { e.shootTimer = Math.floor(Math.random() * 30); setState(e, 'walk'); }
      break;
  }
  return false;
};

const cart = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  switch (e.aiState) {
    default:
      stroll(ctx, e, 80, 0.9);
      if (e.aiTimer > 20 && sees(state, e, 560, 110)) { setState(e, 'siren'); bark(state, e, v(e, LOT_VOICES.security, LOT_VOICES.securityf), byPants(state, SECURITY_BARK), 0.5); }
      break;
    case 'siren':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 4) playSound('siren', 0.25, 2);
      if (e.aiTimer > 36) setState(e, 'rush');
      break;
    case 'rush': {
      const ahead = safeAhead(ctx, e, e.facing!, 50);
      e.vel.x = ahead ? e.facing! * 6.5 : 0;
      // (anybody else in its way: run down too)
      for (const o of hazardVictims(state)) if (o !== e && o.enemyType !== 'flyer' && boxHits(o, e.pos.x + (e.facing! > 0 ? e.width - 10 : -6), e.pos.y + 10, 16, e.height - 10) && (o.hazardHitAt ?? -99) < state.frame - 30) {
        o.hazardHitAt = state.frame; hazardHit(ctx, o, 40, m.x, 'RUN DOWN!', { knock: 12 });
      }
      const past = (p.x - m.x) * e.facing! < -160;
      if (!ahead || past || e.aiTimer > 90) setState(e, 'skid');
      break;
    }
    case 'skid':
      e.vel.x *= 0.9;
      if (e.aiTimer > 40) { e.homeX = e.pos.x; setState(e, sees(state, e, 560, 110) ? 'siren' : 'idle'); }
      break;
  }
  return false;
};

const SPEAR_REACH = 112;
const legionary = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      stroll(ctx, e, 50, 0.5);
      if (e.aiTimer > 20 && sees(state, e, 520, 160)) { setState(e, 'march'); bark(state, e, v(e, LOT_VOICES.extra, LOT_VOICES.extraf), byPants(state, EXTRA_BARK), 0.3); }
      break;
    case 'march':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 80 && safeAhead(ctx, e, e.facing) ? e.facing * 1.1 : 0;
      if (Math.abs(dx) < SPEAR_REACH && Math.abs(p.y - m.y) < 70 && !holdingOff(state)) setState(e, 'draw');
      break;
    case 'draw':
      e.vel.x = 0;
      if (e.aiTimer > 26) { setState(e, 'thrust'); playSound('whoosh', 0.6, 6); }
      break;
    case 'thrust':
      e.vel.x = e.aiTimer < 6 ? e.facing! * 3 : 0;
      if (e.aiTimer === 4 && (p.x - m.x) * e.facing! > -10 && Math.abs(dx) < SPEAR_REACH + 10 && Math.abs(p.y - m.y) < 60 && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.carried) {
        hurtPlayer(ctx, 15, 'm2:hw_legionary', { x: e.facing! * 8, y: -5 }, 20); shakeScreen(state, 6, 3);
      }
      if (e.aiTimer > 30) setState(e, 'march');
      break;
  }
  return false;
};

const cowboy = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      stroll(ctx, e);
      if (e.aiTimer > 20 && sees(state, e, 520, 200)) { setState(e, 'walk'); e.shootTimer = 60; bark(state, e, v(e, LOT_VOICES.extra, LOT_VOICES.extraf), byPants(state, EXTRA_BARK), 0.3); }
      break;
    case 'walk': {
      e.facing = dirTo(e, p.x);
      const want = Math.abs(dx) > 300 ? e.facing : Math.abs(dx) < 140 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.1 : 0;
      e.shootTimer++;
      if (e.shootTimer > 110 && Math.abs(dx) < 360 && Math.abs(p.y - m.y) < 140 && !holdingOff(state)) setState(e, 'swing');
      break;
    }
    case 'swing':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % 10 === 1) playSound('whoosh', 0.2, 10);
      if (e.aiTimer > 36) { throwLasso(state, e, p.x + pl.vel.x * 12, p.y); setState(e, 'throw'); }
      break;
    case 'throw':
      if (e.aiTimer > 40) { e.shootTimer = 0; setState(e, 'walk'); }
      break;
  }
  return false;
};

const personGender = (e: Enemy) => (womanOf(e) ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({ kind: 'm2:hw_guide', stats: { w: 38, h: 72, hp: 90, contact: 6, mass: 180 }, ai: guide, humanoid: true, gender: personGender, head: { x: 1, y: -66, r: 10 }, draw: (c, e, f) => drawGuide(c, e, f, seedOf(e)) });
registerM2Kind({ kind: 'm2:hw_cart', stats: { w: 84, h: 78, hp: 170, contact: 14, mass: 420 }, ai: cart, humanoid: true, gender: personGender, head: { x: -6, y: -72, r: 10 }, grab: 'none', pathing: false, draw: (c, e, f) => drawCart(c, e, f, seedOf(e)) });
registerM2Kind({
  kind: 'm2:hw_legionary', stats: { w: 42, h: 80, hp: 170, contact: 10, mass: 260 }, ai: legionary, humanoid: true, gender: personGender, head: { x: 1, y: -74, r: 10 },
  pointy: { source: 'm2:hw_legionary_spear', label: 'SKEWERED!', damage: 14 },
  draw: (c, e, f) => drawLegionary(c, e, f, seedOf(e)),
});
registerM2Kind({ kind: 'm2:hw_cowboy', stats: { w: 40, h: 76, hp: 140, contact: 7, mass: 200 }, ai: cowboy, humanoid: true, gender: personGender, head: { x: 1, y: -70, r: 10 }, draw: (c, e, f) => drawCowboy(c, e, f, seedOf(e)) });
