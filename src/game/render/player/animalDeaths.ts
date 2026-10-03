// The animals' ways of killing him (see player/animalDeaths): him, drawn in his place, and the animal drawn doing it
// (its real self, posed and moved: the one in the world isn't drawn while it is).

import type { GameState } from '../../core/state';
import type { Enemy, EnemyKind, WeaponType } from '../../../types';
import type { MeatheadDeath } from '../../player/deathAnim';
import { MEATHEAD_DEATH_FRAMES } from '../../player/deathAnim';
import type { DeathFace } from './deathFace';
import { body } from './deathAnim';
import { pantsColor, pantsShadow, bootColor, bootToe, skinTone, skinShadow, skinHighlight } from './body';
import { drawKindEnemy, kindHead } from '../enemies/index';
import { drawMoose } from '../../stages/artie/mooseDraw';
import { drawBloodPool } from '../spatter';
import {
  AnimalDeathKind, THROAT_ON, THROAT_RIP, THROAT_OFF, EAT_BITES, EAT_GAG, EAT_SPIT, EAT_LEAVE, EAT_BURP, eatenAt, GORE_UP, goredX,
  HALVED_TOPPLE, halvedFeet, NUT_FOLD, SWELL_POP, swellLift, RAT_IN, RAT_MOUTH, RAT_OFF, GOAT_ON, GOAT_SCREAMS, BOWL_FALL, IGUANA_RAIN,
  STAMPS, DART_DOWN, PUNT_HIT, SIT_DOWN, SIT_ON, PEE_BACK, PEE_START, PEE_END,
} from '../../player/animalDeaths';

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const k = clamp01(v); return k * k * (3 - 2 * k); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Turn the canvas about (x, y). */
const about = (ctx: Ctx, x: number, y: number, rot: number, sx = 1, sy = 1) => { ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-x, -y); };
/** How far his middle sits off the floor, lying down. */
const LIFT = 14;

/** Is this the animal that's killing him (drawn by his death, not where it was)? */
export const animalInDeath = (state: GameState, e: Enemy) => state.deathTimer > 0 && !!state.meatheadDeath?.animal && state.meatheadDeath.animal.id === e.id;

/**
 * Him going over onto his back (k of the way), his head away from `side` (his front up), his feet at (px, fy); `cut`
 * (0..1) is how much of him, up from his feet, isn't there.
 */
const lying = (ctx: Ctx, state: GameState, d: MeatheadDeath, weapon: WeaponType, px: number, fy: number, side: number, k: number, face: DeathFace, cut = 0, from = 0) => {
  ctx.save();
  // (nothing of him through the floor: an arm, the gun)
  if (k > 0.5) { ctx.beginPath(); ctx.rect(px - 200, fy - 400, 400, 401); ctx.clip(); }
  ctx.translate(px - d.x, fy - d.y - k * LIFT);
  about(ctx, d.x, d.y, -side * k * Math.PI / 2);
  if (cut > 0 || from > 0) { ctx.beginPath(); ctx.rect(d.x - 40, d.y - 90 + from * 64, 80, 90 - (cut + from) * 64); ctx.clip(); }
  body(ctx, state, { ...d, facing: side < 0 ? -1 : 1 }, weapon, { deathFace: face, isGrounded: true });
  ctx.restore();
};
/** Where a point on him is, lying on his back (as `lying`, all the way over): `up` from his feet, `out` off his front. */
const onBack = (px: number, fy: number, side: number, up: number, out = 0) => ({ x: px - side * up, y: fy - LIFT - out });

/** The animal, posed: its real self, moved to (x, feet), turned, in the state that gives the pose. */
const beast = (ctx: Ctx, state: GameState, d: MeatheadDeath, x: number, feet: number, facing: number, aiState: string, extra: Partial<Enemy> = {}) => {
  const e = state.enemies.find(q => q.id === d.animal?.id);
  if (!e) return;
  const p = {
    ...e, pos: { x: x - e.width / 2, y: feet - e.height }, facing: facing < 0 ? -1 : 1, aiState, aiTimer: 0, vel: { x: 0, y: 0 },
    hitFlash: 0, frozenTimer: 0, isOnFire: false, isTased: false, isOiled: false, needleCount: 0, ...extra,
  } as Enemy;
  if (e.kind === 'moose') drawMoose(ctx, p, state.frame); else drawKindEnemy(ctx, p, state);
};
const kindOf = (state: GameState, d: MeatheadDeath): EnemyKind | undefined => state.enemies.find(q => q.id === d.animal?.id)?.kind;
/** Where its mouth is: from its feet, facing `facing`. */
const mouthOf = (kind: EnemyKind | undefined, facing: number) => {
  const h = kind ? kindHead(kind) : undefined;
  return h ? { x: facing * (h.x + h.r * 0.8), y: h.y + h.r * 0.4 } : { x: facing * 16, y: -14 };
};

/** A bloody stump end (lying, across him at `x`, `h` tall round `y`), the bone(s) in it. */
const stump = (ctx: Ctx, x: number, y: number, h: number, bones: number, brown = false) => {
  ctx.fillStyle = '#450A0A'; ctx.fillRect(Math.round(x - 3), Math.round(y - h / 2), 6, h);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(Math.round(x - 2), Math.round(y - h / 2 + 1), 4, h - 2);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(Math.round(x - 1), Math.round(y - h / 2 + 2), 2, h - 4);
  ctx.fillStyle = '#F5F5F4';
  for (let i = 0; i < bones; i++) { const by = Math.round(y - h / 4 + (bones > 1 ? i * h / 2 : h / 4) - 2); ctx.fillRect(Math.round(x - 1), by, 3, 3); ctx.fillStyle = '#D6D3D1'; ctx.fillRect(Math.round(x), by + 2, 2, 1); ctx.fillStyle = '#F5F5F4'; }
  if (brown) { ctx.fillStyle = '#713F12'; ctx.fillRect(Math.round(x - 2), Math.round(y + h / 2 - 5), 5, 4); ctx.fillStyle = '#A16207'; ctx.fillRect(Math.round(x - 1), Math.round(y + h / 2 - 4), 2, 1); }
};

/** A boot, lying on its side (for what's left of him, and what comes back up). */
const boot = (ctx: Ctx, x: number, y: number, facing: number, rot = 0) => {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(rot); ctx.scale(facing, 1);
  ctx.fillStyle = '#09090B'; ctx.fillRect(-6, -9, 10, 10); ctx.fillRect(-6, -3, 14, 4);
  ctx.fillStyle = bootColor; ctx.fillRect(-5, -8, 8, 8); ctx.fillRect(-5, -2, 12, 2);
  ctx.fillStyle = bootToe; ctx.fillRect(5, -2, 2, 1);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(-5, -8, 8, 1);
  ctx.fillStyle = pantsColor; ctx.fillRect(-5, -11, 8, 3); ctx.fillStyle = '#991B1B'; ctx.fillRect(-4, -12, 6, 1);
  ctx.restore();
};

/** A chunk of him, ragged, in something's jaws (his throat: the windpipe's pale ring in it). */
const chunk = (ctx: Ctx, x: number, y: number, s = 1) => {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(s, s);
  ctx.fillStyle = '#450A0A'; ctx.fillRect(-4, -3, 8, 6); ctx.fillRect(-5, -1, 10, 3);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-3, -2, 6, 4);
  ctx.fillStyle = skinShadow; ctx.fillRect(-3, -3, 5, 1);
  ctx.fillStyle = '#FBCFE8'; ctx.fillRect(-1, -1, 3, 2); ctx.fillStyle = '#B91C1C'; ctx.fillRect(0, -1, 1, 1);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(-1, 3, 1, 3); ctx.fillRect(2, 3, 1, 2);
  ctx.restore();
};

/** Legs, from the hip (at 0, 0) going `dir` (down his body), kicking by `kick`: pants and boots, as in the snow. */
const leg = (ctx: Ctx, x: number, y: number, rot: number) => {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(rot);
  ctx.fillStyle = '#0B1437'; ctx.fillRect(-5, -1, 10, 28);
  ctx.fillStyle = pantsColor; ctx.fillRect(-4, 0, 8, 26); ctx.fillStyle = pantsShadow; ctx.fillRect(1, 0, 3, 26);
  ctx.fillStyle = '#09090B'; ctx.fillRect(-6, 25, 12, 10);
  ctx.fillStyle = bootColor; ctx.fillRect(-5, 26, 10, 8); ctx.fillStyle = '#3F3F46'; ctx.fillRect(-5, 26, 10, 1); ctx.fillStyle = bootToe; ctx.fillRect(-5, 32, 2, 2);
  ctx.restore();
};

let sbuf: HTMLCanvasElement | null = null;
const SW = 200, SH = 160, SS = 2;

export const drawAnimalDeath = (ctx: Ctx, state: GameState, d: MeatheadDeath, weapon: WeaponType, t: number, f: number) => {
  const a = d.animal;
  if (!a) return;
  const { x, y, facing } = d;
  const fy = d.floor ?? y, side = a.side, kind = kindOf(state, d);
  switch (d.kind as AnimalDeathKind) {
    case 'throat': {
      // Bowled over onto his back; it's on his chest, at his throat; it rips it out and it's off with it
      const k = ease((t - 1) / 12);
      const shake = t > THROAT_ON && t < THROAT_RIP ? Math.sin(t * 2.2) * 1.2 : 0;
      const neck = onBack(x, fy, side, 48, 9);
      if (t > THROAT_RIP) drawBloodPool(ctx, neck.x, fy + 1, Math.round(8 + Math.min(30, (t - THROAT_RIP) * 0.6)), 77);
      ctx.save(); ctx.translate(shake, 0);
      lying(ctx, state, d, weapon, x, fy, side, k, t < THROAT_RIP ? (t < THROAT_ON ? 'scream' : 'agony') : 'dead');
      ctx.restore();
      // (the hole where it was)
      if (t >= THROAT_RIP) {
        ctx.fillStyle = '#450A0A'; ctx.fillRect(Math.round(neck.x - 4), Math.round(neck.y - 1), 8, 4);
        ctx.fillStyle = '#B91C1C'; ctx.fillRect(Math.round(neck.x - 3), Math.round(neck.y - 2), 6, 2);
        ctx.fillStyle = '#FBCFE8'; ctx.fillRect(Math.round(neck.x - 1), Math.round(neck.y), 2, 1);
      }
      // It: the leap on, worrying at him, the yank, the shake, and away
      const chest = onBack(x, fy, side, 26, 12);
      const ff = -side;
      if (t <= THROAT_ON) {
        const s = ease(t / THROAT_ON);
        beast(ctx, state, d, lerp(a.x, chest.x, s), lerp(a.y, chest.y, s) - Math.sin(s * Math.PI) * 28, ff, 'lunge', { vel: { x: ff, y: -1 } });
      } else if (t < THROAT_RIP) {
        beast(ctx, state, d, chest.x, chest.y + (t % 6 < 3 ? 2 : 0), ff, 'bristle');
      } else {
        const off = t > THROAT_OFF ? (t - THROAT_OFF) * 5 : 0;
        const bx = chest.x + side * (Math.min(8, (t - THROAT_RIP) * 2) + off);
        const by = off > 0 ? Math.min(fy, chest.y + off * 0.6) : chest.y;
        const goFacing = t > THROAT_OFF ? side : ff;
        ctx.save();
        if (t < THROAT_OFF) about(ctx, bx, by, Math.sin((t - THROAT_RIP) * 0.9) * 0.18 * (1 - (t - THROAT_RIP) / 40));
        beast(ctx, state, d, bx, by, goFacing, t > THROAT_OFF ? 'lunge' : 'idle', t > THROAT_OFF ? { vel: { x: side * 5, y: 0 } } : {});
        const m = mouthOf(kind, goFacing);
        chunk(ctx, bx + m.x, by + m.y + 2);
        ctx.restore();
      }
      break;
    }
    case 'eaten': {
      // Down on his back, his feet in its jaws; then a bite at a time, up him (the cut where it's got to), it right there
      const k = ease(t / 10), slide = Math.min(10, t * 1.2);
      const px = x + side * slide;
      const cut = eatenAt(d, t);
      const face: DeathFace = t < 90 ? 'scream' : 'agony';
      drawBloodPool(ctx, px - side * cut * 60, fy + 1, Math.round(10 + Math.min(34, t * 0.3)), 31);
      if (cut < 1) {
        lying(ctx, state, d, weapon, px, fy, side, k, d.shat && t > EAT_LEAVE + 20 ? 'dead' : face, cut);
        if (cut > 0) { const c = onBack(px, fy, side, cut * 64); stump(ctx, c.x, c.y - 1, cut < 0.46 ? 20 : 24, cut < 0.46 ? 2 : 1, d.shat && cut >= 0.44); }
      }
      // It, at the end of what's left of him
      const cutX = onBack(px, fy, side, cut * 64).x;
      const bites = EAT_BITES.map(b => b[0]).filter(at => !(d.shat && at > EAT_GAG));
      const next = bites.find(at => at > t), last = [...bites].reverse().find(at => at <= t);
      const reach = (kind ? 46 : 40) - 6;
      let gx = cutX + side * reach, st = 'rest', rot = 0, gfacing = -side;
      if (next !== undefined && next - t <= 8) { st = 'feed'; gx += side * (next - t) * 1.5; }
      else if (last !== undefined && t - last < 10) { st = 'idle'; rot = -Math.sin((t - last) / 10 * Math.PI) * 0.18; }
      if (d.shat && t >= EAT_GAG) {
        // (the shorts: it gags, rolls, spits it out, and it's off back where it came from)
        gx = cutX + side * (reach + Math.min(16, (t - EAT_GAG) * 2));
        st = t < EAT_SPIT ? 'chomp' : t < EAT_SPIT + 10 ? 'feed' : 'rest';
        if (t >= EAT_LEAVE) { gfacing = side; gx += side * (t - EAT_LEAVE) * 3; st = 'ashore'; }
      }
      if (!d.shat && t >= EAT_BURP - 6 && t < EAT_BURP + 12) st = 'feed';
      ctx.save();
      if (rot) about(ctx, gx - gfacing * 40, fy - 10, gfacing * rot);
      beast(ctx, state, d, gx, fy, gfacing, st);
      ctx.restore();
      // (and up comes a boot)
      if (!d.shat && t >= EAT_BURP) {
        const s = t - EAT_BURP, mx = gx - side * 44, my = fy - 14;
        const bx = mx - side * Math.min(34, s * 2.4), by = Math.min(fy - 1, my - s * 4 + 0.35 * s * s);
        boot(ctx, bx, by, -side, by >= fy - 1 ? side * 1.4 : s * 0.5 * side);
      }
      break;
    }
    case 'gored': {
      // Hooked up onto its horns, through his middle, and carried off at a trot, flailing
      const sx = goredX(d, t), dir = a.dir, lift = ease(t / GORE_UP);
      const tipX = sx + dir * 16, tipY = a.y - 60 + (t > GORE_UP && Math.floor(t / 6) % 2 ? 2 : 0);
      beast(ctx, state, d, sx, a.y, dir, 'charge');
      // Him, on his back across the horn, his head out past it, legs over its face
      const s = -dir, px = lerp(x, tipX + s * 30, lift), py = lerp(y, tipY - 18 + LIFT, lift);
      ctx.save();
      if (t > GORE_UP) about(ctx, tipX, tipY, Math.sin(t * 0.55) * 0.14);
      lying(ctx, state, d, weapon, px, py, s, lift, 'scream');
      ctx.restore();
      // (and the point of it, up out of his belly, bloody)
      if (t > 2) {
        // (in at his back, where the horn is; out of his belly, a hand's width above it)
        const up = Math.min(1, t / GORE_UP) * 10, ox = tipX, oy = tipY - 32;
        ctx.save(); if (t > GORE_UP) about(ctx, tipX, tipY, Math.sin(t * 0.55) * 0.14);
        ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.moveTo(ox - 4, oy + 2); ctx.lineTo(ox + 4, oy + 2); ctx.lineTo(ox + dir * 3, oy - 4 - up); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#E7E5E4'; ctx.beginPath(); ctx.moveTo(ox - 3, oy + 2); ctx.lineTo(ox + 3, oy + 2); ctx.lineTo(ox + dir * 3, oy - 3 - up); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#A8A29E'; ctx.fillRect(ox + (dir > 0 ? 0 : -2), oy - up * 0.5, 2, 3);
        ctx.fillStyle = '#B91C1C'; ctx.fillRect(ox - 3, oy - 1, 6, 3); ctx.fillRect(ox - 1 + dir, oy - 3 - up * 0.6, 2, 3);
        ctx.fillStyle = '#7F1D1D'; ctx.fillRect(ox - 5, oy + 1, 10, 2);
        ctx.restore();
      }
      break;
    }
    case 'halved': {
      // His legs, stood there spurting, then over; his top half off in its jaws
      const feet = halvedFeet(d, t), fall = clamp01((t - HALVED_TOPPLE) / 12), dir = a.dir;
      const WAIST = 30;
      ctx.save();
      ctx.translate(0, feet - y);
      about(ctx, x, y, -dir * fall * fall * Math.PI / 2);
      if (t < HALVED_TOPPLE) ctx.translate(Math.sin(t * 0.7) * 1.5 * (t / HALVED_TOPPLE), 0);
      ctx.save(); ctx.beginPath(); ctx.rect(x - 40, y - WAIST, 80, WAIST + 4); ctx.clip();
      body(ctx, state, d, weapon, { deathFace: 'dead' });
      ctx.restore();
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x - 11, y - WAIST - 2, 22, 4);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 9, y - WAIST - 3, 18, 2);
      ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x - 2, y - WAIST - 5, 4, 3);
      ctx.restore();
      if (fall >= 1) drawBloodPool(ctx, x - dir * 30, (d.floor ?? y) + 1, Math.round(Math.min(34, (t - HALVED_TOPPLE) * 0.8)), 141);
      // It, going on the way it was, his top half in its jaws, dangling
      const kx = a.x + dir * t * 8, ky = a.y - t * 1.2 + Math.sin(t * 0.25) * 4;
      const m = { x: kx + dir * 34, y: ky - a.h * 0.45 };
      ctx.save();
      ctx.translate(m.x - x, m.y - (y - WAIST));
      about(ctx, x, y - WAIST, -dir * (0.9 + Math.sin(t * 0.4) * 0.25));
      ctx.beginPath(); ctx.rect(x - 40, y - 100, 80, 100 - WAIST); ctx.clip();
      body(ctx, state, d, weapon, { deathFace: 'scream', isGrounded: false });
      ctx.restore();
      beast(ctx, state, d, kx, ky, dir, 'bite');
      break;
    }
    case 'nutcracked': {
      // The crab on his crotch: hopping about with it, then folding, face first, it still hanging on
      const hop = t < NUT_FOLD ? Math.abs(Math.sin(t * Math.PI / 16)) * 22 : 0;
      const fold = ease((t - NUT_FOLD) / 22);
      const F = side;
      ctx.save();
      if (fold > 0.5) { ctx.beginPath(); ctx.rect(x - 200, y - 400, 400, 401); ctx.clip(); }
      ctx.translate(Math.sin(t * 0.2) * 6 * (t < NUT_FOLD ? 1 : 0), -hop);
      // (knees first: down a little, then over on his face)
      ctx.translate(0, fold * 6);
      about(ctx, x, y, F * fold * Math.PI / 2 * 0.98);
      if (fold > 0) ctx.translate(-F * fold * 16, 0);
      body(ctx, state, { ...d, facing: F }, weapon, { deathFace: t < 6 ? 'shock' : t < NUT_FOLD + 18 ? 'agony' : 'dead', isGrounded: hop < 1, isDucking: false });
      // The crab, clamped on, swinging; waving its other claw
      const cx = x + F * 14, cy = y - 22;
      ctx.translate(cx, cy); ctx.rotate(-F * (0.9 + Math.sin(t * 0.5) * 0.25)); ctx.translate(-cx, -cy);
      beast(ctx, state, d, cx + F * 2, cy + 12, -F, t % 20 < 10 ? 'pinch' : 'idle');
      ctx.restore();
      break;
    }
    case 'swollen': {
      // Purple, swelling, eyes out on stalks, up off his feet; and pop (the particles have it)
      beast(ctx, state, d, a.x, a.y, -side, kind === 'rattlesnake' ? 'rattle' : 'pinch');
      if (t >= SWELL_POP || typeof document === 'undefined') break;
      const k = clamp01(t / (SWELL_POP - 6));
      const ox = x - SW / 2, oy = y - SH + 20;
      sbuf ??= document.createElement('canvas');
      if (sbuf.width < SW * SS || sbuf.height < SH * SS) { sbuf.width = SW * SS; sbuf.height = SH * SS; }
      const g = sbuf.getContext('2d')!;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, SW * SS, SH * SS);
      g.setTransform(SS, 0, 0, SS, -ox * SS, -oy * SS);
      body(g, state, d, weapon, { deathFace: t < 20 ? 'shock' : 'agony' });
      // (the venom: purple coming up through him, deeper as it goes, the veins of it)
      g.globalCompositeOperation = 'source-atop';
      g.fillStyle = `rgba(88, 28, 135, ${(0.15 + k * 0.5).toFixed(2)})`; g.fillRect(ox, oy, SW, SH);
      g.fillStyle = `rgba(192, 132, 252, ${(k * 0.25).toFixed(2)})`; g.fillRect(ox, y - 66, SW, 10);
      g.globalCompositeOperation = 'source-over';
      g.setTransform(1, 0, 0, 1, 0, 0);
      const mid = y - 34, lift = swellLift(t), wob = Math.sin(t * 0.5) * 0.06 * k;
      const sxk = 1 + 0.95 * k * k + Math.sin(t * 0.9) * 0.03 * k, syk = 1 + 0.35 * k * k;
      ctx.save();
      ctx.translate(0, -lift);
      about(ctx, x, mid, wob, sxk, syk);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sbuf, 0, 0, SW * SS, SH * SS, ox, oy, SW, SH);
      // (his eyes, bulging)
      const eye = 1.5 + k * 3.2;
      for (const ex of [3, 9]) {
        ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(x + facing * ex, y - 55, eye + 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(x + facing * ex, y - 55, eye, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#B91C1C'; ctx.fillRect(Math.round(x + facing * ex - eye * 0.6), Math.round(y - 55), 1, 1);
        ctx.fillStyle = '#1C1917'; ctx.fillRect(Math.round(x + facing * (ex + 1) - 1), Math.round(y - 56), 2, 2);
      }
      ctx.restore();
      break;
    }
    case 'ratted': {
      // Into his boot; a lump going up him; out of his mouth; over he goes; it sits on him, then it's off
      const F = facing;
      const over = ease((t - RAT_MOUTH - 4) / 12);
      const up = t > RAT_IN && t < RAT_MOUTH ? (t - RAT_IN) / (RAT_MOUTH - RAT_IN) : t >= RAT_MOUTH ? 1 : 0;
      // (the lump's way up him: in his own frame, out off his front and up from his feet)
      const PATH: [number, number][] = [[2, 4], [3, 16], [4, 28], [9, 34], [10, 42], [8, 48], [10, 54]];
      const seg = Math.min(PATH.length - 2, Math.floor(up * (PATH.length - 1))), sk = up * (PATH.length - 1) - seg;
      const lu = lerp(PATH[seg][0], PATH[seg + 1][0], sk), lv = lerp(PATH[seg][1], PATH[seg + 1][1], sk);
      const atCrotch = lv > 24 && lv < 34;
      ctx.save();
      if (over > 0) { lying(ctx, state, d, weapon, x, fy, F, over, t < RAT_MOUTH + 10 ? 'scream' : 'dead'); }
      else {
        ctx.translate(Math.sin(t * 1.3) * (t > RAT_IN ? 1.5 : 0), atCrotch ? -Math.abs(Math.sin(t * 0.6)) * 8 : 0);
        body(ctx, state, d, weapon, { deathFace: t >= RAT_MOUTH - 2 ? 'scream' : atCrotch ? 'shock' : 'agony' });
        // (the lump: under the pants, or the skin)
        if (t > RAT_IN && t < RAT_MOUTH) {
          const wx = x + F * lu + Math.sin(t * 1.7) * 1.5, wy = y - lv;
          const pants = lv < 31;
          ctx.fillStyle = pants ? '#0B1437' : '#7C4A1E'; ctx.beginPath(); ctx.ellipse(wx, wy + 0.5, 6.6, 5.4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = pants ? pantsShadow : skinShadow; ctx.beginPath(); ctx.ellipse(wx, wy + 1, 5.6, 4.4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = pants ? pantsColor : skinTone; ctx.beginPath(); ctx.ellipse(wx - 0.5, wy - 0.5, 4.4, 3.2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = pants ? '#3B5BB5' : skinHighlight; ctx.fillRect(Math.round(wx - 2), Math.round(wy - 3), 3, 1);
        }
      }
      ctx.restore();
      // It: to his boot and in; out of his mouth and down; on his belly; off
      if (t < RAT_IN) {
        const s = t / RAT_IN;
        beast(ctx, state, d, lerp(a.x, x + side * 4, s), a.y, -side, 'lunge');
      } else if (t >= RAT_MOUTH) {
        const s = t - RAT_MOUTH;
        const mouth = { x: x + F * 10, y: y - 55 };
        const belly = onBack(x, fy, F, 34, 12);
        if (s < 14) {
          // (squeezing out, then a hop down onto him)
          const k2 = ease(s / 14);
          beast(ctx, state, d, lerp(mouth.x + F * 6, belly.x, k2), lerp(mouth.y + 6, belly.y, k2) - Math.sin(k2 * Math.PI) * 16, F, 'lunge', { vel: { x: F, y: -1 } });
        } else if (t < RAT_OFF) {
          beast(ctx, state, d, belly.x, belly.y, s % 30 < 15 ? F : -F, 'idle');
        } else {
          const r = t - RAT_OFF;
          beast(ctx, state, d, belly.x + F * r * 6, Math.min(fy, belly.y + r * 2), F, 'lunge');
        }
      }
      break;
    }
    case 'goated': {
      // Butted back flat; it hops up on his chest, and screams
      const k = ease(t / 12), px = x - side * Math.min(36, t * 3);
      lying(ctx, state, d, weapon, px, fy, side, k, t < 12 ? 'agony' : 'dead');
      const chest = onBack(px, fy, side, 30, 12);
      const ff = -side;
      if (t < 12) beast(ctx, state, d, a.x, a.y, ff, 'skid');
      else if (t < GOAT_ON) {
        const s = ease((t - 12) / (GOAT_ON - 12));
        beast(ctx, state, d, lerp(a.x, chest.x, s), lerp(a.y, chest.y, s) - Math.sin(s * Math.PI) * 30, ff, 'charge', { vel: { x: 0, y: -1 } });
      } else {
        const screaming = GOAT_SCREAMS.some(s => t >= s && t < s + 26);
        const jit = screaming ? (t % 2 ? 1 : -1) : 0;
        // (facing out at you, as it screams: head up, then back to him)
        const gf = screaming ? side : ff;
        beast(ctx, state, d, chest.x + jit, chest.y, gf, 'idle');
        if (screaming) {
          const h = kind ? kindHead(kind) : { x: 24, y: -40, r: 8 };
          const mx = chest.x + gf * (h.x + h.r), my = chest.y + h.y + 2;
          ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 3;
          const burst = () => { ctx.beginPath(); for (let i = 0; i < 3; i++) { const a0 = -0.9 + i * 0.6, r0 = 8, r1 = 18 + ((t + i * 3) % 5); ctx.moveTo(mx + gf * Math.cos(a0) * r0, my + Math.sin(a0) * r0); ctx.lineTo(mx + gf * Math.cos(a0 + 0.12) * (r0 + r1) * 0.6, my + Math.sin(a0 - 0.1) * (r0 + r1) * 0.6); ctx.lineTo(mx + gf * Math.cos(a0) * (r0 + r1), my + Math.sin(a0) * (r0 + r1)); } ctx.stroke(); };
          burst(); ctx.strokeStyle = t % 4 < 2 ? '#FDE047' : '#FFFFFF'; ctx.lineWidth = 1.4; burst();
        }
      }
      break;
    }
    case 'bowled': {
      // Wobbling like a pin, then over flat on his face, away from it; it rolls on past, uncurls, and goes
      const F = -side;
      const wob = t < BOWL_FALL ? Math.sin(t * 0.7) * 0.28 * Math.min(1, t / 8) : 0;
      const fall = ease((t - BOWL_FALL) / 10);
      if (fall > 0.9) drawBloodPool(ctx, x + F * 56, fy + 1, Math.round(Math.min(26, (t - BOWL_FALL) * 0.7)), 99);
      ctx.save();
      if (fall > 0.5) { ctx.beginPath(); ctx.rect(x - 200, fy - 400, 400, 401); ctx.clip(); }
      about(ctx, x - F * 6 * Math.sign(wob), y, wob + F * fall * fall * Math.PI / 2);
      if (fall > 0) ctx.translate(-F * fall * 14, 0);
      body(ctx, state, { ...d, facing: F > 0 ? 1 : -1 }, weapon, { deathFace: t < BOWL_FALL + 8 ? 'shock' : 'dead' });
      ctx.restore();
      const rollTo = x + F * 80, rx = t < 16 ? lerp(a.x, rollTo, t / 16) : t < 70 ? rollTo : rollTo + F * (t - 70) * 7;
      beast(ctx, state, d, rx, a.y, F, t < 16 || t >= 70 ? 'lunge' : 'idle');
      break;
    }
    case 'iguanas': {
      // One on his head; he looks up; and down they come, a pile of them on him, wriggling, his boots out the end
      const k = ease((t - IGUANA_RAIN[1]) / 10);
      if (k <= 0) body(ctx, state, d, weapon, { deathFace: 'shock' });
      else lying(ctx, state, d, weapon, x, fy, side, k, 'agony');
      if (t < IGUANA_RAIN[1]) beast(ctx, state, d, x, y - 60 + (t < 4 ? -(4 - t) * 6 : 0), side, 'whip');
      const SLOTS: [number, number][] = [[-30, 0], [-6, 0], [-18, -10], [-42, -6], [6, -8], [-28, -20], [-8, -22], [-40, -30], [-20, -36]];
      IGUANA_RAIN.forEach((at, i) => {
        if (t < at - 12) return;
        const [sx, sy] = SLOTS[i];
        const gx = x + side * sx, gy = fy + sy;
        const fallK = clamp01((t - (at - 12)) / 12);
        const py = lerp(state.camera.y - 30, gy, fallK * fallK);
        const wr = t > at && (t + i * 7) % 24 < 3 ? 1 : 0;
        beast(ctx, state, d, gx + wr, py, i % 2 ? side : -side, fallK < 1 ? 'drop' : (t + i * 5) % 40 < 20 ? 'scurry' : 'idle');
      });
      break;
    }
    case 'stomped': {
      // Rearing and coming down on him, three times; him flatter every time, in the snow
      const mf = a.dir;
      const mx = lerp(a.x, x - side * 34 - mf * 36, ease(t / 12));
      const n = STAMPS.filter(s => t >= s).length;
      const sq = [1, 0.62, 0.38, 0.2][n] * (STAMPS.some(s => t >= s && t < s + 3) ? 0.85 : 1);
      const k = ease(t / 10);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)'; ctx.beginPath(); ctx.ellipse(x - side * 30, fy + 1, 30 + n * 6, 3 + n, 0, 0, Math.PI * 2); ctx.fill();
      if (n > 0) drawBloodPool(ctx, x - side * 30, fy + 2, 12 + n * 10, 13);
      ctx.save();
      about(ctx, x - side * 30, fy, 0, 1 + (1 - sq) * 0.3, sq);
      lying(ctx, state, d, weapon, x, fy, side, k, n === 0 ? 'scream' : 'dead');
      // (hoofprints)
      ctx.fillStyle = 'rgba(30, 27, 24, 0.75)';
      for (let i = 0; i < n; i++) { const hx = x - side * (14 + i * 18); ctx.fillRect(hx - 4, fy - LIFT - 14, 3, 6); ctx.fillRect(hx + 1, fy - LIFT - 14, 3, 6); }
      ctx.restore();
      const next = STAMPS.find(s => t < s);
      const at = next !== undefined ? next - 18 : 0;
      const pose = next !== undefined && t >= at ? 'stomp' : t > STAMPS[2] + 24 ? 'retreat' : 'skid';
      beast(ctx, state, d, mx, a.y, mf, pose, { aiTimer: Math.max(0, t - at) });
      break;
    }
    case 'lawndart': {
      // Tossed up off its antlers and out of sight; down he comes head first, stuck to his belt, kicking; a sniff
      const mf = side < 0 ? 1 : -1;
      const out = mf; // (he lands off its nose)
      const lx = x + out * 30;
      let mx = a.x, pose = t < 30 ? 'heave' : 'paw', aiT = t;
      if (t > DART_DOWN + 24) { const s = clamp01((t - DART_DOWN - 24) / 14); mx = lerp(a.x, lx - mf * 104, ease(s)); pose = s < 1 ? 'retreat' : 'sniff'; aiT = 0; }
      if (t < 12) {
        ctx.save(); ctx.translate(out * t * 1.2, -t * t * 1.5); about(ctx, x, y - 32, out * t * 0.4);
        body(ctx, state, d, weapon, { deathFace: 'scream', isGrounded: false });
        ctx.restore();
      } else if (t >= DART_DOWN - 10 && t < DART_DOWN) {
        const s = (t - (DART_DOWN - 10)) / 10, fyy = lerp(fy - 500, fy, s * s);
        ctx.save(); ctx.translate(lx - x, fyy - fy - 30); about(ctx, x, fy, Math.PI);
        body(ctx, { ...state, blocks: [] } as GameState, { ...d, y: fy }, weapon, { deathFace: 'scream', isGrounded: false });
        ctx.restore();
      } else if (t >= DART_DOWN) {
        // (stuck: his legs up out of the snow, kicking, slower and slower; a twitch)
        const s = t - DART_DOWN, kick = s > 70 && s < 74 ? 0.5 : Math.sin(s * 0.7) * 0.5 * (1 - clamp01((s - 10) / 50));
        for (const leg2 of [-1, 1]) leg(ctx, lx + leg2 * 5, fy - 10, Math.PI + leg2 * (0.12 + (leg2 > 0 ? kick : -kick)));
        ctx.fillStyle = '#7F1D1D'; ctx.fillRect(lx - 9, fy - 12, 18, 4);
        ctx.fillStyle = '#F1F5F9'; ctx.beginPath(); ctx.ellipse(lx, fy, 22, 7, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#CBD5E1'; ctx.beginPath(); ctx.ellipse(lx + 5, fy, 14, 4, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(lx - 16, fy - 5, 3, 2); ctx.fillRect(lx + 10, fy - 6, 3, 2);
      }
      beast(ctx, state, d, mx, a.y, mf, pose, { aiTimer: aiT, vel: { x: pose === 'retreat' ? mf * 4 : 0, y: 0 } });
      break;
    }
    case 'punted': {
      // It kicks; he's gone (at you: see the screen); it stands there
      beast(ctx, state, d, a.x, a.y, -a.dir, t < 30 ? 'kick' : 'retreat', { aiTimer: t });
      if (t < 2) body(ctx, state, d, weapon, { deathFace: 'scream' });
      break;
    }
    case 'satOn': {
      // Bucked off onto his back; it backs up over him and sits, rump first, his legs kicking out from under it
      const lx = x - side * 46, ly = Math.min(fy, y + 0.5 * 0.9 * t * t - 9 * t);
      const k = ease(t / SIT_DOWN);
      const head = side; // (his head toward it: under its rump)
      const hip = onBack(lerp(x, lx, k), t < SIT_DOWN ? ly : fy, -head, 30);
      if (t < SIT_DOWN) lying(ctx, state, d, weapon, lerp(x, lx, k), ly, -head, k, 'scream');
      else {
        lying(ctx, state, d, weapon, lx, fy, -head, 1, t < SIT_ON ? 'scream' : 'dead', 0, 30 / 64);
        // (his legs, kicking, out from his hips the other way)
        const s = t - SIT_ON, kick = t < SIT_ON ? 0.3 * Math.sin(t * 0.5) : s > 60 && s < 64 ? 0.5 : Math.sin(s * 0.6) * 0.55 * (1 - clamp01((s - 20) / 50));
        for (const l of [-1, 1]) leg(ctx, hip.x, hip.y - 2 + l * 2, head * (Math.PI - 0.75 + (l > 0 ? kick : -kick * 0.7) * 0.8));
      }
      const mf = side;
      const target = hip.x + mf * 66 + side * 6;
      const s2 = clamp01((t - SIT_DOWN) / (SIT_ON - SIT_DOWN - 8));
      const mx = t < SIT_DOWN ? a.x : lerp(a.x, target, ease(s2));
      const sitting = t >= SIT_ON - 8;
      const drop = sitting ? Math.min(22, (t - (SIT_ON - 8)) * 3) : 0;
      const pose = t < SIT_DOWN ? 'buck' : sitting ? 'sit' : 'retreat';
      beast(ctx, state, d, mx, a.y + drop, mf, pose, { aiTimer: t, vel: { x: pose === 'retreat' ? -mf * 3 : 0, y: 0 } });
      break;
    }
    case 'peedOn': {
      // Run over flat; it skids, comes back, stands over him and goes; then it's off
      const mf = a.dir;
      const sq = t < 4 ? 0.45 - t * 0.05 : 0.26;
      drawBloodPool(ctx, x + side * 28, fy + 2, Math.round(16 + Math.min(20, t * 0.5)), 57);
      // (the yellow in the snow, spreading)
      if (t > PEE_START + 6) { const r = Math.min(30, (t - PEE_START - 6) * 0.7); ctx.fillStyle = 'rgba(234, 179, 8, 0.55)'; ctx.beginPath(); ctx.ellipse(x + side * 26, fy + 1, r, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(253, 224, 71, 0.6)'; ctx.beginPath(); ctx.ellipse(x + side * 22, fy, r * 0.5, 1.5, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.save();
      about(ctx, x, fy, 0, 1.25, 1);
      ctx.translate(0, fy); ctx.scale(1, sq * 1.7); ctx.translate(0, -fy);
      lying(ctx, state, d, weapon, x, fy, -side, 1, 'dead');
      ctx.fillStyle = 'rgba(30, 27, 24, 0.75)';
      for (let i = 0; i < 3; i++) { const hx = x + side * (12 + i * 16); ctx.fillRect(hx - 4, fy - LIFT - 14, 3, 6); ctx.fillRect(hx + 1, fy - LIFT - 14, 3, 6); }
      ctx.restore();
      const skid = a.x + mf * 170 * (1 - Math.exp(-t / 7));
      const over = x + side * 26 - (-mf) * 4;
      let mx = skid, mfx: number = mf, pose = 'skid', vx = 0;
      if (t > 24) { mfx = -mf; const s = clamp01((t - 24) / (PEE_BACK - 24)); mx = lerp(a.x + mf * 170 * (1 - Math.exp(-24 / 7)), over, ease(s)); pose = s < 1 ? 'retreat' : 'paw'; vx = s < 1 ? -mf * 3 : 0; }
      if (t > PEE_END + 10) { mfx = mf; mx = over + mf * (t - PEE_END - 10) * 4; pose = 'retreat'; vx = mf * 4; }
      beast(ctx, state, d, mx, a.y, mfx, pose, { aiTimer: 0, vel: { x: vx, y: 0 } });
      // (the stream: from under its belly, down onto him, wobbling)
      if (t >= PEE_START && t < PEE_END) {
        const sx = mx - mfx * 4, sy = a.y - 44, ex = x + side * 26 + Math.sin(t * 0.4) * 4, ey = fy - 6;
        const thin = t > PEE_END - 10 ? 2 : 3;
        for (let i = 0; i <= 12; i++) {
          const k2 = i / 12, px = lerp(sx, ex, k2), py = lerp(sy, ey, k2) - Math.sin(k2 * Math.PI) * 6 + Math.sin(t * 0.9 + i) * 0.6;
          ctx.fillStyle = i % 3 ? '#FDE047' : '#EAB308'; ctx.fillRect(Math.round(px), Math.round(py), thin, 3);
        }
        for (let i = 0; i < 3; i++) { ctx.fillStyle = '#FEF08A'; ctx.fillRect(Math.round(ex - 6 + ((t * 3 + i * 5) % 12)), Math.round(ey - 3 - ((t + i * 4) % 5)), 1, 1); }
      }
      break;
    }
  }
};

/** (punted) Him, at you: up out of the world, bigger and bigger, spinning, into the screen; face first on the glass,
 * cracking it; and sliding down it, slowly, squeaking, leaving the smear. Screen space, over everything. */
export const drawAnimalDeathScreen = (ctx: Ctx, state: GameState, width: number, height: number, weapon: WeaponType) => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== 'punted' || state.deathTimer <= 0) return;
  const t = Math.min(state.deathScene?.t ?? 9999, MEATHEAD_DEATH_FRAMES.punted);
  if (t < 2) return;
  const sx0 = d.x - state.camera.x, sy0 = d.y - 32 - state.camera.y;
  const hitX = width / 2 + (d.animal?.dir ?? 1) * 60, hitY = height * 0.42;
  ctx.save();
  if (t < PUNT_HIT) {
    const k = (t - 2) / (PUNT_HIT - 2), s = 1 + k * k * 5;
    const cx = lerp(sx0, hitX, k), cy = lerp(sy0, hitY, k) - Math.sin(k * Math.PI) * 60;
    ctx.translate(cx, cy); ctx.rotate((d.animal?.dir ?? 1) * k * 7); ctx.scale(s, s);
    body(ctx, { ...state, blocks: [] } as GameState, { ...d, x: 0, y: 32 }, weapon, { deathFace: 'scream', isGrounded: false });
  } else {
    // On the glass: the cracks out from where he hit, the smear down from it, and him, flattened, sliding down
    const s = t - PUNT_HIT, slide = s < 12 ? 0 : (s - 12) ** 1.35 * 0.9;
    // (him, spread out on it, face to the glass; the glass, and what's on it, in front of him)
    ctx.save();
    ctx.translate(hitX, hitY + slide); ctx.scale(6.4, 5.2); ctx.rotate(-0.08); ctx.scale(1.25, 0.9);
    body(ctx, { ...state, blocks: [] } as GameState, { ...d, x: 0, y: 32, facing: 1 }, weapon, { deathFace: 'dead', isGrounded: false });
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const ang = i * 0.7 + 0.3, r1 = 50 + ((i * 37) % 60), r2 = r1 + 40 + ((i * 53) % 50);
      ctx.moveTo(hitX + Math.cos(ang) * 14, hitY + Math.sin(ang) * 14); ctx.lineTo(hitX + Math.cos(ang + 0.08) * r1, hitY + Math.sin(ang + 0.08) * r1); ctx.lineTo(hitX + Math.cos(ang - 0.05) * r2, hitY + Math.sin(ang - 0.05) * r2);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let r = 26; r < 80; r += 24) { ctx.moveTo(hitX + r, hitY); for (let a = 0; a <= 8; a++) ctx.lineTo(hitX + Math.cos(a / 8 * Math.PI * 2) * r * (0.9 + (a % 3) * 0.06), hitY + Math.sin(a / 8 * Math.PI * 2) * r * (0.9 + (a % 2) * 0.08)); }
    ctx.stroke();
    // (the smear: banded, the streaks in it)
    // (the smear: the splat where he hit, and streaks down from it as far as he's slid, running on below)
    const splat = (cx: number, cy: number, r: number, c: string) => { ctx.fillStyle = c; ctx.beginPath(); for (let i = 0; i < 12; i++) { const ang = i / 12 * Math.PI * 2, rr = r * (i % 2 ? 0.7 : 1) * (1 + ((i * 7) % 5) * 0.08); ctx.lineTo(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr); } ctx.closePath(); ctx.fill(); };
    splat(hitX, hitY - 100, 30, 'rgba(127, 29, 29, 0.7)'); splat(hitX + 4, hitY - 102, 20, 'rgba(185, 28, 28, 0.6)');
    for (let i = 0; i < 6; i++) {
      const sx = hitX - 26 + i * 10 + ((i * 7) % 5), len = slide + 14 + ((i * 17) % 26) + Math.min(40, s * ((i % 3) + 1) * 0.3);
      ctx.fillStyle = i % 2 ? 'rgba(127, 29, 29, 0.75)' : 'rgba(185, 28, 28, 0.65)'; ctx.fillRect(sx, hitY - 95, 4 + (i % 2) * 2, len);
      ctx.fillStyle = 'rgba(220, 38, 38, 0.7)'; ctx.fillRect(sx, hitY - 95 + len - 2, 5 + (i % 2) * 2, 4);
    }
  }
  ctx.restore();
};

void EAT_BURP;
