// What the townsfolk throw: the dancers' whiskey bottles (they shatter), the snake-oil man's tonic (it bursts into a
// cloud of fumes that hangs a while: anybody in it chokes, his own customers too), the blacksmith's horseshoes (red hot:
// they skid and stay hot a moment where they land, and burn whoever steps on them), the fellers' hatchets (spinning; they
// stick where they land) and the prospectors' dynamite (it lands, the fuse fizzes, and it blows: everybody near it).
// The guns' slugs are the engine's (the deputies, the sheriff).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import { box, INK, type Ctx } from '../kit';
import { townOf, type Throw } from './state';
import { explode } from './blast';

const DMG: Record<Throw['kind'], number> = { bottle: 8, tonic: 6, horseshoe: 10, hatchet: 11, dynamite: 0 };
const SRC: Record<Throw['kind'], string> = { bottle: 'm2:fr_bottle', tonic: 'm2:fr_tonic', horseshoe: 'm2:fr_horseshoe', hatchet: 'm2:fr_hatchet', dynamite: 'm2:fr_dynamite' };
const R: Record<Throw['kind'], number> = { bottle: 7, tonic: 7, horseshoe: 8, hatchet: 9, dynamite: 7 };
const GRAV = 0.32, FUSE = 70, CLOUD_LIFE = 200;

const surfaceAt = (state: GameState, x: number, y: number) => floorTopAt(state.blocks, x, y, 0);

/** Lobbed from its hand to land at (tx, ty) in `t` frames. */
export const lob = (state: GameState, e: Enemy, kind: Throw['kind'], tx: number, ty: number, t = 40) => {
  const dir = e.facing ?? 1;
  const hx = e.pos.x + e.width / 2 + dir * 12, hy = e.pos.y + 10;
  townOf(state).throws.push({ kind, x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * GRAV * t * t) / t, t: 0, from: e });
  playSound('whoosh', 0.5, kind === 'hatchet' ? 6 : kind === 'dynamite' ? -6 : 0);
};

export const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), p = state.player;
  for (const s of tw.throws) {
    s.t++;
    if (s.dead) continue;
    if (s.rest === undefined) {
      s.vy += GRAV; s.x += s.vx; s.y += s.vy;
      const top = s.vy > 0 ? surfaceAt(state, s.x, s.y - s.vy - 2) : null;
      // (into a wall: it drops there)
      const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && b.type !== 'pit' && s.x > b.x && s.x < b.x + b.w && s.y > b.y + 4 && s.y < b.y + b.h);
      if ((top !== null && s.y >= top) || wall) {
        if (top !== null && s.y >= top) s.y = top;
        if (wall) s.vx = 0;
        landed(ctx, s);
      }
    } else {
      s.rest++;
      if (s.kind === 'horseshoe') {
        // (skidding on, slowing; over an edge it drops)
        s.x += s.vx; s.vx *= 0.9;
        const top = surfaceAt(state, s.x, s.y - 6);
        if (top === null || top > s.y + 2) { s.vy += GRAV; s.y += s.vy; if (top !== null && s.y >= top) { s.y = top; s.vy = 0; } }
        if (s.rest > 110) s.dead = true;
      } else if (s.kind === 'hatchet') { if (s.rest > 50) s.dead = true; }
      else if (s.kind === 'dynamite') {
        if (s.rest % 3 === 0) state.particles.push({ pos: { x: s.x + 2, y: s.y - 12 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 10, color: Math.random() < 0.5 ? '#FDE047' : '#F97316', size: 2 });
        if (s.rest % 10 === 0) playSound('click', 0.3, 12);
        if (s.rest >= FUSE) { s.dead = true; explode(ctx, s.x, s.y - 6, 85, 22, 'm2:fr_dynamite', 'KABOOM!'); }
      }
    }
    // (him: in flight, or a hot horseshoe underfoot)
    const r = R[s.kind];
    const hot = s.kind === 'horseshoe' && s.rest !== undefined && s.rest < 90;
    if ((s.rest === undefined || hot) && s.kind !== 'dynamite' && p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && p.pos.x < s.x + r && p.pos.x + p.width > s.x - r && p.pos.y < s.y + r && p.pos.y + p.height > s.y - r) {
      hurtPlayer(ctx, s.rest === undefined ? DMG[s.kind] : 6, SRC[s.kind], { x: Math.sign(s.vx || 1) * 5, y: -4 });
      playSound(s.kind === 'bottle' ? 'glass' : 'punch', 0.7, 0);
      if (s.kind === 'bottle' || s.kind === 'tonic') landed(ctx, s);
      else if (s.kind === 'hatchet') s.dead = true;
    }
    // (a hot horseshoe on the ground burns the cast too; never the one who threw it)
    if (hot) for (const e of hazardVictims(state)) if (e !== s.from && boxHits(e, s.x - r, s.y - 6, r * 2, 6)) { hazardHit(ctx, e, 10, s.x, 'BRANDED!', { knock: 4 }); s.dead = true; break; }
  }
  tw.throws = tw.throws.filter(s => !s.dead && s.t < 600);
  // (the tonic's clouds: anybody in one chokes, now and then)
  tw.cloudCd = Math.max(0, tw.cloudCd - 1);
  for (const cl of tw.clouds) {
    cl.t++;
    const r = 46 * Math.min(1, cl.t / 20 + 0.4);
    const inIt = (x: number, y: number, w: number, h: number) => x + w > cl.x - r && x < cl.x + r && y + h > cl.y - r * 1.4 && y < cl.y + 4;
    if (tw.cloudCd === 0 && p.health > 0 && !p.inCutscene && inIt(p.pos.x, p.pos.y, p.width, p.height)) { tw.cloudCd = 30; p.invincibilityTimer = 0; hurtPlayer(ctx, 5, 'm2:fr_tonic'); playSound('hurt', 0.4, 4); }
    if (cl.t % 30 === 0) for (const e of hazardVictims(state)) if (e !== cl.from && e.kind !== 'm2:fr_snakeoil' && inIt(e.pos.x, e.pos.y, e.width, e.height)) hazardHit(ctx, e, 8, cl.x, 'CHOKED!', { knock: 2 });
  }
  tw.clouds = tw.clouds.filter(cl => cl.t < cl.life);
};

/** Down: a bottle shatters, tonic bursts into its cloud, a horseshoe skids, a hatchet sticks, dynamite fizzes. */
const landed = (ctx: FrameContext, s: Throw) => {
  const { state } = ctx, tw = townOf(state);
  if (s.kind === 'bottle' || s.kind === 'tonic') {
    s.dead = true;
    playSound('glass', 0.7, s.kind === 'tonic' ? -4 : 4);
    for (let n = 0; n < 8; n++) state.particles.push({ pos: { x: s.x, y: s.y - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 24, color: s.kind === 'tonic' ? (n % 2 ? '#86EFAC' : '#3E7A3A') : (n % 2 ? '#D97706' : '#FDE68A'), size: 2 + Math.random() * 2 });
    if (s.kind === 'tonic') tw.clouds.push({ x: s.x, y: s.y, t: 0, life: CLOUD_LIFE, from: s.from });
    return;
  }
  s.rest = 0; s.vy = 0;
  if (s.kind === 'horseshoe') { s.vx *= 0.6; playSound('clang', 0.6, 6); for (let n = 0; n < 5; n++) state.particles.push({ pos: { x: s.x, y: s.y - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 3 }, life: 16, color: '#F97316', size: 2 }); }
  else if (s.kind === 'hatchet') { s.vx = 0; playSound('thud', 0.6, 8); }
  else { s.vx = 0; playSound('thud', 0.5, -4); }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

export const drawThrows = (c: Ctx, state: GameState) => {
  const tw = townOf(state), f = state.frame;
  // (the clouds: lumpy, sickly green, see-through)
  for (const cl of tw.clouds) {
    const k = Math.min(1, cl.t / 20 + 0.4), fade = Math.min(1, (cl.life - cl.t) / 40);
    c.globalAlpha = 0.42 * fade;
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + cl.t * 0.02, rr = (18 + (i % 3) * 7) * k;
      c.fillStyle = i % 2 ? '#86EFAC' : '#4ADE80';
      c.beginPath(); c.arc(cl.x + Math.cos(a) * 26 * k, cl.y - 24 * k + Math.sin(a * 1.3) * 14 * k, rr, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  for (const s of tw.throws) {
    if (s.dead) continue;
    c.save(); c.translate(Math.round(s.x), Math.round(s.y));
    const spin = s.rest === undefined ? s.t * 0.3 * Math.sign(s.vx || 1) : 0;
    if (s.kind === 'bottle' || s.kind === 'tonic') {
      c.rotate(spin);
      const col = s.kind === 'tonic' ? '#3E7A3A' : '#8A5A20';
      box(c, -4, -7, 9, 12, INK); box(c, -3, -6, 7, 10, col); box(c, -1, -11, 3, 5, col); box(c, -2, -4, 5, 4, '#F5E6C0');
    } else if (s.kind === 'horseshoe') {
      const hot = s.rest === undefined || s.rest < 90;
      c.rotate(s.rest === undefined ? spin : 0);
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(0, -4, 6, Math.PI * 0.15, Math.PI * 0.85, true); c.stroke();
      c.strokeStyle = hot ? (f % 6 < 3 ? '#F97316' : '#FDBA74') : '#57534E'; c.lineWidth = 3; c.stroke();
    } else if (s.kind === 'hatchet') {
      c.rotate(s.rest === undefined ? s.t * 0.45 * Math.sign(s.vx || 1) : 0.6 * Math.sign(s.vx || 1));
      box(c, -8, -2, 14, 4, INK); box(c, -7, -1, 12, 2, '#9A6A3A');
      box(c, 3, -8, 8, 12, INK); box(c, 4, -7, 6, 10, '#A1A1AA'); box(c, 9, -7, 1, 10, '#E4E4E7');
    } else {
      // (a stick of dynamite, its fuse sparking)
      c.rotate(s.rest === undefined ? spin : 1.4);
      box(c, -4, -9, 8, 18, INK); box(c, -3, -8, 6, 16, '#DC2626'); box(c, -3, -8, 6, 2, '#F87171');
      box(c, -1, -14, 1, 6, '#E7E5E4');
      if (f % 4 < 2) { box(c, -3, -17, 5, 3, '#FDE047'); box(c, 1, -19, 2, 2, '#F97316'); }
    }
    c.restore();
  }
};
