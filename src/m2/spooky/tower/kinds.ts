// The clock tower's enemies (Meathead 2's own kinds). Two lots:
//
// The park's staff in cheap monster-mash costumes (mixed people under them: men and women, every skin, thin and
// heavy, by seed), escalating the types the town and the castle taught:
//   igor     a hunchback in a burlap robe with a pitchfork (a real one): POINTY. Walks at him, draws it back (the
//            tell), jabs. Shoulder charge him from the front and you run onto it.
//   mummy    toilet paper, a lot of it, over a big guy (or gal): the TANK. Slow, takes a beating, arms up (the tell)
//            and a two-handed swipe.
//   bride    a vampire bride (veil, a dress gone gray, a bouquet of dead roses): the THROWER. Up on a ledge, keeps her
//            distance, lobs bouquets (thorns) that come down where he is.
//   (plus the town's wolfman, the rusher, and its stitched-up monster, the bruiser, in the mixes: town/kinds.ts)
// The clock's own:
//   cuckoo   the bird out of a cuckoo clock on the wall: pops out, darts at him, goes back in. A drone with a beak.
//   ringer   a clockwork bell-ringer, one of the clock's figures (a big wooden automaton): walks its beat, raises its
//            hammer (the tell: a long one), brings it down in front of it. A machine: scrap, not blood.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { box } from '../section';
import { inDanger, clearView } from './hazards';
import {
  HURT_IGOR, DEATH_IGOR, HURT_PITCHFORK, DEATH_PITCHFORK, HURT_MUMMY, DEATH_MUMMY, HURT_BRIDE, DEATH_BRIDE, HURT_BOUQUET, DEATH_BOUQUET,
  HURT_CUCKOO, DEATH_CUCKOO, HURT_RINGER, DEATH_RINGER, HURT_HAMMER, DEATH_HAMMER,
} from './lines';

type Ctx = CanvasRenderingContext2D;

export const TK = { igor: 'm2:tower_igor', mummy: 'm2:tower_mummy', bride: 'm2:tower_bride', cuckoo: 'm2:tower_cuckoo', ringer: 'm2:tower_ringer' } as const;

registerHurtLines(TK.igor, HURT_IGOR, DEATH_IGOR);
registerHurtLines('m2:tower_pitchfork', HURT_PITCHFORK, DEATH_PITCHFORK);
registerHurtLines(TK.mummy, HURT_MUMMY, DEATH_MUMMY);
registerHurtLines(TK.bride, HURT_BRIDE, DEATH_BRIDE);
registerHurtLines('m2:tower_bouquet', HURT_BOUQUET, DEATH_BOUQUET);
registerHurtLines(TK.cuckoo, HURT_CUCKOO, DEATH_CUCKOO);
registerHurtLines(TK.ringer, HURT_RINGER, DEATH_RINGER);
registerHurtLines('m2:tower_hammer', HURT_HAMMER, DEATH_HAMMER);

const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
/** He's about, on its floor (the tower's floors are 380 apart: nothing on the next one up or down comes for him). */
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry
    // (not through a support beam: they're cover)
    && clearView(m.x, e.pos.y + 12, p.x, p.y);
};
const canHurt = (state: GameState) => state.player.health > 0 && state.player.invincibilityTimer <= 0 && !state.player.inCutscene;
/** Who's under the costume: the same person every time (where it was put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) * 7 + (e.variant ?? 0) * 31;

// ---------------------------------------------------------------------------------------------------------------
// What's thrown (the brides' bouquets): the section runs and draws them (updateThrown, drawThrown)

export interface Bouquet { x: number; y: number; vx: number; vy: number; t: number; rot: number }
export const thrown: Bouquet[] = [];
const LOB_G = 0.3;
export const updateThrown = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  for (let i = thrown.length - 1; i >= 0; i--) {
    const b = thrown[i];
    b.t++; b.vy += LOB_G; b.x += b.vx; b.y += b.vy; b.rot += 0.25;
    const hit = b.x > p.pos.x - 8 && b.x < p.pos.x + p.width + 8 && b.y > p.pos.y && b.y < p.pos.y + p.height;
    const ground = state.blocks.some(k => !k.oneWay && b.x >= k.x && b.x <= k.x + k.w && b.y >= k.y && b.y <= k.y + 20);
    if (hit && canHurt(state)) hurtPlayer(ctx, 9, 'm2:tower_bouquet', { x: Math.sign(b.vx) * 4, y: -3 });
    if (hit || ground || b.t > 240) {
      // (the petals everywhere)
      for (let j = 0; j < 10; j++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 30, color: j % 2 ? '#4C0519' : '#3F6212', size: 2 + Math.random() * 2, grav: 0.15 });
      playSound('splat', 0.3, 8);
      thrown.splice(i, 1);
    }
  }
};
export const drawBouquet = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
  box(c, -2, 0, 4, 14, '#3F6212');
  box(c, -8, -10, 16, 11, '#4C0519'); box(c, -6, -12, 5, 5, '#881337'); box(c, 2, -11, 5, 5, '#881337');
  c.restore();
};
export const drawThrown = (c: Ctx) => { for (const b of thrown) drawBouquet(c, b.x, b.y, b.rot); };

// ---------------------------------------------------------------------------------------------------------------
// The AIs

const igorAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 120)) setState(e, 'walk');
      break;
    case 'walk':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 80 && safeAhead(ctx, e, e.facing) && !inDanger(e, e.pos.x + e.facing * 6) ? e.facing * 1.7 : 0;
      if (Math.abs(dx) < 110 && Math.abs(p.y - m.y) < 70) setState(e, 'windup');
      if (!sees(state, e, 800, 160)) setState(e, 'idle');
      break;
    case 'windup':
      // (the fork drawn back: the tell)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 22) { setState(e, 'thrust'); playSound('whoosh', 0.6, 2); }
      break;
    case 'thrust':
      e.vel.x = e.aiTimer < 8 && safeAhead(ctx, e, e.facing!) && !inDanger(e, e.pos.x + e.facing! * 14) ? e.facing! * 6 : 0;
      if (e.aiTimer > 16) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 36) setState(e, 'walk');
      break;
  }
  return false;
};

const MUMMY_REACH = 96;
const mummyAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 130)) setState(e, 'walk');
      break;
    case 'walk':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 70 && safeAhead(ctx, e, e.facing) && !inDanger(e, e.pos.x + e.facing * 6) ? e.facing * 0.75 : 0;
      if (Math.abs(dx) < 110 && Math.abs(p.y - m.y) < 80) setState(e, 'raise');
      break;
    case 'raise':
      // (both wrapped arms up, groaning: the tell)
      e.vel.x = 0;
      if (e.aiTimer === 2) playSound('bellow', 0.35, 6);
      if (e.aiTimer > 38) { setState(e, 'swipe'); playSound('whoosh', 0.8, -8); }
      break;
    case 'swipe':
      if (e.aiTimer === 5) {
        const inFront = dx * e.facing! > -10 && Math.abs(dx) < MUMMY_REACH && Math.abs(p.y - m.y) < 70;
        if (inFront && canHurt(state)) hurtPlayer(ctx, 16, TK.mummy, { x: e.facing! * 8, y: -5 }, 20);
      }
      if (e.aiTimer > 14) setState(e, 'recover');
      break;
    case 'recover':
      if (e.aiTimer > 46) setState(e, 'walk');
      break;
  }
  return false;
};

const brideAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  e.vel.x = 0;
  const awake = sees(state, e, 620, 420);
  if (awake) e.facing = dirTo(e, p.x);
  switch (e.aiState) {
    default:
      if (awake && e.aiTimer > 100 && Math.abs(dx) < 560) setState(e, 'windup');
      break;
    case 'windup':
      // (the bouquet up over her shoulder: the tell)
      if (e.aiTimer === 22) {
        const t = Math.max(34, Math.min(62, Math.abs(dx) / 5)), tx = p.x + state.player.vel.x * t * 0.3;
        const sx = m.x + e.facing! * 12, sy = e.pos.y + 14;
        thrown.push({ x: sx, y: sy, vx: (tx - sx) / t, vy: (p.y - sy - 0.5 * LOB_G * t * t) / t, t: 0, rot: 0 });
        playSound('whoosh', 0.45, 6);
      }
      if (e.aiTimer > 34) { setState(e, 'idle'); e.aiTimer = -Math.floor(Math.random() * 40); }
      break;
  }
  return false;
};

/** A cuckoo: sat in its clock's door (home), out at him, back in. */
const cuckooAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    default:
      // (in the door, bobbing; the clock about to go off: it pops out at him)
      e.pos.x += (hx - e.pos.x) * 0.3; e.pos.y = hy + Math.sin((state.frame + hx) * 0.2) * 1.5;
      e.facing = dirTo(e, p.x);
      if (e.aiTimer > 70 && sees(state, e, 360, 240)) { setState(e, 'pop'); playSound('ding', 0.45, 14); }
      return true;
    case 'pop': {
      // CUCKOO! (out on its spring, a beat, then at him)
      e.pos.x = hx + e.facing! * Math.min(1, e.aiTimer / 6) * 26;
      if (e.aiTimer > 16) {
        setState(e, 'dart');
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel.x = ((p.x - m.x) / len) * 6.5; e.vel.y = ((p.y - m.y) / len) * 6.5;
        playSound('whoosh', 0.4, 10);
      }
      return true;
    }
    case 'dart':
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      if (e.aiTimer > 46 || state.blocks.some(b => !b.oneWay && m.x > b.x && m.x < b.x + b.w && m.y > b.y && m.y < b.y + b.h)) setState(e, 'back');
      return true;
    case 'back': {
      const ddx = hx - e.pos.x, ddy = hy - e.pos.y, d = Math.hypot(ddx, ddy);
      e.facing = (ddx < 0 ? -1 : 1) as 1 | -1;
      if (d < 4) { e.pos.x = hx; e.pos.y = hy; setState(e, 'idle'); return true; }
      e.vel.x = (ddx / d) * 3.5; e.vel.y = (ddy / d) * 3.5;
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      return true;
    }
  }
};

const RINGER_REACH = 120;
const ringerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default: {
      // Its beat, back and forth (it doesn't chase: it's on a track, like the clock's figures)
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 150 || !safeAhead(ctx, e, e.facing) || inDanger(e, e.pos.x + e.facing * 8)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      if (inDanger(e, e.pos.x + e.facing * 8)) { e.vel.x = 0; break; }
      e.vel.x = e.facing * 0.8;
      if (state.frame % 40 === 0 && Math.abs(dx) < 700 && Math.abs(p.y - m.y) < 200) playSound('click', 0.2, -10);
      if (sees(state, e, 150, 90) && dx * e.facing > -30) setState(e, 'raise');
      else if (sees(state, e, 150, 90)) { e.facing = dirTo(e, p.x); setState(e, 'raise'); }
      break;
    }
    case 'raise':
      // (the hammer winds up over its head, ratcheting: the tell)
      e.vel.x = 0;
      if (e.aiTimer % 9 === 0) playSound('click', 0.4, -4);
      if (e.aiTimer > 46) { setState(e, 'strike'); playSound('whoosh', 0.9, -10); }
      break;
    case 'strike':
      if (e.aiTimer === 6) {
        shakeScreen(state, 12, 6);
        playSound('clang', 1, -12); playSound('ding', 0.6, -16);
        const hx = m.x + e.facing! * 70;
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: hx, y: e.pos.y + e.height }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 22, color: i % 2 ? '#A8A29E' : '#FDE68A', size: 3 });
        const inFront = dx * e.facing! > -20 && Math.abs(dx) < RINGER_REACH && Math.abs(p.y - m.y) < 80;
        if (inFront && canHurt(state)) hurtPlayer(ctx, 18, 'm2:tower_hammer', { x: e.facing! * 9, y: -7 }, 24);
      }
      if (e.aiTimer > 14) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x = 0;
      if (e.aiTimer > 44) setState(e, 'idle');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: flat shapes, a few tones, inked round so they read). Feet at the origin, facing right.

const INK = '#0C0A09';
/** A box, inked round. */
const ob = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, col); };
/** A polygon, inked. */
const poly = (c: Ctx, pts: [number, number][], col: string) => {
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.5; c.stroke();
};
const stride = (e: Enemy, f: number) => (Math.abs(e.vel.x) > 0.2 ? Math.sin(f * 0.25 + (e.initialX || 0)) * 4 : 0);
/** A face: their own skin, eyes (narrowed when they mean it), a mouth. */
const face = (c: Ctx, x: number, y: number, skin: string, angry: boolean) => {
  ob(c, x, y, 14, 14, skin);
  box(c, x + 8, y + 4, 3, angry ? 2 : 3, INK); box(c, x + 3, y + 4, 3, angry ? 2 : 3, INK);
  box(c, x + 4, y + 10, 7, 2, angry ? '#7F1D1D' : '#57534E');
};

const drawIgor = (c: Ctx, e: Enemy, f: number) => {
  const L = lookOf(seedOf(e)), s = stride(e, f);
  const robe = ['#78350F', '#57534E', '#4D3B26'][seedOf(e) % 3];
  const wind = e.aiState === 'windup', thrust = e.aiState === 'thrust';
  // sandals, the robe hanging to the shins (a rope belt), the hump up over the back
  ob(c, -9 + s, -10, 7, 10, L.skin); ob(c, 3 - s, -10, 7, 10, L.skin);
  box(c, -10 + s, -2, 9, 2, '#44403C'); box(c, 2 - s, -2, 9, 2, '#44403C');
  poly(c, [[-14, -10], [14, -10], [10, -44], [-8, -48]], robe);
  box(c, -12, -28, 24, 3, '#D6C7A1');
  poly(c, [[-14, -40], [-4, -58], [8, -50], [6, -40]], robe);
  // the head, low and forward under the hood; one eye bigger than the other (that's the costume)
  face(c, 4, -54, L.skin, wind || thrust);
  box(c, 12, -51, 5, 5, '#FAFAFA'); box(c, 14, -49, 2, 2, INK);
  poly(c, [[0, -44], [2, -60], [16, -60], [20, -54], [6, -50]], robe);
  if (!L.bald) box(c, 3, -46, 3, 6, L.hair);
  // the pitchfork (a real one): drawn back for the windup (the tell, a glint), jabbed out for the thrust
  const out = thrust ? 26 : wind ? -16 : 4;
  ob(c, -16 + out, -33, 58, 4, '#92400E');
  ob(c, 40 + out, -41, 4, 20, '#A1A1AA');
  for (const dy of [-41, -32, -23]) ob(c, 43 + out, dy, 14, 2, '#E4E4E7');
  if (wind) box(c, 58 + out, -42, 3, 3, '#FDE68A');
  ob(c, 6, -36, 8, 7, L.skin);
};

const drawMummy = (c: Ctx, e: Enemy, f: number) => {
  const L = lookOf(seedOf(e)), s = stride(e, f), w = L.heavy ? 42 : 36;
  const tp = '#E7E5E4', band = '#A8A29E';
  // legs, the body: wrapped (the strips at an angle), a loose end trailing
  ob(c, -13 + s, -28, 12, 28, tp); ob(c, 2 - s, -28, 12, 28, tp);
  ob(c, -w / 2, -68, w, 42, tp);
  c.save(); c.beginPath(); c.rect(-w / 2, -68, w, 42); c.clip();
  c.strokeStyle = band; c.lineWidth = 2; for (let y = -76; y < -20; y += 8) { c.beginPath(); c.moveTo(-w / 2, y); c.lineTo(w / 2, y + 10); c.stroke(); }
  c.restore();
  for (const y of [-22, -12]) { box(c, -13 + s, y, 12, 2, band); box(c, 2 - s, y, 12, 2, band); }
  box(c, -w / 2 - 4, -50 + Math.sin(f * 0.1) * 3, 4, 30, tp);
  // the head: wrapped; their eyes through the slit
  ob(c, -12, -88, 24, 22, tp);
  box(c, -8, -80, 18, 6, L.skin); box(c, 0, -79, 3, 3, INK); box(c, 6, -79, 3, 3, INK);
  for (let y = -86; y < -68; y += 6) box(c, -12, y, 24, 1, band);
  // the arms: out in front shambling; both up for the swipe (the tell); down and across in it
  const st = e.aiState;
  if (st === 'raise') { ob(c, 6, -116, 10, 44, tp); ob(c, -8, -114, 10, 44, band); }
  else if (st === 'swipe') { ob(c, 4, -54, 48, 11, tp); ob(c, 4, -41, 44, 10, band); }
  else { ob(c, 6, -62, 32, 9, tp); ob(c, 6, -52, 30, 8, band); }
};

const drawBride = (c: Ctx, e: Enemy, f: number) => {
  const L = lookOf(seedOf(e)), dress = '#D6D3D1';
  // the dress (a bell of it, gone gray, its hem in tatters), the bodice
  poly(c, [[-22, 0], [-16, -4], [-10, 0], [-4, -4], [2, 0], [8, -4], [14, 0], [22, 0], [10, -36], [-10, -36]], dress);
  ob(c, -9, -54, 18, 20, dress); box(c, -9, -54, 18, 3, '#78716C');
  // the head: pale makeup over their own skin, dark lips, the hair, the veil down the back
  ob(c, -6, -68, 13, 14, L.skin); box(c, -6, -68, 13, 14, 'rgba(255,255,255,0.35)');
  box(c, 3, -64, 2, 2, INK); box(c, 1, -58, 5, 2, '#4C0519');
  ob(c, -8, -72, 16, 6, L.bald ? '#18181B' : L.hair);
  c.fillStyle = 'rgba(231,229,228,0.75)'; c.beginPath(); c.moveTo(-6, -72); c.lineTo(-16, -30); c.lineTo(-6, -34); c.closePath(); c.fill();
  box(c, -4, -74, 8, 3, '#F5F5F4');
  // the bouquet: held, then up over her shoulder to throw (the tell)
  if (e.aiState === 'windup') { ob(c, -6, -72, 5, 18, dress); drawBouquet(c, -4, -80, -0.4 + Math.min(1, (e.aiTimer || 0) / 22) * 1.2); }
  else { ob(c, 6, -50, 10, 5, dress); drawBouquet(c, 16, -46, 0.3 + Math.sin(f * 0.05) * 0.1); }
};

const drawCuckoo = (c: Ctx, e: Enemy, f: number) => {
  const flap = e.aiState === 'dart' || e.aiState === 'back' ? (Math.floor(f / 3) % 2 ? -6 : 3) : 0;
  // (the spring it's on, out of its door)
  if (e.aiState === 'pop' || e.aiState === 'idle' || !e.aiState) for (let i = 0; i < 4; i++) box(c, -20 - i * 5, -12 + (i % 2) * 3, 4, 2, '#A1A1AA');
  poly(c, [[-12, -6], [-16, -2], [-8, -4]], '#78350F');
  ob(c, -11, -18, 22, 14, '#92400E'); box(c, -11, -18, 22, 3, '#B45309');
  poly(c, [[10, -14], [18, -11], [10, -9]], '#F59E0B');
  box(c, 3, -16, 4, 4, '#FAFAFA'); box(c, 5, -15, 2, 2, INK);
  poly(c, [[-6, -12], [6, -12 + flap], [-2, -18 + flap]], '#78350F');
};

const drawRinger = (c: Ctx, e: Enemy, f: number) => {
  const s = stride(e, f) * 0.5, wood = '#9A3412', paint = '#1D4ED8', gold = '#CA8A04';
  // the carriage it rides its track on, its stiff legs, the coat (brass buttons), the face painted on, the hat
  ob(c, -24, -10, 48, 10, '#44403C'); box(c, -20, -4, 8, 4, INK); box(c, 12, -4, 8, 4, INK);
  ob(c, -14 + s, -40, 11, 30, wood); ob(c, 3 - s, -40, 11, 30, wood);
  poly(c, [[-22, -40], [22, -40], [18, -92], [-18, -92]], paint);
  box(c, -3, -88, 6, 46, gold); for (let y = -84; y < -44; y += 10) box(c, -2, y, 4, 4, '#FDE68A');
  ob(c, -13, -116, 26, 24, '#FCD9B6');
  ob(c, -16, -124, 32, 6, '#7F1D1D'); ob(c, -11, -140, 22, 16, '#7F1D1D'); box(c, -11, -128, 22, 3, gold);
  box(c, 3, -108, 4, 4, INK); box(c, -5, -108, 4, 4, INK); box(c, -4, -99, 10, 3, '#7F1D1D');
  box(c, -10, -103, 4, 3, '#F87171'); box(c, 7, -103, 4, 3, '#F87171');
  // (the key in its back, turning)
  const k = Math.sin(f * 0.15) * 6;
  ob(c, -26, -72, 6, 4, gold); ob(c, -36, -78 - k / 2, 10, 14 + k, gold);
  // the hammer: carried, wound up over its head (ratcheting: the tell), down in front
  const st = e.aiState;
  const t = Math.min(1, (e.aiTimer || 0) / 46);
  const a = st === 'raise' ? -0.4 - t * 2.4 : st === 'strike' ? 0.9 : st === 'recover' ? 0.8 : -0.2;
  c.save(); c.translate(12, -80); c.rotate(a);
  ob(c, 0, -4, 60, 8, '#78350F'); ob(c, 52, -17, 24, 34, '#57534E'); box(c, 52, -17, 24, 4, '#A8A29E');
  c.restore();
  ob(c, 8, -86, 10, 10, wood);
};

// ---------------------------------------------------------------------------------------------------------------

const personGender = (e: Enemy) => (lookOf(seedOf(e)).woman ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({
  kind: TK.igor, stats: { w: 40, h: 60, hp: 120, contact: 10, mass: 200 }, ai: igorAI, humanoid: true, gender: personGender,
  pointy: { source: 'm2:tower_pitchfork', label: 'FORKED!' }, head: { x: 11, y: -52, r: 8 },
  draw: (c, e, f) => drawIgor(c, e, f),
});
registerM2Kind({
  kind: TK.mummy, stats: { w: 46, h: 84, hp: 300, contact: 13, mass: 430 }, ai: mummyAI, humanoid: true, gender: personGender,
  head: { x: 0, y: -74, r: 11 }, draw: (c, e, f) => drawMummy(c, e, f),
});
registerM2Kind({
  kind: TK.bride, stats: { w: 38, h: 70, hp: 80, contact: 8, mass: 170 }, ai: brideAI, humanoid: true, gender: personGender,
  head: { x: 0, y: -60, r: 8 }, draw: (c, e, f) => drawBride(c, e, f),
});
registerM2Kind({
  kind: TK.cuckoo, stats: { w: 26, h: 20, hp: 25, contact: 8, mass: 20, air: true }, ai: cuckooAI, gender: 'n', grab: 'critter',
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  head: { x: 6, y: -14, r: 5 }, draw: (c, e, f) => drawCuckoo(c, e, f),
});
registerM2Kind({
  kind: TK.ringer, stats: { w: 50, h: 120, hp: 300, contact: 10, mass: 900 }, ai: ringerAI, robot: true, gender: 'n', grab: 'none',
  head: { x: 0, y: -104, r: 13 }, draw: (c, e, f) => drawRinger(c, e, f),
});
