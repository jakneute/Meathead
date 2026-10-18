// What flies on the train: the porters' suitcases (lobbed; they burst open), the cook's cleavers (flat and spinning),
// the fireman's coal (lobbed; landing, a lump rolls on back along the roofs and the decks: jump it) and the stack's
// cinders (they come down where their glowing mark is, and burn a moment). Coal and cinders are the train's hazards:
// they hurt the cast too. Nothing thrown goes through a car's walls (cars.ts updateRooms: what's thrown in a car stays in
// it; what's thrown outside stays out).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { GY } from '../geometry';
import { box, INK, type Ctx } from '../kit';
import { trainOf, type Shot } from './state';
import { CINDERS_FROM } from './layout';
import { viewOf } from './view';

const DMG: Record<Shot['kind'], number> = { suitcase: 9, cleaver: 11, coal: 8, cinder: 6 };
const SRC: Record<Shot['kind'], string> = { suitcase: 'm2:fr_suitcase', cleaver: 'm2:fr_cleaver', coal: 'm2:fr_coal', cinder: 'm2:fr_cinder' };
const R: Record<Shot['kind'], number> = { suitcase: 11, cleaver: 9, coal: 8, cinder: 6 };
const GRAV = 0.3;

/** The surface under x, from y down (null: nothing). */
const surfaceAt = (state: GameState, x: number, y: number) => floorTopAt(state.blocks, x, y, 0);

/** Thrown from its hand: a suitcase or coal lobbed to land at (tx, ty) in `t` frames; a cleaver flat at him. */
export const throwShot = (state: GameState, e: Enemy, kind: 'suitcase' | 'cleaver' | 'coal', tx: number, ty: number, t = 40) => {
  const tr = trainOf(state), dir = e.facing ?? 1;
  const hx = e.pos.x + e.width / 2 + dir * 14, hy = e.pos.y + (kind === 'coal' ? 20 : 14);
  if (kind === 'cleaver') { tr.shots.push({ kind, x: hx, y: e.pos.y + 30, vx: dir * 6.5, vy: 0, t: 0, from: e }); playSound('whoosh', 0.6, 10); return; }
  tr.shots.push({ kind, x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * GRAV * t * t) / t, t: 0, from: e });
  playSound('whoosh', 0.5, kind === 'coal' ? -8 : -2);
};

/** Each frame: what's flying, the cinders coming down over the front cars. */
export const updateShots = (ctx: FrameContext, live: boolean) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  // (the stack's cinders, over the last cars before the engine: a mark on what they'll land on, first)
  const pcx = p.pos.x + p.width / 2;
  if (live && pcx > CINDERS_FROM && p.health > 0 && !p.inCutscene && ++tr.cinderT > 30) {
    tr.cinderT = 0;
    const x = pcx - 200 + Math.random() * 560, y = viewOf(state).y - 20;
    tr.shots.push({ kind: 'cinder', x, y, vx: -0.5, vy: 2.6, t: 0, mark: surfaceAt(state, x - 0.5 * 90, y) ?? GY });
  }
  for (const s of tr.shots) {
    s.t++;
    if (s.dead !== undefined) { s.dead++; continue; }
    if (s.kind === 'cleaver') { s.x += s.vx; }
    else if (s.kind === 'cinder') { s.x += s.vx; s.y += s.vy; }
    else if (s.rolling) {
      // (a lump of coal rolling back along whatever it's on; over an edge, it drops)
      s.vy += GRAV; s.x += s.vx; s.y += s.vy;
      const top = surfaceAt(state, s.x, s.y - 8);
      // (into the side of the next car: it breaks up)
      const hi = floorTopAt(state.blocks, s.x, s.y, 60);
      if (hi !== null && hi < s.y - 14 && s.vy >= 0) { s.dead = 0; playSound('crack', 0.4, 8); continue; }
      if (top !== null && s.y >= top) { s.y = top; s.vy = s.vy > 3 ? -s.vy * 0.4 : 0; }
    } else {
      s.vy += GRAV; s.x += s.vx; s.y += s.vy;
      const top = s.vy > 0 ? surfaceAt(state, s.x, s.y - s.vy - 2) : null;
      if (top !== null && s.y >= top) {
        s.y = top;
        if (s.kind === 'suitcase') {
          // (bursts open: shirts, socks, a bra, somebody's underwear)
          s.dead = 0; playSound('thud', 0.7, 2);
          const cols = ['#F8FAFC', '#FDA4AF', '#93C5FD', '#FDE68A', '#86EFAC'];
          for (let n = 0; n < 10; n++) state.particles.push({ pos: { x: s.x, y: s.y - 6 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 50, color: cols[n % cols.length], size: 4 });
        } else { s.rolling = true; s.vx = -2.6; s.vy = 0; playSound('thud', 0.5, -8); }
      }
    }
    // (the cinder: down on its mark, burning a moment)
    if (s.kind === 'cinder' && s.y >= (s.mark ?? GY)) { s.y = s.mark ?? GY; s.dead = 0; }
    // (him)
    const r = R[s.kind];
    if (p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && p.pos.x < s.x + r && p.pos.x + p.width > s.x - r && p.pos.y < s.y + r && p.pos.y + p.height > s.y - r) {
      hurtPlayer(ctx, DMG[s.kind], SRC[s.kind], { x: Math.sign(s.vx || -1) * 5, y: -4 });
      if (s.kind === 'cleaver' || s.kind === 'suitcase') s.dead = 0;
      if (s.kind === 'cinder') s.dead = 20;
      playSound(s.kind === 'cleaver' ? 'crunch' : 'punch', 0.7, 0);
    }
    // (coal and cinders are hazards: they hurt the cast as well; never the one who threw it)
    if ((s.kind === 'coal' || s.kind === 'cinder') && s.dead === undefined) {
      for (const e of hazardVictims(state)) if (e !== s.from && boxHits(e, s.x - r, s.y - r, r * 2, r * 2)) { hazardHit(ctx, e, s.kind === 'coal' ? 14 : 8, s.x, s.kind === 'coal' ? 'COALED!' : 'SCORCHED!', { knock: 5 }); s.dead = 0; break; }
    }
  }
  tr.shots = tr.shots.filter(s => (s.dead === undefined ? s.t < (s.kind === 'coal' ? 300 : 160) && s.y < GY + 40 : s.dead < (s.kind === 'cinder' ? 40 : 1)));
};

/** World: what's flying, the cinders' marks. */
export const drawShots = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), f = state.frame;
  for (const s of tr.shots) {
    if (s.kind === 'cinder') {
      // (its mark: a glowing spot where it'll come down, brighter as it nears)
      if (s.dead === undefined) {
        const k = Math.min(1, s.t / 60);
        c.globalAlpha = 0.3 + 0.5 * k; box(c, s.x - 0.5 * ((s.mark ?? GY) - s.y) / 2.6 - 6, (s.mark ?? GY) - 2, 12, 3, '#F97316'); c.globalAlpha = 1;
        box(c, s.x - 3, s.y - 3, 6, 6, f % 4 < 2 ? '#FDE047' : '#F97316'); box(c, s.x - 1, s.y - 9, 2, 6, 'rgba(249, 115, 22, 0.5)');
      } else if (s.dead < 40) { box(c, s.x - 5, s.y - 4, 10, 4, s.dead % 6 < 3 ? '#F97316' : '#DC2626'); if (s.dead % 5 === 0) box(c, s.x - 1, s.y - 10 - (s.dead % 10), 2, 2, '#A8A29E'); }
      continue;
    }
    if (s.dead !== undefined) continue;
    c.save(); c.translate(Math.round(s.x), Math.round(s.y));
    if (s.kind === 'suitcase') {
      // (a leather suitcase tumbling: its straps, brass corners, the handle, a sticker)
      c.rotate(s.t * 0.2);
      box(c, -12, -9, 24, 18, INK); box(c, -11, -8, 22, 16, '#8A5A30'); box(c, -11, -8, 22, 3, '#B07A48'); box(c, -11, -8, 2, 16, '#A06A3C'); box(c, 8, -8, 3, 16, '#5A3A1E');
      box(c, -5, -12, 10, 4, INK); box(c, -4, -11, 8, 2, '#5A3A1E');
      box(c, -6, -8, 2, 16, '#4A2A12'); box(c, 4, -8, 2, 16, '#4A2A12'); box(c, -11, -1, 22, 1, '#D6A84E');
      for (const [cx, cy] of [[-11, -8], [9, -8], [-11, 6], [9, 6]]) box(c, cx, cy, 2, 2, '#E8C25A');
      box(c, -2, 2, 5, 4, '#E86A4A'); box(c, -2, 2, 5, 1, '#F8B8A0');
    } else if (s.kind === 'cleaver') {
      // (the cleaver spinning: the blade stepped, its bright edge, the hole, the riveted handle)
      c.rotate(s.t * 0.45 * Math.sign(s.vx));
      box(c, -10, -7, 15, 13, INK); box(c, -9, -6, 13, 11, '#A1A1AA'); box(c, -9, -6, 13, 3, '#E4E4E7'); box(c, -9, 3, 13, 2, '#F8FAFC'); box(c, -7, -4, 2, 2, INK);
      box(c, 3, -2, 10, 5, INK); box(c, 4, -1, 8, 3, '#6B4423'); box(c, 4, -1, 8, 1, '#9A6A3A'); box(c, 6, 0, 1, 1, '#E8C25A'); box(c, 10, 0, 1, 1, '#E8C25A');
    } else {
      // (a lump of coal, faceted, glinting, glowing in its cracks)
      c.rotate(s.t * (s.rolling ? -0.3 : 0.15));
      c.fillStyle = INK; c.beginPath(); c.moveTo(-8, -2); c.lineTo(-4, -8); c.lineTo(5, -7); c.lineTo(8, 0); c.lineTo(3, 7); c.lineTo(-6, 6); c.closePath(); c.fill();
      c.fillStyle = '#27272A'; c.beginPath(); c.moveTo(-6, -2); c.lineTo(-3, -6); c.lineTo(4, -5); c.lineTo(6, 0); c.lineTo(2, 5); c.lineTo(-5, 4); c.closePath(); c.fill();
      c.fillStyle = '#4A4A56'; c.beginPath(); c.moveTo(-6, -2); c.lineTo(-3, -6); c.lineTo(0, -5); c.lineTo(-2, -1); c.closePath(); c.fill();
      box(c, -3, -5, 1, 1, '#A8A8B8');
      box(c, -2, -1, 4, 1, f % 6 < 3 ? '#F97316' : '#DC2626'); box(c, 1, 1, 1, 3, '#F97316'); box(c, 2, 2, 1, 1, '#FDE047');
    }
    c.restore();
  }
};
