// The sewer's rats (Meathead 2's own kind, `m2:fr_rat`): big gray sewer rats on the walkways along the sewer's back
// wall. One sits up sniffing (its whiskers going) till the log comes along under it; then it hunkers (the tell: a
// squeak, its tail lashing) and leaps for him in an arc. Touching him, it bites (its hurt lines: lines.ts); a miss, or
// a bite and a shake, and down it goes into the sewage (it drowns: drown.ts). A shot, a saw, a gusher: dead. Small: a
// grab's a critter.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { GRAVITY } from '../../../m1/constants';
import { mid, safeAhead, holdingOff } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import {
  type Frame, dk, part, partTop, px, bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairBack,
  frameOf, putFrame, pickOf, moodOf, reaction,
} from '../../spooky/costume';
import { INK, type Ctx } from '../kit';

export const RAT = 'm2:fr_rat';

const rat = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  const m = mid(e), pm = mid(p);
  switch (e.aiState) {
    default:
      e.aiState = 'sit'; e.facing = -1;
      return false;
    case 'sit': {
      e.vel.x = 0;
      // (the log under it, coming: ahead of him and below, not too far)
      const dx = m.x - pm.x, dy = pm.y - m.y;
      if (p.health > 0 && !p.inCutscene && dx > 40 && dx < 230 && dy > -40 && dy < 200) { e.aiState = 'crouch'; e.aiTimer = 0; playSound('chitter', 0.6, 8); }
      return false;
    }
    case 'crouch':
      e.vel.x = 0;
      if (e.aiTimer! >= 18) {
        // (the leap: at where he'll be)
        e.aiState = 'leap'; e.aiTimer = 0;
        const t = 26, lead = 3 * t;
        e.vel.x = (pm.x + lead - m.x) / t; e.vel.y = -5.5;
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
        playSound('chitter', 0.8, 12);
      }
      return false;
    case 'leap': {
      e.vel.y += GRAVITY * 0.7;
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && e.pos.x < p.pos.x + p.width && e.pos.x + e.width > p.pos.x && e.pos.y < p.pos.y + p.height && e.pos.y + e.height > p.pos.y) {
        hurtPlayer(ctx, 8, RAT, { x: 0, y: -3 });
        playSound('gnaw', 0.9, 4);
        e.aiState = 'off'; e.aiTimer = 0; e.vel.x = 2.5; e.vel.y = -3;
      }
      if (e.aiTimer! > 120) e.aiState = 'off';
      return true;
    }
    case 'off':
      // (shaken off, or missed: down into the sewage)
      e.vel.y += GRAVITY * 0.7;
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      if (e.aiTimer! > 240) e.health = 0;
      return true;
  }
};

/** A sewer rat, feet at the origin, facing right: gray-brown, a pink tail, pink ears and hands, red eyes. */
const drawRat = (c: Ctx, e: Enemy, f: number) => {
  const st = e.aiState, sit = st === 'sit', crouch = st === 'crouch', air = st === 'leap' || st === 'off';
  const fur = '#6B6258', furL = '#8A8074', pink = '#E8A0A0';
  c.save();
  if (air) c.rotate(Math.max(-0.6, Math.min(0.6, (e.vel.y ?? 0) * 0.08)));
  // (the tail: long, pink, lashing)
  const lash = Math.sin(f * (crouch ? 0.6 : 0.15)) * (crouch ? 6 : 3);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -5); c.quadraticCurveTo(-22, -2 + lash, -32, -8 - lash); c.stroke();
  c.strokeStyle = pink; c.lineWidth = 1.5; c.stroke();
  const by = sit ? -16 : crouch ? -9 : -12;
  // (the body)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, by, 15, sit ? 10 : 8, sit ? -0.5 : 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = fur; c.beginPath(); c.ellipse(0, by, 13.5, sit ? 8.5 : 6.5, sit ? -0.5 : 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = furL; c.beginPath(); c.ellipse(-2, by - 3, 8, 3, sit ? -0.5 : 0, 0, Math.PI * 2); c.fill();
  // (the head: a pointed snout, an ear, the red eye, the whiskers; sat up, the hands up at its chest)
  const hx = sit ? 9 : 13, hy = sit ? by - 9 : by - 2;
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 6, hy - 6); c.lineTo(hx + 11, hy + 1); c.lineTo(hx - 6, hy + 6); c.closePath(); c.fill();
  c.fillStyle = fur; c.beginPath(); c.moveTo(hx - 5, hy - 5); c.lineTo(hx + 9, hy + 1); c.lineTo(hx - 5, hy + 5); c.closePath(); c.fill();
  c.fillStyle = pink; c.fillRect(hx + 8, hy, 3, 2);
  c.fillStyle = INK; c.beginPath(); c.ellipse(hx - 3, hy - 6, 3.5, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = pink; c.beginPath(); c.ellipse(hx - 3, hy - 6, 2, 2.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.fillRect(hx + 1, hy - 2, 2, 2);
  const tw = Math.sin(f * 0.8) * 1.2;
  c.strokeStyle = '#D6D3D1'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(hx + 7, hy + 1); c.lineTo(hx + 14, hy - 2 + tw); c.moveTo(hx + 7, hy + 2); c.lineTo(hx + 14, hy + 3 - tw); c.stroke();
  // (the teeth: two yellow incisors, bared to bite)
  if (air || crouch) { c.fillStyle = '#FDE047'; c.fillRect(hx + 7, hy + 3, 2, 3); }
  if (sit) { c.fillStyle = pink; c.fillRect(hx - 2, by - 2, 3, 3); c.fillRect(hx + 1, by - 1, 3, 3); }
  // (the feet)
  c.fillStyle = pink;
  if (!air) { c.fillRect(-9, -2, 5, 2); c.fillRect(5, -2, 5, 2); }
  else { c.fillRect(-12, by + 5, 5, 2); c.fillRect(8, by + 5, 5, 2); }
  c.restore();
};

registerM2Kind({
  kind: RAT, stats: { w: 30, h: 22, hp: 8, contact: 0, mass: 6 },
  ai: rat, draw: drawRat, head: { x: 12, y: -16, r: 5 }, gender: 'n', grab: 'critter', pathing: false,
});

// ---------------------------------------------------------------------------------------------------------------
// The logging crew (Meathead 2's own kind, `m2:fr_logger`): real loggers out past the park, on their clearing by the
// woodchipper (hard hats, ear defenders, hi-vis vests over flannel, chainsaws). While he's coming up their conveyor
// they yell JUMP (chipper.ts); once he's down on their clearing on foot, their log mulched and the chipper chewing, they're
// sore about it: they come at him with the chainsaws: up close it's revved overhead (the tell: the roar, the smoke, the
// chain a blur), then the lunge (a run at him, the bar out front: m2:fr_chainsaw). Killable every way; a body (or a
// logger, flung) into the chipper's hopper goes through it (chipper.ts: CHIPPED!).

export const LOGGER = 'm2:fr_logger';
const loggerSeed = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const loggerWoman = (e: Enemy) => lookOf(loggerSeed(e)).woman;
/** The clearing he's on, on foot (the crew's chance at him): set by index.ts each frame. */
let crewOn = false;
export const setCrewOn = (on: boolean) => { crewOn = on; };
/** (this lunge has already cut him) */
const landed = new WeakSet<Enemy>();

const logger = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  const m = mid(e), pm = mid(p), to = (pm.x < m.x ? -1 : 1) as 1 | -1;
  const sees = p.health > 0 && !p.inCutscene && !holdingOff(state) && crewOn && Math.abs(pm.y - m.y) < 300 && Math.abs(pm.x - m.x) < 900;
  const level = Math.abs(p.pos.y + p.height - (e.pos.y + e.height)) < 60;
  const set = (s: string) => { e.aiState = s; e.aiTimer = 0; };
  switch (e.aiState) {
    default:
      // (watching the river, the conveyor; then him, once he's down on their clearing)
      e.vel.x = 0; e.facing = -1;
      if (sees && e.aiTimer! > 30) set('near');
      return false;
    case 'near': {
      e.facing = to;
      if (!sees) { e.vel.x = 0; break; }
      const dx = Math.abs(pm.x - m.x);
      if (dx < 70 && level) { set('rev'); e.vel.x = 0; playSound('engine', 0.7, 10); break; }
      e.vel.x = safeAhead(ctx, e, to, 12) ? to * 1.5 : 0;
      break;
    }
    case 'rev':
      // (the tell: the saw up, roaring, smoking)
      e.vel.x = 0; e.facing = to;
      if (e.aiTimer! % 8 === 0) playSound('engine', 0.5, 14);
      if (e.aiTimer! >= 26) { set('lunge'); playSound('grind', 0.9, 6); playSound('whoosh', 0.6); }
      break;
    case 'lunge': {
      // (the run at him, the bar out front)
      e.vel.x = safeAhead(ctx, e, e.facing!, 12) ? e.facing! * 3.4 : 0;
      const x = e.facing! > 0 ? e.pos.x + e.width - 4 : e.pos.x - 34;
      if (!landed.has(e) && p.invincibilityTimer <= 0 && p.health > 0 && !p.inCutscene && p.pos.x < x + 38 && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height - 10 && p.pos.y + p.height > e.pos.y + 20) {
        landed.add(e);
        hurtPlayer(ctx, 11, 'm2:fr_chainsaw', { x: e.facing! * 6, y: -4 });
        playSound('gorespray', 0.6, 4);
      }
      if (e.aiTimer! >= 20) { set('after'); landed.delete(e); }
      break;
    }
    case 'after':
      e.vel.x *= 0.8;
      if (e.aiTimer! >= 36) set('near');
      break;
  }
  return false;
};

const LOGGER_BOX: [number, number, number, number] = [-64, -140, 140, 144];
/** A chainsaw, held by its back handle at the origin, the bar out at angle `a`. */
const chainsaw = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.rect(-6, -7, 18, 13), '#EA7A1A', -6, -7, 18, 13, 1);
  px(g, -4, -9, 10, 3, '#27272A');
  part(g, () => g.rect(11, -3, 34, 6), '#A1A1AA', 11, -3, 34, 6, 0.8);
  for (let k = 13; k < 44; k += 4) px(g, k, -4, 2, 1, '#3F3F46');
  for (let k = 13; k < 44; k += 4) px(g, k, 3, 2, 1, '#3F3F46');
  g.restore();
};
const paintLogger = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, check = pickOf(F.seed, 2, ['#B91C1C', '#1F5A8A', '#3F6A2A']);
  legs(g, B, { col: '#3A4A68', shoe: 'boot', shoeCol: '#5A3A1E' });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const fl = flailHands(B, F.fr);
  const far: [number, number] = fl ? fl[0] : up ? [B.w / 2 + 2, B.shY - 14] : sw ? [B.w / 2 + 12, B.shY + 10] : [B.w / 2 - 2, B.shY + 20];
  const near: [number, number] = fl ? fl[1] : up ? [B.w / 2 + 10, B.shY - 20] : sw ? [B.w / 2 + 18, B.shY + 12] : [B.w / 2 + 6, B.shY + 22];
  arm(g, B, -1, far[0], far[1], { sleeve: check, hand: L.skin });
  torso(g, B, check);
  for (let y = B.shY + 2; y < B.hipY; y += 6) px(g, -B.w / 2 + 1, y, B.w - 2, 2, dk(check, 0.4));
  // (the hi-vis vest: lime, two silver bands)
  part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2 + 1, B.hipY); g.lineTo(B.hipW / 2 - 1, B.hipY); g.lineTo(B.w / 2 - 1, B.shY + 2); g.lineTo(3, B.shY + 9); g.lineTo(-3, B.shY + 9); g.closePath(); }, '#C8E632', -B.w / 2, B.shY + 2, B.w, B.hipY - B.shY, 1);
  px(g, -B.w / 2 + 2, B.shY + 14, B.w - 4, 2, '#E5E7EB'); px(g, -B.hipW / 2 + 2, B.hipY - 7, B.hipW - 4, 2, '#E5E7EB');
  hairBack(g, B, L.hair, 12);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: up || sw ? 'angry' : 'open', mouth: up || sw ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (the ear defenders, the hard hat)
  part(g, () => g.rect(B.hx - 4, B.hy - 3, 6, 8), '#EA7A1A', B.hx - 4, B.hy - 3, 6, 8, 0.8);
  px(g, B.hx - 2, B.hy - 11, 2, 9, '#27272A');
  partTop(g, () => g.ellipse(B.hx + 1, B.hy - 7, 10, 9, 0, Math.PI, 0), pickOf(F.seed, 5, ['#FACC15', '#F97316', '#F8FAFC']), B.hx - 9, B.hy - 16, 20, 9, 1);
  part(g, () => g.rect(B.hx - 11, B.hy - 8, 24, 3), dk(pickOf(F.seed, 5, ['#FACC15', '#F97316', '#F8FAFC']), 0.15), B.hx - 11, B.hy - 8, 24, 3, 1);
  arm(g, B, 1, near[0], near[1], { sleeve: check, hand: L.skin });
  if (!fl) chainsaw(g, near[0] - 4, near[1], up ? -1.1 : sw ? -0.05 : 0.35);
};
const drawLogger = (c: Ctx, e: Enemy, f: number) => {
  const seed = loggerSeed(e), r = reaction(e);
  const pose = r?.pose ?? (e.aiState === 'rev' ? 'tell' : e.aiState === 'lunge' ? 'strike' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand');
  const F = frameOf(seed, f, pose, r?.md ?? moodOf(e));
  putFrame(c, 'fr-logger', F, LOGGER_BOX, g => paintLogger(g, F));
  // (revving: exhaust puffing, the chain a blur, sparks)
  if (!r && (e.aiState === 'rev' || e.aiState === 'lunge') && e.health > 0) {
    const tip: [number, number] = e.aiState === 'rev' ? [44, -96] : [62, -44];
    c.globalAlpha = 0.5; c.fillStyle = '#71717A';
    for (let i = 0; i < 3; i++) { const t = ((f * 0.08 + i / 3) % 1); c.beginPath(); c.arc(8 - t * 10, (e.aiState === 'rev' ? -82 : -40) - t * 24, 3 + t * 6, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
    if (f % 2 === 0) { c.fillStyle = '#FDE047'; c.fillRect(tip[0] + (f % 4), tip[1] + ((f >> 1) % 3) - 1, 2, 2); }
  }
};

registerM2Kind({
  kind: LOGGER, stats: { w: 38, h: 72, hp: 70, contact: 4, mass: 190 },
  ai: logger, draw: drawLogger, humanoid: true, head: { x: 1, y: -68, r: 10 },
  gender: e => (loggerWoman(e) ? 'f' : 'm'),
});
