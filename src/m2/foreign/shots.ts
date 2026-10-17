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
        const r = 16 + Math.min(14, s.t * 0.3);
        c.lineWidth = 5;
        for (let k = 0; k < 3; k++) {
          c.strokeStyle = ['#FCD34D', 'rgba(252,211,77,0.6)', 'rgba(252,211,77,0.3)'][k];
          c.beginPath(); c.arc(s.x - dir * k * 8, s.y, r - k * 3, dir > 0 ? -0.9 : Math.PI - 0.9, dir > 0 ? 0.9 : Math.PI + 0.9); c.stroke();
        }
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
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.4 * dir);
        c.fillStyle = INK; c.fillRect(-2, -12, 4, 24);
        c.fillStyle = '#D6A15E'; c.fillRect(-1, -11, 2, 22);
        disc(c, 0, -12, 4, 6, '#D6A15E');
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
      case 'shuriken': {
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.6 * dir);
        for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 2); c.fillStyle = INK; c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -9); c.lineTo(3, 0); c.fill(); c.fillStyle = '#9CA3AF'; c.beginPath(); c.moveTo(-2, 0); c.lineTo(0, -7); c.lineTo(2, 0); c.fill(); }
        disc(c, 0, 0, 2, 2, INK); c.restore(); break;
      }
      case 'ki': {
        // (a glittery papier-mache ball, a blue glow round it)
        const r = 12 + Math.sin(s.t * 0.5) * 2;
        disc(c, s.x, s.y, r + 6, r + 6, 'rgba(96,165,250,0.35)'); disc(c, s.x, s.y, r, r, INK); disc(c, s.x, s.y, r - 1, r - 1, '#60A5FA'); disc(c, s.x - 3, s.y - 3, r * 0.45, r * 0.45, '#E0F2FE');
        for (let k = 0; k < 4; k++) { const a = s.t * 0.3 + k * 1.6; c.fillStyle = '#FDE047'; c.fillRect(s.x + Math.cos(a) * r - 1, s.y + Math.sin(a) * r - 1, 2, 2); }
        break;
      }
      case 'spit': case 'tea': {
        const col = s.kind === 'tea' ? '#B45309' : '#E7E5E4';
        disc(c, s.x, s.y, 6, 5, INK); disc(c, s.x, s.y, 5, 4, col); disc(c, s.x - dir * 6, s.y - 2, 3, 2, col); disc(c, s.x - dir * 10, s.y - 3, 2, 1.5, col);
        if (s.kind === 'tea' && s.t % 6 < 3) { c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(s.x - 2, s.y - 10, 2, 4); }
        break;
      }
      case 'smoke': {
        const r = RADIUS.smoke * 0.6 + Math.min(20, s.t * 0.2), fade = Math.max(0, 1 - s.t / LIFE.smoke);
        c.globalAlpha = 0.65 * fade + 0.15;
        for (let k = 0; k < 4; k++) { const a = k * 1.7 + s.t * 0.03; disc(c, s.x + Math.cos(a) * r * 0.5, s.y + Math.sin(a) * r * 0.35, r * 0.6, r * 0.5, k % 2 ? '#D6D3D1' : '#E7E5E4'); }
        c.globalAlpha = 1; break;
      }
      case 'plate': {
        const k = Math.abs(Math.cos(s.t * 0.4));
        c.save(); c.translate(s.x, s.y); c.scale(1, 0.3 + 0.7 * k);
        disc(c, 0, 0, 12, 12, INK); disc(c, 0, 0, 11, 11, '#F8FAFC'); disc(c, 0, 0, 7, 7, '#E5E7EB'); disc(c, 2, 1, 3, 2, '#A16207');
        c.restore(); break;
      }
      case 'pint': {
        c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.3 * dir);
        c.fillStyle = INK; c.fillRect(-6, -9, 12, 18); c.fillStyle = '#B45309'; c.fillRect(-5, -6, 10, 14); c.fillStyle = '#FEF3C7'; c.fillRect(-5, -8, 10, 3);
        c.restore(); break;
      }
      case 'puck': {
        disc(c, s.x, s.y, 7, 3.5, INK); disc(c, s.x, s.y - 1, 6, 2.5, '#27272A');
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(s.x - dir * 18, s.y - 1, 10, 1); c.fillRect(s.x - dir * 26, s.y + 1, 8, 1);
        break;
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
