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
  type Frame, dk, lt, part, partTop, px, bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairBack,
  frameOf, putFrame, pickOf, moodOf, reaction,
} from '../../spooky/costume';
import { INK, type Ctx } from '../kit';
import { part as wpart, rampOf, still } from './paint';

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
      // (the tell: on screen ahead of him it's up and squeaking, well before it goes; then it crouches a good half
      // second, chittering, before the leap)
      if (dx > 0 && dx < 640 && dy > -40 && dy < 260 && e.aiTimer! % 40 === 0) playSound('chitter', 0.35, 10 + (e.aiTimer! % 80 ? 2 : 0));
      if (p.health > 0 && !p.inCutscene && dx > 40 && dx < 300 && dy > -40 && dy < 200) { e.aiState = 'crouch'; e.aiTimer = 0; playSound('chitter', 0.7, 8); }
      return false;
    }
    case 'crouch':
      e.vel.x = 0;
      if (e.aiTimer! % 10 === 0) playSound('chitter', 0.5, 12);
      if (e.aiTimer! >= 32) {
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

// (the rat in the wilds' animal style: an ink line round every part, fur in steps and ticked in, glints in the eyes;
// hurt, eyes screwed shut; dead, belly up, legs stiff, eyes crossed out, tongue out)
const ratInk = (g: Ctx, path: () => void, fill: string, line = 1) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); };
const ratPart = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number) => wpart(g, path, rampOf(col), x, y, w, h, 1);
const ratTick = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  const r = rampOf(col);
  for (let i = 0; i < n; i++) { const a = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = a - Math.floor(a), b = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = b - Math.floor(b); g.fillStyle = k2 < 0.5 ? r[2] : r[4]; g.fillRect(x + k * w, y + k2 * h, 1, 2); }
};
type RatMood = 'ok' | 'hurt' | 'dead';
const paintRat = (g: Ctx, pose: 'sit' | 'crouch' | 'air', fr: number, md: RatMood) => {
  const fur = '#6B6258', belly = '#9A9084', pink = '#E8A0A0';
  g.save();
  if (md === 'dead') { g.translate(0, -24); g.scale(1, -1); }
  const sit = pose === 'sit' && md === 'ok', crouch = pose === 'crouch', air = pose === 'air' || md !== 'ok';
  // (the tail: long, pink and scaly, lashing)
  const lash = [-3, 3, 6, -6][fr % 4] * (crouch ? 1 : 0.5);
  g.strokeStyle = INK; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, -5); g.quadraticCurveTo(-22, -2 + lash, -32, -8 - lash); g.stroke();
  g.strokeStyle = pink; g.lineWidth = 1.8; g.stroke();
  g.strokeStyle = '#C87A80'; g.lineWidth = 0.6; for (let k = 0; k < 6; k++) { const u = k / 6, tx = -12 - u * 20, ty = -5 + (lash * u * 0.6) - u * 3; g.beginPath(); g.moveTo(tx, ty - 1); g.lineTo(tx, ty + 1); g.stroke(); }
  g.lineCap = 'butt';
  const by = sit ? -16 : crouch ? -9 : -12, rot = sit ? -0.5 : 0;
  // (the hind leg, the body: fur in steps, ticked, a paler belly)
  ratPart(g, () => g.ellipse(-6, by + 4, 6, 5, 0, 0, Math.PI * 2), fur, -12, by - 1, 12, 10);
  ratPart(g, () => g.ellipse(0, by, 15, sit ? 10 : 8, rot, 0, Math.PI * 2), fur, -15, by - 10, 30, 20);
  ratTick(g, -11, by - 7, 20, 10, fur, 14, 7);
  g.fillStyle = belly; g.beginPath(); g.ellipse(2, by + (sit ? 3 : 4), 8, 3, rot, 0, Math.PI * 2); g.fill();
  // (the head: a pointed snout, the pink nose, an ear, the red eye with its glint, whiskers)
  const hx = sit ? 9 : 13, hy = sit ? by - 9 : by - 2;
  ratInk(g, () => g.ellipse(hx - 3, hy - 6, 3.6, 4, 0, 0, Math.PI * 2), fur, 0.8);
  g.fillStyle = pink; g.beginPath(); g.ellipse(hx - 3, hy - 6, 2, 2.5, 0, 0, Math.PI * 2); g.fill();
  ratPart(g, () => { g.moveTo(hx - 6, hy - 5); g.quadraticCurveTo(hx + 2, hy - 4, hx + 11, hy + 1); g.quadraticCurveTo(hx + 2, hy + 5, hx - 6, hy + 5); g.closePath(); }, fur, hx - 6, hy - 5, 17, 10);
  ratInk(g, () => g.ellipse(hx + 10, hy + 1, 1.6, 1.3, 0, 0, Math.PI * 2), pink, 0.6);
  if (md === 'dead') { g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(hx, hy - 3); g.lineTo(hx + 3, hy); g.moveTo(hx, hy); g.lineTo(hx + 3, hy - 3); g.stroke(); }
  else if (md === 'hurt') { g.strokeStyle = INK; g.lineWidth = 0.9; g.beginPath(); g.moveTo(hx, hy - 3); g.lineTo(hx + 2.5, hy - 1.5); g.lineTo(hx, hy); g.stroke(); }
  else { g.fillStyle = INK; g.fillRect(hx, hy - 3, 3, 3); g.fillStyle = '#DC2626'; g.fillRect(hx + 1, hy - 2, 2, 2); g.fillStyle = '#FFFFFF'; g.fillRect(hx + 1, hy - 3, 1, 1); }
  const tw = [0, 1, 0, -1][fr % 4] * 1.2;
  g.strokeStyle = '#D6D3D1'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(hx + 7, hy + 1); g.lineTo(hx + 15, hy - 2 + tw); g.moveTo(hx + 7, hy + 2); g.lineTo(hx + 15, hy + 3 - tw); g.moveTo(hx + 6, hy + 2); g.lineTo(hx + 13, hy + 6); g.stroke();
  // (the teeth: two yellow incisors, bared to bite; dead, the tongue out)
  if (air || crouch) { ratInk(g, () => g.rect(hx + 6, hy + 3, 3, 3), '#F2C21A', 0.6); }
  if (md === 'dead') { ratInk(g, () => g.ellipse(hx + 4, hy + 6, 1.4, 2.6, 0.3, 0, Math.PI * 2), '#E87A90', 0.6); }
  // (the hands: up at its chest sat up; out in the leap; the feet)
  if (sit) { ratInk(g, () => g.ellipse(hx - 1, by - 2, 1.8, 1.6, 0, 0, Math.PI * 2), pink, 0.6); ratInk(g, () => g.ellipse(hx + 2, by - 1, 1.8, 1.6, 0, 0, Math.PI * 2), pink, 0.6); }
  if (!air) { ratInk(g, () => g.ellipse(-7, -1.5, 3, 1.4, 0, 0, Math.PI * 2), pink, 0.6); ratInk(g, () => g.ellipse(7, -1.5, 3, 1.4, 0, 0, Math.PI * 2), pink, 0.6); }
  else { for (const [fx, fy] of [[-11, by + 6], [9, by + 6], [14, by + 2]] as const) ratInk(g, () => g.ellipse(fx, fy, 2.6, 1.4, 0, 0, Math.PI * 2), pink, 0.6); }
  g.restore();
};

/** A sewer rat, feet at the origin, facing right: gray-brown, a scaly pink tail, pink ears and hands, red eyes. */
const drawRat = (c: Ctx, e: Enemy, f: number) => {
  const st = e.aiState, md: RatMood = e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok';
  const pose = st === 'crouch' ? 'crouch' : st === 'leap' || st === 'off' ? 'air' : 'sit';
  const fr = md !== 'ok' ? 0 : pose === 'crouch' ? Math.floor(f / 3) % 4 : Math.floor((f + (e.variant ?? 0) * 5) / 9) % 4;
  c.save();
  if (pose === 'air' && md === 'ok') c.rotate(Math.max(-0.6, Math.min(0.6, (e.vel.y ?? 0) * 0.08)));
  still(c, `lr-rat-${pose}-${fr}-${md}`, -38, -34, 60, 42, g => paintRat(g, pose, fr, md));
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
/** A chainsaw, held by its back handle at the origin, the bar out at angle `a`: the orange body stepped (its top cover's
 *  vents, the pull cord's grip, the wrap handle, the chain brake), the bar's steel lit along its top, the chain's teeth
 *  round it, the nose sprocket. */
const chainsaw = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-8, -4, 8, 8, 2), '#27272A', -8, -4, 8, 8, 0.8);
  part(g, () => g.roundRect(-4, -8, 18, 14, 3), '#EA7A1A', -4, -8, 18, 14, 1);
  for (let k = 0; k < 3; k++) px(g, k * 3, -7, 2, 3, '#7A3A0C');
  px(g, -2, -9, 9, 2, '#F4F4F0'); px(g, 10, -10, 3, 3, '#27272A');
  g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(5, -8); g.quadraticCurveTo(9, -14, 13, -8); g.stroke(); g.strokeStyle = '#3F3F46'; g.lineWidth = 1.2; g.stroke();
  part(g, () => g.roundRect(13, -3, 34, 6, [0, 3, 3, 0]), '#B8BEC6', 13, -3, 34, 6, 0.8);
  px(g, 14, -3, 32, 1, '#F1F5F9'); px(g, 14, 2, 32, 1, '#5A606A');
  for (let k = 14; k < 46; k += 3) { px(g, k, -4, 2, 1, k % 2 ? '#E5E7EB' : '#3F3F46'); px(g, k, 3, 2, 1, k % 2 ? '#3F3F46' : '#E5E7EB'); }
  px(g, 44, -1, 2, 2, '#5A606A');
  g.restore();
};
const CHECKS = ['#B91C1C', '#1F5A8A', '#3F6A2A', '#C2702A', '#5A2A6A'];
const HATS = ['#FACC15', '#F97316', '#F8FAFC', '#2EA86A', '#C81E1E'];
const paintLogger = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, check = pickOf(F.seed, 2, CHECKS), hat = pickOf(F.seed, 5, HATS);
  const vest = F.seed % 3 !== 1, glove = pickOf(F.seed, 4, ['#C8A070', '#3F3F46', '#E8B830']);
  // (jeans and boots, cut-resistant chaps over them: orange, quilted, a buckle at the thigh)
  legs(g, B, {
    col: '#3A4A68', shoe: 'boot', shoeCol: '#4A2E16',
    detail: (gg, hip, knee, foot, nearLeg) => {
      const col = nearLeg ? '#E06A1A' : '#B44E10';
      gg.save(); gg.strokeStyle = INK; gg.lineWidth = B.legW + 1.4; gg.lineCap = 'butt'; gg.beginPath(); gg.moveTo(hip[0] + 1.5, hip[1] + 2); gg.lineTo(knee[0] + 1.5, knee[1]); gg.lineTo(foot[0] + 1, foot[1] - 4); gg.stroke();
      gg.strokeStyle = col; gg.lineWidth = B.legW - 0.6; gg.stroke();
      gg.strokeStyle = nearLeg ? '#F2925A' : '#D06A2A'; gg.lineWidth = 1; gg.beginPath(); gg.moveTo(hip[0] - 0.5, hip[1] + 3); gg.lineTo(knee[0] - 0.5, knee[1]); gg.lineTo(foot[0] - 1, foot[1] - 5); gg.stroke();
      for (let k = 0.2; k < 1; k += 0.25) { const yy = hip[1] + (foot[1] - hip[1]) * k, xx = hip[0] + (foot[0] - hip[0]) * k; px(gg, xx - 1, yy, 4, 1, dk(col, 0.35)); }
      px(gg, hip[0] - 1, hip[1] + 4, 4, 2, '#26262C');
      gg.restore();
    },
  });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const fl = flailHands(B, F.fr);
  const far: [number, number] = fl ? fl[0] : up ? [B.w / 2 + 2, B.shY - 14] : sw ? [B.w / 2 + 12, B.shY + 10] : [B.w / 2 - 2, B.shY + 20];
  const near: [number, number] = fl ? fl[1] : up ? [B.w / 2 + 10, B.shY - 20] : sw ? [B.w / 2 + 18, B.shY + 12] : [B.w / 2 + 6, B.shY + 22];
  arm(g, B, -1, far[0], far[1], { sleeve: check, hand: glove });
  torso(g, B, check);
  // (the flannel's check: dark bands both ways, a lighter thread)
  for (let y = B.shY + 2; y < B.hipY; y += 6) { px(g, -B.w / 2 + 1, y, B.w - 2, 2, dk(check, 0.4)); px(g, -B.w / 2 + 1, y + 3, B.w - 2, 1, lt(check, 0.2)); }
  for (let x = -B.w / 2 + 3; x < B.w / 2 - 1; x += 6) px(g, x, B.shY + 2, 2, B.hipY - B.shY - 2, 'rgba(28, 18, 9, 0.35)');
  if (vest) {
    // (the hi-vis vest: lime, two silver bands)
    part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2 + 1, B.hipY); g.lineTo(B.hipW / 2 - 1, B.hipY); g.lineTo(B.w / 2 - 1, B.shY + 2); g.lineTo(3, B.shY + 9); g.lineTo(-3, B.shY + 9); g.closePath(); }, '#C8E632', -B.w / 2, B.shY + 2, B.w, B.hipY - B.shY, 1);
    px(g, -B.w / 2 + 2, B.shY + 14, B.w - 4, 2, '#E5E7EB'); px(g, -B.hipW / 2 + 2, B.hipY - 7, B.hipW - 4, 2, '#E5E7EB'); px(g, -B.w / 2 + 2, B.shY + 14, B.w - 4, 1, '#FFFFFF');
  } else {
    // (red suspenders over the flannel, a tape measure on the belt)
    px(g, -B.w / 2 + 4, B.shY + 1, 3, B.hipY - B.shY, '#B91C1C'); px(g, B.w / 2 - 7, B.shY + 1, 3, B.hipY - B.shY, '#B91C1C');
    px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#3A2414'); part(g, () => g.rect(B.hipW / 2 - 7, B.hipY - 4, 6, 6), '#F2C21A', B.hipW / 2 - 7, B.hipY - 4, 6, 6, 0.8);
  }
  // (sawdust on the shoulders)
  for (let k = 0; k < 5; k++) px(g, -B.w / 2 + 2 + ((F.seed * 7 + k * 5) % (B.w - 4)), B.shY + 1 + (k % 2), 1, 1, '#E8C890');
  hairBack(g, B, L.hair, 12);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: up || sw ? 'angry' : 'open', mouth: up || sw ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (the ear defenders on their band, the hard hat (a brim, a ridge, a mesh visor flipped up on some))
  part(g, () => g.roundRect(B.hx - 5, B.hy - 3, 7, 9, 2), '#EA7A1A', B.hx - 5, B.hy - 3, 7, 9, 0.8);
  px(g, B.hx - 3, B.hy - 11, 2, 9, '#27272A');
  partTop(g, () => g.ellipse(B.hx + 1, B.hy - 7, 10, 9, 0, Math.PI, 0), hat, B.hx - 9, B.hy - 16, 20, 9, 1);
  px(g, B.hx, B.hy - 16, 2, 9, lt(hat, 0.3));
  part(g, () => g.rect(B.hx - 11, B.hy - 8, 24, 3), dk(hat, 0.15), B.hx - 11, B.hy - 8, 24, 3, 1);
  if (F.seed % 2 === 0) { part(g, () => g.rect(B.hx - 9, B.hy - 15, 18, 5), '#3F3F46', B.hx - 9, B.hy - 15, 18, 5, 0.8); for (let k = 0; k < 6; k++) px(g, B.hx - 8 + k * 3, B.hy - 14, 1, 3, '#71717A'); }
  arm(g, B, 1, near[0], near[1], { sleeve: check, hand: glove });
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
