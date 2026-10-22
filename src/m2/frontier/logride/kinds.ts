// The log ride's own kinds. (No critters on the ride itself: only its obstacles hurt him there (the user's); the rats
// and the crows that were on it are gone.)

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
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
      e.vel.x = safeAhead(ctx, e, to, 12) ? to * 1.7 : 0;
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
        hurtPlayer(ctx, 13, 'm2:fr_chainsaw', { x: e.facing! * 6, y: -4 });
        playSound('gorespray', 0.6, 4);
      }
      if (e.aiTimer! >= 20) { set('after'); landed.delete(e); }
      break;
    }
    case 'after':
      e.vel.x *= 0.8;
      if (e.aiTimer! >= 30) set('near');
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
/** A logger's colors, as painted (chipperGore.ts: the bits of them out the woodchipper's chute). */
export const loggerColors = (e: Enemy) => { const s = loggerSeed(e); return { check: pickOf(s, 2, CHECKS), hat: pickOf(s, 5, HATS), vest: s % 3 !== 1, skin: lookOf(s).skin }; };
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
  kind: LOGGER, stats: { w: 38, h: 72, hp: 110, contact: 5, mass: 190 },
  ai: logger, draw: drawLogger, humanoid: true, head: { x: 1, y: -68, r: 10 },
  gender: e => (loggerWoman(e) ? 'f' : 'm'),
});
