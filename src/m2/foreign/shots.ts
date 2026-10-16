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

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';
import { hurtPlayer } from '../../m1/game/bosses/shared';
import { playSound } from '../../m1/game/platform/audio';
import { shakeScreen } from '../../m1/game/core/state';
import { hazardVictims, hazardHit, boxHits } from '../hazardHit';
import { streetsOf } from './state';

type Ctx = CanvasRenderingContext2D;

export type ShotKind = 'note' | 'sombrero' | 'axe' | 'fish' | 'rocket' | 'tuba' | 'stein' | 'pizza' | 'spoon' | 'aria';
export interface Shot {
  kind: ShotKind; x: number; y: number; vx: number; vy: number; t: number;
  from?: Enemy;
  /** Rolling along the ground (a sombrero, landed). */
  rolling?: boolean;
  /** A rocket's mark (it curves down onto it). */
  tx?: number; ty?: number;
}

const DMG: Record<ShotKind, number> = { note: 7, sombrero: 8, axe: 11, fish: 5, rocket: 12, tuba: 3, stein: 9, pizza: 8, spoon: 6, aria: 9 };
/** Each kind's hurt source (its lines). */
export const SHOT_SRC: Record<ShotKind, string> = {
  note: 'm2:fl_mariachi_note', sombrero: 'm2:fl_sombrero_hat', axe: 'm2:fl_viking_axe', fish: 'm2:fl_lutefisk_fish',
  rocket: 'm2:fl_firework', tuba: 'm2:fl_tuba_blast', stein: 'm2:fl_stein', pizza: 'm2:fl_pizza_pie', spoon: 'm2:fl_nonna_spoon',
  aria: 'm2:fl_opera_note',
};
const GRAV: Partial<Record<ShotKind, number>> = { sombrero: 0.26, axe: 0.3, fish: 0.3, stein: 0.3, spoon: 0.3 };
const RADIUS: Record<ShotKind, number> = { note: 12, sombrero: 13, axe: 10, fish: 9, rocket: 8, tuba: 18, stein: 9, pizza: 12, spoon: 8, aria: 20 };
const LIFE: Record<ShotKind, number> = { note: 80, sombrero: 260, axe: 160, fish: 160, rocket: 150, tuba: 90, stein: 160, pizza: 120, spoon: 120, aria: 130 };

const fire = (state: GameState, s: Shot) => { streetsOf(state).shots.push(s); };
const handOf = (e: Enemy, up = 50) => ({ x: e.pos.x + e.width / 2 + (e.facing ?? 1) * 16, y: e.pos.y + e.height - up });

/** Straight at him (along the ground): notes, tuba blasts, pizzas. */
export const shootFlat = (state: GameState, e: Enemy, kind: 'note' | 'tuba' | 'pizza' | 'aria', speed: number) => {
  const h = handOf(e, kind === 'tuba' ? 46 : 52), dir = e.facing ?? 1;
  fire(state, { kind, x: h.x, y: h.y, vx: dir * speed, vy: 0, t: 0, from: e });
  playSound(kind === 'pizza' ? 'whoosh' : kind === 'aria' ? 'tinkle' : 'horn', kind === 'tuba' ? 0.55 : 0.35, kind === 'tuba' ? -10 : kind === 'note' ? 12 : kind === 'aria' ? 18 : 4);
};
/** Lobbed to land at (tx, ty), `t` frames up there: sombreros, axes, fish, steins, spoons. */
export const lob = (state: GameState, e: Enemy, kind: 'sombrero' | 'axe' | 'fish' | 'stein' | 'spoon', tx: number, ty: number, t = 40) => {
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
    if (s.kind === 'pizza') s.vy = Math.sin(s.t * 0.25) * 0.8;
    s.x += s.vx; s.y += s.vy;
    const r = RADIUS[s.kind] + (s.kind === 'tuba' ? Math.min(14, s.t * 0.3) : 0);
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
    if (s.kind !== 'sombrero' && (s.vy >= 0 || !GRAV[s.kind]) && (solidAt(state, s.x, s.y) || (GRAV[s.kind] && floorAt(state, s.x, s.y)))) {
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

export const drawShots = (c: Ctx, state: GameState) => {
  const o = streetsOf(state);
  for (const s of o.shots) {
    const dir = Math.sign(s.vx) || 1;
    switch (s.kind) {
      case 'aria': {
        // (a tall ring going out, pink, wobbling with the vibrato)
        const r = 14 + Math.min(10, s.t * 0.2), wob = Math.sin(s.t * 0.9) * 2;
        c.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          c.strokeStyle = ['#F9A8D4', 'rgba(249,168,212,0.6)', 'rgba(249,168,212,0.3)'][k];
          c.beginPath(); c.ellipse(s.x - dir * k * 9, s.y, (r - k * 3) * 0.55, r - k * 3 + wob, 0, dir > 0 ? -1.2 : Math.PI - 1.2, dir > 0 ? 1.2 : Math.PI + 1.2); c.stroke();
        }
        break;
      }
      case 'note': case 'tuba': {
        const r = s.kind === 'tuba' ? 16 + Math.min(14, s.t * 0.3) : 10 + Math.min(8, s.t * 0.15);
        c.lineWidth = s.kind === 'tuba' ? 5 : 3;
        for (let k = 0; k < 3; k++) {
          c.strokeStyle = s.kind === 'tuba' ? ['#FCD34D', 'rgba(252,211,77,0.6)', 'rgba(252,211,77,0.3)'][k] : ['#FFFFFF', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)'][k];
          c.beginPath(); c.arc(s.x - dir * k * 8, s.y, r - k * 3, dir > 0 ? -0.9 : Math.PI - 0.9, dir > 0 ? 0.9 : Math.PI + 0.9); c.stroke();
        }
        // (a little note riding the blast)
        if (s.kind === 'note') { disc(c, s.x - dir * 6, s.y + 3, 3, 2.4, INK, -0.4); c.fillStyle = INK; c.fillRect(s.x - dir * 6 + 2, s.y - 8, 1.5, 11); }
        break;
      }
      case 'sombrero': {
        c.save(); c.translate(s.x, s.y);
        if (s.rolling) {
          // (on its brim, rolling: the brim a wheel, the crown out the side)
          c.rotate(s.t * 0.25 * dir);
          disc(c, 0, 0, 14, 14, INK); disc(c, 0, 0, 13, 13, '#D97706'); disc(c, 0, 0, 9, 9, '#FBBF24'); disc(c, 0, 0, 5, 5, '#B91C1C');
          c.fillStyle = '#16A34A'; c.fillRect(-13, -1, 26, 2);
        } else {
          c.rotate(Math.sin(s.t * 0.4) * 0.3);
          disc(c, 0, 2, 16, 5, INK); disc(c, 0, 1, 15, 4, '#D97706'); disc(c, 0, -4, 7, 7, INK); disc(c, 0, -4, 6, 6, '#FBBF24'); c.fillStyle = '#B91C1C'; c.fillRect(-6, -2, 12, 2);
        }
        c.restore(); break;
      }
      case 'axe': case 'spoon': {
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.4 * dir);
        c.fillStyle = INK; c.fillRect(-2, -12, 4, 24);
        c.fillStyle = s.kind === 'axe' ? '#92400E' : '#D6A15E'; c.fillRect(-1, -11, 2, 22);
        if (s.kind === 'axe') { c.fillStyle = INK; c.beginPath(); c.moveTo(0, -12); c.lineTo(10, -14); c.lineTo(10, -2); c.lineTo(0, -5); c.fill(); c.fillStyle = '#CBD5E1'; c.beginPath(); c.moveTo(1, -11); c.lineTo(9, -13); c.lineTo(9, -3); c.lineTo(1, -6); c.fill(); }
        else disc(c, 0, -12, 4, 6, '#D6A15E');
        c.restore(); break;
      }
      case 'fish': {
        const w = 1 + Math.sin(s.t * 0.5) * 0.2;
        disc(c, s.x, s.y, 9 * w, 7 / w, INK); disc(c, s.x, s.y, 8 * w, 6 / w, '#F5F0D8'); disc(c, s.x - 2, s.y - 2, 3, 2, '#FFFFFF');
        break;
      }
      case 'rocket': {
        const a = Math.atan2(s.vy, s.vx);
        c.save(); c.translate(s.x, s.y); c.rotate(a);
        c.fillStyle = INK; c.fillRect(-9, -3, 16, 6); c.fillStyle = '#DC2626'; c.fillRect(-8, -2, 14, 4); c.fillStyle = '#FDE047'; c.fillRect(-8, -2, 3, 4);
        c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(6, -3); c.lineTo(11, 0); c.lineTo(6, 3); c.fill();
        c.restore(); break;
      }
      case 'stein': {
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.3 * dir);
        c.fillStyle = INK; c.fillRect(-7, -9, 14, 18); c.fillStyle = '#E0F2FE'; c.fillRect(-6, -8, 12, 16); c.fillStyle = '#F59E0B'; c.fillRect(-6, -4, 12, 12); c.fillStyle = '#FFFFFF'; c.fillRect(-6, -8, 12, 4);
        c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(6, -4, 4, 8);
        c.restore(); break;
      }
      case 'pizza': {
        const k = Math.abs(Math.cos(s.t * 0.35));
        c.save(); c.translate(s.x, s.y); c.scale(1, 0.35 + 0.65 * k);
        disc(c, 0, 0, 13, 13, INK); disc(c, 0, 0, 12, 12, '#D97706'); disc(c, 0, 0, 10, 10, '#FCD34D');
        for (const [px, py] of [[-4, -3], [4, -2], [0, 5], [-5, 4], [5, 5]]) disc(c, px, py, 2, 2, '#B91C1C');
        c.restore(); break;
      }
    }
  }
  // The bursts: a ring of sparks going out, fading
  for (const b of o.bursts) {
    const k = (state.frame - b.at) / 26;
    c.strokeStyle = b.col; c.globalAlpha = 1 - k; c.lineWidth = 4;
    c.beginPath(); c.arc(b.x, b.y, b.r * (0.3 + k * 0.8), 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(b.x, b.y, b.r * 0.4 * (1 - k), 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
};
