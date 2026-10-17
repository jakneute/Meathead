// What the streets' cast throw and fire at him (every pavilion's, one list: they flow into each other). Each kind its
// own way of flying, its own hurt source (the lines: each pavilion's lines.ts HURT, registered in its kinds.ts):
//
//   note       a mariachi's trumpet blast: rings of sound, straight and slow, shoving him back
//   sombrero   a spinning sombrero, lobbed; landing, it rolls on along the ground on its brim (jump it), bouncing off
//              walls, till it runs out of roll
//   axe        a viking's throwing axe, lobbed end over end
//   fish       a lutefisk sample, lobbed: a wobbling glob of fish jelly; it hurts a little and he gags (a moment stuck)
//   rocket     a firework rocket off a rack: up, then curving down at him; it bursts (a hazard: it hurts whoever's in the
//              burst, the cast too)
//   tuba       an oompah tuba's blast: a fat slow ring that shoves him hard (off a ledge, as like as not), barely hurts
//   stein      a beer stein, lobbed; it shatters
//   pizza      a spinning pizza thrown flat, wobbling; hot cheese
//   spoon      a nonna's wooden spoon, flung end over end (when he's out of smacking range)
//   aria       an opera singer's high note: a tall pink ring, slow, through anything; it rings his ears (a moment stuck)
//              and shatters glass on the way (the cast's steins, the windows: crude, the sound)
//   kick       (not drawn) a placeholder for melee: see cast.ts's strike
//   (job 2's, Japan..Canada:)
//   shuriken   a ninja's foam throwing star: flat, fast, spinning
//   ki         the anime cosplay kid's "energy ball" (papier-mache, glitter): flat, slow, big, after a long scream
//   spit       the camel suit's spit (a squirt gun in the head): lobbed; he gags (a moment stuck)
//   smoke      a hookah or cigarette cloud, blown: slow, it drifts on and spreads; in it he coughs (a moment stuck)
//   plate      a snooty waiter's plate, flung flat like a frisbee
//   pint       a hooligan's pint, lobbed; it shatters
//   tea        the tea lady's scalding cuppa, lobbed: a splash
//   puck       a hockey player's slapshot: flat, very fast, ricochets off walls (twice)

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Enemy, SoundType } from '../../m1/types';
import { hurtPlayer } from '../../m1/game/bosses/shared';
import { playSound } from '../../m1/game/platform/audio';
import { shakeScreen } from '../../m1/game/core/state';
import { hazardVictims, hazardHit, boxHits } from '../hazardHit';
import { streetsOf } from './state';
import { pixelBlob } from './kit';

type Ctx = CanvasRenderingContext2D;

export type ShotKind = 'note' | 'sombrero' | 'axe' | 'fish' | 'rocket' | 'tuba' | 'stein' | 'pizza' | 'spoon' | 'aria'
  | 'shuriken' | 'ki' | 'spit' | 'smoke' | 'plate' | 'pint' | 'tea' | 'puck';
export interface Shot {
  kind: ShotKind; x: number; y: number; vx: number; vy: number; t: number;
  from?: Enemy;
  /** Rolling along the ground (a sombrero, landed). */
  rolling?: boolean;
  /** A rocket's mark (it curves down onto it). */
  tx?: number; ty?: number;
  /** Ricochets left (a puck). */
  bounces?: number;
}

const DMG: Record<ShotKind, number> = { note: 7, sombrero: 8, axe: 11, fish: 5, rocket: 12, tuba: 3, stein: 9, pizza: 8, spoon: 6, aria: 9,
  shuriken: 7, ki: 13, spit: 4, smoke: 3, plate: 8, pint: 8, tea: 7, puck: 10 };
/** Each kind's hurt source (its lines). */
export const SHOT_SRC: Record<ShotKind, string> = {
  note: 'm2:fl_mariachi_note', sombrero: 'm2:fl_sombrero_hat', axe: 'm2:fl_viking_axe', fish: 'm2:fl_lutefisk_fish',
  rocket: 'm2:fl_firework', tuba: 'm2:fl_tuba_blast', stein: 'm2:fl_stein', pizza: 'm2:fl_pizza_pie', spoon: 'm2:fl_nonna_spoon',
  aria: 'm2:fl_opera_note',
  shuriken: 'm2:fl_shuriken', ki: 'm2:fl_ki_blast', spit: 'm2:fl_camel_spit', smoke: 'm2:fl_smoke', plate: 'm2:fl_plate',
  pint: 'm2:fl_pint', tea: 'm2:fl_tea', puck: 'm2:fl_puck',
};
const GRAV: Partial<Record<ShotKind, number>> = { sombrero: 0.26, axe: 0.3, fish: 0.3, stein: 0.3, spoon: 0.3, spit: 0.3, pint: 0.3, tea: 0.3 };
const RADIUS: Record<ShotKind, number> = { note: 12, sombrero: 13, axe: 10, fish: 9, rocket: 8, tuba: 18, stein: 9, pizza: 12, spoon: 8, aria: 20,
  shuriken: 7, ki: 16, spit: 7, smoke: 22, plate: 11, pint: 8, tea: 9, puck: 6 };
const LIFE: Record<ShotKind, number> = { note: 80, sombrero: 260, axe: 160, fish: 160, rocket: 150, tuba: 90, stein: 160, pizza: 120, spoon: 120, aria: 130,
  shuriken: 90, ki: 150, spit: 120, smoke: 200, plate: 110, pint: 160, tea: 160, puck: 120 };

const fire = (state: GameState, s: Shot) => { streetsOf(state).shots.push(s); };
const handOf = (e: Enemy, up = 50) => ({ x: e.pos.x + e.width / 2 + (e.facing ?? 1) * 16, y: e.pos.y + e.height - up });

/** Straight at him (along the ground): notes, tuba blasts, pizzas. */
export const shootFlat = (state: GameState, e: Enemy, kind: 'note' | 'tuba' | 'pizza' | 'aria' | 'shuriken' | 'ki' | 'smoke' | 'plate' | 'puck', speed: number) => {
  const h = handOf(e, kind === 'tuba' ? 46 : kind === 'puck' ? 8 : kind === 'smoke' ? 60 : 52), dir = e.facing ?? 1;
  fire(state, { kind, x: h.x, y: h.y, vx: dir * speed, vy: 0, t: 0, from: e, bounces: kind === 'puck' ? 2 : undefined });
  const own = FLAT_SOUND[kind];
  if (own) { playSound(own[0], own[1], own[2]); return; }
  playSound(kind === 'pizza' ? 'whoosh' : kind === 'aria' ? 'tinkle' : 'horn', kind === 'tuba' ? 0.55 : 0.35, kind === 'tuba' ? -10 : kind === 'note' ? 12 : kind === 'aria' ? 18 : 4);
};
const FLAT_SOUND: Partial<Record<ShotKind, [SoundType, number, number]>> = {
  shuriken: ['whoosh', 0.5, 16], ki: ['boom', 0.5, 14], smoke: ['whoosh', 0.35, -14], plate: ['whoosh', 0.5, 8], puck: ['thud', 0.8, 12],
};
/** Lobbed to land at (tx, ty), `t` frames up there: sombreros, axes, fish, steins, spoons. */
export const lob = (state: GameState, e: Enemy, kind: 'sombrero' | 'axe' | 'fish' | 'stein' | 'spoon' | 'spit' | 'pint' | 'tea', tx: number, ty: number, t = 40) => {
  const h = handOf(e, 62), g = GRAV[kind] ?? 0.3;
  fire(state, { kind, x: h.x, y: h.y, vx: (tx - h.x) / t, vy: (ty - h.y - 0.5 * g * t * t) / t, t: 0, from: e });
  playSound('whoosh', 0.45, kind === 'fish' ? -6 : 6);
};
/** A firework rocket off a rack at (x, y), its mark (tx, ty). */
export const launchRocket = (state: GameState, x: number, y: number, tx: number, ty: number, from?: Enemy) => {
  fire(state, { kind: 'rocket', x, y, vx: (tx - x) * 0.006, vy: -7.5, t: 0, from, tx, ty });
  playSound('whoosh', 0.6, 10);
};

/** A burst (a firework's): it hurts him and anybody else in it (a hazard). */
export const burstAt = (ctx: FrameContext, x: number, y: number, r: number, dmg: number, src: string, col = '#FDE047') => {
  const { state } = ctx, p = state.player, o = streetsOf(state);
  o.bursts.push({ x, y, at: state.frame, r, col });
  playSound('boom', 0.6, 8); shakeScreen(state, 5, 3);
  const pcx = p.pos.x + p.width / 2, pcy = p.pos.y + p.height / 2;
  if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && Math.hypot(pcx - x, pcy - y) < r + 20)
    hurtPlayer(ctx, dmg, src, { x: Math.sign(pcx - x || 1) * 8, y: -7 }, 20);
  for (const e of hazardVictims(state)) if (boxHits(e, x - r, y - r, r * 2, r * 2)) hazardHit(ctx, e, 40, x, 'FIREWORKED!', { color: '#FDE047' });
  for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2; state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * 4, y: Math.sin(a) * 4 }, life: 22, color: k % 2 ? col : '#FFFFFF', size: 3 }); }
};

const solidAt = (state: GameState, x: number, y: number) => state.blocks.some(b => b.type !== 'pit' && !b.oneWay && x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h);
const floorAt = (state: GameState, x: number, y: number) => state.blocks.some(b => b.type !== 'pit' && x > b.x && x < b.x + b.w && y >= b.y && y < b.y + 18);

export const updateShots = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, o = streetsOf(state);
  o.bursts = o.bursts.filter(b => state.frame - b.at < 26);
  o.shots = o.shots.filter(s => {
    s.t++;
    if (s.kind === 'rocket') {
      // (up off the rack, then over and down onto his mark)
      if (s.t > 22 && s.tx !== undefined && s.ty !== undefined) {
        const dx = s.tx - s.x, dy = s.ty - s.y, d = Math.hypot(dx, dy) || 1;
        s.vx += (dx / d) * 0.45; s.vy += (dy / d) * 0.45;
        const sp = Math.hypot(s.vx, s.vy); if (sp > 8) { s.vx *= 8 / sp; s.vy *= 8 / sp; }
      }
      if (state.frame % 2 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: -s.vx * 0.2, y: -s.vy * 0.2 }, life: 14, color: s.t % 4 ? '#FDBA74' : '#FEF3C7', size: 2 });
    } else if (s.rolling) {
      // (rolling on its brim: off a wall it turns back; off an edge it drops and rolls on)
      if (solidAt(state, s.x + Math.sign(s.vx) * 14, s.y)) s.vx = -s.vx;
      if (!floorAt(state, s.x, s.y + RADIUS.sombrero + 2)) { s.vy += 0.4; } else { s.vy = 0; }
      s.vx *= 0.997;
    } else s.vy += GRAV[s.kind] ?? 0;
    if (s.kind === 'pizza' || s.kind === 'plate') s.vy = Math.sin(s.t * 0.25) * (s.kind === 'plate' ? 0.5 : 0.8);
    // (a cloud slows to a drift, rising a touch)
    if (s.kind === 'smoke') { s.vx *= 0.975; s.vy = Math.sin(s.t * 0.05) * 0.3 - 0.05; }
    s.x += s.vx; s.y += s.vy;
    const r = RADIUS[s.kind] + (s.kind === 'tuba' ? Math.min(14, s.t * 0.3) : s.kind === 'smoke' ? Math.min(20, s.t * 0.2) : 0);
    // Him
    if (p.health > 0 && s.x + r > p.pos.x && s.x - r < p.pos.x + p.width && s.y + r > p.pos.y && s.y - r < p.pos.y + p.height) {
      if (s.kind === 'rocket') { burstAt(ctx, s.x, s.y, 70, DMG.rocket, SHOT_SRC.rocket); return false; }
      if (p.invincibilityTimer <= 0 && !p.inCutscene) {
        const dir = Math.sign(s.vx || 1);
        const push = s.kind === 'tuba' ? 16 : s.kind === 'note' ? 9 : 4;
        hurtPlayer(ctx, DMG[s.kind], SHOT_SRC[s.kind], { x: dir * push, y: s.kind === 'tuba' ? -6 : -4 }, s.kind === 'tuba' ? 30 : 18);
        if (s.kind === 'fish') state.playerStunTimer = Math.max(state.playerStunTimer, 40);
        if (s.kind === 'aria') { state.playerStunTimer = Math.max(state.playerStunTimer, 30); playSound('glass', 0.7, 12); }
        if (s.kind === 'stein') playSound('glass', 0.6, 4);
        if (s.kind === 'fish') playSound('splat', 0.6, -4);
        if (s.kind === 'spit') { state.playerStunTimer = Math.max(state.playerStunTimer, 30); playSound('splat', 0.6, 8); }
        if (s.kind === 'smoke') { state.playerStunTimer = Math.max(state.playerStunTimer, 24); playSound('snort', 0.6, 6); }
        if (s.kind === 'pint' || s.kind === 'plate') playSound('glass', 0.6, s.kind === 'plate' ? -2 : 6);
        if (s.kind === 'tea') playSound('splat', 0.5, 12);
      }
      return false;
    }
    // The world
    if (s.kind === 'rocket') {
      if (s.t > 30 && (solidAt(state, s.x, s.y) || floorAt(state, s.x, s.y) || s.t >= LIFE.rocket)) { burstAt(ctx, s.x, s.y, 70, DMG.rocket, SHOT_SRC.rocket); return false; }
      return true;
    }
    if (s.kind === 'sombrero' && !s.rolling && s.vy > 0 && floorAt(state, s.x, s.y + RADIUS.sombrero)) { s.rolling = true; s.vy = 0; s.vx = Math.sign(s.vx || 1) * 3.4; playSound('thud', 0.3, 6); }
    if (s.kind === 'aria') return s.t < LIFE.aria;
    // (a puck off a wall, back the way it came; out of ricochets, it's spent)
    if (s.kind === 'puck' && solidAt(state, s.x + Math.sign(s.vx) * 6, s.y)) { if ((s.bounces ?? 0) <= 0) return false; s.bounces = (s.bounces ?? 0) - 1; s.vx = -s.vx * 0.85; playSound('clang', 0.4, 16); return true; }
    if (s.kind === 'smoke') return s.t < LIFE.smoke && !solidAt(state, s.x, s.y);
    if (s.kind !== 'sombrero' && (s.vy >= 0 || !GRAV[s.kind]) && (solidAt(state, s.x, s.y) || (GRAV[s.kind] && floorAt(state, s.x, s.y)))) {
      if (s.kind === 'pint') { playSound('glass', 0.5, 8); for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 18, color: k % 2 ? '#D97706' : '#FEF3C7', size: 2 }); }
      if (s.kind === 'tea' || s.kind === 'spit') for (let k = 0; k < 5; k++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 16, color: s.kind === 'tea' ? '#B45309' : '#E7E5E4', size: 2 });
      if (s.kind === 'stein') { playSound('glass', 0.5, 6); for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 18, color: k % 2 ? '#FDE68A' : '#E0F2FE', size: 2 }); }
      if (s.kind === 'fish') playSound('splat', 0.4, -6);
      return false;
    }
    if (s.kind === 'sombrero' && solidAt(state, s.x, s.y)) return false;
    return s.t < LIFE[s.kind];
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: the first pass)

const disc = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); c.fill(); };
const INK = '#1A0B06';
/** A hex color k of the way to another. */
const mixHex = (a: string, b: string, k: number) => { const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`; };

export const drawShots = (c: Ctx, state: GameState) => {
  const o = streetsOf(state);
  for (const s of o.shots) {
    const dir = Math.sign(s.vx) || 1;
    switch (s.kind) {
      case 'aria': {
        // (the high note: tall stepped rings going out (pink to rose, the nearest brightest), inked, wobbling with the
        // vibrato, a glint up the lead one, and a sparkle of a note riding it)
        const r = 14 + Math.min(10, s.t * 0.2), wob = Math.sin(s.t * 0.9) * 2, a0 = dir > 0 ? -1.2 : Math.PI - 1.2, a1 = dir > 0 ? 1.2 : Math.PI + 1.2;
        for (let k = 2; k >= 0; k--) {
          const rx = (r - k * 3) * 0.55, ry = r - k * 3 + wob, cx = s.x - dir * k * 9;
          c.lineWidth = 6 - k * 1.2; c.strokeStyle = INK; c.beginPath(); c.ellipse(cx, s.y, rx, ry, 0, a0, a1); c.stroke();
          c.lineWidth = 3.5 - k; c.strokeStyle = ['#FCE7F3', '#F9A8D4', '#DB2777'][k]; c.beginPath(); c.ellipse(cx, s.y, rx, ry, 0, a0, a1); c.stroke();
          if (k === 0) { c.lineWidth = 1; c.strokeStyle = '#FFFFFF'; c.beginPath(); c.ellipse(cx, s.y, rx - 1, ry - 1, 0, a0 + 0.2, a0 + 0.8); c.stroke(); }
        }
        const nx = Math.round(s.x - dir * 10), ny = Math.round(s.y - 6 + Math.sin(s.t * 0.4) * 3);
        disc(c, nx, ny, 3.4, 2.6, INK, -0.4); disc(c, nx, ny, 2.4, 1.8, '#9D174D', -0.4); c.fillStyle = INK; c.fillRect(nx + 2, ny - 10, 2, 10); c.fillRect(nx + 2, ny - 10, 5, 2);
        if (s.t % 6 < 3) { c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(s.x + dir * 4), Math.round(s.y - r - 2), 2, 2); c.fillRect(Math.round(s.x), Math.round(s.y + r - 2), 2, 2); }
        break;
      }
      case 'note': {
        // (the trumpet's blast: stepped brass-white arcs going out (three, fainter behind), a quaver and a semiquaver
        // riding it, bobbing, inked)
        const r = 10 + Math.min(8, s.t * 0.15), a0 = dir > 0 ? -0.9 : Math.PI - 0.9, a1 = dir > 0 ? 0.9 : Math.PI + 0.9;
        for (let k = 2; k >= 0; k--) {
          const rr = r - k * 3, cx = s.x - dir * k * 8;
          c.lineWidth = 5 - k; c.strokeStyle = INK; c.beginPath(); c.arc(cx, s.y, rr, a0, a1); c.stroke();
          c.lineWidth = 3 - k * 0.6; c.strokeStyle = ['#FEF9C3', '#FDE68A', '#F59E0B'][k]; c.beginPath(); c.arc(cx, s.y, rr, a0, a1); c.stroke();
          c.lineWidth = 1; c.strokeStyle = k ? 'rgba(255,255,255,0.4)' : '#FFFFFF'; c.beginPath(); c.arc(cx, s.y, rr - 1, a0 + 0.3, a0 + 0.9); c.stroke();
        }
        const bob = Math.round(Math.sin(s.t * 0.3) * 2), nx = Math.round(s.x - dir * 8), ny = Math.round(s.y + 3 + bob);
        const head = (x: number, y: number) => { disc(c, x, y, 3.6, 2.8, INK, -0.4); disc(c, x, y, 2.6, 1.9, '#1C1917', -0.4); c.fillStyle = '#78716C'; c.fillRect(x - 2, y - 1, 1, 1); };
        head(nx, ny); c.fillStyle = INK; c.fillRect(nx + 2, ny - 11, 2, 11); c.fillRect(nx + 2, ny - 11, 5, 2); c.fillRect(nx + 6, ny - 10, 1, 3);
        head(nx - dir * 10, ny - 4 - bob); c.fillRect(nx - dir * 10 + 2, ny - 15 - bob, 2, 11);
        break;
      }
      case 'tuba': {
        // (the oompah: fat stepped brass arcs going out (three, the nearest brightest), inked, a glint along the lead one,
        // and the OOM riding in it as two fat notes)
        const r = 16 + Math.min(14, s.t * 0.3), a0 = dir > 0 ? -0.9 : Math.PI - 0.9, a1 = dir > 0 ? 0.9 : Math.PI + 0.9;
        for (let k = 2; k >= 0; k--) {
          const rr = r - k * 4, cx = s.x - dir * k * 9;
          c.lineWidth = 8 - k * 1.5; c.strokeStyle = INK; c.beginPath(); c.arc(cx, s.y, rr, a0, a1); c.stroke();
          c.lineWidth = 5.5 - k * 1.5; c.strokeStyle = ['#FDE68A', '#EAB308', '#A16207'][k]; c.beginPath(); c.arc(cx, s.y, rr, a0, a1); c.stroke();
          if (k === 0) { c.lineWidth = 1.5; c.strokeStyle = '#FFFBEB'; c.beginPath(); c.arc(cx, s.y, rr - 1, a0 + 0.2, a0 + 0.8); c.stroke(); }
        }
        const bob = Math.round(Math.sin(s.t * 0.25) * 2), nx = Math.round(s.x - dir * 12), ny = Math.round(s.y + 4 + bob);
        for (const [x, y] of [[nx, ny], [nx - dir * 10, ny - 3]] as const) { disc(c, x, y, 4.4, 3.4, INK, -0.4); disc(c, x, y, 3.4, 2.5, '#422006', -0.4); c.fillStyle = '#A16207'; c.fillRect(x - 2, y - 1, 1, 1); c.fillStyle = INK; c.fillRect(x + 3, y - 12, 2, 12); }
        break;
      }
      case 'sombrero': {
        c.save(); c.translate(s.x, s.y);
        const STRAW = ['#78350F', '#B45309', '#D97706', '#FBBF24', '#FDE68A'];
        if (s.rolling) {
          // (on its brim, rolling: the brim a wheel (its woven rings, the embroidered edge), the crown's top in the middle,
          // lit up-left whichever way it turns)
          disc(c, 0, 0, 14.5, 14.5, INK); disc(c, 0, 0, 13.5, 13.5, STRAW[1]); disc(c, -1, -1, 12, 12, STRAW[2]); disc(c, -2, -2, 8, 8, STRAW[3]);
          c.save(); c.rotate(s.t * 0.25 * dir);
          c.strokeStyle = STRAW[0]; c.lineWidth = 1; for (const rr of [11, 7]) { c.beginPath(); c.arc(0, 0, rr, 0, Math.PI * 2); c.stroke(); }
          for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; c.fillStyle = k % 2 ? '#DC2626' : '#16A34A'; c.fillRect(Math.cos(a) * 12.5 - 1, Math.sin(a) * 12.5 - 1, 2, 2); }
          c.fillStyle = STRAW[0]; c.fillRect(-1, -6, 2, 12);
          c.restore();
          disc(c, 0, 0, 5, 5, INK); disc(c, 0, 0, 4, 4, '#B91C1C'); disc(c, -1, -1, 2, 2, '#F87171');
        } else {
          c.rotate(Math.sin(s.t * 0.4) * 0.3);
          // (spinning flat: the brim's lens (lit along its top, the embroidered band), the crown up out of it)
          disc(c, 0, 2, 17, 6, INK); disc(c, 0, 1.5, 16, 5, STRAW[1]); disc(c, -1, 0.5, 14, 3.4, STRAW[3]); disc(c, -3, 0, 8, 1.6, STRAW[4]);
          for (let k = -12; k <= 12; k += 4) { c.fillStyle = (k / 4 + Math.floor(s.t / 3)) % 2 ? '#DC2626' : '#16A34A'; c.fillRect(k - 1, 4, 2, 1); }
          disc(c, 0, -4, 7.5, 7.5, INK); disc(c, 0, -4, 6.5, 6.5, STRAW[2]); disc(c, -1.5, -5.5, 4, 4, STRAW[3]); disc(c, -2.5, -7, 1.5, 1.5, STRAW[4]);
          c.fillStyle = INK; c.fillRect(-7, -2, 14, 3); c.fillStyle = '#B91C1C'; c.fillRect(-6, -2, 12, 2); c.fillStyle = '#F87171'; c.fillRect(-6, -2, 5, 1);
        }
        c.restore(); break;
      }
      case 'axe': {
        // (a craft-store throwing axe end over end: the haft in steps (its leather grip), the head's bevel lit, its edge
        // a bright line, the painted rune)
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.4 * dir);
        c.fillStyle = INK; c.fillRect(-2.5, -13, 5, 26);
        c.fillStyle = '#92400E'; c.fillRect(-1.5, -12, 3, 24); c.fillStyle = '#B45309'; c.fillRect(-1.5, -12, 1, 24);
        c.fillStyle = '#3F2A14'; for (let k = 4; k < 12; k += 2) c.fillRect(-1.5, k, 3, 1);
        c.fillStyle = INK; c.beginPath(); c.moveTo(0, -13); c.lineTo(11, -16); c.quadraticCurveTo(13, -9, 11, -1); c.lineTo(0, -5); c.closePath(); c.fill();
        c.fillStyle = '#94A3B8'; c.beginPath(); c.moveTo(1, -12); c.lineTo(10, -14.5); c.quadraticCurveTo(11.6, -9, 10, -2.5); c.lineTo(1, -6); c.closePath(); c.fill();
        c.fillStyle = '#CBD5E1'; c.beginPath(); c.moveTo(1, -12); c.lineTo(10, -14.5); c.lineTo(9, -10); c.lineTo(1, -9); c.closePath(); c.fill();
        c.fillStyle = '#F8FAFC'; c.fillRect(9.5, -14, 1, 11);
        c.fillStyle = '#7F1D1D'; c.fillRect(4, -10, 1, 3); c.fillRect(5, -9, 2, 1);
        c.restore(); break;
      }
      case 'spoon': {
        // (nonna's wooden spoon end over end: the handle's grain in steps, the bowl lit and hollowed, the sauce on it)
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.4 * dir);
        c.fillStyle = INK; c.fillRect(-2.5, -9, 5, 22);
        c.fillStyle = '#B07A3A'; c.fillRect(-1.5, -8, 3, 20); c.fillStyle = '#E0B070'; c.fillRect(-1.5, -8, 1, 20); c.fillStyle = '#8A5A28'; c.fillRect(1, -4, 1, 3); c.fillRect(1, 4, 1, 4);
        disc(c, 0, -13, 5.5, 7, INK); disc(c, 0, -13, 4.5, 6, '#C08A50'); disc(c, -1, -14, 3, 4, '#E0B070'); disc(c, 0.5, -12, 2.4, 3.2, '#8A5A28');
        disc(c, 0.5, -11.5, 1.8, 1.6, '#B91C1C'); c.fillStyle = '#F87171'; c.fillRect(0, -12, 1, 1);
        c.restore(); break;
      }
      case 'fish': {
        // (a quivering glob of lutefisk jelly: translucent gray-white in steps, a flake of fish in it, wobbling, a drip
        // flung off behind)
        const w = 1 + Math.sin(s.t * 0.5) * 0.2;
        disc(c, s.x, s.y, 9 * w, 7 / w, INK); disc(c, s.x, s.y, 8 * w, 6 / w, '#C9C3A8'); disc(c, s.x - 1, s.y - 0.5, 6.5 * w, 4.8 / w, '#E2DCC0');
        disc(c, s.x - 2, s.y - 1.5, 4 * w, 2.8 / w, '#F5F0D8'); disc(c, s.x - 3, s.y - 2.5, 1.6, 1.2, '#FFFFFF');
        c.fillStyle = '#B8A88A'; c.fillRect(Math.round(s.x + 1), Math.round(s.y), 3, 1); c.fillRect(Math.round(s.x + 2), Math.round(s.y + 1), 2, 1);
        disc(c, s.x - dir * 11, s.y - 2 + Math.sin(s.t * 0.4), 2.2, 1.8, INK); disc(c, s.x - dir * 11, s.y - 2 + Math.sin(s.t * 0.4), 1.4, 1.1, '#E2DCC0');
        break;
      }
      case 'rocket': {
        // (a bottle rocket: the cardboard tube banded red and gold, lit along its top, the paper cone, the stick behind it,
        // and its sparking trail in steps, white at the nozzle)
        const a = Math.atan2(s.vy, s.vx);
        for (let k = 1; k < 6; k++) { const tx = s.x - Math.cos(a) * (8 + k * 4) + Math.sin(s.t * 0.9 + k) * 1.2, ty = s.y - Math.sin(a) * (8 + k * 4); c.fillStyle = k < 2 ? '#FFFFFF' : k < 4 ? '#FDE047' : '#F97316'; c.fillRect(Math.round(tx) - 1, Math.round(ty) - 1, k < 3 ? 3 : 2, k < 3 ? 3 : 2); }
        c.save(); c.translate(s.x, s.y); c.rotate(a);
        c.fillStyle = INK; c.fillRect(-20, -1, 12, 2); c.fillStyle = '#A16207'; c.fillRect(-20, -1, 12, 1);
        c.fillStyle = INK; c.fillRect(-9, -4, 16, 8);
        c.fillStyle = '#B91C1C'; c.fillRect(-8, -3, 14, 6); c.fillStyle = '#EF4444'; c.fillRect(-8, -3, 14, 2); c.fillStyle = '#7F1D1D'; c.fillRect(-8, 2, 14, 1);
        c.fillStyle = '#FCD34D'; c.fillRect(-8, -3, 3, 6); c.fillRect(1, -3, 2, 6); c.fillStyle = '#FEF08A'; c.fillRect(-8, -3, 3, 1);
        c.fillStyle = INK; c.beginPath(); c.moveTo(6, -4); c.lineTo(13, 0); c.lineTo(6, 4); c.fill();
        c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(6, -3); c.lineTo(11, 0); c.lineTo(6, 3); c.fill(); c.fillStyle = '#D6D3D1'; c.fillRect(6, 1, 4, 1);
        c.restore(); break;
      }
      case 'stein': {
        // (a full stein end over end: the glass in steps over the beer, its glint, the pewter lid, the handle, the foam
        // flung off it)
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.3 * dir);
        c.fillStyle = INK; c.fillRect(-7, -10, 14, 19); c.fillRect(6, -6, 6, 11);
        c.fillStyle = '#F59E0B'; c.fillRect(-6, -5, 12, 13); c.fillStyle = '#FCD34D'; c.fillRect(-6, -5, 3, 13); c.fillStyle = '#B45309'; c.fillRect(3, -5, 3, 13);
        c.fillStyle = '#FFFBEB'; c.fillRect(-4, -3, 1, 8); c.fillStyle = '#D97706'; c.fillRect(-6, 7, 12, 1);
        c.fillStyle = '#FFFFFF'; c.fillRect(-6, -9, 12, 4); c.fillStyle = '#E5E7EB'; c.fillRect(-6, -6, 12, 1);
        c.fillStyle = '#E0F2FE'; c.fillRect(7, -5, 3, 9); c.fillStyle = INK; c.fillRect(8, -3, 1, 5);
        c.fillStyle = '#A8A29E'; c.fillRect(-7, -12, 9, 3); c.fillStyle = '#D6D3D1'; c.fillRect(-7, -12, 9, 1);
        c.restore();
        if (s.t % 4 < 2) { c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(s.x - dir * 10), Math.round(s.y - 6), 3, 2); c.fillRect(Math.round(s.x - dir * 15), Math.round(s.y - 3), 2, 2); }
        break;
      }
      case 'shuriken': {
        // (a foam throwing star spinning: four points, each lit down one face and shaded down the other, the hole in its
        // middle, a glint going round; a blur ring behind it)
        c.save(); c.translate(s.x, s.y);
        c.strokeStyle = 'rgba(203, 213, 225, 0.35)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.stroke();
        c.rotate(s.t * 0.6 * dir);
        for (let k = 0; k < 4; k++) {
          c.rotate(Math.PI / 2);
          c.fillStyle = INK; c.beginPath(); c.moveTo(-4, 0); c.lineTo(0, -10); c.lineTo(4, 0); c.fill();
          c.fillStyle = '#CBD5E1'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -8); c.lineTo(0, 0); c.fill();
          c.fillStyle = '#6B7280'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -8); c.lineTo(3, 0); c.fill();
          if (k === 0) { c.fillStyle = '#FFFFFF'; c.fillRect(-1, -7, 1, 3); }
        }
        disc(c, 0, 0, 3, 3, INK); disc(c, 0, 0, 2, 2, '#4B5563'); disc(c, -0.5, -0.5, 1, 1, '#1C1014'); c.restore(); break;
      }
      case 'ki': {
        // (a glittery papier-mache "energy ball": a stepped blue glow round it (banded rings, not smooth), the ball in steps
        // (shade, body, lit, the white core), the paper strips' seams, glitter twinkling on it and flung off behind)
        const r = 12 + Math.sin(s.t * 0.5) * 2;
        for (const [rr, a] of [[r + 8, 0.18], [r + 5, 0.28], [r + 2, 0.4]] as const) disc(c, s.x, s.y, rr, rr, `rgba(96,165,250,${a})`);
        disc(c, s.x, s.y, r, r, INK); disc(c, s.x, s.y, r - 1, r - 1, '#1D4ED8'); disc(c, s.x - 1, s.y - 1, r - 2.5, r - 2.5, '#3B82F6');
        disc(c, s.x - 2.5, s.y - 2.5, r * 0.6, r * 0.6, '#60A5FA'); disc(c, s.x - 4, s.y - 4, r * 0.32, r * 0.32, '#BFDBFE'); disc(c, s.x - 4.5, s.y - 4.5, 1.5, 1.5, '#FFFFFF');
        c.strokeStyle = '#1E3A8A'; c.lineWidth = 1; for (const k of [-0.4, 0.5]) { c.beginPath(); c.ellipse(s.x, s.y, r - 1, (r - 1) * Math.abs(k), 0.6, 0, Math.PI); c.stroke(); }
        for (let k = 0; k < 6; k++) { const a = s.t * 0.3 + k * 1.05, rr = r * (0.4 + (k % 3) * 0.25); if ((s.t + k * 3) % 8 < 5) { c.fillStyle = k % 2 ? '#FDE047' : '#F9A8D4'; c.fillRect(Math.round(s.x + Math.cos(a) * rr - 1), Math.round(s.y + Math.sin(a) * rr - 1), 2, 2); } }
        for (let k = 0; k < 4; k++) { const tx = s.x - dir * (r + 6 + k * 6), ty = s.y + Math.sin(s.t * 0.4 + k * 1.7) * 6; if ((s.t + k) % 4 < 3) { c.fillStyle = k % 2 ? '#FDE047' : '#E0F2FE'; c.fillRect(Math.round(tx), Math.round(ty), 2, 2); } }
        break;
      }
      case 'spit': {
        // (a gob of camel spit (squirt-gun water and whatever else): a frothy glob in steps, its bubbles, the strings and
        // droplets trailing off it)
        disc(c, s.x, s.y, 7, 6, INK); disc(c, s.x, s.y, 6, 5, '#A8A29E'); disc(c, s.x - 1, s.y - 1, 4.5, 3.5, '#D6D3D1'); disc(c, s.x - 2, s.y - 2, 2.2, 1.6, '#F5F5F4');
        c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(s.x - 3), Math.round(s.y - 3), 1, 1); c.fillRect(Math.round(s.x + 2), Math.round(s.y - 1), 1, 1);
        c.fillStyle = '#84CC16'; c.fillRect(Math.round(s.x + 1), Math.round(s.y + 1), 2, 2);
        for (let k = 0; k < 3; k++) { const tx = s.x - dir * (8 + k * 5), ty = s.y - 2 + k * 1.5 + Math.sin(s.t * 0.5 + k) * 1.5; disc(c, tx, ty, 2.6 - k * 0.6, 2 - k * 0.4, INK); disc(c, tx, ty, 1.8 - k * 0.5, 1.4 - k * 0.4, '#D6D3D1'); }
        break;
      }
      case 'tea': {
        // (a splash of scalding tea: the slug of it in steps (milky brown, lit up its top, its dark underside), the drops
        // strung off behind, the steam curling up off it)
        disc(c, s.x, s.y, 6.5, 5.5, INK); disc(c, s.x, s.y, 5.5, 4.5, '#7C3A10'); disc(c, s.x - 0.5, s.y - 0.8, 4.6, 3.4, '#B4642A'); disc(c, s.x - 1.5, s.y - 1.8, 2.4, 1.6, '#D8A070');
        c.fillStyle = '#F4DCC0'; c.fillRect(Math.round(s.x - 3), Math.round(s.y - 3), 2, 1);
        for (let k = 0; k < 3; k++) { const tx = s.x - dir * (7 + k * 4), ty = s.y - 2 + k + Math.sin(s.t * 0.5 + k) * 1.2; disc(c, tx, ty, 2.6 - k * 0.6, 2.2 - k * 0.5, INK); disc(c, tx, ty, 1.9 - k * 0.5, 1.5 - k * 0.4, '#B4642A'); }
        for (let k = 0; k < 3; k++) { const w = Math.sin(s.t * 0.3 + k * 1.7) * 2; if ((s.t + k * 4) % 12 < 9) { c.fillStyle = k === 0 ? '#E2E8F0' : '#F8FAFC'; c.fillRect(Math.round(s.x - 1 + w), Math.round(s.y - 9 - k * 5), 2, 3); } }
        break;
      }
      case 'smoke': {
        // (a slow cloud of smoke: puffs rolling round each other, each in stepped grays (shaded under, lit up its top-left),
        // a dither of wisps round its edge; thinning as it goes)
        const r = RADIUS.smoke * 0.6 + Math.min(20, s.t * 0.2), fade = Math.max(0, 1 - s.t / LIFE.smoke);
        c.globalAlpha = 0.7 * fade + 0.15;
        const puffs = [0, 1, 2, 3, 4].map(k => { const a = k * 1.26 + s.t * 0.03; return [s.x + Math.cos(a) * r * 0.5, s.y + Math.sin(a) * r * 0.32, r * (k === 4 ? 0.42 : 0.56)] as const; });
        for (const [px0, py0, pr] of puffs) pixelBlob(c, px0 + 2, py0 + 3, pr, pr * 0.8, '#8A8580');
        for (const [px0, py0, pr] of puffs) pixelBlob(c, px0, py0, pr * 0.92, pr * 0.74, '#B8B3AE');
        for (const [px0, py0, pr] of puffs) pixelBlob(c, px0 - pr * 0.2, py0 - pr * 0.2, pr * 0.6, pr * 0.46, '#DEDAD4');
        for (const [px0, py0, pr] of puffs) pixelBlob(c, px0 - pr * 0.32, py0 - pr * 0.32, pr * 0.24, pr * 0.18, '#F5F3EF');
        for (let k = 0; k < 6; k++) { const a = k * 1.05 + s.t * 0.05; if ((s.t + k * 5) % 12 < 8) { c.fillStyle = '#C8C3BE'; c.fillRect(Math.round(s.x + Math.cos(a) * r * 1.05), Math.round(s.y + Math.sin(a) * r * 0.7), 2, 2); } }
        c.globalAlpha = 1; break;
      }
      case 'plate': {
        const k = Math.abs(Math.cos(s.t * 0.4));
        // (a dinner plate spun flat: its rim in steps (lit on its top-left arc, shaded under), the blue pin line round it,
        // the well, a smear of sauce and a snail shell left on it, a glint going round)
        c.save(); c.translate(s.x, s.y); c.scale(1, 0.3 + 0.7 * k);
        disc(c, 0, 0, 12.5, 12.5, INK); disc(c, 0, 0, 11.5, 11.5, '#C8CDD4'); disc(c, -0.5, -0.5, 10.5, 10.5, '#F1F5F9'); disc(c, -1, -1, 9, 9, '#FFFFFF');
        c.strokeStyle = '#1E40AF'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 9.5, 0, Math.PI * 2); c.stroke();
        disc(c, 0, 0, 7, 7, '#E2E8F0'); disc(c, 0.5, 0.5, 6, 6, '#EEF2F6');
        disc(c, 2, 1, 3.5, 2.2, '#9A3412'); disc(c, 1.5, 0.5, 2, 1.2, '#C2410C');
        disc(c, -2.5, -1, 2.4, 2.4, INK); disc(c, -2.5, -1, 1.8, 1.8, '#A16207'); c.fillStyle = '#FDE68A'; c.fillRect(-3, -2, 1, 1);
        const ga = s.t * 0.4; c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(Math.cos(ga) * 10.5), Math.round(Math.sin(ga) * 10.5), 2, 1);
        c.restore(); break;
      }
      case 'pint': {
        // (a pint glass end over end: the dimpled mug and its handle, the beer in steps (amber, lit up its near side, its
        // shadow), the dimples catching the light, the head of foam; the beer slopping out behind it in drops)
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.3 * dir);
        c.fillStyle = INK; c.fillRect(-7, -10, 14, 20); c.fillRect(6, -6, 5, 12);
        c.fillStyle = '#E0F2FE'; c.fillRect(7, -5, 3, 10); c.fillStyle = INK; c.fillRect(7, -3, 2, 6);
        c.fillStyle = '#9A4A0A'; c.fillRect(-6, -6, 12, 15); c.fillStyle = '#C2650E'; c.fillRect(-6, -6, 8, 15); c.fillStyle = '#E08A20'; c.fillRect(-6, -6, 3, 15);
        c.fillStyle = '#FCD34D'; for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) c.fillRect(-4 + k * 4, -4 + j * 5, 1, 1);
        c.fillStyle = '#FEF3C7'; c.fillRect(-6, -9, 12, 3); c.fillStyle = '#FFFFFF'; c.fillRect(-6, -9, 7, 1); c.fillRect(-2, -6, 2, 2);
        c.restore();
        for (let k = 0; k < 3; k++) { const tx = s.x - dir * (10 + k * 5), ty = s.y + Math.sin(s.t * 0.4 + k) * 3; disc(c, tx, ty, 2.2 - k * 0.4, 2 - k * 0.4, INK); disc(c, tx, ty, 1.6 - k * 0.4, 1.4 - k * 0.4, k ? '#FEF3C7' : '#E08A20'); }
        break;
      }
      case 'puck': {
        disc(c, s.x, s.y, 7, 3.5, INK); disc(c, s.x, s.y - 1, 6, 2.5, '#27272A');
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(s.x - dir * 18, s.y - 1, 10, 1); c.fillRect(s.x - dir * 26, s.y + 1, 8, 1);
        break;
      }
      case 'pizza': {
        // (a pie spinning flat: the crust in steps (puffed, a char spot), the sauce's edge, the cheese bubbling, the
        // pepperoni lit, a basil leaf; a cheese string flung off behind)
        const k = Math.abs(Math.cos(s.t * 0.35));
        c.save(); c.translate(s.x, s.y); c.scale(1, 0.35 + 0.65 * k); c.rotate(s.t * 0.2 * dir);
        disc(c, 0, 0, 13.5, 13.5, INK); disc(c, 0, 0, 12.5, 12.5, '#A8641E'); disc(c, -0.5, -0.5, 11.5, 11.5, '#D9963E'); disc(c, -1, -1, 10.5, 10.5, '#E8B060');
        c.fillStyle = '#5A3010'; c.fillRect(8, 3, 2, 2); c.fillRect(-9, -5, 2, 1);
        disc(c, 0, 0, 9.5, 9.5, '#B91C1C'); disc(c, 0, 0, 8.5, 8.5, '#F4C542'); disc(c, -1.5, -1.5, 5.5, 5.5, '#FDE68A');
        for (const [px, py] of [[-4, -3], [4, -2], [0, 5], [-5, 4], [5, 5]]) { disc(c, px, py, 2.4, 2.4, INK); disc(c, px, py, 2, 2, '#9F1D1D'); c.fillStyle = '#F87171'; c.fillRect(px - 1, py - 1, 1, 1); }
        c.fillStyle = '#2F7A2A'; c.fillRect(1, -6, 3, 2); c.fillStyle = '#4ADE80'; c.fillRect(1, -6, 1, 1);
        c.restore();
        if (s.t % 8 < 5) { c.fillStyle = '#FDE68A'; c.fillRect(Math.round(s.x - dir * 14), Math.round(s.y + 1), 4, 1); c.fillRect(Math.round(s.x - dir * 19), Math.round(s.y + 2), 3, 1); }
        break;
      }
    }
  }
  // The bursts: a flash, then a ring of square sparks going out (white at first, the shell's color, its shade as they fall
  // and go out), an inner ring behind it
  for (const b of o.bursts) {
    const k = Math.max(0, Math.min(1, (state.frame - b.at) / 26)), r = b.r * (0.3 + Math.sqrt(k) * 0.8), fall = k * k * 10;
    const sh = mixHex(b.col, '#1C1014', 0.45), col = k < 0.2 ? '#FFFFFF' : k < 0.6 ? b.col : sh;
    if (k < 0.3) { const fr = b.r * 0.45 * (1 - k * 2); c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(b.x - fr / 2), Math.round(b.y - fr / 2), Math.round(fr), Math.round(fr)); c.fillStyle = b.col; c.fillRect(Math.round(b.x - fr), Math.round(b.y - 2), Math.round(fr * 2), 4); c.fillRect(Math.round(b.x - 2), Math.round(b.y - fr), 4, Math.round(fr * 2)); }
    for (let i = 0; i < 20; i++) {
      if (k > 0.8 && (i + state.frame) % 2) continue;
      const a = (i / 20) * Math.PI * 2, px0 = Math.round(b.x + Math.cos(a) * r), py0 = Math.round(b.y + Math.sin(a) * r * 0.9 + fall);
      c.fillStyle = INK; c.fillRect(px0 - 2, py0 - 2, 5, 5); c.fillStyle = col; c.fillRect(px0 - 1, py0 - 1, 3, 3);
      if (k < 0.7) { c.fillStyle = sh; c.fillRect(Math.round(b.x + Math.cos(a) * r * 0.7), Math.round(b.y + Math.sin(a) * r * 0.63 + fall * 0.7), 2, 2); }
    }
  }
};
