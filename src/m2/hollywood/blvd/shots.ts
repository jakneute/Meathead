// What the outdoors' cast throw and fire (the boulevard's and the backlot's):
//   shield   a caped hero's foam shield (with a brick in it): thrown flat, it spins out and comes back to the hand
//   blast    a tour guide's megaphone blast: a fat ring of sound, slow, shoves him back hard
//   lasso    a cowboy extra's lasso: lobbed, it catches him and yanks him in (a moment held)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { outOf } from './state';

type Ctx = CanvasRenderingContext2D;

const DMG = { shield: 9, blast: 7, lasso: 5 };
export const SHOT_SRC = { shield: 'm2:hw_hero_shield', blast: 'm2:hw_guide_blast', lasso: 'm2:hw_lasso' } as const;

export const throwShield = (state: GameState, e: Enemy, dir: number) => {
  outOf(state).shots.push({ x: e.pos.x + e.width / 2 + dir * 20, y: e.pos.y + e.height - 48, vx: dir * 7, vy: 0, kind: 'shield', t: 0, from: e });
  playSound('whoosh', 0.5, 2);
};
export const fireBlast = (state: GameState, e: Enemy, dir: number) => {
  outOf(state).shots.push({ x: e.pos.x + e.width / 2 + dir * 26, y: e.pos.y + e.height - 52, vx: dir * 3.6, vy: 0, kind: 'blast', t: 0, from: e });
  playSound('horn', 0.35, 10);
};
export const throwLasso = (state: GameState, e: Enemy, tx: number, ty: number) => {
  const x = e.pos.x + e.width / 2, y = e.pos.y + e.height - 62, t = 36;
  outOf(state).shots.push({ x, y, vx: (tx - x) / t, vy: (ty - y - 0.5 * 0.28 * t * t) / t, kind: 'lasso', t: 0, from: e });
  playSound('whoosh', 0.4, 6);
};

export const updateShots = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, o = outOf(state);
  o.shots = o.shots.filter(s => {
    s.t++;
    if (s.kind === 'shield') {
      // (out, slowing; then back to the hand that threw it, wherever that's got to)
      if (!s.back) { s.vx *= 0.965; if (Math.abs(s.vx) < 1.2 || s.t > 60) s.back = true; }
      else if (s.from && s.from.health > 0) {
        const fx = s.from.pos.x + s.from.width / 2, fy = s.from.pos.y + s.from.height - 48;
        const d = Math.hypot(fx - s.x, fy - s.y) || 1;
        s.vx = ((fx - s.x) / d) * 7.5; s.vy = ((fy - s.y) / d) * 7.5;
        if (d < 14) return false;
      } else { s.vy += 0.3; }
    }
    if (s.kind === 'lasso') s.vy += 0.28;
    s.x += s.vx; s.y += s.vy;
    const r = s.kind === 'blast' ? 10 + Math.min(14, s.t * 0.25) : 10;
    if (p.health > 0 && s.x + r > p.pos.x && s.x - r < p.pos.x + p.width && s.y + r > p.pos.y && s.y - r < p.pos.y + p.height) {
      if (p.invincibilityTimer <= 0 && !p.inCutscene) {
        const dir = Math.sign(s.vx || 1);
        if (s.kind === 'lasso') {
          // (caught: yanked toward whoever threw it, held a moment)
          const fx = s.from ? s.from.pos.x + s.from.width / 2 : s.x - s.vx * 10;
          hurtPlayer(ctx, DMG.lasso, SHOT_SRC.lasso, { x: Math.sign(fx - (p.pos.x + p.width / 2)) * 9, y: -3 }, 26);
          state.playerStunTimer = Math.max(state.playerStunTimer, 22);
          playSound('slam', 0.4, 4);
        } else hurtPlayer(ctx, DMG[s.kind], SHOT_SRC[s.kind], { x: dir * (s.kind === 'blast' ? 9 : 4), y: -4 }, s.kind === 'blast' ? 24 : 16);
      }
      if (s.kind !== 'shield') return false;
      s.back = true;
    }
    if (s.kind !== 'shield' && state.blocks.some(b => b.type !== 'pit' && !b.oneWay && s.x > b.x && s.x < b.x + b.w && s.y > b.y && s.y < b.y + b.h)) return false;
    return s.t < (s.kind === 'blast' ? 90 : 240);
  });
};

export const drawShots = (c: Ctx, state: GameState) => {
  for (const s of outOf(state).shots) {
    if (s.kind === 'shield') {
      // (a round foam shield, star in the middle, rings; spinning flat so it squashes)
      const k = Math.abs(Math.cos(s.t * 0.4));
      c.save(); c.translate(s.x, s.y); c.scale(0.35 + 0.65 * k, 1);
      for (const [r, col] of [[12, '#1A0B06'], [11, '#DC2626'], [8, '#F8FAFC'], [5, '#2563EB']] as const) { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = '#F8FAFC'; c.fillRect(-2, -2, 4, 4);
      c.restore();
    } else if (s.kind === 'blast') {
      // (rings of sound: fat arcs going out the way it's going)
      const r = 10 + Math.min(14, s.t * 0.25), dir = Math.sign(s.vx) || 1;
      c.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        c.strokeStyle = k === 0 ? '#FDE68A' : k === 1 ? 'rgba(253, 230, 138, 0.6)' : 'rgba(253, 230, 138, 0.3)';
        c.beginPath(); c.arc(s.x - dir * k * 8, s.y, r - k * 3, dir > 0 ? -0.9 : Math.PI - 0.9, dir > 0 ? 0.9 : Math.PI + 0.9); c.stroke();
      }
    } else {
      // (the loop, and the rope back to the thrower's hand)
      if (s.from && s.from.health > 0) { c.strokeStyle = '#A16207'; c.lineWidth = 2; c.beginPath(); c.moveTo(s.from.pos.x + s.from.width / 2, s.from.pos.y + s.from.height - 62); c.quadraticCurveTo((s.x + s.from.pos.x) / 2, s.y - 30, s.x, s.y); c.stroke(); }
      c.strokeStyle = '#1A0B06'; c.lineWidth = 4; c.beginPath(); c.ellipse(s.x, s.y, 13, 7, s.t * 0.3, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#CA8A04'; c.lineWidth = 2; c.beginPath(); c.ellipse(s.x, s.y, 13, 7, s.t * 0.3, 0, Math.PI * 2); c.stroke();
    }
  }
};
